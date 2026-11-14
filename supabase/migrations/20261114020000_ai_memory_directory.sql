begin;
-- Basic company directory is separate from org editing, HR data and effective permissions.
create or replace function public.ai_sv_directory() returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if not public.community_active() then raise exception 'Chỉ nhân viên đang hoạt động được xem danh bạ.'; end if;
 return jsonb_build_object('viewer',auth.uid(),'as_of',now(),
 'units',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'parent_id',parent_id,'name',name,'kind',kind) order by name),'[]') from public.org_units where active),
 'titles',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'unit_id',unit_id,'name',name,'kind',kind) order by name),'[]') from public.org_titles where active),
 'people',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',full_name) order by full_name),'[]') from public.profiles where status::text='Đang hoạt động'),
 'assignments',(select coalesce(jsonb_agg(jsonb_build_object('user_id',a.user_id,'unit_id',a.unit_id,'title_id',a.title_id,'category',a.category,'position',s.name) order by a.id),'[]')
 from public.org_assignments a join public.org_units u on u.id=a.unit_id and u.active
 join public.profiles p on p.id=a.user_id and p.status::text='Đang hoạt động'
 left join public.org_titles t on t.id=a.title_id
 left join public.org_position_slots s on s.id=a.slot_id and s.active
 where a.status<>'cancelled' and (a.starts_at is null or a.starts_at<=now()) and (a.ends_at is null or a.ends_at>now()) and (a.title_id is null or t.active)));
end $$;
revoke all on function public.ai_sv_directory() from public,anon;
grant execute on function public.ai_sv_directory() to authenticated;

create table if not exists public.ai_sv_memory_state(user_id uuid primary key references auth.users(id) on delete cascade,revision bigint not null default 0);
create table if not exists public.ai_sv_memories(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
 key text not null check(length(key) between 1 and 80),content text not null check(length(content) between 1 and 600),
 origin text not null check(origin in ('auto','manual')),updated_at timestamptz not null default now(),unique(user_id,key));
create table if not exists public.ai_sv_chat_turns(
 id uuid primary key,user_id uuid not null references auth.users(id) on delete cascade,
 scope text not null check(length(scope) between 1 and 100),question text not null check(length(question) between 1 and 900),
 answer text,mode text,sources jsonb not null default '[]',revision bigint not null,
 created_at timestamptz not null default now(),completed_at timestamptz,
 search tsvector generated always as (to_tsvector('simple',question)) stored);
create index if not exists ai_sv_chat_owner_recent on public.ai_sv_chat_turns(user_id,created_at desc,id);
create index if not exists ai_sv_chat_search on public.ai_sv_chat_turns using gin(search);
alter table public.ai_sv_memory_state enable row level security;
alter table public.ai_sv_memories enable row level security;
alter table public.ai_sv_chat_turns enable row level security;
drop policy if exists ai_memory_state_own on public.ai_sv_memory_state;
create policy ai_memory_state_own on public.ai_sv_memory_state for select to authenticated using(user_id=(select auth.uid()) and (select public.community_active()));
drop policy if exists ai_memories_own on public.ai_sv_memories;
create policy ai_memories_own on public.ai_sv_memories for select to authenticated using(user_id=(select auth.uid()) and (select public.community_active()));
drop policy if exists ai_chat_own on public.ai_sv_chat_turns;
create policy ai_chat_own on public.ai_sv_chat_turns for select to authenticated using(user_id=(select auth.uid()) and (select public.community_active()));
revoke all on public.ai_sv_memory_state,public.ai_sv_memories,public.ai_sv_chat_turns from public,anon,authenticated;
grant select on public.ai_sv_memory_state,public.ai_sv_memories,public.ai_sv_chat_turns to authenticated;

