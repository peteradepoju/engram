"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Cross-temporal decoding of a population code that mixes a stable and a rotating component. */
export function CrossTemporal() {
  const [stable, setStable] = useState(0.5);
  const [speed, setSpeed] = useState(1.5);
  const N = 40, T = 16, n = 60;
  const A = useMemo(() => {
    const r = rng(2015), g = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
    const ms = Array.from({ length: N }, g), m1 = Array.from({ length: N }, g), m2 = Array.from({ length: N }, g);
    const pat = Array.from({ length: T }, (_, t) => {
      const ph = (2 * Math.PI * t * speed) / T;
      return ms.map((v, i) => 0.3 * (stable * v + (1 - stable) * (Math.cos(ph) * m1[i] + Math.sin(ph) * m2[i])));
    });
    const make = () => Array.from({ length: 2 * n }, (_, k) => {
      const lab = k < n ? 1 : -1;
      return { lab, x: pat.map((p) => p.map((v) => lab * v + g())) };
    });
    const tr = make(), te = make();
    const M: number[][] = [];
    for (let t1 = 0; t1 < T; t1++) {
      const w = new Array(N).fill(0);
      tr.forEach((tri) => tri.x[t1].forEach((v, i) => (w[i] += (tri.lab * v) / n)));
      M.push(Array.from({ length: T }, (_, t2) => te.filter((tei) => Math.sign(tei.x[t2].reduce((s, v, i) => s + v * w[i], 0)) === tei.lab).length / (2 * n)));
    }
    return M;
  }, [stable, speed]);
  const c = 9.5, ox = 100, oy = 8;
  let far = 0, cnt = 0, diag = 0;
  A.forEach((row, i) => row.forEach((v, j) => { if (Math.abs(i - j) >= 6) { far += v; cnt++; } if (i === j) diag += v / T; }));
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 172" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Cross-temporal decoding matrix">
        {A.map((row, i) => row.map((v, j) => <rect key={`${i}-${j}`} x={ox + j * c} y={oy + (T - 1 - i) * c} width={c + 0.2} height={c + 0.2} fill="var(--ai)" opacity={Math.max(0, (v - 0.5) * 2)} />))}
        <rect x={ox} y={oy} width={T * c} height={T * c} fill="none" stroke="var(--line)" />
        <text x={ox + (T * c) / 2} y={oy + T * c + 12} fontSize="8" textAnchor="middle" fill="var(--ink-3)">test time</text>
        <text x={ox - 6} y={oy + (T * c) / 2} fontSize="8" textAnchor="end" fill="var(--ink-3)">train time</text>
      </svg>
      <Slider label="weight of the stable component" value={stable} min={0} max={1} step={0.05} onChange={setStable} fmt={(v) => v.toFixed(2)} />
      <Slider label="cycles of rotation over the delay" value={speed} min={0} max={3} step={0.25} onChange={setSpeed} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="accuracy on the diagonal" value={diag.toFixed(2)} />
        <Stat label="accuracy for long gaps" value={(far / cnt).toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">With the stable weight at 1 the matrix is a solid block; at 0 only a narrow band along the diagonal remains, though every time bin can still be decoded. Slow the rotation and the band widens.</p>
    </div>
  );
}
