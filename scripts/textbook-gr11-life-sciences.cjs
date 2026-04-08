const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const SCHOOL_ID = new mongoose.Types.ObjectId('69ce960a98ca4ee738d25416');
const CREATED_BY = new mongoose.Types.ObjectId('69ce960b98ca4ee738d25432');
const GRADE_ID = new mongoose.Types.ObjectId('69d2c1f317b8332733f72601');

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
// CHAPTER 1: Biodiversity of Microorganisms (Term 1)
// =============================================================================
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Biodiversity of Microorganisms\n\n### Classification and the Need for Classification Schemes\n\nMicroorganisms are organisms that are too small to be seen with the naked eye. They include viruses, bacteria, protists, and some fungi. Scientists classify organisms to:\n\n- **Organise** the enormous variety of life\n- **Identify** and name organisms consistently\n- **Understand evolutionary relationships** between organisms\n\n**Classification hierarchy (from broadest to most specific):**\n\nDomain > Kingdom > Phylum > Class > Order > Family > Genus > Species\n\nA useful mnemonic: **D**ear **K**ing **P**hilip **C**ame **O**ver **F**or **G**ood **S**paghetti\n\n**Modern classification systems** use a combination of structural features, biochemistry, genetics (DNA sequencing), and evolutionary relationships (phylogenetics) to group organisms.'),
  t(2, '### Viruses\n\nViruses are **not considered true living organisms** because they:\n- Cannot reproduce independently (need a host cell)\n- Have no cellular structure (no cytoplasm, ribosomes, or cell membrane)\n- Do not carry out metabolism on their own\n\n**Basic structure of a virus:**\n- **Nucleic acid core**: Either DNA or RNA (never both)\n- **Protein coat (capsid)**: Surrounds and protects the nucleic acid\n- Some viruses have an **envelope** (lipid membrane from the host cell)\n\n**Types of viruses:**\n| Virus | Nucleic Acid | Disease |\n|-------|-------------|--------|\n| HIV | RNA (retrovirus) | AIDS |\n| Influenza | RNA | Flu |\n| COVID-19 (SARS-CoV-2) | RNA | Respiratory illness |\n| Tobacco Mosaic Virus (TMV) | RNA | Mosaic disease in plants |\n| Bacteriophage | DNA | Infects bacteria |\n\n**Viral reproduction (lytic cycle):**\n1. Attachment to host cell\n2. Injection of nucleic acid\n3. Replication using host machinery\n4. Assembly of new viral particles\n5. Lysis (bursting) of host cell, releasing new viruses'),
  q(3, 'Why are viruses not considered truly living organisms?',
    ['Because they are very small', 'Because they cannot reproduce independently and lack cellular structure', 'Because they only infect bacteria', 'Because they do not contain any nucleic acid'], 1,
    'Viruses lack cellular structure (no cytoplasm, ribosomes, or membranes of their own) and cannot carry out metabolism or reproduce without a host cell. They are obligate intracellular parasites.'),
  fb(4, 'A virus consists of a nucleic acid core surrounded by a protein coat called a ___. Viruses that infect bacteria are called ___.',
    ['capsid', 'bacteriophages'],
    'The capsid is the protein shell that protects the viral nucleic acid. Bacteriophages are viruses that specifically target and infect bacterial cells.'),
  t(5, '### Bacteria\n\nBacteria are **prokaryotic** organisms \u2014 they lack a membrane-bound nucleus.\n\n**General structure of a bacterium:**\n- **Cell wall**: Rigid structure that maintains shape (contains peptidoglycan)\n- **Cell membrane**: Controls movement of substances in and out\n- **Cytoplasm**: Contains ribosomes (smaller 70S type) and enzymes\n- **Nucleoid region**: Circular DNA (chromosome) not enclosed by a membrane\n- **Plasmids**: Small, circular rings of extra DNA (often carry antibiotic resistance genes)\n- **Flagella**: For movement (not present in all bacteria)\n- **Pili**: Hair-like structures for attachment or DNA transfer (conjugation)\n- **Capsule/slime layer**: Protective outer layer in some species\n\n**Shapes of bacteria:**\n| Shape | Name | Example |\n|-------|------|---------|\n| Spherical | Coccus (pl. cocci) | Staphylococcus |\n| Rod-shaped | Bacillus (pl. bacilli) | Escherichia coli |\n| Spiral | Spirillum (pl. spirilla) | Treponema |\n| Comma-shaped | Vibrio | Vibrio cholerae |'),
  q(6, 'Which of the following is found in bacterial cells but NOT in animal cells?',
    ['Cell membrane', 'Ribosomes', 'Plasmids', 'DNA'], 2,
    'Plasmids are small circular DNA molecules found in bacteria but not in animal cells. Both bacteria and animal cells have cell membranes, ribosomes, and DNA, though the forms differ.'),
  t(7, '### Diseases Caused by Bacteria\n\n| Disease | Bacterium | Transmission | Symptoms |\n|---------|-----------|-------------|----------|\n| Tuberculosis (TB) | Mycobacterium tuberculosis | Airborne droplets | Chronic cough, weight loss, night sweats |\n| Cholera | Vibrio cholerae | Contaminated water | Severe diarrhoea, dehydration |\n| Gonorrhoea | Neisseria gonorrhoeae | Sexual contact | Painful urination, discharge |\n| Tetanus | Clostridium tetani | Wound infection | Muscle spasms, lockjaw |\n\n### Antibiotics\n\nAntibiotics are chemicals that kill or inhibit the growth of bacteria. They work by:\n- Disrupting cell wall synthesis (e.g., penicillin)\n- Inhibiting protein synthesis (e.g., tetracycline)\n- Interfering with DNA replication (e.g., ciprofloxacin)\n\n**Important:** Antibiotics do NOT work against viruses. Antibiotic resistance is a growing problem caused by overuse and misuse of antibiotics.'),
  q(8, 'Why are antibiotics ineffective against viruses?',
    ['Viruses are too small for antibiotics to reach', 'Viruses lack the cellular structures that antibiotics target, such as cell walls and ribosomes', 'Antibiotics cannot penetrate the viral capsid', 'Viruses mutate too quickly for antibiotics to work'], 1,
    'Antibiotics target bacterial structures such as cell walls (peptidoglycan), bacterial ribosomes, and bacterial DNA replication enzymes. Viruses lack all of these structures, so antibiotics have no target in a virus.'),
  t(9, '### Protists\n\nProtists are **eukaryotic** organisms that do not fit into the plant, animal, or fungus kingdoms. They can be unicellular or multicellular.\n\n**Types of protists:**\n\n| Type | Nutrition | Movement | Examples |\n|------|----------|----------|----------|\n| Plant-like (algae) | Autotrophic (photosynthesis) | Some flagella | Chlorella, Spirogyra, kelp |\n| Animal-like (protozoa) | Heterotrophic | Pseudopodia, cilia, flagella | Amoeba, Paramecium, Plasmodium |\n| Fungus-like | Heterotrophic (decomposers) | Spores | Slime moulds |\n\n**Disease example:** Malaria is caused by the protist **Plasmodium**, transmitted by the female Anopheles mosquito. The parasite destroys red blood cells, causing fever, chills, and anaemia.'),
  fb(10, 'Protists are ___ organisms (they have membrane-bound organelles). Malaria is caused by the protist ___, which is transmitted by mosquitoes.',
    ['eukaryotic', 'Plasmodium'],
    'Unlike bacteria, protists are eukaryotic (they have a nucleus and membrane-bound organelles). Plasmodium is the parasitic protist responsible for malaria.'),
];

blockNum = 0;
const ch1_lesson2 = [
  t(1, '## Fungi, Symbiosis, and Biotechnology\n\n### Fungi\n\nFungi are **eukaryotic** organisms that are heterotrophic \u2014 they obtain nutrition by secreting enzymes onto organic matter and absorbing the digested nutrients (**extracellular digestion**).\n\n**General characteristics:**\n- Cell walls made of **chitin** (not cellulose like plants)\n- Body consists of a network of thread-like filaments called **hyphae** (singular: hypha)\n- A mass of hyphae is called a **mycelium**\n- Reproduce by **spores** (sexual and asexual)\n- Most are saprophytic (feed on dead organic matter) \u2014 important decomposers\n\n**Common fungal groups:**\n| Group | Features | Examples |\n|-------|----------|----------|\n| Yeasts | Unicellular, reproduce by budding | Saccharomyces cerevisiae |\n| Moulds | Multicellular, fuzzy appearance | Penicillium, Rhizopus (bread mould) |\n| Mushrooms | Large fruiting bodies | Agaricus (button mushroom) |\n\n**Fungal diseases:**\n- Athlete\u2019s foot (skin infection)\n- Ringworm (skin infection, not actually a worm)\n- Candidiasis (thrush, caused by Candida)'),
  q(2, 'How do fungi obtain their nutrition?',
    ['By photosynthesis', 'By ingesting food particles', 'By secreting enzymes externally and absorbing digested nutrients', 'By absorbing minerals from soil through roots'], 2,
    'Fungi are heterotrophic and use extracellular digestion. They secrete digestive enzymes onto organic matter, breaking it down externally, and then absorb the soluble nutrients through their hyphae.'),
  t(3, '### Symbiotic Relationships Involving Microorganisms\n\nSymbiosis is a close, long-term biological interaction between two different species.\n\n**Types of symbiosis:**\n\n| Type | Organism A | Organism B | Example |\n|------|-----------|-----------|--------|\n| **Mutualism** | Benefits (+) | Benefits (+) | Mycorrhizae (fungi + plant roots) |\n| **Commensalism** | Benefits (+) | Unaffected (0) | Bacteria on human skin |\n| **Parasitism** | Benefits (+) | Harmed (\u2013) | Plasmodium in human blood |\n\n**Key examples of mutualism:**\n- **Mycorrhizae**: Fungi growing on/in plant roots. The fungus absorbs water and minerals for the plant; the plant provides sugars to the fungus.\n- **Lichens**: A mutualistic association between a fungus and an alga (or cyanobacterium). The alga photosynthesises and provides food; the fungus provides a protected structure and absorbs water.\n- **Gut bacteria in ruminants**: Bacteria in the rumen break down cellulose for the cow; the bacteria receive food and a warm environment.'),
  fb(4, 'In mutualism, ___ organisms benefit from the relationship. Mycorrhizae are a mutualistic association between fungi and ___.',
    ['both', 'plant roots'],
    'Mutualism is a symbiotic relationship where both partners benefit. Mycorrhizal fungi form associations with plant roots, improving mineral and water uptake for the plant while receiving organic carbon from photosynthesis.'),
  t(5, '### Nitrogen Fixation\n\nNitrogen gas (N\u2082) makes up 78% of the atmosphere but cannot be used directly by most organisms. It must be converted into usable forms.\n\n**Nitrogen fixation** is the conversion of atmospheric N\u2082 into ammonia (NH\u2083) or ammonium (NH\u2084\u207a).\n\n**Biological nitrogen fixation:**\n- Carried out by certain bacteria, especially **Rhizobium**\n- Rhizobium lives in **root nodules** of leguminous plants (beans, peas, clover)\n- This is a **mutualistic** relationship: the bacterium fixes nitrogen for the plant; the plant provides carbon compounds and a protected environment\n\n**The nitrogen cycle (simplified):**\n1. **Nitrogen fixation**: N\u2082 \u2192 NH\u2083/NH\u2084\u207a (by Rhizobium and lightning)\n2. **Nitrification**: NH\u2084\u207a \u2192 NO\u2082\u207b \u2192 NO\u2083\u207b (by Nitrosomonas and Nitrobacter)\n3. **Assimilation**: Plants absorb NO\u2083\u207b and NH\u2084\u207a to make amino acids and proteins\n4. **Decomposition/Ammonification**: Dead organisms \u2192 NH\u2083/NH\u2084\u207a (by decomposers)\n5. **Denitrification**: NO\u2083\u207b \u2192 N\u2082 (by denitrifying bacteria, returns N\u2082 to atmosphere)'),
  q(6, 'Which bacterium is responsible for nitrogen fixation in the root nodules of legumes?',
    ['Nitrobacter', 'Rhizobium', 'Lactobacillus', 'E. coli'], 1,
    'Rhizobium bacteria form a mutualistic relationship with leguminous plants, living in root nodules where they fix atmospheric nitrogen into ammonia, which the plant can use to make amino acids and proteins.'),
  t(7, '### Traditional Technology and Biotechnology Using Microorganisms\n\nHumans have used microorganisms in food production for thousands of years.\n\n**Traditional uses:**\n| Product | Microorganism | Process |\n|---------|--------------|--------|\n| Bread | Saccharomyces cerevisiae (yeast) | Yeast ferments sugar, producing CO\u2082 (causes dough to rise) and ethanol (evaporates during baking) |\n| Beer and wine | Saccharomyces cerevisiae | Anaerobic fermentation of sugars produces ethanol and CO\u2082 |\n| Yoghurt | Lactobacillus | Lactic acid fermentation of milk sugar (lactose) |\n| Cheese | Lactobacillus, Penicillium | Bacteria curdle milk; some cheeses use Penicillium moulds for flavour |\n| Sauerkraut | Lactobacillus | Lactic acid fermentation of cabbage |\n| Soy sauce | Aspergillus (mould) | Fermentation of soybeans |\n\n**Modern biotechnology:**\n- **Antibiotic production**: Penicillin is produced by the mould Penicillium notatum (discovered by Alexander Fleming in 1928)\n- **Bioremediation**: Using microorganisms to clean up environmental pollution (e.g., oil spills)\n- **Genetic engineering**: Inserting genes into bacteria to produce useful substances (e.g., insulin production by E. coli)'),
  q(8, 'Which microorganism is used to produce yoghurt from milk?',
    ['Saccharomyces cerevisiae', 'Penicillium notatum', 'Lactobacillus', 'Rhizopus'], 2,
    'Lactobacillus bacteria carry out lactic acid fermentation, converting the lactose (milk sugar) into lactic acid. This lowers the pH, causing the milk proteins to coagulate and giving yoghurt its thick texture and tangy taste.'),
  q(9, 'Alexander Fleming discovered penicillin from which microorganism?',
    ['Streptococcus', 'Saccharomyces', 'Penicillium notatum', 'Lactobacillus'], 2,
    'In 1928, Alexander Fleming noticed that the mould Penicillium notatum inhibited bacterial growth on an agar plate. This observation led to the development of penicillin, the first widely used antibiotic.'),
  fb(10, 'In bread-making, yeast carries out ___ fermentation, producing carbon dioxide and ___. The antibiotic penicillin was discovered by ___.',
    ['anaerobic', 'ethanol', 'Alexander Fleming'],
    'Yeast (Saccharomyces cerevisiae) ferments sugar anaerobically, producing CO\u2082 (which makes dough rise) and ethanol (which evaporates during baking). Penicillin was discovered by Alexander Fleming in 1928.'),
];

