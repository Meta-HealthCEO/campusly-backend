import mongoose from 'mongoose';
/**
 * Insert 6 missing lesson resources into the contentresources collection.
 *
 * Usage:
 *   MONGODB_URI=mongodb://... npx tsx scripts/insert-missing-lessons-1.ts
 */



const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is not set.');
  process.exit(1);
}

const SCHOOL_ID = '69ce960a98ca4ee738d25416';
const CREATED_BY = '69ce960b98ca4ee738d25432';
const GRADE_ID = '69d0c1241d8a9f6a83801642';
const SUBJECT_ID = '69d0c1241d8a9f6a83801644';

// ---------------------------------------------------------------------------
// Block builders
// ---------------------------------------------------------------------------

function textBlock(
  id: string,
  order: number,
  html: string,
  nodeId: string,
): object {
  return {
    blockId: id,
    type: 'text',
    order,
    content: { html },
    points: 0,
    hints: [],
    explanation: null,
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  };
}

function headingBlock(
  id: string,
  order: number,
  text: string,
  level: number = 2,
): object {
  return {
    blockId: id,
    type: 'heading',
    order,
    content: { text, level },
    points: 0,
    hints: [],
    explanation: null,
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  };
}

function workedExampleBlock(
  id: string,
  order: number,
  problem: string,
  steps: string[],
  answer: string,
): object {
  return {
    blockId: id,
    type: 'worked_example',
    order,
    content: { problem, steps, answer },
    points: 0,
    hints: [],
    explanation: null,
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  };
}

function mcqBlock(
  id: string,
  order: number,
  question: string,
  options: string[],
  correctAnswer: string,
  explanation: string,
  points: number = 2,
): object {
  return {
    blockId: id,
    type: 'quiz',
    order,
    content: { question },
    points,
    hints: [],
    explanation,
    metadata: { correctAnswer, options, questionType: 'mcq' },
    curriculumNodeId: null,
    cognitiveLevel: null,
  };
}

function fillBlankBlock(
  id: string,
  order: number,
  question: string,
  blanks: string[],
  explanation: string,
  points: number = 2,
): object {
  return {
    blockId: id,
    type: 'fill_blank',
    order,
    content: { question },
    points,
    hints: [],
    explanation,
    metadata: { blanks, questionType: 'fill_blank' },
    curriculumNodeId: null,
    cognitiveLevel: null,
  };
}

function calloutBlock(
  id: string,
  order: number,
  variant: 'info' | 'warning' | 'tip' | 'key',
  title: string,
  html: string,
): object {
  return {
    blockId: id,
    type: 'callout',
    order,
    content: { variant, title, html },
    points: 0,
    hints: [],
    explanation: null,
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  };
}

// ---------------------------------------------------------------------------
// Lesson definitions
// ---------------------------------------------------------------------------

