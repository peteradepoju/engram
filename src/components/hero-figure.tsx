/** Decorative hero panel for the home page: a raster of place-cell spikes and the decoded posterior, drawn with theme tokens. */
export function HeroFigure() {
  let a = 1998;
  const rnd = () => { a = (a * 1103515245 + 12345) % 2147483648; return a / 2147483648; };
  const cells = Array.from({ length: 14 }, (_, i) => 20 + i * 22 + rnd() * 8);
  const path = (t: number) => 170 + 140 * Math.sin(t / 38);
  const spikes: [number, number][] = [];
  for (let t = 0; t < 300; t += 2) {
    const x = path(t);
    cells.forEach((c, i) => { if (rnd() < 0.42 * Math.exp(-(((x - c) / 18) ** 2)) + 0.004) spikes.push([t, i]); });
  }
  const post = Array.from({ length: 61 }, (_, k) => { const x = k * 5; return Math.exp(-(((x - 214) / 14) ** 2)) + 0.25 * Math.exp(-(((x - 120) / 10) ** 2)); });
  return (
    <figure className="hero-figure card hidden overflow-hidden p-5 md:block" aria-label="Spikes from fourteen place cells and the decoded position">
      <div className="eyebrow">Week 36 · decoding place cells</div>
      <svg viewBox="0 0 330 250" className="mt-3 w-full">
        {cells.map((_, i) => <line key={i} x1="0" x2="300" y1={10 + i * 9} y2={10 + i * 9} stroke="var(--line)" strokeWidth="0.6" />)}
        {spikes.map(([t, i], k) => <line key={k} x1={t} x2={t} y1={6 + i * 9} y2={14 + i * 9} stroke={i % 3 === 0 ? "var(--neuro)" : "var(--ink-2)"} strokeWidth="1.3" strokeLinecap="round" />)}
        <polyline points={Array.from({ length: 151 }, (_, k) => `${k * 2},${10 + ((path(k * 2) - 20) / 286) * 117}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="1.6" opacity="0.85" />
        <text x="304" y="14" fontSize="8" fill="var(--ink-3)">cells</text>
        <line x1="0" x2="300" y1="160" y2="160" stroke="var(--line)" />
        <polygon points={`0,232 ${post.map((v, k) => `${k * 5},${232 - v * 60}`).join(" ")} 300,232`} fill="var(--ai-soft)" />
        <polyline points={post.map((v, k) => `${k * 5},${232 - v * 60}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <line x1="214" x2="214" y1="166" y2="236" stroke="var(--ink)" strokeDasharray="3 3" strokeWidth="0.8" />
        <text x="0" y="176" fontSize="8.5" fill="var(--ink-3)">posterior over position</text>
        <text x="218" y="174" fontSize="8.5" fill="var(--ink-2)">true position</text>
      </svg>
      <figcaption className="mt-2 text-[0.8rem] leading-snug text-ink-3">Every spike adds the logarithm of its cell&apos;s place field. You build this decoder in Week 36, from scratch, in the browser.</figcaption>
    </figure>
  );
}
