namespace AeroTrip.Api.Services;

/// <summary>Entity → DTO projections. Kept in one place so API contracts are easy to audit.</summary>
public static class Mappers
{
    public static UserDto ToDto(this User user) => new(user.Id, user.FullName, user.Email, user.Phone, user.Role, user.CreatedAt);

    public static AirportDto ToDto(this Airport a) => new(a.Code, a.Name, a.City, a.Country, a.IsInternational);

    public static AirlineDto ToDto(this Airline a) => new(a.Code, a.Name, a.BrandColor, a.IsFullService);

    public static FareBreakdownDto ToDto(this FareBreakdown f) => new(
        f.FarePerAdult, f.BaseFare, f.Taxes, f.ConvenienceFee, f.BaggageFee, f.MealFee, f.InsuranceFee, f.FlexFee,
        f.ExtrasTotal, f.Subtotal, f.Discount, f.Total);

    public static ExtrasRequest ToDto(this BookingExtras e) => new()
    {
        ExtraBaggage = e.ExtraBaggage,
        Meal = e.Meal,
        TravelInsurance = e.TravelInsurance,
        FlexibleDateChange = e.FlexibleDateChange,
        SeatPreference = e.SeatPreference
    };

    public static BookingExtras ToEntity(this ExtrasRequest? e) => e is null
        ? new BookingExtras()
        : new BookingExtras
        {
            ExtraBaggage = e.ExtraBaggage,
            Meal = e.Meal,
            TravelInsurance = e.TravelInsurance,
            FlexibleDateChange = e.FlexibleDateChange,
            SeatPreference = e.SeatPreference
        };

    public static OfferDto ToDto(this Offer o) => new(
        o.Id, o.Code, o.Title, o.Description, o.DiscountType, o.Value, o.MaxDiscount, o.MinBookingAmount,
        o.ValidFrom, o.ValidTo, o.Cabin, o.AirlineCode, o.InternationalOnly, o.UsageLimit, o.UsedCount, o.IsActive, o.Theme);

    public static PaymentInfoDto ToDto(this Payment p) => new(p.Id, p.Method, p.Amount, p.Status, p.Reference, p.MaskedInstrument, p.ProcessedAt);

    public static SegmentDto ToSegmentDto(this FlightInstance i, ICatalogRepository catalog)
    {
        var airline = catalog.GetAirline(i.Schedule.AirlineCode);
        var origin = catalog.GetAirport(i.Schedule.OriginCode);
        var destination = catalog.GetAirport(i.Schedule.DestinationCode);
        return new SegmentDto(
            i.Id, i.Schedule.FlightNumber, i.Schedule.AirlineCode, airline?.Name ?? i.Schedule.AirlineCode, airline?.BrandColor ?? "#2648E8",
            i.Schedule.OriginCode, origin?.City ?? "", origin?.Name ?? "",
            i.Schedule.DestinationCode, destination?.City ?? "", destination?.Name ?? "",
            i.DepartureLocal, i.ArrivalLocal, i.Schedule.DurationMinutes, i.Schedule.Aircraft,
            i.Schedule.CheckInBaggageKg, i.Schedule.CabinBaggageKg, i.Schedule.MealIncluded);
    }

    public static BookingDto ToDto(this Booking b, ICatalogRepository catalog, User? traveller, Payment? payment, DateTime nowIst)
    {
        var segments = b.Segments.Select(s =>
        {
            var airline = catalog.GetAirline(s.AirlineCode);
            return new BookedSegmentDto(
                s.FlightInstanceId, s.FlightNumber, s.AirlineCode, airline?.Name ?? s.AirlineCode, airline?.BrandColor ?? "#2648E8",
                s.Origin, catalog.GetAirport(s.Origin)?.City ?? s.Origin,
                s.Destination, catalog.GetAirport(s.Destination)?.City ?? s.Destination,
                s.Departure, s.Arrival, s.DurationMinutes, s.Aircraft, s.Seats);
        }).ToList();

        var upcoming = b.FirstDeparture > nowIst && b.Status is BookingStatus.Confirmed or BookingStatus.PendingPayment;
        var canCancel = b.FirstDeparture > nowIst && b.Status is BookingStatus.Confirmed or BookingStatus.PendingPayment;

        return new BookingDto(
            b.Id, b.Pnr, b.Status, b.ItineraryId, b.Cabin, segments,
            b.Passengers.Select(p => new PassengerDto(p.FirstName, p.LastName, p.Gender, p.Age, p.Type)).ToList(),
            b.ContactEmail, b.ContactPhone, b.Extras.ToDto(), b.Fare.ToDto(), b.CouponCode,
            b.CreatedAt, b.HoldExpiresAt, b.PaidAt, b.CancelledAt, b.RefundAmount,
            payment?.ToDto(), upcoming, canCancel, traveller?.FullName ?? "",
            b.Status == BookingStatus.PendingPayment ? Math.Max(0, (int)(b.HoldExpiresAt - nowIst).TotalSeconds) : 0);
    }

    public static BookingSummaryDto ToSummary(this Booking b, ICatalogRepository catalog, User? user)
    {
        var first = b.Segments.FirstOrDefault();
        var airline = first is null ? null : catalog.GetAirline(first.AirlineCode);
        return new BookingSummaryDto(
            b.Id, b.Pnr, b.Status, user?.FullName ?? "Unknown", user?.Email ?? "",
            b.OriginCode, catalog.GetAirport(b.OriginCode)?.City ?? b.OriginCode,
            b.DestinationCode, catalog.GetAirport(b.DestinationCode)?.City ?? b.DestinationCode,
            b.FirstDeparture, airline?.Name ?? "", airline?.BrandColor ?? "#2648E8",
            string.Join(" + ", b.Segments.Select(s => s.FlightNumber)), Math.Max(0, b.Segments.Count - 1),
            b.Cabin, b.Passengers.Count, b.Fare.Total, b.Fare.Discount, b.RefundAmount, b.CreatedAt);
    }

    public static FlightScheduleDto ToDto(this FlightSchedule s, ICatalogRepository catalog)
    {
        var airline = catalog.GetAirline(s.AirlineCode);
        var origin = catalog.GetAirport(s.OriginCode);
        var destination = catalog.GetAirport(s.DestinationCode);
        return new FlightScheduleDto(
            s.Id, s.FlightNumber, s.AirlineCode, airline?.Name ?? s.AirlineCode, airline?.BrandColor ?? "#2648E8",
            s.OriginCode, origin?.City ?? "", s.DestinationCode, destination?.City ?? "",
            s.DepartureTime.ToString("HH:mm"), s.DurationMinutes, s.Aircraft,
            s.OperatingDays.Select(d => (int)d).OrderBy(d => d).ToList(),
            s.BaseFare.GetValueOrDefault(CabinClass.Economy),
            s.BaseFare.TryGetValue(CabinClass.PremiumEconomy, out var pe) ? pe : null,
            s.BaseFare.TryGetValue(CabinClass.Business, out var bz) ? bz : null,
            s.Capacity.GetValueOrDefault(CabinClass.Economy),
            s.Capacity.GetValueOrDefault(CabinClass.PremiumEconomy),
            s.Capacity.GetValueOrDefault(CabinClass.Business),
            s.CheckInBaggageKg, s.MealIncluded, s.IsActive,
            (origin?.IsInternational ?? false) || (destination?.IsInternational ?? false));
    }
}
