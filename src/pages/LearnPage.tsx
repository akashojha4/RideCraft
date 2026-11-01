import { ArrowRight, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { visibleModules } from '@/content/curriculum'
import { useProgress } from '@/lib/progress/store'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function LearnPage() {
  usePageTitle('Learn')
  const { lessons } = useProgress()
  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Curriculum"
        title="Learn to ride, from the machine up"
        description="Each module builds on the one before it: understand the motorcycle first, prepare to ride, then practise each skill in the simulators."
      />

      <Stagger className="mt-12 grid gap-4 sm:grid-cols-2">
        {visibleModules.map((m, i) => {
          const available = m.lessons.length > 0
          const done = m.lessons.filter((l) => lessons[`${m.id}/${l.id}`]?.completedAt).length
          return (
            <StaggerItem key={m.id}>
              <Link to={`/learn/${m.id}`} className="block h-full">
                <Card interactive className="flex h-full flex-col gap-4 p-6">
                  <div className="flex items-center justify-between">
                    <span className="tabular font-mono text-xs text-ink-subtle">Module {String(i + 1).padStart(2, '0')}</span>
                    {available ? (
                      <Badge tone="ok">
                        <BookOpen className="size-3" aria-hidden /> {m.lessons.length} lessons
                      </Badge>
                    ) : (
                      <Badge>Arrives in Phase {m.phase}</Badge>
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
                    {available ? 'Open module' : 'See what’s planned'} <ArrowRight className="size-4" aria-hidden />
                  </span>
                </Card>
              </Link>
            </StaggerItem>
          )
        })}
      </Stagger>
    </Container>
  )
}
