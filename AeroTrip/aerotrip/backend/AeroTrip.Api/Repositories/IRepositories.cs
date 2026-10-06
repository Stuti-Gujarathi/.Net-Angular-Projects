namespace AeroTrip.Api.Repositories;

public interface IUserRepository
{
    User? GetById(Guid id);
    User? GetByEmail(string email);
    IReadOnlyList<User> GetAll();
    void Add(User user);
    void Update(User user);
}

public interface ICatalogRepository
{
    IReadOnlyList<Airport> GetAirports();
    Airport? GetAirport(string code);
    IReadOnlyList<Airline> GetAirlines();
    Airline? GetAirline(string code);
}

public interface IFlightRepository
{
    IReadOnlyList<FlightSchedule> GetSchedules();
    FlightSchedule? GetSchedule(Guid id);
    FlightSchedule? GetScheduleByFlightNumber(string flightNumber);
    void AddSchedule(FlightSchedule schedule);
    void UpdateSchedule(FlightSchedule schedule);

    /// <summary>Materialises the dated flights operating on <paramref name="date"/> (by local departure date).</summary>
    IEnumerable<FlightInstance> GetInstancesOn(DateOnly date, string? origin = null, string? destination = null, bool includeInactive = false);
    FlightInstance? GetInstance(string instanceId);

    int GetSeatsSold(string instanceId, CabinClass cabin);
    int GetSeatsAvailable(FlightInstance instance, CabinClass cabin);

    /// <summary>Atomically reserves seats on every flight of an itinerary, or none of them.</summary>
    bool TryReserveSeats(IReadOnlyList<string> instanceIds, CabinClass cabin, int count);
    void ReleaseSeats(IReadOnlyList<string> instanceIds, CabinClass cabin, int count);
}

public interface IBookingRepository
{
    void Add(Booking booking);
    void Update(Booking booking);
    Booking? GetById(Guid id);
    bool PnrExists(string pnr);
    IReadOnlyList<Booking> GetByUser(Guid userId);
    IReadOnlyList<Booking> GetAll();
    IReadOnlyList<Booking> GetExpiredHolds(DateTime nowIst);
}

public interface IPaymentRepository
{
    void Add(Payment payment);
    Payment? GetById(Guid id);
    IReadOnlyList<Payment> GetByBooking(Guid bookingId);
}

public interface IOfferRepository
{
    IReadOnlyList<Offer> GetAll();
    Offer? GetById(Guid id);
    Offer? GetByCode(string code);
    void Add(Offer offer);
    void Update(Offer offer);
    bool Delete(Guid id);
}
