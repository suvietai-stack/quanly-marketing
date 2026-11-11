import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, it, expect } from 'vitest';

// Isolated contract test for the Role v2 forward migration and its exact rollback definitions.
const db = new PGlite();
const admin = '00000000-0000-0000-0000-000000000001';
const ngoc = '00000000-0000-0000-0000-000000000002';
const sale = '00000000-0000-0000-0000-000000000003';
const forward = readFileSync('src/lib/basePermissions/fixtures/roleV2/forward.sql', 'utf8');
const rollback = readFileSync('src/lib/basePermissions/fixtures/roleV2/rollback.sql', 'utf8');
const v = async (sql: string, args: unknown[] = []) => (await db.query<{ v: unknown }>(sql, args)).rows[0]?.v;
const as = (u: string) => db.query("select set_config('test.actor',$1,false)", [u]);
const preview = async (body: object) => (await v("select role_catalog_change('preview','create',null,$1) v", [body])) as { id: string; role_id: string };
const apply = (id: string) => db.query("select role_catalog_change('apply',null,null,null,$1,'ÁP DỤNG ROLE','role v2 test')", [id]);
const cfg = (memberships: object[]) => JSON.stringify({
  units: [{ id: 'org-company', kind: 'company' }, { id: 'mkt-block', kind: 'block', code: 'marketing', parent_id: 'org-company' }, { id: 'mkt-dept', kind: 'department', parent_id: 'mkt-block' }, { id: 'sales-dept', kind: 'department', parent_id: 'org-company' }],
  titles: [{ id: 'mkt-staff', active: true, source: 'base' }, { id: 'sales-staff', active: true, source: 'base' }],
  memberships,
});
const perms = async (u: string, memberships: object[]) => ((await v("select coalesce(jsonb_agg(r->>'permission' order by r->>'permission'),'[]') v from jsonb_array_elements(private.org_assignment_specialty_rules($1,$2::jsonb)) r", [u, cfg(memberships)])) as string[]);

beforeAll(async () => {
  await db.exec(`create schema private;create schema auth;create role anon;create role authenticated;create role service_role;
  create function auth.uid() returns uuid language sql as $$select nullif(current_setting('test.actor',true),'')::uuid$$;
  create table app_roles(id text primary key,name text not null,description text,is_system boolean not null default false,permissions text[] not null default '{}',created_at timestamptz default now(),updated_at timestamptz default now(),signal_scope_all boolean not null default true,signal_scope text[] not null default '{}',biz_scope text default 'assigned',catalog_state text not null default 'custom',catalog_group text,catalog_pending text[] default '{}',role_kind text not null default 'position',role_code text);
  create table user_roles(user_id uuid,role_id text references app_roles(id) on delete restrict);create table base_title_role_links(title_id text,role_id text references app_roles(id));create table mkt_specialties(id text primary key,name text,role_id text references app_roles(id),active boolean default true);
  create table mkt_staff_specialties(user_id uuid,specialty_id text,state text,eligibility_enforced boolean default false);create table org_position_slots(id text,role_id text references app_roles(id));create table org_assignments(id text);create table base_permission_catalog(key text primary key);
  create table private.role_catalog_previews(id uuid primary key default gen_random_uuid(),actor_id uuid,action text,role_id text,proposed jsonb,before_data jsonb,baseline text,expires_at timestamptz default now()+interval '10 minutes',applied_at timestamptz);
  create function private.is_active(u uuid) returns boolean language sql as $$select u is not null$$;
  create function private.is_super_admin(u uuid) returns boolean language sql as $$select u='${admin}'::uuid$$;
  create function private.role_catalog_fingerprint() returns text language sql as $$select 'stable'$$;
  create function private.base_config() returns jsonb language sql as $$select '{}'::jsonb$$;
  create function private.role_source_rows(c jsonb) returns table(user_id uuid,role_id text) language sql as $$select null::uuid,null::text where false$$;
  create function private.role_references(r text) returns jsonb language sql as $$select '{}'::jsonb$$;
  create function private.org_role_permission_ready(p text) returns boolean language sql as $$select p like 'leave.%' or p like 'order.%' or p like 'signal.%'$$;
  create function private.mkt_specialty_permission_ready(p text) returns boolean language sql as $$select p like 'web.%' or p like 'social.%'$$;
  create function private.permission_editor_policy() returns table(key text,scope text) language sql as $$values('leave.view_own','own'),('web.view','own'),('web.content_view','own')$$;
  create function private.role_editor_validate(kind text,next_permissions text[],previous_permissions text[]) returns void language plpgsql as $$ begin if exists(select 1 from unnest(coalesce(next_permissions,'{}')) p where not p=any(coalesce(previous_permissions,'{}')) and not exists(select 1 from private.permission_editor_policy() s where s.key=p and case when kind='marketing_task' then private.mkt_specialty_permission_ready(p) and s.scope<>'unit' else private.org_role_permission_ready(p) end)) then raise exception 'Quyền mới chưa có phạm vi an toàn' using errcode='42501'; end if; end $$;
  create function private.role_in_use(r text) returns boolean language sql as $$select exists(select 1 from user_roles where role_id=r) or exists(select 1 from base_title_role_links where role_id=r) or exists(select 1 from mkt_specialties where role_id=r) or exists(select 1 from org_position_slots where role_id=r)$$;
  create function private.base_valid_at(m jsonb) returns boolean language sql as $$select (m->>'starts_at')::timestamptz<=now() and (nullif(m->>'ends_at','') is null or (m->>'ends_at')::timestamptz>now())$$;
  create function private.base_role_unit_contains(c jsonb,root text,unit text) returns boolean language sql as $$with recursive up(id) as (select unit union select u->>'parent_id' from up join lateral jsonb_array_elements(c->'units') u on u->>'id'=up.id where u->>'parent_id' is not null) select exists(select 1 from up where id=root)$$;
  create function private.org_marketing_eligible(u uuid,c jsonb) returns boolean language sql as $$select false$$;
  create function public.standard_role_catalog_setup() returns jsonb language sql as $$select '{}'::jsonb$$;create function public.standard_role_catalog_consolidate() returns jsonb language sql as $$select '{}'::jsonb$$;
  insert into base_permission_catalog values('leave.view_own'),('leave.settings'),('leave.approve'),('signal.sale'),('order.view_all'),('web.view'),('web.content_view'),('web.post_submit'),('order.view');
  insert into app_roles(id,name,permissions,catalog_state,role_kind,signal_scope_all,signal_scope,is_system) values
   ('role-old-hr','Hành chính Nhân sự','{leave.view_own,leave.settings}','standard','position',true,'{}',false),
   ('role-old-sales','Nhân viên Kinh doanh','{leave.view_own,signal.sale}','standard','position',false,'{Nhập sỉ,Khác}',false),
   ('role-old-content','Content Web','{web.view,web.content_view,web.post_submit,order.view,leave.approve}','standard','marketing_task',true,'{}',false),
   ('role-super-admin','Super Admin','{leave.approve}','standard','system',true,'{}',true);
  create function private.role_catalog_system_guard() returns trigger language plpgsql as $$begin return new; end$$;
  create function public.app_role_delete_guard() returns trigger language plpgsql as $$begin if old.is_system or private.role_in_use(old.id) then raise exception 'Role còn nguồn sử dụng'; end if; return old; end$$;
  create trigger app_role_delete_guard before delete on app_roles for each row execute function public.app_role_delete_guard();`);
  await db.exec(forward);
  await db.exec(`create trigger role_new_empty_guard before insert on app_roles for each row execute function private.role_new_empty_guard();`);
  await as(admin);
}, 30000);
afterAll(() => db.close());

