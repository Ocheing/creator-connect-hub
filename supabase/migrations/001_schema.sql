-- ============================================================
-- MicroMatch: Micro-Influencer Marketing Agency
-- Migration 001: Core Schema
-- ============================================================

-- ============================================================
-- 1. CUSTOM TYPES / ENUMS
-- ============================================================

CREATE TYPE public.user_role AS ENUM ('influencer', 'brand', 'admin');
CREATE TYPE public.campaign_status AS ENUM ('draft', 'pending_approval', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');
CREATE TYPE public.match_status AS ENUM ('proposed', 'accepted', 'rejected', 'active', 'completed', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE public.notification_type AS ENUM ('campaign', 'payment', 'application', 'match', 'system', 'message');
CREATE TYPE public.blog_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.lead_type AS ENUM ('influencer_application', 'brand_inquiry', 'email_capture');
CREATE TYPE public.social_platform AS ENUM ('instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'linkedin', 'other');

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

-- ────────────────────────────────────────────────────────
-- profiles: Linked 1:1 with auth.users
-- ────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.user_role NOT NULL DEFAULT 'influencer',
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────
-- influencer_profiles: Extended influencer details
-- ────────────────────────────────────────────────────────
CREATE TABLE public.influencer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    niche TEXT[] DEFAULT '{}',
    primary_platform public.social_platform DEFAULT 'instagram',
    instagram_handle TEXT,
    tiktok_handle TEXT,
    youtube_handle TEXT,
    twitter_handle TEXT,
    instagram_followers INTEGER DEFAULT 0 CHECK (instagram_followers >= 0),
    tiktok_followers INTEGER DEFAULT 0 CHECK (tiktok_followers >= 0),
    youtube_subscribers INTEGER DEFAULT 0 CHECK (youtube_subscribers >= 0),
    twitter_followers INTEGER DEFAULT 0 CHECK (twitter_followers >= 0),
    total_followers INTEGER GENERATED ALWAYS AS (
        COALESCE(instagram_followers, 0) +
        COALESCE(tiktok_followers, 0) +
        COALESCE(youtube_subscribers, 0) +
        COALESCE(twitter_followers, 0)
    ) STORED,
    engagement_rate DECIMAL(5, 2) DEFAULT 0.00 CHECK (engagement_rate >= 0 AND engagement_rate <= 100),
    avg_likes INTEGER DEFAULT 0,
    avg_comments INTEGER DEFAULT 0,
    content_categories TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{en}',
    rate_per_post DECIMAL(12, 2) DEFAULT 0.00,
    rate_per_story DECIMAL(12, 2) DEFAULT 0.00,
    rate_per_reel DECIMAL(12, 2) DEFAULT 0.00,
    rate_per_video DECIMAL(12, 2) DEFAULT 0.00,
    portfolio_urls TEXT[] DEFAULT '{}',
    media_kit_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    profile_completion_pct INTEGER DEFAULT 0 CHECK (profile_completion_pct >= 0 AND profile_completion_pct <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────
-- brand_profiles: Extended brand details
-- ────────────────────────────────────────────────────────
CREATE TABLE public.brand_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    industry TEXT,
    company_size TEXT,
    company_website TEXT,
    logo_url TEXT,
    description TEXT,
    target_audience TEXT,
    preferred_platforms public.social_platform[] DEFAULT '{}',
    preferred_niches TEXT[] DEFAULT '{}',
    budget_range_min DECIMAL(12, 2) DEFAULT 0.00,
    budget_range_max DECIMAL(12, 2) DEFAULT 0.00,
    total_campaigns INTEGER DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0.00,
    is_verified_brand BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────
-- campaigns: Brand marketing campaigns
-- ────────────────────────────────────────────────────────
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    deliverables TEXT[] DEFAULT '{}',
    target_platforms public.social_platform[] DEFAULT '{}',
    target_niches TEXT[] DEFAULT '{}',
    target_followers_min INTEGER DEFAULT 1000,
    target_followers_max INTEGER DEFAULT 10000,
    target_engagement_min DECIMAL(5, 2) DEFAULT 0.00,
    budget DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    budget_spent DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    cost_per_influencer DECIMAL(12, 2) DEFAULT 0.00,
    max_influencers INTEGER DEFAULT 1,
    matched_influencers INTEGER DEFAULT 0,
    status public.campaign_status NOT NULL DEFAULT 'draft',
    start_date DATE,
    end_date DATE,
    application_deadline DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT budget_positive CHECK (budget >= 0),
    CONSTRAINT budget_spent_check CHECK (budget_spent >= 0 AND budget_spent <= budget),
    CONSTRAINT date_check CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- ────────────────────────────────────────────────────────
-- campaign_applications: Influencer applies to campaigns
-- ────────────────────────────────────────────────────────
CREATE TABLE public.campaign_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    influencer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    cover_letter TEXT,
    proposed_rate DECIMAL(12, 2),
    proposed_deliverables TEXT,
    status public.application_status NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_campaign_application UNIQUE (campaign_id, influencer_id)
);

-- ────────────────────────────────────────────────────────
-- campaign_matches: Admin assigns influencers to campaigns
-- ────────────────────────────────────────────────────────
CREATE TABLE public.campaign_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    influencer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.campaign_applications(id) ON DELETE SET NULL,
    matched_by UUID REFERENCES public.profiles(id),
    agreed_rate DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status public.match_status NOT NULL DEFAULT 'proposed',
    deliverables_completed TEXT[] DEFAULT '{}',
    performance_notes TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_campaign_match UNIQUE (campaign_id, influencer_id)
);

-- ────────────────────────────────────────────────────────
-- payments: Brand → Agency (incoming payments)
-- ────────────────────────────────────────────────────────
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE RESTRICT,
    brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'KES',
    commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
    commission_amount DECIMAL(12, 2) GENERATED ALWAYS AS (
        ROUND(amount * commission_rate / 100, 2)
    ) STORED,
    net_amount DECIMAL(12, 2) GENERATED ALWAYS AS (
        ROUND(amount - (amount * commission_rate / 100), 2)
    ) STORED,
    status public.payment_status NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    external_payment_id TEXT,
    idempotency_key TEXT UNIQUE NOT NULL,
    payment_metadata JSONB DEFAULT '{}',
    paid_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────
-- payouts: Agency → Influencer (outgoing payouts)
-- ────────────────────────────────────────────────────────
CREATE TABLE public.payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
    match_id UUID NOT NULL REFERENCES public.campaign_matches(id) ON DELETE RESTRICT,
    influencer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'KES',
    status public.payout_status NOT NULL DEFAULT 'pending',
    payout_method TEXT,
    external_payout_id TEXT,
    idempotency_key TEXT UNIQUE NOT NULL,
    payout_metadata JSONB DEFAULT '{}',
    paid_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────
-- transaction_log: Audit trail for all financial events
-- ────────────────────────────────────────────────────────
CREATE TABLE public.transaction_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('payment', 'payout')),
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT,
    amount DECIMAL(12, 2),
    metadata JSONB DEFAULT '{}',
    performed_by UUID REFERENCES public.profiles(id),
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────
-- messages: In-platform messaging
-- ────────────────────────────────────────────────────────
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    subject TEXT,
    body TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT no_self_message CHECK (sender_id != receiver_id)
);

