import type { Metadata } from "next";
import { WEEKS, DAY_TITLES, weekSlug } from "@/lib/curriculum";
import { PAPERS } from "@/data/papers";
import { GLOSSARY, BOOKS, TOOLS, DATASETS } from "@/data/hub";
import { SearchBox, type Item } from "./search-box";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  const items: Item[] = [
    ...WEEKS.filter((w) => w.kind !== "rest").map((w) => ({ kind: "Week", title: `Week ${w.n}: ${w.title}`, href: `/curriculum/${weekSlug(w.n)}`, text: w.title })),
    ...Object.entries(DAY_TITLES).flatMap(([w, days]) => days.map((t, i) => ({ kind: "Lesson", title: `W${w} D${i + 1}: ${t}`, href: `/learn/${weekSlug(Number(w))}/d${i + 1}`, text: t }))),
    ...PAPERS.map((p) => ({ kind: "Paper", title: `${p.title} (${p.year})`, href: `/papers/${p.id}`, text: `${p.title} ${p.authors} ${p.why}` })),
    ...GLOSSARY.map((g) => ({ kind: "Glossary", title: g.term, href: "/hub/glossary", text: `${g.term} ${g.def}` })),
    ...BOOKS.map((b) => ({ kind: "Book", title: b.title, href: "/hub/library", text: `${b.title} ${b.authors} ${b.topic}` })),
    ...TOOLS.map((t) => ({ kind: "Tool", title: t.name, href: "/hub/tools", text: `${t.name} ${t.kind} ${t.use}` })),
    ...DATASETS.map((d) => ({ kind: "Dataset", title: d.name, href: "/hub/datasets", text: `${d.name} ${d.what}` })),
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8">
      <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>Search</h1>
      <SearchBox items={items} />
    </div>
  );
}
