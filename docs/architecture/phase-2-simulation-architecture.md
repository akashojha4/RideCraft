# Phase 2 — Cause-and-Effect Simulation Architecture (proposal)

**Status:** APPROVED 2026-11-02 and implemented (see PROJECT_PROGRESS.md, Stage 2 · Phase 2).
**Date:** 2026-11-02

## 1. What exists today

| Piece | File | Generic? | Notes |
|---|---|---|---|
| Simulation clock | `hooks/useSimulationClock.ts` | Yes | Pause, play, 0.25–1× speed, reset; time held in a MotionValue (no re-render per frame). Keep as is. |
| Real-time runtime | `hooks/usePowertrainSim.ts` | **No** | Mixes a generic runtime (step on the clock, cap `dt`, throttled UI snapshots, telemetry history, scripted input sequences, per-step listeners) with powertrain-only logic (which parts rotate and how fast). |
| Scripted runtime | `lib/simulation/timeline.ts` | Yes | Keyframed, a pure function of T. Right for procedures (starting the engine). Keep. |
| Physics models | `lib/mechanics/*.ts` | Yes | Pure functions, already React-free. |
| Exercises | `hooks/useExercises.ts`, `lib/simulation/exercises.ts` | Partly | Generic exercise list, verdict and progress logic, but its metrics (stall, RPM, creep) are powertrain-specific. |
| Explanations | `explain`, `explainGears`, `explainRide` in `content/simulators/*.ts` | Pattern only | Each returns `{ title, text, tone }`, with tone names that differ (`info` vs `neutral`). |
| Explanation UI | inline in 3 simulators | **Duplicated** | The same "What is happening" panel is copied in `ClutchThrottleSimulator`, `GearShiftingSimulator` and `RideStopSimulator`. |
| Controls UI | `PlaybackControls`, `Slider`, `GearLever`, `ExerciseBar`, `TopicCards`, `Readouts`, `SimCard` | Yes | Reuse. |
| Highlighting | `MotorcycleSideView` `highlighted` prop | Partly | Exists for the side view only; the detail diagrams have no shared highlight convention. |
| Guided mode | only inside `StartingSimulator.tsx` | No | Kept in that component's state; can't be reused. |
| Model assumptions | nowhere | — | Phase 1 found that no simulator states its simplifications. |
| Unit tests | none; no test runner installed | — | |

**Conclusion:** the physics is already separated from React. What's missing is a **shared contract** around it: one way to step a model, derive what to show, explain cause and effect, list assumptions, highlight components and guide the learner. The powertrain runtime needs splitting into a generic part and a model-specific part.

## 2. Proposed architecture

Five layers, matching the brief. Each depends only on the layers above it.

```
1. Physics            lib/mechanics/*            pure functions (unchanged)
2. Model + state      lib/simulation/model.ts    SimModel contract; each simulator's model adapter
3. Runtime            hooks/useSimulation.ts     steps any SimModel on the shared clock
4. Controls & views   components/simulation/*    controls, diagrams, highlight, explanation panels
5. Teaching content   content/simulators/*       explanations, guided steps, exercises, assumptions text
```

### 2.1 The model contract (pure TypeScript, testable without React)

```ts
// lib/simulation/model.ts
export type Tone = 'ok' | 'info' | 'caution' | 'danger'
export type Stage = 'input' | 'mechanism' | 'transmission' | 'response'

/** One link in "Rider input → mechanical state → force/power transmission → vehicle response". */
export interface CausalLink<C extends string = string> {
  stage: Stage
  label: string            // e.g. "Clamping force"
  value: string            // e.g. "38 %"
  components?: C[]         // parts to highlight for this link
}

export interface Explanation<C extends string = string> {
  tone: Tone
  title: string
  text: string
  chain: CausalLink<C>[]   // drives the cause-and-effect strip and the highlighting
}

export interface Assumption {
  id: string
  text: string             // "Clamping force falls linearly with lever travel"
  effect?: string          // "Real clutches engage over a narrower band"
}

export interface SimModel<I, S, D, C extends string = string> {
  id: string
  initial(overrides?: Partial<S>): S
  step(state: S, inputs: I, dt: number): S
  /** Everything the views and text need, computed from state + inputs. Pure. */
  derive(state: S, inputs: I): D
  /** Speeds of rotating parts (RPM), for animation. Pure. */
  rotations?(state: S, inputs: I, derived: D): Partial<Record<C, number>>
  explain(state: S, inputs: I, derived: D): Explanation<C>
  assumptions: Assumption[]
}

/** A guided step: tell the learner what to do, highlight it, detect when it's done. */
export interface GuidedStep<I, S, D, C extends string = string> {
  id: string
  title: string
  instruction: string
  highlight?: C[]
  setup?: { inputs?: Partial<I>; state?: Partial<S> }
  done(state: S, inputs: I, derived: D): boolean
  explanation: string      // shown when the step completes: why it happened
}
```

- **Physics:** stays in `lib/mechanics`. A model is a thin adapter: for example, `powertrainModel` wraps `stepPowertrain` and moves the RPM, slip and heat arithmetic, now spread across components, into `derive`.
- **Explanations:** `explain` returns a **causal chain** as well as text. That chain drives the cause-and-effect strip and decides which components light up, so the visuals and the text can't disagree.
- **Assumptions:** these are data. They are shown in a "Model limits" panel. This also covers the simulator-level safety notice (Phase 0 finding H1, Phase 1 M1–M5).

### 2.2 Runtime

