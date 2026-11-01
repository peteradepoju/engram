"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/lib/hooks/use-user";

const LINKS = [
  { href: "/today", label: "Today" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/review", label: "Review" },
  { href: "/papers", label: "Papers" },
  { href: "/lab", label: "Lab" },
  { href: "/hub", label: "Hub" },
  { href: "/career", label: "Career" },
  { href: "/progress", label: "Progress" },
];

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden>
        <rect width="64" height="64" rx="14" fill="var(--accent)" />
        <g fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round">
          <circle cx="32" cy="32" r="7" />
          <path d="M32 25V12M38 35l11 7M26 35l-11 7M32 12l-6-4M32 12l6-4" />
        </g>
        <circle cx="49" cy="42" r="4" fill="#ffd27a" />
        <circle cx="15" cy="42" r="4" fill="#ffd27a" />
      </svg>
      <span className="text-[1.05rem]" style={{ fontFamily: "var(--font-serif)" }}>Engram</span>
    </Link>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  useEffect(() => {
    try {
      const t = localStorage.getItem("engram-theme");
      if (t === "light" || t === "dark") setTheme(t);
    } catch {}
  }, []);
  const cycle = () => {
    const next = theme === "system" ? "dark" : theme === "dark" ? "light" : "system";
    setTheme(next);
    try {
      if (next === "system") { localStorage.removeItem("engram-theme"); delete document.documentElement.dataset.theme; }
      else { localStorage.setItem("engram-theme", next); document.documentElement.dataset.theme = next; }
    } catch {}
  };
  const label = theme === "system" ? "Theme: system" : theme === "dark" ? "Theme: dark" : "Theme: light";
  return (
    <button onClick={cycle} className="rounded-lg p-2 text-ink-2 hover:bg-surface-2" aria-label={label} title={label}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        {theme === "dark" ? <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /> : theme === "light" ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></> : <><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" /></>}
      </svg>
    </button>
  );
}

export function SiteHeader() {
  const path = usePathname();
  const { user } = useUser();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Logo />
        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((l) => {
            const active = path === l.href || path.startsWith(l.href + "/");
            return (
              <Link key={l.href} href={l.href}
                className={`rounded-lg px-2.5 py-1.5 text-sm ${active ? "bg-accent-soft font-semibold text-accent" : "text-ink-2 hover:bg-surface-2"}`}>
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Link href="/search" className="rounded-lg p-2 text-ink-2 hover:bg-surface-2" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </Link>
          <ThemeToggle />
          {user ? (
            <Link href="/settings" className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent" aria-label="Settings">
              {(user.user_metadata?.full_name || user.email || "?").slice(0, 1).toUpperCase()}
            </Link>
          ) : (
            <Link href="/login" className="btn ml-1 !py-1.5">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}

const TABS = [
  { href: "/today", label: "Today", icon: "◉" },
  { href: "/curriculum", label: "Learn", icon: "▤" },
  { href: "/papers", label: "Papers", icon: "❡" },
  { href: "/lab", label: "Lab", icon: "⚗" },
  { href: "/more", label: "More", icon: "⋯" },
];

export function BottomTabs() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur md:hidden" aria-label="Tabs"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="grid grid-cols-5">
        {TABS.map((t) => {
          const active = path === t.href || path.startsWith(t.href + "/") || (t.href === "/curriculum" && path.startsWith("/learn"));
          return (
            <Link key={t.href} href={t.href} className={`flex flex-col items-center gap-0.5 py-2 text-[0.7rem] ${active ? "text-accent" : "text-ink-3"}`}>
              <span className="text-lg leading-none" aria-hidden>{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
