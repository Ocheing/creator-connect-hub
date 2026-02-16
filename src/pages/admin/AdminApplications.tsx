import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { FileText, UserCheck, UserX, ExternalLink, Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { applicationService } from "@/services/api";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-gray-100 text-gray-700",
};

const AdminApplications = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: rawApplications, isLoading, refetch } = useQuery({
    queryKey: ['adminApplications'],
    queryFn: applicationService.getAdminApplications,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-applications-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaign_applications' },
        (payload) => {
          // toast.info("Applications updated"); // Optional: notify on update
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleReviewApplication = async (appId: string, status: 'approved' | 'rejected') => {
    if (!user) return;
    try {
      await applicationService.reviewApplication(appId, status, user.id);
      toast.success(`Application ${status}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update application");
    }
  };

  const applications = rawApplications?.map((app: any) => ({
    id: app.id,
    name: app.influencer?.full_name || 'Unknown',
    email: app.influencer?.email || '',
    platform: app.influencer?.influencer_profile?.primary_platform || 'N/A',
    followers: app.influencer?.influencer_profile?.total_followers ? app.influencer.influencer_profile.total_followers.toLocaleString() : 'N/A',
    engagement: app.influencer?.influencer_profile?.engagement_rate ? `${app.influencer.influencer_profile.engagement_rate}%` : 'N/A',
    niche: app.influencer?.influencer_profile?.niche?.[0] || 'General',
    campaign: app.campaign?.title || 'Unknown Campaign',
    appliedAt: formatDistanceToNow(new Date(app.created_at), { addSuffix: true }),
    status: app.status
  })) || [];

  const filteredApplications = applications.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.campaign.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-3xl font-heading font-bold mb-2">Application Reviews</h1>
            <p className="text-muted-foreground">Review and manage influencer campaign applications.</p>
          </div>
          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{applications.filter(a => a.status === "pending").length}</p><p className="text-xs text-muted-foreground">Pending Review</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{applications.filter(a => a.status === "approved").length}</p><p className="text-xs text-muted-foreground">Approved</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{applications.filter(a => a.status === "rejected").length}</p><p className="text-xs text-muted-foreground">Rejected</p></CardContent></Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          {["pending", "approved", "rejected", "all"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="space-y-4">
                {filteredApplications
                  .filter(a => tab === "all" || a.status === tab)
                  .map((app, index) => (
                    <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center shrink-0">
                                <span className="font-semibold text-coral">
                                  {app.name.split(" ").map((n: string) => n[0]).join("")}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <h3 className="font-semibold text-lg">{app.name}</h3>
                                  <Badge className={`border-0 ${statusColors[app.status]}`}>{app.status}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{app.email}</p>
                                <div className="flex flex-wrap gap-3 text-sm mt-2">
                                  <Badge variant="outline">{app.platform}</Badge>
                                  <span className="text-muted-foreground">{app.followers} followers</span>
                                  <span className="text-coral font-medium">{app.engagement} engagement</span>
                                  <span className="text-muted-foreground">Niche: {app.niche}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Campaign: <strong>{app.campaign}</strong> • Applied {app.appliedAt}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                              {app.status === "pending" && (
                                <>
                                  <Button size="sm" variant="coral" onClick={() => handleReviewApplication(app.id, 'approved')}>
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleReviewApplication(app.id, 'rejected')}>
                                    <UserX className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              <Button size="sm" variant="ghost">
                                <ExternalLink className="w-4 h-4 mr-1" />
                                View Profile
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                {filteredApplications.filter(a => tab === "all" || a.status === tab).length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    No applications found.
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

export default AdminApplications;
