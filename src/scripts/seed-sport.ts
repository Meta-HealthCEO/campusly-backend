/**
 * Seed a standalone coach account with a rich set of demo data:
 * - Personal "Sport Club" school
 * - 3 teams (Soccer, Rugby, Cricket)
 * - Roster-only students (no portal logins)
 * - Past + upcoming fixtures with results & MVP votes
 * - Training sessions with attendance and drills
 * - Active + recovered injuries with recovery logs
 * - Fitness tests + biometrics
 * - Team announcements
 * - A season with computed standings
 *
 * Run: npx tsx src/scripts/seed-sport.ts
 *
 * Login afterwards with:
 *   email:    shaun.coach@campusly.co.za
 *   password: Password1
 */

import { logger } from '../common/logger.js';
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { UserRole } from '../common/enums.js';
import { User } from '../modules/Auth/model.js';
import { School, generateJoinCode } from '../modules/School/model.js';
import { Student } from '../modules/Student/model.js';
import {
  SportTeam, SportFixture, Season,
  PlayerAvailability, MatchResult, MvpVote, SeasonStanding,
} from '../modules/Sport/model.js';
import {
  MatchStats, PlayerCard, PersonalBest,
} from '../modules/Sport/model-stats.js';
import { StatsService } from '../modules/Sport/service-stats.js';
import {
  TrainingSession, TrainingAttendance, DrillTemplate,
} from '../modules/Sport/model-training.js';
import {
  InjuryRecord, RecoveryLog,
} from '../modules/Sport/model-injury.js';
import {
  FitnessTestResult, BiometricMeasurement,
} from '../modules/Sport/model-fitness.js';
import { TeamAnnouncement } from '../modules/Sport/model-announcement.js';
import { CoachAssignment } from '../modules/Sport/model-coach-assignment.js';
import { AgeGroupBenchmark } from '../modules/Sport/model-benchmark.js';

