import { useMotionValue } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { RoadMotion, RoadTraffic } from '@/components/cockpit/RoadAhead'
import { clampingForce } from '@/lib/mechanics/clutch'
import type { CockpitSetup } from '@/content/scenarios/cockpit/types'
import { canRestart, initialPowertrain, type PowertrainInputs, type PowertrainState } from '@/lib/mechanics/powertrain'
import { AT_REST, setupState, type RunSnapshot } from '@/content/scenarios/cockpit/run'
import { bumpRide } from '@/lib/scenarios/sim'
import { suspension } from '@/lib/simulation/roadResponse'
import { behindGap, carGap, crossGap, initialWorld, oncomingGap, personGap, stepWorld, type SignalColour, type WorldPose, type WorldSpec, type WorldState } from '@/lib/simulation/cockpitWorld'
import { useCockpitControls } from './useCockpitControls'
import { usePowertrainSim } from './usePowertrainSim'

/*
 * The cockpit on the shared powertrain simulation: the rider's controls feed its inputs, and
 * everything the cockpit shows — the road, the instruments, the explanation — reads its one
 * state. The engine starts switched off; Start needs neutral or the clutch pulled in.
 */

/** Simulation inputs and state for a setup (shared with the scenario runner, so both start alike). */
function loadArgs(setup: CockpitSetup): [PowertrainInputs, Partial<PowertrainState>] {
  const { inputs, state } = setupState(setup)
  return [inputs, state]
}

function readTraffic(w: WorldState, d: number, spec?: WorldSpec): RoadTraffic {
  return {
    behindGap: behindGap(w, d),
    oncomingGap: oncomingGap(w, d),
    personGap: personGap(w, d),
    personX: w.personX,
    personKind: w.personKind,
    crossGap: crossGap(spec, d),
    crossX: w.crossX,
    carX: w.carX,
    carKind: w.carKind,
  }
}

/** How the last speed breaker was met: entry speed, the jolt felt, fork travel used (m, of 0.11) and how much braking had already used. */
export interface BumpCrossing {
  kmh: number
  peakG: number
  travelUsed: number
  preload: number
  airborne: boolean
  bottomed: boolean
}

