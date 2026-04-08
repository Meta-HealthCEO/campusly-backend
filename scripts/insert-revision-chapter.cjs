const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const SCHOOL_ID = new mongoose.Types.ObjectId('69ce960a98ca4ee738d25416');
const CREATED_BY = new mongoose.Types.ObjectId('69ce960b98ca4ee738d25432');
const GRADE_ID = new mongoose.Types.ObjectId('69d0c1241d8a9f6a83801642');
const SUBJECT_ID = new mongoose.Types.ObjectId('69d0c1241d8a9f6a83801644');
const TEXTBOOK_ID = new mongoose.Types.ObjectId('69d271ebb55d55ead5d5462b');

let blockNum = 0;
function bid() { return 'block-' + String(++blockNum).padStart(3, '0'); }

function textBlock(order, content) {
  return { blockId: bid(), type: 'text', order, content, points: 0, hints: [], explanation: '', metadata: {}, curriculumNodeId: null, cognitiveLevel: null };
}

function quizBlock(order, question, options, correctIndex, explanation, hints) {
  return {
    blockId: bid(), type: 'quiz', order,
    content: JSON.stringify({ question, options, correctIndex }),
    points: 1, hints: hints || [], explanation: explanation || '',
    metadata: { options, correctIndex }, curriculumNodeId: null, cognitiveLevel: null,
  };
}

function fillBlock(order, text, blanks, explanation, hints) {
  return {
    blockId: bid(), type: 'fill_blank', order,
    content: JSON.stringify({ text, blanks }),
    points: blanks.length, hints: hints || [], explanation: explanation || '',
    metadata: { blanks }, curriculumNodeId: null, cognitiveLevel: null,
  };
}

// ─── Revision Lesson 1: Key Formulae & Concepts ─────────────────────────────

