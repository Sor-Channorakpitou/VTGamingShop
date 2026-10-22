using Catalog.Api.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using VTGamingShop.Auth;

namespace Catalog.Api.Products;

public record ProductDto(
    int Id, string Name, string Description, string Category,
    decimal Price, int Stock, int Rating, string ImageUrl);

public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);

public record ProductRequest(
    string Name, string? Description, string Category,
    decimal Price, int Stock, int Rating, string ImageUrl);

public static class ProductEndpoints
{
    public const int MaxPageSize = 100;

    public static IEndpointRouteBuilder MapProductEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/products").WithTags("Products");

        group.MapGet("/", ListProducts)
            .WithName("ListProducts")
            .WithSummary("List products, optionally filtered by search text and category.");

        group.MapGet("/{id:int}", GetProduct)
            .WithName("GetProduct")
            .WithSummary("Get one product by id.");

        group.MapGet("/categories", ListCategories)
            .WithName("ListCategories")
            .WithSummary("List the distinct product categories.");

        var admin = group.MapGroup("").RequireAuthorization(Policies.Admin);

        admin.MapPost("/", CreateProduct)
            .WithName("CreateProduct")
            .WithSummary("Add a product. Requires the admin role.");

        admin.MapPut("/{id:int}", UpdateProduct)
            .WithName("UpdateProduct")
            .WithSummary("Replace a product. Requires the admin role.");

        admin.MapDelete("/{id:int}", DeleteProduct)
            .WithName("DeleteProduct")
            .WithSummary("Delete a product. Requires the admin role.");

        return app;
    }

    private static async Task<Results<Ok<PagedResult<ProductDto>>, ValidationProblem>> ListProducts(
        CatalogDbContext db,
        string? search,
        string? category,
        int page = 1,
        int pageSize = 20,
        CancellationToken ct = default)
    {
        var errors = new Dictionary<string, string[]>();
        if (page < 1)
            errors["page"] = ["Must be 1 or greater."];
        if (pageSize is < 1 or > MaxPageSize)
            errors["pageSize"] = [$"Must be between 1 and {MaxPageSize}."];
        if (errors.Count > 0)
            return TypedResults.ValidationProblem(errors);

        var query = db.Products.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(term) || p.Description.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Category == category);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(p => p.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductDto(p.Id, p.Name, p.Description, p.Category, p.Price, p.Stock, p.Rating, p.ImageUrl))
            .ToListAsync(ct);

        return TypedResults.Ok(new PagedResult<ProductDto>(items, page, pageSize, total));
    }

    private static async Task<Results<Ok<ProductDto>, NotFound>> GetProduct(int id, CatalogDbContext db, CancellationToken ct)
    {
        var product = await db.Products.AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new ProductDto(p.Id, p.Name, p.Description, p.Category, p.Price, p.Stock, p.Rating, p.ImageUrl))
            .FirstOrDefaultAsync(ct);

        return product is null ? TypedResults.NotFound() : TypedResults.Ok(product);
    }

    private static async Task<Ok<List<string>>> ListCategories(CatalogDbContext db, CancellationToken ct)
    {
        var categories = await db.Products.AsNoTracking()
            .Select(p => p.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync(ct);

        return TypedResults.Ok(categories);
    }

    private static async Task<Results<Created<ProductDto>, ValidationProblem>> CreateProduct(
        ProductRequest request, CatalogDbContext db, CancellationToken ct)
    {
        if (Validate(request) is { Count: > 0 } errors)
            return TypedResults.ValidationProblem(errors);

        var product = new Product
        {
            Name = request.Name.Trim(),
            Category = request.Category.Trim(),
            ImageUrl = request.ImageUrl.Trim(),
        };
        Apply(request, product);
        db.Products.Add(product);
        await db.SaveChangesAsync(ct);

        return TypedResults.Created($"/api/products/{product.Id}", ToDto(product));
    }

    private static async Task<Results<Ok<ProductDto>, NotFound, ValidationProblem>> UpdateProduct(
        int id, ProductRequest request, CatalogDbContext db, CancellationToken ct)
    {
        if (Validate(request) is { Count: > 0 } errors)
            return TypedResults.ValidationProblem(errors);

        var product = await db.Products.FindAsync([id], ct);
        if (product is null)
            return TypedResults.NotFound();

        Apply(request, product);
        await db.SaveChangesAsync(ct);

        return TypedResults.Ok(ToDto(product));
    }

    private static async Task<Results<NoContent, NotFound>> DeleteProduct(int id, CatalogDbContext db, CancellationToken ct)
    {
        var product = await db.Products.FindAsync([id], ct);
        if (product is null)
            return TypedResults.NotFound();

        db.Products.Remove(product);
        await db.SaveChangesAsync(ct);

        return TypedResults.NoContent();
    }

    private static Dictionary<string, string[]> Validate(ProductRequest request)
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length > 200)
            errors["name"] = ["Required, at most 200 characters."];
        if (request.Description?.Length > 2000)
            errors["description"] = ["At most 2000 characters."];
        if (string.IsNullOrWhiteSpace(request.Category) || request.Category.Length > 100)
            errors["category"] = ["Required, at most 100 characters."];
        if (string.IsNullOrWhiteSpace(request.ImageUrl) || request.ImageUrl.Length > 500)
            errors["imageUrl"] = ["Required, at most 500 characters."];
        if (request.Price < 0)
            errors["price"] = ["Must be 0 or greater."];
        if (request.Stock < 0)
            errors["stock"] = ["Must be 0 or greater."];
        if (request.Rating is < 1 or > 5)
            errors["rating"] = ["Must be between 1 and 5."];
        return errors;
    }

    private static void Apply(ProductRequest request, Product product)
    {
        product.Name = request.Name.Trim();
        product.Description = request.Description?.Trim() ?? "";
        product.Category = request.Category.Trim();
        product.Price = request.Price;
        product.Stock = request.Stock;
        product.Rating = request.Rating;
        product.ImageUrl = request.ImageUrl.Trim();
    }

    private static ProductDto ToDto(Product p) =>
        new(p.Id, p.Name, p.Description, p.Category, p.Price, p.Stock, p.Rating, p.ImageUrl);
}
