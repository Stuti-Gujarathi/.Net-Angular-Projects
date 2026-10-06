namespace AeroTrip.Api.Services;

/// <summary>Releases seats from unpaid bookings once their hold window passes.</summary>
public sealed class HoldExpiryWorker(IServiceScopeFactory scopes, ILogger<HoldExpiryWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(30));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                using var scope = scopes.CreateScope();
                var expired = scope.ServiceProvider.GetRequiredService<IBookingService>().ExpireStaleHolds();
                if (expired > 0) logger.LogInformation("Released seats from {Count} expired holds", expired);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Hold expiry sweep failed");
            }
        }
    }
}
