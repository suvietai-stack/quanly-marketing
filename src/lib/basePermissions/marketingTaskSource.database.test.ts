import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MKT_READY } from './marketingReady';
import roles from './fixtures/marketingTaskRoles.snapshot.json';
import { permissionPresets } from './permissionEditor';

// Chạy luật SQL thật trong docs/pending/0372 trên Postgres (PGlite) với bản chụp Role nhiệm vụ live; không động dữ liệu thật.
const db = new PGlite();
const NGOC = '00000000-0000-0000-0000-00000000c001'; // fixture "Lê Minh Ngọc"
const PEER = '00000000-0000-0000-0000-00000000c002';
const SALE = '00000000-0000-0000-0000-00000000c003'; // ngoài hệ Marketing
const DESIGN = '00000000-0000-0000-0000-00000000c004';
const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const arr = (xs: string[]) => `array[${xs.map(q).join(',') || "''"}]::text[]`;

beforeAll(async () => {
  const roleRows = Object.entries(roles as Record<string, { name: string; permissions: string[]; role_kind: string }>)
    .map(([id, r]) => `(${q(id)},${q(r.name)},${q(r.role_kind)},'standard',${arr(r.permissions)})`).join(',');
  await db.exec(`create schema private;
  create table profiles(id uuid primary key, status text);
  create table app_roles(id text primary key, name text, role_kind text, catalog_state text, permissions text[]);
  create table mkt_specialties(id text primary key, name text, role_id text, active boolean);
  create table mkt_staff_specialties(user_id uuid, specialty_id text, state text, eligibility_enforced boolean);
  create table private.legacy_reset_accounts(user_id uuid, active boolean);
  create table personal(user_id uuid, permission text);
  create table user_roles(user_id uuid, role_id text);
  create table cfg(c jsonb);
  insert into app_roles values ${roleRows}, ('role-photo','Chụp ảnh','specialty','standard',array['order.take','order.view_mine']);
  insert into mkt_specialties values ('content','Content Web','role-content-web',true),('social','Social','role-social',true),('video','Video','role-video',true),('photo','Chụp ảnh','role-photo',true);
  create function private.is_active(u uuid) returns boolean language sql as $$ select exists(select 1 from profiles where id=u and status='Đang hoạt động') $$;
  create function private.is_super_admin(u uuid) returns boolean language sql as $$ select false $$;
  create function private.base_valid_at(m jsonb) returns boolean language sql as $$ select coalesce((m->>'ends_at')::timestamptz > now(), true) $$;
  create function private.base_role_unit_contains(c jsonb, root text, unit text) returns boolean language plpgsql as $$
   declare cur text := unit; i int := 0; begin
   while cur is not null and i < 20 loop if cur = root then return true; end if;
     select x->>'parent_id' into cur from jsonb_array_elements(c->'units') x where x->>'id'=cur; i := i+1; end loop; return false; end $$;
  create function private.mkt_specialty_permission_ready(p text) returns boolean language sql immutable as $$ select p = any(${arr([...MKT_READY])}) $$;
  create function private.org_role_permission_ready(p text) returns boolean language sql immutable as $$ select private.mkt_specialty_permission_ready(p) $$;
  create function private.org_marketing_eligible(u uuid, c jsonb) returns boolean language sql as $$ SELECT private.is_active(u) AND EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(c->'memberships','[]')) m JOIN LATERAL jsonb_array_elements(coalesce(c->'titles','[]')) t ON t->>'id'=m->>'title_id' WHERE m->>'user_id'=u::text AND private.base_valid_at(m) AND coalesce(m->>'status','active')='active' AND coalesce((t->>'active')::boolean,false) AND EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(c->'units','[]')) b WHERE b->>'kind'='block' AND (b->>'code'='marketing') AND coalesce((b->>'active')::boolean,true) AND private.base_role_unit_contains(c,b->>'id',m->>'unit_id'))) $$;
  create function private.mkt_prev_rules(u uuid, c jsonb) returns jsonb language sql as $$ select coalesce(jsonb_agg(jsonb_build_object('permission',permission,'effect','ALLOW','source_kind','personal')),'[]') from personal where user_id=u $$;
  create function private.slot_previous_source_rows(c jsonb) returns table(user_id uuid,role_id text,source_kind text) language sql as $f$ select m.user_id,r.id,'task'::text from mkt_staff_specialties m join mkt_specialties s on s.id=m.specialty_id join app_roles r on r.id=s.role_id where (r.role_kind<>'marketing_task' OR NOT m.eligibility_enforced OR private.org_marketing_eligible(m.user_id,c)) $f$;
  create function private.role_source_rows(c jsonb) returns table(user_id uuid,role_id text,source_kind text) language sql as $f$ select * from private.slot_previous_source_rows(c) union all select (m->>'user_id')::uuid,r.id,'task'::text from jsonb_array_elements(c->'memberships') m cross join lateral jsonb_array_elements_text(coalesce(m->'specialty_ids','[]')) sid join mkt_specialties s on s.id=sid join app_roles r on r.id=s.role_id where m->'specialty_signatures'->>s.id=md5(coalesce(r.permissions,'{}')::text) $f$;
  create function private.base_config() returns jsonb language sql as $$ select c from cfg $$;
  create function private.has_permission(_user_id uuid,_permission text) returns boolean language sql as $$ select exists(select 1 from user_roles ur join app_roles r on r.id=ur.role_id where ur.user_id=_user_id AND _permission=ANY(r.permissions)) $$;`);
  // Bộ lọc mkt_specialty_rules gọi trước phase3a; tạo phase3a/reset sau khi nạp file pending.
  const pending = readFileSync('docs/pending/0372_marketing_task_role_is_source.sql', 'utf8');
  await db.exec(`create function private.phase3a_previous_rules(u uuid, c jsonb) returns jsonb language sql as $$ select '[]'::jsonb $$;
   create function private.org_assignment_specialty_rules(u uuid, c jsonb) returns jsonb language sql as $$ select '[]'::jsonb $$;
   create function private.reset_previous_base_rules(u uuid, c jsonb) returns jsonb language sql as $$ select private.phase3a_previous_rules(u,c)||private.org_assignment_specialty_rules(u,c) $$;
   create function private.legacy_reset_applies(u uuid) returns boolean language sql as $$ select exists(select 1 from private.legacy_reset_accounts where user_id=u and active) and not private.is_super_admin(u) $$;`);
  await db.exec(pending);
  await db.exec(`create or replace function private.phase3a_previous_rules(u uuid, c jsonb) returns jsonb language sql as $$ select private.mkt_prev_rules(u,c)||private.mkt_specialty_rules(u,c) $$;
   create function has(u uuid, p text) returns boolean language sql as $$ with r as (select x from cfg, jsonb_array_elements(private.base_rules(u, cfg.c)) x)
     select exists(select 1 from r where x->>'permission'=p and x->>'effect'='ALLOW') and not exists(select 1 from r where x->>'permission'=p and x->>'effect'='DENY') $$;`);
  await db.exec(`insert into profiles values ('${NGOC}','Đang hoạt động'),('${PEER}','Đang hoạt động'),('${SALE}','Đang hoạt động'),('${DESIGN}','Đang hoạt động');
   insert into private.legacy_reset_accounts values ('${NGOC}',true),('${PEER}',true),('${SALE}',true),('${DESIGN}',true);`);
  await setMemberships([['m1', NGOC, 'mkt-content'], ['m2', PEER, 'mkt-content'], ['m3', SALE, 'sales'], ['m4', DESIGN, 'sales']]);
}, 60000);
afterAll(() => db.close());

