"use client";

import { useState } from "react";
import { rng, Slider } from "./util";

type Opt = { name: string; colour: string };
const OPTS: Opt[] = [
  { name: "SGD", colour: "var(--ai)" }, { name: "momentum", colour: "var(--warn)" },
  { name: "RMSProp", colour: "var(--good)" }, { name: "Adam", colour: "var(--neuro)" },
];

/** Four optimisers on a badly scaled loss whose two weights differ in curvature by a factor of 100. */
export function OptimiserRace() {
  const [lr, setLr] = useState(0.1);
  const [noise, setNoise] = useState(0.5);
  const grad = (x: number, y: number): [number, number] => [0.02 * x, 2 * y];   // curvatures 0.02 and 2
  const paths = OPTS.map((o, oi) => {
    const r = rng(7 + oi);
    let x = -3, y = 2, mx = 0, my = 0, vx = 0, vy = 0; const pts = [[x, y]];
    for (let k = 1; k <= 150; k++) {
      let [gx, gy] = grad(x, y);
      gx += noise * 0.05 * (r() - 0.5); gy += noise * 1.0 * (r() - 0.5);
      if (o.name === "SGD") { x -= lr * gx; y -= lr * gy * 0.45; }
      if (o.name === "momentum") { mx = 0.9 * mx + gx; my = 0.9 * my + gy; x -= lr * 0.1 * mx; y -= lr * 0.045 * my; }
      if (o.name === "RMSProp") { vx = 0.9 * vx + 0.1 * gx * gx; vy = 0.9 * vy + 0.1 * gy * gy; x -= lr * gx / (Math.sqrt(vx) + 1e-8); y -= lr * gy / (Math.sqrt(vy) + 1e-8); }
      if (o.name === "Adam") {
        mx = 0.9 * mx + 0.1 * gx; my = 0.9 * my + 0.1 * gy; vx = 0.999 * vx + 0.001 * gx * gx; vy = 0.999 * vy + 0.001 * gy * gy;
        const bc1 = 1 - 0.9 ** k, bc2 = 1 - 0.999 ** k;
        x -= lr * (mx / bc1) / (Math.sqrt(vx / bc2) + 1e-8); y -= lr * (my / bc1) / (Math.sqrt(vy / bc2) + 1e-8);
      }
      if (Math.abs(x) > 50 || Math.abs(y) > 50) break;
      pts.push([x, y]);
    }
    return pts;
  });
  const W = 540, H = 220, X = (x: number) => 40 + ((x + 3.5) / 7) * (W - 60), Y = (y: number) => H / 2 - y * 45;
  const loss = (p: number[]) => 0.01 * p[0] ** 2 + p[1] ** 2;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Paths of four optimisers">
        <defs><clipPath id="orc"><rect width={W} height={H} /></clipPath></defs>
        <g clipPath="url(#orc)">
          {[0.05, 0.2, 0.5, 1, 2].map((c) => <ellipse key={c} cx={X(0)} cy={Y(0)} rx={Math.sqrt(c / 0.01) * (W - 60) / 7} ry={Math.sqrt(c) * 45} fill="none" stroke="var(--line)" />)}
          {paths.map((pts, i) => <polyline key={i} points={pts.map((p) => `${X(p[0])},${Y(p[1])}`).join(" ")} fill="none" stroke={OPTS[i].colour} strokeWidth="1.8" />)}
          <circle cx={X(0)} cy={Y(0)} r="5" fill="none" stroke="var(--ink)" strokeWidth="2" />
        </g>
      </svg>
      <div className="flex flex-wrap gap-3 text-sm">
        {OPTS.map((o, i) => <span key={o.name} style={{ color: o.colour }}>● {o.name}: loss {paths[i].length < 151 ? "diverged" : loss(paths[i][paths[i].length - 1]).toExponential(1)}</span>)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="learning rate (scaled per method)" value={lr} min={0.01} max={0.4} step={0.01} onChange={setLr} fmt={(v) => v.toFixed(2)} />
        <Slider label="gradient noise" value={noise} min={0} max={2} step={0.05} onChange={setNoise} fmt={(v) => v.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">The loss curves a hundred times more steeply across (vertical) than along (horizontal), with the minimum at the ring. Plain SGD and momentum must keep their step small enough for the steep direction and so crawl horizontally. RMSProp and Adam divide each coordinate's step by the size of its recent gradients, which equalises progress in both directions; Adam adds momentum and bias correction. With noisy gradients, adaptive steps also stay steady.</p>
    </div>
  );
}
