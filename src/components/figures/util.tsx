"use client";

/** Seeded random numbers, so figures look the same on the server and in the browser. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Slider({ label, value, min, max, step, onChange, unit, fmt }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit?: string; fmt?: (v: number) => string;
}) {
  return (
    <label className="block text-sm">
      <span className="flex justify-between text-ink-2"><span>{label}</span><span className="font-mono text-ink">{fmt ? fmt(value) : value}{unit ? ` ${unit}` : ""}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-[var(--accent)]" />
    </label>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-2 px-3 py-2">
      <div className="text-xs text-ink-3">{label}</div>
      <div className="font-mono text-lg">{value}</div>
    </div>
  );
}

/** Poisson sample by inversion (fine for the small means used in figures). */
export function poisson(lambda: number, r: () => number) {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= r(); } while (p > L && k < 1000);
  return k - 1;
}

/** Standard normal sample (Box-Muller). */
export function gauss(r: () => number): number {
  return Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
}

/** Solve A x = b by Gaussian elimination with partial pivoting (small dense systems). */
export function solve(A: number[][], b: number[]): number[] {
  const n = b.length, M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    const d = M[c][c] || 1e-12;
    for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / d; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  return M.map((row, i) => row[n] / (row[i] || 1e-12));
}

/** Least-squares polynomial fit of degree deg with ridge penalty lam (x scaled to about [-1, 1] by the caller). */
export function polyFit(xs: number[], ys: number[], deg: number, lam = 1e-8): number[] {
  const k = deg + 1;
  const A = Array.from({ length: k }, (): number[] => Array(k).fill(0)), b: number[] = Array(k).fill(0);
  xs.forEach((x, i) => {
    const p = Array.from({ length: k }, (_, j): number => x ** j);
    for (let r = 0; r < k; r++) { b[r] += p[r] * ys[i]; for (let c = 0; c < k; c++) A[r][c] += p[r] * p[c]; }
  });
  for (let r = 1; r < k; r++) A[r][r] += lam;
  A[0][0] += 1e-10;
  return solve(A, b);
}

export function polyEval(w: number[], x: number): number {
  return w.reduce((s, c, j) => s + c * x ** j, 0);
}
