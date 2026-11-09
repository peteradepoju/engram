"""Precomputes the small summaries of the Churchland et al. (2012) reaching data that the Week 25 figures draw.
Run: python3 scripts/churchland-figures.py  (writes public/data/churchland-figures.json)."""
import json, os
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), "..")
z = np.load(os.path.join(ROOT, "public", "data", "churchland2012_reach.npz"))
R, t = z["rates"].astype(float), z["times"].astype(int)
C, T, N = R.shape

def prep(R):
    X = R / (R.max(axis=(0, 1)) - R.min(axis=(0, 1)) + 5)      # soft normalisation
    return X - X.mean(axis=0, keepdims=True)                       # remove the cross-condition mean

def pca(Xw, k=6):
    M = Xw.reshape(-1, Xw.shape[-1]); mu = M.mean(0)
    _, S, Vt = np.linalg.svd(M - mu, full_matrices=False)
    return (Xw - mu) @ Vt[:k].T, S ** 2 / np.sum(S ** 2)

def skew_fit(Z, dt=0.01):
    k = Z.shape[-1]
    dZ = (np.diff(Z, axis=1) / dt).reshape(-1, k); Zm = Z[:, :-1].reshape(-1, k)
    basis = []
    for i in range(k):
        for j in range(i + 1, k):
            E = np.zeros((k, k)); E[i, j], E[j, i] = 1, -1; basis.append(E)
    G = np.stack([(Zm @ E.T).ravel() for E in basis], 1)
    h = np.linalg.lstsq(G, dZ.ravel(), rcond=None)[0]
    M = sum(c * E for c, E in zip(h, basis))
    r2 = 1 - np.sum((dZ - Zm @ M.T) ** 2) / np.sum((dZ - dZ.mean(0)) ** 2)
    return M, r2

def jplane(M):
    ev, V = np.linalg.eig(M)
    i = np.argmax(ev.imag)
    P = np.linalg.qr(np.stack([V[:, i].real, V[:, i].imag], 1))[0]
    return P, ev[i].imag / (2 * np.pi)

win = (t >= -50) & (t <= 150)
X = prep(R)
Z, ve = pca(X[:, win])
M, r2 = skew_fit(Z)
P, freq = jplane(M)
J = Z @ P
# centre the starting states
J = J - J[:, :1].mean(0)

rs = np.random.default_rng(0); Y = X.copy()
for n in range(N): Y[:, :, n] = Y[rs.permutation(C), :, n]
Zs, _ = pca(Y[:, win]); Ms, r2s = skew_fit(Zs); Ps, _ = jplane(Ms); Js = Zs @ Ps

# a few example neurons for the PSTH figure: eight conditions spread across the set
order = np.argsort(-R.max(axis=(0, 1)))
examples = [int(order[i]) for i in (0, 5, 12, 25, 40, 60, 90, 130)]
conds = [int(c) for c in np.linspace(0, C - 1, 8).round()]
out = {
    "times": t.tolist(), "window": t[win].tolist(),
    "psth": {str(n): [[round(float(v), 1) for v in R[c, :, n]] for c in conds] for n in examples},
    "varExplained": [round(float(v), 4) for v in ve[:20]],
    "pcs": [[[round(float(v), 3) for v in Z[c, :, i]] for i in range(Z.shape[2])] for c in range(C)],
    "jpca": [[[round(float(v), 3) for v in J[c, :, i]] for i in range(J.shape[2])] for c in range(C)],
    "jpcaShuffled": [[[round(float(v), 3) for v in Js[c, :, i]] for i in range(Js.shape[2])] for c in range(C)],
    "r2Skew": round(float(r2), 3), "r2SkewShuffled": round(float(r2s), 3), "rotationHz": round(float(freq), 2),
}
json.dump(out, open(os.path.join(ROOT, "public", "data", "churchland-figures.json"), "w"), separators=(",", ":"))
print("var explained", np.round(ve[:6], 3), "R2 skew", round(r2, 3), "shuffled", round(r2s, 3), "freq", round(freq, 2))
