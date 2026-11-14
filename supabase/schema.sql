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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
    logo_url TEXT,
    description TEXT NOT NULL,
    phone VARCHAR(30) NOT NULL,
    whatsapp VARCHAR(30),
    instagram VARCHAR(120),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    owner_email VARCHAR(180),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    approved BOOLEAN NOT NULL DEFAULT TRUE,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PAID',
    pix_tx_id VARCHAR(120),
    pix_payer_note VARCHAR(255),
    pending_renewal BOOLEAN NOT NULL DEFAULT FALSE,
    subscription_expires_at TIMESTAMPTZ,
    has_pending_update BOOLEAN NOT NULL DEFAULT FALSE,
    pending_name VARCHAR(150),
    pending_category VARCHAR(80),
    pending_logo_url TEXT,
    pending_description TEXT,
    pending_phone VARCHAR(30),
    pending_whatsapp VARCHAR(30),
    pending_instagram VARCHAR(120),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para acelerar a pesquisa de empresas
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_companies_category ON companies (LOWER(category));
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies (active);

-- -----------------------------------------------------------------------------
-- Row Level Security (RLS) - Boas práticas no Supabase
-- -----------------------------------------------------------------------------
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Leitura pública para empresas ativas
CREATE POLICY "Empresas ativas são públicas para leitura"
    ON companies FOR SELECT
    USING (active = TRUE);

-- =============================================================================
-- Dados iniciais (Seed) para testes
-- =============================================================================
INSERT INTO profiles (id, name, email, role)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Empreendedor Demo', 'contato@empreendesede.com.br', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

INSERT INTO companies (name, category, logo_url, description, phone, whatsapp, instagram, owner_id)
VALUES
    (
        'Café & Prosa Artesanal',
        'Gastronomia',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
        'Cafeteria especializada em grãos selecionados, pães de fermentação natural e um espaço acolhedor para reuniões e trabalho remoto.',
        '(11) 98765-4321',
        '5511987654321',
        'cafeprosa.artesanal',
        '11111111-1111-1111-1111-111111111111'
    ),
    (
        'Sede Tech Soluções',
        'Tecnologia',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
        'Desenvolvimento de sistemas sob medida, automação comercial e suporte técnico especializado para pequenos e médios negócios.',
        '(11) 91234-5678',
        '5511912345678',
        'sedetech.oficial',
        '11111111-1111-1111-1111-111111111111'
    ),
    (
        'Estúdio Raiz Design',
        'Design & Marketing',
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80',
        'Identidade visual, gestão de redes sociais e fotografia comercial para impulsionar marcas locais com criatividade.',
        '(11) 99887-7665',
        '5511998877665',
        'estudioraiz.design',
        '11111111-1111-1111-1111-111111111111'
    ),
    (
        'Verde Vida Hortifrúti',
        'Comércio Local',
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        'Produtos orgânicos frescos direto do produtor, cestas semanais por assinatura e entregas rápidas na região.',
        '(11) 97766-5544',
        '5511977665544',
        'verdevida.organicos',
        '11111111-1111-1111-1111-111111111111'
    );
