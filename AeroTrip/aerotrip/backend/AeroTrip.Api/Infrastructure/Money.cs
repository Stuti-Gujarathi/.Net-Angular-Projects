namespace AeroTrip.Api.Infrastructure;

/// <summary>Formats rupees with Indian digit grouping (₹12,34,567) without depending on ICU culture data.</summary>
public static class Money
{
    public static string Inr(decimal amount)
    {
        var rounded = Math.Round(amount, 0, MidpointRounding.AwayFromZero);
        var negative = rounded < 0;
        var digits = Math.Abs(rounded).ToString("0");
        if (digits.Length > 3)
        {
            var last3 = digits[^3..];
            var rest = digits[..^3];
            var groups = new List<string>();
            while (rest.Length > 2)
            {
                groups.Insert(0, rest[^2..]);
                rest = rest[..^2];
            }
            if (rest.Length > 0) groups.Insert(0, rest);
            digits = string.Join(",", groups) + "," + last3;
        }
        return (negative ? "-₹" : "₹") + digits;
    }

    public static decimal RoundToTen(decimal value) => Math.Round(value / 10m, 0, MidpointRounding.AwayFromZero) * 10m;
}
