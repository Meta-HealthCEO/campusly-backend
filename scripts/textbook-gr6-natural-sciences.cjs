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
// CHAPTER 1: Photosynthesis (Term 1 — Life and Living)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Photosynthesis\n\n### How Do Plants Make Food?\n\nPlants are **producers** — they make their own food through a process called **photosynthesis**. Unlike animals, plants do not eat other organisms. Instead, they use sunlight, water, and carbon dioxide to produce food.\n\n### What Plants Need for Photosynthesis\n\nFor photosynthesis to take place, a plant needs:\n\n- **Sunlight** — provides the energy to drive the process\n- **Water** — absorbed from the soil through the roots\n- **Carbon dioxide** — a gas taken in from the air through tiny holes in the leaves called **stomata**\n- **Chlorophyll** — the green pigment found in **chloroplasts** inside leaf cells. Chlorophyll traps light energy from the sun.\n\n### The Photosynthesis Equation\n\nThe word equation for photosynthesis is:\n\n$$\\text{carbon dioxide} + \\text{water} \\xrightarrow{\\text{sunlight, chlorophyll}} \\text{glucose} + \\text{oxygen}$$\n\nPlants use the glucose (a sugar) as food for energy and growth. Oxygen is released into the air as a by-product — this is the oxygen that animals and humans breathe.'),
  q(2, 'What is the green pigment in plant leaves that traps sunlight?',
    ['Glucose', 'Stomata', 'Chlorophyll', 'Carbon dioxide'], 2,
    'Chlorophyll is the green pigment found in chloroplasts inside leaf cells. It absorbs light energy from the sun, which is needed to drive the chemical reactions of photosynthesis.'),
  t(3, '### Where Does Photosynthesis Happen?\n\nPhotosynthesis mainly takes place in the **leaves** of a plant. Leaves are designed to capture as much sunlight as possible:\n\n- **Broad, flat shape** — large surface area to absorb sunlight\n- **Thin structure** — so gases can reach cells quickly\n- **Green colour** — due to chlorophyll in the chloroplasts\n- **Stomata** — tiny pores on the underside of leaves that let carbon dioxide in and oxygen out\n\nIn South Africa, plants like the **spekboomveld** (Portulacaria afra) in the Eastern Cape are excellent at photosynthesis. Spekboom absorbs large amounts of carbon dioxide and is sometimes called a "carbon sponge." Planting spekboom helps fight climate change.\n\n### Why Is Photosynthesis Important?\n\n1. **Food production** — photosynthesis is the starting point of almost all food chains. Plants make food that is eaten by herbivores, which are eaten by carnivores.\n2. **Oxygen production** — the oxygen we breathe is produced during photosynthesis.\n3. **Carbon dioxide removal** — plants remove carbon dioxide from the atmosphere, helping to reduce greenhouse gases.'),
  fb(4, 'During photosynthesis, plants use sunlight, water, and ___ to produce glucose and ___.',
    ['carbon dioxide', 'oxygen'],
    'Plants absorb carbon dioxide from the air through their stomata and combine it with water using light energy. The products are glucose (food for the plant) and oxygen (released into the air for animals to breathe).'),
  q(5, 'Which part of a plant cell contains chlorophyll?',
    ['Nucleus', 'Cell wall', 'Chloroplast', 'Vacuole'], 2,
    'Chloroplasts are the organelles inside plant cells that contain chlorophyll. They are the site where photosynthesis takes place. Chloroplasts are found mainly in the cells of leaves, which is why leaves are green.'),
  t(6, '### Investigating Photosynthesis\n\nYou can investigate whether light is needed for photosynthesis by covering part of a leaf with foil for a few days. When the leaf is tested with iodine solution:\n\n- The **uncovered part** turns blue-black (starch is present — glucose was converted to starch)\n- The **covered part** stays brown (no starch — photosynthesis did not happen without light)\n\nThis shows that light is essential for photosynthesis.\n\n### The Link to Food Chains\n\nBecause plants make their own food, they are called **producers**. They form the base of every food chain. For example, in the South African grassland:\n\n1. **Grass** (producer) makes food through photosynthesis\n2. **Springbok** (primary consumer/herbivore) eats the grass\n3. **Cheetah** (secondary consumer/carnivore) hunts the springbok\n\nWithout photosynthesis, there would be no food for any living thing on Earth.'),
  q(7, 'What happens when iodine is added to a leaf that has been photosynthesising?',
    ['It turns red', 'It turns blue-black', 'It stays clear', 'It turns green'], 1,
    'Iodine solution turns blue-black in the presence of starch. During photosynthesis, glucose is produced and then stored as starch in the leaf. The blue-black colour confirms that photosynthesis has taken place.'),
  fb(8, 'Plants are called ___ because they make their own food. The tiny holes on the underside of leaves that allow gases in and out are called ___.',
    ['producers', 'stomata'],
    'Producers are organisms that can make their own food — plants do this through photosynthesis. Stomata are the tiny pores (openings) on the leaf surface that allow carbon dioxide to enter and oxygen to exit.'),
  q(9, 'Why is the spekboom plant in the Eastern Cape important for fighting climate change?',
    ['It grows very fast', 'It absorbs large amounts of carbon dioxide', 'It produces fruit', 'It lives in deserts'], 1,
    'Spekboom (Portulacaria afra) is remarkably efficient at absorbing carbon dioxide from the atmosphere through photosynthesis. It can absorb up to 10 times more CO₂ per hectare than a typical forest, making it a powerful tool against climate change.'),
  t(10, '### Summary\n\n- **Photosynthesis** is the process by which plants make food (glucose) using sunlight, water, and carbon dioxide.\n- **Chlorophyll** in the chloroplasts traps sunlight energy.\n- The products of photosynthesis are **glucose** and **oxygen**.\n- Photosynthesis takes place mainly in the **leaves**.\n- Plants are **producers** — the starting point of all food chains.\n- Without photosynthesis, there would be no food or oxygen for life on Earth.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Nutrients in Food (Term 1 — Life and Living)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Nutrients in Food\n\n### What Are Nutrients?\n\n**Nutrients** are substances in food that our bodies need to stay healthy, grow, and have energy. There are seven types of nutrients:\n\n| Nutrient | Function | Food Sources |\n|----------|----------|-------------|\n| **Carbohydrates** | Provide energy | Bread, pap, rice, potatoes, sugar |\n| **Proteins** | Build and repair body tissues | Meat, fish, eggs, beans, lentils |\n| **Fats** | Store energy, insulate body, protect organs | Butter, oil, nuts, avocado |\n| **Vitamins** | Keep body processes working properly | Fruits, vegetables |\n| **Minerals** | Build strong bones and teeth, help body functions | Milk (calcium), spinach (iron) |\n| **Water** | Needed for all body processes | Drinking water, fruits, soups |\n| **Fibre** | Helps digestion, prevents constipation | Whole grains, vegetables, fruit |\n\n### Energy-Giving vs Body-Building vs Protective Nutrients\n\n- **Energy-giving:** carbohydrates and fats\n- **Body-building:** proteins\n- **Protective:** vitamins and minerals'),
  q(2, 'Which nutrient group is responsible for building and repairing body tissues?',
    ['Carbohydrates', 'Fats', 'Proteins', 'Vitamins'], 2,
    'Proteins are the body-building nutrients. They are needed for growth, and for repairing damaged tissues such as muscles and skin. Good sources include meat, fish, eggs, beans, and lentils.'),
  fb(3, 'Carbohydrates and fats are ___ nutrients, while proteins are ___ nutrients.',
    ['energy-giving', 'body-building'],
    'Carbohydrates are the main source of energy, and fats store extra energy. Proteins are body-building nutrients used for growth and repair. Vitamins and minerals are protective nutrients that keep body processes working properly.'),
  t(4, '### A Balanced Diet\n\nA **balanced diet** contains the right amounts of all seven nutrients. No single food contains all the nutrients, so we need to eat a variety of foods every day.\n\nIn South Africa, a common balanced meal might include:\n- **Pap** (carbohydrates for energy)\n- **Stewed meat or beans** (protein for growth)\n- **Spinach or morogo** (vitamins and minerals)\n- **A glass of water or amasi** (water and calcium)\n\n### Reading Food Labels\n\nFood labels on packaged food tell us what nutrients the food contains. They list:\n- **Energy** (in kilojoules, kJ)\n- **Protein, carbohydrates, fat, fibre** (in grams)\n- **Sodium** (salt content)\n- **Ingredients** (listed in order from most to least)\n\nLearning to read food labels helps us make healthy choices. For example, foods high in sugar or salt should be eaten in small amounts.\n\n### Malnutrition in South Africa\n\n**Malnutrition** means poor nutrition — either too little food (undernutrition) or too much unhealthy food (overnutrition). In South Africa:\n\n- Some children suffer from **kwashiorkor** (lack of protein) — symptoms include swollen belly and thin limbs\n- Some children suffer from **marasmus** (lack of all nutrients) — extreme thinness\n- Others suffer from **obesity** due to eating too much sugar and fat'),
  q(5, 'What does a food label tell you about a product?',
    ['Only the price', 'The nutrients it contains, energy value, and ingredients', 'Only the expiry date', 'Where it was made'], 1,
    'Food labels provide important nutritional information including energy (kJ), amounts of protein, carbohydrates, fat, fibre, and sodium, as well as a list of ingredients in order from most to least.'),
  q(6, 'Kwashiorkor is caused by a severe lack of which nutrient?',
    ['Carbohydrates', 'Vitamins', 'Protein', 'Water'], 2,
    'Kwashiorkor is a form of severe malnutrition caused by a lack of protein in the diet. Symptoms include a swollen belly, thin arms and legs, skin problems, and listlessness. It is still found in some parts of South Africa.'),
  fb(7, 'A ___ diet contains the right amounts of all seven nutrients. ___ means poor nutrition, which can be caused by eating too little or too much unhealthy food.',
    ['balanced', 'Malnutrition'],
    'A balanced diet ensures the body gets all the nutrients it needs in the correct proportions. Malnutrition is a broad term covering both undernutrition (not enough food) and overnutrition (too much unhealthy food).'),
  t(8, '### Vitamins and Minerals\n\nSome important vitamins and minerals include:\n\n| Nutrient | Function | Deficiency Disease | Food Sources |\n|----------|----------|-------------------|-------------|\n| Vitamin A | Healthy eyes and skin | Night blindness | Carrots, sweet potato, liver |\n| Vitamin C | Healthy gums, helps fight infection | Scurvy | Oranges, guavas, peppers |\n| Vitamin D | Strong bones, absorbs calcium | Rickets | Sunlight, eggs, fish |\n| Iron | Makes haemoglobin in blood | Anaemia | Red meat, spinach, lentils |\n| Calcium | Strong bones and teeth | Weak bones | Milk, cheese, amasi |\n\nIn South Africa, the government adds vitamins and minerals to staple foods like bread and maize meal. This is called **food fortification** and helps prevent deficiency diseases.'),
  q(9, 'Which vitamin deficiency causes scurvy?',
    ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D'], 2,
    'Scurvy is caused by a deficiency of Vitamin C (ascorbic acid). Symptoms include bleeding gums, loose teeth, and slow wound healing. Foods rich in Vitamin C include oranges, guavas, and peppers.'),
  t(10, '### Summary\n\n- There are seven types of nutrients: carbohydrates, proteins, fats, vitamins, minerals, water, and fibre.\n- Carbohydrates and fats give energy; proteins build and repair; vitamins and minerals protect.\n- A balanced diet includes the right amounts of all nutrients.\n- Food labels help us make healthy food choices.\n- Malnutrition (both undernutrition and overnutrition) is a problem in South Africa.\n- Food fortification adds nutrients to staple foods like bread and maize meal.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Food Processing (Term 1 — Technology)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Food Processing\n\n### Why Do We Process Food?\n\nFood processing is any method used to change raw food into something that can be eaten, stored, or transported safely. We process food to:\n\n- **Preserve it** — make it last longer before it spoils\n- **Make it safe** — kill harmful bacteria and germs\n- **Make it convenient** — ready to eat or easy to prepare\n- **Improve taste or texture** — make food more enjoyable\n\n### What Causes Food to Spoil?\n\nFood spoils because of **microorganisms** (tiny living things like bacteria, moulds, and yeasts). These microorganisms:\n\n- Need moisture, warmth, and food to grow\n- Break down food, making it smell bad, change colour, or become slimy\n- Can make people sick if spoiled food is eaten\n\nFood processing methods work by removing one or more of the conditions that microorganisms need to grow.'),
  q(2, 'Why do we process food?',
    ['To make it more expensive', 'To preserve it, make it safe, and make it convenient', 'To change its colour only', 'To remove all nutrients'], 1,
    'Food is processed to preserve it (make it last longer), make it safe (kill harmful bacteria), make it convenient (easy to prepare), and sometimes to improve taste or texture.'),
  t(3, '### Methods of Food Processing\n\n**Drying:**\n- Removes moisture so microorganisms cannot grow\n- Examples: biltong (dried meat — a South African favourite), dried fruit, dried beans, mopane worms\n- Sun-drying is a traditional method used across Southern Africa\n\n**Salting:**\n- Salt draws water out of food and kills bacteria\n- Examples: salted fish, salted meat\n\n**Smoking:**\n- Smoke contains chemicals that slow bacterial growth\n- Examples: smoked snoek (a Cape tradition), smoked chicken\n\n**Canning:**\n- Food is sealed in airtight cans and heated to kill bacteria\n- Examples: canned pilchards, canned beans, canned peaches\n- The food can last for years without refrigeration\n\n**Freezing:**\n- Very low temperatures slow down bacterial growth\n- Examples: frozen vegetables, frozen fish, ice cream\n- Food must stay frozen until it is used\n\n**Pasteurisation:**\n- Liquid food (especially milk) is heated to about 72°C for 15 seconds, then quickly cooled\n- This kills most harmful bacteria without changing the taste much\n- Named after Louis Pasteur, the French scientist who developed the process'),
  fb(4, 'Biltong is a South African food preserved by ___. Milk is made safe by heating it to about 72°C in a process called ___.',
    ['drying', 'pasteurisation'],
    'Drying removes moisture from meat, preventing bacterial growth — this is how biltong is made. Pasteurisation heats milk to 72°C for 15 seconds to kill harmful bacteria, then rapidly cools it.'),
  q(5, 'At approximately what temperature is milk pasteurised?',
    ['100°C', '72°C', '50°C', '0°C'], 1,
    'Milk is pasteurised by heating it to approximately 72°C for 15 seconds, then rapidly cooling it. This temperature is high enough to kill most harmful bacteria but not so high that it significantly changes the taste of the milk.'),
  t(6, '### Food Packaging\n\nPackaging protects processed food from contamination, damage, and spoilage. Good packaging should:\n\n- **Protect** the food from air, moisture, and germs\n- **Inform** the consumer (food labels, ingredients, expiry date)\n- **Be practical** — easy to open, carry, and store\n- **Be environmentally friendly** — recyclable or biodegradable where possible\n\nCommon packaging materials include:\n\n| Material | Examples | Advantages | Disadvantages |\n|----------|----------|-----------|---------------|\n| Plastic | Bags, bottles, containers | Light, cheap, waterproof | Not biodegradable, pollutes oceans |\n| Glass | Bottles, jars | Reusable, recyclable, airtight | Heavy, breakable |\n| Metal | Cans, foil | Strong, airtight, long-lasting | Uses energy to produce |\n| Paper/cardboard | Boxes, cartons | Recyclable, biodegradable | Not waterproof |\n\nIn South Africa, plastic pollution is a serious problem. Many communities are working to reduce plastic use and recycle more.'),
  q(7, 'Which packaging material is the most environmentally friendly because it is both recyclable and biodegradable?',
    ['Plastic', 'Glass', 'Metal', 'Paper/cardboard'], 3,
    'Paper and cardboard are both recyclable and biodegradable, meaning they break down naturally in the environment. Plastic is a major environmental concern because it takes hundreds of years to break down and pollutes land and oceans.'),
  fb(8, 'Food packaging should protect the food, ___ the consumer with labels, and be practical. ___ pollution is a serious environmental problem in South Africa.',
    ['inform', 'Plastic'],
    'Good packaging must inform consumers about the contents, ingredients, nutritional value, and expiry date. Plastic pollution is a major environmental issue in SA, with plastic waste polluting rivers, oceans, and communities.'),
  q(9, 'Which food processing method works by sealing food in airtight containers and heating them to kill bacteria?',
    ['Drying', 'Freezing', 'Canning', 'Salting'], 2,
    'Canning involves sealing food in airtight cans or jars and then heating them to a high temperature to kill all bacteria inside. Because the container is sealed, no new bacteria can enter, so the food can last for years.'),
  t(10, '### Summary\n\n- Food is processed to preserve it, make it safe, convenient, and tasty.\n- Microorganisms cause food to spoil — they need moisture, warmth, and food.\n- Processing methods include drying, salting, smoking, canning, freezing, and pasteurisation.\n- Each method works by removing conditions that microorganisms need.\n- Packaging protects food and informs consumers.\n- Environmentally friendly packaging (recyclable, biodegradable) is important to reduce pollution.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Ecosystems (Term 2 — Life and Living)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Ecosystems\n\n### What Is an Ecosystem?\n\nAn **ecosystem** is a community of living organisms (plants, animals, microorganisms) together with their non-living environment (water, soil, air, sunlight, temperature). The living and non-living parts interact with and depend on each other.\n\n**Living (biotic) factors:** plants, animals, bacteria, fungi\n**Non-living (abiotic) factors:** water, sunlight, temperature, soil, air, rocks\n\n### Habitats\n\nA **habitat** is the place where an organism lives. It provides food, water, shelter, and space. Examples of habitats include:\n\n- A rock pool on the South African coast\n- The fynbos in the Western Cape\n- A pond or dam in the Free State\n- The Kruger National Park savanna\n\nDifferent organisms are adapted to different habitats. A fish cannot survive on land, and a springbok cannot survive in the ocean.\n\n### South African Biomes\n\nSouth Africa has several major **biomes** (large ecosystem types):\n\n- **Fynbos** — found in the Western Cape; unique shrubs, proteas, ericas; fire-adapted\n- **Grassland** — Highveld (Gauteng, Free State); grasses, few trees; home to springbok and wildebeest\n- **Savanna** — Lowveld (Kruger Park area); mix of grasses and scattered trees; home to the Big Five\n- **Karoo** — dry, semi-desert; succulents, hardy shrubs; tortoises and meerkats\n- **Forest** — small patches in Knysna and Tsitsikamma; tall trees, shade-loving plants'),
  q(2, 'What is the difference between biotic and abiotic factors in an ecosystem?',
    ['Biotic means water, abiotic means air', 'Biotic means living things, abiotic means non-living things', 'Biotic means large, abiotic means small', 'There is no difference'], 1,
    'Biotic factors are the living components of an ecosystem — plants, animals, bacteria, and fungi. Abiotic factors are the non-living components — water, sunlight, temperature, soil, air, and rocks. Both interact to form a functioning ecosystem.'),
  fb(3, 'An ecosystem consists of ___ (living) and abiotic (non-living) factors interacting together. A ___ is the place where an organism lives.',
    ['biotic', 'habitat'],
    'Biotic factors include all living things in the ecosystem. A habitat provides everything an organism needs to survive — food, water, shelter, and space. Different organisms are suited to different habitats.'),
  t(4, '### Food Chains\n\nA **food chain** shows how energy is passed from one organism to another through feeding. Every food chain starts with a **producer** (a plant that makes food through photosynthesis).\n\nHere is a food chain from the South African savanna:\n\n**Grass → Impala → Wild dog → Vulture (decomposer)**\n\n- **Producer:** Grass (makes food using sunlight)\n- **Primary consumer (herbivore):** Impala (eats the grass)\n- **Secondary consumer (carnivore):** Wild dog (hunts the impala)\n- **Decomposer:** Vulture and bacteria (break down dead organisms)\n\nThe **arrows** show the direction of energy flow — from the organism being eaten to the organism eating it.\n\n### Producers, Consumers, and Decomposers\n\n- **Producers** — make their own food (plants, algae)\n- **Primary consumers** — herbivores that eat producers (impala, grasshopper, zebra)\n- **Secondary consumers** — carnivores that eat herbivores (lion, eagle, wild dog)\n- **Tertiary consumers** — top predators that eat other carnivores (eagle eating a snake)\n- **Decomposers** — break down dead organisms and return nutrients to the soil (bacteria, fungi, earthworms)'),
  q(5, 'In a food chain, what do the arrows represent?',
    ['The direction the animal moves', 'The direction of energy flow', 'The size of the organism', 'The speed of the organism'], 1,
    'In a food chain, arrows point from the organism being eaten to the organism that eats it. This shows the direction in which energy flows — from producers to primary consumers to secondary consumers and so on.'),
  q(6, 'Which of the following is a primary consumer in the South African savanna?',
    ['Lion', 'Grass', 'Impala', 'Eagle'], 2,
    'An impala is a primary consumer (herbivore) because it eats grass (the producer). Lions and eagles are secondary or tertiary consumers because they eat other animals. Grass is the producer.'),
  fb(7, 'Every food chain starts with a ___. Organisms that break down dead matter and return nutrients to the soil are called ___.',
    ['producer', 'decomposers'],
    'Producers (plants) are always at the start of a food chain because they make their own food using sunlight. Decomposers such as bacteria, fungi, and earthworms break down dead organisms and recycle nutrients back into the soil.'),
  q(8, 'Which South African biome is home to proteas and ericas and is adapted to fire?',
    ['Savanna', 'Grassland', 'Fynbos', 'Karoo'], 2,
    'The fynbos biome in the Western Cape is home to proteas, ericas, and restios. Many fynbos plants are adapted to periodic fires — some seeds only germinate after fire, and some plants resprout from underground roots after burning.'),
  t(9, '### Summary\n\n- An ecosystem includes living (biotic) and non-living (abiotic) factors.\n- A habitat is where an organism lives.\n- South Africa has many biomes: fynbos, grassland, savanna, Karoo, and forest.\n- A food chain shows the flow of energy from producers to consumers to decomposers.\n- Producers make food, consumers eat other organisms, decomposers break down dead matter.'),
];

