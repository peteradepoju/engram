import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WEEKS, dayTitle, isWritten, lessonId, partOf, weekSlug, DAYS_PER_WEEK } from "@/lib/curriculum";
import { papersForWeek, PAPER_KIND_LABEL } from "@/data/papers";
import { CompletedProvider, DoneMark } from "@/components/progress/completed";

type Params = { week: string };
const parse = (s: string) => { const m = /^w(\d{3})$/.exec(s); const n = m ? Number(m[1]) : 0; return n >= 1 && n <= 208 ? n : null; };

export function generateStaticParams() {
  return WEEKS.map((w) => ({ week: weekSlug(w.n) }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const n = parse((await params).week);
  return n ? { title: `Week ${n}: ${WEEKS[n - 1].title}` } : {};
}

export default async function WeekPage({ params }: { params: Promise<Params> }) {
  const n = parse((await params).week);
  if (!n) notFound();
  const week = WEEKS[n - 1];
  const part = partOf(n);
  const papers = papersForWeek(n);
  return (
    <CompletedProvider>
      <div className="mx-auto max-w-3xl px-4 pt-8">
        <nav className="text-sm text-ink-3"><Link href="/curriculum" className="hover:text-ink">Curriculum</Link> · <Link href={`/curriculum#part-${part.n}`} className="hover:text-ink">Part {part.n}: {part.short}</Link></nav>
        <div className="eyebrow mt-6">Week {n}</div>
        <h1 className="mt-1 text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>{week.title}</h1>
        {week.kind === "rest" ? (
          <p className="mt-4 text-ink-2">A rest week: no lessons and no streak pressure. Optional: one long-form talk from the Hub, one book chapter, and a tidy of your journal and question bank.</p>
        ) : (
          <>
            {!isWritten(n) ? <p className="mt-4 rounded-lg bg-warn-soft p-3 text-sm">This week is being written. The day plan below will appear when it is published.</p> : null}
            <ol className="mt-6 space-y-2">
              {Array.from({ length: DAYS_PER_WEEK }, (_, i) => i + 1).map((d) => (
                <li key={d}>
                  <Link href={`/learn/${weekSlug(n)}/d${d}`} className="card flex items-center gap-3 p-4 hover:border-ink-3">
                    <span className="w-14 shrink-0 text-sm text-ink-3">Day {d}</span>
                    <span className="flex-1">{isWritten(n) ? dayTitle(n, d) : d === 6 ? (n >= 105 ? "Research Day" : "Forge") : "In preparation"}</span>
                    <DoneMark id={lessonId(n, d)} />
                  </Link>
                </li>
              ))}
            </ol>
            {papers.length ? (
              <section className="mt-8">
                <h2 className="text-xl font-semibold">Papers this week</h2>
                <ul className="mt-3 space-y-2">
                  {papers.map((p) => (
                    <li key={p.id}><Link href={`/papers/${p.id}`} className="card flex gap-3 p-3 hover:border-ink-3">
                      <span className="chip shrink-0">{PAPER_KIND_LABEL[p.kind]}</span>
                      <span className="min-w-0 flex-1">{p.title} <span className="text-ink-3">({p.year})</span></span>
                    </Link></li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}
        <div className="mt-8 flex justify-between">
          {n > 1 ? <Link className="btn" href={`/curriculum/${weekSlug(n - 1)}`}>← Week {n - 1}</Link> : <span />}
          {n < 208 ? <Link className="btn" href={`/curriculum/${weekSlug(n + 1)}`}>Week {n + 1} →</Link> : <span />}
        </div>
      </div>
    </CompletedProvider>
  );
}
