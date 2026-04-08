const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const SCHOOL_ID = new mongoose.Types.ObjectId('69ce960a98ca4ee738d25416');
const CREATED_BY = new mongoose.Types.ObjectId('69ce960b98ca4ee738d25432');
const GRADE_ID = new mongoose.Types.ObjectId('69d0c1241d8a9f6a83801642');

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
// CHAPTER 1: DNA \u2014 The Code of Life (Term 1)
// =============================================================================
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## DNA \u2014 The Code of Life\n\n### Location of DNA\n\nDNA (deoxyribonucleic acid) is the molecule that carries the genetic instructions for life. In eukaryotic cells, DNA is found primarily in the **nucleus**, packaged into structures called **chromosomes**. However, small amounts of DNA also occur outside the nucleus:\n\n- **Mitochondrial DNA (mtDNA)**: Found in the mitochondria. It is inherited only from the mother (maternal inheritance) because the egg cell contributes mitochondria to the zygote while the sperm contributes almost none.\n- **Chloroplast DNA (cpDNA)**: Found in chloroplasts of plant cells.\n\nThis extra-nuclear (extranuclear) DNA is circular and does not undergo recombination during meiosis.'),
  t(2, '### Structure of DNA\n\nDNA is a **double helix** \u2014 two polynucleotide strands wound around each other in a spiral.\n\n**Each nucleotide consists of three parts:**\n1. A **deoxyribose sugar** (5-carbon sugar)\n2. A **phosphate group** (PO\u2084)\n3. A **nitrogenous base** \u2014 one of four types:\n   - **Adenine (A)** \u2014 purine\n   - **Thymine (T)** \u2014 pyrimidine\n   - **Guanine (G)** \u2014 purine\n   - **Cytosine (C)** \u2014 pyrimidine\n\n**Base pairing rules (Chargaff\u2019s rules):**\n- A pairs with T (two hydrogen bonds)\n- G pairs with C (three hydrogen bonds)\n\nThe two strands run in **antiparallel** directions (5\u2032 \u2192 3\u2032 and 3\u2032 \u2192 5\u2032). The sugar-phosphate backbone forms the sides of the ladder, while the base pairs form the rungs.'),
  q(3, 'Which of the following correctly describes the base pairing in DNA?',
    ['A\u2013G and T\u2013C', 'A\u2013T and G\u2013C', 'A\u2013C and G\u2013T', 'A\u2013U and G\u2013C'], 1,
    'In DNA, adenine (A) always pairs with thymine (T) via two hydrogen bonds, and guanine (G) always pairs with cytosine (C) via three hydrogen bonds. This is known as complementary base pairing.'),
  fb(4, 'DNA stands for ___. Each nucleotide consists of a deoxyribose sugar, a ___ group, and a nitrogenous base.',
    ['deoxyribonucleic acid', 'phosphate'],
    'DNA is deoxyribonucleic acid. Each nucleotide has three components: a five-carbon deoxyribose sugar, a phosphate group, and one of four nitrogenous bases.'),
  t(5, '### Discovery of DNA Structure\n\nThe discovery of DNA structure was a collaborative effort:\n\n| Scientist(s) | Contribution |\n|-------------|-------------|\n| **Friedrich Miescher** (1869) | Isolated nuclein (DNA) from white blood cells |\n| **Erwin Chargaff** (1950) | Discovered base pairing ratios: A=T and G=C |\n| **Rosalind Franklin & Maurice Wilkins** | Produced X-ray diffraction images showing DNA is a helix |\n| **James Watson & Francis Crick** (1953) | Built the first correct 3D model of DNA \u2014 the double helix |\n\nFranklin\u2019s Photo 51 was crucial evidence for the helical structure. Watson and Crick were awarded the Nobel Prize in 1962 along with Wilkins. Franklin had died in 1958 and was not recognised at the time.'),
  t(6, '### Chromosomes, Genes, and the Genome\n\n- A **gene** is a specific segment of DNA that codes for a particular protein (or polypeptide).\n- **Chromosomes** are tightly coiled DNA molecules associated with histone proteins. Humans have 46 chromosomes (23 pairs).\n- The **genome** is the complete set of genetic material in an organism.\n- **Homologous chromosomes** are pairs of chromosomes (one from each parent) that have genes for the same traits at the same loci.\n- **Alleles** are different forms of the same gene (e.g., an allele for brown eyes vs an allele for blue eyes).'),
  q(7, 'Why is mitochondrial DNA inherited only from the mother?',
    ['Because the father has no mitochondria', 'Because the sperm contributes almost no cytoplasm (and therefore almost no mitochondria) to the zygote', 'Because mitochondrial DNA is destroyed by the Y chromosome', 'Because mitochondria are only found in egg cells'], 1,
    'During fertilisation, the sperm contributes mainly its nuclear DNA. The egg cell provides virtually all the cytoplasm, including the mitochondria. Therefore, mitochondrial DNA is maternally inherited.'),
  t(8, '### DNA Replication\n\nDNA replication occurs during the **S phase** of interphase, before cell division. It produces two identical copies of the DNA molecule.\n\n**Steps of DNA replication:**\n1. **Unwinding**: The enzyme **helicase** unwinds and separates the double helix by breaking the hydrogen bonds between base pairs, creating a **replication fork**.\n2. **Binding of primers**: Short RNA primers bind to each template strand to provide a starting point.\n3. **Elongation**: **DNA polymerase** adds complementary nucleotides to each template strand in the 5\u2032 \u2192 3\u2032 direction.\n4. **Joining**: **DNA ligase** joins the Okazaki fragments on the lagging strand to form a continuous strand.\n5. **Proofreading**: DNA polymerase checks for errors and corrects mismatched bases.\n\nReplication is **semi-conservative** \u2014 each new DNA molecule contains one original (parent) strand and one newly synthesised strand.'),
  q(9, 'What does "semi-conservative" mean in relation to DNA replication?',
    ['Half the bases are conserved', 'Each new DNA molecule retains one original strand and one new strand', 'Only half the DNA is copied', 'The DNA is half the original length'], 1,
    'Semi-conservative replication means each daughter DNA molecule consists of one parental (template) strand and one newly synthesised complementary strand.'),
  fb(10, 'The enzyme ___ unwinds the DNA double helix, while ___ adds complementary nucleotides during replication.',
    ['helicase', 'DNA polymerase'],
    'Helicase breaks the hydrogen bonds between bases to unwind the helix. DNA polymerase then reads the template strand and adds free nucleotides according to base pairing rules.',
    ['Think about which enzyme "unzips" and which enzyme "builds".']),
];

blockNum = 0;
const ch1_lesson2 = [
  t(1, '## RNA and Protein Synthesis\n\n### RNA Structure and Types\n\nRNA (ribonucleic acid) differs from DNA in several ways:\n\n| Feature | DNA | RNA |\n|---------|-----|-----|\n| Sugar | Deoxyribose | Ribose |\n| Strands | Double-stranded | Usually single-stranded |\n| Bases | A, T, G, C | A, **U** (uracil), G, C |\n| Location | Nucleus | Nucleus and cytoplasm |\n| Function | Stores genetic information | Protein synthesis |\n\n**Three types of RNA:**\n1. **mRNA (messenger RNA)**: Carries the genetic code from DNA to ribosomes\n2. **tRNA (transfer RNA)**: Carries specific amino acids to the ribosome; has an **anticodon** that pairs with the mRNA codon\n3. **rRNA (ribosomal RNA)**: Makes up part of the ribosome structure'),
  t(2, '### The Genetic Code\n\nThe genetic code is the set of rules by which the nucleotide sequence in mRNA is translated into a sequence of amino acids.\n\n**Key features of the genetic code:**\n- It is a **triplet code** \u2014 every three bases (a **codon**) codes for one amino acid\n- It is **universal** \u2014 the same codons code for the same amino acids in almost all organisms\n- It is **degenerate** (redundant) \u2014 more than one codon can code for the same amino acid (e.g., GCU, GCC, GCA, GCG all code for alanine)\n- **AUG** is the start codon (codes for methionine)\n- **UAA, UAG, UGA** are stop codons (they do not code for any amino acid)'),
  q(3, 'How many nucleotides are needed to code for a polypeptide chain of 50 amino acids?',
    ['50', '100', '150', '200'], 2,
    'Since the genetic code is a triplet code (three nucleotides per amino acid), 50 amino acids require 50 x 3 = 150 nucleotides.'),
  t(4, '### Transcription (DNA \u2192 mRNA)\n\nTranscription occurs in the **nucleus** and produces an mRNA copy of a gene.\n\n**Steps:**\n1. **Initiation**: RNA polymerase binds to the **promoter region** of the gene on the DNA.\n2. **Elongation**: RNA polymerase moves along the **template strand** (3\u2032 \u2192 5\u2032 direction), adding complementary RNA nucleotides in the 5\u2032 \u2192 3\u2032 direction. Note: uracil (U) pairs with adenine (A) instead of thymine.\n3. **Termination**: RNA polymerase reaches a **terminator sequence** and detaches. The mRNA strand is released.\n4. **Processing** (in eukaryotes): Introns (non-coding sections) are removed and exons (coding sections) are spliced together to form mature mRNA.\n5. The mature mRNA moves through a nuclear pore into the cytoplasm.'),
  t(5, '### Translation (mRNA \u2192 Protein)\n\nTranslation occurs at the **ribosomes** in the cytoplasm (or on rough ER).\n\n**Steps:**\n1. **Initiation**: The mRNA attaches to a ribosome. The start codon (AUG) is read first. A tRNA molecule carrying methionine binds to the start codon via its anticodon (UAC).\n2. **Elongation**: The ribosome moves along the mRNA, reading each codon. For each codon, a tRNA with the complementary anticodon brings the correct amino acid. **Peptide bonds** form between adjacent amino acids, creating a growing polypeptide chain.\n3. **Termination**: When the ribosome reaches a **stop codon** (UAA, UAG, or UGA), no tRNA can bind. The polypeptide chain is released and folds into a functional protein.\n\n**Summary**: DNA \u2192 (transcription) \u2192 mRNA \u2192 (translation) \u2192 protein. This is the **central dogma** of molecular biology.'),
  q(6, 'During transcription, the DNA template strand reads 3\u2032-TACGGA-5\u2032. What is the mRNA sequence produced?',
    ['5\u2032-AUGCCU-3\u2032', '5\u2032-ATGCCT-3\u2032', '5\u2032-UACGGA-3\u2032', '5\u2032-TACGGA-3\u2032'], 0,
    'RNA polymerase reads the template strand 3\u2032 to 5\u2032 and builds mRNA 5\u2032 to 3\u2032 using complementary bases: T\u2192A, A\u2192U, C\u2192G, G\u2192C. So TAC\u2192AUG and GGA\u2192CCU, giving 5\u2032-AUGCCU-3\u2032.'),
  fb(7, 'Transcription produces ___ from a DNA template. Translation occurs at ___ in the cytoplasm.',
    ['mRNA', 'ribosomes'],
    'During transcription, an mRNA molecule is synthesised from a DNA template. During translation, this mRNA is read by ribosomes, which assemble amino acids into a polypeptide chain.'),
  t(8, '### Mutations\n\nA **mutation** is a permanent change in the nucleotide sequence of DNA. Mutations can be:\n\n**Types of gene mutations:**\n- **Point (substitution) mutation**: One base is replaced by another. May be *silent* (no amino acid change), *missense* (different amino acid), or *nonsense* (creates a stop codon).\n- **Frameshift mutations**: Insertions or deletions of nucleotides that shift the reading frame, changing every codon downstream.\n\n**Causes of mutations:**\n- **Spontaneous**: Errors during DNA replication\n- **Induced**: Caused by mutagens such as UV radiation, X-rays, cigarette smoke, certain chemicals\n\n**Effects of mutations:**\n- Most are **harmful** (e.g., sickle cell anaemia from a single substitution mutation in the haemoglobin gene)\n- Some are **neutral** (silent mutations)\n- Rarely, mutations are **beneficial** (provide an advantage, e.g., disease resistance)'),
  q(9, 'A frameshift mutation is caused by:',
    ['A substitution of one base for another', 'An insertion or deletion of nucleotides', 'A change in the promoter region only', 'Crossing over during meiosis'], 1,
    'Frameshift mutations result from the insertion or deletion of nucleotides (not in multiples of three), which shifts the reading frame and alters all downstream codons.'),
  q(10, 'Sickle cell anaemia is caused by:',
    ['A frameshift mutation in the haemoglobin gene', 'A point (substitution) mutation in the haemoglobin gene', 'A deletion of the entire haemoglobin gene', 'An extra copy of chromosome 21'], 1,
    'Sickle cell anaemia results from a single base substitution (GAG \u2192 GUG) in the haemoglobin gene. This changes one amino acid (glutamic acid \u2192 valine), causing the haemoglobin to polymerise and distort red blood cells into a sickle shape.'),
];

