namespace OrderPulse.Domain.Exceptions;

public class InvalidOrderStateException : DomainException
{
    public InvalidOrderStateException(string currentState, string attemptedAction)
        : base($"Cannot perform '{attemptedAction}' when order is in state '{currentState}'.")
    {
    }
}