-- ────────────────────────────────────────────────────────
-- notifications: System notifications
-- ────────────────────────────────────────────────────────
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type public.notification_type NOT NULL DEFAULT 'system',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────
-- blog_posts: Content managed by admin
-- ────────────────────────────────────────────────────────
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    cover_image_url TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    tags TEXT[] DEFAULT '{}',
    status public.blog_status NOT NULL DEFAULT 'draft',
    views INTEGER NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────
-- testimonials: Social proof managed by admin
-- ────────────────────────────────────────────────────────
CREATE TABLE public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_name TEXT NOT NULL,
    author_role TEXT,
    author_company TEXT,
    author_image_url TEXT,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────
-- pricing_packages: Service pricing managed by admin
-- ────────────────────────────────────────────────────────
CREATE TABLE public.pricing_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'KES',
    features TEXT[] DEFAULT '{}',
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────
-- platform_settings: Global config (commission rate, etc.)
-- ────────────────────────────────────────────────────────
CREATE TABLE public.platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────
-- leads: Influencer applications, brand inquiries, downloads
-- ────────────────────────────────────────────────────────
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type public.lead_type NOT NULL,
    full_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    company_name TEXT,
    message TEXT,

    -- Influencer-specific fields
    social_platform public.social_platform,
    social_handle TEXT,
    follower_count INTEGER,
    content_niche TEXT,

    -- Brand-specific fields
    budget_range TEXT,
    campaign_goals TEXT,

    -- Anti-spam / processing
    ip_address INET,
    user_agent TEXT,
    is_spam BOOLEAN NOT NULL DEFAULT FALSE,
    is_processed BOOLEAN NOT NULL DEFAULT FALSE,
    processed_by UUID REFERENCES public.profiles(id),
    processed_at TIMESTAMPTZ,
    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────
