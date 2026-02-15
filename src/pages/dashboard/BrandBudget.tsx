import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, ArrowUpRight, Download, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const stats = [
  { label: "Total Budget", value: "KSh 1,565,000", icon: DollarSign },
  { label: "Total Spent", value: "KSh 1,100,000", icon: TrendingUp },
  { label: "Remaining", value: "KSh 465,000", icon: PieChart },
];

const campaignBudgets = [
  { name: "Summer Product Launch", budget: 390000, spent: 253500, status: "active" },
  { name: "New Product Teaser", budget: 200000, spent: 60000, status: "active" },
  { name: "Brand Awareness Q1", budget: 650000, spent: 650000, status: "completed" },
  { name: "Holiday Gift Guide", budget: 325000, spent: 0, status: "draft" },
];

const recentPayments = [
  { id: "1", influencer: "Sarah Chen", campaign: "Summer Product Launch", amount: "KSh 55,000", date: "Feb 12, 2024", status: "completed" },
  { id: "2", influencer: "Marcus Johnson", campaign: "Summer Product Launch", amount: "KSh 40,000", date: "Feb 10, 2024", status: "completed" },
  { id: "3", influencer: "James Mwangi", campaign: "New Product Teaser", amount: "KSh 70,000", date: "Feb 8, 2024", status: "processing" },
  { id: "4", influencer: "Emma Rodriguez", campaign: "Brand Awareness Q1", amount: "KSh 65,000", date: "Feb 5, 2024", status: "completed" },
];

const BrandBudget = () => {
  const totalBudget = campaignBudgets.reduce((a, c) => a + c.budget, 0);
  const totalSpent = campaignBudgets.reduce((a, c) => a + c.spent, 0);

  return (
    <DashboardLayout userType="brand">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">Budget Tracker</h1>
            <p className="text-muted-foreground">Monitor your campaign spending and payments.</p>
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
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-coral" />
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <p className="text-2xl font-heading font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Budgets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaignBudgets.map((campaign) => {
              const pct = campaign.budget > 0 ? Math.round((campaign.spent / campaign.budget) * 100) : 0;
              return (
                <div key={campaign.name} className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{campaign.name}</h4>
                      <Badge variant="outline" className="text-xs capitalize">{campaign.status}</Badge>
                    </div>
                    <span className="text-sm font-medium">{pct}% used</span>
                  </div>
                  <Progress value={pct} className="h-2 mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Spent: KSh {campaign.spent.toLocaleString()}</span>
                    <span>Budget: KSh {campaign.budget.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Influencer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Campaign</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium">{payment.influencer}</td>
                      <td className="py-3 px-4 text-muted-foreground">{payment.campaign}</td>
                      <td className="py-3 px-4 font-semibold">{payment.amount}</td>
                      <td className="py-3 px-4 text-muted-foreground">{payment.date}</td>
                      <td className="py-3 px-4">
                        <Badge className={`border-0 ${
                          payment.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {payment.status}
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

export default BrandBudget;
