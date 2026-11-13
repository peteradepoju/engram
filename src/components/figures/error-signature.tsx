"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

// After-reward and after-error weights of a history GLM fitted to the real IBL mice (public data, CC BY 4.0)
// and to simulations of each fitted model on the same stimulus sequences.
const NAMES: string[] = ["NYU-04", "NYU-01", "CSHL_008", "CSHL_003", "KS003", "KS019", "DY_003", "DY_001", "SWC_013", "SWC_021", "ZM_1745", "ZM_1743", "SWC_023", "IBL_002", "ibl_witten_12", "ibl_witten_06", "CSH_ZAD_002", "CSH_ZAD_005"];
const W: Record<string, { win: number[]; lose: number[] }> = {"data": {"win": [0.87, 0.62, 0.78, 0.74, 1.31, 0.95, 0.68, 0.77, 0.41, 0.61, 0.31, 0.97, 0.72, 0.5, 0.36, 0.59, 0.3, 0.5], "lose": [0.63, 0.2, 0.86, 0.62, 1.5, 0.29, 0.6, 0.73, -0.19, 0.12, 0.11, 1.27, 0.19, 0.68, 0.24, 0.33, 0.25, 0.48]}, "bayes": {"win": [0.63, 0.27, 0.49, 0.65, 0.85, 0.6, 0.25, 0.57, 0.34, 0.36, 0.31, 0.41, 0.57, 0.16, 0.32, 0.5, 0.04, 0.19], "lose": [-0.16, -0.12, -0.14, -0.21, -0.09, -0.22, -0.16, -0.13, -0.17, -0.03, -0.15, -0.29, -0.26, -0.08, -0.31, -0.09, -0.29, -0.12]}, "stimulus": {"win": [0.68, 0.45, 0.44, 0.58, 0.88, 0.74, 0.47, 0.6, 0.34, 0.5, 0.27, 0.47, 0.62, 0.24, 0.25, 0.41, 0.09, 0.23], "lose": [-0.39, -0.3, 0.03, -0.12, 0.08, -0.5, -0.21, -0.09, -0.26, -0.25, -0.14, -0.06, -0.27, -0.25, -0.22, -0.31, -0.19, -0.22]}, "action": {"win": [0.94, 0.48, 0.78, 0.67, 1.34, 0.89, 0.48, 0.79, 0.28, 0.57, 0.35, 0.99, 0.63, 0.56, 0.41, 0.63, 0.31, 0.47], "lose": [0.72, 0.35, 0.72, 0.54, 1.26, 0.7, 0.52, 0.68, 0.18, 0.55, 0.17, 0.93, 0.5, 0.54, 0.35, 0.47, 0.28, 0.34]}};
const ROWS: [string, string, string][] = [["data", "mice", "var(--ink)"], ["action", "action kernel", "var(--neuro)"], ["stimulus", "stimulus kernel", "var(--ai)"], ["bayes", "Bayesian observer", "var(--warn)"]];

/** The after-error signature that separates the action kernel from its rivals. */
export function ErrorSignature() {
  const [m, setM] = useState(-1);
  const val = (k: string, f: "win" | "lose"): number => (m < 0 ? W[k][f].reduce((a, b) => a + b, 0) / W[k][f].length : W[k][f][m]);
  const sy = (w: number): number => 95 - w * 60;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 150" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="After-reward and after-error weights">
        <line x1="20" x2="345" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        {(["win", "lose"] as const).map((f, g) => (
          <g key={f}>
            <text x={30 + g * 165 + 70} y="145" fontSize="9" textAnchor="middle" fill="var(--ink-2)">{f === "win" ? "after a reward" : "after an error"}</text>
            {ROWS.map(([k, , col], i) => { const v = val(k, f); return <rect key={k} x={30 + g * 165 + i * 36} y={Math.min(sy(v), sy(0))} width="30" height={Math.abs(sy(v) - sy(0))} fill={col} opacity={k === "data" ? 0.85 : 0.75} />; })}
          </g>
        ))}
        {ROWS.map(([k, nm, col], i) => <text key={k} x={22 + i * 85} y="12" fontSize="8" fill={col}>{nm}</text>)}
      </svg>
      <Slider label="mouse" value={m} min={-1} max={NAMES.length - 1} step={1} onChange={setM} fmt={(v) => (v < 0 ? "mean of 18" : NAMES[v])} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="after error: mice / action" value={`${val("data", "lose").toFixed(2)} / ${val("action", "lose").toFixed(2)}`} />
        <Stat label="after error: stimulus / Bayes" value={`${val("stimulus", "lose").toFixed(2)} / ${val("bayes", "lose").toFixed(2)}`} />
      </div>
      <p className="text-sm text-ink-2">Every model repeats a rewarded choice. Only the action kernel repeats after an error, as the mice do; models that learn from where the stimulus was switch.</p>
    </div>
  );
}
