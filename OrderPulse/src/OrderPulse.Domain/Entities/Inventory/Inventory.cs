namespace OrderPulse.Domain.Entities.Inventory;

public class Inventory
{
    public int Id { get; set; }
    public int WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = default!;
    public int ProductId { get; set; }
    public Entities.Products.Product Product { get; set; } = default!;

    public int AvailableQuantity { get; set; }
    public int ReservedQuantity { get; set; }
    public int DamagedQuantity { get; set; }
    public int ReorderLevel { get; set; }
}
