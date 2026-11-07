/*
 * The cockpit's sounds, synthesised in the browser so there are no audio files to load.
 * A single-cylinder idle and a starter whir, a click for the gear lever (higher on an upshift,
 * a heavier clunk on a downshift), an intake hiss that follows the throttle, and a different
 * noise for each brake. Everything is quiet until the learner's first click or key, which
 * is when the browser allows sound.
 */

/** Rank gears so N sits between first and second (1-N-2-3…). */
const gearRank = (g: number) => (g === 0 ? 1.5 : g === 1 ? 1 : g)

/** Whether this change is a lift (up) or a press (down) on a standard 1-N-2 pattern. */
export function gearDir(from: number, to: number): 'up' | 'down' {
  return gearRank(to) >= gearRank(from) ? 'up' : 'down'
}

/** Fundamental of the engine tone, Hz. Rises with rpm and stays in a range a speaker can play. */
export function engineTone(rpm: number): number {
  return 34 + Math.min(11000, Math.max(0, rpm)) * 0.017
}

export interface RideAudio {
  /** Resume after a click or key press. */
  unlock(): void
  /** Whether the browser is actually playing sound. */
  get running(): boolean
  setMuted(muted: boolean): void
  /** Silence everything without changing the learner's mute choice (Watch just finished). */
  setHushed(hushed: boolean): void
  engineStart(): void
  engineStop(stall: boolean): void
  /** Pitch of the running engine. Silent when `running` is false. */
  engineRpm(rpm: number, running: boolean): void
  /** Intake hiss that follows how far the twist grip is open, 0–1. */
  throttle(open: number): void
  /** Continuous brake noise while moving: pressure 0–1, speed in m/s. */
  brakes(front: number, rear: number, speed: number): void
  /** A one-off sound as a brake is applied. */
  brakeTap(which: 'front' | 'rear'): void
  /** The gear lever: a light click on a lift, a heavier clunk on a press. */
  gear(dir?: 'up' | 'down'): void
  dispose(): void
}

const silent = (): RideAudio => ({
  unlock() {},
  get running() {
    return false
  },
  setMuted() {},
  setHushed() {},
  engineStart() {},
  engineStop() {},
  engineRpm() {},
  throttle() {},
  brakes() {},
  brakeTap() {},
  gear() {},
  dispose() {},
})

