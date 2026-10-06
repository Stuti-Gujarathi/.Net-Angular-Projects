namespace OrderPulse.Domain.Exceptions;

public class CreditLimitExceededException : DomainException
{
    public CreditLimitExceededException(decimal limit, decimal requested)
        : base($"Credit limit exceeded. Limit: {limit:C}, Requested: {requested:C}")
    {
    }
}