// =============================================================================
// CHAPTER 2: Biodiversity of Plants (Term 1)
// =============================================================================
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Biodiversity of Plants\n\n### Overview of the Plant Kingdom\n\nPlants are multicellular, eukaryotic, autotrophic organisms that carry out photosynthesis. They have cell walls made of **cellulose** and store energy as **starch**.\n\n**Major plant divisions studied at Grade 11:**\n\n| Division | Common Name | Vascular Tissue | Seeds | Examples |\n|----------|------------|----------------|-------|----------|\n| Bryophyta | Mosses, liverworts | No (non-vascular) | No | Moss, liverworts |\n| Pteridophyta | Ferns, horsetails | Yes | No (spores) | Bracken fern |\n| Gymnospermae | Conifers, cycads | Yes | Yes (naked/exposed) | Pine, cycad |\n| Angiospermae | Flowering plants | Yes | Yes (enclosed in fruit) | Rose, maize, oak |\n\n**Evolutionary trend:** From non-vascular, spore-producing plants (mosses) to vascular, seed-producing plants (gymnosperms and angiosperms). This represents increasing adaptation to life on land.'),
  t(2, '### Bryophytes (Mosses and Liverworts)\n\n**Key characteristics:**\n- **Non-vascular**: No xylem or phloem (water and nutrients move by diffusion and osmosis)\n- Small in size (limited by lack of transport system)\n- No true roots, stems, or leaves (have rhizoids, a stalk, and leaf-like structures)\n- **Rhizoids** anchor the plant but do not absorb water efficiently like true roots\n- Reproduce by **spores** (not seeds)\n- Require **water for fertilisation** (motile sperm swim through water to reach the egg)\n- Dominant generation is the **gametophyte** (haploid plant body)\n- Habitat: Moist, shady environments (forest floors, rocks near water)\n\n**Life cycle:** The gametophyte produces gametes. After fertilisation, a **sporophyte** (diploid) grows on the gametophyte and produces spores. Spores are released and germinate into new gametophytes.'),
  q(3, 'Why are bryophytes restricted to moist environments?',
    ['They need sunlight that is filtered through water', 'They require water for the motile sperm to swim to the egg during fertilisation', 'Their cell walls dissolve in dry conditions', 'They cannot carry out photosynthesis without surface water'], 1,
    'Bryophytes have flagellated (motile) sperm that must swim through a film of water to reach the egg. Without water, fertilisation cannot occur. They also lack vascular tissue, so they rely on moisture for transport.'),
  t(4, '### Pteridophytes (Ferns)\n\n**Key characteristics:**\n- **Vascular**: Have xylem and phloem (can grow taller than mosses)\n- True roots, stems (rhizomes, usually underground), and leaves (fronds)\n- Leaves are often large and divided (called **fronds**)\n- Reproduce by **spores** produced in clusters called **sori** (singular: sorus) on the underside of fronds\n- Still require **water for fertilisation** (motile sperm)\n- Dominant generation is the **sporophyte** (diploid plant body)\n\n**Comparison with bryophytes:**\n- Ferns are larger because vascular tissue supports greater height\n- Ferns have true roots for better water absorption\n- Both still need water for reproduction\n- In ferns, the sporophyte is dominant; in mosses, the gametophyte is dominant'),
  fb(5, 'Ferns reproduce by ___ that are produced in clusters called sori on the underside of the fronds. Unlike mosses, the dominant generation in ferns is the ___.',
    ['spores', 'sporophyte'],
    'Fern spores develop in sporangia grouped into sori on the underside of fronds. The large, visible fern plant is the diploid sporophyte, whereas in mosses the dominant visible plant is the haploid gametophyte.'),
  t(6, '### Gymnosperms (Conifers and Cycads)\n\n**Key characteristics:**\n- **Vascular**: Well-developed xylem and phloem\n- Produce **seeds** (a major evolutionary advance over spores)\n- Seeds are **naked** (not enclosed in a fruit) \u2014 typically borne on cones\n- Do NOT produce flowers or fruits\n- **Pollen** replaces the need for water in fertilisation (pollen is carried by wind)\n- Mostly evergreen with needle-like or scale-like leaves (reduces water loss)\n- Examples: Pine trees, cypress, cycads\n\n**Advantages of seeds over spores:**\n- Seeds contain a food reserve (endosperm) for the developing embryo\n- The seed coat protects the embryo from desiccation and damage\n- Seeds can remain dormant until conditions are favourable\n- Seeds are larger and more resilient than spores'),
  q(7, 'What does the term "gymnosperm" mean, and how does it relate to the plant?',
    ['Covered seed \u2014 seeds are enclosed in fruit', 'Naked seed \u2014 seeds are not enclosed in a fruit but are exposed on cones', 'Hidden spore \u2014 spores are hidden inside the stem', 'Ancient plant \u2014 they are the oldest land plants'], 1,
    '"Gymnosperm" comes from the Greek words gymnos (naked) and sperma (seed). Gymnosperm seeds are not enclosed in a fruit \u2014 they develop on the scales of cones and are therefore "naked" or exposed.'),
  t(8, '### Angiosperms (Flowering Plants)\n\n**Key characteristics:**\n- **Vascular**: Highly developed xylem and phloem\n- Produce **flowers** (reproductive structures)\n- Seeds are **enclosed in a fruit** (angio = vessel/container, sperm = seed)\n- Most diverse and successful group of plants on Earth\n- Pollination by wind, water, insects, birds, or other animals\n- **Double fertilisation** is unique to angiosperms\n\n**Two classes of angiosperms:**\n| Feature | Monocotyledons (Monocots) | Dicotyledons (Dicots) |\n|---------|--------------------------|----------------------|\n| Seed leaves | 1 cotyledon | 2 cotyledons |\n| Leaf veins | Parallel | Net-like (branching) |\n| Flower parts | Multiples of 3 | Multiples of 4 or 5 |\n| Vascular bundles | Scattered in stem | Arranged in a ring |\n| Root system | Fibrous | Taproot |\n| Examples | Grass, maize, lilies | Roses, beans, sunflowers |'),
  q(9, 'Which feature is unique to angiosperms and not found in gymnosperms?',
    ['Vascular tissue', 'Seed production', 'Flowers and fruits', 'Pollen production'], 2,
    'Angiosperms are the only plants that produce true flowers and fruits. Gymnosperms produce seeds but bear them on cones without flowers or fruits. Both groups have vascular tissue and produce pollen.'),
  fb(10, 'Monocotyledons have ___ seed leaf/leaves and parallel leaf veins, while dicotyledons have ___ seed leaves and net-like leaf venation.',
    ['one', 'two'],
    'Monocots (e.g., grasses, maize) have one cotyledon (seed leaf) and parallel venation. Dicots (e.g., beans, roses) have two cotyledons and net-like (reticulate) venation.'),
];

blockNum = 0;
const ch2_lesson2 = [
  t(1, '## Plant Reproduction and Vascular Tissue\n\n### Vascular Tissue in Plants\n\n**Xylem:**\n- Transports **water and dissolved minerals** from roots to leaves\n- Movement is **upward only** (unidirectional)\n- Consists of dead, hollow cells with lignified walls (providing structural support)\n- Transport driven by **transpiration pull**, root pressure, and capillarity\n\n**Phloem:**\n- Transports **organic solutes** (mainly sucrose) from sources (leaves) to sinks (roots, fruits, growing points)\n- Movement is **bidirectional** (up or down)\n- Consists of living cells: **sieve tube elements** (with sieve plates) and **companion cells**\n- Transport driven by **pressure flow** (mass flow hypothesis)\n\n| Feature | Xylem | Phloem |\n|---------|-------|--------|\n| Transported substance | Water and minerals | Sucrose and amino acids |\n| Direction | Upward | Bidirectional |\n| Cell status | Dead at maturity | Living |\n| Wall thickening | Lignin | No lignin |'),
  q(2, 'Which statement about xylem is correct?',
    ['Xylem transports sugars bidirectionally', 'Xylem consists of living cells with thin walls', 'Xylem transports water and minerals upward in dead, lignified cells', 'Xylem uses ATP to pump water to the leaves'], 2,
    'Xylem consists of dead, hollow cells with lignified walls. It transports water and dissolved minerals unidirectionally from roots to shoots, driven mainly by transpiration pull.'),
  t(3, '### Sexual Reproduction in Angiosperms\n\n**Structure of a flower:**\n- **Sepals**: Protect the flower bud (collectively called the calyx)\n- **Petals**: Attract pollinators (collectively called the corolla)\n- **Stamens** (male part): Consists of the **anther** (produces pollen) and **filament** (supports the anther)\n- **Carpel/Pistil** (female part): Consists of the **stigma** (receives pollen), **style** (connects stigma to ovary), and **ovary** (contains ovules)\n\n**Pollination** is the transfer of pollen from an anther to a stigma.\n\n| Feature | Wind pollination | Insect pollination |\n|---------|-----------------|-------------------|\n| Pollen | Small, light, smooth, abundant | Larger, sticky, spiky |\n| Flowers | Small, dull, no scent or nectar | Large, colourful, scented, nectar |\n| Stigma | Large, feathery (to catch pollen) | Sticky |\n| Anthers | Hang outside flower | Inside flower |\n| Examples | Grasses, maize | Roses, sunflowers |'),
  fb(4, 'The male part of a flower is the ___, which consists of the anther and filament. The female part is the ___, consisting of the stigma, style, and ovary.',
    ['stamen', 'carpel'],
    'The stamen (male organ) produces pollen in its anther, supported by the filament. The carpel (or pistil, the female organ) has a sticky stigma to receive pollen, a style connecting to the ovary, which contains ovules.'),
  t(5, '### Fertilisation and Seed Formation\n\n**Double fertilisation (unique to angiosperms):**\n1. Pollen grain lands on the stigma and germinates, forming a **pollen tube** that grows down through the style to the ovule\n2. The pollen tube contains two male gametes (sperm nuclei)\n3. One sperm fuses with the **egg cell** \u2192 **zygote** (2n) \u2192 develops into the **embryo**\n4. The other sperm fuses with the two **polar nuclei** \u2192 **triploid endosperm** (3n) \u2192 provides nutrition for the developing embryo\n\n**After fertilisation:**\n- Ovule develops into a **seed** (containing embryo + endosperm + seed coat)\n- Ovary develops into a **fruit** (protects seeds and aids dispersal)\n- Petals, stamens, and style wither and fall off'),
  q(6, 'What is double fertilisation?',
    ['Two pollen grains fertilise two different eggs', 'One sperm fertilises the egg and another fuses with the polar nuclei to form endosperm', 'The egg is fertilised twice by the same sperm', 'Two eggs are fertilised by two sperm from different plants'], 1,
    'Double fertilisation is unique to angiosperms. One sperm nucleus fuses with the egg cell to form the diploid zygote (which becomes the embryo). The second sperm nucleus fuses with the two polar nuclei to form the triploid endosperm (nutritive tissue).'),
  t(7, '### Asexual (Vegetative) Reproduction in Plants\n\nAsexual reproduction produces genetically identical offspring (clones) from a single parent without gametes or fertilisation.\n\n**Natural methods:**\n| Method | Description | Example |\n|--------|-----------|--------|\n| Runners/Stolons | Horizontal stems that grow along the surface and produce new plants at nodes | Strawberry, Bermuda grass |\n| Rhizomes | Underground horizontal stems that produce new shoots | Ginger, ferns |\n| Bulbs | Underground storage organs that produce new plants | Onion, tulip |\n| Tubers | Swollen underground stems with buds (eyes) | Potato |\n| Suckers | Shoots that grow from the roots of the parent plant | Banana, raspberry |\n\n**Artificial methods:**\n- **Cuttings**: A stem or leaf is cut and placed in soil/water to grow roots\n- **Grafting**: A shoot (scion) is joined to a rootstock of another plant\n- **Layering**: A branch is bent to the ground, covered with soil, and roots develop\n\n**Advantages of asexual reproduction:** Fast, requires only one parent, preserves desirable traits.\n**Disadvantages:** No genetic variation (population vulnerable to disease).'),
  q(8, 'Why is a lack of genetic variation a disadvantage of asexual reproduction?',
    ['Because the offspring are too similar in appearance', 'Because all individuals are susceptible to the same diseases and environmental changes', 'Because the plants cannot photosynthesise as well', 'Because there is too much competition for resources'], 1,
    'Without genetic variation, all individuals in a population share the same weaknesses. A single disease or environmental change could potentially destroy the entire population because none of the individuals may have resistance.'),
  fb(9, 'In asexual reproduction, offspring are genetically ___ to the parent. Potatoes reproduce asexually using swollen underground stems called ___.',
    ['identical', 'tubers'],
    'Asexual reproduction involves mitosis only, so offspring are genetic clones of the parent. Potato tubers are modified underground stems with buds (eyes) that can grow into new plants.'),
  q(10, 'Which of the following is an advantage of seed production over spore production?',
    ['Seeds are smaller and lighter', 'Seeds contain a food reserve and protective coat, allowing the embryo to survive harsh conditions', 'Spores require more energy to produce', 'Seeds germinate faster in water'], 1,
    'Seeds contain an embryo, a food reserve (endosperm), and a protective seed coat. This allows the embryo to survive desiccation and harsh conditions and provides energy for germination. Spores are single cells with no food reserve.'),
];

