"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme]   = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("pm-theme") as "dark" | "light" | null;
    const initial = saved ?? "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("pm-theme", next);
  }

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 12px",
        background: "var(--glass-inner)",
        border: "1px solid var(--border)",
        borderRadius: 999,
        cursor: "pointer",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.10em",
        textTransform: "uppercase",
        color: "var(--text-2)",
        userSelect: "none",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-2)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-2)";
      }}
    >
      {/* Toggle track */}
      <span
        style={{
          position: "relative",
          display: "inline-block",
          width: 30,
          height: 16,
          borderRadius: 999,
          background: isDark
            ? "rgba(16,185,129,0.15)"
            : "rgba(16,185,129,0.28)",
          border: "1px solid rgba(16,185,129,0.35)",
          flexShrink: 0,
          transition: "background 0.25s",
        }}
      >
        {/* Thumb */}
        <span
          style={{
            position: "absolute",
            top: 2,
            left: isDark ? 2 : 14,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "var(--green)",
            boxShadow: "0 0 8px var(--green-glow)",
            transition: "left 0.22s cubic-bezier(0.34,1.56,0.64,1)",
            display: "block",
          }}
        />
      </span>
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}