function lesson1(): object {
  return {
    curriculumNodeId: new mongoose.Types.ObjectId('69d0b97e7d29abc8f9c3b185'),
    schoolId: new mongoose.Types.ObjectId(SCHOOL_ID),
    gradeId: new mongoose.Types.ObjectId(GRADE_ID),
    subjectId: new mongoose.Types.ObjectId(SUBJECT_ID),
    createdBy: new mongoose.Types.ObjectId(CREATED_BY),
    type: 'lesson',
    format: 'interactive',
    title: 'Inverse of a Function — lesson',
    status: 'approved',
    source: 'ai_generated',
    isDeleted: false,
    term: 1,
    difficulty: 'intermediate',
    estimatedMinutes: 45,
    tags: ['inverse functions', 'domain restriction', 'logarithm', 'functions'],
    createdAt: new Date(),
    updatedAt: new Date(),
    blocks: [
      headingBlock('b1', 1, 'What is an Inverse Function?'),
      textBlock(
        'b2',
        2,
        `<p>The <strong>inverse</strong> of a function $f(x)$ is a new function, written $f^{-1}(x)$, that undoes what $f$ does.</p>
<p><strong>Method:</strong> To find the inverse of $y = f(x)$, swap $x$ and $y$, then solve for $y$.</p>
<p>Example: If $f(x) = 2x + 3$, then to find $f^{-1}(x)$:</p>
<ol>
  <li>Write $y = 2x + 3$</li>
  <li>Swap $x$ and $y$: $x = 2y + 3$</li>
  <li>Solve for $y$: $y = \\dfrac{x - 3}{2}$</li>
</ol>
<p>So $f^{-1}(x) = \\dfrac{x - 3}{2}$.</p>`,
        '',
      ),
      calloutBlock(
        'b3',
        3,
        'key',
        'Key Concept',
        '<p>The graphs of $f$ and $f^{-1}$ are reflections of each other in the line $y = x$.</p>',
      ),
      headingBlock('b4', 4, 'One-to-One Functions and the Horizontal Line Test'),
      textBlock(
        'b5',
        5,
        `<p>A function has an inverse <em>that is also a function</em> only if it is <strong>one-to-one</strong> — each $y$-value is produced by exactly one $x$-value.</p>
<p><strong>Horizontal Line Test:</strong> Draw horizontal lines across the graph. If any horizontal line cuts the graph more than once, the function is NOT one-to-one and its inverse will not be a function.</p>
<ul>
  <li>$f(x) = 2x + 3$ — passes the test (straight line): inverse is a function.</li>
  <li>$f(x) = x^2$ — fails the test (parabola): we must restrict the domain.</li>
</ul>`,
        '',
      ),
      headingBlock('b6', 6, 'Restricting the Domain'),
      textBlock(
        'b7',
        7,
        `<p>For $f(x) = ax^2$, restrict the domain to $x \\geq 0$ or $x \\leq 0$ to make the inverse a function.</p>
<ul>
  <li>If $x \\geq 0$: $f^{-1}(x) = \\sqrt{\\dfrac{x}{a}}$</li>
  <li>If $x \\leq 0$: $f^{-1}(x) = -\\sqrt{\\dfrac{x}{a}}$</li>
</ul>
<p>For the inverse of the exponential $f(x) = b^x$ (where $b > 0,\\, b \\neq 1$), no restriction is needed because exponential functions are already one-to-one:</p>
<p>$$f^{-1}(x) = \\log_b(x)$$</p>`,
        '',
      ),
      workedExampleBlock(
        'b8',
        8,
        'Find the inverse of $f(x) = 3x^2$ for $x \\leq 0$, and state its domain and range.',
        [
          'Write $y = 3x^2$.',
          'Swap $x$ and $y$: $x = 3y^2$.',
          'Solve for $y$: $y^2 = \\dfrac{x}{3}$, so $y = \\pm\\sqrt{\\dfrac{x}{3}}$.',
          'Since the original domain is $x \\leq 0$, the inverse uses the negative root: $f^{-1}(x) = -\\sqrt{\\dfrac{x}{3}}$.',
          'Domain of $f^{-1}$: $x \\geq 0$ (the range of $f$). Range of $f^{-1}$: $y \\leq 0$ (the domain of $f$).',
        ],
        '$f^{-1}(x) = -\\sqrt{\\dfrac{x}{3}},\\quad x \\geq 0$',
      ),
      fillBlankBlock(
        'b9',
        9,
        'To find the inverse of a function, interchange ___ and ___, then solve for ___.',
        ['x', 'y', 'y'],
        'The standard method swaps the roles of $x$ and $y$, then isolates $y$ to get the inverse function.',
      ),
      mcqBlock(
        'b10',
        10,
        'What is the inverse of $f(x) = 2x + 3$?',
        [
          'A: $f^{-1}(x) = 2x - 3$',
          'B: $f^{-1}(x) = \\dfrac{x + 3}{2}$',
          'C: $f^{-1}(x) = \\dfrac{x - 3}{2}$',
          'D: $f^{-1}(x) = \\dfrac{1}{2x + 3}$',
        ],
        'C',
        'Swap $x$ and $y$: $x = 2y + 3$. Solve: $y = \\dfrac{x - 3}{2}$. So $f^{-1}(x) = \\dfrac{x - 3}{2}$.',
      ),
      mcqBlock(
        'b11',
        11,
        'The inverse of $f(x) = b^x$ is:',
        [
          'A: $f^{-1}(x) = x^b$',
          'B: $f^{-1}(x) = \\log_x(b)$',
          'C: $f^{-1}(x) = \\log_b(x)$',
          'D: $f^{-1}(x) = b \\cdot \\log(x)$',
        ],
        'C',
        'Swap $x$ and $y$: $x = b^y$. Rewrite in logarithmic form: $y = \\log_b(x)$.',
      ),
      calloutBlock(
        'b12',
        12,
        'tip',
        'NSC Tip',
        '<p>In NSC exams, learners are often asked to state the domain restriction that makes an inverse a function. Always motivate your restriction using the horizontal line test.</p>',
      ),
    ],
  };
}

