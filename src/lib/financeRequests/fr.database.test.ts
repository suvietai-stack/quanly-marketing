import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, it, expect } from 'vitest';

const db = new PGlite();
const ids = Array.from({ length: 6 }, (_, i) => `00000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`);
const [staff, approver, accountant, outsider, admin, staff2] = ids;
let advanceId = '', paymentId = '', salaryId = '', settleTypeId = '';

async function actor(id: string) { await db.query("select set_config('test.uid',$1,false)", [id]); }
async function scalar(sql: string, args: unknown[] = []) { return (await db.query<{ v: any }>(sql, args)).rows[0]?.v; }
const payload = (o: unknown) => JSON.stringify(o);

beforeAll(async () => {
  await db.exec(`CREATE SCHEMA auth;CREATE SCHEMA private;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE ROLE anon;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.uid',true),'')::uuid$$;
CREATE TABLE profiles(id uuid PRIMARY KEY,full_name text,status text);
CREATE TABLE test_perms(user_id uuid,perm text);
CREATE FUNCTION private.is_active(u uuid) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$SELECT EXISTS(SELECT 1 FROM profiles WHERE id=u AND status='Đang hoạt động')$$;
CREATE FUNCTION private.has_permission(u uuid,p text) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$SELECT u='${admin}'::uuid OR EXISTS(SELECT 1 FROM test_perms WHERE user_id=u AND perm=p)$$;
CREATE FUNCTION private.sig_can(u uuid,p text) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$SELECT private.has_permission(u,p)$$;
CREATE TABLE notifications(id uuid DEFAULT gen_random_uuid(),recipient_id uuid,kind text,fr_request_id uuid,dedup_key text UNIQUE,payload jsonb,zalo_status text,push_status text,created_at timestamptz DEFAULT now());`);
  for (const id of ids) await db.query('insert into profiles values($1,$2,$3)', [id, id, 'Đang hoạt động']);
  await db.query(`insert into test_perms values
    ('${approver}','fr.advance.approve'),('${approver}','fr.payment.approve'),('${approver}','fr.salary.approve'),
    ('${accountant}','fr.advance.pay'),('${accountant}','fr.payment.pay'),('${accountant}','fr.salary.pay'),('${accountant}','fr.salary.deduct'),
    ('${admin}','fr.advance.settings'),('${admin}','fr.payment.settings'),('${admin}','fr.salary.settings')`);
  for (const f of ['0284_finance_requests_schema', '0285_finance_requests_rpcs', '0287_finance_requests_decide_null_safe'])
    await db.exec(readFileSync(`drizzle/migrations/${f}.sql`, 'utf8'));
  settleTypeId = await scalar("select id v from fr_payment_types where name='Quyết toán/hoàn ứng tạm ứng'");
}, 30000);
afterAll(() => db.close());

it('save is idempotent by request key and only the owner edits drafts', async () => {
  await actor(staff);
  const p = payload({ amount: 2000000, title: 'Tạm ứng mua vật tư', desired_date: '2026-11-15' });
  advanceId = await scalar('select fr_save(null,$1,$2,$3) v', ['advance', p, 'rk-1']);
  expect(await scalar('select fr_save(null,$1,$2,$3) v', ['advance', p, 'rk-1'])).toBe(advanceId);
  expect(await scalar('select count(*)::int v from fr_requests')).toBe(1);
  expect(await scalar('select status v from fr_requests where id=$1', [advanceId])).toBe('draft');
  await actor(outsider);
  await expect(db.query('select fr_save($1,$2,$3,null)', [advanceId, 'advance', p])).rejects.toThrow('Không tìm thấy');
});

it('submit without configured flow goes to needs_config and notifies settings holders', async () => {
  await actor(staff);
  expect(await scalar('select fr_submit($1) v', [advanceId])).toBe('needs_config');
  expect(await scalar("select count(*)::int v from notifications where kind='fr_pending' and recipient_id=$1", [admin])).toBe(1);
});

