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
// CHAPTER 1: Things People Make (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch1_lesson1 = [
  t(1, "## Things People Make\n\nLook around your classroom. Can you see a desk? A chair? A blackboard? All of these things were **made by people**.\n\nNow look outside. Can you see a tree? A cloud? A stone? Nobody made those things — they come from **nature**.\n\n### Human-Made vs Natural\n\nWe can sort everything around us into two groups:\n\n| Human-Made Things | Natural Things |\n|-------------------|----------------|\n| A desk | A tree |\n| A window | A rock |\n| A shoe | A flower |\n| A brick | A river |\n| A book | The sun |\n\nHuman-made things are made by people. Natural things are already in the world without anyone making them."),
  t(2, "## Why Do People Make Things?\n\nPeople make things because they **need** them or **want** them.\n\n**Needs** are things we cannot live without:\n- Food and clean water\n- Clothes to keep us warm\n- A home to keep us safe\n\n**Wants** are things that are nice to have:\n- A toy\n- A TV\n- A pretty picture on the wall\n\n### Solving Problems\n\nEvery time people make something, they are solving a problem. Think about it:\n- It is raining! People make an **umbrella** to stay dry.\n- Food gets cold! People make a **pot** to cook it.\n- We need to write! People make a **pencil** to write with.\n\nIn South Africa, people have been making clever things for a very long time. The Khoi people made clay pots to carry water. The Zulu people wove beautiful baskets to store grain."),
  q(3, 'Which of these is a NATURAL thing?',
    ['A river', 'A book', 'A chair', 'A cup'], 0,
    'A river is natural — it was not made by people. Books, chairs, and cups are all made by people.'),
  t(4, "## Tools That Help Us\n\nWhen people make things, they use **tools**.\n\nA tool is anything that helps you do a job. Here are some tools you might know:\n\n- **Scissors** — help us cut paper\n- **A hammer** — helps us bang in nails\n- **A ruler** — helps us draw straight lines\n- **A spoon** — helps us stir and eat\n- **A broom** — helps us sweep the floor\n\nEven your **hands** can be tools! You use them to fold, tear, press, and squeeze.\n\n### Tools in the Classroom\n\nYour classroom is full of tools:\n- Crayons and pencils for writing and drawing\n- Glue for sticking things together\n- An eraser for rubbing out mistakes\n- A sharpener for making your pencil pointy again"),
  fb(5, 'Things that are made by people are called ___ things. Things that come from nature are called ___ things.',
    ['human-made', 'natural'],
    'Human-made things are designed and built by people. Natural things exist in nature without anyone making them.'),
  t(6, "## Things in Our Classroom That Were Made\n\nLet us take a closer look at our classroom. Almost everything inside was made by someone!\n\n- The **desk** was made from wood. A carpenter cut the wood and put the pieces together.\n- The **window** was made from glass. Glass is made by heating sand until it melts!\n- The **floor tiles** were made from clay and baked in a very hot oven.\n- The **light bulb** helps us see when it is dark outside.\n- The **door** has a handle so we can open and close it easily.\n\nEach of these things was made to help us learn and be comfortable at school.\n\n### Think About It\n\nNext time you pick up your pencil, think about all the people who helped make it — someone cut down the tree, someone shaped the wood, someone added the graphite inside, and someone painted it! One small pencil needed many people to make it."),
  q(7, 'What is a tool?',
    ['Anything that helps you do a job', 'Only things made of metal', 'Something you find in nature', 'A type of toy'], 0,
    'A tool is anything that helps you do a job. Tools can be made from many materials — wood, metal, plastic, or even just your hands!'),
  q(8, 'Why do people make things?',
    ['To solve problems and meet their needs', 'Because they are bored', 'Only for fun', 'Because the teacher told them to'], 0,
    'People make things to solve problems and meet their needs. An umbrella solves the problem of getting wet in the rain. A pot solves the problem of needing to cook food.'),
  fb(9, 'Scissors are a tool that helps us ___. A broom is a tool that helps us ___ the floor.',
    ['cut', 'sweep'],
    'Scissors help us cut paper, card, and other materials. A broom helps us sweep the floor to keep it clean.'),
  q(10, 'Which of these classroom things is made from wood?',
    ['A desk', 'A window', 'A light bulb', 'A floor tile'], 0,
    'Desks are usually made from wood. Windows are made from glass, light bulbs from glass and metal, and floor tiles from baked clay.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Building Things (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch2_lesson1 = [
  t(1, "## Building Things\n\nHave you ever built a tower with blocks? Or made a house with boxes? When you build, you are being like a real builder!\n\nA **structure** is anything that has been built or put together. Structures can be big, like a school building, or small, like a bird's nest.\n\n### Things We Can Build With\n\nYou can build structures using many different things:\n\n| Building Material | What You Can Make |\n|-------------------|-------------------|\n| Wooden blocks | Towers, walls, bridges |\n| Cardboard boxes | Houses, castles, robots |\n| Drinking straws | Frames, triangles, cubes |\n| Newspapers | Rolls to make strong tubes |\n| Playdough or clay | Models of animals and buildings |\n\nIn South Africa, people build houses using bricks, cement, wood, and corrugated iron. In the past, people built huts using mud, sticks, and grass."),
  t(2, "## What Makes a Structure Strong?\n\nNot all structures are strong. Some fall down easily! Let us learn what makes a structure strong.\n\n### Rule 1: A Wide Base\n\nA structure with a **wide base** (a big bottom) is harder to knock over. Think about a pyramid — it has a very wide base and a pointy top. That is why pyramids have lasted for thousands of years!\n\nIf you try to balance a pencil on its pointy end, it falls over. But if you stand it on the flat end, it stays up. The flat end is a wider base.\n\n### Rule 2: Not Too Tall\n\nThe taller a structure gets, the easier it is to fall over. That is why very tall buildings need extra strong supports. When you build a tower with blocks, it gets wobbly the higher you go.\n\n### Rule 3: Strong Shapes\n\nSome shapes are stronger than others. A **triangle** is the strongest shape in building. Look at roof trusses on houses — they use triangles! Bridges also use triangles to stay strong."),
  q(3, 'What shape is the STRONGEST for building?',
    ['A triangle', 'A circle', 'A square', 'A star'], 0,
    'A triangle is the strongest shape for building. It does not change its shape when you push on it. That is why triangles are used in roofs and bridges.'),
  t(4, "## Building a Tower\n\nLet us think about how to build a strong tower using blocks or boxes.\n\n### Steps to Build a Strong Tower:\n\n1. **Start with the biggest pieces at the bottom.** This gives your tower a wide, strong base.\n2. **Put smaller pieces on top of bigger pieces.** Never put a big piece on top of a small one — it will fall!\n3. **Make sure each piece is flat and straight.** Wobbly pieces make the whole tower wobbly.\n4. **Do not make it too tall too fast.** Add one piece at a time and check that it is steady.\n5. **Use triangles if you can.** Lean two pieces together to make a triangle shape — this is extra strong.\n\n### Famous Structures in South Africa\n\n- **The Voortrekker Monument** in Pretoria has a very wide base and strong walls.\n- **Rondavels** (round huts) are strong because their round shape spreads the weight evenly.\n- **The Moses Mabhida Stadium** in Durban has a big arch that holds the roof up using the strength of a curve."),
  fb(5, 'A structure with a ___ base is harder to knock over. A ___ is the strongest shape in building.',
    ['wide', 'triangle'],
    'Wide bases make structures stable because the weight is spread out. Triangles are the strongest building shape because they do not change shape when pushed.'),
  q(6, 'You are building a tower with blocks. Which block should go at the BOTTOM?',
    ['The biggest block', 'The smallest block', 'Any block — it does not matter', 'The lightest block'], 0,
    'The biggest block should go at the bottom to give your tower a wide, strong base. Building from big to small makes the tower much more stable.'),
  t(7, "## Try It Yourself!\n\nHere is a fun building challenge you can try:\n\n**Challenge: Build the Tallest Tower**\n\nWhat you need:\n- 10 cardboard boxes (different sizes) OR 20 wooden blocks\n\nRules:\n- Your tower must stand on its own for 10 seconds\n- You may not use glue or tape\n- You may not lean it against anything\n\n**Tips to win:**\n- Put the biggest box at the bottom\n- Make sure each box is balanced before adding the next one\n- Keep the tower straight — do not let it lean to one side\n- If it starts to wobble, take the top piece off and try again\n\nAfter building, talk about these questions:\n- How tall did your tower get?\n- What made it fall down (if it did)?\n- What would you do differently next time?"),
  q(8, 'Why are rondavels (round huts) strong structures?',
    ['Their round shape spreads the weight evenly', 'They are painted with strong paint', 'They are very tall', 'They are made of paper'], 0,
    'Rondavels are strong because their round shape spreads the weight evenly all around the walls. This means no one part of the wall carries too much weight.'),
  fb(9, 'The taller a structure gets, the easier it is to ___ over. Very tall buildings need extra strong ___.',
    ['fall', 'supports'],
    'Tall structures are less stable because the weight is high up. Engineers add extra strong supports like steel beams and deep foundations to keep tall buildings safe.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Different Materials (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch3_lesson1 = [
  t(1, "## Different Materials\n\nEverything around us is made from **materials**. A material is what something is made of.\n\nThere are six main materials you should know:\n\n| Material | What It Feels Like | Example |\n|----------|--------------------|---------|\n| **Wood** | Hard, rough or smooth | A desk, a door |\n| **Plastic** | Smooth, light | A lunchbox, a ruler |\n| **Metal** | Hard, cold, shiny | A spoon, a coin |\n| **Paper** | Thin, light, smooth | A book, a notebook |\n| **Fabric** | Soft, flexible | A shirt, a curtain |\n| **Glass** | Smooth, hard, see-through | A window, a jar |\n\nEach material has special qualities that make it good for certain jobs."),
  t(2, "## What Are Materials Used For?\n\nPeople choose materials carefully. They pick the best material for each job.\n\n### Wood\nWood comes from **trees**. It is strong and can be cut into shapes. We use wood for furniture, doors, pencils, and building houses. In South Africa, many craft markets sell beautiful wooden animals and bowls.\n\n### Plastic\nPlastic is **light** and **waterproof** (water cannot go through it). We use plastic for bottles, bags, toys, and containers. Plastic is useful, but too much plastic is bad for the environment.\n\n### Metal\nMetal is very **strong** and can be made into thin sheets or wires. We use metal for cars, pots, fences, and coins. South Africa has lots of gold and platinum — these are special metals found underground.\n\n### Paper\nPaper is made from **wood**. It is thin and light. We use paper for books, newspapers, tissues, and wrapping.\n\n### Fabric\nFabric is **soft** and **flexible** (it bends easily). We use fabric for clothes, curtains, towels, and bags.\n\n### Glass\nGlass is **transparent** (you can see through it). We use glass for windows, jars, mirrors, and light bulbs."),
  q(3, 'Which material is transparent — you can see through it?',
    ['Glass', 'Wood', 'Metal', 'Fabric'], 0,
    'Glass is transparent, which means you can see through it. That is why glass is used for windows — it lets light in and lets you see outside.'),
  fb(4, 'Plastic is light and ___, which means water cannot go through it. Fabric is soft and ___, which means it bends easily.',
    ['waterproof', 'flexible'],
    'Waterproof means water cannot pass through it, which is why plastic is great for bottles. Flexible means it can bend and fold, which is why fabric is perfect for clothes.'),
  t(5, "## Sorting Materials\n\nWe can sort materials by asking questions about them:\n\n**Is it hard or soft?**\n- Hard: wood, metal, glass\n- Soft: fabric, paper\n\n**Is it heavy or light?**\n- Heavy: metal, glass\n- Light: paper, plastic, fabric\n\n**Is it waterproof?**\n- Waterproof: plastic, metal, glass\n- Not waterproof: paper, fabric, wood (wood can soak up water slowly)\n\n**Can you see through it?**\n- See-through: glass, some plastic\n- Not see-through: wood, metal, fabric, paper\n\n### Sorting Game\n\nPick up five things in your classroom. For each one, ask:\n1. What material is it made of?\n2. Is it hard or soft?\n3. Is it heavy or light?\n4. Is it waterproof?"),
  q(6, 'Which material comes from trees?',
    ['Wood', 'Plastic', 'Metal', 'Glass'], 0,
    'Wood comes from trees. Trees are cut down and the wood is shaped into useful things like furniture, doors, and pencils. Paper is also made from wood!'),
  q(7, 'You want to make a water bottle. Which material is the BEST choice?',
    ['Plastic — because it is light and waterproof', 'Paper — because it is cheap', 'Fabric — because it is soft', 'Wood — because it is strong'], 0,
    'Plastic is the best choice for a water bottle because it is light (easy to carry), waterproof (water will not leak out), and can be shaped into a bottle.'),
  t(8, "## Materials in South Africa\n\nSouth Africa is rich in many materials!\n\n- **Gold and platinum** are mined from deep underground in Gauteng and Limpopo.\n- **Iron** is found in the Northern Cape and is used to make steel.\n- **Wood** comes from forests in Mpumalanga and KwaZulu-Natal.\n- **Clay** is dug from the ground and used to make bricks and pots.\n- **Cotton** is grown in Limpopo and turned into fabric.\n\nMany South African people are skilled at working with materials. The **Ndebele** people are famous for painting beautiful patterns on their houses. The **Venda** people make lovely clay pots. The **Zulu** people weave amazing baskets from grass."),
  fb(9, 'South Africa has lots of ___ and platinum underground. The Ndebele people are famous for painting beautiful ___ on their houses.',
    ['gold', 'patterns'],
    'South Africa is one of the world\'s top producers of gold and platinum. The Ndebele people are famous for their brightly coloured geometric patterns painted on the walls of their homes.'),
  q(10, 'A learner wants to sort materials. Which question will help them sort?',
    ['Is it hard or soft?', 'What colour is it?', 'Do I like it?', 'Is it my favourite?'], 0,
    'Asking "Is it hard or soft?" helps you sort materials by a real property. Colour, likes, and favourites are not useful ways to sort materials in Technology.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Moving Things (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch4_lesson1 = [
  t(1, "## Moving Things\n\nThings do not move on their own — something has to make them move. We use **forces** to move things.\n\nThere are two main forces:\n\n### Push\nA **push** moves something **away** from you.\n- You push a door to open it.\n- You push a ball to roll it.\n- You push a shopping trolley in the shop.\n\n### Pull\nA **pull** moves something **towards** you.\n- You pull a drawer to open it.\n- You pull a rope in tug-of-war.\n- You pull your school bag onto your back.\n\nSometimes you need a **big** force (like pushing a heavy box) and sometimes you need a **small** force (like pushing a button)."),
  t(2, "## Wheels Help Things Move\n\nImagine trying to move a heavy box across the floor. It is really hard! But if you put the box on a trolley with **wheels**, it becomes much easier.\n\n**Wheels** make things easier to move because they **roll** instead of sliding. Rolling takes less effort than sliding.\n\n### Things with Wheels\n\n- Cars, buses, and taxis\n- Bicycles\n- Shopping trolleys\n- Wheelbarrows\n- Roller skates\n- Scooters\n\nWheels were one of the most important inventions ever! Before wheels, people had to carry everything or drag it along the ground.\n\n### Ramps and Slopes\n\nA **ramp** (or slope) is a flat surface that goes up at an angle. Ramps make it easier to move things up and down.\n\n- Wheelchair ramps help people in wheelchairs get into buildings.\n- Loading ramps help people put heavy boxes into a truck.\n- Skate ramps let skateboarders roll up and do tricks.\n\nUsing a ramp takes less effort than lifting something straight up."),
  q(3, 'What is a push?',
    ['A force that moves something away from you', 'A force that moves something towards you', 'A way to stop something', 'A type of wheel'], 0,
    'A push is a force that moves something away from you. When you push a door, it moves away from your hand and opens.'),
  fb(4, 'A push moves something ___ from you. A pull moves something ___ you.',
    ['away', 'towards'],
    'Pushing sends things away from you (like pushing a ball). Pulling brings things towards you (like pulling a rope).'),
  t(5, "## Rolling and Sliding\n\nThere are two ways things can move along a surface:\n\n### Rolling\nRound things **roll**. A ball rolls, a wheel rolls, a marble rolls. Rolling is smooth and easy.\n\n### Sliding\nFlat things **slide**. A book slides across a desk, a box slides across the floor. Sliding is harder because the flat surface rubs against the ground. This rubbing is called **friction**.\n\n**Friction** slows things down. Rough surfaces have more friction (like a carpet). Smooth surfaces have less friction (like a tiled floor).\n\nThat is why:\n- A ball rolls far on a smooth floor but stops quickly on grass\n- It is harder to push a box on carpet than on tiles\n- Ice is slippery because it has very little friction"),
  q(6, 'Why do wheels make it easier to move heavy things?',
    ['Because rolling takes less effort than sliding', 'Because wheels are always made of rubber', 'Because wheels are always big', 'Because wheels are colourful'], 0,
    'Wheels make things easier to move because rolling creates less friction than sliding. Less friction means you need less force (effort) to move something.'),
  t(7, "## Making a Toy Car That Moves\n\nYou can make your own toy car using things you find at home or school!\n\n**What you need:**\n- A small cardboard box (like an empty matchbox or juice box)\n- 4 bottle caps for wheels\n- 2 thin sticks or skewers for axles\n- Tape or glue\n\n**Steps:**\n1. Take your box — this is the body of the car.\n2. Poke two holes on each side of the box, near the bottom.\n3. Push the sticks through the holes so they go from one side to the other.\n4. Attach a bottle cap to each end of the sticks — these are your wheels.\n5. Make sure the wheels can spin freely.\n6. Give your car a gentle push and watch it roll!\n\n**Make it better:**\n- If the wheels wobble, make the holes smaller.\n- If the car does not roll far, try smoother wheels.\n- Decorate your car with crayons or paint!"),
  q(8, 'What is friction?',
    ['The rubbing between two surfaces that slows things down', 'A type of wheel', 'A way to make things go faster', 'The force of gravity'], 0,
    'Friction is the rubbing between two surfaces. It slows things down. Rough surfaces like carpet have more friction, and smooth surfaces like tiles have less friction.'),
  fb(9, 'Wheels help things move because ___ takes less effort than sliding. A ramp makes it easier to move things ___ and down.',
    ['rolling', 'up'],
    'Rolling creates less friction than sliding, so wheels make movement easier. Ramps let you move heavy things up gradually instead of lifting them straight up, which takes more effort.'),
  q(10, 'Which surface would a toy car roll the FURTHEST on?',
    ['A smooth tiled floor', 'A thick carpet', 'Grass', 'Sand'], 0,
    'A smooth tiled floor has the least friction, so the toy car would roll the furthest on it. Carpet, grass, and sand all have more friction and would slow the car down.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Using Tools Safely (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch5_lesson1 = [
  t(1, "## Using Tools Safely\n\nTools help us make things, but we must use them **safely**. If we are not careful, tools can hurt us or others.\n\nHere are some tools you use at school:\n\n| Tool | What It Does |\n|------|--------------|\n| **Scissors** | Cut paper and card |\n| **A ruler** | Measure things and draw straight lines |\n| **Glue** | Stick things together |\n| **Crayons and pencils** | Write and colour |\n| **A hole punch** | Make holes in paper |\n\n### The Golden Rule\n\n**Always use a tool for what it was made to do.** Scissors are for cutting — not for poking. A ruler is for measuring — not for hitting. A pencil is for writing — not for throwing."),
  t(2, "## How to Use Tools Properly\n\n### Scissors\n- Always carry scissors with the **pointy end pointing down** and the handles up.\n- Cut **away** from your body, never towards yourself.\n- Pass scissors to someone by holding the **closed blades** and offering the handles.\n- When you are done, **close** the scissors and put them down.\n\n### Rulers\n- Hold the ruler **firmly** with one hand while you draw with the other.\n- Do not bend or snap rulers — they can break and hurt you.\n- Put your ruler flat on the desk when measuring.\n\n### Glue\n- Use a **small amount** — a little bit of glue goes a long way!\n- Do not put glue near your eyes, mouth, or nose.\n- Put the **lid back on** when you are finished so the glue does not dry out.\n- Wash your hands after using glue.\n\n### Crayons and Pencils\n- Do not put them in your mouth.\n- Do not poke anyone with a sharp pencil.\n- If your pencil breaks, use a **sharpener** — do not bite it or snap it."),
  q(3, 'How should you carry scissors?',
    ['With the pointy end pointing down and handles up', 'With the pointy end pointing at your friend', 'By throwing them across the room', 'With the blades open'], 0,
    'You should carry scissors with the pointy end pointing down and the handles up. This keeps the sharp blades away from your face and others around you.'),
  fb(4, 'When using scissors, always cut ___ from your body. When you pass scissors to someone, hold the closed ___ and offer the handles.',
    ['away', 'blades'],
    'Cutting away from your body keeps you safe. When passing scissors, you hold the blades so the other person can grab the handles safely.'),
  t(5, "## Keeping Tools Safe and Clean\n\nTools last longer when we take care of them. Here is how to look after your tools:\n\n### After Every Lesson:\n1. **Clean** your tools — wipe glue off scissors, wash paint brushes.\n2. **Put everything back** in the right place — pencils in the pencil holder, scissors in the scissor pot.\n3. **Close** all lids — glue, paint, and marker lids must be put back on.\n4. **Check** that nothing is broken — tell your teacher if a tool is damaged.\n\n### Keep Your Workspace Tidy\n- Clear your desk before you start working.\n- Put newspaper down if you are using paint or glue.\n- Wipe up any spills straight away.\n- Throw rubbish in the bin — not on the floor!\n\n### Sharing Tools\n- Take turns — do not grab tools from others.\n- Ask politely: \"May I please use the scissors when you are done?\"\n- Return borrowed tools quickly and in good condition."),
  q(6, 'Why should you put the lid back on the glue when you are finished?',
    ['So the glue does not dry out', 'Because the teacher said so', 'So the glue changes colour', 'To make it look pretty'], 0,
    'Putting the lid back on glue stops air from getting in, which would make the glue dry out and become hard. Taking care of tools means they last longer and work properly.'),
  t(7, "## Being Careful\n\nAccidents happen when we are not paying attention. Here are some important safety rules:\n\n### Safety Rules for Technology Class:\n\n1. **Listen** to your teacher's instructions before you start.\n2. **Do not run** in the classroom — you might bump into someone using sharp tools.\n3. **Keep your workspace clear** so you have room to work safely.\n4. **Tell your teacher** immediately if you get hurt, even if it is small.\n5. **Never play** with tools — they are for work, not for games.\n6. **Tie back long hair** so it does not get caught in anything.\n7. **Roll up long sleeves** so they do not drag through glue or paint.\n\n### What To Do If Something Goes Wrong\n- If you cut yourself: **tell your teacher right away**. Do not try to hide it.\n- If you spill glue or paint: **clean it up** so nobody slips.\n- If a tool breaks: **do not try to fix it yourself**. Tell your teacher."),
  q(8, 'What should you do if you cut yourself with scissors?',
    ['Tell your teacher right away', 'Hide it and keep working', 'Try to fix it yourself', 'Blame someone else'], 0,
    'If you get hurt, you should always tell your teacher right away. Even small cuts need to be cleaned properly. Never try to hide an injury — adults can help you.'),
  fb(9, 'Always use a tool for what it was ___ to do. If a tool breaks, tell your ___ instead of trying to fix it yourself.',
    ['made', 'teacher'],
    'Using tools correctly keeps you safe — scissors are for cutting, not poking! If something breaks, an adult should handle it because broken tools can be dangerous.'),
  q(10, 'Which of these is a safe way to work in Technology class?',
    ['Keeping your workspace clear and listening to instructions', 'Running around the classroom with scissors', 'Putting glue near your eyes', 'Using a pencil to poke your friend'], 0,
    'Keeping a clear workspace and listening to instructions are the most important safety rules. Running with scissors, misusing glue, and poking others are all dangerous and against the rules.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Recycling and Reusing (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch6_lesson1 = [
  t(1, "## Recycling and Reusing\n\nEvery day, people throw away a lot of rubbish. But did you know that much of this rubbish can be used again?\n\n**Recycling** means taking old things and turning them into new things. Instead of throwing a plastic bottle in the bin, it can be recycled into something new — like a plastic chair or a fleece jacket!\n\n### Why Is Recycling Important?\n\n- It **reduces rubbish** in landfill sites (big rubbish dumps).\n- It **saves resources** — we do not need to cut down as many trees or dig up as many metals.\n- It **protects animals** — rubbish in rivers and the sea hurts fish, birds, and turtles.\n- It **keeps South Africa clean and beautiful**.\n\nIn many South African towns and cities, there are recycling programmes. Some people also collect recyclable materials to sell — this gives them an income."),
  t(2, "## Sorting Waste\n\nBefore we can recycle, we need to **sort** our waste into groups. Different materials are recycled in different ways.\n\n| Material | Colour of Bin | Examples |\n|----------|---------------|----------|\n| **Paper** | Blue or white | Newspapers, cardboard boxes, old books |\n| **Plastic** | Yellow | Bottles, food containers, plastic bags |\n| **Glass** | Green | Jars, bottles (not broken window glass) |\n| **Metal** | Red or grey | Tin cans, drink cans, aluminium foil |\n\n### Things That Cannot Be Recycled:\n- Food scraps (these go into a **compost** heap instead)\n- Dirty nappies\n- Broken mirrors\n- Styrofoam (polystyrene)\n\n### How to Sort:\n1. **Rinse** containers — wash out old food so they are clean.\n2. **Flatten** boxes and cans to save space.\n3. **Put items in the right bin** — paper with paper, plastic with plastic.\n4. **Remove lids** — plastic lids and metal lids are recycled separately."),
  q(3, 'What does recycling mean?',
    ['Taking old things and turning them into new things', 'Throwing everything in the bin', 'Buying new things every day', 'Burning rubbish'], 0,
    'Recycling means taking old materials and turning them into new products. A plastic bottle can become a new chair, and old newspapers can become fresh paper.'),
  fb(4, 'Paper goes in the ___ bin. Plastic goes in the ___ bin.',
    ['blue', 'yellow'],
    'In South Africa, paper recycling bins are usually blue or white. Plastic recycling bins are usually yellow. Sorting waste correctly helps recycling work properly.'),
  t(5, "## Making New Things From Old Things\n\n**Reusing** means using something again instead of throwing it away. This is even better than recycling because it uses less energy!\n\nHere are fun ways to reuse old things:\n\n### Old Plastic Bottles\n- Cut the top off to make a **plant pot**\n- Fill with sand to make **bowling pins**\n- Cut in half and use as a **scoop**\n\n### Old Cardboard Boxes\n- Make a **puppet theatre**\n- Build a **toy house** or castle\n- Use as **storage boxes** for your toys\n\n### Old Newspapers\n- Use for **wrapping gifts** (decorate them with drawings!)\n- Tear into strips to make **papier-mâché** models\n- Fold into **paper hats** or boats\n\n### Old Fabric and Clothes\n- Cut old t-shirts into **cleaning rags**\n- Sew old jeans into a **pencil case**\n- Stuff old socks to make a **sock puppet**\n\nIn South Africa, many talented people make beautiful crafts from recycled materials. Some artists make animals from wire and beads, and others make bags from old plastic packets."),
  q(6, 'What is the difference between recycling and reusing?',
    ['Reusing means using something again as it is; recycling means turning it into something new', 'They mean the same thing', 'Recycling is when you throw things away', 'Reusing is only for plastic'], 0,
    'Reusing means using an item again (like using a bottle as a plant pot). Recycling means the material is broken down and remade into a new product (like melting plastic to make a chair). Reusing is quicker and uses less energy.'),
  t(7, "## Keeping Our School Clean\n\nA clean school is a happy school! Here is how we can all help:\n\n### In the Classroom:\n- Put rubbish in the bin — never on the floor.\n- Recycle paper instead of throwing it away.\n- Use both sides of a piece of paper before recycling it.\n- Keep your desk tidy.\n\n### In the Playground:\n- Use the bins provided — do not litter.\n- Pick up any rubbish you see, even if it is not yours.\n- Do not throw food or wrappers on the ground.\n\n### At Home:\n- Help your family sort recycling.\n- Take a reusable bag when you go shopping.\n- Use a lunch box instead of plastic wrap.\n- Turn off lights and taps to save energy and water.\n\n### Our Responsibility\n\nSouth Africa is a beautiful country with amazing mountains, beaches, forests, and wildlife. It is **our job** to keep it clean and beautiful for everyone. Every small action counts — if every learner picks up one piece of litter a day, our schools and neighbourhoods would be much cleaner!"),
  q(8, 'Which of these is an example of REUSING?',
    ['Turning an old bottle into a plant pot', 'Throwing a bottle in the recycling bin', 'Buying a new bottle', 'Breaking a bottle'], 0,
    'Turning an old bottle into a plant pot is reusing — you are using the bottle again for a new purpose without breaking it down. Putting it in a recycling bin is recycling, which is also good, but reusing is even better!'),
  fb(9, 'Recycling helps reduce rubbish in ___ sites. In South Africa, some artists make animals from wire and ___.',
    ['landfill', 'beads'],
    'Landfill sites are large dumps where rubbish piles up. By recycling, we send less waste to these sites. South African wire-and-bead art is famous around the world and is a wonderful example of creative reuse.'),
  q(10, 'What should you do with a piece of paper before recycling it?',
    ['Use both sides of it first', 'Crumple it into a ball', 'Throw it on the floor', 'Tear it into tiny pieces'], 0,
    'Before recycling paper, you should use both sides. This means you use less paper overall, which saves trees. Only recycle it once both sides have been used.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE INSERTION
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 3
  let gradeDoc = await db.collection('grades').findOne({ orderIndex: 3, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 3:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 3', schoolId: SCHOOL_ID, orderIndex: 3,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 3:', String(GRADE_ID));
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
  const tags = ['grade-3', 'technology', 'caps'];
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
      title: 'Chapter 1: Things People Make',
      description: 'Human-made things vs natural things, why people make things (needs and wants), tools that help us, things in the classroom that were made, South African examples of early technology.',
      order: 1,
      lessons: [
        { title: 'Things People Make', description: 'Sorting human-made and natural things, needs vs wants, solving problems, tools (scissors, hammer, ruler, spoon, broom), classroom tools, how a pencil is made.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Building Things',
      description: 'Making structures with blocks, boxes, and straws, what makes a structure strong (wide base, not too tall, triangles), building a tower, famous South African structures.',
      order: 2,
      lessons: [
        { title: 'Building Things', description: 'What is a structure, building materials (blocks, boxes, straws, newspaper, clay), three rules for strong structures (wide base, not too tall, strong shapes like triangles), building a tower, South African structures.', blocks: ch2_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 3: Different Materials',
      description: 'Six main materials (wood, plastic, metal, paper, fabric, glass), what they feel like, what they are used for, sorting materials by properties, materials in South Africa.',
      order: 3,
      lessons: [
        { title: 'Different Materials', description: 'Wood, plastic, metal, paper, fabric, and glass — properties (hard, soft, heavy, light, waterproof, transparent, flexible), uses for each material, sorting materials, South African materials and crafts.', blocks: ch3_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 4: Moving Things',
      description: 'Push and pull forces, wheels help things move, ramps and slopes, rolling and sliding, friction, making a toy car that moves.',
      order: 4,
      lessons: [
        { title: 'Moving Things', description: 'Push and pull forces, wheels reduce friction, ramps make lifting easier, rolling vs sliding, friction on different surfaces, building a toy car from recycled materials.', blocks: ch4_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 5: Using Tools Safely',
      description: 'Scissors, rulers, glue, crayons, how to use tools properly, keeping tools safe and clean, being careful, safety rules for Technology class.',
      order: 5,
      lessons: [
        { title: 'Using Tools Safely', description: 'Classroom tools and their jobs, safe use of scissors (carry, cut, pass), rulers, glue, and pencils, keeping tools clean and tidy, sharing tools, safety rules, what to do if something goes wrong.', blocks: ch5_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 6: Recycling and Reusing',
      description: 'What is recycling, sorting waste (paper, plastic, glass, metal), making new things from old things, keeping our school clean, South African recycling and craft.',
      order: 6,
      lessons: [
        { title: 'Recycling and Reusing', description: 'Recycling turns old things into new things, sorting waste into colour-coded bins (paper, plastic, glass, metal), reusing items creatively (bottles, boxes, newspaper, fabric), keeping school and South Africa clean.', blocks: ch6_lesson1, term: 4 },
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
    title: 'Grade 3 Technology — CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Things People Make (human-made vs natural, needs and wants, tools), Building Things (structures, wide base, triangles), Different Materials (wood, plastic, metal, paper, fabric, glass), Moving Things (push, pull, wheels, ramps, friction), Using Tools Safely (scissors, rulers, glue, safety rules), and Recycling and Reusing (sorting waste, reusing creatively, keeping South Africa clean) for Grade 3 Technology.',
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
  console.log('  TEXTBOOK: Grade 3 Technology');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
