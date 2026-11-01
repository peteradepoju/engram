import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Career" };

const TIMELINE = [
  { week: "From Week 1", when: "Nov 2026 on", what: "Keep the journal, read five papers a week, and put every project on GitHub. This is your evidence later." },
  { week: "Weeks 76 to 129", when: "2028 to 2029", what: "Research sprints and part projects. Aim for one public write-up (blog post, preprint or workshop abstract)." },
  { week: "Week 140", when: "Jul 2029", what: "Shortlist 15 to 25 groups across Europe, Canada and Australia. Read two recent papers from each." },
  { week: "Weeks 145 to 152", when: "Aug to Oct 2029", what: "Contact supervisors, ask for references, draft your research statement and CV. Check each programme's deadline." },
  { week: "Weeks 158 to 161", when: "Nov to Dec 2029", what: "Submit applications. Many European and UK programmes close between November and January." },
  { week: "Week 171", when: "Jan to Mar 2030", what: "Interviews: present a project in 10 minutes, discuss a paper, answer technical questions." },
  { week: "Autumn 2030", when: "Sep to Oct 2030", what: "Start your PhD. Parts 7 and 8 of Engram overlap with your first months." },
];

const REGIONS = [
  { r: "United Kingdom", d: "Usually 3.5 to 4 years, often funded through doctoral training programmes or institutes such as the Gatsby Unit. A master's helps but is not always required." },
  { r: "Mainland Europe", d: "In Germany, the Netherlands, Switzerland and elsewhere a PhD is often an employed position with a salary, advertised by a specific group. Graduate schools such as IMPRS and the ELLIS PhD Program recruit across labs once a year." },
  { r: "Canada", d: "Usually through a university department, often with funding from the supervisor. Some students enter a master's and fast-track to the PhD. Mila and the Vector Institute connect many supervisors." },
  { r: "Australia", d: "Usually 3 to 4 years, entered after an honours or research master's degree. Scholarships (such as Research Training Program awards) cover fees and a stipend; international places are competitive." },
];

export default function CareerPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-8">
      <div className="eyebrow">PhD first, then industry or a startup</div>
      <h1 className="mt-1 text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>Career</h1>
      <p className="mt-2 text-ink-2">A plan for applying to PhD programmes in autumn 2029, with the industry and startup skills built in along the way.</p>
      <div className="mt-4 flex flex-wrap gap-2"><Link href="/career/tracker" className="btn btn-primary">Application tracker</Link><Link href="/hub/labs" className="btn">Institutes and programmes</Link></div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">PhD timeline</h2>
        <ol className="mt-3 space-y-0 border-l-2 border-accent/40 pl-5">
          {TIMELINE.map((t) => (
            <li key={t.week} className="relative pb-5">
              <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-accent" />
              <div className="text-sm font-semibold">{t.week} <span className="font-normal text-ink-3">· {t.when}</span></div>
              <div className="text-[0.97rem] text-ink-2">{t.what}</div>
            </li>
          ))}
        </ol>
        <p className="text-xs text-ink-3">Deadlines differ between programmes and change every year. Confirm each one on the official page and record it in the tracker.</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">How PhDs work in your target regions</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">{REGIONS.map((x) => <div key={x.r} className="card p-4"><div className="font-semibold">{x.r}</div><p className="mt-1 text-sm text-ink-2">{x.d}</p></div>)}</div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-lg font-semibold">Writing to a potential supervisor</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink-2">
            <li>Subject: a specific line, such as &ldquo;Prospective PhD student: continual learning and hippocampal replay&rdquo;.</li>
            <li>One sentence on who you are (MSc in mathematical sciences; what you have built).</li>
            <li>Two or three sentences on a paper of theirs you read closely and a question it raised for you.</li>
            <li>A link to one project on GitHub that shows your skills.</li>
            <li>Ask whether they expect to take students for the coming year and through which programme.</li>
          </ol>
          <p className="mt-2 text-xs text-ink-3">Keep it under 200 words. Send it 2 to 4 months before the deadline.</p>
        </div>
        <div className="card p-5">
          <h2 className="text-lg font-semibold">A strong application shows</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-2">
            <li>A research statement with a real question, not a list of interests.</li>
            <li>Evidence you can finish research: a write-up, preprint or abstract.</li>
            <li>Strong maths and code, visible on GitHub.</li>
            <li>Referees who know your research work.</li>
            <li>A clear reason for choosing that group.</li>
          </ul>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-lg font-semibold">Industry track: AI engineer</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-2">
            <li>ML engineering in Weeks 74 and 101; the industry block in Weeks 177 to 180.</li>
            <li>Portfolio: your part projects, cleaned up with tests, READMEs and demos.</li>
            <li>Skills: PyTorch, data pipelines, evaluation, deployment, LLM systems.</li>
          </ul>
        </div>
        <div className="card p-5">
          <h2 className="text-lg font-semibold">Startup track</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-2">
            <li>Week 194: from research to product.</li>
            <li>Areas where NeuroAI ideas meet products: brain-computer interfaces, neuromorphic hardware, efficient and continual learning.</li>
            <li>Keep a list of problems you notice; some become companies.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
