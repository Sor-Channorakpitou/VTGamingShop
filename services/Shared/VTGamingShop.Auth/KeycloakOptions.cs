namespace VTGamingShop.Auth;

public class KeycloakOptions
{
    public const string SectionName = "Keycloak";

    // Issuer exactly as it appears in tokens, i.e. the URL the browser uses,
    // e.g. "http://localhost:8080/auth/realms/vtshop".
    public string Issuer { get; set; } = "";

    // Where this service fetches the realm's OpenID configuration and signing keys.
    // Inside Docker this is the container address, e.g.
    // "http://keycloak:8080/auth/realms/vtshop/.well-known/openid-configuration".
    // Defaults to the issuer's discovery document.
    public string? MetadataAddress { get; set; }

    // The audience Keycloak adds to storefront tokens (audience mapper in the realm).
    public string Audience { get; set; } = "vtshop-api";

    public bool RequireHttpsMetadata { get; set; } = true;
}
