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
// CHAPTER 1: Photosynthesis and Respiration (Term 1 — Life and Living)
// =============================================================================
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Photosynthesis\n\n### Why Living Things Need Energy\n\nAll living organisms need energy to carry out life processes such as growth, movement, and reproduction. In an ecosystem, interactions and interdependence are driven by the need for energy to sustain life.\n\nThe **Sun** is the most important source of energy. It provides energy in the form of light and heat.\n\n### What Is Photosynthesis?\n\n**Photosynthesis** is the process by which green plants use sunlight, carbon dioxide, and water to produce glucose (food) and oxygen. This process takes place in the **chloroplasts** of plant cells, which contain a green pigment called **chlorophyll**.\n\n**Word equation:**\n\ncarbon dioxide + water → glucose + oxygen\n\n(using chlorophyll and sunlight)\n\n**Requirements for photosynthesis:**\n- **Carbon dioxide** — from the air, absorbed through tiny pores called stomata on the leaves\n- **Water** — from the soil, absorbed by the roots and transported to the leaves\n- **Sunlight** — the energy source, absorbed by chlorophyll in the chloroplasts\n- **Chlorophyll** — the green pigment in leaves that absorbs light energy'),
  q(2, 'Where does photosynthesis take place inside a plant cell?',
    ['In the nucleus', 'In the mitochondria', 'In the chloroplasts', 'In the cell wall'], 2,
    'Photosynthesis occurs in the chloroplasts, which are organelles found only in plant cells. Chloroplasts contain chlorophyll, the green pigment that absorbs sunlight energy needed for photosynthesis.'),
  t(3, '### Products of Photosynthesis\n\nThe products of photosynthesis are:\n\n- **Glucose** — a sugar that provides the plant with energy and building materials. Plants change glucose into starch, cellulose, and other chemical compounds to enable processes such as growth and reproduction.\n- **Oxygen** — released into the air as a by-product. This oxygen is essential for the survival of most living organisms, including humans.\n\n### Testing for Photosynthesis\n\nWe can test whether a leaf has been photosynthesising by testing for the presence of **starch** (because glucose is converted to starch for storage).\n\n**Iodine test for starch:**\n- Iodine solution is normally brown/yellow.\n- When iodine is added to a leaf that contains starch, it turns **blue-black**.\n- If no starch is present, the iodine stays brown/yellow.\n\n**Investigating which leaves photosynthesise:**\nYou can test different parts of a variegated leaf (a leaf with green and white parts). The green parts contain chlorophyll and will test positive for starch. The white parts lack chlorophyll and will not.'),
  fb(4, 'During photosynthesis, plants use carbon dioxide and ___ to produce glucose and ___.',
    ['water', 'oxygen'],
    'Photosynthesis requires carbon dioxide (from the air) and water (from the soil), along with sunlight energy absorbed by chlorophyll. The products are glucose (food for the plant) and oxygen (released into the atmosphere).'),
  q(5, 'A learner tests a leaf with iodine solution. The iodine turns blue-black. What does this indicate?',
    ['The leaf contains chlorophyll', 'The leaf contains water', 'The leaf contains starch', 'The leaf is dead'], 2,
    'The iodine test is used to detect starch. When iodine solution comes into contact with starch, it changes from brown/yellow to blue-black. The presence of starch indicates that photosynthesis has occurred, since glucose is stored as starch.'),
  t(6, '## Respiration\n\n### What Is Respiration?\n\n**Respiration** is the process by which all living organisms release energy from food (glucose). This process takes place in all living cells, in the **mitochondria**.\n\nFood contains energy (potential energy). This energy can be released from food by a series of chemical reactions. This process is called respiration.\n\n**Word equation:**\n\nglucose + oxygen → energy + carbon dioxide + water\n\n### Key Facts About Respiration\n\n- Respiration happens in **all living organisms** — plants, animals, fungi, and bacteria.\n- It occurs **24 hours a day**, whether it is light or dark.\n- Respiration takes place in the **mitochondria** of cells.\n- It releases the **energy** stored in glucose.\n- The waste products are **carbon dioxide** and **water**.\n\n### Does Your Breath Contain Carbon Dioxide?\n\nYou can test whether exhaled air contains carbon dioxide by breathing through a straw into **limewater** (calcium hydroxide solution). If CO₂ is present, the limewater turns **milky/cloudy**. This confirms that respiration produces carbon dioxide.'),
  q(7, 'In which organelle does respiration take place?',
    ['Chloroplasts', 'Nucleus', 'Mitochondria', 'Vacuole'], 2,
    'Respiration occurs in the mitochondria of all living cells. The mitochondria are often called the "powerhouses" of the cell because they release energy from glucose through a series of chemical reactions.'),
  fb(8, 'During respiration, glucose and oxygen react to release ___, carbon dioxide, and water. Breathing into limewater makes it turn ___ because of the carbon dioxide in exhaled air.',
    ['energy', 'milky'],
    'Respiration breaks down glucose using oxygen to release energy for life processes. Carbon dioxide is a waste product. Limewater (calcium hydroxide solution) turns milky or cloudy when carbon dioxide is bubbled through it — this is a standard test for CO₂.'),
  t(9, '### Comparing Photosynthesis and Respiration\n\nPhotosynthesis and respiration are closely linked but opposite processes:\n\n| Feature | Photosynthesis | Respiration |\n|---------|---------------|-------------|\n| Occurs in | Chloroplasts (plants only) | Mitochondria (all living cells) |\n| Requires | CO₂, water, sunlight | Glucose, oxygen |\n| Produces | Glucose, oxygen | Energy, CO₂, water |\n| When | Only during the day (light) | All day and night (24 hours) |\n| Which organisms | Green plants only | All living organisms |\n| Energy | Absorbs light energy | Releases chemical energy |\n\n**Important:** Plants carry out **both** photosynthesis and respiration. During the day, plants photosynthesise and respire at the same time. At night, only respiration occurs because there is no sunlight for photosynthesis.'),
  q(10, 'Which statement correctly compares photosynthesis and respiration?',
    ['Photosynthesis occurs in all living cells; respiration only in plants', 'Photosynthesis uses oxygen; respiration produces oxygen', 'Photosynthesis absorbs energy from sunlight; respiration releases energy from glucose', 'Both processes only occur during the day'], 2,
    'Photosynthesis absorbs light energy to build glucose from CO₂ and water. Respiration releases chemical energy stored in glucose. They are essentially reverse processes. Photosynthesis only occurs in the light, but respiration occurs continuously — day and night.'),
];

// =============================================================================
// CHAPTER 2: Interactions and Interdependence within the Environment
//            (Term 1 — Life and Living)
// =============================================================================
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Ecology and Ecosystems\n\n### Introduction to Ecology\n\n**Ecology** is the study of the interactions of organisms with one another and with the physical and chemical environment.\n\nScientists classify the study of ecological interactions into four levels:\n1. **Populations** — a group of organisms of the same species living in the same area\n2. **Communities** — all the different populations living together in one area\n3. **Ecosystems** — a community of living organisms together with their non-living environment\n4. **The biosphere** — all the ecosystems on Earth combined\n\n### What Is an Ecosystem?\n\nAn **ecosystem** consists of an ecological community that includes all living organisms (biotic) such as plants and animals, together with the non-living (abiotic) environment such as temperature, wind, water, and soil, interacting as a system.\n\n- The size of an ecosystem is not specifically defined — it can be as small as a rock pool or as large as the entire planet.\n- Ecosystems are defined by the network of interactions among organisms, and between organisms and their environment.\n- The survival of individual organisms and populations depends on its ability to cope with changes (adapt) in its habitat.'),
  q(2, 'Which of the following is an abiotic (non-living) component of an ecosystem?',
    ['A tree', 'A fungus', 'Temperature', 'A bacterium'], 2,
    'Abiotic factors are the non-living physical and chemical components of an ecosystem. These include temperature, water, sunlight, wind, soil, and minerals. Biotic factors are living things such as plants, animals, fungi, and bacteria.'),
  t(3, '### Feeding Relationships\n\n**Producers, consumers, and decomposers** play specific roles in an ecosystem:\n\n- **Producers** — plants that make their own food through photosynthesis. They are the source of energy in the ecosystem.\n- **Consumers** — animals that obtain food by eating other organisms:\n  - **Herbivores** — eat plants only (e.g., cows, horses, impala)\n  - **Carnivores** — eat other animals (e.g., leopards, eagles). Those that hunt prey are called **predators**.\n  - **Omnivores** — eat both plants and animals (e.g., humans, baboons)\n  - **Scavengers** — eat dead animals (e.g., hyenas, vultures)\n  - **Insectivores** — feed mainly on insects and other small invertebrates (e.g., earthworms)\n- **Decomposers** — break down (decompose) the remains of dead plants and animals, recycling important nutrients in the environment (e.g., bacteria, fungi, earthworms).\n\n**South African examples:**\n- Fynbos ecosystem in the Western Cape\n- Savanna ecosystem in the Kruger National Park\n- Marine ecosystem along the coast'),
  fb(4, 'Plants are called ___ because they make their own food. Organisms that break down dead matter and recycle nutrients are called ___.',
    ['producers', 'decomposers'],
    'Producers (plants) make their own food through photosynthesis, providing the energy base of the ecosystem. Decomposers (bacteria, fungi, earthworms) break down dead organic matter, returning nutrients to the soil so they can be used again.'),
  q(5, 'A leopard hunts and eats an impala. What is the leopard classified as?',
    ['A herbivore and scavenger', 'A carnivore and predator', 'A producer', 'An omnivore and decomposer'], 1,
    'A leopard is a carnivore because it eats other animals. It is also a predator because it actively hunts its prey. Predators are animals that hunt and kill other animals (prey) for food.'),
  t(6, '### Energy Flow: Food Chains and Food Webs\n\nPlants (and algae) play an important role in the ecosystem because they capture energy from the Sun by the process of photosynthesis. This energy is passed along a **food chain** from producers to consumers.\n\n**Food chain example (South African savanna):**\nGrass → Impala → Cheetah → Vulture (scavenger)\n\n- Each stage of a food chain is called a **trophic level**.\n- Energy transfer and energy loss occur at each trophic level. At each level, much energy is lost as heat through respiration.\n- Decomposers are the last link in this transfer of energy — they release energy from dead matter as heat.\n\n**Food webs:**\n- Interlinked food chains together form **food webs**.\n- Food webs show the complex feeding relationships in an ecosystem.\n- Food webs are more realistic than food chains because most organisms eat more than one type of food and are eaten by more than one predator.'),
  q(7, 'In a food chain, what happens to energy at each trophic level?',
    ['Energy increases at each level', 'Energy stays the same at each level', 'Some energy is lost as heat at each level', 'Energy is created at each level'], 2,
    'At each trophic level in a food chain, energy is lost — mainly as heat through respiration. This is why food chains rarely have more than four or five levels: there is not enough energy left to sustain higher-level consumers.'),
  t(8, '### Energy Pyramids\n\nAn **energy pyramid** shows the amount of energy available at each trophic level in a food chain.\n\n- The base of the pyramid is always the **producers** (the most energy).\n- Each level above has less energy than the level below.\n- This is because organisms at each level use energy for their own life processes (respiration), so only a fraction of energy is passed to the next level.\n\n**Example:**\n- Producers (grass): 10 000 kJ\n- Primary consumers (impala): 1 000 kJ\n- Secondary consumers (cheetah): 100 kJ\n- Tertiary consumers (vulture): 10 kJ\n\nThis shows that about 90% of energy is lost at each trophic level.'),
  fb(9, 'A food ___ shows the complex feeding relationships in an ecosystem by linking multiple food chains together. About ___% of energy is lost at each trophic level.',
    ['web', '90'],
    'A food web is a network of interconnected food chains that shows all the feeding relationships in an ecosystem. Approximately 90% of energy is lost at each trophic level, mainly as heat from respiration, which is why energy pyramids get narrower at the top.'),
  q(10, 'In a food chain: Grass → Grasshopper → Frog → Snake → Eagle. Which organism is the secondary consumer?',
    ['Grass', 'Grasshopper', 'Frog', 'Eagle'], 2,
    'The frog is the secondary consumer (third trophic level). The grass is the producer, the grasshopper is the primary consumer (it eats the plant), the frog is the secondary consumer (it eats the primary consumer), and the snake is the tertiary consumer.'),
];

