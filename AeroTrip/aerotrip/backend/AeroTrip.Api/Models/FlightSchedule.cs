namespace AeroTrip.Api.Models;

/// <summary>
/// A recurring scheduled service (e.g. SF214 DEL→BOM at 06:15 daily).
/// Concrete dated flights are generated from schedules on demand as <see cref="FlightInstance"/>.
/// </summary>
public class FlightSchedule
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FlightNumber { get; set; } = string.Empty;
    public string AirlineCode { get; set; } = string.Empty;
    public string OriginCode { get; set; } = string.Empty;
    public string DestinationCode { get; set; } = string.Empty;
    public TimeOnly DepartureTime { get; set; }
    public int DurationMinutes { get; set; }
    public string Aircraft { get; set; } = "Airbus A320neo";
    public List<DayOfWeek> OperatingDays { get; set; } = Enum.GetValues<DayOfWeek>().ToList();
    public Dictionary<CabinClass, int> Capacity { get; set; } = new();
    public Dictionary<CabinClass, decimal> BaseFare { get; set; } = new();
    public int CheckInBaggageKg { get; set; } = 15;
    public int CabinBaggageKg { get; set; } = 7;
    public bool MealIncluded { get; set; }
    public bool IsActive { get; set; } = true;

    public bool OffersCabin(CabinClass cabin) =>
        Capacity.TryGetValue(cabin, out var seats) && seats > 0 && BaseFare.ContainsKey(cabin);
}
