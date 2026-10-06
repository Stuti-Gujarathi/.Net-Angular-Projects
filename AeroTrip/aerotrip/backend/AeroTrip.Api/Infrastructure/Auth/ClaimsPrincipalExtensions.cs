using System.Security.Claims;

namespace AeroTrip.Api.Infrastructure.Auth;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal) =>
        Guid.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
            ? id
            : throw new UnauthorizedAppException("Please log in to continue.");

    public static bool IsAdmin(this ClaimsPrincipal principal) => principal.IsInRole(nameof(UserRole.Admin));
}
