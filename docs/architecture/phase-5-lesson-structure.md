# Phase 5 — Lesson structure (proposal)

**Status:** PROPOSAL — awaiting approval before any lesson is restructured.
**Date:** 2026-11-02

## 1. Today

- **Format:** each lesson is a typed object with `objectives`, a list of `blocks` and a `knowledgeCheck`. There are 9 block types: concept, keyPoints, illustration, example, callout, steps, terms, explore and cta.
- **Order:** blocks come in any order. The validator only requires a concept, an illustration and an example.
- **Missing:** nothing records which of the six sections a block belongs to, the lesson's level, its prerequisites, its topics or related lessons.

Block use across the 50 lessons:

| Module | Lessons | concept | illustration | example | callout | steps | terms | keyPoints |
|---|---|---|---|---|---|---|---|---|
| Basics | 11 | 18 | 15 | 11 | 9 | 4 | 5 | 4 |
| Pre-ride | 12 | 12 | 12 | 12 | 12 | 4 | 3 | 4 |
| Handling | 10 | 10 | 11 | 10 | 6 | 6 | 2 | 2 |
| Mechanics | 17 | 17 | 26 | 17 | 4 | 1 | 6 | 8 |

## 2. Proposed format (backward compatible)

All new fields are optional. A lesson that hasn't been migrated renders exactly as it does today.

```ts
type SectionKind = 'concept' | 'components' | 'mechanism' | 'physics' | 'application' | 'misconceptions'
type Level = 'beginner' | 'intermediate' | 'advanced'
type TopicId = 'controls' | 'engine' | 'clutch' | 'gearbox' | 'drivetrain' | 'braking' | 'load-transfer'
             | 'traction' | 'cornering' | 'suspension' | 'electronics' | 'maintenance' | 'protective-gear' | 'road-craft'

interface Lesson {
  // …existing fields…
  level?: Level
  topics?: TopicId[]
  prerequisites?: string[]   // "moduleId/lessonId"
  related?: string[]
}

// New blocks
| { type: 'section'; kind: SectionKind; heading?: string }               // starts one of the six sections
| { type: 'components'; items: { name: string; role: string; part?: PartId }[] }
| { type: 'physics'; body: string[]; maths?: { expr: string; meaning: string }[] }
| { type: 'misconceptions'; items: { myth: string; reality: string }[] }

interface QuizQuestion { /* …existing… */ topic?: TopicId }   // used by Phase 7 (topic-level progress)
```

### How it renders
- **Six headings:** each lesson shows the same six headings in the same order: *What are we learning? · Which parts are involved? · What actually happens? · The physics · What the rider experiences · Common misconceptions*.
- **"On this page" list:** a short list at the top jumps to each section.
- **Existing blocks keep their job.** Illustrations, examples, steps, callouts and terms sit inside whichever section they belong to.
- **Components:** a list of parts and what each does. A part also found in the Anatomy Explorer links to it.
- **Physics, by level** (the brief's "introduce mathematics progressively"):
  - *beginner*: plain words only, with no formulas;
  - *intermediate*: formulas in a collapsible "Show the maths" box;
  - *advanced*: formulas shown inline.
- **Misconceptions:** shown as myth → reality pairs. This is where the Phase 1 corrections become teaching, for example "the weight moves forward", "gyroscopes keep it upright" and "countersteering only works at speed".
- **Below the knowledge check:** prerequisites ("Read first") and related lessons, linked.

### The validator
- **Migrated module:** marked `structured: true`. Its lessons must have all six sections in order, a level and at least one topic, and every quiz question needs a topic.
- **Not yet migrated:** missing sections are reported as warnings, not errors.
- **Safety callouts (Phase 6):** the rule requiring a safety callout in braking, cornering, acceleration and traction lessons builds on the topics added here.

## 3. Which lessons get which sections

Not every lesson needs a physics section. Pre-ride lessons on helmets, mirrors or protective equipment are mostly procedure and judgement.
- **Physics optional:** the physics section may be left out in lessons whose topics are only `protective-gear` or `road-craft`. The validator allows this.
- **Mechanical lessons:** braking, clutch, tyres, chain and so on always have it.

## 4. Batches

Each batch is restructured, checked against the Phase 1 report and tested in a browser before the next starts.

| Batch | Module | Lessons | Why this order |
|---|---|---|---|
| 1 | **Motorcycle Basics** | 11 | The foundation every learner reads first; contains the clutch, throttle, brakes, gears and drivetrain lessons. **I stop after this batch so you can review the format on real lessons.** |
| 2 | Turning & Handling | 10 | Most of the remaining Phase 1 corrections (countersteering, lean, load transfer). |
| 3 | Advanced Mechanics | 17 | Physics-heavy; uses the "advanced" level with inline formulas. |
| 4 | Pre-ride Preparation | 12 | Mostly procedure; physics only where it belongs (tyres, brakes, chain). |

## 5. Example: `basics/understanding-clutch` after restructuring (outline)

1. **What are we learning?** What the clutch does: connecting and disconnecting the engine from the gearbox, and why the rear wheel must sometimes stop while the engine runs.
2. **Which parts are involved?** Lever; cable or hydraulic release; pushrod; pressure plate and springs; friction and steel plates; basket (driven by the crank); hub (on the gearbox shaft).
3. **What actually happens?** Lever → freeplay → pushrod lifts the pressure plate → clamp load falls → plates slip → no torque passes. The clutch illustration, and the link to the clutch explorer.
4. **The physics** (beginner, so in words): friction between clamped plates carries the twisting force; less clamping means less force can pass; slipping turns the difference into heat.
5. **What the rider experiences:** the biting point, the friction zone, pulling away (existing steps), creeping in traffic (existing example), and the "riding with the clutch half in" mistake.
6. **Common misconceptions:**
   - "The clutch is either on or off": there is a whole friction zone.
   - "Lever in means nothing passes at all": a wet clutch drags slightly.
   - "A stall means the engine ran out of power": it means it ran out of *torque* at low speed.

Then: knowledge check (questions tagged `clutch`). Read first: *Engine basics*, *Understanding torque*. Related: *Clutch plates*, *Understanding the drivetrain*.

## 6. What stays the same

Lesson URLs and IDs (so progress records and links keep working), quiz questions (wording may be corrected), illustrations, the page design and the existing block styles.
