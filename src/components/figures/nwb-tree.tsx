"use client";

import { useState } from "react";

const NODES: { path: string; depth: number; kind: "group" | "dataset"; what: string; read: string }[] = [
  { path: "/", depth: 0, kind: "group", what: "The root. Its attributes hold the session description, identifier and start time.", read: "nwb.session_description" },
  { path: "acquisition", depth: 1, kind: "group", what: "Raw data as recorded: voltage traces from each channel, two-photon movies, behavioural video, wheel position.", read: "nwb.acquisition['ElectricalSeries']" },
  { path: "processing", depth: 1, kind: "group", what: "Derived data, organised in modules: LFP, filtered signals, calcium traces and ROIs, pose estimates, licks.", read: "nwb.processing['behavior']" },
  { path: "units", depth: 1, kind: "group", what: "The units table: one row per sorted unit, with spike times (a ragged array), electrodes, waveforms and quality metrics.", read: "nwb.units.to_dataframe()" },
  { path: "units/spike_times", depth: 2, kind: "dataset", what: "Every unit's spike times end to end, in seconds.", read: "nwb.units['spike_times'][k]" },
  { path: "units/spike_times_index", depth: 2, kind: "dataset", what: "Where each unit's spikes end in spike_times: the boundaries of the ragged array.", read: "(used for you by pynwb)" },
  { path: "intervals/trials", depth: 1, kind: "group", what: "The trials table: start and stop times, stimulus and behaviour columns, one row per trial.", read: "nwb.trials.to_dataframe()" },
  { path: "stimulus", depth: 1, kind: "group", what: "What was presented: images, movies or parameters, with the times of each presentation.", read: "nwb.stimulus['gratings']" },
  { path: "general", depth: 1, kind: "group", what: "Metadata: experimenter, institution, subject (species, age, sex, genotype), devices and protocols.", read: "nwb.subject" },
  { path: "general/extracellular_ephys/electrodes", depth: 2, kind: "group", what: "The electrodes table: one row per channel, with its position and brain location.", read: "nwb.electrodes.to_dataframe()" },
];

/** A clickable outline of an NWB file from an extracellular recording. */
export function NWBTree() {
  const [sel, setSel] = useState(3);
  const n = NODES[sel];
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_1.1fr]">
      <ul className="not-prose list-none rounded-lg bg-surface-2 p-2 font-mono text-[0.8rem]">
        {NODES.map((d, i) => (
          <li key={d.path}>
            <button onClick={() => setSel(i)} className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-left ${i === sel ? "bg-accent-soft text-accent" : "hover:bg-surface"}`} style={{ paddingLeft: 8 + d.depth * 16 }}>
              <span aria-hidden>{d.kind === "group" ? "▸" : "·"}</span>{d.path === "/" ? "/ (file)" : d.path.split("/").slice(-1)[0]}
            </button>
          </li>
        ))}
      </ul>
      <div className="rounded-lg border border-line p-3 text-sm">
        <div className="font-mono text-xs text-ink-3">{n.path === "/" ? "/" : "/" + n.path} · {n.kind}</div>
        <p className="mt-2 text-ink">{n.what}</p>
        <div className="mt-3 text-xs text-ink-3">With pynwb</div>
        <code className="mt-1 block rounded bg-surface-2 px-2 py-1 font-mono text-xs">{n.read}</code>
      </div>
    </div>
  );
}
