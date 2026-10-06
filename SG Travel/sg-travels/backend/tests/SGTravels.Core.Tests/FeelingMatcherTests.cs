using SGTravels.Core.Feelings;

namespace SGTravels.Core.Tests;

public class FeelingMatcherTests
{
    [Fact]
    public void Identical_feelings_score_100()
    {
        var feeling = new FeelingVector(20, 35, 20);

        var match = FeelingMatcher.Match(feeling, feeling);

        Assert.Equal(100, match.Score);
    }

    [Fact]
    public void Opposite_corners_score_0()
    {
        var match = FeelingMatcher.Match(new FeelingVector(0, 0, 0), new FeelingVector(100, 100, 100));

        Assert.Equal(0, match.Score);
    }

    [Fact]
    public void Axes_the_traveller_feels_strongly_about_weigh_more()
    {
        // Very zen, neutral on everything else.
        var wanted = new FeelingVector(0, 50, 50);

        var missesOnPace = FeelingMatcher.Match(wanted, new FeelingVector(40, 50, 50));
        var missesOnMood = FeelingMatcher.Match(wanted, new FeelingVector(0, 90, 50));

        Assert.True(
            missesOnMood.Score > missesOnPace.Score,
            $"A 40-point miss on the decisive axis ({missesOnPace.Score}) should hurt more than on a neutral one ({missesOnMood.Score}).");
    }

    [Fact]
    public void Out_of_range_input_is_clamped_not_rejected()
    {
        var match = FeelingMatcher.Match(new FeelingVector(-40, 150, 50), new FeelingVector(0, 100, 50));

        Assert.Equal(100, match.Score);
    }

    [Fact]
    public void Shared_axes_are_close_decisive_and_on_the_same_side()
    {
        var wanted = new FeelingVector(10, 50, 15);   // zen, no view on mood, luxury
        var offered = new FeelingVector(20, 20, 70);  // zen, romantic, raw

        var match = FeelingMatcher.Match(wanted, offered);

        var shared = Assert.Single(match.SharedAxes);
        Assert.Equal(FeelingAxisKey.ZenWild, shared.Key);
    }

    [Theory]
    [InlineData(50, 0.5)]
    [InlineData(0, 1.5)]
    [InlineData(100, 1.5)]
    [InlineData(75, 1.0)]
    public void Axis_weight_grows_away_from_neutral(int value, double expected)
    {
        Assert.Equal(expected, FeelingMatcher.AxisWeight(value), precision: 6);
    }

    [Fact]
    public void Explanation_names_the_shared_feelings()
    {
        var wanted = new FeelingVector(10, 15, 10);
        var match = FeelingMatcher.Match(wanted, new FeelingVector(20, 25, 15));

        Assert.Equal("Zen, romantic and luxurious, just as you set it.", MatchExplainer.Explain(wanted, match));
    }

    [Fact]
    public void Explanation_for_a_neutral_traveller_says_balanced()
    {
        var match = FeelingMatcher.Match(FeelingVector.Balanced, new FeelingVector(90, 90, 90));

        Assert.Equal("Balanced, just like your settings.", MatchExplainer.Explain(FeelingVector.Balanced, match));
    }
}
