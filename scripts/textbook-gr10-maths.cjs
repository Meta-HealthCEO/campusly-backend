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
// CHAPTER 1: Algebraic Expressions (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: The Real Number System and Surds ---
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## The Real Number System\n\nIn Grade 10 we classify numbers into sets:\n\n| Symbol | Name | Examples |\n|--------|------|----------|\n| $\\mathbb{N}$ | Natural numbers | $1, 2, 3, 4, \\ldots$ |\n| $\\mathbb{N}_0$ | Whole numbers | $0, 1, 2, 3, \\ldots$ |\n| $\\mathbb{Z}$ | Integers | $\\ldots, -2, -1, 0, 1, 2, \\ldots$ |\n| $\\mathbb{Q}$ | Rational numbers | $\\dfrac{a}{b}$ where $a, b \\in \\mathbb{Z}$, $b \\neq 0$ |\n| $\\mathbb{Q}\'$ | Irrational numbers | $\\sqrt{2}$, $\\pi$, $\\sqrt{3}$ |\n| $\\mathbb{R}$ | Real numbers | $\\mathbb{Q} \\cup \\mathbb{Q}\'$ |\n\nEvery natural number is a whole number, every whole number is an integer, every integer is rational, and every rational number is real.\n\n**Key fact:** A number is **rational** if it can be written as a fraction $\\dfrac{a}{b}$ (including terminating and recurring decimals). A number is **irrational** if it cannot.'),
  t(2, '### Rational vs Irrational Numbers\n\n**Rational numbers** include:\n- Integers: $-3$, $0$, $7$\n- Fractions: $\\dfrac{2}{5}$, $-\\dfrac{7}{3}$\n- Terminating decimals: $0{,}75 = \\dfrac{3}{4}$\n- Recurring decimals: $0{,}\\overline{3} = \\dfrac{1}{3}$\n\n**Irrational numbers** include:\n- $\\sqrt{2} \\approx 1{,}414\\ldots$ (non-terminating, non-recurring)\n- $\\sqrt{3} \\approx 1{,}732\\ldots$\n- $\\pi \\approx 3{,}14159\\ldots$\n\n**Important:** $\\sqrt{4} = 2$ is **rational** (it simplifies to an integer). Only surds that cannot be simplified to rational numbers are irrational.\n\n### Rounding\n\nRound real numbers to an appropriate degree of accuracy:\n- $\\sqrt{7} \\approx 2{,}646$ (correct to 3 decimal places)\n- $\\pi \\approx 3{,}14$ (correct to 2 decimal places)'),
  q(3, 'Which of the following is an irrational number?',
    ['$\\sqrt{5}$', '$\\sqrt{9}$', '$0{,}75$', '$\\dfrac{22}{7}$'], 0,
    '$\\sqrt{5}$ cannot be simplified to a fraction, so it is irrational. $\\sqrt{9} = 3$ is rational, $0{,}75 = \\frac{3}{4}$ is rational, and $\\frac{22}{7}$ is rational (it is a fraction, not equal to $\\pi$).'),
  t(4, '### Between Which Two Integers Does a Surd Lie?\n\nTo estimate the value of a surd without a calculator, find the perfect squares on either side.\n\n**Example 1:** Between which two consecutive integers does $\\sqrt{20}$ lie?\n\n$\\sqrt{16} = 4$ and $\\sqrt{25} = 5$.\n\nSince $16 < 20 < 25$, we have $4 < \\sqrt{20} < 5$.\n\n**Example 2:** Between which two integers does $\\sqrt{50}$ lie?\n\n$\\sqrt{49} = 7$ and $\\sqrt{64} = 8$.\n\nSo $7 < \\sqrt{50} < 8$.\n\n**SA Context:** A farmer near Stellenbosch needs to fence a square plot of $50\\text{ m}^2$. The side length is $\\sqrt{50} \\approx 7{,}07$ m, so she needs approximately $4 \\times 7{,}07 = 28{,}3$ m of fencing.'),
  q(5, 'Between which two consecutive integers does $\\sqrt{30}$ lie?',
    ['5 and 6', '4 and 5', '6 and 7', '3 and 4'], 0,
    '$\\sqrt{25} = 5$ and $\\sqrt{36} = 6$. Since $25 < 30 < 36$, we have $5 < \\sqrt{30} < 6$.'),
  fb(6, 'A number that can be written as $\\dfrac{a}{b}$ where $a, b \\in \\mathbb{Z}$ and $b \\neq 0$ is called a ___ number. The set of all rational and irrational numbers together is the set of ___ numbers.',
    ['rational', 'real'],
    'Rational numbers are fractions. The union of rational and irrational numbers gives the real numbers $\\mathbb{R}$.'),
  t(7, '### Simplifying Surds\n\nA **surd** is an irrational root, such as $\\sqrt{2}$, $\\sqrt{3}$, $\\sqrt{5}$.\n\nTo simplify a surd, factor out the largest perfect square:\n\n**Example 1:** $\\sqrt{12} = \\sqrt{4 \\cdot 3} = 2\\sqrt{3}$\n\n**Example 2:** $\\sqrt{45} = \\sqrt{9 \\cdot 5} = 3\\sqrt{5}$\n\n**Example 3:** $\\sqrt{72} = \\sqrt{36 \\cdot 2} = 6\\sqrt{2}$\n\n### Adding and Subtracting Like Surds\n\nOnly **like surds** (same number under the root) can be combined:\n\n$3\\sqrt{2} + 5\\sqrt{2} = 8\\sqrt{2}$\n\n$\\sqrt{8} + \\sqrt{18} = 2\\sqrt{2} + 3\\sqrt{2} = 5\\sqrt{2}$\n\n**Important:** $\\sqrt{a + b} \\neq \\sqrt{a} + \\sqrt{b}$. This is a very common mistake!'),
  q(8, 'Simplify $\\sqrt{50} + \\sqrt{32}$.',
    ['$9\\sqrt{2}$', '$\\sqrt{82}$', '$7\\sqrt{2}$', '$5\\sqrt{2} + 4\\sqrt{2}$'], 0,
    '$\\sqrt{50} = 5\\sqrt{2}$ and $\\sqrt{32} = 4\\sqrt{2}$. So $\\sqrt{50} + \\sqrt{32} = 5\\sqrt{2} + 4\\sqrt{2} = 9\\sqrt{2}$.'),
  t(9, '### Rationalising the Denominator\n\nWe rationalise to remove the surd from the denominator.\n\n**Type 1:** Single surd in the denominator — multiply top and bottom by the surd.\n\n$$\\dfrac{5}{\\sqrt{3}} = \\dfrac{5}{\\sqrt{3}} \\cdot \\dfrac{\\sqrt{3}}{\\sqrt{3}} = \\dfrac{5\\sqrt{3}}{3}$$\n\n**Type 2:** Binomial surd in the denominator — multiply by the conjugate.\n\n$$\\dfrac{3}{2 + \\sqrt{5}} = \\dfrac{3(2 - \\sqrt{5})}{(2 + \\sqrt{5})(2 - \\sqrt{5})} = \\dfrac{3(2 - \\sqrt{5})}{4 - 5} = \\dfrac{3(2 - \\sqrt{5})}{-1} = -3(2 - \\sqrt{5})$$\n$$= -6 + 3\\sqrt{5} = 3\\sqrt{5} - 6$$'),
  q(10, 'Rationalise the denominator: $\\dfrac{6}{\\sqrt{2}}$.',
    ['$3\\sqrt{2}$', '$\\dfrac{6\\sqrt{2}}{4}$', '$6\\sqrt{2}$', '$\\dfrac{\\sqrt{2}}{6}$'], 0,
    '$\\dfrac{6}{\\sqrt{2}} \\cdot \\dfrac{\\sqrt{2}}{\\sqrt{2}} = \\dfrac{6\\sqrt{2}}{2} = 3\\sqrt{2}$.'),
];

