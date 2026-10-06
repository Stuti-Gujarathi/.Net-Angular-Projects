namespace OrderPulse.Application.Common.Interfaces;

public interface ICurrentUserService
{
    int? UserId { get; }
    string? Email { get; }
    List<string> Permissions { get; }
    bool IsAuthenticated { get; }
}
