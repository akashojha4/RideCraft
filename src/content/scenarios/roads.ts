import { G, STATIC_FRONT, frontShare } from '@/lib/mechanics/braking'
import { MASS, type PowertrainInputs } from '@/lib/mechanics/powertrain'
import { bumpRide, fmt, kmh, ms, ride, riding, swerve } from '@/lib/scenarios/sim'
import type { Actor, Frame, Scenario, SideScene } from '@/lib/scenarios/types'
import { MY_LANE, ONCOMING_LANE, framesFromRide, hold, slideFrames, straightRoad } from './helpers'

const base = { gear: 3, clutch: 0, throttle: 0, brake: 0, grade: 0, front: 0, rear: 0 }

// ─── 3. Uphill starts ────────────────────────────────────────────────────────
const HILL = 0.12
const CAR_BEHIND = -3.6
const hillScene: SideScene = { view: 'side', profile: (d) => HILL * d, from: -12, to: 30, labels: [{ d: 8, text: '12 % climb' }] }
const carBehind = (): Actor => ({ id: 'car', kind: 'car', x: 0, y: CAR_BEHIND, heading: 0 })

const hillScripts: Record<string, (t: number) => Partial<PowertrainInputs>> = {
  release: (t) => (t < 0.5 ? {} : { rear: 0, throttle: t > 1.2 ? 0.25 : 0, clutch: t < 1.5 ? 1 : Math.max(0, 1 - (t - 1.5) / 2) }),
  dump: (t) => (t < 0.5 ? { throttle: Math.min(0.7, t * 2) } : { rear: 0, throttle: 0.7, clutch: 0 }),
  correct: (t) => {
    if (t < 0.6) return { throttle: Math.min(0.35, t) }
    // Biting point at 30 % of lever travel (about 10 % of the clamp load, clutch.ts).
    if (t < 1.6) return { throttle: 0.35, clutch: 1 - (t - 0.6) * 0.7 }
    if (t < 2.2) return { throttle: 0.35, clutch: 0.3, rear: Math.max(0, 0.4 - (t - 1.6)) }
    return { rear: 0, throttle: 0.4, clutch: Math.max(0, 0.3 - (t - 2.2) * 0.2) }
  },
}

