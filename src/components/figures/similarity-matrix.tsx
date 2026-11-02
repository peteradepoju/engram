"use client";

import { useMemo, useState } from "react";
import { rng } from "./util";

type Metric = "cosine" | "correlation" | "euclidean";

/** Similarity between population responses to 12 orientations. Neurons are vectors' coordinates; stimuli are vectors. */
export function SimilarityMatrix() {
  const [metric, setMetric] = useState<Metric>("cosine");
  const [noise, setNoise] = useState(2);
  const S = 12;
  const R = useMemo(() => {
    const r = rng(17);
    const prefs = Array.from({ length: 40 }, (_, i) => (i * 180) / 40);
    return Array.from({ length: S }, (_, s) => {
      const th = (s * 180) / S;
      return prefs.map((p) => 3 + 25 * Math.exp(2 * (Math.cos(((2 * (th - p)) * Math.PI) / 180) - 1)) + noise * (r() - 0.5) * 4);
    });
  }, [noise]);
  const M = useMemo(() => {
    const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);
    const nrm = (a: number[]) => Math.sqrt(dot(a, a));
    const centre = (a: number[]) => { const m = a.reduce((x, y) => x + y, 0) / a.length; return a.map((x) => x - m); };
    return R.map((a) => R.map((b) => {
      if (metric === "cosine") return dot(a, b) / (nrm(a) * nrm(b));
      if (metric === "correlation") { const ca = centre(a), cb = centre(b); return dot(ca, cb) / (nrm(ca) * nrm(cb)); }
      return Math.sqrt(a.reduce((s, x, i) => s + (x - b[i]) ** 2, 0));
    }));
  }, [R, metric]);
  const flat = M.flat(), lo = Math.min(...flat), hi = Math.max(...flat);
  const shade = (v: number) => {
    let t = (v - lo) / (hi - lo || 1);
    if (metric === "euclidean") t = 1 - t; // show similarity as bright
    const c = [[0.267, 0.005, 0.329], [0.128, 0.567, 0.551], [0.993, 0.906, 0.144]];
    const i = t < 0.5 ? 0 : 1, f = t < 0.5 ? t * 2 : (t - 0.5) * 2;
    return `rgb(${c[i].map((x, k) => Math.round((x + f * (c[i + 1][k] - x)) * 255)).join(",")})`;
  };
  const cell = 20;
  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      <svg viewBox={`0 0 ${S * cell + 40} ${S * cell + 40}`} className="w-full max-w-[280px] justify-self-center" role="img" aria-label={`${metric} similarity matrix`}>
        {M.map((row, i) => row.map((v, j) => <rect key={`${i}-${j}`} x={40 + j * cell} y={i * cell} width={cell} height={cell} fill={shade(v)} />))}
        {[0, 3, 6, 9].map((s) => <text key={s} x={40 + s * cell + cell / 2} y={S * cell + 14} fontSize="9" textAnchor="middle" fill="var(--ink-3)">{(s * 180) / S}°</text>)}
        {[0, 3, 6, 9].map((s) => <text key={s} x="34" y={s * cell + cell / 2 + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">{(s * 180) / S}°</text>)}
        <text x={40 + (S * cell) / 2} y={S * cell + 32} fontSize="10" textAnchor="middle" fill="var(--ink-2)">stimulus orientation</text>
      </svg>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {(["cosine", "correlation", "euclidean"] as Metric[]).map((m) => <button key={m} className={`btn !py-1.5 ${metric === m ? "btn-primary" : ""}`} onClick={() => setMetric(m)}>{m === "euclidean" ? "Euclidean distance" : m === "cosine" ? "cosine similarity" : "correlation"}</button>)}
        </div>
        <label className="block text-sm"><span className="text-ink-2">Noise in each response</span>
          <input type="range" min={0} max={8} step={0.5} value={noise} onChange={(e) => setNoise(Number(e.target.value))} className="mt-1 w-full accent-[var(--accent)]" /></label>
        <p className="text-sm text-ink-2">Each stimulus gives a 40-neuron response vector. Each cell compares two of them (bright means similar). Nearby orientations evoke similar population vectors, so the bright band hugs the diagonal and wraps around, because 0° and 180° are the same orientation. Cosine similarity ignores overall size; correlation also ignores the mean level; Euclidean distance uses both.</p>
      </div>
    </div>
  );
}
