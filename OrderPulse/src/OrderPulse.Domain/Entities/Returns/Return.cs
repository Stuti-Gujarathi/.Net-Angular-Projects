using OrderPulse.Domain.Common;

namespace OrderPulse.Domain.Entities.Returns;

public class Return : BaseEntity
{
    public int OrderId { get; set; }
    public int CustomerId { get; set; }
    public string Reason { get; set; } = default!;
    public string Status { get; set; } = "Pending";

    public ICollection<ReturnItem> Items { get; set; } = new List<ReturnItem>();
}
