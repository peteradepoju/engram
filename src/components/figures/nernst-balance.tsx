"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

const IONS = [
  { name: "K⁺", z: 1, out: 5, inn: 140, c: "var(--ai)" },
  { name: "Na⁺", z: 1, out: 145, inn: 12, c: "var(--neuro)" },
  { name: "Cl⁻", z: -1, out: 110, inn: 7, c: "var(--good)" },
  { name: "Ca²⁺", z: 2, out: 2, inn: 0.0001, c: "var(--warn)" },
];

/** Two compartments separated by a membrane permeable to one ion: diffusion pushes the ion down its gradient, the voltage pulls it back, and the Nernst potential is where they balance. */
export function NernstBalance() {
  const [k, setK] = useState(0);
  const ion = IONS[k];
  const [lo, setLo] = useState(Math.log10(ion.out));
  const [li, setLi] = useState(Math.log10(ion.inn));
  const pick = (i: number) => { setK(i); setLo(Math.log10(IONS[i].out)); setLi(Math.log10(IONS[i].inn)); };
  const cout = 10 ** lo, cin = 10 ** li;
  const E = (26.73 / ion.z) * Math.log(cout / cin);
  const W = 360, H = 190;
  const dots = useMemo(() => {
    const r = rng(29 + k);
    return Array.from({ length: 160 }, () => ({ x: r(), y: r(), u: r() }));
  }, [k]);
  // density of dots drawn on each side: proportional to log concentration, so very different values stay visible
  const span = Math.max(lo, li) - Math.min(lo, li) + 1e-9;
  const frac = (l: number) => 0.15 + 0.85 * (l - Math.min(lo, li)) / span;
  const nOut = Math.round(80 * frac(lo)), nIn = Math.round(80 * frac(li));
  const diffusionOut = cin > cout; // diffusion carries the ion out of the cell
  const sign = (ion.z > 0 ? 1 : -1);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {IONS.map((x, i) => (
          <button key={x.name} onClick={() => pick(i)} className={`btn !py-1.5 ${i === k ? "btn-primary" : ""}`}>{x.name}</button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Ions on either side of a selective membrane, with arrows for diffusion and electrical drift">
        <text x="88" y="16" fontSize="10" textAnchor="middle" fill="var(--ink)">inside: {E > 0 ? "+" : ""}{E.toFixed(0)} mV</text>
        <text x="272" y="16" fontSize="10" textAnchor="middle" fill="var(--ink)">outside: 0 mV</text>
        <rect x="174" y="24" width="12" height={H - 60} fill="var(--ink-3)" opacity="0.35" />
        {dots.slice(0, nIn).map((d, i) => <circle key={`i${i}`} cx={14 + d.x * 150} cy={28 + d.y * (H - 70)} r="2.4" fill={ion.c} />)}
        {dots.slice(80, 80 + nOut).map((d, i) => <circle key={`o${i}`} cx={196 + d.x * 150} cy={28 + d.y * (H - 70)} r="2.4" fill={ion.c} />)}
        <g>
          <line x1={diffusionOut ? 140 : 220} x2={diffusionOut ? 220 : 140} y1={H - 26} y2={H - 26} stroke="var(--ink-2)" strokeWidth="2" markerEnd="url(#arrN)" />
          <text x="180" y={H - 31} fontSize="9" textAnchor="middle" fill="var(--ink-2)">diffusion</text>
          {Math.abs(E) > 0.5 && (
            <>
              <line x1={(E * sign > 0) ? 140 : 220} x2={(E * sign > 0) ? 220 : 140} y1={H - 10} y2={H - 10} stroke="var(--warn)" strokeWidth="2" markerEnd="url(#arrW)" />
              <text x="180" y={H - 14} fontSize="9" textAnchor="middle" fill="var(--warn)">electrical drift</text>
            </>
          )}
        </g>
        <defs>
          <marker id="arrN" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink-2)" /></marker>
          <marker id="arrW" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker>
        </defs>
      </svg>
      <Slider label="concentration inside" value={li} min={-4} max={2.7} step={0.05} onChange={setLi} fmt={(v) => (10 ** v < 1 ? (10 ** v).toPrecision(2) : (10 ** v).toFixed(0))} unit="mM" />
      <Slider label="concentration outside" value={lo} min={-1} max={2.7} step={0.05} onChange={setLo} fmt={(v) => (10 ** v < 1 ? (10 ** v).toPrecision(2) : (10 ** v).toFixed(0))} unit="mM" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label={`Nernst potential of ${ion.name}`} value={`${E > 0 ? "+" : ""}${E.toFixed(1)} mV`} />
        <Stat label="ratio outside / inside" value={cout / cin >= 100 ? (cout / cin).toExponential(1) : (cout / cin).toPrecision(2)} />
      </div>
      <p className="text-sm text-ink-2">At 37 °C. Dot density shows concentration on a log scale. Diffusion always carries the ion from the side where it is concentrated; the membrane charges until the voltage pushes back equally hard. Equal concentrations give 0 mV. A divalent ion such as calcium needs only half the voltage for the same gradient, and a negative ion such as chloride reverses the sign.</p>
    </div>
  );
}
