"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

// GLM weights fitted to each IBL mouse (public behavioural data, CC BY 4.0).
const NAMES: string[] = ["NYU-04", "NYU-01", "CSHL_008", "CSHL_003", "KS003", "KS019", "DY_003", "DY_001", "SWC_013", "SWC_021", "ZM_1745", "ZM_1743", "SWC_023", "IBL_002", "ibl_witten_12", "ibl_witten_06", "CSH_ZAD_002", "CSH_ZAD_005"];
// columns: contrast, rewarded previous choice, unrewarded previous choice, bias
const W: number[][] = [[2.782, 0.873, 0.632, -0.314], [2.276, 0.623, 0.223, 0.471], [2.905, 0.783, 0.867, -0.052], [2.913, 0.737, 0.618, 0.229], [3.168, 1.308, 1.497, -0.496], [3.277, 0.947, 0.297, -0.726], [3.198, 0.68, 0.602, 0.298], [3.602, 0.777, 0.744, 0.044], [4.388, 0.41, -0.187, 0.999], [2.591, 0.613, 0.12, -0.377], [3.044, 0.315, 0.113, -0.528], [2.092, 0.969, 1.278, 0.159], [3.204, 0.724, 0.191, 0.435], [2.201, 0.505, 0.675, -0.072], [4.595, 0.361, 0.224, -0.199], [2.828, 0.588, 0.336, 0.135], [2.584, 0.295, 0.236, 0.545], [2.446, 0.499, 0.477, -0.279]];
// weights of the last ten choices
const WL: number[][] = [[0.521, 0.481, 0.158, 0.127, 0.042, 0.099, 0.019, 0.006, 0.129, 0.157], [0.352, 0.276, 0.176, 0.052, 0.056, -0.004, 0.131, 0.101, 0.086, 0.026], [0.47, 0.392, 0.196, 0.223, 0.051, 0.095, 0.223, 0.095, 0.104, 0.095], [0.445, 0.279, 0.231, 0.234, 0.04, 0.144, 0.128, 0.088, 0.024, -0.003], [0.824, 0.652, 0.327, 0.322, 0.145, 0.02, 0.014, 0.064, 0.062, 0.118], [0.558, 0.388, 0.19, 0.116, 0.037, 0.089, 0.043, 0.093, 0.051, 0.062], [0.439, 0.191, 0.268, 0.228, 0.103, 0.125, 0.045, 0.204, 0.121, -0.096], [0.52, 0.38, 0.282, 0.064, 0.235, 0.072, 0.063, -0.001, -0.125, 0.026], [0.203, 0.148, 0.067, 0.047, 0.139, 0.067, 0.016, 0.072, 0.027, 0.098], [0.317, 0.289, 0.167, 0.074, 0.081, 0.122, 0.127, -0.018, 0.108, 0.097], [0.167, 0.253, 0.058, 0.09, 0.09, 0.025, 0.115, 0.094, -0.025, -0.016], [0.551, 0.531, 0.223, 0.168, 0.202, 0.117, 0.184, 0.039, 0.117, 0.129], [0.382, 0.381, 0.107, 0.146, 0.175, 0.065, 0.06, 0.099, 0.022, 0.06], [0.281, 0.276, 0.286, 0.135, 0.126, 0.047, 0.099, 0.125, 0.14, 0.106], [0.221, 0.107, 0.14, 0.255, 0.055, 0.053, 0.086, 0.04, -0.017, 0.04], [0.289, 0.321, 0.219, 0.086, 0.148, 0.085, 0.095, 0.069, 0.056, 0.075], [0.15, 0.12, 0.127, 0.062, 0.16, 0.165, 0.125, 0.041, 0.112, 0.097], [0.325, 0.172, 0.193, 0.097, 0.06, 0.092, 0.176, 0.125, 0.051, 0.115]];

/** History weights of 18 IBL mice: one-trial win and lose weights, and ten-trial choice kernels. */
export function HistoryWeights() {
  const [m, setM] = useState(0);
  const bw = 300 / 18;
  const sy = (w: number): number => 80 - w * 45;
  const k = WL[m];
  const fitA = (): number => {
    const xs = [1, 2, 3, 4, 5, 6], ys = xs.map((x) => Math.log(Math.max(k[x - 1], 1e-3)));
    const mx = 3.5, my = ys.reduce((a, b) => a + b, 0) / 6;
    const sl = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / xs.reduce((a, x) => a + (x - mx) ** 2, 0);
    return 1 - Math.exp(sl);
  };
  const alpha = fitA();
  const kx = (j: number): number => 40 + j * 30, ky = (w: number): number => 230 - w * 80;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 260" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="History weights per mouse">
        <text x="30" y="12" fontSize="8" fill="var(--neuro)">after reward</text>
        <text x="95" y="12" fontSize="8" fill="var(--ai)">after error</text>
        <line x1="30" x2="330" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        {W.map((w, i) => (
          <g key={i} opacity={i === m ? 1 : 0.45}>
            <rect x={30 + i * bw + 1} y={Math.min(sy(w[1]), sy(0))} width={bw / 2 - 1} height={Math.abs(sy(w[1]) - sy(0))} fill="var(--neuro)" />
            <rect x={30 + i * bw + bw / 2} y={Math.min(sy(w[2]), sy(0))} width={bw / 2 - 1} height={Math.abs(sy(w[2]) - sy(0))} fill="var(--ai)" />
          </g>
        ))}
        <text x="330" y="130" fontSize="8" textAnchor="end" fill="var(--ink-3)">one bar pair per mouse</text>
        <line x1="40" x2="320" y1={ky(0)} y2={ky(0)} stroke="var(--line)" />
        <polyline points={k.map((w, j) => `${kx(j)},${ky(w)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.8" />
        {k.map((w, j) => <circle key={j} cx={kx(j)} cy={ky(w)} r="2.6" fill="var(--neuro)" />)}
        <polyline points={k.map((_, j) => `${kx(j)},${ky(k[0] * Math.pow(1 - alpha, j))}`).join(" ")} fill="none" stroke="var(--ink)" strokeDasharray="4 3" />
        <text x="320" y="252" fontSize="8" textAnchor="end" fill="var(--ink-3)">trials back (1 to 10)</text>
        <text x="40" y="142" fontSize="8" fill="var(--ink-3)">choice kernel of the selected mouse, with exponential fit</text>
      </svg>
      <Slider label="mouse" value={m} min={0} max={NAMES.length - 1} step={1} onChange={setM} fmt={(v) => NAMES[v]} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="after reward" value={W[m][1].toFixed(2)} />
        <Stat label="after error" value={W[m][2].toFixed(2)} />
        <Stat label="kernel α" value={Number.isFinite(alpha) ? alpha.toFixed(2) : "n/a"} />
      </div>
      <p className="text-sm text-ink-2">Almost every mouse repeats its previous choice after an error as well as after a reward, so the mice weight their own actions rather than inferring where the stimulus was.</p>
    </div>
  );
}
