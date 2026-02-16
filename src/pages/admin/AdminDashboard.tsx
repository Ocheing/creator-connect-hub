import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Users, Briefcase, DollarSign, TrendingUp, UserCheck, UserX, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { dashboardService, applicationService, adminService } from "@/services/api";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";

const AdminDashboard = () => {
  const { user } = useAuth();

  // Fetch Dashboard Stats
  const { data: stats, isLoading: isLoadingStats, refetch: refetchStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => dashboardService.getAdminStats(),
  });

  // Fetch Pending Applications
  const { data: pendingApplications, isLoading: isLoadingApps, refetch: refetchApps } = useQuery({
    queryKey: ['pendingApplications'],
    queryFn: () => applicationService.getApplications({ status: 'pending' }),
  });

  // Fetch Recent Activity (Transaction Log)
  const { data: transactionsData, isLoading: isLoadingActivity, refetch: refetchActivity } = useQuery({
    queryKey: ['adminRecentActivity'],
    queryFn: () => adminService.getTransactionLog({ pageSize: 5 }),
  });

  // Real-time subscriptions
  useEffect(() => {
    const channels = [
      supabase
        .channel('dashboard-applications')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'campaign_applications' }, () => {
          refetchApps();
          refetchStats();
        })
        .subscribe(),
      supabase
        .channel('dashboard-profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => refetchStats())
        .subscribe(),
      supabase
        .channel('dashboard-campaigns')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, () => refetchStats())
        .subscribe(),
      supabase
        .channel('dashboard-payments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => refetchStats())
        .subscribe(),
      supabase
        .channel('dashboard-logs')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transaction_log' }, () => refetchActivity())
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [refetchStats, refetchApps, refetchActivity]);

  const recentActivity = transactionsData?.data || [];

  const handleReviewApplication = async (appId: string, status: 'approved' | 'rejected') => {
    try {
      await applicationService.reviewApplication(appId, status, user!.id);
      toast.success(`Application ${status}`);
      // refetch is handled by subscription
    } catch (error) {
      toast.error("Failed to review application");
      console.error(error);
    }
  };

  if (isLoadingStats || isLoadingApps || isLoadingActivity) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-coral" />
        </div>
      </DashboardLayout>
    );
  }

  const statItems = [
    {
      label: "Total Influencers",
      value: (stats?.total_influencers || 0).toString(),
      change: "Total",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Total Brands",
      value: (stats?.total_brands || 0).toString(),
      change: "Total",
      icon: Briefcase,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Active Campaigns",
      value: (stats?.active_campaigns || 0).toString(),
      change: "Active",
      icon: TrendingUp,
      color: "bg-coral/10 text-coral",
    },
    {
      label: "Revenue (Month)",
      value: `KSh ${(stats?.monthly_revenue || 0).toLocaleString()}`,
      change: "This month",
      icon: DollarSign,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of platform activity and management.
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
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-3xl font-heading font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xs text-green-600 mt-2">{stat.change}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending Applications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Pending Applications</CardTitle>
                  <span className="px-2 py-0.5 bg-coral/10 text-coral text-xs font-medium rounded-full">
                    {pendingApplications?.length || 0} new
                  </span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/applications">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {pendingApplications && pendingApplications.length > 0 ? (
                  <div className="space-y-4">
                    {pendingApplications.slice(0, 5).map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
                            <span className="font-semibold text-coral text-sm">
                              A
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">App #{app.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              Proposed Rate: KSh {app.proposed_rate?.toLocaleString() || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleReviewApplication(app.id, 'rejected')}>
                            <UserX className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button size="sm" variant="coral" onClick={() => handleReviewApplication(app.id, 'approved')}>
                            <UserCheck className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending applications. Good job!
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity (Logs) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-coral/10`}>
                          <DollarSign className="w-4 h-4 text-coral" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium capitalize">{activity.action.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {activity.entity_type} {activity.entity_id.slice(0, 8)} - {activity.new_status}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/admin/users">
                    <Users className="w-5 h-5 text-coral" />
                    <span>Manage Users</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/admin/campaigns">
                    <Briefcase className="w-5 h-5 text-coral" />
                    <span>View Campaigns</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/admin/finance">
                    <DollarSign className="w-5 h-5 text-coral" />
                    <span>Financial Reports</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 w-full" asChild>
                  <Link to="/admin/content">
                    <FileText className="w-5 h-5 text-coral" />
                    <span>Content Management</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
