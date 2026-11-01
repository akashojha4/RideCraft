import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

export function CtaSection() {
  return (
    <section className="pb-8">
      <Container>
        <Reveal className="relative overflow-hidden rounded-3xl border border-ignition-500/25 bg-gradient-to-br from-ignition-950 via-surface to-surface px-6 py-14 sm:px-12 sm:py-16">
          <div aria-hidden className="bg-blueprint absolute inset-0 opacity-60 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
          <div aria-hidden className="absolute -right-24 -bottom-24 size-80 rounded-full bg-ignition-500/15 blur-3xl" />
          <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl space-y-3">
              <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Start with the machine.</h2>
              <p className="text-lg text-ink-muted">
                Riders who understand what the clutch, gears and brakes are doing make smoother, safer decisions. Begin
                with the fundamentals.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <ButtonLink to="/learn" size="lg" trailingIcon={<ArrowRight className="size-4" />}>
                Start learning
              </ButtonLink>
              <ButtonLink to="/simulators" size="lg" variant="secondary">
                See the simulators
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
