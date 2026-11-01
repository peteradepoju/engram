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
