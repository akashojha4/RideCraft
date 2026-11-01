import { useSyncExternalStore } from 'react'

/*
 * The learner's progress, kept in this browser (localStorage) so it survives refreshes and
 * return visits. One versioned record; every write saves it and notifies subscribers. If
 * storage is unavailable (private mode, blocked), progress still works for the visit.
 */

const KEY = 'motolab:progress:v1'
const LEGACY_SCENARIOS = 'motolab:scenarios-solved'
const HISTORY_LIMIT = 200

export interface QuizRecord {
  best: number
  last: number
  total: number
  attempts: number
  at: number
}

export interface LessonRecord {
  visitedAt: number
  completedAt?: number
  quiz?: QuizRecord
}

export type PracticeKind = 'exercise' | 'scenario'

export interface PracticeEvent {
  kind: PracticeKind
  /** Simulator or scenario id. */
  source: string
  /** Exercise id or scenario choice id. */
  item: string
  title: string
  result: 'pass' | 'fail' | 'safe' | 'risky' | 'crash'
  at: number
}

export interface AssessmentAttempt {
  at: number
  correct: number
  total: number
  byModule: Record<string, { correct: number; total: number }>
}

export interface Progress {
  version: 1
  /** Keyed "moduleId/lessonId". */
  lessons: Record<string, LessonRecord>
  /** Exercises passed, keyed "simulator/exercise". */
  exercisesPassed: Record<string, number>
  scenariosSolved: Record<string, number>
  history: PracticeEvent[]
  assessments: AssessmentAttempt[]
}

const empty = (): Progress => ({ version: 1, lessons: {}, exercisesPassed: {}, scenariosSolved: {}, history: [], assessments: [] })

function read(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    const p: Progress = raw ? { ...empty(), ...(JSON.parse(raw) as Progress) } : empty()
    // Carry over scenarios solved before progress tracking existed.
    const legacy = localStorage.getItem(LEGACY_SCENARIOS)
    if (legacy) {
      for (const id of JSON.parse(legacy) as string[]) p.scenariosSolved[id] ??= Date.now()
      localStorage.removeItem(LEGACY_SCENARIOS)
      localStorage.setItem(KEY, JSON.stringify(p))
    }
    return p
  } catch {
    return empty()
  }
}

let state: Progress | null = null
const listeners = new Set<() => void>()

function get(): Progress {
  state ??= read()
  return state
}

function write(next: Progress) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Storage unavailable: keep progress in memory for this visit.
  }
  for (const fn of listeners) fn()
}

function update(fn: (p: Progress) => Progress) {
  write(fn(get()))
}

const lessonKey = (moduleId: string, lessonId: string) => `${moduleId}/${lessonId}`

export const progress = {
  get,
  subscribe(fn: () => void) {
    listeners.add(fn)
    // Another tab changed the progress.
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        state = read()
        fn()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      listeners.delete(fn)
      window.removeEventListener('storage', onStorage)
    }
  },
  visitLesson(moduleId: string, lessonId: string) {
    const k = lessonKey(moduleId, lessonId)
    if (get().lessons[k]) return
    update((p) => ({ ...p, lessons: { ...p.lessons, [k]: { visitedAt: Date.now() } } }))
  },
  /** A finished knowledge check: the lesson counts as completed. */
  recordQuiz(moduleId: string, lessonId: string, correct: number, total: number) {
    const k = lessonKey(moduleId, lessonId)
    update((p) => {
      const prev = p.lessons[k]
      const quiz: QuizRecord = { best: Math.max(prev?.quiz?.best ?? 0, correct), last: correct, total, attempts: (prev?.quiz?.attempts ?? 0) + 1, at: Date.now() }
      return { ...p, lessons: { ...p.lessons, [k]: { visitedAt: prev?.visitedAt ?? Date.now(), completedAt: prev?.completedAt ?? Date.now(), quiz } } }
    })
  },
  recordPractice(event: Omit<PracticeEvent, 'at'>) {
    const at = Date.now()
    update((p) => {
      const history = [{ ...event, at }, ...p.history].slice(0, HISTORY_LIMIT)
      const exercisesPassed = event.kind === 'exercise' && event.result === 'pass' ? { ...p.exercisesPassed, [`${event.source}/${event.item}`]: p.exercisesPassed[`${event.source}/${event.item}`] ?? at } : p.exercisesPassed
      const scenariosSolved = event.kind === 'scenario' && event.result === 'safe' ? { ...p.scenariosSolved, [event.source]: p.scenariosSolved[event.source] ?? at } : p.scenariosSolved
      return { ...p, history, exercisesPassed, scenariosSolved }
    })
  },
  recordAssessment(attempt: Omit<AssessmentAttempt, 'at'>) {
    update((p) => ({ ...p, assessments: [{ ...attempt, at: Date.now() }, ...p.assessments].slice(0, 50) }))
  },
  reset() {
    write(empty())
  },
}

/** Subscribe a component to the learner's progress. */
export function useProgress() {
  return useSyncExternalStore(progress.subscribe, progress.get, empty)
}
