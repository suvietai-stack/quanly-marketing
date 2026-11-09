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
  for (const f of ['0284_finance_requests_schema', '0285_finance_requests_rpcs', '0287_finance_requests_decide_null_safe', '0288_finance_payment_lines', '0289_fr_zalo_group'])
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
    lines: [{ name: 'Quyết toán vật tư', qty: 1, unit_price: 1800000 }],
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
    lines: [{ name: 'Quyết toán nốt', qty: 1, unit_price: 200000 }],
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

it('payment lines: backend recomputes totals and never trusts client amount', async () => {
  await actor(staff);
  const typeId = await scalar("select id v from fr_payment_types where name='Chi phí hoạt động công ty'");
  const lines = payload([
    { name: 'In catalogue', unit: 'Bản', qty: 100, unit_price: 15000 },
    { name: 'Phí vận chuyển', unit: 'Khoản', qty: 1, unit_price: 300000 },
    { name: '', unit: '', qty: 1, unit_price: 0 }, // dòng trống bị bỏ qua
  ]);
  // Cố tình gửi amount sai — backend phải tính lại từ bảng kê
  const id = await scalar('select fr_save(null,$1,$2,$3) v', ['payment', payload({
    amount: 999, title: 'Chi in ấn tháng 11', payment_type_id: typeId, payee_name: 'Nhà in ABC', lines: JSON.parse(lines),
  }), 'rk-10']);
  expect(await scalar('select amount v from fr_requests where id=$1', [id])).toBe('1800000');
  const stored = await scalar('select jsonb_agg(jsonb_build_object(\'no\',line_no,\'total\',line_total) order by line_no) v from fr_request_lines where request_id=$1', [id]);
  expect(stored).toHaveLength(2);
  expect(Number(stored[0].total)).toBe(1500000);
  expect(Number(stored[1].total)).toBe(300000);
  // Cập nhật: thay toàn bộ dòng, không nhân đôi
  await db.query('select fr_save($1,$2,$3,null)', [id, 'payment', payload({
    amount: 1, title: 'Chi in ấn tháng 11', payment_type_id: typeId, payee_name: 'Nhà in ABC',
    lines: [{ name: 'In catalogue', unit: 'Bản', qty: 50, unit_price: 15000 }],
  })]);
  expect(await scalar('select amount v from fr_requests where id=$1', [id])).toBe('750000');
  expect(await scalar('select count(*)::int v from fr_request_lines where request_id=$1', [id])).toBe(1);
  // Gửi duyệt được vì đã có bảng kê
  expect(await scalar('select fr_submit($1) v', [id])).toBe('pending');
});

it('payment lines: empty or invalid lines are rejected', async () => {
  await actor(staff);
  const typeId = await scalar("select id v from fr_payment_types where name='Chi phí hoạt động công ty'");
  await expect(db.query('select fr_save(null,$1,$2,null)', ['payment', payload({
    amount: 100, title: 'Không có khoản chi', payment_type_id: typeId, payee_name: 'X', lines: [],
  })])).rejects.toThrow('ít nhất một khoản chi');
  await expect(db.query('select fr_save(null,$1,$2,null)', ['payment', payload({
    amount: 100, title: 'Thiếu giá', payment_type_id: typeId, payee_name: 'X',
    lines: [{ name: 'Vận chuyển', qty: 1, unit_price: 0 }],
  })])).rejects.toThrow('Đơn giá');
  await expect(db.query('select fr_save(null,$1,$2,null)', ['payment', payload({
    amount: 100, title: 'Số lượng âm', payment_type_id: typeId, payee_name: 'X',
    lines: [{ name: 'Vận chuyển', qty: -2, unit_price: 100 }],
  })])).rejects.toThrow('Số lượng');
});

it('legacy payment without lines still submits via detail text, but empty one is blocked', async () => {
  await actor(staff);
  const typeId = await scalar("select id v from fr_payment_types where name='Chi phí hoạt động công ty'");
  const legacy = await scalar('select fr_save(null,$1,$2,$3) v', ['payment', payload({
    amount: 500000, title: 'Đề nghị cũ', detail: 'Nội dung chi tiết kiểu cũ', payment_type_id: typeId, payee_name: 'X',
  }), 'rk-11']);
  expect(await scalar('select fr_submit($1) v', [legacy])).toBe('pending');
  const empty = await scalar('select fr_save(null,$1,$2,$3) v', ['payment', payload({
    amount: 500000, title: 'Không chi tiết', payment_type_id: typeId, payee_name: 'X',
  }), 'rk-12']);
  await expect(db.query('select fr_submit($1)', [empty])).rejects.toThrow('khoản chi');
});

it('line catalog is managed only by payment settings permission', async () => {
  await actor(outsider);
  await expect(db.query("select fr_line_catalog_save(null,'Test',true,99)")).rejects.toThrow('quyền');
  await actor(admin);
  const id = await scalar("select fr_line_catalog_save(null,'Thuê dịch vụ',true,5) v");
  expect(id).toBeTruthy();
  // Trùng tên → cập nhật, không tạo mới
  expect(await scalar("select count(*)::int v from fr_line_catalog where name='Thuê dịch vụ'")).toBe(1);
  expect(await scalar("select count(*)::int v from fr_line_catalog where active")).toBe(8);
});

