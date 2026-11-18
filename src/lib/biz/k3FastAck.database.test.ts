import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, expect, it } from 'vitest';

const db = new PGlite();
const uid = '00000000-0000-0000-0000-000000000001';
const kpi = '00000000-0000-0000-0000-000000000002';
const key = '11111111-1111-4111-8111-111111111111';
const date = '2026-11-18';
const payload = (ack_only?: boolean) => JSON.stringify({
  kpi_id: kpi, work_date:date, request_key:key, ...(ack_only ? {ack_only:true} : {}),
});
const call = async (p: string) => (await db.query<{ v: any }>(
  'SELECT public.k3_kpi_result_save($1::jsonb) v',[p],
)).rows[0].v;

beforeAll(async () => {
  await db.exec(`
  CREATE SCHEMA auth;
  CREATE TABLE public.k3_kpi_result_versions(actor_id uuid,request_key uuid);
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT '${uid}'::uuid$$;
  CREATE FUNCTION public.k3_kpi_result_read(uuid,date) RETURNS jsonb LANGUAGE sql AS
    $$SELECT jsonb_build_object('full_detail',true)$$;
  CREATE FUNCTION public.k3_kpi_result_save(_payload jsonb) RETURNS jsonb
    LANGUAGE plpgsql AS $function$
  DECLARE p jsonb:=_payload; uid uuid:=auth.uid(); kid uuid:=nullif(p->>'kpi_id','')::uuid;
    day date:=nullif(p->>'work_date','')::date; key uuid:=nullif(p->>'request_key','')::uuid;
    r record;
  BEGIN
    IF EXISTS(SELECT 1 FROM public.k3_kpi_result_versions WHERE actor_id=uid AND request_key=key) THEN RETURN public.k3_kpi_result_read(kid,day); END IF;
    SELECT '${kpi}'::uuid AS id,1::bigint AS revision INTO r;
    RETURN public.k3_kpi_result_read(kid,day);
  END$function$;
  `);
  await db.exec(readFileSync('drizzle/migrations/0466_k3_kpi_result_ack_fast_path.sql','utf8'));
},30000);

afterAll(() => db.close());

it('legacy result save caller keeps the complete response shape',async()=>{
  expect(await call(payload())).toEqual({full_detail:true});
});

it('new caller gets lightweight acknowledgement without recomputing details',async()=>{
  expect(await call(payload(true))).toEqual({
    saved:true,result_id:kpi,revision:1,kpi_id:kpi,work_date:date,
  });
});

it('retry with same actor/request key is idempotent and returns a short receipt',async()=>{
  await db.query('INSERT INTO public.k3_kpi_result_versions VALUES($1,$2)',[uid,key]);
  expect(await call(payload(true))).toEqual({
    saved:true,duplicate:true,kpi_id:kpi,work_date:date,
  });
});
