using OrderPulse.Domain.Common;

namespace OrderPulse.Domain.Entities.Fulfilment;

public class PickListItem : BaseEntity
{
    public int PickListId { get; set; }
    public PickList PickList { get; set; } = default!;
    public int OrderItemId { get; set; }
    public int ProductId { get; set; }
    public int RequestedQuantity { get; set; }
    public int PickedQuantity { get; set; }
}
