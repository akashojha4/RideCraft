import { G } from '@/lib/mechanics/braking'
import { fmt, goodBraking, kmh, ms, REACTION, ride, riding } from '@/lib/scenarios/sim'
import type { Actor, Frame, Outcome, Scenario } from '@/lib/scenarios/types'
import { LANE, MY_LANE, ONCOMING_LANE, framesFromRide, hold, slideFrames, straightRoad } from './helpers'

const base = { gear: 3, clutch: 0, throttle: 0, brake: 0, grade: 0, front: 0, rear: 0 }
const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t))

// ─── 1. Traffic signals ──────────────────────────────────────────────────────
const LINE = 45
const AMBER = 3
const signalAt = (t: number): Frame['signal'] => (t < 0 ? 'green' : t < AMBER ? 'amber' : 'red')
const crossCar = (t: number): Actor => {
  // Waits on the right until its light turns green, 1 s after yours turns red.
  const e = Math.max(0, t - (AMBER + 1))
  return { id: 'cross', kind: 'car', x: 9 - 1.25 * e * e, y: LINE + 2 + LANE * 1.5, heading: -90 }
}

export const trafficSignals: Scenario = {
  id: 'traffic-signals',
  number: 1,
  title: 'Traffic signals',
  summary: 'The light turns amber as you approach. Stop or go?',
  situation: `You are riding at 50 km/h towards a junction. The light turns amber when you are ${LINE} m from the stop line. Amber lasts ${AMBER} seconds before red; cross traffic gets green one second later.`,
  question: 'What do you do?',
  scene: straightRoad({ features: [{ type: 'stopLine', y: LINE, x0: -LANE, x1: 0 }, { type: 'crossRoad', y: LINE + 2 + LANE, width: LANE * 2 }, { type: 'signal', y: LINE, x: -LANE - 1 }] }),
  choices: [
    { id: 'stop', label: 'Close the throttle and brake progressively to stop at the line' },
    { id: 'go', label: 'Keep going at 50 km/h' },
    { id: 'accelerate', label: 'Accelerate hard to beat the red' },
  ],
  intro: framesFromRide(ride({ state: riding(50, 3), inputs: { ...base, throttle: 0.3 } }, (t) => (t > 2 ? 'end' : undefined)), { signal: (t) => (t < 1.9 ? 'green' : 'amber') }).map((f) => ({ ...f, t: f.t - 2, bike: { ...f.bike, y: f.bike.y - 27.8 }, actors: [crossCar(-1)] })),
  run(choice) {
    if (choice === 'stop') {
      let peak = 0
      const r = ride({ state: riding(50, 3), inputs: { ...base, throttle: 0.3 } }, (t, s) => {
        if (t < REACTION) return t > 0.3 ? { throttle: 0 } : {}
        if (s.speed < 0.01) return t > REACTION + 4 ? 'end' : { clutch: 1, brake: 0.15 }
        peak = Math.max(peak, -s.acceleration)
        const need = (s.speed * s.speed) / (2 * Math.max(0.4, LINE - 0.8 - s.distance))
        return { throttle: 0, clutch: s.speed < 4 ? 1 : 0, brake: Math.min(1, need / (0.8 * G)) }
      })
      const stopAt = r[r.length - 1].s.distance
      return {
        verdict: 'safe',
        rider: 'Rolls off the throttle, then squeezes the brakes progressively and pulls the clutch in just before stopping.',
        motorcycle: `Stops ${fmt(LINE - stopAt)} m before the line with a peak deceleration of ${fmt(peak / G, 2)} g — firm but comfortable.`,
        explanation: `At 50 km/h, ${LINE} m is plenty: a second to react covers about 14 m, leaving 31 m to stop at about 0.3 g. Amber means stop if you safely can — and here you can.`,
        consequence: 'Safe. You wait at the red; the cross traffic moves off in front of you.',
        metrics: [
          { label: 'Stopped before the line', value: `${fmt(LINE - stopAt)} m`, tone: 'ok' },
          { label: 'Peak deceleration', value: `${fmt(peak / G, 2)} g` },
          { label: 'Light when stopped', value: 'Red' },
        ],
        frames: framesFromRide(r, { signal: signalAt, actors: (t) => [crossCar(t)] }),
      }
    }
    const full = choice === 'accelerate'
    const r = ride({ state: riding(50, 3), inputs: { ...base, throttle: full ? 1 : 0.3 } }, (_t, s) => (s.distance > LINE + 30 ? 'end' : undefined))
    const atLine = r.find((x) => x.s.distance >= LINE)!
    const cleared = r.find((x) => x.s.distance >= LINE + 2 + LANE * 3 + 2)!
    const onRed = atLine.t > AMBER
    return {
      verdict: 'risky',
      rider: full ? 'Opens the throttle fully to make the light.' : 'Holds 50 km/h and carries on.',
      motorcycle: `Reaches the stop line after ${fmt(atLine.t, 2)} s at ${Math.round(kmh(atLine.s.speed))} km/h — ${onRed ? `${fmt(atLine.t - AMBER, 2)} s after the light turned red` : `${fmt(AMBER - atLine.t, 2)} s before red`} — and is still crossing the junction ${fmt(cleared.t - AMBER, 1)} s into the red.`,
      explanation: full
        ? `Accelerating turns a comfortable stop into a race: you arrive at ${Math.round(kmh(atLine.s.speed))} km/h, above the limit, and are still in the junction on red. Drivers waiting on the cross road are watching their own light, not you.`
        : `At 50 km/h the line is ${fmt(LINE / ms(50), 1)} s away — longer than the ${AMBER} s of amber. You enter on red and cross the junction just as the cross traffic is about to get green.`,
      consequence: 'Risky and illegal: no collision this time, but only because the cross driver was slow to move off.',
      metrics: [
        { label: 'At the line', value: `${fmt(atLine.t, 2)} s`, tone: onRed ? 'danger' : 'caution' },
        { label: 'Speed at the line', value: `${Math.round(kmh(atLine.s.speed))} km/h`, tone: full ? 'caution' : 'ink' },
        { label: 'Still in the junction on red', value: `${fmt(cleared.t - AMBER, 1)} s`, tone: 'danger' },
      ],
      frames: framesFromRide(r, { signal: signalAt, actors: (t) => [crossCar(t)] }),
    }
  },
  takeaway: 'Amber means stop if you safely can. Judge it by distance: if you can stop comfortably, stop.',
}

