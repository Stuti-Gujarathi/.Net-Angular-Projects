using System.Text.Json;
using System.Text.Json.Serialization;
using SGTravels.Core.Feelings;
using SGTravels.Core.Journeys;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace SGTravels.Infrastructure.Catalog;

/// <summary>
/// Loads the journey catalogue from a JSON file once, validates it, and serves it from memory.
/// </summary>
public sealed class JsonJourneyCatalog : IJourneyCatalog
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web)
    {
        ReadCommentHandling = JsonCommentHandling.Skip,
        AllowTrailingCommas = true,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    private readonly Lazy<Task<Catalog>> _catalog;
    private readonly ILogger<JsonJourneyCatalog> _logger;

    public JsonJourneyCatalog(IOptions<JourneyCatalogOptions> options, ILogger<JsonJourneyCatalog> logger)
    {
        ArgumentNullException.ThrowIfNull(options);
        _logger = logger;

        var configured = options.Value.DataFile;
        var path = Path.IsPathRooted(configured) ? configured : Path.Combine(AppContext.BaseDirectory, configured);

        _catalog = new Lazy<Task<Catalog>>(() => LoadAsync(path), LazyThreadSafetyMode.ExecutionAndPublication);
    }

    public async Task<IReadOnlyList<Journey>> GetAllAsync(CancellationToken cancellationToken = default) =>
        (await _catalog.Value.WaitAsync(cancellationToken).ConfigureAwait(false)).All;

    public async Task<Journey?> FindAsync(string slug, CancellationToken cancellationToken = default)
    {
        var catalog = await _catalog.Value.WaitAsync(cancellationToken).ConfigureAwait(false);
        return catalog.BySlug.GetValueOrDefault(slug);
    }

    private async Task<Catalog> LoadAsync(string path)
    {
        if (!File.Exists(path))
        {
            throw new FileNotFoundException($"Journey catalogue not found at '{path}'. Check JourneyCatalog:DataFile.", path);
        }

        await using var stream = File.OpenRead(path);
        var journeys = await JsonSerializer.DeserializeAsync<List<Journey>>(stream, SerializerOptions).ConfigureAwait(false)
            ?? throw new InvalidDataException($"Journey catalogue '{path}' is empty.");

        Validate(journeys, path);

        _logger.LogInformation("Loaded {Count} journeys from {Path}", journeys.Count, path);

        return new Catalog(
            journeys,
            journeys.ToDictionary(j => j.Slug, StringComparer.OrdinalIgnoreCase));
    }

    /// <summary>Fail fast at startup rather than showing a half-broken page to a traveller.</summary>
    private static void Validate(List<Journey> journeys, string path)
    {
        var problems = new List<string>();

        if (journeys.Count < 3)
        {
            problems.Add("at least 3 journeys are needed so discovery can always return 3 matches");
        }

        foreach (var group in journeys.GroupBy(j => j.Slug, StringComparer.OrdinalIgnoreCase).Where(g => g.Count() > 1))
        {
            problems.Add($"slug '{group.Key}' is used {group.Count()} times");
        }

        foreach (var j in journeys)
        {
            var name = string.IsNullOrWhiteSpace(j.Slug) ? "(missing slug)" : j.Slug;

            if (string.IsNullOrWhiteSpace(j.Slug) || string.IsNullOrWhiteSpace(j.Title))
            {
                problems.Add($"{name}: slug and title are required");
            }

            if (j.Days <= 0 || j.Nights < 0 || j.Nights >= j.Days + 1)
            {
                problems.Add($"{name}: days/nights look wrong ({j.Days}D/{j.Nights}N)");
            }

            if (j.StartingPrice <= 0)
            {
                problems.Add($"{name}: starting price must be positive");
            }

            if (FeelingAxes.All.Any(a => j.Feeling[a.Key] is < FeelingVector.Min or > FeelingVector.Max))
            {
                problems.Add($"{name}: feeling values must be between 0 and 100");
            }

            if (j.Itinerary.Count > 0 && j.Itinerary.Count != j.Days)
            {
                problems.Add($"{name}: itinerary has {j.Itinerary.Count} days but the trip is {j.Days} days");
            }

            var stayNights = j.Stays.Sum(s => s.Nights);
            if (j.Stays.Count > 0 && stayNights != j.Nights)
            {
                problems.Add($"{name}: hotel nights add up to {stayNights}, expected {j.Nights}");
            }
        }

        if (problems.Count > 0)
        {
            throw new InvalidDataException($"Journey catalogue '{path}' is invalid:{Environment.NewLine} - " +
                                           string.Join(Environment.NewLine + " - ", problems));
        }
    }

    private sealed record Catalog(IReadOnlyList<Journey> All, IReadOnlyDictionary<string, Journey> BySlug);
}
