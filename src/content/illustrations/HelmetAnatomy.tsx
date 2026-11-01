import { RotateCcw, Zap } from 'lucide-react'
import { useId, useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

/**
 * Pre-ride lesson 3: helmet construction and types. The liner layers are the shell path
 * scaled about the head centre, so every layer follows the shell's shape. Faces left.
 */

const CENTRE = { x: 160, y: 128 }
const SHELL =
  'M70,140 C64,70 120,30 180,32 C238,34 268,80 262,140 L258,196 C256,214 240,222 222,222 L140,222 C120,222 104,212 98,200 L92,186 C80,180 72,164 70,140 Z'
const FACE_PORT = 'M74,110 C92,100 130,98 158,104 L160,150 C130,154 96,154 78,150 Z'
const OPEN_FACE_CUT = 'M60,104 C92,96 130,96 160,104 L164,236 L60,236 Z'

type LayerId = 'shell' | 'eps' | 'comfort' | 'visor' | 'strap'
type TypeId = 'full' | 'modular' | 'open' | 'offroad'

const layers: { id: LayerId; name: string; text: string }[] = [
  { id: 'shell', name: 'Outer shell', text: 'A hard shell of polycarbonate or composite fibre spreads an impact over a wider area and resists sharp objects and abrasion.' },
  { id: 'eps', name: 'EPS liner', text: 'Expanded polystyrene foam crushes during an impact, slowing your head more gently. It does the main protective work — and it only works once.' },
  { id: 'comfort', name: 'Comfort liner', text: 'Soft padding and cheek pads hold the helmet snugly in place. Often removable for washing.' },
  { id: 'visor', name: 'Visor', text: 'Protects your eyes and face from wind, rain, insects and stones. Keep it clean and replace it if scratched.' },
  { id: 'strap', name: 'Chin strap', text: 'Keeps the helmet on your head in a crash. Fasten it every time, snug enough that only a finger or two fits beneath.' },
]

const types: { id: TypeId; name: string; text: string }[] = [
  { id: 'full', name: 'Full-face', text: 'A one-piece shell with an integral chin bar — the most protection. Many crash impacts land on the chin area.' },
  { id: 'modular', name: 'Modular', text: 'The chin bar flips up for convenience. Ride with it closed and locked, and choose one certified for riding with the chin bar down.' },
  { id: 'open', name: 'Open-face', text: 'Covers the top, back and sides of the head but leaves the face and chin exposed. Wear eye protection with it.' },
  { id: 'offroad', name: 'Off-road', text: 'A long chin bar and a peak to block sun and roost, used with goggles. Designed for trails rather than road speeds.' },
]

const scaled = (s: number) => `translate(${CENTRE.x} ${CENTRE.y}) scale(${s}) translate(${-CENTRE.x} ${-CENTRE.y})`

export default function HelmetAnatomy() {
  const [layer, setLayer] = useState<LayerId>('eps')
  const [type, setType] = useState<TypeId>('full')
  const [impacted, setImpacted] = useState(false)
  const clipId = useId()
  const info = layers.find((l) => l.id === layer)!
  const typeInfo = types.find((t) => t.id === type)!
  const hasVisor = type !== 'offroad'
  const cls = (id: LayerId, base: string) => cn(base, layer === id ? 'stroke-coolant-300' : 'stroke-line-strong')

  return (
    <DiagramFrame
      stage={
        <svg viewBox="40 0 340 250" className="mx-auto w-full max-w-md" role="img" aria-label={`${typeInfo.name} helmet cross-section`}>
          <defs>
            <clipPath id={clipId}>
              <path d={`M0,0 H400 V260 H0 Z ${type === 'open' ? OPEN_FACE_CUT : FACE_PORT}`} clipRule="evenodd" />
            </clipPath>
          </defs>
          <g strokeLinejoin="round" strokeLinecap="round" clipPath={`url(#${clipId})`}>
            <path d={SHELL} strokeWidth={layer === 'shell' ? 4 : 3} className={cls('shell', 'fill-surface-overlay')} />
            <path d={SHELL} transform={scaled(0.9)} strokeWidth={2} className={cls('eps', layer === 'eps' ? 'fill-coolant-950' : 'fill-surface-raised')} />
            <path d={SHELL} transform={scaled(0.8)} strokeWidth={2} className={cls('comfort', 'fill-surface-sunken')} />
            {impacted && <ellipse cx={128} cy={52} rx={30} ry={8} transform="rotate(-24 128 52)" className="fill-bg stroke-danger-400" strokeWidth={1.5} />}
          </g>
          {/* Head */}
          <path d="M100,150 C96,96 130,70 168,70 C206,70 226,104 222,150 C220,180 204,200 176,204 L130,204 C112,200 102,180 100,150 Z" fill="none" strokeDasharray="4 4" className="stroke-ink-subtle" />
          {type === 'modular' && <><circle cx={176} cy={164} r={5} className="fill-surface-overlay stroke-ink-subtle" /><path d="M150,104 L176,164" strokeDasharray="3 3" className="stroke-ink-subtle" /></>}
          {type === 'offroad' && <path d="M60,62 L136,40 L150,56 L76,84 Z" className="fill-surface-overlay stroke-line-strong" strokeWidth={2} />}
          {type === 'offroad' && <rect x={70} y={108} width={60} height={28} rx={10} className="fill-surface-raised stroke-ink-subtle" strokeWidth={2} />}
          {hasVisor && (
            <path d={type === 'open' ? 'M62,100 C92,92 130,92 160,100 L162,150 C130,154 90,150 66,144 Z' : FACE_PORT} className={cn('fill-coolant-400/15', layer === 'visor' ? 'stroke-coolant-300' : 'stroke-ink-subtle')} strokeWidth={2} />
          )}
          <path d="M190,222 C190,236 150,240 140,224" fill="none" strokeWidth={layer === 'strap' ? 4 : 3} className={layer === 'strap' ? 'stroke-coolant-300' : 'stroke-ink-subtle'} />
          {impacted && (
            <g>
              <line x1={70} y1={0} x2={112} y2={34} strokeWidth={4} className="stroke-danger-400" />
              <path d="M102,34 L114,36 L108,24" fill="none" strokeWidth={4} className="stroke-danger-400" />
            </g>
          )}
          <DiagramLabel x={268} y={60}>Shell</DiagramLabel>
          <DiagramLabel x={268} y={76} tone="coolant">EPS</DiagramLabel>
          <DiagramLabel x={268} y={92}>Comfort liner</DiagramLabel>
        </svg>
      }
      controls={
        <>
          <div role="group" aria-label="Helmet type" className="flex flex-wrap gap-1.5">
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={type === t.id}
                onClick={() => setType(t.id)}
                className={cn('h-8 rounded-lg border px-3 text-sm transition-colors', type === t.id ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}
              >
                {t.name}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Helmet layer" className="flex flex-wrap gap-1.5">
            {layers
              .filter((l) => hasVisor || l.id !== 'visor')
              .map((l) => (
                <button
                  key={l.id}
                  type="button"
                  aria-pressed={layer === l.id}
                  onClick={() => setLayer(l.id)}
                  className={cn('h-8 rounded-lg border px-3 text-xs transition-colors sm:text-sm', layer === l.id ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}
                >
                  {l.name}
                </button>
              ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => { setImpacted(true); setLayer('eps') }} disabled={impacted} leadingIcon={<Zap className="size-4" />}>
              Simulate an impact
            </Button>
            {impacted && (
              <Button size="sm" variant="ghost" onClick={() => setImpacted(false)} leadingIcon={<RotateCcw className="size-4" />}>
                New helmet
              </Button>
            )}
          </div>
        </>
      }
      status={
        <>
          <span className="font-medium text-ink">{typeInfo.name}:</span> {typeInfo.text}{' '}
          <span className="block mt-1">
            <span className="font-medium text-coolant-300">{info.name}:</span> {info.text}
          </span>
          {impacted && (
            <span className="mt-1 block text-danger-400">
              The EPS foam has crushed where it was hit — and it doesn’t spring back. The helmet may look fine outside, but it can no longer protect you
              there. Replace any helmet after a crash or a hard drop.
            </span>
          )}
        </>
      }
    />
  )
}
