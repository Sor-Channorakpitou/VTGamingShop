// Where the storefront finds the backend.
// Behind nginx (docker compose) the API shares the page's origin, so paths stay relative.
// When the pages are opened another way (VS Code Live Server, or straight from disk),
// the Catalog service is called directly on its local port.
const API_BASE =
    location.protocol === "file:" || location.port === "5500"
        ? "http://localhost:5101"
        : "";

async function apiGet(path) {
    const response = await fetch(API_BASE + path);
    if (!response.ok) {
        throw new Error(`GET ${path} failed with ${response.status}`);
    }
    return response.json();
}
