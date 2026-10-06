namespace AeroTrip.Api.Data;

/// <summary>
/// Populates the in-memory store at startup: reference data, demo accounts, offers,
/// and ~3 weeks of realistic booking history so dashboards are meaningful on first run.
/// </summary>
public sealed class DataSeeder(
    InMemoryDataStore store,
    IFlightRepository flights,
    IPricingService pricing,
    ILogger<DataSeeder> logger)
{
    public void Seed()
    {
        var now = Clock.IstNow;
        store.Airports.AddRange(SeedData.Airports());
        store.Airlines.AddRange(SeedData.Airlines());
        store.Schedules.AddRange(SeedData.Schedules(store.Airports, store.Airlines));
        store.Offers.AddRange(SeedData.Offers(now));

        foreach (var demo in SeedData.DemoUsers)
            store.Users.Add(CreateUser(demo.Name, demo.Email, demo.Phone, demo.Password, demo.Role, now.AddDays(-90)));
        foreach (var bg in SeedData.BackgroundUsers)
            store.Users.Add(CreateUser(bg.Name, bg.Email, bg.Phone, "User@123", UserRole.User, now.AddDays(-60)));

        SeedBookingHistory(now);
        logger.LogInformation("Seeded {Airports} airports, {Schedules} flight schedules, {Users} users, {Bookings} bookings",
            store.Airports.Count, store.Schedules.Count, store.Users.Count, store.Bookings.Count);
    }

    private static User CreateUser(string name, string email, string phone, string password, UserRole role, DateTime createdAt)
    {
        var (hash, salt) = PasswordHasher.Hash(password);
        return new User { FullName = name, Email = email, Phone = phone, PasswordHash = hash, PasswordSalt = salt, Role = role, CreatedAt = createdAt };
    }

    private void SeedBookingHistory(DateTime now)
    {
        var random = new Random(7);
        var travellers = store.Users.Where(u => u.Role == UserRole.User).ToList();
        var firstNames = new[] { "Aarav", "Diya", "Ishaan", "Kavya", "Neel", "Tara", "Yash", "Zoya", "Om", "Myra" };
        var lastNames = new[] { "Shah", "Rao", "Kapoor", "Menon", "Bose", "Joshi", "Gill", "Khan", "Das", "Reddy" };
        var pnrs = new HashSet<string>();

        for (var dayOffset = -21; dayOffset <= 18; dayOffset++)
        {
            var date = DateOnly.FromDateTime(now.AddDays(dayOffset));
            var instances = flights.GetInstancesOn(date).ToList();
            if (instances.Count == 0) continue;

            var perDay = random.Next(2, 6);
            for (var i = 0; i < perDay; i++)
            {
                var instance = instances[random.Next(instances.Count)];
                var cabin = random.Next(10) switch
                {
                    0 when instance.Schedule.OffersCabin(CabinClass.Business) => CabinClass.Business,
                    1 when instance.Schedule.OffersCabin(CabinClass.PremiumEconomy) => CabinClass.PremiumEconomy,
                    _ => CabinClass.Economy
                };
                var user = travellers[random.Next(travellers.Count)];
                var paxCount = random.Next(1, 4);
                var createdAt = instance.DepartureLocal.AddDays(-random.Next(3, 25)).AddHours(-random.Next(0, 12));
                if (createdAt > now) createdAt = now.AddDays(-random.Next(0, 12)).AddHours(-random.Next(1, 20));

                var extras = new BookingExtras
                {
                    ExtraBaggage = random.Next(5) == 0,
                    Meal = !instance.Schedule.MealIncluded && random.Next(3) == 0,
                    TravelInsurance = random.Next(3) == 0,
                    FlexibleDateChange = random.Next(6) == 0
                };
                var fare = pricing.Calculate([instance], cabin, paxCount, extras, priceAt: createdAt);
                if (random.Next(4) == 0) fare.Discount = Math.Round(Math.Min(750, fare.Subtotal * 0.1m));

                var passengers = Enumerable.Range(0, paxCount).Select(p => new Passenger
                {
                    FirstName = p == 0 ? user.FullName.Split(' ')[0] : firstNames[random.Next(firstNames.Length)],
                    LastName = p == 0 ? user.FullName.Split(' ').Last() : lastNames[random.Next(lastNames.Length)],
                    Gender = (Gender)random.Next(2),
                    Age = random.Next(18, 64)
                }).ToList();

                string pnr;
                do { pnr = BookingService.GeneratePnr(random); } while (!pnrs.Add(pnr));

                var roll = random.Next(100);
                var status = roll < 80 ? BookingStatus.Confirmed : roll < 93 ? BookingStatus.Cancelled : BookingStatus.Expired;

                var booking = new Booking
                {
                    Pnr = pnr,
                    UserId = user.Id,
                    ItineraryId = instance.Id,
                    Cabin = cabin,
                    Passengers = passengers,
                    ContactEmail = user.Email,
                    ContactPhone = user.Phone,
                    Extras = extras,
                    Fare = fare,
                    CouponCode = fare.Discount > 0 ? "FLYNEW" : null,
                    Status = status,
                    CreatedAt = createdAt,
                    HoldExpiresAt = createdAt.AddMinutes(15),
                    Segments =
                    [
                        new BookedSegment
                        {
                            FlightInstanceId = instance.Id,
                            FlightNumber = instance.Schedule.FlightNumber,
                            AirlineCode = instance.Schedule.AirlineCode,
                            Origin = instance.Schedule.OriginCode,
                            Destination = instance.Schedule.DestinationCode,
                            Departure = instance.DepartureLocal,
                            Arrival = instance.ArrivalLocal,
                            DurationMinutes = instance.Schedule.DurationMinutes,
                            Aircraft = instance.Schedule.Aircraft,
                            Seats = SeatAllocator.Allocate(cabin, paxCount, SeatPreference.NoPreference, random)
                        }
                    ]
                };

                if (status != BookingStatus.Expired)
                {
                    var payment = new Payment
                    {
                        BookingId = booking.Id,
                        Method = (PaymentMethod)random.Next(3),
                        Amount = fare.Total,
                        Status = PaymentStatus.Succeeded,
                        Reference = $"AT{random.Next(10_000_000, 99_999_999)}",
                        MaskedInstrument = "•••• 1111",
                        ProcessedAt = createdAt.AddMinutes(4)
                    };
                    store.Payments.Add(payment);
                    booking.PaymentId = payment.Id;
                    booking.PaidAt = payment.ProcessedAt;
                    flights.TryReserveSeats([instance.Id], cabin, paxCount);
                }

                if (status == BookingStatus.Cancelled)
                {
                    booking.CancelledAt = createdAt.AddDays(1);
                    booking.CancelledBy = "Traveller";
                    booking.RefundAmount = Math.Round(fare.Total * 0.75m);
                    flights.ReleaseSeats([instance.Id], cabin, paxCount);
                }

                store.Bookings.Add(booking);
            }
        }
    }
}
