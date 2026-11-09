CREATE POLICY fr_att_insert ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'fr-attachments' AND private.is_active(auth.uid()) AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY fr_att_read ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'fr-attachments' AND (
  (storage.foldername(name))[1] = auth.uid()::text
  OR EXISTS (
    SELECT 1 FROM public.fr_requests r
    WHERE r.id::text = (storage.foldername(name))[2] AND private.fr_can_view(auth.uid(), r.id)
  )
));

CREATE POLICY fr_att_delete ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'fr-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);