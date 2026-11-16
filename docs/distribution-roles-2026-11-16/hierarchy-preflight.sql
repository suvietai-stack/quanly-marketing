-- READ ONLY. No migration/reparent/trigger changes. Inspect prospective impact.
WITH RECURSIVE branch AS (
 SELECT id,parent_id,kind,name,source,0 depth FROM public.org_units
 WHERE id='3df93c75-8a46-4c2f-bc09-7583aa672b52'
 UNION ALL SELECT u.id,u.parent_id,u.kind,u.name,u.source,b.depth+1
 FROM public.org_units u JOIN branch b ON u.parent_id=b.id WHERE b.depth<32
) SELECT * FROM branch ORDER BY depth,id;
SELECT id,unit_id,title_id,role_id FROM public.org_position_slots
WHERE unit_id IN ('3df93c75-8a46-4c2f-bc09-7583aa672b52','cef13ee0-73a8-43c4-bfe5-6bef393248fc');
SELECT revision,effective_from,applied_block_ids FROM public.k3hub_policy_versions ORDER BY revision;
-- Before a separately approved live cutover: capture private canonical/Biz/CRM
-- mappings and full function definitions; preserve org_parent_history and as-of
-- report attribution. Do not change kind/parent before replacing the source guard
-- through an audited transfer API and proving policy and scope parity.