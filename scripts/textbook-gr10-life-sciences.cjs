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
// CHAPTER 1: Chemistry of Life (Term 1, Weeks 3-5)
// =============================================================================
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## The Chemistry of Life\n\n### Molecules for Life\n\nAll living things are made up of chemical elements. The most abundant elements in living organisms are:\n\n| Element | Symbol | Role in living organisms |\n|---------|--------|-------------------------|\n| Carbon | C | Backbone of all organic molecules |\n| Hydrogen | H | Component of water and all organic molecules |\n| Oxygen | O | Component of water; needed for aerobic respiration |\n| Nitrogen | N | Found in amino acids, proteins, and nucleic acids |\n| Phosphorus | P | Found in ATP, DNA, and RNA; part of cell membranes |\n\n**Inorganic compounds** do not contain carbon-hydrogen bonds. Important examples include:\n- **Water** (H\u2082O) \u2014 makes up 65\u201375% of living organisms; acts as a solvent, transport medium, and reactant\n- **Minerals** \u2014 e.g., calcium (bones, teeth), iron (haemoglobin), sodium and potassium (nerve impulses)\n\n**Organic compounds** contain carbon bonded to hydrogen and often oxygen, nitrogen, or other elements. The four main groups are carbohydrates, lipids, proteins, and nucleic acids.'),
  t(2, '### Water and Its Importance\n\nWater is essential for life. Its unique properties arise from its polar nature and hydrogen bonding.\n\n**Properties of water and biological importance:**\n\n| Property | Explanation | Biological importance |\n|----------|------------|----------------------|\n| Excellent solvent | Polar water molecules dissolve ionic and polar substances | Allows transport of nutrients, gases, and waste in blood and sap |\n| High specific heat capacity | Large amount of energy needed to change temperature | Keeps body temperature stable; protects aquatic organisms from rapid temperature changes |\n| High heat of vaporisation | Much energy needed to evaporate water | Sweating and transpiration cool organisms effectively |\n| Cohesion | Water molecules stick together (hydrogen bonds) | Allows water to be pulled up xylem vessels in plants |\n| Reactant | Participates in chemical reactions | Used in photosynthesis and hydrolysis reactions |\n\n**Micro elements** (trace elements) are needed in tiny amounts:\n- Iron (Fe) \u2014 component of haemoglobin\n- Iodine (I) \u2014 needed for thyroid hormones\n\n**Macro elements** are needed in larger amounts: C, H, O, N, P, Ca, K, Na, S, Mg, Cl'),
  q(3, 'Why is water described as a "universal solvent"?',
    ['Because it can dissolve all substances', 'Because it is a polar molecule that can dissolve many ionic and polar substances', 'Because it has a high boiling point', 'Because it contains oxygen'], 1,
    'Water is a polar molecule (has a slightly positive hydrogen end and a slightly negative oxygen end). This polarity allows it to attract and dissolve many ionic compounds and other polar molecules, making it an excellent solvent for biological reactions.'),
  t(4, '### Organic Compounds: Carbohydrates\n\nCarbohydrates are composed of carbon, hydrogen, and oxygen. The general formula is C\u2093(H\u2082O)\u2099.\n\n**Types of carbohydrates:**\n\n| Type | Size | Examples | Function |\n|------|------|----------|----------|\n| **Monosaccharides** | Single sugar unit | Glucose (C\u2086H\u2081\u2082O\u2086), fructose, galactose | Immediate energy source |\n| **Disaccharides** | Two sugar units joined | Sucrose (glucose + fructose), maltose (glucose + glucose), lactose (glucose + galactose) | Transport sugar (sucrose in phloem), energy |\n| **Polysaccharides** | Many sugar units | Starch, glycogen, cellulose | Energy storage (starch in plants, glycogen in animals), structural support (cellulose in cell walls) |\n\n**Key reactions:**\n- **Condensation reaction**: Two monosaccharides join, releasing a water molecule, to form a disaccharide (linked by a glycosidic bond)\n- **Hydrolysis reaction**: A disaccharide or polysaccharide is broken down by adding a water molecule\n\n**Food tests:**\n- Starch: Iodine solution turns from brown/yellow to **blue-black**\n- Reducing sugars (glucose): Benedict\'s solution turns from blue to **green/yellow/orange/brick-red** when heated'),
  q(5, 'What is the difference between a condensation reaction and a hydrolysis reaction?',
    ['Condensation uses water to join molecules; hydrolysis releases water to break molecules', 'Condensation removes water to join molecules; hydrolysis adds water to break molecules apart', 'They are the same reaction', 'Condensation only applies to proteins; hydrolysis only applies to carbohydrates'], 1,
    'In a condensation reaction, two molecules are joined together and a water molecule is released (removed). In hydrolysis (hydro = water, lysis = break), a water molecule is added to break a bond, splitting a larger molecule into smaller units. These are reverse reactions.'),
  fb(6, 'Starch is a ___ made up of many glucose units. When iodine solution is added to starch, it turns ___.',
    ['polysaccharide', 'blue-black'],
    'Starch is a polysaccharide (polymer of glucose) used for energy storage in plants. The iodine test is the standard food test for starch: iodine solution changes from brown/yellow to blue-black in the presence of starch.'),
  t(7, '### Organic Compounds: Lipids\n\nLipids (fats and oils) are composed of carbon, hydrogen, and oxygen. They contain proportionally less oxygen than carbohydrates.\n\n**Structure:** A lipid is formed from **one glycerol** molecule bonded to **three fatty acid** chains.\n\n**Types of fatty acids:**\n| Type | Bonds | State at room temp | Examples |\n|------|-------|-------------------|----------|\n| **Saturated** | Only single C\u2013C bonds | Solid (fats) | Butter, animal fat |\n| **Unsaturated** | One or more C=C double bonds | Liquid (oils) | Olive oil, sunflower oil |\n\n**Functions of lipids:**\n- Energy storage (contain more energy per gram than carbohydrates)\n- Insulation (subcutaneous fat retains body heat)\n- Protection (cushions organs)\n- Cell membrane structure (phospholipid bilayer)\n- Waterproofing (waxy cuticle on leaves)\n\n**Food test for lipids:** The **emulsion test** \u2014 shake the sample with ethanol, then pour into water. A cloudy white emulsion indicates the presence of lipids.\n\n**Health:** Excess saturated fat increases blood cholesterol, leading to cardiovascular disease (blocked arteries). Unsaturated fats are healthier.'),
  q(8, 'Which food test would you use to detect the presence of lipids?',
    ['Iodine test', 'Benedict\'s test', 'Biuret test', 'Emulsion test (ethanol test)'], 3,
    'The emulsion test detects lipids. The food sample is dissolved in ethanol, then the ethanol solution is poured into water. If lipids are present, a cloudy white emulsion forms because lipids are insoluble in water.'),
  t(9, '### Organic Compounds: Proteins\n\nProteins are composed of carbon, hydrogen, oxygen, and nitrogen (some also contain sulphur).\n\n**Structure:** Proteins are polymers of **amino acids**. There are 20 different amino acids.\n\n**Levels of protein structure:**\n- **Primary structure**: The specific sequence of amino acids in a chain (held by peptide bonds)\n- **Secondary structure**: Folding into alpha-helices or beta-sheets (held by hydrogen bonds)\n- **Tertiary structure**: Further 3D folding (held by various bonds including disulphide bridges)\n- **Quaternary structure**: Two or more polypeptide chains combined (e.g., haemoglobin has 4 chains)\n\n**Peptide bond:** Formed by a condensation reaction between the amino group (-NH\u2082) of one amino acid and the carboxyl group (-COOH) of another.\n\n**Functions of proteins:**\n| Function | Example |\n|----------|--------|\n| Enzymes (biological catalysts) | Amylase, pepsin |\n| Structural | Collagen (connective tissue), keratin (hair, nails) |\n| Transport | Haemoglobin (carries oxygen) |\n| Defence | Antibodies (immune system) |\n| Hormones | Insulin (blood glucose regulation) |\n| Movement | Actin and myosin (muscle contraction) |\n\n**Food test for proteins:** **Biuret test** \u2014 add sodium hydroxide (NaOH) then copper sulphate (CuSO\u2084). A colour change from blue to **purple/violet** indicates protein.'),
  q(10, 'Amino acids are joined together by which type of bond, and what type of reaction forms this bond?',
    ['Hydrogen bonds, formed by hydrolysis', 'Glycosidic bonds, formed by condensation', 'Peptide bonds, formed by condensation', 'Ionic bonds, formed by oxidation'], 2,
    'Amino acids are linked by peptide bonds, which are formed through condensation reactions (a water molecule is released each time two amino acids join). The bond forms between the amino group (-NH\u2082) of one amino acid and the carboxyl group (-COOH) of another.'),
  fb(11, 'Proteins are polymers of ___. The Biuret test detects protein by changing from blue to ___.',
    ['amino acids', 'purple'],
    'Proteins are built from chains of amino acids linked by peptide bonds. The Biuret reagent (NaOH + CuSO\u2084) turns purple/violet in the presence of peptide bonds, confirming that protein is present.'),
  t(12, '### Nucleic Acids and Vitamins\n\n**Nucleic acids:** DNA and RNA consist of C, H, O, N, and P.\n- **DNA** (deoxyribonucleic acid): Carries genetic information; double-stranded helix\n- **RNA** (ribonucleic acid): Involved in protein synthesis; single-stranded\n- No detailed structure required at Grade 10 level, but you should know that nucleic acids store and transmit hereditary information.\n\n**Vitamins:** Organic compounds needed in small amounts for normal body functioning.\n\n| Vitamin | Source | Function | Deficiency disease |\n|---------|--------|----------|-------------------|\n| A | Carrots, liver, dairy | Vision, skin health | Night blindness |\n| B group | Whole grains, meat, eggs | Energy metabolism, nerve function | Beriberi (B1), pellagra (B3) |\n| C | Citrus fruits, peppers | Immune system, collagen formation | Scurvy |\n| D | Sunlight, fish oils, dairy | Calcium absorption, bone health | Rickets (children), osteomalacia |\n| E | Nuts, seeds, vegetable oils | Antioxidant, protects cells | Rare; muscle weakness |'),
];

// =============================================================================
// CHAPTER 2: Cell Structure (Term 1, Weeks 6-7)
// =============================================================================
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Cells: The Basic Units of Life\n\n### Cell Theory\n\nThe cell theory is one of the fundamental principles of biology. It states:\n\n1. All living organisms are made up of one or more **cells**\n2. The cell is the basic structural and functional unit of life\n3. All cells arise from **pre-existing cells** (by cell division)\n\n**Contributions to cell theory:**\n- **Robert Hooke** (1665): First observed cells in cork tissue using a simple microscope and coined the term "cell"\n- **Anton van Leeuwenhoek** (1674): First to observe living cells (bacteria, protists) with his improved microscope\n- **Matthias Schleiden** (1838): Proposed that all plants are made of cells\n- **Theodor Schwann** (1839): Proposed that all animals are made of cells\n- **Rudolf Virchow** (1855): Proposed that all cells arise from pre-existing cells ("omnis cellula e cellula")'),
  q(2, 'Which scientist is credited with coining the term "cell"?',
    ['Anton van Leeuwenhoek', 'Robert Hooke', 'Matthias Schleiden', 'Rudolf Virchow'], 1,
    'Robert Hooke observed thin slices of cork under a microscope in 1665 and saw small, box-like compartments that reminded him of the cells (rooms) in a monastery. He called them "cells," though what he saw were actually the empty cell walls of dead plant cells.'),
  t(3, '### The Microscope\n\n**Light microscope** \u2014 uses visible light and glass lenses to magnify specimens.\n\n**Key concepts:**\n- **Magnification**: How much larger the image appears compared to the actual object\n  - Total magnification = eyepiece magnification x objective lens magnification\n  - Example: 10x eyepiece x 40x objective = 400x total magnification\n- **Resolution**: The ability to distinguish between two separate points close together\n  - Light microscope resolution: ~200 nm (0.2 \u00b5m)\n\n**Calculating actual size:**\n\nActual size = Image size / Magnification\n\nOr rearranged: Image size = Actual size x Magnification\n\n**Units of measurement:**\n| Unit | Symbol | Equivalent |\n|------|--------|------------|\n| Millimetre | mm | 1 mm = 1 000 \u00b5m |\n| Micrometre | \u00b5m | 1 \u00b5m = 1 000 nm |\n| Nanometre | nm | 1 nm = 0.001 \u00b5m |'),
  fb(4, 'Total magnification is calculated by multiplying the ___ magnification by the ___ lens magnification.',
    ['eyepiece', 'objective'],
    'Total magnification = eyepiece lens magnification x objective lens magnification. For example, if the eyepiece is 10x and the objective lens is 40x, total magnification is 10 x 40 = 400x.'),
  t(5, '### Cell Structure: Plant and Animal Cells\n\n**Structures found in BOTH plant and animal cells:**\n\n| Organelle | Structure | Function |\n|-----------|-----------|----------|\n| **Cell membrane** | Thin, flexible phospholipid bilayer | Controls what enters and leaves the cell; selectively permeable |\n| **Nucleus** | Large, spherical; contains chromatin (DNA); has nuclear membrane and pores | Controls all cell activities; contains genetic information |\n| **Cytoplasm** | Jelly-like fluid filling the cell | Site of many chemical reactions; contains organelles |\n| **Mitochondria** | Double-membrane organelle with cristae (inner folds) | Site of aerobic cellular respiration; produces ATP (energy) |\n| **Ribosomes** | Small granular structures; found free or on rough ER | Site of protein synthesis |\n| **Endoplasmic reticulum (ER)** | Network of membranes; rough ER has ribosomes, smooth ER does not | Rough ER: transports proteins; Smooth ER: makes lipids |\n| **Golgi body** (Golgi apparatus) | Stack of flattened membrane sacs | Packages, modifies, and secretes proteins and lipids |'),
  t(6, '### Structures Found ONLY in Plant Cells\n\n| Organelle | Structure | Function |\n|-----------|-----------|----------|\n| **Cell wall** | Rigid outer layer made of cellulose | Provides structural support and protection; prevents the cell from bursting |\n| **Chloroplasts** | Double-membrane organelle containing chlorophyll (green pigment) | Site of photosynthesis; converts light energy to chemical energy (glucose) |\n| **Large central vacuole** | Large, fluid-filled sac surrounded by a tonoplast membrane | Stores water, dissolved substances, and waste; maintains turgor pressure |\n\n**Key differences between plant and animal cells:**\n\n| Feature | Plant cell | Animal cell |\n|---------|-----------|-------------|\n| Cell wall | Present (cellulose) | Absent |\n| Chloroplasts | Present (in green parts) | Absent |\n| Vacuole | Large, central | Small or absent |\n| Shape | Regular (rectangular) | Irregular (variable) |\n| Storage | Starch | Glycogen |\n| Centrioles | Absent | Present (involved in cell division) |'),
  q(7, 'Which organelle is responsible for producing ATP through aerobic respiration?',
    ['Chloroplast', 'Ribosome', 'Mitochondrion', 'Golgi body'], 2,
    'Mitochondria are the "powerhouses" of the cell. They carry out aerobic cellular respiration, breaking down glucose in the presence of oxygen to produce ATP (adenosine triphosphate), which is the energy currency used by the cell for all its activities.'),
  q(8, 'Which structures are found in plant cells but NOT in animal cells?',
    ['Cell membrane, ribosomes, and mitochondria', 'Cell wall, chloroplasts, and a large central vacuole', 'Nucleus, Golgi body, and endoplasmic reticulum', 'Centrioles, lysosomes, and small vacuoles'], 1,
    'Plant cells have a cellulose cell wall (for support), chloroplasts (for photosynthesis), and a large central vacuole (for water storage and turgor pressure). Animal cells lack all three of these structures but have centrioles, which are absent in most plant cells.'),
  fb(9, 'The ___ is the organelle that controls all cell activities and contains genetic information (DNA). The ___ is responsible for photosynthesis in plant cells.',
    ['nucleus', 'chloroplast'],
    'The nucleus is the control centre of the cell, containing DNA organised as chromatin. Chloroplasts contain the green pigment chlorophyll and are the site of photosynthesis, converting light energy into glucose.'),
  t(10, '### Prokaryotic vs Eukaryotic Cells\n\nCells are classified into two main types:\n\n| Feature | Prokaryotic cell | Eukaryotic cell |\n|---------|-----------------|----------------|\n| Nucleus | No membrane-bound nucleus; DNA in nucleoid region | Membrane-bound nucleus |\n| Organelles | No membrane-bound organelles | Membrane-bound organelles (mitochondria, ER, Golgi, etc.) |\n| DNA | Circular, free in cytoplasm | Linear, in chromosomes within nucleus |\n| Size | Small (1\u201310 \u00b5m) | Larger (10\u2013100 \u00b5m) |\n| Ribosomes | 70S (smaller) | 80S (larger) |\n| Cell wall | Present (peptidoglycan in bacteria) | Present in plants (cellulose), absent in animals |\n| Examples | Bacteria | Animals, plants, fungi, protists |\n\n**Key point:** The main difference is that eukaryotic cells have a membrane-bound nucleus and membrane-bound organelles, while prokaryotic cells do not.'),
  q(11, 'What is the key difference between prokaryotic and eukaryotic cells?',
    ['Prokaryotic cells are larger than eukaryotic cells', 'Prokaryotic cells lack a membrane-bound nucleus and membrane-bound organelles', 'Eukaryotic cells do not have DNA', 'Prokaryotic cells have chloroplasts and mitochondria'], 1,
    'The defining feature of prokaryotic cells (pro = before, karyon = nucleus) is the absence of a membrane-bound nucleus. Their DNA floats freely in the cytoplasm in a nucleoid region. Eukaryotic cells (eu = true) have a true nucleus enclosed by a nuclear envelope.'),
];

