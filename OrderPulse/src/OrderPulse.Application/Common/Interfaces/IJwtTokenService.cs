using OrderPulse.Domain.Entities.Identity;

namespace OrderPulse.Application.Common.Interfaces;

public record JwtTokenResult(string Token, DateTime ExpiresAt);

public interface IJwtTokenService
{
    JwtTokenResult GenerateToken(User user, IEnumerable<string> roles, IEnumerable<string> permissions);
}
