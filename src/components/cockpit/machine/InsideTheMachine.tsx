import type { ReactNode } from 'react'
import { FourStrokeEngine } from '@/components/mechanics/FourStrokeEngine'
import { Readout } from '@/components/simulation/Readouts'
import { SimCard } from '@/components/simulation/SimCard'
import { ClutchMechanismView } from '@/components/simulators/clutchExplorer/ClutchMechanismView'
import { GearboxView } from '@/components/simulators/gears/GearboxView'
import { DrivetrainPanel } from '@/components/simulators/starting/DrivetrainPanel'
import { VISUAL_SLOWDOWN, type PowertrainSim } from '@/hooks/usePowertrainSim'
import { clutchMechanism } from '@/lib/mechanics/clutch'
import { strokeIndex, strokes } from '@/lib/mechanics/engine'
import { PRIMARY_RATIO, chainSpeed, gearRatio, overallRatio } from '@/lib/mechanics/gearbox'
import { rpmPerKmh } from '@/lib/mechanics/powertrain'
import { powertrainRotations } from '@/lib/simulation/models/powertrain'
import { powerFlow, type StageId } from '@/lib/simulation/powerFlow'
import { cn } from '@/lib/cn'
import type { MachineCard } from '../crossView'
import { BrakeVisualizer } from './BrakeVisualizer'
import { PowerFlowStrip } from './PowerFlowStrip'

/*
 * "Inside the Machine": the power path and each mechanism, all driven by the cockpit's own
 * simulation — the same state as the controls, the road and the instruments. Rotations are
 * drawn VISUAL_SLOWDOWN times slower than real so they can be followed.
 */

const n0 = (x: number) => Math.round(x).toLocaleString('en')

/** A card that can be lit by the cause-and-effect highlight. */
function Lit({ card, on, children }: { card: MachineCard; on: readonly MachineCard[]; children: ReactNode }) {
  const lit = on.includes(card)
  return (
    <div data-card={card} data-lit={lit || undefined} className={cn('rounded-2xl transition-shadow', lit && 'ring-2 ring-ignition-500/70')}>
      {children}
    </div>
  )
}

export function InsideTheMachine({ sim, highlight }: { sim: PowertrainSim; highlight?: { cards: readonly MachineCard[]; stages: readonly StageId[] } }) {
  const cards = highlight?.cards ?? []
  const { state: s, inputs: i, derived: d } = sim.snapshot
  const flow = powerFlow(s, i, d)
  const rot = powertrainRotations(s, i, d)
  const mech = clutchMechanism(i.clutch, i.actuation ?? 'cable')
  const stroke = strokeIndex(sim.angles.crank.get())
  const status = !i.gear || d.clamp === 0 ? 'Disengaged' : d.slipping ? 'Slipping' : 'Engaged'
  const engine = flow.stages[0]

  return (
    <section aria-labelledby="inside-machine" className="space-y-4">
      <div>
        <h2 id="inside-machine" className="text-xl font-semibold text-ink">
          Inside the Machine
        </h2>
        <p className="mt-1 text-sm text-ink-muted">What your controls are doing inside the motorcycle, live. Moving parts are drawn {VISUAL_SLOWDOWN}× slower than real.</p>
      </div>

      <PowerFlowStrip flow={flow} highlight={highlight?.stages} />
      {flow.slipLoss > 0.05 && <p className="text-sm text-caution-400">The slipping clutch is turning {flow.slipLoss.toFixed(1)} kW into heat.</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        <Lit card="engine" on={cards}>
        <SimCard title="Engine">
          <div className="mx-auto max-w-56">
            <FourStrokeEngine crankAngle={sim.angles.crank} stroke={stroke} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Readout label="Engine" value={s.running ? `${n0(d.engineRpm)} RPM` : 'Stopped'} tone={s.running ? 'coolant' : 'danger'} />
            <Readout label="Stroke" value={s.running || d.engineRpm > 0 ? strokes[stroke].name : '—'} />
            <Readout label="Torque" value={`${engine.torque.toFixed(1)} N·m`} />
            <Readout label="Power" value={`${engine.power.toFixed(1)} kW`} />
          </dl>
        </SimCard>
        </Lit>

        <Lit card="clutch" on={cards}>
        <SimCard title="Clutch">
          <ClutchMechanismView mech={mech} actuation={i.actuation ?? 'cable'} basketAngle={sim.angles.basket} hubAngle={sim.angles.mainshaft} slipping={d.slipping} basketRpm={rot.basket ?? 0} hubRpm={rot.mainshaft ?? 0} />
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Readout label="Clamp load" value={`${Math.round(mech.clampN)} N`} tone={mech.clamp === 1 ? 'ok' : mech.clamp > 0 ? 'caution' : 'ink'} />
            <Readout label="Can pass" value={`${(d.capacity * PRIMARY_RATIO).toFixed(0)} N·m`} />
            <Readout label="Passing" value={`${Math.abs(flow.stages[1].torque).toFixed(1)} N·m`} tone="coolant" />
            <Readout label="State" value={status} tone={status === 'Slipping' ? 'caution' : status === 'Engaged' ? 'ok' : 'ink'} />
          </dl>
        </SimCard>
        </Lit>

        <Lit card="gearbox" on={cards}>
        <SimCard title="Gearbox">
          <GearboxView gear={i.gear} clamp={i.gear ? d.clamp : 0} basket={sim.angles.basket} mainshaft={sim.angles.mainshaft} countershaft={sim.angles.countershaft} />
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Readout label="Selected" value={i.gear ? `Gear ${i.gear}` : 'Neutral'} tone={i.gear ? 'coolant' : 'ok'} />
            <Readout label="Gear ratio" value={i.gear ? `${gearRatio(i.gear).toFixed(2)} : 1` : '—'} />
            <Readout label="Overall" value={i.gear ? `${overallRatio(i.gear).toFixed(1)} : 1` : '—'} />
            <Readout label="RPM per km/h" value={i.gear ? `${Math.round(rpmPerKmh(i.gear))}` : '—'} />
          </dl>
        </SimCard>
        </Lit>

        <Lit card="final-drive" on={cards}>
        <SimCard title="Chain, sprockets and rear wheel">
          <div className="mx-auto max-w-md">
            <DrivetrainPanel clamp={i.gear ? d.clamp : 0} status={status} gear={i.gear} angles={{ basket: sim.angles.basket, mainshaft: sim.angles.mainshaft, countershaft: sim.angles.countershaft, wheel: sim.angles.rearWheel }} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Readout label="Front sprocket" value={`${n0(rot.countershaft ?? 0)} RPM`} />
            <Readout label="Chain" value={`${chainSpeed(rot.countershaft ?? 0).toFixed(1)} m/s`} />
            <Readout label="Rear wheel" value={`${n0(rot.rearWheel ?? 0)} RPM`} />
            <Readout label="Road speed" value={`${Math.max(0, d.kmh).toFixed(1)} km/h`} />
          </dl>
        </SimCard>
        </Lit>
      </div>

      <Lit card="brakes" on={cards}>
      <SimCard title="Brakes">
        <BrakeVisualizer front={s.brakes.front} rear={s.brakes.rear} frontInput={i.front ?? 0} rearInput={i.rear ?? 0} frontAngle={sim.angles.frontWheel} rearAngle={sim.angles.rearWheel} />
      </SimCard>
      </Lit>
    </section>
  )
}
