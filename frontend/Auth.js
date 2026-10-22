// Sign-in with Keycloak using the OAuth 2.0 authorization code flow with PKCE.
// The login and signup forms live on Keycloak (themed to match the shop); this file sends the
// user there, swaps the returned code for tokens on Callback.html, and keeps the tokens for the tab.
//
// Tokens are kept in sessionStorage: they last for the tab and are gone when it closes.
// Needs Api.js first (for API_BASE).
const Auth = (() => {
    const CLIENT_ID = "storefront";
    const OIDC = `${API_BASE}/auth/realms/vtshop/protocol/openid-connect`;
    const TOKENS_KEY = "vt.auth.tokens";
    const PENDING_KEY = "vt.auth.pending";

    const pageUrl = (page) => new URL(page, location.href).href;
    const redirectUri = pageUrl("Callback.html");

    // ---- small helpers -------------------------------------------------------

    function base64Url(bytes) {
        let binary = "";
        bytes.forEach((b) => (binary += String.fromCharCode(b)));
        return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }

    function randomString(byteCount) {
        return base64Url(crypto.getRandomValues(new Uint8Array(byteCount)));
    }

    async function sha256(text) {
        return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
    }

    // Reads a JWT's payload for display only; the gateway and services do the real validation.
    function decodeJwt(token) {
        const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            [...atob(payload)].map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
        );
        return JSON.parse(json);
    }

    function read(key) {
        try {
            return JSON.parse(sessionStorage.getItem(key));
        } catch {
            return null;
        }
    }

    function write(key, value) {
        if (value === null) sessionStorage.removeItem(key);
        else sessionStorage.setItem(key, JSON.stringify(value));
    }

    function storeTokens(response) {
        const now = Date.now();
        write(TOKENS_KEY, {
            accessToken: response.access_token,
            idToken: response.id_token,
            refreshToken: response.refresh_token,
            expiresAt: now + response.expires_in * 1000,
            refreshExpiresAt: response.refresh_expires_in ? now + response.refresh_expires_in * 1000 : now,
        });
    }

    async function tokenRequest(params) {
        const response = await fetch(`${OIDC}/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ client_id: CLIENT_ID, ...params }),
        });
        if (!response.ok) throw new Error(`Token request failed with ${response.status}`);
        return response.json();
    }

    // Only plain page names (e.g. "Account.html") are accepted as a place to return to.
    function safeReturnTo(value) {
        return /^[A-Za-z]+\.html$/.test(value || "") ? value : "Account.html";
    }

    // ---- public API ----------------------------------------------------------

    async function startSignIn(endpoint, returnTo) {
        const verifier = randomString(48);
        const state = randomString(16);
        write(PENDING_KEY, { verifier, state, returnTo: safeReturnTo(returnTo) });

        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            response_type: "code",
            scope: "openid profile email",
            redirect_uri: redirectUri,
            state,
            code_challenge: base64Url(await sha256(verifier)),
            code_challenge_method: "S256",
        });
        location.assign(`${OIDC}/${endpoint}?${params}`);
    }

    const login = (returnTo) => startSignIn("auth", returnTo);
    const register = (returnTo) => startSignIn("registrations", returnTo);

    // Called by Callback.html. Returns the page to go back to.
    async function handleCallback() {
        const params = new URLSearchParams(location.search);
        const pending = read(PENDING_KEY);
        write(PENDING_KEY, null);

        if (params.has("error")) {
            throw new Error(params.get("error_description") || params.get("error"));
        }
        if (!pending || params.get("state") !== pending.state) {
            throw new Error("This sign-in link is no longer valid. Please try again.");
        }

        storeTokens(await tokenRequest({
            grant_type: "authorization_code",
            code: params.get("code"),
            redirect_uri: redirectUri,
            code_verifier: pending.verifier,
        }));
        return pending.returnTo;
    }

    // A valid access token, refreshed when close to expiry, or null when signed out.
    async function getAccessToken() {
        const tokens = read(TOKENS_KEY);
        if (!tokens) return null;
        if (Date.now() < tokens.expiresAt - 30_000) return tokens.accessToken;

        if (tokens.refreshToken && Date.now() < tokens.refreshExpiresAt - 5_000) {
            try {
                storeTokens(await tokenRequest({ grant_type: "refresh_token", refresh_token: tokens.refreshToken }));
                return read(TOKENS_KEY).accessToken;
            } catch (error) {
                console.warn("Session refresh failed", error);
            }
        }
        write(TOKENS_KEY, null);
        return null;
    }

    // The signed-in user from the ID token, or null.
    async function getUser() {
        if (!(await getAccessToken())) return null;
        const claims = decodeJwt(read(TOKENS_KEY).idToken);
        return {
            firstName: claims.given_name || "",
            lastName: claims.family_name || "",
            name: claims.name || claims.preferred_username || claims.email,
            email: claims.email || "",
            roles: claims.roles || [],
        };
    }

    function logout() {
        const tokens = read(TOKENS_KEY);
        write(TOKENS_KEY, null);
        const params = new URLSearchParams({ client_id: CLIENT_ID, post_logout_redirect_uri: pageUrl("Home.html") });
        if (tokens?.idToken) params.set("id_token_hint", tokens.idToken);
        location.assign(`${OIDC}/logout?${params}`);
    }

    const accountConsoleUrl = `${API_BASE}/auth/realms/vtshop/account`;

    return { login, register, handleCallback, getAccessToken, getUser, logout, accountConsoleUrl };
})();
