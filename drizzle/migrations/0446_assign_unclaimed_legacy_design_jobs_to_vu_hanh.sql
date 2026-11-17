-- One-time legacy recovery requested by administrator:
-- Open Design jobs which were created without a designer receive Vũ Hạnh.
-- For a requester/reviewer that is Vũ Hạnh herself, the canonical Design Head
-- Nguyễn Thị Thương is assigned as reviewer to preserve 4-eyes approval.
-- No already assigned, completed or cancelled job is changed. Append history.
DO $$
DECLARE designer uuid:='160258ce-d6d3-4780-80e1-e9ead132465f';
        head uuid:='5b6906b8-3022-48fd-8551-458efdd198a5';
        ts text:=to_char(now() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
        changed integer;
BEGIN
  IF NOT EXISTS(
    SELECT 1 FROM public.profiles p
    WHERE p.id=designer AND p.full_name='Vũ Hạnh' AND p.status='Đang hoạt động'
       AND private.design_team_member(p.id)
       AND public.design_can(p.id,'marketing_design','take')
       AND public.design_can(p.id,'order_mockup','take')
       AND public.design_can(p.id,'photo','take')
  ) THEN RAISE EXCEPTION 'Vũ Hạnh is not an active eligible designer; migration cancelled'; END IF;
  IF NOT EXISTS(
    SELECT 1 FROM public.profiles p WHERE p.id=head
      AND p.full_name='Nguyễn Thị Thương' AND p.status='Đang hoạt động'
      AND public.design_can(p.id,'marketing_design','approve')
      AND public.design_can(p.id,'order_mockup','approve')
      AND public.design_can(p.id,'photo','approve')
  ) THEN RAISE EXCEPTION 'Design Head cannot review assigned work; migration cancelled'; END IF;

  UPDATE public.orders o SET
    data = o.data ||
      jsonb_build_object(
        'assignee','Vũ Hạnh',
        'assigneeId',designer::text,
        'assignedBy','Hệ thống (yêu cầu quản trị chuẩn hóa Job cũ)',
        'assignedAt',ts,
        'status','Chờ nhận việc',
        'reviewer',CASE WHEN coalesce(nullif(o.data->>'reviewer',''),o.data->>'requester')='Vũ Hạnh'
          THEN 'Nguyễn Thị Thương'
          ELSE coalesce(nullif(o.data->>'reviewer',''),o.data->>'requester','') END
      ) ||
      jsonb_build_object('history',
        coalesce(o.data->'history','[]'::jsonb) || jsonb_build_array(
          jsonb_build_object(
            'at',ts,'byName','Hệ thống Sứ Việt',
            'action','Bổ sung người thực hiện cho Job cũ theo yêu cầu quản trị',
            'fromStatus',o.data->>'status',
            'toStatus','Chờ nhận việc',
            'note',CASE WHEN coalesce(nullif(o.data->>'reviewer',''),o.data->>'requester')='Vũ Hạnh'
              THEN 'Giao Vũ Hạnh thực hiện; chuyển người duyệt sang Nguyễn Thị Thương để tránh tự duyệt.'
              ELSE 'Giao Vũ Hạnh thực hiện; giữ nguyên người duyệt.' END
          )
        ))
  WHERE o.workflow_kind IN ('photo','marketing_design','order_mockup')
    AND o.data->>'status' IN ('Cần giao người','Chờ phân công','Mới tạo')
    AND coalesce(o.data->>'assignee','')=''
    AND coalesce(o.data->>'assigneeId','')='';
  GET DIAGNOSTICS changed = ROW_COUNT;
  RAISE NOTICE 'Recovered % legacy unassigned Design jobs',changed;
END
$$;
