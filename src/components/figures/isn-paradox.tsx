"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

/** An excitatory-inhibitory rate network. Extra drive to the inhibitory cells lowers their rate when recurrent excitation is strong (an inhibition-stabilised network). */
export function ISNParadox() {
  const [wEE, setWEE] = useState(2.2);
  const [dI, setDI] = useState(0.5);
  const wEI = 2.5, wIE = 2.5, wII = 1.5, IE = 2, II = 1, tE = 20, tI = 10;
  const { rE, rI } = useMemo(() => {
    let e = 0, i = 0; const rE: number[] = [], rI: number[] = [];
    for (let k = 0; k < 800; k++) {
      const t = k * 0.5, extra = t >= 200 ? dI : 0;
      const ue = Math.max(0, wEE * e - wEI * i + IE), ui = Math.max(0, wIE * e - wII * i + II + extra);
      e += (0.5 / tE) * (-e + ue); i += (0.5 / tI) * (-i + ui);
      if (!isFinite(e) || e > 1e3) e = 1e3;
      rE.push(e); rI.push(i);
    }
    return { rE, rI };
  }, [wEE, dI]);
  const top = Math.max(1, ...rE.slice(100), ...rI.slice(100)) * 1.15;
  const W = 360, H = 200, X = (k: number) => 30 + (k / 800) * (W - 40), Y = (v: number) => H - 26 - (Math.min(v, top) / top) * (H - 40);
  const pre = (r: number[]) => r[399], post = (r: number[]) => r[799];
  const det = (1 - wEE) * (1 + wII) + wEI * wIE, tr = (wEE - 1) / tE - (1 + wII) / tI;
  const stable = det > 0 && tr < 0;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Excitatory and inhibitory rates before and after extra input to inhibitory cells">
        <rect x={X(400)} y="10" width={X(800) - X(400)} height={H - 36} fill="var(--warn)" opacity="0.08" />
        <line x1="30" x2={W - 10} y1={H - 26} y2={H - 26} stroke="var(--line)" />
        <polyline points={rE.map((v, k) => `${X(k)},${Y(v)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2.5" />
        <polyline points={rI.map((v, k) => `${X(k)},${Y(v)}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2.5" />
        {[0, 100, 200, 300, 400].map((t) => <text key={t} x={X(t * 2)} y={H - 10} fontSize="10" textAnchor={t === 400 ? "end" : "middle"} fill="var(--ink-3)">{t} ms</text>)}
        <text x={X(404)} y="22" fontSize="10" fill="var(--warn)">extra drive to I cells</text>
        <text x="34" y="22" fontSize="10" fill="var(--neuro)">excitatory</text>
        <text x="34" y="36" fontSize="10" fill="var(--ai)">inhibitory</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="recurrent excitation wEE" value={wEE} min={0.2} max={3.4} step={0.05} onChange={setWEE} />
        <Slider label="extra drive to inhibition" value={dI} min={0} max={1} step={0.05} onChange={setDI} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="E rate change" value={stable ? (post(rE) - pre(rE)).toFixed(2) : "unstable"} />
        <Stat label="I rate change" value={stable ? (post(rI) - pre(rI)).toFixed(2) : "unstable"} />
        <Stat label="regime" value={wEE > 1 ? "ISN" : "non-ISN"} />
      </div>
      <p className="text-sm text-ink-2">At 200 ms the inhibitory cells receive extra excitatory drive. If recurrent excitation is weak (wEE below 1), their rate rises, as you would expect. If it is strong enough that the excitatory cells alone would be unstable, the network relies on inhibition to keep it in check, and the result is a paradox: the extra drive suppresses the excitatory cells, which then withdraw so much excitation from the inhibitory cells that the inhibitory rate falls too.</p>
    </div>
  );
}
