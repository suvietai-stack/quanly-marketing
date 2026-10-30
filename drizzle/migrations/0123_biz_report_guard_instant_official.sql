-- Guard "gắn mục tiêu trước khi nộp" phải bắt cả lượt nộp lần đầu chuyển thẳng sang approved (quy trình mới), không chỉ pending.
CREATE OR REPLACE FUNCTION public.biz_document_save_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d public.biz_documents; target uuid;
BEGIN
 SELECT * INTO d FROM public.biz_documents WHERE id=NEW.document_id;
 IF OLD.status='approved' THEN RAISE EXCEPTION 'Phiên bản đã duyệt không được sửa.'; END IF;
 IF d.kind='report' AND d.period_kind='month' AND NEW.status IN ('pending','approved') AND OLD.status IN ('draft','changes') AND OLD.target_version_id IS NULL THEN
  SELECT official_version_id INTO target FROM public.biz_annual_goals WHERE user_id=d.user_id AND year=d.year;
  IF target IS NOT NULL THEN RAISE EXCEPTION 'Mục tiêu đã được duyệt sau khi tạo bản nháp. Hãy gắn mục tiêu chính thức trước khi gửi.'; END IF;
 END IF;
 RETURN NEW;
END $$;