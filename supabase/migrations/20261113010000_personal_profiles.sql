-- Personal information is separate from authoritative employment and access records.
create table public.personal_profiles (
 user_id uuid primary key default auth.uid() references public.profiles(id) on delete cascade,
 details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object' and octet_length(details::text) <= 20000),
 avatar text not null default '' check (octet_length(avatar) <= 300000 and (avatar = '' or avatar ~ '^data:image/jpeg;base64,[A-Za-z0-9+/=]+$'))
);
alter table public.personal_profiles enable row level security;
revoke all on public.personal_profiles from anon, authenticated;
grant select, insert, update on public.personal_profiles to authenticated;
create policy personal_profiles_owner on public.personal_profiles for all to authenticated
 using (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.status = 'Đang hoạt động'))
 with check (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.status = 'Đang hoạt động'));
