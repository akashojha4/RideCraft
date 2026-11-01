/** Four-stroke cycle: 720° of crank rotation, 0° = TDC at the start of the intake stroke. */
export const strokes = [
  {
    name: 'Intake',
    piston: 'Moving down',
    valves: 'Intake open · exhaust closed',
    text: 'The falling piston lowers the pressure in the cylinder, drawing in fresh air mixed with fuel through the open intake valve.',
  },
  {
    name: 'Compression',
    piston: 'Moving up',
    valves: 'Both closed',
    text: 'With both valves shut, the rising piston squeezes the mixture into the small space above it, ready to burn.',
  },
  {
    name: 'Power',
    piston: 'Pushed down',
    valves: 'Both closed',
    text: 'The spark plug fires just before the top of the stroke. The burning mixture expands and drives the piston down — the only stroke that produces work.',
  },
  {
    name: 'Exhaust',
    piston: 'Moving up',
    valves: 'Exhaust open · intake closed',
    text: 'The exhaust valve opens and the rising piston pushes the burnt gases out into the exhaust pipe. Then the cycle repeats.',
  },
] as const

export const cycleAngle = (deg: number) => ((deg % 720) + 720) % 720
export const strokeIndex = (deg: number) => Math.floor(cycleAngle(deg) / 180)
