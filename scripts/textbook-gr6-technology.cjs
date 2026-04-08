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
// CHAPTER 1: The Design Process (Term 1) — 2 lessons
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 1.1: Introduction to IDMEC
blockNum = 0;
const ch1_lesson1 = [
  t(1, "## What Is Technology?\n\nIn everyday language, people think \"technology\" means computers, tablets, and cell phones. But in this subject, **technology** means using knowledge, skills, and resources to design and make products or systems that solve problems and meet human needs.\n\nEvery object around you was designed by someone to solve a problem:\n\n| Object | Problem it solves |\n|--------|-------------------|\n| A pencil | We need to write and draw |\n| A bridge | We need to cross a river |\n| A JoJo water tank | We need to store water |\n| A solar geyser | We need to heat water without electricity |\n| A wheelchair ramp | People with disabilities need access to buildings |\n\n### Technology in South Africa\n\nSouth Africa has a rich history of technology. Long before European settlers arrived, the Mapungubwe people (in Limpopo, around 1200 AD) were already smelting gold and iron. Today, South African engineers design world-class innovations — the CAT scan was co-invented by Allan Cormack, a South African physicist."),
  t(2, "## The Design Process — IDMEC\n\nWhenever you solve a problem in Technology, you follow a step-by-step method called **IDMEC**. Each letter stands for one step.\n\n| Letter | Step | What You Do |\n|--------|------|-------------|\n| **I** | **Investigate** | Research the problem. Find out what is needed, what already exists, and what materials are available. |\n| **D** | **Design** | Write a design brief. List specifications (requirements) and constraints (limitations). Sketch at least two possible ideas. |\n| **M** | **Make** | Plan the making steps (flow chart), gather tools and materials, and build your solution safely. |\n| **E** | **Evaluate** | Test your product. Does it meet the specifications? What works well? What needs improving? |\n| **C** | **Communicate** | Present your project — show your sketches, your product, and explain your design decisions. |\n\n### Important Vocabulary\n\n- **Design brief:** A short paragraph that says what you will design and make, who it is for, and what it must do.\n- **Specifications:** The requirements your product **must** meet (e.g. must hold 500 g, must be waterproof).\n- **Constraints:** Limitations you **cannot** change (e.g. budget of R25, size under 20 cm, 2 weeks to finish)."),
  q(3, 'What does the letter "I" stand for in the IDMEC design process?',
    ['Investigate', 'Invent', 'Illustrate', 'Improve'], 0,
    'The first step of IDMEC is Investigate — you research the problem, find out who needs a solution, look at existing products, and gather information before you start designing.'),
  t(4, "## The Investigate Step\n\nBefore you can design anything, you need to understand the problem properly. This is the **Investigate** step.\n\n### What to Research\n\n1. **The problem** — Read it carefully. Who has the problem? What do they need?\n2. **Existing products** — Look at products that already solve a similar problem.\n3. **Materials** — What materials are available? What are their properties?\n4. **The user** — Who will use the product? What do they need?\n\n### Analysing Existing Products\n\nWhen you look at an existing product, ask these questions:\n\n| Factor | Question |\n|--------|----------|\n| **Fitness for purpose** | Does it do the job properly? |\n| **Safety** | Is it safe to use? Any sharp edges or dangers? |\n| **Cost** | Is it affordable? |\n| **Aesthetics** | Does it look good? |\n| **Ergonomics** | Is it comfortable and easy to use? |\n| **Durability** | Will it last a long time? |\n| **Environmental impact** | Can it be recycled? Does it cause pollution? |\n\n### Example Scenario\n\n> *A primary school in Mpumalanga needs a bird feeder for their school garden. The feeder must protect seed from rain, be easy to refill, and be made from recycled materials found at the school.*"),
  fb(5, 'The five steps of IDMEC are ___, Design, Make, ___, and Communicate.',
    ['Investigate', 'Evaluate'],
    'IDMEC: Investigate, Design, Make, Evaluate, Communicate. Always start by investigating the problem, and always evaluate your product after making it.'),
  t(6, "## The Design Step — Briefs, Specifications, and Sketches\n\n### Writing a Design Brief\n\nA design brief is a short paragraph that states:\n- **What** you will design and make\n- **Who** it is for\n- **What** it must do\n\n**Example:** *Design and make a bird feeder for the school garden that protects seed from rain, is easy to refill, and is made from recycled materials.*\n\n### Specifications vs Constraints\n\n| | Specifications | Constraints |\n|--|---------------|-------------|\n| **What** | Things the product **must** do | Things that **limit** your design |\n| **Examples** | Must hold 200 g of seed; must keep seed dry; must hang from a tree | Budget of R20; only recycled materials; must fit in a 30 cm box; 2 weeks to finish |\n\n### Sketching Your Ideas\n\nYou must draw at least **two different ideas** as freehand 3D sketches.\n\nFor each sketch:\n- Label the **materials** (e.g. plastic bottle, wire, cardboard)\n- Show the **dimensions** (e.g. 20 cm tall)\n- Add **notes** explaining how it works\n- Use pencil, not pen (so you can erase)"),
  q(7, 'What is the difference between a specification and a constraint?',
    ['A specification is what the product must do; a constraint is a limitation on the design', 'They mean the same thing', 'A constraint is more important than a specification', 'A specification is only about size'], 0,
    'Specifications are the requirements your product must meet (e.g. must hold 500 g). Constraints are limitations you must work within (e.g. budget of R25, limited materials, time limit).'),
  t(8, "## Make, Evaluate, and Communicate\n\n### Make\n\n1. Draw a **flow chart** showing each step of construction in order\n2. List all the **tools and materials** you will need\n3. Follow **safe working practices** while building\n4. Build neatly, following your chosen design\n\n### Safe Working Practices\n\n| Rule | Reason |\n|------|--------|\n| Wear safety goggles when cutting | Protects your eyes |\n| Clamp your work before cutting | Stops the material from slipping |\n| Cut away from your body | If the tool slips, it moves safely away |\n| Keep your workspace tidy | Prevents tripping and losing tools |\n| Use the correct tool for the job | Wrong tools cause injury |\n\n### Evaluate\n\nTest your product against each specification:\n- Does it work as planned?\n- What are its strengths?\n- What could be improved?\n\n### Communicate\n\nPresent your project by showing:\n- Your design sketches\n- The finished product\n- A short explanation of your design decisions\n- What you would improve next time"),
  fb(9, 'Before cutting materials, you should ___ your work securely. You should always cut ___ from your body for safety.',
    ['clamp', 'away'],
    'Clamping prevents the material from moving while you cut. Cutting away from your body means that if the tool slips, it moves in a safe direction and cannot hurt you.'),
  q(10, 'Which of the following is an example of a constraint?',
    ['A budget of R30', 'The product must be waterproof', 'The product must hold 1 kg', 'The product must be colourful'], 0,
    'A budget of R30 is a constraint — it limits what you can spend. The others are specifications (requirements the product must meet). Constraints include budget, time, size, and available materials.'),
];