async function setMemberships(ms: [string, string, string, string[]?][]) {
  const c = { units: [{ id: 'co', kind: 'company' }, { id: 'mkt', kind: 'block', code: 'marketing', parent_id: 'co' }, { id: 'mkt-content', kind: 'department', parent_id: 'mkt' }, { id: 'sales', kind: 'department', parent_id: 'co' }],
    titles: [{ id: 't', active: true }], memberships: ms.map(([id, user_id, unit_id, specialty_ids]) => ({ id, user_id, unit_id, title_id: 't', status: 'active', specialty_ids: specialty_ids ?? [], specialty_signatures: {} })) };
  await db.query('delete from cfg'); await db.query('insert into cfg values ($1)', [JSON.stringify(c)]);
}
async function assign(u: string, sp: string, enforced = true) { await db.query('insert into mkt_staff_specialties values ($1,$2,$3,$4)', [u, sp, 'active', enforced]); }
async function has(u: string, p: string) { return (await db.query<{ ok: boolean }>('select has($1,$2) ok', [u, p])).rows[0].ok; }
async function sources(u: string, p: string) { return (await db.query<{ k: string }>("select x->>'source_kind' k from cfg, jsonb_array_elements(private.base_rules($1,cfg.c)) x where x->>'permission'=$2", [u, p])).rows.map(r => r.k); }

