namespace OrderPulse.Domain.Enums;

public enum PaymentStatus
{
    Pending = 0,
    PartiallyPaid = 1,
    Paid = 2,
    Failed = 3,
    Overdue = 4
}