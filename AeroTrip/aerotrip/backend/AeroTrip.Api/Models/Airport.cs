namespace AeroTrip.Api.Models;

public class Airport
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;

    /// <summary>Offset from UTC in minutes (IST = 330). Used to compute local arrival times and layovers.</summary>
    public int UtcOffsetMinutes { get; set; }

    public bool IsInternational => !string.Equals(Country, "India", StringComparison.OrdinalIgnoreCase);
}
