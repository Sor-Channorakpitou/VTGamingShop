document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("themeToggle");
    const html = document.documentElement;

    if (localStorage.getItem("theme") === "dark") {
        html.classList.add("dark");
        btn.textContent = "🌓︎";
    }

    btn.onclick = () => {
        html.classList.toggle("dark");

        if (html.classList.contains("dark")) {
        btn.textContent = "🌓︎";
        localStorage.setItem("theme", "dark");
        } else {
        btn.textContent = "🌓︎";
        localStorage.setItem("theme", "light");
        }
    };
});