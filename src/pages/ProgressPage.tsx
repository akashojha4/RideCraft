import { ArrowRight, CircleAlert, CircleCheck, CircleDashed, ClipboardCheck, OctagonX, RotateCcw, Trophy } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { lessonPath, nextLesson } from '@/content/curriculum'
import { scenarios } from '@/content/scenarios'
import { cn } from '@/lib/cn'
import { PASS_MARK, buildAssessment } from '@/lib/progress/assessment'
import { progress, useProgress, type PracticeEvent } from '@/lib/progress/store'
import { LEVELS, SIMULATORS, summarize } from '@/lib/progress/summary'
import { usePageTitle } from '@/hooks/usePageTitle'

const RESULT: Record<PracticeEvent['result'], { label: string; Icon: typeof CircleCheck; cls: string }> = {
  pass: { label: 'Passed', Icon: CircleCheck, cls: 'text-ok-400' },
  safe: { label: 'Safe', Icon: CircleCheck, cls: 'text-ok-400' },
  fail: { label: 'Not yet', Icon: CircleAlert, cls: 'text-caution-400' },
  risky: { label: 'Risky', Icon: CircleAlert, cls: 'text-caution-400' },
  crash: { label: 'Crash', Icon: OctagonX, cls: 'text-danger-400' },
}

