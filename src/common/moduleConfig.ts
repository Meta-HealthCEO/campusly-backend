// ─── Module Classification ─────────────────────────────────────────────────
// Core modules are always enabled and included in the base subscription.
// Bolt-on modules are paid add-ons that must be in school.modulesEnabled.

export const CORE_MODULES = [
  'auth',
  'school',
  'student',
  'parent',
  'notification',
  'announcement',
  'report',
  'audit',
] as const;

export const BOLT_ON_MODULES = [
  'fee',
  'wallet',
  'tuckshop',
  'academic',
  'homework',
  'attendance',
  'achiever',
  'consent',
  'sport',
  'uniform',
  'event',
  'fundraising',
  'transport',
  'aftercare',
  'migration',
  'learning',
  'lost_found',
  'ai_tools',
  'teacher_workbench',
  'careers',
] as const;

export const ALL_MODULES = [...CORE_MODULES, ...BOLT_ON_MODULES] as const;

export type CoreModule = (typeof CORE_MODULES)[number];
export type BoltOnModule = (typeof BOLT_ON_MODULES)[number];
export type ModuleName = (typeof ALL_MODULES)[number];

// Grouped for pricing display
export const MODULE_PACKAGES: Record<string, { label: string; modules: readonly BoltOnModule[] }> = {
  finance: {
    label: 'Finance',
    modules: ['fee'],
  },
  wallet_tuckshop: {
    label: 'Wallet & Tuck Shop',
    modules: ['wallet', 'tuckshop'],
  },
  academics: {
    label: 'Academics',
    modules: ['academic', 'homework'],
  },
  teacher_tools: {
    label: 'Teacher Tools',
    modules: ['attendance'],
  },
  gamification: {
    label: 'Gamification',
    modules: ['achiever'],
  },
  compliance: {
    label: 'Compliance',
    modules: ['consent'],
  },
  sports: {
    label: 'Sports',
    modules: ['sport'],
  },
  uniform_shop: {
    label: 'Uniform Shop',
    modules: ['uniform'],
  },
  events: {
    label: 'Events',
    modules: ['event'],
  },
  fundraising: {
    label: 'Fundraising',
    modules: ['fundraising'],
  },
  transport: {
    label: 'Transport',
    modules: ['transport'],
  },
  aftercare: {
    label: 'After Care',
    modules: ['aftercare'],
  },
  migration: {
    label: 'Data Migration',
    modules: ['migration'],
  },
  learning: {
    label: 'Learning Platform',
    modules: ['learning', 'homework'],
  },
  lost_found: {
    label: 'Lost & Found',
    modules: ['lost_found'],
  },
  ai_tools: {
    label: 'AI Teacher Tools',
    modules: ['ai_tools'],
  },
  careers: {
    label: 'Career Guidance',
    modules: ['careers'],
  },
  teacher_workbench: {
    label: 'Teacher Workbench',
    modules: ['teacher_workbench'],
  },
};

export function isCoreModule(moduleName: string): boolean {
  return (CORE_MODULES as readonly string[]).includes(moduleName);
}

export function isBoltOnModule(moduleName: string): boolean {
  return (BOLT_ON_MODULES as readonly string[]).includes(moduleName);
}
