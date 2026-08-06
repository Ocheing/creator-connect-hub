import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Sparkles,
    Calendar,
    DollarSign,
    Users,
    Tag,
    ExternalLink,
    Filter,
    Loader2,
    Briefcase,
    TrendingUp,
    ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { categoryService } from "@/services/api";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import type { MatchingCampaign } from "@/types/database.types";

const InfluencerDiscover = () => {
    const { user } = useAuth();
    const [search, setSearch] = useState("");
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

    const queryClient = useQueryClient();

    // Fetch matching campaigns via RPC
    const { data: campaigns = [], isLoading } = useQuery({
        queryKey: ["matching-campaigns", user?.id],
        queryFn: () => categoryService.getMatchingCampaigns(user!.id, 1, 50),
        enabled: !!user,
    });

    // Real-time subscription for newly published campaigns
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('discover-campaigns-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'campaigns',
                    filter: `status=eq.active`,
                },
                () => {
                    // Refetch campaigns when a new one is published or updated
                    queryClient.invalidateQueries({ queryKey: ["matching-campaigns", user.id] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient]);

    // Fetch user categories for filter chips
    const { data: userCategories = [] } = useQuery({
        queryKey: ["influencer-categories", user?.id],
        queryFn: () => categoryService.getInfluencerCategories(user!.id),
        enabled: !!user,
    });

    // Filter campaigns
    const filtered = useMemo(() => {
        let result = campaigns;

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (c) =>
                    c.title.toLowerCase().includes(q) ||
                    (c.brand_name || "").toLowerCase().includes(q) ||
                    c.matching_categories.some((cat) => cat.toLowerCase().includes(q))
            );
        }

        if (selectedCategoryFilter) {
            result = result.filter((c) =>
                c.matching_categories.includes(selectedCategoryFilter)
            );
        }

        return result;
    }, [campaigns, search, selectedCategoryFilter]);

    // Top stats
    const stats = useMemo(() => {
        const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
        const avgScore =
            campaigns.length > 0
                ? (
                    campaigns.reduce((sum, c) => sum + c.match_score, 0) /
                    campaigns.length
                ).toFixed(1)
                : "0";
        return {
            totalMatches: campaigns.length,
            totalBudget,
            avgScore,
        };
    }, [campaigns]);

    // Unique matching categories for filter chips
    const allMatchingCategories = useMemo(() => {
        const categories = new Set<string>();
        campaigns.forEach((c) =>
            c.matching_categories.forEach((cat) => categories.add(cat))
        );
        return Array.from(categories).sort();
    }, [campaigns]);

    if (isLoading) {
        return (
            <DashboardLayout userType="influencer">
                <div className="flex items-center justify-center h-[50vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-coral" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userType="influencer">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-coral flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-3xl font-heading font-bold">
                                Discover Campaigns
                            </h1>
                        </div>
                        <p className="text-muted-foreground">
                            Campaigns matched to your selected categories · Sorted by
                            relevance
                        </p>
                    </div>
                    <div className="relative sm:max-w-xs w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search campaigns..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid sm:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-coral" />
                            </div>
                            <div>
                                <p className="text-2xl font-heading font-bold">
                                    {stats.totalMatches}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Matched Campaigns
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-heading font-bold">
                                    {formatCurrency(stats.totalBudget)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Available Budget
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-heading font-bold">
                                    {stats.avgScore}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Avg. Match Score
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* No categories setup nudge */}
                {userCategories.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border-coral/30 bg-coral/5">
                            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-coral/10 flex items-center justify-center shrink-0">
                                    <Tag className="w-7 h-7 text-coral" />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="font-semibold text-lg mb-1">
                                        Set Your Categories
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
                                        Select your niche categories in settings to get matched with
                                        relevant campaigns from brands.
                                    </p>
                                </div>
                                <Button variant="coral" asChild>
                                    <Link to="/dashboard/settings">
                                        Go to Settings
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Category filter chips */}
                {allMatchingCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={selectedCategoryFilter === null ? "default" : "outline"}
                            size="sm"
                            className={`rounded-full text-xs ${selectedCategoryFilter === null
                                    ? "bg-coral hover:bg-coral/90 text-white"
                                    : ""
                                }`}
                            onClick={() => setSelectedCategoryFilter(null)}
                        >
                            <Filter className="w-3 h-3 mr-1" />
                            All
                        </Button>
                        {allMatchingCategories.map((cat) => (
                            <Button
                                key={cat}
                                variant={
                                    selectedCategoryFilter === cat ? "default" : "outline"
                                }
                                size="sm"
                                className={`rounded-full text-xs ${selectedCategoryFilter === cat
                                        ? "bg-coral hover:bg-coral/90 text-white"
                                        : ""
                                    }`}
                                onClick={() =>
                                    setSelectedCategoryFilter(
                                        selectedCategoryFilter === cat ? null : cat
                                    )
                                }
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                )}

                {/* Campaign Cards */}
                <AnimatePresence mode="popLayout">
                    {filtered.length > 0 ? (
                        <div className="space-y-4">
                            {filtered.map((campaign, index) => (
                                <CampaignMatchCard
                                    key={campaign.campaign_id}
                                    campaign={campaign}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16"
                        >
                            <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="font-semibold text-lg">
                                {search || selectedCategoryFilter
                                    ? "No campaigns match your filters"
                                    : "No matching campaigns yet"}
                            </h3>
                            <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                                {search || selectedCategoryFilter
                                    ? "Try adjusting your search or clearing filters."
                                    : "When brands post campaigns matching your categories, they'll appear here."}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

// ── Individual campaign card ──────────────────────────────
function CampaignMatchCard({
    campaign,
    index,
}: {
    campaign: MatchingCampaign;
    index: number;
}) {
    const matchPercent = campaign.total_categories > 0
        ? Math.round((campaign.match_score / campaign.total_categories) * 100)
        : 0;
    const spotsLeft = campaign.max_influencers - campaign.matched_influencers;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: index * 0.04 }}
            layout
        >
            <Card className="hover:shadow-md transition-shadow group">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        {/* Left: Info */}
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                                {/* Brand avatar */}
                                <div className="w-11 h-11 rounded-xl bg-coral/10 flex items-center justify-center overflow-hidden shrink-0">
                                    {campaign.brand_logo ? (
                                        <img
                                            src={campaign.brand_logo}
                                            alt={campaign.brand_name || "Brand"}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="font-bold text-coral">
                                            {campaign.brand_name?.[0]?.toUpperCase() || "B"}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg group-hover:text-coral transition-colors">
                                        {campaign.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        by {campaign.brand_name || "Unknown Brand"}
                                    </p>
                                </div>
                            </div>

                            {campaign.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {campaign.description}
                                </p>
                            )}

                            {/* Meta info */}
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    {formatCurrency(campaign.budget)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {spotsLeft > 0
                                        ? `${spotsLeft} spot${spotsLeft > 1 ? "s" : ""} left`
                                        : "Full"}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {campaign.application_deadline
                                        ? `Apply by ${format(
                                            new Date(campaign.application_deadline),
                                            "MMM d"
                                        )}`
                                        : campaign.start_date
                                            ? `Starts ${format(
                                                new Date(campaign.start_date),
                                                "MMM d"
                                            )}`
                                            : "Flexible dates"}
                                </span>
                            </div>

                            {/* Platforms */}
                            {campaign.target_platforms &&
                                campaign.target_platforms.length > 0 && (
                                    <div className="flex gap-2">
                                        {campaign.target_platforms.map((p) => (
                                            <Badge
                                                key={p}
                                                variant="outline"
                                                className="text-xs capitalize"
                                            >
                                                {p}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                            {/* Category match badges */}
                            <div className="flex flex-wrap gap-1.5">
                                {campaign.matching_categories.map((cat) => (
                                    <Badge
                                        key={cat}
                                        className="bg-coral/10 text-coral border-coral/20 text-xs"
                                    >
                                        <Tag className="w-3 h-3 mr-1" />
                                        {cat}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Right: Match score + action */}
                        <div className="flex flex-row lg:flex-col items-center lg:items-end gap-4 lg:gap-3 shrink-0">
                            {/* Match score */}
                            <div className="text-center lg:text-right">
                                <div className="flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-coral" />
                                    <span className="text-xl font-heading font-bold text-coral">
                                        {matchPercent}%
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">Match</p>
                                <Progress
                                    value={matchPercent}
                                    className="h-1.5 w-20 mt-1"
                                />
                            </div>

                            {/* Apply button */}
                            <Button
                                variant="coral"
                                size="sm"
                                disabled={spotsLeft <= 0}
                                asChild={spotsLeft > 0}
                            >
                                {spotsLeft > 0 ? (
                                    <Link
                                        to={`/dashboard/campaigns/${campaign.campaign_id}`}
                                    >
                                        View & Apply
                                        <ExternalLink className="w-4 h-4 ml-1" />
                                    </Link>
                                ) : (
                                    <span>Campaign Full</span>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default InfluencerDiscover;
