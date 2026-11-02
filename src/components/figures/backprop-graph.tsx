"use client";

import { useState } from "react";
import { Slider } from "./util";

const sig = (z: number) => 1 / (1 + Math.exp(-z));

/** A two-neuron chain, its forward values and the gradients flowing back. */
export function BackpropGraph() {
  const [x, setX] = useState(1.0);
  const [w1, setW1] = useState(0.8);
  const [w2, setW2] = useState(-1.2);
  const y = 0.9;
  const z1 = w1 * x, h = sig(z1), z2 = w2 * h, out = sig(z2), L = 0.5 * (out - y) ** 2;
  const dout = out - y, dz2 = dout * out * (1 - out), dw2 = dz2 * h, dh = dz2 * w2, dz1 = dh * h * (1 - h), dw1 = dz1 * x;
  const nodes = [
    { k: "x", v: x, g: null, X: 50, Y: 70 }, { k: "w₁", v: w1, g: dw1, X: 50, Y: 150 },
    { k: "z₁ = w₁x", v: z1, g: dz1, X: 150, Y: 110 }, { k: "h = σ(z₁)", v: h, g: dh, X: 260, Y: 110 },
    { k: "w₂", v: w2, g: dw2, X: 260, Y: 200 }, { k: "z₂ = w₂h", v: z2, g: dz2, X: 370, Y: 150 },
    { k: "ŷ = σ(z₂)", v: out, g: dout, X: 480, Y: 150 }, { k: "L = ½(ŷ − y)²", v: L, g: 1, X: 590, Y: 150 },
  ];
  const edges = [[0, 2], [1, 2], [2, 3], [3, 5], [4, 5], [5, 6], [6, 7]];
  const fmt = (v: number) => v.toFixed(3);
  return (
    <div className="space-y-3">
      <svg viewBox="-10 0 690 240" className="w-full rounded-lg bg-surface-2" role="img" aria-label="Computational graph with forward values and backward gradients">
        {edges.map(([a, b], i) => <line key={i} x1={nodes[a].X + 30} y1={nodes[a].Y} x2={nodes[b].X - 30} y2={nodes[b].Y} stroke="var(--line)" strokeWidth="2" />)}
        {nodes.map((n) => (
          <g key={n.k}>
            <rect x={n.X - 46} y={n.Y - 26} width="92" height="52" rx="8" fill="var(--surface)" stroke="var(--line)" />
            <text x={n.X} y={n.Y - 10} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{n.k}</text>
            <text x={n.X} y={n.Y + 5} fontSize="11" textAnchor="middle" fill="var(--ai)">{fmt(n.v)}</text>
            {n.g !== null ? <text x={n.X} y={n.Y + 19} fontSize="11" textAnchor="middle" fill="var(--neuro)">∂L = {fmt(n.g)}</text> : null}
          </g>
        ))}
        <text x="330" y="232" fontSize="10" textAnchor="middle" fill="var(--ink-3)">blue: forward value · pink: gradient of the loss with respect to that quantity (target y = 0.9)</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="input x" value={x} min={-2} max={2} step={0.05} onChange={setX} fmt={(v) => v.toFixed(2)} />
        <Slider label="weight w₁" value={w1} min={-3} max={3} step={0.05} onChange={setW1} fmt={(v) => v.toFixed(2)} />
        <Slider label="weight w₂" value={w2} min={-3} max={3} step={0.05} onChange={setW2} fmt={(v) => v.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">The forward pass computes each blue value from left to right. The backward pass starts with ∂L/∂L = 1 at the right and moves left: each node's gradient is the gradient of the node after it times the local derivative between them. The pink numbers on w₁ and w₂ are what gradient descent uses: change each weight a little in the direction opposite to its gradient and the loss falls.</p>
    </div>
  );
}
