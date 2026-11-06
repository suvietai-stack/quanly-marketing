REVOKE INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.signal_labels,public.signal_label_links,public.signal_enrichment_events FROM authenticated,anon;
GRANT SELECT ON public.signal_labels,public.signal_label_links,public.signal_enrichment_events TO authenticated;
CREATE OR REPLACE FUNCTION private.signal_potential_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
IF TG_OP='INSERT' THEN NEW.potential:='unrated'; NEW.potential_updated_by:=NULL; NEW.potential_updated_at:=NULL;
ELSIF (NEW.potential IS DISTINCT FROM OLD.potential OR NEW.potential_updated_by IS DISTINCT FROM OLD.potential_updated_by OR NEW.potential_updated_at IS DISTINCT FROM OLD.potential_updated_at) AND (coalesce(current_setting('app.sig_enrichment',true),'') <> '1' OR current_user IN ('authenticated','anon')) THEN RAISE EXCEPTION 'Đánh giá tiềm năng chỉ lưu qua thao tác được cấp quyền'; END IF;
RETURN NEW; END $$;