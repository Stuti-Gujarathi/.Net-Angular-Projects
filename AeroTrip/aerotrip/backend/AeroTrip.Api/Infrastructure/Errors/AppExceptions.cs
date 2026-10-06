namespace AeroTrip.Api.Infrastructure.Errors;

public abstract class AppException(int statusCode, string title, string message) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
    public string Title { get; } = title;
}

public sealed class NotFoundException(string message) : AppException(StatusCodes.Status404NotFound, "Not found", message);

public sealed class BadRequestException(string message) : AppException(StatusCodes.Status400BadRequest, "Invalid request", message);

public sealed class ConflictException(string message) : AppException(StatusCodes.Status409Conflict, "Conflict", message);

public sealed class ForbiddenException(string message) : AppException(StatusCodes.Status403Forbidden, "Forbidden", message);

public sealed class UnauthorizedAppException(string message) : AppException(StatusCodes.Status401Unauthorized, "Unauthorized", message);
