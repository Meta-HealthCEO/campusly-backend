export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SCHOOL_ADMIN = 'school_admin',
  TEACHER = 'teacher',
  PARENT = 'parent',
  STUDENT = 'student',
  SGB_MEMBER = 'sgb_member',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

export enum PaymentMethod {
  WALLET = 'wallet',
  WRISTBAND = 'wristband',
  CASH = 'cash',
}

export enum FeeFrequency {
  ONCE_OFF = 'once_off',
  PER_TERM = 'per_term',
  PER_YEAR = 'per_year',
  MONTHLY = 'monthly',
}

export enum InvoiceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIAL = 'partial',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum TransactionType {
  LOAD = 'load',
  PURCHASE = 'purchase',
  REFUND = 'refund',
}

export enum HomeworkStatus {
  ASSIGNED = 'assigned',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  LATE = 'late',
}

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}
