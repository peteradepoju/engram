import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HUB_SECTIONS } from "../sections";
import { BOOKS, CHANNELS, TOOLS, DATASETS, PLACES, EVENTS, COMMUNITIES, GLOSSARY } from "@/data/hub";

type Params = { section: string };

export function generateStaticParams() {
  return HUB_SECTIONS.map((s) => ({ section: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { section } = await params;
  const s = HUB_SECTIONS.find((x) => x.id === section);
  return s ? { title: s.title } : {};
}

const ext = { target: "_blank", rel: "noreferrer" } as const;
const wk = (n: number) => <Link href={`/curriculum/w${String(n).padStart(3, "0")}`} className="chip hover:!bg-accent-soft">Week {n}</Link>;

export default async function HubSection({ params }: { params: Promise<Params> }) {
  const { section } = await params;
  const s = HUB_SECTIONS.find((x) => x.id === section);
  if (!s) notFound();
  return (
    <div className="mx-auto max-w-4xl px-4 pt-8">
      <nav className="text-sm text-ink-3"><Link href="/hub" className="hover:text-ink">Hub</Link></nav>
      <h1 className="mt-4 text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>{s.title}</h1>
      <p className="mt-2 text-ink-2">{s.blurb}</p>
      <div className="mt-6">
        {s.id === "library" && (
          <ul className="space-y-3">
            {BOOKS.map((b) => (
              <li key={b.title} className="card p-4">
                <div className="flex flex-wrap items-baseline gap-2"><span className="font-semibold">{b.title}</span><span className="text-sm text-ink-3">{b.authors} · {b.year}</span></div>
                <div className="mt-1 flex flex-wrap gap-1.5"><span className="chip">{b.topic}</span><span className="chip">{b.weeks}</span></div>
                <p className="mt-2 text-sm text-ink-2">{b.how}</p>
                <div className="mt-2 text-sm">{b.free ? <a {...ext} href={b.free} className="text-accent underline">Official free version ↗</a> : <a {...ext} href={b.publisher} className="text-accent underline">Publisher or official materials ↗</a>}</div>
              </li>
            ))}
          </ul>
        )}
        {s.id === "videos" && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {CHANNELS.map((c) => (
              <li key={c.name} className="card p-4"><a {...ext} href={c.url} className="font-semibold hover:underline">{c.name} ↗</a><div className="text-xs text-ink-3">{c.by} · {c.topic}</div><p className="mt-1 text-sm text-ink-2">{c.why}</p></li>
            ))}
          </ul>
        )}
        {s.id === "tools" && (
          <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
            {TOOLS.map((t) => (
              <li key={t.name} className="flex flex-wrap items-center gap-3 p-3">
                <a {...ext} href={t.url} className="w-32 font-semibold hover:underline">{t.name}</a>
                <span className="chip">{t.kind}</span>
                <span className="min-w-0 flex-1 text-sm text-ink-2">{t.use}</span>{wk(t.week)}
              </li>
            ))}
          </ul>
        )}
        {s.id === "datasets" && (
          <ul className="space-y-3">
            {DATASETS.map((d) => (
              <li key={d.name} className="card p-4"><div className="flex flex-wrap items-center gap-2"><a {...ext} href={d.url} className="font-semibold hover:underline">{d.name} ↗</a><span className="chip">{d.species}</span>{wk(d.week)}</div><p className="mt-1 text-sm text-ink-2">{d.what}</p></li>
            ))}
          </ul>
        )}
        {s.id === "labs" && (["Europe", "Canada", "Australia"] as const).map((r) => (
          <section key={r} className="mb-8">
            <h2 className="text-xl font-semibold">{r}</h2>
            <ul className="mt-3 space-y-2">
              {PLACES.filter((p) => p.region === r).map((p) => (
                <li key={p.name} className="card p-4"><a {...ext} href={p.url} className="font-semibold hover:underline">{p.name} ↗</a><div className="text-xs text-ink-3">{p.city}</div><p className="mt-1 text-sm text-ink-2">{p.what}</p></li>
              ))}
            </ul>
          </section>
        ))}
        {s.id === "labs" && <p className="text-sm text-ink-3">To find supervisors, read the papers you love and note where their authors work, then check each group&apos;s page for current students and open positions. The Career page explains how to write to them.</p>}
        {s.id === "events" && (
          <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-line text-left text-ink-2"><th className="p-3">Event</th><th className="p-3">Kind</th><th className="p-3">When</th><th className="p-3">Typical deadline</th></tr></thead>
              <tbody>{EVENTS.map((e) => (
                <tr key={e.name} className="border-b border-line last:border-0"><td className="p-3"><a {...ext} href={e.url} className="font-semibold hover:underline">{e.name}</a></td><td className="p-3 text-ink-2">{e.kind}</td><td className="p-3">{e.when}</td><td className="p-3 text-ink-2">{e.deadline}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {s.id === "community" && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {COMMUNITIES.map((c) => <li key={c.name} className="card p-4"><a {...ext} href={c.url} className="font-semibold hover:underline">{c.name} ↗</a><p className="mt-1 text-sm text-ink-2">{c.what}</p></li>)}
          </ul>
        )}
        {s.id === "glossary" && (
          <dl className="divide-y divide-line rounded-xl border border-line bg-surface">
            {[...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term)).map((g) => (
              <div key={g.term} className="grid gap-1 p-3 sm:grid-cols-[220px_1fr_auto] sm:items-start sm:gap-3">
                <dt className="font-semibold">{g.term}</dt><dd className="text-sm text-ink-2">{g.def}</dd><dd>{wk(g.week)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