export const uphillStart: Scenario = {
  id: 'uphill-start',
  number: 3,
  title: 'Uphill starts',
  summary: 'Stopped on a steep hill, with a car right behind you.',
  situation: 'You are stopped at a junction on a 12 % hill, in first gear, holding the motorcycle on the rear brake with the clutch pulled in. A car has stopped 2 m behind you. The way ahead is clear.',
  question: 'How do you pull away?',
  scene: hillScene,
  choices: [
    { id: 'release', label: 'Let go of the brake, then let the clutch out' },
    { id: 'dump', label: 'Rev hard and let the clutch out quickly' },
    { id: 'correct', label: 'Hold the rear brake, find the biting point with some throttle, then release the brake' },
  ],
  intro: [],
  run(choice) {
    let minD = 0
    let stalled = false
    let felt = 0
    let peak = 0
    let hit: number | null = null
    const r = ride({ inputs: { ...base, gear: 1, clutch: 1, grade: HILL, rear: 0.4 } }, (t, s) => {
      minD = Math.min(minD, s.distance)
      if (!s.running) stalled = true
      felt += (s.acceleration - felt) * 0.08
      peak = Math.max(peak, felt)
      if (hit === null && s.distance - 1.6 <= CAR_BEHIND) hit = t
      if (t > 6 || hit !== null) return 'end'
      return hillScripts[choice](t)
    }, { duration: 7 })
    const end = r[r.length - 1]
    const frames = framesFromRide(r, { x: 0, actors: () => [carBehind()], pose: (_t, x) => ({ z: HILL * x.s.distance, lean: (-x.s.loadAccel / G) * 3 }) })
    if (choice === 'release') {
      return {
        verdict: 'crash',
        rider: 'Lets go of the rear brake first, then starts letting the clutch out.',
        motorcycle: `With nothing holding it, gravity pulls the 225 kg motorcycle back down the hill. It rolls back ${fmt(-minD)} m before the clutch can bite${stalled ? ' — and then the engine stalls under the load' : ''}.`,
        explanation: `On a 12 % hill gravity pulls back with about ${Math.round(MASS * G * Math.sin(Math.atan(HILL)))} N. Something has to hold the motorcycle until the clutch takes over: the brake, released only once the clutch is already pulling.`,
        consequence: `Crash: the motorcycle rolls into the car behind${hit !== null ? '' : ' (2 m away)'}.`,
        metrics: [
          { label: 'Roll-back', value: `${fmt(-minD)} m`, tone: 'danger' },
          { label: 'Engine', value: stalled ? 'Stalled' : 'Running', tone: stalled ? 'danger' : 'ink' },
        ],
        frames: hold(frames, 0.8),
      }
    }
    if (choice === 'dump') {
      return {
        verdict: 'risky',
        rider: 'Revs the engine hard, releases the brake and drops the clutch.',
        motorcycle: `The clutch bites violently: the motorcycle lurches forward at up to ${fmt(peak)} m/s² and reaches ${Math.round(kmh(end.s.speed))} km/h in a few metres. No roll-back — but the front lifts and the rear tyre is near its grip limit.`,
        explanation: 'High revs and a sudden clutch release put all the engine’s spinning energy into the wheel at once. On a hill, with load already on the rear, the motorcycle lurches — on a more powerful motorcycle the front can even lift.',
        consequence: 'Risky: you get away, but out of control for a moment — straight into a junction.',
        metrics: [
          { label: 'Peak acceleration', value: `${fmt(peak)} m/s²`, tone: 'danger' },
          { label: 'Roll-back', value: `${fmt(-minD * 100, 0)} cm`, tone: 'ok' },
        ],
        frames: hold(frames, 0.6),
      }
    }
    return {
      verdict: 'safe',
      rider: 'Keeps the rear brake on, sets about a third of the throttle, eases the clutch to the biting point until the motorcycle pulls against the brake — then releases the brake and keeps easing the clutch out.',
      motorcycle: `The clutch is already carrying the load when the brake lets go: roll-back ${fmt(-minD * 100, 0)} cm, smooth acceleration (peak ${fmt(peak)} m/s²).`,
      explanation: 'The brake holds the motorcycle while the clutch builds up drive. Only when the clutch is pulling does the brake come off — so gravity never gets a chance.',
      consequence: 'Safe: a clean hill start.',
      metrics: [
        { label: 'Roll-back', value: `${fmt(-minD * 100, 0)} cm`, tone: 'ok' },
        { label: 'Peak acceleration', value: `${fmt(peak)} m/s²` },
      ],
      frames: hold(frames, 0.6),
    }
  },
  takeaway: 'On a hill, the brake holds the motorcycle until the clutch is pulling — never let go of the brake first.',
}

