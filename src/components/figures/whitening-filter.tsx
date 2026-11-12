"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

function j0(z: number) { let s = 0; for (let k = 0; k < 32; k++) { const t = ((k + 0.5) / 32) * Math.PI; s += Math.cos(z * Math.sin(t)); } return s / 32; }

/** The Atick and Redlich filter K(f) = S/(S+N) / sqrt(S+N) for S = snr / f², and its radial receptive field profile from a Hankel transform. */
export function WhiteningFilter() {
  const [logSnr, setLogSnr] = useState(-1);
  const snr = 10 ** logSnr;
  const fs = useMemo(() => Array.from({ length: 120 }, (_, i) => 10 ** (-2.3 + (i / 119) * 2)), []);
  const K = fs.map((f) => { const S = snr / (f * f); return (S / (S + 1)) / Math.sqrt(S + 1); });
  const kmax = Math.max(...K), fpeak = fs[K.indexOf(kmax)];
  const xs = Array.from({ length: 40 }, (_, i) => i * 0.5);
  const prof = xs.map((x) => { let s = 0; for (let i = 1; i < fs.length; i++) { const df = fs[i] - fs[i - 1]; s += K[i] * j0(2 * Math.PI * fs[i] * x) * fs[i] * df; } return s; });
  const pmax = Math.max(...prof), pmin = Math.min(...prof);
  const W = 360, H = 170;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Optimal filter gain and receptive field profile">
        <text x="10" y="12" fontSize="9" fill="var(--ink-3)">gain against spatial frequency (log)</text>
        <polyline points={K.map((k, i) => `${10 + (i / 119) * 160},${150 - (k / kmax) * 125}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <line x1="10" x2="170" y1="150" y2="150" stroke="var(--line)" />
        <text x="190" y="12" fontSize="9" fill="var(--ink-3)">receptive field profile (from centre)</text>
        <line x1="190" x2="350" y1={150 - ((0 - pmin) / (pmax - pmin)) * 125} y2={150 - ((0 - pmin) / (pmax - pmin)) * 125} stroke="var(--line)" />
        <polyline points={prof.map((p, i) => `${190 + (i / 39) * 160},${150 - ((p - pmin) / (pmax - pmin)) * 125}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
      </svg>
      <Slider label="signal-to-noise ratio (log10)" value={logSnr} min={-4} max={3} step={0.1} onChange={setLogSnr} fmt={(v) => `10^${v.toFixed(1)}`} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="peak gain at" value={`${fpeak.toFixed(3)} c/pixel`} />
        <Stat label="surround depth" value={`${Math.round((pmin / pmax) * 100)}% of centre`} />
      </div>
      <p className="text-sm text-ink-2">At high signal-to-noise ratio the gain rises with frequency (whitening) until noise takes over, and the receptive field has a sharp centre and a negative surround. Lower the ratio and the turnover moves to lower frequencies: the filter becomes a smoother, wider blob with little surround, trading resolution for reliability, as ganglion cells do in dim light.</p>
    </div>
  );
}
