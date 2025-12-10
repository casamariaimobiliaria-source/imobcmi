-- Fix Unique Constraints for Multi-tenancy

-- Developers: Scope CNPJ uniqueness to organization
ALTER TABLE developers DROP CONSTRAINT IF EXISTS developers_cnpj_key;
ALTER TABLE developers ADD CONSTRAINT developers_organization_id_cnpj_key UNIQUE (organization_id, cnpj);

-- Agents: Scope CPF uniqueness to organization
ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_cpf_key;
ALTER TABLE agents ADD CONSTRAINT agents_organization_id_cpf_key UNIQUE (organization_id, cpf);
