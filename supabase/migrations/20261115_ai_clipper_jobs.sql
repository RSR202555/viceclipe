-- ==============================================================================
-- VICE CLIPPER — MÓDULO INTELIGENTE DE CLIPPING COM IA & SUPABASE
-- Migração: clip_jobs, clip_segments, clip_exports, RLS e Funções
-- ==============================================================================

-- 1. TIPOS ENUM PARA O MOTOR DE PROCESSAMENTO
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

-- 2. TABELA DE TRABALHOS DE PROCESSAMENTO (CLIP_JOBS)
CREATE TABLE IF NOT EXISTS public.clip_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    source_video_url TEXT NOT NULL,
    source_type clip_source_type NOT NULL DEFAULT 'url',
    platform TEXT DEFAULT 'youtube', -- 'youtube', 'twitch', 'kick', 'direct_upload'
    is_live BOOLEAN NOT NULL DEFAULT false,
    status clip_job_status NOT NULL DEFAULT 'pending',
    progress INTEGER NOT NULL DEFAULT 0, -- 0 a 100
    duration NUMERIC(10, 2) DEFAULT 0, -- duração em segundos
    target_duration TEXT DEFAULT 'auto', -- '15-30', '30-45', '45-60', '60-90', 'auto'
    current_stage TEXT DEFAULT 'Iniciando fila...',
    error_message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb, -- fps, width, height, codec, author, title, thumbnail
    processing_started_at TIMESTAMPTZ,
    processing_finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. TABELA DE MOMENTOS / SEGMENTOS DETECTADOS PELA IA (CLIP_SEGMENTS)
CREATE TABLE IF NOT EXISTS public.clip_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.clip_jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time NUMERIC(10, 2) NOT NULL, -- segundo inicial
    end_time NUMERIC(10, 2) NOT NULL, -- segundo final
    duration NUMERIC(10, 2) NOT NULL,
    transcript TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'Geral', -- 'História', 'Opinião Forte', 'Reação', 'Humor', 'Discussão', 'Gameplay Épica'
    viral_score INTEGER NOT NULL DEFAULT 0, -- 0 a 100
    score_breakdown JSONB NOT NULL DEFAULT '{"hook": 0, "retention": 0, "emotion": 0, "clarity": 0, "shareability": 0}'::jsonb,
    score_explanation TEXT,
    suggested_caption TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    cues JSONB DEFAULT '[]'::jsonb, -- timestamps de cada fala interna do corte
    status TEXT NOT NULL DEFAULT 'detected', -- 'detected', 'selected', 'dismissed'
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. TABELA DE RENDERIZAÇÕES E EXPORTAÇÕES FINAIS (CLIP_EXPORTS)
CREATE TABLE IF NOT EXISTS public.clip_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_id UUID REFERENCES public.clip_segments(id) ON DELETE SET NULL,
    job_id UUID REFERENCES public.clip_jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    output_url TEXT,
    storage_path TEXT,
    resolution TEXT NOT NULL DEFAULT '1080p', -- '720p', '1080p', '4k'
    aspect_ratio TEXT NOT NULL DEFAULT '9:16', -- '9:16', '16:9'
    framing_mode TEXT NOT NULL DEFAULT 'cover', -- 'cover', 'black-bars', 'blur', 'smart_track'
    subtitle_style TEXT NOT NULL DEFAULT 'neon_pink', -- 'viral_classic', 'podcast_premium', 'neon_pink', 'minimalist', 'dynamic'
    subtitle_position TEXT NOT NULL DEFAULT 'bottom',
    file_size_bytes BIGINT DEFAULT 0,
    status clip_export_status NOT NULL DEFAULT 'queued',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. ÍNDICES DE ALTA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_clip_jobs_user_id ON public.clip_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_clip_jobs_status ON public.clip_jobs(status);
CREATE INDEX IF NOT EXISTS idx_clip_jobs_created_at ON public.clip_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clip_segments_job_id ON public.clip_segments(job_id);
CREATE INDEX IF NOT EXISTS idx_clip_segments_user_id ON public.clip_segments(user_id);
CREATE INDEX IF NOT EXISTS idx_clip_segments_viral_score ON public.clip_segments(viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_clip_exports_segment_id ON public.clip_exports(segment_id);
CREATE INDEX IF NOT EXISTS idx_clip_exports_user_id ON public.clip_exports(user_id);

-- 6. FUNÇÃO AUXILIAR E TRIGGERS DE UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- 7. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.clip_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clip_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clip_exports ENABLE ROW LEVEL SECURITY;

-- Políticas para clip_jobs:
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

-- Políticas para clip_segments:
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

-- Políticas para clip_exports:
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
