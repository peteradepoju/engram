import Link from "next/link";
import { PARTS, WEEKS } from "@/lib/curriculum";
import { AccountCta } from "@/components/account-cta";

const FEATURES = [
  { t: "A lesson every day", d: "Two hours of guided learning: interactive figures, step-by-step derivations, curated videos and Python that runs in your browser." },
  { t: "Five papers a week", d: "Hand-picked to match what you are learning, each with a summary, a three-pass reading guide, questions and a critique template." },
  { t: "A research lab", d: "A journal that turns questions into hypotheses, experiment plans and paper outlines, with drafts and target venues tracked." },
  { t: "Spaced review", d: "Every lesson's key ideas join a flashcard deck scheduled by the FSRS algorithm, so you keep what you learn for years." },
  { t: "The NeuroAI Hub", d: "Books, videos, tools, datasets, institutes, conferences and communities, in one place." },
  { t: "A path to a PhD", d: "Programmes in Europe, Canada and Australia, an application tracker, and an industry track for AI engineering." },
];

export default function Home() {
  const teaching = WEEKS.filter((w) => w.kind !== "rest").length;
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-14 md:pt-20">
        <div className="eyebrow">A free course · 208 weeks · 3 hours a day</div>
        <h1 className="mt-4 max-w-3xl text-[2.5rem] font-semibold leading-[1.08] tracking-tight md:text-[3.6rem]" style={{ fontFamily: "var(--font-serif)" }}>
          Learn how brains and machines learn.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-2">
          Engram takes you from the foundations to independent research in NeuroAI: neuroscience, machine learning and deep learning, taught side by side, one day at a time.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/learn/w001/d1" className="btn btn-primary !px-5 !py-3 !text-base">Start Day 1</Link>
          <Link href="/curriculum" className="btn !px-5 !py-3 !text-base">See the curriculum</Link>
        </div>
        <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3 text-center">
          {[["8", "parts"], [String(teaching), "teaching weeks"], ["5", "papers a week"]].map(([n, l]) => (
            <div key={l} className="card px-3 py-4"><div className="text-2xl font-semibold">{n}</div><div className="text-xs text-ink-3">{l}</div></div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.t}><div className="font-semibold">{f.t}</div><p className="mt-1 text-[0.95rem] text-ink-2">{f.d}</p></div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>Eight parts, from first principles to your own research</h2>
        <ol className="mt-6 grid gap-3 md:grid-cols-2">
          {PARTS.map((p) => (
            <li key={p.n}>
              <Link href={`/curriculum#part-${p.n}`} className="card flex h-full gap-4 p-4 hover:border-ink-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent">{p.n}</span>
                <span>
                  <span className="block font-semibold">{p.title}</span>
                  <span className="block text-xs text-ink-3">Weeks {p.weeks[0]} to {p.weeks[1]}</span>
                  <span className="mt-1 block text-sm text-ink-2">{p.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="card grid gap-6 p-6 md:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="text-xl font-semibold">A day on Engram</h2>
            <ul className="mt-3 space-y-2 text-[0.97rem]">
              <li><strong>2 hours:</strong> the day&apos;s lesson, from intuition to maths to code to the brain.</li>
              <li><strong>30 minutes:</strong> one of the week&apos;s five papers, with a reading guide.</li>
              <li><strong>15 minutes:</strong> spaced review of everything so far.</li>
              <li><strong>15 minutes:</strong> your research journal.</li>
            </ul>
            <p className="mt-3 text-sm text-ink-2">Six days a week. Day 6 is a Forge (challenge, quiz, deep read) in Years 1 and 2 and a Research Day in Years 3 and 4. Rest days never break your streak.</p>
          </div>
          <div className="flex flex-col justify-center gap-3">
            <AccountCta />
            <Link href="/hub" className="btn justify-center !py-3">Explore the NeuroAI Hub</Link>
          </div>
        </div>
        <p className="mt-6 text-xs text-ink-3">
          Engram is written by Peter Oluwafemi Adepoju. Course materials © 2026, all rights reserved; free to use for your own learning. Videos and papers belong to their creators and are linked or embedded with credit.
        </p>
      </section>
    </div>
  );
}
