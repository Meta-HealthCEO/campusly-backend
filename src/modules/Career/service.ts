/**
 * Career module service barrel — re-exports all sub-service methods under a
 * single CareerModuleService class so the controller has one import target.
 *
 * Implementation is split across:
 *   - services/portfolio.service.ts    (Portfolio, Snapshot, Extracurricular, Community Service, Transcript)
 *   - services/aps.service.ts          (APS calculation + simulation)
 *   - services/university.service.ts   (University CRUD)
 *   - services/programme.service.ts    (Programme CRUD + CSV import)
 *   - services/matcher.service.ts      (Programme matching for students)
 *   - services/application.service.ts  (Application CRUD + documents + prefill + deadlines)
 *   - services/aptitude.service.ts     (Aptitude test questions, submission, results)
 *   - services/career.service.ts       (Career explorer listing)
 *   - services/subjectAdvisor.service.ts (Subject choice advice)
 *   - services/bursary.service.ts      (Bursary CRUD + matching + CSV import)
 */
import { PortfolioService } from './services/portfolio.service.js';
import { APSService } from './services/aps.service.js';
import { UniversityService } from './services/university.service.js';
import { ProgrammeService } from './services/programme.service.js';
import { MatcherService } from './services/matcher.service.js';
import { ApplicationService } from './services/application.service.js';
import { AptitudeService } from './services/aptitude.service.js';
import { CareerService } from './services/career.service.js';
import { SubjectAdvisorService } from './services/subjectAdvisor.service.js';
import { BursaryService } from './services/bursary.service.js';

export class CareerModuleService {
  // ─── Portfolio ──────────────────────────────────────────────────────────────
  static getPortfolio = PortfolioService.getPortfolio;
  static createSnapshot = PortfolioService.createSnapshot;
  static addExtracurricular = PortfolioService.addExtracurricular;
  static addCommunityService = PortfolioService.addCommunityService;
  static generateTranscript = PortfolioService.generateTranscript;

  // ─── APS ────────────────────────────────────────────────────────────────────
  static getAPS = APSService.getAPS;
  static simulateAPS = APSService.simulate;

  // ─── Universities ───────────────────────────────────────────────────────────
  static listUniversities = UniversityService.list;
  static getUniversityById = UniversityService.getById;
  static createUniversity = UniversityService.create;
  static updateUniversity = UniversityService.update;

  // ─── Programmes ─────────────────────────────────────────────────────────────
  static listProgrammes = ProgrammeService.list;
  static getProgrammeById = ProgrammeService.getById;
  static createProgramme = ProgrammeService.create;
  static updateProgramme = ProgrammeService.update;
  static importProgrammes = ProgrammeService.importFromCSV;

  // ─── Matcher ────────────────────────────────────────────────────────────────
  static matchProgrammes = MatcherService.matchProgrammes;

  // ─── Applications ───────────────────────────────────────────────────────────
  static createApplication = ApplicationService.create;
  static listApplications = ApplicationService.listByStudent;
  static updateApplication = ApplicationService.update;
  static addApplicationDocument = ApplicationService.addDocument;
  static getApplicationPrefill = ApplicationService.getPrefill;
  static getDeadlines = ApplicationService.getDeadlines;

  // ─── Aptitude ───────────────────────────────────────────────────────────────
  static getAptitudeQuestions = AptitudeService.getQuestions;
  static submitAptitude = AptitudeService.submit;
  static getAptitudeResults = AptitudeService.getResults;

  // ─── Career Explorer ────────────────────────────────────────────────────────
  static listCareers = CareerService.list;

  // ─── Subject Advisor ────────────────────────────────────────────────────────
  static getSubjectAdvice = SubjectAdvisorService.getAdvice;

  // ─── Bursaries ──────────────────────────────────────────────────────────────
  static listBursaries = BursaryService.list;
  static getBursaryById = BursaryService.getById;
  static createBursary = BursaryService.create;
  static updateBursary = BursaryService.update;
  static matchBursaries = BursaryService.matchForStudent;
  static importBursaries = BursaryService.importFromCSV;
}

// Also export sub-services for direct import
export { PortfolioService } from './services/portfolio.service.js';
export { APSService } from './services/aps.service.js';
export { UniversityService } from './services/university.service.js';
export { ProgrammeService } from './services/programme.service.js';
export { MatcherService } from './services/matcher.service.js';
export { ApplicationService } from './services/application.service.js';
export { AptitudeService } from './services/aptitude.service.js';
export { CareerService } from './services/career.service.js';
export { SubjectAdvisorService } from './services/subjectAdvisor.service.js';
export { BursaryService } from './services/bursary.service.js';
