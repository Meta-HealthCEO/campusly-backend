import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { User } from '../modules/Auth/model.js';
import { School } from '../modules/School/model.js';
import { Student } from '../modules/Student/model.js';
import { Parent } from '../modules/Parent/model.js';
import { Wallet } from '../modules/Wallet/model.js';
import { Grade, Class, Subject } from '../modules/Academic/model.js';
import { FeeType } from '../modules/Fee/model.js';
import { MenuItem } from '../modules/TuckShop/model.js';
import { Announcement } from '../modules/Announcement/model.js';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');

    // ─── Clear all collections ────────────────────────────────────────────────
    console.log('Clearing all collections...');
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
    console.log('All collections cleared');

    // ─── School ───────────────────────────────────────────────────────────────
    console.log('Creating school...');
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
    console.log(`School created: ${school.name} (${school._id})`);

    // ─── Users ────────────────────────────────────────────────────────────────
    console.log('Creating users...');

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
    console.log(`Super admin created: ${superAdmin.email}`);

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
    console.log(`School admin created: ${schoolAdmin.email}`);

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
    console.log(`${teachers.length} teachers created`);

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
    console.log(`${parentUsers.length} parent users created`);

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
    console.log(`${studentUsers.length} student users created`);

    // ─── Grades ───────────────────────────────────────────────────────────────
    console.log('Creating grades...');
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
    console.log(`${grades.length} grades created`);

    // ─── Classes ──────────────────────────────────────────────────────────────
    console.log('Creating classes...');
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
    console.log(`${classes.length} classes created`);

    // ─── Subjects ─────────────────────────────────────────────────────────────
    console.log('Creating subjects...');
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
    console.log(`${subjects.length} subjects created`);

    // ─── Students ─────────────────────────────────────────────────────────────
    console.log('Creating students...');

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
    console.log(`${students.length} students created`);

    // ─── Parents ──────────────────────────────────────────────────────────────
    console.log('Creating parents...');

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
    console.log(`${parents.length} parents created`);

    // Update students with guardian references
    console.log('Linking students to parents...');
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
    console.log('Students linked to parents');

    // ─── Wallets ──────────────────────────────────────────────────────────────
    console.log('Creating wallets...');
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
    console.log(`${wallets.length} wallets created (balances in cents)`);

    // ─── Fee Types ────────────────────────────────────────────────────────────
    console.log('Creating fee types...');
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
    console.log(`${feeTypes.length} fee types created`);

    // ─── Menu Items (Tuck Shop) ───────────────────────────────────────────────
    console.log('Creating tuck shop menu items...');
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
    console.log(`${menuItems.length} menu items created`);

    // ─── Announcements ────────────────────────────────────────────────────────
    console.log('Creating announcements...');
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
    console.log(`${announcements.length} announcements created`);

    // ─── Summary ──────────────────────────────────────────────────────────────
    console.log('\n========================================');
    console.log('  Seed completed successfully!');
    console.log('========================================');
    console.log(`  School:        1 (${school.name})`);
    console.log(`  Users:         ${1 + 1 + teachers.length + parentUsers.length + studentUsers.length} total`);
    console.log(`    Super Admin: 1`);
    console.log(`    School Admin:1`);
    console.log(`    Teachers:    ${teachers.length}`);
    console.log(`    Parents:     ${parentUsers.length}`);
    console.log(`    Students:    ${studentUsers.length}`);
    console.log(`  Grades:        ${grades.length}`);
    console.log(`  Classes:       ${classes.length}`);
    console.log(`  Subjects:      ${subjects.length}`);
    console.log(`  Students:      ${students.length}`);
    console.log(`  Parents:       ${parents.length}`);
    console.log(`  Wallets:       ${wallets.length}`);
    console.log(`  Fee Types:     ${feeTypes.length}`);
    console.log(`  Menu Items:    ${menuItems.length}`);
    console.log(`  Announcements: ${announcements.length}`);
    console.log('========================================');
    console.log('  Default password for all users: Password1');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
