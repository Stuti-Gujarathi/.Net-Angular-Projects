namespace AeroTrip.Api.Services;

public interface IAuthService
{
    AuthResponse Register(RegisterRequest request);
    AuthResponse Login(LoginRequest request);
    UserDto GetProfile(Guid userId);
    UserDto UpdateProfile(Guid userId, UpdateProfileRequest request);
    void ChangePassword(Guid userId, ChangePasswordRequest request);
}

public sealed class AuthService(IUserRepository users, ITokenService tokens) : IAuthService
{
    public AuthResponse Register(RegisterRequest request)
    {
        if (users.GetByEmail(request.Email) is not null)
            throw new ConflictException("An account with this email already exists. Try logging in.");

        var (hash, salt) = PasswordHasher.Hash(request.Password);
        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Phone = request.Phone.Trim(),
            PasswordHash = hash,
            PasswordSalt = salt,
            Role = UserRole.User,
            CreatedAt = Clock.IstNow,
            LastLoginAt = Clock.IstNow
        };
        users.Add(user);
        return Issue(user);
    }

    public AuthResponse Login(LoginRequest request)
    {
        var user = users.GetByEmail(request.Email);
        if (user is null || !PasswordHasher.Verify(request.Password, user.PasswordHash, user.PasswordSalt))
            throw new UnauthorizedAppException("Email or password is incorrect.");
        if (!user.IsActive)
            throw new ForbiddenException("This account has been deactivated. Contact support@aerotrip.com.");

        user.LastLoginAt = Clock.IstNow;
        users.Update(user);
        return Issue(user);
    }

    public UserDto GetProfile(Guid userId) =>
        (users.GetById(userId) ?? throw new NotFoundException("Account not found.")).ToDto();

    public UserDto UpdateProfile(Guid userId, UpdateProfileRequest request)
    {
        var user = users.GetById(userId) ?? throw new NotFoundException("Account not found.");
        user.FullName = request.FullName.Trim();
        user.Phone = request.Phone.Trim();
        users.Update(user);
        return user.ToDto();
    }

    public void ChangePassword(Guid userId, ChangePasswordRequest request)
    {
        var user = users.GetById(userId) ?? throw new NotFoundException("Account not found.");
        if (!PasswordHasher.Verify(request.CurrentPassword, user.PasswordHash, user.PasswordSalt))
            throw new BadRequestException("Your current password is incorrect.");
        (user.PasswordHash, user.PasswordSalt) = PasswordHasher.Hash(request.NewPassword);
        users.Update(user);
    }

    private AuthResponse Issue(User user)
    {
        var (token, expires) = tokens.CreateToken(user);
        return new AuthResponse(token, expires, user.ToDto());
    }
}
