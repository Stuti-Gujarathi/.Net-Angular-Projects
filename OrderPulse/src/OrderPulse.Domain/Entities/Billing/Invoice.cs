using OrderPulse.Domain.Common;
using OrderPulse.Domain.Entities.Customers;
using OrderPulse.Domain.Enums;

namespace OrderPulse.Domain.Entities.Billing;

public class Invoice : BaseEntity
{
    public string InvoiceNumber { get; set; } = default!;
    public int OrderId { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = default!;

    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }

    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }

    public InvoiceStatus Status { get; set; } = InvoiceStatus.Generated;
}
