"use client";

import { useMemo, useState } from "react";
import { Slider } from "./util";

const S = (x: number) => 1 / (1 + Math.exp(-(x - 4)));   // a sigmoid with threshold 4

/** Phase plane of a nonlinear E-I circuit: nullclines, fixed points and their stability from the Jacobian. */
export function NullclinePlane() {
  const [wEE, setWEE] = useState(12);
  const [hE, setHE] = useState(0.5);
  const wEI = 10, wIE = 10, wII = 2, tauI = 2;
  const f = (E: number, I: number): [number, number] => [-E + S(wEE * E - wEI * I + hE), (-I + S(wIE * E - wII * I)) / tauI];
  const W = 320, M = 20, P = (E: number, I: number) => [M + E * (W - 2 * M), W - M - I * (W - 2 * M)];
  const { segs, fps } = useMemo(() => {
    const n = 60, segs: string[][] = [[], []], fps: { E: number; I: number; kind: string }[] = [];
    const val = (c: number, E: number, I: number) => f(E, I)[c];
    for (let c = 0; c < 2; c++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const E0 = i / n, I0 = j / n, d = 1 / n;
      const corners = [[E0, I0], [E0 + d, I0], [E0 + d, I0 + d], [E0, I0 + d]];
      const v = corners.map(([e, ii]) => val(c, e, ii));
      const pts: number[][] = [];
      for (let q = 0; q < 4; q++) {
        const a = v[q], b = v[(q + 1) % 4];
        if ((a > 0) !== (b > 0)) { const t = a / (a - b); const A = corners[q], B = corners[(q + 1) % 4]; pts.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]); }
      }
      if (pts.length >= 2) segs[c].push(`M${P(pts[0][0], pts[0][1]).join(",")}L${P(pts[1][0], pts[1][1]).join(",")}`);
    }
    // Fixed points: Newton's method from a grid of starts, with a numerical Jacobian.
    const Jac = (E: number, I: number) => { const h = 1e-5, a = f(E, I), b = f(E + h, I), c = f(E, I + h); return [[(b[0] - a[0]) / h, (c[0] - a[0]) / h], [(b[1] - a[1]) / h, (c[1] - a[1]) / h]]; };
    for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) {
      let E = i / 8, I = j / 8;
      for (let it = 0; it < 40; it++) {
        const [a, b] = f(E, I), J = Jac(E, I), det = J[0][0] * J[1][1] - J[0][1] * J[1][0];
        if (Math.abs(det) < 1e-12) break;
        E -= (J[1][1] * a - J[0][1] * b) / det; I -= (-J[1][0] * a + J[0][0] * b) / det;
      }
      const [a, b] = f(E, I);
      if (Math.hypot(a, b) < 1e-9 && E > -0.01 && E < 1.01 && I > -0.01 && I < 1.01 && !fps.some((q) => Math.hypot(q.E - E, q.I - I) < 1e-4)) {
        const J = Jac(E, I), tr = J[0][0] + J[1][1], det = J[0][0] * J[1][1] - J[0][1] * J[1][0];
        const kind = det < 0 ? "saddle" : tr < 0 ? (tr * tr / 4 < det ? "stable spiral" : "stable node") : (tr * tr / 4 < det ? "unstable spiral" : "unstable node");
        fps.push({ E, I, kind });
      }
    }
    return { segs, fps };
  }, [wEE, hE]);
  const traj = useMemo(() => [[0.9, 0.1], [0.05, 0.6], [0.5, 0.9]].map(([e0, i0]) => {
    let E = e0, I = i0; const pts = [P(E, I)];
    for (let k = 0; k < 1500; k++) { const [a, b] = f(E, I); E += 0.02 * a; I += 0.02 * b; pts.push(P(E, I)); }
    return pts.map((q) => q.join(",")).join(" ");
  }), [wEE, hE]);
  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <svg viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[320px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="Phase plane with nullclines and fixed points">
        <rect x={M} y={M} width={W - 2 * M} height={W - 2 * M} fill="none" stroke="var(--line)" />
        <path d={segs[0].join("")} stroke="var(--neuro)" strokeWidth="2" fill="none" />
        <path d={segs[1].join("")} stroke="var(--ai)" strokeWidth="2" fill="none" />
        {traj.map((t, i) => <polyline key={i} points={t} fill="none" stroke="var(--ink-3)" strokeWidth="1.2" />)}
        {fps.map((q, i) => <circle key={i} cx={P(q.E, q.I)[0]} cy={P(q.E, q.I)[1]} r="6" fill={q.kind.startsWith("stable") ? "var(--good)" : "var(--surface)"} stroke={q.kind === "saddle" ? "var(--warn)" : "var(--good)"} strokeWidth="2.5" />)}
        <text x={W - M} y={W - 5} fontSize="10" textAnchor="end" fill="var(--ink-3)">excitatory activity E</text>
        <text x={M + 3} y={M - 6} fontSize="10" fill="var(--ink-3)">inhibitory activity I</text>
      </svg>
      <div className="space-y-3">
        <Slider label="recurrent excitation w_EE" value={wEE} min={6} max={18} step={0.1} onChange={setWEE} fmt={(v) => v.toFixed(1)} />
        <Slider label="external drive to E" value={hE} min={-3} max={4} step={0.05} onChange={setHE} fmt={(v) => v.toFixed(2)} />
        <ul className="space-y-1 text-sm">
          {fps.map((q, i) => <li key={i} className="rounded bg-surface-2 px-2 py-1 font-mono">E = {q.E.toFixed(3)}, I = {q.I.toFixed(3)}: {q.kind}</li>)}
        </ul>
        <p className="text-sm text-ink-2">Pink: the E nullcline, where E stops changing. Blue: the I nullcline. Fixed points sit where they cross (filled: stable; hollow: unstable; orange edge: saddle), and their type comes from the eigenvalues of the Jacobian there. Grey curves are trajectories. Change the drive and watch fixed points appear, merge and vanish, and a stable point turn into an oscillation.</p>
      </div>
    </div>
  );
}
