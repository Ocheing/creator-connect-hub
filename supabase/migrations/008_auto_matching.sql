-- ============================================================
-- MicroMatch: Migration 008 — Auto-Matching Influencers
-- ============================================================

-- ============================================================
-- MATCHING FUNCTION — Get influencers matching a campaign
-- ============================================================
-- Returns influencers that share at least one category with the 
-- given campaign, ranked by match score (overlapping categories),
-- engagement rate, and total followers.
-- Excludes influencers who already have a match (proposed/accepted etc)
-- or application for this campaign.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_matching_influencers(
    p_campaign_id UUID,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    influencer_id UUID,
    full_name TEXT,
    avatar_url TEXT,
    instagram_handle TEXT,
    tiktok_handle TEXT,
    youtube_handle TEXT,
    twitter_handle TEXT,
    total_followers INTEGER,
    engagement_rate DECIMAL,
    match_score BIGINT,
    matching_categories TEXT[],
    total_influencer_categories BIGINT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS influencer_id,
        p.full_name,
        p.avatar_url,
        ip.instagram_handle,
        ip.tiktok_handle,
        ip.youtube_handle,
        ip.twitter_handle,
        ip.total_followers,
        ip.engagement_rate,
        COUNT(DISTINCT cc.category_id) AS match_score,
        ARRAY_AGG(DISTINCT cat.name) AS matching_categories,
        (SELECT COUNT(*) FROM influencer_categories ic2 WHERE ic2.influencer_id = p.id) AS total_influencer_categories
    FROM profiles p
    INNER JOIN influencer_profiles ip ON ip.profile_id = p.id
    -- Match with influencer categories
    INNER JOIN influencer_categories ic ON ic.influencer_id = p.id
    -- Match with campaign categories
    INNER JOIN campaign_categories cc ON cc.category_id = ic.category_id
        AND cc.campaign_id = p_campaign_id
    -- Get category names for the matched categories
    INNER JOIN categories cat ON cat.id = cc.category_id
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
    GROUP BY 
        p.id, p.full_name, p.avatar_url, 
        ip.instagram_handle, ip.tiktok_handle, ip.youtube_handle, ip.twitter_handle, 
        ip.total_followers, ip.engagement_rate
    ORDER BY 
        match_score DESC, 
        ip.engagement_rate DESC NULLS LAST, 
        ip.total_followers DESC NULLS LAST
    LIMIT p_limit;
END;
$$;
