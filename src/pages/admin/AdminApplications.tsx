import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { FileText, UserCheck, UserX, ExternalLink, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const applications = [
  { id: "1", name: "Alex Thompson", email: "alex@example.com", platform: "Instagram", followers: "7.2K", engagement: "8.5%", niche: "Fitness", campaign: "Summer Product Launch", appliedAt: "2 hours ago", status: "pending" },
  { id: "2", name: "Jessica Wu", email: "jessica@example.com", platform: "TikTok", followers: "9.1K", engagement: "11.2%", niche: "Beauty", campaign: "Summer Product Launch", appliedAt: "5 hours ago", status: "pending" },
  { id: "3", name: "David Park", email: "david@example.com", platform: "YouTube", followers: "4.5K", engagement: "6.8%", niche: "Tech", campaign: "New Product Teaser", appliedAt: "1 day ago", status: "pending" },
  { id: "4", name: "Sarah Chen", email: "sarah@example.com", platform: "Instagram", followers: "8.2K", engagement: "9.1%", niche: "Lifestyle", campaign: "Summer Product Launch", appliedAt: "3 days ago", status: "approved" },
  { id: "5", name: "Mike Oduya", email: "mike@example.com", platform: "TikTok", followers: "3.2K", engagement: "4.1%", niche: "Comedy", campaign: "Brand Awareness Q1", appliedAt: "5 days ago", status: "rejected" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const AdminApplications = () => {
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">Application Reviews</h1>
            <p className="text-muted-foreground">Review and manage influencer campaign applications.</p>
          </div>
          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search applications..." className="pl-10" />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{applications.filter(a => a.status === "pending").length}</p><p className="text-xs text-muted-foreground">Pending Review</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{applications.filter(a => a.status === "approved").length}</p><p className="text-xs text-muted-foreground">Approved</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{applications.filter(a => a.status === "rejected").length}</p><p className="text-xs text-muted-foreground">Rejected</p></CardContent></Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          {["pending", "approved", "rejected", "all"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="space-y-4">
                {applications
                  .filter(a => tab === "all" || a.status === tab)
                  .map((app, index) => (
                    <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center shrink-0">
                                <span className="font-semibold text-coral">
                                  {app.name.split(" ").map(n => n[0]).join("")}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <h3 className="font-semibold text-lg">{app.name}</h3>
                                  <Badge className={`border-0 ${statusColors[app.status]}`}>{app.status}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{app.email}</p>
                                <div className="flex flex-wrap gap-3 text-sm mt-2">
                                  <Badge variant="outline">{app.platform}</Badge>
                                  <span className="text-muted-foreground">{app.followers} followers</span>
                                  <span className="text-coral font-medium">{app.engagement} engagement</span>
                                  <span className="text-muted-foreground">Niche: {app.niche}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Campaign: <strong>{app.campaign}</strong> • Applied {app.appliedAt}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                              {app.status === "pending" && (
                                <>
                                  <Button size="sm" variant="coral">
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-red-600">
                                    <UserX className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              <Button size="sm" variant="ghost">
                                <ExternalLink className="w-4 h-4 mr-1" />
                                View Profile
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminApplications;
