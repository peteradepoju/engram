"use client";

import Link from "next/link";
import { useState } from "react";

type Node = { id: string; label: string; weeks: number[]; x: number; y: number; ideas: string[] };
const NODES: Node[] = [
  { id: "py", label: "Python", weeks: [2, 3], x: 60, y: 30, ideas: ["Arrays, shapes and broadcasting", "Vectorised code instead of loops", "Plots, pandas, Git, reproducibility"] },
  { id: "la", label: "Linear algebra", weeks: [4, 5, 6, 7], x: 180, y: 30, ideas: ["Dot products as tuning and projection", "Matrices as maps; least squares; ridge", "Eigenvalues; SVD; PCA"] },
  { id: "calc", label: "Calculus", weeks: [8, 9, 10], x: 300, y: 30, ideas: ["Derivatives, gradients, chain rule", "Jacobians, Hessians, Taylor", "Integrals and convolution"] },
  { id: "four", label: "Fourier", weeks: [11], x: 300, y: 110, ideas: ["Spectra and phasors", "DFT, aliasing, Welch", "Filters; convolution theorem"] },
  { id: "opt", label: "Optimisation", weeks: [12, 13], x: 180, y: 110, ideas: ["Gradient descent; step size below 2/λmax", "Momentum and Adam", "Lagrange multipliers, sparsity"] },
  { id: "prob", label: "Probability", weeks: [15, 16], x: 60, y: 110, ideas: ["Distributions, Poisson spikes, CLT", "Bayes' rule, cue combination", "The multivariate Gaussian"] },
  { id: "stat", label: "Statistics", weeks: [17, 18], x: 60, y: 190, ideas: ["MLE, MAP, Fisher information", "Bias and variance", "Permutation, bootstrap, FDR"] },
  { id: "bayes", label: "Bayes and information", weeks: [19, 20], x: 180, y: 190, ideas: ["Conjugacy, MCMC, variational inference", "Entropy and mutual information", "KL divergence, efficient coding"] },
  { id: "dyn", label: "Dynamics", weeks: [21, 22, 23], x: 300, y: 190, ideas: ["ODEs, the membrane, solvers", "Fixed points, phase plane, attractors", "Bifurcations, oscillation, chaos"] },
  { id: "stoch", label: "Stochastic", weeks: [24], x: 240, y: 260, ideas: ["Random walks, first passage", "Markov chains, drift diffusion", "OU, Langevin, diffusion models"] },
  { id: "proj", label: "Project", weeks: [25], x: 110, y: 260, ideas: ["PCA of a real population", "Fitting dynamics, jPCA", "Controls and robustness"] },
];
const EDGES: [string, string][] = [["py", "la"], ["la", "calc"], ["calc", "four"], ["calc", "opt"], ["la", "opt"], ["prob", "stat"], ["stat", "bayes"], ["opt", "stat"], ["la", "dyn"], ["calc", "dyn"], ["dyn", "stoch"], ["prob", "stoch"], ["la", "proj"], ["dyn", "proj"], ["stat", "proj"], ["four", "dyn"], ["prob", "bayes"]];

/** A map of Part 1: the topics, how they depend on each other, and where to revisit each. */
export function PartOneMap() {
  const [sel, setSel] = useState("la");
  const node = NODES.find((n) => n.id === sel)!;
  const near = new Set(EDGES.filter((e) => e.includes(sel)).flat());
  const at = (id: string) => NODES.find((n) => n.id === id)!;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 290" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Map of the topics of Part 1 and their connections">
        {EDGES.map(([a, b], i) => <line key={i} x1={at(a).x} y1={at(a).y} x2={at(b).x} y2={at(b).y} stroke={a === sel || b === sel ? "var(--accent)" : "var(--line)"} strokeWidth={a === sel || b === sel ? 2 : 1} />)}
        {NODES.map((n) => (
          <g key={n.id} onClick={() => setSel(n.id)} style={{ cursor: "pointer" }}>
            <rect x={n.x - 52} y={n.y - 14} width="104" height="28" rx="14" fill={n.id === sel ? "var(--accent)" : "var(--surface)"} stroke={near.has(n.id) ? "var(--accent)" : "var(--line)"} />
            <text x={n.x} y={n.y + 4} fontSize="10.5" textAnchor="middle" fill={n.id === sel ? "#fff" : "var(--ink)"}>{n.label}</text>
          </g>
        ))}
      </svg>
      <div className="rounded-lg bg-surface-2 p-3 text-sm">
        <div className="font-semibold">{node.label} <span className="font-normal text-ink-3">(Week{node.weeks.length > 1 ? "s" : ""} {node.weeks.join(", ")})</span></div>
        <ul className="mt-1 list-disc pl-5 text-ink-2">{node.ideas.map((i) => <li key={i}>{i}</li>)}</ul>
        <div className="mt-2 flex flex-wrap gap-2">{node.weeks.map((w) => <Link key={w} className="btn !py-1" href={`/learn/w${String(w).padStart(3, "0")}/d1`}>Revisit Week {w}</Link>)}</div>
      </div>
      <p className="text-sm text-ink-2">Tap a topic to see its key ideas and the topics it connects to. The edges show where one topic is used by another: linear algebra underlies almost everything, calculus feeds optimisation and dynamics, and probability feeds statistics, information and stochastic processes. The project drew on all three strands.</p>
    </div>
  );
}
