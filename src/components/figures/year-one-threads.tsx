"use client";

import { useState } from "react";

const TOOLS = ["Linear algebra", "Calculus and optimisation", "Probability and statistics", "Bayes and information", "Dynamics and stochastic processes"];
const LEVELS = ["Neurons and synapses", "Coding and decoding", "Senses, movement, memory", "Reward, decisions, cognition", "Behaviour and the project"];
const ROW_SHORT = ["Linear algebra", "Calculus, optimisation", "Probability, statistics", "Bayes, information", "Dynamics, stochastic"];
const COL_SHORT = ["Neurons", "Coding", "Systems", "Cognition", "Behaviour"];
// Where each Part 1 tool (rows) was used in each Part 2 level (columns).
const USES: string[][] = [
  ["Linear ODE systems for compartments (Week 32)", "Linear filters, STA and GLM design matrices (Week 35)", "Oja's rule finds an eigenvector; whitening (Weeks 39, 42)", "Normalisation and linear readouts of PFC (Week 46)", "Design matrices of history GLMs (Week 51)"],
  ["Hodgkin-Huxley as coupled ODEs fitted to clamp data (Week 30)", "Newton's method for Poisson GLMs (Week 35)", "Gradient descent in plasticity and motor learning (Weeks 41, 42)", "TD learning as stochastic gradient descent on prediction error (Week 44)", "Maximum likelihood fits of choice models (Weeks 50, 51)"],
  ["Channel noise (Week 29) and binomial transmitter release (Week 33)", "Poisson spikes and Fano factors (Week 34); goodness of fit (Week 35)", "Signal-dependent noise in movement (Week 41)", "Signal detection theory (Week 48)", "BIC, cross-validation, model recovery (Weeks 50, 51)"],
  ["Spike-timing reliability: how much timing can carry beyond rate (Week 31)", "Fisher information and Bayesian decoders (Week 36)", "Efficient coding and redundancy reduction (Week 39)", "Perception as inference, priors from psychophysics (Week 48)", "Bayesian block observer and random-effects selection (Week 51)"],
  ["Phase planes of reduced neurons (Week 31)", "Renewal and point processes (Week 34)", "Attractor networks for memory (Week 43)", "Drift diffusion and attractor decisions (Week 45)", "Hidden Markov models of strategy (Week 50)"],
];

/** Year 1 in one grid: how each Part 1 tool was used at each level of Part 2. */
export function YearOneThreads() {
  const [r, setR] = useState(2);
  const [c, setC] = useState(4);
  const cw = 50, ch = 30, x0 = 104, y0 = 26;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 185" className="mx-auto w-full max-w-[500px] rounded-lg bg-surface-2" role="img" aria-label="Grid of Part 1 tools against Part 2 topics">
        {COL_SHORT.map((l, j) => (
          <text key={l} x={x0 + j * cw + cw / 2} y={y0 - 8} fontSize="8.5" textAnchor="middle" fill={j === c ? "var(--accent)" : "var(--ink-2)"}>{l}</text>
        ))}
        {ROW_SHORT.map((t, i) => (
          <text key={t} x={x0 - 6} y={y0 + i * ch + ch / 2 + 3} fontSize="8.5" textAnchor="end" fill={i === r ? "var(--accent)" : "var(--ink-2)"}>{t}</text>
        ))}
        {TOOLS.map((_, i) => LEVELS.map((__, j) => (
          <rect key={`${i}-${j}`} x={x0 + j * cw + 2} y={y0 + i * ch + 2} width={cw - 4} height={ch - 4} rx="5"
            fill={i === r && j === c ? "var(--accent)" : i === r || j === c ? "var(--accent-soft)" : "var(--surface)"} stroke="var(--line)"
            style={{ cursor: "pointer" }} onClick={() => { setR(i); setC(j); }} />
        )))}
      </svg>
      <div className="rounded-lg bg-surface-2 p-3 text-sm">
        <div className="font-semibold">{TOOLS[r]} in {LEVELS[c].toLowerCase()}</div>
        <p className="mt-1 text-ink-2">{USES[r][c]}</p>
      </div>
      <p className="text-sm text-ink-2">Tap a cell. Every tool from Part 1 was used at every level of Part 2: the mathematics was never a separate subject, but the language in which each piece of neuroscience was stated and tested.</p>
    </div>
  );
}
