using OrderPulse.Domain.Common;

namespace OrderPulse.Domain.Entities.Customers;

public class CustomerPriceList : BaseEntity
{
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = default!;
    public int PriceListId { get; set; }
    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
}
