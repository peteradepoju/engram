"use client";

import { useMemo, useState } from "react";
import { rng, Stat } from "./util";

/** The perceptron learning rule on two-dimensional data, one example at a time. */
export function PerceptronLearn() {
  const [sep, setSep] = useState(true);
  const [steps, setSteps] = useState(0);
  const pts = useMemo(() => {
    const r = rng(sep ? 1958 : 1959), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
    return Array.from({ length: 40 }, (_, i) => { const y = i % 2 ? 1 : -1; const m = sep ? 1.3 : 0.5; return [g() * 0.7 + y * m * 0.8, g() * 0.7 + y * m * 0.6, y]; });
  }, [sep]);
  const { w, b, mistakesSeen, lastIdx } = useMemo(() => {
    let w = [0.3, -1], b = 0, mistakesSeen = 0, lastIdx = -1;
    for (let k = 0; k < steps; k++) {
      const i = k % pts.length, [x1, x2, y] = pts[i];
      if (y * (w[0] * x1 + w[1] * x2 + b) <= 0) { w = [w[0] + 0.5 * y * x1, w[1] + 0.5 * y * x2]; b += 0.5 * y; mistakesSeen++; lastIdx = i; }
    }
    return { w, b, mistakesSeen, lastIdx };
  }, [steps, pts]);
  const errors = pts.filter(([x1, x2, y]) => y * (w[0] * x1 + w[1] * x2 + b) <= 0).length;
  const W = 320, C = W / 2, K = 55;
  const P = (x: number, y: number) => [C + x * K, C - y * K];
  const line = () => {
    if (Math.abs(w[1]) > Math.abs(w[0])) { const y = (x: number) => -(w[0] * x + b) / w[1]; return [P(-3, y(-3)), P(3, y(3))]; }
    const x = (y: number) => -(w[1] * y + b) / w[0]; return [P(x(-3), -3), P(x(3), 3)];
  };
  const [[x1, y1], [x2, y2]] = line();
  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <svg viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[320px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="Perceptron decision boundary and data">
        <defs><clipPath id="ppc2"><rect width={W} height={W} /></clipPath></defs>
        <g clipPath="url(#ppc2)">
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--accent)" strokeWidth="2.5" />
          {pts.map(([a, c, y], i) => <circle key={i} cx={P(a, c)[0]} cy={P(a, c)[1]} r={i === lastIdx ? 7 : 4.5} fill={y > 0 ? "var(--neuro)" : "var(--ai)"} stroke={y * (w[0] * a + w[1] * c + b) <= 0 ? "var(--ink)" : "none"} strokeWidth="2.5" />)}
        </g>
      </svg>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <button className="btn !py-1.5" onClick={() => setSteps(steps + 1)}>Present one example</button>
          <button className="btn !py-1.5" onClick={() => setSteps(steps + 40)}>One pass (40)</button>
          <button className="btn !py-1.5" onClick={() => setSteps(0)}>Reset</button>
          <button className={`btn !py-1.5 ${sep ? "btn-primary" : ""}`} onClick={() => { setSep(!sep); setSteps(0); }}>{sep ? "separable data" : "overlapping data"}</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="examples presented" value={String(steps)} />
          <Stat label="updates made (mistakes)" value={String(mistakesSeen)} />
          <Stat label="currently misclassified" value={`${errors} of 40`} />
          <Stat label="weights (w₁, w₂, b)" value={`${w[0].toFixed(2)}, ${w[1].toFixed(2)}, ${b.toFixed(2)}`} />
        </div>
        <p className="text-sm text-ink-2">Each example is a point with a label (pink or blue). The perceptron classifies it by the side of the line it falls on. When it is wrong (outlined), it nudges the weights towards the example's label: w ← w + η y x. On separable data the updates stop after a finite number of mistakes. On overlapping data they never stop: the line keeps jumping, because the rule only reacts to errors.</p>
      </div>
    </div>
  );
}
