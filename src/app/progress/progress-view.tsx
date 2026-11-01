"use client";

import { useMemo } from "react";
import { useProfile } from "@/lib/hooks/use-user";
import { useProgress } from "@/lib/hooks/use-progress";
import { PARTS, WEEKS, addDays, daysBetween, lessonId, longestStreak, streak, todayIn, scheduleFor } from "@/lib/curriculum";

export function ProgressView() {
  const { user, profile, ready } = useProfile();
  const progress = useProgress(user?.id);

  const view = useMemo(() => {
    if (!profile || !progress) return null;
    const today = todayIn(profile.timezone);
    const active = new Set(progress.studyDays.keys());
    const minutes = [...progress.studyDays.values()].reduce((a, b) => a + b, 0);
    // Heatmap: the last 26 weeks, Monday-aligned columns
    const end = today;
    const startCol = addDays(end, -((daysBetween("2024-01-01", end) % 7) + 7 * 25)); // 2024-01-01 was a Monday
    const cells = Array.from({ length: 26 * 7 }, (_, i) => addDays(startCol, i)).map((d) => ({
      d, m: progress.studyDays.get(d) ?? 0, future: d > end, study: scheduleFor(d, profile.start_date).kind === "lesson",
    }));
    const partStats = PARTS.map((p) => {
      const teach = WEEKS.filter((w) => w.n >= p.weeks[0] && w.n <= p.weeks[1] && w.kind !== "rest");
      const ids = teach.flatMap((w) => Array.from({ length: 6 }, (_, i) => lessonId(w.n, i + 1)));
      return { p, total: ids.length, done: ids.filter((i) => progress.completed.has(i)).length };
    });
    const qs = progress.quizzes;
    const quizAvg = qs.length ? qs.reduce((a, q) => a + q.score / q.total, 0) / qs.length : null;
    return { today, cells, partStats, minutes, current: streak(active, today, profile.start_date), best: longestStreak(active, profile.start_date, today), quizAvg };
  }, [profile, progress]);

  if (!ready || (user && !view)) return <div className="mx-auto max-w-5xl px-4 pt-10 text-ink-3">Loading…</div>;
  if (!user || !view || !progress) return null;
  const shade = (m: number) => (m === 0 ? "var(--surface-2)" : m < 60 ? "color-mix(in srgb, var(--accent) 35%, transparent)" : m < 150 ? "color-mix(in srgb, var(--accent) 65%, transparent)" : "var(--accent)");

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8">
      <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>Progress</h1>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {[
          ["Current streak", `${view.current} d`], ["Best streak", `${view.best} d`], ["Hours studied", (view.minutes / 60).toFixed(1)],
          ["Lessons", String(progress.completed.size)], ["Papers read", String(progress.papersRead)], ["Cards", String(progress.deck)],
          ["Quiz average", view.quizAvg === null ? "none yet" : `${Math.round(view.quizAvg * 100)}%`],
        ].map(([l, v]) => <div key={l} className="card p-3"><div className="text-xs text-ink-3">{l}</div><div className="text-xl font-semibold">{v}</div></div>)}
      </div>

      <section className="card mt-6 overflow-x-auto p-4">
        <div className="eyebrow">The last 26 weeks</div>
        <div className="mt-3 grid min-w-[560px] grid-flow-col grid-rows-7 gap-1" role="img" aria-label="Study activity heatmap">
          {view.cells.map((c) => (
            <div key={c.d} title={`${c.d}: ${c.m} min`} className="aspect-square rounded-[3px]"
              style={{ background: c.future ? "transparent" : shade(c.m), outline: c.study && !c.future && c.m === 0 ? "1px solid var(--line)" : "none" }} />
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-3">Darker squares mean more minutes. Outlined empty squares are scheduled study days you missed.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">By part</h2>
        <ul className="mt-3 space-y-2">
          {view.partStats.map(({ p, total, done }) => (
            <li key={p.n} className="card p-3">
              <div className="flex justify-between text-sm"><span className="font-semibold">Part {p.n}. {p.title}</span><span className="font-mono text-ink-3">{done}/{total}</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-accent" style={{ width: `${total ? (100 * done) / total : 0}%` }} /></div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Recent quizzes</h2>
        <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface text-sm">
          {progress.quizzes.slice(0, 15).map((q, i) => (
            <li key={i} className="flex justify-between p-3"><span className="font-mono">{q.quiz_id}</span><span>{q.score}/{q.total} · {new Date(q.created_at).toLocaleDateString("en-GB")}</span></li>
          ))}
          {!progress.quizzes.length ? <li className="p-3 text-ink-3">No quizzes yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}
