#!/usr/bin/env node
/**
 * Read-only integrity check for the STAGED 510-key permission migration.
 * This checks file hashes and key accounting, NOT live DB drift, RLS parity,
 * effective permissions or whether applying the SQL would be safe.
 * Usage: node scripts/check-role-510-package.mjs
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dir = join(root, 'docs', 'role-permission-full-2026-11-12');
const manifest = readFileSync(join(dir, 'SHA256SUMS'), 'utf8').trim().split(/\r?\n/);
let failures = 0;
const fail = message => { console.error('FAIL:', message); failures++; };
for (const line of manifest) {
  const match = /^([0-9a-f]{64})\s+([\w.-]+)$/.exec(line.trim());
  if (!match) { fail('Invalid SHA256SUMS line'); continue; }
  const [, expected, name] = match;
  let actual;
  try {
    actual = createHash('sha256').update(readFileSync(join(dir, name))).digest('hex');
  } catch {
    fail('Missing package file: ' + name);
    continue;
  }
  if (actual !== expected) fail('Checksum mismatch: ' + name);
}
const keys = JSON.parse(readFileSync(join(dir, 'keys.json'), 'utf8'));
const old = keys.previously_resolver_ready;
const newly = keys.newly_routed;
const fence = keys.fence;
if (keys.catalog !== 510) fail('Catalog count is not 510');
if (!Array.isArray(old) || old.length !== 195 || new Set(old).size !== old.length) fail('Invalid existing ready set');
if (!Array.isArray(newly) || newly.length !== 315 || new Set(newly).size !== newly.length) fail('Invalid newly routed set');
if (Array.isArray(old) && Array.isArray(newly) && new Set([...old, ...newly]).size !== 510) fail('Ready and routed sets must be disjoint');
if (!Array.isArray(fence) || fence.length !== 930 || fence.some(pair => !Array.isArray(pair) || pair.length !== 2 || pair.some(v => typeof v !== 'string'))) fail('Invalid dormant fence');
if (failures) {
  console.error('Staged permission package is NOT ready for review:', failures, 'error(s).');
  process.exitCode = 1;
} else {
  console.log('PASS: staged SQL package SHA256 and key accounting (510 = 195 + 315; 930 dormant pairs).');
  console.log('NOT VERIFIED: production baseline, RLS/API enforcement, actual grant semantics, deployment.');
}
