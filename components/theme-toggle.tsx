"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark"

    // Get button center for the circle origin
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) {
      setTheme(newTheme)
      return
    }

    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    // Calculate the max radius needed to cover the entire viewport
    const maxRadius = Math.ceil(
      Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      )
    )

    // Try the View Transition API first (Chrome/Edge), fallback for others
    if (document.startViewTransition) {
      document.documentElement.style.setProperty("--reveal-x", `${x}px`)
      document.documentElement.style.setProperty("--reveal-y", `${y}px`)
      document.documentElement.style.setProperty("--reveal-r", `${maxRadius}px`)

      const transition = document.startViewTransition(() => {
        setTheme(newTheme)
      })

      transition.finished.then(() => {
        document.documentElement.style.removeProperty("--reveal-x")
        document.documentElement.style.removeProperty("--reveal-y")
        document.documentElement.style.removeProperty("--reveal-r")
      })
    } else {
      // Fallback: manual clip-path overlay for Firefox/Safari
      const overlay = document.createElement("div")
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 99999;
        pointer-events: none;
        clip-path: circle(0px at ${x}px ${y}px);
        transition: clip-path 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: clip-path;
      `

      // The overlay takes on the NEW theme's background
      const isDarkNow = resolvedTheme === "dark"
      overlay.style.backgroundColor = isDarkNow
        ? "oklch(1 0 0)"       // light bg
        : "oklch(0.148 0.004 228.8)" // dark bg

      document.body.appendChild(overlay)

      // Force reflow then expand
      overlay.offsetHeight
      overlay.style.clipPath = `circle(${maxRadius}px at ${x}px ${y}px)`

      // Switch theme partway through the animation
      const switchTimeout = setTimeout(() => {
        setTheme(newTheme)
      }, 300)

      // Clean up after animation
      overlay.addEventListener("transitionend", () => {
        clearTimeout(switchTimeout)
        setTheme(newTheme)
        overlay.remove()
      }, { once: true })

      // Safety timeout
      setTimeout(() => {
        setTheme(newTheme)
        overlay.remove()
      }, 800)
    }
  }

  return (
    <Button
      ref={buttonRef}
      variant="outline"
      size="icon"
      onClick={handleToggle}
      className="rounded-full"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      )}
    </Button>
  )
}
