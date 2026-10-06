namespace AeroTrip.Api.Repositories;

public sealed class PaymentRepository(InMemoryDataStore store) : IPaymentRepository
{
    public void Add(Payment payment)
    {
        lock (store.Sync) store.Payments.Add(payment);
    }

    public Payment? GetById(Guid id)
    {
        lock (store.Sync) return store.Payments.FirstOrDefault(p => p.Id == id);
    }

    public IReadOnlyList<Payment> GetByBooking(Guid bookingId)
    {
        lock (store.Sync) return store.Payments.Where(p => p.BookingId == bookingId).OrderBy(p => p.ProcessedAt).ToList();
    }
}
