/** Design samples for choosing Engram's look. Each id is a value of <html data-design>. */
export const DESIGNS = [
  {
    id: "atlas",
    preview: { bg: "#f7f5f0", ink: "#16213a", accent: "#2f5d8a", head: '"Cormorant Garamond", serif', body: '"Jost Variable", sans-serif', weight: 500, em: "italic" },
    name: "Atlas",
    fonts: "Cormorant Garamond, Jost, JetBrains Mono",
    blurb: "The closest to Python Atlas: a classical serif for headings with italic accents, a clean geometric sans for reading, warm paper, navy ink and hairlines in place of boxes. Quiet uppercase buttons.",
  },
  {
    id: "quiet",
    preview: { bg: "#fbfbfc", ink: "#18191d", accent: "#5e6ad2", head: '"Geist Variable", sans-serif', body: '"Geist Variable", sans-serif', weight: 600, em: "normal" },
    name: "Quiet",
    fonts: "Geist, Geist Mono",
    blurb: "Minimal and software-like, in the spirit of Selah: one modern sans throughout, near-white surfaces, soft shadows instead of borders, a single indigo accent used sparingly. The calmest and most compact.",
  },
  {
    id: "journal",
    preview: { bg: "#fbf7f0", ink: "#2a221c", accent: "#b4532a", head: '"Fraunces Variable", serif', body: '"Source Serif 4 Variable", serif', weight: 450, em: "italic" },
    name: "Journal",
    fonts: "Fraunces, Source Serif 4, Manrope",
    blurb: "Editorial and bookish, for long reading: a soft display serif for headings, a serif made for screens in the lessons, a crisp sans for the interface, ivory paper and a terracotta accent. Rules, not cards.",
  },
  {
    id: "nocturne",
    preview: { bg: "#0a0e15", ink: "#e6ebf2", accent: "#5eead4", head: '"Space Grotesk Variable", sans-serif', body: '"IBM Plex Sans", sans-serif', weight: 600, em: "normal" },
    name: "Nocturne",
    fonts: "Space Grotesk, IBM Plex Sans, IBM Plex Mono",
    blurb: "Dark first and technical, like a lab instrument: a deep blue-black ground, a grotesque for headings, IBM Plex for text and code, and a teal signal colour. Has a matching light mode.",
  },
  {
    id: "sage",
    preview: { bg: "#f3f5f0", ink: "#1f2a24", accent: "#3d7458", head: '"Newsreader Variable", serif', body: '"Nunito Sans Variable", sans-serif', weight: 500, em: "italic" },
    name: "Sage",
    fonts: "Newsreader, Nunito Sans, IBM Plex Mono",
    blurb: "Soft and unhurried, designed to lower stress: muted green-grey tones, rounded shapes and pill buttons, generous spacing and line height, a warm serif for headings and a friendly rounded sans for text.",
  },
] as const;

export type DesignId = (typeof DESIGNS)[number]["id"] | "original";
