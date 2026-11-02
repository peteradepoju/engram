"use client";

import { useMemo, useState } from "react";
import { Slider } from "./util";

const N = 48;
const KERNELS = ["centre-surround", "oriented (Gabor)", "edge"] as const;

function makeImage() {
  const im: number[][] = [];
  for (let i = 0; i < N; i++) {
    im.push([]);
    for (let j = 0; j < N; j++) {
      let v = 0;
      if ((i - 14) ** 2 + (j - 14) ** 2 < 49) v = 1;                       // a disc
      if (j > 28 && j < 32 && i > 6 && i < 42) v = 1;                     // a vertical bar
      if (i > 30 && i < 34 && j > 4 && j < 26) v = 1;                     // a horizontal bar
      if (j - i > 22 && j - i < 26 && i < 20) v = 1;                       // a diagonal bar
      im[i].push(v);
    }
  }
  return im;
}

/** Two-dimensional convolution of an image with receptive-field-like kernels. */
export function Conv2d() {
  const [kind, setKind] = useState<(typeof KERNELS)[number]>("oriented (Gabor)");
  const [ori, setOri] = useState(0);
  const img = useMemo(makeImage, []);
  const K = useMemo(() => {
    const r = 4, th = (ori * Math.PI) / 180, k: number[][] = [];
    for (let a = -r; a <= r; a++) { const row: number[] = []; for (let b = -r; b <= r; b++) {
      const x = b * Math.cos(th) + a * Math.sin(th), y = -b * Math.sin(th) + a * Math.cos(th);
      if (kind === "centre-surround") row.push(Math.exp(-(a * a + b * b) / 2) / 2 - Math.exp(-(a * a + b * b) / 8) / 8);
      else if (kind === "edge") row.push(x > 0.5 ? 1 : x < -0.5 ? -1 : 0);
      else row.push(Math.exp(-(x * x + y * y) / 8) * Math.cos(1.3 * x));
      } k.push(row); }
    const mean = k.flat().reduce((s, v) => s + v, 0) / k.flat().length;
    return k.map((row) => row.map((v) => v - mean));   // zero mean: no response to uniform light
  }, [kind, ori]);
  const out = useMemo(() => {
    const r = 4, o: number[][] = [];
    for (let i = 0; i < N; i++) { const row: number[] = []; for (let j = 0; j < N; j++) {
      let s = 0; for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) { const ii = i + a, jj = j + b; if (ii >= 0 && ii < N && jj >= 0 && jj < N) s += K[a + r][b + r] * img[ii][jj]; }
      row.push(s); } o.push(row); }
    return o;
  }, [K, img]);
  const vmax = Math.max(...out.flat().map(Math.abs)) || 1;
  const cell = 4.5;
  const show = (M: number[][], ox: number, signed: boolean, scale: number) => M.flatMap((row, i) => row.map((v, j) => (
    <rect key={`${ox}-${i}-${j}`} x={ox + j * cell} y={22 + i * cell} width={cell} height={cell}
      fill={signed ? (v >= 0 ? "var(--neuro)" : "var(--ai)") : "var(--ink)"} opacity={Math.min(1, Math.abs(v) / scale)} />)));
  const kmax = Math.max(...K.flat().map(Math.abs));
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {KERNELS.map((k) => <button key={k} className={`btn !py-1.5 ${kind === k ? "btn-primary" : ""}`} onClick={() => setKind(k)}>{k}</button>)}
      </div>
      <svg viewBox="0 0 560 250" className="w-full rounded-lg bg-surface-2" role="img" aria-label="An image, a kernel and their convolution">
        <text x="0" y="14" fontSize="10" fill="var(--ink-3)">image</text>
        {show(img, 0, false, 1)}
        <text x="232" y="14" fontSize="10" fill="var(--ink-3)">kernel</text>
        {K.flatMap((row, i) => row.map((v, j) => <rect key={`k${i}-${j}`} x={232 + j * 9} y={70 + i * 9} width="9" height="9" fill={v >= 0 ? "var(--neuro)" : "var(--ai)"} opacity={Math.abs(v) / kmax} />))}
        <text x="344" y="14" fontSize="10" fill="var(--ink-3)">response map (pink positive, blue negative)</text>
        {show(out, 344, true, vmax)}
      </svg>
      {kind !== "centre-surround" ? <Slider label="kernel orientation" value={ori} min={0} max={180} step={5} onChange={setOri} unit="°" /> : null}
      <p className="text-sm text-ink-2">Convolution slides the kernel over the image and, at each position, takes the dot product of the kernel with the patch beneath it: one model neuron with this receptive field at every location. The centre-surround kernel, like a retinal ganglion cell, responds to edges and spots but not to uniform regions. The oriented kernel, like a V1 simple cell, responds strongly only to bars and edges near its preferred orientation. A convolutional layer of a neural network is a bank of such kernels, learned from data.</p>
    </div>
  );
}
