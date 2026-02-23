-- ============================================================
-- MicroMatch: Migration 006 — Success Stories
-- ============================================================
-- Admin-managed success stories displayed on the Brand page.
-- ============================================================

CREATE TABLE public.success_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    result TEXT NOT NULL,
    description TEXT NOT NULL,
    stat_influencers INTEGER DEFAULT 0,
    stat_reach TEXT DEFAULT '0',
    stat_engagement TEXT DEFAULT '0%',
    cover_image_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_success_stories_published ON public.success_stories(is_published, display_order) WHERE is_published = TRUE;

-- Auto-update updated_at
CREATE TRIGGER set_success_stories_updated_at
    BEFORE UPDATE ON public.success_stories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published success stories"
    ON public.success_stories FOR SELECT
    USING (is_published = TRUE);

CREATE POLICY "Admins can manage success stories"
    ON public.success_stories FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Seed Data
INSERT INTO public.success_stories (brand_name, industry, result, description, stat_influencers, stat_reach, stat_engagement, display_order) VALUES
    ('Organic Skincare Co.', 'Beauty', '312% increase in website traffic', 'Partnered with 15 beauty micro-influencers for a product launch campaign.', 15, '180K', '8.2%', 1),
    ('FitLife Supplements', 'Health & Fitness', '2.5x return on ad spend', 'Ambassador program with fitness creators driving consistent sales.', 8, '95K', '9.1%', 2),
    ('TechStart App', 'Technology', '5,000+ app downloads', 'Tech reviewers showcasing app features to engaged audiences.', 10, '120K', '7.5%', 3);
