namespace SGTravels.Api.Contracts;

public sealed record FeelingDto(int ZenWild, int RomanticAdventurous, int LuxuryRaw);

public sealed record FeelingAxisDto(string Key, string Low, string High, string Question);

public sealed record PriceDto(decimal Amount, string Currency, string Note);

public sealed record SceneThemeDto(
    string Scene,
    IReadOnlyList<string> Sky,
    string Sun,
    IReadOnlyList<string> Layers,
    string Accent,
    bool Night);

public sealed record JourneySummaryDto(
    string Slug,
    string Title,
    string Destination,
    string Tagline,
    string WhyYoullLoveIt,
    int Days,
    int Nights,
    PriceDto StartingPrice,
    string ArrivalAirport,
    IReadOnlyList<string> Route,
    DateOnly? NextDeparture,
    FeelingDto Feeling,
    SceneThemeDto Theme);

public sealed record HighlightDto(string Title, string Detail);

public sealed record ItineraryDayDto(int Day, string Title, string Location, string Description, string Overnight, IReadOnlyList<string> Meals);

public sealed record ExperienceDto(string Title, string Description, string Feel);

public sealed record StayDto(string City, string Hotel, int Nights, string Category);

public sealed record JourneyDetailDto(
    string Slug,
    string Title,
    string Destination,
    string Tagline,
    string WhyYoullLoveIt,
    string Summary,
    string BestSeason,
    int Days,
    int Nights,
    PriceDto StartingPrice,
    string ArrivalAirport,
    IReadOnlyList<string> Route,
    DateOnly? NextDeparture,
    IReadOnlyList<DateOnly> Departures,
    FeelingDto Feeling,
    SceneThemeDto Theme,
    IReadOnlyList<HighlightDto> Highlights,
    IReadOnlyList<ItineraryDayDto> Itinerary,
    IReadOnlyList<ExperienceDto> Experiences,
    IReadOnlyList<StayDto> Stays,
    IReadOnlyList<string> Inclusions,
    IReadOnlyList<string> Exclusions);

public sealed record DiscoveryMatchDto(JourneySummaryDto Journey, int Score, IReadOnlyList<string> SharedFeelings, string Reason);

public sealed record DiscoveryResponseDto(FeelingDto Feeling, IReadOnlyList<DiscoveryMatchDto> Matches);
