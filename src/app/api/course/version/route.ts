import { CORS, VERSION } from "../route";

// Just the version, so a reader can check for changes without downloading the whole course.

export const dynamic = "force-static";

export async function GET() {
  return Response.json({ version: VERSION }, { headers: CORS });
}