function lesson2(): object {
  return {
    curriculumNodeId: new mongoose.Types.ObjectId('69d0b97e7d29abc8f9c3b186'),
    schoolId: new mongoose.Types.ObjectId(SCHOOL_ID),
    gradeId: new mongoose.Types.ObjectId(GRADE_ID),
    subjectId: new mongoose.Types.ObjectId(SUBJECT_ID),
    createdBy: new mongoose.Types.ObjectId(CREATED_BY),
    type: 'lesson',
    format: 'interactive',
    title: 'Graphs of Inverse Functions — lesson',
    status: 'approved',
    source: 'ai_generated',
    isDeleted: false,
    term: 1,
    difficulty: 'intermediate',
    estimatedMinutes: 45,
    tags: ['inverse functions', 'graphs', 'reflection', 'logarithm', 'parabola'],
    createdAt: new Date(),
    updatedAt: new Date(),
    blocks: [
      headingBlock('b1', 1, 'The Inverse as a Reflection in $y = x$'),
      textBlock(
        'b2',
        2,
        `<p>The graph of $f^{-1}$ is obtained by <strong>reflecting</strong> the graph of $f$ in the line $y = x$.</p>
<p>This means every point $(a,\\, b)$ on $f$ maps to the point $(b,\\, a)$ on $f^{-1}$.</p>
<p>To sketch $f^{-1}$: draw the line $y = x$, then mirror the graph of $f$ across it.</p>`,
        '',
      ),
      headingBlock('b2h', 3, 'Inverse of a Linear Function: $y = ax + q$'),
      textBlock(
        'b3',
        4,
        `<p>For $f(x) = ax + q$, the inverse is found by swapping $x$ and $y$:</p>
<p>$$f^{-1}(x) = \\frac{x - q}{a}$$</p>
<p><strong>Key features of $f^{-1}$:</strong></p>
<ul>
  <li>Domain: $x \\in \\mathbb{R}$, Range: $y \\in \\mathbb{R}$</li>
  <li>$x$-intercept: $(q, 0)$</li>
  <li>$y$-intercept: $\\left(0, -\\dfrac{q}{a}\\right)$</li>
</ul>`,
        '',
      ),
      headingBlock('b3h', 5, 'Inverse of a Parabola: $y = ax^2$, $x \\geq 0$'),
      textBlock(
        'b4',
        6,
        `<p>For $f(x) = ax^2$ restricted to $x \\geq 0$, the inverse is:</p>
<p>$$f^{-1}(x) = \\sqrt{\\frac{x}{a}},\\quad x \\geq 0$$</p>
<p><strong>Key features of $f^{-1}$:</strong></p>
<ul>
  <li>Domain: $x \\geq 0$, Range: $y \\geq 0$</li>
  <li>Shape: half of a square root curve (starts at the origin, increases)</li>
  <li>$x$-intercept and $y$-intercept: $(0, 0)$</li>
  <li>No asymptotes</li>
</ul>`,
        '',
      ),
      headingBlock('b4h', 7, 'Inverse of an Exponential: $y = b^x$'),
      textBlock(
        'b5',
        8,
        `<p>For $f(x) = b^x$ ($b > 0$, $b \\neq 1$), the inverse is the <strong>logarithmic function</strong>:</p>
<p>$$f^{-1}(x) = \\log_b(x)$$</p>
<p><strong>Key features of $f^{-1}(x) = \\log_b(x)$:</strong></p>
<ul>
  <li>Domain: $x > 0$, Range: $y \\in \\mathbb{R}$</li>
  <li>$x$-intercept: $(1, 0)$ — because $\\log_b(1) = 0$</li>
  <li>Vertical asymptote: $x = 0$ (the $y$-axis)</li>
  <li>If $b > 1$: increasing function</li>
  <li>If $0 < b < 1$: decreasing function</li>
</ul>`,
        '',
      ),
      workedExampleBlock(
        'b6',
        9,
        'Sketch $f(x) = 2^x$ and $f^{-1}(x) = \\log_2(x)$ on the same set of axes, and show the line $y = x$.',
        [
          'For $f(x) = 2^x$: $y$-intercept $(0, 1)$; as $x \\to -\\infty$, $y \\to 0$; passes through $(1, 2)$ and $(-1, 0{.}5)$.',
          'Reflect all points in $y = x$: $(0, 1) \\to (1, 0)$; $(1, 2) \\to (2, 1)$; $(-1, 0{.}5) \\to (0{.}5, -1)$.',
          '$f^{-1}(x) = \\log_2(x)$: $x$-intercept $(1, 0)$; vertical asymptote $x = 0$; passes through $(2, 1)$.',
          'Draw the line $y = x$ as the mirror axis.',
        ],
        'The two curves are mirror images of each other in $y = x$.',
      ),
      fillBlankBlock(
        'b7',
        10,
        'The graph of $f^{-1}$ is the reflection of $f$ in the line $y =$ ___. The domain of $f$ becomes the ___ of $f^{-1}$.',
        ['x', 'range'],
        'Reflection in $y = x$ swaps domain and range: $\\text{domain of } f = \\text{range of } f^{-1}$ and vice versa.',
      ),
      mcqBlock(
        'b8',
        11,
        'The vertical asymptote of $f^{-1}(x) = \\log_b(x)$ is:',
        ['A: $y = 0$', 'B: $x = 1$', 'C: $x = 0$', 'D: $y = 1$'],
        'C',
        'The logarithmic function approaches $-\\infty$ as $x \\to 0^+$, so the vertical asymptote is the $y$-axis, i.e. $x = 0$.',
      ),
      mcqBlock(
        'b9',
        12,
        'If $f(3) = 7$, then $f^{-1}(7) = $',
        ['A: $\\dfrac{1}{7}$', 'B: $3$', 'C: $7$', 'D: $\\dfrac{1}{3}$'],
        'B',
        'By definition, if $f(a) = b$ then $f^{-1}(b) = a$. So $f^{-1}(7) = 3$.',
      ),
    ],
  };
}

