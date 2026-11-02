"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
const sig = (x: number) => 1 / (1 + Math.exp(-x));
/** Derivatives of order 0..n at a, for each function. */
const DERIVS: Record<string, { f: (x: number) => number; d: (a: number, n: number) => number[]; label: string }> = {
  exponential: { f: Math.exp, d: (a, n) => Array.from({ length: n + 1 }, () => Math.exp(a)), label: "e^x" },
  sine: { f: Math.sin, d: (a, n) => Array.from({ length: n + 1 }, (_, k) => [Math.sin(a), Math.cos(a), -Math.sin(a), -Math.cos(a)][k % 4]), label: "sin x" },
  Gaussian: {
    f: (x) => Math.exp(-x * x / 2), label: "e^(−x²/2), a tuning curve",
    d: (a, n) => { const he = [1, a]; for (let k = 1; k < n; k++) he.push(a * he[k] - k * he[k - 1]); return he.slice(0, n + 1).map((h, k) => (k % 2 ? -1 : 1) * h * Math.exp(-a * a / 2)); },
  },
  sigmoid: {
    f: sig, label: "σ(x)",
    d: (a, n) => {
      // Each derivative of σ is a polynomial in s = σ(x); P_{k+1}(s) = P_k'(s) s (1 − s).
      let P = [0, 1]; const s = sig(a), out: number[] = [];
      for (let k = 0; k <= n; k++) {
        out.push(P.reduce((acc, c, i) => acc + c * s ** i, 0));
        const dP = P.slice(1).map((c, i) => c * (i + 1));
        const next = new Array(dP.length + 2).fill(0);
        dP.forEach((c, i) => { next[i + 1] += c; next[i + 2] -= c; });
        P = next;
      }
      return out;
    },
  },
};

/** Taylor polynomials of increasing order around a chosen point. */
export function TaylorApprox() {
  const [name, setName] = useState("Gaussian");
  const [a, setA] = useState(0.8);
  const [order, setOrder] = useState(2);
  const F = DERIVS[name];
  const d = F.d(a, order);
  const T = (x: number) => d.reduce((acc, dk, k) => acc + (dk / fact(k)) * (x - a) ** k, 0);
  const W = 540, H = 260, X = (x: number) => 30 + ((x + 4) / 8) * (W - 50), Y = (y: number) => 130 - y * 55;
  const pts = (fn: (x: number) => number) => Array.from({ length: 321 }, (_, i) => { const x = -4 + i * 0.025; return `${X(x)},${Y(Math.max(-2.3, Math.min(2.3, fn(x))))}`; }).join(" ");
  const err = Math.abs(T(a + 0.5) - F.f(a + 0.5));
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {Object.keys(DERIVS).map((k) => <button key={k} className={`btn !py-1.5 ${name === k ? "btn-primary" : ""}`} onClick={() => setName(k)}>{k}</button>)}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="A function and its Taylor polynomial">
        <defs><clipPath id="tac"><rect x="30" y="0" width={W - 50} height={H - 20} /></clipPath></defs>
        {[-4, -2, 0, 2, 4].map((x) => <g key={x}><line x1={X(x)} x2={X(x)} y1="0" y2={H - 20} stroke="var(--line)" /><text x={X(x)} y={H - 6} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{x}</text></g>)}
        <line x1="30" x2={W - 20} y1={Y(0)} y2={Y(0)} stroke="var(--line)" />
        <g clipPath="url(#tac)">
          <polyline points={pts(F.f)} fill="none" stroke="var(--accent)" strokeWidth="3" />
          <polyline points={pts(T)} fill="none" stroke="var(--neuro)" strokeWidth="2" strokeDasharray="6 4" />
        </g>
        <circle cx={X(a)} cy={Y(F.f(a))} r="5" fill="var(--neuro)" />
        <text x="38" y="16" fontSize="11" fill="var(--accent)">f(x) = {F.label}</text>
        <text x="38" y="32" fontSize="11" fill="var(--neuro)">Taylor polynomial of order {order} around a = {a.toFixed(2)}</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="expansion point a" value={a} min={-2.5} max={2.5} step={0.05} onChange={setA} fmt={(v) => v.toFixed(2)} />
        <Slider label="order (number of derivatives used)" value={order} min={0} max={8} step={1} onChange={setOrder} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="f(a)" value={F.f(a).toFixed(4)} />
        <Stat label="f′(a)" value={(d[1] ?? F.d(a, 1)[1]).toFixed(4)} />
        <Stat label="error at a + 0.5" value={err.toExponential(2)} />
      </div>
      <p className="text-sm text-ink-2">Order 1 is the tangent line, order 2 adds curvature, and each extra term uses one more derivative at a. Near a the approximation is excellent and improves rapidly with order; far from a it can go badly wrong. For the Gaussian, an expansion at the peak (a = 0) has no linear term, which is why a neuron at the peak of its tuning curve responds to small stimulus changes only at second order.</p>
    </div>
  );
}