// =============================================================================
// CHAPTER 2: Meiosis (Term 1)
// =============================================================================
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Meiosis \u2014 Reduction Division\n\n### Chromosome Terminology\n\nBefore studying meiosis, you must understand the following terms:\n\n| Term | Definition |\n|------|------------|\n| **Chromosome** | A condensed structure of DNA and histone proteins visible during cell division |\n| **Chromatid** | One copy of a duplicated chromosome, joined at the centromere |\n| **Centromere** | The point where two sister chromatids are joined |\n| **Homologous chromosomes** | A pair of chromosomes (one maternal, one paternal) with genes for the same traits at the same loci |\n| **Diploid (2n)** | A cell with two complete sets of chromosomes (e.g., human body cells: 2n = 46) |\n| **Haploid (n)** | A cell with one set of chromosomes (e.g., human gametes: n = 23) |\n| **Bivalent (tetrad)** | A pair of homologous chromosomes (4 chromatids) aligned during meiosis I |\n| **Autosome** | Any chromosome that is not a sex chromosome (humans have 22 pairs) |\n| **Sex chromosome** | X or Y chromosome that determines sex |'),
  t(2, '### Overview of Meiosis\n\nMeiosis is a type of cell division that produces **four genetically unique haploid** daughter cells from one diploid parent cell. It involves **two successive divisions**: meiosis I (reduction division) and meiosis II (equational division).\n\n**Where it occurs:** In the gonads (ovaries and testes) to produce gametes (eggs and sperm).\n\n**Key outcomes:**\n- Chromosome number is halved (2n \u2192 n)\n- Genetic variation is introduced through crossing over and independent assortment\n- Four genetically different haploid cells are produced'),
  t(3, '### Meiosis I \u2014 Reduction Division\n\n**Prophase I:**\n- Chromosomes condense and become visible\n- Homologous chromosomes pair up (synapsis) to form **bivalents**\n- **Crossing over** occurs: non-sister chromatids of homologous pairs exchange segments of DNA at points called **chiasmata**. This creates new combinations of alleles.\n- The nuclear membrane breaks down; the spindle fibres form\n\n**Metaphase I:**\n- Bivalents line up along the cell equator (metaphase plate)\n- **Independent assortment**: The random orientation of each bivalent determines which chromosome goes to which pole. With 23 pairs, there are 2\u00b2\u00b3 (over 8 million) possible combinations.\n\n**Anaphase I:**\n- Homologous chromosomes are pulled to opposite poles (centromeres do NOT split)\n- Each pole receives one chromosome from each homologous pair\n\n**Telophase I & Cytokinesis:**\n- Two haploid daughter cells form, each with half the original chromosome number\n- Each chromosome still consists of two sister chromatids'),
  q(4, 'During which phase of meiosis does crossing over occur?',
    ['Metaphase I', 'Prophase I', 'Anaphase II', 'Telophase I'], 1,
    'Crossing over occurs during prophase I when homologous chromosomes synapse (pair up) to form bivalents. Non-sister chromatids exchange segments at chiasmata, producing new allele combinations.'),
  t(5, '### Meiosis II \u2014 Equational Division\n\nMeiosis II is similar to mitosis but starts with haploid cells.\n\n**Prophase II:**\n- Chromosomes condense; new spindle fibres form\n- Nuclear membrane (if reformed) breaks down\n\n**Metaphase II:**\n- Individual chromosomes (each with two chromatids) line up along the equator\n\n**Anaphase II:**\n- Centromeres split; sister chromatids are pulled to opposite poles\n\n**Telophase II & Cytokinesis:**\n- Four haploid daughter cells form\n- Each cell is genetically unique\n\n**Summary of chromosome numbers (in humans):**\n- Start: 1 cell with 46 chromosomes (2n)\n- After meiosis I: 2 cells, each with 23 chromosomes (n) but each chromosome has 2 chromatids\n- After meiosis II: 4 cells, each with 23 chromosomes (n) with 1 chromatid each'),
  fb(6, 'Meiosis I is called ___ division because the chromosome number is halved. Meiosis II is similar to ___ because the centromeres split.',
    ['reduction', 'mitosis'],
    'Meiosis I separates homologous chromosomes (reducing the number from 2n to n). Meiosis II separates sister chromatids, similar to what happens in mitosis.'),
  t(7, '### Importance of Meiosis\n\n1. **Halves the chromosome number**: Gametes are haploid, so that when two gametes fuse at fertilisation, the diploid number is restored.\n2. **Produces genetic variation** through:\n   - **Crossing over** (prophase I): Creates recombinant chromosomes\n   - **Independent assortment** (metaphase I): Random orientation of bivalents\n   - **Random fertilisation**: Any sperm can fertilise any egg\n3. **Essential for sexual reproduction** in all organisms that reproduce sexually.'),
  q(8, 'A cell with 2n = 14 undergoes meiosis. How many chromosomes will each gamete contain?',
    ['14', '7', '28', '4'], 1,
    'Meiosis halves the diploid number. If 2n = 14, then n = 7. Each gamete will contain 7 chromosomes.'),
  t(9, '### Abnormal Meiosis\n\n**Non-disjunction** is the failure of chromosomes to separate properly during meiosis.\n\n- If non-disjunction occurs in **meiosis I**: homologous chromosomes fail to separate. Both members of a pair go to one pole.\n- If non-disjunction occurs in **meiosis II**: sister chromatids fail to separate.\n\n**Consequences:**\n- Gametes with too many or too few chromosomes are produced\n- Fertilisation with abnormal gametes produces offspring with **aneuploidy** (abnormal chromosome number)\n\n**Examples in humans:**\n| Condition | Chromosomes | Features |\n|-----------|-------------|----------|\n| **Down syndrome** (Trisomy 21) | 47 (extra chromosome 21) | Intellectual disability, characteristic facial features |\n| **Turner syndrome** (Monosomy X) | 45 (XO) | Female, short stature, infertile |\n| **Klinefelter syndrome** | 47 (XXY) | Male, tall, may be infertile |'),
  q(10, 'Non-disjunction during meiosis I means that:',
    ['Sister chromatids fail to separate', 'Homologous chromosomes fail to separate', 'The cell fails to divide', 'Crossing over does not occur'], 1,
    'Non-disjunction in meiosis I is the failure of homologous chromosomes to separate during anaphase I. Both homologues migrate to the same pole, resulting in gametes with an extra or missing chromosome.'),
  t(11, '### Meiosis vs Mitosis\n\n| Feature | Mitosis | Meiosis |\n|---------|---------|--------|\n| Divisions | 1 | 2 |\n| Daughter cells | 2 identical | 4 genetically unique |\n| Chromosome number | Stays diploid (2n) | Halved to haploid (n) |\n| Crossing over | No | Yes (prophase I) |\n| Purpose | Growth, repair | Gamete formation |\n| Where | Body (somatic) cells | Gonads only |\n| Genetic variation | None | Yes (crossing over + independent assortment) |'),
];

// =============================================================================
// CHAPTER 3: Reproduction in Vertebrates (Term 1)
// =============================================================================
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Reproduction in Vertebrates\n\n### Reproductive Strategies\n\nVertebrates show a wide diversity of reproductive strategies. These strategies are adaptations that increase the chances of offspring survival in different environments.\n\n### External vs Internal Fertilisation\n\n| Feature | External fertilisation | Internal fertilisation |\n|---------|----------------------|----------------------|\n| Where gametes meet | Outside the body (usually in water) | Inside the female body |\n| Medium | Water required | No water required |\n| Number of eggs | Very large (thousands to millions) | Fewer eggs |\n| Parental care | Usually none | Often present |\n| Examples | Most fish, frogs | Reptiles, birds, mammals |\n\n**Why produce so many eggs with external fertilisation?** Because many eggs and sperm are lost or eaten before fertilisation can occur. Producing large numbers compensates for the high mortality rate.'),
  t(2, '### Types of Development\n\n**Oviparity (egg-laying):**\n- Fertilised eggs are laid outside the body\n- Embryo develops inside the egg, nourished by the yolk\n- Examples: Most fish, amphibians, reptiles, birds, monotremes (platypus, echidna)\n\n**Viviparity (live birth):**\n- Embryo develops inside the mother\u2019s body\n- Nourished directly by the mother via a **placenta**\n- Gives birth to live, relatively well-developed young\n- Examples: Most mammals (humans, dogs, whales)\n\n**Ovoviviparity:**\n- Eggs develop and hatch **inside** the mother\u2019s body\n- Embryo is nourished by the egg yolk (not a placenta)\n- Mother gives birth to live young\n- Examples: Some sharks, certain reptiles (e.g., some vipers), seahorses'),
  q(3, 'Which reproductive strategy involves eggs hatching inside the mother, with the embryo nourished by egg yolk rather than a placenta?',
    ['Oviparity', 'Viviparity', 'Ovoviviparity', 'External fertilisation'], 2,
    'Ovoviviparity means eggs are retained inside the mother and hatch internally. The embryo is nourished by yolk, not by a placental connection. The mother then gives birth to live young.'),
  t(4, '### Amniotic Egg\n\nReptiles, birds, and monotremes produce **amniotic eggs** \u2014 eggs with protective membranes that allow development on land.\n\n**Membranes of the amniotic egg:**\n- **Amnion**: Fluid-filled sac that surrounds the embryo, providing cushioning and preventing desiccation\n- **Chorion**: Outermost membrane; allows gas exchange\n- **Allantois**: Stores waste products; assists with gas exchange\n- **Yolk sac**: Contains nutrients for the developing embryo\n- **Shell** (in birds and reptiles): Provides physical protection; porous to allow gas exchange\n\nThe evolution of the amniotic egg was a key adaptation that allowed vertebrates to reproduce entirely on land, without needing to return to water.'),
  fb(5, 'In ___, the embryo develops inside the mother and is nourished by a placenta. In ___, eggs develop and hatch inside the mother but the embryo is nourished by yolk.',
    ['viviparity', 'ovoviviparity'],
    'Viviparity involves a placental connection between mother and embryo. Ovoviviparity involves eggs hatching internally, with yolk (not placenta) as the nutrient source.'),
  t(6, '### Comparison of Vertebrate Reproductive Strategies\n\n| Class | Fertilisation | Development | Examples |\n|-------|--------------|-------------|----------|\n| **Fish (most)** | External | Oviparous | Tilapia, sardines |\n| **Fish (some)** | Internal | Ovoviviparous | Some sharks, guppies |\n| **Amphibians** | External | Oviparous (eggs in water) | Frogs, toads |\n| **Reptiles** | Internal | Oviparous (amniotic egg) | Crocodiles, turtles |\n| **Reptiles (some)** | Internal | Ovoviviparous | Some vipers, skinks |\n| **Birds** | Internal | Oviparous (hard-shelled egg) | All birds |\n| **Mammals (monotremes)** | Internal | Oviparous | Platypus, echidna |\n| **Mammals (marsupials)** | Internal | Viviparous (short gestation, pouch) | Kangaroo, koala |\n| **Mammals (placental)** | Internal | Viviparous (placenta) | Humans, dogs, whales |'),
  q(7, 'Which of the following is an advantage of internal fertilisation over external fertilisation?',
    ['More eggs are produced', 'Less energy is used', 'Higher chance of successful fertilisation', 'The young develop faster'], 2,
    'Internal fertilisation ensures sperm is deposited close to the egg inside the female body, greatly increasing the probability of successful fertilisation compared to releasing gametes into water where they may be dispersed or eaten.'),
  q(8, 'Amphibians typically reproduce using:',
    ['Internal fertilisation and viviparity', 'External fertilisation and oviparity', 'Internal fertilisation and ovoviviparity', 'External fertilisation and viviparity'], 1,
    'Most amphibians use external fertilisation: eggs are laid in water and sperm is released over them. The eggs are oviparous (develop outside the body) and lack a shell or amniotic membranes, requiring a moist environment.'),
  t(9, '### Parental Care in Vertebrates\n\nThe degree of parental care generally increases as the number of offspring decreases:\n\n- **Fish/Amphibians**: Usually no parental care. Exception: mouthbrooding cichlids, poison dart frogs carrying tadpoles.\n- **Reptiles**: Minimal care. Exception: crocodilians guard their nests and carry hatchlings to water.\n- **Birds**: Extensive care \u2014 incubation of eggs, feeding chicks, teaching flight.\n- **Mammals**: Prolonged care \u2014 gestation, lactation (milk production), protection, social learning.\n\n**Trend**: As parental investment increases, fewer offspring are produced but each has a higher survival rate.'),
  fb(10, 'The amniotic egg contains four membranes: the ___ (fluid sac around embryo), the chorion, the ___, and the yolk sac.',
    ['amnion', 'allantois'],
    'The amnion surrounds the embryo in fluid for protection. The allantois stores metabolic waste and assists with gas exchange. The chorion is the outer membrane and the yolk sac provides nutrients.'),
];

