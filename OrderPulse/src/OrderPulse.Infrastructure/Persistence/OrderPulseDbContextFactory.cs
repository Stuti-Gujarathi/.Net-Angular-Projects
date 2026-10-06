using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace OrderPulse.Infrastructure.Persistence;

public class OrderPulseDbContextFactory : IDesignTimeDbContextFactory<OrderPulseDbContext>
{
    public OrderPulseDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<OrderPulseDbContext>();

        optionsBuilder.UseSqlServer(
    "Server=localhost;Database=OrderPulseDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true");
        return new OrderPulseDbContext(optionsBuilder.Options);
    }
}
