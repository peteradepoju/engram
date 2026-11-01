"use client";

import { useState } from "react";

const SHAPES: [number, number][] = [[3, 4], [3, 1], [1, 4], [1, 1], [4, 3], [2, 4]];

function bshape(a: [number, number], b: [number, number]): [number, number] | null {
  const out: number[] = [];
  for (let i = 0; i < 2; i++) {
    if (a[i] === b[i] || a[i] === 1 || b[i] === 1) out.push(Math.max(a[i], b[i]));
    else return null;
  }
  return out as [number, number];
}

function Grid({ shape, stretched, label, color }: { shape: [number, number]; stretched?: [number, number]; label: string; color: string }) {
  const [r, c] = stretched ?? shape;
  const s = 22;
  return (
    <div className="text-center">
      <svg width={c * s + 4} height={r * s + 4} role="img" aria-label={`${label}: shape ${shape.join(" by ")}`}>
        {Array.from({ length: r }).flatMap((_, i) => Array.from({ length: c }).map((_, j) => {
          const real = i < shape[0] && j < shape[1];
          return <rect key={`${i}-${j}`} x={2 + j * s} y={2 + i * s} width={s - 3} height={s - 3} rx="3" fill={color} opacity={real ? 0.9 : 0.28} strokeDasharray={real ? undefined : "3 2"} stroke={real ? "none" : color} />;
        }))}
      </svg>
      <div className="mt-1 font-mono text-xs text-ink-2">{label} ({shape.join(", ")})</div>
    </div>
  );
}

/** NumPy broadcasting: pale cells are copies NumPy pretends exist. */
export function Broadcasting() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(1);
  const A = SHAPES[a], B = SHAPES[b];
  const out = bshape(A, B);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {[["a", a, setA], ["b", b, setB]].map(([name, val, set]) => (
          <label key={name as string} className="text-sm">
            <span className="text-ink-2">Shape of {name as string}</span>
            <select className="input mt-1" value={val as number} onChange={(e) => (set as (v: number) => void)(Number(e.target.value))}>
              {SHAPES.map((s, i) => <option key={i} value={i}>({s.join(", ")})</option>)}
            </select>
          </label>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Grid shape={A} stretched={out ?? undefined} label="a" color="var(--neuro)" />
        <span className="text-2xl text-ink-3">+</span>
        <Grid shape={B} stretched={out ?? undefined} label="b" color="var(--ai)" />
        <span className="text-2xl text-ink-3">=</span>
        {out ? <Grid shape={out} label="a + b" color="var(--accent)" /> : <div className="rounded-lg bg-bad-soft px-3 py-2 font-mono text-sm text-bad">ValueError: shapes ({A.join(",")}) and ({B.join(",")}) cannot be broadcast</div>}
      </div>
      <p className="text-sm text-ink-2">Compare shapes from the right. Two sizes fit if they are equal or one of them is 1; a size of 1 is stretched to match. Nothing is copied in memory.</p>
    </div>
  );
}