blockNum = 0;
const ch2_lesson2 = [
  t(1, '## Cell Membranes and Movement of Substances\n\n### The Cell Membrane\n\nThe cell membrane is a **selectively permeable** barrier that controls the movement of substances into and out of the cell.\n\n**Structure (Fluid Mosaic Model):**\n- **Phospholipid bilayer**: Two layers of phospholipid molecules with hydrophilic (water-loving) heads facing outward and hydrophobic (water-fearing) tails facing inward\n- **Proteins**: Embedded in or attached to the bilayer\n  - Channel proteins: Allow specific substances to pass through\n  - Carrier proteins: Actively transport substances\n  - Receptor proteins: Receive chemical signals\n- **Cholesterol**: Maintains membrane fluidity\n\nThe model is called "fluid" because the phospholipids and proteins can move within the layer, and "mosaic" because the proteins are scattered throughout like tiles in a mosaic.'),
  q(2, 'Why is the cell membrane described as "selectively permeable"?',
    ['Because it allows all substances to pass through freely', 'Because it blocks all substances from entering', 'Because it allows only certain substances to pass through while blocking others', 'Because it only works in plant cells'], 2,
    'The cell membrane is selectively permeable (also called semi-permeable) because it allows small, non-polar molecules (like O\u2082 and CO\u2082) to pass freely, while controlling the passage of larger molecules and ions through channel and carrier proteins.'),
  t(3, '### Diffusion\n\n**Diffusion** is the net movement of particles from a region of **high concentration** to a region of **low concentration** (down the concentration gradient).\n\n**Characteristics:**\n- Passive process (no energy/ATP required)\n- Continues until **equilibrium** is reached (concentrations are equal)\n- Faster at higher temperatures (particles have more kinetic energy)\n\n**Examples in living organisms:**\n- O\u2082 diffuses from the alveoli (high concentration) into the blood (low concentration)\n- CO\u2082 diffuses from cells (high concentration) into the blood (low concentration)\n- O\u2082 diffuses from the blood into cells for respiration\n\n**Factors affecting rate of diffusion:**\n1. Concentration gradient (steeper = faster)\n2. Temperature (higher = faster)\n3. Surface area (larger = faster)\n4. Distance (shorter = faster)\n5. Size of molecule (smaller = faster)'),
  t(4, '### Osmosis\n\n**Osmosis** is the net movement of **water molecules** from a region of **high water concentration** (dilute solution) to a region of **low water concentration** (concentrated solution) through a **selectively permeable membrane**.\n\n**Key terms:**\n- **Hypertonic solution**: Higher solute concentration (lower water concentration) than the cell\n- **Hypotonic solution**: Lower solute concentration (higher water concentration) than the cell\n- **Isotonic solution**: Same solute concentration as the cell\n\n**Effects on plant cells:**\n| Solution | Water movement | Effect | Term |\n|----------|---------------|--------|------|\n| Hypotonic | Water enters cell | Cell becomes turgid (firm); cell wall prevents bursting | **Turgor** |\n| Isotonic | No net movement | Cell stays the same | \u2014 |\n| Hypertonic | Water leaves cell | Cell membrane pulls away from cell wall | **Plasmolysis** |\n\n**Effects on animal cells:**\n| Solution | Water movement | Effect |\n|----------|---------------|--------|\n| Hypotonic | Water enters cell | Cell swells and may burst (**lysis/haemolysis** in red blood cells) |\n| Isotonic | No net movement | Cell stays normal |\n| Hypertonic | Water leaves cell | Cell shrinks (**crenation**) |'),
  q(5, 'A red blood cell is placed in pure water (hypotonic solution). What will happen?',
    ['The cell will shrink (crenate)', 'The cell will remain unchanged', 'The cell will swell and may burst (haemolysis)', 'The cell wall will prevent bursting'], 2,
    'In a hypotonic solution, water moves into the red blood cell by osmosis (from high water concentration outside to low water concentration inside). Since animal cells have no cell wall, the cell swells and may burst (haemolysis). Plant cells would become turgid but would not burst because of their rigid cell wall.'),
  fb(6, 'Osmosis is the movement of ___ molecules through a selectively permeable membrane. When a plant cell loses water in a hypertonic solution, the cell membrane pulls away from the cell wall in a process called ___.',
    ['water', 'plasmolysis'],
    'Osmosis specifically refers to the movement of water molecules down a concentration gradient through a selectively permeable membrane. Plasmolysis occurs when water leaves a plant cell by osmosis, causing the cell membrane to shrink away from the rigid cell wall.'),
  t(7, '### Active Transport\n\n**Active transport** is the movement of substances from a region of **low concentration** to a region of **high concentration** (against the concentration gradient).\n\n**Characteristics:**\n- Requires **energy** (ATP from cellular respiration)\n- Uses **carrier proteins** in the cell membrane\n- Moves substances against the concentration gradient\n\n**Examples:**\n- Root hair cells absorb mineral ions from the soil (where concentration is low) into the root (where concentration is higher)\n- Kidney tubule cells reabsorb glucose from the filtrate back into the blood\n- Nerve cells maintain ion gradients (Na\u207a/K\u207a pump)\n\n**Comparison of transport mechanisms:**\n\n| Feature | Diffusion | Osmosis | Active transport |\n|---------|-----------|---------|------------------|\n| Energy required | No | No | Yes (ATP) |\n| Direction | High to low concentration | High to low water concentration | Low to high concentration |\n| Membrane needed | Not always | Yes (selectively permeable) | Yes |\n| Carrier proteins | No | No | Yes |\n| Examples | Gas exchange | Water uptake by roots | Mineral absorption by roots |'),
  q(8, 'What distinguishes active transport from diffusion?',
    ['Active transport does not require a membrane', 'Active transport moves substances from low to high concentration and requires ATP', 'Diffusion requires energy but active transport does not', 'Active transport only occurs in plant cells'], 1,
    'Active transport moves substances against the concentration gradient (from low to high concentration), which requires energy in the form of ATP. Diffusion is passive and moves substances down the concentration gradient without energy.'),
  q(9, 'Root hair cells absorb mineral ions from the soil using active transport. Why can they NOT rely on diffusion alone?',
    ['Because the soil is too wet', 'Because the concentration of mineral ions is higher inside the root than in the soil, so they must be moved against the gradient', 'Because minerals are too large to diffuse', 'Because root hairs do not have a cell membrane'], 1,
    'The concentration of mineral ions is typically higher inside the root cells than in the surrounding soil solution. Since diffusion only moves substances down the concentration gradient (high to low), the cells must use active transport (requiring ATP) to absorb minerals against the gradient.'),
  fb(10, 'Active transport requires ___ as an energy source and moves substances from low to ___ concentration.',
    ['ATP', 'high'],
    'Active transport uses ATP produced by cellular respiration to power carrier proteins that move substances against the concentration gradient \u2014 from a region of low concentration to a region of high concentration.'),
];

// =============================================================================
// CHAPTER 3: Cell Division \u2014 Mitosis (Term 1, Weeks 9-10)
// =============================================================================
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Cell Division: Mitosis\n\n### Why Do Cells Divide?\n\nCells divide for three main reasons:\n1. **Growth**: To increase the number of cells in a multicellular organism\n2. **Repair**: To replace damaged or worn-out cells (e.g., skin cells, blood cells)\n3. **Reproduction**: In asexual reproduction, to produce genetically identical offspring\n\n### Chromosomes\n\n- A **chromosome** is a tightly coiled structure of DNA and protein (histone proteins)\n- Before cell division, each chromosome is copied to form two identical **chromatids** joined at the **centromere**\n- Human body cells are **diploid (2n)** \u2014 they contain 46 chromosomes arranged in 23 **homologous pairs**\n- Homologous chromosomes carry genes for the same characteristics at the same positions (loci), but may have different alleles\n- Human sex cells (gametes) are **haploid (n)** \u2014 they contain 23 chromosomes (one from each pair)'),
  q(2, 'How many chromosomes are found in a normal human body cell?',
    ['23', '46', '92', '12'], 1,
    'Human body (somatic) cells are diploid (2n = 46). They contain 23 pairs of homologous chromosomes \u2014 22 pairs of autosomes and 1 pair of sex chromosomes (XX in females, XY in males). Gametes are haploid (n = 23).'),
  t(3, '### The Cell Cycle\n\nThe cell cycle describes the stages a cell goes through from one division to the next. It consists of:\n\n**1. Interphase** (longest phase \u2014 approximately 90% of the cell cycle):\n- **G\u2081 phase**: Cell grows, carries out normal functions, organelles increase\n- **S phase** (synthesis): DNA is replicated (each chromosome now has two identical chromatids)\n- **G\u2082 phase**: Cell prepares for division; proteins needed for mitosis are synthesised\n\n**2. Mitotic phase** (M phase):\n- **Mitosis**: Division of the nucleus into two identical daughter nuclei\n- **Cytokinesis**: Division of the cytoplasm to form two separate daughter cells\n\n**Important:** By the end of the S phase, each chromosome consists of two identical sister chromatids joined at the centromere. The cell now has double the amount of DNA but the same number of chromosomes.'),
  fb(4, 'During the ___ phase of interphase, DNA is replicated. After replication, each chromosome consists of two identical sister ___.',
    ['S', 'chromatids'],
    'The S (synthesis) phase is when DNA replication occurs. Each chromosome is copied to produce two identical sister chromatids, joined at the centromere. This ensures that when the cell divides, each daughter cell receives a complete set of genetic information.'),
  t(5, '### Phases of Mitosis\n\nMitosis divides the nucleus into two **genetically identical** daughter nuclei, each with the same number of chromosomes as the parent cell (diploid).\n\n**1. Prophase:**\n- Chromatin condenses into visible chromosomes (each made of two chromatids)\n- The nuclear membrane breaks down\n- Centrioles (in animal cells) move to opposite poles and form the **spindle fibres**\n- The nucleolus disappears\n\n**2. Metaphase:**\n- Chromosomes line up along the **equator** (middle) of the cell\n- Spindle fibres attach to the centromere of each chromosome\n- Chromosomes are at their most condensed and visible\n\n**3. Anaphase:**\n- The centromere splits\n- Sister chromatids are pulled apart to opposite poles by the shortening spindle fibres\n- Each chromatid is now called a chromosome\n- The cell begins to elongate\n\n**4. Telophase:**\n- Chromosomes reach the poles and begin to uncoil (back into chromatin)\n- Nuclear membranes re-form around each set of chromosomes\n- Nucleoli reappear\n- Spindle fibres disintegrate'),
  q(6, 'During which phase of mitosis do the chromosomes line up along the equator of the cell?',
    ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'], 1,
    'During metaphase (meta = middle), chromosomes align along the equator (middle) of the cell. The spindle fibres attach to the centromeres, ensuring that each chromatid will be pulled to the correct pole. A useful mnemonic: Metaphase = Middle.'),
  t(7, '### Cytokinesis and the Importance of Mitosis\n\n**Cytokinesis** (division of the cytoplasm) differs in plant and animal cells:\n- **Animal cells**: A cleavage furrow forms (the cell membrane pinches inward from both sides)\n- **Plant cells**: A cell plate forms across the middle (new cell wall and membrane are built from the centre outward)\n\n**Result of mitosis:** Two daughter cells, each genetically **identical** to the parent cell and to each other. Each daughter cell is diploid (2n).\n\n**Importance of mitosis:**\n- **Growth**: Increases cell number in multicellular organisms\n- **Repair**: Replaces dead or damaged cells (e.g., wound healing, replacing blood cells)\n- **Asexual reproduction**: Some organisms reproduce by mitosis (e.g., budding in yeast, vegetative propagation in plants)\n- **Genetic consistency**: All daughter cells have the same DNA as the parent cell\n\n**Difference in telophase between plant and animal cells:**\n- Plant cells form a cell plate; animal cells form a cleavage furrow'),
  q(8, 'How many daughter cells are produced by mitosis, and are they genetically identical or different?',
    ['Two genetically identical diploid cells', 'Four genetically different haploid cells', 'Two genetically different diploid cells', 'One genetically identical diploid cell'], 0,
    'Mitosis produces two daughter cells that are genetically identical to each other and to the parent cell. Each daughter cell is diploid (2n), containing the same number of chromosomes as the parent. This contrasts with meiosis, which produces four haploid cells.'),
  fb(9, 'Mitosis produces ___ genetically identical daughter cells. In animal cells, the cytoplasm divides by a cleavage furrow, while in plant cells a ___ forms.',
    ['two', 'cell plate'],
    'Mitosis always produces two genetically identical diploid daughter cells. In animal cells, the cleavage furrow pinches the cell in half. In plant cells, vesicles from the Golgi body fuse to form a cell plate across the middle of the cell, which develops into a new cell wall.'),
  t(10, '### Cancer: Uncontrolled Cell Division\n\nCancer occurs when cells divide uncontrollably, forming a mass of abnormal cells called a **tumour**.\n\n**Causes of cancer (carcinogens and factors):**\n- Chemical carcinogens: Tar in cigarette smoke, asbestos\n- Radiation: UV light from the sun, X-rays\n- Viral infections: HPV (cervical cancer), Hepatitis B (liver cancer)\n- Genetic factors: Inherited mutations in genes controlling cell division\n\n**Types of tumours:**\n- **Benign**: Cells stay in one place; not life-threatening but may compress nearby tissues\n- **Malignant**: Cells can spread to other parts of the body through the blood or lymph system (**metastasis**); this is cancer\n\n**Treatment of cancer:**\n- **Surgery**: Removal of the tumour\n- **Chemotherapy**: Drugs that kill rapidly dividing cells (side effects: hair loss, nausea)\n- **Radiotherapy**: Targeted radiation to destroy cancer cells\n- Medical biotechnology continues to develop new treatments, such as immunotherapy\n\n**Prevention:** Avoid smoking, limit sun exposure (use sunscreen), eat a balanced diet, exercise regularly, and attend regular screening tests.'),
  q(11, 'What is the difference between a benign and a malignant tumour?',
    ['Benign tumours grow faster than malignant tumours', 'Benign tumours remain localised; malignant tumours can spread to other parts of the body (metastasis)', 'Malignant tumours are harmless; benign tumours are cancerous', 'There is no difference between them'], 1,
    'Benign tumours grow slowly and remain in one location \u2014 they do not invade other tissues. Malignant tumours are cancerous: they grow rapidly, invade neighbouring tissues, and can metastasise (spread) to distant parts of the body through the blood or lymph system.'),
];

