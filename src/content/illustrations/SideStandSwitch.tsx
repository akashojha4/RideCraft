import { useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { Readout } from '@/components/simulation/Readouts'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

/*
 * Pre-ride lesson 11: the side stand and its safety switch. Typical interlock logic
 * (details vary between motorcycles — check your manual):
 *  - the engine can be started in neutral whatever the stand position;
 *  - it can be started in gear only with the clutch pulled in and the stand up;
 *  - if a gear is selected while the stand is down, the engine is stopped.
 * Rear view: the motorcycle leans to its left onto the stand.
 */

interface State {
  standDown: boolean
  inGear: boolean
  clutchIn: boolean
  running: boolean
}

const LEAN = 9

export default function SideStandSwitch() {
  const [s, setS] = useState<State>({ standDown: true, inGear: false, clutchIn: false, running: false })
  const [message, setMessage] = useState('Parked on the side stand, in neutral, engine off.')

  /** Apply a change, then let the interlock react to the new state. */
  function update(change: Partial<State>, note: string) {
    const next = { ...s, ...change }
    if (next.running && next.inGear && next.standDown) {
      next.running = false
      note = 'The side-stand switch stopped the engine: a gear was selected with the stand still down. This stops you riding off with the stand extended.'
    }
    setS(next)
    setMessage(note)
  }

  function start() {
    if (s.running) return setMessage('The engine is already running.')
    if (!s.inGear) return update({ running: true }, 'Started in neutral — allowed with the stand up or down. Raise the stand before selecting first gear.')
    if (s.standDown) return setMessage('Won’t start: the motorcycle is in gear with the side stand down.')
    if (!s.clutchIn) return setMessage('Won’t start: in gear, so the clutch must be pulled in.')
    update({ running: true }, 'Started in gear with the clutch pulled in and the stand up — allowed.')
  }

  const lean = s.standDown ? LEAN : 0
  const toggle = (on: boolean, label: string, onClick: () => void) => (
    <button type="button" role="switch" aria-checked={on} onClick={onClick} className={cn('h-9 rounded-lg border px-3 text-sm', on ? 'border-ignition-500/50 bg-ignition-950 text-ignition-200' : 'border-line text-ink-muted hover:text-ink')}>
      {label}
    </button>
  )

  return (
    <DiagramFrame
      stage={
        <svg viewBox="0 0 480 220" className="w-full" role="img" aria-label={`Rear view, side stand ${s.standDown ? 'down' : 'up'}, engine ${s.running ? 'running' : 'off'}`}>
          <g strokeLinejoin="round" strokeLinecap="round">
            <line x1={60} x2={420} y1={200} y2={200} strokeWidth={2} className="stroke-line-strong" />
            {/* Rear view of the motorcycle, pivoting about the tyre's contact point */}
            <g transform={`rotate(${-lean} 240 200)`} className="transition-transform duration-500">
              <rect x={226} y={120} width={28} height={80} rx={12} className="fill-surface-sunken stroke-line-strong" strokeWidth={2} />
              <path d="M200,60 L280,60 L272,118 L208,118 Z" className="fill-surface-raised stroke-line-strong" strokeWidth={2} />
              <rect x={228} y={42} width={24} height={18} rx={4} className="fill-surface-overlay stroke-ink-subtle" />
              <rect x={234} y={64} width={12} height={8} rx={2} className="fill-danger-500" />
              <line x1={150} x2={330} y1={36} y2={36} strokeWidth={5} className="stroke-ink-subtle" />
              <circle cx={300} cy={150} r={6} className={s.running ? 'fill-caution-400' : 'fill-surface-overlay'} />
            </g>
            {/* Side stand on the motorcycle's left (viewer's left from behind) */}
            <g className="transition-all duration-500">
              {s.standDown ? (
                /* Attachment point rotated with the leaning motorcycle (−9° about the contact patch). */
                <line x1={206.5} y1={154.7} x2={160} y2={200} strokeWidth={6} className="stroke-ignition-400" />
              ) : (
                <line x1={214} y1={150} x2={196} y2={170} strokeWidth={6} className="stroke-ink-subtle" />
              )}
            </g>
            <DiagramLabel x={150} y={190} anchor="end" tone={s.standDown ? 'ignition' : 'muted'}>
              {s.standDown ? 'Stand down' : 'Stand up'}
            </DiagramLabel>
            <DiagramLabel x={240} y={20} anchor="middle">Seen from behind</DiagramLabel>
            <DiagramLabel x={310} y={154}>{s.running ? 'Exhaust: running' : 'Engine off'}</DiagramLabel>
          </g>
        </svg>
      }
      controls={
        <>
          <div className="flex flex-wrap gap-1.5">
            {toggle(s.standDown, s.standDown ? 'Side stand: down' : 'Side stand: up', () => update({ standDown: !s.standDown }, s.standDown ? 'Side stand raised.' : 'Side stand lowered.'))}
            {toggle(s.inGear, s.inGear ? 'Gear: first' : 'Gear: neutral', () => update({ inGear: !s.inGear }, s.inGear ? 'Back in neutral.' : 'First gear selected.'))}
            {toggle(s.clutchIn, s.clutchIn ? 'Clutch: pulled in' : 'Clutch: released', () => update({ clutchIn: !s.clutchIn }, s.clutchIn ? 'Clutch released.' : 'Clutch pulled in.'))}
            <Button size="sm" onClick={start} disabled={s.running}>
              Press starter
            </Button>
            <Button size="sm" variant="ghost" onClick={() => update({ running: false }, 'Engine switched off.')} disabled={!s.running}>
              Stop engine
            </Button>
          </div>
          <dl className="grid grid-cols-3 gap-4">
            <Readout label="Engine" value={s.running ? 'Running' : 'Off'} tone={s.running ? 'ok' : 'ink'} />
            <Readout label="Neutral light" value={s.inGear ? 'Off' : 'On'} tone={s.inGear ? 'ink' : 'ok'} />
            <Readout label="Ready to ride off" value={s.running && !s.standDown && s.inGear ? 'Yes' : 'No'} tone={s.running && !s.standDown && s.inGear ? 'ok' : 'caution'} />
          </dl>
        </>
      }
      status={message}
    />
  )
}
