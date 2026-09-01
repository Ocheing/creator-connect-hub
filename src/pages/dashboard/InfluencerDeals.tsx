import { useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Briefcase, Calendar, DollarSign, CheckCircle, Clock, Play, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { matchService } from "@/services/api";
import { CampaignMatch, Campaign, BrandProfile } from "@/types/database.types";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

// Extended type to include joined data
type ExtendedMatch = CampaignMatch & {
  campaign: Campaign & {
    brand: BrandProfile;
  };
};

const statusConfig: Record<string, { color: string; bg: string; icon: typeof Clock }> = {
  active: { color: "text-green-700", bg: "bg-green-100", icon: Play },
  completed: { color: "text-blue-700", bg: "bg-blue-100", icon: CheckCircle },
  proposed: { color: "text-yellow-700", bg: "bg-yellow-100", icon: Clock },
  accepted: { color: "text-purple-700", bg: "bg-purple-100", icon: CheckCircle },
  cancelled: { color: "text-red-700", bg: "bg-red-100", icon: AlertCircle },
  rejected: { color: "text-red-700", bg: "bg-red-100", icon: AlertCircle },
};

const InfluencerDeals = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["influencer-deals", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("campaign_matches")
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
      return data as ExtendedMatch[];
    },
    enabled: !!user,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('influencer-deals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_matches',
          filter: `influencer_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["influencer-deals", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const stats = useMemo(() => {
    return {
      active: deals.filter(d => d.status === "active").length,
      completed: deals.filter(d => d.status === "completed").length,
      pending: deals.filter(d => ["proposed", "accepted"].includes(d.status)).length,
    };
  }, [deals]);

  const respondMutation = useMutation({
    mutationFn: async ({ matchId, status, brandId, campaignTitle }: { matchId: string, status: 'accepted' | 'rejected', brandId: string, campaignTitle: string }) => {
      await matchService.updateMatchStatus(matchId, status);
      // Notify brand
      await supabase.from('notifications').insert({
        user_id: brandId,
        type: 'match',
        title: status === 'accepted' ? 'Invitation Accepted' : 'Invitation Declined',
        message: `${profile?.full_name || 'An influencer'} has ${status} your invitation for "${campaignTitle}".`,
        action_url: `/dashboard/influencers`,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["influencer-deals", user?.id] });
      toast({
        title: variables.status === 'accepted' ? "Invitation Accepted" : "Invitation Declined",
        description: variables.status === 'accepted' ? "The campaign has been added to your active deals." : "The invitation has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to respond to invitation.",
      });
    }
  });

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
          <h1 className="text-3xl font-heading font-bold mb-2">Brand Deals</h1>
          <p className="text-muted-foreground">Manage your active and past brand partnerships.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-heading font-bold text-green-600">
                {stats.active}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Active Deals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-heading font-bold text-blue-600">
                {stats.completed}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-heading font-bold text-yellow-600">
                {stats.pending}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Pending/Proposed</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {deals.map((deal, index) => {
            const config = statusConfig[deal.status] || statusConfig.proposed;
            const StatusIcon = config.icon;

            // Calculate progress based on completed deliverables vs total required
            const totalDeliverables = deal.campaign.deliverables?.length || 0;
            const completedDeliverables = deal.deliverables_completed?.length || 0;
            const progress = totalDeliverables > 0
              ? Math.round((completedDeliverables / totalDeliverables) * 100)
              : 0;

            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{deal.campaign.title}</h3>
                          <Badge className={`${config.bg} ${config.color} border-0`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {deal.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{deal.campaign.brand.company_name}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" /> {formatCurrency(deal.agreed_rate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {deal.campaign.start_date ? format(new Date(deal.campaign.start_date), "MMM d") : "TBD"} —
                            {deal.campaign.end_date ? format(new Date(deal.campaign.end_date), "MMM d, yyyy") : "TBD"}
                          </span>
                        </div>

                        {(deal.status === "active" || deal.status === "completed") && (
                          <div className="mt-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Deliverables Progress</span>
                              <span>{completedDeliverables}/{totalDeliverables} ({progress}%)</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {deal.status === "proposed" ? (
                          <>
                            <Button
                              variant="coral"
                              size="sm"
                              onClick={() => respondMutation.mutate({ matchId: deal.id, status: 'accepted', brandId: deal.campaign.brand_id, campaignTitle: deal.campaign.title })}
                              disabled={respondMutation.isPending}
                            >
                              Accept Campaign
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => respondMutation.mutate({ matchId: deal.id, status: 'rejected', brandId: deal.campaign.brand_id, campaignTitle: deal.campaign.title })}
                              disabled={respondMutation.isPending}
                            >
                              Decline
                            </Button>
                          </>
                        ) : (
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/dashboard/campaigns/${deal.campaign.id}`}>View Details</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {deals.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No deals found. Apply to campaigns to get started!
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InfluencerDeals;
