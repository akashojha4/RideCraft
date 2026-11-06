import type { Lesson } from '../types'

/**
 * Module 4 — Advanced Motorcycle Mechanics (Phase 11). Seventeen technical lessons. The
 * figures quoted come from the same models as the illustrations (lib/mechanics/*), for a
 * representative 125 cc single; real engines differ in detail, not in principle.
 */
export const mechanicsLessons: Lesson[] = [
  // 1 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'four-stroke-engine',
    title: 'The four-stroke engine',
    summary: 'Intake, compression, power, exhaust — and why the valves open early and close late.',
    durationMinutes: 8,
    objectives: ['Describe what happens in each of the four strokes', 'Explain why one power stroke needs two crankshaft turns', 'Explain valve overlap and why valves open early and close late'],
    blocks: [
      {
        type: 'concept',
        heading: 'Four strokes, two turns, one power pulse',
        body: [
          'A four-stroke engine needs four movements of the piston — two turns of the crankshaft — for each power pulse. Intake draws in air and fuel; compression squeezes it; the spark starts the power stroke; exhaust pushes the burnt gas out. The camshaft turns at half crankshaft speed, so each valve opens once per cycle.',
          'Gases have mass, and moving gases have momentum. So the intake valve opens a little before top dead centre and closes well after bottom dead centre — the rushing air keeps filling the cylinder even as the piston starts to rise. The exhaust valve opens before bottom dead centre, letting the remaining pressure blow the gases out. Around top dead centre both are briefly open: this overlap lets the departing exhaust help draw in the fresh charge.',
        ],
      },
      { type: 'illustration', illustration: 'valve-timing', caption: 'Play the engine and follow the valve-lift chart. Notice the overlap around 0° and the intake closing after 180°.' },
      {
        type: 'terms',
        heading: 'Key terms',
        items: [
          { term: 'Top / bottom dead centre (TDC / BDC)', definition: 'The highest and lowest points of the piston’s travel, where it momentarily stops.' },
          { term: 'Valve timing', definition: 'The crank angles at which each valve opens and closes, set by the shape (lobes) of the camshaft.' },
          { term: 'Overlap', definition: 'The few degrees around TDC when both valves are open at once.' },
        ],
      },
      { type: 'illustration', illustration: 'engine-cycle', caption: 'The cycle stroke by stroke (valves simplified to open exactly over their strokes).' },
      {
        type: 'example',
        body: [
          'Sports engines use more overlap and longer valve openings to breathe well at high revs — which makes them rough and weak at low revs. Commuter engines use mild timing for smooth, strong low-speed pulling and good fuel economy. Same four strokes; different priorities.',
        ],
      },
      { type: 'explore', part: 'engine', text: 'See the engine in the Anatomy Explorer.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'How many crankshaft turns does one four-stroke cycle take?', options: [{ id: 'a', label: 'One' }, { id: 'b', label: 'Two' }, { id: 'c', label: 'Four' }], correctOptionId: 'b', explanation: 'Each stroke is half a turn, so four strokes take two full turns of the crankshaft.' },
      { id: 'q2', prompt: 'Why does the intake valve close after bottom dead centre?', options: [{ id: 'a', label: 'To let the moving air keep filling the cylinder' }, { id: 'b', label: 'Because the camshaft is slow' }, { id: 'c', label: 'To reduce noise' }], correctOptionId: 'a', explanation: 'The incoming air has momentum and keeps flowing in for a while even as the piston starts to rise.' },
      { id: 'q3', prompt: 'What is valve overlap?', options: [{ id: 'a', label: 'When both valves are closed' }, { id: 'b', label: 'When both valves are open together around top dead centre' }, { id: 'c', label: 'When a valve opens twice' }], correctOptionId: 'b', explanation: 'Overlap uses the outgoing exhaust to help draw in the fresh charge.' },
    ],
  },

  // 2 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'combustion',
    title: 'Combustion',
    summary: 'How burning fuel pushes the piston — and why the spark has to come early, but not too early.',
    durationMinutes: 8,
    objectives: ['Explain how combustion produces pressure on the piston', 'Explain why ignition happens before top dead centre', 'Describe knock and why it is damaging'],
    blocks: [
      {
        type: 'concept',
        heading: 'Pressure, at the right moment',
        body: [
          'Petrol and air burn to carbon dioxide and water, releasing heat. Trapped in the small space above the piston, the hot gas’s pressure soars — to around 55 bar (55 times atmospheric) in this engine — and pushes the piston down.',
          'Burning isn’t instant: the flame takes about 45° of crank rotation to sweep across the chamber. So the spark fires about 20° before top dead centre, and the pressure peaks about 10–15° after it, just as the piston starts down with good leverage on the crank. Fire too late and the pressure is wasted chasing a retreating piston; too early and it pushes against the rising piston.',
        ],
      },
      { type: 'illustration', illustration: 'combustion-pressure', caption: 'Move the spark timing and watch the pressure curve, the work done and the risk of knock.' },
      {
        type: 'keyPoints',
        heading: 'Knock (detonation)',
        points: [
          'As the flame advances, it compresses and heats the unburnt mixture ahead of it.',
          'If that “end gas” gets hot enough, it explodes all at once instead of burning smoothly — a sharp pressure spike you hear as a metallic “pinking”.',
          'Knock hammers the piston and can melt or crack it. Too much spark advance, too high a compression ratio, low-octane fuel or an overheated engine all make it more likely.',
        ],
      },
      {
        type: 'example',
        body: [
          'A rider fills up with low-octane fuel and hears a faint rattle when accelerating hard up a hill in a high gear. That is knock. Changing down (less load), or using the fuel grade in the manual, stops it. Modern engines with knock sensors retard the spark automatically.',
        ],
      },
      { type: 'callout', tone: 'info', body: 'Only about 30 % of the fuel’s energy becomes work on the piston. Roughly as much again goes into the cooling system, and the rest leaves in the hot exhaust.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'Why does the spark fire before top dead centre?', options: [{ id: 'a', label: 'The mixture takes time to burn, so peak pressure should come just after TDC' }, { id: 'b', label: 'To help the starter motor' }, { id: 'c', label: 'To cool the piston' }], correctOptionId: 'a', explanation: 'Burning takes around 45° of rotation; starting early puts peak pressure where it does the most work.' },
      { id: 'q2', prompt: 'What is knock?', options: [{ id: 'a', label: 'A loose valve' }, { id: 'b', label: 'The unburnt mixture exploding all at once instead of burning smoothly' }, { id: 'c', label: 'Normal combustion noise' }], correctOptionId: 'b', explanation: 'Compressed and heated by the flame, the end gas can self-ignite — a damaging pressure spike.' },
      { id: 'q3', prompt: 'Which makes knock more likely?', options: [{ id: 'a', label: 'Higher-octane fuel' }, { id: 'b', label: 'Too much spark advance' }, { id: 'c', label: 'A cooler engine' }], correctOptionId: 'b', explanation: 'Firing too early builds pressure and temperature before TDC, heating the end gas.' },
    ],
  },

  // 3 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'compression-ratio',
    title: 'Compression ratio',
    summary: 'How hard the engine squeezes the mixture — and the trade-off between efficiency and knock.',
    durationMinutes: 6,
    objectives: ['Define compression ratio', 'Explain why a higher ratio is more efficient', 'Explain why high-compression engines need higher-octane fuel'],
    blocks: [
      {
        type: 'concept',
        heading: 'Squeeze more, expand more',
        body: [
          'Compression ratio compares the cylinder’s volume with the piston at the bottom (swept + clearance volume) to its volume at the top (clearance volume only). At 9.5 : 1 the mixture is squeezed into about a tenth of the space.',
          'The more the charge is compressed before it burns, the further it can expand afterwards — so more of its heat becomes work. The ideal (air-standard) efficiency rises from about 59 % at 9.5 : 1 to 64 % at 13 : 1. The price: allowing for the heat lost while compressing, by the end of compression a 9.5 : 1 engine has the mixture at about 19 bar and 375 °C, and a 13 : 1 engine at 28 bar and 440 °C — closer to the point where it knocks.',
        ],
      },
      { type: 'illustration', illustration: 'compression-ratio', caption: 'Change the compression ratio and compare the clearance volume, the efficiency and the fuel it needs.' },
      {
        type: 'terms',
        items: [
          { term: 'Swept volume', definition: 'The volume the piston sweeps between BDC and TDC — the engine’s “capacity” (125 cc here).' },
          { term: 'Clearance volume', definition: 'The space left above the piston at TDC, mostly in the combustion chamber.' },
          { term: 'Octane rating', definition: 'A fuel’s resistance to knock. Higher compression needs higher octane.' },
        ],
      },
      {
        type: 'example',
        body: [
          'A small commuter engine at about 10 : 1 runs happily on regular petrol. A sports engine at 13 : 1 makes more power per cc, but its manual specifies premium fuel; on regular fuel its knock sensor retards the ignition and power drops.',
        ],
      },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'An engine has a swept volume of 450 cc and a clearance volume of 50 cc. What is its compression ratio?', options: [{ id: 'a', label: '9 : 1' }, { id: 'b', label: '10 : 1' }, { id: 'c', label: '11 : 1' }], correctOptionId: 'b', explanation: '(450 + 50) ÷ 50 = 10.' },
      { id: 'q2', prompt: 'Why is a higher compression ratio more efficient?', options: [{ id: 'a', label: 'The gas expands further after burning, turning more heat into work' }, { id: 'b', label: 'It burns less fuel per cycle' }, { id: 'c', label: 'It spins faster' }], correctOptionId: 'a', explanation: 'More compression before combustion means more expansion after it.' },
      { id: 'q3', prompt: 'Why does a high-compression engine need higher-octane fuel?', options: [{ id: 'a', label: 'It uses more fuel' }, { id: 'b', label: 'The hotter, higher-pressure mixture is more likely to knock' }, { id: 'c', label: 'Octane adds power by itself' }], correctOptionId: 'b', explanation: 'Higher octane resists self-ignition under the higher compression temperature.' },
    ],
  },

  // 4 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'torque-and-horsepower',
    title: 'Torque and horsepower',
    summary: 'Twisting force and the rate of doing work — and why power peaks later than torque.',
    durationMinutes: 6,
    objectives: ['Distinguish torque from power', 'Calculate power from torque and engine speed', 'Explain why the power peak comes at higher revs than the torque peak'],
    blocks: [
      {
        type: 'concept',
        heading: 'Power = torque × rotational speed',
        body: [
          'Torque is a twisting force: the push of the combustion pressure on the crank. It is what you feel as the motorcycle pulls. Power is how fast that torque does work: torque multiplied by rotational speed (in radians per second). One horsepower is about 746 W.',
          'This engine’s torque peaks around 10 N·m at 6,500 RPM. But power keeps rising beyond that, because the revs climb faster than the torque falls — peaking at about 8 kW (10.7 hp) near 8,500 RPM. Gearing turns engine torque into wheel torque, but no gear can create power: top speed is set by power against air drag.',
        ],
      },
      { type: 'illustration', illustration: 'torque-power', caption: 'Move along the rev range and compare the torque and power curves.' },
      {
        type: 'keyPoints',
        heading: 'What it means when riding',
        points: [
          'Strong low-rev torque makes an engine easy to ride: it pulls from low speeds without changing down.',
          'Maximum acceleration comes from keeping the engine near its power peak — change up just past it.',
          'Fuel economy is best at moderate revs and part throttle, well below the power peak.',
        ],
      },
      {
        type: 'example',
        body: [
          'Two motorcycles have the same 10 kW. One makes it at 8,000 RPM with a little torque; the other at 5,000 RPM with more torque. Both reach the same top speed, but the second feels much stronger in town because it pulls hard at the revs you actually use.',
        ],
      },
      { type: 'illustration', illustration: 'torque-lever', caption: 'From the basics module: torque as force × lever arm.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'An engine makes 10 N·m at 6,000 RPM (628 rad/s). What power is that?', options: [{ id: 'a', label: 'About 6.3 kW' }, { id: 'b', label: 'About 60 kW' }, { id: 'c', label: 'About 0.6 kW' }], correctOptionId: 'a', explanation: 'P = T × ω = 10 × 628 ≈ 6,280 W.' },
      { id: 'q2', prompt: 'Why does power peak at higher revs than torque?', options: [{ id: 'a', label: 'The revs rise faster than the torque falls' }, { id: 'b', label: 'The gearbox adds power' }, { id: 'c', label: 'It doesn’t — they always peak together' }], correctOptionId: 'a', explanation: 'Power is torque × speed; past the torque peak, speed keeps multiplying a gently falling torque.' },
      { id: 'q3', prompt: 'What mainly decides a motorcycle’s top speed?', options: [{ id: 'a', label: 'Peak torque' }, { id: 'b', label: 'Peak power against air drag' }, { id: 'c', label: 'The number of gears' }], correctOptionId: 'b', explanation: 'At top speed all the power is used overcoming drag; gearing just lets the engine reach its power peak.' },
    ],
  },

  // 5 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'gear-ratios',
    title: 'Gear ratios',
    summary: 'How teeth counts multiply torque and divide speed, from crankshaft to rear wheel.',
    durationMinutes: 6,
    objectives: ['Calculate a gear ratio from tooth counts', 'Combine primary, gearbox and final-drive ratios', 'Relate the overall ratio to wheel torque and engine speed'],
    blocks: [
      {
        type: 'concept',
        heading: 'Three reductions in a row',
        body: [
          'A gear ratio is the number of teeth on the driven gear divided by the teeth on the driving gear. A 12-tooth gear driving a 36-tooth gear turns it one third as fast with three times the torque (less a little friction).',
          'On this motorcycle the engine’s speed is reduced three times: the primary drive (crank to clutch, 3.35 : 1), the gearbox (3.00 : 1 in first down to 0.96 : 1 in fifth) and the final drive (chain and sprockets, 3 : 1). Multiply them: about 30 : 1 overall in first, 9.6 : 1 in fifth. That is why the engine turns about 267 RPM per km/h in first, but only 86 in fifth.',
        ],
      },
      { type: 'illustration', illustration: 'gearbox', caption: 'Select gears and see which pair carries the power.' },
      { type: 'cta', to: '/simulators/cockpit?practice=gears-drill&from=/learn/mechanics/gear-ratios', title: 'Practise it in the cockpit', text: 'See each gear change the engine speed for the same road speed.' },
      { type: 'illustration', illustration: 'gear-speed-chart', caption: 'From the basics module: the speed range of each gear.' },
      {
        type: 'example',
        body: [
          'Fitting a rear sprocket with three more teeth (say 42 → 45) shortens every gear by 7 %: quicker acceleration, but higher revs at cruising speed and a slightly lower top speed. A smaller rear sprocket does the opposite: calmer cruising, gentler acceleration.',
        ],
      },
      { type: 'illustration', illustration: 'wheel-torque', caption: 'Engine torque multiplied through the gears into force at the tyre.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'A 15-tooth sprocket drives a 45-tooth sprocket. What is the ratio?', options: [{ id: 'a', label: '3 : 1' }, { id: 'b', label: '1 : 3' }, { id: 'c', label: '30 : 1' }], correctOptionId: 'a', explanation: '45 ÷ 15 = 3: the driven sprocket turns a third as fast with three times the torque.' },
      { id: 'q2', prompt: 'How is the overall ratio found?', options: [{ id: 'a', label: 'By adding the ratios' }, { id: 'b', label: 'By multiplying the primary, gearbox and final-drive ratios' }, { id: 'c', label: 'From the gearbox ratio alone' }], correctOptionId: 'b', explanation: 'Each stage reduces the speed of the one before, so the ratios multiply.' },
      { id: 'q3', prompt: 'What happens with a larger rear sprocket?', options: [{ id: 'a', label: 'Quicker acceleration, higher cruising revs' }, { id: 'b', label: 'Higher top speed, lower revs' }, { id: 'c', label: 'Nothing changes' }], correctOptionId: 'a', explanation: 'A bigger rear sprocket raises the overall ratio: more wheel torque, more engine revs per km/h.' },
    ],
  },

  // 6 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'clutch-plates',
    title: 'Clutch plates',
    summary: 'How a stack of plates, springs and oil carries the engine’s torque — and why the oil matters.',
    durationMinutes: 6,
    objectives: ['Describe the parts of a wet multi-plate clutch', 'Calculate clutch capacity from its plates and springs', 'Explain why motorcycle clutches need the right oil'],
    blocks: [
      {
        type: 'concept',
        heading: 'Capacity = surfaces × friction × clamp × radius',
        body: [
          'Friction plates, splined to the clutch basket (driven by the crankshaft), alternate with steel plates splined to the hub on the gearbox mainshaft. Springs press the stack together; friction between the faces carries the torque. Pulling the lever lifts the pressure plate and the stack separates.',
          'The torque a clutch can carry is the number of friction surfaces × the friction coefficient × the spring force × the mean radius of the faces. Four friction plates give eight surfaces: 8 × 0.13 × 1,150 N × 0.05 m ≈ 60 N·m at the clutch — about 1.75 times the engine’s peak torque arriving there. Using several plates lets a compact clutch carry a lot without needing a heavy lever.',
        ],
      },
      { type: 'illustration', illustration: 'clutch-capacity', caption: 'Change the lever pull, the number of plates and their condition. When does the clutch slip?' },
      { type: 'cta', to: '/simulators/cockpit?practice=clutch-drill&from=/learn/mechanics/clutch-plates', title: 'Practise it in the cockpit', text: 'Watch the clamp load and the torque the plates pass as you work the lever.' },
      { type: 'illustration', illustration: 'clutch', caption: 'The clutch from the basics module: lever travel, friction zone and clamping force.' },
      {
        type: 'keyPoints',
        heading: 'Why it slips',
        points: [
          'Worn friction material: thinner plates mean less spring force on the stack.',
          'The wrong oil: car oils with friction modifiers make the plates slippery. Use oil rated JASO MA for wet clutches.',
          'No freeplay at a cable clutch’s lever: the springs are never fully clamping. (A hydraulic clutch adjusts for wear itself.)',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Variations',
        body: 'Many modern motorcycles have a slipper clutch, which lets the plates slip when the rear wheel tries to drive the engine too hard — after a clumsy downshift — so the rear tyre doesn’t hop. Assist clutches use ramps to add clamp under drive, so lighter springs (and a lighter lever) can be used. A few motorcycles have a dry clutch that runs without oil.',
      },
      {
        type: 'example',
        body: [
          'After an oil change with cheap car oil, a rider notices the revs rising but the motorcycle not accelerating when they open the throttle in top gear. The clutch is slipping under full load. Draining and refilling with JASO MA oil cures it.',
        ],
      },
      { type: 'cta', to: '/simulators/clutch-explorer', title: 'See it working', text: 'Open the clutch explorer: the clamp load, the torque the plates can pass and the torque they are passing, live.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'How many friction surfaces do 5 friction plates provide?', options: [{ id: 'a', label: '5' }, { id: 'b', label: '10' }, { id: 'c', label: '20' }], correctOptionId: 'b', explanation: 'Each friction plate has two faces, so 5 plates give 10 surfaces.' },
      { id: 'q2', prompt: 'Which change increases clutch capacity?', options: [{ id: 'a', label: 'Weaker springs' }, { id: 'b', label: 'More friction plates' }, { id: 'c', label: 'Oil with friction modifiers' }], correctOptionId: 'b', explanation: 'More surfaces carry more torque for the same spring force.' },
      { id: 'q3', prompt: 'Why should motorcycle oil for a wet clutch be JASO MA rated?', options: [{ id: 'a', label: 'It has no friction modifiers that would make the clutch slip' }, { id: 'b', label: 'It is thicker' }, { id: 'c', label: 'It cools better' }], correctOptionId: 'a', explanation: 'The clutch runs in the engine oil, so the oil must not reduce plate friction.' },
    ],
  },

  // 7 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'transmission',
    title: 'The transmission',
    summary: 'Constant-mesh gears, dogs and the shift drum: what happens when you move the lever.',
    durationMinutes: 7,
    objectives: ['Explain what a constant-mesh gearbox is', 'Describe how dogs lock a gear to its shaft', 'Explain how the shift drum makes the gearbox sequential'],
    blocks: [
      {
        type: 'concept',
        heading: 'All gears in mesh; only the dogs change',
        body: [
          'In a motorcycle gearbox every gear pair is always in mesh. On each pair, one gear is fixed to its shaft and the other spins freely on it. Changing gear means locking one free gear to its shaft. That is done by dogs: chunky lugs on the side of a sliding gear or ring that engage matching slots in the neighbouring gear.',
          'The gear lever doesn’t move the dogs directly. Each click turns the shift drum one step. Grooves cut round the drum guide three selector forks sideways, and the forks slide the dog gears. Because the drum can only turn step by step, gears must be selected in order: a sequential gearbox. A spring-loaded detent holds the drum exactly in each position.',
        ],
      },
      { type: 'illustration', illustration: 'shift-drum', caption: 'Shift through the gears and watch the drum turn, the forks move and the dogs engage.' },
      { type: 'cta', to: '/simulators/cockpit?practice=gears-drill&from=/learn/mechanics/transmission', title: 'Practise it in the cockpit', text: 'Shift through the gears and watch the selected pair engage.' },
      {
        type: 'steps',
        heading: 'One gear change, inside',
        steps: [
          { title: 'Clutch in', body: 'Torque stops flowing, so the dogs aren’t loaded and can slide out.' },
          { title: 'Lever moves', body: 'The selector mechanism turns the drum one step.' },
          { title: 'Forks slide', body: 'The drum grooves push one dog gear out of engagement and another into it.' },
          { title: 'Clutch out', body: 'The newly locked pair carries the torque.' },
        ],
      },
      {
        type: 'example',
        body: [
          'A rider changes up without fully closing the throttle or using the clutch and hears a crunch. The dogs were loaded and skated over each other. Done repeatedly, this rounds the dog edges until the gearbox jumps out of gear under load.',
        ],
      },
      { type: 'illustration', illustration: 'gearbox', caption: 'The live gearbox from the gear-shifting simulator’s anatomy.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'In a constant-mesh gearbox, what changes when you select a gear?', options: [{ id: 'a', label: 'Which gear pairs are in mesh' }, { id: 'b', label: 'Which free gear is locked to its shaft by the dogs' }, { id: 'c', label: 'The direction of the shafts' }], correctOptionId: 'b', explanation: 'All pairs stay in mesh; the dogs lock one free gear to its shaft.' },
      { id: 'q2', prompt: 'What makes a motorcycle gearbox sequential?', options: [{ id: 'a', label: 'The shift drum turns one step per lever movement' }, { id: 'b', label: 'The chain' }, { id: 'c', label: 'The clutch' }], correctOptionId: 'a', explanation: 'The drum can only move step by step, so the gears come in order.' },
      { id: 'q3', prompt: 'What do the selector forks do?', options: [{ id: 'a', label: 'Hold the clutch plates apart' }, { id: 'b', label: 'Slide the dog gears sideways, guided by the drum grooves' }, { id: 'c', label: 'Tension the chain' }], correctOptionId: 'b', explanation: 'Each fork rides in a drum groove and slides a dog gear along its shaft.' },
    ],
  },

  // 8 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'fuel-injection',
    title: 'Fuel injection',
    summary: 'How the ECU measures the air and meters exactly the fuel it needs, every cycle.',
    durationMinutes: 7,
    objectives: ['Describe the sensors an EFI system uses', 'Explain how injector pulse width sets the fuel quantity', 'Explain closed-loop control with the oxygen sensor'],
    blocks: [
      {
        type: 'concept',
        heading: 'Measure the air, add the fuel',
        body: [
          'An electronic control unit (ECU) estimates how much air the cylinder draws in each cycle from engine speed, throttle position and manifold pressure (and air temperature). It divides by the air–fuel ratio it wants — 14.7 : 1 for clean, efficient running — and opens the injector for exactly long enough to spray that much fuel, typically 2–4 milliseconds.',
          'An oxygen sensor in the exhaust reports whether the mixture came out rich or lean, and the ECU trims the next pulse: closed-loop control. It deliberately richens the mixture when the engine is cold (fuel condenses on cold metal) and at full throttle (for power and to keep temperatures down).',
        ],
      },
      { type: 'illustration', illustration: 'fuel-injection', caption: 'Change engine speed, throttle and temperature. Watch the sensors, the air per cycle and the injector pulse.' },
      {
        type: 'terms',
        items: [
          { term: 'Stoichiometric', definition: '14.7 kg of air per kg of petrol: exactly enough oxygen to burn all the fuel.' },
          { term: 'Pulse width', definition: 'How long the injector stays open each cycle; the fuel delivered is proportional to it.' },
          { term: 'Closed loop', definition: 'Adjusting the fuel from the oxygen sensor’s measurement, rather than from the map alone.' },
        ],
      },
      {
        type: 'example',
        body: [
          'An injected motorcycle ridden up a mountain pass runs as cleanly at 3,000 m as at sea level: the manifold-pressure sensor sees the thinner air and the ECU reduces the fuel to match. A carburettor can’t do that by itself.',
        ],
      },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'How does the ECU control how much fuel is injected?', options: [{ id: 'a', label: 'By changing fuel pressure every cycle' }, { id: 'b', label: 'By how long it holds the injector open (pulse width)' }, { id: 'c', label: 'By moving the throttle' }], correctOptionId: 'b', explanation: 'At constant fuel pressure, the quantity is set by the injector’s open time.' },
      { id: 'q2', prompt: 'What does the oxygen sensor do?', options: [{ id: 'a', label: 'Measures the air entering the engine' }, { id: 'b', label: 'Reports whether the burnt mixture was rich or lean, so the ECU can correct it' }, { id: 'c', label: 'Detects knock' }], correctOptionId: 'b', explanation: 'It measures leftover oxygen in the exhaust — the feedback for closed-loop control.' },
      { id: 'q3', prompt: 'Why does the ECU richen the mixture on a cold start?', options: [{ id: 'a', label: 'Some fuel condenses on cold metal and never burns' }, { id: 'b', label: 'Cold air holds less oxygen' }, { id: 'c', label: 'To warm the oil' }], correctOptionId: 'a', explanation: 'Extra fuel makes up for what condenses until the engine warms up.' },
    ],
  },

  // 9 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'carburettor',
    title: 'The carburettor',
    summary: 'Bernoulli’s principle at work: how air flow itself meters the fuel.',
    durationMinutes: 7,
    objectives: ['Explain how a venturi creates suction', 'Describe the slide, needle, jet and float bowl', 'Explain why carburettors run rich at altitude and what the choke does'],
    blocks: [
      {
        type: 'concept',
        heading: 'Faster air, lower pressure, fuel drawn in',
        body: [
          'In a carburettor the air passes through a narrowing — the venturi — under the throttle slide. To get through the narrow section it must speed up, and faster-moving air has lower pressure (Bernoulli’s principle: the drop is ½ρv²). That suction pulls fuel up from the float bowl through the main jet.',
          'The more air flows, the stronger the suction and the more fuel is drawn — so the mixture stays roughly constant. A tapered needle attached to the slide rises as it opens, enlarging the jet opening in step. A float valve keeps the fuel in the bowl at a constant level, like the valve in a toilet cistern.',
        ],
      },
      { type: 'illustration', illustration: 'carburettor', caption: 'Open the slide, change the revs, climb in altitude and try the choke. Watch the air speed, suction and mixture.' },
      {
        type: 'keyPoints',
        heading: 'Limitations',
        points: [
          'It measures air by volume, not mass: in thin air at altitude it delivers nearly the same fuel, so the mixture goes rich.',
          'A cold engine needs a richer mixture: the choke restricts the air so the same suction pulls more fuel.',
          'Jets, needles and slides must be matched to the engine and climate — “jetting”.',
        ],
      },
      {
        type: 'example',
        body: [
          'A carburetted motorcycle tuned at sea level feels sluggish and smells of fuel high in the mountains: it is running rich. Leaving the choke on after warm-up does the same thing — and fouls the spark plug.',
        ],
      },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'Why does air pressure drop in the venturi?', options: [{ id: 'a', label: 'The air speeds up through the narrow section' }, { id: 'b', label: 'The air cools down' }, { id: 'c', label: 'The slide pumps it out' }], correctOptionId: 'a', explanation: 'By Bernoulli’s principle, faster flow means lower pressure.' },
      { id: 'q2', prompt: 'What happens to a carburettor’s mixture at high altitude?', options: [{ id: 'a', label: 'It goes lean' }, { id: 'b', label: 'It goes rich' }, { id: 'c', label: 'It stays exactly the same' }], correctOptionId: 'b', explanation: 'The air is thinner but the fuel drawn is nearly the same, so there is too much fuel for the air.' },
      { id: 'q3', prompt: 'What does the choke do?', options: [{ id: 'a', label: 'Restricts the air so the mixture is richer for a cold start' }, { id: 'b', label: 'Cuts the fuel' }, { id: 'c', label: 'Raises the float level' }], correctOptionId: 'a', explanation: 'Less air for the same suction means proportionally more fuel.' },
    ],
  },

  // 10 ──────────────────────────────────────────────────────────────────────────
  {
    id: 'cooling',
    title: 'Cooling',
    summary: 'Getting rid of the heat: fins and airflow, or coolant, radiator and thermostat.',
    durationMinutes: 6,
    objectives: ['Explain why an engine must shed so much heat', 'Compare air and liquid cooling', 'Describe the thermostat and fan'],
    blocks: [
      {
        type: 'concept',
        heading: 'A third becomes work; much of the rest must go',
        body: [
          'Only about a third of the fuel’s energy becomes useful work. Roughly as much again soaks into the cylinder walls and head and must be carried away, or the oil would break down and pistons seize.',
          'An air-cooled engine has fins that shed heat into the passing air, so its temperature depends on speed and load: in this model the cylinder head runs around 130 °C cruising, but much hotter under full load at low speed. A liquid-cooled engine pumps coolant through passages around the cylinder to a radiator; a thermostat keeps it near 85 °C, and a fan pulls air through the radiator when the motorcycle is standing still.',
        ],
      },
      { type: 'illustration', illustration: 'cooling', caption: 'Compare air and liquid cooling in traffic, cruising, at full throttle and climbing.' },
      {
        type: 'terms',
        items: [
          { term: 'Thermostat', definition: 'A valve that stays closed until the coolant reaches about 82 °C, so the engine warms up quickly, then opens to send coolant to the radiator.' },
          { term: 'Coolant', definition: 'Water with antifreeze and corrosion inhibitors. Check its level in the expansion tank, with the engine cold.' },
        ],
      },
      {
        type: 'example',
        body: [
          'Stuck in a summer traffic jam, a liquid-cooled motorcycle’s fan cycles on and off and the temperature gauge stays put. An air-cooled one gets very hot around the rider’s legs; switching off the engine at long stops helps both the engine and the rider.',
        ],
      },
      { type: 'callout', tone: 'safety', body: 'Never open the radiator cap on a hot engine — the coolant is under pressure and above boiling point.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'What does the thermostat do?', options: [{ id: 'a', label: 'Keeps coolant away from the radiator until the engine is warm, then regulates its temperature' }, { id: 'b', label: 'Switches the engine off when hot' }, { id: 'c', label: 'Measures oil temperature' }], correctOptionId: 'a', explanation: 'It lets the engine warm up quickly and then holds a steady temperature.' },
      { id: 'q2', prompt: 'Why does an air-cooled engine run hotter in slow traffic?', options: [{ id: 'a', label: 'There is little airflow over the fins' }, { id: 'b', label: 'The fuel is hotter' }, { id: 'c', label: 'The thermostat closes' }], correctOptionId: 'a', explanation: 'Air cooling depends on the air moving past the fins.' },
      { id: 'q3', prompt: 'When does a liquid-cooled motorcycle’s fan switch on?', options: [{ id: 'a', label: 'All the time' }, { id: 'b', label: 'When the coolant gets hot with too little airflow, such as standing in traffic' }, { id: 'c', label: 'Only at full throttle' }], correctOptionId: 'b', explanation: 'At speed the airflow through the radiator is enough; standing still, the fan provides it.' },
    ],
  },

  // 11 ──────────────────────────────────────────────────────────────────────────
  {
    id: 'lubrication',
    title: 'Lubrication',
    summary: 'The oil circuit, oil pressure and the film that keeps metal from touching metal.',
    durationMinutes: 7,
    objectives: ['Trace the oil circuit in a wet-sump engine', 'Explain what sets oil pressure', 'Explain why cold starts and low oil cause wear'],
    blocks: [
      {
        type: 'concept',
        heading: 'A film of oil, under pressure',
        body: [
          'A gear pump driven by the engine draws oil from the sump, pushes it through the filter and into passages to the crankshaft bearings, camshaft and gearbox; it then drains back to the sump. In most motorcycles the same oil also lubricates the gearbox and the clutch.',
          'Pressure comes from forcing oil through the bearings’ tiny clearances, so it rises with engine speed and with the oil’s viscosity — about 3 bar at 4,000 RPM when hot here, capped at 5 bar by a relief valve. What actually protects the engine is the film of oil between the moving surfaces, which keeps them apart: thicker with more viscous oil and faster rotation.',
        ],
      },
      { type: 'illustration', illustration: 'lubrication', caption: 'Change engine speed and oil temperature, and try a low oil level. Watch pressure and the bearing film.' },
      {
        type: 'terms',
        items: [
          { term: 'Viscosity', definition: 'How thick the oil is. A 10W-30 oil is about 70 times thicker at 0 °C than at 90 °C.' },
          { term: '10W-30', definition: 'Flows like a thin “10” oil when cold (W for winter) and protects like a thicker “30” oil when hot.' },
          { term: 'Wet sump', definition: 'The oil is stored in the bottom of the crankcase, as on most motorcycles.' },
        ],
      },
      {
        type: 'example',
        body: [
          'A rider starts the engine on a frosty morning and immediately revs it hard. The thick oil hits the relief valve but takes a few seconds to reach the camshaft. Most engine wear happens in moments like these. Idling briefly, then riding gently for the first few minutes, protects it.',
        ],
      },
      { type: 'callout', tone: 'safety', body: 'If the oil-pressure warning light comes on while riding, stop and switch off as soon as it is safe. Running without oil pressure can wreck the bearings in seconds.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'Why is oil pressure higher when the oil is cold?', options: [{ id: 'a', label: 'Cold oil is thicker and resists flowing through the bearings' }, { id: 'b', label: 'The pump spins faster' }, { id: 'c', label: 'There is more oil' }], correctOptionId: 'a', explanation: 'Higher viscosity means more resistance, so more pressure for the same flow.' },
      { id: 'q2', prompt: 'What prevents metal-to-metal contact in a bearing?', options: [{ id: 'a', label: 'A film of oil between the surfaces' }, { id: 'b', label: 'Hardened steel' }, { id: 'c', label: 'The relief valve' }], correctOptionId: 'a', explanation: 'A pressurised film keeps the surfaces apart while they turn.' },
      { id: 'q3', prompt: 'When does most engine wear happen?', options: [{ id: 'a', label: 'At steady cruising' }, { id: 'b', label: 'In the first moments after a cold start' }, { id: 'c', label: 'When idling hot' }], correctOptionId: 'b', explanation: 'Thick cold oil takes time to reach every surface.' },
    ],
  },

  // 12 ──────────────────────────────────────────────────────────────────────────
  {
    id: 'abs',
    title: 'ABS',
    summary: 'How anti-lock brakes keep the wheel turning at the edge of grip.',
    durationMinutes: 7,
    objectives: ['Explain what wheel slip is and why grip peaks at a little slip', 'Describe how ABS detects and prevents a lock', 'Explain why ABS shortens stops and preserves steering'],
    blocks: [
      {
        type: 'concept',
        heading: 'Release, recover, reapply — many times a second',
        body: [
          'A braked tyre always slips a little: it turns slightly slower than the road passes beneath it. Grip rises with slip up to a peak at around 12 %, then falls — a locked wheel (100 % slip) grips only about 70 % as well, and can’t steer.',
          'ABS watches each wheel’s speed sensor. If a wheel slows far faster than the motorcycle could, it is about to lock: the ABS modulator briefly releases brake pressure, lets the wheel spin back up, then reapplies it — up to 15 times a second. The tyre stays near its peak grip and keeps rolling.',
        ],
      },
      { type: 'illustration', illustration: 'abs-cycle', caption: 'Brake hard from 50 km/h with and without ABS, on a dry or wet road. Watch the wheel speed and the brake pressure.' },
      {
        type: 'keyPoints',
        heading: 'Riding with ABS',
        points: [
          'In an emergency, brake hard with both brakes and keep squeezing — let ABS work, even if the lever pulses.',
          'ABS keeps the wheels from locking; it doesn’t create grip. It can’t stop you sooner than the tyres and surface allow.',
          'Standard ABS works best upright. Some modern systems (“cornering ABS”) also account for lean angle.',
          'On loose gravel or snow, standard ABS can make the stop longer — some off-road motorcycles let you switch it off at the rear.',
        ],
      },
      {
        type: 'example',
        body: [
          'In the model, a full-force stop from 50 km/h takes 16.0 m with locked wheels but 13.2 m with ABS on dry asphalt — and 24.3 m instead of 28.5 m in the wet. More important than the distance: the front wheel keeps turning, so the motorcycle stays upright and steerable.',
        ],
      },
      { type: 'cta', to: '/simulators/ride-and-stop', title: 'Try it', text: 'Switch ABS on in the riding-and-stopping simulator and brake hard.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'At about what wheel slip does a tyre give its most braking grip?', options: [{ id: 'a', label: '0 %' }, { id: 'b', label: 'Around 10–15 %' }, { id: 'c', label: '100 % (locked)' }], correctOptionId: 'b', explanation: 'Grip rises with slip to a peak at a little slip, then falls as the tyre slides.' },
      { id: 'q2', prompt: 'How does ABS stop a wheel locking?', options: [{ id: 'a', label: 'It briefly releases brake pressure when a wheel slows too quickly, then reapplies it' }, { id: 'b', label: 'It increases tyre grip' }, { id: 'c', label: 'It brakes the other wheel' }], correctOptionId: 'a', explanation: 'Release–recover–reapply cycles keep the wheel turning near peak grip.' },
      { id: 'q3', prompt: 'You must stop urgently on a motorcycle with ABS. What do you do?', options: [{ id: 'a', label: 'Pump the brakes' }, { id: 'b', label: 'Brake hard with both brakes and keep squeezing' }, { id: 'c', label: 'Use only the rear brake' }], correctOptionId: 'b', explanation: 'ABS does the modulating; your job is to apply full braking and keep it on.' },
    ],
  },

  // 13 ──────────────────────────────────────────────────────────────────────────
  {
    id: 'traction-control',
    title: 'Traction control',
    summary: 'The mirror image of ABS: stopping the rear wheel from spinning under power.',
    durationMinutes: 6,
    objectives: ['Explain wheelspin as slip under drive', 'Describe how traction control detects and limits it', 'Explain why a spinning tyre loses sideways grip'],
    blocks: [
      {
        type: 'concept',
        heading: 'Too much drive for the grip',
        body: [
          'Under acceleration the rear tyre turns slightly faster than the road: slip again, and again grip peaks at a little slip. Snap the throttle open in a low gear on a wet road and the engine asks for more drive than the tyre can transmit. The wheel spins up — and a spinning tyre has lost most of its sideways grip too, so the rear can step out.',
          'Traction control compares the rear wheel’s speed with the front’s. When the rear turns more than about 10 % faster, the ECU trims engine torque — retarding the spark, cutting fuel or closing the throttle — and restores it as grip returns. The tyre stays near its peak grip.',
        ],
      },
      { type: 'illustration', illustration: 'traction-control', caption: 'Snap the throttle open on a wet road, with and without traction control.' },
      {
        type: 'keyPoints',
        heading: 'Without traction control',
        points: [
          'Roll the throttle on smoothly, especially in low gears and on wet or loose surfaces.',
          'Be gentle with the throttle while leaned over.',
          'A higher gear gives less wheel torque — useful on slippery surfaces.',
        ],
      },
      {
        type: 'example',
        body: [
          'Pulling out of a junction across a wet painted line, a rider opens the throttle sharply. The rear wheel spins and slides sideways. With a smoother roll-on — or traction control — the tyre would have found grip immediately.',
        ],
      },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'How does traction control detect wheelspin?', options: [{ id: 'a', label: 'By comparing rear and front wheel speeds' }, { id: 'b', label: 'By measuring engine temperature' }, { id: 'c', label: 'From the throttle position alone' }], correctOptionId: 'a', explanation: 'A rear wheel turning much faster than the front is spinning.' },
      { id: 'q2', prompt: 'What does traction control do when the rear spins?', options: [{ id: 'a', label: 'Applies the front brake' }, { id: 'b', label: 'Reduces engine torque until grip returns' }, { id: 'c', label: 'Changes gear' }], correctOptionId: 'b', explanation: 'Trimming torque brings the slip back to where the tyre grips best.' },
      { id: 'q3', prompt: 'Why is wheelspin dangerous in a bend?', options: [{ id: 'a', label: 'A spinning tyre loses most of its sideways grip' }, { id: 'b', label: 'It wears the chain' }, { id: 'c', label: 'It overheats the engine' }], correctOptionId: 'a', explanation: 'With little sideways grip left, the rear slides out.' },
    ],
  },

  // 14 ──────────────────────────────────────────────────────────────────────────
  {
    id: 'suspension',
    title: 'Suspension',
    summary: 'Springs, dampers, preload and sag — keeping the tyres pressed onto the road.',
    durationMinutes: 8,
    objectives: ['Explain the separate jobs of the spring and the damper', 'Define sag and explain what preload does', 'Recognise the symptoms of too little or too much damping'],
    blocks: [
      {
        type: 'concept',
        heading: 'Spring absorbs, damper controls',
        body: [
          'Suspension has two jobs: keeping the tyres pressed onto the road — grip depends on load — and isolating the rider and chassis from bumps. The spring absorbs a bump by compressing, storing its energy. Left alone it would give that energy back as a bounce, over and over; the damper forces oil through small holes, turning the motion into heat so it dies away after one smooth movement.',
          'Rider sag is how far the suspension settles under the motorcycle with the rider aboard: typically about 25–33 % of travel (less with the motorcycle alone). Preload compresses the spring beforehand, so it changes sag and ride height — but not the spring’s stiffness. Too much sag leaves too little travel for bumps; too little lets the wheel drop into holes poorly.',
        ],
      },
      { type: 'illustration', illustration: 'suspension-tuning', caption: 'Ride over a speed breaker at 30 km/h. Change the spring, preload and damping and watch the body and the tyre load.' },
      { type: 'illustration', illustration: 'suspension', caption: 'Inside a fork leg: with and without damping.' },
      {
        type: 'terms',
        items: [
          { term: 'Spring rate', definition: 'Force per millimetre of compression (N/mm). Heavier riders and pillions need a stiffer spring or more preload.' },
          { term: 'Compression and rebound damping', definition: 'Resistance as the suspension compresses and as it extends again; adjustable on some motorcycles.' },
          { term: 'Bottoming out', definition: 'Using all the travel — a harsh knock as the suspension hits its stop.' },
        ],
      },
      {
        type: 'example',
        body: [
          'Carrying a pillion and luggage, a rider finds the rear wallowing and scraping over bumps. Adding rear preload (often a ramped collar on the shock) restores the sag and ride height, and the motorcycle steers properly again.',
        ],
      },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'What is the damper’s job?', options: [{ id: 'a', label: 'To hold up the motorcycle’s weight' }, { id: 'b', label: 'To stop the spring bouncing, by turning motion into heat' }, { id: 'c', label: 'To set the ride height' }], correctOptionId: 'b', explanation: 'Springs store energy; dampers dissipate it so the motion dies away.' },
      { id: 'q2', prompt: 'What does adding preload change?', options: [{ id: 'a', label: 'The spring rate' }, { id: 'b', label: 'The sag and ride height' }, { id: 'c', label: 'The damping' }], correctOptionId: 'b', explanation: 'Preload compresses the spring in advance; its stiffness stays the same.' },
      { id: 'q3', prompt: 'After a bump, the front keeps bouncing several times. What is wrong?', options: [{ id: 'a', label: 'Too little damping' }, { id: 'b', label: 'Too much damping' }, { id: 'c', label: 'Tyre pressure too high' }], correctOptionId: 'a', explanation: 'Without enough damping, the spring keeps returning its stored energy.' },
    ],
  },

  // 15 ──────────────────────────────────────────────────────────────────────────
  {
    id: 'tyre-dynamics',
    title: 'Tyre dynamics',
    summary: 'Slip, slip angle and the contact patch: how a tyre actually grips.',
    durationMinutes: 7,
    objectives: ['Explain that grip requires a little slip', 'Describe the slip curve and slip angle', 'Relate tyre pressure and load to the contact patch'],
    blocks: [
      {
        type: 'concept',
        heading: 'Grip through slip',
        body: [
          'A tyre doesn’t grip like glue. Its rubber deforms where it touches the road, and the tread is slightly stretched or squashed through the contact patch. For braking or driving force the tyre must turn slightly slower or faster than the road (slip); for cornering force it must point slightly away from its path (slip angle).',
          'Force grows with slip to a peak — around 12 % slip for braking — then falls as the tread starts to slide. The contact patch area is roughly the load divided by the inflation pressure: about 53 cm² for 1,200 N at 225 kPa. Rubber also needs warmth to grip well, which is why cold tyres on a cold morning deserve care.',
        ],
      },
      { type: 'illustration', illustration: 'tyre-slip', caption: 'Move along the slip curve, and change tyre pressure and load to see the contact patch.' },
      {
        type: 'keyPoints',
        heading: 'Looking after grip',
        points: [
          'Check pressures weekly, with the tyres cold, against the owner’s manual — more with a pillion if the manual says so.',
          'Under-inflation overheats the tyre and makes steering heavy and vague; over-inflation shrinks the contact patch.',
          'Tread depth matters most in the wet: the grooves clear water so the rubber can reach the road.',
        ],
      },
      { type: 'illustration', illustration: 'friction-circle', caption: 'From the handling module: braking and cornering share one budget of grip.' },
      {
        type: 'example',
        body: [
          'A rider’s rear tyre has crept down to 150 kPa. The motorcycle feels heavy to turn and wanders in long bends; the overheated tyre wears quickly at the edges. Back at the correct pressure, the steering is light and precise again.',
        ],
      },
      { type: 'explore', part: 'wheels', text: 'See the wheels and tyres in the Anatomy Explorer.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'What happens to grip beyond the peak of the slip curve?', options: [{ id: 'a', label: 'It keeps rising' }, { id: 'b', label: 'It falls as the tyre starts to slide' }, { id: 'c', label: 'It stays constant' }], correctOptionId: 'b', explanation: 'Past the peak the tread slides; a locked tyre grips only about 70 % as well.' },
      { id: 'q2', prompt: 'What is a slip angle?', options: [{ id: 'a', label: 'The angle the tyre points away from its direction of travel while cornering' }, { id: 'b', label: 'The lean angle' }, { id: 'c', label: 'The angle of the tread pattern' }], correctOptionId: 'a', explanation: 'A small slip angle twists the contact patch, producing cornering force.' },
      { id: 'q3', prompt: 'What does under-inflating a tyre do?', options: [{ id: 'a', label: 'Improves grip with no downside' }, { id: 'b', label: 'Overheats it and makes steering vague' }, { id: 'c', label: 'Reduces the contact patch' }], correctOptionId: 'b', explanation: 'A soft tyre flexes too much, overheating and blurring the steering.' },
    ],
  },

  // 16 ──────────────────────────────────────────────────────────────────────────
  {
    id: 'weight-transfer',
    title: 'Weight transfer',
    summary: 'How braking, accelerating and cornering move load between the tyres — and what that does to grip.',
    durationMinutes: 6,
    objectives: ['Calculate load transfer from deceleration', 'Explain how load transfer changes each tyre’s grip', 'Explain why suspension pitch slows the transfer'],
    blocks: [
      {
        type: 'concept',
        heading: 'A high centre of mass on a short wheelbase',
        body: [
          'The combined centre of mass of motorcycle and rider sits about 0.6 m up, on a wheelbase of about 1.3 m. Braking at a g, the braking force acts at the road, below the centre of mass, and the pitching moment it creates transfers load to the front — riders say weight transfer, but the mass stays where it is: the front’s share grows by 0.6/1.3 × a/g — from 45 % at rest to over 80 % in a hard stop. Accelerating does the opposite.',
          'Each tyre’s grip is roughly proportional to its load, so the front can provide most of the braking while the lightly loaded rear locks easily. The load on the front tyre rises as the deceleration builds, but the fork takes a fraction of a second to compress and the chassis to settle. A grabbed lever asks for full braking before the front tyre is loaded and settled, and can lock it; squeezing progressively lets the load and the grip build with the demand.',
        ],
      },
      { type: 'illustration', illustration: 'weight-transfer', caption: 'Braking from rolling to an emergency stop: how the load shifts.' },
      { type: 'cta', to: '/simulators/cockpit?practice=brakes-drill&from=/learn/mechanics/weight-transfer', title: 'Practise it in the cockpit', text: 'Brake and watch the load move onto the front tyre and the fork compress.' },
      { type: 'illustration', illustration: 'corner-grip', caption: 'In a bend: how much of each tyre’s grip is used when braking or accelerating.' },
      {
        type: 'example',
        body: [
          'A rider braking hard feels the fork compress and the rear go light — a little rear brake that was fine at the start of the stop locks the wheel at the end. Easing the rear pedal as the load comes off it keeps the wheel turning.',
        ],
      },
      { type: 'cta', to: '/simulators/ride-and-stop', title: 'Feel it', text: 'Brake in the riding-and-stopping simulator and watch the load arrows.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'With h/L = 0.46, how much does the front share grow when braking at 0.5 g?', options: [{ id: 'a', label: 'About 23 percentage points' }, { id: 'b', label: 'About 5 percentage points' }, { id: 'c', label: 'About 50 percentage points' }], correctOptionId: 'a', explanation: '0.46 × 0.5 = 0.23, so 45 % becomes about 68 %.' },
      { id: 'q2', prompt: 'Why does the rear wheel lock easily in a hard stop?', options: [{ id: 'a', label: 'Most of the load has moved to the front' }, { id: 'b', label: 'The rear brake is bigger' }, { id: 'c', label: 'The rear tyre is narrower' }], correctOptionId: 'a', explanation: 'Little load on the rear tyre means little grip.' },
      { id: 'q3', prompt: 'Why should braking be applied progressively?', options: [{ id: 'a', label: 'The fork needs a moment to compress and the front tyre’s load to build' }, { id: 'b', label: 'To save the brake pads' }, { id: 'c', label: 'It isn’t necessary' }], correctOptionId: 'a', explanation: 'The front tyre’s grip grows as the load arrives; a grab arrives before it.' },
    ],
  },

  // 17 ──────────────────────────────────────────────────────────────────────────
  {
    id: 'engine-braking',
    title: 'Engine braking',
    summary: 'Where the slowing force comes from when you close the throttle, and how gears change it.',
    durationMinutes: 6,
    objectives: ['Explain the sources of engine braking', 'Explain why lower gears give stronger engine braking', 'Use engine braking safely, without over-revving'],
    blocks: [
      {
        type: 'concept',
        heading: 'Friction and vacuum, multiplied by the gearing',
        body: [
          'With the throttle closed and the clutch out, the rear wheel has to keep the engine turning. Two things resist it: internal friction (pistons, bearings, valve springs) and pumping loss — with the throttle closed, the pistons pull against a near-vacuum on every intake stroke.',
          'Both grow with engine speed, and the gearing multiplies them at the wheel. A lower gear turns the engine faster for the same road speed and multiplies its resistance by a bigger ratio, so in the lower gears the slowing effect is several times stronger than coasting with the clutch in. Many fuel-injected engines cut the fuel on a closed throttle above a set engine speed, so engine braking can use almost no fuel.',
        ],
      },
      { type: 'illustration', illustration: 'engine-braking', caption: 'Deceleration from engine braking at different speeds in each gear, measured on the simulator’s powertrain.' },
      { type: 'cta', to: '/simulators/cockpit?practice=gears-drill&from=/learn/mechanics/engine-braking', title: 'Practise it in the cockpit', text: 'Change down with the throttle closed and watch the power flow run backwards.' },
      {
        type: 'keyPoints',
        heading: 'Using it well',
        points: [
          'Close the throttle early to slow gently — it is smooth, free and keeps the brakes cool.',
          'Change down for stronger engine braking on hills, but only once the speed suits the lower gear — an abrupt downshift at too high a speed can make the rear tyre hop or slide (a slipper clutch reduces this).',
          'Engine braking acts on the rear wheel only and doesn’t turn on the brake light. In traffic, a touch on the brakes warns the driver behind.',
        ],
      },
      {
        type: 'example',
        body: [
          'Descending a long hill, a rider in second gear barely touches the brakes: the engine holds the speed. Another, coasting in neutral, arrives at the hairpin at the bottom with hot, fading brakes.',
        ],
      },
      { type: 'cta', to: '/simulators/gears', title: 'Practise it', text: 'Try the engine-braking exercise in the gear-shifting simulator.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'What causes pumping loss with the throttle closed?', options: [{ id: 'a', label: 'The pistons pulling against a near-vacuum in the intake' }, { id: 'b', label: 'The exhaust being blocked' }, { id: 'c', label: 'The clutch dragging' }], correctOptionId: 'a', explanation: 'A closed throttle starves the intake, so each intake stroke pulls against low pressure.' },
      { id: 'q2', prompt: 'Why does a lower gear give stronger engine braking?', options: [{ id: 'a', label: 'The engine turns faster and its resistance is multiplied by a bigger ratio' }, { id: 'b', label: 'The brakes are applied automatically' }, { id: 'c', label: 'It doesn’t' }], correctOptionId: 'a', explanation: 'More revs means more friction and pumping loss, and a higher ratio multiplies it at the wheel.' },
      { id: 'q3', prompt: 'Does engine braking light the brake light?', options: [{ id: 'a', label: 'Yes, always' }, { id: 'b', label: 'No — touch the brakes to warn traffic behind' }, { id: 'c', label: 'Only in first gear' }], correctOptionId: 'b', explanation: 'The brake light works from the brake controls, not from engine braking.' },
    ],
  },
]
