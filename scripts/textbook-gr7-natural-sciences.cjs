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

// =============================================================================
// CHAPTER 1: The Biosphere (Term 1 — Life and Living)
// =============================================================================
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## The Biosphere\n\n### What Is the Biosphere?\n\nThe **biosphere** is the part of the Earth where life exists. It includes all living organisms and the environments in which they live.\n\nThe biosphere is made up of three main components:\n\n- **Lithosphere** — the solid, rocky outer layer of the Earth (the land). It includes soil and rocks where organisms such as plants, animals, insects, and burrowing creatures live.\n- **Hydrosphere** — all the water on Earth, including oceans, rivers, lakes, dams, and underground water. Many organisms live in or depend on water.\n- **Atmosphere** — the layer of gases (air) surrounding the Earth. Birds, insects, and microscopic organisms live in or move through the atmosphere.\n\n### Living Things in the Biosphere\n\nThe biosphere includes all living organisms — plants, animals, and microorganisms. It also includes dead organic matter.\n\nThere are many different kinds of living things, including plants, animals, fungi, bacteria, and other microorganisms. All of these need the resources of the biosphere to survive.'),
  q(2, 'Which part of the biosphere refers to all the water on Earth?',
    ['Lithosphere', 'Atmosphere', 'Hydrosphere', 'Biosphere'], 2,
    'The hydrosphere is the component of the biosphere that includes all water on Earth — oceans, rivers, lakes, dams, glaciers, and underground water. Many organisms live in or depend on water for survival.'),
  t(3, '### Requirements for Sustaining Life\n\nAll living things need certain conditions to survive:\n\n- **Energy** — most living things get energy from food. Plants use sunlight to make food through photosynthesis.\n- **Gases** — animals need oxygen for respiration; plants need carbon dioxide for photosynthesis.\n- **Water** — essential for all life processes.\n- **Soil** — provides nutrients and a place for plants to grow.\n- **Favourable temperatures** — living things need temperatures that are not too hot and not too cold.\n\n### Adaptations to the Environment\n\nLiving things are suited (adapted) to the environment in which they live. For example:\n\n- **Fish** have fins to move through water and gills to breathe dissolved oxygen.\n- **Cacti and aloes** store water in their thick, fleshy leaves to survive dry conditions in the Karoo.\n- **Fynbos plants** in the Western Cape have small, tough leaves to reduce water loss in hot, dry summers.'),
  fb(4, 'The biosphere is made up of the lithosphere (land), the hydrosphere (water), and the ___ (air). All living things need energy, water, and favourable ___ to survive.',
    ['atmosphere', 'temperatures'],
    'The atmosphere is the gaseous layer around the Earth where birds and insects fly. All organisms require specific temperature ranges — too hot or too cold, and life processes cannot function properly.'),
  t(5, '### Life Processes\n\nAll living things can carry out the **seven life processes**:\n\n1. **Nutrition (feeding)** — obtaining food for energy\n2. **Respiration** — releasing energy from food\n3. **Growth** — increasing in size\n4. **Reproduction** — producing offspring\n5. **Excretion** — removing waste products\n6. **Sensitivity** — responding to changes in the environment\n7. **Movement** — changing position or shape\n\nThese life processes distinguish living things from non-living things. A rock, for example, does not feed, grow, or reproduce.\n\n### Practical Activity: Growing Seedlings\n\nYou can investigate the conditions required for life by germinating seeds and growing seedlings. By placing seeds in different conditions (with and without light, water, or soil), you can observe which conditions are needed for growth. Measuring the height of the seedlings over time and recording observations in diagrams, tables, and graphs helps you understand the requirements for sustaining life.'),
  q(6, 'Which of the following is NOT one of the seven life processes?',
    ['Reproduction', 'Respiration', 'Rusting', 'Excretion'], 2,
    'Rusting is a chemical reaction that happens to iron, not a life process. The seven life processes are: nutrition, respiration, growth, reproduction, excretion, sensitivity, and movement. Only living things carry out all seven.'),
  q(7, 'Why are fynbos plants in the Western Cape adapted with small, tough leaves?',
    ['To attract more insects', 'To reduce water loss in hot, dry summers', 'To absorb more sunlight', 'To protect against frost'], 1,
    'Fynbos plants have evolved small, tough (sclerophyllous) leaves as an adaptation to the hot, dry summers of the Western Cape. Smaller leaves have less surface area, which reduces water loss through evaporation.'),
  fb(8, 'All living things carry out seven life processes. These include nutrition, respiration, growth, ___, excretion, sensitivity, and movement.',
    ['reproduction'],
    'Reproduction is the life process by which organisms produce offspring of the same kind. Without reproduction, a species would eventually die out. The seven life processes together define what it means to be alive.'),
  q(9, 'In which component of the biosphere would you find burrowing animals such as moles?',
    ['Atmosphere', 'Hydrosphere', 'Lithosphere', 'Stratosphere'], 2,
    'Burrowing animals like moles live in the lithosphere — the solid, rocky outer layer of the Earth that includes soil. They dig tunnels underground to find food and shelter.'),
  t(10, '### Summary\n\n- The biosphere is where life exists on Earth, comprising the lithosphere (land), hydrosphere (water), and atmosphere (air).\n- All living things carry out the seven life processes.\n- Living things need energy, gases, water, soil, and favourable temperatures to survive.\n- Organisms are adapted to their specific environments.\n- Investigating conditions for growth (such as germinating seeds) helps us understand what living things need to survive.'),
];

// =============================================================================
// CHAPTER 2: Biodiversity (Term 1 — Life and Living)
// =============================================================================
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Classification of Living Things\n\n### What Is Biodiversity?\n\nPlants, animals, and microorganisms, together with their habitats, make up the total **biodiversity** of the Earth. Biodiversity refers to the variety of all living organisms.\n\nLiving organisms are sorted and classified according to their shared characteristics. Scientists have grouped organisms into a **classification system** to make it easier to study them.\n\n### The Five Kingdoms\n\nThe five main groups (called **Kingdoms**) of living organisms are:\n\n| Kingdom | Examples | Key Features |\n|---------|----------|--------------|\n| **Bacteria** | TB bacteria, E. coli | Single-celled, microscopic, no nucleus |\n| **Protista** | Amoeba, Plasmodium | Mostly single-celled, have a nucleus |\n| **Fungi** | Mushrooms, moulds, yeast | Feed on dead or living matter, have cell walls |\n| **Plants** | Trees, grasses, ferns, mosses | Make their own food (photosynthesis), have cell walls |\n| **Animals** | Insects, fish, birds, mammals | Cannot make own food, must eat other organisms |\n\n### Levels of Classification\n\nKingdoms are further subdivided into smaller groups:\n\n**Kingdom → Phylum/Division → Class → Family → Order → Genus → Species**\n\nThe smallest group is the **species**.'),
  q(2, 'How many main Kingdoms are used to classify living organisms?',
    ['Three', 'Four', 'Five', 'Seven'], 2,
    'Scientists classify all living organisms into five main Kingdoms: Bacteria, Protista, Fungi, Plants, and Animals. Each Kingdom is then subdivided further into smaller groups based on shared characteristics.'),
  fb(3, 'The variety of all living organisms on Earth is called ___. The five Kingdoms are Bacteria, Protista, Fungi, Plants, and ___.',
    ['biodiversity', 'Animals'],
    'Biodiversity encompasses the full range of living organisms on Earth. The five Kingdoms represent the broadest classification, with Animals being the Kingdom that includes all organisms that cannot make their own food and must eat other organisms.'),
  t(4, '### Diversity of Animals\n\nAnimals are classified as either **vertebrates** (animals with backbones) or **invertebrates** (animals without backbones).\n\n#### The Five Classes of Vertebrates\n\nVertebrates are subdivided into five classes based on their distinguishing characteristics:\n\n| Class | Body covering | Breathing | Reproduction | Examples |\n|-------|--------------|-----------|-------------|----------|\n| **Fish** | Scales | Gills (dissolved O₂) | Lay eggs in water | Yellowfish, sardine |\n| **Amphibians** | Moist skin | Lungs and skin | Lay eggs in water | Frog, toad |\n| **Reptiles** | Dry scales | Lungs | Lay eggs on land | Crocodile, tortoise |\n| **Birds** | Feathers | Lungs | Lay hard-shelled eggs | Hadeda, secretary bird |\n| **Mammals** | Hair or fur | Lungs | Give birth to live young, produce milk | Springbok, elephant |\n\n**South African examples:**\n- Fish: the Knysna seahorse (endangered)\n- Amphibians: the Table Mountain ghost frog\n- Reptiles: the Nile crocodile\n- Birds: the blue crane (national bird)\n- Mammals: the African elephant, springbok'),
  q(5, 'Which class of vertebrates breathes through gills?',
    ['Amphibians', 'Reptiles', 'Fish', 'Mammals'], 2,
    'Fish breathe through gills, which extract dissolved oxygen from the water. Gills are specialised organs with a large surface area and thin walls that allow oxygen to pass into the blood and carbon dioxide to pass out.'),
  q(6, 'What is the key difference between vertebrates and invertebrates?',
    ['Vertebrates live in water; invertebrates live on land', 'Vertebrates have backbones; invertebrates do not', 'Vertebrates are small; invertebrates are large', 'Vertebrates eat plants; invertebrates eat animals'], 1,
    'The key difference is the presence of a backbone (vertebral column). Vertebrates — fish, amphibians, reptiles, birds, and mammals — all have an internal skeleton with a backbone. Invertebrates, such as insects and snails, do not.'),
  fb(7, 'Vertebrates are animals with ___. The five classes of vertebrates are fish, amphibians, reptiles, birds, and ___.',
    ['backbones', 'mammals'],
    'A backbone (vertebral column) is the defining feature of vertebrates. Mammals are the class that includes warm-blooded animals with hair or fur that produce milk to feed their young. Humans belong to the mammal class.'),
  t(8, '### Invertebrates\n\nInvertebrates are animals without backbones. They are subdivided into groups (phyla) including:\n\n**Arthropoda** — animals with a hard outer covering (exoskeleton) and jointed legs:\n- **Insects** — e.g., locusts, beetles, ants (6 legs, 3 body parts)\n- **Arachnids** — e.g., spiders, scorpions, ticks (8 legs)\n- **Crustaceans** — e.g., crabs, crayfish, prawns (usually 10 legs)\n\n**Mollusca** — soft-bodied animals, some with shells:\n- **Snails** — have a coiled shell\n- **Slugs** — no shell\n- **Mussels and oysters** — have two-part shells\n\n*Note: Classification of all invertebrate groups is not required at this level.*\n\n**Observing invertebrates:**\nYou can observe and describe invertebrates found in and around the school grounds. Look under rocks, in soil, on plants, and near water. Use a magnifying lens to examine small organisms closely.'),
  q(9, 'A spider has eight legs and an exoskeleton. To which group of arthropods does it belong?',
    ['Insects', 'Crustaceans', 'Arachnids', 'Mollusca'], 2,
    'Spiders belong to the arachnids — a group of arthropods with eight legs. Other arachnids include scorpions, ticks, and mites. Insects, by contrast, have six legs and three body parts.'),
  q(10, 'Which of the following is a mollusc?',
    ['A locust', 'A crab', 'A snail', 'A spider'], 2,
    'Snails are molluscs — soft-bodied animals that often have a shell. Mollusca also includes slugs, mussels, and oysters. Locusts and spiders are arthropods, and crabs are crustaceans (a type of arthropod).'),
];

