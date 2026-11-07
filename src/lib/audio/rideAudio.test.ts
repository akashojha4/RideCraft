import { describe, expect, it } from 'vitest'
import { engineTone, gearDir } from './rideAudio'

describe('engine tone', () => {
  it('rises with the revs and stays audible', () => {
    const idle = engineTone(1400)
    const high = engineTone(8000)
    expect(high).toBeGreaterThan(idle)
    expect(idle).toBeGreaterThan(30)
    expect(engineTone(-100)).toBeGreaterThan(30)
  })
})

describe('gear lever direction', () => {
  it('treats a press into first as a downshift and a lift toward second as an upshift', () => {
    expect(gearDir(0, 1)).toBe('down')
    expect(gearDir(1, 0)).toBe('up')
    expect(gearDir(1, 2)).toBe('up')
    expect(gearDir(3, 2)).toBe('down')
    expect(gearDir(0, 2)).toBe('up')
  })
})
