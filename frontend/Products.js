document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("productGrid");
    const status = document.getElementById("productStatus");
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");

    const escapeHtml = (text) =>
        String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

    const stars = (rating) => "★".repeat(rating) + "☆".repeat(5 - rating);

    const card = (p) => `
        <div class="bg-white dark:bg-gray-800 rounded shadow-sm p-6 hover:shadow-lg transition">
            <img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.name)}" class="mx-auto h-50" />
            <h3 class="font-semibold mt-4 text-2xl">${escapeHtml(p.name)}</h3>
            <p class="text-purple-600 dark:text-white font-bold text-xl">$${p.price.toFixed(2)}</p>
            <div class="text-yellow-400 text-xl">${stars(p.rating)}</div>
            ${p.stock > 0
                ? `<button class="btn zoom w-full mt-3 rounded text-sm py-2" data-product-id="${p.id}">Add to Cart</button>`
                : `<button class="w-full mt-3 rounded text-sm py-2 bg-gray-400 text-white font-bold cursor-not-allowed" disabled>Out of Stock</button>`}
        </div>`;

    const showStatus = (message) => {
        status.textContent = message;
        status.classList.toggle("hidden", !message);
    };

    async function loadProducts(search = "") {
        showStatus("Loading products...");
        grid.innerHTML = "";
        try {
            const query = new URLSearchParams({ pageSize: "100" });
            if (search) query.set("search", search);

            const result = await apiGet(`/api/products?${query}`);
            grid.innerHTML = result.items.map(card).join("");
            showStatus(result.items.length ? "" : `No products match "${search}".`);
        } catch (error) {
            console.error(error);
            showStatus("Could not load products. Please try again later.");
        }
    }

    const runSearch = () => loadProducts(searchInput.value.trim());
    searchButton.addEventListener("click", runSearch);
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") runSearch();
    });

    loadProducts();
});
