using OrderPulse.Domain.Common;
using OrderPulse.Domain.Entities.Customers;
using OrderPulse.Domain.Enums;
using OrderPulse.Domain.Exceptions;

namespace OrderPulse.Domain.Entities.Orders;

public class Order : BaseEntity, IAggregateRoot
{
    public string OrderNumber { get; set; } = default!;
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = default!;
    public int SalesRepId { get; set; }
    public int WarehouseId { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public DateTime? RequestedDeliveryDate { get; set; }

    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }

    public OrderStatus Status { get; private set; } = OrderStatus.Draft;
    public PaymentStatus PaymentStatus { get; private set; } = PaymentStatus.Pending;

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();

    // ---- State-machine methods ----

    public void Confirm()
    {
        if (Status != OrderStatus.Draft)
            throw new InvalidOrderStateException(Status.ToString(), nameof(Confirm));
        Status = OrderStatus.Confirmed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Allocate()
    {
        if (Status != OrderStatus.Confirmed)
            throw new InvalidOrderStateException(Status.ToString(), nameof(Allocate));
        Status = OrderStatus.Allocated;
        UpdatedAt = DateTime.UtcNow;
    }

    public void StartPicking()
    {
        if (Status != OrderStatus.Allocated && Status != OrderStatus.Confirmed)
            throw new InvalidOrderStateException(Status.ToString(), nameof(StartPicking));
        Status = OrderStatus.Picking;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkPicked()
    {
        if (Status != OrderStatus.Picking)
            throw new InvalidOrderStateException(Status.ToString(), nameof(MarkPicked));
        Status = OrderStatus.Picked;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkPacked()
    {
        if (Status != OrderStatus.Picked)
            throw new InvalidOrderStateException(Status.ToString(), nameof(MarkPacked));
        Status = OrderStatus.Packed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Dispatch()
    {
        if (Status != OrderStatus.Packed)
            throw new InvalidOrderStateException(Status.ToString(), nameof(Dispatch));
        Status = OrderStatus.Dispatched;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkDelivered()
    {
        if (Status != OrderStatus.Dispatched)
            throw new InvalidOrderStateException(Status.ToString(), nameof(MarkDelivered));
        Status = OrderStatus.Delivered;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkPartiallyDelivered()
    {
        if (Status != OrderStatus.Dispatched)
            throw new InvalidOrderStateException(Status.ToString(), nameof(MarkPartiallyDelivered));
        Status = OrderStatus.PartiallyDelivered;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status == OrderStatus.Delivered || Status == OrderStatus.Closed)
            throw new InvalidOrderStateException(Status.ToString(), nameof(Cancel));
        Status = OrderStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Close()
    {
        if (Status != OrderStatus.Delivered)
            throw new InvalidOrderStateException(Status.ToString(), nameof(Close));
        Status = OrderStatus.Closed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkPaid()
    {
        PaymentStatus = PaymentStatus.Paid;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkPartiallyPaid()
    {
        PaymentStatus = PaymentStatus.PartiallyPaid;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RecalculateTotals()
    {
        Subtotal = Items.Sum(i => i.UnitPrice * i.Quantity);
        TaxAmount = Items.Sum(i => i.Tax);
        DiscountAmount = Items.Sum(i => i.Discount);
        TotalAmount = Subtotal + TaxAmount - DiscountAmount;
    }
}
