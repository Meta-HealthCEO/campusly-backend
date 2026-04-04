import { logger } from '../common/logger.js';
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { User } from '../modules/Auth/model.js';
import { School } from '../modules/School/model.js';
import { Student } from '../modules/Student/model.js';
import { Parent } from '../modules/Parent/model.js';
import { Wallet } from '../modules/Wallet/model.js';
import { Grade, Class, Subject, Assessment, Mark } from '../modules/Academic/model.js';
import { FeeType } from '../modules/Fee/model.js';
import { MenuItem } from '../modules/TuckShop/model.js';
import { Announcement } from '../modules/Announcement/model.js';

async function seed() {
  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(config.mongodb.uri);
    logger.info('Connected to MongoDB');

    // ─── Clear all collections ────────────────────────────────────────────────
    logger.info('Clearing all collections...');
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
    logger.info('All collections cleared');

    // ─── School ───────────────────────────────────────────────────────────────
    logger.info('Creating school...');
    const school = await School.create({
      name: 'Greenfield Primary School',
      address: {
        street: '45 Jacaranda Avenue',
        city: 'Johannesburg',
        province: 'Gauteng',
        postalCode: '2196',
        country: 'South Africa',
      },
      contactInfo: {
        email: 'info@greenfieldprimary.co.za',
        phone: '+27 11 555 0100',
        website: 'https://www.greenfieldprimary.co.za',
      },
      subscription: {
        tier: 'premium',
        expiresAt: new Date('2027-12-31'),
      },
      modulesEnabled: [
        'auth', 'wallet', 'fees', 'academic', 'homework',
        'attendance', 'tuckshop', 'notifications', 'announcements',
        'library', 'achiever', 'consent', 'event', 'transport',
        'lost_found', 'sport', 'aftercare',
      ],
      settings: {
        academicYear: 2026,
        terms: 4,
        gradingSystem: 'percentage',
      },
      principal: 'Dr. Nomsa Dlamini',
      emisNumber: 'GP-500123',
      type: 'primary',
    });
    logger.info(`School created: ${school.name} (${school._id})`);

    // ─── Users ────────────────────────────────────────────────────────────────
    logger.info('Creating users...');

    // The User model has a pre-save hook that hashes passwords automatically
    const superAdmin = await User.create({
      email: 'superadmin@campusly.co.za',
      password: 'Password1',
      firstName: 'Sipho',
      lastName: 'Mokoena',
      role: 'super_admin',
      phone: '+27 82 000 0001',
      isActive: true,
    });
    logger.info(`Super admin created: ${superAdmin.email}`);

    const schoolAdmin = await User.create({
      email: 'admin@greenfieldprimary.co.za',
      password: 'Password1',
      firstName: 'Lerato',
      lastName: 'Nkosi',
      role: 'school_admin',
      schoolId: school._id,
      phone: '+27 82 000 0002',
      isActive: true,
    });
    logger.info(`School admin created: ${schoolAdmin.email}`);

    const teacherData = [
      { firstName: 'Thandi', lastName: 'Molefe', email: 'thandi.molefe@greenfieldprimary.co.za', phone: '+27 83 100 0001' },
      { firstName: 'Johan', lastName: 'van der Merwe', email: 'johan.vdm@greenfieldprimary.co.za', phone: '+27 83 100 0002' },
      { firstName: 'Ayanda', lastName: 'Zulu', email: 'ayanda.zulu@greenfieldprimary.co.za', phone: '+27 83 100 0003' },
    ];

    const teachers = await Promise.all(
      teacherData.map((t) =>
        User.create({
          ...t,
          password: 'Password1',
          role: 'teacher',
          schoolId: school._id,
          isActive: true,
        }),
      ),
    );
    logger.info(`${teachers.length} teachers created`);

    const parentUserData = [
      { firstName: 'Bongiwe', lastName: 'Mthembu', email: 'bongiwe.mthembu@gmail.com', phone: '+27 84 200 0001' },
      { firstName: 'Pieter', lastName: 'Botha', email: 'pieter.botha@outlook.com', phone: '+27 84 200 0002' },
      { firstName: 'Fatima', lastName: 'Patel', email: 'fatima.patel@yahoo.com', phone: '+27 84 200 0003' },
      { firstName: 'David', lastName: 'Naidoo', email: 'david.naidoo@gmail.com', phone: '+27 84 200 0004' },
      { firstName: 'Zanele', lastName: 'Khumalo', email: 'zanele.khumalo@gmail.com', phone: '+27 84 200 0005' },
    ];

    const parentUsers = await Promise.all(
      parentUserData.map((p) =>
        User.create({
          ...p,
          password: 'Password1',
          role: 'parent',
          schoolId: school._id,
          isActive: true,
        }),
      ),
    );
    logger.info(`${parentUsers.length} parent users created`);

    const studentUserData = [
      { firstName: 'Lebo', lastName: 'Mthembu', email: 'lebo.mthembu@student.gfp.co.za', gender: 'male' as const, dob: '2019-03-15' },
      { firstName: 'Naledi', lastName: 'Mthembu', email: 'naledi.mthembu@student.gfp.co.za', gender: 'female' as const, dob: '2020-07-22' },
      { firstName: 'Jan', lastName: 'Botha', email: 'jan.botha@student.gfp.co.za', gender: 'male' as const, dob: '2019-01-10' },
      { firstName: 'Anika', lastName: 'Botha', email: 'anika.botha@student.gfp.co.za', gender: 'female' as const, dob: '2020-11-05' },
      { firstName: 'Riya', lastName: 'Patel', email: 'riya.patel@student.gfp.co.za', gender: 'female' as const, dob: '2019-06-18' },
      { firstName: 'Arjun', lastName: 'Naidoo', email: 'arjun.naidoo@student.gfp.co.za', gender: 'male' as const, dob: '2018-09-30' },
      { firstName: 'Priya', lastName: 'Naidoo', email: 'priya.naidoo@student.gfp.co.za', gender: 'female' as const, dob: '2020-02-14' },
      { firstName: 'Siyabonga', lastName: 'Khumalo', email: 'siyabonga.khumalo@student.gfp.co.za', gender: 'male' as const, dob: '2018-12-01' },
      { firstName: 'Amahle', lastName: 'Khumalo', email: 'amahle.khumalo@student.gfp.co.za', gender: 'female' as const, dob: '2019-04-25' },
      { firstName: 'Thabo', lastName: 'Dlamini', email: 'thabo.dlamini@student.gfp.co.za', gender: 'male' as const, dob: '2020-08-12' },
    ];

    const studentUsers = await Promise.all(
      studentUserData.map((s) =>
        User.create({
          email: s.email,
          password: 'Password1',
          firstName: s.firstName,
          lastName: s.lastName,
          role: 'student',
          schoolId: school._id,
          isActive: true,
        }),
      ),
    );
    logger.info(`${studentUsers.length} student users created`);

    // ─── Grades ───────────────────────────────────────────────────────────────
    logger.info('Creating grades...');
    const gradeNames = ['Grade R', 'Grade 1', 'Grade 2', 'Grade 3'];
    const grades = await Promise.all(
      gradeNames.map((name, index) =>
        Grade.create({
          name,
          schoolId: school._id,
          orderIndex: index,
        }),
      ),
    );
    logger.info(`${grades.length} grades created`);

    // ─── Classes ──────────────────────────────────────────────────────────────
    logger.info('Creating classes...');
    const classData = [
      { name: 'Grade R - A', gradeIndex: 0, teacherIndex: 0, capacity: 25 },
      { name: 'Grade 1 - A', gradeIndex: 1, teacherIndex: 0, capacity: 30 },
      { name: 'Grade 1 - B', gradeIndex: 1, teacherIndex: 1, capacity: 30 },
      { name: 'Grade 2 - A', gradeIndex: 2, teacherIndex: 1, capacity: 30 },
      { name: 'Grade 3 - A', gradeIndex: 3, teacherIndex: 2, capacity: 30 },
      { name: 'Grade 3 - B', gradeIndex: 3, teacherIndex: 2, capacity: 30 },
    ];

    const classes = await Promise.all(
      classData.map((c) =>
        Class.create({
          name: c.name,
          gradeId: grades[c.gradeIndex]._id,
          schoolId: school._id,
          teacherId: teachers[c.teacherIndex]._id,
          capacity: c.capacity,
        }),
      ),
    );
    logger.info(`${classes.length} classes created`);

    // ─── Subjects ─────────────────────────────────────────────────────────────
    logger.info('Creating subjects...');
    const allGradeIds = grades.map((g) => g._id);
    const subjectData = [
      { name: 'English', code: 'ENG', gradeIds: allGradeIds },
      { name: 'Afrikaans', code: 'AFR', gradeIds: allGradeIds },
      { name: 'Mathematics', code: 'MAT', gradeIds: allGradeIds },
      { name: 'Life Skills', code: 'LFS', gradeIds: allGradeIds },
      { name: 'Natural Sciences', code: 'NSC', gradeIds: [grades[2]._id, grades[3]._id] },
    ];

    const subjects = await Promise.all(
      subjectData.map((s) =>
        Subject.create({
          name: s.name,
          code: s.code,
          schoolId: school._id,
          gradeIds: s.gradeIds,
        }),
      ),
    );
    logger.info(`${subjects.length} subjects created`);

    // ─── Students ─────────────────────────────────────────────────────────────
    logger.info('Creating students...');

    // Assign students to classes/grades
    // Grade R-A: Naledi, Anika, Thabo (younger kids, dob 2020)
    // Grade 1-A: Lebo, Jan, Riya (dob 2019)
    // Grade 1-B: Amahle (dob 2019)
    // Grade 2-A: Priya (dob 2020 but early learner)
    // Grade 3-A: Arjun, Siyabonga (older kids, dob 2018)
    const studentAssignments = [
      { userIndex: 0, gradeIndex: 1, classIndex: 1, admNum: 'GFP-2026-001', gender: 'male', dob: '2019-03-15', lang: 'isiZulu' },
      { userIndex: 1, gradeIndex: 0, classIndex: 0, admNum: 'GFP-2026-002', gender: 'female', dob: '2020-07-22', lang: 'isiZulu' },
      { userIndex: 2, gradeIndex: 1, classIndex: 1, admNum: 'GFP-2026-003', gender: 'male', dob: '2019-01-10', lang: 'Afrikaans' },
      { userIndex: 3, gradeIndex: 0, classIndex: 0, admNum: 'GFP-2026-004', gender: 'female', dob: '2020-11-05', lang: 'Afrikaans' },
      { userIndex: 4, gradeIndex: 1, classIndex: 2, admNum: 'GFP-2026-005', gender: 'female', dob: '2019-06-18', lang: 'English' },
      { userIndex: 5, gradeIndex: 3, classIndex: 4, admNum: 'GFP-2026-006', gender: 'male', dob: '2018-09-30', lang: 'English' },
      { userIndex: 6, gradeIndex: 2, classIndex: 3, admNum: 'GFP-2026-007', gender: 'female', dob: '2020-02-14', lang: 'English' },
      { userIndex: 7, gradeIndex: 3, classIndex: 4, admNum: 'GFP-2026-008', gender: 'male', dob: '2018-12-01', lang: 'isiZulu' },
      { userIndex: 8, gradeIndex: 1, classIndex: 2, admNum: 'GFP-2026-009', gender: 'female', dob: '2019-04-25', lang: 'isiZulu' },
      { userIndex: 9, gradeIndex: 0, classIndex: 0, admNum: 'GFP-2026-010', gender: 'male', dob: '2020-08-12', lang: 'isiXhosa' },
    ];

    const students = await Promise.all(
      studentAssignments.map((sa) =>
        Student.create({
          userId: studentUsers[sa.userIndex]._id,
          schoolId: school._id,
          gradeId: grades[sa.gradeIndex]._id,
          classId: classes[sa.classIndex]._id,
          admissionNumber: sa.admNum,
          enrollmentDate: new Date('2026-01-15'),
          enrollmentStatus: 'active',
          dateOfBirth: new Date(sa.dob),
          gender: sa.gender,
          homeLanguage: sa.lang,
          additionalLanguages: sa.lang === 'English' ? ['Afrikaans'] : ['English'],
          transportRequired: sa.userIndex % 3 === 0,
          afterCareRequired: sa.userIndex % 4 === 0,
          medicalProfile: {
            allergies: sa.userIndex === 4 ? ['Peanuts'] : [],
            conditions: sa.userIndex === 7 ? ['Asthma'] : [],
            emergencyContacts: [
              {
                name: parentUserData[Math.min(sa.userIndex, 4)].firstName + ' ' + parentUserData[Math.min(sa.userIndex, 4)].lastName,
                relationship: 'Parent',
                phone: parentUserData[Math.min(sa.userIndex, 4)].phone,
              },
            ],
          },
        }),
      ),
    );
    logger.info(`${students.length} students created`);

    // ─── Parents ──────────────────────────────────────────────────────────────
    logger.info('Creating parents...');

    // Parent 0 (Bongiwe Mthembu) -> children: Lebo (0), Naledi (1)
    // Parent 1 (Pieter Botha) -> children: Jan (2), Anika (3)
    // Parent 2 (Fatima Patel) -> children: Riya (4)
    // Parent 3 (David Naidoo) -> children: Arjun (5), Priya (6)
    // Parent 4 (Zanele Khumalo) -> children: Siyabonga (7), Amahle (8)
    const parentAssignments = [
      { userIndex: 0, childrenIndices: [0, 1], relationship: 'mother' as const, occupation: 'Nurse', employer: 'Chris Hani Baragwanath', isMain: true },
      { userIndex: 1, childrenIndices: [2, 3], relationship: 'father' as const, occupation: 'Engineer', employer: 'Eskom', isMain: true },
      { userIndex: 2, childrenIndices: [4], relationship: 'mother' as const, occupation: 'Pharmacist', employer: 'Dis-Chem', isMain: true },
      { userIndex: 3, childrenIndices: [5, 6], relationship: 'father' as const, occupation: 'Accountant', employer: 'Deloitte SA', isMain: true },
      { userIndex: 4, childrenIndices: [7, 8], relationship: 'mother' as const, occupation: 'Teacher', employer: 'Gauteng DOE', isMain: true },
    ];

    const parents = await Promise.all(
      parentAssignments.map((pa) =>
        Parent.create({
          userId: parentUsers[pa.userIndex]._id,
          schoolId: school._id,
          childrenIds: pa.childrenIndices.map((i) => students[i]._id),
          relationship: pa.relationship,
          occupation: pa.occupation,
          employer: pa.employer,
          communicationPreference: 'email',
          isMainCaregiver: pa.isMain,
        }),
      ),
    );
    logger.info(`${parents.length} parents created`);

    // Update students with guardian references
    logger.info('Linking students to parents...');
    const studentParentMap: Record<number, number[]> = {
      0: [0], 1: [0], 2: [1], 3: [1], 4: [2],
      5: [3], 6: [3], 7: [4], 8: [4], 9: [],
    };

    await Promise.all(
      Object.entries(studentParentMap).map(([studentIdx, parentIndices]) => {
        if (parentIndices.length === 0) return Promise.resolve();
        return Student.findByIdAndUpdate(students[Number(studentIdx)]._id, {
          guardianIds: parentIndices.map((pi) => parents[pi]._id),
        });
      }),
    );
    logger.info('Students linked to parents');

    // ─── Wallets ──────────────────────────────────────────────────────────────
    logger.info('Creating wallets...');
    const walletBalances = [5000, 2500, 7500, 3000, 10000, 1500, 0, 4000, 6000, 0];
    const wallets = await Promise.all(
      students.map((student, index) =>
        Wallet.create({
          studentId: student._id,
          schoolId: school._id,
          balance: walletBalances[index],
          dailyLimit: 10000,
          currency: 'ZAR',
          isActive: true,
        }),
      ),
    );
    logger.info(`${wallets.length} wallets created (balances in cents)`);

    // ─── Fee Types ────────────────────────────────────────────────────────────
    logger.info('Creating fee types...');
    const feeTypeData = [
      {
        name: 'Annual Tuition Fee',
        description: 'Standard annual school tuition fee',
        amount: 4500000, // R45,000 in cents
        frequency: 'per_year',
        category: 'tuition' as const,
      },
      {
        name: 'School Transport (Monthly)',
        description: 'Monthly school bus transport service',
        amount: 150000, // R1,500 in cents
        frequency: 'monthly',
        category: 'transport' as const,
      },
      {
        name: 'School Uniform Pack',
        description: 'Full school uniform set',
        amount: 250000, // R2,500 in cents
        frequency: 'once_off',
        category: 'uniform' as const,
      },
    ];

    const feeTypes = await Promise.all(
      feeTypeData.map((ft) =>
        FeeType.create({
          ...ft,
          schoolId: school._id,
          isActive: true,
        }),
      ),
    );
    logger.info(`${feeTypes.length} fee types created`);

    // ─── Menu Items (Tuck Shop) ───────────────────────────────────────────────
    logger.info('Creating tuck shop menu items...');
    const menuItemData = [
      {
        name: 'Simba Chips (Small)',
        description: 'Assorted flavours - 36g',
        price: 800, // R8.00 in cents
        category: 'snack' as const,
        stock: 100,
        allergenWarnings: [],
      },
      {
        name: 'Liqui-Fruit Juice Box',
        description: 'Apple or Orange - 250ml',
        price: 1000, // R10.00 in cents
        category: 'drink' as const,
        stock: 80,
        allergenWarnings: [],
      },
      {
        name: 'Cheese & Tomato Sandwich',
        description: 'Brown bread with cheddar and tomato',
        price: 1500, // R15.00 in cents
        category: 'meal' as const,
        stock: 50,
        allergenWarnings: ['Gluten', 'Dairy'],
      },
      {
        name: 'Chicken Mayo Wrap',
        description: 'Grilled chicken with mayo in a tortilla wrap',
        price: 2500, // R25.00 in cents
        category: 'meal' as const,
        stock: 40,
        allergenWarnings: ['Gluten', 'Egg'],
      },
      {
        name: 'Water Bottle',
        description: 'Still water - 500ml',
        price: 700, // R7.00 in cents
        category: 'drink' as const,
        stock: 120,
        allergenWarnings: [],
      },
      {
        name: 'Biltong Sticks',
        description: 'Beef biltong snap sticks - 2 pack',
        price: 1200, // R12.00 in cents
        category: 'snack' as const,
        stock: 60,
        allergenWarnings: [],
      },
      {
        name: 'Muffin',
        description: 'Freshly baked blueberry muffin',
        price: 1500, // R15.00 in cents
        category: 'snack' as const,
        stock: 30,
        isDailySpecial: true,
        allergenWarnings: ['Gluten', 'Dairy', 'Egg'],
      },
    ];

    const menuItems = await Promise.all(
      menuItemData.map((mi) =>
        MenuItem.create({
          ...mi,
          schoolId: school._id,
          isAvailable: true,
        }),
      ),
    );
    logger.info(`${menuItems.length} menu items created`);

    // ─── Announcements ────────────────────────────────────────────────────────
    logger.info('Creating announcements...');
    const announcements = await Promise.all([
      Announcement.create({
        title: 'Welcome to the 2026 Academic Year',
        content:
          'Dear parents and learners, welcome back to Greenfield Primary School! ' +
          'We are excited to begin a new year of learning and growth. Please ensure all ' +
          'stationery and uniforms are ready before the first day. Term 1 begins on 19 January 2026.',
        schoolId: school._id,
        authorId: schoolAdmin._id,
        targetAudience: 'all',
        priority: 'high',
        isPublished: true,
        publishedAt: new Date('2026-01-10'),
        pinned: true,
      }),
      Announcement.create({
        title: 'Parent-Teacher Meeting: Term 1',
        content:
          'A parent-teacher meeting has been scheduled for Friday 20 March 2026 from 14:00 to 16:00. ' +
          'Please book your 15-minute slot via the Campusly app or contact the school office. ' +
          'Refreshments will be served.',
        schoolId: school._id,
        authorId: schoolAdmin._id,
        targetAudience: 'parents',
        priority: 'medium',
        isPublished: true,
        publishedAt: new Date('2026-03-01'),
        pinned: false,
      }),
    ]);
    logger.info(`${announcements.length} announcements created`);

    // ─── Assessments & Marks ─────────────────────────────────────────────────
    logger.info('Creating assessments and marks...');

    const assessmentTemplates = [
      { name: 'Term 1 Test', type: 'test' as const, totalMarks: 50, weight: 25, term: 1 },
      { name: 'Term 1 Assignment', type: 'assignment' as const, totalMarks: 30, weight: 15, term: 1 },
      { name: 'Practical Assessment', type: 'practical' as const, totalMarks: 40, weight: 20, term: 1 },
    ];

    // Use first 2 subjects (English, Afrikaans) across all classes with students
    const seedSubjects = subjects.slice(0, 2);
    const allAssessments: mongoose.Document[] = [];
    let totalMarkCount = 0;

    for (const cls of classes) {
      // Find students assigned to this class
      const classStudents = students.filter((s, i) =>
        studentAssignments[i].classIndex === classes.indexOf(cls),
      );
      if (classStudents.length === 0) continue;

      for (const subj of seedSubjects) {
        for (const tpl of assessmentTemplates) {
          const assessment = await Assessment.create({
            name: `${subj.name} - ${tpl.name}`,
            subjectId: subj._id,
            classId: cls._id,
            schoolId: school._id,
            type: tpl.type,
            totalMarks: tpl.totalMarks,
            weight: tpl.weight,
            term: tpl.term,
            academicYear: 2026,
            date: new Date('2026-03-15'),
          });
          allAssessments.push(assessment);

          // Create random marks for each student (40-95% range)
          const markDocs = classStudents.map((student) => {
            const minMark = Math.round(0.4 * tpl.totalMarks);
            const maxMark = Math.round(0.95 * tpl.totalMarks);
            const mark = Math.round(minMark + Math.random() * (maxMark - minMark));
            return {
              assessmentId: assessment._id,
              studentId: student._id,
              schoolId: school._id,
              mark,
              total: tpl.totalMarks,
              percentage: Math.round((mark / tpl.totalMarks) * 100),
            };
          });

          await Mark.insertMany(markDocs);
          totalMarkCount += markDocs.length;
        }
      }
    }
    logger.info(`${allAssessments.length} assessments created with ${totalMarkCount} marks`);

    // ─── Summary ──────────────────────────────────────────────────────────────
    logger.info('\n========================================');
    logger.info('  Seed completed successfully!');
    logger.info('========================================');
    logger.info(`  School:        1 (${school.name})`);
    logger.info(`  Users:         ${1 + 1 + teachers.length + parentUsers.length + studentUsers.length} total`);
    logger.info(`    Super Admin: 1`);
    logger.info(`    School Admin:1`);
    logger.info(`    Teachers:    ${teachers.length}`);
    logger.info(`    Parents:     ${parentUsers.length}`);
    logger.info(`    Students:    ${studentUsers.length}`);
    logger.info(`  Grades:        ${grades.length}`);
    logger.info(`  Classes:       ${classes.length}`);
    logger.info(`  Subjects:      ${subjects.length}`);
    logger.info(`  Students:      ${students.length}`);
    logger.info(`  Parents:       ${parents.length}`);
    logger.info(`  Wallets:       ${wallets.length}`);
    logger.info(`  Fee Types:     ${feeTypes.length}`);
    logger.info(`  Menu Items:    ${menuItems.length}`);
    logger.info(`  Announcements: ${announcements.length}`);
    logger.info(`  Assessments:   ${allAssessments.length}`);
    logger.info(`  Marks:         ${totalMarkCount}`);
    logger.info('========================================');
    logger.info('  Default password for all users: Password1');
    logger.info('========================================\n');

    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Seed failed');
    process.exit(1);
  }
}

seed();
