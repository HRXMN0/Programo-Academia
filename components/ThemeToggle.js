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

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center transition-all"
      aria-label="Toggle dark/light mode"
    >
      {isDark ? (
        <span className="text-yellow-400 text-xl select-none">☀️</span>
      ) : (
        <span className="text-primary text-xl select-none">🌙</span>
      )}
    </button>
  );
}
