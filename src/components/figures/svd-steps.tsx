"use client";

import { useState } from "react";
import { Arrow } from "./drag";
import { svd } from "./linalg";
import { Slider, Stat } from "./util";

const STAGES = ["start", "rotate by Vᵀ", "stretch by Σ", "rotate by U"] as const;

/** Every matrix is a rotation, a stretch along the axes, then another rotation: A = U Σ Vᵀ. */
export function SvdSteps() {
  const [m, setM] = useState<[number, number, number, number]>([1.2, 0.9, -0.3, 0.8]);
  const [stage, setStage] = useState(3);
  const [a, b, c, d] = m;
  const set = (i: number) => (v: number) => setM((old) => old.map((q, k) => (k === i ? v : q)) as [number, number, number, number]);
  const { s, U, V } = svd([[a, b], [c, d]]);
  const map = (p: number[]) => {
    let q = p;
    if (stage >= 1) q = [V[0][0] * q[0] + V[0][1] * q[1], V[1][0] * q[0] + V[1][1] * q[1]];   // Vᵀ p
    if (stage >= 2) q = [s[0] * q[0], s[1] * q[1]];
    if (stage >= 3) q = [U[0][0] * q[0] + U[1][0] * q[1], U[0][1] * q[0] + U[1][1] * q[1]];   // U q
    return q;
  };
  const W = 320, C = W / 2, K = 60;
  const P = (p: number[]) => [C + p[0] * K, C - p[1] * K];
  const circle = Array.from({ length: 73 }, (_, i) => P(map([Math.cos(i * Math.PI / 36), Math.sin(i * Math.PI / 36)])).join(",")).join(" ");
  const v1 = P(map(V[0])), v2 = P(map(V[1]));
  const mark = P(map([Math.cos(0.4), Math.sin(0.4)]));
  const fmt = (v: number) => v.toFixed(2);
  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <svg viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[320px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="The unit circle transformed step by step by the SVD">
        <defs><clipPath id="svc"><rect width={W} height={W} /></clipPath></defs>
        <g clipPath="url(#svc)">
          {Array.from({ length: 9 }, (_, i) => i - 4).map((i) => <g key={i}><line x1={C + i * K} x2={C + i * K} y1="0" y2={W} stroke="var(--line)" /><line y1={C + i * K} y2={C + i * K} x1="0" x2={W} stroke="var(--line)" /></g>)}
          <polygon points={circle} fill="var(--accent)" opacity="0.12" stroke="var(--accent)" strokeWidth="2" />
          <Arrow id="sv1" x1={C} y1={C} x2={v1[0]} y2={v1[1]} color="var(--neuro)" width={3} />
          <Arrow id="sv2" x1={C} y1={C} x2={v2[0]} y2={v2[1]} color="var(--ai)" width={3} />
          <circle cx={mark[0]} cy={mark[1]} r="5" fill="var(--warn)" />
        </g>
      </svg>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {STAGES.map((name, i) => <button key={name} className={`btn !py-1.5 ${stage === i ? "btn-primary" : ""}`} onClick={() => setStage(i)}>{i}. {name}</button>)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Slider label="a" value={a} min={-2} max={2} step={0.1} onChange={set(0)} fmt={(v) => v.toFixed(1)} />
          <Slider label="b" value={b} min={-2} max={2} step={0.1} onChange={set(1)} fmt={(v) => v.toFixed(1)} />
          <Slider label="c" value={c} min={-2} max={2} step={0.1} onChange={set(2)} fmt={(v) => v.toFixed(1)} />
          <Slider label="d" value={d} min={-2} max={2} step={0.1} onChange={set(3)} fmt={(v) => v.toFixed(1)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="singular values σ₁, σ₂" value={`${fmt(s[0])}, ${fmt(s[1])}`} />
          <Stat label="σ₁ σ₂ = |det A|" value={`${fmt(s[0] * s[1])} = ${fmt(Math.abs(a * d - b * c))}`} />
        </div>
        <p className="text-sm text-ink-2">Step through the stages. The pink and blue arrows start as the right singular vectors v₁ and v₂. Vᵀ turns them onto the axes, Σ stretches the axes by σ₁ and σ₂, and U turns the result into place. After the last step the circle has become exactly the ellipse that A makes, with half-axes σ₁u₁ and σ₂u₂. (If det A is negative, one of the rotations includes a reflection; watch the orange dot.)</p>
      </div>
    </div>
  );
}
