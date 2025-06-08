"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div>
      <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        {theme === "dark" ? <FaSun /> : <FaMoon />}
      </button>
    </div>
  );
}
