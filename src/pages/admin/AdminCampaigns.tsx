import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Briefcase, Users, DollarSign, Calendar, Eye, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const campaigns = [
  { id: "1", name: "Summer Product Launch", brand: "Organic Skincare Co.", status: "active", budget: "KSh 390,000", spent: 65, influencers: 5, applications: 12, startDate: "Feb 1", endDate: "Mar 15" },
  { id: "2", name: "New Product Teaser", brand: "TechStart App", status: "active", budget: "KSh 200,000", spent: 30, influencers: 3, applications: 8, startDate: "Feb 10", endDate: "Mar 10" },
  { id: "3", name: "Fitness Challenge", brand: "FitLife Supplements", status: "pending_approval", budget: "KSh 500,000", spent: 0, influencers: 0, applications: 0, startDate: "Mar 1", endDate: "Apr 1" },
  { id: "4", name: "Brand Awareness Q1", brand: "GreenHome Kenya", status: "completed", budget: "KSh 650,000", spent: 100, influencers: 8, applications: 25, startDate: "Jan 1", endDate: "Feb 1" },
  { id: "5", name: "Holiday Gift Guide", brand: "Craft Market KE", status: "draft", budget: "KSh 325,000", spent: 0, influencers: 0, applications: 0, startDate: "Mar 1", endDate: "Apr 15" },
];

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending_approval: "bg-yellow-100 text-yellow-700",
  completed: "bg-blue-100 text-blue-700",
  draft: "bg-muted text-muted-foreground",
  paused: "bg-orange-100 text-orange-700",
};

const AdminCampaigns = () => {
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Campaign Management</h1>
          <p className="text-muted-foreground">View and manage all platform campaigns.</p>
        </div>

        <div className="grid sm:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{campaigns.length}</p><p className="text-xs text-muted-foreground">Total Campaigns</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{campaigns.filter(c => c.status === "active").length}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{campaigns.filter(c => c.status === "pending_approval").length}</p><p className="text-xs text-muted-foreground">Pending Approval</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{campaigns.filter(c => c.status === "completed").length}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending_approval">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {["all", "active", "pending_approval", "completed"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="space-y-4">
                {campaigns
                  .filter(c => tab === "all" || c.status === tab)
                  .map((campaign, index) => (
                    <motion.div key={campaign.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">{campaign.name}</h3>
                                <Badge className={`border-0 ${statusColors[campaign.status]}`}>
                                  {campaign.status.replace("_", " ")}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground">Brand: {campaign.brand}</p>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{campaign.budget}</span>
                                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{campaign.influencers} influencers</span>
                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{campaign.startDate} — {campaign.endDate}</span>
                                <span>{campaign.applications} applications</span>
                              </div>
                              {campaign.spent > 0 && (
                                <div className="max-w-sm">
                                  <div className="flex justify-between text-xs mb-1"><span>Budget Used</span><span>{campaign.spent}%</span></div>
                                  <Progress value={campaign.spent} className="h-1.5" />
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {campaign.status === "pending_approval" && (
                                <>
                                  <Button size="sm" variant="coral">Approve</Button>
                                  <Button size="sm" variant="outline">Reject</Button>
                                </>
                              )}
                              <Button size="sm" variant="outline"><Eye className="w-4 h-4 mr-1" />View</Button>
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

export default AdminCampaigns;