blockNum = 0;
const ch2_lesson2 = [
  t(1, '## Diversity of Plants\n\n### Classifying Plants\n\nPlants are classified into two main groups based on how they reproduce:\n\n1. **Plants with seeds** — reproduce by producing seeds\n2. **Plants without seeds** — reproduce using spores (e.g., ferns and mosses)\n\n### Plants with Seeds\n\nPlants that produce seeds are further divided into two groups:\n\n**Angiosperms (flowering plants):**\n- Produce seeds inside flowers\n- The seeds develop inside a fruit\n- Examples: sunflowers, maize, proteas, baobab trees, roses\n- Most of the plants we see around us are angiosperms\n\n**Gymnosperms (cone-bearing plants):**\n- Produce seeds in cones (not flowers)\n- Seeds are not enclosed in a fruit\n- Examples: pine trees, cycads, yellowwood trees\n- Cycads are ancient plants — some South African species are endangered\n\n### Angiosperms: Monocotyledons and Dicotyledons\n\nAngiosperms consist of two major groups:\n\n| Feature | Monocotyledons | Dicotyledons |\n|---------|---------------|---------------|\n| Seed leaves | One seed leaf | Two seed leaves |\n| Leaf veins | Parallel veins | Branching (net) veins |\n| Flower parts | In multiples of 3 | In multiples of 4 or 5 |\n| Stem | Scattered vascular bundles | Ring of vascular bundles |\n| Roots | Fibrous roots | Taproot |\n| Examples | Grass, maize, lilies | Beans, sunflowers, oak trees |'),
  q(2, 'What is the main difference between angiosperms and gymnosperms?',
    ['Angiosperms grow faster', 'Angiosperms produce seeds in flowers; gymnosperms produce seeds in cones', 'Gymnosperms are bigger', 'Angiosperms do not produce seeds'], 1,
    'Angiosperms are flowering plants that produce seeds enclosed in fruits, which develop from flowers. Gymnosperms produce seeds in cones, and the seeds are not enclosed in a fruit. Examples of gymnosperms include pine trees and cycads.'),
  fb(3, 'Plants that produce seeds in flowers are called ___. Plants that produce seeds in cones are called ___.',
    ['angiosperms', 'gymnosperms'],
    'Angiosperms (flowering plants) produce seeds inside flowers that develop into fruits. Gymnosperms (cone-bearing plants) produce naked seeds in cones. The word "angio" means vessel (enclosing the seed), while "gymno" means naked.'),
  t(4, '### Identifying Monocotyledons and Dicotyledons\n\n**Monocotyledons (monocots):**\n- Have one seed leaf (cotyledon) when the seed germinates\n- Leaves have parallel veins running from base to tip\n- Flower parts are in multiples of three (3, 6, 9 petals)\n- Examples: grasses, maize, wheat, sugarcane, onions, lilies\n\n**Dicotyledons (dicots):**\n- Have two seed leaves (cotyledons) when the seed germinates\n- Leaves have a network of branching veins\n- Flower parts are in multiples of four or five (4, 5, 8, 10 petals)\n- Examples: beans, sunflowers, roses, proteas, oak trees, tomatoes\n\n**South African examples:**\n- Monocots: wild grasses of the savanna, sugar cane in KwaZulu-Natal\n- Dicots: the King Protea (our national flower), rooibos, marula tree\n\n**Practical Activity:**\nCollect examples of plants from around the school. Observe the leaves, flowers, and seeds. Classify each plant as a monocotyledon or dicotyledon based on the features you observe.'),
  q(5, 'A learner examines a leaf and finds that the veins run parallel from the base to the tip. This plant is most likely a:',
    ['Dicotyledon', 'Gymnosperm', 'Monocotyledon', 'Fern'], 2,
    'Parallel leaf veins are a key characteristic of monocotyledons. Dicotyledons have a branching network of veins in their leaves. Other monocot features include one seed leaf and flower parts in multiples of three.'),
  fb(6, 'Monocotyledons have ___ seed leaf (leaves), while dicotyledons have two seed ___.',
    ['one', 'leaves'],
    'The names monocotyledon and dicotyledon refer to the number of cotyledons (seed leaves). "Mono" means one, so monocots have one seed leaf. "Di" means two, so dicots have two seed leaves when the seed germinates.'),
  t(7, '### Plants Without Seeds\n\nSome plants reproduce using **spores** instead of seeds:\n\n- **Ferns** — have roots, stems, and fronds (leaves). Spores are produced in small brown structures called **sporangia** on the underside of the fronds.\n- **Mosses** — small, soft plants that grow in damp places. They do not have true roots, stems, or leaves. Spores are produced in a capsule on a stalk.\n\nPlants without seeds typically need moist environments because their spores require water to germinate and develop.\n\n**South African ferns:**\n- Tree ferns can be found in the mist forests of KwaZulu-Natal and Mpumalanga\n- Many fern species grow along streams and in shady, damp areas'),
  q(8, 'How do ferns reproduce?',
    ['By producing seeds in flowers', 'By producing seeds in cones', 'By producing spores', 'By producing bulbs'], 2,
    'Ferns reproduce using spores, not seeds. The spores are produced in small structures called sporangia, which are found on the underside of fern fronds (leaves). Spores are released and, in moist conditions, can develop into new fern plants.'),
  q(9, 'The King Protea is the national flower of South Africa. It is classified as a:',
    ['Monocotyledon', 'Gymnosperm', 'Fern', 'Dicotyledon'], 3,
    'The King Protea is a dicotyledon — a flowering plant (angiosperm) with branching leaf veins, flower parts in multiples of five, and two seed leaves. It belongs to the Proteaceae family and grows naturally in the fynbos biome.'),
  q(10, 'Which of the following plants is a gymnosperm?',
    ['Maize', 'Sunflower', 'Cycad', 'Grass'], 2,
    'Cycads are gymnosperms — they produce seeds in cones, not flowers. Cycads are ancient plants that have been on Earth for millions of years. Several species of cycad are found in South Africa, and many are endangered due to illegal harvesting.'),
];

// =============================================================================
// CHAPTER 3: Sexual Reproduction in Angiosperms (Term 1 — Life and Living)
// =============================================================================
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Sexual Reproduction in Angiosperms\n\n### Parts of a Flower\n\nSeeds are produced in **flowers**, which are the sexual organs of angiosperms (flowering plants).\n\nThe components of a flower usually include:\n\n**Male parts:**\n- **Stamens** — the male structures for producing pollen\n  - **Anther** — produces pollen grains (which contain male sex cells)\n  - **Filament** — holds up the anther\n\n**Female parts:**\n- **Stigma** — sticky surface that receives pollen\n- **Style** — connects the stigma to the ovary\n- **Ovary** — contains the ovules (which contain female sex cells / egg cells)\n\n**Other parts:**\n- **Petals** — often colourful, attract pollinators (insects, birds)\n- **Sepals** — green leaf-like structures that protect the flower bud\n- **Nectaries** — produce sweet nectar to attract pollinators'),
  q(2, 'Which part of the flower produces pollen grains?',
    ['The stigma', 'The ovary', 'The anther', 'The petal'], 2,
    'The anther is the part of the stamen (male reproductive structure) that produces pollen grains. Pollen grains contain the male sex cells. The anther is held up by a thin stalk called the filament.'),
  fb(3, 'The male parts of a flower are called ___. The sticky surface that receives pollen is called the ___.',
    ['stamens', 'stigma'],
    'Stamens are the male reproductive structures, each consisting of an anther (which produces pollen) and a filament. The stigma is the female part at the top of the style, and its sticky surface traps pollen grains during pollination.'),
  t(4, '### Pollination and Fertilisation\n\n**Pollination** is the transfer of pollen from the anther to the stigma of a flower of the same species.\n\n**Methods of pollination:**\n- **Wind pollination** — wind carries light, dry pollen (e.g., grasses, maize)\n- **Insect pollination** — insects such as bees carry pollen between flowers\n- **Bird pollination** — birds such as sunbirds carry pollen (e.g., proteas, aloes)\n- **Water pollination** — water carries pollen in some aquatic plants\n\n**Adaptations for pollination:**\n- Flowers have large, colourful petals to attract pollinators\n- Sweet nectar attracts insects and birds\n- Strong scents attract specific pollinators\n\n**Pollinators and food crops:**\nPollinators play an important role in the production of food crops such as maize, beans, and fruit. Without pollinators, many of our foods would not be produced.\n\n**Fertilisation** is the fusion of the male and female sex cells to produce a seed:\n- The pollen grain lands on the stigma\n- A **pollen tube** grows down through the style to the ovule\n- The male sex cell travels down the pollen tube\n- One male sex cell fertilises the egg, forming a seed\n- The other male sex cell fuses with two cells in the embryo sac, forming the endosperm (food store)\n- The ovary enlarges and becomes a **fruit**'),
  q(5, 'What is pollination?',
    ['The growth of a seed into a plant', 'The transfer of pollen from the anther to the stigma', 'The fusion of male and female sex cells', 'The opening of a flower bud'], 1,
    'Pollination is the transfer of pollen grains from the anther (male part) to the stigma (female part) of a flower. This can happen by wind, insects, birds, or water. Pollination is the first step before fertilisation can occur.'),
  fb(6, 'After pollination, a pollen ___ grows down the style to reach the ovule. The ovary develops into a ___ containing seeds.',
    ['tube', 'fruit'],
    'The pollen tube is a tiny tube that grows from the pollen grain through the style, carrying the male sex cell to the ovule for fertilisation. After fertilisation, the ovary wall thickens and develops into a fruit that contains and protects the seeds.'),
  t(7, '### Seed Dispersal\n\nSeeds are contained in fruits. Fruits and seeds are dispersed (spread) in various ways to ensure that new plants do not compete with the parent plant for light, water, and nutrients.\n\n**Methods of seed dispersal:**\n- **Wind** — seeds with wings or parachute-like structures (e.g., dandelion, sycamore)\n- **Water** — seeds that float (e.g., coconut)\n- **Animals** — seeds with hooks that stick to fur (e.g., blackjack), or seeds inside tasty fruits that animals eat (e.g., marula, berries)\n- **Explosive mechanism** — some pods burst open and scatter seeds (e.g., sour fig, impatiens)\n\n**South African examples:**\n- The **marula** fruit is eaten by elephants and baboons, who disperse the seeds in their droppings\n- **Blackjack** (*Bidens pilosa*) seeds have tiny hooks that stick to clothing and animal fur\n- Fynbos seeds are often dispersed by ants (myrmecochory) — the ants carry the seeds underground'),
  q(8, 'Blackjack seeds have tiny hooks that allow them to stick to animal fur and clothing. What method of seed dispersal is this?',
    ['Wind dispersal', 'Water dispersal', 'Animal dispersal', 'Explosive dispersal'], 2,
    'Blackjack seeds are dispersed by animals. The tiny hooks on the seeds catch onto animal fur or human clothing, carrying the seeds to new locations. This is a common method of seed dispersal in South African grasslands.'),
  q(9, 'Why is seed dispersal important for plants?',
    ['It makes the seeds taste better', 'It helps the seeds grow faster', 'It reduces competition between parent plants and seedlings for resources', 'It protects seeds from sunlight'], 2,
    'Seed dispersal is important because it spreads seeds away from the parent plant. This reduces competition for light, water, and nutrients between the parent and offspring. It also helps plants colonise new areas.'),
  fb(10, 'The fusion of the male sex cell with the egg cell is called ___. Seeds are spread away from the parent plant by a process called seed ___.',
    ['fertilisation', 'dispersal'],
    'Fertilisation occurs when the male sex cell fuses with the female egg cell inside the ovule, forming a zygote that develops into a seed. Seed dispersal is the spreading of seeds to new locations by wind, water, animals, or explosive mechanisms.'),
];

blockNum = 0;
const ch3_lesson2 = [
  t(1, '## Human Reproduction\n\n### Puberty\n\n**Puberty** is the stage in the human life cycle when sexual organs mature for reproduction. During puberty, humans experience drastic physical and emotional changes.\n\n**Changes during puberty:**\n\n| In males | In females |\n|----------|------------|\n| Voice deepens | Breasts develop |\n| Facial and body hair grows | Hips widen |\n| Shoulders broaden | Menstruation begins |\n| Muscles develop | Body hair grows |\n| Growth spurt | Growth spurt |\n\n### The Male Reproductive System\n\nThe male reproductive organs include:\n- **Testes** (singular: testis) — produce **sperm cells** (male sex cells)\n- **Penis** — delivers sperm to the female reproductive system\n- Sperm cells are very small and have a **tail** (flagellum) that helps them swim\n\n### The Female Reproductive System\n\nThe female reproductive organs include:\n- **Ovaries** — contain the **egg cells** (ova; singular: ovum)\n- **Uterus (womb)** — where a fertilised egg implants and a baby develops\n- **Vagina** — the birth canal'),
  q(2, 'What is puberty?',
    ['A disease that affects teenagers', 'The stage when sexual organs mature for reproduction', 'The time when babies learn to walk', 'The process of growing old'], 1,
    'Puberty is the stage in the human life cycle when the body undergoes physical and emotional changes, and the sexual organs mature so that reproduction becomes possible. It usually begins between ages 10 and 14.'),
  fb(3, 'The testes produce ___ cells (male sex cells). The ovaries contain ___ cells (female sex cells).',
    ['sperm', 'egg'],
    'The testes are the male reproductive organs that produce sperm cells. The ovaries are the female reproductive organs that contain egg cells (ova). Fertilisation occurs when a sperm cell fuses with an egg cell.'),
  t(4, '### Fertilisation and Pregnancy\n\nThe main purpose of human reproduction is for the sperm (male sex cell) and egg (female sex cell) to combine, develop, and produce a baby.\n\n**Fertilisation:**\n- Fertilisation is the process when the sperm fuses with the egg\n- This usually occurs in the fallopian tube\n- The fertilised egg (zygote) then travels to the uterus\n\n**Pregnancy:**\n- If fertilisation takes place, the fertilised egg is embedded (implanted) in the thick blood lining of the uterus\n- This leads to pregnancy\n- The uterus develops a thick layer of blood in preparation for a fertilised egg\n\n**Menstruation:**\n- If fertilisation does not take place, the thick layer of blood in the uterus breaks down\n- Menstruation occurs — the blood lining is released through the vagina\n- This is a monthly cycle (approximately every 28 days)'),
  q(5, 'What happens if fertilisation does not take place?',
    ['The egg grows into a baby', 'The uterus lining breaks down and menstruation occurs', 'The sperm cell stays in the uterus', 'Nothing happens'], 1,
    'If fertilisation does not occur, the thick blood lining that the uterus prepared for a fertilised egg is not needed. The lining breaks down and is released through the vagina. This process is called menstruation and occurs approximately every 28 days.'),
  t(6, '### Preventing Pregnancy and STIs\n\nPregnancy can be prevented by using **contraceptives** such as:\n\n- **Condoms** — a physical barrier that prevents the sperm from reaching the egg\n- Condoms also prevent the transmission of **sexually transmitted infections (STIs)** including **HIV/AIDS**\n- Other forms of contraception include pills, injections, and implants\n\n**HIV/AIDS in South Africa:**\n- HIV (Human Immunodeficiency Virus) is a sexually transmitted infection\n- It can also be spread through contaminated blood and from mother to child during birth or breastfeeding\n- Using condoms correctly and consistently is one of the most effective ways to prevent the spread of HIV\n\n**Important note:**\nIt is important for learners to understand that early sexual activity can have serious consequences. Learners need to know enough about this topic to make informed decisions and responsible choices.'),
  fb(7, 'Condoms can prevent both ___ and the transmission of sexually transmitted infections, including HIV/___.',
    ['pregnancy', 'AIDS'],
    'Condoms are barrier contraceptives that prevent sperm from reaching the egg (preventing pregnancy) and also prevent the exchange of bodily fluids between partners, which helps prevent sexually transmitted infections including HIV/AIDS.'),
  q(8, 'Where does fertilisation usually take place in the female reproductive system?',
    ['In the uterus', 'In the ovary', 'In the fallopian tube', 'In the vagina'], 2,
    'Fertilisation usually takes place in the fallopian tube (oviduct). The egg is released from the ovary and travels along the fallopian tube, where it may meet a sperm cell. The fertilised egg then continues to the uterus for implantation.'),
  q(9, 'Which of the following is a change that occurs during puberty in females?',
    ['Voice deepens significantly', 'Facial hair grows', 'Menstruation begins', 'Shoulders broaden significantly'], 2,
    'The onset of menstruation (the monthly period) is a key change during puberty in females. It indicates that the reproductive system is maturing. Other female puberty changes include breast development, widening of the hips, and body hair growth.'),
  t(10, '### Summary\n\n- Puberty is the stage when sexual organs mature for reproduction.\n- The male reproductive system produces sperm cells in the testes.\n- The female reproductive system produces egg cells in the ovaries.\n- Fertilisation occurs when a sperm fuses with an egg, usually in the fallopian tube.\n- If fertilisation occurs, the fertilised egg implants in the uterus, leading to pregnancy.\n- If fertilisation does not occur, menstruation takes place.\n- Condoms help prevent pregnancy and the spread of STIs, including HIV/AIDS.\n- It is important to make informed and responsible decisions about sexual health.'),
];

