import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Briefcase, Users, DollarSign, Calendar, Loader2, Filter, Tag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { campaignService, categoryService } from "@/services/api";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import type { Category } from "@/types/database.types";

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
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Fetch campaigns
  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ['brandCampaignsAll', userId],
    queryFn: () => campaignService.getCampaigns({ brandId: userId, pageSize: 100 }),
    enabled: !!userId,
  });

  // Fetch all categories for filter chips
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories(true),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch campaign→category mappings for all campaigns
  const campaigns = useMemo(() => campaignsData?.data || [], [campaignsData]);
  const campaignIds = useMemo(() => campaigns.map(c => c.id), [campaigns]);

  const { data: campaignCategoriesMap = {} } = useQuery({
    queryKey: ['campaign-categories-map', campaignIds.join(',')],
    queryFn: async () => {
      if (campaignIds.length === 0) return {};
      // Fetch all campaign categories in a single batched API call to prevent N+1 query waterfall
      return await categoryService.getCampaignCategoriesBatch(campaignIds);
    },
    enabled: campaignIds.length > 0,
    staleTime: 2 * 60 * 1000,
  });

  // Collect all category names used by campaigns for filter chips
  const usedCategories = useMemo(() => {
    const names = new Set<string>();
    Object.values(campaignCategoriesMap).forEach(cats => {
      cats.forEach(c => names.add(c.name));
    });
    return Array.from(names).sort();
  }, [campaignCategoriesMap]);

  // Filter campaigns by status and category
  const filteredCampaigns = useMemo(() => {
    let result = campaigns;

    // Status filter
    if (activeTab !== "all") {
      result = result.filter(c => c.status === activeTab);
    }

    // Category filter
    if (selectedCategoryFilter) {
      result = result.filter(c => {
        const cats = campaignCategoriesMap[c.id] || [];
        return cats.some(cat => cat.name === selectedCategoryFilter);
      });
    }

    return result;
  }, [campaigns, activeTab, selectedCategoryFilter, campaignCategoriesMap]);

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

          {/* Category filter chips */}
          {usedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
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
                All Categories
              </Button>
              {usedCategories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategoryFilter === cat ? "default" : "outline"}
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
                  <Tag className="w-3 h-3 mr-1" />
                  {cat}
                </Button>
              ))}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((campaign, index) => {
                  const campaignCategories = campaignCategoriesMap[campaign.id] || [];
                  return (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      layout
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

                              {/* Platform + Category badges */}
                              <div className="flex flex-wrap gap-2">
                                {campaign.target_platforms && campaign.target_platforms.map((p) => (
                                  <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                                ))}
                                {campaignCategories.map((cat) => (
                                  <Badge
                                    key={cat.id}
                                    className="bg-coral/10 text-coral border-coral/20 text-xs"
                                  >
                                    <Tag className="w-3 h-3 mr-1" />
                                    {cat.name}
                                  </Badge>
                                ))}
                              </div>

                              <div className="max-w-md w-full">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Budget Spent</span>
                                  <span>
                                    {campaign.budget > 0
                                      ? Math.round(((campaign.budget_spent || 0) / campaign.budget) * 100)
                                      : 0}%
                                  </span>
                                </div>
                                <Progress
                                  value={campaign.budget > 0
                                    ? ((campaign.budget_spent || 0) / campaign.budget) * 100
                                    : 0}
                                  className="h-2"
                                />
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
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed"
                >
                  <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>
                    {selectedCategoryFilter
                      ? `No campaigns found in "${selectedCategoryFilter}" category.`
                      : "No campaigns found in this category."
                    }
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BrandCampaigns;
