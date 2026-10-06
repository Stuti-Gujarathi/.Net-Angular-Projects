using OrderPulse.Domain.Common;

namespace OrderPulse.Domain.Entities.Routes;

public class ProofOfDelivery : BaseEntity
{
    public int DeliveryId { get; set; }
    public Delivery Delivery { get; set; } = default!;
    public string? SignatureImagePath { get; set; }   // stored path, not blob
    public string ReceivedBy { get; set; } = default!;
    public DateTime DeliveredAt { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
}
