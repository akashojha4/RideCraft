import { useMemo, useState } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { LineChart } from '@/components/charts/LineChart'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { BURN_DURATION, runCycle } from '@/lib/mechanics/combustion'

/*
 * Mechanics lesson 2: combustion, as cylinder pressure against crank angle (single-zone
 * model, combustion.ts). The spark has to come before top dead centre because the charge
 * takes about 45° of crank rotation to burn. Too late and the pressure peaks after the
 * piston is already well on its way down; too early and the pressure rises while the
 * piston is still coming up — fighting it, and heating the unburnt mixture until it
 * detonates (knock). The best timing puts peak pressure roughly 10–15° after top dead centre.
 */

const KNOCK_K = 900
const RPM = 8000

export default function CombustionPressure() {
  const [advance, setAdvance] = useState(20)
  const r = useMemo(() => runCycle(advance), [advance])
  const best = useMemo(() => {
    let b = { adv: 0, work: 0 }
    for (let a = 0; a <= 50; a += 1) {
      const w = runCycle(a, 9.5, 1).work
      if (w > b.work) b = { adv: a, work: w }
    }
    return b
  }, [])
  const knock = r.endGasTemp > KNOCK_K
  const powerKw = (r.work * RPM) / 120 / 1000
  const window = r.pressure.filter(([a]) => a >= -90 && a <= 120)
  const motor = r.motoring.filter(([a]) => a >= -90 && a <= 120)

  return (
    <DiagramFrame
      stage={
        <LineChart
          label={`Cylinder pressure with the spark ${advance} degrees before top dead centre; peak ${r.peakBar.toFixed(0)} bar`}
          height={240}
          x={{ min: -90, max: 120, ticks: [-90, -60, -30, 0, 30, 60, 90, 120], label: 'crank angle from top dead centre, °', format: (v) => `${v}°` }}
          y={{ min: 0, max: 90, ticks: [0, 20, 40, 60, 80], label: 'cylinder pressure, bar' }}
          series={[
            { id: 'fired', label: 'Burning', points: window, tone: knock ? 'danger' : 'ignition' },
            { id: 'motoring', label: 'No spark', points: motor, tone: 'muted', dashed: true },
          ]}
          marker={{ x: -advance, label: 'spark' }}
          bands={[{ from: -advance, to: -advance + BURN_DURATION, label: 'burning', tone: 'ignition' }]}
          valueFormat={(v) => `${v.toFixed(0)} bar`}
        />
      }
      controls={
        <>
          <Slider label="Spark timing (before top dead centre)" value={advance} onChange={setAdvance} min={0} max={50} valueText={`${advance}°`} />
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Readout label="Peak pressure" value={`${r.peakBar.toFixed(0)} bar at ${r.peakAngle >= 0 ? '+' : ''}${r.peakAngle.toFixed(0)}°`} />
            <Readout label="Work per cycle" value={`${r.work.toFixed(0)} J`} tone="coolant" />
            <Readout label={`Power at ${RPM.toLocaleString('en')} RPM`} value={`${powerKw.toFixed(1)} kW`} />
            <Readout label="End-gas temperature" value={`${r.endGasTemp.toFixed(0)} K`} tone={knock ? 'danger' : 'ink'} />
          </dl>
        </>
      }
      status={
        knock
          ? `Too early: pressure builds while the piston is still rising, and the unburnt mixture ahead of the flame is squeezed to ${r.endGasTemp.toFixed(0)} K — hot enough to explode on its own. That “knock” hammers the piston and can destroy it. Work also falls (${r.work.toFixed(0)} J) because the piston is fighting the pressure.`
          : advance < best.adv - 7
            ? `Too late: most of the burning happens after top dead centre, with the piston already moving away, so the pressure peaks low (${r.peakBar.toFixed(0)} bar at +${r.peakAngle.toFixed(0)}°) and less work is done — ${r.work.toFixed(0)} J against ${best.work.toFixed(0)} J at the best timing.`
            : `Near the best timing (about ${best.adv}° before top dead centre for this engine at full throttle): pressure peaks ${r.peakAngle.toFixed(0)}° after top dead centre, just as the piston starts down with the most leverage. About ${Math.round(r.efficiency * 100)} % of the heat released becomes work on the piston; the rest leaves in the exhaust.`
      }
    />
  )
}
