ALTER TABLE public.k3_data_reviews ADD COLUMN archived_at timestamptz, ADD COLUMN purge_at timestamptz, ADD COLUMN backup_id uuid;
CREATE FUNCTION public.k3_legacy_task_archive(_id uuid,_reason text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE t k3_tasks; b private.k3_kpi_upgrade_backups; v k3_data_reviews; stamp timestamptz:=clock_timestamp();
BEGIN
 IF auth.uid() IS NULL OR NOT public.biz_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Admin được lưu trữ dữ liệu cũ.'; END IF;
 IF btrim(coalesce(_reason,''))='' THEN RAISE EXCEPTION 'Cần lý do lưu trữ.'; END IF;
 SELECT * INTO t FROM k3_tasks WHERE id=_id;
 IF t.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy công việc.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(t.user_id::text));
 SELECT * INTO t FROM k3_tasks WHERE id=_id FOR UPDATE;
 IF t.kpi_id IS NOT NULL THEN RAISE EXCEPTION 'Công việc có KPI định danh; không thuộc dữ liệu thiếu quy cách.'; END IF;
 IF EXISTS(SELECT 1 FROM k3_days d WHERE d.id=t.day_id AND d.summarized_at IS NOT NULL) OR EXISTS(SELECT 1 FROM k3_summary_versions s CROSS JOIN LATERAL jsonb_array_elements(s.snapshot->'tasks') x WHERE x->>'id'=t.id::text) OR EXISTS(SELECT 1 FROM k3_period_summaries s CROSS JOIN LATERAL jsonb_array_elements(s.snapshot->'tasks') x WHERE x->>'id'=t.id::text) THEN RAISE EXCEPTION 'Có chốt sổ lịch sử; giữ bản gốc, không bắt đầu xóa 15 ngày.'; END IF;
 SELECT * INTO b FROM private.k3_kpi_upgrade_backups b WHERE EXISTS(SELECT 1 FROM jsonb_array_elements(b.snapshot->'tasks') x WHERE x=to_jsonb(t)) ORDER BY b.created_at DESC LIMIT 1;
 IF b.id IS NULL OR EXISTS(SELECT 1 FROM jsonb_each(b.snapshot) e WHERE jsonb_typeof(e.value)<>'array' OR (b.counts->>e.key)::int IS DISTINCT FROM jsonb_array_length(e.value)) THEN RAISE EXCEPTION 'Cần bản sao mới đã kiểm đếm và khớp nguyên bản.'; END IF;
 INSERT INTO k3_data_reviews(kind,record_id,reason,original_snapshot,archived_at,purge_at,backup_id) VALUES('task',t.id,btrim(_reason),to_jsonb(t),stamp,stamp+interval '15 days',b.id) ON CONFLICT(kind,record_id) DO UPDATE SET reason=excluded.reason,original_snapshot=excluded.original_snapshot,status='pending',archived_at=excluded.archived_at,purge_at=excluded.purge_at,backup_id=excluded.backup_id RETURNING * INTO v;
 UPDATE k3_tasks SET deleted_at=stamp,deleted_by=auth.uid() WHERE id=t.id;
 INSERT INTO k3_task_events(day_id,task_id,actor_id,action,detail) VALUES(t.day_id,t.id,auth.uid(),'archive',jsonb_build_object('review_id',v.id,'backup_id',b.id,'reason',_reason));
 RETURN to_jsonb(v);
END$fn$;
CREATE FUNCTION public.k3_legacy_task_restore(_review uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE v k3_data_reviews; t k3_tasks;
BEGIN
 IF auth.uid() IS NULL OR NOT public.biz_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Admin được khôi phục dữ liệu cũ.'; END IF;
 SELECT * INTO v FROM k3_data_reviews WHERE id=_review FOR UPDATE;
 IF v.kind<>'task' OR v.archived_at IS NULL OR v.status<>'pending' THEN RAISE EXCEPTION 'Không có công việc lưu trữ để khôi phục.'; END IF;
 IF v.purge_at<=now() THEN RAISE EXCEPTION 'Đã hết 15 ngày khôi phục.'; END IF;
 SELECT * INTO t FROM k3_tasks WHERE id=v.record_id FOR UPDATE;
 IF t.id IS NULL OR t.deleted_at IS DISTINCT FROM v.archived_at THEN RAISE EXCEPTION 'Bản gốc đã thay đổi; cần đối soát.'; END IF;
 UPDATE k3_tasks SET deleted_at=NULL,deleted_by=NULL WHERE id=t.id;
 UPDATE k3_data_reviews SET status='resolved',resolved_at=now(),resolved_by=auth.uid(),resolution_note='Khôi phục nguyên bản' WHERE id=v.id;
 INSERT INTO k3_task_events(day_id,task_id,actor_id,action,detail) VALUES(t.day_id,t.id,auth.uid(),'restore',jsonb_build_object('review_id',v.id));
 RETURN true;
END$fn$;
CREATE FUNCTION private.k3_review_purge_expired() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE v record; n int:=0;
BEGIN
 FOR v IN SELECT r.id,r.record_id,r.archived_at,t.day_id FROM k3_data_reviews r JOIN k3_tasks t ON t.id=r.record_id JOIN k3_days d ON d.id=t.day_id WHERE r.kind='task' AND r.status='pending' AND r.purge_at<=now() AND r.backup_id IS NOT NULL AND t.deleted_at=r.archived_at AND d.summarized_at IS NULL AND EXISTS(SELECT 1 FROM private.k3_kpi_upgrade_backups b WHERE b.id=r.backup_id AND EXISTS(SELECT 1 FROM jsonb_array_elements(b.snapshot->'tasks') x WHERE x->>'id'=r.record_id::text)) AND NOT EXISTS(SELECT 1 FROM k3_summary_versions s CROSS JOIN LATERAL jsonb_array_elements(s.snapshot->'tasks') x WHERE x->>'id'=r.record_id::text) AND NOT EXISTS(SELECT 1 FROM k3_period_summaries s CROSS JOIN LATERAL jsonb_array_elements(s.snapshot->'tasks') x WHERE x->>'id'=r.record_id::text) FOR UPDATE OF r,t SKIP LOCKED LIMIT 100 LOOP
 UPDATE k3_data_reviews SET status='delete_confirmed',resolved_at=now(),resolution_note='Hết 15 ngày; bản sao riêng tư được giữ.' WHERE id=v.id;
 DELETE FROM k3_tasks WHERE id=v.record_id;
 n:=n+1;
 END LOOP;
 RETURN n;
END$fn$;
DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_purge_expired(integer)'::regprocedure);
 def:=replace(def,'FOR g IN SELECT', 'PERFORM private.k3_review_purge_expired(); FOR g IN SELECT');
 EXECUTE def;
END$patch$;
REVOKE ALL ON FUNCTION public.k3_legacy_task_archive(uuid,text),public.k3_legacy_task_restore(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.k3_legacy_task_archive(uuid,text),public.k3_legacy_task_restore(uuid) TO authenticated;
REVOKE ALL ON FUNCTION private.k3_review_purge_expired() FROM PUBLIC,anon,authenticated;