using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace AeroTrip.Api.Infrastructure.Errors;

/// <summary>Turns domain exceptions into RFC 7807 problem details with a readable "detail" for the UI.</summary>
public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken ct)
    {
        var (status, title, detail) = exception switch
        {
            AppException app => (app.StatusCode, app.Title, app.Message),
            _ => (StatusCodes.Status500InternalServerError, "Server error", "Something went wrong on our side. Please try again.")
        };

        if (status >= 500)
            logger.LogError(exception, "Unhandled exception for {Path}", context.Request.Path);

        context.Response.StatusCode = status;
        await context.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        }, ct);
        return true;
    }
}
