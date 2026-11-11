-- DRY RUN ONLY (read-only): mapping (unit,title)->role built from current active slots.
SELECT s.unit_id, s.title_id, min(s.role_id) role_id, count(*) slots_merged,
       count(DISTINCT s.role_id) roles_conflict,
       count(a.id) FILTER (WHERE a.status='active' AND (a.ends_at IS NULL OR a.ends_at>now())) current_people
FROM org_position_slots s LEFT JOIN org_assignments a ON a.slot_id=s.id
WHERE s.active GROUP BY 1,2 ORDER BY 1,2;
