# Phase 1 — Mechanical Content and Physics Accuracy Audit

**Project:** RideCraft · **Date:** 2026-11-02 · **Scope:** report only; no lesson, simulator or model was changed.

## Method and limits

- **Content read in full** for the 14 concepts in the brief. The lessons covered were:
  - `basics`: engine, RPM, torque, gears, clutch, throttle, brakes, drivetrain;
  - `mechanics`: four-stroke, combustion, compression ratio, torque & power, gear ratios, clutch plates, transmission, suspension, tyre dynamics, ABS, traction control, weight transfer, engine braking;
  - `handling`: bends, leaning, countersteering, body position, U-turns, slow speed, tyre grip, corner weight transfer;
  - `preRide`: chain inspection.
- **Also read in full:** the anatomy entries for the clutch, throttle, brakes, chain, wheels and suspension.
- **Scanned** for technical claims, not read in full: the explanation text in all four simulators and all 14 scenarios.
- **Not reviewed in depth:** riding posture, protective equipment, helmet, mirrors, fuel, instruments, side stand, junction and roundabout lessons, and the starting-procedure text. They contain few mechanical claims, but they still need a separate review.
- **Calculations:** each numerical claim was recomputed by hand or by running the project's own models (`powertrain`, `braking`, `cornering`).
- **What these checks show:** they confirm the text agrees with the model and with standard formulas. **They are not external validation.** The one external check is the U-turn radius (finding H6), compared with figures from manufacturers' owner manuals.
- **References:** standard textbooks and training manuals, listed at the end. They are cited for the principle, not for a specific page. No figure in this report is claimed to come from a reference unless the report says so.

Severity scale:
- **Critical:** teaches something dangerous.
- **High:** a wrong mechanism, or numbers a rider might act on.
- **Medium:** misleading, or a simplification presented as a law.
- **Low:** imprecise wording, inconsistency, or an unstated assumption.

No finding is **Critical**. One is **High** (H6). Most of the content is accurate; the issues are concentrated in wording, unstated model assumptions and a few contradictions between lessons.

## Summary by concept

| # | Concept | Status | Findings |
|---|---|---|---|
| 1 | Clutch operation and torque transmission | Needs correction | CL1–CL5 |
| 2 | Gearbox and gear ratios | Accurate (all numbers verified) | GB1 (low) |
| 3 | Engine and four-stroke cycle | Accurate | EN1 (low) |
| 4 | Throttle and engine response | One wrong consequence | TH1 |
| 5 | Engine braking | Mostly accurate | EB1, EB2 (low) |
| 6 | Front and rear braking | Wording issues + a contradiction | BR1–BR3 |
| 7 | Weight transfer | Wording misconception + overstated cause | WT1, WT2 |
| 8 | Countersteering | One misleading limit | CS1 |
| 9 | Lean angles | Correct formula; unstated assumptions | LN1, LN2 |
| 10 | Tyre traction and contact patch | Accurate; minor inconsistencies | TY1, TY2 |
| 11 | Suspension | Accurate | SU1 (low) |
| 12 | ABS and traction control | Accurate | AB1 (low) |
| 13 | Chain and sprocket | Accurate | CH1 (low) |
| 14 | Cornering dynamics | One false stability claim; wrong U-turn numbers | CD1, H6, SS1 |
| — | Simulation models | Simplifications to label | M1–M5 |

### Claims verified as correct (no change needed)

- **Gears:**
  - 267 RPM per km/h in 1st and 86 in 5th;
  - 3,420 RPM at 40 km/h in 5th; 1st is past the redline at 40 km/h;
  - 6,000 RPM gives about 22 km/h in 1st and 70 km/h in 5th;
  - overall ratios about 30 : 1 in 1st and 9.6 : 1 in 5th;
  - 3rd gear at 6,000 RPM gives 48 km/h;
  - a rear sprocket going from 42 to 45 teeth shortens the gearing by 7 %.
