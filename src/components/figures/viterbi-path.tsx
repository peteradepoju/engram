"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

const T = 40;

/** Viterbi's most likely state path against thresholding each observation, for a two-state chain. */
export function ViterbiPath() {
  const [stay, setStay] = useState(0.92);
  const [sep, setSep] = useState(1.0);
  const res = useMemo(() => {
    const r = rng(651), z: number[] = [0], x: number[] = [];
    for (let t = 1; t < T; t++) z.push(r() < stay ? z[t - 1] : 1 - z[t - 1]);
    for (let t = 0; t < T; t++) x.push((z[t] ? sep : -sep) + gauss(r));
    const lg = (a: number): number => Math.log(Math.max(a, 1e-12));
    const em = (t: number, k: number): number => -0.5 * (x[t] - (k ? sep : -sep)) ** 2;
    const d = [[lg(0.5) + em(0, 0), lg(0.5) + em(0, 1)]], bp: number[][] = [[0, 0]];
    for (let t = 1; t < T; t++) {
      const row: number[] = [], b: number[] = [];
      for (let k = 0; k < 2; k++) {
        const cand = [d[t - 1][0] + lg(k === 0 ? stay : 1 - stay), d[t - 1][1] + lg(k === 1 ? stay : 1 - stay)];
        const best = cand[0] >= cand[1] ? 0 : 1;
        row.push(cand[best] + em(t, k)); b.push(best);
      }
      d.push(row); bp.push(b);
    }
    const path = Array(T).fill(0);
    path[T - 1] = d[T - 1][0] >= d[T - 1][1] ? 0 : 1;
    for (let t = T - 2; t >= 0; t--) path[t] = bp[t + 1][path[t + 1]];
    const thr = x.map((v) => (v > 0 ? 1 : 0));
    const acc = (p: number[]): number => p.filter((v, i) => v === z[i]).length / T;
    const runs = (p: number[]): number => p.filter((v, i) => i > 0 && v !== p[i - 1]).length;
    return { z, x, path, thr, accV: acc(path), accT: acc(thr), swV: runs(path), swT: runs(thr), swTrue: runs(z) };
  }, [stay, sep]);
  const sx = (t: number): number => 18 + t * 7.6;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 160" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Viterbi path">
        {res.x.map((v, t) => <circle key={t} cx={sx(t)} cy={55 - v * 12} r="1.8" fill="var(--ink-3)" />)}
        {[["true state", res.z, 95, "var(--ink)"], ["threshold each point", res.thr, 118, "var(--neuro)"], ["Viterbi path", res.path, 141, "var(--ai)"]].map(([lab, p, y, c]) => (
          <g key={lab as string}>
            {(p as number[]).map((v, t) => <rect key={t} x={sx(t) - 3} y={(y as number) - 6} width="6" height="6" fill={v ? (c as string) : "none"} stroke={c as string} strokeWidth="0.8" />)}
            <text x="330" y={(y as number) - 8} fontSize="7" textAnchor="end" fill={c as string}>{lab as string}</text>
          </g>
        ))}
        <text x="20" y="12" fontSize="8" fill="var(--ink-3)">observations</text>
      </svg>
      <Slider label="probability the state persists" value={stay} min={0.5} max={0.99} step={0.01} onChange={setStay} fmt={(v) => v.toFixed(2)} />
      <Slider label="separation of the two states" value={sep} min={0.2} max={2.5} step={0.05} onChange={setSep} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="accuracy: threshold / Viterbi" value={`${res.accT.toFixed(2)} / ${res.accV.toFixed(2)}`} />
        <Stat label="switches: true / threshold / Viterbi" value={`${res.swTrue} / ${res.swT} / ${res.swV}`} />
      </div>
      <p className="text-sm text-ink-2">Thresholding each observation ignores that states persist, so it flickers between them. Viterbi finds the single most likely path through the whole sequence, paying a cost in log-probability for every switch, so it recovers runs of the same state. The more persistent the state or the noisier the observations, the larger the advantage.</p>
    </div>
  );
}
