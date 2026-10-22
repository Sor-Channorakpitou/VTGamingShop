using System.Globalization;
using System.Threading.RateLimiting;
using Gateway.Api;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using VTGamingShop.Auth;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddKeycloakJwtAuth(builder.Configuration);

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// Fixed-window limits per client IP. Routes pick a policy in the ReverseProxy config.
var rateLimits = builder.Configuration.GetSection(RateLimitOptions.SectionName).Get<RateLimitOptions>() ?? new RateLimitOptions();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = (context, _) =>
    {
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
            context.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString(CultureInfo.InvariantCulture);
        return ValueTask.CompletedTask;
    };
    options.AddPolicy(RateLimitOptions.ApiPolicy, context => PerClientIp(context, rateLimits.Api));
    options.AddPolicy(RateLimitOptions.AuthPolicy, context => PerClientIp(context, rateLimits.Auth));
});

// Only needed when the storefront is served from somewhere other than the gateway
// (e.g. VS Code Live Server on port 5500).
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
    options.AddPolicy("storefront", policy => policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddHealthChecks();

var app = builder.Build();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapHealthChecks("/health/live");
app.MapHealthChecks("/health/ready");
app.MapReverseProxy();

app.Run();

static RateLimitPartition<string> PerClientIp(HttpContext context, FixedWindowLimit limit) =>
    RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = limit.PermitLimit,
            Window = TimeSpan.FromSeconds(limit.WindowSeconds),
            QueueLimit = 0,
        });

// Exposed for WebApplicationFactory in the test project.
public partial class Program;
