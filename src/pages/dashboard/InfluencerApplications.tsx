import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const applications = [
  {
    id: "1",
    campaign: "Summer Glow Collection",
    brand: "Organic Skincare Co.",
    status: "pending",
    appliedAt: "Feb 10, 2024",
    proposedRate: "KSh 65,000",
    deliverables: "3 Instagram posts, 5 Stories",
  },
  {
    id: "2",
    campaign: "New Year Fitness Challenge",
    brand: "FitLife Supplements",
    status: "approved",
    appliedAt: "Jan 25, 2024",
    proposedRate: "KSh 45,000",
    deliverables: "2 Reels, 3 Stories",
  },
  {
    id: "3",
    campaign: "Tech Product Review",
    brand: "TechStart App",
    status: "rejected",
    appliedAt: "Jan 15, 2024",
    proposedRate: "KSh 30,000",
    deliverables: "1 YouTube video",
    rejectionReason: "Looking for creators with more tech-focused content.",
  },
  {
    id: "4",
    campaign: "Eco-Friendly Living",
    brand: "GreenHome Kenya",
    status: "approved",
    appliedAt: "Jan 5, 2024",
    proposedRate: "KSh 50,000",
    deliverables: "2 TikTok videos, 4 Stories",
  },
];

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  pending: { icon: Clock, color: "text-yellow-700", bg: "bg-yellow-100" },
  approved: { icon: CheckCircle, color: "text-green-700", bg: "bg-green-100" },
  rejected: { icon: XCircle, color: "text-red-700", bg: "bg-red-100" },
};

const InfluencerApplications = () => {
  return (
    <DashboardLayout userType="influencer">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">My Applications</h1>
          <p className="text-muted-foreground">Track and manage your campaign applications.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Total Applied", value: applications.length, color: "text-foreground" },
            { label: "Approved", value: applications.filter(a => a.status === "approved").length, color: "text-green-600" },
            { label: "Pending", value: applications.filter(a => a.status === "pending").length, color: "text-yellow-600" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6 text-center">
                <p className={`text-3xl font-heading font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          {["all", "pending", "approved", "rejected"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="space-y-4">
                {applications
                  .filter((a) => tab === "all" || a.status === tab)
                  .map((app, index) => {
                    const config = statusConfig[app.status];
                    const StatusIcon = config.icon;
                    return (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <h3 className="font-semibold text-lg">{app.campaign}</h3>
                                  <Badge className={`${config.bg} ${config.color} border-0`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {app.status}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground">{app.brand}</p>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                                  <span>Rate: <strong className="text-foreground">{app.proposedRate}</strong></span>
                                  <span>Deliverables: {app.deliverables}</span>
                                  <span>Applied: {app.appliedAt}</span>
                                </div>
                                {app.rejectionReason && (
                                  <p className="text-sm text-red-600 mt-2 italic">
                                    Reason: {app.rejectionReason}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  View Campaign
                                </Button>
                                {app.status === "pending" && (
                                  <Button variant="ghost" size="sm" className="text-red-600">
                                    Withdraw
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default InfluencerApplications;
