namespace AeroTrip.Api.Services;

public interface IAdminService
{
    AdminStatsDto GetStats();
    PagedResult<BookingSummaryDto> GetBookings(BookingStatus? status, string? search, int page, int pageSize);
    IReadOnlyList<AdminUserDto> GetUsers();
    AdminUserDto SetUserActive(Guid userId, bool isActive, Guid currentAdminId);
}

public sealed class AdminService(
    IBookingRepository bookings,
    IUserRepository users,
    IFlightRepository flights,
    IOfferRepository offers,
    ICatalogRepository catalog,
    IBookingService bookingService) : IAdminService
{
    public AdminStatsDto GetStats()
    {
        bookingService.ExpireStaleHolds();
        var now = Clock.IstNow;
        var today = Clock.IstToday;
        var all = bookings.GetAll();
        var paid = all.Where(b => b.PaidAt is not null).ToList();

        decimal NetOf(Booking b) => b.Status == BookingStatus.Cancelled ? b.Fare.Total - b.RefundAmount : b.Fare.Total;

        var netRevenue = paid.Sum(NetOf);
        var last7 = paid.Where(b => b.PaidAt >= now.AddDays(-7)).Sum(NetOf);
        var prev7 = paid.Where(b => b.PaidAt < now.AddDays(-7) && b.PaidAt >= now.AddDays(-14)).Sum(NetOf);
        var change = prev7 == 0 ? 100 : (double)((last7 - prev7) / prev7 * 100);

        var revenueByDay = Enumerable.Range(0, 14)
            .Select(i => today.AddDays(i - 13))
            .Select(d =>
            {
                var day = paid.Where(b => DateOnly.FromDateTime(b.PaidAt!.Value) == d).ToList();
                return new RevenuePointDto(d, day.Sum(NetOf), day.Count);
            }).ToList();

        var confirmed = all.Where(b => b.Status == BookingStatus.Confirmed).ToList();

        var topRoutes = confirmed
            .GroupBy(b => (b.OriginCode, b.DestinationCode))
            .Select(g => new RouteStatDto(g.Key.OriginCode, g.Key.DestinationCode,
                $"{catalog.GetAirport(g.Key.OriginCode)?.City} → {catalog.GetAirport(g.Key.DestinationCode)?.City}",
                g.Count(), g.Sum(b => b.Fare.Total)))
            .OrderByDescending(r => r.Revenue).Take(5).ToList();

        var airlineShare = confirmed
            .GroupBy(b => b.Segments[0].AirlineCode)
            .Select(g =>
            {
                var airline = catalog.GetAirline(g.Key);
                return new AirlineShareDto(g.Key, airline?.Name ?? g.Key, airline?.BrandColor ?? "#888", g.Count(),
                    confirmed.Count == 0 ? 0 : Math.Round(g.Count() * 100.0 / confirmed.Count, 1));
            })
            .OrderByDescending(a => a.Bookings).ToList();

        // Load factor across all active flights departing in the next 7 days.
        long capacity = 0, occupied = 0;
        for (var d = 0; d < 7; d++)
        {
            foreach (var instance in flights.GetInstancesOn(today.AddDays(d)))
            {
                foreach (var (cabin, seats) in instance.Schedule.Capacity)
                {
                    capacity += seats;
                    occupied += seats - flights.GetSeatsAvailable(instance, cabin);
                }
            }
        }

        var userLookup = users.GetAll().ToDictionary(u => u.Id);

        return new AdminStatsDto(
            NetRevenue: netRevenue,
            RevenueLast7Days: last7,
            RevenueChangePct: Math.Round(change, 1),
            TotalBookings: all.Count,
            ConfirmedBookings: confirmed.Count,
            CancelledBookings: all.Count(b => b.Status == BookingStatus.Cancelled),
            PendingBookings: all.Count(b => b.Status == BookingStatus.PendingPayment),
            TotalPassengers: confirmed.Sum(b => b.Passengers.Count),
            AverageBookingValue: paid.Count == 0 ? 0 : Math.Round(paid.Average(b => b.Fare.Total)),
            LoadFactorPct: capacity == 0 ? 0 : Math.Round(occupied * 100.0 / capacity, 1),
            ActiveFlights: flights.GetSchedules().Count(s => s.IsActive),
            ActiveOffers: offers.GetAll().Count(o => o.IsActive && o.ValidTo >= now),
            TotalUsers: userLookup.Values.Count(u => u.Role == UserRole.User),
            DiscountsGiven: paid.Sum(b => b.Fare.Discount),
            RefundsIssued: all.Sum(b => b.RefundAmount),
            RevenueByDay: revenueByDay,
            TopRoutes: topRoutes,
            AirlineShare: airlineShare,
            StatusBreakdown: Enum.GetValues<BookingStatus>().Select(s => new StatusCountDto(s, all.Count(b => b.Status == s))).ToList(),
            RecentBookings: all.Take(6).Select(b => b.ToSummary(catalog, userLookup.GetValueOrDefault(b.UserId))).ToList());
    }

    public PagedResult<BookingSummaryDto> GetBookings(BookingStatus? status, string? search, int page, int pageSize)
    {
        bookingService.ExpireStaleHolds();
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 5, 100);
        var userLookup = users.GetAll().ToDictionary(u => u.Id);

        IEnumerable<Booking> query = bookings.GetAll();
        if (status is not null) query = query.Where(b => b.Status == status);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(b =>
                b.Pnr.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                b.OriginCode.Equals(term, StringComparison.OrdinalIgnoreCase) ||
                b.DestinationCode.Equals(term, StringComparison.OrdinalIgnoreCase) ||
                b.Segments.Any(s => s.FlightNumber.Contains(term, StringComparison.OrdinalIgnoreCase)) ||
                (userLookup.TryGetValue(b.UserId, out var u) &&
                 (u.FullName.Contains(term, StringComparison.OrdinalIgnoreCase) || u.Email.Contains(term, StringComparison.OrdinalIgnoreCase))));
        }

        var filtered = query.ToList();
        var items = filtered.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(b => b.ToSummary(catalog, userLookup.GetValueOrDefault(b.UserId)))
            .ToList();
        return new PagedResult<BookingSummaryDto>(items, page, pageSize, filtered.Count);
    }

    public IReadOnlyList<AdminUserDto> GetUsers()
    {
        var all = bookings.GetAll();
        return users.GetAll()
            .OrderBy(u => u.Role).ThenByDescending(u => u.CreatedAt)
            .Select(u =>
            {
                var mine = all.Where(b => b.UserId == u.Id).ToList();
                var spent = mine.Where(b => b.PaidAt is not null)
                    .Sum(b => b.Status == BookingStatus.Cancelled ? b.Fare.Total - b.RefundAmount : b.Fare.Total);
                return new AdminUserDto(u.Id, u.FullName, u.Email, u.Phone, u.Role, u.IsActive, u.CreatedAt, u.LastLoginAt, mine.Count, spent);
            }).ToList();
    }

    public AdminUserDto SetUserActive(Guid userId, bool isActive, Guid currentAdminId)
    {
        if (userId == currentAdminId && !isActive)
            throw new BadRequestException("You can't deactivate your own account.");
        var user = users.GetById(userId) ?? throw new NotFoundException("User not found.");
        user.IsActive = isActive;
        users.Update(user);
        return GetUsers().First(u => u.Id == userId);
    }
}