// =============================================================================
// CHAPTER 3: Biodiversity of Animals (Term 1)
// =============================================================================
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Biodiversity of Animals\n\n### Key Concepts in Animal Classification\n\nAnimals are multicellular, eukaryotic, heterotrophic organisms. They lack cell walls and are generally capable of movement.\n\n**Key features used to classify animals:**\n- **Symmetry**: Asymmetrical, radial (circular), or bilateral (left-right mirror image)\n- **Body cavity (coelom)**: Acoelomate (no cavity), pseudocoelomate, or coelomate (true body cavity)\n- **Germ layers**: Diploblastic (two layers: ectoderm, endoderm) or triploblastic (three layers: ectoderm, mesoderm, endoderm)\n- **Segmentation**: Present or absent\n- **Skeleton type**: Hydrostatic, exoskeleton, or endoskeleton\n- **Digestive system**: Incomplete (one opening) or complete (mouth and anus)\n\n**Six phyla studied in Grade 11:**\nPorifera, Cnidaria, Platyhelminthes, Annelida, Arthropoda, Chordata'),
  t(2, '### Phylum Porifera (Sponges)\n\n**Key features:**\n- Aquatic (mostly marine)\n- **Asymmetrical** body\n- Body is perforated with **pores** (ostia) through which water flows\n- No true tissues, organs, or nervous system\n- **Sessile** (attached to a surface, cannot move)\n- Feed by **filter feeding** \u2014 water carrying food particles flows through the body\n- Skeleton made of **spicules** (tiny needles of calcium carbonate or silica) and/or **spongin** (protein fibres)\n- Reproduction: Asexual (budding, fragmentation) and sexual\n- **Diploblastic** (but so simple that germ layers are debated)\n- Example: Bath sponge\n\n**Ecological role:** Sponges filter large volumes of water, helping to keep aquatic ecosystems clean.'),
  t(3, '### Phylum Cnidaria (Jellyfish, Corals, Sea Anemones)\n\n**Key features:**\n- Aquatic (mostly marine)\n- **Radial symmetry**\n- **Diploblastic** (two cell layers: ectoderm and endoderm, separated by mesoglea)\n- Have specialised stinging cells called **cnidocytes** (containing nematocysts) for catching prey and defence\n- Two body forms: **polyp** (sessile, e.g., sea anemone) and **medusa** (free-swimming, e.g., jellyfish)\n- **Incomplete digestive system** \u2014 single opening (gastrovascular cavity) serves as both mouth and anus\n- Have a simple nerve net (no brain)\n- Reproduction: Asexual (budding) and sexual\n- Examples: Jellyfish (Aurelia), hydra, coral, sea anemone\n\n**Ecological role:** Corals build reefs that provide habitat for thousands of marine species.'),
  q(4, 'What feature distinguishes cnidarians from all other animal phyla?',
    ['Bilateral symmetry', 'The presence of cnidocytes (stinging cells)', 'A complete digestive system', 'An exoskeleton'], 1,
    'Cnidocytes are unique to cnidarians. These specialised cells contain nematocysts \u2014 tiny, coiled, harpoon-like structures that fire when triggered, injecting venom into prey or predators.'),
  t(5, '### Phylum Platyhelminthes (Flatworms)\n\n**Key features:**\n- **Bilateral symmetry**\n- **Triploblastic** (three germ layers: ectoderm, mesoderm, endoderm)\n- **Acoelomate** (no body cavity \u2014 body is solid between gut and outer body wall)\n- Dorsoventrally flattened (flat from top to bottom)\n- **Incomplete digestive system** (one opening) or no gut at all (in tapeworms)\n- No circulatory or respiratory system (gas exchange by diffusion across flat body)\n- **Cephalisation**: Concentration of nerve tissue at the head end\n- Many are parasites\n\n**Classes:**\n| Class | Example | Lifestyle |\n|-------|---------|----------|\n| Turbellaria | Planaria | Free-living (in freshwater) |\n| Trematoda | Liver fluke | Parasitic |\n| Cestoda | Tapeworm | Parasitic (lives in intestines) |\n\nTapeworms absorb pre-digested food through their body surface (they have no mouth or gut).'),
  fb(6, 'Flatworms are ___ (they have three germ layers) and ___ (they have no body cavity).',
    ['triploblastic', 'acoelomate'],
    'Platyhelminthes have three germ layers (ectoderm, mesoderm, endoderm), making them triploblastic. They lack a body cavity (coelom), so they are acoelomate \u2014 the space between the gut and body wall is filled with tissue.'),
  t(7, '### Phylum Annelida (Segmented Worms)\n\n**Key features:**\n- **Bilateral symmetry**\n- **Triploblastic** with a true **coelom** (coelomate)\n- Body divided into repeating segments (**metamerism**)\n- **Complete digestive system** (mouth and anus \u2014 one-way gut)\n- **Closed circulatory system** (blood flows within vessels)\n- Gas exchange through moist skin\n- Movement by **longitudinal and circular muscles** working against the **hydrostatic skeleton** (fluid-filled coelom)\n- **Chaetae** (bristles) on each segment aid in movement (in most classes)\n\n**Classes:**\n| Class | Example | Habitat |\n|-------|---------|--------|\n| Oligochaeta | Earthworm | Terrestrial soil |\n| Polychaeta | Sandworm, ragworm | Marine |\n| Hirudinea | Leech | Freshwater (some parasitic) |\n\n**Ecological role of earthworms:** Aerate soil, break down organic matter, improve drainage and nutrient cycling \u2014 essential for agriculture.'),
  q(8, 'Which feature of annelids distinguishes them from flatworms?',
    ['Bilateral symmetry', 'Three germ layers', 'A true coelom and segmented body', 'Cephalisation'], 2,
    'Both annelids and flatworms are bilaterally symmetrical and triploblastic. However, annelids have a true coelom (body cavity lined with mesoderm) and a segmented body, whereas flatworms are acoelomate and unsegmented.'),
  t(9, '### Phylum Arthropoda (Insects, Spiders, Crustaceans)\n\n**Key features:**\n- Largest phylum in the animal kingdom (over 80% of all known animal species)\n- **Bilateral symmetry**\n- **Triploblastic**, **coelomate**\n- **Exoskeleton** made of **chitin** (must moult/shed to grow)\n- **Jointed appendages** (arthro = joint, pod = foot)\n- Segmented body organised into **tagmata** (head, thorax, abdomen \u2014 sometimes fused)\n- **Open circulatory system** (haemolymph flows in open spaces called sinuses)\n- Well-developed nervous system with a brain and compound eyes (in many)\n\n**Major classes:**\n| Class | Legs | Body Sections | Antennae | Examples |\n|-------|------|--------------|----------|----------|\n| Insecta | 6 (3 pairs) | Head, thorax, abdomen | 1 pair | Beetle, butterfly, bee |\n| Arachnida | 8 (4 pairs) | Cephalothorax, abdomen | None | Spider, scorpion, tick |\n| Crustacea | 10+ | Cephalothorax, abdomen | 2 pairs | Crab, lobster, shrimp |\n| Myriapoda | Many | Head + many segments | 1 pair | Centipede, millipede |'),
  q(10, 'Why must arthropods moult (shed their exoskeleton)?',
    ['To change colour for camouflage', 'Because the rigid exoskeleton cannot expand, so it must be shed to allow growth', 'To remove parasites from the body surface', 'To regulate their body temperature'], 1,
    'The chitin exoskeleton is rigid and cannot stretch. As the arthropod grows, it must periodically shed (moult) the old exoskeleton and produce a new, larger one. This process is called ecdysis.'),
];

blockNum = 0;
const ch3_lesson2 = [
  t(1, '## Phylum Chordata and Comparative Tables\n\n### Phylum Chordata\n\n**Key features (present at some stage of development):**\n- **Notochord**: A flexible, rod-shaped support structure (replaced by the vertebral column in vertebrates)\n- **Dorsal hollow nerve cord**: Develops into the brain and spinal cord in vertebrates\n- **Pharyngeal slits**: Openings in the throat region (become gills in fish, modified in land vertebrates)\n- **Post-anal tail**: A tail extending beyond the anus (reduced or absent in some adults, e.g., humans)\n\n**Subphylum Vertebrata (vertebrates):**\n\n| Class | Body Covering | Breathing | Heart | Thermoregulation | Reproduction | Examples |\n|-------|-------------|-----------|-------|-----------------|-------------|----------|\n| Fish | Scales (mucus) | Gills | 2 chambers | Ectothermic | External fertilisation, oviparous | Tilapia, shark |\n| Amphibia | Moist skin | Lungs + skin | 3 chambers | Ectothermic | External fertilisation, oviparous | Frog, toad |\n| Reptilia | Dry scales | Lungs | 3 chambers (incomplete septum) | Ectothermic | Internal fertilisation, oviparous | Lizard, crocodile |\n| Aves (Birds) | Feathers | Lungs + air sacs | 4 chambers | Endothermic | Internal fertilisation, oviparous | Eagle, penguin |\n| Mammalia | Hair/fur | Lungs | 4 chambers | Endothermic | Internal fertilisation, viviparous | Human, whale |'),
  q(2, 'Which of the following is a defining characteristic of ALL chordates at some stage of their development?',
    ['A vertebral column', 'Lungs for gas exchange', 'A notochord', 'An exoskeleton'], 2,
    'All chordates possess a notochord at some stage of development. In vertebrates, this is largely replaced by the vertebral column in the adult. Not all chordates develop lungs or a vertebral column.'),
  t(3, '### Comparative Table of the Six Phyla\n\n| Feature | Porifera | Cnidaria | Platyhelminthes | Annelida | Arthropoda | Chordata |\n|---------|----------|----------|----------------|----------|-----------|----------|\n| Symmetry | Asymmetric | Radial | Bilateral | Bilateral | Bilateral | Bilateral |\n| Germ layers | \u2014 | 2 (diploblastic) | 3 (triploblastic) | 3 | 3 | 3 |\n| Body cavity | None | None | None (acoelomate) | Coelom | Coelom | Coelom |\n| Digestive system | None | Incomplete | Incomplete | Complete | Complete | Complete |\n| Circulatory system | None | None | None | Closed | Open | Closed |\n| Skeleton | Spicules/spongin | Hydrostatic | None | Hydrostatic | Exoskeleton (chitin) | Endoskeleton (bone/cartilage) |\n| Segmentation | No | No | No | Yes | Yes | Yes (vertebrae) |\n| Nervous system | None | Nerve net | Ladder-type | Ventral nerve cord | Ventral nerve cord + brain | Dorsal nerve cord + brain |'),
  fb(4, 'Annelids have a ___ circulatory system (blood in vessels), while arthropods have an ___ circulatory system (haemolymph in open spaces).',
    ['closed', 'open'],
    'Annelids have blood flowing within closed vessels (closed circulatory system). Arthropods have an open circulatory system where haemolymph bathes the organs directly in body cavities called sinuses.'),
  t(5, '### Role of Animals in Agriculture and Ecosystems\n\n**Beneficial roles:**\n- **Earthworms** (Annelida): Aerate soil, decompose organic matter, improve soil fertility and drainage\n- **Bees and butterflies** (Arthropoda): Pollinate crops \u2014 essential for food production\n- **Dung beetles** (Arthropoda): Break down animal dung, recycle nutrients into soil\n- **Predators** (birds, frogs, spiders): Control pest populations naturally (biological pest control)\n- **Decomposers** (various invertebrates): Break down dead organisms, recycling nutrients\n\n**Harmful roles:**\n- **Crop pests**: Locusts, aphids, and caterpillars damage crops\n- **Livestock parasites**: Ticks, tapeworms, and liver flukes cause disease in farm animals\n- **Disease vectors**: Mosquitoes (malaria), tsetse flies (sleeping sickness)\n\n**Conservation:** Biodiversity loss threatens ecosystem stability. Monoculture farming, pesticide use, and habitat destruction reduce animal diversity. Sustainable agriculture practices (crop rotation, integrated pest management, conservation of natural habitats) help maintain biodiversity.'),
  q(6, 'How do earthworms benefit agriculture?',
    ['They eat crop seeds and spread them', 'They prey on insect pests', 'They aerate the soil, decompose organic matter, and improve nutrient cycling', 'They pollinate flowering crops'], 2,
    'Earthworms burrow through soil, creating channels that improve aeration and drainage. They consume dead organic matter and excrete nutrient-rich castings, enhancing soil fertility. Charles Darwin called them the most important animals for soil health.'),
  q(7, 'Which arthropod class contains organisms with exactly six legs?',
    ['Arachnida', 'Crustacea', 'Insecta', 'Myriapoda'], 2,
    'Insects (class Insecta) have exactly three pairs of legs (six legs). Arachnids have four pairs (eight), crustaceans have five or more pairs, and myriapods have many pairs.'),
  t(8, '### Evolutionary Trends Across Animal Phyla\n\nMoving from Porifera to Chordata, we see the following evolutionary trends:\n\n1. **Symmetry**: Asymmetry \u2192 radial \u2192 bilateral\n2. **Germ layers**: No layers \u2192 diploblastic \u2192 triploblastic\n3. **Body cavity**: None \u2192 acoelomate \u2192 coelomate\n4. **Digestive system**: None \u2192 incomplete (one opening) \u2192 complete (two openings)\n5. **Nervous system**: None \u2192 nerve net \u2192 nerve cord + brain (increasing cephalisation)\n6. **Circulatory system**: None \u2192 open \u2192 closed\n7. **Skeleton**: None \u2192 hydrostatic \u2192 exoskeleton \u2192 endoskeleton\n8. **Segmentation**: Absent \u2192 present\n\nThese trends represent increasing complexity and efficiency, allowing organisms to occupy more diverse habitats and ecological niches.'),
  fb(9, 'The evolutionary trend in body symmetry moves from asymmetry in sponges, to ___ symmetry in cnidarians, to ___ symmetry in worms, arthropods, and chordates.',
    ['radial', 'bilateral'],
    'Sponges have no symmetry (asymmetrical). Cnidarians have radial symmetry (can be divided into equal halves along any plane through the centre). More complex phyla have bilateral symmetry (a single plane of symmetry divides the body into left and right halves).'),
  q(10, 'Which phylum contains the greatest number of known species?',
    ['Chordata', 'Annelida', 'Arthropoda', 'Cnidaria'], 2,
    'Arthropoda is by far the largest animal phylum, containing over 80% of all known animal species. This includes millions of insect species alone, plus arachnids, crustaceans, and myriapods.'),
];