blockNum = 0;
const ch2_lesson2 = [
  t(1, '## Balance in Ecosystems\n\n### Carrying Capacity and Balance\n\nAn ecosystem can only accommodate as many organisms as its resources (food, water, and shelter) can carry. If the ecosystem does not remain in balance, it will fail.\n\nThis balance can be disrupted by both **natural** and **human** factors.\n\n**Natural factors that disrupt balance:**\n- Extreme changes in weather and climate patterns\n- Floods, droughts, and sudden temperature changes\n- Natural disasters like volcanic eruptions and wildfires\n\n**Human factors that disrupt balance:**\n- Removing organisms from the ecosystem (e.g., poaching, overfishing)\n- Human-induced pollution (air, water, and soil pollution)\n- Deforestation and habitat destruction\n- Introduction of alien (invasive) species\n\nThese factors can contribute to an imbalance in an ecosystem, seriously impacting its components and altering its nature.'),
  q(2, 'Which of the following is a HUMAN factor that can disrupt the balance of an ecosystem?',
    ['A flood', 'A drought', 'Poaching of animals', 'A volcanic eruption'], 2,
    'Poaching is a human activity that removes organisms from ecosystems, disrupting the balance of populations. Natural factors like floods, droughts, and volcanic eruptions are not caused by human actions (though climate change may increase their frequency).'),
  t(3, '### Adaptations\n\n**Adaptation** is the change in the structural, functional, and behavioural characteristics of an organism that allows it to survive in its environment.\n\n- Adaptations allow an organism to cope with changing conditions within the environment.\n- Organisms that are unable to adapt to changes within the environment die out (become **extinct**).\n\n**Examples of adaptations in South African organisms:**\n- **Protea plants** in the fynbos have thick, leathery leaves to reduce water loss and survive in dry, windy conditions.\n- **Springbok** can survive without water for long periods, getting moisture from the plants they eat.\n- **Aloe plants** store water in their thick, fleshy leaves to survive droughts in the Karoo.\n- **Leopards** have spotted coats for camouflage in the bushveld.\n\n**Types of adaptations:**\n- **Structural** — physical features (e.g., thick skin, long roots, camouflage)\n- **Functional** — body processes (e.g., ability to regulate temperature)\n- **Behavioural** — actions (e.g., migration, hibernation, nocturnal hunting)'),
  fb(4, 'A change in the structural, functional, or behavioural characteristics of an organism that helps it survive is called an ___. Organisms that cannot adapt to environmental changes may become ___.',
    ['adaptation', 'extinct'],
    'Adaptations are features or behaviours that have evolved over time to help organisms survive in their particular environment. Extinction occurs when a species can no longer survive because it cannot adapt to changing conditions.'),
  t(5, '### Conservation of Ecosystems\n\nEnvironmentalists and others work toward managing ecosystems to maintain their balance. Conservation efforts in South Africa include:\n\n- **Control of alien vegetation** — removing invasive plant species like black wattle, Port Jackson willow, and water hyacinth that threaten indigenous species\n- **Preservation of wetlands** — wetlands act as natural water filters and flood buffers\n- **Protected areas** — national parks and nature reserves (e.g., Kruger National Park, Table Mountain National Park, iSimangaliso Wetland Park)\n- **Endangered species programmes** — breeding programmes for rhinos, African wild dogs, and other threatened species\n\n**Individuals can contribute to conservation by:**\n- Recycling waste materials\n- Reusing items instead of throwing them away\n- Appropriate waste disposal (not littering or dumping)\n- Reducing water and energy consumption\n- Planting indigenous trees and gardens\n- Reporting poaching and illegal dumping'),
  q(6, 'Why is it important to remove alien (invasive) plant species from South African ecosystems?',
    ['They are prettier than indigenous plants', 'They use too little water', 'They outcompete indigenous species and threaten biodiversity', 'They attract too many animals'], 2,
    'Alien invasive species often grow faster and outcompete indigenous plants for resources like water, sunlight, and space. They threaten South Africa\'s unique biodiversity. The Working for Water programme removes invasive species and creates jobs.'),
  q(7, 'Which of the following correctly describes the relationship between a predator and its prey?',
    ['Both organisms benefit from the interaction', 'The predator hunts and kills the prey for food', 'The prey feeds on the predator', 'They share food equally'], 1,
    'A predator-prey relationship is one where the predator hunts and kills the prey for food. Examples include cheetahs (predator) and springbok (prey). This interaction helps regulate population sizes in ecosystems.'),
  t(8, '### Evaluating Ecosystem Disruptions\n\nWhen evaluating disruptions to an ecosystem, consider:\n\n**Causes** — What caused the disruption? Was it natural or human-induced?\n\n**Effects** — What are the consequences for the organisms and the environment?\n\n**Solutions** — What can be done to restore balance?\n\n**Case study: Overfishing along the South African coast**\n- **Cause:** Commercial fishing fleets catching too many fish, especially abalone and line fish.\n- **Effects:** Fish populations decline, affecting the entire marine food web. Predators like seals, sharks, and seabirds lose their food source. Communities that depend on fishing lose their livelihood.\n- **Solutions:** Fishing quotas, marine protected areas (like Tsitsikamma), fishing seasons, and anti-poaching patrols.\n\n**Practical activity idea:**\nIdentify a food chain or food web in or near the school grounds. Draw the food web and describe the types of interactions between organisms.'),
  fb(9, 'In the Kruger National Park, lions are ___ that hunt zebras and other animals. This predator-prey relationship helps regulate ___ sizes in the ecosystem.',
    ['predators', 'population'],
    'Predators like lions help maintain balance by controlling the population sizes of prey species like zebras. Without predators, prey populations could grow too large and overgraze the vegetation, leading to ecosystem collapse.'),
  q(10, 'A new dam is built on a river in KwaZulu-Natal. Which of the following is a likely effect on the downstream ecosystem?',
    ['More water flows downstream', 'Fish populations increase', 'The flow of water and nutrients downstream is reduced', 'The river becomes wider'], 2,
    'Dams reduce the flow of water and nutrients downstream, which can disrupt aquatic ecosystems. Fish migration routes may be blocked, wetlands may dry out, and less sediment reaches the coast. Environmental impact assessments must be done before building dams.'),
];

// =============================================================================
// CHAPTER 3: Micro-organisms (Term 1 — Life and Living)
// =============================================================================
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Micro-organisms\n\n### What Are Micro-organisms?\n\n**Micro-organisms** are living things that are too small to see with the naked eye. They can only be seen under a **microscope**.\n\nThere are several types of micro-organisms:\n\n| Type | Features | Examples |\n|------|----------|----------|\n| **Viruses** | Not truly living; need a host cell to reproduce; extremely small | HIV, influenza virus, COVID-19 |\n| **Bacteria** | Single-celled organisms; some are helpful, some cause disease | TB bacteria, E. coli |\n| **Protists** | Single-celled organisms, usually larger than bacteria | Plasmodium (causes malaria), amoeba |\n| **Fungi** | Can be single-celled (yeast) or multicellular (mushrooms, moulds) | Yeast, bread mould, mushrooms |\n\n### Harmful Micro-organisms\n\nSome micro-organisms cause diseases. These disease-causing organisms are called **pathogens**.\n\n**Examples of diseases caused by micro-organisms in South Africa:**\n- **Tuberculosis (TB)** — caused by bacteria; spread through the air when an infected person coughs or sneezes\n- **HIV/AIDS** — caused by a virus (HIV); spread through bodily fluids\n- **Malaria** — caused by a protist (Plasmodium); spread by mosquito bites\n- **Cholera** — caused by bacteria; spread through contaminated water\n- **Diarrhoea** — often caused by bacteria or viruses in unclean water'),
  q(2, 'Which type of micro-organism needs a host cell to reproduce?',
    ['Bacteria', 'Fungi', 'Viruses', 'Protists'], 2,
    'Viruses are not truly living organisms because they cannot reproduce on their own. They must invade a host cell and use the host\'s machinery to make copies of themselves. This is why viral infections are difficult to treat — the virus hides inside cells.'),
  fb(3, 'Micro-organisms that cause disease are called ___. Tuberculosis (TB) is caused by ___ and is spread through the air.',
    ['pathogens', 'bacteria'],
    'Pathogens are micro-organisms that cause disease. TB is caused by the bacterium Mycobacterium tuberculosis and is a major health concern in South Africa. It spreads when an infected person coughs or sneezes, releasing bacteria into the air.'),
  t(4, '### Preventing the Spread of Disease\n\nEffective methods of preventing the spread of diseases caused by micro-organisms include:\n\n- **Washing hands** regularly and thoroughly with soap and water\n- **Sterilising** medical equipment and surfaces\n- **Proper sanitation** — access to clean toilets and proper sewage systems\n- **Clean drinking water** — treating water to remove pathogens\n- **Vaccination** — introducing a weakened or inactive form of a pathogen to build immunity\n- **Wearing protective equipment** — masks, gloves in healthcare settings\n- **Proper food handling** — cooking food thoroughly, refrigerating perishables\n\n**Waterborne diseases** such as cholera and diarrhoea account for many child deaths in South Africa. Access to clean water and proper sanitation are essential for preventing these diseases.\n\n**Louis Pasteur** was a modern scientist who played an important role in identifying and developing cures for some diseases. He demonstrated that micro-organisms cause disease and developed the process of **pasteurisation** to kill harmful bacteria in milk.'),
  q(5, 'Which of the following is the MOST effective way to prevent the spread of waterborne diseases like cholera?',
    ['Taking antibiotics every day', 'Ensuring access to clean drinking water and proper sanitation', 'Wearing warm clothes', 'Eating more fruit'], 1,
    'Waterborne diseases like cholera and diarrhoea are caused by micro-organisms in contaminated water. The most effective prevention is ensuring access to clean, treated drinking water and proper sanitation (toilets and sewage systems).'),
  t(6, '### Useful Micro-organisms\n\nNot all micro-organisms are harmful. Many play essential and beneficial roles:\n\n**In ecosystems:**\n- Micro-organisms (bacteria and fungi) are important **decomposers**. They break down dead plant and animal matter, recycling nutrients back into the soil.\n- Without decomposers, dead matter would accumulate and nutrients would not be returned to the soil for plants to use.\n\n**In food and food-making:**\n- **Yeast** (a fungus) is used in baking bread — it produces carbon dioxide gas, which makes the dough rise.\n- **Yeast** is also used in brewing — it ferments sugars to produce alcohol (ethanol) and carbon dioxide.\n- **Bacteria** are used to make yoghurt from milk (lactic acid bacteria).\n- **Bacteria and fungi** are used in cheese-making.\n\n**In medicine:**\n- **Penicillin** is an antibiotic produced from a fungus (Penicillium). It was discovered by Alexander Fleming and has saved millions of lives.\n- Micro-organisms are used in **biotechnology** and research to produce vaccines, insulin, and other medicines.\n\n**In renewable energy:**\n- **Biogas** can be produced from the decomposition of organic waste by bacteria. This is a form of alternative, renewable energy.'),
  q(7, 'Which micro-organism is used in baking to make bread dough rise?',
    ['Bacteria', 'Viruses', 'Yeast (a fungus)', 'Protists'], 2,
    'Yeast is a single-celled fungus used in baking. When yeast ferments sugars in the dough, it produces carbon dioxide gas, which creates bubbles that make the dough rise. Yeast also produces a small amount of alcohol, which evaporates during baking.'),
  fb(8, 'The antibiotic ___ was discovered by Alexander Fleming and is produced from a fungus. Micro-organisms that decompose dead matter help recycle ___ back into the soil.',
    ['penicillin', 'nutrients'],
    'Penicillin was the first antibiotic to be discovered (1928) and revolutionised medicine. Decomposer micro-organisms break down dead organic matter, releasing nutrients like nitrogen, phosphorus, and carbon back into the soil for plants to absorb.'),
  q(9, 'Why are decomposer micro-organisms important in an ecosystem?',
    ['They cause disease in animals', 'They produce food for humans', 'They break down dead matter and recycle nutrients back into the soil', 'They absorb sunlight for photosynthesis'], 2,
    'Decomposer micro-organisms (bacteria and fungi) play a vital role by breaking down dead organisms and waste material. This releases nutrients back into the soil, making them available for plants to absorb through their roots, completing the nutrient cycle.'),
  q(10, 'Indigenous knowledge includes the use of fermentation. What is an example of fermentation used in South Africa?',
    ['Making bricks from clay', 'Brewing traditional beer (umqombothi) using yeast', 'Weaving baskets from grass', 'Building houses from wood'], 1,
    'Traditional brewing of umqombothi (African traditional beer) uses yeast fermentation. Yeast converts sugars from sorghum and maize into alcohol (ethanol) and carbon dioxide. This is an example of indigenous knowledge using micro-organisms.'),
];

