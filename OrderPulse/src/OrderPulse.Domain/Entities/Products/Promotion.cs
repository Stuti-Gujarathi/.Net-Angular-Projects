using OrderPulse.Domain.Common;

namespace OrderPulse.Domain.Entities.Products;

public class Promotion : BaseEntity
{
    public string Name { get; set; } = default!;
    public string PromotionType { get; set; } = default!;  // PERCENT, FLAT, BOGO
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal DiscountValue { get; set; }
    public int? ProductId { get; set; }
    public Product? Product { get; set; }
    public bool IsActive { get; set; } = true;
}
