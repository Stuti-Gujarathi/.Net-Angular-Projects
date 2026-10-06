using OrderPulse.Domain.Common;

namespace OrderPulse.Domain.Entities.Products;

public class PriceList : BaseEntity
{
    public string Name { get; set; } = default!;
    public string? Description { get; set; }

    public ICollection<PriceListItem> Items { get; set; } = new List<PriceListItem>();
}
