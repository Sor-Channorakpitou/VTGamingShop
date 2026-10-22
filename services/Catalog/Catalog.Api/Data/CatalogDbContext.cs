using Catalog.Api.Products;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Api.Data;

public class CatalogDbContext(DbContextOptions<CatalogDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(product =>
        {
            product.ToTable("products");
            product.Property(p => p.Name).HasMaxLength(200);
            product.Property(p => p.Description).HasMaxLength(2000);
            product.Property(p => p.Category).HasMaxLength(100);
            product.Property(p => p.ImageUrl).HasMaxLength(500);
            product.Property(p => p.Price).HasPrecision(10, 2);
            product.HasIndex(p => p.Name);
            product.HasIndex(p => p.Category);
            product.ToTable(t =>
            {
                t.HasCheckConstraint("ck_products_price", "\"Price\" >= 0");
                t.HasCheckConstraint("ck_products_stock", "\"Stock\" >= 0");
                t.HasCheckConstraint("ck_products_rating", "\"Rating\" BETWEEN 1 AND 5");
            });
            product.HasData(SeedData.Products);
        });
    }
}
