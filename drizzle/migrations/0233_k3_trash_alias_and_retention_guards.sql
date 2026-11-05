DO $patch$ DECLARE def text;fname text; BEGIN
 FOREACH fname IN ARRAY ARRAY['public.k3_soft_delete(text,uuid)','public.k3_restore(text,uuid)'] LOOP
 def:=pg_get_functiondef(fname::regprocedure);def:=replace(def,'AS $function$','AS $function$'||chr(10)||'#variable_conflict use_column');EXECUTE def;
 END LOOP;
 def:=pg_get_functiondef('public.k3_trash_list(text)'::regprocedure);
 def:=replace(def,$old$'restorable',(g.user_id=uid OR adm)$old$,$new$'restorable',(g.deleted_at+interval '15 days'>now() AND (g.user_id=uid OR adm))$new$);
 def:=replace(def,$old$'restorable',(g.deleted_at IS NULL AND $old$,$new$'restorable',(a.deleted_at+interval '15 days'>now() AND g.deleted_at IS NULL AND $new$);EXECUTE def;
END $patch$;