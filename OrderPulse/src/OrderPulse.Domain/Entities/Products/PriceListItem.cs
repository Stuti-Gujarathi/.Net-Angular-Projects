using OrderPulse.Domain.Common;

namespace OrderPulse.Domain.Entities.Products;

public class PriceListItem : BaseEntity
{
    public int PriceListId { get; set; }
    public PriceList PriceList { get; set; } = default!;
    public int ProductId { get; set; }
    public Product Product { get; set; } = default!;
    public decimal Price { get; set; }
    public int MinQuantity { get; set; } = 1;
    public int? MaxQuantity { get; set; }
}
