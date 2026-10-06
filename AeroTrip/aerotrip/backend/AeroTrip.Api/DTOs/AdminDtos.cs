using System.ComponentModel.DataAnnotations;

namespace AeroTrip.Api.DTOs;

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount)
{
    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
}

public sealed record RevenuePointDto(DateOnly Date, decimal Revenue, int Bookings);

public sealed record RouteStatDto(string Origin, string Destination, string Label, int Bookings, decimal Revenue);

public sealed record AirlineShareDto(string Code, string Name, string Color, int Bookings, double SharePct);

public sealed record StatusCountDto(BookingStatus Status, int Count);

public sealed record AdminStatsDto(
    decimal NetRevenue,
    decimal RevenueLast7Days,
    double RevenueChangePct,
    int TotalBookings,
    int ConfirmedBookings,
    int CancelledBookings,
    int PendingBookings,
    int TotalPassengers,
    decimal AverageBookingValue,
    double LoadFactorPct,
    int ActiveFlights,
    int ActiveOffers,
    int TotalUsers,
    decimal DiscountsGiven,
    decimal RefundsIssued,
    IReadOnlyList<RevenuePointDto> RevenueByDay,
    IReadOnlyList<RouteStatDto> TopRoutes,
    IReadOnlyList<AirlineShareDto> AirlineShare,
    IReadOnlyList<StatusCountDto> StatusBreakdown,
    IReadOnlyList<BookingSummaryDto> RecentBookings);

public sealed record AdminUserDto(Guid Id, string FullName, string Email, string Phone, UserRole Role, bool IsActive, DateTime CreatedAt, DateTime? LastLoginAt, int Bookings, decimal TotalSpent);

public sealed record FlightScheduleDto(
    Guid Id,
    string FlightNumber,
    string AirlineCode,
    string AirlineName,
    string AirlineColor,
    string Origin,
    string OriginCity,
    string Destination,
    string DestinationCity,
    string DepartureTime,
    int DurationMinutes,
    string Aircraft,
    IReadOnlyList<int> OperatingDays,
    decimal EconomyFare,
    decimal? PremiumEconomyFare,
    decimal? BusinessFare,
    int EconomySeats,
    int PremiumEconomySeats,
    int BusinessSeats,
    int CheckInBaggageKg,
    bool MealIncluded,
    bool IsActive,
    bool IsInternational);

public sealed class UpsertFlightScheduleRequest : IValidatableObject
{
    [Required, RegularExpression(@"^[A-Z0-9]{2}\d{2,4}$", ErrorMessage = "Flight number looks like SF214.")] public string FlightNumber { get; set; } = string.Empty;
    [Required] public string AirlineCode { get; set; } = string.Empty;
    [Required, StringLength(3, MinimumLength = 3)] public string Origin { get; set; } = string.Empty;
    [Required, StringLength(3, MinimumLength = 3)] public string Destination { get; set; } = string.Empty;
    [Required, RegularExpression(@"^([01]\d|2[0-3]):[0-5]\d$", ErrorMessage = "Use 24-hour HH:mm.")] public string DepartureTime { get; set; } = "06:00";
    [Range(30, 1200)] public int DurationMinutes { get; set; }
    [Required] public string Aircraft { get; set; } = "Airbus A320neo";
    [MinLength(1, ErrorMessage = "Pick at least one operating day.")] public List<int> OperatingDays { get; set; } = [0, 1, 2, 3, 4, 5, 6];
    [Range(500, 500000)] public decimal EconomyFare { get; set; }
    public decimal? PremiumEconomyFare { get; set; }
    public decimal? BusinessFare { get; set; }
    [Range(1, 400)] public int EconomySeats { get; set; } = 150;
    [Range(0, 100)] public int PremiumEconomySeats { get; set; }
    [Range(0, 60)] public int BusinessSeats { get; set; }
    [Range(0, 50)] public int CheckInBaggageKg { get; set; } = 15;
    public bool MealIncluded { get; set; }
    public bool IsActive { get; set; } = true;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.Equals(Origin, Destination, StringComparison.OrdinalIgnoreCase))
            yield return new ValidationResult("Origin and destination must be different.", [nameof(Destination)]);
        if (OperatingDays.Any(d => d is < 0 or > 6))
            yield return new ValidationResult("Operating days must be 0 (Sunday) to 6 (Saturday).", [nameof(OperatingDays)]);
        if (PremiumEconomySeats > 0 && PremiumEconomyFare is null or <= 0)
            yield return new ValidationResult("Set a premium economy fare or remove its seats.", [nameof(PremiumEconomyFare)]);
        if (BusinessSeats > 0 && BusinessFare is null or <= 0)
            yield return new ValidationResult("Set a business fare or remove its seats.", [nameof(BusinessFare)]);
    }
}

public sealed class SetActiveRequest
{
    public bool IsActive { get; set; }
}
