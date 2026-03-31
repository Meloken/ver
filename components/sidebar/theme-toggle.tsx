"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export const ThemeToggle = ({ open = true }: { open?: boolean }) => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div onClick={toggleTheme} className="flex items-center gap-2 cursor-pointer w-full text-sm">
      {theme === "dark" ? (
        <>
          <Sun className="h-4 w-4" />
          {open && <span>Light Mode</span>}
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          {open && <span>Dark Mode</span>}
        </>
      )}
    </div>
  )
}