// =============================================================================
// CHAPTER 4: Plant and Animal Tissues (Term 2, Weeks 1-2 and 6-7)
// =============================================================================
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Plant Tissues\n\n### What is a Tissue?\n\nA **tissue** is a group of similar cells that work together to perform a specific function. A group of different tissues working together forms an **organ**.\n\n### Types of Plant Tissues\n\nPlant tissues are divided into two main categories:\n1. **Meristematic tissue**: Actively dividing cells found at growing points (root tips, shoot tips)\n2. **Permanent tissue**: Cells that have differentiated and no longer divide\n\n### Meristematic vs Permanent Tissue\n\n| Feature | Meristematic tissue | Permanent tissue |\n|---------|--------------------|-----------------|\n| Cell division | Active | Cells do not divide |\n| Location | Tips of roots and shoots (apical meristem) | Throughout the plant |\n| Cell shape | Small, thin-walled, no vacuoles | Various shapes; may have thick walls |\n| Function | Growth | Various specialised functions |'),
  t(2, '### Plant Tissue Types\n\n**1. Epidermal tissue (epidermis):**\n- Covers outer surfaces of leaves, stems, and roots\n- Usually one cell thick; cells are flat and tightly packed (no gaps)\n- Produces a waxy **cuticle** on the leaf surface to reduce water loss\n- Contains **stomata** (tiny pores) mainly on the lower leaf surface, each surrounded by two **guard cells** that control gas exchange\n- **Root hair cells** are modified epidermal cells with long extensions to increase surface area for water and mineral absorption\n\n**2. Parenchyma tissue:**\n- Thin-walled, loosely packed cells with large vacuoles\n- Functions: Storage (starch in roots/tubers), photosynthesis (mesophyll cells in leaves), gas exchange (air spaces between cells)\n- Found throughout the plant (cortex, pith, mesophyll)\n\n**3. Collenchyma tissue:**\n- Cells have **unevenly thickened** cell walls (thicker at the corners)\n- Provides flexible support to young, growing stems and leaf stalks (petioles)\n- Living cells'),
  t(3, '### Plant Tissue Types (continued)\n\n**4. Sclerenchyma tissue:**\n- Cells have **uniformly thick, lignified** cell walls\n- Cells are dead at maturity (lumen is empty)\n- Provides rigid structural support\n- Two types: **fibres** (long, narrow) and **sclereids** (stone cells, e.g., the gritty texture in pears)\n\n**5. Xylem tissue:**\n- Transports **water and dissolved minerals** from roots to leaves\n- Made of dead, hollow cells with lignified walls\n- Transport is **unidirectional** (upward only)\n- Two cell types: **vessels** (wider, more efficient) and **tracheids** (narrower, more primitive)\n- Lignin also provides structural support\n\n**6. Phloem tissue:**\n- Transports dissolved **organic compounds** (mainly sucrose) from leaves to other parts of the plant (translocation)\n- Made of living cells: **sieve tube elements** (with perforated sieve plates) and **companion cells** (which provide energy for transport)\n- Transport is **bidirectional** (up or down, from source to sink)'),
  q(4, 'Which plant tissue is made up of dead cells with lignified walls and provides both support and water transport?',
    ['Phloem', 'Parenchyma', 'Xylem', 'Collenchyma'], 2,
    'Xylem tissue consists of dead, hollow cells with walls strengthened by lignin. This combination serves a dual function: transporting water and dissolved minerals upward from the roots, and providing rigid structural support to the plant.'),
  fb(5, 'Xylem transports water ___directionally (upward), while phloem transports sucrose ___directionally (up or down).',
    ['uni', 'bi'],
    'Xylem transport is one-way (unidirectional) \u2014 always upward from roots to leaves, driven by transpiration pull. Phloem transport is two-way (bidirectional) \u2014 sucrose moves from source (where it is made, e.g., leaves) to sink (where it is needed, e.g., roots, fruits).'),
  t(6, '### Comparing Plant Tissues\n\n| Tissue | Cell wall | Living/Dead | Main function |\n|--------|-----------|------------|---------------|\n| Epidermis | Thin + cuticle | Living | Protection, reduces water loss |\n| Parenchyma | Thin | Living | Storage, photosynthesis |\n| Collenchyma | Unevenly thickened | Living | Flexible support |\n| Sclerenchyma | Uniformly thick, lignified | Dead | Rigid support |\n| Xylem | Thick, lignified | Dead | Water transport + support |\n| Phloem | Thin | Living | Sugar transport |\n\n**Key point for exams:** Be able to identify each tissue type from a microscope drawing or micrograph. Look at cell wall thickness, whether cells are living or dead, and the arrangement of cells.'),
  q(7, 'A student observes a tissue under the microscope and sees cells with unevenly thickened walls (thick at the corners). This tissue is most likely:',
    ['Sclerenchyma', 'Collenchyma', 'Parenchyma', 'Xylem'], 1,
    'Collenchyma cells have cell walls that are thickened unevenly, especially at the corners. This gives them flexible support \u2014 they can stretch as the plant grows. Sclerenchyma has uniformly thick, lignified walls and is dead at maturity.'),
  q(8, 'What is the function of guard cells in the leaf epidermis?',
    ['To transport water up the plant', 'To store starch for energy', 'To control the opening and closing of stomata for gas exchange', 'To provide structural support'], 2,
    'Guard cells are specialised epidermal cells that surround each stoma (pore). When guard cells are turgid (full of water), the stoma opens, allowing gas exchange (CO\u2082 in, O\u2082 out) and transpiration (water vapour out). When flaccid, the stoma closes to conserve water.'),
];

blockNum = 0;
const ch4_lesson2 = [
  t(1, '## Animal Tissues\n\n### Four Main Types of Animal Tissue\n\nAnimal tissues are classified into four main types:\n1. Epithelial tissue\n2. Connective tissue\n3. Muscle tissue\n4. Nerve tissue\n\n### Epithelial Tissue\n\nEpithelial tissue covers body surfaces and lines organs and cavities.\n\n**Types and functions:**\n| Type | Shape | Location | Function |\n|------|-------|----------|----------|\n| **Squamous** (flat) | Thin, flat cells | Alveoli, blood capillary walls, lining of cheek | Diffusion, filtration |\n| **Cuboidal** | Cube-shaped cells | Kidney tubules, glands | Secretion, absorption |\n| **Columnar** | Tall, column-shaped cells | Lining of intestine, stomach | Secretion, absorption |\n| **Ciliated** | Columnar cells with cilia | Lining of airways, oviducts | Move substances along surfaces |\n\n**General characteristics of epithelial tissue:**\n- Cells are closely packed with little space between them\n- Attached to a **basement membrane**\n- No blood vessels (avascular) \u2014 receives nutrients by diffusion\n- Can regenerate quickly'),
  q(2, 'Which type of epithelial tissue lines the alveoli of the lungs and why?',
    ['Ciliated epithelium, to move mucus', 'Columnar epithelium, to absorb nutrients', 'Squamous epithelium, because the thin flat cells provide a short diffusion distance for gas exchange', 'Cuboidal epithelium, to secrete mucus'], 2,
    'The alveoli are lined with squamous (flat) epithelium. The extremely thin, flat cells minimise the diffusion distance, allowing rapid exchange of O\u2082 and CO\u2082 between the air in the alveoli and the blood in the surrounding capillaries.'),
  t(3, '### Connective Tissue\n\nConnective tissue supports, binds, and protects organs and structures.\n\n**General characteristics:**\n- Cells are widely spaced in an **extracellular matrix** (non-living material between cells)\n- Well supplied with blood vessels (except cartilage)\n\n**Types of connective tissue:**\n| Type | Matrix | Function | Example/Location |\n|------|--------|----------|------------------|\n| **Blood** | Liquid (plasma) | Transport O\u2082, CO\u2082, nutrients, hormones; defence | Blood vessels |\n| **Bone** | Hard, mineralised (calcium phosphate) | Support, protection, movement | Skeleton |\n| **Cartilage** | Firm but flexible | Support, reduces friction at joints | Ear, nose, between vertebrae, trachea |\n| **Tendons** | Dense, fibrous (collagen) | Attach muscle to bone | Throughout musculoskeletal system |\n| **Ligaments** | Dense, slightly elastic | Attach bone to bone at joints | Joints (knee, ankle) |\n| **Areolar (loose)** | Soft, gel-like with fibres | Connects tissues, holds organs in place | Under skin, around organs |'),
  fb(4, 'Tendons connect ___ to bone, while ligaments connect ___ to bone at joints.',
    ['muscle', 'bone'],
    'Tendons are strong, inelastic connective tissue structures that attach skeletal muscles to bones, allowing muscles to move bones. Ligaments are slightly elastic connective tissue structures that connect bones to other bones at joints, providing stability.'),
  t(5, '### Muscle Tissue\n\nMuscle tissue can contract (shorten) to produce movement.\n\n**Three types of muscle tissue:**\n\n| Type | Appearance | Location | Control | Features |\n|------|-----------|----------|---------|----------|\n| **Skeletal (striated)** | Striped (striations), long fibres, many nuclei | Attached to bones | Voluntary (conscious) | Fast contraction; tires quickly |\n| **Smooth** | Spindle-shaped cells, no striations, one nucleus | Walls of intestines, blood vessels, uterus | Involuntary (unconscious) | Slow, sustained contraction |\n| **Cardiac** | Branched fibres, striations, one or two nuclei, intercalated discs | Heart wall only | Involuntary | Contracts rhythmically; never tires |'),
  q(6, 'Which type of muscle tissue is found in the walls of the digestive tract?',
    ['Skeletal muscle', 'Smooth muscle', 'Cardiac muscle', 'Striated muscle'], 1,
    'Smooth muscle lines the walls of the digestive tract (and other hollow organs like blood vessels and the bladder). It contracts involuntarily and produces slow, wave-like contractions called peristalsis, which push food along the alimentary canal.'),
  t(7, '### Nerve Tissue\n\nNerve tissue transmits electrical impulses (signals) throughout the body.\n\n**Key cell type: Neuron (nerve cell)**\n- **Cell body**: Contains the nucleus and most organelles\n- **Dendrites**: Short, branching extensions that receive impulses from other neurons or receptors\n- **Axon**: Long extension that carries impulses away from the cell body\n- **Myelin sheath**: Fatty insulating layer around the axon that speeds up impulse transmission\n- **Synaptic knob**: End of the axon where chemicals (neurotransmitters) are released to transmit the signal to the next neuron\n\n**Types of neurons:**\n- **Sensory neurons**: Carry impulses from receptors (sense organs) to the central nervous system (CNS)\n- **Motor neurons**: Carry impulses from the CNS to effectors (muscles, glands)\n- **Interneurons (relay neurons)**: Connect sensory and motor neurons within the CNS\n\n**Nerve tissue is found in the brain, spinal cord, and nerves throughout the body.**'),
  fb(8, 'A neuron transmits electrical impulses. The long extension that carries impulses away from the cell body is called the ___. The fatty insulating layer that speeds up impulse transmission is the ___.',
    ['axon', 'myelin sheath'],
    'The axon is a long fibre that conducts nerve impulses away from the cell body toward the next neuron or effector. The myelin sheath (made by Schwann cells) insulates the axon, allowing impulses to "jump" between gaps (nodes of Ranvier), greatly increasing transmission speed.'),
  q(9, 'Which animal tissue has cells embedded in a hard, mineralised matrix of calcium phosphate?',
    ['Cartilage', 'Blood', 'Bone', 'Muscle'], 2,
    'Bone tissue has a matrix hardened by deposits of calcium phosphate and calcium carbonate. This mineralised matrix makes bone very strong and rigid, providing structural support, protection for organs (e.g., skull protects brain, ribcage protects lungs and heart), and attachment points for muscles.'),
  t(10, '### Summary: Comparing Plant and Animal Tissues\n\n| Feature | Plant tissues | Animal tissues |\n|---------|-------------|---------------|\n| Cell wall | Present (cellulose) | Absent |\n| Main types | Epidermal, parenchyma, collenchyma, sclerenchyma, xylem, phloem | Epithelial, connective, muscle, nerve |\n| Support | Cell wall + turgor pressure + lignified tissue | Skeleton (bone, cartilage) |\n| Transport | Xylem and phloem | Blood (in blood vessels) |\n| Communication | Chemical signals (hormones) | Nerve impulses + hormones |'),
];

