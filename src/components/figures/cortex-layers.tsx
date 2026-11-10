"use client";

import { useState } from "react";

const LAYERS = [
  { id: "1", top: 0, h: 0.08, name: "Layer 1", text: "Few cell bodies; mostly dendrites of deeper pyramidal cells and axons, including feedback from higher areas and the thalamus." },
  { id: "2/3", top: 0.08, h: 0.28, name: "Layers 2/3", text: "Pyramidal cells that project to other cortical areas (feedforward), and dense local recurrent connections." },
  { id: "4", top: 0.36, h: 0.14, name: "Layer 4", text: "Main target of sensory input from the thalamus in primary sensory areas; spiny stellate cells pass it upwards to layers 2/3." },
  { id: "5", top: 0.5, h: 0.24, name: "Layer 5", text: "Large pyramidal cells whose axons leave the cortex: to the brainstem, spinal cord, striatum and thalamus. The main output layer." },
  { id: "6", top: 0.74, h: 0.26, name: "Layer 6", text: "Pyramidal cells that project back to the thalamus, shaping the input they receive." },
];

/** The six layers of neocortex and the main paths of a simplified canonical circuit. Tap a layer. */
export function CortexLayers() {
  const [sel, setSel] = useState("4");
  const L = LAYERS.find((l) => l.id === sel)!;
  const W = 360, H = 250, top = 14, depth = H - 28, x0 = 90, x1 = 230;
  const yMid = (id: string) => { const l = LAYERS.find((q) => q.id === id)!; return top + (l.top + l.h / 2) * depth; };
  const arrow = (xa: number, ya: number, xb: number, yb: number, c: string, k: string) => (
    <g key={k}><defs><marker id={`cl-${k}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={c} /></marker></defs>
      <path d={`M${xa},${ya} C${(xa + xb) / 2 + 30},${ya} ${(xa + xb) / 2 + 30},${yb} ${xb},${yb}`} fill="none" stroke={c} strokeWidth="2" markerEnd={`url(#cl-${k})`} /></g>);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="The six layers of neocortex with the main input and output paths">
        {LAYERS.map((l) => (
          <g key={l.id} onClick={() => setSel(l.id)} style={{ cursor: "pointer" }}>
            <rect x={x0} y={top + l.top * depth} width={x1 - x0} height={l.h * depth} fill={l.id === sel ? "var(--accent)" : "var(--surface)"} opacity={l.id === sel ? 0.35 : 1} stroke="var(--line)" />
            <text x={x0 + 8} y={top + (l.top + l.h / 2) * depth + 4} fontSize="11" fill="var(--ink)">{l.name}</text>
          </g>
        ))}
        <text x="10" y={H - 4} fontSize="9" fill="var(--ink-3)">white matter</text>
        <text x="10" y="24" fontSize="9" fill="var(--ink-3)">pia</text>
        <line x1="20" x2="80" y1={yMid("4")} y2={yMid("4")} stroke="var(--neuro)" strokeWidth="2" />
        <text x="12" y={yMid("4") - 6} fontSize="9" fill="var(--neuro)">thalamus</text>
        {arrow(200, yMid("4"), 205, yMid("2/3"), "var(--neuro)", "a")}
        {arrow(205, yMid("2/3"), 205, yMid("5"), "var(--neuro)", "b")}
        <line x1={x1} x2={W - 10} y1={yMid("2/3")} y2={yMid("2/3")} stroke="var(--ai)" strokeWidth="2" />
        <text x={W - 12} y={yMid("2/3") - 6} fontSize="9" textAnchor="end" fill="var(--ai)">to other areas</text>
        <line x1={x1} x2={W - 10} y1={yMid("5")} y2={yMid("5")} stroke="var(--warn)" strokeWidth="2" />
        <text x={W - 12} y={yMid("5") - 6} fontSize="9" textAnchor="end" fill="var(--warn)">out of cortex</text>
        <line x1={x1} x2={W - 10} y1={yMid("6")} y2={yMid("6")} stroke="var(--good)" strokeWidth="2" />
        <text x={W - 12} y={yMid("6") - 6} fontSize="9" textAnchor="end" fill="var(--good)">back to thalamus</text>
      </svg>
      <div className="rounded-lg bg-surface-2 p-3 text-sm"><span className="font-semibold">{L.name}.</span> <span className="text-ink-2">{L.text}</span></div>
      <p className="text-sm text-ink-2">Neocortex is a sheet about 2 to 4 mm thick, organised in six layers that differ in their cells, inputs and outputs. In a simplified canonical circuit, sensory input from the thalamus arrives in layer 4, passes up to layers 2/3, which send it to other areas and down to layer 5, which sends it out of the cortex. Real circuits have many more paths, and areas differ: motor cortex, for instance, has almost no layer 4.</p>
    </div>
  );
}
