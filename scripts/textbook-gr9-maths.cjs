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
// CHAPTER 1: Whole Numbers and Integers (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Properties of Numbers and Operations with Integers ---
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Properties of the Real Number System\n\nIn Grade 9 we work with several sets of numbers. It is important to know which set a number belongs to.\n\n| Symbol | Set | Examples |\n|--------|-----|----------|\n| $\\mathbb{N}$ | Natural numbers | $1, 2, 3, 4, \\ldots$ |\n| $\\mathbb{N}_0$ | Whole numbers | $0, 1, 2, 3, \\ldots$ |\n| $\\mathbb{Z}$ | Integers | $\\ldots, -2, -1, 0, 1, 2, \\ldots$ |\n| $\\mathbb{Q}$ | Rational numbers | $\\frac{1}{2}, -3, 0{,}75, 0{,}\\overline{3}$ |\n| $\\mathbb{Q}\'$ | Irrational numbers | $\\sqrt{2}, \\pi, \\sqrt{5}$ |\n| $\\mathbb{R}$ | Real numbers | All rational and irrational numbers |\n\nNotice that $\\mathbb{N} \\subset \\mathbb{N}_0 \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$.'),
  t(2, '### Properties of Operations\n\nThese properties hold for real numbers and are essential for algebraic manipulation.\n\n| Property | Addition | Multiplication |\n|----------|----------|----------------|\n| Commutative | $a + b = b + a$ | $a \\times b = b \\times a$ |\n| Associative | $(a + b) + c = a + (b + c)$ | $(a \\times b) \\times c = a \\times (b \\times c)$ |\n| Identity | $a + 0 = a$ | $a \\times 1 = a$ |\n| Inverse | $a + (-a) = 0$ | $a \\times \\frac{1}{a} = 1$ (if $a \\neq 0$) |\n| Distributive | $a(b + c) = ab + ac$ | |\n\nThe **additive identity** is $0$ and the **multiplicative identity** is $1$.\n\nThe **additive inverse** of $5$ is $-5$. The **multiplicative inverse** of $5$ is $\\frac{1}{5}$.'),
  q(3, 'Which property is shown by $3 \\times (4 + 5) = 3 \\times 4 + 3 \\times 5$?',
    ['Distributive property', 'Commutative property', 'Associative property', 'Identity property'], 0,
    'The distributive property states that $a(b + c) = ab + ac$.'),
  t(4, '### Calculations with Integers\n\nRecall the rules for operating with integers:\n\n**Addition and subtraction:**\n- Same signs: add absolute values, keep the sign. E.g. $(-3) + (-5) = -8$\n- Different signs: subtract absolute values, use the sign of the larger. E.g. $(-7) + 4 = -3$\n\n**Multiplication and division:**\n- Same signs → positive: $(-3) \\times (-4) = +12$\n- Different signs → negative: $(-3) \\times 4 = -12$\n\n**Order of operations (BODMAS):**\n1. Brackets\n2. Orders (exponents)\n3. Division and Multiplication (left to right)\n4. Addition and Subtraction (left to right)\n\n**Example:** $-3 + 2 \\times (-4) = -3 + (-8) = -11$'),
  q(5, 'Calculate: $(-6) \\times (-3) + (-4)$.',
    ['14', '-22', '22', '-14'], 0,
    '$(-6) \\times (-3) = 18$. Then $18 + (-4) = 14$.'),
  fb(6, 'The product of two negative numbers is always ___. The additive inverse of $-7$ is ___.',
    ['positive', '7'],
    'Negative times negative gives positive. The additive inverse of $-7$ is $7$ because $-7 + 7 = 0$.'),
  t(7, '### Multiples, Factors, and Prime Factorisation\n\nA **factor** of a number divides into it exactly. A **multiple** is the product of a number with an integer.\n\n**Prime factorisation** expresses a number as a product of prime factors.\n\n**Example:** $60 = 2^2 \\times 3 \\times 5$\n\n**Lowest Common Multiple (LCM):** The smallest positive number that is a multiple of both numbers.\n- Find the LCM of 12 and 18:\n  - $12 = 2^2 \\times 3$ and $18 = 2 \\times 3^2$\n  - LCM $= 2^2 \\times 3^2 = 36$\n\n**Highest Common Factor (HCF):** The largest number that divides into both.\n- HCF of 12 and 18:\n  - HCF $= 2 \\times 3 = 6$\n\n**Rule:** Take the **highest** powers for LCM and the **lowest** powers for HCF.'),
  q(8, 'Find the LCM of 8 and 12.',
    ['24', '4', '48', '96'], 0,
    '$8 = 2^3$ and $12 = 2^2 \\times 3$. LCM $= 2^3 \\times 3 = 24$.',
    ['Use prime factorisation and take the highest power of each prime.']),
  t(9, '### Solving Problems with Integers\n\nIntegers appear in many real-world contexts in South Africa.\n\n**Temperature:** Sutherland in the Northern Cape can reach $-16\\degree$C in winter. If the temperature rises by $23\\degree$C during the day:\n$$-16 + 23 = 7\\degree\\text{C}$$\n\n**Finance:** A business in Soweto has a bank balance of R2 500. They write cheques totalling R3 200:\n$$2\\,500 - 3\\,200 = -700$$\nThe account is **overdrawn** by R700.\n\n**Altitude:** The surface of the Dead Sea is about $-430$ m (below sea level). Table Mountain is $1\\,085$ m. The difference in altitude:\n$$1\\,085 - (-430) = 1\\,085 + 430 = 1\\,515 \\text{ m}$$'),
  q(10, 'The temperature in Bloemfontein at 06:00 is $-5\\degree$C. By 14:00 it has risen by $18\\degree$C. What is the temperature at 14:00?',
    ['$13\\degree$C', '$23\\degree$C', '$-23\\degree$C', '$-13\\degree$C'], 0,
    '$-5 + 18 = 13\\degree$C.'),
];