// =============================================================================
// CHAPTER 4: Variation (Term 1 — Life and Living)
// =============================================================================
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Variation Within a Species\n\n### What Is a Species?\n\nA **species** is a category within the classification system. Living things of the same type belong to the same species.\n\n- For example, **humans** are one species and **dogs** are another species.\n- Individuals of the same species can reproduce to make more individuals of the same species.\n- All people are human (*Homo sapiens*) and belong to the same species.\n\n### What Is Variation?\n\nDifferences between living things of the same species is called **variation**.\n\nEven though all humans belong to the same species, there are differences between us. Some of these characteristics are **inherited** (passed from parents to offspring through genes).\n\n**Examples of inherited characteristics in humans:**\n- Height\n- Eye colour\n- Hair colour and texture\n- Tongue-rolling ability\n- Earlobe shape (attached or free)\n- Skin colour'),
  q(2, 'What is variation?',
    ['The process of classifying organisms', 'Differences between living things of the same species', 'The way organisms adapt to their environment', 'The process of reproduction'], 1,
    'Variation refers to the differences that exist between individuals of the same species. For example, humans vary in height, eye colour, hair type, and many other characteristics. Some of these differences are inherited from parents.'),
  fb(3, 'A ___ is a group of living things that can reproduce with one another. Differences between individuals of the same species is called ___.',
    ['species', 'variation'],
    'A species is the most specific level of classification — organisms of the same species share key characteristics and can interbreed. Variation describes the differences between individuals within a species, some of which are inherited.'),
  t(4, '### Inherited Characteristics\n\nCharacteristics that are passed from parents to offspring are called **inherited characteristics**.\n\n**Examples you can investigate in the classroom:**\n\n- **Height** — measure the heights of learners in the class and display the data as a bar graph. There will be a range of heights, showing variation.\n- **Tongue-rolling** — some people can roll their tongue into a tube shape, while others cannot. This is an inherited trait.\n- **Earlobe shape** — some people have free (hanging) earlobes, while others have attached earlobes.\n\n**Continuous and discontinuous variation:**\n- **Continuous variation** — characteristics that show a range (e.g., height, hand span). When graphed, they form a smooth curve.\n- **Discontinuous variation** — characteristics that fall into distinct groups (e.g., tongue-rolling: you can or you cannot; blood type: A, B, AB, or O).\n\n**Practical Activity:**\nCollect information (data) about the height of learners in the class and show the results as a bar graph. Record information about how many learners are able (or not) to roll their tongues.'),
  q(5, 'Which of the following is an example of an inherited characteristic?',
    ['A scar on your arm', 'A suntan', 'Eye colour', 'A haircut'], 2,
    'Eye colour is determined by genes inherited from your parents. Scars, suntans, and haircuts are acquired characteristics — they are caused by environmental factors or actions, not by genes passed from parents.'),
  q(6, 'A learner investigates tongue-rolling ability. Some people can roll their tongue and others cannot. This is an example of:',
    ['Continuous variation', 'Discontinuous variation', 'Environmental variation', 'Artificial variation'], 1,
    'Tongue-rolling is an example of discontinuous variation because there are only two distinct categories — you can either roll your tongue or you cannot. There is no in-between. Continuous variation (like height) shows a full range of values.'),
  fb(7, 'Characteristics passed from parents to offspring are called ___ characteristics. Height is an example of ___ variation because it shows a range of values.',
    ['inherited', 'continuous'],
    'Inherited characteristics are determined by genes passed from parents to their children. Height is an example of continuous variation because people are not simply "tall" or "short" — there is a continuous range of heights across a population.'),
  t(8, '### Why Variation Matters\n\nVariation within a species is important because:\n\n- It allows some individuals to be better adapted to their environment\n- If the environment changes, some individuals with certain characteristics may survive better than others\n- This is the basis of **natural selection** — the idea that organisms with favourable characteristics are more likely to survive and reproduce\n\n**Example:**\nIf a drought occurs, plants with deeper root systems (a variation) may survive better because they can reach water deeper underground. These plants are more likely to reproduce and pass on their genes for deep roots.\n\n**Collecting and presenting data:**\nWhen investigating variation, you should:\n1. Collect data from your class (e.g., heights, tongue-rolling)\n2. Record the data in a table\n3. Present the results as a bar graph or pie chart\n4. Describe what the data shows about variation in the class'),
  q(9, 'Why is variation within a species important for survival?',
    ['It makes all organisms identical', 'It ensures some individuals may be better adapted if the environment changes', 'It causes all organisms to become extinct', 'It has no benefit'], 1,
    'Variation is important because it means some individuals may have characteristics that help them survive environmental changes. Without variation, an entire species could be wiped out by a single change in conditions.'),
  q(10, 'All humans belong to the same species. What is the scientific name for humans?',
    ['Canis familiaris', 'Homo sapiens', 'Felis catus', 'Pan troglodytes'], 1,
    'Homo sapiens is the scientific name for the human species. "Homo" is the genus and "sapiens" is the species. All humans, regardless of their differences (variation), belong to this one species.'),
];

// =============================================================================
// CHAPTER 5: Introduction to the Periodic Table of Elements
//            (Term 2 — Matter and Materials)
// =============================================================================
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## The Periodic Table of Elements\n\n### What Is the Periodic Table?\n\nThe **Periodic Table of Elements** is a classification system for the elements which make up all matter and materials in the world.\n\n**An element** is a pure substance which cannot be broken down further by chemical means.\n\n### History of the Periodic Table\n\nThe Periodic Table was devised by **Dmitri Mendeleev** in the 1860s. He arranged the elements according to their properties in a table format.\n\n### How the Periodic Table Is Organised\n\nThe elements are arranged into three main categories:\n\n- **Metals** — arranged on the left-hand side of the table\n- **Non-metals** — found on the far right-hand side of the table\n- **Semi-metals (metalloids)** — found in the region between metals and non-metals\n\n### Each Element Has:\n\n- Its own **name** (e.g., iron, gold, oxygen)\n- Its own **symbol** (one or two letters, e.g., Fe for iron, Au for gold, O for oxygen)\n- An **atomic number** — unique to each element\n- A specific **position** on the Periodic Table\n\nLearners should be able to identify the names and symbols of the first 20 elements. You do NOT need to memorise the atomic number of each element.'),
  q(2, 'Who devised the Periodic Table of Elements in the 1860s?',
    ['Isaac Newton', 'Albert Einstein', 'Dmitri Mendeleev', 'Marie Curie'], 2,
    'Dmitri Mendeleev, a Russian chemist, devised the Periodic Table in the 1860s. He arranged elements according to their properties, which allowed him to predict the existence of elements that had not yet been discovered.'),
  fb(3, 'An element is a ___ substance that cannot be broken down further by chemical means. Metals are found on the ___ side of the Periodic Table.',
    ['pure', 'left'],
    'An element is a pure substance made of only one kind of atom. On the Periodic Table, metals are arranged on the left-hand side, non-metals on the far right, and semi-metals in the region between metals and non-metals.'),
  t(4, '### Properties of Metals, Semi-Metals, and Non-Metals\n\n**Properties of metals:**\n- Usually shiny and lustrous\n- Ductile (can be drawn into wires) and malleable (can be hammered into shape)\n- Solid at room temperature (except mercury, which is liquid)\n- Good conductors of heat and electricity\n- Have high melting and boiling points\n\n**Properties of non-metals:**\n- Have a variety of properties depending on whether they are solids or gases\n- Non-metal solids are usually brittle and dull\n- Poor conductors of heat and electricity (insulators)\n- Some are gases at room temperature (e.g., oxygen, nitrogen)\n\n**Semi-metals (metalloids):**\n- Are solids\n- Have some properties of metals and some properties of non-metals\n- Examples include silicon and germanium\n- Used in electronics because they are **semiconductors**'),
  q(5, 'Which of the following is a property of metals?',
    ['They are poor conductors of electricity', 'They are usually brittle', 'They are good conductors of heat and electricity', 'They are all gases'], 2,
    'Metals are good conductors of heat and electricity. This is why copper is used for electrical wiring and aluminium for cooking pots. Metals are also usually shiny, ductile (can be drawn into wires), and malleable (can be shaped).'),
  fb(6, 'Metals are good conductors of heat and ___. Semi-metals like silicon are used in electronics because they are ___.',
    ['electricity', 'semiconductors'],
    'Metals conduct electricity because their electrons can move freely. Semi-metals are called semiconductors because they conduct electricity under certain conditions, making them essential for computer chips and electronic components.'),
  t(7, '### Some Important Elements and Their Symbols\n\nHere are some of the first 20 elements that you should know:\n\n| Atomic No. | Name | Symbol |\n|-----------|------|--------|\n| 1 | Hydrogen | H |\n| 2 | Helium | He |\n| 6 | Carbon | C |\n| 7 | Nitrogen | N |\n| 8 | Oxygen | O |\n| 11 | Sodium | Na |\n| 12 | Magnesium | Mg |\n| 13 | Aluminium | Al |\n| 14 | Silicon | Si |\n| 17 | Chlorine | Cl |\n| 19 | Potassium | K |\n| 20 | Calcium | Ca |\n| 26 | Iron | Fe |\n| 29 | Copper | Cu |\n| 79 | Gold | Au |\n\nNotice that some symbols come from the Latin names of the elements. For example, Fe comes from *ferrum* (Latin for iron) and Au comes from *aurum* (Latin for gold).'),
  q(8, 'What is the chemical symbol for iron?',
    ['Ir', 'I', 'Fe', 'In'], 2,
    'The chemical symbol for iron is Fe, which comes from the Latin word "ferrum." Many element symbols are derived from Latin or Greek names rather than their English names. Other examples include Au (gold, from "aurum") and Na (sodium, from "natrium").'),
  q(9, 'On the Periodic Table, where are the non-metals found?',
    ['On the left-hand side', 'In the centre', 'On the far right-hand side', 'At the bottom'], 2,
    'Non-metals are found on the far right-hand side of the Periodic Table. Metals occupy the left side, and semi-metals are found in the region between metals and non-metals, along a diagonal staircase-like line.'),
  q(10, 'Mercury is a metal, but it is different from most metals because at room temperature it is a:',
    ['Gas', 'Solid', 'Liquid', 'Powder'], 2,
    'Mercury is unique among metals because it is a liquid at room temperature. All other metals are solids at room temperature. Mercury is used in thermometers because it expands evenly when heated.'),
];

