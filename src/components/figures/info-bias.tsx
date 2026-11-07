"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** The plug-in entropy estimate is biased downwards for small samples; the Miller-Madow correction removes most of the bias. */
export function InfoBias() {
  const [K, setK] = useState(32);
  const p = useMemo(() => { const raw = Array.from({ length: K }, (_, i) => 1 / (i + 1)); const s = raw.reduce((a, b) => a + b, 0); return raw.map((v) => v / s); }, [K]);
  const Htrue = -p.reduce((a, v) => a + v * Math.log2(v), 0);
  const ns = [10, 20, 40, 80, 160, 320, 640, 1280, 2560];
  const est = useMemo(() => {
    const r = rng(1998 + K), cdf = p.map((_, i) => p.slice(0, i + 1).reduce((a, b) => a + b, 0));
    return ns.map((n) => {
      let plug = 0, mm = 0; const reps = 60;
      for (let t = 0; t < reps; t++) {
        const c = new Array(K).fill(0);
        for (let i = 0; i < n; i++) { const u = r(); let k = 0; while (cdf[k] < u && k < K - 1) k++; c[k]++; }
        const h = -c.reduce((a, v) => a + (v > 0 ? (v / n) * Math.log2(v / n) : 0), 0);
        const occupied = c.filter((v) => v > 0).length;
        plug += h / reps; mm += (h + (occupied - 1) / (2 * n * Math.LN2)) / reps;
      }
      return { n, plug, mm };
    });
  }, [K, p]); // eslint-disable-line react-hooks/exhaustive-deps
  const W = 360, H = 200, X = (n: number) => 34 + (Math.log2(n / 10) / Math.log2(256)) * (W - 50);
  const hi = Htrue * 1.15, Y = (h: number) => H - 30 - (h / hi) * (H - 50);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H + 14}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Entropy estimates against sample size">
        <line x1="34" x2={W - 10} y1={Y(Htrue)} y2={Y(Htrue)} stroke="var(--good)" strokeWidth="2" strokeDasharray="5 3" />
        <polyline points={est.map((e) => `${X(e.n)},${Y(e.plug)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2.5" />
        <polyline points={est.map((e) => `${X(e.n)},${Y(e.mm)}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2.5" />
        {est.map((e) => <circle key={e.n} cx={X(e.n)} cy={Y(e.plug)} r="3" fill="var(--neuro)" />)}
        <line x1="34" x2={W - 10} y1={H - 30} y2={H - 30} stroke="var(--line)" />
        {ns.filter((_, i) => i % 2 === 0).map((n) => <text key={n} x={X(n)} y={H - 14} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{n}</text>)}
        <text x="34" y={H + 8} fontSize="10" fill="var(--good)">true entropy</text>
        <text x="110" y={H + 8} fontSize="10" fill="var(--neuro)">plug-in estimate</text>
        <text x="210" y={H + 8} fontSize="10" fill="var(--ai)">Miller-Madow corrected</text>
      </svg>
      <Slider label="number of possible responses K" value={K} min={4} max={128} step={4} onChange={setK} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="true entropy (bits)" value={Htrue.toFixed(2)} />
        <Stat label="plug-in with 40 samples" value={est[2].plug.toFixed(2)} />
        <Stat label="corrected with 40 samples" value={est[2].mm.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">Estimating entropy by plugging observed frequencies into −Σ p log p underestimates it, because rare responses go unobserved in small samples and the sample looks more predictable than the truth. The bias is roughly (K − 1)/(2N ln 2) bits for K possible responses and N samples, so it is worst for rich responses, such as spike words, and few trials. The Miller-Madow correction adds that term back; more sophisticated estimators do better still.</p>
    </div>
  );
}
