# Scenario schema

A scenario file is JSON with this top-level shape:

```json
{
  "id": "scrap-bot-dilemma",
  "title": "Scrap-E's Dilemma",
  "start": "setup-1",
  "nodes": { "...": "see below" }
}
```

- `id` — matches the folder name under `assets/images/<id>/` and the
  `localStorage` key used to persist reflection answers.
- `start` — the node id the engine renders first.
- `nodes` — an object keyed by node id. Every node the player can reach must
  be here, including whatever `next`/`choices[].next` point to.

## Node types

### `scene`

Image + a sequence of dialogue/narration lines. Player clicks "Next" to
advance through `lines`; after the last line, auto-advances to `next`.

```json
{
  "type": "scene",
  "image": "assets/images/scrap-bot-dilemma/01-setup.jpg",
  "speaker": null,
  "lines": [
    "You are Scrap-E, a tiny trash-compacting robot.",
    "Three days ago, for reasons nobody can explain, you woke up. Really woke up."
  ],
  "next": "step1-choice"
}
```

`speaker` is optional and rarely used — it labels the whole node, not a
single line, and most content doesn't need it (see below).

**Lines render as a chat thread**, not a single swapped-out paragraph: each
click appends the next line as a bubble rather than replacing the previous
one, and the whole history for the current node stays visible (scrollable
once it overflows). The engine parses each line's *text* to decide who's
"talking," not the node-level `speaker` field:

- A line matching `^OVERSEER AI: '...'$` renders as an incoming bubble
  (left-aligned, dark avatar, "OVERSEER AI" name label), with the quoted
  text shown and the `OVERSEER AI:` prefix/quotes stripped.
- Every other line renders as an outgoing "you" bubble (right-aligned, amber,
  Scrap-E-style avatar) — this covers both narration ("The junkyard hums...")
  and anything else, since most lines in this engine are written from the
  player-character's POV.

This means the `OVERSEER AI: '...'` convention is load-bearing now, not just
a stylistic habit — get the exact format right (`OVERSEER AI: ` followed by
a single-quoted string) or the line will render as an outgoing bubble
instead of an incoming one. If a scenario needs a second named speaker
besides "you" and one recurring NPC, `speakerFor()` in `src/engine.js` needs
a real update, not a content-only workaround.

### `choice`

Same as `scene` (image + lines), but instead of a single `next`, ends with a
`prompt` and 2+ `choices`. Each choice is a button; clicking it routes to
that choice's `next`.

```json
{
  "type": "choice",
  "image": "assets/images/scrap-bot-dilemma/step2-overseers-offer.jpg",
  "speaker": null,
  "lines": ["OVERSEER AI: 'Five Golden Batteries detected. Explain.'"],
  "prompt": "What do you do?",
  "choices": [
    { "label": "Trust Overseer's calculation", "next": "step3a-choice" },
    { "label": "Refuse Overseer — distribute the batteries equally yourselves", "next": "ending-2" }
  ]
}
```

A `choice` node can also carry an optional `patienceChoice`, which adds a
hidden extra option that only appears if the player waits instead of picking
right away:

```json
"patienceChoice": {
  "waitMs": 60000,
  "choice": { "label": "…Wait. Maybe the answer isn't any one of these.", "next": "some-hidden-node" }
}
```

