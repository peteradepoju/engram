"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProfile } from "@/lib/hooks/use-user";
import { useProgress } from "@/lib/hooks/use-progress";
import {
  dayTitle, isWritten, lessonId, partOf, publishedLessons, scheduleFor, streak, todayIn, weekOf, longestStreak, addDays, isStudyDay,
} from "@/lib/curriculum";
import { papersForWeek } from "@/data/papers";
import { InstallApp } from "@/components/install-app";
import { ReminderNudge } from "@/components/reminder-nudge";

const href = (w: number, d: number) => `/learn/w${String(w).padStart(3, "0")}/d${d}`;

export function TodayView() {
  const { user, profile, ready } = useProfile();
  const progress = useProgress(user?.id);

  const info = useMemo(() => {
    if (!profile || !progress) return null;
    const today = todayIn(profile.timezone);
    const sched = scheduleFor(today, profile.start_date);
    const active = new Set(progress.studyDays.keys());
    const next = publishedLessons().find((l) => !progress.completed.has(l.id));
    // Last 7 scheduled study days, for the week strip
    const strip = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)).map((d) => ({
      date: d, study: isStudyDay(d, profile.start_date), done: active.has(d),
    }));
    return {
      today, sched, next, strip,
      current: streak(active, today, profile.start_date),
      best: longestStreak(active, profile.start_date, today),
    };
  }, [profile, progress]);

  if (!ready || (user && !info)) return <div className="mx-auto max-w-5xl px-4 pt-10 text-ink-3">Loading your day…</div>;
  if (!user || !profile || !info || !progress) return null;

  const { sched } = info;
  const scheduledWeek = sched.kind === "lesson" || sched.kind === "rest-day" || sched.kind === "rest-week" ? sched.week : 1;
  const papers = papersForWeek(info.next?.w ?? scheduledWeek);
  const name = profile.display_name?.split(" ")[0];

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 sm:pt-8">
      <div className="eyebrow">{new Date(info.today + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })}</div>
      <h1 className="mt-1 text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>{name ? `Good to see you, ${name}.` : "Your day"}</h1>
      <ReminderNudge />

      <div className="mt-6 grid gap-4 md:grid-cols-[1.6fr_1fr]">
        <section className="card p-5">
          {sched.kind === "before" ? (
            <>
              <div className="eyebrow">Day 1 is in {sched.daysToGo} {sched.daysToGo === 1 ? "day" : "days"}</div>
              <p className="mt-2 text-ink-2">Your programme starts on {new Date(profile.start_date + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}. You can start early: lessons are open now.</p>
            </>
          ) : sched.kind === "rest-day" ? (
            <><div className="eyebrow">Rest day</div><p className="mt-2 text-ink-2">Day 7 is always rest. Your streak is safe. A short review session is welcome but optional.</p></>
          ) : sched.kind === "rest-week" ? (
            <><div className="eyebrow">Rest week {sched.week}</div><p className="mt-2 text-ink-2">No lessons this week. Optional: one long talk from the Hub, one book chapter, and a tidy of your journal.</p></>
          ) : sched.kind === "lesson" ? (
            <>
              <div className="eyebrow">Scheduled today · Week {sched.week}, Day {sched.day}</div>
              <div className="mt-1 text-lg font-semibold">{dayTitle(sched.week, sched.day)}</div>
              <div className="text-sm text-ink-3">Part {partOf(sched.week).n}: {partOf(sched.week).title} · {weekOf(sched.week)?.title}</div>
              {!isWritten(sched.week) ? <p className="mt-2 text-sm text-warn">This week is still being written.</p> : null}
            </>
          ) : (
            <><div className="eyebrow">Programme complete</div><p className="mt-2">You have reached the end of the 208 weeks. Congratulations.</p></>
          )}

          <div className="mt-5 rounded-xl bg-accent-soft p-4">
            <div className="eyebrow !text-accent">Your next lesson</div>
            {info.next ? (
              <>
                <div className="mt-1 font-semibold">Week {info.next.w}, Day {info.next.d}: {dayTitle(info.next.w, info.next.d)}</div>
                {sched.kind === "lesson" && (info.next.w - 1) * 6 + info.next.d < (sched.week - 1) * 6 + sched.day ? (
                  <div className="text-sm text-ink-2">You are a little behind the calendar. That is fine: keep the daily habit and you will catch up.</div>
                ) : null}
                <Link href={href(info.next.w, info.next.d)} className="btn btn-primary tap mt-3 w-full justify-center !py-3 sm:w-auto sm:!py-2">Start the lesson →</Link>
              </>
            ) : (
              <p className="mt-1 text-sm">You have finished every published lesson. New weeks appear soon; meanwhile, review and read.</p>
            )}
          </div>

          <ul className="mt-5 grid gap-2 sm:grid-cols-3">
            <li><Link href="/review" className="card block h-full p-3 hover:border-ink-3"><div className="text-xs text-ink-3">Spaced review · 15 min</div><div className="font-semibold">{progress.dueCards} cards due</div></Link></li>
            <li>{(() => { const pp = papers[info.next ? Math.min(info.next.d, 5) - 1 : 0]; return (
              <Link href={pp ? `/papers/${pp.id}` : "/papers"} className="card block h-full p-3 hover:border-ink-3"><div className="text-xs text-ink-3">Paper · 30 min</div><div className="line-clamp-2 font-semibold leading-snug">{pp?.title ?? "This week's papers"}</div></Link>
            ); })()}</li>
            <li><Link href="/lab/journal" className="card block h-full p-3 hover:border-ink-3"><div className="text-xs text-ink-3">Journal · 15 min</div><div className="font-semibold">{progress.journalCount} entries</div></Link></li>
          </ul>
        </section>

        <aside className="space-y-4">
          <div className="md:hidden"><InstallApp compact /></div>
          <section className="card p-5">
            <div className="flex items-end justify-between">
              <div><div className="eyebrow">Streak</div><div className="text-4xl font-semibold">{info.current}<span className="ml-1 text-base font-normal text-ink-3">days</span></div></div>
              <div className="text-right text-sm text-ink-3">Best {info.best}</div>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {info.strip.map((s) => (
                <div key={s.date} className="text-center">
                  <div className={`mx-auto h-7 w-7 rounded-full ${s.done ? "bg-accent" : s.study ? "border-2 border-line" : "bg-surface-2"}`} title={s.date} />
                  <div className="mt-1 text-[0.65rem] text-ink-3">{new Date(s.date + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "narrow", timeZone: "UTC" })}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-3">Any study counts: a lesson, a review session or a journal entry. Rest days and rest weeks never break the streak.</p>
          </section>
          <section className="card p-5 text-sm">
            <div className="eyebrow">So far</div>
            <ul className="mt-2 space-y-1">
              <li className="flex justify-between"><span>Lessons completed</span><span className="font-mono">{progress.completed.size}</span></li>
              <li className="flex justify-between"><span>Cards in your deck</span><span className="font-mono">{progress.deck}</span></li>
              <li className="flex justify-between"><span>Papers read</span><span className="font-mono">{progress.papersRead}</span></li>
              <li className="flex justify-between"><span>Research questions</span><span className="font-mono">{progress.questionCount}</span></li>
            </ul>
            <Link href="/progress" className="mt-3 inline-block text-accent underline">Full progress →</Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
