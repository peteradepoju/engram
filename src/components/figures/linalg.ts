// Small dense linear algebra for figures (row-major number[][]).
export type Mat = number[][];
export const transpose = (A: Mat) => A[0].map((_, j) => A.map((r) => r[j]));
export const matmul = (A: Mat, B: Mat) => A.map((r) => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
export const matvec = (A: Mat, x: number[]) => A.map((r) => r.reduce((s, v, k) => s + v * x[k], 0));
/** Solve A x = b by Gaussian elimination with partial pivoting. */
export function solve(A: Mat, b: number[]): number[] {
  const n = A.length;
  const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    const d = M[c][c] || 1e-12;
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / d;
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
    x[r] = s / (M[r][r] || 1e-12);
  }
  return x;
}
/** Ridge regression weights (X^T X + lambda I)^-1 X^T y. */
export function ridge(X: Mat, y: number[], lambda: number) {
  const Xt = transpose(X);
  const A = matmul(Xt, X).map((r, i) => r.map((v, j) => v + (i === j ? lambda : 0)));
  return solve(A, matvec(Xt, y));
}