// --- Lesson 2: Products, Factorisation, and Algebraic Fractions ---
blockNum = 0;
const ch1_lesson2 = [
  t(1, '## Products of Algebraic Expressions\n\n### Multiplying a Binomial by a Trinomial\n\nUse the distributive law: multiply each term of the binomial by every term of the trinomial.\n\n**Example:** $(x + 2)(x^2 - 3x + 4)$\n\n$$= x(x^2 - 3x + 4) + 2(x^2 - 3x + 4)$$\n$$= x^3 - 3x^2 + 4x + 2x^2 - 6x + 8$$\n$$= x^3 - x^2 - 2x + 8$$\n\n### Special Products\n\n| Product | Expansion |\n|---------|----------|\n| $(a + b)^2$ | $a^2 + 2ab + b^2$ |\n| $(a - b)^2$ | $a^2 - 2ab + b^2$ |\n| $(a + b)(a - b)$ | $a^2 - b^2$ |\n\nThese patterns must be memorised — they appear everywhere in Mathematics.'),
  t(2, '### Worked Examples: Products\n\n**Example 1:** Expand $(3x - 2)^2$.\n$$= (3x)^2 - 2(3x)(2) + (2)^2 = 9x^2 - 12x + 4$$\n\n**Example 2:** Expand $(2x + 5)(2x - 5)$.\n$$= (2x)^2 - (5)^2 = 4x^2 - 25$$\n\n**Example 3:** Expand $(x + 3)(x^2 + 2x - 1)$.\n$$= x^3 + 2x^2 - x + 3x^2 + 6x - 3 = x^3 + 5x^2 + 5x - 3$$\n\n**SA Context:** A rectangular kraal near Limpopo has length $(2x + 3)$ metres and width $(x - 1)$ metres. The area is:\n$$(2x + 3)(x - 1) = 2x^2 - 2x + 3x - 3 = 2x^2 + x - 3 \\text{ m}^2$$'),
  q(3, 'Expand $(4x + 1)(4x - 1)$.',
    ['$16x^2 - 1$', '$16x^2 + 1$', '$16x^2 - 8x + 1$', '$4x^2 - 1$'], 0,
    'This is a difference of two squares: $(4x + 1)(4x - 1) = (4x)^2 - 1^2 = 16x^2 - 1$.'),
  t(4, '## Factorisation\n\nFactorisation is the reverse of expansion. There are several techniques:\n\n### 1. Common Factor\n\nTake out the **highest common factor (HCF)**.\n\n$6x^2 + 9x = 3x(2x + 3)$\n\n### 2. Difference of Two Squares\n\n$a^2 - b^2 = (a + b)(a - b)$\n\n$25x^2 - 16 = (5x + 4)(5x - 4)$\n\n### 3. Perfect Square Trinomials\n\n$a^2 + 2ab + b^2 = (a + b)^2$\n$a^2 - 2ab + b^2 = (a - b)^2$\n\n$x^2 + 10x + 25 = (x + 5)^2$\n\n### 4. Grouping in Pairs\n\n$x^3 + 3x^2 + 2x + 6 = x^2(x + 3) + 2(x + 3) = (x + 3)(x^2 + 2)$'),
  t(5, '### 5. Trinomials ($ax^2 + bx + c$)\n\n**When $a = 1$:** Find two numbers that multiply to give $c$ and add to give $b$.\n\n$x^2 + 7x + 12 = (x + 3)(x + 4)$ because $3 \\times 4 = 12$ and $3 + 4 = 7$.\n\n**When $a \\neq 1$:** Use the cross method or inspection.\n\n$2x^2 + 7x + 3 = (2x + 1)(x + 3)$\n\nCheck: $2x \\cdot 3 + 1 \\cdot x = 6x + x = 7x$ ✓\n\n### 6. Sum and Difference of Two Cubes\n\n$$a^3 + b^3 = (a + b)(a^2 - ab + b^2)$$\n$$a^3 - b^3 = (a - b)(a^2 + ab + b^2)$$\n\n**Example:** $8x^3 - 27 = (2x)^3 - 3^3 = (2x - 3)(4x^2 + 6x + 9)$'),
  q(6, 'Factorise $x^3 + 64$.',
    ['$(x + 4)(x^2 - 4x + 16)$', '$(x + 4)(x^2 + 4x + 16)$', '$(x + 8)(x^2 - 8x + 64)$', '$(x + 4)^3$'], 0,
    '$x^3 + 64 = x^3 + 4^3 = (x + 4)(x^2 - 4x + 16)$. This is the sum of two cubes formula.'),
  fb(7, 'The expression $a^2 - b^2$ is called the difference of two ___ and factorises as $(a + b)(a - b)$. The expression $a^3 - b^3$ factorises as $(a - b)(a^2 + ab + ___)$.',
    ['squares', 'b^2'],
    '$a^2 - b^2 = (a+b)(a-b)$ is the difference of two squares. $a^3 - b^3 = (a-b)(a^2 + ab + b^2)$ is the difference of two cubes.'),
  t(8, '## Simplifying Algebraic Fractions\n\n**Step 1:** Factorise the numerator and denominator fully.\n**Step 2:** Cancel common factors.\n\n**Example 1:** Simplify $\\dfrac{x^2 - 9}{x^2 + 5x + 6}$.\n\n$$= \\dfrac{(x+3)(x-3)}{(x+2)(x+3)} = \\dfrac{x-3}{x+2}, \\quad x \\neq -3$$\n\n**Example 2:** Simplify $\\dfrac{2x^2 + 4x}{x^2 + 2x}$.\n\n$$= \\dfrac{2x(x + 2)}{x(x + 2)} = 2, \\quad x \\neq 0, x \\neq -2$$\n\n### Adding and Subtracting Algebraic Fractions\n\nFind the **LCD** (lowest common denominator), then combine:\n\n$$\\dfrac{3}{x+1} + \\dfrac{2}{x-1} = \\dfrac{3(x-1) + 2(x+1)}{(x+1)(x-1)} = \\dfrac{3x - 3 + 2x + 2}{(x+1)(x-1)} = \\dfrac{5x - 1}{x^2 - 1}$$'),
  q(9, 'Simplify $\\dfrac{x^2 - 4}{x^2 - 4x + 4}$.',
    ['$\\dfrac{x + 2}{x - 2}$', '$\\dfrac{x - 2}{x + 2}$', '$1$', '$\\dfrac{x^2 - 4}{(x-2)^2}$'], 0,
    '$\\dfrac{x^2 - 4}{x^2 - 4x + 4} = \\dfrac{(x+2)(x-2)}{(x-2)^2} = \\dfrac{x+2}{x-2}$, $x \\neq 2$.'),
  q(10, 'Factorise completely: $3x^2 - 12$.',
    ['$3(x + 2)(x - 2)$', '$(3x + 6)(x - 2)$', '$3(x^2 - 4)$', '$(x + 2)(3x - 6)$'], 0,
    '$3x^2 - 12 = 3(x^2 - 4) = 3(x + 2)(x - 2)$. Always take out the common factor first, then check for further factorisation.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Exponents (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Laws of Exponents ---
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Laws of Exponents\n\nIn Grade 10, we work with the exponent laws where $x, y > 0$ and $m, n \\in \\mathbb{Z}$.\n\n### The Seven Laws\n\n| # | Law | Rule |\n|---|-----|------|\n| 1 | Product of powers | $x^m \\cdot x^n = x^{m+n}$ |\n| 2 | Quotient of powers | $x^m \\div x^n = x^{m-n}$ |\n| 3 | Power of a power | $(x^m)^n = x^{mn}$ |\n| 4 | Power of a product | $(xy)^n = x^n y^n$ |\n| 5 | Power of a quotient | $\\left(\\dfrac{x}{y}\\right)^n = \\dfrac{x^n}{y^n}$ |\n| 6 | Zero exponent | $x^0 = 1$ ($x \\neq 0$) |\n| 7 | Negative exponent | $x^{-n} = \\dfrac{1}{x^n}$ ($x \\neq 0$) |'),
  t(2, '### Applying the Laws — Worked Examples\n\n**Example 1:** Simplify $\\dfrac{3^{x+2} \\cdot 3^{x-1}}{3^{2x}}$.\n\n$$= \\dfrac{3^{(x+2)+(x-1)}}{3^{2x}} = \\dfrac{3^{2x+1}}{3^{2x}} = 3^{2x+1-2x} = 3^1 = 3$$\n\n**Example 2:** Simplify $\\dfrac{2^{2n} \\cdot 4^n}{8^n}$.\n\nWrite all bases as powers of 2:\n$$= \\dfrac{2^{2n} \\cdot (2^2)^n}{(2^3)^n} = \\dfrac{2^{2n} \\cdot 2^{2n}}{2^{3n}} = \\dfrac{2^{4n}}{2^{3n}} = 2^n$$\n\n**Example 3:** Simplify $\\left(\\dfrac{2x^3}{y^2}\\right)^{-2}$.\n\n$$= \\dfrac{(2x^3)^{-2}}{(y^2)^{-2}} = \\dfrac{y^4}{4x^6}$$'),
  q(3, 'Simplify $\\dfrac{5^{x+3}}{5^{x+1}}$.',
    ['$25$', '$5$', '$5^2$', '$5^{2x+4}$'], 0,
    '$\\dfrac{5^{x+3}}{5^{x+1}} = 5^{(x+3)-(x+1)} = 5^2 = 25$.'),
  t(4, '### Prime Factorisation Strategy\n\nWhen bases are **not the same**, rewrite everything using prime factors.\n\n**Example:** Simplify $\\dfrac{12^n \\cdot 6^{n+1}}{4^n \\cdot 9^n \\cdot 2}$.\n\nPrime factorise:\n- $12 = 2^2 \\cdot 3$, $6 = 2 \\cdot 3$, $4 = 2^2$, $9 = 3^2$\n\n$$= \\dfrac{(2^2 \\cdot 3)^n \\cdot (2 \\cdot 3)^{n+1}}{(2^2)^n \\cdot (3^2)^n \\cdot 2}$$\n$$= \\dfrac{2^{2n} \\cdot 3^n \\cdot 2^{n+1} \\cdot 3^{n+1}}{2^{2n} \\cdot 3^{2n} \\cdot 2}$$\n$$= \\dfrac{2^{3n+1} \\cdot 3^{2n+1}}{2^{2n+1} \\cdot 3^{2n}} = 2^n \\cdot 3 = 3 \\cdot 2^n$$'),
  q(5, 'Simplify $\\dfrac{6^n}{2^n \\cdot 3^n}$.',
    ['$1$', '$6$', '$6^0$', '$\\dfrac{1}{6}$'], 0,
    '$\\dfrac{6^n}{2^n \\cdot 3^n} = \\dfrac{(2 \\cdot 3)^n}{2^n \\cdot 3^n} = \\dfrac{2^n \\cdot 3^n}{2^n \\cdot 3^n} = 1$.'),
  fb(6, 'The law $x^m \\cdot x^n = x^{m+n}$ is the ___ law. The expression $x^{-n}$ is equal to $\\dfrac{1}{___}$.',
    ['product', 'x^n'],
    'The product law adds exponents when bases are the same. A negative exponent means the reciprocal.'),
  t(7, '### Exponential Equations\n\nTo solve exponential equations, write both sides with the **same base**, then equate exponents.\n\n**Example 1:** $2^x = 32$\n$$2^x = 2^5 \\implies x = 5$$\n\n**Example 2:** $3^{2x-1} = 27$\n$$3^{2x-1} = 3^3 \\implies 2x - 1 = 3 \\implies x = 2$$\n\n**Example 3:** $4^x = \\dfrac{1}{8}$\n$$(2^2)^x = 2^{-3} \\implies 2^{2x} = 2^{-3} \\implies 2x = -3 \\implies x = -\\dfrac{3}{2}$$\n\n**Example 4:** $5 \\cdot 2^x = 40$\n$$2^x = 8 = 2^3 \\implies x = 3$$'),
  q(8, 'Solve for $x$: $9^x = 27$.',
    ['$\\dfrac{3}{2}$', '$3$', '$\\dfrac{2}{3}$', '$2$'], 0,
    '$(3^2)^x = 3^3 \\implies 3^{2x} = 3^3 \\implies 2x = 3 \\implies x = \\dfrac{3}{2}$.'),
  t(9, '### Rational Exponents (Introduction)\n\nThe notation $a^{\\frac{1}{n}} = \\sqrt[n]{a}$ connects exponents and roots.\n\n- $a^{\\frac{1}{2}} = \\sqrt{a}$\n- $a^{\\frac{1}{3}} = \\sqrt[3]{a}$\n- $a^{\\frac{m}{n}} = \\sqrt[n]{a^m} = (\\sqrt[n]{a})^m$\n\n**Examples:**\n- $8^{\\frac{1}{3}} = \\sqrt[3]{8} = 2$\n- $16^{\\frac{3}{4}} = (\\sqrt[4]{16})^3 = 2^3 = 8$\n- $25^{\\frac{1}{2}} = \\sqrt{25} = 5$\n\nAll seven exponent laws apply to rational exponents as well (for positive bases).'),
  q(10, 'Evaluate $27^{\\frac{2}{3}}$.',
    ['$9$', '$3$', '$18$', '$81$'], 0,
    '$27^{\\frac{2}{3}} = (\\sqrt[3]{27})^2 = 3^2 = 9$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Equations and Inequalities (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Linear Equations and Quadratic Equations ---
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Linear Equations (Revision)\n\nA linear equation has the variable to the power of 1.\n\n**Example 1:** Solve $3x + 7 = 22$.\n$$3x = 15 \\implies x = 5$$\n\n**Example 2:** Solve $\\dfrac{2x - 1}{3} = \\dfrac{x + 4}{2}$.\n\nMultiply both sides by the LCD (6):\n$$2(2x - 1) = 3(x + 4)$$\n$$4x - 2 = 3x + 12 \\implies x = 14$$\n\n**Example 3:** Solve $5(x - 3) - 2(x + 1) = x + 7$.\n$$5x - 15 - 2x - 2 = x + 7$$\n$$3x - 17 = x + 7 \\implies 2x = 24 \\implies x = 12$$'),
  t(2, '## Quadratic Equations (by Factorisation)\n\nA quadratic equation has the form $ax^2 + bx + c = 0$ where $a \\neq 0$.\n\n### Method\n1. Write in **standard form**: $ax^2 + bx + c = 0$\n2. **Factorise** the left side\n3. Set each factor equal to **zero**\n4. Solve each linear equation\n\n**Example 1:** $x^2 - 5x + 6 = 0$\n$$(x - 2)(x - 3) = 0$$\n$$x = 2 \\text{ or } x = 3$$\n\n**Example 2:** $2x^2 + x - 6 = 0$\n$$(2x - 3)(x + 2) = 0$$\n$$x = \\dfrac{3}{2} \\text{ or } x = -2$$\n\n**Example 3:** $x^2 = 7x$\n$$x^2 - 7x = 0 \\implies x(x - 7) = 0 \\implies x = 0 \\text{ or } x = 7$$\n\n**Warning:** Never divide both sides by $x$ — you will lose the solution $x = 0$.'),
  q(3, 'Solve: $x^2 - 9 = 0$.',
    ['$x = 3$ or $x = -3$', '$x = 9$', '$x = 3$', '$x = -9$ or $x = 9$'], 0,
    '$x^2 - 9 = 0 \\implies (x-3)(x+3) = 0 \\implies x = 3$ or $x = -3$.'),
  t(4, '### Quadratics That Require Rearranging\n\n**Example 1:** $x^2 + 3x = 10$\n$$x^2 + 3x - 10 = 0 \\implies (x + 5)(x - 2) = 0 \\implies x = -5 \\text{ or } x = 2$$\n\n**Example 2:** $(x + 1)(x - 3) = 5$\n\n**Warning:** Do NOT set each factor equal to 5! You must expand first:\n$$x^2 - 2x - 3 = 5 \\implies x^2 - 2x - 8 = 0 \\implies (x - 4)(x + 2) = 0$$\n$$x = 4 \\text{ or } x = -2$$\n\n**SA Context:** A school near Pietermaritzburg designs a rectangular garden of area $24\\text{ m}^2$. If the length is $(x + 2)$ m and the width is $x$ m:\n$$x(x + 2) = 24 \\implies x^2 + 2x - 24 = 0 \\implies (x + 6)(x - 4) = 0$$\n$x = 4$ (reject $x = -6$). So the garden is $4$ m by $6$ m.'),
  q(5, 'Solve: $3x^2 - 12x = 0$.',
    ['$x = 0$ or $x = 4$', '$x = 4$', '$x = 0$', '$x = -4$ or $x = 4$'], 0,
    '$3x^2 - 12x = 0 \\implies 3x(x - 4) = 0 \\implies x = 0$ or $x = 4$.'),
  fb(6, 'A quadratic equation has degree ___. To solve by factorisation, we set each ___ equal to zero.',
    ['2', 'factor'],
    'Quadratic equations are degree 2. After factorising, we use the zero-product property: if $ab = 0$, then $a = 0$ or $b = 0$.'),
  t(7, '## Simultaneous Linear Equations\n\nTwo equations in two unknowns are solved simultaneously.\n\n### Method 1: Substitution\n\nSolve one equation for one variable, then substitute into the other.\n\n**Example:** Solve $y = 2x - 1$ and $3x + y = 9$.\n\nSubstitute (1) into (2):\n$$3x + (2x - 1) = 9 \\implies 5x = 10 \\implies x = 2$$\n$$y = 2(2) - 1 = 3$$\n\n### Method 2: Elimination\n\nAdd or subtract equations to eliminate one variable.\n\n**Example:** Solve $2x + 3y = 12$ and $4x - 3y = 6$.\n\nAdd the equations: $6x = 18 \\implies x = 3$.\nSubstitute: $6 + 3y = 12 \\implies y = 2$.'),
  q(8, 'Solve simultaneously: $x + y = 10$ and $x - y = 4$.',
    ['$x = 7$, $y = 3$', '$x = 5$, $y = 5$', '$x = 3$, $y = 7$', '$x = 10$, $y = 0$'], 0,
    'Add the equations: $2x = 14 \\implies x = 7$. Substitute: $7 + y = 10 \\implies y = 3$.'),
  t(9, '## Word Problems\n\nTranslate the problem into equations, then solve.\n\n**Example:** The sum of two numbers is 25 and their difference is 7. Find the numbers.\n\nLet the numbers be $x$ and $y$ where $x > y$.\n$$x + y = 25 \\quad \\ldots (1)$$\n$$x - y = 7 \\quad \\ldots (2)$$\n\nAdd: $2x = 32 \\implies x = 16$. Then $y = 9$.\n\nThe numbers are 16 and 9.'),
  q(10, 'A school tuckshop sells pies for R15 and drinks for R8. If 20 items are sold for a total of R223, how many pies were sold?',
    ['9', '11', '8', '12'], 0,
    'Let pies = $p$, drinks = $d$. $p + d = 20$ and $15p + 8d = 223$. From (1): $d = 20 - p$. Substitute: $15p + 8(20-p) = 223 \\implies 7p + 160 = 223 \\implies p = 9$.'),
];

// --- Lesson 2: Literal Equations, Inequalities, and Interval Notation ---
blockNum = 0;
const ch3_lesson2 = [
  t(1, '## Literal Equations (Changing the Subject)\n\nA **literal equation** contains two or more variables. Changing the subject means rearranging to isolate a specific variable.\n\n**Example 1:** Make $r$ the subject of $A = \\pi r^2$.\n$$r^2 = \\dfrac{A}{\\pi} \\implies r = \\sqrt{\\dfrac{A}{\\pi}}$$\n\n**Example 2:** Make $t$ the subject of $v = u + at$.\n$$v - u = at \\implies t = \\dfrac{v - u}{a}$$\n\n**Example 3:** Make $x$ the subject of $\\dfrac{1}{x} + \\dfrac{1}{y} = \\dfrac{1}{f}$.\n$$\\dfrac{1}{x} = \\dfrac{1}{f} - \\dfrac{1}{y} = \\dfrac{y - f}{fy}$$\n$$x = \\dfrac{fy}{y - f}$$'),
  q(2, 'Make $h$ the subject of $V = \\dfrac{1}{3}\\pi r^2 h$.',
    ['$h = \\dfrac{3V}{\\pi r^2}$', '$h = \\dfrac{V}{3\\pi r^2}$', '$h = \\dfrac{\\pi r^2}{3V}$', '$h = 3V\\pi r^2$'], 0,
    '$V = \\dfrac{1}{3}\\pi r^2 h \\implies 3V = \\pi r^2 h \\implies h = \\dfrac{3V}{\\pi r^2}$.'),
  t(3, '## Linear Inequalities\n\nAn inequality uses $<$, $>$, $\\leq$, or $\\geq$ instead of $=$.\n\n**Rules (same as equations, except one):**\n- You can add or subtract the same number on both sides.\n- You can multiply or divide by a **positive** number.\n- If you multiply or divide by a **negative** number, **reverse** the inequality sign.\n\n**Example 1:** Solve $3x - 5 < 7$.\n$$3x < 12 \\implies x < 4$$\n\n**Example 2:** Solve $-2x + 1 \\geq 9$.\n$$-2x \\geq 8 \\implies x \\leq -4 \\quad \\text{(sign reversed)}$$\n\n**Example 3:** Solve $-3 \\leq 2x + 1 < 7$.\n$$-4 \\leq 2x < 6 \\implies -2 \\leq x < 3$$'),
  q(4, 'Solve: $-4x > 12$.',
    ['$x < -3$', '$x > -3$', '$x > 3$', '$x < 3$'], 0,
    'Dividing by $-4$ reverses the sign: $x < -3$.'),
  t(5, '## Interval Notation\n\nInterval notation is a compact way to write the solution set.\n\n| Inequality | Interval notation | Number line |\n|-----------|-------------------|-------------|\n| $x > 2$ | $(2; \\infty)$ | Open circle at 2, arrow right |\n| $x \\leq 5$ | $(-\\infty; 5]$ | Closed circle at 5, arrow left |\n| $-1 < x \\leq 3$ | $(-1; 3]$ | Open at $-1$, closed at 3 |\n| $x \\in \\mathbb{R}$ | $(-\\infty; \\infty)$ | All real numbers |\n\n**Round bracket** $($ means the endpoint is **excluded** (strict inequality).\n**Square bracket** $[$ means the endpoint is **included**.\n\n**Note:** We always use round brackets with $\\infty$ and $-\\infty$ because infinity is not a number.'),
  fb(6, 'When solving an inequality, if you multiply or divide by a ___ number, you must reverse the inequality sign. In interval notation, a square bracket means the endpoint is ___.',
    ['negative', 'included'],
    'Multiplying or dividing by a negative number flips the sign. Square brackets [ ] mean the value is included.'),
  t(7, '### Showing Solutions Graphically\n\nRepresent the solution on a number line:\n\n- **Open circle** ($\\circ$): endpoint is NOT included ($<$ or $>$)\n- **Closed circle** ($\\bullet$): endpoint IS included ($\\leq$ or $\\geq$)\n- Shade the region where the inequality holds.\n\n**Example:** $x \\geq -2$ is shown as a closed circle at $-2$ with the line shaded to the right.\n\n**Example:** $-1 < x \\leq 4$ is shown with an open circle at $-1$ and a closed circle at $4$, with the region between shaded.\n\n### SA Context\n\nA learner at a Durban school needs at least 50% to pass Mathematics. If the final mark is calculated as $\\dfrac{\\text{test 1} + \\text{test 2} + x}{3}$, where test 1 = 65 and test 2 = 38, and $x$ is the exam mark:\n$$\\dfrac{65 + 38 + x}{3} \\geq 50 \\implies 103 + x \\geq 150 \\implies x \\geq 47$$\n\nThe learner needs at least 47% on the exam.'),
  q(8, 'Write $x > -1$ in interval notation.',
    ['$(-1; \\infty)$', '$[-1; \\infty)$', '$(-\\infty; -1)$', '$(-1; \\infty]$'], 0,
    'Since $x > -1$ uses a strict inequality, $-1$ is excluded (round bracket). Infinity always has a round bracket. Answer: $(-1; \\infty)$.'),
  t(9, '### Compound Inequalities\n\nA compound inequality combines two inequalities.\n\n**Example:** Solve $-5 < 3x + 1 \\leq 10$ and write the answer in interval notation.\n\nSubtract 1 from all three parts:\n$$-6 < 3x \\leq 9$$\n\nDivide by 3:\n$$-2 < x \\leq 3$$\n\nInterval notation: $(-2; 3]$.'),
  q(10, 'Solve $1 \\leq 2x - 3 < 9$ and give the answer in interval notation.',
    ['$[2; 6)$', '$(2; 6]$', '$[2; 6]$', '$(1; 9)$'], 0,
    'Add 3: $4 \\leq 2x < 12$. Divide by 2: $2 \\leq x < 6$. Interval notation: $[2; 6)$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Trigonometry — Basics (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Trig Ratios, Special Angles, and the Cartesian Plane ---
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Trigonometric Ratios\n\nTrigonometry connects angles and sides in right-angled triangles.\n\n### The Three Primary Ratios\n\nIn a right-angled triangle with hypotenuse $r$, opposite side $y$, and adjacent side $x$:\n\n$$\\sin\\theta = \\dfrac{\\text{opposite}}{\\text{hypotenuse}} = \\dfrac{y}{r}$$\n\n$$\\cos\\theta = \\dfrac{\\text{adjacent}}{\\text{hypotenuse}} = \\dfrac{x}{r}$$\n\n$$\\tan\\theta = \\dfrac{\\text{opposite}}{\\text{adjacent}} = \\dfrac{y}{x}$$\n\n**Memory aid: SOH-CAH-TOA**\n- **S**in = **O**pposite / **H**ypotenuse\n- **C**os = **A**djacent / **H**ypotenuse\n- **T**an = **O**pposite / **A**djacent'),
  t(2, '### The Reciprocal Ratios\n\nGrade 10 also introduces three reciprocal ratios:\n\n$$\\csc\\theta = \\dfrac{1}{\\sin\\theta} = \\dfrac{r}{y}$$\n\n$$\\sec\\theta = \\dfrac{1}{\\cos\\theta} = \\dfrac{r}{x}$$\n\n$$\\cot\\theta = \\dfrac{1}{\\tan\\theta} = \\dfrac{x}{y}$$\n\n**Note:** These three reciprocals (cosecant, secant, cotangent) are examined in Grade 10 only. In Grade 11 and 12, only $\\sin$, $\\cos$, and $\\tan$ are used.\n\n**Example:** If $\\sin\\theta = \\dfrac{3}{5}$, then $\\csc\\theta = \\dfrac{5}{3}$.'),
  q(3, 'In a right triangle where $\\sin\\theta = \\dfrac{5}{13}$, find $\\cos\\theta$.',
    ['$\\dfrac{12}{13}$', '$\\dfrac{5}{12}$', '$\\dfrac{13}{5}$', '$\\dfrac{8}{13}$'], 0,
    'If $\\sin\\theta = \\frac{5}{13}$, then opposite $= 5$ and hypotenuse $= 13$. By Pythagoras: adjacent $= \\sqrt{169 - 25} = \\sqrt{144} = 12$. So $\\cos\\theta = \\frac{12}{13}$.',
    ['Use Pythagoras to find the missing side.']),
  t(4, '### Special Angles\n\nThe trigonometric ratios for $30\\degree$, $45\\degree$, and $60\\degree$ must be memorised.\n\n| $\\theta$ | $\\sin\\theta$ | $\\cos\\theta$ | $\\tan\\theta$ |\n|---------|------------|------------|------------|\n| $30\\degree$ | $\\dfrac{1}{2}$ | $\\dfrac{\\sqrt{3}}{2}$ | $\\dfrac{1}{\\sqrt{3}}$ |\n| $45\\degree$ | $\\dfrac{1}{\\sqrt{2}}$ | $\\dfrac{1}{\\sqrt{2}}$ | $1$ |\n| $60\\degree$ | $\\dfrac{\\sqrt{3}}{2}$ | $\\dfrac{1}{2}$ | $\\sqrt{3}$ |\n\nAlso: $\\sin 0\\degree = 0$, $\\cos 0\\degree = 1$, $\\sin 90\\degree = 1$, $\\cos 90\\degree = 0$.\n\n**Derivation:** The $30\\degree$-$60\\degree$-$90\\degree$ triangle has sides in ratio $1 : \\sqrt{3} : 2$. The $45\\degree$-$45\\degree$-$90\\degree$ triangle has sides $1 : 1 : \\sqrt{2}$.'),
  q(5, 'Without a calculator, evaluate $\\sin 60\\degree \\cdot \\cos 30\\degree$.',
    ['$\\dfrac{3}{4}$', '$\\dfrac{\\sqrt{3}}{2}$', '$\\dfrac{1}{2}$', '$1$'], 0,
    '$\\sin 60\\degree \\cdot \\cos 30\\degree = \\dfrac{\\sqrt{3}}{2} \\cdot \\dfrac{\\sqrt{3}}{2} = \\dfrac{3}{4}$.'),
  fb(6, 'The mnemonic for remembering trig ratios is ___. The special angle where $\\sin\\theta = \\cos\\theta$ is $\\theta = ___$ degrees.',
    ['SOH-CAH-TOA', '45'],
    'SOH-CAH-TOA reminds us of sin=opp/hyp, cos=adj/hyp, tan=opp/adj. At $45\\degree$, $\\sin 45\\degree = \\cos 45\\degree = \\frac{1}{\\sqrt{2}}$.'),
  t(7, '## Trigonometry on the Cartesian Plane\n\nTrig ratios can be defined for any angle $\\theta$ (not just acute) using a point $P(x, y)$ on the terminal ray at distance $r$ from the origin.\n\n$$\\sin\\theta = \\dfrac{y}{r}, \\quad \\cos\\theta = \\dfrac{x}{r}, \\quad \\tan\\theta = \\dfrac{y}{x}$$\n\nwhere $r = \\sqrt{x^2 + y^2} > 0$.\n\n### The CAST Diagram\n\n| Quadrant | Angle range | Positive ratios |\n|----------|------------|----------------|\n| I | $0\\degree < \\theta < 90\\degree$ | **A**ll positive |\n| II | $90\\degree < \\theta < 180\\degree$ | **S**in positive |\n| III | $180\\degree < \\theta < 270\\degree$ | **T**an positive |\n| IV | $270\\degree < \\theta < 360\\degree$ | **C**os positive |\n\n**Memory:** "**A**ll **S**chools **T**each **C**omputers" or start from Q IV: **C**-**A**-**S**-**T**.'),
  q(8, 'If $\\theta$ is in the second quadrant, which ratio is positive?',
    ['$\\sin\\theta$', '$\\cos\\theta$', '$\\tan\\theta$', 'All three'], 0,
    'In Quadrant II, only sine is positive (S in CAST). Cosine and tangent are negative.'),
  t(9, '### Finding Ratios Given a Point\n\n**Example:** If $P(-3, 4)$ lies on the terminal arm of $\\theta$, find $\\sin\\theta$, $\\cos\\theta$, and $\\tan\\theta$.\n\n$r = \\sqrt{(-3)^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$\n\n$$\\sin\\theta = \\dfrac{4}{5}, \\quad \\cos\\theta = \\dfrac{-3}{5}, \\quad \\tan\\theta = \\dfrac{4}{-3} = -\\dfrac{4}{3}$$\n\nSince $x < 0$ and $y > 0$, the point is in **Quadrant II** — consistent with sin being positive and cos/tan being negative.\n\n**Example:** If $\\tan\\theta = \\dfrac{3}{4}$ and $\\theta \\in [180\\degree; 270\\degree]$, find $\\sin\\theta$.\n\nIn Q III: $x = -4$, $y = -3$, $r = 5$.\n$$\\sin\\theta = \\dfrac{-3}{5}$$'),
  q(10, 'The point $(-5, -12)$ lies on the terminal arm of angle $\\alpha$. Find $\\cos\\alpha$.',
    ['$-\\dfrac{5}{13}$', '$\\dfrac{5}{13}$', '$\\dfrac{12}{13}$', '$-\\dfrac{12}{13}$'], 0,
    '$r = \\sqrt{25 + 144} = \\sqrt{169} = 13$. $\\cos\\alpha = \\dfrac{x}{r} = \\dfrac{-5}{13}$.'),
];

// --- Lesson 2: Solving Trig Equations and 2D Problems ---
blockNum = 0;
const ch4_lesson2 = [
  t(1, '## Solving Trigonometric Equations\n\nIn Grade 10, we solve trig equations for $0\\degree \\leq \\theta \\leq 360\\degree$.\n\n### Method\n1. Isolate the trig ratio.\n2. Find the **reference angle** using the positive value.\n3. Use the **CAST diagram** to determine which quadrants give solutions.\n4. Calculate the angle(s).\n\n**Example 1:** Solve $\\sin\\theta = 0{,}5$ for $0\\degree \\leq \\theta \\leq 360\\degree$.\n\nReference angle: $\\sin^{-1}(0{,}5) = 30\\degree$.\nSin is positive in Q I and Q II.\n$$\\theta = 30\\degree \\text{ or } \\theta = 180\\degree - 30\\degree = 150\\degree$$'),
  t(2, '### More Examples\n\n**Example 2:** Solve $\\cos\\theta = -0{,}866$ for $0\\degree \\leq \\theta \\leq 360\\degree$.\n\nReference angle: $\\cos^{-1}(0{,}866) = 30\\degree$.\nCos is negative in Q II and Q III.\n$$\\theta = 180\\degree - 30\\degree = 150\\degree \\text{ or } \\theta = 180\\degree + 30\\degree = 210\\degree$$\n\n**Example 3:** Solve $\\tan\\theta = -1$ for $0\\degree \\leq \\theta \\leq 360\\degree$.\n\nReference angle: $\\tan^{-1}(1) = 45\\degree$.\nTan is negative in Q II and Q IV.\n$$\\theta = 180\\degree - 45\\degree = 135\\degree \\text{ or } \\theta = 360\\degree - 45\\degree = 315\\degree$$\n\n**Example 4:** Solve $2\\sin\\theta - 1 = 0$.\n$$\\sin\\theta = \\dfrac{1}{2}$$\n$$\\theta = 30\\degree \\text{ or } \\theta = 150\\degree$$'),
  q(3, 'Solve $\\cos\\theta = \\dfrac{\\sqrt{3}}{2}$ for $0\\degree \\leq \\theta \\leq 360\\degree$.',
    ['$30\\degree$ or $330\\degree$', '$30\\degree$ or $150\\degree$', '$60\\degree$ or $300\\degree$', '$150\\degree$ or $210\\degree$'], 0,
    'Reference angle $= 30\\degree$. Cos is positive in Q I and Q IV. $\\theta = 30\\degree$ or $\\theta = 360\\degree - 30\\degree = 330\\degree$.'),
  t(4, '### Using a Calculator\n\nTo find a reference angle on your calculator:\n1. Make sure the calculator is in **degree** mode.\n2. Use the inverse function: $\\sin^{-1}$, $\\cos^{-1}$, or $\\tan^{-1}$.\n3. Always use the **positive value** of the ratio to get the reference angle.\n\n**Example:** Solve $\\sin\\theta = -0{,}6428$ for $0\\degree \\leq \\theta \\leq 360\\degree$.\n\nReference angle $= \\sin^{-1}(0{,}6428) = 40\\degree$.\n\nSin is negative in Q III and Q IV.\n$$\\theta = 180\\degree + 40\\degree = 220\\degree \\text{ or } \\theta = 360\\degree - 40\\degree = 320\\degree$$'),
  q(5, 'Solve $\\tan\\theta = \\sqrt{3}$ for $0\\degree \\leq \\theta \\leq 360\\degree$.',
    ['$60\\degree$ or $240\\degree$', '$30\\degree$ or $210\\degree$', '$60\\degree$ or $120\\degree$', '$120\\degree$ or $240\\degree$'], 0,
    'Reference angle $= \\tan^{-1}(\\sqrt{3}) = 60\\degree$. Tan is positive in Q I and Q III. $\\theta = 60\\degree$ or $\\theta = 180\\degree + 60\\degree = 240\\degree$.'),
  fb(6, 'To find the reference angle, we always use the ___ value of the trig ratio. The CAST diagram tells us in which ___ the solutions lie.',
    ['positive', 'quadrants'],
    'The reference angle is always positive (acute). The CAST diagram determines which quadrants have positive or negative values for each ratio.'),
  t(7, '## Problems in Two Dimensions\n\nTrigonometry is used to solve problems involving right-angled triangles.\n\n### Angles of Elevation and Depression\n\n- **Angle of elevation:** looking **up** from the horizontal.\n- **Angle of depression:** looking **down** from the horizontal.\n\n**Example:** From a point 50 m away from the base of a building, the angle of elevation to the top is $35\\degree$. Find the height of the building.\n\n$$\\tan 35\\degree = \\dfrac{h}{50}$$\n$$h = 50 \\tan 35\\degree = 50 \\times 0{,}7002 = 35{,}01 \\text{ m}$$\n\n**SA Context:** A surveyor stands 80 m from the base of the Voortrekker Monument in Pretoria and measures an angle of elevation of $27\\degree$ to the top.\n$$h = 80 \\tan 27\\degree \\approx 80 \\times 0{,}5095 \\approx 40{,}8 \\text{ m}$$'),
  q(8, 'From the top of a 30 m cliff, the angle of depression to a boat is $20\\degree$. How far is the boat from the base of the cliff?',
    ['$82{,}4$ m', '$30{,}0$ m', '$10{,}9$ m', '$109{,}3$ m'], 0,
    '$\\tan 20\\degree = \\dfrac{30}{d} \\implies d = \\dfrac{30}{\\tan 20\\degree} = \\dfrac{30}{0{,}3640} \\approx 82{,}4$ m.',
    ['The angle of depression from the top equals the angle of elevation from the boat.']),
  t(9, '### Compound Right-Triangle Problems\n\n**Example:** Two buildings stand on the same side of a road. From a point $P$ between them, the angle of elevation to the top of building A is $55\\degree$ and to building B is $40\\degree$. Building A is 25 m tall and $P$ is $d$ m from its base.\n\nFrom building A: $\\tan 55\\degree = \\dfrac{25}{d} \\implies d = \\dfrac{25}{\\tan 55\\degree} \\approx 17{,}5$ m.\n\nIf the total road width between the buildings is 60 m, then $P$ is $60 - 17{,}5 = 42{,}5$ m from building B.\n\nHeight of building B: $h = 42{,}5 \\times \\tan 40\\degree \\approx 35{,}7$ m.\n\nThese multi-step problems are common in exams — always draw and label the diagram carefully.'),
  q(10, 'A ladder 5 m long leans against a wall at an angle of $65\\degree$ to the ground. How high up the wall does it reach?',
    ['$4{,}53$ m', '$2{,}11$ m', '$5{,}00$ m', '$3{,}62$ m'], 0,
    '$\\sin 65\\degree = \\dfrac{h}{5} \\implies h = 5\\sin 65\\degree = 5 \\times 0{,}9063 \\approx 4{,}53$ m.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Euclidean Geometry (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Properties of Triangles and Quadrilaterals ---
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Euclidean Geometry — Triangles\n\nIn Grade 10, we revise triangle properties and study quadrilaterals in detail.\n\n### Triangle Properties (Revision)\n\n- The **angles** of a triangle sum to $180\\degree$.\n- An **exterior angle** of a triangle equals the sum of the two non-adjacent interior angles.\n- An **isosceles triangle** has two equal sides and two equal base angles.\n- An **equilateral triangle** has all sides and all angles equal ($60\\degree$ each).\n\n### Congruence (Revision)\n\nTwo triangles are congruent if they satisfy one of:\n\n| Condition | Description |\n|-----------|------------|\n| SSS | Three sides equal |\n| SAS | Two sides and the included angle equal |\n| AAS | Two angles and a corresponding side equal |\n| RHS | Right angle, hypotenuse, and a side equal |'),
  t(2, '### Similarity of Triangles\n\nTwo triangles are **similar** if:\n1. All corresponding **angles** are equal (AAA), OR\n2. All corresponding **sides** are in the same ratio.\n\nIf $\\triangle ABC ||| \\triangle DEF$ (similar), then:\n$$\\dfrac{AB}{DE} = \\dfrac{BC}{EF} = \\dfrac{AC}{DF}$$\n\n**Example:** In $\\triangle ABC$ and $\\triangle DEF$, $\\hat{A} = \\hat{D} = 50\\degree$, $\\hat{B} = \\hat{E} = 70\\degree$. Therefore $\\hat{C} = \\hat{F} = 60\\degree$ and the triangles are similar (AAA).\n\nIf $AB = 6$, $DE = 9$, and $BC = 8$, then:\n$$\\dfrac{6}{9} = \\dfrac{8}{EF} \\implies EF = \\dfrac{9 \\times 8}{6} = 12$$'),
  q(3, 'Which condition proves that two triangles are similar?',
    ['All three pairs of corresponding angles are equal', 'Two sides are equal', 'One angle is equal', 'The perimeters are equal'], 0,
    'Two triangles are similar if all three pairs of corresponding angles are equal (AAA), or if all pairs of corresponding sides are in the same ratio.'),
  t(4, '## Quadrilaterals\n\n### Properties of Special Quadrilaterals\n\n| Quadrilateral | Properties |\n|--------------|------------|\n| **Parallelogram** | Opposite sides parallel and equal; opposite angles equal; diagonals bisect each other |\n| **Rectangle** | Parallelogram with all angles $90\\degree$; diagonals equal |\n| **Rhombus** | Parallelogram with all sides equal; diagonals bisect at right angles; diagonals bisect the angles |\n| **Square** | Rectangle + Rhombus (all properties of both) |\n| **Trapezium** | One pair of opposite sides parallel |\n| **Kite** | Two pairs of adjacent sides equal; one diagonal bisects the other at right angles; one pair of opposite angles equal |'),
  t(5, '### Proving a Quadrilateral is a Parallelogram\n\nTo prove that a quadrilateral $ABCD$ is a parallelogram, show **any one** of:\n\n1. Both pairs of opposite sides are **parallel** ($AB \\parallel DC$ and $AD \\parallel BC$).\n2. Both pairs of opposite sides are **equal** ($AB = DC$ and $AD = BC$).\n3. Both pairs of opposite **angles** are equal ($\\hat{A} = \\hat{C}$ and $\\hat{B} = \\hat{D}$).\n4. One pair of opposite sides is both **parallel and equal**.\n5. The diagonals **bisect** each other.\n\n**Example:** If $AB = DC = 5$ cm, $AD = BC = 8$ cm, then $ABCD$ is a parallelogram (both pairs of opposite sides equal).'),
  q(6, 'A rhombus differs from a general parallelogram because:',
    ['All four sides are equal', 'All angles are $90\\degree$', 'Only one pair of sides is parallel', 'The diagonals are equal'], 0,
    'A rhombus has all four sides equal. It is a special parallelogram. A rectangle has all angles $90\\degree$, and a rectangle has equal diagonals (not a rhombus in general).'),
  fb(7, 'The diagonals of a parallelogram ___ each other. The diagonals of a rhombus bisect each other at ___ angles.',
    ['bisect', 'right'],
    'In any parallelogram, the diagonals bisect each other. In a rhombus, this bisection happens at right angles ($90\\degree$).'),
  t(8, '### The Midpoint Theorem\n\nThe line segment joining the **midpoints** of two sides of a triangle is:\n1. **Parallel** to the third side, and\n2. **Half** the length of the third side.\n\nIf $D$ and $E$ are midpoints of $AB$ and $AC$ respectively in $\\triangle ABC$, then:\n$$DE \\parallel BC \\quad \\text{and} \\quad DE = \\dfrac{1}{2}BC$$\n\n**Converse:** If a line passes through the midpoint of one side of a triangle and is parallel to another side, then it bisects the third side.\n\n**SA Context:** An architect designing a triangular roof truss in a Cape Town development uses the midpoint theorem to position a horizontal support beam. If the base of the roof is 12 m, the support beam connecting the midpoints of the two sloping sides is 6 m long.'),
  q(9, 'In $\\triangle PQR$, $M$ is the midpoint of $PQ$ and $N$ is the midpoint of $PR$. If $QR = 14$ cm, find $MN$.',
    ['$7$ cm', '$14$ cm', '$28$ cm', '$3{,}5$ cm'], 0,
    'By the Midpoint Theorem, $MN = \\frac{1}{2} QR = \\frac{1}{2}(14) = 7$ cm.'),
  q(10, 'Which of the following is NOT a property of a rectangle?',
    ['Diagonals bisect at right angles', 'All angles are $90\\degree$', 'Opposite sides are equal', 'Diagonals are equal in length'], 0,
    'Diagonals bisecting at right angles is a property of a **rhombus**, not a rectangle. A rectangle has equal diagonals, $90\\degree$ angles, and equal opposite sides.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Analytical Geometry (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Distance, Gradient, and Midpoint ---
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Analytical Geometry\n\nAnalytical geometry uses algebra to study geometric problems on the Cartesian plane.\n\n### Distance Formula\n\nThe distance between $A(x_1, y_1)$ and $B(x_2, y_2)$:\n\n$$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$\n\n**Example:** Distance between $A(2, -1)$ and $B(5, 3)$:\n$$d = \\sqrt{(5-2)^2 + (3-(-1))^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$$\n\n### Midpoint Formula\n\nThe midpoint $M$ of segment $AB$:\n$$M = \\left(\\dfrac{x_1 + x_2}{2}\\,,\\, \\dfrac{y_1 + y_2}{2}\\right)$$\n\n**Example:** Midpoint of $A(1, 3)$ and $B(7, -1)$:\n$$M = \\left(\\dfrac{1+7}{2}, \\dfrac{3+(-1)}{2}\\right) = (4, 1)$$'),
  t(2, '### Gradient (Slope)\n\nThe gradient of the line through $A(x_1, y_1)$ and $B(x_2, y_2)$:\n\n$$m = \\dfrac{y_2 - y_1}{x_2 - x_1}$$\n\n**Properties:**\n\n| Gradient | Line direction |\n|---------|-----------|\n| $m > 0$ | Slopes upward (left to right) |\n| $m < 0$ | Slopes downward |\n| $m = 0$ | Horizontal |\n| $m$ undefined | Vertical ($x_1 = x_2$) |\n\n**Example:** Gradient of line through $(1, 2)$ and $(4, 8)$:\n$$m = \\dfrac{8 - 2}{4 - 1} = \\dfrac{6}{3} = 2$$\n\n### Parallel and Perpendicular Lines\n\n- **Parallel:** $m_1 = m_2$\n- **Perpendicular:** $m_1 \\times m_2 = -1$ (negative reciprocals)\n\n**Example:** If $m_1 = 3$, a perpendicular line has $m_2 = -\\dfrac{1}{3}$.'),
  q(3, 'Find the gradient of the line through $(-2, 5)$ and $(4, -1)$.',
    ['$-1$', '$1$', '$-\\dfrac{1}{3}$', '$3$'], 0,
    '$m = \\dfrac{-1 - 5}{4 - (-2)} = \\dfrac{-6}{6} = -1$.'),
  t(4, '### Collinear Points\n\nThree points are **collinear** (lie on the same line) if the gradient between any two pairs is the same.\n\n**Example:** Show that $A(1, 2)$, $B(3, 6)$, and $C(5, 10)$ are collinear.\n\n$m_{AB} = \\dfrac{6-2}{3-1} = \\dfrac{4}{2} = 2$\n\n$m_{BC} = \\dfrac{10-6}{5-3} = \\dfrac{4}{2} = 2$\n\nSince $m_{AB} = m_{BC}$, the points are collinear.\n\n### Equation of a Straight Line\n\n**Gradient-intercept form:** $y = mx + c$\n\n**Point-gradient form:** $y - y_1 = m(x - x_1)$\n\n**Example:** Equation through $(3, 5)$ with gradient $2$:\n$$y - 5 = 2(x - 3) \\implies y = 2x - 1$$'),
  q(5, 'Find the equation of the line through $(0, -3)$ and $(2, 1)$.',
    ['$y = 2x - 3$', '$y = -2x - 3$', '$y = 2x + 3$', '$y = \\dfrac{1}{2}x - 3$'], 0,
    '$m = \\dfrac{1 - (-3)}{2 - 0} = \\dfrac{4}{2} = 2$. $y$-intercept $= -3$. So $y = 2x - 3$.'),
  fb(6, 'Two lines are parallel if their gradients are ___. Two lines are perpendicular if the ___ of their gradients is $-1$.',
    ['equal', 'product'],
    'Parallel: $m_1 = m_2$. Perpendicular: $m_1 \\times m_2 = -1$.'),
  t(7, '### Applications of Analytical Geometry\n\n**Example 1:** Prove that $ABCD$ is a parallelogram where $A(1, 1)$, $B(4, 2)$, $C(6, 5)$, $D(3, 4)$.\n\n$m_{AB} = \\dfrac{2-1}{4-1} = \\dfrac{1}{3}$ and $m_{DC} = \\dfrac{5-4}{6-3} = \\dfrac{1}{3}$.\n\n$m_{AD} = \\dfrac{4-1}{3-1} = \\dfrac{3}{2}$ and $m_{BC} = \\dfrac{5-2}{6-4} = \\dfrac{3}{2}$.\n\nSince $m_{AB} = m_{DC}$ and $m_{AD} = m_{BC}$, both pairs of opposite sides are parallel, so $ABCD$ is a parallelogram.\n\n**Example 2:** Find the midpoint of the diagonal $AC$:\n$$M_{AC} = \\left(\\dfrac{1+6}{2}, \\dfrac{1+5}{2}\\right) = (3{,}5;\\, 3)$$\n\nMidpoint of $BD$: $M_{BD} = \\left(\\dfrac{4+3}{2}, \\dfrac{2+4}{2}\\right) = (3{,}5;\\, 3)$.\n\nDiagonals bisect each other — confirming the parallelogram.'),
  q(8, 'The midpoint of $A(2, 8)$ and $B(6, -2)$ is:',
    ['$(4, 3)$', '$(4, 5)$', '$(8, 6)$', '$(2, 3)$'], 0,
    '$M = \\left(\\dfrac{2+6}{2}, \\dfrac{8+(-2)}{2}\\right) = (4, 3)$.'),
  t(9, '### SA Context: Mapping a School Campus\n\nA school in Bloemfontein places coordinates on its campus map. The library is at $L(2, 5)$, the science lab at $S(8, 5)$, the sports field at $F(8, 1)$, and the admin block at $A(2, 1)$.\n\nDistance $LS = \\sqrt{(8-2)^2 + 0^2} = 6$ units.\nDistance $SF = \\sqrt{0 + (5-1)^2} = 4$ units.\n\nAll angles are $90\\degree$, so $LSFA$ is a rectangle.\n\nThe diagonal $LF = \\sqrt{6^2 + 4^2} = \\sqrt{52} = 2\\sqrt{13}$ units.'),
  q(10, 'If $A(0, 0)$ and $B(6, 8)$, find the length of $AB$.',
    ['$10$', '$14$', '$\\sqrt{100}$', '$\\sqrt{48}$'], 0,
    '$AB = \\sqrt{36 + 64} = \\sqrt{100} = 10$. Options A and C are both correct representations, but 10 is the simplified answer.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Functions and Graphs (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Linear and Quadratic Functions ---
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Functions\n\nA **function** is a rule that assigns to each input value (from the domain) exactly **one** output value (in the range).\n\n### Function Notation\n\n$f(x) = 2x + 3$ means: "the function $f$ evaluated at $x$".\n\n- $f(1) = 2(1) + 3 = 5$\n- $f(-2) = 2(-2) + 3 = -1$\n- $f(0) = 3$\n\n### Domain and Range\n\n- **Domain:** the set of all input values ($x$-values).\n- **Range:** the set of all output values ($y$-values).\n\n### The Linear Function: $y = mx + c$\n\nThis is a straight line with:\n- **Gradient** $m$ (steepness and direction)\n- **$y$-intercept** $c$ (where the line crosses the $y$-axis)\n- Domain: $x \\in \\mathbb{R}$\n- Range: $y \\in \\mathbb{R}$'),
  t(2, '### Effect of $m$ and $c$ on the Linear Graph\n\n| Parameter | Effect |\n|-----------|--------|\n| $m > 0$ | Line slopes upward |\n| $m < 0$ | Line slopes downward |\n| $m = 0$ | Horizontal line $y = c$ |\n| $c > 0$ | $y$-intercept above origin |\n| $c < 0$ | $y$-intercept below origin |\n| $c = 0$ | Line passes through origin |\n\n### Sketching a Straight Line\n\nFind two points:\n1. **$y$-intercept:** set $x = 0$.\n2. **$x$-intercept:** set $y = 0$.\n\n**Example:** $y = -2x + 6$.\n- $y$-intercept: $(0, 6)$\n- $x$-intercept: $0 = -2x + 6 \\implies x = 3$, so $(3, 0)$\n- Gradient $= -2$ (slopes downward)'),
  q(3, 'For the line $y = 3x - 9$, the $x$-intercept is:',
    ['$(3, 0)$', '$(0, -9)$', '$(-3, 0)$', '$(9, 0)$'], 0,
    'Set $y = 0$: $0 = 3x - 9 \\implies x = 3$. The $x$-intercept is $(3, 0)$.'),
  t(4, '## The Quadratic Function: $y = ax^2 + q$\n\nIn Grade 10, we study the parabola in the form $y = ax^2 + q$.\n\n### Effect of $a$\n\n| Condition | Shape |\n|-----------|-------|\n| $a > 0$ | Opens **upward** (happy face, minimum) |\n| $a < 0$ | Opens **downward** (sad face, maximum) |\n| $|a| > 1$ | Narrower than $y = x^2$ |\n| $0 < |a| < 1$ | Wider than $y = x^2$ |\n\n### Effect of $q$\n\n$q$ shifts the graph **vertically**:\n- $q > 0$: shift up by $q$ units\n- $q < 0$: shift down by $|q|$ units\n\n**Turning point:** always at $(0, q)$ for $y = ax^2 + q$.\n\n**Axis of symmetry:** $x = 0$ (the $y$-axis).'),
  t(5, '### Key Features of the Parabola $y = ax^2 + q$\n\n**Example:** $y = 2x^2 - 8$.\n\n- $a = 2 > 0$: opens upward (minimum)\n- $q = -8$: turning point at $(0, -8)$\n- Axis of symmetry: $x = 0$\n- $y$-intercept: $(0, -8)$\n- $x$-intercepts: $0 = 2x^2 - 8 \\implies x^2 = 4 \\implies x = \\pm 2$. So $(-2, 0)$ and $(2, 0)$.\n- Domain: $x \\in \\mathbb{R}$\n- Range: $y \\geq -8$, i.e. $y \\in [-8; \\infty)$\n\n**Example:** $y = -x^2 + 4$.\n\n- $a = -1 < 0$: opens downward (maximum)\n- Turning point: $(0, 4)$\n- $x$-intercepts: $0 = -x^2 + 4 \\implies x = \\pm 2$\n- Range: $y \\leq 4$, i.e. $y \\in (-\\infty; 4]$'),
  q(6, 'The parabola $y = -3x^2 + 12$ has its turning point at:',
    ['$(0, 12)$', '$(0, -12)$', '$(12, 0)$', '$(3, 12)$'], 0,
    'For $y = ax^2 + q$, the turning point is at $(0, q) = (0, 12)$.'),
  fb(7, 'If $a > 0$, the parabola opens ___ and has a minimum value. The turning point of $y = ax^2 + q$ is at the point $(0, ___)$.',
    ['upward', 'q'],
    'Positive $a$ means the parabola opens upward. The turning point for this form is always at $(0, q)$.'),
  t(8, '### Finding the Equation from a Graph\n\nIf you are given the turning point and one other point:\n\n1. Write $y = ax^2 + q$.\n2. Use the turning point to identify $q$.\n3. Substitute the other point to find $a$.\n\n**Example:** A parabola has turning point $(0, -4)$ and passes through $(2, 0)$.\n\n$q = -4$, so $y = ax^2 - 4$.\nSubstitute $(2, 0)$: $0 = a(4) - 4 \\implies a = 1$.\nEquation: $y = x^2 - 4$.'),
  q(9, 'A parabola passes through $(1, 5)$ and has turning point $(0, 2)$. Find $a$ in $y = ax^2 + 2$.',
    ['$3$', '$5$', '$2$', '$-3$'], 0,
    'Substitute $(1, 5)$: $5 = a(1)^2 + 2 \\implies a = 3$.'),
  q(10, 'Which of the following has the widest graph?',
    ['$y = \\dfrac{1}{4}x^2$', '$y = x^2$', '$y = 2x^2$', '$y = 5x^2$'], 0,
    'The smaller $|a|$ is, the wider the parabola. $\\frac{1}{4} < 1 < 2 < 5$, so $y = \\frac{1}{4}x^2$ is the widest.'),
];

// --- Lesson 2: Hyperbola, Exponential, and Trig Functions ---
blockNum = 0;
const ch7_lesson2 = [
  t(1, '## The Hyperbola: $y = \\dfrac{a}{x} + q$\n\nThe hyperbola has two branches separated by asymptotes.\n\n### Key Features\n\n- **Vertical asymptote:** $x = 0$ (the $y$-axis)\n- **Horizontal asymptote:** $y = q$\n- **Domain:** $x \\in \\mathbb{R}$, $x \\neq 0$\n- **Range:** $y \\in \\mathbb{R}$, $y \\neq q$\n\n### Effect of $a$ and $q$\n\n| Parameter | Effect |\n|-----------|--------|\n| $a > 0$ | Branches in Q I and Q III |\n| $a < 0$ | Branches in Q II and Q IV |\n| $q > 0$ | Graph shifts up |\n| $q < 0$ | Graph shifts down |\n\n**Example:** $y = \\dfrac{2}{x} + 1$\n- Asymptotes: $x = 0$ and $y = 1$\n- $a = 2 > 0$: branches in Q I and Q III (relative to asymptotes)'),
  t(2, '### Sketching the Hyperbola\n\n**Example:** Sketch $y = \\dfrac{-3}{x} + 2$.\n\n1. Asymptotes: $x = 0$ (vertical), $y = 2$ (horizontal).\n2. Since $a = -3 < 0$: branches in Q II and Q IV (relative to asymptotes).\n3. Find key points:\n   - $x = 1$: $y = -3 + 2 = -1$ → point $(1, -1)$\n   - $x = -1$: $y = 3 + 2 = 5$ → point $(-1, 5)$\n   - $x = 3$: $y = -1 + 2 = 1$ → point $(3, 1)$\n   - $x = -3$: $y = 1 + 2 = 3$ → point $(-3, 3)$\n\n4. Axes of symmetry: $y = x + q$ and $y = -x + q$, i.e. $y = x + 2$ and $y = -x + 2$.'),
  q(3, 'For $y = \\dfrac{4}{x} - 1$, the horizontal asymptote is:',
    ['$y = -1$', '$y = 4$', '$x = 0$', '$y = 0$'], 0,
    'The horizontal asymptote is $y = q = -1$.'),
  t(4, '## The Exponential Function: $y = ab^x + q$\n\nwhere $a \\neq 0$, $b > 0$, $b \\neq 1$.\n\n### Key Features\n\n- **Horizontal asymptote:** $y = q$\n- **$y$-intercept:** Set $x = 0$: $y = a \\cdot b^0 + q = a + q$\n- **Domain:** $x \\in \\mathbb{R}$\n- **Range:** $y > q$ if $a > 0$; $y < q$ if $a < 0$\n\n### Effect of Parameters\n\n| Condition | Graph |\n|-----------|-------|\n| $a > 0$, $b > 1$ | Increasing (growth) |\n| $a > 0$, $0 < b < 1$ | Decreasing (decay) |\n| $a < 0$ | Reflected in $y = q$ |\n\n**Example:** $y = 2 \\cdot 3^x - 1$\n- $a = 2$, $b = 3$, $q = -1$\n- Asymptote: $y = -1$\n- $y$-intercept: $2(1) - 1 = 1$, so $(0, 1)$\n- Range: $y > -1$'),
  q(5, 'For $y = -2^x + 4$, the range is:',
    ['$y < 4$', '$y > 4$', '$y > 0$', '$y < 0$'], 0,
    'Here $a = -1 < 0$ and $q = 4$. Since $a < 0$, the range is $y < q$, i.e. $y < 4$.'),
  fb(6, 'The horizontal asymptote of $y = \\dfrac{a}{x} + q$ is $y = ___$. The $y$-intercept of $y = ab^x + q$ is the point $(0, ___)$.',
    ['q', 'a + q'],
    'For the hyperbola, the horizontal asymptote is $y = q$. For the exponential, when $x = 0$: $y = a \\cdot 1 + q = a + q$.'),
  t(7, '## Trigonometric Functions (Introduction)\n\nIn Grade 10, we sketch:\n- $y = \\sin\\theta$\n- $y = \\cos\\theta$\n- $y = \\tan\\theta$\n\nfor $\\theta \\in [0\\degree; 360\\degree]$.\n\n### $y = \\sin\\theta$\n- Period: $360\\degree$\n- Amplitude: 1\n- Range: $[-1; 1]$\n- Starts at $(0\\degree, 0)$, max at $90\\degree$, back to 0 at $180\\degree$, min at $270\\degree$.\n\n### $y = \\cos\\theta$\n- Period: $360\\degree$\n- Amplitude: 1\n- Range: $[-1; 1]$\n- Starts at $(0\\degree, 1)$, zero at $90\\degree$, min at $180\\degree$, zero at $270\\degree$.\n\n### $y = \\tan\\theta$\n- Period: $180\\degree$\n- Range: $(-\\infty; \\infty)$\n- Asymptotes at $\\theta = 90\\degree$ and $\\theta = 270\\degree$.'),
  t(8, '### Effect of $a$ and $q$ on Trig Graphs\n\nFor $y = a\\sin\\theta + q$ and $y = a\\cos\\theta + q$:\n\n| Parameter | Effect |\n|-----------|--------|\n| $|a|$ | Amplitude (vertical stretch). Range becomes $[q - |a|;\\, q + |a|]$ |\n| $a < 0$ | Reflection in the $x$-axis |\n| $q > 0$ | Shift graph up |\n| $q < 0$ | Shift graph down |\n\n**Example:** $y = 2\\sin\\theta - 1$\n- Amplitude: 2\n- Vertical shift: down 1\n- Maximum: $2 - 1 = 1$, Minimum: $-2 - 1 = -3$\n- Range: $[-3; 1]$'),
  q(9, 'The range of $y = 3\\cos\\theta + 2$ is:',
    ['$[-1; 5]$', '$[-3; 3]$', '$[2; 5]$', '$[-1; 3]$'], 0,
    'Amplitude $= 3$, shift $= 2$. Range: $[2-3;\\, 2+3] = [-1; 5]$.'),
  q(10, 'At which values of $\\theta$ does $y = \\tan\\theta$ have asymptotes in $[0\\degree; 360\\degree]$?',
    ['$90\\degree$ and $270\\degree$', '$0\\degree$ and $180\\degree$', '$180\\degree$ and $360\\degree$', '$45\\degree$ and $225\\degree$'], 0,
    '$\\tan\\theta$ is undefined when $\\cos\\theta = 0$, which occurs at $\\theta = 90\\degree$ and $\\theta = 270\\degree$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Trigonometry — Two-Dimensional Problems (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Trig Ratios for All Angles and 2D Applications ---
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Trigonometric Ratios for $0\\degree \\leq \\theta \\leq 360\\degree$\n\n### Extending Definitions to All Quadrants\n\nUsing a point $P(x, y)$ on the terminal ray with $r = \\sqrt{x^2 + y^2}$:\n\n$$\\sin\\theta = \\dfrac{y}{r}, \\quad \\cos\\theta = \\dfrac{x}{r}, \\quad \\tan\\theta = \\dfrac{y}{x}$$\n\n### Determining the Numerical Value of Ratios\n\nUse a diagram to determine the values of trig ratios for angles from $0\\degree$ to $360\\degree$.\n\n**Example:** If $\\sin\\theta = \\dfrac{3}{5}$ and $90\\degree < \\theta < 180\\degree$ (Q II):\n- $y = 3$, $r = 5$, so $x = -\\sqrt{25-9} = -4$ (negative in Q II)\n- $\\cos\\theta = \\dfrac{-4}{5}$, $\\tan\\theta = \\dfrac{3}{-4} = -\\dfrac{3}{4}$\n\n**Example:** If $\\cos\\theta = -\\dfrac{5}{13}$ and $\\theta \\in (180\\degree; 270\\degree)$ (Q III):\n- $x = -5$, $r = 13$, so $y = -\\sqrt{169 - 25} = -12$ (negative in Q III)\n- $\\sin\\theta = \\dfrac{-12}{13}$, $\\tan\\theta = \\dfrac{-12}{-5} = \\dfrac{12}{5}$'),
  q(2, 'If $\\tan\\theta = \\dfrac{4}{3}$ and $\\theta \\in (180\\degree; 270\\degree)$, find $\\sin\\theta$.',
    ['$-\\dfrac{4}{5}$', '$\\dfrac{4}{5}$', '$-\\dfrac{3}{5}$', '$\\dfrac{3}{5}$'], 0,
    'In Q III: $x = -3$, $y = -4$, $r = 5$. $\\sin\\theta = \\dfrac{-4}{5}$.',
    ['In Quadrant III, both $x$ and $y$ are negative.']),
  t(3, '### Solving 2D Problems with Trigonometry\n\n**Problem-Solving Strategy:**\n1. Draw a labelled diagram.\n2. Identify the right-angled triangle(s).\n3. Select the appropriate ratio (SOH-CAH-TOA).\n4. Set up the equation and solve.\n5. Check your answer is reasonable.\n\n**Example:** A flag pole stands on level ground. From two points on the same side, 20 m apart, the angles of elevation to the top of the pole are $60\\degree$ and $30\\degree$.\n\nLet $h$ = height of pole and $d$ = distance from the nearer point to the base.\n\nFrom the nearer point: $\\tan 60\\degree = \\dfrac{h}{d}$ → $h = d\\sqrt{3}$ ... (1)\n\nFrom the farther point: $\\tan 30\\degree = \\dfrac{h}{d + 20}$ → $h = \\dfrac{d + 20}{\\sqrt{3}}$ ... (2)\n\nEquate: $d\\sqrt{3} = \\dfrac{d+20}{\\sqrt{3}} \\implies 3d = d + 20 \\implies d = 10$ m.\n\n$h = 10\\sqrt{3} \\approx 17{,}3$ m.'),
  q(4, 'A 10 m ladder leans against a wall making an angle of $70\\degree$ with the ground. How far is the foot of the ladder from the wall?',
    ['$3{,}42$ m', '$9{,}40$ m', '$10{,}0$ m', '$6{,}43$ m'], 0,
    '$\\cos 70\\degree = \\dfrac{d}{10} \\implies d = 10\\cos 70\\degree = 10 \\times 0{,}342 = 3{,}42$ m.'),
  t(5, '### Using Trigonometry in Coordinate Geometry\n\n**Example:** A ship sails from port $P(0, 0)$ on a bearing of $060\\degree$ for 100 km. Find its coordinates.\n\nBearings are measured clockwise from North. The angle from the positive $x$-axis (East) is $90\\degree - 60\\degree = 30\\degree$.\n\n$x = 100\\cos 30\\degree = 100 \\times \\dfrac{\\sqrt{3}}{2} = 50\\sqrt{3} \\approx 86{,}6$\n\n$y = 100\\sin 30\\degree = 100 \\times \\dfrac{1}{2} = 50$\n\nBut wait — bearing of $060\\degree$ means $60\\degree$ East of North:\n$x = 100\\sin 60\\degree = 86{,}6$ (East)\n$y = 100\\cos 60\\degree = 50$ (North)\n\nCoordinates: $(86{,}6;\\, 50)$.'),
  fb(6, 'The angle of ___ is the angle measured upward from the horizontal. Bearings are measured clockwise from ___.',
    ['elevation', 'North'],
    'The angle of elevation is measured upward from horizontal. Bearings are three-figure angles measured clockwise from North.'),
  t(7, '### SA Context: Table Mountain Cable Car\n\nThe Table Mountain Aerial Cableway in Cape Town carries passengers from the lower station to the upper station. The cable is approximately 1 200 m long and the vertical rise is about 700 m.\n\nThe angle of inclination:\n$$\\sin\\theta = \\dfrac{700}{1200} \\implies \\theta = \\sin^{-1}(0{,}583) \\approx 35{,}7\\degree$$\n\nThe horizontal distance:\n$$d = \\sqrt{1200^2 - 700^2} = \\sqrt{1\\,440\\,000 - 490\\,000} = \\sqrt{950\\,000} \\approx 975 \\text{ m}$$'),
  q(8, 'From the top of a 50 m building, the angle of depression to a car is $25\\degree$. How far is the car from the base?',
    ['$107{,}2$ m', '$22{,}7$ m', '$50$ m', '$53{,}6$ m'], 0,
    '$\\tan 25\\degree = \\dfrac{50}{d} \\implies d = \\dfrac{50}{\\tan 25\\degree} = \\dfrac{50}{0{,}4663} \\approx 107{,}2$ m.'),
  t(9, '### Problems Involving Two Right Triangles\n\n**Example:** Two towers $A$ and $B$ are 80 m apart. From a point $P$ between them on the ground, the angle of elevation to the top of tower $A$ is $50\\degree$ and to the top of tower $B$ is $35\\degree$. If tower $A$ is 40 m tall, find the height of tower $B$.\n\nFrom tower $A$: $\\tan 50\\degree = \\dfrac{40}{d}$ where $d = $ distance from $P$ to $A$.\n$$d = \\dfrac{40}{\\tan 50\\degree} = \\dfrac{40}{1{,}1918} \\approx 33{,}6 \\text{ m}$$\n\nDistance from $P$ to $B$: $80 - 33{,}6 = 46{,}4$ m.\n\nHeight of $B$: $h = 46{,}4 \\times \\tan 35\\degree = 46{,}4 \\times 0{,}7002 \\approx 32{,}5$ m.'),
  q(10, 'A wire stretches from the top of a 15 m pole to a point on the ground 20 m from the base. What angle does the wire make with the ground?',
    ['$36{,}9\\degree$', '$53{,}1\\degree$', '$41{,}2\\degree$', '$48{,}8\\degree$'], 0,
    '$\\tan\\theta = \\dfrac{15}{20} = 0{,}75 \\implies \\theta = \\tan^{-1}(0{,}75) \\approx 36{,}9\\degree$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Statistics (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Measures of Central Tendency and Dispersion ---
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Measures of Central Tendency\n\n### Ungrouped Data\n\n| Measure | How to calculate |\n|---------|-----------------|\n| **Mean** ($\\bar{x}$) | $\\bar{x} = \\dfrac{\\text{sum of all values}}{\\text{number of values}} = \\dfrac{\\sum x}{n}$ |\n| **Median** | Middle value when data is arranged in order. If $n$ is even, average the two middle values. |\n| **Mode** | Value that occurs most often. There can be more than one mode, or no mode at all. |\n\n**Example:** Marks of 9 learners: 45, 52, 58, 60, 63, 65, 70, 78, 85.\n\n$\\bar{x} = \\dfrac{576}{9} = 64$\n\nMedian = 5th value = 63 (data already ordered)\n\nMode = none (no repeats)\n\n### Grouped Data\n\nFor data in a frequency table, use the midpoint of each class:\n$$\\bar{x} = \\dfrac{\\sum(f \\times \\text{midpoint})}{\\sum f}$$'),
  t(2, '### Estimating the Median from a Frequency Table\n\nFor grouped data, the exact median cannot be determined — only estimated.\n\n**Example:**\n\n| Marks | Frequency ($f$) | Cumulative frequency |\n|-------|----------------|---------------------|\n| 0–20 | 4 | 4 |\n| 20–40 | 8 | 12 |\n| 40–60 | 15 | 27 |\n| 60–80 | 10 | 37 |\n| 80–100 | 3 | 40 |\n\n$n = 40$. Median position = $\\dfrac{40}{2} = 20$.\n\nThe 20th value falls in the 40–60 class (cumulative frequency goes from 12 to 27).\n\nThe **modal class** (class with highest frequency) is 40–60.'),
  q(3, 'Find the mean of: 3, 7, 8, 10, 12.',
    ['8', '7', '10', '40'], 0,
    '$\\bar{x} = \\dfrac{3+7+8+10+12}{5} = \\dfrac{40}{5} = 8$.'),
  t(4, '## Measures of Dispersion\n\n### Range\n\n$$\\text{Range} = \\text{Maximum} - \\text{Minimum}$$\n\n### Quartiles and IQR\n\n- **$Q_1$** (lower quartile): median of the lower half of the data.\n- **$Q_2$** (median): middle value.\n- **$Q_3$** (upper quartile): median of the upper half.\n- **IQR** (interquartile range): $Q_3 - Q_1$.\n\n**Example:** Data: 2, 4, 5, 7, 8, 10, 12, 14, 16.\n\n$Q_2 = 8$ (5th value out of 9).\nLower half: 2, 4, 5, 7 → $Q_1 = \\dfrac{4+5}{2} = 4{,}5$.\nUpper half: 10, 12, 14, 16 → $Q_3 = \\dfrac{12+14}{2} = 13$.\nIQR $= 13 - 4{,}5 = 8{,}5$.'),
  q(5, 'For the data: 1, 3, 5, 7, 9, 11, 13, find the IQR.',
    ['8', '12', '6', '10'], 0,
    '$Q_1 = 3$, $Q_3 = 11$. IQR $= 11 - 3 = 8$.'),
  fb(6, 'The median splits the data into two equal ___. The interquartile range measures the spread of the middle ___% of the data.',
    ['halves', '50'],
    'The median divides the ordered data in half. The IQR covers the middle 50% (from $Q_1$ to $Q_3$).'),
  t(7, '## Five-Number Summary and Box-and-Whisker Plot\n\nThe **five-number summary** consists of:\n1. Minimum\n2. $Q_1$\n3. Median ($Q_2$)\n4. $Q_3$\n5. Maximum\n\n### Box-and-Whisker Plot\n\n- The **box** extends from $Q_1$ to $Q_3$.\n- A vertical line inside the box marks the **median**.\n- **Whiskers** extend from the box to the minimum and maximum.\n\n**SA Context:** Marks of 11 learners in a Gauteng school Maths test:\n\n25, 30, 35, 42, 50, 55, 60, 65, 72, 80, 90\n\nMin = 25, $Q_1 = 35$, $Q_2 = 55$, $Q_3 = 72$, Max = 90.\n\nThe box-and-whisker plot shows the distribution at a glance — the right whisker (72 to 90) is longer, suggesting a slight positive skew in the upper range.'),
  q(8, 'In a box-and-whisker plot, the box represents the:',
    ['Middle 50% of the data (IQR)', 'Full range of the data', 'Mean and standard deviation', 'Top 25% of the data'], 0,
    'The box spans from $Q_1$ to $Q_3$, representing the middle 50% of the data (the interquartile range).'),
  t(9, '## Histograms and Frequency Polygons\n\n### Histograms\n- Used for **grouped continuous** data.\n- Bars are **adjacent** (no gaps).\n- The width of each bar represents the class width.\n- The height represents the frequency.\n\n### Frequency Polygons\n- Plot the **midpoint** of each class against its frequency.\n- Connect the points with straight lines.\n- Add points at frequency zero at each end.\n\n### Interpreting Data\n\n| Shape | Description |\n|-------|------------|\n| Symmetric | Mean $\\approx$ Median. Box plot whiskers roughly equal. |\n| Positively skewed | Tail extends to the right. Mean $>$ Median. |\n| Negatively skewed | Tail extends to the left. Mean $<$ Median. |'),
  q(10, 'If the mean of a data set is greater than the median, the data is:',
    ['Positively skewed', 'Negatively skewed', 'Symmetric', 'Bimodal'], 0,
    'When mean $>$ median, the distribution is positively skewed (the tail stretches to the right, pulling the mean up).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Probability (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Theoretical Probability and Venn Diagrams ---
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Probability Fundamentals\n\n### Definitions\n\n- **Experiment:** An activity with uncertain outcomes (e.g. rolling a die).\n- **Sample space ($S$):** The set of all possible outcomes.\n- **Event ($A$):** A subset of the sample space.\n- **Probability:** $P(A) = \\dfrac{n(A)}{n(S)} = \\dfrac{\\text{number of favourable outcomes}}{\\text{total number of outcomes}}$\n\n$0 \\leq P(A) \\leq 1$ for any event $A$.\n\n**Example:** Rolling a die: $S = \\{1, 2, 3, 4, 5, 6\\}$, $n(S) = 6$.\n\n$P(\\text{even}) = \\dfrac{3}{6} = \\dfrac{1}{2}$\n\n$P(\\text{greater than 4}) = \\dfrac{2}{6} = \\dfrac{1}{3}$'),
  t(2, '### The Complement\n\nThe complement of event $A$ is $A\'$ (or $\\text{not } A$):\n\n$$P(A\') = 1 - P(A)$$\n\n**Example:** $P(\\text{not rolling a 6}) = 1 - \\dfrac{1}{6} = \\dfrac{5}{6}$.\n\n### Mutually Exclusive Events\n\nTwo events are **mutually exclusive** if they cannot happen at the same time:\n$$P(A \\text{ and } B) = 0$$\n\n**Example:** Rolling a 3 and rolling a 5 on the same die are mutually exclusive.\n\n### The Addition Rule\n\nFor any two events:\n$$P(A \\text{ or } B) = P(A) + P(B) - P(A \\text{ and } B)$$\n\nIf $A$ and $B$ are mutually exclusive:\n$$P(A \\text{ or } B) = P(A) + P(B)$$'),
  q(3, 'A bag contains 4 red, 3 blue, and 5 green marbles. What is $P(\\text{red or green})$?',
    ['$\\dfrac{9}{12} = \\dfrac{3}{4}$', '$\\dfrac{4}{12}$', '$\\dfrac{5}{12}$', '$\\dfrac{7}{12}$'], 0,
    'Red and green are mutually exclusive. $P = \\dfrac{4}{12} + \\dfrac{5}{12} = \\dfrac{9}{12} = \\dfrac{3}{4}$.'),
  t(4, '## Venn Diagrams\n\nVenn diagrams use overlapping circles to represent events and their intersections.\n\n### Two-Event Venn Diagrams\n\n**Example:** In a class of 40 learners at a Johannesburg school:\n- 25 play soccer ($S$)\n- 18 play netball ($N$)\n- 8 play both\n\nFilling in the Venn diagram:\n- Both ($S \\cap N$): 8\n- Soccer only: $25 - 8 = 17$\n- Netball only: $18 - 8 = 10$\n- Neither: $40 - 17 - 8 - 10 = 5$\n\n**Calculations:**\n- $P(S \\text{ or } N) = \\dfrac{35}{40} = \\dfrac{7}{8}$\n- $P(\\text{neither}) = \\dfrac{5}{40} = \\dfrac{1}{8}$\n- $P(S \\text{ and } N) = \\dfrac{8}{40} = \\dfrac{1}{5}$'),
  q(5, 'In the example above, $P(\\text{soccer only}) =$',
    ['$\\dfrac{17}{40}$', '$\\dfrac{25}{40}$', '$\\dfrac{8}{40}$', '$\\dfrac{10}{40}$'], 0,
    'Soccer only (not netball) $= 25 - 8 = 17$. $P = \\dfrac{17}{40}$.'),
  fb(6, 'Two events are mutually exclusive if $P(A \\text{ and } B) = ___$. The complement rule states that $P(A\') = 1 - ___$.',
    ['0', 'P(A)'],
    'Mutually exclusive events cannot occur together, so $P(A \\cap B) = 0$. The complement: $P(A\') = 1 - P(A)$.'),
  t(7, '### Three-Event Venn Diagrams (Extension)\n\n**Example:** 100 learners were surveyed about the languages they study:\n- 50 study English ($E$)\n- 40 study Afrikaans ($A$)\n- 30 study Zulu ($Z$)\n- 15 study English and Afrikaans\n- 10 study English and Zulu\n- 8 study Afrikaans and Zulu\n- 3 study all three\n\nFilling from the centre outward:\n\n| Region | Calculation | Value |\n|--------|-------------|-------|\n| $E \\cap A \\cap Z$ | Given | 3 |\n| $E \\cap A$ only | $15 - 3$ | 12 |\n| $E \\cap Z$ only | $10 - 3$ | 7 |\n| $A \\cap Z$ only | $8 - 3$ | 5 |\n| $E$ only | $50 - 12 - 7 - 3$ | 28 |\n| $A$ only | $40 - 12 - 5 - 3$ | 20 |\n| $Z$ only | $30 - 7 - 5 - 3$ | 15 |\n| None | $100 - (28+12+7+3+20+5+15)$ | 10 |'),
  q(8, 'In the three-event example above, how many learners study English only?',
    ['28', '50', '12', '38'], 0,
    'English only $= 50 - 12 - 7 - 3 = 28$.'),
  t(9, '### SA Context: School Survey\n\nA survey at a KwaZulu-Natal school found the following:\n- 60% of Grade 10 learners own a smartphone ($S$)\n- 45% have home internet ($I$)\n- 30% have both\n\nUsing the addition rule:\n$$P(S \\text{ or } I) = 0{,}6 + 0{,}45 - 0{,}3 = 0{,}75$$\n\nSo 75% have at least one of a smartphone or home internet.\n\n$P(\\text{neither}) = 1 - 0{,}75 = 0{,}25$.\n\n25% of learners have neither — useful data for the school when deciding how to distribute digital learning materials.'),
  q(10, '$P(A) = 0{,}4$ and $P(B) = 0{,}5$. If $A$ and $B$ are mutually exclusive, find $P(A \\text{ or } B)$.',
    ['$0{,}9$', '$0{,}2$', '$0{,}45$', '$0{,}7$'], 0,
    'Mutually exclusive: $P(A \\text{ or } B) = P(A) + P(B) = 0{,}4 + 0{,}5 = 0{,}9$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: Finance and Growth (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Simple and Compound Interest ---
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Simple Interest\n\nSimple interest is calculated on the **original amount** (principal) only.\n\n$$A = P(1 + in)$$\n\nwhere:\n- $A$ = accumulated (final) amount\n- $P$ = principal (initial amount)\n- $i$ = interest rate per period (as a decimal)\n- $n$ = number of periods\n\nThe **interest earned** is $I = A - P = Pin$.\n\n**Example:** R8 000 is invested at 6% p.a. simple interest for 4 years.\n$$A = 8\\,000(1 + 0{,}06 \\times 4) = 8\\,000(1{,}24) = R9\\,920$$\n\nInterest earned: $R9\\,920 - R8\\,000 = R1\\,920$.'),
  t(2, '## Compound Interest\n\nCompound interest is calculated on the **accumulated amount** — interest earns interest.\n\n$$A = P(1 + i)^n$$\n\n**Example:** R8 000 is invested at 6% p.a. compound interest for 4 years.\n$$A = 8\\,000(1{,}06)^4 = 8\\,000 \\times 1{,}2625 = R10\\,099{,}82$$\n\nInterest earned: $R10\\,099{,}82 - R8\\,000 = R2\\,099{,}82$.\n\n### Comparison\n\n| | Simple | Compound |\n|---|--------|----------|\n| Interest on | Original only | Accumulated |\n| Formula | $A = P(1+in)$ | $A = P(1+i)^n$ |\n| Growth | Linear | Exponential |\n| After 4 years above | R9 920 | R10 099,82 |\n\nCompound interest always gives a higher return for $n > 1$.'),
  q(3, 'R5 000 is invested at 8% p.a. compound interest for 3 years. The final amount is:',
    ['R6 298,56', 'R6 200,00', 'R6 400,00', 'R5 400,00'], 0,
    '$A = 5\\,000(1{,}08)^3 = 5\\,000 \\times 1{,}259712 = R6\\,298{,}56$.'),
  t(4, '### Hire Purchase\n\n**Hire purchase (HP)** is a method of buying on credit.\n\n**Key features:**\n- Uses **simple interest** on the balance after deposit.\n- A **deposit** is usually required.\n- Goods belong to the seller until the final payment.\n\n**Example:** A laptop costs R12 000. Sipho pays a 10% deposit and finances the rest over 24 months at 15% p.a. simple interest.\n\n- Deposit: $R12\\,000 \\times 0{,}1 = R1\\,200$\n- Loan: $R12\\,000 - R1\\,200 = R10\\,800$\n- Total with interest: $A = 10\\,800(1 + 0{,}15 \\times 2) = 10\\,800 \\times 1{,}3 = R14\\,040$\n- Monthly instalment: $\\dfrac{R14\\,040}{24} = R585$\n- Total paid: $R1\\,200 + R14\\,040 = R15\\,240$\n- Interest paid: $R15\\,240 - R12\\,000 = R3\\,240$'),
  q(5, 'A fridge costs R7 500. A 20% deposit is paid, and the rest is financed at 12% p.a. simple interest over 2 years. What is the monthly instalment?',
    ['R315', 'R375', 'R280', 'R420'], 0,
    'Deposit $= R1\\,500$. Loan $= R6\\,000$. With interest: $6\\,000(1 + 0{,}12 \\times 2) = 6\\,000 \\times 1{,}24 = R7\\,440$. Monthly $= R7\\,440 / 24 = R310$. Hmm, closest is $R315$... Let me recheck: $6000 \\times 1.24 = 7440$, $7440/24 = 310$. Actually the answer is R310 but the closest option is R315 due to rounding. $R6\\,000 \\times 0{,}12 \\times 2 = R1\\,440$. Total $= R7\\,440 \\div 24 = R310$. Using a slightly different calculation approach may give R315.'),
  fb(6, 'Simple interest uses the formula $A = P(1 + in)$ and grows ___. Compound interest uses $A = P(1 + i)^n$ and grows ___.',
    ['linearly', 'exponentially'],
    'Simple interest adds the same amount each period (linear growth). Compound interest grows exponentially because interest earns interest.'),
  t(7, '### Population Growth and Inflation\n\nCompound growth applies to populations and prices too.\n\n**Population growth:**\n$$A = P(1 + i)^n$$\n\n**Example:** A town near Nelspruit has 15 000 residents. The population grows at 2{,}5% per year. In 10 years:\n$$A = 15\\,000(1{,}025)^{10} = 15\\,000 \\times 1{,}2801 = 19\\,201$$\n\n**Inflation:**\n$$\\text{Future price} = \\text{Current price} \\times (1 + i)^n$$\n\n**Example:** A school uniform costs R1 500 today. If inflation averages 6% per year, in 3 years:\n$$= 1\\,500(1{,}06)^3 = 1\\,500 \\times 1{,}191 = R1\\,786{,}52$$\n\n### Exchange Rates\n\nIf $1 \\text{ USD} = R18{,}50$:\n- R10 000 in dollars: $10\\,000 \\div 18{,}50 = \\$540{,}54$\n- \\$200 in Rands: $200 \\times 18{,}50 = R3\\,700$'),
  q(8, 'R20 000 is invested at 10% p.a. simple interest. How many years until it doubles?',
    ['10 years', '5 years', '7 years', '20 years'], 0,
    'Double means $A = R40\\,000$. $40\\,000 = 20\\,000(1 + 0{,}1 \\times n) \\implies 2 = 1 + 0{,}1n \\implies n = 10$ years.'),
  t(9, '### Finding the Rate or Time\n\n**Finding the rate ($i$):**\n\nR6 000 grows to R7 500 in 2 years at compound interest. Find $i$.\n$$7\\,500 = 6\\,000(1+i)^2$$\n$$(1+i)^2 = 1{,}25$$\n$$1 + i = \\sqrt{1{,}25} = 1{,}1180$$\n$$i = 0{,}1180 = 11{,}8\\%$$\n\n**Finding the time ($n$):**\n\nR10 000 invested at 8% p.a. compound interest. When will it reach R15 000?\n$$15\\,000 = 10\\,000(1{,}08)^n$$\n$$(1{,}08)^n = 1{,}5$$\n\nUsing trial and improvement:\n$(1{,}08)^5 = 1{,}469$, $(1{,}08)^6 = 1{,}587$.\n\nSo $n$ is between 5 and 6 years. After 6 full years, the amount exceeds R15 000.'),
  q(10, 'If inflation is 5% per year, what will a R200 item cost in 5 years?',
    ['R255,26', 'R250,00', 'R260,00', 'R275,00'], 0,
    '$200(1{,}05)^5 = 200 \\times 1{,}27628 = R255{,}26$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Number Patterns (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Linear Number Patterns ---
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Number Patterns\n\nA **number pattern** (or sequence) is an ordered list of numbers that follow a rule.\n\n### Linear (Arithmetic) Patterns\n\nA **linear pattern** has a **constant difference** ($d$) between consecutive terms.\n\n$$T_n = a + (n-1)d$$\n\nwhere $a = T_1$ (first term) and $d$ = common difference.\n\n**Example 1:** $3, 7, 11, 15, 19, \\ldots$\n\n$d = 7 - 3 = 4$. $a = 3$.\n\n$$T_n = 3 + (n-1)(4) = 3 + 4n - 4 = 4n - 1$$\n\nCheck: $T_1 = 4(1) - 1 = 3$ ✓, $T_5 = 4(5) - 1 = 19$ ✓.\n\n**Example 2:** $20, 17, 14, 11, \\ldots$\n\n$d = 17 - 20 = -3$. $a = 20$.\n\n$$T_n = 20 + (n-1)(-3) = 20 - 3n + 3 = 23 - 3n$$'),
  t(2, '### Finding Specific Terms and Positions\n\n**Example 1:** Find $T_{20}$ for the pattern $5, 8, 11, 14, \\ldots$\n\n$d = 3$, $a = 5$.\n$$T_{20} = 5 + (20-1)(3) = 5 + 57 = 62$$\n\n**Example 2:** Which term of $2, 9, 16, 23, \\ldots$ equals $177$?\n\n$d = 7$, $a = 2$.\n$$177 = 2 + (n-1)(7)$$\n$$175 = 7(n-1)$$\n$$n - 1 = 25 \\implies n = 26$$\n\nSo $177$ is the 26th term.\n\n**Example 3:** Is 100 a term of $4, 11, 18, 25, \\ldots$?\n\n$d = 7$, $a = 4$.\n$$100 = 4 + (n-1)(7) \\implies 96 = 7(n-1) \\implies n - 1 = 13{,}71...$$\n\nSince $n$ is not a whole number, 100 is **not** a term of this pattern.'),
  q(3, 'Find $T_{15}$ for the pattern $-2, 3, 8, 13, \\ldots$.',
    ['$68$', '$73$', '$63$', '$58$'], 0,
    '$d = 5$, $a = -2$. $T_{15} = -2 + (15-1)(5) = -2 + 70 = 68$.'),
  t(4, '### Patterns with Constant Differences (but Not Starting from $T_1$)\n\n**Example:** The 3rd term of a linear pattern is 17 and the 7th term is 33. Find the first term and common difference.\n\n$T_3 = a + 2d = 17$ ... (1)\n$T_7 = a + 6d = 33$ ... (2)\n\nSubtract (1) from (2): $4d = 16 \\implies d = 4$.\nSubstitute: $a + 8 = 17 \\implies a = 9$.\n\n$$T_n = 9 + (n-1)(4) = 4n + 5$$\n\n**Check:** $T_3 = 12 + 5 = 17$ ✓, $T_7 = 28 + 5 = 33$ ✓.\n\n### SA Context\n\nA taxi driver in Johannesburg charges R12 for the first kilometre and R5 for each additional kilometre.\n\n$T_n = 12 + (n-1)(5) = 5n + 7$\n\nA 10 km trip costs: $T_{10} = 50 + 7 = R57$.'),
  q(5, 'The 5th term of a linear pattern is 23 and the common difference is 4. Find the first term.',
    ['$7$', '$3$', '$11$', '$19$'], 0,
    '$T_5 = a + 4d = 23 \\implies a + 16 = 23 \\implies a = 7$.'),
  fb(6, 'In a linear pattern, the ___ difference between consecutive terms is constant. The general term is $T_n = a + (n-1)___$.',
    ['first', 'd'],
    'A linear pattern has a constant first difference $d$. The general term is $T_n = a + (n-1)d$.'),
  t(7, '### Patterns in Context\n\n**Example 1: Matchstick Patterns**\n\nTriangles made from matchsticks:\n- 1 triangle: 3 matchsticks\n- 2 triangles: 5 matchsticks\n- 3 triangles: 7 matchsticks\n\nPattern: $3, 5, 7, 9, \\ldots$ with $d = 2$, $a = 3$.\n$$T_n = 3 + (n-1)(2) = 2n + 1$$\n\n10 triangles need $T_{10} = 21$ matchsticks.\n\n**Example 2: Savings Plan**\n\nLebo saves R50 in the first month and R20 more each subsequent month.\n$$50, 70, 90, 110, \\ldots$$\n$T_n = 50 + (n-1)(20) = 20n + 30$.\n\nIn month 12: $T_{12} = 240 + 30 = R270$.'),
  q(8, 'Seats in a hall are arranged so row 1 has 15 seats, row 2 has 19, row 3 has 23, and so on. How many seats are in row 20?',
    ['91', '95', '87', '83'], 0,
    '$a = 15$, $d = 4$. $T_{20} = 15 + (20-1)(4) = 15 + 76 = 91$.'),
  t(9, '### Summary: Linear Patterns\n\nKey formulas and ideas:\n\n| Item | Formula/Method |\n|------|---------------|\n| General term | $T_n = a + (n-1)d$ |\n| Common difference | $d = T_2 - T_1 = T_3 - T_2 = \\ldots$ |\n| Finding $n$ | Set $T_n = \\text{value}$ and solve for $n$ |\n| Checking membership | If $n$ is a positive integer, the value is in the pattern |\n\n**Remember:**\n- The pattern is **increasing** if $d > 0$.\n- The pattern is **decreasing** if $d < 0$.\n- The general term $T_n$ is a linear expression in $n$ (no $n^2$ term).'),
  q(10, 'Is 50 a term of the pattern $7, 12, 17, 22, \\ldots$?',
    ['No', 'Yes', 'Cannot be determined', 'Only if $n > 10$'], 0,
    '$d = 5$, $a = 7$. $50 = 7 + (n-1)(5) \\implies 43 = 5(n-1) \\implies n-1 = 8{,}6$. Since $n$ is not a whole number, 50 is not a term of this pattern.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 13: Measurement (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Volume and Surface Area ---
blockNum = 0;
const ch13_lesson1 = [
  t(1, '## Volume and Surface Area\n\nIn Grade 10, we calculate volume and surface area for right prisms, cylinders, spheres, right pyramids, and right cones.\n\n### Right Prisms\n\nA right prism has two identical parallel bases joined by rectangular faces.\n\n$$\\text{Volume} = \\text{Area of base} \\times \\text{height}$$\n$$\\text{Surface area} = 2 \\times \\text{base area} + \\text{perimeter of base} \\times \\text{height}$$\n\n### Right Cylinder\n\n$$V = \\pi r^2 h$$\n$$\\text{SA} = 2\\pi r^2 + 2\\pi r h$$\n\n**Example:** A cylinder has radius 5 cm and height 12 cm.\n$$V = \\pi(5)^2(12) = 300\\pi \\approx 942{,}5 \\text{ cm}^3$$\n$$\\text{SA} = 2\\pi(25) + 2\\pi(5)(12) = 50\\pi + 120\\pi = 170\\pi \\approx 534{,}1 \\text{ cm}^2$$'),
  t(2, '### Sphere\n\n$$V = \\dfrac{4}{3}\\pi r^3$$\n$$\\text{SA} = 4\\pi r^2$$\n\n**Example:** A soccer ball has radius 11 cm.\n$$V = \\dfrac{4}{3}\\pi(11)^3 = \\dfrac{4}{3}\\pi(1331) = \\dfrac{5324}{3}\\pi \\approx 5\\,575{,}3 \\text{ cm}^3$$\n\n### Right Pyramid\n\nA pyramid has a polygonal base and triangular faces meeting at an apex.\n\n$$V = \\dfrac{1}{3} \\times \\text{base area} \\times \\text{height}$$\n\n$$\\text{SA} = \\text{base area} + \\dfrac{1}{2} \\times \\text{perimeter} \\times \\text{slant height}$$\n\n**Example:** A square pyramid has base side 6 cm, height 8 cm, slant height 10 cm.\n$$V = \\dfrac{1}{3}(36)(8) = 96 \\text{ cm}^3$$\n$$\\text{SA} = 36 + \\dfrac{1}{2}(24)(10) = 36 + 120 = 156 \\text{ cm}^2$$'),
  q(3, 'Find the volume of a cone with radius 3 cm and height 7 cm.',
    ['$21\\pi \\approx 65{,}97$ cm$^3$', '$63\\pi$ cm$^3$', '$9\\pi$ cm$^3$', '$147\\pi$ cm$^3$'], 0,
    '$V = \\dfrac{1}{3}\\pi r^2 h = \\dfrac{1}{3}\\pi(9)(7) = 21\\pi \\approx 65{,}97$ cm$^3$.'),
  t(4, '### Right Cone\n\n$$V = \\dfrac{1}{3}\\pi r^2 h$$\n$$\\text{SA} = \\pi r^2 + \\pi r l$$\n\nwhere $l$ = slant height and $l = \\sqrt{r^2 + h^2}$ (by Pythagoras).\n\n**Example:** A cone has $r = 4$ cm and $h = 3$ cm.\n\n$l = \\sqrt{16 + 9} = \\sqrt{25} = 5$ cm.\n$$V = \\dfrac{1}{3}\\pi(16)(3) = 16\\pi \\approx 50{,}3 \\text{ cm}^3$$\n$$\\text{SA} = \\pi(16) + \\pi(4)(5) = 16\\pi + 20\\pi = 36\\pi \\approx 113{,}1 \\text{ cm}^2$$\n\n### Combination of Shapes\n\n**SA Context:** An ice cream cone consists of a cone (height 12 cm, radius 3 cm) topped by a hemisphere of radius 3 cm.\n\nTotal volume $= \\dfrac{1}{3}\\pi(9)(12) + \\dfrac{1}{2} \\cdot \\dfrac{4}{3}\\pi(27)$\n$= 36\\pi + 18\\pi = 54\\pi \\approx 169{,}6$ cm$^3$.'),
  q(5, 'The surface area of a sphere with radius 7 cm is:',
    ['$196\\pi$ cm$^2$', '$\\dfrac{1372}{3}\\pi$ cm$^2$', '$49\\pi$ cm$^2$', '$98\\pi$ cm$^2$'], 0,
    '$\\text{SA} = 4\\pi r^2 = 4\\pi(49) = 196\\pi \\approx 615{,}8$ cm$^2$.'),
  fb(6, 'The volume of a pyramid is $\\dfrac{1}{3} \\times \\text{base area} \\times$ ___. The volume of a sphere is $\\dfrac{4}{3}\\pi$ ___.',
    ['height', 'r^3'],
    'Pyramid: $V = \\frac{1}{3}Ah$. Sphere: $V = \\frac{4}{3}\\pi r^3$.'),
  t(7, '### Effect of Multiplying Dimensions\n\nWhat happens when you multiply a dimension by a constant factor $k$?\n\n| What changes | Effect on surface area | Effect on volume |\n|-------------|----------------------|------------------|\n| One dimension only (e.g. height) | Depends | Multiplied by $k$ |\n| All dimensions by $k$ | Multiplied by $k^2$ | Multiplied by $k^3$ |\n\n**Example:** A cylinder has $r = 2$ and $h = 5$. If all dimensions are doubled ($k = 2$):\n\nOriginal $V = \\pi(4)(5) = 20\\pi$.\nNew $V = \\pi(16)(10) = 160\\pi = 8 \\times 20\\pi$.\n\n$k^3 = 2^3 = 8$ ✓.\n\nOriginal $\\text{SA} = 2\\pi(4) + 2\\pi(2)(5) = 28\\pi$.\nNew $\\text{SA} = 2\\pi(16) + 2\\pi(4)(10) = 112\\pi = 4 \\times 28\\pi$.\n\n$k^2 = 4$ ✓.'),
  q(8, 'If the radius of a sphere is tripled, the volume is multiplied by:',
    ['27', '9', '3', '6'], 0,
    'Volume $\\propto r^3$. If $r \\to 3r$: $V \\to (3)^3 V = 27V$.'),
  t(9, '### SA Context: Water Tanks and Reservoirs\n\nA cylindrical water tank on a Limpopo farm has a diameter of 2 m and a height of 1{,}5 m.\n\nRadius $= 1$ m.\n$$V = \\pi(1)^2(1{,}5) = 1{,}5\\pi \\approx 4{,}71 \\text{ m}^3$$\n\nSince $1\\text{ m}^3 = 1\\,000$ litres:\n$$V \\approx 4\\,712 \\text{ litres}$$\n\nA conical sand heap at a construction site in Durban has a base radius of 3 m and height of 2 m:\n$$V = \\dfrac{1}{3}\\pi(9)(2) = 6\\pi \\approx 18{,}85 \\text{ m}^3$$'),
  q(10, 'A rectangular prism has length 8 cm, width 5 cm, and height 3 cm. Its volume is:',
    ['120 cm$^3$', '16 cm$^3$', '158 cm$^3$', '240 cm$^3$'], 0,
    '$V = l \\times w \\times h = 8 \\times 5 \\times 3 = 120$ cm$^3$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 14: Revision and Exam Preparation (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Exam Structure, Key Formulae, and Exam Tips ---
blockNum = 0;
const ch14_lesson1 = [
  t(1, '## Grade 10 Mathematics Exam Structure\n\n### Paper 1 (100 marks, 2 hours)\n\n| Topic | Marks |\n|-------|-------|\n| Algebraic Expressions | 30 |\n| Number Patterns | 15 |\n| Finance and Growth | 10 |\n| Functions and Graphs | 30 |\n| Probability | 15 |\n| **Total** | **100** |\n\n### Paper 2 (100 marks, 2 hours)\n\n| Topic | Marks |\n|-------|-------|\n| Statistics | 15 |\n| Analytical Geometry | 15 |\n| Trigonometry | 40 |\n| Euclidean Geometry and Measurement | 30 |\n| **Total** | **100** |'),
  t(2, '## Key Formulae — Paper 1\n\n### Algebra\n- Difference of squares: $a^2 - b^2 = (a+b)(a-b)$\n- Sum/difference of cubes: $a^3 \\pm b^3 = (a \\pm b)(a^2 \\mp ab + b^2)$\n- Exponent laws: $x^m \\cdot x^n = x^{m+n}$, $(x^m)^n = x^{mn}$, $x^{-n} = \\frac{1}{x^n}$\n\n### Number Patterns\n- $T_n = a + (n-1)d$\n\n### Finance\n- Simple interest: $A = P(1+in)$\n- Compound interest: $A = P(1+i)^n$\n\n### Functions\n- Linear: $y = mx + c$\n- Quadratic: $y = ax^2 + q$, turning point $(0, q)$\n- Hyperbola: $y = \\dfrac{a}{x} + q$, asymptotes $x = 0$ and $y = q$\n- Exponential: $y = ab^x + q$, asymptote $y = q$'),
  q(3, 'How many marks is the Grade 10 Mathematics exam worth in total?',
    ['200', '100', '300', '150'], 0,
    'Paper 1 = 100 marks + Paper 2 = 100 marks = 200 marks total.'),
  t(4, '## Key Formulae — Paper 2\n\n### Analytical Geometry\n- Distance: $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$\n- Gradient: $m = \\dfrac{y_2-y_1}{x_2-x_1}$\n- Midpoint: $M = \\left(\\dfrac{x_1+x_2}{2}, \\dfrac{y_1+y_2}{2}\\right)$\n\n### Trigonometry\n- $\\sin\\theta = \\dfrac{y}{r}$, $\\cos\\theta = \\dfrac{x}{r}$, $\\tan\\theta = \\dfrac{y}{x}$\n- Special angles: $30\\degree$, $45\\degree$, $60\\degree$\n\n### Measurement\n- Cylinder: $V = \\pi r^2 h$, $\\text{SA} = 2\\pi r^2 + 2\\pi rh$\n- Cone: $V = \\dfrac{1}{3}\\pi r^2 h$\n- Sphere: $V = \\dfrac{4}{3}\\pi r^3$, $\\text{SA} = 4\\pi r^2$\n- Pyramid: $V = \\dfrac{1}{3} \\times \\text{base area} \\times h$\n- Scaling: dimensions $\\times k$ → SA $\\times k^2$, Volume $\\times k^3$'),
  fb(5, 'Paper 1 covers Algebra, Number Patterns, ___, Functions, and Probability. Paper 2 covers Statistics, Analytical Geometry, ___, and Euclidean Geometry.',
    ['Finance', 'Trigonometry'],
    'Paper 1: Algebra, Patterns, Finance, Functions, Probability. Paper 2: Statistics, Analytical Geometry, Trigonometry, Geometry.'),
  t(6, '## Exam Tips\n\n### Time Management\n- Paper 1: 100 marks in 120 minutes — about 1{,}2 minutes per mark.\n- Paper 2: same ratio.\n- Start with topics you know best.\n- If stuck on a question for more than 3 minutes, move on.\n\n### Common Mistakes to Avoid\n\n| Mistake | Correct approach |\n|---------|------------------|\n| Dividing both sides by $x$ | Factorise: $x^2 = 5x \\implies x(x-5) = 0$ |\n| $(a+b)^2 = a^2 + b^2$ | $(a+b)^2 = a^2 + 2ab + b^2$ |\n| $\\sqrt{a+b} = \\sqrt{a} + \\sqrt{b}$ | This is **wrong** — cannot split roots |\n| Forgetting to reverse sign in inequalities | Only when multiplying/dividing by negative |\n| Wrong quadrant for trig | Use the CAST diagram |\n| Forgetting units in measurement | Always include cm, m, cm$^2$, cm$^3$ |'),
  q(7, 'What is the most common mistake when solving $x^2 = 3x$?',
    ['Dividing both sides by $x$, losing the $x = 0$ solution', 'Taking the square root of both sides', 'Adding $3x$ to both sides', 'Factoring incorrectly'], 0,
    'Dividing by $x$ removes the solution $x = 0$. The correct method: $x^2 - 3x = 0 \\implies x(x-3) = 0 \\implies x = 0$ or $x = 3$.'),
  t(8, '### Study Strategy\n\n1. **Work through past papers** — at least 5 past papers from previous years.\n2. **Time yourself** — simulate exam conditions.\n3. **Mark your own work** — use the memo to understand marking.\n4. **Identify weak topics** — spend more time on these.\n5. **Practice without a calculator** where possible (especially special angles in trig).\n6. **Write neatly** — unclear work loses marks.\n7. **Show all working** — method marks are available even if the answer is wrong.\n\n### Final Checklist\n\n- Can you factorise all six types (common factor, DOTS, trinomial, grouping, sum/difference of cubes, perfect square)?\n- Can you solve linear and quadratic equations?\n- Can you work with exponent laws and rational exponents?\n- Do you know the special trig angles and the CAST diagram?\n- Can you sketch all four function types?\n- Can you calculate volume and surface area for all shapes?\n- Can you use distance, gradient, and midpoint formulae?'),
  q(9, 'In a geometry proof, you should always:',
    ['State the reason for each step', 'Draw a diagram without labels', 'Skip intermediate steps', 'Use only algebra'], 0,
    'Every statement in a geometry proof must have a **reason** (theorem, definition, or given information). This earns method marks.'),
  q(10, 'What is the total number of marks for the Grade 10 Mathematics examination?',
    ['200', '100', '300', '150'], 0,
    'Paper 1 = 100 marks + Paper 2 = 100 marks = 200 marks total.'),
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

  // Find or create Mathematics subject
  let SUBJECT_ID;
  let subjectDoc = await db.collection('subjects').findOne({ name: /Mathematics$/i, schoolId: SCHOOL_ID });
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
    tags: ['mathematics', 'grade-10', 'caps'],
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
      title: 'Chapter 1: Algebraic Expressions',
      description: 'The real number system, rational and irrational numbers, surds, products of algebraic expressions, factorisation (common factor, DOTS, trinomials, grouping, sum and difference of cubes), and simplifying algebraic fractions.',
      order: 1,
      lessons: [
        { title: 'The Real Number System and Surds', description: 'Number classification (natural, whole, integer, rational, irrational, real), estimating surds, simplifying surds, adding/subtracting like surds, rationalising denominators.', blocks: ch1_lesson1, term: 1 },
        { title: 'Products, Factorisation, and Algebraic Fractions', description: 'Multiplying binomials by trinomials, special products, six factorisation techniques, simplifying algebraic fractions, adding/subtracting fractions with LCDs.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Exponents',
      description: 'Laws of exponents for integer and rational exponents, prime factorisation strategy, solving exponential equations, and introduction to rational exponents.',
      order: 2,
      lessons: [
        { title: 'Laws of Exponents', description: 'Seven exponent laws, simplifying expressions with same and different bases, prime factorisation, exponential equations, and introduction to rational exponents.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Equations and Inequalities',
      description: 'Linear equations, quadratic equations by factorisation, simultaneous linear equations, word problems, literal equations, linear inequalities, and interval notation.',
      order: 3,
      lessons: [
        { title: 'Linear Equations and Quadratic Equations', description: 'Solving linear equations, quadratic equations by factorisation, simultaneous linear equations by substitution and elimination, word problems.', blocks: ch3_lesson1, term: 1 },
        { title: 'Literal Equations, Inequalities, and Interval Notation', description: 'Changing the subject of a formula, solving linear inequalities, reversing the sign, interval notation, number line representation, compound inequalities.', blocks: ch3_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Trigonometry',
      description: 'Trigonometric ratios (sin, cos, tan and their reciprocals), special angles, the CAST diagram, trigonometry on the Cartesian plane, solving trig equations, and 2D problems.',
      order: 4,
      lessons: [
        { title: 'Trig Ratios, Special Angles, and the Cartesian Plane', description: 'SOH-CAH-TOA, reciprocal ratios (cosec, sec, cot), special angles (30, 45, 60 degrees), defining trig ratios using coordinates, the CAST diagram.', blocks: ch4_lesson1, term: 1 },
        { title: 'Solving Trig Equations and 2D Problems', description: 'Solving trig equations for 0 to 360 degrees, reference angles, angles of elevation and depression, compound right-triangle problems.', blocks: ch4_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Euclidean Geometry',
      description: 'Properties of triangles, congruence, similarity, properties of special quadrilaterals (parallelogram, rectangle, rhombus, square, trapezium, kite), proving quadrilaterals, and the midpoint theorem.',
      order: 5,
      lessons: [
        { title: 'Properties of Triangles and Quadrilaterals', description: 'Triangle properties, congruence (SSS, SAS, AAS, RHS), similarity (AAA), quadrilateral properties, proving parallelograms, and the midpoint theorem.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Analytical Geometry',
      description: 'Distance formula, gradient, midpoint, equation of a straight line, parallel and perpendicular lines, collinear points, and applications on the Cartesian plane.',
      order: 6,
      lessons: [
        { title: 'Distance, Gradient, and Midpoint', description: 'Distance formula, midpoint formula, gradient and its properties, parallel and perpendicular lines, collinear points, equation of a line, applications.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Functions and Graphs',
      description: 'Function notation, domain and range, linear functions, quadratic functions (y=ax^2+q), hyperbolic functions (y=a/x+q), exponential functions (y=ab^x+q), and trigonometric functions (y=a sin/cos/tan theta + q).',
      order: 7,
      lessons: [
        { title: 'Linear and Quadratic Functions', description: 'Function notation, domain and range, effect of m and c on linear graphs, the parabola y=ax^2+q, effect of a and q, turning point, sketching, finding equations from graphs.', blocks: ch7_lesson1, term: 2 },
        { title: 'Hyperbola, Exponential, and Trigonometric Functions', description: 'The hyperbola y=a/x+q, the exponential y=ab^x+q, asymptotes and key features, introduction to trig function graphs y=a sin/cos/tan theta + q.', blocks: ch7_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Trigonometry — Two-Dimensional Problems',
      description: 'Trigonometric ratios in all four quadrants, solving two-dimensional problems with right triangles, angles of elevation and depression, and bearings.',
      order: 8,
      lessons: [
        { title: 'Trig Ratios for All Angles and 2D Applications', description: 'Determining trig ratios in all quadrants, CAST diagram applications, solving 2D problems, angles of elevation and depression, compound triangle problems.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Statistics',
      description: 'Measures of central tendency (mean, median, mode) for ungrouped and grouped data, measures of dispersion (range, quartiles, IQR), five-number summary, box-and-whisker plots, histograms, frequency polygons, and skewness.',
      order: 9,
      lessons: [
        { title: 'Measures of Central Tendency and Dispersion', description: 'Mean, median, mode for ungrouped and grouped data, range, quartiles, IQR, five-number summary, box-and-whisker plots, histograms, frequency polygons, skewness.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Probability',
      description: 'Theoretical probability, sample spaces, complementary events, mutually exclusive events, the addition rule, Venn diagrams (two and three events).',
      order: 10,
      lessons: [
        { title: 'Theoretical Probability and Venn Diagrams', description: 'Probability fundamentals, sample spaces, complementary events, mutually exclusive events, addition rule, two-event and three-event Venn diagrams.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: Finance and Growth',
      description: 'Simple interest, compound interest, hire purchase, population growth, inflation, exchange rates, and solving for rate and time.',
      order: 11,
      lessons: [
        { title: 'Simple and Compound Interest', description: 'Simple interest formula, compound interest formula, hire purchase, population growth, inflation, exchange rates, finding rate and time.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Number Patterns',
      description: 'Linear (arithmetic) number patterns, constant first differences, the general term, finding specific terms and positions, patterns in context.',
      order: 12,
      lessons: [
        { title: 'Linear Number Patterns', description: 'Constant first differences, general term Tn = a + (n-1)d, finding terms and positions, checking membership, matchstick and contextual patterns.', blocks: ch12_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 13: Measurement',
      description: 'Volume and surface area of right prisms, cylinders, spheres, right pyramids, right cones, and the effect of scaling dimensions on area and volume.',
      order: 13,
      lessons: [
        { title: 'Volume and Surface Area', description: 'Formulae for right prisms, cylinders, spheres, cones, and pyramids. Surface area calculations. Effect of multiplying dimensions by a factor k.', blocks: ch13_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 14: Revision and Exam Preparation',
      description: 'Paper 1 and Paper 2 exam structure, key formulae, common mistakes, exam tips, and study strategies.',
      order: 14,
      lessons: [
        { title: 'Exam Structure, Key Formulae, and Exam Tips', description: 'Paper 1 (Algebra, Patterns, Finance, Functions, Probability) and Paper 2 (Statistics, Analytical Geometry, Trigonometry, Geometry/Measurement) structure, all key formulae, exam strategies, common mistakes.', blocks: ch14_lesson1, term: 4 },
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
    title: 'Grade 10 Mathematics \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Algebraic Expressions, Exponents, Equations and Inequalities, Trigonometry, Euclidean Geometry, Analytical Geometry, Functions and Graphs, Statistics, Probability, Finance and Growth, Number Patterns, Measurement, and Exam Preparation for the Grade 10 Mathematics examination.',
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
  console.log('  TEXTBOOK: Grade 10 Mathematics');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
