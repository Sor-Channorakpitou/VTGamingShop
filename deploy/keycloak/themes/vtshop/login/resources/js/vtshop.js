// Keeps the login pages in step with the storefront: same dark-mode setting
// (the storefront saves it in localStorage, which is shared because both are served
// through the gateway on the same origin), a theme toggle and a way back to the shop.
(function () {
    var html = document.documentElement;

    function readTheme() {
        try { return localStorage.getItem("theme"); } catch (e) { return null; }
    }

    function saveTheme(value) {
        try { localStorage.setItem("theme", value); } catch (e) { /* storage blocked */ }
    }

    if (readTheme() === "dark") html.classList.add("dark");

    document.addEventListener("DOMContentLoaded", function () {
        var back = document.createElement("a");
        back.href = "/";
        back.className = "vt-corner vt-back";
        back.setAttribute("aria-label", "Back to the shop");
        back.textContent = "←";

        var toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "vt-corner vt-theme";
        toggle.setAttribute("aria-label", "Toggle dark mode");
        toggle.textContent = "🌓︎";
        toggle.onclick = function () {
            saveTheme(html.classList.toggle("dark") ? "dark" : "light");
        };

        document.body.appendChild(back);
        document.body.appendChild(toggle);
    });
})();
