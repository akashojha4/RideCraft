# Video 2 — How to start a geared motorcycle (the sequence)

Read this while you record. One skill, one payoff, about 4–5 minutes. You are not on camera — only RideCraft and your voice.

This follows Video 1 (*Why new riders stall*). Do **not** re-teach plates, the friction zone, or why a dump stalls. Name the biting point. Do not explain it.

**Title to publish:** How to Start a Geared Motorcycle (the sequence, not the button)

**Backup titles:**
- Engine running is not the same as moving off
- Neutral, start, clutch in, first — then go

---

## Claude Code — paste this into VIDEO_PROMPT.md as the TOPIC block

- **Script file:** `docs/youtube/02-how-to-start-a-geared-motorcycle.md`
- **Topic / title idea:** How to start a geared motorcycle — step by step
- **The one mistake beginners make:** treating “engine running” as “ready to ride” (wrong order: start in gear, throttle in neutral, or clutch out too soon)
- **Simulators / pages to film:**
  - `http://localhost:5173/simulators/cockpit?practice=start-and-move-off` (Rider view + Watch how it’s done)
  - `http://localhost:5173/simulators/starting` (ignition / kill / N / starter)
  - `http://localhost:5173/simulators/clutch-throttle` (pull away only — no plate lecture)
- **Target length:** YouTube ~4–5 min · reels 30–45 s
- **Anything special:** Video 1 already covered stall + clutch. Do not repeat it. Stop once they are rolling in first at ~10 km/h. Do not change into second. Do not redesign the simulator. Do not commit, push or deploy. Record on localhost only. Show narration lines, shot list and reel scripts, then wait for OK.

Reuse `~/Desktop/RideCraft videos/_pipeline/`. Quality reference: `~/Desktop/RideCraft videos/01 Why new riders stall (re-cut)/`.

---

## Learning objectives

By the end, a beginner who watched Video 1 can:

1. Tell **starting the engine** apart from **moving off**.
2. Run the RideCraft start sequence in order: **Neutral → Start → Clutch in → First → A little throttle → Bite → Out**.
3. Sit so hands and feet are on the controls, and look ahead — not at the levers.
4. Practise a smooth first-gear start in the simulator, then only in a closed area with an instructor.

They will **not** get: clutch-plate theory, a hill start, or changing to second.

---

## Lesson outline (what the 9 sections become)

| Brief section | Where it lives in this video | View |
|---|---|---|
| 1. Introduction | Hook + roadmap card | Rider, then card |
| 2. Before starting | Shot B, spoken in 20 s (stands + gear as words; N + start on screen) | Starting sim, then Rider |
| 3. Preparing to move | Shot C: posture, clutch in, first, dash shows 1 | Rider punch-ins |
| 4. Throttle | Shot C: quarter twist, revs lift | Rider, right grip + cluster |
| 5. Moving | Shot C: bite, then out to ~10 km/h | Rider, then Road |
| 6. Common mistakes | Shot C, four short cuts — no lectures | Rider |
| 7. Practical demonstration | Shot D: Watch how it’s done, 0.5× | Rider + checklist |
| 8. Practice exercise | Shot C2: clutch-throttle pull away | Road / split if already on that page |
| 9. Recap | Recap card + end card | Cards |

Do not force Machine / Road / Split into every beat. Use them only when the picture changes the teaching.

---

## Teaching sequence (why this order)

Beginners stall in Video 1 because they dump the clutch. They stall in real life because they **skip a step**. So this video is a checklist, not a mechanism lesson.

Hook the confusion: engine on, still going nowhere — or a jump because they started in gear.

Then three jobs only:

1. **Get it running** in neutral (and, on a real bike: stands up, kill switch RUN, ignition on).
2. **Get first without a jump** — clutch fully in, then first.
3. **Move off** — a little throttle, ease to the bite, then fully out.

Video 1 already proved why the middle of the lever matters. Here you only say: *you already know the bite — now put it in the right place in the sequence.*

