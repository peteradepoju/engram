"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

type P = { x: number; y: number; label: 1 | -1 };

function makeData(seed: number): P[] {
  const r = rng(seed);
  const pts: P[] = [];
  for (let i = 0; i < 40; i++) {
    const label = i % 2 === 0 ? 1 : -1;
    const cx = label === 1 ? 0.55 : -0.45, cy = label === 1 ? 0.4 : -0.35;
    pts.push({ x: cx + (r() - 0.5) * 1.1, y: cy + (r() - 0.5) * 1.1, label });
  }
  return pts;
}

/** A perceptron in 2D: set the weights by hand, or let the learning rule do it one mistake at a time. */
export function Perceptron() {
  const [seed, setSeed] = useState(7);
  const data = useMemo(() => makeData(seed), [seed]);
  const [w1, setW1] = useState(0.2);
  const [w2, setW2] = useState(-1);
  const [b, setB] = useState(0.3);
  const [steps, setSteps] = useState(0);
  const [last, setLast] = useState<number | null>(null);

  const out = (p: P) => (w1 * p.x + w2 * p.y + b >= 0 ? 1 : -1);
  const correct = data.filter((p) => out(p) === p.label).length;

  function learnStep() {
    const mistakes = data.map((p, i) => ({ p, i })).filter(({ p }) => out(p) !== p.label);
    if (!mistakes.length) return;
    const { p, i } = mistakes[steps % mistakes.length];
    const eta = 0.3;
    setW1((v) => +(v + eta * p.label * p.x).toFixed(3));
    setW2((v) => +(v + eta * p.label * p.y).toFixed(3));
    setB((v) => +(v + eta * p.label).toFixed(3));
    setSteps((s) => s + 1);
    setLast(i);
  }

  const S = 300, sx = (x: number) => S / 2 + x * (S / 3), sy = (y: number) => S / 2 - y * (S / 3);
  // Decision line: w1 x + w2 y + b = 0
  let line = null;
  if (Math.abs(w2) > 1e-6) {
    const y = (x: number) => -(w1 * x + b) / w2;
    line = <line x1={sx(-1.5)} y1={sy(y(-1.5))} x2={sx(1.5)} y2={sy(y(1.5))} stroke="var(--accent)" strokeWidth="2.5" />;
  } else if (Math.abs(w1) > 1e-6) {
    const x = -b / w1;
    line = <line x1={sx(x)} y1={0} x2={sx(x)} y2={S} stroke="var(--accent)" strokeWidth="2.5" />;
  }

  return (
    <div className="grid gap-5 md:grid-cols-[300px_1fr]">
      <svg viewBox={`0 0 ${S} ${S}`} className="w-full max-w-[300px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label={`Perceptron classifies ${correct} of ${data.length} points correctly`}>
        <defs><clipPath id="pc"><rect width={S} height={S} /></clipPath></defs>
        <g clipPath="url(#pc)">
          <line x1={0} x2={S} y1={S / 2} y2={S / 2} stroke="var(--line)" />
          <line y1={0} y2={S} x1={S / 2} x2={S / 2} stroke="var(--line)" />
          {line}
          {data.map((p, i) => {
            const ok = out(p) === p.label;
            return p.label === 1 ? (
              <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={i === last ? 7 : 5} fill="var(--neuro)" stroke={ok ? "none" : "var(--ink)"} strokeWidth="2" />
            ) : (
              <rect key={i} x={sx(p.x) - 5} y={sy(p.y) - 5} width={i === last ? 12 : 10} height={i === last ? 12 : 10} fill="var(--ai)" stroke={ok ? "none" : "var(--ink)"} strokeWidth="2" />
            );
          })}
        </g>
      </svg>
      <div className="space-y-3">
        <Slider label="Weight w₁ (input x₁)" value={w1} min={-3} max={3} step={0.05} onChange={setW1} fmt={(v) => v.toFixed(2)} />
        <Slider label="Weight w₂ (input x₂)" value={w2} min={-3} max={3} step={0.05} onChange={setW2} fmt={(v) => v.toFixed(2)} />
        <Slider label="Bias b" value={b} min={-3} max={3} step={0.05} onChange={setB} fmt={(v) => v.toFixed(2)} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Correct" value={`${correct} / ${data.length}`} />
          <Stat label="Learning steps" value={String(steps)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={learnStep} disabled={correct === data.length}>{correct === data.length ? "All correct" : "Learn from one mistake"}</button>
          <button className="btn" onClick={() => { setW1(0.2); setW2(-1); setB(0.3); setSteps(0); setLast(null); }}>Reset weights</button>
          <button className="btn" onClick={() => { setSeed((s) => s + 1); setSteps(0); setLast(null); }}>New data</button>
        </div>
        <p className="text-sm text-ink-2">Circles are class +1, squares are class −1. Outlined points are misclassified. Each learning step picks a mistake and nudges the weights: w ← w + η·y·x.</p>
      </div>
    </div>
  );
}
