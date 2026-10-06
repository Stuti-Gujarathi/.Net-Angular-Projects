using Microsoft.EntityFrameworkCore;
using OrderPulse.Application.Common.Interfaces;
using OrderPulse.Application.Features.Auth.Dtos;

namespace OrderPulse.Application.Features.Auth;

public class LoginService
{
    private readonly IApplicationDbContext _db;
    private readonly IJwtTokenService _jwt;

    public LoginService(IApplicationDbContext db, IJwtTokenService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Email == request.Email, ct);

        if (user is null || !user.IsActive) return null;

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToList();

        var jwtResult = _jwt.GenerateToken(user, roles, permissions);

        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return new AuthResponse
        {
            Token = jwtResult.Token,
            ExpiresAt = jwtResult.ExpiresAt,
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Roles = roles,
            Permissions = permissions
        };
    }
}