---

## Before you press record

1. Dev server: **localhost:5173** (never www.ridecraft.in — GA4 would count it).
2. Browser: Chrome or Edge, **1920×1080**. Fill the screen on the cockpit. Mute RideCraft sounds.
3. Dark charcoal + orange as the site is. No 3D, no stock, no redesign.
4. Keyboard (click the cockpit once so it has focus):

| Key | Control |
|-----|---------|
| **A** | Clutch in (hold) |
| **Z** | Clutch out (hold) |
| **↑** | Throttle |
| **D** | First gear (press down) |
| **E** | Second (do **not** use in this video) |
| **I** | Starter |
| On-screen **N** | Neutral |

5. Dashboard numbers you may show (RideCraft’s model — do not invent others): idle about **1,400 RPM**; throttle about a **quarter**; move-off done at about **10 km/h** with the clutch fully out; gear **N** then **1**.
6. This motorcycle in the scenario starts **in first, engine off** — as many real bikes are parked. Finding N is the first action, not a garnish.
7. Speak slower than feels natural. One control highlighted at a time. Never paragraphs on screen.
8. **Do not change site code. Do not commit, push or deploy.** If a crop needs an overlay, do it in `compose3.mjs`, not in React.

**Disclaimer — say it once, at the end, and paste it in the description:**
RideCraft is a learning aid, not a licence. Follow the motorcycle’s handbook. Practise starting and moving off only in a closed area with a qualified instructor.

---

## Shot list (four URLs)

Record in this order. Leave 2 seconds of silence at each cut. Log line starts in `timeline.json` if you are on the pipeline.

### Shot A — The wrong start (hook, ~12 s of picture)

**URL:** `http://localhost:5173/simulators/cockpit?practice=start-and-move-off`  
**View:** Rider. Fill the screen.

1. Leave it in **first**, engine off (the scenario setup).
2. Press **Start (I)** *without* finding neutral and *without* clutch in. If the sim refuses the starter, that is the picture — hold on the dash: gear **1**, engine **OFF**.
3. Reset. Find **N**, start, open a handful of throttle. Dash: **N**, revs up, **0 km/h**. Hold two seconds.

That second freeze is the hook still: engine running, not moving.

Optional thumbnail frame: gear **1**, engine off, starter pressed.

### Shot B — Get it running (~45 s)

**URL:** `http://localhost:5173/simulators/starting`  
**View:** the starting trainer (this is the only place RideCraft shows ignition and kill switch). Punch in on the step being spoken.

Play or click:

1. Ignition ON.
2. Kill switch RUN.
3. Green **N**.
4. Clutch in (habit, in case a gear is still selected).
5. Starter, then release. Idle ~1,400 RPM. Speed still 0.

**Do not** walk the plates. If Machine view is on this page, a 3–4 s glance at the crank turning while the wheel is still is enough.

Spoken over this, not animated (the sim has no stands): both feet down until it rolls; stands up on a real motorcycle; helmet on; closed area.

### Shot C — Get first, then move (~90 s)

**URL:** `http://localhost:5173/simulators/cockpit?practice=start-and-move-off`  
**View:** Rider. Punch-ins: left hand, left foot, cluster, right grip. One at a time.

From engine idling in **N**:

1. Posture: look at the road, not the lever. Hands on bar, left toes on the gear lever, both feet still on the ground.
2. Clutch fully in (**A**). Cluster still **N**.
3. **D** into first. Cluster **1**. Engine still running.
4. A little throttle (**↑**), about a quarter — revs lift, not a scream.
5. Ease clutch toward the bite until it creeps. Hold ~2 s. Overlay: **Biting point** — no extra words.
6. Then fully out, a little more throttle, to ~10 km/h.

**Cut, same URL, four mistake takes** (2–3 s each, labels only):

