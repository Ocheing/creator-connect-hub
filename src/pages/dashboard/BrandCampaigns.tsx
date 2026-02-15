import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Plus, Briefcase, Users, DollarSign, Calendar, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const campaigns = [
  {
    id: "1",
    name: "Summer Product Launch",
    status: "active",
    budget: "KSh 390,000",
    spent: 65,
    influencers: 5,
    maxInfluencers: 8,
    applications: 12,
    startDate: "Feb 1, 2024",
    endDate: "Mar 15, 2024",
    platforms: ["Instagram", "TikTok"],
  },
  {
    id: "2",
    name: "Holiday Gift Guide",
    status: "draft",
    budget: "KSh 325,000",
    spent: 0,
    influencers: 0,
    maxInfluencers: 10,
    applications: 0,
    startDate: "Mar 1, 2024",
    endDate: "Apr 15, 2024",
    platforms: ["Instagram", "YouTube"],
  },
  {
    id: "3",
    name: "Brand Awareness Q1",
    status: "completed",
    budget: "KSh 650,000",
    spent: 100,
    influencers: 8,
    maxInfluencers: 8,
    applications: 25,
    startDate: "Jan 1, 2024",
    endDate: "Feb 1, 2024",
    platforms: ["Instagram", "TikTok", "YouTube"],
  },
  {
    id: "4",
    name: "New Product Teaser",
    status: "active",
    budget: "KSh 200,000",
    spent: 30,
    influencers: 3,
    maxInfluencers: 5,
    applications: 8,
    startDate: "Feb 10, 2024",
    endDate: "Mar 10, 2024",
    platforms: ["TikTok"],
  },
];

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  draft: "bg-muted text-muted-foreground",
  completed: "bg-blue-100 text-blue-700",
  paused: "bg-yellow-100 text-yellow-700",
};

const BrandCampaigns = () => {
  return (
    <DashboardLayout userType="brand">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">Campaigns</h1>
            <p className="text-muted-foreground">Create and manage your influencer campaigns.</p>
          </div>
          <Button variant="coral">
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({campaigns.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({campaigns.filter(c => c.status === "active").length})</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {["all", "active", "draft", "completed"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="space-y-4">
                {campaigns
                  .filter((c) => tab === "all" || c.status === tab)
                  .map((campaign, index) => (
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
                                <h3 className="font-semibold text-lg">{campaign.name}</h3>
                                <Badge className={`border-0 ${statusColors[campaign.status]}`}>
                                  {campaign.status}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" /> {campaign.budget}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" /> {campaign.influencers}/{campaign.maxInfluencers} influencers
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" /> {campaign.startDate} — {campaign.endDate}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                {campaign.platforms.map((p) => (
                                  <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                                ))}
                              </div>
                              <div className="max-w-md">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Budget Spent</span>
                                  <span>{campaign.spent}%</span>
                                </div>
                                <Progress value={campaign.spent} className="h-2" />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">View Details</Button>
                              <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BrandCampaigns;
