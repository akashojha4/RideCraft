# RideCraft — Project Progress

Interactive motorcycle education platform. Built strictly phase by phase; each phase stops for review and approval before the next begins.

**Current phase:** Stage 3 (Rider Cockpit) · STAGE 3 COMPLETE (Phases 1–11). Riding Situations COMPLETE — Batches A, B and C built and tested (15 lessons, one per cockpit scenario). Awaiting the user's review. Stage 2 paused at Phase 5 Part B (lesson-structure proposal awaiting approval).
**Last updated:** 2026-11-02

Stage 1 (phases 0–13 below) built the frontend-only site. Stage 2 (see "Stage 2 roadmap") evaluates and, where justified, adds full-stack architecture.

---

## Roadmap

| # | Phase | Status |
|---|-------|--------|
| 0 | Project Foundation & Architecture | COMPLETED |
| 1 | Visual Foundation & Landing Page | COMPLETED |
| 2 | Motorcycle Anatomy Explorer | COMPLETED |
| 3 | Basic Motorcycle Knowledge (11 lessons) | COMPLETED |
| 4 | Pre-Ride Preparation + interactive checklist | COMPLETED |
| 5 | Starting the Motorcycle Simulator | COMPLETED |
| 6 | Clutch & Throttle Simulator | COMPLETED |
| 7 | Gear Shifting Simulator | COMPLETED |
| 8 | Acceleration, Riding & Stopping | COMPLETED |
| 9 | Turning & Motorcycle Handling | COMPLETED |
| 10 | Real-World Scenario Simulator (14 scenarios) | COMPLETED |
| 11 | Advanced Motorcycle Mechanics | COMPLETED |
| 12 | Progress Tracking & Knowledge Assessment | COMPLETED |
| 13 | Final Quality Assurance | COMPLETED |

The same roadmap lives in code at `src/config/roadmap.ts` (drives the home page and "pending" pages). Keep both in sync.

---

## Phase 0 — Project Foundation & Architecture · COMPLETED

### Completed tasks
- [x] Inspected workspace: it contained only an unrelated Kaggle project (`H&M_recommendation/`, `Py_3.13_venv/`) and no Node.js. RideCraft was created in a separate `motolab/` folder; nothing existing was touched.
- [x] Installed Node.js 26 (Homebrew).
- [x] Scaffolded Vite 8 + React 19 + TypeScript 7.
- [x] Tailwind CSS v4 via `@tailwindcss/vite`, with design tokens in `@theme`.
- [x] Dependencies: `react-router-dom` 7, `motion` (Framer Motion), `lucide-react`, `clsx` + `tailwind-merge`, self-hosted variable fonts (Inter, Space Grotesk, JetBrains Mono).
- [x] `@/` import alias (Vite + tsconfig).
- [x] Routing with code-split pages, error boundary, 404, scroll restoration, initial-load fallback.
- [x] App shell: sticky navbar (desktop + animated mobile menu, Escape to close, active-link indicator), footer, skip link, route-loading bar.
- [x] Design tokens: colour, typography, elevation, keyframes; global focus ring, selection, reduced-motion handling.
- [x] Animation system: UI motion tokens and variants plus a pausable, speed-scalable **simulation clock** for mechanical animation.
- [x] Reusable lesson structure: typed content model, block renderer, interactive knowledge check, lesson layout with outline and pager, and a dev-time curriculum validator.
- [x] Honest pending pages for unbuilt areas, driven by roadmap data (no fake content).
- [x] Design-system page showcasing every token and component.
- [x] Sample lesson fixture (hidden module) exercising every block type and the full lesson flow.

### Technical decisions
| Decision | Rationale |
|---|---|
| Separate `motolab/` folder | Keeps the existing Kaggle project untouched. |
| Dark-only theme | Workshop/garage identity; high contrast for mechanical diagrams. Tokens are semantic, so a light theme could be added later. |
| **Colour semantics:** ignition orange = rider actions/controls; coolant cyan = internal mechanics; ok/caution/danger = feedback & safety | Lets simulators show "what the rider does" and "what the machine does" consistently in every view. |
| Lessons are data (`src/content`), visuals referenced by id from an illustration registry | Content can be written and checked for accuracy without touching UI; illustrations load lazily. |
| Every lesson must have concept + illustration + example + knowledge check | Enforced by `validateCurriculum()` (warns in dev console). |
| Mechanical animation driven by `useSimulationClock` (MotionValue time, rAF) | Play/pause/slow-motion/reset for free; no per-frame React re-renders; all views of one simulation share one clock so they stay synchronised (required by Phase 5). |
| UI motion respects `prefers-reduced-motion` (`MotionConfig reducedMotion="user"` + CSS) | Accessibility. |
| Route-level `lazy` code splitting | Keeps initial bundle small as simulators are added. |
| Unbuilt areas render `PhasePending` from roadmap data | Navigation works end to end without presenting unbuilt features as complete. |

### Architecture
```
motolab/src/
  main.tsx                    fonts, global CSS, MotionConfig, RouterProvider
  app/router.tsx              route table (lazy pages)
  styles/index.css            Tailwind + design tokens
  config/roadmap.ts           phases, status, scope (single source for UI)
  config/navigation.ts        primary nav items
  lib/cn.ts                   class merging
  lib/motion.ts               durations, easings, springs, variants, playback speeds
  hooks/useSimulationClock.ts shared mechanical-animation clock
  components/
    layout/                   AppShell, Navbar, Footer, Logo, AppLoading
    ui/                       Button/ButtonLink, Badge, Card, Container, SectionHeading/Eyebrow, ProgressBar, Callout
    motion/Reveal.tsx         Reveal, Stagger, StaggerItem
    simulation/               PlaybackControls
    lesson/                   LessonView, LessonBlock, KnowledgeCheck
    roadmap/                  PhasePending, PhaseStatusBadge
  content/
    types.ts                  Lesson / LessonBlock / QuizQuestion / LearningModule
    curriculum.ts             modules, lookups, validateCurriculum()
    modules/sampleModule.ts   hidden fixture (2 lessons)
    illustrations/            registry + ChainDriveIllustration
  pages/                      Home, Learn, Module, Lesson, Simulators, PhasePending, DesignSystem, NotFound, RouteError
```

### Routes
| Route | Status |
|---|---|
| `/` | Phase 0 foundation home (brand + roadmap). **Replaced in Phase 1.** |
| `/learn`, `/learn/:moduleId`, `/learn/:moduleId/:lessonId` | Working; real modules show "arrives in Phase N" until written. |
| `/learn/sample/...` | Hidden fixture lessons (structure test). |
| `/simulators` | Hub listing simulator phases 5–8. |
| `/anatomy`, `/simulators/*`, `/scenarios`, `/progress` | Pending pages (Phases 2, 5–8, 10, 12). |
| `/design-system` | Design system reference. |
| `*` | 404. |

### Lesson block types
`concept`, `keyPoints`, `illustration`, `example`, `callout` (info / tip / safety / mistake), `steps`, `terms`, plus a per-lesson `knowledgeCheck` (questions with options, correct answer and explanation).

### Testing status (Phase 0)
- `npm run build` (tsc + vite): passes, no type errors.
- `npm run lint` (oxlint): 0 warnings.
- Automated headless-Chrome run: **54/54 checks passed**
  - 17 routes × desktop (1440px) and mobile (375px): correct content, exactly one `h1`, no horizontal overflow, no console errors or warnings.
  - Navbar client-side navigation + active state; mobile menu opens, closes on navigation and on Escape.
  - Chain-drive illustration: play advances at a measured 3:1 front:rear ratio; pause freezes; 0.25× slow motion; reset to zero.
  - Knowledge check: disabled until a choice is made, wrong/right feedback with explanation, result score, retry.
  - Lesson outline anchors; pager to next lesson (scrolls to top) and back to module overview.
  - Reduced-motion emulation: content fully visible.
  - After scrolling, no elements left hidden by reveal animations.
- Visual review of screenshots: desktop and mobile layouts correct.

### Known bugs / limitations
- None blocking.
- The home page is a deliberately minimal Phase 0 page; Phase 1 replaces it with the full landing page.
- Quiz results are not persisted (Phase 12). `KnowledgeCheck` already exposes `onComplete` for this.
- The sample module is a fixture only; it is hidden from `/learn`.
- npm skipped `fsevents`' install script (optional macOS file-watcher dependency); this has no effect on the app.

