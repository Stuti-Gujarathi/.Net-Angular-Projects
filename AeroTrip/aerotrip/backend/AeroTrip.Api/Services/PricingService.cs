namespace AeroTrip.Api.Services;

public interface IPricingService
{
    /// <summary>Base fare for one adult across all legs, before taxes.</summary>
    decimal BaseFarePerAdult(IReadOnlyList<FlightInstance> legs, CabinClass cabin, DateTime? priceAt = null);

    FareBreakdown Calculate(IReadOnlyList<FlightInstance> legs, CabinClass cabin, int passengers, BookingExtras extras, DateTime? priceAt = null);
}

/// <summary>
/// Dynamic pricing modelled on how Indian carriers price: fares rise as departure approaches and
/// as the cabin fills, weekends cost a little more, and connections are discounted against the
/// sum of their legs. Taxes follow GST (5% economy / 12% business) plus airport fees per sector.
/// </summary>
public sealed class PricingService(IFlightRepository flights) : IPricingService
{
    public const decimal AirportFeePerSector = 450m;
    public const decimal ConvenienceFeePerPassenger = 199m;
    public const decimal ExtraBaggagePerPassenger = 1500m;
    public const decimal MealPerPassengerPerSector = 350m;
    public const decimal InsurancePerPassenger = 249m;
    public const decimal FlexiblePerPassenger = 699m;
    private const decimal ConnectionDiscount = 0.9m;

    public decimal BaseFarePerAdult(IReadOnlyList<FlightInstance> legs, CabinClass cabin, DateTime? priceAt = null)
    {
        var sum = legs.Sum(leg => SectorFare(leg, cabin, priceAt ?? Clock.IstNow));
        if (legs.Count > 1) sum *= ConnectionDiscount;
        return Money.RoundToTen(sum);
    }

    public FareBreakdown Calculate(IReadOnlyList<FlightInstance> legs, CabinClass cabin, int passengers, BookingExtras extras, DateTime? priceAt = null)
    {
        var perAdult = BaseFarePerAdult(legs, cabin, priceAt);
        var baseFare = perAdult * passengers;
        var gstRate = cabin == CabinClass.Business ? 0.12m : 0.05m;
        var sectorsWithoutMeal = legs.Count(l => !l.Schedule.MealIncluded);

        return new FareBreakdown
        {
            FarePerAdult = perAdult,
            BaseFare = baseFare,
            Taxes = Math.Round(baseFare * gstRate + AirportFeePerSector * legs.Count * passengers),
            ConvenienceFee = ConvenienceFeePerPassenger * passengers,
            BaggageFee = extras.ExtraBaggage ? ExtraBaggagePerPassenger * passengers : 0,
            MealFee = extras.Meal ? MealPerPassengerPerSector * passengers * sectorsWithoutMeal : 0,
            InsuranceFee = extras.TravelInsurance ? InsurancePerPassenger * passengers : 0,
            FlexFee = extras.FlexibleDateChange ? FlexiblePerPassenger * passengers : 0
        };
    }

    private decimal SectorFare(FlightInstance leg, CabinClass cabin, DateTime priceAt)
    {
        if (!leg.Schedule.BaseFare.TryGetValue(cabin, out var fare)) return 0;

        var daysOut = (leg.DepartureLocal - priceAt).TotalDays;
        var advance = daysOut switch
        {
            < 3 => 1.45m,
            < 7 => 1.25m,
            < 14 => 1.1m,
            < 30 => 1.0m,
            _ => 0.92m
        };

        var weekend = leg.DepartureLocal.DayOfWeek is DayOfWeek.Friday or DayOfWeek.Sunday ? 1.08m : 1m;

        var capacity = leg.Schedule.Capacity.GetValueOrDefault(cabin);
        var loadFactor = capacity == 0 ? 0 : 1 - flights.GetSeatsAvailable(leg, cabin) / (double)capacity;
        var demand = loadFactor switch
        {
            > 0.85 => 1.22m,
            > 0.7 => 1.1m,
            _ => 1m
        };

        // Early-morning and late-night departures are cheaper, like real red-eye pricing.
        var hour = leg.DepartureLocal.Hour;
        var timeOfDay = hour is < 7 or >= 22 ? 0.94m : 1m;

        return fare * advance * weekend * demand * timeOfDay;
    }
}