/** `initial`: how the motorcycle is found (default: engine off in neutral); `initialWorld`: what is on the road. */
export function useCockpitSim(initial: CockpitSetup = { gear: 0, running: false }, initialWorldSpec?: WorldSpec) {
  const sim = usePowertrainSim(AT_REST)
  const { state, inputs, load, replaceState, onStep, clock } = sim
  const { play, pause } = clock
  const [notice, setNotice] = useState<string | null>(null)

  const controls = useCockpitControls({
    initialGear: initial.gear,
    initialAxes: { throttle: initial.throttle ?? 0, rear: initial.rear ?? 0, clutch: initial.clutch ?? 0 },
    canShift: () => (state.current.running && clampingForce(inputs.current.clutch) > 0 ? 'Pull the clutch in fully to change gear.' : null),
  })
  const { axes, gear, steer } = controls
  // The guided step the learner is on, for a world that waits for them (set by the page or the demonstration).
  const stage = useRef<number | undefined>(undefined)
  const setStage = useCallback((n: number | undefined) => {
    stage.current = n
  }, [])
  // The handlebar, read by the world on every step.
  const steering = useRef(0)
  useEffect(() => {
    steering.current = steer
  }, [steer])

  // While a demonstration rides, it sets the inputs itself and the controls only show them.
  const driven = useRef(false)
  const setDriven = useCallback((on: boolean) => {
    driven.current = on
  }, [])

  // A scenario that waits for the rider holds the clock until a control moves from where it was found.
  const waiting = useRef<{ clutch: number; throttle: number; front: number; rear: number; gear: number } | null>(null)
  const holdFor = useCallback(
    (setup: CockpitSetup) => {
      waiting.current = setup.paused ? { clutch: setup.clutch ?? 0, throttle: setup.throttle ?? 0, front: 0, rear: setup.rear ?? 0, gear: setup.gear } : null
      if (setup.paused) pause()
      else play()
    },
    [play, pause],
  )

  // The motorcycle as found: by default engine off in neutral.
  const [first] = useState(initial)
  useEffect(() => {
    load(...loadArgs(first))
    holdFor(first)
  }, [load, first, holdFor])

  // The rider's controls are the simulation's inputs.
  useEffect(() => {
    if (driven.current) return
    sim.setInputs({ clutch: axes.clutch, throttle: axes.throttle, front: axes.front, rear: axes.rear, gear })
    const w = waiting.current
    if (w && (w.clutch !== axes.clutch || w.throttle !== axes.throttle || w.front !== axes.front || w.rear !== axes.rear || w.gear !== gear)) {
      waiting.current = null
      play()
    }
  }, [axes, gear, sim.setInputs]) // eslint-disable-line react-hooks/exhaustive-deps

  // The road follows the distance actually ridden.
  const distance = useMotionValue(0)
  const heading = useMotionValue(0)
  useEffect(() => onStep((s) => distance.set(s.distance)), [onStep, distance])

  // When the rider last changed down (simulation time), for the road-response explanation.
  const lastDownshift = useMotionValue(-Infinity)
  const prevGear = useRef(0)
  useEffect(
    () =>
      onStep((_s, t) => {
        const g = inputs.current.gear
        if (g > 0 && g < prevGear.current) lastDownshift.set(t)
        prevGear.current = g
      }),
    [onStep, inputs, lastDownshift],
  )
  // What is on the road: stepped with the motorcycle, read by steps and mistake checks.
  const [startWorld] = useState(() => initialWorld(initialWorldSpec))
  const worldSpec = useRef<WorldSpec | undefined>(initialWorldSpec)
  const world = useRef<WorldState>(startWorld)
  const [spec, setSpec] = useState<WorldSpec | undefined>(initialWorldSpec)
  const gap = useMotionValue<number | null>(carGap(startWorld, 0))
  const pose = useMotionValue<WorldPose | null>(startWorld.pose)
  const traffic = useMotionValue<RoadTraffic>(readTraffic(startWorld, 0, initialWorldSpec))
  const [signal, setSignal] = useState<SignalColour | null>(startWorld.signal)
  const lastT = useRef(0)
  const lastDistance = useRef(0)
  // The last speed breaker crossing, judged by the quarter-car model at the speed and fork dive it was met with.
  const [crossing, setCrossing] = useState<BumpCrossing | null>(null)
  useEffect(
    () =>
      onStep((s, t) => {
        const dt = Math.max(0, t - lastT.current)
        lastT.current = t
        const bump = worldSpec.current?.bump
        if (bump && lastDistance.current < bump.at && s.distance >= bump.at) {
          const preload = Math.max(0, suspension(s).dive) / 1000
          const r = bumpRide(Math.max(0.5, s.speed), { start: 1, length: bump.length, height: bump.height }, { preload })
          setCrossing({ kmh: s.speed * 3.6, peakG: r.peakG, travelUsed: r.travelUsed, preload, airborne: r.airborne, bottomed: r.bottomed })
        }
        lastDistance.current = s.distance
        const w = stepWorld(worldSpec.current, world.current, Math.min(dt, 0.1), s.distance, { speed: s.speed, steer: steering.current, gear: inputs.current.gear, clutch: inputs.current.clutch, stage: stage.current })
        world.current = w
        gap.set(carGap(w, s.distance))
        traffic.set(readTraffic(w, s.distance, worldSpec.current))
        pose.set(w.pose)
        heading.set(w.pose ? w.pose.heading : (worldSpec.current?.curvature ?? 0) * s.distance)
        if (w.signal !== signal) setSignal(w.signal)
      }),
    [onStep, gap, signal, pose, traffic, heading, inputs],
  )
  const getWorld = useCallback(() => world.current, [])
  const road: RoadMotion = { distance, heading, time: clock.time, carGap: gap, pose, traffic }

  const start = useCallback(() => {
    controls.touch()
    if (waiting.current) {
      waiting.current = null
      play()
    }
    if (state.current.running) return
    if (!canRestart(inputs.current)) return setNotice('To start the engine, select neutral or pull the clutch in fully.')
    setNotice(null)
    replaceState((s) => initialPowertrain({ speed: s.speed, distance: s.distance }))
  }, [state, inputs, replaceState, controls, play])

  const stop = useCallback(() => {
    controls.touch()
    setNotice(null)
    replaceState((s) => ({ ...s, running: false, stallCause: null }))
  }, [replaceState, controls])

  /**
   * Back to the start of the road: by default engine off in neutral; a scenario can find the
   * motorcycle in a gear, with the engine running, or already rolling.
   */
  const reset = useCallback((setup: CockpitSetup = { gear: 0, running: false }, spec?: WorldSpec) => {
    setNotice(null)
    controls.reset(setup.gear, { throttle: setup.throttle ?? 0, rear: setup.rear ?? 0, clutch: setup.clutch ?? 0 })
    load(...loadArgs(setup))
    worldSpec.current = spec
    setSpec(spec)
    world.current = initialWorld(spec)
    lastDistance.current = 0
    setCrossing(null)
    gap.set(carGap(world.current, 0))
    pose.set(world.current.pose)
    traffic.set(readTraffic(world.current, 0, spec))
    heading.set(0)
    setSignal(world.current.signal)
    distance.set(0)
    lastDownshift.set(-Infinity)
    holdFor(setup)
  }, [controls, load, distance, lastDownshift, holdFor, gap, pose, traffic, heading])

  /** Put the motorcycle, its controls and the road back where a run was (playback jumping to a step). */
  const restore = useCallback(
    (snap: RunSnapshot) => {
      setNotice(null)
      controls.reset(snap.inputs.gear, { clutch: snap.inputs.clutch, throttle: snap.inputs.throttle, front: snap.inputs.front ?? 0, rear: snap.inputs.rear ?? 0 })
      controls.setSteer(snap.steer === 0 ? 0 : snap.steer > 0 ? 1 : -1)
      load(snap.inputs, snap.state)
      // A copy, so the run goes on from the snapshot without changing it (Replay starts clean).
      world.current = { ...snap.world, mem: { ...snap.world.mem } }
      waiting.current = null
      lastT.current = clock.time.get()
      gap.set(carGap(snap.world, snap.state.distance))
      pose.set(snap.world.pose)
      traffic.set(readTraffic(snap.world, snap.state.distance, worldSpec.current))
      heading.set(snap.world.pose ? snap.world.pose.heading : (worldSpec.current?.curvature ?? 0) * snap.state.distance)
      setSignal(snap.world.signal)
      distance.set(snap.state.distance)
      lastDistance.current = snap.state.distance
    },
    [controls, load, gap, pose, traffic, heading, distance, clock.time],
  )

  return { sim, controls, road, notice, start, stop, reset, restore, setStage, setDriven, lastDownshift, signal, getWorld, worldSpec: spec, crossing }
}

export type CockpitSim = ReturnType<typeof useCockpitSim>
