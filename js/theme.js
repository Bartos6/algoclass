(() => {
  const root = document.documentElement;
  const button = document.querySelector("[data-theme-toggle]");
  const saved = localStorage.getItem("algoclass-theme");
  const systemDark = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const initialTheme = saved || (systemDark ? "dark" : "light");

  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (button) {
      button.textContent = theme === "dark" ? "☀️" : "🌙";
      button.setAttribute(
        "aria-label",
        theme === "dark" ? "Włącz jasny motyw" : "Włącz ciemny motyw"
      );
    }
  }

  applyTheme(initialTheme);

  if (button) {
    button.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      localStorage.setItem("algoclass-theme", next);
      applyTheme(next);
    });
  }
})();