// ─── 2. Heavy traffic ────────────────────────────────────────────────────────
const TRUCK_LEN = 12
const LEFT_LANE = -LANE * 1.5
const RIGHT_LANE = -LANE / 2
const dualRoad = () => ({ ...straightRoad(), edges: [-LANE * 2, 0] as [number, number], dividers: [{ offset: -LANE, style: 'dashed' as const }] })
const truckX = (t: number, startAt: number) => LEFT_LANE + Math.min(LANE, Math.max(0, t - startAt) * 0.8)

function trafficRun(choice: string): Outcome {
  const v20 = ms(20)
  const LANE_CHANGE = 2
  if (choice === 'visible') {
    const truck = (t: number): Actor => ({ id: 'truck', kind: 'truck', x: truckX(t, LANE_CHANGE), y: 14 + TRUCK_LEN + v20 * t, heading: 0, indicator: t > LANE_CHANGE - 1 && t < LANE_CHANGE + 4.5 ? 'right' : null })
    const r = ride({ state: riding(20, 2), inputs: { ...base, gear: 2, throttle: 0.08 } }, (t) => (t > 8 ? 'end' : t > LANE_CHANGE + 0.8 && t < LANE_CHANGE + 2.5 ? { throttle: 0 } : { throttle: 0.08 }))
    const gap = Math.min(...r.map((x) => truck(x.t).y - TRUCK_LEN - x.s.distance))
    return {
      verdict: 'safe',
      rider: 'Hangs back about two seconds behind the truck, in a position where the driver’s mirror is visible — so the driver can see the motorcycle.',
      motorcycle: `When the truck signals and moves over, the rider simply rolls off a little; the gap never closes below ${fmt(gap)} m.`,
      explanation: 'If you can see a driver’s face in their mirror, they can see you. Two seconds of space gives you time to react to whatever the traffic ahead does.',
      consequence: 'Safe. The lane change happens in front of you, with room to spare.',
      metrics: [
        { label: 'Closest gap', value: `${fmt(gap)} m`, tone: 'ok' },
        { label: 'Time gap', value: `${fmt(gap / v20)} s` },
      ],
      frames: framesFromRide(r, { x: RIGHT_LANE, actors: (t) => [truck(t)] }),
    }
  }
  if (choice === 'blind') {
    // Alongside the cab: the truck's front is 3 m ahead of the motorcycle's front.
    const truck = (t: number): Actor => ({ id: 'truck', kind: 'truck', x: truckX(t, LANE_CHANGE), y: 3 + v20 * t, heading: 0, indicator: t > LANE_CHANGE - 0.4 && t < LANE_CHANGE + 4 ? 'right' : null })
    let contact: number | null = null
    const r = ride({ state: riding(20, 2), inputs: { ...base, gear: 2, throttle: 0.08 } }, (t, s) => {
      const tr = truck(t)
      if (contact === null && tr.x + 1.25 >= RIGHT_LANE - 0.4 && s.distance > tr.y - TRUCK_LEN - 1 && s.distance - 2 < tr.y) contact = t
      if (contact !== null) return 'end'
      return t < LANE_CHANGE + REACTION ? {} : goodBraking(t - LANE_CHANGE - REACTION)
    })
    const end = r[r.length - 1]
    const frames = framesFromRide(r, { x: RIGHT_LANE, actors: (t) => [truck(t)] })
    return {
      verdict: 'crash',
      rider: 'Rides alongside the truck’s cab, where its mirrors can’t see the motorcycle.',
      motorcycle: `The truck signals and moves over at 0.8 m/s. The rider sees it and brakes hard after ${REACTION} s${end.s.speed < 0.3 ? ' and stops' : ''}, but the 12 m truck is still alongside: ${end.s.speed < 0.3 ? 'its trailer sweeps into the stopped motorcycle' : `contact at ${Math.round(kmh(end.s.speed))} km/h`} ${fmt((contact ?? end.t) - LANE_CHANGE)} s after it started to move.`,
      explanation: 'Every large vehicle has blind spots beside the cab and right behind it. Braking can’t get a motorcycle out from alongside a 12 m vehicle in time — the only fix is never to sit there.',
      consequence: 'Crash: the truck pushes the motorcycle across the lane. Never ride in a large vehicle’s blind spot; pass it decisively or stay well behind.',
      metrics: [
        { label: 'Truck’s sideways speed', value: '0.8 m/s' },
        { label: 'Time to contact', value: `${fmt((contact ?? end.t) - LANE_CHANGE)} s`, tone: 'danger' },
        { label: 'Still alongside the truck', value: 'Yes', tone: 'danger' },
      ],
      frames: [...frames, ...slideFrames({ ...frames[frames.length - 1], bike: { ...frames[frames.length - 1].bike, heading: 25 } }, 6, (t) => [truck(t)], 1.5)],
    }
  }
  // Filtering at 50 km/h past 20 km/h traffic along the lane line.
  const FILTER_X = -LANE
  const truck = (t: number): Actor => ({ id: 'truck', kind: 'truck', x: truckX(t, 0), y: 11 + TRUCK_LEN + v20 * t, heading: 0, indicator: t < 3 ? 'right' : null })
  let contact: number | null = null
  const r = ride({ state: riding(50, 3), inputs: { ...base, throttle: 0.3 } }, (t, s) => {
    const tr = truck(t)
    if (contact === null && tr.x + 1.25 >= FILTER_X - 0.4 && s.distance >= tr.y - TRUCK_LEN) contact = t
    if (contact !== null) return 'end'
    return t < REACTION ? {} : goodBraking(t - REACTION)
  })
  const end = r[r.length - 1]
  const rel = kmh(end.s.speed) - 20
  const frames = framesFromRide(r, { x: FILTER_X, actors: (t) => [truck(t)] })
  return {
    verdict: 'crash',
    rider: 'Filters between the lanes at 50 km/h, 30 km/h faster than the traffic.',
    motorcycle: `The truck 11 m ahead pulls across without seeing the motorcycle. After a ${REACTION} s reaction the rider brakes hard, but at a closing speed of 30 km/h the gap is gone: impact at ${Math.round(Math.max(0, rel))} km/h faster than the truck.`,
    explanation: 'Drivers in slow traffic don’t expect a fast motorcycle between the lanes. At 30 km/h faster, one second of reaction eats 8 m of space. Where filtering is allowed, it is done slowly — no more than about 15 km/h faster than the traffic.',
    consequence: 'Crash into the side of the truck. Large speed differences leave no time to react.',
    metrics: [
      { label: 'Closing speed', value: '30 km/h', tone: 'danger' },
      { label: 'Gap when the truck moved', value: '11 m' },
      { label: 'Impact (relative)', value: `${Math.round(Math.max(0, rel))} km/h`, tone: 'danger' },
    ],
    frames: [...frames, ...slideFrames(frames[frames.length - 1], 7, (t) => [truck(t)], 1.2)],
  }
}

