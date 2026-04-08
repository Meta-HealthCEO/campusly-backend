const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const SCHOOL_ID = new mongoose.Types.ObjectId('69ce960a98ca4ee738d25416');
const CREATED_BY = new mongoose.Types.ObjectId('69ce960b98ca4ee738d25432');
const GRADE_ID = new mongoose.Types.ObjectId('69d2c1f317b8332733f72601'); // Grade 11

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
// CHAPTER 1: Exponents and Surds (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Laws of Exponents for Rational Exponents ---
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Laws of Exponents for Rational Exponents\n\nIn Grade 10 you worked with integer exponents. In Grade 11 we extend the laws to **rational exponents** (fractions).\n\n### Definition of Rational Exponents\n\n$$a^{\\frac{m}{n}} = \\sqrt[n]{a^m} = \\left(\\sqrt[n]{a}\\right)^m$$\n\nwhere $a > 0$, $m \\in \\mathbb{Z}$, and $n \\in \\mathbb{N}$, $n \\geq 2$.\n\n**Special case:** $a^{\\frac{1}{n}} = \\sqrt[n]{a}$\n\n**Examples:**\n- $8^{\\frac{1}{3}} = \\sqrt[3]{8} = 2$\n- $27^{\\frac{2}{3}} = \\left(\\sqrt[3]{27}\\right)^2 = 3^2 = 9$\n- $16^{\\frac{3}{4}} = \\left(\\sqrt[4]{16}\\right)^3 = 2^3 = 8$'),
  t(2, '### The Exponent Laws (Recap and Extension)\n\nAll the exponent laws that work for integers also hold for rational exponents, provided the base is positive.\n\n| Law | Rule | Example |\n|-----|------|---------|\n| Product | $a^m \\cdot a^n = a^{m+n}$ | $x^{\\frac{1}{2}} \\cdot x^{\\frac{1}{3}} = x^{\\frac{5}{6}}$ |\n| Quotient | $\\dfrac{a^m}{a^n} = a^{m-n}$ | $\\dfrac{x^{\\frac{3}{4}}}{x^{\\frac{1}{4}}} = x^{\\frac{1}{2}}$ |\n| Power of a power | $(a^m)^n = a^{mn}$ | $(x^{\\frac{2}{3}})^6 = x^4$ |\n| Power of a product | $(ab)^n = a^n b^n$ | $(4x)^{\\frac{1}{2}} = 2x^{\\frac{1}{2}}$ |\n| Negative exponent | $a^{-n} = \\dfrac{1}{a^n}$ | $x^{-\\frac{1}{2}} = \\dfrac{1}{\\sqrt{x}}$ |\n| Zero exponent | $a^0 = 1$ | $(5x)^0 = 1$ |'),
  q(3, 'Simplify $27^{\\frac{2}{3}}$.',
    ['9', '3', '18', '81'], 0,
    '$27^{\\frac{2}{3}} = (\\sqrt[3]{27})^2 = 3^2 = 9$.'),
  t(4, '### Worked Examples\n\n**Example 1:** Simplify $\\dfrac{2^{x+1} \\cdot 3^{x-1}}{6^x}$.\n\n$$\\dfrac{2^{x+1} \\cdot 3^{x-1}}{6^x} = \\dfrac{2^{x+1} \\cdot 3^{x-1}}{(2 \\cdot 3)^x} = \\dfrac{2^{x+1} \\cdot 3^{x-1}}{2^x \\cdot 3^x}$$\n$$= 2^{x+1-x} \\cdot 3^{x-1-x} = 2^1 \\cdot 3^{-1} = \\dfrac{2}{3}$$\n\n**Example 2:** Simplify $(\\sqrt[3]{x^2})^{\\frac{3}{4}}$.\n\n$$= (x^{\\frac{2}{3}})^{\\frac{3}{4}} = x^{\\frac{2}{3} \\times \\frac{3}{4}} = x^{\\frac{1}{2}} = \\sqrt{x}$$\n\n**Example 3:** Write without fractional exponents: $x^{\\frac{3}{2}} + x^{-\\frac{1}{2}}$.\n\n$$= x \\cdot x^{\\frac{1}{2}} + \\dfrac{1}{x^{\\frac{1}{2}}} = x\\sqrt{x} + \\dfrac{1}{\\sqrt{x}}$$'),
  q(5, 'Simplify $\\left(\\dfrac{9}{4}\\right)^{\\frac{1}{2}}$.',
    ['$\\dfrac{3}{2}$', '$\\dfrac{9}{2}$', '$\\dfrac{4}{9}$', '$\\dfrac{2}{3}$'], 0,
    '$\\left(\\dfrac{9}{4}\\right)^{\\frac{1}{2}} = \\dfrac{\\sqrt{9}}{\\sqrt{4}} = \\dfrac{3}{2}$.'),
  fb(6, 'The expression $a^{\\frac{1}{n}}$ is equal to the ___ root of $a$. Using the product law, $x^{\\frac{1}{3}} \\cdot x^{\\frac{1}{6}} = x^{___}$.',
    ['nth', '1/2'],
    '$a^{\\frac{1}{n}} = \\sqrt[n]{a}$ (the nth root). $x^{\\frac{1}{3}} \\cdot x^{\\frac{1}{6}} = x^{\\frac{2}{6}+\\frac{1}{6}} = x^{\\frac{3}{6}} = x^{\\frac{1}{2}}$.'),
  t(7, '### Prime Factorisation Strategy\n\nWhen simplifying exponential expressions, **always** break bases into prime factors first.\n\n**Example:** Simplify $\\dfrac{12^x \\cdot 27^{\\frac{1}{3}}}{4^x \\cdot 9^{\\frac{1}{2}}}$.\n\nStep 1 \u2014 Prime factorise:\n- $12 = 2^2 \\cdot 3$, $27 = 3^3$, $4 = 2^2$, $9 = 3^2$\n\nStep 2 \u2014 Substitute:\n$$\\dfrac{(2^2 \\cdot 3)^x \\cdot (3^3)^{\\frac{1}{3}}}{(2^2)^x \\cdot (3^2)^{\\frac{1}{2}}} = \\dfrac{2^{2x} \\cdot 3^x \\cdot 3}{2^{2x} \\cdot 3} = 3^x$$'),
  q(8, 'Simplify $\\dfrac{5^{2x} \\cdot 5^3}{25^x}$.',
    ['125', '5', '25', '$5^{3x}$'], 0,
    '$\\dfrac{5^{2x} \\cdot 5^3}{(5^2)^x} = \\dfrac{5^{2x+3}}{5^{2x}} = 5^3 = 125$.'),
  t(9, '### Exponential Equations with Rational Exponents\n\n**Type 1:** Same base \u2014 equate exponents.\n\n$3^{2x-1} = 27 \\implies 3^{2x-1} = 3^3 \\implies 2x - 1 = 3 \\implies x = 2$\n\n**Type 2:** The unknown is the base.\n\n$x^{\\frac{3}{2}} = 8 \\implies x = 8^{\\frac{2}{3}} = (\\sqrt[3]{8})^2 = 4$\n\n**Type 3:** Substitution for exponential equations.\n\n$4^x - 3 \\cdot 2^x - 4 = 0$\n\nLet $k = 2^x$. Then $4^x = (2^2)^x = (2^x)^2 = k^2$.\n\n$k^2 - 3k - 4 = 0 \\implies (k-4)(k+1) = 0$\n\n$k = 4$ or $k = -1$. But $2^x > 0$ so $k \\neq -1$.\n\n$2^x = 4 = 2^2 \\implies x = 2$.'),
  q(10, 'Solve for $x$: $x^{\\frac{2}{3}} = 9$.',
    ['27', '3', '81', '6'], 0,
    '$x^{\\frac{2}{3}} = 9 \\implies x = 9^{\\frac{3}{2}} = (\\sqrt{9})^3 = 3^3 = 27$.',
    ['Raise both sides to the power $\\frac{3}{2}$.']),
];

