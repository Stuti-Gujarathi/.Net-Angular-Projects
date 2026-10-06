using OrderPulse.Domain.Common;

namespace OrderPulse.Domain.Entities.Customers;

public class CustomerAddress : BaseEntity
{
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = default!;
    public string AddressLine1 { get; set; } = default!;
    public string? AddressLine2 { get; set; }
    public string City { get; set; } = default!;
    public string State { get; set; } = default!;
    public string PostalCode { get; set; } = default!;
    public string? Country { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string AddressType { get; set; } = "Delivery";
}
