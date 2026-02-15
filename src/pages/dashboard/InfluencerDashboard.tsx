import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { DollarSign, Briefcase, TrendingUp, Clock, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { dashboardService, matchService, influencerService } from "@/services/api";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const InfluencerDashboard = () => {
    const { user, profile } = useAuth();
    const userId = user?.id;

    // Fetch Dashboard Stats
    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['influencerStats', userId],
        queryFn: () => dashboardService.getInfluencerStats(userId!),
        enabled: !!userId,
        refetchInterval: 5000, // Real-time polling
    });

    // Fetch Influencer Profile (for engagement & completion)
    const { data: influencerProfile, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['influencerProfile', userId],
        queryFn: () => influencerService.getInfluencerProfile(userId!),
        enabled: !!userId,
    });

    // Fetch Recent Deals (Matches)
    const { data: recentDeals, isLoading: isLoadingDeals } = useQuery({
        queryKey: ['recentDeals', userId],
        queryFn: () => matchService.getMatches({ influencerId: userId, status: 'active' }),
        enabled: !!userId,
    });

    if (isLoadingStats || isLoadingProfile || isLoadingDeals) {
        return (
            <DashboardLayout userType="influencer">
                <div className="flex items-center justify-center h-full min-h-[50vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-coral" />
                </div>
            </DashboardLayout>
        );
    }

    const statItems = [
        {
            label: "Total Earnings",
            value: `KSh ${(stats?.total_earnings || 0).toLocaleString()}`,
            change: "Lifetime",
            trend: "up",
            icon: DollarSign,
        },
        {
            label: "Active Deals",
            value: (stats?.active_deals || 0).toString(),
            change: "Current",
            trend: "neutral",
            icon: Briefcase,
        },
        {
            label: "Avg. Engagement",
            value: `${(influencerProfile?.engagement_rate || 0)}%`,
            change: "Last 30 days",
            trend: "up", // dynamic calculation would require historical data
            icon: TrendingUp,
        },
        {
            label: "Pending Earnings",
            value: `KSh ${(stats?.pending_earnings || 0).toLocaleString()}`,
            change: "Processing",
            trend: "neutral",
            icon: Clock,
        },
    ];

    return (
        <DashboardLayout userType="influencer">
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-heading font-bold mb-2">Welcome back, {profile?.full_name?.split(' ')[0] || 'Creator'}! 👋</h1>
                    <p className="text-muted-foreground">
                        Here's what's happening with your brand partnerships.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statItems.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center">
                                            <stat.icon className="w-6 h-6 text-coral" />
                                        </div>
                                        <div className={`flex items-center gap-1 text-sm text-muted-foreground`}>
                                            <ArrowUpRight className="w-4 h-4" />
                                            {stat.change}
                                        </div>
                                    </div>
                                    <p className="text-3xl font-heading font-bold mb-1">{stat.value}</p>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Recent Deals */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2"
                    >
                        <Card className="h-full">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Recent Deals</CardTitle>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link to="/dashboard/deals">View All</Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {recentDeals && recentDeals.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentDeals.slice(0, 5).map((deal) => (
                                            <div
                                                key={deal.id}
                                                className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center">
                                                        <Briefcase className="w-5 h-5 text-coral" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">Campaign #{deal.campaign_id.slice(0, 8)}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Started: {deal.started_at ? format(new Date(deal.started_at), 'MMM d, yyyy') : 'Pending'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">KSh {deal.agreed_rate.toLocaleString()}</p>
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        deal.status === "active"
                                                            ? "bg-green-100 text-green-700"
                                                            : deal.status === "proposed"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-muted text-muted-foreground"
                                                    }`}>
                                                        {deal.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No active deals found. Start applying to campaigns!
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Profile Completion */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Profile Completion</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">{influencerProfile?.profile_completion_pct || 0}% Complete</span>
                                        {/* <span className="text-sm text-muted-foreground">3 tasks left</span> */}
                                    </div>
                                    <Progress value={influencerProfile?.profile_completion_pct || 0} className="h-2" />
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                            (influencerProfile?.niche?.length ?? 0) > 0 ? 'bg-green-100' : 'border-2 border-coral'
                                        }`}>
                                            {(influencerProfile?.niche?.length ?? 0) > 0 ? (
                                                <span className="text-green-600 text-xs">✓</span>
                                            ) : (
                                                <span className="text-coral text-xs">!</span>
                                            )}
                                        </div>
                                        <span className={(influencerProfile?.niche?.length ?? 0) > 0 ? "text-muted-foreground" : ""}>
                                            Select Niche & Categories
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                            influencerProfile?.primary_platform ? 'bg-green-100' : 'border-2 border-coral'
                                        }`}>
                                            {influencerProfile?.primary_platform ? (
                                                <span className="text-green-600 text-xs">✓</span>
                                            ) : (
                                                <span className="text-coral text-xs">!</span>
                                            )}
                                        </div>
                                        <span className={influencerProfile?.primary_platform ? "text-muted-foreground" : ""}>
                                            Connect Social Accounts
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                            (influencerProfile?.portfolio_urls?.length ?? 0) > 0 ? 'bg-green-100' : 'border-2 border-coral'
                                        }`}>
                                            {(influencerProfile?.portfolio_urls?.length ?? 0) > 0 ? (
                                                <span className="text-green-600 text-xs">✓</span>
                                            ) : (
                                                <span className="text-coral text-xs">!</span>
                                            )}
                                        </div>
                                        <span className={(influencerProfile?.portfolio_urls?.length ?? 0) > 0 ? "text-muted-foreground" : ""}>
                                            Add Portfolio Examples
                                        </span>
                                    </div>
                                </div>

                                <Button variant="coral" className="w-full" asChild>
                                    <Link to="/dashboard/settings">Complete Profile</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InfluencerDashboard;
