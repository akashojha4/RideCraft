import { basicsLessons } from './modules/basics'
import { handlingLessons } from './modules/handling'
import { mechanicsLessons } from './modules/mechanics'
import { preRideLessons } from './modules/preRide'
import type { LearningModule, Lesson } from './types'

/**
 * Every learning module, in curriculum order. A module with no lessons is listed as
 * pending, with the phase that will build it.
 */
export const modules: LearningModule[] = [
  {
    id: 'basics',
    title: 'Motorcycle Basics',
    description: 'What a motorcycle is, its controls, and how the engine, clutch, gears, brakes and drivetrain work.',
    phase: 3,
    lessons: basicsLessons,
  },
  {
    id: 'pre-ride',
    title: 'Pre-Ride Preparation',
    description: 'Riding posture, protective gear and the checks to make before every ride.',
    phase: 4,
    lessons: preRideLessons,
  },
  {
    id: 'handling',
    title: 'Turning & Handling',
    description: 'Leaning, countersteering, body position, slow-speed control and tyre grip.',
    phase: 9,
    lessons: handlingLessons,
  },
  {
    id: 'mechanics',
    title: 'Advanced Mechanics',
    description: 'Cutaway deep-dives into engines, transmissions, ABS, suspension and tyre dynamics.',
    phase: 11,
    lessons: mechanicsLessons,
  },
]

export const visibleModules = modules.filter((m) => !m.hidden)

export function getModule(moduleId: string | undefined) {
  return modules.find((m) => m.id === moduleId)
}

export function getLesson(moduleId: string | undefined, lessonId: string | undefined) {
  const module = getModule(moduleId)
  if (!module) return undefined
  const index = module.lessons.findIndex((l) => l.id === lessonId)
  if (index === -1) return undefined
  return {
    module,
    lesson: module.lessons[index],
    index,
    previous: module.lessons[index - 1] as Lesson | undefined,
    next: module.lessons[index + 1] as Lesson | undefined,
  }
}

export function lessonPath(moduleId: string, lessonId: string) {
  return `/learn/${moduleId}/${lessonId}`
}

/**
 * Development-time guard for the lesson contract: every lesson needs a concept,
 * an illustration, a real-world example and a knowledge check, and ids must be unique.
 */
export function validateCurriculum(list: LearningModule[] = modules): string[] {
  const problems: string[] = []
  const moduleIds = new Set<string>()
  for (const m of list) {
    if (moduleIds.has(m.id)) problems.push(`Duplicate module id "${m.id}"`)
    moduleIds.add(m.id)
    const lessonIds = new Set<string>()
    for (const l of m.lessons) {
      const where = `${m.id}/${l.id}`
      if (lessonIds.has(l.id)) problems.push(`Duplicate lesson id "${where}"`)
      lessonIds.add(l.id)
      for (const required of ['concept', 'illustration', 'example'] as const) {
        if (!l.blocks.some((b) => b.type === required)) problems.push(`${where} has no "${required}" block`)
      }
      if (l.knowledgeCheck.length === 0) problems.push(`${where} has no knowledge check`)
      for (const q of l.knowledgeCheck) {
        if (!q.options.some((o) => o.id === q.correctOptionId)) {
          problems.push(`${where} question "${q.id}" has no option matching its correct answer`)
        }
      }
    }
  }
  return problems
}

if (import.meta.env.DEV) {
  for (const problem of validateCurriculum()) console.warn(`[curriculum] ${problem}`)
}
