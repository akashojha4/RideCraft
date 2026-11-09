/**
 * Plain-language definitions of the terms a new rider meets, written to match the lessons.
 * Each term can point at the lesson that teaches it properly.
 */
export interface GlossaryEntry {
  term: string
  definition: string
  to?: string
}

export interface GlossaryGroup {
  title: string
  entries: GlossaryEntry[]
}

export const glossary: GlossaryGroup[] = [
  {
    title: 'The controls',
    entries: [
      { term: 'Clutch', definition: 'The lever under your left hand. Pulled in, it disconnects the engine from the rear wheel so you can stop, start and change gear. Let out, it connects them again.', to: '/learn/basics/understanding-clutch' },
      { term: 'Friction zone', definition: 'The part of the clutch lever’s travel where the plates are slipping: the engine is partly connected to the wheel. This is where you control moving off and slow riding.', to: '/learn/basics/understanding-clutch' },
      { term: 'Biting point', definition: 'The point in the friction zone where the clutch just starts to move the motorcycle. You find it by letting the lever out slowly until the motorcycle pulls.', to: '/learn/riding-situations/starting-and-moving-off' },
      { term: 'Throttle', definition: 'The twist grip under your right hand. Twisting it toward you opens it and the engine speeds up; letting go closes it. Smooth and small movements are what a new rider needs.', to: '/learn/basics/understanding-throttle' },
      { term: 'Front brake', definition: 'The lever under your right hand. It does most of the stopping, because braking shifts the motorcycle’s weight onto the front wheel. Squeeze it progressively, never grab it.', to: '/learn/basics/understanding-brakes' },
      { term: 'Rear brake', definition: 'The pedal under your right foot. It gives gentler braking and is the one you use to steady the motorcycle at walking pace.', to: '/learn/basics/understanding-brakes' },
      { term: 'Gear lever', definition: 'The pedal under your left foot. On almost all road motorcycles you press down for first gear and lift for every gear above it, with neutral a half-step between first and second.', to: '/learn/basics/understanding-gears' },
      { term: 'Neutral', definition: 'No gear selected, so the engine can run without turning the wheel. It sits between first and second and is shown by a green “N” on the instrument cluster.', to: '/learn/pre-ride/neutral-gear' },
      { term: 'Kill switch', definition: 'The red switch on the right handlebar, usually marked RUN and OFF. It stops the engine without the key, and the engine won’t start unless it is at RUN.', to: '/learn/basics/motorcycle-controls' },
      { term: 'Full lock', definition: 'The handlebar turned as far as it will go. A walking-pace U-turn is ridden at full lock, because that gives the tightest circle.', to: '/learn/handling/u-turns' },
    ],
  },
  {
    title: 'The engine and transmission',
    entries: [
      { term: 'RPM', definition: 'Revolutions per minute: how fast the engine’s crankshaft is spinning. Too few and the engine stalls; too many and you are at the redline.', to: '/learn/basics/understanding-rpm' },
      { term: 'Idle', definition: 'The slowest steady speed the engine runs at with the throttle closed and nothing to drive — around 1,200–1,500 RPM on many small motorcycles.', to: '/learn/basics/understanding-rpm' },
      { term: 'Redline', definition: 'The red zone at the top of the rev counter: the highest engine speed the engine is designed for. Change up before you reach it.', to: '/learn/basics/understanding-rpm' },
      { term: 'cc (engine size)', definition: 'Cubic centimetres: the volume the piston sweeps in one stroke. Learner motorcycles are usually 100–400 cc.', to: '/learn/basics/engine-basics' },
      { term: 'N·m (newton-metre)', definition: 'The unit of torque, or turning force: a push of one newton (about the weight of a small apple) one metre from the centre of rotation.', to: '/learn/basics/understanding-torque' },
      { term: 'Friction plates', definition: 'The discs inside the clutch. Springs clamp them against steel plates so the engine drives the gearbox; pulling the lever lets them slip apart.', to: '/learn/basics/understanding-clutch' },
      { term: 'Stall', definition: 'The engine stopping because it was asked to move the motorcycle from too few revolutions — usually the clutch released too quickly for the throttle. Clutch in, brake, restart.', to: '/learn/first-ride/stalling' },
      { term: 'Torque', definition: 'The twisting force the engine produces. It is what actually accelerates you. Low gears multiply it, which is why first gear pulls hard.', to: '/learn/basics/understanding-torque' },
      { term: 'Gear ratio', definition: 'How many times the engine turns for each turn of the wheel. A low gear (first) multiplies torque and keeps the engine spinning fast; a high gear does the opposite.', to: '/learn/basics/understanding-gears' },
      { term: 'Engine braking', definition: 'The slowing you get by closing the throttle while a gear is engaged. The wheels have to drag the engine round, so the motorcycle slows — strongest in low gears.', to: '/learn/mechanics/engine-braking' },
      { term: 'Drivetrain', definition: 'Everything that carries power from the engine to the rear wheel: clutch, gearbox, front sprocket, chain and rear sprocket.', to: '/learn/basics/understanding-drivetrain' },
    ],
  },
  {
    title: 'Riding',
    entries: [
      { term: 'Countersteering', definition: 'To lean into a turn at road speed you briefly press the handlebar on the side you want to turn toward. Press the right bar, the motorcycle leans and turns right.', to: '/learn/handling/countersteering' },
      { term: 'Weight transfer', definition: 'Braking shifts weight onto the front wheel, which is why the front brake does most of the work. Accelerating shifts it back onto the rear wheel.', to: '/learn/handling/weight-transfer' },
      { term: 'Contact patch', definition: 'The small area of tyre rubber actually touching the road. All of your grip — for braking, accelerating and turning — comes from those two patches.', to: '/learn/handling/tyre-grip' },
      { term: 'ABS', definition: 'Anti-lock braking. If a wheel is about to stop turning while you brake, ABS releases and reapplies that brake many times a second so the wheel keeps grip instead of skidding.', to: '/learn/mechanics/abs' },
      { term: 'Wheel lock', definition: 'A wheel that stops turning while the motorcycle is still moving, because the brake asked for more grip than the tyre had. A locked wheel skids; a locked front wheel can bring the motorcycle down.', to: '/learn/riding-situations/using-the-brakes' },
      { term: 'g (as in 0.3 g)', definition: 'A way to say how hard you are slowing or turning, compared with the pull of gravity. About 0.3 g is firm, comfortable braking; around 0.6–0.8 g is an emergency stop on a dry road.', to: '/learn/basics/understanding-brakes' },
      { term: 'Blind spot', definition: 'The area just behind you in the next lane that your mirrors don’t show and your side vision doesn’t reach. A quick look over your shoulder covers it.', to: '/learn/pre-ride/mirrors' },
      { term: 'Side stand', definition: 'The leg on the left that holds the motorcycle up when parked. Fold it up before moving — many motorcycles cut the engine if you ride away with it down.', to: '/learn/pre-ride/side-stand' },
      { term: 'Slow riding', definition: 'Riding at walking pace, where the motorcycle is least stable and you balance it yourself. You control the speed with the clutch’s friction zone and the rear brake, not the front brake.', to: '/learn/handling/slow-speed' },
    ],
  },
]
