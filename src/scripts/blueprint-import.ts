// src/scripts/blueprint-import.ts
//
// npm run blueprint:import -- --file=scripts/blueprints/<family>-<year>.json [--apply]
// Dry run by default: prints the validation report. --apply saves the file as the family's draft for its year
// (never publishes; publishing is the super-admin page's job).
import { readFileSync } from 'node:fs';
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { importDraft, validateRaw } from '../modules/Readiness/blueprint-service.js';

function arg(name: string): string | undefined {
  const hit = process.argv.find((a: string) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
}

async function main(): Promise<void> {
  const file = arg('file');
  if (!file) throw new Error('Usage: npm run blueprint:import -- --file=<path> [--apply]');
  const raw: unknown = JSON.parse(readFileSync(file, 'utf8'));
  await mongoose.connect(config.mongodb.uri);
  const apply = process.argv.includes('--apply');
  const report = apply ? (await importDraft(raw)).report : await validateRaw(raw);
  const out = (title: string, lines: string[]) => console.log(`\n${title} (${lines.length})\n${lines.map((l) => `  - ${l}`).join('\n')}`);
  out('Parse errors', report.parseErrors);
  out('Errors', report.errors);
  out('Warnings', report.warnings);
  out('Unverified', report.unverified);
  console.log(apply ? (report.data ? '\nSaved as draft.' : '\nNot saved.') : '\nDry run: nothing saved (add --apply).');
  await mongoose.disconnect();
  if (report.parseErrors.length > 0 || report.errors.length > 0) process.exitCode = 1;
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
