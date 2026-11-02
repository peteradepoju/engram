"use client";

import { useState } from "react";
import { Arrow, useSvgDrag } from "./drag";
import { Slider, Stat } from "./util";

/** Two neurons' firing rates as a vector. Drag the tips of a and b; scale b with the slider. */
export function VectorPlayground() {
  const [a, setA] = useState({ x: 12, y: 4 });
  const [b, setB] = useState({ x: 3, y: 10 });
  const [k, setK] = useState(1);
  const S = 15, O = 30, W = 330; // 0..20 Hz on each axis
  const px = (v: number) => O + v * S, py = (v: number) => W - O - v * S;
  const inv = (x: number, y: number) => ({ x: Math.round(Math.min(20, Math.max(-1, (x - O) / S)) * 2) / 2, y: Math.round(Math.min(20, Math.max(-1, (W - O - y) / S)) * 2) / 2 });
  const drag = useSvgDrag((key, x, y) => (key === "a" ? setA(inv(x, y)) : setB(inv(x, y))));
  const kb = { x: k * b.x, y: k * b.y };
  const sum = { x: a.x + kb.x, y: a.y + kb.y };
  const norm = (v: { x: number; y: number }) => Math.hypot(v.x, v.y);
  return (
    <div className="grid gap-4 md:grid-cols-[330px_1fr]">
      <svg ref={drag.ref} {...drag.svgProps} viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[330px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="Firing-rate vectors in the plane of two neurons">
        {Array.from({ length: 5 }, (_, i) => i * 5).map((v) => (
          <g key={v}>
            <line x1={px(v)} x2={px(v)} y1={py(0)} y2={py(20)} stroke="var(--line)" />
            <line y1={py(v)} y2={py(v)} x1={px(0)} x2={px(20)} stroke="var(--line)" />
            <text x={px(v)} y={py(0) + 14} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{v}</text>
            <text x={px(0) - 6} y={py(v) + 3} fontSize="10" textAnchor="end" fill="var(--ink-3)">{v}</text>
          </g>
        ))}
        <text x={px(10)} y={W - 2} fontSize="11" textAnchor="middle" fill="var(--ink-2)">neuron 1 rate (Hz)</text>
        <text x="10" y={py(10)} fontSize="11" textAnchor="middle" fill="var(--ink-2)" transform={`rotate(-90 10 ${py(10)})`}>neuron 2 rate (Hz)</text>
        <line x1={px(a.x)} y1={py(a.y)} x2={px(sum.x)} y2={py(sum.y)} stroke="var(--ai)" strokeDasharray="4 3" opacity="0.6" />
        <line x1={px(kb.x)} y1={py(kb.y)} x2={px(sum.x)} y2={py(sum.y)} stroke="var(--neuro)" strokeDasharray="4 3" opacity="0.6" />
        <Arrow id="vs" x1={px(0)} y1={py(0)} x2={px(sum.x)} y2={py(sum.y)} color="var(--accent)" width={3} />
        <Arrow id="va" x1={px(0)} y1={py(0)} x2={px(a.x)} y2={py(a.y)} color="var(--neuro)" />
        <Arrow id="vb" x1={px(0)} y1={py(0)} x2={px(kb.x)} y2={py(kb.y)} color="var(--ai)" />
        <circle cx={px(a.x)} cy={py(a.y)} r="9" fill="var(--neuro)" opacity="0.35" {...drag.handle("a")} />
        <circle cx={px(b.x)} cy={py(b.y)} r="9" fill="var(--ai)" opacity="0.35" {...drag.handle("b")} />
        <text x={px(a.x) + 10} y={py(a.y) - 8} fontSize="12" fill="var(--neuro)" fontWeight="700">a</text>
        <text x={px(kb.x) + 10} y={py(kb.y) - 8} fontSize="12" fill="var(--ai)" fontWeight="700">{k === 1 ? "b" : `${k}b`}</text>
        {sum.x <= 20 && sum.y <= 20 ? <text x={px(sum.x) + 8} y={py(sum.y) - 8} fontSize="12" fill="var(--accent)" fontWeight="700">a + {k === 1 ? "" : k}b</text> : null}
      </svg>
      <div className="space-y-3">
        <p className="text-sm text-ink-2">Each axis is one neuron's firing rate, so each point is a population state. Drag the tips of <strong>a</strong> (pink) and <strong>b</strong> (blue).</p>
        <Slider label="Scale b by k" value={k} min={-1} max={2} step={0.25} onChange={setK} fmt={(v) => v.toFixed(2)} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="a" value={`(${a.x}, ${a.y})`} />
          <Stat label={k === 1 ? "b" : `${k}b`} value={`(${kb.x.toFixed(1)}, ${kb.y.toFixed(1)})`} />
          <Stat label={k === 1 ? "a + b" : `a + ${k}b`} value={`(${sum.x.toFixed(1)}, ${sum.y.toFixed(1)})`} />
          <Stat label="‖a‖ (length)" value={norm(a).toFixed(2)} />
        </div>
        <p className="text-sm text-ink-2">Adding vectors adds rates neuron by neuron; scaling multiplies every neuron&apos;s rate by the same number. Negative k flips the direction, which only makes sense for changes in rate, not rates themselves.</p>
      </div>
    </div>
  );
}
