import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, expect, it } from 'vitest';

// Giai đoạn 2: nguồn quyền tự động theo chuyên môn Marketing (migration 0323),
// chạy trên schema thật của 0315/0316 với các stub tối thiểu cho nền phân quyền.
const db = new PGlite();
const u1 = '00000000-0000-0000-0000-0000000000a1';
const u2 = '00000000-0000-0000-0000-0000000000a2';
const u3 = '00000000-0000-0000-0000-0000000000a3';

beforeAll(async () => {
  await db.exec(`create schema auth; create schema private; create role anon; create role authenticated; create role service_role;
  create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
  create function private.is_active(u uuid) returns boolean language sql as $$ select u is not null and current_setting('test.active',true)<>'false' $$;
  create function private.is_super_admin(u uuid) returns boolean language sql as $$ select current_setting('test.super',true)='true' $$;
  create function public.account_caller_can(p text) returns boolean language sql as $$ select false $$;
  create function private.org_role_permission_ready(p text) returns boolean language sql immutable as $$ select false $$;
  create function private.base_supported(p text) returns boolean language sql immutable as $$ select false $$;
  create function private.base_rules(u uuid, c jsonb) returns jsonb language sql as $$ select '[]'::jsonb $$;
  create function private.base_tier1(u uuid, p text) returns text language sql as $$
    select case when nullif(current_setting('test.tier1',true),'') is not null then current_setting('test.tier1',true)
    when exists(select 1 from jsonb_array_elements(private.base_rules(u,'{}'::jsonb)) r where r->>'permission'=p and r->>'effect'='DENY') then 'DENY'
    when exists(select 1 from jsonb_array_elements(private.base_rules(u,'{}'::jsonb)) r where r->>'permission'=p and r->>'effect'='ALLOW') then 'ALLOW'
    else 'NOT_CONFIGURED' end $$;
  create table profiles(id uuid primary key, full_name text, status text);
  create table app_roles(id text primary key, name text, permissions text[]);
  create table user_roles(user_id uuid, role_id text);
  create table user_permission_overrides(user_id uuid, use_custom boolean, permissions text[]);
  create table org_units(id text primary key, name text);
  create table org_titles(id text primary key, name text);
  create table org_assignments(id text, unit_id text, title_id text, user_id uuid, category text, starts_at timestamptz, ends_at timestamptz, status text);
  insert into profiles values ('${u1}','Nguyễn An','Đang hoạt động'),('${u2}','Trần Bình','Đang hoạt động'),('${u3}','Lê Chi','Đang hoạt động');
  insert into app_roles values
    ('role-seo','SEO',array['web.keyword_view','task.view_mine','web.outline_approve','web.report_view']),
    ('role-social','Social',array['social.post_create','social.post_delete','social.post_view_mine']),
    ('role-video','Video',array['video.create','video.approve','video.view_mine']),
    ('role-content-web','Content Web',array['web.content_view_mine','web.publish']),
    ('role-local-seo','Local SEO',array['local.view_mine','local.report']),
    ('role-designer','Designer / Chụp ảnh',array['order.take','order.delete']);
  insert into org_units values ('unit-mkt','Phòng Marketing');
  insert into org_titles values ('title-nv','Nhân viên Marketing');
  insert into org_assignments values ('a1','unit-mkt','title-nv','${u1}','primary',now(),null,'active');`);
  for (const f of ['0315_marketing_specialties', '0316_marketing_specialty_scoped_reads', '0323_marketing_specialty_verified_permissions']) {
    await db.exec(readFileSync(`drizzle/migrations/${f}.sql`, 'utf8'));
  }
  await db.query("select set_config('test.uid',$1,false), set_config('test.super','true',false)", [u1]);
}, 30000);
afterAll(() => db.close());

async function asSuper(fn: () => Promise<unknown>) {
  await db.query("select set_config('test.uid',$1,false), set_config('test.super','true',false), set_config('test.active','true',false)", [u1]);
  return fn();
}
async function saveSpecialties(user: string, add: string[], remove: string[] = []) {
  await asSuper(() => db.query('select public.mkt_specialty_save($1::uuid[], $2::text[], $3::text[])', [[user], add, remove]));
}
async function rulesFor(user: string): Promise<string[]> {
  const r = await db.query<{ permission: string }>("select x->>'permission' permission from jsonb_array_elements(private.mkt_specialty_rules($1, '{}'::jsonb)) x", [user]);
  return r.rows.map(x => x.permission).sort();
}
async function can(user: string, perm: string, tier1 = ''): Promise<boolean> {
  await db.query("select set_config('test.tier1',$1,false), set_config('test.active','true',false), set_config('test.super','false',false)", [tier1]);
  const r = await db.query<{ ok: boolean }>('select private.has_permission($1, $2) ok', [user, perm]);
  return r.rows[0].ok;
}

