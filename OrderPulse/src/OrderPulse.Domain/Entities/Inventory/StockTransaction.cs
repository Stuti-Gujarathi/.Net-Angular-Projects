using OrderPulse.Domain.Common;
using OrderPulse.Domain.Enums;

namespace OrderPulse.Domain.Entities.Inventory;

public class StockTransaction : BaseEntity
{
    public int ProductId { get; set; }
    public Entities.Products.Product Product { get; set; } = default!;
    public int WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = default!;
    public StockTransactionType TransactionType { get; set; }
    public int Quantity { get; set; }
    public string? ReferenceType { get; set; }
    public int? ReferenceId { get; set; }
    public string? Notes { get; set; }
}
