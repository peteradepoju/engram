"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

const CASES = [
  { name: "chain A → B → C, nothing observed", kind: "chain", cond: false },
  { name: "chain A → B → C, B observed", kind: "chain", cond: true },
  { name: "fork A ← B → C, nothing observed", kind: "fork", cond: false },
  { name: "fork A ← B → C, B observed", kind: "fork", cond: true },
  { name: "collider A → B ← C, nothing observed", kind: "collider", cond: false },
  { name: "collider A → B ← C, B observed", kind: "collider", cond: true },
];

/** The three elementary structures of d-separation, checked by simulation: correlation and partial correlation of A and C. */
export function DSeparation() {
  const [k, setK] = useState(0);
  const c = CASES[k];
  const r = useMemo(() => {
    const g = rng(622), n = 3000, A: number[] = [], B: number[] = [], C: number[] = [];
    for (let i = 0; i < n; i++) {
      let a: number, b: number, cc: number;
      if (c.kind === "chain") { a = gauss(g); b = a + gauss(g); cc = b + gauss(g); }
      else if (c.kind === "fork") { b = gauss(g); a = b + gauss(g); cc = b + gauss(g); }
      else { a = gauss(g); cc = gauss(g); b = a + cc + 0.5 * gauss(g); }
      A.push(a); B.push(b); C.push(cc);
    }
    const corr = (x: number[], y: number[]): number => {
      const mx = x.reduce((s, v) => s + v, 0) / n, my = y.reduce((s, v) => s + v, 0) / n;
      let sxy = 0, sx = 0, sy = 0; x.forEach((v, i) => { sxy += (v - mx) * (y[i] - my); sx += (v - mx) ** 2; sy += (y[i] - my) ** 2; });
      return sxy / Math.sqrt(sx * sy);
    };
    const rac = corr(A, C), rab = corr(A, B), rcb = corr(C, B);
    const partial = (rac - rab * rcb) / Math.sqrt((1 - rab * rab) * (1 - rcb * rcb));
    return c.cond ? partial : rac;
  }, [c]);
  const separated = (c.kind === "collider") !== c.cond;
  const node = (x: number, t: string, shade: boolean) => (
    <g key={t}><circle cx={x} cy="60" r="20" fill={shade ? "var(--ai)" : "none"} fillOpacity={shade ? 0.35 : 0} stroke="var(--ink)" strokeWidth="1.5" /><text x={x} y="65" fontSize="13" textAnchor="middle" fill="var(--ink)">{t}</text></g>
  );
  const arrow = (x1: number, x2: number) => <line x1={x1} y1="60" x2={x2} y2="60" stroke="var(--ink-3)" strokeWidth="1.8" markerEnd="url(#ds-arr)" />;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 110" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Three-node graph">
        <defs><marker id="ds-arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-3)" /></marker></defs>
        {node(70, "A", false)}{node(170, "B", c.cond)}{node(270, "C", false)}
        {c.kind === "chain" && <>{arrow(92, 146)}{arrow(192, 246)}</>}
        {c.kind === "fork" && <>{arrow(148, 94)}{arrow(192, 246)}</>}
        {c.kind === "collider" && <>{arrow(92, 146)}{arrow(248, 194)}</>}
        <text x="170" y="102" fontSize="9" textAnchor="middle" fill="var(--ink-3)">{c.cond ? "B observed (shaded)" : "B not observed"}</text>
      </svg>
      <Slider label="structure" value={k} min={0} max={5} step={1} onChange={setK} fmt={(v) => CASES[v].name} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label={c.cond ? "partial correlation of A and C given B" : "correlation of A and C"} value={r.toFixed(3)} />
        <Stat label="d-separated?" value={separated ? "yes: independent" : "no: dependent"} />
      </div>
      <p className="text-sm text-ink-2">In a chain or a fork, A and C are dependent until B is observed, which blocks the path. A collider is the opposite: A and C are independent, but observing their common effect B makes them dependent. The simulated correlations match the graph's verdict.</p>
    </div>
  );
}
