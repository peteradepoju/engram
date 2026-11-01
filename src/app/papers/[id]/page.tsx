import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PAPERS, paperById, PAPER_KIND_LABEL } from "@/data/papers";
import { lessonId } from "@/lib/curriculum";
import { PaperNotes } from "./paper-notes";

type Params = { id: string };

export function generateStaticParams() {
  return PAPERS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const p = paperById((await params).id);
  return p ? { title: p.title } : {};
}

const PASSES = [
  ["First pass (5 to 10 min)", "Title, abstract, introduction, headings, figures, conclusion. Answer the five Cs."],
  ["Second pass (about 30 to 60 min)", "Read properly, skipping proofs. Study every figure: axes, units, what one point is, what the error bars show."],
  ["Third pass (deep read only)", "Re-create the argument or the analysis yourself. Challenge each assumption. Write the critique."],
];

export default async function PaperPage({ params }: { params: Promise<Params> }) {
  const p = paperById((await params).id);
  if (!p) notFound();
  const w = String(p.week).padStart(3, "0");
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8">
      <nav className="text-sm text-ink-3"><Link href="/papers" className="hover:text-ink">Papers</Link> · <Link href={`/curriculum/w${w}`} className="hover:text-ink">Week {p.week}</Link></nav>
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="chip">{PAPER_KIND_LABEL[p.kind]}</span>
        {p.deepRead ? <span className="chip !bg-accent-soft !text-accent">Deep read this week</span> : null}
        <span className="chip">Difficulty {"●".repeat(p.difficulty)}{"○".repeat(3 - p.difficulty)}</span>
      </div>
      <h1 className="mt-3 text-[1.9rem] font-semibold leading-tight" style={{ fontFamily: "var(--font-serif)" }}>{p.title}</h1>
      <p className="mt-2 text-ink-2">{p.authors}</p>
      <p className="text-sm text-ink-3">{p.year} · {p.venue}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={p.url} target="_blank" rel="noreferrer" className="btn btn-primary">Open the paper ↗</a>
        <Link href={`/learn/w${w}/d${p.day}`} className="btn">Goes with Week {p.week}, Day {p.day}</Link>
      </div>

      <section className="mt-8"><h2 className="text-xl font-semibold">Why this paper</h2><p className="mt-2 text-ink-2">{p.why}</p></section>
      <section className="mt-6">
        <h2 className="text-xl font-semibold">In brief</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">{p.summary.map((s) => <li key={s}>{s}</li>)}</ul>
        <p className="mt-2 text-xs text-ink-3">A summary written for Engram to orient you. Read the paper itself; summaries leave out the details that matter.</p>
      </section>
      <section className="mt-6">
        <h2 className="text-xl font-semibold">Reading guide</h2>
        <ol className="mt-2 space-y-2">{PASSES.map(([t, d]) => <li key={t} className="card p-3"><div className="font-semibold">{t}</div><div className="text-sm text-ink-2">{d}</div></li>)}</ol>
        <p className="mt-3 rounded-lg bg-surface-2 p-3 text-sm"><span className="font-semibold">Look closely at:</span> {p.focus}</p>
      </section>
      <section className="mt-6">
        <h2 className="text-xl font-semibold">Questions to answer</h2>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5">{p.questions.map((q) => <li key={q}>{q}</li>)}</ol>
      </section>
      <PaperNotes paperId={p.id} source={lessonId(p.week, p.day)} />
    </div>
  );
}
