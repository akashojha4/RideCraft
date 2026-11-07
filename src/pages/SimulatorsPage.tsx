import { ArrowRight, CircleCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { cockpitScenarios } from '@/content/scenarios/cockpit'
import { exercises as clutchExercises } from '@/content/simulators/clutchThrottle'
import { exercises as gearExercises } from '@/content/simulators/gears'
import { exercises as rideExercises } from '@/content/simulators/rideStop'
import { useProgress } from '@/lib/progress/store'
import { usePageTitle } from '@/hooks/usePageTitle'

/** The simulators in the order a new rider learns the skills; `progress` is the id their exercises are saved under. */
const simulators = [
  {
    route: '/simulators/starting',
    title: 'Starting the engine',
    summary: 'Neutral, ignition, starter: start a geared motorcycle and see the starter motor turn the crankshaft and the engine come to life.',
  },
  {
    route: '/simulators/clutch-throttle',
    title: 'Clutch & throttle',
    summary: 'The skill that matters most: find the biting point and balance clutch and throttle to pull away without stalling.',
    progress: { id: 'clutch-throttle', total: clutchExercises.length },
  },
  {
    route: '/simulators/gears',
    title: 'Changing gear',
    summary: 'Change up and down and see how each gear changes engine speed, road speed and pulling power.',
    progress: { id: 'gears', total: gearExercises.length },
  },
  {
    route: '/simulators/ride-and-stop',
    title: 'Riding & stopping',
    summary: 'Pull away, hold a steady speed and stop smoothly with the front and rear brakes.',
    progress: { id: 'ride-and-stop', total: rideExercises.length },
  },
  {
    route: '/simulators/cockpit',
    title: 'Rider cockpit',
    summary: 'Put it all together from the rider’s seat, with a guide for each situation: moving off, stopping, hills, traffic and U-turns.',
    progress: { id: 'cockpit', total: cockpitScenarios.length },
  },
  {
    route: '/simulators/clutch-explorer',
    title: 'Clutch explorer',
    summary: 'Go deeper: open up the clutch and watch the pushrod, springs and plates as you pull the lever.',
    deeper: true,
  },
]

export default function SimulatorsPage() {
  usePageTitle('Simulators')
  const { exercisesPassed } = useProgress()
  const passed = (id: string) => Object.keys(exercisesPassed).filter((k) => k.startsWith(`${id}/`)).length
  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Simulators"
        title="Practise every control, see every part respond"
        description="Work through them in order — each skill builds on the one before. Every simulator can be paused and slowed down, and shows what happens inside the motorcycle as you work the controls."
      />
      <Stagger as="ol" className="mt-12 grid gap-4 sm:grid-cols-2">
        {simulators.map((p, i) => {
          const done = p.progress ? passed(p.progress.id) : 0
          const total = p.progress?.total ?? 0
          return (
            <StaggerItem as="li" key={p.route}>
              <Link to={p.route} className="block h-full">
                <Card interactive className="flex h-full flex-col gap-4 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-ink-subtle">{p.deeper ? 'Go deeper' : `Step ${i + 1}`}</span>
                    {p.progress &&
                      (done >= total ? (
                        <Badge tone="ok">
                          <CircleCheck className="size-3" aria-hidden /> Done
                        </Badge>
                      ) : done > 0 ? (
                        <Badge tone="ignition">
                          {done} of {total} exercises
                        </Badge>
                      ) : (
                        <Badge>{total} exercises</Badge>
                      ))}
                  </div>
                  <h2 className="text-xl font-semibold text-ink">{p.title}</h2>
                  <p className="flex-1 text-ink-muted">{p.summary}</p>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-ignition-400">
                    {done > 0 && done < total ? 'Continue' : 'Open'} <ArrowRight className="size-4" aria-hidden />
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