// ─── 4. Downhill riding ──────────────────────────────────────────────────────
const DESCENT = 0.1
const LENGTH = 3000
const DISC_MASS = 1.8
const STEEL_C = 460
export const downhill: Scenario = {
  id: 'downhill',
  number: 4,
  title: 'Downhill riding',
  summary: 'A 3 km descent at 10 %. How do you keep your speed down?',
  situation: 'A mountain road descends 10 % for 3 km, with bends all the way and a hairpin at the bottom. You want to hold about 40 km/h.',
  question: 'How do you ride it?',
  scene: { view: 'side', profile: (d) => -DESCENT * d, from: -10, to: 80, labels: [{ d: 20, text: '10 % descent' }] },
  choices: [
    { id: 'fifth', label: 'Stay in fifth and hold the speed with the brakes' },
    { id: 'third', label: 'Change down to third and let the engine hold you back' },
    { id: 'neutral', label: 'Coast in neutral and brake when needed' },
  ],
  intro: [],
  run(choice) {
    const gear = choice === 'third' ? 3 : choice === 'fifth' ? 5 : 0
    // Without brakes, how hard does the motorcycle accelerate at 40 km/h in this gear?
    const probe = ride({ state: riding(40, gear || 3), inputs: { ...base, gear, clutch: gear ? 0 : 1, grade: -DESCENT } }, (t) => (t > 0.5 ? 'end' : undefined))
    const accel = Math.max(0, (probe[probe.length - 1].s.speed - probe[0].s.speed) / probe[probe.length - 1].t)
    const brakeForce = accel * MASS
    const energy = brakeForce * LENGTH
    const rise = energy / (DISC_MASS * STEEL_C)
    const share = brakeForce / (MASS * G * Math.sin(Math.atan(DESCENT)))
    const r = ride({ state: riding(40, gear || 3), inputs: { ...base, gear, clutch: gear ? 0 : 1, grade: -DESCENT } }, (t) => (t > 6 ? 'end' : { brake: brakeForce / (0.8 * MASS * G) }))
    const frames = framesFromRide(r, { x: 0, pose: (_t, x) => ({ z: -DESCENT * x.s.distance, braking: brakeForce > 5 }) })
    const verdict = rise > 400 ? 'crash' : rise > 150 ? 'risky' : 'safe'
    return {
      verdict,
      rider: gear === 3 ? 'Changes down to third and closes the throttle.' : gear === 5 ? 'Stays in fifth, throttle closed, dragging the brakes.' : 'Pulls the clutch in (neutral) and uses the brakes.',
      motorcycle: `${gear === 3 ? `In third at about 5,000 RPM the engine’s resistance alone holds 40 km/h — the brakes are needed only for the bends.` : `The brakes must hold back ${Math.round(brakeForce)} N continuously — ${Math.round(share * 100)} % of gravity’s pull down the slope.`} Over 3 km that is ${Math.round(energy / 1000)} kJ of heat, enough to raise the brake discs ${Math.round(rise)} °C if none escaped.`,
      explanation:
        gear === 3
          ? 'Engine braking turns the descent’s energy into heat inside the engine, which is built to handle it. The brakes stay cool and ready for the hairpin.'
          : `Brake discs and pads lose grip as they overheat (“fade”) — typically above about 300–400 °C. ${gear === 0 ? 'In neutral there is no engine braking at all, and no drive available if you need to accelerate out of trouble.' : 'In fifth the engine turns too slowly to help much.'} Some heat escapes into the air, but on a long descent much of it builds up.`,
      consequence: verdict === 'crash' ? 'Crash risk: the brakes fade before the hairpin, and the lever comes back to the bar with little effect.' : verdict === 'risky' ? 'Risky: hot brakes have less in reserve for the hairpin.' : 'Safe: cool brakes and full control at the bottom.',
      metrics: [
        { label: 'Brakes must hold', value: `${Math.round(brakeForce)} N`, tone: brakeForce > 100 ? 'danger' : brakeForce > 20 ? 'caution' : 'ok' },
        { label: 'Heat over 3 km', value: `${Math.round(energy / 1000)} kJ` },
        { label: 'Disc temperature rise (no cooling)', value: `${Math.round(rise)} °C`, tone: rise > 400 ? 'danger' : rise > 150 ? 'caution' : 'ok' },
      ],
      frames,
    }
  },
  takeaway: 'Go down a hill in the gear you would use to go up it: let the engine hold your speed and save the brakes for when you need them.',
}

