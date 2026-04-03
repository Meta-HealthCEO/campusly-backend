import { CurriculumFramework } from '../TeacherWorkbench/model.js';

export async function seedSystemFrameworks(): Promise<void> {
  const systemFrameworks = [
    {
      name: 'CAPS',
      description: 'Curriculum and Assessment Policy Statement — South African national curriculum (Grades R-12)',
      isDefault: true,
    },
    {
      name: 'IEB',
      description: 'Independent Examinations Board — IEB assessment overlay on CAPS curriculum',
      isDefault: false,
    },
    {
      name: 'Cambridge',
      description: 'Cambridge International — IGCSE, AS Level, and A Level curricula',
      isDefault: false,
    },
  ];

  for (const fw of systemFrameworks) {
    await CurriculumFramework.findOneAndUpdate(
      { name: fw.name, schoolId: null },
      {
        $setOnInsert: {
          schoolId: null,
          name: fw.name,
          description: fw.description,
          isDefault: fw.isDefault,
          createdBy: null,
          isDeleted: false,
        },
      },
      { upsert: true },
    );
  }

  console.log('System curriculum frameworks seeded (CAPS, IEB, Cambridge)');
}
