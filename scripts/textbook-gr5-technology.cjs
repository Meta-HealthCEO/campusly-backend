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
// CHAPTER 1: The Design Process — IDMEC (Term 1) — 2 lessons
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 1.1: Introduction to IDMEC
blockNum = 0;
const ch1_lesson1 = [
  t(1, "## What Is Technology?\n\nWhen people hear the word \"technology\", they often think of computers and cell phones. But in this subject, **technology** means using knowledge and skills to design and make things that solve problems.\n\nEverything around you was designed to solve a problem:\n\n| Object | Problem it solves |\n|--------|-------------------|\n| A spoon | We need to eat soup and porridge |\n| A blanket | We need to stay warm at night |\n| A bridge | We need to cross a river safely |\n| A JoJo tank | We need to store water for dry times |\n| A ramp | People in wheelchairs need to enter buildings |\n\n### Technology in South Africa\n\nSouth Africans have been solving problems with technology for thousands of years. The San people made bows and arrows for hunting. The Mapungubwe people in Limpopo smelted gold over 800 years ago. Today, South African engineers design solar panels, build dams, and create apps that help people."),
  t(2, "## The Design Process — IDMEC\n\nIn Technology, we solve problems by following five steps called **IDMEC**. Each letter stands for one step:\n\n| Letter | Step | What You Do |\n|--------|------|-------------|\n| **I** | **Investigate** | Find out about the problem. Ask questions. Look at existing products. |\n| **D** | **Design** | Write a design brief. Draw sketches of your ideas. |\n| **M** | **Make** | Gather materials and tools. Build your product safely. |\n| **E** | **Evaluate** | Test your product. Does it work? What could be better? |\n| **C** | **Communicate** | Show your work to others. Explain what you did and why. |\n\nYou always follow these steps **in order**. Each step builds on the one before it.\n\n### Important Words to Know\n\n- **Design brief:** A short paragraph that says what you will make, who it is for, and what it must do.\n- **Specifications:** The things your product **must** do (e.g. must hold water, must be 20 cm tall).\n- **Constraints:** Things that **limit** your design (e.g. you can only spend R15, you only have 1 week)."),
  q(3, 'What does the letter "D" stand for in IDMEC?',
    ['Design', 'Discover', 'Develop', 'Deliver'], 0,
    'The five steps of IDMEC are Investigate, Design, Make, Evaluate, and Communicate. "D" stands for Design, where you write a design brief and draw sketches of your ideas.'),
  t(4, "## The Investigate Step\n\nThe first thing you do is **investigate** the problem. This means finding out as much as you can before you start designing.\n\n### What to Find Out\n\n1. **The problem:** What exactly needs to be solved?\n2. **The user:** Who will use the product? A child? An adult? An elderly person?\n3. **Existing products:** What products already exist that try to solve this problem?\n4. **Materials:** What materials can you use?\n\n### Looking at Existing Products\n\nWhen you look at an existing product, think about these things:\n\n| Question | What it means |\n|----------|---------------|\n| Does it work well? | Does it do the job it was made for? |\n| Is it safe? | Are there any sharp edges or dangers? |\n| Is it strong? | Will it break easily? |\n| Is it easy to use? | Can the user figure out how to use it quickly? |\n| Does it look good? | Is it neat and attractive? |\n| Is it affordable? | Can people afford to buy it? |\n\n### Example\n\n> *Your class needs a container to grow seedlings for the school garden. You investigate by looking at different pots, trays, and recycled containers to see which works best.*"),
  fb(5, 'The five steps of IDMEC are Investigate, ___, Make, ___, and Communicate.',
    ['Design', 'Evaluate'],
    'IDMEC stands for Investigate, Design, Make, Evaluate, and Communicate. These five steps guide you through solving any technology problem.'),
  t(6, "## The Design Step\n\nAfter investigating, you move to the **Design** step. Here you plan what you will make.\n\n### Writing a Design Brief\n\nA design brief is a short paragraph that answers three questions:\n1. **What** will you design and make?\n2. **Who** is it for?\n3. **What** must it do?\n\n**Good example:** *Design and make a seedling container for Grade 5 learners to grow beans in the school garden. It must hold soil, have drainage holes, and be made from recycled materials.*\n\n**Poor example:** *Make a pot.* (Too vague! No user, no details.)\n\n### Drawing Sketches\n\nYou must draw at least **two different ideas**. For each sketch:\n- Draw in **pencil** (so you can erase mistakes)\n- **Label** the materials you will use\n- Show the **size** with measurements\n- Add **notes** explaining how it works\n\n### Choosing the Best Idea\n\nAfter drawing your sketches, pick the best one by checking which idea meets the most specifications."),
  q(7, 'A learner writes: "Make something for the garden." Why is this a poor design brief?',
    ['It does not say what to make, who it is for, or what it must do', 'It is too long', 'It mentions a garden', 'It uses the word "make"'], 0,
    'A good design brief must say WHAT you will make, WHO it is for, and WHAT it must do. "Make something for the garden" is too vague because it does not give any of these details.'),
  t(8, "## Make, Evaluate, and Communicate\n\n### The Make Step\n\nNow you build your product! Before you start:\n- List all the **materials** you need\n- List all the **tools** you need\n- Plan the **steps** you will follow\n\n**Safety Rules:**\n\n| Rule | Why |\n|------|-----|\n| Cut away from your body | If the tool slips, it moves safely away |\n| Hold materials steady before cutting | Stops them from slipping |\n| Keep your workspace tidy | Prevents accidents |\n| Use the right tool for the job | Wrong tools can cause injuries |\n\n### The Evaluate Step\n\nAfter making your product, test it! Ask:\n- Does it do what the design brief says?\n- What works well?\n- What could be improved?\n\n### The Communicate Step\n\nFinally, show your work to others:\n- Show your **sketches**\n- Show your **finished product**\n- Explain your **design decisions**\n- Say what you would **improve** next time"),
  fb(9, 'When cutting materials, you should always cut ___ from your body. Before cutting, you should hold the material ___.',
    ['away', 'steady'],
    'Cutting away from your body keeps you safe if the tool slips. Holding the material steady stops it from moving while you cut, which prevents accidents.'),
  q(10, 'During which step of IDMEC do you test your product and check if it meets the specifications?',
    ['Evaluate', 'Investigate', 'Communicate', 'Design'], 0,
    'The Evaluate step is when you test your finished product against the specifications from your design brief. You check what works well and what needs improving.'),
];

