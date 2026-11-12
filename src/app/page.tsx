import Link from "next/link";
import { PARTS, WEEKS } from "@/lib/curriculum";
import { AccountCta } from "@/components/account-cta";
import { HeroFigure } from "@/components/hero-figure";

const FEATURES = [
  { t: "A lesson every day", d: "Guided learning: interactive figures, step-by-step derivations, curated videos and Python that runs in your browser." },
  { t: "Five papers a week", d: "Hand-picked to match what you are learning, each with a summary, a three-pass reading guide, and questions." },
  { t: "A research lab", d: "A journal that turns questions into hypotheses, experiment plans and paper outlines." },
  { t: "Spaced review", d: "Every lesson's key ideas join a flashcard deck scheduled by the FSRS algorithm." },
  { t: "The NeuroAI Hub", d: "Books, videos, tools, datasets, institutes, conferences and communities, in one place." },
  { t: "A path to a PhD", d: "Programmes in Europe, Canada and Australia, and an application tracker." },
];

export default function Home() {
  const teaching = WEEKS.filter((w) => w.kind !== "rest").length;
  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-14 pt-14 md:grid-cols-[1.3fr_1fr] md:pt-20">
        <div>
        <div className="eyebrow">A free course · 208 weeks</div>
        <h1 className="mt-4 max-w-3xl text-[2.5rem] font-semibold leading-[1.08] tracking-tight md:text-[3.6rem]" style={{ fontFamily: "var(--font-serif)" }}>
          Learn how <em className="hero-em">brains and machines</em> learn.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-2">
          Engram takes you from the foundations to independent research in NeuroAI: neuroscience, machine learning and deep learning, taught side by side.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/learn/w001/d1" className="btn btn-primary !px-5 !py-3 !text-base">Start Day 1</Link>
          <Link href="/curriculum" className="btn !px-5 !py-3 !text-base">See the curriculum</Link>
        </div>
        <dl className="hero-stats mt-12 flex max-w-2xl divide-x divide-line">
          {[["8", "parts"], [String(teaching), "teaching weeks"], ["5", "papers a week"], ["0", "cost"]].map(([n, l]) => (
            <div key={l} className="px-5 first:pl-0 sm:px-7">
              <dt className="display text-[1.75rem] leading-none" style={{ fontFamily: "var(--font-serif)" }}>{n}</dt>
              <dd className="mt-1.5 text-xs text-ink-3">{l}</dd>
            </div>
          ))}
        </dl>
        </div>
        <HeroFigure />
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.t}><div className="font-semibold">{f.t}</div><p className="mt-1 text-[0.95rem] text-ink-2">{f.d}</p></div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="display text-[1.9rem] font-semibold leading-tight" style={{ fontFamily: "var(--font-serif)" }}>Eight parts, from first principles to your own research</h2>
        <ol className="hero-parts mt-6 grid gap-3 md:grid-cols-2">
          {PARTS.map((p) => (
            <li key={p.n}>
              <Link href={`/curriculum#part-${p.n}`} className="card flex h-full gap-4 p-4 hover:border-ink-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent">{p.n}</span>
                <span>
                  <span className="block font-semibold">{p.title}</span>
                  <span className="block text-xs text-ink-3">{p.weeks[0] === p.weeks[1] ? `Week ${p.weeks[0]}` : `Weeks ${p.weeks[0]} to ${p.weeks[1]}`}</span>
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
              <li>The day&apos;s lesson, from intuition to maths to code to the brain.</li>
              <li>One of the week&apos;s five papers, with a reading guide.</li>
              <li>Spaced review of everything so far.</li>
              <li>Your research journal.</li>
            </ul>
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
