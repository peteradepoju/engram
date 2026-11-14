/** Small dense linear algebra and Gaussian-process helpers for figures. */

export function chol(A: number[][]): number[][] {
  const n = A.length, L = A.map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) {
    let s = A[i][j];
    for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
    L[i][j] = i === j ? Math.sqrt(Math.max(s, 1e-12)) : s / L[j][j];
  }
  return L;
}

/** Solve L y = b (forward) then Lᵀ x = y (backward). */
export function cholSolve(L: number[][], b: number[]): number[] {
  const n = L.length, y = Array(n).fill(0), x = Array(n).fill(0);
  for (let i = 0; i < n; i++) { let s = b[i]; for (let k = 0; k < i; k++) s -= L[i][k] * y[k]; y[i] = s / L[i][i]; }
  for (let i = n - 1; i >= 0; i--) { let s = y[i]; for (let k = i + 1; k < n; k++) s -= L[k][i] * x[k]; x[i] = s / L[i][i]; }
  return x;
}

export type Kernel = (a: number, b: number) => number;
export const rbf = (ell: number, sf = 1): Kernel => (a, b) => sf * sf * Math.exp(-0.5 * ((a - b) / ell) ** 2);

/** GP posterior mean and variance at test points xs given data (X, y) and noise variance. */
export function gpPosterior(k: Kernel, X: number[], y: number[], noise: number, xs: number[]): { mean: number[]; vr: number[]; logml: number; fit: number; complexity: number } {
  const n = X.length;
  const K = X.map((a, i) => X.map((b, j) => k(a, b) + (i === j ? noise : 0)));
  const L = chol(K), alpha = cholSolve(L, y);
  const mean = xs.map((s) => X.reduce((acc, a, i) => acc + k(s, a) * alpha[i], 0));
  const vr = xs.map((s) => {
    const ks = X.map((a) => k(s, a));
    const v = Array(n).fill(0);
    for (let i = 0; i < n; i++) { let t = ks[i]; for (let q = 0; q < i; q++) t -= L[i][q] * v[q]; v[i] = t / L[i][i]; }
    return Math.max(k(s, s) - v.reduce((acc, u) => acc + u * u, 0), 1e-12);
  });
  const fit = -0.5 * y.reduce((acc, v, i) => acc + v * alpha[i], 0);
  const complexity = -L.reduce((acc, row, i) => acc + Math.log(row[i]), 0);
  return { mean, vr, logml: fit + complexity - 0.5 * n * Math.log(2 * Math.PI), fit, complexity };
}
