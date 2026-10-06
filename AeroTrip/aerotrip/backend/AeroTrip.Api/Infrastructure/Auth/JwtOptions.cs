namespace AeroTrip.Api.Infrastructure.Auth;

public sealed class JwtOptions
{
    public string Issuer { get; set; } = "AeroTrip.Api";
    public string Audience { get; set; } = "AeroTrip.Web";
    public string Secret { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; } = 480;
}