it('report aggregates lines by name without inflating request totals', async () => {
  await actor(admin);
  const r = await scalar("select fr_report('payment',null,null) v");
  const inCatalog = (r.by_line as any[]).find((l) => l.name === 'In catalogue');
  expect(Number(inCatalog.amount)).toBe(750000);
  // Tổng tiền đề nghị đếm theo đề nghị, không nhân theo số dòng
  const expected = await scalar("select coalesce(sum(amount),0) v from fr_requests where kind='payment'");
  expect(Number(r.amount)).toBe(Number(expected));
});

it('zalo group: config save needs settings permission and enabled requires a group', async () => {
  await actor(outsider);
  await expect(db.query("select fr_zalo_group_save('payment','g1','Nhóm',true,null,null)")).rejects.toThrow('quyền');
  await actor(admin);
  await expect(db.query("select fr_zalo_group_save('payment',null,null,true,null,null)")).rejects.toThrow('Chọn nhóm');
  await db.query("select fr_zalo_group_save('payment','grp-kt','Nhóm Kế toán',true,$1,null)",
    [payload({ submitted: true, approved: true, rejected: false, info: false, paid: true, done: true })]);
  const c = await scalar("select jsonb_build_object('en',enabled,'g',group_id,'rej',on_rejected,'info',on_info) v from fr_zalo_group_config where kind='payment'");
  expect(c).toMatchObject({ en: true, g: 'grp-kt', rej: false, info: false });
});

it('zalo group: events queue only for enabled toggles, drafts stay silent, dedup blocks repeats', async () => {
  await actor(staff);
  const typeId = await scalar("select id v from fr_payment_types where name='Chi phí hoạt động công ty'");
  const id = await scalar('select fr_save(null,$1,$2,$3) v', ['payment', payload({
    amount: 0, title: 'Chi văn phòng', payment_type_id: typeId, payee_name: 'X',
    lines: [{ name: 'Vận chuyển', qty: 1, unit_price: 300000 }],
  }), 'rk-20']);
  // Lưu nháp không tạo sự kiện nhóm
  expect(await scalar("select count(*)::int v from fr_zalo_group_events where request_id=$1", [id])).toBe(0);
  expect(await scalar('select fr_submit($1) v', [id])).toBe('pending');
  expect(await scalar("select count(*)::int v from fr_zalo_group_events where request_id=$1 and event='submitted'", [id])).toBe(1);
  await actor(approver);
  // info đã tắt trong cấu hình → không xếp hàng
  await db.query("select fr_decide($1,'info','Thiếu chứng từ')", [id]);
  expect(await scalar("select count(*)::int v from fr_zalo_group_events where request_id=$1 and event='info'", [id])).toBe(0);
  // Gửi lại sau khi bổ sung → sự kiện submitted lần hai có dedup_key mới, không đè tin cũ
  await actor(staff);
  expect(await scalar('select fr_submit($1) v', [id])).toBe('pending');
  expect(await scalar("select count(*)::int v from fr_zalo_group_events where request_id=$1 and event='submitted'", [id])).toBe(2);
  await actor(approver);
  await db.query("select fr_decide($1,'approve',null)", [id]);
  expect(await scalar("select count(*)::int v from fr_zalo_group_events where request_id=$1 and event='approved'", [id])).toBe(1);
  await actor(accountant);
  await db.query("select fr_pay($1,300000,'Tiền mặt',null,null)", [id]);
  expect(await scalar("select count(*)::int v from fr_zalo_group_events where request_id=$1 and event='paid'", [id])).toBe(1);
  expect(await scalar("select count(*)::int v from fr_zalo_group_events where request_id=$1 and event='done'", [id])).toBe(1);
});

it('zalo group: disabled config stays silent', async () => {
  await actor(staff2);
  const typeId = await scalar("select id v from fr_payment_types where name='Chi phí hoạt động công ty'");
  const id = await scalar('select fr_save(null,$1,$2,$3) v', ['payment', payload({
    amount: 0, title: 'Chi khi tắt thông báo', payment_type_id: typeId, payee_name: 'X',
    lines: [{ name: 'In ấn', qty: 1, unit_price: 100000 }],
  }), 'rk-21']);
  // advance chưa bật cấu hình → không xếp hàng
  expect(await scalar("select count(*)::int v from fr_zalo_group_events where kind='advance'")).toBe(0);
  await actor(admin);
  await db.query("select fr_zalo_group_save('payment','grp-kt','Nhóm Kế toán',false,null,null)");
  await actor(staff2);
  expect(await scalar('select fr_submit($1) v', [id])).toBe('pending');
  expect(await scalar("select count(*)::int v from fr_zalo_group_events where request_id=$1", [id])).toBe(0);
});
