using SGTravels.Core.Discovery;
using SGTravels.Core.Feelings;

namespace SGTravels.Core.Tests;

public class DiscoveryServiceTests
{
    private readonly DiscoveryService _service = new(new FakeCatalog(Journeys.All));

    [Theory]
    [InlineData(1, 3)]
    [InlineData(4, 4)]
    [InlineData(99, 5)]
    public async Task Always_returns_between_three_and_five_matches(int requested, int expected)
    {
        var matches = await _service.DiscoverAsync(FeelingVector.Balanced, requested);

        Assert.Equal(expected, matches.Count);
    }

    [Fact]
    public async Task Matches_are_ranked_best_first()
    {
        var matches = await _service.DiscoverAsync(new FeelingVector(30, 30, 30), 5);

        Assert.Equal(matches.OrderByDescending(m => m.Score).Select(m => m.Score), matches.Select(m => m.Score));
    }

    [Fact]
    public async Task Zen_romantic_luxury_surfaces_switzerland_and_japan()
    {
        var matches = await _service.DiscoverAsync(new FeelingVector(15, 25, 10), 3);

        var top = matches.Take(2).Select(m => m.Journey.Slug).ToList();
        Assert.Contains("switzerland", top);
        Assert.Contains("japan", top);
    }

    [Fact]
    public async Task Wild_adventurous_raw_surfaces_new_zealand_first()
    {
        var matches = await _service.DiscoverAsync(new FeelingVector(95, 95, 80), 3);

        Assert.Equal("new-zealand", matches[0].Journey.Slug);
        Assert.Contains(matches, m => m.Journey.Slug == "kenya");
    }

    [Fact]
    public async Task Every_match_explains_itself()
    {
        var matches = await _service.DiscoverAsync(new FeelingVector(20, 20, 20), 5);

        Assert.All(matches, m => Assert.False(string.IsNullOrWhiteSpace(m.Reason)));
    }
}
