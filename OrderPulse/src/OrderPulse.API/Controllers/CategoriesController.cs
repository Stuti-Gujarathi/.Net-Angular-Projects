using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrderPulse.Application.Features.Products;
using OrderPulse.Application.Features.Products.Dtos;

namespace OrderPulse.API.Controllers;

[ApiController]
[Route("api/categories")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ProductService _service;
    public CategoriesController(ProductService service) => _service = service;

    [HttpGet]
    [Authorize(Policy = "Products.View")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _service.GetCategoriesAsync(ct));

    [HttpPost]
    [Authorize(Policy = "Products.Create")]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request, CancellationToken ct)
    {
        try
        {
            var category = await _service.CreateCategoryAsync(request, ct);
            return Ok(category);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