it('approval flow: only the step approver decides, requester cannot self-approve', async () => {
  await actor(admin);
  await db.query("select fr_settings_save('advance',$1,null)", [payload([{ label: 'Quản lý', perm: 'fr.advance.approve' }])]);
  await actor(staff);
  expect(await scalar('select fr_submit($1) v', [advanceId])).toBe('pending');
  expect(await scalar("select count(*)::int v from notifications where kind='fr_pending' and recipient_id=$1", [approver])).toBe(1);
  await actor(staff);
  await expect(db.query("select fr_decide($1,'approve',null)", [advanceId])).rejects.toThrow('người duyệt');
  // Người tạo có quyền duyệt vẫn không được tự duyệt khi chưa cấu hình ngoại lệ
  await db.query('insert into test_perms values ($1,$2)', [staff, 'fr.advance.approve']);
  await expect(db.query("select fr_decide($1,'approve',null)", [advanceId])).rejects.toThrow('tự phê duyệt');
  await db.query('delete from test_perms where user_id=$1', [staff]);
  await actor(outsider);
  await expect(db.query("select fr_decide($1,'approve',null)", [advanceId])).rejects.toThrow('người duyệt');
  await actor(approver);
  await expect(db.query("select fr_decide($1,'reject',null)", [advanceId])).rejects.toThrow('lý do');
  await db.query("select fr_decide($1,'approve','OK')", [advanceId]);
  expect(await scalar('select status v from fr_requests where id=$1', [advanceId])).toBe('awaiting_payment');
  expect(await scalar("select count(*)::int v from notifications where kind='fr_approved' and recipient_id=$1", [staff])).toBe(1);
  expect(await scalar("select count(*)::int v from notifications where kind='fr_awaiting_pay' and recipient_id=$1", [accountant])).toBe(1);
});

it('payment requires finance permission, never exceeds approved amount, advance becomes settling', async () => {
  await actor(staff);
  await expect(db.query('select fr_pay($1,1000000,null,null,null)', [advanceId])).rejects.toThrow('quyền');
  await actor(accountant);
  await expect(db.query('select fr_pay($1,3000000,null,null,null)', [advanceId])).rejects.toThrow('vượt');
  await db.query("select fr_pay($1,500000,'Chuyển khoản','REF1',null)", [advanceId]);
  expect(await scalar('select status v from fr_requests where id=$1', [advanceId])).toBe('awaiting_payment');
  await db.query("select fr_pay($1,1500000,'Chuyển khoản','REF2',null)", [advanceId]);
  const r = await scalar("select jsonb_build_object('st',status,'paid',paid_amount) v from fr_requests where id=$1", [advanceId]);
  expect(r.st).toBe('settling');
  expect(Number(r.paid)).toBe(2000000);
});

it('settlement payment updates the linked advance exactly once', async () => {
  await actor(admin);
  await db.query("select fr_settings_save('payment',$1,null)", [payload([{ label: 'Kế toán trưởng', perm: 'fr.payment.approve' }])]);
  await actor(staff);
  paymentId = await scalar('select fr_save(null,$1,$2,$3) v', ['payment', payload({
    amount: 1800000, title: 'Quyết toán vật tư', payment_type_id: settleTypeId, payee_name: 'Kho', advance_id: advanceId,
  }), 'rk-2']);
  expect(await scalar('select fr_submit($1) v', [paymentId])).toBe('pending');
  await actor(approver);
  await db.query("select fr_decide($1,'approve',null)", [paymentId]);
  await actor(accountant);
  await db.query("select fr_pay($1,1800000,'Chuyển khoản','REF3',null)", [paymentId]);
  const adv = await scalar("select jsonb_build_object('st',status,'settled',settled_amount) v from fr_requests where id=$1", [advanceId]);
  expect(Number(adv.settled)).toBe(1800000);
  expect(adv.st).toBe('settling');
  // Không thể quyết toán lại cùng khoản đã chi xong bằng đề nghị mới trùng liên kết đã hoàn tất
  await actor(staff);
  const p2 = await scalar('select fr_save(null,$1,$2,$3) v', ['payment', payload({
    amount: 200000, title: 'Quyết toán nốt', payment_type_id: settleTypeId, payee_name: 'Kho', advance_id: advanceId,
  }), 'rk-3']);
  await db.query("select fr_submit($1)", [p2]);
  await actor(approver);
  await db.query("select fr_decide($1,'approve',null)", [p2]);
  await actor(accountant);
  await db.query("select fr_pay($1,200000,null,null,null)", [p2]);
  const adv2 = await scalar("select jsonb_build_object('st',status,'settled',settled_amount) v from fr_requests where id=$1", [advanceId]);
  expect(Number(adv2.settled)).toBe(2000000);
  expect(adv2.st).toBe('done');
});

