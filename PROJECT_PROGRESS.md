# MotoLab — Project Progress

Interactive motorcycle education platform. Built strictly phase by phase; each phase stops for review and approval before the next begins.

**Current phase:** All 14 phases COMPLETED — project complete
**Last updated:** 2026-11-01

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
- [x] Inspected workspace: it contained only an unrelated Kaggle project (`H&M_recommendation/`, `Py_3.13_venv/`) and no Node.js. MotoLab was created in a separate `motolab/` folder; nothing existing was touched.
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
| Status colours on warning lights | Green/blue information, amber caution, red stop — the real-world convention, and the same as MotoLab's feedback palette. |
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
- **Page titles:** 80 of 81 pages shared one `<title>`; added `usePageTitle`, so every page has its own (for example "Countersteering · Turning & Handling · MotoLab").
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
