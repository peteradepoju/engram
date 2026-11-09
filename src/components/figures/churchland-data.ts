"use client";

import { useEffect, useState } from "react";

/** Summaries of the Churchland et al. (2012) reaching data, precomputed by scripts/churchland-figures.py. */
export type ChurchlandData = {
  times: number[]; window: number[];
  psth: Record<string, number[][]>;
  varExplained: number[];
  pcs: number[][][]; jpca: number[][][]; jpcaShuffled: number[][][];
  r2Skew: number; r2SkewShuffled: number; rotationHz: number;
};

let cache: Promise<ChurchlandData> | null = null;

export function useChurchland(): ChurchlandData | null {
  const [data, setData] = useState<ChurchlandData | null>(null);
  useEffect(() => {
    cache ??= fetch("/data/churchland-figures.json").then((r) => r.json());
    let live = true;
    cache.then((d) => { if (live) setData(d); }).catch(() => { cache = null; });
    return () => { live = false; };
  }, []);
  return data;
}

/** Colour for a condition by its starting position, from warm to cool, as in the original figures. */
export const condColour = (f: number) => `hsl(${Math.round(10 + 130 * Math.max(0, Math.min(1, f)))} 70% 52%)`;

export const DATA_CREDIT = "Data: Churchland, Cunningham, Kaufman, Foster, Nuyujukian, Ryu and Shenoy (2012), monkey N.";