// =============================================================================
// CHAPTER 4: Human Reproduction (Term 1)
// =============================================================================
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Human Reproduction\n\n### Male Reproductive System\n\n| Structure | Function |\n|-----------|----------|\n| **Testes** (in scrotum) | Produce sperm (spermatogenesis) and testosterone |\n| **Scrotum** | Holds testes outside the body to maintain temperature 2\u20133\u00b0C below body temperature (optimal for sperm production) |\n| **Epididymis** | Stores and matures sperm |\n| **Vas deferens (sperm duct)** | Transports sperm from epididymis to urethra |\n| **Seminal vesicles** | Secrete fructose-rich fluid (energy for sperm) |\n| **Prostate gland** | Secretes alkaline fluid to neutralise acidic vaginal environment |\n| **Urethra** | Shared passage for urine and semen |\n| **Penis** | Deposits semen into the female reproductive tract |\n\n**Semen** = sperm + secretions from seminal vesicles, prostate gland, and Cowper\u2019s glands.'),
  t(2, '### Female Reproductive System\n\n| Structure | Function |\n|-----------|----------|\n| **Ovaries** (2) | Produce ova (eggs) and female hormones (oestrogen, progesterone) |\n| **Fallopian tubes (oviducts)** | Site of fertilisation; transport ovum to uterus via peristalsis and cilia |\n| **Uterus (womb)** | Site of implantation and development of embryo/foetus |\n| **Endometrium** | Inner lining of uterus; thickens to receive embryo; shed during menstruation |\n| **Cervix** | Narrow opening between uterus and vagina |\n| **Vagina** | Receives sperm during intercourse; birth canal |\n\n### Puberty\n\n- In **males**: Testosterone triggers deepening voice, body hair growth, muscle development, and sperm production.\n- In **females**: Oestrogen triggers breast development, widening of hips, body hair growth, and onset of menstruation (menarche).'),
  q(3, 'Why are the testes located in the scrotum outside the body?',
    ['To protect them from injury', 'To keep them at a temperature 2\u20133\u00b0C below body temperature for optimal sperm production', 'To make them easier to examine', 'To increase testosterone production'], 1,
    'Sperm production (spermatogenesis) requires a temperature slightly lower than core body temperature. The scrotum keeps the testes at approximately 34\u201335\u00b0C, which is optimal for sperm production.'),
  t(4, '### Gametogenesis\n\n**Spermatogenesis (sperm formation)** \u2014 occurs in the seminiferous tubules of the testes:\n1. **Spermatogonia** (2n) undergo mitosis to maintain the stem cell population\n2. Some spermatogonia grow into **primary spermatocytes** (2n)\n3. Meiosis I \u2192 **secondary spermatocytes** (n)\n4. Meiosis II \u2192 **spermatids** (n)\n5. Spermatids differentiate into mature **spermatozoa** (sperm)\n- Result: **4 functional sperm** from each primary spermatocyte\n- Continuous process from puberty throughout life\n\n**Oogenesis (egg formation)** \u2014 occurs in the ovaries:\n1. **Oogonia** (2n) undergo mitosis before birth \u2192 **primary oocytes** (2n)\n2. Primary oocytes begin meiosis I but pause at prophase I (from birth until ovulation)\n3. At ovulation: meiosis I completes \u2192 **secondary oocyte** (n) + first **polar body**\n4. Meiosis II begins but only completes if fertilisation occurs \u2192 **ovum** (n) + second polar body\n- Result: **1 functional egg** + 2\u20133 polar bodies (which degenerate)'),
  q(5, 'How does oogenesis differ from spermatogenesis in terms of functional gametes produced?',
    ['Oogenesis produces 4 eggs; spermatogenesis produces 1 sperm', 'Both produce 4 functional gametes', 'Oogenesis produces 1 egg and 3 polar bodies; spermatogenesis produces 4 sperm', 'Oogenesis produces 2 eggs; spermatogenesis produces 2 sperm'], 2,
    'Spermatogenesis produces 4 functional sperm cells per primary spermatocyte. Oogenesis produces only 1 functional egg per primary oocyte; the remaining cells become polar bodies that degenerate because the cytoplasm is unequally divided to give the egg maximum resources.'),
  t(6, '### The Menstrual Cycle (approximately 28 days)\n\nThe menstrual cycle is regulated by the interaction of hormones from the pituitary gland and the ovaries.\n\n**Phases:**\n\n1. **Menstruation (Days 1\u20135)**: The endometrium sheds (menstrual bleeding). Low oestrogen and progesterone levels.\n\n2. **Follicular phase (Days 1\u201313)**: FSH (follicle-stimulating hormone) from the pituitary stimulates follicle development in the ovary. The developing follicle secretes **oestrogen**, which causes the endometrium to thicken and rebuild.\n\n3. **Ovulation (Day 14)**: A surge of **LH** (luteinising hormone) from the pituitary triggers the release of the mature egg (secondary oocyte) from the ovary.\n\n4. **Luteal phase (Days 15\u201328)**: The empty follicle becomes the **corpus luteum**, which secretes **progesterone** (and some oestrogen). Progesterone maintains the thickened endometrium. If no fertilisation occurs, the corpus luteum degenerates, progesterone drops, and menstruation begins again.'),
  fb(7, 'The hormone ___ triggers ovulation on approximately day 14. After ovulation, the empty follicle becomes the ___, which secretes progesterone.',
    ['LH', 'corpus luteum'],
    'A surge of luteinising hormone (LH) from the anterior pituitary triggers ovulation. The remaining follicular cells form the corpus luteum, which produces progesterone to maintain the endometrium.'),
  t(8, '### Fertilisation, Implantation, and Early Development\n\n**Fertilisation:**\n- Occurs in the **Fallopian tube** (usually in the upper third)\n- Sperm undergo **capacitation** (final maturation) in the female reproductive tract\n- Sperm release enzymes from the **acrosome** to penetrate the egg\u2019s protective layers (corona radiata and zona pellucida)\n- Once one sperm enters, the **cortical reaction** prevents further sperm from entering (block to polyspermy)\n- The nuclei of the sperm and egg fuse, forming a **zygote** (2n)\n\n**Early development:**\n- The zygote divides by mitosis (cleavage) as it travels down the Fallopian tube\n- It forms a solid ball of cells (**morula**), then a hollow **blastocyst**\n- **Implantation** occurs about 6\u20137 days after fertilisation: the blastocyst embeds in the endometrium'),
  t(9, '### Gestation and the Placenta\n\n**Gestation** (pregnancy) lasts approximately **40 weeks** (280 days) in humans.\n\n**The Placenta:**\n- Disc-shaped organ that connects the foetus to the mother\u2019s uterine wall\n- Connected to the foetus by the **umbilical cord** (two arteries and one vein)\n\n**Functions of the placenta:**\n1. **Gas exchange**: O\u2082 passes from mother to foetus; CO\u2082 passes from foetus to mother\n2. **Nutrient transfer**: Glucose, amino acids, vitamins pass from mother to foetus\n3. **Waste removal**: Urea and other metabolic wastes pass from foetus to mother\n4. **Hormone production**: Secretes hCG (maintains corpus luteum), oestrogen, and progesterone\n5. **Barrier function**: Prevents mixing of maternal and foetal blood; blocks some (but not all) pathogens\n\n**Important:** Maternal and foetal blood do **NOT** mix directly. Exchange occurs by diffusion across the thin placental membrane.'),
  q(10, 'Which statement about the placenta is INCORRECT?',
    ['It produces hormones such as hCG', 'It allows maternal and foetal blood to mix directly', 'It facilitates gas exchange between mother and foetus', 'It is connected to the foetus by the umbilical cord'], 1,
    'Maternal and foetal blood NEVER mix directly. Substances are exchanged by diffusion across the thin placental membrane. The blood systems remain separate to prevent immune rejection.'),
];

