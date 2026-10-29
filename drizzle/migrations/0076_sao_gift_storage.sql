CREATE POLICY sao_gift_image_read ON storage.objects FOR SELECT TO authenticated USING(bucket_id='sao-gifts' AND public.is_active(auth.uid()));
CREATE POLICY sao_gift_image_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='sao-gifts' AND (storage.foldername(name))[1]=auth.uid()::text AND public.has_permission(auth.uid(),'sao.shop_manage'));
CREATE OR REPLACE FUNCTION public.sao_gift_save(_id uuid,_name text,_image text,_price integer,_stock integer,_enabled boolean) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE gid uuid:=coalesce(_id,gen_random_uuid()); oldrow jsonb; newrow jsonb;
BEGIN
 IF NOT private.sig_can(auth.uid(),'sao.shop_manage') THEN RAISE EXCEPTION 'Không có quyền quản lý quà'; END IF;
 IF _image IS NULL OR _image !~ '^storage:[a-f0-9-]+/[a-f0-9-]+\.(jpeg|png|webp)$' THEN RAISE EXCEPTION 'Vui lòng tải ảnh quà hợp lệ'; END IF;
 SELECT to_jsonb(g) INTO oldrow FROM public.sao_gifts g WHERE id=gid FOR UPDATE;
 INSERT INTO public.sao_gifts(id,name,image_url,price,stock,enabled) VALUES(gid,btrim(_name),_image,_price,_stock,_enabled)
 ON CONFLICT(id) DO UPDATE SET name=excluded.name,image_url=excluded.image_url,price=excluded.price,stock=excluded.stock,enabled=excluded.enabled,updated_at=now() RETURNING to_jsonb(sao_gifts.*) INTO newrow;
 INSERT INTO public.sao_admin_events(actor_id,kind,entity_id,before_data,after_data) VALUES(auth.uid(),'gift',gid::text,oldrow,newrow);
 RETURN gid;
END $$;