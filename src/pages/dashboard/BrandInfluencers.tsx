import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Users, MessageSquare, ExternalLink, Loader2, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";
import type {
  CampaignMatch,
  Campaign,
  Profile,
  InfluencerProfile,
  MatchStatus,
} from "@/types/database.types";

// ── Extended type for joined match data ──────────────────
type ExtendedMatch = CampaignMatch & {
  campaign: Campaign;
  influencer_profile: Profile;
  influencer_details: InfluencerProfile | null;
};

// ── Status badge colours ─────────────────────────────────
const statusColors: Record<string, string> = {
  proposed: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-muted text-muted-foreground",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-700",
};

// ── Helper: format follower count ────────────────────────
function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

// ── Helper: get primary platform label ───────────────────
function platformLabel(platform: string): string {
  const map: Record<string, string> = {
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    twitter: "Twitter/X",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    other: "Other",
  };
  return map[platform] || platform;
}

const BrandInfluencers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // ── Fetch brand_id first (brand_profiles.id) ───────────
  const { data: brandProfile } = useQuery({
    queryKey: ["brand-profile-id", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("profile_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const brandId = brandProfile?.id;

  // ── Fetch matched influencers ──────────────────────────
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["brand-matches", brandId],
    queryFn: async () => {
      if (!brandId) return [];

      // Get all campaigns belonging to this brand
      const { data: campaigns, error: campError } = await supabase
        .from("campaigns")
        .select("id")
        .eq("brand_id", brandId);

      if (campError) throw campError;
      if (!campaigns || campaigns.length === 0) return [];

      const campaignIds = campaigns.map((c) => c.id);

      // Fetch matches for all brand campaigns
      const { data: matchData, error: matchError } = await supabase
        .from("campaign_matches")
        .select("*")
        .in("campaign_id", campaignIds)
        .order("created_at", { ascending: false });

      if (matchError) throw matchError;
      if (!matchData || matchData.length === 0) return [];

      // Collect unique influencer IDs and campaign IDs
      const influencerIds = [...new Set(matchData.map((m) => m.influencer_id))];
      const matchedCampaignIds = [...new Set(matchData.map((m) => m.campaign_id))];

      // Parallel fetch profiles, influencer details, and campaign titles
      const [profilesRes, influencerRes, campaignsRes] = await Promise.all([
        supabase.from("profiles").select("*").in("id", influencerIds),
        supabase.from("influencer_profiles").select("*").in("profile_id", influencerIds),
        supabase.from("campaigns").select("*").in("id", matchedCampaignIds),
      ]);

      const profilesMap = new Map(
        (profilesRes.data || []).map((p) => [p.id, p as Profile])
      );
      const influencerMap = new Map(
        (influencerRes.data || []).map((ip) => [ip.profile_id, ip as InfluencerProfile])
      );
      const campaignMap = new Map(
        (campaignsRes.data || []).map((c) => [c.id, c as Campaign])
      );

      // Assemble extended matches
      const extended: ExtendedMatch[] = matchData
        .map((m) => {
          const profile = profilesMap.get(m.influencer_id);
          const details = influencerMap.get(m.influencer_id) || null;
          const campaign = campaignMap.get(m.campaign_id);

          if (!profile || !campaign) return null;

          return {
            ...m,
            campaign,
            influencer_profile: profile,
            influencer_details: details,
          } as ExtendedMatch;
        })
        .filter(Boolean) as ExtendedMatch[];

      return extended;
    },
    enabled: !!brandId,
  });

  // ── Real-time subscription ─────────────────────────────
  useEffect(() => {
    if (!brandId) return;

    const channel = supabase
      .channel("brand-matches-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "campaign_matches",
        },
        () => {
          // Invalidate and refetch on any change to campaign_matches
          queryClient.invalidateQueries({ queryKey: ["brand-matches", brandId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [brandId, queryClient]);

  // ── Search filter ──────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return matches;
    const q = search.toLowerCase();
    return matches.filter(
      (m) =>
        m.influencer_profile.full_name.toLowerCase().includes(q) ||
        m.campaign.title.toLowerCase().includes(q) ||
        (m.influencer_details?.niche || []).some((n) => n.toLowerCase().includes(q)) ||
        (m.influencer_details?.primary_platform || "").toLowerCase().includes(q)
    );
  }, [matches, search]);

  // ── Stats ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const activeStatuses: MatchStatus[] = ["active", "accepted"];
    const activeCount = matches.filter((m) => activeStatuses.includes(m.status)).length;
    const totalEngagement = matches.reduce(
      (sum, m) => sum + (m.influencer_details?.engagement_rate || 0),
      0
    );
    const avgEngagement =
      matches.length > 0 ? (totalEngagement / matches.length).toFixed(1) : "0.0";

    return { activeCount, totalCount: matches.length, avgEngagement };
  }, [matches]);

  // ── Loading state ──────────────────────────────────────
  if (isLoading) {
    return (
      <DashboardLayout userType="brand">
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="brand">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">Matched Influencers</h1>
            <p className="text-muted-foreground">
              View and manage your influencer partnerships in real-time.
            </p>
          </div>
          <Input
            placeholder="Search influencers..."
            className="sm:max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-heading font-bold text-green-600">
                {stats.activeCount}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Active Partnerships</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-heading font-bold">{stats.totalCount}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Matched</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-heading font-bold text-coral">
                {stats.avgEngagement}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">Avg. Engagement</p>
            </CardContent>
          </Card>
        </div>

        {/* Influencer Cards */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <UserX className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg">
              {search ? "No influencers match your search" : "No matched influencers yet"}
            </h3>
            <p className="text-muted-foreground mt-1 max-w-md">
              {search
                ? "Try adjusting your search terms."
                : "When influencers are matched to your campaigns, they'll appear here in real-time."}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((match, index) => {
              const inf = match.influencer_details;
              const profile = match.influencer_profile;
              const niches = inf?.niche?.join(", ") || "General";
              const platform = inf ? platformLabel(inf.primary_platform) : "—";
              const followers = inf ? formatFollowers(inf.total_followers) : "—";
              const engagement = inf ? `${inf.engagement_rate.toFixed(1)}%` : "—";

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-full bg-coral/10 flex items-center justify-center overflow-hidden shrink-0">
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-semibold text-coral text-lg">
                              {profile.full_name?.[0]?.toUpperCase() || "?"}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{profile.full_name}</h3>
                            <Badge
                              className={`border-0 text-xs ${statusColors[match.status] || "bg-muted text-muted-foreground"}`}
                            >
                              {match.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {niches} • {platform}
                          </p>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                        <div className="bg-muted/50 rounded-lg p-2 text-center">
                          <p className="font-semibold">{followers}</p>
                          <p className="text-xs text-muted-foreground">Followers</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2 text-center">
                          <p className="font-semibold text-coral">{engagement}</p>
                          <p className="text-xs text-muted-foreground">Engagement</p>
                        </div>
                      </div>

                      {/* Campaign & Rate */}
                      <div className="mt-3 text-sm">
                        <p className="text-muted-foreground">
                          Campaign:{" "}
                          <span className="text-foreground">{match.campaign.title}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Rate:{" "}
                          <span className="font-semibold text-foreground">
                            {formatCurrency(match.agreed_rate)}
                          </span>
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BrandInfluencers;
