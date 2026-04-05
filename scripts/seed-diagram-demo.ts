/**
 * Seed script: Renders real TikZ diagrams through the Docker renderer
 * and creates sample math questions + a generated paper in the database.
 *
 * Usage: npx tsx scripts/seed-diagram-demo.ts
 * Requires: TikZ renderer running on localhost:3600, MongoDB running
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { writeFile, mkdir } from 'fs/promises';
import { createHash } from 'crypto';
import { join } from 'path';

// ─── Config ──────────────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusly';
const RENDERER_URL = process.env.TIKZ_RENDERER_URL || 'http://localhost:3600';
const UPLOAD_DIR = 'uploads/diagrams';

// ─── TikZ Diagram Definitions ────────────────────────────────────────────────

interface DiagramDef {
  name: string;
  tikz: string;
  alt: string;
  dataType: string;
}

const DIAGRAMS: DiagramDef[] = [
  {
    name: 'parabola-gr11',
    alt: 'Graph of f(x) = -(x-3)² + 4 showing a downward-opening parabola with turning point T at (3;4), x-intercepts at (1;0) and (5;0), and y-intercept at (0;-5).',
    dataType: 'cartesian_graph',
    tikz: `\\begin{tikzpicture}
\\begin{axis}[
  axis lines=middle, xlabel={$x$}, ylabel={$y$},
  xmin=-2, xmax=8, ymin=-8, ymax=6,
  grid=major, grid style={gray!30},
  width=12cm, height=9cm, samples=200,
  every axis x label/.style={at={(ticklabel* cs:1)}, anchor=west},
  every axis y label/.style={at={(ticklabel* cs:1)}, anchor=south},
]
  \\addplot[domain=-0.5:6.5, thick, blue] {-(x-3)^2 + 4};
  \\addplot[only marks, mark=*, mark size=2.5pt, blue]
    coordinates {(1,0)(5,0)(3,4)(0,-5)};
  \\node[above right, blue, font=\\small] at (axis cs:3,4) {$T(3;\\,4)$};
  \\node[below, blue, font=\\small] at (axis cs:1,-0.5) {$(1;\\,0)$};
  \\node[below, blue, font=\\small] at (axis cs:5,-0.5) {$(5;\\,0)$};
  \\node[left, blue, font=\\small] at (axis cs:-0.3,-5) {$(0;\\,-5)$};
  \\node[right, blue, font=\\small] at (axis cs:6.2,-4) {$f$};
\\end{axis}
\\end{tikzpicture}`,
  },
  {
    name: 'circle-theorem-gr11',
    alt: 'Circle with centre O, chord AB = 24 cm, perpendicular OC = 5 cm from centre to chord. Right angle marked at C. Radius r drawn from O to A.',
    dataType: 'circle_geometry',
    tikz: `\\begin{tikzpicture}[scale=1.3]
  % Circle
  \\coordinate (O) at (0,0);
  \\draw[thick] (O) circle (2.5);

  % Chord AB horizontal, below centre
  \\coordinate (A) at (-2.4,-0.7);
  \\coordinate (B) at (2.4,-0.7);
  \\coordinate (C) at (0,-0.7);

  % Draw chord
  \\draw[thick] (A) -- (B);

  % Perpendicular from O to C
  \\draw[thick, blue, dashed] (O) -- (C);

  % Radius OA
  \\draw[thick] (O) -- (A);

  % Right angle at C
  \\draw (C) ++(0,0.25) -- ++(0.25,0) -- ++(0,-0.25);

  % Points
  \\fill (O) circle (2pt);
  \\fill (A) circle (2pt);
  \\fill (B) circle (2pt);
  \\fill[blue] (C) circle (2pt);

  % Labels
  \\node[above, font=\\bfseries] at (O) {$O$};
  \\node[below left, font=\\bfseries] at (A) {$A$};
  \\node[below right, font=\\bfseries] at (B) {$B$};
  \\node[below, blue, font=\\bfseries] at (C) {$C$};

  % Measurements
  \\node[left, blue, font=\\small] at (-0.15,-0.35) {$5$};
  \\node[below, font=\\small] at (-1.2,-0.9) {$12$};
  \\node[below, font=\\small] at (1.2,-0.9) {$12$};
  \\node[above left, font=\\small\\itshape] at (-1.2,0) {$r$};
\\end{tikzpicture}`,
  },
  {
    name: 'trig-graphs-gr12',
    alt: 'Graphs of f(x) = 2sin(x) in blue and g(x) = cos(x - 30°) in red dashed, plotted from -180° to 360° on the same axes.',
    dataType: 'trig_graph',
    tikz: `\\begin{tikzpicture}
\\begin{axis}[
  axis lines=middle, xlabel={$x$}, ylabel={$y$},
  xmin=-200, xmax=380, ymin=-2.8, ymax=2.8,
  xtick={-180,-90,0,90,180,270,360},
  xticklabels={$-180^\\circ$,$-90^\\circ$,$0^\\circ$,$90^\\circ$,$180^\\circ$,$270^\\circ$,$360^\\circ$},
  xticklabel style={font=\\small},
  ytick={-2,-1,1,2},
  grid=major, grid style={gray!20},
  width=15cm, height=7cm, samples=400,
  legend style={at={(0.98,0.98)}, anchor=north east, font=\\small},
]
  \\addplot[domain=-180:360, thick, blue] {2*sin(x)};
  \\addlegendentry{$f(x)=2\\sin x$}
  \\addplot[domain=-180:360, thick, red, dashed] {cos(x-30)};
  \\addlegendentry{$g(x)=\\cos(x-30^\\circ)$}
\\end{axis}
\\end{tikzpicture}`,
  },
  {
    name: 'venn-diagram-gr12',
    alt: 'Venn diagram with universal set U. Set S (Soccer) contains 30 learners only in S, 15 in the intersection with C. Set C (Cricket) contains 15 learners only in C. 20 learners are outside both sets.',
    dataType: 'venn_diagram',
    tikz: `\\begin{tikzpicture}
  % Universal set
  \\draw[thick, rounded corners=5pt] (-4,-2.8) rectangle (4,2.8);
  \\node[anchor=north west, font=\\bfseries] at (-3.9,2.7) {$\\mathcal{U}$};
  \\node[anchor=north east, font=\\small] at (3.9,2.7) {$n(\\mathcal{U}) = 80$};

  % Set S
  \\draw[thick, fill=blue!8] (-1,0) circle (2);
  \\node[font=\\bfseries, blue] at (-2.2,1.5) {$S$};

  % Set C
  \\draw[thick, fill=red!8] (1,0) circle (2);
  \\node[font=\\bfseries, red] at (2.2,1.5) {$C$};

  % Values
  \\node[font=\\Large] at (-1.7,0) {$30$};
  \\node[font=\\Large] at (0,0) {$15$};
  \\node[font=\\Large] at (1.7,0) {$15$};
  \\node[font=\\Large] at (3.2,-2) {$20$};
\\end{tikzpicture}`,
  },
  {
    name: 'triangle-pythag-gr9',
    alt: 'Right-angled triangle ABC with right angle at B. AB = 5 cm (vertical), BC = 12 cm (horizontal), AC = 13 cm (hypotenuse). Angle theta marked at vertex A.',
    dataType: 'triangle',
    tikz: `\\begin{tikzpicture}[scale=0.55]
  % Vertices
  \\coordinate (A) at (0,5);
  \\coordinate (B) at (0,0);
  \\coordinate (C) at (12,0);

  % Triangle
  \\draw[thick] (A) -- (B) -- (C) -- cycle;

  % Right angle mark at B
  \\draw[thick] (0,0.6) -- (0.6,0.6) -- (0.6,0);

  % Angle theta at A
  \\draw[thick] (A) ++(0,-1) arc[start angle=-90, end angle=-68, radius=1];
  \\node[right, font=\\small] at (0.2,4.2) {$\\theta$};

  % Side labels
  \\node[left, font=\\small] at (0,2.5) {$5\\,\\text{cm}$};
  \\node[below, font=\\small] at (6,0) {$12\\,\\text{cm}$};
  \\node[above right, font=\\small, red] at (6,2.8) {$13\\,\\text{cm}$};

  % Vertex labels
  \\node[above left, font=\\bfseries] at (A) {$A$};
  \\node[below left, font=\\bfseries] at (B) {$B$};
  \\node[below right, font=\\bfseries] at (C) {$C$};
\\end{tikzpicture}`,
  },
  {
    name: 'box-whisker-gr10',
    alt: 'Box-and-whisker plot showing: minimum = 12, Q1 = 22, median = 32, Q3 = 38, maximum = 47. Plotted on a number line from 10 to 50.',
    dataType: 'box_whisker',
    tikz: `\\begin{tikzpicture}[xscale=0.22]
  % Number line
  \\draw[thick, ->] (8,0) -- (52,0);
  \\foreach \\x in {10,15,20,25,30,35,40,45,50} {
    \\draw (\\x,0.15) -- (\\x,-0.15) node[below, font=\\small] {\\x};
  }

  % Whiskers
  \\draw[thick] (12,0.8) -- (12,1.6);
  \\draw[thick] (12,1.2) -- (22,1.2);
  \\draw[thick] (47,0.8) -- (47,1.6);
  \\draw[thick] (38,1.2) -- (47,1.2);

  % Box
  \\draw[thick, fill=blue!15] (22,0.6) rectangle (38,1.8);

  % Median line
  \\draw[thick, red] (32,0.6) -- (32,1.8);

  % Labels
  \\node[above, font=\\scriptsize] at (12,1.8) {$12$};
  \\node[above, font=\\scriptsize, blue] at (22,1.8) {$Q_1=22$};
  \\node[above, font=\\scriptsize, red] at (32,1.8) {$M=32$};
  \\node[above, font=\\scriptsize, blue] at (38,1.8) {$Q_3=38$};
  \\node[above, font=\\scriptsize] at (47,1.8) {$47$};

  % IQR brace
  \\draw[decorate, decoration={brace, amplitude=4pt, mirror}, thick]
    (22,-0.6) -- (38,-0.6) node[midway, below=5pt, font=\\small] {$IQR = 16$};
\\end{tikzpicture}`,
  },
];

// ─── Render a TikZ diagram through the Docker service ────────────────────────

interface RenderResponse {
  svg?: string;
  hash?: string;
  renderTimeMs?: number;
  error?: string;
  log?: string;
}

async function renderTikz(tikz: string): Promise<{ svg: string; hash: string }> {
  const res = await fetch(`${RENDERER_URL}/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tikz }),
    signal: AbortSignal.timeout(30_000),
  });

  const body = (await res.json()) as RenderResponse;

  if (!res.ok || !body.svg || !body.hash) {
    throw new Error(`Render failed: ${body.error ?? 'unknown'}\n${body.log ?? ''}`);
  }

  console.log(`  ✓ Rendered in ${body.renderTimeMs}ms (${body.svg.length} bytes SVG)`);
  return { svg: body.svg, hash: body.hash };
}

async function renderAndSave(diagram: DiagramDef): Promise<{
  svgUrl: string;
  hash: string;
}> {
  console.log(`Rendering: ${diagram.name}...`);
  const { svg, hash } = await renderTikz(diagram.tikz);

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${hash}.svg`;
  await writeFile(join(UPLOAD_DIR, filename), svg, 'utf-8');

  return { svgUrl: `/uploads/diagrams/${filename}`, hash };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✓ Connected\n');

  // Check renderer health
  console.log('🔌 Checking TikZ renderer...');
  const health = await fetch(`${RENDERER_URL}/health`).catch(() => null);
  if (!health?.ok) {
    console.error('✗ TikZ renderer not running at', RENDERER_URL);
    process.exit(1);
  }
  console.log('✓ Renderer healthy\n');

  // Find existing school, subject, grade, user
  const School = mongoose.connection.collection('schools');
  const Subject = mongoose.connection.collection('subjects');
  const Grade = mongoose.connection.collection('grades');
  const User = mongoose.connection.collection('users');

  const school = await School.findOne({});
  if (!school) {
    console.error('✗ No school found in database. Create a school first.');
    process.exit(1);
  }
  console.log(`School: ${school.name}`);

  const mathSubject = await Subject.findOne({
    $or: [
      { name: { $regex: /math/i } },
      { name: 'Mathematics' },
    ],
  });

  const grade = await Grade.findOne({
    $or: [{ level: 11 }, { name: { $regex: /11/i } }],
  }) ?? await Grade.findOne({});

  const teacher = await User.findOne({
    schoolId: school._id,
    role: { $in: ['teacher', 'school_admin', 'principal', 'super_admin'] },
  });

  if (!teacher) {
    console.error('✗ No teacher/admin user found. Create one first.');
    process.exit(1);
  }

  console.log(`Subject: ${mathSubject?.name ?? 'N/A (will use ID only)'}`);
  console.log(`Grade: ${grade?.name ?? grade?.level ?? 'N/A'}`);
  console.log(`Teacher: ${teacher.firstName} ${teacher.lastName}\n`);

  // ── Render all diagrams ──
  console.log('═══ Rendering TikZ diagrams ═══\n');

  const rendered: Map<string, { svgUrl: string; hash: string }> = new Map();
  for (const d of DIAGRAMS) {
    try {
      const result = await renderAndSave(d);
      rendered.set(d.name, result);
    } catch (err: unknown) {
      console.error(`  ✗ Failed: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }

  console.log(`\n✓ Rendered ${rendered.size}/${DIAGRAMS.length} diagrams\n`);

  if (rendered.size === 0) {
    console.error('No diagrams rendered. Exiting.');
    process.exit(1);
  }

  // ── Create GeneratedPaper ──
  console.log('═══ Creating Generated Paper ═══\n');

  const GeneratedPaper = mongoose.connection.collection('generatedpapers');

  function makeDiagram(name: string) {
    const r = rendered.get(name);
    const d = DIAGRAMS.find((x) => x.name === name);
    if (!r || !d) return null;
    return {
      tikz: d.tikz,
      data: { type: d.dataType },
      alt: d.alt,
      svgUrl: r.svgUrl,
      hash: r.hash,
      renderStatus: 'rendered',
      renderError: null,
    };
  }

  const paper = {
    schoolId: school._id,
    teacherId: teacher._id,
    subject: 'Mathematics',
    grade: 11,
    term: 2,
    topic: 'Functions, Geometry & Statistics',
    difficulty: 'mixed',
    duration: 120,
    totalMarks: 75,
    sections: [
      {
        sectionLabel: 'Section A: Multiple Choice',
        questionType: 'Multiple Choice',
        questions: [
          {
            questionNumber: 1,
            questionText: 'The graph of $f(x) = -(x-3)^2 + 4$ has a turning point at:',
            marks: 2,
            modelAnswer: 'C. (3; 4)',
            markingGuideline: 'Answer: C (2 marks)',
            diagram: makeDiagram('parabola-gr11'),
          },
          {
            questionNumber: 2,
            questionText: 'Simplify: $\\frac{x^2 - 9}{x + 3}$',
            marks: 2,
            modelAnswer: 'x - 3, where x ≠ -3',
            markingGuideline: 'Factorisation (1), Simplification (1)',
            diagram: null,
          },
          {
            questionNumber: 3,
            questionText: 'In the Venn diagram, $P(S \\cup C)$ is equal to:',
            marks: 2,
            modelAnswer: 'B. 0.75',
            markingGuideline: 'P(S ∪ C) = 60/80 = 3/4 = 0.75 (2 marks)',
            diagram: makeDiagram('venn-diagram-gr12'),
          },
          {
            questionNumber: 4,
            questionText: 'Solve for $x$: $2x^2 - 5x - 3 = 0$',
            marks: 2,
            modelAnswer: 'x = 3 or x = -1/2',
            markingGuideline: 'Factoring or quadratic formula (1 mark each root)',
            diagram: null,
          },
        ],
      },
      {
        sectionLabel: 'Section B: Short Questions',
        questionType: 'Short Answer',
        questions: [
          {
            questionNumber: 5,
            questionText: 'In the diagram, O is the centre of the circle. AB is a chord and OC ⊥ AB. If AB = 24 cm and OC = 5 cm, calculate the radius of the circle.',
            marks: 5,
            modelAnswer: 'AC = 12 (perpendicular from centre bisects chord) ✓\nIn △OCA: r² = OC² + AC² ✓\nr² = 25 + 144 = 169 ✓\nr = 13 cm ✓',
            markingGuideline: 'AC = 12 (1), Pythagoras setup (1), Substitution (1), r² = 169 (1), r = 13 (1)',
            diagram: makeDiagram('circle-theorem-gr11'),
          },
          {
            questionNumber: 6,
            questionText: 'The box-and-whisker plot shows the distribution of marks for a class of 30 learners. Determine the interquartile range and describe the skewness of the data.',
            marks: 4,
            modelAnswer: 'IQR = Q₃ - Q₁ = 38 - 22 = 16 ✓✓\nThe data is negatively skewed (skewed to the left) because the median is closer to Q₃ than to Q₁, and the left whisker is longer. ✓✓',
            markingGuideline: 'IQR calculation (2), Skewness identification (1), Justification (1)',
            diagram: makeDiagram('box-whisker-gr10'),
          },
          {
            questionNumber: 7,
            questionText: 'If $f(x) = 3x^2 - 2x + 1$, determine $f\'(x)$ from first principles.',
            marks: 5,
            modelAnswer: 'f\'(x) = lim[h→0] (f(x+h) - f(x))/h\n= lim[h→0] (3(x+h)² - 2(x+h) + 1 - 3x² + 2x - 1)/h\n= lim[h→0] (6xh + 3h² - 2h)/h\n= lim[h→0] (6x + 3h - 2)\n= 6x - 2',
            markingGuideline: 'Formula (1), Expansion (1), Simplification (1), Cancellation of h (1), Answer (1)',
            diagram: null,
          },
        ],
      },
      {
        sectionLabel: 'Section C: Long Questions',
        questionType: 'Structured',
        questions: [
          {
            questionNumber: 8,
            questionText: 'In △ABC, $\\hat{B} = 90°$, AB = 5 cm, BC = 12 cm and AC = 13 cm.\n\n8.1 Calculate the value of $\\sin\\theta$ where $\\theta = \\hat{A}$. (2)\n8.2 Calculate the value of $\\cos\\theta$. (1)\n8.3 Show that $\\sin^2\\theta + \\cos^2\\theta = 1$. (3)',
            marks: 6,
            modelAnswer: '8.1 sin θ = BC/AC = 12/13 ✓✓\n8.2 cos θ = AB/AC = 5/13 ✓\n8.3 sin²θ + cos²θ = (12/13)² + (5/13)² = 144/169 + 25/169 = 169/169 = 1 ✓✓✓',
            markingGuideline: '8.1: Ratio (1), Answer (1). 8.2: Answer (1). 8.3: Substitution (1), Addition (1), Simplification to 1 (1).',
            diagram: makeDiagram('triangle-pythag-gr9'),
          },
          {
            questionNumber: 9,
            questionText: 'The graphs of $f(x) = 2\\sin x$ and $g(x) = \\cos(x - 30°)$ for $x \\in [-180°; 360°]$ are drawn below.\n\n9.1 Write down the amplitude of $f$. (1)\n9.2 Write down the period of $g$. (1)\n9.3 Determine the values of $x$ for which $f(x) = g(x)$ in the given interval. (4)\n9.4 For which values of $x$ is $f(x) \\geq g(x)$? (2)',
            marks: 8,
            modelAnswer: '9.1 Amplitude of f = 2 ✓\n9.2 Period of g = 360° ✓\n9.3 2sin x = cos(x - 30°) → use identity and solve ✓✓✓✓\n9.4 Read from graph where blue curve is above red curve ✓✓',
            markingGuideline: '9.1: 2 (1). 9.2: 360° (1). 9.3: Setting up equation (1), solving (3). 9.4: Interval notation (2)',
            diagram: makeDiagram('trig-graphs-gr12'),
          },
          {
            questionNumber: 10,
            questionText: 'Given the function $g(x) = \\frac{2}{x-1} + 3$.\n\n10.1 Write down the equations of the asymptotes of $g$. (2)\n10.2 Determine the $x$-intercept of $g$. (3)\n10.3 Determine the $y$-intercept of $g$. (2)\n10.4 Sketch the graph of $g$, clearly showing all intercepts and asymptotes. (4)',
            marks: 11,
            modelAnswer: '10.1 x = 1 (vertical), y = 3 (horizontal) ✓✓\n10.2 0 = 2/(x-1) + 3 → -3 = 2/(x-1) → x-1 = -2/3 → x = 1/3 ✓✓✓\n10.3 g(0) = 2/(0-1) + 3 = -2 + 3 = 1 → (0;1) ✓✓\n10.4 Correct shape in correct quadrants with asymptotes and intercepts shown ✓✓✓✓',
            markingGuideline: '10.1: Each asymptote (1). 10.2: Setting up (1), solving (2). 10.3: Substitution (1), answer (1). 10.4: Shape (2), asymptotes (1), intercepts (1).',
            diagram: null,
          },
        ],
      },
    ],
    memorandum: 'See model answers and marking guidelines for each question.',
    status: 'ready',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await GeneratedPaper.insertOne(paper);
  console.log(`✓ Created GeneratedPaper: ${result.insertedId}\n`);

  // ── Summary ──
  const diagramCount = paper.sections
    .flatMap((s) => s.questions)
    .filter((q) => q.diagram !== null).length;

  console.log('═══ Done ═══');
  console.log(`Paper: "Mathematics Grade 11 — Functions, Geometry & Statistics"`);
  console.log(`Sections: ${paper.sections.length}`);
  console.log(`Questions: ${paper.sections.reduce((n, s) => n + s.questions.length, 0)}`);
  console.log(`Diagrams: ${diagramCount} rendered via TikZ`);
  console.log(`Total marks: ${paper.totalMarks}`);
  console.log(`\nView in teacher portal: AI Tools → Generated Papers`);

  await mongoose.disconnect();
}

main().catch((err: unknown) => {
  console.error('Fatal:', err);
  process.exit(1);
});