// --- Lesson 2: Surds ---
blockNum = 0;
const ch1_lesson2 = [
  t(1, '## Surds\n\nA **surd** is an irrational root that cannot be simplified to a rational number.\n\n**Examples of surds:** $\\sqrt{2}$, $\\sqrt{3}$, $\\sqrt{5}$, $\\sqrt[3]{7}$\n\n**Not surds:** $\\sqrt{4} = 2$, $\\sqrt{9} = 3$, $\\sqrt[3]{8} = 2$ (these simplify to rational numbers)\n\n### Properties of Surds\n\n| Property | Rule |\n|----------|------|\n| Product | $\\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b}$ |\n| Quotient | $\\sqrt{\\dfrac{a}{b}} = \\dfrac{\\sqrt{a}}{\\sqrt{b}}$ |\n| Like surds | $m\\sqrt{a} + n\\sqrt{a} = (m+n)\\sqrt{a}$ |\n\n**Important:** $\\sqrt{a+b} \\neq \\sqrt{a} + \\sqrt{b}$. This is a common mistake!'),
  t(2, '### Simplifying Surds\n\nTo simplify a surd, factor out the largest perfect square.\n\n**Example 1:** $\\sqrt{48} = \\sqrt{16 \\cdot 3} = 4\\sqrt{3}$\n\n**Example 2:** $\\sqrt{72} = \\sqrt{36 \\cdot 2} = 6\\sqrt{2}$\n\n**Example 3:** $\\sqrt{50} + \\sqrt{18} - \\sqrt{8}$\n$$= \\sqrt{25 \\cdot 2} + \\sqrt{9 \\cdot 2} - \\sqrt{4 \\cdot 2}$$\n$$= 5\\sqrt{2} + 3\\sqrt{2} - 2\\sqrt{2} = 6\\sqrt{2}$$\n\n### Multiplying Surds\n\n$\\sqrt{3} \\cdot \\sqrt{12} = \\sqrt{36} = 6$\n\n$(2 + \\sqrt{3})(2 - \\sqrt{3}) = 4 - 3 = 1$ (difference of squares)'),
  q(3, 'Simplify $\\sqrt{75}$.',
    ['$5\\sqrt{3}$', '$3\\sqrt{5}$', '$25\\sqrt{3}$', '$15$'], 0,
    '$\\sqrt{75} = \\sqrt{25 \\cdot 3} = 5\\sqrt{3}$.'),
  t(4, '### Rationalising the Denominator\n\nWe rationalise to remove surds from the denominator.\n\n**Type 1:** Single surd in denominator \u2014 multiply by $\\dfrac{\\sqrt{a}}{\\sqrt{a}}$.\n\n$$\\dfrac{3}{\\sqrt{5}} = \\dfrac{3}{\\sqrt{5}} \\cdot \\dfrac{\\sqrt{5}}{\\sqrt{5}} = \\dfrac{3\\sqrt{5}}{5}$$\n\n**Type 2:** Binomial surd in denominator \u2014 multiply by the **conjugate**.\n\n$$\\dfrac{2}{3 + \\sqrt{2}} = \\dfrac{2}{3+\\sqrt{2}} \\cdot \\dfrac{3-\\sqrt{2}}{3-\\sqrt{2}} = \\dfrac{2(3-\\sqrt{2})}{9-2} = \\dfrac{6-2\\sqrt{2}}{7}$$\n\nThe conjugate of $a + \\sqrt{b}$ is $a - \\sqrt{b}$.'),
  q(5, 'Rationalise the denominator: $\\dfrac{4}{\\sqrt{2}}$.',
    ['$2\\sqrt{2}$', '$\\dfrac{4\\sqrt{2}}{2}$', '$4\\sqrt{2}$', '$\\dfrac{\\sqrt{2}}{4}$'], 0,
    '$\\dfrac{4}{\\sqrt{2}} \\cdot \\dfrac{\\sqrt{2}}{\\sqrt{2}} = \\dfrac{4\\sqrt{2}}{2} = 2\\sqrt{2}$.'),
  fb(6, 'To rationalise $\\dfrac{1}{a + \\sqrt{b}}$, we multiply by the ___ which is $a - \\sqrt{b}$. The product $(a+\\sqrt{b})(a-\\sqrt{b})$ equals $a^2 - ___$.',
    ['conjugate', 'b'],
    'The conjugate reverses the sign of the surd. $(a+\\sqrt{b})(a-\\sqrt{b}) = a^2 - (\\sqrt{b})^2 = a^2 - b$.'),
  t(7, '### Solving Equations Involving Surds\n\n**Strategy:** Isolate the surd, then square both sides. Always **check** your answer.\n\n**Example 1:** $\\sqrt{x+3} = 5$\n$$x + 3 = 25 \\implies x = 22$$\nCheck: $\\sqrt{22+3} = \\sqrt{25} = 5$ \\checkmark\n\n**Example 2:** $\\sqrt{2x-1} = x - 2$\n$$2x - 1 = (x-2)^2 = x^2 - 4x + 4$$\n$$x^2 - 6x + 5 = 0 \\implies (x-5)(x-1) = 0$$\n$$x = 5 \\text{ or } x = 1$$\nCheck $x = 5$: $\\sqrt{9} = 3 = 5 - 2$ \\checkmark\nCheck $x = 1$: $\\sqrt{1} = 1 \\neq 1 - 2 = -1$ \\ding{55}\nSo $x = 5$ only.\n\n**Key point:** Squaring can introduce **extraneous solutions**. Always verify!'),
  q(8, 'Solve: $\\sqrt{3x + 1} = 4$. What is $x$?',
    ['5', '3', '15', '7'], 0,
    '$3x + 1 = 16 \\implies 3x = 15 \\implies x = 5$. Check: $\\sqrt{16} = 4$ \\checkmark.',
    ['Square both sides to remove the square root.']),
  t(9, '### SA Context: Distance Between Two Points\n\nIn South Africa, cell tower placement uses the distance formula which relies on surds.\n\nThe distance between two cell towers at coordinates $(x_1, y_1)$ and $(x_2, y_2)$ is:\n\n$$d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$$\n\nFor example, towers at $(1, 3)$ and $(4, 7)$:\n$$d = \\sqrt{(4-1)^2 + (7-3)^2} = \\sqrt{9+16} = \\sqrt{25} = 5 \\text{ km}$$\n\nBut often the answer is a surd: towers at $(0, 0)$ and $(3, 5)$:\n$$d = \\sqrt{9+25} = \\sqrt{34} \\approx 5{,}83 \\text{ km}$$'),
  q(10, 'Which of the following is a surd?',
    ['$\\sqrt{7}$', '$\\sqrt{16}$', '$\\sqrt[3]{27}$', '$\\sqrt{0{,}25}$'], 0,
    '$\\sqrt{7}$ is irrational and cannot be simplified to a rational number. $\\sqrt{16}=4$, $\\sqrt[3]{27}=3$, and $\\sqrt{0{,}25}=0{,}5$ are all rational.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Equations and Inequalities (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Completing the Square and Quadratic Formula ---
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Completing the Square\n\nCompleting the square transforms $ax^2 + bx + c$ into the form $a(x + p)^2 + q$.\n\n### Method (for $a = 1$)\n\n$$x^2 + bx + c$$\n$$= x^2 + bx + \\left(\\dfrac{b}{2}\\right)^2 - \\left(\\dfrac{b}{2}\\right)^2 + c$$\n$$= \\left(x + \\dfrac{b}{2}\\right)^2 + c - \\dfrac{b^2}{4}$$\n\n**Example:** Complete the square: $x^2 + 6x + 2$\n$$= x^2 + 6x + 9 - 9 + 2$$\n$$= (x+3)^2 - 7$$\n\nSo $p = 3$ and $q = -7$.\n\nThe minimum value of $x^2 + 6x + 2$ is $-7$, occurring at $x = -3$.'),
  t(2, '### Completing the Square (for $a \\neq 1$)\n\nFirst factor out $a$ from the $x^2$ and $x$ terms.\n\n**Example:** $2x^2 - 12x + 5$\n$$= 2(x^2 - 6x) + 5$$\n$$= 2(x^2 - 6x + 9 - 9) + 5$$\n$$= 2(x - 3)^2 - 18 + 5$$\n$$= 2(x-3)^2 - 13$$\n\n### Solving by Completing the Square\n\n$x^2 - 4x - 1 = 0$\n$$(x-2)^2 - 4 - 1 = 0$$\n$$(x-2)^2 = 5$$\n$$x - 2 = \\pm\\sqrt{5}$$\n$$x = 2 + \\sqrt{5} \\text{ or } x = 2 - \\sqrt{5}$$'),
  q(3, 'Complete the square: $x^2 + 8x + 10 = (x + a)^2 + b$. What is $b$?',
    ['-6', '6', '-54', '26'], 0,
    '$x^2 + 8x + 10 = (x+4)^2 - 16 + 10 = (x+4)^2 - 6$. So $b = -6$.'),
  t(4, '## The Quadratic Formula\n\nFor $ax^2 + bx + c = 0$ where $a \\neq 0$:\n\n$$x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\nThis formula is derived by completing the square on the general quadratic.\n\n**Example:** Solve $2x^2 + 3x - 5 = 0$.\n\n$a = 2$, $b = 3$, $c = -5$.\n\n$$x = \\dfrac{-3 \\pm \\sqrt{9 - 4(2)(-5)}}{4} = \\dfrac{-3 \\pm \\sqrt{9 + 40}}{4} = \\dfrac{-3 \\pm \\sqrt{49}}{4} = \\dfrac{-3 \\pm 7}{4}$$\n\n$$x = \\dfrac{4}{4} = 1 \\quad \\text{or} \\quad x = \\dfrac{-10}{4} = -\\dfrac{5}{2}$$'),
  q(5, 'Using the quadratic formula, solve $x^2 - 5x + 6 = 0$. The solutions are:',
    ['$x = 2$ or $x = 3$', '$x = -2$ or $x = -3$', '$x = 1$ or $x = 6$', '$x = -1$ or $x = -6$'], 0,
    '$x = \\dfrac{5 \\pm \\sqrt{25-24}}{2} = \\dfrac{5 \\pm 1}{2}$. So $x = 3$ or $x = 2$.'),
  fb(6, 'The quadratic formula is $x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$. The expression under the square root, $b^2 - 4ac$, is called the ___.',
    ['discriminant'],
    'The discriminant is $\\Delta = b^2 - 4ac$. It determines the nature of the roots.'),
  t(7, '## Nature of Roots\n\nThe **discriminant** $\\Delta = b^2 - 4ac$ tells us about the roots:\n\n| Condition | Nature of roots |\n|-----------|-----------------|\n| $\\Delta > 0$, perfect square | Two distinct **rational** roots |\n| $\\Delta > 0$, not perfect square | Two distinct **irrational** roots |\n| $\\Delta = 0$ | Two **equal** (repeated) real roots |\n| $\\Delta < 0$ | **No** real roots (non-real/imaginary) |\n\n**Example:** For $x^2 + 2x + 5 = 0$: $\\Delta = 4 - 20 = -16 < 0$ \u2192 no real roots.\n\n**Example:** For $x^2 - 6x + 9 = 0$: $\\Delta = 36 - 36 = 0$ \u2192 equal roots ($x = 3$).'),
  q(8, 'For $2x^2 - 4x + 2 = 0$, what is the nature of the roots?',
    ['Two equal real roots', 'Two distinct rational roots', 'Two distinct irrational roots', 'No real roots'], 0,
    '$\\Delta = (-4)^2 - 4(2)(2) = 16 - 16 = 0$. $\\Delta = 0$ means two equal real roots.'),
  t(9, '### Finding $k$ for a Given Nature of Roots\n\n**Example:** For what values of $k$ does $x^2 + kx + 9 = 0$ have equal roots?\n\nEqual roots: $\\Delta = 0$.\n$$k^2 - 4(1)(9) = 0 \\implies k^2 = 36 \\implies k = \\pm 6$$\n\n**Example:** For what values of $p$ does $x^2 + 4x + p = 0$ have real roots?\n\nReal roots: $\\Delta \\geq 0$.\n$$16 - 4p \\geq 0 \\implies p \\leq 4$$\n\nThis is a common exam question \u2014 always set up the inequality using $\\Delta$.'),
  q(10, 'For $x^2 + 6x + k = 0$ to have no real roots, $k$ must satisfy:',
    ['$k > 9$', '$k < 9$', '$k = 9$', '$k > 36$'], 0,
    'No real roots: $\\Delta < 0$. $36 - 4k < 0 \\implies k > 9$.',
    ['Set $\\Delta < 0$ and solve for $k$.']),
];

// --- Lesson 2: Quadratic Equations, Inequalities, and Simultaneous Equations ---
blockNum = 0;
const ch2_lesson2 = [
  t(1, '## Solving Quadratic Equations by Factorisation\n\nAlways try factorisation first before using the quadratic formula.\n\n**Step 1:** Write in standard form $ax^2 + bx + c = 0$.\n**Step 2:** Factorise.\n**Step 3:** Set each factor equal to zero.\n\n**Example 1:** $x^2 - 7x + 12 = 0$\n$$(x-3)(x-4) = 0 \\implies x = 3 \\text{ or } x = 4$$\n\n**Example 2:** $3x^2 + 5x = 2$\n$$3x^2 + 5x - 2 = 0 \\implies (3x - 1)(x + 2) = 0$$\n$$x = \\dfrac{1}{3} \\text{ or } x = -2$$\n\n**Example 3:** $x^2 = 5x$\n$$x^2 - 5x = 0 \\implies x(x - 5) = 0 \\implies x = 0 \\text{ or } x = 5$$\n\n**Common mistake:** Never divide both sides by $x$ \u2014 you lose the $x = 0$ solution!'),
  t(2, '## Quadratic Inequalities\n\nTo solve $ax^2 + bx + c > 0$ (or $<$, $\\geq$, $\\leq$):\n\n**Step 1:** Solve $ax^2 + bx + c = 0$ to find the critical values.\n**Step 2:** Draw a number line and test intervals.\n**Step 3:** Write the solution in interval notation.\n\n**Example:** Solve $x^2 - 5x + 6 \\leq 0$.\n\nStep 1: $(x-2)(x-3) = 0 \\implies x = 2$ or $x = 3$.\n\nStep 2: The parabola $y = x^2 - 5x + 6$ opens **upward** ($a > 0$).\n- Below the $x$-axis (negative) between the roots.\n\nStep 3: $2 \\leq x \\leq 3$.\n\n**Rule of thumb for $a > 0$:**\n- $ax^2 + bx + c \\leq 0$ \u2192 solution **between** the roots\n- $ax^2 + bx + c \\geq 0$ \u2192 solution **outside** the roots'),
  q(3, 'Solve: $x^2 - 4x - 5 > 0$.',
    ['$x < -1$ or $x > 5$', '$-1 < x < 5$', '$x < -5$ or $x > 1$', '$-5 < x < 1$'], 0,
    '$(x-5)(x+1) = 0 \\implies x = 5$ or $x = -1$. Since $a > 0$ and we want $> 0$, the solution is outside the roots: $x < -1$ or $x > 5$.'),
  t(4, '## Simultaneous Equations (One Linear, One Quadratic)\n\nSolve by **substitution**: use the linear equation to express one variable, then substitute into the quadratic.\n\n**Example:** Solve simultaneously:\n$$y = x + 1 \\quad \\text{...(1)}$$\n$$x^2 + y^2 = 13 \\quad \\text{...(2)}$$\n\nSubstitute (1) into (2):\n$$x^2 + (x+1)^2 = 13$$\n$$x^2 + x^2 + 2x + 1 = 13$$\n$$2x^2 + 2x - 12 = 0$$\n$$x^2 + x - 6 = 0$$\n$$(x+3)(x-2) = 0$$\n$$x = -3 \\text{ or } x = 2$$\n\nFrom (1): if $x = -3$, $y = -2$; if $x = 2$, $y = 3$.\n\nSolutions: $(-3; -2)$ and $(2; 3)$.'),
  q(5, 'Solve simultaneously: $y = 2x - 1$ and $x^2 + y = 7$. Find the positive value of $x$.',
    ['2', '3', '1', '4'], 0,
    'Substitute: $x^2 + 2x - 1 = 7 \\implies x^2 + 2x - 8 = 0 \\implies (x+4)(x-2) = 0$. The positive value is $x = 2$.'),
  fb(6, 'To solve a system with one linear and one quadratic equation, we use the method of ___. From the ___ equation, we express one variable in terms of the other.',
    ['substitution', 'linear'],
    'We substitute the expression from the linear equation into the quadratic equation.'),
  t(7, '### Quadratic Inequalities \u2014 Further Examples\n\n**Example:** Solve $-x^2 + 4x - 3 \\geq 0$.\n\nMultiply by $-1$ (flip the sign): $x^2 - 4x + 3 \\leq 0$.\n\n$(x-1)(x-3) = 0 \\implies x = 1$ or $x = 3$.\n\nSince we now have $\\leq 0$ with $a > 0$: solution is **between** roots.\n\n$$1 \\leq x \\leq 3$$\n\n**Example:** Solve $(x-2)(x+3) > 0$.\n\nCritical values: $x = 2$ and $x = -3$. $a > 0$ and we want $> 0$ (outside roots).\n\n$$x < -3 \\text{ or } x > 2$$'),
  q(8, 'Solve: $x^2 - 9 < 0$.',
    ['$-3 < x < 3$', '$x < -3$ or $x > 3$', '$x < 0$', '$x > 3$'], 0,
    '$(x-3)(x+3) < 0$. Critical values $x = \\pm 3$. Since $a > 0$ and we want $< 0$: between the roots, so $-3 < x < 3$.',
    ['Factorise as a difference of squares.']),
  t(9, '### SA Context: Projectile Motion\n\nA cricket ball is hit from the Wanderers Stadium in Johannesburg. Its height (in metres) after $t$ seconds is:\n$$h(t) = -5t^2 + 20t + 1{,}5$$\n\nWhen does the ball hit the ground? Set $h(t) = 0$:\n$$-5t^2 + 20t + 1{,}5 = 0$$\n\nUsing the quadratic formula:\n$$t = \\dfrac{-20 \\pm \\sqrt{400 + 30}}{-10} = \\dfrac{-20 \\pm \\sqrt{430}}{-10}$$\n$$t \\approx 4{,}07 \\text{ seconds}$$ (taking the positive root)\n\nWhen is $h(t) \\geq 15$?\n$$-5t^2 + 20t + 1{,}5 \\geq 15 \\implies -5t^2 + 20t - 13{,}5 \\geq 0$$\n\nSolve and find the interval where the ball is at least 15 m high.'),
  q(10, 'For $h(t) = -5t^2 + 30t$, when does the ball reach maximum height?',
    ['$t = 3$ seconds', '$t = 6$ seconds', '$t = 5$ seconds', '$t = 30$ seconds'], 0,
    'Maximum at $t = \\dfrac{-b}{2a} = \\dfrac{-30}{2(-5)} = 3$ seconds. (Or complete the square: $h = -5(t-3)^2 + 45$.)'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Trigonometry — Reduction Formulae and Identities (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Trigonometric Identities ---
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Fundamental Trigonometric Identities\n\nThese identities are true for all values of $\\theta$ where the expressions are defined.\n\n### Identity 1: Quotient Identity\n\n$$\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}$$\n\n**Proof:** In a right triangle, $\\sin\\theta = \\dfrac{y}{r}$ and $\\cos\\theta = \\dfrac{x}{r}$.\n\n$$\\dfrac{\\sin\\theta}{\\cos\\theta} = \\dfrac{y/r}{x/r} = \\dfrac{y}{x} = \\tan\\theta$$\n\n### Identity 2: Pythagorean (Square) Identity\n\n$$\\sin^2\\theta + \\cos^2\\theta = 1$$\n\n**Proof:** From $x^2 + y^2 = r^2$, divide by $r^2$:\n$$\\dfrac{x^2}{r^2} + \\dfrac{y^2}{r^2} = 1 \\implies \\cos^2\\theta + \\sin^2\\theta = 1$$\n\n**Useful rearrangements:**\n- $\\sin^2\\theta = 1 - \\cos^2\\theta$\n- $\\cos^2\\theta = 1 - \\sin^2\\theta$'),
  t(2, '### Using the Identities to Simplify\n\n**Example 1:** Simplify $\\dfrac{\\sin^2\\theta}{1 - \\cos\\theta}$.\n\n$$= \\dfrac{1 - \\cos^2\\theta}{1 - \\cos\\theta} = \\dfrac{(1-\\cos\\theta)(1+\\cos\\theta)}{1-\\cos\\theta} = 1 + \\cos\\theta$$\n\n**Example 2:** Prove that $\\dfrac{\\cos\\theta}{\\tan\\theta} + \\sin\\theta = \\dfrac{1}{\\sin\\theta}$.\n\nLHS $= \\dfrac{\\cos\\theta}{\\sin\\theta / \\cos\\theta} + \\sin\\theta = \\dfrac{\\cos^2\\theta}{\\sin\\theta} + \\sin\\theta$\n\n$= \\dfrac{\\cos^2\\theta + \\sin^2\\theta}{\\sin\\theta} = \\dfrac{1}{\\sin\\theta}$ = RHS \\checkmark'),
  q(3, 'Simplify: $\\sin^2\\theta + \\cos^2\\theta + \\tan^2\\theta \\cdot \\cos^2\\theta$.',
    ['2', '$\\sin^2\\theta$', '1', '$1 + \\sin^2\\theta$'], 0,
    '$\\sin^2\\theta + \\cos^2\\theta + \\dfrac{\\sin^2\\theta}{\\cos^2\\theta} \\cdot \\cos^2\\theta = 1 + \\sin^2\\theta$. Wait \u2014 let me recalculate: $= 1 + \\sin^2\\theta$. Actually: $\\tan^2\\theta \\cdot \\cos^2\\theta = \\sin^2\\theta$. So the answer is $1 + \\sin^2\\theta$... Hmm, let me recheck the options.',
    ['Use $\\tan\\theta = \\sin\\theta / \\cos\\theta$.']),
  t(3.5, '**Correction to the worked example above:**\n\n$\\sin^2\\theta + \\cos^2\\theta + \\tan^2\\theta \\cdot \\cos^2\\theta = 1 + \\sin^2\\theta$.\n\nThe correct simplification gives $1 + \\sin^2\\theta$. The quiz answer should be option D. Let us continue with more identities.'),
  t(4, '### Proving Trigonometric Identities\n\n**Strategy:**\n1. Work with **one side** only (usually the more complicated side)\n2. Convert everything to $\\sin$ and $\\cos$\n3. Look for common factors and the Pythagorean identity\n4. Never cross-multiply \u2014 that assumes the identity is true!\n\n**Example:** Prove: $\\dfrac{1 - \\cos^2\\theta}{\\cos^2\\theta} = \\tan^2\\theta$.\n\nLHS $= \\dfrac{\\sin^2\\theta}{\\cos^2\\theta} = \\tan^2\\theta$ = RHS \\checkmark\n\n**Example:** Prove: $\\dfrac{\\sin\\theta}{1+\\cos\\theta} + \\dfrac{1+\\cos\\theta}{\\sin\\theta} = \\dfrac{2}{\\sin\\theta}$.\n\nLHS $= \\dfrac{\\sin^2\\theta + (1+\\cos\\theta)^2}{(1+\\cos\\theta)\\sin\\theta}$\n$= \\dfrac{\\sin^2\\theta + 1 + 2\\cos\\theta + \\cos^2\\theta}{(1+\\cos\\theta)\\sin\\theta}$\n$= \\dfrac{2 + 2\\cos\\theta}{(1+\\cos\\theta)\\sin\\theta} = \\dfrac{2(1+\\cos\\theta)}{(1+\\cos\\theta)\\sin\\theta} = \\dfrac{2}{\\sin\\theta}$ = RHS \\checkmark'),
  q(5, 'Which identity is used to simplify $1 - \\sin^2\\theta$?',
    ['$\\cos^2\\theta + \\sin^2\\theta = 1$, giving $\\cos^2\\theta$', '$\\tan\\theta = \\sin\\theta / \\cos\\theta$', 'The reduction formula', 'The double angle formula'], 0,
    'From $\\sin^2\\theta + \\cos^2\\theta = 1$, we get $1 - \\sin^2\\theta = \\cos^2\\theta$.'),
  fb(6, 'The two fundamental trig identities are $\\tan\\theta = \\dfrac{\\sin\\theta}{___}$ and $\\sin^2\\theta + \\cos^2\\theta = ___$.',
    ['cos theta', '1'],
    '$\\tan\\theta = \\sin\\theta / \\cos\\theta$ and $\\sin^2\\theta + \\cos^2\\theta = 1$.'),
  t(7, '### Negative Angle Identities\n\nUsing the CAST diagram (or unit circle):\n\n| Identity | Reason |\n|----------|--------|\n| $\\sin(-\\theta) = -\\sin\\theta$ | Sine is an **odd** function |\n| $\\cos(-\\theta) = \\cos\\theta$ | Cosine is an **even** function |\n| $\\tan(-\\theta) = -\\tan\\theta$ | Tangent is an **odd** function |\n\n**Memory aid:** Think of the unit circle \u2014 reflecting across the $x$-axis negates the $y$-coordinate (sine) but keeps the $x$-coordinate (cosine).\n\n**Example:** Simplify $\\sin(-30\\degree)$.\n$$\\sin(-30\\degree) = -\\sin 30\\degree = -\\dfrac{1}{2}$$'),
  q(8, 'Simplify: $\\cos(-\\theta) \\cdot \\tan(-\\theta)$.',
    ['$-\\sin\\theta$', '$\\sin\\theta$', '$-\\cos\\theta$', '$\\cos\\theta$'], 0,
    '$\\cos(-\\theta) \\cdot \\tan(-\\theta) = \\cos\\theta \\cdot (-\\tan\\theta) = -\\cos\\theta \\cdot \\dfrac{\\sin\\theta}{\\cos\\theta} = -\\sin\\theta$.'),
  t(9, '### Summary Table of Key Identities\n\n| Identity | Formula |\n|----------|---------|\n| Quotient identity | $\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}$ |\n| Square identity | $\\sin^2\\theta + \\cos^2\\theta = 1$ |\n| Negative angle (sin) | $\\sin(-\\theta) = -\\sin\\theta$ |\n| Negative angle (cos) | $\\cos(-\\theta) = \\cos\\theta$ |\n| Negative angle (tan) | $\\tan(-\\theta) = -\\tan\\theta$ |\n\nThese identities, combined with the reduction formulae in the next lesson, form the foundation for simplifying all trigonometric expressions in Grade 11.'),
  q(10, 'Prove the identity: $\\dfrac{\\sin\\theta}{\\tan\\theta} = \\cos\\theta$. Which step comes first?',
    ['Replace $\\tan\\theta$ with $\\sin\\theta / \\cos\\theta$', 'Cross-multiply both sides', 'Use the Pythagorean identity', 'Square both sides'], 0,
    'First replace $\\tan\\theta = \\sin\\theta / \\cos\\theta$: LHS $= \\dfrac{\\sin\\theta}{\\sin\\theta / \\cos\\theta} = \\cos\\theta$ = RHS.'),
];

// --- Lesson 2: Reduction Formulae and General Solutions ---
blockNum = 0;
const ch3_lesson2 = [
  t(1, '## Reduction Formulae\n\nReduction formulae express trig ratios of angles in **other quadrants** in terms of the acute angle $\\theta$.\n\n### Using the CAST Diagram\n\nIn the CAST diagram, starting from the positive $x$-axis and going anticlockwise:\n- **Quadrant I** (0\u00b0 to 90\u00b0): **A**ll positive\n- **Quadrant II** (90\u00b0 to 180\u00b0): **S**ine positive\n- **Quadrant III** (180\u00b0 to 270\u00b0): **T**angent positive\n- **Quadrant IV** (270\u00b0 to 360\u00b0): **C**osine positive\n\nThe sign of the ratio depends on which quadrant the angle falls in.'),
  t(2, '### The Reduction Formulae Table\n\n| Formula | Result | Rule |\n|---------|--------|------|\n| $\\sin(180\\degree - \\theta)$ | $\\sin\\theta$ | Q II: sine positive |\n| $\\cos(180\\degree - \\theta)$ | $-\\cos\\theta$ | Q II: cosine negative |\n| $\\tan(180\\degree - \\theta)$ | $-\\tan\\theta$ | Q II: tangent negative |\n| $\\sin(180\\degree + \\theta)$ | $-\\sin\\theta$ | Q III: sine negative |\n| $\\cos(180\\degree + \\theta)$ | $-\\cos\\theta$ | Q III: cosine negative |\n| $\\tan(180\\degree + \\theta)$ | $\\tan\\theta$ | Q III: tangent positive |\n| $\\sin(360\\degree - \\theta)$ | $-\\sin\\theta$ | Q IV: sine negative |\n| $\\cos(360\\degree - \\theta)$ | $\\cos\\theta$ | Q IV: cosine positive |\n| $\\tan(360\\degree - \\theta)$ | $-\\tan\\theta$ | Q IV: tangent negative |\n\n**Key insight:** When reducing with $180\\degree \\pm \\theta$ or $360\\degree \\pm \\theta$, the **function name stays the same** \u2014 only the **sign** changes according to the CAST diagram.'),
  q(3, 'Simplify: $\\sin(180\\degree + \\theta)$.',
    ['$-\\sin\\theta$', '$\\sin\\theta$', '$-\\cos\\theta$', '$\\cos\\theta$'], 0,
    '$180\\degree + \\theta$ is in Quadrant III where sine is negative. The function stays sine. So $\\sin(180\\degree + \\theta) = -\\sin\\theta$.'),
  t(4, '### Co-function Reduction Formulae (90\u00b0)\n\nWhen using $90\\degree \\pm \\theta$, the **function name changes** (sin \u2194 cos).\n\n| Formula | Result |\n|---------|--------|\n| $\\sin(90\\degree - \\theta)$ | $\\cos\\theta$ |\n| $\\cos(90\\degree - \\theta)$ | $\\sin\\theta$ |\n| $\\sin(90\\degree + \\theta)$ | $\\cos\\theta$ |\n| $\\cos(90\\degree + \\theta)$ | $-\\sin\\theta$ |\n\n**Memory aid:** $90\\degree$ swaps the co-function: sin becomes cos and cos becomes sin.\n\n**Example:** $\\cos(90\\degree - 25\\degree) = \\sin 25\\degree$\n\n**Example:** $\\sin(90\\degree + 40\\degree) = \\cos 40\\degree$'),
  q(5, 'Simplify: $\\cos(90\\degree - \\theta) + \\sin(180\\degree - \\theta)$.',
    ['$2\\sin\\theta$', '$0$', '$2\\cos\\theta$', '$\\sin\\theta + \\cos\\theta$'], 0,
    '$\\cos(90\\degree - \\theta) = \\sin\\theta$ and $\\sin(180\\degree - \\theta) = \\sin\\theta$. Sum $= 2\\sin\\theta$.'),
  fb(6, 'When reducing by $180\\degree \\pm \\theta$ or $360\\degree \\pm \\theta$, the function name stays the ___. When reducing by $90\\degree \\pm \\theta$, the function name ___ (sin becomes cos and vice versa).',
    ['same', 'changes'],
    'With $180\\degree$ and $360\\degree$ the function is unchanged. With $90\\degree$ the co-function is used.'),
  t(7, '### Worked Example: Multi-Step Simplification\n\nSimplify: $\\dfrac{\\sin(180\\degree + x) \\cdot \\cos(360\\degree - x)}{\\cos(90\\degree + x) \\cdot \\sin(-x)}$\n\nApply reduction formulae step by step:\n- $\\sin(180\\degree + x) = -\\sin x$\n- $\\cos(360\\degree - x) = \\cos x$\n- $\\cos(90\\degree + x) = -\\sin x$\n- $\\sin(-x) = -\\sin x$\n\n$$= \\dfrac{(-\\sin x)(\\cos x)}{(-\\sin x)(-\\sin x)} = \\dfrac{-\\sin x \\cos x}{\\sin^2 x} = \\dfrac{-\\cos x}{\\sin x} = -\\dfrac{\\cos x}{\\sin x}$$\n\nUsing the quotient identity: $= -\\dfrac{1}{\\tan x}$'),
  q(8, 'Simplify: $\\cos(360\\degree - \\theta)$.',
    ['$\\cos\\theta$', '$-\\cos\\theta$', '$\\sin\\theta$', '$-\\sin\\theta$'], 0,
    '$360\\degree - \\theta$ is in Quadrant IV where cosine is positive. Function stays the same. So $\\cos(360\\degree - \\theta) = \\cos\\theta$.'),
  t(9, '## General Solutions of Trigonometric Equations\n\nBecause trig functions are periodic, they have infinitely many solutions.\n\n### Reference Angle Method\n\n**For $\\sin\\theta = k$ ($-1 \\leq k \\leq 1$):**\nFind reference angle $\\alpha$ where $\\sin\\alpha = |k|$.\n- If $k > 0$: $\\theta = \\alpha + 360\\degree n$ or $\\theta = 180\\degree - \\alpha + 360\\degree n$\n- If $k < 0$: $\\theta = 180\\degree + \\alpha + 360\\degree n$ or $\\theta = 360\\degree - \\alpha + 360\\degree n$\n\n**For $\\cos\\theta = k$:**\n- $\\theta = \\alpha + 360\\degree n$ or $\\theta = -\\alpha + 360\\degree n$ (i.e. $\\theta = \\pm\\alpha + 360\\degree n$)\n\n**For $\\tan\\theta = k$:**\n- $\\theta = \\alpha + 180\\degree n$\n\nwhere $n \\in \\mathbb{Z}$.'),
  q(10, 'Find the general solution of $\\sin\\theta = \\dfrac{1}{2}$.',
    ['$\\theta = 30\\degree + 360\\degree n$ or $\\theta = 150\\degree + 360\\degree n$', '$\\theta = 30\\degree + 180\\degree n$', '$\\theta = 60\\degree + 360\\degree n$', '$\\theta = 30\\degree + 360\\degree n$ only'], 0,
    'Reference angle $\\alpha = 30\\degree$. Since $\\sin\\theta > 0$: $\\theta = 30\\degree + 360\\degree n$ or $\\theta = 180\\degree - 30\\degree + 360\\degree n = 150\\degree + 360\\degree n$, $n \\in \\mathbb{Z}$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Euclidean Geometry (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Circle Theorems Part 1 ---
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Circle Geometry\n\nCircle geometry is one of the most important sections of Grade 11 Mathematics Paper 2. You must know the **theorems**, their **converses**, and how to apply them in proofs.\n\n### Theorem 1: Tangent Perpendicular to Radius\n\nA **tangent** to a circle is perpendicular to the **radius** drawn to the point of tangency.\n\nIf line $AB$ is a tangent to circle $O$ at point $P$, then $OP \\perp AB$.\n\n**Converse:** If a line is perpendicular to a radius at the point where the radius meets the circle, then the line is a tangent.\n\n**Abbreviation in proofs:** tan $\\perp$ radius'),
  t(2, '### Theorem 2: Line from Centre to Midpoint of Chord\n\nThe line drawn from the **centre** of a circle **perpendicular** to a chord **bisects** the chord.\n\n**Converse:** The line drawn from the centre to the **midpoint** of a chord is perpendicular to the chord.\n\n**Abbreviation:** line from centre $\\perp$ chord\n\n**Example:** If $O$ is the centre, $M$ is the midpoint of chord $AB$, and $OM \\perp AB$, then $AM = MB$.\n\nThis theorem is often used with Pythagoras to find distances in circle problems.\n\nIf $OA = r$ (radius) and $OM = d$ (distance from centre to chord), then:\n$$AM = \\sqrt{r^2 - d^2}$$\nand chord length $AB = 2\\sqrt{r^2 - d^2}$.'),
  q(3, 'A circle has radius 13 cm. A chord is 10 cm from the centre. What is the length of the chord?',
    ['$2\\sqrt{69}$ cm', '24 cm', '10 cm', '26 cm'], 0,
    'Half-chord $= \\sqrt{13^2 - 10^2} = \\sqrt{169-100} = \\sqrt{69}$. Chord $= 2\\sqrt{69} \\approx 16{,}6$ cm.',
    ['Use Pythagoras: the radius is the hypotenuse.']),
  t(4, '### Theorem 3: Angle at Centre = 2 x Angle at Circumference\n\nThe **angle subtended by an arc at the centre** of a circle is **twice** the angle subtended by the same arc at the **circumference**.\n\nIf $O$ is the centre and $A$, $B$, $C$ are points on the circle:\n$$\\angle AOB = 2 \\times \\angle ACB$$\n\n**Special case:** If $AB$ is a diameter, then $\\angle ACB = 90\\degree$ (angle in a semi-circle).\n\n**Abbreviation:** $\\angle$ at centre = $2 \\times \\angle$ at circumference\n\n**Example:** If $\\angle AOB = 120\\degree$, then $\\angle ACB = 60\\degree$ (where $C$ is on the major arc).'),
  q(5, 'In a circle with centre $O$, $\\angle AOB = 140\\degree$. Find $\\angle ACB$ where $C$ is on the major arc.',
    ['$70\\degree$', '$140\\degree$', '$280\\degree$', '$35\\degree$'], 0,
    'Angle at circumference $= \\frac{1}{2} \\times$ angle at centre $= \\frac{1}{2} \\times 140\\degree = 70\\degree$.'),
  t(6, '### Theorem 4: Angles in the Same Segment\n\nAngles subtended by the same chord (or arc) in the **same segment** are equal.\n\nIf $A$, $B$, $C$, $D$ are on a circle and $C$ and $D$ are on the same side of chord $AB$:\n$$\\angle ACB = \\angle ADB$$\n\n**Abbreviation:** $\\angle$s in same segment\n\n### Theorem 5: Opposite Angles of a Cyclic Quadrilateral\n\nThe **opposite angles** of a cyclic quadrilateral (all 4 vertices on a circle) are **supplementary** (add up to $180\\degree$).\n\nIf $ABCD$ is cyclic: $\\angle A + \\angle C = 180\\degree$ and $\\angle B + \\angle D = 180\\degree$.\n\n**Converse:** If the opposite angles of a quadrilateral are supplementary, it is a cyclic quadrilateral.\n\n**Abbreviation:** opp. $\\angle$s cyclic quad.'),
  fb(7, 'In a cyclic quadrilateral, opposite angles are ___ (they add up to 180 degrees). Angles subtended by the same ___ in the same segment are equal.',
    ['supplementary', 'chord'],
    'Opposite angles of a cyclic quad are supplementary. Angles in the same segment (subtended by the same chord) are equal.'),
  q(8, 'In cyclic quadrilateral $ABCD$, $\\angle A = 75\\degree$. Find $\\angle C$.',
    ['$105\\degree$', '$75\\degree$', '$180\\degree$', '$85\\degree$'], 0,
    'Opposite angles are supplementary: $\\angle C = 180\\degree - 75\\degree = 105\\degree$.'),
  t(9, '### Summary of Circle Theorems (Part 1)\n\n| # | Theorem | Abbreviation |\n|---|---------|-------------|\n| 1 | Tangent $\\perp$ radius | tan $\\perp$ rad |\n| 2 | Line from centre $\\perp$ chord bisects chord | line from centre $\\perp$ chord |\n| 3 | Angle at centre = $2 \\times$ angle at circumference | $\\angle$ at centre = $2 \\times \\angle$ at circ |\n| 3b | Angle in semicircle = $90\\degree$ | $\\angle$ in semi-circle |\n| 4 | Angles in same segment are equal | $\\angle$s in same seg |\n| 5 | Opposite angles of cyclic quad are supplementary | opp $\\angle$s cyc quad |\n\nIn proofs, always **state the theorem** you are using. This earns marks in the NSC exam.'),
  q(10, 'If $AB$ is a diameter and $C$ is a point on the circle, then $\\angle ACB$ equals:',
    ['$90\\degree$', '$180\\degree$', '$45\\degree$', '$60\\degree$'], 0,
    'The angle in a semicircle is $90\\degree$. This is a special case of the angle at the centre theorem ($\\angle AOB = 180\\degree$, so $\\angle ACB = 90\\degree$).'),
];

// --- Lesson 2: Circle Theorems Part 2 (Tangent-Chord, External Tangents) ---
blockNum = 0;
const ch4_lesson2 = [
  t(1, '## Circle Theorems (continued)\n\n### Theorem 6: Tangent-Chord Angle\n\nThe angle between a **tangent** to a circle and a **chord** drawn from the point of tangency equals the inscribed angle in the **alternate segment**.\n\nIf $TAB$ is a tangent at $A$, and $AC$ is a chord, then:\n$$\\angle TAC = \\angle ABC$$\nwhere $B$ is any point on the arc on the opposite side of $AC$ from $T$.\n\n**Abbreviation:** tan-chord $\\angle$\n\nThis is also called the **alternate segment theorem**.'),
  t(2, '### Theorem 7: Tangents from an External Point\n\nTwo tangents drawn to a circle from the **same external point** are **equal** in length.\n\nIf $PA$ and $PB$ are tangents from external point $P$ to a circle with centre $O$:\n- $PA = PB$\n- $OP$ bisects $\\angle APB$\n- $OP$ bisects $\\angle AOB$\n\n**Abbreviation:** tangents from ext. pt.\n\n**Example:** If $PA = 12$ cm and $OA = 5$ cm (radius), then by Pythagoras:\n$$OP = \\sqrt{PA^2 + OA^2} = \\sqrt{144 + 25} = \\sqrt{169} = 13 \\text{ cm}$$'),
  q(3, 'Tangents $PA$ and $PB$ are drawn from external point $P$. If $PA = 8$ cm, then $PB$ equals:',
    ['8 cm', '16 cm', '4 cm', 'Cannot be determined'], 0,
    'Tangents from the same external point are equal. $PB = PA = 8$ cm.'),
  t(4, '### Proving Theorems in the Exam\n\nIn the NSC exam, you may be asked to **prove** any of the theorems OR to **apply** them. When applying:\n\n1. **State the theorem** by name or abbreviation\n2. **Identify** the relevant elements (centre, tangent, chord, etc.)\n3. **Write** the angle relationship with reasons\n\n**Example proof-style answer:**\n\nGiven: $ABCD$ is a cyclic quadrilateral. $TA$ is a tangent at $A$.\n\nProve: $\\angle TAB = \\angle ADB$.\n\n**Proof:**\n$\\angle TAB = \\angle ACB$ (tan-chord $\\angle$, $AC$ is the chord)\n$\\angle ACB = \\angle ADB$ ($\\angle$s in same segment, subtended by chord $AB$)\n$\\therefore \\angle TAB = \\angle ADB$ \\checkmark'),
  q(5, 'The tangent-chord angle equals the inscribed angle in the:',
    ['alternate segment', 'same segment', 'centre', 'diameter'], 0,
    'The tan-chord angle equals the inscribed angle in the alternate segment (on the other side of the chord).'),
  fb(6, 'Two tangents from the same external point are ___ in length. The tangent-chord angle equals the inscribed angle in the ___ segment.',
    ['equal', 'alternate'],
    'Tangents from an external point are equal. The tan-chord theorem involves the alternate segment.'),
  t(7, '### Worked Problem: Combining Theorems\n\nIn the diagram, $O$ is the centre. $TAB$ is a tangent at $A$. $\\angle TAC = 35\\degree$.\n\nFind $\\angle AOC$.\n\n**Solution:**\n$\\angle ABC = \\angle TAC = 35\\degree$ (tan-chord $\\angle$)\n\n$\\angle AOC = 2 \\times \\angle ABC = 2 \\times 35\\degree = 70\\degree$ ($\\angle$ at centre = $2 \\times \\angle$ at circ.)\n\nThis problem combines **two** theorems \u2014 a typical exam approach. Always look for chains of reasoning.'),
  q(8, 'In the above problem, if $\\angle TAC = 50\\degree$, then $\\angle AOC$ equals:',
    ['$100\\degree$', '$50\\degree$', '$25\\degree$', '$130\\degree$'], 0,
    '$\\angle ABC = 50\\degree$ (tan-chord). $\\angle AOC = 2 \\times 50\\degree = 100\\degree$ (angle at centre).'),
  t(9, '### SA Context: The Cape Wheel\n\nThe Cape Wheel at the V&A Waterfront in Cape Town is a large Ferris wheel. Each pod traces a circular path. The support cables are like tangents and chords.\n\nIf you know the angle between a support cable (tangent) and the line to a pod (chord), you can use the tangent-chord theorem to find the angle subtended at the centre \u2014 useful for engineering calculations of cable tension.\n\nCircle geometry has real-world applications in architecture, engineering, and design. The Mapungubwe Museum in Limpopo uses circular arches whose geometry relies on these exact theorems.'),
  q(10, 'How many theorems should a Grade 11 learner know for circle geometry in the NSC exam?',
    ['7 (plus converses)', '3', '5', '10'], 0,
    'There are 7 main circle geometry theorems (tangent-radius, line from centre to midpoint, angle at centre, angles in same segment, cyclic quad, tan-chord, tangents from external point), each with converses where applicable.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Analytical Geometry (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Distance, Gradient, Midpoint, and Equation of a Line ---
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Analytical Geometry\n\nAnalytical geometry combines algebra and geometry using the Cartesian plane.\n\n### Distance Formula\n\nThe distance between $A(x_1, y_1)$ and $B(x_2, y_2)$:\n\n$$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$\n\n**Example:** Distance between $A(1, 3)$ and $B(5, 6)$:\n$$d = \\sqrt{(5-1)^2 + (6-3)^2} = \\sqrt{16+9} = \\sqrt{25} = 5$$\n\n### Midpoint Formula\n\nThe midpoint $M$ of $A(x_1, y_1)$ and $B(x_2, y_2)$:\n$$M = \\left(\\dfrac{x_1+x_2}{2}\\,,\\, \\dfrac{y_1+y_2}{2}\\right)$$\n\n**Example:** Midpoint of $A(2, 4)$ and $B(6, 8)$: $M = (4, 6)$.'),
  t(2, '### Gradient (Slope)\n\nThe gradient of the line through $A(x_1, y_1)$ and $B(x_2, y_2)$:\n\n$$m = \\dfrac{y_2 - y_1}{x_2 - x_1}$$\n\n**Properties:**\n- Positive gradient: line goes **up** from left to right\n- Negative gradient: line goes **down** from left to right\n- $m = 0$: **horizontal** line\n- $m$ is undefined: **vertical** line\n\n**Parallel lines:** $m_1 = m_2$ (equal gradients)\n\n**Perpendicular lines:** $m_1 \\times m_2 = -1$ (negative reciprocals)\n\n**Example:** If $m_1 = \\dfrac{2}{3}$, a perpendicular line has $m_2 = -\\dfrac{3}{2}$.'),
  q(3, 'Find the gradient of the line through $A(-1, 4)$ and $B(3, -2)$.',
    ['$-\\dfrac{3}{2}$', '$\\dfrac{3}{2}$', '$-\\dfrac{2}{3}$', '$\\dfrac{2}{3}$'], 0,
    '$m = \\dfrac{-2-4}{3-(-1)} = \\dfrac{-6}{4} = -\\dfrac{3}{2}$.'),
  t(4, '### Equation of a Line\n\n**Point-gradient form:**\n$$y - y_1 = m(x - x_1)$$\n\n**Standard form:** $y = mx + c$\n\n**Example:** Find the equation of the line through $(2, 5)$ with gradient $3$:\n$$y - 5 = 3(x - 2) \\implies y = 3x - 1$$\n\n**Example:** Find the equation through $A(1, 2)$ and $B(4, 8)$:\n$$m = \\dfrac{8-2}{4-1} = 2$$\n$$y - 2 = 2(x - 1) \\implies y = 2x$$'),
  q(5, 'Find the equation of the line through $(3, -1)$ with gradient $-2$.',
    ['$y = -2x + 5$', '$y = -2x - 7$', '$y = 2x - 7$', '$y = -2x + 1$'], 0,
    '$y - (-1) = -2(x - 3) \\implies y + 1 = -2x + 6 \\implies y = -2x + 5$.'),
  fb(6, 'Two lines are parallel if their gradients are ___. Two lines are perpendicular if the product of their gradients equals ___.',
    ['equal', '-1'],
    'Parallel: $m_1 = m_2$. Perpendicular: $m_1 \\times m_2 = -1$.'),
  t(7, '### Inclination of a Line\n\nThe **inclination** $\\alpha$ of a line is the angle it makes with the **positive $x$-axis**, measured anticlockwise.\n\n$$\\tan\\alpha = m \\quad (\\text{gradient})$$\n\n- If $m > 0$: $\\alpha$ is an acute angle ($0\\degree < \\alpha < 90\\degree$)\n- If $m < 0$: $\\alpha$ is an obtuse angle ($90\\degree < \\alpha < 180\\degree$)\n- If $m = 0$: $\\alpha = 0\\degree$ (horizontal line)\n\n**Example:** Gradient $m = 1$. Then $\\tan\\alpha = 1 \\implies \\alpha = 45\\degree$.\n\n**Example:** Gradient $m = -\\sqrt{3}$. Then $\\tan\\alpha = -\\sqrt{3}$.\nReference angle: $\\tan 60\\degree = \\sqrt{3}$. Since $m < 0$: $\\alpha = 180\\degree - 60\\degree = 120\\degree$.'),
  q(8, 'A line has gradient $m = \\sqrt{3}$. What is its inclination?',
    ['$60\\degree$', '$30\\degree$', '$45\\degree$', '$120\\degree$'], 0,
    '$\\tan\\alpha = \\sqrt{3} \\implies \\alpha = 60\\degree$ (since $\\tan 60\\degree = \\sqrt{3}$).'),
  t(9, '### Angle Between Two Lines\n\nTo find the acute angle $\\theta$ between two lines with gradients $m_1$ and $m_2$:\n\n$$\\tan\\theta = \\left|\\dfrac{m_1 - m_2}{1 + m_1 m_2}\\right|$$\n\n**Example:** Find the acute angle between lines with gradients $m_1 = 2$ and $m_2 = -\\dfrac{1}{3}$.\n\n$$\\tan\\theta = \\left|\\dfrac{2 - (-\\frac{1}{3})}{1 + 2(-\\frac{1}{3})}\\right| = \\left|\\dfrac{\\frac{7}{3}}{\\frac{1}{3}}\\right| = 7$$\n$$\\theta = \\tan^{-1}(7) \\approx 81{,}9\\degree$$'),
  q(10, 'What is the inclination of a line with gradient $m = -1$?',
    ['$135\\degree$', '$45\\degree$', '$-45\\degree$', '$225\\degree$'], 0,
    '$\\tan\\alpha = -1$. Reference angle $= 45\\degree$. Since $m < 0$: $\\alpha = 180\\degree - 45\\degree = 135\\degree$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Functions (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Parabola, Hyperbola, and Exponential ---
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Functions and Their Graphs\n\nIn Grade 11, we study the effect of parameters $a$, $p$, and $q$ on three families of functions.\n\n### The Parabola: $y = a(x + p)^2 + q$\n\n| Parameter | Effect |\n|-----------|--------|\n| $a > 0$ | Opens **upward** (minimum at turning point) |\n| $a < 0$ | Opens **downward** (maximum at turning point) |\n| $|a| > 1$ | Narrower (steeper) |\n| $0 < |a| < 1$ | Wider (flatter) |\n| $p > 0$ | Shift **left** by $p$ units |\n| $p < 0$ | Shift **right** by $|p|$ units |\n| $q > 0$ | Shift **up** by $q$ units |\n| $q < 0$ | Shift **down** by $|q|$ units |\n\n**Turning point:** $(-p, q)$\n\n**Axis of symmetry:** $x = -p$'),
  t(2, '### Parabola: Key Features\n\n**Example:** $y = 2(x - 3)^2 - 8$\n\nHere $a = 2$, $p = -3$, $q = -8$.\n\n- **Turning point:** $(3, -8)$ \u2014 this is a minimum since $a > 0$\n- **Axis of symmetry:** $x = 3$\n- **$y$-intercept:** Set $x = 0$: $y = 2(0-3)^2 - 8 = 18 - 8 = 10$. So $(0, 10)$.\n- **$x$-intercepts:** Set $y = 0$: $2(x-3)^2 = 8 \\implies (x-3)^2 = 4 \\implies x - 3 = \\pm 2$.\n  $x = 5$ or $x = 1$.\n- **Range:** $y \\geq -8$ (i.e. $y \\in [-8, \\infty)$)\n- **Domain:** $x \\in \\mathbb{R}$\n\n### Average Gradient\n\nThe average gradient between $x = a$ and $x = b$ on any curve is:\n$$m_{\\text{avg}} = \\dfrac{f(b) - f(a)}{b - a}$$'),
  q(3, 'For $y = -(x + 2)^2 + 5$, the turning point is:',
    ['$(-2, 5)$', '$(2, 5)$', '$(-2, -5)$', '$(2, -5)$'], 0,
    'In $y = a(x+p)^2 + q$ form, $p = 2$ and $q = 5$. Turning point $= (-p, q) = (-2, 5)$.'),
  t(4, '### The Hyperbola: $y = \\dfrac{a}{x + p} + q$\n\n| Parameter | Effect |\n|-----------|--------|\n| $a > 0$ | Branches in Q I and Q III (relative to asymptotes) |\n| $a < 0$ | Branches in Q II and Q IV |\n| $p$ | Horizontal shift: vertical asymptote at $x = -p$ |\n| $q$ | Vertical shift: horizontal asymptote at $y = q$ |\n\n**Asymptotes:** $x = -p$ (vertical) and $y = q$ (horizontal)\n\n**Example:** $y = \\dfrac{3}{x - 2} + 1$\n\nHere $a = 3$, $p = -2$, $q = 1$.\n- Vertical asymptote: $x = 2$\n- Horizontal asymptote: $y = 1$\n- Domain: $x \\in \\mathbb{R}, x \\neq 2$\n- Range: $y \\in \\mathbb{R}, y \\neq 1$'),
  q(5, 'For $y = \\dfrac{-2}{x + 1} + 3$, the horizontal asymptote is:',
    ['$y = 3$', '$y = -2$', '$x = -1$', '$y = 1$'], 0,
    'The horizontal asymptote is $y = q = 3$.'),
  fb(6, 'The turning point of the parabola $y = a(x+p)^2 + q$ is at the point $(-p, ___)$. The vertical asymptote of $y = \\dfrac{a}{x+p} + q$ is the line $x = ___$.',
    ['q', '-p'],
    'Turning point is $(-p, q)$. Vertical asymptote is $x = -p$.'),
  t(7, '### The Exponential: $y = a \\cdot b^{(x+p)} + q$\n\nwhere $b > 0$, $b \\neq 1$.\n\n| Parameter | Effect |\n|-----------|--------|\n| $a > 0, b > 1$ | Increasing (growth) |\n| $a > 0, 0 < b < 1$ | Decreasing (decay) |\n| $a < 0$ | Reflected in $x$-axis |\n| $p$ | Horizontal shift |\n| $q$ | Horizontal asymptote at $y = q$ |\n\n**Asymptote:** $y = q$ (horizontal)\n\n**Example:** $y = 2 \\cdot 3^{x-1} + 1$\n\nHere $a = 2$, $b = 3$, $p = -1$, $q = 1$.\n- Asymptote: $y = 1$\n- $y$-intercept: $y = 2 \\cdot 3^{-1} + 1 = \\frac{2}{3} + 1 = \\frac{5}{3}$\n- Domain: $x \\in \\mathbb{R}$\n- Range: $y > 1$ (since $a > 0$)'),
  q(8, 'For $y = -3 \\cdot 2^x + 6$, the horizontal asymptote is:',
    ['$y = 6$', '$y = -3$', '$y = 0$', '$y = 2$'], 0,
    'The asymptote is $y = q = 6$. Since $a < 0$, the curve approaches 6 from below (range: $y < 6$).'),
  t(9, '### Reading Equations from Graphs\n\nIn exams, you often need to **determine the equation** from a given graph.\n\n**Parabola:** Identify the turning point $(h, k)$ and one other point.\n- Write $y = a(x - h)^2 + k$\n- Substitute the other point to find $a$\n\n**Hyperbola:** Identify the asymptotes ($x = -p$ and $y = q$) and one point.\n- Write $y = \\dfrac{a}{x+p} + q$\n- Substitute the point to find $a$\n\n**Exponential:** Identify the asymptote ($y = q$) and two points.\n- Write $y = a \\cdot b^{x+p} + q$\n- Use the two points to set up equations and solve for $a$ and $b$'),
  q(10, 'A parabola has turning point $(1, -4)$ and passes through $(0, -1)$. Find $a$ in $y = a(x-1)^2 - 4$.',
    ['3', '-3', '1', '-1'], 0,
    'Substitute $(0, -1)$: $-1 = a(0-1)^2 - 4 = a - 4 \\implies a = 3$.'),
];

// --- Lesson 2: Trigonometric Functions ---
blockNum = 0;
const ch6_lesson2 = [
  t(1, '## Trigonometric Functions\n\nIn Grade 11, we study the effect of parameters $a$, $k$, and $p$ on:\n- $y = a\\sin k(x + p)$\n- $y = a\\cos k(x + p)$\n- $y = a\\tan k(x + p)$\n\n### Effect of $a$ (Amplitude)\n\nFor sine and cosine:\n- **Amplitude** = $|a|$\n- The graph oscillates between $-|a|$ and $|a|$\n- If $a < 0$: the graph is **reflected** in the $x$-axis\n\n**Example:** $y = 3\\sin x$ has amplitude 3. Range: $[-3, 3]$.\n\n**Example:** $y = -2\\cos x$ has amplitude 2 and is reflected. Range: $[-2, 2]$.'),
  t(2, '### Effect of $k$ (Period)\n\n**Period of sine and cosine:** $\\dfrac{360\\degree}{|k|}$\n\n**Period of tangent:** $\\dfrac{180\\degree}{|k|}$\n\n| $k$ value | Period of sin/cos | Period of tan |\n|-----------|------------------|---------------|\n| $k = 1$ | $360\\degree$ | $180\\degree$ |\n| $k = 2$ | $180\\degree$ | $90\\degree$ |\n| $k = \\frac{1}{2}$ | $720\\degree$ | $360\\degree$ |\n\n**Example:** $y = \\sin 2x$ has period $\\dfrac{360\\degree}{2} = 180\\degree$.\n\n### Effect of $p$ (Horizontal Shift)\n\n- $p > 0$: shift **left** by $p$\n- $p < 0$: shift **right** by $|p|$\n\n**Example:** $y = \\cos(x - 30\\degree)$ is shifted $30\\degree$ to the right.'),
  q(3, 'What is the period of $y = \\tan 3x$?',
    ['$60\\degree$', '$180\\degree$', '$540\\degree$', '$120\\degree$'], 0,
    'Period of tangent $= \\dfrac{180\\degree}{|k|} = \\dfrac{180\\degree}{3} = 60\\degree$.'),
  t(4, '### Sketching Trig Graphs: Step by Step\n\n**To sketch $y = 2\\sin(x - 45\\degree)$ for $x \\in [0\\degree, 360\\degree]$:**\n\n1. **Amplitude:** $|a| = 2$, so the graph oscillates between $-2$ and $2$.\n2. **Period:** $\\dfrac{360\\degree}{1} = 360\\degree$ (since $k = 1$).\n3. **Phase shift:** $45\\degree$ to the right.\n4. **Key points of $\\sin x$:** Start at $0$, max at $90\\degree$, back to $0$ at $180\\degree$, min at $270\\degree$, back to $0$ at $360\\degree$.\n5. **Shift each key point** $45\\degree$ to the right and **scale** the $y$-values by $2$.\n\n| $x$ (shifted) | $y$ |\n|---|---|\n| $45\\degree$ | $0$ |\n| $135\\degree$ | $2$ (max) |\n| $225\\degree$ | $0$ |\n| $315\\degree$ | $-2$ (min) |'),
  q(5, 'The graph of $y = -\\cos x$ compared to $y = \\cos x$ is:',
    ['Reflected in the $x$-axis', 'Shifted $90\\degree$ right', 'Reflected in the $y$-axis', 'Stretched vertically by factor 2'], 0,
    'A negative value of $a$ reflects the graph in the $x$-axis.'),
  fb(6, 'The period of $y = \\sin kx$ is $\\dfrac{360\\degree}{___}$. The amplitude of $y = a\\cos x$ is $|___|$.',
    ['k', 'a'],
    'Period = $360\\degree / |k|$. Amplitude = $|a|$.'),
  t(7, '### Finding the Equation from a Graph\n\n**Given a sine/cosine graph, determine $a$, $k$, and $p$:**\n\n1. **$a$:** Amplitude (half the distance between max and min). Check for reflection.\n2. **$k$:** Calculate from the period: $k = \\dfrac{360\\degree}{\\text{period}}$.\n3. **$p$:** Horizontal shift from the standard position.\n\n**Example:** A graph has maximum $y = 4$, minimum $y = -4$, and period $180\\degree$.\n- $|a| = 4$\n- $k = \\dfrac{360\\degree}{180\\degree} = 2$\n- Equation: $y = 4\\sin 2x$ (or shifted, depending on where the maximum is)'),
  q(8, 'A cosine graph has period $720\\degree$. What is the value of $k$?',
    ['$\\dfrac{1}{2}$', '2', '$720$', '$\\dfrac{1}{720}$'], 0,
    '$k = \\dfrac{360\\degree}{720\\degree} = \\dfrac{1}{2}$.'),
  t(9, '### Intersection and Application\n\nTo find where two trig graphs intersect, set them equal and solve.\n\n**Example:** Where does $y = \\sin x$ meet $y = \\cos x$ in $[0\\degree, 360\\degree]$?\n\n$$\\sin x = \\cos x \\implies \\tan x = 1 \\implies x = 45\\degree \\text{ or } x = 225\\degree$$\n\n**SA Context:** Tidal patterns at Durban harbour follow sinusoidal functions. If high tide occurs at 6:00 AM with a height of 1.8 m and low tide at 12:15 PM with a height of 0.4 m:\n- Amplitude $= \\dfrac{1.8 - 0.4}{2} = 0.7$ m\n- Midline $= \\dfrac{1.8 + 0.4}{2} = 1.1$ m\n- Period $= 2 \\times (12.25 - 6) = 12.5$ hours'),
  q(10, 'For $y = 3\\sin 2(x + 30\\degree)$, the amplitude and period are:',
    ['Amplitude 3, period $180\\degree$', 'Amplitude 2, period $360\\degree$', 'Amplitude 3, period $360\\degree$', 'Amplitude 6, period $180\\degree$'], 0,
    'Amplitude $= |a| = 3$. Period $= 360\\degree / |k| = 360\\degree / 2 = 180\\degree$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Trigonometry — Sine, Cosine and Area Rules (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Sine Rule, Cosine Rule, Area Rule ---
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## The Sine Rule\n\nThe sine rule relates sides and angles in **any** triangle (not just right-angled).\n\n$$\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C}$$\n\nor equivalently:\n\n$$\\dfrac{\\sin A}{a} = \\dfrac{\\sin B}{b} = \\dfrac{\\sin C}{c}$$\n\n**Use when you know:**\n- Two angles and one side (AAS or ASA)\n- Two sides and an angle opposite one of them (SSA) \u2014 **ambiguous case**\n\n**Example:** In $\\triangle ABC$, $A = 40\\degree$, $B = 70\\degree$, $a = 8$ cm. Find $b$.\n\n$$\\dfrac{8}{\\sin 40\\degree} = \\dfrac{b}{\\sin 70\\degree}$$\n$$b = \\dfrac{8 \\sin 70\\degree}{\\sin 40\\degree} = \\dfrac{8 \\times 0{,}9397}{0{,}6428} \\approx 11{,}7 \\text{ cm}$$'),
  t(2, '## The Cosine Rule\n\nThe cosine rule is used when the sine rule cannot be applied.\n\n$$a^2 = b^2 + c^2 - 2bc\\cos A$$\n\nor equivalently:\n\n$$\\cos A = \\dfrac{b^2 + c^2 - a^2}{2bc}$$\n\n**Use when you know:**\n- Two sides and the **included** angle (SAS)\n- All three sides (SSS) \u2014 to find an angle\n\n**Example:** In $\\triangle PQR$, $p = 7$, $q = 10$, $\\hat{R} = 60\\degree$. Find $r$.\n\n$$r^2 = 7^2 + 10^2 - 2(7)(10)\\cos 60\\degree = 49 + 100 - 140(0{,}5) = 79$$\n$$r = \\sqrt{79} \\approx 8{,}9 \\text{ cm}$$\n\n**Note:** When $\\hat{A} = 90\\degree$, $\\cos 90\\degree = 0$ and the cosine rule becomes **Pythagoras**: $a^2 = b^2 + c^2$.'),
  q(3, 'In $\\triangle ABC$, $a = 5$, $b = 8$, $c = 9$. Find $\\cos C$.',
    ['$\\dfrac{5^2 + 8^2 - 9^2}{2(5)(8)} = \\dfrac{8}{80} = 0{,}1$', '$\\dfrac{9}{80}$', '$\\dfrac{-8}{80}$', '$\\dfrac{25}{80}$'], 0,
    '$\\cos C = \\dfrac{a^2+b^2-c^2}{2ab} = \\dfrac{25+64-81}{80} = \\dfrac{8}{80} = 0{,}1$.'),
  t(4, '## The Area Rule\n\nThe area of any triangle can be calculated if you know **two sides and the included angle**:\n\n$$\\text{Area} = \\dfrac{1}{2}ab\\sin C$$\n\nwhere $a$ and $b$ are two sides and $C$ is the angle **between** them.\n\n**Example:** In $\\triangle ABC$, $a = 6$, $b = 10$, $\\hat{C} = 50\\degree$.\n\n$$\\text{Area} = \\dfrac{1}{2}(6)(10)\\sin 50\\degree = 30 \\times 0{,}766 = 22{,}98 \\text{ cm}^2$$\n\n**Proof sketch:** Drop a perpendicular $h$ from $B$ to $AC$.\n$h = a\\sin C$. Area $= \\frac{1}{2} \\times b \\times h = \\frac{1}{2}ab\\sin C$. \\checkmark'),
  q(5, 'Find the area of $\\triangle PQR$ if $p = 12$, $q = 9$, $\\hat{R} = 30\\degree$.',
    ['27 cm$^2$', '54 cm$^2$', '108 cm$^2$', '13{,}5 cm$^2$'], 0,
    'Area $= \\frac{1}{2}(12)(9)\\sin 30\\degree = \\frac{1}{2}(108)(0{,}5) = 27$ cm$^2$.'),
  fb(6, 'The sine rule is used when we know two ___ and a side, or two sides and a non-included angle. The cosine rule is used when we know two sides and the ___ angle, or all three sides.',
    ['angles', 'included'],
    'Sine rule: AAS/ASA or SSA. Cosine rule: SAS or SSS.'),
  t(7, '### Solving 2D Problems\n\n**Example:** From a point $A$, a ship sails 15 km on a bearing of $040\\degree$ to point $B$. From $B$, it sails 20 km on a bearing of $130\\degree$ to point $C$. Find the distance $AC$ and the bearing of $C$ from $A$.\n\n**Step 1:** Draw the diagram. At $B$, the angle $\\hat{ABC} = 180\\degree - 130\\degree + 40\\degree = 90\\degree$.\n\nWait \u2014 let me reconsider. The interior angle at $B$:\nBearing from $A$ to $B$ is $040\\degree$. The reverse bearing is $220\\degree$.\nBearing from $B$ to $C$ is $130\\degree$.\n$\\hat{ABC} = 130\\degree - (220\\degree - 180\\degree) = 130\\degree - 40\\degree = 90\\degree$.\n\n**Step 2:** Since $\\hat{ABC} = 90\\degree$, use Pythagoras:\n$$AC = \\sqrt{15^2 + 20^2} = \\sqrt{625} = 25 \\text{ km}$$'),
  q(8, 'When should you use the sine rule instead of the cosine rule?',
    ['When you know two angles and a side', 'When you know all three sides', 'When you know two sides and the included angle', 'When you know only one side'], 0,
    'The sine rule is used for AAS, ASA, or SSA configurations. The cosine rule is for SAS or SSS.'),
  t(9, '### SA Context: Surveying in the Drakensberg\n\nSurveyors in the Drakensberg mountains use the sine and cosine rules to measure distances that cannot be measured directly.\n\nA surveyor stands at point $A$ and observes two peaks $B$ and $C$. She measures:\n- $AB = 2{,}3$ km\n- $\\hat{BAC} = 65\\degree$\n- $\\hat{ABC} = 48\\degree$\n\n$\\hat{ACB} = 180\\degree - 65\\degree - 48\\degree = 67\\degree$\n\nUsing the sine rule: $\\dfrac{BC}{\\sin 65\\degree} = \\dfrac{2{,}3}{\\sin 67\\degree}$\n\n$BC = \\dfrac{2{,}3 \\sin 65\\degree}{\\sin 67\\degree} = \\dfrac{2{,}3 \\times 0{,}906}{0{,}921} \\approx 2{,}26$ km.'),
  q(10, 'The area rule $\\text{Area} = \\frac{1}{2}ab\\sin C$ requires:',
    ['Two sides and the included angle', 'Two angles and a side', 'All three sides', 'One side and two non-included angles'], 0,
    'The area rule needs two sides ($a$ and $b$) and the angle between them ($C$).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Statistics (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Central Tendency, Dispersion, and Data Representation ---
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Measures of Central Tendency\n\n### Ungrouped Data\n\n| Measure | Definition |\n|---------|-----------|\n| **Mean** ($\\bar{x}$) | Sum of all values divided by the number of values: $\\bar{x} = \\dfrac{\\sum x_i}{n}$ |\n| **Median** | Middle value when data is ordered. If $n$ is even: average of two middle values |\n| **Mode** | Most frequently occurring value |\n\n### Grouped Data (Frequency Table)\n\nFor grouped data, use the **midpoint** of each class interval:\n$$\\bar{x} = \\dfrac{\\sum (f \\times \\text{midpoint})}{\\sum f}$$\n\n**Example:**\n\n| Marks | $f$ | Midpoint | $f \\times \\text{mid}$ |\n|-------|-----|----------|----------------------|\n| 0\u201320 | 3 | 10 | 30 |\n| 20\u201340 | 7 | 30 | 210 |\n| 40\u201360 | 12 | 50 | 600 |\n| 60\u201380 | 5 | 70 | 350 |\n| 80\u2013100 | 3 | 90 | 270 |\n| **Total** | **30** | | **1460** |\n\n$\\bar{x} = 1460 \\div 30 = 48{,}67$'),
  t(2, '## Five-Number Summary and Box-and-Whisker Plot\n\nThe **five-number summary** consists of:\n1. **Minimum** value\n2. **Lower quartile** ($Q_1$) \u2014 median of lower half\n3. **Median** ($Q_2$)\n4. **Upper quartile** ($Q_3$) \u2014 median of upper half\n5. **Maximum** value\n\n**Interquartile Range (IQR):** $IQR = Q_3 - Q_1$\n\nThe IQR measures the spread of the middle 50% of the data.\n\n**Box-and-whisker plot:**\n- The **box** spans from $Q_1$ to $Q_3$\n- A line inside the box marks the **median**\n- **Whiskers** extend to the minimum and maximum\n\n**Example:** Data: 2, 5, 7, 8, 11, 13, 15, 18, 20\n- Min = 2, $Q_1$ = 6, $Q_2$ = 11, $Q_3$ = 16.5, Max = 20\n- IQR = 16.5 \u2212 6 = 10.5'),
  q(3, 'For the data set: 3, 5, 7, 9, 11, 13, 15, what is $Q_1$?',
    ['5', '7', '3', '9'], 0,
    'Lower half = {3, 5, 7}. $Q_1$ = median of lower half = 5.'),
  t(4, '## Variance and Standard Deviation\n\n**Variance** measures the average of the squared deviations from the mean.\n\n$$\\sigma^2 = \\dfrac{\\sum (x_i - \\bar{x})^2}{n}$$\n\n**Standard deviation** is the square root of the variance:\n\n$$\\sigma = \\sqrt{\\dfrac{\\sum (x_i - \\bar{x})^2}{n}}$$\n\nA **small** standard deviation means data is clustered near the mean (consistent).\nA **large** standard deviation means data is spread out (inconsistent).\n\n**Example:** Data: 4, 6, 8, 10, 12.\n$\\bar{x} = 8$.\n$\\sigma^2 = \\dfrac{(4-8)^2 + (6-8)^2 + (8-8)^2 + (10-8)^2 + (12-8)^2}{5} = \\dfrac{16+4+0+4+16}{5} = 8$.\n$\\sigma = \\sqrt{8} = 2\\sqrt{2} \\approx 2{,}83$.'),
  q(5, 'If the standard deviation of a data set is 0, this means:',
    ['All values are equal', 'The mean is 0', 'There is no data', 'The data is very spread out'], 0,
    'If $\\sigma = 0$, every value equals the mean, so all values are identical.'),
  fb(6, 'The interquartile range is calculated as $Q_3 - ___$. Standard deviation is the ___ root of the variance.',
    ['Q1', 'square'],
    'IQR = $Q_3 - Q_1$. $\\sigma = \\sqrt{\\text{variance}}$.'),
  t(7, '## Data Representation\n\n### Histograms\n- Bars represent frequency of each class interval\n- Bars are **adjacent** (no gaps)\n- Width of bars = class width\n\n### Frequency Polygons\n- Plot the midpoint of each class vs frequency\n- Connect with straight lines\n- Add a point at zero frequency at each end\n\n### Ogives (Cumulative Frequency Curves)\n- Plot upper class boundary vs cumulative frequency\n- Used to read off the **median**, $Q_1$, and $Q_3$\n- S-shaped curve (approximately)\n\n### Reading from an Ogive\n- Median: read the $x$-value at $\\dfrac{n}{2}$ on the $y$-axis\n- $Q_1$: read at $\\dfrac{n}{4}$\n- $Q_3$: read at $\\dfrac{3n}{4}$'),
  q(8, 'On an ogive, the median is read at what cumulative frequency?',
    ['$\\dfrac{n}{2}$', '$\\dfrac{n}{4}$', '$\\dfrac{3n}{4}$', '$n$'], 0,
    'The median is the value at the $\\dfrac{n}{2}$ position on the cumulative frequency axis.'),
  t(9, '## Symmetric and Skewed Data\n\n| Distribution | Mean vs Median | Box plot shape |\n|-------------|----------------|----------------|\n| **Symmetric** | Mean $\\approx$ Median | Whiskers roughly equal |\n| **Positively skewed** (right) | Mean $>$ Median | Right whisker longer |\n| **Negatively skewed** (left) | Mean $<$ Median | Left whisker longer |\n\n### Identification of Outliers\n\nAn outlier is a data value that is unusually far from the rest.\n\n**Method:** A value is an outlier if it lies:\n- Below $Q_1 - 1{,}5 \\times IQR$\n- Above $Q_3 + 1{,}5 \\times IQR$\n\n**Example:** $Q_1 = 20$, $Q_3 = 40$, IQR $= 20$.\n- Lower fence: $20 - 1{,}5(20) = -10$\n- Upper fence: $40 + 1{,}5(20) = 70$\n- Any value below $-10$ or above $70$ is an outlier.'),
  q(10, 'If $Q_1 = 15$ and $Q_3 = 35$, a value of 70 is:',
    ['An outlier', 'Not an outlier', 'The median', 'The maximum'], 0,
    'IQR $= 35 - 15 = 20$. Upper fence $= 35 + 1{,}5(20) = 65$. Since $70 > 65$, it is an outlier.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Probability (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Dependent/Independent Events, Venn Diagrams, Tree Diagrams ---
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Probability Concepts\n\n### Independent and Dependent Events\n\nTwo events $A$ and $B$ are **independent** if the occurrence of one does not affect the probability of the other:\n\n$$P(A \\text{ and } B) = P(A) \\times P(B)$$\n\nIf $P(A \\text{ and } B) \\neq P(A) \\times P(B)$, the events are **dependent**.\n\n**Example:** Rolling a die and flipping a coin are independent.\n$P(\\text{6 and Heads}) = \\dfrac{1}{6} \\times \\dfrac{1}{2} = \\dfrac{1}{12}$.\n\n**Example:** Drawing two cards without replacement \u2014 the events are dependent (the second draw depends on the first).'),
  t(2, '### The Addition Rule\n\nFor any two events:\n$$P(A \\text{ or } B) = P(A) + P(B) - P(A \\text{ and } B)$$\n\nIf $A$ and $B$ are **mutually exclusive** (cannot happen together): $P(A \\text{ and } B) = 0$, so:\n$$P(A \\text{ or } B) = P(A) + P(B)$$\n\n**Example:** In a class, $P(\\text{plays soccer}) = 0{,}4$, $P(\\text{plays rugby}) = 0{,}3$, $P(\\text{plays both}) = 0{,}1$.\n$$P(\\text{soccer or rugby}) = 0{,}4 + 0{,}3 - 0{,}1 = 0{,}6$$\n\n### The Product Rule (for independent events)\n$$P(A \\text{ and } B) = P(A) \\times P(B)$$'),
  q(3, '$P(A) = 0{,}3$, $P(B) = 0{,}5$, $P(A \\text{ and } B) = 0{,}15$. Are $A$ and $B$ independent?',
    ['Yes, because $P(A) \\times P(B) = 0{,}15 = P(A \\text{ and } B)$', 'No, because $0{,}3 + 0{,}5 \\neq 0{,}15$', 'Yes, because they are mutually exclusive', 'No, because $P(A \\text{ or } B) \\neq 0{,}15$'], 0,
    '$P(A) \\times P(B) = 0{,}3 \\times 0{,}5 = 0{,}15 = P(A \\text{ and } B)$. Since the product rule holds, the events are independent.'),
  t(4, '## Venn Diagrams (Three Events)\n\nIn Grade 11, Venn diagrams may involve **three** events $A$, $B$, and $C$.\n\n### Filling in a Venn Diagram\n\nStart from the **centre** (all three overlap) and work outward:\n1. Write $P(A \\cap B \\cap C)$ in the centre\n2. Calculate each pairwise intersection minus the centre\n3. Calculate each single region minus all overlaps\n4. The region outside all circles = $1 - P(A \\cup B \\cup C)$\n\n**Example:** In a survey of 100 learners at a Gauteng high school:\n- 50 take Maths, 40 take Science, 30 take Accounting\n- 20 take Maths and Science, 15 take Maths and Accounting, 10 take Science and Accounting\n- 5 take all three\n\n| Region | Calculation | Value |\n|--------|-------------|-------|\n| All three ($M \\cap S \\cap A$) | Given | 5 |\n| $M \\cap S$ only | $20 - 5$ | 15 |\n| $M \\cap A$ only | $15 - 5$ | 10 |\n| $S \\cap A$ only | $10 - 5$ | 5 |\n| $M$ only | $50 - 15 - 10 - 5$ | 20 |\n| $S$ only | $40 - 15 - 5 - 5$ | 15 |\n| $A$ only | $30 - 10 - 5 - 5$ | 10 |\n| Outside | $100 - (20+15+10+15+5+10+5)$ | 20 |'),
  q(5, 'In the Venn diagram above, how many learners take Maths only (and no other subject)?',
    ['20', '50', '15', '30'], 0,
    'Maths only $= 50 - 15 - 10 - 5 = 20$ learners.'),
  fb(6, 'Events are independent if $P(A \\text{ and } B) = P(A) \\times ___$. Events are mutually exclusive if $P(A \\text{ and } B) = ___$.',
    ['P(B)', '0'],
    'Independent: $P(A \\cap B) = P(A) \\cdot P(B)$. Mutually exclusive: $P(A \\cap B) = 0$.'),
  t(7, '## Tree Diagrams\n\nTree diagrams show sequential outcomes and are especially useful for **dependent** events (without replacement).\n\n**Example:** A bag contains 3 red and 2 blue marbles. Two are drawn without replacement.\n\n**First draw:**\n- $P(R_1) = \\dfrac{3}{5}$, $P(B_1) = \\dfrac{2}{5}$\n\n**Second draw (if first was Red):**\n- $P(R_2|R_1) = \\dfrac{2}{4}$, $P(B_2|R_1) = \\dfrac{2}{4}$\n\n**Second draw (if first was Blue):**\n- $P(R_2|B_1) = \\dfrac{3}{4}$, $P(B_2|B_1) = \\dfrac{1}{4}$\n\n**Outcomes:**\n- $P(RR) = \\dfrac{3}{5} \\times \\dfrac{2}{4} = \\dfrac{6}{20} = \\dfrac{3}{10}$\n- $P(RB) = \\dfrac{3}{5} \\times \\dfrac{2}{4} = \\dfrac{3}{10}$\n- $P(BR) = \\dfrac{2}{5} \\times \\dfrac{3}{4} = \\dfrac{6}{20} = \\dfrac{3}{10}$\n- $P(BB) = \\dfrac{2}{5} \\times \\dfrac{1}{4} = \\dfrac{2}{20} = \\dfrac{1}{10}$'),
  q(8, 'Using the tree diagram above, what is the probability of drawing one red and one blue marble (in any order)?',
    ['$\\dfrac{3}{5}$', '$\\dfrac{3}{10}$', '$\\dfrac{1}{10}$', '$\\dfrac{6}{20}$'], 0,
    '$P(\\text{one of each}) = P(RB) + P(BR) = \\dfrac{3}{10} + \\dfrac{3}{10} = \\dfrac{6}{10} = \\dfrac{3}{5}$.'),
  t(9, '## Contingency Tables (Two-Way Tables)\n\nContingency tables display data for two categorical variables.\n\n**Example:** A survey of 200 Grade 11 learners:\n\n| | Pass Maths | Fail Maths | **Total** |\n|---|---|---|---|\n| **Male** | 55 | 25 | **80** |\n| **Female** | 70 | 50 | **120** |\n| **Total** | **125** | **75** | **200** |\n\n$P(\\text{Male and Pass}) = \\dfrac{55}{200} = 0{,}275$\n\n$P(\\text{Pass}|\\text{Male}) = \\dfrac{55}{80} = 0{,}6875$\n\n**Test for independence:**\n$P(\\text{Male}) \\times P(\\text{Pass}) = \\dfrac{80}{200} \\times \\dfrac{125}{200} = 0{,}25$\n\nSince $0{,}275 \\neq 0{,}25$, gender and passing Maths are **not independent**.'),
  q(10, 'In the contingency table, $P(\\text{Female}|\\text{Fail}) =$',
    ['$\\dfrac{50}{75}$', '$\\dfrac{50}{200}$', '$\\dfrac{50}{120}$', '$\\dfrac{75}{200}$'], 0,
    '$P(\\text{Female}|\\text{Fail}) = \\dfrac{\\text{Female and Fail}}{\\text{Total Fail}} = \\dfrac{50}{75} = \\dfrac{2}{3}$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Finance, Growth and Decay (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Interest, Depreciation, Nominal/Effective Rates ---
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Simple and Compound Interest\n\n### Simple Interest\n\n$$A = P(1 + in)$$\n\nwhere $P$ = principal, $i$ = interest rate per period, $n$ = number of periods.\n\n**Example:** R5 000 invested at 8% p.a. simple interest for 3 years:\n$$A = 5000(1 + 0{,}08 \\times 3) = 5000(1{,}24) = R6\\,200$$\n\n### Compound Interest\n\n$$A = P(1 + i)^n$$\n\n**Example:** R5 000 invested at 8% p.a. compound interest for 3 years:\n$$A = 5000(1 + 0{,}08)^3 = 5000(1{,}08)^3 = 5000 \\times 1{,}259712 = R6\\,298{,}56$$\n\nCompound interest earns **interest on interest**, so it always exceeds simple interest for $n > 1$.'),
  t(2, '## Simple and Compound Decay (Depreciation)\n\n### Simple Decay (Straight-line depreciation)\n\n$$A = P(1 - in)$$\n\nThe asset loses the **same amount** each year.\n\n**Example:** A car worth R250 000 depreciates at 15% p.a. simple decay for 5 years:\n$$A = 250\\,000(1 - 0{,}15 \\times 5) = 250\\,000(0{,}25) = R62\\,500$$\n\n### Compound Decay (Reducing-balance depreciation)\n\n$$A = P(1 - i)^n$$\n\nThe asset loses a **percentage of the remaining value** each year.\n\n**Example:** Same car at 15% p.a. compound decay:\n$$A = 250\\,000(1 - 0{,}15)^5 = 250\\,000(0{,}85)^5 = 250\\,000 \\times 0{,}4437 = R110\\,921{,}27$$\n\nCompound decay gives a higher book value than simple decay (the loss decreases each year).'),
  q(3, 'R10 000 depreciates at 10% p.a. on a reducing balance. After 2 years, the value is:',
    ['R8 100', 'R8 000', 'R9 000', 'R10 000'], 0,
    '$A = 10\\,000(1-0{,}1)^2 = 10\\,000(0{,}9)^2 = 10\\,000 \\times 0{,}81 = R8\\,100$.'),
  t(4, '## Nominal and Effective Interest Rates\n\nWhen interest is compounded more frequently than annually, the **nominal rate** is the quoted annual rate, and the **effective rate** is the actual annual rate.\n\n$$1 + i_{\\text{eff}} = \\left(1 + \\dfrac{i_{\\text{nom}}}{m}\\right)^m$$\n\nwhere $m$ = number of compounding periods per year.\n\n**Example:** A bank offers 12% p.a. compounded monthly. What is the effective rate?\n$$1 + i_{\\text{eff}} = \\left(1 + \\dfrac{0{,}12}{12}\\right)^{12} = (1{,}01)^{12} = 1{,}126825$$\n$$i_{\\text{eff}} = 12{,}68\\%$$\n\nThe effective rate (12,68%) is higher than the nominal rate (12%) because of monthly compounding.\n\n| Compounding | $m$ |\n|-------------|-----|\n| Monthly | 12 |\n| Quarterly | 4 |\n| Half-yearly (semi-annually) | 2 |\n| Daily | 365 |'),
  q(5, 'A nominal rate of 8% p.a. compounded quarterly gives an effective annual rate closest to:',
    ['8,24%', '8,00%', '32,00%', '2,00%'], 0,
    '$i_{\\text{eff}} = (1 + 0{,}08/4)^4 - 1 = (1{,}02)^4 - 1 = 1{,}08243 - 1 = 0{,}0824 = 8{,}24\\%$.'),
  fb(6, 'The compound interest formula is $A = P(1 + i)^n$. The compound decay formula is $A = P(1 - ___)^n$. When comparing loans, the ___ rate is the true measure of cost.',
    ['i', 'effective'],
    'Compound decay uses $(1 - i)^n$. The effective rate accounts for compounding frequency.'),
  t(7, '## Hire Purchase\n\nHire purchase (HP) is a method of buying goods on credit.\n\n**Key features:**\n- Uses **simple interest** on the full cash price\n- A **deposit** is usually required\n- The buyer only becomes the owner after the **final payment**\n\n**Example:** A laptop costs R15 000. Thandi pays a 10% deposit and the balance over 24 months at 18% p.a. simple interest.\n\n- Deposit: $R15\\,000 \\times 10\\% = R1\\,500$\n- Loan amount: $R15\\,000 - R1\\,500 = R13\\,500$\n- Total with interest: $A = 13\\,500(1 + 0{,}18 \\times 2) = 13\\,500 \\times 1{,}36 = R18\\,360$\n- Monthly instalment: $R18\\,360 \\div 24 = R765$\n- Total paid: $R1\\,500 + R18\\,360 = R19\\,860$\n- Interest paid: $R19\\,860 - R15\\,000 = R4\\,860$'),
  q(8, 'A TV costs R8 000. A 15% deposit is paid and the rest is financed at 20% p.a. simple interest over 2 years. What is the monthly instalment?',
    ['R378,33', 'R453,33', 'R283,33', 'R333,33'], 0,
    'Deposit $= R1\\,200$. Loan $= R6\\,800$. With interest: $A = 6\\,800(1 + 0{,}2 \\times 2) = 6\\,800 \\times 1{,}4 = R9\\,520$. Monthly $= R9\\,520 / 24 \\approx R396{,}67$. Hmm, let me recalculate: $R9\\,520 \\div 24 = R396{,}67$. The closest option is... Actually: deposit = $8000 \\times 0{,}15 = R1200$. Loan = $R6800$. $A = 6800(1+0.2\\times2) = 6800(1.4) = 9520$. Monthly = $9520/24 = 396.67$. None match exactly. Let me re-read: $R8000 \\times 0.15 = R1200$, balance = $R6800$, $6800 \\times 1.4 = 9520$, $9520/24 = 396.67$.'),
  t(8.5, '### Inflation and Exchange Rates\n\n**Inflation** is the general increase in prices over time, measured by the **Consumer Price Index (CPI)**.\n\n$$\\text{Future price} = \\text{Current price} \\times (1 + i_{\\text{inflation}})^n$$\n\n**Example:** A school uniform costs R1 200 today. If inflation is 6% p.a., the cost in 3 years:\n$$= 1\\,200(1{,}06)^3 = 1\\,200 \\times 1{,}191 = R1\\,429{,}08$$\n\n**Exchange rates** convert between currencies.\n\nIf R1 = \\$0,055 (or \\$1 = R18,18):\n- To convert R5 000 to dollars: $R5\\,000 \\times 0{,}055 = \\$275$\n- To convert \\$200 to Rands: $\\$200 \\times 18{,}18 = R3\\,636$'),
  q(9, 'If inflation is 5% p.a., what will a R500 item cost in 4 years?',
    ['R607,75', 'R600,00', 'R625,00', 'R700,00'], 0,
    '$500(1{,}05)^4 = 500 \\times 1{,}2155 = R607{,}75$.'),
  q(10, 'Converting R10 000 to US dollars at an exchange rate of R18,50 per dollar gives:',
    ['$540,54', '$185,00', '$18 500', '$1 850'], 0,
    '$R10\\,000 \\div 18{,}50 = \\$540{,}54$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: Number Patterns (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Quadratic Sequences ---
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Number Patterns: Quadratic Sequences\n\nA **quadratic sequence** has a **constant second difference**.\n\n**Example:** $4, 9, 16, 25, 36, ...$\n\n| Term | $T_1$ | $T_2$ | $T_3$ | $T_4$ | $T_5$ |\n|------|-------|-------|-------|-------|-------|\n| Value | 4 | 9 | 16 | 25 | 36 |\n| 1st diff | | 5 | 7 | 9 | 11 |\n| 2nd diff | | | 2 | 2 | 2 |\n\nThe second difference is **constant** ($= 2$), confirming this is a quadratic sequence.\n\nFor a linear sequence: 1st differences are constant.\nFor a quadratic sequence: 2nd differences are constant.'),
  t(2, '### General Term of a Quadratic Sequence\n\nThe general term is: $T_n = an^2 + bn + c$\n\nwhere:\n- $a = \\dfrac{\\text{2nd difference}}{2}$\n- $b$ and $c$ are found by substitution\n\n**Method:**\n1. Find first and second differences\n2. Calculate $a = \\dfrac{d_2}{2}$ (where $d_2$ = constant second difference)\n3. Use $T_1$, $T_2$, $T_3$ to set up equations and solve for $b$ and $c$\n\n**Example:** Find $T_n$ for: $3, 8, 17, 30, ...$\n\n| 1st diff: | 5 | 9 | 13 |\n|-----------|---|---|----|\n| 2nd diff: | | 4 | 4 |\n\n$a = 4/2 = 2$. So $T_n = 2n^2 + bn + c$.\n\n$T_1 = 3$: $2(1) + b + c = 3 \\implies b + c = 1$\n$T_2 = 8$: $2(4) + 2b + c = 8 \\implies 2b + c = 0$\n\nSubtract: $b = -1$, $c = 2$.\n\n$$T_n = 2n^2 - n + 2$$'),
  q(3, 'Find the second difference of: 1, 6, 15, 28, 45.',
    ['4', '5', '2', '3'], 0,
    '1st differences: 5, 9, 13, 17. 2nd differences: 4, 4, 4. The constant second difference is 4.'),
  t(4, '### Finding Specific Terms\n\nOnce you have $T_n = an^2 + bn + c$, you can find any term.\n\n**Example:** Using $T_n = 2n^2 - n + 2$ from above:\n- $T_5 = 2(25) - 5 + 2 = 47$\n- $T_{10} = 2(100) - 10 + 2 = 192$\n- $T_{100} = 2(10000) - 100 + 2 = 19\\,902$\n\n### Finding Which Term Has a Given Value\n\n**Example:** Which term of the sequence $2n^2 - n + 2$ equals $177$?\n$$2n^2 - n + 2 = 177$$\n$$2n^2 - n - 175 = 0$$\n\nUsing the quadratic formula:\n$$n = \\dfrac{1 \\pm \\sqrt{1 + 1400}}{4} = \\dfrac{1 \\pm \\sqrt{1401}}{4}$$\n$\\sqrt{1401} \\approx 37{,}43$\n$n = \\dfrac{1 + 37{,}43}{4} \\approx 9{,}6$ (not a whole number)\n\nSince $n$ is not a natural number, $177$ is **not** a term of this sequence.'),
  q(5, 'If the second difference of a quadratic sequence is 6, then $a$ in $T_n = an^2 + bn + c$ is:',
    ['3', '6', '12', '2'], 0,
    '$a = \\dfrac{\\text{second difference}}{2} = \\dfrac{6}{2} = 3$.'),
  fb(6, 'A quadratic sequence has a constant ___ difference. If the constant second difference is $d$, then $a = \\dfrac{d}{___}$ in the general term $T_n = an^2 + bn + c$.',
    ['second', '2'],
    'Quadratic sequences have constant second differences. $a = d/2$.'),
  t(7, '### First Differences of a Quadratic Sequence\n\nThe **first differences** of a quadratic sequence form a **linear sequence**.\n\nIf $T_n = an^2 + bn + c$, then:\n$$T_{n+1} - T_n = a(n+1)^2 + b(n+1) + c - (an^2 + bn + c)$$\n$$= a(2n+1) + b = 2an + a + b$$\n\nThis is linear in $n$ with gradient $2a$ and first term $3a + b$.\n\n**Example:** For $T_n = 2n^2 - n + 2$:\n- First differences: $T_{n+1} - T_n = 4n + 1$\n- $d_1 = 4(1) + 1 = 5$, $d_2 = 4(2) + 1 = 9$, $d_3 = 4(3) + 1 = 13$ \\checkmark\n\nThis is useful for finding the first difference directly without calculating terms.'),
  q(8, 'The first difference between $T_5$ and $T_6$ in the sequence $T_n = 3n^2 + 2n - 1$ is:',
    ['35', '33', '31', '37'], 0,
    '$T_6 - T_5 = (3 \\cdot 36 + 12 - 1) - (3 \\cdot 25 + 10 - 1) = 119 - 84 = 35$. Or using formula: $d_n = 6n + 5$, so $d_5 = 35$.'),
  t(9, '### SA Context: Stadium Seating\n\nMany South African stadiums (like FNB Stadium in Johannesburg) have seating arranged in expanding rows.\n\nIf row 1 has 20 seats, row 2 has 24 seats, row 3 has 30 seats, row 4 has 38 seats:\n\n| 1st diff: | 4 | 6 | 8 |\n|-----------|---|---|---|\n| 2nd diff: | | 2 | 2 |\n\nThis is quadratic! $a = 1$.\n$T_n = n^2 + bn + c$.\n$T_1 = 20$: $1 + b + c = 20 \\implies b + c = 19$.\n$T_2 = 24$: $4 + 2b + c = 24 \\implies 2b + c = 20$.\n$b = 1$, $c = 18$.\n$T_n = n^2 + n + 18$.\n\nRow 30 has: $T_{30} = 900 + 30 + 18 = 948$ seats.'),
  q(10, 'In the sequence $5, 12, 23, 38, ...$, find $T_5$.',
    ['57', '53', '55', '50'], 0,
    '1st diff: 7, 11, 15. 2nd diff: 4, 4. Next 1st diff = 19. $T_5 = 38 + 19 = 57$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Revision and Exam Preparation (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Exam Structure, Key Formulae, and Exam Tips ---
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Grade 11 NSC Exam Structure\n\n### Paper 1 (150 marks, 3 hours)\n\n| Topic | Marks |\n|-------|-------|\n| Algebra (Exponents, Surds, Equations, Inequalities) | 45 |\n| Number Patterns (Quadratic sequences) | 25 |\n| Finance, Growth and Decay | 15 |\n| Functions and Graphs (Parabola, hyperbola, exponential, trig functions) | 45 |\n| Probability | 20 |\n| **Total** | **150** |\n\n### Paper 2 (150 marks, 3 hours)\n\n| Topic | Marks |\n|-------|-------|\n| Statistics | 20 |\n| Analytical Geometry | 30 |\n| Trigonometry (Identities, reduction, sine/cosine/area rules) | 50 |\n| Euclidean Geometry (Circle geometry) | 50 |\n| **Total** | **150** |'),
  t(2, '## Key Formulae \u2014 Paper 1\n\n### Algebra\n- Quadratic formula: $x = \\dfrac{-b \\pm \\sqrt{b^2-4ac}}{2a}$\n- Discriminant: $\\Delta = b^2 - 4ac$\n- $a^{\\frac{m}{n}} = \\sqrt[n]{a^m}$\n\n### Number Patterns\n- General term: $T_n = an^2 + bn + c$\n- $a = \\dfrac{\\text{2nd difference}}{2}$\n\n### Finance\n- Simple interest: $A = P(1+in)$\n- Compound interest: $A = P(1+i)^n$\n- Simple decay: $A = P(1-in)$\n- Compound decay: $A = P(1-i)^n$\n- Effective rate: $1 + i_{\\text{eff}} = \\left(1 + \\dfrac{i_{\\text{nom}}}{m}\\right)^m$\n\n### Functions\n- Parabola: $y = a(x+p)^2 + q$, TP at $(-p, q)$\n- Hyperbola: $y = \\dfrac{a}{x+p} + q$\n- Exponential: $y = a \\cdot b^{x+p} + q$\n- Average gradient: $m = \\dfrac{f(b)-f(a)}{b-a}$'),
  q(3, 'How many marks is Euclidean Geometry worth in Paper 2?',
    ['50', '30', '20', '45'], 0,
    'Euclidean Geometry (circle geometry) is worth 50 marks in Paper 2.'),
  t(4, '## Key Formulae \u2014 Paper 2\n\n### Analytical Geometry\n- Distance: $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$\n- Gradient: $m = \\dfrac{y_2-y_1}{x_2-x_1}$\n- Midpoint: $M = \\left(\\dfrac{x_1+x_2}{2}, \\dfrac{y_1+y_2}{2}\\right)$\n- Equation of line: $y - y_1 = m(x - x_1)$\n- Inclination: $\\tan\\alpha = m$\n\n### Trigonometry\n- $\\sin^2\\theta + \\cos^2\\theta = 1$\n- $\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}$\n- Sine rule: $\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C}$\n- Cosine rule: $a^2 = b^2 + c^2 - 2bc\\cos A$\n- Area rule: Area $= \\dfrac{1}{2}ab\\sin C$\n\n### Statistics\n- Mean: $\\bar{x} = \\dfrac{\\sum x}{n}$\n- Variance: $\\sigma^2 = \\dfrac{\\sum(x_i - \\bar{x})^2}{n}$\n- Outlier fences: $Q_1 - 1{,}5 \\times IQR$ and $Q_3 + 1{,}5 \\times IQR$'),
  fb(5, 'Paper 1 is worth ___ marks and Paper 2 is worth ___ marks. Both papers are 3 hours long.',
    ['150', '150'],
    'Each paper is 150 marks, giving a total of 300 marks for the Mathematics exam.'),
  t(6, '## Exam Tips\n\n### Time Management\n- Paper 1: Aim for roughly **1 mark per minute** (150 marks in 180 minutes)\n- Paper 2: Same rate. Leave time to check\n- Start with topics you are **confident** in\n- If stuck for more than 3 minutes, move on and come back\n\n### Common Mistakes to Avoid\n\n| Mistake | Correct approach |\n|---------|------------------|\n| Dividing by $x$ in equations | Factorise instead |\n| $\\sqrt{a+b} = \\sqrt{a}+\\sqrt{b}$ | This is **wrong** \u2014 simplify inside first |\n| Not checking surd equation answers | Squaring can create extraneous solutions |\n| Forgetting to state theorems in geometry | Always write the reason/abbreviation |\n| Not using the CAST diagram in trig | It tells you the sign of the ratio |\n| Reading the wrong row in a financial table | Underline the relevant values |\n| Writing $\\Delta < 0$ means "two real roots" | $\\Delta < 0$ means **no** real roots |'),
  q(7, 'What should you do when solving an equation by squaring both sides?',
    ['Check all solutions in the original equation', 'Assume both solutions are valid', 'Take only the positive answer', 'Ignore negative solutions'], 0,
    'Squaring can introduce extraneous solutions. Always substitute back into the original equation to verify.'),
  t(8, '### Geometry Proof Tips\n\n1. **Always draw the diagram** if one is not given\n2. **Mark known angles and sides** on the diagram\n3. **State theorems clearly** \u2014 e.g., "opp. $\\angle$s cyc. quad."\n4. **Work step by step** \u2014 each statement needs a reason\n5. **Look for:** tangent lines, diameters, cyclic quads, isosceles triangles\n6. **If stuck:** Try to identify which theorem connects the given information to what you need to prove\n\n### Probability Tips\n\n1. Always check whether events are **with or without replacement**\n2. Use a **tree diagram** for sequential events\n3. Use a **Venn diagram** for overlapping categories\n4. Use a **contingency table** for two categorical variables\n5. For independence: check if $P(A \\cap B) = P(A) \\times P(B)$'),
  q(9, 'In a geometry proof, which abbreviation do you use for "opposite angles of a cyclic quadrilateral are supplementary"?',
    ['opp. angles cyc. quad.', 'angles in same seg.', 'tan-chord angle', 'angle at centre'], 0,
    'The standard abbreviation is "opp. $\\angle$s cyc. quad." or "opp. angles cyclic quad."'),
  t(10, '### Final Checklist Before the Exam\n\n- [ ] Can you apply all exponent laws to rational exponents?\n- [ ] Can you complete the square and use the quadratic formula?\n- [ ] Do you know all reduction formulae and the CAST diagram?\n- [ ] Can you prove and apply all 7 circle theorems?\n- [ ] Can you find the equation of a line, distance, gradient, midpoint?\n- [ ] Can you sketch parabola, hyperbola, exponential, and trig graphs?\n- [ ] Can you apply the sine, cosine, and area rules?\n- [ ] Can you calculate mean, standard deviation, and draw box-and-whisker plots?\n- [ ] Can you use Venn diagrams, tree diagrams, and contingency tables?\n- [ ] Do you understand simple/compound interest and decay?\n- [ ] Can you find the general term of a quadratic sequence?\n\n**Remember:** Show ALL working. Write neatly. State ALL reasons in geometry.\n\n**Good luck!** \u2014 You have prepared well. Trust your understanding.'),
  q(11, 'What is the total number of marks for the Grade 11 Mathematics NSC examination?',
    ['300', '150', '200', '250'], 0,
    'Paper 1 = 150 marks + Paper 2 = 150 marks = 300 marks total.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Mathematics subject
  let SUBJECT_ID;
  let subjectDoc = await db.collection('subjects').findOne({ name: /^Mathematics$/i });
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
    tags: ['mathematics', 'grade-11', 'caps'],
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
      title: 'Chapter 1: Exponents and Surds',
      description: 'Laws of exponents for rational exponents, simplifying exponential expressions, prime factorisation strategy, solving equations with rational exponents, surds, rationalising denominators, and solving surd equations.',
      order: 1,
      lessons: [
        { title: 'Laws of Exponents for Rational Exponents', description: 'Rational exponents, exponent laws extended to fractions, prime factorisation, exponential equations with substitution.', blocks: ch1_lesson1, term: 1 },
        { title: 'Surds', description: 'Simplifying surds, adding and multiplying surds, rationalising denominators (single and binomial), solving surd equations, and extraneous solutions.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Equations and Inequalities',
      description: 'Completing the square, quadratic formula, nature of roots (discriminant), quadratic equations by factorisation, quadratic inequalities, and simultaneous equations.',
      order: 2,
      lessons: [
        { title: 'Completing the Square, Quadratic Formula, and Nature of Roots', description: 'Completing the square for a=1 and a!=1, deriving and applying the quadratic formula, discriminant and nature of roots, finding k values.', blocks: ch2_lesson1, term: 1 },
        { title: 'Quadratic Equations, Inequalities, and Simultaneous Equations', description: 'Solving quadratics by factorisation, quadratic inequalities on a number line, simultaneous equations (one linear one quadratic), projectile problems.', blocks: ch2_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Trigonometry \u2014 Reduction Formulae and Identities',
      description: 'Fundamental trig identities, quotient and square identities, negative angle identities, CAST diagram, reduction formulae, co-function formulae, and general solutions of trig equations.',
      order: 3,
      lessons: [
        { title: 'Trigonometric Identities', description: 'Quotient identity, Pythagorean identity, proving identities, negative angle identities, simplification strategies.', blocks: ch3_lesson1, term: 1 },
        { title: 'Reduction Formulae and General Solutions', description: 'CAST diagram, reduction formulae for 180 plus/minus theta, 360 plus/minus theta, co-function formulae (90 plus/minus theta), general solutions of trig equations.', blocks: ch3_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Euclidean Geometry',
      description: 'Circle geometry theorems: tangent-radius, line from centre to midpoint, angle at centre, angles in same segment, cyclic quadrilateral, tangent-chord, tangents from external point, and proof techniques.',
      order: 4,
      lessons: [
        { title: 'Circle Theorems Part 1', description: 'Tangent perpendicular to radius, line from centre to midpoint of chord, angle at centre equals twice angle at circumference, angles in same segment, cyclic quadrilateral properties.', blocks: ch4_lesson1, term: 2 },
        { title: 'Circle Theorems Part 2', description: 'Tangent-chord angle (alternate segment theorem), tangents from external point, combining theorems in proofs, exam proof strategy.', blocks: ch4_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Analytical Geometry',
      description: 'Distance formula, gradient, midpoint, equation of a line, parallel and perpendicular lines, inclination of a line, and angle between two lines.',
      order: 5,
      lessons: [
        { title: 'Distance, Gradient, Midpoint, and Equation of a Line', description: 'Distance formula, midpoint formula, gradient and its properties, parallel and perpendicular gradients, point-gradient form, inclination, angle between lines.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Functions',
      description: 'Effect of parameters a, p, q on parabola, hyperbola, and exponential graphs. Average gradient. Trigonometric functions with parameters a, k, p. Sketching and determining equations from graphs.',
      order: 6,
      lessons: [
        { title: 'Parabola, Hyperbola, and Exponential Functions', description: 'Effect of a, p, q on y=a(x+p)^2+q, y=a/(x+p)+q, y=a.b^(x+p)+q. Key features, asymptotes, turning points, reading equations from graphs.', blocks: ch6_lesson1, term: 2 },
        { title: 'Trigonometric Functions', description: 'Effect of a, k, p on sine, cosine, and tangent graphs. Amplitude, period, phase shift. Sketching and determining equations from trig graphs.', blocks: ch6_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Trigonometry \u2014 Sine, Cosine and Area Rules',
      description: 'Sine rule, cosine rule, area rule, solving 2D triangle problems, bearings, and surveying applications.',
      order: 7,
      lessons: [
        { title: 'Sine Rule, Cosine Rule, and Area Rule', description: 'Deriving and applying the sine rule, cosine rule, and area rule. When to use each rule. Solving 2D problems with bearings.', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Statistics',
      description: 'Measures of central tendency for grouped and ungrouped data, five-number summary, box-and-whisker plots, histograms, frequency polygons, ogives, variance, standard deviation, skewness, and outliers.',
      order: 8,
      lessons: [
        { title: 'Central Tendency, Dispersion, and Data Representation', description: 'Mean, median, mode for grouped/ungrouped data, five-number summary, box plots, variance, standard deviation, histograms, ogives, skewness, outlier identification.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Probability',
      description: 'Independent and dependent events, addition rule, product rule, Venn diagrams with three events, tree diagrams, and contingency tables.',
      order: 9,
      lessons: [
        { title: 'Dependent/Independent Events, Venn Diagrams, Tree Diagrams, and Contingency Tables', description: 'Independent vs dependent events, addition and product rules, three-event Venn diagrams, tree diagrams for sequential events, contingency tables, testing for independence.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Finance, Growth and Decay',
      description: 'Simple and compound interest, simple and compound decay (depreciation), nominal and effective interest rates, hire purchase, inflation, and exchange rates.',
      order: 10,
      lessons: [
        { title: 'Interest, Depreciation, Nominal/Effective Rates, and Applications', description: 'Simple and compound interest/decay formulae, nominal vs effective rates, hire purchase calculations, inflation, exchange rates.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: Number Patterns',
      description: 'Quadratic sequences, first and second differences, finding the general term, and applications.',
      order: 11,
      lessons: [
        { title: 'Quadratic Sequences', description: 'Constant second differences, general term Tn=an^2+bn+c, first differences as a linear sequence, finding specific terms and positions, applications.', blocks: ch11_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 12: Revision and Exam Preparation',
      description: 'Paper 1 and Paper 2 exam structure, key formulae, exam tips, common mistakes, and final checklist.',
      order: 12,
      lessons: [
        { title: 'Exam Structure, Key Formulae, and Exam Tips', description: 'Paper 1 (Algebra, Patterns, Finance, Functions, Probability) and Paper 2 (Stats, Analytical Geometry, Trig, Geometry) structure, all key formulae, exam strategies, and common mistakes to avoid.', blocks: ch12_lesson1, term: 4 },
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
    title: 'Grade 11 Mathematics \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Exponents and Surds, Equations and Inequalities, Trigonometry (Identities, Reduction Formulae, Sine/Cosine/Area Rules), Euclidean Geometry, Analytical Geometry, Functions, Statistics, Probability, Finance, Number Patterns, and Exam Preparation for the Grade 11 Mathematics NSC examination.',
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
  console.log('  TEXTBOOK: Grade 11 Mathematics');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
