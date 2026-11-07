"use client";

import { useMemo, useState } from "react";
import { rng, Stat } from "./util";

/** A permutation test: shuffle the condition labels many times to build the null distribution of the difference in means. */
export function PermutationTest() {
  const [shuffles, setShuffles] = useState(0);
  const data = useMemo(() => {
    const r = rng(2002), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
    const a = Array.from({ length: 12 }, () => 10 + 3 * g()), b = Array.from({ length: 12 }, () => 12.5 + 3 * g());
    return { a, b };
  }, []);
  const all = [...data.a, ...data.b];
  const mean = (v: number[]) => v.reduce((s, x) => s + x, 0) / v.length;
  const obs = mean(data.b) - mean(data.a);
  const perms = useMemo(() => {
    const r = rng(77);
    return Array.from({ length: 2000 }, () => {
      const idx = all.map((_, i) => i);
      for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
      const lab = idx.map((i) => all[i]);
      return { diff: mean(lab.slice(12)) - mean(lab.slice(0, 12)), order: idx };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const done = perms.slice(0, shuffles);
  const extreme = done.filter((d) => Math.abs(d.diff) >= Math.abs(obs)).length;
  const last = shuffles ? perms[shuffles - 1].order : all.map((_, i) => i);
  const W = 360, H = 250, lo = -5, hi = 5, bins = 40, bw = (hi - lo) / bins;
  const hist = new Array(bins).fill(0);
  done.forEach((d) => { const k = Math.floor((d.diff - lo) / bw); if (k >= 0 && k < bins) hist[k]++; });
  const top = Math.max(5, ...hist) * 1.1;
  const X = (v: number) => 14 + ((v - lo) / (hi - lo)) * (W - 24);
  const yv = (v: number) => 20 + (16 - v) * 4;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Two groups and the permutation distribution">
        {last.map((src, pos) => <circle key={pos} cx={pos < 12 ? 40 + pos * 9 : 220 + (pos - 12) * 9} cy={yv(all[src])} r="3.5" fill={src < 12 ? "var(--ai)" : "var(--neuro)"} />)}
        <text x="40" y="96" fontSize="10" fill="var(--ink-3)">labelled &quot;control&quot;</text>
        <text x="220" y="96" fontSize="10" fill="var(--ink-3)">labelled &quot;drug&quot;</text>
        {hist.map((h, k) => <rect key={k} x={X(lo + k * bw)} y={H - 26 - (h / top) * 110} width={(W - 24) / bins - 1} height={(h / top) * 110} fill={Math.abs(lo + (k + 0.5) * bw) >= Math.abs(obs) ? "var(--neuro)" : "var(--ink-3)"} opacity="0.7" />)}
        <line x1={X(obs)} x2={X(obs)} y1="110" y2={H - 26} stroke="var(--neuro)" strokeWidth="2.5" />
        <line x1={X(-obs)} x2={X(-obs)} y1="110" y2={H - 26} stroke="var(--neuro)" strokeWidth="1" strokeDasharray="4 3" />
        <line x1="14" x2={W - 10} y1={H - 26} y2={H - 26} stroke="var(--line)" />
        {[-4, -2, 0, 2, 4].map((v) => <text key={v} x={X(v)} y={H - 10} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{v}</text>)}
        <text x={W - 10} y="122" fontSize="10" textAnchor="end" fill="var(--neuro)">observed difference</text>
      </svg>
      <div className="flex flex-wrap gap-2">
        <button className="btn !py-1.5" onClick={() => setShuffles(Math.min(2000, shuffles + 1))}>Shuffle once</button>
        <button className="btn !py-1.5" onClick={() => setShuffles(Math.min(2000, shuffles + 100))}>Shuffle 100 times</button>
        <button className="btn !py-1.5" onClick={() => setShuffles(2000)}>All 2,000</button>
        <button className="btn !py-1.5" onClick={() => setShuffles(0)}>Reset</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="observed difference" value={obs.toFixed(2)} />
        <Stat label="shuffles" value={String(shuffles)} />
        <Stat label="permutation p" value={shuffles ? ((extreme + 1) / (shuffles + 1)).toFixed(4) : "-"} />
      </div>
      <p className="text-sm text-ink-2">Twelve responses per condition (dots; colour shows their true group). If the drug did nothing, the labels &quot;control&quot; and &quot;drug&quot; would be arbitrary, so shuffling them should produce differences as large as the observed one quite often. Each shuffle moves the dots between the two groups and adds one difference to the histogram. The p-value is the fraction of shuffles at least as extreme as the real labelling (plus one, counting the real labelling itself). No assumption about the shape of the data is needed.</p>
    </div>
  );
}
