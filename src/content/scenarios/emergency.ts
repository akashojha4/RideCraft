import { G } from '@/lib/mechanics/braking'
import { lateralG } from '@/lib/mechanics/cornering'
import { fmt, goodBraking, kmh, ms, REACTION, ride, riding, swerve } from '@/lib/scenarios/sim'
import type { Actor, Frame, Scenario } from '@/lib/scenarios/types'
import { LANE, MY_LANE, framesFromRide, hold, slideFrames, speedAt, straightRoad } from './helpers'

const base = { gear: 3, clutch: 0, throttle: 0, brake: 0, grade: 0, front: 0, rear: 0 }

// ─── 9. Emergency braking ────────────────────────────────────────────────────
const CAR_Y = 32
const carOut = (t: number): Actor => ({ id: 'car', kind: 'car', x: Math.min(1.2, -7 + 5.5 * Math.min(1, t / 1.5) * 1.5), y: CAR_Y + 0.9, heading: 90 })
export const emergencyBraking: Scenario = {
  id: 'emergency-braking',
  number: 9,
  title: 'Emergency braking',
  summary: 'A car pulls out and stops across your lane.',
  situation: `Riding at 50 km/h, a car pulls out of a side road on your left and stops across your lane, ${CAR_Y} m ahead. There is no room to go round it.`,
  question: 'How do you brake?',
  scene: straightRoad({ features: [{ type: 'crossRoad', y: CAR_Y + 0.9, width: LANE * 2 }] }),
  choices: [
    { id: 'grab', label: 'Grab the front brake as hard as you can' },
    { id: 'rear', label: 'Stamp on the rear brake' },
    { id: 'both', label: 'Pull the clutch in and use both brakes — a little rear, front squeezed on progressively' },
  ],
  intro: [],
  run(choice) {
    const nearEdge = CAR_Y
    let lockAt: { t: number; wheel: string } | null = null
    let impact: number | null = null
    const r = ride({ state: riding(50, 3), inputs: { ...base, throttle: 0.3 } }, (t, s) => {
      if (!lockAt && s.brakes.front.locked) lockAt = { t, wheel: 'front' }
      if (!lockAt && s.brakes.rear.locked) lockAt = { t, wheel: 'rear' }
      if (impact === null && s.distance >= nearEdge) impact = t
      if (impact !== null || (t > REACTION && s.speed < 0.01)) return 'end'
      if (choice === 'grab' && lockAt && t > lockAt.t + 0.25) return 'end'
      if (t < REACTION) return {}
      const e = t - REACTION
      return choice === 'grab' ? { throttle: 0, clutch: 1, front: 1 } : choice === 'rear' ? { throttle: 0, rear: 1 } : goodBraking(e)
    })
    const end = r[r.length - 1]
    const frames = framesFromRide(r, { actors: (t) => [carOut(t)] })
    const lk = lockAt as { t: number; wheel: string } | null
    if (choice === 'grab') {
      const fall = slideFrames({ ...frames[frames.length - 1], bike: { ...frames[frames.length - 1].bike, lean: -1 } }, 0.6 * G, (t) => [carOut(t)], 2)
      const reaches = fall.some((f) => f.bike.y >= nearEdge)
      return {
        verdict: 'crash',
        rider: 'Grabs the front brake lever fully, in a fraction of a second.',
        motorcycle: `The front wheel locks ${fmt((lk?.t ?? REACTION) - REACTION, 2)} s after the grab, at ${Math.round(kmh(end.s.speed))} km/h — before the weight has moved onto the front tyre. With the front sliding, the motorcycle can’t stay upright: it falls and slides${reaches ? ' into the car' : ''}.`,
        explanation: 'A grabbed front brake asks for full force before the load transfer has given the front tyre its extra grip. A locked front wheel can’t steer, so it can’t balance the motorcycle.',
        consequence: `Crash: a front-wheel lock and a fall${reaches ? ', sliding into the car' : ''}. With ABS the brakes would have held just below locking.`,
        metrics: [
          { label: 'Front wheel', value: 'Locked', tone: 'danger' },
          { label: 'Speed when it locked', value: `${Math.round(kmh(end.s.speed))} km/h`, tone: 'danger' },
        ],
        frames: [...frames, ...fall],
      }
    }
    if (choice === 'rear') {
      const vHit = speedAt(r, nearEdge)
      return {
        verdict: 'crash',
        rider: 'Stamps on the rear brake pedal.',
        motorcycle: `The rear wheel locks (${lk?.wheel === 'rear' ? 'skid marks' : 'it slides'}) and the engine stalls with it. The rear tyre alone can only slow the motorcycle at about a third of a g: it reaches the car at ${Math.round(kmh(vHit))} km/h.`,
        explanation: 'Braking moves the weight forward, leaving little on the rear tyre. The rear brake alone can’t stop a motorcycle quickly — the front brake provides most of the stopping power.',
        consequence: `Crash into the side of the car at ${Math.round(kmh(vHit))} km/h.`,
        metrics: [
          { label: 'Rear wheel', value: 'Locked', tone: 'danger' },
          { label: 'Impact speed', value: `${Math.round(kmh(vHit))} km/h`, tone: 'danger' },
        ],
        frames: [...frames, ...slideFrames(frames[frames.length - 1], 7, (t) => [carOut(t)], 0.6)],
      }
    }
    const left = nearEdge - end.s.distance
    const ok = impact === null
    return {
      verdict: ok ? 'safe' : 'crash',
      rider: 'Closes the throttle, pulls the clutch in, presses the rear brake lightly and squeezes the front brake on hard over half a second.',
      motorcycle: ok ? `No wheel locks. The motorcycle stops in ${fmt(end.s.distance)} m (${fmt(ms(50) * REACTION)} m of that during the reaction second) — ${fmt(left)} m short of the car.` : `Stops too late, reaching the car at ${Math.round(kmh(end.s.speed))} km/h.`,
      explanation: 'Squeezing progressively lets the weight move onto the front tyre as the braking builds, so its grip grows with the demand. The rear adds a little, and the clutch keeps the engine from stalling.',
      consequence: ok ? `Safe: stopped with ${fmt(left)} m to spare.` : 'Crash.',
      metrics: [
        { label: 'Stopping distance', value: `${fmt(end.s.distance)} m` },
        { label: 'Reaction distance', value: `${fmt(ms(50) * REACTION)} m` },
        { label: 'Margin to the car', value: `${fmt(left)} m`, tone: ok ? 'ok' : 'danger' },
      ],
      frames: hold(frames, 1, (t) => [carOut(t)]),
    }
  },
  takeaway: 'In an emergency stop: clutch in, a little rear, and squeeze the front firmly but progressively. Practise it — and if your motorcycle has ABS, brake hard and let it work.',
}

