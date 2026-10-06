using OrderPulse.Domain.Common;

namespace OrderPulse.Domain.Entities.Products;

public class Product : BaseEntity
{
    public string SKU { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public Category? Category { get; set; }
    public string UnitOfMeasure { get; set; } = "EA";
    public decimal TaxRate { get; set; }
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public bool IsActive { get; set; } = true;
}