// =============================================================================
// CHAPTER 5: Genetics and Inheritance (Term 2)
// =============================================================================
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Genetics and Inheritance\n\n### Key Concepts\n\n| Term | Definition |\n|------|------------|\n| **Gene** | A segment of DNA that codes for a specific protein/trait |\n| **Allele** | An alternative form of a gene (e.g., B for brown eyes, b for blue eyes) |\n| **Genotype** | The genetic makeup (allele combination) of an organism (e.g., Bb) |\n| **Phenotype** | The observable characteristic expressed (e.g., brown eyes) |\n| **Dominant allele** | The allele that is expressed in both homozygous (BB) and heterozygous (Bb) states |\n| **Recessive allele** | The allele that is only expressed in the homozygous state (bb) |\n| **Homozygous** | Two identical alleles (BB or bb) |\n| **Heterozygous** | Two different alleles (Bb) \u2014 also called a carrier for recessive traits |\n| **Locus** | The specific position of a gene on a chromosome |'),
  t(2, '### Monohybrid Crosses\n\nA monohybrid cross involves one gene with two alleles.\n\n**Example:** In pea plants, tall (T) is dominant over short (t).\n\nCross: Tt \u00d7 Tt (heterozygous tall \u00d7 heterozygous tall)\n\n|  | **T** | **t** |\n|--|-------|-------|\n| **T** | TT | Tt |\n| **t** | Tt | tt |\n\n**Genotypic ratio:** 1 TT : 2 Tt : 1 tt\n**Phenotypic ratio:** 3 tall : 1 short\n\n**Test cross:** Cross an organism showing the dominant phenotype with a homozygous recessive organism to determine if it is homozygous dominant (TT) or heterozygous (Tt).\n- If all offspring are tall \u2192 parent was TT\n- If approximately half are tall and half short \u2192 parent was Tt'),
  q(3, 'In a cross between two heterozygous individuals (Aa x Aa), what proportion of offspring is expected to be homozygous recessive?',
    ['1/2', '1/4', '3/4', '1/3'], 1,
    'Using a Punnett square: AA, Aa, Aa, aa. The proportion of homozygous recessive (aa) offspring is 1 out of 4, or 1/4 (25%).'),
  t(4, '### Dihybrid Crosses\n\nA dihybrid cross involves two genes on different chromosomes (unlinked genes).\n\n**Example:** In pea plants: Round (R) is dominant over wrinkled (r); Yellow (Y) is dominant over green (y).\n\nCross: RrYy \u00d7 RrYy\n\nEach parent produces 4 types of gametes: RY, Ry, rY, ry\n\n**Using a 4\u00d74 Punnett square, the expected phenotypic ratio is:**\n- 9 Round Yellow\n- 3 Round Green\n- 3 Wrinkled Yellow\n- 1 Wrinkled Green\n\n**= 9:3:3:1**\n\nThis 9:3:3:1 ratio is the classic Mendelian ratio for a dihybrid cross between two heterozygous parents. It only holds when genes are on different chromosomes (independent assortment).'),
  q(5, 'In a dihybrid cross (AaBb x AaBb), how many phenotypic classes are expected?',
    ['2', '3', '4', '9'], 2,
    'A dihybrid cross with complete dominance produces 4 phenotypic classes: dominant-dominant, dominant-recessive, recessive-dominant, and recessive-recessive (in a 9:3:3:1 ratio).'),
  t(6, '### Blood Groups (ABO System)\n\nBlood grouping demonstrates **codominance** and **multiple alleles**.\n\n**Three alleles:** I\u1d2c, I\u1d2e, and i\n- I\u1d2c and I\u1d2e are **codominant** to each other\n- Both I\u1d2c and I\u1d2e are **dominant** over i\n\n| Genotype | Blood group | Antigens on RBCs | Antibodies in plasma |\n|----------|------------|-----------------|--------------------|\n| I\u1d2cI\u1d2c or I\u1d2ci | A | A antigen | Anti-B |\n| I\u1d2eI\u1d2e or I\u1d2ei | B | B antigen | Anti-A |\n| I\u1d2cI\u1d2e | AB | A and B antigens | Neither (universal recipient) |\n| ii | O | No antigens | Anti-A and Anti-B (universal donor) |\n\n**Example cross:** Mother is type A (I\u1d2ci) \u00d7 Father is type B (I\u1d2ei)\n\n|  | **I\u1d2e** | **i** |\n|--|---------|-------|\n| **I\u1d2c** | I\u1d2cI\u1d2e (AB) | I\u1d2ci (A) |\n| **i** | I\u1d2ei (B) | ii (O) |\n\nPossible blood types: A, B, AB, O (1:1:1:1)'),
  q(7, 'A mother with blood type AB and a father with blood type O have children. Which blood types are possible in their offspring?',
    ['Only AB', 'A and B only', 'A, B, and O', 'A, B, AB, and O'], 1,
    'Mother AB = I\u1d2cI\u1d2e; Father O = ii. All children receive one allele from each parent: I\u1d2ci (type A) or I\u1d2ei (type B). No child can be AB or O from this cross.'),
  t(8, '### Sex Determination and Sex-Linked Inheritance\n\n**Sex determination in humans:**\n- Females: XX (two X chromosomes)\n- Males: XY (one X, one Y)\n- The **SRY gene** on the Y chromosome triggers male development\n- The mother always contributes an X; the father contributes either X or Y\n\n**Sex-linked inheritance:**\nGenes located on the X chromosome are **X-linked**. Since males have only one X, they express any allele on it (hemizygous).\n\n**Example: Haemophilia** (X-linked recessive)\n- X\u1d34 = normal clotting (dominant)\n- X\u02b0 = haemophilia (recessive)\n\n| Genotype | Phenotype |\n|----------|----------|\n| X\u1d34X\u1d34 | Normal female |\n| X\u1d34X\u02b0 | Carrier female (unaffected) |\n| X\u02b0X\u02b0 | Haemophiliac female (rare) |\n| X\u1d34Y | Normal male |\n| X\u02b0Y | Haemophiliac male |\n\nMales are more commonly affected because they only need one copy of the recessive allele.'),
  fb(9, 'In sex-linked inheritance, males are more commonly affected by X-linked recessive conditions because they have only ___ X chromosome(s). A carrier female has the genotype ___.',
    ['one', 'X\u1d34X\u02b0'],
    'Males have one X chromosome (XY), so a single recessive allele on the X will be expressed. Females need two copies to show the condition. A carrier female (X\u1d34X\u02b0) has one normal allele and one recessive allele.'),
  t(10, '### Genetic Pedigree Diagrams\n\nPedigree diagrams trace the inheritance of a trait through a family.\n\n**Symbols:**\n- Square = male; Circle = female\n- Filled (shaded) = affected; Open (unshaded) = unaffected\n- Half-filled = carrier\n- Horizontal line = mating pair\n- Vertical line = offspring\n\n**How to determine the inheritance pattern:**\n1. If two unaffected parents have an affected child \u2192 trait is **recessive**\n2. If the trait appears in every generation \u2192 likely **dominant**\n3. If more males are affected and no male-to-male transmission \u2192 likely **X-linked recessive**\n4. If affected father has all carrier daughters and no affected sons \u2192 **X-linked recessive** confirmed'),
];

// =============================================================================
// CHAPTER 6: Genetic Engineering (Term 2)
// =============================================================================
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Genetic Engineering and Biotechnology\n\n### What is Genetic Engineering?\n\nGenetic engineering (also called recombinant DNA technology) is the deliberate modification of an organism\u2019s genetic material by inserting, deleting, or altering DNA sequences.\n\n### Key Techniques\n\n**Restriction enzymes:** Molecular scissors that cut DNA at specific recognition sequences. They produce sticky ends or blunt ends.\n\n**DNA ligase:** An enzyme that joins (seals) DNA fragments together.\n\n**Vectors:** Carriers used to transfer the desired gene into a host cell. Common vectors include:\n- Plasmids (small circular DNA in bacteria)\n- Viruses\n\n**Basic steps of genetic engineering:**\n1. **Identify** the gene of interest\n2. **Cut** it out using restriction enzymes\n3. **Insert** the gene into a vector (e.g., plasmid) using DNA ligase\n4. **Transform** the host cell with the recombinant vector\n5. **Select** transformed cells and allow them to express the gene'),
  t(2, '### Applications of Genetic Engineering\n\n**Medical applications:**\n- **Insulin production**: Human insulin gene inserted into *E. coli* bacteria, which then produce large quantities of human insulin for diabetics\n- **Gene therapy**: Replacing defective genes with functional copies to treat genetic disorders\n- **Vaccines**: Genetically modified organisms used to produce safer vaccines\n\n**Agricultural applications:**\n- **Bt crops**: Crops modified with a gene from *Bacillus thuringiensis* that produces a protein toxic to certain insect pests\n- **Golden rice**: Rice modified to produce beta-carotene (vitamin A precursor) to combat vitamin A deficiency\n- **Drought-resistant crops**: Genes from drought-tolerant species inserted to improve crop resilience\n\n**Forensic applications:**\n- **DNA fingerprinting/profiling**: Using unique DNA patterns to identify individuals in criminal investigations, paternity testing, and disaster victim identification'),
  q(3, 'Which enzyme is used to cut DNA at specific recognition sequences in genetic engineering?',
    ['DNA ligase', 'DNA polymerase', 'Restriction enzymes', 'RNA polymerase'], 2,
    'Restriction enzymes (restriction endonucleases) recognise and cut DNA at specific base sequences. They are the "molecular scissors" of genetic engineering. DNA ligase is used to join DNA fragments.'),
  t(4, '### DNA Fingerprinting (DNA Profiling)\n\nDNA fingerprinting analyses regions of DNA that vary between individuals (called short tandem repeats or STRs).\n\n**Process:**\n1. **Extraction**: DNA is extracted from a sample (blood, hair, saliva, skin cells)\n2. **Amplification**: PCR (polymerase chain reaction) makes millions of copies of specific DNA regions\n3. **Cutting**: Restriction enzymes cut the DNA into fragments of different lengths\n4. **Separation**: Gel electrophoresis separates fragments by size (smaller fragments move further)\n5. **Comparison**: The banding pattern is compared with other samples\n\n**Uses:**\n- **Paternity testing**: A child inherits half their DNA from each parent, so their bands must match one parent or the other\n- **Criminal investigations**: DNA from a crime scene is compared with suspect DNA\n- **Identification of genetic relationships**: Between species or populations'),
  fb(5, 'PCR stands for ___. It is used to make millions of copies of a specific DNA region. The technique that separates DNA fragments by size is called ___.',
    ['polymerase chain reaction', 'gel electrophoresis'],
    'PCR (polymerase chain reaction) amplifies small quantities of DNA. Gel electrophoresis separates DNA fragments in an electric field \u2014 smaller fragments migrate further through the gel.'),
  t(6, '### Stem Cells and Cloning\n\n**Stem cells** are undifferentiated cells that can divide and develop into specialised cell types.\n\n**Types of stem cells:**\n- **Embryonic stem cells**: From early embryos (blastocyst stage); **pluripotent** \u2014 can become any cell type\n- **Adult stem cells**: Found in bone marrow, skin, etc.; **multipotent** \u2014 can become a limited range of cell types\n- **Induced pluripotent stem cells (iPSCs)**: Adult cells reprogrammed to behave like embryonic stem cells\n\n**Cloning:**\n- **Reproductive cloning**: Creating a genetically identical organism (e.g., Dolly the sheep \u2014 cloned using somatic cell nuclear transfer in 1996)\n- **Therapeutic cloning**: Creating cloned embryos to harvest stem cells for medical treatment (not to produce a new organism)\n\n**Somatic cell nuclear transfer (SCNT):**\n1. Remove the nucleus from an egg cell (enucleation)\n2. Insert a nucleus from a somatic (body) cell of the donor\n3. Stimulate the cell to divide\n4. Implant into a surrogate mother (reproductive) or harvest stem cells (therapeutic)'),
  q(7, 'What makes embryonic stem cells more useful for medical research than adult stem cells?',
    ['They are easier to obtain', 'They are pluripotent and can differentiate into any cell type', 'They divide more slowly', 'They do not cause ethical concerns'], 1,
    'Embryonic stem cells are pluripotent, meaning they can develop into any of the over 200 cell types in the human body. Adult stem cells are multipotent and can only form a limited range of related cell types.'),
  t(8, '### Ethical Considerations in Genetic Engineering\n\n**Arguments FOR genetic engineering:**\n- Can cure or prevent genetic diseases\n- Improves crop yields and nutritional value to fight hunger\n- Produces medicines (insulin, growth hormone) more cheaply\n- DNA profiling helps solve crimes and confirm identity\n\n**Arguments AGAINST genetic engineering:**\n- **Environmental risks**: GM organisms may interbreed with wild species, reducing biodiversity\n- **Health concerns**: Long-term effects of GM foods on humans are not fully known\n- **Ethical concerns**: Cloning humans raises moral and religious objections\n- **Embryonic stem cell research**: Involves destroying embryos, which some consider to be living beings\n- **Designer babies**: Selecting traits raises concerns about eugenics\n- **Bioweapons**: Knowledge could be misused to create biological weapons\n- **Patenting genes**: Raises questions about who owns genetic information\n\n**South African context:** The GMO Act (Act 15 of 1997) regulates genetically modified organisms in South Africa.'),
  q(9, 'Which of the following is a valid ethical concern about genetic engineering?',
    ['It is too expensive to be useful', 'GM crops always taste worse', 'GM organisms could reduce biodiversity if they interbreed with wild species', 'Genetic engineering always fails'], 2,
    'One of the main environmental concerns is that genetically modified organisms could crossbreed with wild species, potentially transferring their modified genes and reducing biodiversity.'),
  fb(10, 'Dolly the sheep was cloned in ___ (year) using a technique called somatic cell nuclear ___.',
    ['1996', 'transfer'],
    'Dolly the sheep was the first mammal cloned from an adult somatic cell using somatic cell nuclear transfer (SCNT) at the Roslin Institute in Scotland in 1996.'),
];

