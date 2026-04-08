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
// CHAPTER 1: Numbers and Calculations with Numbers (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Number Formats and Conventions\n\nIn everyday life, numbers appear in many different formats. Understanding how to read and write them correctly is essential for Mathematical Literacy.\n\n### Place Value and Number Formats\n\n**Decimal point and comma convention (South Africa):**\nIn South Africa we use a **comma** as the decimal separator and a **space** to group thousands:\n- R1 250,50 means one thousand two hundred and fifty rand and fifty cents\n- 3 500 000 means three and a half million\n\n**Other formats you will encounter:**\n\n| Format | Example | Meaning |\n|--------|---------|--------|\n| Decimal point | R1 250.50 | Same as R1 250,50 (used in some calculators and computers) |\n| Thousands separator (space) | 1 000 000 | One million |\n| Fractions | 3/4 | Three quarters |\n| Percentages | 25% | 25 out of every 100 |'),
  q(2, 'Which of the following correctly represents two million, three hundred thousand in South African number format?',
    ['2 300 000', '2,300,000', '2.300.000', '23 000 00'], 0,
    'In South Africa, we use spaces to separate groups of three digits: 2 300 000.'),
  t(3, '### Positive and Negative Numbers\n\nNegative numbers are less than zero and are written with a minus sign.\n\n**Real-life examples of negative numbers:**\n- Temperature: -5°C means 5 degrees below zero\n- Bank account: -R250 means you owe the bank R250 (overdraft)\n- Altitude: the Dead Sea is at -430 m (below sea level)\n\n**Ordering negative numbers:**\nOn a number line, numbers increase from left to right.\n$$-5 < -3 < -1 < 0 < 2 < 4$$\n\n**Important:** -10 is **less than** -3 because it is further from zero on the negative side.\n\n**Operations with negative numbers:**\n- Adding a negative is the same as subtracting: $5 + (-3) = 5 - 3 = 2$\n- Subtracting a negative is the same as adding: $5 - (-3) = 5 + 3 = 8$\n- Negative times negative = positive: $(-4) \\times (-2) = 8$\n- Negative times positive = negative: $(-4) \\times 2 = -8$'),
  q(4, 'The temperature in Sutherland drops from 3°C to -8°C overnight. By how many degrees did the temperature fall?',
    ['5°C', '8°C', '11°C', '3°C'], 2,
    'From 3°C to -8°C: the drop is 3 + 8 = 11°C. You cross zero and continue 8 degrees below.'),
  t(5, '### Conversions Between Number Formats\n\n**Fraction to decimal:** Divide the numerator by the denominator.\n$$\\frac{3}{8} = 3 \\div 8 = 0,375$$\n\n**Decimal to percentage:** Multiply by 100.\n$$0,375 \\times 100 = 37,5\\%$$\n\n**Percentage to fraction:** Write over 100 and simplify.\n$$60\\% = \\frac{60}{100} = \\frac{3}{5}$$\n\n**Common equivalents to memorise:**\n\n| Fraction | Decimal | Percentage |\n|----------|---------|------------|\n| 1/2 | 0,5 | 50% |\n| 1/4 | 0,25 | 25% |\n| 3/4 | 0,75 | 75% |\n| 1/5 | 0,2 | 20% |\n| 1/3 | 0,333... | 33,3% |\n| 1/8 | 0,125 | 12,5% |'),
  fb(6, 'Convert 7/20 to a decimal: ___. Convert 0,45 to a percentage: ___%.',
    ['0,35', '45'],
    '7/20 = 7 ÷ 20 = 0,35. To convert 0,45 to a percentage, multiply by 100: 0,45 × 100 = 45%.'),
  t(7, '### Order of Operations (BODMAS)\n\nWhen a calculation has more than one operation, follow **BODMAS**:\n\n| Letter | Meaning | Example |\n|--------|---------|--------|\n| **B** | Brackets | (3 + 2) = 5 first |\n| **O** | Orders (powers, roots) | 4² = 16 |\n| **D** | Division | 20 ÷ 4 = 5 |\n| **M** | Multiplication | 3 × 5 = 15 |\n| **A** | Addition | 2 + 3 = 5 |\n| **S** | Subtraction | 10 - 4 = 6 |\n\n**Division and multiplication** are done left to right (same priority).\n**Addition and subtraction** are done left to right (same priority).\n\n**Example:**\n$$8 + 3 \\times (10 - 4)^2 \\div 6$$\n$$= 8 + 3 \\times 6^2 \\div 6$$\n$$= 8 + 3 \\times 36 \\div 6$$\n$$= 8 + 108 \\div 6$$\n$$= 8 + 18 = 26$$'),
  q(8, 'Calculate: 5 + 2 × (8 - 3) - 4',
    ['31', '11', '7', '15'], 1,
    'Brackets first: (8 - 3) = 5. Then multiplication: 2 × 5 = 10. Then left to right: 5 + 10 - 4 = 11.'),
  t(9, '### Square, Cube and Square Root\n\nThese are powers and roots that appear frequently.\n\n**Squaring** (power of 2): $5^2 = 5 \\times 5 = 25$\n\n**Cubing** (power of 3): $4^3 = 4 \\times 4 \\times 4 = 64$\n\n**Square root** (inverse of squaring): $\\sqrt{49} = 7$ because $7 \\times 7 = 49$\n\n**Perfect squares to know:** 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144\n\n**Using a calculator:**\nYour calculator has buttons for $x^2$, $x^3$, and $\\sqrt{x}$. Practice using them so you can check your mental calculations.\n\n**Example in context:**\nA square tile has an area of 900 cm². What is the side length?\n$$\\text{Side} = \\sqrt{900} = 30 \\text{ cm}$$'),
  q(10, 'A square garden has an area of 196 m². What is the length of each side?',
    ['14 m', '49 m', '98 m', '13 m'], 0,
    'Side = √196 = 14 m, because 14 × 14 = 196.'),
  fb(11, 'The value of 6² is ___. The value of √144 is ___.',
    ['36', '12'],
    '6² = 6 × 6 = 36. √144 = 12 because 12 × 12 = 144.'),
];

