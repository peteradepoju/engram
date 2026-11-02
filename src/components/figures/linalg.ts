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

/** Eigenvalues of a 2 by 2 matrix [[a, b], [c, d]]. Complex pairs come back as re plus or minus i im. */
export function eig2(a: number, b: number, c: number, d: number) {
  const t = a + d, det = a * d - b * c, disc = t * t / 4 - det;
  if (disc >= 0) {
    const s = Math.sqrt(disc), l1 = t / 2 + s, l2 = t / 2 - s;
    const vec = (l: number) => {
      const v = Math.abs(b) > 1e-9 ? [b, l - a] : Math.abs(c) > 1e-9 ? [l - d, c] : (Math.abs(l - a) < 1e-9 ? [1, 0] : [0, 1]);
      const n = Math.hypot(v[0], v[1]) || 1;
      return [v[0] / n, v[1] / n];
    };
    return { real: true, l1, l2, im: 0, v1: vec(l1), v2: vec(l2), trace: t, det };
  }
  return { real: false, l1: t / 2, l2: t / 2, im: Math.sqrt(-disc), v1: null, v2: null, trace: t, det };
}

/** Eigen-decomposition of a symmetric matrix by cyclic Jacobi rotations. Values sorted largest first. */
export function symEig(S: Mat) {
  const n = S.length;
  const A = S.map((r) => [...r]);
  const V: Mat = A.map((_, i) => A.map((_, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += A[p][q] ** 2;
    if (off < 1e-18) break;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(A[p][q]) < 1e-15) continue;
      const th = (A[q][q] - A[p][p]) / (2 * A[p][q]);
      const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) {
        const akp = A[k][p], akq = A[k][q];
        A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq;
      }
      for (let k = 0; k < n; k++) {
        const apk = A[p][k], aqk = A[q][k];
        A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk;
      }
      for (let k = 0; k < n; k++) {
        const vkp = V[k][p], vkq = V[k][q];
        V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq;
      }
    }
  }
  const order = A.map((r, i) => [r[i], i]).sort((x, y) => y[0] - x[0]);
  return { values: order.map(([v]) => v), vectors: order.map(([, i]) => V.map((r) => r[i])) };
}

/** Thin SVD via the eigen-decomposition of A^T A (fine for the small, well-scaled matrices in figures). */
export function svd(A: Mat) {
  const { values, vectors } = symEig(matmul(transpose(A), A));
  const s = values.map((v) => Math.sqrt(Math.max(v, 0)));
  const U = vectors.map((v, k) => { const u = matvec(A, v); return u.map((x) => x / (s[k] || 1)); });
  return { s, U, V: vectors }; // U[k] and V[k] are the k-th left and right singular vectors
}
