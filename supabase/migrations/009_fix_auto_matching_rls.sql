-- ============================================================
-- MicroMatch: Migration 009 — Fix Auto-Matching RLS
-- ============================================================
-- The auto-matching flow was broken because brand users cannot
-- INSERT into campaign_matches or notifications (admin-only RLS).
-- This migration creates a SECURITY DEFINER function that handles
-- the entire auto-match pipeline in a privileged context.
-- ============================================================

-- ============================================================
-- 1. SECURITY DEFINER: auto_match_campaign
-- ============================================================
-- Called by brands after publishing a campaign. Runs as superuser
-- so it can insert into campaign_matches and notifications even
-- though the caller is a brand (not an admin).
-- ============================================================

CREATE OR REPLACE FUNCTION public.auto_match_campaign(
    p_campaign_id UUID,
    p_brand_id UUID,
    p_title TEXT,
    p_limit INTEGER DEFAULT 50
)
RETURNS INTEGER  -- returns number of influencers matched
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_matched_count INTEGER := 0;
    v_influencer RECORD;
BEGIN
    -- Loop through matching influencers (same logic as get_matching_influencers)
    FOR v_influencer IN
        SELECT 
            p.id AS influencer_id
        FROM profiles p
        INNER JOIN influencer_profiles ip ON ip.profile_id = p.id
        INNER JOIN influencer_categories ic ON ic.influencer_id = p.id
        INNER JOIN campaign_categories cc ON cc.category_id = ic.category_id
            AND cc.campaign_id = p_campaign_id
        WHERE p.role = 'influencer' 
          AND p.is_active = TRUE
          AND ip.is_available = TRUE
          -- Exclude if a match already exists
          AND NOT EXISTS (
              SELECT 1 FROM campaign_matches cm 
              WHERE cm.campaign_id = p_campaign_id 
              AND cm.influencer_id = p.id
          )
          -- Exclude if an application already exists
          AND NOT EXISTS (
              SELECT 1 FROM campaign_applications ca 
              WHERE ca.campaign_id = p_campaign_id 
              AND ca.influencer_id = p.id
          )
        GROUP BY p.id, ip.engagement_rate, ip.total_followers
        ORDER BY 
            COUNT(DISTINCT cc.category_id) DESC, 
            ip.engagement_rate DESC NULLS LAST, 
            ip.total_followers DESC NULLS LAST
        LIMIT p_limit
    LOOP
        -- Insert match (invitation)
        INSERT INTO campaign_matches (campaign_id, influencer_id, status, matched_by)
        VALUES (p_campaign_id, v_influencer.influencer_id, 'proposed', p_brand_id)
        ON CONFLICT DO NOTHING;

        -- Insert notification for the influencer
        INSERT INTO notifications (user_id, type, title, message, action_url, metadata)
        VALUES (
            v_influencer.influencer_id,
            'campaign',
            'New Campaign Invitation',
            'You''ve been invited to apply for "' || p_title || '"! It matches your selected niches.',
            '/dashboard/discover/' || p_campaign_id,
            jsonb_build_object('campaign_id', p_campaign_id)
        );

        v_matched_count := v_matched_count + 1;
    END LOOP;

    RETURN v_matched_count;
END;
$$;

-- ============================================================
-- 2. Allow brands to UPDATE their own campaigns to 'active'
-- ============================================================
-- The existing campaigns_update_own_brand policy only allows
-- updates on draft/pending_approval campaigns.  We extend it
-- so that brands can also update an active campaign they own
-- (e.g. to pause, edit details, etc).
-- ============================================================

-- Drop old restrictive policy and replace with a broader one
DROP POLICY IF EXISTS "campaigns_update_own_brand" ON public.campaigns;

CREATE POLICY "campaigns_update_own_brand"
    ON public.campaigns FOR UPDATE
    USING (brand_id = auth.uid() AND status IN ('draft', 'pending_approval', 'active'))
    WITH CHECK (brand_id = auth.uid());
