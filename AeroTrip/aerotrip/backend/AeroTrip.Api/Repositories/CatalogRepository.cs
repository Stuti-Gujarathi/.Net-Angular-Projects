namespace AeroTrip.Api.Repositories;

public sealed class CatalogRepository(InMemoryDataStore store) : ICatalogRepository
{
    public IReadOnlyList<Airport> GetAirports()
    {
        lock (store.Sync) return store.Airports.OrderBy(a => a.IsInternational).ThenBy(a => a.City).ToList();
    }

    public Airport? GetAirport(string code)
    {
        lock (store.Sync) return store.Airports.FirstOrDefault(a => string.Equals(a.Code, code, StringComparison.OrdinalIgnoreCase));
    }

    public IReadOnlyList<Airline> GetAirlines()
    {
        lock (store.Sync) return store.Airlines.ToList();
    }

    public Airline? GetAirline(string code)
    {
        lock (store.Sync) return store.Airlines.FirstOrDefault(a => string.Equals(a.Code, code, StringComparison.OrdinalIgnoreCase));
    }
}
