"use client";

import { useState } from "react";

const STEPS = [
  { cmd: "git log --oneline", text: "Three commits on main: the project so far.", main: 3, branch: 0, merged: false },
  { cmd: "git switch -c try-gaussian-smoothing", text: "Make a branch to try an idea without touching main. If it fails, you delete the branch and main is untouched.", main: 3, branch: 0, merged: false, onBranch: true },
  { cmd: 'git commit -am "Smooth PSTH with a Gaussian kernel"', text: "Commits now go on the branch.", main: 3, branch: 1, merged: false, onBranch: true },
  { cmd: 'git commit -am "Choose sigma by cross-validation"', text: "A second commit on the branch. Main still has the old analysis.", main: 3, branch: 2, merged: false, onBranch: true },
  { cmd: "git switch main && git merge try-gaussian-smoothing", text: "The idea worked, so merge it into main. Main now has both commits, and the history records where they came from.", main: 3, branch: 2, merged: true },
  { cmd: 'git tag figure-3-v1', text: "Tag the exact commit that produced a figure in your paper, so you can always regenerate it.", main: 3, branch: 2, merged: true, tag: true },
];

/** Branches let you try an idea in isolation; merging brings it back. Step through a typical analysis change. */
export function GitBranches() {
  const [s, setS] = useState(0);
  const st = STEPS[s];
  const mx = (i: number) => 60 + i * 90;
  return (
    <div className="space-y-4">
      <svg viewBox="0 0 640 170" className="w-full" role="img" aria-label="Commit graph with a branch">
        <text x="10" y="64" fontSize="12" fill="var(--ink-2)">main</text>
        {Array.from({ length: st.main }, (_, i) => (
          <g key={i}>{i > 0 ? <line x1={mx(i - 1)} x2={mx(i)} y1="60" y2="60" stroke="var(--ink-3)" strokeWidth="2" /> : null}<circle cx={mx(i)} cy="60" r="11" fill="var(--accent)" /></g>
        ))}
        {st.branch > 0 || st.onBranch ? <text x="10" y="134" fontSize="12" fill="var(--neuro)">branch</text> : null}
        {Array.from({ length: st.branch }, (_, i) => (
          <g key={i}>
            <path d={i === 0 ? `M${mx(2)},60 C${mx(2) + 40},60 ${mx(3) - 40},130 ${mx(3)},130` : `M${mx(2 + i)},130 L${mx(3 + i)},130`} fill="none" stroke="var(--neuro)" strokeWidth="2" />
            <circle cx={mx(3 + i)} cy="130" r="11" fill="var(--neuro)" />
          </g>
        ))}
        {st.merged ? (
          <g>
            <line x1={mx(2)} x2={mx(5)} y1="60" y2="60" stroke="var(--ink-3)" strokeWidth="2" />
            <path d={`M${mx(4)},130 C${mx(4) + 40},130 ${mx(5) - 40},60 ${mx(5)},60`} fill="none" stroke="var(--neuro)" strokeWidth="2" />
            <circle cx={mx(5)} cy="60" r="13" fill="var(--accent)" stroke="var(--neuro)" strokeWidth="3" />
            <text x={mx(5)} y="35" fontSize="11" textAnchor="middle" fill="var(--ink-2)">merge commit</text>
          </g>
        ) : null}
        {st.tag ? <g><rect x={mx(5) + 18} y="48" width="96" height="22" rx="5" fill="var(--warn-soft)" stroke="var(--warn)" /><text x={mx(5) + 66} y="63" fontSize="11" textAnchor="middle" fill="var(--warn)">figure-3-v1</text></g> : null}
      </svg>
      <div className="rounded-lg bg-[var(--code-bg)] px-4 py-2 font-mono text-sm">$ {st.cmd}</div>
      <p className="text-[0.97rem]">{st.text}</p>
      <div className="flex gap-2">
        <button className="btn" disabled={s === 0} onClick={() => setS(s - 1)}>Back</button>
        <button className="btn btn-primary" disabled={s === STEPS.length - 1} onClick={() => setS(s + 1)}>Next command</button>
      </div>
    </div>
  );
}
