import type { Lesson } from '../types'

/**
 * Your first ride: the practical skills and the safety basics that come before riding on a
 * public road. Law and licence rules differ by country, so lessons state the principle and
 * point the learner to their own transport authority rather than quoting one country's rules.
 */
export const firstRideLessons: Lesson[] = [
  {
    id: 'before-the-road',
    title: 'Before you ride on the road',
    summary: 'Licence, gear and the rules that apply before a motorcycle is allowed on a public road.',
    durationMinutes: 7,
    objectives: [
      'Explain why a licence comes before riding on the road',
      'Name the protection a rider wears and why the helmet matters most',
      'State the only safe amount of alcohol before riding',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'A licence comes first',
        body: [
          'Riding a motorcycle on a public road is legal only with the licence your country requires. For a new rider that is usually a learner’s licence or permit, and it comes with limits — often no passengers, no riding at night, and no fast roads. Training with an instructor is part of getting it in many places.',
          'The exact steps, ages and tests differ everywhere, and they change. Before your first road ride, check the transport authority where you live rather than relying on what a friend did. RideCraft can teach you how the machine works; it cannot grant permission to ride it.',
          'Riding on private land, such as a riding school’s yard, is how you learn the controls before any of this applies. That is where your first practice belongs.',
        ],
      },
      {
        type: 'illustration',
        illustration: 'protective-gear',
        caption: 'Helmet, jacket, gloves, trousers and boots. The helmet does the most — and in most countries it is a legal requirement, worn fastened.',
      },
      {
        type: 'concept',
        heading: 'Nothing to drink, and nothing to prove',
        body: [
          'There is no safe amount of alcohol before riding. Legal limits vary and are often lower for new riders; the only safe choice is none. The same goes for drugs that slow your reactions, and for riding when you are too tired to concentrate.',
          'Other riders and drivers do not expect a motorcycle, so be easy to see: a light or bright jacket, the headlight on, and a position in the lane where you can be seen past the vehicle ahead. Assume you have not been noticed until you have made eye contact.',
        ],
      },
      {
        type: 'callout',
        tone: 'safety',
        title: 'If the worst happens',
        body: 'After a crash: move out of traffic only if you can do it safely, switch the engine off, and call for help. Don’t ride away on a motorcycle that has been dropped until someone has checked the bars, levers, wheels and brakes — damage is easy to miss.',
      },
      {
        type: 'example',
        heading: 'A sensible first month',
        body: [
          'A new rider books training, passes the learner’s test their state requires, and spends the first weeks on familiar roads in daylight with no passenger and no hurry. The gear goes on before the engine starts, every time. Night rides, highways and carrying a friend wait until the basics are automatic.',
        ],
      },
      {
        type: 'keyPoints',
        heading: 'Remember',
        points: [
          'No licence, no public road — check the rules where you live.',
          'A fastened, certified helmet matters most, and full gear goes on before every ride.',
          'No alcohol, no drugs, no riding tired. Be visible, and assume you haven’t been seen.',
        ],
      },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'When can a new rider legally ride on a public road?',
        options: [
          { id: 'a', label: 'As soon as they can start the engine and move off' },
          { id: 'b', label: 'Once they hold the licence their country requires' },
          { id: 'c', label: 'Whenever the road is empty' },
        ],
        correctOptionId: 'b',
        explanation: 'Public roads need the licence or permit your country requires, often with extra limits for learners. Practice belongs on private land until then.',
      },
      {
        id: 'q2',
        prompt: 'How much alcohol is safe before riding?',
        options: [
          { id: 'a', label: 'One drink, if you feel fine' },
          { id: 'b', label: 'Whatever the legal limit allows' },
          { id: 'c', label: 'None' },
        ],
        correctOptionId: 'c',
        explanation: 'Alcohol slows the reactions and judgement riding depends on. Limits differ by place; no alcohol at all is the only safe choice.',
      },
      {
        id: 'q3',
        prompt: 'What should you assume about other drivers?',
        options: [
          { id: 'a', label: 'That they have seen you' },
          { id: 'b', label: 'That they have not seen you, until there is eye contact' },
          { id: 'c', label: 'That they will always give way to a motorcycle' },
        ],
        correctOptionId: 'b',
        explanation: 'Motorcycles are easy to miss. Ride where you can be seen, wear something visible, and treat eye contact as the first evidence you have been noticed.',
      },
    ],
  },
  {
    id: 'getting-on',
    title: 'Getting on and off',
    summary: 'Mount from the left, take the weight off the stand, and get both feet down before you start.',
    durationMinutes: 6,
    objectives: [
      'Get on and off a motorcycle without it falling',
      'Stand the motorcycle upright and retract the side stand before moving',
      'Choose a place where both feet reach the ground flat',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'The motorcycle is heavier than you',
        body: [
          'A motorcycle stands up only while something holds it: the side stand, the centre stand, or your legs. It is stable when it is exactly upright and gets heavier the further it leans, so you never want to catch it once it has started to fall. Keep it upright and close to you.',
          'Mount from the left side, where the side stand is. Stand beside the seat, hold both handlebars, tilt the motorcycle upright so the stand lifts clear of the ground, and swing your right leg over. Both feet go flat on the ground before you think about the engine.',
        ],
      },
      {
        type: 'steps',
        heading: 'Getting on',
        steps: [
          { title: 'Stand on the left', body: 'Bars straight, both hands on the grips, and the motorcycle leaning slightly toward you on its stand.' },
          { title: 'Stand it up', body: 'Press the bars to bring it upright. The side stand lifts off the ground as it comes vertical — that is your moment.' },
          { title: 'Swing a leg over', body: 'Keep the bike upright as your right leg crosses the seat. Sit down and put both feet flat on the ground.' },
          { title: 'Fold the stand', body: 'With your left foot, push the side stand back until it clicks up. Riding off with it down can snap it off, and on many motorcycles the engine cuts out while it is down.' },
        ],
      },
      {
        type: 'illustration',
        illustration: 'side-stand-switch',
        caption: 'Many motorcycles cut the engine if you try to ride away with the side stand down. Fold it up before you move.',
      },
      {
        type: 'concept',
        heading: 'Both feet down',
        body: [
          'If you can’t put both feet flat on the ground, the motorcycle is too tall for you to learn on. On tip-toes you can’t hold it at a stop, which is exactly when it is heaviest. A lower seat or a smaller motorcycle is the fix — not bravery.',
          'Getting off reverses the process: left foot down, motorcycle upright, side stand down with your heel, lean the motorcycle onto the stand until you feel it take the weight, then swing your right leg over and step clear.',
        ],
      },
      {
        type: 'example',
        body: [
          'Parked on a slope, a rider turns the motorcycle so it faces uphill before getting off, leaves it in first gear, and turns the handlebars so the front wheel touches the kerb. The stand holds it; the gear and the kerb are the backup.',
        ],
      },
      {
        type: 'keyPoints',
        heading: 'Remember',
        points: [
          'Mount from the left, stand it upright, then swing a leg over.',
          'Fold the side stand up before moving, and feel it take the weight before you get off.',
          'Both feet flat on the ground, or the motorcycle is too tall.',
        ],
      },
      { type: 'cta', to: '/learn/pre-ride/side-stand', title: 'The side stand, in detail', text: 'Why it folds, and why many motorcycles refuse to move while it is down.' },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'Which side do you get on from?',
        options: [
          { id: 'a', label: 'The right side, away from traffic' },
          { id: 'b', label: 'The left side, where the side stand is' },
          { id: 'c', label: 'Whichever side is closer' },
        ],
        correctOptionId: 'b',
        explanation: 'The side stand is on the left, so the motorcycle leans that way when parked. You stand it up and mount from that side.',
      },
      {
        id: 'q2',
        prompt: 'When do you fold the side stand up?',
        options: [
          { id: 'a', label: 'After you have moved off, to save time' },
          { id: 'b', label: 'Before you move, once both feet are down' },
          { id: 'c', label: 'Only on long rides' },
        ],
        correctOptionId: 'b',
        explanation: 'Moving with the stand down can break it off, and many motorcycles cut the engine while it is down. Fold it up before you roll.',
      },
      {
        id: 'q3',
        prompt: 'Your toes barely touch the ground while seated. What should you do?',
        options: [
          { id: 'a', label: 'Learn to balance so you don’t need your feet' },
          { id: 'b', label: 'Ride only in a straight line' },
          { id: 'c', label: 'Use a lower seat or a smaller motorcycle' },
        ],
        correctOptionId: 'c',
        explanation: 'You hold a motorcycle up with your legs at every stop. If both feet can’t go flat, it is too tall to learn on safely.',
      },
    ],
  },
  {
    id: 'walking-the-bike',
    title: 'Walking with the motorcycle',
    summary: 'Move the motorcycle around with the engine off: straight lines, turning it, and facing it uphill.',
    durationMinutes: 6,
    objectives: [
      'Walk a motorcycle in a straight line from beside it',
      'Turn it round in a tight space',
      'Keep control of it on a slope',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'Engine off, both hands on',
        body: [
          'Before you ever ride, you should be comfortable moving the motorcycle by walking with it. Engine off, ignition off, side stand up. Stand on the left, both hands on the handlebars, and the motorcycle upright — leaning toward you slightly so you have it, not so far that its weight pulls you over.',
          'Look where you want to go, not down at the front wheel. The motorcycle follows your eyes just as it does when riding. Squeeze the front brake lever to stop; it is the control you can reach without letting go of the bars.',
        ],
      },
      {
        type: 'illustration',
        illustration: 'slow-balance',
        caption: 'At walking pace the motorcycle has almost no stability of its own. You balance it, whether you are riding slowly or walking beside it.',
      },
      {
        type: 'steps',
        heading: 'Turning it round',
        steps: [
          { title: 'Full lock', body: 'Turn the handlebars as far as they go toward the side you are turning.' },
          { title: 'Small steps', body: 'Walk the motorcycle round in a tight circle, keeping it upright. Rushing makes it lean outward and get heavy.' },
          { title: 'Brake to pause', body: 'If it starts to lean too far, stop with the front brake and set it upright before continuing.' },
        ],
      },
      {
        type: 'concept',
        heading: 'Slopes',
        body: [
          'Facing downhill, the motorcycle rolls as soon as you lift it off the stand, so cover the front brake before you stand it up. Facing uphill, you are holding its whole weight back — turn it round so it faces up the slope before you leave it, and leave it in gear.',
          'Never try to hold a motorcycle that has leaned past the point where you can stand it up again. Let it down gently instead; picking it up deliberately is far safer than being pulled over with it.',
        ],
      },
      {
        type: 'example',
        body: [
          'In a crowded parking bay, a rider walks the motorcycle backwards out of the space — both hands on the bars, looking over their shoulder — rather than riding it out with cold tyres and a queue behind them.',
        ],
      },
      {
        type: 'keyPoints',
        heading: 'Remember',
        points: [
          'Engine off, stand on the left, both hands on the bars, motorcycle nearly upright.',
          'Look where you want to go, and stop with the front brake.',
          'On a slope, face it uphill and cover the brake before you take it off the stand.',
        ],
      },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'How should the motorcycle lean while you walk it?',
        options: [
          { id: 'a', label: 'As far toward you as you can hold' },
          { id: 'b', label: 'Just off upright, so you have its weight but it doesn’t pull you over' },
          { id: 'c', label: 'Away from you, resting on your hip' },
        ],
        correctOptionId: 'b',
        explanation: 'A motorcycle gets rapidly heavier as it leans. Keep it close to upright so you are controlling it rather than catching it.',
      },
      {
        id: 'q2',
        prompt: 'Which brake do you use while walking the motorcycle?',
        options: [
          { id: 'a', label: 'The front brake lever, which you can reach without letting go' },
          { id: 'b', label: 'The rear brake pedal' },
          { id: 'c', label: 'Neither — you stop it with your legs' },
        ],
        correctOptionId: 'a',
        explanation: 'Both hands stay on the bars, and the front brake lever is under your right hand. The rear pedal is hard to reach while you are standing beside the bike.',
      },
      {
        id: 'q3',
        prompt: 'Which way should a parked motorcycle face on a slope?',
        options: [
          { id: 'a', label: 'Downhill, so it is easy to roll away' },
          { id: 'b', label: 'Across the slope' },
          { id: 'c', label: 'Uphill, and left in gear' },
        ],
        correctOptionId: 'c',
        explanation: 'Facing uphill, the motorcycle can’t roll away if the stand sinks. First gear is a second line of defence.',
      },
    ],
  },
  {
    id: 'stalling',
    title: 'When the engine stalls',
    summary: 'A stall is normal for a new rider. Clutch in, stop, restart, and ride away.',
    durationMinutes: 5,
    objectives: [
      'React to a stall without panicking',
      'Restart and move off again in the right order',
      'Know the two things that most often stop an engine restarting',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'A stall is a lesson, not a failure',
        body: [
          'The engine stalls when it is asked to move the motorcycle from too few revolutions — usually because the clutch came out faster than the throttle opened. Every new rider stalls. What matters is the habit that follows: clutch in straight away, so the engine is free of the wheel, and brake to a controlled stop.',
          'A stalled motorcycle at a junction feels urgent because of the traffic behind you. It isn’t. A calm restart takes a few seconds; rushing the clutch is what stalls it again.',
        ],
      },
      {
        type: 'illustration',
        illustration: 'clutch',
        caption: 'With the clutch pulled in, the engine is disconnected from the rear wheel — so it can restart even while you are in gear.',
      },
      {
        type: 'steps',
        heading: 'Restarting',
        steps: [
          { title: 'Clutch in, and brake', body: 'Pull the clutch all the way in and stop with both brakes. Check you are out of the way of moving traffic.' },
          { title: 'Start it', body: 'Still in gear is fine, as long as the clutch stays in. Press the starter. If nothing happens, check the engine cut-off switch and that the side stand is up.' },
          { title: 'First gear', body: 'If you are in neutral, press down into first. If you are already in first, you are ready.' },
          { title: 'Move off slowly', body: 'A little throttle, then ease the clutch out until the motorcycle starts to pull, and hold it there for a moment before letting it out the rest of the way.' },
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Why it won’t restart',
        body: 'Two switches stop the starter on purpose: the engine cut-off switch on the right handlebar, and on many motorcycles the side stand switch when the stand is down and a gear is selected. Check those two before anything else.',
      },
      {
        type: 'example',
        body: [
          'Moving off uphill, a rider lets the clutch out too quickly, the engine drops below idle and stops. Clutch in, rear brake holding the motorcycle, starter button, and the second attempt is slower through the friction zone. The car behind waits. Nobody is hurt and the rider has learned where “too fast” is.',
        ],
      },
      {
        type: 'keyPoints',
        heading: 'Remember',
        points: [
          'Clutch in immediately, then brake to a stop.',
          'Restart with the clutch held in; first gear; ease away.',
          'If it won’t start, check the cut-off switch and the side stand.',
        ],
      },
      { type: 'cockpit', scenario: 'start-and-move-off', caption: 'Watch a smooth move-off. Then practise it yourself — and stall on purpose until the restart is automatic.' },
      { type: 'cta', to: '/simulators/cockpit?practice=start-and-move-off&from=/learn/first-ride/stalling', title: 'Practise the stall where it’s free', text: 'Stall on purpose in the cockpit and get the restart sequence into your hands before you need it.' },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'What is the first thing you do when the engine stalls while moving off?',
        options: [
          { id: 'a', label: 'Put both feet down and hold the motorcycle up' },
          { id: 'b', label: 'Pull the clutch in, then brake to a stop' },
          { id: 'c', label: 'Press the starter immediately' },
        ],
        correctOptionId: 'b',
        explanation: 'The clutch disconnects the dead engine from the wheel, and the brakes stop you where you choose. Restarting comes after you have stopped safely.',
      },
      {
        id: 'q2',
        prompt: 'Can you restart the engine while it is in gear?',
        options: [
          { id: 'a', label: 'Yes, if the clutch is pulled all the way in' },
          { id: 'b', label: 'No, it must be in neutral' },
          { id: 'c', label: 'Only in second gear or higher' },
        ],
        correctOptionId: 'a',
        explanation: 'With the clutch in, the engine is disconnected from the rear wheel, so it can start in gear. Neutral works too; the clutch is what makes either safe.',
      },
      {
        id: 'q3',
        prompt: 'The starter does nothing. What do you check first?',
        options: [
          { id: 'a', label: 'The tyre pressures' },
          { id: 'b', label: 'The engine cut-off switch and the side stand' },
          { id: 'c', label: 'The chain tension' },
        ],
        correctOptionId: 'b',
        explanation: 'The cut-off switch and, on many motorcycles, the side stand switch are designed to stop the engine. They are the two most common reasons a healthy motorcycle refuses to start.',
      },
    ],
  },
  {
    id: 'picking-it-up',
    title: 'Picking up a dropped motorcycle',
    summary: 'How to lift a fallen motorcycle without hurting your back — and when to ask for help.',
    durationMinutes: 6,
    objectives: [
      'Lift a light motorcycle using your legs rather than your back',
      'Decide when a motorcycle is too heavy to lift alone',
      'Check the motorcycle before riding it again',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'Use your legs',
        body: [
          'Dropping a motorcycle is common while learning, and it rarely damages anything but pride — provided you lift it correctly. The mistake is bending over it and pulling with your back. Instead you turn your back toward the seat, bend your knees, and push the motorcycle upright with your legs.',
          'This works well for the light motorcycles most people learn on. A heavy motorcycle is a two-person job: forcing it alone risks a back injury and a second fall. There is no shame in waiting for help.',
        ],
      },
      {
        type: 'illustration',
        illustration: 'body-position',
        caption: 'The same idea as good riding posture: your legs do the work and your back stays straight.',
      },
      {
        type: 'steps',
        heading: 'The lift',
        steps: [
          { title: 'Make it safe', body: 'Engine off, ignition off. If fuel is leaking, move everyone away and don’t try to start it.' },
          { title: 'Turn the wheel', body: 'Turn the front wheel toward the direction you will lift it, so the bars don’t fight you.' },
          { title: 'Back to the seat', body: 'Stand with your back against the seat, feet apart, knees bent, and grip the lower handlebar and a solid point low on the frame or grab rail.' },
          { title: 'Push up', body: 'Straighten your legs in small pushes, pausing to reset your grip. Once it is upright, put the stand down before you let go.' },
        ],
      },
      {
        type: 'concept',
        heading: 'Check it before you ride',
        body: [
          'A fall can bend a lever, knock a mirror loose, spill fuel or oil, or trap the chain. Before starting it: look underneath for fresh fluid, check both levers move and return, spin each wheel to see it runs true and the brake isn’t dragging, and check the bars still point straight ahead. If anything looks bent or leaks, it waits for someone qualified.',
        ],
      },
      {
        type: 'example',
        body: [
          'Stalling mid-turn in a car park, a learner puts a foot down too late and the motorcycle settles gently onto its side. Engine off, the lift takes half a minute, and a quick check shows a scratched lever end and nothing else. The lesson was about looking through the turn — the motorcycle is fine.',
        ],
      },
      {
        type: 'keyPoints',
        heading: 'Remember',
        points: [
          'Back to the seat, bent knees, push with your legs.',
          'A heavy motorcycle is a two-person lift.',
          'Check for leaks, bent levers and straight bars before riding again.',
        ],
      },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'Which part of your body should do the lifting?',
        options: [
          { id: 'a', label: 'Your back, pulling the motorcycle toward you' },
          { id: 'b', label: 'Your arms, holding it by the mirror and seat' },
          { id: 'c', label: 'Your legs, pushing upwards with your back straight' },
        ],
        correctOptionId: 'c',
        explanation: 'Turn your back to the seat, bend your knees and push the motorcycle up by straightening your legs. Pulling with your back is how people get injured.',
      },
      {
        id: 'q2',
        prompt: 'The motorcycle is too heavy to lift alone. What do you do?',
        options: [
          { id: 'a', label: 'Lift harder — momentum will get it up' },
          { id: 'b', label: 'Wait and lift it with a second person' },
          { id: 'c', label: 'Drag it upright by the handlebars' },
        ],
        correctOptionId: 'b',
        explanation: 'Forcing a heavy motorcycle risks your back and a second fall. Two people make it easy.',
      },
      {
        id: 'q3',
        prompt: 'What do you check before riding a motorcycle that has fallen?',
        options: [
          { id: 'a', label: 'Only that the engine starts' },
          { id: 'b', label: 'Leaks, levers, wheels and that the bars point straight' },
          { id: 'c', label: 'The paintwork' },
        ],
        correctOptionId: 'b',
        explanation: 'A fall can bend levers, spill fluid or knock the bars out of line. Any of those makes it unsafe to ride until it has been checked properly.',
      },
    ],
  },
  {
    id: 'first-practice',
    title: 'Your first practice session',
    summary: 'An empty car park, full gear, one skill at a time — and stopping before you get tired.',
    durationMinutes: 7,
    objectives: [
      'Choose a safe place and the right company for a first session',
      'Order the skills to practise, from moving off to turning',
      'Recognise when to stop for the day',
    ],
    blocks: [
      {
        type: 'concept',
        heading: 'The right place',
        body: [
          'Your first riding happens somewhere with no traffic: a riding school’s yard, or an empty, sealed car park you have permission to use. Flat ground, daylight, and room to stall without meeting anything solid. Gravel, slopes and wet paint wait until you can move off and stop without thinking.',
          'Go with a qualified instructor if you can, or with an experienced rider who will watch rather than coach from another moving motorcycle. Learning alone means nobody to pick the motorcycle up or to spot the habit that is holding you back.',
        ],
      },
      {
        type: 'illustration',
        illustration: 'u-turn',
        caption: 'Slow turns are the last thing you add, not the first. Moving off and stopping come before them.',
      },
      {
        type: 'steps',
        heading: 'A one-hour session',
        steps: [
          { title: 'Gear and checks', body: 'Full gear, fastened, then the pre-ride checks. An engine that cuts out or a soft tyre will ruin the hour.' },
          { title: 'Moving off and stopping', body: 'The whole session can be this and still be a success. Clutch to the friction zone, a little throttle, ride a few metres, and stop smoothly with the clutch in. Repeat until it is boring.' },
          { title: 'Then slow riding', body: 'Only once moving off is reliable: ride as slowly as you can in a straight line, then wide gentle turns, looking where you want to go.' },
          { title: 'Stop while it is going well', body: 'Tired riders drop motorcycles. An hour is plenty. End on a clean move-off and stop, and note the one thing to work on next time.' },
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'One new thing at a time',
        body: 'Don’t combine skills you haven’t got yet. Braking practice happens in a straight line, turning practice happens at a steady speed, and the two meet only once each is comfortable on its own.',
      },
      {
        type: 'example',
        body: [
          'A first session produces twenty clean move-offs, three stalls, and no falls. The rider never got above a jogging pace and didn’t attempt a U-turn. That is a good hour — the stalls showed exactly where the clutch was released too fast, which is what the next session is for.',
        ],
      },
      { type: 'cockpit', scenario: 'start-and-move-off', caption: 'Watch a clean first-session skill: start, friction zone, a few metres, and away. Then practise it yourself.' },
      {
        type: 'keyPoints',
        heading: 'Remember',
        points: [
          'Empty, flat, sealed ground, in daylight, with an instructor or an experienced rider.',
          'Moving off and stopping until it is boring, then slow riding, then wide turns.',
          'Stop after about an hour, before you are tired.',
        ],
      },
      { type: 'cta', to: '/checklist', title: 'Run the checks first', text: 'The pre-ride checklist takes five minutes and belongs at the start of every session.' },
    ],
    knowledgeCheck: [
      {
        id: 'q1',
        prompt: 'Where should your first riding practice happen?',
        options: [
          { id: 'a', label: 'A quiet road early in the morning' },
          { id: 'b', label: 'An empty, flat, sealed area with no traffic' },
          { id: 'c', label: 'A gravel car park, because the speed is low' },
        ],
        correctOptionId: 'b',
        explanation: 'You want space to stall and drop the motorcycle without hitting anything or meeting traffic. Gravel and public roads come later.',
      },
      {
        id: 'q2',
        prompt: 'What should you be able to do before you practise turning?',
        options: [
          { id: 'a', label: 'Move off and stop reliably in a straight line' },
          { id: 'b', label: 'Ride at 50 km/h' },
          { id: 'c', label: 'Change up to third gear' },
        ],
        correctOptionId: 'a',
        explanation: 'Turning adds balance and vision to skills you should already trust. Get moving off and stopping boring first.',
      },
      {
        id: 'q3',
        prompt: 'When do you end the session?',
        options: [
          { id: 'a', label: 'When you finally stop stalling, however long it takes' },
          { id: 'b', label: 'After about an hour, before you are tired' },
          { id: 'c', label: 'When it gets dark' },
        ],
        correctOptionId: 'b',
        explanation: 'Fatigue causes falls. An hour of clean practice beats two hours of tired practice, and darkness removes the margin you still need.',
      },
    ],
  },
]
