# Ethics Game

A branching narrative engine for teaching philosophy/ethics through interactive
scenarios: comic-panel storytelling + chat-style dialogue + student choices
that branch into different paths, converging on a resolution and a reflection
prompt.

The engine is generic. Scenarios are data (JSON). The first scenario,
**Scrap-E's Dilemma**, is about a tiny, newly-conscious junkyard robot who
must decide how to distribute five Golden Batteries among twenty robots
facing deactivation. Its content was drafted collaboratively (Shihong's
QKS54C group project — see `/Users/shihong/Documents/Claude/2. Teaching/
Multidimensional Thinking Skills (QKS54C)/` for the course context) and
reworked into a condensed branching structure in this repo.

**Design thesis: pure pluralism, not a "correct answer."** The story
branches into six distinct endings — utilitarianism, deontology, virtue
ethics, existentialism/autonomy, care ethics, and risk/consequentialism —
and all six are written as equally defensible worldviews, each closing on
its own "moral question" rather than a verdict. Do not add a mechanic that
declares one ending the "right" one or converges the endings into a single
integrated resolution — that was an earlier design (see git tag `v0.1`/`v0.2`
if you need the old convergent-failure + hidden-patience-integration
version) and it's been deliberately replaced, not left unfinished. A hidden
7th "patience" ending (reusing the engine's existing `patienceChoice`
mechanic, documented in `scenarios/schema.md`) was discussed and put on
hold — it isn't in the current content, but the engine still supports it if
the group decides to add it back later.

**Routing** (see `scenarios/scrap-bot-dilemma.json`): `step1-choice` is a
light hook that converges regardless of answer. `step2-choice` is the real
fork — two of its four answers resolve straight to an ending
(`ending-2` deontology, `ending-5` care ethics), the other two continue to
one more choice (`step3a-choice` → `ending-1` utilitarianism / `ending-4`
existentialism; `step3b-choice` → `ending-3` virtue ethics / `ending-6`
risk). No path is longer than 3 decision points. Every ending is a `choice`
node offering "Reflect on this ending" or "Try a different path" (which
loops back to `setup-1` through `restart-transition`) before the shared
`reflection` node — the same reflect-or-restart pattern the old failure
endings used, even though nothing here is framed as a failure.

## Stack

Deliberately no framework, no build step, no dependencies. Plain HTML/CSS/JS
so it can be opened directly or hosted as flat files anywhere (school server,
GitHub Pages, USB stick). If a scenario ever needs something a static page
can't do, that's a decision to raise with the user before adding a build
step — don't introduce one silently.

## Running it locally

```bash
cd /Users/shihong/Documents/Kiro/ethics-game
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Two query params help with testing:
`?scenario=<id>` picks a scenario other than the default, and `?node=<id>`
jumps straight to a node instead of playing from `start` — handy for
checking one branch/panel without replaying the whole thing. Both are dev/QA
conveniences, not gameplay features.

Opening `index.html` directly via
`file://` mostly works too, but `fetch()` of the scenario JSON can be blocked
by browser CORS rules on `file://` in some browsers — use the local server if
panels fail to load.

## File layout

```
index.html                                entry point, mounts the engine
src/engine.js                             scenario-agnostic runtime (no scenario content lives here)
src/style.css                             visual design system for panels/chat/choices
scenarios/scrap-bot-dilemma.json          the first scenario's full content graph
scenarios/schema.md                       node-type reference for authoring new scenarios
assets/images/<scenario-id>/*.png         panel art, one folder per scenario
assets/images/<scenario-id>/PROMPTS.md    image-gen prompts used for that scenario's art, mapped to filenames
```

## Scenario schema (short version — full reference in `scenarios/schema.md`)

A scenario is a JSON file: `{ id, title, start, nodes: { ... } }`. Each node
has a `type` and a `next` (or `choices` for branch points). Node types:

- `scene` — image + sequential dialogue/narration lines, advances on click
- `choice` — like `scene`, but ends in 2+ labeled buttons that route to
  different node ids
- `ending` — like `scene`, but routes into a `reflection` node instead of
  more story
- `reflection` — open-ended discussion questions, no branching; optional
  textarea per question, answers persist to `localStorage` only (no backend,
  nothing leaves the browser)
- `video` — supported by the engine (embeds an HTML5 `<video>`, advances on
  end or a skip click) but unused so far since no video asset exists; wire
  one in by making it the `start` node

The engine has no knowledge of any scenario's content — it just walks
whatever graph `scenarios/<id>.json` describes. Adding a second scenario
means adding a new JSON file + image folder, not touching `engine.js`.

## Art

Panels are PNGs generated externally (currently via Gemini) from the prompts
in each scenario's `assets/images/<id>/PROMPTS.md` — this session's toolset
has no image generator, so art production happens outside this repo and gets
dropped into `assets/images/<id>/` under the filenames the scenario JSON
already references. Until an image exists, the engine shows a clean
"artwork pending" placeholder instead of a broken-image icon, so the game is
fully playable/testable before art lands. Keep the **style anchor line**
(the shared character/style description) identical across every prompt in a
scenario so the panels look like one consistent work — see
`assets/images/scrap-bot-dilemma/PROMPTS.md` for the current anchor.

## Conventions

- No student data leaves the browser. Reflection answers go to
  `localStorage` under a per-scenario key; there is no backend and none
  should be added without checking with the user first (this is meant for
  classroom use, not data collection).
- Keep node `lines` short — this is meant to read like chat/comic dialogue,
  not prose paragraphs. 1–3 sentences per line. Dialogue from a named
  character can be embedded as `NAME: '...'` inside a narration line rather
  than switching `speaker` mid-node — see how Overseer AI's lines are written
  in `scenarios/scrap-bot-dilemma.json`.
- When a scenario's choices are convergent (different flavor, same
  destination), fail on purpose, or — like Scrap-E's Dilemma — deliberately
  pluralist (multiple valid endings, no correct one), say so in a `_intent`
  field at the top of that scenario's JSON so the intent survives future
  edits.