- **Gear selector and gearbox:** the 1-N-2-3-4-5 pattern with a half-shift to neutral; constant mesh with dogs, shift drum and forks.
- **Clutch construction:** friction plates keyed to the basket and steels to the hub. Worn plates mean less spring force. JASO MA oil is needed.
- **Clutch capacity example:** 8 × 0.13 × 1,150 N × 0.05 m ≈ 60 N·m, about 1.75 × peak engine torque (10.2 N·m × primary 3.35). This agrees with the simulator's 18 N·m at the crank.
- **Engine and combustion:**
  - 2 crank turns per cycle; 42 power strokes per second at 5,000 RPM;
  - valve lead, lag and overlap;
  - spark about 20° before TDC, peak pressure 10–15° after TDC, flame about 45°;
  - knock causes; roughly one third of fuel energy becomes work.
- **Compression ratio:** Otto efficiency 59 % at 9.5 : 1 and 64 % at 13 : 1; (450 + 50) ÷ 50 = 10.
- **Torque and power:** P = T·ω, so 10 N·m at 628 rad/s is 6.3 kW. Power peaks at about 8 kW near 8,500 RPM. Gearing cannot create power.
- **Braking:**
  - Pascal's principle in the hydraulic brake;
  - 50 km/h at 0.6 g stops in 16.4 m;
  - front share = 0.45 + 0.46 × a/g: 68 % at 0.5 g, 86 % at 0.9 g;
  - stopping from 50 km/h on an amber light: 14 m reaction plus 31 m braking needs about 0.32 g.
- **Lean and cornering:**
  - tan φ = v²/gR, independent of mass;
  - grip lean is atan μ: 42° dry and 27° wet at the μ values used;
  - a 30° lean uses 0.58 g of a 0.9 g budget, leaving 0.69 g for braking;
  - lateral force shared front and rear by centre-of-mass position (45/55) in a steady turn;
  - 5° of lean at 5 km/h needs 30° of steer; lock runs out below about 4 km/h;
  - an uncaught lean doubles in about 0.33 s (inverted pendulum, cosh(t/τ) = 2 with τ = √(h/g)).
- **Countersteering:** the mechanism (steer out from under, then into the turn) and less than 1° at 50 km/h.
- **Tyres:** a contact patch of about 53 cm² for 1,200 N at 225 kPa; peak slip around 12 %.
- **Electronics:** ABS release and reapply cycle; traction control comparing front and rear wheel speeds.
- **Suspension:** spring stores energy and the damper dissipates it; preload changes sag, not spring rate; sag about 30 %.
- **Chain:** 20–30 mm slack; the upper run is the drive side; 15/45 gives 3 : 1.
- **Engine braking:** stronger in lower gears. The model gives 2–5 times the coasting deceleration in gears 1–3.

---

## Findings

Each finding lists:
- **Where:** page or lesson ID;
- **Current:** what the text says now;
- **Issue:** what is wrong with it;
- **Corrected explanation:** what it should say;
- **Severity;**
- **Reference;**
- **Recommendation:** the fix to make.

### 1. Clutch

**CL1 · Medium · The clutch is described as cable-operated everywhere**
- **Where:**
  - `anatomy.ts` clutch: "Pulling the lever moves a cable…" and release mechanism "Lever → cable → release arm → pushrod";
  - `basics/understanding-clutch` q4 explanation: "the cable could hold the pressure plate slightly open";
  - `mechanics/clutch-plates`: "No free play at the lever".
- **Issue:** many motorcycles, especially larger ones, use a **hydraulic** clutch: lever → master cylinder → hose → slave cylinder → pushrod. Hydraulic systems compensate for plate wear automatically and usually have no user-adjustable freeplay. Telling a rider with a hydraulic clutch to "adjust freeplay" is wrong for their motorcycle.
- **Corrected explanation:** "The lever operates the release mechanism either through a **cable** (most small motorcycles) or **hydraulically** (master and slave cylinders, common on larger motorcycles). A cable clutch needs a little freeplay at the lever so the pressure plate is never held open as the cable stretches and the plates wear; a hydraulic clutch compensates for wear automatically — check its fluid level instead."
- **Reference:** manufacturers' service manuals (cable and hydraulic release systems); Foale, *Motorcycle Handling and Chassis Design* (general drivetrain chapters).
- **Recommendation:** update the anatomy text, both clutch lessons and the pre-ride clutch check, and add one quiz question on the difference.