// =============================================================================
// CHAPTER 6: Properties of Materials (Term 2 — Matter and Materials)
// =============================================================================
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Properties of Materials\n\n### Why Properties Matter\n\nThe **properties** of materials determine their suitability for a particular use. When choosing a material for a specific purpose, we consider properties such as:\n\n- **Boiling point** — the temperature at which a liquid starts boiling (changes from liquid to gas)\n- **Melting point** — the temperature at which a solid starts melting (changes from solid to liquid)\n- **Electrical conductivity** — how well a material conducts electricity\n- **Heat conductivity (thermal conductivity)** — how well a material conducts heat\n- **Strength** — how much force a material can withstand\n- **Flexibility** — how easily a material bends without breaking\n- **Cost, colour, and texture** — practical factors in material selection\n\n### Boiling Point\n\nThe boiling point of a substance is the temperature at which the liquid starts boiling — the rapid change from a liquid state to a gas state.\n\n- Water boils at **100°C** at sea level\n- Different substances have different boiling points\n- Metals generally have very high boiling points'),
  q(2, 'At what temperature does water boil at sea level?',
    ['0°C', '50°C', '100°C', '200°C'], 2,
    'Water boils at 100°C at sea level. The boiling point is the temperature at which a liquid rapidly changes state from liquid to gas. Different substances have different boiling points — metals, for example, have much higher boiling points.'),
  t(3, '### Heat Conductivity\n\nMaterials that conduct heat well are called **conductors**. Materials that do not conduct heat well are called **insulators**.\n\n**Good conductors of heat:**\n- Metals such as copper, aluminium, steel, iron\n- This is why cooking pots and pans are made of metal\n\n**Good insulators of heat:**\n- Plastic, wood, rubber, glass, fabric\n- This is why pot handles are often made of plastic or wood\n- Oven gloves are made of insulating fabric\n\n**Investigating heat conductivity:**\nYou can investigate which materials are the best conductors by:\n1. Attaching small objects (like drawing pins) with wax or Vaseline to rods of different materials (copper, steel, aluminium, glass, wood)\n2. Placing one end of each rod in hot water\n3. Timing how long it takes for the wax to melt and the pin to fall off\n4. The rod where the pin falls off first is the best conductor'),
  fb(4, 'Materials that conduct heat well are called ___. Materials that do not conduct heat well are called ___.',
    ['conductors', 'insulators'],
    'Conductors allow heat to pass through them easily — metals are the best conductors. Insulators resist the flow of heat — materials like plastic, wood, and fabric are good insulators. This is why pot handles are made of plastic or wood.'),
  q(5, 'A learner tests heat conduction by placing rods of different materials into hot water, with wax and a pin attached to the other end. Which rod will lose its pin first?',
    ['Glass rod', 'Wooden rod', 'Copper rod', 'Plastic rod'], 2,
    'The copper rod will lose its pin first because copper is an excellent conductor of heat. Heat travels quickly through the copper, melting the wax at the other end. Glass, wood, and plastic are insulators and conduct heat poorly.'),
  t(6, '### Electrical Conductivity\n\nMaterials can also be classified by how well they conduct electricity:\n\n**Good conductors of electricity:**\n- Metals: copper, aluminium, gold, silver, steel\n- This is why electrical wires are made of copper\n\n**Poor conductors (insulators):**\n- Plastic, rubber, glass, wood, fabric\n- Electrical wires are coated in plastic insulation for safety\n\n### Impact on the Environment\n\nThe production and use of materials such as metals, plastics, and fuels has an impact on the environment:\n\n- **Mining** of metals damages landscapes, uses water, and can pollute rivers\n- **Plastic pollution** — plastics do not decompose easily and end up in oceans and landfills\n- **Burning fossil fuels** releases greenhouse gases and causes air pollution\n\n**What we can do:**\n- Recycle metals, plastics, and glass\n- Reduce use of single-use plastics\n- Choose sustainable materials where possible\n- Support responsible mining practices'),
  q(7, 'Why are electrical wires made of copper coated in plastic?',
    ['Because copper is cheap and plastic is colourful', 'Because copper conducts electricity well and plastic insulates to prevent shocks', 'Because both copper and plastic conduct electricity', 'Because copper is flexible and plastic is rigid'], 1,
    'Copper is one of the best electrical conductors, so it carries the current efficiently. The plastic coating is an insulator — it prevents the electricity from escaping the wire and protects people from electric shocks.'),
  fb(8, 'Electrical wires are made of ___ because it is an excellent conductor. The wires are coated in ___ for insulation and safety.',
    ['copper', 'plastic'],
    'Copper is used for electrical wiring because of its excellent electrical conductivity and flexibility. The plastic coating acts as an insulator, preventing the current from leaking out and protecting people from dangerous electric shocks.'),
  q(9, 'Which of the following is an environmental problem caused by the production and use of materials?',
    ['Trees growing too fast', 'Plastic pollution in oceans', 'Too much rain', 'Animals becoming too healthy'], 1,
    'Plastic pollution is a major environmental problem. Plastics do not decompose easily and can persist in the environment for hundreds of years, harming marine life and polluting oceans, rivers, and landscapes.'),
  q(10, 'A learner needs to choose a material for the handle of a frying pan. Which material would be safest?',
    ['Aluminium', 'Copper', 'Steel', 'Wood'], 3,
    'Wood is a good insulator of heat, making it a safe choice for a frying pan handle. Metal handles (aluminium, copper, steel) would conduct heat from the pan and could burn your hand. This is why many pan handles are made of wood or heat-resistant plastic.'),
];

// =============================================================================
// CHAPTER 7: Separating Mixtures (Term 2 — Matter and Materials)
// =============================================================================
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Mixtures and Separation\n\n### What Is a Mixture?\n\nA **mixture** is made up of two or more substances or materials that have different physical properties. The substances in a mixture are **not chemically bonded** — they are simply mixed together.\n\nBecause the properties differ, the substances can be **separated** using physical methods.\n\n### Methods of Physical Separation\n\nThe physical properties of the materials in a mixture determine the best method to separate them.\n\n**1. Hand sorting:**\n- Separating materials by hand based on visible differences\n- Example: separating sheep wool from thorns\n\n**2. Sieving:**\n- Using a mesh or sieve to separate particles of different sizes\n- Example: separating stones from sand on a building site\n\n**3. Filtration:**\n- Separating an insoluble solid from a liquid by passing the mixture through filter paper\n- The solid stays on the filter paper (residue), and the liquid passes through (filtrate)\n- Example: separating sand from water'),
  q(2, 'What is a mixture?',
    ['A pure substance made of one element', 'Two or more substances chemically bonded together', 'Two or more substances mixed together that are not chemically bonded', 'A substance that cannot be separated'], 2,
    'A mixture consists of two or more substances that are mixed together but not chemically bonded. Because they retain their individual properties, the substances in a mixture can be separated using physical methods such as filtration, evaporation, or sieving.'),
  fb(3, 'In filtration, the solid that stays on the filter paper is called the ___. The liquid that passes through is called the ___.',
    ['residue', 'filtrate'],
    'During filtration, the mixture is poured through filter paper. The insoluble solid particles are too large to pass through the tiny pores in the paper and remain as the residue. The liquid passes through and is collected as the filtrate.'),
  t(4, '### More Methods of Separation\n\n**4. Using a magnet (magnetism):**\n- Separating magnetic materials (iron, steel) from non-magnetic materials\n- Example: separating iron filings from sand, or iron filings from coins\n\n**5. Evaporation:**\n- Separating a dissolved solid from a liquid by heating\n- The liquid evaporates (turns to gas), leaving the solid behind\n- Example: retrieving salt from salt water\n\n**6. Distillation:**\n- Separating a liquid from a solution by boiling and then condensing the vapour\n- The liquid is boiled, turns to steam, and the steam is cooled in a condenser to form a pure liquid\n- Distillation always involves boiling and condensation\n- Example: retrieving pure water from sea water\n\n**7. Chromatography:**\n- Separating different colour pigments from one colour\n- Example: separating the different colour pigments in black ink\n- A drop of black ink on filter paper, with water or methylated spirits, shows the different colours that make up the black ink'),
  q(5, 'A learner needs to separate iron filings from sand. Which method should they use?',
    ['Filtration', 'Evaporation', 'Magnetism (using a magnet)', 'Chromatography'], 2,
    'Using a magnet is the best method because iron is magnetic and sand is not. When a magnet is moved through the mixture, the iron filings stick to the magnet and can be removed, leaving the sand behind.'),
  q(6, 'How would you retrieve salt from a salt-water solution?',
    ['By filtration', 'By using a magnet', 'By evaporation', 'By sieving'], 2,
    'Evaporation is used to separate a dissolved solid from a liquid. When the salt water is heated, the water evaporates (turns to gas), leaving the solid salt behind. Filtration would not work because the salt is dissolved, not suspended.'),
  fb(7, 'Distillation involves boiling a liquid and then ___ the vapour to collect the pure liquid. Chromatography can be used to separate different colour ___ from black ink.',
    ['condensing', 'pigments'],
    'In distillation, the liquid is boiled to produce steam, which is then cooled (condensed) back into a pure liquid. Chromatography works by using a solvent to carry different pigments across filter paper at different rates, separating them by colour.'),
  t(8, '### Sorting and Recycling Materials\n\nIt is every person\'s responsibility to dispose of waste in a proper way.\n\n**Materials suitable for recycling:**\n- Metals (aluminium cans, steel cans)\n- Plastics (bottles, containers)\n- Glass (bottles, jars)\n- Paper and cardboard\n\n**Materials that are NOT recyclable and must be composted or dumped:**\n- Organic material (food waste) — can be made into compost\n- Material which cannot be recycled has to be dumped in landfills\n\n**Consequences of poor waste management:**\n- Pollution of water, soil, and the environment\n- Health hazards and diseases\n- Blockage of sewage and drainage systems\n- Wastage of land used for landfills\n- Wastage of valuable materials that could be recycled\n\n**In South Africa:**\n- Many communities rely on waste pickers who sort recyclable materials from landfills\n- Recycling creates jobs and reduces environmental damage\n- Schools can set up recycling programmes for paper, plastic, and cans'),
  q(9, 'Which of the following methods separates different colour pigments from a mixture?',
    ['Filtration', 'Distillation', 'Chromatography', 'Evaporation'], 2,
    'Chromatography is the method used to separate different colour pigments from a mixture. A drop of ink on filter paper, with a solvent, shows the component colours as they spread at different rates across the paper.'),
  q(10, 'Which of the following is a consequence of poor waste management?',
    ['Improved air quality', 'Pollution of water and soil', 'More green spaces', 'Healthier communities'], 1,
    'Poor waste management leads to pollution of water and soil, health hazards, blocked drainage systems, and wasted land used for landfills. Proper waste management through recycling, composting, and responsible disposal helps protect the environment.'),
];

