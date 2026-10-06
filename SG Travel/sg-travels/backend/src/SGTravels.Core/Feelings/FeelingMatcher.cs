namespace SGTravels.Core.Feelings;

public sealed record FeelingMatch(int Score, IReadOnlyList<FeelingAxis> SharedAxes);

/// <summary>
/// Scores how closely a journey's feeling matches the one a traveller asked for.
/// </summary>
/// <remarks>
/// Weighted Euclidean distance in a 0–100 cube. Axes the traveller feels strongly about
/// (dial pushed far from the middle) weigh up to three times more than axes left near neutral,
/// so "very zen, don't mind the rest" is answered with zen trips first.
/// </remarks>
public static class FeelingMatcher
{
    /// <summary>Max gap on an axis that still counts as "the same feeling".</summary>
    public const int SharedTolerance = 20;

    /// <summary>How far from neutral a dial must be before we treat it as a stated preference.</summary>
    public const int DecisiveThreshold = 10;

    public static FeelingMatch Match(FeelingVector wanted, FeelingVector offered)
    {
        ArgumentNullException.ThrowIfNull(wanted);
        ArgumentNullException.ThrowIfNull(offered);

        var want = wanted.Clamped();
        var offer = offered.Clamped();

        double weightedSquares = 0;
        double totalWeight = 0;
        var shared = new List<FeelingAxis>();

        foreach (var axis in FeelingAxes.All)
        {
            var w = want[axis.Key];
            var o = offer[axis.Key];
            var weight = AxisWeight(w);
            var gap = (w - o) / (double)FeelingVector.Max;

            weightedSquares += weight * gap * gap;
            totalWeight += weight;

            if (IsDecisive(w) && Math.Abs(w - o) <= SharedTolerance && axis.PoleFor(w) == axis.PoleFor(o))
            {
                shared.Add(axis);
            }
        }

        var distance = Math.Sqrt(weightedSquares / totalWeight); // 0 (identical) .. 1 (opposite corners)
        var score = (int)Math.Round((1 - distance) * 100, MidpointRounding.AwayFromZero);

        // Shared axes stay in panel order so explanations always read "zen, romantic and luxurious".
        return new FeelingMatch(Math.Clamp(score, 0, 100), shared);
    }

    /// <summary>0.5 at neutral, rising to 1.5 at either extreme.</summary>
    public static double AxisWeight(int value) =>
        0.5 + Math.Abs(Math.Clamp(value, FeelingVector.Min, FeelingVector.Max) - FeelingVector.Neutral) / (double)FeelingVector.Neutral;

    public static bool IsDecisive(int value) => Math.Abs(value - FeelingVector.Neutral) >= DecisiveThreshold;
}
