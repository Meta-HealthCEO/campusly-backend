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
// CHAPTER 1: Design Skills and Graphic Communication (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 1.1: Line Types, Scale, and Orthographic Projection
blockNum = 0;
const ch1_lesson1 = [
  t(1, "## Graphic Communication in Technology\n\nIn Technology, we use **technical drawings** to communicate design ideas clearly and accurately. Unlike freehand sketches, technical drawings follow strict conventions so that anyone — an engineer, a builder, or a manufacturer — can understand exactly what is being shown.\n\n### Why Do We Need Technical Drawings?\n\nImagine you have designed a wheelchair ramp for your school. You need to communicate your design to a builder. A freehand sketch might give a rough idea, but the builder needs to know **exact measurements, materials, and views from different angles**. That is where technical drawing comes in.\n\nIn South Africa, technical drawings are used in construction, manufacturing, and engineering. For example, when Transnet builds new railway bridges or when the City of Cape Town designs a new bus shelter, technical drawings are produced first."),
  t(2, "## Line Types in Technical Drawing\n\nDifferent line types communicate different information on a drawing.\n\n| Line Type | Appearance | Purpose |\n|-----------|------------|---------|\n| **Continuous thick (dark)** | ━━━━━━ | Visible outlines and edges of an object |\n| **Continuous thin (feint)** | ─────── | Dimension lines, projection lines, hatching |\n| **Dashed (hidden detail)** | - - - - - | Edges and outlines hidden behind the object |\n| **Chain line (centre)** | ─ · ─ · ─ | Centre lines, lines of symmetry, axes |\n| **Wavy line** | ∿∿∿∿∿ | Short break lines, irregular boundaries |\n\n### Rules for Line Types\n\n- Visible outlines are always drawn with **thick, dark lines**\n- Hidden edges are shown with **dashed lines** (short, evenly spaced dashes)\n- Centre lines are **chain lines** (long dash, short dash, long dash)\n- Dimension lines are **thin continuous lines** with arrowheads at each end"),
  q(3, 'Which line type is used to show edges that are hidden behind an object?',
    ['Dashed line', 'Continuous thick line', 'Chain line', 'Wavy line'], 0,
    'Dashed lines (short, evenly spaced dashes) are used to show edges and outlines that cannot be seen because they are behind other parts of the object.'),
  t(4, "## Scale in Technical Drawing\n\n**Scale** allows us to draw objects that are too large or too small to draw at their actual size.\n\n| Scale Type | Meaning | Example |\n|------------|---------|--------|\n| **Full size** | 1:1 | Object is drawn at its actual size |\n| **Reduction scale** | 1:2, 1:5, 1:10, 1:50, 1:100 | Object is drawn smaller than real life |\n| **Enlargement scale** | 2:1, 5:1, 10:1 | Object is drawn larger than real life |\n\n### How to Read Scale\n\n- **1:50** means 1 unit on the drawing = 50 units in real life\n- So if something measures 2 cm on a 1:50 drawing, its real size is 2 × 50 = **100 cm (1 m)**\n- If a wall is 5 m long in real life and the scale is 1:100, on the drawing it will be 5 m ÷ 100 = **5 cm**\n\n### Choosing the Right Scale\n\n- A school building plan might use 1:100 or 1:200\n- A small component like a gear might use 1:1 or 2:1\n- The scale must be stated clearly on every drawing"),
  fb(5, 'A scale of 1:50 means that 1 unit on the drawing equals ___ units in real life. If a ramp is 3 m long and the scale is 1:100, it will be drawn as ___ cm.',
    ['50', '3'],
    'At 1:50, multiply the drawing measurement by 50 to get the real size. At 1:100, divide the real size by 100: 3 m ÷ 100 = 0.03 m = 3 cm.'),
  t(6, "## First Angle Orthographic Projection\n\n**Orthographic projection** is a method of drawing a 3D object as separate 2D views. In South Africa and most of the world (except the USA), we use **first angle orthographic projection**.\n\n### The Three Standard Views\n\n| View | What it shows | Position on the drawing |\n|------|--------------|------------------------|\n| **Front view** | The object seen from the front | Centre of the drawing |\n| **Top view** | The object seen from above | Below the front view |\n| **Side view** | The object seen from the right or left | To the left of the front view (right side view) |\n\n### Key Rule for First Angle Projection\n\nIn first angle projection, each view is placed **opposite to the direction you are looking from**:\n- You look from the TOP → the top view goes **below** the front view\n- You look from the RIGHT → the right side view goes to the **left** of the front view\n\nThis is the opposite of third angle projection (used in the USA), where views go in the same direction as the viewing direction."),
  q(7, 'In first angle orthographic projection, where is the top view placed relative to the front view?',
    ['Below the front view', 'Above the front view', 'To the right of the front view', 'Behind the front view'], 0,
    'In first angle projection, the top view is placed below the front view. This is because you look down from above, and the view is projected onto the plane below.'),
  t(8, "### Drawing Orthographic Views Step by Step\n\n1. **Choose the front view** — pick the side that shows the most detail\n2. **Draw the front view** using thick outlines for visible edges\n3. **Project lines downward** from the front view to position the top view directly below\n4. **Draw the top view** — what you see when looking straight down\n5. **Project lines horizontally** from the front view to the left to position the side view\n6. **Add hidden detail** using dashed lines where edges are not visible\n7. **Add dimensions** using thin continuous lines with arrowheads\n8. **Add centre lines** for circular features using chain lines\n9. **State the scale** and include a title block\n\n### Dimensioning Rules\n\n- Dimension lines are drawn with thin continuous lines\n- Arrowheads touch the projection (extension) lines\n- Dimensions are written above the dimension line, centred\n- Avoid placing dimensions inside the object outline if possible\n- All dimensions should be in **millimetres (mm)** unless otherwise stated"),
  fb(9, 'In first angle orthographic projection, the right side view is placed to the ___ of the front view. All dimensions on technical drawings in South Africa are given in ___.',
    ['left', 'millimetres'],
    'In first angle projection, views are placed opposite to the direction of viewing, so the right side view goes to the left. The standard unit for dimensions is millimetres (mm).'),
  q(10, 'A rectangular box is 60 mm long, 40 mm wide, and 30 mm tall. If drawn at a scale of 1:2, what will the length be on the drawing?',
    ['30 mm', '60 mm', '120 mm', '15 mm'], 0,
    'At a scale of 1:2, every measurement is halved. 60 mm ÷ 2 = 30 mm on the drawing.'),
];

