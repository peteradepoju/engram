"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Two-state ion channels, closed ⇄ open with rates α (opening) and β (closing). One channel flickers; many average out. */
export function MarkovChannel() {
  const [alpha, setAlpha] = useState(0.2);
  const [beta, setBeta] = useState(0.5);
  const [N, setN] = useState(50);
  const steps = 600, dt = 0.5;
  const { one, frac } = useMemo(() => {
    const r = rng(1981);
    const states = new Array(N).fill(0);
    const one: number[] = [], frac: number[] = [];
    for (let k = 0; k < steps; k++) {
      for (let i = 0; i < N; i++) {
        if (states[i] === 0 && r() < alpha * dt) states[i] = 1;
        else if (states[i] === 1 && r() < beta * dt) states[i] = 0;
      }
      one.push(states[0]); frac.push(states.reduce((a, b) => a + b, 0) / N);
    }
    return { one, frac };
  }, [alpha, beta, N]);
  const W = 360, H = 200, X = (k: number) => 20 + (k / steps) * (W - 66);
  const pOpen = alpha / (alpha + beta), tau = 1 / (alpha + beta);
  const meanFrac = frac.slice(100).reduce((a, b) => a + b, 0) / (steps - 100);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="One channel's open and closed record and the open fraction of many channels">
        <text x="20" y="14" fontSize="9" fill="var(--ink-3)">one channel</text>
        <polyline points={one.map((s, k) => `${X(k)},${60 - s * 36}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.3" />
        <text x={W - 12} y="26" fontSize="9" textAnchor="end" fill="var(--ink-3)">open</text>
        <text x={W - 12} y="62" fontSize="9" textAnchor="end" fill="var(--ink-3)">closed</text>
        <text x="20" y="92" fontSize="9" fill="var(--ink-3)">fraction open, {N} channels</text>
        <line x1="20" x2={W - 46} y1={H - 10} y2={H - 10} stroke="var(--line)" />
        <line x1="20" x2={W - 46} y1={H - 10 - pOpen * 90} y2={H - 10 - pOpen * 90} stroke="var(--ai)" strokeDasharray="4 3" />
        <polyline points={frac.map((f, k) => `${X(k)},${H - 10 - f * 90}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.5" />
      </svg>
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="opening rate α" value={alpha} min={0.02} max={1} step={0.01} onChange={setAlpha} unit="/ms" />
        <Slider label="closing rate β" value={beta} min={0.02} max={1} step={0.01} onChange={setBeta} unit="/ms" />
        <Slider label="number of channels" value={N} min={1} max={500} step={1} onChange={setN} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="P(open) = α/(α+β)" value={pOpen.toFixed(3)} />
        <Stat label="measured" value={meanFrac.toFixed(3)} />
        <Stat label="relaxation 1/(α+β)" value={`${tau.toFixed(1)} ms`} />
      </div>
      <p className="text-sm text-ink-2">A single ion channel jumps at random between closed and open, staying in each state for an exponentially distributed time: a Markov chain. With many channels, the fraction open fluctuates around α/(α+β), and the fluctuations shrink like 1/√N. In the limit the fraction obeys the smooth gating equation of the Hodgkin-Huxley model; with few channels, the noise is real and can make a neuron fire spontaneously.</p>
    </div>
  );
}
