import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("color-theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("color-theme", "dark");
      setIsDark(true);
    }
  };

  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group relative w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-outline-variant bg-surface-container-lowest/80 backdrop-blur text-on-surface-variant shadow-card hover:text-secondary hover:border-secondary/40 hover:shadow-card-hover active:scale-95 transition-all duration-200"
      aria-label={label}
      title={label}
    >
      {/* Both glyphs stay mounted and cross-fade, so the swap reads as one
          control changing state instead of an icon popping in and out. */}
      <span
        className={`material-symbols-outlined absolute text-[20px] select-none transition-all duration-300 ease-out-expo ${
          isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
        }`}
        aria-hidden="true"
      >
        light_mode
      </span>
      <span
        className={`material-symbols-outlined absolute text-[20px] select-none transition-all duration-300 ease-out-expo ${
          isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
        }`}
        aria-hidden="true"
      >
        dark_mode
      </span>
    </button>
  );
}
