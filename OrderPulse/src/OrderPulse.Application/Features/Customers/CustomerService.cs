using Microsoft.EntityFrameworkCore;
using OrderPulse.Application.Common.Interfaces;
using OrderPulse.Application.Features.Customers.Dtos;
using OrderPulse.Domain.Entities.Customers;

namespace OrderPulse.Application.Features.Customers;

public class CustomerService
{
    private readonly IApplicationDbContext _db;

    public CustomerService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<CustomerDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.Customers
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new CustomerDto
            {
                Id = c.Id,
                CustomerCode = c.CustomerCode,
                Name = c.Name,
                Phone = c.Phone,
                Email = c.Email,
                CreditLimit = c.CreditLimit,
                PaymentTermsDays = c.PaymentTermsDays,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync(ct);
    }

    public async Task<CustomerDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var c = await _db.Customers.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return c is null ? null : Map(c);
    }

    public async Task<CustomerDto> CreateAsync(CreateCustomerRequest request, CancellationToken ct = default)
    {
        // Validate unique customer code
        var exists = await _db.Customers.AnyAsync(c => c.CustomerCode == request.CustomerCode, ct);
        if (exists)
            throw new InvalidOperationException($"Customer code '{request.CustomerCode}' already exists.");

        // Validate email unique if provided
        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var emailExists = await _db.Customers.AnyAsync(c => c.Email == request.Email, ct);
            if (emailExists)
                throw new InvalidOperationException($"Email '{request.Email}' is already in use.");
        }

        var customer = new Customer
        {
            CustomerCode = request.CustomerCode.Trim().ToUpperInvariant(),
            Name = request.Name.Trim(),
            Phone = request.Phone?.Trim(),
            Email = request.Email?.Trim().ToLowerInvariant(),
            CreditLimit = request.CreditLimit,
            PaymentTermsDays = request.PaymentTermsDays,
            IsActive = true
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync(ct);

        return Map(customer);
    }

    public async Task<CustomerDto> UpdateAsync(int id, UpdateCustomerRequest request, CancellationToken ct = default)
    {
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new InvalidOperationException($"Customer {id} not found.");

        if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != customer.Email)
        {
            var emailExists = await _db.Customers.AnyAsync(c => c.Email == request.Email && c.Id != id, ct);
            if (emailExists)
                throw new InvalidOperationException($"Email '{request.Email}' is already in use.");
        }

        customer.Name = request.Name.Trim();
        customer.Phone = request.Phone?.Trim();
        customer.Email = request.Email?.Trim().ToLowerInvariant();
        customer.CreditLimit = request.CreditLimit;
        customer.PaymentTermsDays = request.PaymentTermsDays;
        customer.IsActive = request.IsActive;

        await _db.SaveChangesAsync(ct);
        return Map(customer);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new InvalidOperationException($"Customer {id} not found.");

        // Soft delete - just deactivate
        customer.IsActive = false;
        await _db.SaveChangesAsync(ct);
    }

    private static CustomerDto Map(Customer c) => new()
    {
        Id = c.Id,
        CustomerCode = c.CustomerCode,
        Name = c.Name,
        Phone = c.Phone,
        Email = c.Email,
        CreditLimit = c.CreditLimit,
        PaymentTermsDays = c.PaymentTermsDays,
        IsActive = c.IsActive,
        CreatedAt = c.CreatedAt
    };
}
