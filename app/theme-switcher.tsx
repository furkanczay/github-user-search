"use client";

import {useTheme} from "next-themes";
import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if(!mounted) return null

  return (
    <div>
      
      <button className="flex items-center gap-6" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === 'dark' ? (<>Light <FaSun /></>) : (<>Dark <FaMoon /></>)}</button>
    </div>
  )
};