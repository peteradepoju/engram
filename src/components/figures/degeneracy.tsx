"use client";

import { useMemo, useState } from "react";
import { HH, hhRates, infTau } from "./hh";
import { rng, Slider, Stat } from "./util";

function firingRate(gNa: number, gK: number, gL: number) {
  const dt = 0.02, I = 10;
  let V = -65, n = infTau(-65, "n").inf, m = infTau(-65, "m").inf, h = infTau(-65, "h").inf;
  let first = -1, last = -1, count = 0;
  for (let k = 0; k * dt < 110; k++) {
    const r = hhRates(V);
    const dV = I - gNa * m ** 3 * h * (V - HH.ENa) - gK * n ** 4 * (V - HH.EK) - gL * (V - HH.EL);
    n += dt * (r.an * (1 - n) - r.bn * n); m += dt * (r.am * (1 - m) - r.bm * m); h += dt * (r.ah * (1 - h) - r.bh * h);
    const Vn = V + dt * dV;
    if (k * dt >= 30 && Vn > 0 && V <= 0) { if (first < 0) first = k * dt; last = k * dt; count++; }
    V = Vn;
    if (!isFinite(V)) return 0;
  }
  return count >= 2 ? (1000 * (count - 1)) / (last - first) : 0;
}

/** Random Hodgkin-Huxley models in the gNa-gK plane, highlighted when their firing rate at 10 μA/cm² is within a tolerance of a target. */
export function Degeneracy() {
  const [target, setTarget] = useState(68);
  const [tol, setTol] = useState(3);
  const models = useMemo(() => {
    const r = rng(2004);
    return Array.from({ length: 220 }, () => {
      const gNa = 60 + 180 * r(), gK = 18 + 54 * r(), gL = 0.15 + 0.45 * r();
      return { gNa, gK, gL, f: firingRate(gNa, gK, gL) };
    });
  }, []);
  const good = models.filter((m) => m.f > 0 && Math.abs(m.f - target) <= tol);
  const W = 360, H = 230, x0 = 38, x1 = 350, y0 = 12, y1 = 200;
  const X = (g: number) => x0 + ((g - 60) / 180) * (x1 - x0);
  const Y = (g: number) => y1 - ((g - 18) / 54) * (y1 - y0);
  const range = (k: "gNa" | "gK") => good.length ? `${Math.min(...good.map((m) => m[k])).toFixed(0)} to ${Math.max(...good.map((m) => m[k])).toFixed(0)}` : "none";
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Random models in the plane of sodium and potassium conductance, with good models highlighted">
        {[60, 120, 180, 240].map((g) => <text key={g} x={X(g)} y={H - 16} fontSize="9" textAnchor="middle" fill="var(--ink-3)">{g}</text>)}
        {[18, 36, 54, 72].map((g) => <text key={g} x={x0 - 4} y={Y(g) + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">{g}</text>)}
        <text x={x1} y={H - 4} fontSize="9" textAnchor="end" fill="var(--ink-3)">gNa (mS/cm²)</text>
        <text x={x0 + 2} y={y0 + 2} fontSize="9" fill="var(--ink-3)">gK</text>
        {models.map((m, i) => {
          const ok = m.f > 0 && Math.abs(m.f - target) <= tol;
          return <circle key={i} cx={X(m.gNa)} cy={Y(m.gK)} r={ok ? 4 : 2.5} fill={m.f === 0 ? "var(--line)" : ok ? "var(--neuro)" : "var(--ink-3)"} opacity={ok ? 1 : 0.6} />;
        })}
        <text x={X(120)} y={Y(36) + 4} fontSize="14" textAnchor="middle" fill="var(--ink)">★</text>
      </svg>
      <Slider label="target firing rate" value={target} min={55} max={95} step={1} onChange={setTarget} unit="Hz" />
      <Slider label="tolerance" value={tol} min={1} max={10} step={0.5} onChange={setTol} unit="Hz" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="good models" value={`${good.length} of ${models.length}`} />
        <Stat label="their gNa" value={range("gNa")} />
        <Stat label="their gK" value={range("gK")} />
      </div>
      <p className="text-sm text-ink-2">Each dot is a version of the HH model with random sodium, potassium and leak conductances; pale dots are silent at this input. The star is the original, which fires at about 68 Hz. Models that match a target rate spread across a wide range of each conductance but line up along a diagonal band: what matters is mostly the balance between sodium and potassium.</p>
    </div>
  );
}
