using System.ComponentModel.DataAnnotations;

namespace AeroTrip.Api.DTOs;

public sealed class LoginRequest
{
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required] public string Password { get; set; } = string.Empty;
}

public sealed class RegisterRequest
{
    [Required, StringLength(80, MinimumLength = 2)] public string FullName { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required, RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Enter a 10-digit Indian mobile number.")] public string Phone { get; set; } = string.Empty;
    [Required, StringLength(64, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters.")] public string Password { get; set; } = string.Empty;
}

public sealed class UpdateProfileRequest
{
    [Required, StringLength(80, MinimumLength = 2)] public string FullName { get; set; } = string.Empty;
    [Required, RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Enter a 10-digit Indian mobile number.")] public string Phone { get; set; } = string.Empty;
}

public sealed class ChangePasswordRequest
{
    [Required] public string CurrentPassword { get; set; } = string.Empty;
    [Required, StringLength(64, MinimumLength = 8, ErrorMessage = "New password must be at least 8 characters.")] public string NewPassword { get; set; } = string.Empty;
}

public sealed record UserDto(Guid Id, string FullName, string Email, string Phone, UserRole Role, DateTime CreatedAt);

public sealed record AuthResponse(string Token, DateTime ExpiresAtUtc, UserDto User);
