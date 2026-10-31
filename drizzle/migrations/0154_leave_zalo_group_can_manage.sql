-- RPC kiểm tra quyền quản trị thông báo nhóm Nhân sự (SECURITY DEFINER, không mở quyền bảng).
CREATE OR REPLACE FUNCTION public.leave_zalo_group_can_manage()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT COALESCE(private.sig_can(auth.uid(), 'leave.settings'), false);
$$;

REVOKE ALL ON FUNCTION public.leave_zalo_group_can_manage() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.leave_zalo_group_can_manage() TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_zalo_group_can_manage() TO service_role;