namespace SGTravels.Core.Feelings;

/// <summary>A point in feeling-space. Every axis runs from 0 (low pole) to 100 (high pole).</summary>
public sealed record FeelingVector(int ZenWild, int RomanticAdventurous, int LuxuryRaw)
{
    public const int Min = 0;
    public const int Max = 100;
    public const int Neutral = 50;

    public static FeelingVector Balanced { get; } = new(Neutral, Neutral, Neutral);

    public int this[FeelingAxisKey key] => key switch
    {
        FeelingAxisKey.ZenWild => ZenWild,
        FeelingAxisKey.RomanticAdventurous => RomanticAdventurous,
        FeelingAxisKey.LuxuryRaw => LuxuryRaw,
        _ => throw new ArgumentOutOfRangeException(nameof(key), key, "Unknown feeling axis."),
    };

    /// <summary>Returns a copy with every axis forced into the 0–100 range.</summary>
    public FeelingVector Clamped() =>
        new(Math.Clamp(ZenWild, Min, Max), Math.Clamp(RomanticAdventurous, Min, Max), Math.Clamp(LuxuryRaw, Min, Max));
}