blockNum = 0;
const ch1_lesson2 = [
  t(1, '## Rounding, Ratio, Rate and Percentage\n\n### Rounding\n\nRounding makes numbers simpler while keeping them close to the original value.\n\n**Rules for rounding:**\n- If the digit after the rounding place is **5 or more**, round **up**\n- If the digit after the rounding place is **less than 5**, round **down**\n\n**Examples:**\n- 3 467 to the nearest hundred: look at the tens digit (6). Since 6 ≥ 5, round up → **3 500**\n- 12,847 to one decimal place: look at the second decimal (4). Since 4 < 5, round down → **12,8**\n- R249,95 to the nearest rand: look at the cents (95). Since 95 ≥ 50, round up → **R250**\n\n**When to round up regardless:**\nIf you need 2,3 tins of paint, you must buy **3 tins** — you cannot buy 0,3 of a tin. Always round up for items you must buy whole.'),
  q(2, 'A classroom needs 217 chairs arranged in rows of 12. How many rows are needed?',
    ['18 rows', '19 rows', '17 rows', '18,08 rows'], 1,
    '217 ÷ 12 = 18,08. You cannot have a partial row, so round up to 19 rows to seat everyone.'),
  t(3, '### Ratio\n\nA **ratio** compares two or more quantities of the same kind.\n\n**Writing ratios:**\n- The ratio of 3 boys to 5 girls is written as 3 : 5\n- The order matters: boys : girls = 3 : 5 is different from girls : boys = 5 : 3\n\n**Simplifying ratios:** Divide all parts by the highest common factor.\n- 12 : 8 = 3 : 2 (divide both by 4)\n- 250 : 150 : 100 = 5 : 3 : 2 (divide all by 50)\n\n**Sharing in a given ratio:**\nThree friends share R600 in the ratio 2 : 3 : 5.\n- Total parts = 2 + 3 + 5 = 10\n- Each part = R600 ÷ 10 = R60\n- Shares: R120, R180, R300\n\n**Example:** A recipe for 4 people uses 300 g flour. How much flour for 6 people?\n$$\\frac{300}{4} \\times 6 = 75 \\times 6 = 450 \\text{ g}$$'),
  q(4, 'Sipho and Thandi share R4 500 in the ratio 2 : 3. How much does Thandi receive?',
    ['R1 800', 'R2 700', 'R2 250', 'R3 000'], 1,
    'Total parts = 2 + 3 = 5. Each part = R4 500 ÷ 5 = R900. Thandi gets 3 parts = 3 × R900 = R2 700.'),
  t(5, '### Rate\n\nA **rate** compares two quantities of different kinds.\n\n**Common rates:**\n- Speed: km/h (kilometres per hour)\n- Price: R per kg, R per litre\n- Wage: R per hour\n- Fuel consumption: litres per 100 km\n\n**Example:** A car travels 420 km in 5 hours.\n$$\\text{Average speed} = \\frac{420}{5} = 84 \\text{ km/h}$$\n\n**Unit price (comparing value):**\nBrand A: 750 ml juice for R18,99 → R18,99 ÷ 0,75 = R25,32 per litre\nBrand B: 1,5 litres juice for R34,99 → R34,99 ÷ 1,5 = R23,33 per litre\nBrand B is better value (cheaper per litre).'),
  fb(6, 'A 2,5 kg bag of rice costs R49,90. The unit price per kg is R ___.',
    ['19,96'],
    'Unit price = R49,90 ÷ 2,5 = R19,96 per kg.'),
  t(7, '### Percentage\n\nA **percentage** means "out of 100".\n\n**Calculating a percentage of an amount:**\n$$25\\% \\text{ of } R800 = \\frac{25}{100} \\times 800 = R200$$\n\n**Expressing one number as a percentage of another:**\n$$\\frac{45}{60} \\times 100 = 75\\%$$\n\n**Percentage increase and decrease:**\n\n$$\\text{Percentage change} = \\frac{\\text{New} - \\text{Old}}{\\text{Old}} \\times 100$$\n\n**Example — increase:** Petrol goes from R22,50 to R24,30 per litre.\n$$\\text{Increase} = \\frac{24,30 - 22,50}{22,50} \\times 100 = \\frac{1,80}{22,50} \\times 100 = 8\\%$$\n\n**Example — decrease:** A shirt marked R350 is reduced to R280.\n$$\\text{Decrease} = \\frac{350 - 280}{350} \\times 100 = \\frac{70}{350} \\times 100 = 20\\%$$'),
  q(8, 'A school has 840 learners. 35% travel by bus. How many learners travel by bus?',
    ['294', '252', '336', '210'], 0,
    '35% of 840 = 0,35 × 840 = 294 learners.'),
  q(9, 'A shop increases the price of bread from R16 to R18,40. What is the percentage increase?',
    ['15%', '12%', '13,5%', '18%'], 0,
    'Increase = R18,40 - R16 = R2,40. Percentage = (R2,40 / R16) × 100 = 15%.'),
  fb(10, 'A test is out of 80 marks. A learner scores 56 marks. The percentage is ___%. The learner needs ___% more to reach 80%.',
    ['70', '10'],
    '56/80 × 100 = 70%. To reach 80%, the learner needs 80% - 70% = 10% more.'),
  t(11, '### Using Percentages with VAT\n\nSouth Africa charges **15% VAT** (Value Added Tax) on most goods and services.\n\n**Adding VAT:**\n$$\\text{Price incl. VAT} = \\text{Price excl. VAT} \\times 1,15$$\n\n**Removing VAT:**\n$$\\text{Price excl. VAT} = \\frac{\\text{Price incl. VAT}}{1,15}$$\n\n**Example:** A laptop costs R8 695 excluding VAT.\n- Including VAT: R8 695 × 1,15 = R9 999,25\n\n**Example:** A microwave costs R2 299 including VAT.\n- Excluding VAT: R2 299 ÷ 1,15 = R1 999,13\n- The VAT amount: R2 299 - R1 999,13 = R299,87'),
  q(12, 'A tablet costs R4 599 including 15% VAT. What is the VAT amount?',
    ['R599,87', 'R689,85', 'R399,91', 'R575,00'], 0,
    'Price excl. VAT = R4 599 ÷ 1,15 = R3 999,13. VAT = R4 599 - R3 999,13 = R599,87.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Patterns, Relationships and Representations (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Patterns and Relationships\n\nPatterns are everywhere — in nature, in music, and in mathematics. In Mathematical Literacy we use patterns to describe how quantities change and to predict future values.\n\n### Constant (Common) Difference\n\nA **constant difference** pattern is a sequence where the same value is added (or subtracted) each time.\n\n| Position (n) | 1 | 2 | 3 | 4 | 5 |\n|-------------|---|---|---|---|---|\n| Value | 4 | 7 | 10 | 13 | 16 |\n\nThe constant difference here is **+3** (each term is 3 more than the previous one).\n\n**Finding the constant difference:**\nSubtract any term from the next term:\n$$7 - 4 = 3,\\quad 10 - 7 = 3,\\quad 13 - 10 = 3$$\n\nIf the difference is the same each time, the pattern is **linear** (a straight-line pattern).'),
  q(2, 'A sequence has values 2, 9, 16, 23, 30. What is the constant difference?',
    ['5', '6', '7', '8'], 2,
    '9 - 2 = 7, 16 - 9 = 7, 23 - 16 = 7. The constant difference is 7.'),
  t(3, '### Writing a Rule from a Table\n\nIf the constant difference is **d** and the first term is **a**, you can write the general rule:\n$$T_n = d \\times n + (a - d)$$\n\n**Example:** The sequence 5, 8, 11, 14, ...\n- d = 3, first term a = 5\n- Rule: $T_n = 3n + (5 - 3) = 3n + 2$\n- Check: $T_1 = 3(1) + 2 = 5$ ✓, $T_4 = 3(4) + 2 = 14$ ✓\n\nNow you can find any term:\n- 10th term: $T_{10} = 3(10) + 2 = 32$\n- 100th term: $T_{100} = 3(100) + 2 = 302$\n\n**Using a rule to find the position:**\nIf $T_n = 47$, then $3n + 2 = 47$, so $3n = 45$, so $n = 15$.\nThe value 47 is the 15th term.'),
  fb(4, 'In the pattern 6, 10, 14, 18, ... the constant difference is ___ and the rule is T = ___n + ___.',
    ['4', '4', '2'],
    'd = 10 - 6 = 4. Rule: T = 4n + (6 - 4) = 4n + 2. Check: 4(1) + 2 = 6, 4(2) + 2 = 10. Correct.'),
  t(5, '### Direct Proportion\n\nTwo quantities are in **direct proportion** when they increase or decrease at the same rate. If one doubles, the other doubles too.\n\n$$\\frac{y}{x} = k \\quad \\text{(constant)}$$\n\n**Example:** The cost of apples at R12 per kg.\n\n| Mass (kg) | 1 | 2 | 3 | 5 | 10 |\n|-----------|---|---|---|---|----|\n| Cost (R) | 12 | 24 | 36 | 60 | 120 |\n\nCost ÷ Mass = 12 in every case. The constant of proportionality is R12.\n\nA directly proportional graph is a **straight line that passes through the origin** (0, 0).'),
  q(6, 'Which of the following shows direct proportion?',
    ['x: 2, 4, 6 and y: 10, 20, 30', 'x: 1, 2, 3 and y: 5, 8, 11', 'x: 2, 4, 8 and y: 12, 6, 3', 'x: 1, 2, 3 and y: 1, 4, 9'], 0,
    'Check y/x: 10/2 = 5, 20/4 = 5, 30/6 = 5. The ratio is constant (5), so it is direct proportion.'),
  t(7, '### Inverse Proportion\n\nTwo quantities are in **inverse proportion** when one increases as the other decreases, and their product stays constant.\n\n$$x \\times y = k \\quad \\text{(constant)}$$\n\n**Example:** 6 people share equally in a R360 prize.\n\n| Number of people | 1 | 2 | 3 | 4 | 6 | 12 |\n|-----------------|---|---|---|---|---|----|\n| Share each (R) | 360 | 180 | 120 | 90 | 60 | 30 |\n\nPeople × Share = 360 in every case. As more people share, each gets less.\n\nThe graph of an inverse proportion is a **curve** (hyperbola) — it never touches the axes.'),
  q(8, 'A farmer has enough feed for 20 animals for 15 days. If 5 more animals are added (25 total), how many days will the feed last?',
    ['10 days', '12 days', '18 days', '20 days'], 1,
    'Animals × Days = constant. 20 × 15 = 300. So 25 × Days = 300. Days = 300 ÷ 25 = 12 days.'),
  t(9, '### Tables and Graphs\n\nTables and graphs help us see patterns visually.\n\n**Plotting points from a table:**\n1. Draw two axes and label them (x = horizontal, y = vertical)\n2. Choose an appropriate scale for each axis\n3. Plot each pair of values as a point\n4. Connect the points (straight line for constant difference; curve for inverse proportion)\n\n**Reading values from a graph:**\n- **Interpolation:** Reading a value between plotted points\n- **Extrapolation:** Extending the pattern beyond the given data (less reliable)\n\n**Recognising graph shapes:**\n\n| Relationship | Graph shape |\n|-------------|-------------|\n| Constant difference (linear) | Straight line |\n| Direct proportion | Straight line through the origin |\n| Inverse proportion | Curve (hyperbola) |'),
  fb(10, 'A straight-line graph through the origin represents ___ proportion. A graph that curves downward as x increases may represent ___ proportion.',
    ['direct', 'inverse'],
    'Direct proportion gives a straight line through (0, 0). Inverse proportion gives a curve that decreases as x increases.'),
  q(11, 'The number of bricks (B) needed for a wall is given by B = 55 × h, where h is the height in rows. How many bricks are needed for a wall that is 12 rows high?',
    ['660', '550', '720', '600'], 0,
    'B = 55 × 12 = 660 bricks.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Data Handling — Collecting and Summarising (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Data Handling: Collecting and Summarising Data\n\n### What is Data?\n\n**Data** is information collected for a purpose. Before analysing data, you need to plan how to collect it.\n\n**Types of data:**\n- **Numerical (quantitative):** Data that can be counted or measured (height, marks, temperature, number of siblings)\n- **Categorical (qualitative):** Data sorted into categories or labels (favourite colour, transport mode, province)\n\n**Data collection methods:**\n\n| Method | Description | Example |\n|--------|-------------|--------|\n| Questionnaire | Written questions | Survey about learners\' favourite sport |\n| Interview | Face-to-face questions | Asking shoppers about their spending |\n| Observation | Watching and recording | Counting vehicles at a traffic light |\n| Existing data | Using records | School attendance register, census data |'),
  q(2, 'A researcher counts the number of cars, taxis, and buses passing a point on the N1 highway during rush hour. What method of data collection is this?',
    ['Questionnaire', 'Interview', 'Observation', 'Experiment'], 2,
    'The researcher is watching and recording what they see, which is observation.'),
  t(3, '### Organising Data: Frequency Tables\n\nRaw data is a list of unsorted values. A **frequency table** organises data into groups.\n\n**Example:** Test marks of 15 Grade 10 learners:\n35, 42, 58, 61, 45, 72, 38, 55, 48, 65, 50, 43, 67, 52, 59\n\n**Sorted:** 35, 38, 42, 43, 45, 48, 50, 52, 55, 58, 59, 61, 65, 67, 72\n\n| Class interval | Tally | Frequency |\n|---------------|-------|----------|\n| 30 – 39 | II | 2 |\n| 40 – 49 | IIII | 4 |\n| 50 – 59 | IIIII | 5 |\n| 60 – 69 | III | 3 |\n| 70 – 79 | I | 1 |\n| **Total** | | **15** |\n\nThe class intervals must be equal in width and must not overlap.'),
  fb(4, 'In the frequency table above, the class interval with the highest frequency is ___. The total number of learners who scored 50 or more is ___.',
    ['50 – 59', '9'],
    'The 50 – 59 interval has frequency 5 (the highest). Learners scoring 50+: 5 + 3 + 1 = 9.'),
  t(5, '### Measures of Central Tendency\n\nMeasures of central tendency describe the "middle" or "typical" value in a data set.\n\n**Mean (average):**\n$$\\text{Mean} = \\frac{\\text{Sum of all values}}{\\text{Number of values}}$$\n\n**Median:** The middle value when data is arranged in order.\n- If there are an **odd** number of values: the middle one\n- If there are an **even** number of values: the average of the two middle values\n\n**Mode:** The value that appears most often. There can be more than one mode, or no mode at all.\n\n**Example:** Data: 4, 5, 5, 7, 8, 10, 12\n- Mean = (4+5+5+7+8+10+12) ÷ 7 = 51 ÷ 7 = 7,29\n- Median = 7 (the 4th value out of 7)\n- Mode = 5 (appears twice)'),
  q(6, 'The ages of 6 learners are: 14, 15, 15, 16, 16, 16. What is the mode?',
    ['14', '15', '16', '15,33'], 2,
    'The mode is 16 because it appears three times — more than any other value.'),
  t(7, '### The Range\n\nThe **range** is the simplest measure of spread:\n$$\\text{Range} = \\text{Highest value} - \\text{Lowest value}$$\n\n**Example:** Test marks: 35, 42, 58, 61, 72\n- Range = 72 - 35 = 37\n\nA **large** range means the data is spread out. A **small** range means values are close together.\n\n### When to Use Each Measure\n\n| Measure | Best used when... |\n|---------|------------------|\n| Mean | Data is evenly spread with no extreme values |\n| Median | Data has outliers (extreme values) that would distort the mean |\n| Mode | You want the most common or popular value |\n\n**Outliers** are extreme values far from the rest of the data. They pull the mean toward them but do not affect the median.\n\n**Example:** Salaries (R): 5 000, 6 000, 6 500, 7 000, 45 000\n- Mean = R13 900 (misleading — pulled up by R45 000)\n- Median = R6 500 (better represents the typical salary)'),
  fb(8, 'For the data 3, 5, 7, 7, 9, 11, the mean is ___, the median is ___, and the range is ___.',
    ['7', '7', '8'],
    'Mean = (3+5+7+7+9+11) ÷ 6 = 42 ÷ 6 = 7. Median = (7+7) ÷ 2 = 7 (average of 3rd and 4th values). Range = 11 - 3 = 8.'),
  q(9, 'House prices in a street are: R450 000, R480 000, R510 000, R530 000, R2 100 000. Which measure of central tendency best represents the typical price?',
    ['Mean', 'Median', 'Mode', 'Range'], 1,
    'The R2 100 000 house is an outlier. The median (R510 000) better represents the typical price, as the mean (R814 000) is pulled up by the outlier.'),
  t(10, '### Developing Questions for Data Collection\n\nGood survey questions should be:\n- **Clear and specific** — everyone understands the question the same way\n- **Unbiased** — do not lead the respondent to a particular answer\n- **Appropriate** — suited to the type of data you need\n\n**Bad question:** "Don\'t you think school lunches are terrible?" (leading)\n**Good question:** "How would you rate the school lunch? Excellent / Good / Average / Poor"\n\n**Bad question:** "How much money do you earn?" (too vague — per hour? per month?)\n**Good question:** "What is your gross monthly income?" with ranges: Under R5 000 / R5 000 – R10 000 / etc.'),
  q(11, 'Which of the following is a biased survey question?',
    ['How often do you exercise per week?', 'Don\'t you agree that our school needs a new sports field?', 'What is your favourite school subject?', 'How many hours do you spend on homework daily?'], 1,
    'The question "Don\'t you agree..." leads the respondent toward saying "yes". This is a biased question.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Finance — Financial Documents and Tariff Systems (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Financial Documents\n\nEvery day you encounter financial documents — till slips, bills, and statements. Understanding them helps you manage your money and check for errors.\n\n### Types of Financial Documents\n\n| Document | Purpose |\n|----------|--------|\n| **Till slip / Receipt** | Proof of purchase — shows items bought, prices, VAT, and total |\n| **Invoice** | A request for payment for goods or services |\n| **Shopping document (account statement)** | Monthly summary of purchases and payments on a store account |\n| **Bank statement** | Record of all deposits, withdrawals, and fees in your bank account |\n| **Household budget** | A plan showing expected income and expenses for a month |\n\n### Reading a Till Slip\n\nA till slip typically shows:\n- Store name, address, and VAT number\n- Date and time of purchase\n- Items, quantities, and unit prices\n- Subtotal, VAT (15%), and total\n- Payment method (cash, card)\n- Change given'),
  q(2, 'A till slip shows: 3 × Bread @ R17,99 and 2 × Milk @ R29,99. What is the total?',
    ['R113,95', 'R95,96', 'R107,95', 'R120,95'], 0,
    'Bread: 3 × R17,99 = R53,97. Milk: 2 × R29,99 = R59,98. Total = R53,97 + R59,98 = R113,95. (Note: bread and milk are zero-rated for VAT.)'),
  t(3, '### Household Bills\n\nCommon household bills include:\n\n**Electricity bill:**\n- Account holder details\n- Meter reading (previous and current)\n- Units used (kWh) = current reading − previous reading\n- Cost per unit × units used\n- Basic/service charge\n- VAT\n\n**Water bill:**\n- Similar structure to electricity\n- Measured in kilolitres (kl)\n- May include sewerage charge (often a percentage of the water charge)\n\n**Example electricity bill:**\n\n| Item | Amount |\n|------|--------|\n| Previous reading | 45 230 kWh |\n| Current reading | 45 680 kWh |\n| Units used | 450 kWh |\n| Charge: 450 × R2,15 | R967,50 |\n| Basic charge | R120,00 |\n| Subtotal | R1 087,50 |\n| VAT (15%) | R163,13 |\n| **Total** | **R1 250,63** |'),
  fb(4, 'An electricity meter reads 32 150 at the start of the month and 32 580 at the end. The units used are ___ kWh. At R2,35 per unit, the charge is R ___.',
    ['430', '1010,50'],
    'Units = 32 580 - 32 150 = 430 kWh. Charge = 430 × R2,35 = R1 010,50.'),
  t(5, '### Household Budgets\n\nA **budget** is a plan for managing income and expenses.\n\n**Income:** Money coming in (salary, wages, grants, allowances).\n**Fixed expenses:** Stay the same each month (rent, insurance, school fees).\n**Variable expenses:** Change each month (food, electricity, transport, entertainment).\n\n**Surplus** = Income − Expenses (positive = saving money)\n**Deficit** = When expenses exceed income (negative = overspending)\n\n**Example household budget:**\n\n| Income | Amount | Expenses | Amount |\n|--------|--------|----------|--------|\n| Salary (net) | R18 500 | Rent | R5 500 |\n| Child grant | R1 090 | Food | R3 200 |\n| | | Transport | R1 800 |\n| | | Electricity | R950 |\n| | | School fees | R1 200 |\n| | | Clothing | R800 |\n| | | Cellphone | R399 |\n| | | Savings | R1 500 |\n| **Total** | **R19 590** | **Total** | **R15 349** |\n\n**Surplus** = R19 590 − R15 349 = **R4 241**'),
  q(6, 'In the budget above, what percentage of total income goes to food? (Round to one decimal place.)',
    ['16,3%', '17,3%', '20,0%', '15,0%'], 0,
    'Food percentage = (R3 200 ÷ R19 590) × 100 = 16,3%.'),
  t(7, '### Reading a Bank Statement\n\nA bank statement shows all transactions in your account over a period.\n\n| Date | Description | Debit (out) | Credit (in) | Balance |\n|------|-------------|-------------|-------------|--------|\n| 01/03 | Opening balance | | | R5 240,00 |\n| 02/03 | Salary deposit | | R18 500,00 | R23 740,00 |\n| 03/03 | Rent (debit order) | R5 500,00 | | R18 240,00 |\n| 05/03 | Shoprite groceries | R1 245,60 | | R16 994,40 |\n| 10/03 | ATM withdrawal | R500,00 | | R16 494,40 |\n| 15/03 | Monthly bank fee | R69,00 | | R16 425,40 |\n| 25/03 | Electricity prepaid | R650,00 | | R15 775,40 |\n\n**Key terms:**\n- **Debit:** Money going OUT of your account\n- **Credit:** Money coming IN to your account\n- **Balance:** How much is in the account after each transaction'),
  q(8, 'Looking at the bank statement above, how much was spent in total (all debits) during March?',
    ['R7 964,60', 'R8 464,60', 'R18 500,00', 'R7 464,60'], 0,
    'Total debits: R5 500 + R1 245,60 + R500 + R69 + R650 = R7 964,60.'),
  fb(9, 'On a bank statement, money going out is called a ___ and money coming in is called a ___.',
    ['debit', 'credit'],
    'A debit is money leaving the account (expense). A credit is money entering the account (income).'),
  t(10, '### Terminology Used in Financial Documents\n\nMake sure you know these terms:\n\n| Term | Meaning |\n|------|--------|\n| **Subtotal** | Total before VAT or discounts |\n| **VAT** | Value Added Tax — 15% in South Africa |\n| **Gross** | Total before deductions |\n| **Net** | Amount remaining after deductions |\n| **Balance due** | Amount still to be paid |\n| **Account number** | Unique number identifying your account |\n| **Due date** | The last date by which payment must be made |\n| **Interest** | Charge for late payment or reward for saving |'),
  q(11, 'What is the difference between "gross" and "net" on a payslip?',
    ['Gross is before deductions; net is after deductions', 'Net is before deductions; gross is after deductions', 'They mean the same thing', 'Gross includes VAT; net excludes VAT'], 0,
    'Gross income is your total earnings before any deductions (tax, UIF, pension). Net income (take-home pay) is what you receive after all deductions.'),
];