blockNum = 0;
const formulaeBlocks = [
  textBlock(1,
    '## Grade 12 Mathematics \u2014 Formula Sheet & Key Concepts\n\n' +
    'This revision chapter consolidates every formula and concept you need for the NSC Mathematics examination. Use it as a quick reference and self-test before your exams.\n\n' +
    '---\n\n' +
    '## Algebra & Functions\n\n' +
    '| Formula | Notes |\n|---------|-------|\n' +
    '| $f^{-1}$: swap $x$ and $y$, solve for $y$ | Inverse function |\n' +
    '| $y = \\\\log_b x \\\\Leftrightarrow b^y = x$ | Definition of logarithm |\n' +
    '| $\\\\log_b(xy) = \\\\log_b x + \\\\log_b y$ | Product rule |\n' +
    '| $\\\\log_b\\\\!\\\\left(\\\\frac{x}{y}\\\\right) = \\\\log_b x - \\\\log_b y$ | Quotient rule |\n' +
    '| $\\\\log_b(x^n) = n\\\\log_b x$ | Power rule |\n' +
    '| Change of base: $\\\\log_b x = \\\\frac{\\\\log x}{\\\\log b}$ | Calculator-friendly |'
  ),

  textBlock(2,
    '## Sequences & Series\n\n' +
    '| Formula | Description |\n|---------|-------------|\n' +
    '| $T_n = a + (n-1)d$ | $n$-th term of arithmetic sequence |\n' +
    '| $S_n = \\\\frac{n}{2}(2a + (n-1)d) = \\\\frac{n}{2}(a + l)$ | Sum of arithmetic series |\n' +
    '| $T_n = ar^{n-1}$ | $n$-th term of geometric sequence |\n' +
    '| $S_n = \\\\frac{a(r^n - 1)}{r - 1}$, $r \\\\neq 1$ | Sum of geometric series |\n' +
    '| $S_\\\\infty = \\\\frac{a}{1 - r}$, $|r| < 1$ | Sum to infinity |\n' +
    '| $\\\\sum_{k=1}^{n} T_k$ | Sigma notation |'
  ),

  textBlock(3,
    '## Trigonometry\n\n' +
    '| Identity / Rule | |\n|---|---|\n' +
    '| $\\\\sin^2\\\\theta + \\\\cos^2\\\\theta = 1$ | Pythagorean identity |\n' +
    '| $\\\\sin(\\\\alpha \\\\pm \\\\beta) = \\\\sin\\\\alpha\\\\cos\\\\beta \\\\pm \\\\cos\\\\alpha\\\\sin\\\\beta$ | Compound angle |\n' +
    '| $\\\\cos(\\\\alpha \\\\pm \\\\beta) = \\\\cos\\\\alpha\\\\cos\\\\beta \\\\mp \\\\sin\\\\alpha\\\\sin\\\\beta$ | Compound angle |\n' +
    '| $\\\\sin 2\\\\alpha = 2\\\\sin\\\\alpha\\\\cos\\\\alpha$ | Double angle |\n' +
    '| $\\\\cos 2\\\\alpha = \\\\cos^2\\\\alpha - \\\\sin^2\\\\alpha = 1 - 2\\\\sin^2\\\\alpha = 2\\\\cos^2\\\\alpha - 1$ | Double angle |\n' +
    '| Sine rule: $\\\\frac{a}{\\\\sin A} = \\\\frac{b}{\\\\sin B} = \\\\frac{c}{\\\\sin C}$ | Any triangle |\n' +
    '| Cosine rule: $a^2 = b^2 + c^2 - 2bc\\\\cos A$ | Any triangle |\n' +
    '| Area $= \\\\frac{1}{2}ab\\\\sin C$ | Any triangle |'
  ),

  textBlock(4,
    '## Analytical Geometry\n\n' +
    '| Formula | |\n|---|---|\n' +
    '| Distance: $d = \\\\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$ | |\n' +
    '| Midpoint: $M = \\\\left(\\\\frac{x_1+x_2}{2}, \\\\frac{y_1+y_2}{2}\\\\right)$ | |\n' +
    '| Gradient: $m = \\\\frac{y_2-y_1}{x_2-x_1}$ | |\n' +
    '| Inclination: $\\\\tan\\\\theta = m$ | $\\\\theta \\\\in [0\u00b0, 180\u00b0)$ |\n' +
    '| Circle: $(x-a)^2 + (y-b)^2 = r^2$ | Centre $(a,b)$, radius $r$ |\n' +
    '| Tangent $\\\\perp$ radius at point of tangency | $m_1 \\\\cdot m_2 = -1$ |'
  ),

  textBlock(5,
    '## Differential Calculus\n\n' +
    '| Formula | |\n|---|---|\n' +
    '| First principles: $f\'(x) = \\\\lim_{h \\\\to 0} \\\\frac{f(x+h) - f(x)}{h}$ | |\n' +
    '| Power rule: $\\\\frac{d}{dx}[x^n] = nx^{n-1}$ | |\n' +
    '| Tangent line at $(a, f(a))$: $y - f(a) = f\'(a)(x - a)$ | |\n' +
    '| Stationary points: $f\'(x) = 0$ | |\n' +
    '| Concavity: $f\'\'(x) > 0$ concave up, $f\'\'(x) < 0$ concave down | |\n' +
    '| Point of inflection: $f\'\'(x) = 0$ (and sign changes) | |\n\n' +
    '**Cubic sketching checklist:** $y$-intercept \u2192 $x$-intercepts (factorise) \u2192 stationary points \u2192 point of inflection \u2192 end behaviour \u2192 sketch.'
  ),

  textBlock(6,
    '## Finance\n\n' +
    '| Formula | |\n|---|---|\n' +
    '| Compound growth: $A = P(1 + i)^n$ | |\n' +
    '| Compound decay: $A = P(1 - i)^n$ | |\n' +
    '| Future value annuity: $F = x\\\\left[\\\\frac{(1+i)^n - 1}{i}\\\\right]$ | |\n' +
    '| Present value annuity: $P = x\\\\left[\\\\frac{1 - (1+i)^{-n}}{i}\\\\right]$ | |\n' +
    '| Finding $n$: use $\\\\log$ \u2014 e.g., $n = \\\\frac{\\\\log(A/P)}{\\\\log(1+i)}$ | |\n\n' +
    '**Key:** $i$ = interest rate per period, $n$ = number of periods, $x$ = regular payment.'
  ),

  textBlock(7,
    '## Euclidean Geometry\n\n' +
    '**Proportionality theorem:** A line parallel to one side of a triangle divides the other two sides proportionally.\n\n' +
    '**Similar triangles:** If two triangles are equiangular, their corresponding sides are in proportion.\n\n' +
    '**Key proof strategy:** Identify parallel lines \u2192 use proportionality \u2192 set up ratios \u2192 solve.\n\n' +
    '## Statistics\n\n' +
    '| Concept | |\n|---|---|\n' +
    '| $\\\\bar{x} = \\\\frac{\\\\sum x_i}{n}$ | Mean |\n' +
    '| $\\\\hat{y} = a + bx$ | Regression line (least squares) |\n' +
    '| $r$ | Correlation coefficient: $-1 \\\\leq r \\\\leq 1$ |\n' +
    '| $r \\\\approx \\\\pm 1$: strong linear relationship | |\n' +
    '| $r \\\\approx 0$: weak/no linear relationship | |\n\n' +
    '## Probability\n\n' +
    '| Rule | |\n|---|---|\n' +
    '| $P(A \\\\text{ or } B) = P(A) + P(B) - P(A \\\\text{ and } B)$ | Addition rule |\n' +
    '| Mutually exclusive: $P(A \\\\text{ and } B) = 0$ | |\n' +
    '| Independent: $P(A \\\\text{ and } B) = P(A) \\\\times P(B)$ | |\n' +
    '| Complementary: $P(A\') = 1 - P(A)$ | |\n' +
    '| Counting: $n! = n \\\\times (n-1) \\\\times \\\\cdots \\\\times 1$ | |\n' +
    '| Arrangements of $n$ objects: $n!$ | |\n' +
    '| With repeats: $\\\\frac{n!}{a! \\\\cdot b! \\\\cdots}$ | |'
  ),
];

