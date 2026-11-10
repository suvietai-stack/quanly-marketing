-- Resolve pgcrypto explicitly without widening SECURITY DEFINER search paths,
-- changing permissions, rotating the vault key or rewriting credential rows.
DO $repair$
DECLARE target regprocedure; definition text; repaired text;
BEGIN
  FOREACH target IN ARRAY ARRAY[
    'public.sw_credential_save(uuid,text,text,text)'::regprocedure,
    'public.sw_reveal_password()'::regprocedure
  ] LOOP
    definition := pg_get_functiondef(target);
    repaired := replace(replace(definition,
      'pgp_sym_encrypt(_password, private.sw_key())',
      'extensions.pgp_sym_encrypt(_password, private.sw_key())'),
      'pgp_sym_decrypt(_c.password_enc, private.sw_key())',
      'extensions.pgp_sym_decrypt(_c.password_enc, private.sw_key())');
    IF repaired = definition OR position('extensions.extensions.' in repaired) > 0 THEN
      RAISE EXCEPTION 'Unexpected Sale Work function definition: %', target;
    END IF;
    EXECUTE repaired;
  END LOOP;
END $repair$;

-- Only the two documented legacy aliases are equivalent for optimistic locking.
-- All other keys and unknown statuses retain exact JSON comparisons.
-- The existing row lock, access checks and workflow/audit triggers stay intact.
DO $repair$
DECLARE definition text; repaired text;
BEGIN
  definition := pg_get_functiondef('public.design_order_save(text,jsonb,jsonb)'::regprocedure);
  repaired := replace(definition,
    'IF r.data->k IS DISTINCT FROM _expected->k THEN',
    $comparison$IF (CASE WHEN k = 'status' THEN
      CASE r.data->>'status'
        WHEN 'Mới tạo' THEN to_jsonb('Chờ phân công'::text)
        WHEN 'Đang làm' THEN to_jsonb('Đang thực hiện'::text)
        ELSE r.data->k END
      ELSE r.data->k END) IS DISTINCT FROM
      (CASE WHEN k = 'status' THEN
        CASE _expected->>'status'
          WHEN 'Mới tạo' THEN to_jsonb('Chờ phân công'::text)
          WHEN 'Đang làm' THEN to_jsonb('Đang thực hiện'::text)
          ELSE _expected->k END
        ELSE _expected->k END) THEN$comparison$);
  IF repaired = definition THEN
    RAISE EXCEPTION 'Unexpected design_order_save concurrency predicate';
  END IF;
  EXECUTE repaired;
END $repair$;