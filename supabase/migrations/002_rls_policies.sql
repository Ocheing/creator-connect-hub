-- ============================================================
-- MicroMatch: Row-Level Security Policies
-- Migration 002: RLS Policies
-- ============================================================

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_tracker ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- PROFILES
-- ============================================================

-- Users can view their own profile
CREATE POLICY "profiles_select_own"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "profiles_select_admin"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

-- Brands can view influencer profiles (for matching)
CREATE POLICY "profiles_select_influencers_for_brands"
    ON public.profiles FOR SELECT
    USING (
        public.has_role('brand') AND role = 'influencer' AND is_active = TRUE
    );

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid()
        AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())  -- prevent role self-elevation
    );

-- Admins can update any profile
CREATE POLICY "profiles_update_admin"
    ON public.profiles FOR UPDATE
    USING (public.is_admin());

-- Profiles are created by the trigger, no direct insert
CREATE POLICY "profiles_insert_trigger"
    ON public.profiles FOR INSERT
    WITH CHECK (id = auth.uid());

-- Admins can delete profiles
CREATE POLICY "profiles_delete_admin"
    ON public.profiles FOR DELETE
    USING (public.is_admin());


-- ============================================================
-- INFLUENCER PROFILES
-- ============================================================

-- Influencers can view their own extended profile
CREATE POLICY "influencer_profiles_select_own"
    ON public.influencer_profiles FOR SELECT
    USING (profile_id = auth.uid());

-- Admins can view all influencer profiles
CREATE POLICY "influencer_profiles_select_admin"
    ON public.influencer_profiles FOR SELECT
    USING (public.is_admin());

-- Brands can view influencer profiles (discovery)
CREATE POLICY "influencer_profiles_select_brands"
    ON public.influencer_profiles FOR SELECT
    USING (
        public.has_role('brand')
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = public.influencer_profiles.profile_id
            AND is_active = TRUE
        )
    );

-- Influencers can update their own extended profile
CREATE POLICY "influencer_profiles_update_own"
    ON public.influencer_profiles FOR UPDATE
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());

-- Admins can update influencer profiles
CREATE POLICY "influencer_profiles_update_admin"
    ON public.influencer_profiles FOR UPDATE
    USING (public.is_admin());

-- Insert handled by trigger
CREATE POLICY "influencer_profiles_insert_own"
    ON public.influencer_profiles FOR INSERT
    WITH CHECK (profile_id = auth.uid());


-- ============================================================
-- BRAND PROFILES
-- ============================================================

-- Brands can view their own extended profile
CREATE POLICY "brand_profiles_select_own"
    ON public.brand_profiles FOR SELECT
    USING (profile_id = auth.uid());

-- Admins can view all brand profiles
CREATE POLICY "brand_profiles_select_admin"
    ON public.brand_profiles FOR SELECT
    USING (public.is_admin());

-- Influencers can see basic brand info (for matched campaigns)
CREATE POLICY "brand_profiles_select_influencers"
    ON public.brand_profiles FOR SELECT
    USING (
        public.has_role('influencer')
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = public.brand_profiles.profile_id
            AND is_active = TRUE
        )
    );

-- Brands can update their own extended profile
CREATE POLICY "brand_profiles_update_own"
    ON public.brand_profiles FOR UPDATE
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());

-- Admins can update brand profiles
CREATE POLICY "brand_profiles_update_admin"
    ON public.brand_profiles FOR UPDATE
    USING (public.is_admin());

-- Insert handled by trigger
CREATE POLICY "brand_profiles_insert_own"
    ON public.brand_profiles FOR INSERT
    WITH CHECK (profile_id = auth.uid());


-- ============================================================
-- CAMPAIGNS
-- ============================================================

-- Brands can view their own campaigns
CREATE POLICY "campaigns_select_own_brand"
    ON public.campaigns FOR SELECT
    USING (brand_id = auth.uid());

-- Influencers can view active/approved campaigns
CREATE POLICY "campaigns_select_active_influencers"
    ON public.campaigns FOR SELECT
    USING (
        public.has_role('influencer')
        AND status IN ('active', 'completed')
    );

-- Admins can view all campaigns
CREATE POLICY "campaigns_select_admin"
    ON public.campaigns FOR SELECT
    USING (public.is_admin());

-- Brands can create campaigns (draft status only initially)
CREATE POLICY "campaigns_insert_brand"
    ON public.campaigns FOR INSERT
    WITH CHECK (
        brand_id = auth.uid()
        AND public.has_role('brand')
        AND status = 'draft'
    );

-- Brands can update their own draft/active campaigns
CREATE POLICY "campaigns_update_own_brand"
    ON public.campaigns FOR UPDATE
    USING (brand_id = auth.uid() AND status IN ('draft', 'pending_approval'))
    WITH CHECK (brand_id = auth.uid());

-- Admins can update any campaign
CREATE POLICY "campaigns_update_admin"
    ON public.campaigns FOR UPDATE
    USING (public.is_admin());