// =============================================================================
// CHAPTER 4: Photosynthesis (Term 2)
// =============================================================================
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Photosynthesis\n\n### Overview\n\nPhotosynthesis is the process by which green plants, algae, and some bacteria convert light energy into chemical energy (glucose), using carbon dioxide and water.\n\n**Overall equation:**\n\n6CO\u2082 + 6H\u2082O \u2192 (light energy + chlorophyll) \u2192 C\u2086H\u2081\u2082O\u2086 + 6O\u2082\n\nCarbon dioxide + Water \u2192 Glucose + Oxygen\n\n**Photosynthesis is essential because:**\n- It produces **glucose** (food/energy source for the plant and, through food chains, for almost all life)\n- It produces **oxygen** (needed for aerobic respiration by most organisms)\n- It removes **CO\u2082** from the atmosphere (helps regulate climate)\n- It is the ultimate source of almost all food and fossil fuels on Earth'),
  t(2, '### Chloroplast Structure\n\nPhotosynthesis occurs in **chloroplasts**, which are found mainly in the mesophyll cells of leaves.\n\n**Structure of a chloroplast:**\n- **Outer membrane**: Smooth, permeable outer boundary\n- **Inner membrane**: Selectively permeable\n- **Stroma**: Fluid-filled matrix (site of the dark reactions / Calvin cycle)\n- **Thylakoids**: Flattened membrane-bound sacs within the stroma\n- **Grana** (singular: granum): Stacks of thylakoids (site of the light reactions)\n- **Thylakoid membrane**: Contains chlorophyll and other pigments, plus the electron transport chain\n- **Thylakoid lumen**: Interior space of the thylakoid\n\n**Chlorophyll** is the main photosynthetic pigment. It absorbs red and blue light and reflects green light (which is why plants appear green). Chlorophyll a is the primary pigment; chlorophyll b and carotenoids are accessory pigments that absorb additional wavelengths.'),
  q(3, 'In which part of the chloroplast do the light-dependent reactions take place?',
    ['Stroma', 'Thylakoid membranes (grana)', 'Outer membrane', 'Cytoplasm'], 1,
    'The light-dependent reactions occur on the thylakoid membranes, which are arranged in stacks called grana. These membranes contain chlorophyll and the electron transport chain components needed for the light reactions.'),
  t(4, '### Light Reactions (Light-Dependent Phase)\n\nThe light reactions occur on the **thylakoid membranes** and require light energy.\n\n**Steps:**\n1. **Light absorption**: Chlorophyll absorbs light energy, exciting electrons to a higher energy level\n2. **Photolysis of water**: Water molecules are split by light energy:\n   2H\u2082O \u2192 4H\u207a + 4e\u207b + O\u2082\n   This releases oxygen (as a by-product), hydrogen ions (H\u207a), and electrons\n3. **Electron transport chain**: The excited electrons pass through a series of carrier molecules in the thylakoid membrane, releasing energy at each step\n4. **ATP synthesis**: The energy released by the electron transport chain is used to produce **ATP** from ADP + P\u1d62 (photophosphorylation)\n5. **NADPH formation**: The final electron acceptor is NADP\u207a, which combines with H\u207a to form **NADPH** (a hydrogen carrier)\n\n**Products of the light reactions:** ATP, NADPH, and O\u2082\n**These products (ATP and NADPH) are used in the dark reactions.**'),
  fb(5, 'During the light reactions, water is split by light in a process called ___. The two energy-carrying products of the light reactions are ___ and NADPH.',
    ['photolysis', 'ATP'],
    'Photolysis (photo = light, lysis = splitting) is the splitting of water molecules by light energy, releasing O\u2082, H\u207a ions, and electrons. The light reactions produce ATP (from photophosphorylation) and NADPH (from the reduction of NADP\u207a).'),
  t(6, '### Dark Reactions (Light-Independent Phase / Calvin Cycle)\n\nThe dark reactions occur in the **stroma** of the chloroplast. They do not require light directly but depend on the ATP and NADPH produced by the light reactions.\n\n**Steps of the Calvin Cycle:**\n1. **Carbon fixation**: CO\u2082 from the atmosphere is fixed (attached) to a 5-carbon compound called **RuBP** (ribulose bisphosphate) by the enzyme **RuBisCO**. This produces an unstable 6-carbon compound that immediately splits into two 3-carbon molecules called **GP** (glycerate-3-phosphate)\n2. **Reduction**: GP is reduced to **G3P** (glyceraldehyde-3-phosphate) using ATP and NADPH from the light reactions\n3. **Regeneration of RuBP**: Some G3P molecules are used to regenerate RuBP (so the cycle can continue). This also requires ATP.\n4. **Glucose formation**: Some G3P molecules are used to synthesise glucose and other organic molecules\n\n**Summary:** CO\u2082 is fixed into organic molecules using the chemical energy (ATP) and reducing power (NADPH) from the light reactions.'),
  q(7, 'What is the role of the enzyme RuBisCO in photosynthesis?',
    ['It splits water molecules during the light reactions', 'It fixes CO\u2082 by attaching it to RuBP in the Calvin cycle', 'It produces chlorophyll in the thylakoid membranes', 'It transports O\u2082 out of the chloroplast'], 1,
    'RuBisCO (ribulose bisphosphate carboxylase-oxygenase) is the enzyme that catalyses the first step of the Calvin cycle: the fixation of CO\u2082 onto the 5-carbon sugar RuBP. It is the most abundant enzyme on Earth.'),
  t(8, '### Factors Affecting the Rate of Photosynthesis\n\n**Three main limiting factors:**\n\n1. **Light intensity**:\n   - As light intensity increases, the rate of photosynthesis increases (more energy for light reactions)\n   - At high light intensities, the rate plateaus (another factor becomes limiting)\n\n2. **CO\u2082 concentration**:\n   - Increasing CO\u2082 increases the rate (more substrate for carbon fixation)\n   - At high CO\u2082, the rate plateaus (RuBisCO is saturated)\n\n3. **Temperature**:\n   - Increasing temperature increases the rate (enzyme activity increases)\n   - Above the optimum temperature (approximately 25\u201335\u00b0C for most plants), enzymes denature and the rate drops sharply\n\n**Law of limiting factors:** At any given time, the rate of photosynthesis is limited by the factor that is furthest from its optimum. Increasing a non-limiting factor will not increase the rate.'),
  q(9, 'At very high light intensities, further increases in light do not increase the rate of photosynthesis. The most likely explanation is:',
    ['The plant has run out of chlorophyll', 'Another factor, such as CO\u2082 concentration or temperature, has become the limiting factor', 'Light destroys the enzymes needed for photosynthesis', 'The stomata close to prevent water loss'], 1,
    'When light is no longer limiting, another factor becomes the bottleneck. At high light intensity, either CO\u2082 concentration (not enough substrate for carbon fixation) or temperature (enzymes not working at maximum rate) limits the overall rate.'),
  fb(10, 'The three main factors that affect the rate of photosynthesis are light intensity, ___ concentration, and ___.',
    ['CO\u2082', 'temperature'],
    'Light intensity, CO\u2082 concentration, and temperature are the three main environmental factors that affect the rate of photosynthesis. At any time, the factor furthest from its optimum is the limiting factor.'),
];

blockNum = 0;
const ch4_lesson2 = [
  t(1, '## Importance of Photosynthesis and Improving Crop Yields\n\n### The Importance of Photosynthesis\n\nPhotosynthesis is arguably the most important biological process on Earth.\n\n**1. Food production:**\n- Photosynthesis produces glucose, which plants use to make all their organic molecules (starch, cellulose, lipids, proteins, nucleic acids)\n- Almost all food chains begin with photosynthetic organisms (producers)\n- Without photosynthesis, there would be virtually no food for heterotrophs\n\n**2. Oxygen production:**\n- The oxygen released during the light reactions is essential for aerobic respiration in most organisms\n- Approximately 70% of atmospheric oxygen is produced by marine phytoplankton; the rest by terrestrial plants\n\n**3. Carbon dioxide removal:**\n- Photosynthesis absorbs CO\u2082 from the atmosphere\n- This helps regulate the greenhouse effect and climate\n- Deforestation reduces this CO\u2082 absorption, contributing to global warming\n\n**4. Energy source:**\n- Fossil fuels (coal, oil, natural gas) are the remains of ancient photosynthetic organisms\n- Biomass energy (wood, ethanol from crops) comes directly from photosynthesis'),
  t(2, '### How the Products of Photosynthesis Are Used by the Plant\n\n**Glucose produced by photosynthesis is used for:**\n\n| Use | Process | Product |\n|-----|---------|--------|\n| Energy release | Cellular respiration | ATP for life processes |\n| Storage | Converted to starch | Starch granules in leaves, roots, tubers |\n| Structural support | Converted to cellulose | Cell walls |\n| Growth | Combined with mineral ions to make amino acids, proteins, nucleic acids | New cells and tissues |\n| Lipid production | Converted to fats and oils | Energy storage, membranes |\n| Transport | Converted to sucrose | Transported in phloem to other parts of the plant |'),
  q(3, 'Which of the following is NOT a direct use of glucose produced by photosynthesis?',
    ['Conversion to starch for storage', 'Conversion to cellulose for cell walls', 'Direct absorption of light energy', 'Cellular respiration for ATP production'], 2,
    'Plants do not use glucose to absorb light \u2014 that is the role of chlorophyll in the light reactions. Glucose is used for energy (respiration), storage (starch), structural support (cellulose), and synthesis of other organic molecules.'),
  t(4, '### Improving Crop Yields Using Knowledge of Photosynthesis\n\nFarmers and agricultural scientists can manipulate the factors affecting photosynthesis to increase crop productivity:\n\n**1. Increasing light:**\n- Greenhouse cultivation with supplementary lighting\n- Correct plant spacing to avoid shading\n- Reflective mulches to increase light reaching lower leaves\n\n**2. Increasing CO\u2082:**\n- In greenhouses, CO\u2082 enrichment (adding CO\u2082 gas) significantly increases yield\n- CO\u2082 generators or dry ice can be used\n\n**3. Optimising temperature:**\n- Greenhouses maintain optimal temperatures year-round\n- Heating in winter, ventilation/cooling in summer\n\n**4. Ensuring adequate water:**\n- Irrigation systems ensure water is not limiting\n- Drip irrigation is efficient and reduces waste\n\n**5. Providing mineral nutrients:**\n- Fertilisers supply nitrogen, phosphorus, and potassium (NPK)\n- Nitrogen is needed for amino acids (proteins); phosphorus for ATP and DNA; potassium for enzyme function'),
  q(5, 'A greenhouse farmer wants to increase crop yield. Which combination of factors would be most effective?',
    ['Decreasing CO\u2082, increasing temperature above 50 degrees C, and reducing light', 'Increasing CO\u2082 concentration, providing supplementary lighting, and maintaining optimal temperature', 'Adding extra oxygen and removing CO\u2082 from the greenhouse', 'Reducing water supply to force plants to photosynthesise faster'], 1,
    'Increasing CO\u2082 (more substrate for Calvin cycle), providing more light (more energy for light reactions), and maintaining optimal temperature (enzymes work efficiently) together maximise photosynthetic rate and crop yield.'),
  t(6, '### Comparing Photosynthesis and Respiration\n\n| Feature | Photosynthesis | Respiration |\n|---------|---------------|------------|\n| Occurs in | Chloroplasts | Mitochondria (and cytoplasm) |\n| Energy | Absorbs light energy | Releases chemical energy |\n| Reactants | CO\u2082 + H\u2082O | C\u2086H\u2081\u2082O\u2086 + O\u2082 |\n| Products | C\u2086H\u2081\u2082O\u2086 + O\u2082 | CO\u2082 + H\u2082O + ATP |\n| When | Only in light | Continuously (day and night) |\n| Organisms | Autotrophs (plants, algae) | All living organisms |\n| Overall effect | Builds organic molecules (anabolic) | Breaks down organic molecules (catabolic) |\n\n**Important:** Plants carry out BOTH photosynthesis AND respiration. During the day, the rate of photosynthesis usually exceeds respiration, so there is a net uptake of CO\u2082 and release of O\u2082. At night, only respiration occurs.'),
  fb(7, 'Photosynthesis is an ___ process (building molecules), while respiration is a ___ process (breaking down molecules). Plants carry out both processes.',
    ['anabolic', 'catabolic'],
    'Photosynthesis builds glucose from CO\u2082 and H\u2082O (anabolic \u2014 building up complex molecules). Respiration breaks glucose down to release energy as ATP (catabolic \u2014 breaking down complex molecules).'),
  q(8, 'During the day, a healthy green plant releases oxygen. At night, it releases carbon dioxide. Why?',
    ['The plant only respires at night', 'During the day, photosynthesis exceeds respiration (net O\u2082 release); at night, only respiration occurs (CO\u2082 release)', 'The plant stores oxygen during the day and converts it to CO\u2082 at night', 'Chloroplasts produce CO\u2082 in the dark'], 1,
    'Plants respire continuously. During the day, photosynthesis produces more O\u2082 than respiration consumes, and consumes more CO\u2082 than respiration produces, so the net gas exchange is O\u2082 out and CO\u2082 in. At night, without light, only respiration occurs, releasing CO\u2082.'),
];

// =============================================================================
// CHAPTER 5: Cellular Respiration (Term 2)
// =============================================================================
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Cellular Respiration\n\n### Overview\n\nCellular respiration is the process by which cells break down glucose to release energy in the form of **ATP** (adenosine triphosphate).\n\n**Overall equation for aerobic respiration:**\n\nC\u2086H\u2081\u2082O\u2086 + 6O\u2082 \u2192 6CO\u2082 + 6H\u2082O + energy (ATP)\n\nGlucose + Oxygen \u2192 Carbon dioxide + Water + ATP\n\n**Why do cells need ATP?**\n- Muscle contraction\n- Active transport across membranes\n- Synthesis of proteins, DNA, and other molecules\n- Nerve impulse transmission\n- Cell division\n- Maintaining body temperature (in endotherms)\n\n**ATP is the universal energy currency of cells.** It stores energy in the bond between the second and third phosphate groups. When this bond is broken (ATP \u2192 ADP + P\u1d62), energy is released for cellular work.'),
  t(2, '### Aerobic Respiration \u2014 Three Stages\n\nAerobic respiration occurs in three stages:\n\n| Stage | Location | Input | Output |\n|-------|----------|-------|--------|\n| **Glycolysis** | Cytoplasm | 1 glucose (6C) | 2 pyruvate (3C) + 2 ATP + 2 NADH |\n| **Krebs cycle** | Mitochondrial matrix | 2 acetyl CoA (2C) | CO\u2082 + ATP + NADH + FADH\u2082 |\n| **Oxidative phosphorylation** | Inner mitochondrial membrane | NADH + FADH\u2082 + O\u2082 | ~34 ATP + H\u2082O |\n\n**Total ATP yield per glucose molecule:** Approximately **36\u201338 ATP** (net)\n\nNote: Glycolysis is the only stage that occurs in the cytoplasm. The Krebs cycle and oxidative phosphorylation occur inside the mitochondria.'),
  t(3, '### Stage 1: Glycolysis\n\n**Location:** Cytoplasm (does not require oxygen or mitochondria)\n\n**Steps (simplified):**\n1. Glucose (6-carbon) is phosphorylated using **2 ATP** (energy investment phase)\n2. The 6-carbon molecule is split into two 3-carbon molecules\n3. Each 3-carbon molecule is oxidised, producing **NADH** (hydrogen carrier)\n4. Substrate-level phosphorylation produces **4 ATP**\n5. End product: **2 pyruvate** (3-carbon molecules)\n\n**Net gain from glycolysis:** 2 ATP + 2 NADH (per glucose molecule)\n\n**Key points:**\n- Glycolysis is an **anaerobic** process (does not require oxygen)\n- It is the oldest metabolic pathway (found in all living cells)\n- If oxygen is available, pyruvate enters the mitochondria for aerobic respiration\n- If oxygen is unavailable, pyruvate undergoes anaerobic respiration (fermentation)'),
  q(4, 'Where does glycolysis take place, and how many ATP molecules are produced (net)?',
    ['Mitochondria; 36 ATP', 'Cytoplasm; 2 ATP', 'Chloroplast; 4 ATP', 'Nucleus; 2 ATP'], 1,
    'Glycolysis occurs in the cytoplasm of all cells. It produces 4 ATP but uses 2 ATP in the energy investment phase, giving a net yield of 2 ATP per glucose molecule.'),
  t(5, '### Stage 2: Krebs Cycle (Citric Acid Cycle)\n\n**Location:** Matrix of the mitochondria\n\n**Before the Krebs cycle:** Pyruvate (3C) is converted to **acetyl CoA** (2C) in the **link reaction**. This releases 1 CO\u2082 and produces 1 NADH (per pyruvate).\n\n**The Krebs cycle (per turn):**\n1. Acetyl CoA (2C) combines with **oxaloacetate** (4C) to form **citrate** (6C)\n2. Citrate is progressively oxidised through a series of reactions\n3. **2 CO\u2082** molecules are released (as waste)\n4. **3 NADH** and **1 FADH\u2082** are produced (hydrogen carriers)\n5. **1 ATP** is produced by substrate-level phosphorylation\n6. **Oxaloacetate** is regenerated (so the cycle can continue)\n\n**Per glucose molecule** (2 pyruvates, so 2 turns):\n- 4 CO\u2082, 6 NADH, 2 FADH\u2082, 2 ATP\n\nPlus from the link reaction: 2 CO\u2082, 2 NADH'),
  fb(6, 'The Krebs cycle takes place in the ___ of the mitochondria. Pyruvate is first converted to ___ before entering the cycle.',
    ['matrix', 'acetyl CoA'],
    'The Krebs cycle occurs in the mitochondrial matrix. Before entering the cycle, pyruvate (3C) undergoes the link reaction, losing a CO\u2082 and forming acetyl CoA (2C), which then enters the cycle by combining with oxaloacetate.'),
  t(7, '### Stage 3: Oxidative Phosphorylation (Electron Transport Chain)\n\n**Location:** Inner mitochondrial membrane\n\nThis is where most ATP is produced.\n\n**Steps:**\n1. NADH and FADH\u2082 (from glycolysis and the Krebs cycle) donate their electrons to the **electron transport chain** (ETC) on the inner mitochondrial membrane\n2. As electrons pass through the chain of carrier proteins, they release energy\n3. This energy is used to pump **H\u207a ions** from the matrix into the intermembrane space, creating a concentration gradient\n4. H\u207a ions flow back through **ATP synthase** (a channel protein), driving the synthesis of ATP from ADP + P\u1d62. This is called **chemiosmosis**.\n5. At the end of the chain, electrons combine with **O\u2082** and H\u207a to form **water** (H\u2082O). This is why oxygen is needed \u2014 it is the **final electron acceptor**.\n\n**Yield:** Approximately **34 ATP** per glucose (from the NADH and FADH\u2082 produced in all previous stages)\n\nWithout oxygen, the ETC stops, NADH and FADH\u2082 cannot be recycled, and the Krebs cycle also stops.'),
  q(8, 'Why is oxygen essential for aerobic respiration?',
    ['Oxygen is needed to break down glucose in glycolysis', 'Oxygen is the final electron acceptor in the electron transport chain', 'Oxygen provides energy for the Krebs cycle', 'Oxygen is required to make NADH'], 1,
    'Oxygen acts as the final electron acceptor at the end of the electron transport chain. Without oxygen to accept electrons, the chain cannot function, NADH/FADH\u2082 cannot be oxidised, and both the ETC and Krebs cycle halt.'),
  q(9, 'The process by which H\u207a ions flow through ATP synthase to produce ATP is called:',
    ['Photolysis', 'Chemiosmosis', 'Glycolysis', 'Fermentation'], 1,
    'Chemiosmosis is the process by which the flow of H\u207a ions down their concentration gradient through ATP synthase drives the phosphorylation of ADP to ATP. It occurs in both mitochondria (respiration) and chloroplasts (photosynthesis).'),
  fb(10, 'The final electron acceptor in the electron transport chain is ___. Most ATP is produced during the stage called ___.',
    ['oxygen', 'oxidative phosphorylation'],
    'Oxygen accepts the electrons at the end of the electron transport chain, combining with H\u207a ions to form water. Oxidative phosphorylation produces approximately 34 of the 36\u201338 total ATP molecules per glucose.'),
];