// =============================================================================
// CHAPTER 4: Introduction to the Periodic Table (Term 2 — Matter and Materials)
// =============================================================================
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## The Periodic Table of Elements\n\n### Arrangement of Elements\n\nThe **Periodic Table of Elements** is a classification system for all the elements which make up matter and materials in the world. An element is a pure substance which cannot be broken down further by chemical means.\n\nThe Periodic Table was devised by **Dmitri Mendeleev** in the 1860s. He arranged the elements according to their properties in a table format.\n\n**Three main categories:**\n- **Metals** — arranged on the left-hand side of the table\n- **Non-metals** — found on the far-right hand side of the table\n- **Semi-metals (metalloids)** — found in the region between metals and non-metals\n\n**Each element has:**\n- Its own **name**\n- Its own **symbol** (one or two letters, e.g., Fe for iron, Na for sodium)\n- An **atomic number** — the number of protons in the nucleus\n- A **position** on the Periodic Table\n\n### First 20 Elements\n\nLearners should be able to identify the names and symbols of the first 20 elements of the Periodic Table. You do NOT need to memorise the atomic number of each element — the table provides this.'),
  q(2, 'Who devised the Periodic Table of Elements in the 1860s?',
    ['Isaac Newton', 'Albert Einstein', 'Dmitri Mendeleev', 'Louis Pasteur'], 2,
    'Dmitri Mendeleev, a Russian chemist, arranged the known elements in a table according to their properties in the 1860s. He even predicted the existence and properties of elements that had not yet been discovered.'),
  t(3, '### Properties of Metals, Semi-Metals, and Non-Metals\n\n**Some properties of metals:**\n- Usually shiny and lustrous\n- Ductile (can be drawn into wires) and malleable (can be hammered into shape)\n- Solid at room temperature (except mercury, which is liquid)\n- Good conductors of heat and electricity\n- Have high melting and boiling points\n\n**Some properties of non-metals:**\n- Have a variety of properties depending on whether they are solids or gases\n- Non-metal solids are usually brittle and dull\n- Non-metal gases include oxygen, nitrogen, and chlorine\n- Poor conductors of heat and electricity (insulators)\n\n**Semi-metals (metalloids):**\n- Have some properties of metals and some properties of non-metals\n- Examples include silicon and germanium\n- Silicon is used in making computer chips because it is a **semiconductor** — it can conduct electricity under certain conditions'),
  fb(4, 'Metals are generally good conductors of heat and ___. Semi-metals like silicon are used in computer chips because they are ___.',
    ['electricity', 'semiconductors'],
    'Metals conduct heat and electricity well because their electrons can move freely. Semi-metals (metalloids) like silicon have intermediate conductivity — they are semiconductors, meaning they conduct under certain conditions, making them ideal for electronic components.'),
  q(5, 'Which of the following is a property of non-metals?',
    ['They are all shiny and lustrous', 'They are good conductors of electricity', 'They are generally poor conductors of heat and electricity', 'They can be hammered into sheets'], 2,
    'Non-metals are generally poor conductors of heat and electricity (they are insulators). Non-metal solids tend to be brittle and dull, unlike metals which are shiny, ductile, and malleable.'),
  t(6, '### Elements, Atoms, and Building Blocks\n\n**Atoms — the building blocks of matter:**\n- All matter is made up of tiny particles called **atoms**.\n- An **element** is a substance made up of atoms of only **one kind**. For example, all the atoms of copper are identical.\n- An element cannot be broken down into two or more substances by chemical means. An element cannot be changed into another element by a chemical reaction.\n- Atoms of one element differ from atoms of all other elements.\n- All known elements are listed on the Periodic Table of Elements.\n\n**Some elements form diatomic molecules:**\nSome elements on the Periodic Table form molecules made of **two atoms** bonded together. These are called diatomic molecules:\n- Hydrogen (H₂)\n- Nitrogen (N₂)\n- Oxygen (O₂)\n- Chlorine (Cl₂)\n\nSometimes atoms react together chemically to form molecules of compounds, such as water (H₂O) and carbon dioxide (CO₂).'),
  q(7, 'What is a diatomic molecule?',
    ['A molecule made of one atom', 'A molecule made of two atoms of the same element', 'A molecule made of two different elements', 'A molecule made of three atoms'], 1,
    'A diatomic molecule consists of two atoms of the same element bonded together. Examples include H₂ (hydrogen gas), O₂ (oxygen gas), and N₂ (nitrogen gas). These elements exist naturally as diatomic molecules rather than single atoms.'),
  fb(8, 'All matter is made up of tiny particles called ___. An element is a pure substance made up of only ___ kind of atom.',
    ['atoms', 'one'],
    'Atoms are the basic building blocks of all matter. An element is a pure substance consisting of only one type of atom — for example, gold is made up entirely of gold atoms, and oxygen is made up entirely of oxygen atoms.'),
  q(9, 'On the Periodic Table, where are the metals found?',
    ['On the right-hand side', 'In the centre only', 'On the left-hand side', 'At the bottom only'], 2,
    'Metals are arranged on the left-hand side of the Periodic Table. Non-metals are found on the far right, and semi-metals (metalloids) are found in the region between metals and non-metals, along a staircase-like line.'),
  q(10, 'Why can an element NOT be broken down into simpler substances by chemical means?',
    ['Because elements are too heavy', 'Because elements are made of only one kind of atom', 'Because elements are always gases', 'Because elements do not react'], 1,
    'An element consists of only one type of atom. Since there is nothing simpler to break it down into (by chemical means), it cannot be decomposed further. You cannot turn gold atoms into other atoms by a chemical reaction.'),
];

// =============================================================================
// CHAPTER 5: Atoms — Sub-Atomic Particles, Compounds, and Mixtures
//            (Term 2 — Matter and Materials)
// =============================================================================
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Atomic Structure\n\n### Sub-Atomic Particles\n\nAtoms are made up of smaller sub-atomic particles:\n\n| Particle | Charge | Location |\n|----------|--------|----------|\n| **Proton** | Positive (+) | In the nucleus |\n| **Neutron** | Neutral (no charge) | In the nucleus |\n| **Electron** | Negative (−) | Moving around the nucleus |\n\n**The nucleus:**\n- The central region of the atom is called the **nucleus**.\n- The nucleus is made up of positively charged **protons** and neutral particles called **neutrons**.\n- The nucleus is very small compared to the overall size of the atom.\n\n**Electrons:**\n- Negatively charged **electrons** move around the nucleus in specific energy levels (shells).\n- Electrons are much smaller and lighter than protons and neutrons.\n\n**Atoms are neutral:**\n- Atoms are neutral because the number of negatively charged electrons is equal to the number of positively charged protons.\n- For example, a carbon atom has 6 protons and 6 electrons, so the charges balance out.'),
  q(2, 'Why is an atom electrically neutral?',
    ['Because it has no charged particles', 'Because the number of protons equals the number of electrons', 'Because neutrons cancel out all charges', 'Because electrons have no charge'], 1,
    'An atom is electrically neutral because it has an equal number of positively charged protons and negatively charged electrons. The positive and negative charges balance each other out, resulting in a net charge of zero.'),
  fb(3, 'The nucleus of an atom contains protons and ___. Negatively charged ___ move around the nucleus.',
    ['neutrons', 'electrons'],
    'The nucleus (centre of the atom) contains protons (positive charge) and neutrons (no charge). Electrons (negative charge) orbit the nucleus in energy levels or shells. The atom is neutral because the number of protons equals the number of electrons.'),
  t(4, '### Pure Substances — Elements and Compounds\n\n**Pure substances** include both elements and compounds.\n\n**Elements:**\n- A pure substance made of atoms of only one kind.\n- Examples: hydrogen (H), oxygen (O), carbon (C), sodium (Na), chlorine (Cl)\n- All known elements are listed on the Periodic Table.\n- They are limited in number and are the building blocks of millions of compounds.\n\n**Compounds:**\n- A compound is a material that consists of atoms of **two or more different elements** chemically bonded together.\n- Examples: water (H₂O), carbon dioxide (CO₂), salt (NaCl)\n- The atoms in a compound are always combined in a **fixed ratio** — for example, in water, the ratio is always two hydrogen atoms to one oxygen atom.\n- A **chemical bond** is the force that holds atoms together in a compound.\n- Compounds are formed by **chemical reactions** and can be broken down in a **decomposition reaction**.'),
  q(5, 'What is the difference between an element and a compound?',
    ['An element contains two types of atoms; a compound contains one', 'An element contains one type of atom; a compound contains two or more types chemically bonded', 'There is no difference', 'Elements are always gases; compounds are always liquids'], 1,
    'An element is made of only one type of atom (e.g., gold contains only gold atoms). A compound contains two or more different types of atoms chemically bonded together in a fixed ratio (e.g., water contains hydrogen and oxygen bonded together).'),
  t(6, '### Compounds — Examples and Decomposition\n\nCompounds such as water (H₂O), carbon dioxide (CO₂), and salt (NaCl) are formed by chemical reactions.\n\n**Decomposition reactions:**\nCompounds can be broken down in a decomposition reaction into other compounds or their original elements.\n\n**Example — Electrolysis of water:**\n- Water (H₂O) can be broken down by **electrolysis** (passing electricity through it).\n- Products: hydrogen gas (H₂) and oxygen gas (O₂)\n\n**Example — Decomposition of copper(II) chloride:**\n- Copper(II) chloride solution can be broken down by electrolysis using electrical energy.\n- Copper metal is deposited on one electrode (cathode).\n- Chlorine gas is formed as bubbles at the other electrode (anode).\n\nThese examples show that compounds are not permanently bonded — they can be separated back into simpler substances by applying energy.'),
  fb(7, 'A compound is made of two or more different elements chemically ___ together. Water can be broken down into hydrogen and oxygen by a process called ___.',
    ['bonded', 'electrolysis'],
    'In a compound, atoms of different elements are held together by chemical bonds. Electrolysis is the process of using electrical energy to decompose (break down) a compound into its constituent elements. For water: 2H₂O → 2H₂ + O₂.'),
  t(8, '### Mixtures of Elements and Compounds\n\nElements and compounds are often found mixed together in nature — for example, in air, sea water, rocks, and in living things.\n\n**Mixtures vs compounds:**\n\n| Feature | Mixture | Compound |\n|---------|---------|----------|\n| Bonding | Not chemically bonded | Chemically bonded |\n| Separation | Separated by physical means | Separated by chemical means |\n| Ratio | Variable proportions | Fixed ratio of atoms |\n| Properties | Retain individual properties | New properties formed |\n\n**Separating mixtures** — physical methods:\n- **Filtration** — separating an insoluble solid from a liquid\n- **Evaporation** — removing water to leave the dissolved solid\n- **Distillation** — separating liquids with different boiling points\n\n**Separating compounds** — chemical methods:\n- **Electrolysis** — using electricity to break bonds\n- **Heating** — thermal decomposition'),
  q(9, 'Which method would you use to separate salt dissolved in water?',
    ['Filtration', 'Using a magnet', 'Evaporation', 'Sieving'], 2,
    'Evaporation is used to separate a dissolved solid from a liquid. By heating the salt water, the water evaporates (turns to gas), leaving the solid salt behind. Filtration would not work because the salt is dissolved (not a separate solid).'),
  q(10, 'Air is a mixture of gases. Why is air classified as a mixture and NOT a compound?',
    ['Because air is invisible', 'Because the gases in air are not chemically bonded and can be separated by physical means', 'Because air contains oxygen', 'Because air is lighter than water'], 1,
    'Air is a mixture because the gases (nitrogen, oxygen, carbon dioxide, argon, etc.) are not chemically bonded together. They retain their individual properties and can be separated by physical means (e.g., fractional distillation). In a compound, atoms are chemically bonded in fixed ratios.'),
];

