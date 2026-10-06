namespace AeroTrip.Api.Services;

public interface IFlightService
{
    FlightSearchResponse Search(FlightSearchRequest request);
    ItineraryDto GetItinerary(string itineraryId, CabinClass cabin, int passengers);
    IReadOnlyList<FareCalendarDayDto> GetFareCalendar(string from, string to, DateOnly start, int days, CabinClass cabin);
    IReadOnlyList<PopularRouteDto> GetPopularRoutes();

    /// <summary>Turns "SF214-20261012_AB405-20261012" back into validated, connected flight instances.</summary>
    IReadOnlyList<FlightInstance> ResolveItinerary(string itineraryId);
}

public sealed class FlightService(IFlightRepository flights, ICatalogRepository catalog, IPricingService pricing) : IFlightService
{
    private const int MinConnectionMinutes = 75;
    private const int MaxConnectionMinutes = 600;
    private const int BookingCutoffHours = 2;
    private const int MaxConnectingResults = 40;

    public FlightSearchResponse Search(FlightSearchRequest request)
    {
        var from = request.From.Trim().ToUpperInvariant();
        var to = request.To.Trim().ToUpperInvariant();
        var origin = catalog.GetAirport(from) ?? throw new NotFoundException($"We don't fly from '{from}' yet.");
        var destination = catalog.GetAirport(to) ?? throw new NotFoundException($"We don't fly to '{to}' yet.");
        if (from == to) throw new BadRequestException("Origin and destination must be different.");
        if (request.Date < Clock.IstToday) throw new BadRequestException("Pick today or a future date.");
        if (request.Date > Clock.IstToday.AddDays(330)) throw new BadRequestException("Bookings open 330 days before departure.");

        var results = FindItineraries(from, to, request.Date, request.Cabin, request.Passengers);
        var lowest = results.Count == 0 ? (decimal?)null : results.Min(r => r.FarePerAdult);

        return new FlightSearchResponse(from, origin.City, to, destination.City, request.Date, request.Passengers, request.Cabin,
            results.Count, lowest, results);
    }

    public ItineraryDto GetItinerary(string itineraryId, CabinClass cabin, int passengers)
    {
        var legs = ResolveItinerary(itineraryId);
        if (legs[0].DepartureLocal < Clock.IstNow.AddHours(BookingCutoffHours))
            throw new BadRequestException("Bookings for this flight have closed.");
        if (!legs.All(l => l.Schedule.OffersCabin(cabin)))
            throw new BadRequestException("This cabin isn't available on every flight in this itinerary.");

        var dto = ToItinerary(legs, cabin, Math.Clamp(passengers, 1, 9));
        return dto with { Tags = Tags(dto, [dto]) };
    }

    public IReadOnlyList<FareCalendarDayDto> GetFareCalendar(string from, string to, DateOnly start, int days, CabinClass cabin)
    {
        from = from.Trim().ToUpperInvariant();
        to = to.Trim().ToUpperInvariant();
        days = Math.Clamp(days, 1, 14);

        var fares = new List<(DateOnly Date, decimal? Fare)>();
        for (var i = 0; i < days; i++)
        {
            var date = start.AddDays(i);
            if (date < Clock.IstToday) { fares.Add((date, null)); continue; }
            var results = FindItineraries(from, to, date, cabin, 1);
            fares.Add((date, results.Count == 0 ? null : results.Min(r => r.FarePerAdult)));
        }

        var cheapest = fares.Where(f => f.Fare.HasValue).Select(f => f.Fare!.Value).DefaultIfEmpty().Min();
        return fares.Select(f => new FareCalendarDayDto(f.Date, f.Fare, f.Fare.HasValue && f.Fare.Value == cheapest)).ToList();
    }

    public IReadOnlyList<PopularRouteDto> GetPopularRoutes()
    {
        (string From, string To)[] routes = [("DEL", "BOM"), ("BOM", "GOI"), ("BLR", "DEL"), ("DEL", "DXB"), ("BLR", "SIN"), ("BOM", "LHR"), ("HYD", "BLR"), ("CCU", "DEL")];
        var today = Clock.IstToday;
        var list = new List<PopularRouteDto>();

        foreach (var (from, to) in routes)
        {
            decimal? best = null;
            var bestDate = today;
            var duration = 0;
            for (var d = 1; d <= 14; d++)
            {
                var date = today.AddDays(d);
                foreach (var instance in flights.GetInstancesOn(date, from, to))
                {
                    if (flights.GetSeatsAvailable(instance, CabinClass.Economy) == 0) continue;
                    var fare = pricing.Calculate([instance], CabinClass.Economy, 1, new BookingExtras()).Total;
                    if (best is null || fare < best)
                    {
                        best = fare;
                        bestDate = date;
                        duration = instance.Schedule.DurationMinutes;
                    }
                }
            }

            var fromAirport = catalog.GetAirport(from)!;
            var toAirport = catalog.GetAirport(to)!;
            if (best.HasValue)
                list.Add(new PopularRouteDto(from, fromAirport.City, to, toAirport.City, best.Value, bestDate, duration,
                    fromAirport.IsInternational || toAirport.IsInternational));
        }
        return list;
    }

