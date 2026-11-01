import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { PhaseStatusBadge } from '@/components/roadmap/PhaseStatusBadge'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { phases } from '@/config/roadmap'
import { usePageTitle } from '@/hooks/usePageTitle'

const simulatorPhases = phases.filter((p) => p.route?.startsWith('/simulators/'))

export default function SimulatorsPage() {
  usePageTitle('Simulators')
  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Simulators"
        title="Practise every control, see every part respond"
        description="Each simulator links what the rider does to what happens inside the motorcycle, step by step, at any speed."
      />
      <Stagger className="mt-12 grid gap-4 sm:grid-cols-2">
        {simulatorPhases.map((p) => (
          <StaggerItem key={p.number}>
            <Link to={p.route!} className="block h-full">
              <Card interactive className="flex h-full flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-ink-subtle">Phase {p.number}</span>
                  <PhaseStatusBadge status={p.status} />
                </div>
                <h2 className="text-xl font-semibold text-ink">{p.title}</h2>
                <p className="flex-1 text-ink-muted">{p.summary}</p>
                <span className="flex items-center gap-1.5 text-sm font-medium text-ignition-400">
                  View <ArrowRight className="size-4" aria-hidden />
                </span>
              </Card>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </Container>
  )
}
