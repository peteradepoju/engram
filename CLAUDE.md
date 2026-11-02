# Engram: notes for Claude

A free 208-week NeuroAI course by Peter Oluwafemi Adepoju. Repo: github.com/peteradepoju/engram. Hosting: Vercel (team "peteradepoju"). Database: Supabase project `engram` (ref ugqqmjnkhqrhfajhvfiu, eu-west-2).

## The standing task

Write the course week by week, to the standard of Weeks 1 and 2, staying at least two weeks ahead of Peter's schedule (Day 1 = Monday 16 November 2026, 6 days a week, Day 7 rest, rest week every 13th week). The full map is `src/lib/weeks.json` (titles) and `src/lib/curriculum.ts` (parts, day titles, `WRITTEN_WEEKS`). For each new week:

1. Add the six day titles to `DAY_TITLES` and the week number to `WRITTEN_WEEKS` in `src/lib/curriculum.ts`.
2. Write `content/wNNN/d1.mdx` to `d6.mdx` (Day 6 is a Forge in Weeks 1 to 104, a Research Day after).
3. Add five papers for the week to `src/data/papers.ts` (one marked `deepRead`), each matched to a day. Only cite papers you are certain exist; link DOIs or official pages.
4. Add new figures to `src/components/figures/` and export them from `index.ts`.
5. Run `python3 scripts/validate.py wNNNd1 ...`, `python3 scripts/gen-notebooks.py`, `npx next build`, then commit and push.

## Lesson format

`export const meta = { title, intro, goals, plan: [{label, minutes}], paper }` then the 2-hour lesson using `<Predict>`, `<Step n title minutes>`, `<Figure>`, `<Video id title by note>` (one embedded video per day; Peter wants real embeds, not search links, so do not use `WatchList`. Verify every YouTube id before use: this session cannot reach YouTube, but 3Blue1Brown ids are listed in the `video:` field of each lesson in the public repo 3b1b/3blue1brown.com (`app/pages/lessons/*/*/index.mdx`), Neuromatch ids are in the notebooks of NeuromatchAcademy/course-content (`('Youtube', 'ID')`), and any other id can be checked with `gh api 'search/code?q=ID'` (it should appear in other people's pages with the expected title). The player still detects a missing video and shows a find link. Non-video resources go in `<Reading>`), `<Derivation>` (one child per step), `<Bridge neuro="..." ai="...">`, `<PyCell code={String.raw`...`} tests={String.raw`...`} solution={String.raw`...`} prompt="..." hint="..." id="...">`, `<Prove task="...">` (markdown children = worked solution), `<Quiz questions={[...]}>`, `<Flashcards cards={[...]}>`, `<Key>`, `<Reading>`, `<JournalPrompt prompt="...">`, `<Callout kind="think|note|warning|history|research">`.

MDX gotchas: MDX strips up to 2 leading spaces from every line inside a `String.raw` prop, so write code normally and then run `python3 scripts/indent-raw.py content/wNNN/dD.mdx` once on each new file (the cell, validator and notebook generator dedent it). Attribute strings (`hint="..."`, `prompt="..."`) cannot contain double quotes. Display maths goes on its own lines between `$$` fences, and each `<Derivation>` step is a `<div>` with blank lines inside so markdown renders. never put `<` in prose (write "less than", or `\lt` in maths); maths inside JSX attribute strings must be a plain string prop (rendered by `Tex`), never JSX; in quiz/flashcard strings escape backslashes (`\\frac`). Tests are `test_` functions; their docstring is shown as the check name. Use `dis` rather than `inspect.getsource` to inspect learner functions.

## Style rules (Peter's)

No em dashes anywhere. British spelling. Credit every adapted source. Nothing that reads as AI-generated. The course stays free. Direct feedback to Peter.

## Security

Never ask for or handle secret keys. The Supabase publishable key and URL are public. `GEMINI_API_KEY` is set by Peter in Vercel.
