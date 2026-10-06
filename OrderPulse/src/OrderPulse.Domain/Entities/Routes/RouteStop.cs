using OrderPulse.Domain.Common;

namespace OrderPulse.Domain.Entities.Routes;

public class RouteStop : BaseEntity
{
    public int RouteId { get; set; }
    public Route Route { get; set; } = default!;
    public int CustomerId { get; set; }
    public int? OrderId { get; set; }
    public int SequenceNumber { get; set; }
    public DateTime? EstimatedArrival { get; set; }
    public DateTime? ActualArrival { get; set; }
    public string Status { get; set; } = "Pending";
}
