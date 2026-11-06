/**
 * Components drawn by `MotorcycleSideView` that can be highlighted and selected.
 * Full explanations live in `content/anatomy.ts`.
 *
 * The drawing shows the motorcycle's LEFT side (front of the bike to the left), the side
 * that carries the chain, gear lever and clutch lever on a typical modern geared bike.
 * Parts mounted on the right — throttle, front brake lever, rear brake pedal, rear disc
 * and silencer — are drawn dimmed as "far side".
 */

/** The ten core mechanical components every rider should understand. */
export const mainPartIds = [
  'engine',
  'clutch',
  'gearbox',
  'throttle',
  'front-brake',
  'rear-brake',
  'chain',
  'wheels',
  'suspension',
  'exhaust',
] as const

/** Everything else visible on the drawing. */
export const secondaryPartIds = [
  'fuel-tank',
  'frame',
  'handlebar',
  'instruments',
  'footpegs',
  'lights',
  'side-stand',
  'bodywork',
] as const

export const partIds = [...mainPartIds, ...secondaryPartIds] as const

export type PartId = (typeof partIds)[number]

export type PartCategory = 'engine' | 'drivetrain' | 'brakes' | 'chassis' | 'rider'

export const categories: { id: PartCategory; label: string; parts: PartId[] }[] = [
  { id: 'engine', label: 'Engine & fuel', parts: ['engine', 'throttle', 'fuel-tank', 'exhaust'] },
  { id: 'drivetrain', label: 'Drivetrain', parts: ['clutch', 'gearbox', 'chain'] },
  { id: 'brakes', label: 'Brakes', parts: ['front-brake', 'rear-brake'] },
  { id: 'chassis', label: 'Chassis', parts: ['frame', 'suspension', 'wheels'] },
  { id: 'rider', label: 'Rider interface', parts: ['handlebar', 'instruments', 'footpegs', 'lights', 'side-stand', 'bodywork'] },
]

/** Explorer order: by category, so arrow-key navigation moves through related parts. */
export const partOrder: PartId[] = categories.flatMap((c) => c.parts)

export interface PartInfo {
  name: string
  category: PartCategory
  /** Where the rider finds or operates it. */
  location: string
  /** One-sentence summary of what it does. */
  summary: string
}

export const parts: Record<PartId, PartInfo> = {
  engine: {
    name: 'Engine',
    category: 'engine',
    location: 'Centre of the frame, below the fuel tank',
    summary:
      'A four-stroke engine burns a mixture of fuel and air above the piston, pushing it down to turn the crankshaft — the source of all the motorcycle’s power.',
  },
  clutch: {
    name: 'Clutch',
    category: 'drivetrain',
    location: 'Inside the engine cases · lever on the left handlebar',
    summary:
      'A pack of friction and steel plates clamped together by springs. Pulling the lever releases the spring pressure so the plates slip past each other, disconnecting the engine from the gearbox.',
  },
  gearbox: {
    name: 'Gearbox',
    category: 'drivetrain',
    location: 'Behind the crankshaft, inside the engine cases · lever at the left foot',
    summary:
      'Pairs of gears of different sizes change how many times the engine turns for each turn of the rear wheel. The left foot selects the gear.',
  },
  throttle: {
    name: 'Throttle',
    category: 'engine',
    location: 'Right handlebar twist grip (far side)',
    summary:
      'Twisting the grip opens the throttle valve, letting more air — and with it more fuel — into the engine, so it produces more power.',
  },
  'front-brake': {
    name: 'Front brake',
    category: 'brakes',
    location: 'Lever on the right handlebar · disc on the front wheel',
    summary:
      'The lever pressurises the brake fluid, which pushes the caliper’s pads against the disc. Because braking transfers load to the front tyre, it provides most of the stopping force.',
  },
  'rear-brake': {
    name: 'Rear brake',
    category: 'brakes',
    location: 'Pedal at the right foot (far side)',
    summary:
      'Slows the rear wheel. Used together with the front brake for stable stopping, and on its own for control at very low speed.',
  },
  chain: {
    name: 'Chain & sprockets',
    category: 'drivetrain',
    location: 'Left side, from the gearbox to the rear wheel',
    summary:
      'The final drive: a small front sprocket on the gearbox output pulls the chain, which turns the large rear sprocket bolted to the wheel.',
  },
  wheels: {
    name: 'Wheels & tyres',
    category: 'chassis',
    location: 'Front and rear',
    summary:
      'Two palm-sized tyre contact patches are the motorcycle’s only connection to the road; every acceleration, brake and turn passes through them.',
  },
  suspension: {
    name: 'Suspension',
    category: 'chassis',
    location: 'Front forks · rear shock absorbers and swingarm',
    summary:
      'Springs absorb bumps and dampers control how fast they move, keeping the tyres pressed onto the road for grip and stability.',
  },
  exhaust: {
    name: 'Exhaust',
    category: 'engine',
    location: 'From the cylinder head, under the engine, to the silencer (far side)',
    summary:
      'Carries burnt gases away from the cylinder, reduces noise in the silencer and, on modern motorcycles, cleans the gases in a catalytic converter.',
  },
  'fuel-tank': {
    name: 'Fuel tank',
    category: 'engine',
    location: 'On top of the frame, in front of the seat',
    summary: 'Stores the petrol and feeds it to the engine — and gives your knees something to grip.',
  },
  frame: {
    name: 'Frame',
    category: 'chassis',
    location: 'Steering head to swingarm pivot and seat',
    summary: 'The skeleton that holds the engine, steering, suspension and rider in the right places.',
  },
  handlebar: {
    name: 'Handlebar & mirrors',
    category: 'rider',
    location: 'Clamped to the top of the forks',
    summary: 'Steers the front wheel and carries the hand controls, switches and mirrors.',
  },
  instruments: {
    name: 'Instrument cluster',
    category: 'rider',
    location: 'Above the headlight, facing the rider',
    summary: 'Speedometer, rev counter and warning lights, including the green neutral light.',
  },
  footpegs: {
    name: 'Footpegs',
    category: 'rider',
    location: 'Either side, below the seat',
    summary: 'Carry the rider’s feet, with the gear lever and rear brake pedal just in front of them.',
  },
  lights: {
    name: 'Lights',
    category: 'rider',
    location: 'Headlight at the front · tail and brake light at the back',
    summary: 'Light the road ahead and make the motorcycle visible; the brake light shows when you slow down.',
  },
  'side-stand': {
    name: 'Side stand',
    category: 'rider',
    location: 'Left side, below the footpeg (shown folded up)',
    summary: 'Holds the parked motorcycle upright, leaning slightly to the left.',
  },
  bodywork: {
    name: 'Seat & bodywork',
    category: 'rider',
    location: 'Seat, side panels, tail section and mudguards',
    summary: 'Seats rider and passenger, covers the electrics and keeps road spray off everyone.',
  },
}
