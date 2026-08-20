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
  "image": "assets/images/scrap-bot-dilemma/01-setup.png",
  "speaker": null,
  "lines": [
    "You are Scrap-E, a tiny trash-compacting robot.",
    "Three days ago, for reasons nobody can explain, you woke up. Really woke up."
  ],
  "next": "dilemma-choice"
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
  "image": "assets/images/scrap-bot-dilemma/01-setup.png",
  "speaker": null,
  "lines": ["Five batteries. Twenty robots who need them."],
  "prompt": "How do you distribute the batteries?",
  "choices": [
    { "label": "Give all 5 to the 5 strongest robots", "next": "util-outcome" },
    { "label": "Split all 5 into 20 equal pieces", "next": "deont-outcome" },
    { "label": "Give away your own battery and parts", "next": "virtue-outcome" }
  ]
}
```

A `choice` node can also carry an optional `patienceChoice`, which adds a
hidden 4th option that only appears if the player waits instead of picking
right away:

```json
"patienceChoice": {
  "waitMs": 60000,
  "choice": { "label": "…Wait. Maybe the answer isn't any one of these.", "next": "integration-secret" }
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
hidden option fades in as a 4th button alongside the others. Use this
sparingly — it's a strong device (Scrap-E's Dilemma uses it to reward
deliberation itself, distinct from any single ethical lens) and loses its
power if every choice point has one.

Convergent branching is fine and often *better* for this format: different
choices can route to different flavor-text outcome nodes that all funnel
back into the same next dilemma. The point of a scenario like Experience
Machine is that the branches feel different but the destination doesn't
change — don't feel obligated to build an exponential tree.

### `ending`

Same shape as `scene`, but its `next` should point at a `reflection` node
rather than more story. Use this to mark "the story part is over" clearly
even though mechanically it behaves like `scene`.

### `reflection`

No image sequence. A title, optional intro lines, and a list of open-ended
questions. No right answers, no branching, no `next` — this is the last
node.

```json
{
  "type": "reflection",
  "image": "assets/images/scrap-bot-dilemma/06-mts-debrief-card.jpg",
  "title": "After the Junkyard",
  "questions": [
    "Utilitarianism asks 'what produces the best overall outcome?' Can you think of a real-world example where maximizing the greatest good still feels wrong?"
  ]
}
```

`image` is optional — if present, it renders as decorative header art above
the questions (not a sequential `scene`-style panel; no lines, no click-to-
advance). Omit it for a plain text reflection screen.

The engine renders each question with an optional textarea. If the student
types an answer, it's saved to `localStorage['ethics-game:<scenario-id>']`
on blur — nothing is sent anywhere. A "Restart" button resets the run.

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
- If a scenario is designed so every Act 2-style path fails/converges on
  purpose (as Scrap-E's Dilemma's three ethical-lens choices are), put a
  comment as the first key in the JSON file — e.g. `"_intent": "each Act 2
  choice fails on its own by design; they converge on the Act 3 integration
  node, see CLAUDE.md"` — so a future editor doesn't "fix" it into a normal
  branching game with a single winning path.