// =============================================================================
// CHAPTER 8: Acids, Bases, and Neutrals (Term 2 — Matter and Materials)
// =============================================================================
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Acids, Bases, and Neutrals\n\n### Tastes of Substances\n\nThe human tongue can sense four different tastes: **salty, sweet, sour, and bitter**.\n\n*Note: Not all substances are safe to taste. Never taste unknown substances.*\n\nThe taste of a substance can give a clue about whether it is an acid, a base, or neutral.\n\n### Properties of Acids\n\n**Acids** have the following properties:\n- Taste **sour**\n- Feel **rough** on the skin\n- Many are **dangerous** to taste or feel (corrosive)\n\n**Examples of acids:**\n- Lemon juice and other citrus fruit juices (citric acid)\n- Vinegar (acetic acid)\n- Tartaric acid (from grapes)\n- Swimming pool acid (hydrochloric acid) — very dangerous\n- Battery acid (sulfuric acid) — very dangerous\n\n### Properties of Bases\n\n**Bases** have the following properties:\n- Taste **bitter**\n- Feel **slippery** on the skin\n- Many are **dangerous** to taste or feel (corrosive)\n- Soluble bases are called **alkalis**\n\n**Examples of bases:**\n- Bicarbonate of soda (baking soda)\n- Washing powder and most soaps\n- Bleach and household cleaners\n- Antacids (for indigestion)'),
  q(2, 'Which of the following is a property of acids?',
    ['They taste bitter', 'They feel slippery', 'They taste sour', 'They are all safe to drink'], 2,
    'Acids taste sour — think of the sour taste of lemon juice (citric acid) or vinegar (acetic acid). Bases, on the other hand, taste bitter and feel slippery. However, many acids and bases are dangerous and should never be tasted.'),
  fb(3, 'Acids taste ___ and bases taste bitter. Soluble bases are also called ___.',
    ['sour', 'alkalis'],
    'The sour taste of acids is due to the hydrogen ions they release. Bases that dissolve in water are specifically called alkalis. Common examples include soap (alkaline) and lemon juice (acidic).'),
  t(4, '### Neutrals\n\n**Neutral** substances are neither acids nor bases. They have no particularly strong taste (neither sour nor bitter).\n\n**Examples of neutrals:**\n- Pure water\n- Salt solution (salt dissolved in water)\n- Sugar solution\n- Cooking oil\n\n### Acid-Base Indicators\n\n**Indicators** are substances that change colour to show whether something is an acid, a base, or neutral.\n\n**Litmus paper** is the most commonly used indicator:\n\n| Substance type | Red litmus paper | Blue litmus paper |\n|---------------|-----------------|------------------|\n| **Acid** | Stays red | Turns **red** |\n| **Base** | Turns **blue** | Stays blue |\n| **Neutral** | Stays red | Stays blue |\n\n**Important rules:**\n- We always use **both** red and blue litmus paper to test a substance\n- Red litmus paper remains red in an acid and a neutral, but turns blue in a base\n- Blue litmus paper remains blue in a base and a neutral, but turns red in an acid'),
  q(5, 'A learner tests a liquid with blue litmus paper and it turns red. What type of substance is the liquid?',
    ['A base', 'A neutral', 'An acid', 'Pure water'], 2,
    'When blue litmus paper turns red, it indicates the substance is an acid. Blue litmus paper remains blue in bases and neutrals. This is why we always test with both red and blue litmus paper to confirm our result.'),
  fb(6, 'Litmus paper is an ___. Blue litmus paper turns red in an acid, and red litmus paper turns ___ in a base.',
    ['indicator', 'blue'],
    'An indicator is a substance that changes colour depending on whether a substance is acidic, basic, or neutral. Litmus paper is the most common indicator used in schools. Both red and blue litmus paper should always be used together for reliable results.'),
  t(7, '### Classifying Common Substances\n\nYou can classify common beverages and household substances as acids, bases, or neutrals using litmus paper:\n\n**Common acids:**\n- Tea, rooibos tea — slightly acidic\n- Coffee — acidic\n- Fruit juices (orange, lemon) — acidic\n- Fizzy drinks (Coca-Cola, Fanta) — acidic\n- Vinegar — acidic\n\n**Common bases:**\n- Soap and liquid soap — basic (alkaline)\n- Bicarbonate of soda — basic\n- Antacids (for heartburn) — basic\n- Shampoo — basic\n- Bleach — strongly basic\n\n**Common neutrals:**\n- Pure water — neutral\n- Salt water — neutral\n- Sugar water — neutral\n- Cooking oil — neutral\n\n**Practical investigation:**\nTest a range of household substances and beverages using red and blue litmus paper. Record results in a table and classify each substance as acid, base, or neutral.'),
  q(8, 'Which of the following substances is a base (alkaline)?',
    ['Lemon juice', 'Vinegar', 'Bicarbonate of soda', 'Orange juice'], 2,
    'Bicarbonate of soda (baking soda) is a common base. It is used in baking and also as an antacid to neutralise excess stomach acid. Lemon juice, vinegar, and orange juice are all acids.'),
  q(9, 'A substance is tested with both red and blue litmus paper. The red litmus stays red and the blue litmus stays blue. What type of substance is it?',
    ['An acid', 'A base', 'A neutral', 'An indicator'], 2,
    'If red litmus stays red and blue litmus stays blue, the substance is neutral. An acid would turn blue litmus red, and a base would turn red litmus blue. Neutral substances do not change the colour of either litmus paper.'),
  fb(10, 'Vinegar is an ___ because it tastes sour and turns blue litmus paper red. Pure water is ___ because it is neither an acid nor a base.',
    ['acid', 'neutral'],
    'Vinegar contains acetic acid, which gives it a sour taste and makes it turn blue litmus paper red. Pure water has a balanced pH and is neither acidic nor basic — it is neutral and does not change the colour of either litmus paper.'),
];

// =============================================================================
// CHAPTER 9: Sources of Energy (Term 3 — Energy and Change)
// =============================================================================
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Sources of Energy\n\n### What Is Energy?\n\nEnergy is needed to make everything work, move, or live. A **source of energy** has energy stored and waiting to be used, or energy that is needed to make something happen.\n\n### Non-Renewable and Renewable Energy Sources\n\nEnergy sources can be classified into two groups:\n\n**Non-renewable energy sources:**\n- **Cannot** be replenished once used up\n- Will eventually run out\n- Examples: coal, oil, natural gas (fossil fuels), and nuclear fuels (uranium)\n- Fossil fuels were formed from the remains of plants and animals millions of years ago\n\n**Renewable energy sources:**\n- Are continually replenished and will not run out\n- Examples: solar power (sunlight), wind power, hydroelectric power (water), biofuel (wood), geothermal energy\n\n**South Africa\'s energy context:**\n- South Africa relies heavily on **coal** for electricity generation (through Eskom power stations)\n- The country is expanding renewable energy through solar farms and wind farms\n- The Northern Cape has some of the best solar energy potential in the world\n- Wind farms are being built along the coastline, especially in the Eastern and Western Cape'),
  q(2, 'Which of the following is a non-renewable energy source?',
    ['Solar power', 'Wind power', 'Coal', 'Hydroelectric power'], 2,
    'Coal is a non-renewable energy source — a fossil fuel formed from dead plants over millions of years. Once coal is burned, it cannot be replaced. Solar, wind, and hydroelectric power are renewable because they are continually replenished by nature.'),
  fb(3, 'Fossil fuels such as coal, oil, and natural gas are ___ energy sources. Solar and wind energy are ___ energy sources.',
    ['non-renewable', 'renewable'],
    'Non-renewable energy sources cannot be replaced once used — fossil fuels take millions of years to form. Renewable energy sources are continually replenished by nature. South Africa is investing in renewable energy, but still relies heavily on coal.'),
  t(4, '### Advantages and Disadvantages\n\n**Nuclear energy:**\n- Uses uranium as fuel\n- Produces large amounts of electricity\n- Does not produce greenhouse gases during operation\n- However, nuclear waste is dangerous and difficult to dispose of\n- South Africa has one nuclear power station — **Koeberg** near Cape Town\n\n**Advantages of renewable energy:**\n- Does not run out\n- Generally cleaner — less pollution and greenhouse gases\n- Reduces dependence on fossil fuels\n\n**Disadvantages of renewable energy:**\n- Can be expensive to set up initially\n- Some sources depend on weather (sun, wind)\n- Large areas of land may be needed (solar farms, wind farms)\n\n**Why South Africa needs to shift to renewables:**\n- Coal is running out and is polluting\n- Climate change is caused partly by burning fossil fuels\n- South Africa has abundant sunshine and wind — ideal for renewables\n- Load shedding has shown the limitations of depending heavily on coal power stations'),
  q(5, 'South Africa has a nuclear power station near Cape Town. What is it called?',
    ['Medupi', 'Koeberg', 'Kusile', 'Arnot'], 1,
    'Koeberg is South Africa\'s only nuclear power station, located near Cape Town in the Western Cape. It uses uranium as fuel and produces electricity without directly emitting greenhouse gases, though nuclear waste management remains a challenge.'),
  q(6, 'Which of the following is an advantage of renewable energy sources?',
    ['They produce more pollution', 'They will eventually run out', 'They are generally cleaner and do not run out', 'They are always cheaper than fossil fuels'], 2,
    'Renewable energy sources are generally cleaner than fossil fuels — they produce little or no greenhouse gases during operation, and they will not run out because they are continually replenished by nature.'),
  fb(7, 'South Africa\'s only nuclear power station is called ___. The country has excellent potential for ___ energy due to abundant sunshine.',
    ['Koeberg', 'solar'],
    'Koeberg nuclear power station, near Cape Town, is South Africa\'s only nuclear facility. The Northern Cape receives some of the highest levels of solar radiation in the world, making South Africa ideally suited for large-scale solar energy projects.'),
  t(8, '### Energy in Food\n\nThere is also **potential energy** in food. All energy in food originally comes from the Sun — plants capture sunlight through photosynthesis and store it as chemical energy.\n\n- The energy content in foods is usually labelled on food packaging\n- Energy in food is measured in **kilojoules (kJ)** or sometimes calories\n- Different foods contain different amounts of energy\n- Foods high in fats and sugars contain more energy per gram\n\n**Practical Activity:**\nFind the energy content in different foods by reading the labels on food packaging. Compare the energy values and discuss which foods provide the most energy.'),
  q(9, 'The energy in food originally comes from which source?',
    ['The Moon', 'The soil', 'The Sun', 'Underground heat'], 2,
    'All energy in food originally comes from the Sun. Plants capture sunlight through photosynthesis and convert it into chemical energy stored in glucose. Animals eat plants (or eat other animals that ate plants), so all food energy traces back to the Sun.'),
  q(10, 'Why is South Africa investing in wind and solar farms?',
    ['Because coal is too clean', 'Because the country has no wind or sun', 'Because fossil fuels are running out and cause pollution', 'Because nuclear power is too cheap'], 2,
    'South Africa is investing in renewable energy because fossil fuels like coal are running out, cause air pollution, and contribute to climate change. The country has abundant sunshine and wind, making it ideal for solar and wind energy generation.'),
];

// =============================================================================
// CHAPTER 10: Potential and Kinetic Energy (Term 3 — Energy and Change)
// =============================================================================
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Potential Energy\n\n### What Is Potential Energy?\n\n**Potential energy** is energy that is stored in a system. It is energy waiting to be used.\n\n**Examples of potential energy:**\n- A stretched rubber band — energy is stored in the elastic material\n- A weight balanced on the edge of a table — energy is stored due to its position (height)\n- A cell (battery) — chemical energy is stored inside\n- Fuel (petrol, coal) — chemical energy is stored\n- Food — chemical energy is stored\n\n### Potential Energy in Food\n\nThere is also potential energy in food. The energy content in foods is usually labelled on food packaging and is measured in **joules (J)** or **kilojoules (kJ)**.\n\n*Note: Definition and calculation of joules is NOT required at Grade 7 level.*\n\n### Gravitational Potential Energy\n\nObjects that are raised above the ground have gravitational potential energy. The higher the object, the more potential energy it has.\n\n- A ball held above the ground has potential energy\n- A book on a high shelf has more potential energy than one on a low shelf\n- Water stored behind a dam wall has potential energy'),
  q(2, 'A stretched rubber band has energy stored in it. What type of energy is this?',
    ['Kinetic energy', 'Sound energy', 'Potential energy', 'Heat energy'], 2,
    'A stretched rubber band has potential energy — energy stored due to its stretched (deformed) position. When released, this stored energy is converted into kinetic energy as the rubber band snaps back.'),
  fb(3, 'Energy that is stored in a system and waiting to be used is called ___ energy. The energy content of food is measured in ___ (kJ).',
    ['potential', 'kilojoules'],
    'Potential energy is stored energy. Food contains chemical potential energy that is released during digestion and respiration. Food energy is measured in kilojoules (kJ) — you can find this information on food packaging labels.'),
  t(4, '## Kinetic Energy\n\n### What Is Kinetic Energy?\n\n**Kinetic energy** is the energy that a body has when it is moving.\n\n**Examples of kinetic energy:**\n- A rubber band snapping back\n- A weight falling off a table\n- Wind blowing\n- Water flowing in a river or waterfall\n- A vehicle moving on the road\n- A cricket ball hit by a bat\n- Electrical current flowing through a circuit\n\n### Potential and Kinetic Energy Together\n\nPotential and kinetic energy are involved in many systems:\n\n| System type | Potential energy | Kinetic energy |\n|-------------|-----------------|----------------|\n| **Mechanical** | A cricket ball hit by a bat | The ball flying through the air |\n| **Thermal (heating)** | Fuel in a candle | Flame producing heat |\n| **Electrical** | Chemical energy in a battery | Current flowing through a circuit lighting a bulb |\n| **Biological** | Food eaten by a horse | The horse running |\n\nA **system** is a set of parts working together. In any system, energy can be transferred from potential to kinetic energy.'),
  q(5, 'A ball is thrown into the air. At the highest point of its flight, which type of energy is at its maximum?',
    ['Kinetic energy', 'Sound energy', 'Potential energy', 'Heat energy'], 2,
    'At the highest point, the ball has momentarily stopped moving (zero kinetic energy) and has maximum gravitational potential energy due to its height. As it falls back down, the potential energy converts back to kinetic energy.'),
  fb(6, 'The energy of a moving object is called ___ energy. A ball at the top of its flight has maximum ___ energy.',
    ['kinetic', 'potential'],
    'Kinetic energy is the energy of motion — any moving object has kinetic energy. At the top of its flight, a ball has maximum gravitational potential energy because it is at its greatest height, and its kinetic energy is momentarily zero.'),
  t(7, '### The Law of Conservation of Energy\n\nThe **law of conservation of energy** states that energy can neither be created nor destroyed, but can be converted from one form to another.\n\n**Examples of energy conversion:**\n- A **candle**: chemical potential energy → heat and light energy\n- A **falling ball**: gravitational potential energy → kinetic energy\n- A **battery in a torch**: chemical energy → electrical energy → light and heat energy\n- A **motor**: electrical energy → kinetic (movement) energy\n- A **plant**: light energy (from the Sun) → chemical potential energy (in glucose)\n\n**Energy transfer in systems:**\n- Energy can be transferred from one system to another\n- For example, an electrical system can transfer energy to a mechanical system (a motor)\n- Or a mechanical system can transfer energy to an electrical system (a generator)'),
  q(8, 'According to the law of conservation of energy, what happens to energy?',
    ['It can be created from nothing', 'It can be destroyed completely', 'It can be converted from one form to another but never created or destroyed', 'It disappears when used'], 2,
    'The law of conservation of energy is a fundamental principle: energy cannot be created or destroyed. It can only be converted from one form to another. For example, a battery converts chemical energy to electrical energy, which a bulb converts to light and heat.'),
  fb(9, 'Energy can neither be ___ nor destroyed. A battery converts chemical energy into ___ energy.',
    ['created', 'electrical'],
    'The law of conservation of energy states that energy is never lost — it changes form. A battery stores chemical potential energy, which is converted to electrical energy when the circuit is complete, and then to light and heat energy in a light bulb.'),
  q(10, 'In a biological system, a horse eats food (potential energy) and then runs (kinetic energy). What type of energy conversion is this?',
    ['Kinetic to potential', 'Chemical potential to kinetic', 'Light to sound', 'Heat to electrical'], 1,
    'The food contains chemical potential energy. When the horse digests the food, this chemical energy is released through respiration and converted into kinetic energy (movement) as the horse runs. This is an example of the conservation of energy.'),
];

