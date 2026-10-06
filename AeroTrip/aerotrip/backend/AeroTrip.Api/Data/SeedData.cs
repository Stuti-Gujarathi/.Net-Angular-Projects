namespace AeroTrip.Api.Data;

/// <summary>Static reference data: airports, airlines, the route network, demo users and launch offers.</summary>
public static class SeedData
{
    /// <summary>Demo logins. Shown on the login screen and in the README.</summary>
    public static readonly (string Name, string Email, string Phone, string Password, UserRole Role)[] DemoUsers =
    [
        ("AeroTrip Admin", "admin@aerotrip.com", "9800000001", "Admin@123", UserRole.Admin),
        ("Riya Mehta", "riya@aerotrip.com", "9820012345", "User@123", UserRole.User),
        ("Arjun Nair", "arjun@aerotrip.com", "9845098450", "User@123", UserRole.User),
    ];

    /// <summary>Extra travellers that only exist so the admin dashboard has realistic history.</summary>
    public static readonly (string Name, string Email, string Phone)[] BackgroundUsers =
    [
        ("Priya Sharma", "priya.sharma@example.com", "9811122233"),
        ("Kabir Malhotra", "kabir.m@example.com", "9876501234"),
        ("Ananya Iyer", "ananya.iyer@example.com", "9900112233"),
        ("Rohan Desai", "rohan.desai@example.com", "9822334455"),
        ("Meera Pillai", "meera.p@example.com", "9847012345"),
        ("Vikram Singh", "vikram.s@example.com", "9810098100"),
        ("Sana Qureshi", "sana.q@example.com", "9833344455"),
        ("Dev Patel", "dev.patel@example.com", "9824012345"),
    ];

    public static List<Airport> Airports() =>
    [
        new() { Code = "DEL", Name = "Indira Gandhi International", City = "New Delhi", Country = "India", UtcOffsetMinutes = 330 },
        new() { Code = "BOM", Name = "Chhatrapati Shivaji Maharaj International", City = "Mumbai", Country = "India", UtcOffsetMinutes = 330 },
        new() { Code = "BLR", Name = "Kempegowda International", City = "Bengaluru", Country = "India", UtcOffsetMinutes = 330 },
        new() { Code = "MAA", Name = "Chennai International", City = "Chennai", Country = "India", UtcOffsetMinutes = 330 },
        new() { Code = "CCU", Name = "Netaji Subhas Chandra Bose International", City = "Kolkata", Country = "India", UtcOffsetMinutes = 330 },
        new() { Code = "HYD", Name = "Rajiv Gandhi International", City = "Hyderabad", Country = "India", UtcOffsetMinutes = 330 },
        new() { Code = "AMD", Name = "Sardar Vallabhbhai Patel International", City = "Ahmedabad", Country = "India", UtcOffsetMinutes = 330 },
        new() { Code = "GOI", Name = "Manohar International (Mopa)", City = "Goa", Country = "India", UtcOffsetMinutes = 330 },
        new() { Code = "COK", Name = "Cochin International", City = "Kochi", Country = "India", UtcOffsetMinutes = 330 },
        new() { Code = "PNQ", Name = "Pune International", City = "Pune", Country = "India", UtcOffsetMinutes = 330 },
        new() { Code = "JAI", Name = "Jaipur International", City = "Jaipur", Country = "India", UtcOffsetMinutes = 330 },
        new() { Code = "DXB", Name = "Dubai International", City = "Dubai", Country = "United Arab Emirates", UtcOffsetMinutes = 240 },
        new() { Code = "SIN", Name = "Singapore Changi", City = "Singapore", Country = "Singapore", UtcOffsetMinutes = 480 },
        new() { Code = "LHR", Name = "London Heathrow", City = "London", Country = "United Kingdom", UtcOffsetMinutes = 0 },
    ];

    public static List<Airline> Airlines() =>
    [
        new() { Code = "SF", Name = "Saffron Air", BrandColor = "#E8590C", IsFullService = true },
        new() { Code = "AB", Name = "AeroBharat", BrandColor = "#2648E8", IsFullService = false },
        new() { Code = "MN", Name = "Monsoon Airways", BrandColor = "#0E9F8E", IsFullService = false },
        new() { Code = "HM", Name = "Himalaya Air", BrandColor = "#7048E8", IsFullService = true },
        new() { Code = "CJ", Name = "CoastalJet", BrandColor = "#0B7FBF", IsFullService = false },
        new() { Code = "GS", Name = "Gulf Star", BrandColor = "#B8860B", IsFullService = true },
    ];

