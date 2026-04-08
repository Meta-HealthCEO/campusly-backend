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
// CHAPTER 1: Cells as Basic Units of Life (Term 1 — Life and Living)
// =============================================================================
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Cell Structure\n\n### The Cell — Basic Unit of Life\n\nThe cell is the basic structural and functional unit of all living organisms. All living things are made of one or more cells. Cells can only be seen under a microscope because they are microscopic.\n\n**Two types of cells:**\n\n| Feature | Plant Cell | Animal Cell |\n|---------|-----------|------------|\n| Cell wall | Present (cellulose) | Absent |\n| Cell membrane | Present | Present |\n| Cytoplasm | Present | Present |\n| Nucleus | Present | Present |\n| Chloroplasts | Present (for photosynthesis) | Absent |\n| Large central vacuole | Present | Small or absent |\n| Mitochondria | Present | Present |\n\n**Key organelles and their functions:**\n- **Cell membrane** — encloses the cell and controls what enters and leaves. It is selectively permeable, allowing only specific substances to pass through.\n- **Cytoplasm** — the jelly-like medium inside the cell where many chemical reactions take place.\n- **Nucleus** — contains DNA, which carries the genetic information (inherited characteristics). The nucleus is enclosed by a nuclear membrane in both plant and animal cells.'),
  t(2, '### More Cell Organelles\n\n- **Mitochondria** — responsible for cellular respiration, releasing energy from food. Often called the "powerhouses" of the cell.\n- **Chloroplasts** — found only in plant cells. They contain the green pigment chlorophyll, which absorbs light energy for photosynthesis.\n- **Cell wall** — a rigid structure made of cellulose found outside the cell membrane in plant cells. It provides support and protection.\n- **Vacuole** — plant cells have a large central vacuole filled with cell sap. It stores water and dissolved substances and helps maintain the cell\'s shape. Vacuoles in animal cells are small and temporary.\n\n**Why do plant cells have chloroplasts but animal cells do not?**\nPlant cells carry out photosynthesis — the process of making food (glucose) from sunlight, carbon dioxide and water. Animal cells obtain their food by eating other organisms, so they do not need chloroplasts.'),
  q(3, 'Which organelle is responsible for releasing energy from food through respiration?',
    ['Chloroplast', 'Nucleus', 'Mitochondria', 'Cell wall'], 2,
    'Mitochondria carry out cellular respiration, breaking down glucose to release energy that the cell can use for its life processes. They are found in both plant and animal cells.'),
  q(4, 'Which structure is found in plant cells but NOT in animal cells?',
    ['Cell membrane', 'Mitochondria', 'Nucleus', 'Cell wall'], 3,
    'The cell wall is made of cellulose and is found only in plant cells. It provides rigid support and protection. Animal cells only have a cell membrane, which is flexible.'),
  fb(5, 'The ___ contains DNA and controls the activities of the cell. The ___ is the jelly-like substance where chemical reactions occur.',
    ['nucleus', 'cytoplasm'],
    'The nucleus contains the cell\'s genetic material (DNA) and directs cell activities. The cytoplasm is the fluid medium that fills the cell, providing a site for many metabolic reactions.'),
  t(6, '### Differences Between Plant and Animal Cells\n\nPlant cells differ from animal cells in several important ways:\n\n- Plant cells have a **rigid cell wall** made of cellulose outside the cell membrane. This gives the plant cell its fixed, rectangular shape.\n- Plant cells contain **chloroplasts** with the green pigment chlorophyll for photosynthesis.\n- Plant cells have a **large central vacuole** that stores water, nutrients, and waste products. This vacuole helps maintain turgor pressure, keeping the plant upright.\n- Animal cells have **small, temporary vacuoles** (or none at all).\n- Animal cells have an **irregular shape** because they lack a cell wall.\n\n**Remember:** Both plant and animal cells have a cell membrane, cytoplasm, nucleus, and mitochondria. These are shared features of all eukaryotic cells.'),
  q(7, 'A learner observes a cell under a microscope. The cell has a cell wall, chloroplasts, and a large central vacuole. What type of cell is it?',
    ['An animal cell', 'A bacterial cell', 'A plant cell', 'A red blood cell'], 2,
    'Cell walls (cellulose), chloroplasts, and a large central vacuole are features unique to plant cells. Animal cells lack all three of these structures.'),
  t(8, '### Cells in Tissues, Organs, and Systems\n\nCells do not work alone. In multicellular organisms, cells are organised into increasingly complex levels:\n\n1. **Cells** — the basic unit of life (e.g., a muscle cell)\n2. **Tissues** — a group of similar cells performing a specific function (e.g., muscle tissue)\n3. **Organs** — a group of different tissues working together (e.g., the heart)\n4. **Systems** — a group of organs working together to carry out a major body function (e.g., the circulatory system)\n5. **Organism** — the complete living thing made up of all its systems\n\nCells come in many different shapes and sizes. Their shape is related to their function:\n- **Muscle cells** are long and able to contract for movement.\n- **Red blood cells** are disc-shaped to carry oxygen efficiently.\n- **Nerve cells** are long with branches to transmit electrical signals.\n- **Root hair cells** have extensions to increase surface area for water absorption.\n\n**Stem cells** are special cells that can divide and develop into many different cell types. No detail is required at this level.'),
  fb(9, 'A group of similar cells performing a specific function is called a ___. A group of organs working together is called a ___.',
    ['tissue', 'system'],
    'Tissues are made up of similar cells (e.g., muscle tissue is made of muscle cells). Organ systems consist of multiple organs that cooperate to perform a major function (e.g., the digestive system includes the stomach, intestines, and liver).'),
  q(10, 'Which is the correct order of organisation from simplest to most complex?',
    ['Organ → Tissue → Cell → System', 'Cell → Tissue → Organ → System', 'Tissue → Cell → System → Organ', 'System → Organ → Tissue → Cell'], 1,
    'The correct hierarchy from simplest to most complex is: Cell → Tissue → Organ → Organ System → Organism. Cells are the basic building blocks, tissues are groups of similar cells, organs are groups of tissues, and systems are groups of organs.'),
];

// =============================================================================
// CHAPTER 2: Systems in the Human Body (Term 1 — Life and Living)
// =============================================================================
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Overview of Body Systems\n\n### Systems Working Together\n\nThe human body consists of several integrated systems that work together to keep us alive and healthy. Each system has a specific function, but all systems depend on one another.\n\n**The main body systems:**\n\n| System | Main Function |\n|--------|---------------|\n| Musculoskeletal system | Movement and support |\n| Circulatory system | Transport of blood, nutrients, and gases |\n| Respiratory system | Gas exchange (oxygen in, carbon dioxide out) |\n| Nervous system | Receiving and responding to stimuli |\n| Excretory system | Removing waste products |\n| Digestive system | Breaking down food and absorbing nutrients |\n| Reproductive system | Producing offspring |\n\n### The Musculoskeletal System\n\nThe skeleton provides **support** for the body, **protects** internal organs, and works with muscles to enable **movement**.\n\n- The main processes are **contraction and relaxation** of muscles, which enable locomotion and movement.\n- The main components include **muscles, bones, cartilage, tendons, and ligaments**.\n- **Tendons** connect muscles to bones.\n- **Ligaments** connect bones to bones at joints.'),
  q(2, 'What is the function of tendons in the musculoskeletal system?',
    ['They connect bones to bones', 'They connect muscles to bones', 'They produce red blood cells', 'They cushion joints'], 1,
    'Tendons are tough, flexible bands of connective tissue that attach muscles to bones. When a muscle contracts, the tendon pulls on the bone, causing movement. Ligaments, by contrast, connect bones to bones at joints.'),
  t(3, '## The Circulatory System\n\n### Blood, Heart, and Blood Vessels\n\nThe **blood circulatory system** brings nutrients and oxygen to cells and removes waste products like carbon dioxide.\n\n**Main components:**\n- **Heart** — a muscular pump that pushes blood around the body\n- **Blood vessels:**\n  - **Arteries** — carry oxygenated blood away from the heart (except the pulmonary artery)\n  - **Veins** — carry deoxygenated blood back to the heart (except the pulmonary vein)\n  - **Capillaries** — tiny vessels where exchange of substances occurs between blood and body cells\n\n**Blood circulation:**\n1. Oxygenated blood is pumped from the left side of the heart through arteries to the body.\n2. At the capillaries, oxygen moves into the cells and carbon dioxide moves into the blood by diffusion.\n3. In the mitochondria of cells, oxygen combines with food in the process of **respiration**, and energy is released.\n4. Deoxygenated blood returns through veins to the right side of the heart.\n5. The heart pumps deoxygenated blood to the lungs through the **pulmonary arteries**.\n6. In the lungs, carbon dioxide is released and oxygen is picked up.\n7. Oxygenated blood returns to the left side of the heart via the **pulmonary veins**.'),
  fb(4, 'Arteries carry blood ___ from the heart, while veins carry blood ___ to the heart.',
    ['away', 'back'],
    'Arteries carry blood away from the heart (mostly oxygenated blood, except the pulmonary artery). Veins carry blood back to the heart (mostly deoxygenated blood, except the pulmonary vein).'),
  q(5, 'Where does gaseous exchange between blood and body cells take place?',
    ['In the arteries', 'In the veins', 'In the capillaries', 'In the heart'], 2,
    'Capillaries are the smallest blood vessels with walls only one cell thick. This allows oxygen, nutrients, and waste products to diffuse easily between the blood and surrounding body cells.'),
  t(6, '### Health Issues: Cardiovascular Problems\n\n**High blood pressure** can damage blood vessels and increase the risk of heart attacks and strokes. It is made worse by:\n- A diet high in salt and fat\n- Lack of exercise\n- Smoking\n- Stress\n\n**Heart attacks** occur when the blood supply to the heart muscle is blocked, often by fatty deposits in the coronary arteries.\n\n**Strokes** occur when the blood supply to part of the brain is interrupted.\n\nLiving a healthy lifestyle — eating well, exercising regularly, not smoking, and managing stress — reduces the risk of cardiovascular disease.'),
  t(7, '## The Respiratory System\n\n### Breathing and Gas Exchange\n\nThe **respiratory system** is responsible for supplying oxygen to the body and removing carbon dioxide.\n\n**Main components:** nose and mouth, trachea (windpipe), bronchi, lungs, and alveoli.\n\n**Breathing (ventilation):**\n- **Inhalation** — the diaphragm contracts and flattens, the rib cage moves up and out, the volume of the chest cavity increases, air pressure decreases, and air rushes into the lungs.\n- **Exhalation** — the diaphragm relaxes and domes upward, the rib cage moves down and in, the volume decreases, air pressure increases, and air is pushed out.\n\n**Gaseous exchange in the alveoli:**\n- Oxygen diffuses from the air in the alveoli into the blood in the surrounding capillaries.\n- Carbon dioxide diffuses from the blood into the alveoli to be breathed out.\n- This exchange occurs by **diffusion** — the movement of substances from an area of high concentration to an area of low concentration.\n\n**Health issues:** Asthma, lung cancer, bronchitis, and asbestosis are diseases that affect the respiratory system.'),
  q(8, 'During inhalation, what happens to the diaphragm?',
    ['It relaxes and moves upward', 'It contracts and flattens', 'It stays in the same position', 'It pushes air out of the lungs'], 1,
    'During inhalation, the diaphragm muscle contracts and flattens downward. This increases the volume of the chest cavity, reduces air pressure inside the lungs, and causes air to rush in.'),
  fb(9, 'In the lungs, oxygen moves from the alveoli into the blood by the process of ___. Carbon dioxide moves in the opposite direction, also by ___.',
    ['diffusion', 'diffusion'],
    'Both oxygen and carbon dioxide move across the thin walls of the alveoli and capillaries by diffusion — from areas of high concentration to areas of low concentration. No energy is required for this process.'),
  q(10, 'Which system removes waste products such as urea and excess water from the body?',
    ['Digestive system', 'Respiratory system', 'Excretory system', 'Nervous system'], 2,
    'The excretory system removes metabolic waste products from the body. The kidneys filter blood to remove urea, excess salts, and water, producing urine. The lungs also excrete carbon dioxide and water vapour.'),
];

