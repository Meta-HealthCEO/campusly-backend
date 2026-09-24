/**
 * A ready-made class unit for the teacher walkthrough: what the AI course
 * builder produces, written by hand so the demo works without an AI key.
 * Grade 1 Mathematics, Term 3 (CAPS: Numbers, Operations and Relationships;
 * Patterns, Functions and Algebra).
 */

export interface DemoQuestion {
  stem: string;
  options: Array<{ label: string; text: string; isCorrect: boolean }>;
}

export interface DemoUnitItem {
  kind: 'notes' | 'worked_example' | 'quick_check';
  title: string;
  minutes: number;
  objectives: string[];
  brief: string;
  /** Notes: markdown. Worked examples: steps. */
  text?: string;
  steps?: Array<{ title: string; content: string }>;
  questions?: DemoQuestion[];
}

export interface DemoUnitModule {
  title: string;
  /** Matched to the Grade 1 Mathematics Term 3 CAPS topic with this title. */
  capsTopic: string;
  objectives: string[];
  items: DemoUnitItem[];
}

const mcq = (stem: string, right: string, ...wrong: string[]): DemoQuestion => {
  const texts = [right, ...wrong];
  // Put the right answer in a different place each time (B, C, A, …).
  const shift = stem.length % texts.length;
  const ordered = texts.map((_, i) => texts[(i + shift) % texts.length]);
  return { stem, options: ordered.map((text, i) => ({ label: 'ABCD'[i], text, isCorrect: text === right })) };
};

export const DEMO_UNIT = {
  title: 'Numbers to 99 · Grade 1 Mathematics · Term 3',
  description: 'Counting, place value and number patterns for the second half of Term 3. Short items your learners can do at home or in class.',
  modules: [
    {
      title: 'Counting to 99',
      capsTopic: 'Numbers, Operations and Relationships',
      objectives: ['I can count forwards and backwards to 99', 'I can count in tens'],
      items: [
        {
          kind: 'notes',
          title: 'Counting in tens to 90',
          minutes: 8,
          objectives: ['I can count in tens from 10 to 90'],
          brief: 'Bundles of ten sticks, then counting the bundles.',
          text: [
            '## Bundles of ten',
            'We can put **10 sticks** together with an elastic band. That is **one ten**.',
            '',
            '| Bundles | Sticks |',
            '|---|---|',
            '| 1 bundle | 10 |',
            '| 2 bundles | 20 |',
            '| 3 bundles | 30 |',
            '',
            'Count the bundles out loud: **10, 20, 30, 40, 50, 60, 70, 80, 90**.',
            '',
            '> Tip: every time you count a bundle, the tens number goes up by one: 1 ten, 2 tens, 3 tens.',
            '',
            '### Try it at home',
            'Put spoons or pegs into groups of ten. How many tens can you make?',
          ].join('\n'),
        },
        {
          kind: 'worked_example',
          title: 'Counting on from 47',
          minutes: 6,
          objectives: ['I can count on in ones from any number'],
          brief: 'Count on from 47 to 53, crossing a ten.',
          steps: [
            { title: 'Start at 47', content: 'Say the number you start on: **47**. Put your finger on 47 on the number line.' },
            { title: 'Count on in ones', content: '48, 49 … one more than 49 is **50**. We crossed a new ten!' },
            { title: 'Keep going', content: '51, 52, **53**. We counted on 6 from 47 and landed on 53.' },
            { title: 'Check', content: '47 → 53 is 6 jumps. Count your jumps on your fingers: 6.' },
          ],
        },
        {
          kind: 'quick_check',
          title: 'Check: counting',
          minutes: 5,
          objectives: ['I can count in tens and count on'],
          brief: 'Four questions on counting in tens and counting on.',
          questions: [
            mcq('What comes next? 10, 20, 30, …', '40', '31', '50', '33'),
            mcq('How many sticks are in 6 bundles of ten?', '60', '16', '6', '66'),
            mcq('Count on from 38. What comes after 39?', '40', '30', '310', '49'),
            mcq('Which number is one more than 79?', '80', '78', '89', '70'),
          ],
        },
      ],
    },
    {
      title: 'Number patterns',
      capsTopic: 'Patterns, Functions and Algebra',
      objectives: ['I can copy, extend and describe number patterns'],
      items: [
        {
          kind: 'notes',
          title: 'What makes a pattern',
          minutes: 7,
          objectives: ['I can say what repeats or grows in a pattern'],
          brief: 'Repeating and growing patterns, with numbers.',
          text: [
            '## Patterns repeat or grow',
            'A **pattern** follows a rule.',
            '',
            '- **Repeating:** red, blue, red, blue, red, …',
            '- **Growing:** 2, 4, 6, 8, … (we add **2** each time)',
            '',
            'To find the rule, look at how you get from one number to the next.',
            '',
            '> 5, 10, 15, 20: we add **5** each time.',
          ].join('\n'),
        },
        {
          kind: 'worked_example',
          title: 'Finish the pattern 5, 10, 15, …',
          minutes: 6,
          objectives: ['I can extend a number pattern'],
          brief: 'Find the rule, then extend by three numbers.',
          steps: [
            { title: 'Look at the gaps', content: '5 → 10 is **5 more**. 10 → 15 is **5 more**.' },
            { title: 'Say the rule', content: 'The rule is **add 5**.' },
            { title: 'Extend the pattern', content: '15 + 5 = **20**, 20 + 5 = **25**, 25 + 5 = **30**.' },
            { title: 'Read it all', content: '5, 10, 15, 20, 25, 30. Clap on each number!' },
          ],
        },
        {
          kind: 'quick_check',
          title: 'Check: patterns',
          minutes: 5,
          objectives: ['I can find the next number in a pattern'],
          brief: 'Four questions on finding the rule and the next number.',
          questions: [
            mcq('What comes next? 2, 4, 6, 8, …', '10', '9', '12', '16'),
            mcq('What is the rule? 5, 10, 15, 20', 'Add 5', 'Add 10', 'Add 1', 'Take away 5'),
            mcq('What comes next? 30, 40, 50, …', '60', '51', '55', '70'),
            mcq('What comes next? circle, square, circle, square, …', 'circle', 'square', 'triangle', 'star'),
          ],
        },
      ],
    },
  ] satisfies DemoUnitModule[],
};