create or replace function public.ai_sv_chat_begin(_id uuid,_scope text,_question text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v bigint;r public.ai_sv_chat_turns;
begin
 if not public.community_active() then raise exception 'Vui lòng đăng nhập tài khoản đang hoạt động.';end if;
 if length(_scope) not between 1 and 100 or length(trim(_question)) not between 1 and 900 then raise exception 'Câu hỏi không hợp lệ.';end if;
 insert into public.ai_sv_memory_state(user_id) values(auth.uid()) on conflict do nothing;
 select revision into v from public.ai_sv_memory_state where user_id=auth.uid() for update;
 select * into r from public.ai_sv_chat_turns where id=_id;
 if found then
  if r.user_id<>auth.uid() or r.scope<>_scope or r.question<>trim(_question) then raise exception 'Yêu cầu không hợp lệ.';end if;
  return jsonb_build_object('turn',to_jsonb(r),'created',false);
 end if;
 if (select count(*) from public.ai_sv_chat_turns where user_id=auth.uid() and created_at>now()-interval '1 hour')>=100 then raise exception 'Bạn đã đạt giới hạn lưu câu hỏi trong giờ này.';end if;
 insert into public.ai_sv_chat_turns(id,user_id,scope,question,revision) values(_id,auth.uid(),_scope,trim(_question),v) returning * into r;
 return jsonb_build_object('turn',to_jsonb(r),'created',true);
end $$;

create or replace function public.ai_sv_chat_finish(_id uuid,_answer text,_mode text,_sources jsonb,_memories jsonb default '[]') returns boolean
language plpgsql security definer set search_path='' as $$
declare r public.ai_sv_chat_turns;v bigint;x jsonb;
begin
 if not public.community_active() then raise exception 'Vui lòng đăng nhập tài khoản đang hoạt động.';end if;
 select revision into v from public.ai_sv_memory_state where user_id=auth.uid() for update;
 select * into r from public.ai_sv_chat_turns where id=_id and user_id=auth.uid() for update;
 if not found then return false;end if;
 if r.completed_at is not null then return true;end if;
 if length(_answer) not between 1 and 5500 or _mode not in ('ai','guide','unconfigured') or jsonb_typeof(_sources)<>'array' or pg_column_size(_sources)>30000 or jsonb_typeof(_memories)<>'array' then raise exception 'Phản hồi không hợp lệ.';end if;
 update public.ai_sv_chat_turns set answer=_answer,mode=_mode,sources=_sources,completed_at=now() where id=_id;
 if v=r.revision then
  for x in select value from jsonb_array_elements(_memories) limit 3 loop
   if length(x->>'key') between 1 and 80 and length(x->>'content') between 1 and 600 then
    insert into public.ai_sv_memories(user_id,key,content,origin)
    select auth.uid(),x->>'key',x->>'content','auto' where (select count(*) from public.ai_sv_memories where user_id=auth.uid())<60 or exists(select 1 from public.ai_sv_memories where user_id=auth.uid() and key=x->>'key')
    on conflict(user_id,key) do update set content=excluded.content,updated_at=now() where public.ai_sv_memories.origin='auto';
   end if;
  end loop;
 end if;
 return true;
end $$;

create or replace function public.ai_sv_recall(_question text default '',_scope text default 'general') returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare q tsquery;terms text;
begin
 if not public.community_active() then raise exception 'Vui lòng đăng nhập tài khoản đang hoạt động.';end if;
 select string_agg(quote_literal(t),' | ') into terms from (select distinct t from unnest(regexp_split_to_array(left(_question,900),'[^[:alnum:]À-ỹ]+')) t where length(t)>2 limit 12)s;
 q:=case when terms is not null then to_tsquery('simple',terms) end;
 return jsonb_build_object(
 'memories',(select coalesce(jsonb_agg(to_jsonb(m)),'[]') from (select id,key,content,origin,updated_at from public.ai_sv_memories where user_id=auth.uid() order by updated_at desc limit 60)m),
 -- Only employee-authored text enters recall. Old assistant business facts must be read again under live RLS.
 'recent',(select coalesce(jsonb_agg(to_jsonb(c)),'[]') from (select question,created_at from public.ai_sv_chat_turns where user_id=auth.uid() and scope=_scope and completed_at is not null order by created_at desc,id desc limit 8)c),
 'relevant',(select coalesce(jsonb_agg(to_jsonb(c)),'[]') from (select question,created_at from public.ai_sv_chat_turns where user_id=auth.uid() and completed_at is not null and q is not null and search@@q order by ts_rank(search,q) desc,created_at desc limit 6)c));
end $$;

create or replace function public.ai_sv_memory_edit(_id uuid,_content text) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not public.community_active() then raise exception 'Vui lòng đăng nhập tài khoản đang hoạt động.';end if;
 if length(trim(_content)) not between 1 and 600 then raise exception 'Ký ức cần từ 1 đến 600 ký tự.';end if;
 perform 1 from public.ai_sv_memory_state where user_id=auth.uid() for update;
 update public.ai_sv_memories set content=trim(_content),origin='manual',updated_at=now() where id=_id and user_id=auth.uid();
 if not found then raise exception 'Không tìm thấy ký ức của bạn.';end if;
 update public.ai_sv_memory_state set revision=revision+1 where user_id=auth.uid();
end $$;
create or replace function public.ai_sv_memory_forget(_id uuid default null) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not public.community_active() then raise exception 'Vui lòng đăng nhập tài khoản đang hoạt động.';end if;
 insert into public.ai_sv_memory_state(user_id) values(auth.uid()) on conflict do nothing;
 perform 1 from public.ai_sv_memory_state where user_id=auth.uid() for update;
 if _id is null then
  delete from public.ai_sv_memories where user_id=auth.uid();
  delete from public.ai_sv_chat_turns where user_id=auth.uid();
 else
  delete from public.ai_sv_memories where user_id=auth.uid() and id=_id;
  -- Remove original turns too: retrieval must not resurrect a forgotten personal fact.
  delete from public.ai_sv_chat_turns where user_id=auth.uid();
 end if;
 update public.ai_sv_memory_state set revision=revision+1 where user_id=auth.uid();
end $$;
revoke all on function public.ai_sv_chat_begin(uuid,text,text),public.ai_sv_chat_finish(uuid,text,text,jsonb,jsonb),public.ai_sv_recall(text,text),public.ai_sv_memory_edit(uuid,text),public.ai_sv_memory_forget(uuid) from public,anon;
grant execute on function public.ai_sv_chat_begin(uuid,text,text),public.ai_sv_chat_finish(uuid,text,text,jsonb,jsonb),public.ai_sv_recall(text,text),public.ai_sv_memory_edit(uuid,text),public.ai_sv_memory_forget(uuid) to authenticated;
commit;