it('salary advance enforces limits and tracks manual deductions', async () => {
  await actor(admin);
  await db.query("select fr_settings_save('salary_advance',$1,$2)", [
    payload([{ label: 'Giám đốc', perm: 'fr.salary.approve' }]),
    payload({ max_amount: 5000000, max_per_period: 1, block_open: true }),
  ]);
  await actor(staff2);
  salaryId = await scalar('select fr_save(null,$1,$2,$3) v', ['salary_advance', payload({ amount: 3000000, title: 'Ứng lương tháng 11', salary_period: '2026-11' }), 'rk-4']);
  expect(await scalar('select fr_submit($1) v', [salaryId])).toBe('pending');
  const tooBig = await scalar('select fr_save(null,$1,$2,$3) v', ['salary_advance', payload({ amount: 9000000, title: 'Ứng lớn', salary_period: '2026-12' }), 'rk-5']);
  await expect(db.query('select fr_submit($1)', [tooBig])).rejects.toThrow('tối đa');
  const second = await scalar('select fr_save(null,$1,$2,$3) v', ['salary_advance', payload({ amount: 1000000, title: 'Ứng thêm', salary_period: '2026-11' }), 'rk-6']);
  await expect(db.query('select fr_submit($1)', [second])).rejects.toThrow('tối đa trong kỳ');
  await actor(approver);
  await db.query("select fr_decide($1,'approve',null)", [salaryId]);
  await actor(accountant);
  await db.query("select fr_pay($1,3000000,'Tiền mặt',null,null)", [salaryId]);
  expect(await scalar('select status v from fr_requests where id=$1', [salaryId])).toBe('paid');
  await expect(db.query('select fr_deduct($1,4000000,null)', [salaryId])).rejects.toThrow('vượt');
  await db.query('select fr_deduct($1,2000000,$2)', [salaryId, 'Trừ lương T11']);
  expect(await scalar('select status v from fr_requests where id=$1', [salaryId])).toBe('paid');
  await db.query('select fr_deduct($1,1000000,$2)', [salaryId, 'Trừ lương T12']);
  expect(await scalar('select status v from fr_requests where id=$1', [salaryId])).toBe('done');
  expect(await scalar("select count(*)::int v from notifications where kind='fr_deducted' and recipient_id=$1", [staff2])).toBe(2);
});

it('visibility: outsider cannot view, scope and step approver can', async () => {
  expect(await scalar('select private.fr_can_view($1,$2) v', [outsider, advanceId])).toBe(false);
  expect(await scalar('select private.fr_can_view($1,$2) v', [staff, advanceId])).toBe(true);
  expect(await scalar('select private.fr_can_view($1,$2) v', [approver, advanceId])).toBe(true);
  expect(await scalar('select private.fr_can_view($1,$2) v', [accountant, advanceId])).toBe(true);
});

it('report aggregates real amounts without double counting', async () => {
  await actor(admin);
  const r = await scalar("select fr_report('advance',null,null) v");
  expect(Number(r.total)).toBe(1);
  expect(Number(r.paid_amount)).toBe(2000000);
  expect(Number(r.settled_amount)).toBe(2000000);
  await actor(outsider);
  await expect(db.query("select fr_report('advance',null,null)")).rejects.toThrow('quyền');
});

it('history events are recorded for every decision', async () => {
  const actions = await scalar('select count(*)::int v from fr_events where request_id=$1', [advanceId]);
  expect(actions).toBeGreaterThanOrEqual(6);
});
