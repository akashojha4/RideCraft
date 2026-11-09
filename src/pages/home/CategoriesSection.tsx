import { ArrowUpRight, BookOpen, ClipboardCheck, Cog, Eye, Flag, Gauge, Motorbike, Route, TrafficCone, type LucideIcon } from 'lucide-react'
import { catalog } from '@/config/catalog'
import { Link } from 'react-router-dom'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { AvailabilityBadge } from '@/components/roadmap/AvailabilityBadge'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/cn'

interface Category {
  title: string
  description: string
  meta: string
  icon: LucideIcon
  to: string
  phase: number
  featured?: boolean
  /** Extra grid classes so the bento layout has no orphaned cells. */
  span?: string
}

const categories: Category[] = [
  {
    title: 'Simulators',
    description:
      'Start the engine, find the clutch biting point, shift through the gears, then ride and stop — watching the engine, clutch, gearbox and wheel respond to every input.',
    meta: `${catalog.simulators} simulators`,
    icon: Gauge,
    to: '/simulators',
    phase: 5,
    featured: true,
  },
  {
    title: 'Motorcycle Basics',
    description: 'Controls, engine basics, RPM, torque, gears, clutch, throttle, brakes and the drivetrain.',
    meta: `${catalog.lessons.basics} lessons`,
    icon: BookOpen,
    to: '/learn/basics',
    phase: 3,
  },
  {
    title: 'Pre-Ride Preparation',
    description: 'Riding posture, protective gear and the inspections to make before every ride.',
    meta: `${catalog.lessons['pre-ride']} lessons · checklist`,
    icon: ClipboardCheck,
    to: '/learn/pre-ride',
    phase: 4,
  },
  {
    title: 'Your First Ride',
    description: 'Getting on and off, walking the motorcycle, recovering from a stall, and the licence and gear that come before a public road.',
    meta: `${catalog.lessons['first-ride']} lessons`,
    icon: Flag,
    to: '/learn/first-ride',
    phase: 4,
  },
  {
    title: 'Riding Situations',
    description: 'Moving off, stopping, hills, traffic, hazards and U-turns: each control explained, watched, then practised in the cockpit.',
    meta: `${catalog.lessons['riding-situations']} lessons`,
    icon: Motorbike,
    to: '/learn/riding-situations',
    phase: 13,
  },
  {
    title: 'Turning & Handling',
    description: 'Leaning, countersteering, body position, U-turns and slow-speed control.',
    meta: `${catalog.lessons.handling} lessons`,
    icon: Route,
    to: '/learn/handling',
    phase: 9,
  },
  {
    title: 'Roadcraft',
    description: 'Seeing and being seen, following distance, junctions, other people, night and a passenger.',
    meta: `${catalog.lessons.roadcraft} lessons`,
    icon: Eye,
    to: '/learn/roadcraft',
    phase: 10,
  },
  {
    title: 'Real-World Scenarios',
    description: 'Traffic, hills, wet roads, gravel, emergency braking, overtaking, night riding and pillions.',
    meta: `${catalog.scenarios} scenarios`,
    icon: TrafficCone,
    to: '/scenarios',
    phase: 10,
  },
  {
    title: 'Advanced Mechanics · optional',
    description: 'For the curious, once you can ride: combustion, compression ratio, fuel systems, cooling, ABS, traction control and tyre dynamics.',
    meta: `${catalog.lessons.mechanics} deep-dives`,
    icon: Cog,
    to: '/learn/mechanics',
    phase: 11,
  },
]

/** Rev-counter graphic for the featured card; the needle sweeps up on hover. */
function TachGraphic() {
  const ticks = Array.from({ length: 11 }, (_, i) => -210 + i * 24)
  return (
    <svg viewBox="-60 -60 120 90" className="h-28 w-40 shrink-0 lg:mx-auto lg:h-48 lg:w-64" aria-hidden>
      <path d="M-46.8,27 A54,54 0 1 1 46.8,27" fill="none" strokeWidth={3} className="stroke-line-strong" />
      <path d="M38.2,-38.2 A54,54 0 0 1 46.8,27" fill="none" strokeWidth={3} className="stroke-danger-500" />
      {ticks.map((a) => {
        const r = (a * Math.PI) / 180
        return (
          <line
            key={a}
            x1={Math.cos(r) * 44}
            y1={Math.sin(r) * 44}
            x2={Math.cos(r) * 50}
            y2={Math.sin(r) * 50}
            strokeWidth={2}
            className="stroke-ink-subtle"
          />
        )
      })}
      <g
        className="rotate-[-200deg] transition-[rotate] duration-700 ease-out group-hover:rotate-[-70deg]"
        style={{ transformBox: 'view-box', transformOrigin: '0 0' }}
      >
        <line x1={0} y1={0} x2={42} y2={0} strokeWidth={3} strokeLinecap="round" className="stroke-ignition-500" />
      </g>
      <circle r={5} className="fill-surface-overlay stroke-ignition-500" />
    </svg>
  )
}

export function CategoriesSection() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="What you’ll learn"
          title="From first principles to real roads"
          description="From knowing nothing about a motorcycle to understanding it well enough to start real practice with confidence."
        />
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <StaggerItem key={c.title} className={cn(c.featured && 'sm:col-span-2 lg:row-span-2', c.span)}>
              <Link
                to={c.to}
                className={cn(
                  'group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-card',
                  'transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-raised',
                  c.featured && 'border-ignition-500/25 bg-gradient-to-br from-ignition-950/70 to-surface',
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-bg">
                    <c.icon className="size-5 text-ignition-400" aria-hidden />
                  </span>
                  <AvailabilityBadge phase={c.phase} />
                </div>
                <div className={cn('flex flex-1 gap-6', c.featured ? 'flex-col sm:flex-row sm:items-end lg:flex-col lg:items-stretch' : 'flex-col')}>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-semibold text-ink">{c.title}</h3>
                    <p className="leading-relaxed text-ink-muted">{c.description}</p>
                  </div>
                  {c.featured && <TachGraphic />}
                </div>
                <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
                  <span className="font-mono text-xs text-ink-subtle">{c.meta}</span>
                  <ArrowUpRight
                    className="size-4 text-ink-subtle transition-[color,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ignition-400"
                    aria-hidden
                  />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  )
}