blockNum = 0;
const ch2_lesson2 = [
  t(1, '## Human Reproduction\n\n### The Reproductive System\n\nThe **reproductive system** produces sex cells (gametes) for the purpose of continuing the species.\n\n**Male reproductive system:**\n- **Testes** — produce sperm cells and the hormone testosterone\n- **Sperm duct (vas deferens)** — carries sperm from the testes\n- **Penis** — deposits sperm into the female reproductive system\n- **Scrotum** — holds the testes outside the body at a temperature slightly lower than body temperature\n- **Urethra** — shared tube for urine and semen\n\n**Female reproductive system:**\n- **Ovaries** — produce egg cells (ova) and the hormones oestrogen and progesterone\n- **Oviducts (Fallopian tubes)** — tubes where fertilisation usually occurs; carry the egg toward the uterus\n- **Uterus (womb)** — where the fertilised egg implants and the foetus develops\n- **Vagina** — birth canal; receives sperm during copulation'),
  q(2, 'Where does fertilisation usually take place in the female reproductive system?',
    ['In the uterus', 'In the ovary', 'In the oviduct (Fallopian tube)', 'In the vagina'], 2,
    'Fertilisation — the fusion of the sperm and egg — usually occurs in the oviduct (Fallopian tube). The fertilised egg (zygote) then travels down the oviduct to the uterus, where it implants in the uterine wall.'),
  t(3, '### Puberty and Secondary Sexual Characteristics\n\n**Puberty** is the stage in the human life cycle when sexual organs mature for reproduction. The pituitary gland releases hormones that trigger the testes and ovaries to release sex hormones.\n\n**Testosterone** (from the testes) causes:\n- Deepening of the voice\n- Growth of facial and pubic hair\n- Muscle development\n- Production of sperm (ejaculation)\n\n**Oestrogen** (from the ovaries) causes:\n- Breast development\n- Widening of hips\n- Growth of pubic hair\n- Start of the menstrual cycle (menstruation)'),
  t(4, '### The Menstrual Cycle\n\nThe menstrual cycle is usually about **28 days** long and prepares the uterus for possible pregnancy.\n\n**Key events:**\n1. **Menstruation (Day 1–5)** — the thick lining of the uterus breaks down and is released through the vagina as blood.\n2. **Uterine lining rebuilds (Day 6–13)** — the uterus develops a thick, blood-rich lining in preparation for a fertilised egg.\n3. **Ovulation (Day 14)** — one of the ovaries releases a ripe egg into the oviduct.\n4. **If fertilisation does NOT occur** — the egg breaks down, hormone levels drop, and the uterine lining sheds (menstruation begins again).\n5. **If fertilisation DOES occur** — the fertilised egg implants in the uterine lining and pregnancy begins.'),
  fb(5, 'The release of a ripe egg from the ovary is called ___. The menstrual cycle is usually about ___ days long.',
    ['ovulation', '28'],
    'Ovulation occurs around day 14 of the menstrual cycle when a mature egg is released from the ovary into the oviduct. The cycle repeats approximately every 28 days if fertilisation does not occur.'),
  t(6, '### Fertilisation, Pregnancy, and Birth\n\n**Copulation:** During copulation, the erect penis is inserted into the vagina and semen (containing sperm) is released (ejaculation).\n\n**Fertilisation:** The fusion of the sperm and egg, producing a **zygote**.\n\n**Implantation:** If fertilisation takes place, the fertilised egg (zygote) implants in the thick lining of the uterus.\n\n**The placenta:**\n- The developing embryo/foetus is attached to the uterus wall by the **placenta**.\n- The placenta plays a vital role: it provides the foetus with oxygen and nutrients from the mother\'s blood and removes carbon dioxide and waste.\n- The mother\'s blood and the foetus\'s blood do NOT mix directly.\n\n**Gestation:** The stage of pregnancy in humans is about **40 weeks** (approximately 9 months).\n\n**Birth:** At the end of pregnancy, the muscles of the uterus contract, the cervix dilates, and the baby is pushed out through the vagina.'),
  q(7, 'What is the main function of the placenta during pregnancy?',
    ['It produces sperm cells', 'It exchanges nutrients, oxygen, and waste between mother and foetus', 'It stores the egg before fertilisation', 'It produces breast milk'], 1,
    'The placenta is the organ that connects the developing foetus to the uterine wall. It allows exchange of nutrients, oxygen, and waste products between the mother\'s blood and the foetus\'s blood without the two blood supplies mixing directly.'),
  t(8, '### Contraception and Health Issues\n\n**Contraception** means preventing pregnancy. Methods include:\n- **Condoms** — a barrier method that also prevents the transmission of sexually transmitted infections (STIs) including HIV/AIDS.\n- Other methods include the contraceptive pill, injections, and intrauterine devices (IUDs).\n\n**Sexually transmitted infections (STIs):**\n- STIs are spread through sexual contact.\n- Examples: HIV/AIDS, gonorrhoea, syphilis, chlamydia.\n- **HIV/AIDS** is a major health concern in South Africa. HIV attacks the immune system, making the body vulnerable to infections.\n- Condoms, when used effectively, help prevent the transmission of HIV and other STIs.\n\n**Health issues related to reproduction:**\n- Infertility\n- Foetal alcohol syndrome (caused by alcohol use during pregnancy)\n- The effects of smoking and drug abuse on the developing foetus'),
  fb(9, 'Condoms are a barrier method of contraception that also help prevent the spread of ___ (sexually transmitted infections). The virus that causes AIDS is called ___.',
    ['STIs', 'HIV'],
    'Condoms provide a physical barrier that prevents sperm from reaching the egg and also blocks the transmission of sexually transmitted infections. HIV (Human Immunodeficiency Virus) attacks the immune system and, if untreated, leads to AIDS.'),
  q(10, 'Which of the following is an effect of alcohol abuse during pregnancy?',
    ['Increased birth weight', 'Foetal alcohol syndrome', 'Stronger immune system in the baby', 'Faster development of the foetus'], 1,
    'Foetal alcohol syndrome is a serious condition caused by alcohol consumption during pregnancy. It can cause birth defects, learning difficulties, and developmental problems in the baby. Pregnant women should avoid alcohol completely.'),
];

// =============================================================================
// CHAPTER 3: Digestive System (Term 1 — Life and Living)
// =============================================================================
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## The Digestive System\n\n### Why We Need to Digest Food\n\nThe **digestive system** breaks down food into dissolved nutrients that can be absorbed into the blood and transported to cells throughout the body.\n\nFood contains important components:\n- **Proteins** — for growth and repair of cells\n- **Carbohydrates** — for energy (starch, sugars)\n- **Fats and oils** — for energy storage, insulation, and cell membranes\n- **Vitamins and minerals** — for healthy body functioning\n- **Fibre** — for healthy digestion (roughage)\n- **Water** — for all body processes\n\n### The Alimentary Canal\n\nThe alimentary canal is the continuous tube through which food passes:\n\n**Mouth → Oesophagus → Stomach → Small intestine → Large intestine → Rectum → Anus**\n\nFood is moved along the alimentary canal by **peristalsis** — wave-like contractions of the muscular walls of the digestive organs.'),
  t(2, '### Two Types of Digestion\n\nThere are two types of digestion:\n\n**1. Mechanical digestion:**\n- The physical breaking, crushing, and mashing of food into smaller pieces.\n- This increases the surface area for enzymes to work on.\n- Examples: chewing (teeth), churning (stomach muscles).\n\n**2. Chemical digestion:**\n- The breakdown of large food molecules into smaller, soluble molecules by **digestive enzymes** and **hydrochloric acid**.\n- Enzymes are biological catalysts that speed up chemical reactions.\n- Examples: salivary amylase breaks down starch in the mouth; hydrochloric acid and enzymes break down proteins in the stomach.\n\n*Note: No detail of specific enzymes is required at Grade 9 level.*'),
  q(3, 'What is the difference between mechanical and chemical digestion?',
    ['Mechanical digestion uses enzymes; chemical digestion uses teeth', 'Mechanical digestion physically breaks food into smaller pieces; chemical digestion uses enzymes and acids to break down molecules', 'There is no difference — they are the same process', 'Mechanical digestion occurs in the stomach only; chemical digestion occurs in the mouth only'], 1,
    'Mechanical digestion is the physical breakdown of food (e.g., chewing, churning). Chemical digestion involves enzymes and acids that break large molecules into smaller, soluble ones that can be absorbed.'),
  t(4, '### Structure and Function of the Alimentary Canal\n\n| Part | What Happens |\n|------|-------------|\n| **Mouth** | Teeth chew food (mechanical); saliva moistens food and begins starch digestion (chemical) |\n| **Oesophagus** | Peristalsis moves the food bolus to the stomach |\n| **Stomach** | Churning mixes food with gastric juice (HCl and enzymes); proteins begin to be digested |\n| **Small intestine** | Chemical digestion is completed; nutrients are absorbed into the blood through the wall of the small intestine |\n| **Large intestine** | Water and minerals are absorbed; bacteria produce some vitamins |\n| **Rectum** | Faeces (undigested food) are stored |\n| **Anus** | Faeces are egested (expelled from the body) |\n\nThe structure of each part of the alimentary canal is adapted to its function. For example, the small intestine has a very large inner surface area for efficient absorption of nutrients.'),
  fb(5, 'Food is moved along the alimentary canal by wave-like muscle contractions called ___. In the stomach, food is mixed with ___ acid.',
    ['peristalsis', 'hydrochloric'],
    'Peristalsis is the rhythmic contraction and relaxation of the muscles in the walls of the digestive tract, pushing food along. The stomach produces hydrochloric acid (HCl) which helps break down food and kills harmful bacteria.'),
  t(6, '### Healthy Diet\n\nA **balanced diet** includes all the food groups in the correct proportions:\n- **Proteins** — meat, fish, eggs, beans, lentils\n- **Carbohydrates** — bread, rice, pasta, potatoes\n- **Fats and oils** — butter, oil, nuts, avocado\n- **Vitamins** — fruits and vegetables\n- **Minerals** — dairy (calcium), red meat (iron), bananas (potassium)\n- **Fibre** — whole grains, fruits, vegetables\n- **Water** — essential for all body processes\n\n**Health issues related to diet:**\n- **Ulcers** — sores in the lining of the stomach or intestine\n- **Anorexia nervosa** — an eating disorder involving extreme food restriction\n- **Diarrhoea** — frequent, watery stools, often caused by infection\n- **Liver cirrhosis** — damage to the liver, often caused by excessive alcohol consumption\n\nEating too much fast food and unhealthy snacks can lead to obesity, heart disease, and diabetes.'),
  q(7, 'Why is fibre (roughage) important in a healthy diet?',
    ['It provides energy for cells', 'It helps move food through the digestive system and prevents constipation', 'It builds muscle tissue', 'It carries oxygen in the blood'], 1,
    'Fibre (roughage) is the indigestible part of plant foods. It adds bulk to food, helping it move through the digestive system by peristalsis. A diet low in fibre can lead to constipation and other digestive problems.'),
  q(8, 'In which part of the digestive system are most nutrients absorbed into the blood?',
    ['Stomach', 'Mouth', 'Small intestine', 'Large intestine'], 2,
    'The small intestine is the main site of nutrient absorption. Its inner wall has a very large surface area (due to folds and villi) which allows efficient absorption of digested nutrients into the blood.'),
  fb(9, 'A balanced diet must include proteins, ___, fats, vitamins, minerals, fibre, and water. The disease caused by excessive alcohol intake that damages the liver is called ___.',
    ['carbohydrates', 'cirrhosis'],
    'Carbohydrates are an essential energy source in a balanced diet. Cirrhosis is a condition where the liver becomes scarred and damaged, often due to long-term alcohol abuse, reducing its ability to function.'),
  q(10, 'Which of the following dietary components is needed for growth and repair of body cells?',
    ['Carbohydrates', 'Fibre', 'Proteins', 'Water'], 2,
    'Proteins are made up of amino acids, which are the building blocks used for growth, repair, and maintenance of body tissues. Good protein sources include meat, fish, eggs, beans, and lentils.'),
];

