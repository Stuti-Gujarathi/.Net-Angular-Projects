namespace SGTravels.Core.Journeys;

public sealed class JourneyService(IJourneyCatalog catalog, TimeProvider clock)
{
    public DateOnly Today => DateOnly.FromDateTime(clock.GetLocalNow().DateTime);

    public async Task<IReadOnlyList<Journey>> ListAsync(bool featuredOnly, CancellationToken cancellationToken = default)
    {
        var journeys = await catalog.GetAllAsync(cancellationToken).ConfigureAwait(false);

        IEnumerable<Journey> query = journeys;
        if (featuredOnly)
        {
            query = query.Where(j => j.FeaturedRank is not null);
        }

        var today = Today;

        // Soonest departure first; trips with nothing scheduled go last, then editorial rank breaks ties.
        return query
            .OrderBy(j => j.DeparturesFrom(today).Cast<DateOnly?>().FirstOrDefault() ?? DateOnly.MaxValue)
            .ThenBy(j => j.FeaturedRank ?? int.MaxValue)
            .ThenBy(j => j.Title, StringComparer.Ordinal)
            .ToList();
    }

    public Task<Journey?> FindAsync(string slug, CancellationToken cancellationToken = default) =>
        string.IsNullOrWhiteSpace(slug)
            ? Task.FromResult<Journey?>(null)
            : catalog.FindAsync(slug.Trim(), cancellationToken);
}
