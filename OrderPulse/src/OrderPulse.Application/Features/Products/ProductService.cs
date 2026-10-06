using Microsoft.EntityFrameworkCore;
using OrderPulse.Application.Common.Interfaces;
using OrderPulse.Application.Features.Products.Dtos;
using OrderPulse.Domain.Entities.Products;

namespace OrderPulse.Application.Features.Products;

public class ProductService
{
    private readonly IApplicationDbContext _db;

    public ProductService(IApplicationDbContext db) => _db = db;

    // ---------------- Products ----------------

    public async Task<List<ProductDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .OrderBy(p => p.Name)
            .Select(p => Map(p))
            .ToListAsync(ct);
    }

    public async Task<ProductDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var product = await _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id, ct);
        return product is null ? null : Map(product);
    }

    public async Task<ProductDto> CreateAsync(CreateProductRequest request, CancellationToken ct = default)
    {
        var sku = request.SKU.Trim().ToUpperInvariant();

        if (await _db.Products.AnyAsync(p => p.SKU == sku, ct))
            throw new InvalidOperationException($"SKU '{sku}' already exists.");

        if (request.SellingPrice < request.CostPrice)
            throw new InvalidOperationException("Selling price cannot be less than cost price.");

        if (request.CategoryId.HasValue &&
            !await _db.Categories.AnyAsync(c => c.Id == request.CategoryId, ct))
            throw new InvalidOperationException("Category not found.");

        var product = new Product
        {
            SKU = sku,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            CategoryId = request.CategoryId,
            UnitOfMeasure = string.IsNullOrWhiteSpace(request.UnitOfMeasure) ? "EA" : request.UnitOfMeasure.Trim().ToUpperInvariant(),
            TaxRate = request.TaxRate,
            CostPrice = request.CostPrice,
            SellingPrice = request.SellingPrice,
            IsActive = true
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync(ct);

        // Reload with category for DTO
        return await GetByIdAsync(product.Id, ct) ?? throw new InvalidOperationException("Failed to load product.");
    }

    public async Task<ProductDto> UpdateAsync(int id, UpdateProductRequest request, CancellationToken ct = default)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new InvalidOperationException($"Product {id} not found.");

        if (request.SellingPrice < request.CostPrice)
            throw new InvalidOperationException("Selling price cannot be less than cost price.");

        if (request.CategoryId.HasValue &&
            !await _db.Categories.AnyAsync(c => c.Id == request.CategoryId, ct))
            throw new InvalidOperationException("Category not found.");

        product.Name = request.Name.Trim();
        product.Description = request.Description?.Trim();
        product.CategoryId = request.CategoryId;
        product.UnitOfMeasure = string.IsNullOrWhiteSpace(request.UnitOfMeasure) ? "EA" : request.UnitOfMeasure.Trim().ToUpperInvariant();
        product.TaxRate = request.TaxRate;
        product.CostPrice = request.CostPrice;
        product.SellingPrice = request.SellingPrice;
        product.IsActive = request.IsActive;

        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(product.Id, ct) ?? throw new InvalidOperationException("Failed to load product.");
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new InvalidOperationException($"Product {id} not found.");

        product.IsActive = false;
        await _db.SaveChangesAsync(ct);
    }

    // ---------------- Categories ----------------

    public async Task<List<CategoryDto>> GetCategoriesAsync(CancellationToken ct = default)
    {
        return await _db.Categories
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                ProductCount = c.Products.Count
            })
            .ToListAsync(ct);
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request, CancellationToken ct = default)
    {
        var name = request.Name.Trim();

        if (await _db.Categories.AnyAsync(c => c.Name == name, ct))
            throw new InvalidOperationException($"Category '{name}' already exists.");

        var category = new Category
        {
            Name = name,
            Description = request.Description?.Trim()
        };

        _db.Categories.Add(category);
        await _db.SaveChangesAsync(ct);

        return new CategoryDto { Id = category.Id, Name = category.Name, Description = category.Description, ProductCount = 0 };
    }

    // ---------------- Mapping ----------------

    private static ProductDto Map(Product p) => new()
    {
        Id = p.Id,
        SKU = p.SKU,
        Name = p.Name,
        Description = p.Description,
        CategoryId = p.CategoryId,
        CategoryName = p.Category?.Name,
        UnitOfMeasure = p.UnitOfMeasure,
        TaxRate = p.TaxRate,
        CostPrice = p.CostPrice,
        SellingPrice = p.SellingPrice,
        IsActive = p.IsActive,
        CreatedAt = p.CreatedAt
    };
}
