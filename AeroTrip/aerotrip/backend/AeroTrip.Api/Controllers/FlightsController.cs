using Microsoft.AspNetCore.Mvc;

namespace AeroTrip.Api.Controllers;

/// <summary>Flight search is open to guests; booking requires login.</summary>
[ApiController]
[Route("api/flights")]
public sealed class FlightsController(IFlightService flights) : ControllerBase
{
    [HttpGet("search")]
    public ActionResult<FlightSearchResponse> Search([FromQuery] FlightSearchRequest request) => Ok(flights.Search(request));

    [HttpGet("itineraries/{id}")]
    public ActionResult<ItineraryDto> Itinerary(string id, [FromQuery] CabinClass cabin = CabinClass.Economy, [FromQuery] int passengers = 1) =>
        Ok(flights.GetItinerary(id, cabin, passengers));

    [HttpGet("fare-calendar")]
    public ActionResult<IReadOnlyList<FareCalendarDayDto>> FareCalendar(
        [FromQuery] string from, [FromQuery] string to, [FromQuery] DateOnly start,
        [FromQuery] int days = 7, [FromQuery] CabinClass cabin = CabinClass.Economy) =>
        Ok(flights.GetFareCalendar(from, to, start, days, cabin));
}
