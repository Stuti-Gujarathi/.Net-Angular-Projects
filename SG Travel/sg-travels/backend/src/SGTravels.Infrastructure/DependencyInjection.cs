using SGTravels.Core.Enquiries;
using SGTravels.Core.Journeys;
using SGTravels.Infrastructure.Catalog;
using SGTravels.Infrastructure.Enquiries;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace SGTravels.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddSGTravelsInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services
            .AddOptions<JourneyCatalogOptions>()
            .Bind(configuration.GetSection(JourneyCatalogOptions.SectionName))
            .Validate(o => !string.IsNullOrWhiteSpace(o.DataFile), "JourneyCatalog:DataFile must be set.")
            .ValidateOnStart();

        services.AddSingleton<IJourneyCatalog, JsonJourneyCatalog>();
        services.AddSingleton<IEnquiryStore, InMemoryEnquiryStore>();
        services.AddHostedService<CatalogWarmup>();

        return services;
    }
}
