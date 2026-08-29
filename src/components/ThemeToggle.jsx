import { useEffect } from "react";

// Este componente NO renderiza nada visible.
// Solo fuerza el modo oscuro permanente en el sitio.
export const ThemeToggle = () => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  return null;
};
