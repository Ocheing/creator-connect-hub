import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Clock, ArrowUpRight, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { paymentService, dashboardService } from "@/services/api"; // Added dashboardService just in case we need general stats
import { format } from "date-fns";

const InfluencerEarnings = () => {
  const { user } = useAuth();
  const userId = user?.id;

  // Fetch Payouts
  const { data: payouts = [], isLoading } = useQuery({
    queryKey: ['influencerPayouts', userId],
    queryFn: () => paymentService.getPayouts({ influencerId: userId }),
    enabled: !!userId,
    refetchInterval: 10000,
  });

  // We can also fetch dashboard stats for the "Total Earnings" if the RPC provides it more accurately/efficiently
  const { data: dashboardStats } = useQuery({
    queryKey: ['influencerStats', userId],
    queryFn: () => dashboardService.getInfluencerStats(userId!),
    enabled: !!userId,
    staleTime: 60000, // Cache for 1 minute as we primarily use it for total
  });

  if (isLoading) {
    return (
      <DashboardLayout userType="influencer">
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-coral" />
        </div>
      </DashboardLayout>
    );
  }

  // Calculate Stats
  const totalEarnings = dashboardStats?.total_earnings || payouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayouts = dashboardStats?.pending_earnings || payouts
    .filter(p => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + p.amount, 0);

  // Simplistic "This Month" calculation from payouts list
  const thisMonthEarnings = payouts
    .filter(p => {
      const isPaid = p.status === 'completed';
      const isThisMonth = new Date(p.created_at).getMonth() === new Date().getMonth() &&
        new Date(p.created_at).getFullYear() === new Date().getFullYear();
      return isPaid && isThisMonth;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    {
      label: "Total Earnings",
      value: `KSh ${totalEarnings.toLocaleString()}`,
      change: "Lifetime",
      icon: DollarSign
    },
    {
      label: "This Month",
      value: `KSh ${thisMonthEarnings.toLocaleString()}`,
      change: "Current Month",
      icon: TrendingUp
    },
    {
      label: "Pending Payouts",
      value: `KSh ${pendingPayouts.toLocaleString()}`,
      change: "Processing",
      icon: Clock
    },
  ];

  return (
    <DashboardLayout userType="influencer">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">Earnings</h1>
            <p className="text-muted-foreground">Track your income and payment history.</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
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
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <ArrowUpRight className="w-4 h-4" />
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

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {payouts.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reference</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Method</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((tx) => (
                      <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-medium text-sm">
                          #{tx.id.slice(0, 8)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`border-0 ${tx.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : tx.status === "pending" || tx.status === "processing"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                            {tx.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {tx.currency} {tx.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground capitalize">
                          {tx.payout_method || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">
                          {format(new Date(tx.created_at), 'MMM d, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No transaction history found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InfluencerEarnings;
