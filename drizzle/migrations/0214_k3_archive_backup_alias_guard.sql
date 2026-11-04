DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_legacy_task_archive(uuid,text)'::regprocedure);
 def:=replace(def,'FROM private.k3_kpi_upgrade_backups b WHERE EXISTS(SELECT 1 FROM jsonb_array_elements(b.snapshot->''tasks'') x WHERE x=to_jsonb(t)) ORDER BY b.created_at', 'FROM private.k3_kpi_upgrade_backups bk WHERE EXISTS(SELECT 1 FROM jsonb_array_elements(bk.snapshot->''tasks'') x WHERE x=to_jsonb(t)) ORDER BY bk.created_at');
 EXECUTE def;
END$patch$;