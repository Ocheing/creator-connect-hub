import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Plus, Briefcase, Users, DollarSign, Calendar, MoreVertical, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { campaignService } from "@/services/api";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useState } from "react";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  draft: "bg-muted text-muted-foreground",
  completed: "bg-blue-100 text-blue-700",
  paused: "bg-yellow-100 text-yellow-700",
  planning: "bg-yellow-100 text-yellow-700",
};

const BrandCampaigns = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const [activeTab, setActiveTab] = useState("all");

  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ['brandCampaignsAll', userId],
    queryFn: () => campaignService.getCampaigns({ brandId: userId, pageSize: 100 }),
    enabled: !!userId,
  });

  const campaigns = campaignsData?.data || [];

  const filteredCampaigns = campaigns.filter(c => {
    if (activeTab === "all") return true;
    return c.status === activeTab;
  });

  if (isLoading) {
    return (
      <DashboardLayout userType="brand">
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-coral" />
        </div>
      </DashboardLayout>
    );
  }

  // Helper to count campaigns by status
  const getCount = (status: string) => {
    if (status === 'all') return campaigns.length;
    return campaigns.filter(c => c.status === status).length;
  };

  return (
    <DashboardLayout userType="brand">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">Campaigns</h1>
            <p className="text-muted-foreground">Create and manage your influencer campaigns.</p>
          </div>
          <Button variant="coral" asChild>
            <Link to="/dashboard/campaigns/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({getCount('all')})</TabsTrigger>
            <TabsTrigger value="active">Active ({getCount('active')})</TabsTrigger>
            <TabsTrigger value="draft">Drafts ({getCount('draft')})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({getCount('completed')})</TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-4">
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{campaign.title}</h3>
                            <Badge className={`border-0 ${statusColors[campaign.status] || "bg-muted"}`}>
                              {campaign.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" /> KSh {campaign.budget.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" /> {campaign.matched_influencers || 0}/{campaign.max_influencers} influencers
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {campaign.start_date ? format(new Date(campaign.start_date), 'MMM d') : 'TBD'} —
                              {campaign.end_date ? format(new Date(campaign.end_date), 'MMM d, yyyy') : 'TBD'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {campaign.target_platforms && campaign.target_platforms.map((p) => (
                              <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                            ))}
                          </div>
                          <div className="max-w-md w-full">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Budget Spent</span>
                              <span>{Math.round(((campaign.budget_spent || 0) / campaign.budget) * 100)}%</span>
                            </div>
                            <Progress value={((campaign.budget_spent || 0) / campaign.budget) * 100} className="h-2" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/dashboard/campaigns/${campaign.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No campaigns found in this category.</p>
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BrandCampaigns;
