namespace AeroTrip.Api.Repositories;

public sealed class BookingRepository(InMemoryDataStore store) : IBookingRepository
{
    public void Add(Booking booking)
    {
        lock (store.Sync) store.Bookings.Add(booking);
    }

    public void Update(Booking booking)
    {
        lock (store.Sync) { }
    }

    public Booking? GetById(Guid id)
    {
        lock (store.Sync) return store.Bookings.FirstOrDefault(b => b.Id == id);
    }

    public bool PnrExists(string pnr)
    {
        lock (store.Sync) return store.Bookings.Any(b => b.Pnr == pnr);
    }

    public IReadOnlyList<Booking> GetByUser(Guid userId)
    {
        lock (store.Sync) return store.Bookings.Where(b => b.UserId == userId).OrderByDescending(b => b.CreatedAt).ToList();
    }

    public IReadOnlyList<Booking> GetAll()
    {
        lock (store.Sync) return store.Bookings.OrderByDescending(b => b.CreatedAt).ToList();
    }

    public IReadOnlyList<Booking> GetExpiredHolds(DateTime nowIst)
    {
        lock (store.Sync) return store.Bookings.Where(b => b.Status == BookingStatus.PendingPayment && b.HoldExpiresAt <= nowIst).ToList();
    }
}
