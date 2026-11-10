"use client";

import { useMemo, useState } from "react";
import { infTau } from "./hh";
import { Slider, Stat } from "./util";

/** Holding voltage, then two 15 ms steps to 0 mV separated by a gap back at the holding voltage; the sodium conductance m³h is computed by piecewise exponential relaxation of the gates. */
export function InactivationProtocol() {
  const [Vh, setVh] = useState(-65);
  const [gap, setGap] = useState(8);
  const { ts, vs, gs, p1, p2 } = useMemo(() => {
    const segs = [{ V: Vh, d: 5 }, { V: 0, d: 15 }, { V: Vh, d: gap }, { V: 0, d: 15 }];
    let m = infTau(Vh, "m").inf, h = infTau(Vh, "h").inf, t0 = 0;
    const ts: number[] = [], vs: number[] = [], gs: number[] = [];
    const peaks: number[] = [];
    for (const s of segs) {
      const fm = infTau(s.V, "m"), fh = infTau(s.V, "h"), m0 = m, h0 = h;
      let pk = 0;
      for (let t = 0; t <= s.d + 1e-9; t += 0.05) {
        m = fm.inf - (fm.inf - m0) * Math.exp(-t / fm.tau); h = fh.inf - (fh.inf - h0) * Math.exp(-t / fh.tau);
        const g = 120 * m ** 3 * h; pk = Math.max(pk, g);
        ts.push(t0 + t); vs.push(s.V); gs.push(g);
      }
      t0 += s.d; if (s.V === 0) peaks.push(pk);
    }
    return { ts, vs, gs, p1: peaks[0], p2: peaks[1] };
  }, [Vh, gap]);
  const maxRef = useMemo(() => {
    const fm = infTau(0, "m"), fh = infTau(0, "h"), m0 = infTau(-120, "m").inf, h0 = infTau(-120, "h").inf;
    let pk = 0; for (let t = 0; t <= 5; t += 0.02) pk = Math.max(pk, 120 * (fm.inf - (fm.inf - m0) * Math.exp(-t / fm.tau)) ** 3 * (fh.inf - (fh.inf - h0) * Math.exp(-t / fh.tau)));
    return pk;
  }, []);
  const T = ts[ts.length - 1], W = 360, H = 210, x0 = 30, x1 = 350;
  const X = (t: number) => x0 + (t / T) * (x1 - x0);
  const Yv = (v: number) => 46 - ((v + 120) / 120) * 34;
  const Yg = (g: number) => 196 - (g / Math.max(maxRef, 1e-9)) * 130;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="A voltage protocol and the sodium conductance it evokes">
        <text x={x0} y="10" fontSize="9" fill="var(--ink-3)">command voltage</text>
        <polyline points={ts.map((t, i) => `${X(t)},${Yv(vs[i])}`).join(" ")} fill="none" stroke="var(--ink-2)" strokeWidth="1.6" />
        <text x={x0} y="64" fontSize="9" fill="var(--ink-3)">sodium conductance (relative to the maximum)</text>
        <line x1={x0} x2={x1} y1={Yg(0)} y2={Yg(0)} stroke="var(--line)" />
        <line x1={x0} x2={x1} y1={Yg(maxRef)} y2={Yg(maxRef)} stroke="var(--line)" strokeDasharray="3 3" />
        <polyline points={ts.map((t, i) => `${X(t)},${Yg(gs[i])}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
      </svg>
      <Slider label="holding voltage" value={Vh} min={-110} max={-40} step={1} onChange={setVh} unit="mV" />
      <Slider label="gap between the two steps" value={gap} min={0} max={40} step={0.5} onChange={setGap} unit="ms" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="first peak, fraction of maximum" value={(p1 / maxRef).toFixed(2)} />
        <Stat label="second peak / first peak" value={(p2 / p1).toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">The first peak shows how many sodium channels the holding voltage leaves available (the dashed line is the maximum, from -120 mV). The second shows how many have recovered from the first step during the gap. Hold at -55 mV and most channels are already inactivated; give a short gap and the second step draws little current.</p>
    </div>
  );
}
