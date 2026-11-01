import type { Lesson } from '../types'

/**
 * Module 1 — Motorcycle Basics (Phase 3). Eleven lessons, in order.
 * Figures that depend on a specific motorcycle (ratios, RPM bands) come from the shared
 * models in lib/mechanics and are described as typical, not universal.
 */
export const basicsLessons: Lesson[] = [
  // 1 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'what-is-a-motorcycle',
    title: 'What is a motorcycle?',
    summary: 'A two-wheeled machine built from a handful of systems — and how they work together.',
    durationMinutes: 6,
    objectives: [
      'Describe what makes a motorcycle different from other vehicles',
      'Name the five main systems of a motorcycle and what each one does',
      'Explain the difference between a geared motorcycle and an automatic scooter',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'A machine that balances',
        body: [
          'A motorcycle is a motor vehicle with two wheels in line. Unlike a car, it can’t stand up by itself — at a standstill it rests on a stand or on the rider’s feet.',
          'Once moving, it becomes remarkably stable. The geometry of the front forks makes the front wheel tend to steer itself back under the motorcycle, and the spinning wheels resist being tipped. At walking pace the rider does more of the balancing; above it, the motorcycle largely balances itself.',
          'To turn, a motorcycle leans. That is why riding involves skills a driver never needs — and why understanding the machine makes those skills easier to learn.',
        ],
      },
      {
        type: 'concept',
        heading: 'Five systems',
        body: [
          'However different they look, nearly all motorcycles are built from the same five systems. The engine makes power. The drivetrain — clutch, gearbox and chain — delivers it to the rear wheel. The brakes take the motion away again. The chassis — frame, suspension and wheels — holds everything together and keeps the tyres on the road. And the rider controls let you command all of it.',
        ],
      },
      {
        type: 'illustration',
        illustration: 'systems-tour',
        caption: 'Select each system to see which parts belong to it.',
      },
      {
        type: 'concept',
        heading: 'Geared motorcycles and automatics',
        body: [
          'On a geared motorcycle you control the clutch with your left hand and change gear with your left foot. On most scooters a continuously variable transmission (CVT) does this automatically — there is no clutch lever and no gear lever.',
          'RideCraft teaches geared motorcycles. Learning to use the clutch and gears well is the biggest step for a new rider, and the knowledge transfers to every other kind of motorcycle.',
        ],
      },
      {
        type: 'example',
        body: [
          'Riding to work on a 125 cc commuter, every system is busy: the engine turns fuel into power, you feed that power to the rear wheel through the clutch and the right gear, the suspension smooths out the potholes, and at every junction the brakes take the speed away again. You coordinate all of it with two hands and two feet.',
        ],
      },
      {
        type: 'keyPoints',
        heading: 'Remember',
        points: [
          'A motorcycle is stable when moving, but needs a stand or your feet when stopped.',
          'Engine, drivetrain, brakes, chassis and rider controls — five systems on every motorcycle.',
          'Geared motorcycles have a clutch lever and gear lever; most scooters are automatic.',
        ],
      },
      { type: 'explore', part: 'frame', text: 'See how the frame holds every other system in place.' },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'Which system delivers the engine’s power to the rear wheel?',
        options: [
          { id: 'a', label: 'The chassis' },
          { id: 'b', label: 'The drivetrain' },
          { id: 'c', label: 'The brakes' },
          { id: 'd', label: 'The rider controls' },
        ],
        correctOptionId: 'b',
        explanation: 'The drivetrain — clutch, gearbox and chain — carries the power from the engine to the rear wheel.',
      },
      {
        id: 'q2',
        prompt: 'What does a geared motorcycle have that most scooters don’t?',
        options: [
          { id: 'a', label: 'A front brake' },
          { id: 'b', label: 'A throttle' },
          { id: 'c', label: 'A clutch lever and a gear lever' },
          { id: 'd', label: 'Suspension' },
        ],
        correctOptionId: 'c',
        explanation: 'Most scooters use an automatic CVT, so there is no clutch lever or gear lever. Both have brakes, a throttle and suspension.',
      },
      {
        id: 'q3',
        prompt: 'When is a motorcycle most stable?',
        options: [
          { id: 'a', label: 'When stationary with the engine running' },
          { id: 'b', label: 'When moving at a steady road speed' },
          { id: 'c', label: 'At walking pace' },
        ],
        correctOptionId: 'b',
        explanation: 'At road speed the steering geometry and the spinning wheels keep the motorcycle stable. At walking pace the rider must balance more, and stationary it needs support.',
      },
    ],
  },

  // 2 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'types-of-motorcycles',
    title: 'Types of motorcycles',
    summary: 'Standards, sports bikes, cruisers, adventure bikes, off-roaders and scooters — and why they put you in different positions.',
    durationMinutes: 6,
    objectives: [
      'Recognise the main types of motorcycle and what each is designed for',
      'Explain how the seat, footpegs and handlebar set the riding position',
      'Choose a sensible type of motorcycle to learn on',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'Designed for a job',
        body: [
          'Every motorcycle is a compromise designed for a particular kind of riding — commuting, speed, comfort, distance or rough ground. The biggest visible difference is the riding position, which is set by three points: the seat, the footpegs and the handlebar. Riders call this the rider triangle.',
          'Move the pegs back and the bars down and you lean forward, like a sports rider. Move the pegs forward and the bars back and you sit laid-back, like a cruiser rider. Keep everything in the middle and you sit upright.',
        ],
      },
      {
        type: 'illustration',
        illustration: 'motorcycle-types',
        caption: 'The rider’s posture here is calculated from each motorcycle’s seat, footpeg and handlebar positions.',
      },
      {
        type: 'terms',
        heading: 'Key terms',
        items: [
          { term: 'Engine size (cc)', definition: 'The engine’s displacement in cubic centimetres. Learner motorcycles are usually 100–400 cc.' },
          { term: 'Rider triangle', definition: 'The relationship between seat, footpegs and handlebar that sets your riding position.' },
          { term: 'Seat height', definition: 'How high the seat is from the ground — it decides how easily your feet reach the road.' },
          { term: 'CVT', definition: 'Continuously variable transmission: the automatic drive used by most scooters.' },
        ],
      },
      {
        type: 'example',
        body: [
          'A new rider choosing between a 150 cc standard and a 150 cc sports bike will find the standard easier in town: the upright position gives a better view over traffic, takes weight off the wrists, and makes slow-speed turns less tiring. The sports bike shines on open roads but asks more of a beginner.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        body: 'For learning, choose a light, upright motorcycle on which you can put the balls of both feet on the ground when seated.',
      },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'Which three points make up the “rider triangle”?',
        options: [
          { id: 'a', label: 'Engine, gearbox and chain' },
          { id: 'b', label: 'Seat, footpegs and handlebar' },
          { id: 'c', label: 'Front wheel, rear wheel and seat' },
        ],
        correctOptionId: 'b',
        explanation: 'The positions of the seat, footpegs and handlebar together decide how you sit on the motorcycle.',
      },
      {
        id: 'q2',
        prompt: 'A motorcycle with high, rear-set footpegs and low handlebars puts the rider…',
        options: [
          { id: 'a', label: 'Upright' },
          { id: 'b', label: 'Leaning forward' },
          { id: 'c', label: 'Leaning back with feet forward' },
        ],
        correctOptionId: 'b',
        explanation: 'Rear-set pegs and low bars pull the rider forward into a sports position, with weight on the wrists.',
      },
      {
        id: 'q3',
        prompt: 'Why are most scooters easier to start riding than geared motorcycles?',
        options: [
          { id: 'a', label: 'They have no brakes to learn' },
          { id: 'b', label: 'Their automatic transmission needs no clutch or gear changes' },
          { id: 'c', label: 'They are always more powerful' },
        ],
        correctOptionId: 'b',
        explanation: 'A CVT does the work of the clutch and gearbox automatically — “twist and go”. That convenience is why learning the clutch is the big extra step on a geared motorcycle.',
      },
    ],
  },

  // 3 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'motorcycle-controls',
    title: 'Motorcycle controls',
    summary: 'Two hands and two feet: what every lever, pedal and switch does.',
    durationMinutes: 7,
    objectives: [
      'Locate every main control and say which hand or foot operates it',
      'Explain what each control does',
      'Use a simple rule to remember which side does what',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'Five main controls',
        body: [
          'A geared motorcycle has five main controls. Your right hand twists the throttle and squeezes the front brake lever. Your right foot presses the rear brake pedal. Your left hand pulls the clutch lever, and your left foot moves the gear lever.',
          'Around them are the switches: indicators, horn and headlight beam under your left thumb; the engine kill switch and starter button under your right thumb; and the ignition key in the middle.',
        ],
      },
      {
        type: 'illustration',
        illustration: 'cockpit',
        caption: 'The rider’s view. Select any control to see what it does and how to use it.',
      },
      {
        type: 'keyPoints',
        heading: 'An easy way to remember',
        points: [
          'Right side = go and stop: throttle, front brake (hand) and rear brake (foot).',
          'Left side = clutch and gears: clutch lever (hand) and gear lever (foot).',
          'The kill switch is a safety device: keep it at RUN and know where it is.',
        ],
      },
      {
        type: 'example',
        body: [
          'Approaching a junction, a rider rolls off the throttle and squeezes the front brake with the right hand while pressing the rear pedal with the right foot. Just before stopping, the left hand pulls in the clutch so the engine doesn’t stall, and the left foot taps the gear lever down to first, ready to pull away.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        body: 'Before your first ride, sit on the motorcycle with the engine off and practise finding every control without looking down.',
      },
      {
        type: 'callout',
        tone: 'mistake',
        body: 'Grabbing the front brake lever in a panic. Squeeze it progressively — a sudden grab can lock the front wheel.',
      },
      { type: 'explore', part: 'handlebar', text: 'See how the hand controls connect to the parts they operate.' },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'Which control does your left foot operate?',
        options: [
          { id: 'a', label: 'The rear brake' },
          { id: 'b', label: 'The gear lever' },
          { id: 'c', label: 'The clutch' },
          { id: 'd', label: 'The kill switch' },
        ],
        correctOptionId: 'b',
        explanation: 'Left foot = gears. The rear brake pedal is under your right foot, and the clutch is a lever for your left hand.',
      },
      {
        id: 'q2',
        prompt: 'Which hand operates the front brake?',
        options: [
          { id: 'a', label: 'Right hand' },
          { id: 'b', label: 'Left hand' },
        ],
        correctOptionId: 'a',
        explanation: 'The front brake lever is on the right, in front of the throttle. The lever on the left is the clutch.',
      },
      {
        id: 'q3',
        prompt: 'What is the engine kill switch for?',
        options: [
          { id: 'a', label: 'Turning on the headlight' },
          { id: 'b', label: 'Stopping the engine quickly without reaching for the key' },
          { id: 'c', label: 'Selecting neutral' },
        ],
        correctOptionId: 'b',
        explanation: 'The kill switch, under the right thumb, stops the engine instantly — useful in an emergency or after a fall.',
      },
      {
        id: 'q4',
        prompt: 'Which statement is true?',
        options: [
          { id: 'a', label: 'The right side controls go and stop; the left side controls clutch and gears' },
          { id: 'b', label: 'Both brakes are operated by the left side' },
          { id: 'c', label: 'The throttle is on the left grip' },
        ],
        correctOptionId: 'a',
        explanation: 'Throttle and both brakes are on the right; clutch and gear lever are on the left.',
      },
    ],
  },

  // 4 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'engine-basics',
    title: 'Engine basics',
    summary: 'How a four-stroke engine turns fuel and air into rotation, one stroke at a time.',
    durationMinutes: 8,
    objectives: [
      'Explain what an engine does',
      'Describe the four strokes of a four-stroke engine',
      'Understand what engine size (cc) means',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'From fuel to rotation',
        body: [
          'An engine turns the chemical energy in petrol into rotation. Inside the cylinder, a mixture of fuel and air is compressed and set alight. The burning gas expands and pushes the piston down; a connecting rod turns that push into rotation of the crankshaft.',
          'Almost every learner motorcycle uses a four-stroke engine. Its piston moves through four strokes — intake, compression, power and exhaust — for every two turns of the crankshaft.',
        ],
      },
      {
        type: 'illustration',
        illustration: 'engine-cycle',
        caption: 'Play the cycle, slow it down, or jump to each stroke. Watch which valve is open in each.',
      },
      {
        type: 'steps',
        heading: 'The four strokes',
        steps: [
          { title: 'Intake', body: 'The piston moves down with the intake valve open, drawing in air and fuel.' },
          { title: 'Compression', body: 'Both valves close and the piston rises, squeezing the mixture.' },
          { title: 'Power', body: 'The spark plug ignites the mixture; the expanding gas drives the piston down.' },
          { title: 'Exhaust', body: 'The exhaust valve opens and the rising piston pushes out the burnt gas.' },
        ],
      },
      {
        type: 'terms',
        heading: 'Key terms',
        items: [
          { term: 'Displacement (cc)', definition: 'The volume the piston sweeps in one stroke. A 125 cc engine sweeps 125 cubic centimetres.' },
          { term: 'TDC / BDC', definition: 'Top and bottom dead centre: the highest and lowest points of the piston’s travel.' },
          { term: 'Idle', definition: 'The slowest steady speed the engine runs at with the throttle closed.' },
          { term: 'Single-cylinder', definition: 'An engine with one cylinder — common on small motorcycles because it is light and simple.' },
        ],
      },
      {
        type: 'example',
        body: [
          'A 125 cc single cruising at 5,000 RPM completes 2,500 four-stroke cycles every minute — about 42 power strokes every second. That is why the exhaust sounds like a continuous hum rather than separate bangs.',
        ],
      },
      { type: 'explore', part: 'engine', text: 'See where the engine sits and what it connects to.' },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'Which stroke produces the power that drives the motorcycle?',
        options: [
          { id: 'a', label: 'Intake' },
          { id: 'b', label: 'Compression' },
          { id: 'c', label: 'Power' },
          { id: 'd', label: 'Exhaust' },
        ],
        correctOptionId: 'c',
        explanation: 'Only the power stroke does work: the burning mixture pushes the piston down. The other three strokes are carried through by the crankshaft’s momentum.',
      },
      {
        id: 'q2',
        prompt: 'How many crankshaft turns does one four-stroke cycle take?',
        options: [
          { id: 'a', label: 'One' },
          { id: 'b', label: 'Two' },
          { id: 'c', label: 'Four' },
        ],
        correctOptionId: 'b',
        explanation: 'Each stroke is half a turn, so four strokes take two full turns of the crankshaft.',
      },
      {
        id: 'q3',
        prompt: 'During the compression stroke, the valves are…',
        options: [
          { id: 'a', label: 'Both open' },
          { id: 'b', label: 'Intake open, exhaust closed' },
          { id: 'c', label: 'Both closed' },
        ],
        correctOptionId: 'c',
        explanation: 'Both valves must be closed so the rising piston can squeeze the trapped mixture.',
      },
      {
        id: 'q4',
        prompt: 'What does “125 cc” describe?',
        options: [
          { id: 'a', label: 'The fuel tank capacity' },
          { id: 'b', label: 'The volume swept by the piston' },
          { id: 'c', label: 'The top speed' },
        ],
        correctOptionId: 'b',
        explanation: 'Displacement is the volume the piston sweeps between the bottom and top of its stroke.',
      },
    ],
  },

  // 5 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'understanding-rpm',
    title: 'Understanding RPM',
    summary: 'What the rev counter tells you, from idle to the redline.',
    durationMinutes: 5,
    objectives: [
      'Explain what RPM measures',
      'Read a rev counter, including idle and the redline',
      'Understand why RPM and road speed are not the same thing',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'Revolutions per minute',
        body: [
          'RPM is how many times the crankshaft turns in a minute. The rev counter (tachometer) shows it, usually in thousands: a needle on “4” means 4,000 RPM.',
          'With the throttle closed and nothing to drive, the engine settles at its idle speed — around 1,200–1,500 RPM on many small motorcycles. Open the throttle and the RPM rises. The red zone at the top of the scale, the redline, marks the maximum safe engine speed.',
        ],
      },
      {
        type: 'illustration',
        illustration: 'rpm-gauge',
        caption: 'Move the engine speed and compare the readouts: even at idle the crankshaft turns more than twenty times a second.',
      },
      {
        type: 'concept',
        heading: 'RPM is not road speed',
        body: [
          'Engine speed and road speed are linked through the gearbox. In first gear the engine might be at 6,000 RPM at just over 20 km/h; in top gear the same 6,000 RPM is about 70 km/h. The next lessons show why.',
        ],
      },
      {
        type: 'example',
        body: [
          'Pulling away from traffic lights, you open the throttle in first gear and hear the engine note rise quickly. Change up to second, and the RPM drops while the speed keeps rising. Listening to the engine — and glancing at the rev counter — tells you when to change gear.',
        ],
      },
      {
        type: 'callout',
        tone: 'mistake',
        body: 'Revving the engine hard in neutral or holding it at the redline. Engines are not designed to run at their limit for long, and a cold engine is easily damaged.',
      },
      { type: 'explore', part: 'instruments', text: 'Find the rev counter on the instrument cluster.' },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'What does 3,000 RPM mean?',
        options: [
          { id: 'a', label: 'The motorcycle is travelling at 30 km/h' },
          { id: 'b', label: 'The crankshaft turns 3,000 times a minute' },
          { id: 'c', label: 'The engine produces 3,000 watts' },
        ],
        correctOptionId: 'b',
        explanation: 'RPM counts crankshaft revolutions per minute — 3,000 RPM is 50 turns every second.',
      },
      {
        id: 'q2',
        prompt: 'What does the red zone on the rev counter mark?',
        options: [
          { id: 'a', label: 'The most economical engine speed' },
          { id: 'b', label: 'The idle speed' },
          { id: 'c', label: 'Engine speeds above the safe maximum' },
        ],
        correctOptionId: 'c',
        explanation: 'The redline is the maximum safe engine speed. Above it, parts can be damaged.',
      },
      {
        id: 'q3',
        prompt: 'The engine is at 6,000 RPM. What does that tell you about road speed?',
        options: [
          { id: 'a', label: 'Nothing on its own — it depends on the gear' },
          { id: 'b', label: 'The motorcycle is travelling fast' },
          { id: 'c', label: 'The motorcycle is stationary' },
        ],
        correctOptionId: 'a',
        explanation: 'The same engine speed gives a very different road speed in each gear — and in neutral, no road speed at all.',
      },
    ],
  },

  // 6 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'understanding-torque',
    title: 'Understanding torque',
    summary: 'The twisting force that actually moves you — and how the gearing multiplies it.',
    durationMinutes: 7,
    objectives: [
      'Define torque as force multiplied by distance',
      'Explain how gears multiply engine torque at the wheel',
      'Relate torque, RPM and power',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'A twisting force',
        body: [
          'Torque is a turning force: how hard something is twisted. It equals the force applied multiplied by the distance from the centre of rotation — the lever arm — and is measured in newton-metres (N·m).',
          'That is why a longer spanner makes a stiff nut easier to turn: the same push, further from the nut, makes more torque.',
        ],
      },
      { type: 'illustration', illustration: 'torque-lever', caption: 'Try reaching 60 N·m with a short spanner, then with a long one.' },
      {
        type: 'concept',
        heading: 'Engine torque and wheel torque',
        body: [
          'In the engine, the burning gas pushes the piston, and the connecting rod pushes on the crankpin — offset from the crankshaft’s centre like a built-in spanner. The result is engine torque: around 8–12 N·m for a typical 125 cc single.',
          'That isn’t much. But each stage of reduction in the drivetrain multiplies it. In first gear the torque at the rear wheel can be thirty times the engine’s; in top gear, around ten times.',
        ],
      },
      { type: 'illustration', illustration: 'wheel-torque', caption: 'Compare the push at the tyre in each gear — and the speed you can reach at the same engine RPM.' },
      {
        type: 'keyPoints',
        heading: 'Torque, RPM and power',
        points: [
          'Torque is how hard the engine twists; RPM is how fast.',
          'Power is torque × speed: the same power can be high torque at low speed, or low torque at high speed.',
          'Gears trade one for the other — low gears give more torque at the wheel, high gears more speed.',
        ],
      },
      {
        type: 'example',
        body: [
          'Starting on a steep hill, you need a strong push at the rear wheel to overcome gravity. First gear gives the most torque multiplication, which is why hill starts are made in first — never in a higher gear.',
        ],
      },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'A 100 N push on a 0.3 m spanner produces how much torque?',
        options: [
          { id: 'a', label: '3 N·m' },
          { id: 'b', label: '30 N·m' },
          { id: 'c', label: '300 N·m' },
        ],
        correctOptionId: 'b',
        explanation: 'Torque = force × distance = 100 N × 0.3 m = 30 N·m.',
      },
      {
        id: 'q2',
        prompt: 'Which gear gives the greatest torque at the rear wheel?',
        options: [
          { id: 'a', label: 'First' },
          { id: 'b', label: 'Third' },
          { id: 'c', label: 'Top gear' },
        ],
        correctOptionId: 'a',
        explanation: 'First gear has the largest reduction ratio, so it multiplies engine torque the most — at the cost of top speed.',
      },
      {
        id: 'q3',
        prompt: 'If the gearing halves the rotation speed, what happens to torque (ignoring friction)?',
        options: [
          { id: 'a', label: 'It halves' },
          { id: 'b', label: 'It stays the same' },
          { id: 'c', label: 'It doubles' },
        ],
        correctOptionId: 'c',
        explanation: 'Power = torque × speed is passed on unchanged, so halving the speed doubles the torque.',
      },
      {
        id: 'q4',
        prompt: 'Why should a hill start be made in first gear?',
        options: [
          { id: 'a', label: 'First gear uses less fuel' },
          { id: 'b', label: 'First gear multiplies the engine’s torque the most' },
          { id: 'c', label: 'The clutch only works in first gear' },
        ],
        correctOptionId: 'b',
        explanation: 'The steepest gearing turns the engine’s modest torque into the strongest push at the tyre, enough to pull away uphill.',
      },
    ],
  },

  // 7 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'understanding-gears',
    title: 'Understanding gears',
    summary: 'Why a motorcycle needs five gears, and how to choose the right one.',
    durationMinutes: 8,
    objectives: [
      'Explain why a motorcycle needs a gearbox',
      'Describe the gear pattern and how to change gear',
      'Choose a gear that keeps the engine in its usable RPM range',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'Why gears are needed',
        body: [
          'An engine only works well within a range of speeds — too slow and it labours or stalls, too fast and it passes the redline. The rear wheel, though, must turn anywhere from walking pace to motorway speed.',
          'The gearbox bridges the gap. Each gear sets a different ratio between engine speed and wheel speed, so whatever your road speed there is a gear that keeps the engine in its useful range.',
        ],
      },
      { type: 'illustration', illustration: 'gearbox', caption: 'Shift through the gears with the lever buttons, just as your foot would. Notice how neutral is reached.' },
      {
        type: 'concept',
        heading: 'Choosing a gear',
        body: [
          'Plot engine RPM against speed and each gear becomes a straight line. Low gears climb steeply — lots of RPM and torque for little speed. High gears rise gently — little RPM for lots of speed.',
        ],
      },
      { type: 'illustration', illustration: 'gear-speed-chart', caption: 'Pick a speed and see which gears keep the engine between labouring and the redline.' },
      {
        type: 'steps',
        heading: 'Changing gear',
        steps: [
          { title: 'Close the throttle', body: 'Roll off as you begin the change.' },
          { title: 'Pull in the clutch', body: 'Disconnect the engine from the gearbox.' },
          { title: 'Move the lever', body: 'Lift firmly for the next gear up, or press down for the next gear down.' },
          { title: 'Release the clutch smoothly', body: 'Feed the drive back in, and roll the throttle back on.' },
        ],
      },
      {
        type: 'example',
        body: [
          'At 40 km/h on a typical 125 cc, first gear would push the engine beyond its redline, while fifth would leave it labouring at around 3,400 RPM. Third or fourth keeps it comfortably in the middle, ready to accelerate.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        body: 'The usual pattern is 1–N–2–3–4–5: press down for first, lift for the rest. Neutral is a half-step between first and second — the green N light confirms it.',
      },
      { type: 'explore', part: 'gearbox', text: 'See the gearbox’s shafts, dogs and shift drum.' },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'Why does a motorcycle need several gears?',
        options: [
          { id: 'a', label: 'To make the engine louder' },
          { id: 'b', label: 'To keep the engine in its useful RPM range across a wide range of road speeds' },
          { id: 'c', label: 'Because the brakes need them' },
        ],
        correctOptionId: 'b',
        explanation: 'The engine works well only between labouring and the redline; different gears let it stay in that range from walking pace to top speed.',
      },
      {
        id: 'q2',
        prompt: 'On the usual pattern, how do you select first gear from neutral?',
        options: [
          { id: 'a', label: 'Press the gear lever down' },
          { id: 'b', label: 'Lift the gear lever' },
          { id: 'c', label: 'Press the rear brake' },
        ],
        correctOptionId: 'a',
        explanation: 'The pattern is 1–N–2–3–4–5: first is down from neutral, second and above are up.',
      },
      {
        id: 'q3',
        prompt: 'Riding at a steady speed, you change from fourth to third. What happens to engine RPM?',
        options: [
          { id: 'a', label: 'It rises' },
          { id: 'b', label: 'It falls' },
          { id: 'c', label: 'It stays the same' },
        ],
        correctOptionId: 'a',
        explanation: 'A lower gear has a larger ratio, so at the same road speed the engine must turn faster.',
      },
      {
        id: 'q4',
        prompt: 'What should you do with the clutch while moving the gear lever?',
        options: [
          { id: 'a', label: 'Release it fully' },
          { id: 'b', label: 'Hold it pulled in' },
          { id: 'c', label: 'Nothing — the clutch isn’t involved' },
        ],
        correctOptionId: 'b',
        explanation: 'Pulling in the clutch disconnects the engine so the gears can change smoothly; release it gradually afterwards.',
      },
    ],
  },

  // 8 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'understanding-clutch',
    title: 'Understanding the clutch',
    summary: 'The link between engine and gearbox — and the friction zone that makes smooth riding possible.',
    durationMinutes: 8,
    objectives: [
      'Explain what the clutch does and how it works inside',
      'Describe the friction zone and the biting point',
      'Pull away and stop without stalling',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'Connecting and disconnecting',
        body: [
          'The engine never stops turning while it runs, but the rear wheel often must — at a junction, for example. The clutch lets you connect and disconnect the two.',
          'Inside, friction plates and steel plates are clamped together by springs. Lever out: clamped, so the engine drives the gearbox. Lever in: the pressure is released, the plates slip, and the engine spins freely.',
        ],
      },
      { type: 'illustration', illustration: 'clutch', caption: 'Pull the lever slowly. Notice the freeplay at the start, then the friction zone, then full disengagement.' },
      {
        type: 'terms',
        heading: 'Key terms',
        items: [
          { term: 'Engaged', definition: 'Lever released: the plates are clamped and the engine drives the gearbox.' },
          { term: 'Disengaged', definition: 'Lever pulled in: the plates slip freely and no drive is passed on.' },
          { term: 'Friction zone', definition: 'The part of the lever’s travel where the plates are partly clamped and pass on some of the engine’s torque.' },
          { term: 'Biting point', definition: 'The point in the lever’s travel where the clutch starts to take up the drive.' },
          { term: 'Freeplay', definition: 'A little slack at the start of the lever’s travel, so the clutch always fully engages.' },
        ],
      },
      {
        type: 'steps',
        heading: 'Pulling away',
        steps: [
          { title: 'Clutch in, first gear', body: 'Pull the lever fully in and press down into first.' },
          { title: 'A little throttle', body: 'Raise the engine speed slightly above idle.' },
          { title: 'Find the biting point', body: 'Release the lever slowly until you feel the motorcycle want to move.' },
          { title: 'Through the friction zone', body: 'Keep releasing slowly while adding throttle as the motorcycle moves off.' },
          { title: 'Fully out', body: 'Once rolling, release the lever completely.' },
        ],
      },
      {
        type: 'example',
        body: [
          'In slow traffic, experienced riders use the friction zone to creep along at walking pace in first gear, letting the clutch slip slightly instead of jerking on and off the throttle.',
        ],
      },
      {
        type: 'callout',
        tone: 'mistake',
        body: 'Riding with the clutch partly pulled in for long periods. Slipping plates make heat and wear quickly — release the clutch fully once you’re moving.',
      },
      { type: 'explore', part: 'clutch', text: 'See where the clutch sits between the crankshaft and gearbox.' },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'When the clutch lever is fully pulled in, the engine is…',
        options: [
          { id: 'a', label: 'Connected to the gearbox' },
          { id: 'b', label: 'Disconnected from the gearbox' },
          { id: 'c', label: 'Switched off' },
        ],
        correctOptionId: 'b',
        explanation: 'Pulling the lever releases the spring pressure, so the plates slip and the engine no longer drives the gearbox.',
      },
      {
        id: 'q2',
        prompt: 'What is the friction zone?',
        options: [
          { id: 'a', label: 'Where the brake pads touch the disc' },
          { id: 'b', label: 'The range of lever travel where the clutch partly passes on the engine’s torque' },
          { id: 'c', label: 'The red zone on the rev counter' },
        ],
        correctOptionId: 'b',
        explanation: 'In the friction zone the plates are partly clamped, so they slip and transmit only some torque — this is how you pull away smoothly.',
      },
      {
        id: 'q3',
        prompt: 'Why does the motorcycle stall if you release the clutch too quickly in first gear?',
        options: [
          { id: 'a', label: 'The clutch overheats instantly' },
          { id: 'b', label: 'The engine is suddenly asked to turn the rear wheel before it has enough power, and slows to a stop' },
          { id: 'c', label: 'The fuel supply is cut off' },
        ],
        correctOptionId: 'b',
        explanation: 'A sudden full engagement loads the engine heavily at low RPM; without enough throttle it can’t keep turning, and it stalls.',
      },
      {
        id: 'q4',
        prompt: 'Why is there a little freeplay at the start of the lever’s travel?',
        options: [
          { id: 'a', label: 'So the clutch always fully engages when you release the lever' },
          { id: 'b', label: 'So the lever is easier to pull' },
          { id: 'c', label: 'It is a fault that should be removed' },
        ],
        correctOptionId: 'a',
        explanation: 'With no slack, the cable could hold the pressure plate slightly open, causing the clutch to slip even with the lever released.',
      },
    ],
  },

  // 9 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'understanding-throttle',
    title: 'Understanding the throttle',
    summary: 'How twisting the grip controls engine power — and why smoothness matters.',
    durationMinutes: 6,
    objectives: [
      'Explain what happens inside the engine when you open the throttle',
      'Describe how throttle changes affect the motorcycle’s balance',
      'Use the throttle smoothly',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'Controlling the air',
        body: [
          'The throttle doesn’t feed the engine fuel directly. Twisting the grip opens a valve that lets more air into the engine; the fuel system adds fuel to match. More air and fuel per stroke means a stronger power stroke and more torque.',
          'Let go, and springs close the valve. The engine drops back to idle — and with a gear engaged, the engine starts to slow the motorcycle (engine braking).',
        ],
      },
      { type: 'illustration', illustration: 'throttle', caption: 'Roll the grip open and watch the valve and airflow. Then press “Let go”.' },
      {
        type: 'keyPoints',
        heading: 'Why smoothness matters',
        points: [
          'Opening the throttle shifts weight to the rear; closing it shifts weight forward.',
          'Abrupt changes upset the suspension and the tyres’ grip — especially mid-corner or on wet roads.',
          '“Roll on, roll off”: move the grip progressively, never snap it.',
        ],
      },
      {
        type: 'example',
        body: [
          'Riding through a bend, a rider holds a small, steady throttle opening, then rolls on gently as the road straightens. Snapping the throttle shut halfway round would pitch weight onto the front tyre and could make the motorcycle run wide.',
        ],
      },
      {
        type: 'callout',
        tone: 'safety',
        body: 'Before every ride, check that the throttle returns to idle by itself with the handlebar straight and turned fully each way.',
      },
      { type: 'explore', part: 'throttle', text: 'See the throttle grip and how it connects to the engine.' },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'What does opening the throttle actually do?',
        options: [
          { id: 'a', label: 'Lets more air (and so more fuel) into the engine' },
          { id: 'b', label: 'Changes gear' },
          { id: 'c', label: 'Applies the rear brake' },
        ],
        correctOptionId: 'a',
        explanation: 'The throttle valve controls the air entering the engine; the fuel system adds fuel to match.',
      },
      {
        id: 'q2',
        prompt: 'What happens when you release the throttle grip?',
        options: [
          { id: 'a', label: 'It stays where you left it' },
          { id: 'b', label: 'Springs close it and the engine returns towards idle' },
          { id: 'c', label: 'The engine stops' },
        ],
        correctOptionId: 'b',
        explanation: 'Return springs snap the throttle shut. The engine keeps running at idle unless it is driving the wheel in gear, when it slows the motorcycle.',
      },
      {
        id: 'q3',
        prompt: 'Why should the throttle be used smoothly in a bend?',
        options: [
          { id: 'a', label: 'To save fuel' },
          { id: 'b', label: 'Sudden changes shift weight between the tyres and can upset grip and the line' },
          { id: 'c', label: 'The throttle can’t move quickly' },
        ],
        correctOptionId: 'b',
        explanation: 'Throttle changes transfer weight between front and rear. Abrupt ones unsettle the suspension and use up grip the tyres need for cornering.',
      },
    ],
  },

  // 10 ──────────────────────────────────────────────────────────────────────────
  {
    id: 'understanding-brakes',
    title: 'Understanding the brakes',
    summary: 'Hydraulics, friction and weight transfer: why the front brake does most of the work.',
    durationMinutes: 8,
    objectives: [
      'Explain how a hydraulic disc brake works',
      'Describe weight transfer and its effect on front and rear grip',
      'Brake progressively, using both brakes',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'Turning motion into heat',
        body: [
          'Brakes slow you by friction. Squeeze the front lever and a piston pushes brake fluid along a hose to the caliper, where larger pistons press pads against the spinning disc. Because the caliper pistons are larger, the force is multiplied.',
          'The friction turns the motorcycle’s energy of motion into heat in the disc and pads. The rear brake works the same way through a foot pedal — or, on many small motorcycles, with shoes inside a drum.',
        ],
      },
      { type: 'illustration', illustration: 'front-brake', caption: 'Squeeze the lever: the pads first close a small gap, then pressure builds.' },
      {
        type: 'concept',
        heading: 'Weight moves forward',
        body: [
          'As you slow down, the motorcycle’s momentum tries to keep it going, and because its centre of mass sits well above the road, it pitches forward. Load comes off the rear tyre and presses the front tyre into the road.',
          'A tyre can only provide braking force in proportion to the load on it. So under hard braking the front tyre can do most of the work, while the lightly loaded rear locks easily.',
        ],
      },
      { type: 'illustration', illustration: 'weight-transfer', caption: 'Increase the deceleration and watch the load move onto the front tyre.' },
      {
        type: 'steps',
        heading: 'Progressive braking',
        steps: [
          { title: 'Roll off the throttle', body: 'Engine braking begins to slow you.' },
          { title: 'Apply both brakes gently', body: 'A light first squeeze lets weight settle onto the front tyre.' },
          { title: 'Increase the pressure', body: 'Squeeze the front harder as the front tyre takes the load; keep the rear steady.' },
          { title: 'Ease off as you stop', body: 'Release slightly just before stopping, and pull in the clutch so the engine doesn’t stall.' },
        ],
      },
      {
        type: 'terms',
        heading: 'Key terms',
        items: [
          { term: 'ABS', definition: 'Anti-lock braking: releases and reapplies brake pressure many times a second if a wheel starts to lock.' },
          { term: 'CBS', definition: 'Combined braking: the rear brake control also applies some front brake.' },
          { term: 'Engine braking', definition: 'The slowing effect of the engine when you close the throttle in gear.' },
        ],
      },
      {
        type: 'example',
        body: [
          'A car pulls out ahead at 50 km/h. A trained rider closes the throttle, squeezes the front brake progressively harder while pressing the rear pedal, and stops in a straight line. Braking at around 0.6 g, that takes about 16 metres — plus the distance covered while reacting.',
        ],
      },
      {
        type: 'callout',
        tone: 'safety',
        body: 'Do your hard braking with the motorcycle upright and travelling straight. Braking hard while leaned over uses grip the tyres need for cornering.',
      },
      { type: 'explore', part: 'front-brake', text: 'See the front brake’s master cylinder, hose, caliper and disc.' },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'In hard braking, which brake can provide most of the stopping force?',
        options: [
          { id: 'a', label: 'The front brake' },
          { id: 'b', label: 'The rear brake' },
          { id: 'c', label: 'Both provide exactly half' },
        ],
        correctOptionId: 'a',
        explanation: 'Weight transfers onto the front tyre, so it can grip harder and supply most of the braking force.',
      },
      {
        id: 'q2',
        prompt: 'Why does the rear wheel lock more easily under hard braking?',
        options: [
          { id: 'a', label: 'The rear brake is stronger' },
          { id: 'b', label: 'Weight moves off the rear tyre, reducing its grip' },
          { id: 'c', label: 'The rear tyre is narrower' },
        ],
        correctOptionId: 'b',
        explanation: 'With load transferred forward, the rear tyre has less grip, so a smaller brake force is enough to lock it.',
      },
      {
        id: 'q3',
        prompt: 'In a hydraulic brake, why are the caliper pistons larger than the master cylinder piston?',
        options: [
          { id: 'a', label: 'To multiply the force pressing the pads on the disc' },
          { id: 'b', label: 'To make the lever travel shorter' },
          { id: 'c', label: 'To cool the fluid' },
        ],
        correctOptionId: 'a',
        explanation: 'The pressure is the same throughout the fluid, so a larger piston area produces a larger force.',
      },
      {
        id: 'q4',
        prompt: 'What does “progressive braking” mean?',
        options: [
          { id: 'a', label: 'Applying the brakes as hard as possible immediately' },
          { id: 'b', label: 'Applying gently first, then increasing pressure as the weight transfers' },
          { id: 'c', label: 'Using only the rear brake' },
        ],
        correctOptionId: 'b',
        explanation: 'A gentle initial squeeze lets the front tyre take the load before you ask it for maximum braking.',
      },
    ],
  },

  // 11 ──────────────────────────────────────────────────────────────────────────
  {
    id: 'understanding-drivetrain',
    title: 'Understanding the drivetrain',
    summary: 'Follow the power from the crankshaft to the road, stage by stage.',
    durationMinutes: 8,
    objectives: [
      'Name each stage of the drivetrain in order',
      'Explain how each stage reduces speed and multiplies torque',
      'Calculate the overall ratio from the individual ratios',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'From crankshaft to tyre',
        body: [
          'The drivetrain carries power from the engine to the rear wheel in four stages: the primary drive from the crankshaft to the clutch; the clutch itself; the gearbox; and the final drive — the chain and sprockets.',
          'Each stage turns the next more slowly than it is turned itself, and multiplies the torque by the same ratio. Power, which is torque times speed, passes through almost unchanged — only a little is lost to friction.',
        ],
      },
      { type: 'illustration', illustration: 'power-flow', caption: 'Press “Follow the power”, or step through each stage. Change gear and engine speed to see the numbers change.' },
      {
        type: 'concept',
        heading: 'Ratios multiply',
        body: [
          'The overall reduction is the product of the stages: primary ratio × gear ratio × final drive ratio. With a primary of 3.35, first gear at 3.00 and a 3 : 1 final drive, the engine turns about 30 times for each turn of the rear wheel. In fifth, at 0.96, it is about 9.6 times.',
        ],
      },
      { type: 'illustration', illustration: 'chain-drive', caption: 'The final drive: the 45-tooth rear sprocket turns once for every three turns of the 15-tooth front sprocket.' },
      {
        type: 'terms',
        heading: 'Key terms',
        items: [
          { term: 'Primary drive', definition: 'Gears from the crankshaft to the clutch basket.' },
          { term: 'Final drive', definition: 'The chain and sprockets (or a belt or shaft) from the gearbox to the rear wheel.' },
          { term: 'Overall ratio', definition: 'Primary × gear × final drive: engine turns per rear-wheel turn.' },
        ],
      },
      {
        type: 'example',
        body: [
          'In third gear at 6,000 RPM, the overall ratio is about 14 : 1, so the rear wheel turns about 426 times a minute. With a tyre that rolls 1.88 metres per turn, that is roughly 48 km/h.',
        ],
      },
      {
        type: 'callout',
        tone: 'safety',
        body: 'Never touch the chain or sprockets with the engine running in gear — they can trap fingers and clothing instantly.',
      },
      { type: 'explore', part: 'chain', text: 'See the chain and sprockets — the last stage of the drivetrain.' },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'In which order does the power travel?',
        options: [
          { id: 'a', label: 'Crankshaft → clutch → gearbox → chain → rear wheel' },
          { id: 'b', label: 'Crankshaft → gearbox → clutch → chain → rear wheel' },
          { id: 'c', label: 'Crankshaft → chain → gearbox → clutch → rear wheel' },
        ],
        correctOptionId: 'a',
        explanation: 'The clutch sits between the crankshaft and the gearbox, and the chain carries power from the gearbox to the rear wheel.',
      },
      {
        id: 'q2',
        prompt: 'At each reduction stage, speed goes down. What happens to torque?',
        options: [
          { id: 'a', label: 'It goes down too' },
          { id: 'b', label: 'It goes up by the same ratio' },
          { id: 'c', label: 'It is unaffected' },
        ],
        correctOptionId: 'b',
        explanation: 'Power is passed on (minus friction), so if speed is divided by a ratio, torque is multiplied by it.',
      },
      {
        id: 'q3',
        prompt: 'Primary 3.35, gear 1.40, final drive 3.00. What is the overall ratio, roughly?',
        options: [
          { id: 'a', label: '7.8 : 1' },
          { id: 'b', label: '14 : 1' },
          { id: 'c', label: '4.7 : 1' },
        ],
        correctOptionId: 'b',
        explanation: 'Ratios multiply: 3.35 × 1.40 × 3.00 ≈ 14.1. The engine turns about 14 times per rear-wheel turn.',
      },
      {
        id: 'q4',
        prompt: 'Is power increased by the gearing?',
        options: [
          { id: 'a', label: 'Yes — low gears add power' },
          { id: 'b', label: 'No — gearing trades speed for torque; a little power is lost to friction' },
        ],
        correctOptionId: 'b',
        explanation: 'Gears can’t create power. They change how it is delivered — more torque at less speed, or the reverse — and friction takes a small share.',
      },
    ],
  },
]
