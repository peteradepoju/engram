"use client";

import { useState } from "react";

const EXAMPLES = [
  { id: "cnn", dir: "n2a", title: "Receptive fields to CNNs",
    text: "Hubel and Wiesel found cells in cat visual cortex that respond to oriented edges in small patches, arranged in a hierarchy. Fukushima's Neocognitron (1980) and later LeCun's convolutional networks copied that design: local filters, shared weights, layers of increasing complexity." },
  { id: "td", dir: "a2n", title: "TD learning to dopamine",
    text: "Sutton's temporal-difference learning came from machine learning. In the 1990s Schultz, Dayan and Montague showed that dopamine neurons fire like a TD prediction error: more when a reward is better than expected, less when it is worse." },
  { id: "hopfield", dir: "n2a", title: "Memory as attractors",
    text: "Hopfield (1982) modelled memory as stable patterns of activity in a recurrent network, inspired by how neurons store associations. The idea fed into modern associative memory and has links to Transformer attention." },
  { id: "replay", dir: "n2a", title: "Hippocampal replay to experience replay",
    text: "Rats replay sequences of place-cell activity during rest and sleep. DeepMind's DQN (2015) stored past experiences and replayed them while learning, which made training stable." },
  { id: "dnnbrain", dir: "a2n", title: "Deep networks as models of the brain",
    text: "Yamins, DiCarlo and colleagues (2014) showed that networks trained to recognise objects predict neural responses in monkey visual cortex better than models built by hand. AI became a tool for building theories of the brain." },
  { id: "tools", dir: "a2n", title: "AI as a tool for neuroscience",
    text: "Deep learning now tracks animal poses from video, sorts spikes, segments neurons in electron microscopy images and decodes speech from brain activity for people who cannot speak." },
];

/** The virtuous cycle: ideas flow from brains to machines and back. Click an example. */
export function VirtuousCycle() {
  const [sel, setSel] = useState(EXAMPLES[0].id);
  const ex = EXAMPLES.find((e) => e.id === sel)!;
  return (
    <div className="space-y-4">
      <svg viewBox="0 0 600 220" className="w-full" role="img" aria-label="Neuroscience and AI exchange ideas in both directions">
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-2)" />
          </marker>
        </defs>
        <rect x="20" y="70" width="170" height="80" rx="14" fill="var(--neuro-soft)" stroke="var(--neuro)" />
        <text x="105" y="105" textAnchor="middle" fontWeight="700" fill="var(--neuro)" fontSize="16">Neuroscience</text>
        <text x="105" y="127" textAnchor="middle" fill="var(--ink-2)" fontSize="12">how brains compute</text>
        <rect x="410" y="70" width="170" height="80" rx="14" fill="var(--ai-soft)" stroke="var(--ai)" />
        <text x="495" y="105" textAnchor="middle" fontWeight="700" fill="var(--ai)" fontSize="16">AI</text>
        <text x="495" y="127" textAnchor="middle" fill="var(--ink-2)" fontSize="12">how machines learn</text>
        <path d="M190,90 C280,20 320,20 410,90" fill="none" stroke={ex.dir === "n2a" ? "var(--neuro)" : "var(--ink-3)"} strokeWidth={ex.dir === "n2a" ? 3 : 1.5} markerEnd="url(#arr)" />
        <text x="300" y="34" textAnchor="middle" fontSize="12" fill="var(--ink-2)">inspiration: architectures, learning rules, inductive biases</text>
        <path d="M410,130 C320,200 280,200 190,130" fill="none" stroke={ex.dir === "a2n" ? "var(--ai)" : "var(--ink-3)"} strokeWidth={ex.dir === "a2n" ? 3 : 1.5} markerEnd="url(#arr)" />
        <text x="300" y="200" textAnchor="middle" fontSize="12" fill="var(--ink-2)">models, theories and tools for studying the brain</text>
      </svg>
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((e) => (
          <button key={e.id} onClick={() => setSel(e.id)}
            className={`chip !py-1.5 !text-[0.82rem] ${sel === e.id ? (e.dir === "n2a" ? "!bg-neuro !text-white" : "!bg-ai !text-white") : ""}`}>
            {e.dir === "n2a" ? "Brain → AI" : "AI → Brain"}: {e.title}
          </button>
        ))}
      </div>
      <div className="rounded-lg bg-surface-2 p-4 text-[0.97rem]">
        <div className="font-semibold">{ex.title}</div>
        <p className="mt-1 text-ink-2">{ex.text}</p>
      </div>
    </div>
  );
}
