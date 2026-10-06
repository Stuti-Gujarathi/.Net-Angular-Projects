using OrderPulse.Domain.Common;
using OrderPulse.Domain.Enums;

namespace OrderPulse.Domain.Entities.Routes;

public class Route : BaseEntity
{
    public string RouteNumber { get; set; } = default!;
    public DateTime RouteDate { get; set; }
    public int? DriverId { get; set; }
    public int? VehicleId { get; set; }
    public RouteStatus Status { get; set; } = RouteStatus.Planned;
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }

    public ICollection<RouteStop> Stops { get; set; } = new List<RouteStop>();
}
