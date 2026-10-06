namespace AeroTrip.Api.Repositories;

public sealed class UserRepository(InMemoryDataStore store) : IUserRepository
{
    public User? GetById(Guid id)
    {
        lock (store.Sync) return store.Users.FirstOrDefault(u => u.Id == id);
    }

    public User? GetByEmail(string email)
    {
        lock (store.Sync) return store.Users.FirstOrDefault(u => string.Equals(u.Email, email.Trim(), StringComparison.OrdinalIgnoreCase));
    }

    public IReadOnlyList<User> GetAll()
    {
        lock (store.Sync) return store.Users.ToList();
    }

    public void Add(User user)
    {
        lock (store.Sync) store.Users.Add(user);
    }

    public void Update(User user)
    {
        // Entities are tracked by reference in memory; this is the seam where an EF Core
        // implementation would call SaveChanges.
        lock (store.Sync) { }
    }
}
