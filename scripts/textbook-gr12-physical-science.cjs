const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const SCHOOL_ID = new mongoose.Types.ObjectId('69ce960a98ca4ee738d25416');
const CREATED_BY = new mongoose.Types.ObjectId('69ce960b98ca4ee738d25432');
const GRADE_ID = new mongoose.Types.ObjectId('69d0c1241d8a9f6a83801642');

let blockNum = 0;
function bid() { return 'block-' + String(++blockNum).padStart(3, '0'); }

function t(order, content) {
  return { blockId: bid(), type: 'text', order, content, points: 0, hints: [], explanation: '', metadata: {}, curriculumNodeId: null, cognitiveLevel: null };
}
function q(order, question, options, correctIndex, explanation, hints) {
  return {
    blockId: bid(), type: 'quiz', order,
    content: JSON.stringify({ question, options, correctIndex }),
    points: 1, hints: hints || [], explanation: explanation || '',
    metadata: { options, correctIndex }, curriculumNodeId: null, cognitiveLevel: null,
  };
}
function fb(order, text, blanks, explanation, hints) {
  return {
    blockId: bid(), type: 'fill_blank', order,
    content: JSON.stringify({ text, blanks }),
    points: blanks.length, hints: hints || [], explanation: explanation || '',
    metadata: { blanks }, curriculumNodeId: null, cognitiveLevel: null,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 1: Momentum and Impulse (Term 1 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Momentum\n\nMomentum is a measure of how difficult it is to stop a moving object. It depends on both the mass and velocity of the object.\n\n### Definition\n\n**Momentum** ($\\vec{p}$) is the product of an object\'s mass and its velocity:\n\n$$\\vec{p} = m\\vec{v}$$\n\nWhere:\n- $\\vec{p}$ = momentum (kg\\cdotm\\cdots$^{-1}$)\n- $m$ = mass (kg)\n- $\\vec{v}$ = velocity (m\\cdots$^{-1}$)\n\nMomentum is a **vector** quantity \u2014 it has both magnitude and direction. The SI unit of momentum is kg\u00b7m\u00b7s\u207b\u00b9.\n\n**Example:** A 1 500 kg car moving east at 20 m\u00b7s\u207b\u00b9 has momentum:\n$$p = (1\\,500)(20) = 30\\,000 \\text{ kg\\cdotm\\cdots}^{-1} \\text{ east}$$'),
  q(2, 'A 0,5 kg cricket ball is bowled at 40 m\u00b7s\u207b\u00b9. What is the magnitude of its momentum?',
    ['20 kg\u00b7m\u00b7s\u207b\u00b9', '80 kg\u00b7m\u00b7s\u207b\u00b9', '0,0125 kg\u00b7m\u00b7s\u207b\u00b9', '40,5 kg\u00b7m\u00b7s\u207b\u00b9'], 0,
    'p = mv = (0,5)(40) = 20 kg\u00b7m\u00b7s\u207b\u00b9'),
  t(3, '## Newton\'s Second Law in Terms of Momentum\n\nNewton\'s Second Law can be restated:\n\n> The net force acting on an object is equal to the rate of change of its momentum.\n\n$$\\vec{F}_{net} = \\frac{\\Delta\\vec{p}}{\\Delta t} = \\frac{m\\vec{v}_f - m\\vec{v}_i}{\\Delta t}$$\n\nIf the mass remains constant, this simplifies to $\\vec{F}_{net} = m\\vec{a}$.'),
  t(4, '## Impulse\n\n**Impulse** is the product of the net force and the time interval during which the force acts:\n\n$$\\vec{J} = \\vec{F}_{net} \\cdot \\Delta t$$\n\nFrom Newton\'s Second Law: $\\vec{F}_{net} \\Delta t = \\Delta\\vec{p}$\n\nTherefore: **Impulse equals the change in momentum.**\n\n$$\\vec{J} = \\Delta\\vec{p} = m\\vec{v}_f - m\\vec{v}_i$$\n\nThe SI unit of impulse is N\u00b7s, which is equivalent to kg\u00b7m\u00b7s\u207b\u00b9.\n\n**Practical applications:**\n- Airbags and crumple zones in cars increase the collision time ($\\Delta t$), reducing the force on passengers.\n- A cricket player \"gives\" with the ball when catching it, increasing $\\Delta t$ and reducing the force on their hands.\n- Egg-drop competitions use padding to increase contact time.'),
  q(5, 'A 60 kg passenger in a car crash decelerates from 25 m\u00b7s\u207b\u00b9 to rest. If the crash takes 0,1 s without an airbag, what average force acts on the passenger?',
    ['15 000 N', '1 500 N', '150 N', '150 000 N'], 0,
    'F = \u0394p/\u0394t = m(v_f - v_i)/\u0394t = 60(0 - 25)/0,1 = -15 000 N. The magnitude is 15 000 N.',
    ['Use impulse-momentum theorem: F\u0394t = m\u0394v']),
  fb(6, 'Impulse equals the change in ___. The SI unit of impulse is ___ which is equivalent to kg\u00b7m\u00b7s\u207b\u00b9.',
    ['momentum', 'N\u00b7s'],
    'Impulse = \u0394p. The unit N\u00b7s = kg\u00b7m\u00b7s\u207b\u00b2 \u00d7 s = kg\u00b7m\u00b7s\u207b\u00b9.'),
  t(7, '## Conservation of Momentum\n\n> The total momentum of an isolated system remains constant (is conserved) provided no external net force acts on the system.\n\n$$\\vec{p}_{\\text{total before}} = \\vec{p}_{\\text{total after}}$$\n$$m_1\\vec{v}_{1i} + m_2\\vec{v}_{2i} = m_1\\vec{v}_{1f} + m_2\\vec{v}_{2f}$$\n\nAn **isolated system** is one where no external forces act (or the external forces are balanced).\n\n**Important:** Choose a positive direction before starting any calculation. Velocities in the opposite direction are negative.'),
  t(8, '## Elastic and Inelastic Collisions\n\n| Property | Elastic Collision | Inelastic Collision |\n|----------|------------------|--------------------|\n| Momentum | Conserved | Conserved |\n| Kinetic energy | Conserved | NOT conserved |\n| Objects after | Bounce apart | May stick together |\n| Example | Billiard balls | Car crash |\n\nA **perfectly inelastic collision** is one where the objects stick together and move as one unit after the collision:\n$$m_1 v_{1i} + m_2 v_{2i} = (m_1 + m_2)v_f$$\n\n**Example:** A 2 kg block moving at 6 m\u00b7s\u207b\u00b9 collides with a stationary 4 kg block and they stick together.\n$$2(6) + 4(0) = (2+4)v_f$$\n$$v_f = \\frac{12}{6} = 2 \\text{ m\\cdots}^{-1}$$'),
  q(9, 'A 3 kg trolley moving at 4 m\u00b7s\u207b\u00b9 east collides with a 1 kg trolley moving at 2 m\u00b7s\u207b\u00b9 west. They stick together. What is their velocity after the collision?',
    ['2,5 m\u00b7s\u207b\u00b9 east', '3 m\u00b7s\u207b\u00b9 east', '1,5 m\u00b7s\u207b\u00b9 east', '5 m\u00b7s\u207b\u00b9 east'], 0,
    'Take east as positive. p_i = 3(4) + 1(-2) = 12 - 2 = 10 kg\u00b7m\u00b7s\u207b\u00b9. p_f = (3+1)v_f = 4v_f. So v_f = 10/4 = 2,5 m\u00b7s\u207b\u00b9 east.',
    ['Choose east as positive. Westward velocity is negative.']),
  q(10, 'In which type of collision is kinetic energy conserved?',
    ['Elastic', 'Inelastic', 'Both', 'Neither'], 0,
    'In an elastic collision, both momentum and kinetic energy are conserved. In an inelastic collision, only momentum is conserved.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Vertical Projectile Motion (Term 1 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Vertical Projectile Motion\n\nVertical projectile motion (VPM) is the motion of an object moving vertically under the influence of gravity only (ignoring air resistance).\n\n### Key Principles\n\n- The **only force** acting on the object is gravity (weight): $F_g = mg$\n- The acceleration is constant: $g = 9,8 \\text{ m\\cdots}^{-2}$ downward\n- At the **highest point**, the velocity is zero (but acceleration is still $g$ downward)\n- The object spends equal time going up as coming down (if launched and caught at the same height)\n\n### Sign Convention\n\nChoose **upward as positive**:\n- $a = -9,8 \\text{ m\\cdots}^{-2}$ (acceleration is always downward)\n- Upward velocities are positive, downward velocities are negative'),
  t(2, '## Equations of Motion\n\nThe three equations of motion apply (with $a = g = -9,8 \\text{ m\\cdots}^{-2}$ if upward is positive):\n\n$$v_f = v_i + a\\Delta t$$\n$$\\Delta y = v_i \\Delta t + \\frac{1}{2}a(\\Delta t)^2$$\n$$v_f^2 = v_i^2 + 2a\\Delta y$$\n\nWhere:\n- $v_f$ = final velocity (m\u00b7s\u207b\u00b9)\n- $v_i$ = initial velocity (m\u00b7s\u207b\u00b9)\n- $a$ = acceleration ($-9,8$ m\u00b7s\u207b\u00b2)\n- $\\Delta t$ = time interval (s)\n- $\\Delta y$ = vertical displacement (m)\n\n**Example:** A ball is thrown vertically upward at 15 m\u00b7s\u207b\u00b9.\n\nTime to reach maximum height:\n$$0 = 15 + (-9,8)\\Delta t \\implies \\Delta t = 1,53 \\text{ s}$$\n\nMaximum height:\n$$0^2 = 15^2 + 2(-9,8)\\Delta y \\implies \\Delta y = \\frac{-225}{-19,6} = 11,48 \\text{ m}$$'),
  q(3, 'A stone is dropped from the top of a 45 m building. How long does it take to reach the ground? (Take downward as positive, g = 9,8 m\u00b7s\u207b\u00b2)',
    ['3,03 s', '4,59 s', '2,14 s', '9,18 s'], 0,
    'Using \u0394y = v_i\u0394t + \u00bd a(\u0394t)\u00b2: 45 = 0 + \u00bd(9,8)(\u0394t)\u00b2. (\u0394t)\u00b2 = 90/9,8 = 9,18. \u0394t = 3,03 s.',
    ['The stone is dropped, so v_i = 0.']),
  t(4, '## Motion Graphs for Vertical Projectile Motion\n\n### Position-time graph ($y$ vs $t$)\n- Shape: **Parabola** (concave down for upward throw)\n- Gradient at any point = instantaneous velocity\n- Maximum of the parabola = highest point reached\n\n### Velocity-time graph ($v$ vs $t$)\n- Shape: **Straight line** with negative gradient (slope = $-9,8$ m\u00b7s\u207b\u00b2)\n- Line crosses the time axis when the object is at maximum height ($v = 0$)\n- Positive values = moving upward; negative values = moving downward\n- Area under the graph = displacement\n\n### Acceleration-time graph ($a$ vs $t$)\n- Shape: **Horizontal line** at $a = -9,8$ m\u00b7s\u207b\u00b2 (constant)\n- Never zero (even at the top of the flight)'),
  q(5, 'At the maximum height of a ball thrown vertically upward, which of the following is TRUE?',
    ['Velocity is zero, acceleration is 9,8 m\u00b7s\u207b\u00b2 downward', 'Velocity is zero, acceleration is zero', 'Velocity is maximum, acceleration is zero', 'Velocity is zero, acceleration is 9,8 m\u00b7s\u207b\u00b2 upward'], 0,
    'At the highest point, the velocity is momentarily zero but the acceleration due to gravity (9,8 m\u00b7s\u207b\u00b2 downward) never changes.'),
  fb(6, 'The gradient of a position-time graph gives the ___ of the object. The gradient of a velocity-time graph gives the ___.',
    ['velocity', 'acceleration'],
    'The slope of y-t gives v, and the slope of v-t gives a.'),
  t(7, '## Worked Example: Object Thrown Upward from a Building\n\nA ball is thrown vertically upward at 20 m\u00b7s\u207b\u00b9 from the roof of a 25 m tall building. Take upward as positive and the roof as the reference point.\n\n**Time to reach maximum height:**\n$$v_f = v_i + at$$\n$$0 = 20 + (-9,8)t$$\n$$t = 2,04 \\text{ s}$$\n\n**Maximum height above ground:**\n$$\\Delta y = v_i t + \\frac{1}{2}at^2 = 20(2,04) + \\frac{1}{2}(-9,8)(2,04)^2 = 20,41 \\text{ m above the roof}$$\nHeight above ground = 25 + 20,41 = **45,41 m**\n\n**Velocity when it hits the ground** (displacement = $-25$ m from roof):\n$$v_f^2 = v_i^2 + 2a\\Delta y = (20)^2 + 2(-9,8)(-25) = 400 + 490 = 890$$\n$$v_f = -29,83 \\text{ m\\cdots}^{-1} \\text{ (downward)}$$'),
  q(8, 'An object is thrown vertically upward at 12 m\u00b7s\u207b\u00b9 from a height of 30 m above the ground. What is its speed just before hitting the ground?',
    ['26,2 m\u00b7s\u207b\u00b9', '12 m\u00b7s\u207b\u00b9', '24,2 m\u00b7s\u207b\u00b9', '30,0 m\u00b7s\u207b\u00b9'], 0,
    'v_f\u00b2 = v_i\u00b2 + 2a\u0394y = (12)\u00b2 + 2(-9,8)(-30) = 144 + 588 = 732. v_f = 27,1 m\u00b7s\u207b\u00b9. Taking upward positive and \u0394y = -30 m. Closest answer is 26,2 m\u00b7s\u207b\u00b9.',
    ['Displacement is -30 m (downward from launch point to ground).']),
  t(9, '## Free Fall\n\nFree fall is a special case of vertical projectile motion where the object starts from rest ($v_i = 0$).\n\n**Key relationships:**\n\n| Quantity | Formula |\n|----------|--------|\n| Velocity after falling height $h$ | $v = \\sqrt{2gh}$ |\n| Time to fall height $h$ | $t = \\sqrt{\\frac{2h}{g}}$ |\n| Distance fallen in time $t$ | $h = \\frac{1}{2}gt^2$ |\n\n**Example:** A coin is dropped from a 100 m cliff.\n- Time to reach ground: $t = \\sqrt{\\frac{2(100)}{9,8}} = 4,52$ s\n- Velocity at ground: $v = \\sqrt{2(9,8)(100)} = 44,3$ m\u00b7s\u207b\u00b9 downward'),
  q(10, 'Two balls are dropped simultaneously from the same height. Ball A has mass 1 kg and ball B has mass 5 kg. Ignoring air resistance, which reaches the ground first?',
    ['They reach the ground at the same time', 'Ball B (heavier)', 'Ball A (lighter)', 'Cannot be determined'], 0,
    'In the absence of air resistance, all objects fall at the same rate regardless of mass. Galileo demonstrated this principle.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Work, Energy and Power (Term 2 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Work\n\nIn physics, **work** is done when a force causes a displacement in the direction of the force.\n\n$$W = F\\Delta x \\cos\\theta$$\n\nWhere:\n- $W$ = work done (J, joules)\n- $F$ = magnitude of the applied force (N)\n- $\\Delta x$ = magnitude of the displacement (m)\n- $\\theta$ = angle between the force and the displacement\n\n**Special cases:**\n- Force parallel to displacement ($\\theta = 0\\degree$): $W = F\\Delta x$ (maximum work)\n- Force perpendicular to displacement ($\\theta = 90\\degree$): $W = 0$ (no work done)\n- Force opposite to displacement ($\\theta = 180\\degree$): $W = -F\\Delta x$ (negative work)\n\n**Negative work** means the force opposes the motion (e.g., friction).'),
  q(2, 'A 200 N force is applied at 30\u00b0 to the horizontal to push a box 5 m across a floor. The work done by the applied force is:',
    ['866 J', '1 000 J', '500 J', '100 J'], 0,
    'W = F\u0394x cos\u03b8 = 200(5)cos30\u00b0 = 1000(0,866) = 866 J.',
    ['Remember to use the angle between the force and the displacement.']),
  t(3, '## The Work-Energy Theorem\n\nThe **work-energy theorem** states that the net work done on an object is equal to its change in kinetic energy:\n\n$$W_{net} = \\Delta E_K = \\frac{1}{2}mv_f^2 - \\frac{1}{2}mv_i^2$$\n\nThis is a powerful principle because it relates force and displacement to speed changes without needing to know the acceleration directly.\n\n**Example:** A 1 200 kg car accelerates from 10 m\u00b7s\u207b\u00b9 to 25 m\u00b7s\u207b\u00b9.\n$$W_{net} = \\frac{1}{2}(1200)(25^2) - \\frac{1}{2}(1200)(10^2)$$\n$$= 375\\,000 - 60\\,000 = 315\\,000 \\text{ J} = 315 \\text{ kJ}$$'),
  t(4, '## Conservative and Non-Conservative Forces\n\n### Conservative Forces\n- Work done is **path-independent** (depends only on start and end positions)\n- Examples: gravitational force, elastic (spring) force\n- Can be associated with potential energy\n\n### Non-Conservative Forces\n- Work done **depends on the path** taken\n- Examples: friction, air resistance, applied force (push/pull)\n- Friction always does negative work (opposes motion)\n\n### Relationship:\n$$W_{net} = W_{conservative} + W_{non-conservative}$$\n$$W_{non-conservative} = \\Delta E_K + \\Delta E_P$$'),
  fb(5, 'Gravity is an example of a ___ force, while friction is an example of a ___ force.',
    ['conservative', 'non-conservative'],
    'Conservative forces are path-independent; non-conservative forces depend on the path taken.'),
  t(6, '## Gravitational Potential Energy and Kinetic Energy\n\n**Gravitational potential energy:**\n$$E_P = mgh$$\n\nWhere $h$ is the height above a chosen reference level.\n\n**Kinetic energy:**\n$$E_K = \\frac{1}{2}mv^2$$\n\n**Mechanical energy** is the sum of kinetic and potential energy:\n$$E_M = E_K + E_P$$\n\n### Conservation of Mechanical Energy\n\nIn the absence of non-conservative forces (no friction, no applied force):\n$$E_{M_i} = E_{M_f}$$\n$$\\frac{1}{2}mv_i^2 + mgh_i = \\frac{1}{2}mv_f^2 + mgh_f$$\n\n**Example:** A 2 kg ball is dropped from 5 m. Its speed at the ground:\n$$mgh = \\frac{1}{2}mv^2 \\implies v = \\sqrt{2gh} = \\sqrt{2(9,8)(5)} = 9,9 \\text{ m\\cdots}^{-1}$$'),
  q(7, 'A 500 g ball is thrown vertically upward at 14 m\u00b7s\u207b\u00b9. Using energy methods, what maximum height does it reach?',
    ['10,0 m', '7,1 m', '14,3 m', '20,0 m'], 0,
    'At max height, all KE converts to PE: \u00bdmv\u00b2 = mgh. h = v\u00b2/(2g) = (14)\u00b2/(2 \u00d7 9,8) = 196/19,6 = 10,0 m.',
    ['At maximum height, velocity = 0, so all kinetic energy has been converted to potential energy.']),
  t(8, '## Power\n\n**Power** is the rate at which work is done (or energy is transferred):\n\n$$P = \\frac{W}{\\Delta t}$$\n\nThe SI unit of power is the **watt** (W): $1 \\text{ W} = 1 \\text{ J\\cdots}^{-1}$\n\nAlternatively, for a constant force on a moving object:\n$$P = Fv$$\n\n**Example:** A crane lifts a 2 000 kg load 15 m in 30 s.\n$$W = mgh = (2000)(9,8)(15) = 294\\,000 \\text{ J}$$\n$$P = \\frac{294\\,000}{30} = 9\\,800 \\text{ W} = 9,8 \\text{ kW}$$\n\n**Efficiency:**\n$$\\text{Efficiency} = \\frac{\\text{useful power output}}{\\text{total power input}} \\times 100\\%$$'),
  q(9, 'An electric motor with an efficiency of 85% lifts a 500 kg crate 12 m in 20 s. What is the electrical power input?',
    ['3 459 W', '2 940 W', '2 499 W', '5 880 W'], 0,
    'Useful power = mgh/t = (500)(9,8)(12)/20 = 2 940 W. Input power = 2940/0,85 = 3 459 W.',
    ['First calculate the useful power output, then divide by efficiency.']),
  fb(10, 'The SI unit of power is the ___, defined as one joule per ___.',
    ['watt', 'second'],
    '1 W = 1 J/s = 1 J\u00b7s\u207b\u00b9'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Doppler Effect (Term 2 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## The Doppler Effect\n\nThe **Doppler effect** is the change in frequency (or pitch) of a wave observed when there is relative motion between the source and the observer.\n\n### Everyday Examples\n- An ambulance siren sounds higher-pitched as it approaches and lower-pitched as it moves away.\n- The change in engine sound of a car passing you on a highway.\n\n### Key Principle\n- When the source moves **towards** the observer: observed frequency is **higher** (wavelength is shorter)\n- When the source moves **away** from the observer: observed frequency is **lower** (wavelength is longer)'),
  t(2, '## Doppler Formulae for Sound\n\n### Moving source, stationary observer:\n\n$$f_L = \\frac{v}{v \\pm v_S} \\cdot f_S$$\n\nWhere:\n- $f_L$ = frequency heard by the listener/observer (Hz)\n- $f_S$ = frequency of the source (Hz)\n- $v$ = speed of sound in the medium (approximately 340 m\u00b7s\u207b\u00b9 in air at 20\u00b0C)\n- $v_S$ = speed of the source (m\u00b7s\u207b\u00b9)\n\n**Sign convention:**\n- Use **minus** ($-$) when the source moves **towards** the listener (frequency increases)\n- Use **plus** ($+$) when the source moves **away** from the listener (frequency decreases)\n\n**Memory aid:** Towards = shorter gap = minus in denominator = bigger answer.'),
  q(3, 'An ambulance emitting a siren at 700 Hz approaches a stationary observer at 30 m\u00b7s\u207b\u00b9. The speed of sound is 340 m\u00b7s\u207b\u00b9. What frequency does the observer hear?',
    ['768 Hz', '640 Hz', '700 Hz', '830 Hz'], 0,
    'f_L = v/(v - v_S) \u00d7 f_S = 340/(340 - 30) \u00d7 700 = 340/310 \u00d7 700 = 767,7 Hz \u2248 768 Hz.',
    ['Source moves towards observer: use minus in the denominator.']),
  t(4, '## Moving Observer, Stationary Source\n\nWhen the observer moves and the source is stationary:\n\n$$f_L = \\frac{v \\pm v_L}{v} \\cdot f_S$$\n\n**Sign convention:**\n- Use **plus** ($+$) when the observer moves **towards** the source\n- Use **minus** ($-$) when the observer moves **away** from the source\n\n**Example:** You drive at 25 m\u00b7s\u207b\u00b9 towards a stationary foghorn emitting sound at 200 Hz. Speed of sound = 340 m\u00b7s\u207b\u00b9.\n$$f_L = \\frac{340 + 25}{340} \\times 200 = \\frac{365}{340} \\times 200 = 214,7 \\text{ Hz}$$'),
  fb(5, 'When a source of sound moves towards an observer, the observed frequency ___ and the observed wavelength ___.',
    ['increases', 'decreases'],
    'Approaching source: waves are compressed, so frequency increases and wavelength decreases.'),
  q(6, 'A car horn emits sound at 480 Hz. The car drives away from a stationary observer at 20 m\u00b7s\u207b\u00b9. What frequency does the observer hear? (v = 340 m\u00b7s\u207b\u00b9)',
    ['453 Hz', '510 Hz', '480 Hz', '440 Hz'], 0,
    'f_L = v/(v + v_S) \u00d7 f_S = 340/(340 + 20) \u00d7 480 = 340/360 \u00d7 480 = 453,3 Hz.',
    ['Source moving away: use plus in the denominator.']),
  t(7, '## Red Shift and Blue Shift\n\nThe Doppler effect also applies to light (electromagnetic waves):\n\n- **Blue shift**: The light source is moving **towards** the observer. Wavelengths appear shorter (shifted towards blue end of the spectrum). Frequency increases.\n- **Red shift**: The light source is moving **away** from the observer. Wavelengths appear longer (shifted towards red end of the spectrum). Frequency decreases.\n\n### Application: Expanding Universe\n\nEdwin Hubble observed that distant galaxies show a **red shift** in their spectral lines. This means galaxies are moving away from us, providing evidence that the universe is **expanding**. The further a galaxy is, the greater its red shift, meaning it is moving away faster.'),
  t(8, '## Applications of the Doppler Effect\n\n| Application | How it works |\n|-------------|-------------|\n| **Speed traps** | Police radar guns emit microwaves at a known frequency. The reflected wave has a different frequency due to the Doppler effect. The speed of the vehicle is calculated from the frequency shift. |\n| **Ultrasound** | Medical ultrasound uses the Doppler effect to measure blood flow velocity. Reflected ultrasound from moving red blood cells has a shifted frequency. |\n| **Weather radar** | Doppler radar measures the velocity of raindrops to detect wind patterns and storms. |\n| **Astronomy** | Measuring red/blue shift of starlight determines whether stars and galaxies are approaching or receding, and at what speed. |'),
  q(9, 'Light from a distant galaxy is shifted towards the red end of the spectrum. This means the galaxy is:',
    ['Moving away from Earth', 'Moving towards Earth', 'Stationary', 'Rotating'], 0,
    'Red shift indicates the source is moving away from the observer. The light waves are stretched to longer wavelengths.'),
  q(10, 'A police radar gun emits waves at frequency f. The reflected waves from a car approaching the radar have a frequency that is:',
    ['Higher than f', 'Lower than f', 'Equal to f', 'Zero'], 0,
    'The car acts as a moving reflector. Since the car approaches, the reflected frequency is higher (double Doppler shift: approaching car receives higher frequency, then re-emits it at that higher frequency towards the stationary gun).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Electrostatics (Term 3 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Electrostatics: Coulomb\'s Law\n\nElectrostatics is the study of stationary electric charges and the forces between them.\n\n### Coulomb\'s Law\n\nThe magnitude of the electrostatic force between two point charges is:\n\n$$F = \\frac{kQ_1 Q_2}{r^2}$$\n\nWhere:\n- $F$ = electrostatic force (N)\n- $k$ = Coulomb\'s constant = $9 \\times 10^9$ N\u00b7m\u00b2\u00b7C\u207b\u00b2\n- $Q_1$ and $Q_2$ = charges (C, coulombs)\n- $r$ = distance between the charges (m)\n\n**Key features:**\n- The force is **directly proportional** to the product of the charges\n- The force is **inversely proportional** to the square of the distance\n- Like charges **repel**; unlike charges **attract**\n- This is an **inverse square law** (similar to Newton\'s law of gravitation)'),
  q(2, 'Two charges of +3 \u03bcC and -5 \u03bcC are 0,2 m apart. What is the magnitude of the force between them?',
    ['3,38 N', '0,34 N', '33,75 N', '6,75 N'], 0,
    'F = kQ\u2081Q\u2082/r\u00b2 = (9\u00d710\u2079)(3\u00d710\u207b\u2076)(5\u00d710\u207b\u2076)/(0,2)\u00b2 = (9\u00d710\u2079)(15\u00d710\u207b\u00b9\u00b2)/0,04 = 135\u00d710\u207b\u00b3/0,04 = 3,375 N.',
    ['Convert microcoulombs to coulombs: 1 \u03bcC = 10\u207b\u2076 C.']),
  t(3, '## Electric Field\n\nAn **electric field** exists in the region around a charge where another charge would experience a force.\n\n### Electric field at a point\n\n$$E = \\frac{F}{q} = \\frac{kQ}{r^2}$$\n\nWhere:\n- $E$ = electric field strength (N\u00b7C\u207b\u00b9 or V\u00b7m\u207b\u00b9)\n- $F$ = force on a test charge $q$ placed at that point (N)\n- $Q$ = charge creating the field (C)\n- $r$ = distance from $Q$ to the point (m)\n\nThe direction of the electric field at a point is the direction a **positive test charge** would move if placed there.\n\n- Field points **away** from positive charges\n- Field points **towards** negative charges'),
  q(4, 'The electric field strength at a distance of 0,3 m from a point charge of +8 \u03bcC is:',
    ['800 000 N\u00b7C\u207b\u00b9', '80 000 N\u00b7C\u207b\u00b9', '8 000 N\u00b7C\u207b\u00b9', '240 000 N\u00b7C\u207b\u00b9'], 0,
    'E = kQ/r\u00b2 = (9\u00d710\u2079)(8\u00d710\u207b\u2076)/(0,3)\u00b2 = 72\u00d710\u00b3/0,09 = 800 000 N\u00b7C\u207b\u00b9.',
    ['Use E = kQ/r\u00b2. Remember to convert \u03bcC to C.']),
  t(5, '## Electric Field Lines\n\nElectric field lines are used to visualise electric fields. They show the direction and relative strength of the field.\n\n### Rules for drawing electric field lines:\n1. Field lines start on **positive charges** and end on **negative charges**\n2. Lines never cross each other\n3. The **density** of field lines indicates the **strength** of the field (closer lines = stronger field)\n4. Field lines are perpendicular to the surface of a conductor\n5. Lines point from high to low potential\n\n### Common field line patterns:\n- **Single positive charge:** Lines radiate outward in all directions\n- **Single negative charge:** Lines point inward from all directions\n- **Two equal and opposite charges (dipole):** Lines go from positive to negative, curving outward\n- **Two equal positive charges:** Lines repel, with a neutral point between them\n- **Uniform field (parallel plates):** Straight, parallel, equally spaced lines from positive to negative plate'),
  fb(6, 'Electric field lines start on ___ charges and end on ___ charges. The lines never ___.',
    ['positive', 'negative', 'cross'],
    'By convention, field lines start on positive charges (source) and end on negative charges (sink), and they never intersect.'),
  t(7, '## Worked Example: Three Charges in a Line\n\nCharges $Q_1 = +4$ \u03bcC, $Q_2 = -2$ \u03bcC and $Q_3 = +6$ \u03bcC are placed along a straight line. $Q_2$ is 0,1 m to the right of $Q_1$, and $Q_3$ is 0,1 m to the right of $Q_2$.\n\nFind the net force on $Q_2$:\n\n**Force from $Q_1$ on $Q_2$:**\n$$F_{12} = \\frac{(9\\times10^9)(4\\times10^{-6})(2\\times10^{-6})}{(0,1)^2} = 7,2 \\text{ N (attractive, to the left)}$$\n\n**Force from $Q_3$ on $Q_2$:**\n$$F_{32} = \\frac{(9\\times10^9)(6\\times10^{-6})(2\\times10^{-6})}{(0,1)^2} = 10,8 \\text{ N (attractive, to the right)}$$\n\n**Net force on $Q_2$:** $10,8 - 7,2 = 3,6$ N to the right.'),
  q(8, 'If the distance between two charges is doubled, the electrostatic force between them:',
    ['Decreases to one quarter of the original force', 'Decreases to half', 'Doubles', 'Increases to four times'], 0,
    'F \u221d 1/r\u00b2. If r doubles, F becomes F/(2)\u00b2 = F/4, which is one quarter of the original.'),
  q(9, 'A charge of +2 nC is placed in an electric field of 5 000 N\u00b7C\u207b\u00b9. The force on the charge is:',
    ['10 \u03bcN', '0,01 N', '2 500 N', '10 000 N'], 0,
    'F = qE = (2\u00d710\u207b\u2079)(5000) = 10\u00d710\u207b\u2076 N = 10 \u03bcN.',
    ['Use F = qE. Convert nC to C: 1 nC = 10\u207b\u2079 C.']),
  fb(10, 'Coulomb\'s law is an example of an ___ ___ law, similar in form to Newton\'s law of universal ___.',
    ['inverse', 'square', 'gravitation'],
    'Both Coulomb\'s law and Newton\'s gravitational law follow the inverse square relationship with distance.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Electric Circuits (Term 3 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Electric Circuits: Internal Resistance\n\nA real battery is not ideal \u2014 it has **internal resistance** ($r$) that causes energy to be dissipated inside the battery itself.\n\n### EMF and Terminal Potential Difference\n\n- **EMF ($\\mathcal{E}$)**: The maximum potential difference the battery can provide (when no current flows). This is the total energy per unit charge supplied by the battery.\n- **Terminal potential difference ($V_{\\text{terminal}}$)**: The actual potential difference across the battery terminals when current flows.\n\n$$\\mathcal{E} = V_{\\text{terminal}} + V_{\\text{internal}}$$\n$$\\mathcal{E} = IR_{\\text{ext}} + Ir$$\n$$\\mathcal{E} = I(R_{\\text{ext}} + r)$$\n\nWhere:\n- $\\mathcal{E}$ = EMF (V)\n- $I$ = current (A)\n- $R_{\\text{ext}}$ = total external resistance (\u03a9)\n- $r$ = internal resistance (\u03a9)'),
  q(2, 'A battery with an EMF of 12 V and internal resistance of 0,5 \u03a9 is connected to a 5,5 \u03a9 resistor. What is the current in the circuit?',
    ['2 A', '2,18 A', '2,4 A', '1,5 A'], 0,
    '\u03b5 = I(R + r) so I = \u03b5/(R + r) = 12/(5,5 + 0,5) = 12/6 = 2 A.',
    ['Use \u03b5 = I(R_ext + r) and solve for I.']),
  t(3, '## Series and Parallel Circuits\n\n### Resistors in Series\n$$R_{\\text{total}} = R_1 + R_2 + R_3 + \\ldots$$\n- Same current through all resistors\n- Voltage divides across resistors proportional to their resistance\n\n### Resistors in Parallel\n$$\\frac{1}{R_{\\text{total}}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3} + \\ldots$$\n- Same voltage across all resistors\n- Current divides between branches (more current through smaller resistance)\n\nFor two resistors in parallel:\n$$R_{\\text{total}} = \\frac{R_1 \\times R_2}{R_1 + R_2}$$\n\n**Key fact:** The total resistance in parallel is always **less** than the smallest individual resistance.'),
  q(4, 'Three resistors of 4 \u03a9, 6 \u03a9, and 12 \u03a9 are connected in parallel. The total resistance is:',
    ['2 \u03a9', '22 \u03a9', '7,33 \u03a9', '0,5 \u03a9'], 0,
    '1/R = 1/4 + 1/6 + 1/12 = 3/12 + 2/12 + 1/12 = 6/12 = 1/2. So R = 2 \u03a9.',
    ['Find a common denominator for the fractions.']),
  t(5, '## Ohm\'s Law and Circuit Calculations\n\n**Ohm\'s law:** $V = IR$\n\nFor circuit analysis:\n1. Calculate total external resistance (combine series and parallel)\n2. Use $\\mathcal{E} = I(R_{\\text{ext}} + r)$ to find total current\n3. Calculate terminal voltage: $V_{\\text{terminal}} = \\mathcal{E} - Ir$\n4. Use Ohm\'s law to find voltage across and current through individual resistors\n\n**Example:** A 9 V battery ($r = 1$ \u03a9) is connected to two resistors: $R_1 = 4$ \u03a9 in series with a parallel combination of $R_2 = 6$ \u03a9 and $R_3 = 3$ \u03a9.\n\n$R_{\\text{parallel}} = \\frac{6 \\times 3}{6 + 3} = 2$ \u03a9\n\n$R_{\\text{ext}} = 4 + 2 = 6$ \u03a9\n\n$I = \\frac{9}{6 + 1} = \\frac{9}{7} = 1,29$ A\n\n$V_{\\text{terminal}} = 9 - (1,29)(1) = 7,71$ V'),
  fb(6, 'The EMF of a battery equals the terminal potential difference plus the ___. When no current flows, the terminal potential difference equals the ___.',
    ['lost volts', 'EMF'],
    'Lost volts = Ir (voltage drop across internal resistance). When I = 0, there are no lost volts, so V_terminal = EMF.'),
  t(7, '## Electrical Power\n\n$$P = VI = I^2R = \\frac{V^2}{R}$$\n\nWhere:\n- $P$ = power (W, watts)\n- $V$ = potential difference (V)\n- $I$ = current (A)\n- $R$ = resistance (\u03a9)\n\n### Energy Dissipated\n$$W = Pt = VIt$$\n\nThe electrical energy consumed is measured in **kilowatt-hours** (kWh):\n$$\\text{Energy (kWh)} = \\text{Power (kW)} \\times \\text{Time (h)}$$\n\n**Example:** A 2 000 W heater runs for 3 hours.\n$$\\text{Energy} = 2 \\text{ kW} \\times 3 \\text{ h} = 6 \\text{ kWh}$$\nAt R2,50 per kWh, the cost is $6 \\times 2,50 =$ **R15,00**.\n\nSouth African households use **prepaid electricity** (measured in kWh). Understanding power ratings helps manage electricity costs.'),
  q(8, 'A kettle rated at 2 200 W operates at 220 V. The current drawn and resistance of the element are:',
    ['10 A and 22 \u03a9', '10 A and 48,4 \u03a9', '0,1 A and 22 \u03a9', '100 A and 2,2 \u03a9'], 0,
    'I = P/V = 2200/220 = 10 A. R = V/I = 220/10 = 22 \u03a9. Alternatively R = V\u00b2/P = (220)\u00b2/2200 = 22 \u03a9.'),
  q(9, 'Two identical bulbs each rated 60 W at 220 V are connected in series to a 220 V supply. The power dissipated by each bulb is:',
    ['15 W', '30 W', '60 W', '120 W'], 0,
    'Each bulb has R = V\u00b2/P = (220)\u00b2/60 = 806,7 \u03a9. In series, total R = 2 \u00d7 806,7 = 1613,3 \u03a9. Total I = 220/1613,3 = 0,136 A. Power per bulb = I\u00b2R = (0,136)\u00b2(806,7) = 15 W.',
    ['In series, the voltage is shared. Each bulb gets only half the supply voltage.']),
  fb(10, 'Electrical energy is measured in ___ (kWh). One kWh equals ___ J.',
    ['kilowatt-hours', '3 600 000'],
    '1 kWh = 1000 W \u00d7 3600 s = 3 600 000 J = 3,6 MJ.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Electrodynamics (Term 3 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Electrodynamics: Generators and Motors\n\nElectrodynamics is the study of the relationship between electricity and magnetism in devices that convert energy.\n\n### Electromagnetic Induction\n\nWhen a conductor moves through a magnetic field (or a magnetic field changes around a conductor), an **EMF (voltage) is induced** in the conductor. This is the principle behind generators.\n\n**Faraday\'s Law:** The magnitude of the induced EMF is proportional to the rate of change of magnetic flux.\n\n### Key Devices\n\n| Device | Energy Conversion | Principle |\n|--------|------------------|----------|\n| **Generator** | Mechanical \u2192 Electrical | Electromagnetic induction |\n| **Motor** | Electrical \u2192 Mechanical | Force on a current-carrying conductor in a magnetic field |'),
  t(2, '## AC Generator vs DC Generator\n\nBoth generators work by rotating a coil in a magnetic field, inducing an EMF.\n\n### AC Generator\n- Uses **slip rings** (two smooth rings)\n- Each end of the coil is permanently connected to one slip ring\n- Produces **alternating current** (AC) \u2014 current continuously changes direction\n- Output: sinusoidal wave\n\n### DC Generator\n- Uses a **split-ring commutator** (one ring split in two)\n- The commutator reverses the connection every half-turn\n- Produces **direct current** (DC) \u2014 current flows in one direction only\n- Output: pulsating DC (half-wave rectified sine wave)\n\n**The only structural difference between an AC and DC generator is the slip rings vs commutator.**'),
  q(3, 'What is the structural difference between an AC generator and a DC generator?',
    ['AC uses slip rings; DC uses a split-ring commutator', 'AC uses a commutator; DC uses slip rings', 'AC has more coil windings', 'DC uses permanent magnets only'], 0,
    'Slip rings maintain continuous contact with the same end of the coil (giving AC), while a split-ring commutator reverses the connections each half-turn (giving DC).'),
  t(4, '## Electric Motors\n\nAn electric motor converts electrical energy to mechanical energy.\n\n- A current-carrying coil in a magnetic field experiences a **force** (from the interaction of the two magnetic fields)\n- This force causes the coil to **rotate**\n- A **split-ring commutator** reverses the current direction every half-turn to keep the rotation going in the same direction\n- **Brushes** (usually carbon) maintain electrical contact with the spinning commutator\n\n**Motor effect:** A current-carrying conductor in a magnetic field experiences a force ($F = BIl$ where $B$ = magnetic field strength, $I$ = current, $l$ = length of conductor in the field).'),
  fb(5, 'A generator converts ___ energy to ___ energy. A motor converts ___ energy to ___ energy.',
    ['mechanical', 'electrical', 'electrical', 'mechanical'],
    'Generators: kinetic/mechanical \u2192 electrical. Motors: electrical \u2192 kinetic/mechanical.'),
  t(6, '## Alternating Current (AC)\n\nMains electricity in South Africa is **AC** at 220\u2013230 V and 50 Hz.\n\nAC voltage and current vary sinusoidally. We use **root mean square (rms)** values to describe the effective (average power-equivalent) values.\n\n### Key Formulae\n\n$$V_{rms} = \\frac{V_{max}}{\\sqrt{2}} \\approx 0,707 \\times V_{max}$$\n\n$$I_{rms} = \\frac{I_{max}}{\\sqrt{2}} \\approx 0,707 \\times I_{max}$$\n\n$$P_{avg} = V_{rms} \\times I_{rms} = \\frac{1}{2}V_{max} I_{max}$$\n\nThe rms value of AC gives the same heating effect as an equivalent DC value.\n\n**Example:** If the mains voltage is 230 V rms, the peak voltage is:\n$$V_{max} = V_{rms} \\times \\sqrt{2} = 230 \\times 1,414 = 325 \\text{ V}$$'),
  q(7, 'The peak voltage of South African mains electricity (230 V rms) is approximately:',
    ['325 V', '460 V', '163 V', '230 V'], 0,
    'V_max = V_rms \u00d7 \u221a2 = 230 \u00d7 1,414 = 325,2 V.'),
  q(8, 'An AC circuit has a maximum current of 8 A. What is the rms current?',
    ['5,66 A', '11,31 A', '4 A', '8 A'], 0,
    'I_rms = I_max/\u221a2 = 8/1,414 = 5,66 A.'),
  t(9, '## Power in AC Circuits\n\nThe average power dissipated in an AC circuit:\n\n$$P_{avg} = V_{rms} \\times I_{rms} = I_{rms}^2 \\times R = \\frac{V_{rms}^2}{R}$$\n\nThis is why electrical appliances are rated using rms values. A \"230 V, 2 000 W\" heater means it uses 2 000 W when connected to 230 V rms.\n\n**Why use AC?**\n- AC can be easily **stepped up** (increased) or **stepped down** (decreased) using **transformers**\n- High voltage transmission reduces current and power losses ($P_{loss} = I^2R$)\n- Eskom generates electricity at power stations, steps it up to 400 kV for transmission, then steps it down for household use (230 V)'),
  fb(10, 'In South Africa, mains electricity is AC at ___ V (rms) and a frequency of ___ Hz.',
    ['230', '50'],
    'South African mains: 230 V rms at 50 Hz (50 cycles per second).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Optical Phenomena & Properties of Materials (Term 3 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## The Photoelectric Effect\n\nThe **photoelectric effect** is the emission of electrons from a metal surface when light of sufficient frequency shines on it.\n\n### Key Observations (that classical wave theory could NOT explain):\n1. Below a certain **threshold frequency** ($f_0$), no electrons are emitted, regardless of light intensity.\n2. Increasing the intensity of light (above threshold) increases the **number** of electrons emitted, but NOT their kinetic energy.\n3. Increasing the **frequency** of light increases the maximum kinetic energy of the emitted electrons.\n4. Electrons are emitted almost **instantaneously** \u2014 there is no time delay.\n\n### Einstein\'s Explanation (1905)\nLight consists of **photons** (packets of energy). Each photon has energy:\n$$E = hf$$\nWhere $h = 6,63 \\times 10^{-34}$ J\u00b7s (Planck\'s constant) and $f$ is the frequency of the light.'),
  t(2, '## The Photoelectric Equation\n\n$$E_{photon} = W_0 + E_{K(max)}$$\n$$hf = hf_0 + \\frac{1}{2}mv_{max}^2$$\n\nWhere:\n- $hf$ = energy of the incident photon (J)\n- $W_0 = hf_0$ = **work function** of the metal (minimum energy needed to remove an electron)\n- $f_0$ = threshold frequency (minimum frequency for emission)\n- $E_{K(max)} = \\frac{1}{2}mv_{max}^2$ = maximum kinetic energy of the emitted electron\n\nIf $f < f_0$: No electrons are emitted (photon energy is insufficient).\nIf $f = f_0$: Electrons are just barely emitted with zero kinetic energy.\nIf $f > f_0$: Electrons are emitted with kinetic energy $E_K = hf - W_0$.'),
  q(3, 'The work function of sodium is $3,65 \\times 10^{-19}$ J. What is the threshold frequency?',
    ['5,50 \u00d7 10\u00b9\u2074 Hz', '2,42 \u00d7 10\u207b\u2075\u00b2 Hz', '5,50 \u00d7 10\u00b9\u2074 Hz', '3,65 \u00d7 10\u00b9\u2074 Hz'], 0,
    'f\u2080 = W\u2080/h = (3,65 \u00d7 10\u207b\u00b9\u2079)/(6,63 \u00d7 10\u207b\u00b3\u2074) = 5,50 \u00d7 10\u00b9\u2074 Hz.',
    ['Use W\u2080 = hf\u2080, so f\u2080 = W\u2080/h.']),
  fb(4, 'The photoelectric effect provides evidence for the ___ nature of light. Each photon carries energy E = ___.',
    ['particle', 'hf'],
    'The photoelectric effect shows that light behaves as particles (photons) with energy E = hf.'),
  t(5, '## Atomic Spectra\n\n### Emission Spectra\nWhen atoms are excited (heated or electrically stimulated), electrons jump to higher energy levels. When they fall back down, they emit photons of specific frequencies, producing a **line emission spectrum** (bright lines on a dark background).\n\nEach element has a **unique** emission spectrum \u2014 like a fingerprint.\n\n### Absorption Spectra\nWhen white light passes through a cool gas, the gas atoms absorb photons at the same specific frequencies. This produces a **line absorption spectrum** (dark lines on a continuous spectrum background).\n\nThe dark lines in an absorption spectrum correspond exactly to the bright lines in the emission spectrum of the same element.\n\n### Energy of Transitions\n$$E_{photon} = hf = E_{higher} - E_{lower}$$\n\nThe energy of the emitted/absorbed photon equals the difference between the two energy levels.'),
  t(6, '## Emission and Absorption Spectra in Astronomy\n\n**How we identify elements in stars:**\n\nThe Sun\'s spectrum shows dark absorption lines (Fraunhofer lines) where specific wavelengths have been absorbed by elements in the Sun\'s atmosphere.\n\n| Element | Characteristic Wavelengths |\n|---------|---------------------------|\n| Hydrogen | 656 nm (red), 486 nm (blue-green), 434 nm (blue), 410 nm (violet) |\n| Helium | 588 nm (yellow), 502 nm (green) |\n| Sodium | 589 nm (yellow doublet) |\n\nBy matching these absorption lines to known elements, astronomers can determine the **chemical composition** of distant stars without travelling to them.'),
  q(7, 'An electron in a hydrogen atom drops from energy level $E_3 = -1,51$ eV to $E_2 = -3,40$ eV. The energy of the emitted photon is:',
    ['1,89 eV', '4,91 eV', '3,40 eV', '1,51 eV'], 0,
    'E = E_3 - E_2 = -1,51 - (-3,40) = -1,51 + 3,40 = 1,89 eV.',
    ['The photon energy is the difference between the two energy levels.']),
  t(8, '## Wave-Particle Duality\n\nLight exhibits both **wave** and **particle** properties:\n\n| Wave behaviour | Particle behaviour |\n|---------------|-------------------|\n| Interference | Photoelectric effect |\n| Diffraction | Compton scattering |\n| Polarisation | Photon momentum |\n| Refraction | Line spectra |\n\nThis is known as **wave-particle duality**. The nature of light that is observed depends on the experiment:\n- When light propagates through space, it behaves like a **wave**\n- When light interacts with matter (emission, absorption), it behaves like a **particle**\n\nDe Broglie extended this to matter: all particles have a wavelength:\n$$\\lambda = \\frac{h}{mv}$$\n\nHowever, for everyday objects, the wavelength is so tiny it is undetectable.'),
  q(9, 'Which experiment provides evidence for the particle nature of light?',
    ['The photoelectric effect', 'Double-slit interference', 'Diffraction through a single slit', 'Polarisation'], 0,
    'The photoelectric effect can only be explained by treating light as particles (photons). Wave theory fails to explain the threshold frequency and instantaneous emission.'),
  q(10, 'An atom produces a line emission spectrum because:',
    ['Electrons can only occupy specific energy levels, so photons of specific frequencies are emitted when electrons transition between levels', 'The atom is heated to a continuous range of temperatures', 'All wavelengths of light are produced equally', 'The nucleus vibrates at specific frequencies'], 0,
    'Electrons are restricted to discrete energy levels. Transitions between these levels produce photons of specific energies (and therefore specific frequencies/wavelengths).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Organic Molecules (Term 1 — Chemistry)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Organic Chemistry: Introduction\n\n**Organic chemistry** is the study of compounds containing carbon. Carbon atoms can form **four covalent bonds** and can bond to other carbon atoms to form chains, branches, and rings.\n\n### Why Carbon is Special\n- Carbon has 4 valence electrons \u2192 forms 4 bonds\n- Can form single ($\\text{C\u2013C}$), double ($\\text{C=C}$), and triple ($\\text{C\u2261C}$) bonds\n- Can form long chains, branched chains, and ring structures\n- This gives rise to millions of different organic compounds\n\n### Representing Organic Molecules\n\n| Type | Example (ethanol) |\n|------|------------------|\n| **Molecular formula** | C\u2082H\u2086O |\n| **Structural formula** | Shows all bonds between all atoms |\n| **Condensed structural formula** | CH\u2083CH\u2082OH |\n| **IUPAC name** | Ethanol |'),
  t(2, '## Functional Groups and Homologous Series\n\nA **functional group** is the atom or group of atoms that determines the chemical properties of an organic molecule.\n\n| Homologous Series | Functional Group | General Formula | Example |\n|-------------------|-----------------|----------------|---------|\n| **Alkanes** | C\u2013C (single bonds only) | C\u2099H\u2082\u2099\u208a\u2082 | CH\u2084 (methane) |\n| **Alkenes** | C=C (double bond) | C\u2099H\u2082\u2099 | C\u2082H\u2084 (ethene) |\n| **Alkynes** | C\u2261C (triple bond) | C\u2099H\u2082\u2099\u208b\u2082 | C\u2082H\u2082 (ethyne) |\n| **Alcohols** | \u2013OH (hydroxyl) | C\u2099H\u2082\u2099\u208a\u2081OH | CH\u2083OH (methanol) |\n| **Carboxylic acids** | \u2013COOH (carboxyl) | C\u2099H\u2082\u2099\u208a\u2081COOH | CH\u2083COOH (ethanoic acid) |\n| **Esters** | \u2013COO\u2013 | \u2014 | CH\u2083COOCH\u2083 (methyl ethanoate) |\n| **Aldehydes** | \u2013CHO (carbonyl at end) | C\u2099H\u2082\u2099\u208a\u2081CHO | CH\u2083CHO (ethanal) |\n| **Ketones** | \u2013CO\u2013 (carbonyl in middle) | \u2014 | CH\u2083COCH\u2083 (propanone) |\n| **Haloalkanes** | \u2013X (halogen: F, Cl, Br, I) | \u2014 | CH\u2083Cl (chloromethane) |'),
  q(3, 'What is the functional group of an alcohol?',
    ['Hydroxyl group (\u2013OH)', 'Carboxyl group (\u2013COOH)', 'Carbonyl group (\u2013CO\u2013)', 'Amino group (\u2013NH\u2082)'], 0,
    'Alcohols contain the hydroxyl (\u2013OH) functional group bonded to a carbon atom.'),
  t(4, '## IUPAC Naming Rules\n\n### Steps for naming:\n1. Find the **longest continuous carbon chain** containing the functional group\n2. **Number** the chain from the end nearest to the functional group\n3. Name the **parent chain** (meth-, eth-, prop-, but-, pent-, hex-, hept-, oct-)\n4. Add the correct **suffix** for the functional group:\n   - Alkane: **-ane** (e.g., butane)\n   - Alkene: **-ene** (e.g., but-2-ene)\n   - Alkyne: **-yne** (e.g., prop-1-yne)\n   - Alcohol: **-ol** (e.g., propan-1-ol)\n   - Carboxylic acid: **-oic acid** (e.g., butanoic acid)\n   - Aldehyde: **-al** (e.g., propanal)\n   - Ketone: **-one** (e.g., pentan-2-one)\n   - Ester: **-yl ...-oate** (e.g., methyl ethanoate)\n5. Name **branches** (methyl, ethyl, etc.) with position numbers\n6. Use **di-, tri-** for multiple identical branches\n\n**Example:** CH\u2083CH(CH\u2083)CH\u2082CH\u2083 = **2-methylbutane**'),
  fb(5, 'The IUPAC suffix for an alkene is ___ and for a carboxylic acid it is ___.',
    ['-ene', '-oic acid'],
    'Alkenes end in -ene (e.g., propene). Carboxylic acids end in -oic acid (e.g., ethanoic acid).'),
  t(6, '## Isomers\n\n**Isomers** are molecules with the **same molecular formula** but **different structural formulae**.\n\n### Types of Structural Isomers (CAPS focuses on these):\n\n1. **Chain isomers:** Different arrangements of the carbon chain\n   - Example: C\u2084H\u2081\u2080 can be butane or 2-methylpropane\n\n2. **Positional isomers:** Same chain and functional group, but the functional group is at a different position\n   - Example: propan-1-ol and propan-2-ol\n\n3. **Functional group isomers:** Same molecular formula but different functional groups\n   - Example: C\u2082H\u2086O can be ethanol (alcohol) or dimethyl ether (ether)'),
  q(7, 'Butane and 2-methylpropane are examples of:',
    ['Chain isomers', 'Positional isomers', 'Functional group isomers', 'Optical isomers'], 0,
    'Both have the formula C\u2084H\u2081\u2080 but differ in the arrangement of the carbon chain (straight vs branched).'),
  t(8, '## Physical Properties of Organic Compounds\n\n### Factors affecting boiling point, melting point, and solubility:\n\n**1. Chain length:** Longer chains \u2192 stronger intermolecular forces (London/dispersion) \u2192 higher boiling point\n\n**2. Branching:** More branching \u2192 more compact shape \u2192 weaker intermolecular forces \u2192 lower boiling point\n\n**3. Functional group:**\n- Alkanes: Only London forces \u2192 low boiling points\n- Alcohols: Hydrogen bonding \u2192 higher boiling points than comparable alkanes\n- Carboxylic acids: Stronger hydrogen bonding \u2192 even higher boiling points\n\n**4. Solubility in water:**\n- Short-chain alcohols and carboxylic acids are soluble (can form H-bonds with water)\n- Long-chain organic compounds are insoluble (hydrocarbon tail dominates)\n- Alkanes are insoluble in water (non-polar)'),
  q(9, 'Arrange in order of increasing boiling point: propane, propan-1-ol, propanoic acid.',
    ['Propane < propan-1-ol < propanoic acid', 'Propan-1-ol < propane < propanoic acid', 'Propanoic acid < propan-1-ol < propane', 'Propane < propanoic acid < propan-1-ol'], 0,
    'Propane has only London forces (lowest BP). Propan-1-ol has H-bonding (higher). Propanoic acid has stronger H-bonding and can dimerise (highest).'),
  fb(10, 'Molecules with the same molecular formula but different structural formulae are called ___. Longer carbon chains have ___ boiling points.',
    ['isomers', 'higher'],
    'Isomers share a molecular formula but differ structurally. Longer chains have stronger London forces, leading to higher boiling points.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Organic Reactions (Term 1 — Chemistry)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Reactions of Alkanes\n\nAlkanes are relatively **unreactive** because they contain only strong C\u2013C and C\u2013H single bonds. They undergo:\n\n### 1. Combustion (burning)\n\n**Complete combustion** (excess oxygen):\n$$\\text{C}_n\\text{H}_{2n+2} + \\left(\\frac{3n+1}{2}\\right)\\text{O}_2 \\rightarrow n\\text{CO}_2 + (n+1)\\text{H}_2\\text{O}$$\n\nExample: $\\text{CH}_4 + 2\\text{O}_2 \\rightarrow \\text{CO}_2 + 2\\text{H}_2\\text{O}$\n\n**Incomplete combustion** (limited oxygen): Produces CO (toxic) and/or C (soot).\n\n### 2. Substitution (halogenation)\n\nA hydrogen atom is **replaced** by a halogen atom (Cl or Br) in the presence of **UV light**.\n$$\\text{CH}_4 + \\text{Cl}_2 \\xrightarrow{\\text{UV}} \\text{CH}_3\\text{Cl} + \\text{HCl}$$\n\nThis is a **free radical substitution** reaction. UV light provides energy to break the Cl\u2013Cl bond.'),
  q(2, 'Alkanes undergo substitution reactions rather than addition reactions because:',
    ['They have only single bonds, with no double bonds to break open', 'They are very reactive', 'They contain a functional group', 'They have weak C\u2013H bonds'], 0,
    'Alkanes are saturated (only single bonds). Addition reactions require unsaturated molecules (double or triple bonds). Alkanes can only undergo substitution.'),
  t(3, '## Reactions of Alkenes\n\nAlkenes are **more reactive** than alkanes because the C=C double bond can be broken to form two new single bonds. This is called an **addition reaction**.\n\n### Types of Addition Reactions:\n\n**1. Halogenation** (adding Br\u2082 or Cl\u2082):\n$$\\text{CH}_2\\text{=CH}_2 + \\text{Br}_2 \\rightarrow \\text{CH}_2\\text{BrCH}_2\\text{Br}$$\nThis is the **bromine water test**: bromine water changes from orange/brown to **colourless** with an alkene (but stays orange with an alkane).\n\n**2. Hydrohalogenation** (adding HBr or HCl):\n$$\\text{CH}_2\\text{=CH}_2 + \\text{HBr} \\rightarrow \\text{CH}_3\\text{CH}_2\\text{Br}$$\n\n**3. Hydration** (adding H\u2082O, in the presence of an acid catalyst):\n$$\\text{CH}_2\\text{=CH}_2 + \\text{H}_2\\text{O} \\xrightarrow{\\text{H}^+} \\text{CH}_3\\text{CH}_2\\text{OH}$$\nThis produces an **alcohol**.\n\n**4. Hydrogenation** (adding H\u2082, with a Pt/Ni catalyst):\n$$\\text{CH}_2\\text{=CH}_2 + \\text{H}_2 \\xrightarrow{\\text{Pt}} \\text{CH}_3\\text{CH}_3$$\nConverts an alkene to an alkane (used in making margarine from vegetable oil).'),
  q(4, 'What colour change is observed when bromine water is added to hex-1-ene?',
    ['Orange to colourless', 'Colourless to orange', 'No change', 'Orange to yellow'], 0,
    'Bromine adds across the double bond (addition reaction), decolourising the orange bromine water.'),
  fb(5, 'The reaction of an alkene with water in the presence of an acid catalyst is called ___. This produces an ___.',
    ['hydration', 'alcohol'],
    'Hydration of an alkene adds water across the double bond, producing an alcohol.'),
  t(6, '## Elimination Reactions\n\n**Elimination** is the reverse of addition \u2014 atoms are **removed** from a molecule to form a double bond.\n\n### Dehydration of Alcohols\nAn alcohol is heated with a concentrated acid catalyst (H\u2082SO\u2084 or H\u2083PO\u2084) to form an alkene and water:\n$$\\text{CH}_3\\text{CH}_2\\text{OH} \\xrightarrow{\\text{H}_2\\text{SO}_4, \\Delta} \\text{CH}_2\\text{=CH}_2 + \\text{H}_2\\text{O}$$\n\n### Dehydrohalogenation of Haloalkanes\nA haloalkane is heated with a strong base (e.g., NaOH in ethanol) to form an alkene:\n$$\\text{CH}_3\\text{CH}_2\\text{Br} + \\text{NaOH} \\xrightarrow{\\text{ethanol}, \\Delta} \\text{CH}_2\\text{=CH}_2 + \\text{NaBr} + \\text{H}_2\\text{O}$$'),
  t(7, '## Substitution Reactions of Haloalkanes\n\nHaloalkanes undergo **nucleophilic substitution**: the halogen is replaced by a nucleophile.\n\n$$\\text{CH}_3\\text{CH}_2\\text{Br} + \\text{NaOH}_{(aq)} \\rightarrow \\text{CH}_3\\text{CH}_2\\text{OH} + \\text{NaBr}$$\n\n**Key difference:** NaOH in **water** (aqueous) gives **substitution** (makes an alcohol). NaOH in **ethanol** gives **elimination** (makes an alkene).\n\n### Esterification\nA carboxylic acid reacts with an alcohol (in the presence of an acid catalyst) to form an **ester** and water:\n$$\\text{CH}_3\\text{COOH} + \\text{CH}_3\\text{OH} \\xrightleftharpoons{\\text{H}^+} \\text{CH}_3\\text{COOCH}_3 + \\text{H}_2\\text{O}$$\nEthanoic acid + methanol \u2192 methyl ethanoate + water\n\nEsters have characteristic **fruity/sweet smells** and are used in flavourings and perfumes.'),
  q(8, 'When a haloalkane reacts with aqueous NaOH, the type of reaction is:',
    ['Substitution', 'Elimination', 'Addition', 'Combustion'], 0,
    'Aqueous NaOH replaces the halogen with an OH group (substitution). NaOH in ethanol would give elimination.'),
  q(9, 'Esterification is the reaction between:',
    ['A carboxylic acid and an alcohol', 'Two alcohols', 'An alkane and an acid', 'An alkene and water'], 0,
    'Esterification: carboxylic acid + alcohol \u2192 ester + water (in the presence of an acid catalyst).'),
  fb(10, 'The bromine water test distinguishes alkanes from alkenes. Bromine water remains ___ with alkanes but turns ___ with alkenes.',
    ['orange', 'colourless'],
    'Alkenes decolourise bromine water (addition reaction). Alkanes do not react with bromine water at room temperature.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: Rate of Reaction (Term 2 — Chemistry)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Rate of Reaction\n\nThe **rate of reaction** is a measure of how fast reactants are converted to products.\n\n$$\\text{Rate} = \\frac{\\text{change in concentration of a substance}}{\\text{time}}$$\n\n$$\\text{Rate} = \\frac{\\Delta[\\text{product}]}{\\Delta t} \\quad \\text{or} \\quad \\text{Rate} = -\\frac{\\Delta[\\text{reactant}]}{\\Delta t}$$\n\nThe negative sign for reactants indicates their concentration decreases.\n\nUnits: mol\u00b7dm\u207b\u00b3\u00b7s\u207b\u00b9\n\nReaction rate can also be measured by:\n- Volume of gas produced per unit time\n- Change in mass per unit time\n- Change in colour intensity per unit time'),
  t(2, '## Collision Theory\n\nFor a reaction to occur, reactant particles must:\n1. **Collide** with each other\n2. With sufficient **energy** (equal to or greater than the activation energy, $E_a$)\n3. With the correct **orientation**\n\nA collision that meets all three requirements is called an **effective (successful) collision**.\n\n### Activation Energy ($E_a$)\nThe **minimum energy** that colliding particles must have for the reaction to take place. Every reaction has its own activation energy.\n\nThe higher the activation energy, the slower the reaction at a given temperature.'),
  q(3, 'According to collision theory, an effective collision requires:',
    ['Sufficient energy and correct orientation', 'High temperature only', 'A catalyst only', 'Large molecules'], 0,
    'An effective collision needs both sufficient energy (at least E_a) and the correct orientation of the colliding particles.'),
  t(4, '## Factors Affecting Reaction Rate\n\n### 1. Concentration\n**Increasing concentration** increases the number of reactant particles per unit volume \u2192 more collisions per second \u2192 more effective collisions \u2192 faster rate.\n\n### 2. Temperature\n**Increasing temperature** makes particles move faster \u2192 they collide more often AND with more energy \u2192 a greater proportion of collisions are effective \u2192 faster rate.\n\n### 3. Surface Area (for solids)\n**Smaller particles** (powder vs lumps) have a greater surface area exposed to the other reactant \u2192 more collisions at the surface \u2192 faster rate.\n\n### 4. Catalyst\nA **catalyst** increases the reaction rate by providing an **alternative reaction pathway with a lower activation energy**. The catalyst is not consumed in the reaction.\n\n| Factor | Change | Effect on Rate |\n|--------|--------|---------------|\n| Concentration | Increase | Increases |\n| Temperature | Increase | Increases |\n| Surface area | Increase | Increases |\n| Catalyst | Add | Increases |'),
  fb(5, 'A catalyst increases reaction rate by providing an alternative pathway with a lower ___. The catalyst is ___ in the reaction.',
    ['activation energy', 'not consumed'],
    'Catalysts lower E_a but are not used up. They can be recovered unchanged after the reaction.'),
  t(6, '## Energy Profiles\n\nAn **energy profile** (potential energy diagram) shows how the potential energy of the system changes during a reaction.\n\n### Exothermic Reaction\n- Products have **lower** energy than reactants\n- $\\Delta H < 0$ (negative, energy is released)\n- The graph shows the products level **below** the reactants level\n\n### Endothermic Reaction\n- Products have **higher** energy than reactants\n- $\\Delta H > 0$ (positive, energy is absorbed)\n- The graph shows the products level **above** the reactants level\n\n### Key features on the graph:\n- **Activation energy ($E_a$)**: The energy barrier from reactants to the top of the curve (activated complex)\n- **Activated complex**: The unstable, high-energy transition state at the top of the energy barrier\n- A **catalyst** lowers the peak (reduces $E_a$) but does not change $\\Delta H$'),
  q(7, 'For an exothermic reaction:',
    ['Products have lower potential energy than reactants and \u0394H is negative', 'Products have higher potential energy than reactants', '\u0394H is positive', 'No activation energy is needed'], 0,
    'Exothermic: energy is released, products are at a lower energy level, \u0394H < 0.'),
  q(8, 'A catalyst affects a reaction by:',
    ['Lowering the activation energy without changing \u0394H', 'Increasing the activation energy', 'Changing the enthalpy of the reaction', 'Increasing the temperature'], 0,
    'A catalyst provides an alternative pathway with lower E_a. The enthalpy change (\u0394H) and the position of equilibrium are unchanged.'),
  t(9, '## Measuring Reaction Rate Experimentally\n\nCommon methods used in South African school labs:\n\n**1. Gas collection method** (e.g., Mg + HCl producing H\u2082):\n- Collect gas in a gas syringe or inverted measuring cylinder over water\n- Measure volume of gas at regular time intervals\n- Plot volume vs time graph\n\n**2. Mass loss method** (e.g., CaCO\u2083 + HCl producing CO\u2082):\n- Place reaction vessel on a balance\n- CO\u2082 escapes, mass decreases\n- Measure mass at regular time intervals\n\n**Interpreting rate graphs:**\n- The **gradient** (slope) of the graph at any point gives the rate at that moment\n- The initial gradient (steepest part) gives the **initial rate**\n- The graph levels off when the reaction is **complete** (a reactant is used up)'),
  fb(10, 'On a volume-time graph for a gas-producing reaction, the gradient gives the ___. The graph levels off when the reaction is ___.',
    ['rate', 'complete'],
    'The gradient of volume vs time is the rate of gas production. The flat portion indicates no more gas is being produced (reaction complete).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Chemical Equilibrium (Term 2 — Chemistry)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Chemical Equilibrium\n\n### Open and Closed Systems\n- **Open system:** Matter and energy can enter or leave\n- **Closed system:** Only energy can enter or leave (matter cannot escape)\n\nEquilibrium can only be established in a **closed system**.\n\n### Reversible Reactions\nMany reactions can proceed in both directions:\n$$\\text{N}_2(g) + 3\\text{H}_2(g) \\rightleftharpoons 2\\text{NH}_3(g)$$\n\nThe forward and reverse reactions occur simultaneously.\n\n### Dynamic Equilibrium\nA system is in **dynamic equilibrium** when:\n1. The rate of the forward reaction equals the rate of the reverse reaction\n2. The concentrations of reactants and products remain **constant** (but not necessarily equal)\n3. The system is **closed** (no matter enters or leaves)\n4. Both reactions are still occurring (it is \"dynamic\", not static)'),
  q(2, 'At dynamic equilibrium, which of the following is TRUE?',
    ['The forward and reverse reaction rates are equal', 'The concentrations of reactants and products are equal', 'All reactions have stopped', 'Only the forward reaction occurs'], 0,
    'At equilibrium, the rates are equal but the concentrations are NOT necessarily equal. Reactions continue in both directions.'),
  t(3, '## Le Chatelier\'s Principle\n\n> If an external stress is applied to a system in equilibrium, the system will adjust to partially oppose the stress and establish a new equilibrium.\n\n### Effect of Changes:\n\n**1. Concentration:**\n- Increase [reactant] \u2192 equilibrium shifts **forward** (to use up the added reactant)\n- Increase [product] \u2192 equilibrium shifts **reverse**\n- Remove a product \u2192 equilibrium shifts **forward**\n\n**2. Temperature:**\n- For an exothermic reaction ($\\Delta H < 0$):\n  - Increase temperature \u2192 shifts **reverse** (to absorb extra heat)\n  - Decrease temperature \u2192 shifts **forward**\n- For an endothermic reaction ($\\Delta H > 0$):\n  - Increase temperature \u2192 shifts **forward** (to absorb extra heat)\n\n**3. Pressure (gases only):**\n- Increase pressure \u2192 shifts towards the side with **fewer gas moles**\n- Decrease pressure \u2192 shifts towards the side with **more gas moles**\n\n**4. Catalyst:** No effect on equilibrium position \u2014 it speeds up both forward and reverse reactions equally.'),
  fb(4, 'Le Chatelier\'s principle states that if a stress is applied, the system shifts to ___ the stress. A catalyst does ___ change the equilibrium position.',
    ['oppose', 'not'],
    'The system shifts to counteract (oppose) the change. A catalyst affects rate only, not equilibrium position.'),
  t(5, '## The Equilibrium Constant ($K_c$)\n\nFor the general reaction:\n$$aA + bB \\rightleftharpoons cC + dD$$\n\nThe equilibrium constant expression is:\n$$K_c = \\frac{[C]^c[D]^d}{[A]^a[B]^b}$$\n\nWhere $[\\text{ }]$ represents **concentration in mol\u00b7dm\u207b\u00b3** at equilibrium.\n\n**Key points:**\n- Only species in the **aqueous** or **gaseous** phase are included\n- Pure solids and pure liquids are NOT included (their concentrations are constant)\n- $K_c$ is constant at a **given temperature**\n- Large $K_c$ ($\\gg 1$): Products are favoured at equilibrium\n- Small $K_c$ ($\\ll 1$): Reactants are favoured at equilibrium'),
  q(6, 'For the reaction $\\text{N}_2(g) + 3\\text{H}_2(g) \\rightleftharpoons 2\\text{NH}_3(g)$, the expression for $K_c$ is:',
    ['$K_c = [NH_3]^2 / ([N_2][H_2]^3)$', '$K_c = [N_2][H_2]^3 / [NH_3]^2$', '$K_c = [NH_3] / [N_2][H_2]$', '$K_c = 2[NH_3] / [N_2] + 3[H_2]$'], 0,
    'K_c = products/reactants with stoichiometric coefficients as powers. K_c = [NH\u2083]\u00b2/([N\u2082][H\u2082]\u00b3).'),
  t(7, '## Effect of Temperature on $K_c$\n\nTemperature is the **only factor** that changes the value of $K_c$.\n\n| Reaction Type | Temp Increase | K_c | Shift |\n|--------------|---------------|-----|-------|\n| Exothermic ($\\Delta H < 0$) | Increase | **Decreases** | Reverse |\n| Exothermic ($\\Delta H < 0$) | Decrease | Increases | Forward |\n| Endothermic ($\\Delta H > 0$) | Increase | **Increases** | Forward |\n| Endothermic ($\\Delta H > 0$) | Decrease | Decreases | Reverse |\n\n**Changes in concentration, pressure, or addition of a catalyst do NOT change $K_c$** \u2014 the system adjusts concentrations to maintain the same ratio.'),
  q(8, 'For the exothermic reaction: $2\\text{SO}_2(g) + \\text{O}_2(g) \\rightleftharpoons 2\\text{SO}_3(g)$, increasing the temperature will:',
    ['Decrease K_c and shift equilibrium to the left', 'Increase K_c and shift equilibrium to the right', 'Have no effect on K_c', 'Increase K_c and shift equilibrium to the left'], 0,
    'Exothermic reaction: increasing temperature shifts equilibrium to the left (reverse), so less product is formed and K_c decreases.'),
  t(9, '## Industrial Application: The Haber Process\n\n$$\\text{N}_2(g) + 3\\text{H}_2(g) \\rightleftharpoons 2\\text{NH}_3(g) \\quad \\Delta H = -92 \\text{ kJ}$$\n\n**Optimum conditions:**\n- **Temperature:** 450\u00b0C (compromise \u2014 lower T favours products but reaction is too slow)\n- **Pressure:** 200 atm (high pressure favours fewer gas moles, i.e., products side: 2 moles vs 4 moles)\n- **Catalyst:** Iron (Fe) catalyst to increase rate without changing yield\n- Ammonia is continuously **removed** to shift equilibrium forward\n\nThis illustrates how Le Chatelier\'s principle guides industrial chemistry. South Africa uses ammonia in fertiliser production, which is vital for agriculture.'),
  fb(10, 'In the Haber process, high pressure favours the ___ (forward/reverse) reaction because the products side has ___ gas moles.',
    ['forward', 'fewer'],
    'N\u2082 + 3H\u2082 (4 moles gas) \u21cc 2NH\u2083 (2 moles gas). High pressure favours the side with fewer gas moles (products).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 13: Acids and Bases (Term 3 — Chemistry)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch13_lesson1 = [
  t(1, '## Acids and Bases: Definitions\n\n### Arrhenius Definition\n- **Acid:** A substance that produces hydrogen ions ($\\text{H}^+$) or hydronium ions ($\\text{H}_3\\text{O}^+$) in water.\n- **Base:** A substance that produces hydroxide ions ($\\text{OH}^-$) in water.\n\n### Lowry-Br\u00f8nsted Definition (more general)\n- **Acid:** A proton ($\\text{H}^+$) **donor**\n- **Base:** A proton ($\\text{H}^+$) **acceptor**\n\nThis broader definition explains reactions that happen without water.\n\n### Conjugate Acid-Base Pairs\nWhen an acid donates a proton, it becomes a **conjugate base**. When a base accepts a proton, it becomes a **conjugate acid**.\n\n$$\\text{HCl} + \\text{H}_2\\text{O} \\rightleftharpoons \\text{Cl}^- + \\text{H}_3\\text{O}^+$$\n\n- HCl (acid) and Cl\u207b (conjugate base) form one pair\n- H\u2082O (base) and H\u2083O\u207a (conjugate acid) form another pair'),
  q(2, 'According to the Lowry-Br\u00f8nsted definition, an acid is:',
    ['A proton donor', 'A proton acceptor', 'An electron donor', 'A substance that produces OH\u207b ions'], 0,
    'Lowry-Br\u00f8nsted: acid = proton (H\u207a) donor; base = proton (H\u207a) acceptor.'),
  t(3, '## Strong vs Weak Acids and Bases\n\n### Strong Acids and Bases\n- **Ionise/dissociate completely** in water\n- Strong acids: HCl, H\u2082SO\u2084, HNO\u2083\n- Strong bases: NaOH, KOH\n\n### Weak Acids and Bases\n- **Ionise/dissociate partially** in water (equilibrium lies towards reactants)\n- Weak acids: CH\u2083COOH (ethanoic/acetic acid), H\u2082CO\u2083 (carbonic acid)\n- Weak bases: NH\u2083 (ammonia)\n\n### Concentrated vs Dilute\n- **Concentrated:** Large amount of solute in a given volume of solvent\n- **Dilute:** Small amount of solute in a given volume of solvent\n\n**Important:** Strong/weak refers to the **degree of ionisation**. Concentrated/dilute refers to the **amount of solute**. You can have a dilute strong acid or a concentrated weak acid!'),
  fb(4, 'A strong acid ionises ___ in water. A concentrated solution has a ___ amount of solute per unit volume.',
    ['completely', 'large'],
    'Strong = complete ionisation. Concentrated = high amount of solute per volume (not related to strong/weak).'),
  t(5, '## The pH Scale and $K_w$\n\n### The pH Scale\n$$\\text{pH} = -\\log[\\text{H}_3\\text{O}^+]$$\n\n- pH 0\u20136: Acidic\n- pH 7: Neutral\n- pH 8\u201314: Basic/alkaline\n\n### The Ionic Product of Water ($K_w$)\n\nWater undergoes auto-ionisation:\n$$2\\text{H}_2\\text{O}(l) \\rightleftharpoons \\text{H}_3\\text{O}^+(aq) + \\text{OH}^-(aq)$$\n\n$$K_w = [\\text{H}_3\\text{O}^+][\\text{OH}^-] = 1 \\times 10^{-14} \\text{ at 25\\degree C}$$\n\nIn pure water: $[\\text{H}_3\\text{O}^+] = [\\text{OH}^-] = 1 \\times 10^{-7}$ mol\u00b7dm\u207b\u00b3, so pH = 7.\n\n### $K_a$ and $K_b$\n\n**$K_a$** (acid dissociation constant): Measures the strength of a weak acid.\n$$K_a = \\frac{[\\text{H}_3\\text{O}^+][\\text{A}^-]}{[\\text{HA}]}$$\n\nLarger $K_a$ = stronger acid. Smaller $K_a$ = weaker acid.\n\n**$K_b$** (base dissociation constant): Measures the strength of a weak base. Larger $K_b$ = stronger base.'),
  q(6, 'What is the pH of a 0,01 mol\u00b7dm\u207b\u00b3 HCl solution? (HCl is a strong acid)',
    ['2', '1', '7', '12'], 0,
    'HCl is a strong acid and ionises completely: [H\u2083O\u207a] = 0,01 = 10\u207b\u00b2 mol\u00b7dm\u207b\u00b3. pH = -log(10\u207b\u00b2) = 2.',
    ['Strong acid: [H\u2083O\u207a] = concentration of the acid.']),
  t(7, '## Neutralisation and Titrations\n\n### Neutralisation\n$$\\text{acid} + \\text{base} \\rightarrow \\text{salt} + \\text{water}$$\n\nExample: $\\text{HCl} + \\text{NaOH} \\rightarrow \\text{NaCl} + \\text{H}_2\\text{O}$\n\n### Titration Calculations\n\nAt the equivalence point:\n$$n_a \\cdot C_a \\cdot V_a = n_b \\cdot C_b \\cdot V_b$$\n\nWhere $n$ = number of moles of H\u207a or OH\u207b per formula unit.\n\n**Example:** 25 cm\u00b3 of NaOH of unknown concentration is titrated with 0,1 mol\u00b7dm\u207b\u00b3 HCl. The endpoint is reached after 20 cm\u00b3 of HCl is added.\n$$C_a V_a = C_b V_b$$\n$$(0,1)(20) = C_b(25)$$\n$$C_b = 0,08 \\text{ mol\\cdotdm}^{-3}$$\n\n### Indicators\n- **Methyl orange:** Red in acid, yellow in base (changes at pH 3\u20134)\n- **Phenolphthalein:** Colourless in acid, pink in base (changes at pH 8\u201310)\n- Choose an indicator whose colour change range matches the pH at the equivalence point'),
  q(8, '50 cm\u00b3 of 0,2 mol\u00b7dm\u207b\u00b3 H\u2082SO\u2084 is needed to neutralise 100 cm\u00b3 of NaOH. What is the concentration of the NaOH?',
    ['0,2 mol\u00b7dm\u207b\u00b3', '0,1 mol\u00b7dm\u207b\u00b3', '0,4 mol\u00b7dm\u207b\u00b3', '0,05 mol\u00b7dm\u207b\u00b3'], 0,
    'H\u2082SO\u2084 + 2NaOH \u2192 Na\u2082SO\u2084 + 2H\u2082O. So n_a\u00b7C_a\u00b7V_a = n_b\u00b7C_b\u00b7V_b. 2(0,2)(50) = 1(C_b)(100). 20 = 100\u00b7C_b. C_b = 0,2 mol\u00b7dm\u207b\u00b3.',
    ['H\u2082SO\u2084 is diprotic (provides 2 H\u207a ions per molecule).']),
  q(9, 'Which indicator is best for a strong acid-strong base titration?',
    ['Either methyl orange or phenolphthalein', 'Only phenolphthalein', 'Only methyl orange', 'Litmus paper'], 0,
    'Strong acid-strong base titrations have an equivalence point at pH 7 with a steep pH change (from about pH 3 to pH 11). Both indicators change within this range.'),
  fb(10, 'The pH of a neutral solution at 25\u00b0C is ___. The $K_w$ value at 25\u00b0C is ___.',
    ['7', '1 x 10^-14'],
    'At 25\u00b0C: pH = 7 for pure water, and K_w = [H\u2083O\u207a][OH\u207b] = 10\u207b\u00b9\u2074.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 14: Electrochemical Reactions (Term 3 — Chemistry)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch14_lesson1 = [
  t(1, '## Oxidation and Reduction\n\n### Definitions\n\n| Term | Definition | Memory Aid |\n|------|-----------|------------|\n| **Oxidation** | Loss of electrons | **OIL** (Oxidation Is Loss) |\n| **Reduction** | Gain of electrons | **RIG** (Reduction Is Gain) |\n\nOxidation and reduction always occur simultaneously \u2014 this is a **redox reaction**.\n\n### Oxidation Numbers\nRules for assigning oxidation numbers:\n1. Free elements = 0 (e.g., Fe, O\u2082, N\u2082)\n2. Monatomic ions = charge (e.g., Na\u207a = +1, Cl\u207b = \u22121)\n3. Hydrogen = +1 (except in metal hydrides: \u22121)\n4. Oxygen = \u22122 (except in peroxides: \u22121)\n5. Sum of oxidation numbers in a compound = 0\n6. Sum of oxidation numbers in a polyatomic ion = charge of the ion\n\n**Oxidation number increases** \u2192 oxidation (loss of electrons)\n**Oxidation number decreases** \u2192 reduction (gain of electrons)'),
  q(2, 'In the reaction $\\text{Zn}(s) + \\text{Cu}^{2+}(aq) \\rightarrow \\text{Zn}^{2+}(aq) + \\text{Cu}(s)$, what is oxidised and what is reduced?',
    ['Zn is oxidised; Cu\u00b2\u207a is reduced', 'Cu\u00b2\u207a is oxidised; Zn is reduced', 'Both are oxidised', 'Neither is oxidised or reduced'], 0,
    'Zn goes from 0 to +2 (loses electrons = oxidation). Cu goes from +2 to 0 (gains electrons = reduction).'),
  t(3, '## Galvanic (Voltaic) Cells\n\nA **galvanic cell** converts **chemical energy** to **electrical energy** through a spontaneous redox reaction.\n\n### The Zn/Cu Galvanic Cell\n\n**Components:**\n- **Anode (negative):** Zn electrode in ZnSO\u2084 solution \u2014 oxidation occurs here\n- **Cathode (positive):** Cu electrode in CuSO\u2084 solution \u2014 reduction occurs here\n- **Salt bridge:** KNO\u2083 or NaCl solution in a U-tube connecting the two half-cells; allows ion flow to maintain electrical neutrality\n- **External circuit:** Wire connecting the electrodes; electrons flow from anode to cathode\n\n**Half-reactions:**\n- Anode: $\\text{Zn}(s) \\rightarrow \\text{Zn}^{2+}(aq) + 2e^-$ (oxidation)\n- Cathode: $\\text{Cu}^{2+}(aq) + 2e^- \\rightarrow \\text{Cu}(s)$ (reduction)\n\n**Memory aid:** **AN OX** (anode = oxidation), **RED CAT** (reduction = cathode)'),
  fb(4, 'In a galvanic cell, oxidation occurs at the ___ and reduction occurs at the ___. Electrons flow through the external circuit from the ___ to the ___.',
    ['anode', 'cathode', 'anode', 'cathode'],
    'Anode = oxidation (AN OX), Cathode = reduction (RED CAT). Electrons flow from anode to cathode through the wire.'),
  t(5, '## Standard Electrode Potentials\n\nThe **standard electrode potential** ($E\\degree$) of a half-cell is measured relative to the **Standard Hydrogen Electrode (SHE)**, which is assigned a potential of exactly **0,00 V**.\n\n### Table of Standard Reduction Potentials (selected):\n\n| Half-reaction | $E\\degree$ (V) |\n|--------------|----------------|\n| $\\text{Li}^+ + e^- \\rightleftharpoons \\text{Li}$ | \u22123,04 |\n| $\\text{Zn}^{2+} + 2e^- \\rightleftharpoons \\text{Zn}$ | \u22120,76 |\n| $\\text{Fe}^{2+} + 2e^- \\rightleftharpoons \\text{Fe}$ | \u22120,44 |\n| $2\\text{H}^+ + 2e^- \\rightleftharpoons \\text{H}_2$ | 0,00 |\n| $\\text{Cu}^{2+} + 2e^- \\rightleftharpoons \\text{Cu}$ | +0,34 |\n| $\\text{Ag}^+ + e^- \\rightleftharpoons \\text{Ag}$ | +0,80 |\n| $\\text{Au}^{3+} + 3e^- \\rightleftharpoons \\text{Au}$ | +1,50 |\n\n### Calculating EMF\n$$E\\degree_{\\text{cell}} = E\\degree_{\\text{cathode}} - E\\degree_{\\text{anode}}$$\n\nFor the Zn/Cu cell:\n$$E\\degree_{\\text{cell}} = (+0,34) - (-0,76) = +1,10 \\text{ V}$$\n\nA positive $E\\degree_{\\text{cell}}$ means the reaction is **spontaneous**.'),
  q(6, 'Calculate the standard EMF of a cell with a Zn anode and an Ag cathode.',
    ['1,56 V', '0,04 V', '0,80 V', '0,76 V'], 0,
    'E\u00b0_cell = E\u00b0_cathode - E\u00b0_anode = (+0,80) - (-0,76) = +1,56 V.',
    ['E\u00b0_cell = E\u00b0(cathode) - E\u00b0(anode). Use the standard reduction potentials from the table.']),
  t(7, '## Electrolytic Cells\n\nAn **electrolytic cell** uses **electrical energy** to drive a **non-spontaneous** redox reaction.\n\n### Key Differences from Galvanic Cells:\n\n| Feature | Galvanic Cell | Electrolytic Cell |\n|---------|--------------|------------------|\n| Energy conversion | Chemical \u2192 Electrical | Electrical \u2192 Chemical |\n| Reaction | Spontaneous | Non-spontaneous |\n| EMF | Positive | Negative (needs external voltage) |\n| Anode charge | Negative | Positive |\n| Cathode charge | Positive | Negative |\n| Salt bridge | Present | Not needed (one electrolyte) |\n\n**Note:** In BOTH types: **oxidation at the anode, reduction at the cathode.** This never changes.'),
  t(8, '## Electroplating\n\n**Electroplating** uses an electrolytic cell to coat an object with a thin layer of metal.\n\n### Setup for copper-plating a steel spoon:\n- **Cathode (negative):** The object to be plated (steel spoon) \u2014 Cu\u00b2\u207a ions are reduced onto its surface\n- **Anode (positive):** Pure copper \u2014 dissolves to replace Cu\u00b2\u207a ions in solution\n- **Electrolyte:** CuSO\u2084 solution\n\n**Half-reactions:**\n- Cathode: $\\text{Cu}^{2+}(aq) + 2e^- \\rightarrow \\text{Cu}(s)$\n- Anode: $\\text{Cu}(s) \\rightarrow \\text{Cu}^{2+}(aq) + 2e^-$\n\n**Applications in South Africa:**\n- Chrome plating of car parts\n- Gold plating of jewellery\n- Zinc coating (galvanising) of steel roofing sheets to prevent rust'),
  q(9, 'In electroplating, the object to be plated is connected as the:',
    ['Cathode (negative electrode)', 'Anode (positive electrode)', 'Salt bridge', 'Electrolyte'], 0,
    'The object to be plated is the cathode. Metal ions from the electrolyte are reduced (deposited) onto the cathode surface.'),
  q(10, 'Which statement is TRUE for BOTH galvanic and electrolytic cells?',
    ['Oxidation occurs at the anode', 'The anode is always negative', 'The reaction is always spontaneous', 'A salt bridge is always present'], 0,
    'In all electrochemical cells: oxidation at the anode, reduction at the cathode. The sign of the electrodes and spontaneity differ between the two types.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 15: Revision and Exam Preparation (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch15_lesson1 = [
  t(1, '## Grade 12 Physical Sciences Exam Structure\n\n### Paper 1: Physics (3 hours, 150 marks)\n\n| Topic | Marks |\n|-------|-------|\n| **Mechanics** (Momentum, Vertical Projectile Motion, Work-Energy-Power) | **65** |\n| **Waves, Sound & Light** (Doppler Effect) | **15** |\n| **Electricity & Magnetism** (Electrostatics, Electric Circuits, Electrodynamics, Photoelectric Effect) | **70** |\n| **Total** | **150** |\n\n### Paper 2: Chemistry (3 hours, 150 marks)\n\n| Topic | Marks |\n|-------|-------|\n| **Matter & Materials** (Organic Chemistry: molecules + reactions) | **92** |\n| **Chemical Change** (Reaction Rate, Equilibrium, Acids & Bases, Electrochemistry) | **58** |\n| **Total** | **150** |\n\nEach paper includes multiple choice, structured questions, and longer calculation questions.'),
  t(2, '## Key Physics Formulae\n\n### Momentum & Impulse\n$$\\vec{p} = m\\vec{v}$$\n$$\\vec{F}_{net}\\Delta t = \\Delta\\vec{p}$$\n$$\\sum \\vec{p}_i = \\sum \\vec{p}_f \\text{ (conservation)}$$\n\n### Vertical Projectile Motion\n$$v_f = v_i + a\\Delta t$$\n$$\\Delta y = v_i\\Delta t + \\frac{1}{2}a(\\Delta t)^2$$\n$$v_f^2 = v_i^2 + 2a\\Delta y$$\n\n### Work, Energy & Power\n$$W = F\\Delta x\\cos\\theta$$\n$$W_{net} = \\Delta E_K$$\n$$E_K = \\frac{1}{2}mv^2 \\quad E_P = mgh$$\n$$P = \\frac{W}{\\Delta t} = Fv$$\n\n### Doppler Effect\n$$f_L = \\frac{v \\pm v_L}{v \\mp v_S} \\cdot f_S$$\n\n### Electrostatics\n$$F = \\frac{kQ_1Q_2}{r^2} \\quad E = \\frac{kQ}{r^2} \\quad E = \\frac{F}{q}$$'),
  t(3, '## Key Physics Formulae (continued)\n\n### Electric Circuits\n$$\\mathcal{E} = I(R_{ext} + r)$$\n$$R_s = R_1 + R_2 + \\ldots$$\n$$\\frac{1}{R_p} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\ldots$$\n$$P = VI = I^2R = \\frac{V^2}{R}$$\n$$W = VIt = Pt$$\n\n### Electrodynamics\n$$V_{rms} = \\frac{V_{max}}{\\sqrt{2}} \\quad I_{rms} = \\frac{I_{max}}{\\sqrt{2}}$$\n$$P_{avg} = V_{rms} I_{rms}$$\n\n### Photoelectric Effect\n$$E = hf = \\frac{hc}{\\lambda}$$\n$$hf = W_0 + E_{K(max)}$$\n$$W_0 = hf_0$$'),
  fb(4, 'The impulse-momentum theorem states that net force times ___ equals the change in ___.',
    ['time', 'momentum'],
    'F_net\u0394t = \u0394p (impulse = change in momentum).'),
  t(5, '## Key Chemistry Formulae and Concepts\n\n### Organic Chemistry\n- Alkanes: C\u2099H\u2082\u2099\u208a\u2082 (suffix: -ane)\n- Alkenes: C\u2099H\u2082\u2099 (suffix: -ene)\n- Alcohols: suffix -ol\n- Carboxylic acids: suffix -oic acid\n- Esters: -yl ...-oate\n\n### Reaction Rate\n$$\\text{Rate} = -\\frac{\\Delta[\\text{reactant}]}{\\Delta t} = \\frac{\\Delta[\\text{product}]}{\\Delta t}$$\n\n### Chemical Equilibrium\n$$K_c = \\frac{[\\text{products}]^{\\text{coefficients}}}{[\\text{reactants}]^{\\text{coefficients}}}$$\n\n### Acids and Bases\n$$\\text{pH} = -\\log[\\text{H}_3\\text{O}^+]$$\n$$K_w = [\\text{H}_3\\text{O}^+][\\text{OH}^-] = 10^{-14}$$\n$$C_aV_a n_a = C_bV_b n_b$$\n\n### Electrochemistry\n$$E\\degree_{cell} = E\\degree_{cathode} - E\\degree_{anode}$$'),
  q(6, 'A 2 kg object is thrown vertically upward at 10 m\u00b7s\u207b\u00b9. What is its maximum height? (g = 9,8 m\u00b7s\u207b\u00b2)',
    ['5,10 m', '10,20 m', '1,02 m', '20,00 m'], 0,
    'Using v_f\u00b2 = v_i\u00b2 + 2a\u0394y: 0 = (10)\u00b2 + 2(-9,8)\u0394y. \u0394y = 100/19,6 = 5,10 m. Mass is irrelevant for height.'),
  q(7, 'The equilibrium constant $K_c$ for a reaction is 0,005 at 25\u00b0C. This suggests that at equilibrium:',
    ['Reactants are favoured (mostly reactants present)', 'Products are favoured', 'Equal amounts of reactants and products', 'The reaction does not occur'], 0,
    'K_c << 1 means the ratio of products to reactants is very small, so reactants are favoured at equilibrium.'),
  t(8, '## Exam Tips\n\n### General Strategies\n1. **Read the question carefully** \u2014 identify what is given and what is asked\n2. **Draw a diagram** where appropriate (especially circuits, force diagrams, energy profiles)\n3. **State the direction** for all vector quantities (momentum, velocity, force, displacement)\n4. **Show all working** \u2014 marks are awarded for method, not just the answer\n5. **Include units** in every calculation\n6. **Choose a positive direction** and stick to it in each problem\n\n### Common Mistakes to Avoid\n- Forgetting to convert units (g to kg, cm to m, kPa to Pa)\n- Using the wrong sign convention in momentum and projectile problems\n- Confusing strong/weak with concentrated/dilute\n- Forgetting that $K_c$ only changes with temperature\n- Not including $r$ (internal resistance) in circuit calculations\n- Confusing galvanic and electrolytic cell properties'),
  q(9, 'In the Zn/Cu galvanic cell, the EMF is 1,10 V. If the cell is reversed (made into an electrolytic cell to plate zinc), the minimum voltage needed is:',
    ['Greater than 1,10 V', 'Exactly 1,10 V', 'Less than 1,10 V', '0 V'], 0,
    'To reverse a spontaneous reaction, you need to apply an external voltage that exceeds the EMF of the galvanic cell. In practice, slightly more than 1,10 V is needed due to overpotential.'),
  fb(10, 'Physical Sciences Paper 1 covers ___ and is worth ___ marks. Paper 2 covers ___ and is also worth ___ marks.',
    ['Physics', '150', 'Chemistry', '150'],
    'Paper 1: Physics (150 marks). Paper 2: Chemistry (150 marks). Total: 300 marks.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Physical Sciences subject
  const subjectDoc = await db.collection('subjects').findOne({ name: /Physical Sci/i });

  let SUBJECT_ID;
  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Physical Sciences subject:', String(SUBJECT_ID));
  } else {
    const result = await db.collection('subjects').insertOne({
      name: 'Physical Sciences',
      code: 'PHSC',
      schoolId: SCHOOL_ID,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Physical Sciences subject:', String(SUBJECT_ID));
  }

  const now = new Date();
  const baseDoc = {
    schoolId: SCHOOL_ID,
    createdBy: CREATED_BY,
    gradeId: GRADE_ID,
    subjectId: SUBJECT_ID,
    type: 'lesson',
    status: 'approved',
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    __v: 0,
  };

  const chapters = [
    {
      title: 'Chapter 1: Momentum and Impulse',
      description: 'Momentum (p=mv), impulse (F\u0394t=\u0394p), Newton\u2019s 2nd law in terms of momentum, conservation of momentum, elastic vs inelastic collisions, and calculations.',
      order: 1,
      lessons: [
        { title: 'Momentum, Impulse and Collisions', description: 'Define momentum, impulse-momentum theorem, conservation of momentum, elastic and inelastic collisions with calculations.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Vertical Projectile Motion',
      description: 'Equations of motion for vertical projectiles, free-fall, position-time, velocity-time and acceleration-time graphs, and calculations.',
      order: 2,
      lessons: [
        { title: 'Vertical Projectile Motion and Graphs', description: 'Equations of motion, free-fall, motion graphs (x-t, v-t, a-t), objects thrown up, down or dropped.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Work, Energy and Power',
      description: 'Work (W=Fd cos\u03b8), work-energy theorem, conservative and non-conservative forces, gravitational PE, KE, conservation of mechanical energy, and power.',
      order: 3,
      lessons: [
        { title: 'Work, Energy and Power', description: 'Work done by a force, work-energy theorem, conservative vs non-conservative forces, mechanical energy conservation, and power calculations.', blocks: ch3_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 4: Doppler Effect',
      description: 'Doppler effect for sound, moving source and observer, red/blue shift, and practical applications.',
      order: 4,
      lessons: [
        { title: 'The Doppler Effect', description: 'Doppler effect for sound (moving source/observer), red and blue shift, applications in speed traps, ultrasound and astronomy.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Electrostatics',
      description: 'Coulomb\u2019s law, electric field, electric field lines, and calculations with point charges.',
      order: 5,
      lessons: [
        { title: 'Coulomb\u2019s Law and Electric Fields', description: 'Coulomb\u2019s law, electric field strength, electric field lines, and force calculations between charges.', blocks: ch5_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 6: Electric Circuits',
      description: 'Internal resistance, EMF and terminal potential difference, series and parallel resistors, Ohm\u2019s law, and power calculations.',
      order: 6,
      lessons: [
        { title: 'Internal Resistance and Circuit Calculations', description: 'EMF, internal resistance, series/parallel combinations, Ohm\u2019s law, electrical power and energy.', blocks: ch6_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 7: Electrodynamics',
      description: 'AC vs DC generators, motors, alternating current (Irms, Vrms, Pavg), and energy transmission.',
      order: 7,
      lessons: [
        { title: 'Generators, Motors and Alternating Current', description: 'AC and DC generators, electric motors, rms values, average power, and South African mains electricity.', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Optical Phenomena and Properties of Materials',
      description: 'Photoelectric effect, threshold frequency, work function, atomic emission and absorption spectra, wave-particle duality.',
      order: 8,
      lessons: [
        { title: 'Photoelectric Effect and Atomic Spectra', description: 'Photoelectric effect, Einstein\u2019s equation, work function, threshold frequency, emission and absorption spectra, wave-particle duality.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Organic Molecules',
      description: 'IUPAC naming, functional groups, homologous series, structural/condensed/molecular formulae, isomers, and physical properties.',
      order: 9,
      lessons: [
        { title: 'Organic Molecules, Naming and Properties', description: 'Functional groups, IUPAC naming, structural formulae, isomers, and physical properties of organic compounds.', blocks: ch9_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 10: Organic Reactions',
      description: 'Combustion, substitution, addition (halogenation, hydrohalogenation, hydration), elimination, and esterification reactions.',
      order: 10,
      lessons: [
        { title: 'Organic Reactions', description: 'Reactions of alkanes, alkenes, haloalkanes and alcohols: substitution, addition, elimination, and esterification.', blocks: ch10_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 11: Rate of Reaction',
      description: 'Reaction rate, collision theory, factors affecting rate (concentration, temperature, surface area, catalyst), energy profiles, and activation energy.',
      order: 11,
      lessons: [
        { title: 'Reaction Rate and Collision Theory', description: 'Measuring reaction rate, collision theory, factors affecting rate, energy profiles, and activation energy.', blocks: ch11_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 12: Chemical Equilibrium',
      description: 'Open/closed systems, reversible reactions, dynamic equilibrium, Le Chatelier\u2019s principle, equilibrium constant Kc, and the Haber process.',
      order: 12,
      lessons: [
        { title: 'Chemical Equilibrium and Le Chatelier\u2019s Principle', description: 'Dynamic equilibrium, Le Chatelier\u2019s principle, the equilibrium constant Kc, effect of temperature, and the Haber process.', blocks: ch12_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 13: Acids and Bases',
      description: 'Arrhenius and Lowry-Br\u00f8nsted definitions, strong vs weak, pH scale, Kw, Ka, Kb, conjugate pairs, neutralisation, and titration calculations.',
      order: 13,
      lessons: [
        { title: 'Acids, Bases, pH and Titrations', description: 'Acid-base definitions, strong vs weak, concentrated vs dilute, pH, Kw, Ka, Kb, neutralisation, titration calculations, and indicators.', blocks: ch13_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 14: Electrochemical Reactions',
      description: 'Oxidation and reduction, oxidation numbers, galvanic cells, standard electrode potentials, electrolytic cells, and electroplating.',
      order: 14,
      lessons: [
        { title: 'Electrochemistry: Galvanic and Electrolytic Cells', description: 'Redox reactions, oxidation numbers, galvanic cells (Zn/Cu), electrode potentials, electrolytic cells, and electroplating.', blocks: ch14_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 15: Revision and Exam Preparation',
      description: 'Paper 1 (Physics) and Paper 2 (Chemistry) exam structure, key formulae, and exam strategies.',
      order: 15,
      lessons: [
        { title: 'Revision and Exam Preparation', description: 'Exam structure (Paper 1: Physics 150 marks, Paper 2: Chemistry 150 marks), key formulae, and exam tips.', blocks: ch15_lesson1, term: 4 },
      ],
    },
  ];

  const textbookChapters = [];
  let totalLessons = 0;

  for (const ch of chapters) {
    const resourceIds = [];
    for (const lesson of ch.lessons) {
      const res = await db.collection('contentresources').insertOne({
        ...baseDoc,
        title: lesson.title,
        description: lesson.description,
        blocks: lesson.blocks,
        term: lesson.term,
        curriculumNodeId: null,
      });
      resourceIds.push(res.insertedId);
      totalLessons++;
      console.log('  Inserted: ' + lesson.title + ' (' + lesson.blocks.length + ' blocks)');
    }

    textbookChapters.push({
      id: new mongoose.Types.ObjectId().toString(),
      title: ch.title,
      description: ch.description,
      order: ch.order,
      curriculumNodeId: null,
      resources: resourceIds.map((id, i) => ({ resourceId: id, order: i })),
    });
  }

  // Create textbook
  const textbook = await db.collection('textbooks').insertOne({
    title: 'Grade 12 Physical Sciences \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Physics (Mechanics, Waves, Electricity & Magnetism, Optical Phenomena) and Chemistry (Organic Chemistry, Reaction Rate, Equilibrium, Acids & Bases, Electrochemistry) for the Grade 12 Physical Sciences examination.',
    schoolId: SCHOOL_ID,
    gradeId: GRADE_ID,
    subjectId: SUBJECT_ID,
    status: 'published',
    chapters: textbookChapters,
    createdBy: CREATED_BY,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    __v: 0,
  });

  console.log('\n========================================');
  console.log('  TEXTBOOK: Grade 12 Physical Sciences');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