// ─── 10. Sudden obstacles ────────────────────────────────────────────────────
const DOG_Y = 26
const dog = (): Actor => ({ id: 'dog', kind: 'dog', x: MY_LANE, y: DOG_Y + 0.4, heading: 90 })
const CLEAR = 0.4 + 0.3 + 0.2
export const suddenObstacle: Scenario = {
  id: 'sudden-obstacle',
  number: 10,
  title: 'Sudden obstacles',
  summary: 'A dog runs out and freezes in your lane.',
  situation: `Riding at 50 km/h, a dog runs out from the left and freezes in the middle of your lane, ${DOG_Y} m ahead. The other lane is clear — no oncoming traffic.`,
  question: 'What do you do?',
  scene: straightRoad(),
  choices: [
    { id: 'brake', label: 'Brake as hard as you can, in a straight line' },
    { id: 'swerve', label: 'Press the right handlebar firmly to swerve round it, then straighten up' },
    { id: 'both', label: 'Brake hard and swerve at the same time' },
  ],
  intro: [],
  run(choice) {
    const v = ms(50)
    if (choice === 'brake') {
      let impact: number | null = null
      const r = ride({ state: riding(50, 3), inputs: { ...base, throttle: 0.3 } }, (t, s) => {
        if (impact === null && s.distance >= DOG_Y) impact = t
        if (impact !== null || (t > REACTION && s.speed < 0.01)) return 'end'
        return t < REACTION ? {} : goodBraking(t - REACTION)
      })
      const vHit = impact !== null ? r[r.length - 1].s.speed : 0
      const free = ride({ state: riding(50, 3), inputs: { ...base, throttle: 0.3 } }, (t, s) => (t > REACTION && s.speed < 0.01 ? 'end' : t < REACTION ? {} : goodBraking(t - REACTION)))
      const need = free[free.length - 1].s.distance
      const frames = framesFromRide(r, { actors: () => [dog()] })
      return {
        verdict: vHit > 0 ? 'crash' : 'safe',
        rider: 'Reacts in a second, then brakes hard with good technique.',
        motorcycle: vHit > 0 ? `The reaction second uses ${fmt(v * REACTION)} m, leaving ${fmt(DOG_Y - v * REACTION)} m to brake — not enough. The motorcycle hits the dog at ${Math.round(kmh(vHit))} km/h.` : 'Stops just short of the dog.',
        explanation: `From 50 km/h the motorcycle needs about ${Math.round(need)} m to stop, including the reaction. The dog is ${DOG_Y} m away. Braking still helped: hitting at ${Math.round(kmh(vHit))} km/h is much better than at 50 km/h.`,
        consequence: vHit > 0 ? `Crash: hitting an animal at ${Math.round(kmh(vHit))} km/h can easily bring a motorcycle down.` : 'Safe.',
        metrics: [
          { label: 'Distance needed to stop', value: `${fmt(need)} m` },
          { label: 'Distance available', value: `${DOG_Y} m` },
          { label: 'Impact speed', value: vHit > 0 ? `${Math.round(kmh(vHit))} km/h` : '—', tone: vHit > 0 ? 'danger' : 'ok' },
        ],
        frames: vHit > 0 ? [...frames, ...slideFrames(frames[frames.length - 1], 7, () => [dog()], 0.8)] : hold(frames, 1, () => [dog()]),
      }
    }
    const sw = swerve(v, { startAt: REACTION, lean: 30, hold: 0.5, side: 1, urgency: 7 }, 4.5)
    const at = sw.find((q) => q.y >= DOG_Y)!
    const maxLean = Math.max(...sw.map((q) => Math.abs(q.lean)))
    if (choice === 'both') {
      // Braking hard (0.8 g) while leaning: the combined demand leaves the friction circle once the lean builds.
      const BRAKE = 0.8
      const demandAt = (lean: number) => Math.hypot(lateralG(Math.abs(lean)), BRAKE)
      const slideAt = sw.find((q) => demandAt(q.lean) > 0.9)!
      const peakDemand = demandAt(maxLean)
      const frames: Frame[] = sw.filter((q) => q.t <= slideAt.t).map((q) => ({ t: q.t, bike: { x: MY_LANE + q.x, y: q.y, heading: q.heading, lean: q.lean, v, braking: q.t > REACTION }, actors: [dog()] }))
      return {
        verdict: 'crash',
        rider: 'Brakes hard and pushes the handlebar to swerve at the same moment.',
        motorcycle: `Hard braking (0.8 g) already uses most of the grip. As the swerve leans the motorcycle past ${Math.round(Math.abs(slideAt.lean))}°, braking plus turning asks for more than the 0.9 g the road can give — the full swerve would need ${fmt(peakDemand, 2)} g. The front tyre slides.`,
        explanation: 'Braking and turning share one budget of grip (the friction circle). Hard braking uses almost all of it, leaving nothing for a swerve. Do one, then the other — never both at full strength.',
        consequence: 'Crash: the front washes out mid-swerve.',
        metrics: [
          { label: 'Grip the swerve needs', value: `${fmt(peakDemand, 2)} g`, tone: 'danger' },
          { label: 'Grip available', value: '0.90 g' },
        ],
        frames: [...frames, ...slideFrames(frames[frames.length - 1], 0.7 * G, () => [dog()], 1.5)],
      }
    }
    const clear = at.x - CLEAR
    const frames: Frame[] = sw.map((q) => ({ t: q.t, bike: { x: MY_LANE + q.x, y: q.y, heading: q.heading, lean: q.lean, v }, actors: [dog()] }))
    return {
      verdict: clear >= 0 ? 'safe' : 'crash',
      rider: 'Reacts in a second, then presses the right handlebar firmly forward, looking at the gap — not at the dog — and presses the left bar to straighten up.',
      motorcycle: `The countersteer leans the motorcycle up to ${Math.round(maxLean)}° in a fraction of a second. By the time it reaches the dog it has moved ${fmt(at.x)} m to the right — ${clear >= 0 ? `clearing it by ${fmt(clear)} m` : 'not quite enough'}.`,
      explanation: 'With 26 m there isn’t room to stop, but a swerve needs only to move the motorcycle about a metre sideways. A firm countersteer does that quickly — and with the other lane clear, it is the better choice here.',
      consequence: clear >= 0 ? 'Safe: round the dog and back into lane.' : 'Crash.',
      metrics: [
        { label: 'Sideways move at the dog', value: `${fmt(at.x)} m`, tone: clear >= 0 ? 'ok' : 'danger' },
        { label: 'Needed', value: `${fmt(CLEAR)} m` },
        { label: 'Peak lean', value: `${Math.round(maxLean)}°` },
      ],
      frames,
    }
  },
  takeaway: 'Brake or swerve — not both at full strength. If you can’t stop in time and there is space, a firm countersteer swerve, eyes on the gap, gets you round.',
}
