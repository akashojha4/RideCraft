import { LineChart, type Series } from '@/components/charts/LineChart'
import { clampingForce, leverForClamp, type Actuation } from '@/lib/mechanics/clutch'

const curve = (a: Actuation): [number, number][] => Array.from({ length: 101 }, (_, i) => [i, clampingForce(i / 100, a) * 100])

const SERIES: Record<Actuation, Series> = {
  cable: { id: 'cable', label: 'Cable', points: curve('cable'), tone: 'ignition' },
  hydraulic: { id: 'hydraulic', label: 'Hydraulic', points: curve('hydraulic'), tone: 'coolant' },
}

/** Clamp load against lever pull for both clutch types, the selected one emphasised. */
export function ClampCurve({ actuation, pull }: { actuation: Actuation; pull: number }) {
  const other: Actuation = actuation === 'cable' ? 'hydraulic' : 'cable'
  const from = Math.round(leverForClamp(0.999, actuation) * 100)
  const to = Math.round(leverForClamp(0.001, actuation) * 100)
  return (
    <LineChart
      label="Clamp load against clutch lever pull"
      series={[{ ...SERIES[other], tone: 'muted', dashed: true }, SERIES[actuation]]}
      x={{ min: 0, max: 100, ticks: [0, 25, 50, 75, 100], label: 'Lever pull', format: (v) => `${v} %` }}
      y={{ min: 0, max: 100, ticks: [0, 50, 100], label: 'Clamp load', format: (v) => `${v} %` }}
      bands={[{ from, to, label: 'Friction zone', tone: actuation === 'cable' ? 'ignition' : 'coolant' }]}
      marker={{ x: Math.round(pull * 100), label: 'Now' }}
      valueFormat={(v) => `${Math.round(v)} %`}
      height={180}
      legend
      directLabels={false}
    />
  )
}
