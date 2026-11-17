-- 2026-11-17: canonical organization positions for independent B2B,
-- Phân Phối and BTC/Showroom centers. Position definitions are stable and
-- associated with exactly one current V2 Role, even when vacant.
-- Uses the official preview/apply org_change workflow (audit + revision),
-- not a direct write around the canonical organization triggers.
DO $migration$
DECLARE preview_ jsonb; actor_ uuid; existing_ integer;
BEGIN
  SELECT id INTO STRICT actor_ FROM public.profiles
  WHERE username='Admin' AND status='Đang hoạt động' AND private.is_super_admin(id);
  PERFORM set_config('request.jwt.claim.sub',actor_::text,true);
  SELECT count(*) INTO existing_ FROM public.org_titles
  WHERE id IN ('org-v2-b2b-director','org-v2-b2b-gift1-head','org-v2-b2b-gift1-team','org-v2-b2b-gift1-staff','org-v2-b2b-gift2-head','org-v2-b2b-gift2-team','org-v2-b2b-gift2-staff','org-v2-dist1-head','org-v2-dist1-team','org-v2-dist1-staff','org-v2-btc-director');
  IF existing_=11 THEN
    IF EXISTS(
      SELECT 1 FROM (VALUES
        ('624e6e56-eeab-42d5-85af-6af284e72f34','org-v2-b2b-director','role-v2-b2b-director'),
        ('61efa9bf-0de8-43d5-95c8-f0578627a40e','org-v2-b2b-gift1-head','role-v2-b2b-head'),
        ('61efa9bf-0de8-43d5-95c8-f0578627a40e','org-v2-b2b-gift1-team','role-v2-b2b-team'),
        ('61efa9bf-0de8-43d5-95c8-f0578627a40e','org-v2-b2b-gift1-staff','role-v2-b2b-staff'),
        ('28239f0c-0657-4b88-8287-5b715a2387dd','org-v2-b2b-gift2-head','role-v2-b2b-head'),
        ('28239f0c-0657-4b88-8287-5b715a2387dd','org-v2-b2b-gift2-team','role-v2-b2b-team'),
        ('28239f0c-0657-4b88-8287-5b715a2387dd','org-v2-b2b-gift2-staff','role-v2-b2b-staff'),
        ('cef13ee0-73a8-43c4-bfe5-6bef393248fc','org-v2-dist1-head','role-v2-distribution-head'),
        ('cef13ee0-73a8-43c4-bfe5-6bef393248fc','org-v2-dist1-team','role-v2-distribution-team'),
        ('cef13ee0-73a8-43c4-bfe5-6bef393248fc','org-v2-dist1-staff','role-v2-distribution-staff'),
        ('76fcf3a9-8561-4e2a-be3c-c6724a6310fb','org-v2-btc-director','role-v2-btc-director')
      ) v(unit_id,title_id,role_id)
      WHERE NOT EXISTS(
        SELECT 1 FROM public.org_position_roles pr
        WHERE pr.unit_id=v.unit_id AND pr.title_id=v.title_id AND pr.role_id=v.role_id)
    ) THEN RAISE EXCEPTION 'Canonical center role binding differs; manual reconciliation required'; END IF;
    RETURN;
  END IF;
  IF existing_<>0 THEN RAISE EXCEPTION 'Partial canonical title migration detected: % of 11',existing_; END IF;
  preview_:=public.org_change('preview',
    (SELECT revision FROM private.org_control WHERE id),
    '[{"action":"title","data":{"id":"org-v2-b2b-director","unit_id":"624e6e56-eeab-42d5-85af-6af284e72f34","name":"Giám đốc Trung tâm Kinh doanh B2B","code":"v2-b2b-director","kind":"manager","level":3,"capacity":1}},{"action":"position_role","data":{"unit_id":"624e6e56-eeab-42d5-85af-6af284e72f34","title_id":"org-v2-b2b-director","role_id":"role-v2-b2b-director","reason":"Chuẩn hóa ô vị trí theo trung tâm và Role V2"}},{"action":"title","data":{"id":"org-v2-b2b-gift1-head","unit_id":"61efa9bf-0de8-43d5-95c8-f0578627a40e","name":"Trưởng phòng Kinh doanh B2B","code":"v2-b2b-gift1-head","kind":"manager","level":2,"capacity":1}},{"action":"position_role","data":{"unit_id":"61efa9bf-0de8-43d5-95c8-f0578627a40e","title_id":"org-v2-b2b-gift1-head","role_id":"role-v2-b2b-head","reason":"Chuẩn hóa ô vị trí theo trung tâm và Role V2"}},{"action":"title","data":{"id":"org-v2-b2b-gift1-team","unit_id":"61efa9bf-0de8-43d5-95c8-f0578627a40e","name":"Trưởng nhóm Kinh doanh B2B","code":"v2-b2b-gift1-team","kind":"manager","level":1,"capacity":1}},{"action":"position_role","data":{"unit_id":"61efa9bf-0de8-43d5-95c8-f0578627a40e","title_id":"org-v2-b2b-gift1-team","role_id":"role-v2-b2b-team","reason":"Chuẩn hóa ô vị trí theo trung tâm và Role V2"}},{"action":"title","data":{"id":"org-v2-b2b-gift1-staff","unit_id":"61efa9bf-0de8-43d5-95c8-f0578627a40e","name":"Nhân viên Kinh doanh B2B","code":"v2-b2b-gift1-staff","kind":"staff","level":0,"capacity":0}},{"action":"position_role","data":{"unit_id":"61efa9bf-0de8-43d5-95c8-f0578627a40e","title_id":"org-v2-b2b-gift1-staff","role_id":"role-v2-b2b-staff","reason":"Chuẩn hóa ô vị trí theo trung tâm và Role V2"}},{"action":"title","data":{"id":"org-v2-b2b-gift2-head","unit_id":"28239f0c-0657-4b88-8287-5b715a2387dd","name":"Trưởng phòng Kinh doanh B2B","code":"v2-b2b-gift2-head","kind":"manager","level":2,"capacity":1}},{"action":"position_role","data":{"unit_id":"28239f0c-0657-4b88-8287-5b715a2387dd","title_id":"org-v2-b2b-gift2-head","role_id":"role-v2-b2b-head","reason":"Chuẩn hóa ô vị trí theo trung tâm và Role V2"}},{"action":"title","data":{"id":"org-v2-b2b-gift2-team","unit_id":"28239f0c-0657-4b88-8287-5b715a2387dd","name":"Trưởng nhóm Kinh doanh B2B","code":"v2-b2b-gift2-team","kind":"manager","level":1,"capacity":1}},{"action":"position_role","data":{"unit_id":"28239f0c-0657-4b88-8287-5b715a2387dd","title_id":"org-v2-b2b-gift2-team","role_id":"role-v2-b2b-team","reason":"Chuẩn hóa ô vị trí theo trung tâm và Role V2"}},{"action":"title","data":{"id":"org-v2-b2b-gift2-staff","unit_id":"28239f0c-0657-4b88-8287-5b715a2387dd","name":"Nhân viên Kinh doanh B2B","code":"v2-b2b-gift2-staff","kind":"staff","level":0,"capacity":0}},{"action":"position_role","data":{"unit_id":"28239f0c-0657-4b88-8287-5b715a2387dd","title_id":"org-v2-b2b-gift2-staff","role_id":"role-v2-b2b-staff","reason":"Chuẩn hóa ô vị trí theo trung tâm và Role V2"}},{"action":"title","data":{"id":"org-v2-dist1-head","unit_id":"cef13ee0-73a8-43c4-bfe5-6bef393248fc","name":"Trưởng phòng Kinh doanh Phân Phối","code":"v2-dist1-head","kind":"manager","level":2,"capacity":1}},{"action":"position_role","data":{"unit_id":"cef13ee0-73a8-43c4-bfe5-6bef393248fc","title_id":"org-v2-dist1-head","role_id":"role-v2-distribution-head","reason":"Chuẩn hóa ô vị trí theo trung tâm và Role V2"}},{"action":"title","data":{"id":"org-v2-dist1-team","unit_id":"cef13ee0-73a8-43c4-bfe5-6bef393248fc","name":"Trưởng nhóm Kinh doanh Phân Phối","code":"v2-dist1-team","kind":"manager","level":1,"capacity":1}},{"action":"position_role","data":{"unit_id":"cef13ee0-73a8-43c4-bfe5-6bef393248fc","title_id":"org-v2-dist1-team","role_id":"role-v2-distribution-team","reason":"Chuẩn hóa ô vị trí theo trung tâm và Role V2"}},{"action":"title","data":{"id":"org-v2-dist1-staff","unit_id":"cef13ee0-73a8-43c4-bfe5-6bef393248fc","name":"Nhân viên Kinh doanh Phân Phối","code":"v2-dist1-staff","kind":"staff","level":0,"capacity":0}},{"action":"position_role","data":{"unit_id":"cef13ee0-73a8-43c4-bfe5-6bef393248fc","title_id":"org-v2-dist1-staff","role_id":"role-v2-distribution-staff","reason":"Chuẩn hóa ô vị trí theo trung tâm và Role V2"}},{"action":"title","data":{"id":"org-v2-btc-director","unit_id":"76fcf3a9-8561-4e2a-be3c-c6724a6310fb","name":"Giám đốc Trung tâm Kinh doanh BTC","code":"v2-btc-director","kind":"manager","level":3,"capacity":1}},{"action":"position_role","data":{"unit_id":"76fcf3a9-8561-4e2a-be3c-c6724a6310fb","title_id":"org-v2-btc-director","role_id":"role-v2-btc-director","reason":"Chuẩn hóa ô vị trí theo trung tâm và Role V2"}}]'::jsonb,NULL,NULL,NULL);
  PERFORM public.org_change('apply',NULL,NULL,(preview_->>'id')::uuid,
    'ÁP DỤNG CƠ CẤU','Khởi tạo một bộ ô vị trí chuẩn và Role V2 cho B2B, Phân Phối, BTC');
END
$migration$;
