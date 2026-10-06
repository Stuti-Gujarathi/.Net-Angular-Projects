using System.Text.RegularExpressions;

namespace AeroTrip.Api.Services;

public interface IPaymentService
{
    PaymentResultDto Pay(Guid userId, PaymentRequest request);
}

/// <summary>
/// Simulated payment gateway with realistic validation (Luhn, expiry, UPI handle format).
/// Test instruments are listed in the README and on the payment screen.
/// </summary>
public sealed partial class PaymentService(
    IBookingRepository bookings,
    IPaymentRepository payments,
    IBookingService bookingService,
    IOfferService offers) : IPaymentService
{
    public const string DeclinedTestCard = "4000000000000002";
    private static readonly string[] SupportedBanks = ["HDFC", "ICICI", "SBI", "AXIS", "KOTAK"];

    [GeneratedRegex(@"^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$")]
    private static partial Regex UpiPattern();

    public PaymentResultDto Pay(Guid userId, PaymentRequest request)
    {
        var booking = bookings.GetById(request.BookingId);
        if (booking is null || booking.UserId != userId) throw new NotFoundException("Booking not found.");

        switch (booking.Status)
        {
            case BookingStatus.Confirmed:
                throw new ConflictException("This booking is already paid.");
            case BookingStatus.Cancelled:
                throw new BadRequestException("This booking was cancelled.");
        }

        if (booking.Status == BookingStatus.Expired || booking.HoldExpiresAt <= Clock.IstNow)
        {
            bookingService.ExpireStaleHolds();
            throw new BadRequestException("Your seat hold expired. Please search again to get fresh seats and fares.");
        }

        var (instrument, declineReason) = request.Method switch
        {
            PaymentMethod.Card => ValidateCard(request.Card),
            PaymentMethod.Upi => ValidateUpi(request.UpiId),
            PaymentMethod.NetBanking => ValidateBank(request.BankCode),
            _ => throw new BadRequestException("Choose a payment method.")
        };

        var payment = new Payment
        {
            BookingId = booking.Id,
            Method = request.Method,
            Amount = booking.Fare.Total,
            MaskedInstrument = instrument,
            ProcessedAt = Clock.IstNow,
            Reference = $"AT{Random.Shared.Next(10_000_000, 99_999_999)}",
            Status = declineReason is null ? PaymentStatus.Succeeded : PaymentStatus.Failed,
            FailureReason = declineReason
        };
        payments.Add(payment);

        if (declineReason is not null)
            return new PaymentResultDto(false, declineReason, payment.Reference, bookingService.ToDto(booking));

        booking.Status = BookingStatus.Confirmed;
        booking.PaidAt = payment.ProcessedAt;
        booking.PaymentId = payment.Id;
        foreach (var segment in booking.Segments)
            segment.Seats = SeatAllocator.Allocate(booking.Cabin, booking.Passengers.Count, booking.Extras.SeatPreference);
        if (booking.CouponCode is not null) offers.RegisterUse(booking.CouponCode);
        bookings.Update(booking);

        return new PaymentResultDto(true, $"Payment of {Money.Inr(payment.Amount)} received. Your trip is confirmed.", payment.Reference, bookingService.ToDto(booking));
    }

    private static (string Instrument, string? Decline) ValidateCard(CardDetails? card)
    {
        if (card is null) throw new BadRequestException("Enter your card details.");
        var digits = new string(card.Number.Where(char.IsDigit).ToArray());
        if (digits.Length is < 13 or > 19 || !PassesLuhn(digits))
            throw new BadRequestException("That card number isn't valid. Check the digits and try again.");

        var month = int.Parse(card.Expiry[..2]);
        var year = 2000 + int.Parse(card.Expiry[3..]);
        var lastValidDay = new DateOnly(year, month, DateTime.DaysInMonth(year, month));
        if (lastValidDay < Clock.IstToday) throw new BadRequestException("This card has expired.");

        var brand = digits[0] switch
        {
            '4' => "Visa",
            '5' or '2' => "Mastercard",
            '6' => "RuPay",
            '3' => "Amex",
            _ => "Card"
        };
        var instrument = $"{brand} •••• {digits[^4..]}";
        return digits == DeclinedTestCard
            ? (instrument, "Your bank declined this payment. Try a different card or pay by UPI.")
            : (instrument, null);
    }

    private static (string Instrument, string? Decline) ValidateUpi(string? upiId)
    {
        if (string.IsNullOrWhiteSpace(upiId) || !UpiPattern().IsMatch(upiId.Trim()))
            throw new BadRequestException("Enter a valid UPI ID, like name@okbank.");
        var id = upiId.Trim().ToLowerInvariant();
        return id.StartsWith("fail")
            ? (id, "The payment request was declined in your UPI app.")
            : (id, null);
    }

    private static (string Instrument, string? Decline) ValidateBank(string? bankCode)
    {
        var code = bankCode?.Trim().ToUpperInvariant();
        if (code is null || !SupportedBanks.Contains(code))
            throw new BadRequestException("Choose your bank to continue.");
        return ($"{code} NetBanking", null);
    }

    private static bool PassesLuhn(string digits)
    {
        var sum = 0;
        var doubleIt = false;
        for (var i = digits.Length - 1; i >= 0; i--)
        {
            var d = digits[i] - '0';
            if (doubleIt)
            {
                d *= 2;
                if (d > 9) d -= 9;
            }
            sum += d;
            doubleIt = !doubleIt;
        }
        return sum % 10 == 0;
    }
}
