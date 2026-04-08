const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const SCHOOL_ID = new mongoose.Types.ObjectId('69ce960a98ca4ee738d25416');
const CREATED_BY = new mongoose.Types.ObjectId('69ce960b98ca4ee738d25432');

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
// CHAPTER 1: Transverse Pulses and Waves (Term 1 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Transverse Pulses\n\nA **pulse** is a single disturbance that moves through a medium. A **transverse pulse** is a disturbance where the particles of the medium move **perpendicular** (at right angles) to the direction in which the pulse travels.\n\n**Key terms:**\n- **Amplitude:** The maximum displacement of a particle from its rest (equilibrium) position. Measured in metres (m).\n- **Pulse length:** The distance from the start to the end of the pulse.\n- **Rest position (equilibrium):** The undisturbed position of the medium.\n\n**Example:** When you flick a rope up and down once, you create a transverse pulse. The rope particles move up and down, but the pulse travels along the length of the rope.'),
  q(2, 'In a transverse pulse, the particles of the medium move:',
    ['Perpendicular to the direction of pulse travel', 'Parallel to the direction of pulse travel', 'In circles', 'They do not move at all'], 0,
    'In a transverse pulse, particles vibrate at right angles (perpendicular) to the direction of energy transfer.'),
  t(3, '## Superposition of Pulses\n\nWhen two pulses meet in the same medium, they **superpose** — their individual displacements add together at each point.\n\n### Constructive Interference\nWhen two pulses on the same side of the rest position meet, their amplitudes **add up**, producing a larger displacement.\n\n### Destructive Interference\nWhen two pulses on opposite sides of the rest position meet, their amplitudes **subtract**, producing a smaller displacement (or zero if equal and opposite).\n\n**Important:** After passing through each other, each pulse continues with its original shape, speed, and amplitude. Pulses are not affected by the superposition — they pass through each other unchanged.'),
  q(4, 'Two pulses of amplitude 3 cm (upward) and 2 cm (downward) meet at the same point. The resultant displacement at that instant is:',
    ['1 cm upward', '5 cm upward', '1 cm downward', '5 cm downward'], 0,
    'Destructive interference: +3 cm + (-2 cm) = +1 cm. The resultant displacement is 1 cm upward.',
    ['Add the displacements algebraically, taking upward as positive and downward as negative.']),
  fb(5, 'When two pulses on the same side meet, it is called ___ interference. When they are on opposite sides, it is called ___ interference.',
    ['constructive', 'destructive'],
    'Same side = constructive (amplitudes add). Opposite sides = destructive (amplitudes subtract).'),
  t(6, '## Transverse Waves\n\nA **transverse wave** is a continuous series of transverse pulses. The particles of the medium vibrate perpendicular to the direction of wave motion.\n\n### Properties of a Transverse Wave\n\n| Property | Symbol | Unit | Description |\n|---|---|---|---|\n| Amplitude | $A$ | m | Maximum displacement from rest position |\n| Wavelength | $\\lambda$ | m | Distance between two consecutive points in phase (e.g., crest to crest) |\n| Frequency | $f$ | Hz (s$^{-1}$) | Number of complete waves passing a point per second |\n| Period | $T$ | s | Time for one complete wave to pass a point |\n\n**Relationships:**\n$$f = \\frac{1}{T} \\quad \\text{and} \\quad T = \\frac{1}{f}$$\n\n**Crests** are the highest points above the rest position. **Troughs** are the lowest points below the rest position.'),
  q(7, 'A transverse wave has a period of 0,02 s. What is its frequency?',
    ['50 Hz', '0,02 Hz', '20 Hz', '100 Hz'], 0,
    'f = 1/T = 1/0,02 = 50 Hz.',
    ['Use the relationship f = 1/T.']),
  t(8, '## The Wave Equation\n\nThe speed of a wave is related to its frequency and wavelength:\n\n$$v = f\\lambda$$\n\nWhere:\n- $v$ = wave speed (m$\\cdot$s$^{-1}$)\n- $f$ = frequency (Hz)\n- $\\lambda$ = wavelength (m)\n\n**Example:** A transverse wave has a frequency of 20 Hz and a wavelength of 1,5 m.\n$$v = f\\lambda = 20 \\times 1{,}5 = 30 \\text{ m}\\cdot\\text{s}^{-1}$$\n\n**Important:** The speed of a wave depends on the **medium** it travels through, not on its frequency or amplitude. Changing the frequency changes the wavelength but not the speed (in the same medium).'),
  q(9, 'A wave travels at 340 m/s with a wavelength of 0,5 m. What is the frequency?',
    ['680 Hz', '170 Hz', '340 Hz', '0,5 Hz'], 0,
    'f = v/lambda = 340/0,5 = 680 Hz.',
    ['Rearrange v = f lambda to get f = v / lambda.']),
  fb(10, 'The wave equation is $v$ = ___$\\lambda$. The wavelength is the distance between two consecutive ___ (or two consecutive troughs).',
    ['f', 'crests'],
    'v = f times lambda. Wavelength is measured from crest to crest or trough to trough — any two consecutive points in phase.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Longitudinal Waves and Sound (Term 1 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Longitudinal Waves\n\nIn a **longitudinal wave**, the particles of the medium vibrate **parallel** (in the same direction) to the direction of wave travel.\n\n**Key features:**\n- **Compressions:** Regions where particles are close together (high pressure).\n- **Rarefactions:** Regions where particles are spread apart (low pressure).\n- Wavelength is measured from the centre of one compression to the centre of the next compression (or rarefaction to rarefaction).\n\n**Example:** Sound waves, waves in a spring (slinky) pushed back and forth.\n\nThe wave equation $v = f\\lambda$ and the relationship $f = 1/T$ apply to longitudinal waves just as they do to transverse waves.'),
  q(2, 'In a longitudinal wave, the particles of the medium vibrate:',
    ['Parallel to the direction of wave travel', 'Perpendicular to the direction of wave travel', 'In circular paths', 'They remain stationary'], 0,
    'In longitudinal waves, particles vibrate back and forth along the same direction the wave travels.'),
  fb(3, 'In a longitudinal wave, regions of high pressure are called ___, and regions of low pressure are called ___.',
    ['compressions', 'rarefactions'],
    'Compressions = particles close together (high density/pressure). Rarefactions = particles spread apart (low density/pressure).'),
  t(4, '## Sound Waves\n\nSound is a **longitudinal wave** that is produced by vibrating objects. Sound requires a **medium** to travel — it cannot travel through a vacuum.\n\n### Speed of Sound\n\nThe speed of sound depends on the medium:\n\n| Medium | Speed (m$\\cdot$s$^{-1}$) |\n|---|---|\n| Air (20 $\\degree$C) | 343 |\n| Water | 1 480 |\n| Steel | 5 940 |\n\nSound travels fastest in **solids** and slowest in **gases** because the particles in solids are closer together and can transfer vibrations more quickly.\n\n**Temperature effect:** The speed of sound in air increases with temperature because warmer air particles move faster and transfer energy more efficiently.'),
  q(5, 'Sound travels fastest through:',
    ['Solids', 'Liquids', 'Gases', 'Vacuum'], 0,
    'Sound is fastest in solids because the particles are closest together and vibrations transfer most efficiently. Sound cannot travel through a vacuum.',
    ['Think about particle spacing: closer particles transfer vibrations faster.']),
  t(6, '## Properties of Sound\n\n### Pitch and Frequency\n- **Pitch** is how high or low a sound is perceived.\n- High pitch = high frequency (e.g., a whistle).\n- Low pitch = low frequency (e.g., a drum).\n- Human hearing range: **20 Hz to 20 000 Hz (20 kHz)**.\n- Below 20 Hz: **infrasound** (elephants can detect this).\n- Above 20 kHz: **ultrasound** (used in medical imaging, sonar, bats).\n\n### Loudness and Amplitude\n- **Loudness** depends on the **amplitude** of the sound wave.\n- Greater amplitude = louder sound.\n- Loudness also depends on distance from the source — sound gets quieter as you move away.\n\n### Quality (Timbre)\n- Timbre is what makes a guitar and a piano sound different even when playing the same note at the same loudness.\n- It depends on the shape of the sound wave (the overtones present).'),
  q(7, 'A sound wave has a frequency of 25 000 Hz. This sound is classified as:',
    ['Ultrasound', 'Infrasound', 'Within the audible range', 'A transverse wave'], 0,
    '25 000 Hz is above the upper limit of human hearing (20 000 Hz), so it is ultrasound.',
    ['The audible range for humans is 20 Hz to 20 000 Hz.']),
  t(8, '## Ultrasound and Its Uses\n\nUltrasound (frequency above 20 kHz) has many practical applications:\n\n- **Medical imaging:** Ultrasound scans (sonograms) during pregnancy — safe because no ionising radiation is used.\n- **Sonar:** Ships use sonar to measure ocean depth. A pulse is sent to the seabed and the echo is timed.\n- **Cleaning:** Ultrasonic cleaners vibrate dirt off jewellery and surgical instruments.\n- **Industrial testing:** Detecting cracks inside metal structures without cutting them open.\n\n**Sonar calculation:**\n$$d = \\frac{v \\times t}{2}$$\n\nDivide by 2 because the sound travels to the object and back.\n\n**Example:** A ship sends an ultrasound pulse and receives the echo after 0,4 s. Speed of sound in water = 1 480 m/s.\n$$d = \\frac{1\\,480 \\times 0{,}4}{2} = 296 \\text{ m}$$'),
  q(9, 'A bat emits an ultrasound pulse and receives the echo after 0,01 s. If the speed of sound in air is 340 m/s, how far away is the object?',
    ['1,7 m', '3,4 m', '0,85 m', '17 m'], 0,
    'd = v x t / 2 = 340 x 0,01 / 2 = 3,4 / 2 = 1,7 m. Divide by 2 because the sound travels to the object and back.',
    ['Remember to divide by 2 — the sound goes to the object and comes back.']),
  fb(10, 'The human ear can hear sounds in the frequency range from ___ Hz to 20 000 Hz. Frequencies above this range are called ___.',
    ['20', 'ultrasound'],
    'Audible range: 20 Hz to 20 000 Hz. Above 20 000 Hz is ultrasound; below 20 Hz is infrasound.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Electromagnetic Radiation (Term 1 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Electromagnetic Radiation\n\nElectromagnetic (EM) radiation consists of oscillating electric and magnetic fields that travel through space at the **speed of light**.\n\n$$c = 3 \\times 10^8 \\text{ m}\\cdot\\text{s}^{-1}$$\n\n**Key properties:**\n- EM waves are **transverse** waves.\n- They do NOT need a medium — they can travel through a vacuum.\n- All EM waves travel at the same speed ($c$) in a vacuum.\n- They differ in **frequency** and **wavelength**.\n\nThe wave equation for EM radiation:\n$$c = f\\lambda$$\n\n**Example:** Calculate the wavelength of a radio wave with frequency $1 \\times 10^6$ Hz:\n$$\\lambda = \\frac{c}{f} = \\frac{3 \\times 10^8}{1 \\times 10^6} = 300 \\text{ m}$$'),
  q(2, 'Electromagnetic waves differ from sound waves because EM waves:',
    ['Can travel through a vacuum', 'Need a medium to travel', 'Are longitudinal waves', 'Travel slower than sound'], 0,
    'EM waves are transverse waves that can travel through empty space (vacuum). Sound waves are longitudinal and need a medium.'),
  t(3, '## The Electromagnetic Spectrum\n\nThe EM spectrum arranges EM radiation by frequency (or wavelength):\n\n| Type | Wavelength range | Use |\n|---|---|---|\n| Radio waves | > 1 m | Broadcasting, communication |\n| Microwaves | 1 mm – 1 m | Cooking, cellphones, WiFi |\n| Infrared (IR) | 700 nm – 1 mm | Remote controls, thermal imaging |\n| Visible light | 400 nm – 700 nm | Sight, photography |\n| Ultraviolet (UV) | 10 nm – 400 nm | Sterilisation, causes sunburn |\n| X-rays | 0,01 nm – 10 nm | Medical imaging, airport security |\n| Gamma rays | < 0,01 nm | Cancer treatment, nuclear reactions |\n\n**Trends (left to right in table above):**\n- Frequency **increases**\n- Wavelength **decreases**\n- Energy **increases**\n- Penetrating ability **increases**'),
  q(4, 'Which type of electromagnetic radiation has the highest frequency?',
    ['Gamma rays', 'Radio waves', 'Visible light', 'Microwaves'], 0,
    'Gamma rays have the shortest wavelength and therefore the highest frequency and energy in the EM spectrum.'),
  fb(5, 'All electromagnetic waves travel at the speed of ___ in a vacuum, which is $3 \\times 10^8$ m/s. As frequency increases, wavelength ___.',
    ['light', 'decreases'],
    'c = f x lambda. Since c is constant, increasing f means lambda must decrease (inversely proportional).'),
  t(6, '## The Nature of EM Radiation: Wave-Particle Duality\n\nEM radiation has both **wave** properties and **particle** properties.\n\n### Wave model\n- Explains reflection, refraction, diffraction, interference.\n- Describes EM radiation as oscillating fields.\n\n### Particle model (photons)\n- A **photon** is a \"packet\" (quantum) of EM energy.\n- The energy of a photon is:\n$$E = hf = \\frac{hc}{\\lambda}$$\n\nWhere:\n- $E$ = energy (J)\n- $h$ = Planck\'s constant = $6{,}63 \\times 10^{-34}$ J$\\cdot$s\n- $f$ = frequency (Hz)\n- $\\lambda$ = wavelength (m)\n\nHigher frequency = more energy per photon. This explains why gamma rays are more dangerous than radio waves.'),
  q(7, 'A photon of green light has a wavelength of 500 nm. What is its energy? (h = 6,63 x 10$^{-34}$ J$\\cdot$s, c = 3 x 10$^8$ m/s)',
    ['3,98 x 10$^{-19}$ J', '3,98 x 10$^{-25}$ J', '9,95 x 10$^{-26}$ J', '1,33 x 10$^{-18}$ J'], 0,
    'E = hc/lambda = (6,63 x 10^-34)(3 x 10^8) / (500 x 10^-9) = (1,989 x 10^-25) / (5 x 10^-7) = 3,978 x 10^-19 J.',
    ['Convert nm to m: 500 nm = 500 x 10^-9 m. Then use E = hc/lambda.']),
  t(8, '## EM Radiation and the Atmosphere\n\nThe Earth\'s atmosphere absorbs certain types of EM radiation:\n\n- **Ozone layer** absorbs most **UV radiation** — protecting life from harmful UV-B and UV-C.\n- **Water vapour and CO$_2$** absorb **infrared radiation** — this is the **greenhouse effect** that keeps Earth warm.\n- **Radio waves** and **visible light** pass through the atmosphere relatively unaffected.\n\n### Dangers of EM Radiation\n\n| Type | Danger |\n|---|---|\n| UV | Sunburn, skin cancer, cataracts |\n| X-rays | Cell damage, mutations |\n| Gamma rays | Cell damage, radiation sickness |\n\n**In South Africa**, UV levels are particularly high due to our latitude. The Cancer Association of South Africa (CANSA) recommends using SPF 30+ sunscreen and wearing protective clothing.'),
  q(9, 'The ozone layer primarily protects us from:',
    ['Ultraviolet radiation', 'Gamma rays', 'Radio waves', 'Infrared radiation'], 0,
    'The ozone (O3) layer in the stratosphere absorbs most of the harmful ultraviolet radiation from the Sun, protecting life on Earth.'),
  fb(10, 'Planck\'s constant is $h$ = ___ $\\times 10^{-34}$ J$\\cdot$s. The energy of a photon is calculated using $E$ = ___.',
    ['6,63', 'hf'],
    'h = 6,63 x 10^-34 J.s. E = hf or equivalently E = hc/lambda.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Electrostatics (Term 1 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Electric Charge\n\nAll matter is made up of atoms, which contain:\n- **Protons** (positive charge, in the nucleus)\n- **Neutrons** (no charge, in the nucleus)\n- **Electrons** (negative charge, orbiting the nucleus)\n\nAn object becomes **charged** when electrons are transferred from one object to another:\n- **Positive charge:** Object has lost electrons (fewer electrons than protons).\n- **Negative charge:** Object has gained electrons (more electrons than protons).\n\n**The unit of charge** is the coulomb (C). The charge on one electron is $1{,}6 \\times 10^{-19}$ C.\n\n$$Q = nq_e$$\nWhere $Q$ = total charge, $n$ = number of excess/deficit electrons, $q_e = 1{,}6 \\times 10^{-19}$ C.'),
  q(2, 'An object has a charge of -3,2 x 10$^{-19}$ C. How many excess electrons does it have?',
    ['2', '1', '3', '4'], 0,
    'n = Q / q_e = (3,2 x 10^-19) / (1,6 x 10^-19) = 2 excess electrons.',
    ['Divide the total charge by the charge on one electron.']),
  t(3, '## Conservation of Charge and Charging Methods\n\n### Principle of Conservation of Charge\nCharge cannot be created or destroyed — it can only be **transferred** from one object to another. The total charge in an isolated system remains constant.\n\n### Charging by Contact (Friction)\n- Rubbing two objects transfers electrons from one to the other.\n- The object that gains electrons becomes negative; the object that loses electrons becomes positive.\n- **Triboelectric charging:** Rubbing a glass rod with silk — glass becomes positive (loses electrons to silk).\n\n### Charging by Induction\n- A charged object is brought near (but does not touch) a neutral conductor.\n- Charges in the conductor are rearranged (electrons move toward or away from the charged object).\n- The conductor is then grounded (earthed) and the charged object removed.\n- The conductor is left with a net charge **opposite** to the charging object.'),
  q(4, 'A positively charged rod is brought near a neutral metal sphere. The side of the sphere closest to the rod will have:',
    ['A negative charge (electrons attracted to that side)', 'A positive charge', 'No charge at all', 'Both positive and negative charges equally distributed'], 0,
    'Electrons (negative) in the metal sphere are attracted toward the positive rod and accumulate on the near side, leaving the far side positive. This is charge separation by induction.'),
  fb(5, 'When a glass rod is rubbed with silk, the glass becomes ___ charged because it ___ electrons.',
    ['positively', 'loses'],
    'The glass rod loses electrons to the silk, so it has more protons than electrons and becomes positively charged.'),
  t(6, '## The Electroscope\n\nA **gold-leaf electroscope** is used to detect electric charge.\n\n**Parts:** A metal cap, a metal rod, and a thin gold leaf attached to the rod, all inside a glass case.\n\n**How it works:**\n1. When a charged object touches the cap, charge transfers to the rod and leaf.\n2. The rod and leaf both get the same type of charge.\n3. Like charges repel, so the gold leaf deflects (moves away from the rod).\n4. Greater charge = greater deflection.\n\n**Testing the sign of a charge:**\n- Charge the electroscope with a known charge (e.g., positive).\n- Bring the unknown object near the cap.\n- If the leaf deflects more: unknown is the same sign.\n- If the leaf deflects less (or collapses): unknown is the opposite sign.'),
  q(7, 'A negatively charged electroscope has its leaf deflected. A positively charged rod is brought near the cap. The leaf will:',
    ['Deflect less (collapse slightly)', 'Deflect more', 'Stay the same', 'Fall off'], 0,
    'The positive rod attracts some of the excess electrons upward toward the cap, reducing the excess negative charge on the leaf. With less charge, the repulsion decreases and the leaf collapses slightly.'),
  t(8, '## Coulomb\'s Law (Qualitative)\n\nThe force between two charged objects:\n- **Like charges repel** (positive-positive or negative-negative).\n- **Unlike charges attract** (positive-negative).\n\nThe force:\n- **Increases** when the charges are larger.\n- **Increases** when the charges are closer together.\n\nThis is described by Coulomb\'s Law (studied quantitatively in Grade 11):\n$$F = \\frac{kQ_1 Q_2}{r^2}$$\n\nAt Grade 10 level, you need to understand the **qualitative** behaviour — how the force changes when charge or distance changes — but you will not be asked to calculate the force.'),
  fb(9, 'Like charges ___ each other, while unlike charges ___ each other.',
    ['repel', 'attract'],
    'Positive-positive or negative-negative charges repel. Positive-negative charges attract.'),
  q(10, 'If the distance between two charged objects is doubled, the electrostatic force between them:',
    ['Decreases to one quarter', 'Halves', 'Doubles', 'Stays the same'], 0,
    'From Coulomb\'s Law, F is proportional to 1/r^2. If r doubles, F becomes F/(2^2) = F/4, one quarter of the original.',
    ['The force depends on the inverse square of the distance.']),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Electric Circuits (Term 1/2 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Electric Circuits: Basic Concepts\n\nAn electric circuit provides a **closed path** for current to flow.\n\n### Key Concepts\n\n| Quantity | Symbol | Unit | Description |\n|---|---|---|---|\n| Potential difference (voltage) | $V$ | Volt (V) | Energy per unit charge; \"pushes\" current |\n| Current | $I$ | Ampere (A) | Rate of flow of charge |\n| Resistance | $R$ | Ohm ($\\Omega$) | Opposition to current flow |\n\n**Current** is the rate of flow of charge:\n$$I = \\frac{Q}{\\Delta t}$$\n\nWhere $Q$ = charge (C) and $\\Delta t$ = time (s).\n\n**Conventional current** flows from positive to negative (opposite to electron flow).\n\n### Measuring Instruments\n- **Ammeter:** Measures current. Connected in **series**.\n- **Voltmeter:** Measures potential difference. Connected in **parallel**.'),
  q(2, 'An ammeter is connected in a circuit by placing it in:',
    ['Series with the component being measured', 'Parallel with the component being measured', 'Either series or parallel', 'It is not connected to the circuit'], 0,
    'An ammeter must be connected in series so that all the current flows through it. A voltmeter is connected in parallel.'),
  t(3, '## Ohm\'s Law\n\n> The potential difference across a conductor is directly proportional to the current through it, provided the temperature remains constant.\n\n$$V = IR$$\n\nWhere:\n- $V$ = potential difference (V)\n- $I$ = current (A)\n- $R$ = resistance ($\\Omega$)\n\nThis can be rearranged:\n$$I = \\frac{V}{R} \\qquad R = \\frac{V}{I}$$\n\nAn **ohmic conductor** obeys Ohm\'s Law — its resistance stays constant (e.g., a metal wire at constant temperature). The $V$-$I$ graph is a **straight line** through the origin.\n\nA **non-ohmic conductor** does not obey Ohm\'s Law — its resistance changes (e.g., a light bulb filament heats up, increasing resistance).'),
  q(4, 'A resistor has a potential difference of 6 V across it and a current of 0,5 A flows through it. What is its resistance?',
    ['12 ohm', '3 ohm', '6,5 ohm', '0,5 ohm'], 0,
    'R = V/I = 6/0,5 = 12 ohm.',
    ['Use R = V / I.']),
  fb(5, 'Ohm\'s Law states that $V$ = ___. An ohmic conductor has a ___ V-I graph through the origin.',
    ['IR', 'straight-line'],
    'V = IR. An ohmic conductor has constant resistance, producing a linear (straight-line) V-I graph.'),
  t(6, '## Resistors in Series\n\nWhen resistors are connected **in series** (end to end, one path for current):\n\n- **Current** is the same through each resistor: $I_{total} = I_1 = I_2 = I_3$\n- **Voltage** divides across the resistors: $V_{total} = V_1 + V_2 + V_3$\n- **Total resistance:** $R_s = R_1 + R_2 + R_3$\n\n**Example:** Three resistors of 2 $\\Omega$, 3 $\\Omega$, and 5 $\\Omega$ are connected in series to a 20 V battery.\n$$R_s = 2 + 3 + 5 = 10 \\;\\Omega$$\n$$I = \\frac{V}{R_s} = \\frac{20}{10} = 2 \\text{ A}$$\n$$V_1 = IR_1 = 2 \\times 2 = 4 \\text{ V}$$\n$$V_2 = IR_2 = 2 \\times 3 = 6 \\text{ V}$$\n$$V_3 = IR_3 = 2 \\times 5 = 10 \\text{ V}$$\nCheck: $4 + 6 + 10 = 20$ V ✓'),
  q(7, 'Two resistors of 4 ohm and 6 ohm are connected in series to a 20 V battery. What is the current in the circuit?',
    ['2 A', '5 A', '0,5 A', '10 A'], 0,
    'R_total = 4 + 6 = 10 ohm. I = V/R = 20/10 = 2 A.',
    ['First find the total resistance (add in series), then use Ohm\'s Law.']),
  t(8, '## Resistors in Parallel\n\nWhen resistors are connected **in parallel** (across each other, multiple paths):\n\n- **Voltage** is the same across each branch: $V_{total} = V_1 = V_2 = V_3$\n- **Current** divides: $I_{total} = I_1 + I_2 + I_3$\n- **Total resistance:** $\\frac{1}{R_p} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}$\n\nThe total resistance of parallel resistors is always **less** than the smallest individual resistor.\n\n**Example:** Two resistors of 6 $\\Omega$ and 3 $\\Omega$ in parallel:\n$$\\frac{1}{R_p} = \\frac{1}{6} + \\frac{1}{3} = \\frac{1}{6} + \\frac{2}{6} = \\frac{3}{6} = \\frac{1}{2}$$\n$$R_p = 2 \\;\\Omega$$'),
  q(9, 'Three resistors of 6 ohm each are connected in parallel. The total resistance is:',
    ['2 ohm', '18 ohm', '6 ohm', '3 ohm'], 0,
    '1/R = 1/6 + 1/6 + 1/6 = 3/6 = 1/2, so R = 2 ohm. For n identical resistors in parallel: R_total = R/n = 6/3 = 2 ohm.',
    ['For identical resistors in parallel, divide one resistor value by the number of resistors.']),
  fb(10, 'In a series circuit, ___ is the same through all components. In a parallel circuit, ___ is the same across all branches.',
    ['current', 'voltage'],
    'Series: same current, voltage divides. Parallel: same voltage, current divides.'),
];

