namespace AeroTrip.Api.Services;

public interface IFlightScheduleService
{
    IReadOnlyList<FlightScheduleDto> GetAll();
    FlightScheduleDto Create(UpsertFlightScheduleRequest request);
    FlightScheduleDto Update(Guid id, UpsertFlightScheduleRequest request);
    FlightScheduleDto SetActive(Guid id, bool isActive);
}

public sealed class FlightScheduleService(IFlightRepository flights, ICatalogRepository catalog) : IFlightScheduleService
{
    public IReadOnlyList<FlightScheduleDto> GetAll() =>
        flights.GetSchedules()
            .OrderBy(s => s.OriginCode).ThenBy(s => s.DestinationCode).ThenBy(s => s.DepartureTime)
            .Select(s => s.ToDto(catalog))
            .ToList();

    public FlightScheduleDto Create(UpsertFlightScheduleRequest request)
    {
        Validate(request, existingId: null);
        var schedule = new FlightSchedule();
        Apply(schedule, request);
        flights.AddSchedule(schedule);
        return schedule.ToDto(catalog);
    }

    public FlightScheduleDto Update(Guid id, UpsertFlightScheduleRequest request)
    {
        var schedule = flights.GetSchedule(id) ?? throw new NotFoundException("Flight not found.");
        Validate(request, id);
        Apply(schedule, request);
        flights.UpdateSchedule(schedule);
        return schedule.ToDto(catalog);
    }

    public FlightScheduleDto SetActive(Guid id, bool isActive)
    {
        var schedule = flights.GetSchedule(id) ?? throw new NotFoundException("Flight not found.");
        schedule.IsActive = isActive;
        flights.UpdateSchedule(schedule);
        return schedule.ToDto(catalog);
    }

    private void Validate(UpsertFlightScheduleRequest r, Guid? existingId)
    {
        if (catalog.GetAirline(r.AirlineCode) is null) throw new BadRequestException("Unknown airline.");
        if (catalog.GetAirport(r.Origin) is null) throw new BadRequestException($"Unknown airport {r.Origin}.");
        if (catalog.GetAirport(r.Destination) is null) throw new BadRequestException($"Unknown airport {r.Destination}.");
        if (!r.FlightNumber.StartsWith(r.AirlineCode, StringComparison.OrdinalIgnoreCase))
            throw new BadRequestException($"Flight numbers for this airline start with {r.AirlineCode.ToUpperInvariant()}.");

        var clash = flights.GetScheduleByFlightNumber(r.FlightNumber);
        if (clash is not null && clash.Id != existingId)
            throw new ConflictException($"Flight {r.FlightNumber.ToUpperInvariant()} already exists.");
    }

    private static void Apply(FlightSchedule s, UpsertFlightScheduleRequest r)
    {
        s.FlightNumber = r.FlightNumber.Trim().ToUpperInvariant();
        s.AirlineCode = r.AirlineCode.Trim().ToUpperInvariant();
        s.OriginCode = r.Origin.Trim().ToUpperInvariant();
        s.DestinationCode = r.Destination.Trim().ToUpperInvariant();
        s.DepartureTime = TimeOnly.ParseExact(r.DepartureTime, "HH:mm");
        s.DurationMinutes = r.DurationMinutes;
        s.Aircraft = r.Aircraft.Trim();
        s.OperatingDays = r.OperatingDays.Distinct().Select(d => (DayOfWeek)d).ToList();
        s.CheckInBaggageKg = r.CheckInBaggageKg;
        s.MealIncluded = r.MealIncluded;
        s.IsActive = r.IsActive;

        s.Capacity = new Dictionary<CabinClass, int> { [CabinClass.Economy] = r.EconomySeats };
        s.BaseFare = new Dictionary<CabinClass, decimal> { [CabinClass.Economy] = r.EconomyFare };
        if (r.PremiumEconomySeats > 0 && r.PremiumEconomyFare is > 0)
        {
            s.Capacity[CabinClass.PremiumEconomy] = r.PremiumEconomySeats;
            s.BaseFare[CabinClass.PremiumEconomy] = r.PremiumEconomyFare.Value;
        }
        if (r.BusinessSeats > 0 && r.BusinessFare is > 0)
        {
            s.Capacity[CabinClass.Business] = r.BusinessSeats;
            s.BaseFare[CabinClass.Business] = r.BusinessFare.Value;
        }
    }
}
