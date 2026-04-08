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
// CHAPTER 1: Whole Numbers (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Properties and Operations with Whole Numbers ---
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Whole Numbers\n\nWhole numbers are the set $\\{0, 1, 2, 3, 4, 5, \\ldots\\}$. They go on forever — there is no largest whole number.\n\nIn Grade 7 we revise and extend what we learned about whole numbers in primary school.\n\n### Ordering and Comparing Whole Numbers\n\nWe use the symbols $<$ (less than), $>$ (greater than), and $=$ (equals) to compare numbers.\n\n**Example:** Arrange in ascending order: $45\\,012$; $45\\,102$; $44\\,999$; $45\\,021$.\n\nCompare digit by digit from left to right:\n$$44\\,999 < 45\\,012 < 45\\,021 < 45\\,102$$\n\n### Properties of Operations\n\n| Property | Addition | Multiplication |\n|----------|----------|----------------|\n| Commutative | $a + b = b + a$ | $a \\times b = b \\times a$ |\n| Associative | $(a + b) + c = a + (b + c)$ | $(a \\times b) \\times c = a \\times (b \\times c)$ |\n| Distributive | $a(b + c) = ab + ac$ | |\n| Identity | $a + 0 = a$ | $a \\times 1 = a$ |\n\nThe number $0$ is the **additive identity** and $1$ is the **multiplicative identity**.\n\n**Division by zero is undefined.** We can never divide any number by $0$.'),
  t(2, '### Calculation Techniques\n\nGood mathematicians use **strategies** to make calculations easier.\n\n**Long division:**\n$1\\,344 \\div 32$\n- $32 \\times 40 = 1\\,280$\n- $1\\,344 - 1\\,280 = 64$\n- $32 \\times 2 = 64$\n- Answer: $42$\n\n**Adding in columns:**\n$$\\begin{aligned} & 3\\,478 \\\\ + & 2\\,965 \\\\ \\hline & 6\\,443 \\end{aligned}$$\n\n**Estimation and rounding:**\nEstimate $487 \\times 23$ by rounding:\n$500 \\times 20 = 10\\,000$\nExact answer: $487 \\times 23 = 11\\,201$\nOur estimate is in the right ballpark.\n\n**Compensating:**\n$398 + 275 = 400 + 275 - 2 = 673$\n\n**N.B.** A calculator should only be used to **check** the correctness of your answer.'),
  q(3, 'Which property is shown by $5 \\times (3 + 7) = 5 \\times 3 + 5 \\times 7$?',
    ['Distributive', 'Commutative', 'Associative', 'Identity'], 0,
    'The distributive property spreads multiplication over addition: $a(b + c) = ab + ac$.'),
  t(4, '### Multiples and Factors\n\nA **factor** of a number divides into it exactly with no remainder.\nA **multiple** of a number is the product of that number and a whole number.\n\n**Example:** Factors of 18: $\\{1, 2, 3, 6, 9, 18\\}$\nMultiples of 7: $\\{7, 14, 21, 28, 35, \\ldots\\}$\n\n### Prime and Composite Numbers\n\n- A **prime number** has exactly two factors: 1 and itself. E.g. 2, 3, 5, 7, 11, 13, ...\n- A **composite number** has more than two factors. E.g. 4, 6, 8, 9, 10, ...\n- The number **1** is neither prime nor composite.\n- The number **2** is the only even prime number.\n\n### Prime Factorisation\n\nWrite a number as a product of its prime factors.\n\n**Example:** $60 = 2 \\times 2 \\times 3 \\times 5 = 2^2 \\times 3 \\times 5$\n\nUse a **factor tree**:\n- $60 = 6 \\times 10$\n- $6 = 2 \\times 3$ and $10 = 2 \\times 5$\n- So $60 = 2 \\times 3 \\times 2 \\times 5 = 2^2 \\times 3 \\times 5$'),
  q(5, 'List all the prime factors of 36.',
    ['2 and 3', '2, 3, and 6', '1, 2, 3, 4, 6, 9', '2, 4, and 9'], 0,
    '$36 = 2^2 \\times 3^2$. The prime factors are $2$ and $3$.',
    ['Write 36 as a product of prime numbers using a factor tree.']),
  fb(6, 'A prime number has exactly ___ factors. The number 1 is ___ prime nor composite.',
    ['2', 'neither'],
    'Prime numbers have exactly 2 factors: 1 and themselves. The number 1 has only one factor.'),
  t(7, '### HCF and LCM\n\n**HCF (Highest Common Factor)** — the largest number that divides into two or more numbers exactly.\n**LCM (Lowest Common Multiple)** — the smallest positive number that is a multiple of two or more numbers.\n\n**Method:** Use prime factorisation or inspection.\n\n**Example:** Find the HCF and LCM of 24 and 36.\n- $24 = 2^3 \\times 3$\n- $36 = 2^2 \\times 3^2$\n- HCF: take the **lowest** power of each common prime $= 2^2 \\times 3 = 12$\n- LCM: take the **highest** power of every prime $= 2^3 \\times 3^2 = 72$\n\n**Quick check:** HCF $\\times$ LCM $= 12 \\times 72 = 864 = 24 \\times 36$ ✓\n\n**By inspection:**\n- HCF of 12 and 18: Factors of 12 are $\\{1,2,3,4,6,12\\}$. Factors of 18 are $\\{1,2,3,6,9,18\\}$. Common: $\\{1,2,3,6\\}$. HCF $= 6$.'),
  q(8, 'Find the LCM of 8 and 12.',
    ['24', '4', '48', '96'], 0,
    '$8 = 2^3$ and $12 = 2^2 \\times 3$. LCM $= 2^3 \\times 3 = 24$.',
    ['Use the highest power of each prime factor.']),
  t(9, '### Order of Operations (BODMAS)\n\nWhen evaluating expressions with multiple operations, follow the correct order:\n\n1. **B**rackets\n2. **O**rders (exponents and roots)\n3. **D**ivision and **M**ultiplication (left to right)\n4. **A**ddition and **S**ubtraction (left to right)\n\n**Example 1:** $4 + 3 \\times 5 = 4 + 15 = 19$ (NOT $35$)\n\n**Example 2:** $(6 + 4) \\times 2 - 3 = 10 \\times 2 - 3 = 20 - 3 = 17$\n\n**Example 3:** $18 \\div 3 + 2 \\times 4 = 6 + 8 = 14$\n\n**Common mistake:** Adding before multiplying. Always multiply and divide before adding and subtracting, unless brackets say otherwise.'),
  q(10, 'Calculate: $20 - 4 \\times 3 + 6$.',
    ['14', '54', '8', '18'], 0,
    'Multiplication first: $4 \\times 3 = 12$. Then left to right: $20 - 12 + 6 = 14$.'),
];

