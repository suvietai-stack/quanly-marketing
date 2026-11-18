import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const roots = ['src'];
const patterns = [
  { label: 'Unscoped query invalidation', pattern: /\binvalidateQueries\(\s*\)/g },
  { label: 'Query polling', pattern: /\brefetchInterval\s*:/g },
  { label: 'Timer polling', pattern: /\bsetInterval\s*\(/g },
  { label: 'Force refresh of access', pattern: /\brefresh(?:Base|Biz)Access\(true\)/g },
  { label: 'Profiles presence writes', pattern: /last_seen_at[^\n]{0,100}(?:update|nowIso)|update\([^\n]*last_seen_at/g },
  { label: 'Heavy full-row SELECT', pattern: /\.select\(\s*['"]\*['"]\s*\)/g },
  { label: 'Broad query predicate invalidation', pattern: /\binvalidateQueries\(\s*\{\s*predicate\s*:/g },
  { label: 'Deadline auto-notify caller', pattern: /biz_deadline_auto_notify/g },
];
const rows = new Map(patterns.map(p => [p.label, []]));
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) { walk(path); continue; }
    if (!/\.(tsx?|jsx?)$/.test(entry.name) || /\.test\.|\.spec\.|\.gen\./.test(entry.name)) continue;
    const file = relative('.', path).replaceAll('\\', '/');
    const lines = readFileSync(path, 'utf8').split('\n');
    for (const [i, line] of lines.entries()) {
      for (const { label, pattern } of patterns) {
        pattern.lastIndex = 0;
        if (pattern.test(line)) rows.get(label).push(file + ':' + (i+1));
      }
    }
  }
}
for (const root of roots) walk(root);
console.log('BASE LOAD CODE INVENTORY — code patterns, not runtime latency');
for (const { label } of patterns) {
  const found = rows.get(label);
  console.log('\n' + label + ' (' + found.length + ' occurrences)');
  console.log(found.slice(0, 25).map(x => '  ' + x).join('\n') || '  none');
}
