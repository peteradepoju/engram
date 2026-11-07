"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Many tests at once: sorted p-values against the uncorrected, Bonferroni and Benjamini-Hochberg thresholds. */
export function MultipleTests() {
  const [m, setM] = useState(100);
  const [frac, setFrac] = useState(0.1);
  const [seed, setSeed] = useState(1);
  const q = 0.05;
  const tests = useMemo(() => {
    const r = rng(seed * 13 + m), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
    const Phi = (z: number) => { const t = 1 / (1 + 0.2316419 * Math.abs(z)), d = Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI), p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429)))); return z >= 0 ? 1 - p : p; };
    return Array.from({ length: m }, (_, i) => { const real = i < Math.round(frac * m); const z = (real ? 3 : 0) + g(); return { real, p: 2 * (1 - Phi(Math.abs(z))) }; }).sort((a, b) => a.p - b.p);
  }, [m, frac, seed]);
  let kBH = 0; tests.forEach((t, i) => { if (t.p <= ((i + 1) / m) * q) kBH = i + 1; });
  const count = (sel: (t: { p: number }, i: number) => boolean) => { const s = tests.filter(sel); return { n: s.length, fp: s.filter((t) => !(t as { real: boolean }).real).length }; };
  const raw = count((t) => t.p < q), bon = count((t) => t.p < q / m), bh = count((_, i) => i < kBH);
  const W = 360, H = 220, X = (i: number) => 34 + (i / (m - 1)) * (W - 44);
  const Y = (p: number) => 14 + (H - 40) * (1 - Math.min(1, -Math.log10(Math.max(p, 1e-8)) / 8));
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H + 16}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Sorted p-values with correction thresholds">
        <line x1="34" x2={W - 10} y1={Y(q)} y2={Y(q)} stroke="var(--warn)" strokeDasharray="4 3" />
        <line x1="34" x2={W - 10} y1={Y(q / m)} y2={Y(q / m)} stroke="var(--ai)" strokeDasharray="4 3" />
        <polyline points={tests.map((_, i) => `${X(i)},${Y(((i + 1) / m) * q)}`).join(" ")} fill="none" stroke="var(--good)" strokeWidth="1.5" />
        {tests.map((t, i) => <circle key={i} cx={X(i)} cy={Y(t.p)} r={m > 300 ? 1.6 : 2.6} fill={t.real ? "var(--neuro)" : "var(--ink-3)"} />)}
        <line x1="34" x2="34" y1="14" y2={H - 26} stroke="var(--line)" />
        {[0, 2, 4, 6, 8].map((e) => <text key={e} x="30" y={Y(10 ** -e) + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">{e === 0 ? "1" : `1e-${e}`}</text>)}
        <text x={W - 10} y={H - 8} fontSize="10" textAnchor="end" fill="var(--ink-3)">tests, sorted by p-value</text>
        <text x="40" y={H + 10} fontSize="10" fill="var(--warn)">p = 0.05</text>
        <text x="100" y={H + 10} fontSize="10" fill="var(--ai)">Bonferroni</text>
        <text x="170" y={H + 10} fontSize="10" fill="var(--good)">Benjamini-Hochberg line</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Slider label="number of tests m" value={m} min={10} max={1000} step={10} onChange={setM} />
        <Slider label="fraction with a real effect" value={frac} min={0} max={0.5} step={0.01} onChange={setFrac} fmt={(v) => v.toFixed(2)} />
        <button className="btn !py-1.5" onClick={() => setSeed(seed + 1)}>New data</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="p below 0.05 (false)" value={`${raw.n} (${raw.fp})`} />
        <Stat label="Bonferroni (false)" value={`${bon.n} (${bon.fp})`} />
        <Stat label="BH at q = 0.05 (false)" value={`${bh.n} (${bh.fp})`} />
      </div>
      <p className="text-sm text-ink-2">Many tests, some with real effects (pink) and most without (grey), sorted by p-value on a log scale. Declaring everything below 0.05 significant lets about 5% of the null tests through, which with hundreds of tests is many false discoveries. Bonferroni divides the threshold by m and almost never lets a false one through, but misses real effects. Benjamini-Hochberg finds the largest k whose p-value is below the line (k/m) × 0.05 and declares the first k significant, keeping the expected fraction of false discoveries near 5%.</p>
    </div>
  );
}
