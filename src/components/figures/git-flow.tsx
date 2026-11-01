"use client";

import { useState } from "react";

const STEPS = [
  { cmd: "edit analysis.py", at: 0, text: "You change a file. Git notices the change in your working folder but has not saved anything yet." },
  { cmd: "git add analysis.py", at: 1, text: "You put the change in the staging area: a list of changes you intend to save together." },
  { cmd: 'git commit -m "Fit tuning curves"', at: 2, text: "Git saves a snapshot with your message. You can always come back to it. Commit small, commit often." },
  { cmd: "git push", at: 3, text: "The snapshot is copied to GitHub. Now it is backed up, shareable and linked to Colab." },
];
const ZONES = ["Working folder", "Staging area", "Local history", "GitHub"];

/** Where a change lives as it moves through Git. Step through the four commands. */
export function GitFlow() {
  const [s, setS] = useState(0);
  const step = STEPS[s];
  return (
    <div className="space-y-4">
      <svg viewBox="0 0 600 120" className="w-full" role="img" aria-label={`The change is now in: ${ZONES[step.at]}`}>
        {ZONES.map((z, i) => (
          <g key={z}>
            <rect x={10 + i * 148} y="20" width="132" height="70" rx="10" fill={i === step.at ? "var(--accent-soft)" : "var(--surface-2)"} stroke={i === step.at ? "var(--accent)" : "var(--line)"} />
            <text x={76 + i * 148} y="48" textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--ink)">{z}</text>
            {i === step.at ? <circle cx={76 + i * 148} cy="70" r="8" fill="var(--accent)" /> : null}
            {i < 3 ? <path d={`M${144 + i * 148},55 l12,0`} stroke="var(--ink-3)" strokeWidth="2" /> : null}
          </g>
        ))}
      </svg>
      <div className="rounded-lg bg-[var(--code-bg)] px-4 py-2 font-mono text-sm">$ {step.cmd}</div>
      <p className="text-[0.97rem]">{step.text}</p>
      <div className="flex gap-2">
        <button className="btn" disabled={s === 0} onClick={() => setS(s - 1)}>Back</button>
        <button className="btn btn-primary" disabled={s === STEPS.length - 1} onClick={() => setS(s + 1)}>Next command</button>
      </div>
    </div>
  );
}
