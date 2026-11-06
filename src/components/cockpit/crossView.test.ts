import { describe, expect, it } from 'vitest'
import { chainComponents } from '@/lib/simulation/model'
import { derivePowertrain, powertrainChain } from '@/lib/simulation/models/powertrain'
import { initialPowertrain } from '@/lib/mechanics/powertrain'
import { crossHighlight } from './crossView'

const inputs = { clutch: 0.3, throttle: 0.2, brake: 0, front: 0.2, rear: 0, gear: 1, grade: 0 }
const chain = powertrainChain(initialPowertrain(), inputs, derivePowertrain(initialPowertrain(), inputs))

describe('cross-view highlighting', () => {
  it('lights the clutch everywhere for the mechanism stage', () => {
    const h = crossHighlight(chainComponents(chain, 'mechanism'))
    expect(h.zones).toEqual(['clutch'])
    expect(h.cards).toEqual(['clutch'])
    expect(h.stages).toContain('clutch')
    expect(h.sideView).toContain('clutch')
  })
  it('lights the right-hand controls and the brakes for the rider’s inputs', () => {
    const h = crossHighlight(chainComponents(chain, 'input'))
    expect(h.zones).toEqual(expect.arrayContaining(['clutch', 'throttle', 'rear-brake']))
    expect(h.cards).toContain('brakes')
  })
  it('follows power transfer through the gearbox and chain to the wheel', () => {
    const h = crossHighlight(chainComponents(chain, 'transmission'))
    expect(h.zones).toContain('gear')
    expect(h.stages).toEqual(expect.arrayContaining(['gearbox', 'chain']))
    expect(h.sideView).toEqual(expect.arrayContaining(['gearbox', 'chain']))
  })
  it('highlights nothing for nothing', () => {
    expect(crossHighlight([])).toEqual({ zones: [], cards: [], stages: [], sideView: [] })
  })
})