function lesson3(): object {
  return {
    curriculumNodeId: new mongoose.Types.ObjectId('69d0b97e7d29abc8f9c3b189'),
    schoolId: new mongoose.Types.ObjectId(SCHOOL_ID),
    gradeId: new mongoose.Types.ObjectId(GRADE_ID),
    subjectId: new mongoose.Types.ObjectId(SUBJECT_ID),
    createdBy: new mongoose.Types.ObjectId(CREATED_BY),
    type: 'lesson',
    format: 'interactive',
    title: 'Graph of the Logarithmic Function — lesson',
    status: 'approved',
    source: 'ai_generated',
    isDeleted: false,
    term: 1,
    difficulty: 'intermediate',
    estimatedMinutes: 40,
    tags: ['logarithm', 'graphs', 'asymptote', 'transformations', 'functions'],
    createdAt: new Date(),
    updatedAt: new Date(),
    blocks: [
      headingBlock('b1', 1, 'The Logarithmic Function $y = \\log_b(x)$'),
      textBlock(
        'b2',
        2,
        `<p>The logarithmic function is defined as:</p>
<p>$$y = \\log_b(x) \\quad \\Leftrightarrow \\quad b^y = x \\quad (b > 0,\\; b \\neq 1,\\; x > 0)$$</p>
<p>It is the inverse of the exponential function $y = b^x$.</p>`,
        '',
      ),
      headingBlock('b3', 3, 'Shape: $b > 1$ (Increasing)'),
      textBlock(
        'b4',
        4,
        `<p>When $b > 1$ (e.g., $y = \\log_2(x)$):</p>
<ul>
  <li>The function is <strong>increasing</strong>.</li>
  <li>As $x \\to \\infty$, $y \\to \\infty$.</li>
  <li>As $x \\to 0^+$, $y \\to -\\infty$ (approaches the $y$-axis from the right).</li>
  <li>The curve is <em>concave down</em>.</li>
</ul>
<p>Key points: $(1, 0)$, $(b, 1)$, $\\left(\\dfrac{1}{b}, -1\\right)$.</p>`,
        '',
      ),
      headingBlock('b5', 5, 'Shape: $0 < b < 1$ (Decreasing)'),
      textBlock(
        'b6',
        6,
        `<p>When $0 < b < 1$ (e.g., $y = \\log_{0.5}(x)$):</p>
<ul>
  <li>The function is <strong>decreasing</strong>.</li>
  <li>As $x \\to \\infty$, $y \\to -\\infty$.</li>
  <li>As $x \\to 0^+$, $y \\to +\\infty$.</li>
  <li>The curve is <em>concave up</em>.</li>
</ul>
<p>Key points: $(1, 0)$, $(b, 1)$ where $b < 1$.</p>`,
        '',
      ),
      calloutBlock(
        'b7',
        7,
        'key',
        'Key Features (both cases)',
        `<ul>
  <li><strong>Domain:</strong> $x > 0$</li>
  <li><strong>Range:</strong> $y \\in \\mathbb{R}$</li>
  <li><strong>$x$-intercept:</strong> $(1, 0)$ — because $\\log_b(1) = 0$ for all $b$</li>
  <li><strong>No $y$-intercept</strong> (function undefined at $x = 0$)</li>
  <li><strong>Vertical asymptote:</strong> $x = 0$ (the $y$-axis)</li>
  <li><strong>No horizontal asymptote</strong></li>
</ul>`,
      ),
      headingBlock('b8', 8, 'Transformations'),
      textBlock(
        'b9',
        9,
        `<p>For $y = \\log_b(x - p) + q$:</p>
<ul>
  <li><strong>Horizontal shift:</strong> $p$ units right (vertical asymptote moves to $x = p$).</li>
  <li><strong>Vertical shift:</strong> $q$ units up; new $x$-intercept found by setting $y = 0$.</li>
</ul>
<p>Example: $y = \\log_2(x - 3) + 1$ has asymptote $x = 3$, and $x$-intercept at $\\log_2(x-3) = -1 \\Rightarrow x - 3 = \\frac{1}{2} \\Rightarrow x = 3{.}5$.</p>`,
        '',
      ),
      workedExampleBlock(
        'b10',
        10,
        'For $f(x) = \\log_3(x)$, determine: (a) the domain, (b) the $x$-intercept, (c) whether the graph is increasing or decreasing, (d) the equation of the asymptote.',
        [
          '(a) Domain: $x > 0$, i.e., $x \\in (0; \\infty)$.',
          '(b) $x$-intercept: set $y = 0$: $\\log_3(x) = 0 \\Rightarrow x = 3^0 = 1$. So $x$-intercept is $(1, 0)$.',
          '(c) Base $b = 3 > 1$, so the function is <strong>increasing</strong>.',
          '(d) Vertical asymptote: $x = 0$.',
        ],
        'Domain: $x > 0$; $x$-int: $(1,0)$; increasing; asymptote $x = 0$.',
      ),
      fillBlankBlock(
        'b11',
        11,
        'The $x$-intercept of $y = \\log_b(x)$ is always ___ for any base $b$. The vertical asymptote is the line $x =$ ___.',
        ['(1, 0)', '0'],
        '$\\log_b(1) = 0$ for all valid bases, giving $x$-intercept $(1,0)$. The function is undefined at $x = 0$, creating the vertical asymptote $x = 0$.',
      ),
      mcqBlock(
        'b12',
        12,
        'Which of the following is the domain of $y = \\log_5(x)$?',
        [
          'A: $x \\in \\mathbb{R}$',
          'B: $x > 1$',
          'C: $x > 0$',
          'D: $x \\geq 0$',
        ],
        'C',
        'The logarithm is only defined for positive arguments, so the domain is $x > 0$. Note $x = 0$ is excluded (asymptote) and negative $x$ values give no real output.',
      ),
    ],
  };
}