// =============================================================================
// CHAPTER 11: Heat Transfer (Term 3 — Energy and Change)
// =============================================================================
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Heat Transfer\n\n### What Is Heat Transfer?\n\n**Heating** is a process in which energy is transferred from a hotter body to a cooler body. The energy transfer continues until both bodies are at the **same temperature**.\n\nHeat is transferred in three ways:\n1. **Conduction**\n2. **Convection**\n3. **Radiation**\n\n### Conduction\n\n**Conduction** is the transfer of heat between solid objects that are in direct physical contact with each other.\n\n- Heat "travels" from the source of heat through the object, from one end to the other\n- **Metals** are good conductors of heat. Some metals conduct heat better than others.\n- The best conductors include copper, aluminium, and silver\n- **Insulators** prevent or slow down conduction of heat\n- Examples of insulators: plastic, wood, rubber, glass, fabric\n\n**Everyday examples of conduction:**\n- A metal spoon in hot soup becomes hot — heat conducts through the metal\n- Cooking pots are made of metal (good conductors) so heat reaches the food\n- Pot handles are made of plastic or wood (insulators) so you do not burn your hand'),
  q(2, 'What is conduction?',
    ['Heat transfer through a fluid', 'Heat transfer through empty space', 'Heat transfer between objects in direct physical contact', 'Heat transfer by light'], 2,
    'Conduction is the transfer of heat through direct physical contact between objects. Heat moves from the hotter object to the cooler one. Metals are the best conductors of heat, which is why a metal spoon in hot soup quickly becomes hot.'),
  fb(3, 'Heat is transferred through direct contact by ___. Metals are good ___ of heat.',
    ['conduction', 'conductors'],
    'Conduction requires direct physical contact between objects. Metals are good conductors because their particles are closely packed and transfer energy efficiently through vibrations. Insulators like wood and plastic are poor conductors.'),
  t(4, '### Convection\n\n**Convection** is the transfer of heat from one place to another by the movement of liquid or gas particles.\n\n**How convection works:**\n- When air or water is heated, the particles expand and become less dense\n- The heated (less dense) particles rise\n- Cooler (denser) particles sink to take their place\n- This creates a circular flow called a **convection current**\n\n**Everyday examples of convection:**\n- A pot of water heating on a stove — hot water rises from the bottom, cool water sinks\n- A room heater heats air near it; the hot air rises and cooler air flows in to replace it\n- Wind is caused by convection currents in the atmosphere — the Sun heats the ground unevenly, causing air to rise in some areas and sink in others\n- Sea breezes: during the day, land heats faster than the sea, so hot air rises over the land and cooler air flows in from the sea'),
  q(5, 'In a pot of water being heated on a stove, what happens to the hot water?',
    ['It sinks to the bottom', 'It stays in the middle', 'It rises to the top', 'It disappears'], 2,
    'When water is heated, it expands and becomes less dense. The hot, less dense water rises to the top while cooler, denser water sinks to the bottom to be heated. This circular movement is called a convection current.'),
  fb(6, 'The circular flow of heated fluid is called a convection ___. Convection occurs in liquids and ___ but not in solids.',
    ['current', 'gases'],
    'A convection current forms when heated fluid rises and cooler fluid sinks to replace it, creating a circular flow. Convection only occurs in fluids (liquids and gases) because the particles must be free to move. In solids, particles are locked in position.'),
  t(7, '### Radiation\n\n**Radiation** is the transfer of heat that does not require physical contact or the movement of particles. Heat can travel through **empty space**.\n\n**Key facts about radiation:**\n- The heat from the Sun travels mainly by radiation across empty space to the Earth\n- Radiation does not require any medium (material) to travel through\n- All hot objects radiate heat\n\n**Absorption and reflection of radiant heat:**\n- **Dark surfaces** (such as black) absorb radiant heat more quickly — they heat up faster\n- **Shiny or light surfaces** (such as silver or white) are good reflectors of radiant heat — they heat up more slowly\n\n**Examples:**\n- On a hot day, a black car heats up faster than a white car\n- Shiny silver emergency blankets reflect body heat back to keep a person warm\n- Solar water heaters are painted black to absorb more heat from the Sun\n- Houses in hot climates are often painted white to reflect heat'),
  q(8, 'Why do solar water heaters have black-painted panels?',
    ['Because black paint is cheapest', 'Because dark surfaces absorb more radiant heat', 'Because black surfaces reflect heat', 'Because black paint lasts longer'], 1,
    'Dark surfaces, such as black-painted panels, absorb more radiant heat energy than light or shiny surfaces. This is why solar water heaters use black panels — to absorb as much heat from the Sun as possible to heat the water inside.'),
  fb(9, 'The Sun\'s heat reaches Earth by ___. Dark surfaces ___ radiant heat, while shiny surfaces reflect it.',
    ['radiation', 'absorb'],
    'Radiation is the only form of heat transfer that can travel through empty space — this is how the Sun\'s heat reaches Earth. Dark surfaces absorb radiant heat (heating up quickly), while shiny or light surfaces reflect it (staying cooler).'),
  q(10, 'Which method of heat transfer is responsible for sea breezes along the South African coast?',
    ['Conduction', 'Convection', 'Radiation', 'Evaporation'], 1,
    'Sea breezes are caused by convection. During the day, the land heats up faster than the sea. Hot air rises over the warm land, and cooler air from the sea flows in to replace it, creating a sea breeze. This is a convection current on a large scale.'),
];

blockNum = 0;
const ch11_lesson2 = [
  t(1, '## Insulation and Energy Saving\n\n### Using Insulating Materials\n\nHeat can be lost (or gained) through conduction, convection, and radiation from our bodies and objects. People use **insulating materials** to slow down heat transfer.\n\n**Insulators slow down heat transfer by:**\n- Reducing conduction (e.g., oven gloves, polystyrene cups)\n- Reducing convection (e.g., trapped air in blankets, double-glazed windows)\n- Reducing radiation (e.g., shiny reflective surfaces on emergency blankets)\n\n**Examples of insulation in daily life:**\n- **Cool boxes** — Styrofoam walls slow down heat transfer, keeping food cold\n- **Jerseys and blankets** — trap air, which is a poor conductor, keeping us warm\n- **Woolly hats** — reduce heat loss from the head in winter\n- **Buildings** — ceiling insulation (like Isotherm or glass fibre) reduces heat loss in winter and heat gain in summer\n- **Geyser blankets** — reduce heat loss from hot water geysers, saving electricity'),
  q(2, 'How do blankets keep you warm?',
    ['By producing heat', 'By trapping air, which is a poor conductor of heat', 'By conducting heat into your body', 'By absorbing cold from the air'], 1,
    'Blankets keep you warm by trapping air between the fabric fibres. Air is a poor conductor of heat (it is an insulator), so the trapped air reduces heat loss from your body through conduction. The blanket itself does not produce heat.'),
  fb(3, 'Insulating materials slow down heat ___. A geyser blanket saves electricity by reducing heat ___ from the hot water.',
    ['transfer', 'loss'],
    'Insulating materials reduce the rate of heat transfer between objects or between an object and its surroundings. Geyser blankets wrap around the hot water cylinder, trapping a layer of air that slows heat loss, so the geyser uses less electricity to keep water hot.'),
  t(4, '### Energy Saving in Homes\n\nConservation of heat energy in homes and buildings can be improved by minimising heat loss in winter and heat gain in summer.\n\n**Energy-saving strategies:**\n- **Ceiling insulation** — reduces heat loss through the roof (hot air rises)\n- **Geyser blankets** — reduce heat loss from hot water geysers\n- **Double-glazed windows** — trap air between two panes of glass, reducing conduction\n- **Weather stripping** — seals gaps around doors and windows to reduce draughts\n- **Curtains** — thick curtains reduce heat transfer through windows\n\n**Indigenous knowledge:**\n- Many traditional homes and technologies in South Africa are designed for our climate\n- **Rondavels** (traditional round houses) have thick walls that stay cool in summer and warm in winter\n- The round shape reduces surface area, minimising heat loss\n- Thatched roofs provide good insulation'),
  q(5, 'Why are traditional rondavels good at maintaining comfortable temperatures?',
    ['Because they are painted white', 'Because they have thin walls', 'Because their thick walls and round shape minimise heat transfer', 'Because they have glass windows'], 2,
    'Rondavels have thick walls made of mud or clay that act as insulation — they warm up slowly and cool down slowly, keeping the interior comfortable. The round shape also minimises the surface area exposed to the outside, reducing heat transfer.'),
  t(6, '### Thermal Lunchbox Challenge\n\nA fun practical investigation is to design and test a lunchbox that keeps food warm using insulating materials.\n\n**Materials you might use:**\n- Newspaper, fabric, bubble wrap, aluminium foil, cotton wool, cardboard\n- A container (plastic tub or box)\n\n**Method:**\n1. Fill a container with hot water and measure the starting temperature\n2. Wrap the container with different insulating materials\n3. Measure the temperature at regular intervals (every 5 or 10 minutes)\n4. Record results in a table and draw a line graph\n5. Compare results — the container that stays warmest for longest has the best insulation\n\n**Variables:**\n- **Independent variable** — the type of insulating material\n- **Dependent variable** — the temperature of the water over time\n- **Controlled variables** — same volume of water, same starting temperature, same container size'),
  fb(7, 'In the thermal lunchbox investigation, the insulating material is the ___ variable. The temperature of the water is the ___ variable.',
    ['independent', 'dependent'],
    'The independent variable is what you change (the insulating material). The dependent variable is what you measure (the temperature). Controlled variables are kept the same (volume of water, starting temperature) to ensure a fair test.'),
  q(8, 'Which of the following materials would be the BEST insulator for a thermal lunchbox?',
    ['Thin aluminium sheet', 'Layers of newspaper and cotton wool', 'A single sheet of paper', 'A metal can'], 1,
    'Layers of newspaper and cotton wool would make the best insulator because they trap air in many small pockets. Air is a poor conductor of heat, so the trapped air slows heat loss. Metal and thin paper provide poor insulation.'),
  q(9, 'Ceiling insulation is important in South African homes because:',
    ['Cold air rises and escapes through the roof', 'Hot air rises and escapes through the roof, causing heat loss in winter', 'It makes the house look nicer', 'It keeps out noise'], 1,
    'Hot air rises (convection), so in winter, warm air inside the house rises to the ceiling and can escape through an uninsulated roof. Ceiling insulation traps this warm air, keeping the house warmer and reducing the need for heating — saving energy and money.'),
  q(10, 'A learner wraps a hot container with aluminium foil (shiny side out). How does this reduce heat loss?',
    ['The foil conducts heat back into the container', 'The shiny surface reflects radiant heat back toward the container', 'The foil absorbs all the heat', 'The foil makes the container heavier'], 1,
    'The shiny surface of aluminium foil reflects radiant heat. When the shiny side faces outward, it reflects escaping radiant heat back toward the container, reducing heat loss by radiation. This is the same principle used in emergency blankets.'),
];

