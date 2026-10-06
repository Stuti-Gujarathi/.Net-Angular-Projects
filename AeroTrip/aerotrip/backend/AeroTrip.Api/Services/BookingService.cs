namespace AeroTrip.Api.Services;

public interface IBookingService
{
    PriceQuoteDto Quote(QuoteRequest request);
    BookingDto Create(Guid userId, CreateBookingRequest request);
    IReadOnlyList<BookingDto> GetForUser(Guid userId);
    BookingDto Get(Guid bookingId, Guid requesterId, bool isAdmin);
    CancellationQuoteDto GetCancellationQuote(Guid bookingId, Guid requesterId, bool isAdmin);
    BookingDto Cancel(Guid bookingId, Guid requesterId, bool isAdmin);
    int ExpireStaleHolds();
    BookingDto ToDto(Booking booking);
}

public sealed class BookingService(
    IBookingRepository bookings,
    IFlightRepository flights,
    IFlightService flightService,
    IPricingService pricing,
    IOfferService offers,
    IUserRepository users,
    IPaymentRepository payments,
    ICatalogRepository catalog,
    IConfiguration configuration) : IBookingService
{
    private const string PnrAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private const decimal CancellationFeePerPassengerPerSector = 999m;

    private int HoldMinutes => configuration.GetValue("Booking:HoldMinutes", 15);

    public static string GeneratePnr(Random? random = null)
    {
        random ??= Random.Shared;
        return new string(Enumerable.Range(0, 6).Select(_ => PnrAlphabet[random.Next(PnrAlphabet.Length)]).ToArray());
    }

    public PriceQuoteDto Quote(QuoteRequest request)
    {
        var legs = flightService.ResolveItinerary(request.ItineraryId);
        EnsureBookable(legs, request.Cabin);
        var fare = pricing.Calculate(legs, request.Cabin, request.Passengers, request.Extras.ToEntity());

        string? applied = null, message = null;
        var valid = false;
        if (!string.IsNullOrWhiteSpace(request.CouponCode))
        {
            var result = offers.Evaluate(request.CouponCode, fare.Subtotal, request.Cabin, legs);
            message = result.Message;
            valid = result.IsValid;
            if (result.IsValid)
            {
                fare.Discount = result.Discount;
                applied = result.Offer!.Code;
            }
        }
        return new PriceQuoteDto(request.ItineraryId, request.Passengers, request.Cabin, fare.ToDto(), applied, message, valid);
    }

    public BookingDto Create(Guid userId, CreateBookingRequest request)
    {
        var user = users.GetById(userId) ?? throw new UnauthorizedAppException("Please log in to continue.");
        var legs = flightService.ResolveItinerary(request.ItineraryId);
        EnsureBookable(legs, request.Cabin);

        if (request.Passengers.All(p => p.Age < 12))
            throw new BadRequestException("At least one adult (12 or older) must be travelling.");

        var extras = request.Extras.ToEntity();
        var fare = pricing.Calculate(legs, request.Cabin, request.Passengers.Count, extras);

        string? couponCode = null;
        if (!string.IsNullOrWhiteSpace(request.CouponCode))
        {
            var coupon = offers.Evaluate(request.CouponCode, fare.Subtotal, request.Cabin, legs);
            if (!coupon.IsValid) throw new BadRequestException(coupon.Message);
            fare.Discount = coupon.Discount;
            couponCode = coupon.Offer!.Code;
        }

        var instanceIds = legs.Select(l => l.Id).ToList();
        if (!flights.TryReserveSeats(instanceIds, request.Cabin, request.Passengers.Count))
            throw new ConflictException("Those seats were just taken. Please pick another flight or fewer passengers.");

        var now = Clock.IstNow;
        string pnr;
        do { pnr = GeneratePnr(); } while (bookings.PnrExists(pnr));

        var booking = new Booking
        {
            Pnr = pnr,
            UserId = user.Id,
            ItineraryId = string.Join('_', instanceIds),
            Cabin = request.Cabin,
            Passengers = request.Passengers.Select(p => new Passenger
            {
                FirstName = p.FirstName.Trim(),
                LastName = p.LastName.Trim(),
                Gender = p.Gender,
                Age = p.Age
            }).ToList(),
            ContactEmail = request.ContactEmail.Trim(),
            ContactPhone = request.ContactPhone.Trim(),
            Extras = extras,
            Fare = fare,
            CouponCode = couponCode,
            Status = BookingStatus.PendingPayment,
            CreatedAt = now,
            HoldExpiresAt = now.AddMinutes(HoldMinutes),
            Segments = legs.Select(l => new BookedSegment
            {
                FlightInstanceId = l.Id,
                FlightNumber = l.Schedule.FlightNumber,
                AirlineCode = l.Schedule.AirlineCode,
                Origin = l.Schedule.OriginCode,
                Destination = l.Schedule.DestinationCode,
                Departure = l.DepartureLocal,
                Arrival = l.ArrivalLocal,
                DurationMinutes = l.Schedule.DurationMinutes,
                Aircraft = l.Schedule.Aircraft
            }).ToList()
        };

        bookings.Add(booking);
        return ToDto(booking);
    }

    public IReadOnlyList<BookingDto> GetForUser(Guid userId)
    {
        ExpireStaleHolds();
        return bookings.GetByUser(userId).Select(ToDto).ToList();
    }

    public BookingDto Get(Guid bookingId, Guid requesterId, bool isAdmin)
    {
        ExpireStaleHolds();
        return ToDto(Load(bookingId, requesterId, isAdmin));
    }

    public CancellationQuoteDto GetCancellationQuote(Guid bookingId, Guid requesterId, bool isAdmin)
    {
        var booking = Load(bookingId, requesterId, isAdmin);
        var (refund, policy) = ComputeRefund(booking, isAdmin);
        var paid = booking.Status == BookingStatus.Confirmed ? booking.Fare.Total : 0;
        return new CancellationQuoteDto(booking.Id, paid, refund, Math.Max(0, paid - refund), policy);
    }

    public BookingDto Cancel(Guid bookingId, Guid requesterId, bool isAdmin)
    {
        var booking = Load(bookingId, requesterId, isAdmin);
        var (refund, _) = ComputeRefund(booking, isAdmin);

        flights.ReleaseSeats(booking.Segments.Select(s => s.FlightInstanceId).ToList(), booking.Cabin, booking.Passengers.Count);
        booking.RefundAmount = refund;
        booking.Status = BookingStatus.Cancelled;
        booking.CancelledAt = Clock.IstNow;
        booking.CancelledBy = isAdmin ? "AeroTrip" : "Traveller";
        bookings.Update(booking);
        return ToDto(booking);
    }

    public int ExpireStaleHolds()
    {
        var expired = bookings.GetExpiredHolds(Clock.IstNow);
        foreach (var booking in expired)
        {
            booking.Status = BookingStatus.Expired;
            flights.ReleaseSeats(booking.Segments.Select(s => s.FlightInstanceId).ToList(), booking.Cabin, booking.Passengers.Count);
            bookings.Update(booking);
        }
        return expired.Count;
    }

    public BookingDto ToDto(Booking booking)
    {
        var payment = booking.PaymentId is { } pid ? payments.GetById(pid) : null;
        return booking.ToDto(catalog, users.GetById(booking.UserId), payment, Clock.IstNow);
    }

    private Booking Load(Guid bookingId, Guid requesterId, bool isAdmin)
    {
        var booking = bookings.GetById(bookingId) ?? throw new NotFoundException("Booking not found.");
        if (!isAdmin && booking.UserId != requesterId) throw new NotFoundException("Booking not found.");
        return booking;
    }

    private void EnsureBookable(IReadOnlyList<FlightInstance> legs, CabinClass cabin)
    {
        if (legs[0].DepartureLocal < Clock.IstNow.AddHours(2))
            throw new BadRequestException("Bookings close 2 hours before departure.");
        if (!legs.All(l => l.Schedule.OffersCabin(cabin)))
            throw new BadRequestException("This cabin isn't available on every flight in this itinerary.");
    }

    /// <summary>Refund rules modelled on typical Indian domestic fare conditions.</summary>
    private static (decimal Refund, string Policy) ComputeRefund(Booking booking, bool isAdmin)
    {
        if (booking.Status is BookingStatus.Cancelled or BookingStatus.Expired)
            throw new BadRequestException("This booking is already closed.");

        var hoursToDeparture = (booking.FirstDeparture - Clock.IstNow).TotalHours;
        if (hoursToDeparture <= 0) throw new BadRequestException("This flight has already departed.");

        if (booking.Status == BookingStatus.PendingPayment)
            return (0, "Nothing has been charged yet, so the held seats are simply released.");

        var fare = booking.Fare;
        var total = fare.Total;

        decimal refund;
        string policy;
        if (isAdmin)
        {
            refund = total;
            policy = "Cancelled by AeroTrip: the full amount is refunded.";
        }
        else if (booking.Extras.FlexibleDateChange)
        {
            refund = total - fare.ConvenienceFee;
            policy = "Flexible fare: full refund except the convenience fee.";
        }
        else if (hoursToDeparture >= 72)
        {
            var charges = CancellationFeePerPassengerPerSector * booking.Passengers.Count * booking.Segments.Count + fare.InsuranceFee + fare.ConvenienceFee;
            refund = total - charges;
            policy = $"More than 3 days before departure: {Money.Inr(CancellationFeePerPassengerPerSector)} per passenger per flight, plus non-refundable fees.";
        }
        else if (hoursToDeparture >= 24)
        {
            refund = fare.Taxes + (fare.BaseFare * 0.5m) - fare.Discount;
            policy = "1 to 3 days before departure: 50% of the base fare plus all taxes are refunded.";
        }
        else
        {
            refund = fare.Taxes;
            policy = "Less than 24 hours before departure: only government taxes and airport fees are refunded.";
        }

        return (Math.Clamp(Math.Round(refund), 0, total), policy);
    }
}