| Take | What you do | Label |
|------|-------------|--------|
| 1 | Clutch snaps out (**Z** hard) | Too fast |
| 2 | Throttle wide open in the bite | Too much throttle |
| 3 | Look down at the lever while moving | Look ahead |
| 4 | Try to go with cluster on **N** | Wrong gear |

No panic-acting. No “balance lecture” beyond: feet down until it rolls.

### Shot C2 — Practice in the trainer (~25 s)

**URL:** `http://localhost:5173/simulators/clutch-throttle`  
Exercise: **Pull away without stalling**. Crop the lesson essay; show bike + rev needles + clutch slider.

One clean pull-away to ~10 km/h. Overlay: **This is the drill.**

### Shot D — From the seat (~40 s)

**URL:** `http://localhost:5173/simulators/cockpit?practice=start-and-move-off`  
**View:** Rider. **Watch how it’s done** at **0.5×**. Stop the demo **before second gear** (after Ride away / ~10 km/h). If Watch will not stop, cut in edit on “locked, and you’re rolling.”

Talk only on: Neutral. Start. Clutch in. First. A little throttle. Bite. Out.

Keep the move-off checklist. Cover the **X** and **Start** chrome if they sit in frame.

### Shot E — End card (8–10 s)

`Try it free — ridecraft.in`  
Lesson: Starting and moving off  
Simulator: Cockpit · Starting

---

## Storyboard (timestamps for a ~4:40 cut, 1.0 on hook / demos)

Pacing later, in `pace.mjs`: hook and diagrams 1.0×, general explanation 1.1×, “same idea” up to 1.2×, silent holds 1.25×. Do **not** speed Watch or the bite hold. Pitch-safe `atempo` only.

| Time | Scene | Narration (sense) | View / animation | On screen |
|------|-------|-------------------|------------------|-----------|
| 0:00 | A1 | “Most people think starting a motorcycle is pressing the button.” | Rider, in 1st, engine off, they hit Start | — |
| 0:04 | A2 | “That’s only half the job.” | N, engine running, handful of throttle, 0 km/h | **Engine running ≠ moving** |
| 0:10 | B glance | “The engine can spin. The wheel can sit still. Starting and moving off are two jobs.” | Starting sim or Machine: crank turning, wheel still | **Two jobs** |
| 0:18 | Card | “In the next four minutes: three steps.” | Roadmap card | 1 Get it running · 2 First without a jump · 3 Move off |
| 0:28 | B | Neutral, ignition, kill, starter. Stands + helmet as words. | Starting sim, punch-in each step | **N** then **RUN** then idle RPM |
| 0:55 | C | Sit, look ahead, clutch in, first. | Rider: foot, lever, cluster **1** | **Clutch in → 1** |
| 1:18 | C | Quarter throttle, not a handful. | Right grip + rev needle | **A little** |
| 1:32 | C | Bite, hold, then out. “You know this from the last video.” | Lever to BITE, bike creeps, then 10 km/h | **Bite** then **Out** |
| 1:55 | C mistakes | Four cuts, one line each. | Rider | labels above |
| 2:20 | D | Full sequence from the seat. | Watch 0.5×, checklist ticks | move-off list, stop before 2nd |
| 3:05 | C2 | “Do this ten times in the trainer.” | Clutch-throttle pull away | **The drill** |
| 3:25 | Card | Recap the seven words. | Recap card | ✓ N Start Clutch First Throttle Bite Out |
| 3:42 | E | CTA + safety | End card | URL + disclaimer |

---

## Spoken script

Read the lines. Square brackets are actions, not speech.

---

**[Shot A. Rider view. Motorcycle in first, engine off.]**

Most people think starting a geared motorcycle is just pressing the button.

That’s only half the job.

**[N, engine idling, handful of throttle, 0 km/h.]**

Hear that? The engine is running. You are not moving.

Starting the engine, and moving off, are two different jobs. Mix them up and the motorcycle jumps, stalls, or sits there shouting at you.