// =============================================================================
// CHAPTER 4: Compounds and Chemical Reactions (Term 2 — Matter and Materials)
// =============================================================================
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## The Periodic Table and Compounds\n\n### Review: Elements, Compounds, and Mixtures\n\nAll matter is made up of atoms. An **element** is a pure substance made of only one type of atom. A **compound** is a pure substance made of two or more different elements chemically bonded together. A **mixture** contains two or more substances that are not chemically bonded.\n\n### The Periodic Table\n\nThe **Periodic Table of Elements** is a reference tool that organises all known elements.\n\n**Key features:**\n- Elements are classified as **metals**, **non-metals**, and **semi-metals**.\n- Elements in the same **group** (vertical column) have similar chemical properties.\n- Each element has its own block on the table showing:\n  - **Atomic number** (smaller number) — the number of protons in the nucleus\n  - **Mass number** (larger number) — the total number of protons and neutrons\n  - **Symbol** — one or two letters (e.g., Fe for iron, Na for sodium)\n  - **Name** of the element\n\n*Note: Use the Periodic Table as a reference tool for the topics that follow.*'),
  t(2, '### Names of Compounds\n\nMany compounds are named according to the elements they contain:\n- **Sodium chloride (NaCl)** — table salt, made of sodium and chlorine\n- **Water (H\u2082O)** — made of hydrogen and oxygen\n- **Ammonia (NH\u2083)** — made of nitrogen and hydrogen\n\nSome compounds have special names based on the number of atoms:\n- **Carbon monoxide (CO)** — *mono* means ONE oxygen atom bonded to carbon\n- **Carbon dioxide (CO\u2082)** — *di* means TWO oxygen atoms bonded to carbon\n- **Sulfur trioxide (SO\u2083)** — *tri* means THREE oxygen atoms bonded to sulfur\n\n### Formulae of Compounds\n\nA **chemical formula** shows the ratio of atoms of each element in a compound:\n- H\u2082O — 2 hydrogen atoms to 1 oxygen atom\n- CO\u2082 — 1 carbon atom to 2 oxygen atoms\n- NaCl — 1 sodium atom to 1 chlorine atom\n- CaCO\u2083 (calcium carbonate) — 1 calcium, 1 carbon, 3 oxygen atoms'),
  q(3, 'What does the formula H\u2082O tell us about a molecule of water?',
    ['It contains 2 oxygen atoms and 1 hydrogen atom', 'It contains 2 hydrogen atoms and 1 oxygen atom', 'It contains 2 water molecules', 'It contains hydrogen and oxygen that are not bonded'], 1,
    'The subscript number after each element symbol tells us how many atoms of that element are in one molecule. H\u2082O means 2 hydrogen atoms bonded to 1 oxygen atom. When there is no subscript, it means 1 atom.'),
  fb(4, 'In the compound carbon dioxide (CO\u2082), the prefix "di" means ___. The formula shows that one carbon atom is bonded to ___ oxygen atoms.',
    ['two', '2'],
    'The prefix "di-" comes from Greek and means "two." In CO\u2082, one carbon atom is chemically bonded to two oxygen atoms. Similarly, "mono" means one and "tri" means three.'),
  t(5, '### Chemical Equations\n\nA **chemical reaction** occurs when substances (reactants) are rearranged to form new substances (products).\n\nChemical reactions can be represented using **chemical equations**:\n\n**Word equation:**\ncarbon + oxygen → carbon dioxide\n\n**Chemical equation:**\nC + O\u2082 → CO\u2082\n\n**Another example:**\nhydrogen + oxygen → water\n2H\u2082 + O\u2082 → 2H\u2082O\n\n**Key points about chemical equations:**\n- The **subscript** number shows the number of atoms of an element in a molecule (e.g., O\u2082 means 2 oxygen atoms).\n- The **coefficient** (large number in front) shows the number of molecules (e.g., 2H\u2082O means 2 molecules of water).\n- No atoms are lost or gained in a chemical reaction — they are simply rearranged.'),
  q(6, 'In the equation 2H\u2082 + O\u2082 → 2H\u2082O, what does the "2" in front of H\u2082 represent?',
    ['2 atoms of hydrogen', '2 molecules of hydrogen', '2 protons', 'The atomic number of hydrogen'], 1,
    'The large number in front of a chemical formula (the coefficient) indicates the number of molecules. 2H\u2082 means two molecules of hydrogen gas. Each molecule of H\u2082 contains 2 hydrogen atoms, so there are 4 hydrogen atoms in total.'),
  t(7, '### Balanced Chemical Equations\n\nChemical equations must be **balanced** — the total number and type of atoms of each element must be the same on both sides of the equation.\n\n**Examples of balanced equations:**\n\n| Word equation | Balanced chemical equation |\n|---------------|---------------------------|\n| Iron + oxygen → iron oxide | 4Fe + 3O\u2082 → 2Fe\u2082O\u2083 |\n| Magnesium + oxygen → magnesium oxide | 2Mg + O\u2082 → 2MgO |\n| Copper + oxygen → copper oxide | 2Cu + O\u2082 → 2CuO |\n\n*Note: Grade 9 learners must write the names AND the chemical symbols of all substances in reactions. They must also identify the relevant elements on the Periodic Table.*\n\n**Why must equations be balanced?**\nBecause atoms cannot be created or destroyed in a chemical reaction. The law of conservation of mass states that the total mass of the reactants equals the total mass of the products.'),
  fb(8, 'In a balanced equation, the number of atoms of each element on the ___ side must equal the number on the ___ side.',
    ['reactant', 'product'],
    'The law of conservation of mass requires that atoms are neither created nor destroyed in a chemical reaction. Therefore, a balanced equation has equal numbers of each type of atom on both sides of the arrow.'),
  q(9, 'Which balanced equation correctly represents the reaction of magnesium with oxygen?',
    ['Mg + O → MgO', '2Mg + O\u2082 → 2MgO', 'Mg + O\u2082 → MgO\u2082', 'Mg\u2082 + O → Mg\u2082O'], 1,
    '2Mg + O\u2082 → 2MgO is correct. Oxygen exists as a diatomic molecule (O\u2082). Two magnesium atoms react with one oxygen molecule to form two units of magnesium oxide. The atoms balance: 2 Mg and 2 O on each side.'),
  q(10, 'In a chemical reaction, what happens to the atoms of the reactants?',
    ['They are destroyed and new atoms are created', 'They are rearranged to form new substances', 'They disappear completely', 'They increase in number'], 1,
    'In a chemical reaction, no atoms are lost or gained. The atoms of the reactants are rearranged to form the products. This is why chemical equations must be balanced — the same atoms that go in must come out, just in a different arrangement.'),
];

