import { StudentPortfolio, Programme, AptitudeResult } from '../model.js';
import { NotFoundError } from '../../../common/errors.js';

// ─── Types ────────────────────────────────────────────────────────────────

interface SubjectCombination {
  name: string;
  subjects: string[];
  qualifyingProgrammes: number;
}

interface Warning {
  subject: string;
  impact: string;
}

interface Recommendation {
  subjectCombination: string[];
  reasoning: string;
  programmesUnlocked: number;
  careerPaths: string[];
}

interface AdviceResult {
  aptitudeTopCluster: string | null;
  currentPerformance: Record<string, number>;
  recommendations: Recommendation[];
  warnings: Warning[];
}

// ─── Subject Combination Templates ────────────────────────────────────────

const SUBJECT_COMBINATIONS: SubjectCombination[] = [
  {
    name: 'STEM & IT',
    subjects: ['Mathematics', 'Physical Sciences', 'Information Technology', 'Accounting'],
    qualifyingProgrammes: 0,
  },
  {
    name: 'Health Sciences',
    subjects: ['Mathematics', 'Physical Sciences', 'Life Sciences', 'Geography'],
    qualifyingProgrammes: 0,
  },
  {
    name: 'Commerce',
    subjects: ['Mathematics', 'Accounting', 'Business Studies', 'Economics'],
    qualifyingProgrammes: 0,
  },
  {
    name: 'Humanities & Tourism',
    subjects: ['Mathematical Literacy', 'Tourism', 'History', 'Geography'],
    qualifyingProgrammes: 0,
  },
  {
    name: 'Law & Social Sciences',
    subjects: ['Mathematics', 'History', 'Geography', 'Life Sciences'],
    qualifyingProgrammes: 0,
  },
  {
    name: 'Engineering',
    subjects: ['Mathematics', 'Physical Sciences', 'Engineering Graphics and Design', 'Information Technology'],
    qualifyingProgrammes: 0,
  },
];

// ─── Career Path Mapping ─────────────────────────────────────────────────

