namespace AeroTrip.Api.Infrastructure;

/// <summary>
/// Single source of "now" for the app. AeroTrip operates on India Standard Time,
/// so business rules (holds, refunds, departure cut-offs) are evaluated in IST
/// regardless of the server's own time zone.
/// </summary>
public static class Clock
{
    public const int IstOffsetMinutes = 330;

    public static DateTime UtcNow => DateTime.UtcNow;

    public static DateTime IstNow => DateTime.SpecifyKind(DateTime.UtcNow.AddMinutes(IstOffsetMinutes), DateTimeKind.Unspecified);

    public static DateOnly IstToday => DateOnly.FromDateTime(IstNow);

    public static DateTime IstToUtc(DateTime ist) => DateTime.SpecifyKind(ist.AddMinutes(-IstOffsetMinutes), DateTimeKind.Utc);
}
