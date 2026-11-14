// A small classification tree for figures: greedy Gini splits on two features.
export type Pt = [number, number, number];
export type Tree = { leaf: true; p: number } | { leaf: false; j: number; t: number; l: Tree; r: Tree };

function gini(c1: number, n: number): number { if (n === 0) return 0; const p = c1 / n; return 2 * p * (1 - p); }

export function grow(pts: Pt[], depth: number, rand?: () => number, mtry = 2, minLeaf = 1): Tree {
  const n = pts.length, c1 = pts.reduce((s, p) => s + p[2], 0);
  if (depth === 0 || n < 2 * minLeaf || c1 === 0 || c1 === n) return { leaf: true, p: n ? c1 / n : 0.5 };
  let best = { j: -1, t: 0, imp: gini(c1, n) - 1e-12 };
  const feats = mtry >= 2 || !rand ? [0, 1] : [rand() < 0.5 ? 0 : 1];
  for (const j of feats) {
    const s = [...pts].sort((a, b) => a[j] - b[j]);
    let l1 = 0;
    for (let i = 0; i < n - 1; i++) {
      l1 += s[i][2];
      if (i + 1 < minLeaf || n - i - 1 < minLeaf || s[i][j] === s[i + 1][j]) continue;
      const nl = i + 1, nr = n - nl;
      const imp = (nl * gini(l1, nl) + nr * gini(c1 - l1, nr)) / n;
      if (imp < best.imp) best = { j, t: (s[i][j] + s[i + 1][j]) / 2, imp };
    }
  }
  if (best.j < 0) return { leaf: true, p: c1 / n };
  const L = pts.filter((p) => p[best.j] <= best.t), R = pts.filter((p) => p[best.j] > best.t);
  return { leaf: false, j: best.j, t: best.t, l: grow(L, depth - 1, rand, mtry, minLeaf), r: grow(R, depth - 1, rand, mtry, minLeaf) };
}

export function predict(tree: Tree, x: number[]): number {
  let t = tree;
  while (!t.leaf) t = x[t.j] <= t.t ? t.l : t.r;
  return t.p;
}

export function countLeaves(tree: Tree): number { return tree.leaf ? 1 : countLeaves(tree.l) + countLeaves(tree.r); }
