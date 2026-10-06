namespace OrderPulse.Domain.Enums;

public enum StockTransactionType
{
    StockReceived = 0,
    OrderReserved = 1,
    StockPicked = 2,
    StockReturned = 3,
    StockAdjusted = 4,
    StockReleased = 5,
    StockTransferred = 6
}