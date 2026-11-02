"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** A small nudge to the input travels through each stage, multiplied by each stage's derivative. */
export function ChainNudge() {
  const [x, setX] = useState(0.5);
  const [w, setW] = useState(2);
  const dx = 0.15;
  const u = w * x - 1, r = 1 / (1 + Math.exp(-u));
  const du = w * dx, sp = r * (1 - r), dr = sp * du;
  const W = 540, H = 230;
  const rows = [
    { label: "input x (stimulus)", val: x, d: dx, lo: -2, hi: 2, y: 45, colour: "var(--neuro)" },
    { label: "drive u = w x − 1", val: u, d: du, lo: -5, hi: 5, y: 115, colour: "var(--ai)" },
    { label: "rate r = σ(u)", val: r, d: dr, lo: 0, hi: 1, y: 185, colour: "var(--accent)" },
  ];
  const X = (v: number, lo: number, hi: number) => 40 + ((v - lo) / (hi - lo)) * (W - 80);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="A nudge propagating through a chain of functions">
        {rows.map((row) => (
          <g key={row.label}>
            <text x="40" y={row.y - 16} fontSize="11" fill="var(--ink-3)">{row.label}</text>
            <line x1="40" x2={W - 40} y1={row.y} y2={row.y} stroke="var(--line)" strokeWidth="2" />
            {[row.lo, (row.lo + row.hi) / 2, row.hi].map((v) => <text key={v} x={X(v, row.lo, row.hi)} y={row.y + 16} fontSize="9" textAnchor="middle" fill="var(--ink-3)">{v}</text>)}
            <rect x={X(row.val, row.lo, row.hi)} y={row.y - 6} width={Math.max(1, X(row.val + row.d, row.lo, row.hi) - X(row.val, row.lo, row.hi))} height="12" fill={row.colour} opacity="0.6" />
            <circle cx={X(row.val, row.lo, row.hi)} cy={row.y} r="5" fill={row.colour} />
          </g>
        ))}
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="input x" value={x} min={-1.8} max={1.6} step={0.05} onChange={setX} fmt={(v) => v.toFixed(2)} />
        <Slider label="weight w" value={w} min={0.2} max={3} step={0.05} onChange={setW} fmt={(v) => v.toFixed(2)} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="du/dx = w" value={w.toFixed(2)} />
        <Stat label="dr/du = σ′(u)" value={sp.toFixed(3)} />
        <Stat label="dr/dx = product" value={(w * sp).toFixed(3)} />
        <Stat label="nudge in r / nudge in x" value={(dr / dx).toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">The shaded bars show a small nudge of 0.15 in the input and what it becomes at each stage. The first stage multiplies it by w, the second by the slope of the sigmoid at u. The overall sensitivity dr/dx is the product of the two: the chain rule. Push x until u is far from zero and the sigmoid's slope, and so the whole product, collapses.</p>
    </div>
  );
}
