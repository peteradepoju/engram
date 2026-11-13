"use client";

import Link from "next/link";
import { useState } from "react";

type Node = { id: string; label: string; weeks: number[]; x: number; y: number; ideas: string[] };
const NODES: Node[] = [
  { id: "brain", label: "The brain", weeks: [28], x: 60, y: 28, ideas: ["Scales from molecules to behaviour", "Areas, layers and cell types", "Electrodes, imaging, fMRI and EEG"] },
  { id: "mem", label: "Membranes", weeks: [29, 30], x: 180, y: 28, ideas: ["Nernst and GHK potentials; the RC membrane", "Hodgkin-Huxley gates and currents", "Voltage clamp and channel noise"] },
  { id: "neur", label: "Neuron models", weeks: [31, 32], x: 300, y: 28, ideas: ["LIF, AdEx, Izhikevich, FitzHugh-Nagumo", "Cable theory and compartments", "Dendritic nonlinearities"] },
  { id: "syn", label: "Synapses", weeks: [33], x: 300, y: 100, ideas: ["Conductance-based synapses", "Short-term depression and facilitation", "Neuromodulation"] },
  { id: "code", label: "Coding", weeks: [34, 35], x: 180, y: 100, ideas: ["Spike trains, PSTHs, Fano factors", "LNP models and Poisson GLMs", "Spike-triggered analysis"] },
  { id: "dec", label: "Decoding and data", weeks: [36, 37], x: 60, y: 100, ideas: ["Population vectors and Bayesian decoders", "Fisher information and the Kalman filter", "NWB, DANDI, quality control, nesting"] },
  { id: "sens", label: "Senses", weeks: [38, 39], x: 60, y: 172, ideas: ["Retina to V1 to the ventral stream", "Hearing, smell, touch", "Efficient coding and whitening"] },
  { id: "motor", label: "Motor and plasticity", weeks: [41, 42], x: 180, y: 172, ideas: ["Optimal feedback control, forward models", "Hebb, STDP, BCM", "Homeostasis and eligibility traces"] },
  { id: "memory", label: "Memory", weeks: [43], x: 300, y: 172, ideas: ["Place cells, grid cells, attractors", "Pattern separation and completion", "Replay and consolidation"] },
  { id: "rew", label: "Reward and decisions", weeks: [44, 45], x: 300, y: 244, ideas: ["Rescorla-Wagner, TD errors, dopamine", "Bandits and Q-learning", "Evidence accumulation and confidence"] },
  { id: "cog", label: "Cognition", weeks: [46, 47, 48, 49], x: 180, y: 244, ideas: ["Working memory, attention, PFC", "Oscillations and brain states", "Perception as inference; networks; language"] },
  { id: "beh", label: "Behaviour and project", weeks: [50, 51], x: 60, y: 244, ideas: ["Recovery, falsification, group comparison", "DDM likelihoods and GLM-HMMs", "Models of the prior in IBL mice"] },
];
const EDGES: [string, string][] = [["brain", "mem"], ["mem", "neur"], ["neur", "syn"], ["syn", "code"], ["code", "dec"], ["dec", "sens"], ["code", "sens"], ["sens", "motor"], ["syn", "motor"], ["motor", "memory"], ["memory", "rew"], ["rew", "cog"], ["cog", "beh"], ["rew", "beh"], ["dec", "beh"], ["memory", "cog"], ["neur", "cog"]];

/** A map of Part 2: from membranes to behaviour, with links back to each week. */
export function PartTwoMap() {
  const [sel, setSel] = useState("code");
  const node = NODES.find((n) => n.id === sel)!;
  const near = new Set(EDGES.filter((e) => e.includes(sel)).flat());
  const at = (id: string) => NODES.find((n) => n.id === id)!;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 270" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Map of the topics of Part 2 and their connections">
        {EDGES.map(([a, b], i) => <line key={i} x1={at(a).x} y1={at(a).y} x2={at(b).x} y2={at(b).y} stroke={a === sel || b === sel ? "var(--accent)" : "var(--line)"} strokeWidth={a === sel || b === sel ? 2 : 1} />)}
        {NODES.map((n) => (
          <g key={n.id} onClick={() => setSel(n.id)} style={{ cursor: "pointer" }}>
            <rect x={n.x - 55} y={n.y - 14} width="110" height="28" rx="14" fill={n.id === sel ? "var(--accent)" : "var(--surface)"} stroke={near.has(n.id) ? "var(--accent)" : "var(--line)"} />
            <text x={n.x} y={n.y + 4} fontSize="9.5" textAnchor="middle" fill={n.id === sel ? "#fff" : "var(--ink)"}>{n.label}</text>
          </g>
        ))}
      </svg>
      <div className="rounded-lg bg-surface-2 p-3 text-sm">
        <div className="font-semibold">{node.label} <span className="font-normal text-ink-3">(Week{node.weeks.length > 1 ? "s" : ""} {node.weeks.join(", ")})</span></div>
        <ul className="mt-1 list-disc pl-5 text-ink-2">{node.ideas.map((i) => <li key={i}>{i}</li>)}</ul>
        <div className="mt-2 flex flex-wrap gap-2">{node.weeks.map((w) => <Link key={w} className="btn !py-1" href={`/learn/w${String(w).padStart(3, "0")}/d1`}>Revisit Week {w}</Link>)}</div>
      </div>
      <p className="text-sm text-ink-2">Part 2 climbs from ions to behaviour. Each level is built from the one before: membranes make neurons, synapses connect them, codes are read by decoders, and circuits for sensing, moving, remembering and deciding are finally tested against what animals do.</p>
    </div>
  );
}
