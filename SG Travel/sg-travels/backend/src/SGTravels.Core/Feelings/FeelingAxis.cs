namespace SGTravels.Core.Feelings;

public enum FeelingAxisKey
{
    ZenWild,
    RomanticAdventurous,
    LuxuryRaw,
}

/// <summary>
/// One dial on the feeling panel. 0 sits fully on the <see cref="Low"/> pole, 100 fully on <see cref="High"/>.
/// </summary>
public sealed record FeelingAxis(
    FeelingAxisKey Key,
    string Low,
    string High,
    string LowAdjective,
    string HighAdjective,
    string Question)
{
    public string PoleFor(int value) => value < FeelingVector.Neutral ? Low : High;

    public string AdjectiveFor(int value) => value < FeelingVector.Neutral ? LowAdjective : HighAdjective;
}

public static class FeelingAxes
{
    public static readonly FeelingAxis ZenWild =
        new(FeelingAxisKey.ZenWild, "Zen", "Wild", "zen", "wild", "How should the days move?");

    public static readonly FeelingAxis RomanticAdventurous =
        new(FeelingAxisKey.RomanticAdventurous, "Romantic", "Adventurous", "romantic", "adventurous", "What should your heart be doing?");

    public static readonly FeelingAxis LuxuryRaw =
        new(FeelingAxisKey.LuxuryRaw, "Luxury", "Raw", "luxurious", "raw", "How polished should it feel?");

    public static IReadOnlyList<FeelingAxis> All { get; } = [ZenWild, RomanticAdventurous, LuxuryRaw];
}
