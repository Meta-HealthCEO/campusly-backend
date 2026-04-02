import { AptitudeResult, type IAptitudeResult } from '../model.js';

// ─── Types ────────────────────────────────────────────────────────────────

interface AptitudeQuestion {
  id: string;
  text: string;
  type: 'likert';
  options: string[];
}

interface AptitudeSection {
  name: string;
  description: string;
  questions: AptitudeQuestion[];
}

interface AnswerInput {
  questionId: string;
  value: number;
}

const LIKERT_OPTIONS = [
  'Strongly Disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly Agree',
];

// ─── Questions ────────────────────────────────────────────────────────────

const APTITUDE_SECTIONS: AptitudeSection[] = [
  {
    name: 'Interests',
    description: 'What activities and subjects do you enjoy?',
    questions: [
      { id: 'int01', text: 'I enjoy solving mathematical problems', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'int02', text: 'I enjoy reading and writing stories or essays', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'int03', text: 'I am fascinated by how the human body works', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'int04', text: 'I enjoy designing or creating visual artwork', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'int05', text: 'I like learning about business and how companies operate', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'int06', text: 'I enjoy working with computers and technology', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'int07', text: 'I am interested in law, justice, and human rights', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'int08', text: 'I enjoy helping others learn new things', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'int09', text: 'I am interested in farming, nature, and the environment', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'int10', text: 'I enjoy understanding people and their behaviour', type: 'likert', options: LIKERT_OPTIONS },
    ],
  },
  {
    name: 'Personality',
    description: 'How do you typically approach situations?',
    questions: [
      { id: 'per01', text: 'I prefer working with facts and data over opinions', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'per02', text: 'I am comfortable speaking in front of groups', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'per03', text: 'I prefer working alone rather than in a team', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'per04', text: 'I pay close attention to small details', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'per05', text: 'I am patient when dealing with difficult people', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'per06', text: 'I enjoy taking the lead in group projects', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'per07', text: 'I am comfortable with routines and structured tasks', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'per08', text: 'I adapt quickly to new and unexpected situations', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'per09', text: 'I feel strongly about helping my community', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'per10', text: 'I enjoy expressing myself through creative means', type: 'likert', options: LIKERT_OPTIONS },
    ],
  },
  {
    name: 'Problem Solving',
    description: 'How do you approach challenges and problems?',
    questions: [
      { id: 'ps01', text: 'I enjoy figuring out how machines and systems work', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'ps02', text: 'I like conducting experiments to test ideas', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'ps03', text: 'I approach problems by breaking them into smaller steps', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'ps04', text: 'I prefer creative solutions over standard procedures', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'ps05', text: 'I am good at spotting patterns in numbers or data', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'ps06', text: 'I enjoy debating and constructing logical arguments', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'ps07', text: 'I like planning and organising events or activities', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'ps08', text: 'I can explain complex ideas in simple terms', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'ps09', text: 'I enjoy analysing financial statements and budgets', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'ps10', text: 'I am drawn to solving environmental or social issues', type: 'likert', options: LIKERT_OPTIONS },
    ],
  },
  {
    name: 'Work Preferences',
    description: 'What kind of work environment suits you best?',
    questions: [
      { id: 'wp01', text: 'I would enjoy working in a hospital or clinic', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'wp02', text: 'I want a career with high earning potential', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'wp03', text: 'I prefer working outdoors rather than in an office', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'wp04', text: 'I would enjoy working in a school or university', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'wp05', text: 'I want a career that involves travel', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'wp06', text: 'I prefer a career with a clear promotion path', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'wp07', text: 'I would enjoy working in a courtroom or legal setting', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'wp08', text: 'I see myself working in media, advertising, or design', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'wp09', text: 'I would enjoy working on a farm or in agriculture', type: 'likert', options: LIKERT_OPTIONS },
      { id: 'wp10', text: 'I want a career where I can make a social impact', type: 'likert', options: LIKERT_OPTIONS },
    ],
  },
];

// ─── Cluster Mapping ──────────────────────────────────────────────────────

const CLUSTER_QUESTIONS: Record<string, string[]> = {
  STEM: ['int01', 'int06', 'ps02', 'ps05', 'per01'],
  'Health Sciences': ['int03', 'wp01', 'per04', 'per05', 'ps02'],
  Business: ['int05', 'ps09', 'wp02', 'wp06', 'per06'],
  'Creative Arts': ['int04', 'per10', 'ps04', 'wp08', 'int02'],
  Education: ['int08', 'wp04', 'ps08', 'per05', 'per02'],
  'Social Sciences': ['int10', 'per09', 'wp10', 'ps10', 'per05'],
  Law: ['int07', 'ps06', 'wp07', 'per02', 'per06'],
  Agriculture: ['int09', 'wp03', 'wp09', 'ps10', 'per08'],
  Engineering: ['ps01', 'ps03', 'int01', 'per04', 'ps05'],
};