// =============================================================================
// CHAPTER 5: Plant Organs \u2014 Leaf, Stem, Root (Term 2, Weeks 2-3)
// =============================================================================
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Plant Organs: The Leaf\n\n### Organ Systems in Plants\n\nPlants have two main organ systems:\n1. **Root system**: Anchors the plant, absorbs water and minerals from the soil\n2. **Shoot system**: Consists of stems, leaves, flowers, and fruits\n\nAn **organ** is made of different tissues working together. The leaf, stem, and root are the main vegetative organs of a plant.\n\n### Structure of the Leaf (Cross-Section)\n\nThe leaf is adapted for **photosynthesis** and **gas exchange**.\n\n| Layer | Description | Function |\n|-------|------------|----------|\n| **Upper epidermis** | Transparent layer covered by a waxy cuticle | Protects leaf; cuticle reduces water loss; transparent to allow light through |\n| **Palisade mesophyll** | Tightly packed, columnar cells with many chloroplasts | Main site of photosynthesis; many chloroplasts absorb maximum light |\n| **Spongy mesophyll** | Loosely packed, irregular cells with air spaces | Gas exchange (CO\u2082 and O\u2082 diffuse through air spaces); some photosynthesis |\n| **Lower epidermis** | Contains most stomata, each with two guard cells | Gas exchange; transpiration |\n| **Vascular bundle (vein)** | Xylem (upper) and phloem (lower) | Xylem supplies water; phloem removes sugars |'),
  q(2, 'Why are palisade mesophyll cells packed with chloroplasts and positioned near the upper surface of the leaf?',
    ['To reduce water loss', 'To absorb maximum light for photosynthesis', 'To store starch', 'To provide structural support'], 1,
    'Palisade mesophyll cells are positioned just below the upper epidermis to receive the most light. They are tightly packed and contain many chloroplasts to maximise the rate of photosynthesis. The upper epidermis is transparent to allow light to pass through.'),
  t(3, '### Stomata and Gas Exchange in the Leaf\n\n**Stomata** (singular: stoma) are tiny pores mostly found on the lower epidermis of the leaf.\n\n**Structure:** Each stoma is surrounded by two **guard cells** that change shape to open or close the pore.\n\n**How stomata open and close:**\n- When guard cells absorb water by osmosis, they become **turgid** and curve apart \u2192 stoma opens\n- When guard cells lose water, they become **flaccid** and close together \u2192 stoma closes\n- Guard cells have a thicker inner wall (facing the stoma) which causes them to curve when turgid\n\n**Functions of stomata:**\n1. Allow **CO\u2082** to enter for photosynthesis\n2. Allow **O\u2082** to leave (produced by photosynthesis)\n3. Allow **water vapour** to leave (transpiration)\n\n**Why are most stomata on the lower surface?**\n- The lower surface receives less direct sunlight and is cooler\n- This reduces the rate of transpiration (water loss)\n- Helps conserve water, which is especially important in hot, dry conditions'),
  fb(4, 'Stomata open when guard cells become ___ (absorb water). Most stomata are found on the ___ epidermis of the leaf.',
    ['turgid', 'lower'],
    'When guard cells absorb water by osmosis, they swell and become turgid. Because their inner walls are thicker, they curve outward, opening the stoma. Most stomata are on the lower leaf surface to reduce water loss from transpiration.'),
  t(5, '### Leaf Adaptations for Photosynthesis\n\nThe leaf is perfectly adapted for photosynthesis:\n\n1. **Broad and flat** \u2014 large surface area to absorb maximum light\n2. **Thin** \u2014 short diffusion distance for gases\n3. **Transparent upper epidermis** \u2014 allows light to reach photosynthetic cells\n4. **Palisade mesophyll** \u2014 many chloroplasts arranged near the top to absorb light\n5. **Air spaces in spongy mesophyll** \u2014 allow CO\u2082 to circulate and reach all cells\n6. **Stomata** \u2014 allow CO\u2082 to enter and O\u2082 to leave\n7. **Network of veins** \u2014 xylem brings water to leaf cells; phloem carries away manufactured sugars\n8. **Waxy cuticle** \u2014 reduces water loss without blocking light'),
  q(6, 'Which of the following is NOT an adaptation of the leaf for photosynthesis?',
    ['Broad, flat shape for maximum light absorption', 'Air spaces in the spongy mesophyll for gas circulation', 'Thick, opaque upper epidermis to protect against UV light', 'Many chloroplasts in palisade mesophyll cells'], 2,
    'The upper epidermis must be transparent (not opaque) to allow light to reach the palisade mesophyll cells below. A thick, opaque epidermis would block light and reduce photosynthesis. All other options are genuine adaptations of the leaf.'),
  t(7, '### The Stem and Root\n\n**The Stem:**\n- **Functions**: Support, transport, and holds leaves up to the light\n- Contains vascular bundles arranged differently in monocots and dicots:\n  - **Dicot stem**: Vascular bundles arranged in a ring around the outside\n  - **Monocot stem**: Vascular bundles scattered throughout\n- In each vascular bundle: xylem faces inward, phloem faces outward\n\n**The Root:**\n- **Functions**: Anchoring the plant, absorbing water and mineral salts\n- **Root hair cells**: Extensions of the epidermis that greatly increase surface area for absorption\n  - Water enters root hairs by **osmosis** (moves from high water concentration in soil to lower water concentration in root cells)\n  - Mineral ions enter by **active transport** (moved against concentration gradient, requires ATP)\n- Root tip is protected by a **root cap** (protects the apical meristem as the root pushes through soil)\n- Dicot roots have a central vascular cylinder with xylem in an X or star shape'),
  q(8, 'How does water enter root hair cells from the soil?',
    ['By active transport', 'By osmosis', 'By diffusion', 'Through the stomata'], 1,
    'Water enters root hair cells by osmosis. The cell sap inside the root hair cell has a lower water concentration (higher solute concentration) than the surrounding soil water, so water moves from the soil (high water concentration) into the root hair cell (low water concentration) through the selectively permeable membrane.'),
  fb(9, 'Root hair cells increase the ___ for water absorption. In a dicot stem, vascular bundles are arranged in a ___.',
    ['surface area', 'ring'],
    'Root hair cells are long, thin extensions of epidermal cells that project into the soil, vastly increasing the surface area available for water and mineral absorption. In dicotyledon stems, the vascular bundles are arranged in a ring around the outside, with xylem on the inside and phloem on the outside of each bundle.'),
  q(10, 'Mineral ions are typically at a higher concentration inside root cells than in the soil. How do root cells absorb mineral ions?',
    ['By osmosis', 'By diffusion', 'By active transport, using ATP as energy', 'By facilitated diffusion'], 2,
    'Since mineral ion concentration is higher inside root cells than in the soil, ions must be absorbed against their concentration gradient. This requires active transport, which uses ATP from cellular respiration to power carrier proteins that move ions into the cell.'),
];

// =============================================================================
// CHAPTER 6: Support and Transport in Plants (Term 2, Weeks 3-5)
// =============================================================================
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Support and Transport in Plants\n\n### Transpiration\n\n**Transpiration** is the loss of water vapour from the aerial parts of a plant, mainly through the **stomata** of the leaves.\n\n**Transpiration stream:** The continuous movement of water from the soil, through the plant, and out through the leaves:\n\n1. Water is absorbed by **root hair cells** (by osmosis)\n2. Water moves from cell to cell across the root cortex by osmosis\n3. Water enters the **xylem** in the vascular cylinder\n4. Water is pulled upward through the xylem by **transpiration pull** (the main driving force)\n5. Water evaporates from mesophyll cells into air spaces in the spongy mesophyll\n6. Water vapour diffuses out through **stomata**\n\n**Transpiration pull (cohesion-tension theory):**\n- As water evaporates from leaf cells, it creates a negative pressure (tension) in the xylem\n- This tension pulls water upward through the xylem in a continuous column\n- Water molecules stick together due to **cohesion** (hydrogen bonds between water molecules)\n- Water molecules also adhere to the xylem walls (**adhesion**)'),
  q(2, 'What is the main driving force that pulls water up through the xylem?',
    ['Root pressure', 'Capillarity', 'Transpiration pull (cohesion-tension)', 'Active transport'], 2,
    'Transpiration pull is the main force driving water upward through the xylem. As water evaporates from leaf mesophyll cells, it creates a tension that pulls water up through the continuous column of water in the xylem. Cohesion between water molecules maintains this unbroken column.'),
  t(3, '### Factors Affecting Transpiration Rate\n\nSeveral environmental factors influence how fast transpiration occurs:\n\n| Factor | Effect on transpiration rate |\n|--------|-----------------------------|\n| **Temperature** | Higher temperature \u2192 faster evaporation \u2192 faster transpiration |\n| **Light intensity** | More light \u2192 stomata open wider \u2192 faster transpiration |\n| **Wind** | More wind \u2192 removes humid air from leaf surface \u2192 steeper diffusion gradient \u2192 faster transpiration |\n| **Humidity** | Higher humidity \u2192 smaller diffusion gradient \u2192 slower transpiration |\n\n**Plant adaptations to reduce water loss:**\n- Thick waxy cuticle\n- Fewer stomata; stomata sunken in pits\n- Small or needle-like leaves (reduced surface area)\n- Rolled leaves (traps humid air near stomata)\n- Loss of leaves in dry season (deciduous trees)\n\n**Measuring transpiration:** A **potometer** is used to measure the rate of water uptake by a plant (an indirect measure of transpiration rate).'),
  fb(4, 'High temperature increases transpiration rate because it causes faster ___. A potometer is used to measure the rate of ___ by a plant.',
    ['evaporation', 'water uptake'],
    'Higher temperatures increase the kinetic energy of water molecules, causing faster evaporation from mesophyll cells and thus a faster rate of transpiration. A potometer measures how quickly a plant stem takes up water, which is an indirect measure of transpiration.'),
  t(5, '### Translocation\n\n**Translocation** is the transport of dissolved organic substances (mainly **sucrose**) through the **phloem** from sources to sinks.\n\n**Source:** Any part of the plant that produces or releases sugars\n- Leaves (photosynthesis)\n- Storage organs releasing stored food (e.g., tubers in spring)\n\n**Sink:** Any part of the plant that uses or stores sugars\n- Growing root and shoot tips\n- Developing fruits and seeds\n- Storage organs storing food (e.g., tubers in autumn)\n\n**Phloem structure:**\n- **Sieve tube elements**: Long, cylindrical cells joined end-to-end with **sieve plates** (perforated end walls that allow sap to flow)\n- **Companion cells**: Smaller cells adjacent to sieve tubes; provide metabolic support and energy (ATP) for loading sucrose into sieve tubes\n\n**Mass flow hypothesis:**\n- Sucrose is actively loaded into phloem at the source (using ATP from companion cells)\n- This lowers the water potential, drawing water in by osmosis\n- High pressure at the source pushes sap toward the sink\n- At the sink, sucrose is unloaded and used or stored'),
  q(6, 'What is the role of companion cells in phloem tissue?',
    ['They transport water upward', 'They provide energy (ATP) for the active loading of sucrose into sieve tube elements', 'They produce sucrose by photosynthesis', 'They store mineral ions'], 1,
    'Companion cells have many mitochondria and a large nucleus. They produce ATP through cellular respiration, which is used to actively load sucrose from surrounding cells into the sieve tube elements. Without companion cells, translocation could not occur.'),
  t(7, '### Support in Plants\n\nPlants need support to hold themselves upright, expose leaves to sunlight, and resist wind.\n\n**Mechanisms of support in plants:**\n\n| Mechanism | How it works | Examples |\n|-----------|-------------|----------|\n| **Turgor pressure** | Water fills vacuoles, pressing the cell membrane against the cell wall; makes cells and the whole plant firm | Herbaceous (non-woody) plants, leaves |\n| **Lignified tissue** | Xylem and sclerenchyma have walls strengthened with lignin, providing rigid support | Woody plants (trees, shrubs) |\n| **Collenchyma** | Unevenly thickened cell walls provide flexible support | Young stems, leaf stalks |\n| **Thigmotropism** | Some plants grow toward support structures (tendrils wrap around objects) | Climbing plants (peas, grapes) |\n\n**What happens when a plant wilts?**\n- When water loss exceeds water uptake, cells lose turgor pressure\n- The cell membrane pulls away from the cell wall (plasmolysis)\n- The plant becomes floppy and droops \u2014 this is **wilting**\n- Wilting is actually a survival mechanism: drooping leaves reduce the surface area exposed to sunlight, which reduces further water loss'),
  q(8, 'Why do herbaceous (non-woody) plants wilt when they do not receive enough water?',
    ['Their xylem vessels break', 'They lose turgor pressure in their cells, so the plant cannot support itself', 'Their cell walls dissolve', 'Their stomata open too wide'], 1,
    'Herbaceous plants rely on turgor pressure (water in vacuoles pressing against cell walls) for support. When water is insufficient, cells lose turgor, become flaccid, and the plant wilts. Woody plants are less affected because they have lignified tissue for rigid support.'),
  fb(9, 'Plants are supported by ___ pressure in their cells and by lignified tissues such as xylem and sclerenchyma. The transport of sucrose through phloem is called ___.',
    ['turgor', 'translocation'],
    'Turgor pressure results from water filling the vacuole and pushing the cell membrane against the cell wall, making cells firm. Translocation is the movement of dissolved sugars through phloem tissue from sources (e.g., leaves) to sinks (e.g., roots, fruits).'),
  q(10, 'In the transpiration stream, which property of water allows it to form a continuous column in the xylem?',
    ['Water is a good solvent', 'Water has a high specific heat capacity', 'Cohesion \u2014 water molecules stick together through hydrogen bonds', 'Water is transparent'], 2,
    'Cohesion is the attraction between water molecules due to hydrogen bonding. This allows water to form a continuous, unbroken column in the narrow xylem vessels. When water evaporates from leaves (transpiration), the cohesive forces pull the entire column upward.'),
];

