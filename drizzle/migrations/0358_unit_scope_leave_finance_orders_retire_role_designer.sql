-- 0358: Unit-scoped visibility for Leave / Finance / Order-tracking; retire role-designer.
-- Owning unit is derived at query time from the related user's active org membership
-- (leave_requests.owner_id, bank_transactions.claimed_by, ot_orders.sale_id/supply_id).
-- Records whose related user has no active membership stay invisible to unit scope (no guessing).
-- design/photography specialties are held via mkt_staff_specialties (no org_assignments
-- specialty_ids reference them), so no assignment signature refresh is needed.

-- 0) Fix resign trigger: base_title_role_events.actor_id is NOT NULL + FK to profiles,
--    so the audit row must carry a real actor (caller, else first Super Admin).
CREATE OR REPLACE FUNCTION private.base_role_links_resign()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE v_actor uuid;
BEGIN
  SELECT p.id INTO v_actor FROM public.profiles p WHERE p.id = auth.uid();
  IF v_actor IS NULL THEN
    SELECT ur.user_id INTO v_actor FROM public.user_roles ur WHERE ur.role_id = 'role-super-admin' ORDER BY ur.user_id LIMIT 1;
  END IF;
  WITH upd AS (
    UPDATE public.base_title_role_links l
    SET enabled_permissions = ARRAY(
          SELECT p FROM unnest(coalesce(l.enabled_permissions,'{}'::text[])) p
          WHERE p = ANY (NEW.permissions) AND private.org_role_permission_ready(p)),
        permission_signature = md5(coalesce(NEW.permissions,'{}'::text[])::text),
        revision = l.revision + 1,
        updated_at = now()
    WHERE l.role_id = NEW.id
      AND (l.permission_signature IS DISTINCT FROM md5(coalesce(NEW.permissions,'{}'::text[])::text)
           OR l.enabled_permissions <> ARRAY(
                SELECT p FROM unnest(coalesce(l.enabled_permissions,'{}'::text[])) p
                WHERE p = ANY (NEW.permissions) AND private.org_role_permission_ready(p)))
    RETURNING l.title_source, l.title_id
  )
  INSERT INTO public.base_title_role_events (actor_id, title_source, title_id, reason, before_data, after_data)
  SELECT v_actor, u.title_source, u.title_id,
         'Tự đồng bộ chữ ký liên kết sau khi Role thay đổi quyền',
         jsonb_build_object('role_id', OLD.id, 'permissions', OLD.permissions),
         jsonb_build_object('role_id', NEW.id, 'permissions', NEW.permissions)
  FROM upd u
  WHERE v_actor IS NOT NULL;

  UPDATE public.org_assignments a
  SET data = jsonb_set(a.data, '{specialty_signatures}',
             coalesce(a.data->'specialty_signatures','{}'::jsonb) || jsonb_build_object(s.id, md5(coalesce(NEW.permissions,'{}'::text[])::text))),
      revision = a.revision + 1
  FROM public.mkt_specialties s
  WHERE s.role_id = NEW.id
    AND a.data->'specialty_ids' ? s.id
    AND (a.data->'specialty_signatures'->>s.id) IS DISTINCT FROM md5(coalesce(NEW.permissions,'{}'::text[])::text);

  RETURN NEW;
END
$function$;

-- 1) Permission catalog entries
INSERT INTO public.base_permission_catalog (key, label, module, dependencies) VALUES
  ('leave.view_unit','Xem đơn của thành viên đơn vị mình quản lý','Đơn Từ & Phê Duyệt','{}'::text[]),
  ('ot.view_unit','Xem đơn hàng của thành viên đơn vị mình quản lý','Theo Dõi Đơn Hàng','{}'::text[]),
  ('finance.incoming.view_unit','Xem giao dịch Tiền Về do thành viên đơn vị mình quản lý phụ trách','Tài Chính Kế Toán','{}'::text[])
ON CONFLICT (key) DO NOTHING;

