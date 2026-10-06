using System.ComponentModel.DataAnnotations;

namespace AeroTrip.Api.DTOs;

public sealed class PassengerRequest
{
    [Required, StringLength(40, MinimumLength = 1)] public string FirstName { get; set; } = string.Empty;
    [Required, StringLength(40, MinimumLength = 1)] public string LastName { get; set; } = string.Empty;
    public Gender Gender { get; set; }
    [Range(2, 110, ErrorMessage = "Passenger age must be between 2 and 110.")] public int Age { get; set; }
}

public sealed class ExtrasRequest
{
    public bool ExtraBaggage { get; set; }
    public bool Meal { get; set; }
    public bool TravelInsurance { get; set; }
    public bool FlexibleDateChange { get; set; }
    public SeatPreference SeatPreference { get; set; }
}

public sealed class QuoteRequest
{
    [Required] public string ItineraryId { get; set; } = string.Empty;
    public CabinClass Cabin { get; set; }
    [Range(1, 9)] public int Passengers { get; set; } = 1;
    public ExtrasRequest Extras { get; set; } = new();
    public string? CouponCode { get; set; }
}

public sealed class CreateBookingRequest
{
    [Required] public string ItineraryId { get; set; } = string.Empty;
    public CabinClass Cabin { get; set; }
    [Required, MinLength(1, ErrorMessage = "Add at least one passenger."), MaxLength(9, ErrorMessage = "You can book up to 9 passengers at a time.")] public List<PassengerRequest> Passengers { get; set; } = new();
    [Required, EmailAddress] public string ContactEmail { get; set; } = string.Empty;
    [Required, RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Enter a 10-digit Indian mobile number.")] public string ContactPhone { get; set; } = string.Empty;
    public ExtrasRequest Extras { get; set; } = new();
    public string? CouponCode { get; set; }
}

public sealed record FareBreakdownDto(
    decimal FarePerAdult,
    decimal BaseFare,
    decimal Taxes,
    decimal ConvenienceFee,
    decimal BaggageFee,
    decimal MealFee,
    decimal InsuranceFee,
    decimal FlexFee,
    decimal ExtrasTotal,
    decimal Subtotal,
    decimal Discount,
    decimal Total);

public sealed record PriceQuoteDto(
    string ItineraryId,
    int Passengers,
    CabinClass Cabin,
    FareBreakdownDto Fare,
    string? AppliedCoupon,
    string? CouponMessage,
    bool CouponValid);

public sealed record PassengerDto(string FirstName, string LastName, Gender Gender, int Age, PassengerType Type);

public sealed record BookedSegmentDto(
    string FlightInstanceId,
    string FlightNumber,
    string AirlineCode,
    string AirlineName,
    string AirlineColor,
    string Origin,
    string OriginCity,
    string Destination,
    string DestinationCity,
    DateTime Departure,
    DateTime Arrival,
    int DurationMinutes,
    string Aircraft,
    IReadOnlyList<string> Seats);

public sealed record PaymentInfoDto(Guid Id, PaymentMethod Method, decimal Amount, PaymentStatus Status, string Reference, string MaskedInstrument, DateTime ProcessedAt);

public sealed record BookingDto(
    Guid Id,
    string Pnr,
    BookingStatus Status,
    string ItineraryId,
    CabinClass Cabin,
    IReadOnlyList<BookedSegmentDto> Segments,
    IReadOnlyList<PassengerDto> Passengers,
    string ContactEmail,
    string ContactPhone,
    ExtrasRequest Extras,
    FareBreakdownDto Fare,
    string? CouponCode,
    DateTime CreatedAt,
    DateTime HoldExpiresAt,
    DateTime? PaidAt,
    DateTime? CancelledAt,
    decimal RefundAmount,
    PaymentInfoDto? Payment,
    bool IsUpcoming,
    bool CanCancel,
    string TravellerName,
    int HoldSecondsLeft);

public sealed record BookingSummaryDto(
    Guid Id,
    string Pnr,
    BookingStatus Status,
    string UserName,
    string UserEmail,
    string Origin,
    string OriginCity,
    string Destination,
    string DestinationCity,
    DateTime Departure,
    string AirlineName,
    string AirlineColor,
    string FlightNumbers,
    int Stops,
    CabinClass Cabin,
    int PassengerCount,
    decimal Total,
    decimal Discount,
    decimal RefundAmount,
    DateTime CreatedAt);

public sealed record CancellationQuoteDto(Guid BookingId, decimal TotalPaid, decimal RefundAmount, decimal CancellationCharges, string Policy);