it('1+3. gán SEO + Social + Video cho một người: nhận hợp các quyền đã kiểm chứng của cả ba Role', async () => {
  await saveSpecialties(u1, ['seo', 'social', 'video']);
  const perms = await rulesFor(u1);
  expect(perms).toContain('web.keyword_view');
  expect(perms).toContain('social.post_create');
  expect(perms).toContain('video.create');
  expect(await can(u1, 'video.create')).toBe(true);
});

it('2. một nhiệm vụ giao cho nhiều nhân viên: cả hai cùng nhận quyền', async () => {
  await saveSpecialties(u2, ['video']);
  expect(await rulesFor(u2)).toContain('video.create');
  expect(await rulesFor(u1)).toContain('video.create');
});

it('4. bỏ Video không làm mất SEO và Social', async () => {
  await saveSpecialties(u1, [], ['video']);
  const perms = await rulesFor(u1);
  expect(perms).not.toContain('video.create');
  expect(perms).toContain('web.keyword_view');
  expect(perms).toContain('social.post_create');
});

it('5. không thu hồi quyền đang đến từ nguồn hợp lệ khác (Role trực tiếp)', async () => {
  await db.query('insert into user_roles values ($1, $2)', [u2, 'role-video']);
  await saveSpecialties(u2, [], ['video']);
  expect(await rulesFor(u2)).not.toContain('video.create');
  expect(await can(u2, 'video.create')).toBe(true);
  await db.query('delete from user_roles where user_id = $1', [u2]);
});

it('6. quyền chưa kiểm chứng không được tự động kích hoạt', async () => {
  const perms = await rulesFor(u1);
  expect(perms).not.toContain('social.post_delete');
  expect(perms).not.toContain('web.outline_approve');
  expect(perms).not.toContain('video.approve');
  expect(await can(u1, 'social.post_delete')).toBe(false);
});

it('DENY từ nguồn khác vẫn thắng ALLOW của chuyên môn', async () => {
  expect(await can(u1, 'social.post_create', 'DENY')).toBe(false);
});

it('7+8+9. người không phải Super Admin không gọi được RPC gán chuyên môn', async () => {
  await db.query("select set_config('test.uid',$1,false), set_config('test.super','false',false)", [u3]);
  await expect(db.query('select public.mkt_specialty_save($1::uuid[], $2::text[], $3::text[])', [[u3], ['seo'], []])).rejects.toThrow(/Super Admin/);
});

it('10+11. candidates: job SEO lấy đúng người SEO; người kiêm nhiệm xuất hiện ở cả hai danh sách', async () => {
  await asSuper(async () => {
    const seo = await db.query<{ name: string }>("select name from public.mkt_specialty_candidates('seo')");
    expect(seo.rows.map(r => r.name)).toEqual(['Nguyễn An']);
    const social = await db.query<{ name: string }>("select name from public.mkt_specialty_candidates('social')");
    expect(social.rows.map(r => r.name)).toContain('Nguyễn An');
  });
});

it('candidates trả kèm đơn vị và chức vụ hiện tại', async () => {
  await asSuper(async () => {
    const r = await db.query<{ unit_name: string; title_name: string }>("select unit_name, title_name from public.mkt_specialty_candidates('seo')");
    expect(r.rows[0]).toEqual({ unit_name: 'Phòng Marketing', title_name: 'Nhân viên Marketing' });
  });
});

it('15. đồng bộ lại từ Role không ghi đè chỉnh sửa thủ công', async () => {
  await db.query('insert into user_roles values ($1, $2)', [u3, 'role-seo']);
  await asSuper(async () => {
    await db.query('select public.mkt_specialty_sync()');
    await db.query('select public.mkt_specialty_save($1::uuid[], $2::text[], $3::text[])', [[u3], [], ['seo']]);
    await db.query('select public.mkt_specialty_sync()');
    const r = await db.query<{ state: string }>('select state from mkt_staff_specialties where user_id = $1 and specialty_id = $2', [u3, 'seo']);
    expect(r.rows[0].state).toBe('removed');
  });
  await db.query('delete from user_roles where user_id = $1', [u3]);
});

it('preview liệt kê quyền tự cấp và quyền chưa kích hoạt theo từng nhiệm vụ', async () => {
  await asSuper(async () => {
    const r = await db.query<{ data: { id: string; granted: string[]; blocked: { key: string }[] }[] }>('select public.mkt_specialty_permission_preview() data');
    const social = r.rows[0].data.find(x => x.id === 'social')!;
    expect(social.granted).toContain('social.post_create');
    expect(social.blocked.map(b => b.key)).toContain('social.post_delete');
  });
});
