"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

/** The logistic map x → r x (1 − x): a cobweb for the chosen r and the bifurcation diagram for all r. */
export function LogisticMap() {
  const [r, setR] = useState(3.2);
  const W = 360, H = 200, half = 170;
  const diagram = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 160; i++) {
      const rr = 2.8 + (i / 160) * 1.2; let x = 0.5;
      for (let k = 0; k < 300; k++) x = rr * x * (1 - x);
      for (let k = 0; k < 60; k++) { x = rr * x * (1 - x); pts.push(`${half + 10 + (i / 160) * (W - half - 20)},${H - 16 - x * (H - 30)}`); }
    }
    return pts;
  }, []);
  const cob: string[] = []; let x = 0.1;
  const CX = (v: number) => 10 + v * (half - 20), CY = (v: number) => H - 16 - v * (H - 30);
  cob.push(`${CX(x)},${CY(0)}`);
  for (let k = 0; k < 80; k++) { const y = r * x * (1 - x); cob.push(`${CX(x)},${CY(y)}`, `${CX(y)},${CY(y)}`); x = y; }
  let z = 0.5; for (let k = 0; k < 1000; k++) z = r * z * (1 - z);
  const orbit: number[] = []; for (let k = 0; k < 64; k++) { z = r * z * (1 - z); orbit.push(z); }
  let lyap = 0; let q = 0.3; for (let k = 0; k < 2000; k++) { q = r * q * (1 - q); if (k >= 200) lyap += Math.log(Math.abs(r * (1 - 2 * q)) + 1e-12); }
  lyap /= 1800;
  const distinct = new Set(orbit.map((v) => v.toFixed(4))).size;
  const rX = half + 10 + ((r - 2.8) / 1.2) * (W - half - 20);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Cobweb plot and bifurcation diagram of the logistic map">
        <rect x="10" y="14" width={half - 20} height={H - 30} fill="none" stroke="var(--line)" />
        <line x1={CX(0)} y1={CY(0)} x2={CX(1)} y2={CY(1)} stroke="var(--ink-3)" strokeDasharray="3 3" />
        <polyline points={Array.from({ length: 51 }, (_, i) => `${CX(i / 50)},${CY(r * (i / 50) * (1 - i / 50))}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <polyline points={cob.join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1" />
        {diagram.map((p, i) => { const [a, b] = p.split(","); return <rect key={i} x={a} y={b} width="0.9" height="0.9" fill="var(--ink-2)" />; })}
        <line x1={rX} x2={rX} y1="14" y2={H - 16} stroke="var(--warn)" />
        <text x="14" y="10" fontSize="9" fill="var(--ink-3)">cobweb</text>
        <text x={half + 10} y="10" fontSize="9" fill="var(--ink-3)">long-run values for r from 2.8 to 4</text>
      </svg>
      <Slider label="growth parameter r" value={r} min={2.8} max={4} step={0.001} onChange={setR} fmt={(v) => v.toFixed(3)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="distinct long-run values" value={distinct > 32 ? "many (chaos?)" : `${distinct}`} />
        <Stat label="Lyapunov exponent" value={lyap.toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Each step multiplies x by r and by the room left to grow, 1 − x. The cobweb follows one orbit: up to the curve, across to the diagonal, repeat. For r below 3 it settles on one value; then the value splits into 2, 4, 8 in ever faster period-doublings, and from about 3.57 the orbit never repeats. A positive Lyapunov exponent means nearby orbits separate exponentially: chaos, from one line of arithmetic.</p>
    </div>
  );
}
