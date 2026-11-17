-- ==============================================================================
-- VICE CLIPPER — ESQUEMA COMPLETO PARA O SUPABASE (SQL EDITOR)
-- Plataforma: Supabase (PostgreSQL 14+)
-- Instruções: Copie todo este script e cole no SQL Editor do seu projeto Supabase.
-- Clique em "Run" para executar todas as tabelas, tipos, RLS, triggers e seed data.
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS ENUM PERSONALIZADOS
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM (
        'active',
        'trialing',
        'past_due',
        'canceled',
        'unpaid',
        'incomplete'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE billing_interval AS ENUM (
        'monthly',
        'annual'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'paid',
        'pending',
        'failed',
        'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABELA DE PERFIS DE USUÁRIOS (PROFILES)
-- Vinculada diretamente à tabela de autenticação nativa do Supabase (auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE, -- Mapeia para auth.users(id)
    full_name TEXT NOT NULL DEFAULT 'Criador GTA 6',
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio TEXT DEFAULT 'Membro da comunidade VICE CLIPPER',
    is_admin BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. TABELA DE PLANOS DE ASSINATURA (PLANS)
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tagline TEXT,
    description TEXT,
    price_cents INTEGER NOT NULL, -- Valor em centavos (ex: 3000 = R$ 30,00 | 54000 = R$ 540,00)
    currency TEXT DEFAULT 'BRL' NOT NULL,
    billing_interval billing_interval NOT NULL DEFAULT 'monthly',
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    limits JSONB NOT NULL DEFAULT '{"clips_per_month": 40, "max_resolution": "1080p", "priority_queue": false}'::jsonb,
    is_active BOOLEAN DEFAULT true NOT NULL,
    highlighted BOOLEAN DEFAULT false NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. TABELA DE ASSINATURAS (SUBSCRIPTIONS)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
    provider TEXT NOT NULL DEFAULT 'mercadopago', -- 'mercadopago', 'stripe', 'pix'
    provider_customer_id TEXT,
    provider_subscription_id TEXT UNIQUE,
    status subscription_status NOT NULL DEFAULT 'incomplete',
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false NOT NULL,
    canceled_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 6. TABELA DE PAGAMENTOS E FATURAS (PAYMENTS)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    provider TEXT NOT NULL DEFAULT 'mercadopago',
    provider_payment_id TEXT UNIQUE NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'BRL' NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    payment_method TEXT DEFAULT 'pix', -- 'pix', 'credit_card', 'boleto'
    paid_at TIMESTAMPTZ,
    receipt_url TEXT,
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 7. TABELA DE EVENTOS DE WEBHOOK (IDEMPOTÊNCIA E AUDITORIA)
-- Impede duplicação de pagamentos através da chave única (provider, provider_event_id)
CREATE TABLE IF NOT EXISTS public.subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    provider_event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT uq_provider_event UNIQUE (provider, provider_event_id)
);

-- 8. ÍNDICES DE ALTA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_sub_id ON public.subscriptions(provider_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON public.payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_payment_id ON public.payments(provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_lookup ON public.subscription_events(provider, provider_event_id);

-- 9. FUNÇÃO E TRIGGERS DE ATUALIZAÇÃO AUTOMÁTICA DE DATA (updated_at)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_plans_updated_at ON public.plans;
CREATE TRIGGER set_plans_updated_at
    BEFORE UPDATE ON public.plans
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER set_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 10. TRIGGER AUTOMÁTICO DE CRIAÇÃO DE PERFIL AO CADASTRAR NO SUPABASE AUTH
-- Quando um usuário cria conta no auth.users, insere automaticamente em public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, user_id, full_name, username, email, avatar_url, is_admin)
    VALUES (
        NEW.id,
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
        CASE WHEN NEW.email ILIKE '%@viceclipper.com' THEN true ELSE false END
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. FUNÇÃO AUXILIAR PARA CHECAGEM DE ADMINISTRADOR
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE (id = auth.uid() OR user_id = auth.uid())
          AND is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Planos são publicamente visíveis por qualquer visitante
DROP POLICY IF EXISTS "Plans are publicly viewable" ON public.plans;
CREATE POLICY "Plans are publicly viewable"
    ON public.plans FOR SELECT
    USING (is_active = true);

-- Administradores podem gerenciar todos os planos
DROP POLICY IF EXISTS "Admins can manage plans" ON public.plans;
CREATE POLICY "Admins can manage plans"
    ON public.plans FOR ALL
    USING (public.is_admin());

-- Usuário visualiza e edita seu próprio perfil; Admins visualizam todos
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() = id OR public.is_admin());

-- Assinaturas: Usuário vê a sua própria; Admins vêem todas
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (
        user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
        OR public.is_admin()
    );

-- Pagamentos: Usuário vê os seus; Admins vêem todos
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments"
    ON public.payments FOR SELECT
    USING (
        user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
        OR public.is_admin()
    );

-- Webhook Events: Visíveis apenas para Administradores
DROP POLICY IF EXISTS "Admins can view events" ON public.subscription_events;
CREATE POLICY "Admins can view events"
    ON public.subscription_events FOR SELECT
    USING (public.is_admin());

-- 13. VIEW CONSOLIDADA: USER_SUBSCRIPTION_OVERVIEW
CREATE OR REPLACE VIEW public.user_subscription_overview AS
SELECT
    p.id AS profile_id,
    p.user_id,
    p.full_name,
    p.username,
    p.email,
    p.is_admin,
    s.id AS subscription_id,
    s.status AS subscription_status,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    pl.id AS plan_id,
    pl.name AS plan_name,
    pl.slug AS plan_slug,
    pl.price_cents,
    pl.billing_interval,
    CASE
        WHEN s.status = 'active' AND s.current_period_end > NOW() THEN true
        WHEN s.status = 'trialing' AND s.current_period_end > NOW() THEN true
        ELSE false
    END AS has_active_access
FROM public.profiles p
LEFT JOIN public.subscriptions s ON s.user_id = p.id
LEFT JOIN public.plans pl ON pl.id = s.plan_id;

-- 14. SEED: INSERÇÃO DOS 4 PLANOS OFICIAIS DO VICE CLIPPER
-- Vice Clipper Mensal: R$ 30,00
-- Vice Clipper PRO Mensal: R$ 50,00
-- Vice Clipper Anual: R$ 25,00/mês (R$ 300,00/ano)
-- Vice Clipper PRO Anual: R$ 45,00/mês (R$ 540,00/ano)
INSERT INTO public.plans (
    id, name, slug, tagline, description, price_cents, currency, billing_interval, features, limits, is_active, highlighted, sort_order
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Vice Clipper',
    'vice-clipper-monthly',
    'Ideal para criadores em ascensão e clipadores entusiastas.',
    'Acesso essencial às tendências do GTA 6 e exportações Full HD.',
    3000, -- R$ 30,00
    'BRL',
    'monthly',
    '[
        "Acesso completo ao Trend Radar de Leonida",
        "Criação de até 40 clipes inteligentes por mês",
        "Exportação em Full HD (1080p a 60 FPS)",
        "Enquadramento automático 9:16 (TikTok, Reels e Shorts)",
        "Sem marca d’água da plataforma",
        "Armazenamento em nuvem de clipes favoritos",
        "Acesso à comunidade e feed de criadores"
    ]'::jsonb,
    '{"clips_per_month": 40, "max_resolution": "1080p", "priority_queue": false}'::jsonb,
    true,
    false,
    1
),
(
    '00000000-0000-0000-0000-000000000002',
    'Vice Clipper PRO',
    'vice-clipper-pro-monthly',
    'Poder máximo para streamers profissionais e canais de elite.',
    'Recursos ilimitados com renderização 4K e IA preditiva de GTA 6.',
    5000, -- R$ 50,00
    'BRL',
    'monthly',
    '[
        "Tudo incluso no plano Vice Clipper e mais:",
        "Clipes inteligentes ILIMITADOS por mês",
        "Exportação máxima em Ultra HD 4K a 60 FPS",
        "Fila prioritária com renderização ultrarrápida",
        "Detecção neural avançada de perseguições, áudio e tiroteios",
        "Legendas automáticas estilizadas e sincronizadas",
        "Creator Studio PRO com métricas e insights preditivos",
        "Selo exclusivo de Criador PRO Verificado no perfil"
    ]'::jsonb,
    '{"clips_per_month": -1, "max_resolution": "4k", "priority_queue": true}'::jsonb,
    true,
    true,
    2
),
(
    '00000000-0000-0000-0000-000000000003',
    'Vice Clipper Anual',
    'vice-clipper-annual',
    'Ideal para criadores em ascensão com economia no plano anual.',
    'Acesso essencial às tendências do GTA 6 pagando equivalente a R$ 25/mês.',
    30000, -- R$ 300,00 por ano (R$ 25/mês)
    'BRL',
    'annual',
    '[
        "Equivalente a R$ 25/mês (Economia de R$ 60 no ano)",
        "Acesso completo ao Trend Radar de Leonida",
        "Criação de até 40 clipes inteligentes por mês",
        "Exportação em Full HD (1080p a 60 FPS)",
        "Enquadramento automático 9:16 (TikTok, Reels e Shorts)",
        "Sem marca d’água da plataforma",
        "Armazenamento em nuvem de clipes favoritos",
        "Acesso à comunidade e feed de criadores"
    ]'::jsonb,
    '{"clips_per_month": 40, "max_resolution": "1080p", "priority_queue": false}'::jsonb,
    true,
    false,
    3
),
(
    '00000000-0000-0000-0000-000000000004',
    'Vice Clipper PRO Anual',
    'vice-clipper-pro-annual',
    'Poder máximo para streamers e canais de elite com super desconto.',
    'Recursos ilimitados com IA preditiva pagando equivalente a R$ 45/mês.',
    54000, -- R$ 540,00 por ano (R$ 45/mês)
    'BRL',
    'annual',
    '[
        "Equivalente a R$ 45/mês (Economia de R$ 60 no ano)",
        "Tudo incluso no plano Vice Clipper e mais:",
        "Clipes inteligentes ILIMITADOS por mês",
        "Exportação máxima em Ultra HD 4K a 60 FPS",
        "Fila prioritária com renderização ultrarrápida",
        "Detecção neural avançada de perseguições, áudio e tiroteios",
        "Legendas automáticas estilizadas e sincronizadas",
        "Creator Studio PRO com métricas e insights preditivos",
        "Selo exclusivo de Criador PRO Verificado no perfil"
    ]'::jsonb,
    '{"clips_per_month": -1, "max_resolution": "4k", "priority_queue": true}'::jsonb,
    true,
    true,
    4
)
ON CONFLICT (slug) DO UPDATE
SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    price_cents = EXCLUDED.price_cents,
    billing_interval = EXCLUDED.billing_interval,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits,
    is_active = EXCLUDED.is_active,
    highlighted = EXCLUDED.highlighted,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();