blockNum = 0;
const ch4_lesson2 = [
  t(1, '## Food Webs and Ecosystem Balance\n\n### What Is a Food Web?\n\nIn real ecosystems, animals do not eat just one type of food. A **food web** shows how many food chains are linked together in an ecosystem. It gives a more complete picture of feeding relationships.\n\nFor example, in the Kruger National Park:\n\n- Grass is eaten by impala, zebra, and wildebeest\n- Impala are eaten by wild dogs, leopards, and cheetahs\n- Zebra are eaten by lions and crocodiles\n- Insects eat grass and are eaten by frogs\n- Frogs are eaten by snakes\n- Snakes are eaten by eagles\n\nAll these food chains overlap and connect to form a food web.\n\n### Why Are Food Webs Important?\n\nFood webs show us that if one organism is removed, it affects many others. For example:\n\n- If all the grass dies (due to drought), the impala, zebra, and wildebeest have no food\n- The predators that eat them (lions, cheetahs) would also suffer\n- The decomposers would have less dead matter to break down\n\nThis is called **ecosystem balance** — all parts depend on each other.'),
  q(2, 'How is a food web different from a food chain?',
    ['A food web is shorter', 'A food web shows many interconnected food chains', 'A food web only includes producers', 'There is no difference'], 1,
    'A food web shows many interconnected food chains within an ecosystem. While a food chain shows a single pathway of energy flow, a food web shows the complex network of feeding relationships between all organisms.'),
  t(3, '### Changes in Ecosystems\n\nEcosystems can be changed by natural events and human activities:\n\n**Natural changes:**\n- Drought — less water for plants and animals\n- Fires — destroy vegetation but can help some plants regenerate\n- Floods — wash away soil and change habitats\n- Disease — can reduce populations\n\n**Human-caused changes:**\n- **Habitat destruction** — clearing land for farming, building, mining\n- **Pollution** — chemicals, plastic, and waste contaminating water and soil\n- **Overgrazing** — too many livestock on too little land\n- **Poaching** — illegal hunting of animals like rhinos and elephants\n- **Invasive species** — alien plants like Port Jackson willow and lantana taking over from indigenous plants\n\n### Conservation in South Africa\n\nSouth Africa protects ecosystems through:\n- **National parks** (Kruger, Table Mountain, Addo Elephant)\n- **Marine protected areas** along the coast\n- **Working for Water programme** — removes invasive alien plants\n- **Anti-poaching units** — protect rhinos and elephants\n- **Community conservation projects** — local communities help manage resources'),
  fb(4, 'A food ___ shows many interconnected food chains in an ecosystem. Removing one organism affects many others because of ecosystem ___.',
    ['web', 'balance'],
    'A food web illustrates the complex feeding relationships in an ecosystem. Ecosystem balance means all living things depend on each other — removing one species can cause a chain reaction affecting many others.'),
  q(5, 'Which of the following is an example of an invasive alien plant in South Africa?',
    ['Protea', 'Spekboom', 'Port Jackson willow', 'Yellowwood'], 2,
    'Port Jackson willow (Acacia saligna) is an invasive alien plant from Australia that has spread across many parts of South Africa, particularly in the Western Cape. It outcompetes indigenous plants for water and space.'),
  t(6, '### The Role of Decomposers\n\nDecomposers play a vital role in ecosystems:\n\n1. They break down dead plants and animals\n2. They release nutrients back into the soil\n3. These nutrients are absorbed by plants through their roots\n4. The plants use these nutrients to grow\n5. The cycle continues\n\nWithout decomposers, dead matter would pile up and nutrients would not be recycled. Common decomposers include:\n- **Bacteria** — microscopic organisms that break down organic matter\n- **Fungi** — mushrooms and moulds that grow on decaying matter\n- **Earthworms** — eat soil and dead plant material, their droppings enrich the soil\n- **Dung beetles** — particularly important in the South African savanna, they bury and break down animal dung'),
  q(7, 'Why are decomposers important in an ecosystem?',
    ['They provide shade', 'They recycle nutrients back into the soil', 'They produce oxygen', 'They control the weather'], 1,
    'Decomposers break down dead organisms and waste material, releasing nutrients back into the soil. Plants then absorb these nutrients to grow. Without decomposers, nutrients would be locked up in dead matter and the ecosystem would collapse.'),
  fb(8, 'The South African government protects ecosystems through ___ parks and the Working for ___ programme that removes invasive alien plants.',
    ['national', 'Water'],
    'National parks like Kruger, Table Mountain, and Addo Elephant protect ecosystems and wildlife. The Working for Water programme removes invasive alien plants that use excessive water and threaten indigenous biodiversity.'),
  q(9, 'What would most likely happen if all the herbivores were removed from a food web?',
    ['Nothing would change', 'Plants would increase but predators would decrease', 'Only decomposers would be affected', 'More rain would fall'], 1,
    'If herbivores were removed, plants would grow unchecked because nothing is eating them. Meanwhile, predators (carnivores) would have no prey and their populations would decline. This shows how all parts of a food web are interconnected.'),
  t(10, '### Summary\n\n- A food web shows many interconnected food chains.\n- Removing one organism from a food web affects many others.\n- Ecosystems can be changed by natural events (drought, fire) and human activities (habitat destruction, pollution, poaching).\n- Decomposers recycle nutrients by breaking down dead matter.\n- South Africa protects ecosystems through national parks, marine protected areas, and conservation programmes.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Solids, Liquids, and Gases (Term 2 — Matter and Materials)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Solids, Liquids, and Gases\n\n### The Three States of Matter\n\nAll matter (everything around us) exists in one of three states: **solid**, **liquid**, or **gas**.\n\n| Property | Solid | Liquid | Gas |\n|----------|-------|--------|-----|\n| Shape | Fixed shape | Takes shape of container | Fills entire container |\n| Volume | Fixed volume | Fixed volume | No fixed volume |\n| Particles | Tightly packed, vibrate in place | Close together, slide over each other | Far apart, move freely |\n| Compressibility | Cannot be compressed | Cannot be compressed easily | Can be compressed |\n| Examples | Ice, rock, wood, iron | Water, juice, petrol, milk | Air, steam, oxygen, carbon dioxide |\n\n### Particle Model of Matter\n\nAll matter is made up of tiny **particles** (atoms or molecules). The state of matter depends on:\n- How much **energy** the particles have\n- How **close together** the particles are\n- How **strongly** they are attracted to each other\n\nIn a **solid**, particles are packed tightly in a fixed arrangement and vibrate in place.\nIn a **liquid**, particles are close together but can slide over each other, so liquids flow.\nIn a **gas**, particles are far apart and move quickly in all directions.'),
  q(2, 'Which state of matter has particles that are far apart and move freely in all directions?',
    ['Solid', 'Liquid', 'Gas', 'Plasma'], 2,
    'In a gas, particles are far apart with lots of space between them. They move quickly and freely in all directions. This is why gases have no fixed shape or volume — they spread out to fill any container.'),
  fb(3, 'In a solid, particles are tightly packed and ___ in place. In a liquid, particles are close together but can ___ over each other.',
    ['vibrate', 'slide'],
    'Solid particles are locked in a fixed arrangement and can only vibrate (jiggle) in place, which is why solids have a fixed shape. Liquid particles have enough energy to slide past each other, which is why liquids flow and take the shape of their container.'),
  t(4, '### Changing States of Matter\n\nMatter can change from one state to another when it gains or loses heat energy:\n\n- **Melting** — solid → liquid (gains heat). Example: ice melting to water on a hot Durban day\n- **Freezing** — liquid → solid (loses heat). Example: water freezing to ice in a freezer\n- **Boiling/Evaporation** — liquid → gas (gains heat). Example: a kettle boiling water to steam\n- **Condensation** — gas → liquid (loses heat). Example: water droplets forming on a cold glass of water\n\n### Melting and Boiling Points\n\n- The **melting point** of water is **0°C** — ice turns to liquid water\n- The **boiling point** of water is **100°C** — liquid water turns to steam\n\nDifferent substances have different melting and boiling points. Iron melts at about 1 538°C — much higher than water!\n\n### Evaporation vs Boiling\n\n- **Evaporation** happens slowly at the surface of a liquid, at any temperature\n- **Boiling** happens quickly throughout the liquid, at the boiling point\n\nWhen wet clothes dry on a washing line in the Highveld sun, that is evaporation — the water slowly turns to vapour without boiling.'),
  q(5, 'What is the boiling point of water?',
    ['0°C', '50°C', '100°C', '200°C'], 2,
    'Water boils at 100°C at standard atmospheric pressure. At this temperature, liquid water changes rapidly into steam (water vapour). Below 100°C, water can still evaporate slowly from the surface.'),
  q(6, 'What happens during condensation?',
    ['A solid changes to a liquid', 'A gas changes to a liquid', 'A liquid changes to a gas', 'A solid changes to a gas'], 1,
    'Condensation is when a gas cools down and changes into a liquid. An everyday example is water droplets forming on the outside of a cold glass on a warm day — the warm water vapour in the air cools when it touches the cold glass.'),
  t(7, '### The Water Cycle\n\nThe **water cycle** describes how water moves continuously between the Earth and the atmosphere:\n\n1. **Evaporation** — the sun heats water in rivers, dams, and oceans, turning it into water vapour\n2. **Transpiration** — plants release water vapour through their leaves\n3. **Condensation** — water vapour rises, cools, and forms tiny water droplets that make clouds\n4. **Precipitation** — when clouds become heavy enough, water falls as rain (or hail, snow)\n5. **Collection** — rainwater collects in rivers, dams, and underground, and flows back to the ocean\n\nThe water cycle is crucial in South Africa, especially in dry areas like the Karoo and Northern Cape. Droughts happen when there is not enough rain over a long period.'),
  fb(8, 'The melting point of water is ___ °C and the boiling point is ___ °C.',
    ['0', '100'],
    'Water melts (ice turns to liquid) at 0°C and boils (liquid turns to steam) at 100°C. These are important reference temperatures in science. Below 0°C, water is a solid (ice), and above 100°C, it is a gas (steam).'),
  q(9, 'In the water cycle, what process causes water vapour to form clouds?',
    ['Evaporation', 'Precipitation', 'Condensation', 'Collection'], 2,
    'Condensation occurs when water vapour rises into the atmosphere, cools down, and changes back into tiny liquid water droplets. Billions of these tiny droplets form clouds. When the droplets combine and become heavy enough, they fall as rain (precipitation).'),
  t(10, '### Summary\n\n- Matter exists as solids, liquids, or gases, depending on how much energy the particles have.\n- Solids have fixed shape and volume; liquids have fixed volume but take the shape of their container; gases fill any space.\n- Changes of state: melting, freezing, boiling/evaporation, condensation.\n- Water melts at 0°C and boils at 100°C.\n- The water cycle is the continuous movement of water between Earth and the atmosphere through evaporation, condensation, precipitation, and collection.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Mixtures (Term 2 — Matter and Materials)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Mixtures\n\n### What Is a Mixture?\n\nA **mixture** is made when two or more substances are combined but are **not chemically joined**. Each substance keeps its own properties, and they can usually be separated again.\n\nExamples of mixtures:\n- Sand and water\n- Salt and water\n- Trail mix (nuts, raisins, seeds)\n- Soil (minerals, water, air, organic matter)\n\n### Dissolving\n\nWhen a substance **dissolves** in a liquid, it seems to disappear, but it is still there — the particles spread out evenly in the liquid.\n\n- The substance that dissolves is the **solute** (e.g., salt)\n- The liquid it dissolves in is the **solvent** (e.g., water)\n- The mixture formed is the **solution** (e.g., salt water)\n\n$$\\text{solute} + \\text{solvent} = \\text{solution}$$\n\n### Soluble and Insoluble\n\n- **Soluble** substances dissolve in water: salt, sugar, coffee\n- **Insoluble** substances do NOT dissolve in water: sand, chalk, cooking oil\n\nWater is often called the **universal solvent** because so many substances dissolve in it.'),
  q(2, 'In a solution, what is the substance that dissolves called?',
    ['Solvent', 'Solution', 'Solute', 'Mixture'], 2,
    'The solute is the substance that dissolves in the solvent. For example, when you stir sugar into tea, sugar is the solute, tea (water) is the solvent, and sweet tea is the solution.'),
  fb(3, 'A substance that dissolves in water is called ___. A substance that does not dissolve in water is called ___.',
    ['soluble', 'insoluble'],
    'Soluble substances (like salt and sugar) dissolve in water, meaning their particles spread out evenly through the liquid. Insoluble substances (like sand and chalk) do not dissolve — their particles remain separate.'),
  t(4, '### Separating Mixtures\n\nBecause the substances in a mixture are not chemically joined, they can be separated using physical methods:\n\n**Sieving (screening):**\n- Separates mixtures based on particle size\n- A sieve has small holes that let small particles through but hold back larger ones\n- Example: separating stones from sand\n\n**Filtering:**\n- Separates an insoluble solid from a liquid\n- The mixture is poured through filter paper — liquid passes through, solid stays behind\n- Example: separating sand from water\n\n**Evaporation:**\n- Separates a dissolved solid from a liquid\n- The liquid is heated until it evaporates, leaving the solid behind\n- Example: getting salt from salt water (this is how sea salt is made at Velddrif in the Western Cape)\n\n**Magnetism:**\n- Separates magnetic materials (iron, steel) from non-magnetic materials\n- A magnet is moved through the mixture to attract magnetic particles\n- Example: separating iron filings from sand'),
  q(5, 'Which separation method would you use to separate sand from water?',
    ['Evaporation', 'Magnetism', 'Filtering', 'Sieving'], 2,
    'Filtering is used to separate an insoluble solid (sand) from a liquid (water). The mixture is poured through filter paper — the water passes through the tiny holes in the paper, but the sand particles are too large and stay behind.'),
  q(6, 'How is sea salt produced at Velddrif in the Western Cape?',
    ['By filtering', 'By magnetism', 'By evaporation of seawater', 'By freezing seawater'], 2,
    'Sea salt is produced by evaporation. Seawater is pumped into shallow pans and left in the sun. The water slowly evaporates, leaving behind salt crystals. This method has been used at Velddrif and other coastal areas for many years.'),
  t(7, '### Practical Investigation: Separating a Mixture\n\nImagine you have a mixture of sand, salt, and iron filings. How would you separate them?\n\n1. **Step 1 — Magnetism:** Pass a magnet through the mixture. The iron filings stick to the magnet. Remove them.\n2. **Step 2 — Dissolving and filtering:** Add water to the remaining mixture (sand + salt). The salt dissolves, the sand does not. Pour through filter paper — sand stays behind, salt water passes through.\n3. **Step 3 — Evaporation:** Heat the salt water until the water evaporates. Salt crystals are left behind.\n\nNow you have separated all three substances!\n\nThis is a common investigation in Grade 6 Natural Sciences. Each method is chosen based on the properties of the substances being separated.'),
  fb(8, 'To separate iron filings from sand, you would use a ___. To get salt from salt water, you would use ___.',
    ['magnet', 'evaporation'],
    'Magnetism is used because iron is magnetic — a magnet attracts the iron filings out of the mixture. Evaporation is used because when salt water is heated, the water evaporates (turns to gas) and the salt is left behind as crystals.'),
  q(9, 'Which of the following is an example of an insoluble substance?',
    ['Salt', 'Sugar', 'Sand', 'Coffee'], 2,
    'Sand is insoluble — it does not dissolve in water. If you stir sand into water, the sand particles sink to the bottom. Salt, sugar, and coffee all dissolve in water, making them soluble.'),
  t(10, '### Summary\n\n- A mixture is two or more substances combined but not chemically joined.\n- A solution forms when a solute dissolves in a solvent.\n- Soluble substances dissolve in water; insoluble substances do not.\n- Separation methods: sieving (by size), filtering (insoluble solid from liquid), evaporation (dissolved solid from liquid), and magnetism (magnetic from non-magnetic).\n- The correct method depends on the properties of the substances in the mixture.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Systems for Moving Things (Term 2 — Technology)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Systems for Moving Things\n\n### Simple Machines\n\nA **simple machine** is a device that makes work easier. Simple machines help us to:\n- Lift heavy loads\n- Move things with less effort\n- Change the direction of a force\n\n### Levers\n\nA **lever** is a rigid bar that turns (pivots) around a fixed point called the **fulcrum**. A lever has three parts:\n\n- **Load** — the object being moved or lifted\n- **Effort** — the force you apply\n- **Fulcrum** — the fixed point around which the lever turns\n\nLevers make work easier by multiplying the effort force or changing its direction.\n\nExamples of levers:\n- A seesaw (the fulcrum is in the middle)\n- A wheelbarrow (the fulcrum is at the wheel)\n- A pair of scissors (the fulcrum is the pivot point)\n- A bottle opener\n\n### Pulleys\n\nA **pulley** is a wheel with a groove around it, through which a rope or cable passes. Pulleys are used to:\n- Lift heavy objects (e.g., raising a flag up a flagpole)\n- Change the direction of force (you pull down, the load goes up)\n\nA **single fixed pulley** changes the direction of force but does not reduce the effort needed.\nA **movable pulley** or **compound pulley system** reduces the effort needed to lift a load.'),
  q(2, 'What is the fixed point around which a lever turns called?',
    ['Load', 'Effort', 'Fulcrum', 'Pulley'], 2,
    'The fulcrum is the fixed pivot point around which a lever rotates. The position of the fulcrum relative to the load and effort determines how much the lever multiplies the force.'),
  fb(3, 'A lever is a rigid bar that pivots around a fixed point called the ___. The three parts of a lever are the load, the effort, and the ___.',
    ['fulcrum', 'fulcrum'],
    'The fulcrum is essential to how a lever works. It is the fixed pivot point that the lever rotates around. Moving the fulcrum closer to the load makes it easier to lift the load.'),
  t(4, '### Gears\n\nA **gear** is a toothed wheel that fits together with another toothed wheel. When one gear turns, it makes the other turn too. Gears can:\n\n- **Change speed** — a small gear driving a large gear slows down the speed but increases the turning force\n- **Change direction** — two meshing gears turn in opposite directions\n- **Transfer motion** — gears transfer turning movement from one place to another\n\nExamples of gears:\n- A bicycle (gears on the pedal and back wheel)\n- A hand-cranked mincer\n- Clocks and watches\n- An eggbeater\n\nWhen a **small gear** (called the driver) turns a **large gear** (called the follower), the follower turns more slowly but with more force. When a large gear drives a small gear, the small gear turns faster but with less force.\n\n### Linkages\n\n**Linkages** are systems of bars and pivots that transmit motion from one place to another. They can:\n- Change the direction of motion\n- Change the type of motion (e.g., turning motion to back-and-forth motion)\n\nExamples:\n- Windscreen wipers (change circular motion to back-and-forth motion)\n- Scissors (a linkage with a pivot)'),
  q(5, 'When a small gear drives a large gear, what happens?',
    ['The large gear turns faster', 'The large gear turns slower but with more force', 'Nothing changes', 'Both gears stop'], 1,
    'When a small gear (driver) turns a large gear (follower), the large gear turns more slowly because it has more teeth to move. However, it turns with more force (torque). This is why bicycles use small gears for climbing hills — more force, less speed.'),
  q(6, 'Which simple machine would you use to raise a South African flag up a flagpole?',
    ['Lever', 'Gear', 'Pulley', 'Linkage'], 2,
    'A pulley is used to raise a flag up a flagpole. The rope passes through a pulley (wheel) at the top of the pole. When you pull the rope down, the flag goes up — the pulley changes the direction of the force.'),
  t(7, '### Designing a System That Uses Movement\n\nIn technology, you can design and build a model that uses levers, pulleys, gears, or linkages to solve a problem. The design process involves:\n\n1. **Investigate** — understand the problem and research existing solutions\n2. **Design** — draw labelled sketches of your solution\n3. **Make** — build a working model using available materials\n4. **Evaluate** — test your model and suggest improvements\n\nFor example, you might design a model crane using pulleys and a lever to lift small objects. Or you could build a model with gears to transfer motion from a handle to a moving part.'),
  fb(8, 'Gears are toothed wheels that can change speed, direction, and transfer ___. A system of bars and pivots that transmits motion is called a ___.',
    ['motion', 'linkage'],
    'Gears mesh together to transfer rotational motion from one shaft to another, and can change speed and direction of rotation. Linkages are systems of connected bars and pivots used to transmit or transform motion, like windscreen wipers.'),
  q(9, 'Which of the following is an example of a lever?',
    ['A flagpole', 'A seesaw', 'A bicycle chain', 'A ramp'], 1,
    'A seesaw is a lever — it is a rigid bar (the plank) that pivots around a fulcrum (the centre support). When one person sits down (effort), they lift the other person (load) on the other side.'),
  t(10, '### Summary\n\n- Simple machines (levers, pulleys, gears, linkages) make work easier.\n- A lever has three parts: load, effort, and fulcrum.\n- Pulleys change the direction of force and can reduce effort.\n- Gears are toothed wheels that change speed, direction, and transfer motion.\n- Linkages are systems of bars and pivots that transmit motion.\n- The design process: investigate, design, make, evaluate.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Electric Circuits (Term 3 — Energy and Change)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Electric Circuits\n\n### What Is an Electric Circuit?\n\nAn **electric circuit** is a closed path through which electric current can flow. For current to flow, the circuit must be **complete** — there must be no gaps or breaks.\n\n### Components of a Simple Circuit\n\nA simple circuit needs these components:\n\n- **Cell (battery)** — provides the energy that pushes electric current around the circuit. A single cell provides about 1.5 volts. Two or more cells connected together form a battery.\n- **Wires** — connect the components and provide a path for current to flow.\n- **Switch** — opens or closes the circuit. When the switch is closed, current flows (circuit is on). When it is open, current stops (circuit is off).\n- **Bulb (lamp)** — converts electrical energy into light and heat energy.\n\n### Circuit Diagrams and Symbols\n\nScientists use standard symbols to draw circuit diagrams:\n\n| Component | Symbol Description |\n|-----------|-------------------|\n| Cell | Two parallel lines (long = positive, short = negative) |\n| Battery | Multiple cell symbols joined |\n| Bulb | Circle with a cross inside |\n| Switch (open) | Gap in the line |\n| Switch (closed) | Straight line connecting |\n| Wire | Straight line |\n\nCircuit diagrams are drawn with straight lines and right angles — not as realistic drawings of the components.'),
  q(2, 'What must be true for electric current to flow in a circuit?',
    ['The circuit must have many bulbs', 'The circuit must be a complete, closed loop', 'The wires must be very long', 'The switch must be open'], 1,
    'Electric current can only flow if the circuit is a complete, closed loop with no gaps. If there is a break anywhere — such as an open switch, a broken wire, or a loose connection — current cannot flow and the circuit will not work.'),
  fb(3, 'A ___ provides the energy to push electric current around a circuit. A switch that is ___ allows current to flow.',
    ['cell', 'closed'],
    'A cell (or battery) provides the electrical energy needed to push current through the circuit. When a switch is closed, it completes the circuit so current can flow. An open switch breaks the circuit and stops the current.'),
  t(4, '### Open and Closed Circuits\n\n**Closed circuit:** The circuit is complete — current flows, the bulb lights up.\n**Open circuit:** There is a break in the circuit — current does not flow, the bulb does not light up.\n\nSwitches are used to control whether a circuit is open or closed. When you flip a light switch at home, you are closing the circuit to let current flow to the light.\n\n### Series Circuits\n\nIn a **series circuit**, all the components are connected in a single loop, one after another. The current follows only one path.\n\nProperties of series circuits:\n- If one bulb blows or is removed, ALL bulbs go out (the circuit is broken)\n- Adding more bulbs makes each bulb dimmer (the cells energy is shared)\n- The current is the same at every point in the circuit\n\nOld-fashioned string Christmas lights often used series circuits — if one bulb blew, the whole string went dark!\n\n### Building a Circuit\n\nTo build a simple circuit, you need:\n1. Connect a wire from the positive terminal of the cell to one side of the bulb holder\n2. Connect another wire from the other side of the bulb holder to the switch\n3. Connect a wire from the switch back to the negative terminal of the cell\n4. Close the switch — the bulb should light up!'),
  q(5, 'In a series circuit, what happens if one bulb blows?',
    ['Only that bulb goes out', 'All bulbs go out', 'The other bulbs get brighter', 'Nothing happens'], 1,
    'In a series circuit, all components are connected in a single loop. If one bulb blows, it creates a break in the circuit. Since there is only one path for current, the break stops current flowing to all the other bulbs.'),
  q(6, 'What does a switch do in an electric circuit?',
    ['It provides energy', 'It converts energy to light', 'It opens or closes the circuit to control current flow', 'It increases voltage'], 2,
    'A switch controls whether the circuit is open (no current flows) or closed (current flows). When you turn on a light switch, you are closing the circuit so that current can flow from the cell through the wires and bulb.'),
  fb(7, 'In a series circuit, all components are connected in a single ___. If one bulb is removed, the circuit is ___ and all bulbs go out.',
    ['loop', 'broken'],
    'A series circuit has only one path for current to flow. All components are connected one after another in a single loop. Removing any component breaks the circuit, stopping current flow to all components.'),
  q(8, 'What type of energy does a bulb convert electrical energy into?',
    ['Sound and chemical energy', 'Light and heat energy', 'Kinetic and potential energy', 'Nuclear energy'], 1,
    'A light bulb converts electrical energy into light energy (so we can see) and heat energy (the bulb gets warm). The light energy is the useful output, while the heat energy is wasted.'),
  t(9, '### Summary\n\n- An electric circuit is a closed path for current to flow.\n- A simple circuit needs a cell, wires, a switch, and a bulb.\n- Circuit diagrams use standard symbols.\n- A closed circuit allows current to flow; an open circuit does not.\n- In a series circuit, components are in one loop — if one fails, all stop working.\n- Switches control current flow by opening or closing the circuit.'),
];

