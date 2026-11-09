import { ArrowRight, Monitor, Motorbike } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { practicalChallenges, type ChallengeMode } from '@/content/academy'
import { usePageTitle } from '@/hooks/usePageTitle'

const MODE: Record<ChallengeMode, { label: string; hint: string }> = {
  sim: { label: 'Simulator', hint: 'Rehearse in the cockpit or a decision scenario.' },
  live: { label: 'Live motorcycle', hint: 'Needs a real motorcycle, a closed area, and an instructor. The cockpit cannot do this yet.' },
  both: { label: 'Cockpit, then live', hint: 'Rehearse here, then repeat on a real motorcycle with an instructor.' },
}

export default function ChallengesPage() {
  usePageTitle('Practical challenges')
  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Practical challenges"
        title="Rehearse here. Pass it for real with an instructor."
        description="These are yard and road exercises, not a licence. A clean run in the cockpit is rehearsal. Figure-eights, slalom and a felt U-turn still need a motorcycle and someone qualified watching."
      />
      <div className="mt-10 grid gap-4">
        {practicalChallenges.map((c) => {
          const mode = MODE[c.mode]
          return (
            <Card key={c.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-ink">{c.title}</h2>
                  <Badge>{c.difficulty}</Badge>
                  <Badge tone={c.mode === 'live' ? 'caution' : 'ok'}>
                    {c.mode === 'live' ? <Motorbike className="size-3" aria-hidden /> : <Monitor className="size-3" aria-hidden />} {mode.label}
                  </Badge>
                </div>
                <p className="text-sm text-ink-muted">{c.perform}</p>
                <p className="text-sm text-ink">
                  <span className="text-ink-subtle">Evaluates: </span>
                  {c.skill}
                </p>
                <p className="text-xs text-ink-subtle">{mode.hint}</p>
              </div>
              {c.to && (
                <Link to={c.to} className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-xl bg-ignition-500 px-4 text-sm font-medium text-bg hover:bg-ignition-400">
                  Open <ArrowRight className="size-4" aria-hidden />
                </Link>
              )}
            </Card>
          )
        })}
      </div>
      <p className="mt-8 text-sm text-ink-muted">
        Completing these in RideCraft does not mean you are ready for a public road. That still needs the licence your country requires, and time with a qualified instructor.
      </p>
    </Container>
  )
}
