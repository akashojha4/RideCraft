# Phase 0 — Codebase Audit

**Project:** RideCraft (formerly MotoLab) · **Date:** 2026-11-02 · **Scope:** read-only; no source code was changed.

Method: read the source of every layer, measured the production build, ran one targeted browser test (corrupted saved progress, against the local dev server) and searched lesson content for the specific technical claims named in the brief. Physics findings here are *candidates* found while reading the code; the full content and physics accuracy audit is Phase 1.

No finding is rated **Critical** (nothing currently loses data, exposes data or teaches a dangerous technique). Five are **High**.

---

## 1. Current application architecture

| Layer | Location | Notes |
|---|---|---|
| Entry & routing | `src/main.tsx`, `src/app/router.tsx` | React Router 7 data router; 16 lazy routes; one `RouteErrorPage` (now auto-reloads on stale chunks). |
| Layout & UI kit | `src/components/layout`, `src/components/ui` | `AppShell`, header, footer, `Container`, `Button`, `Slider`, `ProgressBar`, `SectionHeading`… |
| Physics | `src/lib/mechanics/*.ts` (11 files, ~1,000 lines) | Pure functions, no React. |
| Simulation runtime | `src/lib/simulation`, `src/lib/scenarios`, `src/hooks/usePowertrainSim.ts`, `useSimulationClock.ts` | Two engines (see §3). |
| Content | `src/content/**` | Typed data: 4 modules / 50 lessons / 158 questions, 14 scenarios, 4 simulator scripts, anatomy (16 parts + 9 detail diagrams), 47 illustrations. |
| Progress | `src/lib/progress/*.ts` | `localStorage` store, summary/levels, seeded assessment. |
| Styling | `src/styles/index.css` | Tailwind v4 `@theme` tokens, dark-only. |

- **Runtime:** no network calls, environment variables, secrets, backend, database or authentication.
- **Build:** 2.1 MB `dist`, 150 JS chunks.
  - The entry chunk is 148 KB gzip and holds React, React DOM, Router and Motion.
  - The curriculum chunk is 46 KB gzip, and CSS is 15 KB.
- **TypeScript:** 7 with strict defaults and `noUnusedLocals`/`noUnusedParameters`. Lint uses oxlint with the React Compiler rules.
- **Hosting:** GitHub `akashojha4/RideCraft` deploys to Vercel automatically.

## 2. Lesson structure and content management

- **Lesson data:** each lesson is a typed object (`src/content/types.ts`) with `id`, `title`, `summary`, `durationMinutes`, `objectives`, `blocks[]` and `knowledgeCheck[]`.
- **Block types:** `concept`, `keyPoints`, `illustration`, `example`, `callout` (tones: tip, info, mistake, safety), `steps`, `terms`, `explore` and `cta`.
- **Validation:** `validateCurriculum()` checks for unique IDs, the required `concept`, `illustration` and `example` blocks, at least one question per lesson, and that each correct answer exists. It runs in development only.
- **Callout tones across the content:** 18 safety, 16 tip, 10 mistake and 7 info.

## 3. The four simulators

| Simulator | Route | Engine | State location |
|---|---|---|---|
| Starting | `/simulators/starting` | **Keyframed timeline** (`lib/simulation/timeline.ts` + `content/simulators/starting.ts`): scripted, a pure function of time T | Component holds T, mode, armed step, feedback (5 `useState`) |
| Clutch & throttle | `/simulators/clutch-throttle` | **Real-time powertrain** (`powertrain.ts` via `usePowertrainSim`) | Hook |
| Gear shifting | `/simulators/gears` | Real-time powertrain + `gearbox.ts`, `autoShift.ts`, `useGearLever` | Hook |
| Riding & stopping | `/simulators/ride-and-stop` | Real-time powertrain + `braking.ts` | Hook |

