using OrderPulse.Domain.Common;

namespace OrderPulse.Domain.Entities.Inventory;

public class Warehouse : BaseEntity
{
    public string Name { get; set; } = default!;
    public string Code { get; set; } = default!;
    public string? Address { get; set; }
    public int? ManagerId { get; set; }
}
