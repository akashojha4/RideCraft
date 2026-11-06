import type { RunSample } from '@/content/scenarios/cockpit/run'

/*
 * The rider's controls as the Riding Situations lessons show them, each with one colour used
 * everywhere in a lesson (control cards, timeline, playback) so a control is recognised at a glance.
 */

export type ControlId = 'clutch' | 'throttle' | 'front' | 'rear' | 'gear' | 'steer'

export interface ControlStyle {
  label: string
  /** Hand or foot that works it. */
  where: string
  text: string
  fill: string
  softFill: string
  stroke: string
  border: string
  bg: string
}

export const CONTROLS: Record<ControlId, ControlStyle> = {
  clutch: { label: 'Clutch', where: 'Left hand', text: 'text-ignition-300', fill: 'fill-ignition-400/35', softFill: 'fill-ignition-400/12', stroke: 'stroke-ignition-400', border: 'border-ignition-500/50', bg: 'bg-ignition-400' },
  throttle: { label: 'Throttle', where: 'Right hand (twist)', text: 'text-ok-400', fill: 'fill-ok-400/35', softFill: 'fill-ok-400/12', stroke: 'stroke-ok-400', border: 'border-ok-500/50', bg: 'bg-ok-400' },
  front: { label: 'Front brake', where: 'Right hand (lever)', text: 'text-danger-400', fill: 'fill-danger-400/35', softFill: 'fill-danger-400/12', stroke: 'stroke-danger-400', border: 'border-danger-500/50', bg: 'bg-danger-400' },
  rear: { label: 'Rear brake', where: 'Right foot', text: 'text-caution-400', fill: 'fill-caution-400/35', softFill: 'fill-caution-400/12', stroke: 'stroke-caution-400', border: 'border-caution-500/50', bg: 'bg-caution-400' },
  gear: { label: 'Gear lever', where: 'Left foot', text: 'text-coolant-300', fill: 'fill-coolant-400/35', softFill: 'fill-coolant-400/12', stroke: 'stroke-coolant-400', border: 'border-coolant-500/50', bg: 'bg-coolant-400' },
  steer: { label: 'Handlebar', where: 'Both hands', text: 'text-ink', fill: 'fill-ink-muted/35', softFill: 'fill-ink-muted/12', stroke: 'stroke-ink-muted', border: 'border-line-strong', bg: 'bg-ink-muted' },
}

/** The four controls with a travel (0–1), as drawn on the timeline. */
export const AXIS_CONTROLS = ['clutch', 'throttle', 'front', 'rear'] as const

export const gearLabel = (g: number) => (g === 0 ? 'N' : String(g))
export const steerLabel = (s: number) => (s > 0 ? 'Full lock right' : s < 0 ? 'Full lock left' : 'Straight')
export const pct = (x: number) => `${Math.round(x * 100)} %`

/** How the clutch is passing the drive at a moment, in words. */
export function clutchState(x: RunSample) {
  if (!x.running) return 'Engine off: nothing to pass on'
  if (x.gear === 0) return 'Neutral: no gear, so nothing reaches the wheel'
  if (x.clamp === 0) return 'Disengaged: the plates are apart, no drive passes'
  if (x.locked) return 'Engaged: plates gripping, engine and wheel turn together'
  return 'Friction zone: the plates slip and pass part of the torque'
}
