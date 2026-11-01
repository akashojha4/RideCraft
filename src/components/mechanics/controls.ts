/** The rider’s controls, as shown on the `Cockpit` view. */

export type ControlId =
  | 'clutch-lever'
  | 'left-switches'
  | 'throttle'
  | 'front-brake-lever'
  | 'right-switches'
  | 'ignition'
  | 'instruments'
  | 'mirrors'
  | 'gear-lever'
  | 'rear-brake-pedal'

export interface ControlInfo {
  name: string
  operatedBy: string
  does: string
  howTo: string
}

export const controls: Record<ControlId, ControlInfo> = {
  'clutch-lever': {
    name: 'Clutch lever',
    operatedBy: 'Left hand',
    does: 'Disconnects the engine from the gearbox while pulled in.',
    howTo: 'Pull fully in to change gear or to stop without stalling; release gradually through the friction zone to pull away.',
  },
  'left-switches': {
    name: 'Left switch block',
    operatedBy: 'Left thumb',
    does: 'Indicators (slide left or right; push in to cancel), horn, and headlight high/low beam with a passing flash.',
    howTo: 'Indicate in good time before every turn or lane change, and cancel the indicator afterwards.',
  },
  throttle: {
    name: 'Throttle',
    operatedBy: 'Right hand (twist grip)',
    does: 'Controls engine power: roll it towards you to open, away from you to close.',
    howTo: 'Roll it on and off smoothly. It closes by itself when you let go.',
  },
  'front-brake-lever': {
    name: 'Front brake lever',
    operatedBy: 'Right hand',
    does: 'Applies the front brake — most of your stopping power.',
    howTo: 'Squeeze progressively, never grab it. Many riders cover it with two fingers in traffic.',
  },
  'right-switches': {
    name: 'Right switch block',
    operatedBy: 'Right thumb',
    does: 'Engine kill switch (top) and electric starter button (bottom); often the headlight switch too.',
    howTo: 'Keep the kill switch at RUN. In an emergency, flick it to OFF to stop the engine instantly.',
  },
  ignition: {
    name: 'Ignition switch',
    operatedBy: 'Key',
    does: 'Switches the electrical system on and off; on many motorcycles it also locks the steering.',
    howTo: 'Turn to ON and check the neutral light and warning lights before starting.',
  },
  instruments: {
    name: 'Instrument cluster',
    operatedBy: 'Glance',
    does: 'Speedometer, rev counter, fuel level and warning lights such as neutral, indicators and high beam.',
    howTo: 'Check with quick glances; keep your eyes mainly on the road.',
  },
  mirrors: {
    name: 'Mirrors',
    operatedBy: 'Glance',
    does: 'Show the traffic behind you on both sides.',
    howTo: 'Adjust before riding. Check them before slowing, turning or changing lanes — then look over your shoulder for the blind spot.',
  },
  'gear-lever': {
    name: 'Gear lever',
    operatedBy: 'Left foot',
    does: 'Selects the gear: press down for first, lift for second and above. Neutral is a half-step between first and second.',
    howTo: 'Clutch in, throttle closed, then a firm press or lift with the toe.',
  },
  'rear-brake-pedal': {
    name: 'Rear brake pedal',
    operatedBy: 'Right foot',
    does: 'Applies the rear brake.',
    howTo: 'Press smoothly. Useful for control at walking pace; in a hard stop, use it together with the front brake.',
  },
}

/** Display order: left hand, right hand, centre, feet. */
export const controlOrder: ControlId[] = [
  'clutch-lever',
  'left-switches',
  'throttle',
  'front-brake-lever',
  'right-switches',
  'ignition',
  'instruments',
  'mirrors',
  'gear-lever',
  'rear-brake-pedal',
]