**CL2 · Medium · "Lever in: … the plates slip, and the engine spins freely" overstates disengagement**
- **Where:** `basics/understanding-clutch` concept.
- **Issue:** a wet clutch never fully separates: oil film shear causes **clutch drag**, especially when cold. That is why a motorcycle lurches slightly and clunks when first gear is selected from neutral, and why it can creep against the brake. The text implies zero torque.
- **Corrected explanation:** "Lever in: the springs no longer clamp the stack, so the plates can turn at different speeds and almost no torque passes. A wet clutch still drags a little through the oil — which is why first gear goes in with a clunk, especially when the engine is cold."
- **Reference:** Foale; manufacturers' owner manuals (the clunk when selecting first gear is normal).
- **Recommendation:** add one sentence. Optionally show a small drag torque in the clutch explorer (Phase 3).

**CL3 · Medium · The lever → clamping-force model is linear, with a 45 %-wide friction zone (also model M1)**
- **Where:**
  - `lib/mechanics/clutch.ts` (freeplay 0–15 %; force falls linearly from 15 % to 60 %), used by the clutch diagram, the anatomy page and all powertrain simulators;
  - the lesson caption "freeplay … then the friction zone, then full disengagement".
- **Issue:**
  - **Clamp force:** in a real wet multi-plate clutch, clamp load is spring force minus release load. It collapses over a short pressure-plate lift, shaped by the cushion (wave) plate and the stack's compliance. It is not a straight line in lever travel.
  - **Friction zone:** typically a narrow band of lever travel, not 45 %.
  - **Friction:** the coefficient differs between static and sliding plates, and changes with slip speed and oil temperature.
  - **Disclosure:** none of this is stated as a simplification.
- **Corrected explanation:** model the stages, and state each assumption:
  1. lever ratio;
  2. freeplay (cable) or a hydraulic ratio;
  3. pushrod travel;
  4. plate lift;
  5. clamp force = spring preload − release load, with cushion-plate compliance;
  6. capacity = n·μ·F·r_eff, with μ_static > μ_kinetic.
- **Reference:** standard clutch-capacity formula, as already used in `mechanics/clutch-plates`; Foale.
- **Recommendation:** the reference implementation for Phase 3. Until then, add a "simplified model" note to the clutch diagram.

**CL4 · Low · "Power" used where "torque" is meant**
- **Where:**
  - `basics/understanding-clutch` q3, option b and explanation: "before it has enough power";
  - `anatomy.ts` clutch callout: "before the engine is making enough power".
- **Issue:** a stall happens when the load torque at the crank is greater than the engine's torque at that RPM. Power is not the deciding quantity.
- **Corrected explanation:** "…the engine is suddenly asked to accelerate the motorcycle through a 30 : 1 reduction; at low RPM it can't produce enough torque, so it is dragged below its minimum speed and stalls."
- **Reference:** Heywood, *Internal Combustion Engine Fundamentals* (torque and power definitions).
- **Recommendation:** fix the wording.

**CL5 · Low · Clutch types not mentioned**
- **Where:** clutch lessons.
- **Issue:** slipper (back-torque-limiting) and assist clutches are common on modern motorcycles and change how downshifts feel. Dry clutches also exist.
- **Recommendation:** add a short "variants" note in `mechanics/clutch-plates`.

### 2. Gearbox

**GB1 · Low · The gear pattern is stated as universal**
- **Where:** `basics/understanding-gears` tip; `simulators/gears.ts` "The gear pattern".
- **Issue:** "1–N–2–3–4–5, press down for first" is the road standard. Some motorcycles have 6 gears, and race/GP shift patterns are reversed.
- **Recommendation:** add "on almost all road motorcycles" and "your motorcycle may have six gears".

The example "Riders who carry a pillion uphill often do the opposite of what racers do" (`mechanics/gear-ratios`) is unclear and should be rewritten or removed (Low).

### 3. Engine

