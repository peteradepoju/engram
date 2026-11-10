// Hodgkin-Huxley rate functions (modern convention, rest at -65 mV) shared by the Part 2 figures.
export const HH = { gNa: 120, gK: 36, gL: 0.3, ENa: 50, EK: -77, EL: -54.387, C: 1 };

export function hhRates(Vin: number, phi = 1) {
  const V = Vin + 1e-7;
  const an = (0.01 * (V + 55)) / (1 - Math.exp(-(V + 55) / 10)), bn = 0.125 * Math.exp(-(V + 65) / 80);
  const am = (0.1 * (V + 40)) / (1 - Math.exp(-(V + 40) / 10)), bm = 4 * Math.exp(-(V + 65) / 18);
  const ah = 0.07 * Math.exp(-(V + 65) / 20), bh = 1 / (1 + Math.exp(-(V + 35) / 10));
  return { an: phi * an, bn: phi * bn, am: phi * am, bm: phi * bm, ah: phi * ah, bh: phi * bh };
}

export function infTau(V: number, g: "n" | "m" | "h") {
  const r = hhRates(V);
  const a = g === "n" ? r.an : g === "m" ? r.am : r.ah, b = g === "n" ? r.bn : g === "m" ? r.bm : r.bh;
  return { inf: a / (a + b), tau: 1 / (a + b) };
}

export type HHTrace = { t: number[]; V: number[]; INa: number[]; IK: number[]; m: number[]; h: number[]; n: number[] };

/** Forward Euler integration of the HH equations with current I(t) (μA/cm²); phi scales all rates (temperature). */
export function simulateHH(I: (t: number) => number, T: number, dt = 0.01, opts: { phi?: number; gNa?: number; gK?: number; gL?: number; every?: number } = {}): HHTrace {
  const phi = opts.phi ?? 1, gNa = opts.gNa ?? HH.gNa, gK = opts.gK ?? HH.gK, gL = opts.gL ?? HH.gL, every = opts.every ?? 1;
  let V = -65, n = infTau(-65, "n").inf, m = infTau(-65, "m").inf, h = infTau(-65, "h").inf;
  const out: HHTrace = { t: [], V: [], INa: [], IK: [], m: [], h: [], n: [] };
  const steps = Math.round(T / dt);
  for (let k = 0; k <= steps; k++) {
    const t = k * dt, r = hhRates(V, phi);
    const INa = gNa * m ** 3 * h * (V - HH.ENa), IK = gK * n ** 4 * (V - HH.EK);
    if (k % every === 0) { out.t.push(t); out.V.push(V); out.INa.push(INa); out.IK.push(IK); out.m.push(m); out.h.push(h); out.n.push(n); }
    const dV = (I(t) - INa - IK - gL * (V - HH.EL)) / HH.C;
    n += dt * (r.an * (1 - n) - r.bn * n); m += dt * (r.am * (1 - m) - r.bm * m); h += dt * (r.ah * (1 - h) - r.bh * h);
    V += dt * dV;
  }
  return out;
}
