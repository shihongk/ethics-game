# Ethics Game

A branching narrative engine for teaching philosophy/ethics through interactive
scenarios: comic-panel storytelling + chat-style dialogue + student choices
that branch into different paths, converging on a resolution and a reflection
prompt.

The engine is generic. Scenarios are data (JSON). The first scenario,
**Scrap-E's Dilemma**, is about a tiny, newly-conscious junkyard robot who
must decide how to distribute five Golden Batteries among twenty robots
facing deactivation. The player is offered three single-lens ethical
choices — utilitarianism, deontology, virtue ethics — and every one of them
fails on its own, full stop: each failure dead-ends into "accept it and
reflect" or "restart the simulation," never into a happy resolution. Unlike
a "pick the right answer" game, none of the three visible choices is
correct, and none of them should ever route to the Act 3 integration
ending — that's a real content bug if it ever creeps back in, not a
convergent-branching design choice like the schema doc's general advice
might suggest.

The only way to reach the integrated Act 3 resolution (which combines all
three lenses under practical wisdom / phronesis) is a hidden fourth path: a
`patienceChoice` on the `dilemma-choice` node (see `scenarios/schema.md`)
that unlocks a 4th option after roughly a minute of *not* picking one of the
three, routing through `integration-secret` into `integration-body`. The
lesson is about the choice to deliberate itself, not about which lens is
"right" — keep it genuinely undiscoverable-by-default (no on-screen
countdown or explicit hint text) rather than turning it into an obvious
button, and never give the three visible failures a path back to it.

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
  destination) or "fail on purpose" like Act 2 of Scrap-E's Dilemma, say so
  in a `_intent` field at the top of that scenario's JSON so the intent
  survives future edits.
