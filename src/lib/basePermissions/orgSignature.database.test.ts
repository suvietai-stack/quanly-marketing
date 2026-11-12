import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, expect, it } from 'vitest';
// Isolated fixture for private.org_effect_signature (docs/org-signature-2026-11-12). Never touches production.
const db = new PGlite();
const root = 'docs/org-signature-2026-11-12/';
const canon = '11111111-1111-1111-1111-111111111111';
const user = '22222222-2222-2222-2222-222222222222';
const other = '33333333-3333-3333-3333-333333333333';
const at = '2026-11-12T08:00:00+00:00';
type M = Record<string, unknown>;
type C = { units: M[]; memberships: M[]; [k: string]: unknown };
const assign = (o: M = {}) => ({ action: 'assign', data: { id: canon, unit_id: 'team-kdqt2', title_id: 'nvkd', user_id: user, starts_at: at, ...o } });
const mem = (id: string, o: M = {}): M => ({ id, slot_id: null, unit_id: 'dep-kd', title_id: null, user_id: user, category: 'primary', starts_at: '2026-11-12T08:00:00+00:00', ends_at: null, status: 'active', source: 'biz_department_members', ...o });
const legacy = () => [mem('legacy-1', { user_id: other }), mem('legacy-2', { user_id: other, source: 'base', category: 'appointment', title_id: 't' })];
const cfg = (projected: M[], extra: M[] = []): C => ({ units: [{ id: 'team-kdqt2', parent_id: 'dep-kd' }, { id: 'dep-kd', parent_id: 'sys' }], titles: [], defaults: [], bundles: [], grants: [], bindings: [],
  memberships: [...legacy(), mem(canon, { unit_id: 'team-kdqt2', title_id: 'nvkd', category: 'appointment', source: 'base' }), ...projected, ...extra] });
let loaded = '';
const load = async (file: string) => {
  if (loaded === file) return;
  await db.exec('drop schema if exists private cascade; create schema private;');
  await db.exec(readFileSync(root + 'rollback.sql', 'utf8'));
  await db.exec('revoke all on function private.org_effect_signature(jsonb,jsonb) from public');
  if (file !== 'rollback.sql') await db.exec(readFileSync(root + file, 'utf8'));
  loaded = file;
};
const sig = async (file: string, c: unknown, ch: unknown = [assign()]) => { await load(file);
  return (await db.query<{ v: unknown }>('select private.org_effect_signature($1::jsonb,$2::jsonb) v', [JSON.stringify(c), JSON.stringify(ch)])).rows[0].v; };
const S = (c: unknown, ch?: unknown) => sig('candidate.sql', c, ch);
const run = (id: string) => mem(id); // projected primary member, random UUID per execution
beforeAll(async () => { await db.waitReady; });

