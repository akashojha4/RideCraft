import { ArrowRight, BookOpen, BookText, Clock, Gauge, TrafficCone } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { academyPhases, phasePath } from '@/content/academy'
import { coreModules, getLesson, lessonPath, moduleMinutes, nextLesson, visibleModules } from '@/content/curriculum'
import { useProgress } from '@/lib/progress/store'
import { usePageTitle } from '@/hooks/usePageTitle'

const hours = (minutes: number) => (minutes < 60 ? `${minutes} min` : `about ${Math.round(minutes / 60)} h`)

export default function LearnPage() {
  usePageTitle('Learn')
  const { lessons } = useProgress()
  const isDone = (m: string, l: string) => !!lessons[`${m}/${l}`]?.completedAt
  const upNext = nextLesson(isDone)
  const started = Object.values(lessons).some((r) => r?.completedAt)
  const coreMinutes = coreModules.reduce((n, m) => n + moduleMinutes(m), 0)
  const currentPhaseId = upNext?.place.phaseId
  const { hash } = useLocation()
  useEffect(() => {
    const id = hash.replace(/^#/, '')
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])
  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Curriculum"
        title="Learn to ride, from the machine up"
        description={`Eight phases, from the machine on the stand to roadcraft. Open any phase or lesson — the suggested order is only a guide. The core course takes ${hours(coreMinutes)}. Passing quizzes is not a licence.`}
      />

      {upNext && (
        <Link
          to={upNext.path}
          data-next-lesson
          className="group mt-10 flex flex-col gap-3 rounded-2xl border border-ignition-500/40 bg-gradient-to-br from-ignition-950/70 to-surface p-6 transition-colors hover:border-ignition-500/70 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-1">
            <p className="font-mono text-xs tracking-[0.16em] text-ignition-400 uppercase">{started ? 'Continue where you left off' : 'Start here'}</p>
            <p className="text-xl font-semibold text-ink">{upNext.lesson.title}</p>
            <p className="text-sm text-ink-muted">
              {upNext.place.title} · lesson {upNext.place.step} of {upNext.place.of} · {upNext.lesson.durationMinutes} min
            </p>
          </div>
          <span className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-xl bg-ignition-500 px-5 text-sm font-medium text-bg group-hover:bg-ignition-400 sm:self-auto">
            {started ? 'Continue' : 'Start the first lesson'} <ArrowRight className="size-4" aria-hidden />
          </span>
        </Link>
      )}

      <ol className="mt-12 space-y-4">
        {academyPhases.map((phase, i) => {
          const done = phase.lessons.filter((s) => isDone(s.moduleId, s.lessonId)).length
          const next = phase.lessons.find((s) => !isDone(s.moduleId, s.lessonId))
          const complete = done === phase.lessons.length
          const nextTitle = next ? getLesson(next.moduleId, next.lessonId)?.lesson.title : undefined
          return (
            <li id={`phase-${phase.id}`} key={phase.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="tabular font-mono text-xs text-ink-subtle">Phase {String(i + 1).padStart(2, '0')}</p>
                  <h2 className="mt-1 text-lg font-semibold text-ink">
                    <Link to={phasePath(phase.id)} className="hover:text-ignition-300">
                      {phase.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">{phase.goal}</p>
                  <p className="mt-1 text-xs text-ink-subtle">{phase.practise}</p>
                </div>
                <Badge tone={complete ? 'ok' : currentPhaseId === phase.id ? 'ignition' : undefined}>
                  {done} of {phase.lessons.length}
                </Badge>
              </div>
              <ol className="mt-4 space-y-1">
                {phase.lessons.map((step, n) => {
                  const found = getLesson(step.moduleId, step.lessonId)
                  const title = found?.lesson.title ?? step.lessonId
                  return (
                    <li key={`${step.moduleId}/${step.lessonId}`} className="flex gap-2 text-sm">
                      <span className="tabular w-5 shrink-0 font-mono text-xs text-ink-subtle">{n + 1}.</span>
                      <Link
                        to={lessonPath(step.moduleId, step.lessonId)}
                        className={isDone(step.moduleId, step.lessonId) ? 'text-ok-400 hover:text-ok-300' : 'text-ink-muted hover:text-ink'}
                      >
                        {title}
                      </Link>
                    </li>
                  )
                })}
              </ol>
              <Link to={phasePath(phase.id)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ignition-400">
                {complete ? 'Review this phase' : done === 0 ? 'Open this phase' : 'Continue this phase'}
                {!complete && nextTitle ? `: ${nextTitle}` : ''} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </li>
          )
        })}
      </ol>

      <p className="mt-10 font-mono text-xs tracking-[0.16em] text-ink-subtle uppercase">Browse by topic</p>
      <Stagger className="mt-4 grid gap-4 sm:grid-cols-2">
        {visibleModules.map((m) => {
          const available = m.lessons.length > 0
          const done = m.lessons.filter((l) => isDone(m.id, l.id)).length
          const number = coreModules.indexOf(m) + 1
          return (
            <StaggerItem key={m.id}>
              <Link to={`/learn/${m.id}`} className="block h-full">
                <Card interactive className="flex h-full flex-col gap-4 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="tabular font-mono text-xs text-ink-subtle">{m.optional ? 'Optional · go deeper' : `Topic ${String(number).padStart(2, '0')}`}</span>
                    {available ? (
                      <span className="flex items-center gap-2">
                        <Badge>
                          <Clock className="size-3" aria-hidden /> {hours(moduleMinutes(m))}
                        </Badge>
                        <Badge tone={m.optional ? undefined : 'ok'}>
                          <BookOpen className="size-3" aria-hidden /> {m.lessons.length} lessons
                        </Badge>
                      </span>
                    ) : (
                      <Badge>Coming soon</Badge>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-ink">{m.title}</h2>
                  <p className="flex-1 text-ink-muted">{m.description}</p>
                  {available && done > 0 && (
                    <p className="tabular font-mono text-xs text-ok-400" data-module-done>
                      {done} of {m.lessons.length} completed
                    </p>
                  )}
                  <span className="flex items-center gap-1.5 text-sm font-medium text-ignition-400">
                    {!available ? 'See what’s planned' : done === m.lessons.length ? 'Review topic' : done > 0 ? 'Open topic' : 'Open topic'} <ArrowRight className="size-4" aria-hidden />
                  </span>
                </Card>
              </Link>
            </StaggerItem>
          )
        })}
      </Stagger>

      <Link to="/glossary" className="mt-8 flex items-center gap-3 rounded-2xl border border-line bg-surface p-5 text-sm text-ink-muted hover:border-line-strong">
        <BookText className="size-5 shrink-0 text-ignition-400" aria-hidden />
        <span className="flex-1">
          <span className="text-ink">New to the words?</span> The glossary explains clutch, friction zone, countersteering and the rest in plain language, and links each one to its lesson.
        </span>
        <ArrowRight className="size-4 shrink-0" aria-hidden />
      </Link>
      <Link to="/challenges" className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-surface p-5 text-sm text-ink-muted hover:border-line-strong">
        <TrafficCone className="size-5 shrink-0 text-caution-400" aria-hidden />
        <span className="flex-1">
          <span className="text-ink">Practical challenges.</span> Rehearse starts, stops, a hill and an emergency brake in the cockpit — then repeat the ones that need a real motorcycle with an instructor.
        </span>
        <ArrowRight className="size-4 shrink-0" aria-hidden />
      </Link>
      <Link to="/simulators" className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-surface p-5 text-sm text-ink-muted hover:border-line-strong">
        <Gauge className="size-5 shrink-0 text-coolant-400" aria-hidden />
        <span className="flex-1">
          <span className="text-ink">Want hands-on practice alongside the lessons?</span> The simulators let you start the engine, find the clutch’s biting point, change gear and brake — in the order a new rider learns them.
        </span>
        <ArrowRight className="size-4 shrink-0" aria-hidden />
      </Link>
    </Container>
  )
}
