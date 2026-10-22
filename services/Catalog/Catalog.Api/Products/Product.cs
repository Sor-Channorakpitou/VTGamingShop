namespace Catalog.Api.Products;

public class Product
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string Description { get; set; } = "";
    public required string Category { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }

    // 1 to 5 stars, shown on the product card.
    public int Rating { get; set; }

    // Relative to the frontend root, e.g. "Images/Products/headset.png".
    public required string ImageUrl { get; set; }
}
