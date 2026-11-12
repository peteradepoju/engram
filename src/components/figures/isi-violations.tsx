"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

function exp(r: () => number) { return -Math.log(Math.max(r(), 1e-12)); }

/** A refractory neuron (2 ms dead time) contaminated by Poisson spikes from another source: the ISI histogram from 0 to 20 ms, the violation metric m and the inverted contamination estimate. */
export function ISIViolations() {
  const [f, setF] = useState(0.2);
  const [rate, setRate] = useState(10);
  const { hist, m, fhat, n } = useMemo(() => {
    const r = rng(2011), T = 1200, own: number[] = [];
    let t = 0;
    while (t < T) { t += 0.002 + exp(r) / (rate * (1 - f) + 1e-9); if (t < T) own.push(t); }
    const other = Array.from({ length: Math.round(rate * f * T) }, () => r() * T);
    const st = [...own, ...other].sort((a, b) => a - b), n = st.length;
    const hist = new Array(40).fill(0); let v = 0;
    for (let i = 1; i < n; i++) { const d = st[i] - st[i - 1]; if (d < 0.0015) v++; if (d < 0.02) hist[Math.floor(d / 0.0005)]++; }
    const m = v / (2 * 0.0015 * n * n / T);
    return { hist, m, fhat: 1 - Math.sqrt(1 - 2 * Math.min(m, 0.4999)), n };
  }, [f, rate]);
  const W = 360, H = 180, hmax = Math.max(...hist, 1);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Interspike interval histogram near zero">
        <rect x="20" y="10" width={(1.5 / 20) * 320} height={H - 40} fill="var(--bad-soft)" />
        <text x="24" y="22" fontSize="8" fill="var(--bad)">violations (under 1.5 ms)</text>
        {hist.map((c, i) => <rect key={i} x={20 + i * 8} y={H - 30 - (c / hmax) * (H - 50)} width="7" height={(c / hmax) * (H - 50)} fill={i < 3 ? "var(--bad)" : "var(--ai)"} />)}
        <line x1="20" x2="340" y1={H - 30} y2={H - 30} stroke="var(--line)" />
        <text x="20" y={H - 14} fontSize="9" fill="var(--ink-3)">0</text>
        <text x="340" y={H - 14} fontSize="9" textAnchor="end" fill="var(--ink-3)">20 ms</text>
      </svg>
      <Slider label="true contamination" value={f} min={0} max={1} step={0.01} onChange={setF} fmt={(v) => `${Math.round(v * 100)}%`} />
      <Slider label="firing rate" value={rate} min={1} max={40} step={1} onChange={setRate} unit="Hz" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="spikes in 20 min" value={`${n}`} />
        <Stat label="metric m" value={m.toFixed(3)} />
        <Stat label="estimated contamination" value={`${Math.round(fhat * 100)}%`} />
      </div>
      <p className="text-sm text-ink-2">With no contamination the histogram is empty below 2 ms, the neuron&apos;s refractory period. Contaminating spikes fill the gap, yet as a share of all intervals violations stay small: at 20% contamination and 10 Hz, well under 1%. The metric rises towards 0.5 as contamination approaches 100%, and the inverted estimate tracks the truth. At low firing rates there are so few violations that the estimate is noisy, so the same threshold is less reliable for quiet units.</p>
    </div>
  );
}