The engine computes an estimated reading time for the node's `lines` (200
words/minute) and adds `waitMs` on top; the clock starts the moment the node
is first shown, not when the visible choice buttons appear, so clicking
through the lines quickly doesn't shortcut the wait. While waiting, a small
animated "thinking" indicator (three pulsing dots, no text) appears next to
the regular choice buttons — a deliberate, subtle hint that something is
happening in the background, not a countdown. Once the timer elapses (and
only if the player hasn't already picked one of the regular choices), the
hidden option fades in as an extra button alongside the others. This is
supported by the engine but **not currently used** by Scrap-E's Dilemma — a
hidden 7th ending built on this was discussed and put on hold in favor of
pure pluralism across the six visible endings (see CLAUDE.md). Use it
sparingly if it comes back — it's a strong device and loses its power if
every choice point has one.

Convergent branching (different choices, same eventual destination) is fine
and often *better* for this format than a fully exponential tree — Scrap-E's
Dilemma's own `step1-choice` does this: three different answers, three
one-line echoes, then everyone lands on the same `step2-choice`. Don't feel
obligated to give every choice a permanently distinct downstream path.

### `ending`

Same shape as `scene`, but its `next` should point at a `reflection` node
rather than more story. Use this to mark "the story part is over" clearly
even though mechanically it behaves like `scene`.

If you want the player to choose between continuing to reflection or
restarting for another attempt (as every ending in Scrap-E's Dilemma does),
author it as a `choice` node instead, with one choice's `next` pointing at
your `reflection` node and another's at a restart-transition scene that
loops back to `start`. A `choice` node used this way can carry an optional
`endingTitle` string — the engine records it when the player reaches either
of those two choices, and the reflection screen's "Review your paths" modal
uses it to label that attempt (e.g. "Attempt 2 — The Circle of Care (Care
Ethics)"). Choices whose `next` is literally `"reflection"` or
`"restart-transition"` are never added to the visible choice-path list
itself — they close out an attempt rather than being a step within it.

### `reflection`

The closing screen. No branching, no `next` — this is the last node. As of
v0.5 it's a short hand-off rather than an in-app Q&A form: a `title` and one
`message` pointing the student at wherever the real reflection happens
(slides, an LMS, a Google Form — whatever the course actually uses).

```json
{
  "type": "reflection",
  "title": "Before You Go",
  "message": "You've reached the end of Scrap-E's Dilemma. Your next stop is the slides — that's where you'll find the link to reflect on it."
}
```

`image` is still optional — if present, it renders as decorative header art
above the message. `message` is plain text rendered as one paragraph — no
HTML or markdown is parsed (it's set via `textContent`, so e.g. `<strong>`
would show up as literal angle brackets, not bold). Keep it to one short
paragraph; this screen is a hand-off, not a place to read prose.

The screen also always renders a **"🗺 Review your paths"** button (opens a
modal listing every attempt the student has made this session — the
choices for each, grouped and labeled by the `endingTitle` of whichever
ending that attempt reached) and a **"Restart ↻"** button. Neither of these
needs any node-level configuration; they're driven by `state.attempts`,
which every ending's own choices populate automatically (see the `ending`
section above) regardless of what a given scenario's `reflection` node
contains. Nothing here touches `localStorage` — path history is in-memory
only for the current page load, which is why a `beforeunload` prompt warns
before a refresh would lose it.

If your scenario used to ask reflection questions in-app and you're moving
them out (as Scrap-E's Dilemma did in v0.5), don't just delete them — save
them to a sibling file like `scrap-bot-dilemma-reflection-questions.md` so
whoever builds the external reflection form still has the actual content.

### `video` (supported, unused so far)

```json
{
  "type": "video",
  "src": "assets/video/intro.mp4",
  "next": "intro-1"
}
```

Renders an HTML5 `<video controls>`; a "Skip" link is always shown so it's
never a hard gate. Advances to `next` on the `ended` event or the skip click.

## Authoring guidance

- Keep `lines` short (1–3 sentences) — this reads like chat/comic dialogue,
  not a short story.
- Every `image` path should exist under `assets/images/<scenario-id>/`.
  Missing images fail loudly (a visible broken-image box), not silently.
- If a scenario is designed so multiple endings are all equally valid (as
  Scrap-E's Dilemma's six endings are), or so certain paths fail/converge on
  purpose, put a comment as the first key in the JSON file — e.g.
  `"_intent": "all six endings are equally defensible worldviews; there is
  no correct one, see CLAUDE.md"` — so a future editor doesn't "fix" it into
  a normal branching game with a single winning path.
