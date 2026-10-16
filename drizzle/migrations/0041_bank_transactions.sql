CREATE TABLE public.bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'casso',
  provider_transaction_id text NOT NULL,
  bank_name text,
  bank_account_identifier text,
  transaction_date text,
  transaction_at timestamptz,
  amount bigint NOT NULL CHECK (amount > 0),
  description text,
  reference_number text,
  status text NOT NULL DEFAULT 'unclaimed',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bank_transactions_provider_uniq UNIQUE (provider, provider_transaction_id)
);
COMMENT ON COLUMN public.bank_transactions.transaction_date IS 'Raw transactionDateTime string exactly as sent by Casso (Vietnam local time)';
CREATE INDEX bank_transactions_at_idx ON public.bank_transactions (transaction_at DESC);
GRANT SELECT ON public.bank_transactions TO authenticated;
GRANT ALL ON public.bank_transactions TO service_role;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY bank_tx_select ON public.bank_transactions FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()) OR private.sig_can(auth.uid(), 'finance.incoming.view'));