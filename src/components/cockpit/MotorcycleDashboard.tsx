import { cn } from '@/lib/cn'

/*
 * A compact digital instrument cluster: speed, a bar rev counter, gear, engine status and
 * the rider's four inputs. Values are whatever the simulation passes in.
 */

export interface DashboardValues {
  kmh: number
  rpm: number
  redline: number
  gear: number
  engineRunning: boolean
  clutch: number
  throttle: number
  frontBrake: number
  rearBrake: number
}

const pct = (x: number) => `${Math.round(x * 100)}`

export function MotorcycleDashboard({ values, className }: { values: DashboardValues; className?: string }) {
  const { kmh, rpm, redline, gear, engineRunning } = values
  const segments = 20
  const lit = Math.round((Math.min(rpm, redline * 1.1) / (redline * 1.1)) * segments)
  return (
    <section aria-label="Instrument cluster" className={cn('rounded-2xl border border-line bg-bg/90 p-3 shadow-lg backdrop-blur', className)}>
      <div className="flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <div aria-hidden className="flex h-3 gap-[2px]">
            {Array.from({ length: segments }, (_, i) => (
              <span
                key={i}
                className={cn('flex-1 rounded-[2px]', i < lit ? (i >= segments * (redline / (redline * 1.1)) ? 'bg-danger-400' : 'bg-coolant-400') : 'bg-surface-overlay')}
              />
            ))}
          </div>
          <p className="mt-1 font-mono text-[11px] text-ink-subtle">
            <span className="text-ink-muted">{Math.round(rpm).toLocaleString('en')}</span> RPM
          </p>
        </div>
        <p className="tabular font-mono text-3xl leading-none text-ink" aria-label={`Speed ${Math.round(kmh)} kilometres per hour`}>
          {Math.round(kmh)}
          <span className="ml-1 text-xs text-ink-subtle">km/h</span>
        </p>
        <p className={cn('flex size-10 items-center justify-center rounded-lg border font-mono text-2xl', gear === 0 ? 'border-ok-500/50 text-ok-400' : 'border-coolant-500/50 text-coolant-300')} aria-label={gear === 0 ? 'Neutral' : `Gear ${gear}`}>
          {gear === 0 ? 'N' : gear}
        </p>
      </div>
      <dl className="mt-2 grid grid-cols-5 gap-2 border-t border-line pt-2 font-mono text-[11px]">
        <div>
          <dt className="text-ink-subtle">ENGINE</dt>
          <dd className={engineRunning ? 'text-ok-400' : 'text-ink-muted'}>{engineRunning ? 'RUN' : 'OFF'}</dd>
        </div>
        <div>
          <dt className="text-ink-subtle">CLUTCH</dt>
          <dd className="text-ink">{pct(values.clutch)} %</dd>
        </div>
        <div>
          <dt className="text-ink-subtle">THROT</dt>
          <dd className="text-ink">{pct(values.throttle)} %</dd>
        </div>
        <div>
          <dt className="text-ink-subtle">F BRK</dt>
          <dd className="text-ink">{pct(values.frontBrake)} %</dd>
        </div>
        <div>
          <dt className="text-ink-subtle">R BRK</dt>
          <dd className="text-ink">{pct(values.rearBrake)} %</dd>
        </div>
      </dl>
    </section>
  )
}