// =============================================================================
// CHAPTER 7: Responding to the Environment \u2014 Humans (Term 2)
// =============================================================================
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## The Human Nervous System\n\n### Overview\n\nThe nervous system enables the body to detect changes (stimuli) in the environment and respond appropriately. It is divided into:\n\n1. **Central Nervous System (CNS):** Brain and spinal cord\n2. **Peripheral Nervous System (PNS):** All nerves outside the CNS\n   - **Sensory (afferent) neurons**: Carry impulses from receptors to the CNS\n   - **Motor (efferent) neurons**: Carry impulses from the CNS to effectors (muscles/glands)\n3. **Autonomic Nervous System (ANS):** Controls involuntary functions\n   - **Sympathetic**: Fight-or-flight responses (increases heart rate, dilates pupils)\n   - **Parasympathetic**: Rest-and-digest responses (slows heart rate, stimulates digestion)\n\n**Neuron structure:**\n- **Cell body**: Contains the nucleus\n- **Dendrites**: Receive impulses\n- **Axon**: Transmits impulses away from the cell body\n- **Myelin sheath**: Insulates the axon, speeds up impulse transmission (saltatory conduction)\n- **Synapse**: Gap between two neurons where chemical transmission occurs via neurotransmitters (e.g., acetylcholine)'),
  t(2, '### The Human Eye\n\n**Structure and Function:**\n\n| Part | Function |\n|------|----------|\n| **Cornea** | Transparent front layer; refracts (bends) light |\n| **Aqueous humour** | Clear fluid in front chamber; maintains shape, refracts light |\n| **Iris** | Coloured part; controls the size of the pupil |\n| **Pupil** | Opening in the iris; allows light to enter |\n| **Lens** | Focuses light onto the retina; changes shape (accommodation) |\n| **Ciliary body/muscles** | Change the shape of the lens for near/far vision |\n| **Suspensory ligaments** | Hold the lens in place; connect it to ciliary muscles |\n| **Vitreous humour** | Jelly-like substance; maintains shape of eyeball |\n| **Retina** | Contains photoreceptors (rods and cones); converts light to nerve impulses |\n| **Rods** | Sensitive to dim light; no colour (peripheral and night vision) |\n| **Cones** | Sensitive to bright light and colour (3 types: red, green, blue) |\n| **Fovea** | Highest concentration of cones; sharpest vision |\n| **Optic nerve** | Carries impulses from retina to brain |\n| **Blind spot** | Where optic nerve exits; no photoreceptors |\n| **Choroid** | Dark pigmented layer; prevents reflection; supplies blood |'),
  q(3, 'Which part of the eye is responsible for changing the shape of the lens to focus on near or distant objects?',
    ['Iris', 'Retina', 'Ciliary muscles', 'Optic nerve'], 2,
    'The ciliary muscles contract or relax to change the shape of the lens \u2014 a process called accommodation. For near objects, ciliary muscles contract, making the lens thicker (more curved). For distant objects, they relax, making the lens thinner (flatter).'),
  t(4, '### Eye Defects and Corrections\n\n**Myopia (short-sightedness):**\n- Can see near objects clearly but distant objects appear blurred\n- Cause: Eyeball too long or lens too curved \u2192 image focuses in front of retina\n- Correction: **Concave (diverging) lens** to spread light rays before entering the eye\n\n**Hyperopia (far-sightedness):**\n- Can see distant objects clearly but near objects appear blurred\n- Cause: Eyeball too short or lens too flat \u2192 image focuses behind retina\n- Correction: **Convex (converging) lens** to bend light rays inward before entering the eye\n\n**Astigmatism:**\n- Uneven curvature of the cornea or lens causing distorted vision\n- Correction: Cylindrical lens\n\n**Cataracts:**\n- Clouding of the lens, causing blurred vision\n- Treatment: Surgical replacement of the lens'),
  fb(5, 'Myopia is corrected with a ___ lens, while hyperopia is corrected with a ___ lens.',
    ['concave', 'convex'],
    'A concave (diverging) lens corrects myopia by spreading light before it enters the eye, moving the focal point back onto the retina. A convex (converging) lens corrects hyperopia by bending light inward, moving the focal point forward onto the retina.'),
  t(6, '### The Human Ear\n\n**Structure and Function:**\n\n**Outer ear:**\n- **Pinna**: Collects and directs sound waves into the ear canal\n- **Ear canal (external auditory meatus)**: Channels sound to the eardrum\n- **Eardrum (tympanic membrane)**: Vibrates when sound waves hit it\n\n**Middle ear (air-filled):**\n- **Ossicles**: Three tiny bones \u2014 **malleus** (hammer), **incus** (anvil), **stapes** (stirrup) \u2014 amplify vibrations\n- **Oval window**: Membrane connecting middle ear to inner ear\n- **Eustachian tube**: Connects middle ear to throat; equalises air pressure\n\n**Inner ear (fluid-filled):**\n- **Cochlea**: Coiled tube containing the **organ of Corti** with hair cells that convert vibrations into nerve impulses\n- **Semicircular canals** (3): Detect rotational movement for balance\n- **Vestibule**: Contains utricle and saccule; detects linear acceleration and head position (gravity)\n- **Auditory nerve**: Carries impulses from cochlea to brain'),
  q(7, 'What is the correct pathway of sound through the ear?',
    ['Pinna \u2192 eardrum \u2192 cochlea \u2192 ossicles \u2192 brain', 'Pinna \u2192 ear canal \u2192 eardrum \u2192 ossicles \u2192 oval window \u2192 cochlea \u2192 auditory nerve \u2192 brain', 'Ear canal \u2192 ossicles \u2192 eardrum \u2192 cochlea \u2192 brain', 'Pinna \u2192 oval window \u2192 ossicles \u2192 eardrum \u2192 cochlea \u2192 brain'], 1,
    'Sound enters through the pinna, travels along the ear canal, vibrates the eardrum, is amplified by the ossicles (malleus, incus, stapes), transferred to the oval window, then to the fluid in the cochlea where hair cells convert vibrations to nerve impulses sent to the brain via the auditory nerve.'),
  t(8, '### The Reflex Arc\n\nA **reflex** is a rapid, involuntary response to a stimulus. It protects the body from harm.\n\n**Components of a reflex arc (in order):**\n1. **Receptor** \u2014 detects the stimulus (e.g., pain receptor in finger)\n2. **Sensory (afferent) neuron** \u2014 transmits impulse to the CNS\n3. **Relay (interneuron)** \u2014 in the spinal cord; connects sensory and motor neurons\n4. **Motor (efferent) neuron** \u2014 transmits impulse to the effector\n5. **Effector** \u2014 carries out the response (muscle contracts or gland secretes)\n\n**Example:** Touching a hot plate:\n- Receptor: Pain receptor in fingertip\n- Sensory neuron carries impulse to spinal cord\n- Interneuron in spinal cord relays signal\n- Motor neuron carries impulse to arm muscle\n- Effector: Bicep muscle contracts, pulling hand away\n\nThe brain is NOT directly involved in the reflex \u2014 the response occurs before you consciously feel the pain.'),
  q(9, 'In a reflex arc, what is the correct order of the components?',
    ['Effector \u2192 motor neuron \u2192 relay neuron \u2192 sensory neuron \u2192 receptor', 'Receptor \u2192 motor neuron \u2192 relay neuron \u2192 sensory neuron \u2192 effector', 'Receptor \u2192 sensory neuron \u2192 relay neuron \u2192 motor neuron \u2192 effector', 'Sensory neuron \u2192 receptor \u2192 relay neuron \u2192 effector \u2192 motor neuron'], 2,
    'The reflex arc follows: Receptor (detects stimulus) \u2192 Sensory neuron (carries impulse to CNS) \u2192 Relay neuron (in spinal cord) \u2192 Motor neuron (carries impulse to effector) \u2192 Effector (responds).'),
  fb(10, 'The sympathetic nervous system prepares the body for ___ responses, while the parasympathetic nervous system controls ___ functions.',
    ['fight-or-flight', 'rest-and-digest'],
    'The sympathetic division activates during stress (fight-or-flight), increasing heart rate and blood pressure. The parasympathetic division promotes calm (rest-and-digest), slowing heart rate and stimulating digestion.'),
];

// =============================================================================
// CHAPTER 8: Human Endocrine System (Term 2)
// =============================================================================
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## The Human Endocrine System\n\n### Endocrine vs Exocrine Glands\n\n| Feature | Endocrine glands | Exocrine glands |\n|---------|-------------------|------------------|\n| Ducts | **Ductless** \u2014 secrete directly into blood | Have ducts to transport secretions |\n| Secretion | Hormones | Enzymes, sweat, saliva, mucus |\n| Transport | Via bloodstream | Via ducts to target area |\n| Speed | Slower but longer-lasting effects | Faster but more localised |\n| Examples | Pituitary, thyroid, adrenal, pancreas | Salivary glands, sweat glands, liver |\n\n**Hormones** are chemical messengers produced by endocrine glands. They travel in the blood to **target organs** where they produce a specific response.'),
  t(2, '### Major Endocrine Glands and Their Hormones\n\n| Gland | Hormone(s) | Function |\n|-------|-----------|----------|\n| **Hypothalamus** | Releasing/inhibiting hormones | Controls the pituitary gland |\n| **Pituitary (anterior)** | TSH, FSH, LH, GH, ACTH, prolactin | Master gland; controls other endocrine glands |\n| **Pituitary (posterior)** | ADH (vasopressin), oxytocin | Water balance; uterine contractions |\n| **Thyroid** | Thyroxin (T4) | Controls metabolic rate |\n| **Parathyroid** | Parathormone | Regulates blood calcium levels |\n| **Adrenal medulla** | Adrenaline | Fight-or-flight response |\n| **Adrenal cortex** | Cortisol, aldosterone | Stress response, water/salt balance |\n| **Pancreas (Islets of Langerhans)** | Insulin (\u03b2 cells), Glucagon (\u03b1 cells) | Regulates blood glucose |\n| **Ovaries** | Oestrogen, Progesterone | Female secondary sexual characteristics, menstrual cycle |\n| **Testes** | Testosterone | Male secondary sexual characteristics, sperm production |'),
  q(3, 'Which gland is known as the "master gland" because it controls many other endocrine glands?',
    ['Hypothalamus', 'Thyroid', 'Pituitary', 'Adrenal'], 2,
    'The pituitary gland is called the master gland because it produces hormones (like TSH, FSH, LH, ACTH, GH) that regulate the activity of other endocrine glands. However, the pituitary itself is controlled by the hypothalamus.'),
  t(4, '### Negative Feedback: TSH and Thyroxin\n\n**Negative feedback** is a control mechanism where the output of a system inhibits the system, maintaining homeostasis.\n\n**TSH-Thyroxin feedback loop:**\n1. The hypothalamus detects low thyroxin levels and releases TRH (thyrotropin-releasing hormone)\n2. TRH stimulates the anterior pituitary to release **TSH** (thyroid-stimulating hormone)\n3. TSH stimulates the **thyroid gland** to produce **thyroxin**\n4. Thyroxin increases the metabolic rate\n5. When thyroxin levels rise above normal, this **inhibits** the hypothalamus and pituitary \u2192 less TRH and TSH produced\n6. Less TSH means less thyroxin production \u2192 levels return to normal\n\n**Thyroid disorders:**\n- **Hypothyroidism** (too little thyroxin): Low metabolic rate, weight gain, fatigue, feeling cold, goitre (enlarged thyroid if due to iodine deficiency)\n- **Hyperthyroidism** (too much thyroxin): High metabolic rate, weight loss, anxiety, rapid heartbeat, bulging eyes (Graves\u2019 disease)'),
  fb(5, 'In negative feedback, high levels of thyroxin ___ (stimulate/inhibit) the release of TSH from the pituitary gland. A deficiency of ___ in the diet can cause a goitre.',
    ['inhibit', 'iodine'],
    'High thyroxin levels inhibit the hypothalamus and pituitary gland, reducing TRH and TSH release (negative feedback). Iodine is needed to produce thyroxin, so iodine deficiency causes the thyroid to enlarge (goitre) as it tries to produce more thyroxin.'),
  t(6, '### Negative Feedback: Insulin and Glucagon\n\nThe pancreas regulates blood glucose levels using two hormones:\n\n**When blood glucose is HIGH (e.g., after a meal):**\n1. Beta (\u03b2) cells in the islets of Langerhans detect the rise\n2. Beta cells secrete **insulin**\n3. Insulin stimulates:\n   - Cells to take up glucose from the blood\n   - Liver to convert glucose to **glycogen** (glycogenesis)\n   - Cells to increase glucose metabolism\n4. Blood glucose level drops back to normal\n\n**When blood glucose is LOW (e.g., between meals):**\n1. Alpha (\u03b1) cells detect the drop\n2. Alpha cells secrete **glucagon**\n3. Glucagon stimulates:\n   - Liver to convert glycogen back to glucose (**glycogenolysis**)\n   - Liver to produce new glucose from amino acids (**gluconeogenesis**)\n4. Blood glucose level rises back to normal\n\nThis is an example of **antagonistic hormones** \u2014 insulin and glucagon have opposite effects.'),
  q(7, 'A person has just eaten a large meal. Which sequence of events correctly describes blood glucose regulation?',
    ['Blood glucose rises \u2192 glucagon released \u2192 glycogen stored \u2192 glucose drops', 'Blood glucose rises \u2192 insulin released \u2192 glucose taken up by cells \u2192 glucose drops', 'Blood glucose drops \u2192 insulin released \u2192 glycogen broken down \u2192 glucose rises', 'Blood glucose rises \u2192 adrenaline released \u2192 glucose stored \u2192 glucose drops'], 1,
    'After a meal, blood glucose rises. Beta cells of the pancreas release insulin, which stimulates cells to absorb glucose and the liver to store it as glycogen. Blood glucose returns to normal.'),
  t(8, '### Diabetes Mellitus\n\n| Feature | Type 1 Diabetes | Type 2 Diabetes |\n|---------|----------------|----------------|\n| Cause | Autoimmune destruction of beta cells | Cells become resistant to insulin |\n| Onset | Usually childhood/young adults | Usually adults (increasingly in youth) |\n| Insulin production | Little to none | Normal or reduced |\n| Treatment | Insulin injections | Diet, exercise, oral medication, sometimes insulin |\n| Risk factors | Genetic | Obesity, inactivity, genetics, diet |\n\n**Complications of uncontrolled diabetes:**\n- Cardiovascular disease\n- Kidney damage (nephropathy)\n- Nerve damage (neuropathy)\n- Eye damage (retinopathy) \u2192 blindness\n- Poor wound healing\n- Increased risk of infections'),
  q(9, 'What is the key difference between Type 1 and Type 2 diabetes?',
    ['Type 1 is caused by obesity; Type 2 is genetic', 'Type 1 involves autoimmune destruction of beta cells; Type 2 involves insulin resistance', 'Type 1 only affects adults; Type 2 affects children', 'Type 1 is more common than Type 2'], 1,
    'Type 1 diabetes is an autoimmune condition where the immune system destroys the beta cells of the pancreas, so little or no insulin is produced. Type 2 diabetes involves the body cells becoming resistant to insulin, or the pancreas not producing enough insulin.'),
  fb(10, 'The hormone ___ lowers blood glucose levels, while the hormone ___ raises blood glucose levels. They are produced by the ___ gland.',
    ['insulin', 'glucagon', 'pancreas'],
    'Insulin (from beta cells) lowers blood glucose by promoting uptake and storage. Glucagon (from alpha cells) raises blood glucose by promoting glycogen breakdown. Both are produced by the islets of Langerhans in the pancreas.'),
];

