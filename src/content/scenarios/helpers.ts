import type { Actor, BikePose, Frame, TopScene } from '@/lib/scenarios/types'
import type { RideSample } from '@/lib/scenarios/sim'

/*
 * Building blocks for scenario content. Scenarios are drawn for left-hand traffic (as in
 * India and the UK): your lane is left of the centre line. The physics is the same anywhere.
 */

export const LANE = 3.5
/** Centre of your lane and of the oncoming lane on a two-lane road, m. */
export const MY_LANE = -LANE / 2
export const ONCOMING_LANE = LANE / 2

export function straightRoad(extra: Partial<TopScene> = {}, length = 900): TopScene {
  return {
    view: 'top',
    road: [
      { x: 0, y: -60 },
      { x: 0, y: length },
    ],
    edges: [-LANE, LANE],
    dividers: [{ offset: 0, style: 'dashed' }],
    ...extra,
  }
}

/** A braking or riding run as animation frames, in a straight lane. */
export function framesFromRide(
  samples: RideSample[],
  {
    x = MY_LANE,
    actors = () => [],
    signal,
    caption,
    pose,
  }: {
    x?: number | ((t: number) => number)
    actors?: (t: number, bike: BikePose) => Actor[]
    signal?: (t: number) => Frame['signal']
    caption?: (t: number, s: RideSample) => string | undefined
    pose?: (t: number, s: RideSample) => Partial<BikePose>
  } = {},
): Frame[] {
  return samples.map((r) => {
    const { s, inputs } = r
    const bike: BikePose = {
      x: typeof x === 'number' ? x : x(r.t),
      y: s.distance,
      heading: 0,
      lean: 0,
      v: s.speed,
      braking: (inputs.front ?? 0) + (inputs.rear ?? 0) + inputs.brake > 0.01,
      ...pose?.(r.t, r),
    }
    return { t: r.t, bike, actors: actors(r.t, bike), signal: signal?.(r.t), caption: caption?.(r.t, r) }
  })
}

/** Frames after a slide or fall: the motorcycle slides on along its heading, slowing at `decel`. */
export function slideFrames(from: Frame, decel: number, actors: (t: number) => Actor[] = () => [], seconds = 2.5): Frame[] {
  const out: Frame[] = []
  const h = (from.bike.heading * Math.PI) / 180
  let v = from.bike.v
  let x = from.bike.x
  let y = from.bike.y
  const dt = 1 / 30
  for (let t = dt; t <= seconds; t += dt) {
    v = Math.max(0, v - decel * dt)
    x += Math.sin(h) * v * dt
    y += Math.cos(h) * v * dt
    out.push({ t: from.t + t, bike: { ...from.bike, x, y, v, down: true, lean: Math.sign(from.bike.lean || 1) * 75, braking: false }, actors: actors(from.t + t) })
  }
  return out
}

/** Hold the last frame for a moment so the outcome can be seen. */
export function hold(frames: Frame[], seconds = 1.2, actors?: (t: number) => Actor[]): Frame[] {
  const last = frames[frames.length - 1]
  const out = [...frames]
  for (let t = 1 / 30; t <= seconds; t += 1 / 30) out.push({ ...last, t: last.t + t, bike: { ...last.bike, v: 0 }, actors: actors ? actors(last.t + t) : last.actors })
  return out
}

/** Speed at which the motorcycle reaches distance `d` in a run (0 if it stopped before). */
export function speedAt(samples: RideSample[], d: number) {
  const hit = samples.find((r) => r.s.distance >= d)
  return hit ? hit.s.speed : 0
}
