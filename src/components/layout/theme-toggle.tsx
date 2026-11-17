"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, saveTheme, type Theme } from "@/lib/theme";

// The theme lives on <html> (set by the boot script or applyTheme), so read it from there and
// re-render whenever it changes, including changes made outside this button.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const readTheme = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");
// The server can't know the saved theme, so it renders the default and the client corrects it.
const readServerTheme = (): Theme => "dark";

/** Switches the public site between dark and light. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, readTheme, readServerTheme);
  const isLight = theme === "light";
  const label = isLight ? "Switch to dark mode" : "Switch to light mode";

  const toggle = () => {
    const next: Theme = isLight ? "dark" : "light";
    applyTheme(next);
    saveTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`flex h-10 w-10 items-center justify-center rounded-lg border border-line text-fg-muted transition-colors duration-200 hover:border-line-strong hover:text-fg ${className}`}
    >
      {isLight ? <Moon className="h-[1.05rem] w-[1.05rem]" /> : <Sun className="h-[1.05rem] w-[1.05rem]" />}
    </button>
  );
}