function lesson4(): object {
  return {
    curriculumNodeId: new mongoose.Types.ObjectId('69d0b97e7d29abc8f9c3b182'),
    schoolId: new mongoose.Types.ObjectId(SCHOOL_ID),
    gradeId: new mongoose.Types.ObjectId(GRADE_ID),
    subjectId: new mongoose.Types.ObjectId(SUBJECT_ID),
    createdBy: new mongoose.Types.ObjectId(CREATED_BY),
    type: 'lesson',
    format: 'interactive',
    title: 'Sum Formulae for Arithmetic and Geometric Series — lesson',
    status: 'approved',
    source: 'ai_generated',
    isDeleted: false,
    term: 1,
    difficulty: 'intermediate',
    estimatedMinutes: 50,
    tags: ['series', 'arithmetic', 'geometric', 'sigma notation', 'sum to infinity'],
    createdAt: new Date(),
    updatedAt: new Date(),
    blocks: [
      headingBlock('b1', 1, 'Arithmetic Series — Sum Formula'),
      textBlock(
        'b2',
        2,
        `<p>An arithmetic series is the sum of an arithmetic sequence with first term $a$, common difference $d$, and $n$ terms:</p>
<p>$$S_n = \\frac{n}{2}\\left[2a + (n-1)d\\right]$$</p>
<p>If the last term $l$ is known:</p>
<p>$$S_n = \\frac{n}{2}(a + l)$$</p>`,
        '',
      ),
      textBlock(
        'b3',
        3,
        `<p><strong>Gauss Method (derivation):</strong></p>
<p>Write the sum forwards and backwards, then add:</p>
<p>$S_n = a + (a+d) + \\cdots + (l-d) + l$</p>
<p>$S_n = l + (l-d) + \\cdots + (a+d) + a$</p>
<p>Adding: $2S_n = n(a + l)$, so $S_n = \\dfrac{n}{2}(a + l)$.</p>
<p>Substitute $l = a + (n-1)d$ to get the first formula.</p>`,
        '',
      ),
      headingBlock('b4', 4, 'Geometric Series — Sum Formula'),
      textBlock(
        'b5',
        5,
        `<p>A geometric series has first term $a$ and constant ratio $r$ ($r \\neq 1$):</p>
<p>$$S_n = \\frac{a(r^n - 1)}{r - 1} \\quad (r \\neq 1)$$</p>
<p>Equivalently: $S_n = \\dfrac{a(1 - r^n)}{1 - r}$.</p>
<p><strong>Sum to Infinity</strong> (converges only when $|r| < 1$):</p>
<p>$$S_\\infty = \\frac{a}{1 - r} \\quad (|r| < 1)$$</p>`,
        '',
      ),
      calloutBlock(
        'b6',
        6,
        'warning',
        'Common Error',
        '<p>The sum to infinity formula $S_\\infty = \\dfrac{a}{1-r}$ only applies when $|r| < 1$. If $|r| \\geq 1$, the series <strong>diverges</strong> and has no finite sum.</p>',
      ),
      headingBlock('b7', 7, 'Sigma Notation'),
      textBlock(
        'b8',
        8,
        `<p>Sigma notation provides a compact way to write a series:</p>
<p>$$\\sum_{k=1}^{n} T_k = T_1 + T_2 + \\cdots + T_n$$</p>
<p>Examples:</p>
<ul>
  <li>$\\displaystyle\\sum_{k=1}^{5} (2k - 1) = 1 + 3 + 5 + 7 + 9 = 25$ (arithmetic)</li>
  <li>$\\displaystyle\\sum_{k=1}^{\\infty} 3\\left(\\tfrac{1}{2}\\right)^{k-1} = \\dfrac{3}{1 - \\frac{1}{2}} = 6$ (geometric, $|r| < 1$)</li>
</ul>`,
        '',
      ),
      workedExampleBlock(
        'b9',
        9,
        'Find the sum of the first 12 terms of the arithmetic series $5 + 8 + 11 + \\cdots$',
        [
          'Identify: $a = 5$, $d = 3$, $n = 12$.',
          'Use $S_n = \\dfrac{n}{2}[2a + (n-1)d]$.',
          '$S_{12} = \\dfrac{12}{2}[2(5) + (12-1)(3)]$',
          '$= 6[10 + 33]$',
          '$= 6 \\times 43 = 258$.',
        ],
        '$S_{12} = 258$',
      ),
      workedExampleBlock(
        'b10',
        10,
        'A geometric series has $a = 8$ and $r = \\dfrac{1}{2}$. Find the sum to infinity.',
        [
          'Check: $|r| = \\dfrac{1}{2} < 1$, so the sum converges.',
          'Use $S_\\infty = \\dfrac{a}{1-r}$.',
          '$S_\\infty = \\dfrac{8}{1 - \\frac{1}{2}} = \\dfrac{8}{\\frac{1}{2}} = 16$.',
        ],
        '$S_\\infty = 16$',
      ),
      fillBlankBlock(
        'b11',
        11,
        'The sum to infinity of a geometric series is $S_\\infty = \\dfrac{a}{1 - r}$, but only when $|r|$ is ___ than 1.',
        ['less'],
        'The geometric series converges only when $|r| < 1$. When $|r| \\geq 1$, the terms do not approach zero and the sum diverges.',
      ),
      mcqBlock(
        'b12',
        12,
        'The first term of a geometric series is 12 and $r = \\dfrac{1}{3}$. What is $S_\\infty$?',
        ['A: $4$', 'B: $18$', 'C: $36$', 'D: $9$'],
        'B',
        '$S_\\infty = \\dfrac{12}{1 - \\frac{1}{3}} = \\dfrac{12}{\\frac{2}{3}} = 12 \\times \\dfrac{3}{2} = 18$.',
      ),
    ],
  };
}

