import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Users, Star, MessageSquare, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const influencers = [
  {
    id: "1",
    name: "Sarah Chen",
    niche: "Lifestyle",
    followers: "8.2K",
    engagement: "9.1%",
    platform: "Instagram",
    status: "active",
    campaign: "Summer Product Launch",
    agreedRate: "KSh 55,000",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    name: "Marcus Johnson",
    niche: "Fitness",
    followers: "5.7K",
    engagement: "8.5%",
    platform: "TikTok",
    status: "active",
    campaign: "Summer Product Launch",
    agreedRate: "KSh 40,000",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    niche: "Food",
    followers: "9.1K",
    engagement: "7.8%",
    platform: "Instagram",
    status: "completed",
    campaign: "Brand Awareness Q1",
    agreedRate: "KSh 65,000",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    id: "4",
    name: "James Mwangi",
    niche: "Tech",
    followers: "6.3K",
    engagement: "10.2%",
    platform: "YouTube",
    status: "active",
    campaign: "New Product Teaser",
    agreedRate: "KSh 70,000",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  },
  {
    id: "5",
    name: "Amina Hassan",
    niche: "Beauty",
    followers: "7.8K",
    engagement: "11.5%",
    platform: "TikTok",
    status: "proposed",
    campaign: "Summer Product Launch",
    agreedRate: "KSh 50,000",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
  },
];

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  completed: "bg-muted text-muted-foreground",
  proposed: "bg-yellow-100 text-yellow-700",
};

const BrandInfluencers = () => {
  return (
    <DashboardLayout userType="brand">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">Matched Influencers</h1>
            <p className="text-muted-foreground">View and manage your influencer partnerships.</p>
          </div>
          <Input placeholder="Search influencers..." className="sm:max-w-xs" />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-heading font-bold text-green-600">
                {influencers.filter(i => i.status === "active").length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Active Partnerships</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-heading font-bold">{influencers.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Matched</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-heading font-bold text-coral">9.0%</p>
              <p className="text-sm text-muted-foreground mt-1">Avg. Engagement</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {influencers.map((influencer, index) => (
            <motion.div
              key={influencer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={influencer.image}
                      alt={influencer.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{influencer.name}</h3>
                        <Badge className={`border-0 text-xs ${statusColors[influencer.status]}`}>
                          {influencer.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{influencer.niche} • {influencer.platform}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="font-semibold">{influencer.followers}</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="font-semibold text-coral">{influencer.engagement}</p>
                      <p className="text-xs text-muted-foreground">Engagement</p>
                    </div>
                  </div>

                  <div className="mt-3 text-sm">
                    <p className="text-muted-foreground">Campaign: <span className="text-foreground">{influencer.campaign}</span></p>
                    <p className="text-muted-foreground">Rate: <span className="font-semibold text-foreground">{influencer.agreedRate}</span></p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BrandInfluencers;