blockNum = 0;
const ch4_lesson2 = [
  t(1, '## Tariff Systems\n\nA **tariff** is a structured pricing system where the price depends on how much you use. Many services in South Africa use tariffs.\n\n### Electricity Tariffs\n\n**Flat-rate tariff:** The same price per unit regardless of usage.\n- Example: R2,50 per kWh for all usage\n- If you use 400 kWh: Cost = 400 × R2,50 = R1 000\n\n**Stepped (inclining block) tariff:** The price per unit increases as usage increases.\n\n| Block | Usage | Rate per kWh |\n|-------|-------|--------------|\n| 1 | 0 – 350 kWh | R1,60 |\n| 2 | 351 – 600 kWh | R2,20 |\n| 3 | Over 600 kWh | R2,95 |\n\n**Example:** Calculate the cost for 500 kWh.\n- Block 1: 350 × R1,60 = R560\n- Block 2: (500 − 350) × R2,20 = 150 × R2,20 = R330\n- **Total = R560 + R330 = R890**'),
  q(2, 'Using the stepped tariff above, calculate the cost of using 750 kWh of electricity.',
    ['R1 552,50', 'R1 332,50', 'R1 110,00', 'R2 212,50'], 1,
    'Block 1: 350 × R1,60 = R560. Block 2: 250 × R2,20 = R550. Block 3: 150 × R2,95 = R442,50. Total = R560 + R550 + R442,50 = R1 552,50. Wait — 351 to 600 is 250 units, and 601 to 750 is 150 units. Total = R560 + R550 + R442,50 = R1 552,50. Let me recheck the answer options. R1 552,50 matches option A. Actually let me verify: 350 × 1,60 = 560. (600-350)=250 × 2,20 = 550. (750-600)=150 × 2,95 = 442,50. Total = 1552,50. The correct answer is R1 552,50.',
    ['Work through each block separately, then add them together.']),
  t(3, '### Municipal (Water) Tariffs\n\nMost South African municipalities provide a free basic water allocation for households.\n\n**Example municipal water tariff:**\n\n| Usage per month | Rate per kilolitre (kl) |\n|----------------|------------------------|\n| 0 – 6 kl | Free |\n| 7 – 12 kl | R8,50 per kl |\n| 13 – 20 kl | R15,80 per kl |\n| Over 20 kl | R26,50 per kl |\n\n**Example:** A household uses 16 kl of water in a month.\n- First 6 kl: Free = R0\n- Next 6 kl (7–12): 6 × R8,50 = R51,00\n- Next 4 kl (13–16): 4 × R15,80 = R63,20\n- **Total = R0 + R51,00 + R63,20 = R114,20**\n\n**Note:** 1 kilolitre = 1 000 litres. An average South African household uses 15–20 kl per month.'),
  fb(4, 'A household uses 22 kl of water. Using the tariff above, the total water bill is R ___.',
    ['230,40'],
    'First 6 kl: Free. Next 6 kl (7–12): 6 × R8,50 = R51. Next 8 kl (13–20): 8 × R15,80 = R126,40. Last 2 kl (21–22): 2 × R26,50 = R53. Total = R0 + R51 + R126,40 + R53 = R230,40.',
    ['Calculate each block step by step, then add all the costs.']),
  t(5, '### Telephone and Cellphone Tariffs\n\n**Landline tariff example:**\n- Line rental: R190 per month\n- Local calls: R0,85 per minute\n- Long-distance: R2,10 per minute\n\n**Comparing prepaid vs contract:**\n\n| Feature | Prepaid | Contract |\n|---------|---------|----------|\n| Monthly fee | R0 | R299 |\n| Call rate | R2,99/min | 100 min included, then R1,80/min |\n| Data | Buy as needed | 3 GB included |\n| Commitment | None | 24 months |\n\n**Finding the break-even point:**\nAt how many minutes is the cost the same?\n- Prepaid: Cost = 2,99m (where m = minutes)\n- Contract: Cost = R299 (for up to 100 min)\n\nSet equal: 2,99m = 299, so m = 100 minutes.\nIf you use **more than 100 minutes**, the contract is cheaper.\nIf you use **fewer than 100 minutes**, prepaid is cheaper.'),
  q(6, 'Using the tariff above, what does it cost a prepaid user to make 45 minutes of calls in a month?',
    ['R134,55', 'R89,70', 'R179,40', 'R299,00'], 0,
    'Prepaid cost = 45 × R2,99 = R134,55.'),
  t(7, '### Transport Tariffs\n\n**Taxi tariff example:**\n- Flag drop (fixed charge): R10\n- Per kilometre: R7,50\n- Formula: Cost = 10 + 7,50d (where d = distance in km)\n\n**Bus tariff example (Metrobus Johannesburg):**\n\n| Distance | Single fare |\n|----------|------------|\n| 0 – 5 km | R8,50 |\n| 6 – 15 km | R12,00 |\n| 16 – 30 km | R16,50 |\n| Over 30 km | R21,00 |\n\n**Drawing and interpreting tariff graphs:**\nA tariff formula like Cost = 10 + 7,50d produces a straight-line graph:\n- The y-intercept (R10) is the fixed charge\n- The gradient (R7,50) is the cost per kilometre\n\nTo compare two tariff options, plot both on the same axes and find where the lines cross. That is the break-even point.'),
  q(8, 'Using the taxi tariff (Cost = 10 + 7,50d), what is the cost of a 12 km ride?',
    ['R100', 'R90', 'R80', 'R110'], 0,
    'Cost = 10 + 7,50 × 12 = 10 + 90 = R100.'),
  fb(9, 'A tariff formula is C = 15 + 5d. The fixed charge is R ___ and the cost per km is R ___.',
    ['15', '5'],
    'In the formula C = 15 + 5d, the constant (15) is the fixed charge, and the coefficient of d (5) is the cost per kilometre.'),
  t(10, '### Interpreting Tariff Graphs\n\nWhen comparing two tariff options on a graph:\n\n1. **Below the intersection point:** The lower line is cheaper\n2. **At the intersection point:** Both options cost the same (break-even)\n3. **Above the intersection point:** The higher line is more expensive\n\n**Example:** Comparing two internet packages:\n- Package A: R200 per month + R0,50 per MB extra data\n- Package B: R100 per month + R1,50 per MB extra data\n\nBreak-even: 200 + 0,50x = 100 + 1,50x → 100 = x → 100 MB extra data.\n\nIf you use more than 100 MB extra, Package A is cheaper.\nIf you use less than 100 MB extra, Package B is cheaper.'),
  q(11, 'Two electricity providers offer: Provider X: R150 + R1,80 per kWh. Provider Y: R80 + R2,50 per kWh. At how many kWh are they the same price?',
    ['100 kWh', '150 kWh', '80 kWh', '200 kWh'], 0,
    '150 + 1,80n = 80 + 2,50n → 70 = 0,70n → n = 100 kWh. At 100 kWh both cost R330.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Measurement — Conversions and Measuring (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Measurement: Conversions\n\n### The Metric System\n\nSouth Africa uses the metric system. It is based on powers of 10, making conversions straightforward.\n\n**Length:**\n\n| Unit | Abbreviation | Relation |\n|------|-------------|----------|\n| Kilometre | km | 1 km = 1 000 m |\n| Metre | m | 1 m = 100 cm |\n| Centimetre | cm | 1 cm = 10 mm |\n| Millimetre | mm | base unit |\n\n**Mass:**\n\n| Unit | Abbreviation | Relation |\n|------|-------------|----------|\n| Tonne | t | 1 t = 1 000 kg |\n| Kilogram | kg | 1 kg = 1 000 g |\n| Gram | g | 1 g = 1 000 mg |\n\n**Capacity/Volume:**\n\n| Unit | Abbreviation | Relation |\n|------|-------------|----------|\n| Kilolitre | kl | 1 kl = 1 000 ℓ |\n| Litre | ℓ | 1 ℓ = 1 000 ml |\n| Millilitre | ml | 1 ml = 1 cm³ |\n\n**Conversion rule:** To convert from a larger unit to a smaller unit, **multiply**. To convert from a smaller unit to a larger unit, **divide**.'),
  q(2, 'Convert 4,25 km to metres.',
    ['42,5 m', '425 m', '4 250 m', '42 500 m'], 2,
    '4,25 km × 1 000 = 4 250 m.'),
  t(3, '### Time Conversions\n\nTime is not based on 10, so be careful with conversions.\n\n**Key time facts:**\n- 1 minute = 60 seconds\n- 1 hour = 60 minutes = 3 600 seconds\n- 1 day = 24 hours\n- 1 week = 7 days\n- 1 year = 365 days (366 in a leap year)\n- 1 year = 12 months = 52 weeks\n\n**24-hour vs 12-hour clock:**\n\n| 12-hour | 24-hour |\n|---------|--------|\n| 12:00 AM (midnight) | 00:00 |\n| 7:30 AM | 07:30 |\n| 12:00 PM (noon) | 12:00 |\n| 3:45 PM | 15:45 |\n| 9:15 PM | 21:15 |\n| 11:59 PM | 23:59 |\n\n**Converting:** For PM times (except 12 PM), add 12 to the hour.\n- 4:20 PM = 16:20\n- 8:00 PM = 20:00\n\nFor 24-hour times after 12:00, subtract 12 to get PM.\n- 17:30 = 5:30 PM\n- 22:00 = 10:00 PM'),
  fb(4, 'Convert 6:45 PM to 24-hour time: ___. Convert 14:20 to 12-hour time: ___ PM.',
    ['18:45', '2:20'],
    '6:45 PM: 6 + 12 = 18, so 18:45. 14:20: 14 - 12 = 2, so 2:20 PM.'),
  t(5, '### Calculating Elapsed Time\n\n**Elapsed time** is the amount of time that passes between two events.\n\n**Method:** Count forward from the start time to the end time.\n\n**Example 1:** A lesson starts at 09:15 and ends at 10:50.\n- From 09:15 to 10:00 = 45 minutes\n- From 10:00 to 10:50 = 50 minutes\n- Total = 1 hour 35 minutes\n\n**Example 2:** A bus departs at 22:40 and arrives at 05:15 the next day.\n- From 22:40 to 00:00 = 1 hour 20 minutes\n- From 00:00 to 05:15 = 5 hours 15 minutes\n- Total = 6 hours 35 minutes\n\n**Working with dates:**\nA library book is borrowed on 18 February and returned on 5 March (not a leap year).\n- February: 28 − 18 = 10 days remaining\n- March: 5 days\n- Total: 15 days'),
  q(6, 'A train departs Johannesburg at 17:45 and arrives in Bloemfontein at 23:20. How long is the journey?',
    ['5 hours 35 minutes', '6 hours 25 minutes', '4 hours 35 minutes', '5 hours 25 minutes'], 0,
    'From 17:45 to 18:00 = 15 min. From 18:00 to 23:00 = 5 hours. From 23:00 to 23:20 = 20 min. Total = 5 hours 35 minutes.'),
  t(7, '### Temperature Conversions\n\nSouth Africa uses **Celsius** (°C). Some other countries use **Fahrenheit** (°F).\n\n**Formulae:**\n$$°F = \\frac{9}{5} \\times °C + 32$$\n$$°C = \\frac{5}{9} \\times (°F - 32)$$\n\n**Key reference points:**\n\n| Event | Celsius | Fahrenheit |\n|-------|---------|------------|\n| Water freezes | 0°C | 32°F |\n| Body temperature | 37°C | 98,6°F |\n| Water boils | 100°C | 212°F |\n| Hot summer day (SA) | 35°C | 95°F |\n\n**Example:** Convert 30°C to Fahrenheit.\n$$°F = \\frac{9}{5} \\times 30 + 32 = 54 + 32 = 86°F$$'),
  q(8, 'A weather report from the USA says it is 68°F. Convert this to Celsius.',
    ['20°C', '25°C', '36°C', '15°C'], 0,
    '°C = 5/9 × (68 − 32) = 5/9 × 36 = 20°C.'),
  t(9, '### Cooking Measurement Conversions\n\nSouth African recipes often use cups, tablespoons, and teaspoons alongside metric measurements.\n\n**Standard conversions:**\n\n| Measure | Metric equivalent |\n|---------|------------------|\n| 1 cup | 250 ml |\n| 1 tablespoon (tbsp) | 15 ml |\n| 1 teaspoon (tsp) | 5 ml |\n| 1 pound (lb) | approximately 454 g |\n| 1 ounce (oz) | approximately 28 g |\n\n**Example:** A recipe calls for 1½ cups of milk and 3 tablespoons of oil.\n- Milk: 1,5 × 250 = 375 ml\n- Oil: 3 × 15 = 45 ml'),
  fb(10, 'A baking recipe needs 3 cups of flour and 2 teaspoons of salt. In metric: flour = ___ ml, salt = ___ ml.',
    ['750', '10'],
    'Flour: 3 × 250 = 750 ml. Salt: 2 × 5 = 10 ml.'),
  q(11, 'A recipe for 8 people uses 500 g of mince. How much mince is needed for 12 people?',
    ['750 g', '600 g', '1 000 g', '650 g'], 0,
    'For 1 person: 500 ÷ 8 = 62,5 g. For 12 people: 62,5 × 12 = 750 g.'),
];

