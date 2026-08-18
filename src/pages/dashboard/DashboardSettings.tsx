import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { User, Bell, Shield, CreditCard, Globe, Loader2, CheckCircle, Eye, EyeOff, Tag } from "lucide-react";
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
import { profileService, influencerService, categoryService } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CategorySelector from "@/components/categories/CategorySelector";

interface DashboardSettingsProps {
  userType?: "influencer" | "brand";
}

const DashboardSettings = ({ userType: userTypeProp = "influencer" }: DashboardSettingsProps) => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isPayoutLoading, setIsPayoutLoading] = useState(false);

  // Auto-detect the actual user type from profile role
  const userType = (profile?.role === "brand" ? "brand" : profile?.role === "influencer" ? "influencer" : userTypeProp) as "influencer" | "brand";

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
    if (isProfileLoading) return;
    setIsProfileLoading(true);
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
      setIsProfileLoading(false);
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

    setIsPasswordLoading(true);
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
      setIsPasswordLoading(false);
    }
  };

  const handlePayoutSave = async () => {
    if (!user) return;
    if (isPayoutLoading) return;
    setIsPayoutLoading(true);
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
      setIsPayoutLoading(false);
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
              <TabsTrigger value="categories"><Tag className="w-4 h-4 mr-2" />Categories</TabsTrigger>
            )}
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
                  <Button variant="coral" onClick={handleProfileUpdate} disabled={isProfileLoading}>
                    {isProfileLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <SocialAccountsCard userType={userType} userId={user?.id} />
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
                <Button variant="coral" onClick={handlePasswordChange} disabled={isPasswordLoading || !passwordData.newPassword || !passwordData.currentPassword}>
                  {isPasswordLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {userType === "influencer" && (
            <CategoriesTabContent userId={user?.id} toast={toast} queryClient={queryClient} />
          )}

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

                  <Button variant="coral" onClick={handlePayoutSave} disabled={isPayoutLoading}>
                    {isPayoutLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
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

// ── Social Accounts Card ──
interface SocialAccountsCardProps {
  userType: "influencer" | "brand";
  userId?: string;
}

const PLATFORMS = [
  { key: "instagram", label: "Instagram", handleField: "instagram_handle", placeholder: "@your_instagram" },
  { key: "tiktok", label: "TikTok", handleField: "tiktok_handle", placeholder: "@your_tiktok" },
  { key: "youtube", label: "YouTube", handleField: "youtube_handle", placeholder: "@your_youtube" },
  { key: "twitter", label: "Twitter / X", handleField: "twitter_handle", placeholder: "@your_twitter" },
] as const;

const SocialAccountsCard = ({ userType, userId }: SocialAccountsCardProps) => {
  const { toast } = useToast();
  const [socialHandles, setSocialHandles] = useState<Record<string, string>>({
    instagram_handle: "",
    tiktok_handle: "",
    youtube_handle: "",
    twitter_handle: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSocials, setIsLoadingSocials] = useState(true);

  // Load existing social handles
  useEffect(() => {
    const loadSocials = async () => {
      if (!userId) return;
      setIsLoadingSocials(true);
      try {
        if (userType === "influencer") {
          const { data } = await supabase
            .from("influencer_profiles")
            .select("instagram_handle, tiktok_handle, youtube_handle, twitter_handle")
            .eq("profile_id", userId)
            .single();

          if (data) {
            setSocialHandles({
              instagram_handle: data.instagram_handle || "",
              tiktok_handle: data.tiktok_handle || "",
              youtube_handle: data.youtube_handle || "",
              twitter_handle: data.twitter_handle || "",
            });
          }
        } else {
          // For brands, store social handles in brand_profiles
          const { data } = await supabase
            .from("brand_profiles")
            .select("company_website")
            .eq("profile_id", userId)
            .single();

          // Brands can also store socials via user metadata
          const { data: { user } } = await supabase.auth.getUser();
          const socials = user?.user_metadata?.social_handles || {};
          setSocialHandles({
            instagram_handle: socials.instagram_handle || "",
            tiktok_handle: socials.tiktok_handle || "",
            youtube_handle: socials.youtube_handle || "",
            twitter_handle: socials.twitter_handle || "",
          });
        }
      } catch (err) {
        console.error("Error loading socials:", err);
      } finally {
        setIsLoadingSocials(false);
      }
    };

    loadSocials();
  }, [userId, userType]);

  const handleSaveSocials = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      if (userType === "influencer") {
        const { error } = await supabase
          .from("influencer_profiles")
          .update({
            instagram_handle: socialHandles.instagram_handle || null,
            tiktok_handle: socialHandles.tiktok_handle || null,
            youtube_handle: socialHandles.youtube_handle || null,
            twitter_handle: socialHandles.twitter_handle || null,
          })
          .eq("profile_id", userId);

        if (error) throw error;
      } else {
        // Save brand socials to user metadata
        const { error } = await supabase.auth.updateUser({
          data: { social_handles: socialHandles },
        });
        if (error) throw error;
      }

      toast({
        title: "Social Profiles Updated",
        description: "Your social accounts have been connected successfully.",
      });
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save social profiles.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPlatformIcon = (key: string) => {
    const colors: Record<string, string> = {
      instagram: "text-pink-500",
      tiktok: "text-foreground",
      youtube: "text-red-500",
      twitter: "text-sky-500",
    };
    return <Globe className={`w-5 h-5 ${colors[key] || "text-muted-foreground"}`} />;
  };

  const connectedCount = Object.values(socialHandles).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-coral" />
          Connected Accounts
        </CardTitle>
        <CardDescription>
          Connect your social media profiles.
          {connectedCount > 0 && (
            <span className="ml-2 text-xs font-medium text-coral">
              {connectedCount}/{PLATFORMS.length} connected
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingSocials ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-coral" />
          </div>
        ) : (
          <>
            {PLATFORMS.map((platform) => (
              <div
                key={platform.key}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3 min-w-[120px]">
                  {getPlatformIcon(platform.key)}
                  <span className="font-medium text-sm">{platform.label}</span>
                </div>
                <Input
                  className="flex-1"
                  placeholder={platform.placeholder}
                  value={socialHandles[platform.handleField]}
                  onChange={(e) =>
                    setSocialHandles({
                      ...socialHandles,
                      [platform.handleField]: e.target.value,
                    })
                  }
                />
                {socialHandles[platform.handleField] && (
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                )}
              </div>
            ))}
            <Button
              variant="coral"
              onClick={handleSaveSocials}
              disabled={isSaving}
              className="mt-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Save Social Profiles
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ── Extracted Categories Tab Content ──
interface CategoriesTabProps {
  userId?: string;
  toast: ReturnType<typeof useToast>["toast"];
  queryClient: any;
}

const CategoriesTabContent = ({ userId, toast, queryClient }: CategoriesTabProps) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Fetch influencer's current categories
  const { data: currentCategories = [], isLoading: isFetching } = useQuery({
    queryKey: ["influencer-categories", userId],
    queryFn: () => categoryService.getInfluencerCategories(userId!),
    enabled: !!userId,
  });

  // Sync fetched categories into local state (once)
  useEffect(() => {
    if (currentCategories.length > 0 && !hasLoaded) {
      setSelectedCategoryIds(currentCategories.map((c) => c.category_id));
      setHasLoaded(true);
    } else if (currentCategories.length === 0 && !hasLoaded && !isFetching) {
      setHasLoaded(true);
    }
  }, [currentCategories, hasLoaded, isFetching]);

  const saveMutation = useMutation({
    mutationFn: () =>
      categoryService.setInfluencerCategories(userId!, selectedCategoryIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["influencer-categories", userId] });
      queryClient.invalidateQueries({ queryKey: ["matching-campaigns", userId] });
      toast({
        title: "Categories Saved",
        description: "Your niche categories have been updated. Campaign matching will now reflect your choices.",
      });
    },
    onError: (err: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to save categories.",
      });
    },
  });

  return (
    <TabsContent value="categories" className="mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-coral" />
            Your Niche Categories
          </CardTitle>
          <CardDescription>
            Select the categories that best describe your content. Brands will
            find you based on these categories when creating campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-coral" />
            </div>
          ) : (
            <>
              <CategorySelector
                selectedIds={selectedCategoryIds}
                onChange={setSelectedCategoryIds}
                maxSelection={8}
                label="Select Your Niches"
                description="Choose up to 8 categories that match your content"
              />
              <Button
                variant="coral"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Categories
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default DashboardSettings;
