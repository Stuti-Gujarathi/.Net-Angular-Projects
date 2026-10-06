using Microsoft.AspNetCore.Mvc;

namespace AeroTrip.Api.Controllers;

/// <summary>Public reference data used by the search form and home page. Open to guests.</summary>
[ApiController]
[Route("api/catalog")]
public sealed class CatalogController(ICatalogRepository catalog, IFlightService flights) : ControllerBase
{
    [HttpGet("airports")]
    public ActionResult<IEnumerable<AirportDto>> Airports() => Ok(catalog.GetAirports().Select(a => a.ToDto()));

    [HttpGet("airlines")]
    public ActionResult<IEnumerable<AirlineDto>> Airlines() => Ok(catalog.GetAirlines().Select(a => a.ToDto()));

    [HttpGet("popular-routes")]
    public ActionResult<IReadOnlyList<PopularRouteDto>> PopularRoutes() => Ok(flights.GetPopularRoutes());
}
