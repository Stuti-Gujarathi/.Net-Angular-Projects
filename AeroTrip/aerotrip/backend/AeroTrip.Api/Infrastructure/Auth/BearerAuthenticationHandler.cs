using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace AeroTrip.Api.Infrastructure.Auth;

/// <summary>Reads "Authorization: Bearer &lt;jwt&gt;" and turns it into the request's ClaimsPrincipal.</summary>
public sealed class BearerAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    ITokenService tokens,
    IUserRepository users)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "Bearer";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var header = Request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(header) || !header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return Task.FromResult(AuthenticateResult.NoResult());

        var principal = tokens.ValidateToken(header["Bearer ".Length..].Trim(), SchemeName);
        if (principal is null)
            return Task.FromResult(AuthenticateResult.Fail("Invalid or expired token."));

        // Deactivated accounts lose access immediately, even with a still-valid token.
        var user = users.GetById(principal.GetUserId());
        if (user is null || !user.IsActive)
            return Task.FromResult(AuthenticateResult.Fail("Account is not active."));

        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(principal, SchemeName)));
    }

    protected override async Task HandleChallengeAsync(AuthenticationProperties properties)
    {
        Response.StatusCode = StatusCodes.Status401Unauthorized;
        await Response.WriteAsJsonAsync(new { status = 401, title = "Unauthorized", detail = "Please log in to continue." });
    }

    protected override async Task HandleForbiddenAsync(AuthenticationProperties properties)
    {
        Response.StatusCode = StatusCodes.Status403Forbidden;
        await Response.WriteAsJsonAsync(new { status = 403, title = "Forbidden", detail = "You don't have access to this area." });
    }
}
