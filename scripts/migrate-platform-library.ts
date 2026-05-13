import 'dotenv/config';
import mongoose, { type Connection, Types } from 'mongoose';

type AnyDoc = Record<string, unknown> & { _id?: unknown };

interface Options {
  sourceUri: string;
  targetUri: string;
  donorSchoolId?: string;
  dryRun: boolean;
  dropTarget: boolean;
}

const DEFAULT_SOURCE_DB = 'campusly';
const DEFAULT_TARGET_DB = 'campusly_teacher_staging';
const DEFAULT_MONGO_URI = 'mongodb://localhost:27017/campusly';

function parseArgs(): Options {
  const args = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const sourceDb = get('--source-db') ?? DEFAULT_SOURCE_DB;
  const targetDb = get('--target-db') ?? DEFAULT_TARGET_DB;
  const baseUri = process.env.MONGODB_URI || DEFAULT_MONGO_URI;

  return {
    sourceUri: get('--source-uri') ?? withDbName(baseUri, sourceDb),
    targetUri: get('--target-uri') ?? withDbName(baseUri, targetDb),
    donorSchoolId: get('--donor-school-id'),
    dryRun: args.includes('--dry-run'),
    dropTarget: args.includes('--drop-target'),
  };
}

function withDbName(uri: string, dbName: string): string {
  const parsed = new URL(uri);
  parsed.pathname = `/${dbName}`;
  return parsed.toString();
}

async function connect(uri: string): Promise<Connection> {
  const conn = mongoose.createConnection(uri);
  await conn.asPromise();
  if (!conn.db) throw new Error(`Could not open database for ${uri}`);
  return conn;
}

function dbName(conn: Connection): string {
  if (!conn.db) throw new Error('Database handle unavailable');
  return conn.db.databaseName;
}

