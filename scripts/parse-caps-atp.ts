/**
 * CAPS ATP Parser
 *
 * Reads an Annual Teaching Plan PDF and extracts structured curriculum data
 * using Claude API, then outputs JSON ready for bulk import via
 * /api/curriculum-structure/nodes/bulk
 *
 * Usage:
 *   npx tsx scripts/parse-caps-atp.ts <pdf-path> <subject> <grade> [--output <file>]
 *
 * Example:
 *   npx tsx scripts/parse-caps-atp.ts "C:/Users/shaun/OneDrive/Desktop/Curriculum/1.580 ATP 2023-24 Gr 10 Maths final.pdf" Mathematics 10
 *   npx tsx scripts/parse-caps-atp.ts "C:/path/to/file.pdf" "Physical Sciences" 11 --output phys-sci-gr11.json
 */

import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

interface ParsedNode {
  type: 'phase' | 'grade' | 'subject' | 'term' | 'topic' | 'subtopic' | 'outcome';
  parentCode: string | null;
  title: string;
  code: string;
  description: string;
  metadata: {
    weekNumbers: number[];
    capsReference: string;
    assessmentStandards: string[];
    notionalHours: number;
    cognitiveWeighting: null;
  };
  order: number;
}

function buildPrompt(subject: string, grade: number): string {
  return `You are extracting structured curriculum data from a South African CAPS Annual Teaching Plan (ATP) PDF.

The PDF contains a table with terms (1-4), each term has topics mapped to specific weeks, and each topic has detailed subtopics/learning outcomes.

Extract ALL content into a flat JSON array of curriculum nodes following this EXACT structure. Each node has a "parentCode" that references the code of its parent node.

## Node Hierarchy

1. **term** nodes — one per term (Term 1, Term 2, Term 3, Term 4)
   - parentCode: "CAPS-${subject.toUpperCase().replace(/\s+/g, '')}-GR${grade}"
   - code: "CAPS-${subject.toUpperCase().replace(/\s+/g, '')}-GR${grade}-T{termNumber}"

2. **topic** nodes — main topics within each term (e.g., "Algebraic Expressions", "Trigonometry")
   - parentCode: the term code
   - code: "CAPS-${subject.toUpperCase().replace(/\s+/g, '')}-GR${grade}-T{term}-{TOPIC_ABBREV}"
   - Include weekNumbers in metadata (e.g., [1,2,3,4] if the topic spans weeks 1-4)

3. **subtopic** nodes — detailed learning outcomes/skills under each topic
   - parentCode: the topic code
   - code: "CAPS-${subject.toUpperCase().replace(/\s+/g, '')}-GR${grade}-T{term}-{TOPIC_ABBREV}-{number}"
   - These are the numbered items under each topic in the ATP

## Rules

- Extract EVERY topic and subtopic from ALL 4 terms
- Week numbers must be integers (e.g., weeks 1-4 = [1,2,3,4])
- For topics that span multiple weeks, include all week numbers
- Use SHORT but meaningful abbreviations for topic codes (e.g., ALG for Algebra, TRIG for Trigonometry, GEOM for Geometry, STAT for Statistics, PROB for Probability, FUNC for Functions, MEAS for Measurement)
- The "description" field should contain the full text of the learning outcome/skill
- For subtopic nodes, put the detailed skill description in "description"
- Include assessment info (SBA tasks, tests, exams) in the term node's description
- Order nodes sequentially within their parent
- Do NOT include revision weeks or exam weeks as topics — note them in the term description instead

## Output Format

Return ONLY a valid JSON array. No markdown, no explanation, just the JSON:

[
  {
    "type": "term",
    "parentCode": "CAPS-${subject.toUpperCase().replace(/\s+/g, '')}-GR${grade}",
    "title": "Term 1",
    "code": "CAPS-${subject.toUpperCase().replace(/\s+/g, '')}-GR${grade}-T1",
    "description": "SBA: Investigation or project (15%) and Test (14%)",
    "metadata": { "weekNumbers": [1,2,3,4,5,6,7,8,9,10,11], "capsReference": "", "assessmentStandards": [], "notionalHours": 0, "cognitiveWeighting": null },
    "order": 1
  },
  {
    "type": "topic",
    "parentCode": "CAPS-${subject.toUpperCase().replace(/\s+/g, '')}-GR${grade}-T1",
    "title": "Algebraic Expressions",
    "code": "CAPS-${subject.toUpperCase().replace(/\s+/g, '')}-GR${grade}-T1-ALG",
    "description": "",
    "metadata": { "weekNumbers": [1,2,3,4], "capsReference": "", "assessmentStandards": [], "notionalHours": 0, "cognitiveWeighting": null },
    "order": 1
  },
  {
    "type": "subtopic",
    "parentCode": "CAPS-${subject.toUpperCase().replace(/\s+/g, '')}-GR${grade}-T1-ALG",
    "title": "Rational and irrational numbers",
    "code": "CAPS-${subject.toUpperCase().replace(/\s+/g, '')}-GR${grade}-T1-ALG-01",
    "description": "Understand that real numbers can be rational or irrational",
    "metadata": { "weekNumbers": [1,2,3,4], "capsReference": "", "assessmentStandards": [], "notionalHours": 0, "cognitiveWeighting": null },
    "order": 1
  }
]

Subject: ${subject}
Grade: ${grade}

Now extract the curriculum structure from the PDF.`;
}

