import type { Metadata } from "next";
import Link from "next/link";
import { HUB_SECTIONS } from "./sections";

export const metadata: Metadata = { title: "NeuroAI Hub" };

export default function HubPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-8">
      <div className="eyebrow">Everything in one place</div>
      <h1 className="mt-1 text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>NeuroAI Hub</h1>
      <p className="mt-2 max-w-3xl text-ink-2">The books, videos, tools, datasets, places, events and people of the field. Dates and people change, so always confirm on the official site.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {HUB_SECTIONS.map((s) => (
          <Link key={s.id} href={`/hub/${s.id}`} className="card p-5 hover:border-ink-3">
            <div className="font-semibold">{s.title}</div>
            <p className="mt-1 text-sm text-ink-2">{s.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