// =============================================================================
// CHAPTER 5: Reactions of Metals with Oxygen (Term 2 — Matter and Materials)
// =============================================================================
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Reactions of Metals with Oxygen\n\n### The General Reaction\n\nSome metals react with oxygen during burning (combustion). When a metal reacts with oxygen, a **metal oxide** is formed as a product.\n\n**General equation:**\nmetal + oxygen → metal oxide\n\n### Reaction of Iron with Oxygen\n\nWhen iron burns in air (which contains oxygen), the reaction forms **iron oxide** as a product:\n\n- **Word equation:** iron + oxygen → iron oxide\n- **Chemical equation:** Fe + O\u2082 → Fe\u2082O\u2083 (unbalanced)\n- **Balanced equation:** 4Fe + 3O\u2082 → 2Fe\u2082O\u2083\n\n### Reaction of Magnesium with Oxygen\n\nWhen magnesium is burnt in air, it reacts with oxygen to form **magnesium oxide**. This reaction produces a very bright white light.\n\n- **Word equation:** magnesium + oxygen → magnesium oxide\n- **Chemical equation:** 2Mg + O\u2082 → 2MgO\n\nMagnesium oxide is a white powder.'),
  q(2, 'What is the product when iron reacts with oxygen?',
    ['Iron chloride', 'Iron oxide', 'Iron sulfate', 'Iron hydroxide'], 1,
    'When iron reacts with oxygen, the product is iron oxide (Fe\u2082O\u2083). Metal + oxygen always produces a metal oxide. Iron oxide is the chemical name for rust.'),
  t(3, '### Rusting of Iron\n\n**Rusting** is a slow chemical reaction in which iron reacts with **oxygen** and **moisture (water)** to form a complex compound called **iron oxide** (rust).\n\n**Conditions for rusting:**\n- Both oxygen and water must be present.\n- Rust only forms on the **surface** of the iron that is exposed to air.\n\n**Rust is a form of corrosion.** It weakens iron and steel structures. Steel (which is mostly iron) is an essential material in modern construction — buildings, bridges, cars, and machinery all use steel.\n\n**In South Africa**, rusting is a significant economic problem because it damages infrastructure, vehicles, and industrial equipment.'),
  t(4, '### Preventing Rust\n\nSince rusting requires both oxygen and water, prevention methods work by keeping these away from the iron surface:\n\n| Method | How It Works |\n|--------|-------------|\n| **Painting** | Creates a barrier that keeps moisture and oxygen away from the iron |\n| **Oiling/greasing** | Coating with oil prevents contact with water and air |\n| **Galvanising** | Coating iron or steel with a thin layer of zinc. Even if the zinc layer is scratched, zinc corrodes preferentially (sacrificial protection) |\n| **Electroplating** | Coating iron with a thin layer of chromium or another metal using electrolysis |\n| **Using stainless steel** | An alloy of iron with chromium and nickel that resists corrosion |\n\nIn South Africa, galvanised roofing sheets and painted steel structures are commonly used to combat rusting in both urban and rural areas.'),
  q(5, 'Which TWO substances are needed for iron to rust?',
    ['Oxygen and carbon dioxide', 'Water and salt', 'Oxygen and water (moisture)', 'Nitrogen and water'], 2,
    'Rusting requires both oxygen and water (moisture). If either one is absent, rusting does not occur. This is why iron stored in dry conditions or coated with paint does not rust easily.'),
  fb(6, 'Rusting is a slow chemical reaction where iron reacts with oxygen and ___ to form iron oxide. Coating iron with a layer of zinc to prevent rusting is called ___.',
    ['water', 'galvanising'],
    'Water (moisture) and oxygen are both essential for rusting. Galvanising involves dipping iron or steel into molten zinc. The zinc layer protects the iron by acting as a barrier and by corroding preferentially (sacrificial protection).'),
  t(7, '## Reactions of Non-Metals with Oxygen\n\n### The General Reaction\n\nNon-metals also react with oxygen to form **non-metal oxides**.\n\n**General equation:**\nnon-metal + oxygen → non-metal oxide\n\n### Reaction of Carbon with Oxygen\n\nWhen carbon is burnt in excess oxygen, **carbon dioxide** is produced:\n- **Word equation:** carbon + oxygen → carbon dioxide\n- **Chemical equation:** C + O\u2082 → CO\u2082\n\n### Reaction of Sulfur with Oxygen\n\nWhen sulfur is burnt in oxygen, **sulfur dioxide** is produced:\n- **Word equation:** sulfur + oxygen → sulfur dioxide\n- **Chemical equation:** S + O\u2082 → SO\u2082\n\n**Important environmental connection:** When fossil fuels (coal, oil) are burnt in power stations and vehicles, sulfur dioxide and carbon dioxide are released into the atmosphere. These gases contribute to **acid rain** and the **greenhouse effect**.'),
  q(8, 'What is produced when sulfur burns in oxygen?',
    ['Sulfur chloride', 'Sulfuric acid', 'Sulfur dioxide', 'Sulfur trioxide'], 2,
    'When sulfur reacts with oxygen, sulfur dioxide (SO\u2082) is produced. S + O\u2082 → SO\u2082. Sulfur dioxide is a pollutant gas that contributes to acid rain when it dissolves in rainwater.'),
  fb(9, 'When non-metals react with oxygen, they form non-metal ___. Burning fossil fuels releases carbon dioxide and sulfur dioxide, which can cause ___ rain.',
    ['oxides', 'acid'],
    'Non-metal oxides are formed when non-metals react with oxygen (e.g., CO\u2082, SO\u2082). These oxides dissolve in rainwater to form weak acids, producing acid rain which damages buildings, plants, and aquatic ecosystems.'),
  q(10, 'Which balanced equation correctly represents carbon burning in oxygen?',
    ['C + O → CO', 'C + O\u2082 → CO\u2082', '2C + O\u2082 → 2CO', 'C\u2082 + O\u2082 → 2CO'], 1,
    'C + O\u2082 → CO\u2082 is the correct balanced equation. One carbon atom reacts with one molecule of oxygen (O\u2082) to produce one molecule of carbon dioxide. The equation is already balanced: 1 C and 2 O on each side.'),
];

// =============================================================================
// CHAPTER 6: Acids, Bases, and pH (Term 2 — Matter and Materials)
// =============================================================================
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Acids, Bases, and pH\n\n### What Are Acids and Bases?\n\n**Acids** are substances that produce hydrogen ions (H\u207a) when dissolved in water. They taste sour and are corrosive.\n\n**Bases** are substances that react with acids to neutralise them. Bases that dissolve in water are called **alkalis**.\n\n**Common acids:**\n- Hydrochloric acid (HCl) — used in laboratories and industry\n- Sulfuric acid (H\u2082SO\u2084) — used in car batteries and manufacturing\n- Vinegar (acetic acid) — used in cooking\n- Citric acid — found in lemons and oranges\n- Tartaric acid — found in grapes\n\n**Common bases:**\n- Sodium hydroxide (NaOH) — used in soap-making\n- Magnesium hydroxide — used in antacid medicine\n- Calcium hydroxide — used in agriculture to treat acidic soil\n- Bicarbonate of soda (sodium bicarbonate) — used in baking and cleaning\n- Metal carbonates — e.g., calcium carbonate (CaCO\u2083) in limestone'),
  t(2, '### The pH Scale\n\nThe **pH scale** measures how acidic or basic a substance is. It ranges from **1 to 14**.\n\n| pH Value | Classification | Examples |\n|----------|---------------|----------|\n| 1–6 | Acid | Lemon juice (pH 2), vinegar (pH 3), black coffee (pH 5) |\n| 7 | Neutral | Pure water |\n| 8–14 | Base (alkaline) | Baking soda (pH 9), soapy water (pH 10), bleach (pH 13) |\n\n**Key points:**\n- **Strong acids** have very low pH values (1–2), e.g., hydrochloric acid\n- **Strong bases** have very high pH values (13–14), e.g., sodium hydroxide\n- A **neutral** substance has a pH of exactly **7**\n\n### Chemical Indicators\n\nIndicators are substances that change colour depending on whether a solution is acidic, basic, or neutral.\n\n| Indicator | In Acid | In Neutral | In Base |\n|-----------|---------|------------|--------|\n| Litmus paper | Red | Purple | Blue |\n| Red cabbage water | Red/pink | Purple | Blue/green |\n| Turmeric water | Yellow | Yellow | Red/brown |\n| Bromothymol blue | Yellow | Green | Blue |\n| Phenolphthalein | Colourless | Colourless | Pink |\n| Universal indicator | Red/orange/yellow | Green | Blue/purple |\n\n**Universal indicator** can show the full range of pH values by changing to different colours across the scale.'),
  q(3, 'A substance has a pH of 3. What can you conclude about it?',
    ['It is a strong base', 'It is neutral', 'It is an acid', 'It is pure water'], 2,
    'A pH of 3 indicates an acid. The pH scale runs from 1 to 14: values below 7 are acidic, 7 is neutral, and values above 7 are basic (alkaline). A pH of 3 is quite strongly acidic.'),
  fb(4, 'A neutral substance has a pH of ___. Universal indicator turns red or orange in ___ solutions.',
    ['7', 'acidic'],
    'pH 7 is neutral (e.g., pure water). Universal indicator changes colour across the full pH range — red/orange in strongly acidic solutions, green in neutral solutions, and blue/purple in basic (alkaline) solutions.'),
  t(5, '### Neutralisation Reactions\n\nWhen an acid and a base react together, they **neutralise** each other. This is called a **neutralisation reaction**.\n\n**General equation:**\nacid + base → salt + water\n\n**What happens during neutralisation:**\n- A base reacts with an acid, making the solution less acidic (higher pH).\n- An acid reacts with a base, making the solution less basic (lower pH).\n- The resulting pH depends on the strength of the acid and the base.\n\n**Everyday examples of neutralisation:**\n- Taking an **antacid** (base) to relieve heartburn (excess stomach acid)\n- Adding **lime (calcium hydroxide)** to acidic soil in farming\n- Using **bicarbonate of soda** to neutralise bee stings (acidic)\n- Using **vinegar** (acid) to neutralise wasp stings (basic)'),
  q(6, 'What are the products of a neutralisation reaction?',
    ['Acid and base', 'Salt and water', 'Metal oxide and acid', 'Hydrogen and oxygen'], 1,
    'When an acid reacts with a base, the products are always a salt and water. For example: HCl + NaOH → NaCl + H\u2082O. The specific salt formed depends on the acid and base used.'),
  t(7, '### Reactions of Acids with Metal Oxides (Bases)\n\nMetal oxides are **bases** — they react with acids to form a **salt** and **water**.\n\n**General equation:**\nacid + metal oxide → salt + water\n\n**Example:**\n- **Word equation:** hydrochloric acid + magnesium oxide → magnesium chloride + water\n- **Balanced chemical equation:** 2HCl + MgO → MgCl\u2082 + H\u2082O\n\n**Note:** The type of salt formed depends on:\n- The **acid** used (HCl gives chlorides, H\u2082SO\u2084 gives sulfates)\n- The **metal oxide** used (MgO gives magnesium salts, CuO gives copper salts)\n\n### Applications\n\n- Burning wood and fossil fuels releases CO\u2082 and SO\u2082 into the atmosphere.\n- These gases combine with water in the atmosphere to produce **acid rain**.\n- Acid rain damages buildings (especially limestone and marble), harms plants, and makes lakes and rivers too acidic for aquatic life.\n- **Limestone (CaCO\u2083)** is used in agriculture to neutralise acidic soil, improving crop growth.'),
  q(8, 'What salt is formed when hydrochloric acid reacts with magnesium oxide?',
    ['Magnesium sulfate', 'Magnesium carbonate', 'Magnesium chloride', 'Sodium chloride'], 2,
    'When hydrochloric acid (HCl) reacts with magnesium oxide (MgO), the products are magnesium chloride (MgCl\u2082) and water. HCl always forms chloride salts.'),
  fb(9, 'Non-metal oxides tend to be ___ (low pH), while bases include metal oxides, metal hydroxides, and metal ___.',
    ['acidic', 'carbonates'],
    'Non-metal oxides (like CO\u2082 and SO\u2082) dissolve in water to form acids, so they are acidic. Bases include metal oxides (e.g., MgO), metal hydroxides (e.g., NaOH), and metal carbonates (e.g., CaCO\u2083).'),
  q(10, 'Why is limestone (CaCO\u2083) added to acidic soil in South African farming?',
    ['To make the soil more acidic', 'To neutralise the acid and raise the pH for better crop growth', 'To add nitrogen to the soil', 'To prevent rusting of farm equipment'], 1,
    'Limestone (calcium carbonate) is a base that neutralises excess acid in the soil. By raising the pH closer to neutral, it creates better conditions for crop growth. This is a common practice in South African agriculture, especially in the Western Cape.'),
];

