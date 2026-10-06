namespace AeroTrip.Api.DTOs;

public sealed record AirportDto(string Code, string Name, string City, string Country, bool IsInternational);

public sealed record AirlineDto(string Code, string Name, string BrandColor, bool IsFullService);

public sealed record PopularRouteDto(string From, string FromCity, string To, string ToCity, decimal LowestFare, DateOnly LowestFareDate, int DurationMinutes, bool IsInternational);
