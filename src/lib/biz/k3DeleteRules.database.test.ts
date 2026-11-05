import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';

const db = new PGlite();
const staff = '00000000-0000-0000-0000-0000000000a1';
const other = '00000000-0000-0000-0000-0000000000a2';
const manager = '00000000-0000-0000-0000-0000000000a3';
const dept = '40000000-0000-0000-0000-0000000000a1';

async function val<T = unknown>(sql: string) { return (await db.query<{ v: T }>(sql)).rows[0]?.v as T; }
const as = async (uid: string) => db.exec(`SET test.uid='${uid}'`);
let goalId: string; let actionId: string; let kpiId: string;

beforeAll(async () => {
  await db.exec(`CREATE SCHEMA auth;CREATE SCHEMA private;CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT current_setting('test.uid')::uuid$$;
  CREATE TABLE profiles(id uuid PRIMARY KEY, full_name text, status text);
  CREATE TABLE biz_departments(id uuid PRIMARY KEY, name text);
  CREATE TABLE biz_department_members(user_id uuid, department_id uuid);
  CREATE FUNCTION public.is_super_admin(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
  CREATE FUNCTION public.biz_admin(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${manager}'::uuid$$;
  CREATE FUNCTION private.is_active(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT true$$;
  CREATE FUNCTION private.sig_can(uuid, text) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
  CREATE FUNCTION public.biz_participant(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT EXISTS(SELECT 1 FROM biz_department_members m WHERE m.user_id=$1)$$;
  CREATE FUNCTION public.biz_manager(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${manager}'::uuid$$;
  CREATE FUNCTION public.biz_all_scope(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
  CREATE FUNCTION public.biz_scope_ok(uuid, uuid, uuid, timestamptz DEFAULT now()) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${manager}'::uuid AND $2 IN ('${staff}'::uuid,'${other}'::uuid)$$;
  CREATE FUNCTION public.biz_department_at(uuid,date) RETURNS uuid LANGUAGE sql AS $$SELECT department_id FROM biz_department_members WHERE user_id=$1 LIMIT 1$$;
  INSERT INTO profiles VALUES ('${staff}','Nhân viên A','Đang hoạt động'),('${other}','Nhân viên B','Đang hoạt động'),('${manager}','Trưởng phòng','Đang hoạt động');
  INSERT INTO biz_departments VALUES ('${dept}','Phòng Kinh doanh');
  INSERT INTO biz_department_members VALUES ('${staff}','${dept}'),('${other}','${dept}'),('${manager}','${dept}');
  SET test.uid='${staff}';`);
  for (const file of ['0173_k3_daily_management_phase1.sql', '0174_k3_daily_integrity_and_summary_versions.sql', '0175_k3_period_entities.sql', '0176_k3_period_writes_and_task_links.sql', '0177_k3_period_reads_summaries_scope.sql', '0178_k3_summary_semantics_and_deadline_readback.sql', '0179_k3_unscheduled_creation_and_scope_fences.sql', '0180_k3_task_metadata_and_summary_integrity.sql', '0189_k3_cross_period_goal_model.sql', '0190_k3_goal_collaboration_rpcs.sql', '0191_k3_execution_integration.sql', '0192_k3_kpi_and_list_fixes.sql', '0193_k3_goal_detail_member_actuals_fix.sql', '0194_k3_unify_fixes_revoke_dates_kpi_future.sql', '0195_k3_restore_vietnamese_messages.sql', '0196_k3_standardize_workflow.sql'])
    await db.exec(readFileSync(`drizzle/migrations/${file}`, 'utf8'));
  const m0185 = readFileSync('drizzle/migrations/0185_biz_permission_unification.sql', 'utf8');
  const can = m0185.match(/CREATE OR REPLACE FUNCTION public\.k3_can[\s\S]*?\$function\$;/)?.[0]; if (!can) throw new Error('Missing permission function'); await db.exec(can);
  await as(manager);
  await val(`SELECT k3_settings_save(true, '2020-01-01'::date, '08:45'::time, '18:00'::time, 3::smallint) v`);
  await as(staff);
  await db.exec(`CREATE SCHEMA cron; CREATE FUNCTION cron.unschedule(text) RETURNS boolean LANGUAGE sql AS $$SELECT true$$; CREATE FUNCTION cron.schedule(text,text,text) RETURNS bigint LANGUAGE sql AS $$SELECT 1::bigint$$;`);
  for (const file of ['0197_k3_soft_delete_trash.sql', '0198_k3_trash_read_guards.sql', '0199_k3_trash_guard_goal_save.sql', '0200_k3_trash_guard_action_plan.sql', '0201_k3_trash_guard_kpi_task.sql']) await db.exec(readFileSync(`drizzle/migrations/${file}`, 'utf8'));
  for (const file of ['0202_k3_daily_kpi_result_foundation.sql', '0203_k3_kpi_metric_and_configuration_guards.sql', '0206_k3_result_privacy_and_configuration_fences.sql', '0207_k3_configuration_module_and_legacy_history_guards.sql']) await db.exec(readFileSync(`drizzle/migrations/${file}`, 'utf8'));
  const contract = readFileSync('drizzle/migrations/0216_k3_ten_measurement_contract_and_review_safety.sql', 'utf8');
  await db.exec(contract.slice(0, contract.indexOf('COMMENT ON TABLE')));
  await db.exec(readFileSync('drizzle/migrations/0217_k3_measurement_configuration_validation.sql', 'utf8'));
  await db.exec(`CREATE FUNCTION private.k3_employee_day_source(uuid,date) RETURNS jsonb LANGUAGE sql AS $$SELECT '{}'::jsonb$$; CREATE FUNCTION k3_kpi_day_read(date) RETURNS jsonb LANGUAGE sql AS $$SELECT '{}'::jsonb$$;`);
  const creation = readFileSync('drizzle/migrations/0220_k3_configured_creation_and_date_preview.sql', 'utf8');
  await db.exec(creation.slice(0, creation.indexOf(" def:=pg_get_functiondef('public.k3_kpi_result_read")) + 'END $patch$;');
  await db.exec(readFileSync('drizzle/migrations/0231_k3_creation_timeline_personal_drafts.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0232_k3_atomic_timeline_write_and_personal_execution.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0233_k3_trash_alias_and_retention_guards.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0234_k3_draft_purge_config_history_safety.sql', 'utf8'));
  const evaluator = readFileSync('drizzle/migrations/0218_k3_shared_ten_mode_evaluator.sql', 'utf8');
  await db.exec(evaluator.slice(0, evaluator.indexOf('CREATE FUNCTION private.k3_measure_rows')));
  const unified = readFileSync('drizzle/migrations/0205_k3_daily_kpi_unified_reads.sql', 'utf8');
  const projectionStart = unified.indexOf('DO $patch$');
  await db.exec(unified.slice(projectionStart, unified.indexOf('-- Existing API callers', projectionStart)));
  await db.exec(readFileSync('drizzle/migrations/0235_k3_authoritative_automatic_states.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0236_k3_valid_save_and_legacy_state_guards.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0237_k3_required_actions_and_safe_special_decisions.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0238_k3_activate_configured_kf_without_start_button.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0239_k3_configured_action_revision_alias.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0240_k3_delete_rules.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0241_k3_soft_delete_variable_conflict_fix.sql', 'utf8'));
  // Một công việc Cơ bản đang thực hiện (KG + 1 KF + 1 KPI binary).
  const r = await val<{ goal_id: string }>(`SELECT k3_quick_create('${JSON.stringify({ request_key: crypto.randomUUID(), creation_mode: 'basic', name: 'Soạn báo giá khách sạn Vinh Nghệ An', expected_result: 'Có file báo giá', period_start: '2026-11-05', period_end: '2026-11-05', kpi: { measure: 'binary' }, save_valid: true })}') v`);
  goalId = r.goal_id;
  actionId = await val<string>(`SELECT id v FROM k3_actions WHERE goal_id='${goalId}'`);
  kpiId = await val<string>(`SELECT id v FROM k3_kpis WHERE action_id='${actionId}'`);
}, 30000);