describe('Role nhiệm vụ Marketing là nguồn chuẩn (SQL thật)', () => {
  it('gán Content Web cho Ngọc (đã reset quyền cũ) → web.view / content_view / outline_start', async () => {
    await assign(NGOC, 'content');
    for (const p of ['web.view', 'web.content_view', 'web.outline_start']) expect(await has(NGOC, p)).toBe(true);
  });
  it('không cấp quyền duyệt/xóa/đăng chưa có cổng backend dù Role có', async () => {
    for (const p of ['web.publish', 'social.post_delete', 'order.approve', 'leave.approve', 'social.report']) expect(await has(NGOC, p)).toBe(false);
  });
  it('quyền cross-module Admin đã chọn trong Role (social.post_create) có hiệu lực — không bị ẩn', async () => {
    expect(await has(NGOC, 'social.post_create')).toBe(true);
  });
  it('ngoài hệ Marketing không nhận, kể cả dòng cũ eligibility_enforced=false', async () => {
    await assign(SALE, 'content', false);
    expect(await has(SALE, 'web.view')).toBe(false);
  });
  it('chuyên môn Chụp ảnh (không phải nhiệm vụ) giữ ràng buộc riêng, không bị xóa', async () => {
    await assign(DESIGN, 'photo', false);
    expect((await db.query("select 1 from mkt_staff_specialties where user_id=$1", [DESIGN])).rows.length).toBe(1);
    expect(await has(DESIGN, 'order.take')).toBe(false); // Role chuyên môn không phải Role chuẩn nhiệm vụ → vẫn bị reset chặn như trước
  });
  it('nhiều Role nhiệm vụ được hợp quyền', async () => {
    await assign(NGOC, 'video');
    expect(await has(NGOC, 'video.create')).toBe(true);
    expect(await has(NGOC, 'web.view')).toBe(true);
  });
  it('quyền riêng chỉ cộng cho chính người đó, không lan sang người cùng Role', async () => {
    await assign(PEER, 'content');
    await db.query("insert into personal values ($1,'web.keyword_view')", [NGOC]);
    expect(await has(PEER, 'web.content_view')).toBe(true);
    await db.query('update private.legacy_reset_accounts set active=false where user_id=$1', [NGOC]);
    expect(await has(NGOC, 'web.keyword_view')).toBe(true);
    expect(await has(PEER, 'web.keyword_view')).toBe(true); // từ Role Content Web, không phải quyền riêng
    await db.query("delete from personal where user_id=$1", [NGOC]);
    expect(await has(NGOC, 'web.keyword_view')).toBe(true); // gỡ quyền riêng không làm mất quyền từ Role
    await db.query('update private.legacy_reset_accounts set active=true where user_id=$1', [NGOC]);
    await db.query("insert into personal values ($1,'brand.view_all')", [PEER]);
    expect(await has(NGOC, 'brand.view_all')).toBe(false);
  });
  it('sửa ma trận Role (áp bộ gợi ý Content Web) có hiệu lực ngay cho mọi người giữ Role', async () => {
    const before = (await db.query<{ p: string[] }>("select permissions p from app_roles where id='role-content-web'")).rows[0].p;
    const preset = permissionPresets.find(x => x.id === 'content')?.keys ?? [];
    await db.query("update app_roles set permissions=$1 where id='role-content-web'", [preset]);
    expect(await has(NGOC, 'social.post_create')).toBe(true); // vẫn có vì Role Video (Admin đã chọn) cũng cấp — hợp quyền đúng nguồn
    expect(await has(PEER, 'social.post_create')).toBe(false);
    expect(await has(PEER, 'web.outline_start')).toBe(true);
    await db.query("update app_roles set permissions=$1 where id='role-content-web'", [before]);
  });
  it('miễn nhiệm hết Marketing → thu hồi toàn bộ quyền nhiệm vụ', async () => {
    await setMemberships([['m2', PEER, 'mkt-content'], ['m3', SALE, 'sales']]);
    for (const p of ['web.view', 'video.create', 'social.post_create']) expect(await has(NGOC, p)).toBe(false);
    expect(await has(PEER, 'web.view')).toBe(true);
  });
  it('đường bổ nhiệm và đường chuyên môn không tạo nguồn trùng', async () => {
    await setMemberships([['m2', PEER, 'mkt-content', ['content']], ['m3', SALE, 'sales', ['content']]]);
    const sig = (await db.query<{ s: string }>("select md5(coalesce(permissions,'{}')::text) s from app_roles where id='role-content-web'")).rows[0].s;
    const c = (await db.query<{ c: any }>('select c from cfg')).rows[0].c;
    for (const m of c.memberships) m.specialty_signatures = { content: sig };
    await db.query('update cfg set c=$1', [JSON.stringify(c)]);
    expect(await sources(PEER, 'web.view')).toEqual(['marketing_appointment']);
    expect(await has(SALE, 'web.view')).toBe(false); // bổ nhiệm ngoài Marketing không còn mở Role nhiệm vụ
  });
  it('historical direct task cannot bypass eligibility or backend readiness', async () => {
    await db.exec(`insert into user_roles values ('${SALE}','role-content-web'),('${PEER}','role-content-web')`);
    const direct = async (u:string,p:string) => (await db.query<{ok:boolean}>('select private.has_permission($1,$2) ok',[u,p])).rows[0].ok;
    expect(await direct(SALE,'web.content_view')).toBe(false);
    expect(await direct(PEER,'web.content_view')).toBe(true);
    expect(await direct(PEER,'web.publish')).toBe(false);
  });
  it('source display is eligible and deduplicated for dual task paths', async () => {
    const rows = (await db.query<{user_id:string;role_id:string}>('select * from cfg, lateral private.role_source_rows(cfg.c)')).rows;
    expect(rows.filter(r=>r.user_id===PEER&&r.role_id==='role-content-web')).toHaveLength(1);
    expect(rows.filter(r=>r.user_id===SALE&&r.role_id==='role-content-web')).toHaveLength(0);
  });
  it('minimal Content role gives Ngọc exactly configured task rights, not the old 90-permission Role', async () => {
    await setMemberships([['m1',NGOC,'mkt-content'],['m2',PEER,'mkt-content']]);
    await db.exec("update app_roles set permissions=array['web.view','web.content_view','web.content_view_mine','web.outline_start','web.outline_submit','web.post_write_start','web.post_submit'] where id='role-content-web';update mkt_staff_specialties set state='ended' where specialty_id='video'");
    expect(await has(NGOC,'web.content_view')).toBe(true);
    expect(await has(NGOC,'web.outline_start')).toBe(true);
    expect(await has(NGOC,'social.post_create')).toBe(false);
    expect(await has(PEER,'social.post_create')).toBe(false);
  });
});
