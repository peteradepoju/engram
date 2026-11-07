"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** The forward process of a diffusion model: data points are shrunk and noised step by step until they are pure Gaussian noise. */
export function ForwardDiffusion() {
  const [t, setT] = useState(0);
  const T = 100;
  const { x0, eps } = useMemo(() => {
    const r = rng(2020), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r());
    const x0: number[][] = [], eps: number[][] = [];
    for (let i = 0; i < 500; i++) {
      const s = r() * 3 * Math.PI + 0.5, rad = 0.12 + 0.09 * s;      // a spiral
      x0.push([rad * Math.cos(s) + 0.02 * g(), rad * Math.sin(s) + 0.02 * g()]);
      eps.push([g(), g()]);
    }
    return { x0, eps };
  }, []);
  // linear schedule of β from 1e-4 to 0.1 over 100 steps; ᾱ_t is the product of (1 − β)
  const abar = useMemo(() => { const out = [1]; for (let k = 1; k <= T; k++) out.push(out[k - 1] * (1 - (1e-4 + ((0.1 - 1e-4) * (k - 1)) / (T - 1)))); return out; }, []);
  const a = abar[t];
  const pts = x0.map((p, i) => [Math.sqrt(a) * p[0] + Math.sqrt(1 - a) * eps[i][0], Math.sqrt(a) * p[1] + Math.sqrt(1 - a) * eps[i][1]]);
  const W = 360, H = 240, cx = W / 2, cy = H / 2, sc = 50;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Points from a spiral being noised step by step">
        <circle cx={cx} cy={cy} r={sc * 2} fill="none" stroke="var(--line)" strokeDasharray="3 3" />
        {pts.map((p, i) => <circle key={i} cx={cx + p[0] * sc} cy={cy - p[1] * sc} r="1.8" fill="var(--neuro)" opacity="0.75" />)}
        <text x="12" y="16" fontSize="9" fill="var(--ink-3)">dashed circle: 2 sd of the standard normal</text>
      </svg>
      <Slider label="noising step t" value={t} min={0} max={T} step={1} onChange={setT} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="signal kept √ᾱ" value={Math.sqrt(a).toFixed(3)} />
        <Stat label="noise added √(1 − ᾱ)" value={Math.sqrt(1 - a).toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">A diffusion model's forward process takes data, here 500 points on a spiral, and at every step shrinks them slightly and adds a little Gaussian noise. After enough steps nothing of the spiral is left: the points are a standard normal cloud. The model is trained to undo one step at a time, by predicting the noise that was added; run backwards from pure noise, it then generates new samples of the data.</p>
    </div>
  );
}
