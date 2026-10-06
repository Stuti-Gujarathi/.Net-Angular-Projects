namespace AeroTrip.Api.Services;

public sealed record CouponResult(bool IsValid, decimal Discount, string Message, Offer? Offer);

public interface IOfferService
{
    IReadOnlyList<OfferDto> GetPublicOffers();
    IReadOnlyList<OfferDto> GetAll();
    OfferDto Create(UpsertOfferRequest request);
    OfferDto Update(Guid id, UpsertOfferRequest request);
    OfferDto SetActive(Guid id, bool isActive);
    void Delete(Guid id);
    CouponResult Evaluate(string code, decimal subtotal, CabinClass cabin, IReadOnlyList<FlightInstance> legs);
    void RegisterUse(string code);
}

public sealed class OfferService(IOfferRepository offers, ICatalogRepository catalog) : IOfferService
{
    public IReadOnlyList<OfferDto> GetPublicOffers()
    {
        var now = Clock.IstNow;
        return offers.GetAll()
            .Where(o => o.IsActive && o.ValidFrom <= now && o.ValidTo >= now && o.UsedCount < o.UsageLimit)
            .OrderBy(o => o.ValidTo)
            .Select(o => o.ToDto())
            .ToList();
    }

    public IReadOnlyList<OfferDto> GetAll() =>
        offers.GetAll().OrderByDescending(o => o.IsActive).ThenBy(o => o.ValidTo).Select(o => o.ToDto()).ToList();

    public OfferDto Create(UpsertOfferRequest request)
    {
        if (offers.GetByCode(request.Code) is not null)
            throw new ConflictException($"An offer with code {request.Code} already exists.");
        var offer = new Offer();
        Apply(offer, request);
        offers.Add(offer);
        return offer.ToDto();
    }

    public OfferDto Update(Guid id, UpsertOfferRequest request)
    {
        var offer = offers.GetById(id) ?? throw new NotFoundException("Offer not found.");
        var clash = offers.GetByCode(request.Code);
        if (clash is not null && clash.Id != id)
            throw new ConflictException($"An offer with code {request.Code} already exists.");
        Apply(offer, request);
        offers.Update(offer);
        return offer.ToDto();
    }

    public OfferDto SetActive(Guid id, bool isActive)
    {
        var offer = offers.GetById(id) ?? throw new NotFoundException("Offer not found.");
        offer.IsActive = isActive;
        offers.Update(offer);
        return offer.ToDto();
    }

    public void Delete(Guid id)
    {
        if (!offers.Delete(id)) throw new NotFoundException("Offer not found.");
    }

    public CouponResult Evaluate(string code, decimal subtotal, CabinClass cabin, IReadOnlyList<FlightInstance> legs)
    {
        var offer = offers.GetByCode(code);
        if (offer is null) return Invalid("That coupon code isn't recognised.");

        var now = Clock.IstNow;
        if (!offer.IsActive || offer.ValidTo < now) return Invalid("This offer has expired.");
        if (offer.ValidFrom > now) return Invalid($"This offer starts on {offer.ValidFrom:d MMM}.");
        if (offer.UsedCount >= offer.UsageLimit) return Invalid("This offer has been fully redeemed.");
        if (offer.Cabin is { } requiredCabin && requiredCabin != cabin)
            return Invalid($"Valid only on {CabinLabel(requiredCabin)} fares.");
        if (offer.AirlineCode is { } airlineCode && legs.Any(l => l.Schedule.AirlineCode != airlineCode))
            return Invalid($"Valid only on {catalog.GetAirline(airlineCode)?.Name ?? airlineCode} flights.");
        if (offer.InternationalOnly && !legs.Any(IsInternational))
            return Invalid("Valid only on international flights.");
        if (subtotal < offer.MinBookingAmount)
            return Invalid($"Add {Money.Inr(offer.MinBookingAmount - subtotal)} more to use this code.");

        var discount = offer.DiscountType == DiscountType.Percentage
            ? subtotal * offer.Value / 100m
            : offer.Value;
        if (offer.MaxDiscount > 0) discount = Math.Min(discount, offer.MaxDiscount);
        discount = Math.Round(Math.Min(discount, subtotal));

        return new CouponResult(true, discount, $"{offer.Code} applied. You save {Money.Inr(discount)}.", offer);
    }

    public void RegisterUse(string code)
    {
        var offer = offers.GetByCode(code);
        if (offer is null) return;
        offer.UsedCount++;
        offers.Update(offer);
    }

    private bool IsInternational(FlightInstance leg) =>
        catalog.GetAirport(leg.Schedule.OriginCode)?.IsInternational == true ||
        catalog.GetAirport(leg.Schedule.DestinationCode)?.IsInternational == true;

    private static CouponResult Invalid(string message) => new(false, 0, message, null);

    private static string CabinLabel(CabinClass cabin) => cabin switch
    {
        CabinClass.PremiumEconomy => "Premium Economy",
        CabinClass.Business => "Business",
        _ => "Economy"
    };

    private static void Apply(Offer offer, UpsertOfferRequest r)
    {
        offer.Code = r.Code.Trim().ToUpperInvariant();
        offer.Title = r.Title.Trim();
        offer.Description = r.Description.Trim();
        offer.DiscountType = r.DiscountType;
        offer.Value = r.Value;
        offer.MaxDiscount = r.DiscountType == DiscountType.Flat ? r.Value : r.MaxDiscount;
        offer.MinBookingAmount = r.MinBookingAmount;
        offer.ValidFrom = r.ValidFrom;
        offer.ValidTo = r.ValidTo;
        offer.Cabin = r.Cabin;
        offer.AirlineCode = string.IsNullOrWhiteSpace(r.AirlineCode) ? null : r.AirlineCode.Trim().ToUpperInvariant();
        offer.InternationalOnly = r.InternationalOnly;
        offer.UsageLimit = r.UsageLimit;
        offer.IsActive = r.IsActive;
        offer.Theme = string.IsNullOrWhiteSpace(r.Theme) ? "ocean" : r.Theme;
    }
}
