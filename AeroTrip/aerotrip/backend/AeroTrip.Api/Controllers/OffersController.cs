using Microsoft.AspNetCore.Mvc;

namespace AeroTrip.Api.Controllers;

[ApiController]
[Route("api/offers")]
public sealed class OffersController(IOfferService offers) : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyList<OfferDto>> Active() => Ok(offers.GetPublicOffers());
}
