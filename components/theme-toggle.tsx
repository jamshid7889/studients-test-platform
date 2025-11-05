"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Check localStorage or system preference
    const isDarkMode =
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
    setIsDark(isDarkMode)
    updateTheme(isDarkMode)
  }, [])

  const updateTheme = (dark: boolean) => {
    const htmlElement = document.documentElement
    if (dark) {
      htmlElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      htmlElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const toggleTheme = () => {
    setIsDark(!isDark)
    updateTheme(!isDark)
  }

  if (!isMounted) return null

  return (
    <Button
      onClick={toggleTheme}
      size="sm"
      variant="outline"
      className="w-10 h-10 p-0 bg-transparent"
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? "🌙" : "☀️"}
    </Button>
  )
}
