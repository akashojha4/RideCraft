import type { Pt } from '@/lib/mechanics/rider'

/** Side-view geometry of six motorcycle types (facing left, ground at y = 228). */
export const GROUND = 228

export interface MotoType {
  id: string
  name: string
  front: Pt & { r: number }
  rear: Pt & { r: number }
  head: Pt
  hand: Pt
  hip: Pt
  foot: Pt
  /** Shapes drawn as filled panels. */
  panels: string[]
  /** Shapes drawn as thick strokes (frame, swingarm, exhaust…). */
  strokes: string[]
  posture: string
  use: string
  note: string
  controls: 'Geared' | 'Usually automatic'
  /** Kinds of motorcycle in this family, each with example models a learner may recognise. */
  examples: MotoExample[]
}

export interface MotoExample {
  name: string
  what: string
  /** Well-known models, for recognition only (not recommendations). */
  models?: string
}

export const motoTypes: MotoType[] = [
  {
    id: 'standard',
    name: 'Standard / commuter',
    front: { x: 115, y: 180, r: 48 },
    rear: { x: 345, y: 180, r: 48 },
    head: { x: 178, y: 96 },
    hand: { x: 210, y: 74 },
    hip: { x: 282, y: 108 },
    foot: { x: 288, y: 170 },
    panels: [
      'M210,128 h78 v48 h-78 Z',
      'M182,112 C186,92 228,86 264,96 L270,112 Z',
      'M266,104 C290,100 320,98 344,98 L350,110 L270,114 Z',
      'M344,98 L380,96 L372,110 L350,110 Z',
    ],
    strokes: ['M178,96 L300,108 L300,170', 'M178,100 L222,168', 'M298,170 L345,180', 'M330,110 L344,172', 'M222,176 C250,186 300,182 330,168 L372,156'],
    posture: 'Upright, with the feet under the hips and the hands at chest height.',
    use: 'Commuting, learning and everyday riding. Comfortable, easy to see from and to see over traffic. Typically 100–400 cc.',
    note: 'This is the kind of motorcycle RideCraft is modelled on.',
    controls: 'Geared',
    examples: [
      { name: 'Commuter', what: 'Small, light and economical — the everyday 100–125 cc motorcycle.', models: 'Hero Splendor, Honda Shine, Bajaj Platina' },
      { name: 'Naked / street', what: 'A sportier engine with no fairing and higher bars. Sits between standard and sport.', models: 'Bajaj Pulsar, TVS Apache, KTM Duke' },
      { name: 'Retro / roadster', what: 'Classic looks, upright and relaxed, usually 350 cc or more.', models: 'Royal Enfield Classic 350, Royal Enfield Hunter 350' },
    ],
  },
  {
    id: 'sport',
    name: 'Sport',
    front: { x: 115, y: 182, r: 46 },
    rear: { x: 345, y: 182, r: 46 },
    head: { x: 182, y: 98 },
    hand: { x: 196, y: 106 },
    hip: { x: 286, y: 100 },
    foot: { x: 304, y: 150 },
    panels: [
      'M150,84 L188,72 L198,100 L202,150 L160,150 C146,130 142,104 150,84 Z',
      'M198,100 C206,84 240,80 272,90 L278,106 Z',
      'M276,98 L330,90 L378,76 L382,86 L334,102 L280,108 Z',
      'M202,150 L300,150 L290,172 L216,172 Z',
    ],
    strokes: ['M182,98 L300,104 L300,166', 'M300,166 L345,182', 'M296,172 L362,150'],
    posture: 'Leaning well forward, weight on the wrists, knees bent tightly with the pegs high and rearward.',
    use: 'Fast road riding and track days. The tucked position cuts wind resistance and gives ground clearance in corners, but is tiring in traffic.',
    note: 'A full fairing improves aerodynamics at speed.',
    controls: 'Geared',
    examples: [
      { name: 'Supersport', what: 'Full fairing, low clip-on bars and high pegs. Built for speed and corners.', models: 'Yamaha R15, KTM RC 390' },
      { name: 'Sport-tourer', what: 'A milder sport posture with more wind protection, for long distances.', models: 'Kawasaki Ninja 650' },
      { name: 'Café racer', what: 'Retro style with low bars and rear-set pegs — a sport triangle in classic clothes.', models: 'Royal Enfield Continental GT 650' },
    ],
  },
  {
    id: 'cruiser',
    name: 'Cruiser',
    front: { x: 100, y: 182, r: 46 },
    rear: { x: 352, y: 180, r: 48 },
    head: { x: 176, y: 104 },
    hand: { x: 240, y: 70 },
    hip: { x: 290, y: 128 },
    foot: { x: 182, y: 176 },
    panels: [
      'M212,130 h72 v44 h-72 Z',
      'M220,132 L208,108 L228,104 L240,130 Z',
      'M250,130 L262,104 L282,108 L270,132 Z',
      'M190,116 C200,100 240,96 268,108 L268,122 Z',
      'M262,122 C280,130 310,128 330,118 L336,126 C310,138 280,140 262,134 Z',
    ],
    strokes: ['M176,104 L204,70 L240,70', 'M176,108 L262,124 L310,170', 'M176,110 L212,170 L300,172', 'M318,122 A54,54 0 0 1 404,166', 'M230,180 L404,178'],
    posture: 'Sitting low and laid back, with the feet forward and the hands up and back.',
    use: 'Relaxed riding at steady speeds. The low seat makes it easy to put your feet down, but lean angle is limited by the low footpegs and exhaust.',
    note: 'Often heavy, with large, slow-revving engines.',
    controls: 'Geared',
    examples: [
      { name: 'Classic cruiser', what: 'Low seat, feet forward, relaxed bars.', models: 'Royal Enfield Meteor 350' },
      { name: 'Bobber', what: 'A stripped-down cruiser: short rear fender, often a single seat.', models: 'Jawa Perak' },
      { name: 'Touring cruiser', what: 'A bigger, heavier cruiser with more comfort for long trips.', models: 'Royal Enfield Super Meteor 650' },
    ],
  },
  {
    id: 'adventure',
    name: 'Adventure / dual-sport',
    front: { x: 112, y: 170, r: 58 },
    rear: { x: 345, y: 176, r: 52 },
    head: { x: 176, y: 84 },
    hand: { x: 214, y: 60 },
    hip: { x: 284, y: 96 },
    foot: { x: 290, y: 160 },
    panels: [
      'M150,96 L126,106 L162,106 Z',
      'M168,58 L184,40 L192,46 L182,74 Z',
      'M184,98 C190,76 234,70 268,82 L272,104 Z',
      'M268,92 L340,88 L346,100 L272,104 Z',
      'M330,104 h50 v42 h-50 Z',
      'M210,118 h74 v48 h-74 Z',
    ],
    strokes: ['M176,84 L296,100 L296,160', 'M176,90 L214,160', 'M296,160 L345,176', 'M330,100 L342,162', 'M205,170 L288,172'],
    posture: 'Tall and upright, with wide handlebars — comfortable standing up on the pegs off road.',
    use: 'Long journeys on and off tarmac. Long-travel suspension and a large front wheel cope with rough roads; luggage carries the load.',
    note: 'The tall seat can make it hard for shorter riders to reach the ground.',
    controls: 'Geared',
    examples: [
      { name: 'Dual-sport', what: 'Light and tall, closer to a dirt bike but road legal.', models: 'Hero Xpulse 200' },
      { name: 'Adventure tourer', what: 'Mid-size, built for long trips on bad roads with luggage.', models: 'Royal Enfield Himalayan, KTM 390 Adventure' },
      { name: 'Big adventure', what: 'Large engines (800 cc and up), heavy and tall. Not a first motorcycle.' },
    ],
  },
  {
    id: 'offroad',
    name: 'Off-road',
    front: { x: 108, y: 168, r: 60 },
    rear: { x: 340, y: 172, r: 56 },
    head: { x: 170, y: 82 },
    hand: { x: 206, y: 62 },
    hip: { x: 276, y: 96 },
    foot: { x: 282, y: 156 },
    panels: [
      'M116,94 L150,86 L160,96 Z',
      'M180,96 C196,84 230,84 250,88 L340,86 L344,96 L182,108 Z',
      'M300,96 L350,92 L336,124 L306,122 Z',
      'M208,118 h60 v44 h-60 Z',
    ],
    strokes: ['M170,82 L290,100 L286,156', 'M170,88 L210,156', 'M286,156 L340,172', 'M300,100 L318,154', 'M230,120 C260,98 300,92 352,94'],
    posture: 'Upright and mobile; riders often stand on the pegs to absorb bumps with their legs.',
    use: 'Dirt tracks and trails. Light, with long suspension, high ground clearance and knobbly tyres.',
    note: 'Pure off-road machines often have no lights and are not road legal.',
    controls: 'Geared',
    examples: [
      { name: 'Motocross', what: 'Light and powerful, for jumps on closed dirt tracks. Not road legal.' },
      { name: 'Enduro', what: 'Long-distance trail riding over rough ground; some are road legal.' },
      { name: 'Trials', what: 'Very low seat (riders stand the whole time), for slow, precise obstacle riding.' },
      { name: 'Supermoto', what: 'A dirt-bike chassis with road tyres and wide bars, for tarmac.' },
    ],
  },
  {
    id: 'scooter',
    name: 'Scooter',
    front: { x: 120, y: 200, r: 28 },
    rear: { x: 340, y: 200, r: 28 },
    head: { x: 150, y: 90 },
    hand: { x: 196, y: 80 },
    hip: { x: 262, y: 124 },
    foot: { x: 226, y: 184 },
    panels: [
      'M150,92 L170,96 L184,180 L150,186 C138,160 136,120 150,92 Z',
      'M184,180 L268,180 L268,190 L176,192 Z',
      'M262,186 L262,150 C268,132 320,126 384,134 L390,160 C372,170 360,164 340,172 L300,186 Z',
      'M236,124 C262,116 300,116 340,126 L338,134 C300,128 262,128 238,136 Z',
    ],
    strokes: ['M120,200 L150,150', 'M150,92 L196,80'],
    posture: 'Seated upright with the feet flat on a floorboard.',
    use: 'Short urban trips. Small wheels and a step-through frame make it easy to get on and manoeuvre; storage under the seat.',
    note: 'Most scooters are automatic (a CVT): no clutch lever and no gear lever — both brakes are levers on the handlebar. RideCraft focuses on geared motorcycles.',
    controls: 'Usually automatic',
    examples: [
      { name: 'Scooter', what: 'Step-through, automatic, storage under the seat.', models: 'Honda Activa, TVS Jupiter' },
      { name: 'Maxi-scooter', what: 'A bigger scooter with larger wheels and motorcycle-like speed.', models: 'Suzuki Burgman Street' },
      { name: 'Electric scooter', what: 'Same layout with an electric motor: twist and go, no gears.', models: 'Ather 450, TVS iQube' },
      { name: 'Moped', what: 'Very small and light, low speed.', models: 'TVS XL100' },
    ],
  },
]
