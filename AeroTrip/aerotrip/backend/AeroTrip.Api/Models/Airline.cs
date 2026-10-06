namespace AeroTrip.Api.Models;

public class Airline
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string BrandColor { get; set; } = "#2648E8";

    /// <summary>Full-service carriers include a meal and allow refunds on standard fares.</summary>
    public bool IsFullService { get; set; }
}
