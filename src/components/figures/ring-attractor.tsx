"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** A ring attractor: cue, persistence, rotation by asymmetric weights, and drift from heterogeneity. */
export function RingAttractor() {
  const [gamma, setGamma] = useState(0);
  const [het, setHet] = useState(0);
  const N = 60, T = 1200, cueEnd = 150;
  const { hist, centres } = useMemo(() => {
    const th = Array.from({ length: N }, (_, i) => -Math.PI + (2 * Math.PI * i) / N);
    const r = rng(1996);
    const W = th.map((a) => th.map((b) => {
      const g = Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
      return (-2 + 6 * Math.cos(a - b) + gamma * Math.sin(a - b) + het * g) / N;
    }));
    const f = (x: number) => Math.min(1, Math.max(0, x));
    let u = new Array(N).fill(0);
    const hist: number[][] = [], centres: number[] = [];
    for (let t = 0; t < T; t++) {
      const fu = u.map(f);
      u = u.map((ui, i) => {
        let s = 0;
        for (let j = 0; j < N; j++) s += W[i][j] * fu[j];
        const inp = t < cueEnd ? 0.5 * Math.cos(th[i] - 1) + 0.1 : 0.1;
        return ui + 0.1 * (-ui + s + inp);
      });
      if (t % 6 === 0) {
        const fr = u.map(f); hist.push(fr);
        let cx = 0, cy = 0;
        fr.forEach((v, i) => { cx += v * Math.cos(th[i]); cy += v * Math.sin(th[i]); });
        centres.push(Math.atan2(cy, cx));
      }
    }
    return { hist, centres };
  }, [gamma, het]);
  const W = 360, H = 170, cw = 320 / hist.length, ch = (H - 30) / N;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Ring attractor activity over time">
        {hist.map((col, t) => col.map((v, i) => (v > 0.02 ? <rect key={`${t}-${i}`} x={30 + t * cw} y={10 + (N - 1 - i) * ch} width={cw + 0.2} height={ch + 0.2} fill="var(--neuro)" opacity={v} /> : null)))}
        <line x1={30 + (cueEnd / 6) * cw} x2={30 + (cueEnd / 6) * cw} y1="10" y2={H - 20} stroke="var(--ink-3)" strokeDasharray="3 3" />
        <text x={32 + (cueEnd / 6) * cw} y={H - 8} fontSize="8" fill="var(--ink-3)">cue off</text>
        <text x="26" y="16" fontSize="8" textAnchor="end" fill="var(--ink-3)">π</text>
        <text x="26" y={H - 20} fontSize="8" textAnchor="end" fill="var(--ink-3)">−π</text>
        <text x="350" y={H - 8} fontSize="8" textAnchor="end" fill="var(--ink-3)">time</text>
      </svg>
      <Slider label="asymmetry γ (angular velocity)" value={gamma} min={-2} max={2} step={0.1} onChange={setGamma} fmt={(v) => v.toFixed(1)} />
      <Slider label="connection heterogeneity" value={het} min={0} max={1} step={0.05} onChange={setHet} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="bump centre at the end" value={`${centres[centres.length - 1].toFixed(2)} rad`} />
        <Stat label="cue was at" value="1.00 rad" />
      </div>
      <p className="text-sm text-ink-2">Rows are neurons ordered by preferred direction; brightness is firing rate. With no asymmetry and no heterogeneity the bump stays at the cued direction after the cue is removed. Asymmetry turns it at a steady speed; heterogeneity pulls it towards a few preferred directions.</p>
    </div>
  );
}
