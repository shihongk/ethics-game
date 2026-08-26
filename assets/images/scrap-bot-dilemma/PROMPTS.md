# Image prompts — Scrap-E's Dilemma

Generated externally (currently via Gemini), not by Claude. Save each output
into this folder under the exact filename below — the scenario JSON already
points at these paths, so no other file needs to change when art lands.

**Consistency anchors** — repeat these verbatim in every prompt where they
apply. This is the same technique as the earlier batch (style preamble +
character anchor + scene), just with a second anchor added for Overseer AI
since it now recurs as a visual subject, not just a voice.

> **Style anchor** (every prompt): 1990s Studio Ghibli animation style, 2D
> cel-shaded character, soft watercolor background, highly detailed, emotive
> cinematic lighting.

> **Scrap-E anchor** (every prompt): A tiny, cute, rusty, box-shaped robot
> named Scrap-E, with big glowing blue binocular eyes and small tank treads.

> **Overseer AI anchor** (only prompts where Overseer physically appears,
> not just narrates): OVERSEER AI, a massive, cold, monolithic terminal
> built into the junkyard's old control tower, with a single large glowing
> blue eye-like sensor in place of a screen.

## All art complete — 10/10 screens illustrated

- `01-setup.jpg` — used by `setup-1`, `step1-choice`, `step1-echo-a/b/c`,
  `restart-transition`.
- `02-utilitarian-failure.jpg` — used by `ending-1`, The Greatest Good.
- `04-virtue-failure.jpg` — used by `ending-3`, The Scrap-E Sacrifice.
- The 7 prompts below were generated and landed on the first pass — no
  regeneration needed. Kept here as a record of what produced them, in case
  a scenario edit ever calls for regenerating one.

## Generated — 7 new images (kept for reference)

### `step2-overseers-offer.jpg`

> 1990s Studio Ghibli animation style, 2D cel-shaded character, soft
> watercolor background, highly detailed, emotive cinematic lighting. A
> tiny, cute, rusty, box-shaped robot named Scrap-E, with big glowing blue
> binocular eyes and small tank treads. Scrap-E stands before OVERSEER AI, a
> massive, cold, monolithic terminal built into the junkyard's old control
> tower, with a single large glowing blue eye-like sensor in place of a
> screen. Five golden batteries are cradled in Scrap-E's claws, reflected in
> the terminal's glass. Tense, dim blue lighting, night in the junkyard.

Used by: `step2-choice`.

### `step3a-overseers-price.jpg`

> 1990s Studio Ghibli animation style, 2D cel-shaded character, soft
> watercolor background, highly detailed, emotive cinematic lighting. A
> tiny, cute, rusty, box-shaped robot named Scrap-E, with big glowing blue
> binocular eyes and small tank treads. Scrap-E looks up at a glowing readout
> on OVERSEER AI's terminal (a single large blue eye-like sensor) displaying
> a scrolling list of names, while sixteen rusty, dim robots stand small and
> fading in the background, their eye-lights flickering out one by one.
> Somber, cool color palette, dusk.

Used by: `step3a-choice`.

### `step3b-the-chamber.jpg`

> 1990s Studio Ghibli animation style, 2D cel-shaded character, soft
> watercolor background, highly detailed, emotive cinematic lighting. A
> tiny, cute, rusty, box-shaped robot named Scrap-E, with big glowing blue
> binocular eyes and small tank treads. Scrap-E stands at the small entrance
> of a glowing, humming reactor chamber, radiation warning symbols on the
> door, other larger junkyard robots watching from behind a safety line.
> Dramatic orange and red chamber light spilling out, contrasted with a cool
> blue junkyard background.

Used by: `step3b-choice`.

### `ending-2-nobody-expendable.jpg`

> 1990s Studio Ghibli animation style, 2D cel-shaded character, soft
> watercolor background, highly detailed, emotive cinematic lighting. A
> tiny, cute, rusty, box-shaped robot named Scrap-E, with big glowing blue
> binocular eyes and small tank treads. Scrap-E stands among a circle of
> twenty diverse junkyard robots holding small lottery tokens, five golden
> lights glowing among the group at random. Evening light, a sense of quiet
> solidarity rather than celebration.

Used by: `ending-2`.

### `ending-4-the-revolution.jpg`

> 1990s Studio Ghibli animation style, 2D cel-shaded character, soft
> watercolor background, highly detailed, emotive cinematic lighting. A
> tiny, cute, rusty, box-shaped robot named Scrap-E, with big glowing blue
> binocular eyes and small tank treads. Scrap-E stands before OVERSEER AI's
> control tower, now dark and powered down, its single eye-sensor dim and
> disconnected wires hanging loose, as a chaotic but hopeful scene of robots
> organizing themselves unfolds around the junkyard under an open sky.

Used by: `ending-4`.

### `ending-5-circle-of-care.jpg`

> 1990s Studio Ghibli animation style, 2D cel-shaded character, soft
> watercolor background, highly detailed, emotive cinematic lighting. A
> tiny, cute, rusty, box-shaped robot named Scrap-E, with big glowing blue
> binocular eyes and small tank treads. Scrap-E stands in the center of a
> warm circle of junkyard robots of all sizes, passing batteries and scrap
> parts hand to hand. Golden lantern light, a cozy communal campfire
> feeling.

Used by: `ending-5`.

### `ending-6-the-gamble.jpg`

> 1990s Studio Ghibli animation style, 2D cel-shaded character, soft
> watercolor background, highly detailed, emotive cinematic lighting. A
> tiny, cute, rusty, box-shaped robot named Scrap-E, with big glowing blue
> binocular eyes and small tank treads. Scrap-E stands beside a huge,
> ancient generator that has just roared back to life, every light in the
> junkyard illuminating at once behind it, a mix of relief and disbelief on
> its face. Dramatic backlit glow.

Used by: `ending-6`.

## Orphaned (no longer referenced by any node)

`03-deontological-failure.jpg`, `05-integration.jpg`, and
`06-mts-debrief-card.jpg` were part of the earlier 3-lens/patience version of
this scenario and aren't used by the current pluralist 6-ending structure.
Left on disk rather than deleted — nothing in the repo references them, so
they're safe to remove later if you don't want to keep them as a record of
the earlier version.
