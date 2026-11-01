import { MousePointerClick, ScanLine } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PartDetail } from '@/components/anatomy/PartDetail'
import { PartList } from '@/components/anatomy/PartList'
import { MotorcycleSideView } from '@/components/motorcycle/MotorcycleSideView'
import { partIds, parts, type PartId } from '@/components/motorcycle/parts'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/cn'
import { transition } from '@/lib/motion'

const isPartId = (v: string | null): v is PartId => partIds.includes(v as PartId)

export default function AnatomyPage() {
  const [params, setParams] = useSearchParams()
  const param = params.get('part')
  const selected: PartId = isPartId(param) ? param : 'engine'
  const [hovered, setHovered] = useState<PartId | null>(null)
  const [xray, setXray] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const pointerOnDrawing = useRef(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    document.title = `${parts[selected].name} · Anatomy Explorer · RideCraft`
    return () => {
      document.title = 'RideCraft — Interactive Motorcycle Academy'
    }
  }, [selected])

  /** Select a part; when chosen by pointer, bring its explanation into view if it isn't. */
  function select(id: PartId, { scroll }: { scroll: boolean }) {
    // Selecting a part is an in-page change: keep history and scroll position intact.
    setParams({ part: id }, { replace: true, preventScrollReset: true })
    const panel = panelRef.current
    if (!scroll || !panel) return
    const { top } = panel.getBoundingClientRect()
    if (top < 64 || top > window.innerHeight * 0.75) {
      panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    }
  }

  return (
    <Container className="py-10 sm:py-14">
      <SectionHeading
        as="h1"
        eyebrow="Anatomy explorer"
        title="Every part, and how it works"
        description="Click any part of the motorcycle — or choose from the list — to see what it does, how it works inside and what it connects to."
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-12">
        <div className="space-y-6 self-start lg:sticky lg:top-20">
          <div className="rounded-3xl border border-line bg-surface-sunken p-3 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-2">
              <p className="flex items-center gap-2 text-xs text-ink-subtle">
                <MousePointerClick className="size-3.5" aria-hidden />
                <span aria-live="polite">
                  {hovered && hovered !== selected ? (
                    <>
                      <span className="text-coolant-300">{parts[hovered].name}</span> — click to explore
                    </>
                  ) : (
                    'Click or tap any part · arrow keys work when the drawing is focused'
                  )}
                </span>
              </p>
              <button
                type="button"
                aria-pressed={xray}
                onClick={() => setXray((v) => !v)}
                className={cn(
                  'flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors',
                  xray ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink',
                )}
              >
                <ScanLine className="size-3.5" aria-hidden /> X-ray
              </button>
            </div>
            <div className="bg-blueprint rounded-2xl" onPointerDown={() => (pointerOnDrawing.current = true)}>
              <MotorcycleSideView
                mode={xray ? 'mechanical' : 'plain'}
                highlighted={hovered ?? selected}
                selected={selected}
                onPartHover={setHovered}
                onPartSelect={(id) => {
                  select(id, { scroll: pointerOnDrawing.current })
                  pointerOnDrawing.current = false
                }}
                title="Motorcycle components"
              />
            </div>
          </div>
          <PartList selected={selected} onSelect={(id) => select(id, { scroll: true })} />
        </div>

        <div ref={panelRef} className="min-w-0 scroll-mt-20">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={transition.base}
            >
              <PartDetail id={selected} onSelect={(id) => select(id, { scroll: true })} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Container>
  )
}