// =============================================================================
// CHAPTER 7: Forces (Term 3 — Energy and Change)
// =============================================================================
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Forces\n\n### What Is a Force?\n\nA **force** is a push, pull, or twist exerted on an object. Forces can change the **shape**, **direction**, or **speed** of an object.\n\n- Force is measured in units called **newtons (N)**.\n- Forces always act in pairs — when two objects interact, they exert forces on each other.\n\n### Two Types of Forces\n\nAll forces can be classified into two broad groups:\n\n**1. Contact forces** — result from direct physical contact between objects:\n- **Friction** — opposes motion between surfaces in contact\n- **Tension** — pulling force in a rope, string, or cable\n- **Compression** — pushing force that squeezes an object\n- **Normal force** — support force from a surface\n\n**2. Field forces (non-contact forces)** — act at a distance without touching:\n- **Gravitational force** — attraction between masses\n- **Magnetic force** — attraction or repulsion between magnets or magnetic materials\n- **Electrostatic force** — attraction or repulsion between charged objects'),
  q(2, 'Which of the following is a non-contact (field) force?',
    ['Friction', 'Tension', 'Gravitational force', 'Compression'], 2,
    'Gravitational force is a field (non-contact) force because it acts at a distance between objects without them needing to touch. The Earth pulls objects toward it by gravity without direct contact. Friction, tension, and compression all require direct contact.'),
  t(3, '### Gravitational Force\n\n**Gravity** is the force of attraction (pull) between any two objects that have mass. The greater the mass, the greater the gravitational pull.\n\n**Key facts about gravity:**\n- The force of gravity is measured in **newtons (N)**.\n- The **weight** of an object is the gravitational force exerted on it by the Earth (or the Moon, or another planet). Weight is measured in newtons.\n- The **mass** of an object is the amount of matter in it. Mass is measured in kilograms (kg).\n- Mass stays the same no matter where you are. Weight changes depending on the gravitational field strength.\n\n**Example:** An astronaut has the same mass on Earth and on the Moon, but weighs less on the Moon because the Moon\'s gravitational pull is weaker.\n\n| Property | Mass | Weight |\n|----------|------|--------|\n| Definition | Amount of matter | Gravitational force on an object |\n| Unit | Kilograms (kg) | Newtons (N) |\n| Changes with location? | No | Yes |\n| Measured with | Balance/scale | Spring balance (newton meter) |'),
  fb(4, 'The force of gravity is measured in ___. An object\'s ___ stays the same everywhere, but its weight changes depending on gravitational field strength.',
    ['newtons', 'mass'],
    'Force (including weight) is measured in newtons (N). Mass is the amount of matter in an object, measured in kilograms, and it remains constant regardless of location. Weight depends on gravitational field strength, so it differs on Earth vs. the Moon.'),
  q(5, 'An astronaut has a mass of 80 kg. What happens to her mass and weight when she travels from Earth to the Moon?',
    ['Both mass and weight decrease', 'Mass stays the same; weight decreases', 'Mass decreases; weight stays the same', 'Both mass and weight stay the same'], 1,
    'Mass is the amount of matter and does not change with location — it stays 80 kg. Weight is the gravitational force and depends on the gravitational field strength, which is weaker on the Moon (about 1/6 of Earth\'s), so her weight decreases.'),
  t(6, '### Magnetic Force\n\n**Magnets** attract magnetic substances including iron, steel, cobalt, and nickel.\n\n**Key facts:**\n- All magnets have two **poles**: a **north pole** and a **south pole**.\n- **Opposite poles attract** (north and south pull toward each other).\n- **Like poles repel** (north-north or south-south push away from each other).\n- The force of magnetism is the push or pull force.\n- The Earth has a magnetic field — it behaves like a giant bar magnet. This is why compass needles point north.\n\n### Electrostatic Force\n\nWhen certain materials are rubbed together, they can acquire an **electrostatic charge** due to the transfer of electrons.\n\n**Key points:**\n- During rubbing, **electrons** move from one material to the other. Protons do NOT move.\n- The material that loses electrons becomes **positively charged**.\n- The material that gains electrons becomes **negatively charged**.\n- **Like charges repel** (+ and + repel; − and − repel).\n- **Unlike charges attract** (+ and − attract).\n- A **lightning strike** is a massive discharge of electrostatic charge between a cloud and the ground.'),
  q(7, 'What happens when two north poles of magnets are brought close together?',
    ['They attract each other', 'They repel each other', 'Nothing happens', 'They become demagnetised'], 1,
    'Like poles repel — two north poles (or two south poles) push each other away. Only unlike poles (north and south) attract each other. This is a fundamental property of magnetism.'),
  fb(8, 'When materials are rubbed together, ___ are transferred between them, causing one to become positively charged and the other negatively charged. Like charges ___ each other.',
    ['electrons', 'repel'],
    'Only electrons (negative charges) can move during rubbing. The material that loses electrons becomes positive; the material that gains electrons becomes negative. Like charges repel, and unlike charges attract.'),
  t(9, '### Lightning and Safety\n\nA **thunder cloud** becomes charged by the rubbing together of air and water particles. The energy comes from the work done during rubbing.\n\nA **lightning strike** occurs when there is a massive discharge (release) of electrostatic charge between the thunder cloud and the ground. Lightning is essentially a giant spark of electricity.\n\n**Safety precautions during lightning storms:**\n- Stay indoors or inside a car (the metal body conducts charge safely around you)\n- Do not stand under tall trees or near metal poles\n- Do not use electrical appliances connected to mains\n- Do not swim or stand in open water\n- If caught in the open, crouch low with feet together — do not lie flat\n\nIn South Africa, lightning strikes are a serious weather hazard, particularly in the summer thunderstorm regions of Gauteng, Mpumalanga, and KwaZulu-Natal.'),
  q(10, 'During a thunderstorm, why should you NOT shelter under a tall tree?',
    ['Trees attract rain', 'Lightning tends to strike tall objects, and the tree could be hit', 'Trees generate static electricity', 'The wind could blow the tree over'], 1,
    'Lightning tends to strike the tallest object in an area because it provides the shortest path to the ground. Standing under a tall tree puts you at risk if the tree is struck, as the electrical current can pass through the tree and into anyone nearby.'),
];

// =============================================================================
// CHAPTER 8: Electric Circuits (Term 3 — Energy and Change)
// =============================================================================
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Electric Cells and Resistance\n\n### Electric Cells as Energy Systems\n\nAn **electric cell** (battery) is a device that converts chemical energy into electrical energy. It causes an electric current to flow through a circuit.\n\n- A single cell provides a certain voltage (potential difference).\n- A **battery** is a group of cells connected together.\n- Cells are a source of **electricity** — the flow of electric charge through a conductor.\n\n### Conductors and Resistors\n\nAll conductors (even good ones) heat up when current passes through them. Some energy is "lost" as **heat**. All conductors have some **resistance**.\n\nA **resistor** is a conducting material chosen specifically to control the current or to provide useful energy transfer:\n- **Light bulbs** — resistance causes the filament to glow and produce light\n- **Heating elements** — resistance produces heat (e.g., in kettles, stoves)\n- **Rheostats** — variable resistors used to control current\n\n### Factors That Affect Resistance\n\n| Factor | Effect on Resistance |\n|--------|--------------------|\n| **Type of material** | Different materials have different resistances (copper is a good conductor; nichrome has high resistance) |\n| **Thickness** | Thinner wires have MORE resistance than thicker wires |\n| **Length** | Longer wires have MORE resistance than shorter wires |\n| **Temperature** | Hotter conductors generally have HIGHER resistance |'),
  q(2, 'Which factor would INCREASE the resistance of a wire?',
    ['Making it shorter', 'Making it thicker', 'Making it longer', 'Cooling it down'], 2,
    'Longer wires have more resistance because the electrons must travel further and encounter more collisions with atoms. Shorter wires, thicker wires, and cooler wires all have lower resistance.'),
  fb(3, 'A thinner wire has ___ resistance than a thicker wire. A longer wire has ___ resistance than a shorter wire.',
    ['more', 'more'],
    'Thinner wires restrict the flow of electrons more (higher resistance). Longer wires also increase resistance because the current must travel a greater distance through the material.'),
  t(4, '## Series and Parallel Circuits\n\n### Series Circuits\n\nIn a **series circuit**, components are connected one after another in a single loop.\n\n**Properties of series circuits:**\n- The **current** is the same at every point in the circuit.\n- The **total voltage** across the battery equals the sum of the voltages across each component.\n- A resistor with higher resistance has a higher voltage across it.\n- A resistor with lower resistance has a lower voltage across it.\n- If one component (e.g., a light bulb) breaks, the circuit is broken and all components stop working.\n- Adding more resistors in series **decreases** the total current.'),
  t(5, '### Parallel Circuits\n\nIn a **parallel circuit**, components are connected on separate branches.\n\n**Properties of parallel circuits:**\n- The **voltage** across each branch is the same as the voltage of the battery.\n- The **total current** from the battery equals the sum of the currents through each branch.\n- If one component breaks, the other branches continue to work (the rest of the lights stay on).\n- Adding more resistors in parallel **increases** the total current from the battery.\n\n**In our homes**, lights and appliances are connected in **parallel**. This means:\n- Each appliance gets the full mains voltage.\n- If one light bulb blows, the others stay on.\n- Each appliance can be switched on and off independently.'),
  q(6, 'In a series circuit with three light bulbs, what happens if one bulb breaks?',
    ['Only that bulb goes off', 'All three bulbs go off', 'The other two get brighter', 'Nothing happens'], 1,
    'In a series circuit, the components are in a single loop. If one component breaks, the circuit is broken and no current can flow. All bulbs go off. This is a disadvantage of series circuits.'),
  q(7, 'Why are household appliances connected in parallel rather than in series?',
    ['Parallel circuits use less electricity', 'Each appliance receives the full voltage and can be switched independently', 'Parallel circuits are cheaper to install', 'Series circuits are too dangerous for home use'], 1,
    'In parallel circuits, each branch receives the full battery/mains voltage, and appliances can be switched on and off independently. If one appliance fails, the others continue working. In series, one failure breaks the whole circuit.'),
  fb(8, 'In a series circuit, the current is the ___ at every point. In a parallel circuit, the voltage across each branch is the ___.',
    ['same', 'same'],
    'In a series circuit, there is only one path for current, so it is the same everywhere. In a parallel circuit, each branch is connected directly across the battery, so each branch has the same voltage as the battery.'),
  t(9, '### Electrical Safety\n\n**Safety devices in home circuits:**\n\n- **Fuses** — thin wires that melt and break the circuit if the current is too high, preventing overheating and fire.\n- **Circuit breakers** — switches that automatically trip (open) when current exceeds a safe level. They can be reset, unlike fuses.\n- **Earth leakage systems** — detect small current leaks to earth and cut the circuit, preventing electric shock.\n\n**The 3-pin plug:**\n- **Live wire** (brown) — carries the current from the supply\n- **Neutral wire** (blue) — completes the circuit\n- **Earth wire** (green and yellow) — safety wire connected to the metal casing of appliances\n\nThe earth wire provides a low-resistance path to the ground. If a fault causes the metal casing to become live, the large current flows through the earth wire, blowing the fuse or tripping the circuit breaker.\n\n**Illegal connections** to the Eskom mains supply are extremely dangerous and are regarded as energy theft. They can cause electrocution, fires, and explosions.'),
  q(10, 'What is the purpose of the earth wire in a 3-pin plug?',
    ['To carry the current to the appliance', 'To provide a safe path for current to flow to the ground if a fault occurs', 'To increase the voltage to the appliance', 'To reduce the electricity bill'], 1,
    'The earth wire is a safety wire connected to the metal casing of an appliance. If a fault causes the casing to become live (electrically charged), the earth wire provides a low-resistance path to the ground, causing a large current that blows the fuse or trips the circuit breaker, preventing electric shock.'),
];

