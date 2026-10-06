using OrderPulse.Domain.Common;

namespace OrderPulse.Domain.Entities.Products;

public class Category : BaseEntity
{
    public string Name { get; set; } = default!;
    public string? Description { get; set; }

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