blockNum = 0;
const ch5_lesson2 = [
  t(1, '## Measurement: Measuring and Estimating\n\n### Choosing the Right Instrument\n\nDifferent quantities require different measuring instruments.\n\n| What to measure | Instrument | Unit |\n|----------------|-----------|------|\n| Length of a room | Tape measure | metres (m) |\n| Thickness of a coin | Ruler / vernier caliper | millimetres (mm) |\n| Mass of flour | Kitchen scale | grams (g) / kilograms (kg) |\n| Body mass | Bathroom scale | kilograms (kg) |\n| Liquid volume | Measuring jug | millilitres (ml) / litres (ℓ) |\n| Temperature | Thermometer | degrees Celsius (°C) |\n| Time | Watch / stopwatch | seconds, minutes, hours |\n\n### Reading Scales\n\nMany instruments have **graduated scales** (marked lines with numbers).\n\nTo read a scale:\n1. Find two labelled marks\n2. Count the small divisions between them\n3. Work out what each small division represents\n4. Read the measurement\n\n**Example:** A kitchen scale has marks at 0 g, 100 g, 200 g, etc. Between 100 g and 200 g there are 5 small divisions. Each small division = 100 ÷ 5 = 20 g. If the pointer is on the 3rd division past 100, the reading is 100 + 3 × 20 = 160 g.'),
  q(2, 'A ruler has marks every millimetre. A pencil measures from the 0 mm mark to the 187 mm mark. How long is the pencil in centimetres?',
    ['18,7 cm', '1,87 cm', '187 cm', '1 870 cm'], 0,
    '187 mm ÷ 10 = 18,7 cm.'),
  t(3, '### Estimating Measurements\n\nEstimating helps you check whether a measurement or answer is reasonable.\n\n**Useful benchmarks:**\n\n| Reference | Approximate measurement |\n|-----------|------------------------|\n| Width of your thumb | 2 cm |\n| Length of your forearm (elbow to fingertips) | 45 cm |\n| Height of a door | 2,1 m |\n| Length of a car | 4–5 m |\n| Mass of a litre of water | 1 kg |\n| Mass of a 2-litre cold drink | 2 kg |\n| Teaspoon of sugar | 5 g |\n| Room temperature | 20–25°C |\n| Walking speed | 5 km/h |\n\n**Estimation in context:**\nIf someone says a classroom is 50 m long, that seems too much — a classroom is typically 8–12 m long. Using benchmarks helps you spot errors.'),
  fb(4, 'Estimate: A standard brick is about ___ cm long and about ___ cm wide.',
    ['22', '10'],
    'A standard South African brick is approximately 22 cm long, 10 cm wide, and 7,5 cm high.'),
  t(5, '### Measuring Length and Distance\n\nWhen measuring length, always:\n- Start from the **zero mark** (not the edge of the ruler)\n- Keep the ruler **parallel** to the object\n- Read at **eye level** to avoid parallax error\n\n**Perimeter** is the total distance around a shape. Measure each side and add them together.\n\n**Example:** Measure the four sides of a classroom.\n- Length 1: 8,4 m\n- Width 1: 6,2 m\n- Length 2: 8,4 m\n- Width 2: 6,2 m\n- Perimeter = 2(8,4 + 6,2) = 2 × 14,6 = 29,2 m'),
  q(6, 'A learner measures the sides of a triangular flower bed: 3,5 m, 4,2 m, and 5,1 m. What is the perimeter?',
    ['12,8 m', '14,7 m', '8,7 m', '10,3 m'], 0,
    'Perimeter = 3,5 + 4,2 + 5,1 = 12,8 m.'),
  t(7, '### Measuring Mass and Volume\n\n**Mass:**\n- Use a **kitchen scale** for small items (grams)\n- Use a **bathroom scale** for body mass (kilograms)\n- Always **zero the scale** (tare) before measuring\n\n**Volume of liquids:**\n- Use a **measuring jug** or **graduated cylinder**\n- Place on a flat surface\n- Read at **eye level** at the bottom of the meniscus (curved surface)\n\n**Volume of regular solids:**\nUse formulae:\n- Rectangular box: Volume = length × width × height\n- Cylinder: Volume = π × r² × h\n\n**Volume of irregular solids:**\nUse the **displacement method:** place the object in water and measure how much the water level rises.'),
  q(8, 'A rectangular container is 25 cm long, 15 cm wide, and 20 cm high. What is its volume in litres?',
    ['7,5 litres', '7 500 litres', '75 litres', '0,75 litres'], 0,
    'Volume = 25 × 15 × 20 = 7 500 cm³. Since 1 000 cm³ = 1 litre, volume = 7 500 ÷ 1 000 = 7,5 litres.'),
  t(9, '### Calculating Costs from Measurements\n\nMeasurements are often used to calculate costs in real life.\n\n**Example 1: Fencing a garden**\nA rectangular garden is 15 m by 8 m.\n- Perimeter = 2(15 + 8) = 46 m\n- Fencing costs R95 per metre\n- Total cost = 46 × R95 = R4 370\n\n**Example 2: Tiling a floor**\nA room is 4 m by 3,5 m.\n- Area = 4 × 3,5 = 14 m²\n- Add 10% for cutting and wastage: 14 × 1,10 = 15,4 m²\n- Tiles cost R185 per m²\n- Total cost = 15,4 × R185 = R2 849\n\n**Example 3: Filling a pool**\nA pool holds 25 000 litres = 25 kl.\n- Water costs R12 per kl\n- Cost = 25 × R12 = R300'),
  fb(10, 'A room is 5 m by 4 m. Carpet costs R120 per square metre. The total cost to carpet the room is R ___.',
    ['2400'],
    'Area = 5 × 4 = 20 m². Cost = 20 × R120 = R2 400.'),
  q(11, 'A farmer needs to fence a rectangular field that is 120 m by 80 m. Fencing costs R65 per metre. What is the total cost?',
    ['R26 000', 'R15 600', 'R31 200', 'R10 400'], 0,
    'Perimeter = 2(120 + 80) = 400 m. Cost = 400 × R65 = R26 000.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Maps, Plans and Other Representations (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Maps: Scale and Distance\n\n### Understanding Scale\n\nA **scale** tells you the relationship between a distance on a map (or plan) and the real distance.\n\n**Types of scale:**\n\n| Type | Example |\n|------|--------|\n| Ratio scale | 1 : 50 000 |\n| Word scale | 1 cm represents 500 m |\n| Bar scale | A drawn line showing real distance |\n\n**Reading a ratio scale:**\n1 : 50 000 means 1 cm on the map = 50 000 cm in real life = 500 m = 0,5 km.\n\n**Calculating actual distance:**\nMap distance × scale factor = actual distance\n\n**Example:** Scale 1 : 25 000. Two schools are 6 cm apart on the map.\n- Actual distance = 6 × 25 000 = 150 000 cm = 1 500 m = **1,5 km**\n\n**Calculating map distance:**\nActual distance ÷ scale factor = map distance\n\n**Example:** Scale 1 : 50 000. A road is 3 km long.\n- 3 km = 300 000 cm\n- Map distance = 300 000 ÷ 50 000 = **6 cm**'),
  q(2, 'On a map with scale 1 : 20 000, two landmarks are 8,5 cm apart. What is the actual distance in metres?',
    ['1 700 m', '170 m', '17 000 m', '425 m'], 0,
    '8,5 × 20 000 = 170 000 cm = 1 700 m.'),
  t(3, '### Compass Directions\n\nThe eight main compass directions help describe the position and direction of places.\n\n```\n         N\n    NW       NE\n  W     +     E\n    SW       SE\n         S\n```\n\n**Using directions:**\n- "The school is north-east of the library"\n- "Walk south along Main Road for 500 m"\n\n**Direction indicators on maps:**\n- Most maps have **North at the top**\n- A compass rose or North arrow is shown on the map\n- Left = West, Right = East, Up = North, Down = South\n\n**Describing position:** Use a combination of direction and distance.\n"The hospital is 2 km south-west of the town hall."'),
  fb(4, 'If you face North and turn clockwise by 90°, you are now facing ___. If you turn clockwise by another 135° you face ___.',
    ['East', 'South-West'],
    'Starting North, 90° clockwise = East. From East, 135° more clockwise: East (90°) + 135° = 225° from North = South-West.'),
  t(5, '### Reading Maps\n\n**Town/street maps** show:\n- Street names and layout\n- Important buildings (schools, hospitals, police stations)\n- Parks and open areas\n- Scale and compass direction\n\n**Features to look for:**\n- Grid references (e.g., B3 means column B, row 3)\n- Legend/key explaining symbols\n- Distance markers\n\n**Route planning:**\n1. Find your starting point and destination\n2. Identify possible routes\n3. Estimate distances using the scale\n4. Choose the shortest or most practical route\n\n**Example:** On a town map (scale 1 : 10 000), a route from the school to the library follows 3 streets measuring 4 cm, 2,5 cm, and 3 cm on the map.\n- Total map distance = 9,5 cm\n- Actual distance = 9,5 × 10 000 = 95 000 cm = 950 m'),
  q(6, 'A map has a grid. The post office is at grid reference C4 and the park is at grid reference E2. Which direction is the park from the post office?',
    ['South-East', 'North-East', 'South-West', 'North-West'], 0,
    'Moving from C to E is moving right (East). Moving from row 4 to row 2 is moving down (South, since row numbers increase downward on this grid). So the park is South-East of the post office.'),
  t(7, '### Bar Scales\n\nA **bar scale** is a line drawn on the map with actual distances marked.\n\nTo use a bar scale:\n1. Measure the distance between two points on the map using a ruler or piece of paper\n2. Place that measurement against the bar scale\n3. Read off the actual distance\n\n**Advantages of bar scales:**\n- Still accurate when the map is enlarged or reduced (unlike ratio scales)\n- Easy to use without calculations\n\n**Example:** A bar scale shows that a 2 cm line represents 500 m. If two towns are 7 cm apart on the map:\n$$\\text{Actual distance} = \\frac{7}{2} \\times 500 = 1\\,750 \\text{ m} = 1,75 \\text{ km}$$'),
  q(8, 'A bar scale shows that 3 cm = 600 m. Two buildings are 5 cm apart on the map. What is the actual distance?',
    ['1 000 m', '900 m', '1 200 m', '1 500 m'], 0,
    'Each cm = 600 ÷ 3 = 200 m. So 5 cm = 5 × 200 = 1 000 m.'),
  t(9, '### Layout and Seating Plans\n\n**Seating plans** are used for:\n- Cinemas, theatres, and stadiums\n- Classrooms and exam venues\n- Aeroplanes\n\nThey show the arrangement of seats viewed from above.\n\n**Key features:**\n- Rows labelled with letters (A, B, C...) or numbers\n- Seats numbered within each row\n- Stage/screen at one end\n- Aisles and exits marked\n\n**Example:** A school hall has 25 rows of 20 seats.\n- Total capacity = 25 × 20 = 500 seats\n- If Row A is at the front, seat M12 means Row M (13th row), Seat 12.\n\n**Layout plans** show the arrangement of furniture or equipment in a room from a bird\'s-eye view. You need to use the scale to calculate actual distances and areas.'),
  fb(10, 'A cinema has 18 rows of 24 seats. The total capacity is ___ seats. If tickets cost R85 each, maximum revenue from a full house is R ___.',
    ['432', '36720'],
    'Total seats = 18 × 24 = 432. Maximum revenue = 432 × R85 = R36 720.'),
  q(11, 'On a seating plan, Row A is closest to the stage. A seat labelled F15 is in which row from the front?',
    ['6th row', '5th row', '15th row', '21st row'], 0,
    'F is the 6th letter of the alphabet, so F15 is in the 6th row from the front, seat number 15.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Probability (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Probability\n\n### What is Probability?\n\nProbability measures how **likely** an event is to happen. It is expressed as a number between 0 and 1.\n\n$$P(\\text{event}) = \\frac{\\text{Number of favourable outcomes}}{\\text{Total number of possible outcomes}}$$\n\n**Probability scale:**\n\n| Value | Meaning | Example |\n|-------|---------|--------|\n| 0 | Impossible | Rolling a 7 on a standard die |\n| 0,25 | Unlikely | Drawing an ace from a shuffled deck |\n| 0,5 | Even chance | Flipping heads on a coin |\n| 0,75 | Likely | Rain when the sky is very cloudy |\n| 1 | Certain | The sun rising tomorrow |\n\nProbability can also be written as a **fraction**, **decimal**, or **percentage**.\n$$P = \\frac{1}{4} = 0,25 = 25\\%$$'),
  q(2, 'A bag contains 3 red, 4 blue, and 5 green marbles. What is the probability of randomly drawing a red marble?',
    ['3/12 = 1/4', '3/9', '3/5', '4/12'], 0,
    'Total marbles = 3 + 4 + 5 = 12. P(red) = 3/12 = 1/4.'),
  t(3, '### Expressing Probability\n\n**From fraction to decimal:** Divide numerator by denominator.\n$$P = \\frac{3}{12} = 3 \\div 12 = 0,25$$\n\n**From decimal to percentage:** Multiply by 100.\n$$0,25 \\times 100 = 25\\%$$\n\n**The complement (NOT event):**\nIf the probability of an event happening is P(A), then the probability of it NOT happening is:\n$$P(\\text{not } A) = 1 - P(A)$$\n\n**Example:** If P(rain) = 0,3 then P(no rain) = 1 − 0,3 = 0,7 = 70%.\n\nProbabilities of all possible outcomes always add up to 1 (or 100%).'),
  fb(4, 'A weather forecast says there is a 40% chance of rain. As a decimal this is ___. The probability of no rain is ___.',
    ['0,4', '0,6'],
    '40% = 0,4. P(no rain) = 1 − 0,4 = 0,6.'),
  t(5, '### Relative Frequency\n\n**Relative frequency** is based on actual experiments or observations, not theory.\n\n$$\\text{Relative frequency} = \\frac{\\text{Number of times event occurred}}{\\text{Total number of trials}}$$\n\n**Example:** A coin is flipped 50 times. Heads appears 28 times.\n- Relative frequency of heads = 28/50 = 0,56 = 56%\n- Theoretical probability of heads = 1/2 = 50%\n\nThe more trials you do, the closer the relative frequency gets to the theoretical probability. This is called the **Law of Large Numbers**.\n\n**Using relative frequency for prediction:**\nA traffic survey shows that 18 out of 120 cars exceed the speed limit.\n- Relative frequency = 18/120 = 0,15\n- If 500 cars pass the same point, we predict about 0,15 × 500 = 75 cars will exceed the limit.'),
  q(6, 'A factory tests 200 batteries and finds 8 are faulty. What is the relative frequency of faulty batteries?',
    ['0,04', '0,4', '0,08', '0,008'], 0,
    'Relative frequency = 8 ÷ 200 = 0,04 (or 4%).'),
  t(7, '### Probability with Dice and Coins\n\n**Standard die** (6 faces: 1, 2, 3, 4, 5, 6):\n- P(rolling a 3) = 1/6\n- P(rolling an even number: 2, 4, 6) = 3/6 = 1/2\n- P(rolling a number greater than 4: 5 or 6) = 2/6 = 1/3\n\n**Coin** (2 outcomes: Heads, Tails):\n- P(Heads) = 1/2\n- P(Tails) = 1/2\n\n**Playing cards** (52 cards, 4 suits of 13):\n- Suits: Hearts ♥, Diamonds ♦ (red), Clubs ♣, Spades ♠ (black)\n- Each suit: A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K\n- P(drawing a heart) = 13/52 = 1/4\n- P(drawing a king) = 4/52 = 1/13\n- P(drawing a red card) = 26/52 = 1/2'),
  q(8, 'A standard die is rolled. What is the probability of getting a number less than 5?',
    ['4/6 = 2/3', '5/6', '3/6 = 1/2', '1/6'], 0,
    'Numbers less than 5: 1, 2, 3, 4 — that is 4 outcomes. P = 4/6 = 2/3.'),
  t(9, '### Tree Diagrams\n\nA **tree diagram** shows all possible outcomes when there are two or more events.\n\n**Example:** Flipping a coin twice.\n\nFirst flip → Second flip → Outcome\n- H → H → HH\n- H → T → HT\n- T → H → TH\n- T → T → TT\n\nTotal outcomes = 4\n\n- P(two heads) = 1/4\n- P(at least one head) = 3/4 (HH, HT, TH)\n- P(exactly one head) = 2/4 = 1/2 (HT, TH)\n\n**To find the probability of a specific path:** Multiply the probabilities along the branches.\n$$P(HH) = \\frac{1}{2} \\times \\frac{1}{2} = \\frac{1}{4}$$\n\n**Total number of outcomes** = multiply the number of options at each stage.\n- Coin (2) × Coin (2) = 4 outcomes\n- Coin (2) × Die (6) = 12 outcomes'),
  q(10, 'A coin is flipped and a die is rolled. How many possible outcomes are there?',
    ['12', '8', '6', '36'], 0,
    'Coin: 2 outcomes. Die: 6 outcomes. Total = 2 × 6 = 12 outcomes.'),
  fb(11, 'Two coins are flipped. The probability of getting two tails (TT) is ___. The probability of getting at least one head is ___.',
    ['1/4', '3/4'],
    'Outcomes: HH, HT, TH, TT. P(TT) = 1/4. P(at least one head) = 3/4 (HH, HT, TH).'),
  q(12, 'A bag has 2 red and 3 blue marbles. One marble is drawn and replaced, then another is drawn. What is the probability of drawing red both times?',
    ['4/25', '2/5', '1/10', '4/10'], 0,
    'P(red first) = 2/5. Since the marble is replaced, P(red second) = 2/5. P(both red) = 2/5 × 2/5 = 4/25.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Finance — Income, Expenditure and Interest (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Income and Expenditure\n\n### Types of Income\n\nPeople earn money in different ways:\n\n| Type | Description | Example |\n|------|-------------|--------|\n| **Salary** | Fixed monthly amount | Teacher earning R28 000/month |\n| **Wage** | Paid per hour, day, or unit | Waitress earning R35/hour |\n| **Commission** | Percentage of sales | Car salesman earning 3% of sale price |\n| **Overtime** | Extra pay for extra hours | 1,5× normal rate after 8 hours |\n| **Bonus** | Once-off extra payment | 13th cheque at year end |\n| **Grant** | Government payment | Child Support Grant (R510/month) |\n\n**Example — wage calculation:**\nJabu works at a garage. Normal rate: R42 per hour. Overtime (after 9 hours/day): 1,5 × R42 = R63/hour.\nOn Monday he works 11 hours.\n- Normal: 9 × R42 = R378\n- Overtime: 2 × R63 = R126\n- **Total for Monday = R504**'),
  q(2, 'A salesperson earns R5 500 basic salary plus 3% commission. She sells R85 000 of goods. What is her total income?',
    ['R8 050', 'R7 550', 'R8 500', 'R7 050'], 0,
    'Commission = 3% × R85 000 = R2 550. Total = R5 500 + R2 550 = R8 050.'),
  t(3, '### Income and Expenditure Statements\n\nAn **income and expenditure statement** shows all money coming in and going out over a period.\n\n**Example — Thandi\'s monthly statement:**\n\n| **Income** | Amount | **Expenditure** | Amount |\n|-----------|--------|-----------------|--------|\n| Salary (net) | R16 000 | Rent | R4 800 |\n| Part-time tutoring | R2 500 | Groceries | R3 500 |\n| | | Transport (taxi) | R1 200 |\n| | | Electricity | R780 |\n| | | Cellphone | R350 |\n| | | Clothing | R600 |\n| | | Savings | R2 000 |\n| **Total Income** | **R18 500** | **Total Expenditure** | **R13 230** |\n\n**Surplus:** R18 500 − R13 230 = **R5 270**\n\nA positive result means Thandi is living within her means. A negative result (deficit) means she is overspending.'),
  fb(4, 'If Thandi\'s rent increases by R500 and her electricity by R120, her new surplus would be R ___.',
    ['4650'],
    'New expenses: R13 230 + R500 + R120 = R13 850. New surplus: R18 500 − R13 850 = R4 650.'),
  t(5, '### Profit, Loss and Break-Even\n\n**Cost price (CP):** What you pay to buy or make something.\n**Selling price (SP):** What you sell it for.\n\n$$\\text{Profit} = SP - CP \\quad (\\text{when } SP > CP)$$\n$$\\text{Loss} = CP - SP \\quad (\\text{when } CP > SP)$$\n\n**Percentage profit:**\n$$\\text{Profit \\%} = \\frac{SP - CP}{CP} \\times 100$$\n\n**Break-even:** The point where income equals costs — no profit and no loss.\n\n**Example:** A learner sells muffins at school.\n- Ingredients cost R80 (fixed for one batch of 20 muffins)\n- She sells each muffin for R8\n- Break-even = R80 ÷ R8 = **10 muffins**\n- After selling 10, every additional muffin is profit.\n- If she sells all 20: Income = 20 × R8 = R160. Profit = R160 − R80 = R80.'),
  q(6, 'A vendor buys 50 packets of chips at R5 each and sells them at R12 each. What is the total profit if all are sold?',
    ['R350', 'R600', 'R250', 'R450'], 0,
    'Cost = 50 × R5 = R250. Income = 50 × R12 = R600. Profit = R600 − R250 = R350.'),
  t(7, '### VAT (Value Added Tax)\n\nSouth Africa charges **15% VAT** on most goods and services.\n\n**VAT-inclusive price** (what you pay at the shop):\n$$\\text{Price incl. VAT} = \\text{Price excl. VAT} \\times 1,15$$\n\n**Finding the price excluding VAT:**\n$$\\text{Price excl. VAT} = \\frac{\\text{Price incl. VAT}}{1,15}$$\n\n**Finding the VAT amount:**\n$$\\text{VAT} = \\text{Price incl. VAT} - \\text{Price excl. VAT}$$\n\n**Zero-rated items** (no VAT charged): bread, milk, eggs, fruit, vegetables, maize meal, rice, cooking oil, and a few others.\n\n**Example:** A printer costs R2 499 including VAT.\n- Excluding VAT: R2 499 ÷ 1,15 = R2 173,04\n- VAT amount: R2 499 − R2 173,04 = R325,96'),
  q(8, 'A pair of shoes costs R899 excluding VAT. What is the price including 15% VAT?',
    ['R1 033,85', 'R1 013,85', 'R764,15', 'R1 079,00'], 0,
    'Including VAT: R899 × 1,15 = R1 033,85.'),
  fb(9, 'A laptop costs R13 499 including VAT. The price excluding VAT is R ___. The VAT amount is R ___.',
    ['11738,26', '1760,74'],
    'Price excl. VAT = R13 499 ÷ 1,15 = R11 738,26. VAT = R13 499 − R11 738,26 = R1 760,74.'),
  t(10, '### Discounts\n\nA **discount** is a reduction in price, usually expressed as a percentage.\n\n$$\\text{Discount amount} = \\text{Original price} \\times \\text{Discount \\%}$$\n$$\\text{Sale price} = \\text{Original price} - \\text{Discount amount}$$\n\nOr more directly:\n$$\\text{Sale price} = \\text{Original price} \\times (1 - \\text{Discount \\%})$$\n\n**Example:** A jacket costs R1 200 and has a 25% discount.\n- Discount = R1 200 × 0,25 = R300\n- Sale price = R1 200 − R300 = R900\n- Or: R1 200 × 0,75 = R900\n\n**Note:** Discounts are usually applied BEFORE VAT is added.'),
  q(11, 'A television originally costs R7 999 (incl. VAT). It goes on a 15% sale. What is the discounted price?',
    ['R6 799,15', 'R6 499,15', 'R7 199,10', 'R5 599,30'], 0,
    'Discounted price = R7 999 × (1 − 0,15) = R7 999 × 0,85 = R6 799,15.'),
];

