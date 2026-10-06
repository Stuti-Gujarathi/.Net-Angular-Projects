using OrderPulse.Domain.Common;

namespace OrderPulse.Domain.Entities.Fulfilment;

public class Dispatch : BaseEntity
{
    public int OrderId { get; set; }
    public int? RouteId { get; set; }
    public int? DriverId { get; set; }
    public int? VehicleId { get; set; }
    public DateTime? DispatchedAt { get; set; }
    public string Status { get; set; } = "Pending";
}
