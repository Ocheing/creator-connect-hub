import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { User, Bell, Shield, CreditCard, Globe, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { profileService, influencerService } from "@/services/api";

interface DashboardSettingsProps {
  userType?: "influencer" | "brand";
}

const DashboardSettings = ({ userType = "influencer" }: DashboardSettingsProps) => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Password Visibility State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile State
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    website: "",
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Payout State
  const [payoutSettings, setPayoutSettings] = useState({
    method: "mpesa",
    mpesaNumber: "",
    bankName: "",
    accountNumber: "",
  });

  // Load initial data
  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        location: profile.location || "",
        bio: profile.bio || "",
        website: profile.website || "",
      });
    }

    // Load payout settings from user metadata if available
    if (user?.user_metadata?.payout_settings) {
      setPayoutSettings(user.user_metadata.payout_settings);
    }
  }, [profile, user]);

  const handleProfileUpdate = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await profileService.updateProfile(user.id, {
        full_name: profileData.full_name,
        phone: profileData.phone,
        location: profileData.location,
        bio: profileData.bio,
        website: profileData.website,
      });
      await refreshProfile();
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully saved.",
      });
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error instanceof Error ? error.message : "Failed to update profile."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Please ensure your new password confirmation matches.",
      });
      return;
    }

    if (!passwordData.currentPassword) {
      toast({
        variant: "destructive",
        title: "Current Password Required",
        description: "Please enter your current password to verify your identity.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verify current password
      if (user?.email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: passwordData.currentPassword,
        });

        if (signInError) {
          throw new Error("Incorrect current password.");
        }
      }

      // 2. Update to new password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast({
        title: "Success! Password Updated",
        description: "Your password has been changed securely. You can now use your new password.",
        className: "bg-green-100 border-green-200 text-green-800",
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error instanceof Error ? error.message : "Failed to change password."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayoutSave = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Save to user metadata
      const { error } = await supabase.auth.updateUser({
        data: { payout_settings: payoutSettings },
      });

      if (error) throw error;

      toast({
        title: "Payout Settings Saved",
        description: "Your payment preferences have been updated.",
      });
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error instanceof Error ? error.message : "Failed to save payout settings."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout userType={userType}>
      <div className="space-y-8 pb-10">
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
                    <div className="w-20 h-20 rounded-full bg-coral/10 flex items-center justify-center overflow-hidden">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-coral text-xl">{profileData.full_name?.[0] || "U"}</span>
                      )}
                    </div>
                    {/* Placeholder for avatar upload */}
                    <Button variant="outline" size="sm" disabled>Change Photo (Coming Soon)</Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={profileData.email} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Website / Portfolio URL</Label>
                      <Input
                        value={profileData.website}
                        onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                        placeholder="https://"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <Button variant="coral" onClick={handleProfileUpdate} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {userType === "influencer" && (
              <Card>
                <CardHeader>
                  <CardTitle>Connected Accounts</CardTitle>
                  <CardDescription>Manage your social profiles.</CardDescription>
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
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button variant="coral" onClick={handlePasswordChange} disabled={isLoading || !passwordData.newPassword || !passwordData.currentPassword}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {userType === "influencer" && (
            <TabsContent value="payout" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payout Settings</CardTitle>
                  <CardDescription>Configure how you receive payments via Paystack.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-base">Preferred Method</Label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {["mpesa", "bank"].map((method) => (
                        <div
                          key={method}
                          onClick={() => setPayoutSettings({ ...payoutSettings, method })}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-colors flex items-center justify-between ${payoutSettings.method === method
                            ? "border-coral bg-coral/5"
                            : "border-border hover:border-coral/50"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            {method === 'mpesa' ? <CreditCard className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                            <span className="font-medium">
                              {method === 'mpesa' ? 'Mobile Money (M-Pesa)' : 'Bank Transfer'}
                            </span>
                          </div>
                          {payoutSettings.method === method && <CheckCircle className="w-5 h-5 text-coral" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {payoutSettings.method === "mpesa" && (
                    <div className="space-y-2">
                      <Label>M-Pesa Mobile Number</Label>
                      <Input
                        placeholder="+254 7XX XXX XXX"
                        value={payoutSettings.mpesaNumber}
                        onChange={(e) => setPayoutSettings({ ...payoutSettings, mpesaNumber: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">Ensure this number is registered with M-Pesa.</p>
                    </div>
                  )}

                  {payoutSettings.method === "bank" && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Bank Name</Label>
                        <Input
                          placeholder="e.g. KCB Bank"
                          value={payoutSettings.bankName}
                          onChange={(e) => setPayoutSettings({ ...payoutSettings, bankName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Number</Label>
                        <Input
                          placeholder="Account number"
                          value={payoutSettings.accountNumber}
                          onChange={(e) => setPayoutSettings({ ...payoutSettings, accountNumber: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  <Button variant="coral" onClick={handlePayoutSave} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save Payout Info
                  </Button>
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
