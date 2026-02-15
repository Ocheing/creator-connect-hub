import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Settings, DollarSign, Percent, Users, Shield, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const AdminSettings = () => {
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Platform Settings</h1>
          <p className="text-muted-foreground">Configure platform-wide settings and preferences.</p>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="flex-wrap">
            <TabsTrigger value="general"><Settings className="w-4 h-4 mr-2" />General</TabsTrigger>
            <TabsTrigger value="pricing"><DollarSign className="w-4 h-4 mr-2" />Pricing</TabsTrigger>
            <TabsTrigger value="admins"><Shield className="w-4 h-4 mr-2" />Admin Users</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Configuration</CardTitle>
                <CardDescription>Core platform settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Platform Name</Label>
                    <Input defaultValue="MicroMatch" />
                  </div>
                  <div className="space-y-2">
                    <Label>Support Email</Label>
                    <Input defaultValue="support@micromatch.co.ke" />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <Input defaultValue="KSh (Kenya Shillings)" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input defaultValue="+254 700 000 000" />
                  </div>
                </div>
                <Button variant="coral">Save Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Toggles</CardTitle>
                <CardDescription>Enable or disable platform features.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: "Allow new influencer registrations", enabled: true },
                  { label: "Allow new brand registrations", enabled: true },
                  { label: "Enable live chat widget", enabled: true },
                  { label: "Require email verification", enabled: false },
                  { label: "Maintenance mode", enabled: false },
                ].map((feature) => (
                  <div key={feature.label} className="flex items-center justify-between">
                    <span className="font-medium">{feature.label}</span>
                    <Switch defaultChecked={feature.enabled} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Commission Settings</CardTitle>
                <CardDescription>Configure the agency commission rate on brand deals.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="space-y-2 flex-1 max-w-xs">
                    <Label>Commission Rate (%)</Label>
                    <Input type="number" defaultValue="20" min="0" max="100" />
                  </div>
                  <div className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      Current: <strong className="text-coral">20%</strong> of each brand deal
                    </p>
                  </div>
                </div>
                <Button variant="coral">Update Commission Rate</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Packages (Brand-Only)</CardTitle>
                <CardDescription>These packages are visible only to brands and admins.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Launch Pad", price: "KSh 29,900", features: "Brand matchmaking, Rate negotiation, Basic tracking" },
                  { name: "Growth Accelerator", price: "KSh 59,900", features: "Full campaign management, Contract handling, Monthly reports" },
                  { name: "Custom Enterprise", price: "Custom", features: "Multiple influencer management, Dedicated account manager" },
                ].map((pkg) => (
                  <div key={pkg.name} className="p-4 rounded-xl bg-muted/50 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{pkg.name}</h4>
                      <p className="text-sm text-muted-foreground">{pkg.features}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-coral">{pkg.price}</p>
                      <Button variant="ghost" size="sm" className="text-xs mt-1">Edit</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Users</CardTitle>
                <CardDescription>Manage users with administrative access.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Super Admin", email: "admin@micromatch.co.ke", role: "Super Admin", since: "Dec 1, 2023" },
                  { name: "Content Manager", email: "content@micromatch.co.ke", role: "Content Admin", since: "Jan 15, 2024" },
                ].map((admin) => (
                  <div key={admin.email} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-amber-700" />
                      </div>
                      <div>
                        <p className="font-medium">{admin.name}</p>
                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{admin.role}</p>
                      <p className="text-xs text-muted-foreground">Since {admin.since}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="mt-4">
                  <Users className="w-4 h-4 mr-2" />
                  Add Admin User
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
