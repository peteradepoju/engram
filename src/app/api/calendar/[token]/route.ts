import { createClient } from "@supabase/supabase-js";
import { WEEKS, addDays, dateOf, dayTitle, isWritten, todayIn } from "@/lib/curriculum";
import { papersForWeek } from "@/data/papers";

// A private iCalendar feed: one all-day event per study day for the next 26 weeks.
// Google Calendar subscribes to it by URL, so it works for every learner without Google sign-in.
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) return new Response("Not found", { status: 404 });
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
  const { data } = await sb.rpc("calendar_profile", { token });
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return new Response("Not found", { status: 404 });

  const start: string = row.start_date;
  const today = todayIn(row.timezone);
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://engram-peteradepoju.vercel.app";
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Engram//NeuroAI course//EN", "CALSCALE:GREGORIAN", "X-WR-CALNAME:Engram study plan", "X-PUBLISHED-TTL:PT6H"];
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const ymd = (d: string) => d.replace(/-/g, "");
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const fold = (s: string) => s.match(/.{1,70}/g)!.join("\r\n ");

  for (const w of WEEKS) {
    const monday = dateOf(w.n, 1, start);
    if (addDays(monday, 6) < today || monday > addDays(today, 7 * 26)) continue;
    if (w.kind === "rest") {
      lines.push("BEGIN:VEVENT", `UID:engram-rest-${w.n}-${start}@engram`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${ymd(monday)}`, `DTEND;VALUE=DATE:${ymd(addDays(monday, 7))}`,
        fold(`SUMMARY:${esc(`Engram rest week ${w.n}`)}`), "TRANSP:TRANSPARENT", "END:VEVENT");
      continue;
    }
    for (let d = 1; d <= 6; d++) {
      const date = dateOf(w.n, d, start);
      const title = isWritten(w.n) ? dayTitle(w.n, d) : w.title;
      const url = `${site}/learn/w${String(w.n).padStart(3, "0")}/d${d}`;
      lines.push("BEGIN:VEVENT", `UID:engram-${w.n}-${d}-${start}@engram`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${ymd(date)}`, `DTEND;VALUE=DATE:${ymd(addDays(date, 1))}`,
        fold(`SUMMARY:${esc(`Engram W${w.n} D${d}: ${title}`)}`), fold(`DESCRIPTION:${esc(`3 hours: lesson, paper, review and journal.\n${url}`)}`), fold(`URL:${url}`), "TRANSP:TRANSPARENT", "END:VEVENT");
    }
    const papers = papersForWeek(w.n);
    if (papers.length) {
      const sunday = addDays(monday, -1);
      lines.push("BEGIN:VEVENT", `UID:engram-papers-${w.n}-${start}@engram`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${ymd(sunday)}`, `DTEND;VALUE=DATE:${ymd(monday)}`,
        fold(`SUMMARY:${esc(`Engram papers for week ${w.n}`)}`), fold(`DESCRIPTION:${esc(papers.map((p) => `Day ${p.day}: ${p.title} (${p.year})`).join("\n"))}`), "TRANSP:TRANSPARENT", "END:VEVENT");
    }
  }
  lines.push("END:VCALENDAR");
  return new Response(lines.join("\r\n"), { headers: { "content-type": "text/calendar; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
