"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Error on old items while a linear network learns new ones, with a chosen amount of replay. */
export function InterferenceReplay() {
  const [frac, setFrac] = useState(0);
  const D = 20, O = 5, n = 10, eta = 0.01, epochs = 150;
  const data = useMemo(() => {
    const r = rng(1995);
    const g = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
    const mk = (rows: number, cols: number) => Array.from({ length: rows }, () => Array.from({ length: cols }, g));
    return { XA: mk(n, D), YA: mk(n, O), XB: mk(n, D), YB: mk(n, O) };
  }, []);
  const curves = useMemo(() => {
    const r = rng(7);
    const W = Array.from({ length: D }, () => new Array(O).fill(0));
    const step = (x: number[], y: number[]) => {
      const out = new Array(O).fill(0);
      for (let i = 0; i < D; i++) for (let o = 0; o < O; o++) out[o] += x[i] * W[i][o];
      for (let i = 0; i < D; i++) for (let o = 0; o < O; o++) W[i][o] += eta * x[i] * (y[o] - out[o]);
    };
    const err = (X: number[][], Y: number[][]) => {
      let s = 0;
      X.forEach((x, k) => { for (let o = 0; o < O; o++) { let p = 0; for (let i = 0; i < D; i++) p += x[i] * W[i][o]; s += (p - Y[k][o]) ** 2; } });
      return s / (X.length * O);
    };
    for (let e = 0; e < 300; e++) data.XA.forEach((x, k) => step(x, data.YA[k]));
    const ea: number[] = [], eb: number[] = [];
    for (let e = 0; e < epochs; e++) {
      data.XB.forEach((x, k) => {
        step(x, data.YB[k]);
        if (r() < frac) { const j = Math.floor(r() * n); step(data.XA[j], data.YA[j]); }
      });
      ea.push(err(data.XA, data.YA)); eb.push(err(data.XB, data.YB));
    }
    return { ea, eb };
  }, [frac, data]);
  const W = 360, H = 170, sx = (e: number) => 30 + (e / epochs) * 310, sy = (v: number) => 15 + (1 - Math.min(v, 1.5) / 1.5) * (H - 40);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Interference and replay">
        <line x1="30" x2="340" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        <polyline points={curves.ea.map((v, e) => `${sx(e)},${sy(v)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <polyline points={curves.eb.map((v, e) => `${sx(e)},${sy(v)}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <text x="336" y={sy(curves.ea[epochs - 1]) - 4} fontSize="8" textAnchor="end" fill="var(--neuro)">error on old set A</text>
        <text x="336" y={sy(0) - 4} fontSize="8" textAnchor="end" fill="var(--ai)">error on new set B</text>
        <text x="185" y={H - 6} fontSize="8" textAnchor="middle" fill="var(--ink-3)">epochs of training on B</text>
      </svg>
      <Slider label="replayed A items per B item" value={frac} min={0} max={1} step={0.05} onChange={setFrac} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="final error on A" value={curves.ea[epochs - 1].toFixed(3)} />
        <Stat label="final error on B" value={curves.eb[epochs - 1].toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">The network has learned set A perfectly before training on B begins. Without replay, error on A climbs to the level of an untrained network; a small fraction of replayed A items keeps it low while B is still learned.</p>
    </div>
  );
}