// Lesson 1.2: Applying IDMEC — Design Briefs and Evaluation
blockNum = 0;
const ch1_lesson2 = [
  t(1, "## Writing a Good Design Brief\n\nA **design brief** is the starting point of the Design step. It tells the reader exactly what you plan to design and make.\n\n### Structure of a Design Brief\n\nA good design brief answers three questions:\n1. **What** will you design and make?\n2. **Who** is it for?\n3. **What** must it do?\n\n### Examples of Design Briefs\n\n**Good:** *Design and make a container to carry a Grade 6 learner's lunch to school. It must keep food fresh, be easy to carry, and cost less than R15 to make from recycled materials.*\n\n**Poor:** *Make a lunch box.* (This is too vague — no user, no specifications, no constraints.)\n\n### Listing Specifications\n\nAfter writing the brief, list the specifications clearly:\n\n| # | Specification |\n|---|---------------|\n| 1 | Must keep food fresh for at least 4 hours |\n| 2 | Must be watertight (no leaking) |\n| 3 | Must be easy for a child to open and close |\n| 4 | Must fit inside a school bag (max 25 cm x 15 cm x 10 cm) |\n| 5 | Must be made from recycled materials |"),
  t(2, "## Choosing the Best Design\n\nAfter sketching at least two ideas, you need to pick the best one. You do this with an **evaluation matrix**.\n\n### How an Evaluation Matrix Works\n\n1. List the specifications down the left side\n2. Score each design idea out of 5 for each specification\n3. Add up the scores — the highest total is usually the best design\n\n### Example Evaluation Matrix\n\n| Specification | Idea A (Score /5) | Idea B (Score /5) |\n|--------------|-------------------|-------------------|\n| Keeps food fresh | 4 | 3 |\n| Watertight | 5 | 2 |\n| Easy to open | 3 | 5 |\n| Fits in school bag | 4 | 4 |\n| Made from recycled materials | 5 | 4 |\n| **Total** | **21** | **18** |\n\nIdea A scores higher, so it is the better design according to the specifications.\n\n### Important Notes\n\n- Be honest when scoring — do not just give your favourite idea top marks\n- If two designs score very close, you could combine the best features of both\n- The evaluation matrix makes your choice **fair and logical**, not just based on feelings"),
  q(3, 'Why do we use an evaluation matrix to choose a design?',
    ['To compare ideas fairly against the specifications', 'To make the sketch look better', 'To save time', 'Because the teacher says so'], 0,
    'An evaluation matrix scores each design idea against the specifications, so your choice is fair, logical, and based on evidence — not just on which design you like the look of.'),
  t(4, "## Flow Charts for Planning\n\nBefore you start building, you create a **flow chart** that shows the steps of making in the correct order.\n\n### Flow Chart Symbols\n\n| Symbol | Shape | Meaning |\n|--------|-------|---------|\n| Start / Stop | Rounded rectangle | Beginning or end of the process |\n| Process | Rectangle | A step you carry out |\n| Decision | Diamond | A yes/no question |\n| Arrow | Arrow | Shows the direction of flow |\n\n### Example Flow Chart for a Lunch Container\n\n1. **Start**\n2. Collect recycled materials (plastic bottles, cardboard)\n3. Measure and mark the container shape (25 cm x 15 cm)\n4. Cut the materials using scissors\n5. **Decision:** Are the pieces the right size? If no, go back to step 3\n6. Assemble the container using glue\n7. Add a lid with a hinge\n8. Test — does the lid close tightly?\n9. Decorate the container\n10. **Stop**\n\nFlow charts help you think about the order of steps **before** you start. This prevents mistakes and saves time."),
  fb(5, 'In a flow chart, a ___ shape means a decision (yes/no question), and a ___ shape means the start or end of the process.',
    ['diamond', 'rounded rectangle'],
    'Diamond shapes represent decisions where you answer yes or no. Rounded rectangles (also called terminators) mark the start and end of the process.'),
  t(6, "## Evaluating Your Product\n\nThe **Evaluate** step is one of the most important parts of IDMEC. You test your product against every specification to see how well it works.\n\n### How to Evaluate\n\nCreate an evaluation table:\n\n| Specification | Met? (Yes/No) | Evidence | Score /5 |\n|--------------|---------------|----------|-----------|\n| Keeps food fresh for 4 hours | Yes | Food still cool after 4 hours | 4 |\n| Watertight | Partly | Small leak at one corner | 3 |\n| Easy to open and close | Yes | Opens with one hand | 5 |\n| Fits in school bag | Yes | Measured 24 cm x 14 cm x 9 cm | 5 |\n| Made from recycled materials | Yes | Used plastic bottle and cardboard | 5 |\n| **Total** | | | **22/25** |\n\n### Writing an Evaluation Report\n\nYour report should include:\n- **What works well** — the strengths of your product\n- **What could be improved** — be honest about weaknesses\n- **What you would change** — if you made it again, what would you do differently?\n- **Did it meet the design brief?** — yes or no, and why"),
  q(7, 'What should you compare your product against during the Evaluate step?',
    ['The specifications from the design brief', 'Other learners\' products', 'The price of similar products in shops', 'The colour of the product'], 0,
    'During evaluation, you test your product against the specifications you wrote in the Design step. This tells you whether your product meets the requirements it was designed for.'),
  t(8, "## Communicating Your Design\n\nThe final step of IDMEC is **Communicate**. You present your entire project to your class or teacher.\n\n### What to Include in Your Presentation\n\n| Item | Description |\n|------|-------------|\n| **Design brief** | Read out your brief |\n| **Research findings** | Share what you learned during investigation |\n| **Sketches** | Show your two (or more) design ideas |\n| **Evaluation matrix** | Explain which design you chose and why |\n| **Flow chart** | Show the steps you followed |\n| **Finished product** | Display and demonstrate your product |\n| **Evaluation** | Explain what works, what doesn't, and what you would improve |\n\n### Tips for a Good Presentation\n\n- Speak clearly and face your audience\n- Use your sketches and product as visual aids\n- Explain **why** you made each design decision\n- Be honest about problems — evaluators respect honesty\n- Keep it within the time limit"),
  fb(9, 'The five steps of IDMEC in order are: Investigate, ___, Make, Evaluate, and ___.',
    ['Design', 'Communicate'],
    'The full IDMEC process: Investigate the problem, Design a solution, Make it, Evaluate it against specifications, and Communicate your findings.'),
  q(10, 'A learner writes this design brief: "Make something." Why is this a poor design brief?',
    ['It does not say what to make, who it is for, or what it must do', 'It is too long', 'It uses too many technical words', 'It includes too many specifications'], 0,
    'A good design brief must state what you will design and make, who the product is for, and what it must do. "Make something" is far too vague and gives no direction for the design.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Structures Around Us (Term 1) — 1 lesson
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 2.1: Types of Structures, Strength, and Stability
blockNum = 0;
const ch2_lesson1 = [
  t(1, "## What Is a Structure?\n\nA **structure** is any object or system that is designed to support a load or resist forces. Structures are all around us — buildings, bridges, furniture, even your own skeleton.\n\n### Natural vs Human-Made Structures\n\n| Natural Structures | Human-Made Structures |\n|-------------------|----------------------|\n| A bird's nest | A house |\n| A spider's web | A bridge |\n| A beehive | An electricity pylon |\n| A tree trunk | A school desk |\n| An eggshell | FNB Stadium (Soccer City) |\n| The human skeleton | The Bloukrans Bridge (Western Cape) |\n\n### Three Types of Structures\n\n| Type | Description | Examples |\n|------|-------------|----------|\n| **Shell structure** | A hollow, curved shape. The outer skin carries the load. | An egg, a soccer ball, FNB Stadium, a tin can |\n| **Frame structure** | Made of separate parts (beams, struts) joined together. | A playground climbing frame, Eskom electricity pylons, a bicycle frame |\n| **Solid structure** | Made of solid material all the way through. | A brick wall, a concrete dam (like Gariep Dam), a tree trunk |"),
  t(2, "## Forces on Structures\n\nStructures must withstand different types of forces to stay standing.\n\n| Force | What it does | Example |\n|-------|-------------|--------|\n| **Compression** | Pushes or squashes a material together | The columns holding up a school veranda roof |\n| **Tension** | Pulls or stretches a material apart | The cables on the Nelson Mandela Bridge in Johannesburg |\n| **Bending** | Compression on one side and tension on the other | A plank placed across a stream when someone walks on it |\n| **Torsion** | Twists a material | Wringing out a wet towel |\n| **Shear** | Pushes in opposite directions, sliding layers apart | Cutting paper with scissors |\n\n### Loads on Structures\n\n- **Dead load (static):** The weight of the structure itself — it never changes.\n- **Live load (dynamic):** Loads that change — people walking, cars driving, wind blowing, furniture placed inside.\n\nFor example, the Bloukrans Bridge in the Western Cape must carry its own dead load (the weight of the concrete and steel) plus live loads (vehicles crossing and wind from the Storms River gorge)."),
  q(3, 'Which type of structure is FNB Stadium (Soccer City) in Johannesburg?',
    ['Shell structure', 'Frame structure', 'Solid structure', 'Combination structure'], 0,
    'FNB Stadium is a shell structure — its curved outer skin (shaped like a calabash/African pot) supports the loads. Shell structures are hollow with a strong outer surface.'),
  t(4, "## Strength and Stability\n\n### What Makes a Structure Stable?\n\nA structure is **stable** when it does not fall over easily. Two things affect stability:\n\n1. **Base of support** — A wider base makes a structure more stable. That is why pyramids (wide base, narrow top) are extremely stable.\n2. **Centre of gravity** — The lower the centre of gravity, the more stable the structure. A low, heavy base is more stable than a tall, top-heavy structure.\n\n### Triangulation — The Strongest Shape\n\nA **triangle** is the strongest geometric shape because it cannot change its shape without breaking one of its sides.\n\n- A **rectangle** can be pushed into a parallelogram (it collapses sideways)\n- But a **triangle** stays rigid — push on any corner and it holds its shape\n\nThis is why engineers use triangles everywhere:\n- Eskom electricity pylons are made entirely of triangles\n- Roof trusses in South African houses use triangular shapes\n- The crane at a construction site has a triangulated boom\n\n### Strengthening Methods\n\n| Method | How it works |\n|--------|-------------|\n| **Triangulation** | Adding diagonal braces to create triangles |\n| **Corrugation** | Folding material into ridges (like corrugated iron roofing — 'sinki') |\n| **Lamination** | Gluing layers together (like plywood) |\n| **Thickening** | Making the material thicker at stress points |"),
  fb(5, 'The strongest geometric shape in structures is the ___ because it cannot change shape without breaking. The two factors that affect stability are the base of support and the ___.',
    ['triangle', 'centre of gravity'],
    'Triangles are rigid shapes used in pylons, roof trusses, and bridges. A structure is more stable when its centre of gravity is low and its base of support is wide.'),
  t(6, "## How Bridges Work\n\nBridges are some of the most important structures in South Africa. Different types of bridges solve different problems.\n\n### Types of Bridges\n\n| Bridge Type | How it works | SA Example |\n|------------|-------------|------------|\n| **Beam bridge** | A flat beam rests on two supports (piers). Simplest type. | Many highway overpasses |\n| **Arch bridge** | A curved shape transfers the load outwards to the supports. Very strong in compression. | Bloukrans Bridge (216 m high, Western Cape) |\n| **Suspension bridge** | The deck hangs from cables attached to tall towers. Good for long spans. | There are no major suspension bridges in SA, but cable-stayed bridges exist |\n| **Cable-stayed bridge** | Cables run directly from towers to the deck. | Nelson Mandela Bridge, Johannesburg |\n| **Truss bridge** | Uses triangulated frames for strength. | Many railway bridges across South Africa |\n\n### Forces in a Beam Bridge\n\nWhen a load pushes down on a beam bridge:\n- The **top** of the beam is in **compression** (being squashed)\n- The **bottom** of the beam is in **tension** (being stretched)\n- The **supports** (piers) push back up — this is called the **reaction force**"),
  q(7, 'Why are triangles used so often in structures like pylons and roof trusses?',
    ['Because triangles cannot change shape without breaking a side', 'Because triangles look attractive', 'Because triangles use less material than rectangles', 'Because triangles are easier to draw'], 0,
    'A triangle is a rigid shape — if you push on any corner, it cannot be deformed (changed in shape) without breaking one of its sides. Rectangles can collapse into parallelograms, but triangles cannot.'),
  t(8, "## South African Structures — Case Studies\n\n### FNB Stadium (Soccer City), Johannesburg\n- **Type:** Shell structure\n- **Special feature:** Shaped like a calabash (African pot)\n- **Built for:** 2010 FIFA World Cup\n- **Capacity:** About 94 000 spectators\n- **Design:** The curved outer skin is the load-bearing shell\n\n### Gariep Dam, Free State\n- **Type:** Solid structure (gravity dam)\n- **Special feature:** Largest dam in South Africa\n- **How it works:** The sheer weight and mass of the concrete wall holds back the water\n- **Capacity:** Over 5 000 million cubic metres of water\n\n### Eskom Electricity Pylons\n- **Type:** Frame structure\n- **Special feature:** Made entirely of triangulated steel members\n- **Why triangles:** They carry huge tension loads from the power lines and resist wind forces\n- **Found:** All across South Africa, carrying power from stations to towns and cities"),
  fb(9, 'A ___ structure is hollow with a curved outer skin that carries the load, like an eggshell or FNB Stadium. A ___ structure is made of separate parts joined together, like a pylon or bicycle frame.',
    ['shell', 'frame'],
    'Shell structures have a strong outer skin (e.g. eggs, stadiums). Frame structures are made of connected bars or beams (e.g. pylons, scaffolding).'),
  q(10, 'Which of the following is a method of strengthening a structure?',
    ['Triangulation', 'Making the base narrower', 'Raising the centre of gravity', 'Using thinner material'], 0,
    'Triangulation (adding diagonal braces to create triangles) strengthens a structure. A narrower base, higher centre of gravity, or thinner material would all make a structure weaker, not stronger.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Processing Materials (Term 2) — 2 lessons
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 3.1: Raw Materials and Processing
blockNum = 0;
const ch3_lesson1 = [
  t(1, "## What Are Materials?\n\nEverything around you is made from **materials**. In Technology, we need to understand where materials come from and how they are processed.\n\n### Raw Materials vs Processed Materials\n\n| | Raw Materials | Processed Materials |\n|--|--------------|--------------------|\n| **Definition** | Materials found in nature, before any processing | Materials that have been changed by humans into a useful form |\n| **Examples** | Iron ore, cotton plant, tree, crude oil, sand | Steel, fabric, timber (planks), plastic, glass |\n| **State** | Natural, unrefined | Refined, shaped, ready to use |\n\n### Where Do Materials Come From?\n\n| Material | Raw Source | Where in SA |\n|----------|-----------|-------------|\n| Steel | Iron ore | Sishen mine, Northern Cape |\n| Aluminium | Bauxite ore | Imported, smelted at Hillside (Richards Bay) |\n| Timber | Trees (pine, eucalyptus) | Plantations in Mpumalanga and KwaZulu-Natal |\n| Plastic | Crude oil (petroleum) | Sasol (Secunda) converts coal to fuel and plastics |\n| Glass | Sand (silica) | Found across South Africa |\n| Cement | Limestone | PPC and AfriSam quarries across the country |"),
  t(2, "## Processing Wood\n\nWood is one of the oldest and most useful materials. In South Africa, large plantations of **pine** and **eucalyptus** trees grow in Mpumalanga and KwaZulu-Natal.\n\n### Steps in Processing Timber\n\n1. **Felling** — Trees are cut down (harvested) using chainsaws\n2. **Debarking** — The bark is removed\n3. **Sawing** — Logs are cut into planks at a sawmill\n4. **Seasoning (drying)** — Planks are dried to remove moisture (air-dried or kiln-dried)\n5. **Planing** — Surfaces are smoothed\n6. **Treating** — Timber may be treated with chemicals to prevent rot and insect damage\n\n### Types of Timber Products\n\n| Product | How it is made | Use |\n|---------|---------------|-----|\n| **Planks** | Sawn from logs | Building, furniture |\n| **Plywood** | Thin layers glued with grains alternating | Strong boards for shelving, floors |\n| **Chipboard** | Wood chips glued and pressed | Cheap furniture (melamine-coated) |\n| **MDF** | Fine wood fibres glued and pressed | Kitchen cupboard doors, shelving |\n\n### Properties of Wood\n\n- **Advantages:** Renewable, easy to work with, looks attractive, can be recycled\n- **Disadvantages:** Can rot, can burn, can warp when wet, attacked by insects (borers)"),
  q(3, 'What is the difference between a raw material and a processed material?',
    ['A raw material is found in nature; a processed material has been changed by humans', 'There is no difference', 'A raw material is more expensive', 'A processed material comes from factories only'], 0,
    'Raw materials are found in nature (iron ore, trees, cotton plants). Processed materials have been changed into useful forms by humans (steel, timber planks, fabric).'),
  t(4, "## Processing Metal\n\nMetals are among the most important materials in technology. South Africa is one of the world's leading mining countries.\n\n### From Ore to Metal\n\n1. **Mining** — Ore (rock containing metal) is dug out of the ground\n2. **Crushing** — The ore is crushed into small pieces\n3. **Smelting** — The crushed ore is heated in a furnace to very high temperatures to extract the pure metal\n4. **Refining** — The metal is purified further\n5. **Shaping** — The metal is cast, rolled, or extruded into useful shapes\n\n### Common Metals and Their Properties\n\n| Metal | Properties | Uses |\n|-------|-----------|------|\n| **Steel** (iron + carbon) | Strong, hard, can rust | Bridges, buildings, cars, tools |\n| **Aluminium** | Lightweight, does not rust, good conductor | Drink cans, aircraft, window frames |\n| **Copper** | Excellent conductor of electricity, does not rust easily | Electrical wiring, plumbing pipes |\n| **Stainless steel** | Does not rust, hygienic | Kitchen sinks, cutlery, hospital equipment |\n\n### South African Metal Industry\n\n- **ArcelorMittal** (Vanderbijlpark, Gauteng) is one of the largest steel producers in Africa\n- **Hillside Aluminium** (Richards Bay, KZN) is one of the largest aluminium smelters in the Southern Hemisphere\n- South Africa produces over 70% of the world's platinum"),
  fb(5, 'The process of heating ore in a furnace to extract pure metal is called ___. South Africa produces over 70% of the world\'s ___.',
    ['smelting', 'platinum'],
    'Smelting uses extreme heat to separate metal from the ore. South Africa is the world leader in platinum production, mined mainly in the Bushveld Complex in Limpopo and North West.'),
  t(6, "## Processing Plastic\n\nPlastic is made from **crude oil** (petroleum). In South Africa, Sasol in Secunda (Mpumalanga) is unique because it makes fuel and plastic from **coal** using a process called coal-to-liquids.\n\n### How Plastic Is Made\n\n1. Crude oil (or coal) is refined into chemicals called **monomers**\n2. Monomers are joined together into long chains called **polymers** — this is **polymerisation**\n3. The plastic is formed into pellets\n4. Pellets are melted and shaped using different methods:\n   - **Injection moulding** — melted plastic is injected into a mould (e.g. bottle caps, toys)\n   - **Blow moulding** — air is blown into melted plastic to form hollow shapes (e.g. bottles)\n   - **Extrusion** — plastic is pushed through a shaped hole (e.g. pipes, gutters)\n\n### Types of Plastic\n\n| Type | Behaviour when heated | Examples |\n|------|----------------------|----------|\n| **Thermoplastic** | Can be melted and reshaped many times | Plastic bottles (PET), plastic bags (LDPE), PVC pipes |\n| **Thermoset** | Cannot be re-melted once set — it burns | Electrical plugs, melamine plates, bakelite handles |\n\n### Why This Matters\n\nThermoplastics can be **recycled** because they can be melted again. Thermosets cannot be recycled in the same way."),
  q(7, 'Why can thermoplastics be recycled but thermosets cannot?',
    ['Thermoplastics can be melted and reshaped; thermosets cannot be re-melted', 'Thermosets are too expensive to recycle', 'Thermoplastics are stronger', 'There is no difference — both can be recycled'], 0,
    'Thermoplastics soften and melt when heated, so they can be reshaped many times. Thermosets undergo a chemical change when first heated — they become permanently hard and will burn rather than melt if reheated.'),
  t(8, "## Processing Textiles\n\nTextiles are materials made from fibres that are woven or knitted together to create fabric.\n\n### Natural vs Synthetic Fibres\n\n| | Natural Fibres | Synthetic Fibres |\n|--|---------------|------------------|\n| **Source** | Plants or animals | Made from chemicals (usually from oil) |\n| **Examples** | Cotton, wool, silk, linen | Polyester, nylon, acrylic |\n| **Properties** | Usually comfortable and breathable | Often stronger, dry faster, wrinkle-resistant |\n| **SA examples** | Cotton from Limpopo; mohair from Eastern Cape (SA produces 50% of world's mohair) | Manufactured in factories |\n\n### From Fibre to Fabric\n\n1. **Harvesting** — Cotton is picked; sheep are sheared for wool\n2. **Cleaning** — Fibres are cleaned and prepared\n3. **Spinning** — Fibres are twisted into yarn (thread)\n4. **Weaving or knitting** — Yarn is interlaced to create fabric\n5. **Finishing** — Fabric is dyed, printed, or treated (e.g. waterproofing)\n\n### Blended Fabrics\n\nMany fabrics are blends — a mix of natural and synthetic fibres. For example, **polycotton** (polyester + cotton) combines the comfort of cotton with the durability of polyester. School uniforms in South Africa are often made from polycotton."),
  fb(9, 'Fibres that come from plants or animals are called ___ fibres. South Africa produces about 50% of the world\'s ___, which comes from Angora goats in the Eastern Cape.',
    ['natural', 'mohair'],
    'Natural fibres come from living things (cotton from plants, wool from sheep, mohair from Angora goats). South Africa, especially the Eastern Cape, is the world leader in mohair production.'),
  q(10, 'Sasol in Secunda is unique because it produces plastics and fuel from which raw material?',
    ['Coal', 'Crude oil', 'Natural gas', 'Iron ore'], 0,
    'Sasol uses a coal-to-liquids process to convert coal into fuel and plastic. Most other countries use crude oil (petroleum) for this purpose, but South Africa has abundant coal reserves.'),
];

// Lesson 3.2: Manufacturing, Recycling, and the Environment
blockNum = 0;
const ch3_lesson2 = [
  t(1, "## Manufacturing in South Africa\n\n**Manufacturing** means turning raw or processed materials into finished products, usually in factories.\n\n### Types of Production\n\n| Type | Description | Example |\n|------|-------------|--------|\n| **One-off production** | Making one unique item | A custom-made wedding dress |\n| **Batch production** | Making a set number of identical items | 200 school desks for a new school |\n| **Mass production** | Making thousands of identical items continuously | Coca-Cola bottles at a bottling plant |\n\n### Major Manufacturing Sectors in South Africa\n\n| Sector | What is produced | Location |\n|--------|-----------------|----------|\n| **Motor vehicles** | Cars (Toyota, BMW, VW, Ford) | Durban, East London, Pretoria |\n| **Food and beverages** | Processed foods, drinks | Nationwide |\n| **Steel and metal products** | Steel beams, wire, nails | Vanderbijlpark (ArcelorMittal) |\n| **Chemicals and plastics** | Fuels, plastics, fertilisers | Secunda (Sasol), Durban |\n| **Clothing and textiles** | Garments, fabrics | Cape Town, Durban |\n\nSouth Africa is the largest car manufacturer in Africa. Toyota South Africa in Durban produces vehicles for both local use and export."),
  t(2, "## The Impact of Manufacturing on the Environment\n\nManufacturing creates jobs and products we need, but it can also harm the environment.\n\n### Negative Impacts\n\n| Problem | Cause | Example |\n|---------|-------|---------|\n| **Air pollution** | Burning fossil fuels, factory emissions | Smog over Johannesburg; Eskom coal power stations |\n| **Water pollution** | Chemical waste dumped into rivers | Acid mine drainage from old gold mines on the Witwatersrand |\n| **Land pollution** | Landfill sites filling up with waste | South Africa generates over 50 million tonnes of waste per year |\n| **Resource depletion** | Using up non-renewable resources | Oil, coal, and metal ores will eventually run out |\n| **Deforestation** | Clearing natural forests for timber or farming | Loss of indigenous forests in KZN and the Eastern Cape |\n\n### Positive Impacts\n\n| Benefit | Example |\n|---------|--------|\n| Creates jobs | The manufacturing sector employs millions of South Africans |\n| Improves quality of life | Affordable goods (clothing, food, building materials) |\n| Develops infrastructure | Roads, factories, housing |\n| Generates export income | Car exports earn billions of rands |"),
  q(3, 'Which type of production would a factory use to make thousands of identical plastic bottles?',
    ['Mass production', 'One-off production', 'Batch production', 'Custom production'], 0,
    'Mass production is used when thousands or millions of identical items are made continuously on a production line. Plastic bottles, soft drinks, and nails are all mass-produced.'),
  t(4, "## Recycling\n\n**Recycling** means collecting used materials and processing them into new products, instead of throwing them away.\n\n### Why Recycle?\n\n1. **Reduces waste** going to landfill sites\n2. **Saves natural resources** — less mining and deforestation\n3. **Saves energy** — recycling aluminium uses 95% less energy than making it from ore\n4. **Creates jobs** — South Africa's recycling industry provides thousands of jobs\n5. **Reduces pollution** — less need for mining and manufacturing\n\n### Recycling Codes on Plastic\n\n| Code | Plastic Type | Examples | Recyclable? |\n|------|-------------|----------|-------------|\n| 1 (PET) | Polyethylene terephthalate | Cooldrink bottles, water bottles | Yes — widely recycled |\n| 2 (HDPE) | High-density polyethylene | Milk bottles, shampoo bottles | Yes |\n| 3 (PVC) | Polyvinyl chloride | Pipes, window frames | Difficult |\n| 4 (LDPE) | Low-density polyethylene | Plastic bags, cling wrap | Some centres |\n| 5 (PP) | Polypropylene | Ice cream tubs, bottle caps | Yes |\n| 6 (PS) | Polystyrene | Styrofoam cups, takeaway containers | Difficult |\n\n### The Three Rs\n\n- **Reduce** — Use less material in the first place\n- **Reuse** — Use items again before discarding (e.g. refill a water bottle)\n- **Recycle** — Process used materials into new products"),
  fb(5, 'Recycling aluminium uses ___% less energy than making new aluminium from ore. The three Rs of waste management are Reduce, Reuse, and ___.',
    ['95', 'Recycle'],
    'Recycling aluminium is extremely energy-efficient — it uses 95% less energy than smelting new aluminium from bauxite ore. The three Rs help us reduce the amount of waste going to landfill.'),
  t(6, "## Recycling in South Africa\n\nSouth Africa has a growing recycling industry, and many communities depend on waste collection and recycling for their livelihoods.\n\n### Recycling Statistics\n\n| Material | Recycling Rate in SA |\n|----------|---------------------|\n| Paper and cardboard | About 70% |\n| Metal cans (tin/steel) | About 76% |\n| Aluminium cans | Over 70% (Collect-a-Can) |\n| Glass | About 40% |\n| Plastic (PET bottles) | About 65% (PETCO) |\n\n### Informal Recyclers (Waste Pickers)\n\nIn South Africa, thousands of people work as **waste pickers** — collecting recyclable materials from bins and landfill sites. They sort materials and sell them to buy-back centres. Although often overlooked, waste pickers play a vital role in keeping cities clean and reducing landfill waste.\n\n### Organisations Supporting Recycling\n\n- **PETCO** — manages PET plastic bottle recycling\n- **Collect-a-Can** — promotes tin and aluminium can recycling\n- **The Glass Recycling Company** — collects and recycles glass\n- **POLYCO** — manages polyolefin (plastic bag) recycling\n\n### What You Can Do\n\n- Separate your waste at home and at school\n- Take recyclables to a buy-back centre\n- Choose products with less packaging\n- Say no to single-use plastics when you can"),
  q(7, 'Why is recycling aluminium cans especially beneficial?',
    ['It saves 95% of the energy needed to make aluminium from ore', 'Aluminium cans are the most common waste', 'Aluminium is the cheapest metal', 'It is the easiest material to recycle'], 0,
    'Producing aluminium from bauxite ore requires enormous amounts of electricity (electrolysis). Recycling aluminium cans uses 95% less energy, saving resources and reducing carbon emissions.'),
  t(8, "## The Product Life Cycle\n\nEvery product goes through a **life cycle** — from the raw materials to when it is thrown away or recycled.\n\n### Stages of a Product Life Cycle\n\n1. **Raw materials** — Resources are extracted from nature (mining, farming, forestry)\n2. **Processing** — Raw materials are turned into usable materials (smelting, refining)\n3. **Manufacturing** — Materials are shaped into products\n4. **Distribution** — Products are transported to shops\n5. **Use** — The customer buys and uses the product\n6. **End of life** — The product is discarded, reused, or recycled\n\n### Designing for the Environment\n\nGood designers think about the **entire life cycle** of a product:\n- Can it be made from recycled materials?\n- Can it be repaired instead of thrown away?\n- Can it be taken apart for recycling at the end of its life?\n- Can the packaging be reduced?\n\nThis approach is called **sustainable design** — making products that meet our needs today without harming the ability of future generations to meet their needs."),
  fb(9, 'The approach of designing products that meet current needs without harming future generations is called ___ design. At the end of a product\'s life, it should ideally be ___ rather than sent to a landfill.',
    ['sustainable', 'recycled'],
    'Sustainable design considers the entire product life cycle, aiming to minimise environmental harm. Recycling at end-of-life recovers materials and reduces waste going to landfill sites.'),
  q(10, 'Which of the following is NOT one of the "three Rs" of waste management?',
    ['Replace', 'Reduce', 'Reuse', 'Recycle'], 0,
    'The three Rs are Reduce (use less), Reuse (use again), and Recycle (process into new products). "Replace" is not one of the three Rs, though choosing better alternatives is also a good practice.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Mechanical Systems and Movement (Term 2) — 1 lesson
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 4.1: Levers, Gears, Pulleys, and Linkages
blockNum = 0;
const ch4_lesson1 = [
  t(1, "## What Is a Mechanism?\n\nA **mechanism** is a device that changes an input force or movement into a different output force or movement. Mechanisms are the building blocks of all machines.\n\n### Input-Process-Output\n\nEvery mechanism can be described as a system:\n\n| Part | Description | Example (wheelbarrow) |\n|------|-------------|----------------------|\n| **Input** | The force or movement you apply | You lift the handles |\n| **Process** | How the mechanism changes the force | The lever action around the wheel (fulcrum) |\n| **Output** | The useful result | The heavy load is lifted and moved |\n\n### Types of Movement\n\nMechanisms can produce different types of movement:\n\n| Type | Description | Example |\n|------|-------------|--------|\n| **Linear** | Movement in a straight line | A drawer sliding open |\n| **Rotary** | Movement in a circle | A bicycle wheel turning |\n| **Reciprocating** | Back-and-forth in a straight line | A saw cutting wood |\n| **Oscillating** | Swinging back and forth around a point | A playground swing |"),
  t(2, "## Levers\n\nA **lever** is a rigid bar that turns around a fixed point called the **fulcrum** (or pivot). Levers are the simplest and most common mechanisms.\n\n### Parts of a Lever\n\n- **Fulcrum (pivot):** The fixed point around which the lever turns\n- **Effort:** The force you apply\n- **Load:** The force being moved or lifted\n\n### Three Classes of Levers\n\n| Class | Arrangement | Examples |\n|-------|------------|----------|\n| **1st class** | Fulcrum between effort and load | Seesaw, scissors, pliers, crowbar |\n| **2nd class** | Load between fulcrum and effort | Wheelbarrow, nutcracker, bottle opener |\n| **3rd class** | Effort between fulcrum and load | Tweezers, fishing rod, human forearm, braai tongs |\n\n### How to Remember\n\n- **1st class:** **F**ulcrum in the middle (F for First)\n- **2nd class:** **L**oad in the middle (L for the number 2 looks like an L rotated)\n- **3rd class:** **E**ffort in the middle (E for Energy — you need more effort)\n\n### Mechanical Advantage\n\n$$\\text{Mechanical Advantage (MA)} = \\frac{\\text{Load}}{\\text{Effort}}$$\n\nIf MA > 1, the lever multiplies your force (you apply less effort than the load). If MA < 1, the lever multiplies speed and distance instead."),
  q(3, 'A pair of braai tongs is an example of which class of lever?',
    ['3rd class', '1st class', '2nd class', 'Not a lever'], 0,
    'Braai tongs are a 3rd class lever — the fulcrum is at the hinge (one end), you apply effort in the middle (your hand squeezes), and the load (the food) is at the other end. Effort is between fulcrum and load.'),
  t(4, "## Gears\n\n**Gears** are toothed wheels that mesh together to transfer rotary motion from one shaft to another.\n\n### How Gears Work\n\n- When two gears mesh, they turn in **opposite directions**\n- A **small gear** (called the driver) turns a **large gear** (called the driven gear) — the large gear turns slower but with more force (torque)\n- A **large gear** driving a **small gear** — the small gear turns faster but with less force\n\n### Gear Ratio\n\n$$\\text{Gear Ratio} = \\frac{\\text{Number of teeth on driven gear}}{\\text{Number of teeth on driver gear}}$$\n\n**Example:** A driver gear has 10 teeth and a driven gear has 30 teeth.\n\n$$\\text{Gear Ratio} = \\frac{30}{10} = 3:1$$\n\nThis means the driven gear turns **3 times slower** than the driver, but with **3 times more force**.\n\n### Gears in Everyday Life\n\n| Item | How gears are used |\n|------|-------------------|\n| Bicycle | Gears let you pedal easily uphill (low gear) or go fast on flat roads (high gear) |\n| Eggbeater | A large gear turns two small gears to spin the beaters fast |\n| Clock | Gears transfer movement from the spring to the hands |\n| Car gearbox | Changes the gear ratio between the engine and wheels |"),
  fb(5, 'When two gears mesh, they turn in ___ directions. If a driver gear has 10 teeth and the driven gear has 40 teeth, the gear ratio is ___:1.',
    ['opposite', '4'],
    'Meshing gears always turn in opposite directions. Gear ratio = driven teeth / driver teeth = 40/10 = 4:1, meaning the driven gear turns 4 times slower but with 4 times more force.'),
  t(6, "## Pulleys\n\nA **pulley** is a wheel with a groove that holds a rope or cable. Pulleys are used to lift heavy loads.\n\n### Types of Pulleys\n\n| Type | Description | Advantage |\n|------|-------------|----------|\n| **Single fixed pulley** | Attached to a fixed point (like a ceiling). You pull down on the rope to lift the load up. | Changes the direction of force (easier to pull down than to lift up). MA = 1 (no force multiplication). |\n| **Single movable pulley** | Attached to the load, not to a fixed point. The rope is fixed at the top. | Halves the effort needed. MA = 2. But you pull twice the distance. |\n| **Block and tackle** | A combination of fixed and movable pulleys working together. | Multiplies force. MA = number of rope sections supporting the load. |\n\n### Example\n\nA block and tackle system has 4 rope sections supporting a 200 N load.\n\n$$\\text{Effort} = \\frac{\\text{Load}}{\\text{MA}} = \\frac{200}{4} = 50 \\text{ N}$$\n\nYou only need to pull with 50 N — but you must pull **4 times** as much rope as the load moves.\n\n### Pulleys in South Africa\n\n- Mine shafts use large pulley systems (headgear) to raise and lower cages carrying miners\n- Construction cranes use pulleys to lift heavy building materials\n- Flag poles use a single fixed pulley"),
  q(7, 'A single fixed pulley has a mechanical advantage of 1. What advantage does it provide?',
    ['It changes the direction of force so you can pull down instead of lifting up', 'It doubles the force', 'It makes the load lighter', 'It has no advantage at all'], 0,
    'A single fixed pulley does not multiply force (MA = 1), but it changes the direction of the effort. Pulling downwards is easier and more natural than trying to lift something straight up.'),
  t(8, "## Cams and Linkages\n\n### Cams\n\nA **cam** is a specially shaped wheel that converts rotary motion into reciprocating (up-and-down) motion.\n\n- The cam rotates on a shaft\n- A **follower** rests on the surface of the cam\n- As the cam turns, its shape pushes the follower up and down\n\n**Examples:** Car engine valves, sewing machine needle mechanism, toys with moving parts\n\n### Linkages\n\nA **linkage** is a system of rigid bars connected by pivots that transfers or changes the direction of motion.\n\n| Type | What it does | Example |\n|------|-------------|--------|\n| **Reverse motion linkage** | Input moves one way, output moves the opposite way | Windscreen wipers |\n| **Parallel motion linkage** | Output moves in the same direction as input, but at a different position | Tool boxes with trays that lift out |\n| **Bell crank linkage** | Changes the direction of motion by 90° | Bicycle brake lever (squeeze horizontally, brake pads push vertically) |\n\n### Combining Mechanisms\n\nIn real machines, different mechanisms work together. A bicycle, for example, combines:\n- **Levers** (brake handles, pedal cranks)\n- **Gears** (chain and sprockets)\n- **Pulleys** (cable systems for brakes)\n- **Linkages** (brake caliper mechanism)"),
  fb(9, 'A ___ converts rotary motion into reciprocating (up-and-down) motion using a specially shaped wheel. A bell crank linkage changes the direction of motion by ___ degrees.',
    ['cam', '90'],
    'Cams are shaped wheels that push a follower up and down as they rotate. A bell crank linkage converts horizontal motion into vertical motion (or vice versa), changing direction by 90 degrees.'),
  q(10, 'What type of mechanism is used in a bicycle to allow you to pedal easily uphill?',
    ['Gears', 'Cams', 'Pulleys', 'Levers only'], 0,
    'Bicycles use gears (chain and sprockets) to change the gear ratio. In a low gear, you pedal faster with less force, making it easier to cycle uphill. In a high gear, you pedal slower but travel faster on flat roads.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Electrical Systems (Term 3) — 1 lesson
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 5.1: Circuits, Components, and Safety
blockNum = 0;
const ch5_lesson1 = [
  t(1, "## What Is Electricity?\n\n**Electricity** is the flow of tiny charged particles called **electrons** through a conductor (like a copper wire). We use electricity to power lights, appliances, machines, and devices.\n\n### Where Does Electricity Come From in South Africa?\n\n**Eskom** is the company that generates and distributes most of South Africa's electricity.\n\n| Source | How it works | SA Examples |\n|--------|-------------|-------------|\n| **Coal** | Burning coal heats water to make steam, which turns turbines | Medupi, Kusile, Matimba (Limpopo, Mpumalanga) |\n| **Nuclear** | Nuclear reactions heat water to make steam | Koeberg (Western Cape — the only nuclear station in Africa) |\n| **Hydroelectric** | Flowing water turns turbines | Gariep Dam (Free State) |\n| **Solar** | Sunlight is converted directly into electricity | Northern Cape solar farms |\n| **Wind** | Wind turns large turbine blades | Wind farms in the Eastern and Western Cape |\n\n### Load shedding\n\nSouth Africa has experienced **load shedding** (planned power cuts) because Eskom's power stations cannot always produce enough electricity for the whole country. This is why renewable energy (solar and wind) and saving electricity are so important."),
  t(2, "## Simple Electric Circuits\n\nFor electricity to flow, it needs a complete, unbroken path — this is called a **circuit**.\n\n### Three Things Every Circuit Needs\n\n1. **An energy source** — a cell (battery) that pushes the electrons around the circuit\n2. **Conductors** — wires that carry the electricity\n3. **A load** — a component that uses the electricity (e.g. a light bulb, a buzzer, a motor)\n\n### Circuit Symbols\n\nInstead of drawing pictures, we use **symbols** in circuit diagrams:\n\n| Component | Symbol Description |\n|-----------|-------------------|\n| **Cell (battery)** | Long thin line (positive) and short thick line (negative) |\n| **Switch (open)** | A gap in the line |\n| **Switch (closed)** | A line connecting both sides |\n| **Light bulb (lamp)** | A circle with a cross inside |\n| **Buzzer** | A semicircle with lines |\n| **Motor** | A circle with 'M' inside |\n| **Resistor** | A rectangle |\n\n### Conductors and Insulators\n\n| Conductors | Insulators |\n|-----------|------------|\n| Allow electricity to flow through them | Do not allow electricity to flow |\n| Metals: copper, aluminium, steel, gold | Plastic, rubber, glass, wood, air |\n| Used for wires and connections | Used to cover wires for safety |"),
  q(3, 'Which THREE things does every electric circuit need?',
    ['An energy source, conductors, and a load', 'A switch, a fuse, and a plug', 'A battery, a motor, and a computer', 'Copper, plastic, and glass'], 0,
    'Every circuit needs: (1) an energy source like a battery to push electrons, (2) conductors like wires to carry the current, and (3) a load like a bulb or motor to use the electricity.'),
  t(4, "## Series and Parallel Circuits\n\nThere are two ways to connect components in a circuit.\n\n### Series Circuit\n\nComponents are connected **one after another** in a single loop.\n\n| Feature | Detail |\n|---------|--------|\n| Current path | Only **one** path for current to flow |\n| If one bulb blows | The whole circuit stops (like old-style Christmas lights) |\n| Brightness | Each extra bulb makes all bulbs **dimmer** (they share the voltage) |\n| Switches | One switch controls **all** components |\n\n### Parallel Circuit\n\nComponents are connected on **separate branches** — each has its own path.\n\n| Feature | Detail |\n|---------|--------|\n| Current path | **Multiple** paths for current to flow |\n| If one bulb blows | The other bulbs keep working |\n| Brightness | Each bulb gets **full voltage** — same brightness |\n| Switches | Each branch can have its own switch |\n\n### Which Is Better?\n\nHouses use **parallel circuits** so that:\n- Each room can be switched on and off independently\n- If one light blows, the others still work\n- Each appliance gets the full voltage it needs"),
  fb(5, 'In a ___ circuit, components are connected one after another in a single loop. In a ___ circuit, each component is on its own separate branch.',
    ['series', 'parallel'],
    'In a series circuit, there is only one path for current — if one component fails, the whole circuit breaks. In a parallel circuit, each component has its own path, so others keep working.'),
  t(6, "## Switches and Circuit Diagrams\n\n### What Is a Switch?\n\nA **switch** is a device that opens or closes a circuit.\n- **Open switch** = circuit is broken = no current flows = device is OFF\n- **Closed switch** = circuit is complete = current flows = device is ON\n\n### Types of Switches\n\n| Switch Type | How it works | Example |\n|------------|-------------|--------|\n| **Toggle switch** | Flip up or down | Light switch on a wall |\n| **Push button** | Press to make contact, release to break | Doorbell |\n| **Slide switch** | Slide to connect or disconnect | Torch (flashlight) |\n| **Reed switch** | A magnet closes the switch | Burglar alarm on a door |\n\n### Drawing Circuit Diagrams\n\nWhen drawing a circuit diagram:\n1. Use a **ruler** for all lines (wires must be straight)\n2. Use the correct **symbols** for each component\n3. Draw wires at **right angles** (90° turns only)\n4. Show the circuit as a **rectangle** shape\n5. Label each component\n6. The positive terminal of the cell connects to the top wire, negative to the bottom"),
  q(7, 'In a parallel circuit, what happens if one light bulb blows?',
    ['The other bulbs continue to work normally', 'All the bulbs stop working', 'The other bulbs become brighter', 'The battery runs out immediately'], 0,
    'In a parallel circuit, each component has its own path for current. If one bulb blows, current still flows through the other branches, so the remaining bulbs keep working.'),
  t(8, "## Electrical Safety\n\nElectricity can be very dangerous — even deadly — if not handled safely.\n\n### Safety Rules\n\n| Rule | Reason |\n|------|--------|\n| **Never touch bare wires** | You could get an electric shock |\n| **Keep water away from electricity** | Water conducts electricity — you could be electrocuted |\n| **Never push objects into plug sockets** | Direct contact with mains electricity (230 V) can kill |\n| **Do not overload plug points** | Too many plugs in one socket can cause overheating and fire |\n| **Replace damaged cords immediately** | Exposed wires are dangerous |\n| **Only use low voltage in the classroom** | We use cells (1.5 V or 9 V batteries) — NEVER mains electricity |\n\n### South Africa's Mains Electricity\n\n- South Africa uses **230 V AC** (alternating current) at **50 Hz**\n- This is enough to kill — that is why only qualified electricians should work on mains wiring\n- In Technology class, we only use **batteries** (cells) that are safe (1.5 V to 9 V)\n\n### The Earth Wire\n\nSouth African plugs have **three pins** — live, neutral, and **earth**. The earth wire is a safety feature: if a fault occurs, the current flows safely to the ground instead of through your body."),
  fb(9, 'South Africa uses mains electricity at ___ volts AC. The three pins on a South African plug are live, neutral, and ___.',
    ['230', 'earth'],
    'South Africa uses 230 V AC at 50 Hz. The earth pin is a safety feature — it provides a safe path to ground if a fault occurs, preventing electrocution.'),
  q(10, 'Why do houses use parallel circuits instead of series circuits?',
    ['So each room can be switched independently and one blown bulb does not affect the others', 'Because parallel circuits use less electricity', 'Because series circuits are more expensive', 'Because parallel circuits are easier to install'], 0,
    'Parallel circuits allow each room or appliance to work independently. If one light blows, the others keep working. Each appliance also gets the full voltage it needs (230 V).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Communication Technology (Term 3) — 1 lesson
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 6.1: History of Communication and Cybersafety
blockNum = 0;
const ch6_lesson1 = [
  t(1, "## The History of Communication\n\nHumans have always needed to share information. Over thousands of years, communication technology has changed dramatically.\n\n### Timeline of Communication Technology\n\n| Era | Technology | How it works |\n|-----|-----------|-------------|\n| **Ancient** | Drum signals, smoke signals, cave paintings | Sound and visual signals over short distances |\n| **2000+ years ago** | Written language (scrolls, books) | Information stored and transported physically |\n| **1837** | Telegraph (Samuel Morse) | Electrical signals sent along wires using Morse code |\n| **1876** | Telephone (Alexander Graham Bell) | Voice carried as electrical signals along wires |\n| **1895** | Radio (Guglielmo Marconi) | Sound carried as radio waves through the air (wireless) |\n| **1920s–1930s** | Television | Sound and pictures carried as radio waves |\n| **1970s** | First computers and computer networks | Data processed and shared electronically |\n| **1990s** | The Internet and World Wide Web | Global network connecting millions of computers |\n| **2000s+** | Smartphones, social media, 4G/5G | Instant communication anywhere, anytime |\n\n### Communication in South Africa\n\nSouth Africa has rapidly adopted modern communication technology. Cell phone coverage reaches most of the country, and companies like **MTN**, **Vodacom**, and **Telkom** provide services to millions."),
  t(2, "## How Information Is Shared Today\n\n### Electronic Communication\n\nToday, most information is shared **electronically** — as digital signals that travel through wires, fibre-optic cables, or wirelessly through the air.\n\n| Method | How it works | Speed |\n|--------|-------------|-------|\n| **SMS / Text message** | Sent via cell phone network | Seconds |\n| **Email** | Sent via the Internet | Seconds |\n| **Social media** | Shared via apps on the Internet (WhatsApp, Facebook, TikTok) | Instant |\n| **Video call** | Voice and video sent via Internet | Real-time |\n| **Television/Radio** | Broadcast as electromagnetic waves | Real-time |\n\n### Analogue vs Digital\n\n| | Analogue | Digital |\n|--|---------|--------|\n| **Signal** | Continuous wave (like sound waves) | Discrete values (0s and 1s — binary code) |\n| **Quality** | Degrades over distance | Stays clear over any distance |\n| **Examples** | Old radio, vinyl records | Digital TV (DStv), MP3 music, WhatsApp messages |\n\nSouth Africa completed its switch from analogue to **digital television** broadcasting, which allows more channels and better picture quality."),
  q(3, 'Which invention in 1837 first allowed messages to be sent as electrical signals along wires?',
    ['The telegraph', 'The telephone', 'The radio', 'The Internet'], 0,
    'The telegraph, invented by Samuel Morse in 1837, used electrical signals sent along wires. Messages were encoded in Morse code (dots and dashes). The telephone came later in 1876 and carried voice.'),
  t(4, "## The Internet\n\nThe **Internet** is a worldwide network of computers connected together. It allows people to share information, communicate, shop, learn, and work from anywhere in the world.\n\n### How the Internet Works (Simplified)\n\n1. Your device (phone, laptop, tablet) connects to a **router** (at home or school)\n2. The router connects to your **Internet Service Provider (ISP)** — e.g. Telkom, Vodacom, MTN\n3. The ISP connects to the **global Internet** via cables (including undersea fibre-optic cables)\n4. Your request (e.g. a website) travels to a **server** somewhere in the world\n5. The server sends the information back to your device\n\n### Key Vocabulary\n\n| Term | Meaning |\n|------|--------|\n| **Browser** | Software used to view websites (Chrome, Firefox, Edge) |\n| **URL** | The address of a website (e.g. www.gov.za) |\n| **Download** | Copying data FROM the Internet TO your device |\n| **Upload** | Sending data FROM your device TO the Internet |\n| **Wi-Fi** | Wireless connection to a local network |\n| **Data / Mobile data** | Internet access through cell phone networks (uses airtime/data bundles) |\n\n### Internet Access in South Africa\n\nMany South Africans access the Internet primarily through their **cell phones** (mobile data), as fibre and ADSL are not available in all areas. The government and private companies are working to expand fibre-optic coverage."),
  fb(5, 'The ___ is a worldwide network of computers that allows people to share information. In South Africa, most people access the Internet using their ___ rather than fixed-line connections.',
    ['Internet', 'cell phones'],
    'The Internet connects computers globally. In South Africa, mobile data via cell phones is the primary way most people access the Internet, because fibre-optic and ADSL coverage is limited in many areas.'),
  t(6, "## Responsible Use of Technology\n\nWith great technology comes great responsibility. It is important to use communication technology **safely, ethically, and responsibly**.\n\n### Digital Citizenship\n\nA **digital citizen** is someone who uses technology responsibly. Good digital citizens:\n- **Respect others** online — no bullying, insults, or spreading lies\n- **Protect their personal information** — do not share addresses, phone numbers, or school details publicly\n- **Think before they post** — once something is online, it is very hard to remove\n- **Give credit** to others' work — do not copy without permission (plagiarism)\n- **Follow the law** — do not download pirated music, movies, or software\n\n### South African Law\n\nSouth Africa has laws to protect people online:\n- **POPIA** (Protection of Personal Information Act) — companies must protect your personal data\n- **Cybercrimes Act** — it is a crime to hack, spread harmful messages, or commit fraud online\n- **Films and Publications Act** — regulates harmful content"),
  q(7, 'What does POPIA stand for and what does it do?',
    ['Protection of Personal Information Act — it protects your personal data', 'People\'s Online Privacy Association — it runs a website', 'Public Opinion and Press Information Act — it controls the media', 'Prevention of Piracy Act — it stops illegal downloads'], 0,
    'POPIA is the Protection of Personal Information Act. It requires companies and organisations in South Africa to protect your personal information and to use it responsibly.'),
  t(8, "## Cybersafety\n\n**Cybersafety** means staying safe when using the Internet and digital devices.\n\n### Online Dangers\n\n| Danger | What it is | How to stay safe |\n|--------|-----------|------------------|\n| **Cyberbullying** | Bullying someone using technology (messages, social media) | Tell a trusted adult; block the bully; do not respond |\n| **Phishing** | Fake emails or messages trying to steal your personal information | Never click on suspicious links; check the sender's address |\n| **Identity theft** | Someone steals your personal details to pretend to be you | Use strong passwords; never share personal info online |\n| **Online predators** | Adults who try to befriend children online for harmful purposes | Never meet someone you only know online; tell an adult if you feel uncomfortable |\n| **Viruses and malware** | Harmful software that damages your device or steals data | Install antivirus software; do not download from untrusted sites |\n\n### Creating Strong Passwords\n\nA strong password should:\n- Be at least **8 characters** long\n- Include uppercase letters, lowercase letters, numbers, and symbols\n- **Not** be a word from the dictionary or your name/birthday\n- Be **different** for each account\n\n**Example of a weak password:** *123456* or *password*\n**Example of a strong password:** *T3ch@Gr6!safe*"),
  fb(9, '___ means bullying someone using technology such as messages or social media. To stay safe online, you should never share your ___ with strangers on the Internet.',
    ['Cyberbullying', 'personal information'],
    'Cyberbullying is the use of technology to intentionally hurt, embarrass, or threaten someone. Protecting your personal information (name, address, school, phone number) is one of the most important cybersafety rules.'),
  q(10, 'Which of the following is a strong password?',
    ['M@th5_Gr6!x', '123456', 'password', 'johnsmith'], 0,
    'A strong password contains uppercase and lowercase letters, numbers, and symbols, and is at least 8 characters long. "M@th5_Gr6!x" meets all these criteria. Simple words and number sequences are easily guessed.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Frame Structures (Term 4) — 1 lesson
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 7.1: Designing and Making Frame Structures
blockNum = 0;
const ch7_lesson1 = [
  t(1, "## What Is a Frame Structure?\n\nA **frame structure** is a structure made of separate parts (called **members**) that are joined together at points (called **joints** or **nodes**). Frame structures are strong yet lightweight because they use material only where it is needed.\n\n### Frame Structures vs Shell and Solid Structures\n\n| Type | Material distribution | Weight | Examples |\n|------|----------------------|--------|----------|\n| **Frame** | Material only in the members (bars/struts) | Lightweight | Eskom pylons, scaffolding, bicycle frames |\n| **Shell** | Material in the outer skin | Medium | Eggs, helmets, FNB Stadium |\n| **Solid** | Material throughout | Heavy | Brick walls, concrete dams |\n\n### Parts of a Frame Structure\n\n| Part | Role |\n|------|------|\n| **Strut** | A member in compression (being pushed/squashed) |\n| **Tie** | A member in tension (being pulled/stretched) |\n| **Joint/node** | The point where members connect |\n| **Brace** | A diagonal member that prevents the frame from collapsing sideways |\n\n### South African Examples\n\n- **Eskom transmission pylons** — lattice frame structures carrying high-voltage power lines across the country\n- **Mine headgear** — tall frame structures above mine shafts (e.g. at gold mines on the Witwatersrand)\n- **Construction scaffolding** — temporary frame structures used when building houses and offices"),
  t(2, "## Joints in Frame Structures\n\nThe way members are joined together is critical to the strength of a frame structure.\n\n### Types of Joints\n\n| Joint Type | Description | Strength | Example |\n|-----------|-------------|----------|--------|\n| **Fixed joint (rigid)** | Members cannot move at the joint | Very strong | Welded steel frame, bolted connections |\n| **Movable joint (pivot)** | Members can rotate at the joint | Allows movement | Scissors, pliers, door hinges |\n| **Temporary joint** | Can be taken apart and reassembled | Moderate | Nuts and bolts, cable ties |\n\n### Making Strong Joints in the Classroom\n\nWhen building a model frame structure from wooden dowels or straws:\n\n| Method | Materials | Best for |\n|--------|----------|----------|\n| **Glue gun** | Hot glue sticks | Quick, strong bond for lightweight models |\n| **PVA glue + triangles** | PVA glue, cardboard gussets | Strengthening joints with cardboard triangles |\n| **String/wire lashing** | String or thin wire | Dowel rod structures |\n| **Pipe cleaners** | Chenille sticks | Connecting straws |\n\n### Gusset Plates\n\nA **gusset** is a flat plate (usually triangular) used to reinforce a joint. In real buildings, gussets are steel plates bolted or welded at the junction of beams. In the classroom, you can use small cardboard triangles glued over each joint."),
  q(3, 'What is the role of a brace in a frame structure?',
    ['A diagonal member that prevents the frame from collapsing sideways', 'A horizontal member that supports the floor', 'A vertical member that holds the roof', 'A joint where members connect'], 0,
    'A brace is a diagonal member added to a frame to prevent it from collapsing sideways (racking). Braces create triangles within the frame, and triangles are rigid shapes that resist deformation.'),
  t(4, "## Triangulation and Bracing\n\nThe most important principle in frame structures is **triangulation** — using triangles to make the frame rigid.\n\n### Why Triangles?\n\nA **rectangle** (four sides, four joints) can easily be pushed into a parallelogram — it collapses because the angles can change.\n\nBut a **triangle** (three sides, three joints) cannot change its shape without breaking one of its members. This makes triangles the **strongest and most rigid** geometric shape.\n\n### Adding Triangulation\n\nTo strengthen a rectangular frame, add a **diagonal member** across it. This divides the rectangle into two triangles:\n\n- Before: The rectangle can collapse sideways\n- After: The two triangles hold the frame rigid\n\n### Types of Bracing\n\n| Type | Description |\n|------|-------------|\n| **Single diagonal** | One diagonal across a rectangle — creates two triangles |\n| **Cross-bracing (X-bracing)** | Two diagonals crossing — very strong, resists forces from both directions |\n| **K-bracing** | Diagonals meet a vertical member at the centre — used in tall buildings |\n\n### Testing Your Structure\n\nYou can test the strength of your frame by:\n1. Placing the structure on a flat surface\n2. Gradually adding mass (coins, bags of sand) to the top\n3. Recording how much mass it supports before collapsing\n4. Comparing braced vs unbraced versions"),
  fb(5, 'Adding a diagonal member to a rectangular frame creates two ___, which makes the frame rigid. Two diagonals crossing each other is called ___-bracing.',
    ['triangles', 'cross'],
    'A diagonal divides a rectangle into two triangles, preventing the frame from collapsing sideways. Cross-bracing (X-bracing) uses two diagonals for extra strength in both directions.'),
  t(6, "## Designing a Frame Structure\n\nWhen designing a frame structure, you follow the IDMEC process and consider specific structural factors.\n\n### Design Considerations\n\n| Factor | Questions to ask |\n|--------|------------------|\n| **Purpose** | What must the structure do? What loads must it carry? |\n| **Materials** | What is available? (Wooden dowels, straws, newspaper rolls, cardboard?) |\n| **Strength** | Where are the weak points? Where should triangulation be added? |\n| **Stability** | Is the base wide enough? Is the centre of gravity low? |\n| **Joints** | How will members be connected? Are the joints strong enough? |\n| **Aesthetics** | Does it look good? Is it neat? |\n| **Cost/constraints** | Does it fit the budget and size limits? |\n\n### Step-by-Step Design Process\n\n1. **Investigate:** Examine real frame structures (pylons, scaffolding, roof trusses)\n2. **Design:** Sketch at least two ideas. Label materials, dimensions, and where you will use triangulation\n3. **Make:** Follow your flow chart. Start with the base, build upwards, add bracing last\n4. **Evaluate:** Test the structure with loads. Compare results to specifications\n5. **Communicate:** Present your structure, explain your design choices"),
  q(7, 'You have built a rectangular frame from straws. It easily pushes sideways. What is the BEST way to fix this?',
    ['Add diagonal braces to create triangles', 'Make the straws thicker', 'Add more horizontal straws', 'Use more glue at the corners'], 0,
    'Diagonal braces create triangles within the rectangular frame, making it rigid. Thicker straws, more horizontal members, or more glue will not fix the fundamental problem — the rectangle can still deform without triangulation.'),
  t(8, "## Evaluating Frame Structures Against Specifications\n\nAfter building your frame structure, you must evaluate it fairly and honestly.\n\n### Evaluation Criteria\n\n| Criterion | How to test/assess |\n|-----------|-------------------|\n| **Strength** | How much mass can it support before failing? |\n| **Stability** | Push it gently from the side — does it topple? |\n| **Rigidity** | Push the top sideways — does the frame deform? |\n| **Neatness** | Are the joints clean? Is the structure symmetrical? |\n| **Meets specifications** | Does it meet size, material, and budget constraints? |\n| **Use of triangulation** | Are there diagonal braces where needed? |\n\n### Writing an Evaluation Report\n\nYour report should include:\n\n1. **Testing method** — How did you test? (What mass did you add? How did you test stability?)\n2. **Results** — What happened? (Supported 2 kg before the left joint failed)\n3. **Comparison to specifications** — Did it meet each requirement?\n4. **Strengths** — What worked well? (Strong base, good triangulation on the sides)\n5. **Weaknesses** — What failed? Why? (Top joint was weak because no gusset was used)\n6. **Improvements** — What would you do differently? (Add gussets at every joint, use cross-bracing instead of single diagonal)"),
  fb(9, 'When testing a frame structure, you add ___ gradually to the top to see how much it can support. A flat plate used to reinforce a joint is called a ___.',
    ['mass', 'gusset'],
    'Strength is tested by gradually adding mass (e.g. coins, sand bags) until the structure fails. Gussets are flat reinforcing plates (usually triangular) that strengthen joints.'),
  q(10, 'Which of the following would make a frame structure LESS stable?',
    ['Making the base narrower', 'Lowering the centre of gravity', 'Adding cross-bracing', 'Making the base wider'], 0,
    'A narrower base makes a structure less stable because there is less area to prevent toppling. A wider base, lower centre of gravity, and cross-bracing all improve stability.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Systems and Control (Term 4) — 1 lesson
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 8.1: Input, Process, Output, and Feedback
blockNum = 0;
const ch8_lesson1 = [
  t(1, "## What Is a System?\n\nA **system** is a set of parts that work together to achieve a purpose. In Technology, we analyse everything as a system with three main parts:\n\n| Part | Description | Example (electric kettle) |\n|------|-------------|---------------------------|\n| **Input** | What goes into the system (energy, material, information) | Electricity from the plug; water |\n| **Process** | What the system does to the input | The element heats the water |\n| **Output** | What comes out of the system | Hot water; steam |\n\n### Systems Are Everywhere\n\n| System | Input | Process | Output |\n|--------|-------|---------|--------|\n| Torch (flashlight) | Pressing the switch; battery energy | Circuit closes; electricity flows to bulb | Light |\n| Bicycle | Pedalling force from your legs | Chain and gears transfer force to the wheel | Movement |\n| Toaster | Bread; electricity | Heating elements toast the bread | Toast |\n| Cell phone | Touch on screen; electrical signal from tower | Processor handles the signal | Sound, display, vibration |\n| Solar geyser | Sunlight | Panels absorb heat and transfer it to water | Hot water |"),
  t(2, "## Open and Closed Systems\n\n### Open-Loop System\n\nAn **open-loop system** does not check its own output. It runs without any automatic adjustment.\n\n| Feature | Detail |\n|---------|--------|\n| **Feedback?** | No feedback — the system does not know what the output is |\n| **Control** | You must check and adjust manually |\n| **Example** | A basic toaster — you set the timer, but the toaster does not check how brown the bread is. If you set it wrong, the toast burns. |\n\n### Closed-Loop System\n\nA **closed-loop system** monitors its own output and adjusts automatically. It uses **feedback**.\n\n| Feature | Detail |\n|---------|--------|\n| **Feedback?** | Yes — the output is measured and fed back to the input |\n| **Control** | The system adjusts itself automatically |\n| **Example** | A thermostat-controlled heater — the thermostat measures the room temperature (output). If the room is too cold, it switches the heater on. If the room is warm enough, it switches the heater off. |\n\n### Comparing the Two\n\n| | Open-Loop | Closed-Loop |\n|--|----------|-------------|\n| Has feedback? | No | Yes |\n| Self-correcting? | No — you must adjust manually | Yes — adjusts automatically |\n| Accuracy | Less accurate | More accurate |\n| Cost | Cheaper | More expensive |"),
  q(3, 'What is the key difference between an open-loop and a closed-loop system?',
    ['A closed-loop system uses feedback to adjust itself; an open-loop system does not', 'An open-loop system is more expensive', 'A closed-loop system has no output', 'There is no difference'], 0,
    'A closed-loop system measures its output and feeds that information back to adjust the input — this is called feedback. An open-loop system has no feedback and cannot self-correct.'),
  t(4, "## Feedback\n\n**Feedback** is information about the output of a system that is sent back to the input to control or adjust the system.\n\n### How Feedback Works\n\n1. The system produces an **output**\n2. A **sensor** measures the output\n3. The measurement is compared to the **desired value** (the set point)\n4. If there is a difference, the system **adjusts** the input\n5. The cycle repeats continuously\n\n### Examples of Feedback Systems\n\n| System | Sensor | What it measures | What it controls |\n|--------|--------|-----------------|------------------|\n| Geyser thermostat | Temperature sensor | Water temperature | Switches the element on/off |\n| Iron thermostat | Temperature sensor | Plate temperature | Switches heating on/off |\n| Toilet cistern | Float valve | Water level in the cistern | Opens/closes the water inlet |\n| Human body | Skin receptors | Body temperature | Sweating (to cool) or shivering (to warm) |\n\n### Feedback in South Africa\n\n- **Eskom's power grid** uses feedback systems to balance electricity supply and demand across the country\n- **Traffic lights** on some roads in Johannesburg use sensors to detect traffic flow and adjust green light timing\n- **Solar geysers** with thermostats only heat water when the temperature drops below the set point"),
  fb(5, '___ is information about a system\'s output that is sent back to control the input. A ___ measures the output and compares it to the desired value.',
    ['Feedback', 'sensor'],
    'Feedback is the process of using output information to adjust the system. Sensors (like thermostats, float valves, or light sensors) detect the current state of the output and trigger adjustments.'),
  t(6, "## Designing a System to Solve a Problem\n\nIn your practical assessment, you may need to design a simple system that solves a problem. Here is how to think about it.\n\n### Step 1: Identify the Problem\n\nExample: *A chicken coop door needs to open automatically in the morning and close at night to protect the chickens from predators.*\n\n### Step 2: Define Input, Process, Output\n\n| Part | This system |\n|------|-------------|\n| **Input** | Light from the sun (detected by a light sensor) |\n| **Process** | When light is detected, a motor activates to open the door. When light fades, the motor reverses to close the door. |\n| **Output** | Door opens (morning) or closes (evening) |\n\n### Step 3: Identify Feedback\n\nIs this open-loop or closed-loop?\n- **Closed-loop** — the light sensor continuously monitors the light level (output of the environment) and adjusts the motor accordingly.\n\n### Step 4: Draw a System Diagram\n\nA system diagram uses boxes and arrows:\n\n**Light sensor** → **Control circuit** → **Motor** → **Door opens/closes**\n\nWith a feedback arrow from the light sensor back to the control circuit, showing that the system continuously monitors and adjusts."),
  q(7, 'A geyser thermostat switches the element off when the water reaches 60°C and on again when it drops below 55°C. Is this an open-loop or closed-loop system?',
    ['Closed-loop — the thermostat provides feedback about water temperature', 'Open-loop — the geyser has no feedback', 'Neither — it is not a system', 'Open-loop — it only has one switch'], 0,
    'This is a closed-loop system. The thermostat (sensor) measures the water temperature (output) and feeds this information back to the element (input), switching it on or off to maintain the desired temperature.'),
  t(8, "## Real-World Systems in South Africa\n\n### Traffic Light System\n\n| Part | Detail |\n|------|--------|\n| **Input** | Timer or traffic sensor (detects vehicles) |\n| **Process** | Controller decides which light to show based on timing or sensor data |\n| **Output** | Red, amber, or green light |\n| **Feedback** | Some smart traffic lights use sensors to detect queue length and adjust timing |\n\n### Solar Power System (for a home)\n\n| Part | Detail |\n|------|--------|\n| **Input** | Sunlight falling on solar panels |\n| **Process** | Solar panels convert sunlight into electricity; inverter converts DC to AC |\n| **Output** | Electricity to power lights, appliances |\n| **Feedback** | Smart inverter monitors battery level — when full, excess is fed to the grid (or the panels are disconnected) |\n\n### Prepaid Electricity Meter\n\n| Part | Detail |\n|------|--------|\n| **Input** | Prepaid token/code purchased from a shop |\n| **Process** | Meter adds units of electricity to your balance; electricity flows to the house |\n| **Output** | Electricity available for use |\n| **Feedback** | When units run out, the meter disconnects supply (closed-loop control based on balance) |\n\nThese examples show that systems and control are everywhere in our daily lives — from the simplest kettle to complex power grids."),
  fb(9, 'In a solar power system, the ___ converts sunlight into electricity, and the ___ converts DC electricity to AC electricity for home use.',
    ['solar panels', 'inverter'],
    'Solar panels (photovoltaic cells) convert sunlight directly into DC electricity. An inverter then converts this into AC (alternating current) at 230 V, which is what South African homes use.'),
  q(10, 'Which of the following is an example of an open-loop system?',
    ['A basic toaster with only a timer — it does not check how brown the toast is', 'A geyser with a thermostat', 'A toilet cistern with a float valve', 'A traffic light with vehicle sensors'], 0,
    'A basic toaster runs its timer without checking the toast colour — there is no feedback. The other examples all use sensors (thermostat, float valve, vehicle sensor) to monitor the output and adjust, making them closed-loop systems.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN — Insert into MongoDB
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 6
  let gradeDoc = await db.collection('grades').findOne({ orderIndex: 6, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 6:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 6', schoolId: SCHOOL_ID, orderIndex: 6,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 6:', String(GRADE_ID));
  }

  // Find or create Technology subject
  const subjectDoc = await db.collection('subjects').findOne({ name: /^Technology$/i });
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

  // Find CAPS framework
  const frameworkDoc = await db.collection('curriculumframeworks').findOne({ name: /CAPS/i });
  const frameworkId = frameworkDoc ? frameworkDoc._id : null;
  if (frameworkDoc) {
    console.log('Found CAPS framework:', String(frameworkId));
  } else {
    console.log('CAPS framework not found — proceeding without it');
  }

  const now = new Date();
  const tags = ['grade-6', 'technology', 'caps'];
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
      title: 'Chapter 1: The Design Process',
      description: 'Introduction to the IDMEC design process (Investigate, Design, Make, Evaluate, Communicate), design briefs, specifications and constraints, evaluation matrices, flow charts, safe working practices, and communicating design ideas.',
      order: 1,
      lessons: [
        { title: 'Introduction to IDMEC', description: 'What is technology, the five IDMEC steps, investigate and design, specifications vs constraints, analysing existing products, safe working practices, sketching design ideas.', blocks: ch1_lesson1, term: 1 },
        { title: 'Applying IDMEC — Design Briefs and Evaluation', description: 'Writing good design briefs, evaluation matrices, flow charts for planning, evaluating products against specifications, communicating design work, budgeting.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Structures Around Us',
      description: 'Natural and human-made structures, shell/frame/solid structures, forces (compression, tension, bending, torsion, shear), dead and live loads, strength, stability, triangulation, corrugation, bridges, and South African structure case studies.',
      order: 2,
      lessons: [
        { title: 'Types of Structures, Strength, and Stability', description: 'Natural vs human-made structures, shell/frame/solid structures, forces on structures, loads, stability (base of support, centre of gravity), triangulation, strengthening methods, bridges, SA case studies.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Processing Materials',
      description: 'Raw vs processed materials, processing wood/metal/plastic/textiles, South African manufacturing and mining, types of production, environmental impact, recycling, the three Rs, product life cycle, and sustainable design.',
      order: 3,
      lessons: [
        { title: 'Raw Materials and Processing', description: 'Raw vs processed materials, processing wood (timber), metal (smelting, refining), plastic (thermoplastic vs thermoset), textiles (natural vs synthetic fibres), South African industries (Sasol, ArcelorMittal, mohair).', blocks: ch3_lesson1, term: 2 },
        { title: 'Manufacturing, Recycling, and the Environment', description: 'Types of production, SA manufacturing sectors, environmental impacts, recycling codes, the three Rs, informal recyclers, SA recycling organisations, product life cycle, sustainable design.', blocks: ch3_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 4: Mechanical Systems and Movement',
      description: 'Mechanisms as input-process-output systems, types of movement, levers (1st, 2nd, 3rd class), mechanical advantage, gears and gear ratios, pulleys (fixed, movable, block and tackle), cams, and linkages.',
      order: 4,
      lessons: [
        { title: 'Levers, Gears, Pulleys, and Linkages', description: 'Mechanisms, types of movement (linear, rotary, reciprocating, oscillating), three classes of levers, mechanical advantage, gears and gear ratios, pulleys, cams, linkages (reverse, parallel, bell crank), combining mechanisms.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Electrical Systems',
      description: 'Electricity sources (Eskom, coal, nuclear, solar, wind), simple circuits, components and symbols, conductors and insulators, series and parallel circuits, switches, circuit diagrams, and electrical safety.',
      order: 5,
      lessons: [
        { title: 'Circuits, Components, and Safety', description: 'What is electricity, SA energy sources, simple circuits (energy source, conductors, load), circuit symbols, conductors and insulators, series vs parallel circuits, switches, drawing circuit diagrams, electrical safety, earth wire.', blocks: ch5_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 6: Communication Technology',
      description: 'History of communication (drums to smartphones), electronic communication, analogue vs digital, the Internet, responsible use of technology, digital citizenship, South African laws (POPIA, Cybercrimes Act), and cybersafety.',
      order: 6,
      lessons: [
        { title: 'History of Communication and Cybersafety', description: 'Timeline of communication technology, electronic communication methods, analogue vs digital, how the Internet works, digital citizenship, POPIA and Cybercrimes Act, online dangers, cybersafety rules, strong passwords.', blocks: ch6_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 7: Frame Structures',
      description: 'Frame structures in detail, struts/ties/braces, types of joints (fixed, movable, temporary), gusset plates, triangulation and bracing (single diagonal, cross-bracing, K-bracing), designing and evaluating frame structures.',
      order: 7,
      lessons: [
        { title: 'Designing and Making Frame Structures', description: 'Frame structures vs shell and solid, struts and ties, joints (fixed, movable, temporary), gussets, triangulation, bracing types, design considerations, building and testing, evaluating against specifications.', blocks: ch7_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 8: Systems and Control',
      description: 'Systems as input-process-output, open-loop and closed-loop systems, feedback, sensors and control, designing systems to solve problems, real-world SA examples (traffic lights, solar power, prepaid meters).',
      order: 8,
      lessons: [
        { title: 'Input, Process, Output, and Feedback', description: 'What is a system, input-process-output, open-loop vs closed-loop systems, feedback, sensors, designing a system to solve a problem, real-world SA examples (traffic lights, solar power, prepaid electricity meters).', blocks: ch8_lesson1, term: 4 },
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
      resources: resourceIds.map(function(id, i) { return { resourceId: id, order: i }; }),
    });
  }

  // Create textbook
  const textbook = await db.collection('textbooks').insertOne({
    title: 'Grade 6 Technology \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering the Design Process (IDMEC), Structures (shell, frame, solid), Processing Materials (wood, metal, plastic, textiles), Mechanical Systems (levers, gears, pulleys, cams, linkages), Electrical Systems (circuits, series and parallel), Communication Technology (history, Internet, cybersafety), Frame Structures (triangulation, bracing, joints), and Systems and Control (input-process-output, feedback) for Grade 6 Technology.',
    schoolId: SCHOOL_ID,
    gradeId: GRADE_ID,
    subjectId: SUBJECT_ID,
    frameworkId: frameworkId,
    tags: tags,
    status: 'published',
    chapters: textbookChapters,
    createdBy: CREATED_BY,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    __v: 0,
  });

  console.log('\n========================================');
  console.log('  TEXTBOOK: Grade 6 Technology');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