const COACH_EMAIL = 'shaun.coach@campusly.co.za';
const COACH_PASSWORD = 'Password1';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  logger.info('Connecting to MongoDB...');
  await mongoose.connect(config.mongodb.uri);
  logger.info('Connected');

  // ── 1. User + School ────────────────────────────────────────────────────────
  let coach = await User.findOne({ email: COACH_EMAIL });
  let school: import('../modules/School/model.js').ISchool | null = null;

  if (coach) {
    logger.info(`Coach already exists: ${coach.email} — refreshing demo data`);
    school = await School.findOne({ ownerUserId: coach._id });
  }

  if (!school) {
    logger.info('Creating personal Sport Club school...');
    school = await School.create({
      name: "Shaun's Sport Club",
      type: 'combined',
      address: {
        street: 'TBD', city: 'TBD', province: 'TBD',
        postalCode: '0000', country: 'South Africa',
      },
      contactInfo: { email: COACH_EMAIL, phone: '0000000000' },
      subscription: {
        tier: 'basic',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      modulesEnabled: ['auth', 'sport', 'academic', 'ai_tools', 'communication'],
      settings: { academicYear: new Date().getFullYear(), terms: 4, gradingSystem: 'percentage' },
      principal: 'Shaun Coach',
      joinCode: generateJoinCode(),
      isActive: true,
      plan: 'standalone',
    });
  }

  if (!coach) {
    logger.info('Creating coach user...');
    coach = await User.create({
      email: COACH_EMAIL,
      password: COACH_PASSWORD,
      firstName: 'Shaun',
      lastName: 'Coach',
      role: UserRole.COACH,
      schoolId: school._id,
      isSchoolPrincipal: true,
      isStandaloneCoach: true,
    });
    school.ownerUserId = coach._id as typeof school.ownerUserId;
    await school.save();
  } else {
    // Make sure flags are right even if user pre-existed
    coach.role = UserRole.COACH;
    coach.isStandaloneCoach = true;
    coach.schoolId = school._id as typeof coach.schoolId;
    await coach.save();
  }

  const schoolId = school._id;
  const coachId = coach._id;

  logger.info(`Coach: ${COACH_EMAIL} / ${COACH_PASSWORD}`);
  logger.info(`School: ${school.name} (${schoolId})`);

  // ── 2. Wipe just the sport demo data for this school ────────────────────────
  logger.info('Clearing prior sport demo data for this school...');
  await Promise.all([
    MatchStats.deleteMany({ schoolId }),
    PlayerCard.deleteMany({ schoolId }),
    PersonalBest.deleteMany({ schoolId }),
    SportTeam.deleteMany({ schoolId }),
    SportFixture.deleteMany({ schoolId }),
    Season.deleteMany({ schoolId }),
    PlayerAvailability.deleteMany({ schoolId }),
    MatchResult.deleteMany({ schoolId }),
    MvpVote.deleteMany({ schoolId }),
    SeasonStanding.deleteMany({ schoolId }),
    TrainingSession.deleteMany({ schoolId }),
    TrainingAttendance.deleteMany({ schoolId }),
    DrillTemplate.deleteMany({ schoolId }),
    InjuryRecord.deleteMany({ schoolId }),
    RecoveryLog.deleteMany({ schoolId }),
    FitnessTestResult.deleteMany({ schoolId }),
    BiometricMeasurement.deleteMany({ schoolId }),
    TeamAnnouncement.deleteMany({ schoolId }),
    CoachAssignment.deleteMany({ schoolId }),
    AgeGroupBenchmark.deleteMany({ schoolId }),
    Student.deleteMany({ schoolId }),
  ]);

  // ── 2b. Default benchmarks (global, isDefault=true) ────────────────────────
  // Only seed once — these are global defaults shared across all coaches.
  const existingDefaults = await AgeGroupBenchmark.countDocuments({ isDefault: true });
  if (existingDefaults === 0) {
    logger.info('Seeding default age-group benchmarks...');
    interface B {
      sportCode: string;
      ageGroup: 'U11' | 'U13' | 'U15' | 'U17' | 'U19' | 'Open';
      testType: string;
      unit: string;
      direction: 'lower_is_better' | 'higher_is_better';
      eliteValue: number;
      goldValue: number;
      silverValue: number;
      bronzeValue: number;
      isDeleted: boolean;
    }
    const benchmarks: B[] = [
      // ── Soccer 40m sprint (lower is better, seconds) ──
      { sportCode: 'soccer', ageGroup: 'U13', testType: '40m_sprint', unit: 'seconds', direction: 'lower_is_better', eliteValue: 5.4, goldValue: 5.8, silverValue: 6.3, bronzeValue: 7.0, isDeleted: false },
      { sportCode: 'soccer', ageGroup: 'U15', testType: '40m_sprint', unit: 'seconds', direction: 'lower_is_better', eliteValue: 5.0, goldValue: 5.4, silverValue: 5.9, bronzeValue: 6.6, isDeleted: false },
      { sportCode: 'soccer', ageGroup: 'U17', testType: '40m_sprint', unit: 'seconds', direction: 'lower_is_better', eliteValue: 4.8, goldValue: 5.1, silverValue: 5.5, bronzeValue: 6.2, isDeleted: false },
      { sportCode: 'soccer', ageGroup: 'Open', testType: '40m_sprint', unit: 'seconds', direction: 'lower_is_better', eliteValue: 4.7, goldValue: 5.0, silverValue: 5.4, bronzeValue: 6.0, isDeleted: false },

      // Soccer beep test (higher is better, level)
      { sportCode: 'soccer', ageGroup: 'U13', testType: 'beep_test', unit: 'level', direction: 'higher_is_better', eliteValue: 11.0, goldValue: 9.5, silverValue: 8.0, bronzeValue: 6.0, isDeleted: false },
      { sportCode: 'soccer', ageGroup: 'U15', testType: 'beep_test', unit: 'level', direction: 'higher_is_better', eliteValue: 12.5, goldValue: 11.0, silverValue: 9.5, bronzeValue: 7.5, isDeleted: false },
      { sportCode: 'soccer', ageGroup: 'U17', testType: 'beep_test', unit: 'level', direction: 'higher_is_better', eliteValue: 13.5, goldValue: 12.0, silverValue: 10.5, bronzeValue: 8.5, isDeleted: false },
      { sportCode: 'soccer', ageGroup: 'Open', testType: 'beep_test', unit: 'level', direction: 'higher_is_better', eliteValue: 14.0, goldValue: 12.5, silverValue: 11.0, bronzeValue: 9.0, isDeleted: false },

      // Soccer vertical jump (higher is better, cm)
      { sportCode: 'soccer', ageGroup: 'U13', testType: 'vertical_jump', unit: 'cm', direction: 'higher_is_better', eliteValue: 45, goldValue: 38, silverValue: 30, bronzeValue: 22, isDeleted: false },
      { sportCode: 'soccer', ageGroup: 'U15', testType: 'vertical_jump', unit: 'cm', direction: 'higher_is_better', eliteValue: 55, goldValue: 47, silverValue: 38, bronzeValue: 28, isDeleted: false },
      { sportCode: 'soccer', ageGroup: 'U17', testType: 'vertical_jump', unit: 'cm', direction: 'higher_is_better', eliteValue: 65, goldValue: 55, silverValue: 45, bronzeValue: 33, isDeleted: false },
      { sportCode: 'soccer', ageGroup: 'Open', testType: 'vertical_jump', unit: 'cm', direction: 'higher_is_better', eliteValue: 70, goldValue: 60, silverValue: 50, bronzeValue: 38, isDeleted: false },

      // Soccer bench press 1RM (higher is better, kg)
      { sportCode: 'soccer', ageGroup: 'U15', testType: 'bench_press_1rm', unit: 'kg', direction: 'higher_is_better', eliteValue: 75, goldValue: 60, silverValue: 45, bronzeValue: 30, isDeleted: false },
      { sportCode: 'soccer', ageGroup: 'U17', testType: 'bench_press_1rm', unit: 'kg', direction: 'higher_is_better', eliteValue: 100, goldValue: 80, silverValue: 60, bronzeValue: 40, isDeleted: false },
      { sportCode: 'soccer', ageGroup: 'Open', testType: 'bench_press_1rm', unit: 'kg', direction: 'higher_is_better', eliteValue: 120, goldValue: 95, silverValue: 75, bronzeValue: 55, isDeleted: false },

      // Soccer squat 1RM
      { sportCode: 'soccer', ageGroup: 'U15', testType: 'squat_1rm', unit: 'kg', direction: 'higher_is_better', eliteValue: 100, goldValue: 80, silverValue: 60, bronzeValue: 40, isDeleted: false },
      { sportCode: 'soccer', ageGroup: 'U17', testType: 'squat_1rm', unit: 'kg', direction: 'higher_is_better', eliteValue: 130, goldValue: 105, silverValue: 80, bronzeValue: 55, isDeleted: false },
      { sportCode: 'soccer', ageGroup: 'Open', testType: 'squat_1rm', unit: 'kg', direction: 'higher_is_better', eliteValue: 160, goldValue: 130, silverValue: 100, bronzeValue: 70, isDeleted: false },

      // ── Rugby 40m sprint ──
      { sportCode: 'rugby', ageGroup: 'U15', testType: '40m_sprint', unit: 'seconds', direction: 'lower_is_better', eliteValue: 5.0, goldValue: 5.4, silverValue: 5.9, bronzeValue: 6.6, isDeleted: false },
      { sportCode: 'rugby', ageGroup: 'U17', testType: '40m_sprint', unit: 'seconds', direction: 'lower_is_better', eliteValue: 4.8, goldValue: 5.2, silverValue: 5.6, bronzeValue: 6.3, isDeleted: false },
      { sportCode: 'rugby', ageGroup: 'Open', testType: '40m_sprint', unit: 'seconds', direction: 'lower_is_better', eliteValue: 4.7, goldValue: 5.0, silverValue: 5.4, bronzeValue: 6.0, isDeleted: false },

      // Rugby bench press
      { sportCode: 'rugby', ageGroup: 'U15', testType: 'bench_press_1rm', unit: 'kg', direction: 'higher_is_better', eliteValue: 90, goldValue: 70, silverValue: 55, bronzeValue: 40, isDeleted: false },
      { sportCode: 'rugby', ageGroup: 'U17', testType: 'bench_press_1rm', unit: 'kg', direction: 'higher_is_better', eliteValue: 120, goldValue: 100, silverValue: 80, bronzeValue: 60, isDeleted: false },
      { sportCode: 'rugby', ageGroup: 'Open', testType: 'bench_press_1rm', unit: 'kg', direction: 'higher_is_better', eliteValue: 150, goldValue: 120, silverValue: 95, bronzeValue: 70, isDeleted: false },

      // Rugby squat
      { sportCode: 'rugby', ageGroup: 'U17', testType: 'squat_1rm', unit: 'kg', direction: 'higher_is_better', eliteValue: 150, goldValue: 120, silverValue: 95, bronzeValue: 70, isDeleted: false },
      { sportCode: 'rugby', ageGroup: 'Open', testType: 'squat_1rm', unit: 'kg', direction: 'higher_is_better', eliteValue: 180, goldValue: 150, silverValue: 120, bronzeValue: 90, isDeleted: false },

      // ── Cricket 40m sprint ──
      { sportCode: 'cricket', ageGroup: 'U13', testType: '40m_sprint', unit: 'seconds', direction: 'lower_is_better', eliteValue: 5.5, goldValue: 5.9, silverValue: 6.4, bronzeValue: 7.1, isDeleted: false },
      { sportCode: 'cricket', ageGroup: 'U15', testType: '40m_sprint', unit: 'seconds', direction: 'lower_is_better', eliteValue: 5.2, goldValue: 5.6, silverValue: 6.1, bronzeValue: 6.8, isDeleted: false },
      { sportCode: 'cricket', ageGroup: 'Open', testType: '40m_sprint', unit: 'seconds', direction: 'lower_is_better', eliteValue: 4.8, goldValue: 5.2, silverValue: 5.6, bronzeValue: 6.3, isDeleted: false },
    ];
    await AgeGroupBenchmark.insertMany(
      benchmarks.map((b) => ({ ...b, isDefault: true, schoolId: null })),
    );
    logger.info(`Seeded ${benchmarks.length} default benchmarks`);
  }

  // ── 3. Roster-only students ─────────────────────────────────────────────────
  logger.info('Creating students...');
  const studentNames: Array<[string, string]> = [
    ['Liam', 'Naidoo'], ['Noah', 'Botha'], ['Ethan', 'Pillay'],
    ['Lucas', 'Khumalo'], ['Mason', 'Van Wyk'], ['Logan', 'Adams'],
    ['James', 'Mokoena'], ['Aiden', 'De Wet'], ['Ryan', 'Nkosi'],
    ['Caleb', 'Cele'], ['Owen', 'Smit'], ['Jackson', 'Maree'],
    ['Levi', 'Govender'], ['Asher', 'Joubert'], ['Hudson', 'Erasmus'],
    ['Sebastian', 'Padayachee'], ['Henry', 'Dlamini'], ['Wyatt', 'Coetzee'],
    ['Jack', 'Reddy'], ['Daniel', 'Olivier'], ['Carter', 'Mbeki'],
    ['Luke', 'Naicker'], ['Grayson', 'Du Plessis'], ['Isaac', 'Mhlongo'],
    ['Julian', 'Pieterse'],
  ];

  // Need a Grade + Class for FK requirements on Student
  const { Grade, Class } = await import('../modules/Academic/model.js');
  let grade = await Grade.findOne({ schoolId, name: 'Grade 10' });
  if (!grade) {
    grade = await Grade.create({
      schoolId, name: 'Grade 10', orderIndex: 10,
    });
  }
  let cls = await Class.findOne({ schoolId, gradeId: grade._id });
  if (!cls) {
    cls = await Class.create({
      schoolId, name: '10A', gradeId: grade._id,
      teacherId: coachId, capacity: 40,
      classroomCode: generateJoinCode(),
    });
  }

  // Most students U15, a few U17 (rugby squad), one U13
  const yearNow = new Date().getFullYear();
  const students = await Student.insertMany(
    studentNames.map(([first, last], i) => {
      // Age band: 13 (i<3 cricket-only), 15 (i<11 soccer), 17 (rest, rugby)
      const age = i < 3 ? 13 : i < 11 ? 15 : 17;
      const dob = new Date(yearNow - age, (i * 17) % 12, ((i * 11) % 27) + 1);
      return {
        schoolId,
        gradeId: grade!._id,
        classId: cls!._id,
        admissionNumber: `SC-${String(1000 + i).padStart(4, '0')} ${first} ${last}`,
        enrollmentDate: new Date(),
        enrollmentStatus: 'active',
        dateOfBirth: dob,
        gender: 'male' as const,
        medicalProfile: {
          allergies: [], conditions: [], emergencyContacts: [],
        },
        additionalLanguages: [],
        transportRequired: false,
        afterCareRequired: false,
      };
    }),
  );

  logger.info(`Created ${students.length} students`);

  // ── 4. Teams ────────────────────────────────────────────────────────────────
  logger.info('Creating teams...');
  const soccerTeam = await SportTeam.create({
    schoolId, name: 'U15 Soccer 1st XI', sport: 'Soccer', ageGroup: 'U15',
    coachId, playerIds: students.slice(0, 11).map((s) => s._id), isActive: true,
  });
  const rugbyTeam = await SportTeam.create({
    schoolId, name: 'U17 Rugby 1st XV', sport: 'Rugby', ageGroup: 'U17',
    coachId, playerIds: students.slice(8, 23).map((s) => s._id), isActive: true,
  });
  const cricketTeam = await SportTeam.create({
    schoolId, name: 'U13 Cricket A', sport: 'Cricket', ageGroup: 'U13',
    coachId, playerIds: students.slice(0, 11).map((s) => s._id), isActive: true,
  });
  const teams = [soccerTeam, rugbyTeam, cricketTeam];

  // ── 5. Coach assignments ────────────────────────────────────────────────────
  logger.info('Creating coach assignments...');
  await CoachAssignment.insertMany(
    teams.map((t) => ({
      schoolId, userId: coachId, teamId: t._id, role: 'head_coach', isActive: true,
    })),
  );

  // ── 6. Season ───────────────────────────────────────────────────────────────
  logger.info('Creating season...');
  const season = await Season.create({
    schoolId, name: '2026 Winter League', sport: 'Soccer',
    startDate: daysAgo(60), endDate: daysFromNow(60), isActive: true,
  });

  // ── 7. Fixtures ─────────────────────────────────────────────────────────────
  logger.info('Creating fixtures...');
  const opponents = [
    'Greenfields High', 'St. Stithians', 'Maritzburg College',
    'Hilton College', 'Kingsmead Boys', 'Westville Boys', 'DHS',
  ];
  const venues = ['Home Ground', 'Opponent Field', 'Neutral Pitch'];

  const fixtures = [];
  // 15 past soccer matches over the last ~3 months
  for (let i = 0; i < 15; i++) {
    fixtures.push(await SportFixture.create({
      schoolId, teamId: soccerTeam._id,
      opponent: opponents[i % opponents.length],
      date: daysAgo(90 - i * 6),
      time: '14:30',
      venue: venues[i % venues.length],
      isHome: i % 2 === 0,
      notes: 'Past league fixture',
    }));
  }
  for (let i = 0; i < 3; i++) {
    fixtures.push(await SportFixture.create({
      schoolId, teamId: soccerTeam._id,
      opponent: opponents[(i + 5) % opponents.length],
      date: daysFromNow(7 + i * 7),
      time: '15:00',
      venue: venues[i % venues.length],
      isHome: i % 2 === 1,
    }));
  }
  for (let i = 0; i < 10; i++) {
    fixtures.push(await SportFixture.create({
      schoolId, teamId: rugbyTeam._id,
      opponent: opponents[i % opponents.length],
      date: daysAgo(80 - i * 7),
      time: '13:00',
      venue: i % 2 === 0 ? 'Home Ground' : 'Opponent Field', isHome: i % 2 === 0,
    }));
  }
  fixtures.push(await SportFixture.create({
    schoolId, teamId: rugbyTeam._id,
    opponent: 'Affies', date: daysFromNow(14),
    time: '13:00', venue: 'Loftus', isHome: false,
  }));

  // ── 8. Match results for past soccer fixtures ───────────────────────────────
  logger.info('Creating match results...');
  const pastSoccer = fixtures.filter((f) =>
    f.teamId.equals(soccerTeam._id) && f.date < new Date(),
  );
  const results = [
    { home: 3, away: 1 }, { home: 2, away: 2 }, { home: 0, away: 1 },
    { home: 4, away: 0 }, { home: 1, away: 1 }, { home: 5, away: 2 },
    { home: 2, away: 1 }, { home: 3, away: 3 }, { home: 4, away: 2 },
    { home: 1, away: 0 }, { home: 6, away: 1 }, { home: 2, away: 0 },
    { home: 3, away: 2 }, { home: 4, away: 1 }, { home: 2, away: 2 },
  ];
  for (let i = 0; i < pastSoccer.length; i++) {
    const r = results[i];
    const f = pastSoccer[i];
    await MatchResult.create({
      schoolId, fixtureId: f._id,
      homeScore: r.home, awayScore: r.away,
      scorers: i === 0
        ? [
            { studentId: students[0]._id, goals: 2 },
            { studentId: students[3]._id, goals: 1 },
          ]
        : i === 3
        ? [
            { studentId: students[1]._id, goals: 2 },
            { studentId: students[2]._id, goals: 1 },
            { studentId: students[5]._id, goals: 1 },
          ]
        : [],
      manOfTheMatch: students[i % 5]._id,
      notes: i === 0 ? 'Strong first half pressing.' : undefined,
    });
    f.result = `${r.home}-${r.away}`;
    await f.save();
  }

  // ── 9. MVP votes (a few) ────────────────────────────────────────────────────
  logger.info('Creating MVP votes...');
  for (const f of pastSoccer.slice(0, 2)) {
    await MvpVote.create({
      schoolId, fixtureId: f._id, voterId: coachId, studentId: students[0]._id,
    });
  }

  // ── 10. Player availability for next fixture ────────────────────────────────
  logger.info('Creating player availability...');
  const nextSoccer = fixtures.find((f) =>
    f.teamId.equals(soccerTeam._id) && f.date > new Date(),
  );
  if (nextSoccer) {
    const statuses = ['available', 'available', 'available', 'available',
      'available', 'available', 'available', 'available',
      'unavailable', 'injured', 'available'] as const;
    const players = students.slice(0, 11);
    for (let i = 0; i < players.length; i++) {
      await PlayerAvailability.create({
        schoolId, fixtureId: nextSoccer._id, studentId: players[i]._id,
        status: statuses[i], parentConfirmed: i < 7,
        notes: statuses[i] === 'injured' ? 'Recovering from ankle sprain' : undefined,
      });
    }
  }

  // ── 11. Drill templates ─────────────────────────────────────────────────────
  logger.info('Creating drill templates...');
  await DrillTemplate.insertMany([
    {
      schoolId, name: '4v4 Rondo', sport: 'Soccer',
      focus: ['technical', 'tactical'], durationMinutes: 15,
      equipment: ['cones', 'balls', 'bibs'],
      description: '4 attackers vs 4 defenders in a 12x12m square. Two-touch limit.',
    },
    {
      schoolId, name: '40m Sprint Intervals', sport: 'Soccer',
      focus: ['fitness', 'strength'], durationMinutes: 20,
      equipment: ['cones', 'stopwatch'],
      description: '8x40m sprints with 60s recovery. Build to 10x in week 4.',
    },
    {
      schoolId, name: 'Defensive Shape Walk-Through', sport: 'Soccer',
      focus: ['tactical'], durationMinutes: 25,
      equipment: ['mannequins'],
      description: 'Slow-paced shape session. Focus on back four spacing and pressing triggers.',
    },
    {
      schoolId, name: 'Catching Practice (Cricket)', sport: 'Cricket',
      focus: ['technical'], durationMinutes: 15,
      equipment: ['balls'],
      description: 'High catches alternating with slip cradle work.',
    },
  ]);

  // ── 12. Training sessions ───────────────────────────────────────────────────
  logger.info('Creating training sessions...');
  const drills = await DrillTemplate.find({ schoolId }).lean();
  const drillIds = drills.map((d) => d._id);

  const pastSessions = await TrainingSession.insertMany([
    {
      schoolId, teamId: soccerTeam._id,
      title: 'Match prep — defensive shape',
      date: daysAgo(2), startTime: '15:30', durationMinutes: 75,
      location: 'Main field',
      focus: ['tactical', 'match_prep'], drillIds: [drillIds[0], drillIds[2]],
      notes: 'Walk through 4-3-3 vs their wide overlap.',
      status: 'completed',
    },
    {
      schoolId, teamId: soccerTeam._id,
      title: 'Conditioning + finishing',
      date: daysAgo(5), startTime: '15:30', durationMinutes: 90,
      location: 'Main field', focus: ['fitness', 'technical'],
      drillIds: [drillIds[1]], status: 'completed',
    },
    {
      schoolId, teamId: rugbyTeam._id,
      title: 'Scrum unit + lineout drills',
      date: daysAgo(3), startTime: '15:00', durationMinutes: 90,
      location: 'Practice field', focus: ['technical', 'strength'],
      status: 'completed',
    },
  ]);

  await TrainingSession.insertMany([
    {
      schoolId, teamId: soccerTeam._id,
      title: 'Light recovery session',
      date: daysFromNow(1), startTime: '15:30', durationMinutes: 45,
      location: 'Main field', focus: ['recovery'], status: 'scheduled',
    },
    {
      schoolId, teamId: soccerTeam._id,
      title: 'Full-team match prep',
      date: daysFromNow(5), startTime: '15:30', durationMinutes: 90,
      location: 'Main field', focus: ['tactical', 'match_prep'],
      drillIds: [drillIds[0], drillIds[2]], status: 'scheduled',
    },
    {
      schoolId, teamId: rugbyTeam._id,
      title: 'Contact session',
      date: daysFromNow(3), startTime: '15:00', durationMinutes: 75,
      location: 'Practice field', focus: ['technical', 'strength'],
      status: 'scheduled',
    },
  ]);

  // ── 13. Training attendance for past sessions ──────────────────────────────
  logger.info('Creating training attendance...');
  for (const ses of pastSessions) {
    const team = teams.find((t) => t._id.equals(ses.teamId));
    if (!team) continue;
    const players = team.playerIds.slice(0, 11);
    for (let i = 0; i < players.length; i++) {
      const status = i === 9 ? 'absent' : i === 8 ? 'late' : 'present';
      await TrainingAttendance.create({
        schoolId, sessionId: ses._id, studentId: players[i],
        status, rating: status === 'present' ? 3 + (i % 3) : undefined,
        notes: i === 0 ? 'Outstanding intensity.' : undefined,
      });
    }
  }

  // ── 14. Injuries + recovery logs ────────────────────────────────────────────
  logger.info('Creating injuries...');
  const activeInjury = await InjuryRecord.create({
    schoolId, studentId: students[9]._id, teamId: soccerTeam._id,
    injuryDate: daysAgo(10),
    bodyPart: 'ankle', type: 'sprain', severity: 'moderate',
    mechanism: 'Twisted on uneven ground in training.',
    description: 'Grade 2 lateral ankle sprain. Walking with mild discomfort.',
    expectedReturnDate: daysFromNow(14),
    status: 'recovering', clearanceLevel: 'light_training',
    reportedBy: coachId, clearedBy: coachId,
  });
  const oldInjury = await InjuryRecord.create({
    schoolId, studentId: students[3]._id, teamId: soccerTeam._id,
    injuryDate: daysAgo(60),
    bodyPart: 'hamstring', type: 'strain', severity: 'minor',
    mechanism: 'Sprint training fatigue.',
    expectedReturnDate: daysAgo(45),
    actualReturnDate: daysAgo(40),
    status: 'cleared', clearanceLevel: 'match_ready',
    reportedBy: coachId, clearedBy: coachId,
  });
  await InjuryRecord.create({
    schoolId, studentId: students[15]._id, teamId: rugbyTeam._id,
    injuryDate: daysAgo(2),
    bodyPart: 'shoulder', type: 'contusion', severity: 'minor',
    mechanism: 'Tackle in contact session.',
    description: 'Bruising and stiffness — full ROM retained.',
    expectedReturnDate: daysFromNow(5),
    status: 'active', clearanceLevel: 'none',
    reportedBy: coachId,
  });

  // Recovery logs
  await RecoveryLog.insertMany([
    {
      schoolId, injuryId: activeInjury._id, loggedBy: coachId,
      date: daysAgo(8), painLevel: 7, mobilityScore: 4,
      activitiesPerformed: ['ice', 'compression', 'rest'],
      notes: 'Significant swelling. RICE protocol started.',
      nextMilestone: 'Walk pain-free in 3 days',
    },
    {
      schoolId, injuryId: activeInjury._id, loggedBy: coachId,
      date: daysAgo(5), painLevel: 4, mobilityScore: 6,
      activitiesPerformed: ['stretching', 'walking'],
      notes: 'Swelling reduced. Walking unaided.',
      nextMilestone: 'Light jog by end of week',
    },
    {
      schoolId, injuryId: activeInjury._id, loggedBy: coachId,
      date: daysAgo(2), painLevel: 2, mobilityScore: 8,
      activitiesPerformed: ['light jog', 'balance work'],
      notes: 'Cleared for light training. Cautious on lateral movements.',
      nextMilestone: 'Full training in 7 days',
    },
    {
      schoolId, injuryId: oldInjury._id, loggedBy: coachId,
      date: daysAgo(40), painLevel: 0, mobilityScore: 10,
      activitiesPerformed: ['full training', 'sprints'],
      notes: 'Cleared for match play.',
    },
  ]);

  // ── 15. Fitness tests + biometrics ──────────────────────────────────────────
  logger.info('Creating fitness tests...');
  // U15 soccer benchmarks: 40m elite=5.0s gold=5.4 silver=5.9 bronze=6.6
  //                        beep elite=12.5 gold=11.0 silver=9.5 bronze=7.5
  //                        vert elite=55cm gold=47 silver=38 bronze=28
  // Top players score in elite/gold range, depth players in silver/bronze
  const fitnessRecords = [];
  for (let i = 0; i < 11; i++) {
    // Skill curve: top 2 forwards/star are elite, mids/stars gold, depth silver/bronze
    const tier = i === 8 ? 'elite' : i === 9 || i === 1 || i === 5 ? 'gold' : i < 7 ? 'silver' : 'bronze';
    const sprintByTier: Record<string, number> = { elite: 4.95, gold: 5.30, silver: 5.75, bronze: 6.40 };
    const beepByTier: Record<string, number> = { elite: 12.8, gold: 11.5, silver: 10.0, bronze: 8.0 };
    const vertByTier: Record<string, number> = { elite: 58, gold: 49, silver: 40, bronze: 30 };
    const benchByTier: Record<string, number> = { elite: 78, gold: 62, silver: 48, bronze: 35 };

    // Two sprint readings: 30 days ago (slower) and 5 days ago (improved)
    fitnessRecords.push({
      schoolId, studentId: students[i]._id, teamId: soccerTeam._id,
      sportCode: 'soccer', testType: '40m_sprint',
      value: sprintByTier[tier] + 0.15, unit: 'seconds',
      date: daysAgo(30), testedBy: coachId,
    });
    fitnessRecords.push({
      schoolId, studentId: students[i]._id, teamId: soccerTeam._id,
      sportCode: 'soccer', testType: '40m_sprint',
      value: sprintByTier[tier], unit: 'seconds',
      date: daysAgo(5), testedBy: coachId,
      notes: tier === 'elite' || tier === 'gold' ? 'Personal best' : undefined,
    });
    fitnessRecords.push({
      schoolId, studentId: students[i]._id, teamId: soccerTeam._id,
      sportCode: 'soccer', testType: 'beep_test',
      value: beepByTier[tier], unit: 'level',
      date: daysAgo(15), testedBy: coachId,
    });
    fitnessRecords.push({
      schoolId, studentId: students[i]._id, teamId: soccerTeam._id,
      sportCode: 'soccer', testType: 'vertical_jump',
      value: vertByTier[tier], unit: 'cm',
      date: daysAgo(15), testedBy: coachId,
    });
    fitnessRecords.push({
      schoolId, studentId: students[i]._id, teamId: soccerTeam._id,
      sportCode: 'soccer', testType: 'bench_press_1rm',
      value: benchByTier[tier], unit: 'kg',
      date: daysAgo(20), testedBy: coachId,
    });
  }

  // Rugby fitness tests for the rugby squad (U17 ages)
  for (let i = 0; i < 15; i++) {
    const studentIdx = 8 + i; // students[8..22]
    const tier = i === 0 ? 'elite' : i < 4 ? 'gold' : i < 10 ? 'silver' : 'bronze';
    const sprintByTier: Record<string, number> = { elite: 4.78, gold: 5.10, silver: 5.55, bronze: 6.20 };
    const benchByTier: Record<string, number> = { elite: 118, gold: 95, silver: 75, bronze: 55 };
    fitnessRecords.push({
      schoolId, studentId: students[studentIdx]._id, teamId: rugbyTeam._id,
      sportCode: 'rugby', testType: '40m_sprint',
      value: sprintByTier[tier], unit: 'seconds',
      date: daysAgo(10), testedBy: coachId,
    });
    fitnessRecords.push({
      schoolId, studentId: students[studentIdx]._id, teamId: rugbyTeam._id,
      sportCode: 'rugby', testType: 'bench_press_1rm',
      value: benchByTier[tier], unit: 'kg',
      date: daysAgo(20), testedBy: coachId,
    });
  }

  await FitnessTestResult.insertMany(fitnessRecords);

  logger.info('Creating biometrics...');
  const bios = [];
  for (let i = 0; i < 11; i++) {
    bios.push({
      schoolId, studentId: students[i]._id,
      date: daysAgo(15),
      weightKg: 60 + (i * 1.5),
      heightCm: 170 + (i % 4) * 2,
      bodyFatPct: 12 + (i % 5),
      restingHrBpm: 58 + (i % 8),
      recordedBy: coachId,
    });
  }
  await BiometricMeasurement.insertMany(bios);

  // ── 16. Team announcements ──────────────────────────────────────────────────
  logger.info('Creating announcements...');
  await TeamAnnouncement.insertMany([
    {
      schoolId, teamId: soccerTeam._id, authorId: coachId,
      title: 'Match day vs Greenfields — Saturday 14:30',
      body: 'Be at the grounds 13:45 in full home kit.\nKick-off is 14:30 sharp.\nBring your own water bottle.',
      priority: 'high', pinned: true,
      publishedAt: daysAgo(1),
    },
    {
      schoolId, teamId: soccerTeam._id, authorId: coachId,
      title: 'Training schedule update',
      body: 'Tuesday training moves to 16:00 next week due to assembly.',
      priority: 'normal', pinned: false,
      publishedAt: daysAgo(3),
    },
    {
      schoolId, teamId: rugbyTeam._id, authorId: coachId,
      title: 'Strength & conditioning block starts Monday',
      body: 'New 6-week S&C block begins Monday 6 AM in the gym. Attendance is mandatory for all forwards.',
      priority: 'high', pinned: true,
      publishedAt: daysAgo(2),
    },
  ]);

  // ── 16b. Per-match player stats (drives PlayerCards) ────────────────────────
  logger.info('Creating match stats...');

  const soccerPositions = [
    'Goalkeeper',
    'Defender', 'Defender', 'Defender', 'Defender',
    'Midfielder', 'Midfielder', 'Midfielder',
    'Forward', 'Forward', 'Forward',
  ];
  const soccerSquad = students.slice(0, 11);

  function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Per-player skill tiers — drives realistic stat distributions
  // Top forwards (idx 8-9) are stars, idx 10 is a rotation forward
  // Midfielders 5-7: 5 is creative/playmaker, 6-7 are workers
  // Defenders 1-4: 1 is captain/attacking fullback, others are stoppers
  const soccerSkill = [
    'starter', // 0 GK
    'star', 'starter', 'starter', 'starter', // 1-4 defenders
    'star', 'starter', 'starter', // 5-7 mids
    'elite', 'star', 'rotation', // 8-10 forwards
  ];

  for (let i = 0; i < pastSoccer.length; i++) {
    const fixture = pastSoccer[i];
    const won = results[i].home > results[i].away;
    const playerStats = soccerSquad.map((s, idx) => {
      const pos = soccerPositions[idx];
      const skill = soccerSkill[idx];
      const isGk = pos === 'Goalkeeper';
      const isFwd = pos === 'Forward';
      const isMid = pos === 'Midfielder';
      const isDef = pos === 'Defender';

      // Per-match goals/assists scaled by position + skill
      let goals = 0;
      let assists = 0;
      if (isFwd) {
        if (skill === 'elite') {
          goals = randInt(2, 4);
          assists = randInt(1, 2);
        } else if (skill === 'star') {
          goals = randInt(1, 2);
          assists = randInt(0, 2);
        } else {
          goals = randInt(0, 1);
          assists = randInt(0, 1);
        }
      } else if (isMid) {
        if (skill === 'star') {
          goals = randInt(0, 2);
          assists = randInt(2, 4);
        } else {
          goals = Math.random() > 0.6 ? 1 : 0;
          assists = randInt(1, 2);
        }
      } else if (isDef && skill === 'star') {
        goals = Math.random() > 0.85 ? 1 : 0;
        assists = randInt(0, 1);
      }

      const stats: Record<string, number | boolean> = {
        goals,
        assists,
        shotsOnTarget: isFwd ? randInt(2, 6) : isMid ? randInt(0, 3) : 0,
        yellowCards: Math.random() > 0.88 ? 1 : 0,
        redCards: 0,
        saves: isGk ? randInt(2, 8) : 0,
        cleanSheets: isGk && results[i].away === 0,
      };

      const baselineBySkill: Record<string, number> = {
        elite: 86, star: 80, starter: 73, rotation: 66,
      };
      const baseline = baselineBySkill[skill] ?? 70;
      const rating = Math.min(99, baseline + randInt(-4, 8) + (won ? 3 : 0));

      return {
        studentId: String(s._id),
        position: pos,
        stats,
        rating,
        manOfMatch: idx === (i % 11),
      };
    });

    await StatsService.recordMatchStats(
      String(schoolId), String(fixture._id),
      {
        teamId: String(soccerTeam._id),
        sportCode: 'soccer',
        playerStats,
        teamStats: {
          corners: randInt(3, 9),
          fouls: randInt(5, 14),
        },
      },
    );
  }

  // Rugby match stats
  const rugbyPositions = [
    'Prop', 'Hooker', 'Prop', 'Lock', 'Lock',
    'Flanker', 'Flanker', 'Number 8',
    'Scrumhalf', 'Flyhalf',
    'Centre', 'Centre', 'Wing', 'Wing', 'Fullback',
  ];
  const rugbySquad = students.slice(8, 23);

  const pastRugby = fixtures.filter(
    (f) => f.teamId.equals(rugbyTeam._id) && f.date < new Date(),
  );
  for (const fixture of pastRugby) {
    const playerStats = rugbySquad.map((s, idx) => {
      const pos = rugbyPositions[idx];
      const isBack = idx >= 8;
      const isWingFullback = idx >= 12; // wings + fullback
      const stats: Record<string, number> = {
        // Wings/fullback score most; centres/backs occasionally; forwards rarely
        tries: isWingFullback ? randInt(0, 2)
          : isBack ? (Math.random() > 0.5 ? randInt(0, 1) : 0)
          : (Math.random() > 0.85 ? 1 : 0),
        conversions: pos === 'Flyhalf' ? randInt(2, 5) : 0,
        penalties: pos === 'Flyhalf' ? randInt(0, 3) : 0,
        dropGoals: pos === 'Flyhalf' && Math.random() > 0.85 ? 1 : 0,
        tackles: !isBack ? randInt(10, 22) : randInt(5, 14),
        tacklesMissed: randInt(0, 3),
        carries: !isBack ? randInt(8, 18) : randInt(5, 14),
        metresGained: isBack ? randInt(40, 120) : randInt(20, 60),
        turnovers: pos === 'Flanker' ? randInt(1, 3) : 0,
        yellowCards: 0,
        redCards: 0,
      };
      const baseline = idx < 5 ? 78 : idx < 10 ? 80 : 82;
      const rating = Math.min(99, baseline + randInt(-4, 8));
      return {
        studentId: String(s._id),
        position: pos,
        stats,
        rating,
        manOfMatch: idx === 7,
      };
    });

    await StatsService.recordMatchStats(
      String(schoolId), String(fixture._id),
      {
        teamId: String(rugbyTeam._id),
        sportCode: 'rugby',
        playerStats,
        teamStats: {
          totalPoints: randInt(15, 35),
          lineoutWins: randInt(8, 14),
          scrumWins: randInt(6, 10),
        },
      },
    );
  }

  // ── 16c. Personal bests + recompute player cards ────────────────────────────
  logger.info('Creating personal bests...');
  for (let i = 0; i < soccerSquad.length; i++) {
    const s = soccerSquad[i];
    if (i < 5) {
      await PersonalBest.create({
        schoolId, studentId: s._id, sportCode: 'soccer',
        event: '40m sprint', value: 5.0 + i * 0.04, unit: 'seconds',
        date: daysAgo(5),
      });
    }
    if (i % 3 === 0) {
      await PersonalBest.create({
        schoolId, studentId: s._id, sportCode: 'soccer',
        event: 'Vertical jump', value: 50 + i, unit: 'cm',
        date: daysAgo(15),
      });
    }
  }

  logger.info('Recomputing player cards...');
  for (const s of soccerSquad) {
    try {
      await StatsService.recalculatePlayerCard(String(schoolId), String(s._id), 'soccer');
    } catch (err: unknown) {
      logger.warn(
        { err: err instanceof Error ? err.message : 'unknown' },
        'Soccer card recalc failed',
      );
    }
  }
  for (const s of rugbySquad) {
    try {
      await StatsService.recalculatePlayerCard(String(schoolId), String(s._id), 'rugby');
    } catch (err: unknown) {
      logger.warn(
        { err: err instanceof Error ? err.message : 'unknown' },
        'Rugby card recalc failed',
      );
    }
  }

  // ── 17. Standings (computed from results) ───────────────────────────────────
  logger.info('Computing standings...');
  await SeasonStanding.create({
    schoolId, seasonId: season._id, teamId: soccerTeam._id,
    played: 5, won: 2, drawn: 2, lost: 1,
    goalsFor: 10, goalsAgainst: 5, points: 8,
  });

  logger.info('────────────────────────────────────────────────');
  logger.info('  Sport demo seeded successfully!');
  logger.info(`  Login:    ${COACH_EMAIL}`);
  logger.info(`  Password: ${COACH_PASSWORD}`);
  logger.info('  Visit:    http://localhost:3500/login');
  logger.info('────────────────────────────────────────────────');

  await mongoose.disconnect();
}

main().catch((err) => {
  logger.error({ err: err instanceof Error ? err.message : err }, 'Seed failed');
  process.exit(1);
});
