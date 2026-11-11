-- PENDING. Run inside the SAME transaction as the forward patch, only after approved Role previews.
-- No data mutation, no settings changes, no migration 0371 edits.
DO $guard$
DECLARE item record;
BEGIN
 FOR item IN SELECT * FROM (VALUES
  ('private.base_rules(uuid,jsonb)','b7359b228a98c7f3c569c2098d509c12'),
  ('private.mkt_specialty_rules(uuid,jsonb)','7e533e3c63b78ac7f1d77bab59bed04a'),
  ('private.slot_previous_source_rows(jsonb)','54810e2df1dcf688f5024df0ce354dfa'),
  ('private.org_assignment_specialty_rules(uuid,jsonb)','69f604c02113025515c8b99efa001d8c'),
  ('private.role_source_rows(jsonb)','ce13485d8a163df0808967de4ab4797a'),
  ('private.has_permission(uuid,text)','c57afd7736a787a1cd89d48962f0261e')
 ) expected(signature,checksum)
 LOOP
  IF to_regprocedure(item.signature) IS NULL OR md5(pg_get_functiondef(to_regprocedure(item.signature)))<>item.checksum THEN
   RAISE EXCEPTION 'Source changed: %. Refresh backup and review; do not overwrite.',item.signature;
  END IF;
 END LOOP;
 IF EXISTS(SELECT 1 FROM public.app_roles r JOIN (VALUES
  ('role-content-web',ARRAY['web.view','web.content_view','web.content_view_mine','web.outline_start','web.outline_submit','web.post_write_start','web.post_submit']),
  ('role-seo',ARRAY['web.view','web.keyword_view','web.keyword_open_sheet']),
  ('role-local-seo',ARRAY['local.view','local.view_mine','local.post_create','local.post_edit']),
  ('role-social',ARRAY['social.view','social.post_view','social.post_view_mine','social.post_create','social.post_edit','social.post_start','social.post_submit']),
  ('role-video',ARRAY['video.view','video.view_mine','video.create','video.script_start','video.script_submit','video.submit'])
 ) draft(id,permissions) ON draft.id=r.id
 WHERE r.catalog_state<>'standard' OR r.role_kind<>'marketing_task' OR r.is_system
 OR ARRAY(SELECT unnest(r.permissions) ORDER BY 1) IS DISTINCT FROM ARRAY(SELECT unnest(draft.permissions) ORDER BY 1))
 OR (SELECT count(*) FROM public.app_roles WHERE id IN ('role-content-web','role-seo','role-local-seo','role-social','role-video'))<>5 THEN
  RAISE EXCEPTION 'Marketing Role minima not reviewed/applied: do not reactivate legacy full permissions. Use audited Role preview/apply first.';
 END IF;
END $guard$;