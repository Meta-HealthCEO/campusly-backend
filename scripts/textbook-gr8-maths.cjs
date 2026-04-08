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
  t(1, '## Properties of Whole Numbers\n\nWhole numbers are the set $\\mathbb{N}_0 = \\{0, 1, 2, 3, 4, \\ldots\\}$. In Grade 8 we revise and extend our understanding of these numbers.\n\n### Properties of Operations\n\n| Property | Addition | Multiplication |\n|----------|----------|----------------|\n| Commutative | $a + b = b + a$ | $a \\times b = b \\times a$ |\n| Associative | $(a + b) + c = a + (b + c)$ | $(a \\times b) \\times c = a \\times (b \\times c)$ |\n| Distributive | $a(b + c) = ab + ac$ | |\n| Identity | $a + 0 = a$ | $a \\times 1 = a$ |\n\nThe number $0$ is the **additive identity** and $1$ is the **multiplicative identity**.\n\n**Division by zero is undefined.** We can never divide any number by $0$.'),
  t(2, '### Multiples and Factors\n\nA **factor** of a number divides into it exactly with no remainder. A **multiple** of a number is the product of that number and a whole number.\n\n**Example:** Factors of 24: $\\{1, 2, 3, 4, 6, 8, 12, 24\\}$\nMultiples of 6: $\\{6, 12, 18, 24, 30, \\ldots\\}$\n\n### Prime and Composite Numbers\n\n- A **prime number** has exactly two factors: 1 and itself. E.g. 2, 3, 5, 7, 11, 13, ...\n- A **composite number** has more than two factors. E.g. 4, 6, 8, 9, 10, ...\n- The number **1** is neither prime nor composite.\n- The number **2** is the only even prime number.\n\n### Prime Factorisation\n\nWrite a number as a product of its prime factors.\n\n**Example:** $120 = 2^3 \\times 3 \\times 5$\n\nUse a factor tree or repeated division to find the prime factors.'),
  q(3, 'Which of the following is a prime number?',
    ['37', '39', '33', '35'], 0,
    '$37$ has exactly two factors: 1 and 37. $39 = 3 \\times 13$, $33 = 3 \\times 11$, $35 = 5 \\times 7$.'),
  t(4, '### Highest Common Factor (HCF) and Lowest Common Multiple (LCM)\n\n**HCF** — the largest number that divides into two or more numbers exactly.\n**LCM** — the smallest positive number that is a multiple of two or more numbers.\n\n**Method:** Use prime factorisation.\n- For **HCF**: take the **lowest** power of each common prime factor.\n- For **LCM**: take the **highest** power of every prime factor.\n\n**Example:** Find the HCF and LCM of 36 and 48.\n- $36 = 2^2 \\times 3^2$\n- $48 = 2^4 \\times 3$\n- HCF $= 2^2 \\times 3 = 12$\n- LCM $= 2^4 \\times 3^2 = 144$\n\n**Quick check:** HCF $\\times$ LCM $= 12 \\times 144 = 1\\,728 = 36 \\times 48$ ✓'),
  q(5, 'Find the HCF of 18 and 24.',
    ['6', '12', '3', '36'], 0,
    '$18 = 2 \\times 3^2$ and $24 = 2^3 \\times 3$. HCF $= 2 \\times 3 = 6$.',
    ['Use prime factorisation and take the lowest power of each common prime.']),
  fb(6, 'The HCF of two numbers uses the ___ power of each common prime factor. The LCM uses the ___ power of every prime factor.',
    ['lowest', 'highest'],
    'HCF = lowest powers (gives the greatest factor). LCM = highest powers (gives the smallest multiple).'),
  t(7, '### Order of Operations (BODMAS)\n\nWhen evaluating expressions with multiple operations, follow the correct order:\n\n1. **B**rackets\n2. **O**rders (exponents and roots)\n3. **D**ivision and **M**ultiplication (left to right)\n4. **A**ddition and **S**ubtraction (left to right)\n\n**Example 1:** $5 + 3 \\times 4 = 5 + 12 = 17$ (NOT $32$)\n\n**Example 2:** $(8 + 2) \\times 3 - 4 = 10 \\times 3 - 4 = 30 - 4 = 26$\n\n**Example 3:** $24 \\div 6 + 2 \\times 5 = 4 + 10 = 14$\n\n**Common mistake:** Doing addition before multiplication. Always multiply/divide before you add/subtract, unless brackets say otherwise.'),
  q(8, 'Calculate: $12 + 8 \\div 4 \\times 3$.',
    ['18', '15', '9', '24'], 0,
    'Division and multiplication first (left to right): $8 \\div 4 = 2$, then $2 \\times 3 = 6$. Finally $12 + 6 = 18$.'),
  t(9, '### Solving Problems with Whole Numbers\n\n**Example 1 (Ratio):** Sipho and Thandi share R240 in the ratio $3:5$. How much does each get?\n- Total parts: $3 + 5 = 8$\n- Sipho: $\\frac{3}{8} \\times R240 = R90$\n- Thandi: $\\frac{5}{8} \\times R240 = R150$\n\n**Example 2 (Percentage):** A school in Pretoria has 850 learners. 60% are girls. How many boys are there?\n- Girls: $0{,}60 \\times 850 = 510$\n- Boys: $850 - 510 = 340$\n\n**Example 3 (Profit and loss):** A trader buys mangoes at R5 each and sells them at R8 each.\n- Profit per mango: $R8 - R5 = R3$\n- Profit percentage: $\\frac{3}{5} \\times 100 = 60\\%$'),
  q(10, 'Three friends share R600 in the ratio $2:3:5$. What is the largest share?',
    ['R300', 'R180', 'R120', 'R200'], 0,
    'Total parts $= 2 + 3 + 5 = 10$. Largest share $= \\frac{5}{10} \\times R600 = R300$.'),
];

