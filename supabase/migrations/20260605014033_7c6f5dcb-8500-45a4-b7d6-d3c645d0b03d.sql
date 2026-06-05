
-- 1) Tighten app_roles SELECT to admins only
DROP POLICY IF EXISTS "Authenticated can view roles" ON public.app_roles;

CREATE POLICY "Admins can view roles"
  ON public.app_roles
  FOR SELECT
  TO authenticated
  USING (private.is_admin(auth.uid()));

-- 2) Prevent privilege escalation via self-update on profiles
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
BEGIN
  -- Admins (including system admins) bypass these restrictions
  IF private.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF NEW.is_system_admin IS DISTINCT FROM OLD.is_system_admin THEN
    RAISE EXCEPTION 'Not allowed to modify is_system_admin';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Not allowed to modify status';
  END IF;
  IF NEW.must_change_password IS DISTINCT FROM OLD.must_change_password THEN
    RAISE EXCEPTION 'Not allowed to modify must_change_password';
  END IF;
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'Not allowed to modify email';
  END IF;
  IF NEW.phone IS DISTINCT FROM OLD.phone THEN
    RAISE EXCEPTION 'Not allowed to modify phone';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_privilege_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();