blockNum = 0;
const ch5_lesson2 = [
  t(1, '## Anaerobic Respiration and Industrial Applications\n\n### Anaerobic Respiration (Fermentation)\n\nWhen oxygen is unavailable, cells can still produce ATP through **anaerobic respiration** (fermentation). However, this process is much less efficient than aerobic respiration.\n\n**Two types of anaerobic respiration:**\n\n| Feature | Alcoholic fermentation | Lactic acid fermentation |\n|---------|----------------------|------------------------|\n| Organisms | Yeast, some bacteria, some plants | Muscle cells, some bacteria |\n| Products | Ethanol + CO\u2082 | Lactic acid |\n| Equation | C\u2086H\u2081\u2082O\u2086 \u2192 2C\u2082H\u2085OH + 2CO\u2082 | C\u2086H\u2081\u2082O\u2086 \u2192 2C\u2083H\u2086O\u2083 |\n| ATP yield | 2 ATP (from glycolysis only) | 2 ATP (from glycolysis only) |\n| Reversible? | No (ethanol is toxic) | Yes (lactic acid can be converted back to pyruvate when O\u2082 returns) |\n\n**Why is anaerobic respiration less efficient?**\nOnly glycolysis occurs (2 ATP). The Krebs cycle and oxidative phosphorylation cannot proceed without oxygen. Most of the energy remains locked in the ethanol or lactic acid.'),
  q(2, 'During intense exercise, your muscles may switch to anaerobic respiration. What is the product that causes muscle fatigue?',
    ['Ethanol', 'Carbon dioxide', 'Lactic acid', 'Pyruvate'], 2,
    'During intense exercise, when oxygen supply cannot meet demand, muscle cells carry out lactic acid fermentation. The accumulation of lactic acid lowers pH, causes muscle fatigue and cramps. When oxygen becomes available again (oxygen debt), lactic acid is converted back to pyruvate.'),
  t(3, '### Oxygen Debt\n\nAfter intense exercise, you continue to breathe heavily even after stopping. This is to repay the **oxygen debt**.\n\n**What happens:**\n1. During intense exercise, muscles use anaerobic respiration, producing lactic acid\n2. After exercise, extra oxygen is needed to:\n   - Convert lactic acid back to pyruvate (and then to glucose in the liver) \u2014 the **Cori cycle**\n   - Replenish oxygen stores in myoglobin (muscle oxygen carrier)\n   - Restore ATP and creatine phosphate reserves\n3. This extra oxygen consumption is the oxygen debt\n\n**This is why athletes pant after sprinting** \u2014 their bodies need to metabolise the lactic acid that accumulated during the anaerobic period.'),
  t(4, '### Comparison: Aerobic vs Anaerobic Respiration\n\n| Feature | Aerobic | Anaerobic |\n|---------|---------|----------|\n| Oxygen required? | Yes | No |\n| Location | Cytoplasm + mitochondria | Cytoplasm only |\n| Stages | Glycolysis + Krebs + ETC | Glycolysis + fermentation |\n| Products | CO\u2082 + H\u2082O + ~36-38 ATP | Ethanol + CO\u2082 (yeast) or Lactic acid (animals) + 2 ATP |\n| Glucose breakdown | Complete | Incomplete |\n| Efficiency | High (approximately 40%) | Low (approximately 2%) |\n\n**Key point:** Anaerobic respiration only completes glycolysis. The fermentation step does NOT produce additional ATP \u2014 its purpose is to regenerate NAD\u207a so that glycolysis can continue.'),
  fb(5, 'Anaerobic respiration produces only ___ ATP per glucose molecule compared to approximately 36\u201338 ATP from aerobic respiration. The purpose of fermentation is to regenerate ___.',
    ['2', 'NAD+'],
    'Fermentation regenerates NAD\u207a from NADH, which is essential for glycolysis to continue in the absence of oxygen. Without NAD\u207a regeneration, glycolysis would stop and no ATP could be produced at all.'),
  t(6, '### Industrial Applications of Anaerobic Respiration\n\n**1. Bread-making:**\n- Yeast (Saccharomyces cerevisiae) is mixed with flour and water\n- Yeast ferments sugars: glucose \u2192 ethanol + CO\u2082\n- The **CO\u2082** causes the dough to rise (forms bubbles/gas pockets)\n- The **ethanol** evaporates during baking\n- Warm conditions are needed for yeast activity (optimal ~37\u00b0C)\n\n**2. Beer and wine production (brewing):**\n- Yeast ferments sugars from malted barley (beer) or grapes (wine)\n- Produces **ethanol** (the alcohol in the drink) and CO\u2082\n- Beer: CO\u2082 is retained for carbonation\n- Wine: CO\u2082 is usually released\n- Fermentation stops when ethanol concentration becomes too high (toxic to yeast, typically 14\u201318%)\n\n**3. Biofuel (bioethanol):**\n- Yeast ferments sugars from crops (sugarcane, maize) to produce ethanol\n- Ethanol is used as a renewable fuel or blended with petrol\n- More carbon-neutral than fossil fuels (CO\u2082 released equals CO\u2082 absorbed during growth)'),
  q(7, 'In bread-making, which product of yeast fermentation causes the dough to rise?',
    ['Ethanol', 'Lactic acid', 'Carbon dioxide', 'ATP'], 2,
    'Carbon dioxide gas produced by yeast during alcoholic fermentation forms bubbles in the dough, causing it to rise. The ethanol produced evaporates during the baking process.'),
  t(8, '### Yoghurt and Cheese Production\n\n**Yoghurt:**\n- **Lactobacillus** bacteria are added to warm milk\n- The bacteria carry out **lactic acid fermentation**: lactose (milk sugar) \u2192 lactic acid\n- Lactic acid lowers the pH, causing milk proteins (casein) to coagulate, giving yoghurt its thick, creamy texture and tangy taste\n- Pasteurisation of milk before adding bacteria kills unwanted microbes\n\n**Cheese:**\n- Similar initial process to yoghurt: bacteria produce lactic acid from lactose\n- **Rennet** (containing the enzyme chymosin) is added to further coagulate the casein, forming curds\n- Curds are separated from whey (liquid), pressed, and aged\n- Different bacteria and moulds produce different cheese varieties (e.g., Penicillium roqueforti for blue cheese)\n\n**Key idea:** Understanding cellular respiration allows us to manipulate microorganisms for food production, fuel, and industry.'),
  q(9, 'What causes milk to thicken during yoghurt production?',
    ['Ethanol produced by yeast denatures proteins', 'Lactic acid produced by Lactobacillus lowers pH and coagulates milk proteins', 'Carbon dioxide bubbles trapped in the milk', 'Heat from bacterial respiration cooks the proteins'], 1,
    'Lactobacillus bacteria ferment lactose to lactic acid. The increasing acidity (lower pH) causes casein (milk protein) to denature and coagulate, giving yoghurt its characteristic thick texture and sour taste.'),
  fb(10, 'In brewing, yeast produces ___ and carbon dioxide through alcoholic fermentation. Yoghurt production relies on ___ acid fermentation by Lactobacillus bacteria.',
    ['ethanol', 'lactic'],
    'Alcoholic fermentation by yeast produces ethanol (the alcohol in beer and wine) and CO\u2082. Lactic acid fermentation by Lactobacillus produces lactic acid, which thickens and sours milk to make yoghurt.'),
];

// =============================================================================
// CHAPTER 6: Animal Nutrition (Term 2)
// =============================================================================
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Animal Nutrition\n\n### Dentition\n\nDentition refers to the type, number, and arrangement of teeth in an animal. Teeth are adapted to the diet of the animal.\n\n**Types of teeth in mammals:**\n| Tooth Type | Function | Shape |\n|-----------|----------|-------|\n| **Incisors** | Cutting and biting | Chisel-shaped, flat edge |\n| **Canines** | Tearing and piercing | Pointed, long |\n| **Premolars** | Crushing and grinding | Broad, with cusps |\n| **Molars** | Grinding and crushing | Broad, flat with ridges |\n\n**Dental formula** expresses the number of each tooth type in one half of the jaw (upper/lower):\n- **Human** (omnivore): I 2/2, C 1/1, PM 2/2, M 3/3 = 32 teeth total\n\n**Comparison of dentition by diet:**\n| Feature | Herbivore (e.g., cow) | Carnivore (e.g., dog) | Omnivore (e.g., human) |\n|---------|---------------------|---------------------|----------------------|\n| Incisors | Large, spade-like (cutting grass) | Small | Medium, chisel-shaped |\n| Canines | Absent or reduced | Large, pointed (killing prey) | Small, blunt |\n| Premolars/Molars | Flat with ridges (grinding) | Sharp, blade-like (carnassials for shearing) | Broad with cusps |\n| Jaw movement | Side-to-side (grinding) | Up-and-down (shearing) | Both |\n| Diastema | Present (gap between incisors and premolars) | Absent | Absent |'),
  q(2, 'A herbivore like a cow has a diastema (gap) between its incisors and premolars. What is the function of this gap?',
    ['To allow the tongue to manipulate food for grinding by the molars', 'To make room for larger canines', 'To allow the animal to breathe while chewing', 'To store food temporarily'], 0,
    'The diastema allows the tongue to move food around in the mouth, pushing it between the grinding surfaces of the premolars and molars. Herbivores lack large canines, so the gap replaces where canines would be.'),
  t(3, '### The Alimentary Canal (Digestive System)\n\nThe alimentary canal is a continuous tube from mouth to anus.\n\n**Structure and function:**\n\n| Organ | Function |\n|-------|----------|\n| **Mouth** | Mechanical digestion (chewing); chemical digestion begins (salivary amylase breaks down starch) |\n| **Oesophagus** | Transports food to stomach by **peristalsis** (wave-like muscle contractions) |\n| **Stomach** | Churning (mechanical); **pepsin** (protease) begins protein digestion in acidic conditions (HCl, pH ~2) |\n| **Duodenum** (first part of small intestine) | Receives bile (from liver via gall bladder) and pancreatic juice; chemical digestion continues |\n| **Ileum** (rest of small intestine) | Main site of **absorption** of digested nutrients |\n| **Large intestine (colon)** | Absorbs water and minerals; houses bacteria that produce vitamin K |\n| **Rectum** | Stores faeces |\n| **Anus** | Egestion (removal of undigested material) |'),
  fb(4, 'The stomach produces ___ (hydrochloric acid) to create an acidic environment for the enzyme pepsin. The main site of nutrient absorption is the ___.',
    ['HCl', 'ileum'],
    'Gastric glands in the stomach wall produce HCl, which activates pepsinogen into pepsin and kills bacteria. The ileum (part of the small intestine) is the main absorption site due to its large surface area provided by villi.'),
  t(5, '### Mechanical and Chemical Digestion\n\n**Mechanical digestion** is the physical breakdown of food into smaller pieces without changing its chemical structure.\n- Chewing (teeth in the mouth)\n- Churning (stomach muscles)\n- Peristalsis (wave-like contractions throughout the alimentary canal)\n- Bile emulsifies fats (breaks large fat droplets into smaller droplets \u2014 increases surface area)\n\n**Chemical digestion** is the breakdown of large, insoluble food molecules into small, soluble molecules by enzymes.\n\n| Enzyme | Source | Substrate | Product | Optimum pH |\n|--------|--------|-----------|---------|----------|\n| Salivary amylase | Salivary glands | Starch | Maltose | ~7 (neutral) |\n| Pepsin | Stomach (gastric glands) | Proteins | Peptides | ~2 (acidic) |\n| Pancreatic lipase | Pancreas | Lipids (fats) | Fatty acids + glycerol | ~8 (alkaline) |\n| Pancreatic amylase | Pancreas | Starch | Maltose | ~8 |\n| Trypsin | Pancreas | Proteins/Peptides | Amino acids | ~8 |\n| Maltase | Small intestine wall | Maltose | Glucose | ~7 |\n\n**Bile** is produced by the liver and stored in the gall bladder. It is NOT an enzyme. It emulsifies fats and neutralises stomach acid.'),
  q(6, 'Why does the stomach need to produce hydrochloric acid?',
    ['To emulsify fats', 'To provide the optimum acidic pH for pepsin to function and to kill bacteria', 'To break down carbohydrates', 'To neutralise bile from the liver'], 1,
    'HCl creates the strongly acidic environment (pH ~2) required for the protease enzyme pepsin to function optimally. It also kills most bacteria in food, providing a defence against infection.'),
  t(7, '### Absorption in the Small Intestine\n\nThe small intestine is adapted for efficient absorption:\n\n**Structural adaptations of the ileum:**\n1. **Very long** (~6 metres in humans) \u2014 increases surface area\n2. **Villi** (singular: villus) \u2014 finger-like projections of the intestinal wall that increase surface area\n3. **Microvilli** (brush border) \u2014 tiny projections on the surface of villus cells, further increasing surface area\n4. **Thin epithelium** (one cell thick) \u2014 short diffusion distance\n5. **Dense capillary network** in each villus \u2014 maintains concentration gradient by carrying absorbed nutrients away\n6. **Lacteal** (lymph vessel) in each villus \u2014 absorbs fatty acids and glycerol\n\n**Methods of absorption:**\n- **Diffusion**: Small molecules move down their concentration gradient (e.g., water, some minerals)\n- **Active transport**: Nutrients are absorbed against a concentration gradient using energy (ATP) (e.g., glucose, amino acids)\n- **Facilitated diffusion**: Carrier proteins assist movement of molecules down their gradient'),
  q(8, 'Why do villi have a rich blood supply?',
    ['To provide oxygen for digestion', 'To maintain a steep concentration gradient by continuously removing absorbed nutrients', 'To keep the villi warm', 'To transport enzymes to the villi'], 1,
    'A dense capillary network in each villus rapidly carries away absorbed nutrients (glucose, amino acids). This maintains a steep concentration gradient between the intestinal lumen and the blood, ensuring continuous efficient absorption.'),
  fb(9, 'Villi increase the ___ of the small intestine for absorption. Each villus contains a ___, which is a lymph vessel that absorbs fats.',
    ['surface area', 'lacteal'],
    'Villi are finger-like projections that vastly increase the surface area of the small intestine. Each villus contains a lacteal (a lymphatic capillary) that absorbs fatty acids and glycerol, transporting them via the lymphatic system.'),
  t(10, '### Assimilation, Egestion, and Blood Sugar Homeostasis\n\n**Assimilation** is the process by which absorbed nutrients are used by body cells:\n- Glucose \u2192 respiration (energy) or stored as glycogen (liver, muscles)\n- Amino acids \u2192 building proteins (growth and repair)\n- Fatty acids and glycerol \u2192 building cell membranes, energy storage\n- Excess amino acids are **deaminated** in the liver (amino group removed, converted to urea)\n\n**Egestion** is the removal of undigested food (fibre, dead cells) as faeces through the anus. This is NOT excretion (which is removal of metabolic waste products).'),
];

