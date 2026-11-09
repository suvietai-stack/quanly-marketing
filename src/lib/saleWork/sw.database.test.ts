import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
// PGlite 0.5 không export subpath "./pgcrypto" — nạp trực tiếp từ dist/contrib.
// @ts-expect-error đường dẫn nội bộ của gói
import { pgcrypto } from '@electric-sql/pglite/dist/contrib/pgcrypto.js';
import { beforeAll, afterAll, it, expect } from 'vitest';

const db = new PGlite({ extensions: { pgcrypto } });
const ids = Array.from({ length: 4 }, (_, i) => `00000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`);
const [saleA, saleB, manager, outsider] = ids;

async function actor(id: string) { await db.query("select set_config('test.uid',$1,false)", [id]); }
async function scalar(sql: string, args: unknown[] = []) { return (await db.query<{ v: any }>(sql, args)).rows[0]?.v; }

beforeAll(async () => {
  await db.exec(`CREATE SCHEMA auth;CREATE SCHEMA private;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE ROLE anon;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.uid',true),'')::uuid$$;
CREATE TABLE profiles(id uuid PRIMARY KEY,full_name text,username text,email text,desired_position text,status text);
CREATE TABLE test_perms(user_id uuid,perm text);
CREATE FUNCTION private.is_active(u uuid) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$SELECT EXISTS(SELECT 1 FROM profiles WHERE id=u AND status='Đang hoạt động')$$;
CREATE FUNCTION private.has_permission(u uuid,p text) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$SELECT EXISTS(SELECT 1 FROM test_perms WHERE user_id=u AND perm=p)$$;
CREATE FUNCTION private.sig_can(u uuid,p text) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$SELECT private.has_permission(u,p)$$;`);
  for (const [i, id] of ids.entries()) await db.query('insert into profiles values($1,$2,$3,$4,$5,$6)', [id, `Nhân viên ${i}`, `user${i}`, `u${i}@x.vn`, 'Sale', 'Đang hoạt động']);
  await db.query(`insert into test_perms values
    ('${saleA}','sale_work.access'),('${saleA}','sale_work.view_own'),
    ('${saleB}','sale_work.access'),('${saleB}','sale_work.view_own'),
    ('${manager}','sale_work.access'),('${manager}','sale_work.manage_settings'),('${manager}','sale_work.manage_credentials'),('${manager}','sale_work.view_audit')`);
  await db.exec(readFileSync('drizzle/migrations/0291_sale_work_zalo.sql', 'utf8'));
}, 30000);
afterAll(() => db.close());

it('config: only settings permission saves, https enforced, staff read safe fields', async () => {
  await actor(outsider);
  await expect(db.query('select sw_config()')).rejects.toThrow('quyền');
  await actor(manager);
  await expect(db.query("select sw_config_save('Sale Work','javascript:alert(1)',null,true)")).rejects.toThrow('https');
  await expect(db.query("select sw_config_save('Sale Work','http://sale.work',null,true)")).rejects.toThrow('https');
  await db.query("select sw_config_save('Sale Work Zalo','https://salework.example.com','Hướng dẫn',true)");
  await actor(saleA);
  const c = await scalar('select sw_config() v');
  expect(c.url).toBe('https://salework.example.com');
  expect(c.enabled).toBe(true);
});

it('grant: manager issues credentials, password stored encrypted, never in lists', async () => {
  await actor(outsider);
  await expect(db.query(`select sw_credential_save('${saleA}','sale.a','secret123','active')`)).rejects.toThrow('quyền');
  await actor(manager);
  await db.query(`select sw_credential_save('${saleA}','sale.nguyena','secret123','active')`);
  await db.query(`select sw_credential_save('${saleB}','sale.tranb','matkhau456','active')`);
  // Không lưu plaintext
  const raw = await scalar('select encode(password_enc,\'escape\') v from sw_credentials where user_id=$1', [saleA]);
  expect(raw).not.toContain('secret123');
  // Danh sách nhân sự không chứa mật khẩu
  const list = await scalar('select sw_staff_list(null) v');
  expect(JSON.stringify(list)).not.toContain('secret123');
  expect((list as any[]).find((s) => s.user_id === saleA).sw_username).toBe('sale.nguyena');
  expect((list as any[]).every((s) => s.granted !== undefined)).toBe(true);
});

it('employee reveals only own password; audit logs views without values', async () => {
  await actor(saleA);
  expect(await scalar('select sw_reveal_password() v')).toBe('secret123');
  // Nhân viên B không đọc được mật khẩu A — RPC không nhận ID tùy ý
  await actor(saleB);
  expect(await scalar('select sw_reveal_password() v')).toBe('matkhau456');
  // Quản trị không có API đọc lại mật khẩu
  await actor(manager);
  await expect(db.query('select sw_reveal_password()')).rejects.toThrow('quyền');
  const audit = await scalar('select sw_audit(null) v');
  const views = (audit as any[]).filter((e) => e.action === 'view_password');
  expect(views.length).toBe(2);
  expect(JSON.stringify(audit)).not.toContain('secret123');
});

it('lock and revoke cut off access; reset replaces password', async () => {
  await actor(manager);
  await db.query(`select sw_credential_save('${saleA}','sale.nguyena',null,'locked')`);
  await actor(saleA);
  await expect(db.query('select sw_reveal_password()')).rejects.toThrow('tạm khóa');
  await actor(manager);
  await db.query(`select sw_credential_save('${saleA}','sale.nguyena','newpass789','active')`);
  await actor(saleA);
  expect(await scalar('select sw_reveal_password() v')).toBe('newpass789');
  await actor(manager);
  await db.query(`select sw_credential_revoke('${saleA}')`);
  await actor(saleA);
  expect(await scalar('select sw_my_credential() v')).toBeNull();
  await expect(db.query('select sw_reveal_password()')).rejects.toThrow('chưa được cấp');
  // Nhân sự nghỉ việc không thể truy xuất
  await actor(manager);
  await db.query(`select sw_credential_save('${saleB}','sale.tranb',null,'active')`);
  await db.query("update profiles set status='Tạm khóa' where id=$1", [saleB]);
  await actor(saleB);
  await expect(db.query('select sw_reveal_password()')).rejects.toThrow('không được phép');
});

it('new staff appear automatically as not granted', async () => {
  await actor(manager);
  const list = await scalar('select sw_staff_list(null) v');
  const names = (list as any[]).map((s) => s.full_name);
  expect(names).toContain('Nhân viên 2'); // outsider vẫn là nhân sự hoạt động, chưa cấp
  expect((list as any[]).find((s) => s.user_id === outsider).granted).toBe(false);
});
