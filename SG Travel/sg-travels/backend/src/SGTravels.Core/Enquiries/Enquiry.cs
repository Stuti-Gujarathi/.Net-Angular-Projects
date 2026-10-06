namespace SGTravels.Core.Enquiries;

/// <summary>A traveller asking us to hold a seat on a journey. Our travel designers call them back.</summary>
public sealed class Enquiry
{
    public required string Reference { get; init; }

    public required string JourneySlug { get; init; }

    public required string JourneyTitle { get; init; }

    public required string FullName { get; init; }

    public required string Email { get; init; }

    public required string Phone { get; init; }

    public int Travellers { get; init; }

    public DateOnly? Departure { get; init; }

    public string? Note { get; init; }

    public DateTimeOffset CreatedAt { get; init; }

    public string FirstName => FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? FullName;
}

public sealed record NewEnquiry(
    string JourneySlug,
    string FullName,
    string Email,
    string Phone,
    int Travellers,
    DateOnly? Departure,
    string? Note);

public interface IEnquiryStore
{
    /// <returns><c>false</c> if the reference is already taken.</returns>
    Task<bool> TryAddAsync(Enquiry enquiry, CancellationToken cancellationToken = default);

    Task<Enquiry?> FindAsync(string reference, CancellationToken cancellationToken = default);
}
