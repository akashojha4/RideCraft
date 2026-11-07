import { useEffect, useRef, useState } from 'react'
import { createRideAudio, gearDir, type RideAudio } from '@/lib/audio/rideAudio'
import type { PowertrainInputs, PowertrainState } from '@/lib/mechanics/powertrain'
import type { PowertrainDerived } from '@/lib/simulation/models/powertrain'

const MUTE_KEY = 'ridecraft:cockpit-muted'

/** The learner's last choice, remembered on this device (if storage is available). */
function savedMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

interface SoundSim {
  onStep: (fn: (s: PowertrainState, t: number) => void) => () => void
  inputs: { current: PowertrainInputs }
  model: { derive: (s: PowertrainState, i: PowertrainInputs) => PowertrainDerived }
}

/**
 * Plays the cockpit's sounds from the simulation: the starter and the engine note follow the
 * revs, the twist grip has an intake hiss, each brake has its own sound, and the gear lever
 * clicks — higher on an upshift, a heavier clunk on a downshift. Sound stays off until the
 * first click or key press, which is when the browser allows it.
 */
export function useRideSounds(sim: SoundSim, { hush = false }: { hush?: boolean } = {}) {
  const [muted, setMutedState] = useState(savedMuted)
  const [audible, setAudible] = useState(false)
  const audio = useRef<RideAudio | null>(null)
  const { onStep, inputs, model } = sim

  useEffect(() => {
    const a = createRideAudio()
    a.setMuted(savedMuted())
    audio.current = a
    const unlock = () => {
      a.unlock()
      setAudible(a.running)
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      a.dispose()
      audio.current = null
    }
  }, [])

  useEffect(() => {
    audio.current?.setHushed(hush)
  }, [hush])

  const setMuted = (next: boolean) => {
    setMutedState(next)
    audio.current?.setMuted(next)
    audio.current?.unlock()
    setAudible(!next && (audio.current?.running ?? false))
    try {
      localStorage.setItem(MUTE_KEY, next ? '1' : '0')
    } catch {
      // Not remembered; the button still works.
    }
  }

  useEffect(
    () => {
        const prev = { running: false, gear: 0, front: 0, rear: 0, primed: false }
      return onStep((s) => {
        const a = audio.current
        if (!a) return
        const i = inputs.current
        const front = i.front ?? 0
        const rear = i.rear ?? 0
        if (prev.primed) {
          if (!prev.running && s.running) a.engineStart()
          if (prev.running && !s.running) a.engineStop(!!s.stallCause)
          if (i.gear !== prev.gear) a.gear(gearDir(prev.gear, i.gear))
          if (prev.front < 0.15 && front >= 0.15) a.brakeTap('front')
          if (prev.rear < 0.15 && rear >= 0.15) a.brakeTap('rear')
        }
        a.engineRpm(model.derive(s, i).engineRpm, s.running)
        a.throttle(i.throttle)
        a.brakes(front, rear, s.speed)
        prev.running = s.running
        prev.gear = i.gear
        prev.front = front
        prev.rear = rear
        prev.primed = true
      })
    },
    [onStep, inputs, model],
  )

  return { muted, audible, setMuted }
}
