using Catalog.Api.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Api.Products;

public record ProductDto(
    int Id, string Name, string Description, string Category,
    decimal Price, int Stock, int Rating, string ImageUrl);

public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);

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
}
