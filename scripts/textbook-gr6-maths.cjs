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

blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Whole Numbers\n\nWhole numbers are $0, 1, 2, 3, 4, 5, \\ldots$ They go on forever.\n\nIn Grade 6 we work with whole numbers up to **9 digits** (hundreds of millions).\n\n### Place Value up to 9 Digits\n\nEvery digit in a number has a **place value** depending on its position.\n\n| Hundred-millions | Ten-millions | Millions | Hundred-thousands | Ten-thousands | Thousands | Hundreds | Tens | Ones |\n|---|---|---|---|---|---|---|---|---|\n| 100 000 000 | 10 000 000 | 1 000 000 | 100 000 | 10 000 | 1 000 | 100 | 10 | 1 |\n\n**Example:** In the number $305\\,472\\,816$:\n- The digit $3$ is in the hundred-millions place — its value is $300\\,000\\,000$\n- The digit $5$ is in the millions place — its value is $5\\,000\\,000$\n- The digit $8$ is in the hundreds place — its value is $800$\n\n### Ordering and Comparing\n\nUse the symbols $<$ (less than), $>$ (greater than), and $=$ (equals).\n\n**Example:** Arrange in ascending order: $4\\,523\\,100$; $4\\,532\\,100$; $4\\,523\\,010$\n$$4\\,523\\,010 < 4\\,523\\,100 < 4\\,532\\,100$$'),
  t(2, '### Rounding Off\n\nRounding makes numbers simpler to work with.\n\n**Rules:**\n- Look at the digit to the **right** of the rounding position.\n- If it is **5 or more**, round **up**.\n- If it is **less than 5**, round **down**.\n\n**Examples:**\n- Round $3\\,467$ to the nearest thousand: $3\\,000$ (the 4 rounds down)\n- Round $85\\,500$ to the nearest thousand: $86\\,000$ (the 5 rounds up)\n- Round $2\\,345\\,678$ to the nearest million: $2\\,000\\,000$\n\n### Properties of Operations\n\n| Property | Addition | Multiplication |\n|----------|----------|----------------|\n| Commutative | $a + b = b + a$ | $a \\times b = b \\times a$ |\n| Associative | $(a + b) + c = a + (b + c)$ | $(a \\times b) \\times c = a \\times (b \\times c)$ |\n| Distributive | $a \\times (b + c) = a \\times b + a \\times c$ | |\n| Identity | $a + 0 = a$ | $a \\times 1 = a$ |\n\nThe number $0$ is the **additive identity** and $1$ is the **multiplicative identity**.\n\n**Division by zero is undefined** — you can never divide by $0$.'),
  q(3, 'What is the value of the digit $7$ in $47\\,302\\,581$?',
    ['$7\\,000\\,000$', '$700\\,000$', '$70\\,000\\,000$', '$7\\,000$'], 0,
    'The $7$ is in the millions place, so its value is $7\\,000\\,000$.'),
  t(4, '### BODMAS — Order of Operations\n\nWhen a calculation has more than one operation, follow the correct order:\n\n1. **B**rackets\n2. **O**rders (powers and roots)\n3. **D**ivision and **M**ultiplication (left to right)\n4. **A**ddition and **S**ubtraction (left to right)\n\n**Example 1:** $8 + 4 \\times 3 = 8 + 12 = 20$ (NOT $36$)\n\n**Example 2:** $(5 + 3) \\times 2 - 4 = 8 \\times 2 - 4 = 16 - 4 = 12$\n\n**Example 3:** $30 - 12 \\div 4 + 5 = 30 - 3 + 5 = 32$\n\n**Common mistake:** Adding before multiplying. Always do multiplication and division before addition and subtraction, unless brackets say otherwise.'),
  q(5, 'Calculate using BODMAS: $6 + 2 \\times 5 - 3$.',
    ['$13$', '$37$', '$15$', '$10$'], 0,
    'Multiplication first: $2 \\times 5 = 10$. Then left to right: $6 + 10 - 3 = 13$.'),
  fb(6, 'When we round $4\\,567$ to the nearest hundred, we get ___. The additive identity is ___.',
    ['4 600', '0'],
    'The tens digit is 6 (5 or more), so round up: $4\\,600$. Adding $0$ to any number gives the same number.'),
  t(7, '### Estimation\n\nEstimation helps you check whether your answer is reasonable.\n\n**To estimate:** Round each number to the nearest convenient value, then calculate.\n\n**Example:** Estimate $493 + 312$.\n- Round: $500 + 300 = 800$\n- Exact answer: $493 + 312 = 805$\n- The estimate is close — the answer is reasonable.\n\n**Example:** A school in Pretoria buys $48$ calculators at R$89$ each. Estimate the total cost.\n- Round: $50 \\times 90 = R4\\,500$\n- Exact: $48 \\times 89 = R4\\,272$\n\n**Estimation is NOT guessing** — it is a careful calculation using rounded numbers.'),
  q(8, 'Estimate $397 \\times 21$ by rounding to the nearest ten.',
    ['$8\\,000$', '$8\\,400$', '$7\\,800$', '$9\\,000$'], 0,
    'Round: $400 \\times 20 = 8\\,000$. Exact answer: $397 \\times 21 = 8\\,337$.'),
  t(9, '### Problem Solving with Whole Numbers\n\n**Example 1:** The population of a South African city is $1\\,234\\,567$. Round this to the nearest hundred thousand.\n$$1\\,200\\,000$$\n\n**Example 2:** A bus from Johannesburg to Durban travels $568$ km. If the bus makes $4$ return trips per week, how many km does it travel in a week?\n$$568 \\times 2 \\times 4 = 568 \\times 8 = 4\\,544 \\text{ km}$$\n\n**Example 3:** Arrange in descending order: $12\\,045\\,300$; $12\\,450\\,300$; $12\\,043\\,500$\n$$12\\,450\\,300 > 12\\,045\\,300 > 12\\,043\\,500$$'),
  q(10, 'Round $56\\,450$ to the nearest thousand.',
    ['$56\\,000$', '$57\\,000$', '$56\\,500$', '$55\\,000$'], 0,
    'The hundreds digit is $4$ (less than 5), so round down: $56\\,000$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Number Sentences and Number Patterns (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Number Sentences and Number Patterns\n\nA **number sentence** is a mathematical statement that uses numbers, operations, and an equals sign.\n\n### Number Sentences with Variables\n\nA **variable** is a letter that stands for an unknown number.\n\n**Example 1:** Solve for $x$: $x + 15 = 42$\n$$x = 42 - 15 = 27$$\n\n**Example 2:** Solve for $y$: $3 \\times y = 36$\n$$y = 36 \\div 3 = 12$$\n\n**Example 3:** Solve for $n$: $n - 8 = 25$\n$$n = 25 + 8 = 33$$\n\nTo solve a number sentence, use the **inverse operation**:\n- The inverse of addition is subtraction.\n- The inverse of multiplication is division.'),
  t(2, '### Input-Output Rules\n\nA rule connects input values to output values.\n\n**Example:** The rule is "multiply by $3$ then add $2$".\n\n| Input | Output |\n|-------|--------|\n| 1 | $1 \\times 3 + 2 = 5$ |\n| 2 | $2 \\times 3 + 2 = 8$ |\n| 3 | $3 \\times 3 + 2 = 11$ |\n| 4 | $4 \\times 3 + 2 = 14$ |\n| 5 | $5 \\times 3 + 2 = 17$ |\n\nThe rule can be written as: $\\text{output} = 3 \\times \\text{input} + 2$\n\n### Finding the Rule\n\n**Example:** Find the rule for this table:\n\n| Input | 1 | 2 | 3 | 4 | 5 |\n|-------|---|---|---|---|---|\n| Output | 4 | 7 | 10 | 13 | 16 |\n\nThe difference between consecutive outputs is $3$. When input $= 1$, output $= 4 = 3 \\times 1 + 1$.\nRule: $\\text{output} = 3 \\times \\text{input} + 1$.'),
  q(3, 'Solve for $x$: $x \\times 4 = 52$.',
    ['$13$', '$48$', '$56$', '$208$'], 0,
    'Use the inverse: $x = 52 \\div 4 = 13$.'),
  t(4, '### Numeric Patterns\n\nA **numeric pattern** (or number sequence) follows a rule.\n\n**Constant difference:** The same number is added or subtracted each time.\n- $5, 9, 13, 17, 21, \\ldots$ (add $4$ each time)\n- $100, 93, 86, 79, \\ldots$ (subtract $7$ each time)\n\n**Example:** What is the next number in the pattern $3, 8, 13, 18, \\ldots$?\nThe constant difference is $+5$. Next number: $18 + 5 = 23$.\n\n**Example:** Describe the rule and find the 10th term of: $2, 6, 10, 14, \\ldots$\n- Rule: Start at $2$, add $4$ each time.\n- 10th term: $2 + (10 - 1) \\times 4 = 2 + 36 = 38$.'),
  q(5, 'What is the next number in the pattern $45, 39, 33, 27, \\ldots$?',
    ['$21$', '$24$', '$18$', '$22$'], 0,
    'The constant difference is $-6$. Next: $27 - 6 = 21$.'),
  fb(6, 'In the pattern $7, 12, 17, 22, \\ldots$ the constant difference is ___. The inverse of multiplication is ___.',
    ['5', 'division'],
    'Each term increases by $5$. Division undoes multiplication.'),
  t(7, '### Geometric Patterns\n\nA **geometric pattern** uses shapes to create a sequence.\n\n**Example:** A pattern is made with matchsticks:\n- Shape 1: A triangle needs $3$ matchsticks.\n- Shape 2: Two triangles sharing a side need $5$ matchsticks.\n- Shape 3: Three triangles sharing sides need $7$ matchsticks.\n\nThe pattern is $3, 5, 7, 9, \\ldots$ (add $2$ each time).\n\nThe rule: Number of matchsticks $= 2 \\times \\text{shape number} + 1$.\n\nFor Shape 10: $2 \\times 10 + 1 = 21$ matchsticks.'),
  q(8, 'A pattern uses tiles: Shape 1 has $4$ tiles, Shape 2 has $7$ tiles, Shape 3 has $10$ tiles. How many tiles does Shape 5 have?',
    ['$16$', '$13$', '$19$', '$15$'], 0,
    'The rule is: add $3$ each time. Shape 4: $13$. Shape 5: $16$. Or use the formula: $3 \\times 5 + 1 = 16$.'),
  t(9, '### Describing and Extending Sequences\n\nWhen you describe a pattern, say:\n1. **What the first term is.**\n2. **What the rule is** (what you do each time).\n\n**Example:** Describe the pattern $1, 4, 9, 16, 25, \\ldots$\n\nThese are **square numbers**: $1^2, 2^2, 3^2, 4^2, 5^2, \\ldots$\n\nThe next term: $6^2 = 36$.\n\n**Example:** The number of seats in a school hall is arranged in rows: Row 1 has $12$ seats, Row 2 has $14$ seats, Row 3 has $16$ seats.\n- Rule: Start at $12$, add $2$ each time.\n- Row 8: $12 + (8 - 1) \\times 2 = 12 + 14 = 26$ seats.'),
  q(10, 'What is the 6th term in the sequence $1, 4, 9, 16, 25, \\ldots$?',
    ['$36$', '$30$', '$34$', '$49$'], 0,
    'These are square numbers: $n^2$. The 6th term is $6^2 = 36$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Common Fractions (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Common Fractions\n\nA **common fraction** is written as $\\frac{a}{b}$ where $a$ is the **numerator** (top) and $b$ is the **denominator** (bottom).\n\n### Equivalent Fractions\n\nEquivalent fractions have the **same value**. Multiply or divide the numerator and denominator by the same number.\n\n$$\\frac{1}{3} = \\frac{2}{6} = \\frac{3}{9} = \\frac{4}{12}$$\n\n### Simplifying Fractions\n\nDivide both numerator and denominator by their **HCF** (Highest Common Factor).\n\n**Example:** Simplify $\\frac{12}{18}$.\n- HCF of $12$ and $18$ is $6$.\n$$\\frac{12 \\div 6}{18 \\div 6} = \\frac{2}{3}$$\n\n### Comparing and Ordering Fractions\n\nTo compare fractions, find a **common denominator**.\n\n**Example:** Which is larger: $\\frac{3}{4}$ or $\\frac{5}{6}$?\n$$\\frac{3}{4} = \\frac{9}{12} \\quad \\text{and} \\quad \\frac{5}{6} = \\frac{10}{12}$$\nSince $\\frac{10}{12} > \\frac{9}{12}$, we have $\\frac{5}{6} > \\frac{3}{4}$.'),
  t(2, '### Addition and Subtraction with Different Denominators\n\nTo add or subtract fractions with different denominators, find the **LCD** (Lowest Common Denominator).\n\n**Example 1:** $\\frac{2}{3} + \\frac{1}{4}$\n- LCD of $3$ and $4$ is $12$.\n$$\\frac{2}{3} = \\frac{8}{12} \\quad \\text{and} \\quad \\frac{1}{4} = \\frac{3}{12}$$\n$$\\frac{8}{12} + \\frac{3}{12} = \\frac{11}{12}$$\n\n**Example 2:** $\\frac{5}{6} - \\frac{1}{4}$\n- LCD of $6$ and $4$ is $12$.\n$$\\frac{5}{6} = \\frac{10}{12} \\quad \\text{and} \\quad \\frac{1}{4} = \\frac{3}{12}$$\n$$\\frac{10}{12} - \\frac{3}{12} = \\frac{7}{12}$$\n\n**Example 3 (Mixed numbers):** $2\\frac{1}{3} + 1\\frac{1}{2}$\n$$= \\frac{7}{3} + \\frac{3}{2} = \\frac{14}{6} + \\frac{9}{6} = \\frac{23}{6} = 3\\frac{5}{6}$$\n\n**Always simplify** your answer.'),
  q(3, 'Calculate: $\\frac{3}{5} + \\frac{1}{4}$.',
    ['$\\frac{17}{20}$', '$\\frac{4}{9}$', '$\\frac{4}{20}$', '$\\frac{7}{20}$'], 0,
    'LCD $= 20$. $\\frac{3}{5} = \\frac{12}{20}$ and $\\frac{1}{4} = \\frac{5}{20}$. Sum $= \\frac{12 + 5}{20} = \\frac{17}{20}$.'),
  t(4, '### Fractions of Whole Numbers\n\nTo find a fraction of a whole number, **multiply**.\n\n**Example 1:** What is $\\frac{3}{4}$ of $R60$?\n$$\\frac{3}{4} \\times 60 = \\frac{3 \\times 60}{4} = \\frac{180}{4} = R45$$\n\n**Example 2:** A farmer in Limpopo has $120$ cattle. He sells $\\frac{2}{5}$ of them. How many does he sell?\n$$\\frac{2}{5} \\times 120 = \\frac{240}{5} = 48 \\text{ cattle}$$\n\n### Percentages and Fractions\n\nA **percentage** means "out of $100$".\n\n| Fraction | Percentage |\n|----------|------------|\n| $\\frac{1}{4}$ | $25\\%$ |\n| $\\frac{1}{2}$ | $50\\%$ |\n| $\\frac{3}{4}$ | $75\\%$ |\n| $\\frac{1}{5}$ | $20\\%$ |\n| $\\frac{1}{10}$ | $10\\%$ |\n\n**To convert a fraction to a percentage:** Multiply by $100$.\n$$\\frac{3}{5} \\times 100 = 60\\%$$'),
  q(5, 'What is $\\frac{2}{3}$ of $R210$?',
    ['$R140$', '$R70$', '$R105$', '$R150$'], 0,
    '$\\frac{2}{3} \\times 210 = \\frac{420}{3} = R140$.'),
  fb(6, 'To compare fractions, find a common ___. The fraction $\\frac{3}{4}$ expressed as a percentage is ___.',
    ['denominator', '75%'],
    'A common denominator lets you compare numerators. $\\frac{3}{4} \\times 100 = 75\\%$.'),
  t(7, '### More Fraction Problems\n\n**Example 1:** Sipho has a ribbon that is $\\frac{7}{8}$ m long. He cuts off $\\frac{3}{8}$ m. How much is left?\n$$\\frac{7}{8} - \\frac{3}{8} = \\frac{4}{8} = \\frac{1}{2} \\text{ m}$$\n\n**Example 2:** A school in Polokwane orders $200$ textbooks. $\\frac{3}{10}$ are Mathematics books and $\\frac{1}{5}$ are English books. How many are for other subjects?\n- Maths: $\\frac{3}{10} \\times 200 = 60$\n- English: $\\frac{1}{5} \\times 200 = 40$\n- Other: $200 - 60 - 40 = 100$ textbooks\n\n**Example 3:** Express $45$ out of $60$ as a fraction in simplest form.\n$$\\frac{45}{60} = \\frac{45 \\div 15}{60 \\div 15} = \\frac{3}{4}$$'),
  q(8, 'Simplify $\\frac{24}{36}$ to its lowest terms.',
    ['$\\frac{2}{3}$', '$\\frac{3}{4}$', '$\\frac{4}{6}$', '$\\frac{12}{18}$'], 0,
    'HCF of $24$ and $36$ is $12$. $\\frac{24 \\div 12}{36 \\div 12} = \\frac{2}{3}$.'),
  t(9, '### Mixed Numbers and Improper Fractions\n\nA **mixed number** has a whole-number part and a fraction part: $2\\frac{3}{5}$.\n\nAn **improper fraction** has a numerator bigger than its denominator: $\\frac{13}{5}$.\n\n**Convert mixed to improper:** $2\\frac{3}{5} = \\frac{2 \\times 5 + 3}{5} = \\frac{13}{5}$\n\n**Convert improper to mixed:** $\\frac{17}{4} = 4\\frac{1}{4}$ (because $17 \\div 4 = 4$ remainder $1$)\n\n**Adding mixed numbers:** $1\\frac{2}{3} + 2\\frac{1}{4}$\n$$= \\frac{5}{3} + \\frac{9}{4} = \\frac{20}{12} + \\frac{27}{12} = \\frac{47}{12} = 3\\frac{11}{12}$$'),
  q(10, 'Convert $3\\frac{2}{5}$ to an improper fraction.',
    ['$\\frac{17}{5}$', '$\\frac{15}{5}$', '$\\frac{32}{5}$', '$\\frac{11}{5}$'], 0,
    '$3\\frac{2}{5} = \\frac{3 \\times 5 + 2}{5} = \\frac{17}{5}$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Decimal Fractions (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Decimal Fractions\n\nA **decimal fraction** uses a decimal comma to show parts of a whole.\n\nIn South Africa we use a **comma** as the decimal separator (not a point).\n\n### Place Value to Thousandths\n\n| Position | Value |\n|----------|-------|\n| Ones | $1$ |\n| Tenths | $0{,}1$ |\n| Hundredths | $0{,}01$ |\n| Thousandths | $0{,}001$ |\n\n**Example:** In the number $3{,}462$:\n- $3$ is in the ones place\n- $4$ is in the tenths place (value $0{,}4$)\n- $6$ is in the hundredths place (value $0{,}06$)\n- $2$ is in the thousandths place (value $0{,}002$)\n\n### Ordering Decimal Fractions\n\nCompare digit by digit from left to right.\n\n**Example:** Arrange in ascending order: $0{,}45$; $0{,}405$; $0{,}5$\n$$0{,}405 < 0{,}45 < 0{,}5$$'),
  t(2, '### Rounding Decimal Fractions\n\nTo round a decimal, look at the digit to the **right** of the rounding position.\n\n**Examples:**\n- $4{,}736$ to 1 decimal place: $4{,}7$ (the 3 rounds down)\n- $2{,}845$ to 2 decimal places: $2{,}85$ (the 5 rounds up)\n- $0{,}0482$ to 2 decimal places: $0{,}05$ (the 8 rounds up)\n\n### Addition and Subtraction\n\nLine up the decimal commas.\n\n**Example:** $3{,}45 + 2{,}8$\n$$\\begin{aligned} &3{,}45 \\\\ +&2{,}80 \\\\ \\hline &6{,}25 \\end{aligned}$$\n\n**Example:** $7{,}2 - 3{,}85$\n$$\\begin{aligned} &7{,}20 \\\\ -&3{,}85 \\\\ \\hline &3{,}35 \\end{aligned}$$\n\nFill in trailing zeros to make the number of decimal places equal.'),
  q(3, 'Round $6{,}475$ to 1 decimal place.',
    ['$6{,}5$', '$6{,}4$', '$6{,}48$', '$7{,}0$'], 0,
    'Look at the hundredths digit: $7 \\geq 5$, so round up. $6{,}475 \\approx 6{,}5$.'),
  t(4, '### Multiplying and Dividing by 10, 100, and 1 000\n\n**Multiplying by powers of 10** moves the decimal comma to the **right**:\n- $2{,}35 \\times 10 = 23{,}5$\n- $2{,}35 \\times 100 = 235$\n- $2{,}35 \\times 1\\,000 = 2\\,350$\n\n**Dividing by powers of 10** moves the decimal comma to the **left**:\n- $45{,}6 \\div 10 = 4{,}56$\n- $45{,}6 \\div 100 = 0{,}456$\n- $45{,}6 \\div 1\\,000 = 0{,}0456$\n\n**Example:** A school in Bloemfontein orders $100$ pens at R$3{,}75$ each.\nTotal cost: $100 \\times R3{,}75 = R375{,}00$'),
  q(5, 'Calculate: $4{,}25 \\times 100$.',
    ['$425$', '$42{,}5$', '$4\\,250$', '$0{,}0425$'], 0,
    'Move the decimal comma 2 places to the right: $4{,}25 \\times 100 = 425$.'),
  fb(6, 'When dividing by $1\\,000$, the decimal comma moves ___ places to the left. The number $0{,}5$ as a common fraction is ___.',
    ['3', '1/2'],
    'Dividing by $1\\,000 = 10^3$ moves 3 places left. $0{,}5 = \\frac{5}{10} = \\frac{1}{2}$.'),
  t(7, '### Converting Between Fractions, Decimals, and Percentages\n\nYou must be able to convert between all three forms.\n\n| Common Fraction | Decimal | Percentage |\n|----------------|---------|------------|\n| $\\frac{1}{4}$ | $0{,}25$ | $25\\%$ |\n| $\\frac{1}{2}$ | $0{,}5$ | $50\\%$ |\n| $\\frac{3}{4}$ | $0{,}75$ | $75\\%$ |\n| $\\frac{1}{5}$ | $0{,}2$ | $20\\%$ |\n| $\\frac{1}{8}$ | $0{,}125$ | $12{,}5\\%$ |\n\n**Conversions:**\n- Fraction to decimal: divide numerator by denominator\n- Decimal to percentage: multiply by $100$\n- Percentage to fraction: write over $100$ and simplify\n\n**Example:** Convert $\\frac{3}{8}$ to a decimal and a percentage.\n$$\\frac{3}{8} = 3 \\div 8 = 0{,}375 = 37{,}5\\%$$'),
  q(8, 'Write $0{,}35$ as a common fraction in simplest form.',
    ['$\\frac{7}{20}$', '$\\frac{35}{10}$', '$\\frac{7}{10}$', '$\\frac{1}{3}$'], 0,
    '$0{,}35 = \\frac{35}{100} = \\frac{35 \\div 5}{100 \\div 5} = \\frac{7}{20}$.'),
  t(9, '### Problem Solving with Decimals\n\n**Example 1:** A loaf of bread costs R$17{,}50$ and butter costs R$34{,}95$. What is the total?\n$$R17{,}50 + R34{,}95 = R52{,}45$$\n\n**Example 2:** Amahle has R$50{,}00$. She buys a drink for R$12{,}75$. How much change does she get?\n$$R50{,}00 - R12{,}75 = R37{,}25$$\n\n**Example 3:** A piece of rope is $3{,}5$ m long. It is cut into $10$ equal pieces. How long is each piece?\n$$3{,}5 \\div 10 = 0{,}35 \\text{ m}$$\n\n**Example 4:** Convert $65\\%$ to a decimal and a fraction.\n$$65\\% = 0{,}65 = \\frac{65}{100} = \\frac{13}{20}$$'),
  q(10, 'A bag of oranges costs R$24{,}50$. How much do $10$ bags cost?',
    ['$R245{,}00$', '$R24{,}500$', '$R2{,}45$', '$R245{,}50$'], 0,
    '$R24{,}50 \\times 10 = R245{,}00$. Move the decimal comma 1 place right.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Multiplication and Division (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Multiplication and Division\n\nIn Grade 6 we multiply up to **4-digit by 3-digit** numbers and divide up to **4-digit by 3-digit** numbers.\n\n### Long Multiplication\n\n**Example:** $2\\,453 \\times 312$\n\nBreak it up:\n$$2\\,453 \\times 312 = 2\\,453 \\times 300 + 2\\,453 \\times 10 + 2\\,453 \\times 2$$\n$$= 735\\,900 + 24\\,530 + 4\\,906$$\n$$= 765\\,336$$\n\n**Column method:**\n$$\\begin{aligned} &\\quad 2\\,453 \\\\ \\times &\\quad\\; 312 \\\\ \\hline &\\quad 4\\,906 \\quad (2\\,453 \\times 2) \\\\ &\\; 24\\,530 \\quad (2\\,453 \\times 10) \\\\ &735\\,900 \\quad (2\\,453 \\times 300) \\\\ \\hline &765\\,336 \\end{aligned}$$\n\n**Always estimate first** to check: $2\\,500 \\times 300 = 750\\,000$. Our answer of $765\\,336$ is close — reasonable.'),
  t(2, '### Long Division\n\n**Example:** $4\\,368 \\div 312$\n\nEstimate first: $4\\,500 \\div 300 = 15$.\n\n- $312 \\times 10 = 3\\,120$\n- $4\\,368 - 3\\,120 = 1\\,248$\n- $312 \\times 4 = 1\\,248$\n- $1\\,248 - 1\\,248 = 0$\n\nAnswer: $10 + 4 = 14$\n\n**Check:** $312 \\times 14 = 4\\,368$ ✓\n\n**Division with a remainder:**\n\n$5\\,000 \\div 312$:\n- $312 \\times 16 = 4\\,992$\n- $5\\,000 - 4\\,992 = 8$\n- Answer: $16$ remainder $8$\n\n**Key fact:** Dividend $=$ Divisor $\\times$ Quotient $+$ Remainder\n$$5\\,000 = 312 \\times 16 + 8$$ ✓'),
  q(3, 'Estimate $3\\,897 \\times 48$ by rounding.',
    ['$200\\,000$', '$160\\,000$', '$180\\,000$', '$150\\,000$'], 0,
    'Round: $4\\,000 \\times 50 = 200\\,000$. Exact: $3\\,897 \\times 48 = 187\\,056$.'),
  t(4, '### Problem Solving with All Four Operations\n\n**Example 1:** A school in East London orders $245$ chairs at R$189$ each. What is the total cost?\n$$245 \\times 189 = R46\\,305$$\n\n**Example 2:** There are $1\\,560$ learners at a school. They are divided equally into $12$ classes. How many learners in each class?\n$$1\\,560 \\div 12 = 130 \\text{ learners}$$\n\n**Example 3:** A baker makes $1\\,440$ bread rolls. He packs them into bags of $36$. How many bags does he need?\n$$1\\,440 \\div 36 = 40 \\text{ bags}$$\n\n**Example 4 (Multi-step):** A school trip costs R$125$ per learner. There are $3$ buses, each carrying $48$ learners. What is the total cost?\n- Total learners: $3 \\times 48 = 144$\n- Total cost: $144 \\times R125 = R18\\,000$'),
  q(5, 'Calculate: $2\\,576 \\div 8$.',
    ['$322$', '$312$', '$332$', '$342$'], 0,
    '$2\\,576 \\div 8 = 322$. Check: $322 \\times 8 = 2\\,576$ ✓.'),
  fb(6, 'In division: Dividend = Divisor × Quotient + ___. To check a multiplication answer, use ___ as the inverse.',
    ['Remainder', 'division'],
    'The remainder is what is left over. Division is the inverse of multiplication.'),
  t(7, '### Strategies for Multiplication\n\n**Doubling and halving:**\n$35 \\times 16 = 70 \\times 8 = 560$\n\n**Breaking apart (distributive property):**\n$47 \\times 6 = (40 + 7) \\times 6 = 240 + 42 = 282$\n\n**Compensating:**\n$99 \\times 7 = 100 \\times 7 - 1 \\times 7 = 700 - 7 = 693$\n\n### Strategies for Division\n\n**Using multiplication facts:**\n$288 \\div 12$: Think: $12 \\times ? = 288$. $12 \\times 24 = 288$. So $288 \\div 12 = 24$.\n\n**Halving:**\n$450 \\div 6 = 450 \\div 2 \\div 3 = 225 \\div 3 = 75$'),
  q(8, 'Use compensating to calculate $199 \\times 5$.',
    ['$995$', '$1\\,000$', '$990$', '$900$'], 0,
    '$199 \\times 5 = 200 \\times 5 - 1 \\times 5 = 1\\,000 - 5 = 995$.'),
  t(9, '### Word Problems\n\n**Example 1:** A factory in Gauteng produces $2\\,750$ toys per day. How many toys are produced in $5$ days?\n$$2\\,750 \\times 5 = 13\\,750 \\text{ toys}$$\n\n**Example 2:** A farmer harvests $8\\,640$ oranges. He packs them into crates of $144$. How many full crates can he fill?\n$$8\\,640 \\div 144 = 60 \\text{ crates}$$\n\n**Example 3:** The school tuck shop buys $500$ juice boxes at R$4{,}50$ each and sells them at R$7{,}00$ each. What is the total profit?\n- Cost: $500 \\times R4{,}50 = R2\\,250$\n- Revenue: $500 \\times R7{,}00 = R3\\,500$\n- Profit: $R3\\,500 - R2\\,250 = R1\\,250$'),
  q(10, 'A school orders $364$ textbooks. They are packed in boxes of $12$. How many boxes are needed?',
    ['$31$', '$30$', '$30$ remainder $4$', '$32$'], 0,
    '$364 \\div 12 = 30$ remainder $4$. But we need all books packed, so we need $31$ boxes (the last box has only $4$ books).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Capacity and Volume (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Capacity and Volume\n\n**Volume** is the amount of space an object takes up. **Capacity** is the amount a container can hold.\n\n### Units of Capacity\n\n| Unit | Abbreviation | Relationship |\n|------|-------------|-------------|\n| Millilitre | ml | Smallest |\n| Litre | $\\ell$ | $1\\,\\ell = 1\\,000$ ml |\n| Kilolitre | k$\\ell$ | $1$ k$\\ell = 1\\,000\\,\\ell$ |\n\n### Conversions\n\n**Litres to millilitres:** Multiply by $1\\,000$.\n$$2{,}5\\,\\ell = 2{,}5 \\times 1\\,000 = 2\\,500 \\text{ ml}$$\n\n**Millilitres to litres:** Divide by $1\\,000$.\n$$750 \\text{ ml} = 750 \\div 1\\,000 = 0{,}75\\,\\ell$$\n\n**Kilolitres to litres:** Multiply by $1\\,000$.\n$$3{,}2 \\text{ k}\\ell = 3{,}2 \\times 1\\,000 = 3\\,200\\,\\ell$$'),
  t(2, '### Reading Measuring Instruments\n\nWhen reading a measuring jug or cylinder:\n1. Place the container on a flat surface.\n2. Read the level at **eye level**.\n3. Read the bottom of the **meniscus** (the curved surface of the liquid).\n\n### Practical Problems\n\n**Example 1:** A bottle holds $2\\,\\ell$ of water. Thandi pours out $350$ ml. How much water is left?\n$$2\\,000 \\text{ ml} - 350 \\text{ ml} = 1\\,650 \\text{ ml} = 1{,}65\\,\\ell$$\n\n**Example 2:** A swimming pool holds $50$ k$\\ell$ of water. How many litres is that?\n$$50 \\times 1\\,000 = 50\\,000\\,\\ell$$\n\n**Example 3:** A medicine bottle contains $200$ ml. A dose is $5$ ml. How many doses are in the bottle?\n$$200 \\div 5 = 40 \\text{ doses}$$'),
  q(3, 'Convert $3\\,750$ ml to litres.',
    ['$3{,}75\\,\\ell$', '$37{,}5\\,\\ell$', '$375\\,\\ell$', '$0{,}375\\,\\ell$'], 0,
    'Divide by $1\\,000$: $3\\,750 \\div 1\\,000 = 3{,}75\\,\\ell$.'),
  t(4, '### Volume\n\nThe volume of a rectangular container (box) is:\n$$V = \\text{length} \\times \\text{breadth} \\times \\text{height}$$\n\n**Important connection:** $1$ cm$^3$ of water = $1$ ml. So $1\\,000$ cm$^3$ = $1\\,\\ell$.\n\n**Example:** A fish tank is $60$ cm long, $30$ cm wide, and $40$ cm high. What is its capacity in litres?\n$$V = 60 \\times 30 \\times 40 = 72\\,000 \\text{ cm}^3$$\n$$72\\,000 \\text{ cm}^3 = 72\\,000 \\text{ ml} = 72\\,\\ell$$'),
  q(5, 'A container is $20$ cm long, $10$ cm wide, and $15$ cm high. What is its volume?',
    ['$3\\,000$ cm$^3$', '$300$ cm$^3$', '$3\\,000\\,\\ell$', '$45$ cm$^3$'], 0,
    '$V = 20 \\times 10 \\times 15 = 3\\,000$ cm$^3$.'),
  fb(6, 'There are ___ ml in $1$ litre. $1$ cm$^3$ of water has a capacity of ___ ml.',
    ['1 000', '1'],
    '$1\\,\\ell = 1\\,000$ ml and $1$ cm$^3 = 1$ ml.'),
  t(7, '### More Practical Problems\n\n**Example 1:** A water tank on a farm near Stellenbosch holds $5$ k$\\ell$. After a dry week, only $2\\,350\\,\\ell$ remain. How many litres have been used?\n$$5\\,000 - 2\\,350 = 2\\,650\\,\\ell$$\n\n**Example 2:** A recipe needs $250$ ml of milk. How many full recipes can be made with $2\\,\\ell$ of milk?\n$$2\\,000 \\div 250 = 8 \\text{ recipes}$$\n\n**Example 3:** A school buys $24$ bottles of $500$ ml juice for a sports day. How many litres of juice is that in total?\n$$24 \\times 500 = 12\\,000 \\text{ ml} = 12\\,\\ell$$'),
  q(8, 'A bucket holds $8\\,\\ell$. How many $250$ ml cups can be filled from it?',
    ['$32$', '$20$', '$16$', '$40$'], 0,
    '$8\\,\\ell = 8\\,000$ ml. $8\\,000 \\div 250 = 32$ cups.'),
  t(9, '### Comparing and Estimating Capacity\n\nKnowing approximate capacities helps with estimation:\n- A teaspoon: about $5$ ml\n- A glass of water: about $250$ ml\n- A water bottle: about $500$ ml or $1\\,\\ell$\n- A bathtub: about $150\\,\\ell$\n- A swimming pool: $20\\,000\\,\\ell$ to $80\\,000\\,\\ell$\n\n**Example:** Would you measure the capacity of a dam in ml, $\\ell$, or k$\\ell$?\nAnswer: k$\\ell$ (kilolitres), because dams hold very large amounts of water.'),
  q(10, 'A water tank holds $2{,}5$ k$\\ell$. How many $500$ ml bottles can be filled from it?',
    ['$5\\,000$', '$500$', '$50\\,000$', '$50$'], 0,
    '$2{,}5$ k$\\ell = 2\\,500\\,\\ell = 2\\,500\\,000$ ml. $2\\,500\\,000 \\div 500 = 5\\,000$ bottles.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Time (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Time\n\n### 12-Hour and 24-Hour Time\n\n**12-hour time** uses a.m. (midnight to noon) and p.m. (noon to midnight).\n**24-hour time** uses four digits from $00{:}00$ to $23{:}59$.\n\n| 12-hour | 24-hour |\n|---------|--------|\n| 12:00 a.m. (midnight) | 00:00 |\n| 6:30 a.m. | 06:30 |\n| 12:00 p.m. (noon) | 12:00 |\n| 3:45 p.m. | 15:45 |\n| 9:15 p.m. | 21:15 |\n| 11:59 p.m. | 23:59 |\n\n**To convert from 12-hour to 24-hour:**\n- a.m. times stay the same (add a leading zero if needed)\n- p.m. times: add $12$ to the hours\n\n**To convert from 24-hour to 12-hour:**\n- Hours $< 12$: use a.m.\n- Hours $\\geq 12$: subtract $12$ and use p.m.'),
  t(2, '### Elapsed Time\n\nElapsed time is the amount of time that passes between two events.\n\n**Example 1:** A movie starts at 14:30 and ends at 16:45. How long is the movie?\n- From 14:30 to 16:30 is $2$ hours.\n- From 16:30 to 16:45 is $15$ minutes.\n- Total: $2$ hours $15$ minutes.\n\n**Example 2:** A train leaves Johannesburg at 08:45 and arrives in Pretoria at 09:20. How long is the journey?\n- From 08:45 to 09:00 is $15$ minutes.\n- From 09:00 to 09:20 is $20$ minutes.\n- Total: $35$ minutes.\n\n**Example 3:** A school day starts at 07:30 and ends at 14:00. How long is the school day?\n- From 07:30 to 14:00: $14{:}00 - 07{:}30 = 6$ hours $30$ minutes.'),
  q(3, 'Convert 4:35 p.m. to 24-hour time.',
    ['16:35', '04:35', '15:35', '17:35'], 0,
    'Add 12 to the hours: $4 + 12 = 16$. So 4:35 p.m. = 16:35.'),
  t(4, '### Timetables\n\nA **timetable** shows planned times for activities or travel.\n\n**Example — Bus timetable from Cape Town to Stellenbosch:**\n\n| Stop | Bus A | Bus B | Bus C |\n|------|-------|-------|-------|\n| Cape Town | 07:00 | 09:00 | 11:00 |\n| Bellville | 07:30 | 09:30 | 11:30 |\n| Paarl | 08:15 | 10:15 | 12:15 |\n| Stellenbosch | 08:45 | 10:45 | 12:45 |\n\n- The journey from Cape Town to Stellenbosch takes $1$ hour $45$ minutes.\n- If you miss Bus A, the next bus (Bus B) leaves at 09:00.\n- Wait time if you arrive at 07:45: $09{:}00 - 07{:}45 = 1$ hour $15$ minutes.'),
  q(5, 'A flight departs at 06:50 and arrives at 09:15. How long is the flight?',
    ['$2$ hours $25$ minutes', '$2$ hours $35$ minutes', '$3$ hours $25$ minutes', '$2$ hours $15$ minutes'], 0,
    'From 06:50 to 09:00 is $2$ hours $10$ minutes. From 09:00 to 09:15 is $15$ minutes. Total: $2$ hours $25$ minutes.'),
  fb(6, 'To convert a p.m. time to 24-hour time, add ___ to the hours. There are ___ minutes in 1 hour.',
    ['12', '60'],
    'Add 12 for p.m. times. $1$ hour $= 60$ minutes.'),
  t(7, '### Calendars\n\n**Days in each month:**\n- 30 days: April, June, September, November\n- 31 days: January, March, May, July, August, October, December\n- February: 28 days (29 in a leap year)\n\n**Leap years** occur every 4 years (2024, 2028, 2032, ...).\n\n**Example:** How many days from 15 March to 10 April?\n- March: $31 - 15 = 16$ days remaining\n- April: $10$ days\n- Total: $16 + 10 = 26$ days\n\n**Time conversions:**\n- $1$ week $= 7$ days\n- $1$ day $= 24$ hours\n- $1$ hour $= 60$ minutes\n- $1$ minute $= 60$ seconds'),
  q(8, 'How many days are there from 20 June to 5 July?',
    ['$15$', '$14$', '$16$', '$25$'], 0,
    'June has 30 days. Remaining in June: $30 - 20 = 10$ days. July: $5$ days. Total: $10 + 5 = 15$ days.'),
  t(9, '### Time Zones in South Africa\n\nSouth Africa uses **South African Standard Time (SAST)**, which is UTC+2.\n\nThis means SA time is $2$ hours ahead of Greenwich Mean Time (GMT/UTC).\n\n**Example:** If it is 14:00 in London (GMT), what time is it in South Africa?\n$$14{:}00 + 2 = 16{:}00 \\text{ (SAST)}$$\n\n**Example:** A cricket match in India (UTC+5:30) starts at 09:30 Indian time. What time is that in SA?\n- Difference: $5{:}30 - 2{:}00 = 3{:}30$ hours ahead\n- India is $3$ hours $30$ minutes ahead of SA.\n- SA time: $09{:}30 - 3{:}30 = 06{:}00$'),
  q(10, 'It is 20:00 in Johannesburg (SAST, UTC+2). What time is it in London (GMT)?',
    ['18:00', '22:00', '16:00', '20:00'], 0,
    'SA is 2 hours ahead of GMT. $20{:}00 - 2 = 18{:}00$ in London.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Length and Mass (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Length and Mass\n\n### Units of Length\n\n| Unit | Abbreviation | Relationship |\n|------|-------------|-------------|\n| Millimetre | mm | Smallest |\n| Centimetre | cm | $1$ cm $= 10$ mm |\n| Metre | m | $1$ m $= 100$ cm $= 1\\,000$ mm |\n| Kilometre | km | $1$ km $= 1\\,000$ m |\n\n### Conversions\n\n**Larger to smaller:** Multiply.\n- $3{,}5$ km $= 3{,}5 \\times 1\\,000 = 3\\,500$ m\n- $2{,}4$ m $= 2{,}4 \\times 100 = 240$ cm\n- $5{,}2$ cm $= 5{,}2 \\times 10 = 52$ mm\n\n**Smaller to larger:** Divide.\n- $4\\,500$ m $= 4\\,500 \\div 1\\,000 = 4{,}5$ km\n- $350$ cm $= 350 \\div 100 = 3{,}5$ m\n- $85$ mm $= 85 \\div 10 = 8{,}5$ cm'),
  t(2, '### Units of Mass\n\n| Unit | Abbreviation | Relationship |\n|------|-------------|-------------|\n| Milligram | mg | Smallest |\n| Gram | g | $1$ g $= 1\\,000$ mg |\n| Kilogram | kg | $1$ kg $= 1\\,000$ g |\n| Tonne | t | $1$ t $= 1\\,000$ kg |\n\n### Conversions\n\n**Larger to smaller:** Multiply.\n- $2{,}5$ kg $= 2{,}5 \\times 1\\,000 = 2\\,500$ g\n- $0{,}75$ g $= 0{,}75 \\times 1\\,000 = 750$ mg\n\n**Smaller to larger:** Divide.\n- $3\\,200$ g $= 3\\,200 \\div 1\\,000 = 3{,}2$ kg\n- $500$ mg $= 500 \\div 1\\,000 = 0{,}5$ g\n\n**Example:** A bag of sugar weighs $2{,}5$ kg. A recipe needs $400$ g. How many full recipes can be made?\n$$2{,}5 \\text{ kg} = 2\\,500 \\text{ g}$$\n$$2\\,500 \\div 400 = 6{,}25$$\nSo $6$ full recipes.'),
  q(3, 'Convert $4\\,250$ g to kg.',
    ['$4{,}25$ kg', '$42{,}5$ kg', '$425$ kg', '$0{,}425$ kg'], 0,
    'Divide by $1\\,000$: $4\\,250 \\div 1\\,000 = 4{,}25$ kg.'),
  t(4, '### Measurement and Practical Problems\n\n**Example 1:** The distance from Durban to Pietermaritzburg is $80$ km. Convert to metres.\n$$80 \\times 1\\,000 = 80\\,000 \\text{ m}$$\n\n**Example 2:** A Grade 6 learner is $1{,}45$ m tall. Express this in centimetres.\n$$1{,}45 \\times 100 = 145 \\text{ cm}$$\n\n**Example 3:** Three parcels weigh $1{,}2$ kg, $850$ g, and $0{,}45$ kg. What is the total mass in kg?\n- Convert all to kg: $1{,}2$ kg, $0{,}85$ kg, $0{,}45$ kg\n- Total: $1{,}2 + 0{,}85 + 0{,}45 = 2{,}5$ kg\n\n**Example 4 (Perimeter):** A rectangular garden is $12$ m long and $8$ m wide. What is the perimeter?\n$$P = 2 \\times (12 + 8) = 2 \\times 20 = 40 \\text{ m}$$'),
  q(5, 'A fence post is $1\\,800$ mm long. How many metres is that?',
    ['$1{,}8$ m', '$18$ m', '$180$ m', '$0{,}18$ m'], 0,
    '$1\\,800$ mm $= 1\\,800 \\div 1\\,000 = 1{,}8$ m.'),
  fb(6, 'There are ___ cm in $1$ m. There are ___ g in $1$ kg.',
    ['100', '1 000'],
    '$1$ m $= 100$ cm and $1$ kg $= 1\\,000$ g.'),
  t(7, '### Choosing the Right Unit\n\nUse the most appropriate unit for the measurement:\n\n| Object | Best unit |\n|--------|----------|\n| Thickness of a coin | mm |\n| Length of a pencil | cm |\n| Height of a door | m |\n| Distance between cities | km |\n| Mass of a tablet (medicine) | mg |\n| Mass of an apple | g |\n| Mass of a person | kg |\n| Mass of a truck | t |\n\n**Example:** What unit would you use to measure the distance from Cape Town to Johannesburg?\nAnswer: **km** — because the distance is about $1\\,400$ km.'),
  q(8, 'Which unit is most suitable for measuring the mass of a bag of flour?',
    ['kg', 'mg', 'g', 't'], 0,
    'A bag of flour typically weighs $1$ kg, $2{,}5$ kg, or $5$ kg. Kilograms is the best unit.'),
  t(9, '### Problem Solving\n\n**Example 1:** A roll of wire is $50$ m long. Pieces of $1{,}25$ m are cut off. How many pieces can be cut?\n$$50 \\div 1{,}25 = 40 \\text{ pieces}$$\n\n**Example 2:** A truck in Mpumalanga carries a load of $3{,}5$ t. Express this in kilograms.\n$$3{,}5 \\times 1\\,000 = 3\\,500 \\text{ kg}$$\n\n**Example 3:** Sipho walks $1{,}2$ km to school each morning and $1{,}2$ km back. How many km does he walk in a $5$-day week?\n$$1{,}2 \\times 2 \\times 5 = 12 \\text{ km}$$'),
  q(10, 'A plank is $3{,}6$ m long. It is cut into pieces of $45$ cm each. How many pieces can be cut?',
    ['$8$', '$6$', '$10$', '$12$'], 0,
    '$3{,}6$ m $= 360$ cm. $360 \\div 45 = 8$ pieces.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Properties of 2D Shapes (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Properties of 2D Shapes\n\n### Classifying Triangles\n\nTriangles can be classified **by sides** and **by angles**.\n\n**By sides:**\n\n| Type | Property |\n|------|----------|\n| Equilateral | All $3$ sides equal, all angles $= 60°$ |\n| Isosceles | $2$ sides equal, $2$ base angles equal |\n| Scalene | No sides equal, no angles equal |\n\n**By angles:**\n\n| Type | Property |\n|------|----------|\n| Acute | All angles less than $90°$ |\n| Right-angled | One angle $= 90°$ |\n| Obtuse | One angle greater than $90°$ |\n\n### Angle Sum Property\n\nThe **three angles of any triangle add up to $180°$**.\n\n**Example:** Two angles of a triangle are $65°$ and $45°$. Find the third angle.\n$$180° - 65° - 45° = 70°$$'),
  t(2, '### Classifying Quadrilaterals\n\nA **quadrilateral** is a shape with $4$ sides.\n\n| Shape | Properties |\n|-------|------------|\n| Square | $4$ equal sides, $4$ right angles ($90°$) |\n| Rectangle | Opposite sides equal, $4$ right angles |\n| Parallelogram | Opposite sides equal and parallel, opposite angles equal |\n| Rhombus | $4$ equal sides, opposite angles equal |\n| Trapezium | Exactly $1$ pair of parallel sides |\n| Kite | $2$ pairs of adjacent sides equal |\n\n### Properties of Angles\n\n- The angles in a **quadrilateral** add up to $360°$.\n- A **right angle** is exactly $90°$.\n- A **straight angle** is exactly $180°$.\n\n**Example:** Three angles of a quadrilateral are $90°$, $85°$, and $110°$. Find the fourth angle.\n$$360° - 90° - 85° - 110° = 75°$$'),
  q(3, 'A triangle has angles of $50°$ and $60°$. What is the third angle?',
    ['$70°$', '$80°$', '$90°$', '$50°$'], 0,
    'Angles in a triangle sum to $180°$. Third angle $= 180° - 50° - 60° = 70°$.'),
  t(4, '### Properties of Specific Shapes\n\n**Rectangle:**\n- Opposite sides are equal and parallel.\n- All four angles are $90°$.\n- Diagonals are equal in length and bisect each other.\n\n**Square:**\n- All four sides are equal.\n- All four angles are $90°$.\n- Diagonals are equal, bisect each other at right angles.\n\n**Parallelogram:**\n- Opposite sides are equal and parallel.\n- Opposite angles are equal.\n- Diagonals bisect each other (but are not equal).\n\n**Rhombus:**\n- All four sides are equal.\n- Opposite angles are equal.\n- Diagonals bisect each other at right angles.'),
  q(5, 'Which quadrilateral has all four sides equal but angles that are NOT all $90°$?',
    ['Rhombus', 'Square', 'Rectangle', 'Trapezium'], 0,
    'A rhombus has $4$ equal sides but its angles are not necessarily $90°$. A square has $4$ equal sides AND $4$ right angles.'),
  fb(6, 'The angles in a triangle add up to ___°. A quadrilateral with exactly one pair of parallel sides is called a ___.',
    ['180', 'trapezium'],
    'Triangle angle sum $= 180°$. A trapezium has exactly one pair of parallel sides.'),
  t(7, '### Identifying Shapes from Properties\n\n**Example 1:** A shape has $4$ sides. Opposite sides are equal and parallel. All angles are $90°$. What is it?\n- It could be a **rectangle** or a **square**.\n- If all sides are also equal, it is a **square**. Otherwise, a **rectangle**.\n\n**Example 2:** A shape has $3$ sides. Two sides are $5$ cm and one side is $8$ cm. What type of triangle is it?\n- Two equal sides: **Isosceles triangle**.\n\n**Example 3:** A triangle has a $90°$ angle and two equal shorter sides. What type is it?\n- By angle: **right-angled**. By sides: **isosceles**.\n- It is a **right-angled isosceles** triangle.'),
  q(8, 'An equilateral triangle has three angles. What is the size of each angle?',
    ['$60°$', '$90°$', '$45°$', '$120°$'], 0,
    'All three angles are equal and sum to $180°$. Each angle $= 180° \\div 3 = 60°$.'),
  t(9, '### Drawing and Describing 2D Shapes\n\nWhen describing a 2D shape, mention:\n1. Number of sides\n2. Lengths of sides (equal or unequal)\n3. Number of angles\n4. Sizes of angles\n5. Parallel sides\n6. Lines of symmetry\n\n**Example:** Describe a kite.\n- $4$ sides\n- $2$ pairs of adjacent equal sides\n- $1$ pair of opposite angles are equal\n- $1$ line of symmetry\n- The diagonals meet at right angles'),
  q(10, 'A quadrilateral has angles of $90°$, $90°$, $90°$, and $x$. What is $x$?',
    ['$90°$', '$180°$', '$100°$', '$80°$'], 0,
    '$90° + 90° + 90° + x = 360°$, so $x = 360° - 270° = 90°$. This quadrilateral is a rectangle (or square).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Properties of 3D Objects (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Properties of 3D Objects\n\n3D objects have three dimensions: **length**, **breadth** (width), and **height**.\n\n### Faces, Edges, and Vertices\n\n- **Face:** A flat surface of a 3D object.\n- **Edge:** The line where two faces meet.\n- **Vertex:** A corner where edges meet (plural: **vertices**).\n\n### Prisms\n\nA **prism** has two identical parallel faces (called **bases**) connected by rectangular faces.\n\n| Prism | Base shape | Faces | Edges | Vertices |\n|-------|-----------|-------|-------|----------|\n| Triangular prism | Triangle | $5$ | $9$ | $6$ |\n| Rectangular prism | Rectangle | $6$ | $12$ | $8$ |\n| Pentagonal prism | Pentagon | $7$ | $15$ | $10$ |\n| Hexagonal prism | Hexagon | $8$ | $18$ | $12$ |\n\nA **cube** is a special rectangular prism where all faces are squares.'),
  t(2, '### Pyramids\n\nA **pyramid** has one base and triangular faces that meet at an **apex** (top point).\n\n| Pyramid | Base shape | Faces | Edges | Vertices |\n|---------|-----------|-------|-------|----------|\n| Triangular pyramid | Triangle | $4$ | $6$ | $4$ |\n| Square pyramid | Square | $5$ | $8$ | $5$ |\n| Pentagonal pyramid | Pentagon | $6$ | $10$ | $6$ |\n| Hexagonal pyramid | Hexagon | $7$ | $12$ | $7$ |\n\n**Euler\'s formula** for any polyhedron:\n$$V - E + F = 2$$\nwhere $V$ = vertices, $E$ = edges, $F$ = faces.\n\n**Example (rectangular prism):** $V = 8$, $E = 12$, $F = 6$.\n$$8 - 12 + 6 = 2$$ ✓'),
  q(3, 'How many faces does a square pyramid have?',
    ['$5$', '$4$', '$6$', '$8$'], 0,
    'A square pyramid has $1$ square base $+ 4$ triangular faces $= 5$ faces.'),
  t(4, '### Nets of 3D Objects\n\nA **net** is a flat pattern that folds up into a 3D object.\n\n**Cube net:** A cube has $6$ square faces. A valid cube net has $6$ connected squares that fold into a cube. There are $11$ different nets for a cube.\n\n**Rectangular prism net:** Has $6$ rectangular faces ($3$ pairs of identical rectangles).\n\n**Triangular prism net:** Has $2$ triangular faces and $3$ rectangular faces.\n\n**Square pyramid net:** Has $1$ square base and $4$ triangles.\n\nWhen you fold a net:\n- Edges that will meet must be the same length.\n- The net must not overlap when folded.'),
  q(5, 'How many squares make up the net of a cube?',
    ['$6$', '$4$', '$8$', '$12$'], 0,
    'A cube has $6$ faces, all squares. So its net has $6$ squares.'),
  fb(6, 'A rectangular prism has ___ faces, ___ edges, and $8$ vertices.',
    ['6', '12'],
    'A rectangular prism (box shape) has $6$ faces, $12$ edges, and $8$ vertices.'),
  t(7, '### Recognising 3D Objects\n\nYou should be able to recognise these 3D objects from pictures and in real life:\n\n| Object | Real-life example |\n|--------|------------------|\n| Cube | Dice, sugar cube |\n| Rectangular prism | Brick, cereal box, book |\n| Triangular prism | Toblerone box, tent |\n| Square pyramid | The pyramids of Egypt |\n| Cylinder | Tin can, drum |\n| Cone | Ice cream cone, funnel |\n| Sphere | Cricket ball, globe |\n\n**Note:** Cylinders, cones, and spheres have **curved surfaces**. They are not polyhedra.'),
  q(8, 'A triangular prism has how many vertices?',
    ['$6$', '$5$', '$4$', '$8$'], 0,
    'A triangular prism has $6$ vertices — $3$ on each triangular face.'),
  t(9, '### Building 3D Models\n\nYou can build 3D models from:\n- **Nets** (cut and fold)\n- **Straws and clay** (straws as edges, clay as vertices)\n\n**Example:** To build a rectangular prism from straws:\n- You need $12$ straws ($4$ groups of $3$ different lengths)\n- You need $8$ pieces of clay (for the vertices)\n\n**Example:** How many straws and clay balls are needed to build a square pyramid?\n- Straws (edges): $8$\n- Clay balls (vertices): $5$'),
  q(10, 'Using Euler\'s formula ($V - E + F = 2$), if a 3D object has $6$ vertices and $10$ edges, how many faces does it have?',
    ['$6$', '$4$', '$8$', '$5$'], 0,
    '$V - E + F = 2$, so $6 - 10 + F = 2$, which gives $F = 6$ faces.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: Perimeter, Area, and Volume (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Perimeter, Area, and Volume\n\n### Perimeter of Polygons\n\nThe **perimeter** is the total distance around the outside of a shape.\n\n**Rectangle:**\n$$P = 2 \\times (\\ell + b)$$\nwhere $\\ell$ = length and $b$ = breadth.\n\n**Square:**\n$$P = 4 \\times s$$\nwhere $s$ = side length.\n\n**Any polygon:** Add all the sides.\n\n**Example 1:** A rectangle is $12$ cm long and $8$ cm wide.\n$$P = 2 \\times (12 + 8) = 2 \\times 20 = 40 \\text{ cm}$$\n\n**Example 2:** A regular hexagon has sides of $5$ cm.\n$$P = 6 \\times 5 = 30 \\text{ cm}$$\n\n**Example 3:** A triangle has sides of $7$ cm, $10$ cm, and $13$ cm.\n$$P = 7 + 10 + 13 = 30 \\text{ cm}$$'),
  t(2, '### Area of Rectangles and Squares\n\n**Area** is the amount of surface a shape covers. It is measured in **square units** (cm$^2$, m$^2$, etc.).\n\n**Rectangle:**\n$$A = \\ell \\times b$$\n\n**Square:**\n$$A = s \\times s = s^2$$\n\n**Example 1:** A soccer field in Soweto is $100$ m long and $65$ m wide.\n$$A = 100 \\times 65 = 6\\,500 \\text{ m}^2$$\n\n**Example 2:** A square tile has sides of $30$ cm.\n$$A = 30 \\times 30 = 900 \\text{ cm}^2$$\n\n**Example 3:** How many $30$ cm $\\times$ $30$ cm tiles are needed to cover a floor that is $3$ m by $4{,}5$ m?\n- Floor area: $300 \\times 450 = 135\\,000$ cm$^2$\n- Tile area: $30 \\times 30 = 900$ cm$^2$\n- Number of tiles: $135\\,000 \\div 900 = 150$ tiles'),
  q(3, 'A rectangle has a length of $15$ cm and a breadth of $9$ cm. What is its area?',
    ['$135$ cm$^2$', '$48$ cm$^2$', '$24$ cm$^2$', '$150$ cm$^2$'], 0,
    '$A = \\ell \\times b = 15 \\times 9 = 135$ cm$^2$.'),
  t(4, '### Volume of Rectangular Prisms\n\n**Volume** is the amount of space inside a 3D object.\n\n**Rectangular prism:**\n$$V = \\ell \\times b \\times h$$\nwhere $\\ell$ = length, $b$ = breadth, $h$ = height.\n\n**Cube:**\n$$V = s \\times s \\times s = s^3$$\n\nVolume is measured in **cubic units** (cm$^3$, m$^3$, etc.).\n\n**Example 1:** A box is $20$ cm long, $15$ cm wide, and $10$ cm high.\n$$V = 20 \\times 15 \\times 10 = 3\\,000 \\text{ cm}^3$$\n\n**Example 2:** A cube has sides of $4$ cm.\n$$V = 4^3 = 64 \\text{ cm}^3$$'),
  q(5, 'A rectangular prism is $8$ cm long, $5$ cm wide, and $6$ cm high. What is its volume?',
    ['$240$ cm$^3$', '$120$ cm$^3$', '$38$ cm$^3$', '$480$ cm$^3$'], 0,
    '$V = 8 \\times 5 \\times 6 = 240$ cm$^3$.'),
  fb(6, 'The area of a rectangle is length times ___. Volume is measured in ___ units.',
    ['breadth', 'cubic'],
    'Area $= \\ell \\times b$. Volume uses cubic units like cm$^3$ or m$^3$.'),
  t(7, '### Counting to Find Volume\n\nYou can find the volume of a shape by **counting unit cubes**.\n\nIf a rectangular prism is filled with $1$ cm$^3$ cubes:\n- Count the cubes in one layer (length $\\times$ breadth).\n- Multiply by the number of layers (height).\n\n**Example:** A prism has $5$ cubes along the length, $3$ along the breadth, and is $4$ layers high.\n$$V = 5 \\times 3 \\times 4 = 60 \\text{ cm}^3$$\n\n### Connection: Volume and Capacity\n\n$$1 \\text{ cm}^3 = 1 \\text{ ml}$$\n$$1\\,000 \\text{ cm}^3 = 1\\,\\ell$$\n\n**Example:** A container has a volume of $2\\,500$ cm$^3$. What is its capacity in litres?\n$$2\\,500 \\div 1\\,000 = 2{,}5\\,\\ell$$'),
  q(8, 'A container has a volume of $4\\,000$ cm$^3$. How many litres of water can it hold?',
    ['$4\\,\\ell$', '$40\\,\\ell$', '$0{,}4\\,\\ell$', '$400\\,\\ell$'], 0,
    '$4\\,000$ cm$^3 = 4\\,000$ ml $= 4\\,\\ell$.'),
  t(9, '### Practical Applications\n\n**Example 1:** A school garden in KwaZulu-Natal is $8$ m long and $5$ m wide. Fencing costs R$45$ per metre.\n- Perimeter: $P = 2(8 + 5) = 26$ m\n- Cost: $26 \\times R45 = R1\\,170$\n\n**Example 2:** A fish tank is $50$ cm long, $30$ cm wide, and $35$ cm high. How many litres of water does it hold?\n$$V = 50 \\times 30 \\times 35 = 52\\,500 \\text{ cm}^3 = 52{,}5\\,\\ell$$\n\n**Example 3:** A classroom wall is $6$ m long and $3$ m high. Paint covers $10$ m$^2$ per litre. How many litres are needed?\n- Area: $6 \\times 3 = 18$ m$^2$\n- Paint: $18 \\div 10 = 1{,}8\\,\\ell$ → buy $2$ litres'),
  q(10, 'A square has a perimeter of $36$ cm. What is its area?',
    ['$81$ cm$^2$', '$36$ cm$^2$', '$9$ cm$^2$', '$144$ cm$^2$'], 0,
    'Side $= 36 \\div 4 = 9$ cm. Area $= 9^2 = 81$ cm$^2$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Transformations (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Transformations\n\nA **transformation** changes the position, size, or orientation of a shape.\n\n### Reflections (Flips)\n\nA **reflection** flips a shape over a **line of reflection** (mirror line).\n\n**Properties of reflections:**\n- The shape and its image are the **same size and shape** (congruent).\n- Each point and its image are the **same distance** from the mirror line.\n- The image is a **mirror image** of the original.\n\n**Example:** Reflecting a triangle over a vertical line:\n- If point $A$ is $3$ squares to the left of the line, its image $A\'$ is $3$ squares to the right.\n- The reflected shape looks like a mirror image.\n\n**Lines of symmetry:** A shape has a line of symmetry if one half is a mirror image of the other.\n- A square has $4$ lines of symmetry.\n- A rectangle has $2$ lines of symmetry.\n- An equilateral triangle has $3$ lines of symmetry.'),
  t(2, '### Translations (Slides)\n\nA **translation** slides a shape in a given direction without turning it.\n\n**On grid paper:**\n- "Translate $3$ units right and $2$ units up" means every point moves $3$ right and $2$ up.\n\n**Properties of translations:**\n- The shape and its image are **congruent** (same size and shape).\n- The shape does not rotate or flip.\n- Every point moves the **same distance** in the **same direction**.\n\n**Example:** Triangle $ABC$ has vertices at $A(1, 2)$, $B(4, 2)$, $C(1, 5)$. Translate $5$ units to the right.\n- $A\' = (1 + 5, 2) = (6, 2)$\n- $B\' = (4 + 5, 2) = (9, 2)$\n- $C\' = (1 + 5, 5) = (6, 5)$'),
  q(3, 'A shape is reflected over a vertical line. Which property stays the same?',
    ['Size and shape', 'Orientation (left-right)', 'Position', 'Rotation'], 0,
    'A reflection produces a congruent image — same size and shape — but the orientation is reversed (mirror image).'),
  t(4, '### Tessellations\n\nA **tessellation** is a pattern of shapes that fit together **without gaps or overlaps**.\n\n**Regular shapes that tessellate:**\n- Equilateral triangles ✓\n- Squares ✓\n- Regular hexagons ✓\n\n**Regular shapes that do NOT tessellate on their own:**\n- Regular pentagons ✗\n- Regular octagons ✗\n\n**Why?** At each vertex the angles must add up to exactly $360°$.\n- Triangle: $6 \\times 60° = 360°$ ✓\n- Square: $4 \\times 90° = 360°$ ✓\n- Hexagon: $3 \\times 120° = 360°$ ✓\n- Pentagon: $108°$ does not divide evenly into $360°$ ✗\n\nYou can also create tessellations with **combinations** of shapes (semi-regular tessellations).'),
  q(5, 'Which of these regular shapes can tessellate on its own?',
    ['Regular hexagon', 'Regular pentagon', 'Regular octagon', 'Regular heptagon'], 0,
    'A regular hexagon tessellates because $3 \\times 120° = 360°$. The other shapes do not divide evenly into $360°$.'),
  fb(6, 'A reflection produces a ___ image (same size and shape). At each vertex of a tessellation, the angles must add up to ___°.',
    ['congruent', '360'],
    'Reflections preserve size and shape (congruence). Tessellation vertices must total $360°$.'),
  t(7, '### Drawing Transformations on Grid Paper\n\n**Steps for reflection:**\n1. Draw the mirror line.\n2. For each vertex, count the distance to the mirror line.\n3. Plot the image vertex the same distance on the other side.\n4. Connect the image vertices.\n\n**Steps for translation:**\n1. Identify the translation rule (e.g. $4$ right, $3$ down).\n2. Move every vertex by that amount.\n3. Connect the image vertices.\n\n**Example:** Reflect the point $(2, 3)$ over the $y$-axis.\n- The $y$-axis is the mirror line.\n- $(2, 3)$ is $2$ units to the right of the $y$-axis.\n- The image is $2$ units to the left: $(-2, 3)$.'),
  q(8, 'Point $P(3, 4)$ is translated $5$ units left and $2$ units down. What are the coordinates of $P\'$?',
    ['$(-2, 2)$', '$(8, 6)$', '$(3, -1)$', '$(-2, 6)$'], 0,
    '$P\' = (3 - 5, 4 - 2) = (-2, 2)$.'),
  t(9, '### Symmetry in Everyday Life\n\nSymmetry is all around us in South Africa:\n- The **protea** (national flower) has rotational symmetry.\n- Many **Ndebele patterns** use reflections and translations.\n- **Road signs** often have lines of symmetry.\n- The South African flag has no line of symmetry.\n\n**Rotational symmetry:** A shape has rotational symmetry if it looks the same after being rotated less than $360°$.\n- A square has rotational symmetry of order $4$ (looks the same after $90°$, $180°$, $270°$).\n- An equilateral triangle has rotational symmetry of order $3$.'),
  q(10, 'How many lines of symmetry does a rectangle have?',
    ['$2$', '$4$', '$1$', '$0$'], 0,
    'A rectangle has $2$ lines of symmetry — one horizontal and one vertical through the centre.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 13: Geometric Patterns (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch13_lesson1 = [
  t(1, '## Geometric Patterns\n\nA **geometric pattern** is a sequence of shapes or figures that follows a rule.\n\n### Investigating Patterns\n\n**Example 1 — Matchstick squares:**\n- Shape 1: $1$ square uses $4$ matchsticks.\n- Shape 2: $2$ squares in a row use $7$ matchsticks.\n- Shape 3: $3$ squares in a row use $10$ matchsticks.\n\nThe pattern of matchsticks: $4, 7, 10, 13, \\ldots$\n\nThe constant difference is $+3$ (each new square adds $3$ matchsticks because it shares one side with the previous square).\n\n| Shape number ($n$) | 1 | 2 | 3 | 4 | 5 |\n|---|---|---|---|---|---|\n| Matchsticks | 4 | 7 | 10 | 13 | 16 |\n\n**Rule:** Matchsticks $= 3n + 1$\n\n**Check:** For $n = 1$: $3(1) + 1 = 4$ ✓\nFor $n = 5$: $3(5) + 1 = 16$ ✓'),
  t(2, '### Extending Patterns\n\n**Example 2 — Dot patterns (triangular numbers):**\n\nShape 1: $1$ dot. Shape 2: $3$ dots. Shape 3: $6$ dots. Shape 4: $10$ dots.\n\nThe pattern: $1, 3, 6, 10, 15, \\ldots$\n\nThe differences are: $+2, +3, +4, +5, \\ldots$ (increasing by $1$ each time).\n\nThe 5th shape: $10 + 5 = 15$ dots.\nThe 6th shape: $15 + 6 = 21$ dots.\n\n**Example 3 — Growing L-shapes:**\n\nShape 1: $3$ tiles. Shape 2: $5$ tiles. Shape 3: $7$ tiles.\n\nPattern: $3, 5, 7, 9, \\ldots$ (add $2$ each time).\n\nRule: Tiles $= 2n + 1$.'),
  q(3, 'In a matchstick triangle pattern, Shape 1 uses $3$ matchsticks, Shape 2 uses $5$, Shape 3 uses $7$. How many matchsticks does Shape 10 use?',
    ['$21$', '$20$', '$23$', '$30$'], 0,
    'Rule: add $2$ each time. Formula: $2n + 1$. Shape 10: $2(10) + 1 = 21$.'),
  t(4, '### Describing Rules\n\nTo describe a geometric pattern rule:\n1. **Look at the shape numbers** and the values.\n2. **Find the constant difference** between consecutive terms.\n3. **Write the rule** using the shape number $n$.\n\n**Method:** If the constant difference is $d$ and the first term is $a_1$:\n- Rule: $a_n = dn + (a_1 - d)$\n\n**Example:** Pattern: $5, 8, 11, 14, \\ldots$\n- $d = 3$, $a_1 = 5$\n- Rule: $a_n = 3n + (5 - 3) = 3n + 2$\n- Check: $a_1 = 3(1) + 2 = 5$ ✓, $a_4 = 3(4) + 2 = 14$ ✓'),
  q(5, 'A pattern is: $2, 5, 8, 11, \\ldots$ What is the rule using $n$?',
    ['$3n - 1$', '$3n + 2$', '$2n + 3$', '$n + 3$'], 0,
    'Constant difference $= 3$. First term $= 2$. Rule: $3n + (2 - 3) = 3n - 1$. Check: $3(1) - 1 = 2$ ✓.'),
  fb(6, 'In the pattern $4, 7, 10, 13, \\ldots$ the constant difference is ___. To find the rule, use the formula $a_n = dn + (a_1 - ___)$.',
    ['3', 'd'],
    'Each term increases by $3$. The formula is $a_n = dn + (a_1 - d)$ where $d$ is the constant difference.'),
  t(7, '### Creating Patterns\n\nYou can create your own geometric patterns:\n\n**Example:** Create a pattern using hexagons:\n- Shape 1: $1$ hexagon, perimeter uses $6$ sides.\n- Shape 2: $2$ hexagons sharing $1$ side, exposed sides $= 10$.\n- Shape 3: $3$ hexagons in a row, exposed sides $= 14$.\n\nPattern: $6, 10, 14, 18, \\ldots$ (add $4$ each time).\nRule: $4n + 2$.\n\n**Real-world patterns in SA:**\n- Beadwork patterns in Zulu culture follow geometric rules.\n- Tile patterns in the Kirstenbosch Botanical Garden.\n- Brick-laying patterns in buildings.'),
  q(8, 'In a pattern, Shape 1 has $6$ dots, Shape 2 has $10$ dots, Shape 3 has $14$ dots. What is the rule?',
    ['$4n + 2$', '$6n$', '$4n + 6$', '$2n + 4$'], 0,
    'Constant difference $= 4$. Rule: $4n + (6 - 4) = 4n + 2$. Check: $4(1) + 2 = 6$ ✓.'),
  t(9, '### Using Tables and Rules\n\nA table helps organise pattern data:\n\n| Shape ($n$) | 1 | 2 | 3 | 4 | 5 | 10 | 20 |\n|---|---|---|---|---|---|---|---|\n| Tiles | 5 | 9 | 13 | 17 | 21 | ? | ? |\n\nConstant difference $= 4$. Rule: $4n + 1$.\n\n- Shape 10: $4(10) + 1 = 41$ tiles.\n- Shape 20: $4(20) + 1 = 81$ tiles.\n\n**Why rules are powerful:** Without a rule, you would have to draw all $20$ shapes. With a rule, you can find ANY term directly.'),
  q(10, 'Using the rule $5n + 3$, what is the value of the 12th term?',
    ['$63$', '$60$', '$56$', '$65$'], 0,
    '$5(12) + 3 = 60 + 3 = 63$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 14: Data Handling (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Collecting, Organising, and Summarising Data ---
blockNum = 0;
const ch14_lesson1 = [
  t(1, '## Data Handling — Collecting, Organising, and Summarising Data\n\n### The Data Handling Cycle\n\n1. **Pose a question** — What do you want to find out?\n2. **Collect data** — Surveys, experiments, observations.\n3. **Organise data** — Tables, tally charts.\n4. **Summarise data** — Mean, median, mode.\n5. **Represent data** — Graphs and charts.\n6. **Interpret data** — Draw conclusions and answer your question.\n\n### Organising Data\n\n**Example:** A Grade 6 class in Nelspruit recorded the number of siblings each learner has:\n$2, 1, 3, 0, 2, 4, 1, 2, 3, 1, 2, 0, 1, 2, 3$\n\n**Frequency table:**\n\n| Siblings | Tally | Frequency |\n|----------|-------|----------|\n| 0 | ∥ | 2 |\n| 1 | ∥∥∥∥ | 4 |\n| 2 | ∥∥∥∥∥ | 5 |\n| 3 | ∥∥∥ | 3 |\n| 4 | ∥ | 1 |\n| **Total** | | **15** |'),
  t(2, '### Measures of Central Tendency\n\n**Mean (average):**\n$$\\text{Mean} = \\frac{\\text{Sum of all values}}{\\text{Number of values}}$$\n\n**Median:** The middle value when data is arranged in order. If there are two middle values, find their average.\n\n**Mode:** The value that occurs most often.\n\n**Example:** Data: $2, 1, 3, 0, 2, 4, 1, 2, 3, 1, 2, 0, 1, 2, 3$\n\nArranged: $0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 4$\n\n- **Mean:** $\\frac{0+0+1+1+1+1+2+2+2+2+2+3+3+3+4}{15} = \\frac{27}{15} = 1{,}8$\n- **Median:** The 8th value (middle of 15) $= 2$\n- **Mode:** $2$ (appears $5$ times)\n\nEach measure gives different information about the data.'),
  q(3, 'Find the mean of: $5, 8, 3, 10, 4$.',
    ['$6$', '$5$', '$8$', '$7$'], 0,
    'Sum $= 5 + 8 + 3 + 10 + 4 = 30$. Mean $= 30 \\div 5 = 6$.'),
  t(4, '### Bar Graphs and Double Bar Graphs\n\n**Bar graphs** use bars to show the frequency of each category.\n\n**Rules for drawing bar graphs:**\n- Title at the top.\n- Label both axes.\n- Bars must be the same width.\n- Equal spaces between bars.\n- Use a ruler.\n\n**Double bar graphs** compare two sets of data on the same axes, using different colours or patterns.\n\n**Example:** A school records test scores for two classes:\n\n| Score range | Class A | Class B |\n|---|---|---|\n| $0$–$40$ | $3$ | $5$ |\n| $41$–$60$ | $8$ | $10$ |\n| $61$–$80$ | $15$ | $12$ |\n| $81$–$100$ | $4$ | $3$ |\n\nA double bar graph would show both classes side by side for easy comparison.'),
  q(5, 'In a data set of $9$ values arranged in order, which value is the median?',
    ['The 5th value', 'The 4th value', 'The 9th value', 'The average of the 4th and 5th'], 0,
    'For $9$ values, the median is the $\\frac{9+1}{2} = 5$th value in the ordered list.'),
  fb(6, 'The ___ is the value that occurs most often. The mean is the sum of all values divided by the ___ of values.',
    ['mode', 'number'],
    'Mode = most frequent value. Mean = sum ÷ count.'),
  t(7, '### Pie Charts\n\nA **pie chart** (circle graph) shows data as parts of a circle.\n\nThe whole circle represents $360°$.\n\n**To draw a pie chart:**\n1. Calculate each category as a fraction of the total.\n2. Multiply each fraction by $360°$ to get the angle.\n3. Draw the sectors using a protractor.\n\n**Example:** Favourite sports in a class of $40$ learners:\n- Soccer: $16$ → $\\frac{16}{40} \\times 360° = 144°$\n- Cricket: $10$ → $\\frac{10}{40} \\times 360° = 90°$\n- Netball: $8$ → $\\frac{8}{40} \\times 360° = 72°$\n- Rugby: $6$ → $\\frac{6}{40} \\times 360° = 54°$\n\nCheck: $144° + 90° + 72° + 54° = 360°$ ✓'),
  q(8, 'In a pie chart, a category has $15$ items out of a total of $60$. What angle does it get?',
    ['$90°$', '$60°$', '$120°$', '$45°$'], 0,
    '$\\frac{15}{60} \\times 360° = \\frac{1}{4} \\times 360° = 90°$.'),
  t(9, '### Choosing the Right Graph\n\n| Data type | Best graph |\n|-----------|------------|\n| Categories (e.g. favourite colour) | Bar graph or pie chart |\n| Comparing two groups | Double bar graph |\n| Change over time | Line graph |\n| Parts of a whole | Pie chart |\n\n**Example:** To show how the temperature in Johannesburg changes over a day, use a **line graph**.\nTo show what fraction of learners prefer each sport, use a **pie chart**.'),
  q(10, 'The mode of a data set is $7$. What does this tell us?',
    ['$7$ is the most frequent value', '$7$ is the middle value', '$7$ is the average', 'There are $7$ data values'], 0,
    'The mode is the value that appears most often. So $7$ occurs more than any other value.'),
];

// --- Lesson 2: Interpreting Data and Probability ---
blockNum = 0;
const ch14_lesson2 = [
  t(1, '## Data Handling — Interpreting Data and Probability\n\n### Interpreting Data from Graphs\n\nWhen reading a graph, ask:\n1. **What is the title?** (What is the graph about?)\n2. **What do the axes show?** (labels and units)\n3. **What are the highest and lowest values?**\n4. **What trends or patterns do you see?**\n5. **Can you answer the original question?**\n\n**Example:** A bar graph shows rainfall in Durban over $6$ months:\n\n| Month | Jan | Feb | Mar | Apr | May | Jun |\n|-------|-----|-----|-----|-----|-----|-----|\n| Rainfall (mm) | $120$ | $110$ | $90$ | $60$ | $30$ | $20$ |\n\nFrom the graph:\n- Highest rainfall: January ($120$ mm)\n- Lowest rainfall: June ($20$ mm)\n- Trend: Rainfall decreases from summer to winter.\n- Total rainfall: $120 + 110 + 90 + 60 + 30 + 20 = 430$ mm'),
  t(2, '### Misleading Graphs\n\nGraphs can be **misleading** if they are not drawn correctly.\n\n**Common tricks:**\n1. **Not starting the axis at $0$** — makes differences look bigger.\n2. **Using different bar widths** — wider bars look like more.\n3. **Missing labels** — you cannot read the graph properly.\n4. **Wrong scale** — makes changes look bigger or smaller than they are.\n5. **Using 3D effects** — distorts the appearance of bars.\n\n**Example:** A bar graph shows sales of $50$ and $55$ items. If the $y$-axis starts at $48$ instead of $0$, the bar for $55$ looks much taller, making a $10\\%$ increase look enormous.\n\n**Rule:** Always check that the axes start at $0$ and are evenly spaced before drawing conclusions.'),
  q(3, 'A graph\'s $y$-axis starts at $90$ instead of $0$. How does this affect the graph?',
    ['It makes differences look larger than they really are', 'It has no effect', 'It makes the graph more accurate', 'It makes all bars the same height'], 0,
    'Starting the axis at a value other than $0$ exaggerates differences between bars, making the graph misleading.'),
  t(4, '### Chance and Probability\n\n**Probability** tells us how likely something is to happen.\n\n**Probability scale:**\n$$\\text{Impossible} \\longleftrightarrow \\text{Unlikely} \\longleftrightarrow \\text{Even chance} \\longleftrightarrow \\text{Likely} \\longleftrightarrow \\text{Certain}$$\n\n**Vocabulary:**\n- **Impossible:** Will never happen. (e.g. rolling a $7$ on a normal dice)\n- **Unlikely:** Probably will not happen. (e.g. rain in the Karoo desert in January)\n- **Even chance:** Equally likely to happen or not. (e.g. flipping a coin and getting heads)\n- **Likely:** Probably will happen. (e.g. it being warm in Durban in December)\n- **Certain:** Will definitely happen. (e.g. the sun rising tomorrow)'),
  q(5, 'What is the chance of rolling a $7$ on a normal six-sided dice?',
    ['Impossible', 'Unlikely', 'Even chance', 'Certain'], 0,
    'A normal dice has faces numbered $1$ to $6$. Rolling a $7$ is impossible.'),
  fb(6, 'A graph that does not start the $y$-axis at zero is called ___. An event that will definitely happen has a probability that is ___.',
    ['misleading', 'certain'],
    'Not starting at zero exaggerates differences. An event that always happens is certain.'),
  t(7, '### More Probability Vocabulary\n\n**Experiment:** An action with different possible results (e.g. rolling a dice).\n**Outcome:** A single result of an experiment (e.g. rolling a $3$).\n**Event:** A collection of outcomes (e.g. rolling an even number).\n\n**Example 1:** Flipping a coin.\n- Possible outcomes: Heads, Tails.\n- Chance of heads: even chance ($1$ out of $2$).\n\n**Example 2:** Drawing a ball from a bag containing $3$ red, $2$ blue, and $1$ green ball.\n- Total outcomes: $6$\n- Chance of red: $3$ out of $6$ — likely (more than half).\n- Chance of green: $1$ out of $6$ — unlikely.\n\n**Example 3:** Tomorrow is a school day. The chance that learners will attend school is **likely** (or certain, if attendance is compulsory).'),
  q(8, 'A bag has $4$ blue marbles and $1$ red marble. Which word best describes the chance of drawing a blue marble?',
    ['Likely', 'Certain', 'Even chance', 'Unlikely'], 0,
    'There are $4$ blue out of $5$ total. Since most are blue, drawing blue is likely (but not certain).'),
  t(9, '### Predicting Outcomes\n\nWe can use probability words to predict what might happen.\n\n**Example:** In Johannesburg, it rains on about $100$ out of $365$ days per year.\n- Will it rain on a specific day? **Unlikely** ($100/365$ is less than half).\n- Will it rain at least once in a month? **Likely** (about $8$–$9$ rainy days per month on average).\n\n**Example:** A spinner has $4$ equal sections: red, blue, green, yellow.\n- Chance of landing on red: even chance — actually, it is $1$ out of $4$, so **unlikely** (less than half).\n- Chance of NOT landing on red: $3$ out of $4$, so **likely**.\n\n**Important:** Probability helps us make predictions, but it does not tell us exactly what will happen each time.'),
  q(10, 'A spinner has $3$ equal sections: red, red, blue. What word describes the chance of landing on red?',
    ['Likely', 'Certain', 'Even chance', 'Impossible'], 0,
    '$2$ out of $3$ sections are red, which is more than half. So landing on red is **likely**.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FUNCTION — Database insertion
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

  // Find or create Mathematics subject
  const subjectDoc = await db.collection('subjects').findOne({
    name: /^Mathematics$/i,
    schoolId: SCHOOL_ID,
  });

  let SUBJECT_ID;
  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Mathematics subject:', String(SUBJECT_ID));
  } else {
    const result = await db.collection('subjects').insertOne({
      name: 'Mathematics',
      code: 'MATH',
      schoolId: SCHOOL_ID,
      gradeIds: [GRADE_ID],
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Mathematics subject:', String(SUBJECT_ID));
  }

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
    tags: ['grade-6', 'mathematics', 'caps'],
    language: 'en',
    status: 'published',
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    __v: 0,
  };

  const chapters = [
    {
      title: 'Chapter 1: Whole Numbers',
      description: 'Place value up to 9 digits, rounding, ordering, comparing, properties of operations, BODMAS, and estimation.',
      order: 1,
      lessons: [
        { title: 'Whole Numbers', description: 'Place value up to 9 digits, rounding, ordering and comparing, properties of operations, BODMAS, estimation, and problem solving.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Number Sentences and Number Patterns',
      description: 'Number sentences with variables, input-output rules, geometric and numeric patterns, describing and extending sequences.',
      order: 2,
      lessons: [
        { title: 'Number Sentences and Number Patterns', description: 'Solving number sentences with variables, input-output rules, constant difference numeric patterns, geometric patterns, and describing sequences.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Common Fractions',
      description: 'Equivalent fractions, simplifying, comparing, ordering, addition and subtraction with different denominators, fractions of whole numbers, and percentages.',
      order: 3,
      lessons: [
        { title: 'Common Fractions', description: 'Equivalent fractions, simplifying, comparing and ordering, addition and subtraction with different denominators, fractions of whole numbers, mixed numbers, and percentages.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Decimal Fractions',
      description: 'Place value to thousandths, ordering, rounding, addition and subtraction, multiplying and dividing by powers of 10, and conversions between fractions, decimals, and percentages.',
      order: 4,
      lessons: [
        { title: 'Decimal Fractions', description: 'Place value to thousandths, ordering and rounding, addition and subtraction, multiplying and dividing by 10, 100, and 1 000, and converting between fractions, decimals, and percentages.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Multiplication and Division',
      description: 'Long multiplication up to 4-digit by 3-digit, long division up to 4-digit by 3-digit, estimation, strategies, and problem solving with all four operations.',
      order: 5,
      lessons: [
        { title: 'Multiplication and Division', description: 'Long multiplication, long division, estimation, calculation strategies (compensating, doubling and halving, distributive property), and multi-step word problems.', blocks: ch5_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 6: Capacity and Volume',
      description: 'Litres, millilitres, kilolitres, conversions, reading measuring instruments, volume of containers, and practical problems.',
      order: 6,
      lessons: [
        { title: 'Capacity and Volume', description: 'Units of capacity (ml, l, kl), conversions, reading measuring instruments, volume of rectangular containers, connection to capacity, and practical problems.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Time',
      description: '12-hour and 24-hour time, elapsed time, timetables, calendars, and time zones in South African context.',
      order: 7,
      lessons: [
        { title: 'Time', description: '12-hour and 24-hour time conversions, elapsed time calculations, reading timetables, calendars, and South African time zones.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Length and Mass',
      description: 'Conversions between km, m, cm, mm and kg, g, mg, measurement, choosing appropriate units, and practical problems involving perimeter and mass.',
      order: 8,
      lessons: [
        { title: 'Length and Mass', description: 'Unit conversions for length (mm, cm, m, km) and mass (mg, g, kg, t), choosing appropriate units, measurement, and practical problems.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: Properties of 2D Shapes',
      description: 'Classifying triangles by sides and angles, angle sum property, classifying quadrilaterals, and properties of rectangles, squares, parallelograms, rhombi, trapeziums, and kites.',
      order: 9,
      lessons: [
        { title: 'Properties of 2D Shapes', description: 'Classifying triangles and quadrilaterals by their properties, angle sum of triangles and quadrilaterals, identifying shapes from properties.', blocks: ch9_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 10: Properties of 3D Objects',
      description: 'Faces, edges, and vertices of prisms and pyramids, Euler\'s formula, nets, recognising 3D objects in real life, and building models.',
      order: 10,
      lessons: [
        { title: 'Properties of 3D Objects', description: 'Prisms and pyramids, counting faces, edges, and vertices, Euler\'s formula, nets of 3D objects, and recognising 3D objects.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: Perimeter, Area, and Volume',
      description: 'Perimeter of polygons, area of rectangles and squares, volume of rectangular prisms by counting and formula, and practical applications.',
      order: 11,
      lessons: [
        { title: 'Perimeter, Area, and Volume', description: 'Perimeter of polygons, area of rectangles and squares, volume of rectangular prisms, counting unit cubes, volume-capacity connection, and practical applications.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Transformations',
      description: 'Reflections, translations, tessellations on grid paper, lines of symmetry, and rotational symmetry.',
      order: 12,
      lessons: [
        { title: 'Transformations', description: 'Reflections (flips), translations (slides), tessellations, lines of symmetry, rotational symmetry, and drawing transformations on grid paper.', blocks: ch12_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 13: Geometric Patterns',
      description: 'Investigating and extending geometric patterns, describing rules in words and formulae, creating patterns, and using tables.',
      order: 13,
      lessons: [
        { title: 'Geometric Patterns', description: 'Investigating matchstick and dot patterns, finding constant differences, describing rules using formulae, extending patterns, and creating own patterns.', blocks: ch13_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 14: Data Handling',
      description: 'Collecting, organising, and summarising data. Mean, median, mode. Bar graphs, double bar graphs, pie charts. Interpreting data, misleading graphs, and probability vocabulary.',
      order: 14,
      lessons: [
        { title: 'Collecting, Organising, and Summarising Data', description: 'Data handling cycle, frequency tables, mean, median, mode, bar graphs, double bar graphs, pie charts, and choosing the right graph.', blocks: ch14_lesson1, term: 4 },
        { title: 'Interpreting Data and Probability', description: 'Interpreting graphs, misleading graphs, probability vocabulary (impossible, unlikely, even chance, likely, certain), experiments, outcomes, and predictions.', blocks: ch14_lesson2, term: 4 },
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

  const textbook = await db.collection('textbooks').insertOne({
    title: 'Grade 6 Mathematics \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook for Grade 6 Mathematics covering Whole Numbers, Number Sentences and Number Patterns, Common Fractions, Decimal Fractions, Multiplication and Division, Capacity and Volume, Time, Length and Mass, Properties of 2D Shapes, Properties of 3D Objects, Perimeter Area and Volume, Transformations, Geometric Patterns, and Data Handling.',
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
  console.log('  TEXTBOOK: Grade 6 Mathematics');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
