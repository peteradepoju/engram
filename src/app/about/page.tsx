import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="prose-engram mx-auto max-w-2xl px-4 pt-8">
      <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>About Engram</h1>
      <p>An <em>engram</em> is the physical trace a memory leaves in the brain. This course is about building such traces, in you and in machines.</p>
      <p>Engram is a free, 208-week course in NeuroAI, from the mathematics of neural data to independent research. It is written and maintained by Peter Oluwafemi Adepoju, an applied mathematician working on NeuroAI.</p>
      <h2>How it is made</h2>
      <ul>
        <li>Every lesson is written for Engram. Textbooks are recommended and linked, never copied.</li>
        <li>Videos are embedded from YouTube in privacy-enhanced mode and credited to their creators.</li>
        <li>Paper summaries and questions are original; the papers belong to their authors and publishers.</li>
        <li>Interactive figures and code are original to Engram.</li>
      </ul>
      <h2>Privacy</h2>
      <p>Your account stores your progress, review deck, notes, journal and projects. Row-level security means only you can read them. Projects are private unless you choose to make one public.</p>
      <h2>Licence</h2>
      <p>Course materials © 2026 Peter Oluwafemi Adepoju. All rights reserved. You may use the course for your own learning. You may not copy, republish or sell it without written permission.</p>
    </div>
  );
}
