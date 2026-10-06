using System.ComponentModel.DataAnnotations;
using SGTravels.Api.Contracts;
using SGTravels.Core.Discovery;
using SGTravels.Core.Feelings;
using SGTravels.Core.Journeys;
using Microsoft.AspNetCore.Mvc;

namespace SGTravels.Api.Controllers;

/// <summary>Turns a feeling into 3–5 ranked journeys. GET so results are linkable and cacheable.</summary>
[ApiController]
[Route("api/discover")]
[Produces("application/json")]
public sealed class DiscoveryController(DiscoveryService discovery, JourneyService journeys) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<DiscoveryResponseDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<DiscoveryResponseDto>> Discover([FromQuery] DiscoveryQuery query, CancellationToken cancellationToken)
    {
        var wanted = new FeelingVector(query.ZenWild, query.RomanticAdventurous, query.LuxuryRaw);
        var matches = await discovery.DiscoverAsync(wanted, query.Take, cancellationToken);
        var today = journeys.Today;

        return Ok(new DiscoveryResponseDto(wanted.ToDto(), matches.Select(m => m.ToDto(today)).ToList()));
    }
}

public sealed class DiscoveryQuery
{
    [Range(FeelingVector.Min, FeelingVector.Max)]
    [FromQuery(Name = "zenWild")]
    public int ZenWild { get; init; } = FeelingVector.Neutral;

    [Range(FeelingVector.Min, FeelingVector.Max)]
    [FromQuery(Name = "romanticAdventurous")]
    public int RomanticAdventurous { get; init; } = FeelingVector.Neutral;

    [Range(FeelingVector.Min, FeelingVector.Max)]
    [FromQuery(Name = "luxuryRaw")]
    public int LuxuryRaw { get; init; } = FeelingVector.Neutral;

    [Range(DiscoveryService.MinResults, DiscoveryService.MaxResults)]
    [FromQuery(Name = "take")]
    public int Take { get; init; } = DiscoveryService.DefaultResults;
}
