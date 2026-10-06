namespace SGTravels.Infrastructure.Catalog;

public sealed class JourneyCatalogOptions
{
    public const string SectionName = "JourneyCatalog";

    /// <summary>Path to the journeys JSON file. Relative paths resolve from the app's output folder.</summary>
    public string DataFile { get; set; } = "Data/journeys.json";
}
