"use client";

import { useMemo, useState } from "react";
import { rng } from "./util";

const KINDS = ["white noise", "Ornstein-Uhlenbeck", "random walk", "noisy oscillator", "logistic map (r = 4)", "logistic map (r = 3.5)"] as const;

/** Sample paths and autocorrelation functions of the processes of Weeks 21 to 24. */
export function AutocorrZoo() {
  const [kind, setKind] = useState<(typeof KINDS)[number]>("Ornstein-Uhlenbeck");
  const { path, acf } = useMemo(() => {
    const r = rng(2024), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r());
    const n = 3000, x: number[] = [];
    if (kind === "white noise") for (let i = 0; i < n; i++) x.push(g());
    if (kind === "Ornstein-Uhlenbeck") { let v = 0; for (let i = 0; i < n; i++) { v += -v / 10 + 0.45 * g(); x.push(v); } }
    if (kind === "random walk") { let v = 0; for (let i = 0; i < n; i++) { v += g(); x.push(v); } }
    if (kind === "noisy oscillator") { let a = 0, b = 0; for (let i = 0; i < n; i++) { const w = 2 * Math.PI / 20, rho = 0.97; const na = rho * (a * Math.cos(w) - b * Math.sin(w)) + g(); b = rho * (a * Math.sin(w) + b * Math.cos(w)); a = na; x.push(a); } }
    if (kind.startsWith("logistic")) { const rr = kind.includes("4") ? 4 : 3.5; let v = 0.3; for (let i = 0; i < n + 200; i++) { v = rr * v * (1 - v); if (i >= 200) x.push(v); } }
    const m = x.reduce((s, v) => s + v, 0) / n, xc = x.map((v) => v - m), v0 = xc.reduce((s, v) => s + v * v, 0) / n;
    const acf = Array.from({ length: 51 }, (_, L) => xc.slice(0, n - L).reduce((s, v, i) => s + v * xc[i + L], 0) / (n - L) / v0);
    return { path: x.slice(0, 200), acf };
  }, [kind]);
  const W = 360, H = 230, lo = Math.min(...path), hi = Math.max(...path);
  const PX = (i: number) => 20 + (i / 199) * (W - 30), PY = (v: number) => 12 + (1 - (v - lo) / (hi - lo || 1)) * 80;
  const AX = (L: number) => 20 + (L / 50) * (W - 30), AY = (v: number) => 170 - v * 50;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="A sample path and its autocorrelation function">
        <polyline points={path.map((v, i) => `${PX(i)},${PY(v)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.2" />
        <text x="22" y="108" fontSize="9" fill="var(--ink-3)">200 steps of the process</text>
        <line x1="20" x2={W - 10} y1={AY(0)} y2={AY(0)} stroke="var(--line)" />
        {acf.map((v, L) => <line key={L} x1={AX(L)} x2={AX(L)} y1={AY(0)} y2={AY(v)} stroke="var(--ai)" strokeWidth="3" />)}
        <text x={W - 10} y={AY(1) + 6} fontSize="9" textAnchor="end" fill="var(--ai)">autocorrelation, lags 0 to 50</text>
        <text x={W - 10} y={H - 4} fontSize="9" textAnchor="end" fill="var(--ink-3)">lag →</text>
      </svg>
      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => <button key={k} className={`btn !py-1 text-xs ${k === kind ? "btn-primary" : ""}`} onClick={() => setKind(k)}>{k}</button>)}
      </div>
      <p className="text-sm text-ink-2">The autocorrelation function summarises how a process remembers its past. White noise forgets at once; the OU process forgets exponentially, over its time constant (Week 24); a random walk barely forgets, its estimated autocorrelation staying near 1; a noisy oscillator rings (Week 22); the logistic map at r = 4 is deterministic yet its autocorrelation is almost zero beyond lag 0 (Week 23), while at r = 3.5 it repeats every four steps. Correlation alone cannot tell chaos from noise.</p>
    </div>
  );
}
