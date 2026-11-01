import { useState } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { cn } from '@/lib/cn'

/*
 * Pre-ride lesson 9: instrument warning lights through a start-up sequence.
 * Behaviour typical of a small fuel-injected motorcycle with ABS:
 *  - ignition ON: bulb check — oil pressure, charging, engine and ABS lights on;
 *  - engine running: oil and charging lights go out (oil pressure and the generator are
 *    now working); the engine light goes out if no fault is stored;
 *  - moving: the ABS light goes out once the wheel-speed sensors have checked themselves
 *    (typically by about 5–10 km/h).
 * Colours follow the usual convention: green/blue information, amber caution, red stop.
 */

type Stage = 'off' | 'ignition' | 'running' | 'moving'
type LightId = 'neutral' | 'highbeam' | 'oil' | 'battery' | 'engine' | 'abs' | 'fuel'
type Colour = 'green' | 'blue' | 'amber' | 'red'

interface Conditions {
  stage: Stage
  neutral: boolean
  highBeam: boolean
  lowFuel: boolean
  oilFault: boolean
  chargeFault: boolean
}

const lights: { id: LightId; glyph: string; name: string; colour: Colour; on: (c: Conditions) => boolean; means: string; action: string }[] = [
  { id: 'neutral', glyph: 'N', name: 'Neutral', colour: 'green', on: (c) => c.stage !== 'off' && c.neutral, means: 'The gearbox is in neutral.', action: 'Check it is on before starting the engine.' },
  { id: 'highbeam', glyph: 'HI', name: 'High beam', colour: 'blue', on: (c) => c.stage !== 'off' && c.highBeam, means: 'The headlight is on high (main) beam.', action: 'Dip it for oncoming traffic and when following another vehicle.' },
  { id: 'oil', glyph: 'OIL', name: 'Oil pressure', colour: 'red', on: (c) => c.stage === 'ignition' || (c.stage !== 'off' && c.oilFault), means: 'Engine oil pressure is too low.', action: 'Normal with the ignition on before starting. If it stays on or comes on while running, stop the engine immediately — running without oil pressure destroys an engine.' },
  { id: 'battery', glyph: 'BAT', name: 'Charging', colour: 'red', on: (c) => c.stage === 'ignition' || (c.stage !== 'off' && c.chargeFault), means: 'The battery is not being charged.', action: 'Normal before starting. If it stays on while running, the battery will go flat — have the charging system checked.' },
  { id: 'engine', glyph: 'ENG', name: 'Engine warning', colour: 'amber', on: (c) => c.stage === 'ignition', means: 'The engine management system has found a fault (or is doing its start-up check).', action: 'Normal during the ignition check. If it stays on, the engine may run in a reduced mode — have it checked soon.' },
  { id: 'abs', glyph: 'ABS', name: 'ABS', colour: 'amber', on: (c) => c.stage === 'ignition' || c.stage === 'running', means: 'Anti-lock braking is not active yet, or has a fault.', action: 'Normal until you pull away and reach about 5–10 km/h. If it stays on after that, the brakes still work but without anti-lock — get it checked.' },
  { id: 'fuel', glyph: 'FUEL', name: 'Low fuel', colour: 'amber', on: (c) => c.stage !== 'off' && c.lowFuel, means: 'The fuel level is low.', action: 'Refuel soon.' },
]

const lit: Record<Colour, string> = {
  green: 'border-ok-400 bg-ok-500 text-bg shadow-[0_0_14px_rgb(34_197_94/0.6)]',
  blue: 'border-coolant-300 bg-coolant-500 text-bg shadow-[0_0_14px_rgb(20_184_212/0.6)]',
  amber: 'border-caution-400 bg-caution-500 text-bg shadow-[0_0_14px_rgb(245_158_11/0.6)]',
  red: 'border-danger-400 bg-danger-500 text-bg shadow-[0_0_14px_rgb(239_68_68/0.6)]',
}

const stages: { id: Stage; label: string; text: string }[] = [
  { id: 'off', label: 'Key off', text: 'Ignition off: everything is dark.' },
  { id: 'ignition', label: 'Ignition on', text: 'Ignition on: the warning lights come on to show the bulbs and systems are working, and the oil and charging lights stay on because the engine isn’t running yet.' },
  { id: 'running', label: 'Engine running', text: 'Engine running: oil pressure and charging are now working, so those lights go out. ABS stays on until you move off.' },
  { id: 'moving', label: 'Riding away', text: 'Moving: the ABS light has gone out after its self-check. Only information lights you have chosen should remain.' },
]

