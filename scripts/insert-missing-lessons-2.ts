import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(import.meta.dirname ?? __dirname, '..', '.env') });

import mongoose, { Types } from 'mongoose';
import { ContentResource } from '../src/modules/ContentLibrary/model.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const SCHOOL_ID = new Types.ObjectId('69ce960a98ca4ee738d25416');
const CREATED_BY = new Types.ObjectId('69ce960b98ca4ee738d25432');
const GRADE_ID = new Types.ObjectId('69d0c1241d8a9f6a83801642');
const SUBJECT_ID = new Types.ObjectId('69d0c1241d8a9f6a83801644');

// ─── Helper ───────────────────────────────────────────────────────────────────

function bid(n: number): string {
  return `block-${String(n).padStart(3, '0')}`;
}

// ─── Lesson 7: Cubic function sketching ──────────────────────────────────────

const lesson7Blocks = [
  {
    blockId: bid(1),
    type: 'text',
    order: 1,
    content:
      '## Cubic Functions — Sketching and Interpretation\n\nA **cubic function** has the general form:\n\n$$f(x) = ax^3 + bx^2 + cx + d, \\quad a \\neq 0$$\n\nUnderstanding the shape and key features of a cubic graph is essential for the NSC Mathematics Paper 1 examination.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(2),
    type: 'text',
    order: 2,
    content:
      '## Shape of the Cubic Graph\n\nThe sign of the leading coefficient $a$ determines the overall shape:\n\n| Condition | Left-hand behaviour | Right-hand behaviour |\n|---|---|---|\n| $a > 0$ | Falls to $-\\infty$ | Rises to $+\\infty$ |\n| $a < 0$ | Rises to $+\\infty$ | Falls to $-\\infty$ |\n\n**Key point:** Every cubic has at most **2 turning points** and exactly **1 point of inflection**.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(3),
    type: 'text',
    order: 3,
    content:
      '## Finding x-Intercepts Using the Factor Theorem\n\nThe **Factor Theorem** states: $(x - k)$ is a factor of $f(x)$ if and only if $f(k) = 0$.\n\n**Procedure:**\n1. Test integer factors of $d$ (the constant term) until $f(k) = 0$.\n2. Once a root $x = k$ is found, perform polynomial long division or synthetic division to factorise fully:\n$$f(x) = (x - k)(ax^2 + bx + c)$$\n3. Solve $ax^2 + bx + c = 0$ for the remaining roots (may be equal or non-real).',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(4),
    type: 'text',
    order: 4,
    content:
      '## Finding Turning Points Using $f\'(x) = 0$\n\nAt a turning point, the gradient of the tangent is zero. Differentiate and set equal to zero:\n\n$$f\'(x) = 0$$\n\nSolve for $x$, then substitute back into $f(x)$ to get the $y$-coordinates of the turning points.\n\n**Nature of turning points:**\n- If $f\'\'(x) < 0$ at a turning point → **local maximum**\n- If $f\'\'(x) > 0$ at a turning point → **local minimum**',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(5),
    type: 'text',
    order: 5,
    content:
      '## Point of Inflection Using $f\'\'(x) = 0$\n\nThe **point of inflection** is where the concavity changes — where the curve changes from concave up ($f\'\'(x) > 0$) to concave down ($f\'\'(x) < 0$), or vice versa.\n\n**Procedure:**\n1. Find $f\'\'(x)$.\n2. Solve $f\'\'(x) = 0$ to find the $x$-value.\n3. Substitute into $f(x)$ to get the $y$-coordinate.\n\n**Important:** The point of inflection lies **midway** between the two turning points (horizontally).',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(6),
    type: 'step_reveal',
    order: 6,
    content:
      '## Worked Example — Sketch $y = x^3 - 3x^2 - 9x + 27$\n\nFollow each step to produce a complete sketch.',
    points: 0,
    hints: [
      'Step 1: y-intercept — set $x = 0$: $y = 27$.',
      'Step 2: x-intercepts — test $x = 3$: $f(3) = 27 - 27 - 27 + 27 = 0$ ✓. Divide out $(x-3)$: $f(x) = (x-3)^2(x+3)$. Roots: $x = 3$ (double) and $x = -3$.',
      'Step 3: Turning points — $f\'(x) = 3x^2 - 6x - 9 = 3(x^2 - 2x - 3) = 3(x-3)(x+1)$. So $x = 3$ or $x = -1$. At $x = -1$: $f(-1) = -1 - 3 + 9 + 27 = 32$ (local max). At $x = 3$: $f(3) = 0$ (local min, also x-intercept).',
      'Step 4: Inflection point — $f\'\'(x) = 6x - 6 = 0 \\Rightarrow x = 1$. $f(1) = 1 - 3 - 9 + 27 = 16$. Inflection at $(1; 16)$.',
      'Step 5: Sketch — $a > 0$, falls left, rises right. Mark $(-3; 0)$, $(-1; 32)$, $(1; 16)$, $(3; 0)$, $(0; 27)$.',
    ],
    explanation:
      'The double root at $x = 3$ means the curve touches the x-axis without crossing it at that point — it is also the local minimum.',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(7),
    type: 'text',
    order: 7,
    content:
      '## Summary of Sketch Procedure\n\nFor any cubic $f(x) = ax^3 + bx^2 + cx + d$, always determine:\n\n1. **y-intercept:** Set $x = 0$.\n2. **x-intercepts:** Use Factor Theorem + factorisation.\n3. **Turning points:** Solve $f\'(x) = 0$, find coordinates, classify using $f\'\'(x)$.\n4. **Point of inflection:** Solve $f\'\'(x) = 0$, find coordinates.\n5. **End behaviour:** Determined by sign of $a$.\n\n**Exam tip:** Always show all five pieces of information. Missing even one costs marks in the NSC.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(8),
    type: 'quiz',
    order: 8,
    content:
      'The function $f(x) = -2x^3 + 5x^2 + x - 6$ has a leading coefficient of $-2$. What does this tell you about the end behaviour of the graph?',
    points: 2,
    hints: [
      'Think about what happens to $f(x)$ as $x \\to +\\infty$ when $a < 0$.',
    ],
    explanation:
      'Since $a = -2 < 0$, the cubic rises to $+\\infty$ on the left (as $x \\to -\\infty$) and falls to $-\\infty$ on the right (as $x \\to +\\infty$). This is the opposite shape to a positive cubic.',
    metadata: {
      questionType: 'mcq',
      correctAnswer: 'The graph rises to the left and falls to the right',
      options: [
        'The graph rises to the left and falls to the right',
        'The graph falls to the left and rises to the right',
        'The graph has a maximum turning point only',
        'The graph has no turning points',
      ],
    },
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(9),
    type: 'quiz',
    order: 9,
    content:
      'Given $f(x) = x^3 - 6x^2 + 9x + 2$, determine $f\'(x)$ and find the x-values of the turning points.',
    points: 3,
    hints: [
      'Differentiate term by term: $f\'(x) = 3x^2 - 12x + 9$.',
      'Set $f\'(x) = 0$ and solve: $3(x^2 - 4x + 3) = 0$.',
    ],
    explanation:
      '$f\'(x) = 3x^2 - 12x + 9 = 3(x-1)(x-3) = 0$. Turning points occur at $x = 1$ and $x = 3$.',
    metadata: {
      questionType: 'mcq',
      correctAnswer: '$x = 1$ and $x = 3$',
      options: [
        '$x = 1$ and $x = 3$',
        '$x = 2$ and $x = 4$',
        '$x = -1$ and $x = -3$',
        '$x = 0$ and $x = 6$',
      ],
    },
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(10),
    type: 'fill_blank',
    order: 10,
    content:
      'Complete the following: For the cubic $f(x) = 2x^3 - 3x^2 - 12x + 4$, the second derivative is $f\'\'(x) = $ ___. Setting this equal to zero gives $x = $ ___, which is the x-coordinate of the point of ___.',
    points: 3,
    hints: [
      'Differentiate $f\'(x) = 6x^2 - 6x - 12$ once more.',
      '$f\'\'(x) = 12x - 6$. Set equal to zero: $12x = 6$.',
    ],
    explanation:
      '$f\'\'(x) = 12x - 6$. Setting $12x - 6 = 0$ gives $x = \\frac{1}{2}$. This is the point of inflection.',
    metadata: {
      blanks: ['$12x - 6$', '$\\frac{1}{2}$', 'inflection'],
    },
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(11),
    type: 'text',
    order: 11,
    content:
      '## NSC Exam-Style Question\n\nGiven: $g(x) = x^3 + x^2 - 8x - 12$\n\n**(a)** Show that $x = -2$ is a root of $g$. *(1)*\n**(b)** Hence, fully factorise $g(x)$. *(3)*\n**(c)** Determine the coordinates of the turning points of $g$. *(4)*\n**(d)** Determine the point of inflection of $g$. *(3)*\n**(e)** Sketch $g$, showing all intercepts, turning points, and the point of inflection. *(4)*\n\n**[15 marks]**\n\n**Memorandum:**\n- (a) $g(-2) = -8 + 4 + 16 - 12 = 0$ ✓\n- (b) $g(x) = (x+2)^2(x-3)$\n- (c) $g\'(x) = 3x^2 + 2x - 8 = (3x - 4)(x + 2) = 0 \\Rightarrow x = \\frac{4}{3}$ or $x = -2$. Points: $\\left(\\frac{4}{3};\\, -\\frac{500}{27}\\right)$ and $(-2;\\, 0)$\n- (d) $g\'\'(x) = 6x + 2 = 0 \\Rightarrow x = -\\frac{1}{3}$; $g\\!\\left(-\\frac{1}{3}\\right) = -\\frac{250}{27}$\n- (e) Correct sketch with all features labelled',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(12),
    type: 'text',
    order: 12,
    content:
      '## Common Mistakes to Avoid\n\n- **Forgetting the y-intercept:** Always substitute $x = 0$ explicitly.\n- **Not classifying turning points:** State whether each is a local max or local min using $f\'\'(x)$.\n- **Confusing inflection point with turning point:** At a turning point $f\'(x) = 0$; at an inflection point $f\'\'(x) = 0$. A turning point is NOT an inflection point unless $f\'(x) = f\'\'(x) = 0$ simultaneously.\n- **Double root confusion:** A double root means the curve *touches* but does not *cross* the x-axis at that point.\n- **Sketching without scale:** Always label coordinates of all key points — marks are awarded for coordinates, not just the shape.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
];

// ─── Lesson 8: Proportionality and Similarity Theorems ───────────────────────

const lesson8Blocks = [
  {
    blockId: bid(1),
    type: 'text',
    order: 1,
    content:
      '## Proportionality and Similarity in Triangles\n\nThis lesson covers two foundational theorems of Euclidean Geometry and their applications in NSC proofs and calculations.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(2),
    type: 'text',
    order: 2,
    content:
      '## The Proportion Theorem (Basic Proportionality Theorem)\n\n**Theorem:** If a line is drawn parallel to one side of a triangle, it divides the other two sides proportionally.\n\n**If** $DE \\parallel BC$ in $\\triangle ABC$, **then:**\n$$\\frac{AD}{DB} = \\frac{AE}{EC}$$\n\nEquivalently: $\\frac{AD}{AB} = \\frac{AE}{AC}$\n\n**Converse:** If a line divides two sides of a triangle in the same ratio, then that line is parallel to the third side.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(3),
    type: 'text',
    order: 3,
    content:
      '## The Midpoint Theorem (Special Case)\n\n**Theorem:** The line segment joining the midpoints of two sides of a triangle is parallel to the third side and equal to half its length.\n\n**If** $M$ is the midpoint of $AB$ and $N$ is the midpoint of $AC$ in $\\triangle ABC$, **then:**\n$$MN \\parallel BC \\quad \\text{and} \\quad MN = \\tfrac{1}{2}BC$$\n\nThis is simply the Proportion Theorem applied when $AD = DB$ (i.e., the ratio is $1:1$).',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(4),
    type: 'text',
    order: 4,
    content:
      '## Similar Triangles — Equiangular (AA Criterion)\n\n**Definition:** Two triangles are **similar** ($\\triangle ABC \\lll \\triangle DEF$) if their corresponding angles are equal and their corresponding sides are in proportion.\n\n**AA Criterion:** If two angles of one triangle are equal to two angles of another triangle, then the triangles are similar (the third angles are automatically equal, since angles in a triangle sum to $180°$).\n\n$$\\hat{A} = \\hat{D} \\text{ and } \\hat{B} = \\hat{E} \\Rightarrow \\triangle ABC \\lll \\triangle DEF$$\n\nOnce similarity is established:\n$$\\frac{AB}{DE} = \\frac{BC}{EF} = \\frac{AC}{DF}$$',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(5),
    type: 'text',
    order: 5,
    content:
      '## Similar Triangles — SSS (Sides in Proportion)\n\n**SSS Similarity Criterion:** If the corresponding sides of two triangles are proportional, then the triangles are similar.\n\n$$\\frac{AB}{DE} = \\frac{BC}{EF} = \\frac{AC}{DF} \\Rightarrow \\triangle ABC \\lll \\triangle DEF$$\n\n**SAS Similarity:** If two pairs of corresponding sides are proportional and the included angles are equal, the triangles are similar.\n\n**Note for NSC:** In proofs, always state the reason in brackets, e.g. **(equiangular $\\triangle$s)** or **(sides of $\\triangle$s in proportion)**.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(6),
    type: 'text',
    order: 6,
    content:
      '## Pythagorean Theorem Proved by Similar Triangles\n\nIn right-angled $\\triangle ABC$ with $\\hat{B} = 90°$, draw $BD \\perp AC$.\n\nThis creates **three similar triangles:**\n$$\\triangle ABC \\lll \\triangle ABD \\lll \\triangle BDC$$\n\nUsing the similarity ratios:\n- From $\\triangle ABD \\lll \\triangle ABC$: $AB^2 = AD \\cdot AC$\n- From $\\triangle BDC \\lll \\triangle ABC$: $BC^2 = DC \\cdot AC$\n\nAdding: $AB^2 + BC^2 = AD \\cdot AC + DC \\cdot AC = AC(AD + DC) = AC^2$\n\nTherefore $AC^2 = AB^2 + BC^2$ ✓',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(7),
    type: 'step_reveal',
    order: 7,
    content:
      '## Worked Proof — NSC Style\n\nIn $\\triangle PQR$, $S$ is on $PQ$ and $T$ is on $PR$ such that $ST \\parallel QR$. Prove that $\\frac{PS}{SQ} = \\frac{PT}{TR}$.',
    points: 0,
    hints: [
      'Step 1: Construct the proof structure. Draw $QT$ and $SR$. Note that $\\triangle QST$ and $\\triangle RST$ share the same base $ST$.',
      'Step 2: Areas with same base. $\\text{Area}(\\triangle PST) / \\text{Area}(\\triangle QST) = PS/SQ$ (same height from $T$ to $PQ$).',
      'Step 3: Parallel lines. Since $ST \\parallel QR$, $\\triangle QST$ and $\\triangle RST$ have equal areas (same base $ST$, equal heights from $Q$ and $R$ to $ST$).',
      'Step 4: Combine. $\\frac{PS}{SQ} = \\frac{\\text{Area}(\\triangle PST)}{\\text{Area}(\\triangle QST)} = \\frac{\\text{Area}(\\triangle PST)}{\\text{Area}(\\triangle RST)} = \\frac{PT}{TR}$ ✓',
    ],
    explanation:
      'This is the standard NSC proof of the Proportion Theorem. Learners must be able to reproduce this proof in full under examination conditions.',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(8),
    type: 'quiz',
    order: 8,
    content:
      'In $\\triangle ABC$, $DE \\parallel BC$ where $D$ is on $AB$ and $E$ is on $AC$. If $AD = 4$ cm, $DB = 6$ cm, and $AE = 8$ cm, find $EC$.',
    points: 3,
    hints: [
      'Use the Proportion Theorem: $\\frac{AD}{DB} = \\frac{AE}{EC}$.',
      'Substitute: $\\frac{4}{6} = \\frac{8}{EC}$.',
    ],
    explanation:
      '$\\frac{AD}{DB} = \\frac{AE}{EC} \\Rightarrow \\frac{4}{6} = \\frac{8}{EC} \\Rightarrow EC = \\frac{8 \\times 6}{4} = 12$ cm.',
    metadata: {
      questionType: 'mcq',
      correctAnswer: '12 cm',
      options: ['12 cm', '6 cm', '10 cm', '16 cm'],
    },
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(9),
    type: 'quiz',
    order: 9,
    content:
      'Which condition is sufficient to conclude that $\\triangle PQR \\lll \\triangle XYZ$?',
    points: 2,
    hints: ['Think about the minimum information needed to establish similarity.'],
    explanation:
      'Two equal angles (AA) guarantee similarity because the third angle is automatically equal (angle sum = 180°). Equal sides or only one pair of equal angles is not sufficient.',
    metadata: {
      questionType: 'mcq',
      correctAnswer: '$\\hat{P} = \\hat{X}$ and $\\hat{Q} = \\hat{Y}$',
      options: [
        '$\\hat{P} = \\hat{X}$ and $\\hat{Q} = \\hat{Y}$',
        '$PQ = XY$ only',
        '$\\hat{P} = \\hat{X}$ only',
        '$PQ = XY$ and $QR = YZ$ only',
      ],
    },
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(10),
    type: 'fill_blank',
    order: 10,
    content:
      'The Midpoint Theorem states that the line joining the midpoints of two sides of a triangle is ___ to the third side and equal to ___ of its length.',
    points: 2,
    hints: ['Recall that the midpoint divides sides in a ratio of 1:1.'],
    explanation:
      'By the Proportion Theorem with ratio $1:1$, the connecting line is parallel to the third side and exactly half its length.',
    metadata: {
      blanks: ['parallel', 'half ($\\frac{1}{2}$)'],
    },
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(11),
    type: 'text',
    order: 11,
    content:
      '## NSC Exam-Style Question\n\nIn the diagram, $\\triangle ABC$ with $D$ on $AB$ and $E$ on $AC$ such that $DE \\parallel BC$. Also, $BE$ and $CD$ intersect at $F$.\n\n**(a)** Prove that $\\triangle ADE \\lll \\triangle ABC$. *(3)*\n**(b)** Hence show that $\\frac{AD}{AB} = \\frac{AE}{AC}$. *(2)*\n**(c)** If $AD = 3$, $DB = 5$, and $BC = 16$ cm, calculate $DE$. *(3)*\n**(d)** Prove that $\\triangle DFB \\lll \\triangle EFC$. *(4)*\n\n**[12 marks]**\n\n**Memorandum:** (a) $\\hat{A}$ common; $\\hat{ADE} = \\hat{B}$ (corr. $\\angle$s, $DE \\parallel BC$); equiangular $\\Rightarrow$ similar. (b) Follows directly from ratio of similar triangles. (c) $\\frac{AD}{AB} = \\frac{DE}{BC} \\Rightarrow \\frac{3}{8} = \\frac{DE}{16} \\Rightarrow DE = 6$ cm. (d) $\\hat{DBF} = \\hat{ECF}$ (alt. $\\angle$s); $\\hat{BDF} = \\hat{CEF}$ (alt. $\\angle$s).',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(12),
    type: 'text',
    order: 12,
    content:
      '## Key Proof-Writing Tips for NSC\n\n- Always state **what** is equal and **why** (reason in brackets).\n- Use the notation $\\lll$ for similarity and $\\equiv$ for congruence — do not confuse them.\n- When proving similarity, clearly identify the **correspondence** of vertices: $\\triangle PQR \\lll \\triangle XYZ$ means $P \\leftrightarrow X$, $Q \\leftrightarrow Y$, $R \\leftrightarrow Z$.\n- After establishing similarity, write out the **proportion of sides** immediately — this is often where marks are earned in follow-up parts.\n- In the Proportion Theorem proof, the area method is the approved NSC approach.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
];

// ─── Lesson 9: Logarithms for Time Period ─────────────────────────────────────

const lesson9Blocks = [
  {
    blockId: bid(1),
    type: 'text',
    order: 1,
    content:
      '## Using Logarithms to Solve for the Time Period $n$\n\nIn finance, we frequently need to find **how long** it takes for an investment or debt to reach a target value. The compound interest formula is:\n\n$$A = P(1 + i)^n$$\n\nWhen $A$, $P$, and $i$ are all known, we solve for $n$ using **logarithms**.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(2),
    type: 'text',
    order: 2,
    content:
      '## Deriving the Formula for $n$\n\nStarting from $A = P(1 + i)^n$:\n\n$$\\frac{A}{P} = (1 + i)^n$$\n\nTaking $\\log$ of both sides:\n\n$$\\log\\left(\\frac{A}{P}\\right) = n \\cdot \\log(1 + i)$$\n\nDividing both sides by $\\log(1 + i)$:\n\n$$\\boxed{n = \\frac{\\log\\left(\\dfrac{A}{P}\\right)}{\\log(1 + i)}}$$\n\n**Note:** You may use $\\log$ (base 10) or $\\ln$ (natural log) — the ratio is the same either way.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(3),
    type: 'text',
    order: 3,
    content:
      '## Application 1: Doubling Your Investment\n\n**Question:** How long does it take for an investment of R15 000 to double at 9% p.a. compound interest?\n\n**Given:** $P = 15\\,000$, $A = 30\\,000$, $i = 0{,}09$\n\n$$n = \\frac{\\log\\left(\\frac{30\\,000}{15\\,000}\\right)}{\\log(1{,}09)} = \\frac{\\log 2}{\\log 1{,}09}$$\n\n$$n = \\frac{0{,}30103}{0{,}03743} \\approx 8{,}04 \\text{ years}$$\n\n**Answer:** It takes approximately **8 years** for the investment to double.\n\n**Rule of 72 (mental check):** $72 \\div 9 = 8$ years ✓',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(4),
    type: 'text',
    order: 4,
    content:
      '## Application 2: Depreciation to Half Value\n\nAssets such as vehicles depreciate using the **reducing balance** formula:\n\n$$A = P(1 - i)^n$$\n\n**Question:** A car worth R220 000 depreciates at 15% p.a. on the reducing balance. How many years until it is worth R110 000?\n\n**Given:** $P = 220\\,000$, $A = 110\\,000$, $i = 0{,}15$\n\n$$n = \\frac{\\log\\left(\\frac{110\\,000}{220\\,000}\\right)}{\\log(1 - 0{,}15)} = \\frac{\\log 0{,}5}{\\log 0{,}85}$$\n\n$$n = \\frac{-0{,}30103}{-0{,}07058} \\approx 4{,}27 \\text{ years}$$\n\n**Answer:** The car will be worth half its original value after approximately **4,3 years**.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(5),
    type: 'text',
    order: 5,
    content:
      '## Comparing Different Interest Rates\n\n**Question:** An investor wants R50 000 to grow to R80 000. Compare how long this takes at:\n- (a) 8% p.a. compound interest\n- (b) 12% p.a. compound interest\n\n**(a)** $n = \\dfrac{\\log(80\\,000/50\\,000)}{\\log(1{,}08)} = \\dfrac{\\log 1{,}6}{\\log 1{,}08} = \\dfrac{0{,}2041}{0{,}03342} \\approx 6{,}1$ years\n\n**(b)** $n = \\dfrac{\\log 1{,}6}{\\log 1{,}12} = \\dfrac{0{,}2041}{0{,}04922} \\approx 4{,}1$ years\n\n**Conclusion:** The higher rate saves approximately 2 years — a significant difference over the investment horizon.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(6),
    type: 'step_reveal',
    order: 6,
    content:
      '## Worked Example — Full NSC Solution\n\nR12 500 is invested at 10,5% p.a. compounded monthly. After how many **months** will the investment exceed R20 000?',
    points: 0,
    hints: [
      'Step 1: Identify values. $P = 12\\,500$, $A = 20\\,000$, $i = 0{,}105/12$ (monthly rate).',
      'Step 2: Apply formula. $20\\,000 = 12\\,500\\left(1 + \\frac{0{,}105}{12}\\right)^n$.',
      'Step 3: Isolate the power. $\\frac{20\\,000}{12\\,500} = (1{,}00875)^n \\Rightarrow 1{,}6 = (1{,}00875)^n$.',
      'Step 4: Take logarithms. $n = \\dfrac{\\log 1{,}6}{\\log 1{,}00875} = \\dfrac{0{,}2041}{0{,}003788} \\approx 53{,}9$.',
      'Step 5: Interpret. Since $n$ must be a whole number of months, $n = 54$ months (the investment exceeds R20 000 after 54 months).',
    ],
    explanation:
      'Always round $n$ **up** when the question asks "after how many periods will it exceed". Rounding down would leave the amount below the target.',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(7),
    type: 'quiz',
    order: 7,
    content:
      'R8 000 is invested at 7% p.a. compounded annually. Which expression correctly gives the number of years for the investment to reach R15 000?',
    points: 2,
    hints: ['Apply $n = \\log(A/P) / \\log(1+i)$.'],
    explanation:
      '$n = \\dfrac{\\log(15\\,000 / 8\\,000)}{\\log(1{,}07)} = \\dfrac{\\log 1{,}875}{\\log 1{,}07}$',
    metadata: {
      questionType: 'mcq',
      correctAnswer: '$n = \\dfrac{\\log 1{,}875}{\\log 1{,}07}$',
      options: [
        '$n = \\dfrac{\\log 1{,}875}{\\log 1{,}07}$',
        '$n = \\dfrac{\\log 1{,}07}{\\log 1{,}875}$',
        '$n = \\dfrac{\\log 15\\,000}{\\log 8\\,000}$',
        '$n = 15\\,000 \\div (8\\,000 \\times 0{,}07)$',
      ],
    },
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(8),
    type: 'quiz',
    order: 8,
    content:
      'A vehicle valued at R350 000 depreciates at 18% p.a. on the reducing balance. Approximately how many years will it take for the vehicle to be worth less than R100 000?',
    points: 3,
    hints: [
      'Use $n = \\log(A/P) / \\log(1 - i)$ with $A/P = 100\\,000/350\\,000$.',
      '$\\log(2/7) / \\log(0{,}82) \\approx ?$',
    ],
    explanation:
      '$n = \\dfrac{\\log(100\\,000/350\\,000)}{\\log(0{,}82)} = \\dfrac{\\log(2/7)}{\\log 0{,}82} = \\dfrac{-0{,}5441}{-0{,}08636} \\approx 6{,}3$ years, so after approximately **7 years**.',
    metadata: {
      questionType: 'mcq',
      correctAnswer: 'Approximately 7 years',
      options: [
        'Approximately 7 years',
        'Approximately 4 years',
        'Approximately 10 years',
        'Approximately 12 years',
      ],
    },
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(9),
    type: 'fill_blank',
    order: 9,
    content:
      'To solve $A = P(1 + i)^n$ for $n$, we first divide both sides by $P$ to get $A/P = (1+i)^n$, then take the ___ of both sides, giving $n = \\log(A/P)$ divided by ___.',
    points: 2,
    hints: ['What operation undoes an exponent?'],
    explanation:
      'Taking logarithms of both sides allows us to bring $n$ out of the exponent. The denominator is $\\log(1 + i)$.',
    metadata: {
      blanks: ['logarithm ($\\log$)', '$\\log(1 + i)$'],
    },
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(10),
    type: 'fill_blank',
    order: 10,
    content:
      'Complete: An investment of R5 000 at 6% p.a. compounded annually. To find when it reaches R8 000, substitute into the formula: $n = \\log($___$) \\div \\log($___$)$. This gives $n \\approx$ ___ years.',
    points: 3,
    hints: ['$A/P = 8\\,000/5\\,000 = 1{,}6$ and $1 + i = 1{,}06$.'],
    explanation:
      '$n = \\log(1{,}6) / \\log(1{,}06) = 0{,}2041 / 0{,}02531 \\approx 8{,}07$ years.',
    metadata: {
      blanks: ['$1{,}6$', '$1{,}06$', '$8{,}1$'],
    },
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(11),
    type: 'text',
    order: 11,
    content:
      '## NSC Exam-Style Question\n\n**(a)** Nandi invests R25 000 at 11% p.a. compounded quarterly. After how many **years** will her investment be worth R50 000? *(4)*\n\n**(b)** A piece of machinery depreciates at 12% p.a. on the reducing balance. If the machinery was purchased for R480 000, after how many years will it have a scrap value of R80 000? *(4)*\n\n**(c)** An investor compares two options:\n- Option A: 9% p.a. compounded annually\n- Option B: 8,5% p.a. compounded monthly\n\nIf he invests R20 000, determine using calculations which option grows to R35 000 faster. *(5)*\n\n**[13 marks]**\n\n**Hints:** (a) Use quarterly rate $i = 0{,}11/4$, then convert quarters to years. (b) Use depreciation formula. (c) Calculate $n$ for each option and compare.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
];

// ─── Lesson 10: Probability Rules (Revision) ─────────────────────────────────

const lesson10Blocks = [
  {
    blockId: bid(1),
    type: 'text',
    order: 1,
    content:
      '## Probability Rules — Comprehensive Revision\n\nProbability is the measure of the likelihood of an event occurring. It is always a value between 0 and 1:\n\n$$0 \\leq P(A) \\leq 1$$\n\nThis lesson revises all rules required for NSC Mathematics Grade 12.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(2),
    type: 'text',
    order: 2,
    content:
      '## The Addition Rule\n\nFor **any two events** $A$ and $B$:\n\n$$P(A \\text{ or } B) = P(A) + P(B) - P(A \\text{ and } B)$$\n\n**Why subtract $P(A \\text{ and } B)$?** Elements in the intersection are counted twice (once in $P(A)$ and once in $P(B)$), so we subtract once to correct this.\n\n**Example:** In a class, $P(\\text{sport}) = 0{,}6$, $P(\\text{art}) = 0{,}4$, $P(\\text{both}) = 0{,}25$.\n$$P(\\text{sport or art}) = 0{,}6 + 0{,}4 - 0{,}25 = 0{,}75$$',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(3),
    type: 'text',
    order: 3,
    content:
      '## Mutually Exclusive Events\n\nEvents $A$ and $B$ are **mutually exclusive** if they cannot occur simultaneously:\n\n$$P(A \\text{ and } B) = 0$$\n\nFor mutually exclusive events, the addition rule simplifies to:\n$$P(A \\text{ or } B) = P(A) + P(B)$$\n\n**Example:** Rolling a 3 and rolling a 5 on a single die are mutually exclusive.\n\n**Common mistake:** Do not assume events are mutually exclusive without justification. Always check if $P(A \\text{ and } B) = 0$.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(4),
    type: 'text',
    order: 4,
    content:
      '## The Complementary Rule\n\nThe complement of event $A$ (written $A\'$ or $\\bar{A}$) contains all outcomes **not** in $A$:\n\n$$P(A\') = 1 - P(A) \\quad \\text{or equivalently} \\quad P(A) + P(A\') = 1$$\n\n**Example:** If $P(\\text{rain}) = 0{,}35$, then $P(\\text{no rain}) = 1 - 0{,}35 = 0{,}65$.\n\n**Useful technique:** When a question asks for "at least one", use the complement: $P(\\text{at least one}) = 1 - P(\\text{none})$.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(5),
    type: 'text',
    order: 5,
    content:
      '## Independent Events\n\nEvents $A$ and $B$ are **independent** if the occurrence of one does not affect the probability of the other:\n\n$$P(A \\text{ and } B) = P(A) \\times P(B)$$\n\n**Example:** Tossing a coin and rolling a die are independent.\n$$P(\\text{heads and 6}) = P(\\text{heads}) \\times P(\\text{6}) = \\tfrac{1}{2} \\times \\tfrac{1}{6} = \\tfrac{1}{12}$$\n\n**Testing for independence:** If $P(A \\text{ and } B) = P(A) \\times P(B)$, then $A$ and $B$ are independent.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(6),
    type: 'text',
    order: 6,
    content:
      '## Dependent Events and Conditional Probability\n\nWhen events are **dependent**, the occurrence of one affects the probability of the other. This is expressed using **conditional probability**:\n\n$$P(B | A) = \\frac{P(A \\text{ and } B)}{P(A)}$$\n\nRead as: "the probability of $B$ given that $A$ has occurred".\n\n**Example:** A bag contains 5 red and 3 blue balls. Drawing without replacement:\n$$P(\\text{2nd blue} | \\text{1st blue}) = \\frac{2}{7} \\neq P(\\text{blue}) = \\frac{3}{8}$$\n\nThese events are **dependent**.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(7),
    type: 'text',
    order: 7,
    content:
      '## Venn Diagrams — Two and Three Events\n\nVenn diagrams display the relationships between events visually.\n\n**Two events:** Draw two overlapping circles inside a rectangle (the sample space $\\mathcal{S}$). Fill in numbers in the intersection first, then work outward.\n\n**Three events:** Three overlapping circles create 7 distinct regions plus the region outside all circles. Always fill in the **innermost region** ($A \\cap B \\cap C$) first, then work outward.\n\n**Key identity for three events:**\n$$P(A \\cup B \\cup C) = P(A) + P(B) + P(C) - P(A \\cap B) - P(A \\cap C) - P(B \\cap C) + P(A \\cap B \\cap C)$$',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(8),
    type: 'text',
    order: 8,
    content:
      '## Tree Diagrams\n\nTree diagrams show all possible outcomes of a multi-stage experiment. Each branch represents one outcome.\n\n**Rules:**\n- Multiply probabilities **along branches** (and-rule).\n- Add probabilities **across branches** (or-rule) for the same outcome.\n- All branches from a single point must sum to 1.\n\n**Example:** A learner takes a test on Monday and Tuesday. $P(\\text{pass Mon}) = 0{,}7$. If she passes Monday, $P(\\text{pass Tue}) = 0{,}8$; if she fails Monday, $P(\\text{pass Tue}) = 0{,}5$.\n\n$P(\\text{passes both}) = 0{,}7 \\times 0{,}8 = 0{,}56$\n$P(\\text{passes at least one}) = 1 - P(\\text{fails both}) = 1 - (0{,}3 \\times 0{,}5) = 0{,}85$',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(9),
    type: 'quiz',
    order: 9,
    content:
      'Events $A$ and $B$ are such that $P(A) = 0{,}5$, $P(B) = 0{,}4$, and $P(A \\text{ and } B) = 0{,}2$. Are $A$ and $B$ independent?',
    points: 2,
    hints: ['Check: is $P(A) \\times P(B) = P(A \\text{ and } B)$?'],
    explanation:
      '$P(A) \\times P(B) = 0{,}5 \\times 0{,}4 = 0{,}2 = P(A \\text{ and } B)$. Yes, $A$ and $B$ are independent.',
    metadata: {
      questionType: 'mcq',
      correctAnswer: 'Yes, because $P(A) \\times P(B) = P(A \\text{ and } B) = 0{,}2$',
      options: [
        'Yes, because $P(A) \\times P(B) = P(A \\text{ and } B) = 0{,}2$',
        'No, because $P(A) + P(B) \\neq 1$',
        'Yes, because $P(A \\text{ or } B) = 0{,}7$',
        'No, because $P(A \\text{ and } B) \\neq 0$',
      ],
    },
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(10),
    type: 'quiz',
    order: 10,
    content:
      'In a group of 40 learners: 25 play soccer, 18 play cricket, and 7 play both. Using the addition rule, how many learners play soccer or cricket?',
    points: 2,
    hints: ['$n(S \\cup C) = n(S) + n(C) - n(S \\cap C)$'],
    explanation:
      '$n(S \\cup C) = 25 + 18 - 7 = 36$. So 36 learners play soccer or cricket (or both).',
    metadata: {
      questionType: 'mcq',
      correctAnswer: '36',
      options: ['36', '43', '32', '11'],
    },
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(11),
    type: 'fill_blank',
    order: 11,
    content:
      'Complete the rules: (1) For mutually exclusive events: $P(A \\text{ or } B) = P(A)$ ___ $P(B)$. (2) For independent events: $P(A \\text{ and } B) = P(A)$ ___ $P(B)$. (3) Complementary rule: $P(A\') = $ ___.',
    points: 3,
    hints: ['Mutually exclusive → no overlap. Independent → multiply.'],
    explanation:
      '(1) $P(A \\text{ or } B) = P(A) + P(B)$ (no intersection to subtract). (2) $P(A \\text{ and } B) = P(A) \\times P(B)$. (3) $P(A\') = 1 - P(A)$.',
    metadata: {
      blanks: ['$+$', '$\\times$', '$1 - P(A)$'],
    },
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
];

// ─── Lesson 11: Advanced Probability Problems ────────────────────────────────

const lesson11Blocks = [
  {
    blockId: bid(1),
    type: 'text',
    order: 1,
    content:
      '## Advanced Probability — Counting Principles\n\nThis lesson extends probability to problems involving **counting** the number of possible outcomes. The fundamental question is always:\n\n$$P(\\text{event}) = \\frac{\\text{number of favourable outcomes}}{\\text{total number of possible outcomes}}$$\n\nTo count efficiently, we use the **Fundamental Counting Principle** and related techniques.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(2),
    type: 'text',
    order: 2,
    content:
      '## The Fundamental Counting Principle\n\nIf a task consists of $k$ stages, where stage 1 can be done in $n_1$ ways, stage 2 in $n_2$ ways, ..., stage $k$ in $n_k$ ways, then the **total number of ways** to complete the task is:\n\n$$n_1 \\times n_2 \\times n_3 \\times \\cdots \\times n_k$$\n\n**Example:** A learner can choose 1 of 4 subjects, 1 of 3 sports, and 1 of 2 cultural activities.\n$$\\text{Total choices} = 4 \\times 3 \\times 2 = 24$$',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(3),
    type: 'text',
    order: 3,
    content:
      '## Factorial Notation\n\nFor a positive integer $n$, the **factorial** is:\n\n$$n! = n \\times (n-1) \\times (n-2) \\times \\cdots \\times 2 \\times 1$$\n\n**Examples:**\n- $3! = 3 \\times 2 \\times 1 = 6$\n- $5! = 5 \\times 4 \\times 3 \\times 2 \\times 1 = 120$\n- $0! = 1$ (by definition)\n\n**Shortcut:** $n! = n \\times (n-1)!$\n\nFactorials count the number of ways to arrange $n$ distinct objects in a row.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(4),
    type: 'text',
    order: 4,
    content:
      '## Permutations — Arrangements Where Order Matters\n\nA **permutation** is an arrangement of objects where the **order matters**.\n\nThe number of ways to arrange $n$ distinct objects in a row is $n!$.\n\n**With restrictions:** Use the Fundamental Counting Principle, fixing restricted positions first.\n\n**Example:** How many 4-digit codes can be formed from the digits 1–9 if no digit is repeated?\n\n$$9 \\times 8 \\times 7 \\times 6 = 3\\,024$$\n\n**Example with restriction:** How many arrangements of CAMPUSLY have C first?\n\nFix C in position 1: remaining 7 letters → $7! = 5\\,040$ arrangements.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(5),
    type: 'text',
    order: 5,
    content:
      '## Probability with Counting\n\nOnce you can count both the favourable outcomes and the total outcomes, probability follows directly:\n\n$$P(\\text{event}) = \\frac{\\text{favourable arrangements}}{\\text{total arrangements}}$$\n\n**Example:** 5 learners (Amara, Bongani, Cleo, Dion, Edna) sit in a row. What is the probability that Amara and Bongani sit next to each other?\n\n- **Total arrangements:** $5! = 120$\n- **Favourable:** Treat AB as one block → $4!$ arrangements × 2 (AB or BA) = $4! \\times 2 = 48$\n\n$$P = \\frac{48}{120} = \\frac{2}{5} = 0{,}4$$',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(6),
    type: 'text',
    order: 6,
    content:
      '## Two-Way Contingency Tables\n\nA **contingency table** (two-way table) organises data by two characteristics. It allows us to calculate probabilities directly.\n\n**Example:**\n\n| | Passed | Failed | Total |\n|---|---|---|---|\n| Female | 32 | 8 | 40 |\n| Male | 18 | 12 | 30 |\n| **Total** | **50** | **20** | **70** |\n\n- $P(\\text{passed}) = 50/70$\n- $P(\\text{female and passed}) = 32/70$\n- $P(\\text{passed} | \\text{female}) = 32/40 = 0{,}8$\n- **Test independence:** $P(\\text{passed}) \\times P(\\text{female}) = (50/70)(40/70) = 0{,}408 \\neq 32/70 = 0{,}457$, so not independent.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(7),
    type: 'step_reveal',
    order: 7,
    content:
      '## Worked Example — NSC Counting Problem\n\nThe letters of the word MATRIC are arranged in a row. Find:\n(a) The total number of arrangements.\n(b) The probability that the arrangement starts with M and ends with C.',
    points: 0,
    hints: [
      'Step 1: Total arrangements. MATRIC has 6 distinct letters → $6! = 720$.',
      'Step 2: Favourable for (b). Fix M in position 1 and C in position 6. The remaining 4 letters (A, T, R, I) can be arranged in $4! = 24$ ways.',
      'Step 3: Probability. $P = \\dfrac{24}{720} = \\dfrac{1}{30}$.',
    ],
    explanation:
      'Always identify whether letters are distinct before applying factorial. If letters repeat, divide by the factorial of each repeated group.',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(8),
    type: 'quiz',
    order: 8,
    content:
      'How many different 3-digit numbers greater than 500 can be formed using the digits 2, 4, 5, 7, 9 without repetition?',
    points: 3,
    hints: [
      'Numbers greater than 500: first digit must be 5, 7, or 9 (3 choices).',
      'After choosing the first digit: 4 remaining choices for the second, then 3 for the third.',
    ],
    explanation:
      'First digit: 3 choices (5, 7, or 9). Second digit: 4 choices (any remaining). Third digit: 3 choices. Total: $3 \\times 4 \\times 3 = 36$.',
    metadata: {
      questionType: 'mcq',
      correctAnswer: '36',
      options: ['36', '24', '60', '18'],
    },
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(9),
    type: 'quiz',
    order: 9,
    content:
      'The letters of SCHOOL are arranged randomly. What is the probability that the two O\'s are together?',
    points: 3,
    hints: [
      'SCHOOL has 6 letters with O repeated twice.',
      'Total arrangements: $6!/2! = 360$.',
      'Treat OO as one block: 5 entities → $5! = 120$ arrangements.',
    ],
    explanation:
      'Total distinct arrangements: $6!/2! = 360$. Treat both O\'s as one block: $5! = 120$. Probability $= 120/360 = 1/3$.',
    metadata: {
      questionType: 'mcq',
      correctAnswer: '$\\dfrac{1}{3}$',
      options: [
        '$\\dfrac{1}{3}$',
        '$\\dfrac{1}{6}$',
        '$\\dfrac{1}{15}$',
        '$\\dfrac{2}{5}$',
      ],
    },
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(10),
    type: 'fill_blank',
    order: 10,
    content:
      'The Fundamental Counting Principle states that if stage 1 can be done in $n_1$ ways and stage 2 in $n_2$ ways, the total number of ways is $n_1$ ___ $n_2$. The number of ways to arrange 7 distinct objects in a row is ___. By definition, $0! = $ ___.',
    points: 3,
    hints: ['Multiply across stages. 7 objects → 7 factorial.'],
    explanation:
      'Stages are multiplied: $n_1 \\times n_2$. Seven distinct objects: $7! = 5040$. Zero factorial equals 1 by convention.',
    metadata: {
      blanks: ['$\\times$ (multiplied by)', '$7! = 5040$', '$1$'],
    },
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(11),
    type: 'text',
    order: 11,
    content:
      '## NSC Exam-Style Question\n\nA school committee of 3 learners must be chosen from a group of 5 girls and 4 boys.\n\n**(a)** In how many ways can the committee be formed if there are no restrictions? *(2)*\n**(b)** In how many ways can the committee be formed if it must include at least 1 girl? *(3)*\n**(c)** The 9 learners line up for a photo. What is the probability that all 4 boys stand together? *(4)*\n\n**[9 marks]**\n\n**Memorandum:**\n- (a) Choose 3 from 9: $\\dfrac{9!}{3! \\cdot 6!} = 84$\n- (b) Total $-$ all boys: $84 - \\dfrac{4!}{3! \\cdot 1!} = 84 - 4 = 80$\n- (c) Treat 4 boys as one block: $6!$ arrangements for the block, $4!$ for boys within the block. $P = \\dfrac{6! \\times 4!}{9!} = \\dfrac{720 \\times 24}{362\\,880} = \\dfrac{1}{21}$',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
  {
    blockId: bid(12),
    type: 'text',
    order: 12,
    content:
      '## Key Points to Remember for NSC\n\n- The Fundamental Counting Principle: **multiply** the number of choices at each stage.\n- When order matters → count arrangements (use factorials and the counting principle).\n- When letters or objects **repeat**, divide by the factorial of each repeated group.\n- For probability with arrangements: $P = \\text{favourable} / \\text{total}$.\n- Contingency tables: read values directly from the table — total is always in the bottom-right cell.\n- Always check: do the probabilities in each row of a tree diagram sum to 1?\n- **Exam tip:** Show all working for counting problems — method marks are awarded even if the final answer is wrong.',
    points: 0,
    hints: [],
    explanation: '',
    metadata: {},
    curriculumNodeId: null,
    cognitiveLevel: null,
  },
];

// ─── Lesson Definitions ───────────────────────────────────────────────────────

interface LessonDef {
  title: string;
  nodeId: string;
  term: number;
  blocks: typeof lesson7Blocks;
  tags: string[];
  estimatedMinutes: number;
}

const LESSONS: LessonDef[] = [
  {
    title: 'Cubic Function Sketching',
    nodeId: '69d0b97e7d29abc8f9c3b19e',
    term: 2,
    blocks: lesson7Blocks,
    tags: ['cubic functions', 'calculus', 'sketching', 'differentiation', 'turning points'],
    estimatedMinutes: 55,
  },
  {
    title: 'Proportionality and Similarity Theorems',
    nodeId: '69d0b97e7d29abc8f9c3b191',
    term: 2,
    blocks: lesson8Blocks,
    tags: ['proportion theorem', 'similarity', 'euclidean geometry', 'proofs', 'triangles'],
    estimatedMinutes: 60,
  },
  {
    title: 'Using Logarithms to Find the Time Period',
    nodeId: '69d0b97e7d29abc8f9c3b1a4',
    term: 3,
    blocks: lesson9Blocks,
    tags: ['logarithms', 'finance', 'compound interest', 'depreciation', 'time period'],
    estimatedMinutes: 45,
  },
  {
    title: 'Probability Rules — Revision',
    nodeId: '69d0b97e7d29abc8f9c3b1aa',
    term: 3,
    blocks: lesson10Blocks,
    tags: ['probability', 'addition rule', 'independent events', 'venn diagram', 'tree diagram'],
    estimatedMinutes: 50,
  },
  {
    title: 'Advanced Probability and Counting Principles',
    nodeId: '69d0b97e7d29abc8f9c3b1ac',
    term: 3,
    blocks: lesson11Blocks,
    tags: ['counting principle', 'factorial', 'permutations', 'contingency table', 'probability'],
    estimatedMinutes: 55,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Connected to MongoDB');

  let inserted = 0;
  let skipped = 0;

  for (const lesson of LESSONS) {
    const nodeId = new Types.ObjectId(lesson.nodeId);

    const existing = await ContentResource.findOne({
      curriculumNodeId: nodeId,
      type: 'lesson',
      isDeleted: false,
    });

    if (existing) {
      console.log(`SKIP: "${lesson.title}" (lesson already exists: ${existing._id})`);
      skipped++;
      continue;
    }

    const doc = await ContentResource.create({
      curriculumNodeId: nodeId,
      schoolId: SCHOOL_ID,
      gradeId: GRADE_ID,
      subjectId: SUBJECT_ID,
      type: 'lesson',
      format: 'interactive',
      status: 'approved',
      source: 'ai_generated',
      title: lesson.title,
      blocks: lesson.blocks,
      term: lesson.term,
      tags: lesson.tags,
      difficulty: 3,
      estimatedMinutes: lesson.estimatedMinutes,
      createdBy: CREATED_BY,
      isDeleted: false,
      prerequisites: [],
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: '',
      sourceAttribution: '',
      aiModel: '',
      aiPrompt: '',
      downloads: 0,
      rating: 0,
      ratingCount: 0,
    });

    console.log(
      `INSERTED: "${lesson.title}" — ${doc._id} (${lesson.blocks.length} blocks, term ${lesson.term})`,
    );
    inserted++;
  }

  console.log('\n========================================');
  console.log(`  Done! Inserted: ${inserted}  |  Skipped: ${skipped}`);
  console.log('========================================\n');

  await mongoose.disconnect();
}

main().catch((err: unknown) => {
  console.error('Fatal:', err instanceof Error ? err.message : err);
  process.exit(1);
});
