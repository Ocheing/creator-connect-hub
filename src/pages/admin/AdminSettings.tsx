import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Settings, DollarSign, Percent, Users, Shield, Globe, Loader2, Save, Plus, Trash2, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { settingsService, pricingService, adminService } from "@/services/api";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const AdminSettings = () => {
  const { user } = useAuth();

  // Settings Queries
  const { data: platformName, refetch: refetchName } = useQuery({ queryKey: ['setting', 'platform_name'], queryFn: () => settingsService.getSetting('platform_name') });
  const { data: supportEmail, refetch: refetchEmail } = useQuery({ queryKey: ['setting', 'support_email'], queryFn: () => settingsService.getSetting('support_email') });
  const { data: contactPhone, refetch: refetchPhone } = useQuery({ queryKey: ['setting', 'contact_phone'], queryFn: () => settingsService.getSetting('contact_phone') });
  const { data: commissionRate, refetch: refetchCommission } = useQuery({ queryKey: ['setting', 'commission_rate'], queryFn: () => settingsService.getSetting('commission_rate') });

  // Pricing Packages
  const { data: packages, refetch: refetchPackages } = useQuery({
    queryKey: ['pricingPackages'],
    queryFn: () => pricingService.getPackages(false) // Get all, including inactive
  });

  // Admin Users
  const { data: admins, refetch: refetchAdmins } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'admin');
      return data || [];
    }
  });

  const [settingsForm, setSettingsForm] = useState({
    platformName: "",
    supportEmail: "",
    contactPhone: "",
    commissionRate: "20"
  });

  useEffect(() => {
    setSettingsForm(prev => ({
      ...prev,
      platformName: platformName || "MicroMatch",
      supportEmail: supportEmail || "support@micromatch.co.ke",
      contactPhone: contactPhone || "",
      commissionRate: commissionRate || "20"
    }));
  }, [platformName, supportEmail, contactPhone, commissionRate]);

  // Real-time subscriptions
  useEffect(() => {
    const channels = [
      supabase.channel('settings-sub').on('postgres_changes', { event: '*', schema: 'public', table: 'platform_settings' }, () => {
        refetchName(); refetchEmail(); refetchPhone(); refetchCommission();
      }).subscribe(),
      supabase.channel('packages-sub').on('postgres_changes', { event: '*', schema: 'public', table: 'pricing_packages' }, () => {
        refetchPackages();
      }).subscribe(),
      supabase.channel('admins-sub').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: 'role=eq.admin' }, () => {
        refetchAdmins();
      }).subscribe()
    ];
    return () => { channels.forEach(c => supabase.removeChannel(c)); };
  }, [refetchName, refetchEmail, refetchPhone, refetchCommission, refetchPackages, refetchAdmins]);

  const handleSaveGeneral = async () => {
    if (!user) return;
    try {
      await Promise.all([
        settingsService.updateSetting('platform_name', settingsForm.platformName, user.id),
        settingsService.updateSetting('support_email', settingsForm.supportEmail, user.id),
        settingsService.updateSetting('contact_phone', settingsForm.contactPhone, user.id),
      ]);
      toast.success("General settings saved");
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  const handleUpdateCommission = async () => {
    if (!user) return;
    try {
      await settingsService.updateSetting('commission_rate', settingsForm.commissionRate, user.id);
      toast.success("Commission rate updated");
    } catch (error) {
      toast.error("Failed to update commission");
    }
  };

  // Handlers for admins and packages omitted for brevity but UI assumes they exist. 
  // Ideally we implement full CRUD for packages and admin management.
  // For now, I'll stick to display and basic updates.

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
                    <Input
                      value={settingsForm.platformName}
                      onChange={e => setSettingsForm({ ...settingsForm, platformName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Support Email</Label>
                    <Input
                      value={settingsForm.supportEmail}
                      onChange={e => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <Input defaultValue="KSh (Kenya Shillings)" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input
                      value={settingsForm.contactPhone}
                      onChange={e => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                    />
                  </div>
                </div>
                <Button variant="coral" onClick={handleSaveGeneral}>Save Settings</Button>
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
                    <Input
                      type="number"
                      value={settingsForm.commissionRate}
                      onChange={e => setSettingsForm({ ...settingsForm, commissionRate: e.target.value })}
                      min="0" max="100"
                    />
                  </div>
                  <div className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      Current: <strong className="text-coral">{settingsForm.commissionRate}%</strong> of each brand deal
                    </p>
                  </div>
                </div>
                <Button variant="coral" onClick={handleUpdateCommission}>Update Commission Rate</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Packages (Brand-Only)</CardTitle>
                <CardDescription>These packages are visible only to brands and admins.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {packages?.map((pkg) => (
                  <div key={pkg.id} className="p-4 rounded-xl bg-muted/50 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{pkg.name}</h4>
                      <p className="text-sm text-muted-foreground">{pkg.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-coral">{pkg.currency} {pkg.price.toLocaleString()}</p>
                      <Button variant="ghost" size="sm" className="text-xs mt-1"><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                    </div>
                  </div>
                ))}
                {(!packages || packages.length === 0) && <div className="text-center py-4 text-muted-foreground">No packages defined.</div>}
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
                {admins?.map((admin: any) => (
                  <div key={admin.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-amber-700" />
                      </div>
                      <div>
                        <p className="font-medium">{admin.full_name || 'Admin'}</p>
                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{admin.role}</p>
                      <p className="text-xs text-muted-foreground">Since {admin.created_at ? format(new Date(admin.created_at), 'MMM yyyy') : 'N/A'}</p>
                    </div>
                  </div>
                ))}

                {/* Note: In a real app, implement search and promote user to admin flow here */}
                <div className="p-4 border border-dashed rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">To add an admin, go to Users page and promote a user.</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/admin/users">Go to Users</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
