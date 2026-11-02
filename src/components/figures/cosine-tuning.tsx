"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** A motor-cortex neuron with cosine tuning: rate = b0 + k (d · p), a dot product of movement and preferred direction. */
export function CosineTuning() {
  const [pref, setPref] = useState(60);
  const [move, setMove] = useState(120);
  const b0 = 20, k = 15;
  const rad = (d: number) => (d * Math.PI) / 180;
  const rate = (m: number) => b0 + k * Math.cos(rad(m - pref));
  const C = 130, R = 95;
  const xy = (deg: number, r: number) => [C + r * Math.cos(rad(deg)), C - r * Math.sin(rad(deg))];
  const [px, py] = xy(pref, R), [mx, my] = xy(move, R);
  const curve = Array.from({ length: 361 }, (_, i) => i);
  const X = (d: number) => 290 + (d / 360) * 290, Y = (r: number) => 230 - (r / 40) * 200;
  const targets = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <div className="space-y-4">
      <svg viewBox="0 0 600 260" className="w-full" role="img" aria-label="Cosine tuning of a motor-cortex neuron">
        <circle cx={C} cy={C} r={R} fill="var(--surface-2)" stroke="var(--line)" />
        {targets.map((t) => { const [tx, ty] = xy(t, R); const r = rate(t); return <circle key={t} cx={tx} cy={ty} r={4 + (r / 35) * 9} fill="var(--accent)" opacity={0.25 + (r / 35) * 0.6} />; })}
        <line x1={C} y1={C} x2={px} y2={py} stroke="var(--neuro)" strokeWidth="3" />
        <line x1={C} y1={C} x2={mx} y2={my} stroke="var(--ai)" strokeWidth="3" />
        <text x={px} y={py - 8} fontSize="11" textAnchor="middle" fill="var(--neuro)">preferred</text>
        <text x={mx} y={my + 16} fontSize="11" textAnchor="middle" fill="var(--ai)">movement</text>
        <text x={C} y={250} fontSize="10" textAnchor="middle" fill="var(--ink-3)">targets: dot size = firing rate</text>
        <rect x="290" y="30" width="290" height="200" fill="var(--surface-2)" rx="4" />
        <path d={curve.map((d, i) => `${i ? "L" : "M"}${X(d)},${Y(rate(d))}`).join("")} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
        <line x1="290" x2="580" y1={Y(b0)} y2={Y(b0)} stroke="var(--ink-3)" strokeDasharray="3 3" />
        <circle cx={X(move)} cy={Y(rate(move))} r="6" fill="var(--ai)" />
        {[0, 90, 180, 270, 360].map((d) => <text key={d} x={X(d)} y="246" fontSize="10" textAnchor="middle" fill="var(--ink-3)">{d}°</text>)}
        {[0, 20, 40].map((r) => <text key={r} x="284" y={Y(r) + 3} fontSize="10" textAnchor="end" fill="var(--ink-3)">{r}</text>)}
        <text x="435" y="22" fontSize="11" textAnchor="middle" fill="var(--ink-2)">firing rate (Hz) against movement direction</text>
      </svg>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="Preferred direction" value={pref} min={0} max={359} step={1} unit="°" onChange={setPref} />
        <Slider label="Movement direction" value={move} min={0} max={359} step={1} unit="°" onChange={setMove} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="angle between" value={`${(((move - pref) % 360) + 360) % 360}°`} />
        <Stat label="d · p = cos(angle)" value={Math.cos(rad(move - pref)).toFixed(2)} />
        <Stat label="rate = 20 + 15 (d · p)" value={`${rate(move).toFixed(1)} Hz`} />
      </div>
    </div>
  );
}