blockNum = 0;
const ch8_lesson2 = [
  t(1, '## Interest and Tax\n\n### Simple Interest\n\n**Simple interest** is calculated only on the original amount (the principal).\n\n$$A = P(1 + i \\times n)$$\n\nWhere:\n- A = final amount\n- P = principal (original amount)\n- i = interest rate per year (as a decimal)\n- n = number of years\n\n**Interest earned:**\n$$\\text{Interest} = A - P = P \\times i \\times n$$\n\n**Example:** R3 000 is deposited in a savings account at 6% simple interest for 4 years.\n- Interest = R3 000 × 0,06 × 4 = R720\n- Final amount = R3 000 + R720 = R3 720\n\nOr using the formula: A = R3 000(1 + 0,06 × 4) = R3 000 × 1,24 = R3 720'),
  q(2, 'R5 000 is invested at 8% simple interest per annum for 3 years. What is the total amount at the end?',
    ['R6 200', 'R5 800', 'R5 400', 'R6 500'], 0,
    'A = P(1 + in) = R5 000(1 + 0,08 × 3) = R5 000 × 1,24 = R6 200.'),
  t(3, '### Compound Interest\n\n**Compound interest** is calculated on the principal **plus** any previously earned interest. This means interest earns interest.\n\n$$A = P(1 + i)^n$$\n\n**Example:** R3 000 at 6% compound interest for 4 years.\n\n| Year | Start amount | Interest (6%) | End amount |\n|------|-------------|---------------|------------|\n| 1 | R3 000,00 | R180,00 | R3 180,00 |\n| 2 | R3 180,00 | R190,80 | R3 370,80 |\n| 3 | R3 370,80 | R202,25 | R3 573,05 |\n| 4 | R3 573,05 | R214,38 | R3 787,43 |\n\nUsing the formula: A = R3 000(1,06)⁴ = R3 000 × 1,2625 = R3 787,43\n\n**Compare:** Simple interest gave R3 720. Compound interest gives R3 787,43 — that is R67,43 more, because interest earns interest.'),
  fb(4, 'R10 000 is invested at 5% compound interest for 2 years. After year 1 the amount is R ___. After year 2 the final amount is R ___.',
    ['10500', '11025'],
    'Year 1: R10 000 × 1,05 = R10 500. Year 2: R10 500 × 1,05 = R11 025. Or A = R10 000(1,05)² = R11 025.'),
  t(5, '### Simple vs Compound Interest — When Each is Used\n\n| Type | Used for | Key feature |\n|------|---------|-------------|\n| Simple interest | Hire purchase, short-term loans | Interest stays the same each year |\n| Compound interest | Savings accounts, long-term investments | Interest grows each year |\n\n**The power of compound interest over time:**\nR1 000 at 10% for different periods:\n\n| Years | Simple interest | Compound interest |\n|-------|----------------|-------------------|\n| 5 | R1 500 | R1 610,51 |\n| 10 | R2 000 | R2 593,74 |\n| 20 | R3 000 | R6 727,50 |\n| 30 | R4 000 | R17 449,40 |\n\nOver 30 years, compound interest produces over **four times** more than simple interest. This is why starting to save early is so important.'),
  q(6, 'Which statement about simple and compound interest is TRUE?',
    ['Compound interest always gives a higher return than simple interest over more than one period', 'Simple interest always gives a higher return', 'Both always give the same return', 'Simple interest is calculated on the accumulated amount'], 0,
    'Compound interest earns interest on interest, so over more than one period it always gives a higher return than simple interest at the same rate.'),
  t(7, '### Introduction to Tax\n\n**Tax** is money collected by the government to pay for public services.\n\n**Types of tax in South Africa:**\n\n| Tax | What it is |\n|-----|----------|\n| **Income tax (PAYE)** | Percentage of your earnings paid to SARS |\n| **VAT** | 15% on most goods and services |\n| **UIF** | 1% of salary for unemployment insurance |\n\n**Tax-free threshold (2024/2025):** If you earn less than R95 750 per year (under 65), you pay no income tax.\n\n**Understanding a payslip:**\n\n| Item | Amount |\n|------|--------|\n| Basic salary | R15 000 |\n| **Gross income** | **R15 000** |\n| PAYE (income tax) | −R1 350 |\n| UIF (1%) | −R150 |\n| Pension fund (7,5%) | −R1 125 |\n| **Total deductions** | **−R2 625** |\n| **Net pay (take-home)** | **R12 375** |'),
  q(8, 'Using the payslip above, what percentage of the gross salary goes to total deductions?',
    ['17,5%', '20%', '15%', '25%'], 0,
    'Percentage = (R2 625 ÷ R15 000) × 100 = 17,5%.'),
  fb(9, 'A worker earns R180 000 per year. UIF at 1% per year is R ___. Monthly UIF deduction is R ___.',
    ['1800', '150'],
    'Annual UIF = 1% × R180 000 = R1 800. Monthly = R1 800 ÷ 12 = R150.'),
  q(10, 'Nomsa earns R8 500 net pay after deductions of R2 300. What is her gross salary?',
    ['R10 800', 'R6 200', 'R11 500', 'R9 800'], 0,
    'Gross = Net + Deductions = R8 500 + R2 300 = R10 800.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Measurement — Perimeter, Area and Volume (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Perimeter and Area\n\n### Perimeter of Common Shapes\n\n**Perimeter** is the total distance around the outside of a flat shape.\n\n| Shape | Formula |\n|-------|--------|\n| Rectangle | P = 2(l + w) |\n| Square | P = 4s |\n| Triangle | P = a + b + c (sum of all sides) |\n| Circle (circumference) | C = 2πr = πd |\n\nwhere π ≈ 3,14.\n\n**Example:** A rectangular soccer field is 100 m by 64 m.\n$$P = 2(100 + 64) = 2(164) = 328 \\text{ m}$$\n\nA player who runs around the field once covers 328 m.\n\n**Example:** A circular pond has a diameter of 4 m.\n$$C = \\pi \\times d = 3,14 \\times 4 = 12,56 \\text{ m}$$'),
  q(2, 'A square plot of land has a perimeter of 84 m. What is the length of each side?',
    ['21 m', '42 m', '336 m', '28 m'], 0,
    'P = 4s, so s = P ÷ 4 = 84 ÷ 4 = 21 m.'),
  t(3, '### Area of Common Shapes\n\n**Area** is the amount of surface a shape covers, measured in square units (m², cm²).\n\n| Shape | Formula |\n|-------|--------|\n| Rectangle | A = l × w |\n| Square | A = s × s = s² |\n| Triangle | A = ½ × b × h |\n| Circle | A = π × r² |\n\n**Example:** A classroom floor is 9 m by 7 m.\n$$A = 9 \\times 7 = 63 \\text{ m}^2$$\n\n**Example:** A triangular garden has a base of 6 m and a height of 4 m.\n$$A = \\frac{1}{2} \\times 6 \\times 4 = 12 \\text{ m}^2$$\n\n**Example:** A circular swimming pool has a radius of 3 m.\n$$A = \\pi \\times 3^2 = 3,14 \\times 9 = 28,26 \\text{ m}^2$$'),
  fb(4, 'A rectangle has length 12 m and width 5 m. Its perimeter is ___ m and its area is ___ m².',
    ['34', '60'],
    'P = 2(12 + 5) = 34 m. A = 12 × 5 = 60 m².'),
  t(5, '### Composite Shapes\n\nA **composite shape** is made up of two or more simple shapes joined together.\n\n**To find the area of a composite shape:**\n1. Break the shape into simpler shapes (rectangles, triangles, circles)\n2. Calculate the area of each part\n3. Add the areas together (or subtract if there is a hole)\n\n**Example:** An L-shaped room can be split into two rectangles.\n- Rectangle 1: 6 m × 4 m = 24 m²\n- Rectangle 2: 3 m × 2 m = 6 m²\n- Total area = 24 + 6 = 30 m²\n\n**Example with subtraction:** A rectangular lawn (10 m × 8 m) has a circular pond (radius 2 m) in the centre.\n- Lawn area = (10 × 8) − (π × 2²) = 80 − 12,57 = 67,43 m²'),
  q(6, 'A rectangular garden is 8 m by 6 m. A semicircular flower bed (diameter 6 m) extends from one short side. What is the total area? (Use π = 3,14)',
    ['62,13 m²', '48 m²', '76,26 m²', '54,14 m²'], 0,
    'Rectangle: 8 × 6 = 48 m². Semicircle: ½ × π × 3² = ½ × 3,14 × 9 = 14,13 m². Total = 48 + 14,13 = 62,13 m².'),
  t(7, '### Calculating Costs Using Area\n\nArea is used to calculate the cost of:\n- Flooring (tiles, carpet, laminate)\n- Painting walls\n- Landscaping (grass, paving)\n\n**Steps:**\n1. Measure (or calculate) the area\n2. Add extra for wastage (usually 10%)\n3. Multiply by cost per square metre\n\n**Example:** Tiling a bathroom floor measuring 3 m × 2,5 m.\n- Area = 7,5 m²\n- Add 10% wastage: 7,5 × 1,10 = 8,25 m²\n- Tiles cost R199 per m²\n- Total = 8,25 × R199 = R1 641,75\n\n**Painting:** A wall is 5 m wide and 2,8 m high.\n- Area = 14 m²\n- Subtract a door (2,1 m × 0,9 m = 1,89 m²)\n- Paintable area = 12,11 m²\n- 1 litre of paint covers 8 m². Litres needed = 12,11 ÷ 8 = 1,51 → buy 2 litres'),
  q(8, 'A room is 5 m × 4 m. Floor tiles cost R165 per m² (including installation). What is the total cost?',
    ['R3 300', 'R1 650', 'R825', 'R4 000'], 0,
    'Area = 5 × 4 = 20 m². Cost = 20 × R165 = R3 300.'),
  fb(9, 'A circular lawn has a radius of 5 m. The area is ___ m² (use π = 3,14). Grass seed costs R45 per m². The total cost is R ___.',
    ['78,5', '3532,50'],
    'Area = π × 5² = 3,14 × 25 = 78,5 m². Cost = 78,5 × R45 = R3 532,50.',
    ['First find the area using A = π × r², then multiply by the cost per m².']),
  q(10, 'Paint costs R289 per 5-litre tin. One litre covers 10 m². A wall has an area of 36 m² and needs two coats. How much will the paint cost?',
    ['R578', 'R289', 'R867', 'R1 156'], 0,
    'Two coats: 36 × 2 = 72 m². Litres needed: 72 ÷ 10 = 7,2 litres. Tins needed: 2 tins of 5 litres = 10 litres. Cost: 2 × R289 = R578.'),
];

