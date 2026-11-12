"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

const N = 10;

/** Averaged Hebbian learning for 20 inputs from two eyes, with subtractive (fixed sum, clipped) or multiplicative (Oja) normalisation. */
export function OcularDominance() {
  const [within, setWithin] = useState(0.5);
  const [between, setBetween] = useState(0.2);
  const [mode, setMode] = useState<"subtractive" | "oja">("subtractive");
  const traj = useMemo(() => {
    const r = rng(1989), C = Array.from({ length: 2 * N }, (_, i) => Array.from({ length: 2 * N }, (_, j) => (i === j ? 1 : (i < N) === (j < N) ? within : between)));
    let w = Array.from({ length: 2 * N }, () => 0.5 + 0.05 * (r() - 0.5) * 2);
    const out: number[][] = [];
    for (let t = 0; t < 3000; t++) {
      const cw = C.map((row) => row.reduce((s, v, j) => s + v * w[j], 0));
      if (mode === "subtractive") { const m = cw.reduce((a, b) => a + b, 0) / cw.length; w = w.map((v, i) => Math.min(1, Math.max(0, v + 0.01 * (cw[i] - m)))); }
      else { const y2 = w.reduce((s, v, i) => s + v * cw[i], 0); w = w.map((v, i) => v + 0.01 * (cw[i] - y2 * v)); }
      if (t % 30 === 0) out.push([...w]);
    }
    return out;
  }, [within, between, mode]);
  const last = traj[traj.length - 1], L = last.slice(0, N).reduce((a, b) => a + b, 0) / N, R = last.slice(N).reduce((a, b) => a + b, 0) / N;
  const W = 360, H = 170, ymax = Math.max(1, ...last);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button className={`btn !py-1.5 ${mode === "subtractive" ? "btn-primary" : ""}`} onClick={() => setMode("subtractive")}>subtractive</button>
        <button className={`btn !py-1.5 ${mode === "oja" ? "btn-primary" : ""}`} onClick={() => setMode("oja")}>multiplicative (Oja)</button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Weights from two eyes during learning">
        {[0, 1].map((eye) => (
          <polyline key={eye} points={traj.map((w, k) => { const m = w.slice(eye * N, eye * N + N).reduce((a, b) => a + b, 0) / N; return `${12 + (k / (traj.length - 1)) * 200},${H - 15 - (m / ymax) * (H - 30)}`; }).join(" ")} fill="none" stroke={eye ? "var(--neuro)" : "var(--ai)"} strokeWidth="2" />
        ))}
        <text x="14" y="14" fontSize="9" fill="var(--ai)">left eye (mean weight)</text>
        <text x="120" y="14" fontSize="9" fill="var(--neuro)">right eye</text>
        {last.map((v, i) => <rect key={i} x={225 + i * 6.5} y={H - 15 - (v / ymax) * (H - 30)} width="5" height={(v / ymax) * (H - 30)} fill={i < N ? "var(--ai)" : "var(--neuro)"} />)}
        <text x="225" y="14" fontSize="9" fill="var(--ink-3)">final weights</text>
      </svg>
      <Slider label="correlation within an eye" value={within} min={0} max={0.9} step={0.05} onChange={setWithin} fmt={(v) => v.toFixed(2)} />
      <Slider label="correlation between eyes" value={between} min={0} max={0.9} step={0.05} onChange={setBetween} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="left eye" value={L.toFixed(2)} />
        <Stat label="right eye" value={R.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">With subtractive normalisation, whenever inputs within an eye are more correlated than inputs across eyes, one eye takes all the weight. Make the between-eye correlation as large as the within-eye one and the competition loses its target: the weights stay mixed. Oja&apos;s rule never segregates here, because the principal component of this symmetric arrangement weights both eyes equally.</p>
    </div>
  );
}
