-- Tighten direct legacy supplier reads after unified master cutover.
-- Tracking users retain private.ot_any(), commercial roles use supplier.master.view.
-- No supplier row content is exposed to unrelated active staff.
BEGIN;
SET LOCAL lock_timeout='10s';
SET LOCAL statement_timeout='75s';
DROP POLICY IF EXISTS account_active_guard ON public.ot_suppliers;
CREATE POLICY account_active_guard ON public.ot_suppliers
  FOR ALL TO authenticated
  USING (
    private.is_active(auth.uid())
    AND (private.ot_any(auth.uid()) OR private.supplier_master_can_read(auth.uid()))
  )
  WITH CHECK (
    private.is_active(auth.uid())
    AND (private.ot_any(auth.uid()) OR private.supplier_master_can_read(auth.uid()))
  );
COMMIT;
