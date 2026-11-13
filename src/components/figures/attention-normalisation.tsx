"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

/** Normalisation model of attention: contrast-response functions with and without attention. */
export function AttentionNormalisation() {
  const [sw, setSw] = useState(1);
  const [aw, setAw] = useState(6);
  const res = useMemo(() => {
    const xs = Array.from({ length: 121 }, (_, i) => -12 + i * 0.2);
    const kern = xs.map((x) => Math.exp(-(x * x) / (2 * 25)));
    const ks = kern.reduce((a, b) => a + b, 0);
    const resp = (c: number, att: boolean) => {
      const EA = xs.map((x) => c * Math.exp(-(x * x) / (2 * sw * sw)) * (att ? 1 + 2 * Math.exp(-(x * x) / (2 * aw * aw)) : 1));
      let S = 0; for (let j = 0; j < xs.length; j++) S += EA[j] * kern[j] / ks;
      return EA[60] / (S + 0.05);
    };
    const cs = Array.from({ length: 31 }, (_, i) => Math.pow(10, -3 + i * 0.1));
    const un = cs.map((c) => resp(c, false)), at = cs.map((c) => resp(c, true));
    return { cs, un, at };
  }, [sw, aw]);
  const m = Math.max(...res.at, ...res.un), W = 360, H = 170;
  const sx = (i: number) => 35 + (i / 30) * 300, sy = (v: number) => H - 22 - (v / m) * (H - 40);
  const c50 = (R: number[]) => { const h = Math.max(...R) / 2; const i = R.findIndex((v) => v >= h); return res.cs[Math.max(0, i)]; };
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Contrast-response functions with attention">
        <line x1="35" x2="335" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        <polyline points={res.un.map((v, i) => `${sx(i)},${sy(v)}`).join(" ")} fill="none" stroke="var(--ink-3)" strokeWidth="2" />
        <polyline points={res.at.map((v, i) => `${sx(i)},${sy(v)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <text x="40" y="16" fontSize="9" fill="var(--neuro)">attended</text>
        <text x="90" y="16" fontSize="9" fill="var(--ink-3)">unattended</text>
        <text x="35" y={H - 8} fontSize="8" fill="var(--ink-3)">0.1%</text>
        <text x="335" y={H - 8} fontSize="8" textAnchor="end" fill="var(--ink-3)">100% contrast</text>
      </svg>
      <Slider label="stimulus size" value={sw} min={0.5} max={8} step={0.25} onChange={setSw} fmt={(v) => v.toFixed(2)} />
      <Slider label="attention field size" value={aw} min={0.5} max={8} step={0.25} onChange={setAw} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="maximum response ratio" value={(Math.max(...res.at) / Math.max(...res.un)).toFixed(2)} />
        <Stat label="c50 ratio" value={(c50(res.at) / c50(res.un)).toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">A small stimulus with a large attention field shifts the curve left with little change at the top (contrast gain). Swap the sizes and the curve is scaled upwards instead (response gain).</p>
    </div>
  );
}
