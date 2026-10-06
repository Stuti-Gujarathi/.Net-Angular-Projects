using System.Security.Cryptography;
using SGTravels.Core.Common;
using SGTravels.Core.Journeys;

namespace SGTravels.Core.Enquiries;

public sealed class EnquiryService(IJourneyCatalog catalog, IEnquiryStore store, TimeProvider clock)
{
    // No 0/O, 1/I/L or U: references get read out over the phone.
    private const string ReferenceAlphabet = "ABCDEFGHJKMNPQRSTVWXYZ23456789";
    private const int ReferenceLength = 6;
    private const int MaxReferenceAttempts = 5;

    public async Task<Result<Enquiry>> SubmitAsync(NewEnquiry request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var journey = await catalog.FindAsync(request.JourneySlug, cancellationToken).ConfigureAwait(false);
        if (journey is null)
        {
            return Result<Enquiry>.Failure(new Error(ErrorKind.NotFound, "journeySlug", "That journey isn't on sale any more."));
        }

        var now = clock.GetLocalNow();
        var today = DateOnly.FromDateTime(now.DateTime);

        if (request.Departure is { } departure && !journey.DeparturesFrom(today).Contains(departure))
        {
            return Result<Enquiry>.Failure(new Error(ErrorKind.Validation, "departure", "Pick one of the departure dates listed for this journey."));
        }

        for (var attempt = 0; attempt < MaxReferenceAttempts; attempt++)
        {
            var enquiry = new Enquiry
            {
                Reference = NewReference(),
                JourneySlug = journey.Slug,
                JourneyTitle = journey.Title,
                FullName = request.FullName.Trim(),
                Email = request.Email.Trim(),
                Phone = request.Phone.Trim(),
                Travellers = request.Travellers,
                Departure = request.Departure,
                Note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim(),
                CreatedAt = now,
            };

            if (await store.TryAddAsync(enquiry, cancellationToken).ConfigureAwait(false))
            {
                return Result<Enquiry>.Success(enquiry);
            }
        }

        throw new InvalidOperationException("Could not allocate a unique enquiry reference.");
    }

    public Task<Enquiry?> FindAsync(string reference, CancellationToken cancellationToken = default) =>
        string.IsNullOrWhiteSpace(reference)
            ? Task.FromResult<Enquiry?>(null)
            : store.FindAsync(reference.Trim(), cancellationToken);

    public static string NewReference() =>
        "SGT-" + RandomNumberGenerator.GetString(ReferenceAlphabet, ReferenceLength);
}