// =============================================================================
// CHAPTER 9: Energy and the National Electricity Grid (Term 3 — Energy and Change)
// =============================================================================
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Electricity Generation and the National Grid\n\n### How Electricity Is Generated\n\nA **power station** is a system for generating electricity. Most power stations in South Africa burn **coal** as a fuel.\n\n**Process in a coal-fired power station:**\n1. Coal is burnt to boil water, producing **steam**.\n2. The high-pressure steam turns a **turbine** (a large spinning wheel with blades).\n3. The turbine turns a **generator**, which converts kinetic energy into electrical energy.\n4. The electricity is fed into the **national electricity grid**.\n\n**Other energy sources used to generate electricity:**\n\n| Source | Type | How It Works |\n|--------|------|-------------|\n| Coal | Non-renewable (fossil fuel) | Burnt to produce steam |\n| Nuclear (Koeberg, Cape Town) | Non-renewable | Nuclear fission heats water to produce steam |\n| Hydroelectric | Renewable | Falling water turns turbines |\n| Wind | Renewable | Wind turns turbine blades |\n| Solar | Renewable | Sunlight converted to electricity (photovoltaic cells) or heats water |\n| Waves/tidal | Renewable | Ocean movement drives generators |'),
  q(2, 'What type of fuel do most South African power stations use?',
    ['Natural gas', 'Nuclear fuel', 'Coal', 'Solar energy'], 2,
    'South Africa relies heavily on coal for electricity generation. Eskom operates numerous coal-fired power stations, mainly in Mpumalanga where large coal deposits are found. Coal is a fossil fuel and a non-renewable energy source.'),
  t(3, '### Nuclear Power in South Africa\n\n**Koeberg Nuclear Power Station** is located near Cape Town and is Africa\'s only nuclear power station.\n\n**How nuclear power works:**\n- **Radioactive fuel** (uranium) undergoes **nuclear fission** — the splitting of atomic nuclei.\n- This releases a large amount of heat energy.\n- The heat boils water to produce steam.\n- The steam turns a turbine, which turns a generator to produce electricity.\n- The electricity is fed into the national grid.\n\n**Advantages of nuclear power:**\n- Does not produce greenhouse gases during operation\n- Very large amounts of energy from a small amount of fuel\n\n**Disadvantages of nuclear power:**\n- Spent nuclear fuel (nuclear waste) remains radioactive for hundreds of years\n- Nuclear waste must be properly stored so it does not endanger life\n- Risk of nuclear accidents (though modern designs are very safe)\n- High building costs'),
  fb(4, 'South Africa\'s only nuclear power station is called ___, located near Cape Town. Nuclear power stations use the process of nuclear ___ to produce heat.',
    ['Koeberg', 'fission'],
    'Koeberg Nuclear Power Station has been operating since the 1980s near Cape Town. It uses nuclear fission — the splitting of uranium atoms — to generate the heat needed to produce steam, which drives turbines and generators.'),
  t(5, '### The National Electricity Grid\n\nThe **national electricity grid** is a network of interconnected parts that distributes electricity from power stations to consumers across the country.\n\n**How the grid works:**\n1. **Power stations** generate electricity and feed it into the grid at very **high voltages**.\n2. **Power lines (transmission lines)** carry electricity at high voltages over long distances. High voltage reduces energy losses during transmission.\n3. **Transformers** step down the voltage for local distribution to homes, schools, and businesses.\n4. About **15% of energy** is wasted due to heating of transmission lines and transformers.\n\n**Problems with the grid:**\n- **Power surges** — sudden increases in voltage that can damage appliances.\n- **Grid overload** — when demand exceeds supply, leading to **load shedding** (a common experience in South Africa managed by Eskom).\n- **Illegal connections** — dangerous and regarded as electricity theft.'),
  q(6, 'Why is electricity transmitted at high voltages in the national grid?',
    ['To make appliances work faster', 'To reduce energy losses in the transmission lines', 'To save on the cost of cables', 'Because power stations can only produce high voltages'], 1,
    'Transmitting electricity at high voltage (and correspondingly low current) reduces the amount of energy lost as heat in the power lines. Energy loss is proportional to the square of the current, so lower current means much less wasted energy.'),
  t(7, '### Cost of Electrical Power\n\n**Electrical power** is the rate at which electrical energy is supplied. It is measured in **watts (W)** or **kilowatts (kW)**.\n\n- 1 kilowatt (kW) = 1 000 watts\n- 1 watt = 1 joule of energy per second\n\n**Consumers pay for the quantity of electrical energy used**, measured in **kilowatt-hours (kWh)**.\n\n**Formula:**\nCost = power rating (kW) x time used (hours) x price per kWh\n\n**Example:**\nA 2 kW heater is used for 3 hours. Electricity costs R2.50 per kWh.\n- Energy used = 2 kW x 3 h = 6 kWh\n- Cost = 6 kWh x R2.50 = **R15.00**\n\n**Energy-saving tips:**\n- Use energy-efficient appliances (LED bulbs instead of incandescent bulbs)\n- Switch off appliances when not in use\n- Use solar water heaters where possible\n- Insulate geysers to reduce heat loss'),
  q(8, 'A 100 W light bulb is left on for 10 hours. How much energy does it use in kilowatt-hours?',
    ['1 000 kWh', '10 kWh', '1 kWh', '100 kWh'], 2,
    'First convert watts to kilowatts: 100 W = 0.1 kW. Then multiply by time: 0.1 kW x 10 h = 1 kWh. This is the amount of electrical energy consumed.'),
  fb(9, 'Electrical power is measured in ___ (W) or kilowatts (kW). Consumers pay for energy used, measured in ___.',
    ['watts', 'kilowatt-hours'],
    'Power (the rate of energy use) is measured in watts. The total energy consumed is measured in kilowatt-hours (kWh), which is power in kilowatts multiplied by time in hours. This is what appears on your electricity bill.'),
  q(10, 'Which of the following is a renewable energy source?',
    ['Coal', 'Natural gas', 'Nuclear (uranium)', 'Wind'], 3,
    'Wind is a renewable energy source because it will not run out. Coal, natural gas, and uranium are non-renewable — they exist in limited quantities and will eventually be exhausted. South Africa is investing in wind and solar farms to diversify its energy supply.'),
];

// =============================================================================
// CHAPTER 10: The Earth as a System (Term 4 — Planet Earth and Beyond)
// =============================================================================
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## The Earth as a System\n\n### Spheres of the Earth\n\nThe Earth can be understood as a complex system where all parts interact with each other.\n\n**Four spheres interact on or near the Earth\'s surface:**\n\n| Sphere | Description |\n|--------|------------|\n| **Lithosphere** | The solid outer layer of the Earth (crust and upper mantle) — rocks and soil |\n| **Hydrosphere** | All water on Earth in all its forms — oceans, rivers, lakes, groundwater, ice, and water vapour |\n| **Atmosphere** | The layer of gases surrounding the Earth — the air we breathe |\n| **Biosphere** | All living organisms — plants, animals, fungi, bacteria — and their interactions with the rocks, soil, air, and water |\n\nThese four spheres are interconnected. For example:\n- Plants (biosphere) take in CO\u2082 from the atmosphere and water from the hydrosphere.\n- Rocks (lithosphere) are weathered by water (hydrosphere) and organisms (biosphere).\n- Volcanoes (lithosphere) release gases into the atmosphere.'),
  q(2, 'Which sphere includes all the water on Earth?',
    ['Lithosphere', 'Atmosphere', 'Biosphere', 'Hydrosphere'], 3,
    'The hydrosphere includes all water on and near the Earth\'s surface — oceans, rivers, lakes, glaciers, groundwater, and even water vapour in the air. It interacts with all the other spheres.'),
  fb(3, 'The ___ is the solid outer layer of the Earth consisting of rocks and soil. The ___ includes all living organisms and their interactions with the environment.',
    ['lithosphere', 'biosphere'],
    'The lithosphere is the rocky outer layer (crust and uppermost mantle). The biosphere encompasses all life on Earth and the environments where organisms live, including parts of the lithosphere, hydrosphere, and atmosphere.'),
  t(4, '### The Lithosphere\n\nThe Earth consists of four concentric layers:\n1. **Inner core** — solid, extremely hot, mainly iron and nickel\n2. **Outer core** — liquid, mainly iron and nickel\n3. **Mantle** — semi-solid rock (magma), the thickest layer\n4. **Crust** — the thin, solid outermost layer\n\nThe **lithosphere** is the outermost part of the mantle together with the crust and the soil.\n\n**Minerals and rocks:**\n- Different combinations of elements and compounds form **minerals** such as copper, gold, and hematite (iron oxide).\n- The lithosphere contains valuable mineral resources that are important for South Africa\'s economy.\n\n### The Rock Cycle\n\nRocks are continuously formed, broken down, and re-formed in a process called the **rock cycle**.\n\n**Three types of rocks:**\n\n| Type | How Formed | Examples |\n|------|-----------|----------|\n| **Igneous** | Formed when molten rock (magma/lava) cools and solidifies | Granite (slow cooling), pumice (fast cooling) |\n| **Sedimentary** | Formed when layers of sediment are compressed over time | Sandstone, limestone, shale |\n| **Metamorphic** | Formed when existing rocks are changed by heat and pressure | Marble (from limestone), slate (from shale) |'),
  q(5, 'Marble is a metamorphic rock. From which rock is marble formed?',
    ['Granite', 'Sandstone', 'Limestone', 'Pumice'], 2,
    'Marble is formed when limestone (a sedimentary rock) is subjected to intense heat and pressure deep within the Earth. This process changes the texture and mineral structure of the rock, forming metamorphic rock.'),
  t(6, '### The Rock Cycle — Step by Step\n\nThe rock cycle describes how rocks change from one type to another over long periods of time:\n\n1. **Igneous rock formation:** Molten rock (magma) from the mantle pushes up through the crust. When it cools slowly underground, it forms coarse-grained rocks like **granite**. When magma escapes to the surface as lava (e.g., through a volcano) and cools rapidly, it forms fine-grained rocks like **pumice stone**.\n\n2. **Weathering and erosion:** Rocks on the Earth\'s surface are broken down by heat, cold, wind, water, and biological action into smaller particles.\n\n3. **Sedimentary rock formation:** Wind and water transport these particles to flood plains and the sea. Particles settle as sediments, are covered by more layers, and over millions of years the pressure compresses them into sedimentary rock (e.g., **sandstone**).\n\n4. **Metamorphic rock formation:** The pressure of many layers and the heat from magma changes the chemical structure of lower sedimentary rocks, forming metamorphic rock (e.g., **slate** from shale, **marble** from limestone).\n\n5. **Melting:** Some rock is pushed deep below the crust, melts, and becomes magma again — and the cycle continues.'),
  fb(7, 'Igneous rocks form when ___ cools and solidifies. Sedimentary rocks form when layers of ___ are compressed over long periods.',
    ['magma', 'sediment'],
    'Magma (molten rock) cools to form igneous rocks — slowly underground (granite) or rapidly at the surface (pumice). Sedimentary rocks form when eroded particles (sediments) accumulate in layers and are compressed and cemented together over millions of years.'),
  q(8, 'Which of the following correctly describes the rock cycle?',
    ['Rocks are formed once and never change', 'Rocks are continuously formed, broken down, and re-formed over time', 'Only igneous rocks can become sedimentary rocks', 'The rock cycle only occurs at volcanoes'], 1,
    'The rock cycle is a continuous natural process. All three rock types (igneous, sedimentary, metamorphic) can be transformed into any other type through processes like melting, weathering, erosion, deposition, compression, and metamorphism.'),
  q(9, 'What process breaks down rocks on the Earth\'s surface into smaller particles?',
    ['Metamorphism', 'Weathering', 'Melting', 'Crystallisation'], 1,
    'Weathering is the breakdown of rocks by physical (heat, frost, wind), chemical (acid rain, dissolving), and biological (plant roots, burrowing animals) processes. The resulting particles can then be transported by erosion.'),
  t(10, '### Extracting Ores and Minerals\n\nRock that contains a high concentration of a valuable mineral is called an **ore**.\n\n- The ore is removed from the crust by **mining**.\n- Some minerals (like sand, potash, and diamonds) can be used in their natural form.\n- Others require **refining** — a chemical or physical process to extract the useful material:\n  - **Iron** is extracted from iron ore (hematite) using a chemical process (smelting with carbon/coke)\n  - **Gold** is extracted from gold ore using a physical process (crushing and chemical treatment)\n\n**History of mining:**\n- Iron and copper extraction is thousands of years old.\n- South African archaeological sites in KwaZulu-Natal and Limpopo show evidence of ancient iron smelting — iron ore was heated with charcoal to produce lumps of iron.\n- Modern processes use coke (a form of carbon made from coal) mixed with other metals and iron to produce **steel**.'),
];