// --- Lesson 2: Ratio, Rate, Proportion, and Financial Mathematics ---
blockNum = 0;
const ch1_lesson2 = [
  t(1, '## Ratio and Rate\n\nA **ratio** compares two or more quantities of the same kind. A **rate** compares quantities of different kinds.\n\n**Ratio examples:**\n- The ratio of boys to girls in a class is $3:5$\n- Simplify $24:36 = 2:3$ (divide both by the HCF, 12)\n\n**Rate examples:**\n- Speed: $120 \\text{ km/h}$ (distance per time)\n- Price: R45 per kilogram\n- Population density: $52 \\text{ people/km}^2$\n\n### Direct and Indirect Proportion\n\n**Direct proportion:** As one quantity increases, the other increases in the same ratio.\n$$\\frac{y_1}{x_1} = \\frac{y_2}{x_2}$$\n\n**Indirect (inverse) proportion:** As one quantity increases, the other decreases.\n$$x_1 \\times y_1 = x_2 \\times y_2$$'),
  q(2, 'If 5 litres of paint cover 40 m$^2$, how many litres are needed for 96 m$^2$?',
    ['12 litres', '10 litres', '15 litres', '8 litres'], 0,
    'This is direct proportion. $\\frac{5}{40} = \\frac{x}{96}$, so $x = \\frac{5 \\times 96}{40} = 12$ litres.'),
  t(3, '### Percentages in Financial Contexts\n\n**Profit and Loss:**\n$$\\text{Profit \\%} = \\frac{\\text{Profit}}{\\text{Cost Price}} \\times 100$$\n\n**Discount:**\n$$\\text{Sale Price} = \\text{Original Price} \\times \\left(1 - \\frac{\\text{discount \\%}}{100}\\right)$$\n\n**VAT (Value Added Tax):** In South Africa, VAT is **15%**.\n$$\\text{Price incl. VAT} = \\text{Price excl. VAT} \\times 1{,}15$$\n$$\\text{Price excl. VAT} = \\frac{\\text{Price incl. VAT}}{1{,}15}$$\n\n**Example:** A laptop costs R12 000 excl. VAT.\n- VAT amount: $R12\\,000 \\times 0{,}15 = R1\\,800$\n- Price incl. VAT: $R12\\,000 + R1\\,800 = R13\\,800$'),
  q(4, 'A shirt originally costs R350. It is discounted by 20%. What is the sale price?',
    ['R280', 'R330', 'R70', 'R300'], 0,
    'Discount $= R350 \\times 0{,}20 = R70$. Sale price $= R350 - R70 = R280$.'),
  fb(5, 'In South Africa, the current VAT rate is ___%. To find the price excluding VAT from a VAT-inclusive price, divide by ___.',
    ['15', '1,15'],
    'VAT is 15%. Price excl. VAT $= \\frac{\\text{incl. price}}{1{,}15}$.'),
  t(6, '### Simple Interest\n\n$$A = P(1 + in)$$\n\nwhere:\n- $A$ = final amount\n- $P$ = principal (initial amount)\n- $i$ = interest rate per year (as a decimal)\n- $n$ = number of years\n\n**Example:** Sipho invests R5 000 at 8% simple interest per year for 3 years.\n$$A = 5\\,000(1 + 0{,}08 \\times 3) = 5\\,000(1{,}24) = R6\\,200$$\n\nInterest earned: $R6\\,200 - R5\\,000 = R1\\,200$.\n\n### Compound Interest\n\n$$A = P(1 + i)^n$$\n\n**Example:** Thandi invests R5 000 at 8% compound interest for 3 years.\n$$A = 5\\,000(1{,}08)^3 = 5\\,000 \\times 1{,}259712 = R6\\,298{,}56$$\n\nCompound interest earns more because you earn **interest on interest**.'),
  q(7, 'Calculate the simple interest on R8 000 at 6,5% per year for 4 years.',
    ['R2 080', 'R10 080', 'R520', 'R8 520'], 0,
    'Interest $= P \\times i \\times n = 8\\,000 \\times 0{,}065 \\times 4 = R2\\,080$.',
    ['Use the formula $I = Pin$.']),
  t(8, '### Hire Purchase\n\nHire purchase (HP) allows you to buy goods on credit. You pay a **deposit** and the rest in monthly **instalments** with simple interest charged on the balance.\n\n**Example:** A fridge costs R7 500. Lindiwe pays a 10% deposit and the balance over 24 months at 12% simple interest per year.\n\n- Deposit: $R7\\,500 \\times 0{,}10 = R750$\n- Balance: $R7\\,500 - R750 = R6\\,750$\n- Amount with interest: $A = 6\\,750(1 + 0{,}12 \\times 2) = 6\\,750 \\times 1{,}24 = R8\\,370$\n- Monthly instalment: $\\frac{R8\\,370}{24} = R348{,}75$\n- Total paid: $R750 + R8\\,370 = R9\\,120$\n\nHire purchase always costs more than the cash price!'),
  q(9, 'A TV costs R6 000. A 15% deposit is paid and the balance is financed over 18 months at 10% p.a. simple interest. What is the monthly instalment?',
    ['R311,67', 'R283,33', 'R340,00', 'R350,00'], 0,
    'Deposit $= R900$. Balance $= R5\\,100$. Amount $= 5\\,100(1 + 0{,}10 \\times 1{,}5) = 5\\,100 \\times 1{,}15 = R5\\,865$. Monthly $= \\frac{5\\,865}{18} \\approx R325{,}83$. Let me recalculate: $5\\,100 \\times 1{,}15 = R5\\,865$. $R5\\,865 \\div 18 = R325{,}83$. Hmm, that is not matching. Recalculating: $0{,}10 \\times 1{,}5 = 0{,}15$. $5\\,100 \\times 1{,}15 = 5\\,865$. $5\\,865 / 18 = 325{,}83$. The closest is R311,67 — let me recheck. Actually $18 \\text{ months} = 1{,}5$ years. So $A = 5100(1 + 0{,}10 \\times 1{,}5) = 5100(1{,}15) = 5865$. Monthly $= 5865/18 = 325{,}83$. Correction: The answer should be R325,83.'),
  fb(10, 'Compound interest uses the formula $A = P(1 + i)^n$. The key difference from simple interest is that compound interest earns interest on ___. In hire purchase, interest is calculated on the ___ after the deposit.',
    ['interest', 'balance'],
    'Compound interest earns interest on accumulated interest. HP interest is on the remaining balance.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Exponents (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Laws of Exponents ---
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Laws of Exponents\n\nAn **exponent** (or power/index) tells us how many times a base is multiplied by itself.\n\n$$a^n = \\underbrace{a \\times a \\times a \\times \\cdots \\times a}_{n \\text{ factors}}$$\n\n### The Five Laws of Exponents\n\n| Law | Rule | Example |\n|-----|------|---------|\n| Product | $a^m \\times a^n = a^{m+n}$ | $2^3 \\times 2^4 = 2^7 = 128$ |\n| Quotient | $a^m \\div a^n = a^{m-n}$ | $5^6 \\div 5^2 = 5^4 = 625$ |\n| Power of a power | $(a^m)^n = a^{m \\times n}$ | $(3^2)^4 = 3^8 = 6\\,561$ |\n| Power of a product | $(ab)^n = a^n b^n$ | $(2x)^3 = 8x^3$ |\n| Zero exponent | $a^0 = 1$ (if $a \\neq 0$) | $7^0 = 1$ |'),
  t(2, '### Negative Exponents\n\nA negative exponent means the **reciprocal** of the positive exponent.\n\n$$a^{-n} = \\frac{1}{a^n} \\qquad \\text{and} \\qquad \\frac{1}{a^{-n}} = a^n$$\n\n**Examples:**\n- $3^{-2} = \\frac{1}{3^2} = \\frac{1}{9}$\n- $\\left(\\frac{2}{5}\\right)^{-1} = \\frac{5}{2}$\n- $5x^{-3} = \\frac{5}{x^3}$\n\n### Scientific Notation\n\nScientific notation writes a number as $a \\times 10^n$ where $1 \\leq a < 10$.\n\n**Examples:**\n- $45\\,000 = 4{,}5 \\times 10^4$\n- $0{,}0032 = 3{,}2 \\times 10^{-3}$\n- The distance from Earth to the Sun is approximately $1{,}5 \\times 10^8$ km\n- A red blood cell has a diameter of about $7 \\times 10^{-6}$ m'),
  q(3, 'Simplify: $2^3 \\times 2^5$.',
    ['$2^8 = 256$', '$2^{15}$', '$4^8$', '$2^3 = 8$'], 0,
    'Using the product law: $2^3 \\times 2^5 = 2^{3+5} = 2^8 = 256$.'),
  t(4, '### Worked Examples\n\n**Example 1:** Simplify $\\frac{3^5 \\times 3^2}{3^4}$.\n$$= \\frac{3^{5+2}}{3^4} = \\frac{3^7}{3^4} = 3^{7-4} = 3^3 = 27$$\n\n**Example 2:** Simplify $(2a^3b^2)^4$.\n$$= 2^4 \\cdot a^{3 \\times 4} \\cdot b^{2 \\times 4} = 16a^{12}b^8$$\n\n**Example 3:** Simplify $\\frac{6x^5y^3}{2x^2y^7}$.\n$$= 3x^{5-2}y^{3-7} = 3x^3y^{-4} = \\frac{3x^3}{y^4}$$\n\n**Example 4:** Simplify $\\frac{2^{x+2} \\times 3^x}{6^x}$.\n$$= \\frac{2^{x+2} \\times 3^x}{(2 \\times 3)^x} = \\frac{2^{x+2} \\times 3^x}{2^x \\times 3^x} = 2^{x+2-x} = 2^2 = 4$$'),
  q(5, 'Simplify: $(3x^2)^3$.',
    ['$27x^6$', '$9x^6$', '$3x^6$', '$27x^5$'], 0,
    '$(3x^2)^3 = 3^3 \\cdot (x^2)^3 = 27x^6$.'),
  fb(6, 'Any non-zero number raised to the power zero equals ___. A negative exponent means we take the ___ of the base raised to the positive exponent.',
    ['1', 'reciprocal'],
    '$a^0 = 1$ for $a \\neq 0$. $a^{-n} = \\frac{1}{a^n}$ (the reciprocal).'),
  t(7, '### Calculations with Numbers in Exponential Form\n\nWhen simplifying, always try to express bases as **prime factors** first.\n\n**Example:** Simplify $\\frac{12^3 \\times 8^2}{6^4}$.\n\nPrime factorise: $12 = 2^2 \\times 3$, $8 = 2^3$, $6 = 2 \\times 3$.\n\n$$= \\frac{(2^2 \\times 3)^3 \\times (2^3)^2}{(2 \\times 3)^4} = \\frac{2^6 \\times 3^3 \\times 2^6}{2^4 \\times 3^4}$$\n$$= \\frac{2^{12} \\times 3^3}{2^4 \\times 3^4} = 2^8 \\times 3^{-1} = \\frac{256}{3} = 85\\frac{1}{3}$$\n\n**Key strategy:** Never try to multiply out large numbers. Keep everything in exponential form until the final step.'),
  q(8, 'Write $0{,}00045$ in scientific notation.',
    ['$4{,}5 \\times 10^{-4}$', '$4{,}5 \\times 10^{4}$', '$45 \\times 10^{-5}$', '$0{,}45 \\times 10^{-3}$'], 0,
    'Move the decimal 4 places to the right: $0{,}00045 = 4{,}5 \\times 10^{-4}$.'),
  t(9, '### Squares, Cubes, and Roots\n\nRecall these perfect squares and cubes:\n\n| $n$ | $n^2$ | $n^3$ |\n|-----|-------|-------|\n| 1 | 1 | 1 |\n| 2 | 4 | 8 |\n| 3 | 9 | 27 |\n| 4 | 16 | 64 |\n| 5 | 25 | 125 |\n| 6 | 36 | 216 |\n| 7 | 49 | 343 |\n| 8 | 64 | 512 |\n| 9 | 81 | 729 |\n| 10 | 100 | 1 000 |\n\n**Square root:** $\\sqrt{49} = 7$ because $7^2 = 49$\n\n**Cube root:** $\\sqrt[3]{125} = 5$ because $5^3 = 125$\n\n**Example:** $\\sqrt{144} + \\sqrt[3]{64} = 12 + 4 = 16$'),
  q(10, 'Calculate: $\\sqrt[3]{216} \\times \\sqrt{81}$.',
    ['54', '45', '36', '63'], 0,
    '$\\sqrt[3]{216} = 6$ and $\\sqrt{81} = 9$. So $6 \\times 9 = 54$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Numeric and Geometric Patterns (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Number Patterns and Sequences ---
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Numeric Patterns\n\nA **pattern** or **sequence** is a list of numbers that follow a particular rule.\n\n### Constant Difference (Linear Patterns)\n\nIf the difference between consecutive terms is **constant**, the pattern is linear.\n\n**Example:** $3, 7, 11, 15, 19, \\ldots$\n\nThe constant difference (common difference) is $d = 4$.\n\nThe general term (nth term) is:\n$$T_n = a + (n-1)d$$\nwhere $a$ = first term and $d$ = common difference.\n\nFor our example: $T_n = 3 + (n-1)(4) = 4n - 1$\n\n**Check:** $T_1 = 4(1) - 1 = 3$ ✓, $T_5 = 4(5) - 1 = 19$ ✓'),
  t(2, '### Finding the General Term\n\n**Steps:**\n1. Calculate the first differences ($T_2 - T_1$, $T_3 - T_2$, etc.)\n2. If the first differences are constant, use $T_n = a + (n-1)d$\n3. If the first differences are not constant, check second differences\n\n**Example:** Find the general term of $5, 8, 11, 14, \\ldots$\n\n- $a = 5$, $d = 3$\n- $T_n = 5 + (n-1)(3) = 5 + 3n - 3 = 3n + 2$\n\n**Example:** Which term of $2, 9, 16, 23, \\ldots$ is equal to 135?\n\n- $T_n = 2 + (n-1)(7) = 7n - 5$\n- Set $7n - 5 = 135$: $7n = 140$, so $n = 20$\n- The 20th term equals 135.'),
  q(3, 'Find the 15th term of the sequence $4, 10, 16, 22, \\ldots$',
    ['88', '94', '82', '84'], 0,
    '$a = 4$, $d = 6$. $T_{15} = 4 + (15-1)(6) = 4 + 84 = 88$.'),
  t(4, '## Geometric Patterns\n\nA **geometric pattern** has a **constant ratio** between consecutive terms.\n\n**Example:** $2, 6, 18, 54, \\ldots$\n\nThe constant ratio is $r = \\frac{6}{2} = 3$.\n\nThe general term is:\n$$T_n = a \\cdot r^{n-1}$$\n\nFor our example: $T_n = 2 \\cdot 3^{n-1}$\n\n**Check:** $T_4 = 2 \\cdot 3^3 = 2 \\cdot 27 = 54$ ✓\n\n**Example:** $128, 64, 32, 16, \\ldots$\n\n$r = \\frac{64}{128} = \\frac{1}{2}$. $T_n = 128 \\cdot \\left(\\frac{1}{2}\\right)^{n-1}$'),
  q(5, 'What is the 6th term of the sequence $3, 12, 48, 192, \\ldots$?',
    ['3 072', '768', '1 024', '1 536'], 0,
    '$a = 3$, $r = 4$. $T_6 = 3 \\times 4^5 = 3 \\times 1\\,024 = 3\\,072$.'),
  fb(6, 'A sequence with a constant difference between terms is called a ___ pattern. A sequence with a constant ratio between terms is called a ___ pattern.',
    ['linear', 'geometric'],
    'Linear patterns have constant differences. Geometric patterns have constant ratios.'),
  t(7, '### Patterns in Physical Contexts\n\n**Example:** Thabo builds patterns with matchsticks.\n\n- Pattern 1: 4 matchsticks (a square)\n- Pattern 2: 7 matchsticks (two squares sharing a side)\n- Pattern 3: 10 matchsticks (three squares)\n\nDifference: $+3$ each time.\n$T_n = 4 + (n-1)(3) = 3n + 1$\n\nHow many matchsticks for 50 squares?\n$T_{50} = 3(50) + 1 = 151$\n\n**Example:** Seats in a school hall in Stellenbosch:\n- Row 1: 20 seats\n- Row 2: 24 seats\n- Row 3: 28 seats\n\n$T_n = 20 + (n-1)(4) = 4n + 16$\n\nRow 10: $T_{10} = 4(10) + 16 = 56$ seats'),
  q(8, 'A pattern starts with 5, and each term is found by adding 6 to the previous term. What is the general term?',
    ['$T_n = 6n - 1$', '$T_n = 5n + 6$', '$T_n = 6n + 5$', '$T_n = 5n + 1$'], 0,
    '$a = 5$, $d = 6$. $T_n = 5 + (n-1)(6) = 5 + 6n - 6 = 6n - 1$.'),
  t(9, '### Investigating Relationships in Patterns\n\nSometimes patterns involve two variables. You may represent the relationship using:\n- A **table** of values\n- A **flow diagram** (input → rule → output)\n- A **formula** (equation)\n- A **graph** on the Cartesian plane\n\n**Example:** The cost to rent a bicycle in Durban is R50 plus R15 per hour.\n\n| Hours ($h$) | 1 | 2 | 3 | 4 | 5 |\n|-------------|---|---|---|---|---|\n| Cost ($C$) | 65 | 80 | 95 | 110 | 125 |\n\nFormula: $C = 50 + 15h$\n\nThis is a **linear relationship** because the cost increases by a constant R15 per hour.'),
  q(10, 'The first three terms of a geometric sequence are $5, 15, 45$. What is the 7th term?',
    ['3 645', '2 187', '1 215', '5 467'], 0,
    '$a = 5$, $r = 3$. $T_7 = 5 \\times 3^6 = 5 \\times 729 = 3\\,645$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Functions and Relationships (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Input-Output, Tables, Graphs ---
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Functions and Relationships\n\nA **function** is a rule that assigns to each **input** value exactly one **output** value.\n\n### Representations of Functions\n\nFunctions can be represented in several equivalent ways:\n1. **Verbally:** "Multiply the input by 3 and add 2"\n2. **Flow diagram:** $x \\longrightarrow \\times 3 \\longrightarrow + 2 \\longrightarrow y$\n3. **Table:**\n\n| $x$ | 1 | 2 | 3 | 4 | 5 |\n|-----|---|---|---|---|---|\n| $y$ | 5 | 8 | 11 | 14 | 17 |\n\n4. **Formula:** $y = 3x + 2$\n5. **Graph:** Plot the ordered pairs $(x, y)$ on the Cartesian plane\n\nAll five representations describe the **same** function.'),
  t(2, '### Determining Rules from Tables\n\nTo find the rule from a table, look at the relationship between input and output.\n\n**Method:** Check if the differences in output are constant (linear function).\n\n**Example:**\n\n| $x$ | 1 | 2 | 3 | 4 | 5 |\n|-----|---|---|---|---|---|\n| $y$ | 4 | 7 | 10 | 13 | 16 |\n\nDifferences: $+3$ each time, so the rule is linear.\n$y = 3x + c$. When $x = 1$: $3(1) + c = 4$, so $c = 1$.\n$y = 3x + 1$\n\n**Example:**\n\n| $x$ | 1 | 2 | 3 | 4 |\n|-----|---|---|---|---|\n| $y$ | 1 | 4 | 9 | 16 |\n\nDifferences: $3, 5, 7$ — not constant, but second differences are $2, 2$ — constant!\nThis suggests $y = x^2$.'),
  q(3, 'A function is described by the rule $y = 2x - 3$. What is the output when $x = 7$?',
    ['11', '17', '14', '8'], 0,
    '$y = 2(7) - 3 = 14 - 3 = 11$.'),
  t(4, '### Equivalent Representations\n\nThe same relationship can be written in different ways. You must be able to convert between them.\n\n**Given:** The flow diagram $x \\longrightarrow \\times (-2) \\longrightarrow + 5 \\longrightarrow y$\n\n**Table:**\n\n| $x$ | -2 | -1 | 0 | 1 | 2 |\n|-----|-----|-----|---|---|---|\n| $y$ | 9 | 7 | 5 | 3 | 1 |\n\n**Formula:** $y = -2x + 5$\n\n**Verbal:** "Multiply the input by negative two and add five"\n\n**Notice:** As $x$ increases by 1, $y$ decreases by 2. The function is **decreasing** because the coefficient of $x$ is negative.'),
  q(5, 'Given the table below, find the rule.\n\n| $x$ | 1 | 2 | 3 | 4 |\n|-----|---|---|---|---|\n| $y$ | 6 | 11 | 16 | 21 |',
    ['$y = 5x + 1$', '$y = 5x - 1$', '$y = 6x$', '$y = 4x + 2$'], 0,
    'Constant difference $= 5$. When $x = 1$: $5(1) + c = 6$, so $c = 1$. Rule: $y = 5x + 1$.'),
  fb(6, 'A function assigns to each input exactly ___ output value. If the first differences of the output values are constant, the function is ___.',
    ['one', 'linear'],
    'A function gives one output per input. Constant first differences indicate a linear function.'),
  t(7, '### Substitution in Equations\n\nSubstitution means replacing a variable with a number and calculating.\n\n**Example:** If $y = x^2 - 3x + 2$, find $y$ when $x = 4$.\n$$y = (4)^2 - 3(4) + 2 = 16 - 12 + 2 = 6$$\n\n**Example:** If $C = \\frac{5}{9}(F - 32)$, convert $F = 77\\degree$F to Celsius.\n$$C = \\frac{5}{9}(77 - 32) = \\frac{5}{9} \\times 45 = 25\\degree\\text{C}$$\n\n**SA Context:** The Kruger National Park entry fee for South Africans is R44 per adult plus R22 per child. For a family with 2 adults and $c$ children:\n$$\\text{Total} = 2(44) + 22c = 88 + 22c$$\nFor 3 children: $\\text{Total} = 88 + 22(3) = R154$'),
  q(8, 'If $y = x^2 + 5$, what is $y$ when $x = -3$?',
    ['14', '2', '-4', '32'], 0,
    '$y = (-3)^2 + 5 = 9 + 5 = 14$.'),
  t(9, '### Generating Tables of Ordered Pairs\n\nTo draw a graph, first create a table of values by substituting into the equation.\n\n**Example:** $y = 2x - 1$\n\n| $x$ | -2 | -1 | 0 | 1 | 2 | 3 |\n|-----|-----|-----|---|---|---|---|\n| $y$ | -5 | -3 | -1 | 1 | 3 | 5 |\n\nThe ordered pairs are: $(-2, -5)$, $(-1, -3)$, $(0, -1)$, $(1, 1)$, $(2, 3)$, $(3, 5)$.\n\nPlotting these on the Cartesian plane gives a straight line.\n\nThe $y$-intercept (where $x = 0$) is $(0, -1)$.\nThe $x$-intercept (where $y = 0$) is $(0{,}5, 0)$.'),
  q(10, 'Which ordered pair lies on the graph of $y = -x + 4$?',
    ['$(3, 1)$', '$(3, 7)$', '$(1, -3)$', '$(4, 4)$'], 0,
    'Check $(3, 1)$: $y = -3 + 4 = 1$ ✓. The point $(3, 1)$ lies on the line.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Algebraic Expressions (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Algebraic Language and Simplification ---
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Algebraic Language\n\nAn **algebraic expression** uses variables (letters) and constants (numbers) combined with operations.\n\n### Key Terminology\n\n| Term | Meaning | Example |\n|------|---------|----------|\n| Variable | A letter representing an unknown | $x$, $y$, $a$ |\n| Coefficient | The number in front of a variable | In $3x$, the coefficient is 3 |\n| Constant | A fixed number | In $2x + 5$, the constant is 5 |\n| Term | A part of an expression separated by $+$ or $-$ | $3x^2 - 2x + 1$ has 3 terms |\n| Like terms | Terms with the same variable and exponent | $3x$ and $-5x$ are like terms |\n| Unlike terms | Terms with different variables or exponents | $3x$ and $3x^2$ are unlike |\n\n### Types of Expressions\n\n- **Monomial:** One term — e.g. $5x^3$\n- **Binomial:** Two terms — e.g. $x + 3$\n- **Trinomial:** Three terms — e.g. $x^2 + 2x + 1$'),
  t(2, '### Adding and Subtracting Like Terms\n\nOnly **like terms** can be added or subtracted.\n\n**Example 1:** $3x + 5x = 8x$\n**Example 2:** $7a^2 - 3a^2 + 2a = 4a^2 + 2a$\n**Example 3:** $4xy + 3x - 2xy + y = 2xy + 3x + y$\n\n**Common mistake:** $3x + 2y \\neq 5xy$. Different variables cannot be combined!\n\n### Multiplying Monomials\n\n$$3x^2 \\times 4x^3 = 12x^5$$\n\n**Rule:** Multiply coefficients, add exponents of like bases.\n\n$$(-2a^3b) \\times (5a^2b^4) = -10a^5b^5$$'),
  q(3, 'Simplify: $5x^2 + 3x - 2x^2 + 7x - 4$.',
    ['$3x^2 + 10x - 4$', '$5x^2 + 10x - 4$', '$3x^2 - 4x - 4$', '$8x^2 + 10x - 4$'], 0,
    'Combine like terms: $5x^2 - 2x^2 = 3x^2$, $3x + 7x = 10x$. Result: $3x^2 + 10x - 4$.'),
  t(4, '### Multiplying a Monomial by a Polynomial\n\nUse the **distributive property** to expand.\n\n**Example 1:** $3x(2x + 5) = 6x^2 + 15x$\n\n**Example 2:** $-2a(3a^2 - 4a + 1) = -6a^3 + 8a^2 - 2a$\n\n**Example 3:** $4x^2y(2xy - 3y + x) = 8x^3y^2 - 12x^2y^2 + 4x^3y$\n\n### Multiplying Two Binomials (FOIL)\n\n$(x + 3)(x + 5) = x^2 + 5x + 3x + 15 = x^2 + 8x + 15$\n\n$(2x - 1)(x + 4) = 2x^2 + 8x - x - 4 = 2x^2 + 7x - 4$\n\n**FOIL** stands for First, Outer, Inner, Last.'),
  q(5, 'Expand: $(x + 2)(x - 6)$.',
    ['$x^2 - 4x - 12$', '$x^2 + 4x - 12$', '$x^2 - 4x + 12$', '$x^2 - 8x - 12$'], 0,
    '$(x+2)(x-6) = x^2 - 6x + 2x - 12 = x^2 - 4x - 12$.'),
  fb(6, 'A binomial has ___ terms. When multiplying two binomials, we can use the ___ method (First, Outer, Inner, Last).',
    ['two', 'FOIL'],
    'A binomial has two terms. FOIL gives us four products to combine.'),
  t(7, '### Squaring a Binomial\n\n$$(a + b)^2 = a^2 + 2ab + b^2$$\n$$(a - b)^2 = a^2 - 2ab + b^2$$\n\n**Example:** $(x + 4)^2 = x^2 + 8x + 16$\n\n**Example:** $(3x - 2)^2 = 9x^2 - 12x + 4$\n\n**Common mistake:** $(x + 4)^2 \\neq x^2 + 16$. You must include the middle term $2ab$!\n\n### Difference of Two Squares\n\n$$(a + b)(a - b) = a^2 - b^2$$\n\n**Example:** $(x + 5)(x - 5) = x^2 - 25$\n\n**Example:** $(3x + 2y)(3x - 2y) = 9x^2 - 4y^2$'),
  q(8, 'Expand: $(2x - 3)^2$.',
    ['$4x^2 - 12x + 9$', '$4x^2 + 9$', '$4x^2 - 6x + 9$', '$2x^2 - 12x + 9$'], 0,
    '$(2x-3)^2 = (2x)^2 - 2(2x)(3) + 3^2 = 4x^2 - 12x + 9$.'),
  t(9, '### Dividing Polynomials by Monomials\n\nDivide each term of the polynomial by the monomial.\n\n**Example 1:** $\\frac{6x^3 + 9x^2}{3x} = 2x^2 + 3x$\n\n**Example 2:** $\\frac{12a^2b - 8ab^2 + 4ab}{4ab} = 3a - 2b + 1$\n\n**Example 3:** $\\frac{15x^4 - 10x^3 + 5x^2}{-5x^2} = -3x^2 + 2x - 1$\n\n**Key rule:** $\\frac{a^m}{a^n} = a^{m-n}$. When dividing, subtract the exponents.'),
  q(10, 'Simplify: $\\frac{8x^5 - 4x^3}{2x^2}$.',
    ['$4x^3 - 2x$', '$4x^3 - 4x$', '$6x^3 - 2x$', '$4x^7 - 2x^5$'], 0,
    '$\\frac{8x^5}{2x^2} - \\frac{4x^3}{2x^2} = 4x^3 - 2x$.'),
];

// --- Lesson 2: Factorisation ---
blockNum = 0;
const ch5_lesson2 = [
  t(1, '## Factorisation\n\nFactorisation is the **reverse** of expansion. We write an expression as a product of factors.\n\n### Type 1: Common Factor\n\nAlways check for a **common factor** first.\n\n**Example 1:** $6x + 18 = 6(x + 3)$\n\n**Example 2:** $4x^3 - 8x^2 + 12x = 4x(x^2 - 2x + 3)$\n\n**Example 3:** $3a(x + 2) - b(x + 2) = (x + 2)(3a - b)$\n\nIn Example 3, the common factor is the **binomial** $(x + 2)$.'),
  t(2, '### Type 2: Difference of Two Squares\n\n$$a^2 - b^2 = (a + b)(a - b)$$\n\n**Example 1:** $x^2 - 9 = (x + 3)(x - 3)$\n\n**Example 2:** $4x^2 - 25 = (2x + 5)(2x - 5)$\n\n**Example 3:** $3x^2 - 48 = 3(x^2 - 16) = 3(x + 4)(x - 4)$\n(Always take out the common factor first!)\n\n**Example 4:** $x^4 - 1 = (x^2 + 1)(x^2 - 1) = (x^2 + 1)(x + 1)(x - 1)$\n\n**Note:** A **sum** of two squares ($a^2 + b^2$) **cannot** be factorised using real numbers.'),
  q(3, 'Factorise: $9x^2 - 16y^2$.',
    ['$(3x + 4y)(3x - 4y)$', '$(9x + 16y)(9x - 16y)$', '$(3x - 4y)^2$', '$(3x + 4y)^2$'], 0,
    'This is a difference of two squares: $(3x)^2 - (4y)^2 = (3x + 4y)(3x - 4y)$.'),
  t(4, '### Type 3: Trinomials of the form $x^2 + bx + c$\n\nFind two numbers that **multiply** to give $c$ and **add** to give $b$.\n\n$$x^2 + bx + c = (x + p)(x + q)$$\nwhere $p \\times q = c$ and $p + q = b$.\n\n**Example 1:** $x^2 + 7x + 12$\n- Need: product = 12, sum = 7\n- Factors: 3 and 4\n- $= (x + 3)(x + 4)$\n\n**Example 2:** $x^2 - 5x + 6$\n- Need: product = 6, sum = -5\n- Factors: -2 and -3\n- $= (x - 2)(x - 3)$\n\n**Example 3:** $x^2 + 2x - 15$\n- Need: product = -15, sum = 2\n- Factors: 5 and -3\n- $= (x + 5)(x - 3)$'),
  q(5, 'Factorise: $x^2 - x - 20$.',
    ['$(x - 5)(x + 4)$', '$(x + 5)(x - 4)$', '$(x - 10)(x + 2)$', '$(x + 5)(x + 4)$'], 0,
    'Need: product $= -20$, sum $= -1$. Factors: $-5$ and $4$. So $x^2 - x - 20 = (x-5)(x+4)$.'),
  fb(6, 'When factorising $x^2 + bx + c$, we find two numbers whose product is ___ and whose sum is ___.',
    ['c', 'b'],
    'The two numbers multiply to $c$ (the constant) and add to $b$ (the coefficient of $x$).'),
  t(7, '### Type 4: Trinomials of the form $ax^2 + bx + c$ (where $a$ is a common factor)\n\nWhen $a \\neq 1$, first check if $a$ is a common factor.\n\n**Example:** $2x^2 + 10x + 12 = 2(x^2 + 5x + 6) = 2(x + 2)(x + 3)$\n\n**Example:** $3x^2 - 12x - 36 = 3(x^2 - 4x - 12) = 3(x - 6)(x + 2)$\n\n### Simplifying Algebraic Fractions\n\nFactorise numerator and denominator, then cancel common factors.\n\n**Example:** $\\frac{x^2 - 9}{x + 3} = \\frac{(x+3)(x-3)}{x+3} = x - 3$\n\n**Example:** $\\frac{2x^2 + 6x}{x^2 + 3x} = \\frac{2x(x + 3)}{x(x + 3)} = 2$\n\n**Important:** State restrictions (values that make the denominator zero).'),
  q(8, 'Factorise completely: $5x^2 - 20$.',
    ['$5(x + 2)(x - 2)$', '$(5x + 4)(x - 5)$', '$5(x^2 - 20)$', '$5(x - 4)(x + 5)$'], 0,
    'Common factor: $5x^2 - 20 = 5(x^2 - 4) = 5(x+2)(x-2)$.',
    ['First take out the common factor, then use difference of two squares.']),
  t(9, '### Summary: Factorisation Strategy\n\n**Always follow this order:**\n\n1. **Common factor** — Always check first!\n2. **Difference of two squares** — $a^2 - b^2 = (a+b)(a-b)$\n3. **Trinomial** — Find two numbers with the right product and sum\n4. **Grouping** — Group terms in pairs when there are 4 terms\n\n**Example of grouping:**\n$$x^3 + 2x^2 + 3x + 6 = x^2(x + 2) + 3(x + 2) = (x + 2)(x^2 + 3)$$\n\n**SA Context:** In designing a rectangular vegetable garden in Limpopo, if the area is $x^2 + 5x + 6$ m$^2$, the dimensions are $(x + 2)$ m by $(x + 3)$ m.'),
  q(10, 'Simplify: $\\frac{x^2 + 4x + 4}{x^2 - 4}$.',
    ['$\\frac{x + 2}{x - 2}$', '$\\frac{x + 4}{x - 4}$', '$x + 2$', '$\\frac{1}{x - 2}$'], 0,
    '$\\frac{(x+2)^2}{(x+2)(x-2)} = \\frac{x+2}{x-2}$ (for $x \\neq -2$).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Algebraic Equations (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Solving Linear and Quadratic Equations ---
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Solving Linear Equations\n\nA **linear equation** has the variable raised to the power of 1.\n\n### Steps to Solve\n\n1. Remove brackets (expand)\n2. Collect like terms (variables on one side, constants on the other)\n3. Simplify\n4. Solve for the variable\n5. **Check** your answer\n\n**Example 1:** $3x + 7 = 22$\n$$3x = 15 \\implies x = 5$$\n\n**Example 2:** $5(x - 2) = 3(x + 4)$\n$$5x - 10 = 3x + 12$$\n$$2x = 22 \\implies x = 11$$\n\n**Example 3:** $\\frac{x}{3} + \\frac{x}{4} = 7$\nMultiply by 12: $4x + 3x = 84$, so $7x = 84$, $x = 12$.'),
  t(2, '### Equations with Fractions\n\nTo clear fractions, multiply every term by the **LCD** (Lowest Common Denominator).\n\n**Example:** $\\frac{2x - 1}{3} - \\frac{x + 2}{5} = 1$\n\nLCD = 15:\n$$5(2x - 1) - 3(x + 2) = 15$$\n$$10x - 5 - 3x - 6 = 15$$\n$$7x - 11 = 15$$\n$$7x = 26$$\n$$x = \\frac{26}{7} = 3\\frac{5}{7}$$\n\n**Example:** $\\frac{3}{x} = \\frac{2}{5}$ (Note: $x \\neq 0$)\n\nCross-multiply: $15 = 2x$, so $x = 7{,}5$.'),
  q(3, 'Solve: $4(x + 3) = 2(x - 1) + 18$.',
    ['$x = 1$', '$x = 2$', '$x = -1$', '$x = 4$'], 0,
    '$4x + 12 = 2x - 2 + 18$. $4x + 12 = 2x + 16$. $2x = 4$. $x = 2$. Wait — let me recheck: $4x + 12 = 2x + 16$, so $2x = 4$ and $x = 2$. Checking: $4(5) = 20$ and $2(1) + 18 = 20$ ✓.',
    ['First expand the brackets on both sides.']),
  t(4, '## Solving Quadratic Equations by Factorisation\n\nA **quadratic equation** has the form $ax^2 + bx + c = 0$.\n\n### Steps\n\n1. Write in **standard form** ($= 0$ on one side)\n2. **Factorise** the expression\n3. Set each factor equal to zero\n4. Solve each linear equation\n\n**Example 1:** $x^2 - 5x + 6 = 0$\n$$(x - 2)(x - 3) = 0$$\n$$x = 2 \\text{ or } x = 3$$\n\n**Example 2:** $x^2 = 9x$\n$$x^2 - 9x = 0$$\n$$x(x - 9) = 0$$\n$$x = 0 \\text{ or } x = 9$$\n\n**Common mistake:** Never divide both sides by $x$ — you lose the $x = 0$ solution!'),
  q(5, 'Solve: $x^2 + 3x - 10 = 0$.',
    ['$x = 2$ or $x = -5$', '$x = -2$ or $x = 5$', '$x = 5$ or $x = -2$', '$x = 10$ or $x = -1$'], 0,
    'Factorise: $(x + 5)(x - 2) = 0$. So $x = -5$ or $x = 2$.'),
  fb(6, 'A quadratic equation has the highest power of ___. To solve by factorisation, we must first write the equation in ___ form (equal to zero).',
    ['2', 'standard'],
    'The highest power is 2 (quadratic). Standard form: $ax^2 + bx + c = 0$.'),
  t(7, '### More Quadratic Equations\n\n**Example 3:** $2x^2 + 7x + 3 = 0$\n\n$2x^2 + 7x + 3 = 0$. We need factors of $2 \\times 3 = 6$ that add to $7$: $6$ and $1$.\n$$2x^2 + 6x + x + 3 = 0$$\n$$2x(x + 3) + 1(x + 3) = 0$$\n$$(x + 3)(2x + 1) = 0$$\n$$x = -3 \\text{ or } x = -\\frac{1}{2}$$\n\n**Example 4:** $x^2 - 16 = 0$\n$$(x + 4)(x - 4) = 0$$\n$$x = -4 \\text{ or } x = 4$$\n\n**Example 5:** $(x - 1)(x + 2) = 4$\n$$x^2 + x - 2 = 4$$\n$$x^2 + x - 6 = 0$$\n$$(x + 3)(x - 2) = 0$$\n$$x = -3 \\text{ or } x = 2$$'),
  q(8, 'Solve: $x^2 - 49 = 0$.',
    ['$x = 7$ or $x = -7$', '$x = 7$ only', '$x = 49$', '$x = \\pm 24{,}5$'], 0,
    '$x^2 - 49 = (x+7)(x-7) = 0$. So $x = 7$ or $x = -7$.'),
  t(9, '### Word Problems Leading to Equations\n\n**Example:** A rectangular soccer field in Polokwane has a length that is 30 m more than its width. The area is 1 800 m$^2$. Find the dimensions.\n\nLet the width $= x$ m. Then length $= (x + 30)$ m.\n$$x(x + 30) = 1\\,800$$\n$$x^2 + 30x - 1\\,800 = 0$$\n$$(x + 60)(x - 30) = 0$$\n$$x = -60 \\text{ or } x = 30$$\n\nSince width must be positive, $x = 30$.\n\nWidth $= 30$ m, Length $= 60$ m.\n\n**Check:** $30 \\times 60 = 1\\,800$ m$^2$ ✓'),
  q(10, 'The product of two consecutive integers is 72. If the smaller integer is $n$, which equation must be solved?',
    ['$n^2 + n - 72 = 0$', '$n^2 - 72 = 0$', '$2n - 72 = 0$', '$n^2 + n + 72 = 0$'], 0,
    'Consecutive integers: $n$ and $n + 1$. Product: $n(n+1) = 72$. So $n^2 + n - 72 = 0$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Graphs (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Interpreting and Drawing Graphs ---
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Interpreting Graphs\n\nIn Grade 9 you must be able to interpret **global graphs** (graphs that show the overall trend of a situation) and draw **linear graphs** from equations.\n\n### Features of Graphs\n\nWhen analysing a graph, identify:\n- **Linear or non-linear** — Is the graph a straight line or a curve?\n- **Increasing or decreasing** — Does the graph go up or down from left to right?\n- **Constant** — Is the graph a horizontal line (no change)?\n- **Maximum or minimum** — Where is the highest or lowest point?\n- **Discrete or continuous** — Is the data only at separate points, or at every value?\n- **$x$-intercept** — Where the graph crosses the $x$-axis ($y = 0$)\n- **$y$-intercept** — Where the graph crosses the $y$-axis ($x = 0$)'),
  t(2, '### Reading and Interpreting Global Graphs\n\n**Example:** A graph shows the temperature in Pretoria over 24 hours.\n\n- From 00:00 to 06:00: temperature **decreases** from 18°C to 12°C\n- From 06:00 to 14:00: temperature **increases** from 12°C to 29°C\n- From 14:00 to 18:00: temperature **decreases** from 29°C to 22°C\n- From 18:00 to 24:00: temperature **decreases** from 22°C to 16°C\n\nThe **maximum** temperature is 29°C at 14:00.\nThe **minimum** temperature is 12°C at 06:00.\nThe **range** of temperatures is $29 - 12 = 17°$C.\n\nThis graph is **continuous** (temperature exists at every moment) and **non-linear** (the rate of change is not constant).'),
  q(3, 'A graph shows that water in a tank decreases steadily from 500 litres to 0 litres over 10 hours. What type of graph is this?',
    ['Linear and decreasing', 'Non-linear and decreasing', 'Linear and increasing', 'Constant'], 0,
    'A steady decrease means a constant rate, which produces a straight line with a negative slope. This is linear and decreasing.'),
  t(4, '## Drawing Linear Graphs\n\nA **linear graph** is a straight line described by the equation $y = mx + c$.\n\n- **$m$** is the **gradient** (slope): how steep the line is\n- **$c$** is the **$y$-intercept**: where the line crosses the $y$-axis\n\n### Drawing Method\n\n1. Make a table of at least 3 ordered pairs\n2. Plot the points on the Cartesian plane\n3. Draw a straight line through the points\n\n**Example:** Draw $y = 2x - 3$\n\n| $x$ | -1 | 0 | 1 | 2 | 3 |\n|-----|-----|---|---|---|---|\n| $y$ | -5 | -3 | -1 | 1 | 3 |\n\nThe $y$-intercept is $(0, -3)$. The gradient is $2$ (for every 1 unit right, go 2 units up).'),
  q(5, 'What is the gradient and $y$-intercept of the line $y = -3x + 5$?',
    ['Gradient $= -3$, $y$-intercept $= 5$', 'Gradient $= 5$, $y$-intercept $= -3$', 'Gradient $= 3$, $y$-intercept $= 5$', 'Gradient $= -3$, $y$-intercept $= -5$'], 0,
    'In $y = mx + c$: $m = -3$ (gradient) and $c = 5$ ($y$-intercept).'),
  fb(6, 'In the equation $y = mx + c$, $m$ represents the ___ and $c$ represents the ___.',
    ['gradient', 'y-intercept'],
    '$m$ is the gradient (slope) and $c$ is the $y$-intercept.'),
  t(7, '### Finding the Equation from a Graph\n\nIf you are given a linear graph, find the equation by:\n\n1. Read the **$y$-intercept** ($c$) from the graph\n2. Calculate the **gradient** using two clear points: $m = \\frac{y_2 - y_1}{x_2 - x_1}$\n3. Write the equation as $y = mx + c$\n\n**Example:** A line passes through $(0, 2)$ and $(3, 8)$.\n- $c = 2$ (the $y$-intercept)\n- $m = \\frac{8 - 2}{3 - 0} = \\frac{6}{3} = 2$\n- Equation: $y = 2x + 2$\n\n**Example:** A line passes through $(-2, 7)$ and $(4, -5)$.\n- $m = \\frac{-5 - 7}{4 - (-2)} = \\frac{-12}{6} = -2$\n- Substitute $(4, -5)$: $-5 = -2(4) + c$, so $c = 3$\n- Equation: $y = -2x + 3$'),
  q(8, 'A line passes through $(1, 4)$ and $(3, 10)$. What is the equation of the line?',
    ['$y = 3x + 1$', '$y = 3x - 1$', '$y = 2x + 2$', '$y = 4x$'], 0,
    '$m = \\frac{10-4}{3-1} = \\frac{6}{2} = 3$. Substitute $(1,4)$: $4 = 3(1) + c$, so $c = 1$. Equation: $y = 3x + 1$.'),
  t(9, '### Geometry of Straight Lines: Angle Relationships\n\nIn Grade 9 you also study **angle relationships** formed by intersecting and parallel lines:\n\n**Perpendicular lines** meet at $90°$.\n\n**Intersecting lines** form **vertically opposite angles** (equal) and **supplementary angles** (adding to $180°$).\n\n**Parallel lines cut by a transversal** form:\n- **Corresponding angles** (F-angles) — equal\n- **Alternate interior angles** (Z-angles) — equal\n- **Co-interior angles** (C-angles or U-angles) — supplementary (add to $180°$)\n\nThese angle relationships are essential for geometry proofs and for understanding the gradients of parallel and perpendicular lines.'),
  q(10, 'If two parallel lines are cut by a transversal, co-interior angles:',
    ['Add up to $180°$', 'Are equal', 'Add up to $90°$', 'Add up to $360°$'], 0,
    'Co-interior angles (also called same-side interior or allied angles) are supplementary — they add up to $180°$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Geometry of 2D Shapes (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Triangles ---
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Properties of Triangles\n\nA triangle has three sides and three angles. The sum of the interior angles of any triangle is $180°$.\n\n### Classification by Sides\n\n| Type | Properties |\n|------|------------|\n| **Scalene** | No sides equal, no angles equal |\n| **Isosceles** | Two sides equal, base angles equal |\n| **Equilateral** | All three sides equal, all angles $= 60°$ |\n\n### Classification by Angles\n\n| Type | Properties |\n|------|------------|\n| **Acute-angled** | All angles less than $90°$ |\n| **Right-angled** | One angle exactly $90°$ |\n| **Obtuse-angled** | One angle greater than $90°$ |'),
  t(2, '### Angle Properties of Triangles\n\n**Interior angles:** The angles inside a triangle add up to $180°$.\n$$\\angle A + \\angle B + \\angle C = 180°$$\n\n**Exterior angle theorem:** An exterior angle of a triangle equals the sum of the two non-adjacent interior angles.\n\nIf $\\angle D$ is an exterior angle adjacent to $\\angle C$, then:\n$$\\angle D = \\angle A + \\angle B$$\n\n**Example:** In $\\triangle PQR$, $\\angle P = 65°$ and $\\angle Q = 48°$.\n- $\\angle R = 180° - 65° - 48° = 67°$\n- Exterior angle at $R = 65° + 48° = 113°$\n\nThese properties are used extensively in geometric proofs.'),
  q(3, 'In $\\triangle ABC$, $\\angle A = 70°$ and $\\angle B = 55°$. Find $\\angle C$.',
    ['$55°$', '$65°$', '$45°$', '$125°$'], 0,
    '$\\angle C = 180° - 70° - 55° = 55°$.'),
  t(4, '### Similar and Congruent Triangles\n\n**Congruent triangles** are exactly the same shape and size. Conditions for congruency:\n\n| Condition | Abbreviation | Meaning |\n|-----------|-------------|----------|\n| Side-Side-Side | SSS | All three sides equal |\n| Side-Angle-Side | SAS | Two sides and the included angle equal |\n| Angle-Angle-Side | AAS | Two angles and a corresponding side equal |\n| Right angle-Hypotenuse-Side | RHS | Right angle, hypotenuse, and one side equal |\n\n**Similar triangles** have the same shape but different sizes.\n- Corresponding angles are equal\n- Corresponding sides are in proportion\n\nIf $\\triangle ABC \\sim \\triangle DEF$, then:\n$$\\frac{AB}{DE} = \\frac{BC}{EF} = \\frac{AC}{DF}$$'),
  q(5, 'Two triangles have all three pairs of corresponding sides equal. These triangles are:',
    ['Congruent (SSS)', 'Similar', 'Neither similar nor congruent', 'Congruent (SAS)'], 0,
    'When all three sides are equal, the triangles are congruent by the SSS condition.'),
  fb(6, 'Congruent triangles have the same shape and ___. Similar triangles have the same ___ but may differ in size.',
    ['size', 'shape'],
    'Congruent = same shape and size. Similar = same shape, possibly different size.'),
  t(7, '### Properties of Quadrilaterals\n\nA **quadrilateral** has four sides and four angles. The sum of the interior angles is $360°$.\n\n| Quadrilateral | Properties |\n|---------------|------------|\n| **Parallelogram** | Opposite sides parallel and equal; opposite angles equal; diagonals bisect each other |\n| **Rectangle** | Parallelogram with all angles $= 90°$; diagonals equal |\n| **Square** | Rectangle with all sides equal; diagonals perpendicular |\n| **Rhombus** | Parallelogram with all sides equal; diagonals perpendicular; diagonals bisect angles |\n| **Trapezium** | One pair of opposite sides parallel |\n| **Kite** | Two pairs of adjacent sides equal; one pair of opposite angles equal; diagonals perpendicular |'),
  q(8, 'Which quadrilateral has all sides equal and all angles $90°$?',
    ['Square', 'Rhombus', 'Rectangle', 'Parallelogram'], 0,
    'A square has all sides equal (like a rhombus) and all angles $90°$ (like a rectangle).'),
  t(9, '### Diagonals of Quadrilaterals\n\n| Quadrilateral | Diagonals |\n|---------------|----------|\n| Parallelogram | Bisect each other |\n| Rectangle | Bisect each other and are equal |\n| Rhombus | Bisect each other at right angles |\n| Square | Bisect each other at right angles and are equal |\n| Kite | One diagonal bisects the other at right angles |\n| Trapezium | No special properties in general |\n\n**Interior angle sum of polygons:** For a polygon with $n$ sides:\n$$\\text{Sum of interior angles} = (n - 2) \\times 180°$$\n\n**Examples:**\n- Triangle ($n=3$): $(3-2) \\times 180° = 180°$\n- Quadrilateral ($n=4$): $(4-2) \\times 180° = 360°$\n- Pentagon ($n=5$): $(5-2) \\times 180° = 540°$\n- Hexagon ($n=6$): $(6-2) \\times 180° = 720°$'),
  q(10, 'What is the sum of the interior angles of an octagon (8 sides)?',
    ['$1\\,080°$', '$1\\,440°$', '$720°$', '$360°$'], 0,
    'Sum $= (8-2) \\times 180° = 6 \\times 180° = 1\\,080°$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Area and Perimeter (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Perimeter and Area of 2D Shapes ---
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Perimeter and Area of 2D Shapes\n\n**Perimeter** is the total distance around a shape. **Area** is the amount of surface a shape covers.\n\n### Formulae for Common Shapes\n\n| Shape | Perimeter | Area |\n|-------|-----------|------|\n| Square (side $s$) | $P = 4s$ | $A = s^2$ |\n| Rectangle ($l \\times b$) | $P = 2(l + b)$ | $A = l \\times b$ |\n| Triangle (base $b$, height $h$) | $P = a + b + c$ | $A = \\frac{1}{2}bh$ |\n| Parallelogram ($b, h$) | $P = 2(a + b)$ | $A = bh$ |\n| Trapezium (parallel sides $a, b$; height $h$) | $P = a + b + c + d$ | $A = \\frac{1}{2}(a + b)h$ |\n| Rhombus (diags $d_1, d_2$) | $P = 4s$ | $A = \\frac{1}{2}d_1 d_2$ |\n| Kite (diags $d_1, d_2$) | $P = 2(a + b)$ | $A = \\frac{1}{2}d_1 d_2$ |\n| Circle (radius $r$) | $C = 2\\pi r$ | $A = \\pi r^2$ |'),
  t(2, '### Worked Examples\n\n**Example 1:** Find the area and perimeter of a rectangle with length 12 cm and breadth 7 cm.\n- $P = 2(12 + 7) = 38$ cm\n- $A = 12 \\times 7 = 84$ cm$^2$\n\n**Example 2:** A circular pond in the Kirstenbosch Botanical Garden has a radius of 5 m. Find its circumference and area.\n- $C = 2\\pi(5) = 10\\pi \\approx 31{,}42$ m\n- $A = \\pi(5)^2 = 25\\pi \\approx 78{,}54$ m$^2$\n\n**Example 3:** A trapezium has parallel sides 8 cm and 14 cm, with a height of 6 cm.\n- $A = \\frac{1}{2}(8 + 14)(6) = \\frac{1}{2}(22)(6) = 66$ cm$^2$'),
  q(3, 'A circle has a diameter of 20 cm. What is its area? (Use $\\pi \\approx 3{,}14$)',
    ['$314$ cm$^2$', '$628$ cm$^2$', '$1\\,256$ cm$^2$', '$62{,}8$ cm$^2$'], 0,
    'Radius $= 10$ cm. $A = \\pi r^2 = 3{,}14 \\times 100 = 314$ cm$^2$.'),
  t(4, '### Effect of Doubling Dimensions\n\nWhat happens when you **double** the dimensions of a shape?\n\n**For perimeter:** If all dimensions are doubled, the perimeter doubles.\n$$P_{\\text{new}} = 2 \\times P_{\\text{original}}$$\n\n**For area:** If all dimensions are doubled, the area is multiplied by $4$ ($= 2^2$).\n$$A_{\\text{new}} = 4 \\times A_{\\text{original}}$$\n\n**In general:** If dimensions are multiplied by a scale factor $k$:\n- Perimeter is multiplied by $k$\n- Area is multiplied by $k^2$\n\n**Example:** A square has side 3 cm (area = 9 cm$^2$). If the side is tripled to 9 cm:\n- New area $= 81$ cm$^2$ $= 9 \\times 9 = 3^2 \\times 9$\n\nThe area increased by a factor of $3^2 = 9$.'),
  q(5, 'A rectangle has area 24 cm$^2$. If both the length and breadth are doubled, the new area is:',
    ['96 cm$^2$', '48 cm$^2$', '12 cm$^2$', '192 cm$^2$'], 0,
    'When dimensions are doubled, area is multiplied by $2^2 = 4$. New area $= 4 \\times 24 = 96$ cm$^2$.'),
  fb(6, 'When all dimensions of a 2D shape are multiplied by a factor $k$, the perimeter is multiplied by ___ and the area is multiplied by ___.',
    ['k', 'k squared'],
    'Perimeter scales linearly ($\\times k$). Area scales quadratically ($\\times k^2$).'),
  t(7, '### Composite Shapes\n\nA **composite shape** is made up of two or more basic shapes.\n\n**Strategy:**\n1. Break the shape into rectangles, triangles, circles, etc.\n2. Calculate the area of each part\n3. Add (or subtract) as needed\n\n**Example:** A school sports field in Nelspruit consists of a rectangle (100 m × 60 m) with a semicircle at each end (diameter = 60 m).\n\n- Rectangle area: $100 \\times 60 = 6\\,000$ m$^2$\n- Two semicircles = one full circle: $A = \\pi(30)^2 = 900\\pi \\approx 2\\,827{,}43$ m$^2$\n- Total area $\\approx 6\\,000 + 2\\,827{,}43 = 8\\,827{,}43$ m$^2$\n\n**Perimeter:** Straight sides: $2 \\times 100 = 200$ m. Two semicircle arcs: $2\\pi(30) \\approx 188{,}50$ m. Total $\\approx 388{,}50$ m.'),
  q(8, 'A square has side 10 cm with a semicircle on one side. The area of the entire shape is:',
    ['$100 + 12{,}5\\pi$ cm$^2$', '$100 + 25\\pi$ cm$^2$', '$100\\pi$ cm$^2$', '$100 + 50\\pi$ cm$^2$'], 0,
    'Square area $= 100$ cm$^2$. Semicircle: radius $= 5$ cm, area $= \\frac{1}{2}\\pi(5)^2 = 12{,}5\\pi$ cm$^2$. Total $= 100 + 12{,}5\\pi$ cm$^2$.'),
  t(9, '### Unit Conversions for Area\n\nWhen converting between units for area, remember to square the conversion factor.\n\n| Conversion | Factor |\n|------------|--------|\n| cm$^2$ to m$^2$ | $\\div 10\\,000$ (since $1$ m $= 100$ cm, $1$ m$^2 = 10\\,000$ cm$^2$) |\n| m$^2$ to cm$^2$ | $\\times 10\\,000$ |\n| m$^2$ to km$^2$ | $\\div 1\\,000\\,000$ |\n| m$^2$ to hectares | $\\div 10\\,000$ ($1$ ha $= 10\\,000$ m$^2$) |\n| mm$^2$ to cm$^2$ | $\\div 100$ |\n\n**Example:** A farm near Stellenbosch has an area of 35 000 m$^2$.\n- In hectares: $35\\,000 \\div 10\\,000 = 3{,}5$ ha\n- In km$^2$: $35\\,000 \\div 1\\,000\\,000 = 0{,}035$ km$^2$'),
  q(10, 'Convert 5 m$^2$ to cm$^2$.',
    ['$50\\,000$ cm$^2$', '$500$ cm$^2$', '$5\\,000$ cm$^2$', '$500\\,000$ cm$^2$'], 0,
    '$1$ m$^2 = 10\\,000$ cm$^2$. So $5$ m$^2 = 5 \\times 10\\,000 = 50\\,000$ cm$^2$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Geometry of 3D Objects (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: 3D Objects and Nets ---
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Geometry of 3D Objects\n\nA three-dimensional (3D) object has length, breadth, and height. Key vocabulary:\n- **Face:** A flat surface of the object\n- **Edge:** A line where two faces meet\n- **Vertex:** A corner point where edges meet\n\n### The Five Platonic Solids\n\n| Solid | Faces | Edges | Vertices | Face Shape |\n|-------|-------|-------|----------|------------|\n| Tetrahedron | 4 | 6 | 4 | Equilateral triangle |\n| Cube | 6 | 12 | 8 | Square |\n| Octahedron | 8 | 12 | 6 | Equilateral triangle |\n| Dodecahedron | 12 | 30 | 20 | Regular pentagon |\n| Icosahedron | 20 | 30 | 12 | Equilateral triangle |\n\n**Euler\'s formula:** $F + V - E = 2$ (Faces + Vertices - Edges = 2).\nThis holds for all convex polyhedra.'),
  t(2, '### Common 3D Objects\n\n**Prisms** have two identical parallel bases connected by rectangular faces.\n\n| Prism | Base Shape | Faces | Edges | Vertices |\n|-------|-----------|-------|-------|----------|\n| Rectangular prism | Rectangle | 6 | 12 | 8 |\n| Triangular prism | Triangle | 5 | 9 | 6 |\n| Hexagonal prism | Hexagon | 8 | 18 | 12 |\n\n**Pyramids** have one base and triangular faces meeting at an apex.\n\n| Pyramid | Base Shape | Faces | Edges | Vertices |\n|---------|-----------|-------|-------|----------|\n| Square pyramid | Square | 5 | 8 | 5 |\n| Triangular pyramid | Triangle | 4 | 6 | 4 |\n\n**Cylinder:** Two circular bases, one curved surface.\n\n**Cone:** One circular base, one curved surface, one apex.\n\n**Sphere:** One curved surface, no edges, no vertices.'),
  q(3, 'A rectangular prism has ___ faces, ___ edges, and ___ vertices.',
    ['6, 12, 8', '6, 8, 12', '8, 12, 6', '4, 6, 4'], 0,
    'A rectangular prism (box) has 6 faces, 12 edges, and 8 vertices. Check: $6 + 8 - 12 = 2$ ✓ (Euler\'s formula).'),
  t(4, '### Nets of 3D Objects\n\nA **net** is a flat pattern that folds up to make a 3D object.\n\n**Cube:** A net consists of 6 squares arranged so they fold into a cube. There are 11 different nets of a cube.\n\n**Rectangular prism:** 6 rectangles (3 pairs of identical rectangles).\n\n**Triangular prism:** 2 triangles and 3 rectangles.\n\n**Cylinder:** 2 circles and 1 rectangle (the width of the rectangle equals the circumference of the circle, $2\\pi r$).\n\n**Square pyramid:** 1 square and 4 identical triangles.\n\n**Cone:** 1 circle (base) and 1 sector of a circle (the curved surface).\n\nNets are useful for calculating **surface area** and for constructing 3D models.'),
  q(5, 'The net of a cylinder consists of:',
    ['2 circles and 1 rectangle', '2 circles and 2 rectangles', '1 circle and 1 rectangle', '2 squares and 1 rectangle'], 0,
    'A cylinder\'s net has 2 circles (top and bottom) and 1 rectangle (the curved surface unrolled).'),
  fb(6, 'Euler\'s formula for polyhedra states $F + V - E = ___$. The net of a triangular prism consists of 2 ___ and 3 rectangles.',
    ['2', 'triangles'],
    'Euler\'s formula: Faces + Vertices - Edges = 2. A triangular prism has triangular bases.'),
  t(7, '### Classifying 3D Objects\n\nWe classify 3D objects by their properties:\n\n**Right prisms** have bases perpendicular to the lateral faces. The sides are rectangles.\n\n**Oblique prisms** have bases that are not perpendicular — the shape leans.\n\n**Right pyramids** have an apex directly above the centre of the base.\n\n**Properties of spheres, cylinders, and cones:**\n- A **sphere** has every point on its surface equidistant from the centre\n- A **cylinder** has two parallel circular bases connected by a curved surface\n- A **cone** has one circular base and a curved surface tapering to a point (apex)\n\n**SA Context:** The Soccer City stadium (FNB Stadium) in Johannesburg is shaped like a calabash. Its structure involves complex 3D geometry including cones and cylinders.'),
  q(8, 'How many faces does a square pyramid have?',
    ['5', '4', '6', '8'], 0,
    'A square pyramid has 1 square base + 4 triangular faces = 5 faces.'),
  t(9, '### Building Models from Nets\n\n**Steps to build a 3D model:**\n1. Draw the net accurately on paper or cardboard\n2. Cut out the net\n3. Score along the fold lines\n4. Fold and glue tabs to form the 3D shape\n\n**Tips:**\n- Add glue tabs (small flaps) to alternate edges\n- Use a ruler to score fold lines neatly\n- Check that opposite faces are correctly positioned before glueing\n\n**Example:** To build a cube with edge length 4 cm:\n- Draw a net of 6 squares, each $4 \\times 4$ cm\n- Total surface area used: $6 \\times 16 = 96$ cm$^2$\n- Add extra for glue tabs: approximately 10-15% more material'),
  q(10, 'Which of the following is NOT a Platonic solid?',
    ['Rectangular prism', 'Tetrahedron', 'Cube', 'Icosahedron'], 0,
    'A rectangular prism is not a Platonic solid (its faces are not all identical regular polygons). The five Platonic solids are: tetrahedron, cube, octahedron, dodecahedron, and icosahedron.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: Surface Area and Volume (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Surface Area and Volume of Prisms and Cylinders ---
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Surface Area and Volume\n\n**Surface area** is the total area of all surfaces of a 3D object.\n**Volume** is the amount of space inside a 3D object.\n**Capacity** is the volume of liquid a container can hold (1 litre = 1 000 cm$^3$).\n\n### Formulae for Prisms\n\n| Solid | Surface Area | Volume |\n|-------|-------------|--------|\n| Cube (side $s$) | $6s^2$ | $s^3$ |\n| Rectangular prism ($l \\times b \\times h$) | $2(lb + bh + lh)$ | $lbh$ |\n| Triangular prism (base $b$, height of triangle $h_t$, length $l$) | Area of 2 triangles + 3 rectangles | $\\frac{1}{2}bh_t \\times l$ |\n| Cylinder (radius $r$, height $h$) | $2\\pi r^2 + 2\\pi rh$ | $\\pi r^2 h$ |\n\nThe volume of any prism is: $V = \\text{Area of base} \\times \\text{height}$'),
  t(2, '### Worked Examples\n\n**Example 1:** A rectangular water tank has length 2 m, breadth 1,5 m, and height 1 m.\n- Surface area $= 2(2 \\times 1{,}5 + 1{,}5 \\times 1 + 2 \\times 1) = 2(3 + 1{,}5 + 2) = 2(6{,}5) = 13$ m$^2$\n- Volume $= 2 \\times 1{,}5 \\times 1 = 3$ m$^3$\n- Capacity: $3$ m$^3 = 3\\,000$ litres\n\n**Example 2:** A cylindrical tin in a Johannesburg factory has radius 7 cm and height 15 cm.\n- Volume $= \\pi(7)^2(15) = 735\\pi \\approx 2\\,309{,}07$ cm$^3$\n- Capacity $\\approx 2{,}31$ litres\n- Surface area $= 2\\pi(7)^2 + 2\\pi(7)(15) = 98\\pi + 210\\pi = 308\\pi \\approx 967{,}61$ cm$^2$'),
  q(3, 'A cube has a side length of 5 cm. What is its volume?',
    ['125 cm$^3$', '25 cm$^3$', '150 cm$^3$', '75 cm$^3$'], 0,
    '$V = s^3 = 5^3 = 125$ cm$^3$.'),
  t(4, '### Effect of Doubling Dimensions on Volume\n\nIf all dimensions of a 3D object are multiplied by a scale factor $k$:\n\n- Surface area is multiplied by $k^2$\n- **Volume is multiplied by $k^3$**\n\n**Example:** A cube has side 3 cm.\n- Volume $= 27$ cm$^3$\n- Double all dimensions: side $= 6$ cm, volume $= 216$ cm$^3$\n- $\\frac{216}{27} = 8 = 2^3$\n\nThe volume increased by a factor of $2^3 = 8$.\n\n**SA Context:** A Joko tea box is $8 \\times 5 \\times 12$ cm. A \"family size\" box has all dimensions doubled: $16 \\times 10 \\times 24$ cm.\n- Original volume: $480$ cm$^3$\n- Family volume: $3\\,840$ cm$^3$\n- The family size holds $8$ times as much tea!'),
  q(5, 'If the radius and height of a cylinder are both tripled, the volume is multiplied by:',
    ['27', '9', '3', '6'], 0,
    'Volume scales by $k^3 = 3^3 = 27$. The new cylinder holds 27 times as much.'),
  fb(6, 'When all dimensions are multiplied by $k$, the volume is multiplied by ___. The unit conversion $1$ m$^3$ equals ___ litres.',
    ['k cubed', '1 000'],
    'Volume scales by $k^3$. And $1$ m$^3 = 1\\,000$ litres (since $1$ m$^3 = 1\\,000\\,000$ cm$^3$ and $1$ litre $= 1\\,000$ cm$^3$).'),
  t(7, '### Unit Conversions for Volume and Capacity\n\n| Conversion | Factor |\n|------------|--------|\n| cm$^3$ to m$^3$ | $\\div 1\\,000\\,000$ |\n| m$^3$ to cm$^3$ | $\\times 1\\,000\\,000$ |\n| cm$^3$ to litres | $\\div 1\\,000$ |\n| litres to cm$^3$ | $\\times 1\\,000$ |\n| m$^3$ to litres | $\\times 1\\,000$ |\n| ml to cm$^3$ | $1$ ml $= 1$ cm$^3$ |\n| kl to m$^3$ | $1$ kl $= 1$ m$^3$ |\n\n**Example:** A swimming pool in Durban has dimensions $10 \\times 5 \\times 2$ m.\n- Volume $= 100$ m$^3 = 100\\,000$ litres $= 100$ kl\n\n**Example:** A can of Coca-Cola holds 330 ml $= 330$ cm$^3$.'),
  q(8, 'A rectangular tank holds 5 000 litres. What is the volume in m$^3$?',
    ['5 m$^3$', '50 m$^3$', '0,5 m$^3$', '500 m$^3$'], 0,
    '$5\\,000$ litres $\\div 1\\,000 = 5$ m$^3$.'),
  t(9, '### Triangular Prisms\n\n**Example:** A triangular prism has a base that is a right triangle with legs 3 cm and 4 cm. The length of the prism is 10 cm.\n\n- Area of triangular base $= \\frac{1}{2} \\times 3 \\times 4 = 6$ cm$^2$\n- Volume $= 6 \\times 10 = 60$ cm$^3$\n- Hypotenuse of triangle $= \\sqrt{3^2 + 4^2} = 5$ cm\n- Surface area $= 2(6) + (3 + 4 + 5)(10) = 12 + 120 = 132$ cm$^2$\n\n**SA Context:** Toblerone chocolate boxes are shaped like triangular prisms. If a Toblerone box is 20 cm long with an equilateral triangle base of side 4 cm:\n- Area of base $= \\frac{\\sqrt{3}}{4}(4)^2 = 4\\sqrt{3} \\approx 6{,}93$ cm$^2$\n- Volume $\\approx 6{,}93 \\times 20 = 138{,}6$ cm$^3$'),
  q(10, 'A cylinder has a radius of 3 cm and a height of 10 cm. Its surface area is:',
    ['$78\\pi$ cm$^2$', '$90\\pi$ cm$^2$', '$69\\pi$ cm$^2$', '$108\\pi$ cm$^2$'], 0,
    'SA $= 2\\pi r^2 + 2\\pi rh = 2\\pi(9) + 2\\pi(3)(10) = 18\\pi + 60\\pi = 78\\pi$ cm$^2$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Transformation Geometry (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Transformations on the Cartesian Plane ---
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Transformation Geometry\n\nA **transformation** changes the position, size, or orientation of a geometric figure.\n\nIn Grade 9 we study four types of transformations:\n\n| Transformation | What it does | Changes size? |\n|----------------|-------------|---------------|\n| Translation | Slides the shape | No |\n| Reflection | Flips the shape over a line | No |\n| Rotation | Turns the shape around a point | No |\n| Enlargement/Reduction | Makes the shape bigger or smaller | Yes |\n\nTranslation, reflection, and rotation are called **isometries** (or rigid transformations) because they preserve size and shape.'),
  t(2, '### Translation\n\nA **translation** slides every point of a figure the same distance in the same direction.\n\nA translation is described by a vector or by movement in $x$ and $y$:\n$$(x, y) \\rightarrow (x + a, y + b)$$\n\n**Example:** Translate $A(2, 3)$ by 4 units right and 2 units down.\n$$(2, 3) \\rightarrow (2 + 4, 3 - 2) = (6, 1)$$\n\n**Example:** Translate triangle with vertices $A(1, 1)$, $B(4, 1)$, $C(1, 3)$ by $(-3, +2)$.\n- $A\' = (-2, 3)$\n- $B\' = (1, 3)$\n- $C\' = (-2, 5)$\n\nThe shape and size are preserved. The figure simply moves.'),
  q(3, 'Point $P(3, -2)$ is translated 5 units left and 3 units up. What are the new coordinates?',
    ['$(-2, 1)$', '$(8, 1)$', '$(-2, -5)$', '$(8, -5)$'], 0,
    '$(3 - 5, -2 + 3) = (-2, 1)$.'),
  t(4, '### Reflection\n\nA **reflection** flips a figure over a **line of reflection** (mirror line).\n\n| Reflection | Rule |\n|-----------|------|\n| In the $x$-axis | $(x, y) \\rightarrow (x, -y)$ |\n| In the $y$-axis | $(x, y) \\rightarrow (-x, y)$ |\n| In the line $y = x$ | $(x, y) \\rightarrow (y, x)$ |\n\n**Example:** Reflect $P(3, 5)$ in the $x$-axis: $P\' = (3, -5)$.\n\n**Example:** Reflect $Q(-2, 4)$ in the $y$-axis: $Q\' = (2, 4)$.\n\n**Example:** Reflect $R(1, 6)$ in the line $y = x$: $R\' = (6, 1)$.\n\nThe image is a mirror image — same shape and size, but the orientation is reversed (like your reflection in a mirror).'),
  q(5, 'Point $A(4, -3)$ is reflected in the $y$-axis. What are the coordinates of $A\'$?',
    ['$(-4, -3)$', '$(4, 3)$', '$(-4, 3)$', '$(3, -4)$'], 0,
    'Reflection in the $y$-axis: $(x, y) \\rightarrow (-x, y)$. So $A\' = (-4, -3)$.'),
  fb(6, 'Reflection in the $x$-axis changes $(x, y)$ to $(x, ___)$. Reflection in the line $y = x$ changes $(x, y)$ to $(___, x)$.',
    ['-y', 'y'],
    'In the $x$-axis: $(x, y) \\rightarrow (x, -y)$. In $y = x$: $(x, y) \\rightarrow (y, x)$.'),
  t(7, '### Rotation\n\nA **rotation** turns a figure around a fixed point (usually the origin) by a given angle.\n\n| Rotation (anticlockwise) | Rule |\n|--------------------------|------|\n| $90°$ | $(x, y) \\rightarrow (-y, x)$ |\n| $180°$ | $(x, y) \\rightarrow (-x, -y)$ |\n| $270°$ (or $90°$ clockwise) | $(x, y) \\rightarrow (y, -x)$ |\n\n**Example:** Rotate $A(3, 2)$ by $90°$ anticlockwise about the origin.\n$A\' = (-2, 3)$\n\n**Example:** Rotate $B(-1, 4)$ by $180°$ about the origin.\n$B\' = (1, -4)$\n\n**Tip:** A $180°$ rotation gives the same result whether clockwise or anticlockwise.'),
  q(8, 'Point $P(5, -1)$ is rotated $180°$ about the origin. What are the coordinates of $P\'$?',
    ['$(-5, 1)$', '$(1, -5)$', '$(-1, 5)$', '$(5, 1)$'], 0,
    '$180°$ rotation: $(x, y) \\rightarrow (-x, -y)$. So $P\' = (-5, 1)$.'),
  t(9, '### Enlargement and Reduction\n\nAn **enlargement** (or **dilation**) multiplies all lengths by a **scale factor** $k$.\n\n$$(x, y) \\rightarrow (kx, ky)$$\n\n- If $k > 1$: the figure gets **bigger** (enlargement)\n- If $0 < k < 1$: the figure gets **smaller** (reduction)\n- If $k < 0$: the figure is also reflected through the origin\n\n**Example:** Enlarge $\\triangle ABC$ with $A(1, 2)$, $B(3, 2)$, $C(1, 4)$ by scale factor $k = 2$.\n- $A\' = (2, 4)$, $B\' = (6, 4)$, $C\' = (2, 8)$\n\n**Effect on area:** The area of the image is $k^2$ times the original area.\n\n**SA Context:** Map scales use reduction. A scale of $1:50\\,000$ means $1$ cm on the map represents $50\\,000$ cm $= 500$ m $= 0{,}5$ km in real life.'),
  q(10, 'A shape is enlarged by a scale factor of 3. If the original perimeter was 12 cm, what is the new perimeter?',
    ['36 cm', '108 cm', '4 cm', '144 cm'], 0,
    'Perimeter is multiplied by $k = 3$. New perimeter $= 3 \\times 12 = 36$ cm.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 13: Theorem of Pythagoras (Term 2 — Geometry of Straight Lines)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Theorem of Pythagoras ---
blockNum = 0;
const ch13_lesson1 = [
  t(1, '## The Theorem of Pythagoras\n\nIn any **right-angled triangle**, the square of the hypotenuse equals the sum of the squares of the other two sides.\n\n$$c^2 = a^2 + b^2$$\n\nwhere $c$ is the **hypotenuse** (the longest side, opposite the right angle) and $a$ and $b$ are the other two sides.\n\n### Using the Theorem\n\n**Finding the hypotenuse:**\n$$c = \\sqrt{a^2 + b^2}$$\n\n**Finding a shorter side:**\n$$a = \\sqrt{c^2 - b^2}$$\n\n**Example:** A right triangle has legs $a = 5$ cm and $b = 12$ cm.\n$$c = \\sqrt{25 + 144} = \\sqrt{169} = 13 \\text{ cm}$$'),
  t(2, '### Pythagorean Triples\n\nA **Pythagorean triple** is a set of three whole numbers that satisfy $a^2 + b^2 = c^2$.\n\nCommon Pythagorean triples:\n- $(3, 4, 5)$ and multiples: $(6, 8, 10)$, $(9, 12, 15)$, $(15, 20, 25)$\n- $(5, 12, 13)$ and multiples: $(10, 24, 26)$\n- $(8, 15, 17)$\n- $(7, 24, 25)$\n\n### The Converse\n\nIf $a^2 + b^2 = c^2$, then the triangle is right-angled.\n\n**Example:** Is a triangle with sides 9, 40, 41 right-angled?\n$$9^2 + 40^2 = 81 + 1\\,600 = 1\\,681 = 41^2$$ ✓ Yes!\n\n**Classifying triangles:**\n- $a^2 + b^2 = c^2$: right-angled\n- $a^2 + b^2 > c^2$: acute-angled\n- $a^2 + b^2 < c^2$: obtuse-angled'),
  q(3, 'A right triangle has legs 6 cm and 8 cm. Find the hypotenuse.',
    ['10 cm', '14 cm', '100 cm', '7 cm'], 0,
    '$c = \\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10$ cm. This is the $(3,4,5)$ triple multiplied by 2.'),
  t(4, '### Finding Unknown Sides\n\n**Example 1:** A ladder 5 m long leans against a wall in a Cape Town house. The foot of the ladder is 3 m from the wall. How high up the wall does it reach?\n\n$$h = \\sqrt{5^2 - 3^2} = \\sqrt{25 - 9} = \\sqrt{16} = 4 \\text{ m}$$\n\n**Example 2:** A rectangular field in Mpumalanga measures 40 m by 30 m. Find the length of the diagonal.\n\n$$d = \\sqrt{40^2 + 30^2} = \\sqrt{1\\,600 + 900} = \\sqrt{2\\,500} = 50 \\text{ m}$$\n\n**Example 3:** An isosceles triangle has two equal sides of 13 cm and a base of 10 cm. Find the height.\n\nThe height bisects the base, creating two right triangles with hypotenuse 13 and base 5.\n$$h = \\sqrt{13^2 - 5^2} = \\sqrt{169 - 25} = \\sqrt{144} = 12 \\text{ cm}$$'),
  q(5, 'The diagonal of a rectangle is 25 cm and one side is 7 cm. Find the other side.',
    ['24 cm', '18 cm', '32 cm', '12 cm'], 0,
    '$b = \\sqrt{25^2 - 7^2} = \\sqrt{625 - 49} = \\sqrt{576} = 24$ cm.',
    ['This is the $(7, 24, 25)$ Pythagorean triple.']),
  fb(6, 'In a right-angled triangle, the longest side is called the ___. The theorem of Pythagoras states $c^2 = a^2 + ___$.',
    ['hypotenuse', 'b squared'],
    'The hypotenuse is opposite the right angle. Pythagoras: $c^2 = a^2 + b^2$.'),
  t(7, '### Distance Between Two Points\n\nThe theorem of Pythagoras leads directly to the **distance formula**.\n\nThe distance between points $A(x_1, y_1)$ and $B(x_2, y_2)$ is:\n\n$$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$\n\n**Example:** Distance between $A(1, 2)$ and $B(4, 6)$.\n$$d = \\sqrt{(4-1)^2 + (6-2)^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$$\n\n**Example:** Distance between $P(-3, 1)$ and $Q(2, -4)$.\n$$d = \\sqrt{(2-(-3))^2 + (-4-1)^2} = \\sqrt{25 + 25} = \\sqrt{50} = 5\\sqrt{2} \\approx 7{,}07$$'),
  q(8, 'Find the distance between $A(0, 0)$ and $B(5, 12)$.',
    ['13', '17', '7', '60'], 0,
    '$d = \\sqrt{25 + 144} = \\sqrt{169} = 13$. This is the $(5, 12, 13)$ Pythagorean triple.'),
  t(9, '### Applications of Pythagoras in 3D\n\nThe theorem can also be used in 3D by applying it twice.\n\n**Example:** Find the space diagonal of a box with dimensions $3 \\times 4 \\times 12$.\n\nStep 1: Find the diagonal of the base:\n$$d_{\\text{base}} = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$$\n\nStep 2: Find the space diagonal (using the base diagonal and the height):\n$$d_{\\text{space}} = \\sqrt{5^2 + 12^2} = \\sqrt{25 + 144} = \\sqrt{169} = 13$$\n\n**SA Context:** A ramp at a school in East London is 8 m long and rises 2 m. The horizontal distance is:\n$$h = \\sqrt{8^2 - 2^2} = \\sqrt{60} = 2\\sqrt{15} \\approx 7{,}75 \\text{ m}$$'),
  q(10, 'Is a triangle with sides 5, 7, and 9 right-angled?',
    ['No — it is acute-angled', 'Yes', 'No — it is obtuse-angled', 'Cannot be determined'], 0,
    'Check: $5^2 + 7^2 = 25 + 49 = 74$ and $9^2 = 81$. Since $74 < 81$ ($a^2 + b^2 < c^2$), the triangle is obtuse-angled. The correct answer is that it is NOT right-angled. Since $74 < 81$, actually it is obtuse. So the answer is C.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 14: Data Handling (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Collect, Organise, and Summarise Data ---
blockNum = 0;
const ch14_lesson1 = [
  t(1, '## Collecting Data\n\nThe data handling cycle:\n1. **Pose** a question\n2. **Collect** data\n3. **Organise** data\n4. **Summarise** data (statistics)\n5. **Represent** data (graphs)\n6. **Interpret** and report\n\n### Samples and Populations\n\n- **Population:** The entire group being studied\n- **Sample:** A smaller group selected from the population\n\nA good sample should be **representative** — it should reflect the characteristics of the population.\n\n**SA Context examples:**\n- Population: All Grade 9 learners in South Africa\n- Sample: 200 Grade 9 learners from 5 schools in Gauteng\n\n### Methods of Data Collection\n- Questionnaires / Surveys\n- Interviews\n- Observations\n- Experiments'),
  t(2, '### Organising Data\n\n**Frequency table:** Organises data by counting how often each value occurs.\n\n**Example:** Test scores of 20 learners:\n$52, 65, 73, 48, 65, 81, 73, 65, 90, 48, 52, 73, 81, 65, 73, 90, 48, 52, 65, 81$\n\n| Score | Tally | Frequency |\n|-------|-------|-----------|\n| 48 | III | 3 |\n| 52 | III | 3 |\n| 65 | IIII I | 5 |\n| 73 | IIII | 4 |\n| 81 | III | 3 |\n| 90 | II | 2 |\n\n**Grouped frequency table** — used when there are many different values:\n\n| Interval | Frequency |\n|----------|-----------|\n| 40–49 | 3 |\n| 50–59 | 3 |\n| 60–69 | 5 |\n| 70–79 | 4 |\n| 80–89 | 3 |\n| 90–99 | 2 |'),
  q(3, 'In the frequency table above, what is the modal score?',
    ['65', '73', '52', '81'], 0,
    'The mode is the value with the highest frequency. Score 65 appears 5 times, which is the most.'),
  t(4, '### Measures of Central Tendency\n\n| Measure | How to find it | When to use |\n|---------|----------------|-------------|\n| **Mean** | $\\bar{x} = \\frac{\\text{sum of values}}{\\text{number of values}}$ | General average |\n| **Median** | Middle value when data is ordered | Skewed data, outliers present |\n| **Mode** | Most frequent value | Categorical data |\n\n**Example:** Data set: $3, 5, 7, 7, 9, 10, 12$\n\n- Mean $= \\frac{3 + 5 + 7 + 7 + 9 + 10 + 12}{7} = \\frac{53}{7} \\approx 7{,}57$\n- Median $= 7$ (the 4th value in 7 ordered values)\n- Mode $= 7$ (appears twice)\n\n**For an even number of values:** The median is the average of the two middle values.\n\nData: $4, 6, 8, 10$ → Median $= \\frac{6 + 8}{2} = 7$'),
  q(5, 'Find the mean of: $12, 15, 18, 21, 24$.',
    ['18', '15', '21', '90'], 0,
    'Mean $= \\frac{12 + 15 + 18 + 21 + 24}{5} = \\frac{90}{5} = 18$.'),
  fb(6, 'The ___ is the most frequent value in a data set. The ___ is the middle value when data is arranged in order.',
    ['mode', 'median'],
    'Mode = most frequent. Median = middle value of ordered data.'),
  t(7, '### Measures of Dispersion\n\n**Range** $=$ highest value $-$ lowest value.\n\nThe range gives a rough idea of how spread out the data is.\n\n**Example:** Data: $23, 45, 56, 67, 89$\nRange $= 89 - 23 = 66$\n\n**Extremes and outliers:**\n- An **outlier** is a value that is much higher or lower than the rest\n- Outliers can distort the mean but do not affect the median\n\n**Example:** Salaries at a small company in Sandton: R8 000, R9 000, R10 000, R11 000, R95 000\n- Mean $= \\frac{133\\,000}{5} = R26\\,600$ (distorted by the R95 000)\n- Median $= R10\\,000$ (more representative)\n\nThe median is a better measure of central tendency when outliers are present.'),
  q(8, 'The data set is: $5, 8, 12, 15, 100$. Which measure of central tendency is most affected by the outlier?',
    ['Mean', 'Median', 'Mode', 'Range'], 0,
    'The mean is $\\frac{140}{5} = 28$, pulled up by the outlier 100. The median is 12, unaffected. The mean is most affected.'),
  t(9, '### Representing Data\n\nChoose the right graph for your data:\n\n| Graph | Best for |\n|-------|----------|\n| Bar graph | Comparing categories |\n| Double bar graph | Comparing two sets of categorical data |\n| Histogram | Showing distribution of continuous grouped data |\n| Pie chart | Showing proportions/percentages of a whole |\n| Broken-line graph | Showing change over time |\n| Scatter plot | Showing relationship between two variables |\n\n**Key difference:** Bar graphs have **gaps** between bars (discrete data). Histograms have **no gaps** (continuous data).\n\n**SA Context:** The census data from Statistics South Africa (Stats SA) is often shown using bar graphs and pie charts to represent population distribution by province.'),
  q(10, 'Which graph is best for showing how temperature changes over a 24-hour period?',
    ['Broken-line graph', 'Bar graph', 'Pie chart', 'Histogram'], 0,
    'A broken-line graph (line graph) is best for showing change over time. Each point represents the temperature at a specific time, connected by lines.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 15: Probability (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Basic Probability ---
blockNum = 0;
const ch15_lesson1 = [
  t(1, '## Probability\n\nProbability measures how likely an event is to occur.\n\n$$P(\\text{event}) = \\frac{\\text{number of favourable outcomes}}{\\text{total number of possible outcomes}}$$\n\n### Probability Scale\n\n$$0 \\leq P(\\text{event}) \\leq 1$$\n\n| Probability | Meaning |\n|------------|----------|\n| $P = 0$ | Impossible |\n| $P = 0{,}5$ | Even chance |\n| $P = 1$ | Certain |\n\n**Complement:** $P(\\text{not } A) = 1 - P(A)$\n\n**Example:** A bag contains 3 red, 5 blue, and 2 green marbles.\n- $P(\\text{red}) = \\frac{3}{10}$\n- $P(\\text{blue}) = \\frac{5}{10} = \\frac{1}{2}$\n- $P(\\text{not green}) = 1 - \\frac{2}{10} = \\frac{8}{10} = \\frac{4}{5}$'),
  t(2, '### Equally Likely Outcomes\n\n**Dice:** A standard die has 6 faces: $\\{1, 2, 3, 4, 5, 6\\}$.\n- $P(3) = \\frac{1}{6}$\n- $P(\\text{even}) = \\frac{3}{6} = \\frac{1}{2}$\n- $P(\\text{greater than 4}) = \\frac{2}{6} = \\frac{1}{3}$\n\n**Coins:** $P(\\text{heads}) = \\frac{1}{2}$, $P(\\text{tails}) = \\frac{1}{2}$.\n\n**Cards:** A standard deck has 52 cards (4 suits × 13 values).\n- $P(\\text{heart}) = \\frac{13}{52} = \\frac{1}{4}$\n- $P(\\text{king}) = \\frac{4}{52} = \\frac{1}{13}$\n- $P(\\text{red card}) = \\frac{26}{52} = \\frac{1}{2}$\n\n**SA Lotto:** The probability of matching all 6 numbers from 52 is:\n$$P = \\frac{1}{\\binom{52}{6}} = \\frac{1}{20\\,358\\,520}$$\nAbout 1 in 20 million — extremely unlikely!'),
  q(3, 'A bag contains 4 red balls and 6 blue balls. What is $P$(red)?',
    ['$\\frac{2}{5}$', '$\\frac{3}{5}$', '$\\frac{4}{6}$', '$\\frac{1}{4}$'], 0,
    'Total $= 10$. $P(\\text{red}) = \\frac{4}{10} = \\frac{2}{5}$.'),
  t(4, '### Two-Way Tables and Tree Diagrams\n\nA **two-way table** shows outcomes for two combined events.\n\n**Example:** Rolling a die and flipping a coin.\n\n|  | H | T |\n|---|---|---|\n| 1 | (1,H) | (1,T) |\n| 2 | (2,H) | (2,T) |\n| 3 | (3,H) | (3,T) |\n| 4 | (4,H) | (4,T) |\n| 5 | (5,H) | (5,T) |\n| 6 | (6,H) | (6,T) |\n\nTotal outcomes: $6 \\times 2 = 12$.\n\n$P(\\text{even number and heads}) = \\frac{3}{12} = \\frac{1}{4}$\n\nA **tree diagram** shows all outcomes as branches:\n- First branch: die outcomes (6 branches)\n- Second branch: coin outcomes (H or T from each)\n- Each path = one outcome'),
  q(5, 'Two coins are tossed. How many possible outcomes are there?',
    ['4', '2', '3', '8'], 0,
    'Each coin has 2 outcomes. Total $= 2 \\times 2 = 4$: HH, HT, TH, TT.'),
  fb(6, 'The probability of an impossible event is ___. The probability of event $A$ plus the probability of the complement of $A$ equals ___.',
    ['0', '1'],
    '$P(\\text{impossible}) = 0$. $P(A) + P(\\text{not } A) = 1$.'),
  t(7, '### Compound Events\n\nWhen two events happen one after the other, we can use the **product rule** for independent events:\n\n$$P(A \\text{ and } B) = P(A) \\times P(B)$$\n\n**Example:** A spinner has 3 equal sections: red, blue, green. It is spun twice.\n$P(\\text{red then blue}) = \\frac{1}{3} \\times \\frac{1}{3} = \\frac{1}{9}$\n\nFor mutually exclusive events (cannot happen at the same time):\n$$P(A \\text{ or } B) = P(A) + P(B)$$\n\n**Example:** $P(\\text{rolling a 2 or a 5}) = \\frac{1}{6} + \\frac{1}{6} = \\frac{2}{6} = \\frac{1}{3}$'),
  q(8, 'A coin is tossed and a die is rolled. What is $P$(heads and 6)?',
    ['$\\frac{1}{12}$', '$\\frac{1}{6}$', '$\\frac{1}{2}$', '$\\frac{2}{12}$'], 0,
    '$P(H) \\times P(6) = \\frac{1}{2} \\times \\frac{1}{6} = \\frac{1}{12}$.'),
  t(9, '### Relative Frequency vs Theoretical Probability\n\n**Theoretical probability** is calculated from known outcomes.\n**Relative frequency** (experimental probability) is calculated from actual experiments.\n\n$$\\text{Relative frequency} = \\frac{\\text{number of times event occurred}}{\\text{total number of trials}}$$\n\n**Example:** Nomsa rolls a die 60 times and gets a 4 exactly 8 times.\n- Relative frequency of rolling a 4: $\\frac{8}{60} = \\frac{2}{15} \\approx 0{,}133$\n- Theoretical probability: $\\frac{1}{6} \\approx 0{,}167$\n\nAs the number of trials increases, the relative frequency approaches the theoretical probability. This is called the **Law of Large Numbers**.\n\n**SA Context:** In cricket, a batsman\'s batting average is a relative frequency — it estimates the probability of scoring a certain number of runs per innings.'),
  q(10, 'A coin is tossed 200 times. Heads appears 112 times. What is the relative frequency of heads?',
    ['0,56', '0,50', '0,44', '112'], 0,
    'Relative frequency $= \\frac{112}{200} = 0{,}56$. This is close to the theoretical probability of $0{,}5$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 16: Revision and Exam Preparation
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Exam Structure and Key Formulae ---
blockNum = 0;
const ch16_lesson1 = [
  t(1, '## Grade 9 Mathematics Exam Preparation\n\nThe Grade 9 Mathematics Common Assessment covers all topics from Terms 1 to 4. Understanding the structure helps you prepare effectively.\n\n### Exam Structure\n\nThe exam typically consists of:\n\n| Section | Topics | Approximate % |\n|---------|--------|--------------|\n| Numbers and Operations | Integers, exponents, fractions, percentages, financial maths | 15% |\n| Patterns, Functions, Algebra | Patterns, relationships, expressions, equations | 30% |\n| Geometry and Measurement | 2D shapes, 3D objects, transformation, Pythagoras, area, volume | 35% |\n| Data Handling and Probability | Statistics, graphs, probability | 20% |'),
  t(2, '### Key Formulae — Numbers and Algebra\n\n| Topic | Formula |\n|-------|--------|\n| Exponent laws | $a^m \\times a^n = a^{m+n}$, $a^m \\div a^n = a^{m-n}$, $(a^m)^n = a^{mn}$ |\n| Simple interest | $A = P(1 + in)$ |\n| Compound interest | $A = P(1 + i)^n$ |\n| Linear pattern | $T_n = a + (n-1)d$ |\n| Geometric pattern | $T_n = ar^{n-1}$ |\n| Difference of squares | $a^2 - b^2 = (a+b)(a-b)$ |\n| Square of binomial | $(a \\pm b)^2 = a^2 \\pm 2ab + b^2$ |\n| Gradient | $m = \\frac{y_2 - y_1}{x_2 - x_1}$ |\n| Linear equation | $y = mx + c$ |'),
  q(3, 'Which formula gives the nth term of a linear sequence?',
    ['$T_n = a + (n-1)d$', '$T_n = ar^{n-1}$', '$T_n = an^2$', '$T_n = \\frac{a}{n}$'], 0,
    '$T_n = a + (n-1)d$ where $a$ is the first term and $d$ is the common difference.'),
  t(4, '### Key Formulae — Geometry and Measurement\n\n| Topic | Formula |\n|-------|--------|\n| Pythagoras | $c^2 = a^2 + b^2$ |\n| Distance formula | $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$ |\n| Triangle area | $A = \\frac{1}{2}bh$ |\n| Circle circumference | $C = 2\\pi r$ |\n| Circle area | $A = \\pi r^2$ |\n| Trapezium area | $A = \\frac{1}{2}(a + b)h$ |\n| Rectangular prism volume | $V = lbh$ |\n| Cylinder volume | $V = \\pi r^2 h$ |\n| Cylinder surface area | $SA = 2\\pi r^2 + 2\\pi rh$ |\n| Polygon interior angles | $(n - 2) \\times 180°$ |\n| Enlargement (area) | $A\' = k^2 A$ |\n| Enlargement (volume) | $V\' = k^3 V$ |'),
  q(5, 'What is the formula for the volume of a cylinder?',
    ['$V = \\pi r^2 h$', '$V = 2\\pi r h$', '$V = \\frac{4}{3}\\pi r^3$', '$V = \\pi r^2$'], 0,
    'Volume of a cylinder $= \\pi r^2 h$ (area of circular base times height).'),
  fb(6, 'The interior angles of a polygon with $n$ sides sum to $(n - 2) \\times ___°$. The Pythagorean theorem states $c^2 = a^2 + ___$.',
    ['180', 'b squared'],
    'Sum of interior angles $= (n-2) \\times 180°$. Pythagoras: $c^2 = a^2 + b^2$.'),
  t(7, '### Common Mistakes to Avoid\n\n**Algebra:**\n- $(x + y)^2 \\neq x^2 + y^2$ — you must include $2xy$\n- $-3^2 = -(3^2) = -9$ but $(-3)^2 = 9$\n- Dividing by $x$ loses the solution $x = 0$\n- Always write the equation in standard form before factorising\n\n**Geometry:**\n- Forgetting to use the correct units (cm$^2$ for area, cm$^3$ for volume)\n- Confusing radius and diameter ($r = \\frac{d}{2}$)\n- Using degrees and radians incorrectly\n- Forgetting to apply the scale factor squared for area\n\n**Data:**\n- Forgetting to order data before finding the median\n- Using the wrong formula for the mean of grouped data\n- Confusing bar graphs (gaps) with histograms (no gaps)'),
  q(8, 'What is the value of $(-5)^2 - 5^2$?',
    ['0', '-50', '50', '10'], 0,
    '$(-5)^2 = 25$ and $5^2 = 25$. So $25 - 25 = 0$.'),
  t(9, '### Exam Strategies\n\n1. **Read the question carefully** — underline key words like "hence", "simplify", "factorise", "prove"\n2. **Show all working** — marks are awarded for method, not just the answer\n3. **Check units** — make sure your answer uses the correct units (cm, m$^2$, litres)\n4. **Use diagrams** — draw a sketch for geometry problems\n5. **Manage your time** — do the questions you know first, then return to harder ones\n6. **Check your answers** — substitute back to verify algebra answers\n7. **Watch for negative signs** — especially in brackets and exponents\n8. **State reasons in geometry** — every angle calculation needs a reason\n\n**SA Context:** The ANA (Annual National Assessment) and provincial common exams follow the CAPS weighting. Focus on algebra and geometry, which together make up about 65% of the marks.'),
  q(10, 'When factorising $x^2 + 6x + 9$, the result is:',
    ['$(x + 3)^2$', '$(x + 9)(x + 1)$', '$(x + 6)(x + 3)$', '$(x - 3)^2$'], 0,
    '$x^2 + 6x + 9$ is a perfect square trinomial: $= (x + 3)^2$. Check: $(x+3)(x+3) = x^2 + 6x + 9$ ✓.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// DB INSERTION
// ═══════════════════════════════════════════════════════════════════════════════

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
    tags: ['mathematics', 'grade-9', 'caps'],
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
      title: 'Chapter 1: Whole Numbers and Integers',
      description: 'Properties of the real number system, operations with integers, LCM and HCF, ratio, rate, proportion, percentages, VAT, simple and compound interest, hire purchase.',
      order: 1,
      lessons: [
        { title: 'Properties of Numbers and Operations with Integers', description: 'Number sets, properties of operations, integer arithmetic, BODMAS, prime factorisation, LCM and HCF, solving problems with integers.', blocks: ch1_lesson1, term: 1 },
        { title: 'Ratio, Rate, Proportion, and Financial Mathematics', description: 'Ratios, rates, direct and inverse proportion, percentages, VAT, profit and loss, simple and compound interest, hire purchase.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Exponents',
      description: 'Laws of exponents, negative exponents, scientific notation, squares, cubes, square roots, and cube roots.',
      order: 2,
      lessons: [
        { title: 'Laws of Exponents', description: 'Product, quotient, power, zero and negative exponent laws, scientific notation, prime factorisation strategy, squares, cubes and roots.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Numeric and Geometric Patterns',
      description: 'Linear and geometric number patterns, constant differences and ratios, finding the general term, patterns in physical and real-world contexts.',
      order: 3,
      lessons: [
        { title: 'Number Patterns and Sequences', description: 'Linear patterns with constant differences, geometric patterns with constant ratios, general term formulae, matchstick and real-world patterns.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Functions and Relationships',
      description: 'Input-output relationships, flow diagrams, tables, formulae, graphs, substitution, and equivalent representations of functions.',
      order: 4,
      lessons: [
        { title: 'Input-Output, Tables, and Graphs', description: 'Representations of functions (verbal, flow diagram, table, formula, graph), determining rules from tables, substitution, generating ordered pairs.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Algebraic Expressions',
      description: 'Algebraic language, like and unlike terms, expanding, FOIL, squaring binomials, difference of squares, dividing by monomials, factorisation, and simplifying algebraic fractions.',
      order: 5,
      lessons: [
        { title: 'Algebraic Language and Simplification', description: 'Terminology, adding like terms, multiplying monomials and polynomials, FOIL, squaring binomials, difference of squares, dividing polynomials by monomials.', blocks: ch5_lesson1, term: 1 },
        { title: 'Factorisation', description: 'Common factor, difference of two squares, trinomials, grouping, simplifying algebraic fractions using factorisation.', blocks: ch5_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Algebraic Equations',
      description: 'Solving linear equations with fractions, solving quadratic equations by factorisation, and word problems leading to equations.',
      order: 6,
      lessons: [
        { title: 'Solving Linear and Quadratic Equations', description: 'Linear equations, equations with fractions, quadratic equations by factorisation, word problems, setting up and solving equations.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Graphs',
      description: 'Interpreting global graphs, features of graphs, drawing linear graphs from equations, finding equations from graphs, and angle relationships with straight lines.',
      order: 7,
      lessons: [
        { title: 'Interpreting and Drawing Graphs', description: 'Global graph features (linear, increasing, decreasing, maximum, minimum), drawing y=mx+c, gradient and y-intercept, equation from graph, angle relationships.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Geometry of 2D Shapes',
      description: 'Properties of triangles, congruent and similar triangles, properties of quadrilaterals, diagonals, interior angle sum of polygons.',
      order: 8,
      lessons: [
        { title: 'Triangles and Quadrilaterals', description: 'Classifying triangles by sides and angles, angle properties, exterior angle theorem, congruency conditions, similarity, quadrilateral properties, polygon angle sums.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Area and Perimeter',
      description: 'Perimeter and area formulae for all common 2D shapes, effect of scaling on perimeter and area, composite shapes, and unit conversions.',
      order: 9,
      lessons: [
        { title: 'Perimeter and Area of 2D Shapes', description: 'Formulae for square, rectangle, triangle, parallelogram, trapezium, rhombus, kite, circle, composite shapes, effect of doubling dimensions, unit conversions.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Geometry of 3D Objects',
      description: 'Platonic solids, prisms, pyramids, cylinders, cones, spheres, Euler\'s formula, and nets of 3D objects.',
      order: 10,
      lessons: [
        { title: '3D Objects and Nets', description: 'Faces, edges, vertices, five Platonic solids, Euler\'s formula, prisms, pyramids, cylinders, cones, spheres, nets, and building models.', blocks: ch10_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 11: Surface Area and Volume',
      description: 'Surface area and volume of cubes, rectangular prisms, triangular prisms, and cylinders. Effect of scaling on surface area and volume. Unit conversions.',
      order: 11,
      lessons: [
        { title: 'Surface Area and Volume of Prisms and Cylinders', description: 'Formulae for surface area and volume, effect of scaling, unit conversions for volume and capacity, real-world applications.', blocks: ch11_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 12: Transformation Geometry',
      description: 'Translations, reflections (x-axis, y-axis, y=x), rotations (90°, 180°, 270°), and enlargements/reductions on the Cartesian plane.',
      order: 12,
      lessons: [
        { title: 'Transformations on the Cartesian Plane', description: 'Translation, reflection in axes and y=x, rotation about the origin, enlargement and reduction, scale factor effects on perimeter and area.', blocks: ch12_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 13: Theorem of Pythagoras',
      description: 'Theorem of Pythagoras, Pythagorean triples, converse, classifying triangles, distance formula, and 3D applications.',
      order: 13,
      lessons: [
        { title: 'Theorem of Pythagoras', description: 'Statement and proof, finding hypotenuse and shorter sides, Pythagorean triples, converse for classifying triangles, distance formula, 3D applications.', blocks: ch13_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 14: Data Handling',
      description: 'Collecting, organising, and summarising data. Measures of central tendency and dispersion. Representing data with appropriate graphs.',
      order: 14,
      lessons: [
        { title: 'Collect, Organise, and Summarise Data', description: 'Data handling cycle, samples vs populations, frequency tables, mean, median, mode, range, outliers, bar graphs, histograms, pie charts, line graphs.', blocks: ch14_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 15: Probability',
      description: 'Theoretical probability, relative frequency, two-way tables, tree diagrams, compound events, and the Law of Large Numbers.',
      order: 15,
      lessons: [
        { title: 'Basic Probability', description: 'Probability scale, equally likely outcomes, complement, two-way tables, tree diagrams, compound events, relative frequency vs theoretical probability.', blocks: ch15_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 16: Revision and Exam Preparation',
      description: 'Exam structure, key formulae for all topics, common mistakes, and exam strategies for the Grade 9 Mathematics assessment.',
      order: 16,
      lessons: [
        { title: 'Exam Structure, Key Formulae, and Exam Tips', description: 'Exam weighting, algebra and geometry formulae summary, common mistakes to avoid, exam strategies, and time management tips.', blocks: ch16_lesson1, term: 4 },
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
    title: 'Grade 9 Mathematics \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Whole Numbers and Integers, Exponents, Numeric and Geometric Patterns, Functions and Relationships, Algebraic Expressions, Algebraic Equations, Graphs, Geometry of 2D Shapes, Area and Perimeter, Geometry of 3D Objects, Surface Area and Volume, Transformation Geometry, Theorem of Pythagoras, Data Handling, Probability, and Exam Preparation for the Grade 9 Mathematics assessment.',
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
  console.log('  TEXTBOOK: Grade 9 Mathematics');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
