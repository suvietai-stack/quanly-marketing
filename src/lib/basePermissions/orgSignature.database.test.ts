import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, expect, it } from 'vitest';
const db = new PGlite();
const root = 'docs/org-signature-2026-11-12/';
const canon = '11111111-1111-1111-1111-111111111111';
const user = '22222222-2222-2222-2222-222222222222';
const change = [{ op: 'assign', id: canon, unit_id: 'kdqt2', title_id: 'nvkd', user_id: user, starts_at: '2026-11-12T08:00:00Z' }];
const mem = (id: string, o: Record<string, unknown> = {}) => ({ id, slot_id: null, unit_id: 'kdqt2', title_id: null, user_id: user, category: 'primary', starts_at: '2026-11-12T08:00:00+00', ends_at: null, status: 'active', ...o });
const cfg = (projId: string, extra: Record<string, unknown> = {}) => ({ units: [], titles: [], defaults: [], bundles: [], grants: [], bindings: [], memberships: [mem('existing-a', { user_id: '33333333-3333-3333-3333-333333333333' }), mem(canon, { title_id: 'nvkd', category: 'appointment' }), mem(projId, extra)] });
const sig = async (file: string, c: unknown, ch: unknown = change) => {
  await db.exec('drop schema if exists private cascade; create schema private;');
  await db.exec(readFileSync(root + file, 'utf8'));
  return (await db.query<{ v: unknown }>('select private.org_effect_signature($1::jsonb,$2::jsonb) v', [JSON.stringify(c), JSON.stringify(ch)])).rows[0].v;
};
beforeAll(async () => { await db.waitReady; });

it('rollback (live) definition reproduces the bug: random projection IDs break parity', async () => {
  expect(await sig('rollback.sql', cfg('proj-run-1'))).not.toEqual(await sig('rollback.sql', cfg('proj-run-2')));
});
it('candidate: two executions of the same normalized change match despite random projection IDs', async () => {
  expect(await sig('candidate.sql', cfg('proj-run-1'))).toEqual(await sig('candidate.sql', cfg('proj-run-2')));
});
it('candidate still keeps the canonical appointment ID named in the change', async () => {
  const s = await sig('candidate.sql', cfg('p')) as { assignments: { id: string | null }[] };
  expect(s.assignments.some((a) => a.id === canon)).toBe(true);
});
it('candidate still fails for real changes: unit, person, time, status, extra member', async () => {
  const base = await sig('candidate.sql', cfg('p1'));
  for (const extra of [{ unit_id: 'other' }, { user_id: '44444444-4444-4444-4444-444444444444' }, { starts_at: '2026-11-13T08:00:00+00' }, { ends_at: '2026-12-01T00:00:00+00' }, { status: 'ended' }])
    expect(await sig('candidate.sql', cfg('p2', extra))).not.toEqual(base);
  const two = cfg('p2'); two.memberships.push(mem('p3'));
  expect(await sig('candidate.sql', two)).not.toEqual(base);
});
it('candidate detects a different canonical ID in the change (tampering)', async () => {
  const other = [{ ...change[0], id: '55555555-5555-5555-5555-555555555555' }];
  const c2 = cfg('p'); c2.memberships[1].id = '55555555-5555-5555-5555-555555555555';
  expect(await sig('candidate.sql', c2, other)).not.toEqual(await sig('candidate.sql', cfg('p')));
});
it('candidate keeps permissions, role links and slots in the signature', async () => {
  const a = await sig('candidate.sql', cfg('p'));
  expect(await sig('candidate.sql', { ...cfg('p'), grants: [{ key: 'x' }] })).not.toEqual(a);
  expect(await sig('candidate.sql', { ...cfg('p'), role_links: [{ role_id: 'r' }] })).not.toEqual(a);
  expect(await sig('candidate.sql', { ...cfg('p'), position_slots: [{ id: 's' }] })).not.toEqual(a);
});
