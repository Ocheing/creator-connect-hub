-- ============================================================
-- MicroMatch: Storage Configuration
-- Migration 003: Supabase Storage Buckets + Policies
-- ============================================================

-- ============================================================
-- 1. CREATE STORAGE BUCKETS
-- ============================================================

-- Profile avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    TRUE,
    5242880,  -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Brand logos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'brand-logos',
    'brand-logos',
    TRUE,
    5242880,  -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
);

-- Campaign media bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'campaign-media',
    'campaign-media',
    TRUE,
    20971520,  -- 20MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf']
);

-- Portfolio / Media Kit bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'portfolios',
    'portfolios',
    TRUE,
    10485760,  -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4']
);

-- Blog post images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'blog-images',
    'blog-images',
    TRUE,
    5242880,  -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);


-- ============================================================
-- 2. STORAGE POLICIES: AVATARS
-- ============================================================

-- Anyone can view avatars (public bucket)
CREATE POLICY "avatars_select_public"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- Users can upload their own avatar (path: avatars/{user_id}/*)
CREATE POLICY "avatars_insert_own"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );

-- Users can update their own avatar
CREATE POLICY "avatars_update_own"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );

-- Users can delete their own avatar
CREATE POLICY "avatars_delete_own"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );


-- ============================================================
-- 3. STORAGE POLICIES: BRAND LOGOS
-- ============================================================

CREATE POLICY "brand_logos_select_public"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'brand-logos');

CREATE POLICY "brand_logos_insert_own"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'brand-logos'
        AND auth.uid()::TEXT = (storage.foldername(name))[1]
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'brand'
        )
    );

CREATE POLICY "brand_logos_update_own"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'brand-logos'
        AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );

CREATE POLICY "brand_logos_delete_own"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'brand-logos'
        AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );


-- ============================================================
-- 4. STORAGE POLICIES: CAMPAIGN MEDIA
-- ============================================================

CREATE POLICY "campaign_media_select_public"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'campaign-media');

-- Brands can upload campaign media for their own campaigns
CREATE POLICY "campaign_media_insert_brand"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'campaign-media'
        AND (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role IN ('brand', 'admin')
            )
        )
    );

-- Admins can manage all campaign media
CREATE POLICY "campaign_media_admin"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'campaign-media'
        AND public.is_admin()
    );


-- ============================================================
-- 5. STORAGE POLICIES: PORTFOLIOS
-- ============================================================

CREATE POLICY "portfolios_select_public"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'portfolios');

-- Influencers can upload to their own portfolio folder
CREATE POLICY "portfolios_insert_own"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'portfolios'
        AND auth.uid()::TEXT = (storage.foldername(name))[1]
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'influencer'
        )
    );

CREATE POLICY "portfolios_update_own"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'portfolios'
        AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );

CREATE POLICY "portfolios_delete_own"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'portfolios'
        AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );


-- ============================================================
-- 6. STORAGE POLICIES: BLOG IMAGES
-- ============================================================

CREATE POLICY "blog_images_select_public"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'blog-images');

-- Only admins can manage blog images
CREATE POLICY "blog_images_insert_admin"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'blog-images'
        AND public.is_admin()
    );

CREATE POLICY "blog_images_update_admin"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'blog-images'
        AND public.is_admin()
    );

CREATE POLICY "blog_images_delete_admin"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'blog-images'
        AND public.is_admin()
    );
