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
// CHAPTER 1: Living and Non-living Things (Term 1 — Life and Living)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Living and Non-living Things\n\n### What Makes Something Alive?\n\nLook around you — some things are alive and some things are not. A dog is alive, but a rock is not. How do we tell the difference?\n\nAll **living things** share these characteristics. They all:\n\n1. **Breathe** — they take in air (oxygen) to stay alive\n2. **Eat (need food)** — they need food or nutrients for energy\n3. **Grow** — they get bigger over time\n4. **Move** — they can move on their own (animals walk, plants turn towards the Sun)\n5. **Reproduce** — they make babies or new plants like themselves\n6. **Respond** — they react to things around them (a cat runs from a loud noise, a sunflower faces the Sun)\n7. **Get rid of waste** — they remove things their body does not need\n\nAn easy way to remember this is the word **MRS GREN**:\n- **M**ovement\n- **R**espiration (breathing)\n- **S**ensitivity (responding)\n- **G**rowth\n- **R**eproduction\n- **E**xcretion (getting rid of waste)\n- **N**utrition (eating)'),
  q(2, 'Which of these is a characteristic of ALL living things?',
    ['They can fly', 'They grow over time', 'They are always green', 'They live in water'], 1,
    'All living things grow — they get bigger over time. Not all living things can fly (only some birds and insects), not all are green (animals are not), and not all live in water (many live on land).'),
  t(3, '### Non-living Things\n\n**Non-living things** do not breathe, eat, grow, move on their own, reproduce, or respond. They can be divided into two groups:\n\n**Things that were never alive:**\n- Rocks, water, sand, metal, glass, plastic\n- These were never living at any point\n\n**Things that were once alive (but are no longer):**\n- A wooden table (made from a tree that was once alive)\n- A leather shoe (made from animal skin)\n- Dried leaves on the ground\n- Coal (formed from ancient plants millions of years ago)\n\n### Classifying Objects\n\nLet us practise sorting things into groups:\n\n| Object | Living, Non-living, or Once living? | Reason |\n|--------|--------------------------------------|--------|\n| A cat | Living | It breathes, eats, grows, moves, reproduces |\n| A rock | Non-living (never alive) | It does not breathe, eat, grow, move, or reproduce |\n| A wooden chair | Non-living (once alive) | Wood comes from a tree, which was once living |\n| A sunflower | Living | It grows, responds to sunlight, makes seeds |\n| A glass bottle | Non-living (never alive) | Glass is made from melted sand |'),
  fb(4, 'Living things can breathe, eat, ___, move, reproduce, and respond. The word MRS GREN helps us remember the ___ characteristics of living things.',
    ['grow', 'seven'],
    'All living things share seven characteristics, often remembered using the word MRS GREN: Movement, Respiration (breathing), Sensitivity (responding), Growth, Reproduction, Excretion (getting rid of waste), and Nutrition (eating).'),
  q(5, 'A wooden table is classified as:',
    ['Living', 'Non-living — never alive', 'Non-living — once alive', 'Both living and non-living'], 2,
    'A wooden table is non-living now, but it was once part of a living tree. Wood comes from trees, which were alive. This makes it "once living" — it no longer breathes, grows, or reproduces.'),
  t(6, '### Tricky Examples\n\nSome things are tricky to classify:\n\n- **A car** moves, but it is not alive — a person or engine makes it move. It does not grow, breathe, or reproduce.\n- **A seed** looks like it is not alive, but it IS alive. When given water and warmth, it will grow into a plant.\n- **Fire** seems alive because it moves and grows, but it is NOT alive. It does not breathe, reproduce, or respond the way living things do.\n- **Clouds** move across the sky, but they are not alive — wind pushes them.\n\n### Living Things in South Africa\n\nSouth Africa is home to an amazing variety of living things:\n\n- **Animals:** elephants in Kruger National Park, penguins at Boulders Beach in Cape Town, dolphins along the KwaZulu-Natal coast\n- **Plants:** the giant baobab trees of Limpopo, the beautiful proteas of the Western Cape (our national flower), the spekboom of the Eastern Cape\n- **Tiny living things:** bacteria in the soil, algae in rock pools along the coast\n\nAll of these — from the largest elephant to the tiniest bacterium — share the same seven characteristics of life.'),
  q(7, 'Why is fire NOT classified as a living thing, even though it moves and grows?',
    ['Because it is too hot', 'Because it does not reproduce, breathe, or respond like living things', 'Because it is orange', 'Because it only lives for a short time'], 1,
    'Fire may look alive because it moves and seems to grow, but it does not have all seven characteristics of living things. It cannot reproduce, it does not breathe (take in oxygen the way organisms do), and it does not respond to its environment like a living thing.'),
  fb(8, 'A seed looks non-living but it is actually ___. South Africa\'s national flower is the ___.',
    ['alive', 'protea'],
    'Seeds are alive — they are dormant (resting) and will grow into new plants when they get water and warmth. The protea is South Africa\'s national flower, found mainly in the fynbos biome of the Western Cape.'),
  t(9, '### Summary\n\n- **Living things** breathe, eat, grow, move, reproduce, respond, and get rid of waste (MRS GREN).\n- **Non-living things** can be things that were **never alive** (rocks, water, glass) or **once alive** (wood, leather, dried leaves).\n- Some things like fire, cars, and clouds seem alive but are not — they do not have all seven characteristics.\n- South Africa has an amazing variety of living things, from elephants to bacteria.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Structure of Plants (Term 1 — Life and Living)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Structure of Plants\n\n### Parts of a Plant\n\nEvery plant has important parts that work together to keep it alive. Let us learn about each one:\n\n| Part | What it does |\n|------|-------------|\n| **Roots** | Hold the plant in the soil and soak up water and nutrients from the ground |\n| **Stem** | Holds the plant upright and carries water from the roots to the leaves |\n| **Leaves** | Make food for the plant using sunlight, water, and air (photosynthesis) |\n| **Flowers** | Help the plant reproduce — they make seeds |\n| **Fruit** | Protects the seeds and helps spread them |\n| **Seeds** | Grow into new plants |\n\nThink of a plant like a factory:\n- The **roots** are the water pipes bringing water in\n- The **stem** is the highway that carries water and food up and down\n- The **leaves** are the kitchen where food is made\n- The **flowers** are where new seeds are created'),
  q(2, 'What is the main job of a plant\'s leaves?',
    ['To hold the plant in the soil', 'To make food for the plant using sunlight', 'To carry water up the stem', 'To produce seeds'], 1,
    'Leaves are like the plant\'s kitchen — they make food through a process called photosynthesis. They use sunlight, water (from the roots), and carbon dioxide (from the air) to produce sugar, which gives the plant energy to grow.'),
  fb(3, 'The ___ hold a plant in the soil and absorb water. The ___ make food for the plant using sunlight.',
    ['roots', 'leaves'],
    'Roots anchor the plant firmly in the ground and absorb water and nutrients from the soil. Leaves carry out photosynthesis — they use sunlight energy to turn water and carbon dioxide into food (sugar) for the plant.'),
  t(4, '### Types of Roots\n\nDifferent plants have different types of roots:\n\n**Taproot:**\n- One thick main root that grows straight down, with smaller side roots\n- Examples: carrots, beetroot, dandelions\n- The carrot you eat IS actually the taproot of the carrot plant!\n\n**Fibrous roots:**\n- Many thin roots that spread out in all directions near the surface\n- Examples: grass, wheat, maize (mielies)\n- Grass has fibrous roots — that is why it holds soil together so well\n\n### Types of Stems\n\n**Soft (herbaceous) stems:**\n- Thin, green, and bendable\n- Examples: sunflowers, tomato plants, daisies\n\n**Woody stems:**\n- Thick, hard, and covered in bark\n- Examples: trees like the marula tree, the yellowwood tree, and the jacaranda\n\n**Underground stems:**\n- Some plants store food in stems that grow underground\n- A **potato** is actually an underground stem (not a root!)\n\n### South African Plant Examples\n\n- The **baobab tree** has a very thick woody stem that can store thousands of litres of water — perfect for surviving dry conditions in Limpopo\n- **Spekboom** has a soft, fleshy stem that stores water, helping it survive in the dry Eastern Cape\n- **Mielies (maize)** have fibrous roots and a tall, strong stem — they are South Africa\'s most important crop'),
  q(5, 'Which type of root does a carrot have?',
    ['Fibrous root', 'Taproot', 'Underground stem', 'Aerial root'], 1,
    'A carrot has a taproot — one thick main root that grows straight down. The orange part of the carrot that we eat is actually this taproot! It stores food (sugar and starch) that the plant uses for energy.'),
  t(6, '### How Flowers Help Plants Reproduce\n\nFlowers are the reproductive parts of a plant. Here is how it works:\n\n1. **Pollination** — pollen (a fine powder) moves from one flower to another. This can happen through:\n   - **Wind** — the wind blows pollen through the air\n   - **Insects** — bees, butterflies, and beetles carry pollen as they visit flowers for nectar\n   - **Birds** — sunbirds in South Africa pollinate many fynbos flowers\n\n2. **Fertilisation** — when pollen reaches another flower, a seed begins to form\n\n3. **Seed dispersal** — seeds spread to new places through:\n   - **Wind** — dandelion seeds float on the breeze\n   - **Water** — coconut seeds float on ocean currents\n   - **Animals** — birds eat berries and drop the seeds elsewhere; burrs stick to animal fur\n   - **Explosion** — some pods burst open and fling seeds out\n\n### Why Plants Are Important\n\nPlants are essential for life on Earth:\n- They make **oxygen** that we breathe\n- They provide **food** for animals and people\n- They give **shelter** to animals (birds nest in trees)\n- Their roots hold **soil** in place and prevent erosion'),
  q(7, 'How do sunbirds help plants in South Africa?',
    ['They eat the plant\'s leaves', 'They carry pollen from flower to flower', 'They dig up the roots', 'They spread seeds by wind'], 1,
    'Sunbirds visit flowers to drink nectar with their long curved beaks. As they feed, pollen sticks to their heads and is carried to the next flower they visit. This is called pollination, and it helps the plant make seeds and reproduce.'),
  fb(8, 'A ___ is one thick main root growing straight down. A potato is actually an underground ___, not a root.',
    ['taproot', 'stem'],
    'Taproots are thick single roots that grow downward, like those found in carrots and beetroot. A potato may grow underground, but it is a stem (called a tuber) that stores food — you can see this because potatoes have "eyes" (buds) that sprout into new plants.'),
  t(9, '### Summary\n\n- Plants have six main parts: roots, stem, leaves, flowers, fruit, and seeds.\n- **Roots** absorb water; **stems** carry water; **leaves** make food; **flowers** make seeds.\n- There are two main types of roots: **taproots** (carrots) and **fibrous roots** (grass).\n- Stems can be **soft**, **woody**, or **underground**.\n- Plants reproduce through **pollination** and **seed dispersal**.\n- Plants are essential — they make oxygen, provide food, give shelter, and hold soil in place.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Structure of Animals (Term 1 — Life and Living)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Structure of Animals\n\n### Animal Body Parts\n\nAnimals come in many shapes and sizes, but most have body parts that help them survive. Let us look at the main body parts and what they do:\n\n| Body part | What it does |\n|-----------|-------------|\n| **Head** | Contains the brain, eyes, ears, nose, and mouth |\n| **Body (trunk)** | Contains the heart, lungs, and stomach |\n| **Limbs** | Legs for walking/running, arms for grasping, wings for flying, fins for swimming |\n| **Tail** | Helps with balance (monkeys), steering (fish), swatting flies (cows, horses) |\n| **Skin/covering** | Protects the body from injury, germs, heat, and cold |\n\n### How Animals Move\n\nDifferent animals move in different ways depending on their body parts:\n\n| Way of moving | Body parts used | South African examples |\n|--------------|----------------|----------------------|\n| **Walking/running** | Legs | Lions, elephants, springbok |\n| **Flying** | Wings | Hadeda ibis, Cape vulture, fruit bats |\n| **Swimming** | Fins and tail | Great white shark, clownfish, sardines |\n| **Crawling** | Belly muscles | Puff adder, mole snake |\n| **Hopping** | Strong back legs | Springhare, frogs |\n| **Climbing** | Legs with claws or gripping hands | Vervet monkeys, chameleons, geckos |'),
  q(2, 'Which body parts does a bird use to fly?',
    ['Fins', 'Legs', 'Wings', 'Tail only'], 2,
    'Birds use their wings to fly. Wings are specially shaped limbs covered in feathers. When a bird flaps its wings, they push air downward and the bird is lifted upward. South African birds like the hadeda ibis and Cape vulture are excellent fliers.'),
  fb(3, 'Animals that live in water use ___ and a tail to swim. Springbok use their ___ to run fast across the grasslands.',
    ['fins', 'legs'],
    'Fish and other sea animals have fins — flat body parts that push against the water to help them move. Land animals like the springbok have strong legs adapted for running at high speeds to escape predators like cheetahs.'),
  t(4, '### Body Coverings\n\nAnimals have different body coverings that protect them:\n\n| Covering | What it does | South African examples |\n|----------|-------------|----------------------|\n| **Fur/hair** | Keeps the animal warm, protects skin | Lion, zebra, vervet monkey |\n| **Feathers** | Keep birds warm, help with flying, waterproof | African penguin, lilac-breasted roller |\n| **Scales** | Protect against injury and water loss | Nile crocodile, puff adder, chameleon |\n| **Shell** | Hard covering that protects soft body inside | Leopard tortoise, abalone, snails |\n| **Smooth/moist skin** | Allows breathing through the skin (in amphibians) | Rain frog, platanna (clawed frog) |\n\n### Fun Fact: The Pangolin\n\nThe **pangolin** is one of South Africa\'s most special animals. It is the only mammal covered in **scales**! When it feels threatened, it rolls into a tight ball so that its hard scales protect its soft belly. Pangolins eat ants and termites using a very long sticky tongue. Sadly, pangolins are endangered because people hunt them illegally.'),
  q(5, 'What body covering does the pangolin have that makes it unique among mammals?',
    ['Feathers', 'Fur', 'Scales', 'A shell'], 2,
    'The pangolin is the only mammal in the world covered in hard, overlapping scales. Most mammals have fur or hair, but the pangolin\'s scales are made of keratin (the same material as your fingernails) and act like armour to protect it from predators.'),
  t(6, '### Animal Senses\n\nAnimals use their **senses** to find food, avoid danger, and communicate:\n\n| Sense | Body part | How animals use it |\n|-------|-----------|-------------------|\n| **Sight** | Eyes | Eagles have excellent eyesight and can spot a mouse from high in the sky |\n| **Hearing** | Ears | The bat-eared fox has huge ears to hear insects moving underground |\n| **Smell** | Nose | Elephants can smell water from several kilometres away |\n| **Touch** | Skin, whiskers | A cat\'s whiskers help it feel its way in the dark |\n| **Taste** | Tongue | Snakes flick their tongues to "taste" the air and find prey |\n\n### Comparing Animals\n\nLet us compare two South African animals:\n\n| Feature | African penguin | Leopard |\n|---------|----------------|--------|\n| **Body covering** | Feathers (waterproof) | Fur with spots for camouflage |\n| **How it moves** | Swims with flippers, waddles on land | Walks and runs on four legs, climbs trees |\n| **Where it lives** | Coastal areas (Boulders Beach) | Bushveld, forests, mountains |\n| **What it eats** | Fish and squid | Impala, monkeys, birds |\n| **Special sense** | Excellent underwater eyesight | Sharp night vision for hunting in the dark |'),
  q(7, 'The bat-eared fox has very large ears. How does this help it survive?',
    ['The ears keep it cool in summer', 'The ears help it hear insects moving underground', 'The ears help it fly short distances', 'The ears scare away predators'], 1,
    'The bat-eared fox uses its enormous ears to listen for insects — especially termites and beetle larvae — moving underground. Once it hears them, it digs them up with its small, sharp claws. This excellent hearing is a key adaptation for finding food.'),
  fb(8, 'The leopard tortoise is protected by a hard ___. Snakes flick their ___ to taste the air and find prey.',
    ['shell', 'tongues'],
    'Tortoises have hard shells made of bone covered in keratin plates. The shell protects the soft body inside from predators. Snakes use their forked tongues to pick up tiny chemical particles from the air, which helps them detect prey and danger.'),
  t(9, '### Summary\n\n- Animals have body parts like a head, body, limbs, tail, and skin covering.\n- Animals move in different ways: walking, flying, swimming, crawling, hopping, and climbing.\n- Body coverings include **fur**, **feathers**, **scales**, **shells**, and **moist skin**.\n- The **pangolin** is the only mammal with scales.\n- Animals use their five senses (sight, hearing, smell, touch, taste) to survive.\n- Different animals have different adaptations suited to where they live and what they eat.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Habitats of Animals (Term 2 — Life and Living)
// Lesson 1: What Is a Habitat + SA Habitats
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Habitats of Animals\n\n### What Is a Habitat?\n\nA **habitat** is the natural home of an animal or plant. It is the place where a living thing finds everything it needs to survive:\n\n- **Food** — to get energy\n- **Water** — to drink\n- **Shelter** — to hide from weather and predators\n- **Space** — to move, find food, and raise young\n\nIf a habitat does not provide all four of these things, the animal cannot survive there.\n\n### Different Habitats\n\nThere are many types of habitats around the world and in South Africa:\n\n| Habitat | Description | Temperature | Water |\n|---------|-------------|-------------|-------|\n| **Bushveld (savanna)** | Grasslands with scattered trees | Hot in summer, warm in winter | Summer rainfall |\n| **Ocean** | Saltwater covering most of Earth | Varies (warm to very cold) | Saltwater everywhere |\n| **Wetland** | Low areas that are often flooded | Warm to cool | Lots of fresh water |\n| **Forest** | Dense trees blocking out much of the sunlight | Cool and moist | Regular rain |\n| **Desert** | Very dry area with little plant life | Very hot days, cold nights | Very little rain |\n\n### South African Habitats\n\n**The Bushveld** (found in Limpopo, Mpumalanga, North West):\n- Home to the famous Big Five: lion, leopard, elephant, buffalo, rhinoceros\n- Kruger National Park is in the bushveld\n- Grasses and thorny acacia trees grow here\n\n**The Ocean** (along our 2 500 km coastline):\n- The warm Indian Ocean on the east coast and the cold Atlantic Ocean on the west coast\n- Home to great white sharks, dolphins, seals, and penguins'),
  q(2, 'What four things must a habitat provide for animals to survive?',
    ['Sun, moon, stars, and wind', 'Food, water, shelter, and space', 'Rocks, sand, soil, and air', 'Trees, flowers, grass, and rivers'], 1,
    'Every habitat must provide four essential things: food for energy, water to drink, shelter for protection from weather and predators, and enough space for the animal to move around, find food, and raise its young.'),
  fb(3, 'A ___ is the natural home of an animal or plant. The Kruger National Park is found in the ___ habitat.',
    ['habitat', 'bushveld'],
    'A habitat is where a living thing finds food, water, shelter, and space. The Kruger National Park, one of the largest game reserves in Africa, is located in the bushveld (savanna) of Limpopo and Mpumalanga provinces.'),
  t(4, '### More South African Habitats\n\n**Wetlands** (iSimangaliso Wetland Park in KwaZulu-Natal):\n- Marshes, swamps, and lakes that are home to hippos, crocodiles, and many types of birds\n- iSimangaliso is a World Heritage Site with both freshwater and marine wetlands\n- Frogs, fish eagles, and herons live here\n\n**Forests** (Knysna Forest in the Western Cape):\n- Dark, cool forests with tall yellowwood and stinkwood trees\n- Home to the rare Knysna elephants, bushbuck, and the beautiful Knysna turaco bird\n- Ferns and mosses grow on the forest floor\n\n**Desert** (Kalahari and Namib deserts):\n- Very little rain — some parts get less than 200 mm per year\n- Animals must be tough to survive here: meerkats, gemsbok (oryx), and the sidewinder adder\n- Plants like the !Nara melon and Welwitschia have special ways to get water\n\n### Why Different Habitats Have Different Animals\n\nEach habitat has different conditions (temperature, amount of water, type of plants). Animals that live in a habitat have special features that help them survive in those conditions. A penguin would not survive in the Kalahari Desert because it needs cold water and fish. A meerkat would not survive in the ocean because it cannot swim well or find insects there.'),
  q(5, 'Which South African habitat is home to hippos, crocodiles, and many bird species?',
    ['Desert', 'Bushveld', 'Wetland', 'Forest'], 2,
    'Wetlands like the iSimangaliso Wetland Park in KwaZulu-Natal are home to hippos, crocodiles, fish eagles, herons, and many other water-loving animals. Wetlands have lots of fresh water, which makes them rich habitats for many species.'),
  t(6, '### Micro-Habitats\n\nA **micro-habitat** is a very small habitat within a larger one. For example:\n\n- **Under a rock** — woodlice, beetles, and worms live in the cool, damp space under rocks\n- **In a tree trunk** — owls nest in holes in tree trunks, and bark beetles live under the bark\n- **In a pond** — mosquito larvae, tadpoles, and water beetles live in small ponds\n- **Under a log** — fungi, centipedes, and snails thrive in the moist, dark space\n\nYou can find micro-habitats in your own school yard or garden! Turn over a rock (carefully!) and see what tiny creatures live underneath.\n\n### Protecting Habitats\n\nSouth Africa protects animal habitats through:\n- **National parks** — Kruger, Table Mountain, Addo Elephant\n- **Marine protected areas** — to protect ocean animals and coral\n- **Wetland reserves** — iSimangaliso, De Hoop\n- **Laws** — it is against the law to destroy habitats of endangered species'),
  q(7, 'What is a micro-habitat?',
    ['A very large habitat like the ocean', 'A habitat in another country', 'A very small habitat within a larger one', 'A habitat with no animals'], 2,
    'A micro-habitat is a small area within a bigger habitat that has its own conditions. The space under a rock, inside a tree trunk, or in a small pond are all micro-habitats. They provide food, water, and shelter for small creatures like insects and worms.'),
  fb(8, 'The Kalahari is a ___ habitat where very little rain falls. iSimangaliso Wetland Park is a World Heritage Site in ___.',
    ['desert', 'KwaZulu-Natal'],
    'The Kalahari Desert gets very little rain and has extremely hot days and cold nights. Animals there, like meerkats and gemsbok, must be specially adapted. iSimangaliso Wetland Park in KwaZulu-Natal protects both freshwater and marine wetlands.'),
  t(9, '### Summary\n\n- A **habitat** provides food, water, shelter, and space.\n- South Africa has many habitats: bushveld, ocean, wetland, forest, and desert.\n- Each habitat has different conditions and different animals.\n- **Micro-habitats** are tiny habitats within bigger ones (under rocks, in tree trunks, in ponds).\n- South Africa protects habitats through national parks, marine reserves, and laws.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Habitats of Animals (Term 2 — Life and Living)
// Lesson 2: How Animals Are Adapted to Their Habitats
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson2 = [
  t(1, '## How Animals Are Adapted to Their Habitats\n\n### What Is an Adaptation?\n\nAn **adaptation** is a special body feature or behaviour that helps an animal survive in its habitat. Animals that are well adapted can find food, escape danger, and stay healthy in their environment.\n\nAdaptations take a very long time to develop — thousands or even millions of years!\n\n### Adaptations for the Bushveld\n\nThe bushveld is hot with summer rainfall. Animals here need to cope with heat and open grasslands:\n\n| Animal | Adaptation | How it helps |\n|--------|-----------|-------------|\n| **Elephant** | Large ears | Ears have many blood vessels; flapping them cools the blood down |\n| **Giraffe** | Very long neck | Reaches leaves high up in trees that other animals cannot get |\n| **Zebra** | Black and white stripes | Confuses predators when zebras run together as a herd |\n| **Impala** | Powerful back legs | Can leap up to 3 metres high to escape lions and cheetahs |\n| **Oxpecker bird** | Pointed beak | Sits on large animals and picks ticks and parasites off their skin |'),
  q(2, 'Why do elephants have such large ears?',
    ['To hear very well', 'To fan other animals', 'To cool their blood by flapping them', 'To scare away predators'], 2,
    'Elephant ears are full of blood vessels close to the surface. When an elephant flaps its ears, air cools the blood flowing through them, which helps lower the elephant\'s body temperature in the hot bushveld.'),
  fb(3, 'A ___ has a very long neck to reach leaves high up in trees. Zebra ___ may confuse predators when the herd runs together.',
    ['giraffe', 'stripes'],
    'The giraffe\'s long neck is an adaptation for reaching food that other animals cannot get — the leaves at the tops of acacia trees. Zebra stripes may confuse predators by making it hard to single out one animal when the herd is running.'),
  t(4, '### Adaptations for the Desert\n\nThe desert is very hot during the day and cold at night, with very little water. Animals need special adaptations to survive:\n\n| Animal | Adaptation | How it helps |\n|--------|-----------|-------------|\n| **Meerkat** | Lives in underground burrows | Cool underground during the hot day, warm at night |\n| **Gemsbok (oryx)** | Can survive without drinking water for weeks | Gets moisture from the plants it eats |\n| **Sidewinder adder** | Moves sideways across hot sand | Only two points of its body touch the hot sand at once |\n| **Bat-eared fox** | Large ears | Ears release heat to keep cool, and help hear insects underground |\n\n### Adaptations for the Ocean\n\nOcean animals need to swim, breathe, and find food in saltwater:\n\n| Animal | Adaptation | How it helps |\n|--------|-----------|-------------|\n| **Great white shark** | Streamlined body, sharp teeth | Swims fast to catch prey; teeth tear through fish and seals |\n| **Dolphin** | Blowhole on top of head | Breathes air at the surface without stopping swimming |\n| **African penguin** | Waterproof feathers, flipper-shaped wings | Stays dry and warm; swims instead of flies |\n| **Octopus** | Can change colour | Hides from predators by matching its surroundings (camouflage) |'),
  q(5, 'How does the gemsbok survive in the desert without drinking water?',
    ['It stores water in its hump', 'It gets moisture from the plants it eats', 'It drinks from underground rivers', 'It collects dew on its horns'], 1,
    'The gemsbok (also called oryx) is amazingly adapted to desert life. It can survive for weeks without drinking because it gets enough moisture from the plants and wild melons it eats. It also has a special system in its nose that cools blood before it reaches the brain.'),
  t(6, '### Adaptations for the Forest\n\nForests are dark, cool, and have many trees. Animals need to move through dense vegetation:\n\n| Animal | Adaptation | How it helps |\n|--------|-----------|-------------|\n| **Chameleon** | Changes colour, eyes move separately | Camouflage to hide; can look in two directions at once for insects |\n| **Bushbuck** | Brown colouring with white spots | Hard to see among dappled sunlight on the forest floor |\n| **Knysna turaco** | Green feathers | Blends in with green forest leaves |\n| **Tree frog** | Sticky toe pads | Can grip wet, slippery branches and leaves |\n\n### Adaptations for Wetlands\n\n| Animal | Adaptation | How it helps |\n|--------|-----------|-------------|\n| **Hippo** | Eyes and nostrils on top of head | Can see and breathe while mostly underwater |\n| **Crocodile** | Powerful tail for swimming | Moves quickly through water to catch prey |\n| **Heron** | Long legs | Can wade in shallow water to catch fish |\n| **Frog** | Moist skin, webbed feet | Breathes through skin; webbed feet help with swimming |'),
  q(7, 'How do chameleons use camouflage to survive in the forest?',
    ['They run very fast to escape', 'They change colour to blend in with their surroundings', 'They hide underground', 'They climb to the very top of trees'], 1,
    'Chameleons can change the colour of their skin to match their surroundings. This is called camouflage. In the forest, they turn green to blend in with leaves, making them nearly invisible to both predators and the insects they hunt.'),
  fb(8, 'A hippo\'s eyes and nostrils are on top of its ___ so it can see and breathe while mostly underwater. The ___ can change colour to blend in with its surroundings.',
    ['head', 'chameleon'],
    'Hippos spend most of their day in water to keep cool. Their eyes and nostrils are placed on the very top of their head so they can still see and breathe while the rest of their body stays hidden beneath the water surface. Chameleons change colour for camouflage.'),
  t(9, '### Summary\n\n- An **adaptation** is a special feature or behaviour that helps an animal survive in its habitat.\n- **Bushveld** animals: elephants cool down with large ears, giraffes reach high leaves, zebras confuse predators with stripes.\n- **Desert** animals: meerkats live in cool burrows, gemsbok survive without water, sidewinders move across hot sand.\n- **Ocean** animals: sharks are streamlined, penguins have waterproof feathers, dolphins breathe through blowholes.\n- **Forest** animals: chameleons change colour, bushbuck have camouflage, tree frogs have sticky toes.\n- **Wetland** animals: hippos have eyes on top of their heads, herons have long legs for wading.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Materials Around Us (Term 2 — Matter and Materials)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Materials Around Us\n\n### What Are Materials?\n\nEverything around us is made from **materials**. The chair you sit on, the clothes you wear, and the food you eat are all made from different materials. A material is the substance that an object is made from.\n\n### Natural and Manufactured Materials\n\nMaterials can be sorted into two groups:\n\n**Natural materials** come from nature — from plants, animals, or the ground:\n| Material | Where it comes from |\n|----------|-------------------|\n| **Wood** | Trees |\n| **Cotton** | Cotton plant |\n| **Wool** | Sheep |\n| **Leather** | Animal skin |\n| **Stone/rock** | The ground |\n| **Sand** | Crushed rocks |\n| **Clay** | The ground |\n\n**Manufactured (human-made) materials** are made by people in factories:\n| Material | Made from |\n|----------|-----------|\n| **Plastic** | Oil (petroleum) |\n| **Glass** | Sand, heated to a very high temperature |\n| **Metal** (steel, aluminium) | Rocks (ore) mined from the ground |\n| **Rubber** | Rubber tree sap (natural) or oil (synthetic) |\n| **Brick** | Clay, baked in a kiln |\n| **Paper** | Wood pulp from trees |'),
  q(2, 'Which of these is a natural material?',
    ['Plastic', 'Glass', 'Wool', 'Steel'], 2,
    'Wool is a natural material because it comes directly from nature — it is sheared (cut) from sheep. Plastic is made from oil in factories, glass is made by heating sand, and steel is made from iron ore. These are all manufactured materials.'),
  fb(3, '___ materials come from nature, while ___ materials are made by people in factories.',
    ['Natural', 'manufactured'],
    'Natural materials come directly from plants, animals, or the earth (wood, cotton, wool, stone). Manufactured materials are created by people, usually in factories, by changing natural materials (plastic from oil, glass from sand, paper from wood).'),
  t(4, '### Properties of Materials\n\n**Properties** describe what a material is like and how it behaves. We use properties to choose the right material for the right job.\n\n| Property | Meaning | Example |\n|----------|---------|--------|\n| **Hard** | Difficult to scratch or dent | Stone, metal, glass |\n| **Soft** | Easy to squash or bend | Cotton, wool, sponge |\n| **Rough** | Bumpy surface — not smooth | Sandpaper, brick, tree bark |\n| **Smooth** | Even surface — no bumps | Glass, plastic, polished metal |\n| **Strong** | Does not break easily | Steel, stone, hardwood |\n| **Weak** | Breaks easily | Paper, thin plastic, chalk |\n| **Waterproof** | Does not let water through | Plastic, glass, rubber |\n| **Absorbent** | Soaks up water | Cotton, sponge, paper towel |\n| **Flexible** | Can bend without breaking | Rubber, fabric, thin plastic |\n| **Rigid** | Cannot bend — stays in shape | Glass, metal, brick |\n| **Transparent** | Can see through it | Glass, clear plastic |\n| **Opaque** | Cannot see through it | Wood, metal, brick |'),
  q(5, 'You need to make a raincoat. Which property is MOST important for the material?',
    ['Soft', 'Rough', 'Waterproof', 'Transparent'], 2,
    'A raincoat must be waterproof — it must not let water through. If the material were absorbent (like cotton), the rain would soak through and you would get wet. That is why raincoats are made from plastic or rubber-coated materials.'),
  t(6, '### Choosing the Right Material\n\nWhen we make something, we need to choose the best material for the job. We think about what properties are needed:\n\n| Object | Properties needed | Best material |\n|--------|-----------------|---------------|\n| **Window** | Transparent, hard, smooth | Glass |\n| **School bag** | Strong, waterproof, flexible | Nylon or canvas |\n| **Cooking pot** | Strong, heat-resistant | Metal (steel or aluminium) |\n| **Towel** | Soft, absorbent | Cotton |\n| **Roof** | Strong, waterproof, rigid | Metal sheets (zinc) or tiles |\n| **Jersey** | Soft, warm, flexible | Wool or fleece |\n\n### Materials in South Africa\n\nSouth Africa is rich in natural materials:\n- **Mining** — gold, platinum, iron, and diamonds are mined from the ground\n- **Forestry** — trees in Mpumalanga and KwaZulu-Natal are grown for wood and paper\n- **Farming** — sheep in the Karoo provide wool; cotton is grown in Limpopo\n- **Clay** — used to make bricks, pottery, and traditional African pots'),
  q(7, 'Why is glass used to make windows instead of wood?',
    ['Glass is cheaper than wood', 'Glass is transparent so light can come through', 'Glass is softer than wood', 'Glass is more flexible'], 1,
    'Glass is transparent (you can see through it) and allows light to enter a building while keeping wind and rain out. Wood is opaque (you cannot see through it), so it would block the light and view. Choosing the right material for the right job is all about matching properties to needs.'),
  fb(8, 'A material that soaks up water is called ___. A material that you can see through is called ___.',
    ['absorbent', 'transparent'],
    'Absorbent materials soak up water — like a sponge or a cotton towel. Transparent materials allow light to pass through so you can see through them — like glass and clear plastic. These properties help us choose the best material for each job.'),
  t(9, '### Summary\n\n- **Materials** are what objects are made from.\n- **Natural materials** come from nature (wood, cotton, wool, stone).\n- **Manufactured materials** are made by people (plastic, glass, steel, paper).\n- Materials have **properties** like hard/soft, rough/smooth, strong/weak, waterproof/absorbent, flexible/rigid, transparent/opaque.\n- We choose materials based on the **properties** needed for the job.\n- South Africa is rich in natural materials from mining, forestry, and farming.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Changing Materials (Term 2 — Matter and Materials)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Changing Materials\n\n### Heating and Cooling Materials\n\nWhen we **heat** or **cool** materials, they can change. These changes happen all around us every day.\n\n**What happens when we heat materials:**\n- **Butter** melts and becomes a liquid\n- **Water** boils and becomes steam (a gas)\n- **Chocolate** melts and becomes soft and runny\n- **An egg** cooks and becomes hard and solid\n- **Clay** in a kiln becomes hard brick\n\n**What happens when we cool materials:**\n- **Water** freezes and becomes ice (a solid)\n- **Melted candle wax** cools and becomes solid again\n- **Jelly** sets and becomes firm when cooled in the fridge\n- **Lava** cools and becomes solid rock\n\n### Melting and Freezing\n\n**Melting** is when a solid turns into a liquid because of heat:\n- Ice cream melts on a hot Durban day\n- Butter melts in a hot pan\n- Candle wax melts near the flame\n\n**Freezing** is when a liquid turns into a solid because of cold:\n- Water freezes into ice in the freezer\n- In winter, frost forms when water in the air freezes on cold surfaces in the Free State and Highveld'),
  q(2, 'What happens when you heat butter?',
    ['It freezes', 'It melts into a liquid', 'It becomes harder', 'It disappears'], 1,
    'When butter is heated, it melts — it changes from a solid into a liquid. This is because heat gives energy to the tiny particles in the butter, making them move faster and spread apart, which turns the solid into a liquid.'),
  fb(3, 'When a solid turns into a liquid because of heat, it is called ___. When a liquid turns into a solid because of cold, it is called ___.',
    ['melting', 'freezing'],
    'Melting is the change from solid to liquid when heat is added (ice melts into water). Freezing is the change from liquid to solid when heat is removed (water freezes into ice). These are opposite processes.'),
  t(4, '### Dissolving and Mixing\n\n**Dissolving** is when a solid mixes completely into a liquid and seems to disappear:\n- Sugar dissolves in tea — you cannot see the sugar, but the tea tastes sweet\n- Salt dissolves in water — you cannot see the salt, but the water tastes salty\n- The solid has NOT disappeared — it has broken into tiny pieces you cannot see\n\n**Not all solids dissolve:**\n- Sand does NOT dissolve in water — it sinks to the bottom\n- Flour does NOT dissolve — it makes the water cloudy but settles over time\n\n**Mixing** is when two or more materials are combined:\n- Mixing sand and gravel — you can still see both materials\n- Mixing oil and water — they do NOT mix; the oil floats on top\n- Mixing flour and water — they combine to make dough\n\n### Evaporation\n\n**Evaporation** is when a liquid turns into a gas (water vapour):\n- Wet clothes on the washing line dry because water evaporates into the air\n- Puddles on the playground disappear on a sunny day\n- In South Africa, salt is harvested by letting sea water evaporate in the sun (at Saldanha Bay on the West Coast), leaving the salt behind'),
  q(5, 'What happens when sugar is added to hot tea and stirred?',
    ['The sugar melts', 'The sugar dissolves — it breaks into tiny pieces you cannot see', 'The sugar evaporates', 'The sugar freezes'], 1,
    'Sugar dissolves in hot tea. Dissolving means the sugar breaks into pieces so tiny that you cannot see them anymore. The sugar has not disappeared — it is still there, which is why the tea tastes sweet! Hot liquids dissolve things faster than cold ones.'),
  t(6, '### Reversible and Irreversible Changes\n\n**Reversible changes** can be undone — you can get the original material back:\n\n| Change | How to reverse it |\n|--------|------------------|\n| Melting ice | Freeze the water again |\n| Dissolving salt in water | Evaporate the water — salt is left behind |\n| Melting chocolate | Cool it down — it becomes solid again |\n| Freezing water | Heat the ice — it melts back to water |\n\n**Irreversible changes** CANNOT be undone — the material is permanently changed:\n\n| Change | Why you cannot reverse it |\n|--------|-------------------------|\n| Cooking an egg | The egg is permanently hard — you cannot uncook it |\n| Burning wood | Ash and smoke are formed — you cannot get the wood back |\n| Baking bread | The dough permanently changes — you cannot get flour and water back |\n| Mixing cement | Once cement sets, it becomes rock-hard and stays that way |\n\n### Real-Life Examples in South Africa\n\n- **Making boerewors on a braai** is an irreversible change — the meat is cooked and cannot be uncooked\n- **Making ice lollies** is a reversible change — the juice freezes and can melt back to liquid\n- **Making rooibos tea** — the leaves change colour and flavour when hot water is added (irreversible)'),
  q(7, 'Which of these is an irreversible change?',
    ['Melting ice cream', 'Freezing water', 'Burning wood on a braai', 'Dissolving sugar in tea'], 2,
    'Burning wood is irreversible — once wood is burned, it turns into ash and smoke. You can never turn the ash back into wood. Melting ice cream, freezing water, and dissolving sugar are all reversible because you can get the original materials back.'),
  fb(8, 'A change that can be undone is called a ___ change. Cooking an egg is an example of an ___ change.',
    ['reversible', 'irreversible'],
    'Reversible changes can be undone — like melting ice (you can freeze it again). Irreversible changes cannot be undone — like cooking an egg. Once the egg is cooked, you can never make it raw again. The heat permanently changes the structure of the egg.'),
  t(9, '### Summary\n\n- **Heating** can cause melting, cooking, and evaporation.\n- **Cooling** can cause freezing and solidifying.\n- **Melting** = solid to liquid. **Freezing** = liquid to solid. **Evaporation** = liquid to gas.\n- **Dissolving** is when a solid mixes completely into a liquid.\n- **Reversible changes** can be undone (melting, freezing, dissolving).\n- **Irreversible changes** cannot be undone (cooking, burning, baking).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Structures (Term 2 — Technology)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Structures\n\n### What Is a Structure?\n\nA **structure** is anything that is built or made to hold weight or support a load. Structures are all around us:\n\n- **Buildings** — houses, schools, shopping centres\n- **Bridges** — the Nelson Mandela Bridge in Johannesburg, the Bloukrans Bridge in the Eastern Cape\n- **Towers** — the Hillbrow Tower, electricity pylons, cell phone towers\n- **Furniture** — tables, chairs, shelves\n- **Natural structures** — bird nests, spider webs, beehives, caves\n\nA good structure must be:\n- **Strong** — it must not break under the weight it carries\n- **Stable** — it must not fall over easily\n- **Rigid** — it must keep its shape and not bend or sag\n\n### What Makes Structures Strong?\n\nThe strength of a structure depends on:\n\n1. **The materials used** — steel is stronger than cardboard; brick is stronger than paper\n2. **The shape** — some shapes are stronger than others\n3. **How the parts are joined** — glued joints are weaker than bolted or welded joints\n4. **The base** — a wide base makes a structure more stable'),
  q(2, 'What three things must a good structure be?',
    ['Tall, thin, and flexible', 'Strong, stable, and rigid', 'Light, colourful, and round', 'Smooth, soft, and small'], 1,
    'A good structure must be strong (it does not break), stable (it does not fall over), and rigid (it keeps its shape). Without all three of these qualities, the structure could collapse, topple, or bend.'),
  fb(3, 'A ___ is anything built to hold weight or support a load. A wide ___ makes a structure more stable and less likely to fall over.',
    ['structure', 'base'],
    'Structures are built to support loads — the weight of people, furniture, cars, or even the structure itself. A wide base spreads the weight over a larger area, making the structure more stable, just like how you stand with your feet apart to balance better.'),
  t(4, '### Strong Shapes\n\nSome shapes are much stronger than others:\n\n**The Triangle** — the STRONGEST shape in building:\n- A triangle cannot be pushed out of shape easily\n- If you push on one corner, the other two sides hold it in place\n- This is why you see triangles in bridges, roof trusses, and electricity pylons\n\n**The Arch** — very strong for bridges and doorways:\n- An arch spreads weight evenly along its curved shape\n- The weight travels along the curve and down into the supports on each side\n- Many old buildings and bridges in South Africa use arches\n\n**The Cylinder (tube shape)** — strong and stable:\n- Round shapes spread weight evenly\n- This is why pipes, silos, and water tanks are round\n- The roundavel (round hut) in traditional South African architecture is strong because of its round shape\n\n### Weak Shapes\n\n- A **square** or **rectangle** can easily be pushed into a diamond shape — it is not strong unless it has diagonal supports (which create triangles!)\n- A flat piece of paper is very weak, but if you fold it into a tube or zigzag shape, it becomes much stronger'),
  q(5, 'Which shape is the strongest for building structures?',
    ['Circle', 'Square', 'Triangle', 'Rectangle'], 2,
    'The triangle is the strongest shape for building. Unlike a square or rectangle, a triangle cannot be pushed out of shape because its three sides lock together. This is why triangles are used in bridges, roof trusses, and pylons everywhere.'),
  t(6, '### Making Paper Stronger\n\nA flat piece of paper is weak — it cannot even hold a small toy car. But we can make paper much stronger by changing its shape:\n\n1. **Fold it into a tube** — a paper tube can support much more weight than a flat sheet\n2. **Fold it into a zigzag (concertina)** — the folds act like tiny walls that resist bending\n3. **Roll it into a cone** — cones spread weight from the point down to the wide base\n4. **Fold triangles** — triangular shapes resist being pushed flat\n\nThis is the same principle used in real buildings — corrugated iron roofing (zigzag shape) is much stronger than a flat sheet of the same metal.\n\n### South African Structures\n\n- **The Bloukrans Bridge** (Eastern Cape) — the tallest bridge in Africa, using huge arches to support the road\n- **Soccer City Stadium** (FNB Stadium, Johannesburg) — uses a round, shell-like structure inspired by a calabash (African pot)\n- **Traditional rondavels** — round huts with cone-shaped grass roofs. The round shape makes them strong against wind\n- **Electricity pylons** — made of steel triangles to be light but very strong'),
  q(7, 'Why is corrugated iron (zigzag shape) stronger than a flat sheet of the same metal?',
    ['Because it is thicker', 'Because the zigzag folds resist bending', 'Because it is painted', 'Because it is heavier'], 1,
    'The zigzag folds in corrugated iron act like tiny walls that resist bending. A flat sheet bends easily, but when it is folded into a zigzag shape, the folds support each other and make the whole sheet much stronger and more rigid. Shape matters!'),
  fb(8, 'The ___ is the strongest shape in building and is used in bridges and pylons. An ___ spreads weight evenly along its curved shape.',
    ['triangle', 'arch'],
    'Triangles are the strongest building shape because their three sides lock together and cannot be pushed out of shape. Arches are very strong for bridges and doorways because they spread the load evenly along the curve and down into the supports.'),
  t(9, '### Summary\n\n- A **structure** is anything built to hold weight or support a load.\n- Good structures are **strong**, **stable**, and **rigid**.\n- The **triangle** is the strongest shape, followed by the **arch** and **cylinder**.\n- Changing the shape of a material (folding, rolling) can make it much stronger.\n- South African structures include the Bloukrans Bridge, FNB Stadium, rondavels, and electricity pylons.\n- We can design and build strong structures by using strong materials and strong shapes.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Energy Around Us (Term 3 — Energy and Change)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Energy Around Us\n\n### What Is Energy?\n\n**Energy** is what makes things happen. Energy makes things move, heat up, light up, and make sound. Without energy, nothing would work — no lights, no cars, no cooking, and no life!\n\nYou cannot see energy, but you can see what it DOES:\n- A light bulb glows — that is **light energy**\n- A stove gets hot — that is **heat energy**\n- Music plays from a speaker — that is **sound energy**\n- A ball rolls across the floor — that is **movement energy**\n- A battery powers a torch — that is **electrical energy**\n\n### Sources of Energy\n\nEnergy comes from different places:\n\n| Source | Type of energy | How we use it |\n|--------|---------------|---------------|\n| **The Sun** | Light and heat | Warms the Earth, helps plants grow, solar panels make electricity |\n| **Food** | Chemical energy | Gives our bodies energy to move, think, and grow |\n| **Fuel** (petrol, coal, wood, gas) | Chemical energy | Powers cars, heats homes, makes electricity |\n| **Batteries** | Electrical energy | Powers torches, phones, toys, remote controls |\n| **Wind** | Movement energy | Wind turbines make electricity |\n| **Moving water** | Movement energy | Hydroelectric dams make electricity |'),
  q(2, 'Which source of energy helps plants grow and warms the Earth?',
    ['Batteries', 'Wind', 'The Sun', 'Coal'], 2,
    'The Sun is the most important source of energy on Earth. It provides light and heat that plants need to grow (photosynthesis) and warms the planet to temperatures where life can exist. Without the Sun, the Earth would be dark and frozen.'),
  fb(3, 'Energy is what makes things ___. The food we eat gives our bodies ___ energy to move and grow.',
    ['happen', 'chemical'],
    'Energy is the ability to make things happen — to move, heat, light up, or make sound. The food we eat contains chemical energy stored in nutrients like carbohydrates, fats, and proteins. Our bodies convert this chemical energy into movement and heat.'),
  t(4, '### How We Use Energy Every Day\n\nThink about your day from the moment you wake up:\n\n1. **Morning** — the alarm clock uses electrical energy; you eat breakfast (food energy); you switch on the light (electrical → light energy)\n2. **Getting to school** — walking uses food energy; a car or bus uses petrol (fuel energy); a bicycle uses your body\'s energy\n3. **At school** — lights and fans use electrical energy; you use food energy to think and learn; a computer uses electrical energy\n4. **At home** — the stove uses electrical or gas energy to cook dinner; the TV uses electrical energy; a heater uses energy to warm the house\n\n### Energy in South Africa\n\nMost of South Africa\'s electricity comes from **Eskom**, our national power company. Eskom makes electricity mainly by burning **coal** at large power stations.\n\nBut there is a problem: coal is running out and burning it pollutes the air. South Africa is now also using:\n- **Solar energy** — from the sunny Northern Cape and Free State\n- **Wind energy** — from windy areas along the coast, especially the Eastern Cape\n- **Hydroelectric energy** — from dams (limited in SA because we do not have many big rivers)'),
  q(5, 'How does Eskom make most of South Africa\'s electricity?',
    ['From wind turbines', 'By burning coal at power stations', 'From solar panels', 'From hydroelectric dams'], 1,
    'Eskom generates most of South Africa\'s electricity by burning coal at large power stations. South Africa has large coal deposits, mainly in Mpumalanga. However, burning coal causes air pollution and contributes to climate change, so the country is working to use more renewable energy sources.'),
  t(6, '### Saving Energy\n\nBecause energy is precious and can be expensive, we should all try to save energy:\n\n**At home:**\n- Switch off lights when you leave a room\n- Turn off the TV and computer when not using them\n- Use energy-saving light bulbs (LED bulbs use much less electricity)\n- Do not leave the fridge door open — cold air escapes and the fridge uses more energy\n- Use a blanket instead of a heater when it is just a little cold\n\n**At school:**\n- Open curtains to use sunlight instead of electric lights during the day\n- Switch off classroom lights when going outside for break\n\n**Why saving energy matters:**\n- It saves money on electricity bills\n- It reduces pollution from burning coal\n- It helps prevent load shedding\n\n### Load Shedding\n\nSouth Africa sometimes experiences **load shedding** — when Eskom switches off electricity in different areas because there is not enough power for everyone. This happens when power stations cannot produce enough electricity to meet demand. Saving energy helps reduce load shedding.'),
  q(7, 'Which of these is a good way to save energy at home?',
    ['Leave all the lights on so you can see everywhere', 'Switch off lights when you leave a room', 'Keep the fridge door open to cool the kitchen', 'Leave the TV on all day'], 1,
    'Switching off lights when you leave a room is one of the simplest and most effective ways to save energy. Every light left on unnecessarily uses electricity that costs money and requires coal to be burned at the power station.'),
  fb(8, 'South Africa sometimes has ___ ___ when Eskom cannot produce enough electricity for everyone. LED light bulbs use much less ___ than old bulbs.',
    ['load', 'shedding', 'electricity'],
    'Load shedding is when Eskom turns off electricity in different areas to prevent the whole power system from collapsing. LED (Light Emitting Diode) bulbs use up to 80% less electricity than old incandescent bulbs and last much longer.'),
  t(9, '### Summary\n\n- **Energy** makes things happen — move, heat, light, and sound.\n- Energy sources include the **Sun**, **food**, **fuel**, **batteries**, **wind**, and **water**.\n- We use energy all day long — for lights, cooking, transport, and learning.\n- Most of South Africa\'s electricity comes from **Eskom** burning **coal**.\n- We should save energy by switching off lights and appliances when not in use.\n- **Load shedding** happens when there is not enough electricity for everyone.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Movement and Energy (Term 3 — Energy and Change)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Movement and Energy\n\n### Push and Pull Forces\n\nA **force** is a push or a pull that makes something move, stop, speed up, slow down, or change direction.\n\n**Push forces:**\n- Pushing a shopping trolley at Shoprite\n- Kicking a soccer ball\n- Pushing a friend on a swing\n- Closing a door\n\n**Pull forces:**\n- Pulling a wagon\n- Opening a drawer\n- Reeling in a fishing line\n- A dog pulling on its lead\n\nForces can:\n- Make a still object **start moving** (kicking a ball)\n- Make a moving object **stop** (catching a ball)\n- Make an object move **faster** (pushing harder on bicycle pedals)\n- Make an object move **slower** (braking on a bicycle)\n- Make an object **change direction** (hitting a cricket ball with a bat)\n\n### Gravity — The Invisible Pull\n\n**Gravity** is a force that pulls everything towards the ground. It is why:\n- A ball falls back down when you throw it up\n- You come down after jumping\n- Rain falls from the clouds\n- Rivers flow downhill'),
  q(2, 'What is a force?',
    ['A type of energy', 'A push or pull that makes something move, stop, or change direction', 'Something that only machines can make', 'A material used in building'], 1,
    'A force is a push or a pull that can make an object start moving, stop moving, speed up, slow down, or change direction. Every time something moves or changes how it moves, a force is involved.'),
  fb(3, 'A ___ is a push or a pull. The force that pulls everything towards the ground is called ___.',
    ['force', 'gravity'],
    'Forces come in two types: pushes and pulls. Gravity is the force that pulls all objects toward the centre of the Earth. It is why things fall down and not up, and why you stay on the ground instead of floating away.'),
  t(4, '### Fast and Slow\n\n**Speed** is how fast something is moving. Some things move fast and some move slowly.\n\n| Fast movers | Speed | Slow movers | Speed |\n|------------|-------|-------------|-------|\n| Cheetah | 120 km/h | Tortoise | 0.3 km/h |\n| Peregrine falcon | 390 km/h (diving) | Snail | 0.05 km/h |\n| Sports car | 200+ km/h | Garden worm | Very slow! |\n\nWhat affects how fast something moves?\n- **The force** — a harder push or pull makes things move faster\n- **The weight** — heavier objects need a bigger force to move\n- **The surface** — smooth surfaces allow faster movement; rough surfaces slow things down\n\n### Friction — The Slowing Force\n\n**Friction** is a force that acts when two surfaces rub against each other. Friction always works AGAINST movement — it slows things down.\n\n**Where friction helps us:**\n- The rough soles on your school shoes grip the floor so you do not slip\n- Car tyres grip the road so the car does not slide\n- Brakes on a bicycle use friction to slow down and stop\n\n**Where friction slows us down:**\n- A ball rolling on rough grass slows down quickly\n- A heavy box is hard to push across a rough floor\n- Rubbing your hands together makes them warm — friction produces heat'),
  q(5, 'What does friction do to a moving object?',
    ['Speeds it up', 'Slows it down', 'Makes it lighter', 'Lifts it up'], 1,
    'Friction is a force that always acts against the direction of movement. When two surfaces rub together, friction slows the moving object down. This is why a ball rolling on grass eventually stops — friction between the ball and the grass slows it down.'),
  t(6, '### Wheels Reduce Friction\n\n**Wheels** are one of the most important inventions ever! They reduce friction and make it easier to move heavy things.\n\n**Without wheels:**\n- Dragging a heavy box across the floor is very hard — lots of friction\n- The rough surfaces rub together and resist movement\n\n**With wheels:**\n- A box on a trolley rolls easily — much less friction\n- The wheels turn smoothly, and only a small part touches the ground at a time\n\n**Examples of wheels reducing friction:**\n- Shopping trolleys at Pick n Pay\n- Wheelbarrows used in gardens and on building sites\n- Skateboard wheels on smooth concrete\n- Car wheels on tar roads\n- Roller skates on a smooth floor\n\n### Other Ways to Reduce Friction\n\n- **Oil and grease** — put on bicycle chains and car engines to make parts slide smoothly\n- **Smooth surfaces** — polished floors have less friction than rough ones\n- **Ball bearings** — tiny steel balls inside wheels that let them spin freely\n- **Wax** — surfers wax their boards, and skiers wax their skis\n\n### Friction in Sports\n\nIn South African sports:\n- **Cricket** — the ball bounces differently on rough vs smooth pitches because of friction\n- **Rugby** — players wear boots with studs for extra grip (more friction) on the field\n- **Swimming** — swimmers wear smooth caps and swimsuits to reduce friction with water'),
  q(7, 'Why are wheels important for moving heavy objects?',
    ['They make objects lighter', 'They reduce friction so objects move more easily', 'They add more friction', 'They push objects forward by themselves'], 1,
    'Wheels reduce friction between the object and the surface. Without wheels, you have to drag the object across the ground, creating lots of friction. With wheels, only a small part of the wheel touches the ground at a time, and it rolls instead of dragging, making movement much easier.'),
  fb(8, '___ is a force that slows things down when two surfaces rub together. ___ reduce friction and make it easier to move heavy objects.',
    ['Friction', 'Wheels'],
    'Friction is created whenever two surfaces rub against each other — it always acts against movement, slowing things down. Wheels are one of the best ways to reduce friction because they roll instead of drag, greatly reducing the contact between the object and the surface.'),
  t(9, '### Summary\n\n- A **force** is a push or a pull that affects movement.\n- **Gravity** pulls everything towards the ground.\n- **Speed** depends on the force, weight, and surface.\n- **Friction** is a force that slows things down when surfaces rub together.\n- Friction can be helpful (shoes gripping the floor) or unhelpful (hard to push a heavy box).\n- **Wheels** reduce friction and make movement easier.\n- **Oil**, **smooth surfaces**, and **ball bearings** also reduce friction.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: The Earth (Term 3 — Planet Earth and Beyond)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## The Earth\n\n### The Shape of the Earth\n\nThe Earth is shaped like a **sphere** — a ball shape. It looks round from space. Even though it looks flat when you stand on the ground, that is only because the Earth is so HUGE that you cannot see the curve.\n\nHow do we know the Earth is round?\n- **Photographs from space** — astronauts and satellites have taken pictures showing the Earth as a round ball\n- **Ships disappearing over the horizon** — when a ship sails away, the bottom disappears first because of the curve\n- **The shadow on the Moon** — during a lunar eclipse, the Earth\'s shadow on the Moon is always round\n\n### Land and Water\n\nThe Earth\'s surface is covered by:\n- **Water** — about 70% (most of it is ocean)\n- **Land** — about 30%\n\nOn a globe or world map:\n- **Blue** areas show water (oceans, seas, lakes, rivers)\n- **Green and brown** areas show land (continents, islands)'),
  q(2, 'What shape is the Earth?',
    ['Flat like a pancake', 'A sphere (ball shape)', 'A cube (box shape)', 'A cylinder (tube shape)'], 1,
    'The Earth is a sphere — a round ball shape. We know this from photographs taken by astronauts in space, from how ships disappear over the horizon, and from the round shadow the Earth casts on the Moon during lunar eclipses.'),
  fb(3, 'About ___% of the Earth\'s surface is covered by water. The Earth is shaped like a ___.',
    ['70', 'sphere'],
    'Water covers about 70% of the Earth\'s surface, mostly in the form of vast oceans. The remaining 30% is land. The Earth is a sphere (ball shape), which we can see clearly in photographs taken from space.'),
  t(4, '### Continents and Oceans\n\nThe land on Earth is divided into **seven continents** (large landmasses):\n\n| Continent | Location | Fun fact |\n|-----------|----------|----------|\n| **Africa** | South of Europe, between Atlantic and Indian Oceans | Home to South Africa! The second-largest continent |\n| **Europe** | North of Africa, west of Asia | Contains many small countries close together |\n| **Asia** | East of Europe, north of Indian Ocean | The biggest continent — home to China and India |\n| **North America** | West of Atlantic Ocean | Home to the USA, Canada, and Mexico |\n| **South America** | South of North America | Home to the Amazon rainforest |\n| **Australia** (Oceania) | Southeast of Asia, surrounded by oceans | The smallest continent, also a country |\n| **Antarctica** | At the very bottom (South Pole) | Covered in ice, no permanent people live there |\n\nThe Earth also has **five oceans**:\n\n| Ocean | Location |\n|-------|----------|\n| **Atlantic Ocean** | Between Africa/Europe and the Americas |\n| **Indian Ocean** | South of Asia, east of Africa |\n| **Pacific Ocean** | Between Asia/Australia and the Americas — the biggest ocean |\n| **Southern Ocean** | Around Antarctica |\n| **Arctic Ocean** | At the very top (North Pole) — the smallest ocean |'),
  q(5, 'On which continent is South Africa located?',
    ['Europe', 'Asia', 'Africa', 'South America'], 2,
    'South Africa is on the continent of Africa — the second-largest continent in the world. Africa is located south of Europe, between the Atlantic Ocean to the west and the Indian Ocean to the east. South Africa is at the very southern tip of Africa.'),
  t(6, '### South Africa\'s Position on the Globe\n\nSouth Africa is found at the **southern tip of Africa**. Here are some important facts about our country\'s position:\n\n- South Africa is in the **Southern Hemisphere** (the bottom half of the Earth)\n- It lies between the **Atlantic Ocean** (west coast) and the **Indian Ocean** (east coast)\n- The two oceans meet near **Cape Point** (close to Cape Town)\n- South Africa has **nine provinces**: Western Cape, Eastern Cape, Northern Cape, Free State, KwaZulu-Natal, Gauteng, Limpopo, Mpumalanga, North West\n\n### South Africa\'s Neighbours\n\n| Direction | Countries |\n|-----------|----------|\n| **North** | Botswana, Zimbabwe |\n| **Northeast** | Mozambique |\n| **Northwest** | Namibia |\n| **Surrounded by SA** | Lesotho (completely inside SA), Eswatini (partly bordered) |\n\n### The Equator and the Hemispheres\n\n- The **Equator** is an imaginary line around the middle of the Earth\n- Countries above the Equator are in the **Northern Hemisphere**\n- Countries below the Equator are in the **Southern Hemisphere**\n- South Africa is below the Equator, so we are in the **Southern Hemisphere**\n- This is why our seasons are opposite to countries in the Northern Hemisphere — when it is summer in South Africa, it is winter in Europe!'),
  q(7, 'Which two oceans border South Africa?',
    ['Pacific and Arctic', 'Atlantic and Indian', 'Atlantic and Pacific', 'Indian and Southern'], 1,
    'South Africa is bordered by the Atlantic Ocean on the west coast and the Indian Ocean on the east coast. These two oceans meet near Cape Point, close to Cape Town. The Atlantic side tends to have colder water, while the Indian Ocean side is warmer.'),
  fb(8, 'South Africa is in the ___ Hemisphere because it is below the Equator. The country called ___ is completely surrounded by South Africa.',
    ['Southern', 'Lesotho'],
    'Because South Africa lies below the Equator, it is in the Southern Hemisphere. Lesotho is a small mountainous country completely surrounded by South Africa — it is one of only a few countries in the world that are entirely enclosed within another country.'),
  t(9, '### Summary\n\n- The Earth is shaped like a **sphere** (ball).\n- About **70% water** and **30% land** cover the Earth\'s surface.\n- There are **seven continents** and **five oceans**.\n- South Africa is on the continent of **Africa**, at its southern tip.\n- South Africa is in the **Southern Hemisphere**, between the **Atlantic** and **Indian** Oceans.\n- The **Equator** divides the Earth into Northern and Southern Hemispheres.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: Rocks and Soil (Term 4 — Planet Earth and Beyond)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Rocks and Soil\n\n### Different Types of Rocks\n\nRocks are natural, solid materials made of **minerals**. There are many different types of rocks, and they have different properties.\n\n| Rock | Colour | Hardness | Texture | Where found in SA |\n|------|--------|----------|---------|------------------|\n| **Granite** | Grey, pink, or white speckled | Very hard | Rough with visible grains | Paarl Rock (Western Cape) |\n| **Sandstone** | Yellow, brown, or red | Medium | Gritty, like sand glued together | Table Mountain (Cape Town) |\n| **Slate** | Dark grey or black | Hard | Smooth, splits into flat sheets | Roofing tiles, old buildings |\n| **Marble** | White, grey, or coloured | Hard | Smooth and shiny when polished | Used for floors and countertops |\n| **Limestone** | White, cream, or grey | Soft to medium | Chalky or grainy | Caves in the Cradle of Humankind |\n\n### Properties of Rocks\n\nWe can describe rocks by looking at their **properties**:\n\n- **Colour** — grey, brown, red, black, white, or even multi-coloured\n- **Hardness** — hard rocks (like granite) cannot be scratched easily; soft rocks (like chalk) crumble\n- **Texture** — rough (sandstone), smooth (marble), gritty (sand), glassy (obsidian)\n- **Layers** — some rocks show visible layers (like shale and slate)\n- **Crystals** — some rocks have shiny crystal grains you can see (like granite)'),
  q(2, 'Which famous South African landmark is made of sandstone?',
    ['Paarl Rock', 'Table Mountain', 'Hillbrow Tower', 'Bloukrans Bridge'], 1,
    'Table Mountain in Cape Town is made of sandstone that is over 500 million years old! The sandstone gives the mountain its distinctive flat top and layered appearance. Sandstone is a medium-hard rock with a gritty texture, formed from layers of sand pressed together over millions of years.'),
  fb(3, 'Rocks are made of ___. We can describe rocks by their colour, hardness, and ___.',
    ['minerals', 'texture'],
    'Rocks are natural solids made up of one or more minerals. We use several properties to describe and identify rocks, including their colour, hardness (how easily they scratch), and texture (how they feel — rough, smooth, gritty, or glassy).'),
  t(4, '### How Soil Is Formed\n\n**Soil** is formed when rocks are broken down into tiny pieces over a very long time. This process is called **weathering**.\n\nRocks break down because of:\n- **Water** — rain and rivers slowly wear away rock; water seeps into cracks and expands when it freezes, breaking the rock apart\n- **Wind** — blows sand against rocks, wearing them down\n- **Temperature changes** — rocks expand (get bigger) when hot and contract (get smaller) when cold; this causes cracks over time\n- **Plant roots** — tree roots grow into cracks in rocks and slowly push them apart\n- **Animals** — worms, ants, and moles dig through soil and help break up rocks\n\n### What Is Soil Made Of?\n\nSoil is a mixture of:\n- **Tiny rock particles** (sand, silt, clay)\n- **Dead plant and animal material** (humus) — this makes soil dark and rich\n- **Water** — trapped between soil particles\n- **Air** — in the spaces between particles\n- **Living things** — worms, insects, bacteria, fungi\n\nA single handful of healthy soil contains more living organisms (bacteria) than there are people on Earth!'),
  q(5, 'What is weathering?',
    ['A type of weather forecast', 'The process of rocks breaking down into tiny pieces over time', 'When it rains for many days', 'When soil turns back into rock'], 1,
    'Weathering is the natural process where rocks are slowly broken down into smaller and smaller pieces by water, wind, temperature changes, plant roots, and animals. Over thousands of years, weathering turns hard rock into the tiny particles that make up soil.'),
  t(6, '### Types of Soil\n\nThere are three main types of soil, based on the size of the rock particles:\n\n| Soil type | Particle size | Feels like | Water | Good for growing? |\n|-----------|--------------|-----------|-------|-------------------|\n| **Sandy soil** | Large particles | Gritty and rough | Water drains through quickly | Not great — nutrients wash away |\n| **Clay soil** | Very tiny particles | Smooth and sticky when wet | Water does NOT drain — stays soggy | Difficult — too wet, hard for roots |\n| **Loam** | Mix of sand, silt, and clay | Soft and crumbly | Holds some water but drains extra | The BEST soil for growing! |\n\n### Testing Soil\n\nYou can test soil by:\n1. **Rubbing it** between your fingers — sandy soil feels gritty, clay feels smooth/sticky\n2. **Adding water** — sandy soil drains fast, clay holds water, loam drains slowly\n3. **Rolling it** — clay can be rolled into a sausage shape, sandy soil falls apart\n\n### Soil in South Africa\n\n- The **Highveld** (Gauteng, Free State) has dark, rich soil good for maize farming\n- The **Western Cape** has sandy soil suited to wine grapes and fynbos\n- The **KwaZulu-Natal** coast has red clay soils from tropical weathering\n- The **Karoo** has thin, dry soil with little humus'),
  q(7, 'Which type of soil is best for growing crops?',
    ['Sandy soil', 'Clay soil', 'Loam', 'Rocky soil'], 2,
    'Loam is the best soil for growing crops because it is a mix of sand, silt, and clay. It holds enough water and nutrients for plants but also drains well enough that roots do not get waterlogged. Most successful farmland has loam or loam-like soil.'),
  fb(8, 'Soil forms when rocks are broken down by a process called ___. The best type of soil for growing crops is called ___.',
    ['weathering', 'loam'],
    'Weathering breaks rocks into smaller and smaller pieces over thousands of years through the action of water, wind, temperature changes, and plant roots. Loam is the ideal growing soil — a balanced mix of sand, silt, and clay with good water drainage and nutrient retention.'),
  t(9, '### Summary\n\n- Rocks are natural solids made of **minerals** with different properties (colour, hardness, texture).\n- Famous SA rocks: Table Mountain (sandstone), Paarl Rock (granite), Cradle of Humankind caves (limestone).\n- **Weathering** breaks rocks into tiny pieces to form soil over thousands of years.\n- Soil is made of rock particles, humus, water, air, and living things.\n- The three main soil types are **sandy**, **clay**, and **loam**.\n- **Loam** is the best soil for growing crops because it holds water and nutrients while still draining well.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Water (Term 4 — Planet Earth and Beyond)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Water\n\n### Where Does Water Come From?\n\nWater is found in many places on Earth:\n\n- **Oceans and seas** — the biggest source of water (but it is salty!)\n- **Rivers** — flowing water that runs across the land (the Orange River is South Africa\'s longest)\n- **Lakes and dams** — large bodies of fresh water (Gariep Dam is SA\'s biggest)\n- **Underground** — water soaks into the ground and collects in rock layers (groundwater)\n- **Ice** — glaciers and ice caps at the North and South Poles\n- **Clouds** — tiny water droplets floating in the air\n\n### The Water Cycle\n\nWater moves in a never-ending circle called the **water cycle**. It has four main steps:\n\n1. **Evaporation** — the Sun heats water in oceans, rivers, and dams. The water turns into water vapour (an invisible gas) and rises into the air.\n\n2. **Condensation** — as the water vapour rises, it cools down and turns back into tiny water droplets. These droplets form **clouds**.\n\n3. **Precipitation** — when the clouds get heavy with water droplets, the water falls back to Earth as **rain**, **hail**, or **snow**.\n\n4. **Collection** — the rain water collects in rivers, dams, oceans, and soaks into the ground. Then the cycle starts again!\n\nThe water cycle has been going on for billions of years — the water you drink today has been recycled many, many times!'),
  q(2, 'What is the correct order of the water cycle?',
    ['Collection → Precipitation → Evaporation → Condensation', 'Evaporation → Condensation → Precipitation → Collection', 'Condensation → Evaporation → Collection → Precipitation', 'Precipitation → Collection → Condensation → Evaporation'], 1,
    'The water cycle follows this order: Evaporation (water is heated by the Sun and rises as vapour), Condensation (vapour cools and forms clouds), Precipitation (water falls as rain, hail, or snow), and Collection (water gathers in rivers, dams, and oceans).'),
  fb(3, 'When the Sun heats water and it turns into water vapour, this is called ___. When water vapour cools and forms clouds, this is called ___.',
    ['evaporation', 'condensation'],
    'Evaporation is when liquid water is heated (by the Sun) and turns into an invisible gas called water vapour. Condensation is the opposite — when water vapour cools and turns back into tiny liquid water droplets, forming clouds.'),
  t(4, '### Saving Water\n\nSouth Africa is a **water-scarce** country — we get less rain than most countries in the world. That means every drop counts!\n\n**Ways to save water at home:**\n- **Close the tap** while brushing your teeth — saves up to 6 litres per minute!\n- **Take short showers** (2 minutes) instead of filling a bath\n- **Fix leaking taps** — a dripping tap wastes thousands of litres per year\n- **Water the garden** in the early morning or evening (less evaporation)\n- **Collect rainwater** in tanks or buckets for watering plants\n- **Re-use water** — bath water can be used to water the garden\n- **Use a bucket** to wash the car, not a hosepipe\n\n**Ways to save water at school:**\n- Report any leaking taps or toilets to a teacher\n- Do not play with water from taps\n- Turn taps off properly after washing hands\n\n### The Drought\n\nSome parts of South Africa have experienced serious droughts (very long periods with little or no rain). In 2018, Cape Town almost ran out of water — they called it "Day Zero". Everyone had to use less than 50 litres of water per day. This showed how important it is to save water every day.'),
  q(5, 'Why is it important to save water in South Africa?',
    ['Because water is expensive', 'Because South Africa is a water-scarce country with less rain than most countries', 'Because there are too many rivers', 'Because the government says so'], 1,
    'South Africa is a water-scarce country, meaning we receive less rainfall than the world average and our rivers and dams often do not have enough water. Droughts, like the Cape Town water crisis, show that we must all save water to make sure there is enough for everyone.'),
  t(6, '### Clean and Dirty Water\n\n**Clean water:**\n- Has no harmful germs, chemicals, or dirt\n- Is safe to drink\n- Comes from taps connected to water treatment plants\n- Looks clear and has no smell\n\n**Dirty (polluted) water:**\n- Contains germs, chemicals, or waste\n- Can make people very sick (cholera, diarrhoea, typhoid)\n- May look cloudy, have a bad smell, or have things floating in it\n- Found in some rivers and streams polluted by sewage, factories, or litter\n\n### What Makes Water Dirty?\n\n| Source of pollution | What it does |\n|--------------------|-------------|\n| **Sewage** | Broken pipes leak toilet waste into rivers |\n| **Factory waste** | Chemicals are dumped into rivers |\n| **Litter** | Plastic, cans, and rubbish block and pollute waterways |\n| **Farm chemicals** | Fertilisers and pesticides wash into streams |\n| **Mining** | Acid mine drainage poisons water near old mines |\n\n### How Water Is Cleaned\n\nBefore water comes out of your tap, it goes through a **water treatment plant** where it is cleaned:\n\n1. **Screening** — large objects like sticks and leaves are removed\n2. **Settling** — dirt and sand sink to the bottom\n3. **Filtering** — water passes through layers of sand and gravel to remove tiny particles\n4. **Chlorination** — chlorine is added to kill germs and make the water safe to drink'),
  q(7, 'What is the last step in cleaning water at a treatment plant before it reaches your tap?',
    ['Screening', 'Settling', 'Filtering', 'Chlorination'], 3,
    'Chlorination is the final step in water treatment. Chlorine is added to the filtered water to kill any remaining germs (bacteria and viruses), making the water safe to drink. The chlorine continues to protect the water as it travels through pipes to your home.'),
  fb(8, 'South Africa is a water-___ country. Before tap water reaches your home, it is cleaned at a water ___ plant.',
    ['scarce', 'treatment'],
    'South Africa is water-scarce because it receives less rainfall than the global average. Water treatment plants clean river and dam water through screening, settling, filtering, and chlorination before sending it through pipes to homes and schools.'),
  t(9, '### Why Water Is Important for Life\n\nAll living things need water to survive:\n\n- **People** need water to drink, cook, wash, and grow food. Our bodies are about 60% water!\n- **Animals** need water to drink and to live in (fish, frogs, hippos)\n- **Plants** need water to make food through photosynthesis and to stay upright (without water, plants wilt)\n\nWithout water, there would be no life on Earth. The South African Constitution says everyone has the **right to clean water**. It is our responsibility to save water and keep our rivers and dams clean.\n\n### Summary\n\n- Water is found in oceans, rivers, lakes, underground, ice, and clouds.\n- The **water cycle** moves water endlessly: evaporation → condensation → precipitation → collection.\n- South Africa is **water-scarce** — saving water is everyone\'s responsibility.\n- **Clean water** is safe to drink; **dirty water** can cause serious diseases.\n- Water treatment plants clean water through screening, settling, filtering, and chlorination.\n- All living things need water — people, animals, and plants.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN — Database insertion
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 4
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 4/i, schoolId: SCHOOL_ID });
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

  // Find or create Natural Sciences subject
  const subjectDoc = await db.collection('subjects').findOne({
    name: /Natural.*Sci/i,
    schoolId: SCHOOL_ID,
  });

  let SUBJECT_ID;
  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Natural Sciences subject:', String(SUBJECT_ID));
  } else {
    const result = await db.collection('subjects').insertOne({
      name: 'Natural Sciences',
      code: 'NS',
      schoolId: SCHOOL_ID,
      gradeIds: [GRADE_ID],
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Natural Sciences subject:', String(SUBJECT_ID));
  }

  // Find the CAPS framework
  const capsFramework = await db.collection('curriculumframeworks').findOne({ name: 'CAPS', schoolId: null });
  const FRAMEWORK_ID = capsFramework ? capsFramework._id : new mongoose.Types.ObjectId();
  if (capsFramework) {
    console.log('Found CAPS framework:', String(FRAMEWORK_ID));
  } else {
    console.log('CAPS framework not found, using generated ID:', String(FRAMEWORK_ID));
  }

  const now = new Date();
  const baseDoc = {
    schoolId: SCHOOL_ID,
    createdBy: CREATED_BY,
    gradeId: GRADE_ID,
    subjectId: SUBJECT_ID,
    type: 'lesson',
    format: 'interactive',
    source: 'system',
    sourceAttribution: '',
    status: 'approved',
    tags: ['grade-4', 'natural-sciences', 'caps'],
    aiModel: '',
    aiPrompt: '',
    downloads: 0,
    rating: 0,
    ratingCount: 0,
    difficulty: 3,
    estimatedMinutes: 30,
    prerequisites: [],
    reviewedBy: null,
    reviewedAt: null,
    reviewNotes: '',
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    __v: 0,
  };

  const chapters = [
    {
      title: 'Chapter 1: Living and Non-living Things',
      description: 'Characteristics of living things (MRS GREN), classifying objects as living, non-living, or once living, tricky examples.',
      order: 1,
      lessons: [
        { title: 'Living and Non-living Things', description: 'What makes something alive (breathe, eat, grow, move, reproduce, respond, excrete), MRS GREN, non-living things (never alive vs once alive), tricky examples (fire, seeds, cars), and South African living things.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Structure of Plants',
      description: 'Parts of a plant and their functions, types of roots and stems, pollination and seed dispersal.',
      order: 2,
      lessons: [
        { title: 'Structure of Plants', description: 'Parts of a plant (roots, stem, leaves, flowers, fruit, seeds), functions of each part, types of roots (taproot, fibrous), types of stems (soft, woody, underground), pollination, seed dispersal, and why plants are important.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Structure of Animals',
      description: 'Animal body parts, how animals move, body coverings (fur, feathers, scales, shell), senses.',
      order: 3,
      lessons: [
        { title: 'Structure of Animals', description: 'Animal body parts and their jobs, how animals move (legs, wings, fins, crawling, hopping), body coverings (fur, feathers, scales, shell, moist skin), the pangolin, animal senses, and comparing South African animals.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Habitats of Animals',
      description: 'What a habitat is, SA habitats (bushveld, ocean, wetland, forest, desert), micro-habitats, adaptations for each habitat.',
      order: 4,
      lessons: [
        { title: 'What Is a Habitat?', description: 'What a habitat provides (food, water, shelter, space), South African habitats (bushveld, ocean, wetland, forest, desert), micro-habitats, and protecting habitats through national parks and laws.', blocks: ch4_lesson1, term: 2 },
        { title: 'How Animals Are Adapted', description: 'What adaptations are, bushveld adaptations (elephant ears, giraffe neck, zebra stripes), desert adaptations (meerkats, gemsbok, sidewinder), ocean adaptations (sharks, penguins, dolphins), forest and wetland adaptations.', blocks: ch4_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Materials Around Us',
      description: 'Natural and manufactured materials, properties (hard/soft, rough/smooth, waterproof/absorbent), choosing materials.',
      order: 5,
      lessons: [
        { title: 'Materials Around Us', description: 'What materials are, natural vs manufactured materials, material properties (hard/soft, rough/smooth, strong/weak, waterproof/absorbent, flexible/rigid, transparent/opaque), choosing the right material, and materials in South Africa.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Changing Materials',
      description: 'Heating and cooling, melting and freezing, dissolving and mixing, reversible and irreversible changes.',
      order: 6,
      lessons: [
        { title: 'Changing Materials', description: 'Heating and cooling materials, melting and freezing, dissolving and mixing, evaporation, reversible changes (melting ice, dissolving salt), irreversible changes (cooking an egg, burning wood), and real-life South African examples.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Structures',
      description: 'What makes structures strong, strong shapes (triangles, arches), designing and building strong structures.',
      order: 7,
      lessons: [
        { title: 'Structures', description: 'What a structure is, what makes structures strong (materials, shape, joints, base), strong shapes (triangle, arch, cylinder), making paper stronger, and South African structures (Bloukrans Bridge, FNB Stadium, rondavels, pylons).', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Energy Around Us',
      description: 'What is energy, sources of energy (sun, food, fuel), using energy every day, Eskom and load shedding, saving energy.',
      order: 8,
      lessons: [
        { title: 'Energy Around Us', description: 'What energy is, types of energy (light, heat, sound, movement, electrical), sources of energy (Sun, food, fuel, batteries, wind, water), how we use energy every day, Eskom and coal, renewable energy, saving energy, and load shedding.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Movement and Energy',
      description: 'Push and pull forces, gravity, speed, friction, wheels reduce friction.',
      order: 9,
      lessons: [
        { title: 'Movement and Energy', description: 'Push and pull forces, what forces can do, gravity, fast and slow movers, friction (the slowing force), where friction helps and hinders, wheels reduce friction, oil and ball bearings, and friction in South African sports.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: The Earth',
      description: 'Shape of the Earth, land and water, continents and oceans, South Africa\'s position on the globe.',
      order: 10,
      lessons: [
        { title: 'The Earth', description: 'Shape of the Earth (sphere), land and water coverage, seven continents and five oceans, South Africa\'s position at the southern tip of Africa, our neighbours, the Equator, and the Southern Hemisphere.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: Rocks and Soil',
      description: 'Types of rocks and their properties, how soil is formed (weathering), types of soil, importance of soil.',
      order: 11,
      lessons: [
        { title: 'Rocks and Soil', description: 'Different types of rocks (granite, sandstone, slate, marble, limestone), properties of rocks (colour, hardness, texture), how soil is formed through weathering, what soil is made of, types of soil (sandy, clay, loam), testing soil, and soil in South Africa.', blocks: ch11_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 12: Water',
      description: 'Where water comes from, the water cycle, saving water, clean and dirty water, why water is important for life.',
      order: 12,
      lessons: [
        { title: 'Water', description: 'Where water comes from, the water cycle (evaporation, condensation, precipitation, collection), saving water in South Africa, clean vs dirty water, water pollution, water treatment, and why water is essential for all life.', blocks: ch12_lesson1, term: 4 },
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
      _id: new mongoose.Types.ObjectId(),
      title: ch.title,
      description: ch.description,
      order: ch.order,
      curriculumNodeId: null,
      resources: resourceIds.map(function(id, i) { return { resourceId: id, order: i }; }),
    });
  }

  // Create textbook
  const textbook = await db.collection('textbooks').insertOne({
    title: 'Grade 4 Natural Sciences \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Life and Living (living and non-living things, structure of plants, structure of animals, habitats of animals), Matter and Materials (materials around us, changing materials), Technology (structures), Energy and Change (energy around us, movement and energy), and Planet Earth and Beyond (the Earth, rocks and soil, water) for the Grade 4 Natural Sciences and Technology curriculum.',
    frameworkId: FRAMEWORK_ID,
    schoolId: SCHOOL_ID,
    gradeId: GRADE_ID,
    subjectId: SUBJECT_ID,
    coverImageUrl: '',
    status: 'published',
    chapters: textbookChapters,
    createdBy: CREATED_BY,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    __v: 0,
  });

  console.log('\n========================================');
  console.log('  TEXTBOOK: Grade 4 Natural Sciences');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
