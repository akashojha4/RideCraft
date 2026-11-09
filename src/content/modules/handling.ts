import type { Lesson } from '../types'

/**
 * Module 3 — Turning & Handling (Phase 9). Ten lessons, each pairing the physics of what
 * the motorcycle does with the technique that keeps the rider safe. Numbers come from the
 * same models as the illustrations (lib/mechanics/cornering.ts and braking.ts): a small
 * commuter motorcycle with rider, footpegs touching down at about 40° of lean.
 */
export const handlingLessons: Lesson[] = [
  // 1 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'basic-turning',
    title: 'How to take a bend',
    summary: 'Slow, look, press, roll: the four steps of every turn, and why they come in that order.',
    durationMinutes: 7,
    objectives: ['Describe the four steps of taking a bend', 'Explain why braking belongs before the bend, not in it', 'Use your eyes to steer the motorcycle'],
    blocks: [
      {
        type: 'concept',
        heading: 'A turn is a balance, set up before it begins',
        body: [
          'To follow a curve, the motorcycle needs a sideways push from the road towards the centre of the turn. The tyres provide it as grip — and a motorcycle must lean to balance that push, as the next lesson shows. The faster you go, or the tighter the bend, the bigger the push and the further you must lean.',
          'The tyres’ grip is shared between turning and braking. Every bit used for braking in a bend is grip not available for turning. So the speed is set before the bend, while upright, and the bend itself is ridden at a steady speed with a gentle throttle.',
        ],
      },
      { type: 'illustration', illustration: 'cornering-line', caption: 'Watch the four phases as the motorcycle takes a 25 m right-hand bend. Change the corner speed and see the lean change.' },
      {
        type: 'steps',
        heading: 'Slow, look, press, roll',
        steps: [
          { title: 'Slow', body: 'Brake and change down on the straight, upright, so you arrive at the speed you’ll keep through the bend. Too slow is easy to fix; too fast is not.' },
          { title: 'Look', body: 'Turn your head and look through the bend to where you want to go — as far round as you can see. You steer towards where you look.' },
          { title: 'Press', body: 'Press the handlebar on the inside of the turn — right bar to go right. The motorcycle leans and turns (lesson 3 explains why).' },
          { title: 'Roll', body: 'Hold a gentle, steady throttle round the bend, then roll it on as the road straightens and the motorcycle stands up.' },
        ],
      },
      {
        type: 'example',
        body: [
          'A new rider approaches a country bend too fast, stares at the hedge on the outside and brakes hard in the middle of it. The motorcycle stands up and runs wide, towards exactly where they were looking. Next time they brake earlier on the straight, look round to the exit and keep a steady throttle — and the same bend feels easy.',
        ],
      },
      { type: 'callout', tone: 'mistake', title: 'Target fixation', body: 'In a fright, people stare at the thing they fear — the kerb, the pothole, the oncoming car — and ride straight at it. Force your eyes to the escape route instead.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'When should you do your braking for a bend?', options: [{ id: 'a', label: 'In the middle of the bend' }, { id: 'b', label: 'Before the bend, while upright and travelling straight' }, { id: 'c', label: 'Only if you start to run wide' }], correctOptionId: 'b', explanation: 'Braking uses grip. Done upright on the straight, all the grip is available for it; leaned over, much of the grip is already needed for turning.' },
      { id: 'q2', prompt: 'Where should you look in a bend?', options: [{ id: 'a', label: 'At the front wheel' }, { id: 'b', label: 'At the edge of the road nearest you' }, { id: 'c', label: 'Through the bend, towards the exit' }], correctOptionId: 'c', explanation: 'Riders steer towards where they look. Looking through the bend also shows you what’s coming as early as possible.' },
      { id: 'q3', prompt: 'What should the throttle be doing in the middle of a bend?', options: [{ id: 'a', label: 'Fully closed' }, { id: 'b', label: 'Open gently and steadily' }, { id: 'c', label: 'Opening and closing to adjust the line' }], correctOptionId: 'b', explanation: 'A steady throttle keeps the speed and the load on the tyres constant, so the motorcycle stays balanced and settled.' },
    ],
  },

  // 2 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'leaning',
    title: 'Why motorcycles lean',
    summary: 'The balance between weight and grip that decides how far you lean — and where its limits are.',
    durationMinutes: 7,
    objectives: ['Explain why a motorcycle must lean to turn', 'Predict how lean changes with speed and the tightness of a bend', 'Name the two limits on lean angle'],
    blocks: [
      {
        type: 'concept',
        heading: 'Weight and grip, balanced about the tyres',
        body: [
          'In a turn, the tyres push the motorcycle sideways towards the centre of the turn — that push is what makes it follow the curve. On an upright motorcycle, a push at ground level would tip it over towards the outside. Leaning moves the centre of mass of motorcycle and rider inside the tyres, where its weight balances the push.',
          'The lean needed is set by speed and radius alone: tan(lean) = speed² ÷ (g × radius). (That treats the tyres as thin discs; real, rounded tyres need a few degrees more, because the contact patch moves inward as the motorcycle leans.) Double the speed and the push is four times bigger. It does not depend on the weight of the motorcycle or the rider — a heavy tourer and a light commuter lean the same for the same bend at the same speed.',
        ],
      },
      { type: 'illustration', illustration: 'lean-angle', caption: 'Pick a corner and a speed. The blue arrow is the tyres’ sideways grip; the black arrow is the weight.' },
      {
        type: 'terms',
        heading: 'The two limits',
        items: [
          { term: 'Grip', definition: 'The tyres can push sideways with at most μ × the weight. With the typical figures this course uses — μ ≈ 0.9 on dry asphalt, 0.5 in the wet — that allows about 42° of lean dry and only about 27° wet. Real values vary with the tyre, its temperature and the surface.' },
          { term: 'Ground clearance', definition: 'On a commuter motorcycle the footpegs touch the road at about 40°. The motorcycle can’t lean further, so it can’t turn any tighter at that speed.' },
        ],
      },
      {
        type: 'example',
        body: [
          'Taking a small roundabout (about 12 m radius) at 30 km/h needs about 30° of lean — exciting but well inside the limits on a dry day. In the rain, the same roundabout at the same speed would need 0.58 g of sideways grip — more than a wet road can give (about 0.5 g). Riding it at 20 km/h needs only about 15°.',
        ],
      },
      { type: 'callout', tone: 'tip', body: 'Lean angle is your margin. The less you need for a bend, the more grip and clearance are left for a damp patch, a bit of gravel or a bend that tightens.' },
      { type: 'explore', part: 'footpegs', text: 'See where the footpegs sit — they set the motorcycle’s lean limit.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'You take the same bend at twice the speed. What happens to the sideways push the tyres must provide?', options: [{ id: 'a', label: 'It doubles' }, { id: 'b', label: 'It becomes about four times bigger' }, { id: 'c', label: 'It stays the same' }], correctOptionId: 'b', explanation: 'The push grows with speed squared, so twice the speed needs four times the push — and much more lean.' },
      { id: 'q2', prompt: 'A heavier rider takes the same bend at the same speed. How far does the motorcycle lean?', options: [{ id: 'a', label: 'Further' }, { id: 'b', label: 'Less' }, { id: 'c', label: 'The same' }], correctOptionId: 'c', explanation: 'Weight and the cornering push both scale with mass, so the lean depends only on speed and radius.' },
      { id: 'q3', prompt: 'Why is the lean limit lower on a wet road?', options: [{ id: 'a', label: 'The tyres are colder' }, { id: 'b', label: 'The tyres can grip less, so they can provide less sideways push' }, { id: 'c', label: 'The footpegs touch down sooner' }], correctOptionId: 'b', explanation: 'With μ ≈ 0.5 the tyres can only push sideways with half the weight, which limits the lean to about 27°.' },
    ],
  },

  // 3 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'countersteering',
    title: 'Countersteering',
    summary: 'To turn right, press the right handlebar. The surprising way every motorcycle starts a turn.',
    durationMinutes: 8,
    objectives: ['Explain why a motorcycle has to steer away from a turn to start it', 'Use handlebar pressure to lean the motorcycle', 'Know when countersteering applies'],
    blocks: [
      {
        type: 'concept',
        heading: 'Steer out from under it',
        body: [
          'A motorcycle can’t turn until it leans, and it can’t lean on its own. If you simply turned the handlebar right, the tyres would curve right — out from under the motorcycle — and it would fall to the left, the outside of the turn. Push hard enough and you would fall off.',
          'So every turn starts with a brief steer the *other* way. Pressing the right handlebar forward points the front wheel slightly left. The tyres move left, out from under the centre of mass, and the motorcycle starts to lean right. Within a fraction of a second the front wheel swings back to point into the turn — just enough to hold the lean — and the motorcycle turns right.',
          'At 50 km/h the countersteer is less than one degree and lasts a few tenths of a second, so most riders never notice it. But they do it every time — and doing it deliberately makes turns quicker and more precise.',
        ],
      },
      { type: 'illustration', illustration: 'countersteer', caption: 'A simulation of the motorcycle’s lean. Watch which way the front wheel turns first — then try steering like a bicycle.' },
      {
        type: 'steps',
        heading: 'Using it',
        steps: [
          { title: 'Press to go', body: 'Press the handlebar on the side you want to go: right bar forward to go right, left bar forward to go left.' },
          { title: 'Press harder to lean faster', body: 'More pressure, more quickly, leans the motorcycle faster — the key to swerving round an obstacle.' },
          { title: 'Relax to hold', body: 'Once leaned, ease the pressure and the motorcycle holds the turn with a light touch.' },
          { title: 'Press the other bar to stand up', body: 'To finish the turn, press the outside bar; the motorcycle rolls back upright.' },
        ],
      },
      {
        type: 'example',
        body: [
          'A rider at 60 km/h sees a pothole at the last moment. Instead of “turning” the handlebar, they give the left bar a firm, quick push: the motorcycle flicks left round the pothole, and a push on the right bar brings it straight again — all in about a second.',
        ],
      },
      { type: 'callout', tone: 'info', body: 'Physically, every turn begins with a small countersteer — even on a bicycle. Above roughly 15–20 km/h it is the main thing you feel and how you control lean. At walking pace the countersteer is tiny compared with the large steering angle the turn needs, so it feels as if you simply steer where you want to go — see the slow-speed lesson.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'At 50 km/h you want to turn left. What do you do with the handlebar?', options: [{ id: 'a', label: 'Press the left handlebar forward' }, { id: 'b', label: 'Pull the left handlebar back' }, { id: 'c', label: 'Press the right handlebar forward' }], correctOptionId: 'a', explanation: 'Pressing the left bar points the front wheel briefly right, which makes the motorcycle lean left — and turn left.' },
      { id: 'q2', prompt: 'Why can’t you start a turn by turning the handlebar towards it?', options: [{ id: 'a', label: 'The steering is locked at speed' }, { id: 'b', label: 'The tyres move out from under the motorcycle the wrong way, so it leans away from the turn' }, { id: 'c', label: 'You can — it just takes longer' }], correctOptionId: 'b', explanation: 'Steering right first pushes the tyres right, so the motorcycle falls to the left — the outside of the turn.' },
      { id: 'q3', prompt: 'How do you lean the motorcycle more quickly, for example to swerve?', options: [{ id: 'a', label: 'Press the handlebar harder and faster' }, { id: 'b', label: 'Lean your body first' }, { id: 'c', label: 'Brake hard' }], correctOptionId: 'a', explanation: 'A firmer countersteer moves the tyres out from under the motorcycle faster, so it leans faster.' },
    ],
  },

  // 4 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'body-positioning',
    title: 'Body positioning',
    summary: 'Where to put your weight — leaning in on the road, leaning out for tight, slow turns.',
    durationMinutes: 6,
    objectives: ['Explain how the rider’s position changes the motorcycle’s lean', 'Choose a body position for bends and for slow turns', 'Keep the upper body relaxed while turning'],
    blocks: [
      {
        type: 'concept',
        heading: 'The turn cares about the combined centre of mass',
        body: [
          'The rider is about a third of the total mass, so where they sit matters. The turn needs the combined centre of mass of motorcycle and rider at the right lean for the speed and radius. If you move your weight to the inside, the motorcycle itself needs to lean less to put the combined centre in the same place.',
          'Leaning in doesn’t reduce the grip needed — that depends only on speed and radius — but it keeps the motorcycle more upright, which leaves more ground clearance and lean in reserve. At walking pace the opposite works better: sit upright or lean out, and let the motorcycle lean beneath you.',
        ],
      },
      { type: 'illustration', illustration: 'body-position', caption: 'Move the rider’s weight in and out and compare the motorcycle’s lean with the combined lean (blue).' },
      {
        type: 'keyPoints',
        heading: 'Good habits',
        points: [
          'Everyday bends: sit in line with the motorcycle, or lean your head and shoulders slightly into the turn.',
          'Faster bends: move your upper body a little to the inside, keeping your arms relaxed.',
          'Walking-pace turns and U-turns: keep your body upright and let the motorcycle lean under you (counter-lean).',
          'Grip the tank with your knees so your arms are free to steer — never pull on the handlebar to hold yourself on.',
        ],
      },
      {
        type: 'example',
        body: [
          'In a car park a rider tries a tight U-turn, leaning with the motorcycle as they would on the road. It feels like it will topple, and they put a foot down. Trying again, they keep their body upright and push the motorcycle down beneath them: the turn is tighter and steadier, because their weight stays over the tyres.',
        ],
      },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'What does leaning your body into a bend do?', options: [{ id: 'a', label: 'Reduces the grip the tyres need' }, { id: 'b', label: 'Lets the motorcycle lean less for the same bend' }, { id: 'c', label: 'Makes the motorcycle go faster' }], correctOptionId: 'b', explanation: 'Moving your mass inside means the motorcycle can stay more upright while the combined centre of mass leans as the turn requires.' },
      { id: 'q2', prompt: 'Which body position suits a slow, tight U-turn?', options: [{ id: 'a', label: 'Leaning further in than the motorcycle' }, { id: 'b', label: 'Upright, letting the motorcycle lean beneath you' }, { id: 'c', label: 'Standing on the footpegs' }], correctOptionId: 'b', explanation: 'Keeping your weight upright over the tyres at walking pace makes the motorcycle easier to balance and lets it turn tighter.' },
      { id: 'q3', prompt: 'Does leaning in change how much grip the turn uses?', options: [{ id: 'a', label: 'Yes, it uses much less' }, { id: 'b', label: 'No — the grip needed depends on speed and radius' }, { id: 'c', label: 'Yes, it uses more' }], correctOptionId: 'b', explanation: 'The sideways push is set by speed and radius. Body position changes the motorcycle’s lean, not the push.' },
    ],
  },

  // 5 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'u-turns',
    title: 'U-turns',
    summary: 'Turning round in the road: full lock, walking pace, eyes on the exit.',
    durationMinutes: 6,
    objectives: ['Work out whether a U-turn fits the road', 'Control speed in a U-turn with clutch and rear brake', 'Know when to choose a three-point turn instead'],
    blocks: [
      {
        type: 'concept',
        heading: 'At walking pace, the handlebar sets the radius',
        body: [
          'At walking pace the angle of the handlebar sets the turn. At full lock — 38° at the bars on this motorcycle, about 35° at the road because the steering axis is raked back — the front wheel follows a circle about 2.3 m in radius. That makes a U-turn about 4.5 m across, plus room to start from the kerb: roughly 6 m of road. Owner’s manuals list the minimum turning radius; for small motorcycles it is typically about 2–3 m.',
          'Speed works against you. The faster you go round that tight circle, the more lean it needs: at 8 km/h about 13°, at 12 km/h about 27°, and above about 15 km/h more than the footpegs allow — so the turn widens. A tight U-turn is a walking-pace manoeuvre.',
        ],
      },
      { type: 'illustration', illustration: 'u-turn', caption: 'Set the road width, the speed and how far the handlebar is turned. Does the U-turn fit between the kerbs?' },
      {
        type: 'steps',
        heading: 'A safe U-turn',
        steps: [
          { title: 'Choose the place', body: 'A wide, quiet, level road where you can see well in both directions. Stop at the kerb side.' },
          { title: 'Look all round', body: 'Check mirrors and look over both shoulders. Wait until the road is clear both ways.' },
          { title: 'Slow and steady', body: 'First gear, slipping the clutch for a gentle, constant pull, with a little throttle. Control speed with the rear brake — never the front at full lock.' },
          { title: 'Full lock, head turned', body: 'Turn the handlebar fully and turn your head to look where you are going — back down the road.' },
          { title: 'Upright body', body: 'Keep your body upright and let the motorcycle lean beneath you.' },
        ],
      },
      {
        type: 'example',
        body: [
          'On a 7 m street, a rider tries to U-turn at 12 km/h with the handlebar half turned and drifts towards the far kerb. At walking pace and full lock, starting from the kerb, the same motorcycle turns in about 4.5 m and fits. On a 5 m lane even full lock won’t fit — so they stop and do a three-point turn, pushing back with their feet.',
        ],
      },
      { type: 'callout', tone: 'safety', body: 'Using the front brake at full lock with the motorcycle leaned is the classic way to drop it. Speed control in slow turns comes from the clutch and the rear brake.' },
      { type: 'cockpit', scenario: 'u-turn', caption: 'Watch a walking-pace U-turn: clutch in the friction zone, full lock, rear brake — never the front.' },
      { type: 'cta', to: '/simulators/cockpit?practice=u-turn&from=/learn/handling/u-turns', title: 'Practise the U-turn in the cockpit', text: 'Turn round at walking pace with the clutch and the rear brake, and feel why the front brake is the wrong tool.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'What sets how tight a walking-pace U-turn can be?', options: [{ id: 'a', label: 'How hard you lean your body' }, { id: 'b', label: 'How far the handlebar can turn — the steering lock' }, { id: 'c', label: 'The engine’s power' }], correctOptionId: 'b', explanation: 'At walking pace the handlebar angle sets the turning radius; full lock gives the tightest turn.' },
      { id: 'q2', prompt: 'Which brake should control your speed during a U-turn?', options: [{ id: 'a', label: 'The front brake' }, { id: 'b', label: 'The rear brake' }, { id: 'c', label: 'Neither — use the kill switch' }], correctOptionId: 'b', explanation: 'The rear brake slows you gently without tipping the leaned, fully steered motorcycle into the turn as the front brake would.' },
      { id: 'q3', prompt: 'The road is too narrow for a U-turn even at full lock. What should you do?', options: [{ id: 'a', label: 'Do it faster so the motorcycle leans more' }, { id: 'b', label: 'Do a three-point turn or push the motorcycle round' }, { id: 'c', label: 'Mount the pavement' }], correctOptionId: 'b', explanation: 'More speed makes the turn wider, not tighter. A three-point turn is the safe choice.' },
    ],
  },

  // 6 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'tight-turns',
    title: 'Tight turns at junctions',
    summary: 'Turning into a side road without running wide into the oncoming lane.',
    durationMinutes: 6,
    objectives: ['Explain why speed decides whether you can make a tight turn', 'Set your speed before a junction turn', 'Position and look for a tight turn'],
    blocks: [
      {
        type: 'concept',
        heading: 'Tight corners need slow speeds',
        body: [
          'A junction corner might have a radius of only 5 m. The lean needed grows with speed squared and shrinks with radius, so tight corners are very sensitive to speed: a 5 m corner takes 19° at 15 km/h, but 45° at 25 km/h — beyond the footpegs.',
          'If the corner needs more lean than the motorcycle has, it can only turn as tightly as 40° allows. It runs wide by the difference — across the centre line, into the path of oncoming traffic.',
        ],
      },
      { type: 'illustration', illustration: 'junction-turn', caption: 'Choose a corner and a speed. Watch where the motorcycle ends up.' },
      {
        type: 'steps',
        heading: 'Turning into a side road',
        steps: [
          { title: 'Mirror, signal, position', body: 'Check behind, signal in good time and move to the correct position in your lane for the turn.' },
          { title: 'Slow down early', body: 'Brake and change down — usually to first or second — before you start turning. Arrive slowly; you can always accelerate out.' },
          { title: 'Look into the road', body: 'Turn your head and look into the road you’re joining, checking for pedestrians and oncoming traffic.' },
          { title: 'Turn and drive out', body: 'Press the inside bar, keep a gentle throttle round the corner and accelerate as you straighten.' },
        ],
      },
      {
        type: 'example',
        body: [
          'A rider turns into a side street at 25 km/h without slowing. The motorcycle can’t lean enough, runs wide and stops a metre from an oncoming van. Slowing to 12 km/h before the corner, the same turn needs only 13° — relaxed, in lane, with time to spot a pedestrian crossing.',
        ],
      },
      { type: 'callout', tone: 'tip', body: 'Junction surfaces often carry gravel, diesel and painted lines — all low grip. Another reason to keep your lean small by keeping your speed low.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'Why do you run wide if you take a tight corner too fast?', options: [{ id: 'a', label: 'The brakes stop working' }, { id: 'b', label: 'The corner needs more lean than the motorcycle can reach, so it turns more gently' }, { id: 'c', label: 'The engine pushes you wide' }], correctOptionId: 'b', explanation: 'Beyond the lean limit, the motorcycle can only turn at the radius that limit allows — wider than the corner.' },
      { id: 'q2', prompt: 'When should you slow down for a junction turn?', options: [{ id: 'a', label: 'Before you start turning' }, { id: 'b', label: 'Halfway round' }, { id: 'c', label: 'Once you see you are running wide' }], correctOptionId: 'a', explanation: 'Set your speed while upright, so the turn itself can be ridden smoothly with full attention on the road.' },
      { id: 'q3', prompt: 'A corner needs 19° at 15 km/h. Roughly how much lean would it need at 25 km/h?', options: [{ id: 'a', label: 'About 25°' }, { id: 'b', label: 'About 32°' }, { id: 'c', label: 'About 45° — more than the motorcycle can lean' }], correctOptionId: 'c', explanation: 'The push grows with speed squared: (25/15)² ≈ 2.8 times more, which needs about 45° of lean.' },
    ],
  },

  // 7 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'roundabouts',
    title: 'Roundabouts',
    summary: 'Give way, choose your path, signal clearly and lean smoothly round the island.',
    durationMinutes: 8,
    objectives: ['Give way correctly at a roundabout', 'Signal for each exit', 'Ride round the island at a steady speed and lean'],
    blocks: [
      {
        type: 'concept',
        heading: 'A continuous turn, shared with traffic',
        body: [
          'A roundabout is a circle you ride at a constant lean. A 10 m circle at 20 km/h needs about 18° of lean — steady throttle, steady speed, eyes ahead round the curve. Because you are leaned the whole way round, the surface matters: roundabouts collect diesel and oil spilled by turning vehicles.',
          'Traffic already on the roundabout has priority. Where traffic keeps left, it circulates clockwise and comes from your right; where traffic keeps right, it circulates anticlockwise and comes from your left.',
        ],
      },
      { type: 'illustration', illustration: 'roundabout', caption: 'Choose which side traffic drives on and your exit. Watch the give-way, the signals and the lean.' },
      {
        type: 'steps',
        heading: 'Signals and position (single-lane roundabout)',
        steps: [
          { title: 'First exit', body: 'Signal towards the kerb side on approach and keep signalling as you leave.' },
          { title: 'Straight on', body: 'No signal on approach. Once you pass the exit before yours, signal towards the kerb side to leave.' },
          { title: 'Later exits and U-turns', body: 'Signal towards the island on approach and while circulating; switch to the kerb-side signal after passing the exit before yours.' },
          { title: 'Before you leave', body: 'Check the mirror and blind spot on the kerb side — cyclists and other motorcycles may be beside you.' },
        ],
      },
      {
        type: 'example',
        body: [
          'A rider sweeps onto a roundabout at 30 km/h without looking, forcing a circulating car to brake, then brakes hard on a diesel patch while leaned and feels the front tuck. Approaching more slowly, giving way and holding a steady 20 km/h, the lean drops from 35° to 18° and there is grip to spare.',
        ],
      },
      { type: 'callout', tone: 'info', body: 'Rules on lane choice and signals vary between countries; follow your local highway code. The principles — give way to traffic already circulating, signal your intentions, ride at a steady speed — are universal.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'Who has priority at a roundabout?', options: [{ id: 'a', label: 'Whoever arrives first' }, { id: 'b', label: 'Traffic already on the roundabout' }, { id: 'c', label: 'The larger vehicle' }], correctOptionId: 'b', explanation: 'Joining traffic gives way to vehicles already circulating.' },
      { id: 'q2', prompt: 'You are going straight on. When do you signal to leave?', options: [{ id: 'a', label: 'On approach' }, { id: 'b', label: 'After passing the exit before yours' }, { id: 'c', label: 'You never signal for straight on' }], correctOptionId: 'b', explanation: 'Signalling after the exit before yours tells waiting drivers you are about to leave.' },
      { id: 'q3', prompt: 'Why should you avoid braking hard while circulating?', options: [{ id: 'a', label: 'It annoys other drivers' }, { id: 'b', label: 'You are leaned, so much of the grip is already used — and roundabouts often have diesel spills' }, { id: 'c', label: 'The brakes overheat' }], correctOptionId: 'b', explanation: 'Leaned over, grip is shared between turning and braking. Set your speed before you join.' },
    ],
  },

  // 8 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'slow-speed',
    title: 'Slow-speed handling',
    summary: 'Why walking pace is the hardest speed to balance at, and the three controls that make it easy.',
    durationMinutes: 7,
    objectives: ['Explain why a motorcycle is harder to balance at low speed', 'Use clutch, throttle and rear brake together at walking pace', 'Keep your eyes up in slow manoeuvres'],
    blocks: [
      {
        type: 'concept',
        heading: 'Balance comes from steering — and steering needs speed',
        body: [
          'A motorcycle is always starting to fall one way or the other. You catch it by steering towards the fall: the turn creates a sideways force that lifts the motorcycle back up. That force grows with speed squared, so at road speed a tiny steering movement is enough.',
          'At walking pace the same correction needs a huge handlebar movement — catching a 5° lean at 5 km/h takes about 30° of steering, and below about 4.5 km/h you run out of lock. An uncaught lean doubles in about a third of a second. That is why slow riding feels wobbly, and why riders keep the engine pulling to stay above that speed.',
        ],
      },
      { type: 'illustration', illustration: 'slow-balance', caption: 'Change the speed and see how much steering it takes to catch a lean.' },
      {
        type: 'steps',
        heading: 'The slow-speed triangle',
        steps: [
          { title: 'Throttle', body: 'A small, constant amount — just above idle — so the engine never bogs down.' },
          { title: 'Clutch', body: 'Held in the friction zone: let it out a little to go faster, pull it in a little to slow down. This is your main speed control.' },
          { title: 'Rear brake', body: 'Dragged lightly against the engine. It steadies the motorcycle and gives fine speed control. Avoid the front brake while the handlebar is turned or the motorcycle is leaned.' },
          { title: 'Eyes up', body: 'Look where you want to go, not at the ground in front of the wheel.' },
        ],
      },
      {
        type: 'example',
        body: [
          'Filtering through slow traffic at 5 km/h, a rider keeps lurching as they snap the throttle on and off. With a steady trickle of throttle, the clutch slipping in the friction zone and a light foot on the rear brake, the motorcycle moves smoothly at walking pace and the wobbles disappear.',
        ],
      },
      { type: 'cockpit', scenario: 'slow-traffic', caption: 'Watch walking-pace control: a little throttle, clutch in the friction zone, rear brake to steady the motorcycle.' },
      { type: 'cta', to: '/simulators/cockpit?practice=slow-traffic&from=/learn/handling/slow-speed', title: 'Practise slow riding in the cockpit', text: 'Creep, stop and go at walking pace — the clutch is the speed control.' },
      { type: 'cta', to: '/simulators/ride-and-stop', title: 'Try the slow race', text: 'Ride 15 m as slowly as you can in the riding-and-stopping simulator, using the clutch and rear brake.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'Why is a motorcycle harder to balance at walking pace?', options: [{ id: 'a', label: 'The engine is weaker' }, { id: 'b', label: 'The steering correction needed to catch a lean grows enormously as speed drops' }, { id: 'c', label: 'The tyres have less grip' }], correctOptionId: 'b', explanation: 'The force from steering grows with speed squared, so at low speed much more steering is needed — eventually more than the lock allows.' },
      { id: 'q2', prompt: 'What is the main speed control at walking pace?', options: [{ id: 'a', label: 'The front brake' }, { id: 'b', label: 'The clutch, slipped in the friction zone' }, { id: 'c', label: 'Changing gear' }], correctOptionId: 'b', explanation: 'Small clutch movements smoothly add or remove drive without the jerks of the throttle alone.' },
      { id: 'q3', prompt: 'Where should you look during slow manoeuvres?', options: [{ id: 'a', label: 'At the ground just in front of the wheel' }, { id: 'b', label: 'Up and ahead, where you want to go' }, { id: 'c', label: 'At the instruments' }], correctOptionId: 'b', explanation: 'Looking down makes you steer down and lose balance; looking up and ahead keeps the motorcycle steady and on line.' },
    ],
  },

  // 9 ───────────────────────────────────────────────────────────────────────────
  {
    id: 'tyre-grip',
    title: 'Tyre grip',
    summary: 'The friction circle: one budget of grip, shared between braking, accelerating and turning.',
    durationMinutes: 7,
    objectives: ['Explain the friction circle', 'Recognise surfaces with low grip', 'Avoid asking the tyres for braking and turning at the limit at once'],
    blocks: [
      {
        type: 'concept',
        heading: 'One budget, any direction',
        body: [
          'A tyre grips the road through a contact patch about the size of a credit card. It can push in any direction — backwards to brake, forwards to drive, sideways to turn — but the total can never be more than μ × the load on it. Draw that limit as a circle and every combination of braking and turning is a point inside it.',
          'Leaned at 30°, turning alone uses 0.58 g of the 0.9 g a dry road can give, leaving only about 0.69 g for braking — not the full 0.9 g. On a wet road the whole circle shrinks to 0.5 g, and that same lean uses more than all of it.',
        ],
      },
      { type: 'illustration', illustration: 'friction-circle', caption: 'Lean and brake at the same time. Stay inside the circle — and see how small it gets on poor surfaces.' },
      {
        type: 'terms',
        heading: 'Typical grip (μ)',
        items: [
          { term: 'Dry asphalt', definition: 'About 0.9. Cold tyres and worn tread give less.' },
          { term: 'Wet asphalt', definition: 'About 0.5 — and the first rain after a dry spell brings up oil, making it worse still.' },
          { term: 'Gravel, sand, leaves', definition: 'About 0.3–0.4: the tyre rolls on loose particles instead of the road.' },
          { term: 'Wet paint, metal covers, diesel', definition: 'As low as 0.2. Cross them upright, without braking or accelerating.' },
        ],
      },
      {
        type: 'example',
        body: [
          'Halfway round a wet bend, a rider sees a stopped car and grabs the brakes while still leaned. Turning already took most of the wet grip, so the front tyre slides. The better technique: stand the motorcycle up first, then brake hard in a straight line — or, better still, ride wet bends slowly enough to keep plenty of circle in reserve.',
        ],
      },
      { type: 'explore', part: 'wheels', text: 'See the wheels and tyres, and how their condition affects grip.' },
      { type: 'cockpit', scenario: 'wet-road', caption: 'Watch a wet bend: slow on the way in, then hold about 35 km/h so the lean stays small — the friction circle has shrunk.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'What does the friction circle show?', options: [{ id: 'a', label: 'That braking and turning share the same limited grip' }, { id: 'b', label: 'The shape of the contact patch' }, { id: 'c', label: 'How fast the wheel turns' }], correctOptionId: 'a', explanation: 'The total force — braking and turning combined — can’t exceed the tyre’s grip, drawn as a circle.' },
      { id: 'q2', prompt: 'You need to brake hard while leaned in a bend. What is safest?', options: [{ id: 'a', label: 'Brake hard immediately, still leaned' }, { id: 'b', label: 'Stand the motorcycle up, then brake hard' }, { id: 'c', label: 'Lean further and brake' }], correctOptionId: 'b', explanation: 'Upright, no grip is used for turning, so all of it is available for braking.' },
      { id: 'q3', prompt: 'How should you cross a wet painted line or a metal cover?', options: [{ id: 'a', label: 'Upright, without braking or accelerating hard' }, { id: 'b', label: 'Leaned over, as quickly as possible' }, { id: 'c', label: 'Braking firmly' }], correctOptionId: 'a', explanation: 'These surfaces have very little grip; crossing them upright and smoothly asks the least of the tyres.' },
    ],
  },

  // 10 ──────────────────────────────────────────────────────────────────────────
  {
    id: 'weight-transfer',
    title: 'Weight transfer in corners',
    summary: 'How the throttle and brakes move load between the tyres — and why a steady throttle keeps you balanced.',
    durationMinutes: 7,
    objectives: ['Explain how braking and accelerating move load between the tyres', 'Explain why a steady throttle balances the motorcycle in a bend', 'Avoid sudden throttle or brake changes while leaned'],
    blocks: [
      {
        type: 'concept',
        heading: 'Load moves; the cornering job doesn’t',
        body: [
          'Braking pitches the motorcycle forward and moves load onto the front tyre; accelerating moves it to the rear. A tyre’s grip is roughly proportional to its load, so each tyre’s grip circle grows or shrinks as the load moves.',
          'In a bend, each tyre must still carry its share of the cornering force — about 45 % front, 55 % rear — whatever you do with the controls. Brake while leaned and the rear tyre loses load but keeps its cornering job, so it gets closer to sliding. Snap the throttle open and the front loses load. A steady, gentle throttle keeps the load near its natural split, and both tyres work equally.',
        ],
      },
      { type: 'illustration', illustration: 'corner-grip', caption: 'Lean into a bend, then brake or open the throttle. Watch how much of each tyre’s grip is used.' },
      {
        type: 'keyPoints',
        heading: 'Smooth inputs',
        points: [
          'Do your braking before the bend, upright.',
          'Hold a steady throttle through the bend — not closed, not opening sharply.',
          'If you must slow in a bend, roll off and brake gently, using both brakes, and be ready to stand the motorcycle up.',
          'Roll the throttle on progressively as the motorcycle stands up on the exit.',
        ],
      },
      { type: 'illustration', illustration: 'weight-transfer', caption: 'From the basics module: how far the load moves forward under braking.' },
      {
        type: 'example',
        body: [
          'Mid-bend, a nervous rider snaps the throttle shut. The motorcycle pitches forward, the front digs in, the line tightens and the lightened rear twitches. Holding a steady throttle instead, the motorcycle stays settled and the bend feels calm.',
        ],
      },
      { type: 'cockpit', scenario: 'brakes-drill', caption: 'Watch load move onto the front tyre as the brakes come on — the fork dives, the rear lightens.' },
      { type: 'cta', to: '/simulators/cockpit?practice=brakes-drill&from=/learn/handling/weight-transfer', title: 'Practise it in the cockpit', text: 'Brake and watch the load transfer on the road view.' },
      { type: 'cta', to: '/simulators/ride-and-stop', title: 'Feel the load move', text: 'Brake in the riding-and-stopping simulator and watch the load shift onto the front tyre.' },
    ],
    knowledgeCheck: [
      { id: 'q1', prompt: 'Braking hard in a bend makes which tyre most likely to slide?', options: [{ id: 'a', label: 'The rear — it loses load but still has to carry its share of the cornering force' }, { id: 'b', label: 'Neither' }, { id: 'c', label: 'The front only' }], correctOptionId: 'a', explanation: 'Load moves forward under braking. The rear tyre has less grip but the same cornering job, so it reaches its limit first. Heavy front braking while leaned is dangerous too: the front tyre is asked to brake and corner at once and can wash out.' },
      { id: 'q2', prompt: 'Why hold a steady throttle through a bend?', options: [{ id: 'a', label: 'To go as fast as possible' }, { id: 'b', label: 'It keeps the load near its natural split, so both tyres work equally' }, { id: 'c', label: 'It keeps the engine cool' }], correctOptionId: 'b', explanation: 'A steady throttle avoids pitching load forward or backward, so neither tyre is overloaded.' },
      { id: 'q3', prompt: 'What happens to the front tyre if you open the throttle hard while leaned?', options: [{ id: 'a', label: 'It gains load and grip' }, { id: 'b', label: 'It loses load, so it has less grip for its cornering job' }, { id: 'c', label: 'Nothing changes' }], correctOptionId: 'b', explanation: 'Acceleration moves load to the rear, leaving the front with less grip — it can wash out.' },
    ],
  },
]
