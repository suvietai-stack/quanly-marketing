-- AI Sứ Việt knowledge base: file provenance and company visibility are
-- explicit. Uploads start admin-only until consciously shared with staff.
CREATE TABLE IF NOT EXISTS public.ai_sv_documents (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 title text NOT NULL CHECK(char_length(btrim(title)) BETWEEN 2 AND 180),
 original_name text NOT NULL CHECK(char_length(original_name) BETWEEN 1 AND 200),
 mime_type text NOT NULL,
 storage_path text NOT NULL UNIQUE,
 content text NOT NULL DEFAULT '' CHECK(char_length(content)<=160000),
 visibility text NOT NULL DEFAULT 'admin' CHECK(visibility IN ('admin','company')),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','ready','failed')),
 uploaded_by uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 indexed_at timestamptz
);
CREATE INDEX IF NOT EXISTS ai_sv_documents_ready_idx ON public.ai_sv_documents(status,visibility,updated_at DESC);
ALTER TABLE public.ai_sv_documents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_sv_documents FROM PUBLIC,anon,authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_sv_documents TO authenticated;
CREATE POLICY ai_sv_docs_read ON public.ai_sv_documents FOR SELECT TO authenticated
 USING(public.community_active() AND (public.community_moderator() OR (visibility='company' AND status='ready')));
CREATE POLICY ai_sv_docs_create ON public.ai_sv_documents FOR INSERT TO authenticated
 WITH CHECK(public.community_moderator() AND uploaded_by=auth.uid());
CREATE POLICY ai_sv_docs_update ON public.ai_sv_documents FOR UPDATE TO authenticated
 USING(public.community_moderator()) WITH CHECK(public.community_moderator());
CREATE POLICY ai_sv_docs_delete ON public.ai_sv_documents FOR DELETE TO authenticated
 USING(public.community_moderator());

INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES ('suviet-ai-knowledge','suviet-ai-knowledge',false,6291456,
 ARRAY['text/plain','text/markdown','text/csv','application/pdf',
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 'application/vnd.ms-excel'])
ON CONFLICT(id) DO UPDATE SET public=false, file_size_limit=6291456,
 allowed_mime_types=EXCLUDED.allowed_mime_types;
-- Raw uploaded files are visible ONLY to administrators, never all staff.
CREATE POLICY ai_sv_storage_read ON storage.objects FOR SELECT TO authenticated
 USING(bucket_id='suviet-ai-knowledge' AND public.community_moderator());
