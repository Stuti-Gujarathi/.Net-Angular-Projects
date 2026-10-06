using OrderPulse.Domain.Entities.Identity;

namespace OrderPulse.Infrastructure.Persistence.Seed;

public static class RoleSeeder
{
    public const string SuperAdmin       = "SuperAdmin";
    public const string OperationsAdmin  = "OperationsAdmin";
    public const string SalesManager     = "SalesManager";
    public const string SalesRep         = "SalesRep";
    public const string WarehouseManager = "WarehouseManager";
    public const string WarehouseStaff   = "WarehouseStaff";
    public const string DeliveryDriver   = "DeliveryDriver";
    public const string Finance          = "Finance";

    public static List<Role> GetRoles() => new()
    {
        new Role { Name = SuperAdmin,       Description = "Full system access", IsSystemRole = true },
        new Role { Name = OperationsAdmin,  Description = "Business operations management", IsSystemRole = true },
        new Role { Name = SalesManager,     Description = "Manages sales team", IsSystemRole = true },
        new Role { Name = SalesRep,         Description = "Creates orders", IsSystemRole = true },
        new Role { Name = WarehouseManager, Description = "Manages warehouse operations", IsSystemRole = true },
        new Role { Name = WarehouseStaff,   Description = "Picks and packs orders", IsSystemRole = true },
        new Role { Name = DeliveryDriver,   Description = "Delivers orders to customers", IsSystemRole = true },
        new Role { Name = Finance,          Description = "Manages invoices and payments", IsSystemRole = true },
    };

    public static Dictionary<string, string[]> GetRolePermissions() => new()
    {
        [SuperAdmin] = Array.Empty<string>(),

        [OperationsAdmin] = new[]
        {
            "Customers.Create", "Customers.View", "Customers.Update", "Customers.Delete",
            "Products.Create", "Products.View", "Products.Update", "Products.Delete",
            "Orders.Create", "Orders.View", "Orders.Update", "Orders.Cancel", "Orders.Confirm",
            "Inventory.View", "Inventory.Adjust", "Inventory.Transfer",
            "Warehouses.Create", "Warehouses.View", "Warehouses.Update", "Warehouses.Delete",
            "Fulfilment.View", "Fulfilment.Pick", "Fulfilment.Pack", "Fulfilment.Dispatch",
            "Routes.Create", "Routes.View", "Routes.Update", "Routes.Delete", "Routes.Assign",
            "Deliveries.View", "Deliveries.Confirm", "Deliveries.Fail", "Deliveries.CapturePOD",
            "Invoices.View", "Payments.View", "Returns.View",
            "Reports.View", "Reports.ViewFinancial",
            "Dashboard.View"
        },

        [SalesManager] = new[]
        {
            "Customers.Create", "Customers.View", "Customers.Update",
            "Products.View",
            "Orders.Create", "Orders.View", "Orders.Update", "Orders.Cancel", "Orders.Confirm",
            "Inventory.View",
            "Reports.View",
            "Dashboard.View"
        },

        [SalesRep] = new[]
        {
            "Customers.View",
            "Products.View",
            "Orders.Create", "Orders.View",
            "Inventory.View",
            "Dashboard.View"
        },

        [WarehouseManager] = new[]
        {
            "Orders.View", "Orders.Update",
            "Products.View",
            "Inventory.View", "Inventory.Adjust", "Inventory.Transfer",
            "Warehouses.View",
            "Fulfilment.View", "Fulfilment.Pick", "Fulfilment.Pack", "Fulfilment.Dispatch",
            "Dashboard.View"
        },

        [WarehouseStaff] = new[]
        {
            "Orders.View",
            "Products.View",
            "Inventory.View",
            "Fulfilment.View", "Fulfilment.Pick", "Fulfilment.Pack",
            "Dashboard.View"
        },

        [DeliveryDriver] = new[]
        {
            "Orders.View",
            "Products.View",
            "Deliveries.View", "Deliveries.Confirm", "Deliveries.Fail", "Deliveries.CapturePOD",
            "Dashboard.View"
        },

        [Finance] = new[]
        {
            "Customers.View",
            "Orders.View",
            "Invoices.Create", "Invoices.View", "Invoices.Void",
            "Payments.View", "Payments.Create", "Payments.Refund",
            "Returns.View", "Returns.Approve",
            "Reports.View", "Reports.ViewFinancial",
            "Dashboard.View"
        }
    };
}