export const heavyTraffic: Scenario = {
  id: 'heavy-traffic',
  number: 2,
  title: 'Heavy traffic',
  summary: 'Slow, dense traffic and a truck in the next lane.',
  situation: 'Traffic is crawling at 20 km/h on a two-lane road, both lanes going your way. A 12 m truck is in the left lane, just ahead of you.',
  question: 'Where do you ride?',
  scene: dualRoad(),
  choices: [
    { id: 'blind', label: 'Alongside the truck’s cab, ready to pass' },
    { id: 'visible', label: 'Two seconds back, where you can see the driver’s mirror' },
    { id: 'filter', label: 'Filter between the lanes at 50 km/h' },
  ],
  intro: framesFromRide(ride({ state: riding(20, 2), inputs: { ...base, gear: 2, throttle: 0.08 } }, (t) => (t > 2 ? 'end' : undefined)), { x: RIGHT_LANE, actors: (t) => [{ id: 'truck', kind: 'truck', x: LEFT_LANE, y: 9 + TRUCK_LEN + ms(20) * t, heading: 0 }] }).map((f) => ({ ...f, t: f.t - 2 })),
  run: trafficRun,
  takeaway: 'Ride where drivers can see you, keep a two-second gap, and never linger in a large vehicle’s blind spot.',
}