-- ==============================================================================
-- 15. VICE CLIPPER — MÓDULO INTELIGENTE DE CLIPPING COM IA & SUPABASE
-- clip_jobs, clip_segments, clip_exports, RLS e Funções
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE clip_job_status AS ENUM (
        'pending',
        'downloading',
        'extracting_audio',
        'transcribing',
        'analyzing_context',
        'detecting_moments',
        'scoring',
        'completed',
        'failed',
        'canceled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE clip_source_type AS ENUM (
        'url',
        'file',
        'live',
        'sample'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE clip_export_status AS ENUM (
        'queued',
        'rendering',
        'reframing',
        'ready',
        'failed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.clip_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    source_video_url TEXT NOT NULL,
    source_type clip_source_type NOT NULL DEFAULT 'url',
    platform TEXT DEFAULT 'youtube',
    is_live BOOLEAN NOT NULL DEFAULT false,
    status clip_job_status NOT NULL DEFAULT 'pending',
    progress INTEGER NOT NULL DEFAULT 0,
    duration NUMERIC(10, 2) DEFAULT 0,
    target_duration TEXT DEFAULT 'auto',
    current_stage TEXT DEFAULT 'Iniciando fila...',
    error_message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    processing_started_at TIMESTAMPTZ,
    processing_finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.clip_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.clip_jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time NUMERIC(10, 2) NOT NULL,
    end_time NUMERIC(10, 2) NOT NULL,
    duration NUMERIC(10, 2) NOT NULL,
    transcript TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'Geral',
    viral_score INTEGER NOT NULL DEFAULT 0,
    score_breakdown JSONB NOT NULL DEFAULT '{"hook": 0, "retention": 0, "emotion": 0, "clarity": 0, "shareability": 0}'::jsonb,
    score_explanation TEXT,
    suggested_caption TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    cues JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'detected',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.clip_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_id UUID REFERENCES public.clip_segments(id) ON DELETE SET NULL,
    job_id UUID REFERENCES public.clip_jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    output_url TEXT,
    storage_path TEXT,
    resolution TEXT NOT NULL DEFAULT '1080p',
    aspect_ratio TEXT NOT NULL DEFAULT '9:16',
    framing_mode TEXT NOT NULL DEFAULT 'cover',
    subtitle_style TEXT NOT NULL DEFAULT 'neon_pink',
    subtitle_position TEXT NOT NULL DEFAULT 'bottom',
    file_size_bytes BIGINT DEFAULT 0,
    status clip_export_status NOT NULL DEFAULT 'queued',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clip_jobs_user_id ON public.clip_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_clip_jobs_status ON public.clip_jobs(status);
CREATE INDEX IF NOT EXISTS idx_clip_jobs_created_at ON public.clip_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clip_segments_job_id ON public.clip_segments(job_id);
CREATE INDEX IF NOT EXISTS idx_clip_segments_user_id ON public.clip_segments(user_id);
CREATE INDEX IF NOT EXISTS idx_clip_segments_viral_score ON public.clip_segments(viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_clip_exports_segment_id ON public.clip_exports(segment_id);
CREATE INDEX IF NOT EXISTS idx_clip_exports_user_id ON public.clip_exports(user_id);

DROP TRIGGER IF EXISTS set_clip_jobs_updated_at ON public.clip_jobs;
CREATE TRIGGER set_clip_jobs_updated_at
    BEFORE UPDATE ON public.clip_jobs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_clip_segments_updated_at ON public.clip_segments;
CREATE TRIGGER set_clip_segments_updated_at
    BEFORE UPDATE ON public.clip_segments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_clip_exports_updated_at ON public.clip_exports;
CREATE TRIGGER set_clip_exports_updated_at
    BEFORE UPDATE ON public.clip_exports
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.clip_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clip_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clip_exports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own clip jobs" ON public.clip_jobs;
CREATE POLICY "Users can view own clip jobs"
    ON public.clip_jobs FOR SELECT
    USING (
        user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Users can create own clip jobs" ON public.clip_jobs;
CREATE POLICY "Users can create own clip jobs"
    ON public.clip_jobs FOR INSERT
    WITH CHECK (
        user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Users can update own clip jobs" ON public.clip_jobs;
CREATE POLICY "Users can update own clip jobs"
    ON public.clip_jobs FOR UPDATE
    USING (
        user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Users can view own clip segments" ON public.clip_segments;
CREATE POLICY "Users can view own clip segments"
    ON public.clip_segments FOR SELECT
    USING (
        user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Users can manage own clip segments" ON public.clip_segments;
CREATE POLICY "Users can manage own clip segments"
    ON public.clip_segments FOR ALL
    USING (
        user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Users can view own clip exports" ON public.clip_exports;
CREATE POLICY "Users can view own clip exports"
    ON public.clip_exports FOR SELECT
    USING (
        user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Users can manage own clip exports" ON public.clip_exports;
CREATE POLICY "Users can manage own clip exports"
    ON public.clip_exports FOR ALL
    USING (
        user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
        OR public.is_admin()
    );
