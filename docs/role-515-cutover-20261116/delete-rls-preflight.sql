-- READ ONLY: inspect broad/guarded RLS before applying role-515-delete-rls-candidate.sql
SELECT tablename,cmd,policyname,permissive,roles,qual,with_check
FROM pg_policies
WHERE schemaname='public' AND tablename IN ('brands','map_posts','social_posts','socials','tasks','videos','web_contents','web_topics','websites')
ORDER BY tablename,cmd,policyname;
