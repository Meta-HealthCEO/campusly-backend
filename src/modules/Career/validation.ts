import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// ---------------------------------------------------------------------------
// 1. Portfolio operations
// ---------------------------------------------------------------------------

export const addExtracurricularSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  activity: z.string().min(1).trim(),
  role: z.string().min(1).trim(),
  description: z.string().optional().default(''),
  verifiedBy: z.string().regex(objectIdRegex).optional(),
}).strict();

export type AddExtracurricularInput = z.infer<typeof addExtracurricularSchema>;

export const addCommunityServiceSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  organization: z.string().min(1).trim(),
  hours: z.number().int().min(1),
  description: z.string().optional().default(''),
  verifiedBy: z.string().regex(objectIdRegex).optional(),
}).strict();

export type AddCommunityServiceInput = z.infer<typeof addCommunityServiceSchema>;

export const createSnapshotSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  grade: z.string().min(1).trim(),
  subjects: z.array(z.object({
    subjectId: z.string().regex(objectIdRegex),
    name: z.string().min(1),
    level: z.enum(['core', 'home_language', 'first_additional_language', 'second_additional_language']),
    code: z.string().min(1),
    terms: z.array(z.object({
      term: z.number().int().min(1).max(4),
      percentage: z.number().min(0).max(100),
    })).optional().default([]),
    finalPercentage: z.number().min(0).max(100),
  })).min(1),
  promoted: z.boolean(),
  promotionStatus: z.enum(['promoted', 'condoned', 'retained']).optional().default('promoted'),
}).strict();

export type CreateSnapshotInput = z.infer<typeof createSnapshotSchema>;

// ---------------------------------------------------------------------------
// 2. APS simulation
// ---------------------------------------------------------------------------

export const apsSimulateSchema = z.object({
  adjustments: z.array(z.object({
    subjectId: z.string().regex(objectIdRegex),
    hypotheticalPercentage: z.number().min(0).max(100),
  })).min(1),
}).strict();

export type ApsSimulateInput = z.infer<typeof apsSimulateSchema>;

// ---------------------------------------------------------------------------
// 3. University CRUD
// ---------------------------------------------------------------------------

export const createUniversitySchema = z.object({
  name: z.string().min(1).trim(),
  shortName: z.string().min(1).trim(),
  type: z.enum(['traditional', 'comprehensive', 'university_of_technology', 'tvet', 'private']),
  province: z.string().min(1).trim(),
  city: z.string().min(1).trim(),
  logo: z.string().optional(),
  website: z.string().optional(),
  applicationPortalUrl: z.string().optional(),
  applicationOpenDate: z.string().optional(),
  applicationCloseDate: z.string().optional(),
  applicationFee: z.number().min(0).optional().default(0),
  generalRequirements: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
}).strict();

export type CreateUniversityInput = z.infer<typeof createUniversitySchema>;

export const updateUniversitySchema = createUniversitySchema.partial().strict();

export type UpdateUniversityInput = z.infer<typeof updateUniversitySchema>;

// ---------------------------------------------------------------------------
// 4. Programme CRUD
// ---------------------------------------------------------------------------

export const createProgrammeSchema = z.object({
  universityId: z.string().regex(objectIdRegex),
  faculty: z.string().min(1).trim(),
  department: z.string().optional(),
  name: z.string().min(1).trim(),
  qualificationType: z.enum(['bachelor', 'diploma', 'higher_certificate', 'postgrad_diploma']),
  duration: z.string().min(1).trim(),
  minimumAPS: z.number().int().min(0).max(42),
  subjectRequirements: z.array(z.object({
    subjectName: z.string().min(1),
    minimumPercentage: z.number().min(0).max(100),
    isCompulsory: z.boolean(),
  })).optional().default([]),
  nbtRequired: z.object({ al: z.boolean(), ql: z.boolean(), mat: z.boolean() }).optional(),
  nbtMinimumScores: z.object({ al: z.number().optional(), ql: z.number().optional(), mat: z.number().optional() }).optional(),
  careerOutcomes: z.array(z.string()).optional().default([]),
  annualTuition: z.number().min(0).optional(),
  linkedBursaries: z.array(z.string()).optional().default([]),
  applicationDeadline: z.string().optional(),
  additionalNotes: z.string().optional(),
}).strict();

export type CreateProgrammeInput = z.infer<typeof createProgrammeSchema>;

export const updateProgrammeSchema = createProgrammeSchema.partial().strict();

export type UpdateProgrammeInput = z.infer<typeof updateProgrammeSchema>;

// ---------------------------------------------------------------------------
// 5. Application
// ---------------------------------------------------------------------------

export const createApplicationSchema = z.object({
  programmeId: z.string().regex(objectIdRegex),
  notes: z.string().optional(),
}).strict();

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

export const updateApplicationSchema = z.object({
  status: z.enum(['draft', 'submitted', 'acknowledged', 'accepted', 'waitlisted', 'rejected']).optional(),
  applicationReference: z.string().optional(),
  notes: z.string().optional(),
}).strict();

export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

// ---------------------------------------------------------------------------
// 6. Aptitude
// ---------------------------------------------------------------------------

export const submitAptitudeSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().min(1),
    value: z.number().int().min(1).max(5),
  })).min(1),
}).strict();

export type SubmitAptitudeInput = z.infer<typeof submitAptitudeSchema>;

// ---------------------------------------------------------------------------
// 7. Bursary CRUD
// ---------------------------------------------------------------------------

export const createBursarySchema = z.object({
  name: z.string().min(1).trim(),
  provider: z.string().min(1).trim(),
  description: z.string().optional(),
  eligibilityCriteria: z.string().optional(),
  minimumAPS: z.number().min(0).max(42).optional(),
  fieldOfStudy: z.array(z.string()).optional().default(['any']),
  coverageDetails: z.string().optional(),
  applicationOpenDate: z.string().optional(),
  applicationCloseDate: z.string().optional(),
  applicationUrl: z.string().optional(),
  annualValue: z.number().min(0).optional(),
}).strict();

export type CreateBursaryInput = z.infer<typeof createBursarySchema>;

export const updateBursarySchema = createBursarySchema.partial().strict();

export type UpdateBursaryInput = z.infer<typeof updateBursarySchema>;

// ---------------------------------------------------------------------------
// 8. Document upload
// ---------------------------------------------------------------------------

export const addDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required').trim(),
  type: z.enum(['id_copy', 'transcript', 'proof_of_payment', 'motivation_letter', 'other']),
}).strict();

export type AddDocumentInput = z.infer<typeof addDocumentSchema>;
