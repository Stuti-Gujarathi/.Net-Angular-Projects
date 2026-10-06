using System.ComponentModel.DataAnnotations;

namespace AeroTrip.Api.DTOs;

public sealed class FlightSearchRequest
{
    [Required, StringLength(3, MinimumLength = 3)] public string From { get; set; } = string.Empty;
    [Required, StringLength(3, MinimumLength = 3)] public string To { get; set; } = string.Empty;
    [Required] public DateOnly Date { get; set; }
    [Range(1, 9)] public int Passengers { get; set; } = 1;
    public CabinClass Cabin { get; set; } = CabinClass.Economy;
}

public sealed record SegmentDto(
    string FlightId,
    string FlightNumber,
    string AirlineCode,
    string AirlineName,
    string AirlineColor,
    string Origin,
    string OriginCity,
    string OriginName,
    string Destination,
    string DestinationCity,
    string DestinationName,
    DateTime Departure,
    DateTime Arrival,
    int DurationMinutes,
    string Aircraft,
    int CheckInBaggageKg,
    int CabinBaggageKg,
    bool MealIncluded);

public sealed record LayoverDto(string AirportCode, string City, int Minutes);

public sealed record ItineraryDto(
    string Id,
    IReadOnlyList<SegmentDto> Segments,
    IReadOnlyList<LayoverDto> Layovers,
    int Stops,
    int TotalDurationMinutes,
    DateTime Departure,
    DateTime Arrival,
    CabinClass Cabin,
    decimal FarePerAdult,
    decimal TotalFare,
    int SeatsLeft,
    bool Refundable,
    IReadOnlyList<string> Tags);

public sealed record FlightSearchResponse(
    string From,
    string FromCity,
    string To,
    string ToCity,
    DateOnly Date,
    int Passengers,
    CabinClass Cabin,
    int TotalResults,
    decimal? LowestFare,
    IReadOnlyList<ItineraryDto> Results);

public sealed record FareCalendarDayDto(DateOnly Date, decimal? LowestFare, bool IsCheapest);