-- rate_limit_tracker: Simple rate limiting table
-- ────────────────────────────────────────────────────────
CREATE TABLE public.rate_limit_tracker (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL,           -- IP or user ID
    action TEXT NOT NULL,               -- e.g. 'lead_submit', 'login_attempt'
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    request_count INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT unique_rate_limit UNIQUE (identifier, action, window_start)
);


-- ============================================================
-- 3. INDEXES
-- ============================================================

-- profiles
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);

-- influencer_profiles
CREATE INDEX idx_influencer_profiles_profile_id ON public.influencer_profiles(profile_id);
CREATE INDEX idx_influencer_profiles_niche ON public.influencer_profiles USING GIN(niche);
CREATE INDEX idx_influencer_profiles_primary_platform ON public.influencer_profiles(primary_platform);
CREATE INDEX idx_influencer_profiles_total_followers ON public.influencer_profiles(total_followers);
CREATE INDEX idx_influencer_profiles_engagement_rate ON public.influencer_profiles(engagement_rate);
CREATE INDEX idx_influencer_profiles_is_available ON public.influencer_profiles(is_available);

-- brand_profiles
CREATE INDEX idx_brand_profiles_profile_id ON public.brand_profiles(profile_id);
CREATE INDEX idx_brand_profiles_industry ON public.brand_profiles(industry);

-- campaigns
CREATE INDEX idx_campaigns_brand_id ON public.campaigns(brand_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_start_date ON public.campaigns(start_date);
CREATE INDEX idx_campaigns_end_date ON public.campaigns(end_date);
CREATE INDEX idx_campaigns_target_platforms ON public.campaigns USING GIN(target_platforms);
CREATE INDEX idx_campaigns_target_niches ON public.campaigns USING GIN(target_niches);

-- campaign_applications
CREATE INDEX idx_applications_campaign_id ON public.campaign_applications(campaign_id);
CREATE INDEX idx_applications_influencer_id ON public.campaign_applications(influencer_id);
CREATE INDEX idx_applications_status ON public.campaign_applications(status);

-- campaign_matches
CREATE INDEX idx_matches_campaign_id ON public.campaign_matches(campaign_id);
CREATE INDEX idx_matches_influencer_id ON public.campaign_matches(influencer_id);
CREATE INDEX idx_matches_status ON public.campaign_matches(status);

-- payments
CREATE INDEX idx_payments_campaign_id ON public.payments(campaign_id);
CREATE INDEX idx_payments_brand_id ON public.payments(brand_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_idempotency ON public.payments(idempotency_key);
CREATE INDEX idx_payments_external_id ON public.payments(external_payment_id);

-- payouts
CREATE INDEX idx_payouts_payment_id ON public.payouts(payment_id);
CREATE INDEX idx_payouts_influencer_id ON public.payouts(influencer_id);
CREATE INDEX idx_payouts_status ON public.payouts(status);
CREATE INDEX idx_payouts_idempotency ON public.payouts(idempotency_key);

-- transaction_log
CREATE INDEX idx_transaction_log_entity ON public.transaction_log(entity_type, entity_id);
CREATE INDEX idx_transaction_log_created ON public.transaction_log(created_at DESC);

-- messages
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_campaign ON public.messages(campaign_id);
CREATE INDEX idx_messages_is_read ON public.messages(receiver_id, is_read) WHERE is_read = FALSE;

-- notifications
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- blog_posts
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(published_at DESC) WHERE status = 'published';

-- testimonials
CREATE INDEX idx_testimonials_featured ON public.testimonials(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_testimonials_published ON public.testimonials(is_published) WHERE is_published = TRUE;

-- leads
CREATE INDEX idx_leads_type ON public.leads(type);
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_is_processed ON public.leads(is_processed);
CREATE INDEX idx_leads_created ON public.leads(created_at DESC);

-- rate_limit_tracker
CREATE INDEX idx_rate_limit_identifier ON public.rate_limit_tracker(identifier, action);


-- ============================================================
-- 4. TRIGGERS: auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'profiles', 'influencer_profiles', 'brand_profiles',
        'campaigns', 'campaign_applications', 'campaign_matches',
        'payments', 'payouts', 'blog_posts', 'testimonials',
        'pricing_packages', 'platform_settings', 'leads'
    ]
    LOOP
        EXECUTE format(
            'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I
             FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();',
            tbl
        );
    END LOOP;
END;
$$;


-- ============================================================
-- 5. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, role, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(
            (NEW.raw_user_meta_data->>'role')::public.user_role,
            'influencer'
        ),
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email
    );

    -- Auto-create role-specific profile
    IF COALESCE((NEW.raw_user_meta_data->>'role'), 'influencer') = 'influencer' THEN
        INSERT INTO public.influencer_profiles (profile_id) VALUES (NEW.id);
    ELSIF (NEW.raw_user_meta_data->>'role') = 'brand' THEN
        INSERT INTO public.brand_profiles (profile_id, company_name)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.raw_user_meta_data->>'full_name', '')
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 6. HELPER FUNCTIONS
-- ============================================================

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- Check if current user is a specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role public.user_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = required_role
    );
