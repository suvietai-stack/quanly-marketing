-- Restores original policy, leaves active restrictive guard unchanged.
BEGIN;
ALTER POLICY "leave_requests read" ON public.leave_requests USING (
 ((owner_id = auth.uid()) AND private.sig_can(auth.uid(), 'leave.view_own'::text))
 OR ((created_by = auth.uid()) AND private.sig_can(auth.uid(), 'leave.create_for'::text))
 OR ((approver_id = auth.uid()) AND (private.sig_can(auth.uid(), 'leave.view_assigned'::text) OR private.sig_can(auth.uid(), 'leave.approve'::text)))
 OR private.sig_can(auth.uid(), 'leave.view_all'::text)
 OR private.leave_unit_visible(auth.uid(), owner_id)
);
DROP FUNCTION public.leave_visible_unit_owners();
COMMIT;