Shared pieces: `PlaybackControls`, `ExerciseBar`, `useExercises` (19 scored exercises), `Readouts`, `GearLever`, `TopicCards`, `SimCard`. The scenario engine (`lib/scenarios/sim.ts`) reuses `powertrain`, `braking` and `cornering`. Illustrations use their own `useLoopTime` loops.

## 4. Physics calculations (summary)

| Model | What it does | Assessment |
|---|---|---|
| `clutch.ts` | Lever → clamping force, linear between 15 % and 60 % travel | Too simple for the brief (finding C1) |
| `powertrain.ts` | 125 cc engine torque curve, idle controller, friction and pumping, slipping/locking clutch, 225 kg vehicle, drag, rolling, grade, brakes, 2 ms substeps | Sound structure; small omissions (C3, C6) |
| `gearbox.ts` | 5-speed, primary 3.35, final 3.0 (45/15), 1.88 m tyre; 1-N-2-3-4-5 selector with half-shift to neutral | Ratios plausible (≈34 km/h at 9,000 RPM in 1st, ≈105 km/h in 5th); selector logic correct |
| `braking.ts` | Load transfer `front = 0.45 − (h/L)(a/g)` with 0.15 s lag; per-tyre μ·N limit; lock, sliding 75 %, ABS 92 %, CBS | Correct moment-balance formula; consistent (rear unloads fully only at 1.19 g, above dry μ) |
| `cornering.ts` | `tan φ = v²/gR`, grip lean `atan μ`, Åström point-mass lean dynamics, body-position CoM solver | Correct for the stated idealisation; zero-width tyre assumption (C5) |
| `tyre.ts` | Pacejka-form μ(slip), ABS/TC cycling sim | Reasonable shape; constants disagree with `braking.ts` (C4) |
| `combustion.ts`, `engineSystems.ts`, `throttle.ts`, `engine.ts` | Wiebe burn, EFI/carb/cooling/lubrication, butterfly airflow, four-stroke table | Plausible; to be checked in Phase 1 |

No physics function has a unit test (finding G1).

## 5. Anatomy and SVG components

- **Side view:** `MotorcycleSideView.tsx` draws the interactive motorcycle. Its hotspots can be reached with Tab and work from the keyboard.
- **Detail diagrams:** nine schematics in `components/anatomy/diagrams` (Brake, Chain, Clutch, Engine, Exhaust, Gearbox, Suspension, Throttle, Wheels), each loaded through `registry.ts`.
- **Clutch diagram:** `ClutchDiagram.tsx` is a cross-section with 7 plates. The friction plates are keyed to the basket and the steel plates to the hub, which is correct. A slider drives `clampingForce()`. The diagram doesn't show basket or hub rotation, the release mechanism or springs under load, which makes it the starting point for the clutch explorer (Phase 4).

## 6. Progress and localStorage

- **Storage:** one key, `motolab:progress:v1`, holding `{ version: 1, lessons, exercisesPassed, scenariosSolved, history (≤200), assessments (≤50) }`.
- **Reads and updates:** React reads the store through `useSyncExternalStore`, with an in-memory fallback when storage is unavailable. Changes made in another tab are picked up through the `storage` event.
- **What gets recorded:**
  - `visitLesson` when a lesson is opened;
  - `recordQuiz`, which counts attempts, keeps the best and last scores, and **marks the lesson complete on any finished quiz**;
  - `recordPractice` for simulator exercises and scenario decisions;
  - `recordAssessment` for assessment attempts.
- **Dashboard:** `summary.ts` adds up points and levels. The dashboard's "next lesson" is simply the first incomplete lesson in course order.

## 7. Responsive design

- Tailwind breakpoints, mobile-first; Stage 1 Phase 13 verified all 81 routes at 375 px and 768 px with no horizontal scroll, keyboard operation of sliders/quizzes, skip link, reduced-motion behaviour and axe WCAG 2.1 AA with 0 serious/critical issues.
- **Not yet verified:** touch-target sizes (WCAG 2.5.8 asks for 24 × 24 px minimum) on SVG hotspots, gear lever and playback buttons; landscape phones; pinch-zoom on diagrams.