// =============================================================================
// CHAPTER 11: Mining and the Atmosphere (Term 4 — Planet Earth and Beyond)
// =============================================================================
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Mining in South Africa\n\n### Mining and Mineral Resources\n\nSouth Africa has some of the largest mineral reserves in the world. Mining is a major industry that contributes significantly to the economy, providing jobs and export revenue.\n\n**Key minerals mined in South Africa:**\n\n| Mineral | Where Mined | Uses |\n|---------|------------|------|\n| Gold | Gauteng (Witwatersrand), Free State | Jewellery, electronics, investment |\n| Platinum | Limpopo, North West (Bushveld Complex) | Catalytic converters, jewellery |\n| Coal | Mpumalanga, KwaZulu-Natal | Electricity generation, steel production |\n| Diamonds | Northern Cape, Free State | Jewellery, cutting tools |\n| Iron ore | Northern Cape (Sishen) | Steel production |\n| Chromium | Limpopo, North West | Stainless steel, chrome plating |\n| Manganese | Northern Cape | Steel alloys, batteries |'),
  t(2, '### Environmental Impact of Mining\n\nMining has significant negative effects on the environment:\n\n**1. Mine dumps and land degradation:**\n- Large quantities of waste rock and tailings are piled into mine dumps.\n- These dumps take up land that could be used for farming or housing.\n- Dust from mine dumps can cause respiratory diseases.\n\n**2. Water pollution:**\n- Acid mine drainage (AMD) occurs when sulfide minerals in waste rock react with water and air to produce sulfuric acid.\n- This acidic water contaminates rivers, dams, and groundwater.\n- AMD is a major problem in Gauteng and Mpumalanga.\n\n**3. Air pollution:**\n- Dust and harmful gases are released during mining and processing.\n- Coal mining and burning contribute to greenhouse gas emissions.\n\n**4. Damage to heritage and tourism sites:**\n- Mining can destroy areas of cultural, historical, or natural beauty.\n\n**5. Loss of biodiversity:**\n- Habitat destruction affects plants and animals.\n- Deforestation for mining removes ecosystems.\n\nMining companies are required by law to rehabilitate (restore) mined areas, but this is expensive and not always fully achieved.'),
  q(3, 'What is acid mine drainage (AMD)?',
    ['The use of acid to extract gold from ore', 'Acidic water produced when sulfide minerals in mine waste react with water and air', 'The drainage of acid from the atmosphere into mines', 'A method of cleaning mine equipment'], 1,
    'Acid mine drainage occurs when sulfide minerals exposed by mining react with oxygen and water to produce sulfuric acid. This acidic water then leaches into rivers and groundwater, contaminating water sources. It is a serious environmental problem in South Africa.'),
  fb(4, 'South Africa\'s coal is mainly mined in ___ province. Mining waste that produces acidic water when exposed to air and rain is called acid mine ___.',
    ['Mpumalanga', 'drainage'],
    'Mpumalanga has the largest concentration of coal mines in South Africa, supplying fuel for many of Eskom\'s coal-fired power stations. Acid mine drainage (AMD) is a major water pollution problem caused by chemical reactions in mining waste.'),
  t(5, '## The Atmosphere\n\n### Composition of the Atmosphere\n\nThe **atmosphere** is the mixture of gases held around the Earth by gravity.\n\n**Composition of dry air:**\n- Nitrogen (N\u2082): **78%**\n- Oxygen (O\u2082): **21%**\n- Carbon dioxide (CO\u2082): less than **1%**\n- Other gases: less than 1% (including water vapour, argon, and trace gases)\n\n**Key facts:**\n- The density of gas particles decreases as the distance from the Earth increases (the further from the Earth, the thinner the air).\n- The atmosphere is divided into four layers, each with a different **temperature gradient** (how temperature changes with altitude).\n\n### The Four Layers of the Atmosphere\n\n| Layer | Altitude | Key Features |\n|-------|----------|-------------|\n| **Troposphere** | 0–10 km | Where weather occurs; all animals and plants live here; temperature decreases with altitude; contains 70% of atmospheric mass |\n| **Stratosphere** | 10–50 km | Contains the ozone layer (O\u2083); temperature increases with altitude; aeroplanes fly here |\n| **Mesosphere** | 50–80 km | Very cold; meteors ("shooting stars") burn up here |\n| **Thermosphere** | 80–350+ km | Very thin air; International Space Station (ISS) orbits here; absorbs UV radiation and X-rays; reflects radio waves |'),
  q(6, 'In which layer of the atmosphere does weather occur?',
    ['Stratosphere', 'Mesosphere', 'Troposphere', 'Thermosphere'], 2,
    'The troposphere is the lowest layer of the atmosphere, extending from the surface to about 10 km. It is where all weather phenomena (rain, wind, clouds, storms) occur. It contains most of the atmosphere\'s mass and is where all animals and plants live.'),
  fb(7, 'The atmosphere is composed of approximately 78% ___ and 21% oxygen. The ___ layer contains the ozone layer that absorbs ultraviolet radiation from the Sun.',
    ['nitrogen', 'stratosphere'],
    'Nitrogen makes up about 78% of the atmosphere, followed by oxygen at 21%. The stratosphere (10–50 km altitude) contains the ozone layer (O\u2083), which absorbs harmful ultraviolet radiation from the Sun, protecting life on Earth.'),
  t(8, '### The Greenhouse Effect and Global Warming\n\nThe **greenhouse effect** is a natural phenomenon where certain gases in the atmosphere trap heat from the Sun, keeping the Earth warm enough to sustain life.\n\n**How it works:**\n1. The Sun\'s energy passes through the atmosphere and warms the Earth\'s surface.\n2. The Earth radiates heat (infrared radiation) back toward space.\n3. **Greenhouse gases** (CO\u2082, water vapour, methane) trap some of this heat, warming the atmosphere near the surface.\n4. Without the greenhouse effect, the Earth would be too cold for life.\n\n**The problem — global warming:**\n- Human activities (burning fossil fuels, deforestation, farming) have increased the concentration of greenhouse gases, especially CO\u2082 and methane.\n- This enhanced greenhouse effect leads to **global warming** — an increase in the average temperature of the atmosphere.\n\n**Consequences of global warming:**\n- **Climate change** — more extreme weather events\n- **Rising sea levels** — due to melting ice caps and thermal expansion of water\n- **Food shortages** — droughts and floods affect agriculture\n- **Mass extinctions** — species cannot adapt quickly enough to changing conditions'),
  q(9, 'Which of the following human activities contributes MOST to the increase in greenhouse gases?',
    ['Planting trees', 'Recycling plastic', 'Burning fossil fuels (coal, oil, gas)', 'Building wind farms'], 2,
    'Burning fossil fuels releases large amounts of carbon dioxide (CO\u2082) into the atmosphere. This is the single largest contributor to the enhanced greenhouse effect and global warming. South Africa\'s reliance on coal for electricity makes it a significant contributor.'),
  q(10, 'Why is the ozone layer important for life on Earth?',
    ['It produces oxygen for us to breathe', 'It absorbs harmful ultraviolet (UV) radiation from the Sun', 'It creates the greenhouse effect', 'It produces rain clouds'], 1,
    'The ozone layer (O\u2083) in the stratosphere absorbs most of the Sun\'s harmful ultraviolet radiation. Too much UV radiation can cause skin cancer, cataracts, and damage to photosynthesis and the life cycles of many organisms.'),
];

