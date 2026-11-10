"use client";

import { useMemo, useState } from "react";
import { HH, hhRates, infTau } from "./hh";
import { Slider, Stat } from "./util";

const A = 0.871, B = -1.075; // h ≈ A + B n, fitted during repetitive firing

function dVdt(V: number, n: number, I: number) {
  const r = hhRates(V), m = r.am / (r.am + r.bm), h = Math.max(0, A + B * n);
  return I - HH.gNa * m ** 3 * h * (V - HH.ENa) - HH.gK * n ** 4 * (V - HH.EK) - HH.gL * (V - HH.EL);
}

/** Phase plane of Rinzel's two-variable reduction of the HH model (m = m∞, h = 0.871 - 1.075 n): nullclines and a trajectory from rest. */
export function ReducedPhasePlane() {
  const [I, setI] = useState(8);
  const { vNull, traj, rate } = useMemo(() => {
    const vNull: { V: number; n: number }[] = [];
    for (let V = -80; V <= 40; V += 0.5) {
      let prev = dVdt(V, 0, I);
      for (let n = 0.005; n <= 1; n += 0.005) {
        const cur = dVdt(V, n, I);
        if (Math.sign(cur) !== Math.sign(prev)) vNull.push({ V, n: n - 0.0025 });
        prev = cur;
      }
    }
    let V = -65, n = infTau(-65, "n").inf; const dt = 0.01, traj: [number, number][] = [];
    const up: number[] = [];
    for (let k = 0; k * dt < 120; k++) {
      const r = hhRates(V), Vn = V + dt * dVdt(V, n, I);
      n += dt * (r.an * (1 - n) - r.bn * n);
      if (Vn > 0 && V <= 0 && k * dt > 20) up.push(k * dt);
      V = Vn; if (k % 10 === 0) traj.push([V, n]);
    }
    const rate = up.length > 1 ? (1000 * (up.length - 1)) / (up[up.length - 1] - up[0]) : 0;
    return { vNull, traj, rate };
  }, [I]);
  const W = 360, H = 230, x0 = 34, x1 = 350, y0 = 12, y1 = 205;
  const X = (V: number) => x0 + ((V + 80) / 120) * (x1 - x0);
  const Y = (n: number) => y1 - ((n - 0.2) / 0.7) * (y1 - y0);
  const nNull = Array.from({ length: 121 }, (_, i) => -80 + i).map((V) => `${X(V)},${Y(infTau(V, "n").inf)}`).join(" ");
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Phase plane of the reduced Hodgkin-Huxley model with nullclines and a trajectory">
        <defs><clipPath id="rpp"><rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} /></clipPath></defs>
        {[-80, -40, 0, 40].map((V) => <text key={V} x={X(V)} y={H - 10} fontSize="9" textAnchor="middle" fill="var(--ink-3)">{V}</text>)}
        {[0.2, 0.4, 0.6, 0.8].map((n) => <text key={n} x={x0 - 4} y={Y(n) + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">{n}</text>)}
        <text x={x1} y={H - 1} fontSize="9" textAnchor="end" fill="var(--ink-3)">V (mV)</text>
        <text x={x0 + 2} y={y0 + 8} fontSize="9" fill="var(--ink-3)">n</text>
        <g clipPath="url(#rpp)">
          {vNull.map((p, i) => <circle key={i} cx={X(p.V)} cy={Y(p.n)} r="1.3" fill="var(--neuro)" />)}
          <polyline points={nNull} fill="none" stroke="var(--ai)" strokeWidth="2" />
          <polyline points={traj.map(([V, n]) => `${X(V)},${Y(n)}`).join(" ")} fill="none" stroke="var(--ink)" strokeWidth="1.4" opacity="0.8" />
        </g>
        <text x={X(28)} y={Y(0.86)} fontSize="9" fill="var(--ai)">n-nullcline</text>
        <text x={X(-78)} y={Y(0.25)} fontSize="9" fill="var(--neuro)">V-nullcline</text>
      </svg>
      <Slider label="input current" value={I} min={0} max={30} step={0.5} onChange={setI} unit="μA/cm²" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="reduced model rate" value={rate > 0 ? `${rate.toFixed(0)} Hz` : "silent"} />
        <Stat label="state" value={rate > 0 ? "limit cycle" : "rest"} />
      </div>
      <p className="text-sm text-ink-2">The V-nullcline (where V stops changing) has the cubic shape of every excitable model; the n-nullcline is n∞(V). With little current they cross on the left branch, a stable resting state. More current raises the V-nullcline until the crossing moves onto its middle branch, rest becomes unstable, and the trajectory settles on a limit cycle around it: repetitive firing.</p>
    </div>
  );
}
