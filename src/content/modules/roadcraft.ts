import type { Lesson } from '../types'

/**
 * On the road: seeing, space, junctions and other people. Taught after the controls and
 * the yard manoeuvres, before anyone treats a knowledge test as permission to ride unsupervised.
 * Law and licence rules differ; lessons state the principle and send the rider to their own
 * transport authority.
 */

export const roadcraftLessons: Lesson[] = [
  {
    id: 'seeing-and-being-seen',
    title: 'Seeing and being seen',
    summary: 'Lane position, mirrors and a shoulder check — so you see the road, and other people see you.',
    durationMinutes: 8,
    objectives: [
      'Choose a lane position that gives a view and makes you visible',
      'Use mirrors, then a shoulder check, before you change position',
      'Assume you have not been seen until you have proof',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'You are easy to miss',
        body: [
          'A motorcycle occupies a small part of a driver’s view and disappears behind pillars, buses and parked vans. The habit that keeps you alive is not “they should have looked”. It is: sit where you can see past the vehicle ahead, wear something that returns light, keep the headlight on, and never occupy a gap you have not checked.',
          'Lane position is a tool, not a lane to live in. Move left or right inside your lane to open a view, to be seen in a mirror, or to leave an escape toward the kerb or the centre. Do not hide in a car’s blind spot, and do not ride in the gutter where the surface is worst.',
        ],
      },
      { type: 'illustration', illustration: 'mirror-blind-spots', caption: 'Mirrors show a lot, not everything. The shoulder check covers the patch a car can sit in beside you.' },
      {
        type: 'steps',
        heading: 'Before you change place',
        steps: [
          { title: 'Mirrors', body: 'A proper look, not a glance — both sides if you might move either way.' },
          { title: 'Signal', body: 'If someone needs to know you are about to move, tell them in time to act.' },
          { title: 'Shoulder check', body: 'Turn your head and look into the blind spot. A motorcycle beside you will not be in the mirror.' },
          { title: 'Move', body: 'Change position smoothly. If the gap has closed, wait.' },
        ],
      },
      {
        type: 'example',
        body: [
          'Queued at a light, a rider sits in the right-hand third of the lane, just behind a van’s mirror. The van starts and swings right; the rider is in the blind spot and has to brake. Next time they sit where the driver can see them in the mirror, or they drop back until they can see the driver’s face.',
        ],
      },
      { type: 'callout', tone: 'safety', title: 'Eye contact is not a contract', body: 'A driver looking at you has not promised to wait. Keep an escape until they have actually given way.' },
      {
        type: 'keyPoints',
        heading: 'Remember',
        points: [
          'Be where you can see, and where you can be seen.',
          'Mirrors, then a shoulder check, then move.',
          'Assume you are invisible until the other person has acted, not just looked.',
        ],
      },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'Why is a shoulder check needed as well as the mirrors?', options: [{ id: 'a', label: 'Mirrors are only for the rear' }, { id: 'b', label: 'A vehicle can sit in the blind spot beside you, where the mirror cannot show it' }, { id: 'c', label: 'It is only for motorways, where cars come up beside you much faster' }], correctOptionId: 'b', explanation: 'Mirrors have a blind patch alongside the motorcycle. A quick look over the shoulder covers it before you change position.' },
      { id: 'q2', prompt: 'Where should you not sit for long in traffic?', options: [{ id: 'a', label: 'Where the driver ahead can see you in a mirror' }, { id: 'b', label: 'In another vehicle’s blind spot' }, { id: 'c', label: 'Far enough back to see past them' }], correctOptionId: 'b', explanation: 'If they cannot see you, they can change lane or pull out as if the space is empty.' },
      { id: 'q3', prompt: 'A driver looks at you at a junction. What have they promised?', options: [{ id: 'a', label: 'Nothing — keep an escape until they actually give way' }, { id: 'b', label: 'That they have seen you and will wait for you to pass' }, { id: 'c', label: 'That you must go immediately' }], correctOptionId: 'a', explanation: 'Looking is not yielding. You are still easy to miss once they look back at their own gap.' },
    ],
  },
  {
    id: 'space-and-following',
    title: 'Space and following distance',
    summary: 'Two seconds on a dry road, more when grip or sight is poor — and a way out to the side.',
    durationMinutes: 7,
    objectives: [
      'Hold a two-second gap on a dry road',
      'Explain why a one-second gap is used up by reaction',
      'Leave an escape to the side, not only behind the vehicle ahead',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'Time, not car-lengths',
        body: [
          'Pick a mark the vehicle ahead passes — a post, a shadow, a line — and count “one thousand and one, one thousand and two”. If you reach the mark before two, you are too close. At 50 km/h two seconds is about 28 m; at 80 km/h it is about 44 m. The number of “car lengths” people guess is almost always too short.',
          'A motorcycle can often stop in less distance than a car, but a car with ABS can out-brake you, and you still cover a full second at speed before you even start to brake. Two seconds on a dry road is the minimum. Rain, gravel, a loaded pillion, night, or a tired brain all ask for more.',
        ],
      },
      { type: 'illustration', illustration: 'friction-circle', caption: 'Grip is one budget. A two-second gap is time to use that budget; a one-second gap is only the time you spend noticing.' },
      {
        type: 'callout',
        tone: 'tip',
        title: 'An escape is sideways',
        body: 'Sitting dead-centre behind a van leaves you nowhere to go if it stops. Offset in the lane so you can see past it and, if you must, go around — only if that space is actually empty.',
      },
      {
        type: 'example',
        body: [
          'On a dual carriageway at 80 km/h a rider sits one second behind a car. The car brakes hard for a queue. The rider’s first second is still at 80 km/h — 22 m — while the car is already slowing. They hit it. Two seconds later, with the same braking, they would have stopped short.',
        ],
      },
      { type: 'cockpit', scenario: 'highway', caption: 'Watch a two-second gap at 80 km/h, then a hard stop when the car ahead brakes.' },
      {
        type: 'keyPoints',
        heading: 'Remember',
        points: [
          'Two seconds dry; more in rain, spray, gravel or at night.',
          'A one-second gap is reaction time with no braking left.',
          'Offset so you can see, and so you have a way out.',
        ],
      },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'How do you measure a two-second gap?', options: [{ id: 'a', label: 'Stay two car-lengths back at any speed, because that is about two seconds of travel' }, { id: 'b', label: 'When the vehicle ahead passes a mark, you should reach that mark no sooner than two seconds later' }, { id: 'c', label: 'Stay close enough to read their number plate' }], correctOptionId: 'b', explanation: 'A fixed mark and a two-second count works at any speed. Car-lengths shrink in the mind as you go faster.' },
      { id: 'q2', prompt: 'At 80 km/h, why is one second not enough?', options: [{ id: 'a', label: 'The brakes take one second to work' }, { id: 'b', label: 'You cover about 22 m in that second before you start braking, while the car is already slowing' }, { id: 'c', label: 'Tyres cannot grip above 70 km/h' }], correctOptionId: 'b', explanation: 'Reaction uses the whole gap. A modern car can already be stopping during that second.' },
      { id: 'q3', prompt: 'Besides the gap behind, what else should you leave?', options: [{ id: 'a', label: 'A sideways escape and a view past the vehicle ahead' }, { id: 'b', label: 'Nothing — the gap is enough' }, { id: 'c', label: 'A smaller gap in front, so nobody cuts in between you and the vehicle ahead' }], correctOptionId: 'a', explanation: 'If the only space you own is the boot in front of you, a sudden stop has nowhere for you to go.' },
    ],
  },
  {
    id: 'junctions',
    title: 'Junctions and side roads',
    summary: 'Slow, look, and only go when the gap is yours — including the road you cannot see yet.',
    durationMinutes: 8,
    objectives: [
      'Arrive at a junction slow enough to stop',
      'Look the right way for the traffic system you are in',
      'Treat a hidden side road as a hazard until you can see into it',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'Most crashes that are not a slide happen here',
        body: [
          'Junctions are where paths cross. The skill is not a clever line: it is arriving slow enough to stop, looking early, and not going because “you usually can”. A motorcycle is easy to miss in a driver’s left-right scan, especially if you are accelerating to beat a gap.',
          'Where traffic keeps left, the new danger at a side road often comes from your right; where traffic keeps right, from your left. The principle is the same: look toward the traffic that has the shorter time to reach you, then the rest, then look again as you go.',
        ],
      },
      { type: 'illustration', illustration: 'junction-turn', caption: 'Slow on the straight, look into the road you are joining, then turn. Speed is set before the lean.' },
      {
        type: 'steps',
        heading: 'Approaching a junction',
        steps: [
          { title: 'Position', body: 'Mirrors, signal if needed, and the part of the lane that matches the turn.' },
          { title: 'Slow', body: 'Brake and change down while upright. Arrive slowly enough to stop if the light turns red or a car pulls out of the side road.' },
          { title: 'Look', body: 'Traffic, pedestrians, the surface, and the bit of road you still cannot see.' },
          { title: 'Go or wait', body: 'Only take a gap you can take without rushing. Hesitation in the middle of the junction is worse than waiting.' },
        ],
      },
      {
        type: 'example',
        body: [
          'A rider sees a clear main road and rolls out of a side street at 30 km/h. A car they had not seen — hidden by a parked bus — is already in the junction. Rolling out at walking pace, they would have stopped in a metre. Speed at the give-way line is the whole decision.',
        ],
      },
      { type: 'callout', tone: 'mistake', title: 'Creeping out in the wrong gear', body: 'If you have to think about the clutch, you are not looking at the road. Stop, first gear, clutch in, then look. Move off only once the gap is real.' },
      {
        type: 'keyPoints',
        heading: 'Remember',
        points: [
          'Arrive able to stop.',
          'Look to the traffic that can reach you first, then look again as you go.',
          'A gap you have to rush is not a gap.',
        ],
      },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'When should you set your speed for a junction turn?', options: [{ id: 'a', label: 'Halfway round' }, { id: 'b', label: 'Before you start turning, while upright' }, { id: 'c', label: 'After you see you are going too fast' }], correctOptionId: 'b', explanation: 'Braking while leaned uses the grip you need for the turn. Slow on the straight.' },
      { id: 'q2', prompt: 'You cannot see into a side road because a van is parked at the corner. What is safest?', options: [{ id: 'a', label: 'Hold your speed — they should give way' }, { id: 'b', label: 'Slow enough to stop if something appears, and take a position that opens the view' }, { id: 'c', label: 'Sound the horn as you approach and continue at the same speed' }], correctOptionId: 'b', explanation: 'A hidden junction is a hazard until you can see. Speed you cannot stop from is a bet.' },
      { id: 'q3', prompt: 'A gap at a junction is only just big enough if you accelerate hard. What should you do?', options: [{ id: 'a', label: 'Take it — hesitation causes crashes' }, { id: 'b', label: 'Wait for a gap you can take without rushing' }, { id: 'c', label: 'Pull out slowly into the middle and decide there' }], correctOptionId: 'b', explanation: 'Rushing a marginal gap puts you in someone’s path at an awkward speed. Waiting is slow and safe.' },
    ],
  },
  {
    id: 'other-people',
    title: 'Parked vehicles, pedestrians and animals',
    summary: 'Doors, people stepping out, and animals in the road — leave room and have a plan that is not “they will move”.',
    durationMinutes: 8,
    objectives: [
      'Leave a door’s width when passing parked vehicles',
      'Treat a hidden pavement as a place a person can step from',
      'Brake or swerve for an animal — not both at full strength',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'The road is full of people who are not looking at you',
        body: [
          'A parked car is a door, a child between bumpers, and a driver who may pull out. Pass far enough out that an opening door cannot hit you — about a door’s width — and watch the wheels and the heads. If you cannot have the width, slow until you can stop.',
          'Pedestrians step out from behind buses, from between cars, and from the “wrong” side of the road. Animals freeze. You cannot train them. You can ride at a speed that leaves you a choice, keep the motorcycle upright for a hard brake, and look at the gap if you must swerve.',
        ],
      },
      { type: 'illustration', illustration: 'countersteer', caption: 'A swerve is a firm press on the handlebar toward the gap, eyes on the gap — not on the person or the dog.' },
      { type: 'cockpit', scenario: 'sudden-obstacle', caption: 'A dog frozen in your lane: brake hard and straight, or swerve — never both at the limit.' },
      {
        type: 'example',
        body: [
          'In a market street a rider threads between parked scooters at 40 km/h. A car door opens. There is no room and no time. At 20 km/h, a door’s width out, the same door is a scare and a swerve, not a crash.',
        ],
      },
      { type: 'callout', tone: 'safety', title: 'Target fixation', body: 'Look at the dog and you will hit the dog. Look at the space you want to occupy.' },
      {
        type: 'keyPoints',
        heading: 'Remember',
        points: [
          'A parked vehicle is a door and a person until proven otherwise.',
          'Slow where people and animals are likely.',
          'Brake upright, or swerve with the brakes off — not both at full strength.',
        ],
      },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'How much room should you leave when passing parked cars?', options: [{ id: 'a', label: 'As little as possible, so you stay in the middle of your lane and clear of oncoming traffic' }, { id: 'b', label: 'About a door’s width, or slow until you can stop if one opens' }, { id: 'c', label: 'None if they look empty' }], correctOptionId: 'b', explanation: 'Doors open, and children appear between cars. Width or a speed you can stop from.' },
      { id: 'q2', prompt: 'A dog freezes in your lane and you cannot stop. What is the better option if the other lane is empty?', options: [{ id: 'a', label: 'Brake as hard as you can and swerve at the same time' }, { id: 'b', label: 'A firm countersteer into the gap, eyes on the gap, brakes off the limit' }, { id: 'c', label: 'Close your eyes' }], correctOptionId: 'b', explanation: 'Braking and turning share one budget of grip. A limit brake plus a swerve asks for more than the tyres have.' },
      { id: 'q3', prompt: 'Why slow near a bus at a stop?', options: [{ id: 'a', label: 'Buses are always empty' }, { id: 'b', label: 'People walk out in front of it, and it may pull away without seeing you' }, { id: 'c', label: 'It is illegal to pass a bus that has stopped to let people on or off' }], correctOptionId: 'b', explanation: 'The bus hides the pavement. Treat the front of it as a junction you cannot see into.' },
    ],
  },
  {
    id: 'defensive-riding',
    title: 'Defensive riding',
    summary: 'Ride so other people’s mistakes have somewhere to go that is not through you.',
    durationMinutes: 8,
    objectives: [
      'Keep an escape as a normal part of riding, not only in emergencies',
      'Read what a vehicle is about to do from its position and wheels',
      'Choose not to win an argument with a larger or more aggressive vehicle',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'You cannot control them. You can control the space.',
        body: [
          'Defensive riding is not timid riding. It is riding with a plan for the thing that has not happened yet: the car that will turn without signalling, the truck that will occupy two lanes, the person who will brake for a pothole you cannot yet see. You do that with speed you can explain, a gap you counted, a position that opens a view, and a decision not to occupy a hole that is about to close.',
          'Wheels tell the truth before indicators do. A car’s front wheels turning toward your path, a bus drifting toward the kerb, a van’s nose edging out of a side road — those are decisions already made. Believe them.',
        ],
      },
      { type: 'illustration', illustration: 'cornering-line', caption: 'Look where you want to go, and where the hazard will be — not at the thing you fear.' },
      {
        type: 'terms',
        heading: 'Habits that buy time',
        items: [
          { term: 'Speed', definition: 'Could you stop in the distance you can see to be clear? If not, you are too fast for this bit of road.' },
          { term: 'Space', definition: 'A gap behind, a view past, and a sideways out. Sitting in a sandwich is a choice.' },
          { term: 'Visibility', definition: 'Light on, a position in the lane that puts you in mirrors, not in pillars.' },
          { term: 'Pride', definition: 'Let the aggressive driver go. You do not need the metre they want.' },
        ],
      },
      {
        type: 'example',
        body: [
          'A rider is tailgated on a single-lane road. They speed up to “get away”, then have to brake for a speed breaker and the car hits them. The better play: ease off slightly to restore their own two-second gap ahead, stay predictable, and let the car pass at the next safe place — or just live with them behind until the road opens.',
        ],
      },
      { type: 'callout', tone: 'safety', title: 'This site is not a licence', body: 'RideCraft can teach you what to do. It cannot grant permission to ride on a public road, and it cannot see the junction in front of you. Real practice belongs with a qualified instructor.' },
      {
        type: 'keyPoints',
        heading: 'Remember',
        points: [
          'Ride at a speed you can stop in the distance you can see.',
          'Believe wheels and noses, not hopes.',
          'You do not win by occupying a gap that is about to close.',
        ],
      },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'What is the test for a safe speed?', options: [{ id: 'a', label: 'Matching the vehicle ahead' }, { id: 'b', label: 'Being able to stop in the distance you can see to be clear' }, { id: 'c', label: 'The speed limit on the last sign, which already allows for the road ahead' }], correctOptionId: 'b', explanation: 'A limit is a maximum, not a target. Sight, surface and traffic set the speed you can actually use.' },
      { id: 'q2', prompt: 'A car is following too closely. What is the safer response?', options: [{ id: 'a', label: 'Brake-check them so they learn' }, { id: 'b', label: 'Open your gap ahead, stay predictable, and let them pass when it is safe' }, { id: 'c', label: 'Speed up and weave' }], correctOptionId: 'b', explanation: 'You cannot control a tailgater. You can refuse to steal your own stopping distance, and you can refuse a fight.' },
      { id: 'q3', prompt: 'Which is the more honest clue that a car will pull out?', options: [{ id: 'a', label: 'The front wheels starting to turn, or the nose creeping forward' }, { id: 'b', label: 'No indicator, so they will not turn' }, { id: 'c', label: 'Eye contact from the driver' }], correctOptionId: 'a', explanation: 'Indicators lie; wheels and movement do not. Eye contact is still not a promise.' },
    ],
  },
  {
    id: 'night-riding',
    title: 'Riding at night',
    summary: 'You see later and you are seen later. Slow down, use the lights you have, and leave more gap.',
    durationMinutes: 7,
    objectives: [
      'Explain why stopping distance must shrink to fit the beam',
      'Use dipped and main beam without dazzling other people',
      'Leave night riding until the daytime skills are automatic',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'The world is only as big as the light',
        body: [
          'At night you get less time. A dipped beam on a typical commuter motorcycle lights tens of metres, not hundreds. If you cannot stop in the lit distance, you are overdriving the lamp. Main beam helps on an empty road; dip it for oncoming traffic and when you follow someone, or you steal their night vision — and yours, when they flash back.',
          'You are also harder to place. A single headlight is easy to misread as farther away than it is. Keep it on, keep reflectors clean, and do not assume a driver who “must have seen the light” has judged your speed.',
        ],
      },
      { type: 'illustration', illustration: 'warning-lights', caption: 'Lights and reflectors are how you exist at night. A dark motorcycle is a rumour in someone’s peripheral vision.' },
      { type: 'cta', to: '/scenarios/night-riding', title: 'Night riding as a decision', text: 'See what happens when you hold daytime speed after the beam runs out.' },
      {
        type: 'example',
        body: [
          'A rider who is comfortable at 70 km/h by day holds that speed on an unlit road. An unlit cart appears at the edge of the beam. At 70 km/h the reaction-plus-stop is longer than the light. At 40 km/h it is a hard brake and a miss.',
        ],
      },
      { type: 'callout', tone: 'info', title: 'Learner limits', body: 'Many places ban or discourage night riding on a learner licence. Check yours. Even where it is allowed, night is a later skill — after the controls are boring in daylight.' },
      {
        type: 'keyPoints',
        heading: 'Remember',
        points: [
          'Do not ride faster than you can stop in the light you have.',
          'Dip for others; keep the lamp and reflectors clean.',
          'Night comes after daytime competence, not instead of it.',
        ],
      },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'What should limit your speed at night on an unlit road?', options: [{ id: 'a', label: 'The daytime speed you like' }, { id: 'b', label: 'The distance in which you can stop inside the beam' }, { id: 'c', label: 'The speed of the car ahead, because its lights show you the road beyond your own beam' }], correctOptionId: 'b', explanation: 'If the hazard is beyond the light, you will meet it at full speed. Fit the speed to the beam.' },
      { id: 'q2', prompt: 'When should you dip the main beam?', options: [{ id: 'a', label: 'For oncoming traffic, and when you are following someone' }, { id: 'b', label: 'Never — you need to see' }, { id: 'c', label: 'Only in towns, where street lights already light the road' }], correctOptionId: 'a', explanation: 'Dazzling the person you are about to share the road with makes both of you worse at seeing.' },
      { id: 'q3', prompt: 'Why leave night rides until later as a new rider?', options: [{ id: 'a', label: 'The motorcycle does not work in the dark' }, { id: 'b', label: 'You get less time to see and to be judged, on top of skills that are not yet automatic' }, { id: 'c', label: 'Helmets are illegal at night' }], correctOptionId: 'b', explanation: 'Night removes time. It should not be where you still think about the clutch.' },
    ],
  },
  {
    id: 'pillion',
    title: 'Riding with a passenger',
    summary: 'Extra mass, a shifted centre, and a person who can upset the motorcycle. Brief them, add time, and go later.',
    durationMinutes: 7,
    objectives: [
      'Explain what extra mass does to braking, acceleration and sag',
      'Brief a passenger before you move off',
      'Leave pillion riding until you can ride without thinking about the controls',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'You are no longer the only mass',
        body: [
          'A passenger adds a large fraction of the motorcycle’s weight, further back. The rear sags, the steering can feel heavier, acceleration is slower, and stopping takes longer. The clutch needs a little more patience moving off. If they fidget, lean the wrong way, or put a foot down, they can drop you at walking pace.',
          'Before you take anyone: the motorcycle must be rated for it, the rear preload often needs a step (owner’s manual), tyre pressures may need to rise, and both of you wear real kit. Many learner licences forbid a passenger. Check. Even when it is legal, a pillion is not how you learn.',
        ],
      },
      { type: 'illustration', illustration: 'body-position', caption: 'At walking pace you stay upright and let the motorcycle lean. A passenger who leans the wrong way fights that.' },
      { type: 'cta', to: '/scenarios/pillion', title: 'A pillion in a stop', text: 'See how extra mass changes a stop at a red light — and why a wriggle at walking pace is dangerous.' },
      {
        type: 'steps',
        heading: 'Before you roll',
        steps: [
          { title: 'Brief them', body: 'Mount from the left when you say so, hold the rider or the grab rail, feet on the pegs until you stop, look over your shoulder the way you turn, no sudden moves.' },
          { title: 'You are ready first', body: 'Engine running, in gear, clutch in, both feet down. Then they get on.' },
          { title: 'Move off slower', body: 'A little more throttle and a slower clutch than you use alone. Warn them before you stop hard.' },
        ],
      },
      {
        type: 'example',
        body: [
          'A new rider takes a friend around the block. At a U-turn the friend looks down and leans out. The motorcycle drops. The same rider, a month later, with a briefing and no U-turns on the first pillion ride, only notices that every stop needs a thought more brake.',
        ],
      },
      {
        type: 'keyPoints',
        heading: 'Remember',
        points: [
          'More mass: slower to speed up, longer to stop, rear sits down.',
          'Brief them, then you are set, then they mount.',
          'A passenger is a later skill, and often illegal on a learner licence.',
        ],
      },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'What does a passenger change most obviously about a stop?', options: [{ id: 'a', label: 'Nothing' }, { id: 'b', label: 'It takes longer — more mass, and more of it on the rear until you brake' }, { id: 'c', label: 'Nothing much — the extra weight presses the tyres down, so the stop stays the same' }], correctOptionId: 'b', explanation: 'Stopping distance grows with mass if deceleration is limited by grip and technique. You also feel the extra load as you move off and brake.' },
      { id: 'q2', prompt: 'When should a passenger get on?', options: [{ id: 'a', label: 'Before you get on, so they can hold the motorcycle steady while you climb on' }, { id: 'b', label: 'After you are ready: engine running, in control, both feet down' }, { id: 'c', label: 'As you roll away, to save time' }], correctOptionId: 'b', explanation: 'A motorcycle that is not yet stable, with a person climbing on, is how street-side drops start.' },
      { id: 'q3', prompt: 'Why is a pillion a bad idea for a brand-new rider?', options: [{ id: 'a', label: 'Friends are distracting, and the motorcycle behaves differently, on top of skills that are not automatic' }, { id: 'b', label: 'Passengers are always illegal' }, { id: 'c', label: 'The engine cannot take two people' }], correctOptionId: 'a', explanation: 'You need spare attention. A passenger spends it. Many licences also forbid it for learners — check locally.' },
    ],
  },
  {
    id: 'when-it-goes-wrong',
    title: 'When it goes wrong',
    summary: 'Fatigue, breakdowns, a puncture, a fight with traffic — the safe move is usually to stop being in the way.',
    durationMinutes: 7,
    objectives: [
      'Stop riding when you are too tired or too angry to see',
      'Get a broken motorcycle out of the traffic before you diagnose it',
      'Know that RideCraft is knowledge, not a substitute for an instructor or a licence',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'The brave choice is often to stop',
        body: [
          'When you are tired it feels as if you can manage “a bit longer”, but you start missing mirror checks and braking late. Being angry at another driver uses up the same attention. There is no safe amount of alcohol before riding, and being very tired slows your reactions in a similar way to drinking. If you would not let a friend ride in the state you are in, do not ride yourself.',
          'A puncture, a snapped chain, a dead engine: first, get out of the live lane if you can do it without walking into traffic. Lights on, somewhere people can see you, then look. Do not crouch in a fast lane with your back to traffic. On a fast road, getting yourself to the safe side matters more than saving the motorcycle.',
        ],
      },
      { type: 'illustration', illustration: 'tyre-check', caption: 'Many “sudden” failures could have been spotted before the ride: a nail in a tyre, a worn patch, a dry chain. The pre-ride checklist catches them early.' },
      { type: 'cta', to: '/checklist', title: 'The checks that prevent this lesson', text: 'Tyres, chain, brakes, lights — five minutes, every ride.' },
      {
        type: 'example',
        body: [
          'A chain jumps off on a busy ring road. The rider tries to refit it in the left lane because the next exit is “only a kilometre”. A bus driver does not expect someone crouching in the lane. Pushing the motorcycle onto the shoulder first would have taken longer, but it would have been safe.',
        ],
      },
      { type: 'callout', tone: 'safety', title: 'After a drop or a crash', body: 'Move out of traffic only if you can. Engine off. Call for help. Do not ride away on a motorcycle that has been down until the levers, bars, wheels and brakes have been checked — damage is easy to miss.' },
      {
        type: 'keyPoints',
        heading: 'Remember',
        points: [
          'Tired, angry or after a drink: you do not ride.',
          'If the motorcycle breaks down, get it out of the traffic first; find the fault afterwards.',
          'Passing every quiz here is not a licence, and it is not the same as practising an emergency stop on a real motorcycle.',
        ],
      },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'The engine dies in a live lane. What comes first?', options: [{ id: 'a', label: 'Open the seat and look at the fuse' }, { id: 'b', label: 'Get yourself and the motorcycle out of the moving traffic if you can do it safely' }, { id: 'c', label: 'Stay with the motorcycle in the lane, hazard lights on, and wave traffic past while you find the fault' }], correctOptionId: 'b', explanation: 'You are easier to hit than to help while you are in the path. Safety of position first, then the machine.' },
      { id: 'q2', prompt: 'You have been riding for hours and keep missing the mirror check. What should you do?', options: [{ id: 'a', label: 'Open the visor and go on' }, { id: 'b', label: 'Stop, rest, drink water; do not treat willpower as a safety system' }, { id: 'c', label: 'Open the visor for fresh air and carry on, checking the mirrors more often' }], correctOptionId: 'b', explanation: 'Missed checks are the symptom. More speed is not the cure.' },
      { id: 'q3', prompt: 'What does a high score on RideCraft prove?', options: [{ id: 'a', label: 'That you may ride unsupervised on public roads' }, { id: 'b', label: 'That you understand the ideas — real competence still needs a motorcycle, an instructor, and the licence your country requires' }, { id: 'c', label: 'That you will not crash' }], correctOptionId: 'b', explanation: 'Knowledge is necessary and not sufficient. The road does not grade quizzes.' },
    ],
  },
]