// ─── Revision Lesson 2: Paper 1 Mixed Exercises ─────────────────────────────

blockNum = 0;
const paper1Blocks = [
  textBlock(1,
    '## Paper 1 Revision Exercises\n\n' +
    'Paper 1 covers: Algebra, Patterns & Sequences, Finance, Functions & Inverses, Differential Calculus, and Probability. Duration: 3 hours, 150 marks.\n\n' +
    '---\n\n### Section A: Short Questions'
  ),

  quizBlock(2,
    'Simplify without a calculator: $\\\\log_3 27 + \\\\log_2 \\\\frac{1}{8}$',
    ['$0$', '$6$', '$3$', '$-3$'],
    0,
    '$\\\\log_3 27 = 3$ and $\\\\log_2 \\\\frac{1}{8} = \\\\log_2 2^{-3} = -3$. So $3 + (-3) = 0$.'
  ),

  quizBlock(3,
    'The 5th term of an arithmetic sequence is 23 and the 12th term is 58. What is the common difference?',
    ['$d = 7$', '$d = 5$', '$d = 3$', '$d = 8$'],
    1,
    '$T_{12} - T_5 = 7d$, so $58 - 23 = 35 = 7d$, giving $d = 5$.'
  ),

  quizBlock(4,
    'For which values of $r$ does $\\\\sum_{k=1}^{\\\\infty} 3 \\\\cdot r^k$ converge?',
    ['$r > 1$', '$-1 < r < 1$', '$r < -1$', '$0 < r < 1$'],
    1,
    'An infinite geometric series converges when $|r| < 1$, i.e., $-1 < r < 1$.'
  ),

  fillBlock(5,
    'If $f(x) = 2x^3 - x^2 + 3x - 1$, then $f\'(x) =$ ___ $x^2$ ___ $x +$ ___.',
    ['$6$', '$- 2$', '$3$'],
    'Using the power rule: $f\'(x) = 6x^2 - 2x + 3$.',
    ['Apply the power rule to each term separately.']
  ),

  textBlock(6,
    '### Section B: Extended Questions\n\n' +
    '**Question 5** (8 marks)\n\n' +
    'A car depreciates from R240 000 to R85 000 over 5 years on the reducing-balance method.\n\n' +
    '(a) Calculate the annual rate of depreciation. (4)\n\n' +
    '(b) If a new car of the same model costs R310 000 in 5 years, calculate the additional amount needed if the old car\'s depreciation value is used as a trade-in. (2)\n\n' +
    '(c) A sinking fund, earning 9,5% p.a. compounded monthly, is set up to cover this shortfall. Calculate the monthly payment. (2)\n\n' +
    '---\n\n' +
    '**Worked Solution:**\n\n' +
    '(a) $A = P(1-i)^n$\n' +
    '$85000 = 240000(1-i)^5$\n' +
    '$(1-i)^5 = \\\\frac{85000}{240000} = 0{,}354167$\n' +
    '$1-i = (0{,}354167)^{1/5} = 0{,}7695$\n' +
    '$i = 0{,}2305 \\\\approx 23{,}05\\\\%$ p.a.\n\n' +
    '(b) Shortfall $= 310000 - 85000 = $ R$225\\\\,000$\n\n' +
    '(c) $F = x\\\\left[\\\\frac{(1+i)^n - 1}{i}\\\\right]$ where $i = \\\\frac{0{,}095}{12}$, $n = 60$\n' +
    '$225000 = x\\\\left[\\\\frac{(1{,}007917)^{60} - 1}{0{,}007917}\\\\right]$\n' +
    '$225000 = x(76{,}2965)$\n' +
    '$x = $ R$2\\\\,950{,}27$'
  ),

  quizBlock(7,
    'The derivative of $f(x) = (2x-1)(x^2+3)$ is:',
    ['$f\'(x) = 6x^2 - 2x + 6$', '$f\'(x) = 2x^2 + 6$', '$f\'(x) = 4x^2 + 6$', '$f\'(x) = 6x^2 + 6$'],
    0,
    'Expand first: $f(x) = 2x^3 - x^2 + 6x - 3$. Then $f\'(x) = 6x^2 - 2x + 6$.',
    ['Expand the product before differentiating.']
  ),

  textBlock(8,
    '**Question 7** (10 marks)\n\n' +
    'Given $f(x) = x^3 - 6x^2 + 9x + 2$:\n\n' +
    '(a) Find the coordinates of the stationary points. (5)\n' +
    '(b) Determine the point of inflection. (2)\n' +
    '(c) Sketch the graph, showing all intercepts and turning points. (3)\n\n' +
    '---\n\n' +
    '**Worked Solution:**\n\n' +
    '(a) $f\'(x) = 3x^2 - 12x + 9 = 3(x^2 - 4x + 3) = 3(x-1)(x-3)$\n' +
    '$f\'(x) = 0$ when $x = 1$ or $x = 3$\n' +
    '$f(1) = 1 - 6 + 9 + 2 = 6$ \u2192 Local max at $(1, 6)$\n' +
    '$f(3) = 27 - 54 + 27 + 2 = 2$ \u2192 Local min at $(3, 2)$\n\n' +
    '(b) $f\'\'(x) = 6x - 12 = 0$ \u2192 $x = 2$\n' +
    '$f(2) = 8 - 24 + 18 + 2 = 4$ \u2192 Point of inflection at $(2, 4)$\n\n' +
    '(c) $y$-intercept: $f(0) = 2$\n' +
    'Shape: positive leading coefficient \u2192 rises right\n' +
    'Plot turning points, inflection, and $y$-intercept.'
  ),

  quizBlock(9,
    'If events $A$ and $B$ are independent with $P(A) = 0{,}4$ and $P(B) = 0{,}3$, find $P(A \\\\text{ or } B)$.',
    ['$0{,}70$', '$0{,}58$', '$0{,}12$', '$0{,}52$'],
    1,
    '$P(A \\\\text{ or } B) = P(A) + P(B) - P(A \\\\text{ and } B) = 0{,}4 + 0{,}3 - (0{,}4)(0{,}3) = 0{,}7 - 0{,}12 = 0{,}58$.'
  ),

  fillBlock(10,
    'A geometric series has $a = 12$ and $S_\\\\infty = 36$. The common ratio $r =$ ___.',
    ['$\\\\frac{2}{3}$'],
    '$S_\\\\infty = \\\\frac{a}{1-r}$, so $36 = \\\\frac{12}{1-r}$, giving $1-r = \\\\frac{1}{3}$, so $r = \\\\frac{2}{3}$.',
    ['Use the sum to infinity formula and solve for r.']
  ),

  quizBlock(11,
    'How many 4-digit codes can be formed from digits 1\u20139 if no digit may be repeated?',
    ['$3024$', '$6561$', '$9000$', '$5040$'],
    0,
    '$9 \\\\times 8 \\\\times 7 \\\\times 6 = 3024$',
    ['First position: 9 choices, second: 8, etc.']
  ),
];

