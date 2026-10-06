using OrderPulse.Domain.Entities.Identity;

namespace OrderPulse.Infrastructure.Persistence.Seed;

public static class PermissionSeeder
{
    public static List<Permission> GetPermissions()
    {
        var modules = new (string Module, string[] Actions)[]
        {
            ("Orders",        new[] { "Create", "View", "Update", "Cancel", "Confirm" }),
            ("Customers",     new[] { "Create", "View", "Update", "Delete" }),
            ("Products",      new[] { "Create", "View", "Update", "Delete" }),
            ("Inventory",     new[] { "View", "Adjust", "Transfer" }),
            ("Warehouses",    new[] { "Create", "View", "Update", "Delete" }),
            ("Fulfilment",    new[] { "View", "Pick", "Pack", "Dispatch" }),
            ("Routes",        new[] { "Create", "View", "Update", "Delete", "Assign" }),
            ("Deliveries",    new[] { "View", "Confirm", "Fail", "CapturePOD" }),
            ("Invoices",      new[] { "Create", "View", "Void" }),
            ("Payments",      new[] { "View", "Create", "Refund" }),
            ("Returns",       new[] { "Create", "View", "Approve" }),
            ("Reports",       new[] { "View", "ViewFinancial" }),
            ("Users",         new[] { "Create", "View", "Update", "Delete" }),
            ("Roles",         new[] { "Create", "View", "Update", "Delete" }),
            ("Dashboard",     new[] { "View" }),
            ("AuditLogs",     new[] { "View" }),
        };

        var permissions = new List<Permission>();

        foreach (var (module, actions) in modules)
        {
            foreach (var action in actions)
            {
                permissions.Add(new Permission
                {
                    Code = $"{module}.{action}",
                    Name = $"{action} {module}",
                    Module = module
                });
            }
        }

        return permissions;
    }
}
