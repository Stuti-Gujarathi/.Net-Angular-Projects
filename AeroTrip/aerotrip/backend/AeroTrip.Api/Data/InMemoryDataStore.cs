namespace AeroTrip.Api.Data;

/// <summary>
/// The application's in-memory database. Registered as a singleton; every repository
/// takes <see cref="Sync"/> before reading or writing so concurrent requests stay consistent.
/// Swap the repositories for EF Core implementations to move to SQL Server/PostgreSQL —
/// services and controllers don't change.
/// </summary>
public sealed class InMemoryDataStore
{
    public object Sync { get; } = new();

    public List<User> Users { get; } = new();
    public List<Airport> Airports { get; } = new();
    public List<Airline> Airlines { get; } = new();
    public List<FlightSchedule> Schedules { get; } = new();
    public List<Booking> Bookings { get; } = new();
    public List<Payment> Payments { get; } = new();
    public List<Offer> Offers { get; } = new();

    /// <summary>Seats sold through AeroTrip, keyed by flight instance id, then cabin.</summary>
    public Dictionary<string, Dictionary<CabinClass, int>> SeatsSold { get; } = new();
}
