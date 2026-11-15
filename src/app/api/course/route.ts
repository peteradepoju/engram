import { createHash } from "node:crypto";
import { PAPERS } from "@/data/papers";
import { PARTS, WEEKS } from "@/lib/curriculum";

// The course, as a feed other apps can read.
//
// Euronia (the research lab) reads this so its Library carries the same papers, parts and
// weeks as the course itself: add a week here and it appears there on the next open, with
// no copy to keep in step by hand.
//
// Everything served is already public on the site. No learner data is involved.

export const dynamic = "force-static";

/** Changes whenever any of the course content changes, so a reader can tell in one cheap call. */
export const VERSION = createHash("sha256")
  .update(JSON.stringify([PAPERS, PARTS, WEEKS]))
  .digest("hex")
  .slice(0, 16);

export const CORS = {
  "access-control-allow-origin": "*",
  "cache-control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET() {
  return Response.json(
    {
      version: VERSION,
      generatedAt: new Date().toISOString(),
      counts: { papers: PAPERS.length, parts: PARTS.length, weeks: WEEKS.length },
      papers: PAPERS,
      parts: PARTS,
      weeks: WEEKS,
    },
    { headers: CORS },
  );
}
