using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Catalog.Api.Products;
using VTGamingShop.Auth;
using VTGamingShop.Testing;

namespace Catalog.Tests;

// Uses its own factory (and so its own in-memory database), because these tests change data.
public class AdminProductEndpointsTests(AdminProductEndpointsTests.Factory factory)
    : IClassFixture<AdminProductEndpointsTests.Factory>
{
    public class Factory : CatalogApiFactory;

    private static readonly ProductRequest NewKeyboard =
        new("Mechanical Keyboard", "Hot-swappable switches.", "Keyboards", 89.99m, 15, 4, "Images/Cart/mouse.png");

    private HttpClient ClientWith(string? token)
    {
        var client = factory.CreateClient();
        if (token is not null)
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    [Fact]
    public async Task Create_without_token_is_unauthorized()
    {
        var response = await ClientWith(null).PostAsJsonAsync("/api/products", NewKeyboard);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Create_as_customer_is_forbidden()
    {
        var response = await ClientWith(TestJwt.Create(Roles.Customer)).PostAsJsonAsync("/api/products", NewKeyboard);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Token_for_another_audience_is_rejected()
    {
        var response = await ClientWith(TestJwt.CreateForAudience("some-other-api", Roles.Admin)).PostAsJsonAsync("/api/products", NewKeyboard);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Admin_can_create_update_and_delete_a_product()
    {
        var client = ClientWith(TestJwt.Create(Roles.Customer, Roles.Admin));

        var create = await client.PostAsJsonAsync("/api/products", NewKeyboard);
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var created = await create.Content.ReadFromJsonAsync<ProductDto>();
        Assert.NotNull(created);
        Assert.Equal($"/api/products/{created.Id}", create.Headers.Location?.ToString());

        var update = await client.PutAsJsonAsync($"/api/products/{created.Id}", NewKeyboard with { Price = 79.99m, Stock = 0 });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        var updated = await client.GetFromJsonAsync<ProductDto>($"/api/products/{created.Id}");
        Assert.Equal(79.99m, updated!.Price);
        Assert.Equal(0, updated.Stock);

        var delete = await client.DeleteAsync($"/api/products/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);
        var afterDelete = await client.GetAsync($"/api/products/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, afterDelete.StatusCode);
    }

    [Fact]
    public async Task Create_rejects_invalid_product()
    {
        var invalid = NewKeyboard with { Name = " ", Price = -1, Rating = 6 };

        var response = await ClientWith(TestJwt.Create(Roles.Admin)).PostAsJsonAsync("/api/products", invalid);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemBody>();
        Assert.NotNull(problem);
        Assert.Equal(["name", "price", "rating"], problem.Errors.Keys.Order());
    }

    [Fact]
    public async Task Update_and_delete_return_404_for_unknown_product()
    {
        var client = ClientWith(TestJwt.Create(Roles.Admin));

        Assert.Equal(HttpStatusCode.NotFound, (await client.PutAsJsonAsync("/api/products/9999", NewKeyboard)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.DeleteAsync("/api/products/9999")).StatusCode);
    }

    private record ValidationProblemBody(Dictionary<string, string[]> Errors);
}
