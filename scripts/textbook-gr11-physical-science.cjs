const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const SCHOOL_ID = new mongoose.Types.ObjectId('69ce960a98ca4ee738d25416');
const CREATED_BY = new mongoose.Types.ObjectId('69ce960b98ca4ee738d25432');
const GRADE_ID = new mongoose.Types.ObjectId('69d2c1f317b8332733f72601');

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
// CHAPTER 1: Vectors in Two Dimensions (Term 1 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Vectors in Two Dimensions\n\nIn Grade 10 you dealt mostly with vectors in one dimension (along a straight line). In Grade 11 we extend this to **two dimensions**, where vectors can act at angles to each other.\n\n### Revision: Scalars and Vectors\n\n| Scalars (magnitude only) | Vectors (magnitude + direction) |\n|---|---|\n| Distance, speed, mass, time, energy | Displacement, velocity, acceleration, force |\n\nA vector is represented by an arrow:\n- The **length** of the arrow represents the magnitude.\n- The **direction** of the arrow represents the direction of the vector.'),
  q(2, 'Which of the following is a vector quantity?',
    ['Mass', 'Temperature', 'Displacement', 'Speed'], 2,
    'Displacement has both magnitude and direction, making it a vector. Mass, temperature and speed are scalars.'),
  t(3, '## The Resultant Vector\n\nThe **resultant** of two or more vectors is the single vector that has the same effect as all the original vectors acting together.\n\n### Vectors in the Same Direction\n\nIf two forces act in the same direction, simply add them:\n$$\\vec{R} = \\vec{F}_1 + \\vec{F}_2$$\n\n### Vectors in Opposite Directions\n\nSubtract the smaller from the larger. The direction is that of the larger vector.\n\n### Vectors at Right Angles (Pythagoras)\n\nWhen two vectors are perpendicular, use the theorem of Pythagoras:\n$$R = \\sqrt{F_1^2 + F_2^2}$$\n\nThe direction is found using trigonometry:\n$$\\theta = \\tan^{-1}\\left(\\frac{F_2}{F_1}\\right)$$\n\n**Example:** A boat travels 40 km east, then 30 km north.\n$$R = \\sqrt{40^2 + 30^2} = \\sqrt{1600 + 900} = \\sqrt{2500} = 50 \\text{ km}$$\n$$\\theta = \\tan^{-1}\\left(\\frac{30}{40}\\right) = 36,87\\degree \\text{ north of east}$$'),
  q(4, 'Two forces of 6 N and 8 N act at right angles to each other. What is the magnitude of the resultant?',
    ['10 N', '14 N', '2 N', '48 N'], 0,
    'R = sqrt(6^2 + 8^2) = sqrt(36 + 64) = sqrt(100) = 10 N. This is a 3-4-5 Pythagorean triple scaled by 2.',
    ['Use the Pythagorean theorem since the forces are perpendicular.']),
  t(5, '## Graphical Method: Head-to-Tail\n\nTo find the resultant of vectors graphically:\n\n1. Choose a suitable scale (e.g., 1 cm = 10 N).\n2. Draw the first vector to scale in the correct direction.\n3. Draw the second vector starting from the **head** (tip) of the first vector.\n4. The **resultant** is the vector drawn from the **tail** of the first to the **head** of the last.\n5. Measure the length of the resultant and convert using your scale.\n6. Measure the angle with a protractor.\n\nThis method works for any number of vectors at any angle. It is sometimes called the **tail-to-head** or **polygon** method.'),
  fb(6, 'The resultant vector is drawn from the ___ of the first vector to the ___ of the last vector.',
    ['tail', 'head'],
    'In the head-to-tail method, the resultant goes from the starting point (tail of the first) to the endpoint (head of the last).'),
  t(7, '## Component Method (Resolving Vectors)\n\nAny vector can be **resolved** (broken down) into two perpendicular components:\n\n$$F_x = F\\cos\\theta$$\n$$F_y = F\\sin\\theta$$\n\nWhere $\\theta$ is the angle measured from the positive $x$-axis.\n\n### Steps for the Component Method:\n\n1. Resolve each vector into $x$ and $y$ components.\n2. Add all $x$-components: $R_x = \\sum F_x$\n3. Add all $y$-components: $R_y = \\sum F_y$\n4. Calculate the magnitude: $R = \\sqrt{R_x^2 + R_y^2}$\n5. Calculate the direction: $\\theta = \\tan^{-1}\\left(\\frac{R_y}{R_x}\\right)$\n\n**Example:** A force of 100 N acts at 60$\\degree$ to the horizontal.\n$$F_x = 100\\cos 60\\degree = 50 \\text{ N}$$\n$$F_y = 100\\sin 60\\degree = 86,6 \\text{ N}$$'),
  q(8, 'A vector of 200 N acts at 30 degrees to the positive x-axis. What is its x-component?',
    ['173,2 N', '100 N', '200 N', '141,4 N'], 0,
    'F_x = F cos theta = 200 cos 30 = 200 x 0,866 = 173,2 N.',
    ['The x-component uses cosine: F_x = F cos theta.']),
  q(9, 'Three forces act on a point: 50 N east, 30 N north, and 40 N west. What is the magnitude of the resultant?',
    ['31,6 N', '120 N', '10 N', '50 N'], 0,
    'R_x = 50 - 40 = 10 N east. R_y = 30 N north. R = sqrt(10^2 + 30^2) = sqrt(100 + 900) = sqrt(1000) = 31,6 N.',
    ['First find the net x-component (east minus west), then use Pythagoras with the y-component.']),
  fb(10, 'The x-component of a vector $F$ at angle $\\theta$ to the horizontal is $F_x = F$___$\\theta$, and the y-component is $F_y = F$___$\\theta$.',
    ['cos', 'sin'],
    'x-component uses cosine, y-component uses sine (when the angle is measured from the horizontal).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Newton's Laws (Term 1 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Newton\'s First Law of Motion (Law of Inertia)\n\n> An object continues in a state of rest or uniform motion in a straight line, unless acted upon by an unbalanced (net) external force.\n\n**Inertia** is the property of an object that resists a change in its state of motion. Mass is a measure of inertia \u2014 the greater the mass, the greater the inertia.\n\n**Examples in South African context:**\n- When a minibus taxi brakes suddenly, passengers continue moving forward (inertia).\n- A rugby ball at rest on the field stays at rest until kicked.\n- Wearing a seatbelt prevents you from continuing forward in a collision.'),
  q(2, 'A 1 200 kg car and a 10 000 kg truck are both travelling at 60 km/h. Which has more inertia?',
    ['The truck', 'The car', 'They have equal inertia', 'Cannot be determined'], 0,
    'Inertia depends on mass. The truck has more mass (10 000 kg vs 1 200 kg), so it has more inertia and is harder to stop or accelerate.'),
  t(3, '## Newton\'s Second Law of Motion\n\n> When a net force acts on an object, the object accelerates in the direction of the net force. The acceleration is directly proportional to the net force and inversely proportional to the mass.\n\n$$\\vec{F}_{net} = m\\vec{a}$$\n\nWhere:\n- $\\vec{F}_{net}$ = net (resultant) force (N)\n- $m$ = mass (kg)\n- $\\vec{a}$ = acceleration (m\\cdots$^{-2}$)\n\n**Key points:**\n- The net force and acceleration are always in the **same direction**.\n- If $\\vec{F}_{net} = 0$, then $\\vec{a} = 0$ (object is in equilibrium).\n- $1 \\text{ N} = 1 \\text{ kg}\\cdot\\text{m}\\cdot\\text{s}^{-2}$'),
  t(4, '## Force Diagrams and Free-Body Diagrams\n\n### Force Diagram\nShows ALL forces acting on an object at their correct points of application.\n\n### Free-Body Diagram\nShows the object as a dot with all forces drawn from that point. This is the diagram you use for calculations.\n\n### Common Forces:\n\n| Force | Symbol | Direction |\n|---|---|---|\n| Weight (gravity) | $\\vec{w} = m\\vec{g}$ | Downward |\n| Normal force | $\\vec{N}$ | Perpendicular to surface |\n| Friction | $\\vec{f}$ | Opposite to motion |\n| Applied force | $\\vec{F}_A$ | Direction of push/pull |\n| Tension | $\\vec{T}$ | Along the string/rope |\n\nFor an object on a **horizontal surface** with no vertical acceleration:\n$$N = mg$$ (normal force equals weight)'),
  q(5, 'A 5 kg block is pushed along a horizontal surface with a force of 30 N. If the frictional force is 10 N, what is the acceleration of the block?',
    ['4 m/s\u00b2', '6 m/s\u00b2', '2 m/s\u00b2', '8 m/s\u00b2'], 0,
    'F_net = F_applied - f = 30 - 10 = 20 N. a = F_net / m = 20 / 5 = 4 m/s\u00b2.',
    ['First find the net force by subtracting friction from the applied force, then use F = ma.']),
  t(6, '## Friction\n\nFriction is a contact force that opposes the relative motion (or tendency of motion) between two surfaces.\n\n### Static Friction ($f_s$)\n- Acts when an object is stationary but a force is trying to move it.\n- Can vary from 0 up to a maximum value: $f_{s,max} = \\mu_s N$\n\n### Kinetic (Dynamic) Friction ($f_k$)\n- Acts when an object is sliding across a surface.\n- Has a constant value: $f_k = \\mu_k N$\n- Always: $\\mu_k < \\mu_s$ (kinetic friction is less than maximum static friction)\n\nWhere:\n- $\\mu_s$ = coefficient of static friction\n- $\\mu_k$ = coefficient of kinetic friction\n- $N$ = normal force (N)\n\n**Note:** Friction does NOT depend on the surface area of contact or the speed of the object.'),
  fb(7, 'The maximum static friction is $f_{s,max} = \\mu_s \\times$ ___. Kinetic friction is always ___ than maximum static friction.',
    ['N', 'less'],
    'f_s,max = mu_s x N, and kinetic friction coefficient is always smaller than static friction coefficient.'),
  t(8, '## Newton\'s Third Law of Motion\n\n> When object A exerts a force on object B, object B simultaneously exerts an equal but opposite force on object A.\n\nThese are called **action-reaction pairs** (Newton\'s Third Law pairs).\n\n**Properties of Newton\'s Third Law pairs:**\n- Equal in magnitude\n- Opposite in direction\n- Act on **different** objects\n- Are the same type of force\n- Act simultaneously\n\n**Examples:**\n- When you push on a wall, the wall pushes back on you with an equal force.\n- Earth pulls you down (gravity); you pull Earth up with an equal force.\n- A rocket expels gas downward; the gas pushes the rocket upward.\n\n**Common mistake:** The normal force and weight of an object on a table are NOT a Newton\'s Third Law pair \u2014 they act on the same object.'),
  q(9, 'A book rests on a table. Which is the correct Newton\'s Third Law pair for the gravitational force that Earth exerts on the book?',
    ['The gravitational force the book exerts on Earth', 'The normal force of the table on the book', 'The weight of the book', 'The friction between the book and the table'], 0,
    'The reaction to Earth pulling the book down is the book pulling Earth up. These forces act on different objects (Earth and book), are equal in magnitude and opposite in direction.'),
  t(10, '## Equilibrium and Non-Equilibrium\n\n### Equilibrium ($\\vec{F}_{net} = 0$, $\\vec{a} = 0$)\n- Object is at rest OR moving at constant velocity.\n- All forces are balanced.\n\n### Non-Equilibrium ($\\vec{F}_{net} \\neq 0$, $\\vec{a} \\neq 0$)\n- Object is accelerating (speeding up, slowing down, or changing direction).\n\n**Problem-solving strategy:**\n1. Draw a free-body diagram.\n2. Choose a positive direction.\n3. Resolve forces into components if needed.\n4. Apply $\\vec{F}_{net} = m\\vec{a}$ (or $\\vec{F}_{net} = 0$ for equilibrium).\n5. Solve for the unknown.'),
  q(11, 'Two boxes are connected by a string on a frictionless surface. A force of 24 N is applied to box A (mass 4 kg). Box B has mass 8 kg. What is the tension in the string?',
    ['16 N', '8 N', '24 N', '12 N'], 0,
    'Total mass = 4 + 8 = 12 kg. a = F/m = 24/12 = 2 m/s\u00b2. For box B: T = m_B x a = 8 x 2 = 16 N.',
    ['Find the acceleration of the whole system first, then apply F = ma to one of the boxes.']),
  fb(12, 'If the net force on an object is zero, the object is in ___. Newton\'s Third Law pairs always act on ___ objects.',
    ['equilibrium', 'different'],
    'Zero net force means equilibrium (no acceleration). Third Law pairs act on two different objects.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Newton's Universal Law of Gravitation (Term 1 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Newton\'s Universal Law of Gravitation\n\n> Every particle in the universe attracts every other particle with a force that is directly proportional to the product of their masses and inversely proportional to the square of the distance between their centres.\n\n$$F = \\frac{Gm_1 m_2}{r^2}$$\n\nWhere:\n- $F$ = gravitational force (N)\n- $G$ = universal gravitational constant = $6{,}67 \\times 10^{-11}$ N\\cdotm$^2$\\cdotkg$^{-2}$\n- $m_1, m_2$ = masses of the two objects (kg)\n- $r$ = distance between the centres of the objects (m)\n\nThis is an **inverse-square law** \u2014 doubling the distance reduces the force to one quarter.'),
  q(2, 'If the distance between two objects is tripled, the gravitational force between them becomes:',
    ['One ninth of the original', 'One third of the original', 'Three times the original', 'Nine times the original'], 0,
    'F is proportional to 1/r^2. If r becomes 3r, then F becomes F/(3^2) = F/9, which is one ninth.'),
  t(3, '## Gravitational Acceleration ($g$)\n\nThe gravitational acceleration at the surface of a planet is found by combining $F = mg$ and $F = \\frac{GMm}{r^2}$:\n\n$$g = \\frac{GM}{r^2}$$\n\nWhere:\n- $M$ = mass of the planet (kg)\n- $r$ = radius of the planet (m)\n\nFor Earth: $g = 9,8 \\text{ m}\\cdot\\text{s}^{-2}$\n\n**Key insight:** $g$ depends on the mass and radius of the planet, NOT on the mass of the object.\n\n### Gravitational Acceleration on Other Planets\n\n| Planet | $g$ (m\\cdots$^{-2}$) |\n|---|---|\n| Mercury | 3,7 |\n| Venus | 8,9 |\n| Earth | 9,8 |\n| Mars | 3,7 |\n| Jupiter | 24,8 |\n| Moon | 1,6 |'),
  q(4, 'The mass of planet X is twice that of Earth, and its radius is also twice that of Earth. What is $g$ on the surface of planet X?',
    ['4,9 m/s\u00b2', '9,8 m/s\u00b2', '19,6 m/s\u00b2', '2,45 m/s\u00b2'], 0,
    'g = GM/r^2. If M becomes 2M and r becomes 2r: g = G(2M)/(2r)^2 = 2GM/(4r^2) = (1/2)(GM/r^2) = g_Earth/2 = 9,8/2 = 4,9 m/s\u00b2.',
    ['Substitute 2M for M and 2r for r into the formula g = GM/r^2.']),
  t(5, '## Weight vs Mass\n\n| Property | Mass | Weight |\n|---|---|---|\n| Definition | Amount of matter | Gravitational force on object |\n| Symbol | $m$ | $\\vec{w}$ or $F_g$ |\n| Unit | kg | N |\n| Type | Scalar | Vector (downward) |\n| Changes with location? | No | Yes |\n| Formula | \u2014 | $w = mg$ |\n\n**Example:** An astronaut with mass 80 kg:\n- On Earth: $w = 80 \\times 9,8 = 784$ N\n- On the Moon: $w = 80 \\times 1,6 = 128$ N\n- In deep space: $w \\approx 0$ N (but mass is still 80 kg!)'),
  fb(6, 'Weight is measured in ___ and is a ___ quantity. Mass is measured in ___ and does not change with location.',
    ['newtons', 'vector', 'kilograms'],
    'Weight (N) is a vector (has direction: towards centre of Earth). Mass (kg) is a scalar and is the same everywhere.'),
  q(7, 'An object weighs 588 N on Earth (g = 9,8 m/s\u00b2). What does it weigh on Mars where g = 3,7 m/s\u00b2?',
    ['222 N', '588 N', '60 N', '1 588 N'], 0,
    'First find mass: m = w/g = 588/9,8 = 60 kg. Weight on Mars: w = mg = 60 x 3,7 = 222 N.',
    ['Find the mass first using w = mg on Earth, then calculate weight on Mars with Mars g.']),
  t(8, '## Variation of $g$ with Altitude\n\nAs you move away from the surface of a planet, $g$ decreases:\n\n$$g_{\\text{altitude}} = \\frac{GM}{(R + h)^2}$$\n\nWhere $R$ is the radius of the planet and $h$ is the altitude above the surface.\n\nAt the surface ($h = 0$): $g = \\frac{GM}{R^2}$\n\n**Weightlessness:** Astronauts in orbit are NOT truly weightless. They are in continuous free fall around Earth, so they and their spacecraft accelerate at the same rate, creating the sensation of weightlessness.'),
  q(9, 'At what distance from Earth\'s centre would $g$ be reduced to $\\frac{1}{4}$ of its surface value?',
    ['Twice the radius of Earth', 'Four times the radius of Earth', 'Half the radius of Earth', 'At the surface'], 0,
    'g is proportional to 1/r^2. For g to be 1/4: 1/r^2 = 1/4 implies r^2 = 4, so r = 2R (twice the radius of Earth).'),
  fb(10, 'Newton\'s gravitational constant $G$ = ___ $\\times 10^{-11}$ N\\cdotm$^2$\\cdotkg$^{-2}$. Gravitational acceleration at a planet surface is $g$ = ___$/r^2$.',
    ['6,67', 'GM'],
    'G = 6,67 x 10^{-11} and g = GM/r^2 where M is the planet mass and r is its radius.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Electrostatics (Term 1 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Electrostatics: Coulomb\'s Law\n\nElectrostatics deals with stationary electric charges and the forces between them.\n\n### Coulomb\'s Law\n\n> The magnitude of the electrostatic force between two point charges is directly proportional to the product of the magnitudes of the charges and inversely proportional to the square of the distance between them.\n\n$$F = \\frac{kQ_1 Q_2}{r^2}$$\n\nWhere:\n- $F$ = electrostatic force (N)\n- $k$ = Coulomb\'s constant = $9 \\times 10^9$ N\\cdotm$^2$\\cdotC$^{-2}$\n- $Q_1, Q_2$ = charges (C, coulombs)\n- $r$ = distance between the charges (m)\n\nLike charges repel, unlike charges attract. The force acts along the line joining the centres of the charges.'),
  q(2, 'Two charges of +3 $\\mu$C and -5 $\\mu$C are placed 0,2 m apart. What is the magnitude of the force between them?',
    ['3,375 N', '6,75 N', '0,675 N', '33,75 N'], 0,
    'F = kQ1Q2/r^2 = (9 x 10^9)(3 x 10^-6)(5 x 10^-6)/(0,2)^2 = (9 x 10^9)(15 x 10^-12)/0,04 = 0,135/0,04 = 3,375 N.',
    ['Convert microcoulombs to coulombs: 1 muC = 1 x 10^-6 C.']),
  t(3, '## Coulomb\'s Law for Three Charges in a Line\n\nWhen three charges are arranged in a line, calculate the force on each charge due to every other charge individually, then add the forces as vectors (taking direction into account).\n\n**Example:** Charges $Q_1 = +2 \\mu$C, $Q_2 = -3 \\mu$C, and $Q_3 = +4 \\mu$C are placed along a line. $Q_1$ is at 0 m, $Q_2$ is at 0,1 m, $Q_3$ is at 0,3 m.\n\nForce on $Q_2$:\n- Due to $Q_1$: $F_{12} = \\frac{(9 \\times 10^9)(2 \\times 10^{-6})(3 \\times 10^{-6})}{(0,1)^2} = 5,4$ N (attractive, toward $Q_1$, i.e., to the left)\n- Due to $Q_3$: $F_{32} = \\frac{(9 \\times 10^9)(3 \\times 10^{-6})(4 \\times 10^{-6})}{(0,2)^2} = 2,7$ N (attractive, toward $Q_3$, i.e., to the right)\n- Net force on $Q_2$: $5,4 - 2,7 = 2,7$ N to the left'),
  q(4, 'Three point charges are in a line: $Q_A = +1 \\mu$C at 0 m, $Q_B = +1 \\mu$C at 0,1 m, and $Q_C = -1 \\mu$C at 0,2 m. What is the direction of the net force on $Q_B$?',
    ['To the right (toward Q_C)', 'To the left (toward Q_A)', 'Zero (balanced)', 'Upward'], 0,
    'Q_A repels Q_B to the right. Q_C attracts Q_B to the right. Both forces act to the right, so the net force is to the right.',
    ['Consider the sign of each charge: like charges repel, unlike attract.']),
  t(5, '## Coulomb\'s Law in Two Dimensions\n\nWhen three charges form a triangle, find the force on a charge by:\n\n1. Calculate the magnitude of the force due to each other charge using Coulomb\'s law.\n2. Draw the direction of each force (attract/repel along the line joining the charges).\n3. Resolve each force into $x$ and $y$ components.\n4. Sum the $x$-components and $y$-components separately.\n5. Find the resultant: $F_R = \\sqrt{F_x^2 + F_y^2}$ and $\\theta = \\tan^{-1}\\left(\\frac{F_y}{F_x}\\right)$\n\nThis uses the same vector addition techniques from Chapter 1.'),
  fb(6, 'Coulomb\'s constant $k$ = ___ $\\times 10^9$ N\\cdotm$^2$\\cdotC$^{-2}$. If the distance between two charges is halved, the force becomes ___ times larger.',
    ['9', 'four'],
    'k = 9 x 10^9. Since F is proportional to 1/r^2, halving r means F increases by (1/(1/2))^2 = 4.'),
  t(7, '## Electric Field\n\nAn **electric field** is a region of space in which an electric charge experiences a force.\n\n### Electric Field Strength\n\n$$E = \\frac{F}{q} = \\frac{kQ}{r^2}$$\n\nWhere:\n- $E$ = electric field strength (N\\cdotC$^{-1}$ or V\\cdotm$^{-1}$)\n- $F$ = force on test charge (N)\n- $q$ = test charge (C)\n- $Q$ = source charge creating the field (C)\n- $r$ = distance from the source charge (m)\n\nThe electric field is a **vector** \u2014 it points in the direction a positive test charge would move.\n\n**Field line rules:**\n- Start on positive charges, end on negative charges.\n- Never cross each other.\n- Closer together = stronger field.\n- Perpendicular to the surface of a conductor.'),
  q(8, 'The electric field strength at a distance of 0,3 m from a point charge of +5 $\\mu$C is:',
    ['500 000 N/C', '150 000 N/C', '50 000 N/C', '5 000 N/C'], 0,
    'E = kQ/r^2 = (9 x 10^9)(5 x 10^-6)/(0,3)^2 = 45 000/0,09 = 500 000 N/C.',
    ['Use E = kQ/r^2. Remember to convert microcoulombs to coulombs.']),
  q(9, 'Electric field lines around a positive point charge:',
    ['Radiate outward from the charge', 'Point inward toward the charge', 'Form closed loops', 'Are parallel straight lines'], 0,
    'Field lines point in the direction a positive test charge would move. Since a positive test charge is repelled by a positive source charge, the lines radiate outward.'),
  fb(10, 'Electric field strength is defined as force per unit ___. The SI unit is N/C or equivalently ___.',
    ['charge', 'V/m'],
    'E = F/q, measured in N/C (newtons per coulomb) which is the same as V/m (volts per metre).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Electromagnetism (Term 2 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Electromagnetism\n\nA current-carrying conductor produces a **magnetic field** around it. This is the link between electricity and magnetism.\n\n### Magnetic Field Around a Straight Conductor\n\nThe magnetic field lines form **concentric circles** around the conductor. Use the **right-hand rule**:\n- Point your thumb in the direction of conventional current (positive to negative).\n- Your fingers curl in the direction of the magnetic field.\n\n### Magnetic Field of a Solenoid\n\nA solenoid is a coil of wire. The field inside is nearly **uniform** (like a bar magnet). Use the right-hand rule:\n- Curl your fingers in the direction of conventional current.\n- Your thumb points toward the **north pole** of the solenoid.'),
  q(2, 'The magnetic field lines around a long straight current-carrying wire are:',
    ['Concentric circles centred on the wire', 'Straight lines parallel to the wire', 'Straight lines perpendicular to the wire', 'Randomly oriented'], 0,
    'A current-carrying straight conductor produces circular magnetic field lines that are concentric around the wire.'),
  t(3, '## Faraday\'s Law of Electromagnetic Induction\n\n> The magnitude of the induced EMF is directly proportional to the rate of change of magnetic flux linkage.\n\n$$\\varepsilon = -N\\frac{\\Delta\\phi}{\\Delta t}$$\n\nWhere:\n- $\\varepsilon$ = induced EMF (V)\n- $N$ = number of turns in the coil\n- $\\Delta\\phi$ = change in magnetic flux (Wb, weber)\n- $\\Delta t$ = time interval (s)\n\n**Magnetic flux:**\n$$\\phi = BA\\cos\\theta$$\n\nWhere:\n- $B$ = magnetic field strength (T, tesla)\n- $A$ = area of the loop (m$^2$)\n- $\\theta$ = angle between the magnetic field and the normal to the loop\n\nThe negative sign indicates the direction of the induced EMF (Lenz\'s Law).'),
  q(4, 'A coil of 200 turns has its magnetic flux changing from 0,05 Wb to 0,02 Wb in 0,1 s. What is the magnitude of the induced EMF?',
    ['60 V', '6 V', '600 V', '0,6 V'], 0,
    'EMF = N x |delta phi / delta t| = 200 x |0,02 - 0,05|/0,1 = 200 x 0,03/0,1 = 200 x 0,3 = 60 V.',
    ['Change in flux = final flux - initial flux. Take the absolute value for magnitude.']),
  t(5, '## Lenz\'s Law\n\n> The induced current flows in a direction so as to oppose the change in magnetic flux that produced it.\n\nThis is a consequence of the conservation of energy. If the induced current aided the change, it would create energy from nothing.\n\n**Applications:**\n- Moving a magnet into a coil induces a current that creates a magnetic field opposing the magnet\'s motion.\n- Pulling a magnet out reverses the induced current direction.\n- Eddy currents in metal plates (used in electromagnetic braking).'),
  fb(6, 'Faraday\'s Law states that the induced EMF is proportional to the rate of change of magnetic ___. Lenz\'s Law says the induced current ___ the change that caused it.',
    ['flux', 'opposes'],
    'EMF = -N(delta phi / delta t). The negative sign represents Lenz\'s Law: the induced current opposes the change in flux.'),
  t(7, '## Applications of Electromagnetic Induction\n\n### Generators (AC and DC)\n\nAn AC generator converts mechanical energy to electrical energy:\n- A coil rotates in a magnetic field.\n- The changing flux through the coil induces an EMF (by Faraday\'s Law).\n- Slip rings and brushes transfer the current to the external circuit.\n- The output is an alternating current (AC) that varies sinusoidally.\n\nA DC generator uses a **split-ring commutator** instead of slip rings, producing a pulsating direct current.\n\n### Transformers\n\nA transformer uses electromagnetic induction to change the voltage of AC:\n$$\\frac{V_p}{V_s} = \\frac{N_p}{N_s}$$\n\n- **Step-up** transformer: $N_s > N_p$ (increases voltage)\n- **Step-down** transformer: $N_s < N_p$ (decreases voltage)\n\nEskom uses step-up transformers for long-distance power transmission and step-down transformers to supply homes at 230 V.'),
  q(8, 'A transformer has 500 primary turns and 50 secondary turns. If the input voltage is 230 V, what is the output voltage?',
    ['23 V', '2 300 V', '230 V', '2,3 V'], 0,
    'V_s = V_p x (N_s/N_p) = 230 x (50/500) = 230 x 0,1 = 23 V. This is a step-down transformer.',
    ['Use the transformer equation: V_p/V_s = N_p/N_s.']),
  q(9, 'Which of the following will NOT increase the induced EMF in a coil?',
    ['Using a weaker magnet', 'Increasing the number of turns', 'Moving the magnet faster', 'Using a stronger magnet'], 0,
    'A weaker magnet means a smaller change in flux, which decreases the induced EMF. All other options increase it.'),
  fb(10, 'In a step-up transformer, the number of turns on the ___ coil is greater than on the ___ coil.',
    ['secondary', 'primary'],
    'Step-up: N_secondary > N_primary, which increases the output voltage.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Electric Circuits (Term 2 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Electric Circuits: Ohm\'s Law\n\n> The potential difference across a conductor is directly proportional to the current through it, provided the temperature remains constant.\n\n$$V = IR$$\n\nWhere:\n- $V$ = potential difference (V, volts)\n- $I$ = current (A, amperes)\n- $R$ = resistance ($\\Omega$, ohms)\n\nAn **ohmic conductor** obeys Ohm\'s Law (e.g., a resistor at constant temperature). A **non-ohmic conductor** does not (e.g., a light bulb, diode).'),
  q(2, 'A 12 V battery is connected to a 4 $\\Omega$ resistor. What current flows through it?',
    ['3 A', '48 A', '0,33 A', '16 A'], 0,
    'I = V/R = 12/4 = 3 A.',
    ['Rearrange Ohm\'s Law: I = V/R.']),
  t(3, '## Resistors in Series\n\nFor resistors connected in series:\n- The **current** is the same through each resistor: $I = I_1 = I_2 = I_3$\n- The **voltage** divides: $V_{total} = V_1 + V_2 + V_3$\n- Total resistance: $R_{total} = R_1 + R_2 + R_3 + \\ldots$\n\n**Example:** Three resistors of 2 $\\Omega$, 3 $\\Omega$ and 5 $\\Omega$ in series:\n$$R_{total} = 2 + 3 + 5 = 10 \\;\\Omega$$'),
  t(4, '## Resistors in Parallel\n\nFor resistors connected in parallel:\n- The **voltage** is the same across each resistor: $V = V_1 = V_2 = V_3$\n- The **current** divides: $I_{total} = I_1 + I_2 + I_3$\n- Total resistance: $\\frac{1}{R_{total}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3} + \\ldots$\n\nThe total resistance of parallel resistors is always **less than** the smallest individual resistance.\n\n**Example:** Two resistors of 6 $\\Omega$ and 3 $\\Omega$ in parallel:\n$$\\frac{1}{R_{total}} = \\frac{1}{6} + \\frac{1}{3} = \\frac{1}{6} + \\frac{2}{6} = \\frac{3}{6} = \\frac{1}{2}$$\n$$R_{total} = 2 \\;\\Omega$$'),
  q(5, 'Four resistors of 4 $\\Omega$ each are connected: two in series forming a branch, and two such branches in parallel. What is the total resistance?',
    ['4 $\\Omega$', '8 $\\Omega$', '2 $\\Omega$', '16 $\\Omega$'], 0,
    'Each series branch: 4 + 4 = 8 ohm. Two 8 ohm branches in parallel: 1/R = 1/8 + 1/8 = 2/8 = 1/4, so R = 4 ohm.',
    ['First find the resistance of each series branch, then combine the branches in parallel.']),
  t(6, '## Electrical Power and Energy\n\nElectrical power is the rate of energy transfer:\n\n$$P = IV = I^2R = \\frac{V^2}{R}$$\n\nWhere:\n- $P$ = power (W, watts)\n- $I$ = current (A)\n- $V$ = potential difference (V)\n- $R$ = resistance ($\\Omega$)\n\nElectrical energy:\n$$E = Pt = IVt$$\n\n**Eskom billing:** Electricity is billed in kilowatt-hours (kWh).\n$$1 \\text{ kWh} = 3,6 \\times 10^6 \\text{ J}$$\n\n**Example:** A 2 000 W heater runs for 3 hours:\n$$E = 2 \\text{ kW} \\times 3 \\text{ h} = 6 \\text{ kWh}$$\nAt R2,50 per kWh, the cost is R15,00.'),
  fb(7, 'In a series circuit, the ___ is the same through all components. In a parallel circuit, the ___ is the same across all branches.',
    ['current', 'voltage'],
    'Series: same current, voltage divides. Parallel: same voltage, current divides.'),
  t(8, '## Internal Resistance and EMF\n\nA real battery has an **internal resistance** ($r$) that causes some energy to be dissipated inside the battery.\n\n**EMF (electromotive force)** is the total energy per unit charge supplied by the battery:\n$$\\varepsilon = I(R + r) = V_{ext} + V_{int}$$\n\nWhere:\n- $\\varepsilon$ = EMF of the battery (V)\n- $R$ = external resistance ($\\Omega$)\n- $r$ = internal resistance ($\\Omega$)\n- $V_{ext} = IR$ = potential difference across external circuit (\"terminal voltage\")\n- $V_{int} = Ir$ = \"lost volts\" (voltage drop across internal resistance)\n\n**Key relationships:**\n$$I = \\frac{\\varepsilon}{R + r}$$\n$$V_{ext} = \\varepsilon - Ir$$\n\nAs the current increases, $V_{ext}$ decreases (more energy lost internally).'),
  q(9, 'A battery has an EMF of 12 V and an internal resistance of 0,5 $\\Omega$. When connected to a 5,5 $\\Omega$ external resistor, what is the current?',
    ['2 A', '2,18 A', '12 A', '24 A'], 0,
    'I = EMF / (R + r) = 12 / (5,5 + 0,5) = 12 / 6 = 2 A.',
    ['Use I = EMF / (R + r), where R is external resistance and r is internal resistance.']),
  q(10, 'For the battery above (EMF = 12 V, r = 0,5 $\\Omega$, I = 2 A), what is the terminal voltage?',
    ['11 V', '12 V', '10 V', '1 V'], 0,
    'V_ext = EMF - Ir = 12 - 2(0,5) = 12 - 1 = 11 V. The lost volts = 1 V.',
    ['Terminal voltage = EMF - Ir (subtract the voltage lost across internal resistance).']),
  fb(11, 'The EMF of a battery is the energy per unit ___ it supplies. The lost volts equal ___.',
    ['charge', 'Ir'],
    'EMF = energy per coulomb. Lost volts = Ir (current times internal resistance).'),
  q(12, 'What happens to the terminal voltage of a battery as the current drawn from it increases?',
    ['It decreases', 'It increases', 'It stays the same', 'It doubles'], 0,
    'V_terminal = EMF - Ir. As I increases, the lost volts (Ir) increase, so the terminal voltage decreases.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Atomic Combinations / Chemical Bonding (Term 2 — Chemistry)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Chemical Bonding\n\nAtoms bond to achieve a more stable electron configuration (usually a full outer shell / octet).\n\n### Types of Chemical Bonds\n\n| Bond Type | Between | Electron behaviour | Example |\n|---|---|---|---|\n| Covalent | Non-metal + non-metal | Electrons shared | H$_2$O, CO$_2$ |\n| Ionic | Metal + non-metal | Electrons transferred | NaCl, MgO |\n| Metallic | Metal + metal | Sea of delocalised electrons | Cu, Fe |\n\n### Electronegativity\n\nElectronegativity is the measure of an atom\'s ability to attract bonding electrons. On the Pauling scale:\n- Fluorine has the highest electronegativity (4,0).\n- Electronegativity increases across a period (left to right) and up a group.\n- The **difference** in electronegativity determines bond type:\n  - $\\Delta EN < 1{,}7$: Covalent\n  - $\\Delta EN \\geq 1{,}7$: Ionic (as a general guideline)'),
  q(2, 'Which bond would form between sodium (EN = 0,9) and chlorine (EN = 3,2)?',
    ['Ionic', 'Covalent', 'Metallic', 'No bond'], 0,
    'delta EN = 3,2 - 0,9 = 2,3. Since this is greater than 1,7, the bond is ionic (electron transfer).'),
  t(3, '## Lewis Dot Diagrams\n\nLewis structures show the valence electrons of atoms in a molecule.\n\n**Rules:**\n1. Count the total number of valence electrons.\n2. Place the least electronegative atom in the centre (never H).\n3. Connect atoms with single bonds (2 electrons each).\n4. Distribute remaining electrons as lone pairs to complete octets.\n5. If octets are incomplete, form double or triple bonds.\n\n**Examples:**\n- H$_2$O: O has 2 bonding pairs and 2 lone pairs (bent shape)\n- CO$_2$: C forms double bonds with each O (linear shape)\n- NH$_3$: N has 3 bonding pairs and 1 lone pair (trigonal pyramidal)\n- CH$_4$: C has 4 bonding pairs, no lone pairs (tetrahedral)'),
  fb(4, 'In a Lewis diagram, a bonding pair is shared between ___ atoms, while a lone pair belongs to ___ atom(s).',
    ['two', 'one'],
    'Bonding pairs are shared between two atoms. Lone pairs are non-bonding electrons on a single atom.'),
  t(5, '## Bond Polarity\n\nA **polar covalent bond** has an unequal sharing of electrons (one atom is more electronegative).\n\nA **non-polar covalent bond** has equal sharing (both atoms have the same electronegativity).\n\n**Representing polarity:**\n- Use $\\delta+$ and $\\delta-$ symbols: $\\overset{\\delta+}{\\text{H}}$\u2014$\\overset{\\delta-}{\\text{Cl}}$\n- The more electronegative atom is $\\delta-$\n\nA **polar molecule** depends on both bond polarity AND molecular shape. Symmetrical molecules (e.g., CO$_2$, CCl$_4$) can be non-polar overall even with polar bonds, because the dipoles cancel.'),
  q(6, 'Which of these molecules is non-polar despite having polar bonds?',
    ['CO$_2$', 'H$_2$O', 'NH$_3$', 'HCl'], 0,
    'CO_2 is linear and symmetrical. The two C=O bond dipoles are equal and opposite, so they cancel out, making the molecule non-polar.'),
  t(7, '## VSEPR Theory and Molecular Shapes\n\nThe **Valence Shell Electron Pair Repulsion (VSEPR)** theory predicts molecular shapes. Electron pairs around the central atom repel each other and arrange themselves as far apart as possible.\n\n| Bonding pairs | Lone pairs | Shape | Bond angle | Example |\n|---|---|---|---|---|\n| 2 | 0 | Linear | 180$\\degree$ | CO$_2$, BeCl$_2$ |\n| 3 | 0 | Trigonal planar | 120$\\degree$ | BF$_3$ |\n| 2 | 1 | Bent/Angular | $\\approx 117\\degree$ | SO$_2$ |\n| 4 | 0 | Tetrahedral | 109,5$\\degree$ | CH$_4$ |\n| 3 | 1 | Trigonal pyramidal | $\\approx 107\\degree$ | NH$_3$ |\n| 2 | 2 | Bent/Angular | $\\approx 104,5\\degree$ | H$_2$O |\n\nLone pairs occupy more space than bonding pairs, so they compress bond angles slightly.'),
  q(8, 'What is the shape of the water (H$_2$O) molecule?',
    ['Bent / Angular', 'Linear', 'Trigonal pyramidal', 'Tetrahedral'], 0,
    'Oxygen has 2 bonding pairs (to H atoms) and 2 lone pairs. The 2 lone pairs push the bonding pairs closer together, giving a bent shape with a bond angle of about 104,5 degrees.'),
  t(9, '## Intermolecular Forces (Introduction)\n\nIntermolecular forces (IMFs) are forces between molecules (not within them).\n\n| Force | Strength | Occurs in |\n|---|---|---|\n| Ion-dipole | Strongest IMF | Ions dissolved in polar solvents |\n| Hydrogen bonding | Strong | Molecules with N\u2013H, O\u2013H, or F\u2013H bonds |\n| Dipole-dipole | Moderate | Polar molecules |\n| London / Van der Waals | Weakest | All molecules (only force in non-polar molecules) |\n\n**London (dispersion) forces** arise from temporary dipoles caused by the random motion of electrons. They increase with molecular size (more electrons = stronger London forces).\n\n**Hydrogen bonds** are extra-strong dipole-dipole forces that occur when H is bonded to N, O, or F.'),
  q(10, 'Which intermolecular force is responsible for the relatively high boiling point of water?',
    ['Hydrogen bonding', 'London forces', 'Covalent bonding', 'Ionic bonding'], 0,
    'Water has O-H bonds, which means it can form hydrogen bonds. These are strong intermolecular forces that require a lot of energy to break, giving water its high boiling point.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Intermolecular Forces (Term 2 — Chemistry)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Intermolecular Forces and Physical Properties\n\nThe strength of intermolecular forces (IMFs) directly affects the physical properties of substances.\n\n### Boiling Point\n\nBoiling occurs when molecules gain enough energy to overcome IMFs and escape into the gas phase.\n\n**Stronger IMFs = higher boiling point**\n\n**Trends:**\n- Hydrogen bonding > dipole-dipole > London forces (for similar-sized molecules)\n- For London forces: larger molecules (more electrons) = stronger London forces = higher boiling point\n\n**Examples:**\n- H$_2$O (100 $\\degree$C) vs H$_2$S (-60 $\\degree$C): Water has hydrogen bonding; H$_2$S only has dipole-dipole forces.\n- CH$_4$ (-161 $\\degree$C) vs C$_4$H$_{10}$ (-1 $\\degree$C): Butane has stronger London forces due to more electrons.'),
  q(2, 'Arrange the following in order of increasing boiling point: CH$_4$, NH$_3$, He.',
    ['He < CH$_4$ < NH$_3$', 'CH$_4$ < He < NH$_3$', 'NH$_3$ < CH$_4$ < He', 'He < NH$_3$ < CH$_4$'], 0,
    'He has the weakest London forces (fewest electrons). CH_4 has stronger London forces. NH_3 has hydrogen bonding (N-H bond), giving it the highest boiling point.'),
  t(3, '## Vapour Pressure\n\nVapour pressure is the pressure exerted by a vapour in equilibrium with its liquid at a given temperature.\n\n**Weaker IMFs = higher vapour pressure** (molecules escape more easily)\n\n- Volatile substances have high vapour pressures and low boiling points.\n- Petrol evaporates faster than water because it has weaker IMFs (only London forces).\n\n**Temperature effect:** Increasing temperature increases vapour pressure (more molecules have enough energy to escape).'),
  fb(4, 'A substance with strong intermolecular forces has a ___ boiling point and a ___ vapour pressure.',
    ['high', 'low'],
    'Strong IMFs are hard to break: high energy needed to boil (high BP), fewer molecules escape (low vapour pressure).'),
  t(5, '## Solubility: Like Dissolves Like\n\nA substance dissolves in a solvent when the solute-solvent interactions are similar to (or stronger than) the solute-solute and solvent-solvent interactions.\n\n**Polar solutes dissolve in polar solvents:**\n- NaCl dissolves in water (ion-dipole interactions)\n- Sugar dissolves in water (hydrogen bonding)\n\n**Non-polar solutes dissolve in non-polar solvents:**\n- Oil dissolves in petrol (London forces)\n- Iodine (I$_2$) dissolves in CCl$_4$ (London forces)\n\n**Non-polar solutes do NOT dissolve in polar solvents:**\n- Oil does not dissolve in water\n- Wax does not dissolve in water'),
  q(6, 'Ethanol (C$_2$H$_5$OH) dissolves in both water and some non-polar solvents. This is because:',
    ['It has both a polar (-OH) group and a non-polar hydrocarbon chain', 'It is ionic', 'It is completely non-polar', 'It is a gas at room temperature'], 0,
    'Ethanol has a polar hydroxyl (-OH) group that can hydrogen bond with water, AND a non-polar ethyl (C_2H_5) group that can interact with non-polar solvents via London forces.'),
  t(7, '## Density and Viscosity\n\n### Density of Water: The Anomaly\n\nMost substances are denser as solids than as liquids. Water is an exception:\n- Ice is LESS dense than liquid water (ice floats).\n- In ice, hydrogen bonds form an open, hexagonal crystal structure with spaces.\n- Water is densest at 4 $\\degree$C.\n\nThis is critical for aquatic life in South African rivers and dams \u2014 ice forms on top, insulating the liquid water below.\n\n### Viscosity\n\n**Stronger IMFs = higher viscosity** (more resistance to flow)\n\n- Honey (hydrogen bonding) is more viscous than water.\n- Motor oil is more viscous in winter (cold) than summer (hot).'),
  fb(8, 'The rule for solubility is: ___ dissolves like. Ice floats because it is ___ dense than liquid water.',
    ['like', 'less'],
    'Polar dissolves polar, non-polar dissolves non-polar (like dissolves like). Ice has an open crystal structure, making it less dense.'),
  q(9, 'Which of the following substances would you expect to have the highest viscosity at room temperature?',
    ['Glycerol (many -OH groups)', 'Hexane (non-polar)', 'Diethyl ether (slightly polar)', 'Methane (gas)'], 0,
    'Glycerol has three -OH groups, enabling extensive hydrogen bonding, resulting in very high viscosity.'),
  q(10, 'Why does perspiration cool your body?',
    ['Evaporation requires energy to break intermolecular forces, absorbing heat from the skin', 'Sweat is cold when it leaves the body', 'The wind blows heat away', 'Water is a good conductor of heat'], 0,
    'When sweat evaporates, water molecules must break hydrogen bonds. This requires energy (latent heat of vaporisation), which is absorbed from the skin, cooling the body.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Quantitative Chemistry / The Mole (Term 3 — Chemistry)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## The Mole Concept\n\nThe **mole** (mol) is the SI unit for amount of substance. One mole contains exactly $6{,}022 \\times 10^{23}$ particles (atoms, molecules, ions, etc.). This number is called **Avogadro\'s number** ($N_A$).\n\n$$n = \\frac{N}{N_A}$$\n\nWhere:\n- $n$ = number of moles (mol)\n- $N$ = number of particles\n- $N_A = 6{,}022 \\times 10^{23}$ mol$^{-1}$\n\n**Example:** How many molecules are in 2 moles of water?\n$$N = nN_A = 2 \\times 6{,}022 \\times 10^{23} = 1{,}204 \\times 10^{24} \\text{ molecules}$$'),
  q(2, 'How many atoms are in 0,5 mol of helium gas?',
    ['3,011 $\\times$ 10$^{23}$', '6,022 $\\times$ 10$^{23}$', '1,204 $\\times$ 10$^{24}$', '3,011 $\\times$ 10$^{22}$'], 0,
    'Helium is monatomic. N = nN_A = 0,5 x 6,022 x 10^23 = 3,011 x 10^23 atoms.'),
  t(3, '## Molar Mass\n\nThe **molar mass** ($M$) is the mass of one mole of a substance, measured in g\\cdotmol$^{-1}$.\n\n$$n = \\frac{m}{M}$$\n\nWhere:\n- $m$ = mass (g)\n- $M$ = molar mass (g\\cdotmol$^{-1}$)\n\nThe molar mass equals the relative atomic/molecular mass read from the periodic table.\n\n**Examples:**\n- $M$(H$_2$O) = 2(1) + 16 = 18 g\\cdotmol$^{-1}$\n- $M$(NaCl) = 23 + 35,5 = 58,5 g\\cdotmol$^{-1}$\n- $M$(H$_2$SO$_4$) = 2(1) + 32 + 4(16) = 98 g\\cdotmol$^{-1}$'),
  q(4, 'What mass of NaOH (M = 40 g/mol) is needed to prepare 0,25 mol?',
    ['10 g', '40 g', '160 g', '0,00625 g'], 0,
    'm = nM = 0,25 x 40 = 10 g.',
    ['Rearrange n = m/M to get m = nM.']),
  t(5, '## Molar Volume of Gases\n\nAt **Standard Temperature and Pressure (STP)**: $T = 273$ K, $P = 101{,}3$ kPa:\n\nOne mole of any gas occupies **22,4 dm$^3$** (litres).\n\n$$n = \\frac{V}{V_m}$$\n\nWhere:\n- $V$ = volume of gas (dm$^3$)\n- $V_m$ = molar volume = 22,4 dm$^3$\\cdotmol$^{-1}$ (at STP)\n\n**Example:** What volume does 0,5 mol of O$_2$ occupy at STP?\n$$V = nV_m = 0{,}5 \\times 22{,}4 = 11{,}2 \\text{ dm}^3$$'),
  fb(6, 'Avogadro\'s number is ___ $\\times 10^{23}$. The molar volume of any gas at STP is ___ dm$^3$.',
    ['6,022', '22,4'],
    'N_A = 6,022 x 10^23 mol^{-1}. V_m = 22,4 dm^3/mol at STP.'),
  t(7, '## Concentration of Solutions\n\n$$c = \\frac{n}{V}$$\n\nWhere:\n- $c$ = concentration (mol\\cdotdm$^{-3}$ or M)\n- $n$ = number of moles of solute (mol)\n- $V$ = volume of solution (dm$^3$)\n\n**Note:** 1 dm$^3$ = 1 litre = 1 000 cm$^3$. Convert cm$^3$ to dm$^3$ by dividing by 1 000.\n\n**Example:** 4 g of NaOH (M = 40 g/mol) is dissolved in 500 cm$^3$ of water.\n$$n = \\frac{4}{40} = 0{,}1 \\text{ mol}$$\n$$c = \\frac{0{,}1}{0{,}5} = 0{,}2 \\text{ mol\\cdotdm}^{-3}$$'),
  q(8, 'What is the concentration of a solution containing 9,8 g of H$_2$SO$_4$ (M = 98 g/mol) in 250 cm$^3$ of solution?',
    ['0,4 mol/dm$^3$', '0,1 mol/dm$^3$', '0,04 mol/dm$^3$', '4 mol/dm$^3$'], 0,
    'n = m/M = 9,8/98 = 0,1 mol. V = 250/1000 = 0,25 dm^3. c = n/V = 0,1/0,25 = 0,4 mol/dm^3.'),
  t(9, '## Stoichiometry, Limiting Reagents and Percentage Yield\n\n**Stoichiometry** uses the mole ratio from a balanced equation to calculate quantities.\n\n**Example:** $2\\text{H}_2 + \\text{O}_2 \\rightarrow 2\\text{H}_2\\text{O}$\n\nThe mole ratio is 2 : 1 : 2. If you have 3 mol H$_2$ and 2 mol O$_2$:\n- H$_2$ needs: 3/2 = 1,5 mol O$_2$ (you have 2 mol \u2014 enough)\n- O$_2$ needs: 2 x 2 = 4 mol H$_2$ (you have 3 mol \u2014 not enough)\n- H$_2$ is the **limiting reagent** (runs out first)\n\n**Percentage yield:**\n$$\\% \\text{ yield} = \\frac{\\text{actual yield}}{\\text{theoretical yield}} \\times 100$$'),
  q(10, 'In the reaction: $\\text{N}_2 + 3\\text{H}_2 \\rightarrow 2\\text{NH}_3$, if 1 mol N$_2$ reacts with 2 mol H$_2$, what is the limiting reagent?',
    ['H$_2$', 'N$_2$', 'NH$_3$', 'Both are limiting'], 0,
    '1 mol N_2 needs 3 mol H_2 (from the ratio 1:3). Only 2 mol H_2 is available, so H_2 is the limiting reagent.'),
  fb(11, 'The ___ reagent is the reactant that is completely used up first. Percentage yield = (actual yield / ___ yield) x 100.',
    ['limiting', 'theoretical'],
    'The limiting reagent determines how much product can form. Theoretical yield is the maximum possible.'),
  q(12, 'A reaction has a theoretical yield of 50 g but only 40 g of product is obtained. What is the percentage yield?',
    ['80%', '125%', '90%', '40%'], 0,
    '% yield = (40/50) x 100 = 80%.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Energy and Chemical Change (Term 3 — Chemistry)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Energy and Chemical Change\n\nChemical reactions involve the breaking and forming of bonds, which requires or releases energy.\n\n### Exothermic Reactions ($\\Delta H < 0$)\n- Energy is **released** to the surroundings.\n- Products have **less** energy than reactants.\n- Temperature of surroundings increases.\n- Examples: combustion, neutralisation, respiration.\n\n### Endothermic Reactions ($\\Delta H > 0$)\n- Energy is **absorbed** from the surroundings.\n- Products have **more** energy than reactants.\n- Temperature of surroundings decreases.\n- Examples: photosynthesis, dissolving NH$_4$Cl in water, thermal decomposition.'),
  q(2, 'In an exothermic reaction, the energy of the products is:',
    ['Less than the energy of the reactants', 'More than the energy of the reactants', 'Equal to the energy of the reactants', 'Zero'], 0,
    'In exothermic reactions, energy is released, so the products have less potential energy than the reactants. The difference is released as heat.'),
  t(3, '## Activation Energy\n\n**Activation energy** ($E_a$) is the minimum energy required for a reaction to occur. It is the energy barrier that must be overcome for reactants to convert to products.\n\n### Energy Profiles\n\n**Exothermic energy profile:**\n- Reactants start at a higher energy level.\n- There is an energy \"hump\" (activation energy).\n- Products are at a lower energy level.\n- $\\Delta H$ is negative (below the reactant level).\n\n**Endothermic energy profile:**\n- Reactants start at a lower energy level.\n- There is an energy \"hump\" (activation energy).\n- Products are at a higher energy level.\n- $\\Delta H$ is positive (above the reactant level).\n\nA **catalyst** lowers the activation energy by providing an alternative reaction pathway, without being consumed.'),
  fb(4, 'Activation energy is the ___ energy needed for a reaction to start. A catalyst lowers the activation energy but does not change ___.',
    ['minimum', 'delta H'],
    'E_a is the minimum energy for a reaction. Catalysts lower E_a but do not change the enthalpy change (delta H) of the reaction.'),
  t(5, '## Bond Energy Calculations\n\nThe enthalpy change of a reaction can be estimated from bond energies:\n\n$$\\Delta H = \\sum E(\\text{bonds broken}) - \\sum E(\\text{bonds formed})$$\n\n**Breaking bonds** requires energy (endothermic, positive).\n**Forming bonds** releases energy (exothermic, negative).\n\n**Example:** $\\text{H}_2 + \\text{Cl}_2 \\rightarrow 2\\text{HCl}$\n\nBonds broken: 1 H\u2013H (436 kJ) + 1 Cl\u2013Cl (242 kJ) = 678 kJ\nBonds formed: 2 H\u2013Cl (2 $\\times$ 431 = 862 kJ)\n\n$\\Delta H = 678 - 862 = -184$ kJ (exothermic)\n\nThe negative sign confirms this reaction releases energy.'),
  q(6, 'Given bond energies: C\u2013H = 413 kJ, O=O = 498 kJ, C=O = 805 kJ, O\u2013H = 464 kJ. Calculate $\\Delta H$ for: CH$_4$ + 2O$_2$ $\\rightarrow$ CO$_2$ + 2H$_2$O.',
    ['-818 kJ', '+818 kJ', '-1 640 kJ', '+1 640 kJ'], 0,
    'Broken: 4(C-H) + 2(O=O) = 4(413) + 2(498) = 1652 + 996 = 2648 kJ. Formed: 2(C=O) + 4(O-H) = 2(805) + 4(464) = 1610 + 1856 = 3466 kJ. delta H = 2648 - 3466 = -818 kJ.',
    ['Count ALL bonds in reactants (broken) and ALL bonds in products (formed).']),
  t(7, '## Enthalpy and Hess\'s Law\n\n**Hess\'s Law:** The enthalpy change for a reaction is the same regardless of the pathway, provided the initial and final conditions are the same.\n\nThis means we can add or subtract known enthalpy changes to find unknown ones.\n\n**Standard enthalpy of formation** ($\\Delta H_f^\\circ$) is the enthalpy change when 1 mole of a compound is formed from its elements in their standard states.\n\nUsing Hess\'s Law:\n$$\\Delta H_{rxn} = \\sum \\Delta H_f^\\circ(\\text{products}) - \\sum \\Delta H_f^\\circ(\\text{reactants})$$\n\nBy convention, $\\Delta H_f^\\circ$ of elements in their standard state = 0.'),
  q(8, 'Using Hess\'s Law, if reaction A $\\rightarrow$ B has $\\Delta H_1$ = -100 kJ and B $\\rightarrow$ C has $\\Delta H_2$ = +40 kJ, what is $\\Delta H$ for A $\\rightarrow$ C?',
    ['-60 kJ', '-140 kJ', '+60 kJ', '+140 kJ'], 0,
    'By Hess\'s Law: delta H(A to C) = delta H_1 + delta H_2 = -100 + 40 = -60 kJ.'),
  q(9, 'Which statement about a catalyst is correct?',
    ['It provides an alternative pathway with lower activation energy', 'It increases the enthalpy change of the reaction', 'It is consumed during the reaction', 'It shifts the equilibrium position'], 0,
    'A catalyst lowers E_a by providing an alternative pathway. It is not consumed and does not change delta H or equilibrium position.'),
  fb(10, 'Breaking bonds is ___ (absorbs energy). Forming bonds is ___ (releases energy).',
    ['endothermic', 'exothermic'],
    'Energy must be put in to break bonds (endothermic). Energy is released when new bonds form (exothermic).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: Types of Reactions — Acids and Bases (Term 3 — Chemistry)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Acids and Bases: Definitions\n\n### Arrhenius Definition\n- **Acid:** A substance that produces H$^+$ (or H$_3$O$^+$) ions in water.\n- **Base:** A substance that produces OH$^-$ ions in water.\n\n### Lowry-Br\\o{}nsted Definition (broader)\n- **Acid:** A proton (H$^+$) donor.\n- **Base:** A proton (H$^+$) acceptor.\n\nThe Lowry-Bronsted definition is preferred because it applies to reactions not involving water.\n\n**Examples:**\n- HCl is an acid (donates H$^+$)\n- NaOH is a base (accepts H$^+$ / provides OH$^-$)\n- NH$_3$ is a base (accepts H$^+$ to form NH$_4^+$)'),
  q(2, 'According to the Lowry-Bronsted definition, a base is a substance that:',
    ['Accepts protons (H$^+$)', 'Donates protons (H$^+$)', 'Produces OH$^-$ ions in water', 'Has a pH less than 7'], 0,
    'A Lowry-Bronsted base is a proton acceptor. The Arrhenius definition (produces OH-) is more limited.'),
  t(3, '## Strong and Weak Acids and Bases\n\n### Strong Acids and Bases\n- **Ionise completely** in water (100%).\n- Strong acids: HCl, H$_2$SO$_4$, HNO$_3$\n- Strong bases: NaOH, KOH, Ca(OH)$_2$\n- Good electrolytes (conduct electricity well).\n\n### Weak Acids and Bases\n- **Ionise partially** in water (equilibrium established).\n- Weak acids: CH$_3$COOH (vinegar), H$_2$CO$_3$, citric acid\n- Weak bases: NH$_3$, CH$_3$NH$_2$\n- Poor electrolytes.\n\n**Important:** Strong/weak refers to the degree of ionisation, NOT concentration. You can have a dilute solution of a strong acid or a concentrated solution of a weak acid.'),
  fb(4, 'A strong acid ionises ___ in water, while a weak acid ionises only ___.',
    ['completely', 'partially'],
    'Strong acids dissociate 100%. Weak acids reach an equilibrium where only a fraction of molecules have ionised.'),
  t(5, '## The pH Scale\n\n$$\\text{pH} = -\\log[\\text{H}_3\\text{O}^+]$$\n\n| pH | Solution |\n|---|---|\n| 0\u20136 | Acidic |\n| 7 | Neutral |\n| 8\u201314 | Basic/Alkaline |\n\n**Key points:**\n- Each pH unit represents a **10-fold** change in H$_3$O$^+$ concentration.\n- pH 3 is 10 times more acidic than pH 4.\n- pH 3 is 100 times more acidic than pH 5.\n\n**Common substances in SA:**\n- Battery acid: pH $\\approx$ 0\n- Vinegar: pH $\\approx$ 3\n- Rooibos tea: pH $\\approx$ 5\n- Pure water: pH = 7\n- Baking soda: pH $\\approx$ 9\n- Bleach: pH $\\approx$ 13'),
  q(6, 'A solution has a H$_3$O$^+$ concentration of 0,001 mol/dm$^3$. What is its pH?',
    ['3', '4', '0,001', '11'], 0,
    'pH = -log[H3O+] = -log(0,001) = -log(10^-3) = 3.',
    ['Remember: 0,001 = 10^-3, and -log(10^-3) = 3.']),
  t(7, '## Acid-Base Reactions (Neutralisation)\n\n**General equation:**\n$$\\text{Acid} + \\text{Base} \\rightarrow \\text{Salt} + \\text{Water}$$\n\n**Examples:**\n$$\\text{HCl} + \\text{NaOH} \\rightarrow \\text{NaCl} + \\text{H}_2\\text{O}$$\n$$\\text{H}_2\\text{SO}_4 + 2\\text{KOH} \\rightarrow \\text{K}_2\\text{SO}_4 + 2\\text{H}_2\\text{O}$$\n\n**Acid + Metal oxide (base):**\n$$2\\text{HCl} + \\text{CuO} \\rightarrow \\text{CuCl}_2 + \\text{H}_2\\text{O}$$\n\n**Acid + Metal carbonate:**\n$$2\\text{HCl} + \\text{CaCO}_3 \\rightarrow \\text{CaCl}_2 + \\text{H}_2\\text{O} + \\text{CO}_2$$\n\nThe CO$_2$ produced causes the \"fizzing\" when antacids react with stomach acid (HCl), or when vinegar reacts with baking soda.'),
  q(8, 'What are the products of the reaction between H$_2$SO$_4$ and NaOH?',
    ['Na$_2$SO$_4$ + H$_2$O', 'NaSO$_4$ + H$_2$', 'Na$_2$SO$_4$ + H$_2$', 'NaHSO$_4$ only'], 0,
    'H_2SO_4 + 2NaOH -> Na_2SO_4 + 2H_2O. The products are sodium sulphate (salt) and water.'),
  t(9, '## Common Acids and Bases in South Africa\n\n**Common acids:**\n- **Hydrochloric acid** (HCl): Stomach acid (muriatic acid), used in cleaning.\n- **Sulphuric acid** (H$_2$SO$_4$): Car batteries, industrial processes.\n- **Acetic acid** (CH$_3$COOH): Vinegar.\n- **Citric acid**: Citrus fruits (lemons, naartjies).\n- **Carbonic acid** (H$_2$CO$_3$): Carbonated drinks.\n\n**Common bases:**\n- **Sodium hydroxide** (NaOH): Drain cleaner, soap making.\n- **Calcium hydroxide** (Ca(OH)$_2$): Lime, used in agriculture to raise soil pH.\n- **Ammonia** (NH$_3$): Cleaning products.\n- **Sodium bicarbonate** (NaHCO$_3$): Baking soda, antacid.\n- **Magnesium hydroxide** (Mg(OH)$_2$): Milk of magnesia (antacid).'),
  fb(10, 'An acid-base reaction is also called a ___ reaction. The products are always a ___ and water.',
    ['neutralisation', 'salt'],
    'Acid + base -> salt + water. This is a neutralisation reaction.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Ideal Gases (Term 3 — Chemistry)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## The Gas Laws\n\n### Boyle\'s Law (constant temperature)\n\n> The volume of a fixed amount of gas is inversely proportional to its pressure at constant temperature.\n\n$$p_1V_1 = p_2V_2 \\quad (T \\text{ constant})$$\n\n**Example:** A gas at 100 kPa occupies 2 dm$^3$. What volume does it occupy at 200 kPa?\n$$V_2 = \\frac{p_1V_1}{p_2} = \\frac{(100)(2)}{200} = 1 \\text{ dm}^3$$\n\nDoubling the pressure halves the volume.'),
  q(2, 'A gas has a volume of 500 cm$^3$ at a pressure of 80 kPa. If the pressure increases to 160 kPa at constant temperature, the new volume is:',
    ['250 cm$^3$', '1 000 cm$^3$', '500 cm$^3$', '125 cm$^3$'], 0,
    'p1V1 = p2V2. V2 = (80 x 500)/160 = 40 000/160 = 250 cm^3. Pressure doubled, volume halved.',
    ['Use Boyle\'s Law: p1V1 = p2V2. Solve for V2.']),
  t(3, '## Charles\'s Law (constant pressure)\n\n> The volume of a fixed amount of gas is directly proportional to its absolute temperature at constant pressure.\n\n$$\\frac{V_1}{T_1} = \\frac{V_2}{T_2} \\quad (p \\text{ constant})$$\n\n**CRITICAL:** Temperature MUST be in kelvin.\n$$T(K) = T(\\degree C) + 273$$\n\n**Example:** A gas occupies 300 cm$^3$ at 27 $\\degree$C. What volume does it occupy at 127 $\\degree$C (constant pressure)?\n$$T_1 = 27 + 273 = 300 \\text{ K}, \\quad T_2 = 127 + 273 = 400 \\text{ K}$$\n$$V_2 = \\frac{V_1 T_2}{T_1} = \\frac{(300)(400)}{300} = 400 \\text{ cm}^3$$'),
  q(4, 'A balloon has a volume of 2 dm$^3$ at 20 $\\degree$C. If it is heated to 100 $\\degree$C at constant pressure, the new volume is:',
    ['2,55 dm$^3$', '10 dm$^3$', '0,4 dm$^3$', '5 dm$^3$'], 0,
    'T1 = 20 + 273 = 293 K. T2 = 100 + 273 = 373 K. V2 = V1(T2/T1) = 2(373/293) = 2(1,273) = 2,55 dm^3.',
    ['Convert temperatures to kelvin first. Then use V1/T1 = V2/T2.']),
  t(5, '## Gay-Lussac\'s Law (constant volume)\n\n> The pressure of a fixed amount of gas is directly proportional to its absolute temperature at constant volume.\n\n$$\\frac{p_1}{T_1} = \\frac{p_2}{T_2} \\quad (V \\text{ constant})$$\n\nThis explains why a sealed container (like an aerosol can) can explode when heated \u2014 the pressure increases with temperature.\n\n**Example:** A car tyre has a pressure of 200 kPa at 15 $\\degree$C. After driving, the temperature rises to 45 $\\degree$C. What is the new pressure?\n$$T_1 = 288 \\text{ K}, \\quad T_2 = 318 \\text{ K}$$\n$$p_2 = \\frac{p_1 T_2}{T_1} = \\frac{(200)(318)}{288} = 220{,}8 \\text{ kPa}$$'),
  fb(6, 'Temperature in gas law calculations must always be in ___. To convert: $T$(K) = $T$($\\degree$C) + ___.',
    ['kelvin', '273'],
    'Gas laws require absolute temperature. T(K) = T(degrees C) + 273.'),
  t(7, '## The Ideal Gas Equation\n\nCombining all three gas laws gives the **ideal gas equation**:\n\n$$pV = nRT$$\n\nWhere:\n- $p$ = pressure (Pa)\n- $V$ = volume (m$^3$)\n- $n$ = number of moles (mol)\n- $R$ = universal gas constant = 8,314 J\\cdotmol$^{-1}$\\cdotK$^{-1}$\n- $T$ = absolute temperature (K)\n\n**Unit conversions for $pV = nRT$:**\n- 1 kPa = 1 000 Pa\n- 1 dm$^3$ = 0,001 m$^3$ = $10^{-3}$ m$^3$\n- 1 cm$^3$ = $10^{-6}$ m$^3$\n\n**Example:** Calculate the volume of 2 mol of gas at 25 $\\degree$C and 100 kPa.\n$$V = \\frac{nRT}{p} = \\frac{(2)(8{,}314)(298)}{100\\,000} = 0{,}0496 \\text{ m}^3 = 49{,}6 \\text{ dm}^3$$'),
  q(8, 'How many moles of gas are in a 5 dm$^3$ container at 200 kPa and 27 $\\degree$C?',
    ['0,40 mol', '4,0 mol', '0,04 mol', '40 mol'], 0,
    'Convert: V = 5 x 10^-3 m^3, p = 200 000 Pa, T = 300 K. n = pV/(RT) = (200000)(0,005)/((8,314)(300)) = 1000/2494,2 = 0,40 mol.',
    ['Convert dm^3 to m^3 and kPa to Pa. Use n = pV/(RT).']),
  t(9, '## Kinetic Molecular Theory\n\nThe ideal gas model assumes:\n\n1. Gas particles are in **constant, random, straight-line motion**.\n2. The volume of the particles themselves is **negligible** compared to the volume of the container.\n3. There are **no intermolecular forces** between particles (except during collisions).\n4. Collisions are perfectly **elastic** (no energy is lost).\n5. The average kinetic energy of the particles is proportional to the **absolute temperature**.\n\n**Real gases** deviate from ideal behaviour at:\n- **High pressure** (particles are close together, volume is not negligible)\n- **Low temperature** (particles move slowly, IMFs become significant)\n\nReal gases behave most like ideal gases at **low pressure** and **high temperature**.'),
  q(10, 'Under which conditions does a real gas behave most like an ideal gas?',
    ['Low pressure and high temperature', 'High pressure and low temperature', 'High pressure and high temperature', 'Low pressure and low temperature'], 0,
    'At low pressure, particles are far apart (negligible volume). At high temperature, particles move fast (IMFs insignificant). Both conditions match ideal gas assumptions.'),
  fb(11, 'In the ideal gas equation $pV = nRT$, the gas constant $R$ = ___ J\\cdotmol$^{-1}$\\cdotK$^{-1}$. Real gases deviate most from ideal behaviour at ___ pressure.',
    ['8,314', 'high'],
    'R = 8,314 J/(mol.K). At high pressure, gas particles are forced close together, violating the assumption of negligible particle volume.'),
  q(12, 'A sealed container of gas at STP (0 $\\degree$C, 101,3 kPa) is heated to 273 $\\degree$C. What is the new pressure?',
    ['202,6 kPa', '101,3 kPa', '50,65 kPa', '404,2 kPa'], 0,
    'T1 = 273 K, T2 = 273 + 273 = 546 K. Since V is constant: p2 = p1(T2/T1) = 101,3(546/273) = 101,3 x 2 = 202,6 kPa. Temperature doubled (in K), so pressure doubled.',
    ['Use Gay-Lussac\'s Law (constant volume). Convert to kelvin first.']),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 13: Revision and Exam Preparation (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch13_lesson1 = [
  t(1, '## Grade 11 Physical Sciences: Revision\n\nThe Grade 11 exam consists of two papers:\n\n### Paper 1: Physics (150 marks, 3 hours)\n- Vectors in 2D\n- Newton\'s Laws\n- Newton\'s Universal Law of Gravitation\n- Electrostatics\n- Electromagnetism\n- Electric Circuits\n\n### Paper 2: Chemistry (150 marks, 3 hours)\n- Atomic Combinations (Bonding)\n- Intermolecular Forces\n- Quantitative Chemistry (The Mole)\n- Energy and Chemical Change\n- Types of Reactions (Acids and Bases)\n- Ideal Gases\n\n**Exam tips:**\n- Show ALL working \u2014 method marks are available.\n- Include units in every answer.\n- Draw clear, labelled diagrams.\n- Choose and state a positive direction for vector problems.'),
  t(2, '## Key Physics Formulae\n\n### Vectors\n- $R = \\sqrt{F_x^2 + F_y^2}$\n- $\\theta = \\tan^{-1}(F_y / F_x)$\n- $F_x = F\\cos\\theta$, $F_y = F\\sin\\theta$\n\n### Newton\'s Laws\n- $\\vec{F}_{net} = m\\vec{a}$\n- $f_s \\leq \\mu_s N$, $f_k = \\mu_k N$\n- $w = mg$\n\n### Gravitation\n- $F = \\frac{Gm_1m_2}{r^2}$\n- $g = \\frac{GM}{r^2}$\n- $G = 6{,}67 \\times 10^{-11}$ N\\cdotm$^2$\\cdotkg$^{-2}$\n\n### Electrostatics\n- $F = \\frac{kQ_1Q_2}{r^2}$\n- $E = \\frac{kQ}{r^2} = \\frac{F}{q}$\n- $k = 9 \\times 10^9$ N\\cdotm$^2$\\cdotC$^{-2}$\n\n### Electromagnetism\n- $\\varepsilon = -N\\frac{\\Delta\\phi}{\\Delta t}$\n- $\\phi = BA\\cos\\theta$\n- $\\frac{V_p}{V_s} = \\frac{N_p}{N_s}$\n\n### Circuits\n- $V = IR$\n- $P = IV = I^2R = V^2/R$\n- $\\varepsilon = I(R + r)$'),
  q(3, 'A 3 kg block on a horizontal surface has $\\mu_k$ = 0,4. A horizontal force of 20 N is applied. What is the acceleration? (Use g = 9,8 m/s\u00b2)',
    ['2,74 m/s\u00b2', '6,67 m/s\u00b2', '0,53 m/s\u00b2', '4,00 m/s\u00b2'], 0,
    'N = mg = 3(9,8) = 29,4 N. f_k = mu_k x N = 0,4 x 29,4 = 11,76 N. F_net = 20 - 11,76 = 8,24 N. a = F_net/m = 8,24/3 = 2,75 m/s^2 (approximately 2,74).'),
  t(4, '## Key Chemistry Formulae\n\n### The Mole\n- $n = \\frac{m}{M}$ (mass and molar mass)\n- $n = \\frac{N}{N_A}$ (number of particles)\n- $n = \\frac{V}{V_m}$ (gas volume at STP, $V_m = 22{,}4$ dm$^3$/mol)\n- $c = \\frac{n}{V}$ (concentration)\n\n### Ideal Gas\n- $pV = nRT$ ($R = 8{,}314$ J\\cdotmol$^{-1}$\\cdotK$^{-1}$)\n- $p_1V_1/T_1 = p_2V_2/T_2$ (combined gas law)\n\n### Energy\n- $\\Delta H = \\sum E(\\text{bonds broken}) - \\sum E(\\text{bonds formed})$\n\n### Acids and Bases\n- $\\text{pH} = -\\log[\\text{H}_3\\text{O}^+]$\n- Acid + Base $\\rightarrow$ Salt + Water'),
  q(5, 'What volume of 0,2 mol/dm$^3$ NaOH is needed to neutralise 25 cm$^3$ of 0,1 mol/dm$^3$ HCl?',
    ['12,5 cm$^3$', '25 cm$^3$', '50 cm$^3$', '5 cm$^3$'], 0,
    'HCl + NaOH -> NaCl + H2O (1:1 ratio). n(HCl) = cV = 0,1 x 0,025 = 0,0025 mol. n(NaOH) = 0,0025 mol. V(NaOH) = n/c = 0,0025/0,2 = 0,0125 dm^3 = 12,5 cm^3.'),
  t(6, '## Problem-Solving Strategies\n\n### Physics Problems\n1. Read the question carefully and identify what is given and what is asked.\n2. Draw a diagram (free-body diagram, circuit diagram, etc.).\n3. Choose a positive direction (for vectors).\n4. Write down the relevant formula.\n5. Substitute values with correct units.\n6. Solve and check that the answer makes sense.\n\n### Chemistry Calculations\n1. Write a balanced equation.\n2. Identify the mole ratios.\n3. Calculate moles of the known substance.\n4. Use the mole ratio to find moles of the unknown.\n5. Convert to the required unit (mass, volume, concentration).\n\n### Common Mistakes to Avoid\n- Forgetting to convert $\\degree$C to K for gas laws.\n- Using the wrong formula for series vs parallel resistors.\n- Not taking direction into account for vectors.\n- Forgetting that $\\mu_k < \\mu_s$.\n- Using mass instead of moles in gas calculations.'),
  fb(7, 'In gas law calculations, temperature must be in ___. When drawing free-body diagrams, forces must be drawn from the ___ of the object.',
    ['kelvin', 'centre'],
    'Always convert to kelvin for gas laws. Free-body diagrams show all forces acting from the centre point of the object.'),
  q(8, 'Calculate the pH of a 0,01 mol/dm$^3$ HCl solution. (HCl is a strong acid.)',
    ['2', '1', '12', '0,01'], 0,
    'HCl is a strong acid, so it ionises completely: [H3O+] = 0,01 = 10^-2 mol/dm^3. pH = -log(10^-2) = 2.',
    ['Strong acid: [H3O+] = concentration of the acid.']),
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
      title: 'Chapter 1: Vectors in Two Dimensions',
      description: 'Resultant vectors using graphical (head-to-tail) and component methods, Pythagorean theorem for perpendicular vectors, resolving vectors into x and y components.',
      order: 1,
      lessons: [
        { title: 'Vectors in 2D: Resultants and Components', description: 'Resultant vectors, graphical head-to-tail method, component method (resolving into x and y), Pythagorean theorem for perpendicular vectors.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Newton\'s Laws',
      description: 'Newton\'s 1st, 2nd and 3rd Laws, force and free-body diagrams, friction (static and kinetic), equilibrium and non-equilibrium problems.',
      order: 2,
      lessons: [
        { title: 'Newton\'s Laws, Force Diagrams and Friction', description: 'Newton\'s 1st Law (inertia), 2nd Law (F=ma), 3rd Law (action-reaction), force diagrams, free-body diagrams, static and kinetic friction, equilibrium and non-equilibrium.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Newton\'s Universal Law of Gravitation',
      description: 'Gravitational force between masses, gravitational acceleration on different planets, weight vs mass, variation of g with altitude.',
      order: 3,
      lessons: [
        { title: 'Gravitation, Weight and g on Other Planets', description: 'Newton\'s Universal Law of Gravitation, gravitational constant G, gravitational acceleration g = GM/r^2, g on different planets, weight vs mass, weightlessness.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Electrostatics',
      description: 'Coulomb\'s Law for two charges and for three charges in 1D and 2D, electric field strength, electric field patterns.',
      order: 4,
      lessons: [
        { title: 'Coulomb\'s Law and Electric Fields', description: 'Coulomb\'s Law (1D and 2D for three charges), electric field strength E = kQ/r^2, electric field lines, superposition of forces.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Electromagnetism',
      description: 'Magnetic fields around current-carrying conductors, Faraday\'s Law, Lenz\'s Law, induced EMF, generators, and transformers.',
      order: 5,
      lessons: [
        { title: 'Electromagnetism and Faraday\'s Law', description: 'Magnetic field around conductors and solenoids, right-hand rule, Faraday\'s Law, Lenz\'s Law, EMF, generators (AC and DC), transformers.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Electric Circuits',
      description: 'Ohm\'s Law, series and parallel resistors (up to 4), electrical power and energy, internal resistance and EMF.',
      order: 6,
      lessons: [
        { title: 'Ohm\'s Law, Series/Parallel Circuits and Internal Resistance', description: 'Ohm\'s Law, resistors in series and parallel (max 4), power (P = IV = I^2R = V^2/R), energy, internal resistance, EMF, terminal voltage.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Atomic Combinations (Chemical Bonding)',
      description: 'Covalent, ionic and metallic bonding, Lewis dot diagrams, electronegativity, bond polarity, VSEPR molecular shapes, introduction to intermolecular forces.',
      order: 7,
      lessons: [
        { title: 'Chemical Bonding, Lewis Diagrams and Molecular Shapes', description: 'Chemical bonding (covalent, ionic, metallic), Lewis dot structures, electronegativity, bond polarity, VSEPR theory, molecular shapes, introduction to intermolecular forces (Van der Waals, dipole-dipole, hydrogen bonding).', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Intermolecular Forces',
      description: 'Effect of intermolecular forces on boiling point, vapour pressure, viscosity, solubility, and the density anomaly of water.',
      order: 8,
      lessons: [
        { title: 'Intermolecular Forces and Physical Properties', description: 'Effect of IMFs on boiling point, vapour pressure, solubility (like dissolves like), viscosity, density of water anomaly.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: Quantitative Chemistry (The Mole)',
      description: 'Mole concept, Avogadro\'s number, molar mass, molar volume of gases, concentration of solutions, stoichiometry, limiting reagents, percentage yield.',
      order: 9,
      lessons: [
        { title: 'The Mole, Stoichiometry and Limiting Reagents', description: 'Mole concept, Avogadro\'s number, molar mass, molar volume at STP, concentration, stoichiometry, limiting reagents, percentage yield.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Energy and Chemical Change',
      description: 'Exothermic and endothermic reactions, activation energy, energy profiles, bond energy calculations, Hess\'s Law.',
      order: 10,
      lessons: [
        { title: 'Enthalpy, Bond Energy and Energy Profiles', description: 'Exothermic and endothermic reactions, activation energy, energy profiles, bond energy calculations, Hess\'s Law, catalysts.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: Types of Reactions (Acids and Bases)',
      description: 'Arrhenius and Lowry-Bronsted definitions, strong vs weak acids/bases, pH scale, acid-base reactions, neutralisation, common acids and bases.',
      order: 11,
      lessons: [
        { title: 'Acids, Bases, pH and Neutralisation', description: 'Arrhenius and Lowry-Bronsted definitions, strong vs weak acids/bases, pH scale, neutralisation reactions, common acids and bases in SA.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Ideal Gases',
      description: 'Boyle\'s Law, Charles\'s Law, Gay-Lussac\'s Law, the ideal gas equation (pV = nRT), kinetic molecular theory, real vs ideal gases.',
      order: 12,
      lessons: [
        { title: 'Gas Laws and the Ideal Gas Equation', description: 'Boyle\'s Law, Charles\'s Law, Gay-Lussac\'s Law, ideal gas equation (pV = nRT), kinetic molecular theory, real vs ideal gases.', blocks: ch12_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 13: Revision and Exam Preparation',
      description: 'Paper 1 (Physics) and Paper 2 (Chemistry) exam structure, key formulae, problem-solving strategies, and common mistakes.',
      order: 13,
      lessons: [
        { title: 'Revision and Exam Preparation', description: 'Exam structure (Paper 1: Physics 150 marks, Paper 2: Chemistry 150 marks), key formulae, problem-solving strategies, common mistakes.', blocks: ch13_lesson1, term: 4 },
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
    title: 'Grade 11 Physical Sciences \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Physics (Vectors, Newton\'s Laws, Gravitation, Electrostatics, Electromagnetism, Electric Circuits) and Chemistry (Chemical Bonding, Intermolecular Forces, Quantitative Chemistry, Energy Changes, Acids & Bases, Ideal Gases) for the Grade 11 Physical Sciences examination.',
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
  console.log('  TEXTBOOK: Grade 11 Physical Sciences');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