### Commands
```bash
cd motolab
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

---

## Phase 1 — Visual Foundation & Landing Page · COMPLETED

### Completed tasks
- [x] **Reusable side-view motorcycle** (`components/motorcycle/MotorcycleSideView.tsx`): single-cylinder chain-driven commuter, LEFT side, real-world proportions (wheelbase 420 : wheel Ø176 ≈ 1300 mm : 560 mm).
  - Every component is a named `Part` group: engine, clutch, gearbox, throttle, front-brake, rear-brake, chain, wheels, suspension, exhaust. Ready for Phase 2 click handling.
  - `highlighted` prop: glows one part in coolant and dims the rest; internal parts appear as x-ray.
  - `mode` prop: `plain` | `rider` (controls in ignition orange + hand/foot markers) | `mechanical` (see-through cases revealing piston, connecting rod, crank, clutch, gear pair).
  - `wheelAngle` MotionValue drives consistent kinematics: both wheels, rear sprocket, chain (pitch-line speed), front sprocket at 45/15 = 3×, and ground at tyre surface speed.
  - Far-side (right-hand) parts drawn dimmed: throttle, front brake lever, rear brake pedal, rear disc, silencer.
  - X-ray piston position computed from slider-crank geometry; primary gear ↔ clutch basket and mainshaft ↔ countershaft spacings equal the sums of their radii (gears mesh).
- [x] `components/motorcycle/parts.ts`: part ids, names, locations and one-sentence summaries (Phase 2 extends these).
- [x] `lib/geometry.ts`: `beltPath` (generalised external-tangent chain loop at any angle), `sprocketPath`, `pitchRadius`, `polar`. The chain-drive lesson illustration was refactored to use it.
- [x] Landing page (`pages/HomePage.tsx` + `pages/home/*`):
  1. **Hero**: headline, CTAs (Start learning → /learn, Explore the anatomy → /anatomy), feature list, rolling motorcycle with an Exterior / Rider controls / Mechanical toggle and a matching legend. Rolls only while visible and never under reduced motion.
  2. **Method**: rider action → mechanical response → why it matters, using pulling the clutch lever as a mechanically accurate example.
  3. **Learning categories**: balanced bento grid of six areas with icon, scope count, availability badge and link. The featured Simulators card has a rev-counter whose needle sweeps on hover.
  4. **Anatomy preview**: ten component buttons plus hover-on-drawing highlight, with name, location and summary. Tours the components automatically (with a progress bar) until the visitor interacts.
  5. **Learning path**: nine-stage timeline with a scroll-linked progress line and an availability badge per stage. It alternates sides on desktop and is a single column on mobile.
  6. **Closing CTA** band.
- [x] `AvailabilityBadge` and `isPhaseAvailable()`: learner-facing "Available / Coming soon", derived from roadmap status.
- [x] Badge never wraps (fixed "Coming soon" wrapping in narrow cards).
- [x] The Phase 0 developer roadmap grid was removed from the home page (it stays in this file and in `config/roadmap.ts`).

### Technical decisions
| Decision | Rationale |
|---|---|
| Draw the LEFT side | Shows the chain, sprockets, gear lever and clutch lever, as fitted on a typical modern geared motorcycle. Right-side controls are drawn as dimmed far-side parts, not moved to an inaccurate side. |
| Internal parts are hidden x-ray layers | One drawing serves the exterior, highlighted and mechanical views; the Phase 5–7 simulators can reuse it. |
| Colour semantics enforced in the drawing | Nothing decorative is orange or cyan (the tank stripe, shock spring and gauge dial were changed to neutral), so orange always means rider control and cyan always means mechanism. |
| Unlayered CSS for drawing states | Must override Tailwind colour utilities on individual SVG shapes; `.moto-keep` opts out (for example, tyre rubber). |
| Hero animation runs on `useSimulationClock` | Same clock as the simulators; pauses when off-screen to save CPU. |

### Testing status (Phase 1)
- `npm run build` and `npm run lint`: pass, 0 warnings.
- **Phase 1 automated suite: 25/25 passed**
  - Hero: the three view toggles update the drawing class, legend and `aria-pressed`. Internals are hidden in Exterior and shown in Mechanical; Rider view shows markers and orange controls.
  - Hero kinematics: wheels roll; front sprocket angle = 3 × rear (rolling forward); animation pauses off-screen and stays still under reduced motion.
  - Hero CTAs reach /learn and /anatomy.
  - Anatomy preview: starts on Engine and auto-advances. All 10 buttons highlight the right part with the right summary. The tour stops after interaction; hovering the drawing selects a part; the gearbox x-ray appears; the CTA works.
  - All 15 internal links on the landing page resolve (no 404s).
  - Keyboard: the first Tab reaches the skip link; every control is focusable.
  - No console errors or warnings.
- **Phase 0 regression suite: 54/54 passed**: all routes at 1440px and 375px, no overflow, one `h1` per page, and all earlier interactions.
- Visual review at 1440px, 820px and 375px: no horizontal overflow; bento grid has no orphaned cells; hero, anatomy and timeline layouts are correct.

### Known bugs / limitations
- None blocking.
- On the drawing, the anatomy preview supports hover only. Keyboard users select parts through the component buttons. Phase 2 adds click and keyboard focus on the drawing itself.
- The x-ray piston and crank are static in Phase 1; animating them from the simulation clock belongs to Phase 5.
- The landing page JS chunk is 48 KB (16 KB gzipped), mostly the motorcycle drawing.

### Components created (Phase 1)
`MotorcycleSideView`, `parts`, `geometry`, `AvailabilityBadge`, `HeroSection`, `MethodSection`, `CategoriesSection` (with `TachGraphic`), `AnatomyPreviewSection`, `LearningPathSection`, `CtaSection`.

---

## Phase 2 — Motorcycle Anatomy Explorer · COMPLETED

### Completed tasks
- [x] `/anatomy` explorer (`pages/AnatomyPage.tsx`):
  - sticky drawing with a categorised component list on the left, explanation panel on the right (stacked on mobile);
  - selection held in the URL (`?part=clutch`) for deep links; unknown values fall back to Engine;
  - the document title names the selected part;
  - hover previews a part without changing the selection;
  - X-ray toggle reveals the internals;
  - on mobile, tapping the drawing scrolls the explanation into view.
- [x] **18 interactive components**, covering every visible part of the drawing:
  - the 10 required: engine, clutch, gearbox, throttle, front brake, rear brake, chain & sprockets, wheels, suspension, exhaust;
  - 8 more: fuel tank, frame, handlebar & mirrors, instruments, footpegs, lights, side stand, seat & bodywork.
- [x] Each component shows:
  - category, name, location and summary;
  - **Purpose**;
  - **How it works** (working principle);
  - **Inside the …** (internal parts list, plus an interactive diagram for the 10 core parts);
  - **Connected to** (links that open the connected part);
  - a safety, tip or common-mistake callout;
  - previous / next navigation.
- [x] `MotorcycleSideView` is now selectable:
  - **Pointer:** `onPartSelect`. Selection happens on pointer-up over the part where the press began (see bugs fixed). Small parts get enlarged invisible `HitArea` targets.
  - **Keyboard:** the drawing is one listbox tab stop. Arrow keys, Home and End move through parts in category order. `aria-activedescendant` points at the part's primary group (`role="option"`, `aria-selected`, `aria-label`).
  - Focus on click uses `preventScroll`.
  - Hidden internals ignore the pointer unless revealed.
- [x] **10 interactive "inside" diagrams** (`components/anatomy/diagrams/*`, lazy-loaded through `registry.ts`):

  | Component | Diagram | Model / behaviour |
  |---|---|---|
  | Engine | Four-stroke cutaway (`components/mechanics/FourStrokeEngine`, reusable in Phase 5) | Slider-crank piston motion. Valves open over their strokes. Spark just before TDC. Play/pause/slow motion, and jump to each stroke. |
  | Clutch | Plate-stack cross-section with lever slider | 0–15 % freeplay, 15–60 % pressure plate lifts (friction zone), >60 % disengaged. Plates separate visibly. |
  | Gearbox | Two shafts with 5 constant-mesh pairs | Sequential 1-N-2-3-4-5 logic, including the half-shift to neutral. Dogs drawn on the engaged pair; power path shown. Readouts for ratio, overall ratio, and RPM at 40 km/h (with redline warning). |
  | Throttle | Twist grip → cable → butterfly valve | 6° idle stop. Airflow from projected open area. "Let go" shows the return spring. Injector spray scales with airflow. |
  | Front / rear brake | Lever or pedal → master cylinder → hose → caliper | Pad clearance taken up in the first 15 %. ≈7.8× hydraulic area ratio. Rear variant explains lock-up risk. |
  | Chain | Existing 15T/45T chain-drive illustration | 3:1 final drive. |
  | Wheels | Tyre cross-section and tread footprint, with lean slider | Tyre rolls about its crown centre. Contact patch stays beneath it, offset R·θ (≈31 mm at 30°). |
  | Suspension | Fork-leg cross-section | "Ride over a bump" spring simulation. Damper on = critically damped; off = oscillates. Spring and damping force meters. |
  | Exhaust | Flow schematic | Animated gas pulses through header → catalyst → silencer → outlet, with numbered stages. Pauses off-screen. |
- [x] Physics models moved to `lib/mechanics/` (`engine.ts`, `clutch.ts`, `throttle.ts`, `gearbox.ts`) so the Phase 5–7 simulators reuse the same numbers.
- [x] Shared UI: `Slider` (styled range input for rider inputs), `Readout` and `Meter` (simulation readouts), `DiagramFrame` and `DiagramLabel`.
- [x] Content in `content/anatomy.ts`, typed `Record<PartId, AnatomyEntry>` so a missing component fails to compile.
- [x] The home anatomy preview links into the explorer at the selected part (`/anatomy?part=…`).

### Bugs found and fixed during testing
- On touch screens, tapping a part did nothing. The hover re-render made Chrome retarget the synthesized `click` to the `<svg>`. Selection now happens on pointer-up over the part where the press began; scroll gestures (`pointercancel`) never select.
- The browser's focus-scroll on the drawing cancelled the explanation's smooth scroll. Fixed by focusing with `preventScroll`.
- Selecting a part reset the page scroll to the top, because `?part=` changes are router navigations and `ScrollRestoration` resets on each one. Fixed with `preventScrollReset`.
- The gearbox RPM formula omitted the final-drive ratio (3× too low).
- The tyre contact patch was mirrored to the wrong side.
- Overlapping or clipped diagram labels; wrapping meter labels.

### Technical decisions
| Decision | Rationale |
|---|---|
| Cover all 18 visible components, not only the 10 listed | The checkpoint requires every visible component to be interactive. |
| The drawing is a single ARIA listbox | One tab stop with arrow-key navigation, instead of 18 tab stops (several parts are drawn in multiple places). |
| Diagrams are simplified but quantitatively consistent | Ratios, geometry and timings come from the shared models. Simplifications (valve timing, airflow) are stated on screen or in code. |
| Selection lives in the URL | Lessons in later phases can link straight to a component. |

### Testing status (Phase 2)
- `npm run build` and `npm run lint`: pass, 0 warnings.
- **Phase 2 automated suite: 56/56 passed**
  - **Every one of the 18 components** is selected by clicking a point on its own drawn shapes, where the browser's hit-test is confirmed to land on that part. The X-ray toggle reveals all internals; hover previews without selecting.
  - **Keyboard:** the drawing is focusable. ArrowRight visits all 18 parts in order with correct `role="option"`, `aria-selected` and `aria-label`; wraps both ways; Home works.
  - **Content:** all 18 parts have purpose, working principle, ≥3 internals and ≥3 connections. Connection links, list buttons and next/previous work. Deep links, title and fallback work. Selecting from low on the page doesn't jump to the top. The home preview deep-links.
  - **Diagrams:**
    - Engine: stroke jumps; plays at 90°/s; valves open on the correct strokes.
    - Clutch: freeplay, then friction zone, then disengaged.
    - Gearbox: full shift sequence including the impossible shifts; RPM values.
    - Throttle: idle stop, full open, return spring.
    - Brakes: clearance, then clamping, with 7.8×.
    - Wheels: patch geometrically under the crown centre at 0/30/45° with correct offsets.
    - Suspension: damped settles; undamped still oscillating.
    - Exhaust: animates and pauses. Chain: 3:1.
  - **Mobile:** no overflow; tapping selects and scrolls to the explanation.
  - No console errors.
- **Regression:** Phase 0 suite 54/54 (`/anatomy` expectation updated to the real page); Phase 1 suite 25/25.
- Visual review of every diagram, including active states, and of the mobile layout.

### Known bugs / limitations
- None blocking.
- On small phones the handlebar controls (clutch lever, throttle, front brake lever, mirror) are small, closely packed targets on the drawing. The component list and keyboard navigation give equal access.
- Diagram models are deliberately simplified for teaching; Phase 11 covers the detailed mechanics (real valve timing, carburettor vs injection, ABS).

### Components created (Phase 2)
`AnatomyPage`, `PartDetail`, `PartList`, `DiagramFrame`/`DiagramLabel`, ten diagrams + `registry`, `FourStrokeEngine`, `Slider`, `Readout`/`Meter`, `lib/mechanics/{engine,clutch,throttle,gearbox}`, `content/anatomy.ts`.

---

## Phase 3 — Basic Motorcycle Knowledge · COMPLETED

### Completed tasks
- [x] **Module 1 “Motorcycle Basics”: 11 lessons** in `content/modules/basics.ts`. Each has objectives, concept explanations, ≥1 interactive illustration, a real-world example, callouts and a 3–4 question knowledge check with explanations; most link to the Anatomy Explorer.

  | # | Lesson | Illustrations |
  |---|---|---|
  | 1 | What is a motorcycle? | Systems tour (new) |
  | 2 | Types of motorcycles | Motorcycle types & rider triangle (new) |
  | 3 | Motorcycle controls | Cockpit, rider’s view (new) |
  | 4 | Engine basics | Four-stroke engine (Phase 2) |
  | 5 | Understanding RPM | Rev counter (new) |
  | 6 | Understanding torque | Spanner torque lever (new), wheel torque by gear (new) |
  | 7 | Understanding gears | Gearbox (Phase 2), RPM vs speed by gear (new) |
  | 8 | Understanding the clutch | Clutch (Phase 2) |
  | 9 | Understanding the throttle | Throttle (Phase 2) |
  | 10 | Understanding the brakes | Front brake (Phase 2), weight transfer (new) |
  | 11 | Understanding the drivetrain | Power flow (new), chain drive (Phase 0) |

- [x] **9 new illustrations** (`content/illustrations/`):
  - **SystemsTour:** multi-part highlighting on the motorcycle drawing.
  - **MotorcycleTypes:** six types. Rider posture is computed, not drawn: two-bone IK for legs and arms, plus a torso-lean search, using real limb proportions. Results: standard 14°, sport 46°, cruiser −11°.
  - **CockpitControls:** built on a new reusable `components/mechanics/Cockpit` with `controls.ts`, for the Phase 5 rider view.
  - **RpmGauge:** revs per second, power strokes per second, ms per revolution; zones from idle to redline.
  - **TorqueLever:** T = F × r, with a nut that needs 60 N·m to turn.
  - **WheelTorque:** push at the tyre per gear (816 N in 1st → 261 N in 5th).
  - **GearSpeedChart:** RPM vs speed lines per gear, with labouring and redline bands and a table view.
  - **WeightTransfer:** front share = 0.45 + (h/L)·a; braking distance from 50 km/h.
  - **PowerFlow:** stage-by-stage RPM and torque through the drivetrain, with "Follow the power" autoplay and road speed.
- [x] Lesson framework extensions:
  - the illustration registry supports `framed` entries (diagrams with their own frame and controls);
  - new `explore` block linking to `/anatomy?part=…`;
  - `MotorcycleSideView.highlighted` accepts an array.
- [x] The Phase 0 sample fixture module was retired (as planned); the design-system page now links to lesson 1.

### Technical decisions
| Decision | Rationale |
|---|---|
| All quantitative illustrations use `lib/mechanics/gearbox.ts` | Every number in the text and in every illustration agrees: 1st at 40 km/h = 10,690 RPM, 5th = 3,420; 3rd at 6,000 RPM ≈ 48 km/h. |
| Charts follow the data-viz method | One axis, 2px lines, hairline solid grid, ≤24px bars with rounded data ends. Emphasis (selected series in the cyan accent, others muted) instead of a five-hue categorical palette, so the colour semantics stay intact. Direct labels; table views; statuses carry an icon and a word, not colour alone. No categorical palette was introduced, so no validator run was needed. |
| Rider posture via inverse kinematics | Teaches the real cause — the rider triangle — and stays correct if a type's geometry is edited. |
| Lesson text quotes typical values with stated assumptions | 9 N·m engine torque, 90 % drivetrain efficiency, h = 0.6 m, L = 1.3 m, 45 % static front load are stated on screen. |

### Testing status (Phase 3)
- `npm run build` and `npm run lint`: pass, 0 warnings.
- **Phase 3 automated suite: 28/28 passed**
  - Learn page shows "11 lessons"; the module contains, and lists, the 11 required lessons in order; the curriculum validator passes.
  - **Full learning flow, lesson 1 → 11, via "Next lesson":**
    - each lesson shows the correct title and "Lesson n of 11";
    - every illustration renders, and each lesson has its real-world example and its Anatomy links;
    - every quiz question is answered correctly (answer key loaded from the lesson data) and ends "n of n correct";
    - the last lesson returns to the module overview.
  - **Illustrations:**
    - Systems tour highlights exactly the right parts; rider view works.
    - Computed postures are as above; scooter flagged as automatic.
    - Cockpit selection works from both the list and the drawing.
    - RPM: 9,500 → redline, 158.3 rev/s, 79.2 strokes/s.
    - Torque: 30 N·m fails, 60 N·m turns the nut.
    - Wheel torque: 816 / 261 N.
    - Gear chart: 40 km/h table values.
    - Weight transfer: 0.9 g → 87 % front, 10.9 m.
    - Power flow: 426 wheel RPM, 48 km/h; autoplay advances and highlights the clutch at stage 2.
  - No horizontal overflow on any lesson at 375px; no console errors.
- **Regression:** Phase 0 54/54 (retargeted from the retired fixture to real lessons, including the wrong-answer and retry quiz paths), Phase 1 25/25, Phase 2 56/56.
- Visual review of every illustration. Fixed during review:
  - rider limbs too short, which made the standard rider lean 33°;
  - gear-chart label collisions;
  - clipped "Idle" label and force arrow;
  - weight-transfer highlight clutter.

### Known bugs / limitations
- None blocking.
- Quiz results are not saved yet (Phase 12).
- Illustration models use one representative 125 cc commuter; real motorcycles differ, and the text says "typical".

### Components created (Phase 3)
`content/modules/basics.ts`, `SystemsTour`, `MotorcycleTypes`, `Cockpit` + `controls.ts`, `CockpitControls`, `RpmGauge`, `TorqueLever`, `WheelTorque`, `GearSpeedChart`, `WeightTransfer`, `PowerFlow`; `explore` lesson block; framed illustration registry.

---

## Phase 4 — Pre-Ride Preparation · COMPLETED

### Completed tasks
- [x] **Module 2 “Pre-Ride Preparation”: 12 lessons** in `content/modules/preRide.ts`. Each has objectives, concept, ≥1 interactive illustration, a real-world example, callouts and a 3–4 question quiz.

  | # | Lesson | Illustration |
  |---|---|---|
  | 1 | Riding posture | Posture checker: 5 good/poor choices drive the IK rider; knee grip in a top-view inset |
  | 2 | Protective equipment | Gear builder on a front-view rider; protected vs exposed regions |
  | 3 | The helmet | Cross-section layers, 4 helmet types, impact demo (EPS crush) |
  | 4 | Mirrors and blind spots | Top view: mirror cones (12° half-angle, arm-blocked inner edge), 100° side vision, blind-spot wedges, movable car |
  | 5 | Tyre inspection | Tread groove with wear bar; pressure → sidewall bulge and contact patch ∝ 1/p |
  | 6 | Brake inspection | Pads (wear groove), reservoir level and colour, lever feel |
  | 7 | Chain inspection | Lower-run slack with ruler, against a typical 20–30 mm spec; lubrication |
  | 8 | Fuel | Tap OFF/ON/RES with standpipe and reserve outlet; fuel-injected gauge mode |
  | 9 | The instrument cluster | Warning lights through key off → ignition → running → moving; injected faults |
  | 10 | Neutral gear | Gearbox (Phase 2), including the half-shift to neutral |
  | 11 | The side stand | Rear-view lean plus typical side-stand-switch interlock logic |
  | 12 | The pre-ride checklist | The interactive checklist |

- [x] **Interactive pre-ride checklist** (`components/checklist/PreRideChecklist.tsx`, data in `content/checklist.ts`):
  - **22 items in 8 groups**, each with how to check, why it matters, what to do if it fails, a severity (`stop` = don't ride / `soon` = fix soon), the parts to highlight and a lesson link.
  - **OK / Problem toggles** (clicking again un-marks); problem guidance shown by severity.
  - **Verdict:** "N checks to go" / "Don't ride yet" / "Ride with care" / "Ready to ride", with a progress bar. Problems listed in the verdict jump to the item.
  - **"Why it matters"** panels link to the lesson; the motorcycle drawing highlights the active item's parts; Reset.
  - **Layout:** container queries give one column inside a lesson and two columns on the standalone **`/checklist`** page (linked from the footer and lesson 12).
- [x] Shared code extracted:
  - `lib/mechanics/rider.ts`: rider IK, now used by both the motorcycle types and the posture checker;
  - `motorcycleTypes.data.ts` and `BikeSilhouette`.
- [x] New lesson block `cta` (link card to another page).
- [x] **App-wide bug fix:** on a fresh page load, `ScrollRestoration` restored the scroll position saved by a different page, because every first location has the key `"default"`. That key now maps to the pathname; every other navigation keeps its normal key, so back/forward and `/anatomy?part=` keep working.

### Technical decisions
| Decision | Rationale |
|---|---|
| Checklist severities `stop` / `soon` | Matches real advice: brakes, tyres, steering, throttle and lights are "don't ride"; indicators, freeplay, fuel and mirrors are "fix soon". |
| Checklist state is in memory only | Saving progress belongs to Phase 12; the component is ready for it. |
| Figures that vary by motorcycle are examples | 29 psi, 20–30 mm chain slack, ~1.5 mm pad limit, an 11 L tank with a 12 % reserve are each labelled as examples with a pointer to the owner's manual. |
| Status colours on warning lights | Green/blue information, amber caution, red stop — the real-world convention, and the same as RideCraft's feedback palette. |
| Posture checker starts with every point wrong | The learner actively corrects each fault and reads why. |

### Testing status (Phase 4)
- `npm run build` and `npm run lint`: pass, 0 warnings.
- **Phase 4 automated suite: 49/49 passed**
  - **Checklist:**
    - 22 items; initial state; marking OK counts, and clicking again un-marks.
    - A "soon" problem shows guidance and is listed; a "stop" problem gives "Don't ride yet".
    - All checked with a stop problem: still "Don't ride yet". Only a soon problem left: "Ride with care". All OK: "Ready to ride" with a full progress bar.
    - All 13 lesson links are valid; "Why it matters" expands with its link.
    - Hover highlights the right parts (tyres → wheels; fluid → both brakes; stand → side stand).
    - The verdict's problem link scrolls to the item and highlights it; Reset works.
    - Two columns at 1440px; one column on mobile with tapping working; one column inside the lesson, with the CTA to `/checklist`.
  - **Lessons:** Learn page shows "12 lessons"; the 12 required lessons are in order; the validator passes. Full flow 1 → 12: every illustration renders, every quiz answered correctly, and the last lesson returns to the module.
  - **Illustrations:**
    - Posture: 0/5 → 5/5. Gear: 6/6.
    - Helmet: impact and open-face explanations.
    - Mirrors: blind spot / in mirror at 15° / in side vision.
    - Tyres: 1 mm limit, 29 psi correct, 40 psi over-inflated with a smaller patch.
    - Brakes: pads, fluid and spongy lever.
    - Chain: 25 / 50 / 8 mm verdicts.
    - Fuel: ON starves, RES flows, OFF stops; fuel-injected low-fuel light.
    - Warning lights: ignition `N,OIL,BAT,ENG,ABS` → running `N,ABS` → moving none; oil fault says stop.
    - Side stand: neutral start, gear-with-stand-down cut-out, clutch requirement, ready to ride off.
  - No overflow at 375px on any lesson; fresh page loads start at the top; footer link present; no console errors.
- **Regression:** Phase 0 54/54, Phase 1 25/25, Phase 2 56/56, Phase 3 28/28.
- Visual review of all illustrations and the checklist page. Fixed:
  - posture inset overlapping the bike;
  - clipped labels (helmet, tyre, fuel);
  - side stand detached from the leaning motorcycle;
  - checklist page opening scrolled.

### Known bugs / limitations
- None blocking.
- Checklist and quiz results aren't saved yet (Phase 12).
- Side-stand switch and warning-light behaviour are typical, not universal; this is stated on screen.
- All lesson text ships in one 76 KB (23 KB gzipped) chunk; it could be split per module later.

### Components created (Phase 4)
`content/modules/preRide.ts`, `content/checklist.ts`, `PreRideChecklist`, `ChecklistPage`, `PostureCheck`, `ProtectiveGear`, `HelmetAnatomy`, `MirrorBlindSpots`, `TyreCheck`, `BrakeCheck`, `ChainSlack`, `FuelTap`, `WarningLights`, `SideStandSwitch`, `lib/mechanics/rider.ts`, `BikeSilhouette`, `motorcycleTypes.data.ts`; `cta` lesson block.

---

## Phase 5 — Starting the Motorcycle Simulator · COMPLETED

### Completed tasks
- [x] **`/simulators/starting`**: start a fuel-injected geared single, from key off to riding away in first gear.
- [x] **8 steps:**
  1. Ignition on
  2. Kill switch to RUN
  3. Clutch in
  4. Press the starter
  5. Release the starter and idle
  6. Select first gear
  7. Find the biting point
  8. Release the clutch and ride away
- [x] **Timeline engine** (`lib/simulation/timeline.ts`):
  - steps keyframe channels with linear or discrete interpolation, carrying values between steps;
  - the whole simulation is a pure function of one time value T, so play, pause, slow motion, replay, jump and reset are exact;
  - rotating parts are integrated once, at build time, on a 1/120 s grid, so angles are deterministic lookups.
- [x] **Model** (`content/simulators/starting.ts`):
  - real-world channel values: RPM, km/h, battery V, starter A, control positions;
  - rotation speeds from the shared models (clutch clamping, gear ratios, 3.35 primary, 3:1 final, tyre circumference);
  - internals shown 28× slower, applied uniformly.
- [x] **Synchronised views, all from the same T:**
  - **Rider's view:** `Cockpit` gained an optional live `state`. It shows the key position, kill-switch RUN/OFF, starter press, clutch lever travel, throttle opening, gear indicator, speedometer and tachometer needles, and the neutral, oil, charging and engine lights. The next control to use is highlighted.
  - **Inside the motorcycle:**
    - *electrical:* battery voltage, starter relay, current flow, starter motor, fuel pump priming, generator charging;
    - *engine:* `FourStrokeEngine` showing piston, valves, spark, combustion and crank;
    - *drivetrain:* clutch basket vs hub (slip visible), gearbox (N/1st, mainshaft and countershaft turning in opposite directions), chain, rear wheel.
  - **Instruction panel:** step N of 8, rider action, what happens inside, why it's necessary, common mistakes, safety; step progress bar.
- [x] **Playback:** Play / Pause, 0.25× / 0.5× / 1×, Replay step, Prev / Next, Reset, clickable step timeline; stops by itself at the end.
- [x] **Do-it-yourself mode:** each step waits for the right action (action buttons, or clicking the cockpit control). `diagnose()` explains a wrong action with the real consequence, for example:
  - starter with the ignition off → "nothing happens";
  - starter with the kill switch at OFF → "won't turn";
  - starter before the clutch → "pull in the clutch first";
  - first gear before starting → "start the engine first";
  - starter while running → grinding;
  - releasing the clutch in neutral, or dropping it from a standstill → stall warning.
- [x] `PlaybackControls` gained `onReset` and `showPlay` (defaults unchanged).

### Technical decisions
| Decision | Rationale |
|---|---|
| Keyframed timeline, not a free-running physics loop | The checkpoint needs a complete, repeatable sequence with exact replay and slow motion. A deterministic T makes every view provably in sync. Free interaction with clutch and throttle physics is Phase 6. |
| First firing is derived, not hand-timed | `FIRE_TIME` is computed so that the cranking crank (rest angle 250°) reaches 362° — just past compression TDC — when the engine catches. The spark appears at the right moment by construction. |
| One visual slow-down factor for every moving part | All parts keep their true speed ratios. Readouts always show real values. |
| Fuel-injected motorcycle, throttle closed while starting | The modern norm; the instructions say so. |

### Testing status (Phase 5)
- `npm run build` and `npm run lint`: pass, 0 warnings.
- **Phase 5 automated suite: 32/32 passed**
  - **Model:**
    - the engine fires at cycle angle 362.2° (compression TDC), 2.32 s into the starter step;
    - clutch engaged: basket and mainshaft both 200.1 °/s;
    - friction zone: 89.9 °/s of visible slip;
    - final state 3,208 RPM at 12 km/h in first, matching the gearbox model.
  - **Watch mode:**
    - initial state correct; jumping to each step shows the right instructions and matching state in every view;
    - **sampled mid-playback at 1×, 0.5× and 0.25×, the rider-view RPM, speed, gauge needles and the cutaway's stroke all match the model at the same instant;**
    - pause freezes; 0.25× runs at 0.25 of normal speed; replay, Prev/Next and Reset work.
  - **Full uninterrupted run:** passes through all 8 steps strictly in order and completes. Every step is ticked; 3,208 RPM, 12.0 km/h, 1st, clutch engaged, 14.1 V; stops itself.
  - **Do it yourself:**
    - waits at step 1; a cockpit click performs the action; it pauses while waiting;
    - six wrong actions give the correct diagnoses without advancing;
    - all 8 actions complete the sequence; replay works.
  - Mobile: no overflow. The hub links to the simulator; other simulators remain pending pages. No console errors.
- **Regression:** Phase 0 54/54 (route expectation updated), Phase 1 25/25, Phase 2 56/56, Phase 3 28/28, Phase 4 49/49.
- Visual review at the start, mid-cranking (first firing), the friction zone, the end, and on mobile. The layout was changed so the internal view spans the full width.

### Known bugs / limitations
- None blocking.
- The sequence is scripted: DIY checks *which* action you take, not *how* you operate the clutch and throttle. Continuous control is Phase 6.
- One representative motorcycle (fuel-injected, electric start, typical interlocks). Carburettor choke and kick-start are not covered.

### Components created (Phase 5)
`lib/simulation/timeline.ts`, `content/simulators/starting.ts`, `StartingSimulator`, `ElectricalPanel`, `DrivetrainPanel`, `StartingSimulatorPage`; `Cockpit` live state; `PlaybackControls` options.

---

## Phase 6 — Clutch and Throttle Simulator · COMPLETED

### Completed tasks
- [x] **Real-time powertrain physics** (`lib/mechanics/powertrain.ts`): a pure `stepPowertrain(state, inputs, dt)` with 2 ms substeps.
  - **Engine:** full-throttle torque curve; friction; **pumping loss** that grows as the throttle closes (this produces engine braking and fast rev drop); idle controller holding 1,400 RPM; stall below 600 RPM; limiter at 9,500 RPM.
  - **Clutch:** capacity 18 N·m × `clampingForce(lever)` (the Phase 2 model). Slipping passes up to capacity; it **locks by static friction** when slip is under ~40 RPM and the torque needed to stay locked is within capacity.
  - **Vehicle:** 225 kg, 90 % efficiency, rolling resistance, air drag, gradient, brakes (holding at standstill), rollback on hills; a dead engine in gear holds the motorcycle.
- [x] **`usePowertrainSim`:** runs the model on the shared simulation clock (pause, 0.25/0.5/1×, reset), keeps 12 s of telemetry, integrates visual rotation angles, and publishes UI snapshots at ~20 Hz.
- [x] **`/simulators/clutch-throttle`:**
  - **Controls:** clutch-lever, throttle and brake sliders; Neutral / 1st (changing gear requires the clutch in); 12 % hill toggle; Restart engine (requires neutral or the clutch in).
  - **Dual-needle rev counter:** engine vs wheel side, with the slip arc shaded.
  - **Strip chart** of engine vs wheel-side RPM over 12 s, with hover values.
  - **Moving motorcycle**, tilted on the hill, with the clutch highlighted while it slips.
  - **Rider's view** (`Cockpit` live state) and **clutch/gearbox/wheel panel** (reused `DrivetrainPanel`).
  - **Live explanation:** neutral / disengaged / friction zone (capacity vs torque passed, engine vs wheel-side RPM, slip heat in W) / engaged (267 RPM per km/h, push at the tyre) / engine braking / stalled (with the cause) / limiter.
  - **Six scored exercises:** find the biting point, pull away without stalling, accelerate smoothly (≤ 2.5 m/s²), hill start (12 %, ≤ 30 cm rollback), stall it on purpose, stop without stalling.
  - **Eight topic cards** covering every Phase 6 topic, each launching its exercise.

### Bugs found and fixed during testing
- **Clutch never locked part-engaged.** The smoothed slip law behaved like a viscous coupling with a permanent equilibrium slip. Replaced with a static-friction lock condition.
- **Revs fell too slowly with the throttle closed** (~2.6 s from 5,600 RPM). Added the pumping-loss term: now ~2,350 RPM after 1.5 s, and in-gear engine braking ≈ 0.8 m/s².
- **A stalled engine read −1 RPM / "−0.0 km/h"**, and a dead engine was dragged by a coasting wheel. It now settles to exactly 0, and the displays never show negative zero.
- **The explanation attributed tyre push to engine torque.** It is the torque passing through the clutch; the rest accelerates the engine itself.
- **Hill-start tip was wrong** ("about 30 % throttle" stalls on 12 %). Physics shows about half throttle is needed; tip corrected.
- **Smooth-acceleration tips updated** to the technique that actually works (hold the friction zone until the needles meet, then release). A plain fast release lurches because capacity rises faster than slip closes — a real effect, now taught.

### Physics validation (scenario runs)
| Scenario | Result |
|---|---|
| Idle, neutral | 1,400 RPM steady |
| Neutral, 50 % throttle | Reaches the limiter |
| Clutch dumped at idle | Stalls in 0.07 s (cause: clutch) |
| Gradual release (2 s, 25 % throttle) | Locks at ~2 s, no stall |
| Friction zone at idle | Creeps at ~4.8 km/h |
| Correct technique (bite → hold → release) | Locks at ~1.5 s, peak 1.1–1.5 m/s² |
| 12 % hill, clutch in, no brake | Rolls back at g·sin θ |
| Braking in gear without the clutch | Stalls at 2.2 km/h (= 600 RPM ÷ 267.3) |
| Braking with the clutch in | Stops, engine idling |
| Locked ratio | 267.3 RPM per km/h (gearbox model) |

### Technical decisions
| Decision | Rationale |
|---|---|
| Real-time physics here, keyframed timeline in Phase 5 | Phase 6 must respond to arbitrary continuous inputs, including mistakes. |
| One tachometer with two needles | Makes slip visible: the gap is slip, and merged needles mean locked. |
| Emphasis chart (engine accent, wheel side muted), one axis | Same unit, two series, legend plus direct labels — per the data-viz method. |
| Exercises scored from physics telemetry | Pass/fail is objective (stall, peak acceleration, rollback, creep time) and explained. |
| Representative 125 cc values, labelled as such | Accurate relationships rather than one model's exact figures. |

### Testing status (Phase 6)
- `npm run build` and `npm run lint`: pass, 0 warnings.
- **Phase 6 automated suite: 44/44 passed**
  - **Free ride:**
    - idle in neutral; the throttle only raises RPM, then returns to idle;
    - changing gear is refused with the clutch out and engages with it in;
    - the cockpit lever shows the pull.
  - **Accuracy, sampled throughout a pull-away:**
    - passed torque never exceeds capacity;
    - slipping: engine ≥ wheel side, with heat;
    - engaged: engine = 267.3 × km/h (max error 13 RPM), equal to wheel side, no heat;
    - needles aligned; the chart records the run.
  - **Exercises:**
    - biting point passes;
    - smooth fails when revved and dumped (7.1 m/s²) and passes with correct technique;
    - hill fails on early brake release (rollback) and passes with correct technique;
    - stall passes, then reads 0 RPM / 0.0 km/h with its explanation; restart rules enforced;
    - stop fails without the clutch (with the RPM-per-km/h reason) and passes with it.
  - **Controls:** pause freezes; 0.25× slows; reset restarts the exercise; the hill toggle rolls back and the brake holds; 8 topic cards launch exercises; chart hover tooltip.
  - Mobile: no overflow. The hub links to the simulator. No console errors.
- **Regression:** Phase 0 54/54, Phase 1 25/25, Phase 2 56/56, Phase 3 28/28, Phase 4 49/49, Phase 5 32/32.

### Known bugs / limitations
- None blocking.
- First gear and neutral only; shifting through the gears is Phase 7.
- On phones the controls sit below the visuals, so you scroll between them.
- Representative model: no clutch wear or temperature limit, and no wheelie/traction limit (an aggressive launch is reported as high acceleration, not loss of grip).

### Components created (Phase 6)
`lib/mechanics/powertrain.ts`, `hooks/usePowertrainSim.ts`, `content/simulators/clutchThrottle.ts`, `ClutchThrottleSimulator`, `DualTach`, `StripChart`, `ClutchThrottleSimulatorPage`.

---

## Phase 7 — Gear Shifting Simulator · COMPLETED

### Completed tasks
- [x] **`/simulators/gears`**, on the Phase 6 powertrain with all five gears.
- [x] **Shared selector logic:** `shiftLever()` in `lib/mechanics/gearbox.ts` — sequential 1–N–2–3–4–5, a full lift/press goes past neutral, half-shift to neutral from 1st/2nd only, plus all the "already in…" cases. The Phase 2 gearbox diagram now uses it too.
- [x] **Auto-clutch** (`lib/simulation/autoShift.ts`): the textbook change as a timed input sequence — clutch in and throttle off, select, ease the clutch out, restore the throttle. It holds the clutch in at a standstill.
  - **Optional rev-matching blip:** a closed-loop throttle that brings the engine to the speed the lower gear needs at the current road speed before the clutch bites.
  - **Manual mode:** the rider works the clutch slider; shifting with the clutch out is refused.
- [x] **Animated gearbox** (`GearboxView`):
  - all five pairs always in mesh, with teeth moving at their pitch-line speed (opposite directions on the visible faces);
  - shaft rotation markings; clutch basket vs hub;
  - the selected pair lit, with its dogs drawn;
  - the power path (only when in gear with the clutch gripping); the sprocket follows the countershaft.
- [x] **Readouts:** selected gear, gear ratio, overall ratio, torque multiplication (overall × η), engine and wheel torque, engine and wheel power, engine RPM, speed, wheel RPM; dual-needle tach and 12 s strip chart (reused).
- [x] **Live explanation:**
  - neutral, clutch disengaged, friction zone, engaged (ratio, torque ×, RPM per km/h), engine braking, over-rev, stalled;
  - after each shift, the **measured RPM factor next to the factor predicted from the gear ratios**.
- [x] **Five scored exercises:**
  1. **Climb through the gears:** to 5th at 50 km/h+.
  2. **Smooth downshift (4 → 3):** felt deceleration ≤ 1.8 m/s²; needs rev-matching.
  3. **Engine braking:** 60 → 20 km/h within 13 s without brakes; needs progressive downshifts.
  4. **Don't over-rev:** from 3rd at 68 km/h into 2nd without passing the limit; slow below ~56 km/h first.
  5. **Stop and find neutral.**
- [x] **"Choose the right gear":** seven situations (pulling away, town, main road, overtaking, steep climb, descent, cruising), each judged by the RPM the chosen gear gives against a suitable band.
- [x] Eight topic cards: pattern, first gear, upshifting, downshifting, ratios, RPM changes, engine braking, choosing a gear.
- [x] **Refactor:** the exercise runner (`useExercises`, `lib/simulation/exercises.ts`), `ExerciseBar`, `TopicCards` and `SimCard` are now shared by the Phase 6 and 7 simulators. Scoring uses **felt acceleration** (0.1 s filter) instead of raw 2 ms spikes. `usePowertrainSim` gained clock-driven input sequences, and the mainshaft turns in neutral when the clutch is engaged.

### Physics validation (measured before setting thresholds)
| Scenario | Result |
|---|---|
| 4 → 3 downshift at 50 km/h, no blip | 3.11 m/s² lurch |
| Same, rev-matched blip | 1.10 m/s² → threshold 1.8 |
| 60 → 20 km/h staying in 5th | 16.8 s |
| Same, progressive rev-matched downshifts | 11.1 s → limit 13 s |
| 3 → 2 at 68 km/h | Engine forced to ~10,580 RPM (over-rev) |
| 3 → 2 at 50 km/h | 8,130 RPM (fine) |
| Upshift 2 → 3 at 40 km/h | RPM factor 0.73 vs 0.74 from the ratios |

### Bugs found and fixed
- **The fixed-length blip didn't rev-match** (engine still ~480 RPM short, so almost the same lurch). Replaced with closed-loop matching to the lower gear's required speed.
- **The explanation claimed the RPM-per-km/h relationship while the clutch was still slipping.** Added friction-zone and disengaged states.
- **Successful shift messages looked like warnings.** Notices now have a tone.
- **Layout:** the left column had an empty block. The explanation, motorcycle and chart moved beside the controls.

### Technical decisions
| Decision | Rationale |
|---|---|
| Auto-clutch on by default, manual available | Three slider moves per shift would make the gearbox lesson about slider dexterity; the auto sequence demonstrates the correct technique and timing. |
| Rev-match as closed-loop control | Shows *why* a blip works (matching engine speed to the new gear), and is how a skilled rider uses the throttle. |
| Felt acceleration for scoring | Raw substep acceleration overstates millisecond spikes; a 0.1 s filter approximates what a rider feels. |
| One shared selector function | The anatomy diagram and the simulator can never disagree about the gear pattern. |

### Testing status (Phase 7)
- `npm run build` and `npm run lint`: pass, 0 warnings.
- **Phase 7 automated suite: 47/47 passed**
  - **Selector:**
    - press from N → 1st, holding the clutch at a standstill; "Already in first"; half-shift 1 → N and 2 → N; "Already in neutral";
    - a lift from N skips to 2nd; the pattern ladder tracks the gear;
    - manual mode refuses a shift with the clutch out and allows it with the clutch in.
  - **Consistency, gears 2–5 (and 1st in the climb):** gear ratio, overall ratio, torque ×, RPM = RPM-per-km/h × speed, wheel torque = engine torque × overall × η, wheel power = engine power × η, and only the selected pair lit, with dogs — all match the model. The teeth animate.
  - **Upshifts 1 → 5:** each RPM factor within 0.05 of the gear-ratio prediction. The climb exercise passes.
  - **Downshift 4 → 3:** fails without a blip (lurch, explained) and passes with rev-matching; the RPM factor matches the prediction.
  - **Engine braking:** staying in 5th fails on time; progressive downshifts pass; brake use fails.
  - **Over-rev:** the immediate shift fails, and the explanation shows "Over-rev!" during it; slowing first passes.
  - **Neutral stop** passes and ends idling in neutral.
  - **Chooser:** wrong choices explained; 7/7 with sensible gears.
  - Topics, pause, reset, mobile, hub link, no console errors.
- **Regression:** Phase 0 54/54, Phase 1 25/25, Phase 2 56/56, Phase 3 28/28, Phase 4 49/49, Phase 5 32/32 (its pending example moved to ride-and-stop), Phase 6 44/44 on the shared runner. Some Phase 6 assertions were made condition-based after they proved timing-sensitive under load.

### Known bugs / limitations
- None blocking.
- No clutchless or quick-shifter upshifts; no gearbox damage model (an over-rev is reported, not simulated as damage).
- The rear wheel can't lock or hop on an aggressive downshift (no tyre-grip model).

### Components created (Phase 7)
`GearShiftingSimulator`, `GearboxView`, `GearChooser`, `GearShiftingSimulatorPage`, `content/simulators/gears.ts`, `lib/simulation/autoShift.ts`, `lib/simulation/exercises.ts`, `hooks/useExercises.ts`, `SimCard`, `ExerciseBar`, `TopicCards`; `shiftLever` in the gearbox model.

---

## Phase 8 — Acceleration, Riding and Stopping · COMPLETED

### Completed tasks
- [x] **`/simulators/ride-and-stop`** ("Simulator 4"): a complete ride-and-stop simulation on the Phase 6/7 powertrain — all five gears, the auto-clutch, separate front brake lever and rear brake pedal.
- [x] **Brake model** (`lib/mechanics/braking.ts`), shared with the Phase 3 weight-transfer lesson:
  - load transfer: front share = 45 % − (h/L) × a/g, lagging the acceleration by 0.15 s (suspension pitch) — so a grabbed brake locks where a progressive squeeze grips;
  - each tyre limited to μ × its load (dry 0.9, wet 0.5); a wheel locks when asked for more, slides at 75 % of peak grip and rolls again once the brake is eased;
  - front brake up to ~1 g of force, rear ~0.6 g; optional **ABS** (holds 92 % of peak grip) and **CBS** (pedal also applies 35 % of the front brake);
  - a locked rear wheel with the clutch out stops the engine (new stall cause `wheel`).
- [x] **Views:**
  - road strip to scale (10 px/m) with distance markers, stop line and stop zone, finish line, 30 km/h sign, a true-scale climb, the lead car with brake lights, and skid marks where a wheel slid;
  - the motorcycle close-up (mirrored to face the direction of travel) pitching with load transfer, with load arrows (%) and brake-force arrows per tyre, "LOCKED"/"ABS" labels; a locked wheel visibly stops turning while the ground keeps moving;
  - tyre "grip budget" meters (force vs available grip, with icon + text status);
  - rev counter, speed chart with the target band, readouts (deceleration in g, front/rear load, brake forces, distance to stop at the current rate, distance, gradient).
- [x] **Live explanation:** stalled (with cause), front lock (danger), rear skid, ABS working, braking (g, load share, front's share of the work, near-limit warning, CBS), stopped (neutral / clutch in), pulling away, clutch slipping, coasting, engine braking, accelerating, slowing on a climb, holding speed.
- [x] **Eight scored exercises**, all measured on the model before setting thresholds:
  1. **Pull away and stop at the line** — the checkpoint sequence: standstill → ≥ 20 km/h → stop within 3 m before a line 60 m away.
  2. **Accelerate smoothly** — 0 → 40 km/h within 20 s, felt acceleration ≤ 3.5 m/s² (smooth release ≈ 3.1–3.3; clutch dump ≈ 6.5).
  3. **Hold a steady speed** — 37–43 km/h for 15 s in a row while the road climbs to 5 %.
  4. **Slow race** — 15 m in ≥ 13 s, never above 6 km/h, without stopping (idle in first ≈ 4.8 km/h; light rear brake ≈ 3.9 km/h).
  5. **Follow traffic** — a scripted car pulls away, cruises at 30 km/h and stops; never under a 1-second gap, stop 1.5–8 m behind.
  6. **Roll off for the 30 zone** — 60 → 30 km/h in 120 m without brakes (4th only: ~115 m; with a downshift: ~95 m).
  7. **Shortest stop** — from 50 km/h within 18 m of first braking, no lock, no ABS (best no-lock: front only ≈ 19.5 m, both ≈ 14.8 m).
  8. **Smooth stop** — both brakes, no lock or stall, final jolt ≤ 2.5 m/s².
- [x] **Stopping distance by technique**: rear only / front only / both, simulated on the same model at 30/50/70 km/h, dry or wet, with 1 s reaction distance; stacked bars, legend, hover breakdown and a table view.
- [x] Twelve topic cards — one per item of the Phase 8 brief — each linked to an exercise.
- [x] **Reuse / refactors:** gear lever extracted into `useGearLever` + `GearLever` (Phase 7 now uses them); `useExercises`, `ExerciseBar`, `TopicCards` made generic; exercises get `dt`, felt acceleration and a per-exercise `memo`; `useExercises` publishes a 10 Hz `progress` snapshot for live readouts; `MotorcycleSideView` gained `frontWheelAngle` and `roadAngle`; `usePowertrainSim` integrates each wheel separately.

### Physics validation (stop from 50 km/h, dry)
| Technique | Result |
|---|---|
| Rear only, held at the limit | ~0.35 g (theory 0.35) |
| Front only, held at the limit (ABS) | 0.69 g, 16.2 m (theory 0.69 g) |
| Both, ABS | 0.92 g, 11.4 m |
| Front grabbed at 50 % | Locks before the load transfers |
| Front squeezed to 50 % over 0.5 s | No lock, 21.7 m |
| Rear pedal 100 % with the clutch out | Rear locks and the engine stops |

### Bugs found and fixed
- **Zero-throttle pull-aways stall** with a steady clutch release (correct for the Phase 6 clutch model). The slow-race tips now say: a little throttle to pull away, then close it.
- **Rear brake tip too vague:** 25 % of the pedal locks the rear in a hard stop. The tip now says about 10–20 %.
- **Oversized chart text and an empty road view:** the chart is now width-capped and the road view is shorter.

### Technical decisions
| Decision | Rationale |
|---|---|
| Load transfer lags the acceleration (0.15 s) | Real suspension takes time to pitch; this is exactly why braking must be progressive. With instant load transfer, grabbing the brake would cost nothing. |
| Legacy `brake` kept as an ideal, load-proportioned brake | Phase 6/7 exercises and thresholds behave exactly as before, and that brake can never lock. |
| Front lock fails the exercise but isn't animated as a fall | Honest about consequences without a crash model; the explanation states that a locked front usually means a fall. |
| Sliders for brakes, not hold-to-brake buttons | Dragging gradually is progressive, clicking far along is a grab — the slider maps the technique directly, and works with one pointer (set the rear, then squeeze the front). |
| Stopping-distance chart simulated, not a formula | Includes load transfer, suspension lag and drag, and always agrees with what the simulator does. |

### Testing status (Phase 8)
- `npm run build` and `npm run lint`: pass, 0 warnings (`RideStopSimulatorPage` 42.5 kB / 13.9 kB gzip).
- **Phase 8 automated suite: 48/48 passed.** In-page rider controllers drive each exercise in real time.
  - Stop at the line: the full sequence passes (stopped 0.8 m before the line from 33 km/h); never braking fails "over the line".
  - Smooth acceleration passes; dumping the clutch fails.
  - Steady speed passes with throttle added on the climb; the gradient reaches 5 %; a fixed throttle slows to 34 km/h and resets the timer.
  - Slow race passes (13.9 s with a light rear brake); using the throttle fails "too fast"; stopping fails "foot down".
  - Traffic passes (minimum gap 1.7 s, stopped 1.9 m behind); tailgating fails.
  - Roll-off passes with one downshift; rolling off late fails; using a brake fails.
  - Shortest stop passes (14.8 m); a grabbed front locks, shown in the explanation, the tyre status and a skid mark; a stamped rear locks; the front brake alone takes 19.6 m (too long); a rear lock with the clutch out stalls the engine and is explained.
  - Smooth stop passes (jolt 0.5 m/s²); braking hard to the stop fails (jolt 4.2); front-only fails.
  - Free ride: ABS holds 0.86 g with no lock and no skid marks; CBS pedal applies the front brake; on a wet road a squeeze that grips on dry locks.
  - Pause and play; stopping-distance chart ordering (rear 41 > front 30 > both 25 m at 50 km/h), wet and 70 km/h longer; table view; topic card launches an exercise; brake system locked during exercises; mobile without overflow; hub link; no console errors.
- **Regression:** Phase 0 54/54, Phase 1 25/25, Phase 2 56/56, Phase 3 28/28 (weight-transfer lesson now on the shared model), Phase 4 49/49, Phase 5 32/32 (its pending-page example moved to `/scenarios`), Phase 6 44/44, Phase 7 47/47 (on the extracted gear lever).
  - The machine was heavily loaded during the regression run, and several suites hit Chrome timeouts. Each was rerun on its own; the Phase 1, 2 and 7 scripts now allow longer navigation and protocol timeouts.

### Known bugs / limitations
- No crash/fall model: a locked front wheel is reported and fails exercises, but the motorcycle keeps sliding upright.
- Drive and engine-braking forces aren't grip-limited, so there are no wheelspin or downshift rear-hop effects; no stoppie (front-load share stays below 100 % within the 0.9 g grip limit).
- Grip coefficients and brake strengths are representative of a small commuter motorcycle, not a specific model.
- One pointer means one control at a time on desktop; touch devices can move two sliders at once.

### Components created (Phase 8)
`RideStopSimulator`, `RoadView`, `BrakingView`, `TyreGrip`, `SpeedChart`, `StoppingDistances`, `RideStopSimulatorPage`, `content/simulators/rideStop.ts`, `lib/mechanics/braking.ts`, `lib/simulation/stopping.ts`, `hooks/useGearLever.ts`, `components/simulation/GearLever.tsx`.

---

## Phase 9 — Turning and Motorcycle Handling · COMPLETED

### Completed tasks
- [x] **Module "Turning & Handling"** (`/learn/handling`, `content/modules/handling.ts`): ten lessons, one per item of the brief. Each lesson has:
  - a physics **concept** block;
  - an interactive **illustration**;
  - a **technique** block (steps, key points or terms);
  - a **real-world example**, safety callouts where relevant, and a 3-question **knowledge check**.
  1. **How to take a bend** — slow, look, press, roll.
  2. **Why motorcycles lean** — weight vs grip, tan(lean) = v²/gR, the grip and clearance limits.
  3. **Countersteering** — why every turn starts with a steer the other way.
  4. **Body positioning** — combined centre of mass; lean in on the road, lean out at walking pace.
  5. **U-turns** — steering lock sets the radius; walking pace, clutch and rear brake.
  6. **Tight turns at junctions** — speed decides whether you stay in lane.
  7. **Roundabouts** — give way, signals for each exit, constant lean.
  8. **Slow-speed handling** — why walking pace is hardest; the clutch / throttle / rear-brake triangle.
  9. **Tyre grip** — the friction circle; low-grip surfaces.
  10. **Weight transfer in corners** — per-tyre grip under brake and throttle (reuses the Phase 3 weight-transfer illustration too).
- [x] **Physics** (`lib/mechanics/cornering.ts`, built on `braking.ts`):
  - steady-turn lean, radius and speed; grip lean atan(μ); clearance lean 40° (footpeg geometry matches);
  - steering-lock radius (1.66 m); steer needed to hold or catch a lean;
  - body-position solver (motorcycle 150 kg / rider 75 kg, combined centre of mass);
  - the point-mass lean dynamics model (Åström, Klein & Lennartsson) with a rider controller that countersteers naturally.
- [x] **Ten illustrations**, all from the models:
  - top views, animated on a playable clock: cornering line, U-turn, junction turn, roundabout;
  - rear views: lean angle with force arrows, body position, slow-speed balance with a steering chart;
  - a live countersteering simulation with rear, top and path views and steer/lean traces;
  - the friction circle and per-tyre corner grip.
- [x] Shared components: `RearView` (motorcycle and rider from behind, with lean and rider shift), `LeanForces`, `TopBike`, `TopCar`, a path/timeline toolkit (`path.ts`: straight/arc turtle paths, speed profiles, lean from curvature) and `useLoopTime`.

### Validation (model vs theory)
| Check | Result |
|---|---|
| Countersteer to lean 20° right at 50 km/h | First steer −0.73° (left), steady +1.38° (theory 1.38°) |
| Same at 20 km/h / 80 km/h | −4.55° then 8.62° (theory 8.55°) / −0.28° then 0.54° (theory 0.54°) |
| Steering right "like a bicycle" at 50 km/h | Falls 50° to the left within 1 s |
| Rider 15 cm inward, 30° turn | Motorcycle lean 25.6° |
| Lean doubling time (h = 0.6 m) | 0.33 s |
| Roundabout 10 m at 20 km/h | 17° measured while circulating (theory 17.5°) |

### Bugs found and fixed
- **Lean-limit order:** the illustration reported "tyres sliding" when the footpegs (40°) actually touch down before the dry-road grip limit (42°). It now applies whichever limit comes first.
- **U-turn explanation:** it gave no explanation when speed widened the turn but it still fitted; that case is now explained.
- **Two wrong figures in lesson text:** a wet roundabout at 30 km/h needs *more than all* the wet grip, not "more than half"; the braking left at 30° of lean is 0.69 g, not 0.68 g.
- **Junction kerb arc** drawn the wrong way round.
- **Layout:** roundabout too small, car overlapping a label, lean-angle arc colliding with the rider.

### Testing status (Phase 9)
- `npm run build` and `npm run lint`: pass, 0 warnings.
- **Phase 9 automated suite: 54/54 passed.**
  - Module structure, the curriculum validator, and the full flow through all 10 lessons (every illustration renders, every quiz is completed correctly, navigation reaches the end).
  - **Bend:** phases animate slow → look → press → roll → exit; lean matches theory at two speeds.
  - **Lean:** matches theory; clearance and wet-grip limits are explained.
  - **Countersteer:** first steer is opposite to the turn for both directions; holding steer matches theory at 50 and 20 km/h; the bicycle-style steer falls to the outside.
  - **Body position:** leaning in and out changes the motorcycle's lean but not the combined lean or the tyre load; the U-turn advice is shown.
  - **U-turn:** fits, doesn't fit, too fast, partial lock.
  - **Junction:** stays in lane at 15 km/h, runs wide at 30 km/h, the wider corner needs less lean.
  - **Roundabout:** signal sequence for the 3rd exit when keeping left, mirrored when keeping right, no signal for straight on, give-way, circulating lean.
  - **Slow balance:** steering needed, doubling time, beyond-lock case.
  - **Friction circle:** percentages, sliding, wet road.
  - **Corner grip:** balanced at steady throttle, rear-limited under braking, front-limited under hard throttle.
  - Mobile without overflow; no console errors.
- **Regression:** Phase 0 54/54, Phase 1 25/25, Phase 2 56/56, Phase 3 28/28, Phase 4 49/49, Phase 5 32/32, Phase 6 44/44, Phase 7 47/47, Phase 8 48/48.
  - The Phase 5 hub check now waits for the lazy-loaded page heading; it was reading the heading too early.

### Known limitations
- The lean dynamics use the point-mass model, without gyroscopic or trail effects; it reproduces countersteering and the speed dependence, not every detail of a real motorcycle.
- Tyre width (which adds a few degrees of real lean) is ignored, and the rear-view drawings are schematic.
- Roundabout signalling follows the common rule for a single-lane roundabout; the lesson tells riders to check their local highway code.

### Components created (Phase 9)
`CorneringLine`, `LeanAngle`, `Countersteer`, `BodyPosition`, `UTurn`, `JunctionTurn`, `Roundabout`, `SlowBalance`, `FrictionCircle`, `CornerGrip`, `RearView` + `LeanForces`, `TopBike` + `TopCar`, `components/handling/path.ts`, `useLoopTime`, `lib/mechanics/cornering.ts`, `content/modules/handling.ts`.

---

## Phase 10 — Real-World Scenario Simulator · COMPLETED

### Completed tasks
- [x] **`/scenarios`:** all 14 scenarios, with a "solved" count kept in this browser. **`/scenarios/:id`:** one page per scenario, with previous/next navigation.
- [x] **Every scenario has** an animated environment (top or side view), a situation description, a decision between three options, and the outcome:
  - the **rider's response**;
  - the **motorcycle's response**, with numbers computed by the models;
  - **why** it turns out that way;
  - the **safety consequence**, with a verdict (Safe / Risky / Crash, shown with icon and text), metrics, a takeaway once solved, replay and slow motion.
- [x] **Consequences are computed, not scripted.** Each decision runs the shared models: powertrain + brakes (`stepPowertrain`), lean dynamics (`swerve`, built on `stepLean`/`riderSteer`), cornering grip (`leanFor`, friction circle), plus a quarter-car suspension model for the speed breaker. Collisions, stopping distances, roll-back, brake heat, lean and grip use all come from those runs.

| # | Scenario | Decisions (verdict) |
|---|---|---|
| 1 | Traffic signals | Stop progressively (safe); keep 50 km/h, enters on red (risky); accelerate to beat it (risky) |
| 2 | Heavy traffic | Truck's blind spot (crash); two seconds back, visible (safe); filter at 50 km/h (crash) |
| 3 | Uphill starts (12 %) | Brake off first, rolls 2 m into the car (crash); rev and drop the clutch (risky); brake held until the clutch bites (safe, 1 cm roll-back) |
| 4 | Downhill (10 %, 3 km) | 5th + brakes, 263 °C (risky); 3rd, engine holds 40 km/h (safe); neutral, 510 °C fade (crash) |
| 5 | Speed breakers | 40 km/h, wheel leaves the road (risky); braking over it, front locks at 27 % load (crash); 15 km/h, brakes off (safe) |
| 6 | Potholes | Late swerve hits it leaned (risky); brake into it at 32 km/h (risky); early smooth line (safe) |
| 7 | Wet roads | 60 km/h needs 35° > 27° limit (crash); 45 km/h, 80 % of grip (risky); 35 km/h (safe) |
| 8 | Gravel | Brake on it (crash); carry 40 km/h, 120 % (crash); slow first, 47 % (safe) |
| 9 | Emergency braking | Grab front, lock (crash); rear only, hits at 34 km/h (crash); clutch in, both brakes progressively (safe, 1.9 m spare) |
| 10 | Sudden obstacles | Brake only, hits at 28 km/h (crash); countersteer swerve, clears by 0.2 m (safe); brake + swerve exceeds grip (crash) |
| 11 | Overtaking | Pass in 5th, 0.6 s margin (risky); change down to 3rd, 3.0 s margin (safe); wait (safe) |
| 12 | Highway riding (80 km/h) | 1 s gap, hits at 28 km/h (crash); 2 s (safe); 3 s (safe) |
| 13 | Night riding | 70 km/h on low beam needs 42.5 m vs 40 m seen (crash); high beam dazzles the oncoming car (risky); 50 km/h (safe) |
| 14 | Pillion (70 kg) | Usual braking point, 0.7 m over the line (risky); grab harder, 0.74 g lurch (risky); brake earlier (safe) |

- [x] **Renderers:**
  - `TopSceneView`: curved or straight roads, lanes, stop line, signal, crossing road, pothole, gravel patch; cars, trucks, a tractor and a dog with brake lights and indicators; rain; night darkness with a headlight beam; a pillion; falls.
  - `SideSceneView`: road profile to scale (heights exaggerated ×5 only for the speed breaker, labelled), a car behind, suspension compression.
- [x] **Model additions:**
  - `PowertrainInputs.extraMass` (a pillion or luggage; brake strength stays the same);
  - `riderSteer` urgency (everyday turn vs emergency swerve);
  - the scenario engine (`lib/scenarios/types.ts`, `sim.ts`: `ride`, `goodBraking`, `swerve`, `bumpRide`).
- [x] **Driving side:** scenarios are drawn for left-hand traffic (India, UK), and the list page says so.

### Bugs found and fixed
- **Swerves were far too gentle:** a 0.4 m sideways move with the everyday controller. Added an urgency setting: an emergency swerve now moves 1.1 m in 12 m at 50 km/h.
- **Emergency braking:** the correct technique ended exactly at the car, because the rider holds the throttle during the reaction second. Moved the car to 32 m; the correct technique now has 1.9 m to spare.
- **Hard-coded distances in the text** ("about 44/27/54 m") didn't match the computed runs. Every stopping distance is now computed. The night scenario measures from the speed at the moment the hazard appears, so "needs" + "stopped short by" = the distance seen.
- **Brake strength:** brake force grew with extra mass; it is now fixed by the lever.
- **Brake + swerve** reported 0.90 g needed vs 0.90 g available; it now uses realistic hard braking (0.8 g), needing 0.95 g.
- **Blind-spot text** said "contact at 0 km/h"; it now explains that the trailer sweeps into the stopped motorcycle.
- **Night layering:** the darkness covered the rider's own motorcycle.
- **Speed-breaker visibility:** the 10 cm bump was only 2 px tall at true scale.

### Testing status (Phase 10)
- `npm run build` and `npm run lint`: pass, 0 warnings.
- **Phase 10 automated suite: 17/17 passed.** Its main check covers all **42 decisions** (14 × 3) through the UI. Each gives the expected verdict, the four outcome sections, metrics and no NaN or undefined values; each outcome animates; every safe choice shows the takeaway. Other checks:
  - the signal animates amber → red; the uphill roll-back shows negative speed; night darkness and rain are drawn;
  - pause and replay; the solved count reaches 14 of 14 and every card is marked solved;
  - next-scenario navigation, an unknown scenario shows "not found", mobile without overflow, no console errors.
- **Regression:** Phase 0 58/58 (routes now include `/scenarios`, a scenario and an unknown one), Phase 1 25/25, Phase 2 56/56, Phase 3 28/28, Phase 4 49/49, Phase 5 32/32 (pending example moved to `/progress`), Phase 6 44/44, Phase 7 47/47, Phase 8 48/48, Phase 9 54/54.

### Known limitations
- **Reaction time** is fixed at 1 s for every rider.
- **Partly scripted:** other road users follow scripts, and the blind-spot and filtering outcomes use simple geometry for contact.
- **Brake heat** assumes no cooling; the text says so.
- **Not modelled:** the pillion's effect on centre-of-mass height; the dog swerve assumes the other lane stays clear.
- **Progress:** "solved" is stored per browser only; full progress tracking is Phase 12.

### Components created (Phase 10)
`ScenariosPage`, `ScenarioPage`, `ScenarioPlayer`, `TopSceneView`, `SideSceneView`, `useScenarioProgress`, `lib/scenarios/{types,sim}.ts`, `content/scenarios/{helpers,traffic,roads,conditions,emergency,index}.ts`.

---

## Phase 11 — Advanced Motorcycle Mechanics · COMPLETED

### Completed tasks
- [x] **Module "Advanced Mechanics"** (`/learn/mechanics`, `content/modules/mechanics.ts`): 17 lessons, one per topic in the brief — four-stroke engine, combustion, compression ratio, torque and horsepower, gear ratios, clutch plates, transmission, fuel injection, carburettor, cooling, lubrication, ABS, traction control, suspension, tyre dynamics, weight transfer, engine braking. Each lesson has a mechanical explanation, at least one interactive illustration, a real-world example and a 3-question quiz.
- [x] **New models:**
  - `combustion.ts`: single-zone first-law cycle, Wiebe burn, slider-crank volume, an end-gas temperature proxy for knock, and Otto efficiency.
  - `tyre.ts`: Pacejka-style slip curves (longitudinal grip peaks at 12.5 % slip, locked ≈ 69 %; lateral peaks at about 5°), plus ABS and traction-control wheel-slip simulations.
  - `engineSystems.ts`: EFI air-per-cycle and pulse width with enrichment; carburettor venturi/Bernoulli with needle, altitude and choke; air vs liquid cooling with thermostat and fan; oil viscosity (10W-30 fit), pump, relief valve and film.
  - The quarter-car model now takes spring rate and damping and records tyre load.
- [x] **15 new illustrations:** valve timing (cutaway + lift chart), combustion pressure, compression ratio, torque and power (two charts, one axis each), clutch capacity, sequential shift drum, fuel injection, carburettor, cooling, lubrication, ABS cycle, traction control, suspension tuning, tyre slip, engine-braking chart.
- [x] **Reused:** the engine cycle, clutch, gearbox, gear-speed chart, wheel torque, torque lever, weight transfer, corner grip, friction circle and the fork diagram.
- [x] **Shared `LineChart`:** one axis, recessive grid, direct labels, legend, hover crosshair with values, marker and bands, emphasis colouring.

### Validation (model vs known values)
| Check | Result |
|---|---|
| Best spark timing | ≈ 21° BTDC; peak 56 bar at 13° ATDC; 124 J per cycle (8.3 kW at 8,000 RPM) |
| Efficiency | 49 % of the heat released (≈ 30 % of the fuel energy) |
| Ideal efficiency | 59.4 % at 9.5:1, 64.2 % at 13:1 |
| Torque / power peaks | 10.2 N·m at 6,500 RPM; ≈ 8 kW at ~8,500 RPM; P = T × ω checked at 6,500 RPM (6.94 kW) |
| Clutch capacity | 60 N·m = 1.75× the engine's peak at the clutch (18 N·m at the crank, as in the simulators) |
| ABS from 50 km/h | 13.2 m vs 16.0 m locked (dry); 24.3 m vs 28.5 m (wet) |
| Traction control | slip held at ≈ 7 % (peak 12 %) vs wheelspin to the limiter |
| Engine braking at 40 km/h | 3rd: 0.96 m/s² vs coasting 0.34 m/s² |

### Bugs found and fixed
- **Tyre curve:** the first version kept 91 % of grip when locked, which made ABS look useless; retuned.
- **ABS run** never ended at walking pace (zero slip below 0.5 m/s); fixed.
- **Wheelspin** wasn't capped by the rev limiter; fixed.
- **Carburettor choke** gave an implausible air–fuel ratio of 4.4:1; now 8.3:1.
- **Engine-braking lines** kinked where the idle controller steps in; lines now start at 2,000 RPM.
- **Cornering curve** peaked at an unrealistic 13° of slip angle; now about 5°.
- **Layout:** clipping and overlapping labels in the compression-ratio, clutch, shift-drum and lubrication diagrams; the suspension chart's y-axis clipped the peak.

### Testing status (Phase 11)
- `npm run build` and `npm run lint`: pass, 0 warnings.
- **Phase 11 automated suite: 49/49 passed.** It covers the module structure, the full flow through all 17 lessons (every illustration renders, every quiz completed), and each illustration's numbers against its model. Other checks:
  - knock and late-spark explanations, high-octane fuel at 13:1, clutch slip with the wrong oil, shift-drum steps;
  - cold-start and full-throttle enrichment, the carburettor going rich at altitude and with the choke;
  - air vs liquid cooling, oil pressure, relief valve and low-pressure warning;
  - ABS, traction control, sag, damping and preload, tyre slip states and contact patch, engine braking and over-rev;
  - mobile without overflow; no console errors.
- **Regression:** Phases 0–10 all pass (58, 25, 56, 28, 49, 32, 44, 47, 48, 54, 17).

### Known limitations
- The models are representative of a 125 cc single, not a specific engine.
- **Combustion:** wall loss is a fixed share, and knock uses an end-gas temperature threshold.
- **Cooling** temperatures are steady states.
- **Shift drum:** the fork-to-gear layout is representative.
- **ABS / traction control:** one lumped wheel.

---

## Phase 12 — Progress Tracking & Knowledge Assessment · COMPLETED

### Completed tasks
- [x] **Progress store** (`lib/progress/store.ts`):
  - one versioned record in `localStorage` (`motolab:progress:v1`), read through `useSyncExternalStore`;
  - kept in sync across tabs (storage events);
  - falls back to memory if storage is unavailable;
  - migrates the Phase 10 "scenarios solved" key.
- [x] **What is tracked:**
  - **Lessons:** visited, and completed (the knowledge check finished), with the best and last quiz score and the number of attempts.
  - **Simulator exercises:** every verdict, from all three simulators through `useExercises(…, source)`; passes are kept.
  - **Scenarios:** every decision with its verdict; the safe decision counts as solved.
  - **Assessments:** each attempt, with a per-module breakdown.
  - **History:** the last 200 practice events.
- [x] **Levels and summary** (`lib/progress/summary.ts`). Points come from:
  - 10 per lesson completed;
  - 2 per quiz question correct (best attempt);
  - 15 per exercise passed and per scenario solved;
  - the best assessment percentage.

  Six levels by share of the 1,411 available points: Newcomer, Learner, Novice rider, Road-ready, Skilled rider, Expert.
- [x] **`/progress`:**
  - level card with progress bar, points and the next step ("Continue: …");
  - six totals: lessons, quiz score, exercises, scenarios, best assessment, practice sessions;
  - per-module progress, with an expandable lesson list showing ticks and best scores;
  - assessment attempts table;
  - per-simulator exercise progress and recent practice history (icon + text results);
  - reset with confirmation.
- [x] **`/progress/assessment`:**
  - 20 questions, 5 from each module (one per lesson where possible), with a new seeded set each attempt;
  - one question at a time, with back and next;
  - results: pass/fail at 80 %, a per-module breakdown linking to each module, and a full review with the correct answer and explanation for every question.
- [x] **Progress shown in context:** completed ticks and best quiz score on module pages, "n of N completed" on the Learn page, and the scenario list's solved count now comes from the store.

### Testing status (Phase 12)
- `npm run build` and `npm run lint`: pass, 0 warnings.
- **Phase 12 automated suite: 27/27 passed.**
  - A visited lesson counts as started; finishing a quiz completes it; retakes keep the best score.
  - Module and Learn pages show progress.
  - Simulator fail and pass are recorded; scenario decisions are recorded and solved.
  - **Checkpoint: everything is still there after refreshing the page**, and in a new tab.
  - Assessment: all correct passes with 20/20; all wrong fails with every question explained; a new set each attempt; attempts survive a refresh.
  - Everything done gives Expert at 100 %.
  - Reset asks for confirmation, clears everything and stays cleared after a refresh; legacy scenario progress is carried over.
  - No console errors; mobile without overflow.
- **Regression:** Phases 0–11 all pass — 60, 25, 56, 28, 49, 32, 44, 47, 48, 54, 17, 49.
  - `/progress` is no longer a pending page, so the Phase 0 routes and the Phase 5 hub check were updated.
  - In the full batch run the Phase 4 and Phase 5 suites hit browser timing problems under load; both passed on their own (49/49, 32/32).

### Known limitations
- Progress lives in one browser: no accounts and no sync between devices. The page says so.
- Assessment questions come from the lesson quizzes, so a learner who has done every quiz has seen them before (the order and selection change each time).

---

## Phase 13 — Final Quality Assurance · COMPLETED

### What was reviewed
| Area | How | Result |
|---|---|---|
| All routes | Crawled every internal link from the home page (81 routes: 4 modules, 50 lessons, 4 simulators, 14 scenarios, progress, assessment, anatomy, checklist…) | All render one `<h1>`; no broken links |
| All buttons and interactive controls | Pressed every visible, enabled button on every page — 939 presses in 106 page runs, with and without reduced motion | 0 errors |
| Animations | Reduced-motion run; looping illustrations wait for Play | Pass |
| Lesson sequences | Full flow through all 50 lessons with every quiz (Phase 3, 4, 9 and 11 suites) | Pass |
| Simulator states | Phase 5–8 suites (starting, clutch & throttle, gears, ride & stop) | Pass |
| Responsive design | Every route at 1440, 768 and 375 px | No horizontal scrolling |
| Accessibility | axe-core (WCAG 2.1 AA) on every route; keyboard: skip link, focus rings, sliders and quizzes by keyboard | 0 serious or critical violations |
| Performance | Production build; route-level code splitting | Framework entry chunk 150 kB gzip; content loads per page (curriculum 159 kB raw only on learning pages) |
| Technical accuracy | Model-vs-theory checks in the Phase 6–12 suites; lesson figures cross-checked against the models | Pass |
| Console errors | Every route | None |
| Missing content / stale text | Source search for placeholder and phase text; roadmap statuses | Fixed (below) |

### Issues found and fixed
- **Colour contrast (1,025 elements on 81 pages):** small text in the subtle grey (`ink-subtle` #6b7482) fell to 3.87:1. Raised to #848d9b, which clears 4.5:1 on every surface (4.59 on the lightest) and stays below `ink-muted`.
- **Unlit warning lamps** in the instrument-cluster lesson were 1.87:1; they now use the readable subtle ink (lit lamps keep their coloured fill).
- **Tablet layout:** on the four module pages the lesson lists overflowed sideways by up to 272 px at 768 px; the list items can now shrink.
- **Page titles:** 80 of 81 pages shared one `<title>`; added `usePageTitle`, so every page has its own (for example "Countersteering · Turning & Handling · RideCraft").
- **Stale content:**
  - the home learning path stopped at Phase 10 ("Nine stages") — it now includes Advanced Mechanics and Check what you know ("Eleven stages");
  - removed the obsolete pending route and the unused `PhasePendingPage`;
  - updated stale comments (checklist, roadmap).

### Testing status (Phase 13)
- **Final QA suite: 14/14 passed.**
  - The crawl reached 81 routes, each with exactly one `<h1>`; no broken links.
  - 81 distinct titles; no console errors or warnings.
  - No serious or critical axe violations.
  - No sideways scrolling at 768 or 375 px.
  - The first Tab focuses a visible skip link that jumps to the main content; sliders and quiz answers work by keyboard with visible focus.
  - Reduced motion is respected; unknown lessons show a titled not-found page.
- **Full regression: all suites pass** — Phase 0 60, 1 25, 2 56, 3 28, 4 49, 5 32, 6 44, 7 47, 8 48, 9 54, 10 17, 11 49, 12 27, 13 14 = **550 checks**.
- `npm run lint`: 0 warnings. `npm run build`: clean.

### Remaining limitations (non-blocking)
- Progress lives in one browser: no accounts or cross-device sync.
- The physics models are representative of a 125 cc single, and are simplified where noted in each phase: point-mass lean model, lumped-wheel ABS, steady-state cooling, scripted traffic in scenarios.
- Scenarios are drawn for left-hand traffic; the physics is universal.
- Optional future work: a separate vendor chunk for better caching, a light theme, and online sharing or accounts.

### Sharing
- `vite.tunnel.config.ts` allows serving the production build through a temporary Cloudflare quick tunnel: `npm run build && npx vite preview --config vite.tunnel.config.ts`, then `cloudflared tunnel --url http://localhost:4173`. Quick-tunnel links are temporary and stop when the Mac sleeps or the processes end.

---

## Project complete
All 14 phases are complete:
- 4 learning modules (50 lessons, 150 quiz questions);
- 4 physics-based simulators with 19 scored exercises;
- 14 real-world scenarios (42 computed decisions);
- an Anatomy Explorer and a pre-ride checklist;
- progress tracking and a knowledge assessment.

All checked by 550 automated tests.

---

# Stage 2 — Full-stack evaluation and hardening

Same rules as Stage 1: one phase at a time, test everything, stop for approval. Significant architecture (backend, database, paid services) needs an approved proposal (Phase 2) before implementation. Phases may be reordered when dependencies require it.

## Stage 2 roadmap

Revised 2026-11-02 from the user's improvement brief. Hard rules: no source changes in Phase 0; physics independent of React and unit-tested; no brand, pricing or full redesign changes; animations only where they explain a mechanism. Backend, database or paid services only through an approved Phase 2 proposal.

| # | Phase | Status |
|---|-------|--------|
| 0 | Codebase audit and architecture understanding | COMPLETED |
| 0a | Safety net: tests into the repo, `vercel.json`, progress validation (proposed) | SKIPPED by user (2026-11-02) |
| 1 | Mechanical content and physics accuracy audit | COMPLETED |
| 2 | Cause-and-effect simulation architecture (+ backend decision) | COMPLETED |
| 3 | Clutch explorer — reference implementation | COMPLETED |
| 4 | Other mechanical and physics simulations | COMPLETED |
| 5 | Lesson structure and educational content | IN PROGRESS |
| 6 | Safety education | NOT STARTED |
| 7 | Learning progress and assessments | NOT STARTED |
| 8 | Mobile responsiveness and accessibility | NOT STARTED |
| 9 | Testing, performance and reliability | NOT STARTED |

## Stage 2 · Phase 0 — Complete codebase audit · COMPLETED

Full report (findings G1–G4, E1–E6, C1–C7, B1–B5, H1, F1 and the prioritised plan): [docs/audits/phase-0-codebase-audit.md](docs/audits/phase-0-codebase-audit.md). The summary below is the first pass.

Read-only audit of the code, build, data model and tooling. No application code changed.

### Inventory
- 190 TypeScript files, ~22,800 lines. Dependencies: 10 runtime (React 19, React Router 7, Motion, lucide, fonts, clsx, tailwind-merge), 9 dev (Vite 8, TypeScript 7, Tailwind v4, oxlint).
- Layers: `lib/mechanics` (11 physics models, ~1,000 lines, pure functions), `lib/simulation` + `lib/scenarios` (time-stepping and scenario engine), `lib/progress` (store, summary, assessment), `content/` (50 lessons, 14 scenarios, 19 exercises, 47 illustrations as data + components), `components/`, `pages/` (16 lazy routes).
- No network calls, no environment variables, no secrets. The only persistent state is `localStorage` (`motolab:progress:v1`) plus a `sessionStorage` reload guard.
- Build: 2.1 MB `dist`, 150 JS chunks. Entry chunk 463 KB raw / 148 KB gzip (React, React DOM, Router, Motion); curriculum 46 KB gzip; each page loads only its own chunk. CSS 15 KB gzip. Fonts are unicode-range subsets (only the Latin files download).
- Deployment: GitHub `akashojha4/RideCraft` → Vercel (auto-deploy on push). Temporary Cloudflare tunnel still running for the old share link.

### Findings (ranked)

| # | Severity | Finding | Evidence |
|---|----------|---------|----------|
| 1 | High | The 550-check test suite and all measurement scripts live only in the session's temporary scratchpad, not in the repository; no CI. They will be lost on reboot and nobody else can run them. | ~100 `.mjs` files in scratchpad `e2e/`; `find` for tests in repo returns nothing |
| 2 | High | Saved progress is parsed and cast without validation. Malformed data crashes pages, and keeps crashing until storage is cleared. Must be fixed before any sync: server data needs the same validation. | Verified: `lessons: null` crashes `/progress` and `/learn`; `history: {}` crashes `/progress`. Invalid JSON and wrong field types were handled. |
| 3 | High (unverified) | No SPA rewrite for Vercel (`vercel.json`), so refreshing or opening a deep link such as `/learn/handling` will most likely return 404. | No config file in repo; needs a check against the live URL |
| 4 | Medium | Physics models have no unit tests; accuracy is checked only through browser end-to-end and measurement scripts (also in the scratchpad). | — |
| 5 | Medium | No production error monitoring: crashes on visitors' devices are invisible. | — |
| 6 | Medium | No security headers (Content-Security-Policy, X-Content-Type-Options, Referrer-Policy, frame-ancestors). Low risk for a static site with no secrets, but cheap to add. | — |
| 7 | Medium | Limited SEO/sharing: one meta description for every page, no `robots.txt`, `sitemap.xml` or social preview image; content renders client-side only. Matters once the domain is public. | `index.html`, `public/` |
| 8 | Low | Internal `/design-system` page is publicly reachable. | `router.tsx` |
| 9 | Low | Entry chunk 148 KB gzip is acceptable, but Motion dominates it; curriculum content is one 46 KB chunk. Watch, no action yet. | build output |
| 10 | Low | `package.json` version 0.0.0 and no Node `engines` pin (Vercel picks its default Node version). | `package.json` |
| — | Intentional | Storage keys keep the `motolab:` prefix after the rename, so saved progress isn't lost. | `store.ts`, `RouteErrorPage.tsx` |

### Preliminary architecture assessment (input to Phase 2)
- **Should stay client-side:** all physics and simulations. The models are small pure functions stepped at 60 fps; a server would add latency, cost and break offline use with no benefit. Also lesson and scenario content (static, versioned with the code), practice scoring and the assessment question shuffle.
- **Would justify a backend:** optional accounts with cross-device progress sync; later, possibly instructor/course features or an AI tutor (server-held keys, rate limits).
- **Not justified now:** server-side simulation, background processing, cloud object storage, analytics infrastructure beyond a privacy-friendly page counter.
- **Sync readiness of the data model:** good. Every record already carries timestamps (`visitedAt`, `completedAt`, `at`, solved-at), so local and server copies can be merged without overwriting (union of records, keep best quiz score, latest timestamps). Gaps: no schema validation (finding 2), no event IDs for de-duplicating history, a single `version: 1` with no migration path yet.
- Candidates to compare in Phase 2: Supabase (Postgres + Auth + row-level security), Firebase (Firestore + Auth), and a custom Fastify/Node API with Postgres, all hosted alongside Vercel.

### Recommended quick fixes (need approval; small, no architecture change)
1. Move the test suite into the repository (`tests/e2e/`) with an `npm test` script, so it isn't lost.
2. Add `vercel.json` with the SPA rewrite and basic security headers.
3. Validate saved progress on load and fall back safely on malformed records.

## Stage 2 · Phase 1 — Mechanical content and physics accuracy audit · COMPLETED

Report only; no content or model changed. Full report: [docs/audits/phase-1-physics-accuracy-audit.md](docs/audits/phase-1-physics-accuracy-audit.md).

- Read in full the lessons, anatomy entries and simulator/scenario explanations covering the 14 concepts; recomputed every numerical claim with the project's models or by hand (verification against the models and standard formulas, not external validation).
- 0 Critical, 1 High, 9 Medium, ~20 Low. Most content verified correct (gear ratios, clutch capacity, combustion, compression, torque/power, load-transfer formula, lean formula, friction circle, contact patch, ABS/TC, chain).
- High: **H6** U-turn turning circle ~25–35 % too small (handlebar angle used as road steer angle; rear-wheel path; owner manuals list 1.9–2.9 m for 125 cc motorcycles).
- Medium: TH1 throttle "run wide" contradicts the handling lesson; CD1 gyroscopic-stability claim (Kooijman et al. 2011); CS1 "no countersteering at walking pace"; WT1 "weight moves forward" wording (~15 places); WT2 suspension lag presented as the cause of progressive braking; CL1 cable-only clutch description (hydraulic missing); CL2 clutch drag; CL3 linear clutch model; M-series model labels.
- Prioritised correction list in the report; fixes are scheduled for Phases 3–5.

## Stage 2 · Phase 2 — Cause-and-effect simulation architecture · COMPLETED

Proposal (no code changed yet): [docs/architecture/phase-2-simulation-architecture.md](docs/architecture/phase-2-simulation-architecture.md).
- Inspected: `useSimulationClock` (generic, keep), `usePowertrainSim` (generic runtime mixed with powertrain specifics), `timeline.ts` (scripted engine, keep), `useExercises`, three copied "What is happening" panels, `MotorcycleSideView` highlighting, the guided flow inside `StartingSimulator`.
- Proposed: `SimModel` contract (step, derive, rotations, explain with a causal chain, assumptions), generic `useSimulation` with `usePowertrainSim` as an API-identical wrapper, `useGuidedMode`, shared `ExplanationPanel` / `CauseEffectChain` / `AssumptionsPanel` / `GuidedSteps`, model-limits panel on all four simulators.
- Backend decision: stay frontend-only (no requirement in Phases 2–9).
- Approved by the user 2026-11-02 ("approve all"): architecture, Vitest, frontend-only.

### Implemented
| Step | Files |
|---|---|
| 2a Model contract + generic runtime | `lib/simulation/model.ts` (SimModel, Explanation with causal chain, Assumption, GuidedStep, `chainComponents`), `lib/simulation/models/powertrain.ts` (derive, rotations, chain, explain, assumptions), `hooks/useSimulation.ts` (generic runtime: clock, dt cap, 20 Hz snapshots, history, sequences, onStep, rotation MotionValues), `hooks/usePowertrainSim.ts` rebuilt as a wrapper with the same API |
| 2b Shared explanation panel | `components/simulation/ExplanationPanel.tsx` replaces 3 copies; explanation tones unified on `Tone` (`neutral` → `info` in `rideStop.ts`) |
| 2c Teaching components | `CauseEffectChain.tsx`, `AssumptionsPanel.tsx`, `GuidedSteps.tsx`, `hooks/useGuidedMode.ts`, `lib/simulation/guided.ts`; "Model limits" panel with per-simulator `assumptions` on all four simulators |
| 2d Unit tests | Vitest 5.0.5 (dev only), `npm test`; `models/powertrain.test.ts` (adapter = physics, derive, rotations, chain, stall), `guided.test.ts`, `mechanics/mechanics.test.ts` (pins the Phase 1-verified figures) |

### Tests
- Unit: 22/22 pass (`npm test`).
- Baseline before changes: P5 32, P6 44, P7 47 (one crash on first run from machine load, passed on rerun), P8 48.
- After changes: P5 32, P6 44, P7 47, P8 48 — unchanged; new `s2p2test` 23/23 (panel present, collapsed, keyboard-operable, assumptions listed, explanation panel live, no overflow at 375 px, no console problems).
- `tsc -b`, oxlint 0 warnings, production build clean; no test code in `dist`.
- Site-wide P13 suite 14/14: 81 routes crawled, 0 serious/critical axe violations, no overflow at 375/768 px, keyboard checks pass.

### Not yet used on a page
`CauseEffectChain`, `GuidedSteps` and `useGuidedMode` are built and their logic is unit-tested, but their first page is the Phase 3 clutch explorer, where they get browser tests.

## Stage 2 · Phase 3 — Clutch explorer (reference implementation) · COMPLETED

Route `/simulators/clutch-explorer`; the first simulator built entirely on the Phase 2 architecture.

### New clutch model (`lib/mechanics/clutch.ts`) — fixes Phase 1 CL3 / M1
- Lever → pushrod: freeplay (cable 12 %, hydraulic 4 %), then proportional to 2.4 mm.
- Pushrod → clamp load: F = 1,150 N · (1 − x/0.65 mm)^1.6 (cushion-plate stand-in; exponent is a stated model choice). Fast drop, gentle tail; friction zone ≈ 12–36 % of lever travel (was 15–60 %, linear).
- Capacity n·μ·F·r with μ 0.15 gripping / 0.13 slipping (≈ 69 / 60 N·m at the clutch); 0.8 N·m oil drag when disengaged; spring force rises with lift.
- `clampingForce(pull, actuation)` API kept, so every existing consumer follows the new model.
- Powertrain: sliding capacity while slipping, static capacity for locking, drag torque; optional `actuation` input; displayed capacity = gripping when locked, sliding otherwise, never below drag.

### Explorer
| Piece | File |
|---|---|
| Model, cause-and-effect chain, explanations, drive source (engine / wheel → engine / momentum / stationary), guided steps, assumptions | `content/simulators/clutchExplorer.ts` |
| Cross-section (lever, cable & arm or slave cylinder, pushrod, pressure plate with clamp arrows, springs, 9 plates, basket, hub) + end view of basket and hub; parts dim or light from the chain and the guide | `components/simulators/clutchExplorer/ClutchMechanismView.tsx` |
| Clamp load vs lever pull for both clutch types, friction zone and "Now" marker | `ClampCurve.tsx` |
| Page assembly: controls (lever, throttle, brake, gear N–3, cable/hydraulic, rolling at 40 km/h, restart), play/pause/0.25×/reset, guided mode (6 steps), cause-and-effect strip, explanation, model limits | `ClutchExplorer.tsx`, `pages/ClutchExplorerPage.tsx` |
| Entry points | route; Simulators hub card ("Mechanism explorer"); CTAs in `basics/understanding-clutch` and `mechanics/clutch-plates` |
| Reuse | `DrivetrainPanel` (now takes an explicit clutch `status`; gear label generalised to 1st–3rd) |

### Content corrections (Phase 1)
- CL1: cable **and** hydraulic actuation in the anatomy entry, lesson terms and the freeplay quiz explanation; mechanics key point qualified.
- CL2: clutch drag ("almost no torque passes … first gear goes in with a clunk").
- CL4: "power" → "torque" in the stall question and the anatomy callout.
- CL5: slipper, assist and dry clutches in `mechanics/clutch-plates`.
- Model-limits text for the powertrain updated to the new clutch model.

### Effect on existing simulators
Friction zone is narrower, so the browser test controllers (not the site) were updated to hold the lever at the new positions (biting ≈ 32 % instead of 55 %; release through 38 → 18 % over ~2.5 s). Exercise rules unchanged; all exercises still pass at a human pace.

### Tests
- Unit: 37/37 (`clutch.test.ts` model shape, freeplay, monotonic, non-linear, zone width, capacity; `clutchExplorer.test.ts` drive source, torque ≤ capacity, guided steps completed by a scripted rider).
- Browser `s2p3test`: 31/31 (mechanism readouts, freeplay, separation, non-linear clamp, spring force, hydraulic, gear rule, drive source, momentum, highlighting, pause/slow/reset, guided mode, keyboard, 768/375 px, entry points, no console problems).
- Regression: P0 60, P2 56, P3 28, P5 32, P6 44, P7 47, P8 48, P10 17, P11 49, P12 27, s2p2 23, P13 14 (81+ routes, axe 0 serious) — all pass. Lint 0, build clean.
- Two real bugs the regression run caught, both scripts written for the old 15–60 % zone: the Starting simulator's scripted biting point (45 % → 30 %; it showed "Disengaged" while creeping) and the uphill-start scenario's correct choice (55 % → 30 %). Verified the scenario outcomes are unchanged: correct = safe, brake-first = rolls back, dump = risky.
- Fixes found by looking at screenshots: overlapping labels, unreadable phone labels (end view split out, larger text on phones), controls moved directly under the drawing on phones, "Slipping" shown while locked, overlapping chart end labels, "Turning together" shown when nothing turns.

## Stage 2 · Phase 4 — Other mechanical and physics simulations · COMPLETED

### Model fixes (Phase 1 findings)
| Finding | Change | Files |
|---|---|---|
| H6 U-turn circle too small | Steering-head rake (26°) added: road steer = atan(tan(bar)·cos rake), so 38° at the bars is 35.1° at the road. Turning radius measured at the front wheel, L / sin(road steer) = 2.26 m (owner's manuals: 1.9–2.9 m for 125 cc). Rider-steering limit and the slow-balance chart use the road-plane lock. Lesson: 4.5 m circle, ~6 m of road; 13° at 8 km/h, 27° at 12 km/h, footpegs above ~15 km/h; slow-speed lock limit 4.5 km/h; example street widths 7 m / 5 m. | `cornering.ts`, `UTurn.tsx`, `SlowBalance.tsx`, `handling.ts` |
| M3 wheel inertia | Both wheels 0.9 kg·m² (as in `tyre.ts`) → about 10 kg of extra inertial mass (+4.5 %) in acceleration, braking and the locked-clutch solution; weight and grip still use the real mass. | `powertrain.ts` |
| M4 sliding grip | `SLIDING` 0.75 → 0.70, the slip curve's value at 100 % slip. | `braking.ts` |
| M5 rear-lock stall | A locked rear wheel now holds the wheel side of the clutch at zero; the plates drag the engine down and it stalls within a fraction of a second (cause "wheel"), instead of stopping instantly; no drive passes through a sliding rear tyre. | `powertrain.ts` |
| LN1 / LN2 | Thin-tyre assumption stated in the leaning lesson; μ values labelled as typical course figures; roundabout example states its 12 m radius. | `handling.ts` |
| WT2 (model side) | Braking-model comment now calls the 0.15 s load lag a model choice. | `braking.ts` |

Model-limits list updated (wheel inertia now modelled; instant stall removed).

### Simulators on the new architecture
- Cause-and-effect strip (input → mechanism → power transfer → response) added to Clutch & Throttle, Gear Shifting and Riding & Stopping, from `powertrainChain`; pointing at a stage highlights the matching parts on the motorcycle drawing (`sideViewParts` maps powertrain parts to side-view parts; `BrakingView` takes `highlighted`).
- Starting simulator stays on its scripted timeline (the right engine for a fixed procedure); it already has the model-limits panel.

### Tests
- Regression: P5 32, P6 44, P7 47, P8 48, P9 54, P10 17, P11 49, P12 27, s2p2 23, s2p3 31, new s2p4 16 (strip on 3 simulators, highlight on/off, 375 px, corrected U-turn text), P13 14 — all pass. Lint 0, build clean.
- Real problems found and fixed during testing: the slow-balance text printed the unrounded lock angle ("35.083…°"); the U-turn speed slider stopped at 15 km/h, so with the corrected circle it could no longer show the turn widening past the footpeg limit (raised to 20 km/h).
- Test-side updates (old figures or test helpers, not site bugs): P9 U-turn 3.3 → 4.5 m, widening checked at 16 km/h, "35° lock (measured at the road)"; P11 engine braking 0.96/0.34 → 0.92/0.33 m/s² (verified against the model and the coasting formula); P8 readout helper scoped to skip the new strip (duplicate "Gear"/"Speed" labels), and the slow-race rider now releases the clutch by feel (holds the lever when the engine bogs) — the extra inertial mass made a fixed-rate release on 10 % throttle stall, as it would on a real motorcycle.
- Unit: 44/44 (new `phase4.test.ts`: rake and road lock, lock radius within the manual range, front wheel outside rear, lean at 8/15/16 km/h, sliding grip = tyre curve, coast-down with wheel inertia, rear-lock stall time and cause).

## Stage 2 · Phase 5 — Lesson structure and educational content · IN PROGRESS

### Part A — Phase 1 content corrections · done
49 text corrections plus one added key point, across `basics.ts`, `handling.ts`, `mechanics.ts`, `preRide.ts`, `anatomy.ts`, `rideStop.ts`, `gears.ts`, `emergency.ts`, `roads.ts` and `components/motorcycle/parts.ts`:
- WT1 "weight moves/shifts/is thrown forward" → load transfer (≈ 20 places), with the mechanism (braking force at the road, below the centre of mass) explained in the brakes and weight-transfer lessons; heading "Weight moves forward" → "Load transfers to the front".
- WT2 progressive braking explained as load building while the fork compresses (not "the suspension must pitch first"); TY2 grip "roughly" proportional to load.
- TH1 throttle snapped shut mid-corner now tightens the line (matches the handling lesson).
- CD1 gyroscope claim replaced by steering-geometry self-stability; TY1 contact patch "credit card, ~50 cm²" everywhere.
- CS1 countersteering happens at every speed; small at walking pace.
- BR1 front-brake share depends on deceleration (two-thirds → 80 %+); BR2 ease the rear as load comes off; BR3 brake fluid transmits pressure.
- EB1 fuel cut-off "many" engines; EB2 "in the lower gears" + downshift hop warning; SU1 two jobs of suspension, rider sag 25–33 %; EN1 thermodynamic assumptions labelled; GB1 "almost all road motorcycles", unclear sprocket sentence replaced; SS1 front brake guidance; CH1 sprocket distance; AB1 ABS on loose surfaces; rev limiter "fuel or spark"; "braking distance" ∝ v²; hill-start scenario wording; corner-braking quiz notes front wash-out.

### Part B — Lesson structure · proposal
[docs/architecture/phase-5-lesson-structure.md](docs/architecture/phase-5-lesson-structure.md): optional, backward-compatible format (six `section` blocks, `components`, `physics` with level-dependent maths, `misconceptions`, lesson `level` / `topics` / `prerequisites` / `related`, question `topic`); four batches (Basics → Handling → Mechanics → Pre-ride), stopping after Basics for review.

---

# Stage 3 — Rider Cockpit simulator

Started 2026-11-05 from the user's cockpit brief. Same rules: one phase at a time, test, update this file, report, wait for approval. Built on the existing shared simulation (`useSimulation` + powertrain model) — no second simulator. Stage 2 is paused at Phase 5 Part B.

| # | Phase | Status |
|---|-------|--------|
| 1 | Inspect the existing simulation; design and build the cockpit layout | COMPLETED |
| 2 | The four interactive controls | COMPLETED |
| 3 | First-person road view | COMPLETED |
| 4 | Connect the controls to the central simulation state | COMPLETED |
| 5 | "Inside the Machine" mechanical view | COMPLETED |
| 6 | "Road Response" view | COMPLETED |
| 7 | Synchronise all three perspectives (+ view modes) | COMPLETED |
| 8 | Starting and moving-off scenario | COMPLETED |
| 9 | Integrate into the lessons | COMPLETED |
| 10 | Additional real-world scenarios | COMPLETED |
| 11 | Responsiveness, animation, performance, accessibility polish | COMPLETED |

## Stage 3 · Phase 1 — Inspection and cockpit layout · COMPLETED

Design and inspection: [docs/architecture/cockpit-phase-1.md](docs/architecture/cockpit-phase-1.md) (reuse map, brief state ↔ model mapping, layout, Phase 2 interaction and keyboard plan).

### Built
| File | What |
|---|---|
| `components/cockpit/HandControls.tsx` | `ClutchControl` (left grip, perch, cable, lever pivoting back to the grip), `ThrottleBrakeControl` (twist grip with index mark, master cylinder and reservoir, front brake lever) |
| `components/cockpit/FootControls.tsx` | `GearSelector` (peg, pivot, gear lever toe piece), `GearLadder` (configurable pattern, default 1-N-2-3-4-5), `RearBrakeControl` (peg, pedal that dips, pressure bar) |
| `components/cockpit/RoadAhead.tsx` | First-person perspective road (pinhole projection): horizon, hills, road edges, centre dashes, roadside posts — stationary |
| `components/cockpit/MotorcycleDashboard.tsx` | Compact cluster: 20-segment RPM bar with red zone, km/h, gear, engine status, clutch/throttle/front/rear % |
| `components/cockpit/RiderCockpit.tsx` | Layout: 16:9 frame with corner zones and bottom-centre cluster on ≥ 768 px; road → cluster → 2 × 2 grid on phones |
| `pages/RiderCockpitPage.tsx`, route `simulators/cockpit` | Preview notice, the cockpit at rest (engine off, neutral), "which hand or foot does what" table. Not linked from navigation yet. |

### Tests
- New `ck1test` 20/20: tab title, preview notice, each control in its corner, centre of the road clear, no overlaps, cluster bottom-centre and showing the at-rest state, gear indicator, text alternatives, hand/foot table, no overflow at 820/375 px, phone order and left/right arrangement, phone labels ≥ 12 px, no console problems, not listed on the hub.
- Regression: unit 44/44; P0 60, P5 32, P6 44, s2p3 31, P13 14 — all pass. Lint 0 (copied test scripts excluded), build clean.
- Found by screenshots and fixed: levers drawn pointing across the grips (rotation sign); labels drawn inside the SVGs became ~7 px on phones and collided with the levers — moved to HTML.

### Test-suite loss (important)
macOS cleared files in the session's temporary scratchpad between 2026-11-02 and 2026-11-05. Lost: the Stage 1 Phase 3 (basics, 28 checks) and Phase 4 (pre-ride, 49 checks) browser suites, most screenshot and measurement scripts, and part of the puppeteer install. The surviving 41 scripts were copied to `tests/e2e/` in the project (not committed; excluded from lint). puppeteer-core 25.16.0 was reinstalled in the scratchpad to keep running them. Recommendation: make `tests/e2e/` the permanent home with its own dependencies, and rewrite the two lost suites.

## Stage 3 · Phase 2 — The four interactive controls · COMPLETED

The controls work on their own; the motorcycle does not respond yet (Phase 4 connects them to the simulation).

### Built
| File | What |
|---|---|
| `components/cockpit/LeverHit.tsx` | Grab area for a continuous control: pointer drag (mouse, touch, pen; pointer capture; follows the drawing at any size), and an ARIA slider (arrows ±5 %, Page ±25 %, Home/End, value text, visible focus outline) |
| `hooks/useCockpitControls.ts` | The rider's inputs: clutch, throttle, front and rear brake (0–1), gear, pattern; optional spring-back (120 ms return when a drag or held key is let go); held keyboard shortcuts at fixed rates (A/Z clutch, ↑/↓ throttle, Space front brake, S rear brake, E/D/N gears); lets everything go if focus leaves the cockpit |
| `lib/mechanics/gearbox.ts` | `GearPattern`, `STANDARD_PATTERN` (1-N-2-3-4-5), `REVERSED_PATTERN` (race), `shiftInPattern` (full shifts skip neutral, half shifts find it) |
| Controls | Clutch (one grab area), right hand (front brake lever and twist grip as separate grab areas), rear pedal; gear lever: tap above / below the toe piece, plus Lift / Press / Neutral buttons, a brief CSS nudge of the toe piece on each shift (off with reduced motion), and a live note after each shift |
| `pages/RiderCockpitPage.tsx` | Live controls, settings (spring-back switch, gear pattern), keyboard guide, reset |

Design decision: on a real motorcycle every control springs back, but a mouse can hold only one control at a time — so controls stay where they are left by default, and "Levers spring back when released" gives the realistic behaviour (best with the keyboard or multi-touch).

### Tests
- Unit 47/47 (new `gearPattern.test.ts`: the standard pattern matches the existing lever logic for every gear and action; neutral skipping; reversed pattern).
- New `ck2test` 34/34: mouse drags of all four controls, friction-zone flag, throttle and front brake independent, cluster shows live values, lever drawing moves, controls stay put / spring back, held keys for every control, no page scrolling from Space/arrows, gear shifts in both patterns including the top-of-travel message, keyboard slider (Home/End/↑, value text, focus outline), touch drag on a phone, grab areas ≥ 24 px on 390 and 360 px phones (clutch and rear brake ≥ 44 px), no overflow, no console problems.
- `ck1test` 20/20 (layout), P0 60, P7 47, P8 48, P13 14 (site-wide crawl, axe) pass; lint 0; build clean.
- Found and fixed: the twist-grip grab area was 22 px on a 360 px phone — the hand drawings were cropped to the controls so they draw larger (now 27 px; front brake 36 px). Known limit: these two share one corner and stay below the 44 px guideline on phones (they meet WCAG's 24 px minimum); revisit in Phase 11.

## Stage 3 · Phase 3 — First-person road view · COMPLETED

The road moves; for now it is driven by a clearly labelled "Test drive (temporary)" panel (speed, bend, car ahead, engine idling, play/pause/slow-motion/reset). Phase 4 drives it from the motorcycle's own speed.

### Built
| File | What |
|---|---|
| `components/cockpit/roadGeometry.ts` | Pinhole camera at the rider's eye (1.2 m), left-hand traffic (rider mid-left-lane, centre line right), exact circular-arc bends (`roadPoint`, `projectRoad`), drawing limit at 1.4 rad round a bend, repeating features, deterministic scenery hash |
| `components/cockpit/RoadAhead.tsx` | Animated scene: road outline, edge lines and centre dashes streaming at road speed; roadside posts, trees and occasional signs (fixed per position, so no flicker), drawn far-to-near; hills that slide as the heading turns; view rolls by half the lean (riders keep their heads more upright); optional car ahead (rear view, tail lights) closing or opening at the speed difference; slight vibration when idling at a standstill (off with reduced motion). Re-renders only itself, each clock frame. |
| `hooks/useRoadMotion.ts` | Integrates distance (speed), heading (speed × curvature) and car gap (speed difference) on the shared simulation clock, so pause and slow motion apply |
| `RiderCockpit` / page | `road` prop; test-drive panel; lean from the cornering model (tan λ = v²/gR) |

### Tests
- Unit 54/54 (new `roadGeometry.test.ts`: near point on the bottom edge, left-lane geometry, convergence, bend direction, exact arc vs small-angle, quarter-circle check, visibility limit, streaming features).
- New `ck3test` 22/22: still at 0 km/h; measured 16.7 m/s at 60 km/h; rate halves at half speed; pause; 0.25× slow motion; lean 14° at 40 km/h on R 50 m; heading and hills turn; view rolls ±7.06° (half lean) for right/left; markings curve the right way; slower car grows, faster car shrinks; idle vibration only when idling at a standstill, road still; 61 fps moving (headless); reduced motion removes vibration but keeps the road moving (essential motion); no overflow; no console problems.
- `ck1test` 20/20, `ck2test` 34/34, P0 60, P8 48 pass; lint 0; build clean.
- Found and fixed: the small-angle bend formula threw the far road hundreds of metres sideways in tight bends (a hook in the sky) — replaced by exact arc geometry with a visibility limit. The remaining inside-edge sweep in a right bend is the real tangent-point perspective, verified numerically.

## Stage 3 · Phase 4 — Controls connected to the central simulation · COMPLETED

The cockpit now runs on the same powertrain simulation (`usePowertrainSim` → `useSimulation` + `powertrainModel`) as the other simulators. One state drives the road, the instruments and the explanation.

### Built
| File | What |
|---|---|
| `hooks/useCockpitSim.ts` | Controls → simulation inputs (clutch, throttle, front, rear, gear); engine starts switched off; Start (needs neutral or clutch in — `canRestart`) and Engine stop; gear changes refused while running with the clutch out (same rule as the other simulators); road distance taken from the simulation's own distance each step; reset (engine off, neutral, controls at rest, road at the start) |
| `hooks/useCockpitControls.ts` | `canShift` veto with a message |
| `RiderCockpit` | `engine` prop: Start / Engine stop on the right switch block (top-right zone) |
| `pages/RiderCockpitPage.tsx` | Test-drive panel removed; cluster shows real RPM, speed and engine status; idle vibration while running at a standstill; play/pause/slow-motion/reset for the whole simulation; "What is happening" from the powertrain model; model-limits panel; keyboard I = start |

Road is straight for now: the cockpit has no steering input yet (bends return with scenarios).

### Tests
- New `ck4test` 19/19, riding through the keyboard: engine off at first; Start refused in gear with the clutch out; idles at 1,400 RPM; gear change refused without the clutch; pull away in first without stalling; ≈ 267 RPM per km/h in first and ≈ 167 in second; road moves at the motorcycle's speed; engine braking; brakes stop it; stopping in gear with the clutch out stalls; pause; reset; model limits; no console problems.
- `ck1test` 20/20, `ck2test` 34/34 (reset button renamed); `ck3test` retired (it drove the road through the removed test-drive panel; bends and traffic rendering stay covered by `roadGeometry.test.ts` until scenarios use them).
- Unit 54/54; P0 60, P6 44, P7 47, P8 48; lint 0; build clean.

## Stage 3 · Phase 5 — "Inside the Machine" · COMPLETED

A panel below the cockpit, driven by the cockpit's own simulation snapshot and rotation MotionValues (the same state as the controls, road and instruments).

### Built
| File | What |
|---|---|
| `lib/simulation/powerFlow.ts` | The power path ENGINE → CLUTCH → GEARBOX → FRONT SPROCKET → CHAIN → REAR SPROCKET → REAR WHEEL: speed, torque and power per stage (chain: speed and pull), link states driving / engine braking / slipping / none with the reason (engine stopped, neutral, clutch pulled in, rear wheel locked), slip heat |
| `lib/mechanics/gearbox.ts` | Sprockets (15/45 teeth, 520 chain), pitch radius, average chain speed |
| `components/cockpit/machine/PowerFlowStrip.tsx` | The strip: stages with live rpm, torque or pull, kW; arrows forward (driving), backward (engine braking), faded (slipping), crossed with reason (no drive); state in words and icons, not colour alone; row on wide screens, column on phones |
| `components/cockpit/machine/BrakeVisualizer.tsx` | Front and rear discs turning with their wheels, caliper pads closing with the input, force vs tyre grip bar, free / braking / ABS / LOCKED (a locked disc stops while the motorcycle slides) |
| `components/cockpit/machine/InsideTheMachine.tsx` | Strip + engine (four-stroke animation on the crank angle, stroke, RPM, torque, power), clutch (the explorer's cross-section), gearbox (gear pairs, ratio, overall, RPM per km/h), chain/sprockets/rear wheel (drivetrain panel, sprocket RPM, chain speed, wheel RPM, road speed), brakes |

Reuse: `FourStrokeEngine`, `ClutchMechanismView`, `GearboxView`, `DrivetrainPanel`, `Readout`, `SimCard`.

### Tests
- Unit 65/65 (new `powerFlow.test.ts` 8: all links drive when locked; ratios divide speed and multiply torque, wheel power ≈ 90 % of gearbox power; neutral; clutch pulled in; engine braking reverses; slipping with heat; engine stopped; chain pull = torque ÷ pitch radius. New `sprockets.test.ts` 3.)
- New `ck5test` 16/16: engine off; neutral idle; cluster RPM = engine-stage RPM; clutch in stops the flow, plates drawn apart; slipping and its heat while pulling away; all links driving; stage speeds in ratios 3.35 / 3.00 / 3.00; chain speed and pull; engine braking reverses; front caliper braking; rear wheel locks from 17 km/h (616 of 879 N = sliding grip) and its disc stops while still moving; no overflow; no console problems.
- `ck1test` 20, `ck2test` 34, `ck4test` 19, P0 60 pass; lint 0; build clean.
- Found and fixed by tests: chain speed was computed as ω × pitch radius, which differs slightly between sprockets — now teeth/s × pitch (the true average); the chain stage showed a torque, but a chain carries a pull — now shows tension.

## Stage 3 · Phase 6 — "Road Response" · COMPLETED

A panel below "Inside the Machine", driven by the same simulation snapshot.

### Built
| File | What |
|---|---|
| `lib/simulation/roadResponse.ts` | `suspension()`: fork (14 kN/m, 110 mm — the speed-breaker scenario's fork) and rear (20 kN/m, 90 mm, representative) positions from the load transfer, 30 % sag at rest, bottoming; `situation()`: the brief's A–E (front brake only, rear brake only, clutch in while moving, throttle in first, downshift with engine braking) plus both brakes, accelerating, engine braking, holding speed, standing still, stalled — each explained with live numbers |
| `components/cockpit/road/RoadResponseView.tsx` | Situation box (live region); side view of motorcycle and rider (reused `BrakingView`: pitch, load arrows, brake-force arrows, wheels turning or locked, road moving); readouts (speed, acceleration/slowing in g, load split, driven by, each wheel's RPM or "locked", each brake's force, lean); suspension gauges with the rest mark |
| `hooks/useCockpitSim.ts` | Time of the last downshift on the simulation clock (a MotionValue, readable in render) |
| Page | Model-limits additions: suspension rates/travel without damping; straight road, upright (no steering yet) |

### Tests
- Unit 75/75 (new `roadResponse.test.ts` 10: rest at sag; dive = extra front load ÷ fork rate; squat under acceleration; bottoming capped at travel; situations A–E and standing still).
- New `ck6test` 14/14 riding through the keyboard: rest position; D (load to the rear, rear compresses, fork extends, driven by engine); road view and instruments agree on speed; C (momentum); A squeezed progressively (load forward, fork compresses 25 mm, no lock, cause explained); B (0.17 g, rear unloads); E (downshift note, then engine braking); a grabbed front brake locks and the consequence is explained; phone: no overflow, no clipped readout; no console problems.
- `ck1` 20, `ck2` 34, `ck4` 19, `ck5` 16, P8 48 pass; lint 0; build clean.
- Found by screenshot and fixed: the combined brakes readout was cut off on phones — split into front and rear.

## Stage 3 · Phase 7 — Three perspectives synchronised, view modes · COMPLETED

One simulation, four layouts; switching only rearranges the same pieces, so the ride carries on.

### Built
| File | What |
|---|---|
| `components/cockpit/ModeSwitcher.tsx` | Rider / Machine / Road / Split view buttons (`aria-pressed`, icons + words); last mode remembered in `localStorage` (try/catch; per-viewer convenience) |
| Page layout | Rider: cockpit large + machine summary + road preview. Machine: "Inside the Machine" large, cockpit + road preview in a side column. Road: "Road Response" large, cockpit + machine summary alongside. Split: cockpit and road preview side by side, machine summary below. Cause-and-effect strip and explanation in every mode. |
| `RiderCockpit` | Container queries (`@container`, `@2xl:`) instead of viewport breakpoints, so the cockpit switches to its stacked arrangement in a narrow column and stays fully operable; `highlight` lights control zones |
| `PowerFlowStrip` | Container query (`@3xl:`) for row/column; `highlight` lights stages |
| `machine/MachineSummary.tsx`, `road/RoadPreview.tsx` | Compact perspectives with "Open full view" |
| `components/cockpit/crossView.ts` | One cause-and-effect highlight → cockpit zones, machine cards, power-flow stages and side-view parts |
| `InsideTheMachine`, `RoadResponseView` | Card / stage / side-view highlighting |
| `lib/simulation/cockpitHints.ts` | Contextual next-step hints (start, first gear, throttle and clutch, keep easing out, change up when revving hard, change down when labouring, clutch in to stop, locked wheels) |
| Status line priority | Warning → the gear lever's message if it was the rider's latest action (`shiftIsLatest`, cleared by any other control or Start/Stop) → next hint |

### Tests
- Unit 84/84 (new `crossView.test.ts` 4, `cockpitHints.test.ts` 5).
- New `ck7test` 22/22: starts in rider view; hint sequence (Start → first gear → shift message → throttle and clutch → change up at 6,700 RPM); rider layout; switching to machine/road/split keeps the ride going (distance, engine, gear); each mode shows its primary and compact panels; the cockpit uses its compact layout in the side column and still works from the keyboard; "Mechanism" lights the clutch in cockpit, machine card, power-flow stage and side view at once, and clears; mode remembered after reload; no overflow on phones in every mode; no console problems.
- `ck5`/`ck6` now open Machine/Road view first (their full views live there). `ck1` 20, `ck2` 34, `ck4` 19, `ck5` 16, `ck6` 14; P0 60, P6 44, P8 48; lint 0; build clean.
- Found and fixed: the last gear-change message stayed in the status line for ever and hid every later hint — now it stays only until the rider's next action.

## Stage 3 · Phase 8 — "Starting and moving off" scenario · COMPLETED

Guided mode alongside free exploration, on the same simulation, in every view mode.

### Built
| File | What |
|---|---|
| `content/scenarios/cockpit/startAndMoveOff.ts` | The scenario in the brief's eight parts (situation, objective, ordered rider actions, mechanical response, road response, why, common mistakes, safety) and 8 guided steps: find neutral (parked in first, engine off) → start → clutch in → first → a little throttle → biting point → ride away (clutch out, 10 km/h) → second gear; each with highlighted parts and a "why it happened" explanation |
| `lib/simulation/ridingMistakes.ts` | Mistakes from one step to the next: stall; jolt (rate of change of acceleration > 30 m/s³ while accelerating — not acceleration size); revving above 6,000 RPM with the clutch slipping (not heat — a careful start makes as much heat); over-rev in gear. Start-in-gear and shift-without-clutch come from the cockpit's own refusals. |
| `hooks/useRidingMistakes.ts` | Watches every simulation step; the same mistake repeats only after 3 simulated seconds |
| `components/cockpit/scenario/ScenarioCard.tsx` | The briefing: situation and objective shown, parts C–H expandable |
| `GuidedSteps` | Slot for feedback under the instruction |
| `useCockpitControls` / `useCockpitSim` | `reset(parkedGear)` so a scenario sets up the controls and the simulation together |
| Page | "Explore freely" / "Guided: Starting and moving off"; guided panel + scenario card; the step's parts highlighted across all views; mistakes explained constructively (the step stays open); completion message; in guided mode the line under the cockpit carries the current step, the mistake or "done — press Next step" |

### Tests
- Unit 91/91 (new `ridingMistakes.test.ts` 5: stall, dumped clutch, revving while slipping, over-rev, quiet for a smooth pull-away; `startAndMoveOff.test.ts` 2: every part of the brief present; a careful scripted rider completes all 8 steps with no mistakes).
- New `ck8test` 25/25: starts at step 1 parked in first with the engine off; card shows situation, objective and C–H; step highlights the gear lever; current step under the cockpit; a careful learner completes all 8 steps by keyboard, completion shown, no mistake messages; starting in gear, shifting without the clutch and dumping the clutch are each explained constructively and the step stays open; the guide stays in the machine view; exit returns to exploration; no overflow on a phone; no console problems.
- All cockpit suites pass: ck1 20, ck2 34, ck4 19, ck5 16, ck6 14, ck7 22; P0 60; lint 0; build clean.
- Found by tests and fixed: (1) the slip-heat threshold flagged careful pull-aways — heat can't separate abuse from normal riding, so the rule now uses engine speed while slipping; (2) the "jerky start" rule flagged a brisk but smooth pull-away — it now measures the rate of change of acceleration; (3) the Reset button passed its click event as the parked gear — now called without arguments.
- The scratchpad was cleared again (22 scripts, including the P0 suite); all were restored from `tests/e2e/`.

## Stage 3 · Phase 9 — Integration into the lessons · COMPLETED

### Built
| File | What |
|---|---|
| `content/scenarios/cockpit/types.ts`, `index.ts` | `CockpitScenario` with `setup` (gear, engine running, rolling speed, throttle) and `view`; the list of four |
| `content/scenarios/cockpit/drills.ts` | Clutch drill (machine view; 4 steps: in → first → biting point → grip), gears drill (machine view, rolling in first; up to 2nd, 3rd, down to 2nd with engine braking), brakes drill (road view, 40 km/h in 3rd; front progressively ≥ 0.3 g without locking, rear alone, both to a stop with the clutch in) — each in the brief's eight parts |
| `lib/simulation/ridingMistakes.ts` | Front and rear wheel locking added |
| `hooks/useGuidedMode.ts` | `start(steps)` switches sequence at once (no frame checked against the old steps); `startActive` |
| `hooks/useCockpitControls.ts`, `useCockpitSim.ts` | Initial gear and throttle; `useCockpitSim(initialSetup)`; `reset(setup)` for engine off / idling / rolling in gear |
| Lessons (10) | "Practise it in the cockpit" after the first illustration (theory → visual → practice → example → knowledge check): basics clutch, gears, brakes, throttle, controls; mechanics clutch plates, gear ratios, transmission, weight transfer, engine braking — `?practice=<drill>&from=<lesson>` |
| `pages/RiderCockpitPage.tsx` | Explore + four guided buttons; a linked drill is set up from the first render (no effect); "Back to the lesson"; each completed run recorded once (`source: 'cockpit'`); intro instead of the preview notice |
| Progress | `SIMULATORS` includes the Rider cockpit (4 items; the points total rises by 60) |
| Simulators page | Rider Cockpit card |
| Fix | Clutch explorer's "Start guided mode" passed the click event to `guide.start` — now called without it |

### Tests
- Unit 96/96 (new `drills.test.ts` 4: every scenario has all eight parts; a scripted rider completes the clutch, gears and brakes drills with no mistakes or locked wheels; `ridingMistakes` locked-wheel test).
- New `ck9test` 22/22: all 10 lesson links present, after the illustration and before the knowledge check, with the right drill; clutch lesson → clutch drill in the machine view, idling in neutral, plates drawn apart, back to the lesson; gears drill (rolling in first) completed by keyboard; brakes drill (39 km/h in third, road view) completed without a lock, saved, listed on the Progress page; Explore + 4 scenario buttons each start in their view; listed on the Simulators page; no console problems.
- Regression: ck1 20, ck2 34 (passes alone; one spring-back timing failure under load in the batch run), ck4 19, ck5 16, ck6 14, ck7 22, ck8 25, P0 60, P5 32, P11 49, P12 27 — all pass. Lint 0; build clean.
- Test-side updates for intended changes: ck1 now expects the cockpit on the Simulators page; P12 exercises 19 → 23 (the four cockpit scenarios); ck8 scenario button renamed.
- Accessibility: the site-wide P13 crawl (axe, WCAG 2.1 AA) now reaches the cockpit and found **nested-interactive ×3** — the control drawings holding sliders were `role="img"`, which hides their sliders from assistive technology. Fixed: interactive drawings are labelled groups (`role="group"`), static ones stay images. A rerun of the full crawl timed out under heavy machine load (load average 10.6); a targeted axe audit of every page this phase touched (`ck9axe`: cockpit in all four modes and in a guided drill, Simulators, Progress, the 10 linked lessons) passes 17/17 with no serious or critical violations. The earlier full crawl passed every other page.
- The scratchpad's axe-core install had been deleted; reinstalled (4.10.2).

## Stage 3 · Phase 10 — Additional real-world scenarios · COMPLETED

Already covered: brief scenarios 1–3 (Starting and moving off), 4 and 5 (gears drill: up 1→2, down 3→2). Remaining ten, in three batches by what they need:

| Batch | Scenarios | New pieces |
|---|---|---|
| A — road conditions | 8 Riding uphill · 9 Riding downhill · 12 Wet road · 15 Gravel · 11 Emergency braking | Road visibly climbing/descending (gradient is already in the physics); wet and gravel surface looks (grip is already in the physics); a stopped car as the emergency hazard (car-ahead drawing exists) |
| B — traffic and hazards | 6 Stopping at a traffic signal · 7 Moving again in traffic · 14 Slow traffic · 10 Speed breaker | Traffic signal with timed phases and a stop line; a car ahead that stops and moves off; the speed-breaker bump on the road and in the suspension (model exists) |
| C — manoeuvre | 13 U-turn | Steering (the cockpit has none): recommended — a "full lock left/right" control, because a walking-pace U-turn is held at full lock while speed is controlled with clutch, throttle and rear brake; free continuous steering at speed would be a larger addition |

Each scenario uses the eight-part format, guided steps, mistake explanations, view selection and progress recording; each batch is tested before the next.

### Batch A — road conditions · DONE

Five scenarios in `content/scenarios/cockpit/roadConditions.ts`. Each has the eight-part briefing, guided steps checked on the shared simulation, explained mistakes, its own view, and progress recording.

| Scenario | Set-up · view | Steps | Mistakes explained |
|---|---|---|---|
| Hill start | 12 % uphill, idling in neutral, rear brake held · split | First gear with the brake on → biting point (drive ≥ 60 % of gravity's 265 N pull) → brake off, ride away | roll-back, stall, lurch, slip-heat, start-in-gear |
| Riding downhill | 10 % downhill, 30 km/h in third · split | Speed creeps up with the throttle closed → both brakes to below 25 km/h → second gear holds the speed | locks, over-rev, stall, shift-without-clutch |
| Braking on a wet road | grip 0.5, 40 km/h in third · road | Roll off → progressive braking at 0.25 g, no lock → clutch in, stop | front-lock, rear-lock, stall |
| Slowing on gravel | grip 0.35, 25 km/h in second · road | Roll off → rear brake alone to below 15 km/h → stop with a gentle front brake | front-lock, rear-lock, stall |
| Emergency braking | car stopped 40 m ahead, 50 km/h in third, waits paused · rider | Brake at 0.6 g or more, no lock → stop before the car | collision, locks, stall |

Physics notes:
- Second gear's engine braking (about 166 N at 25 km/h) holds a 10 % descent. Third's does not, so the scenario starts in third.
- Gravity's pull on a 12 % hill is 265 N; the rear brake can give up to 0.6 g, so 40 % pedal holds it.

| Area | Change |
|---|---|
| `lib/simulation/cockpitWorld.ts` (new) | A pure world stepped with the motorcycle: car ahead (gap, speed over time), signal (colour from time, position and memory), speed breaker. Also `SURFACE_GRIP` (dry 0.9, wet 0.5, gravel 0.35). 3 tests. |
| Scenario types | `CockpitStep.done` also receives the world. `CockpitScenario.world` and `watch` (scenario-specific mistakes). The setup gains `rear`, `grade`, `surface` and `paused`. `withWorld()` adapts steps for the guided runner. |
| `ridingMistakes` | New ids for scenarios: roll-back (detected), collision, ran-red, tailgating, bump-fast, bump-braking, stopped-in-traffic, kerb, too-fast-turn. |
| `useCockpitSim` | Sets up gradient, surface and brake held. Steps the world on every model step (car-gap MotionValue, signal state, `getWorld`). `reset(setup, world)`. A `paused` set-up holds the clock until a control moves or Start is pressed. |
| `useRidingMistakes` | Also runs the current scenario's `watch` with the world. |
| `RoadAhead` | The level horizon shifts by FOCAL·grade. Wet sheen and gravel stones. Stop line, signal head and speed-breaker band (ready for batch B). A badge names the slope and surface, which can't be seen from the saddle. |
| Road Response, Road Preview | The side view tilts with the gradient; a new "Road" readout shows the slope and surface. |
| Page | Scenario steps and mistakes see the world. Reset keeps the scenario's road. Explore returns to a level, dry, empty road. Status line: "Paused — the scenario starts when you touch a control". |

Tests:
- Unit: 105/105. New `roadConditions.test.ts` (6): scripted riders complete all five without mistakes. Releasing the brake in neutral rolls back. A front-brake grab locks on wet (0.7) and gravel (0.45). Not braking reaches the car.
- New `ck10test`: 32/32, covering:
  - the five buttons; hill start completed by keyboard;
  - roll-back explained; Explore resets the road;
  - descent completed; wet completed, plus the grab-lock explained;
  - gravel surface drawn; the emergency waits paused, is completed, and a collision is explained;
  - no console problems.
- Tests changed in the process:
  - Earlier `drills.test.ts` and `startAndMoveOff.test.ts` now step the world.
  - Test-side finding, not an app bug: a mistake message is hidden once the current step is complete (intended), so a lock that follows a completed step isn't shown. The wet grab is tested before the step completes.

- Regression: ck1 20, ck2 34, ck4 19 (three timing failures in the batch run under load; 19/19 alone), ck5 16, ck6 14, ck7 22, ck8 25, ck9 22, ck9axe 17, P0 60, P5 32, P11 49, P12 27 — all pass. Test-side updates for intended changes: ck9 expects 10 scenario buttons; P12 exercises 23 → 28. Types and lint clean.

### Batch B — traffic and hazards · DONE

Four scenarios in `content/scenarios/cockpit/traffic.ts`, sharing one traffic watch. It flags reaching the car, closing to under one second (never under 2 m) and crossing the stop line on red.

| Scenario | Set-up · view | Steps | Mistakes explained |
|---|---|---|---|
| Stopping at a traffic signal | 40 km/h in third; signal 80 m ahead turns amber at 45 m, red 3 s later · rider | Brake on amber → clutch in, change down, stop within 10 m of the line → neutral (half-lift from first) | ran-red, stall, locks |
| Moving again in traffic | Queued at red, idling in neutral, car 6 m ahead; waits paused; green 5 s after the first touch, the car leaves 1.2 s later · rider | First gear, clutch in → move off after the car → second gear with a two-second gap | ran-red, collision, tailgating, stall, lurch |
| Riding in slow traffic | First gear at 8 km/h behind a car that creeps 5 s and stops 3 s; waits paused · split | Creep in the friction zone → stop behind the car (1.5–8 m) → follow again | stall, collision, tailgating, lurch, slip-heat |
| Crossing a speed breaker | 35 km/h in third; breaker 2 m × 8 cm at 60 m; waits paused · split | Below 15 km/h in second before it → over it off the brakes → away above 20 km/h | bump-fast (> 20 km/h), bump-braking (front brake on it), stall, lock, shift-without-clutch |

The speed breaker is judged with the existing quarter-car model (`bumpRide`):
- At 15 km/h the jolt is 0.76 g; at 20 km/h it is 1.0 g; at 30 km/h the front tyre leaves the road.
- Braking pre-compresses the fork by its dive, so less travel is left for the bump.

| Area | Change |
|---|---|
| `useCockpitSim` | Records each speed-breaker crossing from the entry speed and the current fork dive (jolt, fork travel used and how much braking took, airborne), via `crossing`. |
| Road Response, Road Preview | Show the last crossing, in red at 1 g or more or when airborne. |
| `RoadAhead` | The signal head stands 4 m beyond its stop line, so it stays visible while waiting. The car is drawn right up close (from 1.4 m). The view rises and falls over the breaker (none with reduced motion). New `data-car-gap` attribute. |
| `scriptedRider.ts` | The scripted rider moved here from the tests (shared by both scenario test files), with an optional trace. |

Tests:
- Unit: 112/112. New `traffic.test.ts` (7):
  - scripted riders complete all four without mistakes;
  - riding on is flagged as running the red;
  - setting off before the car moves reaches it;
  - a fast arrival is flagged `bump-fast`; braking on the breaker is flagged `bump-braking`.
- New `ck11test`: 29/29, covering:
  - the four buttons;
  - the signal turns amber on approach; stopped 1.7 m before the line by keyboard, then neutral; riding on is flagged red;
  - the queue waits paused; green, the car leaves, moved off and second gear with a gap; going early is flagged;
  - slow traffic: creep, stop and follow again;
  - speed breaker: slowed, gentle crossing reported, ridden away; a fast arrival is flagged and "front tyre off the road" reported;
  - no console problems.
- Findings from the browser test:
  - The signal head went out of view when waiting at the line; it is now drawn beyond the line.
  - The signal scenario now asks for changing down while slowing, because neutral can only be found from first or second (the gearbox correctly refused it from third).

- Regression after batch B: ck1 20, ck2 34, ck4 19, ck5 16, ck6 14, ck7 22, ck8 25, ck9 22, ck9axe 17, ck10 32, P0 60, P5 32, P11 49, P12 27 — all pass. P0 timed out three times under heavy machine load (load average 11–15) before passing 60/60 on a slower run. Test-side count updates: ck9 14 buttons, P12 exercises 28 → 32.

### Batch C — U-turn · DONE

`content/scenarios/cockpit/uTurn.ts`: the only scenario that steers. It starts pulled in at the left edge of a 7 m two-lane road (y = −2.8 m), idling in neutral, in the rider's view.

Steps:
1. First gear, clutch in.
2. Full lock right before moving (→ key or button).
3. Ride round at walking pace on the clutch until facing the other way (heading ≥ 166°).
4. Straighten and ride away in the other lane.

Mistakes explained: kerb, too-fast-turn (lean above 20° at full lock, about 11 km/h), lock-front-brake (front brake with the bar turned), stall, lurch.

| Area | Change |
|---|---|
| `cockpitWorld` | `WorldPose` (x, y, heading, steer, lean, trail). `stepWorld(…, ride)` integrates the position, turning at full lock on a 2.8 m radius (`LOCK_RADIUS`) with lean = atan(v² / g·R). Also `ROAD_HALF`, `KERB_MARGIN` and `edgeGap`. New test: a half circle at 2 m/s ends 5.6 m across, facing back, with the expected lean. |
| `useCockpitControls` | `steer` (−1, 0, 1) and `setSteer`. ← / → move it one position; a focused lever slider still takes its own arrows. Reset straightens it. |
| `useCockpitSim` | Feeds the handlebar and speed to the world on every step. Publishes a `pose` MotionValue on the road motion. |
| `RoadAhead` | When a pose is present, the road is drawn from that position and heading. The road, edges, centre dashes and roadside objects are placed on the road and clipped at the near limit before projection, so the view stays whole facing sideways or backwards. Hills follow the heading; the view rolls with the turn's lean. |
| `road/TopDownMap` (new) | The road from above: kerbs (red when close), centre line, the path ridden and the motorcycle's heading. Beside it, a three-button handlebar (Full lock left / Straight / Full lock right, `aria-pressed`) and the lean. Shown only in a steering scenario. |
| Page | Keyboard list: "← / → Handlebar". Explore leaves the U-turn road behind. |
| `ridingMistakes` | New id `lock-front-brake`. |

Tests:
- Unit: 115/115. New `uTurn.test.ts` (2): a scripted rider completes the U-turn inside the road. Too fast at lock, the front brake at lock and straightening early (kerb) are each flagged.
- New `ck12test`: 15/15, covering:
  - the button is offered; no handlebar or map elsewhere; keyboard list;
  - the U-turn completed by keyboard and the Straight button, with a lean of a few degrees, ending inside the road, and the path drawn;
  - too fast and the front brake at lock flagged;
  - Explore restores the straight road;
  - no console problems.
- Design fix found by the browser test: the turn step first completed at 150°, and straightening there runs diagonally into the far kerb. It now completes when facing the other way (166°), and its explanation says to straighten then.
- Regression after batch C:
  - ck1 20, ck2 34, ck4 19, ck5 16, ck6 14, ck7 22, ck8 25, ck9 22, ck9axe 17, ck10 32, ck11 29, ck12 15, P0 60, P5 32, P11 49, P12 27 — all pass.
  - ck2 hit one element-wait timeout in the batch run and passed 34/34 alone.
  - ck11's crossing check was too narrow (it expected 10–19 km/h; a careful rider crossed at 9 km/h, 0.48 g). It now accepts any crossing below 15 km/h under 1 g.
  - Test-side count updates: ck9 15 buttons, P12 exercises 32 → 33. Types, lint and build clean.

## Stage 3 · Phase 11 — Responsiveness, animation, performance, accessibility · COMPLETED

Correction: the cockpit has **14** scenarios (4 from Phase 9 + 10 from Phase 10). Earlier reports said 15, counting the "Explore freely" button.

### Inspection (before changes)

| Area | Found |
|---|---|
| Layout | No horizontal overflow at 375, 768 or 1440 px in any scenario. On a phone the cockpit started about 2,100 px down the page, below 15 wrapping scenario buttons, the guided steps and the briefing. In the road and machine views the full panel came first, putting the controls about 2,550 px down. |
| Touch targets (< 44 px) | Scenario buttons 40 px tall. Guided-step dots 32 px; Back, Skip and Exit 32 px. Phone: front brake 38 px, throttle 28 px. Tablet overlay: throttle 39 px. Desktop narrow column: throttle 34 px. Start/Engine stop and Lift/Press/Neutral 36 px. |
| Reduced motion | Idle vibration and the speed-breaker jolt already off. The global rule limits every CSS animation to one 0.01 ms run, so the two "pulse" rings don't animate. |
| Performance | Dev server at 4× CPU slowdown: 12–14 fps, but the profile is 60 % React development-mode overhead (`jsxDEV`, prop validation). The production build holds 59–60 fps with no long tasks, desktop and at 4× slowdown, in the rider, road and split views. No performance changes needed. |
| Accessibility | axe (WCAG 2.1 AA): no serious or critical issues in any new scenario, at desktop or phone width. |

### Changes

| Area | Change |
|---|---|
| Scenario list | Grouped: Basics (4), Road conditions (5), Traffic and hazards (4), Manoeuvres (1). Buttons 44 px tall. On a phone it folds behind one button showing the current scenario and "Scenarios (14)" (`aria-expanded`/`aria-controls`); choosing a scenario folds it again. `cockpitScenarioGroups` in the content index; a unit test checks every scenario is in exactly one group. |
| Cockpit, narrow (< 28 rem container) | The right-hand drawing (front brake and throttle) and the gear lever span the full width; clutch and rear brake share a row (dense grid). Phone: front brake 77 px, throttle 69 px. |
| Cockpit, overlay | Top corner tiles 32 % wide below a 64 rem container (29 % above). The throttle band starts at y = 88 instead of 93. |
| Buttons | Start/Engine stop, Lift/Press/Neutral 44 px. Guided steps: Back, Skip/Next and Exit 44 px; step dots 36 px with a 44 px touch area. |
| Road and machine views | The controls come first in the page, so they lead on narrow screens (and in keyboard order). On wide screens grid placement keeps them in the right-hand column, as before. |

### Tests
- Unit: 115/115 (the drills test now also checks the groups).
- New `ck13test`: 19/19, covering:
  - every control at least 44 px and no overflow, across all 14 scenarios at phone, tablet and desktop width;
  - the phone arrangement and slider heights;
  - the folding list (folded at first, shows the current scenario and the count, lists all 14, folds again after choosing);
  - the cockpit at 1,530 px instead of 2,549 px on a phone in the road view;
  - the four desktop groups;
  - reduced motion (no idle vibration, no jolt, no repeating animation);
  - axe on Explore and all 14 scenarios at desktop and phone width;
  - production frame rate at 60 fps, desktop and at 4× CPU slowdown;
  - no console problems.
- Regression:
  - ck1 20, ck2 34, ck4 19, ck5 16, ck6 14, ck7 22, ck8 25, ck9 22, ck9axe 17, ck10 32, ck11 29, ck12 15, ck13 19, P0 60, P5 32, P11 49, P12 27 — all pass.
  - In the batch run (under load) ck7 had 5 timing failures and ck13 lost its page context; both passed alone (22/22, 19/19).
  - ck1's phone check was updated for the intended new arrangement: right hand full width, then clutch and rear brake, then the gear lever.
  - Types, lint and build clean.


## Riding Situations (2026-11-06) — learn each control before the cockpit test · APPROVED; Batches A, B and C built

Request: the cockpit scenarios test what a learner knows. Before them, a lesson should teach what to do with each control in each situation.

Plan: a fifth Learn module, **Riding Situations**, with one lesson per cockpit scenario (14, plus a new "Stopping without stalling"). The order is learn → watch → try:

1. **The situation**, with a still of the road view.
2. **Control by control**: clutch, throttle, front brake, rear brake, gear and (U-turn) handlebar. For each: what to do, when, how much, and why (the mechanism).
3. **Step by step**: a control timeline showing every control's position through the manoeuvre. It is generated from the simulation by the tested scripted rider, not drawn by hand.
4. **Watch it done**: a cockpit demonstration where the scripted rider works the controls (levers visibly move), with a caption per step and pause / step / replay.
5. **Common mistakes**: what each feels like and what causes it.
6. **Knowledge check** (3 questions).
7. **Now try it**: opens the cockpit scenario (the test), then back to the lesson. Completion is recorded as for other lessons.

Batches, each tested and stopped for review:
- **A** (infrastructure and two sample lessons):
  - demo playback in the cockpit (scripted riders move from tests into content);
  - the control-timeline component and the lesson template;
  - lessons for "Starting and moving off" and the new "Stopping without stalling" (with its cockpit scenario).
- **B**: lessons for the clutch, gears and brakes drills and the five road-condition scenarios.
- **C**: lessons for the four traffic scenarios and the U-turn; module overview, progress totals, links from the cockpit.

Uses the current lesson format plus the new blocks. If Stage 2 Phase 5 Part B (the six-section lesson format) is approved later, these lessons convert with the rest.

### Batch A — framework, two lessons, traffic fix · BUILT, awaiting review

The user approved Batch A only, with a detailed brief. Batch B and C wait for explicit approval. The architecture is documented in [docs/architecture/riding-situations.md](docs/architecture/riding-situations.md).

| Feature | What was built |
|---|---|
| A — Lesson framework | `SituationLessonView`: seven sections, one at a time (`?section=`): Situation, Controls, Timeline, Watch, Mistakes, Check, Practise. Sticky section navigation, Next/Back, module pager on the last section. `LessonPage` renders it for any lesson with `situation`. |
| B — Shared scenario data | `CockpitScenario` gains `demo` (one timed action per guided step) and `hint`. `run.ts`: `setupState` (shared with the cockpit hook) and `runScenario` (shared model, guided checks, mistakes; samples and step snapshots). The test helper `scriptedRider` now wraps it. Lesson teaching in `content/situations/` refers to the scenario by id. |
| C — Timeline | `ControlTimeline`, built from the run: traces for clutch (friction zone shaded), throttle, front and rear brake, gear (changes marked), engine RPM and road speed. Stage buttons, Previous/Next, click or hover read-out, a stage panel with values and the clutch state, a table view, and a key. |
| D — Watch it done | `useDemoPlayer` and `WatchItDone`: the demo drives a live cockpit simulation. Play/Pause/Resume, Previous/Next step, Replay, Slow motion, 0.25/0.5/1×. Captions per step (instruction, "Watch:", explanation when done); Inside the Machine and Road Response alongside. |
| E — Two lessons | "Starting and moving off" (4 controls) and "Stopping without stalling" (5 controls), each with situation, controls (7 parts, drawing, trace, stages used, mechanics illustration), 4–5 mistakes (6 parts and fix), and 3 questions. New cockpit scenario **Stopping without stalling** (5 steps, demo). Moving-off demo is the plan the tests ride. |
| F — Moving again in traffic | No longer paused at the start. The light turns green 3 s after the learner is ready **and** has moved past "Get ready". Contextual hints: get ready → wait for green → wait for the car → how to move off. |

Shared data:
- `RideInputs.stage` (the guided step) goes to the world from the runner, the cockpit page and the demo player.
- `roadSceneFor` is shared by the cockpit page and Watch it done.
- `PagerLink` is exported for reuse.

Touch targets: the knowledge check's buttons are now 44 px (all lessons).

Files created:
- `content/scenarios/cockpit/run.ts`, `stopWithoutStalling.ts`, `demo.test.ts`
- `content/situations/types.ts`, `startAndMoveOff.ts`, `stopWithoutStalling.ts`, `situations.test.ts`
- `content/modules/ridingSituations.ts`
- `components/situations/controls.ts`, `ControlTimeline.tsx`, `WatchItDone.tsx`, `SituationSections.tsx`, `SituationLessonView.tsx`
- `components/cockpit/roadScene.ts`
- `hooks/useDemoPlayer.ts`
- `docs/architecture/riding-situations.md`

Files modified:
- `content/types.ts`, `content/curriculum.ts` (module and validator)
- `content/scenarios/cockpit/types.ts`, `index.ts`, `startAndMoveOff.ts` (demo), `traffic.ts` (fix F), `traffic.test.ts`, `scriptedRider.ts`
- `lib/simulation/cockpitWorld.ts` (`RideInputs`)
- `hooks/useCockpitSim.ts` (`setupState`, `restore`, `setStage`, gear/clutch/stage to the world)
- `pages/LessonPage.tsx`, `pages/RiderCockpitPage.tsx` (hint, stage, `roadSceneFor`)
- `components/lesson/LessonView.tsx` (export `PagerLink`), `components/lesson/KnowledgeCheck.tsx` (44 px buttons)

Tests:
- Unit: 128/128, including:
  - `demo.test.ts` (7): every demo completes every step with no mistakes; the moving-off run passes through the friction zone; the stop pulls the clutch in above idle and never stalls;
  - `situations.test.ts` (5): module, validator, scenario links, all parts present, cockpit-detected mistakes are real;
  - traffic test: the light waits while the learner is on "Get ready".
- New `rs1test`: 46/46, covering the brief's 15 checks:
  - navigation and module overview; both lessons through all seven sections;
  - section content; the timeline from scenario data; Watch it done controls, completion and end state;
  - quiz saved; Practice opens the scenario in its starting state, and Back returns with progress kept;
  - traffic fix; existing lesson; phone layout; no console errors.
- Side effect of adding a module: the knowledge assessment (one question per lesson, up to 5 per module) now draws from five modules — 22 questions instead of 20. Its description on the Assessment and Progress pages is now generated from the curriculum (it said "five questions from each of the four modules" / "Twenty questions … four modules").
- Regression:
  - rs1 46, ck13 19, ck1 20, ck2 34, ck4 19, ck5 16, ck6 14, ck7 22, ck8 25, ck9 22, ck9axe 17, ck10 32, ck11 29, ck12 15, P0 60, P5 32, P11 49, P12 27 — all pass.
  - Under load in the batch run, ck11 (detached frame) and ck12 (U-turn timing) failed; both passed alone.
  - Test-side updates for intended changes:
    - 16 scenario buttons, 15 scenarios in ck13 (Basics 5);
    - P12: 52 lessons, 34 exercises; its assessment answers however many questions there are (22, five modules);
    - ck11's moving-in-traffic start.
  - Types, lint and build clean.

Known limitations:
- **Playback timing:** Watch it done runs on the browser's frame clock, so it can differ slightly from the 60 Hz run the timeline is drawn from. Each step waits for its check (up to 3 s extra), so the outcome matches.
- **The demonstrated rider:** the demonstrations show one careful way through on one simulated motorcycle. Real riders vary; the lessons say so where it matters.
- **Mistakes the cockpit can't see:** "Looking down at the controls" and "pulling the clutch in too early" are taught but not detected; the cockpit can't see them.
- **Section ticks:** the section navigation marks earlier sections green as visited; it doesn't track per-section completion.

### Batch B — eight more lessons · BUILT, awaiting review

The user wrote "approve batch 3" and, when asked, chose **Batch B** (the agreed order).

| Lesson | Scenario (demo added) | Controls taught |
|---|---|---|
| Using the clutch | clutch-drill | clutch, gear, throttle |
| Changing gear | gears-drill | clutch, throttle, gear |
| Using the brakes | brakes-drill | front, rear, clutch |
| Hill start | uphill-start | rear, clutch, throttle, gear |
| Riding downhill | downhill | throttle, front, rear, gear, clutch |
| Braking on a wet road | wet-road | throttle, front, rear, clutch |
| Slowing on gravel | gravel | throttle, rear, front, clutch |
| Emergency braking | emergency-braking | throttle, front, rear, clutch |

Every lesson has all seven sections. Each control is explained in seven parts, with an illustration where one exists (clutch, gearbox, throttle, front brake, weight transfer, gear–speed chart, friction circle). Each has 4 mistakes with their fix and 3 questions. No UI changes were needed: the Batch A framework took them as data.

- **Demonstrations** are the plans each scenario's tests already rode (gears: a shared `cleanChange` helper in `drills.ts`).
- **Content:** `content/situations/drills.ts` and `content/situations/roadConditions.ts`. Lessons are listed via a `situationLesson()` helper in `ridingSituations.ts`.
- **Fix:** Watch it done ignores a scenario's "wait for the rider" set-up (emergency braking), because the playback controls start it.
- **Effect on the assessment:** the module now has 10 lessons, so the assessment draws 5 from it — 25 questions in all. The descriptions update by themselves.

Tests:
- Unit: 144/144:
  - every demo (10) completes every step with no mistakes;
  - all 10 lessons pass the validator;
  - every control field is a real explanation (more than 20 characters; short ones were rewritten, not the threshold lowered).
- New `rs2test`: 14/14. For each of the 8 lessons:
  - the seven sections, and every control's five fields;
  - timeline stages equal the scenario's steps;
  - Watch it done plays to the end and **ends where the timeline says** (same gear, speed within 1 km/h in every lesson);
  - the Practice link opens the right scenario.
  - Plus: emergency practice opens the cockpit waiting, and Back returns; the hill-start picture names the slope; phone fit; no console errors.
- Test-side count updates: rs1 (10 lessons), P12 (60 lessons, 25 assessment questions).

- Regression after Batch B: rs2 14, rs1 46, ck13 19, ck1 20, ck2 34, ck4 19, ck5 16, ck6 14, ck7 22, ck8 25, ck9 22, ck9axe 17, ck10 32, ck11 29, ck12 15, P0 60, P5 32, P11 49, P12 27 — all 19 suites pass first time. Types, lint and build clean.

### Batch C — the last five lessons, cockpit links · BUILT

The user approved Batch C ("approve batch c").

| Lesson | Scenario | Controls taught |
|---|---|---|
| Stopping at a traffic signal | traffic-signal | throttle, front, clutch, gear |
| Moving again in traffic | moving-in-traffic | clutch, gear, throttle |
| Riding in slow traffic | slow-traffic | clutch, throttle, rear |
| Crossing a speed breaker | speed-breaker | front, gear, clutch, throttle |
| U-turn | u-turn | handlebar, clutch, throttle, rear |

- **Demonstrations that read the road:**
  - `DemoStep.act(t, state, world)`: the runner and the player both pass the road world.
  - Traffic demos wait for the light and the car. Slow traffic creeps while the car creeps and stops when it stops.
  - The U-turn straightens when facing back (heading ≥ 179°; at 175° the run drifted 0.7 m into the far kerb).
  - Traffic signal: the front brake adds only what engine braking and the rear don't give (the first version stopped 10.3 m short of the 10 m window).
- **Player now matches the runner:** a step counts as done once its check has been met (latched), not only while it holds. Slow traffic needs this: the car moves off again after you stop.
- **Handlebar in the timeline:** a row (Straight / Full lock right / Straight) plus a table column and a stage value, for lessons that teach steering.
- **Cockpit → lesson links:**
  - `lessonForScenario(id)` in `curriculum.ts`.
  - Every cockpit scenario shows "Learn it first: <lesson> — each control explained, and watch it done" under its briefing.
  - The link is hidden when the learner has just come from that lesson; "Back to the lesson" shows instead.
- **Every cockpit scenario now has a demonstration and a lesson.** `demo.test.ts` requires a demo for all 15.
- **Assessment:** unchanged at 25 questions (the module was already capped at 5).

Tests:
- Unit: 154/154 (all 15 demos complete with no mistakes; all 15 lessons validated; every scenario has its lesson).
- New `rs3test`: 11/11:
  - the five lessons: seven sections, controls, stages; Watch it done ends where the timeline says (gear and speed identical in all five); practice link;
  - the U-turn handlebar row;
  - all 15 cockpit scenarios link to their own lesson, hidden when coming from it;
  - the link opens the lesson;
  - no console errors.
- Test-side updates: rs1 (15 lessons), rs2 (15 cards), P12 (70 lessons). rs2 and rs3 read the timeline table by column name (the new handlebar column broke a text match).

- **Bug found and fixed in the final regression:**
  - The rs3 traffic-signal playback once stalled. Retracing it showed live playback stopping 13 m short of the stop line, while the runner stopped 1 m short. The cause: step snapshots shared the road world's scratch memory (`mem`) with the rest of the run. So the first snapshot already "remembered" that the light had turned amber later, and a restored playback began with the light amber at once. "Moving again in traffic" had the same latent flaw: its readiness timer.
  - Fix: `runScenario` snapshots copy `mem`, and `useCockpitSim.restore` copies it again (so Replay starts clean). A new unit test checks the first snapshot still has a green light and empty memory after the run.
  - Live playback now stops at 79.06 m, identical to the runner.
  - The lesson browser tests (rs2, rs3) now also require every demonstration step to meet its own check live (none skipped on the 3 s allowance). All 13 Batch B and C lessons pass this.
- P12 count corrected: the site has 65 lessons (50 + 15), not 70.
- Unit 155/155.
- Final regression (after the snapshot fix): rs3 11, rs2 14, rs1 46, ck13 19, ck1 20, ck2 34, ck4 19, ck5 16, ck6 14, ck7 22, ck8 25, ck9 22, ck9axe 17, ck10 32, ck11 29, ck12 15, P0 60, P5 32, P11 49 — all pass.
  - P12 had one failure in the batch run and passes alone (27/27). The cause is pre-existing: Basics ("Engine basics") and Mechanics ("The four-stroke engine") ask an identically worded question ("How many crankshaft turns does one four-stroke cycle take?"). When the assessment draws both, two prompts read alike.
  - The test now allows for it. The lessons were left unchanged (outside this work's scope); flagged for the user.
- Types, lint and build clean. **Riding Situations complete: 15 lessons.**
