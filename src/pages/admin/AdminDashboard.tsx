import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Users, Briefcase, DollarSign, TrendingUp, UserCheck, UserX, FileText, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const stats = [
  {
    label: "Total Influencers",
    value: "523",
    change: "+28 this month",
    icon: Users,
    color: "bg-blue-100 text-blue-600",
  },
  {
    label: "Total Brands",
    value: "156",
    change: "+12 this month",
    icon: Briefcase,
    color: "bg-green-100 text-green-600",
  },
  {
    label: "Active Campaigns",
    value: "47",
    change: "8 pending",
    icon: TrendingUp,
    color: "bg-coral/10 text-coral",
  },
  {
    label: "Revenue (This Month)",
    value: "KSh 3,195,000",
    change: "+18.5% vs last",
    icon: DollarSign,
    color: "bg-purple-100 text-purple-600",
  },
];

const pendingApplications = [
  {
    name: "Alex Thompson",
    email: "alex@email.com",
    platform: "Instagram",
    followers: "7.2K",
    engagement: "8.5%",
    niche: "Fitness",
    appliedAt: "2 hours ago",
  },
  {
    name: "Jessica Wu",
    email: "jessica@email.com",
    platform: "TikTok",
    followers: "9.1K",
    engagement: "11.2%",
    niche: "Beauty",
    appliedAt: "5 hours ago",
  },
  {
    name: "David Park",
    email: "david@email.com",
    platform: "YouTube",
    followers: "4.5K",
    engagement: "6.8%",
    niche: "Tech",
    appliedAt: "1 day ago",
  },
];

const recentActivity = [
  { action: "New brand signup", detail: "Organic Beauty Co.", time: "10 min ago", type: "brand" },
  { action: "Campaign completed", detail: "FitLife Summer Challenge", time: "1 hour ago", type: "campaign" },
  { action: "Payment processed", detail: "KSh 110,000 to Sarah Chen", time: "2 hours ago", type: "payment" },
  { action: "New application", detail: "Alex Thompson - Fitness", time: "2 hours ago", type: "application" },
  { action: "Deal matched", detail: "Emma R. + TechStart App", time: "4 hours ago", type: "match" },
];

const AdminDashboard = () => {
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Pending Applications</CardTitle>
                  <span className="px-2 py-0.5 bg-coral/10 text-coral text-xs font-medium rounded-full">
                    {pendingApplications.length} new
                  </span>
                </div>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApplications.map((app) => (
                    <div
                      key={app.email}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
                          <span className="font-semibold text-coral text-sm">
                            {app.name.split(" ").map((n) => n[0]).join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{app.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {app.platform} • {app.followers} • {app.engagement} engagement
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <UserX className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" variant="coral">
                          <UserCheck className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        activity.type === "brand"
                          ? "bg-blue-100"
                          : activity.type === "payment"
                          ? "bg-green-100"
                          : activity.type === "campaign"
                          ? "bg-purple-100"
                          : "bg-coral/10"
                      }`}>
                        {activity.type === "brand" && <Briefcase className="w-4 h-4 text-blue-600" />}
                        {activity.type === "payment" && <DollarSign className="w-4 h-4 text-green-600" />}
                        {activity.type === "campaign" && <TrendingUp className="w-4 h-4 text-purple-600" />}
                        {activity.type === "application" && <FileText className="w-4 h-4 text-coral" />}
                        {activity.type === "match" && <Users className="w-4 h-4 text-coral" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.detail}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
                    </div>
                  ))}
                </div>
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
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Users className="w-5 h-5 text-coral" />
                  <span>Manage Users</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Briefcase className="w-5 h-5 text-coral" />
                  <span>View Campaigns</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <DollarSign className="w-5 h-5 text-coral" />
                  <span>Financial Reports</span>
                </Button>
                <Link to="/admin/content">
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2 w-full">
                    <FileText className="w-5 h-5 text-coral" />
                    <span>Content Management</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