// =============================================================================
// CHAPTER 9: Homeostasis in Humans (Term 2)
// =============================================================================
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Homeostasis in Humans\n\n### What is Homeostasis?\n\nHomeostasis is the maintenance of a constant internal environment despite changes in external conditions. The body must regulate:\n\n- **Body temperature** (thermoregulation)\n- **Water and salt balance** (osmoregulation)\n- **Blood glucose levels** (see Chapter 8)\n- **Blood CO\u2082 and O\u2082 levels**\n- **Blood pH**\n\n**Components of a homeostatic control system:**\n1. **Receptor**: Detects changes (stimulus)\n2. **Control centre**: Processes information and determines response (usually hypothalamus)\n3. **Effector**: Carries out the response (muscles, glands)\n\nMost homeostatic mechanisms use **negative feedback** \u2014 the response counteracts the change and returns conditions to the set point.'),
  t(2, '### Thermoregulation\n\nThe hypothalamus is the body\u2019s thermostat. Normal core body temperature is approximately **37\u00b0C**.\n\n**When body temperature is TOO HIGH:**\n- Blood vessels in the skin **vasodilate** (widen) \u2192 more blood flows near skin surface \u2192 more heat lost by radiation\n- **Sweat glands** increase sweat production \u2192 evaporation of sweat cools the skin\n- **Hair erector muscles relax** \u2192 hairs lie flat \u2192 less insulating air trapped\n- Metabolic rate decreases\n\n**When body temperature is TOO LOW:**\n- Blood vessels **vasoconstrict** (narrow) \u2192 less blood flows near skin surface \u2192 less heat lost\n- **Shivering**: Rapid involuntary muscle contractions generate heat\n- **Hair erector muscles contract** \u2192 hairs stand upright (goosebumps) \u2192 traps air for insulation\n- Metabolic rate increases (thyroxin levels rise)\n- **Adrenaline** is released to increase cellular respiration and heat production'),
  q(3, 'Which of the following occurs when the body is too hot?',
    ['Vasoconstriction of skin blood vessels', 'Vasodilation of skin blood vessels and increased sweating', 'Shivering and vasoconstriction', 'Hair erector muscles contract'], 1,
    'When the body is too hot, blood vessels in the skin vasodilate to increase blood flow near the surface for heat loss, and sweat glands produce more sweat. Evaporation of sweat cools the body.'),
  t(4, '### Osmoregulation and the Kidney\n\nThe kidneys regulate water and salt balance (osmoregulation) and remove nitrogenous waste (urea).\n\n**Structure of the kidney:**\n- Each kidney contains about 1 million **nephrons** (functional units)\n- Blood enters via the **renal artery** and leaves via the **renal vein**\n- Urine leaves via the **ureter** to the bladder\n\n**Structure of a nephron:**\n1. **Bowman\u2019s capsule**: Cup-shaped structure surrounding the glomerulus\n2. **Glomerulus**: Knot of capillaries where ultrafiltration occurs\n3. **Proximal convoluted tubule (PCT)**: Reabsorbs glucose, amino acids, and some salts\n4. **Loop of Henle**: Creates a concentration gradient in the medulla; reabsorbs water\n5. **Distal convoluted tubule (DCT)**: Fine-tunes salt and water reabsorption\n6. **Collecting duct**: Collects urine; water reabsorption controlled by ADH'),
  t(5, '### ADH and Water Balance\n\n**ADH (antidiuretic hormone)** is produced by the hypothalamus and released by the posterior pituitary. It controls water reabsorption in the collecting duct.\n\n**When blood is too concentrated (dehydrated):**\n- Osmoreceptors in the hypothalamus detect high blood osmolarity\n- Hypothalamus signals the posterior pituitary to release **more ADH**\n- ADH makes the collecting duct walls **more permeable** to water\n- More water is reabsorbed back into the blood\n- Result: Small volume of concentrated urine\n\n**When blood is too dilute (overhydrated):**\n- Osmoreceptors detect low blood osmolarity\n- **Less ADH** is released\n- Collecting duct walls are **less permeable** to water\n- Less water is reabsorbed\n- Result: Large volume of dilute urine\n\nThis is negative feedback: the result (corrected blood concentration) inhibits further ADH release.'),
  q(6, 'On a hot day, a person drinks very little water. What would you expect?',
    ['Large volume of dilute urine', 'Small volume of concentrated urine', 'No urine produced', 'Large volume of concentrated urine'], 1,
    'When dehydrated, the body releases more ADH, increasing water reabsorption in the kidneys. This produces a small volume of concentrated (dark yellow) urine to conserve water.'),
  fb(7, 'The hormone ___ controls water reabsorption in the collecting duct of the nephron. When the blood is too concentrated, ___ (more/less) ADH is released.',
    ['ADH', 'more'],
    'ADH (antidiuretic hormone) increases the permeability of the collecting duct to water. When blood is too concentrated (dehydrated), more ADH is released to reabsorb more water and dilute the blood.'),
  t(8, '### Gaseous Exchange\n\nThe lungs facilitate the exchange of O\u2082 and CO\u2082 between the blood and the air.\n\n**CO\u2082 and pH regulation:**\n- CO\u2082 + H\u2082O \u2192 H\u2082CO\u2083 (carbonic acid) \u2192 H\u207a + HCO\u2083\u207b\n- High CO\u2082 \u2192 blood becomes more acidic (pH drops)\n- Chemoreceptors in the medulla oblongata and carotid/aortic bodies detect the rise in CO\u2082 / drop in pH\n- Breathing rate and depth **increase** to expel more CO\u2082\n- As CO\u2082 drops, pH returns to normal\n\n**Oxygen-haemoglobin association:**\n- In the lungs: High O\u2082 concentration \u2192 O\u2082 binds to haemoglobin (HbO\u2082)\n- In the tissues: Low O\u2082, high CO\u2082 \u2192 O\u2082 is released from haemoglobin'),
  q(9, 'What happens when blood CO\u2082 levels rise above normal?',
    ['Breathing rate decreases', 'Breathing rate and depth increase to remove excess CO\u2082', 'The kidneys excrete CO\u2082', 'ADH is released'], 1,
    'High CO\u2082 levels are detected by chemoreceptors. The brain increases the rate and depth of breathing to expel more CO\u2082 from the lungs, returning blood CO\u2082 and pH to normal levels.'),
  fb(10, 'When body temperature drops below normal, blood vessels in the skin ___ (vasodilate/vasoconstrict) and ___ occurs to generate heat.',
    ['vasoconstrict', 'shivering'],
    'Vasoconstriction reduces blood flow to the skin surface, minimising heat loss. Shivering involves rapid involuntary muscle contractions that generate heat to warm the body.'),
];