If you watched the last video, you already know the clutch is not an on-off switch. This video is the order. The same start, from a standstill, without guessing.

This is RideCraft. It’s a simulator, not a real motorcycle, and it is not a licence.

**[Roadmap card.]**

In the next four minutes: get it running, get first without a jump, and move off.

**[Shot B — starting trainer.]**

On a real motorcycle, before any of this: helmet on, stands up, both feet down, and a quiet car park with an instructor — not a public road. The handbook for *your* motorcycle wins if it differs.

Now the bit we can show.

Green N. Neutral. If you parked in first, that’s a gentle half-lift, not a stomp.

Ignition on. Kill switch to RUN. If that switch is off, nothing starts — that’s a very common “it won’t start.”

Clutch in. That’s a habit, in case a gear is still selected.

Then the starter. Press, engine fires, release. Revs settle. Speed is still zero. You have started the engine. You have not started riding.

**[Shot C — rider view, Fill the screen.]**

Sit so you can see the road, not the lever. Left hand on the clutch, right on the throttle, left toes on the gear lever. Feet stay down until it rolls.

Clutch fully in, to the bar.

Then first — one press down. You want a 1 on the dash, not a 2, and not N.

A little throttle. A quarter. Not a handful. Too much and it lunges when the clutch takes up. Too little and it dies — you already saw that.

**[Ease to the bite. Hold.]**

Now the part you practised last time. Ease to the bite. It creeps. Engine still running. Hold it.

Then the rest of the way out, slowly, and you’re riding. Once it is rolling, feet on the pegs, eyes up.

**[Four mistake cuts.]**

Snap the clutch, and it stalls or lunges — same mistake as video one, just later in the sequence.

A handful of throttle in the bite cooks the clutch and then jumps.

Looking down at the lever makes the steering wander. The controls are in the same place every time. Look where you want to go.

And if the dash still says N, more throttle will not move you. Check 1.

**[Shot D — Watch how it’s done, 0.5×. Stop before second.]**

Here it is from the seat. The careful version.

Neutral. Start. Clutch in. First. A little throttle. Ease to the bite. Then out.

That’s the whole start. Repeat it until it’s boring.

**[Shot C2 — clutch-throttle pull away.]**

Your drill: from a standstill, first gear, a little throttle, slow clutch, to walking pace, ten times. When it creeps without a jerk, and the engine note only dips a little, that’s a good start.

**[Recap card.]**

Neutral. Start. Clutch in. First. A little throttle. Bite. Out.

**[End card.]**

Try it yourself, free, no account. The link is in the description.

RideCraft is a learning aid, not a licence. Follow the motorcycle’s own handbook. Wear a helmet. Practise only in a closed area, with a qualified instructor.

---

## Gemini TTS (pipeline / Charon)

Key at `~/.config/ridecraft/gemini_key`. **Never print the key.** Voice **Charon**. **One request per line.** Delivery is the bracketed tag at the start of each line — the model reads anything else aloud.

YouTube tag (every line):  
`[calm, slow, patient motorcycle instructor, close to the mic, plain, no excitement]`

Reels tag:  
`[clear, confident motorcycle instructor, a little brisk, warm, close to the mic]`  
Hinglish: add `Hindi` to that tag. Roman script in the transcript.

Parse the RIFF `data` chunk. Transcribe and retry if it speaks the tag or misses the line.

Count before you generate. This YouTube list is **44 lines**. Flash-TTS daily quota is tight.

### Shot A

Most people think starting a geared motorcycle is just pressing the button.

That’s only half the job.

Hear that? The engine is running. You are not moving.

Starting the engine, and moving off, are two different jobs.

Mix them up and the motorcycle jumps, stalls, or sits there shouting at you.

If you watched the last video, you already know the clutch is not an on-off switch.

This video is the order.

This is RideCraft. It’s a simulator, not a real motorcycle, and it is not a licence.

### Roadmap

In the next four minutes: get it running, get first without a jump, and move off.

