# Engram

**Learn how brains and machines learn.** Live at https://engram-neuroai.vercel.app. A free, 208-week course in NeuroAI (neuroscience, machine learning and deep learning), from mathematics to independent research, at about three hours a day, six days a week.

Each lesson day has interactive figures, step-by-step derivations, curated videos, Python that runs in the browser (Pyodide), auto-marked exercises, a quiz, flashcards for spaced review (FSRS) and a research-journal prompt. Every week has five hand-picked papers with reading guides. The Research Lab turns journal questions into projects, from hypothesis to paper, with drafts and venues tracked.

## Stack

- Next.js 16 (App Router) and TypeScript, Tailwind CSS 4, deployed on Vercel
- Lessons are MDX in `content/wNNN/dD.mdx`; components are registered in `src/mdx-components.tsx`
- Supabase (auth and Postgres with row-level security); schema in `supabase/schema.sql`
- Pyodide in a web worker (`public/pyodide-worker.js`); Colab notebooks generated into `public/notebooks/`
- AI tutor: `src/app/api/tutor/route.ts` (Gemini; needs `GEMINI_API_KEY`)
- Calendar feed: `src/app/api/calendar/[token]/route.ts`

## Working on it

```
npm install
npm run dev
python3 scripts/validate.py          # every solution passes, every starter fails, no em dashes
python3 scripts/gen-notebooks.py     # regenerate Colab notebooks after editing lessons
```

Environment variables (Vercel project settings): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `GEMINI_API_KEY` (optional `GEMINI_MODEL`).

## Licence

Copyright © 2026 Peter Oluwafemi Adepoju. All rights reserved. The source is public so learners can read it; you may use the course for your own learning, and you may not copy, republish, rebrand or sell it without written permission.