export function createRideAudio(): RideAudio {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return silent()
  const ctx = new Ctx()
  const master = ctx.createGain()
  master.gain.value = 0.7
  master.connect(ctx.destination)

  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

  // The engine: two detuned tones through a low-pass, heard only while it is running.
  const engine = ctx.createGain()
  engine.gain.value = 0
  const lowpass = ctx.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 700
  lowpass.connect(engine).connect(master)
  const fundamental = ctx.createOscillator()
  fundamental.type = 'sawtooth'
  fundamental.frequency.value = 40
  const body = ctx.createOscillator()
  body.type = 'triangle'
  body.frequency.value = 60
  const bodyGain = ctx.createGain()
  bodyGain.gain.value = 0.45
  fundamental.connect(lowpass)
  body.connect(bodyGain).connect(lowpass)
  fundamental.start()
  body.start()

  // Brake noise, its volume following how hard the brakes are on and how fast the wheels turn.
  const brake = ctx.createGain()
  brake.gain.value = 0
  brake.connect(master)
  const brakeFilter = ctx.createBiquadFilter()
  brakeFilter.type = 'bandpass'
  brakeFilter.frequency.value = 1400
  brakeFilter.Q.value = 0.7
  const brakeSource = ctx.createBufferSource()
  brakeSource.buffer = noise
  brakeSource.loop = true
  brakeSource.connect(brakeFilter).connect(brake)
  brakeSource.start()

  // Intake: a whoosh through the throttle body, heard separately from the engine note.
  const intake = ctx.createGain()
  intake.gain.value = 0
  intake.connect(master)
  const intakeFilter = ctx.createBiquadFilter()
  intakeFilter.type = 'bandpass'
  intakeFilter.frequency.value = 1800
  intakeFilter.Q.value = 0.7
  const intakeSource = ctx.createBufferSource()
  intakeSource.buffer = noise
  intakeSource.loop = true
  intakeSource.connect(intakeFilter).connect(intake)
  intakeSource.start()

  const burst = (at: number, { freq, to, type, seconds, gain, filterHz }: { freq: number; to?: number; type: OscillatorType; seconds: number; gain: number; filterHz?: number }) => {
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(freq, at)
    if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), at + seconds)
    const amp = ctx.createGain()
    amp.gain.setValueAtTime(gain, at)
    amp.gain.exponentialRampToValueAtTime(0.0001, at + seconds)
    if (filterHz) {
      const end = ctx.createBiquadFilter()
      end.type = 'bandpass'
      end.frequency.value = filterHz
      osc.connect(end).connect(amp)
    } else osc.connect(amp)
    amp.connect(master)
    osc.start(at)
    osc.stop(at + seconds + 0.02)
  }

  let muted = false
  let hushed = false
  const applyMute = () => {
    master.gain.setTargetAtTime(muted || hushed ? 0 : 0.7, ctx.currentTime, hushed ? 0.12 : 0.02)
  }

  return {
    unlock() {
      if (ctx.state === 'suspended') void ctx.resume()
    },
    get running() {
      return ctx.state === 'running' && !muted
    },
    setMuted(next) {
      muted = next
      applyMute()
    },
    setHushed(next) {
      hushed = next
      applyMute()
    },
    engineStart() {
      const t = ctx.currentTime
      // The starter motor: a rising whir with some rasp, then it catches.
      burst(t, { freq: 45, to: 160, type: 'sawtooth', seconds: 0.62, gain: 0.16, filterHz: 500 })
      const src = ctx.createBufferSource()
      src.buffer = noise
      const amp = ctx.createGain()
      amp.gain.setValueAtTime(0.12, t)
      amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
      const rasp = ctx.createBiquadFilter()
      rasp.type = 'bandpass'
      rasp.frequency.value = 900
      src.connect(rasp).connect(amp).connect(master)
      src.start(t)
      src.stop(t + 0.55)
    },
    engineStop(stall) {
      engine.gain.setTargetAtTime(0, ctx.currentTime, 0.12)
      const t = ctx.currentTime
      if (stall) burst(t, { freq: 70, to: 28, type: 'sawtooth', seconds: 0.45, gain: 0.14 })
      else burst(t, { freq: 220, type: 'square', seconds: 0.05, gain: 0.06 })
    },
    engineRpm(rpm, running) {
      const f = engineTone(rpm)
      fundamental.frequency.setTargetAtTime(f, ctx.currentTime, 0.08)
      body.frequency.setTargetAtTime(f * 1.5, ctx.currentTime, 0.08)
      lowpass.frequency.setTargetAtTime(500 + Math.min(rpm, 9000) * 0.06, ctx.currentTime, 0.1)
      engine.gain.setTargetAtTime(running ? 0.13 : 0, ctx.currentTime, running ? 0.15 : 0.2)
    },
    throttle(open) {
      const x = Math.min(1, Math.max(0, open))
      intake.gain.setTargetAtTime(x * 0.11, ctx.currentTime, 0.08)
      intakeFilter.frequency.setTargetAtTime(1400 + x * 2200, ctx.currentTime, 0.1)
    },
    brakes(front, rear, speed) {
      const moving = Math.min(1, Math.abs(speed) / 3)
      const pressure = Math.min(1, front * 0.85 + rear * 0.4)
      brake.gain.setTargetAtTime(pressure * moving * 0.2, ctx.currentTime, 0.06)
      brakeFilter.frequency.setTargetAtTime(700 + front * 2200, ctx.currentTime, 0.06)
    },
    brakeTap(which) {
      const t = ctx.currentTime
      if (which === 'front') burst(t, { freq: 1800, to: 900, type: 'sawtooth', seconds: 0.12, gain: 0.05, filterHz: 2000 })
      else burst(t, { freq: 140, type: 'sine', seconds: 0.09, gain: 0.1 })
    },
    gear(dir = 'up') {
      const t = ctx.currentTime
      if (dir === 'down') {
        burst(t, { freq: 170, to: 70, type: 'square', seconds: 0.09, gain: 0.11 })
        burst(t + 0.05, { freq: 85, type: 'triangle', seconds: 0.08, gain: 0.08 })
      } else {
        burst(t, { freq: 560, to: 260, type: 'square', seconds: 0.045, gain: 0.07 })
        burst(t + 0.03, { freq: 190, type: 'triangle', seconds: 0.05, gain: 0.06 })
      }
    },
    dispose() {
      fundamental.stop()
      body.stop()
      brakeSource.stop()
      intakeSource.stop()
      void ctx.close()
    },
  }
}
