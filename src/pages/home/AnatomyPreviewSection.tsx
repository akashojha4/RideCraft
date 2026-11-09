import { ArrowRight, MapPin } from 'lucide-react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { MotorcycleSideView } from '@/components/motorcycle/MotorcycleSideView'
import { mainPartIds, parts, type PartId } from '@/components/motorcycle/parts'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/cn'
import { transition } from '@/lib/motion'

const AUTO_ADVANCE_MS = 3200
const partIds: readonly PartId[] = mainPartIds
const WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve']
const allParts = Object.keys(parts).length

/**
 * A taste of the Phase 2 Anatomy Explorer: pick a component (or hover it on the
 * drawing) to highlight it and read a one-line summary. Until the visitor interacts,
 * the selection tours the components automatically.
 */
export function AnatomyPreviewSection() {
  const [selected, setSelected] = useState<PartId>('engine')
  const [touring, setTouring] = useState(true)
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.4 })

  useEffect(() => {
    if (!touring || !inView || reduceMotion) return
    const id = window.setInterval(() => {
      setSelected((current) => partIds[(partIds.indexOf(current) + 1) % partIds.length])
    }, AUTO_ADVANCE_MS)
    return () => window.clearInterval(id)
  }, [touring, inView, reduceMotion])

  const choose = (id: PartId) => {
    setTouring(false)
    setSelected(id)
  }

  const info = parts[selected]

  return (
    <section className="border-y border-line bg-surface-sunken/60 py-20 sm:py-28">
      <Container>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Motorcycle anatomy"
            title="Know every part before you ride"
            description={`${WORDS[partIds.length] ?? partIds.length} main components do the work of turning fuel into forward motion — and stopping it again. Select one to see where it is; the anatomy explorer covers all ${allParts} parts.`}
          />
          <ButtonLink to={`/anatomy?part=${selected}`} variant="outline" trailingIcon={<ArrowRight className="size-4" />} className="self-start lg:self-auto">
            Open the anatomy explorer
          </ButtonLink>
        </div>

        <div ref={ref} className="mt-12 grid gap-6 lg:grid-cols-[7fr_5fr] lg:gap-8">
          <div className="bg-blueprint rounded-3xl border border-line bg-surface-sunken p-3 sm:p-6">
            <MotorcycleSideView
              highlighted={selected}
              onPartHover={(id) => id && partIds.includes(id) && choose(id)}
              title={`Motorcycle side view with the ${info.name.toLowerCase()} highlighted`}
            />
          </div>

          <div className="flex flex-col gap-5">
            <div role="group" aria-label="Motorcycle components" className="grid grid-cols-2 gap-2">
              {partIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={selected === id}
                  onClick={() => choose(id)}
                  onFocus={() => choose(id)}
                  className={cn(
                    'relative flex h-10 items-center gap-2 overflow-hidden rounded-xl border px-3 text-left text-sm font-medium transition-colors',
                    selected === id
                      ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200'
                      : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn('size-1.5 shrink-0 rounded-full', selected === id ? 'bg-coolant-400' : 'bg-line-strong')}
                  />
                  <span className="truncate">{parts[id].name}</span>
                  {selected === id && touring && !reduceMotion && inView && (
                    <motion.span
                      aria-hidden
                      key={id}
                      className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-coolant-500/70"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: AUTO_ADVANCE_MS / 1000, ease: 'linear' }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="relative min-h-52 flex-1 rounded-2xl border border-line bg-surface p-5" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={selected}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={transition.base}
                  className="space-y-3"
                >
                  <h3 className="text-2xl font-semibold text-ink">{info.name}</h3>
                  <p className="flex items-start gap-2 text-sm text-coolant-300">
                    <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {info.location}
                  </p>
                  <p className="leading-relaxed text-ink-muted">{info.summary}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
