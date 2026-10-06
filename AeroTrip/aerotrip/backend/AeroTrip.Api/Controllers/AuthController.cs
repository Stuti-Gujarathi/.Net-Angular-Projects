using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AeroTrip.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IAuthService auth) : ControllerBase
{
    [HttpPost("register")]
    public ActionResult<AuthResponse> Register(RegisterRequest request) => Ok(auth.Register(request));

    [HttpPost("login")]
    public ActionResult<AuthResponse> Login(LoginRequest request) => Ok(auth.Login(request));

    [Authorize]
    [HttpGet("me")]
    public ActionResult<UserDto> Me() => Ok(auth.GetProfile(User.GetUserId()));

    [Authorize]
    [HttpPut("me")]
    public ActionResult<UserDto> UpdateProfile(UpdateProfileRequest request) => Ok(auth.UpdateProfile(User.GetUserId(), request));

    [Authorize]
    [HttpPost("change-password")]
    public IActionResult ChangePassword(ChangePasswordRequest request)
    {
        auth.ChangePassword(User.GetUserId(), request);
        return NoContent();
    }
}