// ─── 5. Speed breakers ───────────────────────────────────────────────────────
const BUMP = { start: 20, length: 3.7, height: 0.1 }
const bumpProfile = (d: number) => (d < BUMP.start || d > BUMP.start + BUMP.length ? 0 : BUMP.height * Math.sin((Math.PI * (d - BUMP.start)) / BUMP.length))
export const speedBreaker: Scenario = {
  id: 'speed-breaker',
  number: 5,
  title: 'Speed breakers',
  summary: 'A 10 cm speed breaker across the road.',
  situation: 'A speed breaker 10 cm high and 3.7 m long crosses the road ahead. You are riding at 40 km/h.',
  question: 'How do you cross it?',
  scene: { view: 'side', profile: bumpProfile, from: -5, to: 45, span: 22, exaggerate: 5, labels: [{ d: BUMP.start + 1.8, text: 'speed breaker' }] },
  choices: [
    { id: 'fast', label: 'Ride over at 40 km/h' },
    { id: 'brakeOn', label: 'Brake late and keep braking hard as you go over it (30 km/h)' },
    { id: 'slow', label: 'Slow to 15 km/h before it, release the brakes, cross with weight on the footpegs' },
  ],
  intro: [],
  run(choice) {
    const kmhOver = choice === 'fast' ? 40 : choice === 'brakeOn' ? 30 : 15
    const v = ms(kmhOver)
    // Braking at 0.6 g moves load onto the front, which pre-compresses the fork (14 kN/m).
    const brakeG = choice === 'brakeOn' ? 0.6 : 0
    const preload = (MASS * G * (frontShare(-brakeG * G) - STATIC_FRONT)) / 14000
    const b = bumpRide(v, { start: 3, length: BUMP.length, height: BUMP.height }, { preload })
    const frontLoadShare = frontShare(-brakeG * G)
    const brakeDemand = brakeG * MASS * G * frontLoadShare
    const gripLeft = 0.9 * MASS * G * frontLoadShare * b.minLoad
    const locks = brakeG > 0 && brakeDemand > gripLeft
    const frames: Frame[] = []
    for (let t = 0; t <= (BUMP.start + BUMP.length + 10) / v; t += 1 / 30) {
      const y = v * t
      const tr = b.trace.find((q) => q.x >= y - (BUMP.start - 3)) ?? b.trace[b.trace.length - 1]
      frames.push({ t, bike: { x: 0, y, z: bumpProfile(y) + (y > BUMP.start - 3 ? tr.body : 0), heading: 0, lean: 0, v, braking: brakeG > 0, squash: tr.comp }, actors: [] })
    }
    const verdict = locks ? 'crash' : b.airborne || b.peakG > 1.2 ? 'risky' : 'safe'
    const pre = verdict === 'crash' ? frames.filter((f) => f.bike.y < BUMP.start + BUMP.length * 0.6) : frames
    return {
      verdict,
      rider: choice === 'fast' ? 'Rides straight over without slowing.' : choice === 'brakeOn' ? 'Arrives too fast and brakes hard all the way over the bump.' : 'Brakes before the bump down to walking-plus pace, releases the brakes just before it, and lets the suspension work.',
      motorcycle: `At ${kmhOver} km/h the front suspension uses ${Math.round(b.travelUsed * 1000)} mm of its 110 mm travel, the rider feels up to ${fmt(b.peakG, 2)} g, and the front tyre’s load drops to ${Math.round(b.minLoad * 100)} % of normal${b.airborne ? ' — the wheel leaves the road' : ''}.${locks ? ` The braking force asked of the front tyre (${Math.round(brakeDemand)} N) is more than the lightly loaded tyre can grip (${Math.round(gripLeft)} N): it locks.` : ''}`,
      explanation:
        choice === 'slow'
          ? 'At low speed the suspension has time to follow the bump, so the wheel stays loaded and the jolt is mild. Releasing the brakes lets the fork extend to absorb the bump instead of starting it half compressed.'
          : choice === 'fast'
            ? 'At speed the bump arrives faster than the suspension can respond. The wheel is thrown upward and leaves the road on the far side — no grip for steering or braking while it is in the air.'
            : 'Braking compresses the fork before the bump even arrives, leaving less travel, and as the wheel goes over the top it is suddenly unloaded. A tyre with little load can’t take a hard braking force — it locks.',
      consequence: verdict === 'crash' ? 'Crash: the front wheel locks as it goes over the top, and the motorcycle goes down.' : verdict === 'risky' ? 'Risky: a hard jolt, a moment with no front grip, and possible damage to wheels and suspension.' : 'Safe and comfortable.',
      metrics: [
        { label: 'Peak jolt', value: `${fmt(b.peakG, 2)} g`, tone: b.peakG > 1.2 ? 'danger' : b.peakG > 0.8 ? 'caution' : 'ok' },
        { label: 'Lowest front-tyre load', value: `${Math.round(b.minLoad * 100)} %`, tone: b.minLoad < 0.3 ? 'danger' : 'ok' },
        { label: 'Fork travel used', value: `${Math.round(b.travelUsed * 1000)} mm` },
      ],
      frames: verdict === 'crash' ? [...pre, ...slideFrames({ ...pre[pre.length - 1], bike: { ...pre[pre.length - 1].bike, lean: 0 } }, 6, () => [], 1.2)] : frames,
    }
  },
  takeaway: 'Slow down before a speed breaker, get off the brakes before you reach it, and let the suspension do its job.',
}

