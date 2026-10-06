using SGTravels.Core.Feelings;

namespace SGTravels.Core.Journeys;

/// <summary>A sellable, escorted SG Travels holiday.</summary>
public sealed class Journey
{
    public string Slug { get; init; } = string.Empty;

    public string Title { get; init; } = string.Empty;

    public string Destination { get; init; } = string.Empty;

    public string Tagline { get; init; } = string.Empty;

    public string WhyYoullLoveIt { get; init; } = string.Empty;

    public string Summary { get; init; } = string.Empty;

    public int Days { get; init; }

    public int Nights { get; init; }

    public decimal StartingPrice { get; init; }

    public string Currency { get; init; } = "INR";

    public string PriceNote { get; init; } = string.Empty;

    /// <summary>IATA code of the arrival airport, printed on the boarding pass.</summary>
    public string ArrivalAirport { get; init; } = string.Empty;

    public string BestSeason { get; init; } = string.Empty;

    /// <summary>Lower ranks show first in "Departing soon". Null means not featured.</summary>
    public int? FeaturedRank { get; init; }

    public IReadOnlyList<string> Route { get; init; } = [];

    public IReadOnlyList<DateOnly> Departures { get; init; } = [];

    public FeelingVector Feeling { get; init; } = FeelingVector.Balanced;

    public SceneTheme Theme { get; init; } = new();

    public IReadOnlyList<Highlight> Highlights { get; init; } = [];

    public IReadOnlyList<ItineraryDay> Itinerary { get; init; } = [];

    public IReadOnlyList<Experience> Experiences { get; init; } = [];

    public IReadOnlyList<Stay> Stays { get; init; } = [];

    public IReadOnlyList<string> Inclusions { get; init; } = [];

    public IReadOnlyList<string> Exclusions { get; init; } = [];

    public IReadOnlyList<DateOnly> DeparturesFrom(DateOnly today) =>
        Departures.Where(d => d >= today).Order().ToList();
}

public sealed record Highlight(string Title, string Detail);

public sealed record ItineraryDay(
    int Day,
    string Title,
    string Location,
    string Description,
    string Overnight,
    IReadOnlyList<string> Meals);

/// <summary>A signature moment on the trip. <see cref="Feel"/> is a one-word mood tag, e.g. "Calm".</summary>
public sealed record Experience(string Title, string Description, string Feel);

public sealed record Stay(string City, string Hotel, int Nights, string Category);

/// <summary>
/// Art direction for the illustrated "window view" of a destination.
/// Lives with the content so editors can re-theme a trip without a frontend release.
/// </summary>
public sealed class SceneTheme
{
    /// <summary>Which illustrated landscape to draw, e.g. "fuji", "alps", "aurora".</summary>
    public string Scene { get; init; } = "clouds";

    /// <summary>Sky gradient stops, top to horizon.</summary>
    public IReadOnlyList<string> Sky { get; init; } = [];

    public string Sun { get; init; } = "#FFFFFF";

    /// <summary>Landscape layer colours, far to near.</summary>
    public IReadOnlyList<string> Layers { get; init; } = [];

    /// <summary>The colour the interface borrows while this destination is in view.</summary>
    public string Accent { get; init; } = "#2F4A6D";

    public bool Night { get; init; }
}
