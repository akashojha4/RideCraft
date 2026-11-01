import { Fragment } from 'react'
import { ArrowDown, ArrowRight, Cog, Hand, ShieldCheck, type LucideIcon } from 'lucide-react'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/cn'

const steps: { icon: LucideIcon; label: string; title: string; body: string; tone: string; accent: string; iconTone: string }[] = [
  {
    icon: Hand,
    label: 'Rider action',
    title: 'You squeeze the clutch lever',
    body: 'Your left hand pulls the lever towards the grip, and the cable transmits the movement to the engine.',
    tone: 'border-ignition-500/30 bg-ignition-950/50',
    accent: 'text-ignition-400',
    iconTone: 'border-ignition-500/30',
  },
  {
    icon: Cog,
    label: 'Mechanical response',
    title: 'The clutch plates stop gripping',
    body: 'The release mechanism lifts the pressure plate against its springs. With the clamping force gone, the friction plates slip and the engine no longer drives the gearbox.',
    tone: 'border-coolant-500/30 bg-coolant-950/50',
    accent: 'text-coolant-400',
    iconTone: 'border-coolant-500/30',
  },
  {
    icon: ShieldCheck,
    label: 'Why it matters',
    title: 'You can change gear or stop',
    body: 'With the drive disconnected you can select a gear smoothly, or come to a halt in gear without stalling the engine.',
    tone: 'border-ok-500/30 bg-ok-950/50',
    accent: 'text-ok-400',
    iconTone: 'border-ok-500/30',
  },
]

export function MethodSection() {
  return (
    <section className="border-y border-line bg-surface-sunken/60 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="How RideCraft teaches"
          title="See what you do — and what the machine does"
          description="Every lesson and simulator connects three things. Here is one example: pulling in the clutch lever."
        />
        <Stagger className="mt-12 grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {steps.map((step, i) => (
            <Fragment key={step.label}>
              <StaggerItem className={cn('flex flex-col gap-4 rounded-2xl border p-6', step.tone)}>
                <div className="flex items-center gap-3">
                  <span className={cn('flex size-9 items-center justify-center rounded-xl border bg-bg/60', step.accent, step.iconTone)}>
                    <step.icon className="size-4.5" aria-hidden />
                  </span>
                  <span className={cn('font-mono text-xs tracking-[0.16em] uppercase', step.accent)}>
                    {i + 1}. {step.label}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-ink">{step.title}</h3>
                <p className="leading-relaxed text-ink-muted">{step.body}</p>
              </StaggerItem>
              {i < steps.length - 1 && (
                <div className="flex items-center justify-center text-ink-subtle" aria-hidden>
                  <ArrowDown className="size-5 lg:hidden" />
                  <ArrowRight className="hidden size-5 lg:block" />
                </div>
              )}
            </Fragment>
          ))}
        </Stagger>
      </Container>
    </section>
  )
}