// --- Lesson 2: Financial Problems with Whole Numbers ---
blockNum = 0;
const ch1_lesson2 = [
  t(1, '## Financial Mathematics with Whole Numbers\n\nMathematics is essential for managing money wisely. In this lesson we explore financial contexts involving percentages, VAT, profit, loss, and budgets.\n\n### Percentages Revision\n\nTo find a **percentage of a number**:\n$$\\text{Result} = \\frac{\\text{percentage}}{100} \\times \\text{amount}$$\n\n**Example:** What is 15% of R1 200?\n$$\\frac{15}{100} \\times 1\\,200 = R180$$\n\nTo find **what percentage** one number is of another:\n$$\\text{Percentage} = \\frac{\\text{part}}{\\text{whole}} \\times 100$$\n\n**Example:** A learner scored 72 out of 90 in a Mathematics test.\n$$\\frac{72}{90} \\times 100 = 80\\%$$'),
  t(2, '### Percentage Increase and Decrease\n\n**Percentage increase:**\n$$\\text{New value} = \\text{Original} \\times \\left(1 + \\frac{\\%}{100}\\right)$$\n\n**Percentage decrease:**\n$$\\text{New value} = \\text{Original} \\times \\left(1 - \\frac{\\%}{100}\\right)$$\n\n**Example (Increase):** A shop in Durban increases the price of a shirt from R250 by 12%.\n$$\\text{New price} = R250 \\times 1{,}12 = R280$$\n\n**Example (Decrease/Discount):** A pair of shoes costs R450. There is a 20% discount.\n$$\\text{Sale price} = R450 \\times 0{,}80 = R360$$\n$$\\text{Discount amount} = R450 - R360 = R90$$'),
  q(3, 'A jacket costs R800. It is marked down by 25%. What is the sale price?',
    ['R600', 'R200', 'R575', 'R750'], 0,
    'Discount $= R800 \\times 0{,}25 = R200$. Sale price $= R800 - R200 = R600$.'),
  t(4, '### VAT (Value Added Tax)\n\nIn South Africa, VAT is **15%**. It is added to the price of most goods and services.\n\n**Price including VAT:**\n$$\\text{Incl. price} = \\text{Excl. price} \\times 1{,}15$$\n\n**Price excluding VAT (if you know the inclusive price):**\n$$\\text{Excl. price} = \\frac{\\text{Incl. price}}{1{,}15}$$\n\n**Example:** A tablet costs R4 500 excluding VAT.\n- VAT $= R4\\,500 \\times 0{,}15 = R675$\n- Price incl. VAT $= R4\\,500 + R675 = R5\\,175$\n\n**Example:** A pair of sneakers costs R1 035 including VAT. What is the price before VAT?\n$$\\text{Excl. price} = \\frac{R1\\,035}{1{,}15} = R900$$'),
  q(5, 'A laptop costs R8 050 including 15% VAT. What is the price excluding VAT?',
    ['R7 000', 'R6 843', 'R6 900', 'R7 200'], 0,
    '$\\frac{R8\\,050}{1{,}15} = R7\\,000$.',
    ['Divide the inclusive price by 1,15 to remove VAT.']),
  fb(6, 'In South Africa, the current VAT rate is ___%. To add VAT to a price, multiply by ___.',
    ['15', '1,15'],
    'VAT is 15%. Multiply by 1,15 to get the VAT-inclusive price.'),
  t(7, '### Simple Interest (Introduction)\n\nSimple interest is calculated on the **original amount** (principal) only.\n\n$$I = P \\times i \\times n$$\n\nwhere:\n- $I$ = interest earned\n- $P$ = principal (amount invested or borrowed)\n- $i$ = interest rate per year (as a decimal)\n- $n$ = number of years\n\nTotal amount: $A = P + I = P(1 + in)$\n\n**Example:** Lindiwe saves R2 000 at 6% simple interest per year for 3 years.\n- Interest: $I = R2\\,000 \\times 0{,}06 \\times 3 = R360$\n- Total amount: $A = R2\\,000 + R360 = R2\\,360$'),
  q(8, 'Calculate the simple interest on R5 000 at 8% per year for 2 years.',
    ['R800', 'R5 800', 'R400', 'R1 000'], 0,
    '$I = P \\times i \\times n = R5\\,000 \\times 0{,}08 \\times 2 = R800$.'),
  t(9, '### Budgets and Accounts\n\nA **budget** is a plan for income and expenses over a period of time.\n\n**Example:** The Dlamini family has a monthly income of R18 000. Their expenses are:\n\n| Item | Amount | % of Income |\n|------|--------|------------|\n| Rent | R5 400 | 30% |\n| Food | R3 600 | 20% |\n| Transport | R2 700 | 15% |\n| School fees | R1 800 | 10% |\n| Electricity | R900 | 5% |\n| Savings | R1 800 | 10% |\n| Other | R1 800 | 10% |\n| **Total** | **R18 000** | **100%** |\n\nA balanced budget means income = expenses. If expenses exceed income, there is a **deficit**. If income exceeds expenses, there is a **surplus**.'),
  q(10, 'A family earns R22 000 per month and spends R19 500. What is their monthly surplus?',
    ['R2 500', 'R19 500', 'R41 500', 'R22 000'], 0,
    'Surplus $= R22\\,000 - R19\\,500 = R2\\,500$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Integers (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Operations with Integers ---
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Integers\n\nThe set of integers is $\\mathbb{Z} = \\{\\ldots, -3, -2, -1, 0, 1, 2, 3, \\ldots\\}$.\n\nIntegers include **positive numbers**, **negative numbers**, and **zero**.\n\n### Representing Integers on a Number Line\n\nOn a number line, negative numbers are to the left of zero and positive numbers to the right.\n\n$$\\ldots \\quad -4 \\quad -3 \\quad -2 \\quad -1 \\quad 0 \\quad 1 \\quad 2 \\quad 3 \\quad 4 \\quad \\ldots$$\n\n### Ordering and Comparing Integers\n\nOn the number line, numbers increase from left to right.\n- $-5 < -2$ (negative five is less than negative two)\n- $-3 < 0 < 4$\n- $|{-7}| = 7$ (the absolute value ignores the sign)'),
  t(2, '### Addition and Subtraction of Integers\n\n**Adding integers:**\n- Same signs: add the absolute values, keep the common sign.\n  - $(-4) + (-6) = -10$\n  - $(+3) + (+5) = +8$\n- Different signs: subtract the smaller absolute value from the larger, use the sign of the larger.\n  - $(-9) + (+4) = -5$\n  - $(+7) + (-3) = +4$\n\n**Subtracting integers:** Change the sign of the number being subtracted, then add.\n$$a - b = a + (-b)$$\n\n**Example:** $(-3) - (+5) = (-3) + (-5) = -8$\n\n**Example:** $(-2) - (-7) = (-2) + (+7) = +5$\n\n**Example:** $(+4) - (-6) = (+4) + (+6) = +10$'),
  q(3, 'Calculate: $(-8) + (+3)$.',
    ['$-5$', '$-11$', '$5$', '$11$'], 0,
    'Different signs: $8 - 3 = 5$. The larger absolute value is 8 (negative), so the answer is $-5$.'),
  t(4, '### Multiplication and Division of Integers\n\nThe sign rules for multiplication and division are the same:\n\n| Operation | Result |\n|-----------|--------|\n| $(+) \\times (+)$ | $+$ |\n| $(-) \\times (-)$ | $+$ |\n| $(+) \\times (-)$ | $-$ |\n| $(-) \\times (+)$ | $-$ |\n\n**Remember:** Same signs give a **positive** result. Different signs give a **negative** result.\n\n**Examples:**\n- $(-4) \\times (-5) = +20$\n- $(+6) \\times (-3) = -18$\n- $(-24) \\div (-6) = +4$\n- $(+15) \\div (-3) = -5$\n\n**With three or more factors:** Count the negative signs.\n- Even number of negatives → positive result.\n- Odd number of negatives → negative result.\n\n$(-2) \\times (-3) \\times (-4) = -24$ (three negatives → negative)'),
  q(5, 'Calculate: $(-7) \\times (+4)$.',
    ['$-28$', '$28$', '$-11$', '$11$'], 0,
    'Different signs give a negative result: $(-7) \\times (+4) = -28$.'),
  fb(6, 'The product of two negative integers is always ___. The product of a positive and a negative integer is always ___.',
    ['positive', 'negative'],
    'Same signs → positive. Different signs → negative.'),
  t(7, '### Combined Operations with Integers\n\nApply BODMAS when working with integer expressions.\n\n**Example 1:** $(-3) + (-2) \\times 4$\n$$= (-3) + (-8)$$\n$$= -11$$\n\n**Example 2:** $[(-6) + 2] \\times (-3)$\n$$= (-4) \\times (-3)$$\n$$= 12$$\n\n**Example 3:** $(-5)^2 + (-3)^2$\n$$= 25 + 9 = 34$$\n\n**Be careful:** $(-5)^2 = 25$ but $-5^2 = -(5^2) = -25$. The brackets make all the difference!\n\n**Example 4:** $\\frac{(-12) + 8}{(-2)}$\n$$= \\frac{-4}{-2} = 2$$'),
  q(8, 'Calculate: $(-2) \\times 5 - (-3) \\times 4$.',
    ['2', '-22', '$22$', '$-2$'], 0,
    '$(-2) \\times 5 = -10$ and $(-3) \\times 4 = -12$. So $-10 - (-12) = -10 + 12 = 2$.'),
  t(9, '### Solving Problems with Integers\n\nIntegers appear in real-world contexts throughout South Africa.\n\n**Temperature:** Sutherland in the Northern Cape can reach $-16°$C. If the temperature rises by $21°$C:\n$$-16 + 21 = 5°\\text{C}$$\n\n**Finance:** Bongani\'s bank account has a balance of R850. He makes payments totalling R1 200.\n$$R850 - R1\\,200 = -R350$$\nThe account is **overdrawn** by R350.\n\n**Altitude:** The deepest point in the Tugela River canyon is $-12$ m below the bridge. A bird flies at $+45$ m above the bridge. The distance between them:\n$$45 - (-12) = 45 + 12 = 57 \\text{ m}$$'),
  q(10, 'At 03:00, the temperature in Graaff-Reinet is $-4°$C. By 15:00, it has risen by $22°$C. What is the temperature at 15:00?',
    ['$18°$C', '$26°$C', '$-26°$C', '$-18°$C'], 0,
    '$-4 + 22 = 18°$C.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Common Fractions (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Operations with Common Fractions ---
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Common Fractions\n\nA **common fraction** represents part of a whole. It is written as $\\frac{a}{b}$ where $a$ is the **numerator** and $b$ is the **denominator** ($b \\neq 0$).\n\n### Types of Fractions\n\n| Type | Description | Example |\n|------|-------------|--------|\n| Proper fraction | Numerator < denominator | $\\frac{3}{5}$ |\n| Improper fraction | Numerator $\\geq$ denominator | $\\frac{7}{4}$ |\n| Mixed number | Whole number and a fraction | $1\\frac{3}{4}$ |\n\n### Converting Between Mixed Numbers and Improper Fractions\n\n**Mixed to improper:** $2\\frac{3}{5} = \\frac{2 \\times 5 + 3}{5} = \\frac{13}{5}$\n\n**Improper to mixed:** $\\frac{17}{4} = 4\\frac{1}{4}$ (since $17 \\div 4 = 4$ remainder $1$)'),
  t(2, '### Addition and Subtraction of Fractions\n\nTo add or subtract fractions, you need a **common denominator** (use the LCM).\n\n**Example 1:** $\\frac{2}{3} + \\frac{1}{4}$\n- LCD $= 12$\n$$= \\frac{8}{12} + \\frac{3}{12} = \\frac{11}{12}$$\n\n**Example 2:** $\\frac{5}{6} - \\frac{1}{4}$\n- LCD $= 12$\n$$= \\frac{10}{12} - \\frac{3}{12} = \\frac{7}{12}$$\n\n**Example 3:** $2\\frac{1}{3} + 1\\frac{3}{4}$\n$$= \\frac{7}{3} + \\frac{7}{4} = \\frac{28}{12} + \\frac{21}{12} = \\frac{49}{12} = 4\\frac{1}{12}$$\n\n**Always simplify** your answer to the lowest terms.'),
  q(3, 'Calculate: $\\frac{3}{5} + \\frac{1}{3}$.',
    ['$\\frac{14}{15}$', '$\\frac{4}{8}$', '$\\frac{4}{15}$', '$\\frac{3}{15}$'], 0,
    'LCD $= 15$. $\\frac{3}{5} = \\frac{9}{15}$ and $\\frac{1}{3} = \\frac{5}{15}$. Sum $= \\frac{9 + 5}{15} = \\frac{14}{15}$.'),
  t(4, '### Multiplication and Division of Fractions\n\n**Multiplication:** Multiply numerators and denominators. Simplify first where possible.\n$$\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}$$\n\n**Example:** $\\frac{3}{4} \\times \\frac{2}{5} = \\frac{6}{20} = \\frac{3}{10}$\n\n**Division:** Multiply by the **reciprocal** (flip the second fraction).\n$$\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}$$\n\n**Example:** $\\frac{5}{6} \\div \\frac{2}{3} = \\frac{5}{6} \\times \\frac{3}{2} = \\frac{15}{12} = \\frac{5}{4} = 1\\frac{1}{4}$\n\n**Example with mixed numbers:** $1\\frac{1}{2} \\times 2\\frac{2}{3}$\n$$= \\frac{3}{2} \\times \\frac{8}{3} = \\frac{24}{6} = 4$$'),
  q(5, 'Calculate: $\\frac{4}{7} \\div \\frac{2}{3}$.',
    ['$\\frac{6}{7}$', '$\\frac{8}{21}$', '$\\frac{7}{6}$', '$\\frac{14}{6}$'], 0,
    '$\\frac{4}{7} \\div \\frac{2}{3} = \\frac{4}{7} \\times \\frac{3}{2} = \\frac{12}{14} = \\frac{6}{7}$.'),
  fb(6, 'To divide by a fraction, multiply by its ___. Before adding fractions, you need a common ___.',
    ['reciprocal', 'denominator'],
    'Dividing by a fraction means multiplying by its reciprocal. Addition requires a common denominator.'),
  t(7, '### Squares, Cubes, and Roots of Fractions\n\n**Squaring a fraction:**\n$$\\left(\\frac{a}{b}\\right)^2 = \\frac{a^2}{b^2}$$\n\n**Example:** $\\left(\\frac{3}{4}\\right)^2 = \\frac{9}{16}$\n\n**Cubing a fraction:**\n$$\\left(\\frac{a}{b}\\right)^3 = \\frac{a^3}{b^3}$$\n\n**Example:** $\\left(\\frac{2}{5}\\right)^3 = \\frac{8}{125}$\n\n**Square root of a fraction:**\n$$\\sqrt{\\frac{a}{b}} = \\frac{\\sqrt{a}}{\\sqrt{b}}$$\n\n**Example:** $\\sqrt{\\frac{9}{25}} = \\frac{3}{5}$\n\n**Cube root:**\n$$\\sqrt[3]{\\frac{8}{27}} = \\frac{2}{3}$$'),
  q(8, 'Calculate: $\\left(\\frac{2}{3}\\right)^3$.',
    ['$\\frac{8}{27}$', '$\\frac{4}{9}$', '$\\frac{6}{9}$', '$\\frac{2}{27}$'], 0,
    '$\\left(\\frac{2}{3}\\right)^3 = \\frac{2^3}{3^3} = \\frac{8}{27}$.'),
  t(9, '### Solving Problems with Fractions\n\n**Example 1:** A recipe needs $\\frac{3}{4}$ cup of sugar. If you want to make $\\frac{1}{2}$ of the recipe, how much sugar?\n$$\\frac{1}{2} \\times \\frac{3}{4} = \\frac{3}{8} \\text{ cup}$$\n\n**Example 2:** A plumber in Johannesburg has a pipe $2\\frac{1}{2}$ m long. He cuts off $\\frac{3}{4}$ m. How long is the remaining piece?\n$$2\\frac{1}{2} - \\frac{3}{4} = \\frac{5}{2} - \\frac{3}{4} = \\frac{10}{4} - \\frac{3}{4} = \\frac{7}{4} = 1\\frac{3}{4} \\text{ m}$$\n\n**Example 3:** A farmer uses $\\frac{2}{5}$ of his land for maize and $\\frac{1}{4}$ for sunflowers. What fraction of his land is used?\n$$\\frac{2}{5} + \\frac{1}{4} = \\frac{8}{20} + \\frac{5}{20} = \\frac{13}{20}$$\nThe remaining fraction: $1 - \\frac{13}{20} = \\frac{7}{20}$'),
  q(10, 'A water tank is $\\frac{5}{8}$ full. After using $\\frac{1}{4}$ of the tank, what fraction remains?',
    ['$\\frac{3}{8}$', '$\\frac{1}{2}$', '$\\frac{7}{8}$', '$\\frac{3}{4}$'], 0,
    '$\\frac{5}{8} - \\frac{1}{4} = \\frac{5}{8} - \\frac{2}{8} = \\frac{3}{8}$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Decimal Fractions (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Operations with Decimal Fractions ---
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Decimal Fractions\n\nA **decimal fraction** is another way to write a common fraction whose denominator is a power of 10.\n\n$$\\frac{3}{10} = 0{,}3 \\qquad \\frac{7}{100} = 0{,}07 \\qquad \\frac{25}{1000} = 0{,}025$$\n\n### Place Value\n\n| Position | Value |\n|----------|-------|\n| Ones | $1$ |\n| Tenths | $0{,}1$ |\n| Hundredths | $0{,}01$ |\n| Thousandths | $0{,}001$ |\n\n### Ordering Decimal Fractions\n\nCompare decimal fractions digit by digit, from left to right.\n\n**Example:** Arrange in ascending order: $0{,}35$; $0{,}305$; $0{,}4$; $0{,}35$\n\nCompare: $0{,}305 < 0{,}35 = 0{,}350 < 0{,}4 = 0{,}400$\n\nAnswer: $0{,}305$; $0{,}35$; $0{,}4$'),
  t(2, '### Rounding Off Decimal Fractions\n\nTo round a decimal to a given number of decimal places:\n1. Look at the digit **after** the place you want.\n2. If it is 5 or more, round **up**.\n3. If it is less than 5, round **down** (keep the digit the same).\n\n**Examples:**\n- $3{,}746$ rounded to 2 decimal places: $3{,}75$ (the 6 rounds the 4 up)\n- $0{,}8231$ rounded to 1 decimal place: $0{,}8$ (the 2 is less than 5)\n- $12{,}995$ rounded to 2 decimal places: $13{,}00$ (the 5 rounds up)\n\n### Estimation\n\nBefore performing a calculation, **estimate** the answer by rounding.\n\n**Example:** Estimate $4{,}87 \\times 3{,}12$.\n- Round: $5 \\times 3 = 15$\n- Exact: $4{,}87 \\times 3{,}12 = 15{,}1944$\n- The estimate $15$ is close — our answer is reasonable.'),
  q(3, 'Round $7{,}648$ to 1 decimal place.',
    ['$7{,}6$', '$7{,}7$', '$7{,}65$', '$8{,}0$'], 0,
    'Look at the second decimal digit (4). Since $4 < 5$, we round down: $7{,}6$.'),
  t(4, '### Multiplication of Decimal Fractions\n\nWhen multiplying decimals:\n1. Multiply as if there are no decimal points.\n2. Count the total number of decimal places in both numbers.\n3. Place the decimal point in the answer.\n\n**Example:** $2{,}4 \\times 0{,}3$\n- $24 \\times 3 = 72$\n- Total decimal places: $1 + 1 = 2$\n- Answer: $0{,}72$\n\n**Example:** $1{,}25 \\times 0{,}04$\n- $125 \\times 4 = 500$\n- Total decimal places: $2 + 2 = 4$\n- Answer: $0{,}0500 = 0{,}05$\n\n**Multiplying by powers of 10:**\n- $3{,}45 \\times 10 = 34{,}5$ (move decimal 1 place right)\n- $3{,}45 \\times 100 = 345$ (move decimal 2 places right)\n- $3{,}45 \\times 1\\,000 = 3\\,450$ (move decimal 3 places right)'),
  q(5, 'Calculate: $0{,}6 \\times 0{,}8$.',
    ['$0{,}48$', '$0{,}048$', '$4{,}8$', '$48$'], 0,
    '$6 \\times 8 = 48$. Total decimal places: $1 + 1 = 2$. Answer: $0{,}48$.'),
  fb(6, 'When multiplying two decimal fractions, the number of decimal places in the answer equals the ___ of the decimal places in the two factors. When dividing a decimal by 100, the decimal point moves ___ places to the left.',
    ['sum', '2'],
    'Add the decimal places of both factors. Dividing by 100 moves the point 2 places left.'),
  t(7, '### Division of Decimal Fractions\n\nTo divide by a decimal, make the divisor a whole number by multiplying both numbers by the same power of 10.\n\n**Example:** $3{,}6 \\div 0{,}4$\n- Multiply both by 10: $36 \\div 4 = 9$\n\n**Example:** $0{,}144 \\div 0{,}12$\n- Multiply both by 100: $14{,}4 \\div 12 = 1{,}2$\n\n**Dividing by powers of 10:**\n- $45{,}6 \\div 10 = 4{,}56$ (move decimal 1 place left)\n- $45{,}6 \\div 100 = 0{,}456$ (move decimal 2 places left)\n\n**Example with estimation:** $18{,}72 \\div 3{,}6$\n- Estimate: $18 \\div 4 = 4{,}5$\n- Exact: $187{,}2 \\div 36 = 5{,}2$'),
  q(8, 'Calculate: $4{,}5 \\div 0{,}09$.',
    ['$50$', '$5$', '$0{,}5$', '$500$'], 0,
    'Multiply both by 100: $450 \\div 9 = 50$.'),
  t(9, '### Equivalent Forms: Fractions, Decimals, and Percentages\n\nYou must be able to convert between common fractions, decimal fractions, and percentages.\n\n| Common Fraction | Decimal | Percentage |\n|----------------|---------|------------|\n| $\\frac{1}{4}$ | $0{,}25$ | $25\\%$ |\n| $\\frac{1}{3}$ | $0{,}\\overline{3}$ | $33{,}\\overline{3}\\%$ |\n| $\\frac{1}{2}$ | $0{,}5$ | $50\\%$ |\n| $\\frac{3}{4}$ | $0{,}75$ | $75\\%$ |\n| $\\frac{1}{5}$ | $0{,}2$ | $20\\%$ |\n| $\\frac{3}{8}$ | $0{,}375$ | $37{,}5\\%$ |\n\n**Conversions:**\n- Fraction to decimal: divide numerator by denominator\n- Decimal to percentage: multiply by 100\n- Percentage to fraction: write over 100 and simplify'),
  q(10, 'Write $\\frac{3}{5}$ as a decimal and a percentage.',
    ['$0{,}6$ and $60\\%$', '$0{,}35$ and $35\\%$', '$0{,}6$ and $6\\%$', '$0{,}06$ and $60\\%$'], 0,
    '$\\frac{3}{5} = 3 \\div 5 = 0{,}6 = 60\\%$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Exponents (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Laws of Exponents ---
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Exponents\n\nAn **exponent** tells us how many times a base is multiplied by itself.\n\n$$a^n = \\underbrace{a \\times a \\times a \\times \\cdots \\times a}_{n \\text{ factors}}$$\n\n**Examples:**\n- $3^4 = 3 \\times 3 \\times 3 \\times 3 = 81$\n- $2^5 = 2 \\times 2 \\times 2 \\times 2 \\times 2 = 32$\n- $10^3 = 1\\,000$\n\n### Comparing and Representing Numbers in Exponential Form\n\n**Example:** Write 72 as a product of prime factors in exponential form.\n$$72 = 8 \\times 9 = 2^3 \\times 3^2$$\n\n**Example:** Write $10\\,000$ in exponential form.\n$$10\\,000 = 10^4 = (2 \\times 5)^4 = 2^4 \\times 5^4$$'),
  t(2, '### Laws of Exponents\n\nThe following laws apply when the **bases are the same**.\n\n| Law | Rule | Example |\n|-----|------|---------|\n| Product | $a^m \\times a^n = a^{m+n}$ | $2^3 \\times 2^4 = 2^7 = 128$ |\n| Quotient | $a^m \\div a^n = a^{m-n}$ | $5^6 \\div 5^2 = 5^4 = 625$ |\n| Power of a power | $(a^m)^n = a^{m \\times n}$ | $(3^2)^3 = 3^6 = 729$ |\n| Power of a product | $(ab)^n = a^n \\times b^n$ | $(2 \\times 5)^3 = 2^3 \\times 5^3$ |\n| Zero exponent | $a^0 = 1$ (if $a \\neq 0$) | $7^0 = 1$ |\n\n**Important:** These laws only work when the bases are the same. $2^3 \\times 3^4$ cannot be simplified using the product law.'),
  q(3, 'Simplify: $5^3 \\times 5^2$.',
    ['$5^5 = 3\\,125$', '$5^6$', '$25^5$', '$5^3 = 125$'], 0,
    'Using the product law: $5^3 \\times 5^2 = 5^{3+2} = 5^5 = 3\\,125$.'),
  t(4, '### Applying the Laws\n\n**Example 1:** Simplify $\\frac{2^7}{2^3}$.\n$$= 2^{7-3} = 2^4 = 16$$\n\n**Example 2:** Simplify $(3^2)^4$.\n$$= 3^{2 \\times 4} = 3^8 = 6\\,561$$\n\n**Example 3:** Simplify $(2x)^3$.\n$$= 2^3 \\times x^3 = 8x^3$$\n\n**Example 4:** Simplify $\\frac{4^5 \\times 4^2}{4^4}$.\n$$= \\frac{4^{5+2}}{4^4} = \\frac{4^7}{4^4} = 4^{7-4} = 4^3 = 64$$\n\n**Example 5:** Calculate $(5^0 + 3^0) \\times 2$.\n$$= (1 + 1) \\times 2 = 4$$'),
  q(5, 'Simplify: $(2^3)^2 \\times 2^2$.',
    ['$2^8 = 256$', '$2^{12}$', '$2^7$', '$2^{10}$'], 0,
    '$(2^3)^2 = 2^6$. Then $2^6 \\times 2^2 = 2^{6+2} = 2^8 = 256$.'),
  fb(6, 'Any non-zero number raised to the power zero equals ___. When multiplying powers with the same base, we ___ the exponents.',
    ['1', 'add'],
    '$a^0 = 1$ for $a \\neq 0$. Product law: $a^m \\times a^n = a^{m+n}$.'),
  t(7, '### Scientific Notation (Introduction)\n\nScientific notation writes a number as $a \\times 10^n$ where $1 \\leq a < 10$.\n\nThis is useful for very large or very small numbers.\n\n**Large numbers:**\n- $340\\,000 = 3{,}4 \\times 10^5$\n- $91\\,000\\,000 = 9{,}1 \\times 10^7$\n- The distance from Cape Town to Johannesburg is approximately $1{,}4 \\times 10^3$ km.\n\n**Small numbers (not required at Grade 8, but useful):**\n- $0{,}006 = 6 \\times 10^{-3}$\n\n**To convert to scientific notation:**\n1. Move the decimal point so there is one non-zero digit before it.\n2. Count how many places you moved — this is the exponent of 10.'),
  q(8, 'Write $5\\,600\\,000$ in scientific notation.',
    ['$5{,}6 \\times 10^6$', '$56 \\times 10^5$', '$5{,}6 \\times 10^5$', '$0{,}56 \\times 10^7$'], 0,
    'Move the decimal 6 places left: $5\\,600\\,000 = 5{,}6 \\times 10^6$.'),
  t(9, '### Squares, Cubes, Square Roots, and Cube Roots\n\nKnow these perfect squares and cubes:\n\n| $n$ | $n^2$ | $n^3$ |\n|-----|-------|-------|\n| 1 | 1 | 1 |\n| 2 | 4 | 8 |\n| 3 | 9 | 27 |\n| 4 | 16 | 64 |\n| 5 | 25 | 125 |\n| 6 | 36 | 216 |\n| 7 | 49 | 343 |\n| 8 | 64 | 512 |\n| 9 | 81 | 729 |\n| 10 | 100 | 1 000 |\n\n**Square root:** $\\sqrt{64} = 8$ because $8^2 = 64$\n\n**Cube root:** $\\sqrt[3]{125} = 5$ because $5^3 = 125$\n\n**Example:** $\\sqrt{49} + \\sqrt[3]{27} = 7 + 3 = 10$'),
  q(10, 'Calculate: $\\sqrt[3]{64} + \\sqrt{81}$.',
    ['$13$', '$145$', '$17$', '$11$'], 0,
    '$\\sqrt[3]{64} = 4$ and $\\sqrt{81} = 9$. So $4 + 9 = 13$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Numeric and Geometric Patterns (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Investigating and Extending Patterns ---
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Numeric Patterns\n\nA **pattern** or **sequence** is a list of numbers that follow a specific rule.\n\nIn Grade 8, we focus on patterns with a **constant difference** (linear patterns) and **constant ratio** (geometric patterns).\n\n### Constant Difference Patterns\n\nIf the difference between consecutive terms is always the same, the pattern is **linear**.\n\n**Example:** $2, 5, 8, 11, 14, \\ldots$\n- Difference: $+3$ each time (constant)\n- Next terms: $17, 20, 23, \\ldots$\n\n**Example:** $20, 16, 12, 8, \\ldots$\n- Difference: $-4$ each time (constant)\n- Next terms: $4, 0, -4, \\ldots$'),
  t(2, '### Finding the General Rule\n\nFor a linear pattern with first term $a$ and common difference $d$:\n$$T_n = a + (n-1)d$$\n\nwhere $T_n$ is the $n$th term and $n$ is the position.\n\n**Example:** Find the general rule for $3, 7, 11, 15, \\ldots$\n- $a = 3$, $d = 4$\n- $T_n = 3 + (n-1)(4) = 3 + 4n - 4 = 4n - 1$\n\n**Check:** $T_1 = 4(1) - 1 = 3$ ✓, $T_4 = 4(4) - 1 = 15$ ✓\n\n**Example:** Which term of $5, 9, 13, 17, \\ldots$ equals 81?\n- $T_n = 5 + (n-1)(4) = 4n + 1$\n- $4n + 1 = 81 \\implies 4n = 80 \\implies n = 20$\n- The 20th term equals 81.'),
  q(3, 'Find the 10th term of the sequence $2, 7, 12, 17, \\ldots$',
    ['47', '52', '42', '57'], 0,
    '$a = 2$, $d = 5$. $T_{10} = 2 + (10-1)(5) = 2 + 45 = 47$.'),
  t(4, '## Geometric Patterns\n\nA **geometric pattern** uses shapes, drawings, or physical objects to show how a pattern grows.\n\n### Matchstick Patterns\n\n**Example:** A sequence of triangles made with matchsticks:\n- Figure 1: 3 matchsticks (1 triangle)\n- Figure 2: 5 matchsticks (2 triangles sharing a side)\n- Figure 3: 7 matchsticks (3 triangles)\n\nDifference: $+2$ each time.\n$T_n = 3 + (n-1)(2) = 2n + 1$\n\nMatchsticks for 20 triangles: $T_{20} = 2(20) + 1 = 41$\n\n### Dot Patterns\n\n**Example:** Square numbers shown as dot arrays:\n- $1, 4, 9, 16, 25, \\ldots$\n- Rule: $T_n = n^2$\n- These are perfect squares.'),
  q(5, 'A pattern uses matchsticks to build squares. Figure 1 uses 4 matchsticks, Figure 2 uses 7, Figure 3 uses 10. How many matchsticks for Figure 8?',
    ['25', '22', '28', '31'], 0,
    '$a = 4$, $d = 3$. $T_8 = 4 + (8-1)(3) = 4 + 21 = 25$.',
    ['Find the common difference first, then use the formula.']),
  fb(6, 'A pattern with a constant difference between terms is called a ___ pattern. The formula for the nth term is $T_n = a + (n-1) \\times ___$.',
    ['linear', 'd'],
    'Linear patterns have constant differences. The formula uses $d$ for the common difference.'),
  t(7, '### Patterns in Tables\n\nPatterns can also be represented in tables. You need to find the relationship between input and output.\n\n**Example:**\n\n| Position ($n$) | 1 | 2 | 3 | 4 | 5 |\n|----------------|---|---|---|---|---|\n| Value ($T_n$) | 5 | 8 | 11 | 14 | 17 |\n\nDifference: $+3$ each time.\n$T_n = 3n + 2$\n\n**Example:** A taxi fare in Johannesburg:\n\n| Distance (km) | 1 | 2 | 3 | 4 | 5 |\n|---------------|---|---|---|---|---|\n| Cost (R) | 12 | 17 | 22 | 27 | 32 |\n\nThe rule is: Cost $= 5 \\times \\text{distance} + 7 = 5d + 7$\n\nThis means there is a R7 base fare plus R5 per kilometre.'),
  q(8, 'Find the rule for the pattern: $6, 10, 14, 18, 22, \\ldots$',
    ['$T_n = 4n + 2$', '$T_n = 4n - 2$', '$T_n = 2n + 4$', '$T_n = 6n$'], 0,
    '$a = 6$, $d = 4$. $T_n = 6 + (n-1)(4) = 6 + 4n - 4 = 4n + 2$.'),
  t(9, '### Patterns Involving Constant Ratio\n\nSome patterns grow by a **constant ratio** — each term is found by multiplying the previous term by a fixed number.\n\n**Example:** $3, 6, 12, 24, 48, \\ldots$\n- Each term is multiplied by $2$.\n- Ratio: $\\frac{6}{3} = \\frac{12}{6} = \\frac{24}{12} = 2$\n\n**Example:** $1\\,000, 500, 250, 125, \\ldots$\n- Each term is multiplied by $\\frac{1}{2}$ (or divided by 2).\n- Ratio: $\\frac{500}{1\\,000} = \\frac{1}{2}$\n\n**SA Context:** Bacteria in a science experiment double every hour. Starting with 50 bacteria:\n\n| Hour | 0 | 1 | 2 | 3 | 4 |\n|------|---|---|---|---|---|\n| Count | 50 | 100 | 200 | 400 | 800 |\n\nAfter 6 hours: $50 \\times 2^6 = 50 \\times 64 = 3\\,200$ bacteria.'),
  q(10, 'In the pattern $4, 12, 36, 108, \\ldots$, what is the next term?',
    ['324', '216', '432', '144'], 0,
    'The ratio is $\\frac{12}{4} = 3$. Next term $= 108 \\times 3 = 324$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Algebraic Expressions (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Algebraic Language and Operations ---
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Algebraic Language\n\nAlgebra uses **variables** (letters) to represent unknown quantities and **constants** (numbers) to represent known values.\n\n### Key Terminology\n\n| Term | Meaning | Example |\n|------|---------|--------|\n| Variable | A letter representing an unknown | $x$, $y$, $a$ |\n| Coefficient | The number in front of a variable | In $5x$, the coefficient is 5 |\n| Constant | A fixed number with no variable | In $3x + 7$, the constant is 7 |\n| Term | A product of numbers and variables | $3x^2$ is one term |\n| Like terms | Terms with same variable(s) and exponent(s) | $4x$ and $-2x$ |\n| Unlike terms | Different variables or exponents | $3x$ and $3x^2$ |\n\n### Types of Expressions\n\n- **Monomial:** 1 term — e.g. $5x^2$\n- **Binomial:** 2 terms — e.g. $x + 3$\n- **Trinomial:** 3 terms — e.g. $x^2 + 2x + 1$'),
  t(2, '### Adding and Subtracting Like Terms\n\nOnly **like terms** can be added or subtracted.\n\n**Example 1:** $4x + 3x = 7x$\n\n**Example 2:** $6a^2 - 2a^2 + 3a = 4a^2 + 3a$\n\n**Example 3:** $5xy + 2x - 3xy + 4y = 2xy + 2x + 4y$\n\n**Common mistakes:**\n- $3x + 2y \\neq 5xy$ (different variables cannot be combined)\n- $4x + 3x^2 \\neq 7x^3$ (different exponents cannot be combined)\n\n### Multiplying Monomials\n\nMultiply coefficients and add exponents of the same variable.\n\n$$3x^2 \\times 4x^3 = 12x^5$$\n$$(-2a^3) \\times (5a^2) = -10a^5$$\n$$2xy \\times 3x^2y = 6x^3y^2$$'),
  q(3, 'Simplify: $7x + 3y - 4x + 2y$.',
    ['$3x + 5y$', '$11x + 5y$', '$3x - y$', '$8xy$'], 0,
    'Group like terms: $(7x - 4x) + (3y + 2y) = 3x + 5y$.'),
  t(4, '### Multiplying a Monomial by a Polynomial\n\nUse the **distributive property** to expand.\n\n**Example 1:** $3(x + 4) = 3x + 12$\n\n**Example 2:** $-2x(3x + 5) = -6x^2 - 10x$\n\n**Example 3:** $4a(2a^2 - 3a + 1) = 8a^3 - 12a^2 + 4a$\n\n### Multiplying Two Binomials\n\nAt Grade 8 level, use the **distributive property** (some call it FOIL: First, Outer, Inner, Last).\n\n$$(x + 2)(x + 5) = x^2 + 5x + 2x + 10 = x^2 + 7x + 10$$\n\n$$(x + 3)(x - 4) = x^2 - 4x + 3x - 12 = x^2 - x - 12$$\n\n$$(2x - 1)(x + 3) = 2x^2 + 6x - x - 3 = 2x^2 + 5x - 3$$'),
  q(5, 'Expand: $-3x(2x - 4)$.',
    ['$-6x^2 + 12x$', '$-6x^2 - 12x$', '$-6x + 12$', '$6x^2 - 12x$'], 0,
    '$-3x \\times 2x = -6x^2$ and $-3x \\times (-4) = 12x$. So $-6x^2 + 12x$.'),
  fb(6, 'Only ___ terms can be added or subtracted. When multiplying $a^m \\times a^n$ we ___ the exponents.',
    ['like', 'add'],
    'Like terms have the same variables and exponents. When multiplying same bases, add exponents.'),
  t(7, '### Dividing Polynomials by Monomials\n\nDivide each term of the polynomial by the monomial.\n\n**Example 1:** $\\frac{6x^3 + 9x^2}{3x} = \\frac{6x^3}{3x} + \\frac{9x^2}{3x} = 2x^2 + 3x$\n\n**Example 2:** $\\frac{10a^2b - 15ab^2}{5ab} = 2a - 3b$\n\n**Example 3:** $\\frac{8x^4 - 12x^3 + 4x^2}{-4x^2} = -2x^2 + 3x - 1$\n\n**Key rule:** $\\frac{a^m}{a^n} = a^{m-n}$ — subtract the exponents when dividing.'),
  q(8, 'Simplify: $\\frac{12x^3 - 8x^2}{4x}$.',
    ['$3x^2 - 2x$', '$3x^3 - 2x^2$', '$3x^2 + 2x$', '$8x^2 - 4x$'], 0,
    '$\\frac{12x^3}{4x} = 3x^2$ and $\\frac{-8x^2}{4x} = -2x$. Answer: $3x^2 - 2x$.'),
  t(9, '### Substitution (Finding the Value of an Expression)\n\nReplace the variable with a given number and calculate.\n\n**Example 1:** Find the value of $3x^2 - 2x + 1$ when $x = 4$.\n$$3(4)^2 - 2(4) + 1 = 3(16) - 8 + 1 = 48 - 8 + 1 = 41$$\n\n**Example 2:** Find the value of $2a + 3b$ when $a = -3$ and $b = 5$.\n$$2(-3) + 3(5) = -6 + 15 = 9$$\n\n**Example 3:** If $x = -2$, find the value of $x^3 + x^2$.\n$$(-2)^3 + (-2)^2 = -8 + 4 = -4$$\n\n**Be careful with negative substitution:** Always use brackets around negative numbers.'),
  q(10, 'If $x = 3$ and $y = -2$, what is the value of $2x^2 - 3y$?',
    ['$24$', '$12$', '$18$', '$6$'], 0,
    '$2(3)^2 - 3(-2) = 2(9) - (-6) = 18 + 6 = 24$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Algebraic Equations (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Solving Linear Equations ---
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Algebraic Equations\n\nAn **equation** is a mathematical statement that two expressions are equal. It always has an **equals sign** ($=$).\n\n**Expression:** $3x + 5$ (no equals sign — just a value)\n**Equation:** $3x + 5 = 14$ (has an equals sign — can be solved)\n\n### Setting Up Equations\n\nTranslate word problems into algebraic equations.\n\n| Words | Algebra |\n|-------|--------|\n| A number increased by 7 | $x + 7$ |\n| Three times a number | $3x$ |\n| Five less than a number | $x - 5$ |\n| A number divided by 4 | $\\frac{x}{4}$ |\n| Double a number plus 3 equals 15 | $2x + 3 = 15$ |'),
  t(2, '### Solving Linear Equations by Inspection and Inverse Operations\n\n**By inspection** (guess and check):\n- $x + 5 = 12 \\implies x = 7$\n- $3x = 18 \\implies x = 6$\n\n**Using inverse operations** (more reliable):\n1. **Undo** each operation in reverse order.\n2. Whatever you do to one side, do to the **other side** as well.\n\n**Example:** $2x + 3 = 11$\n- Subtract 3: $2x = 8$\n- Divide by 2: $x = 4$\n\n**Example:** $\\frac{x}{3} - 5 = 1$\n- Add 5: $\\frac{x}{3} = 6$\n- Multiply by 3: $x = 18$\n\n**Check:** $\\frac{18}{3} - 5 = 6 - 5 = 1$ ✓'),
  q(3, 'Solve: $5x - 7 = 23$.',
    ['$x = 6$', '$x = 4$', '$x = 3{,}2$', '$x = 16$'], 0,
    'Add 7: $5x = 30$. Divide by 5: $x = 6$. Check: $5(6) - 7 = 30 - 7 = 23$ ✓.'),
  t(4, '### Equations with Variables on Both Sides\n\nWhen the variable appears on both sides of the equation, move all variable terms to one side.\n\n**Example 1:** $4x + 2 = 2x + 10$\n- Subtract $2x$: $2x + 2 = 10$\n- Subtract 2: $2x = 8$\n- Divide by 2: $x = 4$\n\n**Example 2:** $3(x - 2) = 2(x + 1)$\n- Expand: $3x - 6 = 2x + 2$\n- Subtract $2x$: $x - 6 = 2$\n- Add 6: $x = 8$\n\n**Example 3:** $5x + 3 = 3x + 3$\n- Subtract $3x$: $2x + 3 = 3$\n- Subtract 3: $2x = 0$\n- $x = 0$ (zero is a valid solution!)'),
  q(5, 'Solve: $7x - 5 = 3x + 11$.',
    ['$x = 4$', '$x = 3$', '$x = 6$', '$x = -4$'], 0,
    'Subtract $3x$: $4x - 5 = 11$. Add 5: $4x = 16$. Divide by 4: $x = 4$. Check: $7(4) - 5 = 23$ and $3(4) + 11 = 23$ ✓.'),
  fb(6, 'When solving an equation, whatever you do to one side you must do to the ___. The solution to $3x = 0$ is $x = ___$.',
    ['other side', '0'],
    'Equations are like a balance — both sides must be treated equally. $3x = 0$ gives $x = 0$.'),
  t(7, '### Equations with Brackets and Fractions\n\n**Brackets:** Always expand brackets first.\n\n**Example:** $2(3x + 4) - 5 = 17$\n$$6x + 8 - 5 = 17$$\n$$6x + 3 = 17$$\n$$6x = 14$$\n$$x = \\frac{14}{6} = \\frac{7}{3} = 2\\frac{1}{3}$$\n\n**Fractions:** Multiply every term by the LCD to clear fractions.\n\n**Example:** $\\frac{x}{2} + \\frac{x}{3} = 10$\n- LCD $= 6$:\n$$3x + 2x = 60$$\n$$5x = 60$$\n$$x = 12$$\n\n**Check:** $\\frac{12}{2} + \\frac{12}{3} = 6 + 4 = 10$ ✓'),
  q(8, 'Solve: $\\frac{x}{4} + 3 = 7$.',
    ['$x = 16$', '$x = 10$', '$x = 1$', '$x = 28$'], 0,
    'Subtract 3: $\\frac{x}{4} = 4$. Multiply by 4: $x = 16$. Check: $\\frac{16}{4} + 3 = 4 + 3 = 7$ ✓.'),
  t(9, '### Word Problems Leading to Equations\n\n**Example 1:** Nomsa is 5 years older than her brother Thabo. Together their ages add up to 27. Find their ages.\n- Let Thabo\'s age $= x$\n- Nomsa\'s age $= x + 5$\n- $x + (x + 5) = 27$\n- $2x + 5 = 27$\n- $2x = 22$\n- $x = 11$\n- Thabo is 11, Nomsa is 16.\n\n**Example 2:** A rectangle has a perimeter of 46 cm. The length is 5 cm more than the breadth. Find the dimensions.\n- Let breadth $= x$, length $= x + 5$\n- $2(x + x + 5) = 46$\n- $2(2x + 5) = 46$\n- $4x + 10 = 46$\n- $4x = 36$\n- $x = 9$\n- Breadth $= 9$ cm, length $= 14$ cm.\n- **Check:** $P = 2(9 + 14) = 2(23) = 46$ cm ✓'),
  q(10, 'The sum of three consecutive numbers is 42. What is the smallest number?',
    ['13', '14', '12', '15'], 0,
    'Let the numbers be $x$, $x+1$, $x+2$. Then $3x + 3 = 42$, so $3x = 39$ and $x = 13$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Functions and Relationships (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Input-Output and Flow Diagrams ---
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Functions and Relationships\n\nA **function** is a rule that connects each **input** value to exactly one **output** value.\n\n### Representations of Functions\n\nFunctions can be described in different ways:\n\n1. **Words:** "Multiply the input by 2 and subtract 3"\n2. **Flow diagram:** $x \\longrightarrow \\times 2 \\longrightarrow - 3 \\longrightarrow y$\n3. **Table of values:**\n\n| $x$ | 1 | 2 | 3 | 4 | 5 |\n|-----|---|---|---|---|---|\n| $y$ | -1 | 1 | 3 | 5 | 7 |\n\n4. **Formula:** $y = 2x - 3$\n\nAll four represent the **same** function.'),
  t(2, '### Finding the Rule from a Table\n\nLook at the difference between consecutive output values.\n\n**Example:**\n\n| $x$ | 1 | 2 | 3 | 4 | 5 |\n|-----|---|---|---|---|---|\n| $y$ | 3 | 7 | 11 | 15 | 19 |\n\nDifference: $+4$ each time → the coefficient of $x$ is $4$.\nWhen $x = 1$: $4(1) + c = 3$, so $c = -1$.\nRule: $y = 4x - 1$\n\n**Checking:** $T_3 = 4(3) - 1 = 11$ ✓\n\n**Example:**\n\n| $x$ | 0 | 1 | 2 | 3 |\n|-----|---|---|---|---|\n| $y$ | 5 | 8 | 11 | 14 |\n\nDifference: $+3$. When $x = 0$: $y = 5$, so $c = 5$.\nRule: $y = 3x + 5$'),
  q(3, 'Find the rule for the table: $x = 1, 2, 3, 4$ and $y = 6, 11, 16, 21$.',
    ['$y = 5x + 1$', '$y = 5x - 1$', '$y = 6x$', '$y = 4x + 2$'], 0,
    'Difference $= 5$. When $x = 1$: $5(1) + c = 6$, so $c = 1$. Rule: $y = 5x + 1$.'),
  t(4, '### Flow Diagrams\n\nA **flow diagram** shows the input-output relationship step by step.\n\n**Example:** Draw a flow diagram for $y = 3x + 2$.\n\n$$x \\longrightarrow \\times 3 \\longrightarrow + 2 \\longrightarrow y$$\n\n**Example:** Find the output when $x = 5$:\n$$5 \\longrightarrow 15 \\longrightarrow 17$$\nSo $y = 17$.\n\n**Inverse flow diagram** (working backwards to find the input):\nIf $y = 20$:\n$$x \\longleftarrow \\div 3 \\longleftarrow - 2 \\longleftarrow 20$$\n$$x \\longleftarrow \\div 3 \\longleftarrow 18$$\n$$x = 6$$\n\n**Check:** $3(6) + 2 = 20$ ✓'),
  q(5, 'A flow diagram shows: $x \\rightarrow \\times 4 \\rightarrow - 1 \\rightarrow y$. If $y = 19$, what is $x$?',
    ['5', '4', '18', '20'], 0,
    'Working backwards: $19 + 1 = 20$, then $20 \\div 4 = 5$. So $x = 5$. Check: $4(5) - 1 = 19$ ✓.'),
  fb(6, 'A function assigns each input to exactly ___ output. To find the input from the output, use the ___ flow diagram.',
    ['one', 'inverse'],
    'Each input has exactly one output. The inverse flow diagram reverses each step.'),
  t(7, '### Equivalent Forms\n\nThe same relationship can look different depending on how it is presented.\n\n**Example:** These all describe the same function:\n- **Words:** "Add 3 to the input, then double the result"\n- **Formula:** $y = 2(x + 3) = 2x + 6$\n- **Table:**\n\n| $x$ | 0 | 1 | 2 | 3 | 4 |\n|-----|---|---|---|---|---|\n| $y$ | 6 | 8 | 10 | 12 | 14 |\n\n- **Flow diagram:** $x \\rightarrow + 3 \\rightarrow \\times 2 \\rightarrow y$\n\nIt is important to recognise when different representations describe the **same** relationship.\n\n**SA Context:** Electricity costs in Johannesburg may follow the rule: Cost $= R1{,}50 \\times \\text{units} + R65$ (a fixed charge of R65 plus R1,50 per unit).'),
  q(8, 'Which formula matches: "Subtract 4 from the input, then multiply by 3"?',
    ['$y = 3(x - 4)$', '$y = 3x - 4$', '$y = x - 12$', '$y = (x - 4) + 3$'], 0,
    'Subtract 4 first: $(x - 4)$. Then multiply by 3: $3(x - 4) = 3x - 12$.'),
  t(9, '### Substitution in Equations and Formulae\n\nSubstitution replaces a variable with a specific value.\n\n**Example 1:** The formula for converting Celsius to Fahrenheit is:\n$$F = \\frac{9}{5}C + 32$$\n\nConvert $25°$C to Fahrenheit:\n$$F = \\frac{9}{5}(25) + 32 = 45 + 32 = 77°\\text{F}$$\n\n**Example 2:** The perimeter of a rectangle is $P = 2l + 2b$. If $P = 36$ and $l = 11$, find $b$.\n$$36 = 2(11) + 2b$$\n$$36 = 22 + 2b$$\n$$2b = 14$$\n$$b = 7$$\n\n**SA Context:** A safari in Kruger National Park costs R440 per adult plus R60 per child. For 2 adults and $c$ children:\n$$\\text{Total} = 2(440) + 60c = 880 + 60c$$'),
  q(10, 'If $y = x^2 + 3$, find $y$ when $x = -4$.',
    ['19', '13', '-13', '11'], 0,
    '$y = (-4)^2 + 3 = 16 + 3 = 19$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Graphs (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Interpreting and Drawing Graphs ---
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Interpreting Graphs\n\nGraphs tell a story about how quantities change. In Grade 8, you must interpret **global graphs** and draw **linear graphs**.\n\n### Features of Graphs\n\nWhen analysing any graph, identify:\n- **Linear** (straight line) or **non-linear** (curve)\n- **Increasing** (going up from left to right) or **decreasing** (going down)\n- **Constant** (horizontal — no change)\n- **Maximum** or **minimum** values\n- **Discrete** (separate points) or **continuous** (every value)\n- **$x$-intercept** — where the graph crosses the $x$-axis ($y = 0$)\n- **$y$-intercept** — where the graph crosses the $y$-axis ($x = 0$)'),
  t(2, '### Reading Global Graphs\n\n**Example:** A graph shows the height of water in a bath over time.\n\n- 0 to 5 min: water level increases steadily (filling the bath)\n- 5 to 15 min: water level is constant (person is bathing)\n- 15 to 20 min: water level decreases (emptying the bath)\n\nThe **maximum** height is reached at $t = 5$ min and stays until $t = 15$ min.\nThe graph is **continuous** because water level changes at every moment.\n\n**Example:** A graph shows the temperature in Bloemfontein over 24 hours.\n- The minimum temperature of $-2°$C occurs at 05:00.\n- The maximum temperature of $22°$C occurs at 14:00.\n- Between 05:00 and 14:00, the graph is **increasing**.\n- Between 14:00 and 24:00, the graph is **decreasing**.'),
  q(3, 'A graph shows a car\'s distance from home over time. A horizontal section of the graph means the car is:',
    ['Stationary (not moving)', 'Moving at constant speed', 'Accelerating', 'Decelerating'], 0,
    'A horizontal line on a distance-time graph means the distance is not changing — the car is stationary.'),
  t(4, '## Drawing Linear Graphs\n\nA **linear graph** is a straight line. It can be written as $y = mx + c$ where:\n- $m$ = **gradient** (steepness of the line)\n- $c$ = **$y$-intercept** (where the line crosses the $y$-axis)\n\n### Steps to Draw a Linear Graph\n\n1. Make a table of at least 3 values\n2. Plot the points on the Cartesian plane\n3. Draw a straight line through the points\n\n**Example:** Draw $y = 2x + 1$.\n\n| $x$ | $-2$ | $-1$ | $0$ | $1$ | $2$ |\n|-----|------|------|-----|-----|-----|\n| $y$ | $-3$ | $-1$ | $1$ | $3$ | $5$ |\n\nThe $y$-intercept is $(0, 1)$. The gradient is $2$ — for every 1 unit right, the graph goes 2 units up.'),
  q(5, 'What is the $y$-intercept of the line $y = -3x + 7$?',
    ['7', '-3', '3', '-7'], 0,
    'In $y = mx + c$, the $y$-intercept is $c = 7$.'),
  fb(6, 'In the equation $y = mx + c$, the letter $m$ represents the ___ and $c$ represents the ___.',
    ['gradient', 'y-intercept'],
    '$m$ tells us how steep the line is. $c$ is where the line crosses the $y$-axis.'),
  t(7, '### Positive, Negative, and Zero Gradients\n\n| Gradient | Appearance | Example |\n|----------|-----------|--------|\n| $m > 0$ (positive) | Line goes up from left to right | $y = 2x + 1$ |\n| $m < 0$ (negative) | Line goes down from left to right | $y = -x + 4$ |\n| $m = 0$ | Horizontal line | $y = 3$ |\n\n**Steepness:** A larger absolute value of $m$ means a steeper line.\n- $y = 3x$ is steeper than $y = x$.\n- $y = -5x$ is steeper than $y = -2x$.\n\n**Special lines:**\n- $y = c$ is a **horizontal** line through $(0, c)$\n- $x = c$ is a **vertical** line through $(c, 0)$ — this is NOT a function'),
  q(8, 'Which line is steeper: $y = 2x + 1$ or $y = 5x - 3$?',
    ['$y = 5x - 3$', '$y = 2x + 1$', 'They are equally steep', 'Cannot be determined'], 0,
    'The gradient of $y = 5x - 3$ is 5, which is greater than 2. A larger gradient means a steeper line.'),
  t(9, '### Finding the Equation from a Graph\n\nTo find the equation of a straight line from a graph:\n\n1. Read the **$y$-intercept** ($c$) from the graph.\n2. Choose two clear points and calculate the **gradient**: $m = \\frac{y_2 - y_1}{x_2 - x_1}$.\n3. Write $y = mx + c$.\n\n**Example:** A line passes through $(0, 3)$ and $(2, 7)$.\n- $c = 3$ (the line crosses the $y$-axis at 3)\n- $m = \\frac{7 - 3}{2 - 0} = \\frac{4}{2} = 2$\n- Equation: $y = 2x + 3$\n\n**Example:** A line passes through $(1, 5)$ and $(3, 1)$.\n- $m = \\frac{1 - 5}{3 - 1} = \\frac{-4}{2} = -2$\n- Substitute $(1, 5)$: $5 = -2(1) + c$, so $c = 7$\n- Equation: $y = -2x + 7$'),
  q(10, 'A line passes through $(0, -1)$ and $(4, 7)$. What is its equation?',
    ['$y = 2x - 1$', '$y = 2x + 1$', '$y = -2x - 1$', '$y = 4x - 1$'], 0,
    '$c = -1$. $m = \\frac{7 - (-1)}{4 - 0} = \\frac{8}{4} = 2$. Equation: $y = 2x - 1$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: Data Handling (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Collecting, Organising, and Summarising Data ---
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Collecting Data\n\nThe data-handling cycle:\n1. **Pose** a question relating to social, economic, or environmental issues\n2. **Collect** data from appropriate sources\n3. **Organise** data using tables\n4. **Summarise** data using statistics\n5. **Represent** data using graphs\n6. **Interpret** and report findings\n\n### Sources of Data\n\n- **Primary data:** Collected by the learner (surveys, experiments, observations)\n- **Secondary data:** Collected by others (newspapers, websites, Statistics South Africa)\n\n### Samples and Populations\n\n- **Population:** The entire group being studied (e.g. all Grade 8 learners in Gauteng)\n- **Sample:** A smaller group selected from the population (e.g. 100 Grade 8 learners from 3 schools)\n\nA sample must be **representative** — it should reflect the characteristics of the population.'),
  t(2, '### Organising Data\n\n**Frequency table:** Lists each value and how often it occurs.\n\n**Example:** Test marks of 15 learners: $45, 52, 63, 45, 71, 52, 63, 45, 80, 71, 63, 52, 45, 80, 71$\n\n| Mark | Tally | Frequency |\n|------|-------|-----------|\n| 45 | IIII | 4 |\n| 52 | III | 3 |\n| 63 | III | 3 |\n| 71 | III | 3 |\n| 80 | II | 2 |\n\n**Grouped frequency table** (for large data sets with many different values):\n\n| Interval | Frequency |\n|----------|-----------|\n| 40 – 49 | 4 |\n| 50 – 59 | 3 |\n| 60 – 69 | 3 |\n| 70 – 79 | 3 |\n| 80 – 89 | 2 |\n\n**Stem-and-leaf display:** Preserves individual data values while showing the distribution.'),
  q(3, 'In the frequency table above, what is the mode?',
    ['45', '52', '63', '71'], 0,
    'The mode is the value with the highest frequency. Mark 45 appears 4 times, the most.'),
  t(4, '### Measures of Central Tendency\n\n| Measure | How to Find It |\n|---------|----------------|\n| **Mean** | $\\bar{x} = \\frac{\\text{sum of all values}}{\\text{number of values}}$ |\n| **Median** | Middle value when data is ordered from smallest to largest |\n| **Mode** | Most frequently occurring value |\n\n**Example:** Data: $5, 8, 3, 12, 8, 6, 8$\n\n- **Ordered:** $3, 5, 6, 8, 8, 8, 12$\n- **Mean:** $\\frac{3+5+6+8+8+8+12}{7} = \\frac{50}{7} \\approx 7{,}14$\n- **Median:** 8 (the 4th value out of 7)\n- **Mode:** 8 (appears three times)\n\n**Even number of values:** Median is the average of the two middle values.\n\nData: $4, 7, 9, 12$ → Median $= \\frac{7 + 9}{2} = 8$'),
  q(5, 'Find the median of: $15, 22, 18, 30, 25$.',
    ['22', '18', '25', '22{,}5'], 0,
    'Order: $15, 18, 22, 25, 30$. The middle value (3rd of 5) is $22$.'),
  fb(6, 'The ___ is the sum of values divided by the number of values. The ___ is the middle value of an ordered data set.',
    ['mean', 'median'],
    'Mean = sum ÷ count. Median = middle value of sorted data.'),
  t(7, '### Measures of Dispersion\n\n**Range** $=$ maximum value $-$ minimum value\n\nThe range tells us how **spread out** the data is.\n\n**Example:** Data: $12, 25, 18, 40, 32$\n- Range $= 40 - 12 = 28$\n\n**Extremes:** The highest and lowest values in a data set.\n\n**Outliers:** Values that are much higher or lower than the rest. Outliers affect the **mean** but not the **median**.\n\n**Example:** Salaries at a small business in Polokwane:\n$R6\\,000, \\quad R7\\,000, \\quad R8\\,000, \\quad R9\\,000, \\quad R80\\,000$\n\n- Mean $= \\frac{110\\,000}{5} = R22\\,000$ (pulled up by the outlier)\n- Median $= R8\\,000$ (not affected by the outlier)\n\nThe **median** better represents the typical salary here.'),
  q(8, 'The ages of 5 learners are: 13, 14, 13, 15, 13. What is the range?',
    ['2', '13', '15', '3'], 0,
    'Range $= 15 - 13 = 2$.'),
  t(9, '### Representing Data\n\nChoose the correct graph for your data:\n\n| Graph | Use When |\n|-------|----------|\n| **Bar graph** | Comparing categories |\n| **Double bar graph** | Comparing two groups across categories |\n| **Histogram** | Showing grouped continuous data (no gaps) |\n| **Pie chart** | Showing parts of a whole |\n| **Broken-line graph** | Showing change over time |\n\n**Key difference:** Bar graphs have **gaps** between bars (discrete data). Histograms have **no gaps** (continuous grouped data).\n\n**SA Context:** Statistics South Africa (Stats SA) uses bar graphs and pie charts to show population data. For example, a pie chart can show the percentage of South Africans speaking each of the 11 official languages.'),
  q(10, 'Which graph is best for showing how the temperature changed over a week?',
    ['Broken-line graph', 'Pie chart', 'Bar graph', 'Histogram'], 0,
    'A broken-line graph (line graph) shows change over time — perfect for tracking temperature each day.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Probability (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Basic Probability ---
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Probability\n\nProbability measures how **likely** an event is to happen.\n\n$$P(\\text{event}) = \\frac{\\text{number of favourable outcomes}}{\\text{total number of possible outcomes}}$$\n\n### Probability Scale\n\n$$0 \\leq P(\\text{event}) \\leq 1$$\n\n| Probability | Meaning | Example |\n|------------|---------|--------|\n| $P = 0$ | Impossible | Rolling a 7 on a standard die |\n| $0 < P < 0{,}5$ | Unlikely | Rolling a 6 |\n| $P = 0{,}5$ | Even chance | Getting heads on a coin |\n| $0{,}5 < P < 1$ | Likely | Rolling less than 5 |\n| $P = 1$ | Certain | Rolling less than 7 |\n\nProbability can be written as a fraction, decimal, or percentage.'),
  t(2, '### Equally Likely Outcomes\n\n**Dice:** A fair die has 6 equally likely outcomes: $\\{1, 2, 3, 4, 5, 6\\}$.\n- $P(4) = \\frac{1}{6}$\n- $P(\\text{even}) = \\frac{3}{6} = \\frac{1}{2}$\n- $P(\\text{less than 3}) = \\frac{2}{6} = \\frac{1}{3}$\n\n**Coins:** $P(\\text{heads}) = \\frac{1}{2}$\n\n**Marbles in a bag:** If there are 4 red, 3 blue, and 5 green marbles:\n- Total $= 12$\n- $P(\\text{red}) = \\frac{4}{12} = \\frac{1}{3}$\n- $P(\\text{blue}) = \\frac{3}{12} = \\frac{1}{4}$\n- $P(\\text{green}) = \\frac{5}{12}$\n\n### Complement\n\n$$P(\\text{not } A) = 1 - P(A)$$\n\n$P(\\text{not red}) = 1 - \\frac{1}{3} = \\frac{2}{3}$'),
  q(3, 'A bag has 6 red balls and 4 yellow balls. What is $P$(yellow)?',
    ['$\\frac{2}{5}$', '$\\frac{3}{5}$', '$\\frac{4}{6}$', '$\\frac{1}{4}$'], 0,
    'Total $= 10$. $P(\\text{yellow}) = \\frac{4}{10} = \\frac{2}{5}$.'),
  t(4, '### Listing Outcomes\n\nTo find all possible outcomes, list them systematically.\n\n**Two coins tossed:**\n$\\{HH, HT, TH, TT\\}$ — 4 outcomes\n\n$P(\\text{two heads}) = \\frac{1}{4}$\n$P(\\text{at least one head}) = \\frac{3}{4}$\n\n**Die and coin:**\n\n|  | H | T |\n|---|---|---|\n| 1 | (1,H) | (1,T) |\n| 2 | (2,H) | (2,T) |\n| 3 | (3,H) | (3,T) |\n| 4 | (4,H) | (4,T) |\n| 5 | (5,H) | (5,T) |\n| 6 | (6,H) | (6,T) |\n\nTotal: $6 \\times 2 = 12$ outcomes.\n\n$P(\\text{3 and heads}) = \\frac{1}{12}$\n$P(\\text{even and tails}) = \\frac{3}{12} = \\frac{1}{4}$'),
  q(5, 'Two coins are tossed. What is $P$(one head and one tail)?',
    ['$\\frac{1}{2}$', '$\\frac{1}{4}$', '$\\frac{3}{4}$', '$\\frac{1}{3}$'], 0,
    'Outcomes: HH, HT, TH, TT. Favourable (one H and one T): HT, TH = 2. $P = \\frac{2}{4} = \\frac{1}{2}$.'),
  fb(6, 'The probability of an impossible event is ___. The probabilities of all possible outcomes always add up to ___.',
    ['0', '1'],
    '$P(\\text{impossible}) = 0$. All probabilities sum to 1.'),
  t(7, '### Relative Frequency vs Theoretical Probability\n\n**Theoretical probability** is calculated from what we know about the experiment (e.g. a fair coin has $P(H) = 0{,}5$).\n\n**Relative frequency** (experimental probability) is calculated from actual experiments:\n$$\\text{Relative frequency} = \\frac{\\text{number of times event occurred}}{\\text{total number of trials}}$$\n\n**Example:** Zanele tosses a coin 50 times and gets heads 23 times.\n- Relative frequency of heads $= \\frac{23}{50} = 0{,}46$\n- Theoretical probability $= 0{,}5$\n\nThe relative frequency is close but not exactly $0{,}5$. As the number of trials increases, the relative frequency gets **closer** to the theoretical probability.\n\nThis principle is called the **Law of Large Numbers**.'),
  q(8, 'A die is rolled 60 times. A 3 appears 12 times. What is the relative frequency?',
    ['$\\frac{1}{5}$', '$\\frac{1}{6}$', '$\\frac{1}{3}$', '$\\frac{12}{6}$'], 0,
    'Relative frequency $= \\frac{12}{60} = \\frac{1}{5} = 0{,}2$.'),
  t(9, '### Predicting Outcomes\n\nIf you know the probability, you can **predict** how many times an event should occur.\n\n$$\\text{Expected frequency} = P(\\text{event}) \\times \\text{number of trials}$$\n\n**Example:** A die is rolled 300 times. How many times do we expect to roll a 5?\n$$\\frac{1}{6} \\times 300 = 50 \\text{ times}$$\n\n**Example:** A spinner has 3 equal sections: red, blue, green. If spun 90 times, we expect:\n- Red: $\\frac{1}{3} \\times 90 = 30$ times\n- Blue: $30$ times\n- Green: $30$ times\n\n**SA Context:** The South African National Lottery draws 6 numbers from 1 to 52. Each number has an equal probability of $\\frac{1}{52}$ of being drawn in each position. Over many draws, each number should appear roughly the same number of times.'),
  q(10, 'A coin is tossed 200 times. How many times do you expect heads?',
    ['100', '50', '200', '150'], 0,
    '$P(\\text{heads}) = \\frac{1}{2}$. Expected frequency $= \\frac{1}{2} \\times 200 = 100$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 13: Geometry of Straight Lines (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Angle Relationships ---
blockNum = 0;
const ch13_lesson1 = [
  t(1, '## Geometry of Straight Lines\n\n### Basic Angle Facts\n\n| Term | Definition |\n|------|------------|\n| **Acute angle** | Less than $90°$ |\n| **Right angle** | Exactly $90°$ |\n| **Obtuse angle** | Between $90°$ and $180°$ |\n| **Straight angle** | Exactly $180°$ |\n| **Reflex angle** | Between $180°$ and $360°$ |\n| **Revolution** | Exactly $360°$ |\n\n### Angles on a Straight Line\n\nAngles on a straight line add up to $180°$ (they are **supplementary**).\n\nIf $\\angle A + \\angle B = 180°$, then $\\angle A$ and $\\angle B$ are supplementary.\n\n**Example:** If one angle on a straight line is $65°$, the other is $180° - 65° = 115°$.'),
  t(2, '### Vertically Opposite Angles\n\nWhen two straight lines intersect, they form two pairs of **vertically opposite angles**.\n\nVertically opposite angles are **equal**.\n\n**Example:** Two lines cross. One angle is $72°$. The vertically opposite angle is also $72°$. The other two angles are each $180° - 72° = 108°$.\n\n### Angles Around a Point\n\nAngles around a point add up to $360°$.\n\n**Example:** Three angles around a point are $120°$, $85°$, and $x$.\n$$120° + 85° + x = 360°$$\n$$x = 155°$$'),
  q(3, 'Two straight lines intersect. One angle is $48°$. What is the vertically opposite angle?',
    ['$48°$', '$132°$', '$42°$', '$96°$'], 0,
    'Vertically opposite angles are equal. The answer is $48°$.'),
  t(4, '### Parallel Lines Cut by a Transversal\n\nWhen a **transversal** (a line that crosses two other lines) cuts **parallel lines**, special angle pairs are formed.\n\n| Angle Pair | Position | Relationship |\n|-----------|----------|-------------|\n| **Corresponding** (F-angles) | Same position at each intersection | Equal |\n| **Alternate interior** (Z-angles) | Opposite sides of transversal, between parallel lines | Equal |\n| **Co-interior** (C-angles/U-angles) | Same side of transversal, between parallel lines | Supplementary ($= 180°$) |\n\n**How to remember:**\n- Corresponding angles form an "F" shape\n- Alternate angles form a "Z" shape\n- Co-interior angles form a "C" or "U" shape'),
  q(5, 'Two parallel lines are cut by a transversal. One co-interior angle is $65°$. What is the other co-interior angle?',
    ['$115°$', '$65°$', '$180°$', '$25°$'], 0,
    'Co-interior angles are supplementary: $180° - 65° = 115°$.'),
  fb(6, 'Vertically opposite angles are ___. Co-interior angles formed by parallel lines are ___ (add up to $180°$).',
    ['equal', 'supplementary'],
    'Vertically opposite angles are always equal. Co-interior angles between parallel lines add to $180°$.'),
  t(7, '### Solving Angle Problems\n\n**Example 1:** Lines $AB$ and $CD$ are parallel. A transversal crosses them. Angle $a = 70°$. Find angle $b$ (alternate to $a$) and angle $c$ (co-interior with $a$).\n- $b = 70°$ (alternate angles are equal)\n- $c = 180° - 70° = 110°$ (co-interior angles are supplementary)\n\n**Example 2:** Two angles on a straight line are $(2x + 10)°$ and $(3x - 5)°$. Find $x$.\n$$(2x + 10) + (3x - 5) = 180$$\n$$5x + 5 = 180$$\n$$5x = 175$$\n$$x = 35$$\nThe angles are $80°$ and $100°$.\n\n**Important:** Always state the **reason** for each step in geometry.\n- "Angles on a straight line"\n- "Vertically opposite angles"\n- "Corresponding angles (parallel lines)"\n- "Alternate angles (parallel lines)"\n- "Co-interior angles (parallel lines)"'),
  q(8, 'Two angles on a straight line are $x°$ and $(2x + 30)°$. Find $x$.',
    ['50', '60', '45', '70'], 0,
    '$x + (2x + 30) = 180$. $3x + 30 = 180$. $3x = 150$. $x = 50$.'),
  t(9, '### Perpendicular Lines\n\n**Perpendicular lines** meet at a right angle ($90°$).\n\nWe write $AB \\perp CD$ to show that line $AB$ is perpendicular to line $CD$.\n\n**Properties:**\n- All four angles formed are $90°$.\n- A perpendicular bisector divides a line segment into two equal parts at $90°$.\n\n**SA Context:** Many street grids in South African cities use perpendicular lines. In central Johannesburg, streets like Commissioner and Fox Street run at right angles to streets like Sauer and Eloff Street.'),
  q(10, 'Line $PQ$ is perpendicular to line $RS$. What is the size of the angle between them?',
    ['$90°$', '$180°$', '$45°$', '$360°$'], 0,
    'Perpendicular lines meet at $90°$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 14: Geometry of 2D Shapes (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Triangles ---
blockNum = 0;
const ch14_lesson1 = [
  t(1, '## Triangles\n\nA **triangle** has three sides and three angles. The sum of the interior angles of any triangle is $180°$.\n\n### Classification by Sides\n\n| Type | Properties |\n|------|------------|\n| **Scalene** | No sides equal, no angles equal |\n| **Isosceles** | Two sides equal, two base angles equal |\n| **Equilateral** | All three sides equal, all angles $= 60°$ |\n\n### Classification by Angles\n\n| Type | Properties |\n|------|------------|\n| **Acute-angled** | All angles less than $90°$ |\n| **Right-angled** | One angle exactly $90°$ |\n| **Obtuse-angled** | One angle greater than $90°$ |\n\nA triangle can be classified by **both** its sides and angles. For example, a "right-angled isosceles triangle" has a $90°$ angle and two equal sides.'),
  t(2, '### Angle Sum Property of Triangles\n\nThe three interior angles of any triangle add up to $180°$:\n$$\\angle A + \\angle B + \\angle C = 180°$$\n\n**Example:** In $\\triangle PQR$, $\\angle P = 55°$ and $\\angle Q = 70°$. Find $\\angle R$.\n$$\\angle R = 180° - 55° - 70° = 55°$$\n\nSince two angles are equal ($55°$), this is an **isosceles** triangle.\n\n### Exterior Angle Theorem\n\nAn exterior angle of a triangle equals the **sum of the two non-adjacent interior angles**.\n\n**Example:** In $\\triangle ABC$, $\\angle A = 50°$, $\\angle B = 65°$. The exterior angle at $C$:\n$$= \\angle A + \\angle B = 50° + 65° = 115°$$\n\nNote: $\\angle C = 180° - 50° - 65° = 65°$, and the exterior angle $= 180° - 65° = 115°$ ✓'),
  q(3, 'In $\\triangle ABC$, $\\angle A = 40°$ and $\\angle B = 80°$. Find $\\angle C$.',
    ['$60°$', '$100°$', '$40°$', '$80°$'], 0,
    '$\\angle C = 180° - 40° - 80° = 60°$.'),
  t(4, '### Properties of Isosceles and Equilateral Triangles\n\n**Isosceles triangle:**\n- Two sides are equal\n- The base angles (angles opposite the equal sides) are equal\n- The line of symmetry bisects the apex angle and the base\n\n**Example:** An isosceles triangle has an apex angle of $40°$. Find the base angles.\n$$\\text{Each base angle} = \\frac{180° - 40°}{2} = \\frac{140°}{2} = 70°$$\n\n**Equilateral triangle:**\n- All three sides are equal\n- All three angles are $60°$\n- It has three lines of symmetry\n\n**Solving problems:**\n\n**Example:** In $\\triangle XYZ$, $XY = XZ$ and $\\angle Y = 72°$. Find $\\angle X$.\n- Since $XY = XZ$, the triangle is isosceles, so $\\angle Y = \\angle Z = 72°$.\n- $\\angle X = 180° - 72° - 72° = 36°$'),
  q(5, 'An isosceles triangle has a base angle of $55°$. What is the apex angle?',
    ['$70°$', '$55°$', '$125°$', '$110°$'], 0,
    'Both base angles are $55°$. Apex $= 180° - 55° - 55° = 70°$.'),
  fb(6, 'The interior angles of a triangle always add up to ___°. An equilateral triangle has all angles equal to ___°.',
    ['180', '60'],
    'Triangle angles sum to $180°$. Equilateral: $180° \\div 3 = 60°$ each.'),
  t(7, '## Quadrilaterals\n\nA **quadrilateral** has four sides and four angles. The sum of interior angles is $360°$.\n\n| Quadrilateral | Key Properties |\n|---------------|---------------|\n| **Parallelogram** | Opposite sides parallel and equal; opposite angles equal; diagonals bisect each other |\n| **Rectangle** | Parallelogram with all angles $= 90°$; diagonals equal in length |\n| **Square** | Rectangle with all sides equal; diagonals perpendicular |\n| **Rhombus** | Parallelogram with all sides equal; diagonals perpendicular and bisect angles |\n| **Trapezium** | One pair of opposite sides parallel |\n| **Kite** | Two pairs of adjacent sides equal; one pair of opposite angles equal; diagonals perpendicular |\n\nEvery square is a rectangle and a rhombus. Every rectangle is a parallelogram. Every rhombus is a parallelogram.'),
  q(8, 'Which quadrilateral has opposite sides parallel, all sides equal, but angles are NOT $90°$?',
    ['Rhombus', 'Square', 'Rectangle', 'Trapezium'], 0,
    'A rhombus has all sides equal and opposite sides parallel, but its angles are not necessarily $90°$. A square would have $90°$ angles.'),
  t(9, '### Solving Problems with Quadrilaterals\n\n**Example 1:** Find the missing angle in a quadrilateral where three angles are $85°$, $110°$, and $95°$.\n$$x = 360° - 85° - 110° - 95° = 70°$$\n\n**Example 2:** In parallelogram $ABCD$, $\\angle A = 65°$. Find all other angles.\n- $\\angle C = 65°$ (opposite angles are equal)\n- $\\angle B = 180° - 65° = 115°$ (co-interior angles, $AB \\parallel DC$)\n- $\\angle D = 115°$\n\n**Example 3:** A rhombus has one angle of $130°$. Find the other angles.\n- Opposite angle $= 130°$\n- Other two angles $= \\frac{360° - 2(130°)}{2} = \\frac{100°}{2} = 50°$ each'),
  q(10, 'In a parallelogram, one angle is $72°$. What is the angle adjacent to it?',
    ['$108°$', '$72°$', '$288°$', '$144°$'], 0,
    'Adjacent angles in a parallelogram are supplementary: $180° - 72° = 108°$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 15: Theorem of Pythagoras (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Developing and Using the Theorem of Pythagoras ---
blockNum = 0;
const ch15_lesson1 = [
  t(1, '## The Theorem of Pythagoras\n\nIn any **right-angled triangle**, the square of the hypotenuse equals the sum of the squares of the other two sides.\n\n$$c^2 = a^2 + b^2$$\n\nwhere $c$ is the **hypotenuse** (the longest side, opposite the right angle) and $a$, $b$ are the other two sides.\n\n### Discovering the Theorem\n\nDraw a right triangle with sides 3 cm, 4 cm, and 5 cm. Draw squares on each side:\n- Area of square on side $a = 3$: $9$ cm$^2$\n- Area of square on side $b = 4$: $16$ cm$^2$\n- Area of square on side $c = 5$: $25$ cm$^2$\n\nNotice: $9 + 16 = 25$, i.e. $a^2 + b^2 = c^2$ ✓'),
  t(2, '### Finding the Hypotenuse\n\n$$c = \\sqrt{a^2 + b^2}$$\n\n**Example 1:** A right triangle has legs 6 cm and 8 cm.\n$$c = \\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10 \\text{ cm}$$\n\n### Finding a Shorter Side\n\n$$a = \\sqrt{c^2 - b^2}$$\n\n**Example 2:** The hypotenuse is 13 cm and one leg is 5 cm.\n$$a = \\sqrt{13^2 - 5^2} = \\sqrt{169 - 25} = \\sqrt{144} = 12 \\text{ cm}$$\n\n### Pythagorean Triples\n\nSets of whole numbers that satisfy $a^2 + b^2 = c^2$:\n- $(3, 4, 5)$ and multiples: $(6, 8, 10)$, $(9, 12, 15)$\n- $(5, 12, 13)$ and multiples: $(10, 24, 26)$\n- $(8, 15, 17)$'),
  q(3, 'A right triangle has legs 5 cm and 12 cm. Find the hypotenuse.',
    ['13 cm', '17 cm', '7 cm', '60 cm'], 0,
    '$c = \\sqrt{5^2 + 12^2} = \\sqrt{25 + 144} = \\sqrt{169} = 13$ cm.'),
  t(4, '### The Converse of the Theorem\n\nIf $a^2 + b^2 = c^2$ for the three sides of a triangle (where $c$ is the longest), then the triangle is **right-angled**.\n\n**Example:** Is a triangle with sides 9, 12, and 15 right-angled?\n$$9^2 + 12^2 = 81 + 144 = 225 = 15^2$$\nYes, it is right-angled. ✓\n\n**Example:** Is a triangle with sides 7, 8, and 10 right-angled?\n$$7^2 + 8^2 = 49 + 64 = 113 \\neq 100 = 10^2$$\nNo, it is NOT right-angled.\n\nSince $113 > 100$ ($a^2 + b^2 > c^2$), the triangle is **acute-angled**.\nIf $a^2 + b^2 < c^2$, the triangle would be **obtuse-angled**.'),
  q(5, 'A triangle has sides 8, 15, and 17. Is it right-angled?',
    ['Yes', 'No, it is acute', 'No, it is obtuse', 'Cannot tell'], 0,
    '$8^2 + 15^2 = 64 + 225 = 289 = 17^2$. Yes, it is right-angled.'),
  fb(6, 'In a right-angled triangle, the longest side is called the ___. The Pythagorean theorem is $c^2 = a^2 + ___$.',
    ['hypotenuse', 'b squared'],
    'The hypotenuse is opposite the right angle. Pythagoras: $c^2 = a^2 + b^2$.'),
  t(7, '### Real-World Applications\n\n**Example 1:** A ladder 10 m long leans against a wall in a Cape Town house. The foot of the ladder is 6 m from the wall. How high does it reach?\n$$h = \\sqrt{10^2 - 6^2} = \\sqrt{100 - 36} = \\sqrt{64} = 8 \\text{ m}$$\n\n**Example 2:** A rectangular sports field at a school in Durban is 80 m by 60 m. A learner runs diagonally across the field. How far does she run?\n$$d = \\sqrt{80^2 + 60^2} = \\sqrt{6\\,400 + 3\\,600} = \\sqrt{10\\,000} = 100 \\text{ m}$$\n\n**Example 3:** An isosceles triangle has two equal sides of 10 cm and a base of 12 cm. Find the height.\n- The height bisects the base into two segments of 6 cm.\n$$h = \\sqrt{10^2 - 6^2} = \\sqrt{100 - 36} = \\sqrt{64} = 8 \\text{ cm}$$'),
  q(8, 'A ladder 5 m long leans against a wall with its base 3 m from the wall. How high up the wall does it reach?',
    ['4 m', '8 m', '2 m', '6 m'], 0,
    '$h = \\sqrt{5^2 - 3^2} = \\sqrt{25 - 9} = \\sqrt{16} = 4$ m.'),
  t(9, '### Leaving Answers in Surd Form\n\nSometimes the answer is not a perfect square. In that case, leave it in **surd form** (irrational).\n\n**Example:** A right triangle has legs 4 cm and 7 cm. Find the hypotenuse.\n$$c = \\sqrt{16 + 49} = \\sqrt{65} \\approx 8{,}06 \\text{ cm}$$\n\n$\\sqrt{65}$ is an **irrational number** — it cannot be written as a fraction. In surd form, the exact answer is $\\sqrt{65}$ cm.\n\n**Example:** A square has a side of 5 cm. Find the diagonal.\n$$d = \\sqrt{5^2 + 5^2} = \\sqrt{50} = \\sqrt{25 \\times 2} = 5\\sqrt{2} \\approx 7{,}07 \\text{ cm}$$\n\nWe can simplify $\\sqrt{50}$ by taking out the perfect square factor: $\\sqrt{50} = 5\\sqrt{2}$.'),
  q(10, 'A right triangle has legs 1 cm and 1 cm. What is the hypotenuse in surd form?',
    ['$\\sqrt{2}$ cm', '$2$ cm', '$1$ cm', '$\\sqrt{3}$ cm'], 0,
    '$c = \\sqrt{1^2 + 1^2} = \\sqrt{2}$ cm.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 16: Transformation Geometry (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Transformations on the Cartesian Plane ---
blockNum = 0;
const ch16_lesson1 = [
  t(1, '## Transformation Geometry\n\nA **transformation** changes the position, size, or orientation of a figure on the Cartesian plane.\n\n| Transformation | What it does | Changes size? |\n|----------------|-------------|---------------|\n| Translation | Slides the shape | No |\n| Reflection | Flips over a line | No |\n| Rotation | Turns around a point | No |\n\nThese three are **rigid transformations** (isometries) — they preserve shape and size.\n\nIn Grade 8, we also introduce **enlargements and reductions**, which do change size.'),
  t(2, '### Translation\n\nA **translation** slides every point the same distance in the same direction.\n\nRule: $(x, y) \\rightarrow (x + a, y + b)$\n\n**Example:** Translate $A(3, 2)$ by 4 units left and 3 units up.\n$$(3, 2) \\rightarrow (3 - 4, 2 + 3) = (-1, 5)$$\n\n**Example:** Translate $\\triangle PQR$ with $P(1, 1)$, $Q(4, 1)$, $R(1, 3)$ by $(+2, -3)$.\n- $P\' = (3, -2)$\n- $Q\' = (6, -2)$\n- $R\' = (3, 0)$\n\nThe shape and size stay the same — only the position changes.'),
  q(3, 'Point $A(5, -3)$ is translated 3 units right and 4 units up. What are the new coordinates?',
    ['$(8, 1)$', '$(2, 1)$', '$(8, -7)$', '$(2, -7)$'], 0,
    '$(5 + 3, -3 + 4) = (8, 1)$.'),
  t(4, '### Reflection\n\nA **reflection** flips a figure over a **line of reflection** (mirror line).\n\n| Reflection | Rule |\n|-----------|------|\n| In the $x$-axis | $(x, y) \\rightarrow (x, -y)$ |\n| In the $y$-axis | $(x, y) \\rightarrow (-x, y)$ |\n| In the line $y = x$ | $(x, y) \\rightarrow (y, x)$ |\n\n**Example:** Reflect $P(4, 3)$ in the $x$-axis: $P\' = (4, -3)$\n**Example:** Reflect $Q(-2, 5)$ in the $y$-axis: $Q\' = (2, 5)$\n**Example:** Reflect $R(3, 7)$ in the line $y = x$: $R\' = (7, 3)$\n\nReflection produces a **mirror image** — the shape and size stay the same, but the orientation is reversed.'),
  q(5, 'Point $B(-3, 4)$ is reflected in the $x$-axis. What are the new coordinates?',
    ['$(-3, -4)$', '$(3, 4)$', '$(3, -4)$', '$(-3, 4)$'], 0,
    'Reflection in the $x$-axis: $(x, y) \\rightarrow (x, -y)$. So $B\' = (-3, -4)$.'),
  fb(6, 'Reflection in the $y$-axis changes $(x, y)$ to $(___, y)$. Reflection in the line $y = x$ swaps the $x$ and $y$ values: $(x, y) \\rightarrow (y, ___)$.',
    ['-x', 'x'],
    '$y$-axis reflection: $(x, y) \\rightarrow (-x, y)$. $y = x$ reflection: $(x, y) \\rightarrow (y, x)$.'),
  t(7, '### Rotation\n\nA **rotation** turns a figure around a fixed point (the **centre of rotation**) by a given angle.\n\nCommon rotations about the origin:\n\n| Rotation | Rule |\n|----------|------|\n| $90°$ anticlockwise | $(x, y) \\rightarrow (-y, x)$ |\n| $180°$ | $(x, y) \\rightarrow (-x, -y)$ |\n| $270°$ anticlockwise (= $90°$ clockwise) | $(x, y) \\rightarrow (y, -x)$ |\n\n**Example:** Rotate $A(2, 5)$ by $90°$ anticlockwise about the origin.\n$A\' = (-5, 2)$\n\n**Example:** Rotate $B(3, -1)$ by $180°$ about the origin.\n$B\' = (-3, 1)$\n\n**Tip:** A $180°$ rotation gives the same result clockwise or anticlockwise.'),
  q(8, 'Point $C(4, -2)$ is rotated $180°$ about the origin. What are the coordinates of $C\'$?',
    ['$(-4, 2)$', '$(2, 4)$', '$(4, 2)$', '$(-2, -4)$'], 0,
    '$180°$ rotation: $(x, y) \\rightarrow (-x, -y)$. So $C\' = (-4, 2)$.'),
  t(9, '### Enlargement and Reduction\n\nAn **enlargement** (or **reduction**) multiplies all coordinates by a **scale factor** $k$.\n\n$$(x, y) \\rightarrow (kx, ky)$$\n\n- $k > 1$: enlargement (figure gets bigger)\n- $0 < k < 1$: reduction (figure gets smaller)\n\n**Example:** Enlarge $\\triangle ABC$ with $A(1, 2)$, $B(3, 2)$, $C(1, 4)$ by scale factor $k = 2$.\n- $A\' = (2, 4)$, $B\' = (6, 4)$, $C\' = (2, 8)$\n\n**Effect on measurements:**\n- Side lengths are multiplied by $k$\n- Perimeter is multiplied by $k$\n- Area is multiplied by $k^2$\n\n**Example:** A map of South Africa uses scale $1:1\\,000\\,000$. A distance of 5 cm on the map represents $5 \\times 1\\,000\\,000 = 5\\,000\\,000$ cm $= 50$ km in real life.'),
  q(10, 'A triangle is reduced by a scale factor of $\\frac{1}{2}$. If the original area was 24 cm$^2$, what is the new area?',
    ['6 cm$^2$', '12 cm$^2$', '48 cm$^2$', '3 cm$^2$'], 0,
    'Area is multiplied by $k^2 = \\left(\\frac{1}{2}\\right)^2 = \\frac{1}{4}$. New area $= \\frac{1}{4} \\times 24 = 6$ cm$^2$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 17: Area and Perimeter of 2D Shapes (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Area and Perimeter ---
blockNum = 0;
const ch17_lesson1 = [
  t(1, '## Area and Perimeter of 2D Shapes\n\n**Perimeter** is the total distance around a shape.\n**Area** is the amount of surface a shape covers.\n\n### Formulae\n\n| Shape | Perimeter | Area |\n|-------|-----------|------|\n| Square (side $s$) | $P = 4s$ | $A = s^2$ |\n| Rectangle ($l \\times b$) | $P = 2(l + b)$ | $A = l \\times b$ |\n| Triangle (base $b$, height $h$) | $P = a + b + c$ | $A = \\frac{1}{2}bh$ |\n| Circle (radius $r$) | $C = 2\\pi r$ | $A = \\pi r^2$ |\n\n**Remember:**\n- The height of a triangle must be **perpendicular** to the base.\n- Use $\\pi \\approx 3{,}14$ or leave answers in terms of $\\pi$.'),
  t(2, '### Worked Examples\n\n**Example 1:** Find the perimeter and area of a rectangle with $l = 15$ cm and $b = 8$ cm.\n- $P = 2(15 + 8) = 2(23) = 46$ cm\n- $A = 15 \\times 8 = 120$ cm$^2$\n\n**Example 2:** A triangular garden at a school in Port Elizabeth has base 10 m and height 6 m.\n- $A = \\frac{1}{2} \\times 10 \\times 6 = 30$ m$^2$\n\n**Example 3:** A circular swimming pool has a diameter of 8 m.\n- Radius $= 4$ m\n- Circumference $= 2\\pi(4) = 8\\pi \\approx 25{,}13$ m\n- Area $= \\pi(4)^2 = 16\\pi \\approx 50{,}27$ m$^2$\n\n**Example 4:** A triangle has a base of 12 cm and an area of 42 cm$^2$. Find the height.\n- $42 = \\frac{1}{2} \\times 12 \\times h$\n- $42 = 6h$\n- $h = 7$ cm'),
  q(3, 'A circle has a radius of 7 cm. What is its area? (Use $\\pi \\approx \\frac{22}{7}$)',
    ['154 cm$^2$', '44 cm$^2$', '49 cm$^2$', '308 cm$^2$'], 0,
    '$A = \\pi r^2 = \\frac{22}{7} \\times 49 = 154$ cm$^2$.'),
  t(4, '### Composite Shapes\n\nA **composite shape** is made up of two or more basic shapes.\n\n**Strategy:**\n1. Break the shape into rectangles, triangles, semicircles, etc.\n2. Calculate the area of each part.\n3. Add (or subtract) as needed.\n\n**Example:** A school badge in Kimberley consists of a rectangle (6 cm × 4 cm) with a semicircle on top (diameter = 6 cm).\n\n- Rectangle area: $6 \\times 4 = 24$ cm$^2$\n- Semicircle: radius $= 3$ cm, area $= \\frac{1}{2}\\pi(3)^2 = \\frac{9\\pi}{2} \\approx 14{,}14$ cm$^2$\n- Total area $\\approx 24 + 14{,}14 = 38{,}14$ cm$^2$\n\n**Perimeter:** Straight sides: $4 + 6 + 4 = 14$ cm. Semicircle arc: $\\frac{1}{2} \\times 2\\pi(3) = 3\\pi \\approx 9{,}42$ cm. Total $\\approx 23{,}42$ cm.'),
  q(5, 'A shape is a square with side 10 cm, with a semicircle removed from one side. What is the area? (Use $\\pi \\approx 3{,}14$)',
    ['$60{,}75$ cm$^2$', '$100$ cm$^2$', '$139{,}25$ cm$^2$', '$78{,}5$ cm$^2$'], 0,
    'Square area $= 100$ cm$^2$. Semicircle (radius $= 5$): $\\frac{1}{2} \\times 3{,}14 \\times 25 = 39{,}25$ cm$^2$. Remaining area $= 100 - 39{,}25 = 60{,}75$ cm$^2$.'),
  fb(6, 'The formula for the area of a circle is $A = \\pi ___$. The circumference of a circle is $C = 2\\pi ___$.',
    ['r squared', 'r'],
    '$A = \\pi r^2$ (area). $C = 2\\pi r$ (circumference).'),
  t(7, '### The Relationship Between Radius, Diameter, and Circumference\n\nThe **diameter** is twice the **radius**: $d = 2r$.\n\nThe **circumference** is the distance around a circle.\n$$C = \\pi d = 2\\pi r$$\n\nThe ratio $\\frac{C}{d} = \\pi \\approx 3{,}14159\\ldots$\n\n$\\pi$ is an **irrational number** — its decimal expansion goes on forever without repeating.\n\n**SA Context:** The Johannesburg Ring Road (N1/N3/N12) is roughly circular with a radius of about 15 km.\n- Circumference $\\approx 2\\pi(15) \\approx 94{,}25$ km\n\n### Unit Conversions for Area\n\n| Conversion | Factor |\n|------------|--------|\n| cm$^2$ → m$^2$ | $\\div 10\\,000$ |\n| m$^2$ → cm$^2$ | $\\times 10\\,000$ |\n| mm$^2$ → cm$^2$ | $\\div 100$ |'),
  q(8, 'Convert 3 m$^2$ to cm$^2$.',
    ['30 000 cm$^2$', '300 cm$^2$', '3 000 cm$^2$', '300 000 cm$^2$'], 0,
    '$1$ m$^2 = 10\\,000$ cm$^2$. So $3$ m$^2 = 30\\,000$ cm$^2$.'),
  t(9, '### Solving Problems Involving Area and Perimeter\n\n**Example 1:** A rectangular room in a house in Polokwane is 5 m by 4 m. Calculate the cost of tiling the floor at R85 per m$^2$.\n- Area $= 5 \\times 4 = 20$ m$^2$\n- Cost $= 20 \\times R85 = R1\\,700$\n\n**Example 2:** A farmer near Graaff-Reinet wants to fence a circular kraal with diameter 14 m. Fencing costs R120 per metre. Find the cost.\n- Circumference $= \\pi(14) \\approx 43{,}98$ m\n- Cost $= 44 \\times R120 \\approx R5\\,280$ (rounding up to the nearest metre for fencing)\n\n**Example 3:** A triangular flower bed has sides 5 m, 5 m, and 6 m. The height from the base (6 m) is 4 m.\n- Perimeter $= 5 + 5 + 6 = 16$ m\n- Area $= \\frac{1}{2} \\times 6 \\times 4 = 12$ m$^2$'),
  q(10, 'Skirting board is fitted around a rectangular room 6 m by 4 m. The room has one door (0,8 m wide). How much skirting board is needed?',
    ['19{,}2 m', '20 m', '24 m', '10 m'], 0,
    'Perimeter $= 2(6 + 4) = 20$ m. Subtract door: $20 - 0{,}8 = 19{,}2$ m.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 18: Surface Area and Volume of 3D Objects (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Surface Area and Volume ---
blockNum = 0;
const ch18_lesson1 = [
  t(1, '## Surface Area and Volume of 3D Objects\n\n**Surface area** (SA) is the total area of all faces of a 3D object.\n**Volume** (V) is the space inside a 3D object.\n**Capacity** is the volume of liquid a container can hold.\n\n### Key Conversion\n$$1 \\text{ cm}^3 = 1 \\text{ ml} \\qquad 1\\,000 \\text{ cm}^3 = 1 \\text{ litre} \\qquad 1 \\text{ m}^3 = 1\\,000 \\text{ litres} = 1 \\text{ kl}$$\n\n### Formulae for Cubes and Rectangular Prisms\n\n| Solid | Surface Area | Volume |\n|-------|-------------|--------|\n| Cube (side $s$) | $SA = 6s^2$ | $V = s^3$ |\n| Rectangular prism ($l \\times b \\times h$) | $SA = 2(lb + bh + lh)$ | $V = lbh$ |'),
  t(2, '### Worked Examples — Cubes and Rectangular Prisms\n\n**Example 1:** A cube has a side length of 4 cm.\n- $SA = 6(4)^2 = 6 \\times 16 = 96$ cm$^2$\n- $V = (4)^3 = 64$ cm$^3$\n\n**Example 2:** A rectangular fish tank is 60 cm × 30 cm × 40 cm.\n- $SA = 2(60 \\times 30 + 30 \\times 40 + 60 \\times 40) = 2(1\\,800 + 1\\,200 + 2\\,400) = 2(5\\,400) = 10\\,800$ cm$^2$\n- $V = 60 \\times 30 \\times 40 = 72\\,000$ cm$^3$\n- Capacity $= 72\\,000 \\div 1\\,000 = 72$ litres\n\n**Example 3:** A box of Ouma Rusks is 22 cm × 8 cm × 10 cm.\n- $V = 22 \\times 8 \\times 10 = 1\\,760$ cm$^3$\n- If you need to wrap it with paper: $SA = 2(22 \\times 8 + 8 \\times 10 + 22 \\times 10) = 2(176 + 80 + 220) = 952$ cm$^2$'),
  q(3, 'A cube has a side of 5 cm. What is its volume?',
    ['125 cm$^3$', '25 cm$^2$', '150 cm$^3$', '30 cm$^3$'], 0,
    '$V = s^3 = 5^3 = 125$ cm$^3$.'),
  t(4, '### Triangular Prisms\n\nA triangular prism has two triangular bases and three rectangular faces.\n\n$$V = \\text{Area of base} \\times \\text{length}$$\n\n**Example:** A triangular prism has a right-angled triangular base with legs 3 cm and 4 cm. The length of the prism is 10 cm.\n\n- Hypotenuse $= \\sqrt{3^2 + 4^2} = 5$ cm\n- Area of base $= \\frac{1}{2} \\times 3 \\times 4 = 6$ cm$^2$\n- $V = 6 \\times 10 = 60$ cm$^3$\n- $SA = 2(6) + (3 + 4 + 5) \\times 10 = 12 + 120 = 132$ cm$^2$\n\n**SA Context:** A Toblerone chocolate box is a triangular prism. If it has an equilateral triangle base with side 3 cm and is 20 cm long:\n- Base area $= \\frac{\\sqrt{3}}{4}(3)^2 \\approx 3{,}90$ cm$^2$\n- $V \\approx 3{,}90 \\times 20 = 78$ cm$^3$'),
  q(5, 'A triangular prism has a base area of 15 cm$^2$ and a length of 8 cm. What is its volume?',
    ['120 cm$^3$', '23 cm$^3$', '60 cm$^3$', '240 cm$^3$'], 0,
    '$V = \\text{base area} \\times \\text{length} = 15 \\times 8 = 120$ cm$^3$.'),
  fb(6, 'The volume of any prism is: $V = $ area of ___ $\\times$ height. The conversion $1$ litre $= ___$ cm$^3$.',
    ['base', '1 000'],
    'Volume = base area × height. 1 litre = 1 000 cm$^3$.'),
  t(7, '### Converting Between Volume and Capacity Units\n\n| Conversion | Factor |\n|------------|--------|\n| cm$^3$ → ml | $1$ cm$^3$ $= 1$ ml |\n| cm$^3$ → litres | $\\div 1\\,000$ |\n| m$^3$ → litres | $\\times 1\\,000$ |\n| m$^3$ → kl | $1$ m$^3$ $= 1$ kl |\n| litres → cm$^3$ | $\\times 1\\,000$ |\n\n**Example:** A water tank is 2 m × 1 m × 1,5 m.\n- $V = 2 \\times 1 \\times 1{,}5 = 3$ m$^3$\n- Capacity $= 3 \\times 1\\,000 = 3\\,000$ litres $= 3$ kl\n\n**Example:** A can of cooldrink holds 340 ml $= 340$ cm$^3$.\n\n**SA Context:** JoJo water tanks commonly hold between 1 000 and 10 000 litres. A 5 000-litre tank has a volume of $5$ m$^3$.'),
  q(8, 'A rectangular tank holds 2 400 litres. If it is 1,5 m long and 1 m wide, what is its height?',
    ['1,6 m', '0,16 m', '16 m', '160 m'], 0,
    '$2\\,400$ litres $= 2{,}4$ m$^3$. $V = l \\times b \\times h$, so $2{,}4 = 1{,}5 \\times 1 \\times h$, giving $h = \\frac{2{,}4}{1{,}5} = 1{,}6$ m.'),
  t(9, '### Solving Problems with Surface Area and Volume\n\n**Example 1:** A school in Nelspruit needs to paint the outside walls of a storage room (rectangular prism). Dimensions: 4 m × 3 m × 2,5 m. The roof and floor are not painted. One door (2 m × 0,8 m) is not painted.\n\n- Wall area $= 2(4 \\times 2{,}5) + 2(3 \\times 2{,}5) = 20 + 15 = 35$ m$^2$\n- Subtract door: $35 - 1{,}6 = 33{,}4$ m$^2$\n- If 1 litre of paint covers 8 m$^2$: $\\frac{33{,}4}{8} \\approx 4{,}18$ litres → buy 5 litres.\n\n**Example 2:** How many small cubes (side 2 cm) can fit inside a box 12 cm × 8 cm × 6 cm?\n- Volume of box $= 576$ cm$^3$\n- Volume of small cube $= 8$ cm$^3$\n- Number of cubes $= \\frac{576}{8} = 72$'),
  q(10, 'A rectangular prism has a volume of 480 cm$^3$. Its length is 12 cm and breadth is 8 cm. What is its height?',
    ['5 cm', '4 cm', '6 cm', '10 cm'], 0,
    '$V = l \\times b \\times h$. $480 = 12 \\times 8 \\times h = 96h$. $h = \\frac{480}{96} = 5$ cm.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// DB INSERTION
// ═══════════════════════════════════════════════════════════════════════════════

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
    tags: ['mathematics', 'grade-8', 'caps'],
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
      description: 'Properties of whole numbers, prime factorisation, HCF and LCM, order of operations, ratio, percentage, VAT, simple interest, and budgets.',
      order: 1,
      lessons: [
        { title: 'Properties and Operations with Whole Numbers', description: 'Properties of operations, multiples and factors, prime factorisation, HCF and LCM, BODMAS, ratio, percentage, and problem solving.', blocks: ch1_lesson1, term: 1 },
        { title: 'Financial Problems with Whole Numbers', description: 'Percentage increase and decrease, VAT, simple interest, profit and loss, budgets, and financial problem solving.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Integers',
      description: 'Operations with integers: addition, subtraction, multiplication, division, combined operations using BODMAS, and solving real-world problems.',
      order: 2,
      lessons: [
        { title: 'Operations with Integers', description: 'Integer number line, ordering integers, addition, subtraction, multiplication, division, BODMAS with integers, and real-world applications.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Common Fractions',
      description: 'Addition, subtraction, multiplication and division of common fractions, mixed numbers, squares, cubes, roots of fractions, and problem solving.',
      order: 3,
      lessons: [
        { title: 'Operations with Common Fractions', description: 'Types of fractions, converting between mixed numbers and improper fractions, four operations with fractions, squares, cubes, roots, and word problems.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Decimal Fractions',
      description: 'Ordering, rounding, multiplication and division of decimal fractions, estimation, and converting between fractions, decimals, and percentages.',
      order: 4,
      lessons: [
        { title: 'Operations with Decimal Fractions', description: 'Place value, ordering decimals, rounding, multiplication, division, estimation, equivalent forms of fractions, decimals and percentages.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Exponents',
      description: 'Exponential notation, laws of exponents (product, quotient, power of a power, zero exponent), scientific notation, and perfect squares, cubes and roots.',
      order: 5,
      lessons: [
        { title: 'Laws of Exponents', description: 'Exponential form, five laws of exponents, scientific notation, perfect squares and cubes, square roots and cube roots.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Numeric and Geometric Patterns',
      description: 'Investigating, extending, and describing numeric and geometric patterns with constant differences and constant ratios, finding general rules.',
      order: 6,
      lessons: [
        { title: 'Investigating and Extending Patterns', description: 'Linear patterns with constant difference, general term formula, matchstick and dot patterns, patterns in tables, constant ratio patterns.', blocks: ch6_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 7: Algebraic Expressions',
      description: 'Algebraic terminology, adding and subtracting like terms, multiplying monomials and polynomials, dividing by monomials, and substitution.',
      order: 7,
      lessons: [
        { title: 'Algebraic Language and Operations', description: 'Variables, coefficients, constants, like and unlike terms, monomials, binomials, trinomials, expanding, dividing by monomials, and substitution.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Algebraic Equations',
      description: 'Setting up and solving linear equations using inverse operations, equations with variables on both sides, brackets, fractions, and word problems.',
      order: 8,
      lessons: [
        { title: 'Solving Linear Equations', description: 'Setting up equations, solving by inspection and inverse operations, variables on both sides, brackets, fractions, and word problems.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: Functions and Relationships',
      description: 'Input-output relationships, flow diagrams, tables of values, formulae, equivalent forms of functions, and substitution in equations.',
      order: 9,
      lessons: [
        { title: 'Input-Output and Flow Diagrams', description: 'Representations of functions (words, flow diagrams, tables, formulae), finding rules from tables, inverse flow diagrams, equivalent forms, substitution.', blocks: ch9_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 10: Graphs',
      description: 'Interpreting global graphs, features of graphs, drawing linear graphs from equations, gradient and y-intercept, finding equations from graphs.',
      order: 10,
      lessons: [
        { title: 'Interpreting and Drawing Graphs', description: 'Features of graphs (linear, increasing, decreasing, maximum, minimum), drawing y = mx + c, gradient, y-intercept, equation from a graph.', blocks: ch10_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 11: Data Handling',
      description: 'Collecting, organising, and summarising data. Frequency tables, measures of central tendency (mean, median, mode), range, outliers, and representing data with graphs.',
      order: 11,
      lessons: [
        { title: 'Collecting, Organising, and Summarising Data', description: 'Data-handling cycle, sources of data, frequency tables, mean, median, mode, range, outliers, bar graphs, histograms, pie charts, line graphs.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Probability',
      description: 'Theoretical probability, equally likely outcomes, complement, listing outcomes with two-way tables, relative frequency, and predicting outcomes.',
      order: 12,
      lessons: [
        { title: 'Basic Probability', description: 'Probability scale, equally likely outcomes, complement, listing outcomes, two-way tables, relative frequency, predicting outcomes, Law of Large Numbers.', blocks: ch12_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 13: Geometry of Straight Lines',
      description: 'Angle relationships: supplementary, vertically opposite, corresponding, alternate, and co-interior angles formed by parallel lines cut by a transversal.',
      order: 13,
      lessons: [
        { title: 'Angle Relationships', description: 'Types of angles, angles on a straight line, vertically opposite angles, angles around a point, parallel lines and transversals, corresponding, alternate and co-interior angles.', blocks: ch13_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 14: Geometry of 2D Shapes',
      description: 'Properties of triangles (classification, angle sum, exterior angle theorem), properties of quadrilaterals, and solving geometric problems.',
      order: 14,
      lessons: [
        { title: 'Triangles and Quadrilaterals', description: 'Classifying triangles, angle sum property, exterior angle theorem, isosceles and equilateral triangles, quadrilateral properties, solving angle problems.', blocks: ch14_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 15: Theorem of Pythagoras',
      description: 'Developing and using the Theorem of Pythagoras to find unknown sides in right-angled triangles, Pythagorean triples, the converse, and real-world applications.',
      order: 15,
      lessons: [
        { title: 'Developing and Using the Theorem of Pythagoras', description: 'Statement of Pythagoras, finding the hypotenuse and shorter sides, Pythagorean triples, the converse, classifying triangles, real-world applications, surd form.', blocks: ch15_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 16: Transformation Geometry',
      description: 'Translations, reflections (in the x-axis, y-axis, and y = x), rotations about the origin, and enlargements/reductions on the Cartesian plane.',
      order: 16,
      lessons: [
        { title: 'Transformations on the Cartesian Plane', description: 'Translation, reflection in axes and y = x, rotation about the origin (90°, 180°, 270°), enlargement and reduction, scale factor effects on area.', blocks: ch16_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 17: Area and Perimeter of 2D Shapes',
      description: 'Perimeter and area formulae for squares, rectangles, triangles, and circles. Composite shapes, unit conversions, and real-world problem solving.',
      order: 17,
      lessons: [
        { title: 'Area and Perimeter', description: 'Formulae for squares, rectangles, triangles, circles, composite shapes, relationship between radius diameter and circumference, unit conversions, problem solving.', blocks: ch17_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 18: Surface Area and Volume of 3D Objects',
      description: 'Surface area and volume of cubes, rectangular prisms, and triangular prisms. Volume-capacity conversions and real-world problem solving.',
      order: 18,
      lessons: [
        { title: 'Surface Area and Volume', description: 'Cubes, rectangular prisms, triangular prisms, volume and capacity conversions, real-world applications.', blocks: ch18_lesson1, term: 4 },
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
    title: 'Grade 8 Mathematics \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Whole Numbers, Integers, Common Fractions, Decimal Fractions, Exponents, Numeric and Geometric Patterns, Algebraic Expressions, Algebraic Equations, Functions and Relationships, Graphs, Data Handling, Probability, Geometry of Straight Lines, Geometry of 2D Shapes, Theorem of Pythagoras, Transformation Geometry, Area and Perimeter, and Surface Area and Volume for the Grade 8 Mathematics curriculum.',
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
  console.log('  TEXTBOOK: Grade 8 Mathematics');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
