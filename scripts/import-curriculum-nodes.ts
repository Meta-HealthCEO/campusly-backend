/**
 * Import parsed curriculum JSON into the database via the bulk import API.
 *
 * Usage:
 *   npx tsx scripts/import-curriculum-nodes.ts <json-file-or-dir> --api-url <url> --token <jwt>
 *
 * Example:
 *   npx tsx scripts/import-curriculum-nodes.ts scripts/output/ --api-url http://localhost:4500/api --token "eyJ..."
 *   npx tsx scripts/import-curriculum-nodes.ts scripts/output/caps-mathematics-gr10.json --api-url http://localhost:4500/api --token "eyJ..."
 */

import fs from 'fs';
import path from 'path';

interface ImportFile {
  path: string;
  frameworkId: string;
  nodes: Array<{
    type: string;
    parentCode: string | null;
    title: string;
    code: string;
    description: string;
    metadata: Record<string, unknown>;
    order: number;
  }>;
}

async function importFile(
  filePath: string,
  apiUrl: string,
  token: string,
  frameworkId: string,
): Promise<{ imported: number; skipped: number }> {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as ImportFile;

  // Use provided frameworkId or the one in the file
  const fwId = frameworkId || raw.frameworkId;
  if (!fwId || fwId === '<CAPS_FRAMEWORK_ID>') {
    throw new Error(`frameworkId not set in ${filePath}. Pass --framework-id or edit the JSON file.`);
  }

  const payload = {
    frameworkId: fwId,
    nodes: raw.nodes,
  };

  console.log(`  Importing ${raw.nodes.length} nodes...`);

  const response = await fetch(`${apiUrl}/curriculum-structure/nodes/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API error ${response.status}: ${body}`);
  }

  const result = (await response.json()) as { data: { imported: number; skipped: number; skippedCodes: string[] } };
  return { imported: result.data.imported, skipped: result.data.skipped };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: npx tsx scripts/import-curriculum-nodes.ts <json-file-or-dir> --api-url <url> --token <jwt> [--framework-id <id>]');
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);
  const apiUrlIdx = args.indexOf('--api-url');
  const tokenIdx = args.indexOf('--token');
  const fwIdx = args.indexOf('--framework-id');

  const apiUrl = apiUrlIdx !== -1 ? args[apiUrlIdx + 1] : 'http://localhost:4500/api';
  const token = tokenIdx !== -1 ? args[tokenIdx + 1] : '';
  const frameworkId = fwIdx !== -1 ? args[fwIdx + 1] : '';

  if (!token) {
    console.error('--token is required. Get a JWT by logging in as admin.');
    process.exit(1);
  }

  // Collect JSON files
  let jsonFiles: string[] = [];

  const stat = fs.statSync(inputPath);
  if (stat.isDirectory()) {
    jsonFiles = fs.readdirSync(inputPath)
      .filter((f) => f.endsWith('.json'))
      .map((f) => path.join(inputPath, f))
      .sort();
  } else {
    jsonFiles = [inputPath];
  }

  console.log(`Importing ${jsonFiles.length} file(s) to ${apiUrl}\n`);

  let totalImported = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const file of jsonFiles) {
    const basename = path.basename(file);
    console.log(`\n${basename}:`);

    try {
      const result = await importFile(file, apiUrl, token, frameworkId);
      totalImported += result.imported;
      totalSkipped += result.skipped;
      console.log(`  ✓ Imported: ${result.imported}, Skipped: ${result.skipped}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ FAILED: ${msg}`);
      totalFailed++;
    }
  }

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Total imported: ${totalImported}`);
  console.log(`Total skipped: ${totalSkipped}`);
  console.log(`Total failed: ${totalFailed}`);
}

main().catch((err) => {
  console.error('Error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
