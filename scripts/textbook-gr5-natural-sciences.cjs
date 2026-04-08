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
// CHAPTER 1: Plants and Animals on Earth (Term 1 — Life and Living)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Plants and Animals on Earth\n\n### Habitats\n\nA **habitat** is the natural place where a plant or animal lives. Every living thing needs a habitat that provides:\n\n- **Food** — to get energy for life processes\n- **Water** — essential for all living things\n- **Shelter** — protection from weather and predators\n- **Space** — room to grow and find food\n\nDifferent habitats have different conditions. A desert is very dry and hot, while a forest is cool and damp. Plants and animals must be suited to the conditions in their habitat to survive.\n\n### South African Biomes\n\nSouth Africa has many different biomes — large areas with similar climate, plants, and animals:\n\n| Biome | Climate | Typical Plants | Typical Animals |\n|-------|---------|---------------|----------------|\n| **Fynbos** | Hot dry summers, cool wet winters | Proteas, ericas, restios | Sunbirds, Cape leopard, bontebok |\n| **Karoo** | Very dry, hot days, cold nights | Succulents, small shrubs | Tortoises, meerkats, bat-eared foxes |\n| **Bushveld (Savanna)** | Warm, summer rainfall | Thorny trees, tall grasses | Elephants, lions, impala, giraffes |\n| **Forest** | Moist, sheltered | Yellowwood trees, ferns | Bushbuck, Knysna turaco, tree frogs |\n| **Grassland** | Summer rain, cold winters, frost | Grasses, wildflowers | Springbok, black wildebeest, vultures |'),
  q(2, 'What four things must a habitat provide for living things?',
    ['Food, water, shelter, and space', 'Light, heat, soil, and air', 'Rocks, sand, wind, and rain', 'Trees, rivers, mountains, and clouds'], 0,
    'A habitat must provide food, water, shelter, and space. Without any one of these, a plant or animal cannot survive in that environment.'),
  t(3, '### Adaptations\n\nAn **adaptation** is a special feature or behaviour that helps a plant or animal survive in its habitat.\n\n**Plant adaptations:**\n- **Succulents** in the Karoo have thick, fleshy leaves that store water for dry periods\n- **Proteas** in the fynbos have tough, leathery leaves to survive hot summers and fire\n- **Thorn trees** in the bushveld have long thorns to stop animals from eating their leaves\n- **Yellowwood trees** in the forest grow very tall to reach sunlight above the canopy\n\n**Animal adaptations:**\n- **Meerkats** live in underground burrows to escape the hot Karoo sun, and they stand upright to watch for predators\n- **Elephants** have large ears to cool their blood in the hot bushveld — they flap their ears to release heat\n- **Cape sugarbirds** have long curved beaks to reach nectar deep inside protea flowers\n- **Springbok** can survive long periods without water by getting moisture from the plants they eat\n\n### Why Adaptations Matter\n\nAnimals and plants that are well adapted to their habitat are more likely to find food, avoid predators, and raise young. If a habitat changes (for example, through drought or pollution), organisms without the right adaptations may struggle to survive.'),
  fb(4, 'An ___ is a special feature or behaviour that helps a plant or animal survive. Succulents store water in their thick ___ leaves.',
    ['adaptation', 'fleshy'],
    'Adaptations help organisms survive in their specific habitat. Succulents have thick, fleshy leaves that store water so they can survive in the very dry Karoo and other arid areas.'),
  q(5, 'Why do protea plants have tough, leathery leaves?',
    ['To attract insects', 'To survive hot summers and fire in the fynbos', 'To store water underground', 'To grow taller than other plants'], 1,
    'Proteas are adapted to the fynbos biome, which has hot dry summers and regular fires. Their tough, leathery leaves reduce water loss and can survive fire. Some protea species even need fire to release their seeds.'),
  t(6, '### Threats to Habitats in South Africa\n\nMany habitats in South Africa are under threat from human activities:\n\n- **Deforestation** — cutting down forests for timber or farmland destroys animal homes\n- **Pollution** — litter, chemicals, and smoke harm plants and animals\n- **Invasive species** — plants like Port Jackson willow and animals like feral cats take over habitats and push out indigenous species\n- **Urbanisation** — building cities and roads breaks up habitats so animals cannot move freely\n\n### Conservation\n\nSouth Africa protects habitats through:\n- **National parks** — Kruger, Table Mountain, Addo Elephant Park\n- **Nature reserves** — smaller protected areas in every province\n- **Legislation** — laws that protect endangered species like the riverine rabbit and cycads\n- **Rehabilitation programmes** — breeding programmes for endangered animals like the African wild dog'),
  q(7, 'Which of these is an invasive plant species that threatens South African habitats?',
    ['Protea', 'Yellowwood', 'Port Jackson willow', 'Aloe'], 2,
    'Port Jackson willow was brought to South Africa from Australia. It grows rapidly, uses large amounts of water, and crowds out indigenous fynbos plants. Clearing invasive plants is an important conservation activity in South Africa.'),
  fb(8, 'The fynbos biome is home to plants like ___ and ericas. Elephants flap their large ___ to release heat and cool down.',
    ['proteas', 'ears'],
    'Proteas are one of the iconic plant families of the fynbos biome, found mainly in the Western Cape. Elephants use their large, thin ears as a cooling system — blood flows through the ears and is cooled by the air when they flap them.'),
  t(9, '### Summary\n\n- A **habitat** provides food, water, shelter, and space for living things.\n- South Africa has many biomes: fynbos, Karoo, bushveld, forest, and grassland.\n- **Adaptations** are special features that help organisms survive in their habitats.\n- Human activities like deforestation, pollution, and invasive species threaten habitats.\n- Conservation efforts like national parks and nature reserves protect South Africa\'s biodiversity.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Animal Life Cycles (Term 1 — Life and Living)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Animal Life Cycles\n\n### What Is a Life Cycle?\n\nA **life cycle** is the series of stages that a living thing goes through from birth to adulthood. All animals are born, grow, reproduce (have young), and eventually die. However, different types of animals go through very different stages.\n\n### Insect Life Cycles — Metamorphosis\n\n**Metamorphosis** means a dramatic change in body form during development. There are two types:\n\n**Complete metamorphosis** (4 stages):\n1. **Egg** — the female lays eggs\n2. **Larva** — a worm-like stage that eats and grows (e.g. caterpillar, maggot)\n3. **Pupa** — a resting stage inside a cocoon or chrysalis where the body transforms\n4. **Adult** — the fully formed insect emerges (e.g. butterfly, beetle, fly)\n\nExamples: butterflies, moths, beetles, flies, mosquitoes\n\n**Incomplete metamorphosis** (3 stages):\n1. **Egg** — the female lays eggs\n2. **Nymph** — looks like a small version of the adult but without wings; sheds its skin as it grows (moulting)\n3. **Adult** — has wings and can reproduce\n\nExamples: grasshoppers, dragonflies, cockroaches, praying mantises'),
  q(2, 'How many stages are there in complete metamorphosis?',
    ['Two', 'Three', 'Four', 'Five'], 2,
    'Complete metamorphosis has four stages: egg, larva, pupa, and adult. During the pupa stage, the insect\'s body completely transforms — for example, a caterpillar becomes a butterfly inside a chrysalis.'),
  fb(3, 'In complete metamorphosis, the ___ stage is when the insect\'s body transforms inside a cocoon. In incomplete metamorphosis, the young insect is called a ___.',
    ['pupa', 'nymph'],
    'The pupa is the resting stage where a dramatic transformation takes place. In incomplete metamorphosis, there is no pupa stage — the nymph gradually grows into an adult by moulting (shedding its skin).'),
  t(4, '### Frog Life Cycle\n\nFrogs go through **metamorphosis** too, but they are amphibians, not insects:\n\n1. **Eggs (frogspawn)** — laid in water in jelly-like clusters\n2. **Tadpole** — hatches from the egg, lives in water, breathes through gills, has a tail\n3. **Tadpole with legs** — back legs grow first, then front legs; lungs start to develop\n4. **Froglet** — tail shrinks, lungs replace gills, moves onto land\n5. **Adult frog** — lives on land and in water, breathes with lungs, lays eggs to start the cycle again\n\nIn South Africa, the **Cape rain frog** is a special species found only in the Western Cape. Unlike most frogs, it does not need open water to breed — it lays its eggs in moist burrows underground.\n\n### Bird Life Cycle\n\n1. **Egg** — female lays eggs in a nest; parent birds sit on the eggs to keep them warm (incubation)\n2. **Chick** — hatches from the egg, often helpless and featherless\n3. **Juvenile** — grows feathers, learns to fly and find food\n4. **Adult** — fully grown, can reproduce\n\nThe **Southern masked weaver** is a common South African bird. The male builds a complex hanging nest from grass and reeds to attract a female. If the female rejects the nest, the male tears it down and starts again!'),
  q(5, 'What does a tadpole use to breathe?',
    ['Lungs', 'Skin only', 'Gills', 'Nostrils'], 2,
    'Tadpoles live in water and breathe through gills, just like fish. As they develop into froglets, their gills are replaced by lungs, allowing them to breathe air on land.'),
  t(6, '### Mammal Life Cycle\n\n1. **Birth** — baby is born alive (not from an egg). The mother feeds it with milk.\n2. **Young** — grows, develops, and learns from its parents\n3. **Juvenile** — becomes more independent\n4. **Adult** — fully grown, can reproduce\n\nKey features of mammal life cycles:\n- Babies develop inside the mother\'s body before birth\n- Mothers produce **milk** to feed their young\n- Parental care is often very long (especially in elephants, which care for calves for many years)\n\nIn the Kruger National Park, **African elephant** calves stay with their mothers for up to 10 years. The whole herd helps protect and teach the young elephants.\n\n### Comparing Life Cycles\n\n| Animal group | Born from | Metamorphosis? | Parental care |\n|-------------|-----------|----------------|---------------|\n| Insects | Eggs | Yes (complete or incomplete) | Usually none |\n| Frogs | Eggs (in water) | Yes | Usually none |\n| Birds | Eggs (in nest) | No | Yes — feeding and protection |\n| Mammals | Live birth | No | Yes — milk and long-term care |'),
  q(7, 'Which statement about mammal life cycles is correct?',
    ['Mammals lay eggs in nests', 'Mammals go through metamorphosis', 'Mammals feed their young with milk', 'Mammals breathe through gills as babies'], 2,
    'All mammals share the feature of feeding their young with milk produced by the mother. Mammals give birth to live young (except the platypus and echidna, which are egg-laying mammals not found in South Africa), and they do not go through metamorphosis.'),
  fb(8, 'Frogs lay their eggs in ___ and the young are called ___. Mammals feed their young with ___.',
    ['water', 'tadpoles', 'milk'],
    'Frogs are amphibians that begin life in water. Their eggs (frogspawn) hatch into tadpoles which live in water until they develop legs and lungs. Mammals are unique in producing milk to nourish their babies.'),
  t(9, '### Summary\n\n- A **life cycle** is the stages a living thing goes through from birth to adulthood.\n- **Complete metamorphosis** has four stages: egg, larva, pupa, adult (butterflies, beetles).\n- **Incomplete metamorphosis** has three stages: egg, nymph, adult (grasshoppers, dragonflies).\n- **Frogs** go through metamorphosis: eggs → tadpole → froglet → adult.\n- **Birds** hatch from eggs and are cared for by their parents.\n- **Mammals** are born alive and fed with milk.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Food Chains (Term 1 — Life and Living)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Food Chains\n\n### Energy from the Sun\n\nAll living things need **energy** to survive. The Sun is the ultimate source of energy for almost all life on Earth. Energy flows from the Sun through living things in a pathway called a **food chain**.\n\n### Parts of a Food Chain\n\nA food chain shows the order in which organisms eat each other:\n\n**Sun → Producer → Primary consumer → Secondary consumer → Tertiary consumer**\n\n| Role | Description | Example |\n|------|------------|--------|\n| **Producer** | Makes its own food using sunlight (photosynthesis) | Grass, trees, algae |\n| **Primary consumer (herbivore)** | Eats producers | Impala, grasshopper, rabbit |\n| **Secondary consumer (carnivore)** | Eats primary consumers | Jackal, frog, mongoose |\n| **Tertiary consumer (top predator)** | Eats secondary consumers | Eagle, lion, crocodile |\n| **Decomposer** | Breaks down dead organisms, returning nutrients to the soil | Bacteria, fungi, earthworms |\n\n### A South African Bushveld Food Chain\n\n$$\\text{Sun} \\rightarrow \\text{Grass} \\rightarrow \\text{Impala} \\rightarrow \\text{Cheetah}$$\n\n- **Grass** is the producer — it uses sunlight to make food through photosynthesis\n- **Impala** is the primary consumer — a herbivore that eats grass\n- **Cheetah** is the secondary consumer — a carnivore that hunts impala'),
  q(2, 'What is the role of a producer in a food chain?',
    ['It eats other animals', 'It makes its own food using sunlight', 'It breaks down dead organisms', 'It hunts herbivores'], 1,
    'Producers are organisms (mainly plants and algae) that make their own food through photosynthesis using energy from the Sun. They form the base of every food chain.'),
  fb(3, 'The Sun is the ultimate source of ___ for all food chains. Organisms that make their own food are called ___.',
    ['energy', 'producers'],
    'All energy in food chains originates from the Sun. Producers (plants) capture this energy through photosynthesis and convert it into food, which is then passed along the food chain when consumers eat producers or other consumers.'),
  t(4, '### Predators and Prey\n\nA **predator** is an animal that hunts and eats other animals. The animal that is hunted is called the **prey**.\n\n- In the Kruger Park: the **lion** (predator) hunts the **zebra** (prey)\n- In the Karoo: the **black eagle** (predator) catches the **rock hyrax** (prey)\n- In the ocean: the **great white shark** (predator) hunts **seals** (prey) along the Cape coast\n\nPredators have adaptations for hunting:\n- Sharp teeth and claws (lions, leopards)\n- Excellent eyesight (eagles)\n- Speed (cheetah — the fastest land animal)\n\nPrey animals have adaptations for escaping:\n- Speed (springbok can run and leap high)\n- Camouflage (the stick insect looks like a twig)\n- Living in herds (zebras confuse predators with their stripes)\n\n### Decomposers — Nature\'s Recyclers\n\nWhen plants and animals die, **decomposers** break down their remains. This returns nutrients to the soil, which plants use to grow. Without decomposers, dead material would pile up and the soil would run out of nutrients.\n\nCommon decomposers in South Africa:\n- **Fungi** (mushrooms) on rotting logs in the Knysna forest\n- **Bacteria** in the soil everywhere\n- **Dung beetles** — break down animal dung on the grasslands and bushveld'),
  q(5, 'What would happen if all the decomposers in an ecosystem disappeared?',
    ['Animals would grow bigger', 'Dead material would pile up and nutrients would not return to the soil', 'Plants would grow faster', 'Predators would have more food'], 1,
    'Decomposers break down dead organisms and waste, recycling nutrients back into the soil. Without decomposers, dead plants and animals would accumulate, and the soil would become less fertile, eventually making it harder for producers to grow.'),
  t(6, '### What Happens When a Food Chain Is Disrupted?\n\nIf one organism in a food chain is removed, it affects all the others:\n\n**Example:** Grass → Rabbit → Jackal → Eagle\n\n- If **rabbits** are removed: jackals have less food and their numbers decrease; grass grows out of control\n- If **grass** is destroyed by drought: rabbits starve, then jackals starve, then eagles starve — the whole chain collapses\n- If **jackals** are removed: rabbit numbers increase too much, they eat all the grass, then starve\n\nThis shows that every organism in a food chain is important. Changes to one part affect the whole chain.\n\n### Food Chains in Different SA Ecosystems\n\n**Ocean (West Coast):**\n$$\\text{Kelp} \\rightarrow \\text{Sea urchin} \\rightarrow \\text{Crayfish} \\rightarrow \\text{Octopus}$$\n\n**Fynbos:**\n$$\\text{Protea bush} \\rightarrow \\text{Protea beetle} \\rightarrow \\text{Praying mantis} \\rightarrow \\text{Fiscal shrike}$$\n\n**Wetland:**\n$$\\text{Water plants} \\rightarrow \\text{Tadpole} \\rightarrow \\text{Heron}$$'),
  q(7, 'In the food chain Grass → Zebra → Lion, what would happen if the zebra population decreased dramatically?',
    ['Lions would eat more grass', 'Lions would have less food and their numbers would decrease', 'Grass would disappear', 'Nothing would change'], 1,
    'If zebra numbers decrease, lions have less prey. With less food, some lions may starve or move away, causing the lion population to decrease. Meanwhile, with fewer zebras eating it, the grass may grow more.'),
  fb(8, 'A ___ is an animal that hunts other animals. The animal being hunted is called the ___.',
    ['predator', 'prey'],
    'Predators are hunters — they catch and eat other animals for food. Prey are the animals that are hunted. Many animals can be both predator and prey: a frog eats insects (predator) but is eaten by a heron (prey).'),
  t(9, '### Summary\n\n- A **food chain** shows how energy flows from one organism to another.\n- **Producers** make their own food. **Consumers** eat other organisms. **Decomposers** break down dead matter.\n- **Predators** hunt **prey**. Both have special adaptations.\n- Removing one part of a food chain affects all the others.\n- Decomposers are essential for recycling nutrients back into the soil.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Stored Energy in Fuels (Term 2 — Energy and Change)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Stored Energy in Fuels\n\n### What Is a Fuel?\n\nA **fuel** is a material that stores energy. When a fuel is burned, the stored energy is released as **heat** and **light**. We use fuels every day — for cooking, heating, transport, and making electricity.\n\n### Types of Fuel\n\n| Fuel | Where it comes from | How it is used |\n|------|-------------------|---------------|\n| **Wood** | Trees | Cooking fires, braais, fireplaces |\n| **Coal** | Mined from underground | Power stations to make electricity |\n| **Paraffin** | Made from crude oil | Paraffin stoves and lamps |\n| **Gas (LPG)** | Extracted from underground | Gas stoves, heaters |\n| **Petrol** | Made from crude oil | Cars, motorcycles |\n| **Diesel** | Made from crude oil | Trucks, buses, generators |\n\nIn South Africa, many families in rural areas still use **wood** as their main fuel for cooking. In townships, **paraffin** stoves are common. Most of South Africa\'s electricity comes from burning **coal** at Eskom power stations.\n\n### Where Does the Energy in Fuels Come From?\n\nMost fuels originally got their energy from the **Sun**:\n- Trees grow using sunlight (photosynthesis) → wood stores this energy\n- Coal formed millions of years ago from ancient plants that used sunlight\n- Petrol and diesel come from crude oil, which formed from ancient tiny sea organisms'),
  q(2, 'Where does the energy stored in fuels originally come from?',
    ['The Moon', 'The Earth\'s core', 'The Sun', 'Wind'], 2,
    'Almost all fuel energy traces back to the Sun. Plants captured sunlight through photosynthesis. Wood comes directly from trees. Coal, petrol, and diesel formed from ancient organisms that once used sunlight to grow, millions of years ago.'),
  fb(3, 'A ___ is a material that stores energy. When fuels are burned, they release heat and ___.',
    ['fuel', 'light'],
    'Fuels contain stored (chemical) energy. Burning breaks chemical bonds in the fuel and releases this energy as heat energy and light energy. This is called combustion.'),
  t(4, '### Burning Fuels — Combustion\n\nWhen a fuel burns, it combines with **oxygen** from the air. This is called **combustion**. For a fire to burn, you need three things (the **fire triangle**):\n\n1. **Fuel** — the material that burns\n2. **Oxygen** — from the air\n3. **Heat** — to start the fire (e.g. a match or spark)\n\nIf you remove any one of these three things, the fire goes out. That is why:\n- Smothering a fire with a blanket works — it removes oxygen\n- A fire dies when it runs out of wood — no more fuel\n- Pouring water on a fire works — it cools the fuel below its ignition temperature\n\n### Pollution from Burning Fuels\n\nBurning fuels releases gases into the air. Some of these gases cause **air pollution**:\n- **Smoke** — tiny particles that cause breathing problems\n- **Carbon dioxide (CO₂)** — a greenhouse gas that contributes to climate change\n- **Sulphur dioxide** — causes acid rain that damages plants and buildings\n\nIn the Mpumalanga Highveld, where many coal power stations are located, air quality is often poor. In townships where paraffin and coal are burned indoors, people suffer from lung diseases.\n\n### Safety with Fuels\n\n- Never play with matches or lighters\n- Keep paraffin and petrol away from open flames\n- Never leave a stove or fire unattended\n- Make sure rooms have ventilation when burning fuels (to prevent carbon monoxide poisoning)\n- Keep a fire extinguisher or bucket of sand nearby'),
  q(5, 'What three things are needed for a fire to burn (the fire triangle)?',
    ['Wood, water, and air', 'Fuel, oxygen, and heat', 'Coal, wind, and sunlight', 'Petrol, electricity, and gas'], 1,
    'The fire triangle shows that a fire needs fuel (something to burn), oxygen (from the air), and heat (to reach the ignition temperature). Remove any one of these and the fire goes out.'),
  q(6, 'Why is burning coal in power stations harmful to the environment?',
    ['It uses too much water', 'It releases carbon dioxide and other polluting gases into the air', 'It makes too much noise', 'It uses up all the oxygen'], 1,
    'Burning coal releases carbon dioxide (a greenhouse gas that causes climate change), sulphur dioxide (which causes acid rain), and smoke particles (which cause breathing problems). South Africa relies heavily on coal for electricity, making it one of the largest CO₂ emitters in Africa.'),
  fb(7, 'For a fire to burn, you need fuel, ___, and heat. This is called the fire ___.',
    ['oxygen', 'triangle'],
    'The fire triangle is a model showing that combustion requires three elements: fuel, oxygen, and heat. Firefighters use this knowledge — removing any one of the three elements will extinguish a fire.'),
  t(8, '### Renewable vs Non-Renewable Fuels\n\n- **Non-renewable fuels** (coal, petrol, gas) took millions of years to form and will eventually run out. They also cause pollution.\n- **Renewable fuels** (wood, biodiesel, biogas) can be replaced within a human lifetime.\n\nSouth Africa is working to use more renewable energy sources like solar and wind power to reduce pollution and save coal for the future.\n\n### Summary\n\n- A **fuel** stores energy that is released when burned.\n- Common fuels: wood, coal, paraffin, gas, petrol, diesel.\n- The **fire triangle**: fuel + oxygen + heat = fire.\n- Burning fuels causes **air pollution** (smoke, CO₂, sulphur dioxide).\n- We must use fuels **safely** and look for cleaner energy sources.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Energy and Temperature (Term 2 — Energy and Change)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Energy and Temperature\n\n### What Is Heat?\n\n**Heat** is a form of energy that flows from a warmer object to a cooler object. When you hold a hot cup of tea, heat flows from the cup into your hands — that is why your hands feel warm.\n\n**Temperature** is a measure of how hot or cold something is. We measure temperature with a **thermometer** in degrees Celsius (°C).\n\n| Temperature | Example |\n|------------|--------|\n| 0 °C | Water freezes |\n| 37 °C | Normal human body temperature |\n| 100 °C | Water boils |\n| About 25 °C | A comfortable day in Johannesburg |\n\n### Three Ways Heat Moves\n\nHeat energy can move from one place to another in three ways:\n\n**1. Conduction** — heat moves through a solid material by direct contact\n- When you stir a pot with a metal spoon, heat travels up the spoon from the hot food to your hand\n- The particles in the solid vibrate and pass energy to neighbouring particles\n\n**2. Convection** — heat moves through liquids and gases in a circular flow\n- When water in a pot is heated from below, the warm water rises and the cooler water sinks, creating a circular current\n- A warm breeze on a hot day is convection — hot air rises and cool air moves in\n\n**3. Radiation** — heat travels through space (no material needed)\n- The Sun heats the Earth through radiation — heat energy travels through empty space\n- You feel the warmth of a campfire on your face — that is radiation'),
  q(2, 'How does heat from the Sun reach the Earth?',
    ['Conduction', 'Convection', 'Radiation', 'Evaporation'], 2,
    'Heat from the Sun travels to Earth through radiation. Unlike conduction and convection, radiation does not need a material to travel through — it can move through the empty space (vacuum) between the Sun and Earth.'),
  fb(3, 'Heat moves through solids by ___. Heat moves through liquids and gases by ___.',
    ['conduction', 'convection'],
    'In conduction, heat energy is transferred through a solid as vibrating particles pass energy to their neighbours. In convection, warm fluid (liquid or gas) rises while cool fluid sinks, creating a circular flow that transfers heat.'),
  t(4, '### Conductors and Insulators\n\nA **conductor** is a material that lets heat pass through it easily. A **insulator** is a material that does not let heat pass through easily.\n\n| Conductors (let heat through) | Insulators (block heat) |\n|-------------------------------|------------------------|\n| Metals (copper, iron, aluminium) | Wood |\n| Steel | Plastic |\n| | Wool and fabric |\n| | Air (trapped) |\n| | Polystyrene (styrofoam) |\n\n**Why this matters in everyday life:**\n- **Pots** are made of metal (conductor) so heat reaches the food\n- **Pot handles** are made of plastic or wood (insulator) so you do not burn your hands\n- **Winter clothes** trap air (insulator) to keep body heat in\n- **Cooler boxes** are made of polystyrene (insulator) to keep cold things cold\n- **Houses in the Western Cape** often have ceiling insulation to keep warmth in during winter\n\n### Measuring Temperature\n\nA **thermometer** is the instrument used to measure temperature:\n- **Liquid-in-glass thermometer** — liquid (often alcohol) expands when heated and rises up a thin tube next to a scale\n- **Digital thermometer** — uses an electronic sensor and displays the reading on a screen\n\nWhen reading a thermometer:\n1. Hold it at eye level\n2. Read the level of the liquid (do not look at an angle)\n3. Record the temperature with the unit: e.g. \"25 °C\"'),
  q(5, 'Why are pot handles made of wood or plastic?',
    ['Because they are cheaper', 'Because they are insulators and do not let heat through easily', 'Because they are stronger than metal', 'Because they look better'], 1,
    'Wood and plastic are insulators — they do not conduct heat well. This prevents heat from the hot pot from reaching your hand, protecting you from burns. Metals are conductors and would transfer heat quickly to your skin.'),
  q(6, 'Which type of heat transfer creates a circular flow in a liquid?',
    ['Conduction', 'Convection', 'Radiation', 'Insulation'], 1,
    'Convection creates circular currents in liquids and gases. When a liquid is heated from below, the warm part rises (because it becomes less dense), while the cooler part sinks. This creates a circular flow called a convection current.'),
  fb(7, 'A ___ is a material that lets heat pass through easily. A ___ is used to measure temperature in degrees Celsius.',
    ['conductor', 'thermometer'],
    'Conductors, especially metals like copper and aluminium, allow heat energy to pass through them quickly. A thermometer measures temperature — the liquid inside expands or contracts depending on the temperature.'),
  t(8, '### Practical Investigation: Comparing Conductors and Insulators\n\nYou can test which materials are good conductors by placing spoons of different materials (metal, plastic, wood) in a cup of hot water with a small dab of butter on the end. The butter melts first on the **metal spoon** because metal is the best conductor.\n\n### Summary\n\n- **Heat** flows from warm objects to cool objects.\n- Heat moves by **conduction** (solids), **convection** (liquids and gases), and **radiation** (through space).\n- **Conductors** let heat through; **insulators** block heat.\n- **Temperature** is measured with a **thermometer** in degrees Celsius (°C).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: The Sun (Term 2 — Planet Earth and Beyond)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## The Sun\n\n### What Is the Sun?\n\nThe **Sun** is a **star** — a huge ball of hot glowing gases. It is the closest star to Earth and is at the centre of our solar system. The Sun is enormously larger than Earth — about 1.3 million Earths could fit inside the Sun!\n\n### Key Facts About the Sun\n\n| Fact | Detail |\n|------|--------|\n| Type | Star (yellow dwarf) |\n| Made of | Hot gases (mainly hydrogen and helium) |\n| Surface temperature | About 5 500 °C |\n| Distance from Earth | About 150 million kilometres |\n| Age | About 4.6 billion years old |\n\n### Why Is the Sun Important?\n\nThe Sun is essential for life on Earth:\n\n1. **Light** — the Sun provides the light that plants need for photosynthesis (making food)\n2. **Heat** — the Sun warms the Earth, making it possible for living things to survive\n3. **Water cycle** — the Sun\'s heat evaporates water from oceans, rivers, and dams, driving the water cycle\n4. **Weather** — the Sun heats the air unevenly, creating wind and weather patterns\n5. **Energy** — solar panels in South Africa convert sunlight into electricity\n\nWithout the Sun, Earth would be a frozen, dark, lifeless planet.'),
  q(2, 'What type of object is the Sun?',
    ['A planet', 'A moon', 'A star', 'A comet'], 2,
    'The Sun is a star — a massive ball of hot gases (mainly hydrogen and helium). It produces its own heat and light through nuclear reactions. It appears much larger and brighter than other stars because it is the closest star to Earth.'),
  fb(3, 'The Sun is a ___ made of hot gases. Its surface temperature is about ___ °C.',
    ['star', '5 500'],
    'The Sun is classified as a yellow dwarf star. It is made mostly of hydrogen and helium gas, and its surface temperature is approximately 5 500 °C. The centre of the Sun is much hotter — about 15 million °C.'),
  t(4, '### Shadows and the Sun\n\nWhen sunlight hits an **opaque** object (an object that light cannot pass through), a **shadow** forms on the other side. Shadows change throughout the day because the Sun appears to move across the sky:\n\n- **Morning** — the Sun is low in the east, so shadows are long and point west\n- **Midday** — the Sun is high overhead, so shadows are short\n- **Afternoon** — the Sun is low in the west, so shadows are long and point east\n\n### Sundials\n\nA **sundial** is an ancient instrument that uses shadows to tell the time. A pointer (called a **gnomon**) casts a shadow onto a flat plate marked with hours. As the Sun moves across the sky, the shadow moves around the plate, showing the approximate time.\n\nIn South Africa, sundials must be tilted to match our latitude (about 30° south) to be accurate.\n\n### The Danger of Looking at the Sun\n\n**Never look directly at the Sun** — even briefly! The Sun\'s light is so intense that it can burn the retina at the back of your eye, causing permanent damage or blindness. This applies even during a solar eclipse.\n\nIf you need to observe the Sun (e.g. for a science activity), use:\n- A pinhole camera (project the image onto paper)\n- Special solar viewing glasses (NOT ordinary sunglasses)'),
  q(5, 'Why are shadows longest in the early morning and late afternoon?',
    ['The Sun is furthest from Earth at those times', 'The Sun is low in the sky so light hits objects at a steep angle', 'The Earth spins faster in the morning', 'Shadows do not change during the day'], 1,
    'When the Sun is low in the sky (morning and afternoon), sunlight strikes objects at a steep angle, creating long shadows. At midday, the Sun is high overhead and light strikes almost straight down, making shadows very short.'),
  q(6, 'Why should you never look directly at the Sun?',
    ['It will make you sneeze', 'The intense light can burn the retina and cause blindness', 'It will give you a headache', 'The Sun is too far away to see'], 1,
    'The Sun emits extremely intense light and ultraviolet radiation. Looking directly at it — even for a few seconds — can burn the retina (the light-sensitive layer at the back of the eye), causing permanent damage or blindness.'),
  fb(7, 'A ___ uses shadows to tell the time. The pointer on a sundial is called a ___.',
    ['sundial', 'gnomon'],
    'Sundials were among the earliest timekeeping devices. The gnomon casts a shadow that moves as the Sun crosses the sky. The position of the shadow on the marked dial plate indicates the approximate time.'),
  t(8, '### The Sun and Solar Energy in South Africa\n\nSouth Africa receives abundant sunshine, making it ideal for **solar energy**. Solar panels convert sunlight directly into electricity. The Northern Cape has some of the highest solar radiation levels in the world.\n\nMajor solar energy projects in South Africa include solar farms near Upington and De Aar. The government\'s Renewable Energy Programme aims to increase the use of solar power to reduce dependence on coal.\n\n### Summary\n\n- The **Sun** is a star — a huge ball of hot gases at the centre of our solar system.\n- The Sun provides **light, heat, and energy** essential for life on Earth.\n- **Shadows** change throughout the day as the Sun moves across the sky.\n- A **sundial** uses shadows to tell the time.\n- **Never look directly at the Sun** — it can cause blindness.\n- South Africa has excellent conditions for **solar energy**.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: The Moon (Term 2 — Planet Earth and Beyond)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## The Moon\n\n### What Is the Moon?\n\nThe **Moon** is Earth\'s only natural **satellite** — a rocky body that orbits (travels around) Earth. The Moon does not produce its own light. It shines because it **reflects** sunlight.\n\n### Key Facts About the Moon\n\n| Fact | Detail |\n|------|--------|\n| Type | Natural satellite of Earth |\n| Surface | Rocky, covered in craters, dust, and mountains |\n| Gravity | About 1/6 of Earth\'s gravity |\n| Distance from Earth | About 384 000 km |\n| Time to orbit Earth | About 29.5 days (one lunar month) |\n| Atmosphere | None — no air, no weather, no sound |\n| Temperature | Extremely hot in sunlight (+127 °C), extremely cold in shadow (-173 °C) |\n\nThe Moon is much smaller than Earth — about four Moons could fit across the width of Earth.\n\n### The Moon\'s Orbit\n\nThe Moon travels around Earth in a nearly circular path called an **orbit**. It takes about **29.5 days** (roughly one month) to complete one orbit. As the Moon orbits Earth, we see different amounts of its sunlit side — these are the **phases of the Moon**.'),
  q(2, 'Why does the Moon shine?',
    ['It produces its own light like the Sun', 'It reflects sunlight', 'It is made of glowing rock', 'Stars nearby light it up'], 1,
    'The Moon does not produce its own light. It appears bright because sunlight bounces off its rocky surface and reflects toward Earth. The side of the Moon facing the Sun is lit up, while the other side is dark.'),
  fb(3, 'The Moon is Earth\'s natural ___. It takes about ___ days for the Moon to orbit Earth.',
    ['satellite', '29.5'],
    'A satellite is an object that orbits a larger body. The Moon is a natural satellite (unlike human-made satellites). Its orbit around Earth takes approximately 29.5 days, which is why our calendar months are roughly 29–31 days long.'),
  t(4, '### Phases of the Moon\n\nAs the Moon orbits Earth, we see different shapes of the lit-up side. These shapes are called **phases**. The main phases are:\n\n1. **New Moon** — the Moon is between the Earth and Sun. The side facing us gets no sunlight — the Moon is invisible in the night sky.\n2. **Waxing Crescent** — a thin sliver of light appears on the right side (the Moon is \"growing\")\n3. **First Quarter** — half of the Moon is lit (right half in the Southern Hemisphere)\n4. **Waxing Gibbous** — more than half is lit, still growing\n5. **Full Moon** — the whole face of the Moon is lit. Earth is between the Sun and Moon.\n6. **Waning Gibbous** — the light starts to shrink from the right side\n7. **Last Quarter** — half of the Moon is lit (left half in the Southern Hemisphere)\n8. **Waning Crescent** — a thin sliver of light on the left, shrinking toward new moon\n\nThe cycle then repeats.\n\n**Helpful hint:**\n- **Waxing** = growing (getting more lit)\n- **Waning** = shrinking (getting less lit)\n\nIn the **Southern Hemisphere** (South Africa), the Moon appears to be lit from the left during waxing — the opposite of what people in the Northern Hemisphere see.'),
  q(5, 'During which phase is the entire face of the Moon lit up?',
    ['New Moon', 'First Quarter', 'Full Moon', 'Waning Crescent'], 2,
    'During a Full Moon, the Earth is positioned between the Sun and the Moon. Sunlight fully illuminates the side of the Moon facing Earth, so we see a complete, round, bright Moon in the night sky.'),
  t(6, '### Why Does the Moon Look Different Each Night?\n\nThe Moon does not change shape — we simply see different amounts of its sunlit side as it orbits Earth:\n\n- When the Moon is between the Earth and the Sun (new moon), the lit side faces away from us\n- As the Moon moves in its orbit, more of the lit side becomes visible (waxing)\n- When the Moon is on the opposite side of Earth from the Sun (full moon), we see the entire lit side\n- As the Moon continues orbiting, less of the lit side is visible (waning)\n\nThis cycle takes about 29.5 days and repeats endlessly.\n\n### The Moon and Tides\n\nThe Moon\'s **gravity** pulls on Earth\'s water, causing the oceans to bulge. This creates **tides** — the rise and fall of sea levels. South African coastal towns like Hermanus, Durban, and Cape Town experience two high tides and two low tides each day.\n\nFishermen along the South African coast plan their activities around the tides — certain fish are easier to catch at high tide.'),
  q(7, 'What causes tides in the ocean?',
    ['Wind blowing the water', 'The Moon\'s gravity pulling on Earth\'s water', 'The Sun heating the ocean', 'Rivers flowing into the sea'], 1,
    'The Moon\'s gravitational pull causes the ocean water to bulge toward the Moon, creating a high tide. On the opposite side of Earth, another bulge forms due to centrifugal force. As Earth rotates, different places experience high and low tides.'),
  fb(8, 'When the Moon appears to be growing bigger each night, it is called ___. When it appears to be shrinking, it is called ___.',
    ['waxing', 'waning'],
    'Waxing means the illuminated portion of the Moon is increasing (from new moon toward full moon). Waning means the illuminated portion is decreasing (from full moon back toward new moon). A complete cycle of phases takes about 29.5 days.'),
  t(9, '### Summary\n\n- The **Moon** is Earth\'s natural satellite — it orbits Earth in about 29.5 days.\n- The Moon shines by **reflecting sunlight**, not by producing its own light.\n- The Moon\'s **phases** (new moon, crescent, quarter, gibbous, full moon) are caused by seeing different amounts of its sunlit side.\n- **Waxing** = growing, **Waning** = shrinking.\n- The Moon\'s gravity causes **tides** in the ocean.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Metals and Non-metals (Term 3 — Matter and Materials) — Lesson 1
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Metals and Non-metals\n\n### What Are Metals?\n\n**Metals** are a group of materials with special properties that make them very useful. Most of the elements on Earth are metals.\n\n### Properties of Metals\n\n| Property | Meaning | Example |\n|----------|---------|--------|\n| **Shiny (lustrous)** | Has a bright, reflective surface when polished | Gold jewellery, polished steel |\n| **Good conductor of heat** | Lets heat pass through easily | Metal pots for cooking |\n| **Good conductor of electricity** | Lets electricity flow through | Copper wires in your home |\n| **Malleable** | Can be hammered or pressed into shapes without breaking | Aluminium foil, gold leaf |\n| **Ductile** | Can be stretched into thin wires | Copper wire, steel cables |\n| **Strong** | Can hold heavy loads without breaking | Steel beams in buildings |\n| **Magnetic** (some) | Attracted to magnets | Iron, steel, cobalt |\n\n### Common Metals and Their Uses\n\n| Metal | Uses | SA Connection |\n|-------|------|---------------|\n| **Gold** | Jewellery, electronics, coins | SA was the world\'s largest gold producer (Witwatersrand mines) |\n| **Iron/Steel** | Buildings, cars, bridges, tools | ArcelorMittal steel works in Vanderbijlpark |\n| **Copper** | Electrical wires, pipes, coins | Mined in the Northern Cape and Limpopo |\n| **Aluminium** | Cans, aeroplanes, window frames | Hillside aluminium smelter in Richards Bay |\n| **Platinum** | Catalytic converters, jewellery | SA has the world\'s largest platinum reserves (Bushveld Complex) |'),
  q(2, 'Which property means a metal can be hammered into thin sheets?',
    ['Ductile', 'Magnetic', 'Malleable', 'Lustrous'], 2,
    'Malleable means the material can be hammered, pressed, or rolled into different shapes without cracking or breaking. Gold is one of the most malleable metals — it can be beaten into sheets so thin that light passes through them (gold leaf).'),
  fb(3, 'Metals are good conductors of heat and ___. The property of being shiny is called being ___.',
    ['electricity', 'lustrous'],
    'Metals conduct both heat and electricity because their atoms have free-moving electrons that carry energy. The lustrous (shiny) appearance of metals is due to the way their surface reflects light.'),
  t(4, '### Testing for Metals\n\nYou can test whether a material is a metal by checking its properties:\n\n1. **Appearance** — is it shiny when polished or scratched?\n2. **Magnetism** — is it attracted to a magnet? (Only some metals are magnetic: iron, steel, cobalt, nickel)\n3. **Conductivity** — does it conduct electricity? Use a simple circuit with a battery, bulb, and wires. Place the material in the circuit — if the bulb lights up, it conducts electricity.\n4. **Hardness** — can it be scratched? Most metals are hard.\n5. **Malleability** — can it be bent or hammered without breaking?\n\n**Important:** Not all metals are magnetic! Aluminium, copper, gold, and silver are metals but they are NOT attracted to magnets. Magnetism alone cannot tell you if something is a metal.\n\n### Mining in South Africa\n\nSouth Africa is one of the world\'s richest countries for mineral resources. Mining is a major industry that provides jobs and exports:\n\n- **Gold** — mined near Johannesburg (Witwatersrand basin)\n- **Platinum** — mined in the Bushveld Complex (Limpopo and North West)\n- **Iron ore** — mined near Sishen in the Northern Cape\n- **Manganese** — mined in the Northern Cape (SA has 80% of world reserves)\n- **Chrome** — mined in Limpopo\n\nMining creates jobs but also causes environmental problems: holes in the ground, dust, water pollution, and destruction of habitats.'),
  q(5, 'Which of these metals is NOT magnetic?',
    ['Iron', 'Steel', 'Copper', 'Cobalt'], 2,
    'Copper is a metal but it is not magnetic — it is not attracted to magnets. Only iron, steel, cobalt, and nickel are commonly magnetic. Being magnetic is NOT a required property of all metals.'),
  q(6, 'Why is copper used for electrical wires?',
    ['It is the cheapest metal', 'It is an excellent conductor of electricity and is ductile', 'It is the strongest metal', 'It is magnetic'], 1,
    'Copper is one of the best conductors of electricity (after silver), and it is ductile — meaning it can be drawn into thin wires. This combination makes it ideal for electrical wiring in buildings and electronic devices.'),
  fb(7, 'South Africa has the world\'s largest reserves of ___. Iron ore is mined near ___ in the Northern Cape.',
    ['platinum', 'Sishen'],
    'South Africa\'s Bushveld Complex in Limpopo and North West provinces contains about 80% of the world\'s known platinum reserves. The Sishen mine in the Northern Cape is one of the largest open-pit iron ore mines in the world.'),
  t(8, '### Summary\n\n- **Metals** are shiny, conduct heat and electricity, and are malleable and ductile.\n- Common metals: gold, iron, copper, aluminium, platinum.\n- Not all metals are magnetic — only iron, steel, cobalt, and nickel.\n- You can test materials for metal properties using magnetism, conductivity, and appearance.\n- South Africa is rich in mineral resources and mining is a major industry.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Metals and Non-metals (Term 3 — Matter and Materials) — Lesson 2
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson2 = [
  t(1, '## Non-metals and Comparing Materials\n\n### What Are Non-metals?\n\n**Non-metals** are materials that do not have the properties of metals. They make up many of the objects we use every day.\n\n### Properties of Non-metals\n\n| Property | Meaning | Example |\n|----------|---------|--------|\n| **Dull (not shiny)** | Does not reflect light like metals | Wood, rubber, plastic |\n| **Poor conductor of heat** | Does not let heat through easily (insulator) | Plastic pot handle, wooden spoon |\n| **Poor conductor of electricity** | Does not let electricity flow (insulator) | Rubber coating on wires, glass |\n| **Brittle** | Breaks or shatters when hit (if solid) | Glass, charcoal, chalk |\n| **Not malleable** | Cannot be hammered into shapes | Wood cracks, plastic breaks |\n| **Not magnetic** | Not attracted to magnets | Plastic, rubber, glass |\n\n### Common Non-metals and Their Uses\n\n| Non-metal | Uses |\n|-----------|------|\n| **Plastic** | Bottles, bags, containers, toys |\n| **Glass** | Windows, bottles, spectacles |\n| **Wood** | Furniture, building, paper |\n| **Rubber** | Tyres, erasers, gloves |\n| **Fabric (cotton, wool)** | Clothing, blankets |\n| **Ceramics (clay)** | Bricks, tiles, pottery |'),
  q(2, 'Which of these is a property of non-metals?',
    ['Good conductor of electricity', 'Shiny appearance', 'Poor conductor of heat (insulator)', 'Malleable'], 2,
    'Non-metals are typically poor conductors of heat and electricity — this makes them good insulators. That is why materials like plastic, rubber, and wood are used for handles, coatings, and protective coverings.'),
  fb(3, 'Non-metals are ___ conductors of heat and electricity. When solid non-metals are hit, they tend to be ___ and break.',
    ['poor', 'brittle'],
    'Unlike metals, non-metals do not have free-moving electrons, so they cannot conduct heat or electricity well. Many solid non-metals are brittle — they shatter or crack when force is applied, rather than bending like metals.'),
  t(4, '### Comparing Metals and Non-metals\n\n| Property | Metals | Non-metals |\n|----------|--------|------------|\n| Appearance | Shiny (lustrous) | Dull |\n| Heat conduction | Good conductor | Poor conductor (insulator) |\n| Electrical conduction | Good conductor | Poor conductor (insulator) |\n| Malleability | Malleable (can be shaped) | Brittle (breaks when hit) |\n| Ductility | Ductile (can be drawn into wires) | Not ductile |\n| Magnetism | Some are magnetic | Not magnetic |\n| State at room temperature | Mostly solid (except mercury) | Can be solid, liquid, or gas |\n\n### Choosing the Right Material\n\nWhen engineers and designers make something, they choose materials based on their properties:\n\n- **Cooking pot** → Metal body (conducts heat to food) + plastic/wood handle (insulator protects hands)\n- **Electrical wire** → Copper core (conducts electricity) + plastic/rubber coating (insulates, prevents shocks)\n- **Window** → Glass (transparent, lets light through, keeps wind out)\n- **School desk** → Wood or steel (strong, durable)\n- **Raincoat** → Plastic or nylon (waterproof)\n\n### Recycling Materials in South Africa\n\nBoth metals and non-metals can often be recycled:\n- **Aluminium cans** — melted and remade into new cans (saves 95% of the energy compared to making new aluminium)\n- **Glass bottles** — crushed and melted into new glass\n- **Plastic bottles** — recycled into fabric, park benches, and new containers\n- **Paper** — recycled into new paper products\n\nRecycling reduces waste in landfills and saves natural resources. Many South Africans earn a living as informal recyclers, collecting cans and bottles for recycling centres.'),
  q(5, 'Why does an electrical wire have a copper core covered in plastic?',
    ['Copper is cheap and plastic is colourful', 'Copper conducts electricity and plastic insulates to prevent electric shocks', 'Copper is strong and plastic is flexible', 'Copper is shiny and plastic protects it from rain'], 1,
    'Copper is an excellent electrical conductor — it allows electricity to flow through the wire. The plastic coating is an insulator — it prevents the electricity from escaping and protects people from electric shocks when they touch the wire.'),
  q(6, 'How much energy is saved by recycling aluminium cans compared to making new aluminium?',
    ['About 25%', 'About 50%', 'About 75%', 'About 95%'], 3,
    'Recycling aluminium saves approximately 95% of the energy needed to make aluminium from raw bauxite ore. This is because extracting aluminium from ore requires enormous amounts of electricity, while melting down old cans uses very little energy by comparison.'),
  fb(7, 'Metals are good ___ of heat and electricity, while non-metals are good ___.',
    ['conductors', 'insulators'],
    'Conductors allow heat and electricity to pass through them easily — metals are the best examples. Insulators resist the flow of heat and electricity — non-metals like plastic, rubber, and wood are common insulators used for safety.'),
  t(8, '### Summary\n\n- **Non-metals** are dull, brittle, and poor conductors of heat and electricity.\n- Common non-metals include plastic, glass, wood, rubber, and fabric.\n- We choose materials based on their properties — conductors for wires, insulators for handles.\n- **Recycling** metals and non-metals saves energy and reduces waste.\n- Many South Africans contribute to recycling through informal collection.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Processing Materials (Term 3 — Matter and Materials)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Processing Materials\n\n### What Is Processing?\n\n**Processing** means changing raw materials into useful products. Raw materials come from nature — they are found in the ground, grown on farms, or taken from animals. They need to be processed (changed) before we can use them.\n\n### Examples of Processing\n\n| Raw Material | Process | Finished Product |\n|-------------|---------|------------------|\n| **Wool (from sheep)** | Shearing → washing → spinning → weaving | Woollen fabric, jerseys |\n| **Clay (from the ground)** | Digging → shaping → drying → firing in a kiln | Bricks, tiles, pottery |\n| **Trees (wood)** | Cutting → chipping → pulping → pressing → drying | Paper |\n| **Iron ore (from mines)** | Mining → crushing → smelting in a furnace | Steel for buildings and cars |\n| **Milk (from cows)** | Milking → pasteurising → packaging | Fresh milk, cheese, yoghurt |\n| **Cotton (from plants)** | Picking → cleaning → spinning → weaving | Cotton fabric, T-shirts |\n\n### From Wool to Fabric — A Closer Look\n\nIn the Karoo region of South Africa, sheep farming is a major industry. Here is how wool is processed:\n\n1. **Shearing** — the sheep\'s fleece is cut off with electric clippers (this does not hurt the sheep)\n2. **Sorting and washing** — the wool is sorted by quality and washed to remove dirt and grease (lanolin)\n3. **Carding** — the clean wool is combed to straighten the fibres\n4. **Spinning** — the fibres are twisted together to make yarn (thread)\n5. **Weaving or knitting** — the yarn is woven on a loom or knitted to make fabric\n6. **Dyeing** — the fabric is coloured with dyes'),
  q(2, 'What is the correct order for processing wool?',
    ['Dyeing → shearing → spinning → weaving', 'Shearing → washing → spinning → weaving', 'Spinning → shearing → washing → knitting', 'Weaving → carding → dyeing → shearing'], 1,
    'Wool processing follows this order: first the sheep is sheared (fleece removed), then the wool is washed to remove dirt, then spun into yarn, and finally woven or knitted into fabric. Dyeing may happen at the yarn or fabric stage.'),
  fb(3, 'Changing raw materials into useful products is called ___. Wool comes from ___ and is a major industry in the Karoo.',
    ['processing', 'sheep'],
    'Processing transforms natural raw materials into products we can use. The Karoo\'s dry climate and vast open spaces make it ideal for sheep farming, and South African wool is exported around the world.'),
  t(4, '### From Clay to Bricks\n\nBricks are one of the most common building materials in South Africa. Here is how they are made:\n\n1. **Digging** — clay is dug from the ground (quarried)\n2. **Mixing** — clay is mixed with water to make it soft and workable\n3. **Moulding** — the wet clay is pressed into brick-shaped moulds\n4. **Drying** — the bricks are left to dry in the sun\n5. **Firing** — the dry bricks are heated in a **kiln** (a special oven) at very high temperatures, which makes them hard and strong\n\nThe firing process is crucial — it changes the soft clay permanently into a hard, waterproof brick that will not dissolve in rain.\n\n### From Trees to Paper\n\nSouth Africa has large **plantation forests** in Mpumalanga and KwaZulu-Natal where trees (mainly pine and eucalyptus) are grown specifically for making paper:\n\n1. **Logging** — trees are cut down\n2. **Chipping** — logs are cut into small chips\n3. **Pulping** — the chips are cooked in chemicals to break them into a mushy pulp\n4. **Screening** — the pulp is cleaned and filtered\n5. **Pressing and drying** — the pulp is spread thin, pressed flat, and dried into sheets of paper\n\nSappi and Mondi are two large South African companies that produce paper and packaging for the whole world.'),
  q(5, 'Why are bricks fired in a kiln?',
    ['To make them lighter', 'To make them hard, strong, and waterproof', 'To change their colour', 'To make them bigger'], 1,
    'Firing clay bricks in a kiln at high temperatures (around 1 000 °C) causes chemical changes that permanently harden the clay. The fired brick becomes strong enough to bear heavy loads and waterproof so it does not dissolve when it rains.'),
  q(6, 'Which South African province is known for plantation forests used to make paper?',
    ['Northern Cape', 'Mpumalanga', 'Free State', 'Western Cape'], 1,
    'Mpumalanga and KwaZulu-Natal have extensive plantation forests of pine and eucalyptus trees grown for the paper and timber industries. The climate in these provinces — warm and rainy — is ideal for fast tree growth.'),
  fb(7, 'Bricks are made by shaping ___ and firing it in a ___. Paper is made from wood ___.',
    ['clay', 'kiln', 'pulp'],
    'Clay is the raw material for bricks — it is shaped in moulds and fired in a kiln to harden it permanently. Paper is made from wood that has been broken down into pulp — a mushy mixture of plant fibres and water.'),
  t(8, '### The Impact of Processing\n\n**Benefits:**\n- Creates useful products we need every day\n- Provides jobs (factories, farms, mines)\n- South Africa exports processed goods around the world\n\n**Problems:**\n- Factories cause air and water pollution\n- Mining scars the landscape\n- Cutting trees can cause deforestation if not managed responsibly\n- Processing uses large amounts of energy and water\n\nSouth Africa addresses these issues through **sustainable practices**: planting new trees after logging, treating factory waste water, and recycling materials to reduce the need for new raw materials.\n\n### Summary\n\n- **Processing** changes raw materials into useful products.\n- Examples: wool → fabric, clay → bricks, trees → paper, iron ore → steel.\n- South Africa has important processing industries: wool in the Karoo, paper in Mpumalanga, steel in Gauteng.\n- Processing has benefits (products, jobs, exports) and problems (pollution, resource use).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Structures (Term 3 — Technology)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Structures\n\n### What Is a Structure?\n\nA **structure** is anything that has a definite shape and can support a load. Structures are all around us — buildings, bridges, tables, and even your own skeleton.\n\n### Natural vs Human-Made Structures\n\n| Natural Structures | Human-Made Structures |\n|-------------------|----------------------|\n| Mountains | Houses |\n| Trees | Bridges |\n| Caves | Dams |\n| Bird nests | Roads |\n| Termite mounds | Fences |\n| Animal skeletons | School buildings |\n| Spider webs | Electricity pylons |\n\nIn South Africa, **termite mounds** in the bushveld can be over 3 metres tall. They are remarkable natural structures with built-in ventilation systems that keep the inside cool.\n\n### Three Types of Structures\n\n**1. Shell structures** — the outer layer (shell) supports the load\n- Examples: egg, tin can, igloo, helmet, soccer ball\n- The shell is hollow inside and the material of the shell carries the weight\n\n**2. Frame structures** — a skeleton of connected pieces (frame) supports the load\n- Examples: electricity pylon, crane, bicycle frame, jungle gym, human skeleton\n- The frame is made of bars, beams, or bones connected at joints\n\n**3. Solid structures** — the entire structure is solid and heavy\n- Examples: brick wall, dam wall, tree trunk, rock\n- The mass (heaviness) of the material keeps it in place'),
  q(2, 'A bird\'s egg is an example of which type of structure?',
    ['Frame structure', 'Shell structure', 'Solid structure', 'Natural frame'], 1,
    'An egg is a shell structure — the thin outer shell carries the load and protects the contents inside. Shell structures are hollow inside and rely on their curved outer layer for strength.'),
  fb(3, 'A ___ structure has a skeleton of connected pieces. A ___ structure relies on its outer layer for strength.',
    ['frame', 'shell'],
    'Frame structures are like skeletons — a network of bars, beams, or bones connected at joints. Shell structures are hollow and rely on the curved outer surface (the shell) to carry the load and provide strength.'),
  t(4, '### Strength and Stability\n\n**Strength** is the ability of a structure to carry a load without breaking or bending.\n\n**Stability** is the ability of a structure to stay upright and not topple over.\n\nFactors that affect stability:\n- **Wide base** — a structure with a wide base is more stable (e.g. a pyramid is very stable)\n- **Low centre of gravity** — heavy parts near the bottom make a structure more stable\n- **Symmetry** — balanced structures are more stable than lopsided ones\n\nFactors that affect strength:\n- **Shape** — triangles are the strongest shape. That is why you see triangles in bridges, pylons, and roof trusses.\n- **Material** — steel is stronger than wood; concrete is stronger than mud\n- **Thickness** — thicker beams are stronger than thin ones\n- **Bracing** — diagonal supports (cross-bracing) stop a frame from twisting\n\n### Triangles — The Strongest Shape\n\nA **triangle** is the strongest shape because it cannot be pushed out of shape without breaking one of its sides. A square or rectangle can be pushed sideways into a parallelogram, but a triangle keeps its shape.\n\nThis is why:\n- Roof trusses use triangles\n- Electricity pylons are made of triangles\n- The Eiffel Tower (and similar structures) use triangular patterns\n- Bridge trusses are built with triangles'),
  q(5, 'Why are triangles used in structures like bridges and pylons?',
    ['They are the easiest shape to build', 'They use the least material', 'They are the strongest shape and cannot be pushed out of shape', 'They look the most attractive'], 2,
    'A triangle is the only polygon that cannot change its shape when force is applied to its corners — it can only break, not bend. This rigidity makes triangles ideal for structures that must be strong, like bridges, pylons, and roof trusses.'),
  q(6, 'What makes a structure stable?',
    ['A narrow base and tall design', 'A wide base and low centre of gravity', 'Bright colours and smooth surfaces', 'Light materials and thin walls'], 1,
    'Stability is improved by having a wide base (more area in contact with the ground) and a low centre of gravity (heavy parts near the bottom). This is why pyramids are extremely stable — they have a very wide base and low centre of gravity.'),
  fb(7, 'The strongest shape used in building structures is the ___. A structure with a wide ___ is more stable and less likely to topple over.',
    ['triangle', 'base'],
    'Triangles cannot be deformed without breaking a side, making them the strongest shape for construction. A wide base gives a structure a lower centre of gravity and more contact with the ground, improving stability.'),
  t(8, '### Designing and Building a Structure\n\nWhen engineers design a structure, they follow a process:\n\n1. **Identify the problem** — what must the structure do? (e.g. support a bridge over a river)\n2. **Design** — draw plans, choose materials, decide on the type of structure\n3. **Build a model** — make a small version to test ideas\n4. **Test** — check if the model is strong and stable\n5. **Improve** — fix any weaknesses found during testing\n6. **Build the real thing** — construct the full-size structure\n\nFamous South African structures include:\n- **Nelson Mandela Bridge** in Johannesburg (cable-stayed bridge)\n- **Moses Mabhida Stadium** in Durban (arch structure)\n- **Cape Town Stadium** — built for the 2010 FIFA World Cup\n\n### Summary\n\n- A **structure** has a definite shape and supports a load.\n- Structures can be **natural** (tree, skeleton) or **human-made** (building, bridge).\n- Three types: **shell** (hollow outer layer), **frame** (skeleton of pieces), **solid** (heavy and solid throughout).\n- **Triangles** are the strongest shape. A **wide base** and **low centre of gravity** improve stability.\n- Engineers follow a design process to create safe, strong structures.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: Weather (Term 4 — Planet Earth and Beyond)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Weather\n\n### What Is Weather?\n\n**Weather** is the condition of the atmosphere (the air around us) at a particular place and time. Weather includes things like temperature, rainfall, wind, and cloud cover.\n\n**Climate** is different from weather — climate is the average weather pattern in an area over many years. For example, the Western Cape has a Mediterranean climate (dry summers, wet winters), while Durban has a subtropical climate (hot and humid with summer rain).\n\n### Measuring Weather\n\nScientists (called **meteorologists**) use special instruments to measure the weather:\n\n| What we measure | Instrument | Unit |\n|----------------|-----------|------|\n| **Temperature** | Thermometer | Degrees Celsius (°C) |\n| **Rainfall** | Rain gauge | Millimetres (mm) |\n| **Wind direction** | Wind vane (weather vane) | Compass directions (N, S, E, W) |\n| **Wind speed** | Anemometer | km/h or m/s |\n| **Cloud cover** | Observation (oktas) | Eighths of the sky (0–8) |\n| **Atmospheric pressure** | Barometer | Hectopascals (hPa) |\n\n### A Rain Gauge\n\nA **rain gauge** is a container used to collect and measure rainfall:\n- Place it in an open area away from trees and buildings\n- After rain, measure the water level inside using the marked scale\n- Record the measurement in millimetres (mm)\n- Empty the gauge after each reading'),
  q(2, 'Which instrument is used to measure wind speed?',
    ['Thermometer', 'Rain gauge', 'Barometer', 'Anemometer'], 3,
    'An anemometer measures wind speed. It typically has cups that spin when the wind blows — the faster the wind, the faster the cups spin. The speed is displayed in kilometres per hour (km/h) or metres per second (m/s).'),
  fb(3, 'Weather is the condition of the ___ at a particular place and time. Rainfall is measured using a ___ in millimetres.',
    ['atmosphere', 'rain gauge'],
    'The atmosphere is the layer of air surrounding the Earth. Weather describes its current conditions (temperature, rain, wind). A rain gauge collects rainwater so we can measure how much rain fell, recorded in millimetres (mm).'),
  t(4, '### Recording Weather Data\n\nWeather observations should be recorded in a **weather table** or **weather chart** at the same time each day for accuracy:\n\n| Day | Temperature (°C) | Rainfall (mm) | Wind direction | Cloud cover |\n|-----|-----------------|--------------|----------------|-------------|\n| Monday | 24 | 0 | NW | Sunny |\n| Tuesday | 22 | 12 | SE | Cloudy |\n| Wednesday | 19 | 25 | SE | Rainy |\n| Thursday | 21 | 3 | SW | Partly cloudy |\n| Friday | 26 | 0 | N | Sunny |\n\nAfter collecting data for a week or longer, you can look for **patterns**:\n- Was it getting warmer or cooler?\n- From which direction did the rain come?\n- How much total rainfall was there?\n\n### Weather Patterns in South Africa\n\nSouth Africa has varied weather patterns across different regions:\n\n- **Western Cape** — winter rainfall (May–August), dry hot summers. Rain comes from cold fronts moving in from the Atlantic Ocean.\n- **KwaZulu-Natal and Mpumalanga** — summer rainfall (October–March), warm and humid. Rain comes from moisture off the Indian Ocean.\n- **Highveld (Gauteng, Free State)** — summer thunderstorms, cold dry winters, frost.\n- **Karoo** — very low rainfall year-round, extreme temperatures (very hot days, very cold nights).\n- **Eastern Cape** — rain throughout the year but drier in some areas.'),
  q(5, 'When does the Western Cape receive most of its rainfall?',
    ['Summer (December–February)', 'Winter (May–August)', 'Spring (September–November)', 'It rains equally all year'], 1,
    'The Western Cape has a Mediterranean climate with wet winters and dry summers. Winter cold fronts move in from the Atlantic Ocean bringing rain between May and August. This is the opposite of most of the rest of South Africa, which gets summer rain.'),
  t(6, '### Types of Clouds\n\nClouds give us clues about the weather:\n\n- **Cumulus** — fluffy, white, flat-bottomed clouds. Usually mean **fair weather**, but tall ones can bring rain.\n- **Stratus** — flat, grey, layered clouds that cover the whole sky. Often bring **light rain or drizzle**.\n- **Cumulonimbus** — very tall, dark clouds that bring **thunderstorms, heavy rain, and sometimes hail**.\n- **Cirrus** — thin, wispy, high-up clouds made of ice crystals. Usually mean **fair weather**, but can signal a change coming.\n\n### Weather Forecasting\n\nThe **South African Weather Service (SAWS)** is responsible for forecasting weather across the country. They use:\n- **Weather stations** across SA that record temperature, rainfall, wind, and pressure\n- **Satellites** in space that photograph cloud patterns\n- **Radar** that detects rain\n- **Computer models** that predict future weather\n\nWeather forecasts help farmers plan planting and harvesting, help travellers stay safe, and warn communities about severe weather like floods, storms, and heat waves.'),
  q(7, 'Which type of cloud is most likely to bring thunderstorms and heavy rain?',
    ['Cirrus', 'Stratus', 'Cumulus', 'Cumulonimbus'], 3,
    'Cumulonimbus clouds are massive, towering clouds that extend very high into the atmosphere. They form during strong convection (warm air rising rapidly) and bring thunderstorms, heavy rain, lightning, and sometimes hail. On the Highveld, these are common on summer afternoons.'),
  fb(8, 'The South African ___ Service is responsible for forecasting the weather. Flat grey clouds that bring drizzle are called ___ clouds.',
    ['Weather', 'stratus'],
    'The South African Weather Service (SAWS) monitors conditions and issues forecasts and warnings. Stratus clouds form in flat, grey layers that often cover the entire sky, bringing light rain, drizzle, or mist.'),
  t(9, '### Summary\n\n- **Weather** is the condition of the atmosphere at a particular place and time.\n- We measure temperature (thermometer), rainfall (rain gauge), wind speed (anemometer), and wind direction (wind vane).\n- South Africa has diverse weather patterns: winter rain in the Western Cape, summer rain in KZN and Gauteng, dry conditions in the Karoo.\n- **Clouds** help predict weather: cumulus (fair), stratus (drizzle), cumulonimbus (storms).\n- The **South African Weather Service** forecasts weather to keep people safe.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Water in the Environment (Term 4 — Planet Earth and Beyond)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Water in the Environment\n\n### Why Is Water Important?\n\n**Water** is essential for all life on Earth. Every living thing — from tiny bacteria to huge elephants — needs water to survive. Humans use water for:\n\n- **Drinking** — our bodies are about 60% water\n- **Cooking and cleaning** — preparing food, washing\n- **Farming (irrigation)** — growing crops and feeding livestock\n- **Industry** — factories use water in manufacturing\n- **Electricity** — hydroelectric dams use flowing water to generate power\n\n### The Water Cycle\n\nWater moves continuously between the Earth\'s surface and the atmosphere in a process called the **water cycle**:\n\n1. **Evaporation** — the Sun heats water in oceans, rivers, and dams. The water turns into **water vapour** (a gas) and rises into the air.\n2. **Condensation** — as the water vapour rises, it cools and turns back into tiny water droplets. These droplets form **clouds**.\n3. **Precipitation** — when the water droplets in clouds become heavy enough, they fall as **rain**, snow, or hail.\n4. **Collection** — the water flows into rivers, dams, lakes, and underground (groundwater), or soaks into the soil. Plants absorb water through their roots.\n5. The cycle then starts again.\n\nThe water cycle has no beginning and no end — the same water has been recycling for billions of years!'),
  q(2, 'What causes water to evaporate from oceans and rivers?',
    ['The Moon\'s gravity', 'Heat from the Sun', 'Wind pushing the water', 'Fish swimming'], 1,
    'The Sun\'s heat energy causes water at the surface of oceans, rivers, and dams to change from liquid water to water vapour (a gas). This process is called evaporation, and it is the first step in the water cycle.'),
  fb(3, 'In the water cycle, water changes from liquid to gas through ___. When water vapour cools and forms clouds, this is called ___.',
    ['evaporation', 'condensation'],
    'Evaporation is the process where liquid water absorbs heat energy and becomes water vapour (gas). Condensation is the reverse — water vapour cools and changes back into tiny liquid droplets, forming clouds.'),
  t(4, '### Sources of Water in South Africa\n\nSouth Africa is a **water-scarce country** — we receive less rainfall than the world average. Our main sources of water are:\n\n| Source | Description | Example |\n|--------|------------|--------|\n| **Rivers** | Water flowing across the land | Vaal River, Orange River, Limpopo River |\n| **Dams** | Human-made barriers that store river water | Vaal Dam, Gariep Dam, Sterkfontein Dam |\n| **Underground water** | Water stored in rock layers below the ground (groundwater/aquifers) | Boreholes on farms in the Karoo |\n| **Springs** | Underground water that comes to the surface naturally | Hot springs in Mpumalanga |\n| **Rainwater** | Collected from roofs into tanks (rainwater harvesting) | Jojo tanks in rural areas |\n\nThe **Gariep Dam** on the Orange River is South Africa\'s largest dam, holding over 5 billion cubic metres of water.\n\n### Water Treatment — Making Water Safe to Drink\n\nWater from rivers and dams is not safe to drink directly. It must be **treated** (cleaned) at a water treatment plant:\n\n1. **Screening** — large objects (sticks, leaves) are filtered out\n2. **Coagulation** — chemicals are added that cause dirt particles to clump together\n3. **Sedimentation** — the clumps sink to the bottom of a tank\n4. **Filtration** — the water passes through layers of sand and gravel to remove remaining particles\n5. **Chlorination** — chlorine is added to kill bacteria and make the water safe to drink\n6. **Distribution** — clean water is pumped through pipes to homes, schools, and businesses'),
  q(5, 'What is the largest dam in South Africa?',
    ['Vaal Dam', 'Sterkfontein Dam', 'Gariep Dam', 'Hartbeespoort Dam'], 2,
    'The Gariep Dam, built on the Orange River in the Eastern Cape/Free State border area, is South Africa\'s largest dam. It holds over 5 billion cubic metres of water and is a crucial water source for agriculture and towns.'),
  t(6, '### Water Pollution\n\nWater becomes **polluted** when harmful substances are added to it:\n\n| Type of pollution | Source | Effect |\n|------------------|--------|--------|\n| **Sewage** | Broken or overflowing sewage systems | Spreads diseases like cholera and typhoid |\n| **Industrial waste** | Factories dumping chemicals | Poisons fish and makes water toxic |\n| **Litter** | People throwing rubbish into rivers | Clogs waterways, harms animals |\n| **Agricultural runoff** | Fertilisers and pesticides from farms | Causes algae blooms that kill fish |\n| **Mining waste** | Acid mine drainage | Makes water acidic and toxic |\n\nIn South Africa, **acid mine drainage** from old gold mines near Johannesburg is a serious problem. Acidic water seeps from abandoned mines into rivers and groundwater, damaging ecosystems.\n\n### Water Conservation\n\nBecause South Africa is water-scarce, we must all save water:\n\n- **Fix leaking taps** — a dripping tap wastes thousands of litres per year\n- **Take shorter showers** — 2 minutes instead of 10\n- **Use a bucket** to wash cars instead of a hosepipe\n- **Collect rainwater** in tanks for garden use\n- **Water gardens** in the early morning or evening (less evaporation)\n- **Use indigenous plants** that need less water (like spekboom and aloes)\n- **Re-use grey water** — water from baths and washing can be used on gardens'),
  q(7, 'What is acid mine drainage?',
    ['Water used in mining operations', 'Acidic water that seeps from abandoned mines into rivers and groundwater', 'A method of cleaning water', 'Rain that falls on mines'], 1,
    'Acid mine drainage occurs when water passes through abandoned mines and reacts with exposed minerals, becoming highly acidic and loaded with heavy metals. This toxic water then flows into rivers and groundwater, harming ecosystems and making water unsafe. It is a major environmental problem around old gold mines near Johannesburg.'),
  fb(8, 'South Africa is a water-___ country. The process of adding chlorine to kill bacteria in drinking water is called ___.',
    ['scarce', 'chlorination'],
    'South Africa receives less rainfall than the global average, making it a water-scarce country. Chlorination is the final step in water treatment — chlorine kills harmful bacteria and viruses, making the water safe to drink.'),
  t(9, '### Clean Water as a Human Right\n\nThe South African Constitution states that everyone has the right to access clean water. The government\'s Free Basic Water policy provides 6 000 litres of free water per household per month. Despite this, many rural communities still struggle to access clean, safe water.\n\n### Summary\n\n- **Water** is essential for all life — humans use it for drinking, cooking, farming, and industry.\n- The **water cycle** continuously moves water: evaporation → condensation → precipitation → collection.\n- South Africa\'s water sources include rivers, dams, groundwater, and rainwater harvesting.\n- Water is treated through screening, coagulation, sedimentation, filtration, and chlorination.\n- **Water pollution** from sewage, industry, litter, and mining threatens water quality.\n- **Water conservation** is everyone\'s responsibility in a water-scarce country.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN — Database insertion
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 5
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 5/i, schoolId: SCHOOL_ID });
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
    tags: ['grade-5', 'natural-sciences', 'caps'],
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
      title: 'Chapter 1: Plants and Animals on Earth',
      description: 'Habitats, adaptations, how plants and animals survive in different SA biomes (fynbos, Karoo, bushveld, forest, grassland), threats and conservation.',
      order: 1,
      lessons: [
        { title: 'Plants and Animals on Earth', description: 'What a habitat is, South African biomes (fynbos, Karoo, bushveld, forest, grassland), plant and animal adaptations, threats to habitats, and conservation efforts including national parks.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Animal Life Cycles',
      description: 'Life cycles of insects (complete and incomplete metamorphosis), frogs, birds, and mammals.',
      order: 2,
      lessons: [
        { title: 'Animal Life Cycles', description: 'What a life cycle is, complete metamorphosis (egg, larva, pupa, adult), incomplete metamorphosis (egg, nymph, adult), frog life cycle, bird life cycle, mammal life cycle, and comparing life cycles.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Food Chains',
      description: 'Producers, consumers, decomposers, energy flow, simple food chains in SA ecosystems, predator-prey relationships.',
      order: 3,
      lessons: [
        { title: 'Food Chains', description: 'Energy from the Sun, producers, primary and secondary consumers, decomposers, predators and prey, adaptations for hunting and escaping, food chain disruption, and food chains in different SA ecosystems.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Stored Energy in Fuels',
      description: 'What is fuel, types of fuel (wood, coal, paraffin, gas, petrol), the fire triangle, pollution from burning fuels, safety.',
      order: 4,
      lessons: [
        { title: 'Stored Energy in Fuels', description: 'What a fuel is, types of fuels and their uses in SA, where fuel energy comes from, combustion and the fire triangle, air pollution from burning fuels, fuel safety, and renewable vs non-renewable fuels.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Energy and Temperature',
      description: 'Heat transfer (conduction, convection, radiation), insulators and conductors, measuring temperature with a thermometer.',
      order: 5,
      lessons: [
        { title: 'Energy and Temperature', description: 'What heat is, temperature and thermometers, three ways heat moves (conduction, convection, radiation), conductors and insulators, practical examples, and measuring temperature accurately.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: The Sun',
      description: 'The Sun as a star, source of energy, importance for life on Earth, shadows, sundials, dangers of looking at the Sun, solar energy.',
      order: 6,
      lessons: [
        { title: 'The Sun', description: 'What the Sun is, key facts, why the Sun is important for life, shadows and how they change, sundials, the danger of looking at the Sun, and solar energy in South Africa.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: The Moon',
      description: 'Phases of the Moon, new moon to full moon, the Moon\'s orbit around Earth, why the Moon looks different each night, tides.',
      order: 7,
      lessons: [
        { title: 'The Moon', description: 'What the Moon is, key facts, the Moon\'s orbit, phases of the Moon (new, crescent, quarter, gibbous, full), waxing and waning, why the Moon looks different each night, and tides.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Metals and Non-metals',
      description: 'Properties of metals (shiny, conduct heat/electricity, malleable), properties of non-metals, uses of metals in SA (gold, iron, copper, aluminium, platinum), comparing and choosing materials.',
      order: 8,
      lessons: [
        { title: 'Metals and Their Properties', description: 'Properties of metals (lustrous, conductive, malleable, ductile), common metals and their uses, testing for metals, and mining in South Africa (gold, platinum, iron ore, manganese).', blocks: ch8_lesson1, term: 3 },
        { title: 'Non-metals and Comparing Materials', description: 'Properties of non-metals (dull, brittle, insulating), common non-metals and their uses, comparing metals and non-metals, choosing the right material for the job, and recycling in South Africa.', blocks: ch8_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Processing Materials',
      description: 'How raw materials are processed (wool to fabric, clay to bricks, trees to paper), manufacturing in SA.',
      order: 9,
      lessons: [
        { title: 'Processing Materials', description: 'What processing is, examples of processing (wool to fabric, clay to bricks, trees to paper, iron ore to steel), South African processing industries, and the environmental impact of processing.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Structures',
      description: 'Natural vs human-made structures, shell/frame/solid types, strength, stability, triangles, designing and building structures.',
      order: 10,
      lessons: [
        { title: 'Structures', description: 'What a structure is, natural vs human-made structures, three types (shell, frame, solid), strength and stability, the triangle as the strongest shape, and the design process for building structures.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: Weather',
      description: 'Measuring weather (temperature, rainfall, wind), weather instruments, recording weather data, weather patterns in SA, cloud types.',
      order: 11,
      lessons: [
        { title: 'Weather', description: 'What weather is, weather instruments (thermometer, rain gauge, anemometer, wind vane), recording weather data, weather patterns across South Africa, cloud types, and weather forecasting by SAWS.', blocks: ch11_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 12: Water in the Environment',
      description: 'Water cycle, sources of water in SA, water conservation, pollution, clean vs dirty water, water treatment.',
      order: 12,
      lessons: [
        { title: 'Water in the Environment', description: 'Why water is important, the water cycle (evaporation, condensation, precipitation, collection), sources of water in South Africa, water treatment, water pollution, and water conservation.', blocks: ch12_lesson1, term: 4 },
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
    title: 'Grade 5 Natural Sciences \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Life and Living (plants and animals on Earth, animal life cycles, food chains), Energy and Change (stored energy in fuels, energy and temperature), Planet Earth and Beyond (the Sun, the Moon, weather, water in the environment), Matter and Materials (metals and non-metals, processing materials), and Technology (structures) for the Grade 5 Natural Sciences and Technology curriculum.',
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
  console.log('  TEXTBOOK: Grade 5 Natural Sciences');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
