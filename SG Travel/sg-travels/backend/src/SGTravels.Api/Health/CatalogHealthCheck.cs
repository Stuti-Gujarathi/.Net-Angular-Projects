using SGTravels.Core.Journeys;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace SGTravels.Api.Health;

internal sealed class CatalogHealthCheck(IJourneyCatalog catalog) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var journeys = await catalog.GetAllAsync(cancellationToken);
            return journeys.Count > 0
                ? HealthCheckResult.Healthy($"{journeys.Count} journeys loaded.")
                : HealthCheckResult.Unhealthy("The journey catalogue is empty.");
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            return HealthCheckResult.Unhealthy("The journey catalogue failed to load.", ex);
        }
    }
}
