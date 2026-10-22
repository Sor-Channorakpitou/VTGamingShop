// Where the storefront finds the backend.
// Through the gateway (docker compose, http://localhost:8080) everything shares the page's origin,
// so paths stay relative. When the pages are opened another way (VS Code Live Server, or straight
// from disk), requests go to the gateway on its local port.
const API_BASE =
    location.protocol === "file:" || location.port === "5500"
        ? "http://localhost:8080"
        : "";

async function apiGet(path) {
    const headers = {};
    const token = typeof Auth !== "undefined" ? await Auth.getAccessToken() : null;
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(API_BASE + path, { headers });
    if (!response.ok) {
        throw new Error(`GET ${path} failed with ${response.status}`);
    }
    return response.json();
}
