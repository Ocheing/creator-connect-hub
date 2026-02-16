import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Briefcase, Users, DollarSign, Calendar, Eye, MoreVertical, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { campaignService } from "@/services/api";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending_approval: "bg-yellow-100 text-yellow-700",
  completed: "bg-blue-100 text-blue-700",
  draft: "bg-muted text-muted-foreground",
  paused: "bg-orange-100 text-orange-700",
};

const AdminCampaigns = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: rawCampaigns, isLoading, refetch } = useQuery({
    queryKey: ['adminCampaigns'],
    queryFn: campaignService.getAdminCampaigns,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-campaigns-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaigns' },
        (payload) => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const campaigns = rawCampaigns?.map((c: any) => ({
    id: c.id,
    name: c.title,
    brand: c.brand_profile?.company_name || 'Unknown Brand',
    status: c.status,
    budget: `KSh ${c.budget.toLocaleString()}`,
    budgetVal: c.budget,
    spent: c.budget > 0 ? ((c.budget_spent || 0) / c.budget) * 100 : 0,
    influencers: c.matched_influencers || 0,
    applications: c.applications?.[0]?.count || 0,
    startDate: c.start_date ? format(new Date(c.start_date), 'MMM d') : 'TBD',
    endDate: c.end_date ? format(new Date(c.end_date), 'MMM d') : 'TBD',
  })) || [];

  const filteredCampaigns = campaigns.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-coral" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">Campaign Management</h1>
            <p className="text-muted-foreground">View and manage all platform campaigns.</p>
          </div>
          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
                {filteredCampaigns
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
                                  <div className="flex justify-between text-xs mb-1"><span>Budget Used</span><span>{Math.round(campaign.spent)}%</span></div>
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
                {filteredCampaigns.filter(c => tab === "all" || c.status === tab).length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    No campaigns found.
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminCampaigns;