-- 2) Verified allowlist: the three unit-scope permissions are enforced server-side below
CREATE OR REPLACE FUNCTION private.org_role_permission_ready(p text)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $function$
SELECT p = ANY (ARRAY[
  'leave.create','leave.view_own','leave.edit_own','leave.recall',
  'leave.view_assigned','leave.view_all','leave.view_unit','leave.approve','leave.create_for','leave.edit_others','leave.cancel_handle','leave.exception','leave.reassign','leave.report','leave.export','leave.settings',
  'att.create','att.view_own','att.edit_own','att.witness',
  'att.manage','att.reconcile','att.report','att.view_all','att.settings',
  'order.view','order.view_mine','order.create','order.take','order.update_draft','order.submit','order.resubmit','order.deliver','order.history','order.open_delivery',
  'order.approve','order.assign','order.edit','order.complete','order.cancel','order.edit_reviewer','order.report_view','order.request_changes','order.send_request','order.view_all',
  'order.marketing_design.view','order.marketing_design.view_all','order.marketing_design.create','order.marketing_design.send_request','order.marketing_design.submit','order.marketing_design.take','order.marketing_design.update_draft','order.marketing_design.resubmit','order.marketing_design.deliver','order.marketing_design.approve','order.marketing_design.assign','order.marketing_design.edit','order.marketing_design.complete','order.marketing_design.cancel','order.marketing_design.edit_reviewer','order.marketing_design.report_view','order.marketing_design.request_changes',
  'oq.create','oq.accept','oq.reply_price','oq.reply_progress','oq.report_own',
  'oq.view_own','oq.view_all','oq.manage','oq.report_all','oq.report_export',
  'ot.view_own','ot.view_unit','ot.task_view','ot.task_update','ot.stage_update',
  'ot.accept','ot.assign','ot.create','ot.manage','ot.report','ot.report_export','ot.reschedule_propose','ot.reschedule_reply','ot.supplier','ot.view_all',
  'finance.incoming.view','finance.incoming.view_unit','finance.incoming.view_totals','finance.incoming.claim','finance.incoming.reconcile','finance.incoming.manual_view','finance.incoming.manual_create','finance.incoming.manual_manage','finance.incoming.manage','finance.incoming.remind',
  'signal.sale','signal.report','signal.reassign','signal.view_all','signal.assign',
  'signal.create','signal.edit','signal.manage','signal.delete','signal.catalog',
  'biz.crm_use','biz.crm_access','biz.crm_view_scope','biz.crm_edit_other',
  'biz.crm_transfer','biz.crm_archive','biz.crm_export','biz.crm_settings',
  'kpi.view_own','overview.view','overview.own_only','settings.view'
])
$function$;

-- 3) Unit membership: target's active unit is the manager's active unit or a descendant
CREATE OR REPLACE FUNCTION private.base_unit_member(u uuid, target uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
  SELECT u IS NOT NULL AND target IS NOT NULL AND private.is_active(u) AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(coalesce(s.c->'memberships','[]'::jsonb)) m
    JOIN jsonb_array_elements(coalesce(s.c->'memberships','[]'::jsonb)) t ON true
    WHERE m->>'user_id' = u::text
      AND private.base_valid_at(m) AND coalesce(m->>'status','active') = 'active'
      AND t->>'user_id' = target::text
      AND private.base_valid_at(t) AND coalesce(t->>'status','active') = 'active'
      AND private.base_role_unit_contains(s.c, m->>'unit_id', t->>'unit_id')
  )
  FROM (SELECT private.base_config() AS c) s
$function$;

