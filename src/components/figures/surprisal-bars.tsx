"use client";

import { useMemo, useState } from "react";

const corpus = `the cat sat on the mat . the dog sat on the rug . the cat chased the mouse . the dog chased the cat .
the child read the book . the child read the letter . the teacher read the book . the teacher wrote the letter .
the girl ate the apple . the boy ate the bread . the girl drank the milk . the boy drank the water .
the farmer milked the cow . the farmer fed the cow . the farmer fed the dog . the baker baked the bread .
the baker sold the bread . the man drove the car . the woman drove the bus . the man parked the car .
the cat slept on the mat . the dog slept on the rug . the child slept in the bed . the baby slept in the cot .
she spread butter on the bread . he spread jam on the bread . she put milk in the tea . he put sugar in the tea .`.split(/\s+/);

const pairs: [string, string][] = [
  ["the farmer milked the cow .", "the farmer milked the bread ."],
  ["she spread butter on the bread .", "she spread butter on the socks ."],
  ["the man drove the car .", "the man drove the apple ."],
];

/** Word-by-word surprisal under bigram and trigram models for a sentence and a surprising variant. */
export function SurprisalBars() {
  const [pi, setPi] = useState(0);
  const [tri, setTri] = useState(true);
  const model = useMemo(() => {
    const c = (arr: string[]) => { const m = new Map<string, number>(); arr.forEach((k) => m.set(k, (m.get(k) || 0) + 1)); return m; };
    const V = new Set(corpus).size;
    const U = c(corpus), uni = c(corpus.slice(0, -1));
    const big = c(corpus.slice(0, -1).map((w, i) => `${w} ${corpus[i + 1]}`));
    const tg = c(corpus.slice(0, -2).map((w, i) => `${w} ${corpus[i + 1]} ${corpus[i + 2]}`));
    const bc = c(corpus.slice(0, -2).map((w, i) => `${w} ${corpus[i + 1]}`));
    const pb = (w: string, v: string) => ((big.get(`${v} ${w}`) || 0) + 0.1) / ((uni.get(v) || 0) + 0.1 * V);
    const pt = (w: string, u: string, v: string) => {
      const n3 = bc.get(`${u} ${v}`) || 0, n2 = uni.get(v) || 0;
      return 0.6 * (n3 ? (tg.get(`${u} ${v} ${w}`) || 0) / n3 : 0) + 0.3 * (n2 ? (big.get(`${v} ${w}`) || 0) / n2 : 0) + 0.1 * ((U.get(w) || 0) + 0.5) / (corpus.length + 0.5 * V);
    };
    return { pb, pt };
  }, []);
  const surp = (s: string) => { const ws = s.split(" "); return ws.map((w, i) => (i === 0 ? null : -Math.log2(tri && i > 1 ? model.pt(w, ws[i - 2], ws[i - 1]) : model.pb(w, ws[i - 1])))).slice(1).map((v, i) => [ws[i + 1], v as number] as [string, number]); };
  const [a, b] = pairs[pi].map(surp);
  const W = 360, H = 170, bw = 360 / (a.length + 1), sy = (v: number) => Math.min(v, 12) * 9;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {pairs.map((p, i) => <button key={i} onClick={() => setPi(i)} className={`rounded-md border px-3 py-1 text-xs ${pi === i ? "border-accent text-accent" : "border-line text-ink-2"}`}>{p[0].split(" ").slice(-2, -1)[0]} / {p[1].split(" ").slice(-2, -1)[0]}</button>)}
        <button onClick={() => setTri(!tri)} className="rounded-md border border-line px-3 py-1 text-xs text-ink-2">{tri ? "trigram model" : "bigram model"}</button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Surprisal by word">
        {a.map(([w, v], i) => (
          <g key={i}>
            <rect x={14 + i * bw} y={140 - sy(v)} width={bw * 0.4} height={sy(v)} fill="var(--ai)" />
            <rect x={14 + i * bw + bw * 0.42} y={140 - sy(b[i][1])} width={bw * 0.4} height={sy(b[i][1])} fill="var(--neuro)" />
            <text x={14 + i * bw + bw * 0.4} y="154" fontSize="7.5" textAnchor="middle" fill="var(--ink-2)">{w === b[i][0] ? w : `${w}/${b[i][0]}`}</text>
          </g>
        ))}
        <line x1="10" x2="350" y1="140" y2="140" stroke="var(--line)" />
        <text x="14" y="14" fontSize="8" fill="var(--ai)">expected sentence</text>
        <text x="110" y="14" fontSize="8" fill="var(--neuro)">surprising variant</text>
        <text x="350" y="168" fontSize="8" textAnchor="end" fill="var(--ink-3)">bar height: surprisal in bits</text>
      </svg>
      <p className="text-sm text-ink-2">Surprisal of each word given the words before it, estimated from the lesson&apos;s small corpus. Switch to the bigram model and see which expectations disappear when only one word of context is used.</p>
    </div>
  );
}