// =============================================================================
// CHAPTER 12: Birth, Life, and Death of Stars (Term 4 — Planet Earth and Beyond)
// =============================================================================
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Stars: Birth, Life, and Death\n\n### The Birth of a Star\n\nStars are not permanent — they exist for a finite period of time, from billions to trillions of years.\n\n**How a star is born:**\n1. Stars form inside huge clouds of gas (mostly hydrogen) and dust called **nebulae** (singular: nebula), far out in space.\n2. These nebulae are pulled together by **gravity** and slowly collapse.\n3. As the cloud contracts, it heats up.\n4. When the temperature at the centre becomes high enough (about 15 million degrees Celsius), **nuclear fusion** begins.\n5. In nuclear fusion, hydrogen atoms fuse (combine) to form **helium**, releasing enormous amounts of energy.\n6. This energy radiates out into space as light and heat — and a **star is born**.'),
  t(2, '### The Life of a Star\n\nOnce a star forms, it enters the main phase of its life. During this time, it fuses hydrogen into helium in its core.\n\n**Key facts about star life:**\n- Stars change in their appearance over **billions of years**.\n- The colour of a star indicates its surface temperature:\n  - **Blue stars** are the hottest and usually the youngest.\n  - **Red stars** are cooler and usually older.\n  - **Yellow stars** (like our Sun) are medium temperature.\n\n**Our Sun:**\n- The Sun is a **medium-sized yellow star**.\n- It is about **halfway through its life cycle** — approximately 4.6 billion years old with a lifespan of about 9–10 billion years.\n- For most of its life, a star fuses **hydrogen** into **helium**.\n- Later, as hydrogen runs low, stars like the Sun will swell up to become a **red giant**.'),
  q(3, 'What process produces the energy that makes a star shine?',
    ['Combustion (burning)', 'Nuclear fission', 'Nuclear fusion', 'Chemical reaction'], 2,
    'Stars produce energy through nuclear fusion — the process of combining (fusing) hydrogen atoms to form helium at extremely high temperatures and pressures. This releases vast amounts of energy as light and heat. Fusion is different from fission, which is the splitting of atoms.'),
  fb(4, 'Stars form inside huge clouds of gas and dust called ___. The process in which hydrogen atoms combine to form helium, releasing energy, is called nuclear ___.',
    ['nebulae', 'fusion'],
    'Nebulae are vast clouds of gas and dust in space where new stars are born. Nuclear fusion is the joining of light atomic nuclei (hydrogen) to form heavier nuclei (helium), releasing tremendous energy. This is the power source of all stars.'),
  t(5, '### The Death of a Star\n\nAll stars eventually run out of fuel. What happens next depends on the size of the star.\n\n**For stars like our Sun (medium-sized):**\n1. The star swells into a **red giant** as it begins fusing heavier elements.\n2. The outer layers of gas are ejected into space, forming an expanding cloud called a **planetary nebula**.\n3. The core contracts to become a small, dense, hot remnant called a **white dwarf**.\n4. The planetary nebula is lit up by the central white dwarf star and is a beautiful object to observe.\n5. Over billions of years, the white dwarf cools and fades.\n\n**For stars much larger than the Sun (massive stars):**\n1. The star becomes a **red supergiant**.\n2. The nuclear reaction eventually runs out of fuel.\n3. The core collapses violently, producing a massive explosion called a **supernova**.\n4. The remnant core may become a **neutron star** or, if massive enough, a **black hole**.\n\n*At Grade 9 level, focus on the life cycle of Sun-like stars.*'),
  q(6, 'What will our Sun eventually become at the end of its life?',
    ['A black hole', 'A neutron star', 'A white dwarf', 'A supernova'], 2,
    'Our Sun is a medium-sized star. When it exhausts its hydrogen fuel, it will swell into a red giant, shed its outer layers as a planetary nebula, and its core will contract into a white dwarf. Only very massive stars end as neutron stars or black holes.'),
  fb(7, 'When a star like the Sun runs out of fuel, it swells into a ___ giant. Its outer layers are ejected to form a planetary ___.',
    ['red', 'nebula'],
    'As a medium-sized star ages, it exhausts its hydrogen fuel and begins fusing helium. It expands enormously to become a red giant. Eventually, it sheds its outer gas layers into space, forming a beautiful planetary nebula around the remaining white dwarf core.'),
  q(8, 'Blue stars are generally hotter than red stars. What does a star\'s colour tell us?',
    ['Its size', 'Its age in years', 'Its surface temperature', 'Its distance from Earth'], 2,
    'A star\'s colour is directly related to its surface temperature. Blue stars have the highest surface temperatures (over 30 000 K), white and yellow stars are intermediate (5 000–10 000 K), and red stars have the lowest surface temperatures (about 3 000 K).'),
  t(9, '### Summary: Life Cycle of a Sun-Like Star\n\n**Stage 1: Nebula** — A cloud of gas and dust collapses under gravity.\n\n**Stage 2: Protostar** — The collapsing cloud heats up as particles move closer together.\n\n**Stage 3: Main sequence star** — Nuclear fusion begins. The star shines steadily for billions of years, fusing hydrogen into helium. Our Sun is currently at this stage.\n\n**Stage 4: Red giant** — Hydrogen fuel runs low. The star expands and cools, glowing red.\n\n**Stage 5: Planetary nebula** — The outer layers of gas are shed into space.\n\n**Stage 6: White dwarf** — The remaining core is small, dense, and hot. It slowly cools over billions of years.\n\nThe elements created inside stars (carbon, oxygen, iron, and others) are scattered into space when stars die. These elements form new nebulae and eventually new stars and planets — including our Earth. As the famous saying goes: *we are made of star stuff*.'),
  q(10, 'In which stage of its life cycle is our Sun currently?',
    ['Red giant', 'White dwarf', 'Main sequence', 'Nebula'], 2,
    'Our Sun is approximately 4.6 billion years old and is in the main sequence stage of its life. It is steadily fusing hydrogen into helium in its core. It is expected to remain in this stage for another 4–5 billion years before becoming a red giant.'),
];

// =============================================================================
// DB INSERTION
// =============================================================================
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 9
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 9/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 9:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 9', schoolId: SCHOOL_ID, orderIndex: 9,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 9:', String(GRADE_ID));
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
    tags: ['natural-sciences', 'grade-9', 'caps'],
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
      title: 'Chapter 1: Cells as Basic Units of Life',
      description: 'Cell structure, plant and animal cells, organelles and their functions, differences between plant and animal cells, and the organisation of cells into tissues, organs, and systems.',
      order: 1,
      lessons: [
        { title: 'Cell Structure and Organisation', description: 'Plant and animal cell structure, key organelles (nucleus, cell membrane, cytoplasm, mitochondria, chloroplasts, cell wall, vacuole), differences between plant and animal cells, and the hierarchy from cells to organ systems.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Systems in the Human Body',
      description: 'Overview of body systems (musculoskeletal, circulatory, respiratory, nervous, excretory), the blood circulatory and respiratory systems, and the human reproductive system including puberty, the menstrual cycle, fertilisation, and contraception.',
      order: 2,
      lessons: [
        { title: 'Body Systems: Circulatory and Respiratory', description: 'Overview of body systems, the musculoskeletal system, blood circulatory system (heart, arteries, veins, capillaries), respiratory system (breathing, gaseous exchange in alveoli), and the excretory and nervous systems.', blocks: ch2_lesson1, term: 1 },
        { title: 'Human Reproduction', description: 'Male and female reproductive systems, puberty and secondary sexual characteristics, the menstrual cycle, fertilisation, pregnancy, the placenta, contraception, STIs, and health issues.', blocks: ch2_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: The Digestive System',
      description: 'The alimentary canal, mechanical and chemical digestion, the function of each digestive organ, healthy diet and nutrition, and health issues related to diet.',
      order: 3,
      lessons: [
        { title: 'Digestion and Healthy Diet', description: 'Why we digest food, the alimentary canal, mechanical vs chemical digestion, structure and function of each digestive organ, peristalsis, balanced diet and food groups, and diet-related health issues.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: The Periodic Table and Compounds',
      description: 'Elements, compounds, and mixtures, the Periodic Table, naming and writing formulae of compounds, chemical equations, and balancing equations.',
      order: 4,
      lessons: [
        { title: 'Compounds, Formulae, and Chemical Equations', description: 'The Periodic Table, elements vs compounds vs mixtures, naming compounds (mono-, di-, tri-), chemical formulae, chemical equations, coefficients and subscripts, and balanced equations.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Reactions of Metals and Non-Metals with Oxygen',
      description: 'Reactions of metals (iron, magnesium) with oxygen, rusting and rust prevention, reactions of non-metals (carbon, sulfur) with oxygen, and the link to acid rain.',
      order: 5,
      lessons: [
        { title: 'Metal and Non-Metal Reactions with Oxygen', description: 'Reaction of iron and magnesium with oxygen, formation of metal oxides, rusting conditions and prevention (painting, galvanising, electroplating), reactions of carbon and sulfur with oxygen, and acid rain.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Acids, Bases, and pH',
      description: 'Properties of acids and bases, the pH scale, chemical indicators, neutralisation reactions, reactions of acids with metal oxides, and applications including acid rain and agriculture.',
      order: 6,
      lessons: [
        { title: 'Acids, Bases, pH, and Neutralisation', description: 'Common acids and bases, the pH scale, chemical indicators (litmus, universal indicator, red cabbage), neutralisation reactions, reactions of acids with metal oxides, acid rain, and limestone in agriculture.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Forces',
      description: 'Contact and non-contact forces, gravitational force (mass vs weight), magnetic force, electrostatic force and charge, lightning, and safety during electrical storms.',
      order: 7,
      lessons: [
        { title: 'Types of Forces', description: 'Contact forces (friction, tension, compression) and non-contact forces (gravitational, magnetic, electrostatic), mass vs weight, magnets and poles, static electricity, lightning, and safety precautions.', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Electric Circuits',
      description: 'Electric cells as energy systems, resistance and factors affecting it, series and parallel circuits, household wiring, electrical safety devices, and the 3-pin plug.',
      order: 8,
      lessons: [
        { title: 'Circuits, Resistance, and Safety', description: 'Electric cells and batteries, conductors and resistors, factors affecting resistance, series vs parallel circuits, household wiring in parallel, fuses, circuit breakers, earth leakage, and the 3-pin plug.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Energy and the National Electricity Grid',
      description: 'Electricity generation from coal and nuclear power, renewable and non-renewable energy sources, the national grid, transformers, cost of electrical power, and energy saving.',
      order: 9,
      lessons: [
        { title: 'Electricity Generation, the Grid, and Cost', description: 'Coal-fired and nuclear power stations, Koeberg, renewable energy sources (wind, solar, hydro), the national grid, transformers, load shedding, kilowatt-hours, calculating electricity cost, and energy-saving tips.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: The Earth as a System',
      description: 'The four spheres of the Earth (lithosphere, hydrosphere, atmosphere, biosphere), the rock cycle, igneous, sedimentary, and metamorphic rocks, extracting ores, and mining history in South Africa.',
      order: 10,
      lessons: [
        { title: 'Spheres, Rocks, and Mining', description: 'Earth\'s four spheres and their interactions, layers of the Earth, the rock cycle, three types of rocks (igneous, sedimentary, metamorphic), extracting ores, and ancient iron smelting in South Africa.', blocks: ch10_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 11: Mining and the Atmosphere',
      description: 'Mining in South Africa, environmental impacts of mining, composition and layers of the atmosphere, the greenhouse effect, global warming, and the ozone layer.',
      order: 11,
      lessons: [
        { title: 'Mining, Atmosphere, and Climate', description: 'South Africa\'s mineral resources, environmental impact of mining (acid mine drainage, land degradation, water pollution), atmospheric composition and layers, the greenhouse effect, global warming, and the ozone layer.', blocks: ch11_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 12: Birth, Life, and Death of Stars',
      description: 'Formation of stars from nebulae, nuclear fusion, the main sequence, star colour and temperature, red giants, planetary nebulae, white dwarfs, and the life cycle of Sun-like stars.',
      order: 12,
      lessons: [
        { title: 'The Life Cycle of Stars', description: 'Nebulae and star formation, nuclear fusion of hydrogen to helium, star colour and temperature, our Sun as a main sequence star, red giants, planetary nebulae, white dwarfs, and supernovae.', blocks: ch12_lesson1, term: 4 },
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
    title: 'Grade 9 Natural Sciences \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Life and Living (cells, body systems, digestion, reproduction), Matter and Materials (periodic table, compounds, chemical reactions, acids and bases), Energy and Change (forces, circuits, electricity grid), and Planet Earth and Beyond (lithosphere, mining, atmosphere, stars) for the Grade 9 Natural Sciences curriculum.',
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
  console.log('  TEXTBOOK: Grade 9 Natural Sciences');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
