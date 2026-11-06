import { describe, expect, it } from 'vitest'
import { FINAL_RATIO, FRONT_SPROCKET_TEETH, REAR_SPROCKET_TEETH, chainSpeed, sprocketRadius } from './gearbox'

describe('final-drive sprockets', () => {
  it('match the 3 : 1 final drive', () => {
    expect(REAR_SPROCKET_TEETH / FRONT_SPROCKET_TEETH).toBe(FINAL_RATIO)
  })
  it('have the pitch radius of a 520-chain 15-tooth sprocket (about 38 mm)', () => {
    expect(sprocketRadius(15) * 1000).toBeCloseTo(38.2, 1)
  })
  it('move the chain at the same speed round both sprockets', () => {
    const front = 900
    const rear = front / FINAL_RATIO
    // Teeth per second (× pitch) are the same at both ends of the chain.
    expect(chainSpeed(front)).toBeCloseTo((rear / 60) * REAR_SPROCKET_TEETH * 0.015875, 6)
    expect(chainSpeed(front)).toBeCloseTo(3.57, 2)
  })
})
