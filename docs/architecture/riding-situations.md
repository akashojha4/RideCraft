# Riding Situations: shared scenario architecture

The **Riding Situations** module teaches a situation before the learner practises it in the Rider Cockpit. There are three views of each situation, and all three read the **same scenario definition** and run the **same simulation**, so they can't disagree:

| View | What it does | Reads |
|---|---|---|
| Lesson (sections 1, 2, 5, 6) | Teaches the situation, each control, the mistakes; checks understanding | `SituationTeaching` + the scenario |
| Timeline (section 3) | Shows every control and the motorcycle's response, stage by stage | A run of the scenario's `demo` on the shared runner |
| Watch it done (section 4) | The cockpit rides the situation by itself | The scenario's `demo`, played on a live cockpit simulation |
| Cockpit practice (section 7) | The learner rides it, with steps checked and mistakes explained | The scenario, opened by id (`?practice=<id>`) |

## The scenario definition

Each scenario lives in `src/content/scenarios/cockpit/*.ts` as a `CockpitScenario` (`types.ts`):

| Field | Holds |
|---|---|
| `id`, `title`, `summary` | Stable identity (the id links lessons and the cockpit) |
| `setup` | Initial motorcycle state: gear, engine running, speed, throttle, brake held, gradient, surface, paused |
| `world` | Cars, signals, speed breakers, or the steering pose |
| `steps` | The guided steps: title, instruction (caption), highlighted parts, `done(state, inputs, derived, world)` check, explanation |
| `situation`, `objective`, `actions`, `mechanical`, `road`, `why`, `safety` | The briefing the cockpit shows |
| `mistakes`, `watch` | Mistakes the cockpit detects and explains |
| `demo` | **New.** A careful rider's way through: one `DemoStep` per guided step `{ step, seconds, watch, act(t, state, world) → controls }`; it can react to the road (the light, the car, the heading) |
| `hint` | **New.** A message for the status line that depends on the situation (e.g. waiting for the light) |

The lesson's own teaching lives in `src/content/situations/*.ts` as a `SituationTeaching`:
- `scenario`: the cockpit scenario id;
- `situation`: where, what is happening, goal, challenge, before you act;
- `controls[]`: what, when, how, how much, why, mechanics and result, plus the drawing position and an illustration;
- `mistakes[]`: does, feels, mechanics, motorcycle, cause and fix, with an optional link to a cockpit-detected mistake;
- `questions[]`.

A lesson in `content/modules/ridingSituations.ts` sets `situation: <teaching>` and `knowledgeCheck: teaching.questions`. The curriculum validator checks that the scenario exists and has a demo, that every control has all seven parts, and that the quiz is the teaching's questions.

## One runner (`content/scenarios/cockpit/run.ts`)

- **`setupState(setup)`** turns a scenario's set-up into simulation inputs and state. The cockpit hook (`useCockpitSim`) uses it too, so every view starts identically.
- **`runScenario(scenario, plan)`** rides a plan (timed actions, one per step) on the shared model, exactly as the cockpit does:
  - it steps the powertrain (`stepPowertrain`) and the road world (`stepWorld`);
  - it checks the guided steps (`checkGuided`) and spots mistakes (`detectMistake` plus the scenario's `watch`).
- It returns:
  - `samples` every 0.1 s: controls, gear, engine RPM, speed, clutch clamp, slipping or gripping, drive force, wheel locks;
  - `stepStarts` snapshots (state, inputs, world, handlebar) where each step began;
  - `stepDone`, `mistakes` and `complete`.
- **`demoPlan(scenario)`** turns `demo` into a plan.

The runner has four users:
- **Tests:** `scriptedRider.ts` (all scenario tests) and `demo.test.ts` (every demo completes every step with no mistakes).
- **Timeline:** `ControlTimeline` draws the run's samples; its stages are the scenario's steps.
- **Watch it done:** `useDemoPlayer` restores `stepStarts[k]` to jump to a step.
- **Lesson:** `ControlsSection` lists which stages use each control.

## Watch it done (`hooks/useDemoPlayer.ts`, `components/situations/WatchItDone.tsx`)

- A fresh cockpit simulation (`useCockpitSim(scenario.setup, scenario.world)`) is held paused until Play.
- On every model step, the current demo step's `act` is applied to the simulation's inputs — the same thing the runner does.
- A step ends when its time is up and its guided check is met (or 3 s later).
- Previous / Next / Replay restore the run's snapshot for that step (`restore` in `useCockpitSim`).
- Speeds 0.25×, 0.5× and 1× use the simulation clock.
- The cockpit drawing shows the simulation's actual inputs, so the levers move as the demo works them. Inside the Machine (summary) and Road Response (preview) follow it too.

## The world sees the guided step

`RideInputs.stage`, the guided step the learner is on, is passed to the road world in the same way by all three:
- the runner passes the plan index;
- the cockpit page passes the guide's step;
- the demo player passes its step.

"Moving again in traffic" uses it: the light turns green only 3 s after the learner is ready (first gear, clutch in, standing) **and** has moved on from "Get ready".

## Adding a lesson (Batch B and later)

1. Give the cockpit scenario a `demo` (one entry per step). `demo.test.ts` will require it to complete with no mistakes.
2. Write a `SituationTeaching` in `content/situations/`.
3. Add a `Lesson` with `situation` to `ridingSituationLessons`.

No UI changes are needed.

## Simplifications

- The simulation is a simplified model of one representative 150 cc-class motorcycle. The lessons say where a number belongs to it (e.g. the speed at which the engine reaches idle in third) rather than presenting it as a rule.
- Live playback runs on the browser's frame clock, so its timing can differ slightly from the 60 Hz run the timeline is drawn from. The step checks, not the clock, decide when each step is done.

## Status

- **Batch A:** the framework, plus Starting and moving off and Stopping without stalling.
- **Batch B:** Using the clutch, Changing gear, Using the brakes, Hill start, Riding downhill, Braking on a wet road, Slowing on gravel, Emergency braking. These were added purely as data, following "Adding a lesson" above.
- **Batch C:** Stopping at a traffic signal, Moving again in traffic, Riding in slow traffic, Crossing a speed breaker, U-turn.
  - The handlebar gets a timeline row.
  - Every cockpit scenario links to its lesson ("Learn it first", via `lessonForScenario`).
  - A demo step counts as done once its check has been met, in the player as in the runner.

