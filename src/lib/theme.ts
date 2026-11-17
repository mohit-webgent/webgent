/**
 * Light / dark theme for the public site. The choice is stored in localStorage and applied as
 * data-theme="light" on <html>, which switches the colour variables in globals.css. Dark is the
 * default. The admin console always stays dark.
 */
export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "webgent-theme";

const THEME_COLORS: Record<Theme, string> = { dark: "#040405", light: "#F5F5F3" };

export function getStoredTheme(): Theme {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

/** Sets the theme on <html> and the browser chrome colour. Does not save it. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "light") {
    root.dataset.theme = "light";
  } else {
    delete root.dataset.theme;
  }
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[theme]);
}

export function saveTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage: the theme still applies for this visit.
  }
}

/**
 * Runs in <head> before the page paints, so a saved light theme never flashes dark first.
 * Kept as plain ES5 because it runs before any bundle loads.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{if(location.pathname.indexOf("/admin")===0)return;if(localStorage.getItem("${THEME_STORAGE_KEY}")!=="light")return;var r=document.documentElement;r.setAttribute("data-theme","light");r.classList.remove("dark");r.classList.add("light");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","${THEME_COLORS.light}");}catch(e){}})();`;
