namespace OrderPulse.Domain.Enums;

public enum OrderStatus
{
    Draft = 0,
    Confirmed = 1,
    Allocated = 2,
    Picking = 3,
    Picked = 4,
    Packed = 5,
    Dispatched = 6,
    PartiallyDelivered = 7,
    Delivered = 8,
    Cancelled = 9,
    Closed = 10
}