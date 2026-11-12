"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

type Trial = [number, number, number];
const designs: Record<string, { label: string; trials: Trial[] }> = {
  acq: { label: "acquisition then extinction", trials: [...Array(40).fill([1, 0, 1]), ...Array(40).fill([1, 0, 0])] },
  block: { label: "blocking", trials: [...Array(40).fill([1, 0, 1]), ...Array(40).fill([1, 1, 1])] },
  over: { label: "overexpectation", trials: [...Array(30).fill([1, 0, 1]), ...Array(30).fill([0, 1, 1]), ...Array(30).fill([1, 1, 1])] },
};

/** Rescorla-Wagner learning for two cues under three classic designs. */
export function RescorlaWagner() {
  const [d, setD] = useState("block");
  const [alpha, setAlpha] = useState(0.2);
  const hist = useMemo(() => {
    let v1 = 0, v2 = 0; const h: [number, number][] = [];
    for (const [x1, x2, r] of designs[d].trials) {
      const delta = r - (v1 * x1 + v2 * x2);
      v1 += alpha * delta * x1; v2 += alpha * delta * x2; h.push([v1, v2]);
    }
    return h;
  }, [d, alpha]);
  const n = hist.length, W = 360, H = 160, sx = (t: number) => 30 + (t / n) * 310, sy = (v: number) => H - 20 - v * (H - 40);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {Object.entries(designs).map(([k, v]) => (
          <button key={k} onClick={() => setD(k)} className={`rounded-md border px-3 py-1 text-xs ${d === k ? "border-accent text-accent" : "border-line text-ink-2"}`}>{v.label}</button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Rescorla-Wagner learning curves">
        <line x1="30" x2="340" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        <line x1="30" x2="340" y1={sy(1)} y2={sy(1)} stroke="var(--line)" strokeDasharray="3 3" />
        <text x="26" y={sy(1) + 3} fontSize="8" textAnchor="end" fill="var(--ink-3)">1</text>
        <text x="26" y={sy(0) + 3} fontSize="8" textAnchor="end" fill="var(--ink-3)">0</text>
        <polyline points={hist.map((v, t) => `${sx(t + 1)},${sy(v[0])}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <polyline points={hist.map((v, t) => `${sx(t + 1)},${sy(v[1])}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <text x="36" y="14" fontSize="9" fill="var(--neuro)">light</text>
        <text x="66" y="14" fontSize="9" fill="var(--ai)">tone</text>
        <text x="340" y={H - 6} fontSize="8" textAnchor="end" fill="var(--ink-3)">trial</text>
      </svg>
      <Slider label="learning rate α" value={alpha} min={0.02} max={0.8} step={0.02} onChange={setAlpha} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="final V (light)" value={hist[n - 1][0].toFixed(3)} />
        <Stat label="final V (tone)" value={hist[n - 1][1].toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Each design is a sequence of trials listing which cues are present and whether food follows. The learning rate changes how fast the curves move but not where they end, which is set by the design.</p>
    </div>
  );
}
