"use client";

import { useMemo, useState } from "react";
import { poisson, rng, Slider, Stat } from "./util";

const DT = 0.05;

/** Centre-out cursor control: Poisson neurons cosine tuned to the (rotated) intended velocity, decoded by the ideal unrotated linear decoder; the user always aims at the target. */
export function ClosedLoop() {
  const [rot, setRot] = useState(30);
  const [n, setN] = useState(40);
  const { paths, times } = useMemo(() => {
    const r = rng(2012), pd = Array.from({ length: 100 }, () => r() * 2 * Math.PI), base = Array.from({ length: 100 }, () => 5 + 10 * r());
    const P = pd.slice(0, n), B = base.slice(0, n);
    let a11 = 0, a12 = 0, a22 = 0;
    for (const p of P) { a11 += Math.cos(p) ** 2; a12 += Math.cos(p) * Math.sin(p); a22 += Math.sin(p) ** 2; }
    const det = a11 * a22 - a12 * a12, inv = [[a22 / det, -a12 / det], [-a12 / det, a11 / det]];
    const a = (rot * Math.PI) / 180, paths: [number, number][][] = [], times: number[] = [];
    for (let k = 0; k < 8; k++) {
      const ta = (k * Math.PI) / 4, tx = 10 * Math.cos(ta), ty = 10 * Math.sin(ta);
      let cx = 0, cy = 0, t = 0; const path: [number, number][] = [[0, 0]];
      while (t < 200) {
        const dx = tx - cx, dy = ty - cy, d = Math.hypot(dx, dy);
        if (d < 1.5) break;
        const s = 8 * Math.min(1, d / 3) / d, vx = dx * s, vy = dy * s;
        const rx = Math.cos(a) * vx - Math.sin(a) * vy, ry = Math.sin(a) * vx + Math.cos(a) * vy;
        let u1 = 0, u2 = 0;
        P.forEach((p, i) => { const z = poisson(Math.max(B[i] + rx * Math.cos(p) + ry * Math.sin(p), 0) * DT, r); const e = z / DT - B[i]; u1 += e * Math.cos(p); u2 += e * Math.sin(p); });
        cx += DT * (inv[0][0] * u1 + inv[0][1] * u2); cy += DT * (inv[1][0] * u1 + inv[1][1] * u2);
        t++; path.push([cx, cy]);
      }
      paths.push(path); times.push(t * DT);
    }
    return { paths, times };
  }, [rot, n]);
  const W = 360, H = 280, s = 11, cx = 180, cy = 140;
  const sorted = [...times].sort((x, y) => x - y), med = (sorted[3] + sorted[4]) / 2;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Cursor paths to eight targets under closed-loop control">
        {Array.from({ length: 8 }, (_, k) => <circle key={k} cx={cx + 10 * s * Math.cos((k * Math.PI) / 4)} cy={cy - 10 * s * Math.sin((k * Math.PI) / 4)} r={1.5 * s} fill="none" stroke="var(--ink-3)" />)}
        {paths.map((p, k) => <polyline key={k} points={p.map(([x, y]) => `${cx + x * s},${cy - y * s}`).join(" ")} fill="none" stroke={k % 2 ? "var(--ai)" : "var(--neuro)"} strokeWidth="1.5" />)}
        <circle cx={cx} cy={cy} r="3" fill="var(--ink)" />
      </svg>
      <Slider label="tuning rotation relative to the decoder" value={rot} min={0} max={85} step={5} onChange={setRot} unit="°" />
      <Slider label="neurons" value={n} min={10} max={100} step={5} onChange={setN} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="median time to target" value={`${med.toFixed(2)} s`} />
        <Stat label="targets reached in 10 s" value={`${times.filter((t) => t < 10).length} of 8`} />
      </div>
      <p className="text-sm text-ink-2">The user always aims straight at the target, but the decoder turns every intended direction by the rotation. The cursor sets off at an angle, the user keeps re-aiming from where it actually is, and the path spirals in. Up to about 60° this costs time but rarely a target; near 90° the decoded motion is almost perpendicular to the intention and the cursor circles. Fewer neurons make every path noisier, whatever the rotation.</p>
    </div>
  );
}
