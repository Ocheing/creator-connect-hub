import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { DollarSign, Briefcase, TrendingUp, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const stats = [
  {
    label: "Total Earnings",
    value: "KSh 550,000",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    label: "Active Deals",
    value: "3",
    change: "+1 this week",
    trend: "up",
    icon: Briefcase,
  },
  {
    label: "Avg. Engagement",
    value: "8.2%",
    change: "+0.5%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    label: "Pending Payments",
    value: "KSh 110,000",
    change: "2 invoices",
    trend: "neutral",
    icon: Clock,
  },
];

const recentDeals = [
  {
    brand: "Organic Skincare Co.",
    campaign: "Summer Glow Collection",
    status: "active",
    amount: "KSh 65,000",
    dueDate: "Feb 15, 2024",
  },
  {
    brand: "FitLife Supplements",
    campaign: "New Year Fitness Challenge",
    status: "pending",
    amount: "KSh 45,000",
    dueDate: "Feb 20, 2024",
  },
  {
    brand: "TechStart App",
    campaign: "App Launch Promotion",
    status: "completed",
    amount: "KSh 78,000",
    dueDate: "Feb 10, 2024",
  },
];

const InfluencerDashboard = () => {
  return (
    <DashboardLayout userType="influencer">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Welcome back, John! 👋</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your brand partnerships.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.trend === "up" ? "text-green-600" : "text-muted-foreground"
                    }`}>
                      {stat.trend === "up" && <ArrowUpRight className="w-4 h-4" />}
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Deals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Deals</CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDeals.map((deal) => (
                    <div
                      key={deal.campaign}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-coral" />
                        </div>
                        <div>
                          <p className="font-medium">{deal.brand}</p>
                          <p className="text-sm text-muted-foreground">{deal.campaign}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{deal.amount}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          deal.status === "active"
                            ? "bg-green-100 text-green-700"
                            : deal.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {deal.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile Completion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Profile Completion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">75% Complete</span>
                    <span className="text-sm text-muted-foreground">3 tasks left</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-muted-foreground line-through">Basic info</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-muted-foreground line-through">Connect social accounts</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full border-2 border-coral flex items-center justify-center">
                      <span className="text-coral text-xs">!</span>
                    </div>
                    <span>Add portfolio examples</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                    <span className="text-muted-foreground">Complete rate card</span>
                  </div>
                </div>

                <Button variant="coral" className="w-full">
                  Complete Profile
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InfluencerDashboard;
