-- ============================================================
-- Migration 004: Admin Promotion System
-- Admins sign up as normal users (influencer/brand), then get
-- promoted to admin by an existing admin or via direct DB access.
-- ============================================================

-- ────────────────────────────────────────────────────────
-- 1. Promote a user to admin (only callable by admins)
-- ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.promote_to_admin(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Only existing admins can promote other users
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can promote users';
    END IF;

    -- Prevent self-promotion (already admin)
    IF p_user_id = auth.uid() THEN
        RAISE EXCEPTION 'You are already an admin';
    END IF;

    -- Check user exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Check user isn't already an admin
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND role = 'admin') THEN
        RAISE EXCEPTION 'User is already an admin';
    END IF;

    -- Promote the user
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = p_user_id;

    -- Log the action
    INSERT INTO public.transaction_log (
        entity_type, entity_id, action,
        old_status, new_status,
        metadata, performed_by
    ) VALUES (
        'payment', p_user_id, 'admin_promotion',
        'user', 'admin',
        jsonb_build_object('promoted_user_id', p_user_id),
        auth.uid()
    );

    -- Notify the promoted user
    INSERT INTO public.notifications (
        user_id, type, title, message, action_url
    ) VALUES (
        p_user_id,
        'system',
        'Admin Access Granted 🛡️',
        'You have been granted administrator privileges. You can now access the admin panel.',
        '/admin'
    );
END;
$$;

-- ────────────────────────────────────────────────────────
-- 2. Demote an admin back to their original role
-- ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.demote_admin(p_user_id UUID, p_new_role public.user_role DEFAULT 'influencer')
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can demote users';
    END IF;

    -- Prevent self-demotion
    IF p_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Cannot demote yourself';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND role = 'admin') THEN
        RAISE EXCEPTION 'User is not an admin';
    END IF;

    -- Cannot set role to admin via demotion
    IF p_new_role = 'admin' THEN
        RAISE EXCEPTION 'Use promote_to_admin instead';
    END IF;

    UPDATE public.profiles
    SET role = p_new_role
    WHERE id = p_user_id;
END;
$$;


-- ============================================================
-- FIRST ADMIN SETUP (SEED)
-- ============================================================
-- To make your first admin, run this SQL directly in the
-- Supabase SQL Editor AFTER creating a normal account:
--
--   UPDATE public.profiles
--   SET role = 'admin'
--   WHERE email = 'your-admin-email@example.com';
--
-- After that, the first admin can promote others via the
-- promote_to_admin() RPC function from the admin panel.
-- ============================================================