// ─── 11. Overtaking ──────────────────────────────────────────────────────────
const ONCOMING = 420
const PASS_GAP = 15
export const overtaking: Scenario = {
  id: 'overtaking',
  number: 11,
  title: 'Overtaking',
  summary: 'A slow truck ahead, an oncoming car in the distance.',
  situation: `You are ${PASS_GAP} m behind a 12 m truck doing 40 km/h on a two-lane road, in fifth gear. An oncoming car is ${ONCOMING} m away, doing 60 km/h. To pass you need to get ${PASS_GAP} m clear in front of the truck before pulling back in.`,
  question: 'How do you handle it?',
  scene: straightRoad({}, 1200),
  choices: [
    { id: 'fifth', label: 'Pull out and accelerate in fifth' },
    { id: 'third', label: 'Change down to third, check mirror and blind spot, then pass' },
    { id: 'wait', label: 'Stay behind and wait for a longer gap' },
  ],
  intro: [],
  run(choice) {
    const v40 = ms(40)
    const truck = (t: number): Actor => ({ id: 'truck', kind: 'truck', x: MY_LANE, y: PASS_GAP + 2 + TRUCK_LEN + v40 * t, heading: 0 })
    const car = (t: number): Actor => ({ id: 'car', kind: 'car', x: ONCOMING_LANE, y: ONCOMING - ms(60) * t, heading: 180 })
    if (choice === 'wait') {
      const r = ride({ state: riding(40, 5), inputs: { ...base, gear: 5, throttle: 0.2 } }, (t) => (t > 12 ? 'end' : undefined))
      return {
        verdict: 'safe',
        rider: 'Stays two seconds behind the truck until the oncoming car has passed and the road ahead is clear.',
        motorcycle: 'Holds 40 km/h behind the truck. Patience costs a few seconds.',
        explanation: `Waiting is always safe. Here a pass was possible with the right gear — but if in doubt, don’t.`,
        consequence: 'Safe. Overtake later, in the right gear, when you can see a clear road well beyond what you need.',
        metrics: [{ label: 'Risk taken', value: 'None', tone: 'ok' }],
        frames: framesFromRide(r, { actors: (t) => [truck(t), car(t)] }),
      }
    }
    const gear = choice === 'third' ? 3 : 5
    let done: number | null = null
    let back: number | null = null
    const r = ride({ state: riding(40, gear), inputs: { ...base, gear, throttle: 1 } }, (t, s) => {
      if (done === null && s.distance >= truck(t).y + PASS_GAP) done = t
      if (done !== null && back === null && t > done + 1.2) back = t
      return back !== null ? 'end' : done !== null ? { throttle: 0.3 } : {}
    }, { duration: 25 })
    const passT = done ?? r[r.length - 1].t
    const passD = r.find((x) => x.t >= passT)!.s.distance
    const carAt = car(passT).y
    const margin = carAt - passD
    const closing = r.find((x) => x.t >= passT)!.s.speed + ms(60)
    const marginS = margin / closing
    const x = (t: number) => MY_LANE + (ONCOMING_LANE - MY_LANE) * (smooth(t / 1.5) - smooth((t - passT) / 1.2))
    const safe = marginS >= 2.5
    return {
      verdict: safe ? 'safe' : 'risky',
      rider: gear === 3 ? 'Changes down to third, checks the mirror and blind spot, pulls out and opens the throttle fully.' : 'Pulls out in fifth and opens the throttle fully.',
      motorcycle: `In ${gear === 3 ? 'third the engine pulls at about 5,000 RPM' : 'fifth the engine labours at 3,400 RPM'}: the pass takes ${fmt(passT)} s and ${Math.round(passD)} m. When the motorcycle is back in lane, the oncoming car is ${Math.round(margin)} m away — ${fmt(marginS)} s at the closing speed.`,
      explanation:
        gear === 3
          ? 'Third gear puts the engine near its torque peak, so the motorcycle gains on the truck quickly and spends the least time on the wrong side of the road.'
          : 'In fifth the engine is far below its power, so acceleration is feeble. The pass drags on while the oncoming car closes at more than 100 km/h.',
      consequence: safe ? `Safe: ${fmt(marginS)} s of margin left.` : `Risky: only ${fmt(marginS)} s from a head-on collision — the oncoming driver has to brake. Always choose the gear before you pull out.`,
      metrics: [
        { label: 'Time on the wrong side', value: `${fmt(passT + 1.2)} s` },
        { label: 'Distance to pass', value: `${Math.round(passD)} m` },
        { label: 'Margin to oncoming car', value: `${fmt(marginS)} s`, tone: safe ? 'ok' : 'danger' },
      ],
      frames: framesFromRide(r, { x, actors: (t) => [truck(t), car(t)] }),
    }
  },
  takeaway: 'Choose the gear before you pull out — the lower gear that gives strong acceleration — and only go if the road is clear well beyond what you need.',
}