function lesson5(): object {
  return {
    curriculumNodeId: new mongoose.Types.ObjectId('69d0b97e7d29abc8f9c3b18d'),
    schoolId: new mongoose.Types.ObjectId(SCHOOL_ID),
    gradeId: new mongoose.Types.ObjectId(GRADE_ID),
    subjectId: new mongoose.Types.ObjectId(SUBJECT_ID),
    createdBy: new mongoose.Types.ObjectId(CREATED_BY),
    type: 'lesson',
    format: 'interactive',
    title: '2D and 3D Trigonometry Problems — lesson',
    status: 'approved',
    source: 'ai_generated',
    isDeleted: false,
    term: 1,
    difficulty: 'advanced',
    estimatedMinutes: 55,
    tags: ['trigonometry', 'sine rule', 'cosine rule', 'area rule', '3D', 'elevation'],
    createdAt: new Date(),
    updatedAt: new Date(),
    blocks: [
      headingBlock('b1', 1, 'The Three Rules of Trigonometry'),
      textBlock(
        'b2',
        2,
        `<p>For any triangle $ABC$ with opposite sides $a$, $b$, $c$:</p>
<p><strong>Sine Rule:</strong> $\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C}$</p>
<p><strong>Cosine Rule:</strong> $a^2 = b^2 + c^2 - 2bc\\cos A$</p>
<p><strong>Area Rule:</strong> $\\text{Area} = \\dfrac{1}{2}ab\\sin C$</p>`,
        '',
      ),
      calloutBlock(
        'b3',
        3,
        'tip',
        'When to Use Which Rule',
        `<ul>
  <li><strong>Sine Rule:</strong> Use when you have an angle and its opposite side (AAS or SSA).</li>
  <li><strong>Cosine Rule:</strong> Use when you have all three sides (SSS) or two sides and the included angle (SAS).</li>
  <li><strong>Area Rule:</strong> Use when you have two sides and the included angle.</li>
</ul>`,
      ),
      headingBlock('b4', 4, 'Solving 2D Triangle Problems'),
      workedExampleBlock(
        'b5',
        5,
        'In triangle $PQR$, $\\hat{P} = 52°$, $\\hat{Q} = 73°$, and $PQ = 14$ cm. Find $QR$.',
        [
          'Find $\\hat{R} = 180° - 52° - 73° = 55°$.',
          'Apply the Sine Rule: $\\dfrac{QR}{\\sin P} = \\dfrac{PQ}{\\sin R}$.',
          '$\\dfrac{QR}{\\sin 52°} = \\dfrac{14}{\\sin 55°}$.',
          '$QR = \\dfrac{14 \\sin 52°}{\\sin 55°} = \\dfrac{14 \\times 0{.}788}{0{.}819} \\approx 13{.}47$ cm.',
        ],
        '$QR \\approx 13{.}47$ cm',
      ),
      workedExampleBlock(
        'b6',
        6,
        'Triangle $ABC$ has $a = 9$, $b = 12$, $\\hat{C} = 67°$. Find side $c$ and the area of the triangle.',
        [
          'Use Cosine Rule: $c^2 = a^2 + b^2 - 2ab\\cos C$.',
          '$c^2 = 81 + 144 - 2(9)(12)\\cos 67°$.',
          '$c^2 = 225 - 216 \\times 0{.}3907 = 225 - 84{.}39 = 140{.}61$.',
          '$c = \\sqrt{140{.}61} \\approx 11{.}86$.',
          'Area $= \\dfrac{1}{2}ab\\sin C = \\dfrac{1}{2}(9)(12)\\sin 67° = 54 \\times 0{.}9205 \\approx 49{.}7$ cm².',
        ],
        '$c \\approx 11{.}86$; Area $\\approx 49{.}7$ cm²',
      ),
      headingBlock('b7', 7, '3D Trigonometry Problems'),
      textBlock(
        'b8',
        8,
        `<p>3D problems involve multiple triangles in different planes. The strategy is:</p>
<ol>
  <li>Identify the 2D triangles within the 3D figure.</li>
  <li>Find shared sides or angles that link the triangles.</li>
  <li>Apply sine or cosine rule to each triangle in turn.</li>
</ol>
<p><strong>Angle of elevation:</strong> angle measured upward from the horizontal.</p>
<p><strong>Angle of depression:</strong> angle measured downward from the horizontal.</p>`,
        '',
      ),
      workedExampleBlock(
        'b9',
        9,
        'A vertical mast $OT$ stands on horizontal ground. Points $A$ and $B$ are on the ground with $AB = 50$ m. From $A$, the angle of elevation of $T$ is $35°$. $\\hat{OAB} = 90°$ and $\\hat{OBA} = 40°$. Find the height $OT$.',
        [
          'In triangle $OAB$ (on the ground): $\\hat{OAB} = 90°$, $\\hat{OBA} = 40°$, $AB = 50$ m.',
          'Find $OA$: $\\tan 40° = \\dfrac{OA}{AB} \\Rightarrow OA = 50\\tan 40° \\approx 41{.}95$ m.',
          'In right triangle $OAT$: $\\tan 35° = \\dfrac{OT}{OA}$.',
          '$OT = OA \\tan 35° = 41{.}95 \\times 0{.}7002 \\approx 29{.}37$ m.',
        ],
        '$OT \\approx 29{.}4$ m',
      ),
      mcqBlock(
        'b10',
        10,
        'In a triangle, you are given two sides and the angle between them. Which rule do you use to find the third side?',
        [
          'A: Sine Rule',
          'B: Cosine Rule',
          'C: Area Rule',
          'D: Pythagorean Theorem only',
        ],
        'B',
        'Two sides and the included angle (SAS) requires the Cosine Rule: $c^2 = a^2 + b^2 - 2ab\\cos C$.',
      ),
      mcqBlock(
        'b11',
        11,
        'The area of triangle $DEF$ with $d = 8$, $e = 11$, and $\\hat{F} = 42°$ is:',
        [
          'A: $\\approx 29{.}5$ units²',
          'B: $\\approx 44$ units²',
          'C: $\\approx 19{.}5$ units²',
          'D: $\\approx 88$ units²',
        ],
        'A',
        'Area $= \\dfrac{1}{2}de\\sin F = \\dfrac{1}{2}(8)(11)\\sin 42° = 44 \\times 0{.}6691 \\approx 29{.}4$ units².',
      ),
      fillBlankBlock(
        'b12',
        12,
        'The sine rule states $\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin ___} = \\dfrac{c}{\\sin ___}$.',
        ['B', 'C'],
        'The sine rule relates each side to the sine of its opposite angle: $\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C}$.',
      ),
    ],
  };
}