it('canonical v2 create keeps verified rights of the basis Role, copies its signal scope and leaves the old Role untouched', async () => {
  const p = await preview({ canonical_id: 'role-v2-sales-staff', basis_role_ids: ['role-old-sales'], name: 'Nhân viên Kinh doanh', role_kind: 'position', permissions: ['leave.view_own', 'signal.sale'], catalog_group: 'Kinh doanh' });
  expect(p.role_id).toBe('role-v2-sales-staff');
  await apply(p.id);
  const row = (await db.query<{ permissions: string[]; signal_scope_all: boolean; signal_scope: string[]; catalog_generation: number; role_code: string; catalog_state: string }>("select * from app_roles where id='role-v2-sales-staff'")).rows[0];
  expect(row.permissions.sort()).toEqual(['leave.view_own', 'signal.sale']);
  expect(row.signal_scope_all).toBe(false);
  expect(row.signal_scope).toEqual(['Nhập sỉ', 'Khác']);
  expect(row.catalog_generation).toBe(2);
  expect(row.role_code).toBe('role-v2-sales-staff');
  expect(await v("select permissions v from app_roles where id='role-old-sales'")).toEqual(['leave.view_own', 'signal.sale']);
});

it('a v2 Role may reuse a legacy name, but two v2 Roles may not share a name', async () => {
  const p = await preview({ canonical_id: 'role-v2-hr', basis_role_ids: ['role-old-hr'], name: 'Hành chính Nhân sự', role_kind: 'position', permissions: ['leave.settings'] });
  await apply(p.id);
  await expect(preview({ canonical_id: 'role-v2-hr-two', basis_role_ids: ['role-old-hr'], name: 'Hành chính Nhân sự', role_kind: 'position', permissions: [] })).rejects.toThrow('Tên Role đã tồn tại');
});

it('v2 create rejects a right that is neither in the basis Role nor verified by the editor policy', async () => {
  await expect(preview({ canonical_id: 'role-v2-wide', basis_role_ids: ['role-old-sales'], name: 'Mở rộng', role_kind: 'position', permissions: ['order.view_all'] })).rejects.toThrow('chưa có phạm vi an toàn');
});