    // (origin, destination, minutes, economy base fare, airlines operating, daily frequency)
    private static readonly (string A, string B, int Min, decimal Fare, string[] Carriers, int Daily)[] Routes =
    [
        ("DEL", "BOM", 130, 4800, ["SF", "AB", "MN", "HM"], 4),
        ("DEL", "BLR", 165, 5600, ["SF", "AB", "HM"], 3),
        ("DEL", "MAA", 170, 5400, ["SF", "AB"], 2),
        ("DEL", "CCU", 130, 4900, ["AB", "HM"], 2),
        ("DEL", "HYD", 135, 5000, ["SF", "MN"], 2),
        ("DEL", "AMD", 95, 3900, ["AB", "MN"], 2),
        ("DEL", "GOI", 150, 5200, ["AB", "CJ"], 2),
        ("DEL", "COK", 190, 6100, ["SF"], 1),
        ("DEL", "PNQ", 125, 4700, ["AB", "MN"], 2),
        ("DEL", "JAI", 60, 2900, ["MN"], 2),
        ("BOM", "BLR", 95, 3800, ["SF", "AB", "CJ"], 3),
        ("BOM", "MAA", 110, 4100, ["AB", "HM"], 2),
        ("BOM", "CCU", 155, 5300, ["SF", "AB"], 2),
        ("BOM", "HYD", 85, 3500, ["MN", "CJ"], 2),
        ("BOM", "AMD", 70, 2800, ["AB", "MN"], 2),
        ("BOM", "GOI", 70, 3200, ["CJ", "AB"], 2),
        ("BOM", "COK", 115, 4300, ["CJ", "SF"], 2),
        ("BLR", "MAA", 60, 2700, ["MN"], 2),
        ("BLR", "CCU", 150, 5200, ["AB", "HM"], 2),
        ("BLR", "HYD", 75, 3100, ["CJ", "MN"], 2),
        ("BLR", "GOI", 70, 3300, ["CJ"], 1),
        ("BLR", "COK", 70, 3000, ["CJ", "AB"], 2),
        ("HYD", "MAA", 75, 3000, ["MN"], 1),
        ("CCU", "HYD", 125, 4600, ["AB"], 1),
        ("DEL", "DXB", 220, 14500, ["SF", "GS"], 2),
        ("BOM", "DXB", 190, 12500, ["GS", "AB"], 2),
        ("COK", "DXB", 240, 13500, ["GS"], 1),
        ("BLR", "SIN", 255, 16500, ["SF", "HM"], 1),
        ("MAA", "SIN", 245, 15500, ["HM"], 1),
        ("DEL", "LHR", 600, 48000, ["SF", "GS"], 1),
        ("BOM", "LHR", 590, 46000, ["SF"], 1),
    ];

    private static readonly int[] DepartureSlots = [6 * 60 + 5, 7 * 60 + 40, 9 * 60 + 15, 11 * 60 + 30, 13 * 60 + 50, 16 * 60 + 10, 18 * 60 + 25, 20 * 60 + 45, 22 * 60 + 30];

    public static List<FlightSchedule> Schedules(IReadOnlyList<Airport> airports, IReadOnlyList<Airline> airlines)
    {
        var random = new Random(2026);
        var schedules = new List<FlightSchedule>();
        var numbersByAirline = airlines.ToDictionary(a => a.Code, _ => 101);
        var intl = airports.Where(a => a.IsInternational).Select(a => a.Code).ToHashSet();

        foreach (var route in Routes)
        {
            foreach (var (origin, destination) in new[] { (route.A, route.B), (route.B, route.A) })
            {
                var isInternational = intl.Contains(origin) || intl.Contains(destination);
                var slots = DepartureSlots.OrderBy(_ => random.Next()).Take(route.Daily).OrderBy(s => s).ToList();

                for (var i = 0; i < slots.Count; i++)
                {
                    var carrierCode = route.Carriers[i % route.Carriers.Length];
                    var carrier = airlines.First(a => a.Code == carrierCode);
                    var number = numbersByAirline[carrierCode];
                    numbersByAirline[carrierCode] += random.Next(3, 17);

                    var minutesJitter = random.Next(-3, 4) * 5;
                    var fareJitter = 1 + (decimal)(random.NextDouble() * 0.18 - 0.06);
                    var economy = Math.Round(route.Fare * fareJitter / 10) * 10;
                    var isLongHaul = route.Min >= 400;
                    var widebody = isInternational && route.Min >= 200;

                    var schedule = new FlightSchedule
                    {
                        FlightNumber = $"{carrierCode}{number}",
                        AirlineCode = carrierCode,
                        OriginCode = origin,
                        DestinationCode = destination,
                        DepartureTime = TimeOnly.FromTimeSpan(TimeSpan.FromMinutes(slots[i] + minutesJitter)),
                        DurationMinutes = route.Min + random.Next(-1, 2) * 5,
                        Aircraft = isLongHaul ? "Boeing 787-9" : widebody ? "Airbus A321XLR" : carrier.IsFullService ? "Airbus A320neo" : random.Next(2) == 0 ? "Airbus A320neo" : "Boeing 737 MAX 8",
                        MealIncluded = carrier.IsFullService,
                        CheckInBaggageKg = isInternational ? (carrier.IsFullService ? 30 : 25) : (carrier.IsFullService ? 20 : 15),
                        CabinBaggageKg = 7
                    };

                    schedule.Capacity[CabinClass.Economy] = isLongHaul ? 220 : 156;
                    schedule.BaseFare[CabinClass.Economy] = economy;
                    if (carrier.IsFullService)
                    {
                        schedule.Capacity[CabinClass.PremiumEconomy] = isLongHaul ? 28 : 24;
                        schedule.BaseFare[CabinClass.PremiumEconomy] = Math.Round(economy * 1.65m / 10) * 10;
                        schedule.Capacity[CabinClass.Business] = isLongHaul ? 30 : 12;
                        schedule.BaseFare[CabinClass.Business] = Math.Round(economy * (isLongHaul ? 3.4m : 3.1m) / 10) * 10;
                    }

                    // A few regional rotations skip one day a week, like real schedules.
                    if (!isInternational && route.Daily == 1 && random.Next(3) == 0)
                        schedule.OperatingDays.Remove((DayOfWeek)random.Next(7));

                    schedules.Add(schedule);
                }
            }
        }

        return schedules;
    }

