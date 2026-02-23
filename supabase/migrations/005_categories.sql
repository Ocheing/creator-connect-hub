-- ============================================================
-- MicroMatch: Migration 005 — Category-Based Matching System
-- ============================================================
-- Introduces a proper many-to-many category system to replace
-- the existing TEXT[] columns (niche, target_niches).
-- ============================================================

-- ============================================================
-- 1. CATEGORIES — The master lookup table
-- ============================================================

CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,                                   -- Optional icon name (e.g. lucide icon name)
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────
-- 2. JUNCTION: campaign_categories (many-to-many)
-- ────────────────────────────────────────────────────────

CREATE TABLE public.campaign_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_campaign_category UNIQUE (campaign_id, category_id)
);

-- ────────────────────────────────────────────────────────
-- 3. JUNCTION: influencer_categories (many-to-many)
-- ────────────────────────────────────────────────────────

CREATE TABLE public.influencer_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    influencer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_influencer_category UNIQUE (influencer_id, category_id)
);


-- ============================================================
-- 4. INDEXES — Performance-critical for matching queries
-- ============================================================

-- Categories
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent ON public.categories(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_categories_active ON public.categories(is_active, display_order) WHERE is_active = TRUE;

-- Campaign categories junction (covering index for matching)
CREATE INDEX idx_campaign_categories_campaign ON public.campaign_categories(campaign_id);
CREATE INDEX idx_campaign_categories_category ON public.campaign_categories(category_id);

-- Influencer categories junction (covering index for matching)
CREATE INDEX idx_influencer_categories_influencer ON public.influencer_categories(influencer_id);
CREATE INDEX idx_influencer_categories_category ON public.influencer_categories(category_id);


-- ============================================================
-- 5. TRIGGERS — Auto-update updated_at for categories
-- ============================================================

CREATE TRIGGER set_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- 6. HELPER: Auto-generate slug from category name
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_category_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = LOWER(
            REGEXP_REPLACE(
                REGEXP_REPLACE(TRIM(NEW.name), '[^a-zA-Z0-9\s-]', '', 'g'),
                '\s+', '-', 'g'
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_category_slug
    BEFORE INSERT ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_category_slug();


-- ============================================================
-- 7. MATCHING FUNCTION — Get campaigns matching an influencer
-- ============================================================
-- Returns active campaigns that share at least one category
-- with the given influencer. Includes match_score (count of
-- overlapping categories) for ranking.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_matching_campaigns(
    p_influencer_id UUID,
    p_page INTEGER DEFAULT 1,
    p_page_size INTEGER DEFAULT 20
)
RETURNS TABLE (
    campaign_id UUID,
    title TEXT,
    description TEXT,
    budget DECIMAL,
    cost_per_influencer DECIMAL,
    max_influencers INTEGER,
    matched_influencers INTEGER,
    status public.campaign_status,
    start_date DATE,
    end_date DATE,
    application_deadline DATE,
    brand_id UUID,
    brand_name TEXT,
    brand_logo TEXT,
    target_platforms public.social_platform[],
    match_score BIGINT,
    matching_categories TEXT[],
    total_categories BIGINT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_offset INTEGER;
BEGIN
    v_offset := (p_page - 1) * p_page_size;

    RETURN QUERY
    SELECT
        c.id AS campaign_id,
        c.title,
        c.description,
        c.budget,
        c.cost_per_influencer,
        c.max_influencers,
        c.matched_influencers,
        c.status,
        c.start_date,
        c.end_date,
        c.application_deadline,
        c.brand_id,
        bp.company_name AS brand_name,
        bp.logo_url AS brand_logo,
        c.target_platforms,
        COUNT(DISTINCT cc.category_id) AS match_score,
        ARRAY_AGG(DISTINCT cat.name) AS matching_categories,
        (SELECT COUNT(*) FROM campaign_categories cc2 WHERE cc2.campaign_id = c.id) AS total_categories,
        c.created_at
    FROM campaigns c
    -- Join to get campaign categories
    INNER JOIN campaign_categories cc ON cc.campaign_id = c.id
    -- Match with influencer categories
    INNER JOIN influencer_categories ic ON ic.category_id = cc.category_id
        AND ic.influencer_id = p_influencer_id
    -- Get category names
    INNER JOIN categories cat ON cat.id = cc.category_id
    -- Get brand info
    LEFT JOIN brand_profiles bp ON bp.profile_id = c.brand_id
    WHERE c.status = 'active'
    -- Exclude campaigns the influencer already applied to
    AND NOT EXISTS (
        SELECT 1 FROM campaign_applications ca
        WHERE ca.campaign_id = c.id
        AND ca.influencer_id = p_influencer_id
    )
    GROUP BY c.id, c.title, c.description, c.budget, c.cost_per_influencer,
             c.max_influencers, c.matched_influencers, c.status,
             c.start_date, c.end_date, c.application_deadline,
             c.brand_id, bp.company_name, bp.logo_url,
             c.target_platforms, c.created_at
    ORDER BY match_score DESC, c.created_at DESC
    LIMIT p_page_size
    OFFSET v_offset;
END;
$$;


-- ============================================================
-- 8. HELPER: Get category stats for admin dashboard
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_category_stats()
RETURNS TABLE (
    category_id UUID,
    category_name TEXT,
    category_slug TEXT,
    campaign_count BIGINT,
    influencer_count BIGINT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        COUNT(DISTINCT cc.campaign_id) AS campaign_count,
        COUNT(DISTINCT ic.influencer_id) AS influencer_count
    FROM categories c
    LEFT JOIN campaign_categories cc ON cc.category_id = c.id
    LEFT JOIN influencer_categories ic ON ic.category_id = c.id
    WHERE c.is_active = TRUE
    GROUP BY c.id, c.name, c.slug
    ORDER BY c.display_order, c.name;
$$;


-- ============================================================
-- 9. RLS POLICIES
-- ============================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_categories ENABLE ROW LEVEL SECURITY;

-- Categories: everyone can read, only admins can write
CREATE POLICY "Anyone can read active categories"
    ON public.categories FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Admins can manage categories"
    ON public.categories FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Campaign categories: brand owner or admins can manage, everyone can read
CREATE POLICY "Anyone can read campaign categories"
    ON public.campaign_categories FOR SELECT
    USING (TRUE);

CREATE POLICY "Campaign owner can manage campaign categories"
    ON public.campaign_categories FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM campaigns c
            WHERE c.id = campaign_id AND c.brand_id = auth.uid()
        )
        OR public.is_admin()
    );

CREATE POLICY "Campaign owner can delete campaign categories"
    ON public.campaign_categories FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM campaigns c
            WHERE c.id = campaign_id AND c.brand_id = auth.uid()
        )
        OR public.is_admin()
    );

-- Influencer categories: influencer or admins can manage, everyone can read
CREATE POLICY "Anyone can read influencer categories"
    ON public.influencer_categories FOR SELECT
    USING (TRUE);

CREATE POLICY "Influencer can manage own categories"
    ON public.influencer_categories FOR INSERT
    WITH CHECK (
        influencer_id = auth.uid()
        OR public.is_admin()
    );

CREATE POLICY "Influencer can delete own categories"
    ON public.influencer_categories FOR DELETE
    USING (
        influencer_id = auth.uid()
        OR public.is_admin()
    );


-- ============================================================
-- 10. SEED DATA — Default categories for Kenya market
-- ============================================================

INSERT INTO public.categories (name, slug, description, icon, display_order) VALUES
    ('Fashion & Style',      'fashion-style',        'Fashion, clothing, accessories, and personal style',     'Shirt',           1),
    ('Beauty & Skincare',    'beauty-skincare',       'Beauty products, makeup, skincare routines',             'Sparkles',        2),
    ('Food & Cooking',       'food-cooking',          'Food reviews, recipes, cooking tutorials',               'UtensilsCrossed', 3),
    ('Travel & Adventure',   'travel-adventure',      'Travel destinations, adventures, and tourism',           'Plane',           4),
    ('Health & Fitness',     'health-fitness',        'Fitness routines, health tips, wellness',                'Heart',           5),
    ('Technology',           'technology',            'Tech reviews, gadgets, software, and digital',           'Laptop',          6),
    ('Entertainment',        'entertainment',         'Music, movies, comedy, and pop culture',                 'Music',           7),
    ('Education',            'education',             'Educational content, tutorials, and learning',           'BookOpen',        8),
    ('Lifestyle',            'lifestyle',             'Daily life, home decor, organization',                   'Home',            9),
    ('Finance & Business',   'finance-business',      'Personal finance, investing, entrepreneurship',          'Briefcase',      10),
    ('Sports',               'sports',                'Sports coverage, commentary, and athletics',             'Trophy',         11),
    ('Parenting & Family',   'parenting-family',      'Parenting tips, family life, children',                  'Baby',           12),
    ('Art & Photography',    'art-photography',       'Art, photography, creative content',                     'Camera',         13),
    ('Gaming',               'gaming',                'Video games, streaming, esports',                        'Gamepad2',       14),
    ('Automotive',           'automotive',            'Cars, motorcycles, automotive reviews',                  'Car',            15),
    ('Pets & Animals',       'pets-animals',          'Pet care, animal content, veterinary',                   'Dog',            16),
    ('Real Estate',          'real-estate',           'Property, real estate, home buying',                     'Building',       17),
    ('Sustainability',       'sustainability',        'Eco-friendly, sustainability, green living',             'Leaf',           18)
ON CONFLICT (slug) DO NOTHING;
