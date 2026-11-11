const themeToggle = document.querySelector("[data-theme-toggle]");
const storedTheme = localStorage.getItem("ucs-theme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("ucs-theme", theme);
  if (themeToggle) {
    const label = themeToggle.querySelector("[data-theme-label]");
    const icon = themeToggle.querySelector("svg, [data-lucide]");
    if (label)
      label.textContent = theme === "dark" ? "Light mode" : "Dark mode";
    if (icon) {
      const iconElement = document.createElement("i");
      iconElement.setAttribute(
        "data-lucide",
        theme === "dark" ? "sun" : "moon",
      );
      icon.replaceWith(iconElement);
      renderIcons(themeToggle);
    }
  }
}

applyTheme(storedTheme || preferredTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  });
}
