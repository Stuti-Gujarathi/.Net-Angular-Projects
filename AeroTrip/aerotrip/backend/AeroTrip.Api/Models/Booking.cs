namespace AeroTrip.Api.Models;

public class Booking
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Pnr { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string ItineraryId { get; set; } = string.Empty;
    public CabinClass Cabin { get; set; }
    public List<BookedSegment> Segments { get; set; } = new();
    public List<Passenger> Passengers { get; set; } = new();
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public BookingExtras Extras { get; set; } = new();
    public FareBreakdown Fare { get; set; } = new();
    public string? CouponCode { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.PendingPayment;
    public DateTime CreatedAt { get; set; }
    public DateTime HoldExpiresAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancelledBy { get; set; }
    public decimal RefundAmount { get; set; }
    public Guid? PaymentId { get; set; }

    public DateTime FirstDeparture => Segments.Count == 0 ? DateTime.MinValue : Segments[0].Departure;
    public string OriginCode => Segments.Count == 0 ? string.Empty : Segments[0].Origin;
    public string DestinationCode => Segments.Count == 0 ? string.Empty : Segments[^1].Destination;
}

public class BookedSegment
{
    public string FlightInstanceId { get; set; } = string.Empty;
    public string FlightNumber { get; set; } = string.Empty;
    public string AirlineCode { get; set; } = string.Empty;
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime Departure { get; set; }
    public DateTime Arrival { get; set; }
    public int DurationMinutes { get; set; }
    public string Aircraft { get; set; } = string.Empty;

    /// <summary>Seat per passenger, aligned by index with <see cref="Booking.Passengers"/>. Assigned on payment.</summary>
    public List<string> Seats { get; set; } = new();
}

public class Passenger
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public Gender Gender { get; set; }
    public int Age { get; set; }
    public PassengerType Type => Age < 12 ? PassengerType.Child : PassengerType.Adult;
}

public class BookingExtras
{
    public bool ExtraBaggage { get; set; }
    public bool Meal { get; set; }
    public bool TravelInsurance { get; set; }
    public bool FlexibleDateChange { get; set; }
    public SeatPreference SeatPreference { get; set; } = SeatPreference.NoPreference;
}

public class FareBreakdown
{
    public decimal FarePerAdult { get; set; }
    public decimal BaseFare { get; set; }
    public decimal Taxes { get; set; }
    public decimal ConvenienceFee { get; set; }
    public decimal BaggageFee { get; set; }
    public decimal MealFee { get; set; }
    public decimal InsuranceFee { get; set; }
    public decimal FlexFee { get; set; }
    public decimal Discount { get; set; }

    public decimal ExtrasTotal => BaggageFee + MealFee + InsuranceFee + FlexFee;
    public decimal Subtotal => BaseFare + Taxes + ConvenienceFee + ExtrasTotal;
    public decimal Total => Math.Max(0, Subtotal - Discount);
}