// ─── 12. Highway riding ──────────────────────────────────────────────────────
const CAR_DECEL = 0.9 * G
export const highway: Scenario = {
  id: 'highway',
  number: 12,
  title: 'Highway riding',
  summary: 'The car ahead brakes hard at 80 km/h. Was your gap enough?',
  situation: 'You are following a car at 80 km/h on a dual carriageway. Without warning, it brakes as hard as it can (0.9 g — modern cars with ABS stop very quickly).',
  question: 'How far behind it were you riding?',
  scene: { ...straightRoad({}, 600), edges: [-LANE * 2, 0], dividers: [{ offset: -LANE, style: 'dashed' }] },
  choices: [
    { id: '1', label: 'One second (22 m)' },
    { id: '2', label: 'Two seconds (44 m)' },
    { id: '3', label: 'Three seconds (67 m)' },
  ],
  intro: [],
  run(choice) {
    const v = ms(80)
    const gapS = Number(choice)
    const gap = gapS * v
    const BRAKE_AT = 0.5
    const carPos = (t: number) => {
      const e = Math.max(0, t - BRAKE_AT)
      const stopT = v / CAR_DECEL
      const d = e < stopT ? v * e - 0.5 * CAR_DECEL * e * e : (v * v) / (2 * CAR_DECEL)
      return gap + 2 + v * Math.min(t, BRAKE_AT) + d
    }
    const carV = (t: number) => Math.max(0, v - CAR_DECEL * Math.max(0, t - BRAKE_AT))
    const car = (t: number): Actor => ({ id: 'car', kind: 'car', x: -LANE * 1.5, y: carPos(t) + 4.2, heading: 0, braking: t >= BRAKE_AT })
    let contact: { t: number; rel: number } | null = null
    const r = ride({ state: riding(80, 5), inputs: { ...base, gear: 5, throttle: 0.35 } }, (t, s) => {
      if (!contact && s.distance >= carPos(t)) contact = { t, rel: s.speed - carV(t) }
      if (contact || (t > BRAKE_AT + REACTION && s.speed < 0.01 && t > 5)) return 'end'
      return t < BRAKE_AT + REACTION ? {} : goodBraking(t - BRAKE_AT - REACTION)
    })
    const end = r[r.length - 1]
    const left = carPos(end.t) - end.s.distance
    const free = ride({ state: riding(80, 5), inputs: { ...base, gear: 5, throttle: 0.35 } }, (t, s) => (t > REACTION && s.speed < 0.01 ? 'end' : t < REACTION ? {} : goodBraking(t - REACTION)))
    const need = free[free.length - 1].s.distance
    const frames = framesFromRide(r, { x: -LANE * 1.5, actors: (t) => [car(t)] })
    const c = contact as { t: number; rel: number } | null
    return {
      verdict: c ? 'crash' : 'safe',
      rider: `Was riding ${gapS} second${gapS > 1 ? 's' : ''} behind. Sees the brake lights, reacts in ${REACTION} s and brakes hard with good technique.`,
      motorcycle: c
        ? `The car stops in ${Math.round((v * v) / (2 * CAR_DECEL))} m; the motorcycle needs about ${Math.round(need)} m including the reaction. It hits the car at ${Math.round(kmh(c.rel))} km/h.`
        : `The motorcycle stops ${fmt(left)} m behind the car.`,
      explanation: c
        ? 'During your reaction second the motorcycle covers 22 m at full speed while the car is already slowing. A car with ABS also out-brakes most motorcycles. A one-second gap is used up by reaction time alone.'
        : `The gap covers your reaction distance and the difference in braking. ${gapS === 2 ? 'Two seconds is the minimum on a dry road.' : 'Three seconds also gives margin for rain or a slower reaction.'}`,
      consequence: c ? `Crash: rear-end impact at ${Math.round(kmh(c.rel))} km/h.` : `Safe, with ${fmt(left)} m to spare.`,
      metrics: [
        { label: 'Gap', value: `${Math.round(gap)} m` },
        { label: 'Car stops in', value: `${Math.round((v * v) / (2 * CAR_DECEL))} m` },
        { label: c ? 'Impact speed' : 'Stopped short by', value: c ? `${Math.round(kmh(c.rel))} km/h` : `${fmt(left)} m`, tone: c ? 'danger' : 'ok' },
      ],
      frames: c ? [...frames, ...slideFrames(frames[frames.length - 1], 8, (t) => [car(t)], 1)] : hold(frames, 1, (t) => [car(t)]),
    }
  },
  takeaway: 'Keep at least two seconds behind — more in the wet, at night or when tired. Count it: “only a fool breaks the two-second rule”.',
}