## 8. Test coverage

- **In the repository: none.** No unit, integration or end-to-end tests, no `npm test`, no CI.
- **Outside the repository:** about 100 puppeteer scripts covering 550 end-to-end checks, plus the physics measurement scripts. They live only in the session's temporary scratchpad and need system Chrome and a dev server on port 5173.

---

## 9. Findings

Each finding: **severity · existing implementation · problem · recommendation · files · dependencies/risks.**

### Testing and infrastructure

**G1 · High · Tests are not in the repository; no unit tests; no CI**
- *Existing:* 550 browser checks and measurement scripts in a temporary folder.
- *Problem:* they can be lost on reboot, nobody else can run them, and every later phase needs regression tests. The physics is verified only indirectly.
- *Recommendation:*
  - Move the end-to-end suites into `tests/e2e/` (Playwright or the existing puppeteer).
  - Add Vitest unit tests for `lib/mechanics`, `lib/progress` and `lib/simulation`.
  - Add `npm test` and a GitHub Actions workflow.
- *Files:* new `tests/`, `package.json`, `.github/workflows/`.
- *Risks:* adds dev dependencies only; none at runtime.

**G2 · High (unverified) · Refreshing a nested route on Vercel probably returns 404**
- *Existing:* no `vercel.json` rewrite.
- *Problem:* deep links such as `/learn/handling/countersteering` fail on refresh or when shared.
- *Recommendation:* add `vercel.json` with an SPA rewrite to `/index.html`, and include a refresh test in the end-to-end suite.
- *Files:* `vercel.json`.
- *Risks:* none; needs the live URL to confirm.

**G3 · Medium · No error monitoring and no security headers**
- *Problem:* crashes on visitors' devices are invisible. CSP, `X-Content-Type-Options`, `Referrer-Policy` and `frame-ancestors` are not set.
- *Recommendation:* add the headers in `vercel.json`. Error reporting is optional, for example Sentry's free tier, but it is an external service and needs your approval.
- *Files:* `vercel.json`.
- *Risks:* a CSP that is too strict could block the self-hosted fonts or inline styles, so it must be tested.

**G4 · Low · Small technical debt**
- `PhasePending` is still referenced by `ModulePage` and `roadmap.ts` for modules without lessons; no such module exists any more.
- `AnatomyPage` sets `document.title` by hand instead of using `usePageTitle`.
- `VISUAL_SLOWDOWN = 28` is defined in two files (`content/simulators/starting.ts` and `hooks/usePowertrainSim.ts`).
- `/design-system` is publicly routable.
- `package.json` is at version 0.0.0 with no Node `engines` pin.
- The README is minimal.
- *Risk:* none.

### Progress and assessment

**E1 · High · Saved progress is not validated, and malformed data crashes pages permanently**
- *Existing:* `read()` does `{ ...empty(), ...JSON.parse(raw) }` with a type cast.
- *Problem (verified in a browser):*
  - `lessons: null` crashes both `/progress` and `/learn` ("Cannot read properties of null").
  - `history: {}` crashes `/progress` ("p.history.slice is not a function").
  - The pages stay broken until the visitor clears site data.
  - Invalid JSON and wrong field types inside records were handled safely.
- *Recommendation:*
  - Add a field-by-field validator that drops bad records instead of whole sections.
  - Read the `version` field and add a migration function.
  - Keep a backup copy of any unreadable data instead of discarding it.
- *Files:* `src/lib/progress/store.ts`.
- *Risks:* must not drop valid progress, so unit tests with real saved samples are needed. A prerequisite for export/import and any future sync.

