using System.ComponentModel.DataAnnotations;

namespace AeroTrip.Api.DTOs;

public sealed record OfferDto(
    Guid Id,
    string Code,
    string Title,
    string Description,
    DiscountType DiscountType,
    decimal Value,
    decimal MaxDiscount,
    decimal MinBookingAmount,
    DateTime ValidFrom,
    DateTime ValidTo,
    CabinClass? Cabin,
    string? AirlineCode,
    bool InternationalOnly,
    int UsageLimit,
    int UsedCount,
    bool IsActive,
    string Theme);

public sealed class UpsertOfferRequest : IValidatableObject
{
    [Required, RegularExpression(@"^[A-Z0-9]{4,16}$", ErrorMessage = "Code must be 4–16 capital letters or digits.")] public string Code { get; set; } = string.Empty;
    [Required, StringLength(60, MinimumLength = 3)] public string Title { get; set; } = string.Empty;
    [Required, StringLength(200)] public string Description { get; set; } = string.Empty;
    public DiscountType DiscountType { get; set; }
    [Range(1, 100000)] public decimal Value { get; set; }
    [Range(0, 100000)] public decimal MaxDiscount { get; set; }
    [Range(0, 1000000)] public decimal MinBookingAmount { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public CabinClass? Cabin { get; set; }
    public string? AirlineCode { get; set; }
    public bool InternationalOnly { get; set; }
    [Range(1, 1000000)] public int UsageLimit { get; set; } = 1000;
    public bool IsActive { get; set; } = true;
    public string Theme { get; set; } = "ocean";

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (ValidTo <= ValidFrom)
            yield return new ValidationResult("End date must be after the start date.", [nameof(ValidTo)]);
        if (DiscountType == DiscountType.Percentage && Value > 90)
            yield return new ValidationResult("Percentage discounts can't exceed 90%.", [nameof(Value)]);
    }
}
