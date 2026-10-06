using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrderPulse.Domain.Entities.Products;

namespace OrderPulse.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> b)
    {
        b.ToTable("Products");
        b.HasKey(x => x.Id);

        b.Property(x => x.SKU).HasMaxLength(50).IsRequired();
        b.Property(x => x.Name).HasMaxLength(200).IsRequired();
        b.Property(x => x.UnitOfMeasure).HasMaxLength(20).IsRequired();
        b.Property(x => x.CostPrice).HasPrecision(18, 2);
        b.Property(x => x.SellingPrice).HasPrecision(18, 2);
        b.Property(x => x.TaxRate).HasPrecision(5, 4);

        b.HasIndex(x => x.SKU).IsUnique();
    }
}

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> b)
    {
        b.ToTable("Categories");
        b.HasKey(x => x.Id);
        b.Property(x => x.Name).HasMaxLength(100).IsRequired();
    }
}