**E2 · Medium · Lesson "completion" is recorded for any finished quiz, even 0 %**
- *Problem:* completion is presented as achievement. The brief says completion must not imply mastery.
- *Recommendation:* keep `completedAt` (finished), and add a separate mastery status from best score and attempts, for example "needs review" below 2/3.
- *Files:* `store.ts`, `summary.ts`, `ProgressPage.tsx`, `ModulePage.tsx`.
- *Risks:* changes the meaning of existing counts, so it needs a schema migration, not an overwrite.

**E3 · Medium · No topic-level knowledge tracking**
- *Problem:* questions carry no topic tags, and only per-lesson totals are stored, so the "topic-wise performance" and "knowledge gap" recommendations in the brief are impossible.
- *Recommendation:*
  - Add `topics: string[]` to questions (or lessons).
  - Record correct/total per topic.
  - Mark a topic as weak only after at least 3 answers.
- *Files:* `content/types.ts`, all `content/modules/*.ts`, `store.ts`, `LessonView`/quiz component.
- *Risks:* content tagging is manual work across 158 questions.

**E4 · Medium · The recommendation ignores performance**
- *Existing:* the first incomplete lesson in fixed course order.
- *Recommendation:* combine prerequisites (needs B3), weak topics (E3) and lessons that need review (E2).
- *Files:* `summary.ts` (new `recommend.ts`), `ProgressPage.tsx`.
- *Risks:* depends on E2, E3 and B3.

**E5 · Medium · Misleading or missing metrics**
- `quizAverage` is calculated from **best** scores, which inflates accuracy.
- Simulator attempts are not counted: only passes are kept, plus a 200-event history.
- *Recommendation:* count all answers for accuracy, and add per-simulator attempt counters.
- *Files:* `store.ts`, `summary.ts`.
- *Risks:* low.