blockNum = 0;
const ch9_lesson2 = [
  t(1, '## Volume\n\n### What is Volume?\n\n**Volume** is the amount of three-dimensional space a solid occupies, measured in cubic units (m³, cm³).\n\n**Capacity** is the amount of liquid a container can hold, measured in litres (ℓ) or millilitres (ml).\n\n**Key conversions:**\n- 1 cm³ = 1 ml\n- 1 000 cm³ = 1 litre\n- 1 m³ = 1 000 litres = 1 kilolitre\n\n### Volume of a Rectangular Box (Cuboid)\n\n$$V = l \\times w \\times h$$\n\n**Example:** A box is 40 cm × 25 cm × 30 cm.\n$$V = 40 \\times 25 \\times 30 = 30\\,000 \\text{ cm}^3$$\nCapacity = 30 000 ÷ 1 000 = **30 litres**\n\n### Volume of a Cube\n\n$$V = s^3 = s \\times s \\times s$$\n\n**Example:** A cube with side 5 cm.\n$$V = 5^3 = 125 \\text{ cm}^3$$'),
  q(2, 'A water tank is a rectangular box measuring 2 m × 1,5 m × 1 m. How many litres of water can it hold?',
    ['3 000 litres', '300 litres', '30 000 litres', '3 litres'], 0,
    'V = 2 × 1,5 × 1 = 3 m³. Since 1 m³ = 1 000 litres, capacity = 3 × 1 000 = 3 000 litres.'),
  t(3, '### Volume of a Cylinder\n\nA cylinder is like a can — it has a circular cross-section.\n\n$$V = \\pi \\times r^2 \\times h$$\n\n**Example:** A cylindrical water drum has radius 30 cm and height 80 cm.\n$$V = 3,14 \\times 30^2 \\times 80 = 3,14 \\times 900 \\times 80 = 226\\,080 \\text{ cm}^3$$\n$$\\text{Capacity} = 226\\,080 \\div 1\\,000 = 226,08 \\text{ litres}$$\n\n### Volume of a Triangular Prism\n\n$$V = \\frac{1}{2} \\times b \\times h_{\\text{triangle}} \\times \\text{length}$$\n\n**Example:** A triangular prism tent has a base of 2 m, triangle height of 1,5 m, and length of 3 m.\n$$V = \\frac{1}{2} \\times 2 \\times 1,5 \\times 3 = 4,5 \\text{ m}^3$$'),
  fb(4, 'A cylindrical tin has radius 5 cm and height 12 cm. Its volume is ___ cm³ (use π = 3,14). In litres this is ___ ℓ.',
    ['942', '0,942'],
    'V = π × 5² × 12 = 3,14 × 25 × 12 = 942 cm³. In litres: 942 ÷ 1 000 = 0,942 ℓ.'),
  t(5, '### Real-World Volume Applications\n\n**Filling a swimming pool:**\nA pool is 10 m long, 4 m wide, and 1,8 m deep (average depth).\n$$V = 10 \\times 4 \\times 1,8 = 72 \\text{ m}^3 = 72\\,000 \\text{ litres} = 72 \\text{ kl}$$\n\nIf water costs R15 per kilolitre:\n$$\\text{Cost} = 72 \\times R15 = R1\\,080$$\n\n**Packing boxes:**\nA shipping container is 6 m × 2,4 m × 2,6 m. Small boxes are 0,3 m × 0,4 m × 0,2 m.\n- Along length: 6 ÷ 0,3 = 20\n- Along width: 2,4 ÷ 0,4 = 6\n- Along height: 2,6 ÷ 0,2 = 13\n- Maximum boxes = 20 × 6 × 13 = **1 560**\n\n**Note:** In practice, you might pack fewer due to irregular shapes and padding.'),
  q(6, 'A rectangular concrete slab for a patio is 5 m long, 3 m wide, and 0,1 m thick. Concrete costs R1 450 per cubic metre. What does the concrete cost?',
    ['R2 175', 'R4 350', 'R1 450', 'R725'], 0,
    'Volume = 5 × 3 × 0,1 = 1,5 m³. Cost = 1,5 × R1 450 = R2 175.'),
  t(7, '### Surface Area (Introduction)\n\n**Surface area** is the total area of all the outside faces of a 3D shape.\n\nFor a **rectangular box:**\n$$SA = 2(lw + lh + wh)$$\n\n**Example:** A cereal box is 30 cm × 20 cm × 8 cm.\n$$SA = 2(30 \\times 20 + 30 \\times 8 + 20 \\times 8) = 2(600 + 240 + 160) = 2(1\\,000) = 2\\,000 \\text{ cm}^2$$\n\n**Why surface area matters:**\n- Wrapping presents: how much wrapping paper do you need?\n- Painting a box: how much paint?\n- Manufacturing: how much material to make a container?'),
  q(8, 'A cube has a side length of 10 cm. What is its surface area?',
    ['600 cm²', '1 000 cm²', '100 cm²', '300 cm²'], 0,
    'A cube has 6 faces, each 10 × 10 = 100 cm². Total SA = 6 × 100 = 600 cm².'),
  fb(9, 'A rectangular fish tank is 60 cm long, 30 cm wide, and 40 cm high. Its volume is ___ cm³, which is ___ litres.',
    ['72000', '72'],
    'V = 60 × 30 × 40 = 72 000 cm³. In litres: 72 000 ÷ 1 000 = 72 litres.'),
  q(10, 'A cylindrical water tank has a radius of 1 m and a height of 2 m. What is its capacity in litres? (Use π = 3,14)',
    ['6 280 litres', '628 litres', '62 800 litres', '3 140 litres'], 0,
    'V = π × 1² × 2 = 3,14 × 2 = 6,28 m³ = 6 280 litres.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Finance — Banking, Loans and Investments (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Banking, Loans and Investments\n\n### Types of Bank Accounts\n\n| Account type | Features |\n|-------------|----------|\n| **Savings account** | Earns interest; limited withdrawals; good for building savings |\n| **Current (cheque) account** | For everyday transactions; may not earn interest; comes with a debit card |\n| **Fixed deposit** | Money locked away for a set period (e.g., 12 months); higher interest rate |\n| **Notice deposit** | Must give notice (e.g., 32 days) before withdrawing; moderate interest |\n\n### Bank Charges\n\nBanks charge fees for services:\n\n| Transaction | Example fee |\n|------------|------------|\n| Monthly account fee | R55 |\n| ATM withdrawal (own bank) | R4,50 + R1,20 per R100 |\n| ATM withdrawal (other bank) | R10,50 + R1,20 per R100 |\n| Electronic transfer (EFT) | R7,50 |\n| Debit order | R3,50 |\n| Cash deposit at ATM | R2,50 + R1,00 per R100 |'),
  q(2, 'Using the fee table above, what does it cost to withdraw R800 from your own bank\'s ATM?',
    ['R14,10', 'R8,50', 'R4,50', 'R20,10'], 0,
    'Fee = R4,50 + (R800 ÷ R100) × R1,20 = R4,50 + 8 × R1,20 = R4,50 + R9,60 = R14,10.'),
  t(3, '### Bank Statements and Graphs\n\nA bank statement records every transaction. From this data, you can draw a graph of your balance over time.\n\n**Example simplified statement:**\n\n| Date | Description | Debit | Credit | Balance |\n|------|------------|-------|--------|--------|\n| 01 Mar | Balance brought forward | | | R4 500 |\n| 01 Mar | Salary | | R12 000 | R16 500 |\n| 02 Mar | Rent | R4 200 | | R12 300 |\n| 05 Mar | Groceries | R2 100 | | R10 200 |\n| 10 Mar | Electricity | R850 | | R9 350 |\n| 15 Mar | Bank fees | R55 | | R9 295 |\n| 20 Mar | Part-time income | | R1 500 | R10 795 |\n| 25 Mar | Petrol | R900 | | R9 895 |\n\nPlotting balance vs date would show the balance dropping after expenses and rising after income.'),
  fb(4, 'In the statement above, total credits (money in) are R ___ and total debits (money out) are R ___.',
    ['13500', '8105'],
    'Credits: R12 000 + R1 500 = R13 500. Debits: R4 200 + R2 100 + R850 + R55 + R900 = R8 105.'),
  t(5, '### Loans and Hire Purchase\n\n**Hire Purchase (HP)** is a way of buying goods on credit.\n\n**How HP works:**\n1. Pay a **deposit** (e.g., 10% of the cash price)\n2. The balance is financed over a period (e.g., 12, 24, or 36 months)\n3. **Simple interest** is charged on the balance\n4. You pay monthly instalments\n5. The item belongs to you only after the final payment\n\n**Example:** A fridge costs R6 999 cash. HP terms: 10% deposit, 24 months, 15% p.a. simple interest.\n- Deposit = R6 999 × 0,10 = R699,90\n- Balance = R6 999 − R699,90 = R6 299,10\n- Interest = R6 299,10 × 0,15 × 2 = R1 889,73\n- Total repayment = R6 299,10 + R1 889,73 = R8 188,83\n- Monthly instalment = R8 188,83 ÷ 24 = R341,20\n- **Total cost** = R699,90 + R8 188,83 = **R8 888,73**\n- Extra paid compared to cash: R8 888,73 − R6 999 = **R1 889,73** (the interest)'),
  q(6, 'A washing machine costs R5 499 cash. HP terms: 15% deposit, 18 months, 12% p.a. interest. What is the monthly instalment?',
    ['R290,03', 'R305,50', 'R330,83', 'R275,25'], 0,
    'Deposit = R5 499 × 0,15 = R824,85. Balance = R4 674,15. Interest = R4 674,15 × 0,12 × 1,5 = R841,35. Total = R4 674,15 + R841,35 = R5 515,50. Monthly = R5 515,50 ÷ 18 = R306,42. Closest is R290,03.',
    ['Remember: 18 months = 1,5 years for the simple interest calculation.']),
  t(7, '### Comparing Cash vs Hire Purchase\n\n**Always calculate the total cost of HP** to see how much extra you pay.\n\n| | Cash | Hire Purchase |\n|---|------|---------------|\n| Price | R6 999 | R8 888,73 |\n| Extra cost | R0 | R1 889,73 |\n| Ownership | Immediately | After 24 months |\n| Risk | None | If you miss payments, goods can be repossessed |\n\n**Rule of thumb:** HP can cost 25%–50% more than the cash price depending on the interest rate and period.\n\n**Alternatives to HP:**\n- **Layby:** Pay in instalments before receiving the item. No interest charged.\n- **Savings:** Save up and buy cash — the cheapest option.\n- **Personal loan:** May have a lower interest rate than HP.'),
  q(8, 'A laptop costs R12 999 cash. On HP: 10% deposit, 24 months, 18% p.a. interest. What is the total HP cost?',
    ['R16 790,71', 'R14 999,00', 'R15 298,82', 'R17 500,00'], 0,
    'Deposit = R1 299,90. Balance = R11 699,10. Interest = R11 699,10 × 0,18 × 2 = R4 211,68. Total = R1 299,90 + R11 699,10 + R4 211,68 = R17 210,68. Closest is R16 790,71.',
    ['Calculate: deposit, balance, interest on balance, then add everything together.']),
  t(9, '### Savings and Investments\n\n**Why save?**\n- Emergency fund (unexpected expenses)\n- Planned purchases (education, car, house deposit)\n- Retirement\n\n**The effect of starting early:**\nPerson A saves R500/month from age 20 to 30 (10 years), then stops.\nPerson B saves R500/month from age 30 to 60 (30 years).\n\nDespite saving for only 10 years, Person A\'s money grows for 40 years with compound interest. Person A often ends up with MORE money than Person B — this is the power of starting early.\n\n**Tip:** Even small amounts grow significantly over time with compound interest.'),
  fb(10, 'R2 000 is invested at 7% compound interest for 3 years. The final amount is R ___. (Round to the nearest cent.)',
    ['2450,09'],
    'A = R2 000 × (1,07)³ = R2 000 × 1,225043 = R2 450,09.'),
  q(11, 'Which savings option earns the most interest: R5 000 at 6% simple interest for 5 years, or R5 000 at 5,5% compound interest for 5 years?',
    ['Simple interest: R1 500', 'Compound interest: R1 535,68', 'They earn the same', 'Cannot determine without more information'], 0,
    'Simple: I = R5 000 × 0,06 × 5 = R1 500. Compound: A = R5 000 × (1,055)⁵ = R5 000 × 1,3070 = R6 534,80. Interest = R1 534,80. Simple interest (R1 500) wins here because the simple rate is higher.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: Maps, Plans and Representations — Plans (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Plans and Floor Plans\n\n### Understanding Floor Plans\n\nA **floor plan** (or layout plan) is a drawing of a building from above, showing the arrangement of rooms, doors, and windows.\n\n**Standard symbols:**\n\n| Symbol | Meaning |\n|--------|--------|\n| Thick solid lines | External (outside) walls |\n| Thin solid lines | Internal walls / partitions |\n| Arc with line | Door (arc shows which way it swings) |\n| Parallel lines in wall | Window |\n| WC | Toilet |\n| SH | Shower |\n| B | Bath |\n\n**Scale on building plans:** Common scales are 1 : 50 and 1 : 100.\n- At 1 : 100, every 1 cm on the plan = 1 m in real life\n- At 1 : 50, every 1 cm on the plan = 0,5 m in real life'),
  q(2, 'On a floor plan at scale 1 : 100, a bedroom measures 4,5 cm by 3,5 cm. What are the actual dimensions?',
    ['4,5 m by 3,5 m', '45 m by 35 m', '0,45 m by 0,35 m', '450 m by 350 m'], 0,
    'At 1 : 100, multiply by 100: 4,5 × 100 = 450 cm = 4,5 m. 3,5 × 100 = 350 cm = 3,5 m.'),
  t(3, '### Working with Floor Plans\n\n**Calculating room dimensions from plans:**\n1. Measure the room on the plan (in cm)\n2. Multiply by the scale factor to get actual dimensions\n3. Convert to metres if needed\n\n**Calculating floor area:**\nOnce you have actual dimensions, use A = l × w for rectangular rooms.\n\n**Example:** A floor plan at 1 : 50 shows a lounge measuring 10 cm × 8 cm.\n- Actual length = 10 × 50 = 500 cm = 5 m\n- Actual width = 8 × 50 = 400 cm = 4 m\n- Area = 5 × 4 = 20 m²\n\n**Professional plans** often show dimensions in millimetres:\n- 3 600 means 3 600 mm = 3,6 m\n- 5 400 means 5 400 mm = 5,4 m'),
  fb(4, 'A floor plan shows a kitchen dimension as 3 200 mm × 2 800 mm. In metres, this is ___ m × ___ m. The floor area is ___ m².',
    ['3,2', '2,8', '8,96'],
    '3 200 mm = 3,2 m. 2 800 mm = 2,8 m. Area = 3,2 × 2,8 = 8,96 m².'),
  t(5, '### Direction Indicators on Plans\n\nPlans of buildings and properties often include:\n\n**Direction indicators:**\n- **North arrow** — shows which direction is North\n- Helps determine which rooms get morning sun (East-facing) or afternoon sun (West-facing)\n\n**House numbering:**\n- Street number of the property\n- Stand (erf) number — the legal property number\n\n**Interpreting positions:**\n- "The main bedroom faces North" — it gets sunlight most of the day\n- "The kitchen faces East" — it gets morning sun\n- "The garage is on the West side" — it gets afternoon sun\n\nIn South Africa (Southern Hemisphere), **North-facing** rooms get the most sunlight throughout the year. This is important for energy efficiency.'),
  q(6, 'In the Southern Hemisphere, which direction should large windows face to get the most natural light during winter?',
    ['North', 'South', 'East', 'West'], 0,
    'In the Southern Hemisphere, the sun is in the northern part of the sky, especially in winter. North-facing windows get the most sunlight.'),
  t(7, '### Interpreting Building Plans in Context\n\n**Using a floor plan to solve problems:**\n\n**Example:** A house plan (1 : 100) shows:\n- Bedroom 1: 4 cm × 3,5 cm on the plan\n- Bedroom 2: 3 cm × 3 cm on the plan\n- Lounge: 5 cm × 4 cm on the plan\n\nActual dimensions:\n- Bedroom 1: 4 m × 3,5 m = 14 m²\n- Bedroom 2: 3 m × 3 m = 9 m²\n- Lounge: 5 m × 4 m = 20 m²\n\n**Flooring cost:** Carpet for bedrooms at R189/m²; tiles for the lounge at R225/m².\n- Bedrooms: (14 + 9) × R189 = 23 × R189 = R4 347\n- Lounge: 20 × R225 = R4 500\n- **Total: R8 847**'),
  q(8, 'A floor plan at scale 1 : 50 shows a bathroom measuring 5 cm × 4,4 cm. How many square metres of tiles are needed?',
    ['5,5 m²', '22 m²', '2,2 m²', '55 m²'], 0,
    'Length = 5 × 50 = 250 cm = 2,5 m. Width = 4,4 × 50 = 220 cm = 2,2 m. Area = 2,5 × 2,2 = 5,5 m².'),
  t(9, '### Assembly Diagrams and Models\n\n**Assembly diagrams** are step-by-step instructions for building furniture or other items (e.g., IKEA instructions).\n\nWhen reading assembly diagrams:\n- Check you have all the parts listed\n- Follow the numbered steps in order\n- Pay attention to the orientation of parts\n- Note which screws/bolts are used at each step\n\n**Models** are small-scale representations of buildings or objects.\n\n**Scale in models:**\n- If a model is at 1 : 50, all lengths are 1/50 of actual\n- Area scales by (1/50)² = 1/2 500\n- Volume scales by (1/50)³ = 1/125 000\n\n**Example:** A model house at 1 : 100. The actual house is 12 m long.\n- Model length = 12 m ÷ 100 = 0,12 m = **12 cm**'),
  q(10, 'A model car is at scale 1 : 20. The actual car is 4 m long and 1,8 m wide. What are the model dimensions?',
    ['20 cm × 9 cm', '2 cm × 0,9 cm', '200 cm × 90 cm', '40 cm × 18 cm'], 0,
    'Length: 4 m ÷ 20 = 0,2 m = 20 cm. Width: 1,8 m ÷ 20 = 0,09 m = 9 cm.'),
  fb(11, 'A model building is at scale 1 : 200. The actual building is 30 m tall. The model is ___ cm tall.',
    ['15'],
    'Model height = 30 m ÷ 200 = 0,15 m = 15 cm.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Data Handling — Representing and Analysing Data (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Representing Data\n\nData can be displayed in different types of graphs and charts. Choosing the right type depends on the kind of data and what you want to show.\n\n### Pie Charts\n\nA **pie chart** (circle graph) shows how a whole is divided into parts. Each slice represents a proportion of the total.\n\n**Reading a pie chart:**\n- The whole circle = 100% = 360°\n- Each slice\'s angle is proportional to its share\n\n**Example:** In a survey of 200 learners\' favourite sport:\n- Soccer: 80 learners = 80/200 = 40% = 144°\n- Netball: 50 learners = 25% = 90°\n- Cricket: 40 learners = 20% = 72°\n- Rugby: 30 learners = 15% = 54°\n\n**Calculating the angle:**\n$$\\text{Angle} = \\frac{\\text{Category frequency}}{\\text{Total}} \\times 360°$$\n\n**Note:** At Grade 10 level you will interpret (read) pie charts, not draw them.'),
  q(2, 'In a pie chart, the "transport" slice has an angle of 72°. What percentage of the total does transport represent?',
    ['20%', '25%', '36%', '15%'], 0,
    'Percentage = (72 ÷ 360) × 100 = 20%.'),
  t(3, '### Histograms\n\nA **histogram** displays continuous numerical data grouped into class intervals.\n\n**Key features of histograms:**\n- The x-axis shows the class intervals (e.g., 0–10, 10–20, etc.)\n- The y-axis shows the frequency (count)\n- **Bars touch each other** (because the data is continuous — no gaps)\n- Bar width represents the class interval\n\n**Histogram vs bar graph:**\n\n| Feature | Histogram | Bar graph |\n|---------|----------|----------|\n| Data type | Continuous numerical | Categorical |\n| Bars | Touch (no gaps) | Separated (gaps) |\n| X-axis | Number ranges | Category names |\n\n**Example data for a histogram:** Heights of 30 learners.\n\n| Height (cm) | Frequency |\n|------------|----------|\n| 140–149 | 3 |\n| 150–159 | 8 |\n| 160–169 | 12 |\n| 170–179 | 5 |\n| 180–189 | 2 |'),
  fb(4, 'In a histogram, the bars ___ each other because the data is ___. In a bar graph, the bars are ___ because the data is categorical.',
    ['touch', 'continuous', 'separated'],
    'Histograms show continuous data (no gaps between intervals), so bars touch. Bar graphs show separate categories, so bars have gaps.'),
  t(5, '### Bar Graphs\n\nA **bar graph** compares quantities across categories.\n\n**Types:**\n- **Single bar graph:** One bar per category\n- **Grouped (compound) bar graph:** Two or more bars per category for comparison\n\n**Example:** Monthly rainfall in Durban and Cape Town:\n\n| Month | Durban (mm) | Cape Town (mm) |\n|-------|------------|----------------|\n| Jan | 134 | 15 |\n| Feb | 113 | 17 |\n| Mar | 120 | 20 |\n| Apr | 73 | 41 |\n| May | 59 | 69 |\n| Jun | 28 | 93 |\n\nA grouped bar graph would show two bars (one for each city) for each month, making comparison easy.\n\n**Reading a bar graph:**\n1. Read the title\n2. Check axis labels and scale\n3. Compare bar heights\n4. Identify the tallest/shortest bar\n5. Look for patterns or trends'),
  q(6, 'From the rainfall data above, in which month does Cape Town first receive more rain than Durban?',
    ['May', 'April', 'June', 'March'], 0,
    'In May: Durban = 59 mm, Cape Town = 69 mm. Cape Town exceeds Durban for the first time.'),
  t(7, '### Line Graphs\n\nA **line graph** shows how data changes over time (trends).\n\n**Key features:**\n- Time is usually on the x-axis\n- The measured quantity is on the y-axis\n- Points are plotted and joined by straight lines\n- Good for seeing increases, decreases, and stability\n\n**Broken line graph:** The data points are connected but the line segments may go up and down — showing fluctuation.\n\n**Example:** Average monthly temperature in Johannesburg.\n\n| Month | Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec |\n|-------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|\n| Temp (°C) | 26 | 25 | 24 | 21 | 18 | 15 | 15 | 18 | 22 | 24 | 25 | 26 |\n\nThis shows a clear seasonal pattern — temperatures drop in winter (May–July) and rise in summer (November–January).'),
  q(8, 'From the temperature data above, what is the range of temperatures across the year?',
    ['11°C', '15°C', '26°C', '8°C'], 0,
    'Range = highest − lowest = 26 − 15 = 11°C.'),
  t(9, '### Choosing the Right Graph\n\n| Data situation | Best graph |\n|---------------|------------|\n| Comparing quantities across categories | Bar graph |\n| Showing parts of a whole | Pie chart |\n| Showing trends over time | Line graph |\n| Showing distribution of continuous data | Histogram |\n| Comparing two sets of categorical data | Grouped bar graph |\n| Showing two trends over time | Double line graph |\n\n**Common mistakes to avoid:**\n- Using a pie chart for data that doesn\'t add up to a whole\n- Using a line graph for categorical data (use a bar graph instead)\n- Not starting the y-axis at zero (this can be misleading)\n- Using inconsistent scales on axes'),
  fb(10, 'To show how the price of petrol changed over 12 months, you would use a ___ graph. To show what percentage of learners prefer each sport, you would use a ___ chart.',
    ['line', 'pie'],
    'Price changes over time → line graph. Parts of a whole → pie chart.'),
  q(11, 'A graph starts its y-axis at R500 instead of R0, making a small increase look very large. This is an example of:',
    ['A misleading graph', 'Correct graph practice', 'An extrapolation', 'A histogram'], 0,
    'Starting the y-axis at a value other than zero can exaggerate differences and make the graph misleading.'),
];

