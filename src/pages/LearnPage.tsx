import { ArrowRight, BookOpen, BookText, Clock, Gauge } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { coreModules, moduleMinutes, nextLesson, visibleModules } from '@/content/curriculum'
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
  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Curriculum"
        title="Learn to ride, from the machine up"
        description={`Work through the modules in order: understand the motorcycle, prepare to ride, then learn each riding situation and practise it in the cockpit. The core course takes ${hours(coreMinutes)}, in lessons of 5–12 minutes — a few a day is plenty.`}
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
              {upNext.module.title} · lesson {upNext.module.lessons.indexOf(upNext.lesson) + 1} of {upNext.module.lessons.length} · {upNext.lesson.durationMinutes} min
            </p>
          </div>
          <span className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-xl bg-ignition-500 px-5 text-sm font-medium text-bg group-hover:bg-ignition-400 sm:self-auto">
            {started ? 'Continue' : 'Start the first lesson'} <ArrowRight className="size-4" aria-hidden />
          </span>
        </Link>
      )}

      <Stagger className="mt-8 grid gap-4 sm:grid-cols-2">
        {visibleModules.map((m) => {
          const available = m.lessons.length > 0
          const done = m.lessons.filter((l) => isDone(m.id, l.id)).length
          const number = coreModules.indexOf(m) + 1
          return (
            <StaggerItem key={m.id}>
              <Link to={`/learn/${m.id}`} className="block h-full">
                <Card interactive className="flex h-full flex-col gap-4 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="tabular font-mono text-xs text-ink-subtle">{m.optional ? 'Optional · go deeper' : `Module ${String(number).padStart(2, '0')}`}</span>
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
                    {!available ? 'See what’s planned' : done === m.lessons.length ? 'Review module' : done > 0 ? 'Continue module' : 'Open module'} <ArrowRight className="size-4" aria-hidden />
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
