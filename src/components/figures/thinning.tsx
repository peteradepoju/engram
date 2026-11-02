"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Lewis and Shedler's thinning: simulate a time-varying Poisson process by accepting candidates from a faster homogeneous one. */
export function Thinning() {
  const [depth, setDepth] = useState(0.8);
  const [freq, setFreq] = useState(2);
  const [seed, setSeed] = useState(1);
  const base = 20, lmax = base * (1 + depth), T = 2;
  const rate = (t: number) => base * (1 + depth * Math.sin(2 * Math.PI * freq * t));
  const { cand, trials } = useMemo(() => {
    const r = rng(seed * 101 + 9);
    const draw = () => { const out: { t: number; keep: boolean }[] = []; let t = 0; for (;;) { t += -Math.log(Math.max(r(), 1e-12)) / lmax; if (t > T) break; out.push({ t, keep: r() < rate(t) / lmax }); } return out; };
    const cand = draw();
    const trials = Array.from({ length: 40 }, () => draw().filter((e) => e.keep).map((e) => e.t));
    return { cand, trials };
  }, [depth, freq, seed]);
  const W = 540, H = 314, X = (t: number) => 30 + (t / T) * (W - 50);
  const yr = (v: number) => 110 - (v / (base * 2.1)) * 90;
  const nb = 40, psth = new Array(nb).fill(0);
  trials.forEach((tr) => tr.forEach((t) => { psth[Math.min(nb - 1, Math.floor((t / T) * nb))]++; }));
  const curve = Array.from({ length: 201 }, (_, i) => { const t = (i / 200) * T; return `${X(t)},${yr(rate(t))}`; }).join(" ");
  const kept = cand.filter((c) => c.keep).length;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Thinning a homogeneous Poisson process into a time-varying one">
        {psth.map((c, b) => { const v = c / (trials.length * (T / nb)); return <rect key={b} x={X((b * T) / nb)} y={yr(v)} width={(W - 50) / nb - 1} height={110 - yr(v)} fill="var(--ai)" opacity="0.35" />; })}
        <line x1="30" x2={W - 20} y1={yr(lmax)} y2={yr(lmax)} stroke="var(--ink-3)" strokeDasharray="4 3" />
        <polyline points={curve} fill="none" stroke="var(--neuro)" strokeWidth="2.5" />
        <text x={W - 22} y={yr(lmax) - 4} fontSize="10" textAnchor="end" fill="var(--ink-3)">λmax</text>
        <text x="34" y="14" fontSize="10" fill="var(--neuro)">rate λ(t), with the PSTH of 40 thinned trials (blue)</text>
        {cand.map((c, i) => (
          <circle key={i} cx={X(c.t)} cy={140} r="3" fill={c.keep ? "var(--neuro)" : "none"} stroke={c.keep ? "var(--neuro)" : "var(--ink-3)"} />
        ))}
        <text x="34" y="128" fontSize="10" fill="var(--ink-3)">one trial: candidates at rate λmax (open: rejected, filled: kept)</text>
        {trials.slice(0, 20).map((tr, j) => tr.map((t, i) => <line key={`${j}-${i}`} x1={X(t)} x2={X(t)} y1={160 + j * 6.5} y2={165 + j * 6.5} stroke="var(--ink)" strokeWidth="1.2" />))}
        <text x="34" y={H - 4} fontSize="10" fill="var(--ink-3)">0 to {T} s; raster of 20 thinned trials</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="modulation depth" value={depth} min={0} max={1} step={0.05} onChange={setDepth} fmt={(v) => v.toFixed(2)} />
        <Slider label="modulation frequency" value={freq} min={0.5} max={6} step={0.5} onChange={setFreq} unit="Hz" />
        <button className="btn !py-1.5 self-end" onClick={() => setSeed(seed + 1)}>New spikes</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="candidates kept on this trial" value={`${kept} of ${cand.length}`} />
        <Stat label="expected fraction kept" value={(base / lmax).toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">To simulate spikes from a rate that changes in time, first draw candidate events from a constant-rate Poisson process at the peak rate λmax, then keep each candidate at time t with probability λ(t)/λmax. The kept events form exactly a Poisson process with rate λ(t): the peri-stimulus time histogram (blue) follows the pink curve. The method wastes the rejected candidates, more of them the deeper the modulation.</p>
    </div>
  );
}