CREATE POLICY ai_sv_storage_create ON storage.objects FOR INSERT TO authenticated
 WITH CHECK(bucket_id='suviet-ai-knowledge' AND public.community_moderator()
  AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY ai_sv_storage_remove ON storage.objects FOR DELETE TO authenticated
 USING(bucket_id='suviet-ai-knowledge' AND public.community_moderator());

-- RLS-first search: SECURITY INVOKER deliberately inherits every source table's
-- current SELECT rules. No service role, no raw salary, chats or bank details.
CREATE OR REPLACE FUNCTION public.ai_sv_base_search(p_query text DEFAULT '', p_category text DEFAULT 'all', p_limit int DEFAULT 25)
RETURNS TABLE(source_type text, record_id text, title text, summary text, source_url text, last_updated timestamptz)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=''
AS $$
WITH p AS (
 SELECT left(btrim(coalesce(p_query,'')),140) q,
        least(40,greatest(1,coalesce(p_limit,25))) lim,
        coalesce(p_category,'all') category
), matches AS (
 SELECT 'design_job'::text AS source_type, o.id::text AS record_id,
  left(coalesce(o.data->>'title','Job thiết kế'),160) AS title,
  left(concat('Trạng thái: ',coalesce(o.data->>'status','—'),
    '; Người yêu cầu: ',coalesce(o.data->>'requester','—'),
    '; Phụ trách: ',coalesce(o.data->>'assignee','Chưa phân công'),
    '; Deadline: ',coalesce(o.data->>'deadline','—')),350) AS summary,
  '/orders'::text AS source_url,o.updated_at AS last_updated
 FROM public.orders o, p WHERE p.category IN ('all','design_job')
  AND (p.q='' OR coalesce(o.data->>'title','') ILIKE '%'||p.q||'%'
    OR o.id ILIKE '%'||p.q||'%' OR coalesce(o.data->>'assignee','') ILIKE '%'||p.q||'%')
 UNION ALL
 SELECT 'task',t.id::text,left(coalesce(t.data->>'title',t.data->>'name','Công việc'),160),
   left(concat('Trạng thái: ',coalesce(t.data->>'status','—'),
     '; Hạn: ',coalesce(t.data->>'deadline','—')),350),
   '/tasks',t.updated_at
 FROM public.tasks t,p WHERE p.category IN ('all','task')
  AND (p.q='' OR coalesce(t.data->>'title',t.data->>'name','') ILIKE '%'||p.q||'%' OR t.id ILIKE '%'||p.q||'%')
 UNION ALL
 SELECT 'web_content',w.id::text,left(coalesce(w.data->>'title','Content Web'),160),
   left(concat('Trạng thái: ',coalesce(w.data->>'status','—'),
     '; Người phụ trách: ',coalesce(w.data->>'assignee','—')),350),
   '/web-contents',w.updated_at
 FROM public.web_contents w,p WHERE p.category IN ('all','web_content')
  AND (p.q='' OR coalesce(w.data->>'title','') ILIKE '%'||p.q||'%' OR w.id ILIKE '%'||p.q||'%')
 UNION ALL
 SELECT 'signal',s.id::text,left(coalesce(s.customer_name,'Tín hiệu'),160),
   left(concat('Trạng thái: ',coalesce(s.status,'—'),
     '; Nguồn: ',coalesce(s.source,'—'),
     '; Theo dõi tiếp: ',coalesce(s.next_contact_on::text,'—')),350),
   '/signals?open='||s.id::text,s.updated_at
 FROM public.opportunity_signals s,p WHERE p.category IN ('all','signal')
  AND s.cancelled_at IS NULL
  AND (p.q='' OR coalesce(s.customer_name,'') ILIKE '%'||p.q||'%'
   OR s.id::text ILIKE '%'||p.q||'%')
 UNION ALL
 SELECT 'quote',q.id::text,left(coalesce(q.title,q.code,'Hỏi giá'),160),
   left(concat('Mã: ',coalesce(q.code,'—'),'; Trạng thái: ',coalesce(q.status,'—'),
     '; Ngày giao: ',coalesce(q.delivery_date::text,'—')),350),
   '/order-quotes/'||q.id::text,q.updated_at
 FROM public.oq_requests q,p WHERE p.category IN ('all','quote')
  AND (p.q='' OR coalesce(q.title,'') ILIKE '%'||p.q||'%' OR coalesce(q.code,'') ILIKE '%'||p.q||'%')
 UNION ALL
 SELECT 'delivery_order',o.id::text,left(coalesce(o.title,o.code,'Đơn hàng'),160),
   left(concat('Mã: ',coalesce(o.code,'—'),'; Trạng thái: ',coalesce(o.status,'—'),
     '; Hạn giao: ',coalesce(o.due_date::text,'—')),350),
   '/order-tracking/'||o.id::text,o.updated_at
 FROM public.ot_orders o,p WHERE p.category IN ('all','delivery_order')
  AND (p.q='' OR coalesce(o.title,'') ILIKE '%'||p.q||'%' OR coalesce(o.code,'') ILIKE '%'||p.q||'%')
 UNION ALL
 SELECT '3k_task',k.id::text,left(k.name,160),
   left(concat('Trạng thái: ',coalesce(k.status,'—'),'; Ngày: ',k.work_date::text,
     '; Tiến độ: ',coalesce(k.progress::text,'—')),350),
   '/biz/3k',k.updated_at
 FROM public.k3_tasks k,p WHERE p.category IN ('all','3k_task')
  AND k.deleted_at IS NULL AND (p.q='' OR k.name ILIKE '%'||p.q||'%')
 UNION ALL
 SELECT 'biz_document',b.id::text,left(concat('Báo cáo/Kế hoạch ',coalesce(b.department_name,''),
  ' ',coalesce(b.year::text,''),'/',coalesce(b.period::text,'')),160),
  left(concat('Loại: ',b.kind,'; Kỳ: ',b.period_kind,
    '; Hạn: ',coalesce(b.deadline::date::text,'—')),350),
  '/biz/reports',b.created_at
 FROM public.biz_documents b,p WHERE p.category IN ('all','biz_document')
  AND (p.q='' OR coalesce(b.department_name,'') ILIKE '%'||p.q||'%'
    OR coalesce(b.kind,'') ILIKE '%'||p.q||'%')
)
SELECT m.* FROM matches m ORDER BY m.last_updated DESC NULLS LAST
 LIMIT (SELECT lim FROM p)
$$;
REVOKE ALL ON FUNCTION public.ai_sv_base_search(text,text,int) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.ai_sv_base_search(text,text,int) TO authenticated;

-- Search only the document text the caller is allowed to see.
-- Return a small excerpt, never send the entire private file to a model.
CREATE OR REPLACE FUNCTION public.ai_sv_knowledge_search(p_query text DEFAULT '',p_limit int DEFAULT 6)
RETURNS TABLE(id uuid,title text,excerpt text,updated_at timestamptz)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=''
AS $$
 SELECT d.id,d.title,
  substring(d.content FROM greatest(1,CASE
    WHEN p_query IS NULL OR btrim(p_query)='' THEN 1
    ELSE position(lower(left(btrim(p_query),80)) IN lower(d.content))-200 END) FOR 1600),
  d.updated_at
 FROM public.ai_sv_documents d
 WHERE d.status='ready' AND (
   p_query IS NULL OR btrim(p_query)='' OR
   d.title ILIKE '%'||left(btrim(p_query),80)||'%' OR
   d.content ILIKE '%'||left(btrim(p_query),80)||'%')
 ORDER BY (CASE WHEN d.title ILIKE '%'||left(btrim(coalesce(p_query,'')),80)||'%' THEN 0 ELSE 1 END),
 d.updated_at DESC
 LIMIT least(12,greatest(1,coalesce(p_limit,6)));
$$;
REVOKE ALL ON FUNCTION public.ai_sv_knowledge_search(text,int) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.ai_sv_knowledge_search(text,int) TO authenticated;
