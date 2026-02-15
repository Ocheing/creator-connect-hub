import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { User, Bell, Shield, CreditCard, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface DashboardSettingsProps {
  userType?: "influencer" | "brand";
}

const DashboardSettings = ({ userType = "influencer" }: DashboardSettingsProps) => {
  return (
    <DashboardLayout userType={userType}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences.</p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="flex-wrap">
            <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger>
            <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" />Security</TabsTrigger>
            {userType === "influencer" && (
              <TabsTrigger value="payout"><CreditCard className="w-4 h-4 mr-2" />Payout</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-coral/10 flex items-center justify-center">
                      <span className="font-bold text-coral text-xl">JD</span>
                    </div>
                    <Button variant="outline" size="sm">Change Photo</Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input defaultValue="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input defaultValue="john@example.com" type="email" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input defaultValue="+254 712 345 678" />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input defaultValue="Nairobi, Kenya" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea defaultValue="Content creator passionate about lifestyle and fitness." rows={3} />
                  </div>
                  <Button variant="coral">Save Changes</Button>
                </CardContent>
              </Card>
            </motion.div>

            {userType === "influencer" && (
              <Card>
                <CardHeader>
                  <CardTitle>Social Media Accounts</CardTitle>
                  <CardDescription>Connect and manage your social profiles.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {["Instagram", "TikTok", "YouTube", "Twitter"].map((platform) => (
                    <div key={platform} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">{platform}</span>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you receive.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: "New campaign matches", description: "Get notified when a brand matches with you" },
                  { label: "Application updates", description: "Status changes on your applications" },
                  { label: "Payment notifications", description: "When payments are processed or received" },
                  { label: "Messages", description: "New messages from brands or support" },
                  { label: "Platform updates", description: "News and feature announcements" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" />
                </div>
                <Button variant="coral">Update Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {userType === "influencer" && (
            <TabsContent value="payout" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payout Settings</CardTitle>
                  <CardDescription>Configure how you receive payments.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Preferred Method</Label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {["M-Pesa", "Bank Transfer"].map((method) => (
                        <div
                          key={method}
                          className="p-4 rounded-lg border-2 border-border hover:border-coral cursor-pointer transition-colors"
                        >
                          <p className="font-medium">{method}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>M-Pesa Number</Label>
                    <Input defaultValue="+254 712 345 678" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input placeholder="e.g. KCB Bank" />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input placeholder="Account number" />
                    </div>
                  </div>
                  <Button variant="coral">Save Payout Info</Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSettings;
