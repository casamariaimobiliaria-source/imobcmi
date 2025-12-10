-- Seed default categories for all organizations that don't have them

DO $$
DECLARE
  org RECORD;
BEGIN
  FOR org IN SELECT id FROM organizations LOOP
    -- Income Categories
    INSERT INTO categories (name, type, organization_id)
    SELECT 'Receita Vendas', 'income', org.id
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Receita Vendas' AND organization_id = org.id);

    INSERT INTO categories (name, type, organization_id)
    SELECT 'Consultoria', 'income', org.id
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Consultoria' AND organization_id = org.id);

    INSERT INTO categories (name, type, organization_id)
    SELECT 'Outras Receitas', 'income', org.id
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Outras Receitas' AND organization_id = org.id);

    -- Expense Categories
    INSERT INTO categories (name, type, organization_id)
    SELECT 'Comissão', 'expense', org.id
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Comissão' AND organization_id = org.id);

    INSERT INTO categories (name, type, organization_id)
    SELECT 'Marketing', 'expense', org.id
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Marketing' AND organization_id = org.id);

    INSERT INTO categories (name, type, organization_id)
    SELECT 'Aluguel', 'expense', org.id
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Aluguel' AND organization_id = org.id);

    INSERT INTO categories (name, type, organization_id)
    SELECT 'Energia', 'expense', org.id
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Energia' AND organization_id = org.id);

    INSERT INTO categories (name, type, organization_id)
    SELECT 'Água', 'expense', org.id
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Água' AND organization_id = org.id);

    INSERT INTO categories (name, type, organization_id)
    SELECT 'Internet', 'expense', org.id
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Internet' AND organization_id = org.id);

    INSERT INTO categories (name, type, organization_id)
    SELECT 'Salários', 'expense', org.id
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Salários' AND organization_id = org.id);

    INSERT INTO categories (name, type, organization_id)
    SELECT 'Impostos', 'expense', org.id
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Impostos' AND organization_id = org.id);

    INSERT INTO categories (name, type, organization_id)
    SELECT 'Outras Despesas', 'expense', org.id
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Outras Despesas' AND organization_id = org.id);

  END LOOP;
END $$;
