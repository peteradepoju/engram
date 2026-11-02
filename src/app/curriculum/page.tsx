import type { Metadata } from "next";
import Link from "next/link";
import { PARTS, WEEKS, isWritten, lessonId, weekSlug } from "@/lib/curriculum";
import { CompletedProvider, WeekDone } from "@/components/progress/completed";
import { OpenOnHash } from "@/components/open-on-hash";

export const metadata: Metadata = { title: "Curriculum" };

const KIND: Record<string, string> = { rest: "Rest", project: "Project", exam: "Exam", research: "Research", career: "Career" };

export default function CurriculumPage() {
  return (
    <CompletedProvider>
      <div className="mx-auto max-w-5xl px-4 pt-8">
        <div className="eyebrow">208 weeks · 8 parts · 6 days a week</div>
        <h1 className="mt-1 text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>Curriculum</h1>
        <p className="mt-3 max-w-3xl text-[0.95rem] text-ink-2 sm:text-base">
          Every week has five lesson days and a Day 6 Forge (Years 1 and 2) or Research Day (Years 3 and 4). Each part ends with a project and an exam, and a rest week falls every 13th week. Weeks are written in batches and kept at least two weeks ahead of the schedule.
        </p>
        <OpenOnHash />
        <nav className="scroller -mx-4 mt-5 flex gap-2 px-4 sm:mx-0 sm:mt-6 sm:flex-wrap sm:px-0">
          {PARTS.map((p) => <a key={p.n} href={`#part-${p.n}`} className="chip tap shrink-0 whitespace-nowrap !py-1.5 hover:!bg-accent-soft">Part {p.n}: {p.short}</a>)}
        </nav>
        {PARTS.map((p) => (
          <details key={p.n} id={`part-${p.n}`} open={p.n === 0} className="group mt-4 scroll-mt-20 rounded-2xl border border-line bg-surface">
            <summary className="flex cursor-pointer list-none items-start gap-3 p-4 sm:gap-4 sm:p-5 [&::-webkit-details-marker]:hidden">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">{p.n}</span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-3">
                  <span className="text-xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>{p.title}</span>
                  <span className="text-sm text-ink-3">{p.weeks[0] === p.weeks[1] ? `Week ${p.weeks[0]}` : `Weeks ${p.weeks[0]} to ${p.weeks[1]}`}</span>
                </span>
                <span className="mt-1 block text-[0.95rem] text-ink-2">{p.summary}</span>
                <span className="mt-1 block text-sm"><span className="font-semibold">Part project:</span> {p.project}</span>
              </span>
              <span className="mt-1 text-ink-3 transition-transform group-open:rotate-180" aria-hidden>▾</span>
            </summary>
            <ol className="mx-3 mb-3 divide-y sm:mx-5 sm:mb-5 divide-line overflow-hidden rounded-xl border border-line bg-surface">
              {WEEKS.filter((w) => w.n >= p.weeks[0] && w.n <= p.weeks[1]).map((w) => (
                <li key={w.n}>
                  <Link href={`/curriculum/${weekSlug(w.n)}`} className={`tap flex items-center gap-3 px-3 py-3 hover:bg-surface-2 active:bg-surface-2 sm:px-4 sm:py-2.5 ${w.kind === "rest" ? "text-ink-3" : ""}`}>
                    <span className="w-10 shrink-0 font-mono text-sm text-ink-3">W{w.n}</span>
                    <span className="min-w-0 flex-1 text-[0.95rem] leading-snug sm:text-base">{w.title}</span>
                    {KIND[w.kind] ? <span className="chip">{KIND[w.kind]}</span> : null}
                    {isWritten(w.n) ? <span className="chip !bg-accent-soft !text-accent">Open</span> : null}
                    <WeekDone ids={Array.from({ length: 6 }, (_, i) => lessonId(w.n, i + 1))} />
                  </Link>
                </li>
              ))}
            </ol>
          </details>
        ))}
      </div>
    </CompletedProvider>
  );
}
