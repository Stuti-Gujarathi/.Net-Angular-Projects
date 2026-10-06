using OrderPulse.Domain.Common;

namespace OrderPulse.Domain.Entities.Billing;

public class CreditNote : BaseEntity
{
    public int InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = default!;
    public int CustomerId { get; set; }
    public string Reason { get; set; } = default!;
    public decimal Amount { get; set; }
    public string Status { get; set; } = "Issued";
}
