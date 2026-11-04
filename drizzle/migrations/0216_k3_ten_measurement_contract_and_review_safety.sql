ALTER TABLE public.k3_kpis ADD COLUMN config jsonb NOT NULL DEFAULT '{}'::jsonb, ADD COLUMN config_revision bigint NOT NULL DEFAULT 1, ADD COLUMN replaces_kpi_id uuid REFERENCES public.k3_kpis(id);
ALTER TABLE public.k3_kpis DROP CONSTRAINT k3_measure_check;
ALTER TABLE public.k3_kpis ADD CONSTRAINT k3_measure_check CHECK(measure IN('cumulative','distinct','current','ratio','average','milestone','duration','binary','frequency','streak'));
ALTER TABLE public.k3_kpi_results ADD COLUMN config_revision bigint NOT NULL DEFAULT 1, ADD COLUMN intervals jsonb NOT NULL DEFAULT '[]'::jsonb;
CREATE TABLE public.k3_kpi_config_versions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),kpi_id uuid NOT NULL REFERENCES public.k3_kpis(id),revision bigint NOT NULL,snapshot jsonb NOT NULL,actor_id uuid,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(kpi_id,revision));
GRANT SELECT ON public.k3_kpi_config_versions TO authenticated; GRANT ALL ON public.k3_kpi_config_versions TO service_role;
ALTER TABLE public.k3_kpi_config_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY k3_config_version_read ON public.k3_kpi_config_versions FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.k3_kpis k LEFT JOIN public.k3_actions a ON a.id=k.action_id WHERE k.id=kpi_id AND public.k3_goal_visible(auth.uid(),coalesce(k.goal_id,a.goal_id))));
INSERT INTO public.k3_kpi_config_versions(kpi_id,revision,snapshot,actor_id) SELECT id,config_revision,to_jsonb(k),created_by FROM public.k3_kpis k;
CREATE TABLE public.k3_kpi_acceptances(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),result_id uuid NOT NULL REFERENCES public.k3_kpi_results(id),result_revision bigint NOT NULL,decision text NOT NULL CHECK(decision IN('accepted','rejected')),actor_id uuid NOT NULL,reason text NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.k3_kpi_acceptances TO authenticated; GRANT ALL ON public.k3_kpi_acceptances TO service_role;
ALTER TABLE public.k3_kpi_acceptances ENABLE ROW LEVEL SECURITY;
CREATE POLICY k3_acceptance_read ON public.k3_kpi_acceptances FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.k3_kpi_results r WHERE r.id=result_id AND private.k3_result_detail_ok(auth.uid(),r.user_id,r.goal_id,r.work_date)));
CREATE FUNCTION private.k3_config_snapshot() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$ BEGIN
 INSERT INTO public.k3_kpi_config_versions(kpi_id,revision,snapshot,actor_id) VALUES(NEW.id,NEW.config_revision,to_jsonb(NEW),auth.uid()); RETURN NEW; END $fn$;
REVOKE ALL ON FUNCTION private.k3_config_snapshot() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER k3_config_snapshot AFTER INSERT OR UPDATE OF config,measure,condition,target,target_max,required,milestones ON public.k3_kpis FOR EACH ROW EXECUTE FUNCTION private.k3_config_snapshot();
COMMENT ON TABLE public.k3_data_reviews IS 'Pending migration quarantine is retained indefinitely. Only explicitly confirmed deletions belong to the separate 15-day trash lifecycle.';
CREATE OR REPLACE FUNCTION private.k3_review_purge_expired() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$ BEGIN RETURN 0; END $fn$;
DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_legacy_task_archive(uuid,text)'::regprocedure);
 def:=replace(def,$old$stamp+interval '15 days'$old$,'NULL'); EXECUTE def;
 def:=pg_get_functiondef('public.k3_legacy_task_restore(uuid)'::regprocedure);
 def:=replace(def,$old$IF v.purge_at<=now() THEN RAISE EXCEPTION 'Đã hết 15 ngày khôi phục.'; END IF;$old$,''); EXECUTE def;
 END $patch$;