"use client";

import { useMemo, useState } from "react";
import { fft, periodogram } from "./fft";
import { rng, Slider, Stat } from "./util";

const FS = 256, N = 2048;   // 8 s at 256 Hz

/** Power spectrum of a simulated field potential: a 1/f background plus an alpha rhythm, by periodogram or Welch's method. */
export function PowerSpectrum() {
  const [chi, setChi] = useState(1.5);
  const [alpha, setAlpha] = useState(0.6);
  const [segs, setSegs] = useState(8);
  const base = useMemo(() => {
    const r = rng(1929), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
    return { white: Array.from({ length: N }, g), phases: Array.from({ length: N }, () => 2 * Math.PI * r()), jitter: Array.from({ length: N }, g) };
  }, []);
  const x = useMemo(() => {
    // Shape white noise in the frequency domain to get power proportional to 1/f^chi.
    const re = [...base.white], im = new Array(N).fill(0);
    fft(re, im);
    for (let k = 0; k < N; k++) { const fk = Math.min(k, N - k) * FS / N; const s = fk < 0.5 ? 0 : Math.pow(fk, -chi / 2); re[k] *= s; im[k] *= -s; }
    fft(re, im);   // inverse up to scale and conjugation
    const bg = re.map((v) => v / N);
    const sd = Math.sqrt(bg.reduce((a, v) => a + v * v, 0) / N) || 1;
    let ph = 0;
    return bg.map((v, i) => { ph += 2 * Math.PI * (10 + 0.8 * base.jitter[i] * 0.3) / FS; return v / sd + alpha * 2 * Math.sin(ph) + 0.05 * base.white[(i * 7) % N]; });
  }, [base, chi, alpha]);
  const spec = useMemo(() => {
    const L = N / segs; let acc: number[] | null = null; let f: number[] = [];
    const step = L / 2, count = Math.max(1, Math.floor((N - L) / step) + 1);
    for (let s = 0; s < count; s++) { const pg = periodogram(x.slice(s * step, s * step + L), FS); f = pg.f; acc = acc ? acc.map((v, i) => v + pg.p[i] / count) : pg.p.map((v) => v / count); }
    return { f, p: acc! };
  }, [x, segs]);
  const W = 540, H = 240, lx = (f: number) => 40 + (Math.log10(f) / Math.log10(128)) * (W - 60);
  const pv = spec.p.slice(1), lo = Math.log10(Math.min(...pv)), hi = Math.log10(Math.max(...pv));
  const ly = (p: number) => 20 + ((hi - Math.log10(p)) / (hi - lo || 1)) * (H - 50);
  const res = FS / (N / segs);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Power spectrum on log-log axes">
        {[1, 2, 5, 10, 20, 50, 100].map((f) => <g key={f}><line x1={lx(f)} x2={lx(f)} y1="15" y2={H - 28} stroke="var(--line)" /><text x={lx(f)} y={H - 14} fontSize="9" textAnchor="middle" fill="var(--ink-3)">{f}</text></g>)}
        <polyline points={spec.f.slice(1).map((f, i) => `${lx(f)},${ly(pv[i])}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="1.8" />
        <line x1={lx(10)} x2={lx(10)} y1="15" y2={H - 28} stroke="var(--neuro)" strokeDasharray="3 3" />
        <text x={W / 2} y={H - 2} fontSize="10" textAnchor="middle" fill="var(--ink-3)">frequency (Hz, log scale); power on a log scale</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="aperiodic exponent χ (1/f^χ)" value={chi} min={0} max={3} step={0.1} onChange={setChi} fmt={(v) => v.toFixed(1)} />
        <Slider label="alpha amplitude" value={alpha} min={0} max={1.5} step={0.05} onChange={setAlpha} fmt={(v) => v.toFixed(2)} />
        <Slider label="Welch segments" value={segs} min={1} max={32} step={1} onChange={(v) => setSegs([1, 2, 4, 8, 16, 32].reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a)))} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="frequency resolution" value={`${res.toFixed(3)} Hz`} />
        <Stat label="segments averaged (50% overlap)" value={String(Math.max(1, 2 * segs - 1))} />
      </div>
      <p className="text-sm text-ink-2">Eight seconds of a simulated field potential: a 1/f^χ background plus a 10 Hz alpha rhythm (dashed line). With one segment the spectrum is extremely noisy; averaging over more, shorter segments (Welch's method) smooths it at the cost of frequency resolution. On log-log axes the background is a straight line of slope −χ, and the rhythm is a bump on top of it.</p>
    </div>
  );
}