blockNum = 0;
const ch6_lesson2 = [
  t(1, '## Homeostatic Control of Blood Glucose\n\n### What is Homeostasis?\n\nHomeostasis is the maintenance of a stable internal environment despite changes in external conditions. It involves **negative feedback** mechanisms.\n\n**Negative feedback:**\n1. A change is detected by a **receptor**\n2. A **control centre** (e.g., brain, pancreas) processes the information\n3. An **effector** (e.g., muscle, gland) carries out a response to reverse the change\n4. The system returns to the set point\n\nThis is called "negative" feedback because the response opposes (negates) the original change.'),
  t(2, '### Blood Glucose Regulation\n\nBlood glucose levels must be kept within a narrow range (approximately 4\u20138 mmol/L). The **pancreas** is both the receptor and the control centre.\n\n**The pancreas contains clusters of cells called Islets of Langerhans:**\n- **Beta (\u03b2) cells**: Detect high blood glucose and secrete **insulin**\n- **Alpha (\u03b1) cells**: Detect low blood glucose and secrete **glucagon**\n\n**When blood glucose is TOO HIGH (e.g., after a meal):**\n1. Beta cells detect the rise\n2. Beta cells secrete **insulin** into the blood\n3. Insulin stimulates:\n   - Uptake of glucose by liver and muscle cells\n   - Conversion of glucose to **glycogen** (glycogenesis) for storage in liver and muscles\n   - Uptake of glucose by body cells for respiration\n4. Blood glucose falls back to normal\n\n**When blood glucose is TOO LOW (e.g., during exercise or fasting):**\n1. Alpha cells detect the drop\n2. Alpha cells secrete **glucagon** into the blood\n3. Glucagon stimulates:\n   - Conversion of glycogen back to glucose (**glycogenolysis**) in the liver\n   - Release of glucose into the blood\n4. Blood glucose rises back to normal'),
  q(3, 'Which cells in the pancreas secrete insulin, and what is the effect of insulin on blood glucose levels?',
    ['Alpha cells; insulin raises blood glucose', 'Beta cells; insulin lowers blood glucose by stimulating glucose uptake and glycogen formation', 'Delta cells; insulin has no effect on blood glucose', 'Beta cells; insulin raises blood glucose by breaking down glycogen'], 1,
    'Beta cells of the Islets of Langerhans secrete insulin when blood glucose is high. Insulin lowers blood glucose by promoting glucose uptake by cells and stimulating conversion of glucose to glycogen (glycogenesis) in the liver and muscles.'),
  fb(4, 'When blood glucose is too high, the hormone ___ is released by beta cells. When blood glucose is too low, the hormone ___ is released by alpha cells.',
    ['insulin', 'glucagon'],
    'Insulin and glucagon are antagonistic hormones that work together to maintain blood glucose homeostasis. Insulin lowers blood glucose; glucagon raises it. This is a classic example of negative feedback.'),
  t(5, '### Diabetes Mellitus\n\nDiabetes mellitus is a condition where the body cannot properly regulate blood glucose levels.\n\n**Type 1 Diabetes:**\n- The immune system destroys the beta cells of the pancreas (autoimmune disease)\n- Little or no insulin is produced\n- Usually develops in childhood or adolescence\n- Treatment: Regular **insulin injections** + blood glucose monitoring + controlled diet\n- Cannot be prevented\n\n**Type 2 Diabetes:**\n- Body cells become **resistant to insulin** (insulin is produced but cells do not respond properly)\n- Often associated with obesity, inactivity, and poor diet\n- Usually develops in adulthood (but increasingly seen in young people)\n- Treatment: Diet and exercise, oral medication, sometimes insulin\n- Can often be prevented or managed through lifestyle changes\n\n| Feature | Type 1 | Type 2 |\n|---------|--------|--------|\n| Cause | Autoimmune destruction of beta cells | Insulin resistance |\n| Onset | Usually childhood | Usually adulthood |\n| Insulin production | None or very little | Normal or high (but ineffective) |\n| Treatment | Insulin injections | Diet, exercise, medication |\n| Prevention | Not preventable | Often preventable |'),
  q(6, 'What is the key difference between Type 1 and Type 2 diabetes?',
    ['Type 1 is caused by eating too much sugar; Type 2 is genetic', 'Type 1 involves destruction of beta cells (no insulin); Type 2 involves insulin resistance (cells do not respond to insulin)', 'Type 1 only affects children; Type 2 only affects the elderly', 'Type 1 is treated with exercise; Type 2 requires insulin injections'], 1,
    'Type 1 diabetes is an autoimmune condition where beta cells are destroyed, so no insulin is produced. Type 2 diabetes occurs when body cells become resistant to insulin \u2014 insulin is produced but cannot effectively lower blood glucose.'),
  t(7, '### The Liver in Digestion and Homeostasis\n\nThe liver plays a central role in nutrient processing and homeostasis.\n\n**Functions of the liver related to digestion and metabolism:**\n1. **Bile production**: Bile emulsifies fats and neutralises stomach acid in the duodenum\n2. **Glycogenesis**: Converts excess glucose to glycogen for storage (stimulated by insulin)\n3. **Glycogenolysis**: Converts glycogen back to glucose when needed (stimulated by glucagon)\n4. **Deamination**: Removes amino groups from excess amino acids, producing urea (excreted by kidneys)\n5. **Detoxification**: Breaks down alcohol, drugs, and toxins\n6. **Protein synthesis**: Produces plasma proteins (e.g., albumin, clotting factors)\n7. **Storage**: Stores vitamins A, D, and B12, iron, and glycogen\n\nThe liver receives nutrient-rich blood from the small intestine via the **hepatic portal vein**, allowing it to process all absorbed nutrients before they enter the general circulation.'),
  fb(8, 'The liver converts excess glucose to ___ for storage (glycogenesis) and breaks down excess amino acids by ___ to produce urea.',
    ['glycogen', 'deamination'],
    'Glycogenesis is the conversion of glucose to glycogen, stimulated by insulin. Deamination is the removal of the amino group (NH\u2082) from excess amino acids; the amino group is converted to urea (excreted by kidneys) and the remainder can be used for energy.'),
  q(9, 'Blood from the small intestine travels to the liver via the hepatic portal vein. Why is this important?',
    ['It allows the liver to add digestive enzymes to the blood', 'It allows the liver to process absorbed nutrients, regulate blood glucose, and detoxify harmful substances before blood reaches the rest of the body', 'It keeps digested food separate from oxygen in the blood', 'It allows the liver to produce bile from absorbed nutrients'], 1,
    'The hepatic portal vein carries nutrient-rich blood directly from the intestines to the liver. This ensures the liver can regulate blood glucose levels, store excess nutrients, deaminate excess amino acids, and detoxify any harmful substances before the blood enters the general circulation.'),
  q(10, 'Distinguish between egestion and excretion.',
    ['They are the same process', 'Egestion is removal of undigested food; excretion is removal of metabolic waste products', 'Egestion occurs in the kidneys; excretion occurs in the intestines', 'Egestion is voluntary; excretion is involuntary'], 1,
    'Egestion is the removal of undigested material (food that was never absorbed) from the alimentary canal as faeces. Excretion is the removal of metabolic waste products (e.g., CO\u2082 from respiration, urea from deamination) produced by chemical reactions in cells.'),
];

// =============================================================================
// CHAPTER 7: Gaseous Exchange (Term 3)
// =============================================================================
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Gaseous Exchange in Humans\n\n### What is Gaseous Exchange?\n\nGaseous exchange is the exchange of respiratory gases (O\u2082 and CO\u2082) between an organism and its environment. It should not be confused with breathing (ventilation), which is the mechanical process of moving air in and out of the lungs.\n\n**Requirements for efficient gaseous exchange surfaces:**\n1. **Large surface area**: Increases the area over which diffusion can occur\n2. **Thin walls (short diffusion distance)**: Usually one cell thick\n3. **Moist surface**: Gases dissolve in moisture before diffusing\n4. **Rich blood supply**: Maintains a steep concentration gradient by continuously removing O\u2082 and delivering CO\u2082\n5. **Ventilation**: Maintains concentration gradients by constantly refreshing the air\n\n**Gaseous exchange occurs by diffusion** \u2014 gases move from areas of high concentration to areas of low concentration.'),
  t(2, '### Structure of the Human Respiratory System\n\n| Structure | Function |\n|-----------|----------|\n| **Nasal cavity** | Warms, moistens, and filters inhaled air (hairs and mucus trap particles) |\n| **Pharynx** | Shared passage for air and food |\n| **Larynx** | Voice box; contains vocal cords |\n| **Trachea** | Windpipe; reinforced with C-shaped cartilage rings to keep it open |\n| **Bronchi** (singular: bronchus) | Two branches of the trachea leading to each lung |\n| **Bronchioles** | Smaller branches of bronchi; smooth muscle walls can constrict or dilate |\n| **Alveoli** (singular: alveolus) | Tiny air sacs at the end of bronchioles; site of gaseous exchange |\n| **Diaphragm** | Dome-shaped muscle below the lungs; contracts to create inhalation |\n| **Intercostal muscles** | Between the ribs; assist in breathing movements |\n| **Pleural membranes** | Double membrane surrounding each lung; pleural fluid reduces friction |'),
  q(3, 'Why does the trachea have C-shaped cartilage rings?',
    ['To produce mucus', 'To keep the trachea permanently open so air can always pass through', 'To warm the air entering the lungs', 'To filter dust particles from the air'], 1,
    'The C-shaped cartilage rings prevent the trachea from collapsing during changes in air pressure. The open part of the C faces the oesophagus, allowing it to expand when food passes through.'),
  t(4, '### Adaptations of the Alveoli for Gaseous Exchange\n\nThe alveoli are the functional units of gaseous exchange in the lungs.\n\n**Adaptations:**\n1. **Enormous surface area**: ~300 million alveoli provide a total surface area of approximately 70\u201380 m\u00b2 (the size of a tennis court)\n2. **Thin walls**: Alveolar walls are one cell thick (squamous epithelium), and capillary walls are one cell thick \u2014 total diffusion distance is only about 0.5 \u00b5m\n3. **Moist lining**: A thin film of moisture dissolves gases for diffusion\n4. **Surrounded by dense capillary network**: Blood flow maintains a steep concentration gradient\n5. **Ventilation**: Breathing continuously refreshes the air in the alveoli\n\n**At the alveoli:**\n- O\u2082 diffuses from the alveolar air (high concentration) into the blood (low concentration)\n- CO\u2082 diffuses from the blood (high concentration) into the alveolar air (low concentration)\n- This is driven by the difference in **partial pressures** of these gases'),
  fb(5, 'The human lungs contain approximately 300 million ___, providing a total surface area of about 70\u201380 m\u00b2. Their walls are only ___ cell(s) thick to minimise the diffusion distance.',
    ['alveoli', 'one'],
    'The vast number of alveoli creates a huge surface area for gaseous exchange. Each alveolus is lined by a single layer of thin squamous epithelial cells, minimising the distance gases must diffuse.'),
  t(6, '### Breathing Mechanism (Ventilation)\n\n**Inhalation (inspiration):**\n1. The **diaphragm contracts** (flattens/moves down)\n2. The **external intercostal muscles contract** (rib cage moves up and out)\n3. The volume of the thoracic cavity **increases**\n4. Air pressure inside the lungs **decreases** (below atmospheric pressure)\n5. Air rushes **into** the lungs (down the pressure gradient)\n\n**Exhalation (expiration) \u2014 at rest:**\n1. The **diaphragm relaxes** (domes up)\n2. The **external intercostal muscles relax** (rib cage moves down and in)\n3. The volume of the thoracic cavity **decreases**\n4. Air pressure inside the lungs **increases** (above atmospheric pressure)\n5. Air is pushed **out** of the lungs\n\n**Note:** Normal exhalation is a passive process (no muscle contraction needed). Forced exhalation (e.g., during exercise) involves contraction of the internal intercostal muscles and abdominal muscles.'),
  q(7, 'During inhalation, what happens to the volume and pressure inside the thoracic cavity?',
    ['Volume decreases, pressure increases', 'Volume increases, pressure decreases', 'Volume stays the same, pressure increases', 'Volume decreases, pressure decreases'], 1,
    'When the diaphragm flattens and the rib cage expands, the volume of the thoracic cavity increases. According to Boyle\'s law, increased volume leads to decreased pressure, causing air to flow into the lungs.'),
  t(8, '### Effects of Smoking on the Respiratory System\n\nSmoking damages the respiratory system in multiple ways:\n\n| Substance | Effect |\n|-----------|--------|\n| **Tar** | Coats alveoli, reducing surface area for gaseous exchange; contains carcinogens that cause lung cancer; paralyses and destroys cilia in the airways |\n| **Nicotine** | Addictive; raises blood pressure and heart rate; damages blood vessel walls |\n| **Carbon monoxide (CO)** | Binds to haemoglobin 200x more readily than O\u2082, forming carboxyhaemoglobin; reduces oxygen-carrying capacity of blood |\n\n**Diseases linked to smoking:**\n- **Emphysema**: Alveolar walls are destroyed, reducing surface area; irreversible\n- **Chronic bronchitis**: Airways become inflamed and produce excess mucus; cilia are damaged\n- **Lung cancer**: Uncontrolled cell division in lung tissue caused by carcinogens in tar\n- **COPD** (chronic obstructive pulmonary disease): Umbrella term for emphysema + chronic bronchitis'),
  q(9, 'Carbon monoxide in cigarette smoke reduces oxygen transport because:',
    ['It destroys red blood cells', 'It binds to haemoglobin much more strongly than oxygen, forming carboxyhaemoglobin and reducing the blood\'s oxygen-carrying capacity', 'It blocks the trachea', 'It increases the rate of breathing'], 1,
    'Carbon monoxide has approximately 200 times greater affinity for haemoglobin than oxygen. It forms a stable compound called carboxyhaemoglobin, which cannot carry oxygen. This means less oxygen reaches the body tissues.'),
  fb(10, 'Tar in cigarette smoke destroys the ___ lining the airways, causing mucus to accumulate. The disease in which alveolar walls are destroyed, reducing surface area, is called ___.',
    ['cilia', 'emphysema'],
    'Healthy cilia beat rhythmically to sweep mucus (containing trapped particles and bacteria) up and out of the airways. Tar paralyses and destroys these cilia. Emphysema involves the irreversible breakdown of alveolar walls, drastically reducing the surface area available for gaseous exchange.'),
];

