"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

const NX = 40, NT = 30, FX = 1, FT = 8, SX = 0.5, ST = 0.05;

/** A drifting grating drawn in space-time, and the motion energy of rightward and leftward units (fx = 1 c/deg, ft = 8 Hz). */
export function MotionEnergy() {
  const [v, setV] = useState(8);
  const { img, right, left } = useMemo(() => {
    const xs = Array.from({ length: NX }, (_, i) => -2 + (4 * i) / (NX - 1)), ts = Array.from({ length: NT }, (_, i) => -0.15 + (0.3 * i) / (NT - 1));
    const img = ts.map((t) => xs.map((x) => Math.cos(2 * Math.PI * FX * (x - v * t))));
    const energy = (dir: number) => {
      let e = 0, o = 0;
      ts.forEach((t, i) => xs.forEach((x, j) => {
        const env = Math.exp(-(x * x) / (2 * SX * SX) - (t * t) / (2 * ST * ST)), arg = 2 * Math.PI * (FX * x - dir * FT * t);
        e += env * Math.cos(arg) * img[i][j]; o += env * Math.sin(arg) * img[i][j];
      }));
      return e * e + o * o;
    };
    return { img, right: energy(1), left: energy(-1) };
  }, [v]);
  const max = Math.max(right, left, 1), cw = 170 / NX, ch = 150 / NT;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 185" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Space-time plot of a drifting grating and motion energy">
        <text x="10" y="12" fontSize="9" fill="var(--ink-3)">space (across) by time (down)</text>
        {img.map((row, i) => row.map((val, j) => <rect key={`${i}-${j}`} x={10 + j * cw} y={20 + i * ch} width={cw + 0.3} height={ch + 0.3} fill={`rgba(80,90,110,${(val + 1) / 2})`} />))}
        <text x="200" y="12" fontSize="9" fill="var(--ink-3)">motion energy</text>
        {[["rightward", right, "var(--ai)"], ["leftward", left, "var(--neuro)"]].map(([label, e, col], k) => (
          <g key={label as string}>
            <text x="200" y={40 + k * 60} fontSize="10" fill="var(--ink-2)">{label as string}</text>
            <rect x="200" y={46 + k * 60} width={Math.max(2, ((e as number) / max) * 150)} height="16" rx="2" fill={col as string} />
          </g>
        ))}
      </svg>
      <Slider label="grating velocity (negative = leftward)" value={v} min={-24} max={24} step={1} onChange={setV} unit="deg/s" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="opponent energy (right minus left)" value={((right - left) / max).toFixed(2)} />
        <Stat label="units prefer" value="+8 deg/s" />
      </div>
      <p className="text-sm text-ink-2">At zero velocity the stripes are vertical in space-time and neither unit responds much. Rightward motion tilts the stripes one way and drives the rightward unit, most strongly near its preferred 8 degrees per second; leftward motion tilts them the other way. Very fast motion makes the stripes nearly horizontal, too fast for both units, and the energy falls again.</p>
    </div>
  );
}
