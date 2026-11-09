import type { LearningModule, Lesson } from '@/content/types'
import type { QuizRecord } from '@/lib/progress/store'
import { trackEvent, type EventParams } from './ga'

/*
 * Learning-engagement events for GA4. Called only when the progress store reports a one-time
 * change — the lesson's record created (first open in this browser) or its first passing
 * knowledge check — so re-renders, remounts and navigation can't repeat them. Content ids and
 * titles only: no personal data.
 */

/** The lesson's parameters. lesson_id includes the topic: some lesson ids repeat across topics. */
export function lessonParams(module: Pick<LearningModule, 'id' | 'title'>, lesson: Pick<Lesson, 'id' | 'title'>): EventParams {
  return { lesson_id: `${module.id}/${lesson.id}`, lesson_title: lesson.title, lesson_category: module.title }
}

export function trackLessonStarted(module: Pick<LearningModule, 'id' | 'title'>, lesson: Pick<Lesson, 'id' | 'title'>) {
  const params = lessonParams(module, lesson)
  return trackEvent('lesson_started', params, { once: String(params.lesson_id) })
}

export function trackLessonCompleted(module: Pick<LearningModule, 'id' | 'title'>, lesson: Pick<Lesson, 'id' | 'title'>, quiz: Pick<QuizRecord, 'last' | 'total' | 'attempts'>) {
  const params = lessonParams(module, lesson)
  return trackEvent('lesson_completed', { ...params, quiz_score: quiz.last, quiz_total: quiz.total, quiz_attempts: quiz.attempts }, { once: String(params.lesson_id) })
}
