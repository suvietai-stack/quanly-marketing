begin;
create or replace function public.ai_sv_key_save(_key text) returns void language plpgsql security definer set search_path='' as $$
declare sid uuid;
begin
 if not public.community_moderator() then raise exception 'Chỉ Super Admin được thay khóa AI.' using errcode='42501';end if;
 if length(trim(_key)) not between 20 and 500 or trim(_key) not like 'sk-%' or trim(_key) ~ '[[:space:]]' then raise exception 'Định dạng API Key không hợp lệ.';end if;
 perform pg_advisory_xact_lock(hashtext('suviet-openai-key'));
 select id into sid from vault.secrets where name='suviet_openai_key';
 if sid is null then perform vault.create_secret(trim(_key),'suviet_openai_key','AI Sứ Việt OpenAI credential');
 else perform vault.update_secret(sid,trim(_key),'suviet_openai_key','AI Sứ Việt OpenAI credential');end if;
end $$;
revoke all on function public.ai_sv_key_save(text) from public,anon;
grant execute on function public.ai_sv_key_save(text) to authenticated;
create or replace function public.ai_sv_key_server_read() returns text language sql stable security definer set search_path='' as $$
 select decrypted_secret from vault.decrypted_secrets where name='suviet_openai_key' limit 1
$$;
revoke all on function public.ai_sv_key_server_read() from public,anon,authenticated;
grant execute on function public.ai_sv_key_server_read() to service_role;
commit;
