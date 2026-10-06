using OrderPulse.Domain.Common;

namespace OrderPulse.Domain.Entities.Fulfilment;

public class PackList : BaseEntity
{
    public int OrderId { get; set; }
    public int? PackedBy { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime? PackedAt { get; set; }
}
