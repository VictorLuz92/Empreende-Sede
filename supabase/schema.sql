-- =============================================================================
-- Empreende Sede - Schema PostgreSQL para Supabase
-- =============================================================================
-- Execute este script no SQL Editor do seu projeto Supabase.

-- Extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tabela de Usuários (Login por e-mail/senha ou OAuth Google/Microsoft)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    auth_provider VARCHAR(30) NOT NULL DEFAULT 'LOCAL',
    role VARCHAR(30) NOT NULL DEFAULT 'USER',
    avatar_url TEXT,
    subscription_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Garantir coluna em instalações existentes
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- -----------------------------------------------------------------------------
-- Tabela de Perfis de Usuários (integrada ou independente do Supabase Auth)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    avatar_url TEXT,
    role VARCHAR(30) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Tabela de Empresas
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    category VARCHAR(80) NOT NULL DEFAULT 'Geral',
    subsegment VARCHAR(80),
    logo_url TEXT,
    description TEXT NOT NULL,
    owner_name VARCHAR(120),
    cep VARCHAR(12),
    street VARCHAR(180),
    address_number VARCHAR(30),
    complement VARCHAR(120),
    neighborhood VARCHAR(120),
    city VARCHAR(120),
    state VARCHAR(10),
    address_status VARCHAR(40) NOT NULL DEFAULT 'CONFIRMED_BY_CEP',
    address_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
    phone VARCHAR(30) NOT NULL,
    whatsapp VARCHAR(30),
    instagram VARCHAR(120),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    owner_email VARCHAR(180),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'EXPIRED',
    pix_tx_id VARCHAR(120),
    pix_payer_note VARCHAR(255),
    pending_renewal BOOLEAN NOT NULL DEFAULT FALSE,
    subscription_expires_at TIMESTAMPTZ,
    has_pending_update BOOLEAN NOT NULL DEFAULT FALSE,
    pending_name VARCHAR(150),
    pending_category VARCHAR(80),
    pending_subsegment VARCHAR(80),
    pending_logo_url TEXT,
    pending_description TEXT,
    pending_owner_name VARCHAR(120),
    pending_cep VARCHAR(12),
    pending_street VARCHAR(180),
    pending_address_number VARCHAR(30),
    pending_complement VARCHAR(120),
    pending_neighborhood VARCHAR(120),
    pending_city VARCHAR(120),
    pending_state VARCHAR(10),
    pending_address_status VARCHAR(40),
    pending_phone VARCHAR(30),
    pending_whatsapp VARCHAR(30),
    pending_instagram VARCHAR(120),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Garantir colunas de proprietário e endereço em instalações existentes
ALTER TABLE companies ADD COLUMN IF NOT EXISTS owner_name VARCHAR(120);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS cep VARCHAR(12);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS street VARCHAR(180);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_number VARCHAR(30);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS complement VARCHAR(120);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(120);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS city VARCHAR(120);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS state VARCHAR(10);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_status VARCHAR(40) NOT NULL DEFAULT 'CONFIRMED_BY_CEP';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_confirmed BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS pending_owner_name VARCHAR(120);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS pending_cep VARCHAR(12);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS pending_street VARCHAR(180);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS pending_address_number VARCHAR(30);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS pending_complement VARCHAR(120);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS pending_neighborhood VARCHAR(120);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS pending_city VARCHAR(120);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS pending_state VARCHAR(10);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS pending_address_status VARCHAR(40);

-- Índices para acelerar a pesquisa de empresas
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_companies_category ON companies (LOWER(category));
CREATE INDEX IF NOT EXISTS idx_companies_subsegment ON companies (LOWER(subsegment));
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies (active);

-- -----------------------------------------------------------------------------
-- Row Level Security (RLS) - Boas práticas no Supabase
-- -----------------------------------------------------------------------------
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Leitura pública para empresas ativas, aprovadas e dentro da validade (ou isentas)
DROP POLICY IF EXISTS "Empresas ativas são públicas para leitura" ON companies;
CREATE POLICY "Empresas ativas são públicas para leitura"
    ON companies FOR SELECT
    USING (
        active = TRUE
        AND approved = TRUE
        AND (payment_status = 'EXEMPT' OR (subscription_expires_at IS NOT NULL AND subscription_expires_at > NOW()))
    );

-- =============================================================================
-- Dados iniciais (Seed) para testes
-- =============================================================================
INSERT INTO profiles (id, name, email, role)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Empreendedor Demo', 'contato@empreendesede.com.br', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

