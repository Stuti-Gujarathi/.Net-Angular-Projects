namespace AeroTrip.Api.Repositories;

public sealed class FlightRepository(InMemoryDataStore store) : IFlightRepository
{
    public IReadOnlyList<FlightSchedule> GetSchedules()
    {
        lock (store.Sync) return store.Schedules.ToList();
    }

    public FlightSchedule? GetSchedule(Guid id)
    {
        lock (store.Sync) return store.Schedules.FirstOrDefault(s => s.Id == id);
    }

    public FlightSchedule? GetScheduleByFlightNumber(string flightNumber)
    {
        lock (store.Sync) return store.Schedules.FirstOrDefault(s => string.Equals(s.FlightNumber, flightNumber, StringComparison.OrdinalIgnoreCase));
    }

    public void AddSchedule(FlightSchedule schedule)
    {
        lock (store.Sync) store.Schedules.Add(schedule);
    }

    public void UpdateSchedule(FlightSchedule schedule)
    {
        lock (store.Sync) { }
    }

    public IEnumerable<FlightInstance> GetInstancesOn(DateOnly date, string? origin = null, string? destination = null, bool includeInactive = false)
    {
        List<FlightSchedule> schedules;
        lock (store.Sync)
        {
            schedules = store.Schedules.Where(s =>
                    (includeInactive || s.IsActive) &&
                    s.OperatingDays.Contains(date.DayOfWeek) &&
                    (origin is null || s.OriginCode == origin) &&
                    (destination is null || s.DestinationCode == destination))
                .ToList();
        }

        foreach (var schedule in schedules)
        {
            var instance = Build(schedule, date);
            if (instance is not null) yield return instance;
        }
    }

    public FlightInstance? GetInstance(string instanceId)
    {
        if (!FlightInstance.TryParseId(instanceId, out var flightNumber, out var date)) return null;
        var schedule = GetScheduleByFlightNumber(flightNumber);
        if (schedule is null || !schedule.OperatingDays.Contains(date.DayOfWeek)) return null;
        return Build(schedule, date);
    }

    public int GetSeatsSold(string instanceId, CabinClass cabin)
    {
        lock (store.Sync)
        {
            return store.SeatsSold.TryGetValue(instanceId, out var byCabin) && byCabin.TryGetValue(cabin, out var sold) ? sold : 0;
        }
    }

    public int GetSeatsAvailable(FlightInstance instance, CabinClass cabin)
    {
        if (!instance.Schedule.OffersCabin(cabin)) return 0;
        var capacity = instance.Schedule.Capacity[cabin];
        var occupied = BaselineOccupancy(instance.Id, cabin, capacity) + GetSeatsSold(instance.Id, cabin);
        return Math.Max(0, capacity - occupied);
    }

    public bool TryReserveSeats(IReadOnlyList<string> instanceIds, CabinClass cabin, int count)
    {
        var instances = instanceIds.Select(GetInstance).ToList();
        if (instances.Any(i => i is null)) return false;

        lock (store.Sync)
        {
            foreach (var instance in instances)
            {
                var capacity = instance!.Schedule.Capacity.GetValueOrDefault(cabin);
                var occupied = BaselineOccupancy(instance.Id, cabin, capacity) + SoldUnlocked(instance.Id, cabin);
                if (capacity - occupied < count) return false;
            }

            foreach (var instance in instances)
            {
                var byCabin = GetOrCreate(instance!.Id);
                byCabin[cabin] = byCabin.GetValueOrDefault(cabin) + count;
            }
            return true;
        }
    }

    public void ReleaseSeats(IReadOnlyList<string> instanceIds, CabinClass cabin, int count)
    {
        lock (store.Sync)
        {
            foreach (var id in instanceIds)
            {
                var byCabin = GetOrCreate(id);
                byCabin[cabin] = Math.Max(0, byCabin.GetValueOrDefault(cabin) - count);
            }
        }
    }

    private int SoldUnlocked(string instanceId, CabinClass cabin) =>
        store.SeatsSold.TryGetValue(instanceId, out var byCabin) ? byCabin.GetValueOrDefault(cabin) : 0;

    private Dictionary<CabinClass, int> GetOrCreate(string instanceId)
    {
        if (!store.SeatsSold.TryGetValue(instanceId, out var byCabin))
        {
            byCabin = new Dictionary<CabinClass, int>();
            store.SeatsSold[instanceId] = byCabin;
        }
        return byCabin;
    }

    private FlightInstance? Build(FlightSchedule schedule, DateOnly date)
    {
        Airport? origin, destination;
        lock (store.Sync)
        {
            origin = store.Airports.FirstOrDefault(a => a.Code == schedule.OriginCode);
            destination = store.Airports.FirstOrDefault(a => a.Code == schedule.DestinationCode);
        }
        if (origin is null || destination is null) return null;

        var departureLocal = date.ToDateTime(schedule.DepartureTime);
        var departureUtc = DateTime.SpecifyKind(departureLocal.AddMinutes(-origin.UtcOffsetMinutes), DateTimeKind.Utc);
        var arrivalUtc = departureUtc.AddMinutes(schedule.DurationMinutes);
        var arrivalLocal = DateTime.SpecifyKind(arrivalUtc.AddMinutes(destination.UtcOffsetMinutes), DateTimeKind.Unspecified);
        return new FlightInstance(schedule, date, departureLocal, arrivalLocal, departureUtc, arrivalUtc);
    }

    /// <summary>
    /// Simulated demand from other sales channels, so availability looks like a real airline's:
    /// deterministic per flight (stable across restarts) and heavier on the main cabin.
    /// </summary>
    private static int BaselineOccupancy(string instanceId, CabinClass cabin, int capacity)
    {
        if (capacity <= 0) return 0;
        var hash = StableHash($"{instanceId}:{cabin}");
        var (min, spread) = cabin switch
        {
            CabinClass.Economy => (0.42, 0.53),
            CabinClass.PremiumEconomy => (0.25, 0.55),
            _ => (0.2, 0.6)
        };
        var ratio = min + (hash % 1000) / 1000.0 * spread;
        return Math.Min(capacity - 1, (int)Math.Floor(capacity * ratio));
    }

    private static uint StableHash(string value)
    {
        // FNV-1a: string.GetHashCode() is randomised per process, this isn't.
        uint hash = 2166136261;
        foreach (var c in value)
        {
            hash ^= c;
            hash *= 16777619;
        }
        return hash;
    }
}
