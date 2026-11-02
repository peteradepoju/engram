"use client";

import { useMemo, useState } from "react";
import { rng, Slider } from "./util";
import { Tex } from "../lesson/tex";

/** A psychometric curve: probability of choosing "right" against signed contrast, with bias, sensitivity and lapses. */
export function Psychometric() {
  const [bias, setBias] = useState(0);
  const [slope, setSlope] = useState(0.15);
  const [lapse, setLapse] = useState(0.05);
  const [seed, setSeed] = useState(1);
  const p = (c: number) => lapse + (1 - 2 * lapse) / (1 + Math.exp(-(c - bias) / slope));
  const levels = [-1, -0.5, -0.25, -0.125, -0.0625, 0, 0.0625, 0.125, 0.25, 0.5, 1];
  const data = useMemo(() => {
    const r = rng(seed * 31 + 7);
    return levels.map((c) => {
      let k = 0;
      for (let i = 0; i < 40; i++) if (r() < p(c)) k++;
      return { c, frac: k / 40 };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, bias, slope, lapse]);
  const X = (c: number) => 50 + ((c + 1) / 2) * 520, Y = (v: number) => 210 - v * 190;
  const curve = Array.from({ length: 201 }, (_, i) => -1 + i / 100).map((c, i) => `${i ? "L" : "M"}${X(c)},${Y(p(c))}`).join("");
  return (
    <div className="space-y-4">
      <svg viewBox="0 0 600 245" className="w-full" role="img" aria-label="Psychometric curve with simulated choices">
        <rect x="50" y="20" width="520" height="190" fill="var(--surface-2)" rx="4" />
        <line x1={X(0)} x2={X(0)} y1="20" y2="210" stroke="var(--line)" />
        <line x1="50" x2="570" y1={Y(0.5)} y2={Y(0.5)} stroke="var(--line)" />
        <path d={curve} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
        {data.map((d) => <circle key={d.c} cx={X(d.c)} cy={Y(d.frac)} r="4.5" fill="var(--neuro)" />)}
        {[-1, -0.5, 0, 0.5, 1].map((c) => <text key={c} x={X(c)} y="226" fontSize="11" textAnchor="middle" fill="var(--ink-2)">{c * 100}%</text>)}
        {[0, 0.5, 1].map((v) => <text key={v} x="44" y={Y(v) + 4} fontSize="11" textAnchor="end" fill="var(--ink-2)">{v}</text>)}
        <text x="310" y="242" fontSize="11" textAnchor="middle" fill="var(--ink-3)">signed contrast (negative = stimulus on the left)</text>
        <text x="14" y="115" fontSize="11" textAnchor="middle" fill="var(--ink-3)" transform="rotate(-90 14 115)">P(choose right)</text>
      </svg>
      <div className="grid gap-4 sm:grid-cols-3">
        <Slider label="Bias μ" value={bias} min={-0.5} max={0.5} step={0.01} onChange={setBias} fmt={(v) => v.toFixed(2)} />
        <Slider label="Threshold σ (lower is sharper)" value={slope} min={0.02} max={0.5} step={0.01} onChange={setSlope} fmt={(v) => v.toFixed(2)} />
        <Slider label="Lapse rate λ" value={lapse} min={0} max={0.3} step={0.01} onChange={setLapse} fmt={(v) => v.toFixed(2)} />
      </div>
      <button className="btn" onClick={() => setSeed((s) => s + 1)}>Simulate a new session (40 trials per contrast)</button>
      <p className="text-sm text-ink-2">The curve is <Tex>{"$P = \\lambda + (1 - 2\\lambda)\\,/\\,(1 + e^{-(c - \\mu)/\\sigma})$"}</Tex>. Bias shifts it sideways (the animal prefers one side), the threshold sets how steep it is (sensitivity), and lapses keep it away from 0 and 1 even on easy trials (inattention). The IBL study you read this week fits exactly this curve to every mouse.</p>
    </div>
  );
}