INSERT INTO companies (name, category, subsegment, logo_url, description, owner_name, cep, street, address_number, neighborhood, city, state, address_status, address_confirmed, phone, whatsapp, instagram, owner_id, approved, payment_status)
VALUES
    -- Mão de Obra (3 exemplos)
    (
        'Sede Manutenção & Reparos',
        'Mão de Obra',
        'Hidráulica',
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
        'Serviços elétricos, hidráulicos, montagem de móveis e pequenos reparos residenciais e comerciais com garantia.',
        'Carlos Eduardo Silva', '01310-100', 'Av. Paulista', '100', 'Bela Vista', 'São Paulo', 'SP', 'CONFIRMED_BY_CEP', TRUE,
        '(11) 91234-5678',
        '5511912345678',
        'sedemanutencao.oficial',
        '11111111-1111-1111-1111-111111111111',
        TRUE, 'EXEMPT'
    ),
    (
        'EletroForte Instalações',
        'Mão de Obra',
        'Elétrica',
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
        'Instalação de ar-condicionado, quadros elétricos, tomadas e iluminação LED com atendimento rápido em toda a cidade.',
        'Marcos Vinícius Souza', '01310-100', 'Av. Paulista', '210', 'Bela Vista', 'São Paulo', 'SP', 'CONFIRMED_BY_CEP', TRUE,
        '(11) 93456-7810',
        '5511934567810',
        'eletroforte.sede',
        '11111111-1111-1111-1111-111111111111',
        TRUE, 'EXEMPT'
    ),
    (
        'Marcenaria Tradição & Sob Medida',
        'Mão de Obra',
        'Marcenaria',
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
        'Móveis planejados, restauração em madeira maciça, portas e painéis ripados feitos sob medida para sua casa ou loja.',
        'José Roberto Almeida', '01310-100', 'Av. Paulista', '320', 'Bela Vista', 'São Paulo', 'SP', 'CONFIRMED_BY_CEP', TRUE,
        '(11) 94567-8912',
        '5511945678912',
        'marcenariatradicao',
        '11111111-1111-1111-1111-111111111111',
        TRUE, 'EXEMPT'
    ),
    -- Comércio (3 exemplos)
    (
        'Verde Vida Hortifrúti',
        'Comércio',
        'Hortifrúti',
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        'Produtos orgânicos frescos direto do produtor, cestas semanais por assinatura e entregas rápidas na região.',
        'Fernanda Oliveira', '01310-100', 'Av. Paulista', '410', 'Bela Vista', 'São Paulo', 'SP', 'CONFIRMED_BY_CEP', TRUE,
        '(11) 97766-5544',
        '5511977665544',
        'verdevida.organicos',
        '11111111-1111-1111-1111-111111111111',
        TRUE, 'EXEMPT'
    ),
    (
        'TechLocal Informática & Celulares',
        'Comércio',
        'Eletrônicos',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
        'Acessórios para celular, periféricos, notebooks e assistência técnica especializada com peças originais e garantia.',
        'Rafael Mendes', '01310-100', 'Av. Paulista', '515', 'Bela Vista', 'São Paulo', 'SP', 'CONFIRMED_BY_CEP', TRUE,
        '(11) 99123-4501',
        '5511991234501',
        'techlocal.sede',
        '11111111-1111-1111-1111-111111111111',
        TRUE, 'EXEMPT'
    ),
    (
        'Empório da Serra Mercearia',
        'Comércio',
        'Mercearia',
        'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
        'Queijos artesanais, cafés especiais, temperos naturais, bebidas e produtos coloniais selecionados diariamente.',
        'Antônio Costa', '01310-100', 'Av. Paulista', '605', 'Bela Vista', 'São Paulo', 'SP', 'CONFIRMED_BY_CEP', TRUE,
        '(11) 98234-5602',
        '5511982345602',
        'emporiodaserra.loja',
        '11111111-1111-1111-1111-111111111111',
        TRUE, 'EXEMPT'
    ),
    -- Gastronomia (4 exemplos)
    (
        'Café & Prosa Artesanal',
        'Gastronomia',
        'Padaria',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
        'Cafeteria especializada em grãos selecionados, pães de fermentação natural e um espaço acolhedor para reuniões e trabalho remoto.',
        'Juliana Martins', '01310-100', 'Av. Paulista', '710', 'Bela Vista', 'São Paulo', 'SP', 'CONFIRMED_BY_CEP', TRUE,
        '(11) 98765-4321',
        '5511987654321',
        'cafeprosa.artesanal',
        '11111111-1111-1111-1111-111111111111',
        TRUE, 'EXEMPT'
    ),
    (
        'Forno Nobre Pizzaria & Massas',
        'Gastronomia',
        'Pizzaria',
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
        'Pizzas artesanais assadas em forno a lenha com massa de longa fermentação, massas frescas e delivery próprio.',
        'Bruno Rossi', '01310-100', 'Av. Paulista', '820', 'Bela Vista', 'São Paulo', 'SP', 'CONFIRMED_BY_CEP', TRUE,
        '(11) 97345-6703',
        '5511973456703',
        'fornonobre.pizzas',
        '11111111-1111-1111-1111-111111111111',
        TRUE, 'EXEMPT'
    ),
    (
        'Lanchonete do Bairro',
        'Gastronomia',
        'Lanchonete',
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
        'X-salada artesanal, pastéis fritos na hora, sucos naturais e porções para toda a família.',
        'Diego Pereira', '01310-100', 'Av. Paulista', '890', 'Bela Vista', 'São Paulo', 'SP', 'CONFIRMED_BY_CEP', TRUE,
        '(11) 96123-4510',
        '5511961234510',
        'lanchonetedobairro.sede',
        '11111111-1111-1111-1111-111111111111',
        TRUE, 'EXEMPT'
    ),
    (
        'Doce Encanto Confeitaria',
        'Gastronomia',
        'Doceria',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
        'Bolos artesanais para festas, doces finos, tortas geladas e kits personalizados para eventos e encomendas.',
        'Camila Ferreira', '01310-100', 'Av. Paulista', '940', 'Bela Vista', 'São Paulo', 'SP', 'CONFIRMED_BY_CEP', TRUE,
        '(11) 96456-7804',
        '5511964567804',
        'doceencanto.confeitaria',
        '11111111-1111-1111-1111-111111111111',
        TRUE, 'EXEMPT'
    ),
    -- Beleza (3 exemplos)
    (
        'Espaço Raiz Beleza & Barbearia',
        'Beleza',
        'Salão',
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
        'Cortes masculinos e femininos, barba, coloração, escova e estética facial com horário agendado.',
        'Patrícia Lima', '01310-100', 'Av. Paulista', '1010', 'Bela Vista', 'São Paulo', 'SP', 'CONFIRMED_BY_CEP', TRUE,
        '(11) 99887-7665',
        '5511998877665',
        'espacoraiz.beleza',
        '11111111-1111-1111-1111-111111111111',
        TRUE, 'EXEMPT'
    ),
    (
        'Barbearia Dom Pedro',
        'Beleza',
        'Barbearia',
        'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80',
        'Corte masculino clássico e degradê, barboterapia com toalha quente e cuidados completos para o visual masculino.',
        'Pedro Henrique Santos', '01310-100', 'Av. Paulista', '1120', 'Bela Vista', 'São Paulo', 'SP', 'CONFIRMED_BY_CEP', TRUE,
        '(11) 95567-8905',
        '5511955678905',
        'barbeariadompedro',
        '11111111-1111-1111-1111-111111111111',
        TRUE, 'EXEMPT'
    ),
    (
        'Studio Bela Essência',
        'Beleza',
        'Manicure',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
        'Manicure, pedicure, design de sobrancelhas, alongamento de cílios e maquiagem social em ambiente climatizado.',
        'Larissa Carvalho', '01310-100', 'Av. Paulista', '1230', 'Bela Vista', 'São Paulo', 'SP', 'CONFIRMED_BY_CEP', TRUE,
        '(11) 94678-9006',
        '5511946789006',
        'studiobelaessencia',
        '11111111-1111-1111-1111-111111111111',
        TRUE, 'EXEMPT'
    ),
    -- Vestuário (3 exemplos)
    (
        'Ateliê & Moda Local',
        'Vestuário',
        'Moda',
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
        'Roupas casuais masculinas e femininas, confecção própria, ajustes sob medida e peças exclusivas.',
        'Helena Ribeiro', '01310-100', 'Av. Paulista', '1310', 'Bela Vista', 'São Paulo', 'SP', 'CONFIRMED_BY_CEP', TRUE,
        '(11) 96543-2109',
        '5511965432109',
        'ateliemodalocal',
        '11111111-1111-1111-1111-111111111111',
        TRUE, 'EXEMPT'
    ),
    (
        'Urbano Fit & Esportes',
        'Vestuário',
        'Fitness',
        'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=600&q=80',
        'Moda fitness, camisetas dry-fit, conjuntos esportivos masculinos e femininos e acessórios para treino e corrida.',
        'Lucas Teixeira', '01310-100', 'Av. Paulista', '1420', 'Bela Vista', 'São Paulo', 'SP', 'CONFIRMED_BY_CEP', TRUE,
        '(11) 93789-0107',
        '5511937890107',
        'urbanofit.sede',
        '11111111-1111-1111-1111-111111111111',
        TRUE, 'EXEMPT'
    ),
    (
        'Villa Jeans & Casual',
        'Vestuário',
        'Casual',
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
        'Calças jeans premium, jaquetas, camisas sociais e looks casuais completos com variedade de numerações.',
        'Renata Barbosa', '01310-100', 'Av. Paulista', '1530', 'Bela Vista', 'São Paulo', 'SP', 'CONFIRMED_BY_CEP', TRUE,
        '(11) 92890-1208',
        '5511928901208',
        'villajeans.oficial',
        '11111111-1111-1111-1111-111111111111',
        TRUE, 'EXEMPT'
    );
