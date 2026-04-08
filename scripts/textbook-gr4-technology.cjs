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
// CHAPTER 1: What Is Technology? (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch1_lesson1 = [
  t(1, "## What Is Technology?\n\nLook around you right now. The chair you sit on, the clothes you wear, the pencil in your hand — somebody had to **think of** each of these things and then **make** them. That is technology!\n\n**Technology** means using knowledge and skills to make things that help people. It is not just computers and phones. Technology is anything that people have designed and built to solve a problem or make life easier.\n\n### Examples of Technology\n\n| Object | Problem It Solves |\n|--------|-------------------|\n| A spoon | Helps us eat hot food without burning our fingers |\n| A roof | Keeps rain and sun off our heads |\n| A bridge | Lets us cross a river safely |\n| A blanket | Keeps us warm at night |\n| Glasses | Helps people see clearly |"),
  t(2, "## Natural vs Human-Made Objects\n\nSome things around us are **natural** — they come from nature. Other things are **human-made** — people designed and built them.\n\n| Natural Objects | Human-Made Objects |\n|----------------|--------------------|\n| A tree | A wooden table |\n| A river | A dam |\n| A rock | A brick wall |\n| Animal skin | A leather shoe |\n| Cotton plant | A cotton shirt |\n\nNotice something interesting: many human-made objects start from natural things! A wooden table comes from a tree. A brick comes from clay found in the ground. People take natural materials and change them into useful objects.\n\n### Technology in South Africa\n\nSouth Africans have used technology for a very long time:\n\n- The **San people** made arrows with stone tips for hunting thousands of years ago.\n- The people of **Mapungubwe** in Limpopo made gold jewellery over 800 years ago.\n- Today, South African engineers build roads, design solar panels, and create apps for cell phones."),
  q(3, 'Which of these is a natural object?',
    ['A rock', 'A pencil', 'A shoe', 'A window'], 0,
    'A rock comes from nature — nobody made it. A pencil, shoe, and window are all human-made objects that people designed and built.'),
  t(4, "## Things People Have Made\n\nLook at the world around you. Almost everything you can see has been made by people using technology.\n\n### Buildings\n\nPeople build houses, schools, shops, and hospitals. In South Africa you can see many kinds of buildings:\n- **Rondavels** — round houses with thatched roofs, used for hundreds of years\n- **RDP houses** — small brick houses built by the government\n- **Skyscrapers** — tall buildings like the ones in Johannesburg and Cape Town\n\nAll of these were designed to keep people safe and dry.\n\n### Tools\n\nTools help us do work. A hammer helps us bang in a nail. A pair of scissors helps us cut paper. Even a simple stick used to dig a hole is a tool!\n\n### Clothes\n\nClothes protect our bodies from cold, heat, and rain. Different clothes are made for different jobs:\n- A raincoat keeps you dry\n- A warm jersey keeps you warm in winter\n- A hard hat protects a builder's head\n\n### Phones and Computers\n\nThese are newer kinds of technology. They help people talk to each other, learn new things, and do their work."),
  fb(5, 'Technology means using knowledge and skills to ___ things that help people. A rock is a ___ object, but a brick is a human-made object.',
    ['make', 'natural'],
    'Technology is about making things that solve problems. Natural objects come from nature without human help, while human-made objects are designed and built by people.'),
  t(6, "## Why Do People Make Things?\n\nPeople make things because they have **needs** and **wants**.\n\n**Needs** are things we must have to survive:\n- Food and water\n- Shelter (a place to live)\n- Clothing\n\n**Wants** are things we would like to have but do not need to survive:\n- A television\n- A toy\n- A fancy pair of shoes\n\n### Solving Problems\n\nEvery object that people make solves a problem. When you look at any object, ask yourself: *What problem does this solve?*\n\n| Object | Need or Want? | Problem It Solves |\n|--------|--------------|-------------------|\n| A water bottle | Need | Carrying clean water to drink |\n| A toy car | Want | Having fun and playing |\n| A school bag | Need | Carrying books and lunch to school |\n| A television | Want | Entertainment and learning |"),
  q(7, 'A learner says: "Technology is only about computers." Is this correct?',
    ['No — technology includes anything people have designed and made to solve a problem', 'Yes — technology only means electronics', 'Yes — only computers and phones are technology', 'No — technology only means old things like stone tools'], 0,
    'Technology is much more than computers. It includes everything people have designed and made — from a simple spoon to a tall building. Computers are just one type of technology.'),
  q(8, 'Which of these is a NEED and not a want?',
    ['Shelter', 'A toy', 'A television', 'A skateboard'], 0,
    'Shelter is a basic need — we must have a place to live to survive. A toy, television, and skateboard are all wants — nice to have, but we can survive without them.'),
  fb(9, 'The San people made ___ with stone tips for hunting. The people of Mapungubwe made gold ___ over 800 years ago.',
    ['arrows', 'jewellery'],
    'The San people used stone-tipped arrows for hunting, showing early technology in South Africa. The Mapungubwe people made beautiful gold jewellery, proving that South Africans have been skilled makers for centuries.'),
  q(10, 'Why did people first build shelters?',
    ['To protect themselves from rain, cold, and danger', 'To show off to their neighbours', 'Because they were bored', 'To store their computers'], 0,
    'People built shelters to protect themselves from weather (rain, cold, heat) and from danger (wild animals). Shelter is one of our basic needs for survival.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: The Design Process (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch2_lesson1 = [
  t(1, "## The Design Process\n\nWhen you want to make something in Technology class, you do not just grab materials and start building. You follow **four steps** called the **Design Process**:\n\n| Step | What You Do |\n|------|-------------|\n| 1. **Investigate** | Find out about the problem. Ask questions. Look at things people have already made. |\n| 2. **Design** | Draw pictures of your ideas. Choose the best idea. |\n| 3. **Make** | Gather your materials and tools. Build your product. |\n| 4. **Evaluate** | Test your product. Does it work? What could be better? |\n\nThese four steps help you think carefully before you build. This saves time and helps you make something that really works."),
  t(2, "## Step 1: Investigate\n\nThe first step is to **ask questions** and **find out** about the problem you need to solve.\n\n### Questions to Ask\n\n- What is the problem?\n- Who has this problem?\n- What do they need?\n- Has anyone tried to solve this problem before?\n- What materials can I use?\n\n### Example\n\n> *Your teacher says: \"Grade 4 learners need something to carry their pencils and crayons neatly.\"*\n\nYou investigate by:\n- Looking at pencil cases in the shops\n- Asking your classmates what they like and dislike about their pencil bags\n- Checking what recycled materials you can find at home\n\n### Looking at Existing Products\n\nWhen you look at something that already exists, think about:\n- Does it work well?\n- Is it strong enough?\n- Is it the right size?\n- Does it look nice?\n- Is it safe (no sharp edges)?"),
  q(3, 'What is the FIRST step of the Design Process?',
    ['Investigate', 'Design', 'Make', 'Evaluate'], 0,
    'The Design Process starts with Investigate. You must find out about the problem before you can design a solution. The four steps in order are: Investigate, Design, Make, Evaluate.'),
  t(4, "## Step 2: Design\n\nAfter investigating, it is time to **draw your ideas**.\n\n### Drawing Your Ideas\n\nYou should draw at least **two different ideas** for solving the problem. For each drawing:\n- Use a **pencil** so you can fix mistakes\n- **Label** the parts (write what each part is)\n- Show the **size** if you can (for example, \"20 cm long\")\n- Write what **materials** you will use\n\n### Example: Pencil Holder Ideas\n\n**Idea A:** A cardboard tube covered in colourful paper, with a cardboard circle glued to the bottom.\n\n**Idea B:** A plastic bottle cut in half, decorated with paint and stickers.\n\n### Choosing the Best Idea\n\nAfter drawing your ideas, pick the one that:\n- Solves the problem best\n- Uses materials you can find easily\n- Is safe and strong enough\n- You have enough time to build"),
  fb(5, 'In the Design step, you should draw at least ___ different ideas. You should use a ___ so you can fix mistakes.',
    ['two', 'pencil'],
    'Drawing at least two different ideas helps you compare and choose the best one. Using a pencil means you can erase and correct mistakes easily.'),
  t(6, "## Step 3: Make\n\nNow it is time to **build** your product!\n\n### Before You Start Building\n\n1. Gather all your **materials** (cardboard, paper, glue, paint, etc.)\n2. Gather all your **tools** (scissors, ruler, pencil, etc.)\n3. Make sure your workspace is clean and tidy\n\n### Safety Rules\n\nSafety is very important when you make things:\n\n| Rule | Why It Matters |\n|------|----------------|\n| Always cut **away** from your body | If the scissors slip, they move away from you |\n| Hold materials **still** before cutting | Stops them from sliding and causing accidents |\n| Keep your table **tidy** | You will not knock things over or trip |\n| Ask a teacher for help with **difficult cuts** | Some materials are hard to cut safely |\n\n### Building Step by Step\n\nFollow your design drawing. Work slowly and carefully. It is better to take your time and do it right than to rush and make mistakes."),
  q(7, 'Why should you always cut AWAY from your body?',
    ['If the scissors slip, they move away from you instead of towards you', 'It makes the cut look neater', 'The teacher said so', 'It is faster'], 0,
    'Cutting away from your body is a safety rule. If your scissors or knife slips, it will move away from you instead of towards you. This helps prevent cuts and injuries.'),
  t(8, "## Step 4: Evaluate\n\nAfter you have made your product, you must **test** it and think about how well it works.\n\n### Questions to Ask When Evaluating\n\n- Does my product do what it is supposed to do?\n- Is it strong enough?\n- Does it look neat and nice?\n- What works well?\n- What could I do better next time?\n\n### Example: Evaluating the Pencil Holder\n\n> *\"My pencil holder stands up on its own and holds 12 pencils. That is good. But the bottom is a bit wobbly. Next time I would use thicker cardboard for the base to make it more steady.\"*\n\nThis is a **good** evaluation because it says:\n- What works well (stands up, holds pencils)\n- What needs improving (wobbly base)\n- How to fix it next time (thicker cardboard)\n\n### Sharing Your Work\n\nAfter evaluating, you can show your product to the class. Tell them:\n- What problem you solved\n- What materials you used\n- What you would change next time"),
  fb(9, 'The four steps of the Design Process are Investigate, Design, ___, and ___.',
    ['Make', 'Evaluate'],
    'The Design Process has four steps: Investigate (find out about the problem), Design (draw your ideas), Make (build it), and Evaluate (test it and see what works).'),
  q(10, 'A learner builds a pencil holder. It falls over easily. She writes: "Next time I will make the base wider." Which step is she doing?',
    ['Evaluate', 'Investigate', 'Design', 'Make'], 0,
    'She is evaluating her product. She tested it (it falls over) and thought about how to improve it (wider base). Evaluation means checking what works and what needs to be better.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Materials and Their Uses (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch3_lesson1 = [
  t(1, "## Different Materials\n\nEverything around you is made from **materials**. A material is what an object is made of. Different materials have different properties (qualities), so we choose different materials for different jobs.\n\n### Six Common Materials\n\n| Material | What It Is | Examples |\n|----------|-----------|----------|\n| **Wood** | Comes from trees | Tables, doors, pencils |\n| **Plastic** | Made in factories from oil | Bottles, bags, toys |\n| **Metal** | Comes from rocks in the ground | Pots, nails, coins |\n| **Paper** | Made from wood pulp | Books, newspapers, boxes |\n| **Fabric** | Made from cotton, wool, or synthetic fibres | Clothes, curtains, bags |\n| **Glass** | Made from sand heated to very high temperatures | Windows, bottles, mirrors |\n\n### Where Do Materials Come From?\n\nSome materials come directly from nature:\n- **Wood** comes from trees\n- **Cotton** grows on plants\n- **Wool** comes from sheep\n- **Metal** comes from rocks called **ore**\n\nOther materials are made by people in factories:\n- **Plastic** is made from oil\n- **Glass** is made from melted sand"),
  t(2, "## Choosing the Right Material\n\nWhen you design something, you must choose the **best material** for the job. Each material has special **properties** (qualities) that make it good for some jobs and bad for others.\n\n### Properties of Materials\n\n| Property | What It Means | Example |\n|----------|--------------|----------|\n| **Strong** | Hard to break | Metal is strong — good for bridges |\n| **Flexible** | Can bend without breaking | Fabric is flexible — good for clothes |\n| **Waterproof** | Water cannot pass through it | Plastic is waterproof — good for raincoats |\n| **Transparent** | You can see through it | Glass is transparent — good for windows |\n| **Light** | Does not weigh much | Paper is light — good for kites |\n| **Heavy** | Weighs a lot | Metal is heavy — good for anchors |\n\n### Choosing Materials — Think About the Job!\n\n- A **window** must be transparent, so we use **glass**.\n- A **raincoat** must be waterproof, so we use **plastic**.\n- A **bridge** must be strong, so we use **metal** and concrete.\n- A **jersey** must be warm and flexible, so we use **wool** or fabric.\n- A school **bag** must be strong and light, so we use tough fabric or nylon."),
  q(3, 'Why is glass a good material for windows?',
    ['Because glass is transparent — you can see through it', 'Because glass is flexible', 'Because glass is the cheapest material', 'Because glass is the strongest material'], 0,
    'Glass is used for windows because it is transparent, which means light can pass through it and you can see through it. This is the most important property needed for a window.'),
  t(4, "## Materials in South Africa\n\nSouth Africa is rich in natural materials:\n\n- **Gold** is mined in Gauteng (Johannesburg was built because of gold!)\n- **Iron** is mined in Limpopo and the Northern Cape\n- **Wood** comes from timber plantations in Mpumalanga and KwaZulu-Natal\n- **Cotton** is grown in Limpopo and the Free State\n- **Sand** for making glass and concrete is found in many provinces\n\n### From Raw Material to Finished Product\n\nMaterials go through many steps before they become useful objects:\n\n1. **Raw material** is collected (a tree is cut down)\n2. The material is **processed** (the tree is cut into planks at a sawmill)\n3. The planks are **shaped** (a carpenter cuts and sands them)\n4. The finished product is **made** (the planks become a table)\n\nEach step adds value. A tree trunk is worth less money than a beautiful wooden table, even though they are made from the same material."),
  fb(5, 'Glass is made from ___ heated to very high temperatures. Gold is mined in the province of ___.',
    ['sand', 'Gauteng'],
    'Glass is made by heating sand to extremely high temperatures until it melts and becomes clear. Gold mining in Gauteng is what led to the building of Johannesburg — the City of Gold.'),
  t(6, "## Recycling Materials\n\nWhen we throw things away, they end up in **landfills** (rubbish dumps). This is bad for the environment because:\n- Landfills take up a lot of space\n- Some materials (like plastic) take hundreds of years to break down\n- Rubbish can pollute rivers and the ocean\n\n### The Three Rs\n\nThe **three Rs** help us reduce waste:\n\n| R | What It Means | Example |\n|---|--------------|----------|\n| **Reduce** | Use less | Use both sides of paper instead of one |\n| **Reuse** | Use again | Turn an old jar into a pencil holder |\n| **Recycle** | Make into something new | Old plastic bottles are melted and made into new bottles |\n\n### Recycling in South Africa\n\nSouth Africa recycles many materials:\n- **Paper** — old newspapers become new paper products\n- **Glass** — broken bottles are melted and made into new glass\n- **Metal** — old cans are melted and used again\n- **Plastic** — some plastics can be melted and remade\n\nMany communities in South Africa collect recyclable waste. This creates **jobs** for waste collectors and helps the environment at the same time."),
  q(7, 'A learner uses an old jam jar to hold her paintbrushes. Which of the three Rs is she using?',
    ['Reuse', 'Reduce', 'Recycle', 'Remove'], 0,
    'She is reusing the jar. Reuse means using an object again for the same or a different purpose instead of throwing it away. She did not melt the jar down (recycle) — she used it as it is.'),
  q(8, 'Which material would be BEST for making a raincoat?',
    ['Plastic', 'Paper', 'Wood', 'Glass'], 0,
    'Plastic is waterproof, which means water cannot pass through it. This makes it the best choice for a raincoat. Paper would get soggy, wood is too stiff, and glass would break.'),
  fb(9, 'The three Rs are Reduce, ___, and Recycle. Plastic takes ___ of years to break down in a landfill.',
    ['Reuse', 'hundreds'],
    'The three Rs — Reduce, Reuse, Recycle — help us create less waste. Plastic is especially harmful because it takes hundreds of years to break down, polluting the environment for a very long time.'),
  q(10, 'Why is metal a good material for cooking pots?',
    ['Metal is strong and can handle high heat without burning', 'Metal is see-through', 'Metal is the lightest material', 'Metal is soft and flexible'], 0,
    'Metal is strong and can withstand high temperatures from a stove or fire without melting or burning. It also conducts heat well, which helps cook food evenly. These properties make it ideal for pots.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Structures That Stand (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch4_lesson1 = [
  t(1, "## What Is a Structure?\n\nA **structure** is anything that is built to stand up and support a weight. Structures are all around you!\n\n### Examples of Structures\n\n| Structure | What It Supports |\n|-----------|------------------|\n| A house | The roof, walls, and the people inside |\n| A table | Books, plates, and other objects |\n| A bridge | Cars, trucks, and people crossing |\n| A shelf | Books and ornaments |\n| Your body | Your skeleton is a structure that holds you up! |\n\n### Natural and Human-Made Structures\n\nSome structures are found in nature:\n- A spider's web\n- A bird's nest\n- A cave\n- A tortoise's shell\n\nOther structures are built by people:\n- Houses, schools, and hospitals\n- Bridges and roads\n- Fences and walls\n- The Nelson Mandela Bridge in Johannesburg"),
  t(2, "## What Makes Structures Strong?\n\nNot all structures are equally strong. Some fall down easily, while others stand for many years. Here are three things that make a structure strong:\n\n### 1. A Wide Base\n\nA structure with a **wide base** (bottom) is harder to push over than one with a narrow base. Think of a pyramid — it has a very wide base and a small top. That is why the pyramids in Egypt are still standing after thousands of years!\n\n**Try this:** Stand a pencil on its tip. It falls over easily. Now stand it on its flat end. It is much more stable.\n\n### 2. Triangles\n\n**Triangles are the strongest shape in building.** When you push on a triangle, the force spreads to all three sides. A square can be pushed into a diamond shape, but a triangle keeps its shape.\n\nLook at bridges, electricity pylons, and roof trusses — they all use triangles!\n\n### 3. Thick, Strong Walls\n\nThicker walls are harder to push over or break. That is why castle walls were very thick — to protect the people inside."),
  q(3, 'Why is a triangle a strong shape for building?',
    ['When you push on it, the force spreads to all three sides and it keeps its shape', 'Because triangles are the biggest shape', 'Because triangles use the most material', 'Because triangles are easy to draw'], 0,
    'A triangle is the strongest shape because when a force pushes on one side, the force spreads along all three sides. Unlike a square, which can be pushed into a diamond shape, a triangle cannot be deformed without breaking a side.'),
  t(4, "## Building with Blocks and Straws\n\nIn Technology class, you will build models of structures using simple materials like blocks, straws, cardboard, and glue.\n\n### Building with Blocks\n\nWhen stacking blocks:\n- Start with the **biggest blocks at the bottom** (wide base)\n- Make sure blocks are **level** (flat and even)\n- **Overlap** blocks like bricks in a wall — this is called **bonding** and it makes the wall stronger\n\n### Building with Straws\n\nStraws are great for building frames:\n- Join straws with **tape**, **pins**, or **modelling clay**\n- Use **triangles** in your frame to make it strong\n- A straw frame with triangle shapes will be much stronger than one with only squares\n\n### Testing Your Structure\n\nAfter building, test your structure:\n- Can it stand on its own?\n- Can it hold weight? (Try putting a book on top)\n- Does it wobble or lean?\n- What happens if you gently push it from the side?"),
  fb(5, 'A structure with a ___ base is harder to push over. The strongest shape for building is a ___.',
    ['wide', 'triangle'],
    'A wide base gives a structure stability, making it harder to tip over. Triangles are the strongest building shape because they hold their form under pressure — the force spreads evenly to all three sides.'),
  t(6, "## Structures in South Africa\n\nSouth Africa has many amazing structures:\n\n| Structure | Where | What Makes It Special |\n|-----------|-------|----------------------|\n| **Castle of Good Hope** | Cape Town | The oldest building in South Africa (built in 1666). Very thick stone walls. |\n| **Nelson Mandela Bridge** | Johannesburg | A beautiful cable-stayed bridge that uses steel cables in triangle shapes. |\n| **Moses Mabhida Stadium** | Durban | A huge arch structure that holds up the roof of the stadium. |\n| **Traditional rondavels** | All across SA | Round houses with cone-shaped thatched roofs. The round shape makes them strong against wind. |\n\n### Why Are Rondavels Round?\n\nA rondavel (round house) is strong because:\n- The round walls share the weight **evenly** — no weak corners\n- Wind flows **around** the building instead of pushing against a flat wall\n- The cone-shaped roof lets rain run off easily"),
  q(7, 'Why are traditional rondavels round?',
    ['The round shape is strong because it shares weight evenly and wind flows around it', 'Round buildings use less paint', 'It is easier to draw a circle than a square', 'Round buildings are always bigger'], 0,
    'Rondavels are round because the circular shape shares forces evenly — there are no weak corners. Wind flows smoothly around a round building instead of pushing hard against a flat wall, making it very stable.'),
  q(8, 'Why do builders overlap bricks like a zigzag pattern instead of stacking them straight on top of each other?',
    ['Overlapping (bonding) makes the wall stronger because the bricks lock together', 'It uses more bricks and costs more money', 'It looks prettier', 'It is easier and faster to build'], 0,
    'When bricks overlap (called bonding), each brick locks with the ones around it. This spreads forces across many bricks. If bricks were stacked straight up, a crack could run straight down the wall and break it apart.'),
  fb(9, 'The Castle of Good Hope in Cape Town is the ___ building in South Africa. The Nelson Mandela Bridge uses steel cables arranged in ___ shapes.',
    ['oldest', 'triangle'],
    'The Castle of Good Hope was built in 1666, making it the oldest building in South Africa. The Nelson Mandela Bridge uses triangular cable arrangements because triangles are the strongest shape for structures.'),
  q(10, 'A learner builds a tower from blocks. It keeps falling over. What should she do to make it more stable?',
    ['Make the base wider', 'Make the base narrower', 'Use fewer blocks', 'Build it taller'], 0,
    'A wider base makes a structure more stable because the weight is spread over a larger area. A narrow base, fewer blocks, or extra height would all make the tower less stable and more likely to fall.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Simple Machines (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch5_lesson1 = [
  t(1, "## What Is a Simple Machine?\n\nA **simple machine** is a tool that makes work easier. It helps you push, pull, or lift things using less effort.\n\nThere are different types of simple machines. In Grade 4, we will learn about three of them:\n\n| Simple Machine | What It Does | Everyday Example |\n|---------------|-------------|------------------|\n| **Lever** | Helps you lift or move things | A seesaw, a bottle opener |\n| **Wheel and axle** | Helps you move things along the ground | A wheelbarrow, a bicycle |\n| **Ramp (inclined plane)** | Helps you move things up to a higher place | A ramp at a shop entrance, a slide |\n\nSimple machines do not have engines or batteries. They use the force of your body (pushing or pulling) but make the job easier."),
  t(2, "## Levers\n\nA **lever** is a bar or stick that rests on a point. When you push down on one end, the other end goes up. This helps you lift heavy things.\n\n### Parts of a Lever\n\n| Part | What It Is |\n|------|------------|\n| **Bar** (the lever itself) | The long, stiff part that moves |\n| **Fulcrum** | The point where the lever rests and turns |\n| **Load** | The heavy thing you are trying to move |\n| **Effort** | The force YOU use to push or pull the lever |\n\n### Examples of Levers\n\n- A **seesaw** on the playground — when one child pushes down, the other child goes up. The middle pole is the fulcrum.\n- A **bottle opener** — the edge of the cap is the fulcrum. You push down on the handle (effort) and the cap pops off (load).\n- A **spade** when digging — you push the handle, and the blade lifts dirt.\n- **Scissors** — two levers joined together at a fulcrum (the screw in the middle)."),
  q(3, 'What is the fulcrum of a seesaw?',
    ['The middle point where the seesaw rests and turns', 'The children sitting on it', 'The ground underneath', 'The handles at each end'], 0,
    'The fulcrum is the point where a lever rests and turns. On a seesaw, this is the middle bar or pole that the plank balances on. When one side goes down, the other goes up because of the fulcrum.'),
  t(4, "## Wheels and Axles\n\nA **wheel** is a round object that turns on a rod called an **axle**. Wheels make it easier to move heavy things because they reduce friction (rubbing against the ground).\n\n### How Wheels Help\n\nImagine trying to drag a heavy box across the classroom floor. It is very hard! Now imagine putting the box on a trolley with wheels. Much easier!\n\nWithout wheels, you must fight against **friction** — the force that slows things down when they rub together. Wheels roll smoothly, so there is much less friction.\n\n### Examples of Wheels and Axles\n\n| Object | How Wheels Help |\n|--------|----------------|\n| **Wheelbarrow** | You can move heavy soil, bricks, or sand easily |\n| **Bicycle** | You can travel faster and farther than walking |\n| **Shopping trolley** | You can carry heavy groceries without lifting them |\n| **Car** | You can travel long distances quickly |\n| **Office chair** | You can roll to different desks easily |\n\n### The Axle\n\nThe **axle** is the rod that goes through the middle of the wheel. When the wheel turns, it turns around the axle. Without an axle, the wheel would just roll away!"),
  fb(5, 'A lever rests on a point called the ___. Wheels reduce ___, which is the force that slows things down when surfaces rub together.',
    ['fulcrum', 'friction'],
    'The fulcrum is the turning point of a lever. Friction is the force that makes it hard to slide objects — wheels reduce friction by rolling instead of sliding, making movement much easier.'),
  t(6, "## Ramps (Inclined Planes)\n\nA **ramp** (also called an **inclined plane**) is a flat surface that slopes upward. It helps you move things to a higher place without lifting them straight up.\n\n### How Ramps Help\n\nLifting a heavy box straight up onto a table is hard. But if you slide it up a ramp, it is much easier! You use less force, but you move the box over a longer distance.\n\n### Examples of Ramps\n\n| Ramp | How It Helps |\n|------|--------------|\n| **Wheelchair ramp** at a shop or school | People in wheelchairs can enter buildings without climbing stairs |\n| **Loading ramp** on a truck | Workers can roll heavy boxes into the truck instead of lifting them |\n| **A slide** on the playground | You slide down an inclined plane (and have fun!) |\n| **A road going up a mountain** | Cars drive up a gentle slope instead of climbing straight up |\n\n### Ramps in South Africa\n\nSouth African law says that all public buildings must have ramps so that people in wheelchairs can enter. This is part of making our country **accessible** for everyone."),
  q(7, 'Why is a ramp easier than lifting something straight up?',
    ['You use less force, even though the object travels a longer distance', 'Ramps are made of special material', 'Ramps are always shorter than stairs', 'Ramps only work for light objects'], 0,
    'A ramp lets you spread the effort over a longer distance. Instead of using a lot of force to lift something straight up, you use less force to push it along the sloped surface. The trade-off is that the path is longer.'),
  q(8, 'Which of these is NOT a simple machine?',
    ['A battery', 'A lever', 'A wheel and axle', 'A ramp'], 0,
    'A battery stores electrical energy — it is not a simple machine. Simple machines (lever, wheel and axle, ramp) use mechanical force to make work easier without any engine or electricity.'),
  fb(9, 'A ramp is also called an inclined ___. South African law says all public buildings must have ___ for people in wheelchairs.',
    ['plane', 'ramps'],
    'An inclined plane is the scientific name for a ramp — a flat surface that slopes upward. South Africa requires ramps in public buildings to ensure accessibility for everyone, including people who use wheelchairs.'),
  q(10, 'A worker needs to load heavy boxes onto a truck. Which simple machine would help the most?',
    ['A ramp', 'A seesaw', 'A bicycle', 'A pair of scissors'], 0,
    'A ramp (inclined plane) is the best choice. The worker can roll or slide the heavy boxes up the ramp into the truck instead of lifting them straight up. This uses much less effort.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Making Things Move (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch6_lesson1 = [
  t(1, "## Push and Pull\n\nEverything that moves needs a **force** to start moving. A force is a push or a pull.\n\n### Pushes and Pulls in Everyday Life\n\n| Action | Push or Pull? |\n|--------|---------------|\n| Kicking a soccer ball | Push |\n| Opening a drawer | Pull |\n| Throwing a ball | Push |\n| Pulling a wagon | Pull |\n| Pressing a button | Push |\n| Tugging a rope | Pull |\n\n### Important Rules About Forces\n\n- An object will not move unless a force acts on it (a ball sits still until you kick it)\n- A **bigger** force makes an object move **faster** (kick harder = ball goes further)\n- A force can **change direction** — hit a ball from the side and it changes where it goes\n- **Friction** slows things down — a ball rolling on grass stops sooner than one on a smooth floor"),
  t(2, "## Wheels and Axles for Movement\n\nWheels are one of the most important inventions in history. They make moving things across the ground much, much easier.\n\n### How Wheels Work\n\nWhen you push a box across the floor, the bottom of the box rubs against the floor. This creates **friction**, which makes it hard to move. When you put the box on wheels, the wheels **roll** instead of sliding. Rolling creates much less friction!\n\n### Parts of a Wheeled Vehicle\n\n| Part | What It Does |\n|------|-------------|\n| **Wheels** | Round parts that roll on the ground |\n| **Axle** | A rod connecting two wheels — when the axle turns, the wheels turn |\n| **Chassis** (body) | The frame that holds everything together |\n| **Load** | Whatever the vehicle carries (people, goods, etc.) |\n\n### Making Wheels Turn\n\nThere are different ways to make wheels turn:\n- **Push** the vehicle with your hand\n- **Wind** a rubber band around the axle — when it unwinds, the axle spins\n- An **engine** burns fuel to spin the axles (like a car)\n- **Pedals** turn a chain that turns the wheel (like a bicycle)"),
  q(3, 'Why do wheels make it easier to move heavy things?',
    ['Wheels roll instead of sliding, which creates less friction', 'Wheels are always made of rubber', 'Wheels make objects lighter', 'Wheels push back against the ground'], 0,
    'Wheels reduce friction because rolling creates much less resistance than sliding. When a heavy box slides on the floor, there is a lot of friction. Put it on wheels, and it rolls smoothly with much less effort.'),
  t(4, "## Making a Simple Vehicle\n\nIn Technology class, you can build a simple vehicle from recycled materials. Here is one way to do it:\n\n### Materials Needed\n\n- 1 small cardboard box (the chassis)\n- 4 bottle caps (the wheels)\n- 2 wooden skewers or straws (the axles)\n- Tape and glue\n- Rubber bands (optional — for power)\n\n### Steps to Build\n\n1. Poke two holes in each side of the cardboard box — one pair near the front, one pair near the back\n2. Push a skewer through the front pair of holes (this is the front axle)\n3. Push another skewer through the back pair of holes (this is the back axle)\n4. Attach a bottle cap wheel to each end of the skewers using tape or hot glue\n5. Make sure the wheels can spin freely\n6. Decorate your vehicle!\n\n### Making It Move\n\n- **Gravity power:** Put your vehicle at the top of a ramp and let it roll down\n- **Rubber band power:** Wrap a rubber band around the back axle and twist it. When you let go, the band unwinds and spins the axle, pushing the vehicle forward"),
  fb(5, 'A push or a pull is called a ___. The rod that connects two wheels together is called an ___.',
    ['force', 'axle'],
    'A force is any push or pull that can make an object start moving, stop moving, or change direction. The axle is the rod that connects a pair of wheels and allows them to turn together.'),
  t(6, "## Testing Movement\n\nOnce you have built your vehicle, you need to **test** it. Testing is part of the Evaluate step in the Design Process.\n\n### Fair Testing\n\nA **fair test** means you only change **one thing** at a time. If you change two things, you will not know which one made the difference.\n\n**Example:** You want to know if your vehicle rolls further on a smooth floor or on carpet.\n- Push the vehicle with the **same force** both times\n- Use the **same vehicle** both times\n- Only change the **surface** (floor or carpet)\n\n### What to Measure\n\n| What to Test | How to Measure |\n|-------------|----------------|\n| How far it goes | Use a ruler or tape measure from the start to where it stops |\n| How straight it goes | Does it roll in a straight line or veer to one side? |\n| How fast it goes | Time it with a stopwatch from start to finish |\n\n### Recording Your Results\n\nAlways write down your results in a **table**:\n\n| Surface | Distance Rolled |\n|---------|----------------|\n| Smooth floor | 2.5 metres |\n| Carpet | 1.2 metres |\n| Grass | 0.8 metres |\n\nThis shows that the vehicle rolls furthest on a smooth floor because smooth floors have less friction."),
  q(7, 'In a fair test, why should you only change ONE thing at a time?',
    ['So you know which change caused the different result', 'Because the teacher only allows one change', 'Because it is faster', 'Because two changes would break the vehicle'], 0,
    'If you change two things at once, you cannot tell which change caused the result to be different. A fair test changes only one variable so the cause and effect are clear.'),
  q(8, 'A vehicle rolls 3 metres on a smooth floor but only 1 metre on grass. Why?',
    ['Grass creates more friction than a smooth floor, so the vehicle slows down sooner', 'The vehicle is heavier on grass', 'Grass pushes the vehicle backward', 'The vehicle runs out of energy on grass'], 0,
    'Grass creates more friction because the wheels have to push through the blades of grass. On a smooth floor, there is less friction, so the vehicle rolls much further before friction slows it to a stop.'),
  fb(9, 'A fair test means you only change ___ thing at a time. A vehicle rolls further on a smooth floor because there is less ___.',
    ['one', 'friction'],
    'In a fair test, you change one variable so you can clearly see its effect. Smooth surfaces have less friction, allowing wheeled objects to roll further than on rough surfaces like carpet or grass.'),
  q(10, 'Which way of powering a simple vehicle uses gravity?',
    ['Placing it at the top of a ramp and letting it roll down', 'Winding a rubber band around the axle', 'Pushing it with your hand', 'Blowing on it with a fan'], 0,
    'Gravity pulls objects downward. When you place a vehicle at the top of a ramp, gravity pulls it down the slope, making it roll without any push from your hand. This is gravity-powered movement.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Electricity in Our Lives (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch7_lesson1 = [
  t(1, "## Where Does Electricity Come From?\n\n**Electricity** is a type of energy that powers many things in our lives — lights, fridges, televisions, computers, and much more.\n\nBut where does electricity come from?\n\n### Power Stations\n\nMost of South Africa's electricity comes from **power stations** run by **Eskom**. These power stations burn **coal** to heat water, which makes steam. The steam turns huge wheels called **turbines**, and the turbines generate electricity.\n\nThe electricity then travels along thick wires called **power lines** to our homes, schools, and shops.\n\n### Other Ways to Make Electricity\n\n| Source | How It Works |\n|--------|-------------|\n| **Solar panels** | Turn sunlight into electricity |\n| **Wind turbines** | The wind turns big blades that generate electricity |\n| **Dams** (hydroelectric) | Falling water spins turbines |\n| **Batteries** | Chemicals inside the battery create electricity |\n\nSouth Africa has big **solar farms** in the Northern Cape (where it is very sunny) and **wind farms** in the Eastern Cape and Western Cape."),
  t(2, "## What Uses Electricity?\n\nMany things in your home and school use electricity. Some plug into the wall (they use **mains electricity**) and some use **batteries**.\n\n### Mains Electricity vs Batteries\n\n| Mains Electricity (plug in the wall) | Batteries |\n|--------------------------------------|-----------|\n| Fridge | TV remote control |\n| Television | Torch (flashlight) |\n| Stove (electric) | Cell phone |\n| Lights | Toy car |\n| Washing machine | Watch |\n| Computer | Calculator |\n\n### Batteries\n\nA **battery** stores electricity inside chemicals. When you put a battery in a torch, the chemicals create a flow of electricity that powers the light bulb.\n\nBatteries come in different sizes:\n- **AAA** and **AA** — small, used in remotes and torches\n- **C** and **D** — bigger, used in radios and large toys\n- **9V** — rectangular, used in smoke alarms\n- **Rechargeable** — can be charged again and again (like your cell phone battery)\n\nWhen a battery runs out, the chemicals are used up. **Never throw batteries in the normal bin** — they contain harmful chemicals. Take them to a battery recycling point."),
  q(3, 'How do most power stations in South Africa generate electricity?',
    ['By burning coal to make steam that turns turbines', 'By using solar panels', 'By burning wood', 'By using wind turbines'], 0,
    'Most of South Africa\'s electricity comes from coal-fired power stations run by Eskom. Coal is burned to heat water into steam, and the steam turns turbines that generate electricity.'),
  t(4, "## Staying Safe Around Electricity\n\nElectricity is very useful, but it can also be very **dangerous**. Electricity can hurt or even kill you if you are not careful.\n\n### Safety Rules\n\n| Rule | Why It Is Important |\n|------|---------------------|\n| **Never touch** a plug, socket, or electrical wire with wet hands | Water helps electricity flow. Wet hands can give you a bad electric shock. |\n| **Never poke** anything into a plug socket | You could get electrocuted (a serious electric shock) |\n| **Never play** near power lines or electricity substations | Power lines carry very strong electricity that can kill |\n| **Never use** a broken plug or frayed wire | Damaged wires can spark, shock you, or start a fire |\n| **Switch off** appliances when not using them | Saves electricity and reduces fire risk |\n| **Keep water** away from electrical appliances | Water and electricity together are extremely dangerous |\n\n### What to Do in an Emergency\n\nIf someone gets an electric shock:\n1. **Do NOT touch them** — the electricity could flow into you too!\n2. Switch off the electricity at the plug or at the mains box\n3. Call an adult for help immediately\n4. Call emergency services: **10111** (police) or **10177** (ambulance)"),
  fb(5, 'Most of South Africa\'s electricity comes from power stations that burn ___. You should never touch electrical plugs with ___ hands.',
    ['coal', 'wet'],
    'Coal is the main fuel used in South Africa\'s power stations to generate electricity. Wet hands are dangerous near electricity because water conducts (carries) electricity, which means the shock can travel through the water to your body.'),
  t(6, "## Batteries and Circuits\n\nA **circuit** is a path that electricity follows. For electricity to flow, the circuit must be a **complete loop** — like a circle with no gaps.\n\n### A Simple Circuit\n\nA simple circuit has four parts:\n\n| Part | What It Does |\n|------|-------------|\n| **Battery** | Provides the electricity (the energy source) |\n| **Wires** | Carry the electricity from place to place |\n| **Switch** | Turns the circuit on (closed) or off (open) |\n| **Bulb** (or buzzer or motor) | Uses the electricity to do something (light up, make sound, spin) |\n\n### How It Works\n\n1. Electricity flows out of one end of the battery (the + end)\n2. It travels along the wire to the light bulb\n3. The electricity flows through the bulb, making it light up\n4. The electricity continues along the wire back to the other end of the battery (the - end)\n5. The loop is complete!\n\nIf you **break** the loop (disconnect a wire), the electricity **stops** flowing and the bulb goes out. A switch works by breaking or connecting the circuit."),
  q(7, 'What happens if you disconnect one wire in a simple circuit?',
    ['The electricity stops flowing and the bulb goes out', 'The bulb gets brighter', 'The battery charges faster', 'Nothing changes'], 0,
    'A circuit must be a complete loop for electricity to flow. If you disconnect even one wire, you break the loop and the electricity stops flowing. The bulb will go out because no electricity reaches it.'),
  q(8, 'Why should you NEVER poke anything into a plug socket?',
    ['You could get electrocuted — a serious electric shock', 'You might break the socket', 'It would waste electricity', 'The socket might make a noise'], 0,
    'Plug sockets carry mains electricity, which is very powerful. If you poke something into a socket, the electricity can flow through the object into your body, causing a serious and possibly fatal electric shock.'),
  fb(9, 'A circuit must be a complete ___ for electricity to flow. A switch works by ___ or connecting the circuit.',
    ['loop', 'breaking'],
    'Electricity needs a complete loop (circuit) to flow from the battery, through the wires and bulb, and back to the battery. A switch works by breaking (opening) the loop to stop the flow or connecting (closing) it to let electricity flow.'),
  q(10, 'Which of these makes electricity from sunlight?',
    ['Solar panels', 'Wind turbines', 'Coal power stations', 'Batteries'], 0,
    'Solar panels convert sunlight directly into electricity. They are becoming more common in South Africa, especially in the sunny Northern Cape. Wind turbines use wind, coal power stations burn coal, and batteries store electricity from chemicals.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Technology and Communication (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch8_lesson1 = [
  t(1, "## How People Share Messages\n\n**Communication** means sharing information, ideas, or feelings with other people. People have been communicating since the very beginning of human history.\n\n### Old Ways of Communicating\n\nLong ago, people did not have phones or computers. They used other ways to send messages:\n\n| Method | How It Worked |\n|--------|---------------|\n| **Talking face to face** | The oldest way — but only works if the other person is nearby |\n| **Drums** | In many African cultures, drums sent messages across long distances. Different beats meant different messages. |\n| **Smoke signals** | People burned fires and used blankets to make puffs of smoke. Others far away could see the smoke and understand the message. |\n| **Letters** | People wrote messages on paper and sent them by horse, boat, or on foot. This could take weeks or months! |\n| **Rock paintings** | The San people painted on cave walls to record stories and information. |\n\n### New Ways of Communicating\n\nToday we have much faster ways to send messages:\n- **Telephones** — talk to someone far away instantly\n- **Cell phones** — call, text, or video chat from anywhere\n- **Email** — send a written message to anyone in the world in seconds\n- **Social media** — share photos, videos, and messages with many people at once"),
  t(2, "## Telephones, Computers, and the Internet\n\n### The Telephone\n\nThe telephone was invented over 140 years ago. It changed the world because people could talk to someone far away **instantly** — no more waiting weeks for a letter!\n\nToday, most South Africans use **cell phones** (mobile phones) instead of landline telephones. Cell phones can do much more than just make calls:\n- Send text messages (SMS) and WhatsApp messages\n- Take photos and videos\n- Browse the internet\n- Play music and games\n\n### Computers\n\nA **computer** is a machine that can store information, do calculations, and connect to the internet. Computers come in different forms:\n- **Desktop computers** — sit on a desk at home or school\n- **Laptops** — portable computers you can carry\n- **Tablets** — thin, flat computers with touch screens\n\n### The Internet\n\nThe **internet** is a giant network that connects millions of computers all around the world. It lets you:\n- Search for information (using Google, Bing, etc.)\n- Watch videos (YouTube)\n- Send emails and messages\n- Learn new things (online lessons)\n- Shop for products\n\nIn South Africa, many people use the internet through their **cell phones** using mobile data."),
  q(3, 'How did many African cultures send messages across long distances before telephones?',
    ['By using drums with different beats for different messages', 'By shouting very loudly', 'By sending text messages', 'By using computers'], 0,
    'Drums were an important communication tool in many African cultures. Different rhythms and beats carried different messages, and the sound could travel long distances — much further than a human voice.'),
  t(4, "## Responsible Use of Devices\n\nTechnology like phones and computers is very useful, but you must use it **responsibly** (carefully and wisely).\n\n### Rules for Using Technology Responsibly\n\n| Rule | Why It Matters |\n|------|----------------|\n| **Ask permission** before using a phone or computer | The device may not be yours, and your parents should know what you do online |\n| **Limit your screen time** | Too much screen time can hurt your eyes, your sleep, and your health |\n| **Never share personal information** online | Strangers should not know your full name, address, phone number, or school name |\n| **Be kind online** | Saying hurtful things online (cyberbullying) is just as wrong as saying them in person |\n| **Tell an adult** if something online makes you feel uncomfortable or scared | Adults can help keep you safe |\n| **Do not download** apps or files without permission | Some files contain viruses that can damage the device |\n\n### Cyberbullying\n\n**Cyberbullying** means using technology to be mean to someone — sending nasty messages, sharing embarrassing photos, or leaving someone out of a group chat on purpose.\n\nCyberbullying is **wrong** and can really hurt people's feelings. If someone is cyberbullying you:\n1. Do not reply to the bully\n2. Save the messages as proof\n3. Tell a trusted adult (parent, teacher, or school counsellor)\n4. Block the person if possible"),
  fb(5, 'The ___ is a giant network that connects millions of computers around the world. Saying hurtful things to someone online is called ___.',
    ['internet', 'cyberbullying'],
    'The internet connects computers worldwide, allowing people to share information instantly. Cyberbullying is using technology to hurt, threaten, or embarrass someone — it is a serious problem and you should always tell an adult if it happens.'),
  t(6, "## How Communication Has Changed\n\nLet us compare old and new communication technology:\n\n| Feature | Old Technology | New Technology |\n|---------|---------------|----------------|\n| **Speed** | A letter took days or weeks | An email arrives in seconds |\n| **Distance** | Drums and smoke only reached nearby villages | A phone call reaches anywhere in the world |\n| **Number of people** | A letter went to one person | A social media post can reach millions |\n| **Cost** | Sending letters was expensive | Sending an email is almost free |\n| **Record** | Letters could be lost or damaged | Digital messages can be stored safely |\n\n### Is Newer Always Better?\n\nNot always! Here are some problems with new technology:\n- People spend too much time on screens\n- Cyberbullying is a big problem\n- Fake news spreads quickly on the internet\n- Electronic waste (old phones, computers) pollutes the environment\n\nThe best approach is to use technology **wisely** — enjoy its benefits but be careful about its dangers."),
  q(7, 'Why should you NEVER share your home address or school name on the internet?',
    ['Strangers could use that information to find where you live or go to school', 'It takes too long to type', 'Your friends already know it', 'The internet does not have enough space'], 0,
    'Sharing personal information like your address or school name is dangerous because strangers online could use it to find you in real life. Always keep personal details private to stay safe online.'),
  q(8, 'What should you do if someone sends you mean messages online?',
    ['Do not reply, save the messages, and tell a trusted adult', 'Send mean messages back', 'Delete everything and forget about it', 'Share the messages with all your friends'], 0,
    'The correct response to cyberbullying is: do not reply to the bully, save the messages as proof, tell a trusted adult (parent, teacher, counsellor), and block the person if possible. Never fight back online — get help from an adult.'),
  fb(9, 'In the past, a letter could take days or ___ to arrive. Today, an email arrives in just ___.',
    ['weeks', 'seconds'],
    'Before modern technology, letters were carried by horse, boat, or on foot, which could take weeks or even months. Today, emails travel at the speed of light through the internet and arrive in seconds.'),
  q(10, 'Which of these is an example of using technology RESPONSIBLY?',
    ['Asking your parents before downloading a new app', 'Using the computer all day without a break', 'Sharing your password with friends online', 'Sending messages to strangers'], 0,
    'Asking permission before downloading apps is responsible use of technology. It makes sure the app is safe and your parents know what you are doing. The other options are all risky or irresponsible behaviours.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE INSERTION
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 4
  let gradeDoc = await db.collection('grades').findOne({ orderIndex: 4, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 4:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 4', schoolId: SCHOOL_ID, orderIndex: 4,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 4:', String(GRADE_ID));
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
  const tags = ['grade-4', 'technology', 'caps'];
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
      title: 'Chapter 1: What Is Technology?',
      description: 'Technology helps us solve problems, things people have made (buildings, tools, clothes, phones), natural vs human-made objects, needs vs wants, technology in South Africa from San people to modern engineers.',
      order: 1,
      lessons: [
        { title: 'What Is Technology?', description: 'Definition of technology, examples of technology around us, natural vs human-made objects, buildings/tools/clothes/phones, needs vs wants, technology in South Africa past and present.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: The Design Process',
      description: 'The four steps of the Design Process: Investigate, Design, Make, Evaluate. Asking questions, looking at existing products, drawing ideas, labelling sketches, safety rules, testing and evaluating products.',
      order: 2,
      lessons: [
        { title: 'The Design Process', description: 'Four steps: Investigate (ask questions, look at existing products), Design (draw ideas, label, choose best), Make (gather materials, follow safety rules, build), Evaluate (test, improve, share).', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Materials and Their Uses',
      description: 'Different materials (wood, plastic, metal, paper, fabric, glass), properties of materials, choosing the best material for a job, materials in South Africa, recycling and the three Rs.',
      order: 3,
      lessons: [
        { title: 'Materials and Their Uses', description: 'Six common materials and their sources, properties (strong, flexible, waterproof, transparent, light, heavy), choosing the right material, South African resources, recycling, the three Rs (Reduce, Reuse, Recycle).', blocks: ch3_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 4: Structures That Stand',
      description: 'What is a structure, natural and human-made structures, what makes structures strong (wide base, triangles, thick walls), building with blocks and straws, famous South African structures.',
      order: 4,
      lessons: [
        { title: 'Structures That Stand', description: 'Definition of a structure, natural vs human-made structures, three things that make structures strong (wide base, triangles, thick walls), building with blocks and straws, testing structures, South African structures.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Simple Machines',
      description: 'What is a simple machine, levers (seesaw, bottle opener, scissors), wheels and axles (wheelbarrow, bicycle), ramps/inclined planes (wheelchair ramps, loading ramps), how they make work easier.',
      order: 5,
      lessons: [
        { title: 'Simple Machines', description: 'Three simple machines: levers (fulcrum, load, effort), wheels and axles (reducing friction), ramps/inclined planes (less force over longer distance), examples in everyday life, accessibility in South Africa.', blocks: ch5_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 6: Making Things Move',
      description: 'Push and pull forces, friction, wheels and axles for movement, parts of a wheeled vehicle, making a simple vehicle from recycled materials, testing movement, fair testing.',
      order: 6,
      lessons: [
        { title: 'Making Things Move', description: 'Forces (push and pull), friction, wheels reduce friction, parts of a wheeled vehicle, building a simple vehicle from recycled materials, gravity and rubber band power, fair testing, recording results.', blocks: ch6_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 7: Electricity in Our Lives',
      description: 'Where electricity comes from (coal, solar, wind), mains electricity vs batteries, staying safe around electricity, simple circuits, switches, emergency procedures.',
      order: 7,
      lessons: [
        { title: 'Electricity in Our Lives', description: 'Power stations and Eskom, solar and wind energy, mains electricity vs batteries, battery types, electrical safety rules, simple circuits (battery, wires, switch, bulb), emergency procedures.', blocks: ch7_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 8: Technology and Communication',
      description: 'How people share messages (old and new ways), telephones, computers, the internet, responsible use of devices, cyberbullying, online safety, how communication has changed over time.',
      order: 8,
      lessons: [
        { title: 'Technology and Communication', description: 'Old communication methods (drums, smoke signals, letters, rock paintings), modern methods (phones, email, social media), computers and the internet, responsible use, cyberbullying, online safety rules.', blocks: ch8_lesson1, term: 4 },
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
    title: 'Grade 4 Technology — CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering What Is Technology (natural vs human-made objects), The Design Process (Investigate, Design, Make, Evaluate), Materials and Their Uses (properties, recycling, the three Rs), Structures That Stand (wide base, triangles, thick walls), Simple Machines (levers, wheels, ramps), Making Things Move (forces, friction, building vehicles), Electricity in Our Lives (circuits, batteries, safety), and Technology and Communication (old and new methods, responsible use) for Grade 4 Technology.',
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
  console.log('  TEXTBOOK: Grade 4 Technology');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
