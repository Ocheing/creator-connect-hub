import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Users, Briefcase, DollarSign, TrendingUp, ArrowUpRight, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const stats = [
  {
    label: "Active Campaigns",
    value: "4",
    change: "+2 this month",
    icon: Briefcase,
  },
  {
    label: "Matched Influencers",
    value: "12",
    change: "+5 this week",
    icon: Users,
  },
  {
    label: "Total Spent",
    value: "$8,500",
    change: "This quarter",
    icon: DollarSign,
  },
  {
    label: "Avg. Engagement",
    value: "7.8%",
    change: "+1.2% vs last",
    icon: TrendingUp,
  },
];

const campaigns = [
  {
    name: "Summer Product Launch",
    status: "active",
    influencers: 5,
    budget: "$3,000",
    spent: 65,
    reach: "45K",
  },
  {
    name: "Holiday Gift Guide",
    status: "planning",
    influencers: 0,
    budget: "$2,500",
    spent: 0,
    reach: "-",
  },
  {
    name: "Brand Awareness Q1",
    status: "completed",
    influencers: 8,
    budget: "$5,000",
    spent: 100,
    reach: "120K",
  },
];

const matchedInfluencers = [
  {
    name: "Sarah Chen",
    niche: "Lifestyle",
    followers: "8.2K",
    engagement: "9.1%",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    name: "Marcus Johnson",
    niche: "Fitness",
    followers: "5.7K",
    engagement: "8.5%",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    name: "Emma Rodriguez",
    niche: "Food",
    followers: "9.1K",
    engagement: "7.8%",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
];

const BrandDashboard = () => {
  return (
    <DashboardLayout userType="brand">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">Brand Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your influencer campaigns and partnerships.
            </p>
          </div>
          <Button variant="coral">
            Create New Campaign
          </Button>
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
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
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
          {/* Campaigns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Campaigns</CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.name}
                      className="p-4 rounded-xl bg-muted/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>{campaign.influencers} influencers</span>
                            <span>•</span>
                            <span>{campaign.reach} reach</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          campaign.status === "active"
                            ? "bg-green-100 text-green-700"
                            : campaign.status === "planning"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Budget: {campaign.budget}
                        </span>
                        <span>{campaign.spent}% spent</span>
                      </div>
                      <Progress value={campaign.spent} className="h-2 mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Matched Influencers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>New Matches</CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {matchedInfluencers.map((influencer) => (
                    <div
                      key={influencer.name}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                    >
                      <img
                        src={influencer.image}
                        alt={influencer.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{influencer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {influencer.niche} • {influencer.followers}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-coral">{influencer.engagement}</p>
                        <p className="text-xs text-muted-foreground">engagement</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Eye className="w-4 h-4 mr-2" />
                  Browse All Creators
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BrandDashboard;