// =============================================================================
// CHAPTER 8: Excretion in Humans (Term 3)
// =============================================================================
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Excretion in Humans\n\n### What is Excretion?\n\nExcretion is the removal of **metabolic waste products** from the body. These are toxic by-products of chemical reactions in cells.\n\n**Main excretory organs and their waste products:**\n| Organ | Waste Product | Source |\n|-------|--------------|--------|\n| **Kidneys** | Urea | Deamination of excess amino acids in the liver |\n| **Lungs** | Carbon dioxide | Cellular respiration |\n| **Skin** | Water, salts, small amounts of urea | Sweating (also thermoregulation) |\n| **Liver** | Bile pigments (bilirubin) | Breakdown of old red blood cells |\n\n**Important distinctions:**\n- **Excretion** = removal of metabolic wastes (produced by the body)\n- **Egestion** = removal of undigested food (never absorbed into the body)\n- **Secretion** = release of useful substances (enzymes, hormones)'),
  t(2, '### Structure of the Urinary System\n\nThe urinary system consists of:\n- **Two kidneys**: Filter blood and produce urine\n- **Two ureters**: Tubes carrying urine from kidneys to the bladder\n- **Bladder**: Stores urine\n- **Urethra**: Tube through which urine exits the body\n\n### Internal Structure of the Kidney\n\n| Region | Location | Contains |\n|--------|----------|----------|\n| **Cortex** | Outer region | Bowman capsules, proximal and distal convoluted tubules, glomeruli |\n| **Medulla** | Inner region | Loops of Henle, collecting ducts |\n| **Renal pelvis** | Central cavity | Collects urine; connects to the ureter |\n\nThe functional unit of the kidney is the **nephron**. Each kidney contains approximately 1 million nephrons.'),
  q(3, 'Which statement correctly distinguishes excretion from egestion?',
    ['Excretion removes undigested food; egestion removes metabolic waste', 'Excretion removes metabolic waste products; egestion removes undigested food', 'Both terms mean the same thing', 'Excretion occurs only in the kidneys; egestion occurs only in the skin'], 1,
    'Excretion is the removal of metabolic waste products (e.g., urea, CO\u2082) that are produced by chemical reactions in cells. Egestion is the removal of undigested food (faeces) from the alimentary canal \u2014 this material was never part of the body\'s metabolism.'),
  t(4, '### The Nephron\n\nEach nephron consists of:\n\n1. **Bowman\'s capsule**: Cup-shaped structure surrounding the glomerulus (in the cortex)\n2. **Glomerulus**: A knot of capillaries inside Bowman\'s capsule where filtration occurs\n3. **Proximal convoluted tubule (PCT)**: Coiled tube in the cortex; reabsorbs useful substances\n4. **Loop of Henle**: Hairpin loop dipping into the medulla; creates a salt concentration gradient for water reabsorption\n5. **Distal convoluted tubule (DCT)**: Coiled tube in the cortex; fine-tuning of salt and water balance\n6. **Collecting duct**: Carries urine through the medulla to the renal pelvis; final water reabsorption\n\n**Blood supply:** The renal artery branches into an **afferent arteriole** (entering the glomerulus) and an **efferent arteriole** (leaving the glomerulus). The efferent arteriole is narrower, creating high pressure in the glomerulus for filtration.'),
  t(5, '### Three Processes of Urine Formation\n\n**1. Ultrafiltration (in the glomerulus/Bowman\'s capsule):**\n- High blood pressure in the glomerulus forces small molecules (water, glucose, amino acids, urea, salts) out of the blood through the capillary walls and into Bowman\'s capsule\n- Large molecules (proteins, blood cells) are too big to pass through and remain in the blood\n- The filtrate formed is called **glomerular filtrate**\n\n**2. Selective reabsorption (mainly in the PCT):**\n- Useful substances are reabsorbed from the filtrate back into the blood:\n  - **All glucose** (by active transport)\n  - **All amino acids** (by active transport)\n  - **Most water** (~99%) (by osmosis)\n  - **Some salts** (by active transport and diffusion)\n- Urea and excess salts remain in the tubule\n\n**3. Tubular secretion (in the DCT):**\n- Additional waste substances (H\u207a ions, drugs, excess K\u207a) are actively secreted from the blood into the tubule\n- Helps fine-tune blood pH and ion balance'),
  fb(6, 'In ultrafiltration, high blood pressure in the ___ forces small molecules into Bowman\'s capsule. In selective reabsorption, all ___ is reabsorbed by active transport in the proximal convoluted tubule.',
    ['glomerulus', 'glucose'],
    'The glomerulus is the knot of capillaries where ultrafiltration occurs under high pressure. All glucose is reabsorbed in the PCT because it is a valuable nutrient that should not be lost in urine. If glucose appears in urine, it may indicate diabetes.'),
  q(7, 'A urine test shows glucose in a patient\'s urine. What could this indicate?',
    ['Normal kidney function', 'The patient has diabetes mellitus (blood glucose is so high that the kidneys cannot reabsorb all of it)', 'The patient has been exercising', 'The patient has kidney stones'], 1,
    'Normally, all glucose is reabsorbed from the filtrate. In diabetes mellitus, blood glucose is abnormally high, and the transport proteins in the PCT become saturated \u2014 they cannot reabsorb all the glucose, so some appears in the urine (glycosuria).'),
  t(8, '### Water Balance and ADH\n\nThe kidneys regulate water balance through the hormone **ADH** (antidiuretic hormone), produced by the hypothalamus and released by the posterior pituitary gland.\n\n**When the body is dehydrated (blood too concentrated):**\n1. Osmoreceptors in the **hypothalamus** detect increased blood osmolarity\n2. The pituitary gland releases **more ADH**\n3. ADH makes the walls of the collecting duct **more permeable** to water\n4. More water is reabsorbed back into the blood by osmosis\n5. A **small volume of concentrated urine** is produced\n\n**When the body has excess water (blood too dilute):**\n1. Osmoreceptors detect decreased blood osmolarity\n2. The pituitary gland releases **less ADH**\n3. The collecting duct becomes **less permeable** to water\n4. Less water is reabsorbed; more remains in the urine\n5. A **large volume of dilute urine** is produced\n\nThis is a **negative feedback** mechanism \u2014 the response opposes the original change.'),
  q(9, 'After drinking a large volume of water, which of the following will occur?',
    ['More ADH is released, producing concentrated urine', 'Less ADH is released, producing a large volume of dilute urine', 'The kidneys stop filtering blood', 'Glucose appears in the urine'], 1,
    'Excess water dilutes the blood. Osmoreceptors detect this and the pituitary releases less ADH. With less ADH, the collecting ducts are less permeable to water, so less water is reabsorbed and a large volume of dilute urine is produced.'),
  fb(10, 'The hormone ___ controls water reabsorption in the collecting duct. When the body is dehydrated, ___ ADH is released, causing more water to be reabsorbed.',
    ['ADH', 'more'],
    'ADH (antidiuretic hormone) increases the permeability of the collecting duct to water. Dehydration triggers increased ADH release, promoting water reabsorption and producing small volumes of concentrated urine.'),
];

// =============================================================================
// CHAPTER 9: Population Ecology (Term 3)
// =============================================================================
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Population Ecology\n\n### Key Definitions\n\n| Term | Definition |\n|------|------------|\n| **Population** | A group of organisms of the same species living in a particular area at a particular time |\n| **Community** | All the populations of different species living and interacting in the same area |\n| **Ecosystem** | A community of organisms and their physical (abiotic) environment, interacting as a system |\n| **Habitat** | The specific place where an organism lives |\n| **Niche** | The role an organism plays in its ecosystem (its "job") \u2014 includes what it eats, where it lives, and how it interacts with other organisms |\n| **Biosphere** | The zone of Earth where life exists (land, water, atmosphere) |\n| **Population size (N)** | The total number of individuals in a population |\n| **Population density** | Number of individuals per unit area (N / area) |\n| **Population distribution** | How individuals are spread across the habitat (uniform, random, clumped) |'),
  t(2, '### Factors Affecting Population Size\n\nPopulation size is determined by the balance between factors that increase and decrease the number of individuals.\n\n**Factors that increase population size:**\n- **Birth rate (natality)**: Number of individuals born per unit time\n- **Immigration**: Movement of individuals INTO the population\n\n**Factors that decrease population size:**\n- **Death rate (mortality)**: Number of individuals dying per unit time\n- **Emigration**: Movement of individuals OUT of the population\n\n**Population change formula:**\nPopulation change = (Births + Immigration) \u2013 (Deaths + Emigration)\n\n**Limiting factors** prevent unlimited population growth:\n- **Density-dependent factors**: Become more severe as population density increases (e.g., competition, predation, disease, parasitism)\n- **Density-independent factors**: Affect population regardless of density (e.g., natural disasters, climate, fire, flood)'),
  q(3, 'Which of the following is a density-dependent limiting factor?',
    ['A drought', 'A volcanic eruption', 'Competition for food', 'A flood'], 2,
    'Competition for food is density-dependent because it becomes more intense as population density increases \u2014 more individuals competing for the same limited resources. Droughts, volcanoes, and floods are density-independent because they affect populations regardless of size.'),
  t(4, '### Population Growth Curves\n\n**Exponential (J-shaped) growth:**\n- Occurs when resources are unlimited (no limiting factors)\n- Population grows at an ever-increasing rate\n- Rare in nature; may occur briefly when a species colonises a new habitat\n- Shape: J-curve\n\n**Logistic (S-shaped/sigmoid) growth:**\n- More realistic in nature\n- Has three phases:\n  1. **Lag phase**: Small population, slow growth (few individuals reproducing)\n  2. **Exponential (log) phase**: Rapid growth as resources are abundant\n  3. **Stationary (plateau) phase**: Growth slows and stabilises as the population reaches the **carrying capacity (K)**\n\n**Carrying capacity (K)**: The maximum number of individuals of a species that an environment can support indefinitely, given the available resources.\n\n- At K, birth rate approximately equals death rate\n- If the population exceeds K, resources become scarce and the population declines back toward K'),
  fb(5, 'The maximum population size that an environment can sustain indefinitely is called the ___. A population growth curve with lag, exponential, and stationary phases is called a ___ curve.',
    ['carrying capacity', 'sigmoid'],
    'Carrying capacity (K) is determined by resource availability. The sigmoid (S-shaped) growth curve shows realistic population growth with an initial lag phase, followed by exponential growth, and then a plateau as the population approaches the carrying capacity.'),
  t(6, '### Interactions Within and Between Populations\n\n**Intraspecific competition** (within the same species):\n- Individuals compete for the same resources (food, mates, territory)\n- Limits population growth\n- More intense at high population densities\n\n**Interspecific competition** (between different species):\n- Different species compete for similar resources\n- Can lead to **competitive exclusion** (one species outcompetes the other)\n- Or **resource partitioning** (species divide the resource to coexist)\n\n**Predator-prey relationships:**\n- Predator and prey populations are linked and fluctuate in cycles\n- When prey is abundant \u2192 predator numbers increase \u2192 prey numbers decrease \u2192 predator numbers decrease \u2192 prey recovers \u2192 cycle repeats\n- Classic example: Lynx and snowshoe hare\n\n**Symbiosis:** Mutualism, commensalism, and parasitism (covered in Chapter 1)'),
  q(7, 'In a predator-prey cycle, what happens when the prey population increases significantly?',
    ['The predator population decreases immediately', 'The predator population increases (with a time lag) because more food is available', 'The prey population continues to grow indefinitely', 'The predator switches to a different prey species'], 1,
    'When prey is abundant, predators have more food, leading to better survival and reproduction. The predator population increases, but with a time lag. As predator numbers rise, they consume more prey, causing the prey population to decline, which then causes predator numbers to fall.'),
  t(8, '### Human Population Growth\n\nThe human population has grown exponentially, especially since the Industrial Revolution.\n\n**Key milestones:**\n- 1804: 1 billion\n- 1927: 2 billion (123 years)\n- 1960: 3 billion (33 years)\n- 1974: 4 billion (14 years)\n- 1987: 5 billion (13 years)\n- 1999: 6 billion (12 years)\n- 2011: 7 billion (12 years)\n- 2022: 8 billion (11 years)\n\n**Reasons for rapid growth:**\n- Improved medicine and hygiene (lower death rates)\n- Better nutrition and food production\n- Advances in sanitation and clean water\n\n**Demographic transition model:** As countries develop, they typically move from high birth and death rates to low birth and death rates. Many developed countries now have near-zero or negative population growth.\n\n**Concerns:** Overpopulation leads to increased demand for resources, habitat destruction, pollution, climate change, and loss of biodiversity.'),
  fb(9, 'The human population has been growing ___ since the Industrial Revolution. Improved medicine and hygiene have reduced the ___ rate, contributing to population growth.',
    ['exponentially', 'death'],
    'Human population growth has been exponential, with the time to add each billion decreasing. Medical advances, better nutrition, and improved sanitation have dramatically reduced death rates, while birth rates have remained high in many regions, driving rapid population growth.'),
  q(10, 'What is the carrying capacity of an environment?',
    ['The maximum number of species that can live in an area', 'The maximum number of individuals of a species that an environment can support indefinitely', 'The total area available for a population', 'The rate at which a population grows'], 1,
    'Carrying capacity (K) is the maximum population size that the environment can sustain over the long term, given the available resources (food, water, space, etc.). When a population reaches K, growth rate approaches zero.'),
];

