import type { PowertrainSim } from '@/hooks/usePowertrainSim'
import { powerFlow, type StageId } from '@/lib/simulation/powerFlow'
import { PowerFlowStrip } from './PowerFlowStrip'

/** The compact "Inside the Machine": the power path and any clutch slip, for a side panel. */
export function MachineSummary({ sim, highlight, onExpand }: { sim: PowertrainSim; highlight?: readonly StageId[]; onExpand?: () => void }) {
  const { state: s, inputs: i, derived: d } = sim.snapshot
  const flow = powerFlow(s, i, d)
  return (
    <section aria-label="Inside the Machine (summary)" data-panel="machine-summary" className="space-y-2 rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-semibold text-ink">Inside the Machine</h2>
        {onExpand && (
          <button type="button" onClick={onExpand} className="text-sm text-ignition-400 hover:text-ignition-300">
            Open full view
          </button>
        )}
      </div>
      <PowerFlowStrip flow={flow} highlight={highlight} />
      {flow.slipLoss > 0.05 && <p className="text-sm text-caution-400">The slipping clutch is turning {flow.slipLoss.toFixed(1)} kW into heat.</p>}
    </section>
  )
}
