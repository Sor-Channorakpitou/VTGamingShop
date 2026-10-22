using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using VTGamingShop.Testing;

namespace Gateway.Tests;

// Runs the gateway in memory. Every cluster points at a closed local port, so a request
// that gets past auth and rate limiting comes back as 502 Bad Gateway from YARP.
public class GatewayFactory : WebApplicationFactory<Program>
{
    public const string UnreachableBackend = "http://127.0.0.1:9/";

    protected virtual int ApiPermitLimit => 1000;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ReverseProxy:Clusters:catalog:Destinations:catalog:Address", UnreachableBackend);
        builder.UseSetting("ReverseProxy:Clusters:keycloak:Destinations:keycloak:Address", UnreachableBackend);
        builder.UseSetting("ReverseProxy:Clusters:storefront:Destinations:storefront:Address", UnreachableBackend);
        builder.UseSetting("RateLimiting:Api:PermitLimit", ApiPermitLimit.ToString());
        builder.UseSetting("RateLimiting:Api:WindowSeconds", "60");
        builder.ConfigureServices(services => services.UseTestJwt());
    }
}

public class LowRateLimitGatewayFactory : GatewayFactory
{
    public const int Limit = 3;
    protected override int ApiPermitLimit => Limit;
}
