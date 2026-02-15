import { useMemo, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, XCircle, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { CampaignApplication, Campaign, BrandProfile } from "@/types/database.types";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

// Extended type to include joined data
type ExtendedApplication = CampaignApplication & {
  campaign: Campaign & {
    brand: BrandProfile;
  };
};

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  pending: { icon: Clock, color: "text-yellow-700", bg: "bg-yellow-100" },
  approved: { icon: CheckCircle, color: "text-green-700", bg: "bg-green-100" },
  rejected: { icon: XCircle, color: "text-red-700", bg: "bg-red-100" },
  withdrawn: { icon: AlertCircle, color: "text-gray-700", bg: "bg-gray-100" },
};

const InfluencerApplications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch applications
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["influencer-applications", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("campaign_applications")
        .select(`
          *,
          campaign:campaigns(
            *,
            brand:brand_profiles(*)
          )
        `)
        .eq("influencer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ExtendedApplication[];
    },
    enabled: !!user,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('influencer-applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_applications',
          filter: `influencer_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["influencer-applications", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const stats = useMemo(() => {
    return [
      { label: "Total Applied", value: applications.length, color: "text-foreground" },
      { label: "Approved", value: applications.filter(a => a.status === "approved").length, color: "text-green-600" },
      { label: "Pending", value: applications.filter(a => a.status === "pending").length, color: "text-yellow-600" },
    ];
  }, [applications]);

  const handleWithdraw = async (id: string) => {
    try {
      const { error } = await supabase
        .from("campaign_applications")
        .update({ status: "withdrawn" })
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error withdrawing application:", error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userType="influencer">
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="influencer">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">My Applications</h1>
          <p className="text-muted-foreground">Track and manage your campaign applications.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6 text-center">
                <p className={`text-3xl font-heading font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          {["all", "pending", "approved", "rejected"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="space-y-4">
                {applications
                  .filter((a) => tab === "all" || a.status === tab)
                  .map((app, index) => {
                    const config = statusConfig[app.status] || statusConfig.pending;
                    const StatusIcon = config.icon;
                    return (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <h3 className="font-semibold text-lg">{app.campaign.title}</h3>
                                  <Badge className={`${config.bg} ${config.color} border-0`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {app.status}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground">{app.campaign.brand.company_name}</p>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                                  {app.proposed_rate && (
                                    <span>Rate: <strong className="text-foreground">{formatCurrency(app.proposed_rate)}</strong></span>
                                  )}
                                  {app.proposed_deliverables && (
                                    <span>Deliverables: {app.proposed_deliverables}</span>
                                  )}
                                  <span>Applied: {format(new Date(app.created_at), "MMM d, yyyy")}</span>
                                </div>
                                {app.rejection_reason && (
                                  <p className="text-sm text-red-600 mt-2 italic">
                                    Reason: {app.rejection_reason}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {/* Future: Link to campaign details page */}
                                <Button variant="outline" size="sm">
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  View Campaign
                                </Button>
                                {app.status === "pending" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleWithdraw(app.id)}
                                  >
                                    Withdraw
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                {applications.filter((a) => tab === "all" || a.status === tab).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No applications found in this category.
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

export default InfluencerApplications;
