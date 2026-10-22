using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace VTGamingShop.Auth;

public static class Policies
{
    public const string Authenticated = "authenticated";
    public const string Admin = "admin";
}

public static class Roles
{
    public const string Customer = "customer";
    public const string Admin = "admin";
}

public static class AuthExtensions
{
    // JWT bearer validation against the Keycloak realm, plus the shared authorization policies.
    // Keycloak puts the user's realm roles in a flat "roles" claim (protocol mapper in the realm).
    public static IServiceCollection AddKeycloakJwtAuth(this IServiceCollection services, IConfiguration configuration)
    {
        var keycloak = configuration.GetSection(KeycloakOptions.SectionName).Get<KeycloakOptions>() ?? new KeycloakOptions();

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;
                options.RequireHttpsMetadata = keycloak.RequireHttpsMetadata;
                options.MetadataAddress = keycloak.MetadataAddress
                    ?? $"{keycloak.Issuer.TrimEnd('/')}/.well-known/openid-configuration";
                options.TokenValidationParameters.ValidIssuer = keycloak.Issuer;
                options.TokenValidationParameters.ValidAudience = keycloak.Audience;
                options.TokenValidationParameters.NameClaimType = "preferred_username";
                options.TokenValidationParameters.RoleClaimType = "roles";
            });

        services.AddAuthorizationBuilder()
            .AddPolicy(Policies.Authenticated, policy => policy.RequireAuthenticatedUser())
            .AddPolicy(Policies.Admin, policy => policy.RequireRole(Roles.Admin));

        return services;
    }
}
