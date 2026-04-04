import {
  MigrationJob,
  MigrationTemplate,
  type IMigrationJob,
  type IMigrationTemplate,
  type IValidationError,
  type IFieldMapping,
} from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';

// ─── Pre-built column mappers for SA school systems ────────────────────────────

const D6_STUDENT_MAPPINGS: IFieldMapping[] = [
  { sourceField: 'Learner Name', targetField: 'firstName' },
  { sourceField: 'Learner Surname', targetField: 'lastName' },
  { sourceField: 'ID Number', targetField: 'saIdNumber' },
  { sourceField: 'Date of Birth', targetField: 'dateOfBirth', transform: 'parseDate' },
  { sourceField: 'Grade', targetField: 'grade' },
  { sourceField: 'Class', targetField: 'class' },
  { sourceField: 'Gender', targetField: 'gender', transform: 'lowercase' },
  { sourceField: 'Home Language', targetField: 'homeLanguage' },
  { sourceField: 'Admission Number', targetField: 'admissionNumber' },
];

const KARRI_STUDENT_MAPPINGS: IFieldMapping[] = [
  { sourceField: 'first_name', targetField: 'firstName' },
  { sourceField: 'last_name', targetField: 'lastName' },
  { sourceField: 'id_number', targetField: 'saIdNumber' },
  { sourceField: 'dob', targetField: 'dateOfBirth', transform: 'parseDate' },
  { sourceField: 'grade_name', targetField: 'grade' },
  { sourceField: 'class_name', targetField: 'class' },
  { sourceField: 'gender', targetField: 'gender', transform: 'lowercase' },
  { sourceField: 'parent_email', targetField: 'parentEmail' },
  { sourceField: 'parent_phone', targetField: 'parentPhone' },
];

const ADAM_STUDENT_MAPPINGS: IFieldMapping[] = [
  { sourceField: 'FirstName', targetField: 'firstName' },
  { sourceField: 'Surname', targetField: 'lastName' },
  { sourceField: 'IDNumber', targetField: 'saIdNumber' },
  { sourceField: 'DateOfBirth', targetField: 'dateOfBirth', transform: 'parseDate' },
  { sourceField: 'GradeName', targetField: 'grade' },
  { sourceField: 'ClassName', targetField: 'class' },
  { sourceField: 'Sex', targetField: 'gender', transform: 'lowercase' },
  { sourceField: 'AdmissionNo', targetField: 'admissionNumber' },
  { sourceField: 'LURITSNo', targetField: 'luritsNumber' },
];

const SOURCE_MAPPERS: Record<string, IFieldMapping[]> = {
  d6_connect: D6_STUDENT_MAPPINGS,
  karri: KARRI_STUDENT_MAPPINGS,
  adam: ADAM_STUDENT_MAPPINGS,
};

// ─── SA ID Validation ──────────────────────────────────────────────────────────

function isValidSaId(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false;
  const digits = id.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const d = digits[i]!;
    if (i % 2 === 0) {
      sum += d;
    } else {
      const doubled = d * 2;
      sum += doubled > 9 ? doubled - 9 : doubled;
    }
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === digits[12];
}

// ─── Pagination ────────────────────────────────────────────────────────────────

interface ListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  schoolId?: string;
  status?: string;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function getPagination(query: ListQuery) {
  const page = Math.max(query.page ?? PAGINATION_DEFAULTS.page, 1);
  const limit = Math.min(
    Math.max(query.limit ?? PAGINATION_DEFAULTS.limit, 1),
    PAGINATION_DEFAULTS.maxLimit,
  );
  const skip = (page - 1) * limit;
  const sortField = query.sort ?? '-createdAt';
  return { page, limit, skip, sortField };
}

// ─── Service ───────────────────────────────────────────────────────────────────

export class MigrationService {
  // ─── Upload / Create Job ───────────────────────────────────────────────
  static async uploadFile(
    schoolId: string,
    sourceSystem: string,
    file: { originalName: string; fileUrl: string; fileSize: number },
    performedBy: string,
  ): Promise<IMigrationJob> {
    // Auto-apply default mapping from known source systems
    const defaultMapping: Record<string, string> = {};
    const knownMappings = SOURCE_MAPPERS[sourceSystem];
    if (knownMappings) {
      for (const m of knownMappings) {
        defaultMapping[m.sourceField] = m.targetField;
      }
    }

    const job = new MigrationJob({
      schoolId,
      sourceSystem,
      uploadedFile: file,
      mapping: defaultMapping,
      performedBy,
    });

    return job.save();
  }

