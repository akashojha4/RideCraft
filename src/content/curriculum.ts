import { academyLessonIdsForModule, academyNeighbors, academyPath, phaseForLesson } from './academy'
import { basicsLessons } from './modules/basics'
import { handlingLessons } from './modules/handling'
import { mechanicsLessons } from './modules/mechanics'
import { firstRideLessons } from './modules/firstRide'
import { preRideLessons } from './modules/preRide'
import { roadcraftLessons } from './modules/roadcraft'
import { ridingSituationLessons } from './modules/ridingSituations'
import { getCockpitScenario } from './scenarios/cockpit'
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
    id: 'first-ride',
    title: 'Your First Ride',
    description: 'Getting on, walking the motorcycle, recovering from a stall, picking it up, and the rules and gear that come before your first road ride.',
    phase: 4,
    lessons: firstRideLessons,
  },
  {
    id: 'riding-situations',
    title: 'Riding Situations',
    description: 'Moving off, stopping, changing gear, hills, traffic, hazards and U-turns, one control at a time — then watch it done and practise it in the cockpit.',
    phase: 13,
    lessons: ridingSituationLessons,
  },
  {
    id: 'handling',
    title: 'Turning & Handling',
    description: 'Leaning, countersteering, body position, slow-speed control and tyre grip.',
    phase: 9,
    lessons: handlingLessons,
  },
  {
    id: 'roadcraft',
    title: 'Roadcraft',
    description: 'Seeing and being seen, space, junctions, other people, night, a passenger, and what to do when the ride goes wrong.',
    phase: 10,
    lessons: roadcraftLessons,
  },
  {
    id: 'mechanics',
    title: 'Advanced Mechanics',
    description: 'Optional deep-dives for the curious: combustion, fuel systems, cooling, ABS, traction control, suspension and tyres. Not needed to start riding.',
    phase: 11,
    lessons: mechanicsLessons,
    optional: true,
  },
]

export const visibleModules = modules.filter((m) => !m.hidden)

/** The modules a beginner works through to be ready for real practice (optional depth left out). */
export const coreModules = visibleModules.filter((m) => !m.optional && m.lessons.length > 0)

export const moduleMinutes = (m: LearningModule) => m.lessons.reduce((n, l) => n + l.durationMinutes, 0)

/** The first lesson not yet completed, along the academy path (turning and an emergency stop before traffic), then any leftover, then optional depth. */
export function nextLesson(isCompleted: (moduleId: string, lessonId: string) => boolean) {
  for (const step of academyPath) {
    if (!isCompleted(step.moduleId, step.lessonId)) {
      const found = getLesson(step.moduleId, step.lessonId)
      if (found) return { module: found.module, lesson: found.lesson, path: lessonPath(step.moduleId, step.lessonId), place: found.place }
    }
  }
  for (const m of [...coreModules, ...visibleModules.filter((x) => x.optional)]) {
    const l = m.lessons.find((x) => !isCompleted(m.id, x.id))
    if (l) {
      const found = getLesson(m.id, l.id)
      if (found) return { module: found.module, lesson: found.lesson, path: lessonPath(m.id, l.id), place: found.place }
    }
  }
  return undefined
}

export function getModule(moduleId: string | undefined) {
  return modules.find((m) => m.id === moduleId)
}

export type LessonNeighbor = { module: LearningModule; lesson: Lesson }

export type LessonPlace = {
  title: string
  step: number
  of: number
  href: string
  phaseId?: string
}

function neighborAt(moduleId: string, lessonId: string): LessonNeighbor | undefined {
  const module = getModule(moduleId)
  const lesson = module?.lessons.find((l) => l.id === lessonId)
  if (!module || !lesson) return undefined
  return { module, lesson }
}

/** This module’s lessons in the order the academy path meets them. */
export function lessonsInAcademyOrder(module: LearningModule) {
  const ids = academyLessonIdsForModule(module.id)
  if (ids.length === 0) return module.lessons
  const byId = new Map(module.lessons.map((l) => [l.id, l]))
  const ordered = ids.map((id) => byId.get(id)).filter((l): l is Lesson => !!l)
  const leftover = module.lessons.filter((l) => !ids.includes(l.id))
  return leftover.length ? [...ordered, ...leftover] : ordered
}

export function getLesson(moduleId: string | undefined, lessonId: string | undefined) {
  const module = getModule(moduleId)
  if (!module || !lessonId) return undefined
  const index = module.lessons.findIndex((l) => l.id === lessonId)
  if (index === -1) return undefined
  const onPath = academyNeighbors(module.id, lessonId)
  const phase = phaseForLesson(module.id, lessonId)
  const previous =
    onPath.index >= 0
      ? onPath.previous
        ? neighborAt(onPath.previous.moduleId, onPath.previous.lessonId)
        : undefined
      : index > 0
        ? { module, lesson: module.lessons[index - 1] }
        : undefined
  const next =
    onPath.index >= 0
      ? onPath.next
        ? neighborAt(onPath.next.moduleId, onPath.next.lessonId)
        : undefined
      : index < module.lessons.length - 1
        ? { module, lesson: module.lessons[index + 1] }
        : undefined
  const place: LessonPlace = phase
    ? {
        title: phase.title,
        step: phase.lessons.findIndex((s) => s.moduleId === module.id && s.lessonId === lessonId) + 1,
        of: phase.lessons.length,
        href: `/learn/phase/${phase.id}`,
        phaseId: phase.id,
      }
    : { title: module.title, step: index + 1, of: module.lessons.length, href: `/learn/${module.id}` }
  return { module, lesson: module.lessons[index], index, previous, next, place }
}

export function lessonPath(moduleId: string, lessonId: string) {
  return `/learn/${moduleId}/${lessonId}`
}

/** The Riding Situations lesson that teaches a cockpit scenario (by its stable id), if there is one. */
export function lessonForScenario(scenarioId: string) {
  for (const m of visibleModules) for (const l of m.lessons) if (l.situation?.scenario === scenarioId) return { module: m, lesson: l, path: lessonPath(m.id, l.id) }
  return undefined
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
      if (l.situation) {
        // A situation lesson is built around its cockpit scenario, which must exist and have a demonstration.
        const sc = getCockpitScenario(l.situation.scenario)
        if (!sc) problems.push(`${where} refers to unknown scenario "${l.situation.scenario}"`)
        else if (!sc.demo?.length) problems.push(`${where}: scenario "${sc.id}" has no demonstration`)
        if (l.situation.controls.length < 3) problems.push(`${where} explains fewer than three controls`)
        for (const c of l.situation.controls) {
          for (const k of ['what', 'when', 'how', 'howMuch', 'why', 'mechanics', 'result'] as const) if (!c[k]) problems.push(`${where}: ${c.control} has no "${k}"`)
        }
        if (l.situation.mistakes.length < 3) problems.push(`${where} explains fewer than three mistakes`)
        if (l.knowledgeCheck !== l.situation.questions) problems.push(`${where}: knowledge check must be the situation's questions`)
      } else {
        for (const required of ['concept', 'illustration', 'example'] as const) {
          if (!l.blocks.some((b) => b.type === required)) problems.push(`${where} has no "${required}" block`)
        }
        for (const b of l.blocks) {
          if (b.type === 'cockpit' && !getCockpitScenario(b.scenario)) problems.push(`${where} embeds unknown cockpit scenario "${b.scenario}"`)
        }
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
