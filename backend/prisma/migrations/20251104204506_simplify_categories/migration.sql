-- Simplificar categorias para corresponder ao frontend
-- Mapear categorias verbosas para categorias simples

UPDATE "Product" SET category = 'Cachorro' WHERE category LIKE '%Cães%';
UPDATE "Product" SET category = 'Gato' WHERE category LIKE '%Gatos%';
UPDATE "Product" SET category = 'Aves' WHERE category LIKE '%Pássaros%';
UPDATE "Product" SET category = 'Farmácia' WHERE category LIKE '%Medicamentos%' OR category LIKE '%Suplementos%';

-- Produtos com "Petiscos e Snacks" - mapear baseado no nome
UPDATE "Product" SET category = 'Cachorro' WHERE category = 'Petiscos e Snacks' AND name LIKE '%Cães%';
UPDATE "Product" SET category = 'Gato' WHERE category = 'Petiscos e Snacks' AND name LIKE '%Gatos%';

-- Categorias genéricas que não se encaixam nas categorias simples do frontend
UPDATE "Product" SET category = NULL WHERE category IN (
  'Acessórios',
  'Higiene e Limpeza',
  'Casas e Camas',
  'Comedouros e Bebedouros',
  'Roupas para Pets',
  'Acessórios para Aquários',
  'Acessórios para Roedores',
  'Petiscos e Snacks'
);