- **`useSimulation(model, initialInputs, options)`:** the generic part of today's `usePowertrainSim`, unchanged in behaviour. It includes:
  - stepping on `useSimulationClock` (pause, slow motion, reset);
  - the `dt` cap;
  - UI snapshots throttled to about 20 Hz;
  - telemetry history through a `sample(state, inputs, derived)` option;
  - scripted input sequences;
  - `onStep` listeners and `load`;
  - one MotionValue per rotating part, from `model.rotations`.
- **`usePowertrainSim`:** becomes a thin wrapper around `useSimulation(powertrainModel)` that returns **the same API**. The three powertrain simulators and `useExercises` need no changes in this phase.
- **`useGuidedMode(sim, steps)`:** a generic step runner: current step, setup, completion check on each step, completion explanation, back/next/restart. The clutch explorer is its first user, and the Starting simulator can move onto it later.
- **Scripted (timeline) simulations:** they keep `timeline.ts`, but can implement the same `explain`, `assumptions` and guided-step interfaces. The two engines are not merged; each fits its job.

### 2.3 Shared components (layer 4)

| Component | Replaces / adds |
|---|---|
| `ExplanationPanel` | The 3 copied "What is happening" sections (same markup, `aria-live`, tone colours) |
| `CauseEffectChain` | **New.** A four-stage strip, Input → Mechanism → Transmission → Response, with live values; hovering or focusing a stage highlights its components. On phones it stacks vertically. |
| `AssumptionsPanel` | **New.** A collapsible "Model limits" panel with a one-line "this is a simplified model, not a guarantee of real-world behaviour" notice |
| `GuidedSteps` | **New.** The step list, instruction, progress and completion explanation for `useGuidedMode` |
| Highlight convention | Diagrams take `highlight?: readonly C[]` and dim everything else; `MotorcycleSideView` already works this way. Applied to the new clutch explorer first, then other diagrams as they are touched. |

Animation rule from the brief: the only things that move are those driven by `rotations` or the model's state. No decorative motion is added.

## 3. Migration plan (this phase, after approval)

| Step | Change | Risk control |
|---|---|---|
| 2a | Add `lib/simulation/model.ts` (types), `hooks/useSimulation.ts` and `lib/simulation/models/powertrain.ts`. Rebuild `usePowertrainSim` on top with an identical API. | Run the existing clutch-throttle, gear and ride-and-stop end-to-end suites (P6–P8, 139 checks) before and after; they must pass unchanged. |
| 2b | Extract `ExplanationPanel`; unify the tone names (`neutral` → `info`); use it in the 3 simulators. | Same suites, plus a screenshot comparison of the panel. |
| 2c | Add `CauseEffectChain`, `AssumptionsPanel`, `GuidedSteps` and `useGuidedMode`. Add an `assumptions` list (from Phase 1 M1–M5) and a model-limits panel to the 4 existing simulators. | New end-to-end checks: panel present, collapsible, keyboard-operable. |
| 2d | Unit tests for the contract: powertrain model `derive`/`rotations`/`explain` give the same numbers as today's inline code; `useGuidedMode` step logic. | — |

**Visible change for learners in Phase 2:** only the new "Model limits" panel on each simulator. The cause-and-effect strip and guided mode first appear in the Phase 3 clutch explorer, where they are designed in.

**Files touched:**
- new: `lib/simulation/model.ts`, `lib/simulation/models/powertrain.ts`, `hooks/useSimulation.ts`, `hooks/useGuidedMode.ts`, and `components/simulation/{ExplanationPanel,CauseEffectChain,AssumptionsPanel,GuidedSteps}.tsx`;
- changed: `hooks/usePowertrainSim.ts`, the 3 powertrain simulator components, `StartingSimulator.tsx` (model-limits panel only) and `content/simulators/*.ts` (tone name, assumptions).

**Not changed:** the physics models, exercises, progress tracking, routes and page design.

## 4. Testing decision needed

The brief requires physics and state transitions to be testable as pure TypeScript functions. Today nothing in the repository can run unit tests.

**Recommendation:** add **Vitest** as a dev dependency (free, Vite-native, no runtime cost, nothing shipped to visitors), with an `npm test` script and tests under `src/**/*.test.ts`.

The existing browser end-to-end suites stay where they are for now, since moving them into the repository was the skipped step 0a.

## 5. Backend decision (architecture decision record)

| Item | Decision |
|---|---|
| Problem examined | Do Phases 2–9 (simulation architecture, clutch explorer, other simulators, lesson structure, safety, progress and recommendations, accessibility, testing) need a backend, database, authentication or server computation? |
| Finding | **No.** Every model is a small pure function stepped at 60 fps in the browser, so a server would add latency and cost and break offline use. Content is static and versioned with the code. Progress, topic tracking, recommendations and JSON export/import all work with versioned `localStorage`. |
| Decision | **Stay frontend-only.** No new services, no cost. |
| Revisit if | You want accounts and cross-device sync, instructor/class features, or an AI tutor. Then a separate proposal would compare Supabase, Firebase and a custom Node API with Postgres, covering cost, privacy and migration from `localStorage`. The progress data is already timestamped, so it can be merged. |
| Alternatives considered | Server-side simulation (rejected: no workload needs it); Supabase/Firebase now (rejected: no current requirement; adds privacy obligations and maintenance). |

## 6. Decisions requested

1. Approve the architecture (sections 2–3)?
2. Approve adding Vitest for unit tests (section 4)?
3. Confirm the backend decision: stay frontend-only (section 5)?