// =============================================================================
// CHAPTER 10: Revision and Exam Preparation (Term 4)
// =============================================================================
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Revision and Exam Preparation\n\n### Term 1 Revision: Biodiversity\n\n**Microorganisms:**\n- Viruses: Not truly living, obligate intracellular parasites, consist of nucleic acid + capsid\n- Bacteria: Prokaryotic, cell wall with peptidoglycan, plasmids, shapes (cocci, bacilli, spirilla)\n- Protists: Eukaryotic, plant-like (algae), animal-like (protozoa), fungus-like\n- Fungi: Eukaryotic, chitin cell walls, hyphae/mycelium, extracellular digestion, spore reproduction\n\n**Key relationships:**\n- Symbiosis: Mutualism (+/+), commensalism (+/0), parasitism (+/\u2013)\n- Nitrogen fixation by Rhizobium in legume root nodules\n- Traditional technology: Yeast in bread/beer, Lactobacillus in yoghurt'),
  t(2, '### Term 1 Revision: Plant and Animal Biodiversity\n\n**Plant divisions (increasing complexity):**\n- Bryophytes \u2192 Pteridophytes \u2192 Gymnosperms \u2192 Angiosperms\n- Trends: Non-vascular \u2192 vascular; spores \u2192 seeds; water-dependent \u2192 independent fertilisation\n\n**Animal phyla (increasing complexity):**\n- Porifera \u2192 Cnidaria \u2192 Platyhelminthes \u2192 Annelida \u2192 Arthropoda \u2192 Chordata\n- Trends: Asymmetry \u2192 radial \u2192 bilateral; acoelomate \u2192 coelomate; incomplete \u2192 complete gut; open \u2192 closed circulation\n\n**Key distinctions to remember:**\n- Monocots vs dicots (seed leaves, veins, flower parts, vascular bundles, roots)\n- Herbivore vs carnivore vs omnivore dentition\n- Xylem (dead, water up) vs phloem (living, sucrose bidirectional)'),
  q(3, 'Arrange the following in order of increasing complexity: Annelida, Porifera, Cnidaria, Chordata, Arthropoda, Platyhelminthes',
    ['Porifera, Cnidaria, Platyhelminthes, Annelida, Arthropoda, Chordata', 'Cnidaria, Porifera, Annelida, Platyhelminthes, Chordata, Arthropoda', 'Platyhelminthes, Porifera, Cnidaria, Annelida, Arthropoda, Chordata', 'Porifera, Platyhelminthes, Cnidaria, Annelida, Chordata, Arthropoda'], 0,
    'The order of increasing complexity is: Porifera (simplest, no tissues), Cnidaria (radial symmetry, diploblastic), Platyhelminthes (bilateral, triploblastic, acoelomate), Annelida (segmented, coelomate), Arthropoda (exoskeleton, jointed limbs), Chordata (endoskeleton, complex nervous system).'),
  t(4, '### Term 2 Revision: Photosynthesis and Respiration\n\n**Photosynthesis (in chloroplasts):**\n- Light reactions (thylakoid membranes): Light energy \u2192 ATP + NADPH + O\u2082 (from photolysis of water)\n- Dark reactions / Calvin cycle (stroma): CO\u2082 fixed by RuBisCO onto RuBP \u2192 GP \u2192 G3P \u2192 glucose\n- Limiting factors: Light intensity, CO\u2082 concentration, temperature\n\n**Cellular respiration (in cytoplasm + mitochondria):**\n- Glycolysis (cytoplasm): Glucose \u2192 2 pyruvate + 2 ATP + 2 NADH\n- Krebs cycle (mitochondrial matrix): Acetyl CoA oxidised, CO\u2082 released, NADH + FADH\u2082 produced\n- Oxidative phosphorylation (inner mitochondrial membrane): ETC + chemiosmosis \u2192 ~34 ATP; O\u2082 = final electron acceptor\n- Total: ~36\u201338 ATP per glucose\n\n**Anaerobic respiration:** Only glycolysis (2 ATP); fermentation regenerates NAD\u207a\n- Alcoholic: Glucose \u2192 ethanol + CO\u2082 (yeast)\n- Lactic acid: Glucose \u2192 lactic acid (muscles)'),
  t(5, '### Term 2 Revision: Animal Nutrition\n\n**Digestive system key points:**\n- Mouth: Mechanical + chemical (salivary amylase on starch)\n- Stomach: HCl + pepsin (protein digestion at pH 2)\n- Duodenum: Bile (emulsifies fats) + pancreatic enzymes\n- Ileum: Main absorption site (villi, microvilli, lacteals)\n- Large intestine: Water absorption\n\n**Blood glucose homeostasis:**\n- High glucose \u2192 Beta cells \u2192 Insulin \u2192 glycogenesis (glucose \u2192 glycogen)\n- Low glucose \u2192 Alpha cells \u2192 Glucagon \u2192 glycogenolysis (glycogen \u2192 glucose)\n- Diabetes Type 1: No insulin (autoimmune); Type 2: Insulin resistance'),
  q(6, 'Which enzyme catalyses the first step of the Calvin cycle, and what does it do?',
    ['Helicase; it unwinds DNA', 'RuBisCO; it fixes CO\u2082 by attaching it to RuBP', 'ATP synthase; it produces ATP from ADP', 'Pepsin; it digests proteins'], 1,
    'RuBisCO (ribulose bisphosphate carboxylase-oxygenase) catalyses carbon fixation \u2014 the attachment of CO\u2082 to the 5-carbon sugar RuBP, forming an unstable 6-carbon compound that splits into two molecules of GP (3-carbon).'),
  t(7, '### Term 3 Revision: Gaseous Exchange and Excretion\n\n**Gaseous exchange:**\n- Alveoli: Large surface area, thin walls, moist, rich blood supply\n- Breathing: Diaphragm + intercostal muscles change thoracic volume/pressure\n- Smoking: Tar (destroys cilia, carcinogen), nicotine (addictive), CO (binds haemoglobin)\n\n**Excretion (kidneys):**\n- Nephron: Bowman\'s capsule \u2192 PCT \u2192 Loop of Henle \u2192 DCT \u2192 collecting duct\n- Ultrafiltration: High pressure in glomerulus forces small molecules into Bowman\'s capsule\n- Selective reabsorption: All glucose, amino acids, most water reabsorbed in PCT\n- ADH: Controls water reabsorption in collecting duct (negative feedback)\n\n**Population ecology:**\n- Carrying capacity (K), sigmoid growth curve\n- Density-dependent vs density-independent factors\n- Predator-prey cycles'),
  fb(8, 'In the kidneys, the process of ___ occurs in the glomerulus, where high blood pressure forces small molecules into Bowman\'s capsule. The hormone ___ controls water reabsorption.',
    ['ultrafiltration', 'ADH'],
    'Ultrafiltration is the pressure-driven filtration of blood in the glomerulus. ADH (antidiuretic hormone) regulates the permeability of the collecting duct to water, controlling the volume and concentration of urine produced.'),
  t(9, '### Exam Tips for Life Sciences\n\n**Common mistakes to avoid:**\n1. Confusing **excretion** (metabolic waste) with **egestion** (undigested food)\n2. Saying "plants only photosynthesise" \u2014 plants also respire, continuously\n3. Writing "oxygen is produced in the Calvin cycle" \u2014 O\u2082 comes from the light reactions (photolysis of water)\n4. Confusing **insulin** (lowers blood glucose) with **glucagon** (raises blood glucose)\n5. Saying "blood mixes in the placenta" \u2014 maternal and foetal blood NEVER mix\n6. Forgetting that glycolysis occurs in the **cytoplasm**, not the mitochondria\n\n**Command words:**\n- **Define**: Give a precise meaning\n- **Describe**: Say what happens step by step\n- **Explain**: Give reasons WHY something happens\n- **Compare**: Give similarities AND differences\n- **Distinguish**: Give differences only\n- **Discuss**: Present arguments for and against'),
  q(10, 'Which of the following statements is correct?',
    ['Plants carry out photosynthesis during the day and respiration at night only', 'Plants carry out both photosynthesis (in light) and respiration (continuously, day and night)', 'Oxygen is produced during the Calvin cycle', 'The Krebs cycle takes place in the cytoplasm'], 1,
    'Plants respire continuously \u2014 both day and night. During the day, they also photosynthesise, and the rate of photosynthesis usually exceeds respiration. At night, only respiration occurs. Oxygen comes from the light reactions, not the Calvin cycle, and the Krebs cycle occurs in the mitochondrial matrix.'),
];

// =============================================================================
// MAIN — Insert into MongoDB
// =============================================================================
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create the Life Sciences subject
  const subjectDoc = await db.collection('subjects').findOne({
    name: /Life Sciences/i,
    schoolId: SCHOOL_ID,
  });

  let SUBJECT_ID;
  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Life Sciences subject:', String(SUBJECT_ID));
  } else {
    const result = await db.collection('subjects').insertOne({
      name: 'Life Sciences',
      code: 'LIFS',
      schoolId: SCHOOL_ID,
      gradeIds: [GRADE_ID],
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Life Sciences subject:', String(SUBJECT_ID));
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
    tags: ['life-sciences', 'grade-11', 'caps'],
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
      title: 'Chapter 1: Biodiversity of Microorganisms',
      description: 'Classification schemes, viruses, bacteria, protists, fungi, basic structures and characteristics, diseases, symbiotic relationships, nitrogen fixation, antibiotics, and traditional technology.',
      order: 1,
      lessons: [
        { title: 'Viruses, Bacteria, and Protists', description: 'Classification schemes, viral structure and reproduction, bacterial structure, shapes, diseases, antibiotics, and the protist kingdom including malaria.', blocks: ch1_lesson1, term: 1 },
        { title: 'Fungi, Symbiosis, and Biotechnology', description: 'Fungal structure and nutrition, symbiotic relationships (mutualism, commensalism, parasitism), nitrogen fixation by Rhizobium, and traditional and modern uses of microorganisms.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Biodiversity of Plants',
      description: 'Bryophytes, Pteridophytes, Gymnosperms, Angiosperms, vascular tissue, comparative tables, sexual and asexual reproduction, and pollination.',
      order: 2,
      lessons: [
        { title: 'Plant Divisions and Classification', description: 'Bryophytes, pteridophytes, gymnosperms, and angiosperms: key characteristics, vascular tissue, reproduction, evolutionary trends, monocots vs dicots.', blocks: ch2_lesson1, term: 1 },
        { title: 'Plant Reproduction and Vascular Tissue', description: 'Xylem and phloem structure and function, flower structure, pollination, double fertilisation, seed formation, and asexual reproduction methods.', blocks: ch2_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Biodiversity of Animals',
      description: 'Six animal phyla (Porifera, Cnidaria, Platyhelminthes, Annelida, Arthropoda, Chordata), body plans, key features, comparative tables, and role in agriculture and ecosystems.',
      order: 3,
      lessons: [
        { title: 'Invertebrate Phyla', description: 'Porifera, Cnidaria, Platyhelminthes, Annelida, and Arthropoda: key features, body plans, symmetry, classification, and ecological roles.', blocks: ch3_lesson1, term: 1 },
        { title: 'Chordata and Comparative Classification', description: 'Phylum Chordata, vertebrate classes, comparative table of six phyla, evolutionary trends, and the role of animals in agriculture and ecosystems.', blocks: ch3_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Photosynthesis',
      description: 'Chloroplast structure, light and dark reactions, factors affecting rate, importance of photosynthesis, and improving crop yields.',
      order: 4,
      lessons: [
        { title: 'The Process of Photosynthesis', description: 'Chloroplast structure, light-dependent reactions (photolysis, ATP, NADPH), the Calvin cycle (carbon fixation by RuBisCO), and factors affecting the rate of photosynthesis.', blocks: ch4_lesson1, term: 2 },
        { title: 'Importance of Photosynthesis and Crop Production', description: 'Uses of glucose, importance of photosynthesis for food, oxygen, and climate, improving crop yields in greenhouses, and comparing photosynthesis with respiration.', blocks: ch4_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Cellular Respiration',
      description: 'Aerobic respiration (glycolysis, Krebs cycle, oxidative phosphorylation), anaerobic respiration, ATP, comparison of aerobic and anaerobic, and industrial applications (brewing, bread-making).',
      order: 5,
      lessons: [
        { title: 'Aerobic Respiration', description: 'ATP as energy currency, glycolysis in the cytoplasm, the Krebs cycle in the mitochondrial matrix, oxidative phosphorylation and chemiosmosis on the inner mitochondrial membrane.', blocks: ch5_lesson1, term: 2 },
        { title: 'Anaerobic Respiration and Industrial Applications', description: 'Alcoholic and lactic acid fermentation, oxygen debt, aerobic vs anaerobic comparison, bread-making, brewing, yoghurt and cheese production.', blocks: ch5_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Animal Nutrition',
      description: 'Dentition (herbivore, carnivore, omnivore), alimentary canal structure and function, mechanical and chemical digestion, absorption (villi), assimilation, egestion, and homeostatic control of blood sugar.',
      order: 6,
      lessons: [
        { title: 'Digestion and Absorption', description: 'Dentition and diet adaptations, the alimentary canal, mechanical and chemical digestion, digestive enzymes, absorption through villi in the ileum, assimilation, and egestion.', blocks: ch6_lesson1, term: 2 },
        { title: 'Blood Glucose Homeostasis', description: 'Homeostasis and negative feedback, insulin and glucagon, beta and alpha cells, glycogenesis and glycogenolysis, diabetes mellitus (Type 1 and Type 2), and the role of the liver.', blocks: ch6_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Gaseous Exchange',
      description: 'Requirements for gaseous exchange, human respiratory system structure, alveolar adaptations, breathing mechanism, and the effects of smoking.',
      order: 7,
      lessons: [
        { title: 'Gaseous Exchange in Humans', description: 'Gaseous exchange surfaces, the respiratory system, alveolar adaptations, the breathing mechanism (inhalation and exhalation), and the harmful effects of smoking on the lungs.', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Excretion in Humans',
      description: 'Excretion vs egestion, the urinary system, nephron structure, ultrafiltration, selective reabsorption, tubular secretion, and water balance regulated by ADH.',
      order: 8,
      lessons: [
        { title: 'The Kidneys and Urine Formation', description: 'Excretory organs and waste products, kidney and nephron structure, ultrafiltration, selective reabsorption, tubular secretion, water balance and ADH regulation.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Population Ecology',
      description: 'Population size, density, distribution, limiting factors, population growth curves, carrying capacity, predator-prey interactions, and human population growth.',
      order: 9,
      lessons: [
        { title: 'Population Dynamics and Human Impact', description: 'Population ecology terminology, factors affecting population size, exponential and logistic growth curves, carrying capacity, predator-prey cycles, and human population growth.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Revision and Exam Preparation',
      description: 'Comprehensive revision of all Grade 11 Life Sciences topics: biodiversity, photosynthesis, respiration, nutrition, gaseous exchange, excretion, population ecology, and exam strategies.',
      order: 10,
      lessons: [
        { title: 'Full Year Revision and Exam Tips', description: 'Revision summaries for Terms 1 to 3, key concepts, common mistakes to avoid, command words, and exam strategies for Life Sciences.', blocks: ch10_lesson1, term: 4 },
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
    title: 'Grade 11 Life Sciences \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Biodiversity (microorganisms, plants, animals), Photosynthesis, Cellular Respiration, Animal Nutrition, Gaseous Exchange, Excretion, and Population Ecology for the Grade 11 Life Sciences curriculum.',
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
  console.log('  TEXTBOOK: Grade 11 Life Sciences');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
