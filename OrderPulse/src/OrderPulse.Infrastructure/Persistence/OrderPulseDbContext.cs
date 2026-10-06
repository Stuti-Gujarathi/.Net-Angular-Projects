using Microsoft.EntityFrameworkCore;
using OrderPulse.Application.Common.Interfaces;
using OrderPulse.Domain.Entities.Audit;
using OrderPulse.Domain.Entities.Billing;
using OrderPulse.Domain.Entities.Customers;
using OrderPulse.Domain.Entities.Fulfilment;
using OrderPulse.Domain.Entities.Identity;
using OrderPulse.Domain.Entities.Inventory;
using OrderPulse.Domain.Entities.Orders;
using OrderPulse.Domain.Entities.Products;
using OrderPulse.Domain.Entities.Returns;
using OrderPulse.Domain.Entities.Routes;

namespace OrderPulse.Infrastructure.Persistence;

public class OrderPulseDbContext : DbContext, IApplicationDbContext
{
    public OrderPulseDbContext(DbContextOptions<OrderPulseDbContext> options)
        : base(options)
    {
    }

    // Identity
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();

    // Customers
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<CustomerAddress> CustomerAddresses => Set<CustomerAddress>();
    public DbSet<CustomerPriceList> CustomerPriceLists => Set<CustomerPriceList>();

    // Products
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<PriceList> PriceLists => Set<PriceList>();
    public DbSet<PriceListItem> PriceListItems => Set<PriceListItem>();
    public DbSet<Promotion> Promotions => Set<Promotion>();

    // Inventory
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<Inventory> Inventories => Set<Inventory>();
    public DbSet<StockTransaction> StockTransactions => Set<StockTransaction>();

    // Orders
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    // Fulfilment
    public DbSet<PickList> PickLists => Set<PickList>();
    public DbSet<PickListItem> PickListItems => Set<PickListItem>();
    public DbSet<PackList> PackLists => Set<PackList>();
    public DbSet<Dispatch> Dispatches => Set<Dispatch>();

    // Routes & Delivery
    public DbSet<Route> Routes => Set<Route>();
    public DbSet<RouteStop> RouteStops => Set<RouteStop>();
    public DbSet<Delivery> Deliveries => Set<Delivery>();
    public DbSet<ProofOfDelivery> ProofsOfDelivery => Set<ProofOfDelivery>();

    // Billing
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<CreditNote> CreditNotes => Set<CreditNote>();

    // Returns
    public DbSet<Return> Returns => Set<Return>();
    public DbSet<ReturnItem> ReturnItems => Set<ReturnItem>();

    // Audit
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(OrderPulseDbContext).Assembly);
    }
}
