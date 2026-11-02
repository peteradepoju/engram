"use client";

import { useMemo, useState } from "react";

// Control points (sRGB 0..1) sampled from each colour map; interpolated linearly between them.
const MAPS: Record<string, number[][]> = {
  viridis: [[0.267, 0.005, 0.329], [0.283, 0.141, 0.458], [0.254, 0.265, 0.53], [0.207, 0.372, 0.553], [0.164, 0.471, 0.558], [0.128, 0.567, 0.551], [0.135, 0.659, 0.518], [0.267, 0.749, 0.441], [0.478, 0.821, 0.318], [0.741, 0.873, 0.15], [0.993, 0.906, 0.144]],
  jet: [[0, 0, 0.5], [0, 0, 1], [0, 0.5, 1], [0, 1, 1], [0.5, 1, 0.5], [1, 1, 0], [1, 0.5, 0], [1, 0, 0], [0.5, 0, 0]],
  grey: [[0, 0, 0], [1, 1, 1]],
  "red-blue (diverging)": [[0.02, 0.19, 0.38], [0.26, 0.58, 0.76], [0.97, 0.97, 0.97], [0.84, 0.38, 0.3], [0.4, 0, 0.12]],
};

function sample(map: number[][], t: number) {
  const s = Math.min(Math.max(t, 0), 1) * (map.length - 1);
  const i = Math.min(Math.floor(s), map.length - 2), f = s - i;
  return map[i].map((v, k) => v + f * (map[i + 1][k] - v));
}

// Perceived lightness L* (CIELAB) of an sRGB colour.
function lightness([r, g, b]: number[]) {
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const Y = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return Y > 0.008856 ? 116 * Math.cbrt(Y) - 16 : 903.3 * Y;
}

const css = (c: number[]) => `rgb(${c.map((v) => Math.round(v * 255)).join(",")})`;

/** The same receptive-field map in four colour maps, with each map's perceived lightness. Rainbow maps invent edges. */
export function Colormaps() {
  const [name, setName] = useState("viridis");
  const map = MAPS[name];
  const N = 40;
  const field = useMemo(() => {
    // A smooth centre-surround receptive field: no sharp edges anywhere.
    const out: number[][] = [];
    for (let i = 0; i < N; i++) {
      const row: number[] = [];
      for (let j = 0; j < N; j++) {
        const x = (j - N / 2) / 8, y = (i - N / 2) / 8, r2 = x * x + y * y;
        row.push(Math.exp(-r2 / 0.8) - 0.55 * Math.exp(-r2 / 3.2));
      }
      out.push(row);
    }
    const flat = out.flat(), lo = Math.min(...flat), hi = Math.max(...flat);
    return out.map((r) => r.map((v) => (v - lo) / (hi - lo)));
  }, []);
  const L = Array.from({ length: 101 }, (_, k) => lightness(sample(map, k / 100)));
  return (
    <div className="grid gap-5 md:grid-cols-[240px_1fr]">
      <svg viewBox={`0 0 ${N} ${N}`} className="w-full max-w-[240px] rounded-lg" role="img" aria-label={`Receptive field drawn with the ${name} colour map`} shapeRendering="crispEdges">
        {field.flatMap((row, i) => row.map((v, j) => <rect key={`${i}-${j}`} x={j} y={i} width="1.02" height="1.02" fill={css(sample(map, v))} />))}
      </svg>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {Object.keys(MAPS).map((m) => <button key={m} className={`btn !py-1.5 ${m === name ? "btn-primary" : ""}`} onClick={() => setName(m)}>{m}</button>)}
        </div>
        <div className="h-5 w-full rounded" style={{ background: `linear-gradient(90deg, ${Array.from({ length: 21 }, (_, k) => css(sample(map, k / 20))).join(",")})` }} />
        <svg viewBox="0 0 400 110" className="w-full" role="img" aria-label="Perceived lightness along the colour map">
          <rect x="30" y="5" width="365" height="85" fill="var(--surface-2)" rx="4" />
          <path d={L.map((l, k) => `${k ? "L" : "M"}${30 + k * 3.65},${90 - (l / 100) * 85}`).join("")} fill="none" stroke="var(--ink)" strokeWidth="2" />
          <text x="25" y="12" fontSize="10" textAnchor="end" fill="var(--ink-3)">100</text>
          <text x="25" y="92" fontSize="10" textAnchor="end" fill="var(--ink-3)">0</text>
          <text x="212" y="106" fontSize="10" textAnchor="middle" fill="var(--ink-3)">position along the colour map → (perceived lightness L*)</text>
        </svg>
        <p className="text-sm text-ink-2">
          {name === "jet" && "Jet's lightness rises and falls, so the smooth field seems to have bright rings and sharp edges that are not in the data. It also fails for colour-blind readers and in greyscale print."}
          {name === "viridis" && "Viridis is perceptually uniform: lightness rises steadily, so equal steps in the data look like equal steps in colour. It survives colour-blindness and greyscale."}
          {name === "grey" && "Greyscale is honest and prints anywhere, but the eye separates fewer levels of grey than of colour."}
          {name.startsWith("red-blue") && "Diverging maps suit data with a meaningful middle (zero change, excitation against inhibition). Use them only when the centre value means something."}
        </p>
      </div>
    </div>
  );
}
