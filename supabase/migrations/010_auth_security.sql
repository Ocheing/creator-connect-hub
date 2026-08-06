-- ============================================================
-- MicroMatch: Authentication and Security Improvements
-- Migration 010: Auth & Security
-- ============================================================

-- 1. Add username column to profiles and enforce uniqueness
ALTER TABLE public.profiles ADD COLUMN username TEXT;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);

-- 2. Update trigger to include username on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, role, full_name, email, username)
    VALUES (
        NEW.id,
        COALESCE(
            (NEW.raw_user_meta_data->>'role')::public.user_role,
            'influencer'
        ),
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email,
        NEW.raw_user_meta_data->>'username'
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

-- 3. Create RPC to check if username exists (used during signup)
CREATE OR REPLACE FUNCTION public.check_username_exists(p_username TEXT)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
    SELECT EXISTS(
        SELECT 1 FROM public.profiles WHERE username = p_username
    );
$$;

-- 4. Create RPC to check if email exists (used during signup)
CREATE OR REPLACE FUNCTION public.check_email_exists(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
    SELECT EXISTS(
        SELECT 1 FROM public.profiles WHERE email = p_email
    );
$$;

-- 5. Create RPC to safely get email by username (used during login)
-- This allows users to login using their username. The email is returned to the client 
-- to perform the actual Supabase Auth signInWithPassword call.
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
    SELECT email FROM public.profiles WHERE username = p_username;
$$;

-- 6. Security Audit Fix: rate_limit_tracker
-- Drop the overly permissive RLS policies and replace with system-only policies.
DROP POLICY IF EXISTS "rate_limit_insert_system" ON public.rate_limit_tracker;
DROP POLICY IF EXISTS "rate_limit_select_system" ON public.rate_limit_tracker;
DROP POLICY IF EXISTS "rate_limit_update_system" ON public.rate_limit_tracker;

-- Only admins can view rate limits directly from client, 
-- otherwise rate limits are updated securely via backend/RPCs bypassing RLS.
CREATE POLICY "rate_limit_select_admin" 
    ON public.rate_limit_tracker FOR SELECT 
    USING (public.is_admin());

CREATE POLICY "rate_limit_all_admin" 
    ON public.rate_limit_tracker FOR ALL 
    USING (public.is_admin());
