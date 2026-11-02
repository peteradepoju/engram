"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Nav = { href: string; label: string } | null;
type StepInfo = { n: number; title: string; minutes?: number };

/** Open the tutor from anywhere (the lesson bar on phones, for example). */
export const openTutor = () => window.dispatchEvent(new Event("engram:tutor"));

/** The phone toolbar for a lesson: previous and next day, a sheet of steps to jump to, the tutor, and reading progress. */
export function LessonBar({ prev, next, plan, tutor = true }: { prev: Nav; next: Nav; plan: { label: string; minutes: number }[]; tutor?: boolean }) {
  const [steps, setSteps] = useState<StepInfo[]>([]);
  const [current, setCurrent] = useState(0);
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-step]"));
    setSteps(els.map((e) => ({ n: Number(e.dataset.step), title: e.dataset.stepTitle ?? "", minutes: Number(e.dataset.stepMinutes) || undefined })));
    const bar = document.getElementById("reading-progress");
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
        let c = 0;
        for (const e of els) if (e.getBoundingClientRect().top < window.innerHeight * 0.4) c = Number(e.dataset.step);
        setCurrent(c);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (bar) bar.style.transform = "scaleX(0)"; };
  }, []);

  useEffect(() => {
    if (!sheet) return;
    const close = (e: KeyboardEvent) => { if (e.key === "Escape") setSheet(false); };
    window.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", close); document.body.style.overflow = ""; };
  }, [sheet]);

  const jump = (n: number) => {
    setSheet(false);
    requestAnimationFrame(() => document.getElementById(`step-${n}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const total = plan.reduce((a, s) => a + s.minutes, 0);

  return (
    <>
      <nav className="tabbar fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 backdrop-blur-xl md:hidden" aria-label="Lesson">
        <div className="flex items-center gap-1 px-2 py-1.5">
          {prev ? (
            <Link href={prev.href} className="tap flex h-11 w-11 items-center justify-center rounded-full text-ink-2 active:bg-surface-2" aria-label={`Previous: ${prev.label}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
            </Link>
          ) : <span className="w-11" />}
          <button onClick={() => setSheet(true)} className="tap flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full bg-surface-2 px-4 text-left active:opacity-80" aria-haspopup="dialog">
            <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-white dark:text-[#15121f]">{current || "·"}</span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{current ? steps.find((s) => s.n === current)?.title : "Overview"}</span>
            <span className="shrink-0 text-xs text-ink-3">{steps.length ? `of ${steps.length}` : ""}</span>
          </button>
          {tutor ? (
            <button onClick={openTutor} className="tap flex h-11 w-11 items-center justify-center rounded-full text-accent active:bg-surface-2" aria-label="Ask the tutor">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.3 2.4c-.5.2-.8.6-.8 1.1v.5M12 16.5h.01" /></svg>
            </button>
          ) : null}
          {next ? (
            <Link href={next.href} className="tap flex h-11 w-11 items-center justify-center rounded-full text-ink-2 active:bg-surface-2" aria-label={`Next: ${next.label}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 5l7 7-7 7" /></svg>
            </Link>
          ) : <span className="w-11" />}
        </div>
      </nav>

      {sheet ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Lesson steps">
          <button className="sheet-backdrop absolute inset-0 bg-black/45" onClick={() => setSheet(false)} aria-label="Close" />
          <div className="sheet absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto rounded-t-3xl border-t border-line bg-surface pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <div className="sticky top-0 bg-surface px-5 pb-2 pt-3">
              <div className="mx-auto h-1.5 w-10 rounded-full bg-line" />
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-lg font-semibold" style={{ fontFamily: "var(--font-serif)" }}>Today&apos;s steps</div>
                <div className="text-sm text-ink-3">{total} min in all</div>
              </div>
            </div>
            <ul className="px-3">
              <li>
                <button onClick={() => { setSheet(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="tap flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left active:bg-surface-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-3">↑</span>
                  <span className="flex-1 font-medium">Overview, goals and paper</span>
                </button>
              </li>
              {steps.map((s) => (
                <li key={s.n}>
                  <button onClick={() => jump(s.n)} className={`tap flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left active:bg-surface-2 ${s.n === current ? "bg-accent-soft" : ""}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${s.n === current ? "bg-accent text-white dark:text-[#15121f]" : s.n < current ? "bg-good-soft text-good" : "bg-surface-2 text-ink-2"}`}>{s.n < current ? "✓" : s.n}</span>
                    <span className="min-w-0 flex-1 font-medium leading-snug">{s.title}</span>
                    {s.minutes ? <span className="shrink-0 text-xs text-ink-3">{s.minutes} min</span> : null}
                  </button>
                </li>
              ))}
              <li>
                <button onClick={() => { setSheet(false); document.getElementById("lesson-end")?.scrollIntoView({ behavior: "smooth" }); }} className="tap flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left active:bg-surface-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-good-soft text-good">✓</span>
                  <span className="flex-1 font-medium">Finish and mark complete</span>
                </button>
              </li>
            </ul>
            <div className="mt-2 grid grid-cols-2 gap-2 px-5">
              {prev ? <Link href={prev.href} className="btn justify-center !py-2.5" onClick={() => setSheet(false)}>← {prev.label}</Link> : <span />}
              {next ? <Link href={next.href} className="btn justify-center !py-2.5" onClick={() => setSheet(false)}>{next.label} →</Link> : <span />}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