const CLUSTER_DESCRIPTIONS: Record<string, string> = {
  STEM: 'Science, Technology, Engineering and Mathematics',
  'Health Sciences': 'Medicine, Nursing, Pharmacy and Allied Health',
  Business: 'Commerce, Finance, Management and Entrepreneurship',
  'Creative Arts': 'Design, Media, Performing Arts and Communication',
  Education: 'Teaching, Training and Educational Development',
  'Social Sciences': 'Psychology, Sociology and Community Development',
  Law: 'Legal Studies, Human Rights and Governance',
  Agriculture: 'Agricultural Sciences, Environmental Studies and Conservation',
  Engineering: 'Civil, Electrical, Mechanical and Industrial Engineering',
};

const CLUSTER_CAREERS: Record<string, string[]> = {
  STEM: ['Software Developer', 'Data Scientist', 'Actuary'],
  'Health Sciences': ['Doctor', 'Nurse', 'Pharmacist'],
  Business: ['Accountant', 'Marketing Manager', 'Quantity Surveyor'],
  'Creative Arts': ['Graphic Designer', 'Journalist', 'Architect'],
  Education: ['Teacher', 'Educational Psychologist'],
  'Social Sciences': ['Psychologist', 'Social Worker'],
  Law: ['Lawyer', 'Legal Advisor'],
  Agriculture: ['Agricultural Scientist', 'Environmental Scientist'],
  Engineering: ['Engineer (Civil)', 'Engineer (Electrical)'],
};

const PERSONALITY_MAP: Record<string, string> = {
  STEM: 'Analytical Thinker',
  'Health Sciences': 'Compassionate Caregiver',
  Business: 'Strategic Leader',
  'Creative Arts': 'Creative Innovator',
  Education: 'Nurturing Mentor',
  'Social Sciences': 'Empathetic Helper',
  Law: 'Persuasive Advocate',
  Agriculture: 'Practical Naturalist',
  Engineering: 'Systematic Builder',
};

// ─── Service ──────────────────────────────────────────────────────────────

export class AptitudeService {
  static getQuestions() {
    return {
      sections: APTITUDE_SECTIONS,
      totalQuestions: 40,
      estimatedMinutes: 30,
    };
  }

  static async submit(
    studentId: string,
    schoolId: string,
    answers: AnswerInput[],
  ): Promise<IAptitudeResult> {
    const answerMap = new Map<string, number>();
    for (const a of answers) {
      answerMap.set(a.questionId, a.value);
    }

    // Score clusters
    const clusterScores: { name: string; rawScore: number }[] = [];
    for (const [cluster, questionIds] of Object.entries(CLUSTER_QUESTIONS)) {
      let total = 0;
      let count = 0;
      for (const qId of questionIds) {
        const val = answerMap.get(qId);
        if (val !== undefined) {
          total += val;
          count++;
        }
      }
      const normalized = count > 0 ? Math.round((total / (count * 5)) * 100) : 0;
      clusterScores.push({ name: cluster, rawScore: normalized });
    }

    // Sort and rank
    clusterScores.sort(
      (a: { name: string; rawScore: number }, b: { name: string; rawScore: number }) =>
        b.rawScore - a.rawScore,
    );

    const clusters = clusterScores.map(
      (c: { name: string; rawScore: number }, idx: number) => ({
        name: c.name,
        score: c.rawScore,
        rank: idx + 1,
        description: CLUSTER_DESCRIPTIONS[c.name] ?? c.name,
      }),
    );

    const topCluster = clusters[0]?.name ?? 'STEM';
    const personalityType = PERSONALITY_MAP[topCluster] ?? 'Analytical Thinker';
    const suggestedCareers = CLUSTER_CAREERS[topCluster] ?? [];

    // Upsert result
    const result = await AptitudeResult.findOneAndUpdate(
      { studentId },
      {
        studentId,
        schoolId,
        answers,
        clusters,
        personalityType,
        suggestedCareers,
        completedAt: new Date(),
        isDeleted: false,
      },
      { new: true, upsert: true },
    );

    return result;
  }

  static async getResults(studentId: string): Promise<IAptitudeResult | null> {
    return AptitudeResult.findOne({ studentId, isDeleted: false }).lean();
  }
}
