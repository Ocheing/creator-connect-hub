import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Briefcase, Calendar, DollarSign, CheckCircle, Clock, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const deals = [
  {
    id: "1",
    campaign: "Summer Glow Collection",
    brand: "Organic Skincare Co.",
    status: "active",
    agreedRate: "KSh 65,000",
    startDate: "Feb 1, 2024",
    endDate: "Feb 28, 2024",
    deliverables: ["3 Instagram posts", "5 Stories", "1 Reel"],
    completed: 2,
    total: 9,
  },
  {
    id: "2",
    campaign: "Fitness Challenge",
    brand: "FitLife Supplements",
    status: "active",
    agreedRate: "KSh 45,000",
    startDate: "Feb 5, 2024",
    endDate: "Mar 5, 2024",
    deliverables: ["2 Reels", "3 Stories"],
    completed: 1,
    total: 5,
  },
  {
    id: "3",
    campaign: "App Launch Promotion",
    brand: "TechStart App",
    status: "completed",
    agreedRate: "KSh 78,000",
    startDate: "Jan 10, 2024",
    endDate: "Feb 10, 2024",
    deliverables: ["1 YouTube review", "3 Instagram posts"],
    completed: 4,
    total: 4,
  },
  {
    id: "4",
    campaign: "Eco-Friendly Living",
    brand: "GreenHome Kenya",
    status: "pending",
    agreedRate: "KSh 50,000",
    startDate: "Mar 1, 2024",
    endDate: "Mar 31, 2024",
    deliverables: ["2 TikTok videos", "4 Stories"],
    completed: 0,
    total: 6,
  },
];

const statusConfig: Record<string, { color: string; bg: string; icon: typeof Clock }> = {
  active: { color: "text-green-700", bg: "bg-green-100", icon: Play },
  completed: { color: "text-muted-foreground", bg: "bg-muted", icon: CheckCircle },
  pending: { color: "text-yellow-700", bg: "bg-yellow-100", icon: Clock },
};

const InfluencerDeals = () => {
  return (
    <DashboardLayout userType="influencer">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Brand Deals</h1>
          <p className="text-muted-foreground">Manage your active and past brand partnerships.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-heading font-bold text-green-600">
                {deals.filter(d => d.status === "active").length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Active Deals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-heading font-bold">
                {deals.filter(d => d.status === "completed").length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-heading font-bold text-yellow-600">
                {deals.filter(d => d.status === "pending").length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Pending</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {deals.map((deal, index) => {
            const config = statusConfig[deal.status];
            const StatusIcon = config.icon;
            const progress = Math.round((deal.completed / deal.total) * 100);
            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{deal.campaign}</h3>
                          <Badge className={`${config.bg} ${config.color} border-0`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {deal.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{deal.brand}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" /> {deal.agreedRate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" /> {deal.startDate} — {deal.endDate}
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Deliverables Progress</span>
                            <span>{deal.completed}/{deal.total} ({progress}%)</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InfluencerDeals;
