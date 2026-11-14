"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider } from "./util";
import { chol } from "./gp-lib";

const XS = Array.from({ length: 90 }, (_, i): number => -3 + (6 * i) / 89);
const NAMES = ["squared exponential", "Matérn 1/2 (rough)", "periodic", "linear"];
const COLS = ["var(--neuro)", "var(--ai)", "var(--warn)"];

/** Sample functions from Gaussian-process priors with different kernels and length-scales. */
export function KernelPrior() {
  const [kind, setKind] = useState(0);
  const [ell, setEll] = useState(1);
  const fs = useMemo(() => {
    const k = (a: number, b: number): number => {
      const d = Math.abs(a - b);
      if (kind === 0) return Math.exp(-0.5 * (d / ell) ** 2);
      if (kind === 1) return Math.exp(-d / ell);
      if (kind === 2) return Math.exp(-2 * Math.sin((Math.PI * d) / 2) ** 2 / ell ** 2);
      return (a * b) / 4 + 0.05;
    };
    const L = chol(XS.map((a, i) => XS.map((b, j) => k(a, b) + (i === j ? 1e-6 : 0))));
    const r = rng(642);
    return [0, 1, 2].map(() => { const e = XS.map(() => gauss(r)); return L.map((row) => row.reduce((s, v, j) => s + v * e[j], 0)); });
  }, [kind, ell]);
  const sx = (x: number): number => 20 + ((x + 3) / 6) * 300, sy = (y: number): number => 80 - y * 25;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 160" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Samples from a Gaussian process prior">
        <line x1="20" x2="320" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        {fs.map((f, k) => <polyline key={k} points={f.map((y, i) => `${sx(XS[i])},${Math.max(3, Math.min(157, sy(y)))}`).join(" ")} fill="none" stroke={COLS[k]} strokeWidth="1.6" />)}
      </svg>
      <Slider label="kernel" value={kind} min={0} max={3} step={1} onChange={setKind} fmt={(v) => NAMES[v]} />
      <Slider label="length-scale" value={ell} min={0.1} max={3} step={0.05} onChange={setEll} fmt={(v) => v.toFixed(2)} />
      <p className="text-sm text-ink-2">A kernel is a prior over functions. The squared exponential gives smooth functions that vary on the scale of the length-scale; the Matérn 1/2 kernel gives rough, Brownian-like ones; the periodic kernel repeats exactly (period 2); the linear kernel gives straight lines. Choosing a kernel is choosing what kinds of tuning curve or time course you believe in before seeing data.</p>
    </div>
  );
}
