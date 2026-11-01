import type { CalloutTone } from '@/components/ui/Callout'
import type { PartId } from '@/components/motorcycle/parts'

/**
 * Anatomy Explorer content: for every component, its purpose, working principle,
 * connections to other components and internal parts. Typed as a full Record so a
 * missing component is a compile error.
 */
export interface AnatomyEntry {
  purpose: string
  /** Working principle, in reading order. */
  howItWorks: string[]
  connections: { to: PartId; how: string }[]
  internals: { name: string; role: string }[]
  callout?: { tone: CalloutTone; text: string }
}

export const anatomy: Record<PartId, AnatomyEntry> = {
  engine: {
    purpose:
      'Turns the chemical energy in fuel into rotation of the crankshaft. Everything else in the drivetrain exists to deliver, control or interrupt that rotation.',
    howItWorks: [
      'Most learner motorcycles use a single-cylinder, four-stroke petrol engine. One cycle takes two full turns of the crankshaft and four movements — strokes — of the piston.',
      'Intake: the piston moves down with the intake valve open, drawing in air mixed with fuel. Compression: both valves close and the rising piston squeezes the mixture. Power: the spark plug ignites it just before the top; the burning gas expands and forces the piston down. Exhaust: the exhaust valve opens and the rising piston pushes the burnt gas out.',
      'Only the power stroke produces work. The heavy rotating mass of the crankshaft and flywheel (on small engines, usually the generator rotor) carries the engine through the other three strokes.',
      'The connecting rod and crankshaft turn the piston’s up-and-down motion into rotation. Its speed is measured in revolutions per minute — RPM.',
    ],
    connections: [
      { to: 'throttle', how: 'Sets how much air and fuel the engine receives, and so how much power it makes.' },
      { to: 'fuel-tank', how: 'Supplies fuel to the carburettor or fuel injector.' },
      { to: 'clutch', how: 'The crankshaft drives the clutch basket through the primary drive gears.' },
      { to: 'exhaust', how: 'Takes the burnt gas away from the exhaust port.' },
      { to: 'frame', how: 'Holds the engine; on many small motorcycles the engine is itself part of the structure.' },
    ],
    internals: [
      { name: 'Piston & rings', role: 'Slides in the cylinder. The rings seal combustion pressure above it and scrape oil off the cylinder wall.' },
      { name: 'Connecting rod', role: 'Links the piston (through the gudgeon pin) to the crankpin.' },
      { name: 'Crankshaft', role: 'Converts the rod’s push into rotation; carries the flywheel and the primary drive gear.' },
      { name: 'Cylinder & head', role: 'The cylinder guides the piston; the head forms the combustion chamber and holds the valves and spark plug.' },
      { name: 'Valves & camshaft', role: 'The camshaft, driven by a chain from the crankshaft at half its speed, opens each valve at the right moment.' },
      { name: 'Spark plug', role: 'Makes the spark that ignites the compressed mixture.' },
      { name: 'Fins & oil', role: 'Cooling fins shed heat to the passing air; engine oil lubricates and cools the moving parts.' },
    ],
    callout: {
      tone: 'tip',
      text: 'The rev counter shows engine RPM. Higher RPM means more power strokes every second — but road speed depends on the gear as well.',
    },
  },

  clutch: {
    purpose:
      'Connects and disconnects the engine and the gearbox, so you can pull away smoothly, change gear and stop without stalling.',
    howItWorks: [
      'The clutch sits between the crankshaft and the gearbox. The crankshaft drives the clutch basket through the primary drive gears; the clutch hub is splined to the gearbox mainshaft.',
      'Inside, friction plates locked to the basket alternate with steel plates locked to the hub. Strong springs clamp the stack together so the basket and hub turn as one — the clutch is engaged.',
      'Pulling the lever moves a cable that operates the release mechanism. It lifts the pressure plate against its springs; the clamping force disappears and the plates slip past each other — the clutch is disengaged.',
      'In between is the friction zone, around the biting point. The plates slip partly and pass on some of the engine’s torque. Controlling this zone is how you pull away smoothly.',
      'Most motorcycle clutches are “wet”: they run in the engine oil, which cools them and smooths engagement.',
    ],
    connections: [
      { to: 'engine', how: 'Driven by the crankshaft through the primary drive gears.' },
      { to: 'gearbox', how: 'The clutch hub drives the gearbox mainshaft.' },
      { to: 'handlebar', how: 'Operated by the lever on the left handlebar.' },
      { to: 'throttle', how: 'Used together with the throttle to pull away without stalling.' },
    ],
    internals: [
      { name: 'Clutch basket', role: 'Outer drum driven by the primary gear; slots in its wall hold the friction plates.' },
      { name: 'Clutch hub', role: 'Inner drum splined to the gearbox mainshaft; its splines hold the steel plates.' },
      { name: 'Friction plates', role: 'Plates faced with friction material, turning with the basket.' },
      { name: 'Steel plates', role: 'Plain steel plates between the friction plates, turning with the hub.' },
      { name: 'Pressure plate & springs', role: 'The springs push the pressure plate to clamp the whole stack together.' },
      { name: 'Release mechanism', role: 'Lever → cable → release arm → pushrod, which lifts the pressure plate. A little freeplay at the lever ensures the clutch fully engages when released.' },
    ],
    callout: {
      tone: 'mistake',
      text: 'Letting the lever out abruptly in first gear. The clutch engages before the engine is making enough power, and the motorcycle stalls or lurches forward.',
    },
  },

  gearbox: {
    purpose:
      'Changes the ratio between engine speed and wheel speed, so the engine can stay in its useful RPM range from walking pace to top speed.',
    howItWorks: [
      'The gearbox has two parallel shafts. The mainshaft is driven by the clutch; the countershaft drives the front sprocket. Every gear on one shaft is permanently meshed with a partner on the other.',
      'Only one pair is locked to its shafts at a time. Dogs — interlocking lugs on the sides of sliding gears — lock the selected pair, while the other gears spin freely.',
      'Low gears have a small gear driving a large one: the countershaft turns slower than the mainshaft, multiplying torque for pulling away and climbing. Higher gears use more equal sizes for cruising at lower engine speed.',
      'Pressing or lifting the gear lever turns a shift drum. Grooves in the drum move shift forks, which slide gears to engage the next pair. The usual pattern is 1–N–2–3–4–5: first down, the rest up, neutral between first and second.',
      'It is sequential: gears change one step at a time, so you can’t skip from fifth straight to second.',
    ],
    connections: [
      { to: 'clutch', how: 'The clutch drives the mainshaft, and must be disengaged to change gear smoothly.' },
      { to: 'chain', how: 'The countershaft carries the front sprocket.' },
      { to: 'engine', how: 'Housed in the engine’s crankcase, sharing its oil.' },
      { to: 'footpegs', how: 'The gear lever sits in front of the left footpeg.' },
      { to: 'instruments', how: 'The neutral switch lights the green “N” (and a gear indicator, if fitted).' },
    ],
    internals: [
      { name: 'Mainshaft', role: 'Input shaft, driven by the clutch hub.' },
      { name: 'Countershaft', role: 'Output shaft, carrying the front sprocket.' },
      { name: 'Gear pairs', role: 'Five pairs of different sizes, always in mesh.' },
      { name: 'Dogs', role: 'Lugs and slots on the gear faces that lock the selected gear to its shaft.' },
      { name: 'Shift drum & forks', role: 'The drum’s grooves move the forks, which slide gears along the shafts.' },
      { name: 'Neutral switch', role: 'Senses neutral and switches on the neutral light.' },
    ],
    callout: {
      tone: 'tip',
      text: 'Change gear with a firm, deliberate press or lift of the lever — clutch pulled in, throttle closed — then release the clutch smoothly.',
    },
  },

  throttle: {
    purpose:
      'Your control for engine power. Rolling the right grip towards you increases power; rolling it away reduces it.',
    howItWorks: [
      'The twist grip turns a pulley that pulls a cable (on some modern motorcycles it moves a sensor instead — “ride-by-wire”). At the engine this opens the throttle valve: a butterfly plate in the throttle body, or a slide in a carburettor.',
      'A wider opening lets more air into the engine. The fuel system adds fuel to match, so each power stroke is stronger and the engine makes more torque.',
      'Whether that extra power raises RPM, increases speed or just holds speed up a hill depends on the gear and the load.',
      'Return springs close the throttle when you let go, and the engine drops back to idle.',
    ],
    connections: [
      { to: 'engine', how: 'Controls how much air and fuel the engine receives, and so its power.' },
      { to: 'handlebar', how: 'Mounted on the right end of the handlebar.' },
      { to: 'clutch', how: 'Balanced against the clutch when pulling away: the throttle supplies power while the clutch feeds it in gradually.' },
    ],
    internals: [
      { name: 'Twist grip & pulley', role: 'Turns the grip’s rotation into a cable pull.' },
      { name: 'Throttle cables', role: 'Usually two: one opens the throttle and one pulls it closed, so it shuts even if a spring sticks.' },
      { name: 'Throttle valve', role: 'Butterfly plate or carburettor slide that restricts the airflow.' },
      { name: 'Return spring', role: 'Snaps the throttle shut when the grip is released.' },
      { name: 'Idle stop', role: 'Holds the valve slightly open so the engine keeps running at idle.' },
    ],
    callout: {
      tone: 'safety',
      text: 'Before riding, check the throttle snaps shut by itself when released — with the handlebar straight and turned fully left and right. A sticking throttle is dangerous.',
    },
  },

  'front-brake': {
    purpose: 'Provides most of the motorcycle’s stopping power.',
    howItWorks: [
      'Squeezing the lever pushes a piston in the master cylinder on the handlebar. Brake fluid can’t be compressed, so the pressure travels through the hose to the caliper.',
      'In the caliper the fluid pushes larger pistons, which press the brake pads against both faces of the disc. Because the caliper pistons have a larger area than the master cylinder piston, the force is multiplied (Pascal’s principle).',
      'Friction between pads and disc turns the motorcycle’s energy of motion into heat.',
      'Under braking, weight transfers forward onto the front tyre, pressing it into the road and increasing its grip. That is why the front brake can provide most of the stopping force in a hard stop — often quoted as around 70 % or more.',
      'Many modern motorcycles have ABS, which releases and reapplies the pressure many times a second if the wheel starts to lock.',
    ],
    connections: [
      { to: 'wheels', how: 'The disc is bolted to the front wheel hub.' },
      { to: 'handlebar', how: 'Operated by the lever on the right handlebar.' },
      { to: 'suspension', how: 'Braking compresses the front forks as weight shifts forward (“dive”).' },
      { to: 'rear-brake', how: 'Use both together for the shortest, most stable stops. Some motorcycles link them (combined braking).' },
      { to: 'lights', how: 'A switch at the lever turns on the brake light.' },
    ],
    internals: [
      { name: 'Lever', role: 'Multiplies your hand’s force and pushes the master cylinder piston.' },
      { name: 'Master cylinder & reservoir', role: 'Turns lever movement into fluid pressure; the reservoir keeps it topped up.' },
      { name: 'Brake hose', role: 'Carries the pressurised fluid to the caliper.' },
      { name: 'Caliper & pistons', role: 'Converts fluid pressure back into force on the pads.' },
      { name: 'Brake pads', role: 'Friction blocks pressed against the disc; they wear and need replacing.' },
      { name: 'Disc', role: 'Steel rotor that turns with the wheel; holes help it shed heat and water.' },
    ],
    callout: {
      tone: 'tip',
      text: 'Apply the front brake progressively: gently at first so weight settles onto the front tyre, then firmer. Never grab it.',
    },
  },

  'rear-brake': {
    purpose: 'Slows the rear wheel, steadies the motorcycle when braking, and gives fine speed control at walking pace.',
    howItWorks: [
      'Pressing the pedal with your right foot operates the rear brake. A disc system works like the front: master cylinder, hose, caliper and pads clamping a disc on the rear wheel.',
      'Many small motorcycles use a drum brake instead: a rod or cable turns a cam that pushes curved brake shoes outwards against the inside of a drum in the wheel hub.',
      'Under braking, weight moves off the rear wheel, so it has less grip and locks more easily than the front. It contributes the smaller share of the stopping force.',
      'At low speed — in traffic or making a U-turn — light rear brake pressure steadies the motorcycle without making the front suspension dive.',
    ],
    connections: [
      { to: 'wheels', how: 'The disc or drum is part of the rear wheel.' },
      { to: 'footpegs', how: 'The pedal sits in front of the right footpeg.' },
      { to: 'front-brake', how: 'Used together with the front brake. Combined braking systems apply some front brake when you press the pedal.' },
      { to: 'lights', how: 'A switch on the pedal turns on the brake light.' },
    ],
    internals: [
      { name: 'Brake pedal', role: 'Lever operated by the right foot.' },
      { name: 'Master cylinder or rod', role: 'Hydraulic on disc brakes; a rod or cable on drum brakes.' },
      { name: 'Caliper & pads', role: 'Clamp the rear disc (disc brakes).' },
      { name: 'Drum & shoes', role: 'Shoes press outwards inside the hub (drum brakes).' },
      { name: 'Brake-light switch', role: 'Lights the brake light when the pedal is pressed.' },
    ],
    callout: {
      tone: 'mistake',
      text: 'Stamping on the rear brake in an emergency. With weight thrown forward, the rear wheel locks and skids easily.',
    },
  },

  chain: {
    purpose: 'Carries power from the gearbox to the rear wheel — the final drive.',
    howItWorks: [
      'The front sprocket on the gearbox countershaft is small; the rear sprocket on the wheel is large. The front sprocket pulls the upper run of the chain forward, which turns the rear sprocket and the wheel.',
      'Both sprockets have the same tooth spacing, so the ratio of their tooth counts is the final drive ratio. A 15-tooth front and 45-tooth rear give 3 : 1 — the rear wheel turns once for every three turns of the front sprocket, with about three times the torque.',
      'The final drive multiplies with the gearbox and primary ratios: overall reduction = primary × gear × final drive.',
      'The swingarm moves up and down with the suspension, changing the distance between the sprockets slightly, so the chain is set with some slack.',
    ],
    connections: [
      { to: 'gearbox', how: 'Driven by the countershaft through the front sprocket.' },
      { to: 'wheels', how: 'The rear sprocket is bolted to the rear wheel hub.' },
      { to: 'suspension', how: 'Runs alongside the swingarm; its slack allows for suspension movement.' },
    ],
    internals: [
      { name: 'Front sprocket', role: 'Small sprocket on the gearbox output shaft.' },
      { name: 'Rear sprocket', role: 'Large sprocket bolted to the rear wheel hub.' },
      { name: 'Rollers, pins & plates', role: 'Each link’s roller turns on a pin as it meets the teeth, reducing wear.' },
      { name: 'O-ring seals', role: 'On sealed chains, keep grease inside each pin and dirt out.' },
      { name: 'Adjusters', role: 'At the rear axle; set the chain slack and keep the wheel aligned.' },
    ],
    callout: {
      tone: 'safety',
      text: 'Never inspect or lubricate the chain with the engine running in gear. The chain and sprockets can trap fingers and clothing instantly.',
    },
  },

  wheels: {
    purpose: 'Support the motorcycle and provide its only contact with the road.',
    howItWorks: [
      'Each tyre touches the road in a contact patch roughly the size of your palm. Every force — driving, braking and cornering — passes through those two patches.',
      'Motorcycle tyres have a rounded profile. When the motorcycle leans into a turn, the patch moves from the centre of the tread towards the edge, keeping a similar footprint at lean.',
      'The tread grooves channel water out from under the tyre on wet roads. Rubber compound and pressure determine grip: under-inflated tyres overheat and steer heavily; over-inflated ones have a smaller patch.',
      'Spinning wheels behave like gyroscopes, which helps keep the motorcycle stable as speed rises.',
    ],
    connections: [
      { to: 'front-brake', how: 'The front disc is bolted to the front hub.' },
      { to: 'rear-brake', how: 'The rear disc or drum is part of the rear hub.' },
      { to: 'chain', how: 'The rear sprocket is bolted to the rear hub.' },
      { to: 'suspension', how: 'The forks (front) and swingarm (rear) hold each wheel and let it follow the road.' },
    ],
    internals: [
      { name: 'Tread', role: 'The rubber that touches the road; its grooves clear water.' },
      { name: 'Carcass', role: 'Layers of fabric cords that give the tyre its strength and shape.' },
      { name: 'Bead', role: 'Steel wire hoop that seals the tyre onto the rim.' },
      { name: 'Rim', role: 'The outer part of the wheel that holds the tyre.' },
      { name: 'Hub & bearings', role: 'The centre of the wheel, turning on bearings around the axle.' },
      { name: 'Valve', role: 'For checking and adjusting the air pressure.' },
    ],
    callout: {
      tone: 'tip',
      text: 'Check tyre pressures with the tyres cold, using the figures in the owner’s manual or on the motorcycle’s tyre-pressure label.',
    },
  },

  suspension: {
    purpose: 'Keeps the tyres pressed onto the road over bumps, and keeps the motorcycle stable and comfortable.',
    howItWorks: [
      'At the front, telescopic forks hold the wheel. In each fork leg a stanchion (inner tube) slides inside a slider (outer tube), with a spring inside.',
      'At the rear, the swingarm pivots on the frame and carries the wheel; one or two shock absorbers connect it to the frame.',
      'The spring holds up the weight of the motorcycle and rider and absorbs a bump’s energy. On its own a spring would keep bouncing, so a damper forces oil through small holes, slowing the movement and turning the energy into heat.',
      'Suspension also reacts to your inputs: braking compresses the forks (“dive”) and accelerating compresses the rear (“squat”).',
    ],
    connections: [
      { to: 'wheels', how: 'Holds each wheel and lets it move up and down independently of the body.' },
      { to: 'frame', how: 'The forks turn in the steering head; the swingarm pivots on the frame.' },
      { to: 'front-brake', how: 'Hard braking compresses the forks.' },
      { to: 'chain', how: 'The chain runs along the swingarm.' },
    ],
    internals: [
      { name: 'Stanchions & sliders', role: 'The telescoping inner and outer fork tubes.' },
      { name: 'Fork springs', role: 'Support the front of the motorcycle and absorb bumps.' },
      { name: 'Damper rod & fork oil', role: 'Oil forced through small holes controls the speed of fork movement.' },
      { name: 'Fork seals', role: 'Keep oil in and dirt out where the stanchion enters the slider.' },
      { name: 'Swingarm', role: 'Pivoting arm that holds the rear wheel.' },
      { name: 'Rear shock absorbers', role: 'A coil spring around a damper; spring preload can often be adjusted for a passenger or luggage.' },
    ],
    callout: {
      tone: 'tip',
      text: 'Carrying a passenger or heavy luggage? Increase the rear spring preload as the owner’s manual recommends.',
    },
  },

  exhaust: {
    purpose: 'Carries hot burnt gas safely away from the engine, quietens it and cleans it.',
    howItWorks: [
      'When the exhaust valve opens, high-pressure gas rushes out of the cylinder into the header pipe.',
      'On modern motorcycles a catalytic converter — a ceramic or metal honeycomb coated with precious metals — converts carbon monoxide, unburnt fuel and nitrogen oxides into less harmful gases.',
      'The silencer then reduces the noise: perforated tubes, chambers and sound-absorbing packing break up and absorb the pressure pulses.',
      'The exhaust is matched to the engine, so removing or modifying parts of it changes how the engine runs — and is often illegal.',
    ],
    connections: [
      { to: 'engine', how: 'Bolted to the exhaust port on the cylinder head.' },
      { to: 'frame', how: 'Held on the frame with mounts that allow for vibration and heat expansion.' },
      { to: 'footpegs', how: 'Heat shields protect the rider’s and passenger’s legs near the footpegs.' },
    ],
    internals: [
      { name: 'Header pipe', role: 'Carries gas from the exhaust port.' },
      { name: 'Catalytic converter', role: 'Chemically cleans the exhaust gas.' },
      { name: 'Oxygen sensor', role: 'On fuel-injected motorcycles, measures oxygen in the exhaust so the engine computer can fine-tune the fuel mixture.' },
      { name: 'Silencer', role: 'Reduces noise with chambers, perforated tubes and packing.' },
      { name: 'Heat shield', role: 'Keeps legs and luggage away from the hottest parts.' },
    ],
    callout: {
      tone: 'safety',
      text: 'Exhaust pipes get hot enough to burn skin instantly and stay hot long after the engine stops. Keep legs clear when mounting, dismounting and parking.',
    },
  },

  'fuel-tank': {
    purpose: 'Stores the petrol the engine burns, and gives your knees something to grip.',
    howItWorks: [
      'Fuel leaves the bottom of the tank through a fuel tap (petcock) on carburettor motorcycles, or is pressurised by an electric pump for the injector on fuel-injected ones.',
      'Many carburettor motorcycles have a tap with ON, RESERVE and OFF positions. RESERVE draws from a lower outlet, giving you the last litre or so when the main supply runs out.',
      'A vent in the filler cap lets air in as fuel is used, so a vacuum doesn’t form and starve the engine.',
    ],
    connections: [
      { to: 'engine', how: 'Supplies fuel to the carburettor or injector.' },
      { to: 'frame', how: 'Sits over the frame’s main tube.' },
      { to: 'instruments', how: 'A level sender in the tank drives the fuel gauge or low-fuel light.' },
    ],
    internals: [
      { name: 'Filler cap & vent', role: 'Seals the tank while letting air in.' },
      { name: 'Fuel tap or pump', role: 'Controls or pressurises the flow of fuel to the engine.' },
      { name: 'Fuel filter', role: 'Stops dirt reaching the carburettor or injector.' },
      { name: 'Level sender', role: 'Measures how much fuel is left.' },
    ],
    callout: {
      tone: 'tip',
      text: 'Grip the tank lightly with your knees. It lets your arms stay relaxed for steering.',
    },
  },

  frame: {
    purpose: 'The motorcycle’s skeleton: it holds the engine, steering, suspension and rider in the right positions relative to each other.',
    howItWorks: [
      'At the front, the steering head holds the forks on bearings so the front wheel can steer. Its angle (rake) produces trail, which helps the motorcycle hold a straight, stable line.',
      'The main tubes run back from the steering head over or around the engine to the swingarm pivot, carrying loads between the front and rear wheels.',
      'A lighter subframe at the back supports the seat, rider, passenger and tail.',
      'Many small motorcycles use a “diamond” frame, where the engine itself is a stressed member that completes the structure.',
    ],
    connections: [
      { to: 'suspension', how: 'The forks turn in the steering head; the swingarm pivots on the frame.' },
      { to: 'engine', how: 'Bolted in at several mounts, often as a load-bearing member.' },
      { to: 'fuel-tank', how: 'Mounted over the main tube.' },
      { to: 'bodywork', how: 'The seat and panels mount on the subframe.' },
    ],
    internals: [
      { name: 'Steering head & bearings', role: 'Lets the forks and handlebar turn smoothly.' },
      { name: 'Main tubes', role: 'Connect the steering head to the swingarm pivot.' },
      { name: 'Engine mounts', role: 'Hold the engine in place.' },
      { name: 'Swingarm pivot', role: 'The axis the rear suspension swings around.' },
      { name: 'Subframe', role: 'Supports the seat and tail section.' },
    ],
  },

  handlebar: {
    purpose: 'Steers the front wheel and carries the hand controls, switches and mirrors.',
    howItWorks: [
      'Turning the handlebar rotates the forks in the steering head. At walking pace you steer by turning the bar towards where you want to go.',
      'Above walking pace a motorcycle turns by leaning, and the lean is started by a brief push on the handlebar — push right to go right. This is countersteering, covered in Turning & Handling.',
      'Left hand: clutch lever, and switches for the indicators, horn and headlight beam. Right hand: throttle and front brake lever, and usually the starter button and engine kill switch.',
      'Mirrors on each side show traffic behind; adjust them before every ride.',
    ],
    connections: [
      { to: 'throttle', how: 'The twist grip on the right end.' },
      { to: 'clutch', how: 'The lever on the left.' },
      { to: 'front-brake', how: 'The lever on the right.' },
      { to: 'suspension', how: 'Clamped to the top of the forks.' },
      { to: 'lights', how: 'Switches for the headlight beam and indicators.' },
    ],
    internals: [
      { name: 'Bar & clamps', role: 'Fix the handlebar to the top of the forks.' },
      { name: 'Grips', role: 'Rubber grips; the right one turns to work the throttle.' },
      { name: 'Levers', role: 'Clutch on the left, front brake on the right.' },
      { name: 'Switchgear', role: 'Indicators, horn, lights, starter and kill switch.' },
      { name: 'Mirrors', role: 'Show traffic behind you.' },
    ],
    callout: {
      tone: 'tip',
      text: 'Hold the grips lightly. A relaxed grip lets the motorcycle steer and stabilise itself; stiff arms fight it.',
    },
  },

  instruments: {
    purpose: 'Show speed, engine RPM and the motorcycle’s status at a glance.',
    howItWorks: [
      'The speedometer shows road speed, measured from a wheel or the gearbox output. The tachometer (rev counter) shows engine speed in RPM; the red zone marks the maximum safe engine speed.',
      'Warning lights include neutral (a green N), indicators, high beam, oil pressure and, on fuel-injected motorcycles, an engine warning light. A fuel gauge or low-fuel light reads the sender in the tank.',
      'Many motorcycles also show the selected gear, a trip meter and an odometer.',
    ],
    connections: [
      { to: 'gearbox', how: 'The neutral switch lights the neutral light (and drives the gear indicator, if fitted).' },
      { to: 'engine', how: 'The tachometer reads engine speed.' },
      { to: 'fuel-tank', how: 'The fuel gauge reads the level sender.' },
      { to: 'lights', how: 'Shows indicator and high-beam warning lights.' },
    ],
    internals: [
      { name: 'Speedometer', role: 'Road speed.' },
      { name: 'Tachometer', role: 'Engine RPM, with a red zone.' },
      { name: 'Warning lights', role: 'Neutral, indicators, high beam, oil, engine.' },
      { name: 'Fuel gauge', role: 'Fuel remaining.' },
      { name: 'Odometer & trip', role: 'Total and trip distance.' },
    ],
    callout: {
      tone: 'safety',
      text: 'After switching on the ignition, check that the green neutral light is on before pressing the starter.',
    },
  },

  footpegs: {
    purpose: 'Support the rider’s feet and place them next to the foot controls.',
    howItWorks: [
      'The footpegs carry much of the rider’s weight. Pressing on them helps keep the motorcycle stable at low speed and over rough surfaces.',
      'The gear lever is just in front of the left footpeg and the rear brake pedal just in front of the right. Ride with the balls of your feet on the pegs, so your toes are close to the controls without resting on them.',
      'Many pegs fold upwards if they touch the ground when leaning, and have rubber covers to reduce vibration.',
      'Separate pillion footpegs, further back, are for a passenger.',
    ],
    connections: [
      { to: 'gearbox', how: 'The gear lever sits in front of the left peg.' },
      { to: 'rear-brake', how: 'The brake pedal sits in front of the right peg.' },
      { to: 'frame', how: 'Mounted to the frame on brackets.' },
    ],
    internals: [
      { name: 'Peg', role: 'Metal peg with a rubber cover.' },
      { name: 'Hinge & spring', role: 'Lets the peg fold up and spring back.' },
      { name: 'Bracket', role: 'Attaches the peg to the frame.' },
      { name: 'Pillion pegs', role: 'Footrests for a passenger.' },
    ],
    callout: {
      tone: 'mistake',
      text: 'Riding with your toes hanging over the gear lever or brake pedal — you can change gear or drag the rear brake without meaning to.',
    },
  },

  lights: {
    purpose: 'Let you see the road and, just as importantly, let others see you.',
    howItWorks: [
      'The headlight has a low (dipped) beam for normal use and a high beam for dark roads with no oncoming traffic. Many modern motorcycles keep the headlight on whenever the engine runs.',
      'The tail light glows when the lights are on; the brake light brightens whenever either brake is applied.',
      'Indicators at the front and rear show which way you intend to turn. On most motorcycles they don’t cancel automatically — you must switch them off.',
      'Power comes from the battery, which the engine’s generator recharges as it runs.',
    ],
    connections: [
      { to: 'handlebar', how: 'Headlight, beam and indicator switches.' },
      { to: 'front-brake', how: 'The lever’s switch turns on the brake light.' },
      { to: 'rear-brake', how: 'The pedal’s switch turns on the brake light.' },
      { to: 'instruments', how: 'Indicator and high-beam warning lights.' },
      { to: 'engine', how: 'The generator charges the battery that powers the lights.' },
    ],
    internals: [
      { name: 'Headlight', role: 'Low and high beam.' },
      { name: 'Tail & brake light', role: 'Visible from behind; brightens when braking.' },
      { name: 'Indicators', role: 'Show which way you intend to turn.' },
      { name: 'Battery & charging system', role: 'Store and supply electrical power.' },
    ],
    callout: {
      tone: 'mistake',
      text: 'Forgetting to cancel an indicator after a turn. Other road users may pull out, expecting you to turn.',
    },
  },

  'side-stand': {
    purpose: 'Holds the motorcycle upright when parked.',
    howItWorks: [
      'The stand swings down on the left side and the motorcycle leans onto it. A spring holds it firmly in the up or down position.',
      'Many motorcycles have a side-stand switch that stops the engine running in gear while the stand is down, so you can’t ride off with it extended.',
      'Some motorcycles also have a centre stand, which lifts the rear wheel off the ground for maintenance.',
      'Park on firm, level ground. On soft ground or hot tarmac the stand can sink.',
    ],
    connections: [
      { to: 'frame', how: 'Pivots on a bracket on the frame.' },
      { to: 'engine', how: 'The side-stand switch can cut the ignition when a gear is selected.' },
      { to: 'footpegs', how: 'Usually found just below and behind the left footpeg.' },
    ],
    internals: [
      { name: 'Leg & foot', role: 'Rests on the ground when the stand is down.' },
      { name: 'Pivot & spring', role: 'Hold the stand up or down.' },
      { name: 'Side-stand switch', role: 'Safety switch linked to the ignition.' },
    ],
    callout: {
      tone: 'safety',
      text: 'Always check the side stand is fully up before riding away. A stand that touches the road in a left turn can tip the motorcycle over.',
    },
  },

  bodywork: {
    purpose: 'Seats the rider and passenger, covers the electrics and keeps road spray off everyone.',
    howItWorks: [
      'The seat supports and cushions the rider; its height and width decide how easily your feet reach the ground.',
      'The mudguards stop the tyres throwing water, mud and stones at the rider, the engine and other road users.',
      'Side panels cover the battery, air filter and electrics; the tail section carries the tail light and the number plate.',
    ],
    connections: [
      { to: 'frame', how: 'Mounted on the subframe.' },
      { to: 'lights', how: 'The tail section carries the tail light.' },
      { to: 'fuel-tank', how: 'The seat sits directly behind the tank.' },
    ],
    internals: [
      { name: 'Seat', role: 'Rider and passenger seating.' },
      { name: 'Side panels', role: 'Cover the battery, air filter and wiring.' },
      { name: 'Mudguards', role: 'Catch water and debris thrown up by the tyres.' },
      { name: 'Tail section & plate', role: 'Holds the tail light and number plate.' },
    ],
    callout: {
      tone: 'tip',
      text: 'Under the seat or side panels you’ll usually find the battery, fuses, toolkit and the owner’s manual.',
    },
  },
}
