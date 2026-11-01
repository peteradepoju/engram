import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "More" };

const LINKS = [
  ["/review", "Spaced review", "Flashcards due today"],
  ["/hub", "NeuroAI Hub", "Books, videos, tools, datasets, institutes, events"],
  ["/career", "Career", "PhD timeline, application tracker, industry track"],
  ["/progress", "Progress", "Streak, hours, lessons, quizzes"],
  ["/search", "Search", "Lessons, papers, glossary and the Hub"],
  ["/settings", "Settings", "Start date, time zone, calendar link, sign out"],
  ["/about", "About Engram", "Who made it and how it works"],
];

export default function MorePage() {
  return (
    <div className="mx-auto max-w-xl px-4 pt-8">
      <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>More</h1>
      <ul className="mt-6 space-y-2">
        {LINKS.map(([h, t, d]) => (
          <li key={h}><Link href={h} className="card block p-4 hover:border-ink-3"><div className="font-semibold">{t}</div><div className="text-sm text-ink-3">{d}</div></Link></li>
        ))}
      </ul>
    </div>
  );
}
