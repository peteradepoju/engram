"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="14" fill="var(--accent)" />
      <g fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round">
        <circle cx="32" cy="32" r="7" />
        <path d="M32 25V12M38 35l11 7M26 35l-11 7M32 12l-6-4M32 12l6-4" />
      </g>
      <circle cx="49" cy="42" r="4" fill="#ffd27a" />
      <circle cx="15" cy="42" r="4" fill="#ffd27a" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <LogoMark />
      <span className="text-[1.05rem]" style={{ fontFamily: "var(--font-serif)" }}>Engram</span>
    </Link>
  );
}

export function useTheme() {
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  useEffect(() => {
    try {
      const t = localStorage.getItem("engram-theme");
      if (t === "light" || t === "dark") setTheme(t);
    } catch {}
  }, []);
  const apply = (next: "system" | "light" | "dark") => {
    setTheme(next);
    try {
      if (next === "system") { localStorage.removeItem("engram-theme"); delete document.documentElement.dataset.theme; }
      else { localStorage.setItem("engram-theme", next); document.documentElement.dataset.theme = next; }
    } catch {}
  };
  return [theme, apply] as const;
}

export function ThemeToggle() {
  const [theme, apply] = useTheme();
  const cycle = () => apply(theme === "system" ? "dark" : theme === "dark" ? "light" : "system");
  const label = theme === "system" ? "Theme: system" : theme === "dark" ? "Theme: dark" : "Theme: light";
  return (
    <button onClick={cycle} className="tap rounded-lg p-2 text-ink-2 hover:bg-surface-2" aria-label={label} title={label}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        {theme === "dark" ? <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /> : theme === "light" ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></> : <><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" /></>}
      </svg>
    </button>
  );
}

/** Where the back button on a phone goes, and what the header says, for pages below the top level. */
function mobileContext(path: string): { back: string; title: string } | null {
  let m: RegExpExecArray | null;
  if ((m = /^\/learn\/w(\d{3})\/d(\d)/.exec(path))) return { back: `/curriculum/w${m[1]}`, title: `Week ${Number(m[1])} · Day ${m[2]}` };
  if ((m = /^\/curriculum\/w(\d{3})/.exec(path))) return { back: "/curriculum", title: `Week ${Number(m[1])}` };
  if (/^\/papers\/.+/.test(path)) return { back: "/papers", title: "Paper" };
  if (/^\/lab\/projects\/.+/.test(path)) return { back: "/lab/projects", title: "Project" };
  if (/^\/lab\/(journal|projects|questions)/.test(path)) return { back: "/lab", title: "Lab" };
  if (/^\/hub\/.+/.test(path)) return { back: "/hub", title: "Hub" };
  if (/^\/career\/.+/.test(path)) return { back: "/career", title: "Career" };
  const more: Record<string, string> = { "/review": "Review", "/hub": "Hub", "/career": "Career", "/progress": "Progress", "/search": "Search", "/settings": "Settings", "/about": "About", "/login": "Sign in" };
  if (more[path]) return { back: "/more", title: more[path] };
  return null;
}

function BackButton({ href }: { href: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => { if (window.history.length > 1 && document.referrer.startsWith(window.location.origin)) router.back(); else router.push(href); }}
      className="tap -ml-2 flex h-10 w-10 items-center justify-center rounded-full text-accent active:bg-surface-2" aria-label="Back">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
    </button>
  );
}

export function SiteHeader() {
  const path = usePathname();
  const { user } = useUser();
  const ctx = mobileContext(path);
  const account = user ? (
    <Link href="/settings" className="tap ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent" aria-label="Settings">
      {(user.user_metadata?.full_name || user.email || "?").slice(0, 1).toUpperCase()}
    </Link>
  ) : (
    <Link href="/login" className="btn ml-1 !py-1.5">Sign in</Link>
  );
  const search = (
    <Link href="/search" className="tap rounded-lg p-2 text-ink-2 hover:bg-surface-2" aria-label="Search">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
    </Link>
  );
  return (
    <header className="app-header sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-xl">
      {/* Phone */}
      <div className="flex h-12 items-center gap-1 px-3 md:hidden">
        {ctx ? (
          <>
            <BackButton href={ctx.back} />
            <div className="min-w-0 flex-1 truncate text-center text-[0.95rem] font-semibold">{ctx.title}</div>
            <div className="flex w-10 justify-end">{search}</div>
          </>
        ) : (
          <>
            <Logo />
            <div className="ml-auto flex items-center">{search}<ThemeToggle />{account}</div>
          </>
        )}
      </div>
      {/* Tablet and desktop */}
      <div className="mx-auto hidden h-14 max-w-6xl items-center gap-4 px-4 md:flex">
        <Logo />
        <nav className="ml-4 flex items-center gap-1" aria-label="Main">
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
        <div className="ml-auto flex items-center gap-1">{search}<ThemeToggle />{account}</div>
      </div>
      <div id="reading-progress" className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-[2px] origin-left scale-x-0 bg-accent md:hidden" />
    </header>
  );
}

const ICONS: Record<string, React.ReactNode> = {
  today: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  learn: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /></>,
  review: <><rect x="3" y="6" width="14" height="14" rx="2.5" /><path d="M7 3h11.5A2.5 2.5 0 0 1 21 5.5V17" /></>,
  papers: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>,
  more: <><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></>,
};

const TABS = [
  { href: "/today", label: "Today", icon: "today" },
  { href: "/curriculum", label: "Learn", icon: "learn" },
  { href: "/review", label: "Review", icon: "review" },
  { href: "/papers", label: "Papers", icon: "papers" },
  { href: "/more", label: "More", icon: "more" },
];

const MORE_ROUTES = ["/more", "/lab", "/hub", "/career", "/progress", "/search", "/settings", "/about"];

export function BottomTabs() {
  const path = usePathname();
  if (path.startsWith("/learn/")) return null;   // lessons have their own bar
  return (
    <nav className="tabbar fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/85 backdrop-blur-xl md:hidden" aria-label="Tabs">
      <div className="mx-auto grid max-w-md grid-cols-5 px-1">
        {TABS.map((t) => {
          const active = path === t.href || path.startsWith(t.href + "/")
            || (t.href === "/curriculum" && path.startsWith("/learn"))
            || (t.href === "/more" && MORE_ROUTES.some((r) => path === r || path.startsWith(r + "/")));
          return (
            <Link key={t.href} href={t.href} className={`tap flex flex-col items-center gap-0.5 pb-1.5 pt-2 text-[0.68rem] font-medium ${active ? "text-accent" : "text-ink-3"}`}
              aria-current={active ? "page" : undefined}>
              <span className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${active ? "bg-accent-soft" : ""}`}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.3 : 1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{ICONS[t.icon]}</svg>
              </span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
