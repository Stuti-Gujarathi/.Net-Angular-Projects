using OrderPulse.Domain.Common;
using OrderPulse.Domain.Enums;

namespace OrderPulse.Domain.Entities.Routes;

public class Delivery : BaseEntity
{
    public int OrderId { get; set; }
    public int DriverId { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DeliveryStatus Status { get; set; } = DeliveryStatus.Pending;
    public string? ReceivedBy { get; set; }
    public string? Notes { get; set; }
}
