namespace AeroTrip.Api.Models;

/// <summary>A dated departure generated from a <see cref="FlightSchedule"/>. Times are local to each airport.</summary>
public sealed record FlightInstance(
    FlightSchedule Schedule,
    DateOnly Date,
    DateTime DepartureLocal,
    DateTime ArrivalLocal,
    DateTime DepartureUtc,
    DateTime ArrivalUtc)
{
    public string Id => BuildId(Schedule.FlightNumber, Date);

    public static string BuildId(string flightNumber, DateOnly date) => $"{flightNumber}-{date:yyyyMMdd}";

    public static bool TryParseId(string id, out string flightNumber, out DateOnly date)
    {
        flightNumber = string.Empty;
        date = default;
        var dash = id.LastIndexOf('-');
        if (dash <= 0 || dash == id.Length - 1) return false;
        flightNumber = id[..dash];
        return DateOnly.TryParseExact(id[(dash + 1)..], "yyyyMMdd", out date);
    }
}
