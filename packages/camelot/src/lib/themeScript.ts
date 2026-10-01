export const THEME_STORAGE_KEY = "pk-theme";

/**
 * Put this inline in <head> so the theme is set before first paint. It mirrors ThemeProvider's
 * resolution and must stay dependency-free. Pass the same fallback as ThemeProvider's defaultPreference.
 */
export function themeScriptFor(fallback: "light" | "dark" | "system" = "system") {
  return `(function(){try{var p=localStorage.getItem("${THEME_STORAGE_KEY}");if(p!=="light"&&p!=="dark"&&p!=="system")p="${fallback}";var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})();`;
}

export const themeScript = themeScriptFor();