// Lesson 1.2: The Design Process (IDMEC) and Communication
blockNum = 0;
const ch1_lesson2 = [
  t(1, "## The Design Process: IDMEC\n\nThe **IDMEC design process** is a structured approach used in Technology to solve problems. It stands for:\n\n| Step | Name | What you do |\n|------|------|------------|\n| **I** | Investigate | Research the problem, analyse existing products, gather information |\n| **D** | Design | Write a design brief, generate ideas (sketches), choose the best solution |\n| **M** | Make | Build a model or prototype of the chosen solution |\n| **E** | Evaluate | Test the solution, compare it to specifications, suggest improvements |\n| **C** | Communicate | Present your solution through drawings, reports, and presentations |\n\nThe design process is **iterative** — you may need to go back to earlier steps if your solution does not work as expected. For example, if your evaluation shows a weakness, you return to the Design step to improve it."),
  t(2, "## Step 1: Investigate\n\n### Writing a Problem Statement\n\nA good investigation begins with understanding the **problem, need, or want**. You must clearly identify:\n- **Who** has the problem?\n- **What** is the problem?\n- **Where** does the problem occur?\n- **Why** does it need to be solved?\n\n### Analysing Existing Products\n\nWhen investigating, you analyse products that already exist to solve a similar problem. Evaluate them in terms of:\n\n| Criterion | Questions to ask |\n|-----------|------------------|\n| **Fitness for purpose** | Does it do the job it was designed for? |\n| **Suitability of materials** | Are the materials strong enough, durable, appropriate? |\n| **Safety** | Is it safe for the user? Are there any hazards? |\n| **Cost** | What do the materials and construction cost? Is it affordable? |\n| **Aesthetics** | Does it look good? Is it visually appealing? |\n| **Ergonomics** | Is it comfortable and easy to use for the end user? |\n\nIn South Africa, when investigating a wheelchair ramp design, you would check the **SANS 10400** building regulations for gradient requirements and handrail heights."),
  q(3, 'What does the "I" in IDMEC stand for?',
    ['Investigate', 'Innovate', 'Illustrate', 'Implement'], 0,
    'The I in IDMEC stands for Investigate — the first step where you research the problem, analyse existing products, and gather information before designing a solution.'),
  t(4, "## Step 2: Design\n\n### The Design Brief\n\nA **design brief** is a short statement that describes:\n- What you intend to design and make\n- The **specifications** (requirements the solution must meet)\n- The **constraints** (limitations such as budget, materials, time, size)\n\n**Example design brief:**\n> Design and make a model of a flight of stairs with a wheelchair ramp for a community centre entrance that is 600 mm above ground level. The ramp gradient must not exceed 1:12. The structure must be strong, safe, and cost-effective, using locally available materials.\n\n### Generating Ideas\n\nEach learner must produce at least **two possible design ideas** as sketches:\n- Use 3D freehand sketches (isometric or perspective)\n- Label each sketch with materials, dimensions, and features\n- Consider the specifications and constraints from the design brief\n- Be creative but realistic\n\n### Choosing the Best Solution\n\nTeams evaluate each idea against the design brief using an **evaluation matrix** — a table that scores each design against the specifications."),
  fb(5, 'A design brief must include ___ (requirements the solution must meet) and ___ (limitations such as budget and time).',
    ['specifications', 'constraints'],
    'Specifications are the must-have requirements. Constraints are the limitations and restrictions that the design must work within.'),
  t(6, "## Steps 3-5: Make, Evaluate, Communicate\n\n### Step 3: Make\n\n- Build a **model or prototype** based on the chosen design\n- Follow the working drawings (orthographic projections)\n- Use a **flow chart** to plan the order of construction steps\n- Use materials intelligently — minimise waste\n- Follow **safe working practices** at all times (safety goggles, clamps, correct tool use)\n- Build neatly and to scale\n\n### Step 4: Evaluate\n\nCreate an **evaluation instrument** (checklist or rubric) that tests the solution against the original specifications:\n- Does it meet the design brief?\n- Is it strong and stable enough?\n- Is it safe for the intended users?\n- Is it within budget?\n- What could be improved?\n\n### Step 5: Communicate\n\n- **Team presentations** to a panel (like a \"tender board\")\n- Each team member presents a specific aspect\n- Present sketches, working drawings (orthographic projections), the budget breakdown, and the physical model\n- Communication must be clear, professional, and well-organised"),
  q(7, 'Why should you create a flow chart before building your model?',
    ['To plan the correct order of construction steps', 'To make the model look better', 'To calculate the cost of materials', 'To choose the right scale'], 0,
    'A flow chart helps you plan the sequence of steps for building your model, ensuring you do things in the correct order and do not forget any steps.'),
  t(8, "## Budgeting in Technology Projects\n\n### What is a Budget?\n\nA **budget** is a financial plan that lists all expected costs for a project. In Technology, you must cost the \"real-life\" solution, not just the model.\n\n### Components of a Project Budget\n\n| Cost Category | Examples |\n|--------------|----------|\n| **Materials** | Timber, steel, concrete, screws, paint |\n| **Labour** | Wages for workers (per hour or per day) |\n| **Transport** | Delivery of materials to the site |\n| **Equipment** | Hire of tools or machinery |\n| **Overheads** | Electricity, water, site rental |\n| **Contingency** | Extra 10% for unexpected costs |\n\n### Example Budget for a Wheelchair Ramp\n\n| Item | Quantity | Unit Cost | Total |\n|------|----------|-----------|-------|\n| Concrete (bags) | 15 | R85 | R1 275 |\n| Steel reinforcing bars | 10 | R45 | R450 |\n| Timber formwork | 8 planks | R65 | R520 |\n| Handrail (steel pipe) | 6 m | R120/m | R720 |\n| Labour (2 workers, 3 days) | 6 person-days | R350/day | R2 100 |\n| Transport | 1 trip | R500 | R500 |\n| **Subtotal** | | | **R5 565** |\n| Contingency (10%) | | | R557 |\n| **Total** | | | **R6 122** |"),
  fb(9, 'A contingency amount in a budget is typically about ___% extra to cover unexpected costs. Labour costs are calculated by multiplying the number of worker-days by the ___ rate.',
    ['10', 'daily'],
    'A 10% contingency is standard practice to cover unforeseen expenses. Labour costs = number of workers × number of days × daily rate.'),
  q(10, 'In a tender presentation, what documents should a team present?',
    ['Sketches, working drawings, budget, and the physical model', 'Only the physical model', 'Only the budget', 'Only the design brief'], 0,
    'A complete tender presentation includes all design documentation: initial sketches, working drawings (orthographic projections), a detailed budget, and the physical model or prototype.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Structures (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 2.1: Forces in Structures and Strength of Materials
blockNum = 0;
const ch2_lesson1 = [
  t(1, "## Forces in Structures\n\nA **structure** is any object or system that is designed to support a load. Structures are everywhere — bridges, buildings, pylons, furniture, even the human skeleton.\n\n### Types of Forces\n\n| Force | Description | Example |\n|-------|-------------|--------|\n| **Tension** | A pulling force that stretches a material | Cables on the Nelson Mandela Bridge in Johannesburg |\n| **Compression** | A pushing force that squashes a material | Columns supporting a roof |\n| **Bending** | A combination of tension and compression | A wooden plank across a stream |\n| **Torsion** | A twisting force | Wringing out a wet cloth |\n| **Shear** | Forces acting in opposite directions, sliding past each other | Cutting paper with scissors |\n\n### Static vs Dynamic Forces\n\n- **Static forces** (dead loads): Permanent, unchanging forces such as the weight of the structure itself\n- **Dynamic forces** (live loads): Changing forces such as people walking, wind blowing, vehicles moving across a bridge"),
  t(2, "## Bending of Beams\n\nWhen a beam is loaded, it bends. The top of the beam is under **compression** (being squashed) and the bottom is under **tension** (being stretched).\n\nThere is a line along the middle of the beam where there is neither tension nor compression — this is called the **neutral axis**.\n\n### Metal Cross-Sections for Strength\n\nEngineers use specially shaped metal beams to resist bending. The shape of the cross-section determines how strong and stiff a beam is.\n\n| Cross-Section | Shape | Strength | Use |\n|---------------|-------|----------|-----|\n| **I-beam (H-beam)** | Shaped like the letter I or H | Very strong for its weight | Building frames, bridges |\n| **T-section** | Shaped like the letter T | Good strength | Rails, structural supports |\n| **Angle section (L)** | Shaped like the letter L | Resists bending in two directions | Corner brackets, shelving |\n| **Channel section (U/C)** | Shaped like the letter U or C | Good for structural frames | Vehicle chassis, frames |\n| **Hollow tube (circular/square)** | Round or square tube | Strong, lightweight | Scaffolding, bicycle frames |\n\nThe I-beam is one of the most efficient shapes because the material is concentrated at the top and bottom (flanges), where bending forces are greatest, and uses less material in the middle (web)."),
  q(3, 'When a beam bends under load, the top surface is under which type of force?',
    ['Compression', 'Tension', 'Torsion', 'Shear'], 0,
    'When a beam bends, the top surface is compressed (squashed) and the bottom surface is stretched (tension). The neutral axis in the middle experiences neither.'),
  t(4, "## Torsion and Cross-Bracing\n\n**Torsion** is a twisting force. Structures must resist torsion to remain stable.\n\n### Resisting Torsion with Cross-Bracing\n\nCross-bracing uses diagonal members to prevent a structure from twisting or collapsing sideways.\n\n**How it works:**\n- A rectangular frame can easily be pushed into a parallelogram shape (racking)\n- Adding a diagonal brace creates triangles within the frame\n- **Triangles are the strongest shape** because they cannot change shape without breaking a member\n- This is why roof trusses, pylons, and crane booms all use triangulation\n\n### Examples of Cross-Bracing in South Africa\n\n- **Eskom electricity pylons** — lattice structures made entirely of triangles\n- **Mine headgear** — triangulated steel frames at gold and platinum mines\n- **Roof trusses** — triangular frames supporting the roof sheeting of houses\n- **Construction scaffolding** — diagonal braces prevent sideways collapse"),
  fb(5, 'The strongest geometric shape used in structures is the ___ because it cannot change shape without breaking a member. Diagonal members used to prevent twisting are called ___.',
    ['triangle', 'cross-bracing'],
    'Triangles are rigid shapes — they cannot be deformed without breaking. Cross-bracing adds diagonal members to stiffen a frame structure.'),
  q(6, 'Why are I-beams considered efficient structural members?',
    ['Material is concentrated at the top and bottom where bending forces are greatest', 'They are the cheapest to manufacture', 'They are the lightest beams available', 'They can only resist compression forces'], 0,
    'I-beams place most material at the flanges (top and bottom) where compression and tension from bending are greatest, while using less material at the neutral axis (web). This gives maximum strength for minimum weight.'),
  t(7, "## Loads: Even and Uneven\n\n### Even (Distributed) Loads\n\nAn **even load** (also called a uniformly distributed load) is spread equally across the whole structure. Examples:\n- Snow covering an entire roof\n- Water filling a swimming pool evenly\n- The weight of a concrete floor slab\n\n### Uneven (Point) Loads\n\nAn **uneven load** (also called a point load or concentrated load) is applied at a specific point. Examples:\n- A person standing in the middle of a plank\n- A heavy machine placed on one section of a floor\n- A car parked on one part of a bridge\n\n### Why It Matters\n\n- Structures must be designed to handle both types of loads\n- Point loads create higher stress at the point of application\n- Distributed loads spread the force over a larger area, reducing stress at any single point\n- Engineers in South Africa must follow the **SANS 10160** loading code when designing structures"),
  q(8, 'Which of the following is an example of a point load?',
    ['A person standing in the middle of a wooden plank', 'Snow spread evenly across a roof', 'Water filling a swimming pool', 'The weight of a concrete floor slab'], 0,
    'A person standing at a single point on a plank is a concentrated (point) load. The other examples are all evenly distributed loads spread across the entire structure.'),
  fb(9, 'A ___ load is spread equally across a structure, while a ___ load is applied at a specific spot. Forces that remain constant, like the weight of the structure itself, are called ___ forces.',
    ['distributed', 'point', 'static'],
    'Distributed (even) loads spread across the structure. Point (concentrated) loads act at a specific location. Static forces (dead loads) are constant and unchanging.'),
  q(10, 'Internal cross-bracing is used in structures primarily to resist which force?',
    ['Torsion (twisting)', 'Tension only', 'Compression only', 'Gravity'], 0,
    'Cross-bracing is specifically designed to resist torsion (twisting) and racking (sideways collapse). The diagonal members create rigid triangles that prevent the frame from deforming.'),
];

// Lesson 2.2: Properties of Construction Materials
blockNum = 0;
const ch2_lesson2 = [
  t(1, "## Properties of Construction Materials\n\nWhen choosing materials for a structure, engineers consider the **properties** of each material. A property describes how a material behaves under certain conditions.\n\n### Key Material Properties\n\n| Property | Definition | Example |\n|----------|-----------|--------|\n| **Mass/Density** | How heavy the material is for its volume | Steel is dense (heavy); aluminium is less dense (lighter) |\n| **Hardness** | Resistance to scratching or indentation | Diamond is the hardest; lead is soft |\n| **Stiffness** | Resistance to bending or deformation | Steel is stiff; rubber is not |\n| **Flexibility** | Ability to bend without breaking | Copper wire is flexible; glass is not |\n| **Strength** | Ability to withstand forces without failing | Steel has high tensile strength |\n| **Elasticity** | Ability to return to original shape after being stretched | A rubber band is elastic |\n| **Brittleness** | Tendency to break suddenly without bending first | Glass and concrete are brittle |"),
  t(2, "## Corrosion: Causes and Prevention\n\n**Corrosion** is the gradual destruction of a material (usually metal) by chemical reaction with its environment. The most common form is **rusting** of iron and steel.\n\n### How Rust Forms\n\nIron + Water + Oxygen → Iron oxide (rust)\n\nRust is a reddish-brown, flaky substance that weakens the metal over time. In South Africa, structures near the coast (like in Durban and Cape Town) corrode faster due to the salty, humid air.\n\n### Methods of Preventing Corrosion\n\n| Method | How it works | Example |\n|--------|-------------|--------|\n| **Painting** | Creates a barrier between the metal and air/moisture | Bridges, fences, Eskom pylons |\n| **Galvanising** | Coating iron/steel with a layer of zinc | Corrugated roofing sheets, water pipes |\n| **Electroplating** | Using electricity to coat metal with another metal (chrome, nickel) | Car bumpers, bathroom taps |\n| **Oiling/Greasing** | Applying oil to keep moisture away | Machine parts, tools |\n| **Using stainless steel** | Steel alloyed with chromium resists corrosion naturally | Kitchen sinks, medical instruments |\n| **Plastic coating** | Dipping metal in plastic (PVC) | Fencing wire, tool handles |"),
  q(3, 'Which corrosion prevention method involves coating iron or steel with zinc?',
    ['Galvanising', 'Electroplating', 'Painting', 'Oiling'], 0,
    'Galvanising is the process of coating iron or steel with a protective layer of zinc. The zinc corrodes preferentially (sacrificial protection), protecting the steel underneath.'),
  t(4, "### Choosing the Right Material\n\nDifferent structures require different materials. The choice depends on the required properties and the application.\n\n| Material | Key Properties | Common Uses |\n|----------|---------------|------------|\n| **Mild steel** | Strong, stiff, weldable, but rusts | Building frames, bridges, reinforcing bars |\n| **Stainless steel** | Corrosion-resistant, strong, expensive | Medical instruments, kitchen equipment |\n| **Aluminium** | Light, corrosion-resistant, good conductor | Window frames, aircraft, drink cans |\n| **Concrete** | Strong in compression, weak in tension, cheap | Foundations, walls, dams |\n| **Reinforced concrete** | Concrete + steel bars = strong in both | Bridges, multi-storey buildings |\n| **Timber (wood)** | Light, easy to work, renewable, but rots | Roof trusses, furniture, fencing |\n| **Brick** | Hard, durable, fire-resistant | Walls, chimneys |\n| **Glass** | Transparent, hard, brittle | Windows, facades |\n\n### South African Material Choices\n\n- **Corrugated galvanised iron (CGI)** is widely used for roofing in townships and rural areas because it is affordable and resists corrosion\n- **Face brick** is popular for building walls in the Western Cape and Gauteng\n- **Reinforced concrete** is used for South Africa's large dams like the Gariep Dam"),
  fb(5, 'Concrete is strong in ___ but weak in ___. To compensate, steel bars are added to create ___ concrete.',
    ['compression', 'tension', 'reinforced'],
    'Concrete resists compression well but cracks under tension. Adding steel reinforcing bars (rebar) provides tensile strength, creating reinforced concrete.'),
  q(6, 'Why does corrosion happen faster in coastal cities like Durban?',
    ['The salty, humid air accelerates the chemical reaction between metal and moisture', 'Coastal cities use cheaper metals', 'There is less oxygen at the coast', 'Coastal cities have more rain only'], 0,
    'Salt in the air and high humidity accelerate corrosion. Salt water is a better electrolyte than fresh water, speeding up the electrochemical process that causes rust.'),
  t(7, "## Testing Materials\n\nEngineers test materials to determine their properties before using them in structures.\n\n### Common Material Tests\n\n| Test | What it measures | How it works |\n|------|-----------------|-------------|\n| **Tensile test** | Tensile strength | A sample is pulled until it breaks |\n| **Compression test** | Compressive strength | A sample is crushed until it fails |\n| **Bending test** | Flexural strength | A beam is loaded until it bends or breaks |\n| **Hardness test** | Hardness | A small indenter is pressed into the surface |\n| **Impact test** | Toughness | A weight is dropped onto the sample |\n\n### Fair Testing\n\nFor a valid comparison between materials, you must keep a **fair test**:\n- Use the **same size and shape** samples\n- Apply the **same force** or load\n- Use the **same testing method**\n- Change only **one variable** at a time (the type of material)\n- Repeat the test to check for **consistency**"),
  q(8, 'Which material property describes the ability to return to its original shape after being stretched?',
    ['Elasticity', 'Hardness', 'Stiffness', 'Brittleness'], 0,
    'Elasticity is the ability to deform under stress and return to the original shape when the stress is removed. A rubber band is a good example of an elastic material.'),
  fb(9, 'A material that breaks suddenly without bending first is described as ___. Galvanised roofing sheets are coated with ___ to prevent corrosion.',
    ['brittle', 'zinc'],
    'Brittle materials (like glass or concrete) fracture without significant deformation. Galvanising coats steel with zinc for corrosion protection.'),
  q(10, 'Why must you use the same size and shape samples when comparing the strength of different materials?',
    ['To ensure a fair test where only the material type is the variable', 'Because different sizes are not available', 'Because larger samples are always stronger', 'To save money on materials'], 0,
    'A fair test requires that only one variable changes (the material). If sample sizes differ, the results would be affected by size rather than material properties alone.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Hydraulic and Pneumatic Systems (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 3.1: Pneumatics, Hydraulics, and Pascal's Principle
blockNum = 0;
const ch3_lesson1 = [
  t(1, "## Mechanical Systems and Control\n\nMechanical systems use forces and movement to do useful work. In Grade 9, we study systems that transfer force using fluids (liquids and gases).\n\n### Hydraulic vs Pneumatic Systems\n\n| Feature | Hydraulic System | Pneumatic System |\n|---------|-----------------|------------------|\n| **Fluid used** | Liquid (oil, water) | Gas (compressed air) |\n| **Compressibility** | Incompressible — does not compress | Compressible — can be squeezed |\n| **Force transfer** | Precise and powerful | Less precise, \"springy\" |\n| **Speed** | Slower, more controlled | Faster, less controlled |\n| **Examples** | Car brakes, hydraulic jacks, excavators | Pneumatic drills, air brakes on trucks, dentist's drill |\n\n### Syringe Model\n\nIn the classroom, we model these systems using syringes connected by tubes:\n- **Pneumatic:** Syringes filled with air — when you push one plunger, the other moves out, but with a spongy, delayed response because air compresses\n- **Hydraulic:** Syringes filled with water — when you push one plunger, the other moves out immediately because water cannot be compressed"),
  q(2, 'Why does a hydraulic system transfer force more precisely than a pneumatic system?',
    ['Because liquids are incompressible, so force is transferred immediately without loss', 'Because liquids are lighter than gases', 'Because hydraulic systems use bigger syringes', 'Because gases transfer force faster'], 0,
    'Liquids cannot be compressed, so when force is applied to one end of a hydraulic system, it is transmitted immediately and completely to the other end. Gases are compressible, causing a spongy, delayed response.'),
  t(3, "## Pascal's Principle\n\n**Pascal's Principle** states:\n> Pressure applied to an enclosed fluid is transmitted equally, without any loss, in all directions throughout the fluid.\n\nThis means if you push on a small piston, the same pressure acts on a large piston — and because the large piston has a bigger area, it produces a **greater force**.\n\n### The Key Relationship\n\n$$\\text{Pressure} = \\frac{\\text{Force}}{\\text{Area}}$$\n\nSince pressure is the same throughout the system:\n\n$$\\frac{F_1}{A_1} = \\frac{F_2}{A_2}$$\n\nWhere:\n- $F_1$ = Force on small piston (input)\n- $A_1$ = Area of small piston\n- $F_2$ = Force on large piston (output)\n- $A_2$ = Area of large piston\n\n### Force Multiplication\n\nIf the large piston has **5 times** the area of the small piston, the output force will be **5 times** greater than the input force. This is how a small effort can lift a heavy load."),
  t(4, "### Calculating Hydraulic Force\n\n**Example:**\nA hydraulic press has a small piston with area 10 cm² and a large piston with area 50 cm². If a force of 200 N is applied to the small piston, what force is produced at the large piston?\n\n**Solution:**\n\n$$\\frac{F_1}{A_1} = \\frac{F_2}{A_2}$$\n\n$$\\frac{200}{10} = \\frac{F_2}{50}$$\n\n$$20 = \\frac{F_2}{50}$$\n\n$$F_2 = 20 \\times 50 = 1\\,000 \\text{ N}$$\n\nThe output force is **1 000 N** — five times the input force!\n\n### The Trade-Off: Force vs Distance\n\nImportant: When you gain force, you lose distance.\n- The small piston moves a **large distance**\n- The large piston moves a **small distance**\n- Equal volumes of liquid are moved, but different distances\n- This is the same principle as all simple machines: you cannot get something for nothing\n\n**Mechanical Advantage (MA):**\n\n$$\\text{MA} = \\frac{\\text{Output Force}}{\\text{Input Force}} = \\frac{A_2}{A_1}$$\n\nIf MA > 1, the system multiplies force. If MA < 1, the system multiplies distance/speed instead."),
  fb(5, "Pascal's Principle states that pressure applied to an enclosed fluid is transmitted ___ in all directions. The mechanical advantage of a hydraulic system equals the area of the ___ piston divided by the area of the ___ piston.",
    ['equally', 'large', 'small'],
    "Pascal's Principle ensures equal pressure transmission. MA = large piston area ÷ small piston area."),
  q(6, 'In a hydraulic system, a small piston has an area of 5 cm² and a large piston has an area of 25 cm². What is the mechanical advantage?',
    ['5', '25', '30', '0.2'], 0,
    'MA = Output area ÷ Input area = 25 ÷ 5 = 5. This means the output force is 5 times the input force.'),
  t(7, "## The Hydraulic Jack\n\nA **hydraulic jack** is a practical application of Pascal's Principle used to lift heavy objects like cars.\n\n### How a Hydraulic Jack Works\n\n1. A small handle is pumped, pushing hydraulic fluid from the small cylinder\n2. The fluid flows through a tube to a larger cylinder\n3. The pressure acts on the larger piston, creating a greater force\n4. A one-way valve prevents the fluid from flowing back\n5. Each pump stroke raises the load a small amount\n6. A release valve allows the fluid to return and the jack to lower\n\n### Systems Diagram for a Hydraulic Jack\n\n| Input | Process | Output |\n|-------|---------|--------|\n| Small force applied by hand to the handle (effort) | Force transmitted through hydraulic fluid from small piston to large piston | Large upward force lifts the car (load) |\n\n### Design Evaluation of a Hydraulic Jack\n\n- **Fitness for purpose:** Yes, it lifts heavy loads with small effort\n- **Materials:** Steel housing, rubber seals, hydraulic oil\n- **Safety:** Must be used on flat, stable ground; never work under a car supported only by a jack\n- **Ergonomics:** Handle should be comfortable to grip and long enough for leverage\n- **Cost:** Affordable for car owners (R200–R800 depending on capacity)"),
  q(8, 'What is the function of the one-way valve in a hydraulic jack?',
    ['To prevent hydraulic fluid from flowing back, keeping the load raised', 'To increase the pressure in the system', 'To reduce the weight of the jack', 'To make the jack pump faster'], 0,
    'The one-way (non-return) valve ensures that fluid cannot flow back to the small cylinder when the handle is released. This keeps the load raised between pump strokes.'),
  fb(9, 'A systems diagram has three parts: ___, process, and ___. In a hydraulic jack, the input is the small ___ applied to the handle.',
    ['input', 'output', 'force'],
    'A systems diagram shows input → process → output. The input to a hydraulic jack is the small force (effort) applied by the user on the pump handle.'),
  q(10, 'When a hydraulic system multiplies force (MA > 1), what trade-off occurs?',
    ['The output piston moves a shorter distance than the input piston', 'The system creates energy from nothing', 'The output piston moves a longer distance', 'No trade-off occurs'], 0,
    'Conservation of energy means you cannot get something for nothing. When force is multiplied, distance is reduced proportionally. The small piston moves far, the large piston moves a short distance.'),
];

// Lesson 3.2: Pulleys, Gears, and Mechanical Control Systems
blockNum = 0;
const ch3_lesson2 = [
  t(1, "## Pulley Systems\n\nA **pulley** is a wheel with a grooved rim through which a rope or cable passes. Pulleys are used to lift loads, change the direction of a force, or multiply force.\n\n### Types of Pulleys\n\n| Type | MA | Direction Change | How it works |\n|------|----|-----------------|--------------|\n| **Single fixed pulley** | 1 | Yes | Attached to a fixed point (ceiling). Changes the direction of pull — you pull down, the load goes up. No force multiplication. |\n| **Single moveable pulley** | 2 | No | Attached to the load. The load is supported by two sections of rope, halving the effort needed. |\n| **Block and tackle** | = number of load-bearing ropes | Yes | Combines fixed and moveable pulleys. More rope sections supporting the load = greater MA. |\n\n### Calculating Mechanical Advantage for Pulleys\n\n$$\\text{MA} = \\text{Number of rope sections supporting the load}$$\n\n**Example:** A block and tackle system has 4 rope sections supporting the load.\n- MA = 4\n- If the load weighs 400 N, the effort needed = 400 ÷ 4 = **100 N**\n- But you must pull the rope **4 times** the distance the load is lifted"),
  q(2, 'A single fixed pulley has a mechanical advantage of 1. Why is it still useful?',
    ['It changes the direction of the force so you can pull downward to lift a load upward', 'It doubles the force', 'It reduces friction', 'It makes the rope stronger'], 0,
    'A single fixed pulley does not multiply force (MA = 1), but it changes the direction of the effort. Pulling down is easier and more natural than pulling up because you can use your body weight.'),
  t(3, "## Gear Systems\n\nA **gear** is a toothed wheel that meshes with another toothed wheel to transmit motion and force.\n\n### Spur Gears\n\nSpur gears have straight teeth around their circumference. When two spur gears mesh:\n- They rotate in **opposite directions** (counter-rotating)\n- The gear doing the pushing is the **driver** (input)\n- The gear being pushed is the **driven** gear (output)\n\n### Gear Ratio\n\n$$\\text{Gear Ratio} = \\frac{\\text{Number of teeth on driven gear}}{\\text{Number of teeth on driver gear}}$$\n\n**Example:** Driver gear has 20 teeth, driven gear has 60 teeth.\nGear ratio = 60 ÷ 20 = **3:1**\n\nThis means:\n- The driven gear rotates **3 times slower** than the driver\n- The driven gear produces **3 times more torque** (turning force)\n- For every 3 rotations of the driver, the driven gear rotates once\n\n### Using an Idler Gear\n\nAn **idler gear** is placed between the driver and driven gears. It does not change the gear ratio, but it makes the driver and driven gears rotate in the **same direction**."),
  fb(4, 'Two meshing spur gears rotate in ___ directions. An idler gear is used to make the driver and driven gears rotate in the ___ direction.',
    ['opposite', 'same'],
    'Meshing spur gears counter-rotate. An idler gear reverses the direction change, making the input and output rotate the same way, without affecting the gear ratio.'),
  t(5, "## Types of Gear Systems\n\n| Gear Type | Description | Use |\n|-----------|-------------|-----|\n| **Spur gears** | Straight teeth, parallel axes | Clocks, hand drills, gearboxes |\n| **Bevel gears** | Cone-shaped, axes at 90° | Hand drills (change direction by 90°), differential in cars |\n| **Rack and pinion** | Circular gear (pinion) meshes with a flat toothed bar (rack) | Steering systems, automatic gates |\n| **Worm gear** | A screw-like gear meshes with a spur gear | Large speed reduction, self-locking (cannot be driven backwards) |\n\n### Bevel Gears\n\n- Change the axis of rotation by **90 degrees**\n- **Equal-sized** bevel gears: same speed and torque, just direction change\n- **Unequal-sized** bevel gears: also change speed and torque (like spur gears)\n\n### Worm Gear\n\n- The worm (screw) is the driver; the worm wheel (spur gear) is driven\n- Produces a **very large speed reduction** and **force increase**\n- **Self-locking:** The worm wheel cannot drive the worm, which makes it safe for lifting applications (e.g. guitar tuning pegs, crane hoists)"),
  q(6, 'Which gear system is used in car steering to convert rotational motion into linear (straight-line) motion?',
    ['Rack and pinion', 'Spur gears', 'Bevel gears', 'Worm gear'], 0,
    'A rack and pinion converts the rotational motion of the steering wheel (via the pinion gear) into the linear (left-right) motion of the steering rack, which turns the front wheels.'),
  t(7, "## Mechanical Control Systems\n\nControl systems are mechanisms that regulate or direct the operation of a machine.\n\n| Control System | How it works | Example |\n|---------------|-------------|--------|\n| **Ratchet and pawl** | A toothed wheel (ratchet) and a pivoting lever (pawl) that allows rotation in one direction only | Spanners, fishing reels, bicycle freewheel |\n| **Disc brake** | Brake pads squeeze a spinning disc to create friction and slow rotation | Car and motorcycle brakes |\n| **Bicycle brake** | Brake lever pulls a cable that pushes brake pads against the wheel rim | Caliper brakes on bicycles |\n| **Cleat** | A fitting on a surface (usually a boat) around which a rope is secured | Sailing boats, flagpoles |\n\n### The Ratchet and Pawl in Detail\n\nThe ratchet and pawl mechanism allows motion in **one direction only**:\n- When the ratchet wheel turns in the allowed direction, the pawl clicks over the teeth\n- When it tries to turn the other way, the pawl catches a tooth and locks the wheel\n- This prevents backward motion — useful for winches, car jacks, and socket spanners"),
  q(8, 'Why is a worm gear described as self-locking?',
    ['The worm wheel cannot drive the worm backwards, preventing the load from falling', 'It uses a key to lock the gears together', 'It can only turn at one speed', 'It does not need lubrication'], 0,
    'In a worm gear system, the friction angle is such that the worm wheel cannot drive the worm in reverse. This self-locking property makes it ideal for lifting applications where the load must stay in position.'),
  fb(9, 'A ratchet and pawl mechanism allows rotation in ___ direction only. A disc brake works by creating ___ between the brake pads and the spinning disc.',
    ['one', 'friction'],
    'The ratchet and pawl permits one-way rotation. Disc brakes use friction between the pads and disc to convert kinetic energy into heat, slowing the rotation.'),
  q(10, 'If a driver gear has 15 teeth and a driven gear has 45 teeth, what is the gear ratio?',
    ['3:1', '1:3', '15:1', '45:1'], 0,
    'Gear ratio = driven teeth ÷ driver teeth = 45 ÷ 15 = 3:1. The driven gear turns 3 times slower with 3 times more torque.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Electrical Systems and Control (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 4.1: Circuit Components, Series and Parallel, and Diodes
blockNum = 0;
const ch4_lesson1 = [
  t(1, "## Electrical Circuit Basics\n\nAn **electrical circuit** is a closed pathway through which electric current flows. For current to flow, you need:\n1. An **energy source** (cell or battery)\n2. A **conductor** (wire) to carry the current\n3. A **load** (component that uses the energy, like a lamp or buzzer)\n4. A **switch** to open or close the circuit\n\n### Conventional Current\n\n**Conventional current** flows from the **positive terminal** to the **negative terminal** of the battery. (In reality, electrons flow the opposite way, but we use the conventional direction in circuit diagrams.)\n\n### Component Symbols\n\n| Component | Symbol Description |\n|-----------|-------------------|\n| **Cell** | One long line (positive) and one short line (negative) |\n| **Battery** | Multiple cells in series |\n| **Lamp (bulb)** | Circle with a cross inside |\n| **Switch** | Gap in the line with a moveable contact |\n| **Resistor** | Rectangle or zigzag |\n| **Variable resistor** | Resistor with an arrow through it |\n| **Ammeter** | Circle with A inside (connected in series) |\n| **Voltmeter** | Circle with V inside (connected in parallel) |"),
  t(2, "## Cells and Lamps in Series and Parallel\n\n### Cells in Series\n\n- Connected end-to-end: positive to negative\n- **Voltages add up:** 3 cells of 1.5 V in series = 4.5 V total\n- All cells must face the same direction\n\n### Cells in Parallel\n\n- Connected positive to positive and negative to negative\n- **Voltage stays the same** as one cell, but **battery lasts longer**\n- Used when you need extended battery life\n\n### Lamps in Series\n\n- Connected one after another in a single path\n- **Same current** flows through all lamps\n- Voltage is **shared** between the lamps — each lamp gets dimmer\n- If one lamp breaks, **all lamps go out** (the circuit is broken)\n\n### Lamps in Parallel\n\n- Each lamp has its own separate path to the battery\n- **Same voltage** across each lamp — all burn at full brightness\n- If one lamp breaks, **the others stay on**\n- More current is drawn from the battery\n\n### South African Context\n\nParallel wiring is used in homes — if one light blows, the others stay on. Christmas tree lights wired in series all go out when one bulb fails."),
  q(3, 'What happens when one lamp breaks in a series circuit?',
    ['All lamps go out because the circuit is broken', 'Only that lamp goes out', 'The other lamps get brighter', 'Nothing changes'], 0,
    'In a series circuit, there is only one path for current. If one lamp breaks, the circuit is broken and no current flows, so all lamps go out.'),
  t(4, "## Switches in Series and Parallel (Logic Gates)\n\n### Switches in Series = AND Logic\n\nWhen two switches are connected in **series**, **both** must be ON (closed) for the circuit to work.\n\n- Switch A AND Switch B must be closed → lamp turns on\n- If either switch is open → lamp is off\n- Example: A safety system where two buttons must be pressed simultaneously\n\n### Switches in Parallel = OR Logic\n\nWhen two switches are connected in **parallel**, **either** one can be ON for the circuit to work.\n\n- Switch A OR Switch B is closed → lamp turns on\n- Both must be open for the lamp to be off\n- Example: A room light controlled from two doorways (like a hallway light)\n\n| Configuration | Logic | Condition for current to flow |\n|--------------|-------|-----------------------------|\n| **Series** | AND | All switches must be closed |\n| **Parallel** | OR | At least one switch must be closed |"),
  fb(5, 'Switches connected in series follow ___ logic — all must be closed for the circuit to work. Switches in parallel follow ___ logic — at least one must be closed.',
    ['AND', 'OR'],
    'Series switches require ALL to be closed (AND logic). Parallel switches require at least ONE to be closed (OR logic).'),
  t(6, "## Diodes and LEDs\n\n### The Diode\n\nA **diode** is a component that allows current to flow in **one direction only**.\n\n- The diode has two terminals: **anode** (+) and **cathode** (−)\n- Current flows from anode to cathode (in the direction of the arrow in the symbol)\n- If connected the wrong way around (reverse biased), no current flows\n- Used to protect circuits from reverse polarity\n\n### The LED (Light Emitting Diode)\n\nAn LED works like a diode but also **gives off light** when current flows through it.\n\n- Must be connected the correct way around (anode to positive, cathode to negative)\n- Must always have a **resistor** in series to limit the current (otherwise it will burn out)\n- Commonly used as indicator lights to show that a circuit is ON\n- More energy-efficient than traditional incandescent bulbs\n- Available in different colours (red, green, blue, white)\n\n### LED Protection\n\nA typical LED circuit uses a **470 ohm (470 Ω) resistor** in series with the LED and a 4.5 V battery to limit the current and prevent the LED from burning out."),
  q(7, 'Why must a resistor always be connected in series with an LED?',
    ['To limit the current and prevent the LED from burning out', 'To make the LED brighter', 'To change the colour of the LED', 'To make the LED flash'], 0,
    'LEDs have a very low resistance. Without a current-limiting resistor, too much current would flow through the LED, causing it to overheat and burn out.'),
  t(8, "## Resistor Colour Codes\n\nResistors limit the flow of current in a circuit. The resistance value is measured in **ohms (Ω)**.\n\n### Reading Resistor Colour Codes\n\nMost resistors have **four coloured bands**:\n- Band 1: First digit\n- Band 2: Second digit\n- Band 3: Multiplier (number of zeros to add)\n- Band 4: Tolerance (accuracy)\n\n| Colour | Digit | Multiplier |\n|--------|-------|------------|\n| Black | 0 | ×1 |\n| Brown | 1 | ×10 |\n| Red | 2 | ×100 |\n| Orange | 3 | ×1 000 |\n| Yellow | 4 | ×10 000 |\n| Green | 5 | ×100 000 |\n| Blue | 6 | ×1 000 000 |\n| Violet | 7 | — |\n| Grey | 8 | — |\n| White | 9 | — |\n| Gold | — | ×0.1 (tolerance ±5%) |\n| Silver | — | ×0.01 (tolerance ±10%) |\n\n**Example:** Brown, Black, Red, Gold = 1, 0, ×100 = **1 000 Ω (1 kΩ)** ±5%"),
  fb(9, 'A diode allows current to flow in ___ direction only. The colour code Brown-Black-Orange on a resistor gives a value of ___ Ω.',
    ['one', '10 000'],
    'Diodes are one-way current devices. Brown (1), Black (0), Orange (×1 000) = 10 × 1 000 = 10 000 Ω (10 kΩ).'),
  q(10, 'Three 1.5 V cells connected in series produce a total voltage of:',
    ['4.5 V', '1.5 V', '3.0 V', '6.0 V'], 0,
    'Cells in series have their voltages added together: 1.5 V + 1.5 V + 1.5 V = 4.5 V.'),
];

// Lesson 4.2: Ohm's Law and Switches
blockNum = 0;
const ch4_lesson2 = [
  t(1, "## Ohm's Law\n\n**Ohm's Law** describes the relationship between voltage, current, and resistance in an electrical circuit.\n\n### The Formula\n\n$$V = I \\times R$$\n\nWhere:\n- **V** = Voltage (potential difference) in **volts [V]**\n- **I** = Current strength in **amperes [A]**\n- **R** = Resistance in **ohms [Ω]**\n\n### Rearranging the Formula\n\n| To find | Formula | When you know |\n|---------|---------|---------------|\n| Voltage (V) | V = I × R | Current and Resistance |\n| Current (I) | I = V ÷ R | Voltage and Resistance |\n| Resistance (R) | R = V ÷ I | Voltage and Current |\n\n### The Relationship\n\n- If voltage **increases** (and resistance stays the same), current **increases**\n- If resistance **increases** (and voltage stays the same), current **decreases**\n- Voltage and current are **directly proportional** (when R is constant)\n- Current and resistance are **inversely proportional** (when V is constant)"),
  t(2, "### Ohm's Law Calculations\n\n**Example 1:** A resistor of 100 Ω is connected to a 9 V battery. Calculate the current.\n\n$$I = \\frac{V}{R} = \\frac{9}{100} = 0.09 \\text{ A} = 90 \\text{ mA}$$\n\n**Example 2:** A current of 0.5 A flows through a 20 Ω resistor. Calculate the voltage.\n\n$$V = I \\times R = 0.5 \\times 20 = 10 \\text{ V}$$\n\n**Example 3:** A 12 V battery drives a current of 0.3 A through a component. Calculate the resistance.\n\n$$R = \\frac{V}{I} = \\frac{12}{0.3} = 40 \\text{ Ω}$$\n\n### Practical Investigation: Testing Ohm's Law\n\nConnect a resistor to 1 cell, then 2 cells, then 3 cells in series. For each, measure:\n- Voltage (V) with a **voltmeter** connected in **parallel**\n- Current (I) with an **ammeter** connected in **series**\n\nPlot V on the x-axis and I on the y-axis. The graph should be a **straight line through the origin**, confirming Ohm's Law (V and I are directly proportional for a constant resistance)."),
  q(3, 'A 6 V battery is connected to a 30 Ω resistor. What is the current?',
    ['0.2 A', '180 A', '5 A', '36 A'], 0,
    'Using Ohm\'s Law: I = V ÷ R = 6 ÷ 30 = 0.2 A (200 mA).'),
  fb(4, "Ohm's Law states that V = I × ___. Current is measured in ___ using an ammeter connected in series.",
    ['R', 'amperes'],
    "V = I × R is Ohm's Law. Current (I) is measured in amperes (A) and the ammeter must be connected in series so all current flows through it."),
  t(5, "## Types of Switches\n\nSwitches are **input devices** that allow users to manually control a circuit.\n\n| Switch Type | Full Name | Description |\n|-------------|-----------|------------|\n| **Push switch** | Momentary push switch | Only on while being pressed; springs back when released |\n| **SPST** | Single Pole, Single Throw | Simplest switch — one input, one output. ON or OFF only |\n| **SPDT** | Single Pole, Double Throw | One input, two outputs. Switches between two circuits |\n| **DPDT** | Double Pole, Double Throw | Two inputs, two outputs. Switches two circuits simultaneously |\n\n### What do the terms mean?\n\n- **Pole** = Number of separate circuits the switch can control\n- **Throw** = Number of positions the switch can connect to\n\n### Applications\n\n| Switch | Use |\n|--------|----|\n| **Push switch** | Doorbell, emergency stop button, keyboard keys |\n| **SPST** | Simple on/off switch for a lamp or fan |\n| **SPDT** | Two-way light switch (hallway lights), selector switch |\n| **DPDT** | Reversing the direction of a motor, switching between two power sources |"),
  q(6, 'Which type of switch can reverse the direction of a DC motor?',
    ['DPDT (Double Pole, Double Throw)', 'SPST (Single Pole, Single Throw)', 'Push switch', 'SPDT (Single Pole, Double Throw)'], 0,
    'A DPDT switch can reverse the polarity of current flowing to a motor, reversing its direction. It controls two circuits simultaneously, swapping the connections to the motor terminals.'),
  t(7, "## Circuit Diagrams\n\nA **circuit diagram** uses standard symbols to show how components are connected in a circuit.\n\n### Rules for Drawing Circuit Diagrams\n\n1. Use a ruler — all lines must be straight (horizontal and vertical)\n2. Use correct symbols for each component\n3. Show the direction of conventional current (positive to negative)\n4. Label components and their values (e.g. R1 = 470 Ω)\n5. Indicate series and parallel connections clearly\n6. Include a switch for controlling the circuit\n\n### Reading a Circuit Diagram\n\nWhen analysing a circuit:\n1. Identify the **energy source** (battery/cell)\n2. Trace the path of current from positive through all components back to negative\n3. Identify **series components** (same path) and **parallel components** (separate paths)\n4. Determine the total voltage, resistance, and current\n\n### Example: Simple LED Circuit\n\nA 4.5 V battery (three 1.5 V cells in series) → switch → 470 Ω resistor → LED → back to battery\n\nCurrent: I = V ÷ R = 4.5 ÷ 470 ≈ 0.0096 A ≈ 9.6 mA (safe for the LED)"),
  q(8, 'A voltmeter must be connected in which way to measure the voltage across a component?',
    ['In parallel with the component', 'In series with the component', 'Between the switch and battery only', 'It does not matter'], 0,
    'A voltmeter is always connected in parallel (across) the component being measured. An ammeter is connected in series (in the current path).'),
  fb(9, 'In a circuit diagram, an ammeter is connected in ___ and a voltmeter is connected in ___. SPST stands for Single Pole, Single ___.',
    ['series', 'parallel', 'Throw'],
    'The ammeter goes in series to measure all current flowing through it. The voltmeter goes in parallel to measure the potential difference across a component. SPST = Single Pole, Single Throw.'),
  q(10, 'If resistance is kept constant and voltage is doubled, what happens to the current?',
    ['Current doubles', 'Current halves', 'Current stays the same', 'Current becomes zero'], 0,
    'Ohm\'s Law: I = V ÷ R. If R is constant and V doubles, then I also doubles. Voltage and current are directly proportional.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Electronic Systems and Control (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 5.1: Transistors and Sensors
blockNum = 0;
const ch5_lesson1 = [
  t(1, "## Transistors\n\nA **transistor** is a semiconductor device that can act as a **switch** or an **amplifier**. In Grade 9, we focus on the **NPN transistor**.\n\n### NPN Transistor Terminals\n\n| Terminal | Name | Function |\n|----------|------|----------|\n| **B** | Base | The control terminal — a small current here switches the transistor on |\n| **C** | Collector | Current flows IN through this terminal to the load |\n| **E** | Emitter | Current flows OUT through this terminal |\n\n### How a Transistor Works as a Switch\n\n1. When a **small current** flows into the Base, the transistor turns **ON**\n2. This allows a **much larger current** to flow from the Collector to the Emitter\n3. The larger current powers the load (buzzer, LED, motor)\n4. When no current flows into the Base, the transistor is **OFF** and no current flows through the load\n\n### Why Use a Transistor Switch?\n\n- Sensors (like LDRs and thermistors) produce very small currents\n- These small currents are too weak to power a buzzer or motor directly\n- The transistor **amplifies** the small sensor current to switch on a more powerful output device"),
  q(2, 'In an NPN transistor, which terminal controls whether the transistor is on or off?',
    ['Base', 'Collector', 'Emitter', 'Gate'], 0,
    'The Base is the control terminal. A small current flowing into the Base switches the transistor on, allowing a larger current to flow from Collector to Emitter.'),
  t(3, "## Sensors — Input Devices\n\nSensors detect changes in the environment and convert them into electrical signals. In electronic circuits, sensors act as **input devices** that feed information to the control system.\n\n### LDR (Light Dependent Resistor)\n\nAn LDR changes its resistance based on light levels:\n- **Dark:** Very high resistance (current blocked)\n- **Bright light:** Very low resistance (current flows easily)\n\n**Applications:** Automatic street lights (turn on when dark), burglar alarm light sensors, smartphone screen brightness\n\n### Thermistor\n\nA thermistor changes its resistance based on temperature. There are two types:\n\n| Type | Resistance when hot | Resistance when cold |\n|------|--------------------|--------------------|  \n| **NTC (Negative Temperature Coefficient)** | Decreases | Increases |\n| **PTC (Positive Temperature Coefficient)** | Increases | Decreases |\n\nMost commonly, NTC thermistors are used:\n- **Hot:** Low resistance → more current flows\n- **Cold:** High resistance → less current flows\n\n**Applications:** Fire alarms, temperature controllers, overheating protection in appliances"),
  t(4, "### Touch/Moisture Detector\n\nA **touch sensor** or **moisture detector** uses the conductivity of skin or water to complete a circuit.\n\n- Two metal contacts are placed close together but not touching\n- When a \"wet\" finger bridges the gap, current flows between the contacts\n- The small current triggers a transistor, which switches on the output (buzzer, LED)\n\n**Applications:** Rain detectors, soil moisture sensors for irrigation, touch-activated lamps\n\n### Capacitors\n\nA **capacitor** is a component that **stores electrical energy** and then **releases** it.\n\n- Measured in **farads (F)** — typically microfarads (μF) or picofarads (pF)\n- Charges up when connected to a voltage source\n- Discharges (releases stored energy) when the source is removed\n- Used to create **time delays** in circuits (e.g. a light that stays on for a few seconds after the switch is turned off)\n- Used to **smooth** voltage fluctuations in power supplies\n\n**In South Africa**, capacitors are found in Eskom power factor correction equipment and in the electronic ballasts of fluorescent lights."),
  fb(5, 'An LDR has ___ resistance in the dark and ___ resistance in bright light. A capacitor stores ___ energy.',
    ['high', 'low', 'electrical'],
    'LDR = Light Dependent Resistor. In darkness, resistance is high (megaohms). In bright light, resistance drops to a few hundred ohms. Capacitors store charge (electrical energy).'),
  q(6, 'Which sensor would you use in a fire alarm circuit?',
    ['Thermistor (temperature sensor)', 'LDR (light sensor)', 'Touch sensor', 'Capacitor'], 0,
    'A fire alarm detects high temperatures. A thermistor (specifically NTC type) decreases in resistance as temperature rises, allowing more current to flow and trigger the alarm.'),
  t(7, "## Practical Sensor Circuit: Automatic Night Light\n\n### How it Works\n\n1. An **LDR** is connected in a voltage divider circuit with a fixed resistor\n2. In the dark, the LDR's resistance is high → voltage at the Base of the NPN transistor increases\n3. When the voltage at the Base is high enough, the transistor switches **ON**\n4. Current flows from Collector to Emitter, lighting the **LED**\n5. In daylight, the LDR's resistance drops → voltage at the Base drops → transistor switches **OFF** → LED goes off\n\n### Circuit Components\n\n| Component | Role |\n|-----------|------|\n| LDR | Sensor — detects light levels |\n| Fixed resistor (e.g. 10 kΩ) | Forms voltage divider with LDR |\n| NPN transistor | Switch — turns LED on/off |\n| LED | Output — provides light |\n| 470 Ω resistor | Protects the LED from too much current |\n| Battery (e.g. 6 V) | Power source |\n\n### Variable Resistor for Sensitivity\n\nAdding a **variable resistor** (potentiometer) allows you to adjust the light level at which the circuit switches on. Turning the knob changes the resistance, setting the sensitivity."),
  q(8, 'In an automatic night-light circuit, what causes the transistor to switch on?',
    ['The LDR resistance increases in darkness, raising the voltage at the Base', 'The LDR resistance decreases in darkness', 'The capacitor charges up', 'The LED sends a signal to the transistor'], 0,
    'In darkness, the LDR has high resistance. In the voltage divider, this means more voltage appears at the transistor Base, switching it on and lighting the LED.'),
  fb(9, 'An NPN transistor has three terminals: Base, ___, and ___. A small current at the Base allows a larger current to flow from Collector to Emitter.',
    ['Collector', 'Emitter'],
    'The three terminals of an NPN transistor are Base (control input), Collector (current in from the supply), and Emitter (current out to ground).'),
  q(10, 'A capacitor in a circuit is used to create a time delay. When does the delay occur?',
    ['When the capacitor slowly discharges after the power is switched off', 'When the battery is connected', 'When the switch is pressed', 'When the LED is lit'], 0,
    'A time delay occurs as the capacitor discharges. When the power source is removed, the capacitor releases its stored energy gradually, keeping the circuit running for a short time.'),
];

// Lesson 5.2: Simple Electronic Circuits
blockNum = 0;
const ch5_lesson2 = [
  t(1, "## Drawing Simple Electronic Circuits\n\nIn Grade 9, you must be able to draw and understand the following electronic circuits.\n\n### Circuit 1: LED Indicator Circuit\n\n**Components:** LED, 470 Ω resistor, switch, 4.5 V battery (3 cells in series)\n\n**How it works:**\n1. Close the switch → current flows from the positive terminal of the battery\n2. Current passes through the 470 Ω resistor (which limits the current to a safe level)\n3. Current flows through the LED, which emits light\n4. Current returns to the negative terminal of the battery\n\n**Calculations:**\n- Total voltage: 4.5 V\n- Resistance: 470 Ω\n- Current: I = V ÷ R = 4.5 ÷ 470 ≈ 0.0096 A ≈ 9.6 mA\n- This is a safe current for most LEDs (typical maximum is 20 mA)\n\nThis circuit is the simplest electronic circuit and forms the basis of all indicator lights on electronic devices."),
  t(2, "### Circuit 2: LDR-Buzzer Circuit\n\n**Components:** LDR, buzzer, 3 V battery (2 cells in series)\n\n**How it works:**\n- In bright light: LDR has low resistance → current flows easily → buzzer sounds\n- In darkness: LDR has high resistance → not enough current → buzzer is silent\n\nThis is a simple light-activated alarm. It could be used as a dawn alarm or a light-break detector.\n\n### Circuit 3: NPN Transistor Alarm Circuit\n\n**Components:** NPN transistor, buzzer or bell, thermistor, variable resistor, 1 kΩ resistor, 6 V battery, LED, 470 Ω resistor, 1 000 μF capacitor, switch\n\n**How it works:**\n1. The thermistor and variable resistor form a **voltage divider** at the Base of the transistor\n2. When the temperature rises, the thermistor's resistance drops (NTC type)\n3. More voltage appears at the Base, switching the transistor **ON**\n4. Current flows through the buzzer/bell (main output) and the LED (indicator)\n5. The **1 000 μF capacitor** provides a short time delay — the alarm continues for a few seconds after the temperature drops\n6. The **variable resistor** allows you to set the trigger temperature"),
  q(3, 'In the NPN transistor alarm circuit, what is the purpose of the variable resistor?',
    ['To adjust the trigger temperature at which the alarm activates', 'To change the volume of the buzzer', 'To change the colour of the LED', 'To increase the battery voltage'], 0,
    'The variable resistor (potentiometer) adjusts the voltage divider ratio, which controls the temperature at which enough voltage reaches the Base to switch on the transistor and sound the alarm.'),
  t(4, "## Systems Diagrams for Electronic Circuits\n\nEvery electronic circuit can be represented as a **systems diagram** with three sections.\n\n### Input → Process → Output\n\n**Example 1: Automatic Night Light**\n\n| Input | Process | Output |\n|-------|---------|--------|\n| LDR detects darkness | NPN transistor switches on when Base voltage is high | LED lights up |\n\n**Example 2: Temperature Alarm**\n\n| Input | Process | Output |\n|-------|---------|--------|\n| Thermistor detects high temperature | NPN transistor amplifies the signal and switches on | Buzzer sounds + LED lights |\n\n**Example 3: Moisture Detector**\n\n| Input | Process | Output |\n|-------|---------|--------|\n| Touch/moisture sensor bridges the gap | NPN transistor switches on | Buzzer alerts the user |\n\n### Classification of Components\n\n| Category | Examples |\n|----------|----------|\n| **Input devices** | LDR, thermistor, touch sensor, switch, microphone |\n| **Process/Control devices** | Transistor, integrated circuit (IC), microcontroller |\n| **Output devices** | LED, buzzer, bell, motor, speaker, lamp |"),
  fb(5, 'In a systems diagram, the three sections are ___, process, and ___. An LDR is an example of an ___ device.',
    ['input', 'output', 'input'],
    'Systems diagrams follow the pattern: Input → Process → Output. The LDR is an input device that detects light levels and feeds information to the process stage.'),
  t(6, "## Exploded View Drawings\n\nAn **exploded view drawing** shows how a product fits together by separating the parts along their assembly axis.\n\n### Characteristics of an Exploded View\n\n- Each part is drawn **slightly separated** from its neighbours\n- **Dashed lines or arrows** show where each part fits\n- All parts are drawn in **3D** (isometric or perspective)\n- Parts are labelled with names and/or part numbers\n- The drawing shows the **order of assembly**\n\n### Why Use Exploded Views?\n\n- Shows how complex products are assembled\n- Useful for repair and maintenance manuals\n- Helps identify individual parts for ordering replacements\n- Used in instruction manuals (e.g. furniture from IKEA or @home)\n\n### Drawing an Exploded View for Your Circuit Project\n\nWhen designing an electronic device, your exploded view should show:\n1. The outer casing (housing)\n2. The circuit board with components\n3. The battery compartment\n4. Any mounting brackets or screws\n5. How all parts fit together in sequence"),
  q(7, 'What is the purpose of an exploded view drawing?',
    ['To show how the parts of a product fit together by separating them along the assembly axis', 'To show the circuit diagram of a product', 'To show the product from the top only', 'To calculate the cost of the product'], 0,
    'An exploded view separates parts along the assembly direction, showing how each component fits together. It is used in assembly instructions and maintenance manuals.'),
  t(8, "## Safe Working Practices in Electronics\n\nWhen building electronic circuits, safety is essential.\n\n### Safety Rules\n\n| Rule | Reason |\n|------|--------|\n| **Never work with mains electricity (220 V)** | Can cause fatal electric shock |\n| **Use low-voltage batteries only** | School circuits use 1.5 V to 9 V batteries |\n| **Check polarity before connecting** | Incorrect polarity can damage components (LEDs, capacitors, transistors) |\n| **Use a resistor with every LED** | Without it, the LED will burn out |\n| **Handle components carefully** | Static electricity can damage transistors and ICs |\n| **Keep the workspace clean and dry** | Water conducts electricity and can cause short circuits |\n| **Use wire strippers, not teeth or scissors** | Proper tools prevent injury and wire damage |\n| **Disconnect the battery when making changes** | Prevents short circuits and component damage |\n| **Wear safety goggles when soldering** | Hot solder can splash |\n\n### South African Electrical Safety\n\nIn South Africa, mains electricity is **230 V AC at 50 Hz**. Only qualified electricians may work on mains electrical systems. School Technology projects must always use **low-voltage DC** from batteries."),
  fb(9, 'Mains electricity in South Africa is ___ V AC. In school electronics projects, only low-voltage ___ from batteries must be used.',
    ['230', 'DC'],
    'South Africa uses 230 V AC mains electricity (potentially lethal). School projects use low-voltage DC (direct current) from batteries, typically 1.5 V to 9 V.'),
  q(10, 'Which component category does a buzzer belong to in a systems diagram?',
    ['Output device', 'Input device', 'Process device', 'Control device'], 0,
    'A buzzer is an output device — it converts electrical energy into sound. Input devices detect changes (sensors), and process devices control the circuit (transistors).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Processing — Preserving Materials (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 6.1: Preserving Metals and Food
blockNum = 0;
const ch6_lesson1 = [
  t(1, "## Processing: Preserving Materials\n\n**Processing** in Technology refers to changing raw materials into useful products, or treating materials to make them last longer. Preservation prevents materials from deteriorating due to natural processes like corrosion, decay, or bacterial growth.\n\n## Preserving Metals\n\nMetals corrode when exposed to moisture and oxygen. In South Africa's diverse climate — from the humid coast of KwaZulu-Natal to the dry interior of the Free State — corrosion rates vary significantly.\n\n### Method 1: Painting\n\n**How it works:** A layer of paint creates a physical barrier between the metal surface and the atmosphere, preventing moisture and oxygen from reaching the metal.\n\n- **Preparation:** The metal must be cleaned, sanded, and primed before painting\n- **Advantages:** Cheap, easy to apply, available in many colours\n- **Disadvantages:** Paint can chip, crack, or peel over time, exposing the metal\n- **Examples in SA:** Eskom pylons (painted regularly), bridge railings, school gates\n- **Maintenance:** Must be repainted every few years"),
  t(2, "### Method 2: Galvanising\n\n**How it works:** The metal (usually steel or iron) is dipped into a bath of **molten zinc** at about 450°C. The zinc bonds to the surface, creating a protective layer.\n\n- **Advantages:** Very durable, long-lasting (20-50 years), zinc provides **sacrificial protection** — even if scratched, the zinc corrodes before the steel\n- **Disadvantages:** More expensive than painting, limited to smaller items that fit in the zinc bath, dull grey appearance\n- **Examples in SA:** Corrugated roofing (\"sinki\"), fencing, highway guardrails, water tanks\n\n### Method 3: Electroplating\n\n**How it works:** The metal object is placed in a solution containing dissolved metal ions (e.g. chromium, nickel, gold). An electric current causes the dissolved metal to deposit as a thin layer on the object.\n\n**The electroplating process:**\n1. The object to be plated is the **cathode** (negative electrode)\n2. The plating metal is the **anode** (positive electrode)\n3. The electrolyte solution contains ions of the plating metal\n4. Current flows: metal ions from the solution deposit onto the object\n\n- **Advantages:** Creates a shiny, decorative finish; protects against corrosion; very thin layer so uses less metal\n- **Disadvantages:** Expensive equipment, chemicals can be toxic, thin coating can wear off\n- **Examples in SA:** Car bumpers (chrome plating), bathroom taps, jewellery"),
  q(3, 'In the electroplating process, the object to be plated is connected as the:',
    ['Cathode (negative electrode)', 'Anode (positive electrode)', 'Electrolyte', 'Switch'], 0,
    'The object to be plated is the cathode (negative electrode). Positive metal ions in the solution are attracted to the negative electrode and deposit on its surface.'),
  t(4, "## Preserving Food\n\nFood spoils due to **bacteria, fungi (mould), and enzymes** that break down organic matter. Preservation methods slow or stop this process.\n\n### Method 1: Storing Grain\n\nIn South Africa, the Free State and North West are major grain-producing provinces. Proper storage prevents spoilage and pest damage.\n\n- **Silos:** Large cylindrical containers that control temperature and humidity\n- **Key factors:** Keep grain dry (below 13% moisture), cool, and free from pests\n- **Threats:** Weevils, rats, mould from moisture\n- **Indigenous method:** Traditionally, grain was stored in clay pots or thatched grain baskets (izinqolobane) raised off the ground to keep moisture and pests away\n\n### Method 2: Pickling\n\n**How it works:** Food is preserved in **vinegar (acetic acid)** or brine (salt water). The acidic or salty environment kills bacteria and prevents spoilage.\n\n- **Examples:** Pickled onions, atchar (South African mango pickle), pickled fish (a Cape Malay tradition)\n- **Advantages:** Long shelf life, no refrigeration needed, adds flavour\n- **Disadvantages:** Changes the taste and texture of food"),
  fb(5, 'Galvanising involves coating steel with ___ by dipping it in a molten bath. Food pickling uses ___ (acetic acid) to kill bacteria and preserve food.',
    ['zinc', 'vinegar'],
    'Galvanising = zinc coating for corrosion protection. Pickling uses vinegar (an acid) to create an environment where bacteria cannot survive.'),
  t(6, "### Method 3: Drying and Salting\n\n**How it works:** Removing moisture from food prevents bacterial growth because bacteria need water to survive.\n\n**Drying methods:**\n- **Sun drying:** Laying food in direct sunlight (traditional method used across South Africa for biltong, dried fruit, and mielie meal)\n- **Oven drying:** Using a low-temperature oven to remove moisture\n- **Dehydrating:** Using a food dehydrator with controlled airflow and temperature\n\n**Salting methods:**\n- **Dry salting:** Rubbing salt directly onto the food surface\n- **Brining:** Soaking food in a salt-water solution\n\n### South African Biltong — A National Tradition\n\nBiltong is South Africa's most famous dried and salted food:\n1. Meat (beef, game, or ostrich) is cut into strips\n2. Strips are coated in salt, pepper, and coriander\n3. Vinegar is applied (both for flavour and to inhibit bacteria)\n4. Meat is hung in a cool, dry, well-ventilated area for 3-7 days\n5. The combination of salt, vinegar, and drying removes moisture and kills bacteria\n\n**Note:** The drying/salting process takes several days and cannot be rushed without risking spoilage."),
  q(7, 'Why does drying food help to preserve it?',
    ['Removing moisture prevents bacteria from growing because they need water to survive', 'Drying adds chemicals that kill bacteria', 'Drying makes food too hot for bacteria', 'Drying changes the colour of food'], 0,
    'Bacteria require moisture to grow and reproduce. By removing water from food through drying, you create an environment where bacteria cannot survive, preserving the food.'),
  t(8, "### Practical Investigation: Electroplating\n\n**Aim:** To coat a metal object (e.g. a steel key) with copper using electroplating.\n\n**Materials:**\n- Copper sulfate solution (electrolyte)\n- A copper plate (anode — positive)\n- A steel key (cathode — negative)\n- 6 V battery or DC power supply\n- Connecting wires with crocodile clips\n- Beaker\n\n**Method:**\n1. Clean the steel key thoroughly with sandpaper and washing liquid\n2. Prepare the copper sulfate solution in the beaker\n3. Connect the copper plate to the **positive** terminal of the battery (anode)\n4. Connect the steel key to the **negative** terminal (cathode)\n5. Submerge both in the copper sulfate solution\n6. Switch on the power and leave for 15-20 minutes\n7. Remove the key — it should have a thin layer of copper\n\n**Observations:**\n- The copper plate (anode) slowly dissolves as copper ions enter the solution\n- Copper ions from the solution deposit on the key (cathode)\n- A longer plating time produces a thicker coating"),
  fb(9, 'Bacteria need ___ to grow, which is why drying food preserves it. In electroplating, the anode is the ___ electrode and it slowly dissolves.',
    ['moisture', 'positive'],
    'Bacteria require moisture for growth. In electroplating, the anode (positive electrode) is the plating metal, which dissolves and deposits onto the cathode.'),
  q(10, 'Which South African preservation tradition combines salting, vinegar, and drying?',
    ['Making biltong', 'Making atchar', 'Making boerewors', 'Making pap'], 0,
    'Biltong uses a combination of salt (draws out moisture), vinegar (kills bacteria, adds flavour), and drying (removes moisture) to preserve meat. It is a uniquely South African tradition.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Processing — Plastics and Recycling (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 7.1: Types of Plastics, Properties, and Recycling
blockNum = 0;
const ch7_lesson1 = [
  t(1, "## Types of Plastics and Their Uses\n\nPlastics are **synthetic materials** made from petrochemicals (derived from crude oil). They are polymers — long chains of repeating molecular units.\n\n### Two Main Categories\n\n| Category | Properties | Recycling | Examples |\n|----------|-----------|-----------|----------|\n| **Thermoplastics** | Soften when heated, can be reshaped and recycled | Yes, can be melted and remoulded | PET, HDPE, PVC, LDPE, PP, PS |\n| **Thermosetting plastics** | Harden permanently when heated, cannot be reshaped | No, cannot be remelted | Bakelite, epoxy, melamine, polyester resin |\n\n### Plastic Identification Codes\n\nEvery plastic product has a **recycling code** (a number inside a triangle of arrows) that identifies the type of plastic.\n\n| Code | Abbreviation | Full Name | Common Products |\n|------|-------------|-----------|----------------|\n| 1 | PET/PETE | Polyethylene Terephthalate | Cool drink bottles, food containers |\n| 2 | HDPE | High-Density Polyethylene | Milk bottles, shampoo bottles, pipes |\n| 3 | PVC | Polyvinyl Chloride | Plumbing pipes, electrical insulation, window frames |\n| 4 | LDPE | Low-Density Polyethylene | Plastic bags, cling wrap, squeeze bottles |\n| 5 | PP | Polypropylene | Yoghurt tubs, bottle caps, car bumpers |\n| 6 | PS | Polystyrene | Disposable cups, packaging foam, CD cases |\n| 7 | Other | Mixed or other plastics | Nylon, acrylic, polycarbonate |"),
  t(2, "## Properties of Plastics\n\n| Property | Description |\n|----------|------------|\n| **Lightweight** | Much lighter than metals — ideal for packaging and transport |\n| **Durable** | Resistant to corrosion, rot, and most chemicals |\n| **Flexible** | Can be moulded into almost any shape |\n| **Insulating** | Good electrical and thermal insulator |\n| **Waterproof** | Does not absorb water |\n| **Cheap** | Low cost to manufacture in large quantities |\n\n### Disadvantages of Plastics\n\n| Problem | Impact |\n|---------|--------|\n| **Non-biodegradable** | Most plastics take hundreds of years to break down |\n| **Pollution** | Plastic waste pollutes oceans, rivers, and land |\n| **Made from fossil fuels** | Uses non-renewable petroleum resources |\n| **Toxic when burned** | Burning plastics releases harmful gases |\n| **Microplastics** | Tiny plastic fragments enter the food chain and water supply |\n\n### South African Plastic Crisis\n\n- South Africa produces over **2 million tonnes** of plastic waste per year\n- Only about **16%** is recycled (the rest goes to landfill)\n- Organisations like **PETCO** and **Plastics SA** promote recycling\n- The government has banned single-use plastic carrier bags below a certain thickness"),
  q(3, 'What is the main difference between thermoplastics and thermosetting plastics?',
    ['Thermoplastics can be melted and reshaped; thermosetting plastics cannot', 'Thermoplastics are stronger', 'Thermosetting plastics are cheaper', 'There is no difference'], 0,
    'Thermoplastics soften when heated and can be recycled by melting and remoulding. Thermosetting plastics harden permanently during manufacture and cannot be remelted — they burn or char instead.'),
  t(4, "## Reduce, Reuse, Recycle\n\nThe **3 Rs** are a hierarchy of waste management strategies, in order of priority:\n\n### 1. Reduce\n\nUse less plastic in the first place.\n- Carry reusable shopping bags\n- Buy products with less packaging\n- Use a reusable water bottle instead of buying plastic bottles\n- Choose products made from sustainable materials\n\n### 2. Reuse\n\nUse plastic items again instead of throwing them away.\n- Wash and reuse containers for storage\n- Repurpose plastic bottles as plant pots or storage\n- Donate items that still have useful life\n\n### 3. Recycle\n\nConvert waste plastic into new products.\n- Sort plastics by recycling code\n- Clean containers before recycling\n- Use designated recycling bins\n\n### The Recycling Process\n\n1. **Collection:** Plastics are collected from households, businesses, and waste pickers\n2. **Sorting:** Plastics are sorted by type using the identification codes\n3. **Washing:** Sorted plastics are washed to remove contaminants\n4. **Shredding:** Clean plastic is shredded into small flakes\n5. **Melting and pelletising:** Flakes are melted and formed into small pellets\n6. **Remanufacturing:** Pellets are used to mould new products"),
  fb(5, 'The three Rs of waste management are Reduce, ___, and Recycle. After shredding, recycled plastic is melted and formed into small ___.',
    ['Reuse', 'pellets'],
    'The 3 Rs in order of priority: Reduce, Reuse, Recycle. During recycling, shredded plastic is melted and extruded into pellets that can be used as raw material for new products.'),
  t(6, "## Case Studies: Plastics in South Africa\n\n### Case Study 1: Plastics on Modern Motor Cars\n\nModern vehicles use plastics extensively to reduce weight and improve fuel efficiency.\n\n| Car Component | Plastic Used | Reason |\n|--------------|-------------|--------|\n| **Bumpers** | PP (Polypropylene) | Absorbs impact, lightweight, cheap to replace |\n| **Dashboard** | ABS, PP | Can be moulded into complex shapes, durable |\n| **Headlight covers** | Polycarbonate | Transparent, impact-resistant, lighter than glass |\n| **Fuel tank** | HDPE | Corrosion-resistant, lightweight, strong |\n| **Wiring insulation** | PVC | Excellent electrical insulator, flexible |\n| **Seat foam** | Polyurethane | Comfortable, lightweight, durable |\n\nSouth African car manufacturers like those at the Nelson Mandela Bay (Port Elizabeth) factories use large volumes of automotive-grade plastics.\n\n### Case Study 2: Plastics Around the Home\n\n| Item | Plastic | Why |\n|------|---------|----|\n| Water pipes | PVC | Cheap, corrosion-resistant, lightweight, easy to install |\n| Food containers | PP, HDPE | Safe for food contact, cheap, reusable |\n| Electrical plugs | Bakelite (thermoset) | Heat-resistant, electrical insulator, does not melt |\n| Garden furniture | HDPE, PP | Weather-resistant, lightweight, no painting needed |"),
  q(7, 'Why are car bumpers made from polypropylene (PP) instead of metal?',
    ['PP absorbs impact energy, is lighter, and is cheaper to replace after a collision', 'PP is stronger than steel', 'PP never breaks', 'PP is heavier, giving the car more stability'], 0,
    'Polypropylene bumpers are lightweight (improves fuel efficiency), absorb impact energy in minor collisions (protecting the car body), and are much cheaper to replace than metal panels.'),
  t(8, "## Systems Diagram: Plastics Recycling Project\n\nA systems diagram for a plastics recycling operation:\n\n### Input → Process → Output\n\n| Stage | Input | Process | Output |\n|-------|-------|---------|--------|\n| **Collection** | Mixed plastic waste | Sorting by type (codes 1-7) | Separated plastic streams |\n| **Preparation** | Sorted plastics | Washing, removing labels | Clean plastic |\n| **Processing** | Clean plastic | Shredding into flakes | Plastic flakes |\n| **Manufacturing** | Plastic flakes | Melting, extruding into pellets | Recycled pellets |\n| **Production** | Recycled pellets | Injection moulding or extrusion | New plastic products |\n\n### Moulding Methods\n\n| Method | How it works | Products |\n|--------|-------------|----------|\n| **Injection moulding** | Melted plastic is injected under pressure into a mould | Bottle caps, containers, toys |\n| **Extrusion** | Melted plastic is pushed through a shaped die | Pipes, sheets, profiles |\n| **Blow moulding** | A tube of melted plastic is inflated inside a mould | Bottles, containers, tanks |\n| **Vacuum forming** | A heated plastic sheet is sucked onto a mould by vacuum | Packaging trays, yoghurt cups |"),
  fb(9, 'In injection moulding, melted plastic is forced under ___ into a mould. PVC is commonly used for water pipes because it is ___ and does not corrode.',
    ['pressure', 'lightweight'],
    'Injection moulding uses high pressure to force molten plastic into a mould cavity. PVC pipes are lightweight, cheap, corrosion-resistant, and easy to install.'),
  q(10, 'Which of the following is a thermosetting plastic?',
    ['Bakelite', 'PET', 'HDPE', 'Polypropylene'], 0,
    'Bakelite is a thermosetting plastic — once formed, it cannot be melted or reshaped. PET, HDPE, and PP are all thermoplastics that can be recycled by melting.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Revision (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch8_lesson1 = [
  t(1, "## Grade 9 Technology — Comprehensive Revision\n\n### Design Skills and Graphic Communication\n\n**Line types** in technical drawing:\n- **Continuous thick:** Visible outlines\n- **Continuous thin:** Dimension lines, projection lines\n- **Dashed:** Hidden edges\n- **Chain line:** Centre lines, axes of symmetry\n\n**Scale:** 1:50 means 1 unit on drawing = 50 units real. A reduction scale (e.g. 1:100) makes the drawing smaller. An enlargement scale (e.g. 2:1) makes the drawing larger.\n\n**First Angle Orthographic Projection:**\n- Front view in the centre\n- Top view **below** the front view\n- Right side view to the **left** of the front view\n- Use correct line types and dimensions (in mm)"),
  t(2, "### The IDMEC Design Process\n\n| Step | Key Activities |\n|------|---------------|\n| **Investigate** | Research the problem, analyse existing products (fitness for purpose, safety, cost, materials, ergonomics, aesthetics) |\n| **Design** | Write a design brief (specifications and constraints), generate 2+ ideas, evaluate ideas, choose the best |\n| **Make** | Build the model/prototype using working drawings, flow chart for sequence, safe working practices |\n| **Evaluate** | Test against specifications, identify strengths and weaknesses, suggest improvements |\n| **Communicate** | Present through drawings, reports, presentations, budgets |\n\n**Budgeting components:** Materials, labour, transport, equipment, overheads, contingency (10%)"),
  q(3, 'In first angle orthographic projection, where is the right side view placed?',
    ['To the left of the front view', 'To the right of the front view', 'Above the front view', 'Below the front view'], 0,
    'In first angle projection, views are placed opposite to the direction of viewing. Looking from the right, the view is projected to the left.'),
  t(4, "### Structures Revision\n\n**Forces in structures:**\n- **Tension:** Pulling/stretching\n- **Compression:** Pushing/squashing\n- **Bending:** Combination of tension and compression\n- **Torsion:** Twisting\n- **Shear:** Sliding in opposite directions\n\n**Loads:** Static (dead) loads are permanent; dynamic (live) loads change.\nEven loads are spread across the structure; point loads are concentrated.\n\n**Strengthening:** Triangulation (cross-bracing) is the most effective method because triangles are rigid shapes.\n\n**Metal cross-sections:** I-beam, T-section, angle, channel, hollow tube. I-beams are efficient because material is at the top and bottom where bending forces are greatest.\n\n**Corrosion prevention:** Painting, galvanising (zinc coating), electroplating, oiling, plastic coating, using stainless steel.\n\n**Material properties:** Hardness, stiffness, flexibility, strength, elasticity, brittleness, density, corrosion resistance."),
  fb(5, 'The strongest geometric shape in structures is the ___. The I-beam concentrates material at the top and bottom, called the ___.',
    ['triangle', 'flanges'],
    'Triangles cannot deform without breaking a member. The flanges of an I-beam are the horizontal plates at the top and bottom where bending forces (compression and tension) are greatest.'),
  t(6, "### Mechanical Systems Revision\n\n**Hydraulic vs Pneumatic:**\n- Hydraulic: uses incompressible liquid (oil/water), precise force transfer\n- Pneumatic: uses compressible gas (air), spongy response\n\n**Pascal's Principle:** Pressure applied to an enclosed fluid transmits equally in all directions.\n- Formula: F₁/A₁ = F₂/A₂\n- MA = A₂ ÷ A₁\n- Trade-off: force gained = distance lost\n\n**Pulleys:**\n- Fixed pulley: MA = 1, changes direction\n- Moveable pulley: MA = 2, no direction change\n- Block and tackle: MA = number of supporting ropes\n\n**Gears:**\n- Spur gears: counter-rotate, gear ratio = driven teeth ÷ driver teeth\n- Idler gear: makes input and output rotate same direction\n- Bevel gears: change axis by 90°\n- Rack and pinion: rotational → linear motion\n- Worm gear: large speed reduction, self-locking\n\n**Control systems:** Ratchet and pawl (one-way), disc brake (friction), cleat (securing rope)"),
  q(7, 'What is the mechanical advantage of a block and tackle pulley system with 6 load-bearing rope sections?',
    ['6', '3', '12', '1'], 0,
    'In a block and tackle system, MA equals the number of rope sections supporting the load. With 6 sections, MA = 6, meaning you need only 1/6 of the load force as effort.'),
  t(8, "### Electrical and Electronic Systems Revision\n\n**Circuit basics:** Series (one path, same current, voltage shared) vs Parallel (multiple paths, same voltage, current shared). Switches in series = AND logic. Switches in parallel = OR logic.\n\n**Ohm's Law:** V = I × R. Voltage in volts, current in amperes, resistance in ohms.\n\n**Components:** Diodes (one-way current), LEDs (one-way + light, need resistor), resistor colour codes.\n\n**Transistor (NPN):** Base, Collector, Emitter. Small Base current switches on larger Collector-Emitter current.\n\n**Sensors:** LDR (high R in dark, low R in light), thermistor NTC (low R when hot), touch/moisture sensor, capacitor (stores and releases energy, time delays).\n\n**Switches:** Push (momentary), SPST (on/off), SPDT (two outputs), DPDT (two circuits).\n\n**Systems diagram:** Input (sensors) → Process (transistor) → Output (LED, buzzer, motor)"),
  fb(9, "Ohm's Law is written as V = I × ___. A thermistor (NTC type) has ___ resistance when hot and high resistance when cold.",
    ['R', 'low'],
    "V = I × R is Ohm's Law. NTC (Negative Temperature Coefficient) thermistors decrease in resistance as temperature increases."),
  q(10, 'Which preservation method involves dipping steel into molten zinc at 450°C?',
    ['Galvanising', 'Electroplating', 'Painting', 'Pickling'], 0,
    'Galvanising involves dipping iron or steel into molten zinc at approximately 450°C. The zinc coating provides sacrificial protection against corrosion.'),
  t(11, "### Processing Revision\n\n**Preserving metals:** Painting (barrier), galvanising (zinc coating, sacrificial protection), electroplating (thin metal layer using electricity).\n\n**Preserving food:** Storing grain (silos, low moisture), pickling (vinegar/brine kills bacteria), drying and salting (removes moisture that bacteria need).\n\n**Plastics:**\n- Thermoplastics: can be remelted and recycled (PET, HDPE, PVC, LDPE, PP, PS)\n- Thermosetting: permanent, cannot be remelted (Bakelite, epoxy, melamine)\n- Recycling codes 1-7 for sorting\n- 3 Rs: Reduce, Reuse, Recycle\n- Moulding: injection, extrusion, blow moulding, vacuum forming\n\n**South African context:** Biltong (drying + salting), galvanised roofing (sinki), PETCO recycling, Port Elizabeth car factories, Eskom pylons."),
  q(12, 'Which of the following is NOT a thermoplastic?',
    ['Bakelite', 'PET', 'HDPE', 'PVC'], 0,
    'Bakelite is a thermosetting plastic — once formed, it cannot be melted or reshaped. PET, HDPE, and PVC are all thermoplastics that can be melted and recycled.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN — Insert into MongoDB
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 9
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 9/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 9:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 9', schoolId: SCHOOL_ID, orderIndex: 9,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 9:', String(GRADE_ID));
  }

  // Find or create Technology subject
  const subjectDoc = await db.collection('subjects').findOne({ name: /Technology/i });
  let SUBJECT_ID;
  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Technology subject:', String(SUBJECT_ID));
  } else {
    const result = await db.collection('subjects').insertOne({
      name: 'Technology',
      code: 'TECH',
      schoolId: SCHOOL_ID,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Technology subject:', String(SUBJECT_ID));
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
      title: 'Chapter 1: Design Skills and Graphic Communication',
      description: 'Line types in technical drawing, scale, first angle orthographic projection, dimensioning rules, the IDMEC design process, design briefs, budgeting, and communication skills.',
      order: 1,
      lessons: [
        { title: 'Line Types, Scale, and Orthographic Projection', description: 'Line types (thick, thin, dashed, chain, wavy), scale (reduction and enlargement), first angle orthographic projection, three standard views, dimensioning rules.', blocks: ch1_lesson1, term: 1 },
        { title: 'The Design Process (IDMEC) and Communication', description: 'Investigate, Design, Make, Evaluate, Communicate. Design briefs, specifications, constraints, generating ideas, evaluation instruments, budgeting, tender presentations.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Structures',
      description: 'Forces in structures (tension, compression, bending, torsion, shear), static and dynamic loads, metal cross-sections, cross-bracing, properties of construction materials, and corrosion prevention.',
      order: 2,
      lessons: [
        { title: 'Forces in Structures and Strength of Materials', description: 'Tension, compression, bending, torsion, shear forces. Static vs dynamic loads. Even vs uneven loads. Metal cross-sections (I-beam, T, L, channel). Cross-bracing and triangulation.', blocks: ch2_lesson1, term: 1 },
        { title: 'Properties of Construction Materials', description: 'Material properties (mass, hardness, stiffness, flexibility, strength, elasticity, brittleness). Corrosion causes and prevention (painting, galvanising, electroplating). Material selection for structures.', blocks: ch2_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Mechanical Systems — Hydraulics, Pneumatics, and Mechanisms',
      description: 'Hydraulic and pneumatic systems, Pascal\'s Principle, hydraulic press and jack calculations, pulley systems, gear types (spur, bevel, rack-and-pinion, worm), and mechanical control systems.',
      order: 3,
      lessons: [
        { title: 'Pneumatics, Hydraulics, and Pascal\'s Principle', description: 'Hydraulic vs pneumatic systems, compressibility, Pascal\'s Principle, force multiplication, mechanical advantage, hydraulic press calculations, hydraulic jack operation and evaluation.', blocks: ch3_lesson1, term: 2 },
        { title: 'Pulleys, Gears, and Mechanical Control Systems', description: 'Fixed, moveable, and block-and-tackle pulleys. Spur gears, bevel gears, rack and pinion, worm gears, idler gears, gear ratios. Ratchet and pawl, disc brakes, bicycle brakes, cleats.', blocks: ch3_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 4: Electrical Systems and Control',
      description: 'Circuit components and symbols, cells and lamps in series and parallel, switches as logic gates (AND/OR), diodes and LEDs, resistor colour codes, Ohm\'s Law calculations, and types of switches.',
      order: 4,
      lessons: [
        { title: 'Circuit Components, Series and Parallel, and Diodes', description: 'Circuit components, component symbols, conventional current, cells and lamps in series and parallel, switches in series (AND) and parallel (OR), diodes, LEDs, resistor colour codes.', blocks: ch4_lesson1, term: 3 },
        { title: 'Ohm\'s Law and Switches', description: 'Ohm\'s Law (V = IR), calculations, practical investigation, voltmeter and ammeter connections, types of switches (push, SPST, SPDT, DPDT), drawing circuit diagrams.', blocks: ch4_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 5: Electronic Systems and Control',
      description: 'NPN transistors as switches, sensors (LDR, thermistor, touch/moisture), capacitors, simple electronic circuits, systems diagrams, exploded view drawings, and safe working practices.',
      order: 5,
      lessons: [
        { title: 'Transistors and Sensors', description: 'NPN transistor (Base, Collector, Emitter), transistor as switch, LDR, thermistor (NTC/PTC), touch/moisture sensor, capacitors, automatic night-light circuit, variable resistor for sensitivity.', blocks: ch5_lesson1, term: 3 },
        { title: 'Simple Electronic Circuits', description: 'LED indicator circuit, LDR-buzzer circuit, NPN transistor alarm circuit, systems diagrams (input-process-output), exploded view drawings, safe working practices in electronics.', blocks: ch5_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 6: Processing — Preserving Materials',
      description: 'Preserving metals (painting, galvanising, electroplating), preserving food (storing grain, pickling, drying and salting), indigenous preservation methods, and practical electroplating investigation.',
      order: 6,
      lessons: [
        { title: 'Preserving Metals and Food', description: 'Painting, galvanising, electroplating (practical investigation). Storing grain, pickling, drying and salting. South African context: biltong, atchar, sinki roofing, Eskom pylons.', blocks: ch6_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 7: Processing — Plastics and Recycling',
      description: 'Thermoplastics vs thermosetting plastics, plastic identification codes, properties and environmental impact, reduce-reuse-recycle, moulding methods, and plastics in everyday life.',
      order: 7,
      lessons: [
        { title: 'Types of Plastics, Properties, and Recycling', description: 'Thermoplastics vs thermosetting, recycling codes 1-7, properties and disadvantages, 3 Rs, recycling process, injection moulding, extrusion, blow moulding, vacuum forming, SA case studies.', blocks: ch7_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 8: Revision',
      description: 'Comprehensive revision of all Grade 9 Technology topics: design skills, structures, mechanical systems, electrical systems, electronic systems, processing, and plastics.',
      order: 8,
      lessons: [
        { title: 'Grade 9 Technology Comprehensive Revision', description: 'Full revision covering design skills, orthographic projection, IDMEC, structures and forces, mechanical systems, hydraulics, pulleys, gears, electrical circuits, Ohm\'s Law, electronics, sensors, processing, and plastics.', blocks: ch8_lesson1, term: 4 },
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
    title: 'Grade 9 Technology \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Design Skills and Graphic Communication, Structures, Mechanical Systems (Hydraulics, Pneumatics, Pulleys, Gears), Electrical Systems, Electronic Systems, Processing (Preserving Metals and Food), Plastics and Recycling, and Revision for Grade 9 Technology.',
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
  console.log('  TEXTBOOK: Grade 9 Technology');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
