using OrderPulse.Domain.Common;

namespace OrderPulse.Domain.Entities.Returns;

public class ReturnItem : BaseEntity
{
    public int ReturnId { get; set; }
    public Return Return { get; set; } = default!;
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string? Reason { get; set; }
}
