import { Check } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { Readout } from '@/components/simulation/Readouts'
import { cn } from '@/lib/cn'

/** Pre-ride lesson 2: protective equipment, item by item, on a front-view rider. */

type GearId = 'helmet' | 'eyes' | 'jacket' | 'gloves' | 'trousers' | 'boots' | 'hivis'

const gear: { id: GearId; name: string; essential: boolean; protects: string; lookFor: string }[] = [
  {
    id: 'helmet',
    name: 'Helmet',
    essential: true,
    protects: 'Your head and brain — the most important protection you can wear.',
    lookFor: 'Certified to your country’s standard (for example ECE 22.06, DOT or ISI), a snug fit and the strap fastened every time.',
  },
  {
    id: 'eyes',
    name: 'Eye protection',
    essential: true,
    protects: 'Your eyes from wind, rain, insects and stones, which can blind you at speed.',
    lookFor: 'A clean, scratch-free visor or goggles. Tinted visors only in daylight.',
  },
  {
    id: 'jacket',
    name: 'Jacket',
    essential: true,
    protects: 'Your skin from road abrasion and your shoulders and elbows from impact.',
    lookFor: 'Leather or abrasion-resistant textile with certified armour at shoulders and elbows; a back protector is recommended.',
  },
  {
    id: 'gloves',
    name: 'Gloves',
    essential: true,
    protects: 'Your hands, which instinctively go out to break a fall.',
    lookFor: 'Full-finger motorcycle gloves with palm and knuckle protection, covering the wrist.',
  },
  {
    id: 'trousers',
    name: 'Trousers',
    essential: true,
    protects: 'Your legs from abrasion, and your knees and hips from impact.',
    lookFor: 'Motorcycle trousers with knee and hip armour. Ordinary jeans wear through in a slide very quickly.',
  },
  {
    id: 'boots',
    name: 'Boots',
    essential: true,
    protects: 'Your feet and ankles from crushing, twisting and burns.',
    lookFor: 'Sturdy boots covering the ankle, with a firm grippy sole and no loose laces to catch on the pegs.',
  },
  {
    id: 'hivis',
    name: 'High-visibility',
    essential: false,
    protects: 'You — by helping other road users see you sooner, day and night.',
    lookFor: 'Bright colours by day and reflective panels at night, on your jacket or a vest.',
  },
]

const exposedPart: Record<GearId, string> = {
  helmet: 'head',
  eyes: 'eyes',
  jacket: 'arms and torso',
  gloves: 'hands',
  trousers: 'legs',
  boots: 'feet and ankles',
  hivis: '',
}

/** Front-view rider; each region is drawn as protected (worn) or exposed. */
function Figure({ worn }: { worn: Record<GearId, boolean> }) {
  const region = (on: boolean, children: ReactNode, key: string) => (
    <g key={key} className={on ? 'fill-surface-overlay stroke-ok-400' : 'fill-surface-raised stroke-caution-400'} strokeDasharray={on ? undefined : '4 3'} strokeWidth={2}>
      {children}
    </g>
  )
  return (
    <svg viewBox="40 0 220 340" className="mx-auto h-72 sm:h-80" role="img" aria-label="Rider wearing the selected protective equipment">
      <g strokeLinejoin="round" strokeLinecap="round">
        {region(worn.trousers, <path d="M116,186 L184,186 L190,296 L158,296 L150,214 L142,296 L110,296 Z" />, 'legs')}
        {region(worn.boots, <><path d="M108,296 h34 v24 h-40 Z" /><path d="M158,296 h34 l6,24 h-40 Z" /></>, 'boots')}
        {region(worn.jacket, <path d="M112,80 C126,74 174,74 188,80 L210,168 L192,174 L182,130 L184,190 L116,190 L118,130 L108,174 L90,168 Z" />, 'jacket')}
        {worn.hivis && <path d="M128,82 L120,190 M172,82 L180,190 M118,150 L182,150" fill="none" strokeWidth={6} className="stroke-caution-400" />}
        {region(worn.gloves, <><rect x={82} y={168} width={26} height={30} rx={10} /><rect x={192} y={168} width={26} height={30} rx={10} /></>, 'gloves')}
        {region(worn.helmet, <path d="M120,48 C120,14 180,14 180,48 L180,66 C180,74 120,74 120,66 Z" />, 'helmet')}
        {region(worn.eyes, <rect x={130} y={36} width={40} height={14} rx={6} />, 'eyes')}
      </g>
    </svg>
  )
}

export default function ProtectiveGear() {
  const [worn, setWorn] = useState<Record<GearId, boolean>>({ helmet: true, eyes: false, jacket: false, gloves: false, trousers: false, boots: false, hivis: false })
  const [focus, setFocus] = useState<GearId>('helmet')
  const essentials = gear.filter((g) => g.essential)
  const wornCount = essentials.filter((g) => worn[g.id]).length
  const missing = essentials.filter((g) => !worn[g.id])
  const item = gear.find((g) => g.id === focus)!

  return (
    <DiagramFrame
      stage={<Figure worn={worn} />}
      controls={
        <>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {gear.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={worn[g.id]}
                  onClick={() => {
                    setWorn((w) => ({ ...w, [g.id]: !w[g.id] }))
                    setFocus(g.id)
                  }}
                  className={cn(
                    'flex h-10 w-full items-center gap-3 rounded-lg border px-3 text-left text-sm transition-colors',
                    worn[g.id] ? 'border-ok-500/50 bg-ok-950 text-ink' : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
                  )}
                >
                  <span className={cn('flex size-4 items-center justify-center rounded border', worn[g.id] ? 'border-ok-400 bg-ok-500' : 'border-line-strong')}>
                    {worn[g.id] && <Check className="size-3 text-bg" aria-hidden />}
                  </span>
                  <span className="flex-1">{g.name}</span>
                  {!g.essential && <span className="text-xs text-ink-subtle">recommended</span>}
                </button>
              </li>
            ))}
          </ul>
          <dl className="flex flex-wrap gap-6">
            <Readout label="Essential gear" value={`${wornCount} of ${essentials.length}`} tone={wornCount === essentials.length ? 'ok' : 'caution'} />
            <Readout label="Exposed" value={missing.length ? missing.map((g) => exposedPart[g.id]).join(', ') : 'Nothing'} tone={missing.length ? 'caution' : 'ok'} />
          </dl>
        </>
      }
      status={
        <>
          <span className="font-medium text-ink">{item.name}.</span> Protects: {item.protects}{' '}
          <span className="text-ink-subtle">Look for: {item.lookFor}</span>
          <span className={cn('mt-1.5 block', missing.length ? 'text-caution-400' : 'text-ok-400')}>
            {missing.length
              ? `Not ready to ride: still missing ${missing.map((g) => g.name.toLowerCase()).join(', ')}.`
              : 'Fully equipped — every essential item is on.'}
          </span>
        </>
      }
    />
  )
}
