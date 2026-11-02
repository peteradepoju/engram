import type { Metadata } from "next";
import Link from "next/link";
import { InstallApp } from "@/components/install-app";
import { ThemeRow } from "./theme-row";

export const metadata: Metadata = { title: "More" };

const I = {
  lab: <><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" /><path d="M7.5 15h9" /></>,
  journal: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M9 8h6M9 12h6" /></>,
  hub: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  career: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" /></>,
  progress: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
  about: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5h.01" /></>,
};

const GROUPS: { title: string; items: [string, string, string, keyof typeof I, string][] }[] = [
  { title: "Research", items: [
    ["/lab", "Research Lab", "Projects, questions and your lab overview", "lab", "var(--good)"],
    ["/lab/journal", "Journal", "Your daily entries", "journal", "var(--warn)"],
    ["/hub", "NeuroAI Hub", "Books, videos, tools, datasets, events", "hub", "var(--ai)"],
    ["/career", "Career", "PhD timeline and application tracker", "career", "var(--neuro)"],
  ] },
  { title: "You", items: [
    ["/progress", "Progress", "Streak, hours, lessons, quizzes", "progress", "var(--accent)"],
    ["/search", "Search", "Lessons, papers, glossary and the Hub", "search", "var(--ink-3)"],
    ["/settings", "Settings", "Start date, time zone, calendar, sign out", "settings", "var(--ink-3)"],
    ["/about", "About Engram", "Who made it and how it works", "about", "var(--ink-3)"],
  ] },
];

export default function MorePage() {
  return (
    <div className="mx-auto max-w-xl px-4 pt-6 sm:pt-8">
      <h1 className="text-[2rem] font-semibold" style={{ fontFamily: "var(--font-serif)" }}>More</h1>
      <div className="mt-5"><InstallApp /></div>
      {GROUPS.map((g) => (
        <section key={g.title} className="mt-6">
          <div className="eyebrow px-1">{g.title}</div>
          <ul className="card mt-2 divide-y divide-line overflow-hidden">
            {g.items.map(([h, t, d, icon, colour]) => (
              <li key={h}>
                <Link href={h} className="tap flex items-center gap-3 px-4 py-3 active:bg-surface-2 hover:bg-surface-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `color-mix(in srgb, ${colour} 16%, transparent)`, color: colour }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{I[icon]}</svg>
                  </span>
                  <span className="min-w-0 flex-1"><span className="block font-medium">{t}</span><span className="block truncate text-sm text-ink-3">{d}</span></span>
                  <span className="text-ink-3" aria-hidden>›</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <section className="mt-6">
        <div className="eyebrow px-1">Appearance</div>
        <div className="card mt-2 p-2"><ThemeRow /></div>
      </section>
      <p className="mt-6 px-1 pb-4 text-center text-xs text-ink-3">Engram is free, by Peter Oluwafemi Adepoju.</p>
    </div>
  );
}
