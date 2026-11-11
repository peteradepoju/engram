"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

function gauss(r: () => number) { return Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r()); }

/** First-spike latencies of two cells (A: 40 - 6s ms, B: 22 + 6s ms, 3 ms private jitter) with a shared onset jitter; decoding accuracy from A alone and from B - A. */
export function LatencyCode() {
  const [s, setS] = useState(1);
  const [jit, setJit] = useState(15);
  const { trials, acc } = useMemo(() => {
    const r = rng(2008);
    const gen = (st: number) => { const on = jit * gauss(r); return { a: 40 - 6 * st + 3 * gauss(r) + on, b: 22 + 6 * st + 3 * gauss(r) + on }; };
    const trials = Array.from({ length: 16 }, () => gen(s));
    // decoding accuracy with known class means (train set large)
    const meansA = [0, 1, 2, 3].map((k) => 40 - 6 * k), meansD = [0, 1, 2, 3].map((k) => -18 + 12 * k);
    let okA = 0, okD = 0, n = 0;
    for (let k = 0; k < 4; k++) for (let i = 0; i < 150; i++) {
      const t = gen(k), d = t.b - t.a;
      const pa = meansA.reduce((bi, m, j) => (Math.abs(t.a - m) < Math.abs(t.a - meansA[bi]) ? j : bi), 0);
      const pd = meansD.reduce((bi, m, j) => (Math.abs(d - m) < Math.abs(d - meansD[bi]) ? j : bi), 0);
      okA += +(pa === k); okD += +(pd === k); n++;
    }
    return { trials, acc: { abs: okA / n, rel: okD / n } };
  }, [s, jit]);
  const W = 360, H = 210, x0 = 20, x1 = 350;
  const X = (t: number) => x0 + ((t + 20) / 100) * (x1 - x0);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="First-spike times of two cells across trials">
        {[0, 20, 40, 60].map((t) => <g key={t}><line x1={X(t)} x2={X(t)} y1="10" y2={H - 20} stroke="var(--line)" /><text x={X(t)} y={H - 6} fontSize="9" textAnchor="middle" fill="var(--ink-3)">{t} ms</text></g>)}
        {trials.map((t, i) => (
          <g key={i}>
            <line x1={X(t.a)} x2={X(t.b)} y1={16 + i * 11} y2={16 + i * 11} stroke="var(--ink-3)" strokeWidth="0.8" />
            <circle cx={X(t.a)} cy={16 + i * 11} r="3.2" fill="var(--neuro)" />
            <circle cx={X(t.b)} cy={16 + i * 11} r="3.2" fill="var(--ai)" />
          </g>
        ))}
        <text x={x1} y="12" fontSize="9" textAnchor="end" fill="var(--neuro)">cell A</text>
        <text x={x1} y="24" fontSize="9" textAnchor="end" fill="var(--ai)">cell B</text>
      </svg>
      <Slider label="stimulus (0 to 3)" value={s} min={0} max={3} step={1} onChange={setS} />
      <Slider label="onset jitter (sd)" value={jit} min={0} max={30} step={1} onChange={setJit} unit="ms" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="decoding from A's latency" value={`${Math.round(acc.abs * 100)}%`} />
        <Stat label="decoding from B - A" value={`${Math.round(acc.rel * 100)}%`} />
      </div>
      <p className="text-sm text-ink-2">Each row is one trial. Changing the stimulus moves cell A earlier and cell B later, so the gap between them changes. Onset jitter slides both dots together along the row: the absolute times scatter, but the gap, and with it the decodable information, is untouched. Chance is 25%.</p>
    </div>
  );
}