it('v2 create rejects bad IDs, duplicates, Super Admin as basis and a missing basis', async () => {
  await expect(preview({ canonical_id: 'role-custom-x', basis_role_ids: ['role-old-sales'], name: 'X', role_kind: 'position', permissions: [] })).rejects.toThrow('không hợp lệ');
  await expect(preview({ canonical_id: 'role-v2-sales-staff', basis_role_ids: ['role-old-sales'], name: 'Y', role_kind: 'position', permissions: [] })).rejects.toThrow('đã tồn tại');
  await expect(preview({ canonical_id: 'role-v2-boss', basis_role_ids: ['role-super-admin'], name: 'Boss', role_kind: 'position', permissions: ['leave.approve'] })).rejects.toThrow('Role nguồn');
  await expect(preview({ canonical_id: 'role-v2-none', name: 'None', role_kind: 'position', permissions: [] })).rejects.toThrow('Role nguồn');
});

it('ordinary create path still forbids a default signal scope', async () => {
  await expect(preview({ name: 'Tự tạo', role_kind: 'position', permissions: [], signal_scope: ['Khác'] })).rejects.toThrow('không mặc định phạm vi');
});

it('ordinary account cannot create v2 Roles', async () => {
  await as(sale);
  await expect(preview({ canonical_id: 'role-v2-x', basis_role_ids: ['role-old-sales'], name: 'X', role_kind: 'position', permissions: [] })).rejects.toThrow('Super Admin');
  await as(admin);
});

it('Marketing task v2 gives its minimal task rights only inside the Marketing block; legacy task Role stays signature-bound', async () => {
  const p = await preview({ canonical_id: 'role-v2-task-content-web', basis_role_ids: ['role-old-content'], name: 'Content Web', role_kind: 'marketing_task', permissions: ['web.view', 'web.content_view'] });
  await apply(p.id);
  await db.exec("insert into mkt_specialties values('content_web','Content Web','role-old-content',true)");
  const m = { id: 'a1', user_id: ngoc, title_id: 'mkt-staff', unit_id: 'mkt-dept', status: 'active', starts_at: '2026-01-01', specialty_ids: ['content_web'], specialty_signatures: {} };
  expect(await perms(ngoc, [m])).toEqual([]); // old Role: signature missing -> no rights, never the 90 old Content rights
  await db.exec("update mkt_specialties set role_id='role-v2-task-content-web' where id='content_web'");
  expect(await perms(ngoc, [m])).toEqual(['web.content_view', 'web.view']);
  expect(await perms(ngoc, [{ ...m, unit_id: 'sales-dept', title_id: 'sales-staff' }])).toEqual([]); // outside Marketing
  expect(await perms(ngoc, [{ ...m, ends_at: '2026-02-01' }])).toEqual([]); // appointment ended -> revoked
  expect(await perms(sale, [m])).toEqual([]); // another person
  expect(await perms(ngoc, [{ ...m, specialty_ids: ['content_web', 'content_web'] }])).toEqual(['web.content_view', 'web.view']); // de-duplicated
});

it('Role edits in the matrix take effect for v2 tasks without manual re-signing', async () => {
  await db.exec("update app_roles set permissions='{web.view}' where id='role-v2-task-content-web'");
  const m = { id: 'a1', user_id: ngoc, title_id: 'mkt-staff', unit_id: 'mkt-dept', status: 'active', starts_at: '2026-01-01', specialty_ids: ['content_web'] };
  expect(await perms(ngoc, [m])).toEqual(['web.view']);
});

it('legacy Role cannot be deleted while referenced; deletes once unreferenced; system Role never', async () => {
  await db.exec("insert into base_title_role_links values('t','role-old-hr')");
  await expect(db.exec("delete from app_roles where id='role-old-hr'")).rejects.toThrow('nguồn sử dụng');
  await db.exec("delete from base_title_role_links where role_id='role-old-hr'");
  await db.exec("delete from app_roles where id='role-old-hr'");
  expect(await v("select count(*)::int v from app_roles where id='role-old-hr'")).toBe(0);
  await expect(db.exec("delete from app_roles where id='role-super-admin'")).rejects.toThrow('nguồn sử dụng');
});

it('rollback restores the exact previous writer: canonical IDs are ignored again', async () => {
  await db.exec(rollback);
  const p = await preview({ canonical_id: 'role-v2-after-rollback', name: 'Sau khôi phục', role_kind: 'position', permissions: ['leave.view_own'] });
  expect(p.role_id).toMatch(/^role-custom-/);
  await db.exec(forward);
  const q = await preview({ canonical_id: 'role-v2-again', basis_role_ids: ['role-old-sales'], name: 'Lại', role_kind: 'position', permissions: [] });
  expect(q.role_id).toBe('role-v2-again');
});
