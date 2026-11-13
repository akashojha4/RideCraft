# Video 3 (Short) — Six motorcycles, six riding positions

A **vertical Short / Reel, 55 seconds at most, never over 60.** It covers one page, one idea and one payoff. You're not on camera; it's just RideCraft and the voice.

There's no long YouTube version of this topic. It's a quick, shareable explainer that points people to the lesson.

**The one idea:** the seat, the footpegs and the handlebar (the rider triangle) decide how you sit. Change those three points and you get a different kind of motorcycle.

**Title to publish (Shorts / Reels):** Every motorcycle type in 50 seconds

**Backup titles:**
- Why a sports bike makes you lean forward
- Which motorcycle should you learn on?

---

## Claude Code: paste this as the TOPIC block in `~/Desktop/RideCraft videos/VIDEO_PROMPT.md`

- **Script file:** `docs/youtube/03-types-of-motorcycles-short.md`
- **Topic / title idea:** Six motorcycle types, explained by the rider triangle
- **The one mistake beginners make:** picking a first motorcycle by its looks (a sports bike or a tall adventure bike) instead of by riding position and whether their feet reach the ground
- **Simulators / pages to film:** `http://localhost:5173/learn/basics/types-of-motorcycles`. Only the "motorcycle-types" diagram (the type picker), cropped to the figure.
- **Target length:** **Short / Reel only, 50–55 s, hard maximum 60 s.** No long YouTube video for this topic. Make an English and a Hinglish version.
- **Anything special:**
  - Use the reel half of the pipeline only: `reel-lines.mjs`, `record-reel.mjs`, `compose-reel.mjs`, `cover-reel.mjs`, `endcard-reel.html`.
  - If the voice runs long, cut words, not speed. Don't go above 1.1×.
  - Don't change site code. Don't commit, push or deploy.
  - Record on localhost only.
  - Show me the narration lines, shot list and cover first, then wait for my OK.

Reuse `~/Desktop/RideCraft videos/_pipeline/`. Quality reference: `~/Desktop/RideCraft videos/Reels - why you stall/`.

---

## The 60-second budget

| Part | Time | Running total |
|---|---|---|
| Hook | 0:00–0:04 | 4 s |
| The rider triangle | 0:04–0:10 | 10 s |
| Six types, about 5.5 s each | 0:10–0:44 | 44 s |
| Learner tip | 0:44–0:50 | 50 s |
| CTA and end frame | 0:50–0:55 | **55 s** |

The voice is about **125 words**, which is roughly 46 s at the brisk reel delivery, plus pauses. If the assembled file is **over 58 s**, drop the brand names from the Adventure and Off-road lines first, then shorten the hook. Never cut the learner tip.

---

## What's on the page (use these, don't invent others)

The lesson's diagram has one button per type. Clicking a type redraws the motorcycle and the rider, and draws the dashed orange **rider triangle** (Bars · Seat · Pegs, or "Floorboard" on the scooter). The rider's posture is calculated from those three points, not drawn by hand.

Readouts under the picker, as checked on localhost:

| Type | Posture readout | Controls | Kinds listed (example models) |
|---|---|---|---|
| Standard / commuter | Upright (14°) | Geared | Commuter (Splendor, Shine, Platina) · Naked / street (Pulsar, Apache, Duke) · Retro / roadster (Classic 350, Hunter 350) |
| Sport | Leaning forward (46°) | Geared | Supersport (R15, RC 390) · Sport-tourer (Ninja 650) · Café racer (Continental GT 650) |
| Cruiser | Leaning back (−11°) | Geared | Classic cruiser (Meteor 350) · Bobber (Jawa Perak) · Touring cruiser (Super Meteor 650) |
| Adventure / dual-sport | Upright (12°) | Geared | Dual-sport (Xpulse 200) · Adventure tourer (Himalayan, 390 Adventure) · Big adventure |
| Off-road | Upright (13°) | Geared | Motocross · Enduro · Trials · Supermoto |
| Scooter | Upright (5°) | **Usually automatic** | Scooter (Activa, Jupiter) · Maxi-scooter (Burgman Street) · Electric (Ather 450, iQube) · Moped (XL100) |

Always say "think R15" or "like a Splendor", meaning the kind of bike. Never say "buy" or "best bike".

---

## Before you press record

1. Use the dev server on **localhost:5173**, never www.ridecraft.in (GA4 would count the visit).
2. **Vertical capture:**
   - Use a phone-shaped viewport, 432×768 at device scale 2.5, which gives a 1080×1920 frame.
   - At that width the figure stacks: the diagram on top, the picker buttons, the readouts, the "Kinds of …" cards, then the caption.
   - Scroll so the **diagram and the posture readout** fill the upper two-thirds. The lower third is kept for burned-in captions.
3. Click each type with a **0.4 s hold** before the voice line starts, so the redraw lands first.
4. Keep RideCraft's look: dark charcoal and orange, no 3D, no stock footage, no redesign. Highlight one thing at a time.
5. Leave site code alone. Any extra label or zoom goes in `compose-reel.mjs`, not in React.

---

## Shot list (one URL, one take, clicks timed to the lines)

**URL:** `http://localhost:5173/learn/basics/types-of-motorcycles`. Scroll to the type picker.