$$;

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Generate slug from title
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                TRIM(title),
                '[^a-zA-Z0-9\s-]', '', 'g'
            ),
            '\s+', '-', 'g'
        )
    ) || '-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
END;
$$;

-- Auto-generate slug for blog posts
CREATE OR REPLACE FUNCTION public.handle_blog_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = public.generate_slug(NEW.title);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_blog_slug
BEFORE INSERT ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.handle_blog_slug();


-- ============================================================
-- 7. FINANCIAL HELPER FUNCTIONS
-- ============================================================

-- Get current commission rate from settings (defaults to 20%)
CREATE OR REPLACE FUNCTION public.get_commission_rate()
RETURNS DECIMAL
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT COALESCE(
        (SELECT value::DECIMAL FROM public.platform_settings WHERE key = 'commission_rate'),
        20.00
    );
$$;

-- Process payment (SECURITY DEFINER for admin use)
CREATE OR REPLACE FUNCTION public.process_payment(
    p_payment_id UUID,
    p_new_status public.payment_status,
    p_external_id TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_old_status public.payment_status;
    v_amount DECIMAL;
BEGIN
    -- Get current payment state
    SELECT status, amount INTO v_old_status, v_amount
    FROM public.payments WHERE id = p_payment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment not found';
    END IF;

    -- Prevent invalid transitions
    IF v_old_status = 'completed' AND p_new_status != 'refunded' THEN
        RAISE EXCEPTION 'Cannot change status of completed payment';
    END IF;

    IF v_old_status = 'refunded' THEN
        RAISE EXCEPTION 'Cannot change status of refunded payment';
    END IF;

    -- Update payment
    UPDATE public.payments SET
        status = p_new_status,
        external_payment_id = COALESCE(p_external_id, external_payment_id),
        paid_at = CASE WHEN p_new_status = 'completed' THEN NOW() ELSE paid_at END,
        failed_at = CASE WHEN p_new_status = 'failed' THEN NOW() ELSE failed_at END
    WHERE id = p_payment_id;

    -- Log transaction
    INSERT INTO public.transaction_log (
        entity_type, entity_id, action, old_status, new_status,
        amount, performed_by
    ) VALUES (
        'payment', p_payment_id, 'status_change',
        v_old_status::TEXT, p_new_status::TEXT,
        v_amount, auth.uid()
    );

    -- If payment completed, update campaign budget_spent
    IF p_new_status = 'completed' THEN
        UPDATE public.campaigns SET
            budget_spent = budget_spent + v_amount
        WHERE id = (SELECT campaign_id FROM public.payments WHERE id = p_payment_id);
    END IF;
END;
$$;

-- Process payout (SECURITY DEFINER for admin use)
CREATE OR REPLACE FUNCTION public.process_payout(
    p_payout_id UUID,
    p_new_status public.payout_status,
    p_external_id TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_old_status public.payout_status;
    v_amount DECIMAL;
BEGIN
    SELECT status, amount INTO v_old_status, v_amount
    FROM public.payouts WHERE id = p_payout_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payout not found';
    END IF;

    IF v_old_status = 'completed' THEN
        RAISE EXCEPTION 'Cannot change status of completed payout';
    END IF;

    UPDATE public.payouts SET
        status = p_new_status,
        external_payout_id = COALESCE(p_external_id, external_payout_id),
        paid_at = CASE WHEN p_new_status = 'completed' THEN NOW() ELSE paid_at END,
        failed_at = CASE WHEN p_new_status = 'failed' THEN NOW() ELSE failed_at END
    WHERE id = p_payout_id;

    INSERT INTO public.transaction_log (
        entity_type, entity_id, action, old_status, new_status,
        amount, performed_by
    ) VALUES (
        'payout', p_payout_id, 'status_change',
        v_old_status::TEXT, p_new_status::TEXT,
        v_amount, auth.uid()
    );
END;
$$;


-- ============================================================
-- 8. DASHBOARD QUERY FUNCTIONS
-- ============================================================

-- Influencer dashboard stats
CREATE OR REPLACE FUNCTION public.get_influencer_dashboard_stats(p_influencer_id UUID)
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    -- Ensure the caller matches the influencer
    IF p_influencer_id != auth.uid() AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT json_build_object(
        'total_earnings', COALESCE((
            SELECT SUM(po.amount) FROM payouts po
            WHERE po.influencer_id = p_influencer_id AND po.status = 'completed'
        ), 0),
        'pending_earnings', COALESCE((
            SELECT SUM(po.amount) FROM payouts po
            WHERE po.influencer_id = p_influencer_id AND po.status = 'pending'
        ), 0),
        'active_deals', (
            SELECT COUNT(*) FROM campaign_matches cm
            WHERE cm.influencer_id = p_influencer_id AND cm.status = 'active'
        ),
        'completed_deals', (
            SELECT COUNT(*) FROM campaign_matches cm
            WHERE cm.influencer_id = p_influencer_id AND cm.status = 'completed'
        ),
        'pending_applications', (
            SELECT COUNT(*) FROM campaign_applications ca
            WHERE ca.influencer_id = p_influencer_id AND ca.status = 'pending'
        ),
        'total_applications', (
            SELECT COUNT(*) FROM campaign_applications ca
            WHERE ca.influencer_id = p_influencer_id
        ),
        'unread_notifications', (
            SELECT COUNT(*) FROM notifications n
            WHERE n.user_id = p_influencer_id AND n.is_read = FALSE
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- Brand dashboard stats
CREATE OR REPLACE FUNCTION public.get_brand_dashboard_stats(p_brand_id UUID)
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    IF p_brand_id != auth.uid() AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT json_build_object(
        'active_campaigns', (
            SELECT COUNT(*) FROM campaigns c
            WHERE c.brand_id = p_brand_id AND c.status = 'active'
        ),
        'total_campaigns', (
            SELECT COUNT(*) FROM campaigns c
            WHERE c.brand_id = p_brand_id
        ),
        'matched_influencers', (
            SELECT COUNT(DISTINCT cm.influencer_id) FROM campaign_matches cm
            JOIN campaigns c ON c.id = cm.campaign_id
            WHERE c.brand_id = p_brand_id AND cm.status IN ('active', 'completed', 'accepted')
        ),
        'total_spent', COALESCE((
            SELECT SUM(p.amount) FROM payments p
            WHERE p.brand_id = p_brand_id AND p.status = 'completed'
        ), 0),
        'pending_payments', COALESCE((
            SELECT SUM(p.amount) FROM payments p
            WHERE p.brand_id = p_brand_id AND p.status = 'pending'
        ), 0),
        'avg_engagement', COALESCE((
            SELECT AVG(ip.engagement_rate)
            FROM campaign_matches cm
            JOIN campaigns c ON c.id = cm.campaign_id
            JOIN influencer_profiles ip ON ip.profile_id = cm.influencer_id
            WHERE c.brand_id = p_brand_id AND cm.status IN ('active', 'completed')
        ), 0),
        'unread_notifications', (
            SELECT COUNT(*) FROM notifications n
            WHERE n.user_id = p_brand_id AND n.is_read = FALSE
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- Admin dashboard stats
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    SELECT json_build_object(
        'total_influencers', (
            SELECT COUNT(*) FROM profiles WHERE role = 'influencer' AND is_active = TRUE
        ),
        'total_brands', (
            SELECT COUNT(*) FROM profiles WHERE role = 'brand' AND is_active = TRUE
        ),
        'active_campaigns', (
            SELECT COUNT(*) FROM campaigns WHERE status = 'active'
        ),
        'total_campaigns', (
            SELECT COUNT(*) FROM campaigns
        ),
        'pending_approvals', (
            SELECT COUNT(*) FROM campaign_applications WHERE status = 'pending'
        ),
        'total_revenue', COALESCE((
            SELECT SUM(commission_amount) FROM payments WHERE status = 'completed'
        ), 0),
        'monthly_revenue', COALESCE((
            SELECT SUM(commission_amount) FROM payments
            WHERE status = 'completed'
            AND paid_at >= DATE_TRUNC('month', NOW())
        ), 0),
        'total_payments_volume', COALESCE((
            SELECT SUM(amount) FROM payments WHERE status = 'completed'
        ), 0),
        'pending_payouts', COALESCE((
            SELECT SUM(amount) FROM payouts WHERE status = 'pending'
        ), 0),
        'unprocessed_leads', (
            SELECT COUNT(*) FROM leads WHERE is_processed = FALSE AND is_spam = FALSE
        ),
        'new_signups_this_month', (
            SELECT COUNT(*) FROM profiles
            WHERE created_at >= DATE_TRUNC('month', NOW())
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- Rate limiting check function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_identifier TEXT,
    p_action TEXT,
    p_max_requests INTEGER DEFAULT 5,
    p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_count INTEGER;
    v_window_start TIMESTAMPTZ;
BEGIN
    v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;

    SELECT COALESCE(SUM(request_count), 0) INTO v_count
    FROM public.rate_limit_tracker
    WHERE identifier = p_identifier
        AND action = p_action
        AND window_start >= v_window_start;

    IF v_count >= p_max_requests THEN
        RETURN FALSE; -- Rate limited
    END IF;

    -- Record this request
    INSERT INTO public.rate_limit_tracker (identifier, action, window_start)
    VALUES (p_identifier, p_action, DATE_TRUNC('minute', NOW()))
    ON CONFLICT (identifier, action, window_start)
    DO UPDATE SET request_count = rate_limit_tracker.request_count + 1;

    RETURN TRUE; -- Allowed
END;
$$;


-- ============================================================
-- 9. NOTIFICATION TRIGGERS
-- ============================================================

-- Notify influencer when application status changes
CREATE OR REPLACE FUNCTION public.notify_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.notifications (user_id, type, title, message, action_url)
        VALUES (
            NEW.influencer_id,
            'application',
            CASE NEW.status
                WHEN 'approved' THEN 'Application Approved! 🎉'
                WHEN 'rejected' THEN 'Application Update'
                ELSE 'Application Status Updated'
            END,
            CASE NEW.status
                WHEN 'approved' THEN 'Your application has been approved. Get ready for an amazing collaboration!'
                WHEN 'rejected' THEN 'Unfortunately, your application was not selected this time. Keep applying!'
                ELSE 'Your application status has been updated to ' || NEW.status::TEXT
            END,
            '/dashboard/applications'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_application_change
AFTER UPDATE OF status ON public.campaign_applications
FOR EACH ROW EXECUTE FUNCTION public.notify_application_status_change();

-- Notify when matched to a campaign
CREATE OR REPLACE FUNCTION public.notify_campaign_match()
RETURNS TRIGGER AS $$
DECLARE
    v_campaign_title TEXT;
BEGIN
    SELECT title INTO v_campaign_title FROM public.campaigns WHERE id = NEW.campaign_id;

    -- Notify influencer
    INSERT INTO public.notifications (user_id, type, title, message, action_url)
    VALUES (
        NEW.influencer_id,
        'match',
        'New Campaign Match! 🤝',
        'You''ve been matched to the campaign: ' || COALESCE(v_campaign_title, 'Unknown'),
        '/dashboard/deals'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_campaign_match
AFTER INSERT ON public.campaign_matches
FOR EACH ROW EXECUTE FUNCTION public.notify_campaign_match();

-- Notify on payment completion
CREATE OR REPLACE FUNCTION public.notify_payment_completed()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed' THEN
        -- Notify brand
        INSERT INTO public.notifications (user_id, type, title, message, action_url)
        VALUES (
            NEW.brand_id,
            'payment',
            'Payment Confirmed ✅',
            'Your payment of ' || NEW.currency || ' ' || NEW.amount::TEXT || ' has been processed.',
            '/dashboard/budget'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_payment
AFTER UPDATE OF status ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.notify_payment_completed();


-- ============================================================
-- 10. SEED DATA: Default platform settings
-- ============================================================

INSERT INTO public.platform_settings (key, value, description) VALUES
    ('commission_rate', '20.00', 'Default agency commission percentage'),
    ('min_followers', '1000', 'Minimum follower count for influencer registration'),
    ('max_followers', '10000', 'Maximum follower count for micro-influencer classification'),
    ('currency', 'KES', 'Default platform currency'),
    ('platform_name', 'MicroMatch', 'Platform display name'),
    ('support_email', 'support@micromatch.co.ke', 'Support contact email');
