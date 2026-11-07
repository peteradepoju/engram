"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** A Gaussian channel: information about a Gaussian signal carried by a noisy linear response, ½ log₂(1 + SNR) bits. */
export function GaussianChannel() {
  const [snrDb, setSnrDb] = useState(6);
  const snr = 10 ** (snrDb / 10);
  const I = 0.5 * Math.log2(1 + snr);
  const pts = useMemo(() => { const r = rng(1948), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r()); return Array.from({ length: 300 }, () => [g(), g()]); }, []);
  const noiseSd = 1 / Math.sqrt(snr);
  const W = 360;
  const curve = Array.from({ length: 101 }, (_, i) => { const d = -10 + i * 0.4; return [d, 0.5 * Math.log2(1 + 10 ** (d / 10))]; });
  const GX = (d: number) => 196 + ((d + 10) / 40) * 150, GY = (v: number) => 160 - (v / 5.2) * 130;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} 200`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Signal against noisy response, and information against signal-to-noise ratio">
        <rect x="10" y="24" width="170" height="150" fill="none" stroke="var(--line)" />
        {pts.map(([sg, nz], i) => { const resp = (sg + noiseSd * nz) / Math.sqrt(1 + 1 / snr); return <circle key={i} cx={95 + Math.max(-3.2, Math.min(3.2, sg)) * 25} cy={99 - Math.max(-2.9, Math.min(2.9, resp)) * 25} r="1.8" fill="var(--ai)" opacity="0.55" />; })}
        <text x="10" y="194" fontSize="10" fill="var(--ink-3)">signal →</text>
        <text x="10" y="16" fontSize="10" fill="var(--ink-3)">response (signal + noise)</text>
        <line x1="196" x2="346" y1="160" y2="160" stroke="var(--line)" />
        <line x1="196" x2="196" y1="24" y2="160" stroke="var(--line)" />
        <polyline points={curve.map(([d, v]) => `${GX(d)},${GY(v)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2.5" />
        <circle cx={GX(snrDb)} cy={GY(I)} r="5" fill="var(--neuro)" />
        {[-10, 0, 10, 20, 30].map((d) => <text key={d} x={GX(d)} y="174" fontSize="9" textAnchor="middle" fill="var(--ink-3)">{d}</text>)}
        <text x="271" y="188" fontSize="10" textAnchor="middle" fill="var(--ink-3)">SNR (dB)</text>
        <text x="200" y="20" fontSize="10" fill="var(--neuro)">bits per sample</text>
      </svg>
      <Slider label="signal-to-noise ratio (dB)" value={snrDb} min={-10} max={30} step={0.5} onChange={setSnrDb} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="SNR (variance ratio)" value={snr < 10 ? snr.toFixed(2) : snr.toFixed(0)} />
        <Stat label="information (bits)" value={I.toFixed(2)} />
        <Stat label="distinguishable levels ≈ 2^I" value={(2 ** I).toFixed(1)} />
      </div>
      <p className="text-sm text-ink-2">Left: a Gaussian signal passed through a channel that adds Gaussian noise; with high SNR the response tracks the signal closely, with low SNR it is a blur. Right: the information the response carries about the signal, ½ log₂(1 + SNR) bits per sample (Shannon). Each tenfold increase in SNR adds only about 1.7 bits, so information is cheap at first and then increasingly expensive, an important constraint for neurons that pay in energy for every bit.</p>
    </div>
  );
}
