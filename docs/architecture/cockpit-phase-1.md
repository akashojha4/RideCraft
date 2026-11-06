# Rider Cockpit — Phase 1: inspection and layout

**Date:** 2026-11-05 · **Route:** `/simulators/cockpit` (unlisted preview until the controls work)

## 1. What exists and will be reused

| Need in the brief | Existing piece | Use |
|---|---|---|
| One shared simulation state and update loop | `useSimulation` + `powertrainModel` (Stage 2 Phase 2): pausable, slow-motion clock; 2 ms physics substeps; ~20 Hz React snapshots; per-frame MotionValues for rotating parts | **The cockpit's engine.** All views will read the same snapshot. No second simulator. |
| Clutch, throttle, brakes, gears, RPM, torque, speed, acceleration, engine braking, load transfer, wheel lock, stall | `lib/mechanics/powertrain.ts`, `braking.ts`, `clutch.ts` (non-linear, cable/hydraulic), `gearbox.ts` | As is |
| Starting the engine | `content/simulators/starting.ts` (scripted timeline: ignition, kill switch, starter, cranking) | Phase 8 links ignition and starting into the shared state |
| Steering and lean | `lib/mechanics/cornering.ts` (lean dynamics, countersteer) | Phase 3/6 for the road view's turns |
| "Inside the Machine" | `ClutchMechanismView`, `DrivetrainPanel`, `FourStrokeEngine`, gearbox diagram | Phase 5 composes them into one power-flow view |
| "Road Response" | `MotorcycleSideView` (rider mode, wheel angles, highlight), `BrakingView` (load arrows, pitch, locked wheels) | Phase 6 |
| Teaching panels | `ExplanationPanel`, `CauseEffectChain`, `AssumptionsPanel`, `GuidedSteps` + `useGuidedMode` | Guided mode, explanations, model limits |
| Gear lever logic | `shiftLever` (1-N-2-3-4-5 with half-shift to neutral), `useGearLever` (auto-clutch option) | Phase 2; the pattern is made configurable there |
| Scenarios | `content/scenarios/*` (14 scenarios on the same physics) | Phase 10 reuses their situations |

## 2. Simulation state: the brief's list mapped to the model

| Brief | Model today | Gap |
|---|---|---|
| throttlePosition, clutchPosition, currentGear, frontBrakePressure, rearBrakePressure | `inputs.throttle`, `inputs.clutch`, `inputs.gear`, `inputs.front`, `inputs.rear` | — |
| clutchEngagement | `clampingForce(clutch)`; `derived.clamp` | — |
| engineRunning, engineRPM, engineTorque | `state.running`, `state.engine` (rad/s), `state.engineTorque` | — |
| vehicleSpeed, acceleration | `state.speed`, `state.acceleration` | — |
| frontWheelSpeed, rearWheelSpeed | Wheel speed = road speed unless that wheel is locked (`state.brakes.*.locked`) | Expose as derived values |
| ignitionOn | Only in the scripted Starting simulator | Phase 8 |
| steering / lean | Separate cornering model | Phase 3/6 |
| selectedScenario, simulationStatus | Exercise / guided-mode state; clock `playing` | Phase 8/10 |

## 3. Layout (implemented)

```
┌────────────────────────── road ahead (full view) ──────────────────────────┐
│ ┌ CLUTCH ─────────┐                                ┌ THROTTLE · FRONT BRAKE ┐ │
│ │ left grip+lever │            horizon             │ right grip + lever     │ │
│ └─────────────────┘           ╱      ╲             └────────────────────────┘ │
│                              ╱  road  ╲      (centre kept clear)              │
│ ┌ GEAR ───────────┐  ┌──── instrument cluster ────┐  ┌ REAR BRAKE ─────────┐ │
│ │ peg+lever  5..1 │  │ RPM bar · km/h · gear      │  │ peg + pedal  ▮      │ │
│ └─────────────────┘  │ ENGINE CLUTCH THROT F R    │  └─────────────────────┘ │
└──────────────────────┴────────────────────────────┴─────────────────────────┘
```

- **Tablet and desktop (≥ 768 px):** a 16:9 frame. The road fills it, the controls sit in the four corners and the instrument cluster sits at the bottom centre. A test checks that the middle 30 % × 40 % of the road is never covered.
- **Phone:** road first, then the cluster, then the controls in a 2 × 2 grid. Hands sit on the top row and feet below, with the left side on the left.
- **Control drawings:** drawn from the rider's seat, looking down and forward:
  - each grip runs from the screen edge towards the middle, with its lever in front;
  - pulling a lever swings it back towards the grip about its pivot;
  - the foot controls show the peg, the pivot and the toe piece or pedal ahead of the peg.
- **Labels and values:** HTML text, so they stay readable at any size (at least 12 px on phones). Each drawing also has a text alternative for screen readers.
- **Gear indicator:** shows the pattern (1-N-2-3-4-5 by default) and lights the current gear. The pattern is a prop.
- **Road:** a perspective scene with horizon, lane markings, verges and roadside posts. The motorcycle is stationary with the engine off, so the road is correctly still. Movement is Phase 3.

### Information hierarchy (for later phases)
1. **Primary:** the road and the four controls (this layout).
2. **Secondary:** the instrument cluster and each control's live value.
3. **Tertiary:** "Inside the Machine", "Road Response" and explanations, as panels that can be expanded, with modes (Rider / Machine / Road / Split) that rearrange the same live state without resetting it.

## 4. Interaction plan for Phase 2

| Control | Pointer and touch | Keyboard (proposal) |
|---|---|---|
| Clutch lever | Drag the lever between rest and the grip; it holds where you leave it | `A` pull in / `Z` let out (hold for continuous) |
| Throttle | Drag along the grip (twist); springs back to closed when released, like a real throttle | `↑` open / `↓` close |
| Front brake | Drag the lever; springs back when released | `Space` (progressive while held) |
| Gear lever | Tap above (lift = up) or below (press = down); a short tap from 1 or 2 selects neutral | `E` up, `D` down, `N` half-shift to neutral |
| Rear brake | Press and drag the pedal; springs back | `S` (progressive while held) |

All controls get large touch targets, visible focus and screen-reader labels, and work with the existing pause, slow-motion and reset controls.

## 5. Not in Phase 1
- The controls aren't operable yet, and the road doesn't move.
- The page isn't linked from the menu or the Simulators page.
