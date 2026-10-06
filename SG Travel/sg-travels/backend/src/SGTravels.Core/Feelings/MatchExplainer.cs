namespace SGTravels.Core.Feelings;

/// <summary>Turns a numeric match into one plain sentence a traveller can read on a boarding pass.</summary>
public static class MatchExplainer
{
    public static string Explain(FeelingVector wanted, FeelingMatch match)
    {
        ArgumentNullException.ThrowIfNull(wanted);
        ArgumentNullException.ThrowIfNull(match);

        var hasPreference = FeelingAxes.All.Any(a => FeelingMatcher.IsDecisive(wanted[a.Key]));
        if (!hasPreference)
        {
            return "Balanced, just like your settings.";
        }

        var words = match.SharedAxes.Select(a => a.AdjectiveFor(wanted[a.Key])).ToList();

        return words.Count switch
        {
            0 => "A wildcard: not your exact setting, but close on balance.",
            1 => $"Right on the {words[0]} side you asked for.",
            2 => $"As {words[0]} and {words[1]} as you asked for.",
            _ => $"{Capitalise(words[0])}, {words[1]} and {words[2]}, just as you set it.",
        };
    }

    private static string Capitalise(string value) =>
        value.Length == 0 ? value : string.Concat(char.ToUpperInvariant(value[0]).ToString(), value.AsSpan(1));
}
