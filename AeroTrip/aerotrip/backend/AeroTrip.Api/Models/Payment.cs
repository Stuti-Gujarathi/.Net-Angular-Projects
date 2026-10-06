namespace AeroTrip.Api.Models;

public class Payment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BookingId { get; set; }
    public PaymentMethod Method { get; set; }
    public decimal Amount { get; set; }
    public PaymentStatus Status { get; set; }
    public string Reference { get; set; } = string.Empty;
    public string MaskedInstrument { get; set; } = string.Empty;
    public string? FailureReason { get; set; }
    public DateTime ProcessedAt { get; set; }
}
