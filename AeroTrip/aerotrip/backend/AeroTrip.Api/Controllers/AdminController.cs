using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AeroTrip.Api.Controllers;

[ApiController]
[Authorize(Roles = nameof(UserRole.Admin))]
[Route("api/admin")]
public sealed class AdminController(
    IAdminService admin,
    IBookingService bookings,
    IFlightScheduleService schedules,
    IOfferService offers) : ControllerBase
{
    // ---- Dashboard ----
    [HttpGet("stats")]
    public ActionResult<AdminStatsDto> Stats() => Ok(admin.GetStats());

    // ---- Bookings ----
    [HttpGet("bookings")]
    public ActionResult<PagedResult<BookingSummaryDto>> Bookings(
        [FromQuery] BookingStatus? status, [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 12) =>
        Ok(admin.GetBookings(status, search, page, pageSize));

    [HttpGet("bookings/{id:guid}")]
    public ActionResult<BookingDto> Booking(Guid id) => Ok(bookings.Get(id, User.GetUserId(), isAdmin: true));

    [HttpPost("bookings/{id:guid}/cancel")]
    public ActionResult<BookingDto> CancelBooking(Guid id) => Ok(bookings.Cancel(id, User.GetUserId(), isAdmin: true));

    // ---- Flights (schedules) ----
    [HttpGet("flights")]
    public ActionResult<IReadOnlyList<FlightScheduleDto>> Flights() => Ok(schedules.GetAll());

    [HttpPost("flights")]
    public ActionResult<FlightScheduleDto> CreateFlight(UpsertFlightScheduleRequest request) => Ok(schedules.Create(request));

    [HttpPut("flights/{id:guid}")]
    public ActionResult<FlightScheduleDto> UpdateFlight(Guid id, UpsertFlightScheduleRequest request) => Ok(schedules.Update(id, request));

    [HttpPatch("flights/{id:guid}/status")]
    public ActionResult<FlightScheduleDto> SetFlightStatus(Guid id, SetActiveRequest request) => Ok(schedules.SetActive(id, request.IsActive));

    // ---- Offers & discounts ----
    [HttpGet("offers")]
    public ActionResult<IReadOnlyList<OfferDto>> Offers() => Ok(offers.GetAll());

    [HttpPost("offers")]
    public ActionResult<OfferDto> CreateOffer(UpsertOfferRequest request) => Ok(offers.Create(request));

    [HttpPut("offers/{id:guid}")]
    public ActionResult<OfferDto> UpdateOffer(Guid id, UpsertOfferRequest request) => Ok(offers.Update(id, request));

    [HttpPatch("offers/{id:guid}/status")]
    public ActionResult<OfferDto> SetOfferStatus(Guid id, SetActiveRequest request) => Ok(offers.SetActive(id, request.IsActive));

    [HttpDelete("offers/{id:guid}")]
    public IActionResult DeleteOffer(Guid id)
    {
        offers.Delete(id);
        return NoContent();
    }

    // ---- Users ----
    [HttpGet("users")]
    public ActionResult<IReadOnlyList<AdminUserDto>> Users() => Ok(admin.GetUsers());

    [HttpPatch("users/{id:guid}/status")]
    public ActionResult<AdminUserDto> SetUserStatus(Guid id, SetActiveRequest request) =>
        Ok(admin.SetUserActive(id, request.IsActive, User.GetUserId()));
}