### Shot B

On a real motorcycle, before any of this: helmet on, stands up, both feet down, and a quiet car park with an instructor, not a public road.

The handbook for your motorcycle wins if it differs.

Green N. Neutral.

If you parked in first, that’s a gentle half-lift, not a stomp.

Ignition on. Kill switch to RUN.

If that switch is off, nothing starts.

Clutch in. That’s a habit, in case a gear is still selected.

Then the starter. Press, engine fires, release.

Revs settle. Speed is still zero.

You have started the engine. You have not started riding.

### Shot C

Sit so you can see the road, not the lever.

Left hand on the clutch, right on the throttle, left toes on the gear lever.

Feet stay down until it rolls.

Clutch fully in, to the bar.

Then first. One press down.

You want a 1 on the dash, not a 2, and not N.

A little throttle. A quarter. Not a handful.

Too much and it lunges when the clutch takes up. Too little and it dies.

Now the part you practised last time. Ease to the bite.

It creeps. Engine still running. Hold it.

Then the rest of the way out, slowly, and you’re riding.

Once it is rolling, feet on the pegs, eyes up.

Snap the clutch, and it stalls or lunges.

A handful of throttle in the bite cooks the clutch and then jumps.

Looking down at the lever makes the steering wander.

Look where you want to go.

If the dash still says N, more throttle will not move you. Check 1.

### Shot D

Here it is from the seat. The careful version.

Neutral. Start. Clutch in. First. A little throttle. Ease to the bite. Then out.

That’s the whole start. Repeat it until it’s boring.

### Shot C2

Your drill: from a standstill, first gear, a little throttle, slow clutch, to walking pace, ten times.

When it creeps without a jerk, and the engine note only dips a little, that’s a good start.

### Recap + end

Neutral. Start. Clutch in. First. A little throttle. Bite. Out.

Try it yourself, free, no account. The link is in the description.

RideCraft is a learning aid, not a licence.

Follow the motorcycle’s own handbook.

Wear a helmet. Practise only in a closed area, with a qualified instructor.

---

## Common mistakes (say them; don’t re-teach Video 1)

| Mistake | What to show | One line |
|---------|--------------|----------|
| Start in gear, clutch out | Gear 1, starter, jump or refuse | Neutral first — or clutch in as backup |
| Engine on, still in N, lots of throttle | N, high revs, 0 km/h | Running is not moving |
| Clutch dumped | Stall / lurch | Same as video one — slow through the bite |
| Handful of throttle | High RPM, then jump | A quarter, not a handful |
| Eyes down | Lever in frame, road wandering | Look where you want to go |
| Wrong gear | Dash 2 or N | You want 1 |
| Feet up too early / panic at first roll | Optional; don’t over-act | Feet down until it rolls; the creep is supposed to happen |

Safety (spoken once at the end, always in the description): closed area, instructor, helmet, manufacturer’s handbook, not a public road, not a licence.

---

## Three Shorts (also: English + Hinglish of #1 for the reel pipeline)

9:16, 1080×1920, captions burned in, URL on the end frame. Covers from **raw** frames. `post-captions.txt` for IG/FB.

### Short 1 — Engine running ≠ moving (strongest hook)

- **Duration:** ~30 s
- **Hook (0–2 s):** Dash: N, revs up, 0 km/h. Text: **Engine on. Still stuck?**
- **Visual:** Rider throttle in N → cut to N + Start + clutch + 1 + bite + roll
- **English VO:** Hear that? Engine’s running. You’re not moving. Starting and moving off are two jobs. Neutral. Start. Clutch in. First. A little throttle. Bite. Out. Try it free on RideCraft.
- **Hinglish VO:** Engine chal raha hai. Bike nahi. Start karna aur move off karna do kaam hain. Neutral. Start. Clutch in. First. Thoda throttle. Bite. Phir out. RideCraft pe try karo — free.
- **CTA:** ridecraft.in

