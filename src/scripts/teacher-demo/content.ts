/** Demo content for Thandi Molefe (Greenfield Primary): Grade 1 A (homeroom) and Grade R A, term 3. */

/** Modules a walkthrough needs switched on so every teacher page works. */
export const DEMO_MODULES = [
  'teacher_workbench', 'ai_tools', 'courses', 'communication', 'incident_wellbeing',
  'staff_leave', 'conference_booking', 'learning',
];

/** School subject name → CAPS subject title (Grade 1; CAPS has no Grade R tree, so Grade R uses Grade 1 topics). */
export const CAPS_SUBJECT: Record<string, string> = {
  English: 'English Home Language',
  Mathematics: 'Mathematics',
  'Life Skills': 'Life Skills',
};

export const DEMO_SUBJECTS = Object.keys(CAPS_SUBJECT);

export interface DemoLesson {
  title: string;
  className: string;
  subject: string;
  durationMinutes: number;
  objectives: string[];
  notesTitle: string;
  notes: string;
}

export const LESSONS: DemoLesson[] = [
  {
    title: 'Phonics: “sh” and “ch”', className: 'Grade 1 - A', subject: 'English', durationMinutes: 45,
    objectives: ['Hear the difference between “sh” and “ch”', 'Read and build ten sh/ch words', 'Use two of the words in a sentence'],
    notesTitle: 'sh and ch: teacher notes',
    notes: 'Start with a listening game: say ship / chip, shop / chop and have learners show a card for each sound. Build words on the board (shell, fish, chin, lunch) and read them together. Finish with learners writing one sentence using a sh word and a ch word.',
  },
  {
    title: 'Counting to 20 with ten-frames', className: 'Grade R - A', subject: 'Mathematics', durationMinutes: 30,
    objectives: ['Count objects to 20', 'Show numbers on two ten-frames', 'Say one more and one less'],
    notesTitle: 'Ten-frames to 20: teacher notes',
    notes: 'Use bottle tops on two ten-frames. Fill the first frame, then keep counting on the second. Ask: how many more to fill both? Play “one more, one less” in pairs.',
  },
  {
    title: 'My feelings: happy, sad, cross, scared', className: 'Grade R - A', subject: 'Life Skills', durationMinutes: 30,
    objectives: ['Name four feelings', 'Match a face to a feeling', 'Say what helps when we feel sad'],
    notesTitle: 'Feelings circle: teacher notes',
    notes: 'Sit in a circle with the feelings cards. Each learner picks a face and says when they felt that way. Draw a “feelings helpers” list together on chart paper.',
  },
  {
    title: 'Adding on a number line to 20', className: 'Grade 1 - A', subject: 'Mathematics', durationMinutes: 45,
    objectives: ['Add by jumping forward on a number line', 'Solve five addition stories to 20'],
    notesTitle: 'Number line addition: teacher notes',
    notes: 'Model 8 + 5 on a floor number line by jumping. Learners then solve word problems (e.g. “Sipho has 9 marbles and gets 6 more”) on their own number lines.',
  },
];

export interface DemoHomework {
  title: string;
  className: string;
  subject: string;
  due: 'today' | 'overdue' | 'soon';
  description: string;
}

export const HOMEWORK: DemoHomework[] = [
  { title: 'Find five sh and ch words at home', className: 'Grade 1 - A', subject: 'English', due: 'today', description: 'Write five words from home that start or end with sh or ch, and draw one of them.' },
  { title: 'Count and colour to 20', className: 'Grade R - A', subject: 'Mathematics', due: 'overdue', description: 'Count the objects in each box and colour the matching number.' },
  { title: 'Draw a time you felt proud', className: 'Grade 1 - A', subject: 'Life Skills', due: 'soon', description: 'Draw a picture and write one sentence about it.' },
];

export interface DemoPaperQuestion { text: string; marks: number; answer: string }
export interface DemoPaper {
  title: string;
  className: string;
  subject: string;
  status: 'draft' | 'finalised';
  duration: number;
  sections: Array<{ title: string; instructions: string; questions: DemoPaperQuestion[] }>;
}

export const PAPERS: DemoPaper[] = [
  {
    title: 'Term 3 reading check: “The Big Race”', className: 'Grade 1 - A', subject: 'English', status: 'finalised', duration: 30,
    sections: [
      {
        title: 'Section A: Read and answer', instructions: 'Read the story with your teacher, then answer.',
        questions: [
          { text: 'Who won the big race?', marks: 2, answer: 'The tortoise.' },
          { text: 'Why did the hare stop to sleep?', marks: 2, answer: 'He thought he was far ahead and would still win.' },
          { text: 'How did the tortoise feel at the end?', marks: 2, answer: 'Happy / proud (any feeling word with a reason).' },
        ],
      },
      {
        title: 'Section B: Words', instructions: 'Circle the sh or ch sound.',
        questions: [
          { text: 'Circle the sound in “ship”.', marks: 1, answer: 'sh' },
          { text: 'Circle the sound in “lunch”.', marks: 1, answer: 'ch' },
          { text: 'Write one word that starts with ch.', marks: 2, answer: 'Any correct word, e.g. chip, chin, chair.' },
        ],
      },
    ],
  },
  {
    title: 'Counting to 20: quick check', className: 'Grade R - A', subject: 'Mathematics', status: 'draft', duration: 20,
    sections: [
      {
        title: 'Count and write', instructions: 'Count the pictures and write the number.',
        questions: [
          { text: 'Count the apples (12).', marks: 1, answer: '12' },
          { text: 'Count the stars (17).', marks: 1, answer: '17' },
          { text: 'What is one more than 15?', marks: 1, answer: '16' },
        ],
      },
    ],
  },
];

export interface DemoThread {
  /** Learner (first name) whose parent writes. */
  learnerFirstName: string;
  messages: string[];
}

export const THREADS: DemoThread[] = [
  { learnerFirstName: 'Lebo', messages: ['Good morning Mrs Molefe, Lebo was sick yesterday. Can she catch up on the phonics work?', 'Also, is the reading check still on Friday?'] },
  { learnerFirstName: 'Jan', messages: ['Hi, Jan says he left his reading book at school. Could you check his cubby please?'] },
];

/**
 * School weightings for the demo (every term). Life Skills is left out on
 * purpose, so the gradebook shows a subject still waiting for weightings.
 */
export const DEMO_WEIGHTINGS: Record<string, Array<{ type: 'test' | 'exam' | 'assignment' | 'practical' | 'project'; weight: number }>> = {
  English: [{ type: 'test', weight: 50 }, { type: 'assignment', weight: 30 }, { type: 'project', weight: 20 }],
  Mathematics: [{ type: 'test', weight: 50 }, { type: 'assignment', weight: 30 }, { type: 'project', weight: 20 }],
};
