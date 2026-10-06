using SGTravels.Api.Contracts;
using SGTravels.Core.Journeys;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;

namespace SGTravels.Api.Controllers;

[ApiController]
[Route("api/journeys")]
[Produces("application/json")]
public sealed class JourneysController(JourneyService journeys) : ControllerBase
{
    /// <summary>All journeys, or only featured ones for the "Departing soon" board.</summary>
    [HttpGet]
    [OutputCache(PolicyName = CachePolicies.Catalog)]
    [ProducesResponseType<IReadOnlyList<JourneySummaryDto>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<JourneySummaryDto>>> List(
        [FromQuery] bool featured = false,
        CancellationToken cancellationToken = default)
    {
        var today = journeys.Today;
        var list = await journeys.ListAsync(featured, cancellationToken);
        return Ok(list.Select(j => j.ToSummary(today)).ToList());
    }

    [HttpGet("{slug}")]
    [OutputCache(PolicyName = CachePolicies.Catalog)]
    [ProducesResponseType<JourneyDetailDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<JourneyDetailDto>> Get(string slug, CancellationToken cancellationToken)
    {
        var journey = await journeys.FindAsync(slug, cancellationToken);
        if (journey is null)
        {
            return Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Journey not found",
                detail: $"There's no journey called '{slug}'. It may have been retired.");
        }

        return Ok(journey.ToDetail(journeys.Today));
    }
}