// =============================================================================
// CHAPTER 7: Support Systems in Animals (Term 2, Weeks 7-8)
// =============================================================================
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Support Systems in Animals\n\n### The Human Skeleton\n\nThe human skeleton consists of **206 bones** in the adult and is divided into two parts:\n\n**1. Axial skeleton** (80 bones) \u2014 the central axis:\n- **Skull** (cranium + facial bones): Protects the brain and sense organs\n- **Vertebral column** (spine): 33 vertebrae; protects the spinal cord; supports the body\n- **Ribcage**: 12 pairs of ribs + sternum; protects the heart and lungs\n\n**2. Appendicular skeleton** (126 bones) \u2014 the limbs and their attachments:\n- **Pectoral girdle**: Clavicle (collarbone) and scapula (shoulder blade)\n- **Upper limbs**: Humerus, radius, ulna, carpals, metacarpals, phalanges\n- **Pelvic girdle**: Hip bones (ilium, ischium, pubis)\n- **Lower limbs**: Femur, tibia, fibula, patella, tarsals, metatarsals, phalanges\n\n**Functions of the skeleton:**\n1. **Support**: Framework that supports the body and maintains shape\n2. **Protection**: Skull protects the brain; ribcage protects heart and lungs; vertebrae protect spinal cord\n3. **Movement**: Bones act as levers; muscles attached to bones produce movement\n4. **Storage of minerals**: Bones store calcium and phosphorus\n5. **Blood cell production**: Red bone marrow produces red and white blood cells (haematopoiesis)'),
  q(2, 'Which part of the skeleton protects the spinal cord?',
    ['Skull', 'Ribcage', 'Vertebral column', 'Pelvic girdle'], 2,
    'The vertebral column (spine) consists of 33 vertebrae stacked on top of each other. Each vertebra has a hole (vertebral foramen) through which the spinal cord passes. The vertebral column protects the spinal cord from damage while allowing flexibility for movement.'),
  t(3, '### Bones and Cartilage\n\n**Structure of a long bone** (e.g., femur):\n- **Epiphysis**: Rounded ends; covered with articular cartilage to reduce friction at joints\n- **Diaphysis**: Long shaft; hollow centre (medullary cavity) filled with yellow bone marrow (fat storage)\n- **Periosteum**: Tough outer membrane covering the bone; contains blood vessels and nerves\n- **Compact bone**: Dense, hard outer layer of the diaphysis; provides strength\n- **Spongy bone**: Found in the epiphysis; lighter, porous structure with red bone marrow (makes blood cells)\n\n**Cartilage vs Bone:**\n\n| Feature | Cartilage | Bone |\n|---------|-----------|------|\n| Matrix | Firm but flexible (chondrin) | Hard, rigid (calcium phosphate) |\n| Blood supply | Avascular (no blood vessels) | Vascular (good blood supply) |\n| Cells | Chondrocytes (in lacunae) | Osteocytes (in lacunae) |\n| Growth/repair | Slow (no blood supply) | Faster (blood supply) |\n| Location | Ears, nose, trachea, joints | Throughout skeleton |'),
  fb(4, 'Compact bone forms the dense outer layer of the diaphysis, while ___ bone is found in the epiphysis and contains red bone marrow. The tough membrane covering a bone is the ___.',
    ['spongy', 'periosteum'],
    'Spongy bone has a porous structure filled with red bone marrow, where blood cells are produced. The periosteum is a tough, vascular membrane that covers the outside of bones, providing nutrients and containing cells for bone growth and repair.'),
  t(5, '### Joints\n\nA **joint** is where two or more bones meet. Joints are classified by the degree of movement they allow.\n\n**Types of joints:**\n\n| Type | Movement | Example |\n|------|----------|--------|\n| **Immovable (fibrous)** | No movement | Skull sutures |\n| **Slightly movable (cartilaginous)** | Limited movement | Vertebrae (intervertebral discs), pubic symphysis |\n| **Freely movable (synovial)** | Wide range of movement | Knee, hip, shoulder, elbow |\n\n**Types of synovial joints:**\n| Type | Movement | Example |\n|------|----------|--------|\n| **Hinge joint** | Flexion and extension (one plane) | Elbow, knee |\n| **Ball-and-socket joint** | Movement in all directions (rotation) | Hip, shoulder |\n| **Pivot joint** | Rotation around an axis | Atlas/axis vertebrae (turning head) |\n| **Gliding joint** | Sliding movement | Wrist, ankle |'),
  t(6, '### Structure of a Synovial Joint\n\nSynovial joints allow the greatest range of movement. They share common features:\n\n| Structure | Function |\n|-----------|----------|\n| **Articular (hyaline) cartilage** | Smooth, slippery surface covering bone ends; reduces friction |\n| **Synovial membrane** | Lines the joint capsule; secretes synovial fluid |\n| **Synovial fluid** | Lubricates the joint; reduces friction; nourishes cartilage |\n| **Joint capsule** | Tough, fibrous covering that encloses the joint |\n| **Ligaments** | Strong bands of connective tissue that hold bones together and stabilise the joint |\n\n**Muscles and movement at joints:**\n- Muscles work in **antagonistic pairs** (one contracts while the other relaxes)\n- **Flexor** muscles bend (decrease the angle at) a joint\n- **Extensor** muscles straighten (increase the angle at) a joint\n- Example at the elbow: **Biceps** (flexor) bends the arm; **Triceps** (extensor) straightens the arm\n- Muscles are attached to bones by **tendons**'),
  q(7, 'At the elbow, the biceps and triceps work as an antagonistic pair. What does this mean?',
    ['They both contract at the same time', 'When one contracts, the other relaxes to produce movement in opposite directions', 'They are attached to the same bone', 'They both relax to allow movement'], 1,
    'Antagonistic muscles work in pairs: when the biceps contracts (flexion), the triceps relaxes, bending the arm. When the triceps contracts (extension), the biceps relaxes, straightening the arm. Muscles can only pull (contract), so two muscles are needed for opposite movements.'),
  fb(8, 'Muscles are attached to bones by ___. At the elbow, the ___ muscle is the flexor (bends the arm) and the triceps is the extensor (straightens the arm).',
    ['tendons', 'biceps'],
    'Tendons are tough, inelastic cords of connective tissue that anchor muscles firmly to bones. The biceps brachii on the front of the upper arm contracts to flex (bend) the elbow, while the triceps brachii on the back of the upper arm contracts to extend (straighten) the elbow.'),
  q(9, 'Which type of joint allows the greatest range of movement?',
    ['Immovable (fibrous) joint', 'Slightly movable (cartilaginous) joint', 'Ball-and-socket joint', 'Hinge joint'], 2,
    'The ball-and-socket joint allows the greatest range of movement, including flexion, extension, rotation, abduction, adduction, and circumduction. Examples include the hip and shoulder joints, where the rounded head of one bone fits into a cup-shaped socket of another.'),
  q(10, 'What is the function of synovial fluid in a joint?',
    ['It produces blood cells', 'It stores calcium for the bones', 'It lubricates the joint, reducing friction between the cartilage surfaces', 'It provides rigid support to the bones'], 2,
    'Synovial fluid is a viscous liquid secreted by the synovial membrane. It lubricates the joint surfaces, reducing friction during movement. It also acts as a shock absorber and supplies nutrients to the articular cartilage, which has no blood supply of its own.'),
];

// =============================================================================
// CHAPTER 8: Transport Systems in Animals (Term 2, Weeks 8-9)
// =============================================================================
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Transport System in Animals: The Circulatory System\n\n### Overview\n\nThe human circulatory system is a **closed, double circulatory system**.\n\n- **Closed**: Blood flows within blood vessels at all times (unlike an open system where blood flows into body cavities)\n- **Double**: Blood passes through the heart **twice** for every complete circuit around the body\n\n**Two circuits:**\n1. **Pulmonary circulation**: Heart \u2192 lungs \u2192 heart (right side of heart)\n   - Deoxygenated blood is pumped from the **right ventricle** to the lungs via the **pulmonary artery**\n   - In the lungs, blood picks up O\u2082 and releases CO\u2082\n   - Oxygenated blood returns to the **left atrium** via the **pulmonary veins**\n\n2. **Systemic circulation**: Heart \u2192 body \u2192 heart (left side of heart)\n   - Oxygenated blood is pumped from the **left ventricle** to the body via the **aorta**\n   - In the body, blood delivers O\u2082 and nutrients, and collects CO\u2082 and waste\n   - Deoxygenated blood returns to the **right atrium** via the **vena cava** (superior and inferior)'),
  q(2, 'Why is the human circulatory system described as a "double" circulatory system?',
    ['Because we have two lungs', 'Because blood passes through the heart twice for every complete circuit of the body', 'Because there are two types of blood vessels', 'Because the heart has two sides'], 1,
    'In a double circulatory system, blood passes through the heart twice during one complete circuit: once through the right side (to the lungs for gas exchange) and once through the left side (to the body to deliver oxygen). This keeps oxygenated and deoxygenated blood separate, making oxygen delivery more efficient.'),
  t(3, '### Structure of the Heart\n\nThe heart is a muscular organ about the size of a fist, located in the thoracic cavity between the lungs.\n\n**Four chambers:**\n| Chamber | Location | Function |\n|---------|----------|----------|\n| **Right atrium** | Upper right | Receives deoxygenated blood from the body (via vena cava) |\n| **Right ventricle** | Lower right | Pumps deoxygenated blood to the lungs (via pulmonary artery) |\n| **Left atrium** | Upper left | Receives oxygenated blood from the lungs (via pulmonary veins) |\n| **Left ventricle** | Lower left | Pumps oxygenated blood to the body (via aorta) |\n\n**Key features:**\n- **Septum**: Thick muscular wall separating the left and right sides (prevents mixing of oxygenated and deoxygenated blood)\n- **Left ventricle wall is thicker** than the right because it pumps blood at higher pressure to the entire body (systemic circulation), while the right ventricle only pumps to the nearby lungs\n- **Valves** prevent backflow of blood:\n  - Tricuspid valve: Between right atrium and right ventricle\n  - Bicuspid (mitral) valve: Between left atrium and left ventricle\n  - Semilunar valves: At the base of the pulmonary artery and aorta'),
  fb(4, 'The left ventricle has a ___ wall than the right ventricle because it pumps blood to the entire body. The ___ separates the left and right sides of the heart, preventing the mixing of oxygenated and deoxygenated blood.',
    ['thicker', 'septum'],
    'The left ventricle wall is much thicker and more muscular because it must generate enough pressure to push blood through the systemic circulation (to all parts of the body). The septum is a solid muscular wall that keeps oxygenated blood (left side) completely separate from deoxygenated blood (right side).'),
  t(5, '### The Cardiac Cycle\n\nThe cardiac cycle is one complete heartbeat, consisting of:\n\n1. **Atrial systole** (contraction of atria):\n   - Both atria contract simultaneously\n   - Blood is pushed from atria into ventricles through the open atrioventricular (AV) valves\n\n2. **Ventricular systole** (contraction of ventricles):\n   - Both ventricles contract simultaneously\n   - AV valves close (producing the first heart sound \u2014 "lub")\n   - Blood is pushed into the pulmonary artery and aorta through semilunar valves\n\n3. **Diastole** (relaxation):\n   - All chambers relax\n   - Semilunar valves close (producing the second heart sound \u2014 "dub")\n   - Blood flows into the atria from the veins\n\n**Heart rate** is controlled by the **SA node** (sinoatrial node), the natural pacemaker, located in the wall of the right atrium. It generates electrical impulses that cause the heart to contract rhythmically.'),
  q(6, 'What causes the "lub-dub" sounds of the heartbeat?',
    ['Blood flowing through the chambers', 'The closing of heart valves \u2014 "lub" from AV valves closing, "dub" from semilunar valves closing', 'Contraction of the heart muscle', 'Opening of the valves'], 1,
    'The first sound ("lub") is caused by the closure of the atrioventricular (tricuspid and bicuspid) valves at the start of ventricular systole. The second sound ("dub") is caused by the closure of the semilunar valves at the start of diastole. These closures prevent backflow of blood.'),
  t(7, '### Blood Vessels\n\n| Feature | Arteries | Veins | Capillaries |\n|---------|----------|-------|-------------|\n| **Direction of flow** | Away from the heart | Toward the heart | Connect arteries to veins |\n| **Blood pressure** | High | Low | Decreasing |\n| **Wall thickness** | Thick, muscular, elastic | Thinner, less muscular | One cell thick |\n| **Lumen** | Narrow | Wide | Very narrow (single cell width) |\n| **Valves** | No (except semilunar in aorta/pulmonary artery) | Yes (prevent backflow) | No |\n| **Blood type** | Usually oxygenated (except pulmonary artery) | Usually deoxygenated (except pulmonary veins) | Mixed |\n\n**Capillaries are adapted for exchange:**\n- Walls only one cell thick (short diffusion distance)\n- Very narrow lumen (slows blood flow, allowing time for exchange)\n- Huge total surface area (extensive capillary networks)\n- Thin walls allow diffusion of O\u2082, CO\u2082, glucose, and waste products between blood and tissues'),
  q(8, 'Which blood vessel carries oxygenated blood away from the heart to the body?',
    ['Pulmonary artery', 'Vena cava', 'Aorta', 'Pulmonary vein'], 2,
    'The aorta is the largest artery in the body. It carries oxygenated blood from the left ventricle to all parts of the body (systemic circulation). Note that arteries carry blood away from the heart (not always oxygenated \u2014 the pulmonary artery carries deoxygenated blood to the lungs).'),
  fb(9, 'Arteries carry blood ___ from the heart, while veins carry blood ___ the heart. Veins have valves to prevent backflow.',
    ['away', 'toward'],
    'Arteries carry blood away from the heart (usually at high pressure). Veins carry blood back toward the heart (at low pressure). Veins contain valves that prevent the backward flow of blood, especially important in the legs where blood must travel upward against gravity.'),
  t(10, '### Blood Composition\n\nBlood is a connective tissue with a liquid matrix (plasma).\n\n**Components of blood:**\n\n| Component | Description | Function |\n|-----------|------------|----------|\n| **Plasma** | Straw-coloured liquid (55% of blood) | Transports dissolved substances: glucose, amino acids, hormones, CO\u2082 (as bicarbonate), urea, and heat |\n| **Red blood cells (erythrocytes)** | Biconcave disc shape; no nucleus; contain haemoglobin | Transport O\u2082 from lungs to tissues (haemoglobin + O\u2082 \u2192 oxyhaemoglobin) |\n| **White blood cells (leukocytes)** | Larger than RBCs; have a nucleus | Defence against infection: phagocytes engulf pathogens; lymphocytes produce antibodies |\n| **Platelets (thrombocytes)** | Cell fragments; no nucleus | Blood clotting at wound sites; prevent excessive blood loss |\n\n**Red blood cells are adapted for oxygen transport:**\n- Biconcave shape increases surface area for gas exchange\n- No nucleus \u2014 more space for haemoglobin\n- Contain haemoglobin \u2014 the protein that binds O\u2082\n- Small and flexible \u2014 can squeeze through narrow capillaries'),
  q(11, 'Why do red blood cells have a biconcave disc shape and no nucleus?',
    ['To make them heavier so they sink in plasma', 'The biconcave shape increases surface area for O\u2082 exchange, and the lack of nucleus provides more space for haemoglobin', 'So they can divide more easily', 'To allow them to carry CO\u2082 more efficiently'], 1,
    'The biconcave disc shape of red blood cells maximises their surface area to volume ratio, allowing faster diffusion of oxygen. The absence of a nucleus means more space is available for haemoglobin molecules, increasing the oxygen-carrying capacity of each cell.'),
];

