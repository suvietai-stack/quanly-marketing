CREATE TABLE public.bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text NOT NULL CHECK (length(trim(bank_name)) > 0),
  account_number text NOT NULL UNIQUE CHECK (account_number ~ '^[0-9]{4,30}$'),
  label text,
  account_type text NOT NULL DEFAULT 'personal' CHECK (account_type IN ('personal','household','company')),
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.bank_accounts TO authenticated;
GRANT ALL ON public.bank_accounts TO service_role;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY bank_acc_select ON public.bank_accounts FOR SELECT TO authenticated USING (private.is_admin(auth.uid()));
CREATE POLICY bank_acc_insert ON public.bank_accounts FOR INSERT TO authenticated WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY bank_acc_update ON public.bank_accounts FOR UPDATE TO authenticated USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE TRIGGER bank_accounts_updated BEFORE UPDATE ON public.bank_accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER TABLE public.bank_transactions ADD COLUMN bank_account_id uuid REFERENCES public.bank_accounts(id);