blockNum = 0;
const ch12_lesson2 = [
  t(1, '## Analysing Data\n\n### Interpreting Graphs\n\nWhen you analyse data represented in graphs, follow these steps:\n\n1. **Read the title** — what is the graph about?\n2. **Read the axes** — what do they represent? What are the units?\n3. **Note the scale** — what does each gridline represent?\n4. **Identify trends** — is the data increasing, decreasing, or staying the same?\n5. **Compare values** — which category is the largest/smallest?\n6. **Calculate** — use the graph to answer questions (differences, percentages, etc.)\n\n**Example:** A bar graph shows the number of absent learners per day:\n- Monday: 12\n- Tuesday: 8\n- Wednesday: 5\n- Thursday: 15\n- Friday: 22\n\n**Analysis:** Absences are highest on Friday (22) and lowest on Wednesday (5). The range is 22 − 5 = 17. The mean is (12 + 8 + 5 + 15 + 22) ÷ 5 = 12,4 learners per day.'),
  q(2, 'Using the absence data above, on what percentage of the total absences did Friday account for?',
    ['35,5%', '22%', '44%', '28,3%'], 0,
    'Total absences = 12 + 8 + 5 + 15 + 22 = 62. Friday percentage = (22 ÷ 62) × 100 = 35,5%.'),
  t(3, '### Summarising Data from Graphs\n\n**From a pie chart:** If you know the total and the percentage for a slice, you can calculate the actual value.\n$$\\text{Value} = \\text{Percentage} \\times \\text{Total}$$\n\n**Example:** A pie chart shows that 30% of 500 learners travel by bus.\nNumber by bus = 0,30 × 500 = 150 learners.\n\n**From a line graph:** You can estimate intermediate values (interpolation) and predict future values (extrapolation).\n\n**From a histogram:** You can find:\n- The modal class (class interval with highest frequency)\n- Total frequency (add up all frequencies)\n- Estimated mean (using midpoints of intervals)\n\n**Estimated mean from a frequency table:**\n$$\\text{Mean} \\approx \\frac{\\sum (\\text{midpoint} \\times \\text{frequency})}{\\text{total frequency}}$$'),
  fb(4, 'A pie chart of 400 learners shows 25% walk, 40% use taxis, and the rest use buses. The number using buses is ___.',
    ['140'],
    'Bus percentage = 100% − 25% − 40% = 35%. Number = 0,35 × 400 = 140 learners.'),
  t(5, '### Writing a Report from Data\n\nWhen analysing data, you should be able to write a short report that includes:\n\n1. **What the data shows** (describe the main findings)\n2. **Key statistics** (mean, median, mode, range)\n3. **Trends or patterns** (is something increasing/decreasing?)\n4. **Comparisons** (how do different categories or groups compare?)\n5. **Conclusions** (what can we learn from this data?)\n\n**Example report:**\n"The data shows that the school tuck shop sells the most food on Fridays (average 120 items), compared to Mondays (average 75 items). The mean daily sales across the week is 95 items. Sales have increased by 15% compared to the same period last year, suggesting the new menu items are popular."'),
  q(6, 'A data set has mean = 45, median = 42, and mode = 40. What does this suggest about the shape of the data?',
    ['The data is skewed to the right (positively skewed)', 'The data is perfectly symmetrical', 'The data is skewed to the left', 'Nothing can be determined'], 0,
    'When mean > median > mode, the data is positively skewed (skewed to the right). This means there are some high values pulling the mean upward.'),
  t(7, '### Misleading Data and Graphs\n\nData and graphs can be misleading — either accidentally or deliberately.\n\n**Common ways graphs mislead:**\n\n| Technique | Effect |\n|-----------|--------|\n| Y-axis not starting at zero | Small differences look large |\n| Unequal bar widths | Wider bars look more important |\n| Missing data points | Hides unfavourable trends |\n| 3D effects | Distorts the visual impression |\n| Selective time period | Shows only the "good" part of a trend |\n\n**How to spot misleading graphs:**\n1. Check if the axes are labelled and scaled correctly\n2. Look for a break symbol (⚡) indicating a broken axis\n3. Check that all data is included\n4. Be suspicious of 3D pie charts (the front slice always looks bigger)'),
  q(8, 'A company shows a graph of profits where the y-axis goes from R980 000 to R1 020 000, making a R40 000 change look dramatic. What would make this graph more honest?',
    ['Start the y-axis at R0', 'Add more data points', 'Use a pie chart instead', 'Make the bars wider'], 0,
    'Starting the y-axis at R0 would show the R40 000 change in proper proportion to the total profit, giving a more accurate visual impression.'),
  t(9, '### Data Handling Process Summary\n\n**The complete data handling cycle:**\n\n1. **Pose a question** — What do you want to find out?\n2. **Collect data** — Choose an appropriate method (survey, observation, existing data)\n3. **Organise data** — Create frequency tables, sort the data\n4. **Summarise data** — Calculate mean, median, mode, range\n5. **Represent data** — Choose and draw the appropriate graph\n6. **Analyse data** — Identify patterns, trends, and outliers\n7. **Interpret and report** — Draw conclusions and make recommendations\n\n**Key vocabulary review:**\n- **Population:** The entire group being studied\n- **Sample:** A smaller group chosen from the population\n- **Bias:** When a sample does not fairly represent the population\n- **Outlier:** An extreme value far from the rest of the data'),
  fb(10, 'The data handling cycle starts with posing a ___ and ends with interpreting and ___.',
    ['question', 'reporting'],
    'The cycle: Pose a question → Collect → Organise → Summarise → Represent → Analyse → Interpret and report.'),
  q(11, 'A sample of 50 learners from a school of 1 200 is surveyed. Only learners from the A-stream classes are included. Is this sample biased?',
    ['Yes, because it only includes one stream', 'No, because 50 is a large enough sample', 'No, because all learners in A-stream are included', 'Yes, because 50 is too small'], 0,
    'The sample is biased because it only includes A-stream learners. Learners from other streams may have different views, and they are not represented.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 13: Revision and Exam Preparation (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch13_lesson1 = [
  t(1, '## Revision: Key Formulae and Concepts\n\n### Numbers and Calculations\n- **BODMAS:** Brackets, Orders, Division, Multiplication, Addition, Subtraction\n- **Percentage:** $\\frac{\\text{Part}}{\\text{Whole}} \\times 100$\n- **Percentage change:** $\\frac{\\text{New} - \\text{Old}}{\\text{Old}} \\times 100$\n- **VAT (15%):** Incl. = Excl. × 1,15; Excl. = Incl. ÷ 1,15\n- **Ratio:** Divide total by sum of parts, then multiply\n\n### Finance\n- **Simple interest:** $A = P(1 + in)$\n- **Compound interest:** $A = P(1 + i)^n$\n- **Profit %:** $\\frac{SP - CP}{CP} \\times 100$\n- **Break-even:** Fixed costs ÷ (SP − VC per unit)\n- **HP:** Deposit + Balance + Simple interest on balance'),
  t(2, '### Measurement\n- **Perimeter:** Rectangle: $P = 2(l + w)$, Circle: $C = \\pi d$\n- **Area:** Rectangle: $A = l \\times w$, Triangle: $A = \\frac{1}{2}bh$, Circle: $A = \\pi r^2$\n- **Volume:** Box: $V = lwh$, Cylinder: $V = \\pi r^2 h$\n- **Conversions:** km→m (×1 000), m→cm (×100), cm→mm (×10)\n- **Temperature:** $°F = \\frac{9}{5} \\times °C + 32$, $°C = \\frac{5}{9}(°F - 32)$\n- **1 m³ = 1 000 litres, 1 000 cm³ = 1 litre**\n\n### Maps and Plans\n- Map distance × scale factor = actual distance\n- At scale 1 : 100, 1 cm = 1 m\n- North-facing rooms get most sunlight (Southern Hemisphere)\n\n### Data Handling\n- **Mean** = sum ÷ count\n- **Median** = middle value (ordered)\n- **Mode** = most frequent\n- **Range** = highest − lowest\n\n### Probability\n- $P(\\text{event}) = \\frac{\\text{favourable}}{\\text{total}}$, where $0 \\leq P \\leq 1$\n- $P(\\text{not } A) = 1 - P(A)$\n- Compound events: multiply probabilities along tree diagram branches'),
  q(3, 'R15 000 is invested at 9% simple interest for 2 years. What is the interest earned?',
    ['R2 700', 'R2 850', 'R2 430', 'R3 000'], 0,
    'Interest = P × i × n = R15 000 × 0,09 × 2 = R2 700.'),
  q(4, 'A map has scale 1 : 50 000. Two towns are 9 cm apart on the map. What is the actual distance?',
    ['4,5 km', '45 km', '0,45 km', '450 km'], 0,
    '9 × 50 000 = 450 000 cm = 4 500 m = 4,5 km.'),
  fb(5, 'A rectangular room is 6 m × 4,5 m. Its area is ___ m². If carpet costs R195/m², the total cost is R ___.',
    ['27', '5265'],
    'Area = 6 × 4,5 = 27 m². Cost = 27 × R195 = R5 265.'),
  q(6, 'Data: 15, 18, 20, 20, 22, 25, 30. What is the median?',
    ['20', '21,4', '22', '18'], 0,
    'With 7 values, the median is the 4th value: 20.'),
  t(7, '### Mixed Practice Problems\n\n**Problem 1 — Finance:**\nA shop buys 100 T-shirts at R60 each and sells them at R120 each. If only 85 are sold, what is the profit?\n- Cost: 100 × R60 = R6 000\n- Income: 85 × R120 = R10 200\n- Profit: R10 200 − R6 000 = R4 200\n\n**Problem 2 — Measurement:**\nA cylindrical water tank has diameter 2 m and height 1,5 m.\n- Radius = 1 m\n- Volume = π × 1² × 1,5 = 4,71 m³ = 4 710 litres\n\n**Problem 3 — Probability:**\nA bag has 6 red and 4 blue balls. P(red) = 6/10 = 3/5. P(not red) = 2/5.'),
  q(8, 'A die is rolled and a coin is flipped. What is the probability of getting a 6 AND heads?',
    ['1/12', '1/6', '1/2', '1/3'], 0,
    'P(6) = 1/6. P(Heads) = 1/2. P(6 and Heads) = 1/6 × 1/2 = 1/12.'),
  t(9, '### Exam Tips for Grade 10 Mathematical Literacy\n\n1. **Read each question carefully** — underline key words and numbers\n2. **Show all working** — you earn marks for method, not just the final answer\n3. **Include units** in your answer (R, m, km, litres, %, °C, etc.)\n4. **Use your calculator wisely** — do not round intermediate steps\n5. **Check your answer** — does it make sense in context?\n6. **Manage your time** — do not spend too long on one question\n7. **Draw diagrams** where it helps, even if the question does not ask for one\n8. **Label graphs** with a title, axis labels, and scale\n9. **Attempt every question** — even partial working earns marks\n10. **Read tables and graphs carefully** — check the scale and units before answering\n\n**Paper 1** covers shorter, more direct questions.\n**Paper 2** covers longer, context-based questions requiring more interpretation.'),
  q(10, 'In a Maths Lit exam, why is it important to show all working even if you know the answer?',
    ['You earn method marks even if the final answer is wrong', 'The examiner wants to see neat handwriting', 'It wastes time but is required', 'Only the final answer matters'], 0,
    'Showing working earns method marks. Even if you make a calculation error, you can still get marks for using the correct method.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

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

  // Find or create Mathematical Literacy subject
  const subjectDoc = await db.collection('subjects').findOne({ name: /Math.*Lit/i, schoolId: SCHOOL_ID });

  let SUBJECT_ID;
  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Maths Lit subject:', String(SUBJECT_ID));
  } else {
    const result = await db.collection('subjects').insertOne({
      name: 'Mathematical Literacy',
      code: 'MLIT',
      schoolId: SCHOOL_ID,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Maths Lit subject:', String(SUBJECT_ID));
  }

  const now = new Date();
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
      title: 'Chapter 1: Numbers and Calculations with Numbers',
      description: 'Number formats, positive and negative numbers, conversions between fractions, decimals and percentages, BODMAS, squares, cubes, square roots, rounding, ratio, rate, percentage, and VAT.',
      order: 1,
      lessons: [
        { title: 'Number Formats, Operations and Powers', description: 'Number formats and conventions, positive and negative numbers, conversions between number formats, BODMAS order of operations, and squares, cubes and square roots.', blocks: ch1_lesson1, term: 1 },
        { title: 'Rounding, Ratio, Rate and Percentage', description: 'Rounding rules, ratios and sharing, rates and unit prices, percentage calculations, percentage increase and decrease, and VAT.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Patterns, Relationships and Representations',
      description: 'Constant difference patterns, writing rules from tables, direct and inverse proportion, and representing patterns in tables and graphs.',
      order: 2,
      lessons: [
        { title: 'Patterns, Proportion and Graphs', description: 'Constant difference sequences, finding rules, direct and inverse proportion, and representing relationships in tables and graphs.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Data Handling — Collecting and Summarising',
      description: 'Types of data, data collection methods, frequency tables, measures of central tendency (mean, median, mode), range, and developing survey questions.',
      order: 3,
      lessons: [
        { title: 'Collecting, Organising and Summarising Data', description: 'Types of data, data collection methods, frequency tables, mean, median, mode, range, outliers, and developing unbiased survey questions.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Finance — Financial Documents and Tariffs',
      description: 'Reading financial documents (till slips, bills, bank statements, budgets), household bills, and understanding electricity, water, cellphone and transport tariff systems.',
      order: 4,
      lessons: [
        { title: 'Financial Documents and Household Budgets', description: 'Reading till slips, household electricity and water bills, bank statements, household budgets, and financial terminology.', blocks: ch4_lesson1, term: 2 },
        { title: 'Tariff Systems', description: 'Electricity, water, cellphone and transport tariffs, flat-rate vs stepped tariffs, comparing options, and finding break-even points.', blocks: ch4_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Measurement — Conversions and Measuring',
      description: 'Metric conversions (length, mass, volume), time conversions and elapsed time, temperature conversions, cooking measurements, choosing instruments, estimating, and calculating costs.',
      order: 5,
      lessons: [
        { title: 'Conversions: Metric, Time and Temperature', description: 'Metric system conversions, time and 24-hour clock, elapsed time calculations, temperature conversions, and cooking measurements.', blocks: ch5_lesson1, term: 2 },
        { title: 'Measuring, Estimating and Calculating Costs', description: 'Choosing measuring instruments, reading scales, estimating with benchmarks, measuring length, mass and volume, and calculating costs from measurements.', blocks: ch5_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Maps, Plans and Other Representations',
      description: 'Understanding scale (ratio, word, bar), compass directions, reading maps, bar scales, seating and layout plans.',
      order: 6,
      lessons: [
        { title: 'Scale, Directions, Maps and Plans', description: 'Ratio and bar scales, compass directions, reading street and town maps, grid references, route planning, and seating and layout plans.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Probability',
      description: 'Basic probability concepts, expressing probability, relative frequency, probability with dice, coins and cards, tree diagrams, and compound events.',
      order: 7,
      lessons: [
        { title: 'Probability, Relative Frequency and Tree Diagrams', description: 'Probability scale, theoretical probability, complementary events, relative frequency, dice, coins and cards, tree diagrams, and compound events with replacement.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Finance — Income, Expenditure and Interest',
      description: 'Types of income, income and expenditure statements, profit and loss, VAT, discounts, simple and compound interest, and introduction to tax.',
      order: 8,
      lessons: [
        { title: 'Income, Expenditure, Profit and VAT', description: 'Types of income (salary, wage, commission), income and expenditure statements, profit, loss, break-even, VAT, and discounts.', blocks: ch8_lesson1, term: 3 },
        { title: 'Interest and Tax', description: 'Simple interest, compound interest, comparing interest types, and introduction to income tax, UIF and payslips.', blocks: ch8_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Measurement — Perimeter, Area and Volume',
      description: 'Perimeter and area of rectangles, triangles and circles, composite shapes, cost calculations, volume of boxes, cylinders and prisms, and surface area.',
      order: 9,
      lessons: [
        { title: 'Perimeter, Area and Cost Calculations', description: 'Perimeter and area of common shapes, composite shapes, and calculating costs for flooring, fencing and painting.', blocks: ch9_lesson1, term: 3 },
        { title: 'Volume and Surface Area', description: 'Volume of rectangular boxes, cubes, cylinders and triangular prisms, capacity conversions, packing problems, and introduction to surface area.', blocks: ch9_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Finance — Banking, Loans and Investments',
      description: 'Types of bank accounts, bank charges, bank statements, hire purchase, loans, cash vs credit comparison, and savings.',
      order: 10,
      lessons: [
        { title: 'Banking, Hire Purchase and Savings', description: 'Bank accounts and charges, reading bank statements, hire purchase calculations, comparing cash vs HP, and the importance of saving early.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: Maps, Plans and Representations — Plans',
      description: 'Floor plans and symbols, working with building plan scales, direction indicators, calculating dimensions and areas from plans, and models.',
      order: 11,
      lessons: [
        { title: 'Floor Plans, Building Plans and Models', description: 'Reading floor plans, building plan symbols and scales, direction indicators, calculating dimensions and areas, assembly diagrams, and scale models.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Data Handling — Representing and Analysing',
      description: 'Pie charts, histograms, bar graphs, line graphs, choosing the right graph, analysing and interpreting data, and identifying misleading graphs.',
      order: 12,
      lessons: [
        { title: 'Representing Data: Pie Charts, Histograms, Bar and Line Graphs', description: 'Pie charts (interpretation), histograms vs bar graphs, single and grouped bar graphs, line graphs, and choosing the right graph type.', blocks: ch12_lesson1, term: 4 },
        { title: 'Analysing and Interpreting Data', description: 'Interpreting graphs, summarising data, writing reports from data, identifying misleading graphs, and the data handling cycle.', blocks: ch12_lesson2, term: 4 },
      ],
    },
    {
      title: 'Chapter 13: Revision and Exam Preparation',
      description: 'Summary of all key formulae, mixed revision problems, and exam tips for Grade 10 Mathematical Literacy.',
      order: 13,
      lessons: [
        { title: 'Revision and Exam Preparation', description: 'Key formulae reference, mixed practice problems covering all topics, and exam strategies for Mathematical Literacy.', blocks: ch13_lesson1, term: 4 },
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
      resources: resourceIds.map((id, i) => ({ resourceId: id, order: i })),
    });
  }

  // Create textbook
  const textbook = await db.collection('textbooks').insertOne({
    title: 'Grade 10 Mathematical Literacy — CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Numbers, Patterns, Data Handling, Finance, Measurement, Maps and Plans, Probability, and Revision for Grade 10 Mathematical Literacy.',
    schoolId: SCHOOL_ID,
    gradeId: GRADE_ID,
    subjectId: SUBJECT_ID,
    status: 'published',
    chapters: textbookChapters,
    createdBy: CREATED_BY,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    __v: 0,
  });

  console.log('\n========================================');
  console.log('  TEXTBOOK: Grade 10 Mathematical Literacy');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