// =============================================================================
// CHAPTER 6: Particle Model of Matter (Term 2 — Matter and Materials)
// =============================================================================
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## The Particle Model of Matter\n\n### What Is the Particle Model?\n\nThe **particle model of matter** is a scientific theory used to explain that all matter (solids, liquids, and gases) is made up of particles (atoms and molecules).\n\n**Key ideas:**\n- These particles are too small to see — in a drop of water there would be many billions of water particles.\n- The spaces between the particles are **empty** — they do not contain air; they contain nothing.\n- Scientists have evidence that the particles are arranged differently in a solid, a liquid, and a gas.\n\n### Particles in the Three States of Matter\n\n| Property | Solid | Liquid | Gas |\n|----------|-------|--------|-----|\n| Arrangement | Closely packed in a regular pattern | Loosely arranged but still quite close together | No particular arrangement; far apart |\n| Movement | Vibrate around fixed positions | Move quite fast, sliding past each other | Move very fast in all directions |\n| Forces between particles | Strong forces | Weaker forces | Extremely weak forces |\n| Spaces between particles | Small spaces | Small spaces | Very large spaces |\n| Shape | Fixed shape | Takes the shape of the container | Fills the entire container |\n| Volume | Fixed volume | Fixed volume | No fixed volume |'),
  q(2, 'In which state of matter are particles closely packed in a regular arrangement and can only vibrate?',
    ['Liquid', 'Gas', 'Solid', 'Plasma'], 2,
    'In a solid, particles are closely packed in a regular, ordered arrangement. They have strong forces holding them together, so they can only vibrate around fixed positions. This is why solids have a fixed shape and a fixed volume.'),
  fb(3, 'In a gas, particles move very ___ and have ___ weak forces between them.',
    ['fast', 'extremely'],
    'Gas particles move very fast in all directions and are far apart with very large spaces between them. The forces between gas particles are extremely weak, which is why gases have no fixed shape or volume and expand to fill any container.'),
  t(4, '### Change of State\n\nHeating and cooling can cause a material to change state:\n\n**Heating:**\n- **Melting** — solid changes to a liquid when heated\n- **Evaporating/Boiling** — liquid changes to a gas on further heating\n\n**Cooling:**\n- **Condensing** — gas changes to a liquid when cooled\n- **Freezing/Solidifying** — liquid changes to a solid when cooled further\n\n**What happens to particles during change of state:**\n- When a solid material is heated, the movement (vibration) of the particles increases.\n- The particles gain energy, enabling them to move past each other and form a **liquid**.\n- When heated further, the particles move much further apart from each other, forming a **gas**.\n\n**Important:** During a change of state, the **size and number of particles do not change**. Only the **spaces** between the particles and their **movement** change.'),
  q(5, 'When ice melts into water, what happens to the particles?',
    ['The particles get bigger', 'New particles are created', 'The particles gain energy and move past each other', 'The particles disappear and reform'], 2,
    'When ice melts, the particles gain energy from the heat. This increased energy allows them to overcome the strong forces holding them in a fixed position, and they begin to move past each other. The particles themselves do not change in size or number.'),
  t(6, '### Diffusion\n\n**Diffusion** is the process in which particles in liquids and gases move (separate and spread) from a highly concentrated area to an area with a lower concentration of those particles.\n\n**Key facts about diffusion:**\n- Diffusion is faster in **gases** than in **liquids** because gas particles move faster and have more space between them.\n- Diffusion does not occur in solids because the particles are locked in fixed positions.\n\n**Examples of diffusion:**\n- You can smell perfume across a room because perfume particles diffuse through the air.\n- A drop of food colouring spreads throughout a glass of water by diffusion.\n- Tea leaves release colour and flavour into hot water by diffusion.\n\n**In living systems:**\n- Oxygen diffuses from the air into the blood in the lungs.\n- Carbon dioxide diffuses from the blood into the air in the lungs.\n- Nutrients diffuse from the small intestine into the blood.'),
  fb(7, 'Diffusion is the movement of particles from an area of ___ concentration to an area of lower concentration. Diffusion is faster in gases than in ___.',
    ['high', 'liquids'],
    'Diffusion is driven by the random movement of particles from where they are more concentrated to where they are less concentrated. It is faster in gases because gas particles move faster and have larger spaces between them compared to liquid particles.'),
  q(8, 'Why can you smell braai smoke from far away?',
    ['Because the smoke is very hot', 'Because smoke particles diffuse through the air from high to low concentration', 'Because your nose becomes more sensitive outdoors', 'Because wind creates smoke'], 1,
    'The smoke particles diffuse through the air, moving from the area of high concentration (near the braai) to areas of lower concentration (where you are standing). Gas particles move fast, so the smell can travel a significant distance.'),
  t(9, '### Density, Mass, and Volume\n\nThe **density** of a material describes the amount of mass in a given volume of that material.\n\n**Density and states of matter:**\n- In general, **solids** are the most dense (particles closely packed).\n- **Liquids** are less dense than solids.\n- **Gases** are the least dense (particles far apart).\n- **Water is an exception** — ice is less dense than liquid water, which is why ice floats.\n\n**Density of different materials:**\n- Some materials have low density and some have high density.\n- A loaf of bread has a lower density than a clay brick of the same size.\n- The density of a material depends on the kind of particles it is made up of, the size of the spaces between them, and the mass of individual particles.\n\n**A material with lower density will float on a liquid of higher density.** For example, oil (lower density) floats on water (higher density).'),
  q(10, 'Oil floats on water. What does this tell us about the density of oil compared to water?',
    ['Oil is denser than water', 'Oil and water have the same density', 'Oil is less dense than water', 'Oil absorbs water'], 2,
    'When oil floats on water, it means oil has a lower density than water. A material with lower density will float on a liquid of higher density. This is the same reason ice cubes float in your drink — ice is less dense than liquid water.'),
];

blockNum = 0;
const ch6_lesson2 = [
  t(1, '## Expansion, Contraction, and Pressure\n\n### Expansion and Contraction of Materials\n\nSolids, liquids, and gases tend to **expand** when heated and **contract** when cooled.\n\n**The particle explanation:**\n- Particles of liquids and gases are in a state of **constant motion**.\n- When a material is heated, the movement of the particles **increases** and they move further apart — the material **expands**.\n- When a material is cooled, the movement of the particles **decreases** and they move closer together — the material **contracts**.\n\n**Important:** When a material expands or contracts, the **size and number of particles does not change**. It is only the **spaces** between the particles that get bigger or smaller.\n\n**Everyday examples in South Africa:**\n- Railway lines have small gaps between sections to allow for expansion in the hot sun.\n- Bridge joints have expansion gaps.\n- Power lines sag more in summer (heat causes expansion) and are tighter in winter (contraction).\n- A sealed bottle left in a hot car can swell or burst as the gas inside expands.'),
  q(2, 'When a metal rod is heated, it becomes slightly longer. Using the particle model, what happens to the particles?',
    ['The particles grow bigger', 'More particles are created', 'The spaces between the particles increase', 'The particles merge together'], 2,
    'When heated, particles gain energy and vibrate more vigorously, pushing each other further apart. The spaces between particles increase, causing the material to expand. The particles themselves do not change in size — it is the spacing that changes.'),
  fb(3, 'When a material is heated, the particles move further apart and the material ___. When cooled, the spaces between particles get smaller and the material ___.',
    ['expands', 'contracts'],
    'Expansion occurs when heating increases particle movement, pushing particles further apart. Contraction occurs when cooling reduces particle movement, allowing particles to move closer together. The particles themselves do not change size.'),
  t(4, '### Comparing Density in Different States\n\n**Density and states of the same material:**\n- When a substance changes from solid to liquid to gas, its density changes.\n- The **solid state** is generally the densest (particles packed tightly).\n- The **gas state** is the least dense (particles spread far apart).\n\n**Comparing density of different materials:**\n- Objects with the same volume can have different masses (and therefore different densities).\n- A wooden block and a metal block of the same size: the metal block is heavier because metal is denser.\n- A sponge and a polystyrene ball have low density; a steel block has high density.\n\n**Investigation idea:**\nCompare objects with the same volume but different mass (by hand) — sponge, polystyrene, wooden block, and metal block of the same size. The heavier ones have higher density.'),
  q(5, 'A polystyrene ball and a steel ball have the same volume. Which one has greater density?',
    ['The polystyrene ball', 'They have the same density', 'The steel ball', 'It depends on the colour'], 2,
    'The steel ball has greater density because it has more mass packed into the same volume. Density is the amount of mass per unit volume. Steel particles are heavier and more closely packed than polystyrene particles.'),
  t(6, '### Pressure in Gases\n\nA gas exerts **pressure** because of the collisions of the particles with each other and against the sides of the container.\n\n**Increasing pressure:**\n- Pumping more gas into a container increases the number of gas particles. More particles mean more collisions with the walls, which increases the pressure.\n- This is why a bicycle tyre feels firmer when you pump more air into it.\n\n**Temperature and pressure (note — not examined in Grade 8):**\n- Heating a gas increases the pressure because the particles move faster and collide with the walls more often and with greater force.\n- This concept is introduced here for understanding but is developed further in later grades.\n\n**Real-life connections:**\n- Aerosol cans warn against heating because the gas pressure inside could build up and cause an explosion.\n- Car tyres can burst in very hot weather due to increased gas pressure.\n- A weather balloon expands as it rises because atmospheric pressure decreases at higher altitudes.'),
  fb(7, 'Gas particles collide with the walls of their container, creating ___. Pumping more gas into a container increases the number of ___ and therefore increases the pressure.',
    ['pressure', 'particles'],
    'Gas pressure is caused by the countless collisions of gas particles with the walls of their container. The more particles in the container, the more frequent the collisions and the higher the pressure. This is why pumping up a tyre makes it feel firmer.'),
  q(8, 'Why does a sealed plastic bottle sometimes swell when left in a hot car?',
    ['Because the plastic melts', 'Because the gas particles inside move faster and push the walls outward', 'Because water leaks into the bottle', 'Because the label expands'], 1,
    'When the bottle is heated, the gas particles inside gain energy and move faster. They collide more frequently and forcefully with the walls of the bottle, increasing the pressure. This pressure pushes the flexible plastic walls outward, making the bottle swell.'),
  t(9, '### Investigation: Does Material Affect Density?\n\nTo compare the densities of different materials, you can:\n\n1. **Use objects of the same volume** but different materials (e.g., wooden block, polystyrene block, metal block of the same size).\n2. **Hold them in your hand** — the heavier one has greater density.\n3. **Float test** — place different materials in water. Materials less dense than water float; materials denser than water sink.\n\n**Comparing densities of different states:**\nYou can investigate the density of the same material in different states:\n- Sand (solid), flour (solid), water (liquid), and air (gas)\n- Sand and flour are denser than water, and water is denser than air.\n\n**Key learning:** The density of a material depends on:\n- The kind of particles it is made up of\n- The mass of individual particles\n- The size of the spaces between particles'),
  q(10, 'A learner places a wooden block and a metal block of the same size in water. The metal block sinks and the wooden block floats. What does this tell us?',
    ['Wood is heavier than metal', 'Metal is less dense than water', 'Wood is less dense than water and metal is denser than water', 'Both have the same density'], 2,
    'An object floats if it is less dense than the liquid it is placed in, and sinks if it is denser. Since the wooden block floats, wood is less dense than water. Since the metal block sinks, metal is denser than water.'),
];

// =============================================================================
// CHAPTER 7: Chemical Reactions (Term 2 — Matter and Materials)
// =============================================================================
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Chemical Reactions\n\n### Reactants and Products\n\nSubstances can react with each other to form **products** with different chemical properties.\n\n**Key terms:**\n- **Reactants** — the substances that react with one another at the start of a chemical reaction\n- **Products** — the new substances that are produced at the end of a chemical reaction\n\n**In a chemical reaction:**\n- The atoms are **rearranged** to form different products.\n- **No atoms are lost or gained** — they are simply rearranged.\n- Chemical **bonds** in the reactants break, and new bonds form to produce the products.\n- A bond is a force that holds atoms together.\n\n**Word equation format:**\nreactants → products\n\n**Example:**\niron + sulfur → iron sulfide\n\nIn this reaction, iron atoms and sulfur atoms are rearranged and bonded together to form a new compound called iron sulfide, which has different properties from either iron or sulfur.'),
  q(2, 'In a chemical reaction, the starting substances are called:',
    ['Products', 'Compounds', 'Reactants', 'Mixtures'], 2,
    'Reactants are the substances that react together at the start of a chemical reaction. They are changed into products (the new substances formed). In the equation "iron + sulfur → iron sulfide", iron and sulfur are the reactants.'),
  fb(3, 'In a chemical reaction, the starting substances are called ___ and the new substances formed are called ___.',
    ['reactants', 'products'],
    'Reactants are written on the left side of the arrow in a word equation, and products are written on the right side. During the reaction, the atoms of the reactants are rearranged to form the products.'),
  t(4, '### What Happens During a Chemical Reaction?\n\nDuring a chemical reaction:\n1. **Chemical bonds** (the forces holding atoms together) in the **reactants break**.\n2. The atoms are **rearranged** into new combinations.\n3. **New bonds form** to produce the **products**.\n\nThis means that the atoms from the reactants are the same atoms in the products — they have just been rearranged.\n\n**Signs that a chemical reaction has occurred:**\n- A colour change\n- A gas is produced (bubbling/fizzing)\n- A temperature change (heat given off or absorbed)\n- A new substance is formed (precipitate or different material)\n- A change in smell\n\n### Indigenous Knowledge and Chemical Reactions\n\nIndigenous knowledge includes examples of useful chemical reactions:\n- **Fermentation in brewing** — traditional South African beer (umqombothi) is made by fermenting sorghum and maize. Yeast converts sugars into carbon dioxide and ethanol (alcohol). This is a chemical reaction.\n- **Traditional iron smelting** — ancient communities in South Africa heated iron ore with charcoal in clay furnaces. The carbon in charcoal reacted with oxygen in the iron ore, leaving behind iron metal.'),
  q(5, 'Which of the following is a sign that a chemical reaction has taken place?',
    ['The substance dissolves', 'A new substance with different properties is formed', 'The substance is stirred', 'The substance is cut into pieces'], 1,
    'When a chemical reaction occurs, new substances with different properties are formed. Other signs include colour changes, gas production (bubbling), temperature changes, and formation of a precipitate. Dissolving and cutting are physical changes, not chemical reactions.'),
  t(6, '### Examples of Chemical Reactions\n\n**1. Burning (combustion):**\nWhen a candle burns, the wax reacts with oxygen in the air:\nwax + oxygen → carbon dioxide + water\nThis reaction releases energy as heat and light.\n\n**2. Rusting:**\nIron slowly reacts with oxygen and water:\niron + oxygen + water → iron oxide (rust)\nThis is a slow chemical reaction.\n\n**3. Decomposition of hydrogen peroxide:**\nHydrogen peroxide breaks down into water and oxygen gas:\nhydrogen peroxide → water + oxygen\n\n**4. Fermentation:**\nYeast converts sugar into ethanol and carbon dioxide:\nsugar → ethanol + carbon dioxide\n\n**Note:** The concept of chemical reactions is developed further in Grade 9, where you will learn about balanced chemical equations and chemical formulae.'),
  q(7, 'When a candle burns, wax reacts with oxygen. What type of chemical reaction is this?',
    ['Decomposition', 'Fermentation', 'Combustion (burning)', 'Electrolysis'], 2,
    'Burning (combustion) is a chemical reaction in which a substance reacts with oxygen, producing heat and light. When a candle burns, the wax combines with oxygen from the air to form carbon dioxide and water vapour.'),
  fb(8, 'During a chemical reaction, bonds in the reactants ___ and new bonds ___ to produce the products.',
    ['break', 'form'],
    'Chemical reactions involve the breaking of existing bonds in the reactants and the formation of new bonds in the products. The atoms themselves are not created or destroyed — they are rearranged into new combinations.'),
  q(9, 'Traditional South African iron smelting is an example of a chemical reaction. What was heated with the iron ore?',
    ['Sand', 'Water', 'Charcoal (carbon)', 'Salt'], 2,
    'In traditional iron smelting, iron ore was heated with charcoal (carbon) in clay furnaces. The carbon reacted with the oxygen in the iron ore, removing the oxygen and leaving behind iron metal. This indigenous technology dates back hundreds of years in South Africa.'),
  q(10, 'In the reaction: iron + sulfur → iron sulfide, what happens to the iron and sulfur atoms?',
    ['They are destroyed and new atoms are created', 'They disappear completely', 'They are rearranged and bonded together to form a new compound', 'They remain unchanged and separate'], 2,
    'In this chemical reaction, the iron atoms and sulfur atoms are rearranged and chemically bonded together to form a new compound — iron sulfide. No atoms are created or destroyed; they are simply rearranged into a different combination with new properties.'),
];

