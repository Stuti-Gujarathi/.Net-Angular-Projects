using SGTravels.Core.Discovery;
using SGTravels.Core.Enquiries;
using SGTravels.Core.Feelings;
using SGTravels.Core.Journeys;

namespace SGTravels.Api.Contracts;

internal static class Mapping
{
    public static FeelingDto ToDto(this FeelingVector v) => new(v.ZenWild, v.RomanticAdventurous, v.LuxuryRaw);

    public static FeelingAxisDto ToDto(this FeelingAxis a) =>
        new(char.ToLowerInvariant(a.Key.ToString()[0]) + a.Key.ToString()[1..], a.Low, a.High, a.Question);

    public static SceneThemeDto ToDto(this SceneTheme t) => new(t.Scene, t.Sky, t.Sun, t.Layers, t.Accent, t.Night);

    public static JourneySummaryDto ToSummary(this Journey j, DateOnly today) => new(
        j.Slug,
        j.Title,
        j.Destination,
        j.Tagline,
        j.WhyYoullLoveIt,
        j.Days,
        j.Nights,
        new PriceDto(j.StartingPrice, j.Currency, j.PriceNote),
        j.ArrivalAirport,
        j.Route,
        j.DeparturesFrom(today).Cast<DateOnly?>().FirstOrDefault(),
        j.Feeling.ToDto(),
        j.Theme.ToDto());

    public static JourneyDetailDto ToDetail(this Journey j, DateOnly today)
    {
        var departures = j.DeparturesFrom(today);
        return new JourneyDetailDto(
            j.Slug,
            j.Title,
            j.Destination,
            j.Tagline,
            j.WhyYoullLoveIt,
            j.Summary,
            j.BestSeason,
            j.Days,
            j.Nights,
            new PriceDto(j.StartingPrice, j.Currency, j.PriceNote),
            j.ArrivalAirport,
            j.Route,
            departures.Cast<DateOnly?>().FirstOrDefault(),
            departures,
            j.Feeling.ToDto(),
            j.Theme.ToDto(),
            j.Highlights.Select(h => new HighlightDto(h.Title, h.Detail)).ToList(),
            j.Itinerary.OrderBy(d => d.Day).Select(d => new ItineraryDayDto(d.Day, d.Title, d.Location, d.Description, d.Overnight, d.Meals)).ToList(),
            j.Experiences.Select(e => new ExperienceDto(e.Title, e.Description, e.Feel)).ToList(),
            j.Stays.Select(s => new StayDto(s.City, s.Hotel, s.Nights, s.Category)).ToList(),
            j.Inclusions,
            j.Exclusions);
    }

    public static DiscoveryMatchDto ToDto(this DiscoveryMatch m, DateOnly today) =>
        new(m.Journey.ToSummary(today), m.Score, m.SharedFeelings, m.Reason);

    public static EnquiryConfirmationDto ToConfirmation(this Enquiry e) =>
        new(e.Reference, e.JourneySlug, e.JourneyTitle, e.FirstName, e.Travellers, e.Departure, e.CreatedAt);
}
