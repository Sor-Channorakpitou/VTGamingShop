using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using VTGamingShop.Auth;
using VTGamingShop.Testing;

namespace Gateway.Tests;

public class GatewayTests(GatewayFactory factory) : IClassFixture<GatewayFactory>
{
    private static readonly object AnyProduct = new { name = "x" };

    private HttpClient ClientWith(string? token)
    {
        var client = factory.CreateClient();
        if (token is not null)
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    [Theory]
    [InlineData("/health/live")]
    [InlineData("/health/ready")]
    public async Task Health_checks_are_healthy(string path)
    {
        var response = await ClientWith(null).GetAsync(path);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Theory]
    [InlineData("/api/products")]
    [InlineData("/api/products/1")]
    [InlineData("/auth/realms/vtshop/.well-known/openid-configuration")]
    [InlineData("/Products.html")]
    public async Task Public_routes_are_forwarded_without_a_token(string path)
    {
        var response = await ClientWith(null).GetAsync(path);

        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
    }

    [Fact]
    public async Task Product_writes_without_token_are_rejected_at_the_gateway()
    {
        var client = ClientWith(null);

        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/products", AnyProduct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PutAsJsonAsync("/api/products/1", AnyProduct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.DeleteAsync("/api/products/1")).StatusCode);
    }

    [Fact]
    public async Task Product_writes_as_customer_are_forbidden()
    {
        var response = await ClientWith(TestJwt.Create(Roles.Customer)).PostAsJsonAsync("/api/products", AnyProduct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Product_writes_as_admin_are_forwarded()
    {
        var response = await ClientWith(TestJwt.Create(Roles.Admin)).PostAsJsonAsync("/api/products", AnyProduct);

        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
    }
}

public class GatewayRateLimitTests(LowRateLimitGatewayFactory factory) : IClassFixture<LowRateLimitGatewayFactory>
{
    [Fact]
    public async Task Api_requests_over_the_limit_get_429_with_retry_after()
    {
        var client = factory.CreateClient();

        for (var i = 0; i < LowRateLimitGatewayFactory.Limit; i++)
            Assert.Equal(HttpStatusCode.BadGateway, (await client.GetAsync("/api/products")).StatusCode);

        var rejected = await client.GetAsync("/api/products");
        Assert.Equal(HttpStatusCode.TooManyRequests, rejected.StatusCode);
        Assert.True(rejected.Headers.RetryAfter?.Delta > TimeSpan.Zero);
    }

    [Fact]
    public async Task Storefront_is_not_limited_by_the_api_policy()
    {
        var client = factory.CreateClient();

        for (var i = 0; i < LowRateLimitGatewayFactory.Limit + 2; i++)
            Assert.Equal(HttpStatusCode.BadGateway, (await client.GetAsync("/Home.html")).StatusCode);
    }
}