// =============================================================================
// CHAPTER 12: Energy Transfer to Surroundings (Term 3 — Energy and Change)
// =============================================================================
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Energy Transfer to Surroundings\n\n### Useful and "Wasted" Energy\n\nSystems such as appliances, tools, vehicles, and machines provide **useful energy outputs**. However, some energy that is transferred in a system escapes to the surrounding environment as **"wasted" energy**.\n\n**Key principle:**\nThe output energy in a system is always **less** than the input energy, because some of the energy escapes to the surroundings.\n\n**Examples of wasted energy:**\n- A **light bulb** converts electrical energy into light (useful) and heat (wasted). The heat escapes into the room.\n- A **car engine** converts chemical energy (petrol) into kinetic energy (movement — useful) and heat energy (wasted). A car wastes about 65% of the energy from fuel as heat.\n- A **power station** burns coal to produce electricity, but wastes about 50% of the energy as heat to the surroundings.\n- An **electric drill** converts electrical energy into kinetic energy (useful) but also produces heat and sound (wasted).'),
  q(2, 'Why is the output energy of a system always less than the input energy?',
    ['Because energy is destroyed', 'Because some energy escapes to the surroundings as wasted energy', 'Because machines create energy', 'Because energy is stored forever'], 1,
    'Some energy always escapes to the surroundings as "wasted" energy, usually in the form of heat and/or sound. This is why no machine or system is 100% efficient — some energy is always lost to the environment, though it is not destroyed (conservation of energy).'),
  fb(3, 'Energy that escapes to the surroundings from a system is called ___ energy. This wasted energy is usually in the form of ___ or sound.',
    ['wasted', 'heat'],
    '"Wasted" energy is energy that is not usefully transferred but escapes to the surroundings. Most wasted energy takes the form of heat (thermal energy) or sound. The energy is not destroyed — it is simply not doing useful work.'),
  t(4, '### Examples of Wasted Energy in Everyday Systems\n\n| System | Useful energy output | Wasted energy |\n|--------|---------------------|---------------|\n| Light bulb | Light | Heat |\n| Car engine | Movement (kinetic) | Heat, sound |\n| Electric drill | Movement (kinetic) | Heat, sound |\n| Food processor | Movement (kinetic) | Heat, sound |\n| Hair dryer | Heat (useful here!) | Sound |\n| Candle | Light, heat | Sound (crackling) |\n| Coal power station | Electricity | Heat |\n| Television | Light, sound (useful) | Heat |\n\n**Note:** Whether energy is "useful" or "wasted" depends on the purpose of the system. For a heater, heat is the useful output. For a light bulb, heat is wasted.\n\n**A candle** is an example of "wasted" energy in a lamp — heat is produced that is not needed for lighting purposes.'),
  q(5, 'A car engine converts about 35% of the fuel energy into movement. What happens to the remaining 65%?',
    ['It is stored in the car', 'It is converted to more fuel', 'It is wasted as heat to the surroundings', 'It disappears completely'], 2,
    'About 65% of the energy from fuel is wasted as heat that escapes to the surroundings through the exhaust, radiator, and engine block. This is why car engines get hot during operation. The energy is not destroyed but is no longer useful for movement.'),
  fb(6, 'A coal power station wastes about ___% of the energy from burning coal as heat. An electric drill produces useful ___ energy but wastes energy as heat and sound.',
    ['50', 'kinetic'],
    'Coal power stations are only about 50% efficient — half the energy is lost as heat to the surroundings through cooling towers and exhaust gases. Electric drills convert electrical energy into kinetic (movement) energy, but friction causes heat and sound as wasted energy.'),
  t(7, '### Reducing Wasted Energy\n\nWhile we cannot eliminate wasted energy completely, we can reduce it:\n\n- Use **energy-efficient appliances** (e.g., LED light bulbs waste less energy as heat than old incandescent bulbs)\n- **Maintain machines** properly — well-oiled machines waste less energy through friction\n- **Insulate** hot water geysers and buildings to reduce heat loss\n- **Switch off** appliances when not in use\n- Use **renewable energy** sources where possible\n\n**Research activity:**\nResearch the wasted energy from different machines and appliances. For example:\n- A car wastes about 65% of its fuel energy as heat\n- A coal power station wastes about 50% of its energy as heat\n- An old incandescent light bulb wastes about 95% of its energy as heat (only 5% becomes light)\n- An LED light bulb wastes much less — about 20% as heat'),
  q(8, 'An old incandescent light bulb converts only about 5% of electrical energy into light. What happens to the other 95%?',
    ['It is stored in the bulb', 'It is converted to sound', 'It is wasted as heat', 'It powers other appliances'], 2,
    'Incandescent bulbs are very inefficient — about 95% of the electrical energy is wasted as heat, and only 5% is converted to useful light. This is why LED bulbs are preferred — they waste much less energy as heat and produce more light per unit of electricity.'),
  q(9, 'Heat is an example of "wasted" energy from a light bulb. But for which appliance is heat the USEFUL energy output?',
    ['A television', 'A heater', 'A radio', 'A computer'], 1,
    'For a heater, heat is the useful energy output — that is exactly what the heater is designed to produce. Whether energy is "useful" or "wasted" depends on the purpose of the device. For a light bulb, heat is wasted; for a heater, heat is useful.'),
  q(10, 'According to the law of conservation of energy, the wasted energy from a machine:',
    ['Is destroyed forever', 'Is converted to nothing', 'Still exists but is no longer useful — it escapes to the surroundings', 'Goes back into the fuel'], 2,
    'The law of conservation of energy states that energy cannot be destroyed. Wasted energy still exists — it has simply been transferred to the surroundings (usually as heat) where it is no longer concentrated enough to do useful work.'),
];

// =============================================================================
// CHAPTER 13: Relationship of the Sun to the Earth
//             (Term 4 — Planet Earth and Beyond)
// =============================================================================
blockNum = 0;
const ch13_lesson1 = [
  t(1, '## The Sun and the Earth\n\n### Solar Energy and the Earth\'s Seasons\n\nThe **Sun** radiates heat and light in all directions. The Earth receives energy from the Sun in the form of heat and light (**solar energy**).\n\n**Key facts:**\n- The Earth spins (rotates) on its **axis** once per day\n- The Earth\'s axis is an imaginary line that goes through the centre of the Earth from the North Pole to the South Pole\n- The Earth\'s axis is **not vertical** — it is tilted from the vertical by an angle of **23.5°**\n- The tilt of the Earth\'s axis does **not change** as the Earth orbits around the Sun\n\n### Why We Have Seasons\n\nDue to the tilt of the Earth\'s axis, the intensity of solar energy (amount per unit area) that reaches different parts of the Earth changes through the year.\n\n**Southern Hemisphere summer (December):**\n- The southern hemisphere is tilted **toward** the Sun\n- Solar energy falls more directly on the southern hemisphere\n- The energy is spread over a **smaller area** — more intense heating\n- Days are **longer** than nights\n\n**Southern Hemisphere winter (June):**\n- The southern hemisphere is tilted **away** from the Sun\n- Solar energy falls more obliquely (at an extreme angle)\n- The energy is spread over a **wider area** — less intense heating\n- Days are **shorter** than nights'),
  q(2, 'What causes the seasons on Earth?',
    ['The Earth moving closer to and further from the Sun', 'The tilt of the Earth\'s axis at 23.5°', 'The Moon blocking sunlight', 'Changes in the Sun\'s temperature'], 1,
    'Seasons are caused by the tilt of the Earth\'s axis (23.5°). As the Earth orbits the Sun, different hemispheres are tilted toward or away from the Sun, changing the intensity and duration of sunlight received. It is NOT caused by the Earth being closer to the Sun.'),
  fb(3, 'The Earth\'s axis is tilted at an angle of ___°. When the southern hemisphere is tilted toward the Sun, it is ___ in South Africa.',
    ['23.5', 'summer'],
    'The Earth\'s axis is tilted at 23.5° from the vertical. When the southern hemisphere tilts toward the Sun (around December), South Africa experiences summer because solar energy falls more directly and intensely on the region, and days are longer.'),
  t(4, '### Direct and Oblique Sunlight\n\nThe angle at which sunlight strikes the Earth\'s surface determines how much energy reaches each area:\n\n**Direct sunlight (summer):**\n- Falls almost straight down on the surface\n- Energy concentrated over a smaller area\n- More heating — warmer temperatures\n- Longer days provide more hours of sunlight\n\n**Oblique (angled) sunlight (winter):**\n- Falls at a steep angle on the surface\n- Energy spread over a larger area\n- Less heating — cooler temperatures\n- Shorter days provide fewer hours of sunlight\n\n**Investigation:**\nYou can investigate the effect of direct and indirect light on temperature by:\n1. Shining a torch directly onto a surface (direct light) — the circle of light is small and bright\n2. Shining the same torch at an angle (oblique light) — the circle of light is larger but dimmer\n3. Measure the temperature in each case — direct light produces higher temperatures'),
  q(5, 'During winter in South Africa, the Sun\'s rays hit the surface at a steep angle. What effect does this have?',
    ['The surface heats up more because the energy is concentrated', 'The surface heats up less because the energy is spread over a wider area', 'There is no effect on temperature', 'The surface receives more energy'], 1,
    'When sunlight hits at a steep (oblique) angle, the same amount of energy is spread over a larger area, making the heating less intense. This is why winters are cooler — the Sun\'s energy is less concentrated and days are shorter.'),
  t(6, '### Solar Energy and Life on Earth\n\n**Plants absorb sunlight:**\n- Plants absorb light from the Sun and produce energy-containing food through **photosynthesis**\n- All plants and animals depend on this process for their energy\n- The Sun\'s energy sustains all life on Earth\n\n### Stored Solar Energy — Fossil Fuels\n\nDead plants and animals can eventually form **coal, oil, or gas** (fossil fuels) after millions of years:\n\n1. Dead plants and animals are covered by layers of mud and soil\n2. The layers press down on the remains, increasing pressure\n3. More layers lead to increased pressure over long periods\n4. Over millions of years, the remains change into coal, oil, or gas\n\n**Important facts:**\n- Coal, oil, and gas store energy from the Sun that was absorbed by plants millions of years ago\n- Humans are using this stored energy faster than it is being formed — fossil fuels are **non-renewable**\n- Burning fossil fuels releases carbon dioxide, contributing to **climate change**'),
  q(7, 'How were fossil fuels like coal formed?',
    ['By volcanic eruptions', 'From dead plants and animals buried under pressure over millions of years', 'By mixing chemicals in the ocean', 'From melting glaciers'], 1,
    'Coal was formed from dead plants that were buried under layers of sediment millions of years ago. Over time, heat and pressure changed these remains into fossil fuels. The energy stored in coal originally came from the Sun, captured by plants through photosynthesis.'),
  fb(8, 'Coal, oil, and gas store energy from the ___ that was captured by plants through photosynthesis millions of years ago. These are called ___ fuels.',
    ['Sun', 'fossil'],
    'Fossil fuels are called "fossil" because they formed from the fossilised remains of ancient plants and animals. The energy stored in them was originally solar energy, captured by photosynthesis. Burning these fuels releases this stored energy — but also releases CO₂.'),
  q(9, 'Why are days longer in summer than in winter in South Africa?',
    ['Because the Earth moves faster in summer', 'Because the Sun is bigger in summer', 'Because the tilt of the Earth\'s axis means the southern hemisphere faces the Sun for more hours', 'Because clocks change in summer'], 2,
    'In summer, the southern hemisphere is tilted toward the Sun. This means the Sun appears to travel a longer arc across the sky, resulting in more hours of daylight. In winter, the tilt is away from the Sun, so the Sun\'s arc is shorter and days are shorter.'),
  q(10, 'A learner shines a torch directly onto a surface and then at an angle. The direct beam creates a small, bright circle. What does the angled beam create?',
    ['A smaller, brighter circle', 'A larger, dimmer circle', 'The same circle', 'No light at all'], 1,
    'When the torch is held at an angle, the same amount of light is spread over a larger area, creating a larger but dimmer circle. This demonstrates why oblique sunlight in winter heats the Earth less — the energy is spread over a wider area.'),
];

