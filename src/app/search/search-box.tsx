"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type Item = { kind: string; title: string; href: string; text: string };

export function SearchBox({ items }: { items: Item[] }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return items.filter((it) => { const t = (it.title + " " + it.text).toLowerCase(); return words.every((w) => t.includes(w)); }).slice(0, 50);
  }, [q, items]);
  return (
    <div className="mt-4">
      <input autoFocus className="input !py-3 !text-base" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search lessons, weeks, papers, terms, books, tools" />
      <ul className="mt-4 space-y-2">
        {results.map((r, i) => (
          <li key={i}><Link href={r.href} className="card flex items-center gap-3 p-3 hover:border-ink-3"><span className="chip w-20 justify-center">{r.kind}</span><span className="min-w-0 flex-1 truncate">{r.title}</span></Link></li>
        ))}
        {q && !results.length ? <li className="text-sm text-ink-3">No results.</li> : null}
      </ul>
    </div>
  );
}