// Lesson 1.2: Applying IDMEC — Briefs, Sketches, and Evaluation
blockNum = 0;
const ch1_lesson2 = [
  t(1, "## Putting IDMEC into Practice\n\nNow that you know the five steps of IDMEC, let us see how to use them for a real project.\n\n### A Real Problem\n\n> *Your school in Gauteng is having a fun day. Each class must design and make a game that younger learners (Grade 1 and 2) can play. The game must be safe, fun, easy to understand, and made from recycled materials. Your budget is R20.*\n\n### Step 1: Investigate\n\nFirst, find out:\n- What games do Grade 1 and 2 learners enjoy?\n- What recycled materials are available at school?\n- What existing games could give you ideas?\n\nYou could ask the Grade 1 teacher what the young learners enjoy. You might look at games like ring toss, bowling, or a ball maze.\n\n### Step 2: Design — Writing the Brief\n\n**Design brief:** *Design and make a ring toss game for Grade 1 and 2 learners to play at the school fun day. It must be safe (no sharp edges), colourful and fun, easy to carry, and made from recycled materials with a budget of R20.*\n\n| Specifications | Constraints |\n|---------------|-------------|\n| Must be safe (no sharp edges) | Budget: R20 |\n| Must be colourful and attractive | Only recycled materials |\n| Must be easy for small children to play | Must fit on one desk |\n| Must have clear rules | One week to finish |"),
  t(2, "## Drawing and Choosing Designs\n\n### Sketching Two Ideas\n\nYou must draw at least two different design ideas.\n\n**Idea A — Bottle Ring Toss:** Stand five plastic bottles in a row, fill them with sand to keep them upright. Players throw rings (made from rolled newspaper and tape) to land around the bottle necks.\n\n**Idea B — Cardboard Bowling:** Cut ten cardboard tubes to the same height, decorate them as bowling pins. Players roll a ball (scrunched newspaper wrapped in tape) to knock them down.\n\n### Using an Evaluation Matrix\n\nAn **evaluation matrix** helps you choose the best idea fairly.\n\n| Specification | Idea A (Ring Toss) /5 | Idea B (Bowling) /5 |\n|--------------|----------------------|---------------------|\n| Safe (no sharp edges) | 5 | 5 |\n| Colourful and fun | 4 | 4 |\n| Easy for small children | 3 | 5 |\n| Fits on one desk | 4 | 3 |\n| Made from recycled materials | 5 | 5 |\n| **Total** | **21** | **22** |\n\nIdea B scores slightly higher because small children find rolling a ball easier than throwing a ring accurately. You choose Idea B."),
  q(3, 'Why is an evaluation matrix useful when choosing between design ideas?',
    ['It compares each idea fairly against the specifications', 'It makes the sketches look better', 'It saves money', 'It replaces the design brief'], 0,
    'An evaluation matrix scores each design idea against every specification, so your choice is based on evidence and facts, not just which idea you like best.'),
  t(4, "## Planning with a Flow Chart\n\nA **flow chart** shows the steps of making in the correct order.\n\n### Flow Chart Symbols\n\n| Symbol shape | Meaning |\n|-------------|----------|\n| Rounded rectangle | Start or Stop |\n| Rectangle | A step (process) |\n| Diamond | A question (yes/no decision) |\n| Arrow | Shows the order of steps |\n\n### Flow Chart for the Bowling Game\n\n1. **Start**\n2. Collect 10 cardboard tubes and newspaper\n3. Cut all tubes to the same height (15 cm)\n4. **Decision:** Are all tubes the same height? If no, trim again\n5. Decorate tubes with paint or coloured paper\n6. Scrunch newspaper into a ball shape\n7. Wrap ball tightly with tape\n8. Set up pins in a triangle and test the game\n9. **Decision:** Does the ball knock pins over? If no, make the ball heavier\n10. **Stop**\n\nFlow charts help you plan before you start building. This saves time and prevents mistakes."),
  fb(5, 'In a flow chart, a ___ shape means a decision, and a ___ shape means the start or end.',
    ['diamond', 'rounded rectangle'],
    'Diamond shapes represent yes/no decisions. Rounded rectangles (also called terminators) mark the start and end of the process.'),
  t(6, "## Evaluating and Improving Your Product\n\n### Testing Against Specifications\n\nAfter building your bowling game, test it against each specification:\n\n| Specification | Met? | Evidence | Score /5 |\n|--------------|-------|----------|---------|\n| Safe (no sharp edges) | Yes | All edges smooth, no sharp parts | 5 |\n| Colourful and fun | Yes | Bright paint, learners smiled | 4 |\n| Easy for small children | Partly | Some Grade 1s struggled to roll straight | 3 |\n| Fits on one desk | Yes | Set up in 50 cm x 30 cm space | 5 |\n| Recycled materials | Yes | Used cardboard tubes, newspaper, tape | 5 |\n| **Total** | | | **22/25** |\n\n### Writing an Evaluation\n\n**What worked well:** The game was colourful and fun. Learners enjoyed knocking down the pins. It was very safe with no sharp edges.\n\n**What could be improved:** Some young learners found it hard to roll the ball in a straight line. Next time, I could add side walls (like a bowling lane) to guide the ball.\n\n**Did it meet the design brief?** Yes, mostly. It was safe, fun, made from recycled materials, and cost R12 (under the R20 budget). The only issue was that the youngest children needed help aiming."),
  q(7, 'A learner evaluates a product and writes: "It is nice." Why is this a poor evaluation?',
    ['It does not compare the product to the specifications', 'It is too short', 'It is negative', 'It mentions the product'], 0,
    'A proper evaluation tests the product against each specification from the design brief. Saying "it is nice" gives no specific evidence about whether the product met its requirements.'),
  t(8, "## Communicating Your Project\n\n### How to Present\n\nWhen you communicate your project, show and explain:\n\n| What to show | What to say |\n|-------------|-------------|\n| Design brief | What you planned to make and for whom |\n| Sketches | Your two (or more) ideas and which one you chose |\n| Evaluation matrix | Why you chose that design |\n| Flow chart | The steps you followed to build it |\n| Finished product | How it works (demonstrate it!) |\n| Evaluation | What works well, what you would improve |\n\n### Tips for Presenting\n\n- Speak clearly so everyone can hear\n- Face your audience, not the board\n- Use your sketches and product as props\n- Be honest about what did not work — this shows good thinking\n- Stay within the time limit\n\n### Budgeting\n\nPart of the Design step is planning your costs:\n\n| Material | Cost |\n|----------|------|\n| Cardboard tubes (collected) | R0 |\n| Newspaper (collected) | R0 |\n| Tape (1 roll) | R8 |\n| Paint (small tins, shared) | R4 |\n| **Total** | **R12** |\n\nYour budget constraint was R20, and you spent R12. You came in under budget!"),
  fb(9, 'An evaluation matrix scores each design idea against the ___ from the design brief. The idea with the ___ total score is usually the best choice.',
    ['specifications', 'highest'],
    'The evaluation matrix compares designs against specifications. Each idea gets a score for each specification, and the highest total usually indicates the best design.'),
  q(10, 'Which of the following is a constraint, not a specification?',
    ['A budget of R20', 'The product must be waterproof', 'The product must hold 500 g', 'The product must be safe for children'], 0,
    'A budget of R20 is a constraint because it limits what you can spend. The others are specifications — things the product must do or be. Constraints include budget, time, size limits, and available materials.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Structures (Term 1) — 1 lesson
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 2.1: Types of Structures and What Makes Them Strong
blockNum = 0;
const ch2_lesson1 = [
  t(1, "## What Is a Structure?\n\nA **structure** is anything that is made up of parts joined together to support a load or serve a purpose. Structures are everywhere around you.\n\n### Natural vs Human-Made Structures\n\n| Natural structures | Human-made structures |\n|-------------------|----------------------|\n| A tree trunk | A house |\n| A bird's nest | A bridge |\n| A tortoise shell | A table |\n| A spider's web | The Nelson Mandela Bridge (Johannesburg) |\n| A mountain | A Zulu beehive hut |\n| An eggshell | A soccer stadium |\n\n**Natural structures** are found in nature. No person designed them. **Human-made structures** are designed and built by people to solve problems.\n\n### Three Types of Structures\n\n| Type | Description | Examples |\n|------|-------------|----------|\n| **Shell structure** | A hollow shape that gets strength from its curved surface | Eggshell, igloo, Zulu beer pot, Moses Mabhida Stadium roof |\n| **Frame structure** | Made of parts (struts and beams) joined together, with open spaces between them | Pylon, jungle gym, roof truss, scaffolding |\n| **Solid structure** | Made of solid material packed together, very heavy and strong | A brick wall, a dam wall (like Gariep Dam), a mud wall |"),
  q(2, 'Which type of structure is an eggshell?',
    ['Shell structure', 'Frame structure', 'Solid structure', 'Natural frame'], 0,
    'An eggshell is a shell structure. It is hollow inside and gets its strength from its curved shape. Other shell structures include igloos, helmets, and the roof of Moses Mabhida Stadium in Durban.'),
  t(3, "## What Makes Structures Strong?\n\nSome structures are strong and last a long time. Others break easily. What makes the difference?\n\n### Forces on Structures\n\nStructures must resist **forces** that try to push, pull, or twist them:\n\n| Force | What it does | Example |\n|-------|-------------|----------|\n| **Compression** | Squeezes or pushes together | A column holding up a roof |\n| **Tension** | Stretches or pulls apart | A rope in a tug-of-war |\n| **Bending** | Pushes down in the middle of a beam | A plank across a ditch when you walk on it |\n\n### Loads\n\nA **load** is any weight or force on a structure:\n- **Dead load:** The weight of the structure itself (the bricks, beams, and roof)\n- **Live load:** Things that move or change (people walking on a floor, cars on a bridge, wind pushing against a building)\n\n### How to Make Structures Stronger\n\n| Method | How it works |\n|--------|-------------|\n| **Triangulation** | Triangles are the strongest shape. Adding diagonal pieces turns rectangles into triangles. |\n| **Wider base** | A wider base makes a structure harder to push over (more stable). |\n| **Corrugation** | Folding a material into ridges (like a corrugated roof sheet) makes it much stiffer. |\n| **Thicker materials** | Using thicker or stronger materials helps resist forces. |"),
  fb(4, 'A force that squeezes or pushes together is called ___. A force that stretches or pulls apart is called ___.',
    ['compression', 'tension'],
    'Compression squeezes materials together (like pressing a sponge). Tension stretches materials apart (like pulling a rubber band). Structures experience both of these forces.'),
  t(5, "## Bridges and Buildings in South Africa\n\nSouth Africa has many amazing structures. Let us look at some examples and see which type of structure they are.\n\n### Famous SA Structures\n\n| Structure | Location | Type | Interesting fact |\n|-----------|----------|------|------------------|\n| Nelson Mandela Bridge | Johannesburg | Frame | 284 metres long, uses cables and a frame of steel |\n| Bloukrans Bridge | Eastern Cape | Frame (arch) | World's highest commercial bungee jump (216 m) |\n| Moses Mabhida Stadium | Durban | Shell + Frame | Arch rises 106 m above the stadium |\n| Gariep Dam | Free State/Eastern Cape border | Solid | Largest dam in SA, wall is made of solid concrete |\n| Rondavel (round hut) | Rural areas across SA | Shell | Circular walls and thatched roof form a strong shell |\n\n### Why Bridges Use Triangles\n\nIf you look at the metal framework of a bridge, you will see many triangles. This is because a **triangle is the strongest shape** — it cannot be pushed out of shape without breaking one of its sides. A rectangle, by contrast, can be pushed into a parallelogram easily.\n\n### Stability\n\nA structure is **stable** when it does not fall over easily. Two things help stability:\n1. **A wide base** — the wider the base, the harder to push over\n2. **Low centre of gravity** — heavy parts near the bottom make a structure more stable"),
  q(6, 'Why are triangles used in the framework of bridges?',
    ['Triangles are the strongest shape and cannot be pushed out of shape', 'Triangles use the least material', 'Triangles look the best', 'Triangles are easy to paint'], 0,
    'A triangle is the strongest shape because it cannot be deformed (pushed out of shape) without breaking one of its sides. That is why engineers use triangles in bridges, pylons, and roof trusses.'),
  t(7, "## Designing a Strong Structure\n\nWhen you design a structure in class, think about:\n\n### Checklist for a Good Structure\n\n| Factor | Ask yourself... |\n|--------|----------------|\n| **Purpose** | What is the structure for? What must it hold or support? |\n| **Materials** | What will you use? (Paper, cardboard, straws, wooden dowels?) |\n| **Strength** | Have you used triangulation, a wide base, or corrugation? |\n| **Stability** | Will it stand up without falling over? |\n| **Aesthetics** | Does it look neat and attractive? |\n| **Safety** | Are there any sharp edges or dangers? |\n\n### A Class Activity\n\n> *Build a bridge from newspaper and tape that can support a 500 g weight across a 30 cm gap.*\n\nTo succeed, you would:\n1. Roll newspaper into tight tubes (this makes them stronger — like corrugation)\n2. Join the tubes into triangles\n3. Make the base wider than the top for stability\n4. Test with increasing weights until it fails"),
  fb(8, 'The three types of structures are ___, frame, and ___.',
    ['shell', 'solid'],
    'Shell structures (like an eggshell) are hollow with curved surfaces. Frame structures (like a pylon) are made of parts joined together with spaces between them. Solid structures (like a dam wall) are made of solid material packed together.'),
  q(9, 'What are the two things that make a structure more stable?',
    ['A wide base and a low centre of gravity', 'Light weight and tall height', 'Bright colours and smooth surfaces', 'Small size and heavy top'], 0,
    'A wide base and a low centre of gravity both improve stability. A wide base makes the structure harder to push over, and having heavy parts near the bottom prevents it from toppling.'),
  t(10, "## Summary: Structures\n\n| Concept | Key point |\n|---------|-----------|\n| Structure | Anything made of parts joined together to support a load |\n| Shell | Hollow, gets strength from curves (eggshell, stadium roof) |\n| Frame | Parts joined with open spaces (pylon, bridge, jungle gym) |\n| Solid | Packed solid material (dam wall, brick wall) |\n| Compression | Force that squeezes together |\n| Tension | Force that pulls apart |\n| Triangulation | Using triangles to strengthen a structure |\n| Stability | Wide base + low centre of gravity = hard to push over |\n\nRemember: In your IDMEC projects, always think about which type of structure will best solve the problem, and use triangles, wide bases, and strong materials to make your structure as strong and stable as possible."),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Materials Around Us (Term 2) — 1 lesson
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 3.1: Different Materials and Their Properties
blockNum = 0;
const ch3_lesson1 = [
  t(1, "## What Are Materials?\n\n**Materials** are the substances we use to make things. Everything around you is made from one or more materials. Choosing the right material for a job is one of the most important parts of technology.\n\n### Common Materials\n\n| Material | Where it comes from | Examples of products |\n|----------|-------------------|---------------------|\n| **Wood** | Trees (a natural material) | Desks, chairs, pencils, doors |\n| **Metal** | Mined from rocks (ores) in the ground | Cars, pots, nails, coins, corrugated roofing |\n| **Plastic** | Made from oil (petroleum) | Bottles, bags, toys, rulers |\n| **Glass** | Made from sand heated to very high temperatures | Windows, bottles, spectacles |\n| **Fabric (textile)** | Made from natural fibres (cotton, wool) or synthetic fibres (polyester) | Clothes, curtains, school uniforms |\n| **Paper** | Made from wood pulp | Books, newspapers, cardboard boxes |\n| **Rubber** | From rubber trees or made synthetically | Tyres, erasers, shoe soles |\n| **Ceramic** | Made from clay fired in a kiln | Tiles, bricks, pottery, Zulu beer pots |\n\n### Natural vs Synthetic Materials\n\n- **Natural materials** come from nature: wood, cotton, wool, leather, clay\n- **Synthetic materials** are made by people in factories: plastic, nylon, polyester, fibreglass"),
  q(2, 'Which material is made from sand heated to very high temperatures?',
    ['Glass', 'Plastic', 'Metal', 'Ceramic'], 0,
    'Glass is made by heating sand (silica) to extremely high temperatures until it melts, then shaping it as it cools. It is transparent, hard, and smooth.'),
  t(3, "## Properties of Materials\n\nEach material has special qualities called **properties**. We choose materials based on their properties.\n\n### Key Properties\n\n| Property | What it means | Example |\n|----------|--------------|----------|\n| **Strong** | Hard to break | Steel is very strong — used for bridges |\n| **Flexible** | Can bend without breaking | Rubber bends easily — used for tyres |\n| **Waterproof** | Does not let water through | Plastic is waterproof — used for raincoats |\n| **Transparent** | You can see through it | Glass is transparent — used for windows |\n| **Absorbent** | Soaks up liquids | Cotton is absorbent — used for towels |\n| **Heat resistant** | Can handle high temperatures | Ceramic is heat resistant — used for oven dishes |\n| **Lightweight** | Not heavy | Plastic is lightweight — used for lunchboxes |\n| **Durable** | Lasts a long time without wearing out | Metal is durable — used for tools |\n| **Conductor** | Allows heat or electricity to flow through | Copper conducts electricity — used for wires |\n| **Insulator** | Does NOT allow heat or electricity to flow | Rubber is an insulator — used to coat wire handles |\n\n### Why Properties Matter\n\nYou would not make a window from wood (you cannot see through it!) or a raincoat from paper (it would dissolve!). Choosing the right material means matching its properties to the job."),
  fb(4, 'A material that does not let water through is called ___. A material that allows electricity to flow through it is called a ___.',
    ['waterproof', 'conductor'],
    'Waterproof materials (like plastic) block water. Conductors (like copper and aluminium) allow electricity to pass through them. These are important properties for choosing the right material.'),
  t(5, "## Choosing the Right Material\n\nWhen you design a product, you must choose materials carefully. Ask these questions:\n\n| Question | Why it matters |\n|----------|---------------|\n| What must the product do? | A lunchbox must be waterproof; a bridge must be strong |\n| Where will it be used? | Outdoor products need weather-resistant materials |\n| Who will use it? | Children's toys must be safe (no sharp metal, no toxic paint) |\n| How much can you spend? | Expensive materials increase the cost |\n| Can it be recycled? | Recyclable materials are better for the environment |\n\n### Material Matching Activity\n\n| Product | Best material | Why |\n|---------|--------------|-----|\n| School window | Glass | Transparent, lets light in |\n| Cooking pot | Metal (stainless steel) | Strong, heat resistant, durable |\n| Shopping bag | Fabric (cotton) | Reusable, strong, flexible |\n| Water pipe | Plastic (PVC) | Waterproof, lightweight, does not rust |\n| Winter jersey | Wool | Warm, flexible, absorbent |\n\n### Materials in South Africa\n\nSouth Africa is rich in natural resources:\n- **Gold and platinum** are mined in Gauteng and the North West\n- **Iron ore** comes from the Northern Cape (used to make steel)\n- **Cotton** is grown in Limpopo and KwaZulu-Natal\n- **Wood** comes from plantations in Mpumalanga and KwaZulu-Natal\n- **Clay** is found across the country and used for traditional pottery"),
  q(6, 'Why would you choose plastic (PVC) for water pipes instead of metal?',
    ['Plastic is waterproof, lightweight, and does not rust', 'Plastic is the cheapest material', 'Plastic is the strongest material', 'Plastic looks better than metal'], 0,
    'PVC plastic is waterproof (keeps water in), lightweight (easier to transport and install), and does not rust (unlike iron or steel). These properties make it ideal for water pipes.'),
  t(7, "## Recycling and the Environment\n\nMany materials can be **recycled** — melted down or processed and made into new products.\n\n### Recycling Codes\n\nPlastic products have a small triangle with a number inside. This tells you what type of plastic it is:\n\n| Code | Plastic type | Common products |\n|------|-------------|----------------|\n| 1 (PET) | Polyethylene terephthalate | Cold drink bottles |\n| 2 (HDPE) | High-density polyethylene | Milk bottles, shampoo bottles |\n| 5 (PP) | Polypropylene | Yoghurt tubs, ice cream containers |\n\n### Why Recycling Matters\n\n- Reduces waste in landfills\n- Saves natural resources (less mining, fewer trees cut)\n- Uses less energy than making new materials\n- Creates jobs — many South Africans earn a living by collecting recyclable materials\n\n### The Three Rs\n\n1. **Reduce** — use less material in the first place\n2. **Reuse** — use the item again instead of throwing it away\n3. **Recycle** — turn used materials into new products\n\n> *In South Africa, waste pickers collect over 80% of the recyclable material that gets recycled. They play a vital role in keeping our environment clean.*"),
  fb(8, 'The three Rs of waste management are Reduce, ___, and ___.',
    ['Reuse', 'Recycle'],
    'Reduce means using less. Reuse means using something again. Recycle means turning old materials into new products. Following the three Rs helps protect our environment.'),
  q(9, 'Which property makes wool a good choice for a winter jersey?',
    ['It is warm and flexible', 'It is waterproof and transparent', 'It is hard and durable', 'It conducts electricity'], 0,
    'Wool is warm (it traps air which insulates against cold), flexible (it stretches and moves with your body), and absorbent (it can absorb moisture). These properties make it perfect for winter clothing.'),
  t(10, "## Summary: Materials Around Us\n\n| Key idea | Remember |\n|----------|----------|\n| Materials | Substances used to make things (wood, metal, plastic, glass, fabric, etc.) |\n| Natural | Come from nature: wood, cotton, wool, clay |\n| Synthetic | Made in factories: plastic, nylon, polyester |\n| Properties | Qualities like strong, flexible, waterproof, transparent |\n| Choosing materials | Match the material's properties to what the product needs to do |\n| Recycling | Turning used materials into new products — saves resources and energy |\n| Three Rs | Reduce, Reuse, Recycle |\n\nWhen you work on Technology projects, always think carefully about which material is best for the job. Check its properties, its cost, and whether it can be recycled."),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Processing Materials (Term 2) — 1 lesson
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 4.1: Changing Materials — Cutting, Shaping, Joining, Finishing
blockNum = 0;
const ch4_lesson1 = [
  t(1, "## What Is Processing?\n\n**Processing** means changing a material from its raw form into something useful. A tree becomes a plank of wood. Sand becomes glass. Iron ore becomes steel.\n\nIn your Technology projects, you also process materials when you cut, shape, join, and finish them.\n\n### Four Ways We Process Materials\n\n| Process | What it means | Examples |\n|---------|--------------|----------|\n| **Cutting** | Removing parts of a material to change its size or shape | Cutting paper with scissors, sawing wood |\n| **Shaping** | Bending, folding, or moulding a material into a new form | Folding cardboard into a box, bending wire |\n| **Joining** | Attaching two or more pieces together | Gluing, taping, nailing, tying, sewing |\n| **Finishing** | Making the product look good and protecting it | Painting, varnishing, sanding smooth |\n\n### Order Matters!\n\nUsually you process materials in this order:\n1. **Measure and mark** — use a ruler and pencil\n2. **Cut** — remove the parts you do not need\n3. **Shape** — bend or fold into the right form\n4. **Join** — attach the pieces together\n5. **Finish** — sand, paint, or decorate"),
  t(2, "## Cutting and Shaping Materials\n\n### Cutting Tools\n\n| Tool | Used for | Safety tip |\n|------|---------|------------|\n| Scissors | Paper, thin card, fabric | Cut away from your body |\n| Craft knife | Thick card, foam board | Always use a cutting mat, cut away from you |\n| Junior hacksaw | Thin wood, plastic dowel | Clamp the material before cutting |\n\n### Measuring and Marking\n\nBefore you cut, always:\n1. **Measure** twice with a ruler\n2. **Mark** with a pencil (not pen — pencil can be erased)\n3. **Check** your measurements before cutting\n\nThe saying is: *\"Measure twice, cut once.\"*\n\n### Shaping Techniques\n\n| Technique | Material | What you do |\n|-----------|----------|-------------|\n| Folding | Paper, cardboard | Score a line with a ruler, then fold along it |\n| Bending | Wire, thin metal | Use pliers to bend into shape |\n| Rolling | Paper, thin card | Roll around a dowel or pencil to make a tube |\n| Moulding | Clay, papier-mache | Press and shape with your hands |\n\n### Scoring\n\nTo fold cardboard neatly, first **score** it: press a line along the fold using a ruler and the back of a scissors blade. This weakens the surface so the fold is clean and straight."),
  q(3, 'What does "measure twice, cut once" mean?',
    ['Check your measurements carefully before cutting to avoid mistakes', 'Cut the material into two pieces', 'Use two rulers to measure', 'Cut slowly'], 0,
    '"Measure twice, cut once" means you should double-check your measurements before cutting. If you cut incorrectly, you waste material and may need to start over. Checking prevents costly mistakes.'),
  t(4, "## Joining Materials\n\nOnce you have cut and shaped your pieces, you need to join them together.\n\n### Types of Joints\n\n| Joining method | Best for | Strength | Permanent? |\n|---------------|---------|----------|------------|\n| **Glue (PVA)** | Paper, card, wood | Medium | Yes |\n| **Hot glue** | Card, wood, plastic, fabric | Strong | Yes |\n| **Tape (masking)** | Paper, card (temporary) | Weak | No |\n| **Staples** | Paper, thin card | Medium | Yes |\n| **Nails** | Wood | Strong | Yes |\n| **Screws** | Wood, plastic | Very strong | Can be removed |\n| **Tying (string/wire)** | Sticks, dowels | Medium | Can be removed |\n| **Sewing** | Fabric | Strong | Yes |\n\n### Choosing the Right Joint\n\nAsk yourself:\n- How **strong** does the joint need to be?\n- Will it need to be **taken apart** later?\n- What **materials** am I joining?\n- What **tools** do I have?\n\n### Tips for Strong Joints\n\n- Let glue dry completely before moving the product\n- Use enough glue, but not too much (it will be messy and weak)\n- For wood joints, clamp the pieces while the glue dries\n- Reinforce weak joints with extra tape or a gusset (a small triangle of card glued across the corner)"),
  fb(5, 'Before cutting a material, you should always ___ twice to make sure your marks are correct. To fold cardboard neatly, first ___ a line along the fold.',
    ['measure', 'score'],
    'Measuring twice prevents mistakes when cutting. Scoring (pressing a line into the surface) weakens the cardboard along the fold line so it folds cleanly and straight.'),
  t(6, "## Finishing and Decorating\n\n**Finishing** is the last step. It makes your product look good and can protect the material.\n\n### Finishing Techniques\n\n| Technique | What it does | Used on |\n|-----------|-------------|--------|\n| **Sanding** | Smooths rough surfaces | Wood, dried papier-mache |\n| **Painting** | Adds colour and protects the surface | Wood, card, clay |\n| **Varnishing** | Adds a shiny, protective coat | Wood |\n| **Covering** | Wraps the product in paper or fabric | Card, boxes |\n| **Decorating** | Adds stickers, patterns, or labels | Any material |\n\n### Making Products from Recycled Materials\n\nIn many Technology projects, you use **recycled materials**. This saves money and helps the environment.\n\n| Recycled material | What you can make |\n|------------------|-------------------|\n| Plastic bottles | Planters, bird feeders, pencil holders |\n| Cardboard boxes | Storage containers, model buildings |\n| Newspaper | Papier-mache bowls, rolled tubes for structures |\n| Tin cans | Pencil holders, lanterns (with adult help) |\n| Old fabric | Bags, book covers, puppets |\n\nIn South Africa, many crafters and small businesses create beautiful products from waste materials — from wire cars made by children in rural areas to handbags made from recycled billboards."),
  q(7, 'Why do we sand a wooden product before painting it?',
    ['To make the surface smooth so the paint sticks evenly', 'To make the wood weaker', 'To remove the colour', 'To make the wood heavier'], 0,
    'Sanding removes rough spots and splinters, creating a smooth surface. Paint sticks better and looks neater on a smooth surface. Sanding is an important finishing step.'),
  t(8, "## Safety When Processing Materials\n\nWorking with tools can be dangerous if you are not careful. Always follow these rules:\n\n### Safety Rules\n\n| Rule | Reason |\n|------|--------|\n| Always cut away from your body | If the tool slips, it goes away from you |\n| Clamp materials before cutting with a saw | Stops the material from moving |\n| Wear safety goggles when sawing or sanding | Protects your eyes from dust and chips |\n| Keep your workspace clean and tidy | Prevents tripping and losing tools |\n| Use the correct tool for each job | Wrong tools can slip and cause injuries |\n| Never run with scissors or sharp tools | You could hurt yourself or someone else |\n| Ask an adult for help with hot glue guns | Hot glue can burn your skin |\n| Wash your hands after using glue or paint | Some chemicals can irritate skin |\n\n### Tool Care\n\n- Put lids back on glue and paint after use\n- Clean brushes in water immediately after painting\n- Return tools to their proper storage place\n- Report any broken or damaged tools to your teacher"),
  fb(9, 'The four main ways we process materials are cutting, ___, joining, and ___.',
    ['shaping', 'finishing'],
    'Processing materials involves four main steps: cutting (removing material), shaping (bending, folding, moulding), joining (attaching pieces together), and finishing (sanding, painting, decorating).'),
  q(10, 'Which joining method would be best for attaching two pieces of wood permanently?',
    ['Glue and nails', 'Masking tape', 'Paper clips', 'String'], 0,
    'Glue (PVA or wood glue) combined with nails creates a strong, permanent joint for wood. Masking tape is too weak, paper clips do not work with wood, and string is not permanent.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Levers and Movement (Term 3) — 1 lesson
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 5.1: What Is a Lever?
blockNum = 0;
const ch5_lesson1 = [
  t(1, "## Simple Machines\n\nA **simple machine** is a device that makes work easier. It helps you push, pull, or lift things with less effort. One of the most common simple machines is the **lever**.\n\n### What Is a Lever?\n\nA lever is a stiff bar that turns (pivots) around a fixed point. Every lever has three parts:\n\n| Part | What it is | Example (seesaw) |\n|------|-----------|------------------|\n| **Fulcrum** | The fixed point the lever turns around | The middle support of the seesaw |\n| **Load** | The thing you are trying to move or lift | The person sitting on one end |\n| **Effort** | The force you apply to move the load | The person pushing down on the other end |\n\n### How Levers Help\n\nLevers make it easier to:\n- **Lift** heavy things (like using a crowbar to lift a rock)\n- **Cut** things (like using scissors)\n- **Squeeze** things (like using a nutcracker)\n- **Move** things (like using a wheelbarrow)\n\nThe further the effort is from the fulcrum, the **easier** it is to lift the load. That is why it is easier to open a door by pushing near the handle (far from the hinges) than by pushing near the hinges."),
  t(2, "## Types of Levers\n\nThere are three types (classes) of levers. The difference is where the fulcrum, load, and effort are positioned.\n\n### First-Class Lever\n\nThe **fulcrum is in the middle**, between the effort and the load.\n\n| Example | Effort | Fulcrum | Load |\n|---------|--------|---------|------|\n| Seesaw | One child pushes down | Middle support | Other child goes up |\n| Scissors | Your fingers squeeze | The screw in the middle | The blades cut the paper |\n| Balance scale | You place weights | The centre pivot | The object being weighed |\n\n### Second-Class Lever\n\nThe **load is in the middle**, between the effort and the fulcrum.\n\n| Example | Effort | Load | Fulcrum |\n|---------|--------|------|----------|\n| Wheelbarrow | You lift the handles | The heavy load in the tray | The wheel on the ground |\n| Nutcracker | You squeeze the handles | The nut in the middle | The hinge at the end |\n| Door | You push the handle | The door itself | The hinges |\n\n### Third-Class Lever\n\nThe **effort is in the middle**, between the fulcrum and the load.\n\n| Example | Fulcrum | Effort | Load |\n|---------|---------|--------|------|\n| Fishing rod | Your hand at the bottom | Your other hand pulls up | The fish on the line |\n| Cricket bat | Your bottom hand | Your top hand swings | The ball you hit |\n| Tweezers | The joined end | Your fingers squeeze | The tips grip the object |"),
  q(3, 'In a seesaw, where is the fulcrum?',
    ['In the middle', 'At one end', 'It does not have a fulcrum', 'On top of the load'], 0,
    'A seesaw is a first-class lever. The fulcrum (the fixed point it turns around) is in the middle, with the effort on one side and the load on the other side.'),
  fb(4, 'Every lever has three parts: the ___ (the fixed point), the load (the thing being moved), and the ___ (the force you apply).',
    ['fulcrum', 'effort'],
    'The fulcrum is the pivot point. The load is what you want to move. The effort is the force you apply to move the load. These three parts are present in every lever.'),
  t(5, "## Levers in Everyday Life\n\nLevers are everywhere! You use them every day without even realising it.\n\n### Levers at Home and School\n\n| Lever | Class | How it works |\n|-------|-------|--------------|\n| Scissors | 1st | Fulcrum (screw) is between effort (your fingers) and load (paper) |\n| Bottle opener | 2nd | Load (bottle cap) is between effort (your hand) and fulcrum (lip of the bottle) |\n| Broom | 3rd | Effort (your top hand) is between fulcrum (your bottom hand) and load (the dirt) |\n| Stapler | 2nd | Load (staple through paper) is between effort (your hand pressing) and fulcrum (the hinge) |\n| Tongs (braai tongs) | 3rd | Effort (your fingers) is between fulcrum (joined end) and load (the food) |\n\n### Levers in South Africa\n\nSouth Africans use levers in many ways:\n- **Wheelbarrows** on construction sites and in gardens\n- **Braai tongs** at weekend braais — a third-class lever!\n- **Crowbars** used in mining and building\n- **Spades and shovels** for digging (third-class levers)\n- **Pliers** used by electricians and mechanics\n\n### The Rule of Levers\n\nThe further your effort is from the fulcrum, the less force you need. This is why:\n- Long-handled pliers are easier to squeeze than short ones\n- It is easier to push a door open near the handle (far from the hinge) than near the hinge"),
  q(6, 'A wheelbarrow is an example of which class of lever?',
    ['Second-class lever', 'First-class lever', 'Third-class lever', 'It is not a lever'], 0,
    'A wheelbarrow is a second-class lever. The fulcrum is the wheel, the load is in the tray (in the middle), and the effort is applied at the handles. The load is between the fulcrum and the effort.'),
  t(7, "## Making a Simple Lever\n\nYou can build a simple lever in class to see how it works.\n\n### Activity: Build a Catapult\n\n**What you need:**\n- A wooden ruler or ice cream stick (the lever arm)\n- A small block of wood or an eraser (the fulcrum)\n- A bottle cap (to hold the load)\n- A small ball of paper or marshmallow (the load)\n\n**How to build it:**\n1. Place the block of wood on the table — this is the fulcrum\n2. Balance the ruler on top of the fulcrum, near one end\n3. Place the bottle cap on the short end of the ruler\n4. Put the paper ball in the bottle cap\n5. Push down quickly on the long end of the ruler (the effort)\n6. Watch the load fly!\n\n### Experimenting\n\nTry moving the fulcrum to different positions:\n\n| Fulcrum position | What happens |\n|-----------------|---------------|\n| Near the load (short effort arm) | Load flies far, but you need more effort |\n| In the middle | Load flies a medium distance |\n| Near the effort (long effort arm) | Less effort needed, but load does not fly as far |\n\nThis shows that the position of the fulcrum changes how the lever works."),
  fb(8, 'Scissors are a ___-class lever. Braai tongs are a ___-class lever.',
    ['first', 'third'],
    'Scissors have the fulcrum (the screw) in the middle, making them first-class levers. Braai tongs have the effort (your fingers squeezing) in the middle, making them third-class levers.'),
  q(9, 'Why is it easier to open a door by pushing near the handle rather than near the hinges?',
    ['The handle is far from the fulcrum (hinges), so less effort is needed', 'The handle is heavier', 'The hinges are slippery', 'The door is thinner near the handle'], 0,
    'The hinges are the fulcrum. When you push far from the fulcrum (near the handle), you need less effort to move the door. This is the rule of levers: more distance from the fulcrum means less effort needed.'),
  t(10, "## Summary: Levers and Movement\n\n| Concept | Key point |\n|---------|-----------|\n| Simple machine | A device that makes work easier |\n| Lever | A stiff bar that pivots around a fulcrum |\n| Fulcrum | The fixed point the lever turns around |\n| Load | The thing being moved or lifted |\n| Effort | The force you apply |\n| 1st-class | Fulcrum in the middle (seesaw, scissors) |\n| 2nd-class | Load in the middle (wheelbarrow, nutcracker) |\n| 3rd-class | Effort in the middle (fishing rod, tongs, broom) |\n| Lever rule | Further from the fulcrum = less effort needed |\n\nLevers are simple but powerful machines. Understanding how they work helps you design better products and understand how everyday tools function."),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Wheels and Axles (Term 3) — 1 lesson
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 6.1: How Wheels, Axles, Gears, and Pulleys Work
blockNum = 0;
const ch6_lesson1 = [
  t(1, "## Wheels and Axles\n\nA **wheel and axle** is a simple machine made of a wheel attached to a rod called an axle. When the wheel turns, the axle turns too (or the other way around).\n\n### Parts of a Wheel and Axle\n\n| Part | What it is |\n|------|------------|\n| **Wheel** | The round, larger part that turns |\n| **Axle** | The rod through the centre that the wheel turns around |\n\n### How Wheels Help Us\n\nWithout wheels, moving heavy things would be very difficult. Imagine trying to move a heavy box across the floor — you would have to drag it. Put wheels under it, and it rolls easily!\n\n### Examples of Wheels and Axles\n\n| Example | Wheel | Axle |\n|---------|-------|------|\n| Bicycle | The two tyres | The metal rod through each tyre |\n| Car | The four tyres | The metal shafts connecting the tyres |\n| Doorknob | The round knob you turn | The rod that goes into the door |\n| Tap (faucet) | The handle you turn | The rod that opens/closes the water |\n| Screwdriver | The handle | The metal shaft |\n| Rolling pin | The handles on each side | The cylinder that rolls the dough |\n\n### Wheels in South Africa\n\nSouth Africa's transport system depends on wheels — from minibus taxis that carry millions of people daily to the Gautrain, from Zulu tradition of rolling wooden wheels to the massive trucks on the N1 highway between Johannesburg and Cape Town."),
  q(2, 'In a doorknob, which part is the wheel and which part is the axle?',
    ['The round knob is the wheel, and the rod going into the door is the axle', 'The door is the wheel, and the knob is the axle', 'The handle is the axle, and the lock is the wheel', 'A doorknob is not a wheel and axle'], 0,
    'A doorknob is a wheel and axle. The round knob you turn is the wheel (larger part), and the rod that goes through the door into the latch is the axle (smaller rod). Turning the large knob makes it easier to turn the small rod.'),
  t(3, "## Gears\n\nA **gear** is a wheel with teeth (small bumps) around its edge. When two gears are placed next to each other, the teeth mesh (interlock) and one gear turns the other.\n\n### How Gears Work\n\n- When a gear turns **clockwise**, the gear next to it turns **anticlockwise**\n- A **big gear** turning a **small gear** makes the small gear turn faster\n- A **small gear** turning a **big gear** makes the big gear turn slower but with more force\n\n### Where We Find Gears\n\n| Object | How gears are used |\n|--------|-------------------|\n| Bicycle | Gears on the pedals and back wheel let you change speed |\n| Clock | Tiny gears inside make the hands move at different speeds |\n| Hand-cranked mincer | Gears turn the blades that mince meat |\n| Wind-up toy | A gear system stores and releases energy |\n| Egg beater | Handle gear turns the beater gears faster |\n\n### Gear Fact\n\nIf a gear with 20 teeth turns a gear with 10 teeth, the smaller gear spins **twice as fast** (because 20 ÷ 10 = 2). This is called the **gear ratio**."),
  fb(4, 'A gear is a wheel with ___ around its edge. When one gear turns clockwise, the gear meshing with it turns ___.',
    ['teeth', 'anticlockwise'],
    'Gears have teeth that interlock with each other. When gears mesh, they turn in opposite directions — if one turns clockwise, the other turns anticlockwise.'),
  t(5, "## Pulleys\n\nA **pulley** is a wheel with a groove around its edge. A rope or string fits in the groove. Pulleys help you lift heavy things by changing the direction of the force.\n\n### How a Pulley Works\n\nWith a simple pulley:\n- The rope goes over the wheel\n- You pull **down** on one end of the rope\n- The load goes **up** on the other end\n\nPulling down is easier than lifting up because you can use your body weight to help.\n\n### Types of Pulleys\n\n| Type | How it works | Example |\n|------|-------------|----------|\n| **Fixed pulley** | Attached to a high point (ceiling, beam). Changes direction of force. | Flagpole — you pull the rope down and the flag goes up |\n| **Movable pulley** | Attached to the load. Reduces the effort needed. | Construction crane — the pulley moves with the load |\n\n### Pulleys in Real Life\n\n- The **South African flag** at schools is raised using a fixed pulley on the flagpole\n- **Construction cranes** in cities like Johannesburg use pulleys to lift heavy steel and concrete\n- **Wells** in rural areas sometimes use a pulley to lift a bucket of water\n- **Blinds** on windows use a pulley system to open and close"),
  q(6, 'What does a fixed pulley change?',
    ['The direction of the force', 'The weight of the load', 'The colour of the rope', 'The size of the wheel'], 0,
    'A fixed pulley changes the direction of the force. Instead of pushing or lifting up, you pull down, which is easier because you can use your body weight. A fixed pulley does not reduce the amount of force needed.'),
  t(7, "## Vehicles and Transport in South Africa\n\nWheels, axles, gears, and pulleys all play a role in transport.\n\n### How a Bicycle Uses These Machines\n\n| Part | Simple machine | What it does |\n|------|---------------|--------------|\n| Tyres and axles | Wheel and axle | Let the bicycle roll along the road |\n| Chain and sprockets | Gears | Transfer your pedalling effort to the back wheel |\n| Brake levers | Lever | Let you squeeze the brakes to stop |\n| Brake cable | Pulley-like | Transfers the force from the lever to the brake pads |\n\n### Transport in South Africa\n\n| Transport type | Where | Uses wheels? |\n|---------------|-------|--------------|\n| Minibus taxi | Cities and townships | Yes — wheels and axles |\n| Gautrain | Gauteng | Yes — steel wheels on rails |\n| Ox wagon (historical) | Across SA | Yes — large wooden wheels |\n| Cable car | Table Mountain | No wheels on the car — uses pulleys and cables |\n| Bicycle | Rural and urban areas | Yes — wheels, gears, levers |\n\n### Making a Simple Wheeled Vehicle\n\nYou can build a toy car using:\n- A small cardboard box (the body)\n- 4 bottle caps (the wheels)\n- 2 wooden skewers or dowels (the axles)\n- Tape or hot glue\n\nPush the skewers through the bottom of the box and attach bottle caps to each end. Now you have a working wheel and axle system!"),
  fb(8, 'A ___ is a wheel with a groove for a rope, used to change the direction of a force. A ___ is a wheel with teeth that meshes with another wheel.',
    ['pulley', 'gear'],
    'A pulley has a groove for a rope and helps lift loads by changing the direction of force. A gear has teeth around its edge that interlock with another gear to transfer rotation.'),
  q(9, 'On a bicycle, what simple machine do the chain and sprockets form?',
    ['Gears', 'Levers', 'Pulleys', 'Wheels and axles'], 0,
    'The chain and sprockets (toothed wheels) on a bicycle form a gear system. The large sprocket at the pedals drives the chain, which turns the smaller sprocket at the back wheel, making it spin faster.'),
  t(10, "## Summary: Wheels and Axles\n\n| Concept | Key point |\n|---------|-----------|\n| Wheel and axle | A wheel attached to a rod (axle) — makes moving things easier |\n| Gear | A toothed wheel that meshes with another gear to change speed or direction |\n| Gear ratio | Big gear turning small gear = small gear spins faster |\n| Pulley | A grooved wheel with a rope — changes the direction of force |\n| Fixed pulley | Stays in place, changes direction (flagpole) |\n| Movable pulley | Moves with the load, reduces effort (crane) |\n| Bicycle | Uses wheels, gears, levers, and pulley-like cables |\n\nThese simple machines are all around us. Understanding how they work helps you design better solutions in your Technology projects."),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Electricity Basics (Term 4) — 1 lesson
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 7.1: Circuits, Conductors, Insulators, and Safety
blockNum = 0;
const ch7_lesson1 = [
  t(1, "## What Is Electricity?\n\n**Electricity** is a form of energy that we use every day — for lights, appliances, computers, and much more. But what exactly is it?\n\nElectricity is the flow of tiny particles called **electrons** through a material (usually a wire). You cannot see electricity, but you can see what it does: it makes bulbs glow, motors spin, and heaters warm up.\n\n### Where Does Electricity Come From?\n\n| Source | How it works |\n|--------|-------------|\n| **Batteries** | Chemicals inside produce electricity (used in torches, remote controls, toys) |\n| **Power stations** | Burn coal, use nuclear energy, or capture wind/sunlight to generate electricity |\n| **Solar panels** | Convert sunlight into electricity |\n| **Generators** | Burn fuel (petrol/diesel) to produce electricity during load shedding |\n\n### Electricity in South Africa\n\nMost of South Africa's electricity comes from **Eskom**, which runs coal power stations. But South Africa also uses:\n- **Solar power** — SA has lots of sunshine, especially in the Northern Cape\n- **Wind power** — wind farms along the Eastern Cape and Western Cape coasts\n- When there is not enough electricity, we experience **load shedding** (planned power cuts)"),
  t(2, "## Electric Circuits\n\nFor electricity to work, it needs a **circuit** — a complete loop that the electricity can flow through.\n\n### Parts of a Simple Circuit\n\n| Part | What it does | Symbol |\n|------|-------------|--------|\n| **Battery (cell)** | Provides the energy (pushes electrons around) | Two lines (one long, one short) |\n| **Wires (conductors)** | Carry the electricity from one part to another | Straight lines |\n| **Bulb (lamp)** | Converts electricity into light | A circle with a cross inside |\n| **Switch** | Opens or closes the circuit (turns it on/off) | A line that can be open or closed |\n\n### How a Circuit Works\n\n1. The battery pushes electrons out of one end (the negative terminal)\n2. The electrons flow through the wire\n3. They pass through the bulb, making it glow\n4. They continue through the wire back to the other end of the battery (the positive terminal)\n5. The electrons keep flowing in a loop — this is why it is called a *circuit*\n\n### The Circuit Must Be Complete\n\nIf there is a **break** anywhere in the circuit (a loose wire, a burnt-out bulb, or an open switch), the electricity **stops flowing** and the bulb goes off. This is what a switch does — it breaks the circuit to turn things off."),
  q(3, 'What happens if there is a break in an electric circuit?',
    ['The electricity stops flowing and the bulb goes off', 'The bulb gets brighter', 'The battery charges up', 'Nothing changes'], 0,
    'Electricity needs a complete loop (circuit) to flow. If there is any break — a loose wire, open switch, or broken bulb — the electrons cannot flow and the circuit stops working.'),
  t(4, "## Conductors and Insulators\n\nSome materials let electricity flow through them easily. Others block it.\n\n### Conductors\n\nA **conductor** is a material that lets electricity flow through it.\n\n| Conductor | Where it is used |\n|-----------|------------------|\n| Copper | Inside electrical wires |\n| Aluminium | Power lines, cooking pots |\n| Steel | Appliances, buildings |\n| Gold | Circuit boards in computers |\n| Water (with salt or minerals) | This is why wet hands + electricity = DANGER |\n\n### Insulators\n\nAn **insulator** is a material that does NOT let electricity flow through it.\n\n| Insulator | Where it is used |\n|-----------|------------------|\n| Plastic | Coating around electrical wires |\n| Rubber | Handles of tools, shoe soles |\n| Wood | Handles of pots and pans |\n| Glass | Light bulbs, power line insulators |\n| Dry air | The space between power lines |\n\n### Why Both Are Important\n\nWe need **conductors** to carry electricity where we want it to go (through wires). We need **insulators** to stop electricity from going where we do not want it (into our bodies!). That is why electrical wires have a copper conductor inside and a plastic insulator coating outside."),
  fb(5, 'A material that lets electricity flow through it is called a ___. A material that blocks electricity is called an ___.',
    ['conductor', 'insulator'],
    'Conductors (like copper and aluminium) allow electrons to flow through them. Insulators (like plastic and rubber) block the flow of electrons. Both are essential for safe electrical systems.'),
  t(6, "## Switches and Bulbs\n\n### How a Switch Works\n\nA switch is a device that **opens** or **closes** a circuit:\n- **Closed switch** (ON): The circuit is complete, electricity flows, the bulb lights up\n- **Open switch** (OFF): The circuit is broken, electricity stops, the bulb goes off\n\n### Types of Switches\n\n| Switch type | Example |\n|------------|----------|\n| Toggle switch | Light switch on the wall |\n| Push button | Doorbell button |\n| Slide switch | On the side of a torch |\n| Rocker switch | On a power strip |\n\n### How a Light Bulb Works\n\nInside a traditional light bulb:\n1. Electricity flows through a very thin wire called a **filament**\n2. The filament resists the flow, which makes it heat up\n3. It gets so hot that it **glows** and produces light\n\nModern **LED bulbs** work differently — they use a special material that produces light without getting very hot, which saves electricity.\n\n### Building a Simple Circuit\n\nYou can build a simple circuit using:\n- A 1.5V battery (torch battery)\n- Two pieces of wire with crocodile clips\n- A small bulb in a bulb holder\n- A switch (or make one from a paper clip and two drawing pins)"),
  q(7, 'What does a switch do in a circuit?',
    ['It opens or closes the circuit to turn it on or off', 'It makes the battery last longer', 'It makes the bulb brighter', 'It stores electricity'], 0,
    'A switch opens (breaks) or closes (completes) a circuit. When closed, electricity flows and the bulb lights up. When open, the circuit is broken and the bulb goes off. This is how we control electrical devices.'),
  t(8, "## Electrical Safety\n\nElectricity is useful but it can be **very dangerous**. It can cause electric shocks, burns, and even death.\n\n### Safety Rules\n\n| Rule | Why |\n|------|-----|\n| **Never touch a plug with wet hands** | Water is a conductor — electricity can flow through the water into your body |\n| **Never put fingers or objects into plug sockets** | You could get a severe electric shock |\n| **Stay away from power lines** | Power lines carry extremely high voltage — even being near them can be dangerous |\n| **Do not fly kites near power lines** | The kite string could touch the lines and conduct electricity to you |\n| **Unplug appliances when not in use** | Saves electricity and prevents fires |\n| **Do not overload plug sockets** | Too many appliances in one socket can overheat and cause a fire |\n| **Tell an adult if you see a damaged wire** | Exposed wires can cause shocks and fires |\n\n### Load Shedding Safety\n\nDuring load shedding in South Africa:\n- Use **torches or LED lanterns**, not candles (fire risk)\n- Turn off appliances before the power goes off (they can surge when power returns)\n- Never use a generator indoors (carbon monoxide poisoning)\n- Keep fridge and freezer doors closed to keep food cold"),
  fb(9, 'You should never touch a plug with ___ hands because water is a ___.',
    ['wet', 'conductor'],
    'Water (especially with minerals or salt) conducts electricity. If your hands are wet and you touch a plug or electrical appliance, electricity can flow through the water and into your body, causing a dangerous electric shock.'),
  q(10, 'Why do electrical wires have a plastic coating around the copper inside?',
    ['Plastic is an insulator that stops electricity from escaping the wire', 'Plastic makes the wire stronger', 'Plastic is cheaper than copper', 'Plastic makes the wire look colourful'], 0,
    'The plastic coating is an insulator — it prevents electricity from flowing out of the copper wire and into things it should not (like your fingers!). This is essential for safety.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Communication and Technology (Term 4) — 1 lesson
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 8.1: How Technology Helps Us Communicate
blockNum = 0;
const ch8_lesson1 = [
  t(1, "## What Is Communication?\n\n**Communication** is the sharing of information, ideas, or feelings between people. We communicate every day — when we talk, write, draw, or even wave at someone.\n\n### Ways We Communicate\n\n| Type | Examples |\n|------|----------|\n| **Spoken (verbal)** | Talking face-to-face, phone calls, voice notes |\n| **Written** | Letters, emails, text messages, books |\n| **Visual** | Pictures, diagrams, videos, sign language |\n| **Electronic** | TV, radio, internet, social media |\n\n### Technology and Communication\n\nThroughout history, people have invented new technologies to communicate over longer distances and more quickly.\n\n| Era | Technology | How far could you communicate? |\n|-----|-----------|-------------------------------|\n| Ancient times | Talking, drums, smoke signals | A few kilometres |\n| 1400s | Printing press | Books could travel the world |\n| 1800s | Telegraph, telephone | Across continents |\n| 1900s | Radio, television | Across the world |\n| 2000s | Internet, smartphones | Anywhere instantly |\n\n### Communication in South Africa's History\n\nBefore telephones, South Africans used many methods:\n- **Drum signals** by various African communities\n- **Smoke signals** for long-distance warnings\n- **Runners** who carried messages between villages\n- **Letters** delivered by horse riders and later by the postal service"),
  t(2, "## Old vs New Communication Technology\n\nTechnology has changed the way we communicate in dramatic ways.\n\n### Comparing Old and New\n\n| Old technology | New technology | What changed |\n|--------------|---------------|---------------|\n| Letters (post) | Email | Speed: days/weeks became seconds |\n| Landline telephone | Cell phone (smartphone) | Mobility: no longer tied to one place |\n| Newspapers | Websites and apps | Updates: daily editions became live updates |\n| Radio | Podcasts, streaming | Choice: you listen to what you want, when you want |\n| Television | YouTube, streaming services | On demand: watch anything, anytime |\n| Encyclopedias (books) | Internet search engines | Access: millions of topics in seconds |\n| Fax machine | WhatsApp, email | Ease: send documents and photos instantly |\n\n### Advantages of New Technology\n\n- **Speed:** Messages are delivered in seconds\n- **Cost:** Sending an email is free (once you have internet)\n- **Reach:** You can communicate with anyone in the world\n- **Multimedia:** Send text, photos, videos, and voice all at once\n\n### Disadvantages of New Technology\n\n- **Access:** Not everyone has electricity or internet, especially in rural South Africa\n- **Cost of devices:** Smartphones and data are expensive\n- **Privacy:** Personal information can be stolen or shared without your permission\n- **Distraction:** Too much screen time can affect your health and schoolwork"),
  q(3, 'What is the main advantage of email compared to posting a letter?',
    ['Email is delivered in seconds, while a letter takes days or weeks', 'Email uses paper', 'Letters are more private', 'Email needs a stamp'], 0,
    'The biggest advantage of email is speed — a message is delivered in seconds, no matter how far away the person is. A posted letter can take days or even weeks to arrive.'),
  t(4, "## The Internet\n\nThe **Internet** is a global network of computers connected to each other. It allows people to share information, communicate, and access services from anywhere in the world.\n\n### How We Use the Internet\n\n| Use | Examples |\n|-----|----------|\n| **Communication** | Email, WhatsApp, video calls (Zoom) |\n| **Information** | Google search, Wikipedia, news websites |\n| **Education** | Online lessons, educational videos, e-books |\n| **Entertainment** | YouTube, music streaming, games |\n| **Shopping** | Online stores (Takealot, Amazon) |\n| **Banking** | Online banking, EFT payments, e-wallet |\n\n### The Internet in South Africa\n\n- Most South Africans access the internet on their **cell phones** (not computers)\n- **Data costs** are a challenge — the #DataMustFall campaign fought for cheaper data\n- **WiFi hotspots** in libraries, malls, and some townships help people get online\n- **Online schooling** became very important during COVID-19, but many learners in rural areas could not access it\n\n### What You Need to Access the Internet\n\n1. A **device** (phone, tablet, laptop, or computer)\n2. A **connection** (WiFi, mobile data, or fibre)\n3. A **browser** (Chrome, Safari, Edge) or an **app**"),
  fb(5, 'The Internet is a global network of ___ connected to each other. Most South Africans access the internet using their ___.',
    ['computers', 'cell phones'],
    'The Internet connects computers (and devices) worldwide, allowing people to share information. In South Africa, cell phones are the most common way people access the internet, since not everyone has a computer or laptop.'),
  t(6, "## Responsible Use of Technology\n\nTechnology is a powerful tool, but it must be used **responsibly**.\n\n### Digital Citizenship\n\nA **digital citizen** is someone who uses technology and the internet in a responsible, respectful, and safe way.\n\n### Rules for Responsible Use\n\n| Rule | Why it matters |\n|------|---------------|\n| **Be kind online** | Cyberbullying hurts people just like real-world bullying |\n| **Think before you post** | Once something is online, it is very hard to remove |\n| **Do not share personal information** | Strangers could use it to find or trick you |\n| **Respect other people's work** | Do not copy someone's writing or pictures without permission |\n| **Use reliable sources** | Not everything online is true — check the facts |\n| **Balance screen time** | Too much time on devices is bad for your eyes, sleep, and health |\n\n### Cyberbullying\n\n**Cyberbullying** is using technology to hurt, embarrass, or threaten someone. This includes:\n- Sending mean messages\n- Sharing embarrassing photos\n- Spreading rumours online\n- Leaving someone out of group chats on purpose\n\n**If you are cyberbullied:**\n1. Do not respond\n2. Take a screenshot as evidence\n3. Block the person\n4. Tell a trusted adult (parent, teacher, counsellor)"),
  q(7, 'What should you do first if someone is cyberbullying you?',
    ['Do not respond and tell a trusted adult', 'Send a mean message back', 'Delete your account', 'Ignore it forever'], 0,
    'If you are cyberbullied, do not respond (this can make it worse). Take a screenshot for evidence, block the person, and tell a trusted adult like a parent or teacher. You should never suffer in silence.'),
  t(8, "## Staying Safe Online\n\nThe internet can be a dangerous place if you are not careful. Here are important safety rules:\n\n### Online Safety Rules\n\n| Rule | Explanation |\n|------|-------------|\n| **Never share your full name, address, school name, or phone number** | Strangers could use this information to find you |\n| **Never meet someone in person that you only know online** | They may not be who they say they are |\n| **Use strong passwords** | A strong password has letters, numbers, and symbols (e.g. *S@fety123!*) |\n| **Do not click on links from strangers** | They could contain viruses or steal your information |\n| **Log out of accounts on shared devices** | Otherwise someone else could use your account |\n| **Tell an adult if something makes you uncomfortable** | Adults can help you deal with online threats |\n\n### What Makes a Strong Password?\n\n| Weak password | Strong password | Why |\n|--------------|----------------|-----|\n| 123456 | Th3C@p3!2024 | Uses letters, numbers, symbols, and is long |\n| password | MyD0g$pOt! | Does not use common words |\n| your name | Kw@Zulu99# | Does not include personal information |\n\n### South African Laws\n\nSouth Africa has laws to protect people online:\n- **POPIA** (Protection of Personal Information Act): Protects your personal data\n- **Cybercrimes Act**: Makes cyberbullying, hacking, and online fraud illegal"),
  fb(9, 'A strong password should include letters, ___, and symbols. The South African law that protects your personal information online is called ___.',
    ['numbers', 'POPIA'],
    'Strong passwords combine letters, numbers, and symbols to make them hard to guess. POPIA (Protection of Personal Information Act) is the South African law that protects your personal data from being misused.'),
  q(10, 'Why should you never share your home address or school name online?',
    ['Strangers could use the information to find you', 'It takes too long to type', 'Your friends already know it', 'It uses too much data'], 0,
    'Sharing personal information like your address or school name is dangerous because strangers online could use it to locate you in real life. Always keep personal details private to stay safe.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE INSERTION
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 5
  let gradeDoc = await db.collection('grades').findOne({ orderIndex: 5, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 5:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 5', schoolId: SCHOOL_ID, orderIndex: 5,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 5:', String(GRADE_ID));
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
  const tags = ['grade-5', 'technology', 'caps'];
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
      title: 'Chapter 1: The Design Process (IDMEC)',
      description: 'Introduction to the IDMEC design process (Investigate, Design, Make, Evaluate, Communicate), writing design briefs, specifications and constraints, evaluation matrices, flow charts, sketching ideas, safe working practices, and communicating results.',
      order: 1,
      lessons: [
        { title: 'Introduction to IDMEC', description: 'What is technology, the five IDMEC steps, investigating problems, analysing existing products, writing design briefs, specifications vs constraints, sketching ideas, making safely, evaluating, and communicating.', blocks: ch1_lesson1, term: 1 },
        { title: 'Applying IDMEC — Briefs, Sketches, and Evaluation', description: 'Putting IDMEC into practice with a real project, writing design briefs, sketching two ideas, evaluation matrices, flow charts, evaluating products against specifications, communicating and budgeting.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Structures',
      description: 'Natural vs human-made structures, three types (shell, frame, solid), forces on structures (compression, tension, bending), loads, triangulation, stability, corrugation, bridges and buildings in South Africa.',
      order: 2,
      lessons: [
        { title: 'Types of Structures and What Makes Them Strong', description: 'Natural vs human-made structures, shell/frame/solid structures, compression/tension/bending, dead and live loads, triangulation, wider bases, corrugation, stability, famous SA structures.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Materials Around Us',
      description: 'Common materials (wood, metal, plastic, glass, fabric, paper, rubber, ceramic), natural vs synthetic materials, properties of materials, choosing the right material, South African resources, recycling and the three Rs.',
      order: 3,
      lessons: [
        { title: 'Different Materials and Their Properties', description: 'Common materials and where they come from, natural vs synthetic, key properties (strong, flexible, waterproof, transparent, conductor, insulator), choosing materials, SA resources, recycling codes, the three Rs.', blocks: ch3_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 4: Processing Materials',
      description: 'How materials are changed (cutting, shaping, joining, finishing), measuring and marking, tools and safety, joining methods, finishing techniques, making products from recycled materials.',
      order: 4,
      lessons: [
        { title: 'Changing Materials — Cutting, Shaping, Joining, Finishing', description: 'Four processing methods, cutting tools and safety, measuring and marking, shaping techniques (folding, bending, rolling, moulding), joining methods (glue, tape, nails, screws), finishing and decorating, recycled materials.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Levers and Movement',
      description: 'Simple machines, what is a lever, fulcrum/load/effort, three classes of levers, everyday levers (scissors, wheelbarrow, tongs), the rule of levers, making a simple catapult.',
      order: 5,
      lessons: [
        { title: 'What Is a Lever?', description: 'Simple machines, parts of a lever (fulcrum, load, effort), first/second/third-class levers, everyday examples, levers in South Africa, the lever rule, building a simple catapult.', blocks: ch5_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 6: Wheels and Axles',
      description: 'How wheels and axles work, gears and gear ratios, pulleys (fixed and movable), how they help move things, bicycles as machines, vehicles and transport in South Africa.',
      order: 6,
      lessons: [
        { title: 'How Wheels, Axles, Gears, and Pulleys Work', description: 'Wheel and axle parts and examples, gears and gear ratios, fixed and movable pulleys, bicycles as simple machines, transport in South Africa, making a wheeled vehicle.', blocks: ch6_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 7: Electricity Basics',
      description: 'What is electricity, batteries and power stations, electric circuits, switches and bulbs, conductors and insulators, building a simple circuit, electrical safety, load shedding safety.',
      order: 7,
      lessons: [
        { title: 'Circuits, Conductors, Insulators, and Safety', description: 'What is electricity, sources of electricity in SA, simple circuits, parts of a circuit, conductors and insulators, switches, how a light bulb works, building a circuit, electrical safety rules, load shedding safety.', blocks: ch7_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 8: Communication and Technology',
      description: 'How technology helps us communicate, old vs new communication technology, the Internet, responsible use of technology, digital citizenship, cyberbullying, staying safe online, strong passwords, South African laws (POPIA, Cybercrimes Act).',
      order: 8,
      lessons: [
        { title: 'How Technology Helps Us Communicate', description: 'Types of communication, history of communication technology, old vs new technology, the Internet in SA, digital citizenship, cyberbullying, online safety rules, strong passwords, POPIA and Cybercrimes Act.', blocks: ch8_lesson1, term: 4 },
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
    title: 'Grade 5 Technology \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering the Design Process (IDMEC), Structures (shell, frame, solid), Materials Around Us (properties, natural vs synthetic), Processing Materials (cutting, shaping, joining, finishing), Levers and Movement (three classes, everyday levers), Wheels and Axles (gears, pulleys, transport), Electricity Basics (circuits, conductors, insulators, safety), and Communication and Technology (Internet, digital citizenship, cybersafety) for Grade 5 Technology.',
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
  console.log('  TEXTBOOK: Grade 5 Technology');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
