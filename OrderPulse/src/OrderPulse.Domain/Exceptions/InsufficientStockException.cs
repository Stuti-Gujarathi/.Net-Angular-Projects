namespace OrderPulse.Domain.Exceptions;

public class InsufficientStockException : DomainException
{
    public InsufficientStockException(int productId, int requested, int available)
        : base($"Insufficient stock for product {productId}. Requested: {requested}, Available: {available}")
    {
    }
}