    public static List<Offer> Offers(DateTime nowIst) =>
    [
        new()
        {
            Code = "FLYNEW", Title = "₹750 off your first flight", Description = "Flat ₹750 off on any domestic booking above ₹4,000.",
            DiscountType = DiscountType.Flat, Value = 750, MaxDiscount = 750, MinBookingAmount = 4000,
            ValidFrom = nowIst.AddDays(-20), ValidTo = nowIst.AddDays(90), UsageLimit = 5000, UsedCount = 1288, Theme = "amber"
        },
        new()
        {
            Code = "MONSOON12", Title = "12% off monsoon getaways", Description = "Up to ₹1,500 off on fares above ₹5,000. Valid on all airlines.",
            DiscountType = DiscountType.Percentage, Value = 12, MaxDiscount = 1500, MinBookingAmount = 5000,
            ValidFrom = nowIst.AddDays(-10), ValidTo = nowIst.AddDays(45), UsageLimit = 3000, UsedCount = 642, Theme = "ocean"
        },
        new()
        {
            Code = "BIZLUXE", Title = "Business class, 15% off", Description = "Fly flat-bed for less. Up to ₹6,000 off business cabins.",
            DiscountType = DiscountType.Percentage, Value = 15, MaxDiscount = 6000, MinBookingAmount = 15000, Cabin = CabinClass.Business,
            ValidFrom = nowIst.AddDays(-5), ValidTo = nowIst.AddDays(60), UsageLimit = 800, UsedCount = 97, Theme = "plum"
        },
        new()
        {
            Code = "GLOBAL3K", Title = "₹3,000 off international", Description = "Flat ₹3,000 off flights to Dubai, Singapore and London.",
            DiscountType = DiscountType.Flat, Value = 3000, MaxDiscount = 3000, MinBookingAmount = 20000, InternationalOnly = true,
            ValidFrom = nowIst.AddDays(-15), ValidTo = nowIst.AddDays(75), UsageLimit = 1500, UsedCount = 311, Theme = "forest"
        },
        new()
        {
            Code = "SAFFRON8", Title = "8% off on Saffron Air", Description = "Extra savings on every Saffron Air fare, up to ₹2,000.",
            DiscountType = DiscountType.Percentage, Value = 8, MaxDiscount = 2000, MinBookingAmount = 3000, AirlineCode = "SF",
            ValidFrom = nowIst.AddDays(-30), ValidTo = nowIst.AddDays(30), UsageLimit = 4000, UsedCount = 1904, Theme = "rose"
        },
        new()
        {
            Code = "DIWALI25", Title = "Festive flash sale", Description = "Ended last season. Kept here so you can see expired offers in admin.",
            DiscountType = DiscountType.Percentage, Value = 25, MaxDiscount = 2500, MinBookingAmount = 3000,
            ValidFrom = nowIst.AddDays(-60), ValidTo = nowIst.AddDays(-40), UsageLimit = 2000, UsedCount = 2000, IsActive = false, Theme = "amber"
        },
    ];
}
