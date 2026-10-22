using Catalog.Api.Data;

namespace Catalog.Tests;

public class SeedDataTests
{
    [Fact]
    public void Ids_are_unique() =>
        Assert.Equal(SeedData.Products.Length, SeedData.Products.Select(p => p.Id).Distinct().Count());

    [Fact]
    public void Values_satisfy_database_constraints() =>
        Assert.All(SeedData.Products, p =>
        {
            Assert.InRange(p.Rating, 1, 5);
            Assert.True(p.Price >= 0);
            Assert.True(p.Stock >= 0);
        });

    [Fact]
    public void Images_exist_in_the_frontend()
    {
        // Static files of the Angular storefront.
        var frontend = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../../../frontend/public"));
        Assert.True(Directory.Exists(frontend), $"Frontend folder not found at {frontend}");
        Assert.All(SeedData.Products, p => Assert.True(File.Exists(Path.Combine(frontend, p.ImageUrl)), p.ImageUrl));
    }
}