// =============================================================================
// CHAPTER 8: Static Electricity (Term 3 — Energy and Change)
// =============================================================================
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Static Electricity\n\n### Friction and Static Electricity\n\nWhen certain materials are rubbed together, they can become electrically charged. This is called **static electricity**.\n\n**How it works:**\n- Friction (rubbing) between certain materials such as plastic, perspex, glass, nylon, wool, and silk transfers **electrons** between the atoms of the two materials being rubbed together.\n- **Electrons** move from one material causing a **positive charge** on its surface, and a **negative charge** on the surface of the other material.\n- Only the electrons are transferred — protons and neutrons do NOT move.\n\n**Important rule:** It is only the electrons that are transferred, not the protons.\n\n**Experiment ideas:**\n- Rubbing a plastic or perspex ruler with a piece of wool, nylon, or silk fabric.\n- Bringing the ruler close to small pieces of tissue paper or sawdust.'),
  q(2, 'When a plastic ruler is rubbed with a wool cloth, what is transferred between them?',
    ['Protons', 'Neutrons', 'Electrons', 'Atoms'], 2,
    'When materials are rubbed together, electrons are transferred from one material to the other. Only electrons can move — protons and neutrons are locked inside the nucleus and do not transfer. This transfer of electrons creates static electric charges on both materials.'),
  t(3, '### Like and Unlike Charges\n\nObjects/materials with the **same/like charges repel** each other:\n- Positive repels positive (+/+)\n- Negative repels negative (−/−)\n\nObjects/materials with **opposite/unlike charges attract** each other:\n- Positive attracts negative (+/−)\n\n**Demonstrating static electricity:**\n- After rubbing a ruler with wool, the charged ruler attracts small pieces of paper. The paper sticks to the ruler because the charges on the ruler attract the opposite charges in the paper.\n- Two charged balloons rubbed with wool will repel each other (both have the same charge).\n- A discharge of the electrons causes sparks or shocks of static electricity, especially when the air is dry.'),
  fb(4, 'Objects with the same charge ___ each other. Objects with opposite charges ___ each other.',
    ['repel', 'attract'],
    'Like charges (both positive or both negative) push away from each other — they repel. Unlike charges (one positive and one negative) pull toward each other — they attract. This is a fundamental law of electric charges.'),
  q(5, 'A learner rubs two balloons with a wool cloth. When the balloons are held close together, they push apart. Why?',
    ['The balloons are too heavy', 'Both balloons have the same charge and like charges repel', 'The wool is magnetic', 'The balloons are attracted to the Earth'], 1,
    'When both balloons are rubbed with wool, they both gain the same type of charge (either both positive or both negative). Since like charges repel each other, the two balloons push apart when brought close together.'),
  t(6, '### Static Electricity in Everyday Life\n\nStatic electricity is a common phenomenon:\n\n- **Getting a shock** when touching a metal door handle after walking on a carpet — electrons build up on your body from the friction of your shoes on the carpet, and discharge when you touch a conductor.\n- **Hair standing up** after removing a hat or jersey — the friction transfers electrons, and the like-charged hairs repel each other.\n- **Clothes clinging together** in a tumble dryer — friction between fabrics causes charge transfer.\n- **Lightning** — a massive discharge of static electricity between clouds and the ground. Rubbing of air and water particles in thunder clouds causes a build-up of charge.\n\n**Safety during lightning storms in South Africa:**\n- Stay indoors or inside a car\n- Do not stand under tall trees or near metal poles\n- Do not swim or stand in open water\n- Avoid using electrical appliances connected to mains\n- South Africa experiences many lightning strikes, particularly in Gauteng, Mpumalanga, and KwaZulu-Natal during summer thunderstorms'),
  q(7, 'What causes lightning during a thunderstorm?',
    ['Wind blowing through the clouds', 'A massive discharge of static electricity between clouds and the ground', 'The Sun heating the clouds', 'Rain falling through the air'], 1,
    'Lightning occurs when there is a massive discharge (release) of static electricity. In thunder clouds, the rubbing together of air and water particles creates a build-up of charge. When the charge becomes large enough, it discharges as a lightning bolt.'),
  fb(8, 'Lightning is a massive discharge of ___ electricity. During a thunderstorm, you should stay ___ or inside a car for safety.',
    ['static', 'indoors'],
    'Lightning is essentially a giant spark of static electricity — a massive discharge of built-up charge between clouds and the ground. The safest places during a thunderstorm are inside a building or a car, whose metal body conducts the charge safely around you.'),
  q(9, 'Which particles are transferred when materials are rubbed together to create static electricity?',
    ['Protons only', 'Neutrons only', 'Electrons only', 'Protons and neutrons'], 2,
    'Only electrons are transferred when materials are rubbed together. Electrons are on the outer edge of atoms and can be moved relatively easily. Protons and neutrons are locked inside the nucleus and cannot be transferred by rubbing.'),
  q(10, 'After rubbing a ruler with a silk cloth, the ruler has a positive charge. What happened to the ruler\'s electrons?',
    ['They were destroyed', 'They were transferred to the silk cloth', 'They moved to the centre of the ruler', 'They doubled in number'], 1,
    'If the ruler has a positive charge, it means it lost electrons. Those electrons were transferred to the silk cloth during rubbing. The ruler now has more protons than electrons, giving it a net positive charge. The silk cloth gained those electrons and became negatively charged.'),
];

// =============================================================================
// CHAPTER 9: Energy Transfer in Electrical Systems (Term 3 — Energy and Change)
// =============================================================================
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Circuits and Current Electricity\n\n### What Is a Circuit?\n\nA **circuit** is a system for transferring electrical energy. A **closed circuit** is needed to make a device work, such as making a bulb light up.\n\nA circuit is a complete conducting pathway for electricity. It has a number of components connected together:\n- From one terminal at the source of energy (cell/battery)\n- Along conducting material (wires)\n- Through the device (e.g., filaments of incandescent bulbs)\n- And back to the other terminal of the source of energy (cell/battery)\n\n### Components of a Circuit\n\n| Component | Function |\n|-----------|----------|\n| **Cell/Battery** | Source of energy — stores chemical substances (potential energy). When the circuit is completed, chemicals react to produce an electric current |\n| **Conducting wires** | Usually made of metal (copper) — carry electricity over short or long distances |\n| **Switch** | Controls the circuit — opens or closes the pathway for current |\n| **Bulb** | Converts electrical energy into light and heat |\n| **Resistors** | Materials that resist or oppose the flow of electrical current |'),
  q(2, 'What does a cell (battery) provide in an electrical circuit?',
    ['It provides resistance', 'It provides a switch', 'It is the source of electrical energy', 'It absorbs electrical energy'], 2,
    'A cell (battery) is the source of energy in a circuit. It stores chemical energy (potential energy) which is converted into electrical energy when the circuit is complete. The chemicals inside react to produce an electric current.'),
  t(3, '### Electric Current and Energy Transfer\n\nAn **electric current** is the flow of charges (kinetic energy) along a conductor.\n\n**How energy transfers in a circuit:**\n1. The cell stores chemical energy (potential energy).\n2. When the circuit is completed, the chemicals react together to produce an electric current.\n3. The current flows through the conducting wires to the device (e.g., a bulb).\n4. In the bulb, the current passes through a thin resistance wire called a **filament**.\n5. The filament resists the current, heats up to become white hot, and produces **light** and **heat**.\n6. The resistance wire (filament) is connected to two contact points — the screw part (casing) and the solder knob at the bottom, separated by an insulator.\n\n### Resistors\n\n**Resistors** are made of materials that resist or oppose the flow of electrical current in a circuit:\n- Resistors have an influence on the **amount** of electric current flowing in that circuit.\n- Some resistors include **bulb filaments**, **heating wires**, **elements in kettles/heaters/geysers/stoves** that can heat up to provide useful output energy.\n- A light bulb (such as a torch bulb) contains a resistance wire called a filament.'),
  fb(4, 'An electric current is the flow of ___ along a conductor. A thin wire in a bulb that heats up and produces light is called a ___.',
    ['charges', 'filament'],
    'Electric current is the movement of electric charges (electrons) through a conductor. The filament in a bulb is a thin resistance wire that heats up when current passes through it, glowing white hot to produce light. The resistance of the filament converts electrical energy into light and heat.'),
  q(5, 'What happens to a bulb filament when electric current passes through it?',
    ['It becomes cold', 'It resists the current, heats up, and produces light', 'It dissolves', 'It becomes magnetic'], 1,
    'The filament is a thin resistance wire inside a bulb. When current flows through it, the filament resists the flow, causing it to heat up. It gets so hot that it glows white, producing light. This is how electrical energy is converted into light and heat energy.'),
  t(6, '### Effects of an Electric Current\n\nAn electric current produces several effects:\n\n**1. Heating effect:**\n- A current can heat a resistance wire (such as a bulb filament).\n- Electrical current transfers energy to the particles in a bulb filament, producing light.\n- This is how kettles, heaters, geysers, and electric stoves work.\n\n**2. Magnetic effect:**\n- A current causes a magnetic field (such as in electromagnets).\n- An electric current can be used for making temporary magnets known as **electromagnets**.\n- Moving charges (current) in a conductor (such as a wire) cause a magnetic field around it.\n\n**3. Chemical effect (Electrolysis):**\n- An electric current can cause a chemical reaction in a solution — this process is called **electrolysis**.\n- Water can be broken down by electrolysis to produce oxygen and hydrogen gas.\n- Copper(II) chloride solution can be broken down by electrolysis: copper is deposited on one electrode (cathode) and chlorine gas is formed as bubbles at the other electrode (anode).'),
  q(7, 'Which effect of an electric current is used in kettles and heaters?',
    ['Magnetic effect', 'Chemical effect', 'Heating effect', 'Light effect only'], 2,
    'Kettles and heaters use the heating effect of electric current. When current flows through a high-resistance element, electrical energy is converted into heat energy. This heats the water in a kettle or the air near a heater.'),
  fb(8, 'An electric current creates a magnetic field around a wire, which can be used to make temporary magnets called ___. The process of using electricity to break down a compound is called ___.',
    ['electromagnets', 'electrolysis'],
    'Electromagnets are created when electric current flows through a coil of wire, producing a magnetic field. They are temporary — the magnetism disappears when the current is switched off. Electrolysis uses electrical energy to decompose (break down) compounds in solution.'),
  t(9, '### Short Circuits and Safety\n\n**Short circuits:**\nCircuits can overheat if a short circuit occurs.\n- A **short circuit** can occur when a conductor is connected directly to both terminals of a cell/battery, bypassing the device. The current takes the path of lowest resistance.\n- This causes a very large current to flow, which can overheat wires, melt insulation, and cause fires.\n\n**Fuses:**\n- **Fuses** are special wires which break the circuit when they overheat and melt.\n- They are safety devices that reduce the danger when using electricity.\n- When too much current flows (e.g., during a short circuit), the fuse wire melts, breaking the circuit and stopping the current.\n\n**Safety with electricity:**\n- Never overload a plug socket with too many appliances.\n- Do not use frayed or damaged electrical cords.\n- Keep electrical appliances away from water.\n- **Illegal connections** to the Eskom mains supply are extremely dangerous and can cause electrocution, fires, and death.'),
  q(10, 'What is the purpose of a fuse in an electrical circuit?',
    ['To increase the current', 'To make the lights brighter', 'To break the circuit if the current becomes too high, preventing fires', 'To store electrical energy'], 2,
    'A fuse is a safety device — a thin wire that melts and breaks the circuit if the current becomes dangerously high (e.g., during a short circuit). By breaking the circuit, the fuse stops current from flowing, preventing overheating, fires, and damage to appliances.'),
];