// =============================================================================
// CHAPTER 10: Responding to the Environment \u2014 Plants (Term 2)
// =============================================================================
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Plant Hormones and Responses\n\n### Plant Hormones\n\nPlants produce hormones (also called plant growth regulators) that control growth, development, and responses to environmental stimuli.\n\n| Hormone | Where produced | Functions |\n|---------|---------------|----------|\n| **Auxins (IAA)** | Shoot tips (apical meristems) | Promote cell elongation, phototropism, geotropism, apical dominance |\n| **Gibberellins** | Young leaves, seeds, root tips | Promote stem elongation, seed germination, flowering, fruit development |\n| **Abscisic acid (ABA)** | Leaves, stems, roots | Inhibits growth, promotes dormancy, closes stomata during drought |\n| **Cytokinins** | Root tips | Promote cell division, delay senescence (ageing) |\n| **Ethylene** | Ripening fruits, ageing tissues | Promotes fruit ripening, leaf and flower senescence |'),
  t(2, '### Tropisms\n\nA **tropism** is a growth response of a plant towards or away from a directional stimulus.\n\n- **Positive tropism**: Growth towards the stimulus\n- **Negative tropism**: Growth away from the stimulus\n\n| Tropism | Stimulus | Shoot response | Root response |\n|---------|----------|---------------|---------------|\n| **Phototropism** | Light | Positive (grows towards) | Negative (grows away) |\n| **Geotropism (gravitropism)** | Gravity | Negative (grows upwards) | Positive (grows downwards) |\n| **Thigmotropism** | Touch/contact | Positive (tendrils wrap around support) | N/A |\n| **Hydrotropism** | Water | Negative | Positive (grows towards water) |'),
  t(3, '### How Auxin Controls Phototropism\n\n**Experiment background:** The Went experiment (1928) demonstrated auxin redistribution.\n\n**In a shoot tip exposed to light from one side:**\n1. Light causes auxin to move to the **shaded side** of the shoot\n2. Higher auxin concentration on the shaded side causes those cells to **elongate more**\n3. The shoot bends **towards the light** (positive phototropism)\n\n**In a root tip:**\n1. Auxin also moves to the shaded side\n2. However, roots are **more sensitive to auxin** than shoots\n3. High auxin concentration **inhibits** root cell elongation\n4. The illuminated side (with less auxin) grows faster\n5. The root bends **away from the light** (negative phototropism)\n\n**Key principle:** The same hormone (auxin) has different effects at different concentrations and in different tissues.'),
  q(4, 'A shoot is placed horizontally in the dark. Auxin accumulates on the lower side due to gravity. What happens?',
    ['The shoot grows downward', 'The shoot bends upward (negative geotropism)', 'The shoot continues to grow horizontally', 'The shoot stops growing'], 1,
    'In a horizontal shoot, gravity causes auxin to accumulate on the lower side. In shoots, high auxin stimulates cell elongation, so the lower side grows faster and the shoot curves upward. This is negative geotropism.'),
  fb(5, 'A growth response towards a stimulus is called a ___ tropism. Tendrils wrapping around a support is an example of ___.',
    ['positive', 'thigmotropism'],
    'Growth towards a stimulus is positive tropism; growth away is negative tropism. Thigmotropism is a growth response to touch or contact, seen when plant tendrils wrap around supports.'),
  t(6, '### Geotropism in Roots and Shoots\n\n**In a horizontally placed root:**\n1. Gravity causes auxin to accumulate on the lower side\n2. Roots are sensitive to auxin: high auxin **inhibits** cell elongation\n3. The upper side (less auxin) elongates more than the lower side\n4. The root bends **downward** (positive geotropism)\n\n**Summary:**\n- Shoots: High auxin \u2192 more elongation \u2192 bend AWAY from gravity (negative geotropism)\n- Roots: High auxin \u2192 less elongation (inhibited) \u2192 bend TOWARDS gravity (positive geotropism)\n\nThis difference explains why shoots grow upward and roots grow downward, even in the dark where light is not a factor.'),
  t(7, '### Plant Defence Mechanisms\n\nPlants cannot run away from threats, so they have evolved various defence mechanisms:\n\n**Physical/structural defences:**\n- **Thorns and spines**: Deter herbivores (e.g., roses, acacias)\n- **Thick bark**: Protects against fire and pathogens\n- **Waxy cuticle**: Prevents water loss and pathogen entry\n- **Trichomes (hairy leaves)**: Deter insects\n\n**Chemical defences:**\n- **Tannins**: Bitter taste deters herbivores (e.g., tea leaves)\n- **Alkaloids**: Toxic compounds (e.g., caffeine, nicotine, morphine)\n- **Latex**: Sticky substance that traps insects (e.g., milkweed)\n- **Essential oils**: Repel herbivores (e.g., citronella)\n\n**Biological defences:**\n- **Mutualism with ants**: Some acacia trees provide shelter and food for ants, which in turn defend the tree against herbivores'),
  q(8, 'Which of the following is a chemical defence mechanism in plants?',
    ['Thorns', 'Thick bark', 'Tannins that give a bitter taste', 'Waxy cuticle'], 2,
    'Tannins are chemical compounds produced by plants that give a bitter taste, deterring herbivores from eating the plant. Thorns, thick bark, and waxy cuticle are physical/structural defences.'),
  q(9, 'Abscisic acid (ABA) promotes stomatal closure during drought. Why is this important?',
    ['To increase photosynthesis', 'To reduce water loss through transpiration', 'To increase CO\u2082 uptake', 'To attract pollinators'], 1,
    'During drought, ABA signals guard cells to close stomata, reducing water loss by transpiration. This conserves water at the cost of reduced gas exchange and photosynthesis.'),
  fb(10, 'Auxin is produced at the ___ of shoots. In geotropism, roots show a ___ (positive/negative) response to gravity.',
    ['tip', 'positive'],
    'Auxin (IAA) is synthesised in the apical meristem (tip) of shoots. Roots grow towards gravity (positive geotropism) because high auxin concentration on the lower side inhibits elongation there, causing the root to curve downward.'),
];

// =============================================================================
// CHAPTER 11: Evolution (Term 3)
// =============================================================================
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Evolution\n\n### What is Evolution?\n\n**Biological evolution** is the change in the inherited characteristics (allele frequencies) of a population over successive generations.\n\nEvolution is NOT about individual organisms changing during their lifetime \u2014 it is about populations changing over many generations.\n\n### Evidence for Evolution\n\n1. **Fossil record**: Shows how organisms have changed over time; transitional fossils (e.g., *Archaeopteryx* \u2014 features of both dinosaurs and birds)\n2. **Comparative anatomy**: Homologous structures (same origin, different function) suggest common ancestry. E.g., forelimbs of humans, whales, bats, and dogs.\n3. **Biogeography**: Distribution of species across continents explained by common ancestors and continental drift\n4. **Molecular evidence**: DNA and protein sequence comparisons \u2014 more similar sequences = more closely related\n5. **Embryology**: Similar embryonic stages in different vertebrates suggest common ancestry'),
  t(2, '### Lamarckism vs Darwinism\n\n**Lamarck\u2019s theory (1809):**\n- Organisms change during their lifetime in response to their environment\n- **Use and disuse**: Organs that are used become stronger; organs not used degenerate\n- **Inheritance of acquired characteristics**: Changes acquired during an organism\u2019s lifetime are passed to offspring\n- Example: Giraffes stretched their necks to reach high leaves, and this stretched neck was inherited\n- **Why it was rejected**: Acquired characteristics are NOT encoded in DNA and cannot be inherited. Only changes in gamete DNA are passed on.\n\n**Darwin\u2019s theory of Natural Selection (1859):**\n- Within a population, there is **variation** (caused by mutations, meiosis, and sexual reproduction)\n- Organisms produce **more offspring** than the environment can support\n- There is a **struggle for survival** (competition for food, mates, territory)\n- Individuals with **favourable variations** are better adapted and more likely to survive and reproduce\n- These advantageous traits are **inherited** by the next generation\n- Over many generations, the population changes \u2014 this is **natural selection**'),
  q(3, 'Which statement is consistent with Darwin\u2019s theory of natural selection but NOT Lamarck\u2019s theory?',
    ['Organisms develop new traits in response to their needs', 'Individuals with favourable inherited variations are more likely to survive and reproduce', 'Characteristics acquired during life are passed to offspring', 'Organisms can intentionally change their genetic makeup'], 1,
    'Darwin proposed that pre-existing variation (caused by mutations) determines survival, and those with advantageous traits are naturally selected. Lamarck incorrectly proposed that organisms develop traits in response to needs and pass them on.'),
  t(4, '### Punctuated Equilibrium vs Gradualism\n\n**Gradualism:**\n- Evolution occurs slowly and continuously over long periods\n- Small, incremental changes accumulate over millions of years\n- Supported by the fossil record showing gradual transitions\n\n**Punctuated equilibrium** (Gould & Eldredge, 1972):\n- Evolution occurs in rapid bursts of change followed by long periods of stability (stasis)\n- Most change happens during speciation events (when new species form)\n- Explains gaps in the fossil record \u2014 transition periods may be too short to be preserved\n\n**Modern view:** Both patterns likely occur. Some lineages show gradual change, while others show punctuated change. The pattern depends on environmental pressures and the organism.'),
  t(5, '### Artificial Selection\n\n**Artificial selection** is selective breeding by humans to produce organisms with desired traits.\n\n**Examples:**\n- **Dogs**: Humans bred wolves selectively for specific traits (size, temperament, speed) over thousands of years, producing all modern dog breeds\n- **Crops**: Maize was bred from a wild grass (teosinte) with small ears to modern maize with large, productive cobs\n- **Livestock**: Cattle bred for higher milk production or more meat\n\n**Comparison with natural selection:**\n| Natural selection | Artificial selection |\n|------------------|---------------------|\n| Nature selects | Humans select |\n| Selects for survival advantage | Selects for human preference |\n| Takes many generations | Can be faster (deliberate) |\n| Increases biodiversity | Often reduces genetic diversity |'),
  q(6, 'What is a potential disadvantage of artificial selection?',
    ['It takes too long to show results', 'It increases genetic diversity too much', 'It can reduce genetic diversity, making organisms vulnerable to disease', 'It always produces harmful mutations'], 2,
    'Artificial selection reduces genetic diversity because only individuals with desired traits are bred. This can make populations vulnerable to new diseases or environmental changes because there is less genetic variation for natural selection to act upon.'),
  t(7, '### Speciation and Reproductive Isolation\n\n**Speciation** is the formation of new species. It usually requires **reproductive isolation** \u2014 populations can no longer interbreed.\n\n**Types of reproductive isolation:**\n\n**Pre-zygotic barriers** (prevent fertilisation):\n- **Geographic isolation**: Physical barrier separates populations (mountains, rivers, oceans)\n- **Temporal isolation**: Populations breed at different times (different seasons or times of day)\n- **Behavioural isolation**: Different mating calls, dances, or rituals\n- **Mechanical isolation**: Reproductive organs are incompatible\n\n**Post-zygotic barriers** (prevent hybrid success):\n- Hybrid inviability (hybrid embryo does not develop)\n- Hybrid sterility (hybrid offspring cannot reproduce, e.g., mule)\n\n**Allopatric speciation**: Populations are geographically separated \u2192 independent evolution \u2192 eventually become too different to interbreed.'),
  fb(8, 'The formation of new species is called ___. A physical barrier separating populations leads to ___ isolation.',
    ['speciation', 'geographic'],
    'Speciation is the evolutionary process by which new species arise. Geographic isolation occurs when a physical barrier (river, mountain, ocean) separates a population, preventing gene flow and allowing independent evolution.'),
  t(9, '### Human Evolution: Evidence of Common Ancestors\n\nHumans belong to the order **Primates** and the family **Hominidae** (great apes).\n\n**Evidence that humans and other great apes share a common ancestor:**\n1. **DNA similarity**: Humans share approximately 98.7% of DNA with chimpanzees\n2. **Chromosome similarity**: Humans have 46 chromosomes; great apes have 48. Human chromosome 2 appears to be a fusion of two ancestral ape chromosomes.\n3. **Anatomical similarities**: Forward-facing eyes, grasping hands, large brain relative to body size\n4. **Fossil record**: *Australopithecus*, *Homo habilis*, *Homo erectus*, *Homo sapiens* show progressive changes\n5. **Molecular clocks**: Protein and DNA comparisons suggest the human-chimp lineage diverged approximately 6\u20137 million years ago\n\n**Out of Africa Hypothesis:**\n- Modern *Homo sapiens* originated in **Africa** approximately 200 000 years ago\n- Migrated out of Africa in waves, spreading to the rest of the world\n- Supported by: Greatest genetic diversity found in African populations, fossil evidence, mitochondrial DNA analysis (mitochondrial Eve)'),
  q(10, 'The Out of Africa hypothesis is supported by the observation that:',
    ['All human fossils are found only in Africa', 'African populations have the greatest genetic diversity', 'Humans cannot survive outside Africa', 'DNA evidence shows no common ancestor'], 1,
    'The greatest genetic diversity in modern human populations is found in Africa, consistent with Africa being the origin of our species. Populations that migrated out of Africa represent subsets of this original genetic diversity (founder effect).'),
  q(11, 'Humans share approximately what percentage of their DNA with chimpanzees?',
    ['75%', '85%', '95%', '98.7%'], 3,
    'DNA comparisons show that humans and chimpanzees share approximately 98.7% of their DNA sequences, making chimps our closest living relatives. This high similarity supports a recent common ancestor.'),
];

