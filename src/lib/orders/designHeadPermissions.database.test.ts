import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import {afterAll,beforeAll,expect,it} from 'vitest';

const db=new PGlite();
beforeAll(async()=>{
  await db.exec(`
    CREATE TABLE public.app_roles (
      id text PRIMARY KEY,
      role_kind text NOT NULL,
      catalog_generation integer,
      is_system boolean NOT NULL DEFAULT false,
      permissions text[] NOT NULL DEFAULT '{}'
    );
    INSERT INTO public.app_roles(id,role_kind,catalog_generation,is_system,permissions)
      VALUES
      ('role-v2-design-head','position',2,false,ARRAY['order.view','leave.view_unit']::text[]),
      ('role-v2-design-staff','position',2,false,ARRAY(SELECT 'order.test_' || n FROM generate_series(1,21) n) || ARRAY['order.marketing_design.force_status']::text[]),
      ('role-super-admin','position',2,true,ARRAY['settings.role']::text[]);
  `);
});
afterAll(()=>db.close());

it('head can assign and force all three Design flows without losing current role grants',async()=>{
  const sql=readFileSync('drizzle/migrations/0441_design_head_dispatch_permissions.sql','utf8');
  await db.exec(sql);
  await db.exec(sql); // Migration must be idempotent.
  const result=await db.query<{id:string;permissions:string[]}>(
    'SELECT id,permissions FROM public.app_roles ORDER BY id'
  );
  const byId=Object.fromEntries(result.rows.map(row=>[row.id,row.permissions]));
  expect(byId['role-v2-design-head']).toEqual(expect.arrayContaining([
    'order.view','leave.view_unit','order.assign','order.force_status',
    'order.photo.assign','order.photo.force_status',
    'order.marketing_design.assign','order.marketing_design.force_status',
    'order.order_mockup.assign','order.order_mockup.force_status'
  ]));
  expect(byId['role-v2-design-head']).toEqual(expect.arrayContaining(['order.test_1','order.test_21']));
  expect(byId['role-v2-design-staff']).toEqual(expect.arrayContaining(['order.marketing_design.force_status','order.test_1']));
  expect(byId['role-super-admin']).toEqual(['settings.role']);
});