// =============================================================================
// CHAPTER 10: Series and Parallel Circuits (Term 3 — Energy and Change)
// =============================================================================
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Series and Parallel Circuits\n\n### Series Circuits\n\nA **series circuit** provides only one pathway for the current to pass through. The current flows through all components one after another.\n\n**Properties of a series circuit:**\n- The current is the **same** everywhere in the circuit.\n- Every time a resistor is added in series, the **overall current in the circuit decreases**.\n- If one component (e.g., a light bulb) breaks or is removed, the circuit is broken and **all** components stop working.\n\n**Example:** Old-style Christmas tree lights were wired in series. If one bulb blew, all the lights went out.\n\n### Parallel Circuits\n\nA **parallel circuit** provides two or more pathways for the current to pass through.\n\n**Properties of a parallel circuit:**\n- The **voltage** across each branch is the same.\n- When more resistors are added in parallel, the **overall current increases**.\n- If one component breaks, the **other branches continue to work**.\n\n**In our homes:** Lights and appliances are connected in **parallel**. This means each appliance can be switched on and off independently, and if one light blows, the others remain on.'),
  q(2, 'In a series circuit with three bulbs, what happens if one bulb breaks?',
    ['Only that bulb goes off', 'Two bulbs go off', 'All three bulbs go off', 'The remaining bulbs get brighter'], 2,
    'In a series circuit, there is only one pathway for current. If one bulb breaks, the circuit is broken and no current can flow. All bulbs go off. This is the main disadvantage of series circuits.'),
  fb(3, 'In a series circuit, the current is the ___ at every point. In a parallel circuit, if one component breaks, the other branches continue to ___.',
    ['same', 'work'],
    'A series circuit has one path, so the same current flows through every component. A parallel circuit has multiple paths, so if one branch is broken, current can still flow through the other branches. This is why household wiring uses parallel circuits.'),
  t(4, '### Comparing Series and Parallel Circuits\n\n| Feature | Series Circuit | Parallel Circuit |\n|---------|---------------|------------------|\n| Pathways | One pathway | Two or more pathways |\n| Current | Same everywhere | Splits between branches |\n| Adding resistors | Current decreases | Overall current increases |\n| One component breaks | All stop working | Others continue |\n| Used in homes? | No (mostly) | Yes — lights and appliances |\n| Bulb brightness | Dimmer with more bulbs | Each bulb at full brightness |\n\n**Why parallel circuits are used in homes:**\n1. Each appliance gets the full mains voltage.\n2. Each appliance can be switched on and off independently.\n3. If one appliance fails, the others continue working.\n4. Different appliances can draw different amounts of current.\n\n**Investigation ideas:**\n- Build a series circuit with two bulbs. Observe that both are dimmer than a single bulb. Remove one — the other goes off.\n- Build a parallel circuit with two bulbs. Each bulb is at full brightness. Remove one — the other stays on.'),
  q(5, 'Why are lights in your house connected in parallel rather than in series?',
    ['Because parallel circuits use less wire', 'Because each light gets the full voltage and can be switched independently', 'Because series circuits are brighter', 'Because parallel circuits are cheaper'], 1,
    'Parallel circuits allow each light to receive the full mains voltage and to be switched on and off independently. If one light blows, the others stay on. In a series circuit, all lights would go off if one failed, and adding more lights would make each one dimmer.'),
  t(6, '### Investigating Circuits\n\nWhen investigating circuits, you can explore:\n\n**1. Heating effect of a current:**\n- Use a resistance wire (such as steel wool or nichrome wire) connected in a circuit.\n- Observe how the wire heats up when current flows through it.\n- This is the same principle used in kettles, toasters, and heaters.\n\n**2. Current strength in a series circuit:**\n- Connect a battery, bulb, and ammeter in series.\n- Add more bulbs in series and observe that the current decreases.\n- The more resistance in the circuit, the less current flows.\n\n**3. Connecting resistors in series and parallel:**\n- In series: more resistors = less current = dimmer bulbs.\n- In parallel: more resistors (branches) = more total current from the battery.\n\n**4. Metals and conductivity:**\n- Test different metals (copper, steel, aluminium, nichrome) in a circuit to see which conduct electricity best.\n- Copper is one of the best conductors, which is why it is used in electrical wiring.'),
  q(7, 'When more bulbs are added to a series circuit, what happens to the brightness of each bulb?',
    ['Each bulb gets brighter', 'The brightness stays the same', 'Each bulb gets dimmer', 'Only the first bulb changes'], 2,
    'Adding more bulbs in series increases the total resistance in the circuit, which decreases the current. Less current means each bulb receives less energy, so all bulbs become dimmer. This is a key disadvantage of series circuits.'),
  fb(8, 'Adding more resistors in a series circuit causes the current to ___. Adding more resistors in a parallel circuit causes the overall current to ___.',
    ['decrease', 'increase'],
    'In series, each additional resistor adds to the total resistance, reducing the current. In parallel, each additional branch provides another pathway for current, so the total current from the battery increases.'),
  t(9, '### Electrical Safety in South Africa\n\nElectrical safety is critical in South African homes and schools:\n\n**Safety devices:**\n- **Fuses** — melt and break the circuit if the current is too high.\n- **Circuit breakers** — automatically switch off if the current exceeds a safe level. They can be reset.\n\n**Dangers of electricity:**\n- **Electric shock** — can cause burns, muscle contractions, heart failure, and death.\n- **Short circuits** — can cause fires.\n- **Overloaded sockets** — connecting too many appliances to one socket can cause overheating.\n\n**Illegal connections:**\n- Illegally connecting to the Eskom power supply (izinyoka) is extremely dangerous.\n- Exposed wires can electrocute people, especially children.\n- It is electricity theft and is a criminal offence.\n\n**Safety rules:**\n- Never touch electrical appliances with wet hands.\n- Never put metal objects into plug sockets.\n- Report damaged power lines to Eskom immediately.\n- Keep electrical cords away from heat sources.'),
  q(10, 'What is the danger of illegally connecting to the Eskom power supply?',
    ['The electricity is lower quality', 'It can cause electrocution, fires, and death', 'The lights will be dimmer', 'It only wastes electricity'], 1,
    'Illegal connections (izinyoka) to the Eskom mains are extremely dangerous because they involve exposed, uninsulated wires carrying high-voltage electricity. This can cause fatal electric shocks, fires, and explosions. It is also a criminal offence.'),
];

// =============================================================================
// CHAPTER 11: Visible Light (Term 3 — Energy and Change)
// =============================================================================
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Visible Light\n\n### Radiation of Light\n\nLight is emitted from luminous objects such as the **Sun** and light bulbs, and is transferred by radiation.\n\n**Key facts about light:**\n- Light travels in **straight lines** (called rays).\n- Light travels through empty space at a speed of about **300 000 kilometres per second**.\n- The distance from the Sun to Earth is approximately **150 million kilometres**.\n\n### The Spectrum of Visible Light\n\n**White light** consists of a spectrum (range) of different frequencies and wavelengths.\n\nThe colours that make up the spectrum of visible light are:\n**Violet, Indigo, Blue, Green, Yellow, Orange, Red** (remember the mnemonic: **VIBGYOR**)\n\n- **Violet** has the shortest wavelength and highest frequency.\n- **Red** has the longest wavelength and lowest frequency.\n- No further detail on wavelengths and frequencies is required at this level.\n\n### Rainbows\n\nA **rainbow** is seen when light falls on water droplets in the air and is **refracted** (bent). The white light is dispersed into its different colours — violet, indigo, blue, green, yellow, orange, and red — seen in the rainbow.'),
  q(2, 'Which colour of visible light has the shortest wavelength?',
    ['Red', 'Green', 'Yellow', 'Violet'], 3,
    'Violet light has the shortest wavelength and the highest frequency in the visible spectrum. Red light has the longest wavelength and the lowest frequency. The other colours fall between these two extremes.'),
  fb(3, 'Light travels in straight lines at a speed of about ___ kilometres per second. White light is made up of a spectrum of ___ different colours.',
    ['300 000', 'seven'],
    'Light travels at approximately 300 000 km/s through empty space. White light is composed of seven colours: violet, indigo, blue, green, yellow, orange, and red (VIBGYOR). A prism or water droplets can separate white light into these component colours.'),
  t(4, '### Opaque, Transparent, and Translucent\n\nMaterials interact with light in different ways:\n\n- **Opaque** substances — light **cannot** pass through them (e.g., metal, clay, bricks, wall paint, cardboard). Light is either absorbed or reflected.\n- **Transparent** substances — light **passes through** them easily (e.g., glass, clear plastic, cellophane, clean water). Some light may be absorbed or reflected, but most passes through.\n- **Translucent** substances — some light passes through, but not clearly (e.g., frosted glass, tissue paper, thin fabric).\n\n**Shadows:**\n- Opaque substances cast **shadows** on the side facing away from the light source.\n- Shadows form because the opaque object blocks the light from passing through.\n\n### Absorption of Light\n\n- Light can be absorbed by surfaces of some materials.\n- Different materials absorb light differently.\n- A material has colour because it absorbs some of the colours in the spectrum and **reflects** other colours.\n- A **red** object reflects red light and absorbs other colours (violet, indigo, blue, green, yellow, orange).\n- A **black** object absorbs all colours and reflects none — it looks black.\n- A **white** object reflects all colours and absorbs none — it looks white.'),
  q(5, 'A red apple appears red because it:',
    ['Produces red light', 'Absorbs red light and reflects all others', 'Reflects red light and absorbs other colours', 'Contains red chemicals that glow'], 2,
    'A red object reflects red light frequencies to our eyes and absorbs the other colours of the spectrum. The colour we see depends on which frequencies of light are reflected by the object\'s surface. Black objects absorb all colours; white objects reflect all.'),
  fb(6, 'Materials that do not allow light to pass through are called ___. A black object absorbs ___ the colours of light and reflects none.',
    ['opaque', 'all'],
    'Opaque materials block light completely, creating shadows. A black object absorbs all frequencies of visible light, which is why it appears black — no light is reflected to our eyes. This is also why black objects heat up more in sunlight.'),
  t(7, '### Reflection of Light\n\nLight is reflected off most surfaces, including mirrors.\n\n**Laws of reflection:**\n- Light can change its direction when it is reflected.\n- The **angle of incidence** (incoming ray) and the **angle of reflection** (outgoing ray) are **equal**.\n- Both angles are measured from the **normal** — a line perpendicular to the surface.\n- The actual measurement of angles is not included at this level.\n\n**Smooth vs rough surfaces:**\n- On **smooth surfaces** (like a mirror), all light is reflected in the **same direction** — this is called **regular (specular) reflection**. You can see a clear image.\n- On **rough surfaces** (like crumpled aluminium foil or a rough wall), reflected light is **scattered** in many directions — this is called **diffuse reflection**. You cannot see a clear image.'),
  q(8, 'In reflection, the angle of incidence is always:',
    ['Greater than the angle of reflection', 'Less than the angle of reflection', 'Equal to the angle of reflection', 'Unrelated to the angle of reflection'], 2,
    'The law of reflection states that the angle of incidence equals the angle of reflection. Both angles are measured from the normal — an imaginary line perpendicular to the reflective surface at the point where the light ray strikes.'),
  t(9, '### Refraction of Light\n\n**Refraction** is the bending of light when it passes from one transparent medium into another (e.g., from air into glass or water).\n\n**Key facts about refraction:**\n- Light **changes direction** when it is refracted.\n- Light entering a transparent medium (such as glass, water, or perspex) at an angle changes direction **towards the normal**.\n- Light travelling out of the medium (back into the air) changes direction **away from the normal**.\n\n**Examples of refraction:**\n- A straw in a glass of water appears to be bent at the water surface — this is because light refracts as it passes from water to air.\n- A swimming pool looks shallower than it really is.\n\n**Prisms and lenses:**\n- A **triangular prism** can refract and disperse white light into the colours of the rainbow.\n- A **lens** can refract and focus light. Magnifying glasses use a convex lens to focus light and magnify images.\n\n### Seeing Light\n\nWe see objects because light enters our eyes:\n- Reflected or emitted light enters the eye through the pupil.\n- Specialised receptor cells in the **retina** are stimulated by specific frequencies (colours).\n- Light energy is converted to **electrical nerve impulses** that travel to the brain.\n- The brain interprets these impulses as our perception of light and colour.'),
  q(10, 'A pencil placed in a glass of water appears bent at the surface. What causes this?',
    ['Reflection of light', 'Absorption of light', 'Refraction of light as it passes from water to air', 'Diffraction of light'], 2,
    'The pencil appears bent because of refraction — the bending of light as it passes from one medium (water) to another (air). The light rays change direction at the boundary between water and air, making the submerged part of the pencil appear displaced.'),
];

