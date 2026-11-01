import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dayTitle, isWritten, lessonId, partOf, publishedLessons, weekOf, DAYS_PER_WEEK } from "@/lib/curriculum";
import type { LessonMeta } from "@/lib/lesson-meta";
import { LessonProvider } from "@/components/lesson/context";
import { CompleteLesson } from "@/components/lesson/complete";
import { Tutor } from "@/components/lesson/tutor";
import { Colab } from "@/components/lesson/blocks";
import { paperById } from "@/data/papers";
import { LESSONS } from "@content/index";

type Params = { week: string; day: string };

function parse({ week, day }: Params) {
  const w = /^w(\d{3})$/.exec(week)?.[1];
  const d = /^d([1-6])$/.exec(day)?.[1];
  if (!w || !d) return null;
  const wn = Number(w), dn = Number(d);
  if (wn < 1 || wn > 208) return null;
  return { w: wn, d: dn };
}

async function load(w: number, d: number): Promise<{ Content: React.ComponentType; meta: LessonMeta } | null> {
  if (!isWritten(w)) return null;
  try {
    const loader = LESSONS[lessonId(w, d)];
    if (!loader) return null;
    const mod = await loader();
    return { Content: mod.default, meta: mod.meta as LessonMeta };
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return publishedLessons().map(({ w, d }) => ({ week: `w${String(w).padStart(3, "0")}`, day: `d${d}` }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const p = parse(await params);
  if (!p) return {};
  return { title: `Week ${p.w}, Day ${p.d}: ${dayTitle(p.w, p.d)}` };
}

export default async function LessonPage({ params }: { params: Promise<Params> }) {
  const p = parse(await params);
  if (!p) notFound();
  const { w, d } = p;
  const week = weekOf(w)!;
  const part = partOf(w);
  const id = lessonId(w, d);
  const lesson = await load(w, d);

  const prev = d > 1 ? { w, d: d - 1 } : w > 1 ? { w: w - 1, d: DAYS_PER_WEEK } : null;
  const nxt = d < DAYS_PER_WEEK ? { w, d: d + 1 } : w < 208 ? { w: w + 1, d: 1 } : null;
  const href = (x: { w: number; d: number }) => `/learn/w${String(x.w).padStart(3, "0")}/d${x.d}`;
  const paper = lesson?.meta.paper ? paperById(lesson.meta.paper) : undefined;

  return (
    <LessonProvider lessonId={id}>
      <article className="mx-auto max-w-3xl px-4 pt-8">
        <nav className="text-sm text-ink-3">
          <Link href="/curriculum" className="hover:text-ink">Curriculum</Link> ·{" "}
          <Link href={`/curriculum#part-${part.n}`} className="hover:text-ink">Part {part.n}: {part.short}</Link> ·{" "}
          <Link href={`/curriculum/w${String(w).padStart(3, "0")}`} className="hover:text-ink">Week {w}</Link>
        </nav>
        <div className="eyebrow mt-6">Week {w} · Day {d}{d === 6 ? " · Forge" : ""}</div>
        <h1 className="mt-2 text-[2.1rem] font-semibold leading-tight tracking-tight sm:text-[2.5rem]" style={{ fontFamily: "var(--font-serif)" }}>
          {lesson?.meta.title ?? dayTitle(w, d)}
        </h1>
        <p className="mt-1 text-ink-2">{week.title}</p>

        {lesson ? (
          <>
            <p className="mt-5 text-lg text-ink-2">{lesson.meta.intro}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="card p-4">
                <div className="eyebrow">By the end you can</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.95rem]">{lesson.meta.goals.map((g) => <li key={g}>{g}</li>)}</ul>
              </div>
              <div className="card p-4">
                <div className="eyebrow">Plan for today</div>
                <ul className="mt-2 space-y-1 text-[0.95rem]">
                  {lesson.meta.plan.map((s) => (
                    <li key={s.label} className="flex justify-between gap-3"><span>{s.label}</span><span className="shrink-0 font-mono text-ink-3">{s.minutes} min</span></li>
                  ))}
                  <li className="flex justify-between border-t border-line pt-1 font-semibold"><span>Total</span><span className="font-mono">{lesson.meta.plan.reduce((a, s) => a + s.minutes, 0)} min</span></li>
                </ul>
              </div>
            </div>
            {paper ? (
              <Link href={`/papers/${paper.id}`} className="card mt-4 flex items-center gap-3 p-4 hover:border-ink-3">
                <span className="chip !bg-accent-soft !text-accent">Paper · 30 min</span>
                <span className="min-w-0 flex-1 truncate">{paper.title} <span className="text-ink-3">({paper.authors.split(",")[0]} et al., {paper.year})</span></span>
                <span aria-hidden>→</span>
              </Link>
            ) : null}
            <div className="mt-3"><Colab path={`w${String(w).padStart(3, "0")}/d${d}.ipynb`} label="Today's code as a Colab notebook" /></div>
            <div className="prose-engram mt-10">
              <lesson.Content />
            </div>
            <CompleteLesson lessonId={id} next={nxt ? { href: href(nxt), title: dayTitle(nxt.w, nxt.d) } : undefined} />
            <Tutor lessonId={id} lessonTitle={lesson.meta.title} />
          </>
        ) : (
          <div className="card mt-8 p-6">
            <div className="font-semibold">This lesson is being written.</div>
            <p className="mt-2 text-ink-2">Lessons are published week by week and stay at least two weeks ahead of the schedule. Come back soon, or review what you have learned so far.</p>
            <div className="mt-4 flex gap-2"><Link className="btn btn-primary" href="/review">Go to review</Link><Link className="btn" href="/curriculum">See the curriculum</Link></div>
          </div>
        )}

        <div className="mt-8 flex justify-between gap-3 text-sm">
          {prev ? <Link className="btn" href={href(prev)}>← Week {prev.w}, Day {prev.d}</Link> : <span />}
          {nxt ? <Link className="btn" href={href(nxt)}>Week {nxt.w}, Day {nxt.d} →</Link> : <span />}
        </div>
      </article>
    </LessonProvider>
  );
}
