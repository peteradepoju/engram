// A small radix-2 FFT for figures. Arrays of length a power of two; re and im are modified in place.
export function fft(re: number[], im: number[]) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ar = re[i + k], ai = im[i + k];
        const br = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, bi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ar + br; im[i + k] = ai + bi; re[i + k + len / 2] = ar - br; im[i + k + len / 2] = ai - bi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
}
/** Power at frequencies 0 .. fs/2 of a real signal (length a power of two), with a Hann window. */
export function periodogram(x: number[], fs: number) {
  const n = x.length, re = x.map((v, i) => v * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)))), im = new Array(n).fill(0);
  fft(re, im);
  const half = n / 2;
  return { f: Array.from({ length: half + 1 }, (_, k) => (k * fs) / n), p: Array.from({ length: half + 1 }, (_, k) => (re[k] ** 2 + im[k] ** 2) / (fs * n)) };
}