async function parsePdf(pdfPath: string, subject: string, grade: number): Promise<ParsedNode[]> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  const absolutePath = path.resolve(pdfPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`PDF not found: ${absolutePath}`);
  }

  console.log(`Reading PDF: ${absolutePath}`);
  const pdfBuffer = fs.readFileSync(absolutePath);
  const pdfBase64 = pdfBuffer.toString('base64');
  console.log(`PDF size: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  console.log(`Sending to Claude (${ANTHROPIC_MODEL})...`);
  const response = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: pdfBase64,
            },
          },
          {
            type: 'text',
            text: buildPrompt(subject, grade),
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  const rawText = textBlock.text;

  // Extract JSON array from response
  const jsonMatch = rawText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error('Raw response:', rawText);
    throw new Error('Could not extract JSON array from Claude response');
  }

  const nodes: ParsedNode[] = JSON.parse(jsonMatch[0]);
  console.log(`Extracted ${nodes.length} nodes`);

  return nodes;
}

function buildAncestorNodes(subject: string, grade: number): ParsedNode[] {
  const subjectCode = subject.toUpperCase().replace(/\s+/g, '');
  return [
    {
      type: 'phase',
      parentCode: null,
      title: grade >= 10 ? 'FET Phase' : grade >= 7 ? 'Senior Phase' : grade >= 4 ? 'Intermediate Phase' : 'Foundation Phase',
      code: `CAPS-${grade >= 10 ? 'FET' : grade >= 7 ? 'SENIOR' : grade >= 4 ? 'INTERMEDIATE' : 'FOUNDATION'}`,
      description: '',
      metadata: { weekNumbers: [], capsReference: '', assessmentStandards: [], notionalHours: 0, cognitiveWeighting: null },
      order: grade >= 10 ? 4 : grade >= 7 ? 3 : grade >= 4 ? 2 : 1,
    },
    {
      type: 'grade',
      parentCode: `CAPS-${grade >= 10 ? 'FET' : grade >= 7 ? 'SENIOR' : grade >= 4 ? 'INTERMEDIATE' : 'FOUNDATION'}`,
      title: `Grade ${grade}`,
      code: `CAPS-GR${grade}`,
      description: '',
      metadata: { weekNumbers: [], capsReference: '', assessmentStandards: [], notionalHours: 0, cognitiveWeighting: null },
      order: grade,
    },
    {
      type: 'subject',
      parentCode: `CAPS-GR${grade}`,
      title: subject,
      code: `CAPS-${subjectCode}-GR${grade}`,
      description: `${subject} — Grade ${grade} — CAPS Curriculum`,
      metadata: { weekNumbers: [], capsReference: '', assessmentStandards: [], notionalHours: 0, cognitiveWeighting: null },
      order: 1,
    },
  ];
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log('Usage: npx tsx scripts/parse-caps-atp.ts <pdf-path> <subject> <grade> [--output <file>]');
    console.log('');
    console.log('Example:');
    console.log('  npx tsx scripts/parse-caps-atp.ts "./curriculum/maths-gr10.pdf" Mathematics 10');
    process.exit(1);
  }

  const pdfPath = args[0];
  const subject = args[1];
  const grade = parseInt(args[2], 10);

  if (isNaN(grade) || grade < 1 || grade > 12) {
    console.error('Grade must be a number between 1 and 12');
    process.exit(1);
  }

  const outputIdx = args.indexOf('--output');
  const outputPath = outputIdx !== -1 && args[outputIdx + 1]
    ? args[outputIdx + 1]
    : `caps-${subject.toLowerCase().replace(/\s+/g, '-')}-gr${grade}.json`;

  console.log(`\nParsing: ${subject} Grade ${grade}`);
  console.log(`PDF: ${pdfPath}`);
  console.log(`Output: ${outputPath}\n`);

  // Build ancestor nodes (phase, grade, subject)
  const ancestors = buildAncestorNodes(subject, grade);

  // Parse the ATP PDF
  const extracted = await parsePdf(pdfPath, subject, grade);

  // Combine: ancestors + extracted nodes
  const allNodes = [...ancestors, ...extracted];

  // Validate: check all parentCodes resolve
  const codes = new Set(allNodes.map((n) => n.code));
  const orphans = allNodes.filter((n) => n.parentCode && !codes.has(n.parentCode));
  if (orphans.length > 0) {
    console.warn(`\nWARNING: ${orphans.length} nodes have unresolved parentCodes:`);
    for (const o of orphans) {
      console.warn(`  ${o.code} → parent: ${o.parentCode}`);
    }
  }

  // Write output
  const output = {
    frameworkId: '<CAPS_FRAMEWORK_ID>',
    nodes: allNodes,
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  // Summary
  const terms = allNodes.filter((n) => n.type === 'term').length;
  const topics = allNodes.filter((n) => n.type === 'topic').length;
  const subtopics = allNodes.filter((n) => n.type === 'subtopic').length;

  console.log(`\n✓ Output written to: ${outputPath}`);
  console.log(`  Ancestors: ${ancestors.length} (phase, grade, subject)`);
  console.log(`  Terms: ${terms}`);
  console.log(`  Topics: ${topics}`);
  console.log(`  Subtopics: ${subtopics}`);
  console.log(`  Total nodes: ${allNodes.length}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Review the JSON file`);
  console.log(`  2. Replace <CAPS_FRAMEWORK_ID> with the actual CAPS framework ObjectId`);
  console.log(`  3. POST to /api/curriculum-structure/nodes/bulk`);
}

main().catch((err) => {
  console.error('Error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