-- 4) Leave: unit visibility helper + RLS branch
CREATE OR REPLACE FUNCTION private.leave_unit_visible(u uuid, owner uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
  SELECT private.sig_can(u,'leave.view_unit') AND private.base_unit_member(u, owner)
$function$;

DROP POLICY IF EXISTS "leave_requests read" ON public.leave_requests;
CREATE POLICY "leave_requests read" ON public.leave_requests FOR SELECT TO authenticated USING (
  (owner_id = auth.uid() AND private.sig_can(auth.uid(),'leave.view_own'))
  OR (created_by = auth.uid() AND private.sig_can(auth.uid(),'leave.create_for'))
  OR (approver_id = auth.uid() AND (private.sig_can(auth.uid(),'leave.view_assigned') OR private.sig_can(auth.uid(),'leave.approve')))
  OR private.sig_can(auth.uid(),'leave.view_all')
  OR private.leave_unit_visible(auth.uid(), owner_id)
);

-- 5) Finance: unit branch on claimed transactions
CREATE OR REPLACE FUNCTION private.fin_can_see(_uid uuid, _tx uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'pg_catalog', 'public' AS $function$
SELECT _uid IS NOT NULL AND private.is_active(_uid) AND EXISTS(
  SELECT 1 FROM public.bank_transactions t LEFT JOIN public.bank_accounts a ON a.id=t.bank_account_id
  WHERE t.id=_tx AND CASE WHEN t.operation_test THEN private.fin_super(_uid) ELSE (
    private.sig_can(_uid,'finance.incoming.manage')
    OR private.sig_can(_uid,'finance.incoming.reconcile')
    OR (t.source<>'bank' AND private.sig_can(_uid,'finance.incoming.manual_manage'))
    OR (t.claimed_by IS NOT NULL AND private.sig_can(_uid,'finance.incoming.view_unit') AND private.base_unit_member(_uid, t.claimed_by))
    OR ((CASE WHEN t.source='bank' THEN (private.sig_can(_uid,'finance.incoming.view') OR private.sig_can(_uid,'finance.incoming.claim')) AND coalesce(a.share_sale,false) ELSE private.sig_can(_uid,'finance.incoming.manual_view') END)
        AND (t.claimed_by=_uid OR (t.claimed_by IS NULL AND t.confirmation_status='unclaimed')))
    OR (t.source<>'bank' AND t.created_by=_uid AND private.sig_can(_uid,'finance.incoming.manual_create') AND t.claimed_by IS NULL AND t.confirmation_status='unclaimed')
  ) END);
$function$;

-- 6) Order tracking: unit branch on sale/supply owners
CREATE OR REPLACE FUNCTION private.ot_can_view(_uid uuid, _order uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
  SELECT private.sig_can(_uid,'ot.view_all') OR private.sig_can(_uid,'ot.manage')
    OR (private.sig_can(_uid,'ot.view_unit') AND EXISTS (
         SELECT 1 FROM public.ot_orders o WHERE o.id = _order
           AND (private.base_unit_member(_uid, o.sale_id) OR private.base_unit_member(_uid, o.supply_id))))
    OR EXISTS (SELECT 1 FROM public.ot_orders o WHERE o.id = _order AND private.sig_can(_uid,'ot.view_own')
               AND _uid IN (o.sale_id, o.supply_id, o.created_by))
    OR EXISTS (SELECT 1 FROM public.ot_tasks t WHERE t.order_id = _order AND t.assignee_id = _uid AND private.sig_can(_uid,'ot.task_view'));
$function$;

-- 7) Grant unit-scope permissions to manager roles (resign trigger re-signs title links)
UPDATE public.app_roles
SET permissions = permissions || ARRAY['ot.view_unit','finance.incoming.view_unit','leave.view_unit']::text[]
WHERE id = 'role-standard-sales-head';
UPDATE public.app_roles
SET permissions = permissions || ARRAY['leave.view_unit']::text[]
WHERE id IN ('role-standard-mkt-head','role-standard-design-head','role-standard-proc-head');

-- 8) Retire role-designer: specialties design/photography move to the standard design role;
--    old role archived (not deleted, history preserved).
UPDATE public.mkt_specialties SET role_id = 'role-standard-design-staff' WHERE id IN ('design','photography');
UPDATE public.app_roles SET catalog_state = 'archived' WHERE id = 'role-designer';