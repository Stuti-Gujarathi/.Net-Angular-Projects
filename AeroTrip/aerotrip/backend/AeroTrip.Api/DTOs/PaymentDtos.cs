using System.ComponentModel.DataAnnotations;

namespace AeroTrip.Api.DTOs;

public sealed class CardDetails
{
    [Required] public string Number { get; set; } = string.Empty;
    [Required] public string NameOnCard { get; set; } = string.Empty;
    [Required, RegularExpression(@"^(0[1-9]|1[0-2])\/\d{2}$", ErrorMessage = "Use MM/YY for expiry.")] public string Expiry { get; set; } = string.Empty;
    [Required, RegularExpression(@"^\d{3,4}$", ErrorMessage = "CVV is 3 or 4 digits.")] public string Cvv { get; set; } = string.Empty;
}

public sealed class PaymentRequest
{
    [Required] public Guid BookingId { get; set; }
    public PaymentMethod Method { get; set; }
    public CardDetails? Card { get; set; }
    public string? UpiId { get; set; }
    public string? BankCode { get; set; }
}

public sealed record PaymentResultDto(bool Success, string Message, string? Reference, BookingDto Booking);
