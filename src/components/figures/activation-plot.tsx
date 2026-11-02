"use client";

import { useState } from "react";
import { Slider } from "./util";

type Fn = { f: (x: number) => number; d: (x: number) => number; formula: string; deriv: string };
const sig = (x: number) => 1 / (1 + Math.exp(-x));
const FNS: Record<string, Fn> = {
  sigmoid: { f: sig, d: (x) => sig(x) * (1 - sig(x)), formula: "σ(x) = 1 / (1 + e^−x)", deriv: "σ′(x) = σ(x)(1 − σ(x))" },
  tanh: { f: Math.tanh, d: (x) => 1 - Math.tanh(x) ** 2, formula: "tanh(x)", deriv: "1 − tanh²(x)" },
  ReLU: { f: (x) => Math.max(0, x), d: (x) => (x > 0 ? 1 : 0), formula: "max(0, x)", deriv: "1 if x > 0, else 0" },
  softplus: { f: (x) => Math.log(1 + Math.exp(x)), d: sig, formula: "log(1 + e^x)", deriv: "σ(x)" },
  exponential: { f: Math.exp, d: Math.exp, formula: "e^x", deriv: "e^x" },
};

/** Common nonlinearities of model neurons and networks, with their derivatives. */
export function ActivationPlot() {
  const [name, setName] = useState("sigmoid");
  const [gain, setGain] = useState(1);
  const [thr, setThr] = useState(0);
  const F = FNS[name];
  const g = (x: number) => F.f(gain * (x - thr)), dg = (x: number) => gain * F.d(gain * (x - thr));
  const W = 540, H = 260, X = (x: number) => 40 + ((x + 5) / 10) * (W - 60), Y = (y: number) => 220 - Math.max(-1.2, Math.min(3.2, y)) * 55;
  const pts = (fn: (x: number) => number) => Array.from({ length: 201 }, (_, i) => { const x = -5 + i * 0.05; return `${X(x)},${Y(fn(x))}`; }).join(" ");
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {Object.keys(FNS).map((k) => <button key={k} className={`btn !py-1.5 ${name === k ? "btn-primary" : ""}`} onClick={() => setName(k)}>{k}</button>)}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="An activation function and its derivative">
        {[-4, -2, 0, 2, 4].map((x) => <g key={x}><line x1={X(x)} x2={X(x)} y1="20" y2="240" stroke="var(--line)" /><text x={X(x)} y="254" fontSize="10" textAnchor="middle" fill="var(--ink-3)">{x}</text></g>)}
        {[0, 1, 2, 3].map((y) => <g key={y}><line x1="40" x2={W - 20} y1={Y(y)} y2={Y(y)} stroke="var(--line)" /><text x="34" y={Y(y) + 3} fontSize="10" textAnchor="end" fill="var(--ink-3)">{y}</text></g>)}
        <polyline points={pts(g)} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
        <polyline points={pts(dg)} fill="none" stroke="var(--warn)" strokeWidth="2" strokeDasharray="6 4" />
        <text x="48" y="32" fontSize="11" fill="var(--accent)">f: {F.formula}</text>
        <text x="48" y="48" fontSize="11" fill="var(--warn)">f′: {F.deriv}</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="gain (steepness)" value={gain} min={0.25} max={4} step={0.05} onChange={setGain} fmt={(v) => v.toFixed(2)} />
        <Slider label="threshold" value={thr} min={-3} max={3} step={0.1} onChange={setThr} fmt={(v) => v.toFixed(1)} />
      </div>
      <p className="text-sm text-ink-2">Solid: the nonlinearity f(gain × (x − threshold)). Dashed: its derivative, which by the chain rule picks up a factor of the gain. Sigmoid and tanh derivatives vanish far from threshold (saturation), so learning signals passing through them shrink; ReLU's derivative is exactly 1 for every active unit. Many neuroscience models use the exponential, whose derivative equals itself.</p>
    </div>
  );
}
