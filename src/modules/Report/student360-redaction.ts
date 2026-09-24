/** Parts of the Student 360 a teacher has no need to see (money matters stay with parents and the office). */
const HIDDEN_FROM_TEACHERS = new Set(['fees', 'wallet']);

export function redactStudent360ForRole<T extends object>(data: T, role: string): Partial<T> {
  if (role !== 'teacher') return data;
  return Object.fromEntries(
    Object.entries(data).filter(([key]: [string, unknown]) => !HIDDEN_FROM_TEACHERS.has(key)),
  ) as Partial<T>;
}
