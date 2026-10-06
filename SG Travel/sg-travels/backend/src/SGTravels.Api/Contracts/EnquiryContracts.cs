using System.ComponentModel.DataAnnotations;

namespace SGTravels.Api.Contracts;

public sealed class EnquiryRequestDto
{
    [Required(ErrorMessage = "Choose a journey.")]
    [RegularExpression("^[a-z0-9-]{1,80}$", ErrorMessage = "That journey link looks broken.")]
    public string JourneySlug { get; init; } = string.Empty;

    [Required(ErrorMessage = "Enter your full name.")]
    [StringLength(80, MinimumLength = 2, ErrorMessage = "Enter your full name (2 to 80 characters).")]
    public string FullName { get; init; } = string.Empty;

    [Required(ErrorMessage = "Enter your email so we can send the itinerary.")]
    [EmailAddress(ErrorMessage = "Enter an email like name@example.com.")]
    [StringLength(120)]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "Enter a phone number so a travel designer can call you.")]
    [RegularExpression(@"^\+?[0-9][0-9 \-]{6,16}$", ErrorMessage = "Enter a phone number with 7 to 15 digits.")]
    public string Phone { get; init; } = string.Empty;

    [Range(1, 20, ErrorMessage = "Travellers must be between 1 and 20.")]
    public int Travellers { get; init; } = 2;

    public DateOnly? Departure { get; init; }

    [StringLength(500, ErrorMessage = "Keep the note under 500 characters.")]
    public string? Note { get; init; }
}

/// <summary>What the confirmation screen needs. Deliberately excludes email and phone.</summary>
public sealed record EnquiryConfirmationDto(
    string Reference,
    string JourneySlug,
    string JourneyTitle,
    string FirstName,
    int Travellers,
    DateOnly? Departure,
    DateTimeOffset CreatedAt);
