import type { Transition, Variants } from 'motion/react'

/**
 * RideCraft animation system.
 *
 * Two kinds of motion exist in the app:
 *  1. UI motion (page reveals, panels, feedback) — use the tokens and variants below.
 *  2. Mechanical motion (crankshafts, wheels, pistons) — driven by `useSimulationClock`
 *     so it can be played, paused, slowed down and reset, and so that every view of a
 *     simulation stays synchronised to the same clock.
 */

/** Durations in seconds. */
export const duration = {
  instant: 0.1,
  fast: 0.18,
  base: 0.28,
  slow: 0.45,
  slower: 0.7,
} as const

/** Cubic-bezier easings. */
export const ease = {
  /** Default for elements entering the screen. */
  out: [0.22, 1, 0.36, 1],
  /** Symmetric movement between two states. */
  inOut: [0.65, 0, 0.35, 1],
  /** Elements leaving the screen. */
  in: [0.55, 0, 1, 0.45],
} as const

export const spring = {
  /** Toggles, levers and buttons — quick and firm. */
  snappy: { type: 'spring', stiffness: 520, damping: 34 },
  /** Panels and cards. */
  soft: { type: 'spring', stiffness: 220, damping: 26 },
} satisfies Record<string, Transition>

export const transition = {
  base: { duration: duration.base, ease: ease.out },
  slow: { duration: duration.slow, ease: ease.out },
} satisfies Record<string, Transition>

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: transition.slow },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transition.base },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: transition.base },
}

export function staggerContainer(stagger = 0.07, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
  }
}

/** Playback speeds offered by simulators. */
export const simulationSpeeds = [0.25, 0.5, 1] as const
export type SimulationSpeed = (typeof simulationSpeeds)[number]
