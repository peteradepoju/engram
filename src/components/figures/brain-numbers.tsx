"use client";

import { useState } from "react";
import { Stat } from "./util";

// Whole-brain mass and neuron number, from Herculano-Houzel and colleagues' isotropic fractionator studies.
const SPECIES = [
  { name: "mouse", mass: 0.4, neurons: 71e6, group: "rodent" },
  { name: "rat", mass: 1.8, neurons: 200e6, group: "rodent" },
  { name: "marmoset", mass: 7.8, neurons: 636e6, group: "primate" },
  { name: "macaque", mass: 87, neurons: 6.38e9, group: "primate" },
  { name: "human", mass: 1508, neurons: 86e9, group: "primate" },
  { name: "elephant", mass: 4618, neurons: 257e9, group: "other" },
];
const fmt = (n: number) => (n >= 1e9 ? `${(n / 1e9).toFixed(n >= 1e10 ? 0 : 1)} billion` : `${Math.round(n / 1e6)} million`);

/** Brain mass against number of neurons across species, on log scales. */
export function BrainNumbers() {
  const [sel, setSel] = useState("human");
  const s = SPECIES.find((x) => x.name === sel)!;
  const W = 360, H = 230, X = (m: number) => 40 + ((Math.log10(m) + 1) / 5) * (W - 60), Y = (n: number) => H - 30 - ((Math.log10(n) - 7.5) / 4) * (H - 50);
  const col = (g: string) => (g === "primate" ? "var(--neuro)" : g === "rodent" ? "var(--ai)" : "var(--warn)");
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Brain mass against number of neurons for six species">
        {[0, 1, 2, 3].map((e) => <g key={e}><line x1={X(10 ** e)} x2={X(10 ** e)} y1="12" y2={H - 30} stroke="var(--line)" /><text x={X(10 ** e)} y={H - 14} fontSize="9" textAnchor="middle" fill="var(--ink-3)">{10 ** e} g</text></g>)}
        {[8, 9, 10, 11].map((e) => <g key={e}><line x1="40" x2={W - 20} y1={Y(10 ** e)} y2={Y(10 ** e)} stroke="var(--line)" /><text x="36" y={Y(10 ** e) + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">1e{e}</text></g>)}
        {SPECIES.map((x) => (
          <g key={x.name} onClick={() => setSel(x.name)} style={{ cursor: "pointer" }}>
            <circle cx={X(x.mass)} cy={Y(x.neurons)} r={x.name === sel ? 8 : 6} fill={col(x.group)} stroke={x.name === sel ? "var(--ink)" : "none"} strokeWidth="2" />
            <text x={X(x.mass) + (x.name === "elephant" ? -10 : 10)} y={Y(x.neurons) + 4} fontSize="10" textAnchor={x.name === "elephant" ? "end" : "start"} fill="var(--ink-2)">{x.name}</text>
          </g>
        ))}
        <text x="44" y="22" fontSize="9" fill="var(--neuro)">primates</text>
        <text x="44" y="34" fontSize="9" fill="var(--ai)">rodents</text>
        <text x={W - 22} y={H - 2} fontSize="9" textAnchor="end" fill="var(--ink-3)">brain mass (log)</text>
      </svg>
      <div className="grid grid-cols-3 gap-2">
        <Stat label={`${s.name}: neurons`} value={fmt(s.neurons)} />
        <Stat label="brain mass" value={`${s.mass} g`} />
        <Stat label="neurons per mg" value={`${Math.round(s.neurons / s.mass / 1000)} thousand`} />
      </div>
      <p className="text-sm text-ink-2">Tap a species. Primate brains pack neurons at a roughly constant density, so neuron number grows in proportion to mass; rodent brains add neurons more slowly than mass, because their neurons get bigger as brains grow. A rodent with a human-sized brain would have far fewer neurons than we do. The elephant has three times our neurons, but most are in its cerebellum.</p>
    </div>
  );
}