**EN1 · Low · Inconsistent thermodynamic assumptions in compression ratio**
- **Where:** `mechanics/compression-ratio`.
- **Issue:** the efficiencies (59 % and 64 %) use the ideal Otto cycle with γ = 1.4. The end-of-compression figures (19 bar / 375 °C and 28 bar / 440 °C) only fit a polytropic exponent of about 1.3 from roughly 57 °C intake. Both are reasonable, but they come from different models, and neither assumption is stated.
- **Recommendation:** add "ideal air-standard cycle" to the efficiency figures and "realistic compression with heat loss" to the pressure and temperature figures.
- **Reference:** Heywood, chapter 5.

### 4. Throttle

**TH1 · Medium · "Snapping the throttle shut halfway round … could make the motorcycle run wide"**
- **Where:** `basics/understanding-throttle`, example.
- **Issue:**
  - **Wrong consequence:** at a constant lean angle, slowing down *reduces* the turn radius (r = v²/(g·tan φ)), so the line **tightens**.
  - **Contradiction:** RideCraft's own `handling/weight-transfer` example says exactly that: "the front digs in, the line tightens and the lightened rear twitches".
  - **Actual risks:** sudden load transfer onto the front tyre, which raises its combined demand; a lightened rear tyre that can slide under engine braking on a slippery surface; and a chassis that is upset.
  - **Where running wide does belong:** braking hard mid-corner makes the motorcycle stand up and run wide, through the front brake's steering torque. That is described correctly in `handling/basic-turning`.
- **Corrected explanation:** "Snapping the throttle shut halfway round pitches load onto the front tyre and takes it off the rear. The motorcycle slows and tightens its line, the front works harder, and on a slippery surface engine braking can make the rear slide."
- **Reference:** Cossalter, *Motorcycle Dynamics* (steady turning; steering torque from braking); Code, *A Twist of the Wrist* (rider-training view of throttle control).
- **Recommendation:** fix the example so it matches the handling lesson.

### 5. Engine braking

**EB1 · Low · "Fuel-injected engines also cut the fuel completely … so engine braking uses no fuel"**
- **Where:** `mechanics/engine-braking`.
- **Issue:** deceleration fuel cut-off is common, but it depends on the model and the conditions (above a set RPM, engine warm, not near idle). It is not universal.
- **Corrected explanation:** "Many fuel-injected engines cut the fuel on a closed throttle above a set engine speed, so engine braking can use almost no fuel."
- **Reference:** Bosch, *Automotive Handbook* (overrun fuel cut-off).

**EB2 · Low · "Several times stronger than coasting with the clutch in" holds only in low gears**
- **Where:** `mechanics/engine-braking`.
- **Issue:** the model gives 2–5 × coasting in gears 1–3, but only about 1.6–1.9 × in 5th at 50–80 km/h.
- **Recommendation:** add "in the lower gears". Also add one line on the rear wheel hopping or locking after an aggressive downshift without rev-matching (slipper clutches reduce this).

### 6. Braking

**BR1 · Low · "The front brake can provide about 70 % of the stopping power" stated as a fixed figure**
- **Where:**
  - `simulators/rideStop.ts:276` topic;
  - `anatomy.ts` front brake ("often quoted as around 70 % or more").
- **Issue:** the share that is *usable* depends on deceleration. With ideal distribution it equals the front load share: 64 % at 0.4 g, 73 % at 0.6 g, 86 % at 0.9 g in RideCraft's model. On a wet road, at lower deceleration, the front share is smaller.
- **Corrected explanation:** "The harder you brake, the larger the share the front tyre can carry — from about two-thirds in moderate braking to well over 80 % in an emergency stop on a dry road."
- **Reference:** Cossalter (load transfer in braking); Gillespie, *Fundamentals of Vehicle Dynamics*.

**BR2 · Low · Rear-brake guidance contradicts itself**
- **Where:** `basics/understanding-brakes` steps ("Squeeze the front harder … keep the rear steady") versus `mechanics/weight-transfer` example ("Easing the rear pedal as the load comes off it keeps the wheel turning").
- **Issue:** as load leaves the rear tyre, the same pedal pressure becomes more likely to lock it. The mechanics lesson is right.
- **Recommendation:** change the step to "ease the rear slightly as the load comes off it".

**BR3 · Low · Hydraulic wording**
- **Where:** `basics/understanding-brakes`: "a piston pushes brake fluid along a hose".
- **Issue:** the fluid barely moves. What travels is pressure. The anatomy text already says this correctly.
- **Recommendation:** "…pressurises the brake fluid, and the pressure is transmitted through the hose to the caliper."