export default function WarningLights() {
  const [c, setC] = useState<Conditions>({ stage: 'off', neutral: true, highBeam: false, lowFuel: false, oilFault: false, chargeFault: false })
  const [selected, setSelected] = useState<LightId>('oil')
  const stage = stages.find((s) => s.id === c.stage)!
  const info = lights.find((l) => l.id === selected)!
  const redWhileRunning = (c.stage === 'running' || c.stage === 'moving') && lights.some((l) => l.colour === 'red' && l.on(c))
  const toggle = (k: keyof Omit<Conditions, 'stage'>, label: string, danger = false) => (
    <button
      type="button"
      role="switch"
      aria-checked={c[k]}
      onClick={() => setC((s) => ({ ...s, [k]: !s[k] }))}
      className={cn('h-8 rounded-lg border px-3 text-xs', c[k] ? (danger ? 'border-danger-500/50 bg-danger-950 text-danger-400' : 'border-coolant-500/50 bg-coolant-950 text-coolant-200') : 'border-line text-ink-muted hover:text-ink')}
    >
      {label}
    </button>
  )

  return (
    <DiagramFrame
      stage={
        <div className="mx-auto max-w-md rounded-[2rem] border border-line-strong bg-surface-raised p-5">
          <div className="mb-4 flex justify-around">
            {['km/h', '×1000 RPM'].map((u, i) => (
              <div key={u} className="flex size-24 flex-col items-center justify-center rounded-full border-2 border-line-strong bg-bg">
                <span className="tabular font-mono text-xl text-ink">{c.stage === 'moving' ? (i === 0 ? '12' : '3.1') : c.stage === 'off' ? '' : i === 0 ? '0' : c.stage === 'ignition' ? '0' : '1.4'}</span>
                <span className="text-[10px] text-ink-subtle">{u}</span>
              </div>
            ))}
          </div>
          <div role="group" aria-label="Warning lights" className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {lights.map((l) => {
              const on = l.on(c)
              return (
                <button
                  key={l.id}
                  type="button"
                  aria-pressed={selected === l.id}
                  aria-label={`${l.name} light, ${on ? 'on' : 'off'}`}
                  onClick={() => setSelected(l.id)}
                  className={cn(
                    'flex h-10 items-center justify-center rounded-lg border font-mono text-[10px] font-bold transition-all',
                    on ? lit[l.colour] : 'border-line bg-bg text-ink-subtle',
                    selected === l.id && 'ring-2 ring-ink/60 ring-offset-2 ring-offset-surface-raised',
                  )}
                >
                  {l.glyph}
                </button>
              )
            })}
          </div>
        </div>
      }
      controls={
        <>
          <div role="group" aria-label="Key position" className="flex flex-wrap gap-1.5">
            {stages.map((s) => (
              <button key={s.id} type="button" aria-pressed={c.stage === s.id} onClick={() => setC((x) => ({ ...x, stage: s.id, neutral: s.id === 'moving' ? false : x.neutral }))} className={cn('h-9 rounded-lg border px-3 text-sm', c.stage === s.id ? 'border-ignition-500/50 bg-ignition-950 text-ignition-200' : 'border-line text-ink-muted hover:text-ink')}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {toggle('neutral', 'In neutral')}
            {toggle('highBeam', 'High beam')}
            {toggle('lowFuel', 'Low fuel')}
            {toggle('oilFault', 'Fault: low oil pressure', true)}
            {toggle('chargeFault', 'Fault: not charging', true)}
          </div>
        </>
      }
      status={
        <>
          {stage.text}
          <span className="mt-1.5 block">
            <span className="font-medium text-ink">{info.name}:</span> {info.means} <span className="text-ink-subtle">{info.action}</span>
          </span>
          {redWhileRunning && (
            <span className="mt-1.5 block font-medium text-danger-400">A red warning light is on with the engine running — stop safely and switch off the engine.</span>
          )}
        </>
      }
    />
  )
}
