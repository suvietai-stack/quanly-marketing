begin;
-- Dashboard reads never alter the permission resolver or create organizational grants.
create or replace function private.dashboard_unit_allowed(_rules jsonb,_roots text[],_unit text)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.org_units where id=_unit and active)
 and not exists(select 1 from jsonb_array_elements(_rules) r where r->>'permission' in ('overview.all_dept','report.view') and r->>'effect'='DENY' and (nullif(r->>'unit_id','') is null or private.org_contains(r->>'unit_id',_unit)))
 and exists(select 1 from jsonb_array_elements(_rules) r where r->>'permission' in ('overview.all_dept','report.view') and r->>'effect'='ALLOW' and coalesce(r->>'scope','native')<>'own'
 and case when nullif(r->>'unit_id','') is not null then private.org_contains(r->>'unit_id',_unit)
 when r->>'permission'='overview.all_dept' then true
 else exists(select 1 from unnest(_roots) root where private.org_contains(root,_unit)) end);
$$;
revoke all on function private.dashboard_unit_allowed(jsonb,text[],text) from public,anon,authenticated;
create or replace function public.dashboard_scope_context() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare u uuid:=auth.uid();rules jsonb;roots text[];units jsonb;people jsonb;k3_ boolean;biz_ boolean;sig_ boolean;super_ boolean;
begin
 if not public.community_active() then raise exception 'Chỉ tài khoản đang hoạt động được xem Dashboard.';end if;
 super_:=private.is_super_admin(u);
 rules:=private.base_rules(u,private.base_config());
 select coalesce(array_agg(distinct a.unit_id),'{}') into roots from public.org_assignments a join public.org_titles t on t.id=a.title_id and t.active and t.kind='manager' join public.org_units n on n.id=a.unit_id and n.active
 where a.user_id=u and a.status<>'cancelled' and (a.starts_at is null or a.starts_at<=now()) and (a.ends_at is null or a.ends_at>now());
 select coalesce(jsonb_agg(jsonb_build_object('id',n.id,'name',n.name,'parent_id',n.parent_id) order by n.name),'[]') into units from public.org_units n where n.active and (super_ or private.dashboard_unit_allowed(rules,roots,n.id));
 select coalesce(jsonb_agg(x order by x->>'name'),'[]') into people from (
  select jsonb_build_object('id',p.id,'name',p.full_name,'units',jsonb_agg(distinct a.unit_id)) x
  from public.profiles p join public.org_assignments a on a.user_id=p.id and a.status<>'cancelled' and (a.starts_at is null or a.starts_at<=now()) and (a.ends_at is null or a.ends_at>now())
  where p.status::text='Đang hoạt động' and exists(select 1 from jsonb_array_elements(units) n where n->>'id'=a.unit_id) group by p.id,p.full_name
 )s;
 k3_:=coalesce((select enabled from public.k3_settings where id=true),false) and public.k3_can(u,'k3.view_scope');
 biz_:=public.biz_can(u,'biz.view_dept') or public.biz_can(u,'biz.view_all');
 sig_:=private.sig_can(u,'signal.report') or private.sig_can(u,'signal.manage');
 return jsonb_build_object('userId',u,'asOf',now(),'identity',jsonb_build_object('name',(select full_name from public.profiles where id=u),'placements',(
 select coalesce(jsonb_agg(distinct jsonb_build_object('unit',n.name,'title',coalesce(t.name,'Chưa gán chức danh'))),'[]') from public.org_assignments a join public.org_units n on n.id=a.unit_id and n.active left join public.org_titles t on t.id=a.title_id and t.active
 where a.user_id=u and a.status<>'cancelled' and (a.starts_at is null or a.starts_at<=now()) and (a.ends_at is null or a.ends_at>now()) and (a.title_id is null or t.id is not null))),
 'units',units,'people',people,'capabilities',jsonb_build_object('work',jsonb_array_length(units)>0,'k3',k3_,'business',biz_,'signals',sig_),
 'canUseBusiness',public.biz_can(u,'biz.view_own') or biz_,
 'canManage',jsonb_array_length(units)>0 or k3_ or biz_ or sig_);
end $$;
revoke all on function public.dashboard_scope_context() from public,anon;
grant execute on function public.dashboard_scope_context() to authenticated;
commit;
