import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, ArrowUpRight, Download, Percent, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { paymentService } from "@/services/api";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-700",
};

const AdminFinances = () => {
  const { data: payments, isLoading: isLoadingPayments, refetch: refetchPayments } = useQuery({
    queryKey: ['adminPayments'],
    queryFn: paymentService.getAdminPayments,
  });

  const { data: payouts, isLoading: isLoadingPayouts, refetch: refetchPayouts } = useQuery({
    queryKey: ['adminPayouts'],
    queryFn: paymentService.getAdminPayouts,
  });

  useEffect(() => {
    const paymentChannel = supabase
      .channel('admin-payments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => refetchPayments()
      )
      .subscribe();

    const payoutChannel = supabase
      .channel('admin-payouts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payouts' },
        () => refetchPayouts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(paymentChannel);
      supabase.removeChannel(payoutChannel);
    };
  }, [refetchPayments, refetchPayouts]);

  const handleProcessPayout = async (payoutId: string) => {
    try {
      await paymentService.processPayout(payoutId, 'processing');
      toast.success("Payout processing started");
    } catch (error) {
      toast.error("Failed to process payout");
      console.error(error);
    }
  };

  const brandPayments = payments?.map((p: any) => ({
    id: p.id,
    brand: p.brand?.company_name || 'Unknown Brand',
    campaign: p.campaign?.title || 'Unknown Campaign',
    amount: `KSh ${p.amount.toLocaleString()}`,
    commission: `KSh ${p.commission_amount?.toLocaleString() || 0}`,
    status: p.status,
    date: p.created_at ? format(new Date(p.created_at), 'MMM d, yyyy') : 'N/A'
  })) || [];

  const influencerPayouts = payouts?.map((p: any) => ({
    id: p.id,
    influencer: p.influencer?.full_name || 'Unknown',
    campaign: p.match?.campaign?.title || 'Unknown Campaign',
    amount: `KSh ${p.amount.toLocaleString()}`,
    method: p.payout_method || 'N/A',
    status: p.status,
    date: p.created_at ? format(new Date(p.created_at), 'MMM d, yyyy') : 'N/A'
  })) || [];

  // Calculate dynamic stats
  const totalRevenue = payments?.reduce((sum: number, p: any) => sum + (p.status === 'completed' ? p.commission_amount : 0), 0) || 0;
  const totalBrandPayments = payments?.reduce((sum: number, p: any) => sum + (p.status === 'completed' ? p.amount : 0), 0) || 0;
  const totalInfluencerPayouts = payouts?.reduce((sum: number, p: any) => sum + (p.status === 'completed' ? p.amount : 0), 0) || 0;

  const stats = [
    { label: "Total Revenue", value: `KSh ${totalRevenue.toLocaleString()}`, change: "All time", icon: DollarSign },
    { label: "Brand Payments", value: `KSh ${totalBrandPayments.toLocaleString()}`, change: "All time", icon: TrendingUp },
    { label: "Influencer Payouts", value: `KSh ${totalInfluencerPayouts.toLocaleString()}`, change: "All time", icon: ArrowUpRight },
    { label: "Commission (20%)", value: `KSh ${totalRevenue.toLocaleString()}`, change: "20% rate", icon: Percent },
  ];

  if (isLoadingPayments || isLoadingPayouts) {
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
            <h1 className="text-3xl font-heading font-bold mb-2">Financial Tracking</h1>
            <p className="text-muted-foreground">Monitor payments, payouts, and platform revenue.</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-coral" />
                    </div>
                  </div>
                  <p className="text-2xl font-heading font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="brand-payments">
          <TabsList>
            <TabsTrigger value="brand-payments">Brand Payments</TabsTrigger>
            <TabsTrigger value="influencer-payouts">Influencer Payouts</TabsTrigger>
          </TabsList>

          <TabsContent value="brand-payments">
            <Card>
              <CardHeader><CardTitle>Brand Payments</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {brandPayments.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Brand</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Campaign</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Commission</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brandPayments.map((p) => (
                          <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-3 px-4 font-medium">{p.brand}</td>
                            <td className="py-3 px-4 text-muted-foreground">{p.campaign}</td>
                            <td className="py-3 px-4 font-semibold">{p.amount}</td>
                            <td className="py-3 px-4 text-coral font-medium">{p.commission}</td>
                            <td className="py-3 px-4 text-muted-foreground">{p.date}</td>
                            <td className="py-3 px-4"><Badge className={`border-0 ${statusColors[p.status]}`}>{p.status}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No payments found.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="influencer-payouts">
            <Card>
              <CardHeader><CardTitle>Influencer Payouts</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {influencerPayouts.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Influencer</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Campaign</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Method</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {influencerPayouts.map((p) => (
                          <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-3 px-4 font-medium">{p.influencer}</td>
                            <td className="py-3 px-4 text-muted-foreground">{p.campaign}</td>
                            <td className="py-3 px-4 font-semibold">{p.amount}</td>
                            <td className="py-3 px-4 text-muted-foreground">{p.method}</td>
                            <td className="py-3 px-4 text-muted-foreground">{p.date}</td>
                            <td className="py-3 px-4"><Badge className={`border-0 ${statusColors[p.status]}`}>{p.status}</Badge></td>
                            <td className="py-3 px-4">
                              {(p.status === "pending" || p.status === "processing") && (
                                <Button size="sm" variant="coral" className="text-xs h-7" onClick={() => handleProcessPayout(p.id)}>Process</Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No payouts found.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminFinances;