| # | Time | Click / camera | On-screen label (one at a time) |
|---|---|---|---|
| 1 | 0:00 | Start on **Sport**, punch in on the rider leaning forward | **Why do they all sit differently?** |
| 2 | 0:04 | Click **Standard**. Zoom on the dashed triangle, then pulse the Bars, Seat and Pegs dots one after another | **Rider triangle** |
| 3 | 0:10 | Standard stays. Show the "Kinds of" cards for 1 s | **Standard · upright** |
| 4 | 0:16 | **Sport**. Rider tips forward | **Sport · leans forward** |
| 5 | 0:21 | **Cruiser**. Feet go forward | **Cruiser · leans back** |
| 6 | 0:27 | **Adventure / dual-sport**. Tall wheels | **Adventure · tall** |
| 7 | 0:32 | **Off-road** | **Off-road · stand on the pegs** |
| 8 | 0:38 | **Scooter**. Punch in on the orange "Usually automatic" readout | **Scooter · no clutch** |
| 9 | 0:44 | Back to **Standard**, wide | **Learn on: light + upright + feet down** |
| 10 | 0:50 | End frame (`endcard-reel.html`): logo, `ridecraft.in/learn/basics/types-of-motorcycles` | **Try it free** · small: *Learning aid, not a licence* |

**Transitions:** no cuts are needed, because the page redraws itself. Use one 0.3 s crossfade into the end frame.

**Cover:** take it from the raw frame of shot 4 (Sport, leaning forward), with "**6 bikes. 6 positions.**" in orange and white.

---

## Spoken script (English)

Delivery tag on every line: `[clear, confident motorcycle instructor, a little brisk, warm, close to the mic]`

1. Every motorcycle puts your body in a different shape. Here’s why.
2. Three points decide it: the seat, the pegs and the bars. Riders call it the rider triangle.
3. Standard. Everything in the middle, so you sit upright. Splendor, Pulsar, Classic 350.
4. Sport. Bars down, pegs back. You lean forward, weight on your wrists. Think R15.
5. Cruiser. Low seat, feet forward. You lean back. Think Meteor.
6. Adventure. Tall and upright, built for bad roads. Himalayan, Xpulse.
7. Off-road. Light and tall. You often stand on the pegs. Mostly not road legal.
8. Scooter. Feet on a floorboard, and usually no clutch and no gears.
9. To learn, pick light and upright, with both feet on the ground. A standard does that best.
10. Try the picker yourself, free, on RideCraft.

That's **10 lines and about 125 words.**

## Spoken script (Hinglish, Roman script for the captions)

Delivery tag on every line: `[clear, confident motorcycle instructor, a little brisk, warm, close to the mic, Hindi]`

1. Har motorcycle aapki body ko alag shape mein bithati hai. Kyun?
2. Teen points decide karte hain: seat, pegs aur handlebar. Isko rider triangle kehte hain.
3. Standard. Sab kuch beech mein, toh aap seedha baithte ho. Splendor, Pulsar, Classic 350.
4. Sport. Bar neeche, pegs peeche. Aap aage jhukte ho, wrists pe weight. Jaise R15.
5. Cruiser. Seat neechi, pair aage. Aap peeche jhukte ho. Jaise Meteor.
6. Adventure. Oonchi aur seedhi, kharab roads ke liye. Himalayan, Xpulse.
7. Off-road. Halki aur oonchi. Aksar pegs pe khade hoke chalate hain. Zyada tar road legal nahi.
8. Scooter. Pair floorboard pe, aur usually na clutch, na gear.
9. Seekhne ke liye halki, seedhi bike lo, jisme dono pair zameen pe aayein. Standard sabse aasaan hai.
10. Khud try karo, free, RideCraft pe.

---

## Gemini TTS

- Key at `~/.config/ridecraft/gemini_key`. **Never print it.**
- Voice **Charon**, one request per line, bracketed tag at the start.
- Parse the RIFF `data` chunk.
- Transcribe every clip and retry if it speaks the tag or misses words. Brand names especially (Xpulse, Meteor, R15) must come out right.
- **20 requests in total** (10 English and 10 Hinglish), plus retries. Count the quota before you start.

---

## Captions and post copy

**Burned-in captions:**
- At most 2 lines, bottom third, white text with the key word in orange.
- Hinglish in Roman script.
- The type name is always the orange word: **Standard**, **Sport**, **Cruiser**…

**YouTube Shorts title:** Every motorcycle type in 50 seconds #shorts

**Description / Instagram / Facebook caption:**

Why does a sports bike make you lean forward and a cruiser make you lean back? Three points: the seat, the pegs and the bars. That's the rider triangle.

Standard · Sport · Cruiser · Adventure · Off-road · Scooter

Learning? Pick light and upright, with both feet on the ground.

Try the picker free (no account): https://www.ridecraft.in/learn/basics/types-of-motorcycles

RideCraft is a learning aid, not a licence. Wear a helmet and learn with a qualified instructor.

**Hashtags:** #motorcycle #bike #biketypes #learntoride #motorcycleforbeginners #ridersofindia #sportbike #cruiser #adventurebike #scooter #RideCraft

**Pinned comment:** Which one do you ride? 👇 Standard · Sport · Cruiser · Adventure · Off-road · Scooter

---

## Edit notes

- **Hard cap: 60 s.** Check the final duration before export (`ffprobe`). Aim for 50–55 s.
- Don't speed the voice past 1.1×. If it's too long, cut words.
- Hold each type for at least 0.4 s before its line, so the viewer sees the posture change before hearing about it.
- Use one label at a time and no sentences on screen apart from captions.
- The disclaimer goes on the end frame (small) and in the description. There's no spoken safety line, to save time.
- **Output:** `~/Desktop/RideCraft videos/Reels - types of motorcycles/`:
  - `ridecraft-short-types-english.mp4`
  - `ridecraft-short-types-hinglish.mp4`
  - two covers
  - `post-captions.txt`
- **Before recording,** show the narration lines, shot list and cover, then **wait for OK**.
