using SGTravels.Core.Journeys;
using Microsoft.Extensions.Hosting;

namespace SGTravels.Infrastructure.Catalog;

/// <summary>Loads and validates the catalogue during startup so a bad JSON edit stops the deploy, not a customer.</summary>
internal sealed class CatalogWarmup(IJourneyCatalog catalog) : IHostedService
{
    public Task StartAsync(CancellationToken cancellationToken) => catalog.GetAllAsync(cancellationToken);

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