// =============================================================================
// CHAPTER 12: The Solar System (Term 4 — Planet Earth and Beyond)
// =============================================================================
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## The Solar System\n\n### The Sun\n\nThe Sun is like all other stars — it produces large amounts of heat and light continuously.\n\n**Key facts about the Sun:**\n- The energy in our Sun comes from powerful **nuclear reactions** during which hydrogen gas changes into helium gas.\n- The Sun is the centre of our Solar System.\n- It provides the light and heat energy that makes life on Earth possible.\n\n### Objects Around the Sun\n\nA variety of objects orbit the Sun:\n- **Eight planets** and their moons\n- Rocky **asteroids** (mostly in the asteroid belt between Mars and Jupiter)\n- **Outer dwarf planets** and many distant icy and dusty objects in the **Kuiper Belt** and **Oort Cloud** at the edge of the Solar System\n- **Comets** from the Oort Cloud come close to the Sun from time to time\n\n### Features of the Planets\n\nAll the planets and other objects in the Solar System have their own special features, including:\n- Size and distance from the Sun\n- Number of moons known\n- Composition (rocky or gas)\n- Surface temperature\n- Time it takes for one orbit around the Sun'),
  q(2, 'What type of reactions produce the energy in our Sun?',
    ['Chemical reactions', 'Nuclear reactions (fusion)', 'Combustion (burning)', 'Electrical reactions'], 1,
    'The Sun produces energy through nuclear fusion reactions, where hydrogen atoms are fused together to form helium under extreme heat and pressure. This process releases enormous amounts of energy as light and heat.'),
  t(3, '### The Planets of Our Solar System\n\n| Planet | Position | Type | Key Feature |\n|--------|----------|------|-------------|\n| **Mercury** | 1st | Rocky | Closest to the Sun; very hot days, very cold nights; no atmosphere |\n| **Venus** | 2nd | Rocky | Hottest planet due to thick CO₂ atmosphere (greenhouse effect); rotates backwards |\n| **Earth** | 3rd | Rocky | Only known planet with liquid water and life; has one moon |\n| **Mars** | 4th | Rocky | Called the "Red Planet" (iron oxide on surface); has two small moons |\n| **Jupiter** | 5th | Gas giant | Largest planet; Great Red Spot (giant storm); has 95+ known moons |\n| **Saturn** | 6th | Gas giant | Famous for its visible ring system; has 140+ known moons |\n| **Uranus** | 7th | Ice giant | Rotates on its side; has faint rings; very cold |\n| **Neptune** | 8th | Ice giant | Furthest planet; very cold; has strong winds |\n\n**Remembering the order:** My Very Excellent Mother Just Served Us Nachos\n(Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune)'),
  fb(4, 'The largest planet in our Solar System is ___. The only planet known to support life is ___.',
    ['Jupiter', 'Earth'],
    'Jupiter is by far the largest planet — you could fit over 1 300 Earths inside it. Earth is the only planet known to support life because it has liquid water, a suitable atmosphere, and the right temperature range.'),
  q(5, 'Venus is the hottest planet in the Solar System, even though Mercury is closer to the Sun. Why?',
    ['Venus is bigger than Mercury', 'Venus has a thick atmosphere of CO₂ that traps heat (greenhouse effect)', 'Venus rotates faster', 'Venus is made of metal'], 1,
    'Venus has an extremely thick atmosphere made mostly of carbon dioxide, which traps heat through an intense greenhouse effect. This makes Venus\'s surface temperature about 465°C — hotter than Mercury, despite being further from the Sun.'),
  t(6, '### The Shape and Motion of the Solar System\n\nThe Solar System looks like a **flat disc or plate** when viewed from the side:\n- The **Sun** spins (rotates) at the centre.\n- All the planets and other objects orbit around the Sun in the **same direction**.\n- **Gravity** is the force that keeps all these objects in their stable, predictable orbits around the Sun.\n\n### Earth\'s Position in the Solar System\n\nThe Earth is the **third planet** from the Sun and is the only planet known to support life.\n\n**Conditions that support life on Earth:**\n1. **Temperature** — Earth\'s distance from the Sun provides an ideal temperature range for liquid water to exist.\n2. **Water** — exists as a liquid, gas, or solid within Earth\'s temperature range.\n3. **Sunlight** — provides the energy in the food chain through photosynthesis.\n4. **Oxygen** — early life forms (algae and cyanobacteria) produced enough oxygen for the evolution of more sophisticated life forms.\n5. **Atmosphere** — protects life from harmful radiation and regulates temperature.'),
  q(7, 'What force keeps the planets in orbit around the Sun?',
    ['Magnetic force', 'Friction', 'Gravity', 'Static electricity'], 2,
    'Gravity is the force of attraction between the Sun and the planets. The Sun\'s enormous mass creates a strong gravitational pull that keeps all the planets in their orbits. Without gravity, the planets would fly off into space in straight lines.'),
  fb(8, 'The planets orbit around the Sun because of the force of ___. Earth is the ___ planet from the Sun.',
    ['gravity', 'third'],
    'Gravity is the universal force of attraction between all objects with mass. The Sun\'s massive gravitational pull keeps all eight planets, as well as asteroids, comets, and dwarf planets, in their orbits. Earth occupies the third orbital position from the Sun.'),
  q(9, 'Which of the following conditions on Earth makes it suitable for life?',
    ['It has the most moons', 'It is the largest planet', 'It has liquid water and a suitable temperature range', 'It is closest to the Sun'], 2,
    'Earth supports life because of several key conditions: liquid water exists on its surface, the temperature is within a suitable range, it has an atmosphere with oxygen, and sunlight provides energy. No other known planet has all these conditions.'),
  q(10, 'Comets originate from the outer edges of the Solar System. Where do most comets come from?',
    ['The asteroid belt', 'The surface of Jupiter', 'The Oort Cloud', 'The Moon'], 2,
    'Most comets originate from the Oort Cloud, a vast spherical shell of icy objects at the very edge of the Solar System. When disturbed by gravitational interactions, comets can fall inward toward the Sun, developing their characteristic tails as ice vaporises.'),
];

// =============================================================================
// CHAPTER 13: Beyond the Solar System (Term 4 — Planet Earth and Beyond)
// =============================================================================
blockNum = 0;
const ch13_lesson1 = [
  t(1, '## Beyond the Solar System\n\n### The Milky Way Galaxy\n\nOur Solar System is located in the **Milky Way Galaxy**.\n\n**Key facts about the Milky Way:**\n- A **galaxy** is a collection of stars held together by their mutual gravity.\n- Our Sun is only **one of billions of stars** in the Milky Way Galaxy.\n- The Milky Way Galaxy is in the shape of a **spiral** with many arms.\n- Our Sun is located towards the **edge** of the Milky Way Galaxy, in one of the spiral arms.\n- From the Earth, looking towards the centre of the Milky Way Galaxy, we see a hazy path of light across the sky — the ancient Greeks described it as spilled milk.\n\n### Our Nearest Star\n\n- The **Sun** is the nearest star to Earth.\n- The star called **Alpha Centauri** is the nearest easily visible star to the Sun. It is the brighter of the two Pointers of the **Southern Cross** constellation.\n- Alpha Centauri is **4.2 light years** away from our Solar System.\n- Alpha Centauri is approximately **42 trillion kilometres** away.'),
  q(2, 'What shape is the Milky Way Galaxy?',
    ['A flat square', 'A sphere', 'A spiral', 'A triangle'], 2,
    'The Milky Way Galaxy is a spiral galaxy with several arms radiating from a central bulge. Our Solar System is located in one of the outer spiral arms. When we look toward the centre at night, we see the hazy band of light made by billions of distant stars.'),
  fb(3, 'Our Solar System is located in the ___ Galaxy. The nearest easily visible star to our Sun is called ___.',
    ['Milky Way', 'Alpha Centauri'],
    'The Milky Way is our home galaxy, containing billions of stars including our Sun. Alpha Centauri, located 4.2 light years away, is the closest easily visible star to our Sun. It can be seen as the brighter of the two Pointer stars near the Southern Cross.'),
  t(4, '### Light Years, Light Hours, and Light Minutes\n\nBecause distances in space are so enormous, astronomers use a special unit called a **light year**.\n\n**Definitions:**\n- A **light year** is the distance that light travels in **one year** — approximately **10 trillion kilometres** (10 000 000 000 000 km).\n- A **light hour** is the distance that light travels in one hour.\n- A **light minute** is the distance that light travels in one minute.\n\n**Useful measurements:**\n- Alpha Centauri is **42 trillion km** away = **4.2 light years**\n- Our Solar System has a diameter of about **13 light hours**\n- The Earth is about **8 light minutes** away from the Sun\n- Light from the Sun takes about 8 minutes to reach Earth\n\n**Scale perspective:**\nIf you could travel at the speed of light, you could circle the Earth about 7.5 times in just one second. Yet even at that incredible speed, it would take 4.2 years to reach our nearest stellar neighbour, Alpha Centauri.'),
  q(5, 'How long does light from the Sun take to reach Earth?',
    ['About 8 seconds', 'About 8 minutes', 'About 8 hours', 'About 8 days'], 1,
    'The Earth is about 8 light minutes from the Sun. This means light, travelling at 300 000 km/s, takes approximately 8 minutes to cover the 150 million kilometre distance from the Sun to the Earth.'),
  fb(6, 'A light year is the distance light travels in ___. It is equal to about ___ trillion kilometres.',
    ['one year', '10'],
    'A light year is a unit of distance, not time. Light travels at about 300 000 km/s, so in one year it covers approximately 10 trillion (10 000 000 000 000) kilometres. This unit helps astronomers express the vast distances between stars and galaxies.'),
  t(7, '### Beyond the Milky Way Galaxy\n\nOur Milky Way Galaxy is only one of **billions of galaxies** scattered across the Universe.\n\n**Key facts:**\n- The size of the observable Universe is estimated to be about **28 billion light years** across.\n- Galaxies have **various shapes and sizes** — spiral, elliptical, and irregular.\n- The Milky Way is a spiral galaxy.\n- The distances between galaxies are measured in millions of light years.\n\n**The Magellanic Clouds:**\n- The **Large Magellanic Cloud (LMC)** and **Small Magellanic Cloud (SMC)** are small irregular galaxies visible from the Southern Hemisphere, including South Africa.\n- They are satellite galaxies of the Milky Way.\n- They appear as hazy patches in the night sky and are named after the explorer Ferdinand Magellan.'),
  q(8, 'The Milky Way Galaxy is one of approximately how many galaxies in the Universe?',
    ['Eight', 'A few thousand', 'A few million', 'Billions'], 3,
    'There are billions of galaxies in the observable Universe. Our Milky Way is just one of them. Each galaxy can contain billions of stars, making the Universe unimaginably vast.'),
  fb(9, 'Galaxies come in various shapes, including spiral, ___, and irregular. The observable Universe is estimated to be about ___ billion light years across.',
    ['elliptical', '28'],
    'The three main types of galaxy shapes are spiral (like the Milky Way), elliptical (oval-shaped), and irregular (no defined shape). The observable Universe spans approximately 28 billion light years, containing billions of galaxies.'),
  q(10, 'The Large and Small Magellanic Clouds can be seen from South Africa. What are they?',
    ['Types of weather clouds', 'Small galaxies near the Milky Way', 'Star clusters within the Milky Way', 'Nebulae where stars are being born'], 1,
    'The Large and Small Magellanic Clouds are small irregular galaxies that orbit the Milky Way as satellite galaxies. They are visible to the naked eye from the Southern Hemisphere, including South Africa, appearing as hazy patches in the night sky.'),
];

