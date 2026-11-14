import { gauss, rng } from "./util";

/** Joint probabilities of t-SNE: Gaussian affinities with per-point widths set by binary search on perplexity. */
function affinities(D2: number[][], perp: number): number[][] {
  const n = D2.length, P = D2.map(() => Array(n).fill(0)), target = Math.log(perp);
  for (let i = 0; i < n; i++) {
    let lo = 1e-10, hi = 1e10, beta = 1;
    for (let it = 0; it < 50; it++) {
      let sum = 0, h = 0;
      for (let j = 0; j < n; j++) if (j !== i) { const p = Math.exp(-D2[i][j] * beta); P[i][j] = p; sum += p; }
      for (let j = 0; j < n; j++) if (j !== i) { P[i][j] /= sum || 1e-300; if (P[i][j] > 1e-300) h -= P[i][j] * Math.log(P[i][j]); }
      if (Math.abs(h - target) < 1e-4) break;
      if (h > target) { lo = beta; beta = hi === 1e10 ? beta * 2 : (beta + hi) / 2; } else { hi = beta; beta = (beta + lo) / 2; }
    }
  }
  const J = D2.map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) J[i][j] = Math.max((P[i][j] + P[j][i]) / (2 * n), 1e-12);
  return J;
}

/** A small exact t-SNE (van der Maaten and Hinton, 2008), adequate for a few hundred points. */
export function tsne(X: number[][], perp: number, iters = 400, seed = 1): number[][] {
  const n = X.length, r = rng(seed);
  const D2 = X.map((a) => X.map((b) => a.reduce((s, v, k) => s + (v - b[k]) ** 2, 0)));
  const P = affinities(D2, perp);
  const Y = X.map(() => [1e-2 * gauss(r), 1e-2 * gauss(r)]), V = X.map(() => [0, 0]);
  for (let it = 0; it < iters; it++) {
    const exag = it < 100 ? 12 : 1, mom = it < 100 ? 0.5 : 0.8;
    const Q = Y.map(() => Array(n).fill(0)); let Z = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const q = 1 / (1 + (Y[i][0] - Y[j][0]) ** 2 + (Y[i][1] - Y[j][1]) ** 2); Q[i][j] = q; Q[j][i] = q; Z += 2 * q;
    }
    for (let i = 0; i < n; i++) {
      let gx = 0, gy = 0;
      for (let j = 0; j < n; j++) if (j !== i) {
        const m = (exag * P[i][j] - Q[i][j] / Z) * Q[i][j];
        gx += 4 * m * (Y[i][0] - Y[j][0]); gy += 4 * m * (Y[i][1] - Y[j][1]);
      }
      V[i][0] = mom * V[i][0] - 100 * gx; V[i][1] = mom * V[i][1] - 100 * gy;
    }
    for (let i = 0; i < n; i++) { Y[i][0] += V[i][0]; Y[i][1] += V[i][1]; }
  }
  return Y;
}
