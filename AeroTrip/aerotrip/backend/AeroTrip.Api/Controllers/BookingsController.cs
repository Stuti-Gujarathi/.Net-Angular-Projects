using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AeroTrip.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/bookings")]
public sealed class BookingsController(IBookingService bookings) : ControllerBase
{
    /// <summary>Live price including extras and coupon. Reserves nothing.</summary>
    [HttpPost("quote")]
    public ActionResult<PriceQuoteDto> Quote(QuoteRequest request) => Ok(bookings.Quote(request));

    /// <summary>Creates a booking and holds the seats while the traveller pays.</summary>
    [HttpPost]
    public ActionResult<BookingDto> Create(CreateBookingRequest request)
    {
        var booking = bookings.Create(User.GetUserId(), request);
        return CreatedAtAction(nameof(Get), new { id = booking.Id }, booking);
    }

    [HttpGet("my")]
    public ActionResult<IReadOnlyList<BookingDto>> Mine() => Ok(bookings.GetForUser(User.GetUserId()));

    [HttpGet("{id:guid}")]
    public ActionResult<BookingDto> Get(Guid id) => Ok(bookings.Get(id, User.GetUserId(), User.IsAdmin()));

    [HttpGet("{id:guid}/cancellation-quote")]
    public ActionResult<CancellationQuoteDto> CancellationQuote(Guid id) =>
        Ok(bookings.GetCancellationQuote(id, User.GetUserId(), isAdmin: false));

    [HttpPost("{id:guid}/cancel")]
    public ActionResult<BookingDto> Cancel(Guid id) => Ok(bookings.Cancel(id, User.GetUserId(), isAdmin: false));
}
