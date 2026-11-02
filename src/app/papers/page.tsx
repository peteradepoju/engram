import type { Metadata } from "next";
import Link from "next/link";
import { PAPERS, PAPER_KIND_LABEL } from "@/data/papers";
import { WEEKS } from "@/lib/curriculum";
import { OpenOnHash } from "@/components/open-on-hash";

export const metadata: Metadata = { title: "Papers" };

export default function PapersPage() {
  const weeks = [...new Set(PAPERS.map((p) => p.week))].sort((a, b) => a - b);
  return (
    <div className="mx-auto max-w-4xl px-4 pt-8">
      <div className="eyebrow">Five a week · matched to your lessons</div>
      <h1 className="mt-1 text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>Papers</h1>
      <p className="mt-2 max-w-3xl text-ink-2">
        Each week mixes a classic, papers that use the week&apos;s ideas on brains and in AI, and recent work. Every paper has a reading guide; one per week (marked deep read) gets a third pass and a written critique on Day 6.
      </p>
      <div className="mt-4 rounded-xl border border-line bg-surface p-4 text-sm">
        <span className="font-semibold">How to read:</span> 30 minutes on Days 1 to 5 for the first and second pass. Write notes in the paper&apos;s page; they are saved to your account. Ideas can go straight to your Research Lab.
      </div>
      <OpenOnHash />
      <div className="mt-6 space-y-3">
        {weeks.map((w, i) => {
          const list = PAPERS.filter((p) => p.week === w).sort((a, b) => a.day - b.day);
          return (
            <details key={w} id={`week-${w}`} open={i === 0} className="group rounded-2xl border border-line bg-surface">
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">Week {w}: {WEEKS[w - 1].title}</span>
                  <span className="block text-sm text-ink-3">{list.length} papers · deep read: {list.find((p) => p.deepRead)?.title ?? "none"}</span>
                </span>
                <span className="text-ink-3 transition-transform group-open:rotate-180" aria-hidden>▾</span>
              </summary>
              <ul className="space-y-2 px-4 pb-4">
                {list.map((p) => (
                  <li key={p.id}>
                    <Link href={`/papers/${p.id}`} className="flex flex-col gap-1 rounded-xl border border-line p-4 hover:border-ink-3 sm:flex-row sm:items-center sm:gap-4">
                      <span className="w-14 shrink-0 text-sm text-ink-3">Day {p.day}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{p.title}</span>
                        <span className="block text-sm text-ink-3">{p.authors.split(",").slice(0, 2).join(",")}{p.authors.split(",").length > 2 ? " and others" : ""} · {p.year} · {p.venue}</span>
                      </span>
                      <span className="flex gap-1">
                        <span className="chip">{PAPER_KIND_LABEL[p.kind]}</span>
                        {p.deepRead ? <span className="chip !bg-accent-soft !text-accent">Deep read</span> : null}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>
      <p className="mt-10 text-sm text-ink-3">Papers for later weeks are added as each week is written.</p>
    </div>
  );
}