// --- Lesson 2: Solving Problems with Whole Numbers ---
blockNum = 0;
const ch1_lesson2 = [
  t(1, '## Solving Problems with Whole Numbers\n\nIn this lesson we apply whole number skills to solve problems involving ratio, rate, percentage, and financial contexts.\n\n### Ratio\n\nA **ratio** compares two or more quantities of the same kind.\n\n**Example 1:** Thandi and Sipho share R180 in the ratio $2:3$.\n- Total parts: $2 + 3 = 5$\n- Thandi: $\\frac{2}{5} \\times R180 = R72$\n- Sipho: $\\frac{3}{5} \\times R180 = R108$\n- Check: $R72 + R108 = R180$ ✓\n\n**Example 2:** A fruit juice recipe uses orange juice and water in the ratio $3:7$. If you have 210 ml of orange juice, how much water do you need?\n- 3 parts $= 210$ ml, so 1 part $= 70$ ml\n- Water $= 7 \\times 70 = 490$ ml'),
  t(2, '### Rate\n\nA **rate** compares two quantities of different kinds.\n\n**Example:** A car travels 360 km in 4 hours.\n- Speed $= \\frac{360}{4} = 90$ km/h\n\n**Example:** A shop sells 5 kg of sugar for R85.\n- Price per kg $= \\frac{R85}{5} = R17$ per kg\n\n### Percentage of a Whole Number\n\n**To find a percentage of a number:**\n$$\\frac{\\text{percentage}}{100} \\times \\text{amount}$$\n\n**Example:** What is 35% of R600?\n$$\\frac{35}{100} \\times 600 = R210$$\n\n### Percentage Increase and Decrease\n\n**Example (Increase):** A pair of school shoes costs R350. The price increases by 10%.\n$$\\text{Increase} = \\frac{10}{100} \\times R350 = R35$$\n$$\\text{New price} = R350 + R35 = R385$$\n\n**Example (Decrease):** A textbook costs R240. There is a 15% discount.\n$$\\text{Discount} = \\frac{15}{100} \\times R240 = R36$$\n$$\\text{Sale price} = R240 - R36 = R204$$'),
  q(3, 'Three friends share R450 in the ratio $1:2:3$. What is the largest share?',
    ['R225', 'R150', 'R75', 'R300'], 0,
    'Total parts $= 1 + 2 + 3 = 6$. Largest share $= \\frac{3}{6} \\times R450 = R225$.'),
  t(4, '### Profit, Loss, and Discount\n\n**Profit** $=$ Selling price $-$ Cost price (when selling price is higher).\n**Loss** $=$ Cost price $-$ Selling price (when cost price is higher).\n\n**Profit percentage:**\n$$\\text{Profit \\%} = \\frac{\\text{Profit}}{\\text{Cost price}} \\times 100$$\n\n**Example:** A trader at a market in Durban buys bracelets at R15 each and sells them for R24 each.\n- Profit $= R24 - R15 = R9$\n- Profit % $= \\frac{9}{15} \\times 100 = 60\\%$\n\n### Discount\n\nA **discount** is a reduction in price.\n\n**Example:** A jacket costs R500. The shop offers a 20% discount.\n- Discount $= \\frac{20}{100} \\times R500 = R100$\n- Sale price $= R500 - R100 = R400$'),
  q(5, 'A trader buys a bag for R120 and sells it for R150. What is the profit percentage?',
    ['25%', '30%', '20%', '80%'], 0,
    'Profit $= R150 - R120 = R30$. Profit % $= \\frac{30}{120} \\times 100 = 25\\%$.'),
  fb(6, 'Profit = Selling price minus ___. To find the percentage of a number, divide the percentage by ___ and multiply.',
    ['cost price', '100'],
    'Profit = SP - CP. Percentage of a number: divide by 100, then multiply by the number.'),
  t(7, '### Budgets and Accounts\n\nA **budget** is a plan for income and expenses over a period of time.\n\n**Example:** The Mokoena family has a monthly income of R15 000. Their expenses:\n\n| Item | Amount | % of Income |\n|------|--------|------------|\n| Rent | R4 500 | 30% |\n| Food | R3 000 | 20% |\n| Transport | R2 250 | 15% |\n| School fees | R1 500 | 10% |\n| Electricity | R750 | 5% |\n| Savings | R1 500 | 10% |\n| Other | R1 500 | 10% |\n| **Total** | **R15 000** | **100%** |\n\nThis is a **balanced budget** because income equals expenses.\n\n- If expenses exceed income → **deficit** (not enough money).\n- If income exceeds expenses → **surplus** (money left over).'),
  q(8, 'A family earns R12 000 and spends R13 500 per month. What is their situation?',
    ['A deficit of R1 500', 'A surplus of R1 500', 'A balanced budget', 'A deficit of R12 000'], 0,
    'Expenses $>$ Income: $R13\\,500 - R12\\,000 = R1\\,500$ deficit.'),
  t(9, '### Simple Interest\n\nSimple interest is calculated on the **original amount** (principal) only.\n\n$$I = P \\times i \\times n$$\n\nwhere:\n- $I$ = interest\n- $P$ = principal (amount saved or borrowed)\n- $i$ = interest rate per year (as a decimal)\n- $n$ = number of years\n\n**Example:** Zanele saves R1 500 at 5% simple interest per year for 3 years.\n- $I = R1\\,500 \\times 0{,}05 \\times 3 = R225$\n- Total amount $= R1\\,500 + R225 = R1\\,725$\n\n**Example:** A loan of R3 000 at 10% per year for 2 years.\n- $I = R3\\,000 \\times 0{,}10 \\times 2 = R600$\n- Total to repay $= R3\\,000 + R600 = R3\\,600$'),
  q(10, 'Calculate the simple interest on R2 000 at 6% per year for 4 years.',
    ['R480', 'R2 480', 'R240', 'R120'], 0,
    '$I = R2\\,000 \\times 0{,}06 \\times 4 = R480$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Common Fractions (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Operations with Common Fractions ---
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Common Fractions\n\nA **common fraction** represents part of a whole. It is written as $\\frac{a}{b}$ where $a$ is the **numerator** (top) and $b$ is the **denominator** (bottom). The denominator can never be zero.\n\n### Types of Fractions\n\n| Type | Description | Example |\n|------|-------------|--------|\n| Proper fraction | Numerator < denominator | $\\frac{3}{5}$ |\n| Improper fraction | Numerator $\\geq$ denominator | $\\frac{7}{4}$ |\n| Mixed number | Whole number and a fraction | $1\\frac{3}{4}$ |\n\n### Equivalent Fractions\n\nFractions that have the same value:\n$$\\frac{1}{2} = \\frac{2}{4} = \\frac{3}{6} = \\frac{4}{8} = \\frac{5}{10}$$\n\nMultiply or divide both numerator and denominator by the same number.\n\n### Simplifying Fractions\n\n$\\frac{12}{18} = \\frac{12 \\div 6}{18 \\div 6} = \\frac{2}{3}$ (divide by the HCF)'),
  t(2, '### Addition and Subtraction of Fractions\n\nTo add or subtract fractions, you need a **common denominator** (the LCM of the denominators).\n\n**Example 1:** $\\frac{2}{3} + \\frac{1}{4}$\n- LCD $= 12$\n$$= \\frac{8}{12} + \\frac{3}{12} = \\frac{11}{12}$$\n\n**Example 2:** $\\frac{5}{6} - \\frac{1}{3}$\n- LCD $= 6$\n$$= \\frac{5}{6} - \\frac{2}{6} = \\frac{3}{6} = \\frac{1}{2}$$\n\n**Example 3 (Mixed numbers):** $2\\frac{1}{3} + 1\\frac{1}{2}$\n$$= \\frac{7}{3} + \\frac{3}{2} = \\frac{14}{6} + \\frac{9}{6} = \\frac{23}{6} = 3\\frac{5}{6}$$\n\n**Example 4 (Mixed numbers, where one denominator is a multiple of the other):**\n$3\\frac{1}{4} - 1\\frac{1}{2} = \\frac{13}{4} - \\frac{3}{2} = \\frac{13}{4} - \\frac{6}{4} = \\frac{7}{4} = 1\\frac{3}{4}$\n\n**Always simplify** your answer to the lowest terms.'),
  q(3, 'Calculate: $\\frac{3}{4} + \\frac{2}{5}$.',
    ['$\\frac{23}{20}$ or $1\\frac{3}{20}$', '$\\frac{5}{9}$', '$\\frac{5}{20}$', '$\\frac{6}{20}$'], 0,
    'LCD $= 20$. $\\frac{3}{4} = \\frac{15}{20}$ and $\\frac{2}{5} = \\frac{8}{20}$. Sum $= \\frac{15 + 8}{20} = \\frac{23}{20} = 1\\frac{3}{20}$.'),
  t(4, '### Multiplication of Fractions\n\nMultiply numerators together and denominators together. Simplify first where possible.\n$$\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}$$\n\n**Example:** $\\frac{2}{3} \\times \\frac{3}{5} = \\frac{6}{15} = \\frac{2}{5}$\n\n**Example with mixed numbers:** $1\\frac{1}{2} \\times 2\\frac{1}{3}$\n$$= \\frac{3}{2} \\times \\frac{7}{3} = \\frac{21}{6} = \\frac{7}{2} = 3\\frac{1}{2}$$\n\n### Division of Fractions\n\nMultiply by the **reciprocal** (flip the second fraction).\n$$\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}$$\n\n**Example:** $\\frac{3}{4} \\div \\frac{2}{5} = \\frac{3}{4} \\times \\frac{5}{2} = \\frac{15}{8} = 1\\frac{7}{8}$'),
  q(5, 'Calculate: $\\frac{5}{6} \\div \\frac{1}{3}$.',
    ['$2\\frac{1}{2}$', '$\\frac{5}{18}$', '$\\frac{5}{2}$', '$\\frac{1}{2}$'], 0,
    '$\\frac{5}{6} \\div \\frac{1}{3} = \\frac{5}{6} \\times \\frac{3}{1} = \\frac{15}{6} = \\frac{5}{2} = 2\\frac{1}{2}$.'),
  fb(6, 'To divide by a fraction, multiply by its ___. Before adding fractions, find a common ___.',
    ['reciprocal', 'denominator'],
    'Dividing by a fraction means multiplying by its reciprocal. Addition requires a common denominator.'),
  t(7, '### Percentages and Fractions\n\n**Calculate the percentage of a whole number:**\n$$\\text{Percentage of a number} = \\frac{\\text{percentage}}{100} \\times \\text{number}$$\n\n**Example:** What is 25% of 80?\n$$\\frac{25}{100} \\times 80 = \\frac{1}{4} \\times 80 = 20$$\n\n**Using multiples and factors to simplify:**\nWrite $\\frac{8}{12}$ in its simplest form:\n- HCF of 8 and 12 is 4\n- $\\frac{8 \\div 4}{12 \\div 4} = \\frac{2}{3}$'),
  q(8, 'Simplify $\\frac{15}{20}$ to its lowest terms.',
    ['$\\frac{3}{4}$', '$\\frac{5}{10}$', '$\\frac{1}{2}$', '$\\frac{15}{20}$'], 0,
    'HCF of 15 and 20 is 5. $\\frac{15 \\div 5}{20 \\div 5} = \\frac{3}{4}$.'),
  t(9, '### Solving Problems with Fractions\n\n**Example 1:** A farmer in the Free State uses $\\frac{2}{5}$ of his 200 hectare farm for maize. How many hectares is that?\n$$\\frac{2}{5} \\times 200 = 80 \\text{ hectares}$$\n\n**Example 2:** A recipe uses $\\frac{3}{4}$ cup of flour. Nomsa wants to make $\\frac{1}{3}$ of the recipe. How much flour does she need?\n$$\\frac{1}{3} \\times \\frac{3}{4} = \\frac{3}{12} = \\frac{1}{4} \\text{ cup}$$\n\n**Example 3:** A water tank is $\\frac{7}{8}$ full. After using $\\frac{1}{4}$ of the tank, how much remains?\n$$\\frac{7}{8} - \\frac{1}{4} = \\frac{7}{8} - \\frac{2}{8} = \\frac{5}{8}$$\n\n**Example 4 (Grouping and sharing):** Thabo has $4\\frac{1}{2}$ litres of milk. Each glass holds $\\frac{3}{4}$ litre. How many glasses can he fill?\n$$4\\frac{1}{2} \\div \\frac{3}{4} = \\frac{9}{2} \\times \\frac{4}{3} = \\frac{36}{6} = 6 \\text{ glasses}$$'),
  q(10, 'A rope is $3\\frac{1}{2}$ m long. It is cut into pieces of $\\frac{1}{4}$ m each. How many pieces are there?',
    ['14', '7', '12', '3'], 0,
    '$3\\frac{1}{2} \\div \\frac{1}{4} = \\frac{7}{2} \\times \\frac{4}{1} = \\frac{28}{2} = 14$ pieces.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Decimal Fractions (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Ordering and Operations with Decimal Fractions ---
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Decimal Fractions\n\nA **decimal fraction** is another way to write a common fraction whose denominator is a power of 10.\n\n$$\\frac{3}{10} = 0{,}3 \\qquad \\frac{7}{100} = 0{,}07 \\qquad \\frac{25}{1000} = 0{,}025$$\n\n### Place Value\n\n| Position | Value |\n|----------|-------|\n| Ones | $1$ |\n| Tenths | $0{,}1$ |\n| Hundredths | $0{,}01$ |\n| Thousandths | $0{,}001$ |\n\n**Example:** In the number $4{,}365$:\n- $4$ is in the ones place\n- $3$ is in the tenths place (value $0{,}3$)\n- $6$ is in the hundredths place (value $0{,}06$)\n- $5$ is in the thousandths place (value $0{,}005$)\n\n### Ordering and Comparing Decimals\n\nCompare digit by digit from left to right.\n\n**Example:** Arrange in ascending order: $0{,}35$; $0{,}305$; $0{,}4$\n$$0{,}305 < 0{,}35 < 0{,}4$$'),
  t(2, '### Rounding Off Decimal Fractions\n\nTo round to a given number of decimal places:\n1. Look at the digit **after** the rounding place.\n2. If it is 5 or more, round **up**.\n3. If it is less than 5, round **down**.\n\n**Examples:**\n- $3{,}746$ to 2 decimal places: $3{,}75$ (the 6 rounds the 4 up)\n- $0{,}823$ to 1 decimal place: $0{,}8$ (the 2 rounds down)\n- $12{,}995$ to 2 decimal places: $13{,}00$ (the 5 rounds up)\n\n### Addition and Subtraction of Decimals\n\nLine up the decimal commas and add or subtract as with whole numbers.\n\n**Example:** $3{,}45 + 2{,}7$\n$$\\begin{aligned} &3{,}45 \\\\ +&2{,}70 \\\\ \\hline &6{,}15 \\end{aligned}$$\n\n**Example:** $8{,}3 - 2{,}67$\n$$\\begin{aligned} &8{,}30 \\\\ -&2{,}67 \\\\ \\hline &5{,}63 \\end{aligned}$$'),
  q(3, 'Round $5{,}347$ to 1 decimal place.',
    ['$5{,}3$', '$5{,}4$', '$5{,}35$', '$5{,}0$'], 0,
    'Look at the second decimal (4). Since $4 < 5$, round down: $5{,}3$.'),
  t(4, '### Multiplication of Decimal Fractions\n\nWhen multiplying decimals:\n1. Multiply as if there are no decimal points.\n2. Count the total number of decimal places in both numbers.\n3. Place the decimal comma in the answer.\n\n**Example:** $1{,}2 \\times 0{,}3$\n- $12 \\times 3 = 36$\n- Total decimal places: $1 + 1 = 2$\n- Answer: $0{,}36$\n\n**Multiplying by powers of 10:**\n- $2{,}45 \\times 10 = 24{,}5$ (move decimal 1 place right)\n- $2{,}45 \\times 100 = 245$ (move decimal 2 places right)\n\n### Division of Decimal Fractions\n\nTo divide by a decimal, make the divisor a whole number.\n\n**Example:** $2{,}4 \\div 0{,}3$\n- Multiply both by 10: $24 \\div 3 = 8$\n\n**Dividing by powers of 10:**\n- $34{,}5 \\div 10 = 3{,}45$ (move decimal 1 place left)\n- $34{,}5 \\div 100 = 0{,}345$ (move decimal 2 places left)'),
  q(5, 'Calculate: $0{,}4 \\times 0{,}5$.',
    ['$0{,}20$', '$0{,}02$', '$2{,}0$', '$20$'], 0,
    '$4 \\times 5 = 20$. Total decimal places: $1 + 1 = 2$. Answer: $0{,}20$.'),
  fb(6, 'When multiplying decimals, the number of decimal places in the answer equals the ___ of the decimal places in both factors. Multiplying by 100 moves the decimal comma ___ places to the right.',
    ['sum', '2'],
    'Add the decimal places. Multiplying by 100 = 10² moves 2 places right.'),
  t(7, '### Equivalent Forms: Fractions, Decimals, and Percentages\n\nYou must convert fluently between these three forms.\n\n| Common Fraction | Decimal | Percentage |\n|----------------|---------|------------|\n| $\\frac{1}{4}$ | $0{,}25$ | $25\\%$ |\n| $\\frac{1}{2}$ | $0{,}5$ | $50\\%$ |\n| $\\frac{3}{4}$ | $0{,}75$ | $75\\%$ |\n| $\\frac{1}{5}$ | $0{,}2$ | $20\\%$ |\n| $\\frac{1}{3}$ | $0{,}\\overline{3}$ | $33\\frac{1}{3}\\%$ |\n| $\\frac{3}{8}$ | $0{,}375$ | $37{,}5\\%$ |\n\n**Conversions:**\n- Fraction → decimal: divide numerator by denominator\n- Decimal → percentage: multiply by 100\n- Percentage → fraction: write over 100 and simplify\n\n**Example:** Convert $\\frac{3}{5}$ to a decimal and a percentage.\n$\\frac{3}{5} = 3 \\div 5 = 0{,}6 = 60\\%$'),
  q(8, 'Write $0{,}125$ as a common fraction in simplest form.',
    ['$\\frac{1}{8}$', '$\\frac{1}{4}$', '$\\frac{125}{100}$', '$\\frac{5}{40}$'], 0,
    '$0{,}125 = \\frac{125}{1000} = \\frac{1}{8}$ (divide numerator and denominator by 125).'),
  t(9, '### Solving Problems with Decimal Fractions\n\n**Example 1:** A shop in Cape Town sells fabric at R45,50 per metre. Ayanda buys 2,5 m. How much does she pay?\n$$R45{,}50 \\times 2{,}5 = R113{,}75$$\n\n**Example 2:** Three friends share a R87,60 restaurant bill equally. How much does each pay?\n$$R87{,}60 \\div 3 = R29{,}20$$\n\n**Example 3:** Estimating before calculating:\nEstimate $4{,}8 \\times 3{,}2$:\n- Round: $5 \\times 3 = 15$\n- Exact: $4{,}8 \\times 3{,}2 = 15{,}36$\n- The estimate is close — the answer is reasonable.\n\n**Using a calculator to check:** You may use a calculator to check your manual calculations, but you must show your working.'),
  q(10, 'A bag of potatoes weighs 2,75 kg. What is the weight of 4 bags?',
    ['$11$ kg', '$10{,}75$ kg', '$11{,}25$ kg', '$10$ kg'], 0,
    '$2{,}75 \\times 4 = 11{,}00 = 11$ kg.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Exponents (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Working with Exponents ---
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Exponents\n\nAn **exponent** (or power) tells us how many times a base is multiplied by itself.\n\n$$a^n = \\underbrace{a \\times a \\times a \\times \\cdots \\times a}_{n \\text{ factors}}$$\n\nHere $a$ is the **base** and $n$ is the **exponent**.\n\n**Examples:**\n- $2^4 = 2 \\times 2 \\times 2 \\times 2 = 16$\n- $3^3 = 3 \\times 3 \\times 3 = 27$\n- $5^2 = 5 \\times 5 = 25$\n- $10^3 = 10 \\times 10 \\times 10 = 1\\,000$\n\n### Comparing and Representing Numbers in Exponential Form\n\n**Example:** Write 72 as a product of prime factors in exponential form.\n$$72 = 8 \\times 9 = 2^3 \\times 3^2$$\n\n### Squares and Cubes\n\nKnow these:\n\n| $n$ | $n^2$ | $n^3$ |\n|-----|-------|-------|\n| 1 | 1 | 1 |\n| 2 | 4 | 8 |\n| 3 | 9 | 27 |\n| 4 | 16 | 64 |\n| 5 | 25 | 125 |\n| 6 | 36 | 216 |\n| 7 | 49 | 343 |\n| 8 | 64 | 512 |\n| 9 | 81 | 729 |\n| 10 | 100 | 1 000 |'),
  t(2, '### Square Roots and Cube Roots\n\nThe **square root** undoes squaring:\n$$\\sqrt{25} = 5 \\text{ because } 5^2 = 25$$\n\nThe **cube root** undoes cubing:\n$$\\sqrt[3]{27} = 3 \\text{ because } 3^3 = 27$$\n\n**Examples:**\n- $\\sqrt{64} = 8$ because $8^2 = 64$\n- $\\sqrt[3]{125} = 5$ because $5^3 = 125$\n- $\\sqrt{49} + \\sqrt[3]{8} = 7 + 2 = 9$\n\n**Determine squares of at least $12^2 = 144$:**\n- $11^2 = 121$\n- $12^2 = 144$\n\n**Determine cubes of at least $6^3 = 216$:**\n- $1^3 = 1$, $2^3 = 8$, $3^3 = 27$, $4^3 = 64$, $5^3 = 125$, $6^3 = 216$'),
  q(3, 'Calculate: $\\sqrt{81} + \\sqrt[3]{64}$.',
    ['$13$', '$17$', '$145$', '$11$'], 0,
    '$\\sqrt{81} = 9$ and $\\sqrt[3]{64} = 4$. So $9 + 4 = 13$.'),
  t(4, '### Laws of Exponents\n\nIn Grade 7 we learn to recognise and use the following laws (limited to natural number exponents up to 5, and square and cube roots).\n\n| Law | Rule | Example |\n|-----|------|---------|\n| Product | $a^m \\times a^n = a^{m+n}$ | $2^3 \\times 2^2 = 2^5 = 32$ |\n| Quotient | $a^m \\div a^n = a^{m-n}$ | $3^5 \\div 3^2 = 3^3 = 27$ |\n| Power of a power | $(a^m)^n = a^{m \\times n}$ | $(2^2)^3 = 2^6 = 64$ |\n| Power of a product | $(ab)^n = a^n \\times b^n$ | $(2 \\times 3)^2 = 2^2 \\times 3^2 = 36$ |\n\n**Important:** These laws only work when the **bases are the same** (except power of a product).'),
  q(5, 'Simplify: $3^2 \\times 3^3$.',
    ['$3^5 = 243$', '$3^6 = 729$', '$9^5$', '$3^2 = 9$'], 0,
    'Product law: $3^2 \\times 3^3 = 3^{2+3} = 3^5 = 243$.'),
  fb(6, 'When multiplying powers with the same base, we ___ the exponents. When dividing powers with the same base, we ___ the exponents.',
    ['add', 'subtract'],
    'Product law: add exponents. Quotient law: subtract exponents.'),
  t(7, '### Calculations with Exponents\n\nAll four operations using numbers in exponential form, limited to exponents up to 5.\n\n**Example 1:** Calculate $2^3 \\times 2^2$.\n$$= 2^{3+2} = 2^5 = 32$$\n\n**Example 2:** Calculate $\\frac{5^4}{5^2}$.\n$$= 5^{4-2} = 5^2 = 25$$\n\n**Example 3:** Calculate $(2^2)^3$.\n$$= 2^{2 \\times 3} = 2^6 = 64$$\n\n**Example 4:** Calculate $(3 \\times 5)^2$.\n$$= 3^2 \\times 5^2 = 9 \\times 25 = 225$$\n\n**Example 5 (Combined):** Simplify $\\frac{2^4 \\times 2^3}{2^5}$.\n$$= \\frac{2^{4+3}}{2^5} = \\frac{2^7}{2^5} = 2^{7-5} = 2^2 = 4$$'),
  q(8, 'Simplify: $\\frac{4^3 \\times 4^2}{4^4}$.',
    ['$4^1 = 4$', '$4^5$', '$4^{24}$', '$4^0 = 1$'], 0,
    '$\\frac{4^{3+2}}{4^4} = \\frac{4^5}{4^4} = 4^{5-4} = 4^1 = 4$.'),
  t(9, '### Comparing Numbers in Exponential Form\n\nWrite numbers in exponential form to compare them.\n\n**Example:** Which is larger: $3^4$ or $4^3$?\n- $3^4 = 81$\n- $4^3 = 64$\n- So $3^4 > 4^3$.\n\n**Example:** Which is larger: $2^5$ or $5^2$?\n- $2^5 = 32$\n- $5^2 = 25$\n- So $2^5 > 5^2$.\n\n**Representing large numbers:**\n- The population of South Africa is approximately $62\\,000\\,000 = 62 \\times 10^6$.\n- The distance from the Earth to the Sun is approximately $150\\,000\\,000$ km $= 1{,}5 \\times 10^8$ km.'),
  q(10, 'Which is greater: $5^3$ or $3^5$?',
    ['$3^5 = 243$', '$5^3 = 125$', 'They are equal', 'Cannot compare'], 0,
    '$5^3 = 125$ and $3^5 = 243$. Since $243 > 125$, $3^5$ is greater.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Integers (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Counting and Operations with Integers ---
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Integers\n\nThe set of **integers** is $\\mathbb{Z} = \\{\\ldots, -3, -2, -1, 0, 1, 2, 3, \\ldots\\}$.\n\nIntegers include **positive numbers**, **negative numbers**, and **zero**.\n\n### Representing Integers on a Number Line\n\nOn a number line, negative numbers are to the left of zero and positive numbers to the right.\n\n$$\\ldots \\quad -4 \\quad -3 \\quad -2 \\quad -1 \\quad 0 \\quad 1 \\quad 2 \\quad 3 \\quad 4 \\quad \\ldots$$\n\n### Counting Forwards and Backwards\n\nCount in integers for any interval:\n- Count in 3s from $-7$: $-7, -4, -1, 2, 5, 8, \\ldots$\n- Count backwards in 2s from $5$: $5, 3, 1, -1, -3, -5, \\ldots$\n\n### Ordering and Comparing Integers\n\nNumbers increase from left to right on the number line.\n- $-5 < -2$ (negative five is less than negative two)\n- $-3 < 0 < 4$'),
  t(2, '### Addition and Subtraction of Integers\n\n**Adding integers:**\n- Same signs: add the absolute values, keep the sign.\n  - $(-3) + (-5) = -8$\n  - $(+4) + (+6) = +10$\n- Different signs: subtract the smaller absolute value from the larger. Use the sign of the larger.\n  - $(-7) + (+3) = -4$\n  - $(+9) + (-4) = +5$\n\n**Subtracting integers:** Change to adding the opposite.\n$$a - b = a + (-b)$$\n\n**Example:** $(-3) - (+5) = (-3) + (-5) = -8$\n\n**Example:** $(+4) - (-6) = (+4) + (+6) = +10$\n\n**Example:** $(-2) - (-7) = (-2) + (+7) = +5$\n\n### Properties of Integer Addition\n\n- **Commutative:** $(-3) + 5 = 5 + (-3) = 2$\n- **Associative:** $[(-2) + 3] + (-4) = (-2) + [3 + (-4)] = -3$'),
  q(3, 'Calculate: $(-6) + (+4)$.',
    ['$-2$', '$-10$', '$2$', '$10$'], 0,
    'Different signs: $6 - 4 = 2$. The larger absolute value is 6 (negative), so the answer is $-2$.'),
  t(4, '### Using Integers in Context\n\nIntegers appear in many real-world situations in South Africa.\n\n**Temperature:** In winter, Sutherland in the Northern Cape can reach $-8°$C. If the temperature rises by $15°$C during the day:\n$$-8 + 15 = 7°\\text{C}$$\n\n**Finance:** Lerato has R200 in her school tuck shop account. She spends R250.\n$$R200 - R250 = -R50$$\nHer account is R50 **overdrawn** (in the negative).\n\n**Altitude:** The Dead Sea is at $-430$ m (below sea level). Mount Kilimanjaro is at $5\\,895$ m above sea level. The difference in altitude:\n$$5\\,895 - (-430) = 5\\,895 + 430 = 6\\,325 \\text{ m}$$\n\n**Below zero on a number line:**\nA submarine is at $-120$ m. It rises 45 m.\n$$-120 + 45 = -75 \\text{ m (still 75 m below the surface)}$$'),
  q(5, 'The temperature at sunrise in Bloemfontein is $-3°$C. By noon it has risen by $17°$C. What is the temperature at noon?',
    ['$14°$C', '$20°$C', '$-20°$C', '$-14°$C'], 0,
    '$-3 + 17 = 14°$C.'),
  fb(6, 'To subtract an integer, change the operation to addition and change the ___ of the number being subtracted. The sum of $(-5) + (+5)$ is ___.',
    ['sign', '0'],
    'Subtracting an integer = adding its opposite. A number plus its opposite equals zero.'),
  t(7, '### Ordering Integers on the Number Line\n\n**Arrange from smallest to largest:** $3, -5, 0, -2, 7, -7$\n\nOn the number line:\n$$-7, -5, -2, 0, 3, 7$$\n\n**Key idea:** The further left on the number line, the smaller the number.\n- $-7 < -5 < -2 < 0 < 3 < 7$\n\n**Be careful:** $-7$ is less than $-5$, even though 7 is bigger than 5. The negative sign changes the order.\n\n### Adding on the Number Line\n\nStart at the first number. Move right for addition, left for subtraction.\n\n$(-3) + (+5)$: Start at $-3$, move 5 units right → arrive at $2$.\n\n$(+2) + (-6)$: Start at $2$, move 6 units left → arrive at $-4$.'),
  q(8, 'Which integer is greater: $-15$ or $-8$?',
    ['$-8$', '$-15$', 'They are equal', 'Cannot compare'], 0,
    '$-8$ is to the right of $-15$ on the number line, so $-8 > -15$.'),
  t(9, '### Mixed Operations with Integers\n\n**Example 1:** $(-4) + (-2) + (+3)$\n$$= (-6) + (+3) = -3$$\n\n**Example 2:** $(-5) + (+8) - (+3)$\n$$= (-5) + (+8) + (-3) = (+3) + (-3) = 0$$\n\n**Example 3:** Arrange these temperatures from coldest to warmest:\n$-2°\\text{C}, 5°\\text{C}, -7°\\text{C}, 0°\\text{C}, 3°\\text{C}$\n\nAnswer: $-7°\\text{C}, -2°\\text{C}, 0°\\text{C}, 3°\\text{C}, 5°\\text{C}$\n\n**Example 4:** A lift starts on Floor 2. It goes down 5 floors, then up 3 floors. Where is it now?\n$$2 + (-5) + 3 = -3 + 3 = 0$$\nThe lift is on the ground floor (Floor 0).'),
  q(10, 'Calculate: $(-3) + (+7) - (+4)$.',
    ['$0$', '$-14$', '$14$', '$4$'], 0,
    '$(-3) + 7 = 4$. Then $4 - 4 = 0$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Numeric and Geometric Patterns (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Investigating and Extending Patterns ---
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Numeric Patterns\n\nA **pattern** (or **sequence**) is a list of numbers that follow a rule.\n\nIn Grade 7, we investigate and extend patterns — looking at what is happening between consecutive terms.\n\n### Constant Difference Patterns\n\nIf the difference between consecutive terms is always the same, the pattern has a **constant difference**.\n\n**Example:** $3, 7, 11, 15, 19, \\ldots$\n- Difference: $+4$ each time\n- Next terms: $23, 27, 31, \\ldots$\n\n**Example:** $25, 22, 19, 16, \\ldots$\n- Difference: $-3$ each time\n- Next terms: $13, 10, 7, \\ldots$\n\n### Constant Ratio Patterns\n\nIf each term is found by multiplying the previous term by the same number:\n\n**Example:** $2, 6, 18, 54, \\ldots$\n- Ratio: $\\times 3$ each time\n- Next terms: $162, 486, \\ldots$'),
  t(2, '### Describing the Rule\n\nDescribe the general rule for the relationship between the position number $n$ and the term value.\n\n**Example:**\n\n| Position ($n$) | 1 | 2 | 3 | 4 | 5 |\n|----------------|---|---|---|---|---|\n| Term | 5 | 8 | 11 | 14 | 17 |\n\nDifference: $+3$ each time.\nThe rule: $\\text{Term} = 3n + 2$\n\n**Check:** $n = 1$: $3(1) + 2 = 5$ ✓, $n = 4$: $3(4) + 2 = 14$ ✓\n\n**Example:**\n\n| Position ($n$) | 1 | 2 | 3 | 4 |\n|----------------|---|---|---|---|\n| Term | 4 | 7 | 10 | 13 |\n\nDifference: $+3$. When $n = 1$: $3(1) + c = 4$, so $c = 1$.\nRule: $\\text{Term} = 3n + 1$'),
  q(3, 'Find the next two terms: $1, 4, 7, 10, \\ldots$',
    ['13 and 16', '12 and 15', '14 and 17', '11 and 14'], 0,
    'The difference is $+3$ each time. $10 + 3 = 13$, $13 + 3 = 16$.'),
  t(4, '## Geometric Patterns\n\nGeometric patterns use shapes or drawings to show how a pattern grows.\n\n### Matchstick Patterns\n\n**Example:** Building squares with matchsticks:\n- Figure 1: 4 matchsticks (1 square)\n- Figure 2: 7 matchsticks (2 squares sharing a side)\n- Figure 3: 10 matchsticks (3 squares)\n- Figure 4: 13 matchsticks\n\nDifference: $+3$ each time.\nRule: $\\text{Matchsticks} = 3n + 1$ (where $n$ is the figure number)\n\nMatchsticks for Figure 10: $3(10) + 1 = 31$\n\n### Dot Patterns\n\n**Example:** Triangular numbers shown as dot arrays:\n$1, 3, 6, 10, 15, \\ldots$\n- Differences: $+2, +3, +4, +5, \\ldots$ (increasing by 1 each time)\n- These do NOT have a constant difference.'),
  q(5, 'A pattern is made of triangles using matchsticks. Figure 1 needs 3, Figure 2 needs 5, Figure 3 needs 7. How many matchsticks for Figure 7?',
    ['15', '13', '17', '21'], 0,
    'Difference $= +2$ each time. Rule: $2n + 1$. Figure 7: $2(7) + 1 = 15$.',
    ['Find the common difference and use it to build a rule.']),
  fb(6, 'A pattern with a constant difference between terms is called a ___ difference pattern. A pattern where each term is multiplied by the same number has a constant ___.',
    ['constant', 'ratio'],
    'Constant difference: same amount added/subtracted. Constant ratio: same amount multiplied.'),
  t(7, '### Patterns Represented in Different Forms\n\nPatterns can be shown as:\n- A list of numbers\n- A table of values\n- A physical or diagram form (shapes, dots)\n- A flow diagram\n\n**Example (Table):** A taxi fare in Gauteng:\n\n| Distance (km) | 1 | 2 | 3 | 4 | 5 |\n|---------------|---|---|---|---|---|\n| Cost (R) | 10 | 15 | 20 | 25 | 30 |\n\nDifference: $+5$ each time.\nRule: Cost $= 5 \\times \\text{distance} + 5$\n\nThis means there is a R5 base fare plus R5 per km.\n\n**Example (Extending backwards):**\n$\\ldots, ?, ?, 8, 11, 14, 17, \\ldots$\nDifference $= +3$. Going backwards: $8 - 3 = 5$, $5 - 3 = 2$.\nFull sequence: $\\ldots, 2, 5, 8, 11, 14, 17, \\ldots$'),
  q(8, 'Find the rule for: $n = 1, 2, 3, 4$ gives terms $2, 5, 8, 11$.',
    ['$3n - 1$', '$3n + 1$', '$2n + 1$', '$n + 3$'], 0,
    'Difference $= 3$. When $n = 1$: $3(1) + c = 2$, so $c = -1$. Rule: $3n - 1$.'),
  t(9, '### Describing Patterns in Own Words\n\nYou should be able to describe a pattern verbally.\n\n**Example:** The pattern $4, 8, 12, 16, 20, \\ldots$\n- "The pattern starts at 4 and increases by 4 each time."\n- "Each term is 4 times its position number."\n- Rule: $\\text{Term} = 4n$\n\n**Example:** The pattern $100, 90, 80, 70, \\ldots$\n- "The pattern starts at 100 and decreases by 10 each time."\n- Rule: $\\text{Term} = 110 - 10n$\n\n**SA Context:** The number of spectators at a school rugby match in Stellenbosch over 5 weeks: $120, 150, 180, 210, 240$. The attendance grows by 30 per week.'),
  q(10, 'The pattern is $50, 44, 38, 32, \\ldots$. What is the 8th term?',
    ['8', '6', '2', '14'], 0,
    'Difference $= -6$. Rule: $56 - 6n$. 8th term $= 56 - 6(8) = 56 - 48 = 8$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Functions and Relationships (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Input-Output Rules and Flow Diagrams ---
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Functions and Relationships\n\nA **function** (or relationship) is a rule that connects each **input** value to exactly one **output** value.\n\n### Input and Output Values\n\nThink of a function as a machine:\n$$\\text{Input} \\rightarrow \\boxed{\\text{Rule}} \\rightarrow \\text{Output}$$\n\n**Example:** The rule is "multiply by 3 and add 1".\n\n| Input ($x$) | 1 | 2 | 3 | 4 | 5 |\n|-------------|---|---|---|---|---|\n| Output ($y$) | 4 | 7 | 10 | 13 | 16 |\n\nAs a formula: $y = 3x + 1$\n\n### Flow Diagrams\n\nA **flow diagram** shows the steps in the rule.\n\n$$x \\longrightarrow \\times 3 \\longrightarrow + 1 \\longrightarrow y$$\n\nIf $x = 5$: $5 \\rightarrow 15 \\rightarrow 16$, so $y = 16$.'),
  t(2, '### Finding the Rule from a Table\n\nLook at the relationship between input and output values.\n\n**Example 1:**\n\n| $x$ | 1 | 2 | 3 | 4 | 5 |\n|-----|---|---|---|---|---|\n| $y$ | 3 | 5 | 7 | 9 | 11 |\n\nDifference in outputs: $+2$ each time → the coefficient of $x$ is $2$.\nWhen $x = 1$: $2(1) + c = 3$, so $c = 1$.\nRule: $y = 2x + 1$\n\n**Example 2:**\n\n| $x$ | 0 | 1 | 2 | 3 |\n|-----|---|---|---|---|\n| $y$ | 4 | 7 | 10 | 13 |\n\nDifference: $+3$. When $x = 0$: $y = 4$, so $c = 4$.\nRule: $y = 3x + 4$\n\n**Checking:** $y(2) = 3(2) + 4 = 10$ ✓'),
  q(3, 'Find the rule: $x = 1, 2, 3, 4$ and $y = 5, 9, 13, 17$.',
    ['$y = 4x + 1$', '$y = 4x - 1$', '$y = 5x$', '$y = 3x + 2$'], 0,
    'Difference $= 4$. When $x = 1$: $4(1) + c = 5$, so $c = 1$. Rule: $y = 4x + 1$.'),
  t(4, '### Equivalent Forms\n\nThe same relationship can be presented in different ways:\n\n1. **Words:** "Double the input and subtract 3"\n2. **Flow diagram:** $x \\rightarrow \\times 2 \\rightarrow - 3 \\rightarrow y$\n3. **Table:**\n\n| $x$ | 1 | 2 | 3 | 4 |\n|-----|---|---|---|---|\n| $y$ | $-1$ | 1 | 3 | 5 |\n\n4. **Formula:** $y = 2x - 3$\n\nAll four represent the **same** function.\n\nYou need to:\n- Determine input values, output values, or rules\n- Describe patterns and relationships in different forms\n- Justify that different descriptions represent the same relationship'),
  q(5, 'A flow diagram shows: $x \\rightarrow \\times 5 \\rightarrow - 2 \\rightarrow y$. If $y = 23$, what is $x$?',
    ['5', '4', '21', '25'], 0,
    'Working backwards: $23 + 2 = 25$, then $25 \\div 5 = 5$. So $x = 5$. Check: $5(5) - 2 = 23$ ✓.'),
  fb(6, 'A function assigns each input to exactly ___ output. To find an input from an output, work ___ through the flow diagram.',
    ['one', 'backwards'],
    'Each input has exactly one output. Reverse each operation to find the input.'),
  t(7, '### Tables and Formulae\n\nPatterns and relationships using formulae.\n\n**Example 1:** The cost of printing at a Johannesburg internet café is R2 per page plus a R5 service fee.\n\n| Pages ($x$) | 1 | 2 | 3 | 4 | 5 |\n|-------------|---|---|---|---|---|\n| Cost ($y$) | R7 | R9 | R11 | R13 | R15 |\n\nFormula: $y = 2x + 5$\n\n**Example 2:** Electricity in a township costs R1,50 per unit plus R50 monthly fee.\n\nFormula: $\\text{Cost} = 1{,}5u + 50$ where $u$ = units used.\n\nFor 200 units: $\\text{Cost} = 1{,}5(200) + 50 = 300 + 50 = R350$\n\n**Example 3:** If $y = x + 6$ and $y = 15$, then $x = 15 - 6 = 9$.'),
  q(8, 'If the rule is $y = 3x + 2$, what is $y$ when $x = 7$?',
    ['23', '21', '12', '27'], 0,
    '$y = 3(7) + 2 = 21 + 2 = 23$.'),
  t(9, '### Verbal Descriptions and Number Sentences\n\nYou must be able to describe relationships verbally and as number sentences.\n\n**Example:** "I think of a number, multiply it by 4, and add 5. The answer is 29. What is my number?"\n\nNumber sentence: $4x + 5 = 29$\nSolving: $4x = 24$, so $x = 6$.\n\n**Example:** "Nomsa earns R80 per hour babysitting. How much does she earn in $h$ hours?"\nFormula: $\\text{Earnings} = 80h$\nIn 5 hours: $80 \\times 5 = R400$\n\n**SA Context:** A prepaid data bundle costs R99 for 1 GB. The cost for $n$ bundles is $y = 99n$.'),
  q(10, 'I think of a number, double it, and subtract 3. The answer is 11. What is my number?',
    ['7', '8', '4', '14'], 0,
    '$2x - 3 = 11$, so $2x = 14$ and $x = 7$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Algebraic Expressions (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Introduction to Algebraic Language ---
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Algebraic Expressions\n\nAlgebra uses **variables** (letters) to represent unknown numbers.\n\n### Key Terminology\n\n| Term | Meaning | Example |\n|------|---------|--------|\n| Variable | A letter representing an unknown | $x$, $y$, $a$ |\n| Coefficient | The number in front of a variable | In $5x$, the coefficient is 5 |\n| Constant | A fixed number with no variable | In $3x + 7$, the constant is 7 |\n| Term | A part of an expression separated by $+$ or $-$ | In $3x + 2y - 5$, there are 3 terms |\n| Like terms | Terms with the same variable(s) | $4x$ and $-2x$ |\n\n### Writing Algebraic Expressions\n\n| Words | Algebra |\n|-------|--------|\n| A number plus 5 | $x + 5$ |\n| Three times a number | $3x$ |\n| A number decreased by 7 | $x - 7$ |\n| Half of a number | $\\frac{x}{2}$ |\n| A number squared | $x^2$ |'),
  t(2, '### Adding and Subtracting Like Terms\n\nOnly **like terms** can be added or subtracted. Like terms have the same variable and the same exponent.\n\n**Example 1:** $4x + 3x = 7x$\n\n**Example 2:** $6a - 2a + 3 = 4a + 3$\n\n**Example 3:** $5x + 2y - 3x + y = 2x + 3y$\n\n**Common mistakes:**\n- $3x + 2y \\neq 5xy$ (different variables cannot be combined)\n- $4x + 3 \\neq 7x$ (a variable term and a constant cannot be combined)\n\n### Multiplying Variables\n\n$$3 \\times x = 3x$$\n$$x \\times x = x^2$$\n$$2x \\times 3x = 6x^2$$'),
  q(3, 'Simplify: $5x + 3y - 2x + y$.',
    ['$3x + 4y$', '$7x + 4y$', '$3x + 2y$', '$7xy$'], 0,
    'Group like terms: $(5x - 2x) + (3y + y) = 3x + 4y$.'),
  t(4, '### Expanding (Distributive Property)\n\nUse the distributive property to expand brackets.\n\n**Example 1:** $3(x + 4) = 3x + 12$\n\n**Example 2:** $-2(x - 5) = -2x + 10$\n\n**Example 3:** $4(2x + 3) = 8x + 12$\n\n**Example 4:** $x(x + 3) = x^2 + 3x$\n\n### Substitution\n\nReplace the variable with a number and calculate.\n\n**Example:** Find the value of $2x + 5$ when $x = 3$.\n$$2(3) + 5 = 6 + 5 = 11$$\n\n**Example:** Find the value of $x^2 - 4$ when $x = 5$.\n$$5^2 - 4 = 25 - 4 = 21$$'),
  q(5, 'Expand: $-3(x + 2)$.',
    ['$-3x - 6$', '$-3x + 6$', '$-3x - 2$', '$3x + 6$'], 0,
    '$-3 \\times x = -3x$ and $-3 \\times 2 = -6$. So $-3x - 6$.'),
  fb(6, 'Only ___ terms can be added or subtracted. When expanding $a(b + c)$, we get $ab + ___$.',
    ['like', 'ac'],
    'Like terms have the same variable and exponent. Distributive property: $a(b + c) = ab + ac$.'),
  t(7, '### Substitution with Negative Numbers\n\n**Example 1:** Find the value of $3x + 1$ when $x = -2$.\n$$3(-2) + 1 = -6 + 1 = -5$$\n\n**Example 2:** If $x = -3$, find $x^2 + 2x$.\n$$(-3)^2 + 2(-3) = 9 + (-6) = 3$$\n\n**Be careful:** Always use brackets around negative numbers when substituting.\n- $(-3)^2 = 9$ (the square of negative 3)\n- $-3^2 = -(3^2) = -9$ (the negative of 3 squared)\n\n**Example 3:** Find $2a - b$ when $a = 4$ and $b = -3$.\n$$2(4) - (-3) = 8 + 3 = 11$$'),
  q(8, 'If $x = -2$, find the value of $x^2 - 3x$.',
    ['$10$', '$-2$', '$-10$', '$2$'], 0,
    '$(-2)^2 - 3(-2) = 4 + 6 = 10$.'),
  t(9, '### Writing Expressions from Word Problems\n\n**Example 1:** Thabo is $x$ years old. His father is three times as old. Write an expression for his father\'s age.\nFather\'s age $= 3x$\n\n**Example 2:** A rectangle has a length of $(2x + 1)$ cm and a width of $x$ cm. Write an expression for its perimeter.\n$$P = 2(2x + 1) + 2(x) = 4x + 2 + 2x = 6x + 2 \\text{ cm}$$\n\n**Example 3:** A shop sells pens at R$x$ each and notebooks at R$y$ each. Zanele buys 3 pens and 2 notebooks. Write an expression for the total cost.\n$$\\text{Total} = 3x + 2y$$\n\n**SA Context:** Airtime costs R$c$ per minute. The cost of a call lasting $m$ minutes is $cm$ rands.'),
  q(10, 'A rectangle has length $(x + 3)$ and width $x$. What is its perimeter?',
    ['$4x + 6$', '$2x + 6$', '$x^2 + 3x$', '$2x + 3$'], 0,
    '$P = 2(x + 3) + 2(x) = 2x + 6 + 2x = 4x + 6$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Algebraic Equations (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Solving Simple Equations ---
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Algebraic Equations\n\nAn **equation** is a mathematical statement that two expressions are equal. It always has an **equals sign** ($=$).\n\n**Expression:** $3x + 5$ (no equals sign — just a value)\n**Equation:** $3x + 5 = 14$ (has an equals sign — can be solved)\n\n### Solving by Inspection (Trial and Improvement)\n\nTry different values for $x$ until you find one that makes the equation true.\n\n**Example:** $x + 7 = 12$\n- Try $x = 5$: $5 + 7 = 12$ ✓\n- So $x = 5$.\n\n**Example:** $3x = 18$\n- Try $x = 6$: $3(6) = 18$ ✓\n- So $x = 6$.'),
  t(2, '### Solving Using Inverse Operations\n\nMore reliable than trial and improvement. Undo each operation step by step.\n\n**Inverse operations:**\n- Addition ↔ Subtraction\n- Multiplication ↔ Division\n\n**Example 1:** $x + 8 = 15$\n- Subtract 8 from both sides: $x = 15 - 8 = 7$\n\n**Example 2:** $4x = 28$\n- Divide both sides by 4: $x = 28 \\div 4 = 7$\n\n**Example 3:** $2x + 3 = 11$\n- Subtract 3: $2x = 8$\n- Divide by 2: $x = 4$\n- Check: $2(4) + 3 = 8 + 3 = 11$ ✓\n\n**Example 4:** $\\frac{x}{3} = 5$\n- Multiply both sides by 3: $x = 15$\n- Check: $\\frac{15}{3} = 5$ ✓'),
  q(3, 'Solve: $3x + 5 = 20$.',
    ['$x = 5$', '$x = 8$', '$x = 15$', '$x = 7$'], 0,
    'Subtract 5: $3x = 15$. Divide by 3: $x = 5$. Check: $3(5) + 5 = 20$ ✓.'),
  t(4, '### Equations with Brackets\n\nExpand brackets first, then solve.\n\n**Example:** $2(x + 4) = 14$\n$$2x + 8 = 14$$\n$$2x = 6$$\n$$x = 3$$\n\n**Example:** $3(x - 2) = 12$\n$$3x - 6 = 12$$\n$$3x = 18$$\n$$x = 6$$\n\n### Two-Step Equations\n\n**Example:** $\\frac{x}{2} + 3 = 7$\n- Subtract 3: $\\frac{x}{2} = 4$\n- Multiply by 2: $x = 8$\n- Check: $\\frac{8}{2} + 3 = 4 + 3 = 7$ ✓'),
  q(5, 'Solve: $2(x + 1) = 10$.',
    ['$x = 4$', '$x = 5$', '$x = 3$', '$x = 6$'], 0,
    'Expand: $2x + 2 = 10$. Subtract 2: $2x = 8$. Divide by 2: $x = 4$. Check: $2(4 + 1) = 2(5) = 10$ ✓.'),
  fb(6, 'The inverse operation of multiplication is ___. When solving an equation, what you do to one side you must do to the ___.',
    ['division', 'other side'],
    'Multiplication and division are inverses. Both sides of an equation must be treated equally.'),
  t(7, '### Word Problems Leading to Equations\n\n**Example 1:** Bongani thinks of a number, doubles it, and adds 5. The answer is 19. Find the number.\n- Let the number be $x$.\n- $2x + 5 = 19$\n- $2x = 14$\n- $x = 7$\n\n**Example 2:** Naledi is 4 years older than her sister Mpho. Together their ages add up to 22. How old is each?\n- Let Mpho\'s age $= x$\n- Naledi\'s age $= x + 4$\n- $x + (x + 4) = 22$\n- $2x + 4 = 22$\n- $2x = 18$\n- $x = 9$\n- Mpho is 9, Naledi is 13.\n\n**Example 3:** A rectangle has a perimeter of 30 cm. The length is twice the breadth. Find the dimensions.\n- Breadth $= x$, Length $= 2x$\n- $2(x + 2x) = 30$\n- $6x = 30$, so $x = 5$\n- Breadth $= 5$ cm, Length $= 10$ cm.'),
  q(8, 'I think of a number, multiply by 3, and subtract 4. The answer is 17. What is my number?',
    ['7', '13', '21', '5'], 0,
    '$3x - 4 = 17$. Add 4: $3x = 21$. Divide by 3: $x = 7$.'),
  t(9, '### Checking Your Solution\n\nAlways **substitute** your answer back into the original equation to verify.\n\n**Example:** Solve $5x - 3 = 22$.\n- Add 3: $5x = 25$\n- Divide by 5: $x = 5$\n- **Check:** $5(5) - 3 = 25 - 3 = 22$ ✓\n\n**Example:** The sum of three consecutive numbers is 36. Find them.\n- Let the numbers be $x$, $x + 1$, $x + 2$.\n- $x + (x + 1) + (x + 2) = 36$\n- $3x + 3 = 36$\n- $3x = 33$\n- $x = 11$\n- The numbers are 11, 12, and 13.\n- **Check:** $11 + 12 + 13 = 36$ ✓'),
  q(10, 'The sum of two consecutive even numbers is 26. What is the smaller number?',
    ['12', '13', '14', '10'], 0,
    'Let the numbers be $x$ and $x + 2$. $x + x + 2 = 26$, so $2x = 24$ and $x = 12$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Graphs (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Interpreting and Drawing Graphs ---
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Interpreting Graphs\n\nGraphs show the relationship between two quantities. They help us see patterns and tell stories with data.\n\n### Features of Graphs\n\n- **Axes:** The horizontal axis ($x$-axis) and vertical axis ($y$-axis).\n- **Increasing:** The graph goes up from left to right.\n- **Decreasing:** The graph goes down from left to right.\n- **Constant:** The graph is flat (horizontal) — no change.\n- **Maximum:** The highest point on the graph.\n- **Minimum:** The lowest point on the graph.\n- **Discrete:** Separate, unconnected points (e.g., number of learners).\n- **Continuous:** A connected line (e.g., temperature changing over time).'),
  t(2, '### Reading and Interpreting Graphs\n\n**Example 1:** A graph shows the temperature in Pretoria over 24 hours.\n- At 06:00 the temperature is $8°$C.\n- At 14:00 the temperature reaches a maximum of $28°$C.\n- Between 06:00 and 14:00, the graph is **increasing**.\n- Between 14:00 and 22:00, the graph is **decreasing**.\n\n**Example 2:** A graph shows the distance a cyclist covers during a trip from Stellenbosch to Franschhoek.\n- A steep section means the cyclist is going fast.\n- A flat (horizontal) section means the cyclist has stopped.\n- A gentle slope means the cyclist is going slowly.\n\n**Key idea:** On a distance-time graph:\n- A horizontal line = not moving\n- A steeper line = moving faster'),
  q(3, 'On a distance-time graph, what does a horizontal line mean?',
    ['The object is stationary', 'The object is accelerating', 'The object is moving at constant speed', 'The graph is finished'], 0,
    'A horizontal line means the distance is not changing — the object is not moving.'),
  t(4, '### Drawing Graphs from Tables\n\nTo draw a graph:\n1. Set up the axes with appropriate scales.\n2. Label the axes.\n3. Plot the points from the table.\n4. Join the points with a straight line (if appropriate).\n\n**Example:** Draw the graph for $y = 2x + 1$.\n\n| $x$ | $-2$ | $-1$ | $0$ | $1$ | $2$ |\n|-----|------|------|-----|-----|-----|\n| $y$ | $-3$ | $-1$ | $1$ | $3$ | $5$ |\n\nPlot the five points on the Cartesian plane and join them with a straight line.\n\nThe graph crosses the $y$-axis at $(0, 1)$ — this is the **$y$-intercept**.'),
  q(5, 'For the graph $y = x + 3$, what is the value of $y$ when $x = 0$?',
    ['3', '0', '-3', '1'], 0,
    'When $x = 0$: $y = 0 + 3 = 3$. So the $y$-intercept is $3$.'),
  fb(6, 'On a Cartesian plane, the horizontal axis is the ___-axis. The point where a graph crosses the $y$-axis is called the ___.',
    ['x', 'y-intercept'],
    'The $x$-axis is horizontal. The $y$-intercept is where the graph meets the $y$-axis.'),
  t(7, '### Types of Graphs\n\n**Global graphs** show overall trends without exact values.\n\n**Example (Journey graph):** Sipho walks to the shop and back.\n- Section 1: Walking away from home (distance increasing)\n- Section 2: At the shop (distance constant)\n- Section 3: Walking home (distance decreasing back to zero)\n\n**Example (Growth graph):** A plant grows quickly at first, then slows down.\n- The graph starts steep (fast growth) and becomes flatter (slow growth).\n\n**Discrete vs Continuous:**\n- The number of learners in a class is **discrete** (you can\'t have half a learner).\n- The temperature during the day is **continuous** (it changes smoothly).'),
  q(8, 'Which graph type would you use to show how the temperature changes during a day in Durban?',
    ['A continuous line graph', 'A bar graph', 'A pie chart', 'A scatter plot'], 0,
    'Temperature changes continuously over time, so a line graph is best.'),
  t(9, '### Drawing Graphs from Equations\n\n**Step 1:** Choose values for $x$ (e.g. $-2, -1, 0, 1, 2$).\n**Step 2:** Calculate the corresponding $y$ values.\n**Step 3:** Plot the points.\n**Step 4:** Draw the line through the points.\n\n**Example:** Draw $y = -x + 4$.\n\n| $x$ | $-1$ | $0$ | $1$ | $2$ | $3$ |\n|-----|------|-----|-----|-----|-----|\n| $y$ | $5$ | $4$ | $3$ | $2$ | $1$ |\n\nThe line goes **down** from left to right — it has a negative slope.\nThe $y$-intercept is $(0, 4)$.\n\n**SA Context:** A taxi charges R10 plus R3 per km. The equation is $y = 3x + 10$. Plotting this gives a straight line starting at $(0, 10)$ going upwards.'),
  q(10, 'For the equation $y = -2x + 6$, what is $y$ when $x = 3$?',
    ['$0$', '$12$', '$-12$', '$6$'], 0,
    '$y = -2(3) + 6 = -6 + 6 = 0$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: Construction of Geometric Figures (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Measuring Angles and Constructions ---
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Construction of Geometric Figures\n\nIn this chapter you will learn to measure and construct angles, lines, and shapes using a **protractor**, **compass**, and **ruler**.\n\n### Measuring Angles\n\nUse a **protractor** to measure angles accurately.\n\n**Types of angles:**\n\n| Type | Size |\n|------|------|\n| **Acute** | Less than $90°$ |\n| **Right** | Exactly $90°$ |\n| **Obtuse** | Between $90°$ and $180°$ |\n| **Straight** | Exactly $180°$ |\n| **Reflex** | Between $180°$ and $360°$ |\n\n**How to use a protractor:**\n1. Place the centre mark on the vertex of the angle.\n2. Align one arm with the $0°$ line.\n3. Read the angle where the other arm crosses the scale.\n\n**Accuracy:** Measure to the nearest degree.'),
  t(2, '### Geometry of Straight Lines\n\n**Line segment:** A part of a line with two endpoints (e.g. $AB$).\n\n**Ray:** A line that starts at a point and goes on forever in one direction.\n\n**Straight line:** Goes on forever in both directions.\n\n**Parallel lines:** Lines that are always the same distance apart and never meet. We write $AB \\parallel CD$.\n\n**Perpendicular lines:** Lines that meet at right angles ($90°$). We write $AB \\perp CD$.\n\n### Parts of a Circle\n\nA circle has:\n- **Centre** — the middle point\n- **Radius** — the distance from the centre to the circle\n- **Diameter** — the distance across the circle through the centre ($d = 2r$)\n- **Circumference** — the distance around the circle\n- **Chord** — a line segment joining two points on the circle\n- **Arc** — part of the circumference'),
  q(3, 'An angle of $135°$ is classified as:',
    ['Obtuse', 'Acute', 'Right', 'Reflex'], 0,
    '$135°$ is between $90°$ and $180°$, so it is obtuse.'),
  t(4, '### Constructing Angles\n\nUsing a protractor:\n1. Draw a base line.\n2. Place the protractor centre on one endpoint.\n3. Mark the required angle.\n4. Draw the second arm through the mark.\n\n**Construct an angle of $60°$:**\n1. Draw line $AB$.\n2. Place protractor at $A$, mark $60°$.\n3. Draw a ray from $A$ through the $60°$ mark.\n\n### Constructing Perpendicular Lines\n\nUsing a compass and ruler:\n1. Open the compass to a suitable radius.\n2. From a point $P$ on the line, draw arcs on both sides.\n3. From each arc intersection, draw arcs above the line.\n4. Draw a line through $P$ and the intersection of the arcs above.\n\nThis line is perpendicular to the original line at $P$.'),
  q(5, 'Which instruments do you need to construct perpendicular lines accurately?',
    ['Compass and ruler', 'Protractor only', 'Ruler only', 'Calculator and ruler'], 0,
    'A compass and ruler are used for accurate geometric constructions.'),
  fb(6, 'Parallel lines never ___ and are always the same distance apart. Perpendicular lines meet at ___°.',
    ['meet', '90'],
    'Parallel lines never intersect. Perpendicular lines form a $90°$ angle.'),
  t(7, '### Constructing Parallel Lines\n\nUsing a ruler and set square (or protractor):\n1. Draw line $AB$.\n2. Mark a point $P$ above the line.\n3. Use a set square to draw a line through $P$ parallel to $AB$.\n\nAlternatively, use a protractor:\n1. Draw a transversal from $P$ to line $AB$.\n2. Measure the angle at $AB$.\n3. Copy this angle at $P$ on the same side.\n4. Draw the line — it will be parallel to $AB$.\n\n**Key property:** Corresponding angles are equal when lines are parallel.'),
  q(8, 'Two parallel lines are cut by a transversal. One angle is $55°$. What is the corresponding angle?',
    ['$55°$', '$125°$', '$35°$', '$180°$'], 0,
    'Corresponding angles between parallel lines are equal: $55°$.'),
  t(9, '### Constructing Triangles\n\nYou can construct a triangle when given:\n- Three sides (SSS)\n- Two sides and the included angle (SAS)\n- Two angles and a side (AAS)\n\n**Example (SSS):** Construct $\\triangle ABC$ with $AB = 5$ cm, $BC = 4$ cm, $AC = 3$ cm.\n1. Draw $AB = 5$ cm.\n2. Open compass to 3 cm, place at $A$, draw an arc.\n3. Open compass to 4 cm, place at $B$, draw an arc.\n4. Where the arcs cross is $C$.\n5. Join $AC$ and $BC$.\n\n**SA Context:** Surveyors in South Africa use triangulation — constructing triangles — to measure distances and map the land.'),
  q(10, 'To construct a triangle using SSS, you need to know:',
    ['The length of all three sides', 'Two sides and an angle', 'One side and two angles', 'Two angles and a side'], 0,
    'SSS means Side-Side-Side: you need all three side lengths.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Geometry of 2D Shapes (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Triangles ---
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Triangles\n\nA **triangle** has three sides and three angles. The sum of the interior angles of any triangle is $180°$.\n\n### Classification by Sides\n\n| Type | Properties |\n|------|------------|\n| **Scalene** | No sides equal, no angles equal |\n| **Isosceles** | Two sides equal, two base angles equal |\n| **Equilateral** | All three sides equal, all angles $= 60°$ |\n\n### Classification by Angles\n\n| Type | Properties |\n|------|------------|\n| **Acute-angled** | All angles less than $90°$ |\n| **Right-angled** | One angle exactly $90°$ |\n| **Obtuse-angled** | One angle greater than $90°$ |\n\nA triangle can be classified by **both** its sides and angles. For example: "right-angled isosceles triangle".'),
  t(2, '### Angle Sum Property\n\nThe three interior angles of any triangle add up to $180°$:\n$$\\angle A + \\angle B + \\angle C = 180°$$\n\n**Example 1:** In $\\triangle PQR$, $\\angle P = 50°$ and $\\angle Q = 65°$. Find $\\angle R$.\n$$\\angle R = 180° - 50° - 65° = 65°$$\nSince $\\angle Q = \\angle R = 65°$, the triangle is **isosceles**.\n\n**Example 2:** An equilateral triangle:\n$$\\text{Each angle} = \\frac{180°}{3} = 60°$$\n\n**Example 3:** An isosceles triangle has an apex angle of $46°$. Find the base angles.\n$$\\text{Each base angle} = \\frac{180° - 46°}{2} = \\frac{134°}{2} = 67°$$'),
  q(3, 'In $\\triangle ABC$, $\\angle A = 35°$ and $\\angle B = 90°$. Find $\\angle C$.',
    ['$55°$', '$35°$', '$45°$', '$90°$'], 0,
    '$\\angle C = 180° - 35° - 90° = 55°$.'),
  t(4, '### Properties of Quadrilaterals\n\nA **quadrilateral** has four sides and four angles. The sum of its interior angles is $360°$.\n\n| Shape | Key Properties |\n|-------|---------------|\n| **Parallelogram** | Opposite sides parallel and equal; opposite angles equal |\n| **Rectangle** | Parallelogram with all angles $= 90°$ |\n| **Square** | Rectangle with all sides equal |\n| **Rhombus** | Parallelogram with all sides equal |\n| **Trapezium** | One pair of parallel sides |\n| **Kite** | Two pairs of adjacent sides equal |\n\n**Hierarchy:** Every square is a rectangle. Every rectangle is a parallelogram. Every rhombus is a parallelogram.'),
  q(5, 'Three angles of a quadrilateral are $80°$, $100°$, and $95°$. Find the fourth angle.',
    ['$85°$', '$95°$', '$75°$', '$90°$'], 0,
    '$\\text{Fourth angle} = 360° - 80° - 100° - 95° = 85°$.'),
  fb(6, 'The interior angles of a triangle add up to ___°. The interior angles of a quadrilateral add up to ___°.',
    ['180', '360'],
    'Triangle angle sum $= 180°$. Quadrilateral angle sum $= 360°$.'),
  t(7, '### Similar and Congruent Shapes\n\n**Congruent** figures have the same shape AND the same size. They are identical copies.\n\n**Similar** figures have the same shape but may be different sizes. Their angles are equal and sides are in proportion.\n\n**Example:** Two triangles with angles $50°$, $60°$, $70°$ are similar if:\n- Corresponding angles are equal.\n- Corresponding sides are in the same ratio.\n\nIf $\\triangle ABC \\sim \\triangle DEF$ with scale factor 2:\n- $DE = 2 \\times AB$\n- $EF = 2 \\times BC$\n- $DF = 2 \\times AC$\n\n**SA Context:** Architects in Cape Town use similar triangles to create scaled building plans. A floor plan at scale $1:100$ means $1$ cm on paper $= 100$ cm (1 m) in real life.'),
  q(8, 'Two triangles have exactly the same angles but different side lengths. They are:',
    ['Similar', 'Congruent', 'Neither', 'Impossible'], 0,
    'Same angles, different sizes = similar. Congruent requires both same angles AND same sides.'),
  t(9, '### Solving Geometric Problems\n\n**Example 1:** In a parallelogram $ABCD$, $\\angle A = 70°$. Find all other angles.\n- $\\angle C = 70°$ (opposite angles equal)\n- $\\angle B = 180° - 70° = 110°$ (co-interior angles)\n- $\\angle D = 110°$\n\n**Example 2:** Find the unknown angles in a triangle with one angle of $90°$ and one of $42°$.\n$$\\text{Third angle} = 180° - 90° - 42° = 48°$$\n\n**Example 3:** A kite has two angles of $110°$ (opposite the equal sides pair) and one angle of $60°$. Find the fourth.\n$$360° - 110° - 110° - 60° = 80°$$'),
  q(10, 'In a parallelogram, one angle is $65°$. What is the angle adjacent to it?',
    ['$115°$', '$65°$', '$295°$', '$130°$'], 0,
    'Adjacent angles in a parallelogram are supplementary: $180° - 65° = 115°$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 13: Transformation Geometry (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Translations, Reflections, and Rotations ---
blockNum = 0;
const ch13_lesson1 = [
  t(1, '## Transformation Geometry\n\nA **transformation** changes the position, orientation, or size of a shape.\n\n### Types of Transformations\n\n| Transformation | What it does | Size changes? |\n|----------------|-------------|---------------|\n| Translation | Slides the shape | No |\n| Reflection | Flips over a line | No |\n| Rotation | Turns around a point | No |\n\nThese three preserve shape and size — we call them **rigid transformations** (or isometries).\n\n### Translation (Sliding)\n\nA **translation** moves every point the same distance in the same direction.\n\n**Example:** Translate $\\triangle ABC$ 3 units right and 2 units up.\n- $A(1, 1) \\rightarrow A\'(4, 3)$\n- $B(3, 1) \\rightarrow B\'(6, 3)$\n- $C(2, 3) \\rightarrow C\'(5, 5)$\n\nThe shape and size stay the same. Only the position changes.'),
  t(2, '### Reflection (Flipping)\n\nA **reflection** creates a mirror image of a shape over a **line of reflection** (mirror line).\n\n**Reflecting on squared paper:**\n1. Count the distance from each point to the mirror line.\n2. Plot the image the same distance on the other side.\n\n**Common mirror lines:**\n- The $x$-axis (horizontal)\n- The $y$-axis (vertical)\n- A vertical or horizontal line through any point\n\n**Example:** Reflect $P(2, 3)$ in the $x$-axis.\n- $P\' = (2, -3)$ (the $y$-coordinate changes sign)\n\n**Example:** Reflect $Q(-1, 4)$ in the $y$-axis.\n- $Q\' = (1, 4)$ (the $x$-coordinate changes sign)\n\n**Properties of reflection:**\n- The shape and size are unchanged.\n- The image is laterally inverted (mirror image).'),
  q(3, 'Point $A(3, 5)$ is reflected in the $y$-axis. What are the coordinates of $A\'$?',
    ['$(-3, 5)$', '$(3, -5)$', '$(-3, -5)$', '$(5, 3)$'], 0,
    'Reflection in the $y$-axis: $(x, y) \\rightarrow (-x, y)$. So $A\' = (-3, 5)$.'),
  t(4, '### Rotation (Turning)\n\nA **rotation** turns a shape around a fixed point (the **centre of rotation**) by a given **angle** and **direction** (clockwise or anticlockwise).\n\n**Example:** Rotate a triangle $90°$ clockwise about the origin.\n- Every point turns $90°$ around $(0, 0)$.\n- The shape and size stay the same.\n\n**Common rotations on squared paper:**\n- $90°$ clockwise (quarter turn)\n- $180°$ (half turn)\n- $270°$ clockwise (three-quarter turn) = $90°$ anticlockwise\n- $360°$ (full turn — back to the start)\n\n**Identifying a rotation:**\n- The shape has turned but not flipped.\n- All points are the same distance from the centre of rotation.'),
  q(5, 'A shape is rotated $180°$ about the origin. Point $(3, -2)$ moves to:',
    ['$(-3, 2)$', '$(3, 2)$', '$(-2, 3)$', '$(2, -3)$'], 0,
    '$180°$ rotation: $(x, y) \\rightarrow (-x, -y)$. So $(3, -2) \\rightarrow (-3, 2)$.'),
  fb(6, 'A translation ___ a shape without turning or flipping it. A reflection produces a ___ image.',
    ['slides', 'mirror'],
    'Translation = slide. Reflection = mirror (flip).'),
  t(7, '### Lines of Symmetry\n\nA **line of symmetry** divides a shape into two identical halves that are mirror images.\n\n| Shape | Lines of Symmetry |\n|-------|-------------------|\n| Equilateral triangle | 3 |\n| Isosceles triangle | 1 |\n| Square | 4 |\n| Rectangle | 2 |\n| Circle | Infinite |\n| Regular hexagon | 6 |\n\n**Rotational symmetry:** A shape has rotational symmetry if it looks the same after being rotated less than $360°$.\n\n**Order of rotational symmetry** = the number of times the shape looks the same in a full turn.\n\n- Square: order 4 ($90°$, $180°$, $270°$, $360°$)\n- Equilateral triangle: order 3\n- Rectangle: order 2'),
  q(8, 'How many lines of symmetry does a square have?',
    ['4', '2', '1', '8'], 0,
    'A square has 4 lines of symmetry: 2 through opposite sides, 2 through opposite corners.'),
  t(9, '### Enlargements and Reductions\n\n**Enlargement** makes a shape bigger. **Reduction** makes it smaller.\n\nThe **scale factor** tells us how much bigger or smaller:\n- Scale factor $> 1$: enlargement\n- Scale factor $< 1$: reduction\n- Scale factor $= 1$: same size\n\n**Example:** A triangle has sides 3 cm, 4 cm, and 5 cm. It is enlarged by scale factor 2.\n- New sides: 6 cm, 8 cm, 10 cm\n\n**Example:** A photograph is 10 cm by 15 cm. It is reduced by scale factor $\\frac{1}{2}$.\n- New size: 5 cm by 7,5 cm\n\n**SA Context:** A map of South Africa at scale $1:2\\,000\\,000$ means 1 cm on the map represents 20 km in real life.'),
  q(10, 'A rectangle 6 cm by 4 cm is enlarged by scale factor 3. What is the new length?',
    ['18 cm', '9 cm', '12 cm', '24 cm'], 0,
    'New length $= 6 \\times 3 = 18$ cm.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 14: Area and Perimeter of 2D Shapes (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Area and Perimeter ---
blockNum = 0;
const ch14_lesson1 = [
  t(1, '## Area and Perimeter of 2D Shapes\n\n**Perimeter** is the total distance around a shape.\n**Area** is the amount of surface a shape covers.\n\n### Formulae\n\n| Shape | Perimeter | Area |\n|-------|-----------|------|\n| Square (side $s$) | $P = 4s$ | $A = s^2$ |\n| Rectangle ($l \\times b$) | $P = 2(l + b)$ | $A = l \\times b$ |\n| Triangle (base $b$, height $h$) | $P = a + b + c$ | $A = \\frac{1}{2}bh$ |\n\n**Important:** The height of a triangle must be **perpendicular** to the base.\n\n### Units\n\n- Perimeter is measured in **linear units** (mm, cm, m, km).\n- Area is measured in **square units** (mm$^2$, cm$^2$, m$^2$).'),
  t(2, '### Worked Examples\n\n**Example 1:** A rectangular classroom is 8 m long and 6 m wide.\n- $P = 2(8 + 6) = 2(14) = 28$ m\n- $A = 8 \\times 6 = 48$ m$^2$\n\n**Example 2:** A square garden has a side of 5 m.\n- $P = 4 \\times 5 = 20$ m\n- $A = 5^2 = 25$ m$^2$\n\n**Example 3:** A triangular road sign has a base of 60 cm and a height of 50 cm.\n- $A = \\frac{1}{2} \\times 60 \\times 50 = 1\\,500$ cm$^2$\n\n**Example 4 (Finding a side from area):** A rectangle has area 56 cm$^2$ and length 8 cm. Find the breadth.\n- $56 = 8 \\times b$, so $b = 7$ cm.\n\n**Example 5 (Irregular polygon):** Calculate the perimeter of an L-shaped figure by adding all outer side lengths.'),
  q(3, 'A triangle has a base of 12 cm and a height of 9 cm. What is its area?',
    ['54 cm$^2$', '108 cm$^2$', '21 cm$^2$', '27 cm$^2$'], 0,
    '$A = \\frac{1}{2} \\times 12 \\times 9 = \\frac{108}{2} = 54$ cm$^2$.'),
  t(4, '### Converting Units of Area\n\n| Conversion | Factor |\n|------------|--------|\n| cm$^2$ → mm$^2$ | $\\times 100$ |\n| mm$^2$ → cm$^2$ | $\\div 100$ |\n| m$^2$ → cm$^2$ | $\\times 10\\,000$ |\n| cm$^2$ → m$^2$ | $\\div 10\\,000$ |\n\n**Why?** $1$ cm $= 10$ mm, so $1$ cm$^2 = 10 \\times 10 = 100$ mm$^2$.\n$1$ m $= 100$ cm, so $1$ m$^2 = 100 \\times 100 = 10\\,000$ cm$^2$.\n\n**Example:** Convert 3 m$^2$ to cm$^2$.\n$3 \\times 10\\,000 = 30\\,000$ cm$^2$\n\n**Example:** Convert 450 mm$^2$ to cm$^2$.\n$450 \\div 100 = 4{,}5$ cm$^2$'),
  q(5, 'Convert 2,5 m$^2$ to cm$^2$.',
    ['25 000 cm$^2$', '250 cm$^2$', '2 500 cm$^2$', '250 000 cm$^2$'], 0,
    '$2{,}5 \\times 10\\,000 = 25\\,000$ cm$^2$.'),
  fb(6, 'The formula for the area of a triangle is $A = \\frac{1}{2} \\times$ base $\\times$ ___. To convert m$^2$ to cm$^2$, multiply by ___.',
    ['height', '10 000'],
    '$A = \\frac{1}{2}bh$ and $1$ m$^2 = 10\\,000$ cm$^2$.'),
  t(7, '### Solving Problems\n\n**Example 1:** A rectangular room in Polokwane is 5 m by 4 m. Tiles cost R95 per m$^2$. Find the total cost.\n- $A = 5 \\times 4 = 20$ m$^2$\n- Cost $= 20 \\times R95 = R1\\,900$\n\n**Example 2:** A farmer wants to fence a rectangular field 120 m by 80 m. Fencing costs R45 per metre.\n- $P = 2(120 + 80) = 400$ m\n- Cost $= 400 \\times R45 = R18\\,000$\n\n**Example 3:** A rectangular piece of land has a perimeter of 60 m. The length is 5 m more than the breadth. Find the dimensions.\n- Let breadth $= x$, length $= x + 5$\n- $2(x + x + 5) = 60$\n- $2(2x + 5) = 60$\n- $4x + 10 = 60$, so $4x = 50$ and $x = 12{,}5$\n- Breadth $= 12{,}5$ m, length $= 17{,}5$ m'),
  q(8, 'Skirting board is fitted around a room 5 m by 3 m. The room has one door 0,9 m wide. How much skirting board is needed?',
    ['15,1 m', '16 m', '14 m', '15 m'], 0,
    '$P = 2(5 + 3) = 16$ m. Subtract door: $16 - 0{,}9 = 15{,}1$ m.'),
  t(9, '### Perimeter and Area of Composite Shapes\n\nA **composite shape** is made up of simpler shapes.\n\n**Strategy:**\n1. Break the shape into rectangles and/or triangles.\n2. Calculate each area separately.\n3. Add them together.\n\n**Example:** An L-shaped room consists of two rectangles:\n- Rectangle 1: 6 m $\\times$ 4 m $= 24$ m$^2$\n- Rectangle 2: 3 m $\\times$ 2 m $= 6$ m$^2$\n- Total area $= 24 + 6 = 30$ m$^2$\n\n**For perimeter:** Add all the outer edges. Be careful to include every side.\n\n**SA Context:** Many houses in South African townships have L-shaped or T-shaped floor plans. Knowing how to calculate their area helps when buying tiles or carpet.'),
  q(10, 'An L-shaped figure consists of a 10 cm $\\times$ 6 cm rectangle with a 4 cm $\\times$ 3 cm rectangle cut from one corner. What is its area?',
    ['48 cm$^2$', '60 cm$^2$', '72 cm$^2$', '42 cm$^2$'], 0,
    'Full rectangle $= 10 \\times 6 = 60$ cm$^2$. Cut-out $= 4 \\times 3 = 12$ cm$^2$. Remaining $= 60 - 12 = 48$ cm$^2$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 15: Surface Area and Volume of 3D Objects (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Surface Area and Volume ---
blockNum = 0;
const ch15_lesson1 = [
  t(1, '## Surface Area and Volume of 3D Objects\n\n**Surface area** (SA) is the total area of all the faces of a 3D object.\n**Volume** (V) is the amount of space inside a 3D object.\n**Capacity** is the volume of liquid a container can hold.\n\n### Key Conversions\n\n$$1 \\text{ cm}^3 = 1 \\text{ ml} \\qquad 1\\,000 \\text{ cm}^3 = 1 \\text{ litre} \\qquad 1 \\text{ m}^3 = 1\\,000 \\text{ litres}$$\n\n### Formulae\n\n| Solid | Surface Area | Volume |\n|-------|-------------|--------|\n| Cube (side $s$) | $SA = 6s^2$ | $V = s^3$ |\n| Rectangular prism ($l \\times b \\times h$) | $SA = 2(lb + bh + lh)$ | $V = l \\times b \\times h$ |'),
  t(2, '### Worked Examples — Cubes and Rectangular Prisms\n\n**Example 1:** A cube has a side length of 3 cm.\n- $SA = 6(3)^2 = 6 \\times 9 = 54$ cm$^2$\n- $V = (3)^3 = 27$ cm$^3$\n\n**Example 2:** A cereal box is 25 cm $\\times$ 8 cm $\\times$ 30 cm.\n- $V = 25 \\times 8 \\times 30 = 6\\,000$ cm$^3$\n- Capacity $= 6\\,000 \\div 1\\,000 = 6$ litres\n\n**Example 3:** A fish tank is 50 cm $\\times$ 30 cm $\\times$ 35 cm.\n- $V = 50 \\times 30 \\times 35 = 52\\,500$ cm$^3$\n- $SA = 2(50 \\times 30 + 30 \\times 35 + 50 \\times 35) = 2(1\\,500 + 1\\,050 + 1\\,750) = 2(4\\,300) = 8\\,600$ cm$^2$\n- Capacity $= 52\\,500 \\div 1\\,000 = 52{,}5$ litres'),
  q(3, 'A cube has a side of 4 cm. What is its volume?',
    ['64 cm$^3$', '16 cm$^2$', '96 cm$^2$', '24 cm$^3$'], 0,
    '$V = s^3 = 4^3 = 64$ cm$^3$.'),
  t(4, '### Understanding the Relationship Between SA and Volume\n\nSurface area and volume measure different things:\n- **Surface area** tells you how much material is needed to cover the outside (e.g. wrapping paper).\n- **Volume** tells you how much space is inside (e.g. how much water a tank holds).\n\n**Example:** Two containers both hold 1 000 cm$^3$ but can have very different shapes and surface areas.\n\nContainer A: $10 \\times 10 \\times 10$ → $SA = 600$ cm$^2$\nContainer B: $50 \\times 10 \\times 2$ → $SA = 2(500 + 20 + 100) = 1\\,240$ cm$^2$\n\nSame volume, but Container B has more than double the surface area!\n\n**SA Context:** When storing water, a cube-shaped tank uses the least material for a given volume.'),
  q(5, 'A rectangular prism has $V = 360$ cm$^3$. Its length is 10 cm and breadth is 6 cm. What is its height?',
    ['6 cm', '36 cm', '4 cm', '12 cm'], 0,
    '$V = l \\times b \\times h$. $360 = 10 \\times 6 \\times h = 60h$. $h = 6$ cm.'),
  fb(6, 'The volume of a cube with side $s$ is $V = ___$. The conversion $1$ litre $= ___$ cm$^3$.',
    ['s cubed', '1 000'],
    '$V = s^3$ for a cube. $1$ litre $= 1\\,000$ cm$^3$.'),
  t(7, '### Conversions Between Volume and Capacity\n\n| Conversion | Factor |\n|------------|--------|\n| cm$^3$ → ml | $1$ cm$^3$ $= 1$ ml |\n| cm$^3$ → litres | $\\div 1\\,000$ |\n| m$^3$ → litres | $\\times 1\\,000$ |\n| m$^3$ → kl | $1$ m$^3$ $= 1$ kl |\n\n**Example:** A swimming pool is 10 m $\\times$ 5 m $\\times$ 2 m.\n- $V = 10 \\times 5 \\times 2 = 100$ m$^3$\n- Capacity $= 100 \\times 1\\,000 = 100\\,000$ litres $= 100$ kl\n\n**Example:** How many 250 ml cups can be filled from a 5-litre container?\n$5\\,000 \\div 250 = 20$ cups\n\n**SA Context:** JoJo water tanks are common in South Africa. A 5 000-litre tank has a capacity of $5$ m$^3$.'),
  q(8, 'A tank holds 2 400 litres. Convert this to m$^3$.',
    ['2,4 m$^3$', '24 m$^3$', '0,24 m$^3$', '240 m$^3$'], 0,
    '$2\\,400 \\div 1\\,000 = 2{,}4$ m$^3$.'),
  t(9, '### Solving Problems\n\n**Example 1:** How many small cubes (side 2 cm) can fit inside a box 10 cm $\\times$ 8 cm $\\times$ 6 cm?\n- Volume of box $= 480$ cm$^3$\n- Volume of small cube $= 8$ cm$^3$\n- Number of cubes $= 480 \\div 8 = 60$\n\n**Example 2:** A rectangular container is 30 cm $\\times$ 20 cm $\\times$ 15 cm. How much water (in litres) does it hold?\n- $V = 30 \\times 20 \\times 15 = 9\\,000$ cm$^3$\n- $9\\,000 \\div 1\\,000 = 9$ litres\n\n**Example 3:** A classroom wall is 6 m long and 3 m high. It needs to be painted. One tin of paint covers 10 m$^2$. How many tins are needed?\n- Wall area $= 6 \\times 3 = 18$ m$^2$\n- Tins needed $= 18 \\div 10 = 1{,}8$ → buy 2 tins (round up)'),
  q(10, 'A rectangular box is 12 cm $\\times$ 8 cm $\\times$ 5 cm. What is its surface area?',
    ['392 cm$^2$', '480 cm$^3$', '196 cm$^2$', '292 cm$^2$'], 0,
    '$SA = 2(12 \\times 8 + 8 \\times 5 + 12 \\times 5) = 2(96 + 40 + 60) = 2(196) = 392$ cm$^2$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 16: Data Handling (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Collecting, Organising, and Summarising Data ---
blockNum = 0;
const ch16_lesson1 = [
  t(1, '## Collecting Data\n\nThe **data-handling cycle**:\n1. **Pose** a question about a social, economic, or environmental issue.\n2. **Collect** data from appropriate sources.\n3. **Organise** data using tables.\n4. **Summarise** data using statistics.\n5. **Represent** data using graphs.\n6. **Interpret** and **report** findings.\n\n### Posing Questions\n\nQuestions should be about real issues in your community.\n\n**Examples:**\n- "How do learners in our school travel to school?"\n- "What is the favourite sport among Grade 7 learners?"\n- "How many hours of electricity load-shedding did our community have last week?"\n\n### Types of Data\n\n- **Categorical (qualitative):** Describes qualities (e.g. favourite colour, transport type).\n- **Numerical (quantitative):** Measured or counted (e.g. height, test marks).'),
  t(2, '### Organising Data\n\n**Tally marks and frequency tables:**\n\n| Transport | Tally | Frequency |\n|-----------|-------|-----------|\n| Walk | IIII IIII II | 12 |\n| Taxi | IIII III | 8 |\n| Bus | IIII | 5 |\n| Car | IIII I | 6 |\n| Bicycle | III | 3 |\n\n**Stem-and-leaf display:**\n\nTest marks: $45, 52, 63, 45, 71, 52, 63, 45, 80$\n\n| Stem | Leaf |\n|------|------|\n| 4 | 5, 5, 5 |\n| 5 | 2, 2 |\n| 6 | 3, 3 |\n| 7 | 1 |\n| 8 | 0 |\n\nThe stem-and-leaf display preserves each data value while showing the shape of the distribution.\n\n**Grouping data into intervals:**\n\n| Interval | Frequency |\n|----------|-----------|\n| 40 – 49 | 3 |\n| 50 – 59 | 2 |\n| 60 – 69 | 2 |\n| 70 – 79 | 1 |\n| 80 – 89 | 1 |'),
  q(3, 'In the transport data above, what is the most common way learners travel to school?',
    ['Walk', 'Taxi', 'Bus', 'Car'], 0,
    'Walking has the highest frequency (12), so it is the most common.'),
  t(4, '### Measures of Central Tendency\n\n| Measure | How to Find It |\n|---------|----------------|\n| **Mean** | $\\bar{x} = \\frac{\\text{sum of all values}}{\\text{number of values}}$ |\n| **Median** | Middle value when data is ordered |\n| **Mode** | Most frequently occurring value |\n\n**Example:** Data: $4, 7, 5, 9, 7, 3, 7$\n\n- **Ordered:** $3, 4, 5, 7, 7, 7, 9$\n- **Mean:** $\\frac{3+4+5+7+7+7+9}{7} = \\frac{42}{7} = 6$\n- **Median:** 7 (the 4th value out of 7)\n- **Mode:** 7 (appears 3 times)\n\n**Even number of values:** Median is the average of the two middle values.\n\nData: $3, 5, 8, 12$ → Median $= \\frac{5 + 8}{2} = 6{,}5$'),
  q(5, 'Find the median of: $12, 18, 15, 22, 20$.',
    ['18', '15', '20', '17'], 0,
    'Ordered: $12, 15, 18, 20, 22$. Middle value (3rd of 5) is $18$.'),
  fb(6, 'The ___ is the most frequently occurring value. The ___ is the sum of values divided by the number of values.',
    ['mode', 'mean'],
    'Mode = most common value. Mean = total ÷ count.'),
  t(7, '### Range and Extremes\n\n**Range** $=$ maximum value $-$ minimum value\n\nThe range shows how **spread out** the data is.\n\n**Example:** Data: $15, 22, 18, 30, 12$\n- Maximum $= 30$, Minimum $= 12$\n- Range $= 30 - 12 = 18$\n\n**Effect of outliers:** A very high or very low value (outlier) affects the **mean** but not the **median**.\n\n**Example:** Weekly pocket money of 5 learners in Soweto:\n$R20, R25, R30, R25, R200$\n\n- Mean $= \\frac{300}{5} = R60$ (pulled up by R200 outlier)\n- Median $= R25$ (not affected)\n\nThe median is more **representative** of the typical pocket money.'),
  q(8, 'The marks of 6 learners are: 45, 50, 55, 60, 65, 70. What is the range?',
    ['25', '55', '70', '45'], 0,
    'Range $= 70 - 45 = 25$.'),
  t(9, '### Representing Data with Graphs\n\n| Graph | Best For |\n|-------|----------|\n| **Bar graph** | Comparing categories |\n| **Double bar graph** | Comparing two groups |\n| **Histogram** | Grouped continuous data (no gaps between bars) |\n| **Pie chart** | Showing parts of a whole |\n| **Broken-line graph** | Showing change over time |\n\n**Bar graphs** have gaps between bars (discrete categories).\n**Histograms** have NO gaps (continuous grouped data).\n\n**SA Context:** Stats SA uses bar graphs and pie charts to show census data, such as the languages spoken in each province.\n\n### Interpreting Data\n\nCritically read and analyse data presented in graphs. Ask:\n- What does the graph show?\n- What is the source?\n- Are there any patterns or trends?\n- Could there be bias?'),
  q(10, 'Which graph is best for showing the percentage of learners who prefer each sport?',
    ['Pie chart', 'Histogram', 'Line graph', 'Stem-and-leaf display'], 0,
    'A pie chart shows parts of a whole — perfect for showing percentages across categories.'),
];

// --- Lesson 2: Probability ---
blockNum = 0;
const ch16_lesson2 = [
  t(1, '## Probability\n\nProbability measures how **likely** an event is to happen.\n\n$$P(\\text{event}) = \\frac{\\text{number of favourable outcomes}}{\\text{total number of possible outcomes}}$$\n\n### The Probability Scale\n\n$$0 \\leq P(\\text{event}) \\leq 1$$\n\n| Probability | Meaning | Example |\n|------------|---------|--------|\n| $P = 0$ | Impossible | Rolling a 7 on a standard die |\n| $0 < P < 0{,}5$ | Unlikely | Rolling a 6 |\n| $P = 0{,}5$ | Even chance | Getting heads on a fair coin |\n| $0{,}5 < P < 1$ | Likely | Rolling less than 5 |\n| $P = 1$ | Certain | Rolling less than 7 |\n\nProbability can be expressed as a **fraction**, **decimal**, or **percentage**.'),
  t(2, '### Equally Likely Outcomes\n\n**Dice:** A fair die has 6 equally likely outcomes: $\\{1, 2, 3, 4, 5, 6\\}$.\n\n- $P(3) = \\frac{1}{6}$\n- $P(\\text{even}) = \\frac{3}{6} = \\frac{1}{2}$\n- $P(\\text{greater than 4}) = \\frac{2}{6} = \\frac{1}{3}$\n\n**Coins:** A fair coin: $P(\\text{heads}) = \\frac{1}{2}$.\n\n**Marbles:** A bag has 5 red, 3 blue, and 2 green marbles.\n- Total $= 10$\n- $P(\\text{red}) = \\frac{5}{10} = \\frac{1}{2}$\n- $P(\\text{blue}) = \\frac{3}{10}$\n- $P(\\text{green}) = \\frac{2}{10} = \\frac{1}{5}$\n- $P(\\text{not green}) = 1 - \\frac{1}{5} = \\frac{4}{5}$'),
  q(3, 'A bag has 4 red and 6 blue balls. What is $P$(red)?',
    ['$\\frac{2}{5}$', '$\\frac{3}{5}$', '$\\frac{4}{6}$', '$\\frac{1}{4}$'], 0,
    'Total $= 10$. $P(\\text{red}) = \\frac{4}{10} = \\frac{2}{5}$.'),
  t(4, '### Listing Outcomes\n\nList all possible outcomes systematically.\n\n**Two coins tossed:**\n$\\{HH, HT, TH, TT\\}$ — 4 outcomes.\n\n$P(\\text{two heads}) = \\frac{1}{4}$\n$P(\\text{at least one head}) = \\frac{3}{4}$\n\n**Spinning a spinner:** A spinner with 4 equal sections (red, blue, green, yellow).\n- $P(\\text{red}) = \\frac{1}{4}$\n- $P(\\text{not blue}) = \\frac{3}{4}$\n\n**Key idea:** The sum of the probabilities of all possible outcomes is always $1$.'),
  q(5, 'Two coins are tossed. What is $P$(at least one tail)?',
    ['$\\frac{3}{4}$', '$\\frac{1}{4}$', '$\\frac{1}{2}$', '$1$'], 0,
    'Outcomes: HH, HT, TH, TT. At least one tail: HT, TH, TT = 3. $P = \\frac{3}{4}$.'),
  fb(6, 'The probability of a certain event is ___. The probability of an impossible event is ___.',
    ['1', '0'],
    '$P(\\text{certain}) = 1$ and $P(\\text{impossible}) = 0$.'),
  t(7, '### Relative Frequency (Experimental Probability)\n\n**Theoretical probability:** What we expect based on the situation (e.g. $P(H) = \\frac{1}{2}$ for a fair coin).\n\n**Relative frequency:** Based on actual experiments.\n$$\\text{Relative frequency} = \\frac{\\text{number of times event occurred}}{\\text{total number of trials}}$$\n\n**Example:** Bongani rolls a die 30 times. He gets a 6 exactly 4 times.\n- Relative frequency of 6 $= \\frac{4}{30} \\approx 0{,}13$\n- Theoretical probability $= \\frac{1}{6} \\approx 0{,}17$\n\nThe more times you repeat the experiment, the closer the relative frequency gets to the theoretical probability.'),
  q(8, 'A coin is flipped 50 times and lands on heads 28 times. What is the relative frequency of heads?',
    ['$\\frac{14}{25}$', '$\\frac{1}{2}$', '$\\frac{28}{50}$', 'Both A and C'], 3,
    '$\\frac{28}{50} = \\frac{14}{25} = 0{,}56$. Both A and C are correct (they are equivalent).'),
  t(9, '### Predicting Outcomes\n\nUse probability to predict how many times an event should occur.\n\n$$\\text{Expected frequency} = P(\\text{event}) \\times \\text{number of trials}$$\n\n**Example:** A die is rolled 60 times. How many times do we expect a 4?\n$$\\frac{1}{6} \\times 60 = 10 \\text{ times}$$\n\n**Example:** A spinner has 5 equal sections: 2 red, 2 blue, 1 green. If spun 100 times:\n- Expected red: $\\frac{2}{5} \\times 100 = 40$ times\n- Expected blue: $\\frac{2}{5} \\times 100 = 40$ times\n- Expected green: $\\frac{1}{5} \\times 100 = 20$ times\n\n**SA Context:** The South African National Lottery uses random draws. Each number has an equal chance of being selected.'),
  q(10, 'A spinner has 3 equal sections. If spun 90 times, how many times do you expect each section?',
    ['30 times', '45 times', '90 times', '15 times'], 0,
    '$P(\\text{any section}) = \\frac{1}{3}$. Expected $= \\frac{1}{3} \\times 90 = 30$ times.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// DB INSERTION
// ═══════════════════════════════════════════════════════════════════════════════

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

  // Find or create Mathematics subject
  let SUBJECT_ID;
  let subjectDoc = await db.collection('subjects').findOne({ name: /Mathematics$/i });
  if (!subjectDoc) {
    const result = await db.collection('subjects').insertOne({
      name: 'Mathematics',
      code: 'MAT',
      schoolId: SCHOOL_ID,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Mathematics subject:', String(SUBJECT_ID));
  } else {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Mathematics subject:', String(SUBJECT_ID));
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
    tags: ['mathematics', 'grade-7', 'caps'],
    aiModel: '',
    aiPrompt: '',
    downloads: 0,
    rating: 0,
    ratingCount: 0,
    difficulty: 2,
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
      title: 'Chapter 1: Whole Numbers',
      description: 'Properties of whole numbers, ordering, calculation techniques, multiples, factors, prime factorisation, HCF, LCM, BODMAS, ratio, rate, percentage, profit and loss, budgets, and simple interest.',
      order: 1,
      lessons: [
        { title: 'Properties and Operations with Whole Numbers', description: 'Ordering and comparing, properties of operations, calculation techniques, multiples and factors, prime factorisation, HCF, LCM, and BODMAS.', blocks: ch1_lesson1, term: 1 },
        { title: 'Solving Problems with Whole Numbers', description: 'Ratio, rate, percentage increase and decrease, profit and loss, discount, budgets, accounts, and simple interest.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Common Fractions',
      description: 'Ordering, comparing, and simplifying common fractions. Addition, subtraction, multiplication and division of fractions and mixed numbers. Percentages and problem solving.',
      order: 2,
      lessons: [
        { title: 'Operations with Common Fractions', description: 'Types of fractions, equivalent fractions, simplifying, four operations with fractions and mixed numbers, percentages, and word problems.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Decimal Fractions',
      description: 'Ordering, rounding, addition, subtraction, multiplication and division of decimal fractions. Equivalent forms of fractions, decimals and percentages.',
      order: 3,
      lessons: [
        { title: 'Ordering and Operations with Decimal Fractions', description: 'Place value, ordering and comparing, rounding, four operations, multiplying and dividing by powers of 10, equivalent forms, and problem solving.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Exponents',
      description: 'Exponential form, squares and cubes, square roots and cube roots, laws of exponents with natural number exponents, and calculations in exponential form.',
      order: 4,
      lessons: [
        { title: 'Working with Exponents', description: 'Exponential notation, squares, cubes, square roots, cube roots, laws of exponents (product, quotient, power of a power, power of a product), and calculations.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Integers',
      description: 'Counting, ordering, and comparing integers. Addition and subtraction of integers using number lines and rules. Real-world contexts involving integers.',
      order: 5,
      lessons: [
        { title: 'Counting and Operations with Integers', description: 'Integer number line, counting forwards and backwards, ordering and comparing, addition and subtraction rules, properties, and real-world applications.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Numeric and Geometric Patterns',
      description: 'Investigating and extending numeric patterns with constant differences and constant ratios. Geometric patterns with matchsticks and dots. Describing rules in words and formulae.',
      order: 6,
      lessons: [
        { title: 'Investigating and Extending Patterns', description: 'Constant difference and constant ratio patterns, finding rules from tables, geometric patterns, describing patterns verbally and with formulae.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Functions and Relationships',
      description: 'Input and output values, flow diagrams, tables of values, formulae, equivalent forms, and verbal descriptions of relationships.',
      order: 7,
      lessons: [
        { title: 'Input-Output Rules and Flow Diagrams', description: 'Functions as input-output machines, flow diagrams, finding rules from tables, equivalent forms, verbal descriptions, and number sentences.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Algebraic Expressions',
      description: 'Algebraic language, variables, coefficients, constants, like terms, adding and subtracting like terms, expanding brackets, and substitution.',
      order: 8,
      lessons: [
        { title: 'Introduction to Algebraic Language', description: 'Variables, terms, coefficients, constants, like terms, adding and subtracting like terms, expanding using distributive property, and substitution.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: Algebraic Equations',
      description: 'Solving simple linear equations by inspection and inverse operations. Equations with brackets, two-step equations, and word problems.',
      order: 9,
      lessons: [
        { title: 'Solving Simple Equations', description: 'Equations vs expressions, solving by inspection, inverse operations, two-step equations, equations with brackets, word problems, and checking solutions.', blocks: ch9_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 10: Graphs',
      description: 'Interpreting global graphs, features of graphs (increasing, decreasing, constant, maximum, minimum), drawing graphs from tables and equations.',
      order: 10,
      lessons: [
        { title: 'Interpreting and Drawing Graphs', description: 'Features of graphs, reading distance-time and temperature graphs, drawing graphs from tables, discrete vs continuous data, and drawing from equations.', blocks: ch10_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 11: Construction of Geometric Figures',
      description: 'Measuring and classifying angles, geometric definitions (line segment, ray, parallel, perpendicular), circle terminology, and constructing angles, lines and triangles.',
      order: 11,
      lessons: [
        { title: 'Measuring Angles and Constructions', description: 'Types of angles, using a protractor, straight lines vocabulary, parts of a circle, constructing angles, perpendicular and parallel lines, and constructing triangles.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Geometry of 2D Shapes',
      description: 'Classifying triangles by sides and angles, angle sum property, properties of quadrilaterals, similar and congruent shapes, and solving geometric problems.',
      order: 12,
      lessons: [
        { title: 'Triangles and Quadrilaterals', description: 'Classification of triangles, angle sum property, quadrilateral properties, similar and congruent figures, and solving angle problems.', blocks: ch12_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 13: Transformation Geometry',
      description: 'Translations, reflections, and rotations on squared paper and the Cartesian plane. Lines of symmetry, rotational symmetry, enlargements and reductions.',
      order: 13,
      lessons: [
        { title: 'Translations, Reflections, and Rotations', description: 'Translation (sliding), reflection (flipping), rotation (turning), lines of symmetry, rotational symmetry, enlargements and reductions, scale factor.', blocks: ch13_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 14: Area and Perimeter of 2D Shapes',
      description: 'Perimeter and area of squares, rectangles, and triangles. Unit conversions, composite shapes, and real-world problem solving.',
      order: 14,
      lessons: [
        { title: 'Area and Perimeter', description: 'Formulae for squares, rectangles, and triangles, unit conversions for area, composite shapes, and practical applications.', blocks: ch14_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 15: Surface Area and Volume of 3D Objects',
      description: 'Surface area and volume of cubes and rectangular prisms. Volume-capacity conversions and real-world problem solving.',
      order: 15,
      lessons: [
        { title: 'Surface Area and Volume', description: 'Cubes and rectangular prisms, surface area formulae, volume formulae, volume-capacity conversions, and practical applications.', blocks: ch15_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 16: Data Handling and Probability',
      description: 'Collecting, organising, summarising, and representing data. Measures of central tendency and dispersion. Basic probability, relative frequency, and predicting outcomes.',
      order: 16,
      lessons: [
        { title: 'Collecting, Organising, and Summarising Data', description: 'Data-handling cycle, frequency tables, stem-and-leaf displays, mean, median, mode, range, bar graphs, histograms, pie charts, and data interpretation.', blocks: ch16_lesson1, term: 4 },
        { title: 'Probability', description: 'Probability scale, equally likely outcomes, listing outcomes, relative frequency, experimental vs theoretical probability, and predicting outcomes.', blocks: ch16_lesson2, term: 4 },
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
    title: 'Grade 7 Mathematics \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Whole Numbers, Common Fractions, Decimal Fractions, Exponents, Integers, Numeric and Geometric Patterns, Functions and Relationships, Algebraic Expressions, Algebraic Equations, Graphs, Construction of Geometric Figures, Geometry of 2D Shapes, Transformation Geometry, Area and Perimeter, Surface Area and Volume, Data Handling, and Probability for the Grade 7 Mathematics curriculum.',
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
  console.log('  TEXTBOOK: Grade 7 Mathematics');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