### Short 2 — Neutral before Start

- **Duration:** ~25 s
- **Hook:** Gear **1**, finger on Start. Text: **Don’t press Start yet**
- **Visual:** Starting sim: N light → clutch in → starter → idle
- **VO:** Many bikes sit in first when you park. Find the green N. Clutch in as a habit. Then Start. That’s how you start the engine — not the ride.
- **CTA:** ridecraft.in

### Short 3 — The seven-word start

- **Duration:** ~35–40 s
- **Hook:** Checklist slamming in. Text: **The whole start, seven words**
- **Visual:** Watch 0.5×, checklist ticks, stop before second
- **VO:** Neutral. Start. Clutch in. First. A little throttle. Bite. Out. Repeat it until it’s boring. Closed area. Instructor. Not the road.
- **CTA:** ridecraft.in

---

## YouTube copy (paste)

**Title**  
How to Start a Geared Motorcycle (the sequence, not the button)

**Description**

Starting the engine and moving off are two different jobs. This is the sequence: Neutral, Start, clutch in, first, a little throttle, bite, then out.

Video 1 was why new riders stall. This is how to start without guessing.

Try it on RideCraft (free, no account):  
https://www.ridecraft.in/simulators/cockpit?practice=start-and-move-off  
https://www.ridecraft.in/simulators/starting  
https://www.ridecraft.in/learn/riding-situations/starting-and-moving-off

RideCraft is a learning aid. It does not replace professional rider training or a licensed instructor. Always wear a helmet and protective gear, and follow your motorcycle’s handbook and local licence rules. Practise starting and moving off only in a closed area with a qualified instructor — not on a public road.

Voice generated with Gemini; teaching and riding simulation are RideCraft’s.

**Chapters** (shift after `pace.mjs`)  
0:00 Engine running is not moving  
0:18 Three steps  
0:28 Get it running  
0:55 First without a jump  
1:32 Move off  
1:55 Common mistakes  
2:20 From the seat  
3:05 The drill  
3:25 Recap  

**Tags**  
how to start a motorcycle, geared motorcycle, motorcycle for beginners, starting a bike, clutch first gear, RideCraft, motorcycle controls, move off in first, learn to ride India, bike start sequence

**Thumbnail (3–4 words)**  
Engine on. Still stuck?  
or: START is not GO

Split: left = rider dash **N**, revs up, 0 km/h; right = cluster **1** and the clutch at the bite. Orange kicker, no paragraph.

**First comment (pin it)**  
Sequence from the video: Neutral → Start → Clutch in → First → A little throttle → Bite → Out.  
Cockpit: https://www.ridecraft.in/simulators/cockpit?practice=start-and-move-off  
Starting trainer: https://www.ridecraft.in/simulators/starting  
Lesson: https://www.ridecraft.in/learn/riding-situations/starting-and-moving-off

---

## Edit notes

- Pipeline: copy `_pipeline/`, adapt `lines3.mjs` to the Gemini list above, don’t rewrite the stack.
- Fill the screen silent; drop Charon WAVs on the picture. No TTS while recording.
- Hard cuts between URLs. 0.3–0.4 s crossfade only when the *same* page changes view.
- Labels, never sentences: **N**, **1**, **A little**, **Bite**, **Out**.
- Watch: **stop before second**. This is not the gears video.
- Do not speed the bite hold or Watch. End card 8–10 s.
- Output: `~/Desktop/RideCraft videos/02 How to start a geared motorcycle/`  
  Reels: `~/Desktop/RideCraft videos/Reels - how to start/`
- Before recording: show narration lines, shot list, and reel scripts. **Wait for OK.**

---

## After this one

3. Gears — why first runs out of revs (`/simulators/gears`, cockpit `?practice=gears-drill`)  
4. Smooth stop — clutch in before idle dies (`?practice=stop-without-stalling` / brakes)  
5. Hill start (`?practice=uphill-start`)
