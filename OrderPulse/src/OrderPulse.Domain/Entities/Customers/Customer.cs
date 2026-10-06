using OrderPulse.Domain.Common;
using OrderPulse.Domain.Entities.Orders;

namespace OrderPulse.Domain.Entities.Customers;

public class Customer : BaseEntity
{
    public string CustomerCode { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public decimal CreditLimit { get; set; }
    public int PaymentTermsDays { get; set; } = 30;
    public bool IsActive { get; set; } = true;

    public ICollection<CustomerAddress> Addresses { get; set; } = new List<CustomerAddress>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
