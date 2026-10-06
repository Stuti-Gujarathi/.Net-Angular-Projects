using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AeroTrip.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/payments")]
public sealed class PaymentsController(IPaymentService payments) : ControllerBase
{
    [HttpPost]
    public ActionResult<PaymentResultDto> Pay(PaymentRequest request) => Ok(payments.Pay(User.GetUserId(), request));
}
