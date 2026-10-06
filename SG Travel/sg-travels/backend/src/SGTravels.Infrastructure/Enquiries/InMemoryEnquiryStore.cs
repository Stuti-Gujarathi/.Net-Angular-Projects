using System.Collections.Concurrent;
using SGTravels.Core.Enquiries;

namespace SGTravels.Infrastructure.Enquiries;

/// <summary>
/// Process-local store, fine for a demo. Replace with a database or CRM-backed
/// <see cref="IEnquiryStore"/> before going live; nothing else needs to change.
/// </summary>
public sealed class InMemoryEnquiryStore : IEnquiryStore
{
    private readonly ConcurrentDictionary<string, Enquiry> _enquiries = new(StringComparer.OrdinalIgnoreCase);

    public Task<bool> TryAddAsync(Enquiry enquiry, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(enquiry);
        return Task.FromResult(_enquiries.TryAdd(enquiry.Reference, enquiry));
    }

    public Task<Enquiry?> FindAsync(string reference, CancellationToken cancellationToken = default) =>
        Task.FromResult(_enquiries.GetValueOrDefault(reference));
}