// ─── 6. Potholes ─────────────────────────────────────────────────────────────
const HOLE = { x: MY_LANE, y: 40, r: 0.45 }
export const pothole: Scenario = {
  id: 'pothole',
  number: 6,
  title: 'Potholes',
  summary: 'A deep pothole in your wheel track, 40 m ahead.',
  situation: 'Riding at 50 km/h, you spot a deep pothole 40 m ahead, right where your wheels will go. There is room in your lane to pass it on the right; oncoming traffic is in the other lane.',
  question: 'What do you do?',
  scene: straightRoad({ features: [{ type: 'pothole', ...HOLE }] }),
  choices: [
    { id: 'late', label: 'Keep going and swerve round it at the last moment' },
    { id: 'brake', label: 'Brake hard as you reach it' },
    { id: 'early', label: 'Check your mirror and move smoothly to the right of it, early' },
  ],
  intro: [],
  run(choice) {
    const v = ms(50)
    const car = (t: number): Actor => ({ id: 'car', kind: 'car', x: ONCOMING_LANE, y: 120 - ms(50) * t, heading: 180 })
    if (choice === 'brake') {
      const r = ride({ state: riding(50, 3), inputs: { ...base, throttle: 0.3 } }, (t, s) => (s.distance > HOLE.y + 3 || (s.speed < 0.01 && t > 1) ? 'end' : s.distance < 30 ? {} : { clutch: 1, throttle: 0, rear: 0.12, front: 0.62 }))
      const at = r.find((x) => x.s.distance >= HOLE.y - HOLE.r)
      const vHit = at ? at.s.speed : 0
      const frames = framesFromRide(r, { actors: (t) => [car(t)] })
      return {
        verdict: 'risky',
        rider: 'Rides on, then brakes hard 10 m before the pothole and is still braking as the front wheel drops in.',
        motorcycle: `10 m is too short to stop: the front wheel hits the pothole at ${Math.round(kmh(vHit))} km/h with the fork already compressed by braking, so it bottoms out against the far edge.`,
        explanation: 'Braking pitches the motorcycle forward and compresses the fork, using up the travel it needs to absorb the hole. Hitting a pothole on the brakes is harsher than hitting it rolling.',
        consequence: 'Risky: a bent rim or burst tyre is likely, and the jolt can knock the handlebar out of your hands.',
        metrics: [
          { label: 'Speed into the pothole', value: `${Math.round(kmh(vHit))} km/h`, tone: 'danger' },
          { label: 'Fork', value: 'Compressed by braking', tone: 'caution' },
        ],
        frames: hold(frames, 0.6),
      }
    }
    const early = choice === 'early'
    const sw = swerve(v, early ? { startAt: 12 / v, lean: 8, hold: 0.9, side: 1, urgency: 3 } : { startAt: 33 / v, lean: 25, hold: 0.4, side: 1, urgency: 6 }, 5)
    const at = sw.find((q) => q.y >= HOLE.y)!
    const clearance = at.x - (HOLE.r + 0.06)
    const hits = clearance < 0
    const maxLean = Math.max(...sw.map((q) => Math.abs(q.lean)))
    const frames: Frame[] = sw.map((q) => ({ t: q.t, bike: { x: MY_LANE + q.x, y: q.y, heading: q.heading, lean: q.lean, v }, actors: [car(q.t)] }))
    return {
      verdict: hits ? 'risky' : 'safe',
      rider: early ? 'Checks the mirror, then presses the right handlebar gently to drift across the lane, well before the pothole.' : 'Rides on, then swerves hard 7 m before the pothole.',
      motorcycle: early
        ? `A gentle ${Math.round(maxLean)}° lean moves the motorcycle ${fmt(at.x)} m right by the time it reaches the pothole — clear of it by ${fmt(clearance)} m, and still inside the lane.`
        : `Even with a hard countersteer (up to ${Math.round(maxLean)}° of lean), 7 m is too little room: the motorcycle has moved only ${fmt(Math.max(0, at.x) * 100, 0)} cm when the front wheel reaches the pothole, and it hits the edge leaned over.`,
      explanation: early
        ? 'Seen early, a hazard needs only a small, smooth change of line. Looking well ahead buys the time to make it.'
        : 'A motorcycle has to lean before it can change direction, and that takes time. A last-moment swerve hits the hole anyway — leaned over, which is worse — and lurches you towards the centre line.',
      consequence: hits ? 'Risky: hitting a pothole leaned over can tuck the front and throw you off line towards oncoming traffic.' : 'Safe: past the pothole smoothly.',
      metrics: [
        { label: 'Sideways move at the pothole', value: `${fmt(Math.max(0, at.x))} m`, tone: hits ? 'danger' : 'ok' },
        { label: 'Peak lean', value: `${Math.round(maxLean)}°` },
        { label: 'Clearance', value: hits ? 'Hit it' : `${fmt(clearance)} m`, tone: hits ? 'danger' : 'ok' },
      ],
      frames,
    }
  },
  takeaway: 'Scan well ahead. Seen early, a pothole needs only a small, smooth change of line; if you must hit one, get off the brakes and roll over it upright.',
}

