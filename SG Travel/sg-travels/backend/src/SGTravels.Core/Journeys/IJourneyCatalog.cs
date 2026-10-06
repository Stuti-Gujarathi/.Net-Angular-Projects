namespace SGTravels.Core.Journeys;

/// <summary>Read-only source of journeys. Swap the JSON implementation for a CMS or database later.</summary>
public interface IJourneyCatalog
{
    Task<IReadOnlyList<Journey>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<Journey?> FindAsync(string slug, CancellationToken cancellationToken = default);
}