### 7. Weight transfer

**WT1 · Medium · "Weight moves / shifts / is thrown forward" (about 15 places)**
- **Where:**
  - `basics.ts:797` ("Opening the throttle shifts weight to the rear; closing it shifts weight forward"), `:843`, `:875` (the heading "Weight moves forward"), `:924`, `:931`;
  - `content/anatomy.ts:144, 150, 173` and the rear-brake callout ("With weight thrown forward");
  - `content/simulators/rideStop.ts:68, 229, 276, 296, 318`;
  - `content/scenarios/emergency.ts:65, 80`;
  - `components/motorcycle/parts.ts:97`.
- **Issue:**
  - **The misconception:** the motorcycle's mass doesn't move. What changes is the **vertical load** on each tyre. The braking force acts at road level, below the centre of mass. That creates a pitching moment, which the tyres resist by pressing harder on the front and less on the rear: ΔN = m·a·h/L.
  - **Fork dive:** it does move the sprung mass a little, but that is a consequence of the load change, not its cause.
- **What is already right:** the physics in `braking.ts` and the body of `basics/understanding-brakes` ("Load comes off the rear tyre and presses the front tyre into the road").
- **Corrected explanation:** "Braking transfers **load** onto the front tyre: the braking force acts at the road, below the centre of mass, so it tries to pitch the motorcycle forward. The front tyre is pressed harder into the road and the rear is unloaded — the mass itself stays where it is."
- **Reference:** Cossalter; Gillespie (longitudinal load transfer).
- **Recommendation:**
  - Use "load transfer" consistently.
  - Retitle "Weight moves forward" as "Load transfers to the front".
  - Add this as a "Misconception" item when lessons get the six-section structure (Phase 5).

**WT2 · Medium · The suspension lag is presented as *the* reason for progressive braking**
- **Where:**
  - `mechanics/weight-transfer` ("Load doesn't move instantly: the suspension takes a fraction of a second to pitch, which is why brakes must be applied progressively"; q3);
  - `content/scenarios/emergency.ts:50, 80`;
  - `braking.ts` (`LOAD_TAU = 0.15 s`).