    public IReadOnlyList<FlightInstance> ResolveItinerary(string itineraryId)
    {
        var ids = (itineraryId ?? string.Empty).Split('_', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (ids.Length is 0 or > 2) throw new NotFoundException("That flight couldn't be found. Please search again.");

        var legs = new List<FlightInstance>();
        foreach (var id in ids)
        {
            var instance = flights.GetInstance(id);
            if (instance is null || !instance.Schedule.IsActive)
                throw new NotFoundException("That flight is no longer available. Please search again.");
            legs.Add(instance);
        }

        for (var i = 1; i < legs.Count; i++)
        {
            var layover = (legs[i].DepartureUtc - legs[i - 1].ArrivalUtc).TotalMinutes;
            if (legs[i].Schedule.OriginCode != legs[i - 1].Schedule.DestinationCode || layover < MinConnectionMinutes - 30)
                throw new BadRequestException("These flights don't connect.");
        }
        return legs;
    }

    private List<ItineraryDto> FindItineraries(string from, string to, DateOnly date, CabinClass cabin, int passengers)
    {
        var cutoff = Clock.IstNow.AddHours(BookingCutoffHours);
        var candidates = new List<IReadOnlyList<FlightInstance>>();

        foreach (var direct in flights.GetInstancesOn(date, from, to))
            if (direct.DepartureLocal >= cutoff) candidates.Add([direct]);

        var secondLegsByHub = new Dictionary<string, List<FlightInstance>>();
        var connecting = new List<IReadOnlyList<FlightInstance>>();
        foreach (var first in flights.GetInstancesOn(date, from))
        {
            var hub = first.Schedule.DestinationCode;
            if (hub == to || first.DepartureLocal < cutoff) continue;

            if (!secondLegsByHub.TryGetValue(hub, out var seconds))
            {
                seconds = flights.GetInstancesOn(date, hub, to).Concat(flights.GetInstancesOn(date.AddDays(1), hub, to)).ToList();
                secondLegsByHub[hub] = seconds;
            }

            foreach (var second in seconds)
            {
                var layover = (second.DepartureUtc - first.ArrivalUtc).TotalMinutes;
                if (layover is >= MinConnectionMinutes and <= MaxConnectionMinutes)
                    connecting.Add([first, second]);
            }
        }

        candidates.AddRange(connecting
            .OrderBy(c => (c[^1].ArrivalUtc - c[0].DepartureUtc).TotalMinutes)
            .Take(MaxConnectingResults));

        var results = candidates
            .Where(legs => legs.All(l => l.Schedule.OffersCabin(cabin)))
            .Select(legs => ToItinerary(legs, cabin, passengers))
            .Where(r => r.SeatsLeft >= passengers)
            .OrderBy(r => r.Stops).ThenBy(r => r.FarePerAdult)
            .ToList();

        return results.Select(r => r with { Tags = Tags(r, results) }).ToList();
    }

    private ItineraryDto ToItinerary(IReadOnlyList<FlightInstance> legs, CabinClass cabin, int passengers)
    {
        var segments = legs.Select(l => l.ToSegmentDto(catalog)).ToList();
        var layovers = new List<LayoverDto>();
        for (var i = 1; i < legs.Count; i++)
        {
            var hub = catalog.GetAirport(legs[i].Schedule.OriginCode);
            layovers.Add(new LayoverDto(legs[i].Schedule.OriginCode, hub?.City ?? "", (int)(legs[i].DepartureUtc - legs[i - 1].ArrivalUtc).TotalMinutes));
        }

        var perAdult = pricing.Calculate(legs, cabin, 1, new BookingExtras()).Total;
        var total = pricing.Calculate(legs, cabin, passengers, new BookingExtras()).Total;
        var refundable = legs.All(l => catalog.GetAirline(l.Schedule.AirlineCode)?.IsFullService == true);

        return new ItineraryDto(
            string.Join('_', legs.Select(l => l.Id)),
            segments,
            layovers,
            legs.Count - 1,
            (int)(legs[^1].ArrivalUtc - legs[0].DepartureUtc).TotalMinutes,
            legs[0].DepartureLocal,
            legs[^1].ArrivalLocal,
            cabin,
            perAdult,
            total,
            legs.Min(l => flights.GetSeatsAvailable(l, cabin)),
            refundable,
            []);
    }

    private static List<string> Tags(ItineraryDto item, IReadOnlyList<ItineraryDto> all)
    {
        var tags = new List<string>();
        if (all.Count > 1)
        {
            if (item.FarePerAdult == all.Min(r => r.FarePerAdult)) tags.Add("Cheapest");
            if (item.TotalDurationMinutes == all.Min(r => r.TotalDurationMinutes)) tags.Add("Fastest");

            // "Best": lowest blend of normalised price and duration, the way meta-search sites rank.
            var minFare = all.Min(r => r.FarePerAdult);
            var minDur = all.Min(r => r.TotalDurationMinutes);
            double Score(ItineraryDto r) => (double)(r.FarePerAdult / minFare) * 0.6 + r.TotalDurationMinutes / (double)minDur * 0.4;
            if (Math.Abs(Score(item) - all.Min(Score)) < 0.0001) tags.Add("Best value");
        }
        if (item.Stops == 0) tags.Add("Non-stop");
        if (item.Refundable) tags.Add("Refundable");
        return tags;
    }
}
