import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, X } from 'lucide-react'
import { Fragment } from 'react'
import { cn } from '@/lib/cn'
import type { Link, LinkState, PowerFlow, StageId } from '@/lib/simulation/powerFlow'

/*
 * ENGINE → CLUTCH → GEARBOX → FRONT SPROCKET → CHAIN → REAR SPROCKET → REAR WHEEL, with each
 * stage's live speed, torque and power, and each link's state: driving (arrow towards the
 * wheel), engine braking (arrow back towards the engine), slipping (dashed), or no drive
 * (crossed, with the reason). The state is in words and icons as well as colour.
 */

const LINK_STYLE: Record<LinkState, string> = {
  driving: 'text-coolant-400',
  'engine-braking': 'text-caution-400',
  slipping: 'text-caution-400',
  none: 'text-ink-subtle',
}
const LINK_WORD: Record<LinkState, string> = { driving: 'driving', 'engine-braking': 'engine braking', slipping: 'slipping', none: 'no drive' }

const n0 = (x: number) => Math.round(x).toLocaleString('en')
const n1 = (x: number) => (Math.abs(x) < 0.05 ? '0.0' : x.toFixed(1))

function LinkMark({ link }: { link: Link }) {
  const Fwd = link.state === 'engine-braking' ? ArrowLeft : ArrowRight
  const Down = link.state === 'engine-braking' ? ArrowUp : ArrowDown
  return (
    <li data-link={`${link.from}-${link.to}`} data-state={link.state} aria-label={`${link.from} to ${link.to}: ${LINK_WORD[link.state]}${link.reason ? ` (${link.reason})` : ''}`} className={cn('flex items-center justify-center gap-1 text-[10px] @3xl:flex-col', LINK_STYLE[link.state])}>
      {link.state === 'none' ? (
        <X className="size-4" aria-hidden />
      ) : (
        <>
          <Down className={cn('size-4 @3xl:hidden', link.state === 'slipping' && 'opacity-60')} aria-hidden />
          <Fwd className={cn('hidden size-4 @3xl:block', link.state === 'slipping' && 'opacity-60')} aria-hidden />
        </>
      )}
      <span className="@3xl:max-w-16 @3xl:text-center">{link.state === 'none' ? link.reason : LINK_WORD[link.state]}</span>
    </li>
  )
}

export function PowerFlowStrip({ flow, highlight = [], className }: { flow: PowerFlow; highlight?: readonly StageId[]; className?: string }) {
  return (
    <div className="@container">
    <ol aria-label="Power flow from engine to rear wheel" className={cn('flex flex-col gap-1 @3xl:flex-row @3xl:items-stretch', className)}>
      {flow.stages.map((st, k) => (
        <Fragment key={st.id}>
          {k > 0 && <LinkMark link={flow.links[k - 1]} />}
          <li data-stage={st.id} data-lit={highlight.includes(st.id) || undefined} className={cn('min-w-0 rounded-xl border bg-surface-sunken p-2 @3xl:flex-1', highlight.includes(st.id) ? 'border-ignition-400 ring-2 ring-ignition-500/60' : 'border-line')}>
            <p className="text-xs font-medium text-ink">{st.label}</p>
            <dl className="mt-1 grid grid-cols-3 gap-x-2 font-mono text-[11px] @3xl:grid-cols-1">
              <div>
                <dt className="sr-only">Speed</dt>
                <dd className="text-ink-muted">{st.rpm == null ? `${n1(st.metresPerSecond ?? 0)} m/s` : `${n0(st.rpm)} rpm`}</dd>
              </div>
              <div>
                <dt className="sr-only">{st.id === 'chain' ? 'Chain pull' : st.force != null ? 'Force at the tyre' : 'Torque'}</dt>
                <dd className="text-ink-muted">{st.force != null ? `${n0(st.force)} N${st.id === 'chain' ? ' pull' : ''}` : `${n1(st.torque)} N·m`}</dd>
              </div>
              <div>
                <dt className="sr-only">Power</dt>
                <dd className={cn(st.power > 0.05 ? 'text-coolant-300' : st.power < -0.05 ? 'text-caution-400' : 'text-ink-subtle')}>{n1(st.power)} kW</dd>
              </div>
            </dl>
          </li>
        </Fragment>
      ))}
    </ol>
    </div>
  )
}
