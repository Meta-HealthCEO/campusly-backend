import { Programme } from '../model.js';

// ─── Types ────────────────────────────────────────────────────────────────

interface SalaryRange {
  entry: number;
  mid: number;
  senior: number;
}

type Demand = 'growing' | 'stable' | 'declining';

interface Career {
  name: string;
  cluster: string;
  description: string;
  salaryRange: SalaryRange;
  demand: Demand;
  requiredQualification: string;
  linkedProgrammeCount: number;
  skills: string[];
}

interface CareerFilters {
  cluster?: string;
  search?: string;
}

// ─── Hardcoded Career Data ────────────────────────────────────────────────

const CAREERS: Career[] = [
  {
    name: 'Software Developer',
    cluster: 'STEM',
    description: 'Design, build, and maintain software applications and systems for businesses and consumers.',
    salaryRange: { entry: 18000000, mid: 45000000, senior: 90000000 },
    demand: 'growing',
    requiredQualification: 'BSc Computer Science, BEng Software Engineering, or Diploma in IT',
    linkedProgrammeCount: 0,
    skills: ['Programming', 'Problem-solving', 'Teamwork', 'Logical thinking'],
  },
  {
    name: 'Data Scientist',
    cluster: 'STEM',
    description: 'Analyse large datasets to extract insights and build predictive models for decision-making.',
    salaryRange: { entry: 20000000, mid: 50000000, senior: 95000000 },
    demand: 'growing',
    requiredQualification: 'BSc Mathematics, Statistics, Computer Science, or Data Science',
    linkedProgrammeCount: 0,
    skills: ['Statistics', 'Machine learning', 'Python/R', 'Data visualisation'],
  },
  {
    name: 'Doctor',
    cluster: 'Health Sciences',
    description: 'Diagnose and treat illnesses, prescribe medication, and promote preventative health care.',
    salaryRange: { entry: 30000000, mid: 80000000, senior: 150000000 },
    demand: 'growing',
    requiredQualification: 'MBChB (Bachelor of Medicine and Surgery)',
    linkedProgrammeCount: 0,
    skills: ['Clinical reasoning', 'Empathy', 'Communication', 'Attention to detail'],
  },
  {
    name: 'Nurse',
    cluster: 'Health Sciences',
    description: 'Provide direct patient care, administer treatments, and support doctors in clinical settings.',
    salaryRange: { entry: 12000000, mid: 25000000, senior: 45000000 },
    demand: 'growing',
    requiredQualification: 'BCur Nursing or Diploma in Nursing',
    linkedProgrammeCount: 0,
    skills: ['Patient care', 'Communication', 'Resilience', 'Teamwork'],
  },
  {
    name: 'Accountant',
    cluster: 'Business',
    description: 'Prepare financial statements, manage budgets, conduct audits, and ensure regulatory compliance.',
    salaryRange: { entry: 15000000, mid: 40000000, senior: 80000000 },
    demand: 'stable',
    requiredQualification: 'BCom Accounting or BAcc',
    linkedProgrammeCount: 0,
    skills: ['Financial analysis', 'Attention to detail', 'Excel', 'Regulatory knowledge'],
  },
  {
    name: 'Lawyer',
    cluster: 'Law',
    description: 'Advise clients on legal matters, represent them in court, and draft legal documents.',
    salaryRange: { entry: 15000000, mid: 45000000, senior: 120000000 },
    demand: 'stable',
    requiredQualification: 'LLB (Bachelor of Laws)',
    linkedProgrammeCount: 0,
    skills: ['Legal research', 'Argumentation', 'Writing', 'Critical thinking'],
  },
  {
    name: 'Teacher',
    cluster: 'Education',
    description: 'Educate learners in schools, develop lesson plans, assess student progress, and provide mentorship.',
    salaryRange: { entry: 12000000, mid: 25000000, senior: 45000000 },
    demand: 'stable',
    requiredQualification: 'BEd (Bachelor of Education) or PGCE',
    linkedProgrammeCount: 0,
    skills: ['Communication', 'Patience', 'Organisation', 'Subject knowledge'],
  },
  {
    name: 'Engineer (Civil)',
    cluster: 'Engineering',
    description: 'Design and oversee construction of infrastructure such as roads, bridges, and buildings.',
    salaryRange: { entry: 18000000, mid: 45000000, senior: 90000000 },
    demand: 'growing',
    requiredQualification: 'BEng Civil Engineering or BSc Eng Civil',
    linkedProgrammeCount: 0,
    skills: ['Structural analysis', 'Project management', 'CAD software', 'Mathematics'],
  },
  {
    name: 'Engineer (Electrical)',
    cluster: 'Engineering',
    description: 'Design, develop, and maintain electrical systems, power generation, and electronic devices.',
    salaryRange: { entry: 18000000, mid: 48000000, senior: 95000000 },
    demand: 'growing',
    requiredQualification: 'BEng Electrical Engineering or BSc Eng Electrical',
    linkedProgrammeCount: 0,
    skills: ['Circuit design', 'Power systems', 'Problem-solving', 'Mathematics'],
  },
  {
    name: 'Architect',
    cluster: 'Creative Arts',
    description: 'Design buildings and spaces that are functional, safe, and aesthetically pleasing.',
    salaryRange: { entry: 15000000, mid: 40000000, senior: 80000000 },
    demand: 'stable',
    requiredQualification: 'BArch (Bachelor of Architecture)',
    linkedProgrammeCount: 0,
    skills: ['Design', 'CAD/3D modelling', 'Spatial awareness', 'Project management'],
  },
  {
    name: 'Psychologist',
    cluster: 'Social Sciences',
    description: 'Study human behaviour, conduct therapy, and help individuals cope with mental health challenges.',
    salaryRange: { entry: 15000000, mid: 35000000, senior: 70000000 },
    demand: 'growing',
    requiredQualification: 'BA/BSc Psychology + Honours + Masters in Clinical/Counselling Psychology',
    linkedProgrammeCount: 0,
    skills: ['Active listening', 'Empathy', 'Research', 'Communication'],
  },
  {
    name: 'Marketing Manager',
    cluster: 'Business',
    description: 'Develop marketing strategies, manage campaigns, and drive brand awareness and sales growth.',
    salaryRange: { entry: 15000000, mid: 40000000, senior: 75000000 },
    demand: 'stable',
    requiredQualification: 'BCom Marketing or BA Communication',
    linkedProgrammeCount: 0,
    skills: ['Digital marketing', 'Analytics', 'Creativity', 'Communication'],
  },
  {
    name: 'Journalist',
    cluster: 'Creative Arts',
    description: 'Research, investigate, and report news stories across print, broadcast, and digital media.',
    salaryRange: { entry: 10000000, mid: 25000000, senior: 50000000 },
    demand: 'declining',
    requiredQualification: 'BA Journalism and Media Studies or BA Communication',
    linkedProgrammeCount: 0,
    skills: ['Writing', 'Research', 'Interviewing', 'Digital media'],
  },
  {
    name: 'Graphic Designer',
    cluster: 'Creative Arts',
    description: 'Create visual content for branding, advertising, websites, and print media.',
    salaryRange: { entry: 10000000, mid: 25000000, senior: 50000000 },
    demand: 'stable',
    requiredQualification: 'BA Graphic Design or Diploma in Graphic Design',
    linkedProgrammeCount: 0,
    skills: ['Adobe Creative Suite', 'Typography', 'Layout design', 'Creativity'],
  },
  {
    name: 'Environmental Scientist',
    cluster: 'Agriculture',
    description: 'Study environmental issues, conduct impact assessments, and develop conservation strategies.',
    salaryRange: { entry: 14000000, mid: 30000000, senior: 60000000 },
    demand: 'growing',
    requiredQualification: 'BSc Environmental Science or BSc Geography',
    linkedProgrammeCount: 0,
    skills: ['Research', 'GIS', 'Data analysis', 'Fieldwork'],
  },
  {
    name: 'Pharmacist',
    cluster: 'Health Sciences',
    description: 'Dispense medication, advise patients on drug interactions, and ensure safe use of pharmaceuticals.',
    salaryRange: { entry: 20000000, mid: 40000000, senior: 70000000 },
    demand: 'stable',
    requiredQualification: 'BPharm (Bachelor of Pharmacy)',
    linkedProgrammeCount: 0,
    skills: ['Pharmaceutical knowledge', 'Attention to detail', 'Patient counselling', 'Chemistry'],
  },
  {
    name: 'Actuary',
    cluster: 'STEM',
    description: 'Use mathematics and statistics to assess financial risk for insurance and investment companies.',
    salaryRange: { entry: 25000000, mid: 65000000, senior: 150000000 },
    demand: 'growing',
    requiredQualification: 'BSc Actuarial Science',
    linkedProgrammeCount: 0,
    skills: ['Mathematics', 'Statistics', 'Financial modelling', 'Problem-solving'],
  },
  {
    name: 'Quantity Surveyor',
    cluster: 'Business',
    description: 'Manage construction costs, prepare tenders, and ensure projects stay within budget.',
    salaryRange: { entry: 16000000, mid: 40000000, senior: 80000000 },
    demand: 'stable',
    requiredQualification: 'BSc Quantity Surveying',
    linkedProgrammeCount: 0,
    skills: ['Cost estimation', 'Contract management', 'Attention to detail', 'Negotiation'],
  },
  {
    name: 'Social Worker',
    cluster: 'Social Sciences',
    description: 'Support vulnerable individuals and communities through counselling, advocacy, and resource coordination.',
    salaryRange: { entry: 10000000, mid: 22000000, senior: 40000000 },
    demand: 'growing',
    requiredQualification: 'BSW (Bachelor of Social Work)',
    linkedProgrammeCount: 0,
    skills: ['Empathy', 'Case management', 'Community engagement', 'Resilience'],
  },
  {
    name: 'Agricultural Scientist',
    cluster: 'Agriculture',
    description: 'Research farming methods, develop crop varieties, and improve agricultural productivity.',
    salaryRange: { entry: 14000000, mid: 30000000, senior: 55000000 },
    demand: 'growing',
    requiredQualification: 'BSc Agriculture or BAgric',
    linkedProgrammeCount: 0,
    skills: ['Research', 'Biology', 'Data analysis', 'Fieldwork'],
  },
];

// ─── Service ──────────────────────────────────────────────────────────────

export class CareerService {
  static async list(filters: CareerFilters): Promise<Career[]> {
    let results = [...CAREERS];

    if (filters.cluster) {
      const clusterLower = filters.cluster.toLowerCase();
      results = results.filter(
        (c: Career) => c.cluster.toLowerCase() === clusterLower,
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(
        (c: Career) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower) ||
          c.skills.some((s: string) => s.toLowerCase().includes(searchLower)),
      );
    }

    // Compute linkedProgrammeCount for each career from DB
    const careerNames = results.map((c: Career) => c.name);
    const programmeCounts = await Programme.aggregate([
      { $match: { isActive: true, isDeleted: false } },
      { $unwind: '$careerOutcomes' },
      { $match: { careerOutcomes: { $in: careerNames } } },
      { $group: { _id: '$careerOutcomes', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    for (const entry of programmeCounts as { _id: string; count: number }[]) {
      countMap.set(entry._id, entry.count);
    }

    return results.map((c: Career) => ({
      ...c,
      linkedProgrammeCount: countMap.get(c.name) ?? 0,
    }));
  }
}
