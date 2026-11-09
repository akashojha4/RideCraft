import type { ControlId } from '@/components/situations/controls'
import type { MistakeId } from '@/lib/simulation/ridingMistakes'
import type { IllustrationId } from '../illustrations/registry'
import type { QuizQuestion } from '../types'

/*
 * What a Riding Situations lesson teaches about one cockpit scenario. The scenario itself
 * (content/scenarios/cockpit) holds what the rider does and how the motorcycle responds —
 * its set-up, guided steps, captions, mistake checks and demonstration — and is referenced
 * by its id; this adds the teaching around it.
 */

/** One control, explained for this situation. */
export interface ControlGuide {
  control: ControlId
  /** Which control, and its part in this situation. */
  what: string
  when: string
  how: string
  howMuch: string
  why: string
  /** What happens inside the motorcycle. */
  mechanics: string
  /** What happens to the motorcycle on the road. */
  result: string
  /** Position to draw the control at (0–1, or the gear for the gear lever). */
  shownAt?: number
  /** A lesson illustration that shows the mechanism. */
  illustration?: IllustrationId
}

/** A beginner's mistake, explained. */
export interface MistakeGuide {
  title: string
  does: string
  feels: string
  mechanics: string
  motorcycle: string
  cause: string
  fix: string
  /** The cockpit spots this one and explains it if it happens. */
  cockpit?: MistakeId
}

export interface SituationTeaching {
  /** The cockpit scenario this lesson teaches (stable id; the lesson reads its steps, demo and set-up). */
  scenario: string
  situation: {
    where: string
    happening: string
    goal: string
    challenge: string
    /** What to understand before acting. */
    before: string[]
  }
  controls: ControlGuide[]
  mistakes: MistakeGuide[]
  questions: QuizQuestion[]
}