it('preflight guard accepts the exact rollback definition and owner/ACL', async () => {
  await load('candidate.sql');
  const r = await db.query<{ v: string }>("select pg_get_userbyid(proowner)||'|'||proacl::text v from pg_proc where oid='private.org_effect_signature(jsonb,jsonb)'::regprocedure");
  expect(r.rows[0].v).toBe('postgres|{postgres=X/postgres}');
});
it('preflight guard refuses to run on a non-matching live definition', async () => {
  await load('candidate.sql'); loaded = '';
  await expect(db.exec(readFileSync(root + 'candidate.sql', 'utf8'))).rejects.toThrow('preflight');
});
it('live definition reproduces the loop: random projection IDs break parity', async () => {
  expect(await sig('rollback.sql', cfg([run('rand-1')]))).not.toEqual(await sig('rollback.sql', cfg([run('rand-2')])));
});
it('1) generated business row ID may vary between preview and apply', async () => {
  expect(await S(cfg([run('rand-1')]))).toEqual(await S(cfg([run('rand-2')])));
});
it('parity with canonical + two synthetic rows in the same transaction (multiplicity kept)', async () => {
  const two = (a: string, b: string) => cfg([run(a), mem(b, { unit_id: 'team-kdqt2', category: 'team', source: 'biz_team_members' })]);
  expect(await S(two('a1', 'b1'))).toEqual(await S(two('a2', 'b2')));
  expect(await S(two('a1', 'b1'))).not.toEqual(await S(cfg([run('a1')])));
  const dup = (await S(cfg([run('x'), run('y')]))) as { assignments: unknown[] };
  expect(dup.assignments.length).toBe(5);
});
it('2) unrelated existing row ID change FAILS', async () => {
  const c = cfg([run('r')]); c.memberships[0].id = 'legacy-1-changed';
  expect(await S(c)).not.toEqual(await S(cfg([run('r')])));
});
it('3) canonical appointment ID change FAILS', async () => {
  const c = cfg([run('r')]); c.memberships[2].id = '55555555-5555-5555-5555-555555555555';
  expect(await S(c, [assign({ id: '55555555-5555-5555-5555-555555555555' })])).not.toEqual(await S(cfg([run('r')])));
  const s = (await S(cfg([run('r')]))) as { assignments: { id: string }[] };
  expect(s.assignments.some((a) => a.id === canon)).toBe(true);
});
it('4) unit/person/category/status/time changes FAIL', async () => {
  const base = await S(cfg([run('p1')]));
  for (const o of [{ unit_id: 'dep-other' }, { user_id: '44444444-4444-4444-4444-444444444444' }, { category: 'concurrent' }, { status: 'ended' }, { starts_at: '2026-11-13T08:00:00+00:00' }, { ends_at: '2026-12-01T00:00:00+00:00' }])
    expect(await S(cfg([mem('p2', o)]))).not.toEqual(base);
});
it('5) extra membership FAILS', async () => {
  expect(await S(cfg([run('p1'), run('p2')]))).not.toEqual(await S(cfg([run('p1')])));
});
it('6) fake unrelated business row with changed ID FAILS (other user / titled / other time)', async () => {
  for (const o of [{ user_id: other }, { title_id: 'nvkd' }, { starts_at: '2026-10-01T00:00:00+00:00' }, { unit_id: 'unrelated-dep' }]) {
    const a = await S(cfg([run('p')], [mem('fake-1', o)])); const b = await S(cfg([run('p')], [mem('fake-2', o)]));
    expect(a).not.toEqual(b);
  }
  // business-sourced row without any matching assign keeps exact UUID
  expect(await S(cfg([run('p1')]), [{ action: 'unit', data: { id: 'u' } }])).not.toEqual(await S(cfg([run('p2')]), [{ action: 'unit', data: { id: 'u' } }]));
});
it('end action / explicitly named source id preserves exact ID even for business rows', async () => {
  const ch = (id: string) => [assign(), { action: 'end', data: { id, ends_at: at } }];
  expect(await S(cfg([run('n1')]), ch('n1'))).not.toEqual(await S(cfg([run('n2')]), ch('n2')));
  const named = (id: string) => [assign(), { action: 'end', data: { ids: [id] } }];
  expect(await S(cfg([run('n1')]), named('n1'))).not.toEqual(await S(cfg([run('n2')]), named('n2')));
  const src = (sid: string) => cfg([mem('s1', { source_id: sid })]);
  expect(await S(src('k1'), [assign(), { action: 'end', data: { source_id: 'k1' } }])).not.toEqual(await S(cfg([mem('s1')]), [assign()]));
});
it('7) transfer/concurrent previews keep parity; concurrent affiliation rows normalize', async () => {
  const aff = (id: string) => cfg([mem(id, { source: 'biz_member_affiliations', category: 'concurrent' })]);
  expect(await S(aff('c1'), [assign({ kind: 'concurrent' })])).toEqual(await S(aff('c2'), [assign({ kind: 'concurrent' })]));
  const tr = (id: string) => { const c = cfg([run(id)]); c.memberships[0] = { ...c.memberships[0], ends_at: at }; return c; };
  expect(await S(tr('t1'))).toEqual(await S(tr('t2')));
  expect(await S(tr('t1'))).not.toEqual(await S(cfg([run('t1')])));
  // mismatched source/category pair is never normalized
  const bad = (id: string) => cfg([mem(id, { source: 'biz_member_affiliations', category: 'primary' })]);
  expect(await S(bad('b1'))).not.toEqual(await S(bad('b2')));
});
it('8) unchanged legacy member IDs remain significant', async () => {
  const s = (await S(cfg([run('r')]))) as { assignments: { id: string }[] };
  expect(s.assignments.map((a) => a.id)).toEqual(expect.arrayContaining(['legacy-1', 'legacy-2', canon]));
  expect(s.assignments.filter((a) => a.id.startsWith('projected:')).length).toBe(1);
});
it('permissions, role links and slots stay in the signature', async () => {
  const a = await S(cfg([run('p')]));
  expect(await S({ ...cfg([run('p')]), grants: [{ key: 'x' }] })).not.toEqual(a);
  expect(await S({ ...cfg([run('p')]), role_links: [{ role_id: 'r' }] })).not.toEqual(a);
  expect(await S({ ...cfg([run('p')]), position_slots: [{ id: 's' }] })).not.toEqual(a);
});
it('candidate never uses text substring matching on the change', () => {
  expect(readFileSync(root + 'candidate.sql', 'utf8')).not.toMatch(/position\s*\(/i);
});