// ─── Revision Lesson 3: Paper 2 Mixed Exercises ─────────────────────────────

blockNum = 0;
const paper2Blocks = [
  textBlock(1,
    '## Paper 2 Revision Exercises\n\n' +
    'Paper 2 covers: Statistics, Analytical Geometry, Trigonometry, and Euclidean Geometry. Duration: 3 hours, 150 marks.\n\n' +
    '---\n\n### Section A: Short Questions'
  ),

  quizBlock(2,
    'The equation of a circle with centre $(-2, 3)$ and radius 5 is:',
    ['$(x+2)^2 + (y-3)^2 = 25$', '$(x-2)^2 + (y+3)^2 = 25$', '$(x+2)^2 + (y-3)^2 = 5$', '$(x-2)^2 + (y-3)^2 = 25$'],
    0,
    'Standard form: $(x-a)^2 + (y-b)^2 = r^2$ with centre $(a,b) = (-2,3)$ and $r = 5$.'
  ),

  quizBlock(3,
    'If the gradient of a radius to point $P$ on a circle is $\\\\frac{3}{4}$, the gradient of the tangent at $P$ is:',
    ['$\\\\frac{3}{4}$', '$-\\\\frac{4}{3}$', '$\\\\frac{4}{3}$', '$-\\\\frac{3}{4}$'],
    1,
    'Tangent $\\\\perp$ radius, so $m_{\\\\text{tangent}} = -\\\\frac{1}{m_{\\\\text{radius}}} = -\\\\frac{4}{3}$.'
  ),

  fillBlock(4,
    'The compound angle formula: $\\\\cos(\\\\alpha - \\\\beta) = \\\\cos\\\\alpha\\\\cos\\\\beta$ ___ $\\\\sin\\\\alpha\\\\sin\\\\beta$.',
    ['$+$'],
    '$\\\\cos(\\\\alpha - \\\\beta) = \\\\cos\\\\alpha\\\\cos\\\\beta + \\\\sin\\\\alpha\\\\sin\\\\beta$. Note the sign is opposite to the operator.'
  ),

  textBlock(5,
    '### Section B: Analytical Geometry\n\n' +
    '**Question 4** (12 marks)\n\n' +
    'Circle $C$ has equation $x^2 + y^2 - 4x + 6y - 12 = 0$.\n\n' +
    '(a) Write in standard form and state the centre and radius. (3)\n' +
    '(b) Determine whether $P(5, 1)$ lies inside, on, or outside the circle. (2)\n' +
    '(c) Find the equation of the tangent to the circle at $A(6, 0)$. (4)\n' +
    '(d) A second circle with centre $B(10, -1)$ touches circle $C$ externally. Find the radius of the second circle. (3)\n\n' +
    '---\n\n' +
    '**Worked Solution:**\n\n' +
    '(a) $(x^2 - 4x + 4) + (y^2 + 6y + 9) = 12 + 4 + 9 = 25$\n' +
    '$(x-2)^2 + (y+3)^2 = 25$\n' +
    'Centre $(2, -3)$, radius $= 5$\n\n' +
    '(b) $(5-2)^2 + (1+3)^2 = 9 + 16 = 25 = r^2$ \u2192 $P$ lies **on** the circle.\n\n' +
    '(c) $m_{CA} = \\\\frac{0-(-3)}{6-2} = \\\\frac{3}{4}$ \u2192 $m_{\\\\text{tangent}} = -\\\\frac{4}{3}$\n' +
    '$y - 0 = -\\\\frac{4}{3}(x - 6)$\n' +
    '$y = -\\\\frac{4}{3}x + 8$\n\n' +
    '(d) $CB = \\\\sqrt{(10-2)^2 + (-1+3)^2} = \\\\sqrt{64+4} = \\\\sqrt{68}$\n' +
    'External tangency: $r_1 + r_2 = CB$\n' +
    '$5 + r_2 = \\\\sqrt{68}$\n' +
    '$r_2 = \\\\sqrt{68} - 5 \\\\approx 3{,}25$'
  ),

  quizBlock(6,
    'Simplify: $\\\\cos 75\u00b0$',
    ['$\\\\frac{\\\\sqrt{6} - \\\\sqrt{2}}{4}$', '$\\\\frac{\\\\sqrt{6} + \\\\sqrt{2}}{4}$', '$\\\\frac{\\\\sqrt{3} - 1}{2\\\\sqrt{2}}$', 'Both A and C'],
    3,
    '$\\\\cos 75\u00b0 = \\\\cos(45\u00b0 + 30\u00b0) = \\\\cos 45\u00b0\\\\cos 30\u00b0 - \\\\sin 45\u00b0\\\\sin 30\u00b0 = \\\\frac{\\\\sqrt{2}}{2} \\\\cdot \\\\frac{\\\\sqrt{3}}{2} - \\\\frac{\\\\sqrt{2}}{2} \\\\cdot \\\\frac{1}{2} = \\\\frac{\\\\sqrt{6} - \\\\sqrt{2}}{4}$. Option C is the same value in a different form.'
  ),

  textBlock(7,
    '### Section C: Trigonometry\n\n' +
    '**Question 6** (10 marks)\n\n' +
    'From a point $A$ on the ground, the angle of elevation of the top $T$ of a building is $38\u00b0$. From point $B$, which is 50 m closer to the building (on the same horizontal line as $A$), the angle of elevation is $52\u00b0$.\n\n' +
    '(a) Calculate the height of the building. (6)\n' +
    '(b) Calculate the distance from $B$ to the base of the building. (2)\n' +
    '(c) Calculate the distance $AT$. (2)\n\n' +
    '---\n\n' +
    '**Worked Solution:**\n\n' +
    'Let the height be $h$ and distance from $B$ to the base be $d$.\n\n' +
    'From $B$: $\\\\tan 52\u00b0 = \\\\frac{h}{d}$ \u2192 $h = d\\\\tan 52\u00b0$ ... (1)\n\n' +
    'From $A$: $\\\\tan 38\u00b0 = \\\\frac{h}{d + 50}$ \u2192 $h = (d+50)\\\\tan 38\u00b0$ ... (2)\n\n' +
    '(1) = (2): $d\\\\tan 52\u00b0 = (d+50)\\\\tan 38\u00b0$\n' +
    '$d(\\\\tan 52\u00b0 - \\\\tan 38\u00b0) = 50\\\\tan 38\u00b0$\n' +
    '$d = \\\\frac{50\\\\tan 38\u00b0}{\\\\tan 52\u00b0 - \\\\tan 38\u00b0} = \\\\frac{50(0{,}7813)}{1{,}2799 - 0{,}7813} = \\\\frac{39{,}065}{0{,}4986} = 78{,}35$ m\n\n' +
    '(b) $d \\\\approx 78{,}35$ m\n\n' +
    '(a) $h = 78{,}35 \\\\times \\\\tan 52\u00b0 = 78{,}35 \\\\times 1{,}2799 = 100{,}28$ m\n\n' +
    '(c) $AT = \\\\frac{h}{\\\\sin 38\u00b0} = \\\\frac{100{,}28}{0{,}6157} = 162{,}9$ m'
  ),

  quizBlock(8,
    'If $\\\\cos\\\\theta = -\\\\frac{3}{5}$ and $\\\\theta \\\\in [180\u00b0, 360\u00b0]$, then $\\\\sin 2\\\\theta =$',
    ['$\\\\frac{24}{25}$', '$-\\\\frac{24}{25}$', '$\\\\frac{7}{25}$', '$-\\\\frac{7}{25}$'],
    0,
    '$\\\\theta$ is in the 3rd quadrant (cos negative, $180\u00b0$\u2013$270\u00b0$). $\\\\sin\\\\theta = -\\\\frac{4}{5}$. $\\\\sin 2\\\\theta = 2\\\\sin\\\\theta\\\\cos\\\\theta = 2(-\\\\frac{4}{5})(-\\\\frac{3}{5}) = \\\\frac{24}{25}$.',
    ['Draw a sketch in the correct quadrant to find sin \u03b8.']
  ),

  textBlock(9,
    '### Section D: Euclidean Geometry\n\n' +
    '**Question 8** (8 marks)\n\n' +
    'In $\\\\triangle ABC$, $D$ is on $AB$ and $E$ is on $AC$ such that $DE \\\\parallel BC$. $AD = 3$, $DB = 5$, and $AE = 4{,}5$.\n\n' +
    '(a) Calculate $EC$. (2)\n' +
    '(b) If $DE = 6$, calculate $BC$. (3)\n' +
    '(c) Calculate $\\\\frac{\\\\text{Area } \\\\triangle ADE}{\\\\text{Area } \\\\triangle ABC}$. (3)\n\n' +
    '---\n\n' +
    '**Worked Solution:**\n\n' +
    '(a) By the proportionality theorem ($DE \\\\parallel BC$):\n' +
    '$\\\\frac{AD}{DB} = \\\\frac{AE}{EC}$\n' +
    '$\\\\frac{3}{5} = \\\\frac{4{,}5}{EC}$\n' +
    '$EC = \\\\frac{5 \\\\times 4{,}5}{3} = 7{,}5$\n\n' +
    '(b) $\\\\triangle ADE \\\\;|||\\\\; \\\\triangle ABC$ (equiangular)\n' +
    '$\\\\frac{DE}{BC} = \\\\frac{AD}{AB} = \\\\frac{3}{8}$\n' +
    '$BC = \\\\frac{6 \\\\times 8}{3} = 16$\n\n' +
    '(c) $\\\\frac{\\\\text{Area } \\\\triangle ADE}{\\\\text{Area } \\\\triangle ABC} = \\\\left(\\\\frac{AD}{AB}\\\\right)^2 = \\\\left(\\\\frac{3}{8}\\\\right)^2 = \\\\frac{9}{64}$'
  ),

  quizBlock(10,
    'In the diagram, $DE \\\\parallel BC$. If $\\\\frac{AD}{AB} = \\\\frac{2}{5}$, then $\\\\frac{DE}{BC} =$',
    ['$\\\\frac{2}{5}$', '$\\\\frac{4}{25}$', '$\\\\frac{2}{3}$', '$\\\\frac{3}{5}$'],
    0,
    'Similar triangles: corresponding sides are in the same ratio. $\\\\frac{DE}{BC} = \\\\frac{AD}{AB} = \\\\frac{2}{5}$.'
  ),

  fillBlock(11,
    'The correlation coefficient $r$ for a data set is $-0{,}92$. This indicates a ___ (strong/weak) ___ (positive/negative) linear relationship.',
    ['strong', 'negative'],
    '$|r| = 0{,}92$ is close to 1, indicating a strong relationship. The negative sign means as $x$ increases, $y$ decreases.'
  ),

  quizBlock(12,
    'The regression line for a data set is $\\\\hat{y} = 2{,}3x + 15$. Predict $y$ when $x = 10$.',
    ['$38$', '$25{,}3$', '$153$', '$17{,}3$'],
    0,
    '$\\\\hat{y} = 2{,}3(10) + 15 = 23 + 15 = 38$.'
  ),
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const now = new Date();
  const baseDoc = {
    schoolId: SCHOOL_ID,
    createdBy: CREATED_BY,
    gradeId: GRADE_ID,
    subjectId: SUBJECT_ID,
    type: 'lesson',
    status: 'approved',
    term: 4,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    __v: 0,
  };

  const res1 = await db.collection('contentresources').insertOne({
    ...baseDoc,
    title: 'Key Formulae and Concepts \u2014 Complete Reference',
    description: 'All formulae and key concepts needed for the NSC Grade 12 Mathematics examination.',
    blocks: formulaeBlocks,
    curriculumNodeId: new mongoose.Types.ObjectId('69d0b97e7d29abc8f9c3b1ad'),
  });
  console.log('Inserted: Key Formulae \u2014', String(res1.insertedId));

  const res2 = await db.collection('contentresources').insertOne({
    ...baseDoc,
    title: 'Paper 1 Revision \u2014 Mixed Exercises',
    description: 'Practice questions covering Algebra, Functions, Calculus, Finance, Sequences, and Probability.',
    blocks: paper1Blocks,
    curriculumNodeId: new mongoose.Types.ObjectId('69d0b97e7d29abc8f9c3b1ad'),
  });
  console.log('Inserted: Paper 1 Revision \u2014', String(res2.insertedId));

  const res3 = await db.collection('contentresources').insertOne({
    ...baseDoc,
    title: 'Paper 2 Revision \u2014 Mixed Exercises',
    description: 'Practice questions covering Statistics, Analytical Geometry, Trigonometry, and Euclidean Geometry.',
    blocks: paper2Blocks,
    curriculumNodeId: new mongoose.Types.ObjectId('69d0b97e7d29abc8f9c3b1ad'),
  });
  console.log('Inserted: Paper 2 Revision \u2014', String(res3.insertedId));

  // Add Chapter 10 to textbook
  const tb = await db.collection('textbooks').findOne({ _id: TEXTBOOK_ID });
  const newChapter = {
    id: new mongoose.Types.ObjectId().toString(),
    title: 'Chapter 10: Revision and Exam Preparation',
    description: 'Complete formula reference, Paper 1 and Paper 2 mixed practice exercises for NSC exam preparation.',
    order: 10,
    curriculumNodeId: new mongoose.Types.ObjectId('69d0b97e7d29abc8f9c3b1ad'),
    resources: [
      { resourceId: res1.insertedId, order: 0 },
      { resourceId: res2.insertedId, order: 1 },
      { resourceId: res3.insertedId, order: 2 },
    ],
  };

  await db.collection('textbooks').updateOne(
    { _id: TEXTBOOK_ID },
    { $push: { chapters: newChapter } },
  );
  console.log('\nAdded Chapter 10 to textbook. Total chapters: ' + ((tb.chapters || []).length + 1));
  console.log('Done!');

  await mongoose.disconnect();
}

main();
