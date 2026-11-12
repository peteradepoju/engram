"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Q-learning on a 5 by 5 gridworld: values and greedy actions after a chosen number of episodes. */
export function GridworldQ() {
  const [episodes, setEpisodes] = useState(20);
  const [gamma, setGamma] = useState(0.9);
  const { Q, lastLen } = useMemo(() => {
    const r = rng(2005), S = 25, A = 4, goal = 24;
    const Q = Array.from({ length: S }, () => new Array(A).fill(0));
    const step = (s: number, a: number) => {
      let x = Math.floor(s / 5), y = s % 5;
      if (a === 0) x = Math.max(0, x - 1); if (a === 1) x = Math.min(4, x + 1);
      if (a === 2) y = Math.max(0, y - 1); if (a === 3) y = Math.min(4, y + 1);
      return 5 * x + y;
    };
    let lastLen = 0;
    for (let k = 0; k < episodes; k++) {
      let s = 0, n = 0;
      while (true) {
        let a = 0;
        if (r() < 0.1) a = Math.floor(r() * A);
        else { let b = -Infinity; for (let j = 0; j < A; j++) { const v = Q[s][j] + 1e-9 * r(); if (v > b) { b = v; a = j; } } }
        const s2 = step(s, a), done = s2 === goal, rew = done ? 1 : 0;
        const target = rew + (done ? 0 : gamma * Math.max(...Q[s2]));
        Q[s][a] += 0.5 * (target - Q[s][a]); s = s2; n++;
        if (done || n > 200) break;
      }
      lastLen = n;
    }
    return { Q, lastLen };
  }, [episodes, gamma]);
  const c = 34, ox = 95, oy = 8;
  const arrows = ["↑", "↓", "←", "→"];
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 186" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Gridworld values and policy">
        {Q.map((q, s) => {
          const x = Math.floor(s / 5), y = s % 5, v = Math.max(...q), a = q.indexOf(v);
          return (
            <g key={s}>
              <rect x={ox + y * c} y={oy + x * c} width={c - 2} height={c - 2} rx="3" fill="var(--ai)" opacity={0.08 + 0.85 * v} />
              {s === 24 ? <text x={ox + y * c + c / 2 - 1} y={oy + x * c + c / 2 + 3} fontSize="9" textAnchor="middle" fill="var(--ink)">goal</text>
                : v > 0 ? <text x={ox + y * c + c / 2 - 1} y={oy + x * c + c / 2 + 5} fontSize="14" textAnchor="middle" fill="var(--ink)">{arrows[a]}</text> : null}
              {s === 0 && <text x={ox + 3} y={oy + 9} fontSize="7" fill="var(--ink-2)">start</text>}
            </g>
          );
        })}
      </svg>
      <Slider label="episodes of training" value={episodes} min={0} max={200} step={1} onChange={setEpisodes} />
      <Slider label="discount factor γ" value={gamma} min={0.5} max={0.99} step={0.01} onChange={setGamma} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="value of start" value={Math.max(...Q[0]).toFixed(3)} />
        <Stat label="steps in last episode" value={episodes ? String(lastLen) : "none yet"} />
      </div>
      <p className="text-sm text-ink-2">Brighter cells have higher value. Arrows appear only where the agent has learned something. A smaller discount factor makes distant rewards worth less, so value fades faster with distance from the goal.</p>
    </div>
  );
}
