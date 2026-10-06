using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OrderPulse.Domain.Entities.Identity;
using OrderPulse.Domain.Entities.Inventory;
using OrderPulse.Domain.Entities.Products;

namespace OrderPulse.Infrastructure.Persistence.Seed;

public class DbInitialiser
{
    private readonly OrderPulseDbContext _db;
    private readonly ILogger<DbInitialiser> _logger;

    public DbInitialiser(OrderPulseDbContext db, ILogger<DbInitialiser> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task InitialiseAsync(CancellationToken ct = default)
    {
        // 1. Permissions
        if (!await _db.Permissions.AnyAsync(ct))
        {
            var permissions = PermissionSeeder.GetPermissions();
            _db.Permissions.AddRange(permissions);
            await _db.SaveChangesAsync(ct);
            _logger.LogInformation("Seeded {Count} permissions.", permissions.Count);
        }

        // 2. Roles
        if (!await _db.Roles.AnyAsync(ct))
        {
            var roles = RoleSeeder.GetRoles();
            _db.Roles.AddRange(roles);
            await _db.SaveChangesAsync(ct);
            _logger.LogInformation("Seeded {Count} roles.", roles.Count);
        }

        // 3. RolePermissions
        if (!await _db.RolePermissions.AnyAsync(ct))
        {
            var allPerms = await _db.Permissions.ToListAsync(ct);
            var allRoles = await _db.Roles.ToListAsync(ct);
            var rolePermissionMap = RoleSeeder.GetRolePermissions();
            var assignments = new List<RolePermission>();

            // SuperAdmin gets ALL permissions
            var superAdmin = allRoles.First(r => r.Name == RoleSeeder.SuperAdmin);
            foreach (var p in allPerms)
                assignments.Add(new RolePermission { RoleId = superAdmin.Id, PermissionId = p.Id });

            // Other roles get their specific ones
            foreach (var (roleName, codes) in rolePermissionMap)
            {
                if (roleName == RoleSeeder.SuperAdmin) continue;
                var role = allRoles.FirstOrDefault(r => r.Name == roleName);
                if (role is null) continue;

                foreach (var code in codes)
                {
                    var perm = allPerms.FirstOrDefault(p => p.Code == code);
                    if (perm is not null)
                        assignments.Add(new RolePermission { RoleId = role.Id, PermissionId = perm.Id });
                }
            }

            _db.RolePermissions.AddRange(assignments);
            await _db.SaveChangesAsync(ct);
            _logger.LogInformation("Seeded {Count} role-permission assignments.", assignments.Count);
        }

        // 4. Default admin user
        if (!await _db.Users.AnyAsync(ct))
        {
            var admin = new User
            {
                FirstName = "System",
                LastName = "Admin",
                Email = "admin@orderpulse.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Phone = "+91-9999999999",
                IsActive = true
            };
            _db.Users.Add(admin);
            await _db.SaveChangesAsync(ct);

            var superAdminRole = await _db.Roles.FirstAsync(r => r.Name == RoleSeeder.SuperAdmin, ct);
            _db.UserRoles.Add(new UserRole { UserId = admin.Id, RoleId = superAdminRole.Id });
            await _db.SaveChangesAsync(ct);
            _logger.LogInformation("Seeded default admin: admin@orderpulse.com / Admin@123");
        }

        // 5. Demo warehouses
        if (!await _db.Warehouses.AnyAsync(ct))
        {
            _db.Warehouses.AddRange(
                new Warehouse { Name = "Pune Main Warehouse", Code = "WH-PUN", Address = "Hinjewadi, Pune" },
                new Warehouse { Name = "Mumbai Warehouse", Code = "WH-MUM", Address = "Andheri, Mumbai" }
            );
            await _db.SaveChangesAsync(ct);
            _logger.LogInformation("Seeded 2 warehouses.");
        }

        // 6. Demo categories + products
        if (!await _db.Products.AnyAsync(ct))
        {
            var beverages = new Category { Name = "Beverages", Description = "Drinks and liquids" };
            var snacks = new Category { Name = "Snacks", Description = "Chips, biscuits, etc." };
            _db.Categories.AddRange(beverages, snacks);
            await _db.SaveChangesAsync(ct);

            var products = new List<Product>
            {
                new() { SKU = "COKE-500",   Name = "Coca Cola 500ml",   CategoryId = beverages.Id, SellingPrice = 40m, CostPrice = 32m, TaxRate = 0.18m },
                new() { SKU = "PEPSI-500",  Name = "Pepsi 500ml",       CategoryId = beverages.Id, SellingPrice = 35m, CostPrice = 28m, TaxRate = 0.18m },
                new() { SKU = "WATER-1L",   Name = "Mineral Water 1L",  CategoryId = beverages.Id, SellingPrice = 20m, CostPrice = 14m, TaxRate = 0.18m },
                new() { SKU = "ENERGY-250", Name = "Energy Drink 250ml",CategoryId = beverages.Id, SellingPrice = 65m, CostPrice = 50m, TaxRate = 0.18m },
                new() { SKU = "CHIPS-50",   Name = "Potato Chips 50g",  CategoryId = snacks.Id,    SellingPrice = 25m, CostPrice = 18m, TaxRate = 0.18m },
            };
            _db.Products.AddRange(products);
            await _db.SaveChangesAsync(ct);
            _logger.LogInformation("Seeded {Count} products.", products.Count);
        }
    }
}
