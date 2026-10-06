namespace AeroTrip.Api.Models;

public class Offer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DiscountType DiscountType { get; set; }
    public decimal Value { get; set; }
    public decimal MaxDiscount { get; set; }
    public decimal MinBookingAmount { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public CabinClass? Cabin { get; set; }
    public string? AirlineCode { get; set; }
    public bool InternationalOnly { get; set; }
    public int UsageLimit { get; set; }
    public int UsedCount { get; set; }
    public bool IsActive { get; set; } = true;

    /// <summary>Visual theme for the offer card in the UI (e.g. "amber", "ocean", "plum").</summary>
    public string Theme { get; set; } = "ocean";
}
