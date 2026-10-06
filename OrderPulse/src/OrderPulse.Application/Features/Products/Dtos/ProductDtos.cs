namespace OrderPulse.Application.Features.Products.Dtos;

public class ProductDto
{
    public int Id { get; set; }
    public string SKU { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string UnitOfMeasure { get; set; } = "EA";
    public decimal TaxRate { get; set; }
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateProductRequest
{
    public string SKU { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public string UnitOfMeasure { get; set; } = "EA";
    public decimal TaxRate { get; set; } = 0.18m;
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
}

public class UpdateProductRequest
{
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public string UnitOfMeasure { get; set; } = "EA";
    public decimal TaxRate { get; set; }
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public bool IsActive { get; set; }
}

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public int ProductCount { get; set; }
}

public class CreateCategoryRequest
{
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
}
