import type { CalloutTone } from '@/components/ui/Callout'
import type { PartId } from '@/components/motorcycle/parts'
import type { IllustrationId } from './illustrations/registry'
import type { SituationTeaching } from './situations/types'

/**
 * Lesson content model.
 *
 * Lessons are plain data so they can be written, reviewed for technical accuracy and
 * reordered without touching UI code. Interactive or animated visuals are referenced by
 * id from the illustration registry rather than embedded directly.
 */

export type LessonBlock =
  | { type: 'concept'; heading: string; body: string[] }
  | { type: 'keyPoints'; heading?: string; points: string[] }
  | { type: 'illustration'; illustration: IllustrationId; caption?: string }
  | { type: 'example'; heading?: string; body: string[] }
  | { type: 'callout'; tone: CalloutTone; title?: string; body: string }
  | { type: 'steps'; heading: string; steps: { title: string; body: string }[] }
  | { type: 'terms'; heading?: string; items: { term: string; definition: string }[] }
  /** Link to a component in the Anatomy Explorer. */
  | { type: 'explore'; part: PartId; text: string }
  /** Link card to another page of the app. */
  | { type: 'cta'; to: string; title: string; text: string }
  /** Live cockpit demonstration of a guided scenario, then a link to practise it. */
  | { type: 'cockpit'; scenario: string; caption?: string }

export interface QuizOption {
  id: string
  label: string
}

export interface QuizQuestion {
  id: string
  prompt: string
  options: QuizOption[]
  correctOptionId: string
  /** Shown after answering, whether right or wrong. Explain *why*. */
  explanation: string
}

export interface Lesson {
  /** URL slug, unique within its module. */
  id: string
  title: string
  summary: string
  durationMinutes: number
  objectives: string[]
  blocks: LessonBlock[]
  knowledgeCheck: QuizQuestion[]
  /** A Riding Situations lesson: taught in seven sections around a cockpit scenario (blocks are then unused). */
  situation?: SituationTeaching
}

export interface LearningModule {
  /** URL slug. */
  id: string
  title: string
  description: string
  /** The roadmap phase that builds this module. */
  phase: number
  lessons: Lesson[]
  /** Hidden modules are routable but not listed (used for internal fixtures). */
  hidden?: boolean
  /** Extra depth beyond what a beginner needs to start riding; left out of the knowledge assessment. */
  optional?: boolean
}
