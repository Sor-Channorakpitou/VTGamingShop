using System.Security.Cryptography;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

namespace VTGamingShop.Testing;

// Issues tokens shaped like Keycloak's (issuer, audience, flat "roles" claim), signed with
// a key generated per test run, and points JWT bearer validation at that key instead of Keycloak.
public static class TestJwt
{
    public const string Issuer = "http://keycloak.test/auth/realms/vtshop";
    public const string Audience = "vtshop-api";

    private static readonly SymmetricSecurityKey Key = new(RandomNumberGenerator.GetBytes(32));

    public static string Create(params string[] roles) => CreateForAudience(Audience, roles);

    public static string CreateForAudience(string audience, params string[] roles) =>
        new JsonWebTokenHandler().CreateToken(new SecurityTokenDescriptor
        {
            Issuer = Issuer,
            Expires = DateTime.UtcNow.AddMinutes(5),
            SigningCredentials = new SigningCredentials(Key, SecurityAlgorithms.HmacSha256),
            Claims = new Dictionary<string, object>
            {
                ["aud"] = audience,
                ["sub"] = "test-user",
                ["preferred_username"] = "tester",
                ["roles"] = roles,
            },
        });

    public static IServiceCollection UseTestJwt(this IServiceCollection services) =>
        services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
        {
            var configuration = new OpenIdConnectConfiguration { Issuer = Issuer };
            configuration.SigningKeys.Add(Key);
            options.Configuration = configuration;
            options.ConfigurationManager = new StaticConfigurationManager<OpenIdConnectConfiguration>(configuration);
            options.TokenValidationParameters.ValidIssuer = Issuer;
            options.TokenValidationParameters.ValidAudience = Audience;
            options.TokenValidationParameters.IssuerSigningKey = Key;
        });
}