-- Brands can delete their own draft campaigns
CREATE POLICY "campaigns_delete_own_draft"
    ON public.campaigns FOR DELETE
    USING (brand_id = auth.uid() AND status = 'draft');

-- Admins can delete any campaign
CREATE POLICY "campaigns_delete_admin"
    ON public.campaigns FOR DELETE
    USING (public.is_admin());


-- ============================================================
-- CAMPAIGN APPLICATIONS
-- ============================================================

-- Influencers can view their own applications
CREATE POLICY "applications_select_own_influencer"
    ON public.campaign_applications FOR SELECT
    USING (influencer_id = auth.uid());

-- Brands can view applications to their campaigns
CREATE POLICY "applications_select_brand"
    ON public.campaign_applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns
            WHERE id = campaign_applications.campaign_id
            AND brand_id = auth.uid()
        )
    );

-- Admins can view all applications
CREATE POLICY "applications_select_admin"
    ON public.campaign_applications FOR SELECT
    USING (public.is_admin());

-- Influencers can apply to active campaigns
CREATE POLICY "applications_insert_influencer"
    ON public.campaign_applications FOR INSERT
    WITH CHECK (
        influencer_id = auth.uid()
        AND public.has_role('influencer')
        AND EXISTS (
            SELECT 1 FROM public.campaigns
            WHERE id = campaign_applications.campaign_id
            AND status = 'active'
            AND (application_deadline IS NULL OR application_deadline >= CURRENT_DATE)
        )
    );

-- Influencers can update (withdraw) their pending applications
CREATE POLICY "applications_update_own"
    ON public.campaign_applications FOR UPDATE
    USING (influencer_id = auth.uid() AND status = 'pending')
    WITH CHECK (influencer_id = auth.uid() AND status = 'withdrawn');

-- Admins can update any application (approve/reject)
CREATE POLICY "applications_update_admin"
    ON public.campaign_applications FOR UPDATE
    USING (public.is_admin());


-- ============================================================
-- CAMPAIGN MATCHES
-- ============================================================

-- Influencers can view their own matches
CREATE POLICY "matches_select_own_influencer"
    ON public.campaign_matches FOR SELECT
    USING (influencer_id = auth.uid());

-- Brands can view matches for their campaigns
CREATE POLICY "matches_select_brand"
    ON public.campaign_matches FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns
            WHERE id = campaign_matches.campaign_id
            AND brand_id = auth.uid()
        )
    );

-- Admins can view all matches
CREATE POLICY "matches_select_admin"
    ON public.campaign_matches FOR SELECT
    USING (public.is_admin());

-- Only admins can create matches
CREATE POLICY "matches_insert_admin"
    ON public.campaign_matches FOR INSERT
    WITH CHECK (public.is_admin());

-- Admins can update matches
CREATE POLICY "matches_update_admin"
    ON public.campaign_matches FOR UPDATE
    USING (public.is_admin());

-- Influencers can accept/reject their proposed matches
CREATE POLICY "matches_update_influencer_response"
    ON public.campaign_matches FOR UPDATE
    USING (influencer_id = auth.uid() AND status = 'proposed')
    WITH CHECK (influencer_id = auth.uid() AND status IN ('accepted', 'rejected'));


-- ============================================================
-- PAYMENTS
-- ============================================================

-- Brands can view their own payments
CREATE POLICY "payments_select_own_brand"
    ON public.payments FOR SELECT
    USING (brand_id = auth.uid());

-- Admins can view all payments
CREATE POLICY "payments_select_admin"
    ON public.payments FOR SELECT
    USING (public.is_admin());

-- No client-side payment creation — only via Edge Functions / SECURITY DEFINER
-- Admins can manage payments
CREATE POLICY "payments_insert_admin"
    ON public.payments FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "payments_update_admin"
    ON public.payments FOR UPDATE
    USING (public.is_admin());


-- ============================================================
-- PAYOUTS
-- ============================================================

-- Influencers can view their own payouts
CREATE POLICY "payouts_select_own_influencer"
    ON public.payouts FOR SELECT
    USING (influencer_id = auth.uid());

-- Admins can view all payouts
CREATE POLICY "payouts_select_admin"
    ON public.payouts FOR SELECT
    USING (public.is_admin());

-- No client-side payout creation — only via admin/SECURITY DEFINER
CREATE POLICY "payouts_insert_admin"
    ON public.payouts FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "payouts_update_admin"
    ON public.payouts FOR UPDATE
    USING (public.is_admin());


-- ============================================================
-- TRANSACTION LOG (admin-only read)
-- ============================================================

CREATE POLICY "transaction_log_select_admin"
    ON public.transaction_log FOR SELECT
    USING (public.is_admin());

-- No client-side insert — only via SECURITY DEFINER functions
CREATE POLICY "transaction_log_insert_system"
    ON public.transaction_log FOR INSERT
    WITH CHECK (public.is_admin());


-- ============================================================
-- MESSAGES
-- ============================================================

-- Users can view messages they sent or received
CREATE POLICY "messages_select_own"
    ON public.messages FOR SELECT
    USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Admins can view all messages