// =============================================================================
// CHAPTER 14: Relationship of the Moon to the Earth
//             (Term 4 — Planet Earth and Beyond)
// =============================================================================
blockNum = 0;
const ch14_lesson1 = [
  t(1, '## The Moon and the Earth\n\n### The Moon\'s Orbit\n\nThe **Moon** revolves (orbits) around the Earth. It takes approximately **27.3 days** for the Moon to complete one orbit.\n\n### Gravity\n\n**Gravity** is the tendency of all objects to attract (pull) each other.\n\n**Key facts about gravity:**\n- The pull of gravity depends on how much **mass** each object has and how **far apart** they are\n- More massive objects exert a stronger gravitational pull than smaller objects over the same distance\n- For objects of the same mass, the closer they are to each other, the stronger the pull of gravity between them\n\n**Gravity in the solar system:**\n- The Earth is held in its orbit around the Sun by the pull of the **Sun\'s gravity**\n- The Moon is held in its orbit around the Earth by the pull of the **Earth\'s gravity**\n- The Moon also has its own gravity — but it is weaker than Earth\'s because the Moon has less mass'),
  q(2, 'What force keeps the Moon in orbit around the Earth?',
    ['Magnetism', 'Static electricity', 'The Earth\'s gravity', 'Wind'], 2,
    'The Earth\'s gravity is the force that keeps the Moon in its orbit. Gravity is the attraction between all objects with mass. The Earth is much more massive than the Moon, so its gravitational pull keeps the Moon from flying off into space.'),
  fb(3, 'The Moon orbits the Earth approximately every ___ days. The force that holds the Moon in orbit is ___.',
    ['27', 'gravity'],
    'The Moon takes about 27.3 days to complete one orbit around the Earth. Gravity — the attractive force between objects with mass — is what holds the Moon in this orbit. The more massive an object, the stronger its gravitational pull.'),
  t(4, '### Tides\n\n**Tides** are the predictable, repeated rise and fall of sea and ocean levels.\n\n**What causes tides?**\n- Tides on Earth are caused mainly by the gravity of the **Moon**\n- The Moon\'s gravity pulls on the water in the seas and oceans on Earth\n- This pull causes the water to bulge outward toward the Moon\n\n**High and low tides:**\n- The side of the Earth closest to the Moon experiences a **high tide** (water is pulled toward the Moon)\n- The opposite side of the Earth also has a high tide (due to inertia and centripetal effects)\n- Between the two high tides are **low tides**\n- There are usually **two high tides** and **two low tides** every day (approximately every 24 hours)\n\n**Spring tides and neap tides:**\n- When the Moon is aligned with the Sun (at **Full Moon** and **New Moon**), the Sun\'s gravity adds to the Moon\'s gravity\n- This causes higher than usual high tides and lower than usual low tides — called **spring tides**\n- When the Moon and Sun are at right angles, their gravitational effects partially cancel, causing smaller tidal ranges — called **neap tides**'),
  q(5, 'What mainly causes tides on Earth?',
    ['Wind blowing across the ocean', 'The rotation of the Earth', 'The gravitational pull of the Moon', 'Earthquakes under the ocean'], 2,
    'Tides are caused mainly by the gravitational pull of the Moon on the Earth\'s oceans. The Moon\'s gravity pulls water toward it, creating a bulge (high tide) on the side of the Earth facing the Moon, and another bulge on the opposite side.'),
  fb(6, 'Spring tides occur when the Moon and Sun are ___ (at Full Moon and New Moon). There are usually ___ high tides per day.',
    ['aligned', 'two'],
    'Spring tides happen when the Sun, Moon, and Earth are in a line (at Full Moon and New Moon). The combined gravitational pull of the Sun and Moon creates extra-high and extra-low tides. Each day, coastal areas typically experience two high tides and two low tides.'),
  t(7, '### Tides and Shoreline Ecosystems\n\nTides sustain unique **shoreline ecosystems** between the high and low water levels. This area is called the **intertidal zone**.\n\n**An ecosystem** is a community of living organisms and their interaction with the environment.\n\n**The intertidal zone includes:**\n- Rock pools — small pools of water left behind when the tide goes out\n- Sandy beaches — where organisms burrow in the sand\n- Rocky shores — where organisms cling to rocks\n\n**Organisms adapted to the intertidal zone:**\n- **Mussels and barnacles** — attach firmly to rocks to withstand wave action\n- **Seaweed (kelp)** — flexible stems bend with waves instead of breaking\n- **Sea anemones** — close up when exposed to air at low tide\n- **Crabs** — hide under rocks and in pools\n\n**South African coastline:**\n- The South African coastline stretches for about 3 000 km\n- The west coast (Atlantic) has cold water from the Benguela Current\n- The east coast (Indian Ocean) has warm water from the Agulhas Current\n- Different organisms are found on each coast due to the temperature differences'),
  q(8, 'What is the intertidal zone?',
    ['The deepest part of the ocean', 'The area between the high and low tide marks', 'The middle of the ocean', 'The area above the high tide mark'], 1,
    'The intertidal zone is the area of the shoreline between the high tide mark and the low tide mark. It is alternately covered by water at high tide and exposed to air at low tide. Organisms living here must be adapted to survive both conditions.'),
  fb(9, 'The Moon\'s gravity causes ___ on Earth. Unique ecosystems exist in the ___ zone between the high and low tide marks.',
    ['tides', 'intertidal'],
    'The Moon\'s gravitational pull on Earth\'s oceans creates the tides — the regular rise and fall of sea levels. The intertidal zone, between high and low tide marks, is a unique habitat where organisms must survive both underwater and exposed conditions.'),
  q(10, 'At Full Moon and New Moon, spring tides occur with extra-high high tides. Why?',
    ['Because the Moon is closer to the Earth', 'Because the Sun and Moon\'s gravity combine when they are aligned', 'Because the wind is stronger during Full Moon', 'Because the Earth spins faster during Full Moon'], 1,
    'During Full Moon and New Moon, the Sun, Moon, and Earth are in a line (aligned). The gravitational pulls of the Sun and Moon act together in the same direction, creating larger tidal bulges — resulting in higher high tides and lower low tides (spring tides).'),
];

// =============================================================================
// DB INSERTION
// =============================================================================
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 7
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 7/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 7:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 7', schoolId: SCHOOL_ID, orderIndex: 7,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 7:', String(GRADE_ID));
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
    tags: ['natural-sciences', 'grade-7', 'caps'],
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
      title: 'Chapter 1: The Biosphere',
      description: 'The concept of the biosphere (lithosphere, hydrosphere, atmosphere), requirements for sustaining life, the seven life processes, adaptations to the environment, and growing seedlings.',
      order: 1,
      lessons: [
        { title: 'The Biosphere', description: 'What the biosphere is and its three components (lithosphere, hydrosphere, atmosphere), requirements for sustaining life (energy, gases, water, soil, temperature), the seven life processes, and adaptations of organisms to their environment.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Biodiversity',
      description: 'Classification of living things, the five Kingdoms, vertebrates and their five classes, invertebrates (arthropods and molluscs), diversity of plants (angiosperms, gymnosperms, monocots, dicots, ferns).',
      order: 2,
      lessons: [
        { title: 'Classification of Animals', description: 'Biodiversity, the five Kingdoms of life, classification system, vertebrates vs invertebrates, the five classes of vertebrates (fish, amphibians, reptiles, birds, mammals), arthropods (insects, arachnids, crustaceans), and molluscs.', blocks: ch2_lesson1, term: 1 },
        { title: 'Diversity of Plants', description: 'Plants with seeds (angiosperms and gymnosperms), monocotyledons and dicotyledons and their distinguishing features, plants without seeds (ferns and mosses), and South African plant examples.', blocks: ch2_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Sexual Reproduction',
      description: 'Sexual reproduction in angiosperms (flower parts, pollination, fertilisation, seed dispersal), human reproduction (puberty, male and female reproductive systems, fertilisation, menstruation, contraception, HIV/AIDS).',
      order: 3,
      lessons: [
        { title: 'Sexual Reproduction in Angiosperms', description: 'Parts of a flower (stamens, stigma, style, ovary, petals, sepals), pollination by wind, insects, and birds, fertilisation and pollen tube growth, seed and fruit formation, and methods of seed dispersal.', blocks: ch3_lesson1, term: 1 },
        { title: 'Human Reproduction', description: 'Puberty and physical changes, male and female reproductive systems, fertilisation, pregnancy and implantation, menstruation, contraception including condoms, prevention of STIs and HIV/AIDS, and responsible decision-making.', blocks: ch3_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Variation',
      description: 'Species, variation within a species, inherited characteristics, continuous and discontinuous variation, collecting and presenting data on variation.',
      order: 4,
      lessons: [
        { title: 'Variation Within a Species', description: 'What a species is, variation between individuals, inherited characteristics (height, eye colour, tongue-rolling), continuous vs discontinuous variation, importance of variation for survival, and collecting data on class variation.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Introduction to the Periodic Table of Elements',
      description: 'The Periodic Table, Dmitri Mendeleev, metals, non-metals, and semi-metals, properties of each category, element names and symbols, the first 20 elements.',
      order: 5,
      lessons: [
        { title: 'The Periodic Table and Element Properties', description: 'What the Periodic Table is, Dmitri Mendeleev, arrangement of elements (metals, non-metals, semi-metals), properties of each group, element names, symbols, and atomic numbers, and important elements and their symbols.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Properties of Materials',
      description: 'Physical properties of materials (boiling point, melting point, conductivity), heat and electrical conductivity, conductors and insulators, impact on the environment.',
      order: 6,
      lessons: [
        { title: 'Properties of Materials', description: 'Properties that determine material suitability (boiling point, conductivity, strength), heat conductors and insulators, electrical conductors and insulators, investigating heat conduction, and environmental impact of material production.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Separating Mixtures',
      description: 'What a mixture is, methods of physical separation (hand sorting, sieving, filtration, magnetism, evaporation, distillation, chromatography), and sorting and recycling materials.',
      order: 7,
      lessons: [
        { title: 'Mixtures and Separation Methods', description: 'What a mixture is, methods of separation (hand sorting, sieving, filtration, magnetism, evaporation, distillation, chromatography), practical applications, sorting and recycling, and consequences of poor waste management.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Acids, Bases, and Neutrals',
      description: 'Tastes of substances, properties of acids, bases, and neutrals, acid-base indicators (litmus paper), and classifying common household substances.',
      order: 8,
      lessons: [
        { title: 'Acids, Bases, and Neutrals', description: 'Properties of acids (sour, corrosive), properties of bases (bitter, slippery, alkalis), neutrals, litmus paper as an indicator, testing beverages and household substances, and classifying substances as acid, base, or neutral.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: Sources of Energy',
      description: 'Non-renewable energy sources (coal, oil, gas, nuclear), renewable energy sources (solar, wind, hydro), advantages and disadvantages, energy in food, and South Africa\'s energy context.',
      order: 9,
      lessons: [
        { title: 'Renewable and Non-Renewable Energy', description: 'What energy is, non-renewable energy sources (fossil fuels, nuclear), renewable energy sources (solar, wind, hydro, biofuel), advantages and disadvantages, South Africa\'s energy context (Koeberg, solar farms), and energy in food.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Potential and Kinetic Energy',
      description: 'Potential energy (stored energy), kinetic energy (energy of motion), energy conversion between potential and kinetic, the law of conservation of energy, and energy in mechanical, thermal, electrical, and biological systems.',
      order: 10,
      lessons: [
        { title: 'Potential and Kinetic Energy', description: 'What potential energy is (stored energy in rubber bands, batteries, food), what kinetic energy is (energy of motion), energy conversion in different systems (mechanical, thermal, electrical, biological), and the law of conservation of energy.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: Heat Transfer',
      description: 'Conduction (heat through solids in contact), convection (heat through fluids), radiation (heat through empty space), absorption and reflection of heat, insulation and energy saving, and the thermal lunchbox challenge.',
      order: 11,
      lessons: [
        { title: 'Conduction, Convection, and Radiation', description: 'Heat transfer from hot to cold, conduction in solids, convection currents in liquids and gases, radiation through empty space, dark vs shiny surfaces and radiant heat, and everyday examples of all three methods.', blocks: ch11_lesson1, term: 3 },
        { title: 'Insulation and Energy Saving', description: 'Insulating materials and how they slow heat transfer, energy saving in homes (ceiling insulation, geyser blankets), indigenous knowledge (rondavels), the thermal lunchbox challenge, and scientific investigation methods (variables, fair testing).', blocks: ch11_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Energy Transfer to Surroundings',
      description: 'Useful and wasted energy in systems, input vs output energy, examples of wasted energy (cars, power stations, light bulbs), and strategies for reducing energy waste.',
      order: 12,
      lessons: [
        { title: 'Useful and Wasted Energy', description: 'Useful energy outputs vs wasted energy, why output is always less than input, examples of energy waste in cars, power stations, light bulbs, and drills, the law of conservation of energy, and reducing energy waste.', blocks: ch12_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 13: Relationship of the Sun to the Earth',
      description: 'Solar energy and the Earth, the tilted axis (23.5°), why we have seasons, direct and oblique sunlight, day length, solar energy and life on Earth, and the formation of fossil fuels.',
      order: 13,
      lessons: [
        { title: 'The Sun, Seasons, and Solar Energy', description: 'Solar energy and the Earth, the Earth\'s tilted axis (23.5°), why the southern hemisphere has seasons, direct vs oblique sunlight, day length in summer and winter, solar energy and photosynthesis, and the formation of fossil fuels from stored solar energy.', blocks: ch13_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 14: Relationship of the Moon to the Earth',
      description: 'The Moon\'s orbit, gravity and what causes it, tides (high, low, spring, neap), the intertidal zone, shoreline ecosystems, and the South African coastline.',
      order: 14,
      lessons: [
        { title: 'The Moon, Gravity, and Tides', description: 'The Moon\'s orbit around the Earth, gravity and mass, how the Moon\'s gravity causes tides, high and low tides, spring tides and neap tides, the intertidal zone, shoreline ecosystems, and the South African coastline.', blocks: ch14_lesson1, term: 4 },
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
    title: 'Grade 7 Natural Sciences \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Life and Living (the biosphere, biodiversity, classification, sexual reproduction in angiosperms, human reproduction, variation), Matter and Materials (periodic table, properties of materials, separating mixtures, acids, bases, and neutrals), Energy and Change (sources of energy, potential and kinetic energy, heat transfer, insulation, wasted energy), and Planet Earth and Beyond (relationship of the Sun to the Earth, seasons, the Moon, gravity, and tides) for the Grade 7 Natural Sciences curriculum.',
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
  console.log('  TEXTBOOK: Grade 7 Natural Sciences');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
