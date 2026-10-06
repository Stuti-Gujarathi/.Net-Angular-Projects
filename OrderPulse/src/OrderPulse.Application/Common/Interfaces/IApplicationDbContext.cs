using Microsoft.EntityFrameworkCore;
using OrderPulse.Domain.Entities.Customers;
using OrderPulse.Domain.Entities.Identity;
using OrderPulse.Domain.Entities.Products;

namespace OrderPulse.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    // Identity
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<Permission> Permissions { get; }
    DbSet<UserRole> UserRoles { get; }
    DbSet<RolePermission> RolePermissions { get; }

    // Customers
    DbSet<Customer> Customers { get; }
    DbSet<CustomerAddress> CustomerAddresses { get; }
    DbSet<CustomerPriceList> CustomerPriceLists { get; }

    // Products
    DbSet<Product> Products { get; }
    DbSet<Category> Categories { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
