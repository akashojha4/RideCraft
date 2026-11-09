import type { Lesson } from '../types'

/**
 * Module 2 — Pre-Ride Preparation (Phase 4). Twelve lessons, ending with the
 * interactive pre-ride checklist. Lesson ids are referenced by content/checklist.ts.
 * Figures that vary between motorcycles (pressures, chain slack, pad limits) are given
 * as typical examples with a pointer to the owner’s manual.
 */
export const preRideLessons: Lesson[] = [
  // 1 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'riding-posture',
    title: 'Riding posture',
    summary: 'How to sit on a motorcycle so it is easy to control — and you stay comfortable.',
    durationMinutes: 6,
    objectives: [
      'Describe a good riding posture from head to toe',
      'Explain why relaxed arms and knee grip improve control',
      'Recognise and correct common posture mistakes',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'Let the legs hold you, so the arms can steer',
        body: [
          'A motorcycle steers through the handlebar, so anything that stiffens your arms makes it harder to control. Good posture puts your weight on the seat and footpegs, with your knees lightly gripping the tank — leaving your arms relaxed and free to steer.',
          'Sit tall, leaning slightly forward from the hips. Keep your head up and your eyes looking well ahead, where you want to go: the motorcycle tends to follow your eyes.',
        ],
      },
      { type: 'illustration', illustration: 'posture-check', caption: 'The rider starts with every point wrong. Correct each one and read why it matters.' },
      {
        type: 'steps',
        heading: 'Head to toe',
        steps: [
          { title: 'Head and eyes', body: 'Head up, eyes level and looking far ahead, not at the front wheel.' },
          { title: 'Back', body: 'Tall, with a slight forward lean from the hips — not slumped onto your wrists.' },
          { title: 'Arms and hands', body: 'Elbows slightly bent and loose; wrists level, with a light grip on the bars.' },
          { title: 'Knees', body: 'Lightly gripping the tank, which steadies your body.' },
          { title: 'Feet', body: 'Balls of the feet on the pegs, toes pointing forward and close to — not resting on — the controls.' },
        ],
      },
      {
        type: 'example',
        body: [
          'After an hour in traffic, a new rider’s wrists ache. They have been leaning their weight on the handlebar. Gripping the tank with their knees and sitting taller takes the load off their hands — and the motorcycle immediately feels lighter to steer.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        body: 'Check your posture at every stop: elbows loose, knees in, eyes up. It soon becomes a habit.',
      },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'Where should most of your weight be supported?',
        options: [
          { id: 'a', label: 'On the handlebar, so your arms can feel what the front tyre is doing at all times' },
          { id: 'b', label: 'On the seat and footpegs, with the knees gripping the tank' },
          { id: 'c', label: 'On your arms, locked straight' },
        ],
        correctOptionId: 'b',
        explanation: 'Supporting your body with your legs leaves your arms relaxed, so they can steer smoothly.',
      },
      {
        id: 'q2',
        prompt: 'Why should you look well ahead rather than at the front wheel?',
        options: [
          { id: 'a', label: 'It looks more confident' },
          { id: 'b', label: 'You see hazards earlier, and the motorcycle tends to go where you look' },
          { id: 'c', label: 'Looking down at the front wheel is fine at low speed, but it makes your neck ache on long rides' },
        ],
        correctOptionId: 'b',
        explanation: 'Looking ahead gives you time to react, and riders naturally steer towards where they are looking.',
      },
      {
        id: 'q3',
        prompt: 'Where should your feet be on the pegs?',
        options: [
          { id: 'a', label: 'Toes on the pegs, heels hanging down' },
          { id: 'b', label: 'Balls of the feet on the pegs, toes pointing forward' },
          { id: 'c', label: 'Insteps on the pegs with the toes hanging down, ready to reach the pedals quickly' },
        ],
        correctOptionId: 'b',
        explanation: 'This keeps your toes close to the gear lever and brake pedal without catching them or the road.',
      },
    ],
  },

  // 2 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'protective-equipment',
    title: 'Protective equipment',
    summary: 'What to wear on every ride, and what each item protects.',
    durationMinutes: 6,
    objectives: [
      'List the essential protective equipment for riding',
      'Explain what each item protects against',
      'Know what to look for when choosing gear',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'Dress for the slide, not the ride',
        body: [
          'A rider has no metal shell around them. In a fall, the two dangers are impact — hitting the road or an object — and abrasion, sliding along the surface. Riding gear is designed for both: tough outer materials resist abrasion, and armour at the joints spreads and absorbs impacts.',
          'Ordinary clothing gives almost no protection: denim and cotton can wear through in a fraction of a second on tarmac.',
        ],
      },
      { type: 'illustration', illustration: 'protective-gear', caption: 'Add each item to the rider. Everything except high-visibility clothing is essential.' },
      {
        type: 'terms',
        heading: 'Key terms',
        items: [
          { term: 'Armour', definition: 'Impact-absorbing pads at the shoulders, elbows, back, hips and knees — look for a certification label.' },
          { term: 'Abrasion resistance', definition: 'How long a material survives sliding on the road. Leather and riding textiles are designed for it.' },
          { term: 'ATGATT', definition: '“All the gear, all the time” — the habit of wearing full gear on every ride, however short.' },
        ],
      },
      {
        type: 'example',
        body: [
          'Many crashes happen at low speed on short, familiar trips — a car pulling out at a junction near home. A rider in gloves and a jacket walks away with bruises; the same fall in a T-shirt means painful skin injuries. Gear only works if you wear it every time.',
        ],
      },
      {
        type: 'callout',
        tone: 'safety',
        body: 'Never ride without gloves and proper footwear: your hands and feet are the first things to hit the ground in a fall.',
      },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'What are the two main dangers that riding gear protects against?',
        options: [
          { id: 'a', label: 'Rain and cold' },
          { id: 'b', label: 'Impact and abrasion' },
          { id: 'c', label: 'Noise and wind' },
        ],
        correctOptionId: 'b',
        explanation: 'Armour absorbs impacts, and tough materials resist abrasion as you slide along the road.',
      },
      {
        id: 'q2',
        prompt: 'Why aren’t ordinary jeans enough?',
        options: [
          { id: 'a', label: 'They are too warm' },
          { id: 'b', label: 'Denim wears through very quickly when sliding on tarmac' },
          { id: 'c', label: 'They are fine for short trips in town, where speeds are too low to cause a slide' },
        ],
        correctOptionId: 'b',
        explanation: 'Normal denim has little abrasion resistance and no armour, so it offers almost no protection in a slide.',
      },
      {
        id: 'q3',
        prompt: 'Which item is recommended but not essential protection?',
        options: [
          { id: 'a', label: 'Gloves' },
          { id: 'b', label: 'Boots' },
          { id: 'c', label: 'High-visibility clothing' },
        ],
        correctOptionId: 'c',
        explanation: 'Hi-vis doesn’t protect you in a crash, but it helps others see you and so can prevent one.',
      },
    ],
  },

  // 3 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'helmet',
    title: 'The helmet',
    summary: 'How a helmet protects you, which type to choose, and how it should fit.',
    durationMinutes: 6,
    objectives: [
      'Explain how the layers of a helmet protect your head',
      'Compare full-face, modular and open-face helmets',
      'Check that a helmet fits and is worn correctly',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'How a helmet works',
        body: [
          'In an impact, your head must slow down over as long a distance as possible. The hard outer shell spreads the blow, and the expanded polystyrene (EPS) liner crushes, slowing your head more gently. That crushing is what protects your brain — and the foam doesn’t recover afterwards.',
          'A helmet only works if it stays on, so the chin strap must be fastened snugly every time.',
        ],
      },
      { type: 'illustration', illustration: 'helmet', caption: 'Explore the layers and helmet types, then simulate an impact.' },
      {
        type: 'steps',
        heading: 'Fit check',
        steps: [
          { title: 'Snug all round', body: 'Firm cheek pads, no pressure points, and no gap at the brow.' },
          { title: 'Doesn’t move', body: 'Try to rotate the helmet: your skin should move with it.' },
          { title: 'Can’t roll off', body: 'With the strap fastened, it shouldn’t roll forward off your head when pushed up from the back.' },
          { title: 'Strap snug', body: 'One or two fingers fit between strap and chin — no more.' },
        ],
      },
      {
        type: 'example',
        body: [
          'A rider drops their helmet from the seat onto concrete. There’s only a scuff on the shell — but the EPS underneath may be crushed where it hit. Many manufacturers recommend replacing a helmet after any significant impact, and after about five years of use as materials age.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        body: 'Choose a full-face helmet if you can: a large share of crash impacts land on the chin area, which an open-face helmet doesn’t protect.',
      },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'Which part of a helmet does most of the work of absorbing an impact?',
        options: [
          { id: 'a', label: 'The comfort padding' },
          { id: 'b', label: 'The EPS foam liner' },
          { id: 'c', label: 'The visor' },
        ],
        correctOptionId: 'b',
        explanation: 'The EPS liner crushes to slow your head gently. The shell spreads the impact; the padding is for fit.',
      },
      {
        id: 'q2',
        prompt: 'After a hard impact, the helmet looks undamaged. What should you do?',
        options: [
          { id: 'a', label: 'Keep using it — the shell is fine' },
          { id: 'b', label: 'Replace it — the EPS may be crushed and won’t protect you again' },
          { id: 'c', label: 'Replace only the visor and padding, since the hard shell has taken the impact and is unmarked' },
        ],
        correctOptionId: 'b',
        explanation: 'EPS foam doesn’t spring back. Damage can be hidden under an intact shell.',
      },
      {
        id: 'q3',
        prompt: 'What does a full-face helmet protect that an open-face helmet doesn’t?',
        options: [
          { id: 'a', label: 'The back of the head' },
          { id: 'b', label: 'The chin and face' },
          { id: 'c', label: 'The top of the head' },
        ],
        correctOptionId: 'b',
        explanation: 'The integral chin bar protects your face and jaw, which are often struck in a crash.',
      },
    ],
  },

  // 4 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'mirrors',
    title: 'Mirrors and blind spots',
    summary: 'Setting your mirrors, and why you still need to look over your shoulder.',
    durationMinutes: 6,
    objectives: [
      'Adjust mirrors to show as much of the road behind as possible',
      'Explain where the blind spots are',
      'Know when to make a shoulder check',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'What mirrors can and can’t show',
        body: [
          'Mirrors show the road behind and to the sides. Set them while sitting in your normal riding position: you should see the road behind with just a sliver of your own arm or shoulder at the inner edge. Aimed too far in, they mostly show you.',
          'Even well-set mirrors leave gaps. Between what the mirror shows and what you can see from the corner of your eye there is a blind spot on each side — just behind you, in the next lane.',
        ],
      },
      { type: 'illustration', illustration: 'mirror-blind-spots', caption: 'Aim the mirrors, then drive the car up alongside. Find where it disappears.' },
      {
        type: 'keyPoints',
        heading: 'Using mirrors well',
        points: [
          'Check them before you slow down, stop, turn or change position.',
          'Before moving across, look quickly over your shoulder into the blind spot — the “lifesaver” check.',
          'Glance, don’t stare: your eyes belong mostly on the road ahead.',
        ],
      },
      {
        type: 'example',
        body: [
          'Preparing to change lanes on a multi-lane road, a rider checks the mirror: clear. A quick look over the right shoulder reveals a car sitting just behind and beside them — invisible in the mirror. They wait for it to pass, then move across.',
        ],
      },
      {
        type: 'callout',
        tone: 'mistake',
        body: 'Relying on mirrors alone. Always make a shoulder check before changing lanes or turning across traffic.',
      },
      { type: 'explore', part: 'handlebar', text: 'See where the mirrors mount on the handlebar.' },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'How should your mirrors be set?',
        options: [
          { id: 'a', label: 'So they mostly show your shoulders' },
          { id: 'b', label: 'To show the road behind, with just a sliver of your arm or shoulder' },
          { id: 'c', label: 'Pointing down at the road just behind your rear wheel, so you can see anything close to you' },
        ],
        correctOptionId: 'b',
        explanation: 'A small reference of your own arm helps orientation; the rest of the mirror should show road.',
      },
      {
        id: 'q2',
        prompt: 'Where is a typical blind spot?',
        options: [
          { id: 'a', label: 'Directly ahead' },
          { id: 'b', label: 'Just behind you in the next lane' },
          { id: 'c', label: 'Directly behind you, far away down the road, where the mirrors run out of view' },
        ],
        correctOptionId: 'b',
        explanation: 'A vehicle just behind and beside you is too far forward for the mirror and too far back for your side vision.',
      },
      {
        id: 'q3',
        prompt: 'When should you look over your shoulder?',
        options: [
          { id: 'a', label: 'Never — it is dangerous to look away' },
          { id: 'b', label: 'Before changing lanes or turning, after checking the mirrors' },
          { id: 'c', label: 'Only on motorways and dual carriageways, where traffic in the next lane moves fast' },
        ],
        correctOptionId: 'b',
        explanation: 'A quick shoulder check covers the blind spot that mirrors can’t show.',
      },
    ],
  },

  // 5 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'tyre-inspection',
    title: 'Tyre inspection',
    summary: 'Pressure, tread and damage: the checks that keep your two contact patches safe.',
    durationMinutes: 7,
    objectives: [
      'Check tyre pressure correctly',
      'Judge tread depth using the wear indicators',
      'Spot tyre damage that means you shouldn’t ride',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'Two palm-sized patches',
        body: [
          'Everything a motorcycle does passes through two contact patches roughly the size of your palm. Their size and grip depend on the tyre’s pressure, tread and condition — which is why tyres are the first thing to check.',
          'Check pressure with a gauge when the tyres are cold, using the figures in your owner’s manual or on the motorcycle’s label. Riding warms the tyres and raises the reading.',
        ],
      },
      { type: 'illustration', illustration: 'tyre-check', caption: 'Change the tread depth and the pressure. Watch the groove and the contact patch.' },
      {
        type: 'steps',
        heading: 'The tyre check',
        steps: [
          { title: 'Pressure', body: 'Gauge on the valve, both tyres, cold. Adjust to the recommended figure.' },
          { title: 'Tread', body: 'Look at the depth across the tyre, especially the centre. Find the wear indicator bars in the grooves.' },
          { title: 'Damage', body: 'Turn the wheel slowly and look for cuts, bulges, cracks and embedded nails or glass.' },
          { title: 'Wheels', body: 'Check the rims for dents and, on spoked wheels, for loose spokes.' },
        ],
      },
      {
        type: 'example',
        body: [
          'A rider notices the motorcycle feels heavy to steer and slow to turn. The rear tyre has lost 8 psi through a slow puncture. Flexing more, it has also been running hot. Inflating it — and finding the nail — restores the handling.',
        ],
      },
      {
        type: 'callout',
        tone: 'safety',
        body: 'Never ride on a tyre with a bulge, a deep cut or tread worn to the indicators. Have it replaced.',
      },
      { type: 'explore', part: 'wheels', text: 'See how a tyre is built, and how its contact patch moves when leaning.' },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'When should you check tyre pressure?',
        options: [
          { id: 'a', label: 'Right after a long ride, when the tyres are warm and give their true working pressure' },
          { id: 'b', label: 'When the tyres are cold, before riding' },
          { id: 'c', label: 'Only when a tyre looks flat' },
        ],
        correctOptionId: 'b',
        explanation: 'Recommended pressures are cold figures; warm tyres read higher.',
      },
      {
        id: 'q2',
        prompt: 'What happens when a tyre is under-inflated?',
        options: [
          { id: 'a', label: 'It grips better in every situation, because a bigger contact patch puts more rubber on the road' },
          { id: 'b', label: 'It flexes, overheats and makes the steering heavy' },
          { id: 'c', label: 'Nothing noticeable' },
        ],
        correctOptionId: 'b',
        explanation: 'The sidewall flexes more, building heat and making the motorcycle steer heavily and less precisely.',
      },
      {
        id: 'q3',
        prompt: 'The tread is level with the wear indicator bars. What should you do?',
        options: [
          { id: 'a', label: 'Ride carefully until it gets worse' },
          { id: 'b', label: 'Replace the tyre before riding' },
          { id: 'c', label: 'Increase the pressure' },
        ],
        correctOptionId: 'b',
        explanation: 'At the indicators the tyre has reached its limit — it has little wet grip and is likely below the legal minimum.',
      },
    ],
  },

  // 6 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'brake-inspection',
    title: 'Brake inspection',
    summary: 'Lever feel, pads and fluid — making sure the brakes will work when you need them.',
    durationMinutes: 6,
    objectives: [
      'Check the feel of the brake lever and pedal',
      'Judge brake pad wear',
      'Read the brake fluid level and condition',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'Three quick checks',
        body: [
          'Brakes rarely fail without warning. A spongy lever, thin pads or a falling fluid level are signs to act on before they become a problem on the road.',
          'Squeeze the front lever and press the rear pedal: they should feel firm and stop well short of their limit. Look at the pads through the caliper, and at the fluid through the reservoir windows.',
        ],
      },
      { type: 'illustration', illustration: 'brake-check', caption: 'Work through the three stations: pads, fluid and lever feel.' },
      {
        type: 'terms',
        heading: 'Key terms',
        items: [
          { term: 'Spongy brakes', definition: 'A soft lever that travels too far, usually caused by air in the fluid.' },
          { term: 'Wear groove', definition: 'A slot in the pad material; when it has worn away, the pad is near its limit.' },
          { term: 'Brake fluid', definition: 'The hydraulic fluid. It absorbs water over time, so it is replaced periodically (often every two years).' },
        ],
      },
      {
        type: 'example',
        body: [
          'Checking the reservoir, a rider sees the fluid has dropped close to MIN. It has fallen slowly over months as the pads wore — and the pads are now nearly at their wear groove. New pads are fitted before the next ride.',
        ],
      },
      {
        type: 'callout',
        tone: 'safety',
        body: 'Never top up brake fluid to “fix” a low level without finding out why it dropped — worn pads or a leak must be dealt with.',
      },
      { type: 'explore', part: 'front-brake', text: 'See how the lever, master cylinder, caliper and pads work together.' },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'The brake lever feels soft and travels much further than usual. What is the likely cause?',
        options: [
          { id: 'a', label: 'New brake pads' },
          { id: 'b', label: 'Air in the brake fluid' },
          { id: 'c', label: 'Cold weather' },
        ],
        correctOptionId: 'b',
        explanation: 'Air compresses, unlike fluid, so the lever travels further before the pads clamp. The brakes must be bled before riding.',
      },
      {
        id: 'q2',
        prompt: 'The brake fluid is below the MIN mark. What should you do?',
        options: [
          { id: 'a', label: 'Top it up to MAX and ride — the level always drops a little in normal use' },
          { id: 'b', label: 'Don’t ride — have the pads and system checked for wear or leaks' },
          { id: 'c', label: 'Fill it with engine oil' },
        ],
        correctOptionId: 'b',
        explanation: 'A low level can let air in, and usually means very worn pads or a leak. Never put anything but the correct brake fluid in.',
      },
      {
        id: 'q3',
        prompt: 'How can you tell a brake pad is near the end of its life?',
        options: [
          { id: 'a', label: 'Its wear groove has disappeared or the material is very thin' },
          { id: 'b', label: 'The disc looks shiny and smooth, which shows the pads have polished it with use' },
          { id: 'c', label: 'The lever feels firm' },
        ],
        correctOptionId: 'a',
        explanation: 'When the groove has gone or only about 1.5 mm of material remains (check your manual), the pads need replacing.',
      },
    ],
  },

  // 7 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'chain-inspection',
    title: 'Chain inspection',
    summary: 'Measuring slack and keeping the chain lubricated.',
    durationMinutes: 6,
    objectives: [
      'Measure chain slack correctly',
      'Explain the dangers of a chain that is too loose or too tight',
      'Know when the chain needs lubricating',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'Just enough slack',
        body: [
          'As the swingarm moves with the suspension, the distance between the sprockets changes slightly. The chain needs some slack to allow for it — but not so much that it can jump off the sprockets.',
          'Measure it with the motorcycle on its stand, engine off and in neutral: push the middle of the lower run up and then down, and measure the total movement. A typical specification is 20–30 mm; your owner’s manual gives the exact figure.',
        ],
      },
      { type: 'illustration', illustration: 'chain-slack', caption: 'Set the measured slack and the chain’s condition, and read the verdict.' },
      {
        type: 'keyPoints',
        heading: 'Remember',
        points: [
          'Check at a few points as you turn the wheel — chains wear unevenly; use the tightest point.',
          'Too tight strains bearings and can snap; too loose can come off and lock the rear wheel.',
          'Clean and lubricate the chain regularly — roughly every 500–1,000 km, and after riding in rain.',
        ],
      },
      {
        type: 'example',
        body: [
          'A rider feels a clunk every time they open and close the throttle in traffic. The chain has stretched to 45 mm of slack. Adjusting the rear axle adjusters back to 25 mm — keeping both sides equal so the wheel stays aligned — makes the drive smooth again.',
        ],
      },
      {
        type: 'callout',
        tone: 'safety',
        body: 'Only check or lubricate the chain with the engine off. Never turn the wheel by running the engine in gear.',
      },
      { type: 'explore', part: 'chain', text: 'See the chain and sprockets, and how the final drive works.' },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'Where do you measure chain slack?',
        options: [
          { id: 'a', label: 'At the middle of the lower run of the chain' },
          { id: 'b', label: 'Where the chain wraps the rear sprocket' },
          { id: 'c', label: 'At the front sprocket cover' },
        ],
        correctOptionId: 'a',
        explanation: 'Push the middle of the lower run up and down and measure the total movement.',
      },
      {
        id: 'q2',
        prompt: 'Why is a chain that is too tight dangerous?',
        options: [
          { id: 'a', label: 'It makes the motorcycle slower and wastes fuel, but it is not a safety problem' },
          { id: 'b', label: 'It strains the bearings and can snap when the suspension compresses' },
          { id: 'c', label: 'It isn’t dangerous' },
        ],
        correctOptionId: 'b',
        explanation: 'As the swingarm moves, the distance between the sprockets changes, and is greatest at one point in its travel; a chain that is too tight has no slack left for it.',
      },
      {
        id: 'q3',
        prompt: 'What should you check before measuring the chain?',
        options: [
          { id: 'a', label: 'That the engine is running in first gear' },
          { id: 'b', label: 'That the engine is off and the motorcycle is in neutral on its stand' },
          { id: 'c', label: 'That the chain is warm from riding, because a cold chain always reads too tight' },
        ],
        correctOptionId: 'b',
        explanation: 'Never put your hands near the chain with the engine running.',
      },
    ],
  },

  // 8 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'fuel',
    title: 'Fuel',
    summary: 'Knowing how much fuel you have, and how the fuel tap and reserve work.',
    durationMinutes: 5,
    objectives: [
      'Check you have enough fuel for your trip',
      'Use a fuel tap’s ON, RESERVE and OFF positions',
      'Understand the low-fuel warning on fuel-injected motorcycles',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'Main supply and reserve',
        body: [
          'On many carburettor motorcycles, fuel leaves the tank through a tap. In the ON position it draws from the top of a short standpipe; when the level drops below it, the engine starts to splutter. Turning the tap to RESERVE draws from a lower outlet, releasing the last litre or so.',
          'Fuel-injected motorcycles have no tap: an electric pump feeds the injector, and a gauge and low-fuel warning light show the level.',
        ],
      },
      { type: 'illustration', illustration: 'fuel-tap', caption: 'Lower the fuel level and try each tap position — then switch to fuel injection.' },
      {
        type: 'keyPoints',
        heading: 'Remember',
        points: [
          'When you switch to reserve, refuel straight away — and switch back to ON afterwards.',
          'Know roughly how far your motorcycle goes on a tank, and use the trip meter.',
          'Don’t run a fuel-injected motorcycle dry: the fuel cools the pump.',
        ],
      },
      {
        type: 'example',
        body: [
          'Halfway home, the engine coughs and loses power. Without stopping, the rider reaches down and turns the tap to RES; the engine picks up again. With about a litre left, they ride straight to the nearest fuel station.',
        ],
      },
      {
        type: 'callout',
        tone: 'mistake',
        body: 'Forgetting to switch the tap back from RES to ON after refuelling — next time you run low, there is no reserve left.',
      },
      { type: 'explore', part: 'fuel-tank', text: 'See the fuel tank and how it feeds the engine.' },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'The engine splutters with the tap on ON. What is the likely reason?',
        options: [
          { id: 'a', label: 'The fuel level has fallen below the main standpipe' },
          { id: 'b', label: 'The tyres need air' },
          { id: 'c', label: 'The air filter is blocked, so the engine is getting too little air for the fuel it is given' },
        ],
        correctOptionId: 'a',
        explanation: 'Below the standpipe no fuel can flow on ON. Switching to RES draws the reserve from a lower outlet.',
      },
      {
        id: 'q2',
        prompt: 'What should you do after switching to reserve?',
        options: [
          { id: 'a', label: 'Keep riding as normal — reserve holds enough fuel for a full day’s riding' },
          { id: 'b', label: 'Refuel as soon as possible, then switch back to ON' },
          { id: 'c', label: 'Switch to OFF' },
        ],
        correctOptionId: 'b',
        explanation: 'The reserve is only about a litre. After refuelling, return to ON so the reserve is there next time.',
      },
      {
        id: 'q3',
        prompt: 'How do most fuel-injected motorcycles show low fuel?',
        options: [
          { id: 'a', label: 'With a fuel tap that you turn to RESERVE when the engine starts to splutter' },
          { id: 'b', label: 'With a fuel gauge and a low-fuel warning light' },
          { id: 'c', label: 'They don’t' },
        ],
        correctOptionId: 'b',
        explanation: 'Fuel-injected motorcycles use an electric pump and show the level on the instruments.',
      },
    ],
  },

  // 9 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'instrument-cluster',
    title: 'The instrument cluster',
    summary: 'Reading the instruments and warning lights before and during a ride.',
    durationMinutes: 6,
    objectives: [
      'Identify the main instruments and warning lights',
      'Know which lights should go out after starting',
      'Respond correctly to a red warning light',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'What the dashboard tells you',
        body: [
          'The speedometer and rev counter show speed and engine RPM. Around them, warning lights report the motorcycle’s condition. Their colours follow a simple code: green and blue are information, amber means caution — get it checked — and red means stop.',
          'When you turn the ignition on, most warning lights come on briefly as a self-check. The oil pressure and charging lights stay on until the engine starts, and on motorcycles with ABS the ABS light stays on until you pull away.',
        ],
      },
      { type: 'illustration', illustration: 'warning-lights', caption: 'Turn the key through each stage, add faults, and click any light to learn what it means.' },
      {
        type: 'terms',
        heading: 'Common lights',
        items: [
          { term: 'Neutral (green N)', definition: 'The gearbox is in neutral.' },
          { term: 'High beam (blue)', definition: 'The headlight is on main beam.' },
          { term: 'Oil pressure (red)', definition: 'Low oil pressure — if it’s on with the engine running, stop the engine immediately.' },
          { term: 'Engine (amber)', definition: 'An engine management fault on fuel-injected motorcycles.' },
          { term: 'ABS (amber)', definition: 'Anti-lock braking isn’t active yet, or has a fault.' },
        ],
      },
      {
        type: 'example',
        body: [
          'Riding home, a rider notices the red oil light flicker on. They pull over safely and switch off. The oil level is far below the minimum — a few more kilometres could have seized the engine.',
        ],
      },
      {
        type: 'callout',
        tone: 'safety',
        body: 'A red warning light with the engine running means stop safely and switch off. Don’t ride on and hope.',
      },
      { type: 'explore', part: 'instruments', text: 'See the instrument cluster and what feeds it.' },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'Why do the warning lights come on when you turn on the ignition?',
        options: [
          { id: 'a', label: 'It means something is wrong' },
          { id: 'b', label: 'It is a self-check showing the bulbs and systems work' },
          { id: 'c', label: 'To use up battery power' },
        ],
        correctOptionId: 'b',
        explanation: 'The brief bulb check confirms the lights work. Most should go out once the engine is running.',
      },
      {
        id: 'q2',
        prompt: 'The red oil pressure light comes on while riding. What should you do?',
        options: [
          { id: 'a', label: 'Ride faster to get home' },
          { id: 'b', label: 'Stop safely and switch off the engine' },
          { id: 'c', label: 'Carry on gently if the engine sounds fine, and check the oil when you get home' },
        ],
        correctOptionId: 'b',
        explanation: 'Without oil pressure the engine can be destroyed within minutes. Stop and investigate.',
      },
      {
        id: 'q3',
        prompt: 'On a motorcycle with ABS, when should the ABS light normally go out?',
        options: [
          { id: 'a', label: 'As soon as the ignition is turned on, before the engine is started' },
          { id: 'b', label: 'Once the motorcycle has moved off and reached a few km/h' },
          { id: 'c', label: 'It stays on all the time' },
        ],
        correctOptionId: 'b',
        explanation: 'The ABS checks its wheel-speed sensors as you pull away, then the light goes out.',
      },
    ],
  },

  // 10 ──────────────────────────────────────────────────────────────────────────
  {
    id: 'neutral-gear',
    title: 'Neutral gear',
    summary: 'Finding neutral, confirming it, and why you start the engine in it.',
    durationMinutes: 5,
    objectives: [
      'Find neutral between first and second gear',
      'Confirm the motorcycle is in neutral',
      'Explain why the engine should be started in neutral',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'A half-step between first and second',
        body: [
          'In neutral no gear pair is locked, so the engine can run without turning the rear wheel. On the usual 1–N–2–3–4–5 pattern, neutral sits between first and second: from first, lift the lever gently half a step; from second, press it half a step down.',
          'A firm press or lift goes straight past neutral into the next gear, so it takes a lighter touch. It is easiest to find while the motorcycle is rolling slowly or with the engine running.',
        ],
      },
      { type: 'illustration', illustration: 'gearbox', caption: 'Shift into first, then use the half-shift button to find neutral. Try it from second too.' },
      {
        type: 'steps',
        heading: 'Confirming neutral',
        steps: [
          { title: 'Green N light', body: 'With the ignition on, the neutral light is lit.' },
          { title: 'Rolls freely', body: 'With the clutch released, the motorcycle rolls freely when pushed.' },
          { title: 'Start', body: 'Only then press the starter.' },
        ],
      },
      {
        type: 'example',
        body: [
          'A rider stops at a long red light and selects neutral to rest their clutch hand. When the light changes, they pull in the clutch, press down into first, and pull away — keeping an eye on the traffic in the mirrors the whole time.',
        ],
      },
      {
        type: 'callout',
        tone: 'safety',
        body: 'Starting the engine in gear with the clutch out makes the motorcycle lurch forward. Always confirm neutral — or hold the clutch in — before pressing the starter.',
      },
      { type: 'explore', part: 'gearbox', text: 'See how the gearbox locks a gear pair — and unlocks them all in neutral.' },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'On the usual gear pattern, where is neutral?',
        options: [
          { id: 'a', label: 'Below first gear' },
          { id: 'b', label: 'Between first and second gear' },
          { id: 'c', label: 'Above fifth gear' },
        ],
        correctOptionId: 'b',
        explanation: 'The pattern is 1–N–2–3–4–5, with neutral a half-step between first and second.',
      },
      {
        id: 'q2',
        prompt: 'How do you select neutral from first gear?',
        options: [
          { id: 'a', label: 'A firm full lift of the lever, which always stops in neutral on the way to second' },
          { id: 'b', label: 'A gentle half-lift of the lever' },
          { id: 'c', label: 'Press the lever down' },
        ],
        correctOptionId: 'b',
        explanation: 'A full lift goes past neutral into second; a gentle half-lift stops in neutral.',
      },
      {
        id: 'q3',
        prompt: 'Which shows the motorcycle is in neutral?',
        options: [
          { id: 'a', label: 'The green N light, and the motorcycle rolling freely with the clutch out' },
          { id: 'b', label: 'The high-beam light' },
          { id: 'c', label: 'The engine keeps running when you let the clutch out — that alone proves it is in neutral' },
        ],
        correctOptionId: 'a',
        explanation: 'Confirm neutral both ways — the light, and the motorcycle rolling freely — before starting.',
      },
    ],
  },

  // 11 ──────────────────────────────────────────────────────────────────────────
  {
    id: 'side-stand',
    title: 'The side stand',
    summary: 'Parking safely, and the switch that stops you riding off with the stand down.',
    durationMinutes: 5,
    objectives: [
      'Park a motorcycle safely on its side stand',
      'Explain how the side-stand safety switch works',
      'Make raising the stand part of your routine',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'Leaning on one leg',
        body: [
          'The side stand folds down on the left, and the motorcycle leans onto it. It is stable only when the motorcycle leans far enough onto the stand — on a slope or soft ground it can roll or sink and fall over.',
          'Many motorcycles have a side-stand switch. Typically you can start the engine in neutral with the stand down, but if you select a gear with it still down, the engine stops — so you can’t ride off with it extended.',
        ],
      },
      { type: 'illustration', illustration: 'side-stand-switch', caption: 'Try starting and selecting gear with the stand up and down. Details vary between motorcycles.' },
      {
        type: 'keyPoints',
        heading: 'Parking well',
        points: [
          'Park on firm, level ground. On soft ground or hot tarmac, put a flat object under the stand foot.',
          'On a slope, park facing uphill and leave it in first gear. The stand is angled forward, so a backward roll pushes it further open instead of folding it — and first gear stops the motorcycle rolling at all.',
          'Before riding off: sit on, balance, then kick the stand fully up.',
        ],
      },
      {
        type: 'example',
        body: [
          'A rider parks on a slight downhill slope facing downhill. While they are away, the motorcycle rolls forward, the stand folds and it falls. Parking facing uphill, in gear, would have kept the weight leaning onto the stand.',
        ],
      },
      {
        type: 'callout',
        tone: 'safety',
        body: 'Don’t rely on the safety switch: make raising the stand a habit. A stand that digs in during a left turn can throw the motorcycle over.',
      },
      { type: 'explore', part: 'side-stand', text: 'Find the side stand on the motorcycle.' },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'On which side is the side stand, and which way does the parked motorcycle lean?',
        options: [
          { id: 'a', label: 'Right side, leaning right' },
          { id: 'b', label: 'Left side, leaning left' },
          { id: 'c', label: 'Either side, upright' },
        ],
        correctOptionId: 'b',
        explanation: 'The side stand folds down on the left, and the motorcycle leans onto it.',
      },
      {
        id: 'q2',
        prompt: 'With the engine running and the stand down, you select first gear. On a typical motorcycle, what happens?',
        options: [
          { id: 'a', label: 'Nothing — the switch only stops you starting the engine, not riding off' },
          { id: 'b', label: 'The side-stand switch stops the engine' },
          { id: 'c', label: 'The stand raises itself' },
        ],
        correctOptionId: 'b',
        explanation: 'The switch cuts the engine if a gear is selected with the stand down, so you can’t ride off with it extended.',
      },
      {
        id: 'q3',
        prompt: 'How should you park on a slope?',
        options: [
          { id: 'a', label: 'Facing downhill in neutral, so it is easy to roll away when you come back' },
          { id: 'b', label: 'Facing uphill, left in first gear' },
          { id: 'c', label: 'Across the slope, in neutral' },
        ],
        correctOptionId: 'b',
        explanation: 'The stand is angled forward: facing uphill, any roll is backwards, which pushes the stand open rather than folding it. First gear stops it rolling at all.',
      },
    ],
  },

  // 12 ──────────────────────────────────────────────────────────────────────────
  {
    id: 'pre-ride-checklist',
    title: 'The pre-ride checklist',
    summary: 'Everything you have learned, combined into a five-minute check before every ride.',
    durationMinutes: 8,
    objectives: [
      'Carry out a complete pre-ride check',
      'Decide whether a problem means “don’t ride” or “fix soon”',
      'Make the check a habit',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'Five minutes that prevent breakdowns and crashes',
        body: [
          'A pre-ride check brings together everything in this module. Walk around the motorcycle in a fixed order — you, tyres, brakes, controls, lights, chain, fluids — then go through the start-up checks from the seat.',
          'Some problems mean you must not ride until they are fixed: anything affecting brakes, tyres, steering, the throttle or lights in the dark. Others, like a dim indicator or a little low on fuel, can be dealt with on the way.',
        ],
      },
      { type: 'illustration', illustration: 'pre-ride-checklist', caption: 'Work through each item and mark it OK or Problem. Try marking a problem to see the verdict change.' },
      {
        type: 'cta',
        to: '/checklist',
        title: 'Use the checklist before your next ride',
        text: 'Open the full-screen pre-ride checklist — designed to use on your phone, next to the motorcycle.',
      },
      {
        type: 'example',
        body: [
          'Doing the check before a morning commute, a rider finds the brake light doesn’t come on with the rear pedal. That’s a “don’t ride until fixed” item: they swap the switch spring the same evening rather than risk being hit from behind in traffic.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        body: 'Do the checks in the same order every time. A fixed routine means you never skip one — and it soon takes only a few minutes.',
      },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'Which problem means you must not ride until it is fixed?',
        options: [
          { id: 'a', label: 'A spongy front brake lever' },
          { id: 'b', label: 'A slightly dirty motorcycle' },
          { id: 'c', label: 'Fuel at half a tank' },
        ],
        correctOptionId: 'a',
        explanation: 'A spongy brake can’t be trusted to stop you. Brakes, tyres, steering and throttle problems are always “don’t ride”.',
      },
      {
        id: 'q2',
        prompt: 'Why do the checks in the same order every time?',
        options: [
          { id: 'a', label: 'It looks professional' },
          { id: 'b', label: 'A fixed routine makes it much harder to forget an item' },
          { id: 'c', label: 'Because doing them in a different order can change the results you get' },
        ],
        correctOptionId: 'b',
        explanation: 'A routine turns the check into a habit, so nothing gets skipped.',
      },
      {
        id: 'q3',
        prompt: 'Which of these belongs in the final checks from the seat?',
        options: [
          { id: 'a', label: 'Mirrors adjusted, neutral light on, kill switch at RUN, side stand up' },
          { id: 'b', label: 'Measuring the chain slack while seated, with your weight compressing the rear suspension' },
          { id: 'c', label: 'Checking the tyre tread' },
        ],
        correctOptionId: 'a',
        explanation: 'Chain and tyres are checked on the walk-around; mirrors, neutral, kill switch and stand are checked from the seat.',
      },
      {
        id: 'q4',
        prompt: 'The checklist shows one “fix soon” item and everything else OK. What does that mean?',
        options: [
          { id: 'a', label: 'You must not ride until every single item on the checklist is OK' },
          { id: 'b', label: 'You can ride with care, but should fix it promptly' },
          { id: 'c', label: 'The checklist is wrong' },
        ],
        correctOptionId: 'b',
        explanation: '“Fix soon” items don’t stop this ride, but shouldn’t be left.',
      },
    ],
  },
]
