import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const ThemeToggle = () => {
  const getInitialTheme = () => {
    // Check localStorage first
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      return storedTheme;
    }
    // If no preference is stored, check the user's system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      // If the user's preference changes, update the state to match it
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2 rounded-xl transition-colors hover:bg-black/[0.04] dark:hover:bg-white/5",
        "focus:outline-hidden"
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun size={20} className="text-yellow-300 transition-transform duration-500 rotate-180" />
      ) : (
        <Moon size={20} className="text-blue-900 transition-transform duration-500 rotate-0" />
      )}
    </button>
  );
};