- **Issue:**
  - **The physics:** for the vehicle as a whole, the load transfer follows the deceleration at each instant (Newton's laws hold at every moment). What takes time is the fork compressing and the chassis pitching. That brings transient terms which let the front load lag, and sometimes overshoot, the rigid-body value. The tyre also needs a short distance to build its force.
  - **Rider-training view:** progressive application is taught for these reasons, and to give the rider time to feel the front tyre.
  - **The problem:** the 0.15 s first-order lag is a **model choice** that reproduces this behaviour. It is not a measured property.
- **Corrected explanation:** "The load on the front tyre rises as the deceleration builds, but the fork takes a fraction of a second to compress and the chassis to settle. A grabbed lever asks for full braking force before the front tyre is loaded and settled, and can lock it. Squeezing progressively lets the load and the tyre's grip build with the demand."
- **Model note** for the simulator's assumptions panel: "In this simulator the load follows the deceleration with a 0.15 s lag, a simplification of suspension pitch."
- **Reference:** Cossalter (dynamic load transfer); Motorcycle Safety Foundation, *Motorcycle Operator Manual* (progressive braking).

### 8. Countersteering

**CS1 · Medium · "Countersteering works above roughly 15–20 km/h. At walking pace … you steer directly, as on a bicycle"**
- **Where:** `handling/countersteering` callout; `handling/u-turns` ("At very low speed a motorcycle turns like a bicycle").
- **Issue:**
  - **The physics:** starting a lean by steering always needs a brief steer the other way, at any speed. Bicycles countersteer too.
  - **What changes at low speed:** the countersteer becomes tiny relative to the large steering angle needed to *hold* a tight turn. The rider can also start the lean with body movement. So the steering the rider feels is dominated by turning *into* the bend.
  - **The figure:** the 15–20 km/h threshold is a rider-training rule of thumb, not a physical limit.
- **Corrected explanation:** "Physically, every turn begins with a small countersteer — even on a bicycle. Above roughly 15–20 km/h it is the dominant thing you feel and the way you control lean. At walking pace the countersteer is tiny compared with the large steering angle the turn needs, so you feel as if you simply steer where you want to go."
- **Reference:** Åström, Klein & Lennartsson, "Bicycle dynamics and control", *IEEE Control Systems Magazine*, 2005 (the model RideCraft already uses); Cossalter.
- **Recommendation:** fix the callout and the U-turn sentence.

### 9. Lean angles

**LN1 · Low · Zero-width tyres assumed but not stated (also model M2)**
- **Where:** `handling/leaning`, `cornering.ts`, the lean-angle and countersteer illustrations.
- **Issue:** tan φ = v²/gR is exact for knife-edge tyres. With real tyres, the contact patch moves inward on the rounded profile as the motorcycle leans, so the motorcycle must lean a few degrees *more* for the same turn. The independence from mass also assumes the rider sits in line with the motorcycle.
- **Recommendation:** add "for thin tyres; real tyres need a few degrees more" to the lesson and the illustration caption.
- **Reference:** Cossalter (effect of tyre cross-section on roll angle).

**LN2 · Low · μ values are conservative model values presented as general**
- **Where:** `handling/leaning`, `handling/tyre-grip` (μ ≈ 0.9 dry, giving 42°; 0.5 wet, giving 27°).
- **Issue:**
  - Real friction varies widely with tyre, temperature and surface: modern road tyres on dry asphalt often exceed 1.0, and good wet asphalt can be 0.6–0.7.
  - "Footpegs touch at about 40°" is typical for a commuter, not universal.
  - The numbers are fine for teaching but should be labelled as representative.
- **Recommendation:** add "typical figures used in this course; real values vary with tyre, temperature and surface".
- **Related:** the roundabout example ("30 km/h needs about 30°") implies a radius of about 12 m without saying so. State the radius.

### 10. Tyres

**TY1 · Low · Contact patch "credit card" versus "palm" — two different sizes**
- **Where:** `handling/tyre-grip` ("about the size of a credit card", about 46 cm²) versus `anatomy.ts` wheels ("roughly the size of your palm", about 80–100 cm²); `mechanics/tyre-dynamics` computes 53 cm².
- **Recommendation:** use one comparison everywhere: "about the size of a credit card, roughly 50 cm² per tyre on this motorcycle".

**TY2 · Low · "Each tyre's grip is proportional to its load" stated without qualification**
- **Where:** `mechanics/weight-transfer`, `handling/weight-transfer`.
- **Issue:** real tyres are **load-sensitive**: the friction coefficient falls slightly as load rises, so grip grows a little less than in proportion. The friction "circle" is also closer to an ellipse.
- **Recommendation:** add "approximately" in the lesson and a note in the advanced tyre lesson.
- **Reference:** Pacejka, *Tyre and Vehicle Dynamics*.

### 11. Suspension

**SU1 · Low · Purpose of suspension**
- **Where:** `mechanics/suspension`: "Suspension exists to keep the tyres pressed onto the road".
- **Issue:** it also isolates the rider and chassis from road inputs (comfort and control). The ideal sag figure also depends on the motorcycle type. About 30 % refers to rider sag; static sag (motorcycle alone) is smaller.
- **Recommendation:** name both jobs, and say "rider sag".

### 12. ABS and traction control

**AB1 · Low · ABS on loose surfaces**
- **Where:** `mechanics/abs`.
- **Issue:** on gravel or snow, standard ABS can *lengthen* stopping distance compared with a locked wheel building a wedge of material, which is why some off-road motorcycles allow ABS to be switched off at the rear. The lesson rightly says "ABS doesn't create grip", but implies it always shortens the stop.
- **Also:** the 16.0 m vs 13.2 m figures are correctly labelled "In the model".
- **Recommendation:** add one sentence.
- **Reference:** Bosch, *Automotive Handbook* (ABS on loose surfaces).

### 13. Chain and sprocket

**CH1 · Low · "When the swingarm moves, the sprockets move further apart"**
- **Where:** `preRide/chain-inspection` quiz explanation.
- **Issue:** the distance between the sprockets is greatest when the gearbox output shaft (front sprocket), swingarm pivot and rear axle are in line. Depending on geometry, the distance can increase or decrease from the rest position. The lesson body ("changes slightly") is correct.
- **Recommendation:** "…the distance between the sprockets changes and is greatest at one point in the travel; a chain that is too tight has no slack left for it."

### 14. Cornering dynamics and slow riding

**CD1 · Medium · "Spinning wheels behave like gyroscopes, which helps keep the motorcycle stable as speed rises"**
- **Where:** `anatomy.ts` wheels.
- **Issue:**
  - **The popular explanation:** gyroscopic stability is common, but it is not the main mechanism.
  - **The evidence:** Kooijman et al. (2011) built a bicycle with no gyroscopic effect and no trail, and it was still self-stable. Stability comes from how the steering responds to lean (steering geometry and mass distribution). The gyroscopic effect of the front wheel contributes to that coupling.
  - **Why it matters:** stated as *the* reason, it reinforces a well-known misconception.
- **Corrected explanation:** "As speed rises, a motorcycle becomes self-stabilising: when it starts to lean, its steering geometry makes the front wheel turn into the lean and catch it. The front wheel's gyroscopic effect helps this steering response, but it is not the main source of stability."
- **Reference:** Kooijman, Meijaard, Papadopoulos, Ruina & Schwab, "A bicycle can be self-stable without gyroscopic or caster effects", *Science* 332 (2011); Åström et al. (2005).
- **Recommendation:** rewrite, and add it to the countersteering lesson's "Misconceptions" in Phase 5.

**H6 · High · The U-turn turning circle is about 25–35 % too small**
- **Where:** `handling/u-turns` ("At full lock (about 38°) the tightest turn is about 1.7 m radius — a U-turn about 3.5 m across"); `cornering.ts` `LOCK_RADIUS = WHEELBASE / tan(38°)`; the U-turn illustration.
- **Issue:**
  - **Wrong angle:** the formula uses the **handlebar** angle as if it were the steer angle at the road. With a steering-head rake of about 26°, 38° at the bars is only about 35° at the road.
  - **Wrong reference point:** the result is the radius of the **rear wheel's** path. The front wheel and handlebar sweep a larger circle, about 2.2 m at full lock.
  - **Real figures:** owner manuals for 125 cc motorcycles list minimum turning radii of about 1.9 m (Honda MSX125, Monkey 125) to 2.3 m (Honda CBF125) and 2.9 m (Yamaha MT-125). Some manuals call the diameter a "radius", so check each definition before comparing.
  - **Contradiction:** the lesson's own example says "turns in about 4.5 m".
  - **Why it is High:** a learner who believes they can U-turn in a 3.5 m-wide road could run into the kerb.
- **Corrected explanation:** "At full lock a small motorcycle turns in a circle about 2 m in radius — so a U-turn needs a road at least 4–5 m wide, more for larger motorcycles. Check your owner's manual for your motorcycle's minimum turning radius."
- **Reference:** Cossalter (kinematic steering, the effect of rake); manufacturers' owner manuals (minimum turning radius).
- **Recommendation:**
  - Correct `LOCK_RADIUS`: road-plane steer angle atan(tan δ·cos ε), measured at the front wheel.
  - Update the lesson, its example and the illustration.
  - Re-check the 8 km/h → 17° and 15 km/h figures.

**SS1 · Low · "Never the front brake at walking pace"**
- **Where:** `handling/slow-speed` steps; the U-turn safety callout is fine.
- **Issue:** rider training warns against the front brake **with the handlebar turned** or the motorcycle leaned at low speed. Gentle front braking when upright and straight at walking pace is normal, for example when coming to a stop. "Never" is stronger than the guidance.
- **Recommendation:** "Avoid the front brake while the handlebar is turned or the motorcycle is leaned; use the rear brake for fine speed control in slow manoeuvres."
- **Reference:** MSF *Motorcycle Operator Manual*; DVSA, *Riding – the essential skills*.

**Other Low items in the simulator text**
- **Rev limiter:** "only cuts fuel" (`simulators/gears.ts:90, 161`). Limiters cut fuel and/or ignition. The point being made (it can't stop the wheel driving the engine) is correct.
- **Braking distance:** "stopping distance grows with the square of speed" (`rideStop.ts:113`). This applies to *braking* distance; the reaction distance grows linearly.
- **Corner braking quiz:** "Braking hard in a bend makes the rear most likely to slide" (`handling/weight-transfer` q1). This holds in RideCraft's model: ideal and front-only braking both load the rear tyre more, relative to its grip. The explanation should mention that heavy front braking while leaned also risks the front tyre washing out, which is usually more serious.
- **Filtering speed:** filtering is legal in some countries and banned in others, and speed guidance varies (`scenarios/traffic.ts:152`). Add "where filtering is legal".
- **Hill-start scenario:** "the front can lift off the ground" on a hill start with a 125 (`scenarios/roads.ts:76`) is unlikely. Prefer "the motorcycle lurches and can rear up on a powerful motorcycle".

### Simulation models (labels to add; physics changes belong to Phases 3–4)

| ID | Model | Simplification | Effect | Recommendation |
|---|---|---|---|---|
| M1 | `clutch.ts` | Linear clamp and wide friction zone; μ static = kinetic | Feel of the clutch-throttle, gear and ride simulators | CL3, Phase 3 |
| M2 | `cornering.ts` | Knife-edge tyres; lock radius from handlebar angle | Lean a few degrees low; U-turn too tight | LN1, H6 |
| M3 | `powertrain.ts` | No wheel or drivetrain rotational inertia (effective mass +5–10 %) | Acceleration and engine braking slightly optimistic | Add the term, or label it |
| M4 | `braking.ts` vs `tyre.ts` | Locked-tyre grip 75 % vs about 70 % | Two figures for one fact | One shared constant |
| M5 | `powertrain.ts` | Locked rear wheel stops the engine instantly | Unrealistic but harmless | Label it |

---

## Prioritised correction list

1. **H6:** U-turn radius (content, `LOCK_RADIUS`, illustration).
2. **TH1:** "run wide" contradiction.
3. **CD1:** gyroscopic stability claim.
4. **CS1:** countersteering low-speed claim.
5. **WT1:** "weight moves" wording (about 15 places).
6. **WT2:** progressive-braking explanation and model note.
7. **CL1–CL3:** clutch actuation types, drag and model disclosure (the full model rebuild is Phase 3).
8. All Low items, done together with the Phase 5 lesson restructure.

Most fixes are text changes in `src/content/**`. Only H6 (`cornering.ts`) and later CL3, M3 and M4 change model code, and those need unit tests before they change.

## References

Standard sources, cited for principles; no specific page numbers are claimed.

- V. Cossalter, *Motorcycle Dynamics*, 2nd ed., 2006.
- T. Foale, *Motorcycle Handling and Chassis Design*, 2nd ed., 2002.
- H. B. Pacejka, *Tyre and Vehicle Dynamics*, 3rd ed., 2012.
- T. D. Gillespie, *Fundamentals of Vehicle Dynamics*, SAE, 1992.
- J. B. Heywood, *Internal Combustion Engine Fundamentals*, 2nd ed., 2018.
- Robert Bosch GmbH, *Automotive Handbook* (ABS, fuel cut-off, rev limiting).
- K. J. Åström, R. E. Klein, A. Lennartsson, "Bicycle dynamics and control", *IEEE Control Systems Magazine* 25(4), 2005.
- J. D. G. Kooijman, J. P. Meijaard, J. M. Papadopoulos, A. Ruina, A. L. Schwab, "A bicycle can be self-stable without gyroscopic or caster effects", *Science* 332, 2011.
- K. Code, *A Twist of the Wrist*, Vol. II.
- Motorcycle Safety Foundation, *Motorcycle Operator Manual*.
- DVSA, *The Official DVSA Guide to Riding – the essential skills*.
- JASO T903 (motorcycle four-stroke oil classification: MA/MB).
- Turning radii: owner manuals for the Honda MSX125 and Monkey 125 (about 1.9 m), Honda XR125L (2.1 m), Honda CBF125 (2.3 m) and Yamaha MT-125 (2.9 m), found through a web search on 2026-11-02 and not individually re-verified against the original manufacturer documents.
