import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, ArrowUpRight, Download, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const stats = [
  { label: "Total Revenue", value: "KSh 3,195,000", change: "+18.5%", icon: DollarSign },
  { label: "Brand Payments", value: "KSh 15,975,000", change: "+22%", icon: TrendingUp },
  { label: "Influencer Payouts", value: "KSh 12,780,000", change: "+20%", icon: ArrowUpRight },
  { label: "Commission (20%)", value: "KSh 3,195,000", change: "20% rate", icon: Percent },
];

const brandPayments = [
  { id: "1", brand: "Organic Skincare Co.", campaign: "Summer Product Launch", amount: "KSh 390,000", commission: "KSh 78,000", status: "completed", date: "Feb 12, 2024" },
  { id: "2", brand: "TechStart App", campaign: "New Product Teaser", amount: "KSh 200,000", commission: "KSh 40,000", status: "completed", date: "Feb 10, 2024" },
  { id: "3", brand: "FitLife Supplements", campaign: "Fitness Challenge", amount: "KSh 500,000", commission: "KSh 100,000", status: "pending", date: "Feb 8, 2024" },
  { id: "4", brand: "GreenHome Kenya", campaign: "Brand Awareness Q1", amount: "KSh 650,000", commission: "KSh 130,000", status: "completed", date: "Feb 1, 2024" },
];

const influencerPayouts = [
  { id: "1", influencer: "Sarah Chen", campaign: "Summer Product Launch", amount: "KSh 55,000", status: "completed", date: "Feb 12, 2024", method: "M-Pesa" },
  { id: "2", influencer: "Marcus Johnson", campaign: "Summer Product Launch", amount: "KSh 40,000", status: "completed", date: "Feb 10, 2024", method: "Bank Transfer" },
  { id: "3", influencer: "James Mwangi", campaign: "New Product Teaser", amount: "KSh 70,000", status: "processing", date: "Feb 8, 2024", method: "M-Pesa" },
  { id: "4", influencer: "Emma Rodriguez", campaign: "Brand Awareness Q1", amount: "KSh 65,000", status: "pending", date: "Feb 5, 2024", method: "Bank Transfer" },
  { id: "5", influencer: "Amina Hassan", campaign: "Brand Awareness Q1", amount: "KSh 50,000", status: "completed", date: "Feb 3, 2024", method: "M-Pesa" },
];

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-700",
};

const AdminFinances = () => {
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="influencer-payouts">
            <Card>
              <CardHeader><CardTitle>Influencer Payouts</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
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
                              <Button size="sm" variant="coral" className="text-xs h-7">Process</Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