**E6 · Low · No export/import, no migration path, and two tabs can overwrite each other**
- *Recommendation:*
  - Add a JSON export and an import that merges into existing progress (validated by E1's validator).
  - Merge records rather than replacing them when two tabs write.
- *Files:* `store.ts`, `ProgressPage.tsx`.

### Simulators and physics (candidates for Phase 1 verification)

**C1 · Medium · The clutch model is linear and the friction zone is unrealistically wide**
- *Existing:*
  - Clamping force falls linearly from 100 % to 0 between 15 % and 60 % of lever travel.
  - Torque capacity is 18 N·m × clamping force.
  - Static and sliding friction are the same, smoothed by `tanh`.
  - Cable and hydraulic actuation aren't distinguished.
- *Problem:*
  - The brief requires a non-linear, defensible model.
  - In a real wet clutch, clamp load collapses over a short pressure-plate lift, shaped by the cushion (wave) plate and the stack's compliance. Torque capacity is n·μ·F·r_eff, and μ depends on slip speed and oil.
  - The engagement band is typically a fraction of lever travel, not 45 %.
- *Recommendation:*
  - Model the stages separately: lever → release travel (lever ratio, freeplay, cable stretch or hydraulic) → pressure-plate lift → clamp force (spring preload minus release load, with cushion-plate compliance) → capacity.
  - Use μ_static > μ_kinetic.
  - Expose the assumptions in the UI.
- *Files:* `lib/mechanics/clutch.ts`, `powertrain.ts`, `ClutchDiagram.tsx`, the clutch-throttle simulator and its exercises.
- *Risks:* changes how the clutch-throttle and gear simulators *feel*, so exercises and stall thresholds must be retested. Phase 2 must define the shared model first.

**C2 · Low · The clutch is modelled at the crankshaft**
- *Existing:* capacity "at the crank".
- *Problem:* on most motorcycles the clutch sits on the gearbox input shaft, after the primary reduction. The basket turns at crank speed ÷ primary ratio. Mathematically equivalent, but the visual explorer must show the true speeds and torques (× 3.35).
- *Files:* `powertrain.ts`, `DrivetrainPanel.tsx`.

**C3 · Low · Wheel and drivetrain rotational inertia are ignored**
- *Problem:* acceleration is slightly optimistic; effective mass is typically +5–10 %.
- *Files:* `powertrain.ts`.

**C4 · Low · Two models disagree on sliding-tyre grip**
- *Existing:* `braking.ts` uses `SLIDING` = 75 % of peak; `tyre.ts` gives a locked tyre about 70 %.
- *Recommendation:* use one shared tyre-constants module.
- *Files:* `braking.ts`, `tyre.ts`.

**C5 · Low · The lean formula assumes zero-width tyres**
- *Problem:* real tyres need a few degrees more lean for the same turn, because the contact patch moves inward. The content presents `tan φ = v²/gR` without that caveat. Footpeg touchdown at 40° vs grip lean at 42° is model-specific.
- *Files:* `cornering.ts`, `content/modules/handling.ts`.

**C6 · Low · A rear-wheel lock stalls the engine instantly (engine speed set to 0)**
- *Problem:* in reality the engine is dragged down over a fraction of a second.
- *Files:* `powertrain.ts`.

**C7 · Medium · Simulator logic is partly inside React components**
- *Existing:* `StartingSimulator.tsx` holds the guided-mode flow (armed step, feedback, mode) in component state. Each real-time simulator wires its own explanation logic (`explainRide` and similar).
- *Problem:* the brief asks for physics, state, controls, visualisation and explanation to be separate, with a guided mode that can be reused.
- *Recommendation:* Phase 2/3 defines one simulation contract (model step, state, inputs, explain(state), guided-steps) that both engines implement.
- *Files:* `StartingSimulator.tsx`, `usePowertrainSim.ts`, `content/simulators/*.ts`, `useExercises.ts`.
- *Risks:* the main refactor risk in the project, because it touches all four simulators, which work today. Do it gradually, behind the end-to-end tests (G1).

### Educational content

**B1 · Medium · "Weight moves forward" framing (about 14 places)**
- *Existing:*
  - lesson heading "Weight moves forward" (`content/modules/basics.ts:875`);
  - "braking moves the weight onto the front tyre" (`content/simulators/rideStop.ts:229, 276, 296, 318`);
  - "weight transfers forward" and "weight moves off the rear wheel" (`content/anatomy.ts:144, 150, 173`);
  - `content/scenarios/emergency.ts:65`;
  - `basics.ts:797, 843, 924, 931`;
  - `components/motorcycle/parts.ts:97`.
- *Problem:* this suggests the mass physically moves. What actually changes is the vertical load on each tyre: the braking force acts at road level, below the centre of mass, creating a pitching moment. Physics engine (`braking.ts`) is already correct; only the wording is wrong.
- *Recommendation:* use "load transfer" and "the load on the front tyre increases", and explain the moment once in the braking lesson.
- *Files:* as listed.
- *Risks:* text only.

**B2 · Medium · Clutch actuation types are not covered**
- *Problem:* no content distinguishes cable-operated from hydraulic clutches (freeplay adjustment versus self-adjusting; lever-feel differences), or covers slipper/assist clutches or wet versus dry clutches. The pre-ride freeplay check assumes a cable.
- *Files:* `content/modules/basics.ts`, `preRide.ts`, `mechanics.ts`, `content/anatomy.ts`.

**B3 · Medium · The lesson schema can't express the requested structure**
- *Problem:*
  - There are no fields for the six sections (Concept, Components, Mechanism, Physics, Application, Misconceptions), prerequisites, topics, level (beginner or advanced) or related lessons.
  - The validator only requires concept, illustration and example blocks.
- *Recommendation:*
  - Add optional metadata and section-typed blocks without breaking the existing 50 lessons.
  - Migrate lessons in batches.
  - Make the validator report missing sections as warnings, then as errors once each module is migrated.
- *Files:* `content/types.ts`, `content/curriculum.ts`, `components/lesson/*`, `content/modules/*.ts`.
- *Risks:* large content effort, so do it module by module.

**B4 · Low · "The front brake provides about 70 % of stopping power" is stated as a fixed figure**
- *Problem:* the share depends on deceleration. The project's own model gives about 65 % at 0.4 g and about 87 %+ at 0.9 g.
- *Files:* `content/simulators/rideStop.ts:276`, lessons.

**B5 · Low · The four-stroke table implies valves open and close exactly at TDC and BDC**
- *Problem:* real timing has lead and overlap; the `ValveTiming` illustration shows this, so the two should be cross-referenced.
- *Files:* `lib/mechanics/engine.ts`.

### Safety

**H1 · Medium · Safety guidance exists but isn't layered**
- *Existing:*
  - A platform disclaimer appears only in the footer.
  - 18 lesson-level safety callouts, not mapped systematically to hazardous topics.
  - Scenario and simulator pages don't say the physics is simplified or that results are not real-world guarantees.
- *Recommendation:*
  - Add a visible platform notice: on first visit, and on simulator and scenario hubs.
  - Require a safety callout in every lesson tagged braking, cornering, acceleration or traction (enforced by the validator).
  - Add a "Model limits" panel to each simulator and scenario.
- *Files:* `Footer.tsx`, `SimulatorsPage.tsx`, `ScenariosPage.tsx`, `ScenarioPlayer.tsx`, the simulator pages, `content/modules/*.ts`.

### Mobile and accessibility

**F1 · Low · Touch targets and landscape layouts not audited**
- *Existing:* Phase 13 passed contrast, keyboard, reduced motion and horizontal-scroll checks.
- *Problem:* minimum touch-target size on SVG hotspots, the gear lever and slider thumbs was not measured, nor were landscape phones. The audit itself is not repeatable (G1).
- *Files:* `MotorcycleSideView.tsx`, `GearLever.tsx`, `Slider.tsx`, `PlaybackControls.tsx`.

---

## 10. Backend assessment (input to Phase 2)

The two briefs conflict: the first says no backend, database or authentication; the second permits them when justified.
- **Required for none of the objectives in the first brief (accuracy, simulators, content, safety, local progress, accessibility, testing):** all of them can be done client-side.
- **Would justify a backend:** optional accounts with cross-device sync, or an AI tutor. Phase 2 would compare Supabase, Firebase and a custom Node API with Postgres, covering costs, privacy and migration.
- **The data model is sync-friendly:** every record has timestamps, so merging is possible once E1 (validation) is done.

## 11. Proposed prioritised plan

| Order | Phase | Findings addressed | Why this order |
|---|---|---|---|
| 0a | **Safety net (small, recommended first)** | G1 (move end-to-end tests into the repo, add Vitest and `npm test`), G2 (`vercel.json`), E1 (progress validation) | Every later phase changes working code; these make regressions detectable and stop a known crash. |
| 1 | Mechanical content and physics accuracy audit | C1–C6, B1, B2, B4, B5 and a full review of all 50 lessons | Produces the correction list the content phases implement. Report only, plus unit tests that pin the current physics. |
| 2 | Simulation architecture (and backend decision) | C7; Phase 2 architecture proposal | Defines the shared model, state, controls and explanation contract before building on it. |
| 3 | Clutch explorer (reference implementation) | C1, C2, B2 | First consumer of the new architecture. |
| 4 | Other simulations | C3–C6, migrate the existing simulators to the contract | Behind end-to-end tests. |
| 5 | Lesson structure and content | B1, B3, B4, B5, corrections from Phase 1 | Module by module. |
| 6 | Safety education | H1 | Uses B3's topic metadata. |
| 7 | Progress and assessment | E2–E6 | Needs topic tags (B3/E3). |
| 8 | Mobile and accessibility | F1, full re-audit | After the UI changes. |
| 9 | Testing, performance, reliability | G3, G4, coverage gaps, CI | Final hardening. |
