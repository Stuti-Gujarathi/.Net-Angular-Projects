using SGTravels.Core.Feelings;
using SGTravels.Core.Journeys;

namespace SGTravels.Core.Discovery;

public sealed record DiscoveryMatch(
    Journey Journey,
    int Score,
    IReadOnlyList<string> SharedFeelings,
    string Reason);

/// <summary>Ranks every journey against a requested feeling and returns the best few.</summary>
public sealed class DiscoveryService(IJourneyCatalog catalog)
{
    public const int MinResults = 3;
    public const int MaxResults = 5;
    public const int DefaultResults = 4;

    public async Task<IReadOnlyList<DiscoveryMatch>> DiscoverAsync(
        FeelingVector wanted,
        int take = DefaultResults,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(wanted);

        var count = Math.Clamp(take, MinResults, MaxResults);
        var journeys = await catalog.GetAllAsync(cancellationToken).ConfigureAwait(false);

        return journeys
            .Select(journey => (Journey: journey, Match: FeelingMatcher.Match(wanted, journey.Feeling)))
            .OrderByDescending(x => x.Match.Score)
            .ThenBy(x => x.Journey.FeaturedRank ?? int.MaxValue)
            .ThenBy(x => x.Journey.Title, StringComparer.Ordinal)
            .Take(count)
            .Select(x => new DiscoveryMatch(
                x.Journey,
                x.Match.Score,
                x.Match.SharedAxes.Select(a => a.PoleFor(wanted[a.Key])).ToList(),
                MatchExplainer.Explain(wanted, x.Match)))
            .ToList();
    }
}
