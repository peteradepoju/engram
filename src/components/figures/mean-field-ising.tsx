"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

const N = 8;

/** Exact against naive mean-field magnetisation of a fully connected Ising model of eight units. */
export function MeanFieldIsing() {
  const [h, setH] = useState(0.1);
  const curves = useMemo(() => {
    const Js = Array.from({ length: 61 }, (_, i): number => i * 0.05);
    const exact = Js.map((J) => {
      // all-to-all coupling J / (N - 1): energy depends only on the number of +1 units
      let num = 0, den = 0;
      for (let k = 0; k <= N; k++) {
        const M = 2 * k - N, lc = (() => { let s = 0; for (let i = 1; i <= N; i++) s += Math.log(i); for (let i = 1; i <= k; i++) s -= Math.log(i); for (let i = 1; i <= N - k; i++) s -= Math.log(i); return s; })();
        const w = Math.exp(lc + h * M + (J / (N - 1)) * (M * M - N) / 2);
        num += w * M / N; den += w;
      }
      return num / den;
    });
    const mf = Js.map((J) => { let m = 0.5; for (let it = 0; it < 500; it++) m = Math.tanh(h + J * m); return m; });
    return { Js, exact, mf };
  }, [h]);
  const sx = (J: number): number => 30 + (J / 3) * 290, sy = (m: number): number => 140 - ((m + 1) / 2) * 125;
  const at = (J: number): number => Math.round(J / 0.05);
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 160" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Exact and mean-field magnetisation">
        <line x1="30" x2="320" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        <polyline points={curves.Js.map((J, i) => `${sx(J)},${sy(curves.exact[i])}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <polyline points={curves.Js.map((J, i) => `${sx(J)},${sy(curves.mf[i])}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" strokeDasharray="5 3" />
        <text x="34" y="14" fontSize="8" fill="var(--neuro)">exact mean state</text>
        <text x="120" y="14" fontSize="8" fill="var(--ai)">mean-field m = tanh(h + J m)</text>
        <text x="318" y="155" fontSize="8" textAnchor="end" fill="var(--ink-3)">total coupling J (0 to 3)</text>
      </svg>
      <Slider label="external field h" value={h} min={-0.5} max={0.5} step={0.01} onChange={setH} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="exact at the largest coupling" value={curves.exact[at(3)].toFixed(3)} />
        <Stat label="mean field at the largest coupling" value={curves.mf[at(3)].toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Mean-field inference replaces each unit's neighbours by their average, giving the self-consistent equation m = tanh(h + J m). With weak coupling it agrees with the exact answer. With strong coupling it overshoots: ignoring fluctuations, it commits the whole network to one state more firmly than eight units really do.</p>
    </div>
  );
}
