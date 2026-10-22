using System.Net;
using System.Net.Http.Json;
using Catalog.Api.Data;
using Catalog.Api.Products;

namespace Catalog.Tests;

public class ProductEndpointsTests(CatalogApiFactory factory) : IClassFixture<CatalogApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task List_returns_first_page_of_seeded_products()
    {
        var result = await _client.GetFromJsonAsync<PagedResult<ProductDto>>("/api/products?pageSize=5");

        Assert.NotNull(result);
        Assert.Equal(SeedData.Products.Length, result.TotalCount);
        Assert.Equal(5, result.Items.Count);
        Assert.Equal([1, 2, 3, 4, 5], result.Items.Select(p => p.Id));
    }

    [Fact]
    public async Task List_pages_through_results()
    {
        var result = await _client.GetFromJsonAsync<PagedResult<ProductDto>>("/api/products?page=2&pageSize=5");

        Assert.NotNull(result);
        Assert.Equal(2, result.Page);
        Assert.Equal(6, result.Items[0].Id);
    }

    [Fact]
    public async Task List_filters_by_search_text_case_insensitively()
    {
        var result = await _client.GetFromJsonAsync<PagedResult<ProductDto>>("/api/products?search=HEADSET");

        Assert.NotNull(result);
        Assert.NotEmpty(result.Items);
        Assert.All(result.Items, p => Assert.Contains("headset", (p.Name + p.Description).ToLower()));
    }

    [Fact]
    public async Task List_filters_by_category()
    {
        var result = await _client.GetFromJsonAsync<PagedResult<ProductDto>>("/api/products?category=Mice");

        Assert.NotNull(result);
        Assert.Equal(SeedData.Products.Count(p => p.Category == "Mice"), result.TotalCount);
        Assert.All(result.Items, p => Assert.Equal("Mice", p.Category));
    }

    [Fact]
    public async Task List_sorts_by_price()
    {
        var asc = await _client.GetFromJsonAsync<PagedResult<ProductDto>>("/api/products?sort=price-asc&pageSize=100");
        var desc = await _client.GetFromJsonAsync<PagedResult<ProductDto>>("/api/products?sort=price-desc&pageSize=100");

        Assert.Equal(asc!.Items.Select(p => p.Price).Order(), asc.Items.Select(p => p.Price));
        Assert.Equal(desc!.Items.Select(p => p.Price).OrderDescending(), desc.Items.Select(p => p.Price));
    }

    [Fact]
    public async Task List_sorts_by_rating_with_stable_ties()
    {
        var result = await _client.GetFromJsonAsync<PagedResult<ProductDto>>("/api/products?sort=rating&pageSize=100");

        var expected = SeedData.Products.OrderByDescending(p => p.Rating).ThenBy(p => p.Id).Select(p => p.Id);
        Assert.Equal(expected, result!.Items.Select(p => p.Id));
    }

    [Theory]
    [InlineData("page=0")]
    [InlineData("pageSize=0")]
    [InlineData("pageSize=101")]
    [InlineData("sort=cheapest")]
    public async Task List_rejects_invalid_paging(string query)
    {
        var response = await _client.GetAsync($"/api/products?{query}");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Get_returns_product()
    {
        var product = await _client.GetFromJsonAsync<ProductDto>("/api/products/1");

        Assert.NotNull(product);
        Assert.Equal("Gaming Headset", product.Name);
        Assert.Equal(49.99m, product.Price);
    }

    [Fact]
    public async Task Get_returns_404_for_unknown_product()
    {
        var response = await _client.GetAsync("/api/products/9999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Categories_are_distinct_and_sorted()
    {
        var categories = await _client.GetFromJsonAsync<List<string>>("/api/products/categories");

        Assert.NotNull(categories);
        Assert.Equal(SeedData.Products.Select(p => p.Category).Distinct().Order(), categories);
    }

    [Theory]
    [InlineData("/health/live")]
    [InlineData("/health/ready")]
    public async Task Health_checks_are_healthy(string path)
    {
        var response = await _client.GetAsync(path);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
