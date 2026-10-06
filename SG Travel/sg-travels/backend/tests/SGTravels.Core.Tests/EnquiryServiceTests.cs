using System.Text.RegularExpressions;
using SGTravels.Core.Common;
using SGTravels.Core.Enquiries;

namespace SGTravels.Core.Tests;

public partial class EnquiryServiceTests
{
    private static readonly DateOnly Today = new(2026, 10, 5);
    private static readonly DateOnly NextMonth = new(2026, 11, 6);
    private static readonly DateOnly LastMonth = new(2026, 9, 4);

    private readonly FakeEnquiryStore _store = new();
    private readonly EnquiryService _service;

    public EnquiryServiceTests()
    {
        var japan = Journeys.Make("japan-koyo-trails", 20, 35, 20, LastMonth, NextMonth);
        _service = new EnquiryService(
            new FakeCatalog(japan),
            _store,
            new FixedClock(new DateTimeOffset(Today.ToDateTime(new TimeOnly(10, 0)), TimeSpan.Zero)));
    }

    [Fact]
    public async Task Valid_enquiry_is_saved_with_a_phone_friendly_reference()
    {
        var result = await _service.SubmitAsync(Request(departure: NextMonth));

        Assert.True(result.IsSuccess);
        Assert.Matches(ReferencePattern(), result.Value!.Reference);
        Assert.Equal("Ananya", result.Value.FirstName);
        Assert.Single(_store.Saved);
    }

    [Fact]
    public async Task Unknown_journey_is_not_found()
    {
        var result = await _service.SubmitAsync(Request(slug: "atlantis"));

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorKind.NotFound, result.Error!.Kind);
        Assert.Empty(_store.Saved);
    }

    [Fact]
    public async Task Departure_in_the_past_is_rejected()
    {
        var result = await _service.SubmitAsync(Request(departure: LastMonth));

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorKind.Validation, result.Error!.Kind);
        Assert.Equal("departure", result.Error.Field);
    }

    [Fact]
    public async Task Departure_is_optional()
    {
        var result = await _service.SubmitAsync(Request(departure: null));

        Assert.True(result.IsSuccess);
    }

    [Fact]
    public async Task Blank_note_is_stored_as_null_and_text_is_trimmed()
    {
        var result = await _service.SubmitAsync(Request() with { FullName = "  Ananya Rao  ", Note = "   " });

        Assert.Equal("Ananya Rao", result.Value!.FullName);
        Assert.Null(result.Value.Note);
    }

    private static NewEnquiry Request(string slug = "japan-koyo-trails", DateOnly? departure = null) =>
        new(slug, "Ananya Rao", "ananya@example.com", "+91 98200 00000", 2, departure, "Anniversary trip");

    [GeneratedRegex("^SGT-[ABCDEFGHJKMNPQRSTVWXYZ2-9]{6}$")]
    private static partial Regex ReferencePattern();
}