blockNum = 0;
const ch5_lesson2 = [
  t(1, '## Electrical Energy and Power\n\nElectrical energy is the energy transferred by a current in a circuit.\n\n$$E = VIt = I^2Rt = \\frac{V^2}{R}t$$\n\n**Electrical power** is the rate at which electrical energy is transferred:\n\n$$P = VI = I^2R = \\frac{V^2}{R}$$\n\nWhere:\n- $P$ = power (W, watts)\n- $E$ = energy (J, joules)\n- $t$ = time (s)\n\n### Eskom and Electricity Billing\n\nIn South Africa, Eskom bills electricity in **kilowatt-hours (kWh)**.\n$$1 \\text{ kWh} = 1\\,000 \\text{ W} \\times 3\\,600 \\text{ s} = 3{,}6 \\times 10^6 \\text{ J}$$\n\n**Example:** A 2 000 W heater runs for 3 hours.\n$$E = 2 \\text{ kW} \\times 3 \\text{ h} = 6 \\text{ kWh}$$\nAt R2,80 per kWh (typical Eskom prepaid rate), cost = $6 \\times 2{,}80$ = R16,80.'),
  q(2, 'A 100 W light bulb is left on for 10 hours. How much energy does it use (in kWh)?',
    ['1 kWh', '10 kWh', '100 kWh', '0,1 kWh'], 0,
    'E = P x t = 0,1 kW x 10 h = 1 kWh.',
    ['Convert watts to kilowatts: 100 W = 0,1 kW. Then E = P x t.']),
  t(3, '## Series and Parallel in Practice\n\n### Why Parallel Is Used in Homes\n\nHousehold appliances are connected in **parallel** because:\n1. Each appliance gets the **full mains voltage** (230 V in South Africa).\n2. Appliances can be **switched on/off independently** without affecting others.\n3. If one appliance breaks, the others still work.\n\n### Why Series Is Sometimes Used\n- Old-style fairy lights (Christmas lights) — if one bulb blows, they all go out.\n- A switch is always in series with the component it controls.\n- Fuses and circuit breakers are connected in series to protect circuits.'),
  q(4, 'Household appliances are connected in parallel because:',
    ['Each gets the full supply voltage and can operate independently', 'It uses less wire', 'It makes the circuit simpler', 'The total resistance is higher'], 0,
    'Parallel connection ensures each appliance receives the full mains voltage (230 V) and can be switched on or off independently.'),
  t(5, '## Circuit Diagrams and Symbols\n\nStandard circuit symbols must be used:\n\n| Component | Symbol description |\n|---|---|\n| Cell | Two lines (long thin = +, short thick = -) |\n| Battery | Multiple cells in series |\n| Resistor | Rectangle or zigzag |\n| Bulb / Lamp | Circle with cross |\n| Switch | Break in line with contact |\n| Ammeter | Circle with A |\n| Voltmeter | Circle with V |\n\n### Drawing Circuit Diagrams\n- Use a ruler for straight lines.\n- Make neat, rectangular circuits.\n- Place ammeters in series (in the line).\n- Place voltmeters in parallel (across components).\n- Label all component values.'),
  fb(6, 'A voltmeter is connected in ___ across a component. A switch is connected in ___ with the component it controls.',
    ['parallel', 'series'],
    'Voltmeters measure potential difference and must be in parallel. Switches must be in series to break/complete the circuit for a specific component.'),
  t(7, '## Resistance and Temperature\n\n**For a metal conductor:**\n- As temperature increases, resistance **increases**.\n- The metal atoms vibrate more, making it harder for electrons to flow.\n- This is why a light bulb filament has higher resistance when hot than when cold.\n\n**For a thermistor (NTC type):**\n- As temperature increases, resistance **decreases**.\n- Used in thermometers and temperature sensors.\n\n**For a light-dependent resistor (LDR):**\n- As light intensity increases, resistance **decreases**.\n- Used in automatic lights and burglar alarms.'),
  q(8, 'As the temperature of a metal wire increases, its resistance:',
    ['Increases', 'Decreases', 'Stays the same', 'First increases then decreases'], 0,
    'In metals, higher temperature causes atoms to vibrate more vigorously, impeding electron flow and increasing resistance.'),
  q(9, 'Two identical bulbs are connected: first in series and then in parallel to the same battery. In which case do the bulbs glow brighter?',
    ['In parallel', 'In series', 'Same brightness in both', 'Cannot be determined'], 0,
    'In parallel, each bulb gets the full battery voltage and has more current through it. In series, the voltage is shared, so each bulb gets less voltage and glows dimmer.',
    ['Think about how much voltage each bulb receives in each arrangement.']),
  fb(10, 'In South Africa, the mains supply voltage is ___ V. Electricity is billed in units of ___.',
    ['230', 'kWh'],
    'South African mains voltage is 230 V (AC). Eskom bills electricity in kilowatt-hours.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Magnetism (Term 1 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Magnetism\n\n### Magnetic Poles and Fields\n\nEvery magnet has a **north pole** and a **south pole**.\n- **Like poles repel** (N–N or S–S).\n- **Unlike poles attract** (N–S).\n- Poles always exist in pairs — you cannot have an isolated north or south pole (no magnetic monopoles).\n\nA **magnetic field** is the region around a magnet where a magnetic force is experienced. It is represented by **field lines**:\n- Field lines go from **north to south** (outside the magnet).\n- They never cross.\n- Closer field lines = stronger magnetic field.\n- Inside the magnet, field lines go from south to north (forming closed loops).'),
  q(2, 'Magnetic field lines around a bar magnet:',
    ['Go from north to south outside the magnet', 'Go from south to north outside the magnet', 'Start at the north pole and end in space', 'Are always straight lines'], 0,
    'Outside the magnet, field lines run from the north pole to the south pole. Inside the magnet, they complete the loop from south to north.'),
  t(3, '## The Earth as a Magnet\n\nThe Earth behaves like a giant bar magnet:\n- The Earth\'s **geographic North Pole** is near a **magnetic south pole** (this is why the north end of a compass needle points toward geographic north — unlike poles attract).\n- A **compass** aligns with the Earth\'s magnetic field.\n\n**Declination** is the angle between geographic north and magnetic north at a particular location. In South Africa, the declination varies from roughly 15$\\degree$ W in Cape Town to about 25$\\degree$ W in Durban.\n\n### Compass and Navigation\n- A compass needle is a small magnet that aligns with the Earth\'s magnetic field.\n- Navigators must correct for declination when using a compass for accurate bearings.'),
  fb(4, 'Like magnetic poles ___ each other. The Earth\'s geographic North Pole is near a magnetic ___ pole.',
    ['repel', 'south'],
    'Like poles repel, unlike attract. The north end of a compass points to geographic north because it is attracted to the magnetic south pole located there.'),
  t(5, '## Electromagnets\n\nAn **electromagnet** is a temporary magnet created by passing an electric current through a coil of wire wound around an iron core.\n\n**Advantages over permanent magnets:**\n- Can be switched **on and off**.\n- The strength can be varied by changing the current.\n- The polarity can be reversed by reversing the current direction.\n\n**Factors that increase the strength of an electromagnet:**\n1. Increasing the **current**.\n2. Increasing the **number of turns** of wire in the coil.\n3. Using a **soft iron core** (easy to magnetise and demagnetise).\n\n**Applications in South Africa:**\n- Electric bells and buzzers.\n- Maglev technology research.\n- Scrapyard cranes for lifting iron and steel.\n- Electromagnetic locks in security gates.'),
  q(6, 'Which of the following will NOT increase the strength of an electromagnet?',
    ['Using a wooden core instead of iron', 'Increasing the current', 'Adding more turns of wire', 'Using a thicker iron core'], 0,
    'Wood is not a ferromagnetic material and will not enhance the magnetic field. An iron core concentrates the magnetic field, making the electromagnet much stronger.'),
  t(7, '## Magnetic Materials\n\n**Ferromagnetic materials** are strongly attracted to magnets and can be magnetised. Examples: iron, cobalt, nickel, steel.\n\n**Non-magnetic materials** are not attracted to magnets. Examples: wood, glass, plastic, copper, aluminium.\n\n### Permanent vs Temporary Magnets\n\n| Property | Permanent magnet | Temporary magnet (electromagnet) |\n|---|---|---|\n| Made from | Hard magnetic material (steel) | Soft magnetic material (iron) |\n| Retains magnetism | Yes | No (only while current flows) |\n| Strength | Fixed | Can be varied |\n| Polarity | Fixed | Can be reversed |'),
  q(8, 'Which of the following is a ferromagnetic material?',
    ['Nickel', 'Copper', 'Aluminium', 'Plastic'], 0,
    'Nickel, along with iron and cobalt, is a ferromagnetic material — it is strongly attracted to magnets and can be magnetised. Copper and aluminium are non-magnetic.'),
  fb(9, 'The three main ferromagnetic elements are iron, cobalt, and ___. An electromagnet uses a ___ iron core because it is easily demagnetised.',
    ['nickel', 'soft'],
    'Iron, cobalt, and nickel are ferromagnetic. Soft iron magnetises and demagnetises easily, which is ideal for electromagnets.'),
  q(10, 'A compass works because:',
    ['Its needle is a small magnet that aligns with the Earth\'s magnetic field', 'It contains an electric motor', 'It uses GPS technology', 'It responds to the Earth\'s gravitational field'], 0,
    'A compass needle is a magnetised piece of metal that is free to rotate and align with the Earth\'s magnetic field, pointing toward magnetic south (near geographic north).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Matter and Classification (Term 2 — Chemistry)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Classification of Matter\n\nMatter is anything that has mass and occupies space. It can be classified as follows:\n\n### Pure Substances\n- **Elements:** Made of only one type of atom. Cannot be broken down further by chemical means.\n  - Examples: Gold (Au), Oxygen (O$_2$), Iron (Fe), Carbon (C)\n- **Compounds:** Made of two or more elements chemically bonded in a fixed ratio.\n  - Examples: Water (H$_2$O), Table salt (NaCl), Carbon dioxide (CO$_2$)\n\n### Mixtures\n- Two or more substances physically combined (not chemically bonded).\n- **Homogeneous mixture:** Uniform composition throughout (e.g., salt water, air, alloys like steel).\n- **Heterogeneous mixture:** Non-uniform composition — components can be distinguished (e.g., sand and water, salad, granite).'),
  q(2, 'Which of the following is a compound?',
    ['Water (H$_2$O)', 'Oxygen gas (O$_2$)', 'Gold (Au)', 'Air'], 0,
    'Water (H2O) is a compound — it consists of two different elements (hydrogen and oxygen) chemically bonded. Oxygen gas and gold are elements. Air is a mixture.'),
  fb(3, 'A ___ mixture has a uniform composition, while a ___ mixture has a non-uniform composition.',
    ['homogeneous', 'heterogeneous'],
    'Homogeneous = same throughout (like salt water). Heterogeneous = different parts visible (like oil and water).'),
  t(4, '## Properties of Materials\n\n**Physical properties** can be observed or measured without changing the substance:\n- Melting point, boiling point\n- Density (mass per unit volume)\n- Strength, hardness, brittleness\n- Malleability (can be hammered into sheets)\n- Ductility (can be drawn into wires)\n- Electrical and thermal conductivity\n\n**Chemical properties** describe how a substance reacts:\n- Flammability\n- Reactivity with acids, water, or oxygen\n- Corrosion (rusting)\n\n### Metals vs Non-metals\n\n| Property | Metals | Non-metals |\n|---|---|---|\n| Lustre | Shiny | Dull |\n| Conductivity | Good conductors | Poor conductors (insulators) |\n| Malleability | Malleable | Brittle |\n| State (at room temp) | Mostly solid (except Hg) | Solid, liquid, or gas |\n| Melting point | Generally high | Generally low |'),
  q(5, 'Which property describes the ability of a material to be drawn into wires?',
    ['Ductility', 'Malleability', 'Brittleness', 'Conductivity'], 0,
    'Ductility is the ability to be pulled into wires. Malleability is the ability to be hammered into sheets. Copper is both ductile and malleable.'),
  t(6, '## Separating Mixtures\n\nMixtures can be separated using physical methods based on differences in physical properties:\n\n| Method | Property used | Example |\n|---|---|---|\n| Filtration | Particle size | Sand from water |\n| Evaporation | Boiling point | Salt from salt water |\n| Distillation | Boiling point difference | Separating alcohol from water |\n| Chromatography | Solubility / adsorption | Separating dye colours |\n| Magnetic separation | Magnetism | Iron filings from sand |\n| Decanting | Density | Oil from water |\n\n**In South Africa**, water purification at municipal plants uses several of these methods: sedimentation, filtration, and chemical treatment to produce clean drinking water.'),
  q(7, 'Which separation method would you use to obtain pure water from a salt solution?',
    ['Distillation', 'Filtration', 'Magnetic separation', 'Chromatography'], 0,
    'Distillation uses the difference in boiling points. Water evaporates, leaving salt behind, and the steam is then condensed to collect pure water. Filtration would not work because salt is dissolved.'),
  fb(8, 'Filtration separates based on ___ size. Distillation separates based on different ___ points.',
    ['particle', 'boiling'],
    'Filtration uses a filter to trap large insoluble particles. Distillation heats the mixture to separate components with different boiling points.'),
  q(9, 'Steel is best classified as:',
    ['A homogeneous mixture (alloy)', 'A compound', 'An element', 'A heterogeneous mixture'], 0,
    'Steel is an alloy (a mixture of iron and carbon, sometimes with other elements). Alloys are homogeneous mixtures — the components are evenly distributed throughout.'),
  t(10, '## Naming and Formulae of Compounds\n\n### Molecular Formulae\nThe molecular formula shows the actual number of atoms of each element in a molecule:\n- H$_2$O: 2 hydrogen atoms and 1 oxygen atom\n- CO$_2$: 1 carbon atom and 2 oxygen atoms\n- H$_2$SO$_4$: 2 hydrogen, 1 sulphur, 4 oxygen atoms\n\n### Naming Ionic Compounds\n- Name the metal (cation) first, then the non-metal (anion) with the ending changed to **-ide**.\n- NaCl = sodium chloride\n- MgO = magnesium oxide\n- CaBr$_2$ = calcium bromide\n\n### Naming Covalent Compounds\n- Use prefixes: mono-, di-, tri-, tetra-, penta-, hexa-\n- CO = carbon monoxide\n- CO$_2$ = carbon dioxide\n- N$_2$O$_5$ = dinitrogen pentoxide'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: States of Matter and the Kinetic Molecular Theory (Term 2 — Chemistry)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## States of Matter\n\nMatter exists in three main states:\n\n| Property | Solid | Liquid | Gas |\n|---|---|---|---|\n| Shape | Fixed | Takes shape of container | Fills container |\n| Volume | Fixed | Fixed | Fills container |\n| Compressibility | Very low | Very low | Highly compressible |\n| Particle arrangement | Regular, closely packed | Irregular, close | Random, far apart |\n| Particle motion | Vibrate in fixed positions | Slide past each other | Move freely at high speed |\n| Particle forces | Strong | Moderate | Very weak |\n\n### Changes of State\n\n- **Melting** (solid → liquid): particles gain energy to overcome some forces\n- **Boiling/Evaporation** (liquid → gas): particles gain energy to overcome remaining forces\n- **Condensation** (gas → liquid): particles lose energy\n- **Freezing** (liquid → solid): particles lose energy\n- **Sublimation** (solid → gas directly): e.g., dry ice (CO$_2$)'),
  q(2, 'During melting, the temperature of a pure substance:',
    ['Remains constant until all the solid has melted', 'Increases steadily', 'Decreases', 'Fluctuates randomly'], 0,
    'At the melting point, all added energy is used to break intermolecular forces (latent heat), not to increase temperature. The temperature stays constant until all the solid has melted.'),
  fb(3, 'In solids, particles ___ in fixed positions. In gases, particles move ___ and are far apart.',
    ['vibrate', 'freely'],
    'Solid particles vibrate around fixed positions due to strong forces. Gas particles move randomly at high speeds with very weak forces between them.'),
  t(4, '## The Kinetic Molecular Theory (KMT)\n\nThe Kinetic Molecular Theory explains the behaviour of matter in its three states:\n\n1. All matter is made up of **particles** (atoms, molecules, or ions).\n2. These particles are in **constant motion** — the higher the temperature, the faster they move.\n3. There are **forces of attraction** between particles (intermolecular forces).\n4. The state of matter depends on the balance between the **kinetic energy** of the particles (makes them move apart) and the **intermolecular forces** (pull them together).\n\n### Explaining Changes of State with KMT\n\n- **Heating a solid:** Particles vibrate faster → at the melting point, they gain enough energy to break out of fixed positions → liquid.\n- **Heating a liquid:** Particles move faster → at the boiling point, they gain enough energy to completely overcome intermolecular forces → gas.\n- **Cooling a gas:** Particles slow down → intermolecular forces pull them closer → liquid → solid.'),
  q(5, 'According to the Kinetic Molecular Theory, what determines whether a substance is a solid, liquid, or gas?',
    ['The balance between kinetic energy and intermolecular forces', 'The number of atoms in the molecule', 'The type of chemical bond', 'The pressure only'], 0,
    'If intermolecular forces dominate: solid. If kinetic energy and forces are comparable: liquid. If kinetic energy dominates: gas.'),
  t(6, '## Heating and Cooling Curves\n\nA **heating curve** shows how the temperature of a substance changes as heat energy is added over time.\n\n### Key Features of a Heating Curve:\n\n1. **Sloping sections:** Temperature increases. The substance is in one phase (solid, liquid, or gas). Energy increases kinetic energy.\n2. **Flat (horizontal) sections:** Temperature is constant. A phase change is occurring (melting or boiling). Energy is used to break intermolecular forces — this is called **latent heat**.\n\n### Important Temperatures:\n- **Melting point (flat section 1):** Solid → liquid\n- **Boiling point (flat section 2):** Liquid → gas\n\nA **cooling curve** is the reverse — flat sections occur at the boiling point (condensation) and melting point (freezing).\n\n**Example:** For water:\n- Melting point = 0 $\\degree$C\n- Boiling point = 100 $\\degree$C (at standard atmospheric pressure)'),
  q(7, 'On a heating curve, a flat (horizontal) section indicates that:',
    ['A phase change is occurring and temperature remains constant', 'The substance is cooling down', 'No energy is being added', 'The substance has reached its maximum temperature'], 0,
    'During a phase change, all added energy is used to break or form intermolecular forces (latent heat). The temperature does not change until the phase change is complete.'),
  fb(8, 'The energy used during a phase change without temperature change is called ___ heat. On a heating curve, there are ___ flat sections (at the melting and boiling points).',
    ['latent', 'two'],
    'Latent heat is the energy absorbed or released during a phase change at constant temperature. A pure substance has two flat sections: melting and boiling.'),
  t(9, '## Evaporation vs Boiling\n\n| Feature | Evaporation | Boiling |\n|---|---|---|\n| Temperature | Below boiling point | At boiling point |\n| Where it occurs | Surface of liquid only | Throughout the liquid |\n| Rate | Slow | Rapid |\n| Bubbles | No | Yes |\n| Energy source | Surroundings | External heat source |\n\n**Factors that increase evaporation rate:**\n1. Higher temperature (more energetic particles).\n2. Larger surface area.\n3. Wind/air movement (removes vapour above surface).\n4. Lower humidity.\n\n**South African context:** The Vaal Dam and other water reservoirs lose significant water through evaporation, especially during the hot Highveld summers.'),
  q(10, 'Evaporation differs from boiling because evaporation:',
    ['Occurs only at the surface and at temperatures below the boiling point', 'Occurs throughout the liquid', 'Only happens at 100 degrees C', 'Produces bubbles within the liquid'], 0,
    'Evaporation is a surface phenomenon that occurs at any temperature below the boiling point. Boiling occurs throughout the liquid at the boiling point with visible bubbles.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: The Atom (Term 2 — Chemistry)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Atomic Structure\n\nThe atom consists of:\n\n| Particle | Charge | Mass (u) | Location |\n|---|---|---|---|\n| Proton (p) | +1 | 1 | Nucleus |\n| Neutron (n) | 0 | 1 | Nucleus |\n| Electron (e) | -1 | $\\approx$ 0 (1/1836) | Electron cloud / orbitals |\n\n### Key Numbers\n\n- **Atomic number ($Z$):** Number of protons. This defines the element.\n$$Z = \\text{number of protons}$$\n\n- **Mass number ($A$):** Total number of protons and neutrons.\n$$A = Z + N$$\nWhere $N$ = number of neutrons.\n\n- In a **neutral atom**, the number of electrons = number of protons.\n\n**Notation:** ${}^A_Z \\text{X}$ — for example, ${}^{23}_{11}\\text{Na}$ means sodium has 11 protons and 12 neutrons.'),
  q(2, 'An atom of aluminium has atomic number 13 and mass number 27. How many neutrons does it have?',
    ['14', '13', '27', '40'], 0,
    'Neutrons = mass number - atomic number = A - Z = 27 - 13 = 14.',
    ['Use N = A - Z.']),
  t(3, '## Isotopes\n\n**Isotopes** are atoms of the **same element** (same number of protons) that have **different numbers of neutrons** (and therefore different mass numbers).\n\n**Examples:**\n- Carbon-12 (${}^{12}_6$C): 6 protons, 6 neutrons\n- Carbon-13 (${}^{13}_6$C): 6 protons, 7 neutrons\n- Carbon-14 (${}^{14}_6$C): 6 protons, 8 neutrons (radioactive)\n\n**Relative atomic mass** on the periodic table is the weighted average of the masses of all naturally occurring isotopes of an element.\n\n$$\\text{Relative atomic mass} = \\sum (\\text{isotope mass} \\times \\text{fractional abundance})$$\n\n**Example:** Chlorine has two isotopes: ${}^{35}$Cl (75%) and ${}^{37}$Cl (25%).\n$$M_r = (35 \\times 0{,}75) + (37 \\times 0{,}25) = 26{,}25 + 9{,}25 = 35{,}5$$'),
  q(4, 'Two isotopes of an element differ in their number of:',
    ['Neutrons', 'Protons', 'Electrons', 'Protons and electrons'], 0,
    'Isotopes have the same number of protons (same element) but different numbers of neutrons, giving them different mass numbers.'),
  fb(5, 'The atomic number ($Z$) equals the number of ___. Isotopes have the same atomic number but different ___ numbers.',
    ['protons', 'mass'],
    'Z = number of protons (defines the element). Isotopes differ in mass number because they have different numbers of neutrons.'),
  t(6, '## Electron Configuration\n\nElectrons are arranged in **energy levels** (shells) around the nucleus.\n\n| Energy level ($n$) | Maximum electrons ($2n^2$) |\n|---|---|\n| 1 | 2 |\n| 2 | 8 |\n| 3 | 18 (but often fills to 8 first) |\n| 4 | 32 |\n\n**Rules for filling electrons:**\n1. Fill the lowest energy level first (closest to the nucleus).\n2. Each energy level fills to its maximum before the next level begins (with some exceptions for transition metals).\n\n**Examples:**\n- Hydrogen ($Z = 1$): 1\n- Carbon ($Z = 6$): 2, 4\n- Sodium ($Z = 11$): 2, 8, 1\n- Chlorine ($Z = 17$): 2, 8, 7\n- Calcium ($Z = 20$): 2, 8, 8, 2\n\nThe **valence electrons** (outermost shell) determine the chemical properties of an element.'),
  q(7, 'What is the electron configuration of potassium ($Z = 19$)?',
    ['2, 8, 8, 1', '2, 8, 9', '2, 8, 1', '2, 8, 8, 3'], 0,
    'Potassium has 19 electrons: 2 in the first shell, 8 in the second, 8 in the third, and 1 in the fourth. The third shell fills to 8 before the fourth shell starts (for the main group elements at Grade 10 level).',
    ['Fill shells in order: 2, 8, 8, then the remaining electrons go in the next shell.']),
  t(8, '## Atomic Orbitals (Introduction)\n\nElectrons do not orbit the nucleus in fixed paths like planets. Instead, they occupy regions called **orbitals** where there is a high probability of finding the electron.\n\n### Types of Orbitals\n\n- **s-orbital:** Spherical shape. Each energy level has one s-orbital (holds 2 electrons).\n- **p-orbital:** Dumbbell shape. From level 2 onwards, there are three p-orbitals (hold 6 electrons total).\n\n### Aufbau notation (for Grade 10):\n$$\\text{Na}: 1s^2\\, 2s^2\\, 2p^6\\, 3s^1$$\n\nThis means: 2 electrons in 1s, 2 in 2s, 6 in 2p, 1 in 3s = 11 electrons total.\n\n**Hund\'s Rule:** Electrons fill orbitals of the same sublevel singly first (with parallel spins) before pairing up.\n\n**Pauli Exclusion Principle:** No more than 2 electrons in any single orbital, and they must have opposite spins.'),
  fb(9, 'The maximum number of electrons in the second energy level is ___. Valence electrons are found in the ___ shell.',
    ['8', 'outermost'],
    'Level 2 holds up to 8 electrons (2 in 2s + 6 in 2p). Valence electrons in the outermost shell determine chemical reactivity.'),
  q(10, 'An ion of sodium (Na$^+$) has:',
    ['10 electrons and 11 protons', '11 electrons and 11 protons', '12 electrons and 11 protons', '11 electrons and 10 protons'], 0,
    'Sodium (Z = 11) has 11 protons. Na+ has lost 1 electron, so it has 10 electrons. The number of protons does not change when an ion is formed.',
    ['An ion is formed by gaining or losing electrons, not protons.']),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: The Periodic Table (Term 2 — Chemistry)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## The Periodic Table\n\nThe periodic table arranges elements in order of increasing **atomic number**.\n\n### Structure\n- **Periods** (horizontal rows): 7 periods. The period number tells you the number of energy levels (shells) that contain electrons.\n- **Groups** (vertical columns): 18 groups. Elements in the same group have the same number of valence electrons and similar chemical properties.\n\n### Important Groups\n\n| Group | Name | Valence electrons | Typical behaviour |\n|---|---|---|---|\n| 1 | Alkali metals | 1 | Very reactive, form +1 ions |\n| 2 | Alkaline earth metals | 2 | Reactive, form +2 ions |\n| 17 | Halogens | 7 | Reactive non-metals, form -1 ions |\n| 18 | Noble gases | 8 (or 2 for He) | Very unreactive (stable) |\n\nThe group number (for main group elements) equals the number of valence electrons.'),
  q(2, 'Elements in the same group of the periodic table have:',
    ['The same number of valence electrons', 'The same number of energy levels', 'The same mass number', 'The same atomic number'], 0,
    'Elements in the same group have the same number of valence electrons, which gives them similar chemical properties. The period number tells the number of energy levels.'),
  t(3, '## Trends Across a Period (Left to Right)\n\nAs you move from left to right across a period:\n\n1. **Atomic number** increases (more protons).\n2. **Atomic radius** decreases — more protons pull the electrons closer to the nucleus.\n3. **Ionisation energy** increases — electrons are held more tightly and are harder to remove.\n4. **Electronegativity** increases — atoms attract bonding electrons more strongly.\n5. **Metallic character** decreases — metals are on the left, non-metals on the right.\n\n**Explanation:** Moving across a period, electrons are added to the same energy level while protons are added to the nucleus. The increased nuclear charge pulls electrons closer, resulting in a smaller atom with more tightly held electrons.'),
  q(4, 'As you move from left to right across Period 3, atomic radius:',
    ['Decreases', 'Increases', 'Stays the same', 'First increases then decreases'], 0,
    'Across a period, protons are added to the nucleus, increasing nuclear charge, which pulls electrons closer and decreases atomic radius.',
    ['Think about the effect of adding more protons to the nucleus while electrons go into the same shell.']),
  fb(5, 'As you move down a group, atomic radius ___ because more ___ are added.',
    ['increases', 'energy levels'],
    'Down a group, each element has one more electron shell, placing the outer electrons further from the nucleus, so the atom gets larger.'),
  t(6, '## Trends Down a Group (Top to Bottom)\n\nAs you move down a group:\n\n1. **Atomic radius** increases — more energy levels (shells) are added.\n2. **Ionisation energy** decreases — outer electrons are further from the nucleus and easier to remove.\n3. **Electronegativity** decreases — outer electrons are further from the nucleus.\n4. **Reactivity of metals** increases — easier to lose valence electrons.\n5. **Reactivity of halogens** decreases — harder to gain an extra electron.\n\n### Metals, Non-metals, and Metalloids\n\n- **Metals:** Left and centre of the periodic table. Lose electrons to form positive ions (cations).\n- **Non-metals:** Right side of the periodic table. Gain electrons to form negative ions (anions).\n- **Metalloids** (semi-metals): On the staircase line (B, Si, Ge, As, Sb, Te). Have properties of both metals and non-metals. Silicon is used in semiconductors for electronics.'),
  q(7, 'In Group 1 (alkali metals), which element is the most reactive?',
    ['Francium (Fr)', 'Lithium (Li)', 'Sodium (Na)', 'Potassium (K)'], 0,
    'Reactivity of metals increases down the group because the valence electron is further from the nucleus and easier to remove. Francium, at the bottom, is the most reactive.',
    ['Metal reactivity increases going down a group.']),
  t(8, '## Ionisation Energy and Electronegativity\n\n### Ionisation Energy\nThe **first ionisation energy** is the minimum energy required to remove one electron from a neutral gaseous atom.\n$$\\text{X(g)} \\rightarrow \\text{X}^+(\\text{g}) + e^-$$\n\n**Trends:**\n- Increases across a period (stronger nuclear attraction).\n- Decreases down a group (electron further from nucleus).\n- Noble gases have the highest ionisation energies (stable electron configuration).\n\n### Electronegativity\n**Electronegativity** is the ability of an atom in a molecule to attract the bonding electron pair toward itself.\n\n- Fluorine has the highest electronegativity (4,0 on the Pauling scale).\n- Increases across a period.\n- Decreases down a group.\n- Noble gases are generally not assigned electronegativity values (they rarely form bonds).'),
  q(9, 'Which element has the highest electronegativity?',
    ['Fluorine (F)', 'Oxygen (O)', 'Chlorine (Cl)', 'Nitrogen (N)'], 0,
    'Fluorine has the highest electronegativity (4,0) of all elements. It is in the top right of the periodic table (excluding noble gases).'),
  fb(10, 'Ionisation energy ___ across a period and ___ down a group.',
    ['increases', 'decreases'],
    'Across a period: more protons hold electrons tighter (higher IE). Down a group: electrons are further from the nucleus (lower IE).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: Chemical Bonding (Term 2 — Chemistry)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Chemical Bonding\n\nAtoms bond to achieve a **stable electron configuration** — usually a full outer shell of 8 electrons (the **octet rule**). Hydrogen is an exception — it needs only 2 electrons (a **duplet**).\n\n### Types of Bonds\n\n| Bond | Formed between | What happens to electrons |\n|---|---|---|\n| Ionic | Metal + Non-metal | Electrons are **transferred** |\n| Covalent | Non-metal + Non-metal | Electrons are **shared** |\n| Metallic | Metal + Metal | Electrons are **delocalised** |\n\n### Ionic Bonding\nA metal atom **loses** electrons to form a positive ion (cation), and a non-metal atom **gains** electrons to form a negative ion (anion). The oppositely charged ions attract each other — this electrostatic attraction is the ionic bond.\n\n**Example:** NaCl\n- Na (2, 8, 1) loses 1 electron → Na$^+$ (2, 8)\n- Cl (2, 8, 7) gains 1 electron → Cl$^-$ (2, 8, 8)'),
  q(2, 'In the formation of magnesium oxide (MgO), magnesium:',
    ['Loses 2 electrons to form Mg$^{2+}$', 'Gains 2 electrons to form Mg$^{2-}$', 'Shares 2 electrons with oxygen', 'Loses 1 electron to form Mg$^+$'], 0,
    'Magnesium (Group 2) has 2 valence electrons. It loses both to form Mg^2+. Oxygen gains these 2 electrons to form O^2-.'),
  t(3, '## Covalent Bonding\n\nIn a covalent bond, two non-metal atoms **share** one or more pairs of electrons.\n\n### Lewis Dot Diagrams\nLewis diagrams show the valence electrons of atoms. In a bond, shared pairs are shown between atoms; lone pairs belong to one atom.\n\n**Examples of covalent molecules:**\n\n- **H$_2$** (single bond): H—H (each H shares 1 electron to get a duplet)\n- **O$_2$** (double bond): O=O (each O shares 2 electrons to complete an octet)\n- **N$_2$** (triple bond): N≡N (each N shares 3 electrons to complete an octet)\n- **H$_2$O:** O shares 1 electron with each H, and O has 2 lone pairs\n- **NH$_3$:** N shares 1 electron with each H, and N has 1 lone pair\n- **CH$_4$:** C shares 1 electron with each H, no lone pairs on C\n\n### Single, Double, and Triple Bonds\n- Single bond: 1 shared pair (2 electrons) — longest, weakest\n- Double bond: 2 shared pairs (4 electrons)\n- Triple bond: 3 shared pairs (6 electrons) — shortest, strongest'),
  q(4, 'How many lone pairs does the oxygen atom have in a water molecule (H$_2$O)?',
    ['2 lone pairs', '1 lone pair', '3 lone pairs', '0 lone pairs'], 0,
    'Oxygen has 6 valence electrons. Two are used in bonding (one with each H), leaving 4 non-bonding electrons = 2 lone pairs.',
    ['Oxygen has 6 valence electrons. Subtract the 2 used in bonds to find lone pair electrons.']),
  fb(5, 'In a covalent bond, electrons are ___. In an ionic bond, electrons are ___.',
    ['shared', 'transferred'],
    'Covalent bonding = electron sharing (between non-metals). Ionic bonding = electron transfer (metal to non-metal).'),
  t(6, '## Metallic Bonding\n\nIn metals, the valence electrons are **delocalised** — they are not bound to individual atoms but move freely throughout the metal structure, forming a **\"sea of electrons\"**.\n\n**The metallic bond** is the electrostatic attraction between the positively charged metal ions (cations) and the \"sea\" of delocalised electrons.\n\n### Properties Explained by Metallic Bonding\n\n| Property | Explanation |\n|---|---|\n| Good electrical conductivity | Delocalised electrons can carry charge |\n| Good thermal conductivity | Delocalised electrons transfer kinetic energy |\n| Malleable & ductile | Layers of ions can slide over each other without breaking the bond |\n| High melting point | Strong electrostatic attraction between ions and electron sea |\n| Lustre (shiny) | Delocalised electrons reflect light |'),
  q(7, 'Metals are good conductors of electricity because:',
    ['They have delocalised (free-moving) electrons', 'They have covalent bonds', 'They have a rigid structure', 'They have full outer shells'], 0,
    'The delocalised electrons in the metallic bond are free to move and carry electric charge through the metal.'),
  t(8, '## Naming Compounds\n\n### Ionic Compounds\n1. Write the **cation name** first (metal), then the **anion name** (non-metal with -ide ending).\n2. For polyatomic ions, use the standard names (sulphate, nitrate, carbonate, hydroxide, etc.).\n\n| Formula | Name |\n|---|---|\n| NaCl | Sodium chloride |\n| CaCO$_3$ | Calcium carbonate |\n| KNO$_3$ | Potassium nitrate |\n| FeSO$_4$ | Iron(II) sulphate |\n\n### Covalent (Molecular) Compounds\nUse **prefixes** to indicate the number of atoms:\n\n| Prefix | Number |\n|---|---|\n| mono- | 1 (only for the second element) |\n| di- | 2 |\n| tri- | 3 |\n| tetra- | 4 |\n| penta- | 5 |\n| hexa- | 6 |\n\n| Formula | Name |\n|---|---|\n| CO | Carbon monoxide |\n| CO$_2$ | Carbon dioxide |\n| SO$_3$ | Sulphur trioxide |\n| N$_2$O$_4$ | Dinitrogen tetroxide |'),
  q(9, 'What is the correct name for PCl$_3$?',
    ['Phosphorus trichloride', 'Phosphorus chloride', 'Triphosphorus chloride', 'Phosphorus(III) chloride'], 0,
    'For covalent compounds, use prefixes. P is just phosphorus (mono- is not used for the first element). Cl3 = trichloride. So: phosphorus trichloride.'),
  fb(10, 'In metallic bonding, the valence electrons are ___ and form a \"sea of electrons\". The metallic bond is the attraction between positive ___ and this electron sea.',
    ['delocalised', 'ions'],
    'Metallic bonding involves delocalised electrons shared across all metal atoms. The positive metal ions are held together by their attraction to this electron sea.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Physical and Chemical Change (Term 2/3 — Chemistry)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Physical and Chemical Change\n\n### Physical Change\nA change in which **no new substance** is formed. The chemical composition stays the same. Usually reversible.\n- Melting ice, boiling water, dissolving sugar in water, tearing paper.\n\n### Chemical Change (Chemical Reaction)\nA change in which **new substances** are formed. The chemical composition changes. Usually irreversible.\n- Burning wood, rusting iron, cooking an egg, photosynthesis.\n\n### Signs of a Chemical Reaction\n1. **Colour change** (e.g., iron turning red-brown when it rusts)\n2. **Gas produced** (bubbles or fizzing)\n3. **Precipitate formed** (insoluble solid appears in solution)\n4. **Energy change** (heat released/absorbed, light produced)\n5. **Smell change** (new odour produced)'),
  q(2, 'Which of the following is a chemical change?',
    ['Burning magnesium in air', 'Melting ice', 'Dissolving salt in water', 'Cutting wood'], 0,
    'Burning magnesium produces a new substance (magnesium oxide). Melting, dissolving, and cutting are physical changes — no new substances are formed.'),
  fb(3, 'In a physical change, ___ new substances are formed. In a chemical change, the chemical ___ of the substance changes.',
    ['no', 'composition'],
    'Physical changes alter the form but not the identity of the substance. Chemical changes produce new substances with different chemical compositions.'),
  t(4, '## Representing Chemical Change\n\n### Word Equations\n$$\\text{Reactants} \\rightarrow \\text{Products}$$\nExample: Hydrogen + Oxygen → Water\n\n### Chemical Equations (Formula Equations)\nUse chemical formulae and balance them so that the number of atoms of each element is the same on both sides.\n\n**Balancing steps:**\n1. Write the unbalanced equation with correct formulae.\n2. Count atoms of each element on both sides.\n3. Add coefficients (numbers in front) to balance. **Never change the subscripts** — that would change the substance.\n4. Check that all elements are balanced.\n\n**Example:**\n$$\\text{Unbalanced: } H_2 + O_2 \\rightarrow H_2O$$\n$$\\text{Balanced: } 2H_2 + O_2 \\rightarrow 2H_2O$$\nCheck: 4 H on each side ✓, 2 O on each side ✓'),
  q(5, 'What is the correct balanced equation for the combustion of methane (CH$_4$)?',
    ['CH$_4$ + 2O$_2$ → CO$_2$ + 2H$_2$O', 'CH$_4$ + O$_2$ → CO$_2$ + H$_2$O', '2CH$_4$ + O$_2$ → 2CO$_2$ + H$_2$O', 'CH$_4$ + O$_2$ → CO + 2H$_2$O'], 0,
    'CH4 + 2O2 -> CO2 + 2H2O. Check: C: 1=1, H: 4=4, O: 4=4. All balanced.',
    ['Start by balancing the C atoms, then H, and finally O.']),
  t(6, '## Types of Chemical Reactions\n\n### 1. Synthesis (Combination)\nTwo or more substances combine to form one product.\n$$A + B \\rightarrow AB$$\nExample: $2\\text{Mg} + \\text{O}_2 \\rightarrow 2\\text{MgO}$\n\n### 2. Decomposition\nOne substance breaks down into two or more products.\n$$AB \\rightarrow A + B$$\nExample: $2\\text{H}_2\\text{O} \\rightarrow 2\\text{H}_2 + \\text{O}_2$ (electrolysis)\n\n### 3. Acid-Base (Neutralisation)\n$$\\text{Acid} + \\text{Base} \\rightarrow \\text{Salt} + \\text{Water}$$\nExample: $\\text{HCl} + \\text{NaOH} \\rightarrow \\text{NaCl} + \\text{H}_2\\text{O}$\n\n### 4. Acid-Metal\n$$\\text{Acid} + \\text{Metal} \\rightarrow \\text{Salt} + \\text{Hydrogen gas}$$\nExample: $2\\text{HCl} + \\text{Zn} \\rightarrow \\text{ZnCl}_2 + \\text{H}_2$\n\n### 5. Acid-Metal Carbonate\n$$\\text{Acid} + \\text{Metal carbonate} \\rightarrow \\text{Salt} + \\text{Water} + \\text{CO}_2$$\nExample: $2\\text{HCl} + \\text{CaCO}_3 \\rightarrow \\text{CaCl}_2 + \\text{H}_2\\text{O} + \\text{CO}_2$'),
  q(7, 'The reaction between an acid and a metal produces:',
    ['A salt and hydrogen gas', 'A salt and water', 'A salt and carbon dioxide', 'Only a salt'], 0,
    'Acid + Metal -> Salt + Hydrogen gas (H2). The hydrogen can be tested with a burning splint — it \"pops\".'),
  fb(8, 'In a decomposition reaction, ___ substance breaks down into two or more products. In a synthesis reaction, two or more substances combine to form ___ product.',
    ['one', 'one'],
    'Decomposition: AB -> A + B (one breaks into many). Synthesis: A + B -> AB (many combine into one).'),
  t(9, '## Conservation of Mass and Energy\n\n### Law of Conservation of Mass\nIn a chemical reaction, the **total mass of the reactants equals the total mass of the products**. Mass is neither created nor destroyed.\n\nThis is why we balance chemical equations — the same number of each type of atom must appear on both sides.\n\n### Law of Conservation of Energy\nEnergy cannot be created or destroyed — it can only be transformed from one form to another.\n\n- **Exothermic reactions** release energy (temperature of surroundings increases). Example: combustion, neutralisation.\n- **Endothermic reactions** absorb energy (temperature of surroundings decreases). Example: photosynthesis, dissolving ammonium nitrate.\n\n**South African context:** Coal-burning power stations (like Medupi and Kusile) use exothermic combustion reactions to generate electricity. The chemical energy in coal is converted to thermal energy, then to kinetic energy, and finally to electrical energy.'),
  q(10, 'In an exothermic reaction:',
    ['Energy is released to the surroundings', 'Energy is absorbed from the surroundings', 'No energy change occurs', 'Mass is lost'], 0,
    'Exothermic reactions release energy (usually as heat) to the surroundings, causing the temperature to increase. The products have less chemical energy than the reactants.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 13: Quantitative Aspects of Chemical Change (Term 2/3 — Chemistry)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch13_lesson1 = [
  t(1, '## The Mole Concept\n\nThe **mole** (mol) is the SI unit for amount of substance. One mole contains exactly $6{,}022 \\times 10^{23}$ particles. This number is called **Avogadro\'s number** ($N_A$).\n\n$$n = \\frac{N}{N_A}$$\n\nWhere:\n- $n$ = number of moles (mol)\n- $N$ = number of particles\n- $N_A = 6{,}022 \\times 10^{23}$ mol$^{-1}$\n\n**Example:** How many molecules are in 3 mol of CO$_2$?\n$$N = nN_A = 3 \\times 6{,}022 \\times 10^{23} = 1{,}807 \\times 10^{24} \\text{ molecules}$$'),
  q(2, 'How many atoms are in 0,5 mol of neon (Ne)?',
    ['3,011 x 10$^{23}$', '6,022 x 10$^{23}$', '1,204 x 10$^{24}$', '3,011 x 10$^{22}$'], 0,
    'Neon is monatomic. N = nN_A = 0,5 x 6,022 x 10^23 = 3,011 x 10^23 atoms.',
    ['Neon exists as single atoms. Use N = n x N_A.']),
  t(3, '## Molar Mass\n\n**Molar mass** ($M$) is the mass of one mole of a substance, in g$\\cdot$mol$^{-1}$. The molar mass equals the relative atomic (or molecular) mass read from the periodic table.\n\n$$n = \\frac{m}{M}$$\n\nWhere:\n- $m$ = mass (g)\n- $M$ = molar mass (g$\\cdot$mol$^{-1}$)\n\n**Examples:**\n- $M$(H$_2$O) = 2(1) + 16 = 18 g$\\cdot$mol$^{-1}$\n- $M$(NaCl) = 23 + 35,5 = 58,5 g$\\cdot$mol$^{-1}$\n- $M$(H$_2$SO$_4$) = 2(1) + 32 + 4(16) = 98 g$\\cdot$mol$^{-1}$\n\n**Example calculation:** What is the mass of 2,5 mol of CaCO$_3$?\n$$M(\\text{CaCO}_3) = 40 + 12 + 3(16) = 100 \\text{ g/mol}$$\n$$m = nM = 2{,}5 \\times 100 = 250 \\text{ g}$$'),
  q(4, 'How many moles are in 44 g of CO$_2$? (M = 44 g/mol)',
    ['1 mol', '2 mol', '44 mol', '0,5 mol'], 0,
    'n = m/M = 44/44 = 1 mol.',
    ['Use n = m / M.']),
  fb(5, 'Avogadro\'s number is $N_A$ = ___ $\\times 10^{23}$ mol$^{-1}$. The molar mass of H$_2$O is ___ g/mol.',
    ['6,022', '18'],
    'N_A = 6,022 x 10^23. M(H2O) = 2(1) + 16 = 18 g/mol.'),
  t(6, '## Concentration of Solutions\n\n$$c = \\frac{n}{V}$$\n\nWhere:\n- $c$ = concentration (mol$\\cdot$dm$^{-3}$)\n- $n$ = number of moles of solute (mol)\n- $V$ = volume of solution (dm$^3$)\n\n**Note:** 1 dm$^3$ = 1 litre = 1 000 cm$^3$.\nConvert cm$^3$ to dm$^3$: divide by 1 000.\n\n**Example:** 10 g of NaOH ($M$ = 40 g/mol) is dissolved in 500 cm$^3$ of water.\n$$n = \\frac{10}{40} = 0{,}25 \\text{ mol}$$\n$$V = \\frac{500}{1\\,000} = 0{,}5 \\text{ dm}^3$$\n$$c = \\frac{0{,}25}{0{,}5} = 0{,}5 \\text{ mol}\\cdot\\text{dm}^{-3}$$'),
  q(7, 'What is the concentration of a solution made by dissolving 5,85 g of NaCl (M = 58,5 g/mol) in 250 cm$^3$ of water?',
    ['0,4 mol/dm$^3$', '0,1 mol/dm$^3$', '4 mol/dm$^3$', '0,04 mol/dm$^3$'], 0,
    'n = m/M = 5,85/58,5 = 0,1 mol. V = 250/1000 = 0,25 dm^3. c = n/V = 0,1/0,25 = 0,4 mol/dm^3.',
    ['First find moles, then convert volume to dm^3, then use c = n/V.']),
  t(8, '## Stoichiometry\n\n**Stoichiometry** uses the balanced equation and mole ratios to calculate quantities in a chemical reaction.\n\n### Steps:\n1. Write the **balanced equation**.\n2. Identify the **mole ratio** from the coefficients.\n3. Calculate **moles** of the known substance.\n4. Use the **mole ratio** to find moles of the unknown substance.\n5. Convert to the required unit (mass, volume, etc.).\n\n**Example:**\n$$2\\text{H}_2 + \\text{O}_2 \\rightarrow 2\\text{H}_2\\text{O}$$\n\nHow much water is produced from 4 g of H$_2$?\n$$n(\\text{H}_2) = \\frac{4}{2} = 2 \\text{ mol}$$\n\nFrom the equation: 2 mol H$_2$ produces 2 mol H$_2$O.\n$$n(\\text{H}_2\\text{O}) = 2 \\text{ mol}$$\n$$m(\\text{H}_2\\text{O}) = nM = 2 \\times 18 = 36 \\text{ g}$$'),
  q(9, 'In the reaction $\\text{N}_2 + 3\\text{H}_2 \\rightarrow 2\\text{NH}_3$, how many moles of NH$_3$ are produced from 6 mol of H$_2$?',
    ['4 mol', '6 mol', '2 mol', '3 mol'], 0,
    'Mole ratio H2 : NH3 = 3 : 2. So 6 mol H2 produces (6 x 2/3) = 4 mol NH3.',
    ['Use the mole ratio from the balanced equation: 3 mol H2 produces 2 mol NH3.']),
  fb(10, 'The ___ from a balanced equation give the mole ratio. 1 dm$^3$ = ___ cm$^3$.',
    ['coefficients', '1 000'],
    'The coefficients (numbers in front of formulae) in a balanced equation give the mole ratio. 1 dm^3 = 1 000 cm^3 = 1 litre.'),
];

blockNum = 0;
const ch13_lesson2 = [
  t(1, '## Molar Volume of Gases\n\nAt **Standard Temperature and Pressure (STP)** — $T = 273$ K (0 $\\degree$C), $P = 101{,}3$ kPa:\n\nOne mole of **any** gas occupies a volume of **22,4 dm$^3$** (litres).\n\n$$n = \\frac{V}{V_m}$$\n\nWhere:\n- $V$ = volume of gas (dm$^3$)\n- $V_m$ = molar volume = 22,4 dm$^3$$\\cdot$mol$^{-1}$ (at STP)\n\n**Example:** What volume does 2 mol of oxygen gas occupy at STP?\n$$V = nV_m = 2 \\times 22{,}4 = 44{,}8 \\text{ dm}^3$$\n\n**Example:** How many moles of gas are in 5,6 dm$^3$ at STP?\n$$n = \\frac{V}{V_m} = \\frac{5{,}6}{22{,}4} = 0{,}25 \\text{ mol}$$'),
  q(2, 'What volume does 0,5 mol of CO$_2$ occupy at STP?',
    ['11,2 dm$^3$', '22,4 dm$^3$', '44,8 dm$^3$', '5,6 dm$^3$'], 0,
    'V = nV_m = 0,5 x 22,4 = 11,2 dm^3.',
    ['Use V = n x V_m. V_m = 22,4 dm^3/mol at STP.']),
  t(3, '## Percentage Composition\n\nThe **percentage composition** tells you the percentage by mass of each element in a compound.\n\n$$\\% \\text{ element} = \\frac{\\text{number of atoms} \\times M_{\\text{element}}}{M_{\\text{compound}}} \\times 100$$\n\n**Example:** Find the percentage of oxygen in H$_2$O ($M = 18$ g/mol).\n$$\\% \\text{O} = \\frac{1 \\times 16}{18} \\times 100 = 88{,}9\\%$$\n$$\\% \\text{H} = \\frac{2 \\times 1}{18} \\times 100 = 11{,}1\\%$$\nCheck: $88{,}9 + 11{,}1 = 100\\%$ ✓'),
  q(4, 'What is the percentage by mass of carbon in CO$_2$? (M(CO$_2$) = 44 g/mol)',
    ['27,3%', '50%', '12%', '72,7%'], 0,
    '% C = (12/44) x 100 = 27,3%.',
    ['Use: (mass of C atoms in formula / molar mass of compound) x 100.']),
  t(5, '## Empirical and Molecular Formulae\n\n### Empirical Formula\nThe **simplest whole-number ratio** of atoms in a compound.\n\n### Steps to find the empirical formula:\n1. Convert mass (or percentage) of each element to moles: $n = m/M$\n2. Divide all mole values by the smallest mole value.\n3. If needed, multiply to get whole numbers.\n\n**Example:** A compound contains 40% C, 6,7% H, and 53,3% O. Find its empirical formula.\n- $n$(C) = 40/12 = 3,33\n- $n$(H) = 6,7/1 = 6,7\n- $n$(O) = 53,3/16 = 3,33\n- Ratio: C : H : O = 3,33/3,33 : 6,7/3,33 : 3,33/3,33 = 1 : 2 : 1\n- Empirical formula: **CH$_2$O**\n\n### Molecular Formula\nThe **actual** number of atoms in a molecule. It is a whole-number multiple of the empirical formula.\n$$\\text{Molecular formula} = (\\text{Empirical formula}) \\times n$$\n$$n = \\frac{M_{\\text{molecular}}}{M_{\\text{empirical}}}$$\n\nIf $M$ = 180 g/mol and empirical formula CH$_2$O ($M_e = 30$): $n = 180/30 = 6$, so molecular formula = C$_6$H$_{12}$O$_6$ (glucose).'),
  q(6, 'The empirical formula of a compound is CH$_2$. If the molar mass is 42 g/mol, what is the molecular formula?',
    ['C$_3$H$_6$', 'C$_2$H$_4$', 'CH$_2$', 'C$_4$H$_8$'], 0,
    'M(empirical) = 12 + 2(1) = 14 g/mol. n = 42/14 = 3. Molecular formula = (CH2) x 3 = C3H6.',
    ['Find the ratio: molar mass / empirical formula mass.']),
  fb(7, 'The empirical formula shows the ___ whole-number ratio of atoms. At STP, the molar volume of any gas is ___ dm$^3$.',
    ['simplest', '22,4'],
    'The empirical formula is the simplest ratio. The molecular formula may be a multiple of it. V_m = 22,4 dm^3/mol at STP.'),
  t(8, '## Law of Constant Composition\n\nAlso known as the **Law of Definite Proportions**:\n\n> A chemical compound always contains the same elements in the same fixed ratio by mass, regardless of the source or method of preparation.\n\n**Example:** Water always contains hydrogen and oxygen in a mass ratio of 1 : 8 (or equivalently, 2 H atoms for every 1 O atom), whether it comes from a river, a lab, or a cloud.\n\nThis law supports the idea that compounds have fixed formulae and helps explain why we can use stoichiometry — the mole ratios are always the same for a given compound.'),
  q(9, 'According to the Law of Constant Composition, a sample of pure NaCl from South Africa and a sample from Brazil:',
    ['Have the same percentage of Na and Cl by mass', 'May have different compositions', 'Have different melting points', 'Contain different elements'], 0,
    'The Law of Constant Composition states that a pure compound always has the same elements in the same ratio by mass, regardless of its origin.'),
  fb(10, 'The percentage composition of an element = (number of atoms × $M_{\\text{element}}$ / ___) × 100. Water of ___ is the water molecules trapped in some crystals (e.g., CuSO$_4$·5H$_2$O).',
    ['M compound', 'crystallisation'],
    'Percentage composition uses the molar mass of the compound as the denominator. Hydrated salts like CuSO4·5H2O contain water of crystallisation.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 14: Vectors and Scalars (Term 3 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch14_lesson1 = [
  t(1, '## Vectors and Scalars\n\nPhysical quantities are classified as either **scalars** or **vectors**.\n\n### Scalars\nA scalar has **magnitude** (size) only.\n- Examples: distance, speed, mass, time, energy, temperature\n\n### Vectors\nA vector has both **magnitude** and **direction**.\n- Examples: displacement, velocity, acceleration, force, weight\n\n| Scalar | Vector counterpart |\n|---|---|\n| Distance | Displacement |\n| Speed | Velocity |\n\n**Representing vectors:**\n- Drawn as arrows.\n- The **length** represents magnitude (drawn to scale).\n- The **arrowhead** shows direction.\n- Vectors are written with an arrow above the symbol: $\\vec{F}$, $\\vec{v}$, $\\vec{a}$'),
  q(2, 'Which of the following is a vector quantity?',
    ['Force', 'Mass', 'Speed', 'Energy'], 0,
    'Force has both magnitude (how strong) and direction (which way). Mass, speed, and energy are scalars — they have magnitude only.'),
  fb(3, 'A scalar has only ___. A vector has both magnitude and ___.',
    ['magnitude', 'direction'],
    'Scalars: magnitude only (e.g., 5 kg). Vectors: magnitude AND direction (e.g., 5 N to the right).'),
  t(4, '## Distance and Displacement\n\n**Distance** (scalar): The total length of the path travelled. Always positive.\n\n**Displacement** (vector): The straight-line distance from the starting point to the endpoint, in a specific direction.\n\n**Example:** A learner walks 100 m north, then 40 m south.\n- Distance = 100 + 40 = **140 m**\n- Displacement = 100 - 40 = **60 m north**\n\n**Example:** A runner completes one full lap of a 400 m track and returns to the start.\n- Distance = **400 m**\n- Displacement = **0 m** (back at the starting point)\n\n**Key difference:** Distance can never be zero if you have moved, but displacement can be zero if you return to your starting point.'),
  q(5, 'A car drives 5 km east, then 3 km west. What is the displacement?',
    ['2 km east', '8 km east', '2 km west', '8 km'], 0,
    'Displacement = 5 km east - 3 km west = 2 km east. Distance would be 8 km.',
    ['Take east as positive. Displacement = 5 + (-3) = 2 km east.']),
  t(6, '## Speed and Velocity\n\n**Speed** (scalar): The rate of change of distance.\n$$\\text{speed} = \\frac{\\text{distance}}{\\text{time}} = \\frac{d}{t}$$\n\n**Velocity** (vector): The rate of change of displacement.\n$$\\vec{v} = \\frac{\\Delta \\vec{x}}{\\Delta t}$$\n\n**Average speed** = total distance / total time.\n**Average velocity** = total displacement / total time.\n\n**Example:** A cyclist rides 300 m north in 30 s, then 100 m south in 10 s.\n- Average speed = (300 + 100)/(30 + 10) = 400/40 = **10 m/s**\n- Average velocity = (300 - 100)/(30 + 10) = 200/40 = **5 m/s north**'),
  q(7, 'A car travels 60 km in 1 hour, then 40 km in 1 hour, both in the same direction. What is the average speed?',
    ['50 km/h', '100 km/h', '60 km/h', '40 km/h'], 0,
    'Average speed = total distance / total time = (60 + 40) / (1 + 1) = 100/2 = 50 km/h.',
    ['Add total distance and divide by total time.']),
  t(8, '## Adding Vectors in One Dimension\n\nVectors in one dimension (along a line) are added by choosing a positive direction and assigning signs.\n\n**Convention:** Choose one direction as positive (e.g., east or right).\n\n### Same direction:\n$$\\vec{R} = \\vec{F}_1 + \\vec{F}_2$$\nIf both forces are 10 N east: $R = 10 + 10 = 20$ N east.\n\n### Opposite directions:\nIf $\\vec{F}_1$ = 15 N east and $\\vec{F}_2$ = 10 N west:\n$$R = 15 + (-10) = 5 \\text{ N east}$$\n\nThe resultant is in the direction of the larger force.\n\n**Example:** Two rugby players push a scrum machine. Player A pushes with 400 N east. Player B pushes with 300 N west.\n$$R = 400 - 300 = 100 \\text{ N east}$$'),
  q(9, 'Two forces act on an object: 25 N to the right and 15 N to the left. What is the resultant force?',
    ['10 N to the right', '40 N to the right', '10 N to the left', '40 N to the left'], 0,
    'Take right as positive. R = 25 + (-15) = 10 N. Since positive, the resultant is 10 N to the right.'),
  fb(10, 'Average velocity = total ___ / total time. Average speed = total ___ / total time.',
    ['displacement', 'distance'],
    'Velocity uses displacement (vector). Speed uses distance (scalar). Both divide by total time.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 15: Motion in One Dimension (Term 3 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch15_lesson1 = [
  t(1, '## Acceleration\n\n**Acceleration** is the rate of change of velocity.\n\n$$\\vec{a} = \\frac{\\Delta \\vec{v}}{\\Delta t} = \\frac{\\vec{v}_f - \\vec{v}_i}{\\Delta t}$$\n\nWhere:\n- $\\vec{a}$ = acceleration (m$\\cdot$s$^{-2}$)\n- $\\vec{v}_f$ = final velocity (m$\\cdot$s$^{-1}$)\n- $\\vec{v}_i$ = initial velocity (m$\\cdot$s$^{-1}$)\n- $\\Delta t$ = time interval (s)\n\nAcceleration is a **vector** quantity.\n\n**Positive acceleration:** velocity is increasing (speeding up in the positive direction).\n**Negative acceleration (deceleration):** velocity is decreasing (slowing down in the positive direction).\n\n**Example:** A car accelerates from 10 m/s to 30 m/s in 5 s.\n$$a = \\frac{30 - 10}{5} = \\frac{20}{5} = 4 \\text{ m}\\cdot\\text{s}^{-2}$$'),
  q(2, 'A car slows down from 20 m/s to 5 m/s in 3 s. What is the acceleration?',
    ['-5 m/s$^2$', '5 m/s$^2$', '-8,3 m/s$^2$', '8,3 m/s$^2$'], 0,
    'a = (v_f - v_i) / delta t = (5 - 20) / 3 = -15/3 = -5 m/s^2. The negative sign means deceleration (slowing down).',
    ['Use a = (v_f - v_i) / t. A negative result means the object is slowing down.']),
  fb(3, 'Acceleration is the rate of change of ___. Its SI unit is m$\\cdot$s$^{-2}$, which can also be written as ___.',
    ['velocity', 'm/s²'],
    'Acceleration = change in velocity / time. Unit: m.s^-2 or m/s^2.'),
  t(4, '## Motion Graphs\n\n### Position-Time (x-t) Graph\n- **Gradient** = velocity\n- Straight line = constant velocity (uniform motion)\n- Curved line = changing velocity (acceleration)\n- Horizontal line = stationary (velocity = 0)\n\n### Velocity-Time (v-t) Graph\n- **Gradient** = acceleration\n- **Area under the graph** = displacement\n- Straight horizontal line = constant velocity (zero acceleration)\n- Straight sloped line = uniform (constant) acceleration\n- Line crossing zero = object changes direction\n\n### Acceleration-Time (a-t) Graph\n- Horizontal line = constant acceleration\n- **Area under the graph** = change in velocity'),
  q(5, 'On a velocity-time graph, the gradient represents:',
    ['Acceleration', 'Displacement', 'Distance', 'Speed'], 0,
    'The gradient (slope) of a velocity-time graph gives the acceleration. A steeper slope means greater acceleration.',
    ['What quantity do you get when you divide change in velocity by change in time?']),
  t(6, '## Instantaneous and Average Velocity\n\n### Average Velocity\nThe velocity calculated over a **time interval**:\n$$\\vec{v}_{avg} = \\frac{\\Delta \\vec{x}}{\\Delta t}$$\n\n### Instantaneous Velocity\nThe velocity at a **specific moment** in time.\n- On a position-time graph: the instantaneous velocity is the **gradient of the tangent** to the curve at that point.\n- On a velocity-time graph: simply read the value at that time.\n\n**Example:** If a car\'s position-time graph is a curve (the car is accelerating), the instantaneous velocity at $t = 3$ s is found by drawing a tangent line at $t = 3$ s and calculating the gradient of that tangent.\n\n**Instantaneous speed** is the magnitude of the instantaneous velocity (always positive).'),
  q(7, 'The instantaneous velocity of an object at a particular time can be found from a position-time graph by:',
    ['Drawing a tangent at that point and finding its gradient', 'Calculating the area under the curve', 'Reading the y-value at that time', 'Finding the total displacement divided by total time'], 0,
    'Instantaneous velocity is the gradient of the tangent line to the position-time curve at a specific point. The total displacement/time gives average velocity, not instantaneous.'),
  fb(8, 'The area under a velocity-time graph gives the ___. The gradient of a position-time graph gives the ___.',
    ['displacement', 'velocity'],
    'Area under v-t graph = displacement (or distance if you take absolute values). Gradient of x-t graph = velocity.'),
  t(9, '## Uniform Acceleration: Equations of Motion\n\nFor an object moving with **constant (uniform) acceleration** in a straight line:\n\n$$\\vec{v}_f = \\vec{v}_i + \\vec{a}\\Delta t$$\n\n$$\\Delta \\vec{x} = \\vec{v}_i \\Delta t + \\frac{1}{2}\\vec{a}(\\Delta t)^2$$\n\n$$\\vec{v}_f^{\\,2} = \\vec{v}_i^{\\,2} + 2\\vec{a}\\Delta \\vec{x}$$\n\n$$\\Delta \\vec{x} = \\left(\\frac{\\vec{v}_i + \\vec{v}_f}{2}\\right)\\Delta t$$\n\nWhere:\n- $\\vec{v}_i$ = initial velocity (m$\\cdot$s$^{-1}$)\n- $\\vec{v}_f$ = final velocity (m$\\cdot$s$^{-1}$)\n- $\\vec{a}$ = acceleration (m$\\cdot$s$^{-2}$)\n- $\\Delta t$ = time (s)\n- $\\Delta \\vec{x}$ = displacement (m)\n\n**Important:** Choose a positive direction. All vector quantities must be given the correct sign.'),
  q(10, 'A car starts from rest and accelerates at 2 m/s$^2$ for 6 s. What distance does it cover?',
    ['36 m', '12 m', '72 m', '6 m'], 0,
    'v_i = 0 (starts from rest). a = 2 m/s^2. t = 6 s. delta x = v_i t + 1/2 a t^2 = 0 + 1/2(2)(6)^2 = 1/2(2)(36) = 36 m.',
    ['Use delta x = v_i t + 1/2 a t^2. Since the car starts from rest, v_i = 0.']),
  q(11, 'A motorcycle travelling at 20 m/s brakes and stops over a distance of 50 m. What is its acceleration?',
    ['-4 m/s$^2$', '4 m/s$^2$', '-0,4 m/s$^2$', '0,4 m/s$^2$'], 0,
    'v_i = 20 m/s, v_f = 0 (stops), delta x = 50 m. v_f^2 = v_i^2 + 2a(delta x). 0 = 400 + 2a(50). 0 = 400 + 100a. a = -400/100 = -4 m/s^2.',
    ['Use v_f^2 = v_i^2 + 2a(delta x). The object stops, so v_f = 0.']),
  fb(12, 'The equations of motion only apply when the ___ is constant. \"Starting from rest\" means $v_i$ = ___.',
    ['acceleration', '0'],
    'The equations of motion are only valid for uniform (constant) acceleration. Starting from rest means the initial velocity is zero.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 16: Energy (Term 3/4 — Physics)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch16_lesson1 = [
  t(1, '## Gravitational Potential Energy\n\nAn object raised above the ground has **gravitational potential energy** ($E_p$) because of its position in the gravitational field.\n\n$$E_p = mgh$$\n\nWhere:\n- $E_p$ = gravitational potential energy (J)\n- $m$ = mass (kg)\n- $g$ = gravitational acceleration = 9,8 m$\\cdot$s$^{-2}$\n- $h$ = height above the reference level (m)\n\n**Example:** A 2 kg textbook is placed on a shelf 1,5 m above the floor.\n$$E_p = mgh = 2 \\times 9{,}8 \\times 1{,}5 = 29{,}4 \\text{ J}$$\n\nThe **reference level** is the point where $h = 0$. You can choose any convenient reference level (usually the ground or the lowest point of the motion).'),
  q(2, 'A 5 kg object is lifted to a height of 4 m. What is its gravitational potential energy? (g = 9,8 m/s$^2$)',
    ['196 J', '49 J', '20 J', '392 J'], 0,
    'E_p = mgh = 5 x 9,8 x 4 = 196 J.',
    ['Use E_p = mgh.']),
  t(3, '## Kinetic Energy\n\n**Kinetic energy** ($E_k$) is the energy an object has due to its motion.\n\n$$E_k = \\frac{1}{2}mv^2$$\n\nWhere:\n- $E_k$ = kinetic energy (J)\n- $m$ = mass (kg)\n- $v$ = speed (m$\\cdot$s$^{-1}$)\n\n**Key points:**\n- Kinetic energy is always **positive** (or zero).\n- Doubling the speed **quadruples** the kinetic energy ($v^2$ relationship).\n- Doubling the mass only **doubles** the kinetic energy.\n\n**Example:** A 1 200 kg car travels at 30 m/s.\n$$E_k = \\frac{1}{2}(1\\,200)(30)^2 = \\frac{1}{2}(1\\,200)(900) = 540\\,000 \\text{ J} = 540 \\text{ kJ}$$\n\n**Road safety connection:** This is why speed kills — at double the speed, a vehicle has four times the kinetic energy and needs four times the stopping distance.'),
  q(4, 'If a car doubles its speed, its kinetic energy:',
    ['Quadruples (becomes 4 times larger)', 'Doubles', 'Stays the same', 'Halves'], 0,
    'E_k = 1/2 mv^2. If v becomes 2v: E_k = 1/2 m(2v)^2 = 1/2 m(4v^2) = 4 x (1/2 mv^2). The kinetic energy becomes four times larger.',
    ['The v^2 in the formula means that doubling v multiplies E_k by 2^2 = 4.']),
  fb(5, 'Kinetic energy depends on mass and the ___ of the velocity. Gravitational potential energy depends on mass, $g$, and ___.',
    ['square', 'height'],
    'E_k = 1/2 mv^2 (v is squared). E_p = mgh (depends on height above reference level).'),
  t(6, '## Mechanical Energy and Conservation of Energy\n\n**Mechanical energy** ($E_M$) is the sum of kinetic energy and gravitational potential energy:\n\n$$E_M = E_k + E_p = \\frac{1}{2}mv^2 + mgh$$\n\n### The Law of Conservation of Mechanical Energy\n\n> In the absence of friction and other non-conservative forces, the total mechanical energy of a system remains constant.\n\n$$E_{M(\\text{initial})} = E_{M(\\text{final})}$$\n$$\\frac{1}{2}mv_i^2 + mgh_i = \\frac{1}{2}mv_f^2 + mgh_f$$\n\n**What this means:**\n- As an object falls: $E_p$ decreases and $E_k$ increases (it speeds up).\n- As an object rises: $E_k$ decreases and $E_p$ increases (it slows down).\n- At the highest point: maximum $E_p$, minimum $E_k$.\n- At the lowest point: maximum $E_k$, minimum $E_p$.'),
  q(7, 'A ball is dropped from rest at a height of 20 m. What is its speed just before hitting the ground? (g = 9,8 m/s$^2$, ignore air resistance)',
    ['19,8 m/s', '14 m/s', '196 m/s', '9,9 m/s'], 0,
    'Using conservation of energy: mgh = 1/2 mv^2. The mass cancels: v = sqrt(2gh) = sqrt(2 x 9,8 x 20) = sqrt(392) = 19,8 m/s.',
    ['Set E_p at the top equal to E_k at the bottom. The mass cancels out.']),
  t(8, '## Applying Conservation of Energy\n\n### Objects Dropped or Thrown Vertically\n\n**Dropped from height $h$:**\n$$v = \\sqrt{2gh}$$\n\n**Thrown upward with initial velocity $v_i$:**\nMaximum height reached:\n$$h = \\frac{v_i^2}{2g}$$\n(At the top, all kinetic energy has been converted to potential energy.)\n\n### Pendulums\nA pendulum swings between two extreme positions:\n- At the **highest points**: $E_k = 0$, $E_p$ = maximum.\n- At the **lowest point**: $E_p = 0$ (if taken as reference), $E_k$ = maximum.\n- The speed at the bottom: $v = \\sqrt{2gh}$ where $h$ is the height of the release point above the lowest point.\n\n### Roller Coasters and Inclined Planes\nThe same principle applies — at any point, $E_k + E_p$ = constant (if we ignore friction).'),
  q(9, 'A ball is thrown vertically upward at 14 m/s. What maximum height does it reach? (g = 9,8 m/s$^2$)',
    ['10 m', '7 m', '14 m', '20 m'], 0,
    'h = v_i^2 / (2g) = (14)^2 / (2 x 9,8) = 196/19,6 = 10 m.',
    ['At maximum height, all kinetic energy converts to potential energy: 1/2 mv^2 = mgh, so h = v^2/(2g).']),
  fb(10, 'Mechanical energy = E_k + ___. The Law of Conservation of Mechanical Energy applies when there is no ___.',
    ['E_p', 'friction'],
    'E_M = E_k + E_p. Conservation of mechanical energy holds when only conservative forces (like gravity) do work — no friction or air resistance.'),
  q(11, 'A 0,5 kg pendulum bob is released from a height of 0,2 m above the lowest point. What is its speed at the lowest point? (g = 9,8 m/s$^2$)',
    ['1,98 m/s', '0,98 m/s', '3,92 m/s', '1,4 m/s'], 0,
    'v = sqrt(2gh) = sqrt(2 x 9,8 x 0,2) = sqrt(3,92) = 1,98 m/s. Note: mass does not affect the answer (it cancels).',
    ['Use v = sqrt(2gh). The mass cancels out in the conservation of energy equation.']),
  fb(12, 'As a falling object loses potential energy, it gains ___ energy. At the highest point of its trajectory, an object has maximum ___ energy.',
    ['kinetic', 'potential'],
    'Energy is converted: E_p decreases as E_k increases during a fall. At the top of the trajectory, E_k = 0 (momentarily at rest) and E_p is maximum.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 17: Revision and Exam Preparation (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch17_lesson1 = [
  t(1, '## Grade 10 Physical Sciences: Exam Overview\n\nThe Grade 10 final examination consists of two papers:\n\n### Paper 1: Physics (100 marks, 2 hours)\n- Transverse pulses and waves\n- Longitudinal waves and sound\n- Electromagnetic radiation\n- Electrostatics\n- Electric circuits\n- Magnetism\n- Vectors and scalars\n- Motion in one dimension\n- Instantaneous speed and velocity, equations of motion\n- Energy (gravitational potential and kinetic)\n\n### Paper 2: Chemistry (100 marks, 2 hours)\n- Classification of matter\n- States of matter and the kinetic molecular theory\n- The atom\n- The periodic table\n- Chemical bonding\n- Physical and chemical change\n- Representing chemical change\n- Quantitative aspects of chemical change'),
  t(2, '## Key Physics Formulae\n\n### Waves\n- $v = f\\lambda$\n- $f = 1/T$\n- $c = 3 \\times 10^8$ m$\\cdot$s$^{-1}$\n- $E = hf = hc/\\lambda$\n- $h = 6{,}63 \\times 10^{-34}$ J$\\cdot$s\n\n### Electricity\n- $V = IR$\n- $R_s = R_1 + R_2 + R_3$\n- $\\frac{1}{R_p} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}$\n- $P = VI = I^2R = V^2/R$\n- $E = VIt$\n- $Q = I\\Delta t$\n\n### Motion\n- $v_{avg} = \\Delta x / \\Delta t$\n- $a = (v_f - v_i)/\\Delta t$\n- $v_f = v_i + a\\Delta t$\n- $\\Delta x = v_i\\Delta t + \\frac{1}{2}a(\\Delta t)^2$\n- $v_f^2 = v_i^2 + 2a\\Delta x$\n\n### Energy\n- $E_p = mgh$\n- $E_k = \\frac{1}{2}mv^2$\n- $E_M = E_k + E_p$ (conserved without friction)'),
  q(3, 'A 0,3 kg ball is thrown upward at 10 m/s. What is its kinetic energy at the moment of release?',
    ['15 J', '30 J', '3 J', '1,5 J'], 0,
    'E_k = 1/2 mv^2 = 1/2(0,3)(10)^2 = 1/2(0,3)(100) = 15 J.'),
  t(4, '## Key Chemistry Formulae\n\n### The Mole\n- $n = m/M$ (mass and molar mass)\n- $n = N/N_A$ (number of particles)\n- $n = V/V_m$ (gas volume at STP, $V_m = 22{,}4$ dm$^3$/mol)\n- $c = n/V$ (concentration in mol$\\cdot$dm$^{-3}$)\n- $N_A = 6{,}022 \\times 10^{23}$ mol$^{-1}$\n\n### Percentage Composition\n$$\\% = \\frac{n_{\\text{atoms}} \\times M_{\\text{element}}}{M_{\\text{compound}}} \\times 100$$\n\n### Important Conversions\n- 1 dm$^3$ = 1 000 cm$^3$ = 1 litre\n- $T$(K) = $T$($\\degree$C) + 273\n- 1 kWh = 3,6 × 10$^6$ J'),
  q(5, 'A 100 cm$^3$ gas sample at STP contains how many moles?',
    ['0,00446 mol', '0,446 mol', '4,46 mol', '0,0446 mol'], 0,
    'V = 100 cm^3 = 0,1 dm^3. n = V/V_m = 0,1/22,4 = 0,00446 mol.',
    ['Convert cm^3 to dm^3 first (divide by 1 000), then use n = V/V_m.']),
  t(6, '## Problem-Solving Tips\n\n### Physics\n1. Read the question carefully. Identify what is **given** and what is **asked**.\n2. Draw a **diagram** if possible (free-body diagram, circuit diagram, wave diagram).\n3. Choose a **positive direction** for vector problems.\n4. Write the relevant **formula** before substituting.\n5. Substitute values with **correct units**.\n6. Calculate and **check** that the answer is reasonable.\n\n### Chemistry\n1. Write a **balanced equation** first (for stoichiometry problems).\n2. Identify the **mole ratio** from the coefficients.\n3. Calculate **moles** of the known quantity.\n4. Use the **mole ratio** to find the unknown.\n5. Convert to the required unit.\n\n### Common Mistakes\n- Not converting units (cm to m, cm$^3$ to dm$^3$, $\\degree$C to K).\n- Forgetting to choose a positive direction for vectors.\n- Confusing distance/displacement or speed/velocity.\n- Using the wrong resistance formula (series vs parallel).\n- Changing subscripts instead of coefficients when balancing equations.'),
  fb(7, 'When solving motion problems, always choose a ___ direction first. When balancing equations, change only the ___, never the subscripts.',
    ['positive', 'coefficients'],
    'A positive direction must be chosen so that vector quantities have correct signs. Coefficients balance atoms; changing subscripts would create a different substance.'),
  q(8, 'A circuit has two 6 ohm resistors in parallel, and this combination is in series with a 4 ohm resistor. The total resistance is:',
    ['7 ohm', '16 ohm', '10 ohm', '3 ohm'], 0,
    'Parallel: 1/R = 1/6 + 1/6 = 2/6, R_parallel = 3 ohm. Series: R_total = 3 + 4 = 7 ohm.',
    ['First find the parallel combination (1/R = 1/R1 + 1/R2), then add the series resistor.']),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 10
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 10/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 10:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 10', schoolId: SCHOOL_ID, orderIndex: 10,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 10:', String(GRADE_ID));
  }

  // Find or create Physical Sciences subject
  const subjectDoc = await db.collection('subjects').findOne({ name: /Phys.*Sci/i });

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
      title: 'Chapter 1: Transverse Pulses and Waves',
      description: 'Transverse pulses, amplitude, superposition (constructive and destructive interference), transverse waves, wave properties, the wave equation v = f lambda.',
      order: 1,
      lessons: [
        { title: 'Transverse Pulses and Waves', description: 'Transverse pulses, amplitude, constructive and destructive interference, transverse wave properties (amplitude, wavelength, frequency, period), wave equation v = f lambda.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Longitudinal Waves and Sound',
      description: 'Longitudinal waves, compressions and rarefactions, sound as a longitudinal wave, speed of sound, pitch, loudness, ultrasound applications.',
      order: 2,
      lessons: [
        { title: 'Longitudinal Waves and Sound', description: 'Longitudinal waves (compressions and rarefactions), sound waves, speed of sound in different media, pitch and frequency, loudness and amplitude, ultrasound and its applications.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Electromagnetic Radiation',
      description: 'The electromagnetic spectrum, properties of EM waves, wave-particle duality, photon energy E = hf, EM radiation and the atmosphere.',
      order: 3,
      lessons: [
        { title: 'Electromagnetic Radiation', description: 'EM spectrum, properties of EM waves, speed of light, wave-particle duality, photon energy (E = hf), dangers of EM radiation, atmosphere and EM radiation.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Electrostatics',
      description: 'Electric charge, conservation of charge, charging by contact and induction, the electroscope, Coulomb\'s Law (qualitative).',
      order: 4,
      lessons: [
        { title: 'Electric Charge and Electrostatics', description: 'Electric charge, protons and electrons, conservation of charge, charging by friction and induction, the gold-leaf electroscope, qualitative Coulomb\'s Law.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Electric Circuits',
      description: 'Current, voltage, resistance, Ohm\'s Law, series and parallel circuits, electrical power and energy, circuit diagrams.',
      order: 5,
      lessons: [
        { title: 'Ohm\'s Law and Series/Parallel Circuits', description: 'Current, voltage, resistance, Ohm\'s Law (V = IR), ohmic and non-ohmic conductors, series and parallel resistors, ammeters and voltmeters.', blocks: ch5_lesson1, term: 1 },
        { title: 'Electrical Energy, Power and Practical Circuits', description: 'Electrical power (P = VI), energy (E = VIt), kWh and Eskom billing, series vs parallel in homes, circuit diagrams and symbols, resistance and temperature.', blocks: ch5_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Magnetism',
      description: 'Magnetic poles and fields, Earth as a magnet, compass and navigation, electromagnets, ferromagnetic materials.',
      order: 6,
      lessons: [
        { title: 'Magnetism and Electromagnets', description: 'Magnetic poles, magnetic fields and field lines, Earth\'s magnetism, compass, electromagnets, ferromagnetic materials, permanent vs temporary magnets.', blocks: ch6_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 7: Matter and Classification',
      description: 'Classification of matter (elements, compounds, mixtures), physical properties of materials, separation techniques, naming compounds.',
      order: 7,
      lessons: [
        { title: 'Classification of Matter and Separation', description: 'Elements, compounds, mixtures (homogeneous and heterogeneous), physical vs chemical properties, metals vs non-metals, separation methods, naming ionic and covalent compounds.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: States of Matter and the Kinetic Molecular Theory',
      description: 'Three states of matter, changes of state, kinetic molecular theory, heating and cooling curves, evaporation vs boiling.',
      order: 8,
      lessons: [
        { title: 'States of Matter and Kinetic Molecular Theory', description: 'Solids, liquids, gases, changes of state, kinetic molecular theory, heating and cooling curves, latent heat, evaporation vs boiling.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: The Atom',
      description: 'Atomic structure (protons, neutrons, electrons), atomic number, mass number, isotopes, electron configuration, atomic orbitals (introduction).',
      order: 9,
      lessons: [
        { title: 'Atomic Structure and Electron Configuration', description: 'Protons, neutrons, electrons, atomic number (Z), mass number (A), isotopes, relative atomic mass, electron configuration, Aufbau notation, ions.', blocks: ch9_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 10: The Periodic Table',
      description: 'Structure of the periodic table, periods and groups, trends (atomic radius, ionisation energy, electronegativity), metals, non-metals, metalloids.',
      order: 10,
      lessons: [
        { title: 'The Periodic Table and Trends', description: 'Periods, groups, alkali metals, halogens, noble gases, trends across periods and down groups (atomic radius, ionisation energy, electronegativity), metals, non-metals, metalloids.', blocks: ch10_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 11: Chemical Bonding',
      description: 'Ionic, covalent, and metallic bonding, Lewis dot diagrams, naming ionic and covalent compounds.',
      order: 11,
      lessons: [
        { title: 'Chemical Bonding and Naming Compounds', description: 'Ionic bonding (electron transfer), covalent bonding (electron sharing, Lewis diagrams, single/double/triple bonds), metallic bonding (sea of electrons), naming compounds.', blocks: ch11_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 12: Physical and Chemical Change',
      description: 'Physical vs chemical change, representing chemical reactions, balancing equations, types of reactions, conservation of mass and energy.',
      order: 12,
      lessons: [
        { title: 'Chemical Reactions and Balancing Equations', description: 'Physical vs chemical change, signs of chemical reaction, word and formula equations, balancing, types of reactions (synthesis, decomposition, acid-base, acid-metal), conservation of mass and energy.', blocks: ch12_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 13: Quantitative Aspects of Chemical Change',
      description: 'The mole concept, Avogadro\'s number, molar mass, concentration, stoichiometry, molar volume of gases, percentage composition, empirical and molecular formulae.',
      order: 13,
      lessons: [
        { title: 'The Mole, Concentration and Stoichiometry', description: 'Mole concept, Avogadro\'s number, molar mass, n = m/M, concentration c = n/V, stoichiometric calculations using balanced equations.', blocks: ch13_lesson1, term: 3 },
        { title: 'Molar Volume, Percentage Composition and Formulae', description: 'Molar volume at STP, percentage composition, empirical and molecular formulae, Law of Constant Composition, water of crystallisation.', blocks: ch13_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 14: Vectors and Scalars',
      description: 'Scalars vs vectors, distance vs displacement, speed vs velocity, adding vectors in one dimension.',
      order: 14,
      lessons: [
        { title: 'Vectors and Scalars', description: 'Scalars vs vectors, distance and displacement, speed and velocity, average speed and average velocity, adding vectors in one dimension (resultant).', blocks: ch14_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 15: Motion in One Dimension',
      description: 'Acceleration, motion graphs (position-time, velocity-time), instantaneous vs average velocity, equations of motion for uniform acceleration.',
      order: 15,
      lessons: [
        { title: 'Acceleration, Motion Graphs and Equations of Motion', description: 'Acceleration, position-time and velocity-time graphs, gradients and areas, instantaneous vs average velocity, equations of motion for uniform acceleration.', blocks: ch15_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 16: Energy',
      description: 'Gravitational potential energy, kinetic energy, mechanical energy, the Law of Conservation of Mechanical Energy, applications to pendulums and falling objects.',
      order: 16,
      lessons: [
        { title: 'Potential Energy, Kinetic Energy and Conservation', description: 'Gravitational potential energy (E_p = mgh), kinetic energy (E_k = 1/2 mv^2), mechanical energy, conservation of mechanical energy, applications to falling objects, pendulums, and projectiles.', blocks: ch16_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 17: Revision and Exam Preparation',
      description: 'Paper 1 (Physics) and Paper 2 (Chemistry) exam structure, key formulae, problem-solving strategies, common mistakes.',
      order: 17,
      lessons: [
        { title: 'Revision and Exam Preparation', description: 'Exam structure (Paper 1: Physics 100 marks, Paper 2: Chemistry 100 marks), key formulae summary, problem-solving tips, common mistakes to avoid.', blocks: ch17_lesson1, term: 4 },
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
    title: 'Grade 10 Physical Sciences \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Physics (Waves, Sound, EM Radiation, Electrostatics, Electric Circuits, Magnetism, Vectors, Motion in 1D, Energy) and Chemistry (Matter Classification, States of Matter, The Atom, Periodic Table, Chemical Bonding, Chemical Change, Stoichiometry) for the Grade 10 Physical Sciences examination.',
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
  console.log('  TEXTBOOK: Grade 10 Physical Sciences');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
