namespace Gateway.Api;

public class RateLimitOptions
{
    public const string SectionName = "RateLimiting";
    public const string ApiPolicy = "api";
    public const string AuthPolicy = "auth";

    public FixedWindowLimit Api { get; set; } = new() { PermitLimit = 100, WindowSeconds = 10 };

    // Keycloak pages pull in several stylesheets and scripts per page view, so this is looser.
    // Password guessing is handled by Keycloak's own brute-force protection.
    public FixedWindowLimit Auth { get; set; } = new() { PermitLimit = 300, WindowSeconds = 60 };
}

public class FixedWindowLimit
{
    public int PermitLimit { get; set; }
    public int WindowSeconds { get; set; }
}
