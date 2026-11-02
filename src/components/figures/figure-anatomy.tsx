"use client";

import { useState } from "react";

const PARTS = {
  figure: { label: "Figure", code: "fig = plt.figure(figsize=(6, 3.5))", text: "The whole canvas. One figure can hold several axes (panels). Its size is set in inches; dpi sets resolution." },
  axes: { label: "Axes", code: "ax = fig.add_subplot()  # or fig, ax = plt.subplots()", text: "One plotting area with its own coordinate system. Almost everything you draw goes on an Axes object: ax.plot, ax.scatter, ax.set_xlabel." },
  title: { label: "Title", code: 'ax.set_title("V1 neuron 17: orientation tuning")', text: "Say what the panel shows. In papers the caption carries the details, so panel titles are often short or dropped." },
  xlabel: { label: "x label", code: 'ax.set_xlabel("orientation (deg)")', text: "Every axis needs a quantity and its unit. A missing unit is the most common figure mistake." },
  ylabel: { label: "y label", code: 'ax.set_ylabel("firing rate (Hz)")', text: "Units again. Spikes per second is written Hz." },
  ticks: { label: "Ticks", code: "ax.set_xticks([0, 45, 90, 135, 180])", text: "Choose ticks a reader can use: round numbers, not too many." },
  line: { label: "Line with error bars", code: 'ax.errorbar(oris, mean, yerr=sem, marker="o", capsize=3)', text: "The data. State in the caption what the error bars are (here, SEM over 20 trials)." },
  legend: { label: "Legend", code: 'ax.legend(frameon=False)', text: "Needed only when there is more than one series. Direct labels next to each line are often clearer." },
  spines: { label: "Spines", code: 'ax.spines[["top", "right"]].set_visible(False)', text: "The box around the axes. Removing the top and right ones reduces clutter." },
} as const;
type Key = keyof typeof PARTS;

/** The parts of a Matplotlib figure. Click any part to see what it is and the line of code that controls it. */
export function FigureAnatomy() {
  const [sel, setSel] = useState<Key>("axes");
  const on = (k: Key) => ({ onClick: () => setSel(k), style: { cursor: "pointer" }, role: "button" as const, "aria-label": PARTS[k].label });
  const hl = (k: Key) => (sel === k ? "var(--accent)" : "transparent");
  const oris = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180];
  const tune = (o: number) => 4 + 26 * Math.exp(2.2 * (Math.cos((2 * (o - 90) * Math.PI) / 180) - 1));
  const tune2 = (o: number) => 3 + 14 * Math.exp(2.2 * (Math.cos((2 * (o - 45) * Math.PI) / 180) - 1));
  const x = (o: number) => 90 + (o / 180) * 380, y = (r: number) => 250 - (r / 35) * 190;
  return (
    <div className="space-y-4">
      <svg viewBox="0 0 520 330" className="mx-auto w-full max-w-[560px]" role="img" aria-label="An annotated example figure">
        <rect x="4" y="4" width="512" height="322" rx="8" fill="var(--surface)" stroke={hl("figure")} strokeWidth="3" {...on("figure")} />
        <rect x="90" y="50" width="380" height="200" fill="var(--surface-2)" stroke={hl("axes")} strokeWidth="3" {...on("axes")} />
        <g {...on("spines")}>
          <line x1="90" y1="250" x2="470" y2="250" stroke="var(--ink)" strokeWidth={sel === "spines" ? 3 : 1.5} />
          <line x1="90" y1="50" x2="90" y2="250" stroke="var(--ink)" strokeWidth={sel === "spines" ? 3 : 1.5} />
        </g>
        <g {...on("ticks")}>
          {[0, 45, 90, 135, 180].map((o) => (
            <g key={o}><line x1={x(o)} x2={x(o)} y1="250" y2="256" stroke="var(--ink)" /><text x={x(o)} y="270" fontSize="12" textAnchor="middle" fill={sel === "ticks" ? "var(--accent)" : "var(--ink-2)"}>{o}</text></g>
          ))}
          {[0, 10, 20, 30].map((r) => (
            <g key={r}><line x1="84" x2="90" y1={y(r)} y2={y(r)} stroke="var(--ink)" /><text x="78" y={y(r) + 4} fontSize="12" textAnchor="end" fill={sel === "ticks" ? "var(--accent)" : "var(--ink-2)"}>{r}</text></g>
          ))}
        </g>
        <g {...on("line")}>
          <path d={oris.map((o, i) => `${i ? "L" : "M"}${x(o)},${y(tune(o))}`).join("")} fill="none" stroke="var(--neuro)" strokeWidth={sel === "line" ? 3.5 : 2} />
          {oris.map((o) => <g key={o}><line x1={x(o)} x2={x(o)} y1={y(tune(o) - 2.5)} y2={y(tune(o) + 2.5)} stroke="var(--neuro)" /><circle cx={x(o)} cy={y(tune(o))} r="4" fill="var(--neuro)" /></g>)}
          <path d={oris.map((o, i) => `${i ? "L" : "M"}${x(o)},${y(tune2(o))}`).join("")} fill="none" stroke="var(--ai)" strokeWidth={sel === "line" ? 3.5 : 2} strokeDasharray="5 3" />
        </g>
        <g {...on("legend")}>
          <rect x="370" y="58" width="94" height="42" rx="4" fill="var(--surface)" stroke={sel === "legend" ? "var(--accent)" : "var(--line)"} strokeWidth={sel === "legend" ? 2.5 : 1} />
          <line x1="378" x2="396" y1="72" y2="72" stroke="var(--neuro)" strokeWidth="2" /><text x="402" y="76" fontSize="11" fill="var(--ink)">neuron 17</text>
          <line x1="378" x2="396" y1="90" y2="90" stroke="var(--ai)" strokeWidth="2" strokeDasharray="5 3" /><text x="402" y="94" fontSize="11" fill="var(--ink)">neuron 42</text>
        </g>
        <text x="280" y="34" textAnchor="middle" fontSize="15" fontWeight="600" fill={sel === "title" ? "var(--accent)" : "var(--ink)"} {...on("title")}>Orientation tuning in V1</text>
        <text x="280" y="300" textAnchor="middle" fontSize="13" fill={sel === "xlabel" ? "var(--accent)" : "var(--ink)"} {...on("xlabel")}>orientation (deg)</text>
        <text x="30" y="150" textAnchor="middle" fontSize="13" fill={sel === "ylabel" ? "var(--accent)" : "var(--ink)"} transform="rotate(-90 30 150)" {...on("ylabel")}>firing rate (Hz)</text>
      </svg>
      <div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(PARTS) as Key[]).map((k) => (
            <button key={k} onClick={() => setSel(k)} className={`chip !py-1 ${sel === k ? "!bg-accent !text-white" : ""}`}>{PARTS[k].label}</button>
          ))}
        </div>
        <div className="mt-4 font-semibold">{PARTS[sel].label}</div>
        <p className="mt-1 text-[0.95rem] text-ink-2">{PARTS[sel].text}</p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-[var(--code-bg)] px-3 py-2 font-mono text-[0.8rem]">{PARTS[sel].code}</pre>
      </div>
    </div>
  );
}