// =============================================================================
// CHAPTER 9: History of Life on Earth (Term 3, Weeks 1-3)
// =============================================================================
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## History of Life on Earth\n\n### Life\'s History: A Timeline\n\nThe Earth is approximately **4.6 billion years** old. Life has changed dramatically over this time.\n\n**Key events in Earth\'s history:**\n\n| Era | Period | Time (MYA) | Key events |\n|-----|--------|-----------|------------|\n| **Precambrian** | \u2014 | 4 600\u2013541 | Formation of Earth; first simple life (bacteria, cyanobacteria); oxygen accumulates in atmosphere; first eukaryotes |\n| **Palaeozoic** | Cambrian | 541\u2013485 | **Cambrian explosion** \u2014 rapid appearance of most major animal groups |\n| | Ordovician\u2013Silurian | 485\u2013419 | First plants on land; first fish |\n| | Devonian | 419\u2013359 | Age of fish; first amphibians; first forests |\n| | Carboniferous | 359\u2013299 | Large swamp forests (became coal); first reptiles |\n| | Permian | 299\u2013252 | Largest mass extinction (about 90% of species died) |\n| **Mesozoic** | Triassic\u2013Jurassic\u2013Cretaceous | 252\u201366 | Age of dinosaurs; first mammals; first birds; first flowering plants; ended with mass extinction (asteroid impact, ~66 MYA) |\n| **Cenozoic** | \u2014 | 66\u2013present | Age of mammals; evolution of primates and humans |\n\nMYA = million years ago'),
  q(2, 'What was the Cambrian explosion?',
    ['A volcanic eruption that destroyed most life', 'The rapid diversification and appearance of most major animal groups in a relatively short period', 'The extinction of the dinosaurs', 'The formation of the first bacteria'], 1,
    'The Cambrian explosion (~541 MYA) was a period of rapid evolutionary diversification during which most major animal phyla first appeared in the fossil record. In a relatively short geological time (perhaps 20\u201325 million years), the diversity of complex animal life increased dramatically.'),
  t(3, '### Changes in the Atmosphere\n\nEarth\'s atmosphere has changed significantly over time:\n\n**Early atmosphere** (before life):\n- Little or no free oxygen (O\u2082)\n- Rich in CO\u2082, methane (CH\u2084), ammonia (NH\u2083), and water vapour\n- No ozone layer\n\n**How oxygen increased:**\n1. **Cyanobacteria** (blue-green bacteria) evolved photosynthesis approximately 2.7 billion years ago\n2. Photosynthesis released O\u2082 as a by-product: 6CO\u2082 + 6H\u2082O \u2192 C\u2086H\u2081\u2082O\u2086 + 6O\u2082\n3. Oxygen accumulated slowly in the atmosphere over billions of years\n4. The rise in O\u2082 enabled **aerobic respiration** (more efficient energy release)\n5. O\u2082 formed the **ozone layer** (O\u2083), which blocked harmful UV radiation and allowed life to colonise land\n\n**Geological events and their effects on life:**\n- Movement of continents (continental drift) changed climates and created barriers that separated populations\n- Ice ages caused sea levels to drop and habitats to change\n- Volcanic eruptions and asteroid impacts caused mass extinctions'),
  fb(4, 'The oxygen in Earth\'s atmosphere was produced mainly by photosynthetic organisms called ___. The ozone layer, made of ___, protects life from harmful UV radiation.',
    ['cyanobacteria', 'O\u2083'],
    'Cyanobacteria (also called blue-green bacteria) were among the first organisms to carry out photosynthesis, releasing oxygen into the early atmosphere over billions of years. This oxygen (O\u2082) formed the ozone layer (O\u2083) in the upper atmosphere, blocking UV radiation and making land habitable.'),
  t(5, '### Mass Extinctions\n\nA **mass extinction** is a period during which a large number of species die out in a relatively short geological time.\n\n**Five major mass extinctions:**\n\n| Extinction | Time (MYA) | Species lost | Probable cause |\n|-----------|-----------|-------------|----------------|\n| Ordovician\u2013Silurian | ~445 | ~85% | Ice age; sea level drop |\n| Late Devonian | ~375 | ~75% | Oxygen depletion in oceans |\n| Permian\u2013Triassic | ~252 | ~90\u201396% | Volcanic activity; climate change |\n| Triassic\u2013Jurassic | ~201 | ~80% | Volcanic activity |\n| Cretaceous\u2013Palaeogene | ~66 | ~75% | Asteroid impact + volcanic activity |\n\n**The Cretaceous extinction (66 MYA):**\n- An asteroid struck the Yucatan Peninsula (Mexico), creating the Chicxulub crater\n- Dust and debris blocked sunlight, causing global cooling\n- Plants died; herbivores starved; carnivores starved\n- Dinosaurs (except birds) went extinct\n- Mammals survived and diversified into the ecological niches left empty\n\n**The sixth extinction:**\n- Many scientists believe we are currently in a sixth mass extinction caused by **human activities** (habitat destruction, pollution, climate change, overhunting, invasive species)'),
  q(6, 'What is believed to have caused the extinction of the dinosaurs approximately 66 million years ago?',
    ['A global flood', 'An asteroid impact combined with volcanic activity', 'A disease that killed only dinosaurs', 'The evolution of mammals'], 1,
    'The Cretaceous\u2013Palaeogene extinction (~66 MYA) was likely caused by a massive asteroid impact at Chicxulub, Mexico, combined with widespread volcanic activity (Deccan Traps in India). The resulting dust, fires, and climate change led to the extinction of about 75% of species, including non-avian dinosaurs.'),
  t(7, '### Fossils and Fossil Formation\n\n**Fossils** are the preserved remains, traces, or impressions of organisms that lived in the past.\n\n**How fossils form:**\n1. An organism dies and is quickly buried by sediment (mud, sand, volcanic ash)\n2. Soft tissues decay, but hard parts (bones, shells, teeth) remain\n3. Over millions of years, minerals replace the original material (**mineralisation/petrification**)\n4. The sediment hardens into rock (sedimentary rock)\n5. Earth movements or erosion expose the fossil\n\n**Other types of fossil preservation:**\n- **Moulds and casts**: Organism decays leaving a hollow mould; minerals fill the mould to form a cast\n- **Amber**: Insects preserved in tree resin (sap)\n- **Tar pits**: Animals trapped in natural tar\n- **Freezing**: Organisms preserved in ice (e.g., woolly mammoths in Siberia)\n- **Trace fossils**: Footprints, burrows, or coprolites (fossilised dung)\n\n**Fossil dating methods:**\n- **Relative dating**: Fossils in deeper rock layers are older (law of superposition)\n- **Radiometric dating**: Uses the decay of radioactive isotopes (e.g., carbon-14, potassium-40) to determine the actual age of fossils'),
  fb(8, 'Fossils are mainly found in ___ rock. Relative dating uses the principle that fossils in deeper layers are ___ than those in shallower layers.',
    ['sedimentary', 'older'],
    'Sedimentary rocks (formed from layers of deposited sediment) are the main type of rock in which fossils are found. The law of superposition states that in undisturbed rock layers, the deepest layers were deposited first and are therefore the oldest.'),
  q(9, 'Which fossil dating method gives the actual (absolute) age of a fossil?',
    ['Relative dating', 'Radiometric (radioactive) dating', 'Carbon dating only works for fossils less than 1 000 years old', 'Superposition'], 1,
    'Radiometric dating uses the known decay rates of radioactive isotopes to calculate the actual age of rocks and fossils. For example, carbon-14 dating is used for fossils up to ~50 000 years old, while potassium-40/argon-40 dating is used for older rocks.'),
  q(10, 'South Africa has important fossil sites. The Cradle of Humankind near Johannesburg is famous for:',
    ['Dinosaur fossils', 'Fossils of early human ancestors (hominins)', 'Fossilised plants from the Carboniferous period', 'Marine fossils from the Cambrian period'], 1,
    'The Cradle of Humankind (a UNESCO World Heritage Site near Johannesburg, South Africa) contains numerous caves, including Sterkfontein, where important hominin fossils have been discovered. These include "Mrs Ples" (Australopithecus africanus) and "Little Foot," providing crucial evidence of human evolution.'),
];

// =============================================================================
// CHAPTER 10: Biosphere to Ecosystems (Term 3, Weeks 4-9)
// =============================================================================
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Biosphere to Ecosystems\n\n### The Biosphere and Its Components\n\nThe **biosphere** is the relatively thin zone on Earth where life exists. It includes parts of:\n- **Lithosphere**: The solid outer layer (land, soil, rocks)\n- **Hydrosphere**: All water on Earth (oceans, rivers, lakes, groundwater)\n- **Atmosphere**: The layer of gases surrounding Earth\n\n**Levels of organisation in ecology:**\n\n| Level | Definition |\n|-------|------------|\n| Organism | A single living individual |\n| Population | A group of organisms of the same species in the same area at the same time |\n| Community | All the populations of different species living and interacting in the same area |\n| Ecosystem | A community of organisms and their physical (abiotic) environment, interacting as a system |\n| Biome | A large region with a characteristic climate, soil, and community of organisms |\n| Biosphere | The total of all ecosystems on Earth |'),
  t(2, '### Biomes of Southern Africa\n\nSouth Africa has an extraordinary diversity of biomes. A **biome** is a large ecological region defined by its climate, soil type, and characteristic vegetation.\n\n**Terrestrial biomes of South Africa:**\n\n| Biome | Climate | Vegetation | Location |\n|-------|---------|-----------|----------|\n| **Grassland** | Summer rainfall; cold, dry winters; frost | Grasses dominate; few trees | Highveld (Gauteng, Free State, Mpumalanga) |\n| **Savanna** | Warm; summer rainfall; mild dry winters | Mixed grasses and scattered trees (e.g., Acacia/Vachellia) | Limpopo, North West, KZN lowveld; Kruger National Park |\n| **Fynbos (Cape Floral Kingdom)** | Winter rainfall; hot dry summers (Mediterranean climate) | Shrubs, proteas, ericas, restios | Western Cape; Table Mountain |\n| **Forest** | High rainfall year-round; mild temperatures | Tall, dense trees; evergreen | Knysna, Tsitsikamma, Mpumalanga escarpment |\n| **Nama Karoo** | Low rainfall; very hot summers; cold winters | Sparse, low shrubs; succulents | Northern Cape, parts of Western/Eastern Cape |\n| **Succulent Karoo** | Low winter rainfall; mild | Diverse succulents | Namaqualand (Western/Northern Cape) |\n| **Desert** | Very low rainfall (<200 mm/year); extreme temperatures | Very sparse; adapted succulents and grasses | Kalahari, Namib (Northern Cape) |\n| **Thicket (Albany)** | Year-round rainfall; mild | Dense, tangled shrubs; spekboomveld | Eastern Cape |\n\nThe **Fynbos biome** is one of only six floral kingdoms in the world, despite being the smallest. It contains over 9 000 plant species, of which ~70% are found nowhere else (endemic).'),
  q(3, 'Which South African biome is characterised by winter rainfall, proteas, and ericas, and forms part of one of the world\'s six floral kingdoms?',
    ['Grassland', 'Savanna', 'Fynbos (Cape Floral Kingdom)', 'Succulent Karoo'], 2,
    'The Fynbos biome in the Western Cape receives winter rainfall and has a Mediterranean-type climate. It is part of the Cape Floral Kingdom, the smallest but richest of the world\'s six floral kingdoms. Characteristic plants include proteas, ericas (heaths), and restios (reeds).'),
  fb(4, 'The Kruger National Park is located in the ___ biome. The fynbos biome in the Western Cape has a ___-rainfall climate.',
    ['savanna', 'winter'],
    'Kruger National Park is in the savanna biome, characterised by warm temperatures, summer rainfall, and a mix of grasses and scattered trees. The fynbos biome has a Mediterranean climate with winter rainfall and hot, dry summers.'),
  t(5, '### Aquatic Biomes\n\nAquatic ecosystems are divided into:\n\n**1. Marine (saltwater) ecosystems:**\n- Oceans, coral reefs, estuaries\n- Cover ~71% of Earth\'s surface\n- South Africa\'s coastline: cold Benguela Current (west coast) and warm Agulhas Current (east coast)\n- Estuaries (where rivers meet the sea) are highly productive nursery areas for many fish species\n\n**2. Freshwater ecosystems:**\n- Rivers, streams, lakes, dams, wetlands\n- Less than 3% of Earth\'s water is freshwater\n- South African rivers include the Orange, Vaal, Limpopo, and Tugela\n- Wetlands act as natural filters, flood control, and habitats for many species\n\n**Key South African aquatic features:**\n- iSimangaliso Wetland Park (KwaZulu-Natal) \u2014 UNESCO World Heritage Site; diverse wetland ecosystems including Lake St Lucia\n- The Benguela Current upwelling on the west coast brings nutrient-rich deep water to the surface, supporting rich marine life'),
  t(6, '### Abiotic Factors in Ecosystems\n\n**Abiotic factors** are the non-living physical and chemical factors that affect organisms in an ecosystem.\n\n| Abiotic factor | Effect on organisms |\n|---------------|--------------------|\n| **Temperature** | Affects enzyme activity, metabolic rate, and distribution of species |\n| **Light** | Energy source for photosynthesis; affects plant growth and animal behaviour |\n| **Water** | Essential for all life; availability determines biome type |\n| **Soil** | pH, mineral content, texture, and water-holding capacity affect plant growth |\n| **Wind** | Affects transpiration rate, seed dispersal, and temperature |\n| **Altitude (aspect)** | Higher altitude = lower temperature; affects vegetation zones |\n| **Slope** | Affects drainage, soil depth, and sun exposure |\n\n**How abiotic factors determine biome distribution:**\n- Rainfall and temperature are the two most important factors determining which biome develops in a region\n- The grassland biome occurs where summers are warm and wet but winters are cold and dry with frost\n- The fynbos biome occurs where winters are wet and summers are dry (Mediterranean climate)'),
  q(7, 'Which two abiotic factors are the most important in determining which biome occurs in a particular region?',
    ['Wind and soil type', 'Rainfall (water availability) and temperature', 'Light intensity and altitude', 'Soil pH and humidity'], 1,
    'Rainfall and temperature are the primary abiotic factors that determine biome distribution. For example, high rainfall and high temperature favour tropical forests, while low rainfall and extreme temperatures produce deserts. South Africa\'s biome diversity is largely due to its varied rainfall patterns and temperatures.'),
  fb(8, 'Abiotic factors are the ___-living components of an ecosystem. The two most important abiotic factors determining biome type are rainfall and ___.',
    ['non', 'temperature'],
    'Abiotic (a = without, bio = life) factors are the physical and chemical components of an ecosystem that are not alive, such as water, temperature, light, and soil. Rainfall and temperature together largely determine which type of vegetation (and therefore which biome) develops in a region.'),
];

