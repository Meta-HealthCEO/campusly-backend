/** Parts of the Student 360 a teacher has no need to see (money matters stay with parents and the office). */
const HIDDEN_FROM_TEACHERS = new Set(['fees', 'wallet']);
/** The adults linked to a learner are for staff; a parent never sees who else is linked (custody, protection orders). */
const STAFF_ONLY = new Set(['parents']);
const STAFF = new Set(['teacher', 'school_admin', 'super_admin']);

export function redactStudent360ForRole<T extends object>(data: T, role: string): Partial<T> {
  const hidden = role === 'teacher' ? HIDDEN_FROM_TEACHERS : STAFF.has(role) ? new Set<string>() : STAFF_ONLY;
  if (hidden.size === 0) return data;
  return Object.fromEntries(
    Object.entries(data).filter(([key]: [string, unknown]) => !hidden.has(key)),
  ) as Partial<T>;
}
