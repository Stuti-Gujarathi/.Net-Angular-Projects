using SGTravels.Core.Enquiries;
using SGTravels.Core.Feelings;
using SGTravels.Core.Journeys;

namespace SGTravels.Core.Tests;

internal sealed class FixedClock(DateTimeOffset now) : TimeProvider
{
    public override DateTimeOffset GetUtcNow() => now.ToUniversalTime();

    public override TimeZoneInfo LocalTimeZone => TimeZoneInfo.Utc;
}

internal sealed class FakeCatalog(params Journey[] journeys) : IJourneyCatalog
{
    public Task<IReadOnlyList<Journey>> GetAllAsync(CancellationToken cancellationToken = default) =>
        Task.FromResult<IReadOnlyList<Journey>>(journeys);

    public Task<Journey?> FindAsync(string slug, CancellationToken cancellationToken = default) =>
        Task.FromResult(journeys.FirstOrDefault(j => string.Equals(j.Slug, slug, StringComparison.OrdinalIgnoreCase)));
}

internal sealed class FakeEnquiryStore : IEnquiryStore
{
    public List<Enquiry> Saved { get; } = [];

    public Task<bool> TryAddAsync(Enquiry enquiry, CancellationToken cancellationToken = default)
    {
        if (Saved.Any(e => e.Reference == enquiry.Reference))
        {
            return Task.FromResult(false);
        }

        Saved.Add(enquiry);
        return Task.FromResult(true);
    }

    public Task<Enquiry?> FindAsync(string reference, CancellationToken cancellationToken = default) =>
        Task.FromResult(Saved.FirstOrDefault(e => e.Reference == reference));
}

internal static class Journeys
{
    public static Journey Make(string slug, int zenWild, int romanticAdventurous, int luxuryRaw, params DateOnly[] departures) => new()
    {
        Slug = slug,
        Title = slug,
        Days = 8,
        Nights = 7,
        StartingPrice = 100000,
        Feeling = new FeelingVector(zenWild, romanticAdventurous, luxuryRaw),
        Departures = departures,
    };

    public static readonly Journey Switzerland = Make("switzerland", 20, 30, 10);
    public static readonly Journey Japan = Make("japan", 20, 35, 20);
    public static readonly Journey Lapland = Make("lapland", 35, 20, 30);
    public static readonly Journey Balkans = Make("balkans", 50, 45, 55);
    public static readonly Journey China = Make("china", 60, 60, 45);
    public static readonly Journey Kenya = Make("kenya", 75, 80, 55);
    public static readonly Journey NewZealand = Make("new-zealand", 90, 90, 70);

    public static Journey[] All => [Switzerland, Japan, Lapland, Balkans, China, Kenya, NewZealand];
}
