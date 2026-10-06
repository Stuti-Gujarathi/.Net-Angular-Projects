using SGTravels.Api.Contracts;
using SGTravels.Core.Feelings;
using Microsoft.AspNetCore.Mvc;

namespace SGTravels.Api.Controllers;

/// <summary>The dials shown on the feeling panel. Served by the API so copy can change without a UI release.</summary>
[ApiController]
[Route("api/feelings")]
[Produces("application/json")]
public sealed class FeelingsController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<FeelingAxisDto>>(StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<FeelingAxisDto>> Get() =>
        Ok(FeelingAxes.All.Select(a => a.ToDto()).ToList());
}