blockNum = 0;
const ch10_lesson2 = [
  t(1, '## Energy Flow and Nutrient Cycles in Ecosystems\n\n### Biotic Factors and Trophic Levels\n\n**Biotic factors** are the living components of an ecosystem, including all organisms and their interactions.\n\n**Trophic levels** describe the position of an organism in a food chain:\n\n| Trophic level | Name | Description | Example |\n|--------------|------|------------|--------|\n| 1st | **Producer** | Autotroph; makes food by photosynthesis | Grass, trees, algae |\n| 2nd | **Primary consumer** | Herbivore; eats producers | Impala, grasshopper, rabbit |\n| 3rd | **Secondary consumer** | Carnivore; eats primary consumers | Jackal, frog, spider |\n| 4th | **Tertiary consumer** | Top carnivore; eats secondary consumers | Lion, eagle, shark |\n| \u2014 | **Decomposer** | Breaks down dead organic matter | Bacteria, fungi |\n\n**Food chain:** A linear sequence showing energy flow from one organism to the next\n- Example: Grass \u2192 Impala \u2192 Cheetah \u2192 Vulture\n\n**Food web:** A network of interconnected food chains showing the complex feeding relationships in an ecosystem. Food webs are more realistic than food chains because most organisms eat more than one type of food.'),
  q(2, 'In the food chain: Grass \u2192 Springbok \u2192 Cheetah \u2192 Jackal, which organism is the secondary consumer?',
    ['Grass', 'Springbok', 'Cheetah', 'Jackal'], 2,
    'The cheetah is the secondary consumer (3rd trophic level). It feeds on the springbok (primary consumer/herbivore), which feeds on grass (producer). The jackal feeding on the cheetah\'s remains would be the tertiary consumer (4th trophic level).'),
  t(3, '### Energy Flow Through an Ecosystem\n\nEnergy flows through an ecosystem in **one direction** \u2014 it is NOT recycled.\n\n**Energy flow:**\n1. The **Sun** is the ultimate source of energy for almost all ecosystems\n2. **Producers** (plants) capture light energy by photosynthesis and convert it to chemical energy (glucose)\n3. Energy is transferred from producers to consumers through feeding\n4. At each trophic level, **approximately 90% of energy is lost** as:\n   - Heat (from cellular respiration)\n   - Undigested food (egestion)\n   - Movement and metabolic processes\n5. Only about **10%** of energy is transferred to the next trophic level\n\n**This is why:**\n- Food chains rarely have more than 4\u20135 trophic levels (not enough energy left to support more)\n- There are more producers than consumers, and more primary consumers than secondary consumers\n- **Pyramids of energy** are always upright (each level is smaller than the one below)\n\n**Pyramids of numbers** show the number of organisms at each trophic level. They are usually upright but can be inverted (e.g., one large tree supports many insects).'),
  fb(4, 'At each trophic level, approximately ___% of energy is lost, mainly as heat from respiration. Energy flows through ecosystems in ___ direction and is not recycled.',
    ['90', 'one'],
    'About 90% of energy at each trophic level is used in cellular respiration (released as heat), lost in undigested food, or used for movement and other life processes. Only about 10% is incorporated into body tissue and available to the next trophic level. Unlike nutrients, energy flows in one direction and cannot be recycled.'),
  t(5, '### Nutrient Cycles\n\nUnlike energy, nutrients are **recycled** through ecosystems. Two important nutrient cycles are:\n\n**1. The Water Cycle:**\n- **Evaporation**: Water from oceans, lakes, and rivers evaporates into the atmosphere\n- **Transpiration**: Plants release water vapour through stomata\n- **Condensation**: Water vapour cools and forms clouds\n- **Precipitation**: Water falls as rain, snow, or hail\n- **Infiltration and runoff**: Water soaks into the soil or flows into rivers and oceans\n\n**2. The Carbon Cycle:**\n- **Photosynthesis** removes CO\u2082 from the atmosphere: CO\u2082 \u2192 glucose (stored as organic compounds in plants)\n- **Respiration** returns CO\u2082 to the atmosphere (all living organisms respire)\n- **Decomposition**: Decomposers break down dead organisms, releasing CO\u2082\n- **Combustion**: Burning fossil fuels and wood releases stored carbon as CO\u2082\n- **Fossil fuels**: Ancient organisms\' carbon was locked in coal, oil, and gas over millions of years\n\n**Human impact on the carbon cycle:**\n- Burning fossil fuels releases extra CO\u2082 \u2192 enhanced greenhouse effect \u2192 global warming\n- Deforestation reduces the number of trees absorbing CO\u2082 through photosynthesis'),
  q(6, 'Which process in the carbon cycle removes CO\u2082 from the atmosphere?',
    ['Respiration', 'Combustion', 'Photosynthesis', 'Decomposition'], 2,
    'Photosynthesis is the process that removes CO\u2082 from the atmosphere. Plants, algae, and cyanobacteria absorb CO\u2082 and use it to make glucose. All other listed processes (respiration, combustion, decomposition) release CO\u2082 back into the atmosphere.'),
  t(7, '### The Nitrogen Cycle\n\n**Why nitrogen is important:** Nitrogen is needed to make amino acids (proteins), nucleic acids (DNA, RNA), and chlorophyll.\n\n**The nitrogen cycle:**\n\n| Process | What happens | Organisms involved |\n|---------|-------------|-------------------|\n| **Nitrogen fixation** | N\u2082 gas \u2192 NH\u2083/NH\u2084\u207a (ammonia/ammonium) | Rhizobium bacteria in root nodules of legumes; lightning |\n| **Nitrification** | NH\u2084\u207a \u2192 NO\u2082\u207b \u2192 NO\u2083\u207b (nitrates) | Nitrosomonas and Nitrobacter bacteria |\n| **Assimilation** | Plants absorb NO\u2083\u207b and NH\u2084\u207a to make amino acids and proteins | Plants |\n| **Decomposition / Ammonification** | Dead organisms and waste \u2192 NH\u2083/NH\u2084\u207a | Decomposer bacteria and fungi |\n| **Denitrification** | NO\u2083\u207b \u2192 N\u2082 gas (returned to atmosphere) | Denitrifying bacteria (in waterlogged, anaerobic soil) |\n\n**South African agriculture and nitrogen:**\n- Legume crops (beans, peas, lucerne/alfalfa) are rotated with other crops because Rhizobium in their root nodules fixes nitrogen, enriching the soil naturally\n- This reduces the need for expensive artificial nitrogen fertilisers'),
  q(8, 'Which process converts atmospheric nitrogen (N\u2082) into a form that plants can use?',
    ['Nitrification', 'Denitrification', 'Nitrogen fixation', 'Decomposition'], 2,
    'Nitrogen fixation converts atmospheric nitrogen gas (N\u2082) into ammonia (NH\u2083) or ammonium (NH\u2084\u207a), which plants can absorb and use. This is carried out mainly by Rhizobium bacteria in the root nodules of leguminous plants, and also by lightning.'),
  fb(9, 'In the nitrogen cycle, Rhizobium bacteria carry out nitrogen ___ in the root nodules of legumes. Denitrification returns ___ gas to the atmosphere.',
    ['fixation', 'nitrogen'],
    'Rhizobium bacteria live in a mutualistic relationship with leguminous plants (beans, peas, clover). They fix atmospheric nitrogen (N\u2082) into ammonia, which the plant can use for making proteins. Denitrifying bacteria reverse this process, converting nitrates back to N\u2082 gas.'),
  t(10, '### The Oxygen Cycle\n\n**Key processes:**\n- **Photosynthesis** releases O\u2082 into the atmosphere: 6CO\u2082 + 6H\u2082O \u2192 C\u2086H\u2081\u2082O\u2086 + 6O\u2082\n- **Respiration** uses O\u2082 and releases CO\u2082: C\u2086H\u2081\u2082O\u2086 + 6O\u2082 \u2192 6CO\u2082 + 6H\u2082O\n- **Combustion** uses O\u2082 when burning fuels\n- **Decomposition** uses O\u2082 when decomposers respire\n\nThe water cycle, carbon cycle, nitrogen cycle, and oxygen cycle are all interconnected. Changes in one cycle affect the others. For example, deforestation reduces photosynthesis, which decreases both O\u2082 production and CO\u2082 absorption.'),
];

// =============================================================================
// CHAPTER 11: Biodiversity and Classification (Term 3/4, Weeks 10-11 + Term 4 Week 1)
// =============================================================================
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Biodiversity and Classification\n\n### What is Biodiversity?\n\n**Biodiversity** is the variety of life on Earth at all levels: genetic diversity, species diversity, and ecosystem diversity.\n\n**Three levels of biodiversity:**\n1. **Genetic diversity**: Variation in genes within a species (allows adaptation to changing environments)\n2. **Species diversity**: The number and variety of different species in an area\n3. **Ecosystem diversity**: The variety of different ecosystems in a region (forests, wetlands, grasslands, etc.)\n\n**Why is biodiversity important?**\n- Maintains ecosystem stability (more diverse ecosystems are more resilient)\n- Provides food, medicine, and raw materials\n- Ecosystem services: clean air, clean water, pollination, soil fertility\n- Cultural and aesthetic value\n- Genetic resources for future crop improvement and medical research\n\n**South Africa\'s biodiversity:**\n- South Africa is the **third most biodiverse country** in the world\n- Contains 3 of the world\'s 36 biodiversity hotspots: Cape Floristic Region, Succulent Karoo, Maputaland-Pondoland-Albany\n- Over 95 000 known species'),
  q(2, 'Why is genetic diversity within a species important?',
    ['It makes all organisms look the same', 'It allows the population to adapt to changing environmental conditions because some individuals may have traits suited to new conditions', 'It reduces the number of species in an ecosystem', 'It is not important for survival'], 1,
    'Genetic diversity provides the raw material for natural selection. When environments change (e.g., new diseases, climate change), genetically diverse populations are more likely to contain individuals with traits that allow survival and reproduction in the new conditions.'),
  t(3, '### The Need for Classification\n\nWith millions of species on Earth, scientists need a systematic way to organise and name them.\n\n**Classification** (taxonomy) is the science of naming and grouping organisms based on shared characteristics.\n\n**Reasons for classification:**\n- Organise the vast diversity of life\n- Identify and name organisms consistently worldwide\n- Show evolutionary relationships between organisms\n- Predict characteristics of newly discovered organisms\n- Facilitate communication among scientists globally\n\n**History of classification:**\n- **Carl Linnaeus** (1707\u20131778): Swedish scientist called the "father of taxonomy"\n  - Developed the **binomial naming system** (two-part Latin name)\n  - Developed a hierarchical classification system\n  - Genus name + species name (e.g., *Homo sapiens*)\n\n**Why Latin?**\n- Latin is a "dead language" that doesn\'t change\n- Provides a universal scientific language understood by scientists worldwide\n- Avoids confusion caused by different common names in different languages'),
  t(4, '### The Hierarchical Classification System\n\nOrganisms are classified into a hierarchy of increasingly specific groups:\n\n**From broadest to most specific:**\n\nDomain \u2192 Kingdom \u2192 Phylum \u2192 Class \u2192 Order \u2192 Family \u2192 Genus \u2192 Species\n\n**Mnemonic:** **D**ear **K**ing **P**hilip **C**ame **O**ver **F**or **G**ood **S**paghetti\n\n**Example: Classification of a lion**\n| Level | Classification |\n|-------|---------------|\n| Domain | Eukarya |\n| Kingdom | Animalia |\n| Phylum | Chordata |\n| Class | Mammalia |\n| Order | Carnivora |\n| Family | Felidae |\n| Genus | *Panthera* |\n| Species | *Panthera leo* |\n\n**Binomial nomenclature rules:**\n- The genus name is capitalised: *Panthera*\n- The species name is lowercase: *leo*\n- Both names are italicised (or underlined if handwritten)\n- The genus name can be abbreviated after first use: *P. leo*'),
  q(5, 'In the binomial name *Homo sapiens*, which part refers to the genus?',
    ['sapiens', 'Homo', 'Homo sapiens together', 'Neither \u2014 it is the species name'], 1,
    'In binomial nomenclature, the first name (capitalised) is the genus name and the second name (lowercase) is the specific epithet (species name). So *Homo* is the genus and *sapiens* is the species descriptor. Together, *Homo sapiens* is the full species name.'),
  fb(6, 'The binomial naming system was developed by ___. In a binomial name, the first word is the ___ name (capitalised) and the second word is the species name (lowercase).',
    ['Carl Linnaeus', 'genus'],
    'Carl Linnaeus developed the binomial naming system in the 18th century, giving each species a unique two-part Latin name. The genus name is always capitalised, and the species name is always lowercase. Both must be italicised or underlined.'),
  t(7, '### The Five-Kingdom System\n\nOrganisms are classified into five kingdoms:\n\n| Kingdom | Cell type | Cell wall | Nutrition | Examples |\n|---------|-----------|-----------|-----------|----------|\n| **Monera** (Bacteria) | Prokaryotic | Yes (peptidoglycan) | Autotrophic or heterotrophic | Bacteria, cyanobacteria |\n| **Protista** | Eukaryotic | Some have (cellulose or silica) | Autotrophic or heterotrophic | Amoeba, Paramecium, algae |\n| **Fungi** | Eukaryotic | Yes (chitin) | Heterotrophic (extracellular digestion \u2014 absorb nutrients) | Mushrooms, moulds, yeast |\n| **Plantae** | Eukaryotic | Yes (cellulose) | Autotrophic (photosynthesis) | Mosses, ferns, flowering plants |\n| **Animalia** | Eukaryotic | No | Heterotrophic (ingest food) | Insects, fish, mammals |\n\n**Key differences between prokaryotes and eukaryotes:**\n- Prokaryotes (Monera): No nucleus, no membrane-bound organelles, circular DNA\n- Eukaryotes (Protista, Fungi, Plantae, Animalia): True nucleus, membrane-bound organelles, linear DNA in chromosomes'),
  q(8, 'Which kingdom contains organisms that are eukaryotic, have cell walls made of chitin, and obtain nutrition by extracellular digestion?',
    ['Monera', 'Plantae', 'Fungi', 'Animalia'], 2,
    'Fungi are eukaryotic organisms with cell walls made of chitin (not cellulose like plants). They are heterotrophic and use extracellular digestion: they secrete enzymes onto organic matter and absorb the digested nutrients through their hyphae.'),
  t(9, '### Using Dichotomous Keys\n\nA **dichotomous key** is a tool used to identify organisms. It works by presenting a series of paired statements, each leading to another pair or to an identification.\n\n**How to use a dichotomous key:**\n1. Start at the first pair of statements\n2. Choose the statement that matches the organism\n3. Follow the instruction (go to the next numbered pair or identify the organism)\n4. Continue until the organism is identified\n\n**Example: Key to identify four South African animals**\n\n| Step | Statement | Result |\n|------|-----------|--------|\n| 1a | Has feathers | Go to 2 |\n| 1b | Has fur/hair | Go to 3 |\n| 2a | Can fly | Fiscal shrike |\n| 2b | Cannot fly | Ostrich |\n| 3a | Has stripes | Zebra |\n| 3b | Has spots | Leopard |\n\n**Tips for exams:** Always start at step 1. Read both statements carefully. Only choose the one that matches your specimen. Follow the instructions precisely.'),
  q(10, 'What is the purpose of a dichotomous key?',
    ['To show the evolutionary history of organisms', 'To identify unknown organisms by working through paired statements about their observable features', 'To classify organisms into kingdoms', 'To count the number of species in an area'], 1,
    'A dichotomous key (dicho = two, tomous = cutting) is an identification tool. It presents pairs of contrasting statements about observable features. By choosing the correct statement at each step, the user is guided through a series of branching decisions until the organism is identified.'),
  fb(11, 'A dichotomous key uses pairs of contrasting ___ to identify organisms. The five-kingdom classification system groups all prokaryotic organisms in the kingdom ___.',
    ['statements', 'Monera'],
    'Dichotomous keys present two contrasting descriptive statements at each step, allowing the user to narrow down the identity of an organism. The kingdom Monera (also called Bacteria or Prokaryotae) contains all prokaryotic organisms, which lack a membrane-bound nucleus.'),
];

