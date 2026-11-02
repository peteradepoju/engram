"use client";

import { useMemo, useState } from "react";
import { rng } from "./util";

/** Firing rates of 400 neurons span three orders of magnitude. On a linear axis most of them vanish into one bar. */
export function LogScale() {
  const [log, setLog] = useState(false);
  const rates = useMemo(() => {
    const r = rng(11);
    return Array.from({ length: 400 }, () => {
      const u1 = Math.max(r(), 1e-9), u2 = r();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return Math.exp(Math.log(3) + 1.1 * z); // log-normal, median 3 Hz
    });
  }, []);
  const nb = 24;
  const lo = log ? Math.log10(0.05) : 0, hi = log ? Math.log10(300) : 120;
  const edges = Array.from({ length: nb + 1 }, (_, i) => lo + ((hi - lo) * i) / nb);
  const counts = new Array(nb).fill(0);
  rates.forEach((v) => {
    const t = log ? Math.log10(v) : v;
    const k = Math.floor(((t - lo) / (hi - lo)) * nb);
    if (k >= 0 && k < nb) counts[k]++;
  });
  const top = Math.max(...counts);
  const ticks = log ? [0.1, 1, 10, 100] : [0, 30, 60, 90, 120];
  const X = (t: number) => 40 + ((t - lo) / (hi - lo)) * 540;
  const median = [...rates].sort((a, b) => a - b)[200];
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 600 220" className="w-full" role="img" aria-label={`Histogram of firing rates on a ${log ? "logarithmic" : "linear"} axis`}>
        {counts.map((c, i) => (
          <rect key={i} x={X(edges[i]) + 1} y={190 - (c / top) * 170} width={540 / nb - 2} height={(c / top) * 170} fill="var(--accent)" opacity="0.8" />
        ))}
        <line x1="40" x2="580" y1="190" y2="190" stroke="var(--ink-3)" />
        {ticks.map((t) => {
          const v = log ? Math.log10(t) : t;
          return <text key={t} x={X(v)} y="206" fontSize="11" textAnchor="middle" fill="var(--ink-2)">{t}</text>;
        })}
        <line x1={X(log ? Math.log10(median) : median)} x2={X(log ? Math.log10(median) : median)} y1="15" y2="190" stroke="var(--neuro)" strokeDasharray="4 3" />
        <text x={X(log ? Math.log10(median) : median) + 5} y="25" fontSize="11" fill="var(--neuro)">median {median.toFixed(1)} Hz</text>
        <text x="310" y="219" fontSize="10" textAnchor="middle" fill="var(--ink-3)">firing rate (Hz){log ? ", log scale" : ""}</text>
      </svg>
      <div className="flex gap-2">
        <button className={`btn !py-1.5 ${!log ? "btn-primary" : ""}`} onClick={() => setLog(false)}>Linear axis</button>
        <button className={`btn !py-1.5 ${log ? "btn-primary" : ""}`} onClick={() => setLog(true)}>Log axis</button>
      </div>
      <p className="text-sm text-ink-2">Firing rates across cortex are close to log-normal: most neurons fire slowly and a few fire very fast. On a linear axis the shape is hidden; on a log axis it is a clear bell. In Matplotlib: <code>ax.set_xscale(&quot;log&quot;)</code>, with bins from <code>np.logspace</code>.</p>
    </div>
  );
}
