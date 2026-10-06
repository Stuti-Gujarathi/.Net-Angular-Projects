namespace SGTravels.Core.Common;

public enum ErrorKind
{
    Validation,
    NotFound,
}

/// <summary>A business-rule failure tied to the request field that caused it.</summary>
public sealed record Error(ErrorKind Kind, string Field, string Message);

/// <summary>Success-or-error return type so services never throw for expected outcomes.</summary>
public sealed class Result<T>
{
    private Result(T? value, Error? error)
    {
        Value = value;
        Error = error;
    }

    public T? Value { get; }

    public Error? Error { get; }

    public bool IsSuccess => Error is null;

    public static Result<T> Success(T value) => new(value, null);

    public static Result<T> Failure(Error error) => new(default, error);
}