  // ─── Validate Data ────────────────────────────────────────────────────
  static async validateData(jobId: string, schoolId: string): Promise<IMigrationJob> {
    const job = await MigrationJob.findOne({ _id: jobId, schoolId, isDeleted: false });
    if (!job) throw new NotFoundError('Migration job not found');

    if (job.status !== 'pending' && job.status !== 'validating') {
      throw new BadRequestError('Job cannot be validated in its current status');
    }

    job.status = 'validating';
    job.startedAt = new Date();

    // Simulated validation: parse file metadata and check mapping coverage
    // In production this would parse the actual CSV/Excel file
    const errors: IValidationError[] = [];
    const mappingKeys = Object.keys(job.mapping);

    if (mappingKeys.length === 0) {
      errors.push({ row: 0, field: 'mapping', message: 'No field mappings configured' });
    }

    // Check that required target fields are mapped
    const requiredTargets = ['firstName', 'lastName'];
    for (const target of requiredTargets) {
      if (!Object.values(job.mapping).includes(target)) {
        errors.push({ row: 0, field: target, message: `Required field '${target}' is not mapped` });
      }
    }

    // Simulate row-level validation
    const totalRows = Math.max(1, Math.floor(job.uploadedFile.fileSize / 100));
    const invalidRows = errors.length > 0 ? Math.ceil(totalRows * 0.05) : 0;
    const duplicates = Math.floor(totalRows * 0.02);

    // Validate SA ID fields if mapped
    if (Object.values(job.mapping).includes('saIdNumber')) {
      // Placeholder: in production, iterate actual rows and call isValidSaId
      void isValidSaId; // reference to suppress unused warning in compilation
    }

    job.validationResults = {
      totalRows,
      validRows: totalRows - invalidRows - duplicates,
      invalidRows,
      duplicates,
      errors,
    };

    job.status = errors.length > 0 && errors.some((e) => e.row === 0) ? 'pending' : 'validated';
    await job.save();
    return job;
  }

  // ─── Preview ──────────────────────────────────────────────────────────
  static async getPreview(
    jobId: string,
    schoolId: string,
  ): Promise<{ mapping: Record<string, string>; sampleRows: Record<string, string>[] }> {
    const job = await MigrationJob.findOne({ _id: jobId, schoolId, isDeleted: false });
    if (!job) throw new NotFoundError('Migration job not found');

    // In production: parse first 10 rows of uploaded file and apply mapping
    const sampleRows: Record<string, string>[] = [];
    for (let i = 0; i < Math.min(10, job.validationResults?.totalRows ?? 10); i++) {
      const row: Record<string, string> = {};
      for (const [source, target] of Object.entries(job.mapping)) {
        row[target] = `Sample ${source} row ${i + 1}`;
      }
      sampleRows.push(row);
    }

    return { mapping: job.mapping, sampleRows };
  }

  // ─── Update Mapping ──────────────────────────────────────────────────
  static async updateMapping(
    jobId: string,
    schoolId: string,
    mapping: Record<string, string>,
  ): Promise<IMigrationJob> {
    const job = await MigrationJob.findOneAndUpdate(
      { _id: jobId, schoolId, isDeleted: false, status: { $in: ['pending', 'validated'] } },
      { $set: { mapping } },
      { new: true, runValidators: true },
    );

    if (!job) throw new NotFoundError('Migration job not found or not in pending/validated status');
    return job;
  }

  // ─── Execute Import ──────────────────────────────────────────────────
  static async executeImport(jobId: string, schoolId: string): Promise<IMigrationJob> {
    const job = await MigrationJob.findOne({ _id: jobId, schoolId, isDeleted: false });
    if (!job) throw new NotFoundError('Migration job not found');

    if (job.status !== 'pending' && job.status !== 'validated') {
      throw new BadRequestError('Job must be in pending or validated status to execute import');
    }

    if (!job.validationResults || job.validationResults.errors.some((e) => e.row === 0)) {
      throw new BadRequestError('Job must pass validation before import');
    }

    job.status = 'importing';
    job.startedAt = job.startedAt ?? new Date();
    await job.save();

    // In production: iterate file rows and create Student/Parent/Staff documents
    // This is a placeholder for the actual import logic
    const totalValid = job.validationResults.validRows;
    const importErrors: IValidationError[] = [];

    job.importResults = {
      studentsCreated: Math.floor(totalValid * 0.6),
      parentsCreated: Math.floor(totalValid * 0.25),
      staffCreated: Math.floor(totalValid * 0.1),
      gradesCreated: Math.floor(totalValid * 0.05),
      skipped: job.validationResults.duplicates,
      errors: importErrors,
    };

    job.status = importErrors.length > 0 ? 'failed' : 'completed';
    job.completedAt = new Date();
    await job.save();

    return job;
  }

  // ─── Job Status ───────────────────────────────────────────────────────
  static async getJobStatus(jobId: string, schoolId: string): Promise<IMigrationJob> {
    const job = await MigrationJob.findOne({ _id: jobId, schoolId, isDeleted: false })
      .populate('performedBy', 'firstName lastName email');

    if (!job) throw new NotFoundError('Migration job not found');
    return job;
  }

  // ─── Job History ──────────────────────────────────────────────────────
  static async getJobHistory(query: ListQuery): Promise<PaginatedResult<IMigrationJob>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { isDeleted: false };
    if (query.schoolId) filter.schoolId = query.schoolId;
    if (query.status) filter.status = query.status;

    const [data, total] = await Promise.all([
      MigrationJob.find(filter)
        .populate('performedBy', 'firstName lastName email')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      MigrationJob.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Templates ────────────────────────────────────────────────────────
  static async createTemplate(data: Partial<IMigrationTemplate>): Promise<IMigrationTemplate> {
    const template = new MigrationTemplate(data);
    return template.save();
  }

  static async getTemplates(
    sourceSystem?: string,
    entityType?: string,
  ): Promise<IMigrationTemplate[]> {
    const filter: Record<string, unknown> = { isDeleted: false };
    if (sourceSystem) filter.sourceSystem = sourceSystem;
    if (entityType) filter.entityType = entityType;

    return MigrationTemplate.find(filter).lean().exec();
  }
}