// =============================================================================
// CHAPTER 12: Revision and Exam Preparation (Term 4)
// =============================================================================
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Revision and Exam Preparation\n\n### NSC Life Sciences Exam Structure\n\nThe Grade 12 Life Sciences final examination consists of two papers, each 2.5 hours and 150 marks:\n\n**Paper 1 (150 marks) \u2014 2.5 hours:**\n- Meiosis\n- Reproduction in Vertebrates\n- Human Reproduction\n- Responding to the Environment \u2014 Humans (Nervous system, eye, ear)\n- Human Endocrine System\n- Homeostasis in Humans\n- Responding to the Environment \u2014 Plants\n\n**Paper 2 (150 marks) \u2014 2.5 hours:**\n- DNA: The Code of Life\n- Meiosis (overlap with Paper 1)\n- Genetics and Inheritance\n- Genetic Engineering\n- Evolution\n\n**Question types:**\n- Multiple choice (Section A)\n- Short answer and structured questions (Section B)\n- Essay/long questions (Section C) \u2014 typically 2 essay questions, choose topics wisely'),
  t(2, '### Key Diagrams to Know\n\nThe following diagrams frequently appear in exams. You must be able to **label, annotate, and interpret** them:\n\n**Paper 1 diagrams:**\n- Stages of meiosis I and II (showing chromosome behaviour)\n- Male reproductive system (sagittal section)\n- Female reproductive system (front view and sagittal section)\n- The menstrual cycle graph (hormone levels vs days)\n- Structure of a neuron\n- The human eye (cross-section)\n- The human ear (cross-section)\n- The reflex arc\n- Nephron structure\n- Thermoregulation flowchart\n\n**Paper 2 diagrams:**\n- DNA double helix structure (with nucleotide labels)\n- DNA replication fork\n- Transcription and translation diagrams\n- Punnett squares (monohybrid, dihybrid, sex-linked)\n- Pedigree diagrams\n- Genetic engineering steps\n- Gel electrophoresis results\n- Phylogenetic trees / cladograms\n- Homologous structures comparison'),
  q(3, 'Which of the following topics appears in Paper 2 of the NSC Life Sciences exam?',
    ['Homeostasis', 'The human eye', 'DNA and protein synthesis', 'The menstrual cycle'], 2,
    'Paper 2 covers DNA, Meiosis, Genetics, Genetic Engineering, and Evolution. Topics like homeostasis, the eye, and the menstrual cycle are covered in Paper 1.'),
  t(4, '### Exam Tips and Strategies\n\n**General tips:**\n1. **Read the question carefully** \u2014 underline key words (describe, explain, compare, discuss)\n2. **Answer what is asked** \u2014 if the question says "explain," you must give reasons, not just state facts\n3. **Use biological terminology** \u2014 marks are often awarded for correct use of scientific terms\n4. **Show your working** in genetics problems \u2014 draw Punnett squares and state genotypes/phenotypes\n5. **Label diagrams clearly** \u2014 use straight lines (not arrows) to label parts\n6. **Time management**: Approximately 1 mark per minute. Do not spend too long on one question.\n7. **Essay questions**: Plan your essay before writing. Include an introduction, logically ordered points, and a conclusion.\n\n**Command word meanings:**\n| Command word | What to do |\n|-------------|------------|\n| **Name/State** | Give the answer only, no explanation needed |\n| **Describe** | Say what you see or what happens |\n| **Explain** | Give reasons WHY something happens |\n| **Compare** | Give similarities AND differences |\n| **Discuss** | Give arguments for AND against |\n| **Tabulate** | Present information in a table |\n| **Calculate** | Show all working and give the answer |'),
  t(5, '### Paper 1 Revision: Key Concepts\n\n**Meiosis:**\n- Know ALL phases of meiosis I and II\n- Explain crossing over and its significance\n- Distinguish between meiosis and mitosis\n- Explain non-disjunction and its consequences\n\n**Human Reproduction:**\n- Structure and function of male and female reproductive systems\n- Spermatogenesis vs oogenesis (table comparison)\n- Hormones of the menstrual cycle (FSH, LH, oestrogen, progesterone)\n- Fertilisation, implantation, role of placenta\n\n**Nervous System and Senses:**\n- Structure and function of a neuron\n- Reflex arc (5 components in order)\n- Eye structure and defects (myopia, hyperopia)\n- Ear structure and pathway of sound\n- Sympathetic vs parasympathetic nervous system'),
  fb(6, 'Paper 1 is worth ___ marks and covers topics such as reproduction and the nervous system. Paper 2 covers DNA, genetics, and ___ and is also worth the same number of marks.',
    ['150', 'evolution'],
    'Both papers are worth 150 marks each. Paper 1 covers reproduction, nervous system, endocrine system, homeostasis, and plant responses. Paper 2 covers DNA, meiosis, genetics, genetic engineering, and evolution.'),
  t(7, '### Paper 2 Revision: Key Concepts\n\n**DNA:**\n- Structure of a nucleotide and DNA double helix\n- DNA replication (enzymes: helicase, DNA polymerase, ligase)\n- Transcription and translation steps\n- Types of mutations and their effects\n\n**Genetics:**\n- Monohybrid and dihybrid crosses (Punnett squares)\n- Blood group inheritance (codominance, multiple alleles)\n- Sex-linked inheritance (especially haemophilia, colour blindness)\n- Pedigree diagram analysis\n\n**Genetic Engineering:**\n- Steps of genetic engineering\n- Applications (insulin production, GM crops)\n- DNA fingerprinting process\n- Ethical considerations\n\n**Evolution:**\n- Darwin vs Lamarck\n- Evidence for evolution (5 types)\n- Natural vs artificial selection\n- Speciation and reproductive isolation\n- Human evolution and Out of Africa hypothesis'),
  q(8, 'A Punnett square for a monohybrid cross between two heterozygous parents (Aa x Aa) gives a phenotypic ratio of:',
    ['1:1', '1:2:1', '3:1', '9:3:3:1'], 2,
    'A monohybrid cross Aa x Aa produces: AA, Aa, Aa, aa (genotypic ratio 1:2:1). Since A is dominant, both AA and Aa show the dominant phenotype. Phenotypic ratio = 3 dominant : 1 recessive.'),
  t(9, '### Common Mistakes to Avoid\n\n1. **Confusing meiosis I and meiosis II**: Meiosis I separates homologous chromosomes; meiosis II separates sister chromatids\n2. **Confusing transcription and translation**: Transcription = DNA to mRNA (in nucleus); Translation = mRNA to protein (at ribosomes)\n3. **Forgetting that maternal and foetal blood do NOT mix** in the placenta\n4. **Writing "the eye focuses light"**: The LENS focuses light; the eye is the whole organ\n5. **Stating Lamarck was correct**: Acquired characteristics are NOT inherited\n6. **Mixing up myopia and hyperopia**: Myopia = cannot see far (concave lens); Hyperopia = cannot see near (convex lens)\n7. **Writing "survival of the fittest" without explanation**: Explain that "fittest" means best adapted to the environment, not physically strongest\n8. **Forgetting to state the direction** of impulse transmission in a reflex arc\n9. **Not drawing Punnett squares** when solving genetics problems \u2014 always show your working\n10. **Using "amount" instead of "concentration"** when discussing osmosis or homeostasis'),
  q(10, 'Which correction is accurate?',
    ['Transcription occurs at the ribosomes', 'Maternal and foetal blood mix freely in the placenta', 'Non-disjunction in meiosis I means homologous chromosomes fail to separate', 'Lamarck correctly proposed that acquired characteristics are inherited'], 2,
    'Non-disjunction in meiosis I occurs when homologous chromosomes fail to separate during anaphase I. Transcription occurs in the nucleus (not at ribosomes), blood does not mix in the placenta, and Lamarck was incorrect about inheritance of acquired characteristics.'),
];

// =============================================================================
// INSERT EVERYTHING
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
    tags: ['life-sciences', 'grade-12', 'caps'],
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
      title: 'Chapter 1: DNA \u2014 The Code of Life',
      description: 'DNA location, structure, discovery, replication, RNA types, genetic code, protein synthesis, and mutations.',
      order: 1,
      lessons: [
        { title: 'DNA Structure, Location and Replication', description: 'DNA location in cells, nucleotide structure, double helix, base pairing rules, discovery of DNA, and the semi-conservative replication process.', blocks: ch1_lesson1, term: 1 },
        { title: 'RNA, Protein Synthesis and Mutations', description: 'RNA structure and types, the genetic code, transcription, translation, and the causes and effects of gene mutations.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Meiosis',
      description: 'Chromosome structure, meiosis I and II phases, importance of meiosis, abnormal meiosis, and comparison with mitosis.',
      order: 2,
      lessons: [
        { title: 'Meiosis: Reduction Division', description: 'Chromosome terminology, phases of meiosis I and II, importance of meiosis for genetic variation, non-disjunction, and comparison with mitosis.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Reproduction in Vertebrates',
      description: 'Diversity of reproductive strategies: external vs internal fertilisation, oviparity, viviparity, ovoviviparity, amniotic egg, and parental care.',
      order: 3,
      lessons: [
        { title: 'Vertebrate Reproductive Strategies', description: 'External and internal fertilisation, oviparity, viviparity, ovoviviparity, the amniotic egg, and patterns of parental care across vertebrate classes.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Human Reproduction',
      description: 'Male and female reproductive systems, puberty, gametogenesis, menstrual cycle, fertilisation, implantation, gestation, and the placenta.',
      order: 4,
      lessons: [
        { title: 'Human Reproductive Systems and Development', description: 'Structure and function of male and female reproductive systems, spermatogenesis and oogenesis, the menstrual cycle, fertilisation, early development, and the role of the placenta.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Genetics and Inheritance',
      description: 'Genotype, phenotype, alleles, monohybrid crosses, dihybrid crosses, blood grouping, sex determination, sex-linked inheritance, and pedigree diagrams.',
      order: 5,
      lessons: [
        { title: 'Mendelian Genetics, Blood Groups and Sex-Linked Inheritance', description: 'Key genetic terminology, monohybrid and dihybrid crosses with Punnett squares, ABO blood group inheritance, sex determination, X-linked traits, and reading pedigree diagrams.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Genetic Engineering',
      description: 'Genetic engineering techniques, DNA fingerprinting, paternity testing, stem cells, cloning, and ethical considerations.',
      order: 6,
      lessons: [
        { title: 'Genetic Engineering, Cloning and Ethics', description: 'Restriction enzymes, recombinant DNA, applications in medicine and agriculture, DNA fingerprinting, PCR, stem cells, cloning, and ethical debates.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Responding to the Environment \u2014 Humans',
      description: 'Human nervous system (CNS, PNS, ANS), the eye, the ear, reflex arc, and neural disorders.',
      order: 7,
      lessons: [
        { title: 'The Nervous System, Eye, Ear and Reflexes', description: 'Structure of the nervous system, neuron anatomy, the human eye and its defects, the ear and hearing, balance, and the reflex arc.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Human Endocrine System',
      description: 'Endocrine vs exocrine glands, hormones and functions, negative feedback (TSH/thyroxin, insulin/glucagon), and diabetes mellitus.',
      order: 8,
      lessons: [
        { title: 'The Endocrine System, Feedback and Diabetes', description: 'Endocrine and exocrine glands, major hormones, the TSH-thyroxin feedback loop, thyroid disorders, insulin and glucagon regulation, and Type 1 vs Type 2 diabetes.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: Homeostasis in Humans',
      description: 'Thermoregulation, osmoregulation, the kidney and nephron, ADH and water balance, gaseous exchange and CO\u2082 regulation.',
      order: 9,
      lessons: [
        { title: 'Thermoregulation, Osmoregulation and Gas Exchange', description: 'Homeostatic control mechanisms, body temperature regulation, kidney structure, nephron function, ADH and water balance, and blood CO\u2082/pH regulation.', blocks: ch9_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 10: Responding to the Environment \u2014 Plants',
      description: 'Plant hormones (auxins, gibberellins, abscisic acid), tropisms, and plant defence mechanisms.',
      order: 10,
      lessons: [
        { title: 'Plant Hormones, Tropisms and Defence', description: 'Major plant hormones and their functions, phototropism, geotropism, thigmotropism, the role of auxin in directional growth, and physical, chemical and biological plant defences.', blocks: ch10_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 11: Evolution',
      description: 'Evidence for evolution, Lamarckism vs Darwinism, punctuated equilibrium, artificial selection, speciation, human evolution, and the Out of Africa hypothesis.',
      order: 11,
      lessons: [
        { title: 'Evolution, Natural Selection and Human Origins', description: 'Evidence for evolution, Lamarck vs Darwin, gradualism vs punctuated equilibrium, artificial selection, reproductive isolation, speciation, human evolution and the Out of Africa hypothesis.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Revision and Exam Preparation',
      description: 'NSC exam structure, key diagrams, revision checklists for Paper 1 and Paper 2, common mistakes, and exam strategies.',
      order: 12,
      lessons: [
        { title: 'Exam Structure, Revision and Tips', description: 'Paper 1 and Paper 2 structure, key diagrams to know, revision checklists, command words, common mistakes to avoid, and exam strategies.', blocks: ch12_lesson1, term: 4 },
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
    title: 'Grade 12 Life Sciences \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering DNA, Meiosis, Reproduction, Genetics, Genetic Engineering, the Nervous and Endocrine Systems, Homeostasis, Plant Responses, and Evolution for the Grade 12 Life Sciences NSC examination.',
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
  console.log('  TEXTBOOK: Grade 12 Life Sciences');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
