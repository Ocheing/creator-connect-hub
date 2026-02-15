import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Clock, ArrowUpRight, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Total Earnings", value: "KSh 550,000", change: "+12.5%", icon: DollarSign },
  { label: "This Month", value: "KSh 143,000", change: "+8.3%", icon: TrendingUp },
  { label: "Pending Payouts", value: "KSh 110,000", change: "2 pending", icon: Clock },
];

const transactions = [
  { id: "1", campaign: "Summer Glow Collection", brand: "Organic Skincare Co.", amount: "KSh 65,000", status: "completed", date: "Feb 12, 2024", method: "M-Pesa" },
  { id: "2", campaign: "App Launch Promotion", brand: "TechStart App", amount: "KSh 78,000", status: "completed", date: "Feb 10, 2024", method: "Bank Transfer" },
  { id: "3", campaign: "Fitness Challenge", brand: "FitLife Supplements", amount: "KSh 45,000", status: "pending", date: "Feb 8, 2024", method: "M-Pesa" },
  { id: "4", campaign: "Eco-Friendly Living", brand: "GreenHome Kenya", amount: "KSh 50,000", status: "pending", date: "Feb 5, 2024", method: "Bank Transfer" },
  { id: "5", campaign: "Holiday Gift Guide", brand: "Craft Market KE", amount: "KSh 35,000", status: "completed", date: "Jan 20, 2024", method: "M-Pesa" },
  { id: "6", campaign: "Beauty Masterclass", brand: "Glow Cosmetics", amount: "KSh 90,000", status: "completed", date: "Jan 15, 2024", method: "Bank Transfer" },
];

const InfluencerEarnings = () => {
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
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Campaign</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Brand</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Method</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium">{tx.campaign}</td>
                      <td className="py-3 px-4 text-muted-foreground">{tx.brand}</td>
                      <td className="py-3 px-4 font-semibold">{tx.amount}</td>
                      <td className="py-3 px-4 text-muted-foreground">{tx.method}</td>
                      <td className="py-3 px-4 text-muted-foreground">{tx.date}</td>
                      <td className="py-3 px-4">
                        <Badge className={`border-0 ${
                          tx.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {tx.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InfluencerEarnings;