function lesson6(): object {
  return {
    curriculumNodeId: new mongoose.Types.ObjectId('69d0b97e7d29abc8f9c3b19a'),
    schoolId: new mongoose.Types.ObjectId(SCHOOL_ID),
    gradeId: new mongoose.Types.ObjectId(GRADE_ID),
    subjectId: new mongoose.Types.ObjectId(SUBJECT_ID),
    createdBy: new mongoose.Types.ObjectId(CREATED_BY),
    type: 'lesson',
    format: 'interactive',
    title: 'Derivative from First Principles — lesson',
    status: 'approved',
    source: 'ai_generated',
    isDeleted: false,
    term: 2,
    difficulty: 'advanced',
    estimatedMinutes: 50,
    tags: ['calculus', 'derivative', 'first principles', 'limits', 'differentiation'],
    createdAt: new Date(),
    updatedAt: new Date(),
    blocks: [
      headingBlock('b1', 1, 'Definition of the Derivative from First Principles'),
      textBlock(
        'b2',
        2,
        `<p>The derivative of a function $f$ at a point $x$ is defined as:</p>
<p>$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$</p>
<p>This gives the <strong>instantaneous rate of change</strong> of $f$ at $x$, or the gradient of the tangent to $f$ at the point $(x, f(x))$.</p>`,
        '',
      ),
      calloutBlock(
        'b3',
        3,
        'key',
        'Method — 4 Steps',
        `<ol>
  <li>Write $f(x + h)$ by substituting $x + h$ into the function.</li>
  <li>Form the difference quotient: $\\dfrac{f(x+h) - f(x)}{h}$.</li>
  <li>Simplify — cancel $h$ from numerator and denominator.</li>
  <li>Take the limit as $h \\to 0$.</li>
</ol>`,
      ),
      headingBlock('b4', 4, 'First Principles: $f(x) = ax^2 + bx + c$'),
      workedExampleBlock(
        'b5',
        5,
        'Find $f\'(x)$ from first principles for $f(x) = 3x^2 - 2x + 1$.',
        [
          '$f(x+h) = 3(x+h)^2 - 2(x+h) + 1 = 3x^2 + 6xh + 3h^2 - 2x - 2h + 1$.',
          '$f(x+h) - f(x) = 6xh + 3h^2 - 2h$.',
          '$\\dfrac{f(x+h) - f(x)}{h} = \\dfrac{h(6x + 3h - 2)}{h} = 6x + 3h - 2$.',
          'As $h \\to 0$: $f\'(x) = 6x - 2$.',
        ],
        '$f\'(x) = 6x - 2$',
      ),
      headingBlock('b6', 6, 'First Principles: $f(x) = ax^3$'),
      workedExampleBlock(
        'b7',
        7,
        'Find $f\'(x)$ from first principles for $f(x) = x^3$.',
        [
          '$f(x+h) = (x+h)^3 = x^3 + 3x^2h + 3xh^2 + h^3$.',
          '$f(x+h) - f(x) = 3x^2h + 3xh^2 + h^3$.',
          '$\\dfrac{f(x+h) - f(x)}{h} = 3x^2 + 3xh + h^2$.',
          'As $h \\to 0$: $f\'(x) = 3x^2$.',
        ],
        '$f\'(x) = 3x^2$',
      ),
      headingBlock('b8', 8, 'First Principles: $f(x) = \\dfrac{a}{x}$'),
      workedExampleBlock(
        'b9',
        9,
        'Find $f\'(x)$ from first principles for $f(x) = \\dfrac{1}{x}$.',
        [
          '$f(x+h) = \\dfrac{1}{x+h}$.',
          '$f(x+h) - f(x) = \\dfrac{1}{x+h} - \\dfrac{1}{x} = \\dfrac{x - (x+h)}{x(x+h)} = \\dfrac{-h}{x(x+h)}$.',
          '$\\dfrac{f(x+h)-f(x)}{h} = \\dfrac{-h}{h \\cdot x(x+h)} = \\dfrac{-1}{x(x+h)}$.',
          'As $h \\to 0$: $f\'(x) = \\dfrac{-1}{x^2}$.',
        ],
        '$f\'(x) = -\\dfrac{1}{x^2}$',
      ),
      textBlock(
        'b10',
        10,
        `<p><strong>First Principles for a constant:</strong> $f(x) = c$</p>
<p>$f(x+h) - f(x) = c - c = 0$, so $f'(x) = 0$.</p>
<p>This confirms: the derivative of any constant is zero.</p>
<p><strong>Why use the power rule instead?</strong> The power rule $\\dfrac{d}{dx}[x^n] = nx^{n-1}$ is a shortcut derived from first principles. In practice, learners use the power rule for speed — but NSC exams sometimes require the first principles method explicitly.</p>`,
        '',
      ),
      fillBlankBlock(
        'b11',
        11,
        'The first principles definition is $f\'(x) = \\displaystyle\\lim_{h \\to ___} \\dfrac{f(x + h) - f(x)}{___}$.',
        ['0', 'h'],
        'The limit is taken as $h \\to 0$, and the expression $\\dfrac{f(x+h)-f(x)}{h}$ is the difference quotient.',
      ),
      mcqBlock(
        'b12',
        12,
        'Using first principles, $f\'(x)$ for $f(x) = 5x^2$ is:',
        [
          'A: $5x$',
          'B: $10x^2$',
          'C: $10x$',
          'D: $25x$',
        ],
        'C',
        '$f(x+h) = 5(x+h)^2 = 5x^2 + 10xh + 5h^2$. Difference: $10xh + 5h^2$. Divide by $h$: $10x + 5h$. Limit as $h \\to 0$: $10x$.',
      ),
    ],
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.\n');

  const db = mongoose.connection.db;
  const col = db.collection('contentresources');

  const lessons = [
    { name: 'Lesson 1 — Inverse of a Function', doc: lesson1() },
    { name: 'Lesson 2 — Graphs of Inverse Functions', doc: lesson2() },
    { name: 'Lesson 3 — Graph of the Logarithmic Function', doc: lesson3() },
    { name: 'Lesson 4 — Sum Formulae (Arithmetic & Geometric)', doc: lesson4() },
    { name: 'Lesson 5 — 2D and 3D Trigonometry Problems', doc: lesson5() },
    { name: 'Lesson 6 — Derivative from First Principles', doc: lesson6() },
  ];

  for (const { name, doc } of lessons) {
    console.log(`Inserting: ${name}...`);
    const result = await col.insertOne(doc);
    console.log(`  Inserted with _id: ${result.insertedId}\n`);
  }

  console.log('All 6 lessons inserted successfully.');
  await mongoose.disconnect();
}

main().catch((err: unknown) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
