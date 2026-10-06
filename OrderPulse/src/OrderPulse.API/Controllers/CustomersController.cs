using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrderPulse.Application.Features.Customers;
using OrderPulse.Application.Features.Customers.Dtos;

namespace OrderPulse.API.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly CustomerService _service;

    public CustomersController(CustomerService service)
    {
        _service = service;
    }

    /// <summary>
    /// List all customers.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "Customers.View")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var customers = await _service.GetAllAsync(ct);
        return Ok(customers);
    }

    /// <summary>
    /// Get a customer by ID.
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Policy = "Customers.View")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var customer = await _service.GetByIdAsync(id, ct);
        return customer is null ? NotFound() : Ok(customer);
    }

    /// <summary>
    /// Create a new customer.
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "Customers.Create")]
    public async Task<IActionResult> Create([FromBody] CreateCustomerRequest request, CancellationToken ct)
    {
        try
        {
            var customer = await _service.CreateAsync(request, ct);
            return CreatedAtAction(nameof(GetById), new { id = customer.Id }, customer);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update a customer.
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "Customers.Update")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCustomerRequest request, CancellationToken ct)
    {
        try
        {
            var customer = await _service.UpdateAsync(id, request, ct);
            return Ok(customer);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Soft delete a customer (deactivate).
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "Customers.Delete")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        try
        {
            await _service.DeleteAsync(id, ct);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
