using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace AeroTrip.Api.Infrastructure.Auth;

public interface ITokenService
{
    (string Token, DateTime ExpiresAtUtc) CreateToken(User user);
    ClaimsPrincipal? ValidateToken(string token, string authenticationScheme);
}

/// <summary>
/// Standards-compliant HS256 JSON Web Tokens, implemented with the framework's crypto primitives
/// so the API needs no external packages. Tokens can be inspected on jwt.io.
/// </summary>
public sealed class JwtTokenService(IOptions<JwtOptions> options) : ITokenService
{
    private readonly JwtOptions _options = options.Value;
    private byte[] Key => Encoding.UTF8.GetBytes(_options.Secret);

    public (string Token, DateTime ExpiresAtUtc) CreateToken(User user)
    {
        var now = DateTimeOffset.UtcNow;
        var expires = now.AddMinutes(_options.ExpiryMinutes);

        var header = new Dictionary<string, object> { ["alg"] = "HS256", ["typ"] = "JWT" };
        var payload = new Dictionary<string, object>
        {
            ["sub"] = user.Id.ToString(),
            ["email"] = user.Email,
            ["name"] = user.FullName,
            ["role"] = user.Role.ToString(),
            ["iss"] = _options.Issuer,
            ["aud"] = _options.Audience,
            ["iat"] = now.ToUnixTimeSeconds(),
            ["nbf"] = now.ToUnixTimeSeconds(),
            ["exp"] = expires.ToUnixTimeSeconds()
        };

        var unsigned = $"{Base64Url(JsonSerializer.SerializeToUtf8Bytes(header))}.{Base64Url(JsonSerializer.SerializeToUtf8Bytes(payload))}";
        var signature = Base64Url(HMACSHA256.HashData(Key, Encoding.ASCII.GetBytes(unsigned)));
        return ($"{unsigned}.{signature}", expires.UtcDateTime);
    }

    public ClaimsPrincipal? ValidateToken(string token, string authenticationScheme)
    {
        var parts = token.Split('.');
        if (parts.Length != 3) return null;

        var expectedSig = HMACSHA256.HashData(Key, Encoding.ASCII.GetBytes($"{parts[0]}.{parts[1]}"));
        byte[] providedSig;
        try { providedSig = FromBase64Url(parts[2]); } catch { return null; }
        if (!CryptographicOperations.FixedTimeEquals(expectedSig, providedSig)) return null;

        JsonElement payload;
        try { payload = JsonSerializer.Deserialize<JsonElement>(FromBase64Url(parts[1])); } catch { return null; }

        var nowUnix = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        if (!payload.TryGetProperty("exp", out var exp) || exp.GetInt64() < nowUnix) return null;
        if (payload.TryGetProperty("nbf", out var nbf) && nbf.GetInt64() > nowUnix + 30) return null;
        if (!payload.TryGetProperty("iss", out var iss) || iss.GetString() != _options.Issuer) return null;
        if (!payload.TryGetProperty("aud", out var aud) || aud.GetString() != _options.Audience) return null;

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, payload.GetProperty("sub").GetString()!),
            new(ClaimTypes.Email, payload.GetProperty("email").GetString()!),
            new(ClaimTypes.Name, payload.GetProperty("name").GetString()!),
            new(ClaimTypes.Role, payload.GetProperty("role").GetString()!)
        };
        var identity = new ClaimsIdentity(claims, authenticationScheme, ClaimTypes.Name, ClaimTypes.Role);
        return new ClaimsPrincipal(identity);
    }

    private static string Base64Url(byte[] bytes) =>
        Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    private static byte[] FromBase64Url(string s)
    {
        var padded = s.Replace('-', '+').Replace('_', '/');
        padded += (padded.Length % 4) switch { 2 => "==", 3 => "=", _ => "" };
        return Convert.FromBase64String(padded);
    }
}
