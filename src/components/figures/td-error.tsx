"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

/** TD learning with a complete serial compound: the error moves from reward to cue. */
export function TDError() {
  const [trials, setTrials] = useState(120);
  const [alpha, setAlpha] = useState(0.2);
  const [omit, setOmit] = useState(false);
  const T = 30, cs = 6, rt = 22;
  const D = useMemo(() => {
    const w = new Array(T).fill(0), out: number[][] = [];
    const feat = (t: number) => (t >= cs && t < T ? t - cs : -1);
    for (let k = 0; k < trials; k++) {
      const r = new Array(T + 1).fill(0);
      if (!(omit && k === trials - 1)) r[rt] = 1;
      const d = new Array(T).fill(0);
      for (let t = 0; t < T; t++) {
        const f0 = feat(t), f1 = feat(t + 1);
        const v0 = f0 >= 0 ? w[f0] : 0, v1 = f1 >= 0 ? w[f1] : 0;
        d[t] = r[t + 1] + v1 - v0;
        if (f0 >= 0) w[f0] += alpha * d[t];
      }
      out.push(d);
    }
    return out;
  }, [trials, alpha, omit]);
  const W = 360, H = 190, cw = 300 / T, rh = (H - 40) / D.length;
  const col = (v: number) => (v >= 0 ? `rgba(232,121,160,${Math.min(1, v)})` : `rgba(120,170,240,${Math.min(1, -v)})`);
  const last = D[D.length - 1];
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="TD error over trials">
        {D.map((d, k) => d.map((v, t) => (Math.abs(v) > 0.02 ? <rect key={`${k}-${t}`} x={40 + t * cw} y={15 + k * rh} width={cw + 0.2} height={rh + 0.2} fill={col(v)} /> : null)))}
        <rect x="40" y="15" width="300" height={H - 40} fill="none" stroke="var(--line)" />
        <text x={40 + (cs - 1) * cw} y="11" fontSize="8" fill="var(--ink-3)">cue</text>
        <text x={40 + (rt - 1) * cw} y="11" fontSize="8" fill="var(--ink-3)">reward</text>
        <text x="36" y="22" fontSize="8" textAnchor="end" fill="var(--ink-3)">trial 1</text>
        <text x="36" y={H - 26} fontSize="8" textAnchor="end" fill="var(--ink-3)">last</text>
        <text x="340" y={H - 8} fontSize="8" textAnchor="end" fill="var(--ink-3)">time in trial</text>
      </svg>
      <Slider label="training trials" value={trials} min={1} max={150} step={1} onChange={setTrials} />
      <Slider label="learning rate α" value={alpha} min={0.05} max={0.8} step={0.05} onChange={setAlpha} fmt={(v) => v.toFixed(2)} />
      <label className="flex items-center gap-2 text-sm text-ink-2"><input type="checkbox" checked={omit} onChange={(e) => setOmit(e.target.checked)} /> omit the reward on the last trial</label>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="last trial, error at cue" value={last[cs - 1].toFixed(2)} />
        <Stat label="last trial, error at reward time" value={last[rt - 1].toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">Pink is a positive error (a dopamine burst), blue a negative one (a pause). With few trials the error sits at the reward; with more it travels back to the cue.</p>
    </div>
  );
}