CREATE POLICY "messages_select_admin"
    ON public.messages FOR SELECT
    USING (public.is_admin());

-- Users can send messages
CREATE POLICY "messages_insert_own"
    ON public.messages FOR INSERT
    WITH CHECK (sender_id = auth.uid());

-- Recipients can mark messages as read
CREATE POLICY "messages_update_read"
    ON public.messages FOR UPDATE
    USING (receiver_id = auth.uid())
    WITH CHECK (receiver_id = auth.uid());


-- ============================================================
-- NOTIFICATIONS
-- ============================================================

-- Users can view their own notifications
CREATE POLICY "notifications_select_own"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid());

-- Users can mark their own notifications as read
CREATE POLICY "notifications_update_own"
    ON public.notifications FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- System/triggers can create notifications (SECURITY DEFINER handles this)
-- Admins can insert notifications for any user
CREATE POLICY "notifications_insert_admin"
    ON public.notifications FOR INSERT
    WITH CHECK (public.is_admin());

-- Admins can view all notifications
CREATE POLICY "notifications_select_admin"
    ON public.notifications FOR SELECT
    USING (public.is_admin());


-- ============================================================
-- BLOG POSTS
-- ============================================================

-- Everyone (including anonymous) can read published blog posts
CREATE POLICY "blog_posts_select_published"
    ON public.blog_posts FOR SELECT
    USING (status = 'published');

-- Admins can view all blog posts (including drafts)
CREATE POLICY "blog_posts_select_admin"
    ON public.blog_posts FOR SELECT
    USING (public.is_admin());

-- Only admins can create blog posts
CREATE POLICY "blog_posts_insert_admin"
    ON public.blog_posts FOR INSERT
    WITH CHECK (public.is_admin());

-- Only admins can update blog posts
CREATE POLICY "blog_posts_update_admin"
    ON public.blog_posts FOR UPDATE
    USING (public.is_admin());

-- Only admins can delete blog posts
CREATE POLICY "blog_posts_delete_admin"
    ON public.blog_posts FOR DELETE
    USING (public.is_admin());


-- ============================================================
-- TESTIMONIALS
-- ============================================================

-- Everyone can read published testimonials
CREATE POLICY "testimonials_select_published"
    ON public.testimonials FOR SELECT
    USING (is_published = TRUE);

-- Admins can view all testimonials
CREATE POLICY "testimonials_select_admin"
    ON public.testimonials FOR SELECT
    USING (public.is_admin());

-- Only admins can manage testimonials
CREATE POLICY "testimonials_insert_admin"
    ON public.testimonials FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "testimonials_update_admin"
    ON public.testimonials FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "testimonials_delete_admin"
    ON public.testimonials FOR DELETE
    USING (public.is_admin());


-- ============================================================
-- PRICING PACKAGES
-- ============================================================

-- Everyone can view active pricing packages
CREATE POLICY "pricing_select_active"
    ON public.pricing_packages FOR SELECT
    USING (is_active = TRUE);

-- Admins can view all packages
CREATE POLICY "pricing_select_admin"
    ON public.pricing_packages FOR SELECT
    USING (public.is_admin());

-- Only admins can manage pricing
CREATE POLICY "pricing_insert_admin"
    ON public.pricing_packages FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "pricing_update_admin"
    ON public.pricing_packages FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "pricing_delete_admin"
    ON public.pricing_packages FOR DELETE
    USING (public.is_admin());


-- ============================================================
-- PLATFORM SETTINGS
-- ============================================================

-- Only admins can read settings
CREATE POLICY "settings_select_admin"
    ON public.platform_settings FOR SELECT
    USING (public.is_admin());

-- Public can read specific non-sensitive settings
CREATE POLICY "settings_select_public"
    ON public.platform_settings FOR SELECT
    USING (key IN ('platform_name', 'currency', 'support_email'));

-- Only admins can modify settings
CREATE POLICY "settings_update_admin"
    ON public.platform_settings FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "settings_insert_admin"
    ON public.platform_settings FOR INSERT
    WITH CHECK (public.is_admin());


-- ============================================================
-- LEADS (public insert, admin read)
-- ============================================================

-- Anyone can submit a lead (rate limited via function)
CREATE POLICY "leads_insert_public"
    ON public.leads FOR INSERT
    WITH CHECK (TRUE);

-- Only admins can view leads
CREATE POLICY "leads_select_admin"
    ON public.leads FOR SELECT
    USING (public.is_admin());

-- Only admins can update leads
CREATE POLICY "leads_update_admin"
    ON public.leads FOR UPDATE
    USING (public.is_admin());


-- ============================================================
-- RATE LIMIT TRACKER
-- ============================================================

-- System functions handle this table
CREATE POLICY "rate_limit_insert_system"
    ON public.rate_limit_tracker FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "rate_limit_select_system"
    ON public.rate_limit_tracker FOR SELECT
    USING (TRUE);

CREATE POLICY "rate_limit_update_system"
    ON public.rate_limit_tracker FOR UPDATE
    USING (TRUE);
