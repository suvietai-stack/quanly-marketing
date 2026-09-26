CREATE TABLE public.app_branding (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  app_name text NOT NULL DEFAULT 'Base Marketing',
  short_name text NOT NULL DEFAULT 'BASE',
  org_name text NOT NULL DEFAULT 'Công ty Cổ phần Sứ Việt',
  description text NOT NULL DEFAULT 'Quản lý công việc',
  logo_url text,
  favicon_url text,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_branding TO anon, authenticated;
GRANT ALL ON public.app_branding TO service_role;
ALTER TABLE public.app_branding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "branding public read" ON public.app_branding FOR SELECT TO anon, authenticated USING (id = 1);
INSERT INTO public.app_branding (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE TABLE public.app_branding_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  before jsonb NOT NULL,
  after jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_branding_history TO authenticated;
GRANT ALL ON public.app_branding_history TO service_role;
ALTER TABLE public.app_branding_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "branding history read" ON public.app_branding_history FOR SELECT TO authenticated
  USING (private.is_super_admin(auth.uid()) OR private.has_permission(auth.uid(), 'system.branding'));

CREATE OR REPLACE FUNCTION public.branding_save(_app_name text, _short_name text, _org_name text, _description text, _logo_url text, _favicon_url text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE old jsonb; nw jsonb; img text := '^data:image/(png|jpeg|webp|x-icon|vnd\.microsoft\.icon);base64,[A-Za-z0-9+/=]+$';
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_active(auth.uid()) OR NOT (private.is_super_admin(auth.uid()) OR private.has_permission(auth.uid(), 'system.branding')) THEN
    RAISE EXCEPTION 'Bạn không có quyền Quản lý thông tin hệ thống';
  END IF;
  _app_name := btrim(coalesce(_app_name,'')); _short_name := btrim(coalesce(_short_name,''));
  _org_name := btrim(coalesce(_org_name,'')); _description := btrim(coalesce(_description,''));
  _logo_url := nullif(_logo_url,''); _favicon_url := nullif(_favicon_url,'');
  IF _app_name = '' OR length(_app_name) > 60 THEN RAISE EXCEPTION 'Tên ứng dụng bắt buộc, tối đa 60 ký tự'; END IF;
  IF _short_name = '' OR length(_short_name) > 20 THEN RAISE EXCEPTION 'Tên viết tắt bắt buộc, tối đa 20 ký tự'; END IF;
  IF length(_org_name) > 120 THEN RAISE EXCEPTION 'Tên đơn vị tối đa 120 ký tự'; END IF;
  IF length(_description) > 200 THEN RAISE EXCEPTION 'Mô tả tối đa 200 ký tự'; END IF;
  IF (_logo_url IS NOT NULL AND (_logo_url !~ img OR length(_logo_url) > 700000))
     OR (_favicon_url IS NOT NULL AND (_favicon_url !~ img OR length(_favicon_url) > 700000)) THEN
    RAISE EXCEPTION 'Ảnh không hợp lệ: chỉ nhận PNG, JPG, WEBP, ICO tối đa 500 KB';
  END IF;
  SELECT to_jsonb(b) - 'updated_by' - 'updated_at' - 'logo_url' - 'favicon_url' || jsonb_build_object('logo', b.logo_url IS NOT NULL, 'favicon', b.favicon_url IS NOT NULL) INTO old FROM public.app_branding b WHERE id = 1;
  UPDATE public.app_branding SET app_name=_app_name, short_name=_short_name, org_name=_org_name, description=_description,
    logo_url=_logo_url, favicon_url=_favicon_url, updated_by=auth.uid(), updated_at=now() WHERE id = 1;
  SELECT to_jsonb(b) - 'updated_by' - 'updated_at' - 'logo_url' - 'favicon_url' || jsonb_build_object('logo', b.logo_url IS NOT NULL, 'favicon', b.favicon_url IS NOT NULL) INTO nw FROM public.app_branding b WHERE id = 1;
  INSERT INTO public.app_branding_history(actor_id, before, after) VALUES (auth.uid(), old, nw);
END $$;
REVOKE ALL ON FUNCTION public.branding_save(text,text,text,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.branding_save(text,text,text,text,text,text) TO authenticated;

DROP POLICY IF EXISTS "leave_settings read" ON public.leave_settings;
CREATE POLICY "leave_settings read" ON public.leave_settings FOR SELECT TO authenticated USING (private.is_active(auth.uid()));