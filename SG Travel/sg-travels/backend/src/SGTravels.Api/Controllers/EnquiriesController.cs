using SGTravels.Api.Contracts;
using SGTravels.Core.Common;
using SGTravels.Core.Enquiries;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace SGTravels.Api.Controllers;

/// <summary>"Reserve a seat": a callback request, not a payment. A travel designer follows up.</summary>
[ApiController]
[Route("api/enquiries")]
[Produces("application/json")]
public sealed class EnquiriesController(EnquiryService enquiries, ILogger<EnquiriesController> logger) : ControllerBase
{
    [HttpPost]
    [EnableRateLimiting(RateLimitPolicies.Enquiries)]
    [ProducesResponseType<EnquiryConfirmationDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<EnquiryConfirmationDto>> Create([FromBody] EnquiryRequestDto request, CancellationToken cancellationToken)
    {
        var result = await enquiries.SubmitAsync(
            new NewEnquiry(request.JourneySlug, request.FullName, request.Email, request.Phone, request.Travellers, request.Departure, request.Note),
            cancellationToken);

        if (!result.IsSuccess)
        {
            return ToProblem(result.Error!);
        }

        var enquiry = result.Value!;

        // Never log contact details.
        logger.LogInformation("Enquiry {Reference} received for {Journey}", enquiry.Reference, enquiry.JourneySlug);

        return CreatedAtAction(nameof(Get), new { reference = enquiry.Reference }, enquiry.ToConfirmation());
    }

    [HttpGet("{reference}")]
    [ProducesResponseType<EnquiryConfirmationDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EnquiryConfirmationDto>> Get(string reference, CancellationToken cancellationToken)
    {
        var enquiry = await enquiries.FindAsync(reference, cancellationToken);
        return enquiry is null
            ? Problem(statusCode: StatusCodes.Status404NotFound, title: "Reservation not found", detail: $"No reservation with reference '{reference}'.")
            : Ok(enquiry.ToConfirmation());
    }

    private ActionResult ToProblem(Error error)
    {
        if (error.Kind == ErrorKind.NotFound)
        {
            return Problem(statusCode: StatusCodes.Status404NotFound, title: "Journey not found", detail: error.Message);
        }

        ModelState.AddModelError(error.Field, error.Message);
        return ValidationProblem(ModelState);
    }
}