blockNum = 0;
const ch8_lesson2 = [
  t(1, '## Conductors, Insulators, and Circuit Applications\n\n### Conductors and Insulators\n\nMaterials can be classified based on whether they allow electric current to pass through them:\n\n**Conductors** — materials that allow electric current to flow through them easily:\n- **Metals** — copper, aluminium, iron, gold, silver\n- Copper wire is the most commonly used conductor in electric circuits and household wiring\n- Water with dissolved salts also conducts electricity (this is why it is dangerous to touch electrical appliances with wet hands)\n\n**Insulators** — materials that do NOT allow electric current to flow through them:\n- Plastic, rubber, glass, wood, dry cloth, air\n- Electrical wires are coated in **plastic insulation** to protect us from electric shock\n- Plugs are made of plastic to keep our hands away from the conducting metal parts\n\n### Testing Conductors and Insulators\n\nYou can test whether a material is a conductor or insulator by connecting it into a simple circuit with a bulb:\n1. Set up a circuit with a cell, bulb, and two wires with a gap between them\n2. Place the test material across the gap\n3. If the bulb lights up — the material is a **conductor**\n4. If the bulb does not light up — the material is an **insulator**'),
  q(2, 'Which of the following is an electrical conductor?',
    ['Plastic', 'Rubber', 'Copper', 'Glass'], 2,
    'Copper is an excellent electrical conductor — it allows electric current to flow through it easily. This is why copper wire is used in electrical circuits, household wiring, and power cables throughout South Africa.'),
  fb(3, 'Materials that allow electric current to flow through them are called ___. Materials that block current are called ___.',
    ['conductors', 'insulators'],
    'Conductors (mainly metals like copper and aluminium) allow current to pass through them because their electrons can move freely. Insulators (like plastic, rubber, and glass) do not allow current to flow because their electrons are tightly held in place.'),
  t(4, '### Electrical Safety\n\nElectricity can be very dangerous if not used safely. Important safety rules:\n\n- **Never touch** electrical appliances with wet hands — water conducts electricity\n- **Never poke** objects into plug sockets\n- **Never use** appliances with damaged or frayed wires\n- **Switch off** appliances before unplugging them\n- **Keep away** from fallen power lines — call Eskom immediately\n- **Do not shelter** under pylons or electrical towers during thunderstorms\n\nIn South Africa, illegal electricity connections (izinyoka) are extremely dangerous and cause many fires and deaths each year. Always use legal, safe electrical connections.\n\n### How Many Cells?\n\nAdding more cells to a circuit increases the voltage (push). With more voltage:\n- Bulbs glow brighter\n- BUT too much voltage can blow a bulb\n\nFor example:\n- 1 cell (1.5 V) — bulb glows dimly\n- 2 cells (3 V) — bulb glows normally\n- 3 cells (4.5 V) — bulb may blow!'),
  q(5, 'Why are electrical wires coated in plastic?',
    ['To make them stronger', 'To make them look nice', 'Because plastic is an insulator that prevents electric shock', 'To help current flow faster'], 2,
    'Plastic is an insulator — it does not allow electric current to pass through it. Coating wires in plastic protects people from electric shock by preventing them from touching the conducting metal wire inside.'),
  q(6, 'What happens if you add more cells (in series) to a circuit with a bulb?',
    ['The bulb gets dimmer', 'The bulb gets brighter', 'Nothing changes', 'The bulb turns blue'], 1,
    'Adding more cells increases the voltage (the "push" of the current). This makes the bulb glow brighter. However, if too many cells are added, the voltage may be too high and could blow the bulb.'),
  t(7, '### Practical: Building and Testing Circuits\n\nIn this practical activity, you can:\n\n**Activity 1: Build a simple series circuit**\n- Use 1 cell, 2 wires, 1 switch, and 1 bulb\n- Draw the circuit diagram using standard symbols\n- Test: does the bulb light up when the switch is closed?\n\n**Activity 2: Test conductors and insulators**\n- Set up a circuit with a gap\n- Test different materials: paper clip (metal), pencil lead, plastic ruler, rubber band, coin, aluminium foil\n- Record which materials are conductors and which are insulators\n\n**Activity 3: The effect of adding more bulbs**\n- Build a series circuit with 1 bulb — observe brightness\n- Add a second bulb in series — what happens?\n- Add a third bulb — what happens now?\n- Conclusion: more bulbs in series = dimmer light (energy is shared)'),
  fb(8, 'Adding more bulbs in a series circuit makes each bulb ___. This is because the energy from the cell is ___ between all the bulbs.',
    ['dimmer', 'shared'],
    'In a series circuit, the cell provides a fixed amount of energy. Adding more bulbs means this energy must be shared among all of them, so each bulb receives less energy and glows dimmer.'),
  q(9, 'Why is it dangerous to touch electrical appliances with wet hands?',
    ['Because water is an insulator', 'Because water with dissolved salts conducts electricity', 'Because water is too cold', 'Because water damages the plug'], 1,
    'Water with dissolved salts (such as tap water or sweat) is a conductor — it allows electric current to pass through it. If you touch an electrical appliance with wet hands, current could flow through the water and your body, causing electric shock.'),
  t(10, '### Summary\n\n- Conductors (metals) allow current to flow; insulators (plastic, rubber) block current.\n- Wires are coated in plastic insulation for safety.\n- Adding more cells increases brightness; adding more bulbs in series decreases brightness.\n- Electrical safety is essential — never touch appliances with wet hands, avoid damaged wires, and stay away from fallen power lines.\n- You can test whether a material is a conductor or insulator using a simple circuit.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Energy and Electricity (Term 3 — Energy and Change)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Energy and Electricity\n\n### What Is Energy?\n\n**Energy** is the ability to do work or cause change. We use energy for everything — heating, lighting, cooking, transport, and running machines. Energy is measured in **joules (J)** or **kilojoules (kJ)**.\n\n### Sources of Energy\n\nEnergy sources can be grouped as **renewable** or **non-renewable**:\n\n**Non-renewable energy sources** — will eventually run out and cannot be replaced:\n- **Coal** — formed from ancient plants buried millions of years ago. Burned in power stations to generate electricity. South Africa gets about 80% of its electricity from coal.\n- **Oil (petroleum)** — used for petrol, diesel, and jet fuel\n- **Natural gas** — used for heating and cooking\n- **Nuclear energy** — energy from splitting uranium atoms. Koeberg Power Station near Cape Town is South Africa\'s only nuclear power station.\n\n**Renewable energy sources** — will not run out and can be replaced naturally:\n- **Solar energy** — from the sun. South Africa has excellent sunshine — large solar farms in the Northern Cape\n- **Wind energy** — from moving air. Wind farms along the Eastern and Western Cape coast\n- **Hydroelectric energy** — from flowing water. Gariep Dam generates hydroelectricity\n- **Biomass** — from plant and animal waste (e.g., wood, cow dung for fuel in rural SA)'),
  q(2, 'What percentage of South Africa\'s electricity comes from coal?',
    ['About 20%', 'About 50%', 'About 80%', 'About 100%'], 2,
    'South Africa generates approximately 80% of its electricity by burning coal in power stations run by Eskom. This heavy reliance on coal is a major concern because burning coal produces greenhouse gases that contribute to climate change.'),
  fb(3, 'Energy sources that will run out are called ___. Energy sources that will not run out are called ___.',
    ['non-renewable', 'renewable'],
    'Non-renewable energy sources (coal, oil, gas, nuclear) exist in limited quantities and take millions of years to form. Renewable energy sources (solar, wind, hydro) are constantly replenished by natural processes.'),
  t(4, '### Eskom and South Africa\'s Electricity\n\n**Eskom** is South Africa\'s main electricity supplier. It generates, transmits, and distributes electricity to homes, businesses, and industries across the country.\n\nHow electricity is generated at a coal power station:\n1. Coal is burned to heat water\n2. The water produces steam\n3. The steam turns a **turbine** (a large wheel with blades)\n4. The turbine turns a **generator** which converts mechanical energy into electrical energy\n5. Electricity is sent through power lines to homes and businesses\n\n### Problems with Electricity in South Africa\n\n- **Load shedding** — Eskom sometimes does not have enough electricity for everyone, so power is switched off in different areas at different times\n- **Coal pollution** — burning coal releases carbon dioxide (contributes to climate change), sulfur dioxide (causes acid rain), and particulate matter (causes health problems)\n- **Access** — some rural communities still do not have electricity\n\n### Saving Electricity\n\nWe can all help by saving electricity:\n- Switch off lights when leaving a room\n- Use energy-saving LED bulbs instead of old incandescent bulbs\n- Unplug appliances when not in use (standby mode still uses electricity)\n- Use a solar geyser to heat water\n- Insulate your home to keep heat in during winter'),
  q(5, 'What device in a power station converts mechanical energy into electrical energy?',
    ['Turbine', 'Generator', 'Boiler', 'Transformer'], 1,
    'A generator converts the mechanical (turning) energy from the turbine into electrical energy. Inside the generator, a coil of wire rotates inside a magnetic field, which produces an electric current.'),
  q(6, 'Which of the following is a way to save electricity at home?',
    ['Leave all lights on', 'Use incandescent bulbs', 'Switch off appliances when not in use', 'Keep the door open in winter'], 2,
    'Switching off appliances when not in use saves electricity. Even on standby, many appliances use small amounts of power. Using LED bulbs, solar geysers, and insulating your home are also effective ways to save electricity.'),
  t(7, '### Renewable Energy in South Africa\n\nSouth Africa is investing in renewable energy:\n\n**Solar energy:**\n- South Africa receives some of the highest levels of sunshine in the world\n- Large solar farms have been built in the Northern Cape (e.g., Jasper Solar Energy Project)\n- Homes can install rooftop solar panels to generate their own electricity\n\n**Wind energy:**\n- Wind farms have been built along the coast, especially in the Eastern and Western Cape\n- The Sere Wind Farm near Vredendal was one of the first large wind farms in SA\n\n**Hydroelectricity:**\n- Generated at dams such as the Gariep Dam on the Orange River\n- Limited potential in SA because of low rainfall in many areas\n\nRenewable energy helps reduce pollution and dependence on coal, but it can be expensive to set up and depends on weather conditions (sun, wind, rain).'),
  fb(8, 'South Africa\'s only nuclear power station is called ___. It is located near ___.',
    ['Koeberg', 'Cape Town'],
    'Koeberg Power Station is located about 30 km north of Cape Town on the West Coast. It is the only nuclear power station in Africa and has been generating electricity since 1984.'),
  q(9, 'What is load shedding?',
    ['When extra electricity is produced', 'When electricity is switched off in different areas because supply cannot meet demand', 'When new power stations are built', 'When solar panels are installed'], 1,
    'Load shedding happens when Eskom cannot generate enough electricity to meet the demand. To prevent the entire power grid from collapsing, Eskom switches off electricity to different areas in rotation, giving each area scheduled blackouts.'),
  t(10, '### Summary\n\n- Energy is the ability to do work. Sources are renewable (solar, wind, hydro) or non-renewable (coal, oil, gas, nuclear).\n- South Africa relies heavily on coal (about 80% of electricity), generated by Eskom.\n- Burning coal causes pollution and contributes to climate change.\n- Load shedding occurs when electricity supply cannot meet demand.\n- We can save electricity by switching off lights, using LED bulbs, and using solar energy.\n- South Africa is investing in renewable energy, especially solar and wind.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: The Solar System (Term 3 — Planet Earth and Beyond)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## The Solar System\n\n### What Is the Solar System?\n\nThe **solar system** is made up of the **Sun** and everything that orbits (moves around) it — including eight planets, their moons, asteroids, comets, and other objects.\n\nThe **Sun** is a star — a huge ball of hot, glowing gas at the centre of the solar system. It provides light and heat energy to all the planets.\n\n### The Eight Planets\n\nThe planets, in order from the Sun, are:\n\n| Order | Planet | Key Facts |\n|-------|--------|-----------|\n| 1 | Mercury | Smallest planet, closest to Sun, no atmosphere, very hot days and cold nights |\n| 2 | Venus | Hottest planet (thick atmosphere traps heat), similar size to Earth |\n| 3 | Earth | Our home, only planet known to have liquid water and life |\n| 4 | Mars | The "Red Planet" (iron oxide on surface), has two small moons |\n| 5 | Jupiter | Largest planet, a gas giant, has a Great Red Spot (storm), 79+ moons |\n| 6 | Saturn | Famous for its rings (made of ice and rock), a gas giant |\n| 7 | Uranus | Tilted on its side, an ice giant, blue-green colour |\n| 8 | Neptune | Farthest planet, an ice giant, strong winds, blue colour |\n\nA useful way to remember the order: **M**y **V**ery **E**xcellent **M**other **J**ust **S**erved **U**s **N**achos.'),
  q(2, 'Which planet is the largest in our solar system?',
    ['Saturn', 'Earth', 'Jupiter', 'Neptune'], 2,
    'Jupiter is the largest planet in the solar system. It is so big that over 1 300 Earths could fit inside it! Jupiter is a gas giant — it is made mostly of hydrogen and helium and does not have a solid surface.'),
  fb(3, 'The solar system has ___ planets that orbit the Sun. The planet closest to the Sun is ___.',
    ['eight', 'Mercury'],
    'There are eight planets in our solar system. Mercury is the closest to the Sun and also the smallest planet. Despite being closest to the Sun, Mercury is not the hottest planet — Venus is hotter due to its thick atmosphere trapping heat.'),
  t(4, '### Inner and Outer Planets\n\nThe planets are divided into two groups:\n\n**Inner planets (terrestrial/rocky):** Mercury, Venus, Earth, Mars\n- Small, rocky, solid surfaces\n- Closer to the Sun\n- Few or no moons\n\n**Outer planets (gas/ice giants):** Jupiter, Saturn, Uranus, Neptune\n- Large, made of gas and ice\n- Far from the Sun\n- Many moons and rings\n\nBetween Mars and Jupiter is the **asteroid belt** — a region of rocky objects orbiting the Sun.\n\n### Day and Night\n\nThe Earth **rotates** (spins) on its axis once every **24 hours**. This causes day and night:\n- The side of Earth facing the Sun has **daytime** (it receives sunlight)\n- The side facing away from the Sun has **night-time** (it is in shadow)\n\nBecause the Earth is always spinning, different parts of the world experience day and night at different times.\n\n### Seasons\n\nThe Earth\'s axis is **tilted at 23.5°**. As the Earth **revolves** (orbits) around the Sun once every **365.25 days** (one year), the tilt means different parts of Earth receive different amounts of sunlight at different times of year. This causes the **seasons**.\n\n- In **December**, the Southern Hemisphere is tilted toward the Sun → summer in South Africa\n- In **June**, the Southern Hemisphere is tilted away from the Sun → winter in South Africa'),
  q(5, 'What causes day and night on Earth?',
    ['The Sun moves around the Earth', 'The Earth rotates on its axis', 'The Moon blocks the Sun', 'Clouds cover the Sun'], 1,
    'Day and night are caused by the Earth rotating (spinning) on its axis once every 24 hours. The side facing the Sun experiences daytime, while the side facing away from the Sun experiences night-time.'),
  q(6, 'Why is it summer in South Africa in December?',
    ['Because South Africa is closer to the Sun', 'Because the Southern Hemisphere is tilted toward the Sun', 'Because there are no clouds', 'Because the Earth spins faster'], 1,
    'In December, the Earth\'s tilted axis (23.5°) means the Southern Hemisphere is tilted toward the Sun. This hemisphere receives more direct sunlight and longer days, causing summer. At the same time, the Northern Hemisphere experiences winter.'),
  fb(7, 'The Earth rotates on its axis once every ___ hours, causing day and night. The Earth revolves around the Sun once every ___ days, which is one year.',
    ['24', '365.25'],
    'The Earth\'s rotation (spinning on its axis) takes 24 hours and causes day and night. The Earth\'s revolution (orbiting around the Sun) takes about 365.25 days and, combined with the tilted axis, causes the seasons.'),
  t(8, '### South African Astronomy\n\nSouth Africa is a world leader in astronomy:\n\n- **SALT (Southern African Large Telescope)** — located in Sutherland in the Northern Cape. It is the largest single optical telescope in the Southern Hemisphere and is used to study distant stars and galaxies.\n\n- **SKA (Square Kilometre Array)** — a massive radio telescope project being built in the Karoo. When complete, it will be the world\'s largest radio telescope. South Africa was chosen because the Karoo has very little radio interference (few people, no cell towers).\n\n- **South Africa\'s clear, dark skies** in areas like the Karoo and Sutherland make it one of the best places on Earth for stargazing.\n\nTelescopes help us learn about objects that are too far away to visit. Optical telescopes use lenses and mirrors to see visible light, while radio telescopes detect radio waves from space.'),
  q(9, 'Where is the Southern African Large Telescope (SALT) located?',
    ['Johannesburg', 'Cape Town', 'Sutherland, Northern Cape', 'Durban'], 2,
    'SALT is located in Sutherland in the Northern Cape, which has some of the darkest and clearest skies in South Africa. The dry, cloud-free conditions and distance from city lights make it an ideal location for astronomical observation.'),
  t(10, '### Summary\n\n- The solar system consists of the Sun and eight planets that orbit it.\n- Inner planets (Mercury, Venus, Earth, Mars) are rocky; outer planets (Jupiter, Saturn, Uranus, Neptune) are gas/ice giants.\n- Day and night are caused by the Earth\'s rotation (24 hours).\n- Seasons are caused by the Earth\'s tilted axis (23.5°) as it orbits the Sun (365.25 days).\n- South Africa is home to world-class telescopes: SALT in Sutherland and SKA in the Karoo.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: The Earth and the Moon (Term 4 — Planet Earth and Beyond)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## The Earth and the Moon\n\n### Earth\'s Rotation and Revolution\n\n**Rotation** — the Earth spins on its axis (an imaginary line from the North Pole to the South Pole). One full rotation takes **24 hours** and causes **day and night**.\n\n**Revolution** — the Earth moves in an orbit around the Sun. One full revolution takes **365.25 days** (one year). The extra 0.25 days add up — every 4 years we have a **leap year** with 366 days (29 February).\n\n### The Moon\n\nThe **Moon** is Earth\'s only natural satellite. It orbits the Earth once every **27.3 days** (about a month). Key facts about the Moon:\n\n- It has **no atmosphere** — no air, no weather, no sound\n- It has **no liquid water**\n- Its surface is covered in **craters** (formed by asteroid impacts), mountains, and flat plains called "maria"\n- The Moon does not produce its own light — it **reflects** sunlight\n- Gravity on the Moon is about **1/6 of Earth\'s gravity** — you would weigh much less on the Moon\n\n### Phases of the Moon\n\nAs the Moon orbits the Earth, we see different amounts of its sunlit side. These are called the **phases of the Moon**:\n\n1. **New Moon** — the Moon is between the Earth and Sun; we cannot see it (dark)\n2. **Waxing Crescent** — a small sliver of light appears on the right\n3. **First Quarter** — half the Moon is lit (right half)\n4. **Waxing Gibbous** — more than half is lit, growing\n5. **Full Moon** — the entire face is lit\n6. **Waning Gibbous** — more than half is lit, shrinking\n7. **Last Quarter** — half the Moon is lit (left half)\n8. **Waning Crescent** — a small sliver on the left, shrinking\n\nThe full cycle takes about **29.5 days** (a lunar month).'),
  q(2, 'How long does it take for the Moon to orbit the Earth once?',
    ['24 hours', '365 days', 'About 27.3 days', '12 months'], 2,
    'The Moon takes approximately 27.3 days to complete one orbit around the Earth. The full cycle of moon phases (from new moon to new moon) takes about 29.5 days because the Earth is also moving around the Sun during this time.'),
  fb(3, 'The Earth\'s rotation takes ___ hours and causes day and night. The Moon takes about 27.3 days to ___ the Earth.',
    ['24', 'orbit'],
    'The Earth rotates on its axis once every 24 hours, giving us day and night. The Moon orbits (revolves around) the Earth approximately every 27.3 days, and we see different phases as the Moon moves through its orbit.'),
  t(4, '### Tides\n\n**Tides** are the regular rise and fall of sea level caused by the gravitational pull of the Moon (and to a lesser extent, the Sun) on the Earth\'s water.\n\n- **High tide** — the sea level rises; water moves onto the shore\n- **Low tide** — the sea level drops; water moves away from the shore\n\nMost coastal areas experience **two high tides and two low tides** each day.\n\nThe Moon\'s gravity pulls the water on the side of Earth closest to it, creating a bulge (high tide). There is also a bulge on the opposite side of Earth due to inertia.\n\n### Spring Tides and Neap Tides\n\n**Spring tides** (extra high and extra low):\n- Occur during **Full Moon** and **New Moon**\n- The Sun, Moon, and Earth are in a line\n- The Sun\'s and Moon\'s gravity work together, making tides stronger\n\n**Neap tides** (smaller difference between high and low):\n- Occur during **First Quarter** and **Last Quarter**\n- The Sun and Moon are at right angles to the Earth\n- Their gravitational pulls partially cancel each other\n\nFishermen along the South African coast pay close attention to tides. The rocky shores at places like Hermanus, Kalk Bay, and Ballito are rich ecosystems where organisms adapt to the changing tides.'),
  q(5, 'What causes tides on Earth?',
    ['Wind blowing on the ocean', 'The gravitational pull of the Moon', 'The Earth spinning too fast', 'Underwater earthquakes'], 1,
    'Tides are primarily caused by the gravitational pull of the Moon on Earth\'s water. The Moon\'s gravity creates a bulge of water on the side of Earth nearest to it (high tide). The Sun\'s gravity also contributes, but to a lesser extent.'),
  q(6, 'When do spring tides occur?',
    ['Only in the month of September', 'During First Quarter and Last Quarter Moon', 'During Full Moon and New Moon', 'Only during summer'], 2,
    'Spring tides occur during Full Moon and New Moon, when the Sun, Moon, and Earth are aligned. The word "spring" refers to the water "springing up," not the season. During these times, the gravitational pull of the Sun and Moon work together, creating extra high and extra low tides.'),
  fb(7, 'Spring tides happen during Full Moon and ___ Moon when the Sun, Moon, and Earth are aligned. Neap tides happen during First Quarter and ___ Quarter.',
    ['New', 'Last'],
    'At Full Moon and New Moon, the Sun and Moon are aligned with the Earth, combining their gravitational forces to produce spring tides (stronger). At First and Last Quarter, the Sun and Moon are at right angles, partially cancelling each other and producing neap tides (weaker).'),
  t(8, '### Eclipses\n\n**Solar eclipse** — occurs when the Moon passes between the Sun and the Earth, blocking the Sun\'s light. The Moon\'s shadow falls on part of the Earth. Solar eclipses are rare and should **NEVER** be looked at directly — this can cause permanent eye damage.\n\n**Lunar eclipse** — occurs when the Earth passes between the Sun and the Moon, and the Earth\'s shadow falls on the Moon. During a total lunar eclipse, the Moon often appears reddish (sometimes called a "blood moon") because some sunlight bends through Earth\'s atmosphere.\n\nEclipses do not happen every month because the Moon\'s orbit is slightly tilted compared to the Earth\'s orbit around the Sun. So the shadows usually miss.'),
  q(9, 'During a solar eclipse, what blocks the Sun\'s light?',
    ['The Earth', 'A cloud', 'The Moon', 'Jupiter'], 2,
    'During a solar eclipse, the Moon passes directly between the Sun and the Earth, blocking the Sun\'s light and casting a shadow on part of the Earth. You should never look directly at a solar eclipse, as the Sun\'s rays can permanently damage your eyes.'),
  t(10, '### Summary\n\n- The Earth rotates (24 hours → day/night) and revolves around the Sun (365.25 days → year).\n- The Moon orbits the Earth every 27.3 days and reflects sunlight.\n- Moon phases: New Moon → Waxing → Full Moon → Waning → New Moon (29.5-day cycle).\n- Tides are caused by the Moon\'s gravitational pull on Earth\'s water.\n- Spring tides (Full/New Moon) are stronger; neap tides (Quarter Moon) are weaker.\n- Solar eclipses (Moon blocks Sun) and lunar eclipses (Earth\'s shadow on Moon) are rare events.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Rocks and Soil (Term 4 — Planet Earth and Beyond)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Rocks and Soil\n\n### Three Types of Rocks\n\nAll rocks on Earth belong to one of three groups, based on how they were formed:\n\n**1. Igneous rocks** — formed when hot, melted rock (**magma** underground or **lava** on the surface) cools and hardens.\n- If it cools **slowly** underground → large crystals (e.g., **granite**)\n- If it cools **quickly** on the surface → small crystals or glassy (e.g., **basalt**)\n- Granite is common in South Africa — the Paarl Rock in the Western Cape is a huge granite dome\n\n**2. Sedimentary rocks** — formed when layers of sediment (sand, mud, shells, dead organisms) are deposited and pressed together over millions of years.\n- Often have visible **layers** (strata)\n- May contain **fossils** (remains of ancient organisms)\n- Examples: **sandstone** (Table Mountain), **shale**, **limestone**\n- Table Mountain in Cape Town is made of sandstone that is over 500 million years old!\n\n**3. Metamorphic rocks** — formed when existing rocks are changed by extreme heat and pressure deep inside the Earth. The rock does not melt — it transforms.\n- Examples: **marble** (from limestone), **slate** (from shale), **quartzite** (from sandstone)\n- Metamorphic means "changed form"'),
  q(2, 'What type of rock is granite?',
    ['Sedimentary', 'Metamorphic', 'Igneous', 'Fossil'], 2,
    'Granite is an igneous rock formed when magma cools slowly deep underground. The slow cooling allows large crystals to form, giving granite its speckled appearance. The Paarl Rock in the Western Cape is a famous South African granite formation.'),
  fb(3, 'Igneous rocks are formed when magma or lava cools and ___. Sedimentary rocks are formed when layers of sediment are deposited and ___ together over time.',
    ['hardens', 'pressed'],
    'Igneous rocks form from the cooling and hardening of molten rock. Sedimentary rocks form from the accumulation and compression of sediments (sand, mud, shells) over millions of years. Sedimentary rocks are the only type that can contain fossils.'),
  t(4, '### The Rock Cycle\n\nRocks are constantly changing from one type to another through the **rock cycle**. This process takes millions of years:\n\n1. **Igneous rock** is exposed at the surface and broken down by weathering and erosion\n2. The broken pieces (sediment) are transported by water and wind and deposited in layers\n3. Over time, the layers are pressed together to form **sedimentary rock**\n4. If sedimentary rock is buried deep enough, heat and pressure change it into **metamorphic rock**\n5. If metamorphic rock melts, it becomes magma, which cools to form **igneous rock** again\n\nThe rock cycle has no beginning or end — it is a continuous process.\n\n### Weathering and Erosion\n\n**Weathering** is the breaking down of rocks by natural forces:\n- **Physical weathering** — rocks crack due to temperature changes, ice, wind, or water (e.g., rocks splitting in the Drakensberg due to freezing and thawing)\n- **Chemical weathering** — rainwater (slightly acidic) dissolves minerals in rocks (e.g., the Cango Caves in the Western Cape were formed by chemical weathering of limestone)\n- **Biological weathering** — plant roots grow into cracks and break rocks apart\n\n**Erosion** is the movement of weathered rock material by water, wind, ice, or gravity.'),
  q(5, 'Which type of rock can contain fossils?',
    ['Igneous', 'Sedimentary', 'Metamorphic', 'All types'], 1,
    'Only sedimentary rocks can contain fossils. Fossils form when dead organisms are buried in layers of sediment, which is then compressed into rock. Igneous rocks form from molten rock (too hot for fossils) and metamorphic rocks are changed by extreme heat and pressure (which destroys fossils).'),
  q(6, 'What type of rock is Table Mountain in Cape Town made of?',
    ['Granite', 'Marble', 'Sandstone', 'Basalt'], 2,
    'Table Mountain is made of sandstone — a sedimentary rock formed from layers of sand that were deposited over 500 million years ago. You can clearly see the horizontal layers (strata) in the cliff faces of Table Mountain.'),
  t(7, '### Soil Formation\n\nSoil is formed from the weathering of rocks over very long periods of time. Soil is a mixture of:\n- **Mineral particles** — from broken-down rock (sand, silt, clay)\n- **Organic matter (humus)** — decomposed plant and animal material\n- **Water** — fills spaces between particles\n- **Air** — fills spaces between particles\n- **Living organisms** — earthworms, insects, bacteria, fungi\n\n### Types of Soil\n\n| Soil Type | Particle Size | Properties | Water Drainage |\n|-----------|--------------|------------|----------------|\n| Sandy soil | Large particles | Gritty, loose | Drains quickly (water passes through fast) |\n| Clay soil | Very small particles | Sticky when wet, hard when dry | Drains slowly (holds water) |\n| Loam soil | Mix of sand, silt, clay | Best for growing plants | Drains moderately well |\n\n**Loam** is the best soil for farming because it holds enough water for plants but also drains well enough to prevent waterlogging. Many farming areas in South Africa (like the Boland and KwaZulu-Natal) have loam-rich soils.'),
  fb(8, 'Soil is formed from the ___ of rocks over long periods. The best type of soil for farming is ___ because it holds water but also drains well.',
    ['weathering', 'loam'],
    'Weathering (physical, chemical, and biological) breaks rocks down into smaller and smaller particles over thousands of years. Loam soil is a mixture of sand, silt, and clay, combined with organic matter, making it ideal for plant growth.'),
  q(9, 'What is soil erosion, and why is it a problem in South Africa?',
    ['Soil erosion is when soil gains nutrients', 'Soil erosion is the removal of topsoil by wind and water, which reduces farmland productivity', 'Soil erosion only happens in deserts', 'Soil erosion makes soil more fertile'], 1,
    'Soil erosion is the washing or blowing away of the top layer of soil by water and wind. It is a serious problem in South Africa, particularly in overgrazed areas and places with poor vegetation cover. Erosion removes the fertile topsoil, reducing the land\'s ability to grow crops and causing dongas (gullies).'),
  t(10, '### Soil Erosion in South Africa\n\nSoil erosion is a major environmental problem in South Africa. Causes include:\n- **Overgrazing** by livestock — removes plant cover that holds soil in place\n- **Deforestation** — cutting down trees exposes soil to wind and rain\n- **Poor farming practices** — ploughing up and down slopes allows water to wash soil away\n- **Construction** — removing vegetation for building\n\nEffects of erosion:\n- Loss of fertile topsoil → poor crop growth\n- Formation of **dongas** (deep gullies) in the Eastern Cape and KwaZulu-Natal\n- Silt fills up rivers and dams, reducing water supply\n\nPrevention:\n- Plant ground cover and trees\n- Build terraces on slopes\n- Practise crop rotation\n- Avoid overgrazing — rotate livestock between camps\n\n### Summary\n\n- Three types of rocks: igneous (from cooled magma), sedimentary (from compressed layers), metamorphic (changed by heat and pressure).\n- The rock cycle describes how rocks change from one type to another.\n- Soil forms from weathered rock mixed with organic matter, water, and air.\n- Loam soil is best for farming; sandy soil drains too fast; clay soil drains too slowly.\n- Soil erosion is a serious problem in South Africa caused by overgrazing, deforestation, and poor farming.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// DB INSERTION
// ═══════════════════════════════════════════════════════════════════════════════
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 6
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 6/i, schoolId: SCHOOL_ID });
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
    tags: ['grade-6', 'natural-sciences', 'caps'],
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
      title: 'Chapter 1: Photosynthesis',
      description: 'What plants need to make food, chlorophyll, carbon dioxide + water + sunlight → glucose + oxygen, importance for food chains.',
      order: 1,
      lessons: [
        { title: 'Photosynthesis', description: 'How plants make food through photosynthesis, the role of chlorophyll and stomata, the photosynthesis equation, the link to food chains, and investigating photosynthesis with the iodine test.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Nutrients in Food',
      description: 'Food groups (carbohydrates, proteins, fats, vitamins, minerals, water, fibre), balanced diet, food labels, malnutrition in SA context.',
      order: 2,
      lessons: [
        { title: 'Nutrients in Food', description: 'The seven nutrient groups and their functions, energy-giving vs body-building vs protective nutrients, balanced diet, reading food labels, malnutrition in South Africa, and food fortification.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Food Processing',
      description: 'Why food is processed, methods (drying, salting, canning, freezing, pasteurisation), food preservation, designing food packaging.',
      order: 3,
      lessons: [
        { title: 'Food Processing', description: 'Why we process food, causes of food spoilage (microorganisms), methods of food processing (drying, salting, smoking, canning, freezing, pasteurisation), food packaging materials, and environmental impact.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Ecosystems',
      description: 'What is an ecosystem, habitats, food chains, food webs, producers/consumers/decomposers, SA biomes (fynbos, grassland, savanna, Karoo).',
      order: 4,
      lessons: [
        { title: 'Ecosystems and Food Chains', description: 'What an ecosystem is, biotic and abiotic factors, habitats, South African biomes (fynbos, grassland, savanna, Karoo, forest), food chains, producers, consumers, and decomposers.', blocks: ch4_lesson1, term: 2 },
        { title: 'Food Webs and Ecosystem Balance', description: 'Food webs and interconnected food chains, ecosystem balance, natural and human-caused changes to ecosystems, the role of decomposers, and conservation in South Africa.', blocks: ch4_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Solids, Liquids, and Gases',
      description: 'States of matter, properties, melting, freezing, boiling, evaporation, condensation, water cycle.',
      order: 5,
      lessons: [
        { title: 'Solids, Liquids, and Gases', description: 'The three states of matter and their properties, the particle model of matter, changing states (melting, freezing, boiling, evaporation, condensation), melting and boiling points of water, and the water cycle.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Mixtures',
      description: 'Types of mixtures, dissolving, soluble/insoluble, separating mixtures (sieving, filtering, evaporation, magnetism).',
      order: 6,
      lessons: [
        { title: 'Mixtures', description: 'What a mixture is, dissolving (solute, solvent, solution), soluble and insoluble substances, and separating mixtures using sieving, filtering, evaporation, and magnetism.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Systems for Moving Things',
      description: 'Levers, pulleys, gears, linkages, how they work, designing a system that uses movement.',
      order: 7,
      lessons: [
        { title: 'Systems for Moving Things', description: 'Simple machines (levers, pulleys, gears, linkages), how each type works, changing force, speed, and direction, and the design process for building a model.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Electric Circuits',
      description: 'Series circuits, components (cell, switch, bulb, wire), conductors and insulators, circuit diagrams, open/closed circuits.',
      order: 8,
      lessons: [
        { title: 'Electric Circuits', description: 'What an electric circuit is, components (cell, wire, switch, bulb), circuit diagrams and symbols, open and closed circuits, and series circuits.', blocks: ch8_lesson1, term: 3 },
        { title: 'Conductors, Insulators, and Circuit Applications', description: 'Conductors and insulators, testing materials, electrical safety, the effect of adding cells and bulbs, and practical circuit-building activities.', blocks: ch8_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Energy and Electricity',
      description: 'Sources of energy (coal, solar, wind, hydro), Eskom and SA\'s electricity, saving electricity, renewable vs non-renewable.',
      order: 9,
      lessons: [
        { title: 'Energy and Electricity', description: 'What energy is, renewable and non-renewable energy sources, how coal power stations work, Eskom and load shedding, saving electricity, and renewable energy projects in South Africa.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: The Solar System',
      description: 'Planets, the Sun, moons, orbits, day/night, seasons, telescopes, SA astronomy (SALT, SKA).',
      order: 10,
      lessons: [
        { title: 'The Solar System', description: 'The Sun and eight planets, inner vs outer planets, day and night (Earth\'s rotation), seasons (Earth\'s tilted axis and revolution), and South African astronomy (SALT, SKA).', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: The Earth and the Moon',
      description: 'Earth\'s rotation and revolution, phases of the moon, tides, eclipses.',
      order: 11,
      lessons: [
        { title: 'The Earth and the Moon', description: 'Earth\'s rotation and revolution, the Moon\'s orbit, phases of the Moon, tides (spring and neap), and solar and lunar eclipses.', blocks: ch11_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 12: Rocks and Soil',
      description: 'Types of rocks (igneous, sedimentary, metamorphic), rock cycle, soil formation, soil types, soil erosion in SA.',
      order: 12,
      lessons: [
        { title: 'Rocks and Soil', description: 'Three types of rocks (igneous, sedimentary, metamorphic), the rock cycle, weathering and erosion, soil formation, soil types (sandy, clay, loam), and soil erosion in South Africa.', blocks: ch12_lesson1, term: 4 },
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
    title: 'Grade 6 Natural Sciences \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Life and Living (photosynthesis, nutrients in food, ecosystems, food chains and food webs), Matter and Materials (solids, liquids, and gases, mixtures and separation methods), Technology (food processing, systems for moving things), Energy and Change (electric circuits, conductors and insulators, energy and electricity), and Planet Earth and Beyond (the solar system, the Earth and the Moon, rocks and soil) for the Grade 6 Natural Sciences and Technology curriculum.',
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
  console.log('  TEXTBOOK: Grade 6 Natural Sciences');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