afterAll(() => db.close());

it('công việc chưa có kết quả: k3_deletable cho phép xóa KG', async () => {
  const d = await val<{ ok: boolean }>(`SELECT k3_deletable('goal','${goalId}') v`);
  expect(d.ok).toBe(true);
});

it('không được xóa KF duy nhất của công việc đang thực hiện', async () => {
  const d = await val<{ ok: boolean; reason: string }>(`SELECT k3_deletable('action','${actionId}') v`);
  expect(d.ok).toBe(false);
  expect(d.reason).toContain('KF duy nhất');
  await expect(val(`SELECT k3_soft_delete('action','${actionId}') v`)).rejects.toThrow(/KF duy nhất/);
});

it('đã có kết quả KPI: k3_deletable từ chối và k3_soft_delete chặn ở backend', async () => {
  await db.exec(`INSERT INTO k3_kpi_results(kpi_id, goal_id, action_id, user_id, work_date, value, updated_by) VALUES ('${kpiId}','${goalId}','${actionId}','${staff}','2026-11-05',1,'${staff}')`);
  const d = await val<{ ok: boolean; reason: string }>(`SELECT k3_deletable('goal','${goalId}') v`);
  expect(d.ok).toBe(false);
  expect(d.reason).toContain('kết quả KPI');
  await expect(val(`SELECT k3_soft_delete('goal','${goalId}') v`)).rejects.toThrow(/kết quả KPI/);
});