// =============================================================================
// CHAPTER 12: Revision and Exam Preparation (Term 4)
// =============================================================================
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Revision and Exam Preparation\n\n### Term 1 Revision: Chemistry of Life and Cell Biology\n\n**Chemistry of Life:**\n- Four organic compound groups: carbohydrates, lipids, proteins, nucleic acids\n- Food tests: Iodine (starch \u2192 blue-black), Benedict\'s (reducing sugar \u2192 brick-red), Biuret (protein \u2192 purple), Emulsion test (lipids \u2192 cloudy white)\n- Condensation reactions (join monomers, release water) vs hydrolysis (break polymers, add water)\n\n**Cells:**\n- Cell theory: All living things are made of cells; cells are the basic unit of life; cells arise from pre-existing cells\n- Plant vs animal cells: Plant cells have cell wall, chloroplasts, large central vacuole\n- Prokaryotic (no nucleus, no membrane-bound organelles) vs eukaryotic (true nucleus, organelles)\n- Cell membrane: Selectively permeable phospholipid bilayer with embedded proteins\n\n**Movement across membranes:**\n- Diffusion: High \u2192 low concentration (passive)\n- Osmosis: Water from high to low water concentration through a selectively permeable membrane (passive)\n- Active transport: Low \u2192 high concentration (requires ATP)'),
  t(2, '### Term 1 Revision: Cell Division and Cancer\n\n**The cell cycle:**\n- Interphase: G\u2081 (growth) \u2192 S (DNA replication) \u2192 G\u2082 (preparation)\n- Mitotic phase: Mitosis (nuclear division) + cytokinesis (cytoplasm division)\n\n**Phases of mitosis (PMAT):**\n- **P**rophase: Chromosomes condense, nuclear membrane breaks down, spindle forms\n- **M**etaphase: Chromosomes line up at the equator (middle)\n- **A**naphase: Chromatids pulled to opposite poles\n- **T**elophase: Nuclear membranes reform, chromosomes uncoil\n\n**Key points:**\n- Mitosis \u2192 2 identical diploid cells (for growth, repair, asexual reproduction)\n- Cancer = uncontrolled cell division \u2192 tumours\n- Benign (localised) vs malignant (can spread/metastasise)'),
  q(3, 'Which of the following correctly describes the result of mitosis?',
    ['Four genetically different haploid cells', 'Two genetically identical diploid cells', 'Two genetically different diploid cells', 'One cell with double the chromosomes'], 1,
    'Mitosis produces two daughter cells that are genetically identical to the parent cell and to each other. Each daughter cell is diploid (2n), containing the full set of chromosomes. This is essential for growth, repair, and asexual reproduction.'),
  t(4, '### Term 2 Revision: Tissues, Organs, and Support Systems\n\n**Plant tissues:**\n- Meristematic (dividing) vs permanent (differentiated)\n- Epidermal, parenchyma, collenchyma, sclerenchyma, xylem, phloem\n\n**Animal tissues:**\n- Epithelial (covering/lining), connective (support/binding), muscle (movement), nerve (impulse transmission)\n\n**Plant organs and transport:**\n- Leaf: Adapted for photosynthesis (palisade mesophyll, stomata, air spaces)\n- Transpiration stream: Root hair \u2192 xylem \u2192 leaf \u2192 stomata (driven by transpiration pull/cohesion-tension)\n- Translocation: Sucrose transport in phloem from source to sink\n\n**Human skeleton and muscles:**\n- Axial skeleton (skull, vertebral column, ribcage) + appendicular skeleton (limbs, girdles)\n- Synovial joints: Articular cartilage, synovial fluid, ligaments\n- Antagonistic muscle pairs (e.g., biceps/triceps at the elbow)'),
  t(5, '### Term 2 Revision: Circulatory System\n\n**Heart structure:**\n- 4 chambers: Right atrium, right ventricle, left atrium, left ventricle\n- Left ventricle wall is thicker (pumps to whole body)\n- Septum separates oxygenated from deoxygenated blood\n- Valves prevent backflow\n\n**Double circulation:**\n- Pulmonary: Right ventricle \u2192 lungs \u2192 left atrium\n- Systemic: Left ventricle \u2192 body \u2192 right atrium\n\n**Blood vessels:**\n- Arteries: Thick walls, high pressure, carry blood away from heart\n- Veins: Thinner walls, low pressure, valves, carry blood toward heart\n- Capillaries: One cell thick, site of exchange\n\n**Blood components:**\n- Plasma (transport), red blood cells (O\u2082 transport), white blood cells (defence), platelets (clotting)'),
  q(6, 'Why does the left ventricle have a thicker wall than the right ventricle?',
    ['The left ventricle stores more blood', 'The left ventricle pumps blood at higher pressure to the entire body, while the right ventricle only pumps to the nearby lungs', 'The left ventricle has more valves', 'The right ventricle does not pump blood'], 1,
    'The left ventricle must generate higher pressure to pump oxygenated blood through the systemic circulation to all parts of the body. The right ventricle only needs to pump deoxygenated blood a short distance to the lungs, so it needs less muscular force.'),
  t(7, '### Term 3 Revision: History of Life and Ecosystems\n\n**History of life on Earth:**\n- Earth ~4.6 billion years old\n- Three eras: Palaeozoic, Mesozoic, Cenozoic\n- Cambrian explosion (~541 MYA): Rapid appearance of major animal groups\n- Five major mass extinctions; possible sixth extinction caused by humans\n- Fossils: Found in sedimentary rock; dated by relative or radiometric methods\n\n**Biosphere to ecosystems:**\n- Biomes of South Africa: Grassland, savanna, fynbos, forest, Karoo, desert, thicket\n- Abiotic factors: Temperature, light, water, soil, wind\n- Biotic interactions: Food chains, food webs, trophic levels\n- Energy flow: One-directional; ~10% transferred between trophic levels\n- Nutrient cycles: Water, carbon, nitrogen, oxygen \u2014 nutrients are recycled\n\n**Biodiversity and classification:**\n- Five-kingdom system: Monera, Protista, Fungi, Plantae, Animalia\n- Binomial nomenclature (Carl Linnaeus): *Genus species*\n- Classification hierarchy: Domain \u2192 Kingdom \u2192 Phylum \u2192 Class \u2192 Order \u2192 Family \u2192 Genus \u2192 Species'),
  fb(8, 'In the classification hierarchy, the broadest grouping is the ___ and the most specific is the ___.',
    ['domain', 'species'],
    'The classification hierarchy runs from broadest to most specific: Domain, Kingdom, Phylum, Class, Order, Family, Genus, Species. Organisms in the same species are most closely related, while organisms in the same domain may be very different from each other.'),
  t(9, '### Exam Tips for Grade 10 Life Sciences\n\n**Common mistakes to avoid:**\n1. Confusing **diffusion** (any substance, high to low) with **osmosis** (water only, through a membrane)\n2. Saying "mitosis produces 4 cells" \u2014 mitosis produces **2** identical cells; meiosis produces 4\n3. Confusing **xylem** (water, dead cells, upward) with **phloem** (sucrose, living cells, bidirectional)\n4. Writing **arteries carry oxygenated blood** as a rule \u2014 the pulmonary artery carries deoxygenated blood\n5. Saying **cell wall controls what enters the cell** \u2014 the **cell membrane** is selectively permeable; the cell wall is freely permeable\n6. Confusing **condensation** (joining monomers, releasing water) with **hydrolysis** (breaking polymers, adding water)\n\n**Command words:**\n- **Define**: Give the precise meaning of a term\n- **Describe**: Say what happens step by step\n- **Explain**: Give reasons WHY something happens\n- **Compare**: Give similarities AND differences\n- **Distinguish**: Give differences only\n- **Tabulate**: Present information in a table'),
  q(10, 'Which statement is correct?',
    ['Arteries always carry oxygenated blood', 'The cell wall controls what enters and leaves a cell', 'Osmosis is the movement of water through a selectively permeable membrane from high to low water concentration', 'Mitosis produces four genetically different cells'], 2,
    'Osmosis is specifically the movement of water molecules from a region of high water concentration to a region of low water concentration through a selectively permeable membrane. The pulmonary artery carries deoxygenated blood (so arteries do not always carry oxygenated blood). The cell membrane (not wall) controls entry/exit. Mitosis produces two identical cells.'),
];

// =============================================================================
// MAIN \u2014 Insert into MongoDB
// =============================================================================
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 10
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 10/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 10:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 10', schoolId: SCHOOL_ID, orderIndex: 10,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 10:', String(GRADE_ID));
  }

  // Find or create the Life Sciences subject
  const subjectDoc = await db.collection('subjects').findOne({
    name: /Life.*Sci/i,
    schoolId: SCHOOL_ID,
  });

  let SUBJECT_ID;
  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Life Sciences subject:', String(SUBJECT_ID));
  } else {
    const result = await db.collection('subjects').insertOne({
      name: 'Life Sciences',
      code: 'LFSC',
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
    tags: ['life-sciences', 'grade-10', 'caps'],
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
      title: 'Chapter 1: Chemistry of Life',
      description: 'Molecules for life, water and its importance, organic compounds (carbohydrates, lipids, proteins, nucleic acids), food tests, vitamins, and mineral requirements.',
      order: 1,
      lessons: [
        { title: 'Molecules for Life and Organic Compounds', description: 'Elements in living organisms, water properties, inorganic and organic compounds (carbohydrates, lipids, proteins, nucleic acids), food tests, vitamins, and deficiency diseases.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Cells \u2014 The Basic Units of Life',
      description: 'Cell theory, microscopy, plant and animal cell structure, organelle functions, prokaryotic vs eukaryotic cells, cell membrane, diffusion, osmosis, and active transport.',
      order: 2,
      lessons: [
        { title: 'Cell Structure and Organelles', description: 'Cell theory, contributions of key scientists, microscopy and magnification, plant and animal cell structures, organelle functions, and prokaryotic vs eukaryotic cells.', blocks: ch2_lesson1, term: 1 },
        { title: 'Cell Membranes and Movement of Substances', description: 'The fluid mosaic model, selective permeability, diffusion, osmosis (turgor, plasmolysis, haemolysis), and active transport in living organisms.', blocks: ch2_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Cell Division \u2014 Mitosis',
      description: 'Chromosomes, the cell cycle, interphase, phases of mitosis (PMAT), cytokinesis, importance of mitosis, and cancer as uncontrolled cell division.',
      order: 3,
      lessons: [
        { title: 'Mitosis and Cancer', description: 'Chromosomes and DNA, the cell cycle (interphase and mitotic phase), prophase, metaphase, anaphase, telophase, cytokinesis, importance of mitosis, and cancer.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Plant and Animal Tissues',
      description: 'Meristematic and permanent plant tissues (epidermal, parenchyma, collenchyma, sclerenchyma, xylem, phloem), and the four animal tissue types (epithelial, connective, muscle, nerve).',
      order: 4,
      lessons: [
        { title: 'Plant Tissues', description: 'Meristematic vs permanent tissue, epidermal tissue and stomata, parenchyma, collenchyma, sclerenchyma, xylem, and phloem structure and functions.', blocks: ch4_lesson1, term: 2 },
        { title: 'Animal Tissues', description: 'Epithelial tissue types, connective tissues (blood, bone, cartilage, tendons, ligaments), skeletal/smooth/cardiac muscle, and nerve tissue (neurons).', blocks: ch4_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Plant Organs',
      description: 'Leaf structure and adaptations for photosynthesis, stomata and gas exchange, stem and root structure, root hair cells, and water and mineral absorption.',
      order: 5,
      lessons: [
        { title: 'Leaf, Stem, and Root Structure', description: 'Leaf cross-section, palisade and spongy mesophyll, stomata and guard cells, leaf adaptations for photosynthesis, stem vascular bundles, root structure and root hair cells.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Support and Transport in Plants',
      description: 'Transpiration and the transpiration stream, factors affecting transpiration, translocation in phloem, turgor pressure, and plant support mechanisms.',
      order: 6,
      lessons: [
        { title: 'Transpiration, Translocation, and Support', description: 'Transpiration stream and cohesion-tension theory, factors affecting transpiration rate, translocation of sucrose in phloem, and plant support mechanisms.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Support Systems in Animals',
      description: 'The human skeleton (axial and appendicular), bone and cartilage structure, types of joints, synovial joint structure, antagonistic muscle pairs, and movement.',
      order: 7,
      lessons: [
        { title: 'The Human Skeleton, Joints, and Muscles', description: 'Axial and appendicular skeleton, functions of the skeleton, bone and cartilage structure, types of joints, synovial joint features, antagonistic muscle pairs.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Transport System in Animals',
      description: 'Double circulatory system, heart structure and the cardiac cycle, blood vessels (arteries, veins, capillaries), and blood composition.',
      order: 8,
      lessons: [
        { title: 'The Heart, Blood Vessels, and Blood', description: 'Pulmonary and systemic circulation, heart chambers and valves, the cardiac cycle, arteries, veins, capillaries, blood components, and red blood cell adaptations.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: History of Life on Earth',
      description: 'Geological timescale, changes in the atmosphere, mass extinctions, fossil formation and dating, and the Cradle of Humankind.',
      order: 9,
      lessons: [
        { title: 'Earth\'s History, Fossils, and Mass Extinctions', description: 'Geological timescale, atmospheric changes, Cambrian explosion, five mass extinctions, the sixth extinction, fossil formation, relative and radiometric dating, and South African fossil sites.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Biosphere to Ecosystems',
      description: 'The biosphere, South African biomes, abiotic and biotic factors, energy flow through ecosystems, food chains and webs, trophic levels, and nutrient cycles (water, carbon, nitrogen, oxygen).',
      order: 10,
      lessons: [
        { title: 'Biomes and Abiotic Factors', description: 'The biosphere and its components, terrestrial biomes of South Africa (grassland, savanna, fynbos, Karoo, desert, forest, thicket), aquatic ecosystems, and abiotic factors.', blocks: ch10_lesson1, term: 3 },
        { title: 'Energy Flow and Nutrient Cycles', description: 'Trophic levels, food chains and webs, energy flow and the 10% rule, pyramids, and the water, carbon, nitrogen, and oxygen cycles.', blocks: ch10_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: Biodiversity and Classification',
      description: 'Biodiversity in South Africa, the need for classification, Carl Linnaeus and binomial nomenclature, the classification hierarchy, the five-kingdom system, and dichotomous keys.',
      order: 11,
      lessons: [
        { title: 'Classification and the Five Kingdoms', description: 'Three levels of biodiversity, South Africa\'s biodiversity, need for classification, Linnaeus and binomial nomenclature, classification hierarchy, five-kingdom system, and dichotomous keys.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Revision and Exam Preparation',
      description: 'Comprehensive revision of all Grade 10 Life Sciences topics: chemistry of life, cells, mitosis, tissues, organs, support systems, transport, history of life, ecosystems, biodiversity, and exam strategies.',
      order: 12,
      lessons: [
        { title: 'Full Year Revision and Exam Tips', description: 'Revision summaries for Terms 1 to 3, key concepts, common mistakes to avoid, command words, and exam strategies for Life Sciences.', blocks: ch12_lesson1, term: 4 },
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
    title: 'Grade 10 Life Sciences \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Chemistry of Life, Cells, Cell Division, Plant and Animal Tissues, Plant Organs, Support and Transport in Plants, Support and Transport in Animals, History of Life on Earth, Biosphere to Ecosystems, and Biodiversity and Classification for the Grade 10 Life Sciences curriculum.',
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
  console.log('  TEXTBOOK: Grade 10 Life Sciences');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