async function findDonorSchoolId(source: Connection): Promise<Types.ObjectId> {
  if (!source.db) throw new Error('Source database unavailable');

  const rows = await source.db.collection('curriculumnodes')
    .aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { schoolId: { $ne: null }, isDeleted: { $ne: true } } },
      { $group: { _id: '$schoolId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ])
    .toArray();

  if (!rows[0]?._id) {
    throw new Error('Could not determine donor school. Pass --donor-school-id explicitly.');
  }

  return rows[0]._id;
}

async function loadSystemUser(source: Connection): Promise<AnyDoc> {
  if (!source.db) throw new Error('Source database unavailable');

  const existing = await source.db.collection('users').findOne<AnyDoc>({
    role: 'super_admin',
    isDeleted: { $ne: true },
  });
  if (existing) return existing;

  return {
    _id: new Types.ObjectId(),
    email: 'system@campusly.local',
    password: 'not-for-login',
    firstName: 'Campusly',
    lastName: 'System',
    role: 'super_admin',
    isActive: true,
    isDeleted: false,
    refreshTokens: [],
    isSchoolPrincipal: false,
    isHOD: false,
    isBursar: false,
    isReceptionist: false,
    isCounselor: false,
    isStandaloneTeacher: false,
    isStandaloneCoach: false,
    onboardingDismissed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function findDocs(
  source: Connection,
  collectionName: string,
  query: Record<string, unknown>,
): Promise<AnyDoc[]> {
  if (!source.db) throw new Error('Source database unavailable');
  return source.db.collection(collectionName).find<AnyDoc>(query).toArray();
}

function asGlobalDocs(docs: AnyDoc[], systemUserId: unknown, options?: {
  status?: string;
  textbookStatus?: string;
  createdBySystem?: boolean;
  teacherToSystem?: boolean;
}): AnyDoc[] {
  return docs.map((doc) => {
    const next: AnyDoc = { ...doc, schoolId: null };
    if (options?.status) next.status = options.status;
    if (options?.textbookStatus) next.status = options.textbookStatus;
    if (options?.createdBySystem && 'createdBy' in next) next.createdBy = systemUserId;
    if (options?.teacherToSystem && 'teacherId' in next) next.teacherId = systemUserId;
    if ('reviewedBy' in next && options?.createdBySystem) next.reviewedBy = null;
    next.isDeleted = false;
    return next;
  });
}

function asGlobalAcademicDocs(docs: AnyDoc[]): AnyDoc[] {
  return docs.map((doc) => ({ ...doc, schoolId: null, isDeleted: false }));
}

async function replaceCollection(
  target: Connection,
  collectionName: string,
  docs: AnyDoc[],
  dryRun: boolean,
): Promise<void> {
  if (!target.db) throw new Error('Target database unavailable');
  console.log(`${dryRun ? '[dry-run] ' : ''}${collectionName}: ${docs.length}`);
  if (dryRun) return;

  const collection = target.db.collection(collectionName);
  await collection.deleteMany({});
  if (docs.length > 0) {
    await collection.insertMany(docs, { ordered: false });
  }
}

async function main(): Promise<void> {
  const options = parseArgs();
  const source = await connect(options.sourceUri);
  const target = await connect(options.targetUri);

  try {
    if (dbName(source) === dbName(target)) {
      throw new Error(`Refusing to migrate into the same database: ${dbName(source)}`);
    }

    const donorSchoolId = options.donorSchoolId
      ? new Types.ObjectId(options.donorSchoolId)
      : await findDonorSchoolId(source);
    const systemUser = await loadSystemUser(source);
    const systemUserId = systemUser._id;

    console.log(`Source DB: ${dbName(source)}`);
    console.log(`Target DB: ${dbName(target)}`);
    console.log(`Donor school: ${donorSchoolId.toString()}`);
    console.log(`System user: ${String(systemUserId)}`);
    console.log(`Mode: ${options.dryRun ? 'dry-run' : 'write'}`);

    if (!options.dryRun && options.dropTarget) {
      console.log(`Dropping target DB ${dbName(target)}...`);
      await target.dropDatabase();
    }

    const frameworks = await findDocs(source, 'curriculumframeworks', {
      schoolId: null,
      isDeleted: { $ne: true },
    });
    const nodes = asGlobalDocs(
      await findDocs(source, 'curriculumnodes', {
        schoolId: donorSchoolId,
        isDeleted: { $ne: true },
      }),
      systemUserId,
    );
    const grades = asGlobalAcademicDocs(
      await findDocs(source, 'grades', {
        schoolId: donorSchoolId,
        isDeleted: { $ne: true },
      }),
    );
    const subjects = asGlobalAcademicDocs(
      await findDocs(source, 'subjects', {
        schoolId: donorSchoolId,
        isDeleted: { $ne: true },
      }),
    );
    const textbooks = asGlobalDocs(
      await findDocs(source, 'textbooks', {
        schoolId: donorSchoolId,
        isDeleted: { $ne: true },
      }),
      systemUserId,
      { textbookStatus: 'published', createdBySystem: true },
    );
    const resources = asGlobalDocs(
      await findDocs(source, 'contentresources', {
        schoolId: donorSchoolId,
        isDeleted: { $ne: true },
      }),
      systemUserId,
      { status: 'approved', createdBySystem: true },
    );
    const questions = asGlobalDocs(
      await findDocs(source, 'questions', {
        schoolId: donorSchoolId,
        isDeleted: { $ne: true },
      }),
      systemUserId,
      { status: 'approved', createdBySystem: true },
    );
    const generatedPapers = asGlobalDocs(
      await findDocs(source, 'generatedpapers', {
        schoolId: donorSchoolId,
        isDeleted: { $ne: true },
      }),
      systemUserId,
      { teacherToSystem: true },
    );
    const assessmentPapers = asGlobalDocs(
      await findDocs(source, 'assessmentpapers', {
        schoolId: donorSchoolId,
        isDeleted: { $ne: true },
      }),
      systemUserId,
      { createdBySystem: true },
    );

    await replaceCollection(target, 'users', [systemUser], options.dryRun);
    await replaceCollection(target, 'curriculumframeworks', frameworks, options.dryRun);
    await replaceCollection(target, 'grades', grades, options.dryRun);
    await replaceCollection(target, 'subjects', subjects, options.dryRun);
    await replaceCollection(target, 'curriculumnodes', nodes, options.dryRun);
    await replaceCollection(target, 'contentresources', resources, options.dryRun);
    await replaceCollection(target, 'textbooks', textbooks, options.dryRun);
    await replaceCollection(target, 'questions', questions, options.dryRun);
    await replaceCollection(target, 'generatedpapers', generatedPapers, options.dryRun);
    await replaceCollection(target, 'assessmentpapers', assessmentPapers, options.dryRun);

    console.log('Platform migration completed.');
  } finally {
    await source.close();
    await target.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
