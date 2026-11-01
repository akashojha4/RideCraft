import { ArrowRight, CircleCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { scenarios } from '@/content/scenarios'
import { useProgress } from '@/lib/progress/store'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function ScenariosPage() {
  usePageTitle('Real-world scenarios')
  const solved = Object.keys(useProgress().scenariosSolved)
  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Real-world scenarios"
        title="Decide what to do — then see what happens"
        description="Fourteen situations from real roads. Each decision is played out with the same physics as the simulators, so you see exactly why one choice is safe and another isn’t."
      />
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-muted">
        <p className="tabular font-mono" data-solved>
          {solved.length} of {scenarios.length} solved
        </p>
        <p>Drawn for left-hand traffic, as in India and the UK. The physics is the same everywhere.</p>
      </div>
      <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((s) => (
          <StaggerItem key={s.id}>
            <Link to={`/scenarios/${s.id}`} className="block h-full">
              <Card interactive className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-ink-subtle">Scenario {s.number}</span>
                  {solved.includes(s.id) && (
                    <span className="flex items-center gap-1 text-xs text-ok-400">
                      <CircleCheck className="size-3.5" aria-hidden /> Solved
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-ink">{s.title}</h2>
                <p className="flex-1 text-sm text-ink-muted">{s.summary}</p>
                <span className="flex items-center gap-1.5 text-sm font-medium text-ignition-400">
                  Start <ArrowRight className="size-4" aria-hidden />
                </span>
              </Card>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </Container>
  )
}
