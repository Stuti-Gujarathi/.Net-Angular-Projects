using OrderPulse.Domain.Common;

namespace OrderPulse.Domain.Entities.Fulfilment;

public class PickList : BaseEntity
{
    public string PickListNumber { get; set; } = default!;
    public int OrderId { get; set; }
    public int WarehouseId { get; set; }
    public int? AssignedTo { get; set; }
    public string Status { get; set; } = "Pending"; // Pending / InProgress / Completed
    public DateTime? PickedAt { get; set; }

    public ICollection<PickListItem> Items { get; set; } = new List<PickListItem>();
}