function when(at: number) {
  const s = Math.round((Date.now() - at) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.round(s / 60)} min ago`
  if (s < 86400) return `${Math.round(s / 3600)} h ago`
  return new Date(at).toLocaleDateString()
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4" data-stat={label}>
      <p className="text-xs tracking-wide text-ink-subtle uppercase">{label}</p>
      <p className="tabular mt-1 font-display text-2xl font-semibold text-ink">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-muted">{sub}</p>}
    </div>
  )
}

/** How many questions the knowledge assessment asks, and from how many modules (it varies with the curriculum). */
const ASSESSMENT = buildAssessment(1)
const ASSESSMENT_SIZE = ASSESSMENT.length
const ASSESSMENT_MODULES = new Set(ASSESSMENT.map((q) => q.moduleId)).size

export default function ProgressPage() {
  usePageTitle('Your progress')
  const p = useProgress()
  const s = summarize(p)
  const [confirmReset, setConfirmReset] = useState(false)
  const scenarioTitle = (id: string) => scenarios.find((x) => x.id === id)?.title ?? id
  const simTitle = (id: string) => SIMULATORS.find((x) => x.id === id)?.title ?? id
  const upNext = nextLesson((m, l) => !!p.lessons[`${m}/${l}`]?.completedAt)
  const started = s.points > 0

  return (
    <Container className="space-y-12 py-14 sm:py-20">
      <SectionHeading as="h1" eyebrow="Progress" title="Your progress" description="Everything you have learned and practised, saved in this browser. It stays here when you refresh or come back later." />

      {/* Level */}
      <section aria-labelledby="level-heading" className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-4 rounded-2xl border border-ignition-500/30 bg-ignition-950/40 p-6">
          <div className="flex items-center gap-3">
            <Trophy className="size-8 text-ignition-400" aria-hidden />
            <div>
              <p className="text-xs tracking-wide text-ink-subtle uppercase">Level {s.levelIndex + 1} of {LEVELS.length}</p>
              <h2 id="level-heading" className="font-display text-2xl font-semibold text-ink" data-level>
                {s.level.name}
              </h2>
            </div>
          </div>
          <p className="text-ink-muted">{s.level.text}</p>
          <p className="text-xs text-ink-subtle">Levels measure what you know, not how well you ride. Learn to ride on a real motorcycle only with a qualified instructor.</p>
          <ProgressBar value={s.points} max={s.max} label="Progress through all of RideCraft" />
          <p className="tabular font-mono text-sm text-ink-muted" data-points>
            {s.points} of {s.max} points · {Math.round(s.share * 100)} %{s.next ? ` · ${s.toNext} to ${s.next.name}` : ''}
          </p>
          {upNext && (
            <Link to={upNext.path} className="inline-flex items-center gap-1.5 text-sm font-medium text-ignition-400 hover:text-ignition-300">
              {started ? 'Continue' : 'Start'}: {upNext.lesson.title} <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Lessons completed" value={`${s.lessonsCompleted} / ${s.lessonsTotal}`} sub="Pass a lesson’s knowledge check (2 of 3)" />
          <Stat label="Quiz score" value={s.quizAverage === null ? '—' : `${Math.round(s.quizAverage * 100)} %`} sub={`${s.bestCorrect} of ${s.questions} questions answered correctly`} />
          <Stat label="Exercises passed" value={`${s.exercisesPassed} / ${s.exercisesTotal}`} sub="Simulator exercises" />
          <Stat label="Scenarios solved" value={`${s.scenariosSolved} / ${s.scenariosTotal}`} sub="Found the safe decision" />
          <Stat label="Assessment best" value={s.assessmentBest === null ? '—' : `${Math.round(s.assessmentBest * 100)} %`} sub={`Pass mark ${PASS_MARK * 100} %`} />
          <Stat label="Practice sessions" value={String(p.history.length)} sub="Exercises and scenario decisions" />
        </div>
      </section>

      {/* Modules */}
      <section aria-labelledby="modules-heading" className="space-y-4">
        <h2 id="modules-heading" className="text-2xl font-semibold text-ink">
          Learning modules
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {s.modules.map((m) => (
            <details key={m.module.id} className="group rounded-2xl border border-line bg-surface p-5" data-module={m.module.id}>
              <summary className="cursor-pointer list-none space-y-2">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-semibold text-ink">
                    {m.module.title}
                    {m.module.optional && <span className="ml-2 text-xs font-normal text-ink-subtle">optional</span>}
                  </h3>
                  <span className="tabular font-mono text-sm text-ink-muted">
                    {m.completed} / {m.total}
                  </span>
                </div>
                <ProgressBar value={m.completed} max={m.total} tone="ok" label={`${m.module.title}: lessons completed`} />
                <p className="text-xs text-ink-subtle">
                  Quiz: {m.correct} of {m.questions} correct · <span className="group-open:hidden">show lessons</span>
                  <span className="hidden group-open:inline">hide lessons</span>
                </p>
              </summary>
              <ul className="mt-4 space-y-1.5">
                {m.lessons.map(({ lesson, record }) => (
                  <li key={lesson.id}>
                    <Link to={lessonPath(m.module.id, lesson.id)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-raised">
                      {record?.completedAt ? <CircleCheck className="size-4 shrink-0 text-ok-400" aria-label="Completed" /> : <CircleDashed className="size-4 shrink-0 text-ink-subtle" aria-label={record ? 'Started' : 'Not started'} />}
                      <span className="flex-1 text-ink-muted">{lesson.title}</span>
                      {record?.quiz && (
                        <span className={cn('tabular font-mono text-xs', record.quiz.best === record.quiz.total ? 'text-ok-400' : 'text-ink-subtle')}>
                          {record.quiz.best}/{record.quiz.total}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      {/* Assessment */}
      <section aria-labelledby="assessment-heading" className="grid gap-4 rounded-2xl border border-line bg-surface p-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-3">
          <h2 id="assessment-heading" className="flex items-center gap-2 text-2xl font-semibold text-ink">
            <ClipboardCheck className="size-6 text-coolant-300" aria-hidden /> Knowledge assessment
          </h2>
          <p className="text-ink-muted">{ASSESSMENT_SIZE} questions drawn from the {ASSESSMENT_MODULES} core modules (not the optional Advanced Mechanics), different each time. Pass mark {PASS_MARK * 100} %. See which areas to revise.</p>
          <Link to="/progress/assessment" className="inline-flex h-10 items-center gap-2 rounded-xl bg-ignition-500 px-4 text-sm font-medium text-bg hover:bg-ignition-400">
            {p.assessments.length ? 'Take it again' : 'Start the assessment'} <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div>
          {p.assessments.length === 0 ? (
            <p className="text-sm text-ink-subtle">No attempts yet.</p>
          ) : (
            <table className="w-full text-left text-sm" aria-label="Assessment attempts">
              <thead className="text-xs text-ink-subtle">
                <tr>
                  <th className="py-1 font-normal">When</th>
                  <th className="py-1 text-right font-normal">Score</th>
                  <th className="py-1 text-right font-normal">Result</th>
                </tr>
              </thead>
              <tbody>
                {p.assessments.slice(0, 6).map((a) => {
                  const pass = a.correct / a.total >= PASS_MARK
                  return (
                    <tr key={a.at} className="border-t border-line" data-attempt>
                      <td className="py-1.5 text-ink-muted">{when(a.at)}</td>
                      <td className="tabular py-1.5 text-right font-mono text-ink">
                        {a.correct}/{a.total} · {Math.round((a.correct / a.total) * 100)} %
                      </td>
                      <td className={cn('py-1.5 text-right', pass ? 'text-ok-400' : 'text-caution-400')}>{pass ? 'Passed' : 'Not yet'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Practice */}
      <section aria-labelledby="practice-heading" className="space-y-4">
        <h2 id="practice-heading" className="text-2xl font-semibold text-ink">
          Practice
        </h2>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="space-y-3">
            {SIMULATORS.map((sim) => {
              const passed = sim.exercises.filter((e) => p.exercisesPassed[`${sim.id}/${e.id}`]).length
              return (
                <Link key={sim.id} to={sim.path} className="block rounded-2xl border border-line bg-surface p-4 hover:border-line-strong" data-simulator={sim.id}>
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-medium text-ink">{sim.title}</h3>
                    <span className="tabular font-mono text-sm text-ink-muted">
                      {passed} / {sim.exercises.length}
                    </span>
                  </div>
                  <ProgressBar value={passed} max={sim.exercises.length} tone="coolant" label={`${sim.title}: exercises passed`} className="mt-2" />
                </Link>
              )
            })}
            <Link to="/scenarios" className="block rounded-2xl border border-line bg-surface p-4 hover:border-line-strong">
              <div className="flex items-baseline justify-between">
                <h3 className="font-medium text-ink">Real-world scenarios</h3>
                <span className="tabular font-mono text-sm text-ink-muted">
                  {s.scenariosSolved} / {s.scenariosTotal}
                </span>
              </div>
              <ProgressBar value={s.scenariosSolved} max={s.scenariosTotal} tone="coolant" label="Scenarios solved" className="mt-2" />
            </Link>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <h3 className="mb-2 font-medium text-ink">Recent practice</h3>
            {p.history.length === 0 ? (
              <p className="text-sm text-ink-subtle">Nothing yet. Try a simulator exercise or a scenario.</p>
            ) : (
              <ul className="divide-y divide-line" aria-label="Practice history">
                {p.history.slice(0, 12).map((e) => {
                  const r = RESULT[e.result]
                  return (
                    <li key={e.at + e.item} className="flex items-center gap-3 py-2 text-sm" data-history>
                      <r.Icon className={cn('size-4 shrink-0', r.cls)} aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-ink-muted">
                        <span className="text-ink">{e.kind === 'exercise' ? e.title : scenarioTitle(e.source)}</span> · {e.kind === 'exercise' ? simTitle(e.source) : 'Scenario'}
                      </span>
                      <span className={cn('shrink-0 text-xs', r.cls)}>{r.label}</span>
                      <span className="w-20 shrink-0 text-right text-xs text-ink-subtle">{when(e.at)}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Reset */}
      <section aria-label="Reset progress" className="flex flex-wrap items-center gap-3 border-t border-line pt-6 text-sm text-ink-muted">
        <p className="flex-1">Progress is stored only in this browser. Clearing your browser data also clears it.</p>
        {confirmReset ? (
          <>
            <span className="text-caution-400">Delete all progress? This can’t be undone.</span>
            <Button size="sm" variant="secondary" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                progress.reset()
                setConfirmReset(false)
              }}
            >
              Yes, reset
            </Button>
          </>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setConfirmReset(true)} leadingIcon={<RotateCcw className="size-4" />}>
            Reset progress
          </Button>
        )}
      </section>
    </Container>
  )
}