const COMBINATION_CAREER_PATHS: Record<string, string[]> = {
  'STEM & IT': ['Software Engineer', 'Data Scientist', 'IT Consultant', 'Actuary'],
  'Health Sciences': ['Doctor', 'Pharmacist', 'Physiotherapist', 'Biomedical Scientist'],
  'Commerce': ['Chartered Accountant', 'Financial Analyst', 'Economist', 'Business Manager'],
  'Humanities & Tourism': ['Tourism Manager', 'Hospitality Manager', 'Journalist', 'Social Worker'],
  'Law & Social Sciences': ['Lawyer', 'Psychologist', 'Political Analyst', 'Policy Researcher'],
  'Engineering': ['Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Industrial Engineer'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────

function computeTrend(terms: { term: number; percentage: number }[]): 'improving' | 'stable' | 'declining' {
  if (terms.length < 2) return 'stable';
  const sorted = [...terms].sort(
    (a: { term: number; percentage: number }, b: { term: number; percentage: number }) =>
      a.term - b.term,
  );
  const first = sorted[0].percentage;
  const last = sorted[sorted.length - 1].percentage;
  const diff = last - first;
  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
}

// ─── Service ──────────────────────────────────────────────────────────────

export class SubjectAdvisorService {
  static async getAdvice(studentId: string, schoolId?: string): Promise<AdviceResult> {
    // 1. Get student portfolio
    const portfolioFilter: Record<string, unknown> = { studentId, isDeleted: false };
    if (schoolId) portfolioFilter.schoolId = schoolId;
    const portfolio = await StudentPortfolio.findOne(portfolioFilter).lean();

    if (!portfolio || portfolio.academicHistory.length === 0) {
      throw new NotFoundError('No academic history found for student');
    }

    const sorted = [...portfolio.academicHistory].sort(
      (a, b) => b.year - a.year,
    );
    const latest = sorted[0];

    // 2. Get aptitude results if available
    const aptitudeFilter: Record<string, unknown> = { studentId, isDeleted: false };
    if (schoolId) aptitudeFilter.schoolId = schoolId;
    const aptitude = await AptitudeResult.findOne(aptitudeFilter).lean();

    const aptitudeTopCluster = aptitude?.clusters?.length
      ? [...aptitude.clusters].sort(
          (a, b) => a.rank - b.rank,
        )[0]?.name ?? null
      : null;

    // 3. Current performance as Record<subjectName, percentage>
    const currentPerformance: Record<string, number> = Object.fromEntries(
      latest.subjects.map((s) => [s.name, s.finalPercentage]),
    );

    // Track trends for warning generation
    const subjectTrends = latest.subjects.map((s) => ({
      name: s.name,
      percentage: s.finalPercentage,
      trend: computeTrend(
        s.terms.map((t) => ({ term: t.term, percentage: t.percentage })),
      ),
    }));

    // 4. For each combination, count qualifying programmes
    const studentSubjectNames = new Set(
      latest.subjects.map((s) => s.name.toLowerCase()),
    );

    const recommendations: Recommendation[] = [];

    for (const combo of SUBJECT_COMBINATIONS) {
      // Count programmes where all compulsory requirements are in this combo
      const count = await Programme.countDocuments({
        isActive: true,
        isDeleted: false,
        'subjectRequirements': {
          $not: {
            $elemMatch: {
              isCompulsory: true,
              subjectName: {
                $nin: combo.subjects,
              },
            },
          },
        },
      });

      // Build reasoning based on aptitude alignment
      let reasoning = `Qualifies for ${count} programmes.`;
      if (aptitudeTopCluster) {
        const comboNameLower = combo.name.toLowerCase();
        const clusterLower = aptitudeTopCluster.toLowerCase();
        if (
          comboNameLower.includes(clusterLower) ||
          clusterLower.includes(comboNameLower.split(' ')[0])
        ) {
          reasoning += ` Aligns with your aptitude for ${aptitudeTopCluster}.`;
        }
      }

      recommendations.push({
        subjectCombination: combo.subjects,
        reasoning,
        programmesUnlocked: count,
        careerPaths: COMBINATION_CAREER_PATHS[combo.name] ?? [],
      });
    }

    // Sort by programmesUnlocked descending
    recommendations.sort(
      (a: Recommendation, b: Recommendation) =>
        b.programmesUnlocked - a.programmesUnlocked,
    );

    // 5. Generate warnings
    const warnings: Warning[] = [];

    // Check Maths vs Maths Lit
    const hasMathsLit = latest.subjects.some(
      (s) => s.name.toLowerCase().includes('mathematical literacy'),
    );
    const hasMaths = latest.subjects.some(
      (s) =>
        s.name.toLowerCase() === 'mathematics' ||
        (s.name.toLowerCase().includes('mathematics') &&
          !s.name.toLowerCase().includes('literacy')),
    );

    if (hasMathsLit && !hasMaths) {
      warnings.push({
        subject: 'Mathematical Literacy',
        impact:
          'Taking Mathematical Literacy instead of Mathematics significantly limits university programme options, especially in STEM, Engineering, Commerce, and Health Sciences.',
      });
    }

    // Check for subjects with declining performance
    const declining = subjectTrends.filter(
      (s: { name: string; percentage: number; trend: string }) => s.trend === 'declining',
    );
    for (const s of declining) {
      warnings.push({
        subject: s.name,
        impact: `Performance is declining (currently ${s.percentage}%). Consider seeking extra help.`,
      });
    }

    // Check for low-performing core subjects
    const lowPerformers = latest.subjects.filter(
      (s) =>
        s.level === 'core' && s.finalPercentage < 40,
    );
    for (const s of lowPerformers) {
      warnings.push({
        subject: s.name,
        impact: `Below 40% in this core subject. This may affect your NSC pass.`,
      });
    }

    // Check if student has no Physical Sciences (limits STEM/Health)
    const hasPhysics = studentSubjectNames.has('physical sciences');
    if (!hasPhysics) {
      warnings.push({
        subject: 'Physical Sciences',
        impact:
          'Not taking Physical Sciences limits options in Engineering, Health Sciences, and some STEM programmes.',
      });
    }

    return {
      aptitudeTopCluster,
      currentPerformance,
      recommendations,
      warnings,
    };
  }
}
