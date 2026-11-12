"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

const DT = 0.005, N = 600;
function gauss(r: () => number) { return Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r()); }

/** Estimating hand position in the dark: true path, forward model alone (miscalibrated gain), delayed noisy feedback alone, and their combination. */
export function ForwardModel() {
  const [delay, setDelay] = useState(100);
  const [gainErr, setGainErr] = useState(10);
  const res = useMemo(() => {
    const r = rng(1995), d = Math.round(delay / 1000 / DT), gm = 1 - gainErr / 100;
    const v = Array.from({ length: N }, (_, i) => 0.3 * Math.sin((2 * Math.PI * i * DT) / 1.5) + 0.15);
    const x = [0]; for (let i = 1; i < N; i++) x.push(x[i - 1] + DT * v[i - 1] + 0.0003 * gauss(r));
    const fwd = [0]; for (let i = 1; i < N; i++) fwd.push(fwd[i - 1] + DT * gm * v[i - 1]);
    const y = x.map((_, i) => (i >= d ? x[i - d] : x[0]) + 0.005 * gauss(r));
    const comb = [0]; let xd = 0;
    for (let i = 1; i < N; i++) {
      if (i > d) { xd += DT * gm * v[i - d - 1]; xd += 0.1 * (y[i] - xd); }
      let s = 0; for (let j = Math.max(0, i - d); j < i; j++) s += v[j];
      comb.push(xd + DT * gm * s);
    }
    const rms = (e: number[]) => Math.sqrt(e.reduce((s, val, i) => s + (val - x[i]) ** 2, 0) / N) * 1000;
    return { x, fwd, y, comb, rf: rms(fwd), rb: rms(y), rc: rms(comb) };
  }, [delay, gainErr]);
  const all = [...res.x, ...res.fwd], lo = Math.min(...all), hi = Math.max(...all);
  const W = 360, H = 190, sx = (i: number) => 12 + (i / (N - 1)) * 336, sy = (v: number) => H - 12 - ((v - lo) / (hi - lo)) * (H - 30);
  const line = (a: number[]) => a.map((v, i) => `${sx(i)},${sy(v)}`).join(" ");
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Hand position estimates over 3 seconds">
        <polyline points={line(res.y)} fill="none" stroke="var(--ink-3)" strokeWidth="0.8" opacity="0.6" />
        <polyline points={line(res.x)} fill="none" stroke="var(--ink)" strokeWidth="2" />
        <polyline points={line(res.fwd)} fill="none" stroke="var(--neuro)" strokeWidth="1.5" />
        <polyline points={line(res.comb)} fill="none" stroke="var(--ai)" strokeWidth="1.5" strokeDasharray="4 2" />
        <text x="14" y="14" fontSize="9" fill="var(--ink)">true</text>
        <text x="44" y="14" fontSize="9" fill="var(--neuro)">forward model</text>
        <text x="118" y="14" fontSize="9" fill="var(--ink-3)">delayed feedback</text>
        <text x="204" y="14" fontSize="9" fill="var(--ai)">combined</text>
      </svg>
      <Slider label="feedback delay" value={delay} min={0} max={300} step={10} onChange={setDelay} unit="ms" />
      <Slider label="forward model gain error" value={gainErr} min={0} max={30} step={1} onChange={setGainErr} unit="%" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="RMS, forward" value={`${res.rf.toFixed(1)} mm`} />
        <Stat label="RMS, feedback" value={`${res.rb.toFixed(1)} mm`} />
        <Stat label="RMS, combined" value={`${res.rc.toFixed(1)} mm`} />
      </div>
      <p className="text-sm text-ink-2">Three seconds of hand movement in the dark. The forward model drifts away in proportion to its miscalibration; the feedback trace is noisy and late. The combination tracks the hand closely. Lengthen the delay and the combined estimate relies more on prediction, so its error grows with the forward model&apos;s error; with a perfect model, delay costs almost nothing.</p>
    </div>
  );
}
