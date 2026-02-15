import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Users, Briefcase, DollarSign, TrendingUp, ArrowUpRight, Eye, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { dashboardService, campaignService } from "@/services/api";
import { Link } from "react-router-dom";

const BrandDashboard = () => {
  const { user, profile } = useAuth();
  const userId = user?.id;

  // Fetch Dashboard Stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['brandStats', userId],
    queryFn: () => dashboardService.getBrandStats(userId!),
    enabled: !!userId,
    refetchInterval: 5000, // Real-time polling
  });

  // Fetch Campaigns
  const { data: campaignsData, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['brandCampaigns', userId],
    queryFn: () => campaignService.getCampaigns({ brandId: userId, pageSize: 5 }),
    enabled: !!userId,
  });

  const campaigns = campaignsData?.data || [];

  if (isLoadingStats || isLoadingCampaigns) {
    return (
      <DashboardLayout userType="brand">
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-coral" />
        </div>
      </DashboardLayout>
    );
  }

  const statItems = [
    {
      label: "Active Campaigns",
      value: (stats?.active_campaigns || 0).toString(),
      change: "Current",
      icon: Briefcase,
    },
    {
      label: "Matched Influencers",
      value: (stats?.matched_influencers || 0).toString(),
      change: "Total",
      icon: Users,
    },
    {
      label: "Total Spent",
      value: `KSh ${(stats?.total_spent || 0).toLocaleString()}`,
      change: "Lifetime",
      icon: DollarSign,
    },
    {
      label: "Avg. Engagement",
      value: `${(stats?.avg_engagement || 0)}%`,
      change: "Campaigns",
      icon: TrendingUp,
    },
  ];

  return (
    <DashboardLayout userType="brand">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">Brand Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your influencer campaigns and partnerships.
            </p>
          </div>
          <Button variant="coral" asChild>
            <Link to="/dashboard/campaigns/new">Create New Campaign</Link>
          </Button>
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
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
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
          {/* Campaigns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Campaigns</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard/campaigns">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {campaigns.length > 0 ? (
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="p-4 rounded-xl bg-muted/50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium">{campaign.title}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>{campaign.matched_influencers || 0} influencers</span>
                              <span>•</span>
                              <span>{campaign.target_platforms?.join(", ") || "All Platforms"}</span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === "active"
                            ? "bg-green-100 text-green-700"
                            : campaign.status === "draft"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-muted text-muted-foreground"
                            }`}>
                            {campaign.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Budget: KSh {campaign.budget.toLocaleString()}
                          </span>
                          <span>{Math.round(((campaign.budget_spent || 0) / campaign.budget) * 100)}% spent</span>
                        </div>
                        <Progress value={((campaign.budget_spent || 0) / campaign.budget) * 100} className="h-2 mt-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No campaigns found. Create your first campaign!
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Guide / placeholder for Matched Influencers since we are simplifying */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/dashboard/search">
                    <Eye className="w-4 h-4 mr-2" />
                    Browse Influencers
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/dashboard/messages">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Messages
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BrandDashboard;
