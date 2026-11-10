"use client";

import { useMemo, useState } from "react";
import { infTau } from "./hh";
import { rng, Slider, Stat } from "./util";

/** Noisy potassium conductance after a step from -65 to +20 mV, fitted with (a - (a - b)e^(-t/τ))^p for a chosen power p. */
export function GatePower() {
  const [p, setP] = useState(1);
  const gK = 36;
  const { ts, data, n0, ninf } = useMemo(() => {
    const r = rng(1952), gauss = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r());
    const n0 = infTau(-65, "n").inf, f = infTau(20, "n");
    const ts = Array.from({ length: 121 }, (_, i) => i * 0.05);
    const data = ts.map((t) => gK * (f.inf - (f.inf - n0) * Math.exp(-t / f.tau)) ** 4 + 0.6 * gauss());
    return { ts, data, n0, ninf: f.inf };
  }, []);
  const fit = useMemo(() => {
    const a = ninf ** (4 / p), b = n0 ** (4 / p);
    let best = { err: Infinity, tau: 1 };
    for (let tau = 0.2; tau <= 5; tau += 0.01) {
      let err = 0;
      for (let i = 0; i < ts.length; i++) err += (data[i] - gK * (a - (a - b) * Math.exp(-ts[i] / tau)) ** p) ** 2;
      if (err < best.err) best = { err, tau };
    }
    return { ...best, curve: ts.map((t) => gK * (a - (a - b) * Math.exp(-t / best.tau)) ** p) };
  }, [p, ts, data, n0, ninf]);
  const W = 360, H = 200, x0 = 34, x1 = 350, y0 = 14, y1 = 180;
  const X = (t: number) => x0 + (t / 6) * (x1 - x0);
  const Y = (g: number) => y1 - (g / 32) * (y1 - y0);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Potassium conductance data with a fitted curve for the chosen power">
        {[0, 10, 20, 30].map((g) => (
          <g key={g}>
            <line x1={x0} x2={x1} y1={Y(g)} y2={Y(g)} stroke="var(--line)" />
            <text x={x0 - 4} y={Y(g) + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">{g}</text>
          </g>
        ))}
        <text x={x0 + 2} y={y0 - 2} fontSize="9" fill="var(--ink-3)">g_K (mS/cm²)</text>
        {data.map((g, i) => <circle key={i} cx={X(ts[i])} cy={Y(g)} r="1.8" fill="var(--ink-3)" />)}
        <polyline points={fit.curve.map((g, i) => `${X(ts[i])},${Y(g)}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2.2" />
        <text x={x1} y={H - 4} fontSize="9" textAnchor="end" fill="var(--ink-3)">time after the step (ms)</text>
      </svg>
      <Slider label="number of gates p" value={p} min={1} max={6} step={1} onChange={setP} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="best time constant" value={`${fit.tau.toFixed(2)} ms`} />
        <Stat label="squared error" value={fit.err.toFixed(0)} />
      </div>
      <p className="text-sm text-ink-2">With one gate the fit must rise at full speed from the start and misses the delay. As p grows, the onset becomes more sigmoid. The error is smallest near p = 4, the value Hodgkin and Huxley chose; neighbouring powers are not far behind, which is why later work on cloned channels used richer kinetic schemes.</p>
    </div>
  );
}
