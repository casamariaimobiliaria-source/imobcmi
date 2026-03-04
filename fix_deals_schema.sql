
-- SQL FIX para tabela de deals
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar colunas faltantes se necessário
DO $$ 
BEGIN 
    -- Verificar e adicionar lead_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='lead_id') THEN
        ALTER TABLE public.deals ADD COLUMN lead_id uuid REFERENCES public.leads(id);
        RAISE NOTICE 'Coluna lead_id adicionada.';
    END IF;

    -- Verificar e adicionar organization_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='organization_id') THEN
        ALTER TABLE public.deals ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
        RAISE NOTICE 'Coluna organization_id adicionada.';
    END IF;
END $$;

-- 2. Garantir que o RLS está habilitado
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- 3. Recriar políticas de segurança para garantir acesso correto (usando organization_id)
DROP POLICY IF EXISTS "Users can view deals from their organization" ON public.deals;
CREATE POLICY "Users can view deals from their organization" ON public.deals 
  FOR SELECT USING (auth.uid() IN (SELECT id FROM public.users WHERE organization_id = deals.organization_id));

DROP POLICY IF EXISTS "Users can insert deals in their organization" ON public.deals;
CREATE POLICY "Users can insert deals in their organization" ON public.deals 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update deals from their organization" ON public.deals;
CREATE POLICY "Users can update deals from their organization" ON public.deals 
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM public.users WHERE organization_id = deals.organization_id));

DROP POLICY IF EXISTS "Users can delete deals from their organization" ON public.deals;
CREATE POLICY "Users can delete deals from their organization" ON public.deals 
  FOR DELETE USING (auth.uid() IN (SELECT id FROM public.users WHERE organization_id = deals.organization_id));
