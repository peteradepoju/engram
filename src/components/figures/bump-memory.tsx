"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** A bump attractor holding a cued location, with noise and an optional distractor. */
export function BumpMemory() {
  const [noise, setNoise] = useState(0.05);
  const [dist, setDist] = useState(0);
  const N = 48, steps = 1600, cueEnd = 200, dOn = 700;
  const res = useMemo(() => {
    const r = rng(2000), g = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
    const th = Array.from({ length: N }, (_, i) => -Math.PI + (2 * Math.PI * i) / N);
    const W = th.map((a) => th.map((b) => (-2 + 6 * Math.cos(a - b)) / N));
    const f = (x: number) => Math.min(1, Math.max(0, x));
    let u = new Array(N).fill(0); const hist: number[][] = []; let cen = 0;
    for (let k = 0; k < steps; k++) {
      const fu = u.map(f);
      u = u.map((ui, i) => {
        let s = 0; for (let j = 0; j < N; j++) s += W[i][j] * fu[j];
        let inp = 0.1 + (k < cueEnd ? 0.5 * Math.cos(th[i]) : 0);
        if (dist !== 0 && k >= dOn && k < dOn + 100) inp += 0.3 * Math.exp(5 * (Math.cos(th[i] - dist) - 1));
        return ui + 0.1 * (-ui + s + inp) + noise * Math.sqrt(0.1) * g();
      });
      if (k % 8 === 0) hist.push(u.map(f));
    }
    const fu = u.map(f); let cx = 0, cy = 0; fu.forEach((v, i) => { cx += v * Math.cos(th[i]); cy += v * Math.sin(th[i]); });
    cen = Math.atan2(cy, cx);
    return { hist, cen };
  }, [noise, dist]);
  const W = 360, H = 170, cw = 310 / res.hist.length, ch = (H - 35) / N;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Bump attractor working memory">
        {res.hist.map((col, t) => col.map((v, i) => (v > 0.03 ? <rect key={`${t}-${i}`} x={35 + t * cw} y={12 + (N - 1 - i) * ch} width={cw + 0.2} height={ch + 0.2} fill="var(--neuro)" opacity={v} /> : null)))}
        <line x1={35 + (cueEnd / 8) * cw} x2={35 + (cueEnd / 8) * cw} y1="10" y2={H - 22} stroke="var(--ink-3)" strokeDasharray="3 3" />
        {dist !== 0 && <rect x={35 + (dOn / 8) * cw} y="10" width={(100 / 8) * cw} height={H - 32} fill="var(--ai)" opacity="0.15" />}
        <text x={37 + (cueEnd / 8) * cw} y={H - 8} fontSize="8" fill="var(--ink-3)">cue off</text>
        {dist !== 0 && <text x={37 + (dOn / 8) * cw} y={H - 8} fontSize="8" fill="var(--ai)">distractor</text>}
        <text x="31" y="18" fontSize="8" textAnchor="end" fill="var(--ink-3)">π</text>
        <text x="31" y={H - 22} fontSize="8" textAnchor="end" fill="var(--ink-3)">−π</text>
      </svg>
      <Slider label="noise" value={noise} min={0} max={0.15} step={0.01} onChange={setNoise} fmt={(v) => v.toFixed(2)} />
      <Slider label="distractor location (0 = none)" value={dist} min={-3} max={3} step={0.1} onChange={setDist} unit=" rad" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="cued location" value="0.00 rad" />
        <Stat label="remembered at the end" value={`${res.cen.toFixed(2)} rad`} />
      </div>
      <p className="text-sm text-ink-2">The cue is at 0. Raise the noise and the bump wanders further during the delay. A distractor close to 0 pulls the memory towards it; one on the far side of the ring is ignored.</p>
    </div>
  );
}