// =============================================================================
// CHAPTER 14: Looking into Space (Term 4 — Planet Earth and Beyond)
// =============================================================================
blockNum = 0;
const ch14_lesson1 = [
  t(1, '## Looking into Space\n\n### Early Viewing of Space\n\nPeople have been looking at the night sky for thousands of years:\n- People can see **planets and stars** in the night sky with the naked eye.\n- Stars can be arranged into visible patterns called **constellations**.\n- Different cultures have identified and named certain constellations.\n- Some constellations have stories linked to them from various cultures, including African, Greek, and Aboriginal traditions.\n\n**Constellations visible from South Africa:**\n- **The Southern Cross (Crux)** — the most famous southern constellation, used for navigation. It appears on the South African flag.\n- **Orion** — the Hunter, visible in summer evenings.\n- **Scorpius** — the Scorpion, visible in winter.\n- The **Pointers** — two bright stars (Alpha and Beta Centauri) that point toward the Southern Cross.'),
  q(2, 'What is a constellation?',
    ['A group of planets', 'A pattern of stars as seen from Earth', 'A type of galaxy', 'A cluster of moons'], 1,
    'A constellation is a recognisable pattern of stars as seen from Earth. Different cultures have identified and named constellations throughout history. The patterns are not physical groupings — the stars in a constellation may be at very different distances from Earth.'),
  t(3, '### Telescopes\n\nPeople can see more detail in the sky when they use a **telescope**.\n\n**What a telescope does:**\n- A telescope forms an **image** of the object and **magnifies** it (makes it look bigger).\n- It gathers more light than the human eye, allowing us to see faint and distant objects.\n\n**Types of telescopes:**\n\n| Type | How It Works | Examples |\n|------|-------------|----------|\n| **Optical (refracting)** | Uses lenses to focus light by refraction | Galileo\'s telescope, binoculars |\n| **Optical (reflecting)** | Uses mirrors to focus light by reflection | **SALT** (Southern Africa Large Telescope), Hubble Space Telescope |\n| **Radio telescope** | Receives radio waves and focuses them by reflection using a metal dish | **SKA** (Square Kilometre Array) |\n\n### South African Telescopes\n\nSouth Africa is a world leader in astronomy:\n\n- **SALT** (Southern Africa Large Telescope) — located in **Sutherland**, Northern Cape. It is the largest single optical telescope in the southern hemisphere.\n- **SKA** (Square Kilometre Array) — a massive international radio telescope project. South Africa hosts a significant portion of the SKA in the Northern Cape (Karoo region).'),
  fb(4, 'The Southern Africa Large Telescope (SALT) is located in ___, Northern Cape. The SKA is a massive ___ telescope project hosted partly in South Africa.',
    ['Sutherland', 'radio'],
    'SALT, located in Sutherland, is the largest optical telescope in the southern hemisphere. The SKA (Square Kilometre Array) is an international radio telescope project — South Africa\'s Karoo region in the Northern Cape provides ideal conditions with minimal radio interference.'),
  q(5, 'What is the main advantage of using a telescope compared to the naked eye?',
    ['Telescopes can create stars', 'Telescopes can magnify objects and gather more light', 'Telescopes can change the colour of stars', 'Telescopes can move stars closer'], 1,
    'Telescopes magnify distant objects and gather much more light than the human eye alone. This allows astronomers to see objects that are too faint or too far away to be seen with the naked eye, revealing details of planets, stars, nebulae, and galaxies.'),
  t(6, '### Conditions for Good Astronomical Observation\n\nGood conditions for looking into space include:\n\n- **Cloudless skies** — clouds block the view of stars and planets.\n- **Limited light pollution** — artificial light from cities drowns out the faint light of stars. Observatories are built far from cities.\n- **Limited air pollution** — smoke and dust particles scatter light and reduce visibility.\n- **High altitude** — less atmosphere to look through means clearer images.\n- **Dry conditions** — water vapour in the atmosphere can distort images.\n\n**Why South Africa is ideal for astronomy:**\n- The Northern Cape (especially the Karoo) has many locations that meet these requirements.\n- Sutherland, where SALT is located, has dark skies, dry conditions, high altitude, and minimal light pollution.\n- The SKA site in the Karoo was chosen because of minimal radio interference from human activity.\n- South Africa\'s location in the Southern Hemisphere provides views of parts of the sky not visible from the Northern Hemisphere, including the centre of the Milky Way.'),
  q(7, 'Why was the Karoo in the Northern Cape chosen as a location for telescopes?',
    ['Because it is close to major cities', 'Because it has frequent rain', 'Because it has dark skies, dry conditions, and minimal light or radio pollution', 'Because it has many mountains'], 2,
    'The Karoo provides ideal observing conditions: clear, dark skies with minimal light pollution, dry conditions, and very little radio interference from human activity. These factors make it one of the best locations in the world for both optical and radio astronomy.'),
  fb(8, 'Light ___ from cities makes it difficult to see faint stars. Observatories are built in remote locations to avoid this problem.',
    ['pollution'],
    'Light pollution is the excessive or misdirected artificial light from cities and towns that brightens the night sky, making it difficult to observe faint astronomical objects. This is why observatories like SALT are built in remote, dark locations.'),
  t(9, '### South Africa\'s Contribution to Astronomy\n\nSouth Africa plays a significant role in international astronomy:\n\n- **SALT** has made important discoveries about distant stars, galaxies, and exoplanets.\n- The **SKA** project will be the world\'s largest and most sensitive radio telescope when complete. It will help scientists study the origins of the Universe, dark energy, and gravity.\n- South African astronomers and universities contribute to global research programmes.\n- The **South African Astronomical Observatory (SAAO)** in Cape Town coordinates astronomical research across the country.\n- Astronomy inspires science education and career opportunities for young South Africans.\n\n**The Southern Cross** is so important to South Africa that it appears on our national flag and coat of arms, symbolising our connection to the stars and our place in the Southern Hemisphere.'),
  q(10, 'Which famous constellation appears on the South African flag?',
    ['Orion', 'Scorpius', 'The Southern Cross (Crux)', 'The Big Dipper'], 2,
    'The Southern Cross (Crux) appears on the South African flag, representing the country\'s location in the Southern Hemisphere. It is one of the most recognisable constellations in the southern sky and has been used for centuries as a navigation aid.'),
];

// =============================================================================
// DB INSERTION
// =============================================================================
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 8
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 8/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 8:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 8', schoolId: SCHOOL_ID, orderIndex: 8,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 8:', String(GRADE_ID));
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
    tags: ['natural-sciences', 'grade-8', 'caps'],
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
      title: 'Chapter 1: Photosynthesis and Respiration',
      description: 'Photosynthesis (requirements, products, word equation), testing for starch, respiration (word equation, occurs in all living cells), comparing photosynthesis and respiration, and the limewater test for carbon dioxide.',
      order: 1,
      lessons: [
        { title: 'Photosynthesis and Respiration', description: 'How plants make food through photosynthesis, the role of chlorophyll and chloroplasts, products of photosynthesis, the iodine test for starch, respiration in all living cells, the limewater test for CO₂, and comparing photosynthesis and respiration.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Interactions and Interdependence within the Environment',
      description: 'Ecology, ecosystems, producers, consumers, decomposers, food chains, food webs, energy pyramids, trophic levels, balance in ecosystems, adaptations, and conservation.',
      order: 2,
      lessons: [
        { title: 'Ecosystems, Food Chains, and Food Webs', description: 'Introduction to ecology, levels of ecological organisation (populations, communities, ecosystems, biosphere), producers, consumers (herbivores, carnivores, omnivores, scavengers), decomposers, food chains, food webs, trophic levels, and energy pyramids.', blocks: ch2_lesson1, term: 1 },
        { title: 'Balance, Adaptations, and Conservation', description: 'Balance in ecosystems, natural and human factors that disrupt balance, structural, functional, and behavioural adaptations, conservation efforts in South Africa, alien invasive species, predator-prey relationships, and evaluating ecosystem disruptions.', blocks: ch2_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Micro-organisms',
      description: 'Types of micro-organisms (viruses, bacteria, protists, fungi), harmful micro-organisms and disease, preventing the spread of disease, useful micro-organisms in ecosystems, food production, medicine, and renewable energy.',
      order: 3,
      lessons: [
        { title: 'Harmful and Useful Micro-organisms', description: 'Types of micro-organisms, disease-causing pathogens (TB, HIV/AIDS, malaria, cholera), preventing disease spread, Louis Pasteur, useful micro-organisms (decomposers, yeast in baking and brewing, penicillin, biogas), and indigenous knowledge of fermentation.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Introduction to the Periodic Table',
      description: 'Arrangement of elements on the Periodic Table, metals, non-metals, and semi-metals, properties of each category, atoms as building blocks of matter, elements, and diatomic molecules.',
      order: 4,
      lessons: [
        { title: 'The Periodic Table and Properties of Elements', description: 'Dmitri Mendeleev and the Periodic Table, metals, non-metals, and semi-metals, properties of each group, atoms as building blocks, elements and their symbols, the first 20 elements, and diatomic molecules.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Atoms — Structure, Compounds, and Mixtures',
      description: 'Sub-atomic particles (protons, neutrons, electrons), atomic structure, pure substances (elements and compounds), chemical bonds, decomposition reactions (electrolysis), and mixtures vs compounds.',
      order: 5,
      lessons: [
        { title: 'Atomic Structure, Compounds, and Mixtures', description: 'Sub-atomic particles and their charges, the nucleus, electrons, neutral atoms, elements vs compounds, chemical bonds, fixed ratios in compounds, decomposition by electrolysis, and the difference between mixtures and compounds.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Particle Model of Matter',
      description: 'The particle model, particles in solids, liquids, and gases, changes of state, diffusion, density, expansion and contraction, and gas pressure.',
      order: 6,
      lessons: [
        { title: 'States of Matter, Diffusion, and Density', description: 'The particle model of matter, particle arrangement in solids, liquids, and gases, changes of state (melting, boiling, condensing, freezing), diffusion in gases and liquids, density, mass, and volume, and why ice floats on water.', blocks: ch6_lesson1, term: 2 },
        { title: 'Expansion, Contraction, and Pressure', description: 'Thermal expansion and contraction using the particle model, comparing density of different materials and states, gas pressure and collisions, real-life examples (railway gaps, aerosol cans, bicycle tyres), and density investigations.', blocks: ch6_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Chemical Reactions',
      description: 'Reactants and products, what happens during a chemical reaction, signs of a chemical reaction, bond breaking and formation, examples of chemical reactions (combustion, rusting, fermentation), and indigenous knowledge of iron smelting.',
      order: 7,
      lessons: [
        { title: 'Reactants, Products, and Chemical Changes', description: 'Reactants and products in chemical reactions, rearrangement of atoms, breaking and forming bonds, signs of chemical reactions, examples (combustion, rusting, fermentation, decomposition), and indigenous knowledge of chemical reactions.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Static Electricity',
      description: 'Friction and static electricity, transfer of electrons, like and unlike charges, repulsion and attraction, static electricity in everyday life, lightning, and safety during thunderstorms.',
      order: 8,
      lessons: [
        { title: 'Static Electricity and Lightning', description: 'How rubbing materials creates static electricity, transfer of electrons, positive and negative charges, like charges repel, unlike charges attract, static electricity in everyday life, lightning as a discharge of static electricity, and safety during thunderstorms.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Energy Transfer in Electrical Systems',
      description: 'Circuits and current electricity, components of a circuit (cells, wires, switches, bulbs, resistors), electric current, filaments, effects of current (heating, magnetic, chemical), short circuits, fuses, and electrical safety.',
      order: 9,
      lessons: [
        { title: 'Circuits, Current, and Effects of Electricity', description: 'What is a circuit, components of a circuit, cells as energy sources, electric current, resistance and filaments, heating effect (kettles, heaters), magnetic effect (electromagnets), chemical effect (electrolysis), short circuits, fuses, and electrical safety.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Series and Parallel Circuits',
      description: 'Series circuits (one pathway, same current), parallel circuits (multiple pathways, independent branches), comparing series and parallel, household wiring, investigating circuits, and electrical safety in South Africa.',
      order: 10,
      lessons: [
        { title: 'Series and Parallel Circuits', description: 'Properties of series circuits, properties of parallel circuits, comparing series and parallel, why homes use parallel circuits, investigating heating effect and current strength, conductivity of metals, and electrical safety including illegal connections.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: Visible Light',
      description: 'Radiation of light, the visible spectrum (VIBGYOR), rainbows, opaque, transparent, and translucent materials, absorption and colour, reflection (smooth vs rough surfaces), refraction (prisms and lenses), and seeing light.',
      order: 11,
      lessons: [
        { title: 'Light, Reflection, and Refraction', description: 'Light travels in straight lines, the spectrum of visible light, rainbows and dispersion, opaque, transparent, and translucent materials, absorption and colour of objects, reflection (angle of incidence equals angle of reflection), refraction (bending of light), prisms, lenses, and how we see.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: The Solar System',
      description: 'The Sun and nuclear reactions, objects orbiting the Sun, the eight planets and their features, Earth\'s position and conditions for life, gravity and orbits, comets and the Oort Cloud.',
      order: 12,
      lessons: [
        { title: 'The Sun, Planets, and Conditions for Life', description: 'The Sun and nuclear fusion, objects in the Solar System (planets, asteroids, comets, Kuiper Belt, Oort Cloud), features of the eight planets, Earth\'s position and conditions that support life, gravity and orbits, and the shape of the Solar System.', blocks: ch12_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 13: Beyond the Solar System',
      description: 'The Milky Way Galaxy, our Sun\'s position, Alpha Centauri, light years, light hours, and light minutes, billions of galaxies, the Magellanic Clouds, and the scale of the Universe.',
      order: 13,
      lessons: [
        { title: 'Galaxies, Stars, and Light Years', description: 'The Milky Way Galaxy and its spiral shape, our Sun\'s position in the galaxy, Alpha Centauri (nearest visible star), light years, light hours, and light minutes as units of distance, billions of galaxies in the Universe, the Magellanic Clouds, and the scale of the observable Universe.', blocks: ch13_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 14: Looking into Space',
      description: 'Constellations and early viewing of space, types of telescopes (refracting, reflecting, radio), South African telescopes (SALT, SKA), conditions for astronomical observation, and South Africa\'s contribution to astronomy.',
      order: 14,
      lessons: [
        { title: 'Constellations and Telescopes', description: 'Constellations visible from South Africa (Southern Cross, Orion, Scorpius), types of telescopes (optical refracting, optical reflecting, radio), SALT in Sutherland, the SKA project, conditions for good astronomical observation, and South Africa\'s contribution to astronomy.', blocks: ch14_lesson1, term: 4 },
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
    title: 'Grade 8 Natural Sciences \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Life and Living (photosynthesis, respiration, ecosystems, food webs, micro-organisms), Matter and Materials (periodic table, atoms, particle model, chemical reactions), Energy and Change (static electricity, circuits, series and parallel, visible light), and Planet Earth and Beyond (solar system, galaxies, telescopes) for the Grade 8 Natural Sciences curriculum.',
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
  console.log('  TEXTBOOK: Grade 8 Natural Sciences');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
