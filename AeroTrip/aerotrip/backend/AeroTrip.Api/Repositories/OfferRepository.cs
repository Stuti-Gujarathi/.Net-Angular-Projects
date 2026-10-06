namespace AeroTrip.Api.Repositories;

public sealed class OfferRepository(InMemoryDataStore store) : IOfferRepository
{
    public IReadOnlyList<Offer> GetAll()
    {
        lock (store.Sync) return store.Offers.ToList();
    }

    public Offer? GetById(Guid id)
    {
        lock (store.Sync) return store.Offers.FirstOrDefault(o => o.Id == id);
    }

    public Offer? GetByCode(string code)
    {
        lock (store.Sync) return store.Offers.FirstOrDefault(o => string.Equals(o.Code, code.Trim(), StringComparison.OrdinalIgnoreCase));
    }

    public void Add(Offer offer)
    {
        lock (store.Sync) store.Offers.Add(offer);
    }

    public void Update(Offer offer)
    {
        lock (store.Sync) { }
    }

    public bool Delete(Guid id)
    {
        lock (store.Sync) return store.Offers.RemoveAll(o => o.Id == id) > 0;
    }
}