it('xóa kết quả giả lập điều kiện thay đổi: sau khi không còn kết quả, xóa mềm + khôi phục 15 ngày hoạt động', async () => {
  await db.exec(`DELETE FROM k3_kpi_results WHERE kpi_id='${kpiId}'`);
  const d = await val<{ ok: boolean }>(`SELECT k3_deletable('goal','${goalId}') v`);
  expect(d.ok).toBe(true);
  await val(`SELECT k3_soft_delete('goal','${goalId}') v`);
  expect(await val(`SELECT deleted_at IS NOT NULL v FROM k3_goals WHERE id='${goalId}'`)).toBe(true);
  expect(await val(`SELECT deleted_at IS NOT NULL v FROM k3_actions WHERE id='${actionId}'`)).toBe(true);
  await val(`SELECT k3_restore('goal','${goalId}') v`);
  expect(await val(`SELECT deleted_at IS NULL v FROM k3_goals WHERE id='${goalId}'`)).toBe(true);
  expect(await val(`SELECT deleted_at IS NULL v FROM k3_actions WHERE id='${actionId}'`)).toBe(true);
});

it('công việc ngày: chưa có kết quả thì xóa được, đã có kpi_actual thì bị chặn', async () => {
  const dayId = await val<string>(`INSERT INTO k3_days(user_id, work_date) VALUES ('${staff}','2026-11-06') RETURNING id v`);
  const taskId = await val<string>(`INSERT INTO k3_tasks(day_id, user_id, work_date, name) VALUES ('${dayId}','${staff}','2026-11-06','Gọi điện chăm sóc khách') RETURNING id v`);
  expect((await val<{ ok: boolean }>(`SELECT k3_deletable('task','${taskId}') v`)).ok).toBe(true);
  await db.exec(`UPDATE k3_tasks SET kpi_actual=5 WHERE id='${taskId}'`);
  const d = await val<{ ok: boolean; reason: string }>(`SELECT k3_deletable('task','${taskId}') v`);
  expect(d.ok).toBe(false);
  await expect(val(`SELECT k3_task_delete('${taskId}') v`)).rejects.toThrow(/kết quả KPI/);
});

it('ngày đã chốt sổ: công việc không kết quả vẫn không được xóa', async () => {
  const dayId = await val<string>(`INSERT INTO k3_days(user_id, work_date, summarized_at) VALUES ('${staff}','2026-11-07', now()) RETURNING id v`);
  const taskId = await val<string>(`INSERT INTO k3_tasks(day_id, user_id, work_date, name) VALUES ('${dayId}','${staff}','2026-11-07','Việc trong ngày đã chốt') RETURNING id v`);
  const d = await val<{ ok: boolean; reason: string }>(`SELECT k3_deletable('task','${taskId}') v`);
  expect(d.ok).toBe(false);
  expect(d.reason).toContain('chốt sổ');
});

it('người khác không được xóa công việc của tôi', async () => {
  await as(other);
  const d = await val<{ ok: boolean; reason: string }>(`SELECT k3_deletable('goal','${goalId}') v`);
  expect(d.ok).toBe(false);
  await expect(val(`SELECT k3_soft_delete('goal','${goalId}') v`)).rejects.toThrow(/chủ trì|Admin/);
  await as(staff);
});
