import { useState, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Briefcase,
    Calendar,
    DollarSign,
    Loader2,
    Users,
    Globe,
    CheckCircle,
    Tag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { campaignService, categoryService } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import CategorySelector from "@/components/categories/CategorySelector";
import type { SocialPlatform } from "@/types/database.types";

const PLATFORMS: { value: SocialPlatform; label: string }[] = [
    { value: "instagram", label: "Instagram" },
    { value: "tiktok", label: "TikTok" },
    { value: "youtube", label: "YouTube" },
    { value: "twitter", label: "Twitter / X" },
    { value: "facebook", label: "Facebook" },
    { value: "linkedin", label: "LinkedIn" },
];

const CreateCampaign = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [step, setStep] = useState(1);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);

    const [form, setForm] = useState({
        title: "",
        description: "",
        requirements: "",
        deliverables: "",
        budget: "",
        costPerInfluencer: "",
        maxInfluencers: "5",
        startDate: "",
        endDate: "",
        applicationDeadline: "",
        targetFollowersMin: "1000",
        targetFollowersMax: "100000",
        targetEngagementMin: "2",
    });

    // Functional updater helper to avoid stale closure bugs
    const updateField = useCallback(
        (field: keyof typeof form, value: string) =>
            setForm((prev) => ({ ...prev, [field]: value })),
        []
    );

    // Fetch categories for review step name resolution
    const { data: allCategories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoryService.getCategories(true),
        staleTime: 5 * 60 * 1000,
    });

    const togglePlatform = (platform: SocialPlatform) => {
        setSelectedPlatforms((prev) =>
            prev.includes(platform)
                ? prev.filter((p) => p !== platform)
                : [...prev, platform]
        );
    };

    const mutation = useMutation({
        mutationFn: async (publishImmediate: boolean = false) => {
            if (!user) throw new Error("Not authenticated");

            // 1. Always create as 'draft' — RLS enforces status='draft' on INSERT
            const campaign = await campaignService.createCampaign({
                brand_id: user.id,
                title: form.title,
                description: form.description || null,
                requirements: form.requirements || null,
                deliverables: form.deliverables
                    ? form.deliverables.split("\n").filter(Boolean)
                    : [],
                target_platforms: selectedPlatforms,
                target_niches: [], // Migrated to junction table
                target_followers_min: parseInt(form.targetFollowersMin) || 1000,
                target_followers_max: parseInt(form.targetFollowersMax) || 100000,
                target_engagement_min: parseFloat(form.targetEngagementMin) || 0,
                budget: parseFloat(form.budget) || 0,
                cost_per_influencer: parseFloat(form.costPerInfluencer) || 0,
                max_influencers: parseInt(form.maxInfluencers) || 5,
                status: "draft", // Always draft on INSERT
                start_date: form.startDate || null,
                end_date: form.endDate || null,
                application_deadline: form.applicationDeadline || null,
            });

            // 2. Set campaign categories via junction table
            if (selectedCategoryIds.length > 0) {
                await categoryService.setCampaignCategories(
                    campaign.id,
                    selectedCategoryIds,
                    true // isNew flag to skip deletion
                );
            }

            // 3. If publishing, update status to 'active' in a second call
            if (publishImmediate) {
                await campaignService.updateCampaign(campaign.id, { status: "active" });

                // 4. Trigger auto-matching via SECURITY DEFINER RPC (non-blocking)
                campaignService
                    .triggerAutoMatching(campaign.id, user.id, campaign.title)
                    .catch(console.error);
            }

            return { campaign, publishImmediate };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["brandCampaignsAll"] });
            toast({
                title: data.publishImmediate ? "Campaign Published!" : "Campaign Created!",
                description: data.publishImmediate
                    ? "Your campaign is now active and invitations have been sent to matching influencers."
                    : "Your campaign has been saved as a draft. You can publish it from the campaigns page.",
            });
            navigate("/dashboard/campaigns");
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to create campaign.",
            });
        },
    });

    const handleSubmit = (publishImmediate: boolean = false) => {
        // Guard: prevent duplicate submissions from double-clicks
        if (mutation.isPending) return;

        if (!form.title.trim()) {
            toast({
                variant: "destructive",
                title: "Title Required",
                description: "Please provide a campaign title.",
            });
            return;
        }
        if (!form.budget || parseFloat(form.budget) <= 0) {
            toast({
                variant: "destructive",
                title: "Budget Required",
                description: "Please set a campaign budget greater than 0.",
            });
            return;
        }
        if (selectedCategoryIds.length === 0) {
            toast({
                variant: "destructive",
                title: "Categories Required",
                description: "Please select at least one category so influencers can discover your campaign.",
            });
            return;
        }
        // Date validation: end date must be after start date
        if (form.startDate && form.endDate && form.endDate < form.startDate) {
            toast({
                variant: "destructive",
                title: "Invalid Dates",
                description: "End date must be on or after the start date.",
            });
            return;
        }
        // Date validation: application deadline must be on or before end date
        if (form.applicationDeadline && form.endDate && form.applicationDeadline > form.endDate) {
            toast({
                variant: "destructive",
                title: "Invalid Deadline",
                description: "Application deadline must be on or before the campaign end date.",
            });
            return;
        }
        mutation.mutate(publishImmediate);
    };

    const canProceed = () => {
        if (step === 1) return form.title.trim().length > 0;
        if (step === 2) return selectedCategoryIds.length > 0;
        if (step === 3) return parseFloat(form.budget) > 0;
        return true;
    };

    return (
        <DashboardLayout userType="brand">
            <div className="max-w-3xl mx-auto space-y-8 pb-10">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/dashboard/campaigns">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-heading font-bold">Create Campaign</h1>
                        <p className="text-muted-foreground">
                            Set up a new influencer marketing campaign
                        </p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-2">
                    {[
                        { num: 1, label: "Details" },
                        { num: 2, label: "Categories" },
                        { num: 3, label: "Budget & Timeline" },
                        { num: 4, label: "Review" },
                    ].map((s, i) => (
                        <div key={s.num} className="flex items-center flex-1">
                            <button
                                onClick={() => setStep(s.num)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full ${step === s.num
                                        ? "bg-coral text-white shadow-sm"
                                        : step > s.num
                                            ? "bg-coral/10 text-coral"
                                            : "bg-muted text-muted-foreground"
                                    }`}
                            >
                                <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step > s.num
                                            ? "bg-coral text-white"
                                            : step === s.num
                                                ? "bg-white/20 text-white"
                                                : "bg-muted-foreground/20"
                                        }`}
                                >
                                    {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
                                </span>
                                <span className="hidden sm:inline">{s.label}</span>
                            </button>
                            {i < 3 && (
                                <div
                                    className={`h-0.5 w-4 shrink-0 ${step > s.num ? "bg-coral" : "bg-border"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step 1: Campaign Details */}
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-coral" />
                                    Campaign Details
                                </CardTitle>
                                <CardDescription>
                                    Tell influencers about your campaign
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="title">
                                        Campaign Title <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Summer Fashion Collection Launch"
                                        value={form.title}
                                        onChange={(e) =>
                                            updateField("title", e.target.value)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe what the campaign is about, who your target audience is..."
                                        rows={4}
                                        value={form.description}
                                        onChange={(e) =>
                                            updateField("description", e.target.value)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="requirements">Requirements</Label>
                                    <Textarea
                                        id="requirements"
                                        placeholder="What do you need from influencers? (e.g., min followers, audience type)"
                                        rows={3}
                                        value={form.requirements}
                                        onChange={(e) =>
                                            updateField("requirements", e.target.value)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deliverables">
                                        Deliverables (one per line)
                                    </Label>
                                    <Textarea
                                        id="deliverables"
                                        placeholder={"1 Instagram Reel\n2 Instagram Stories\n1 TikTok Video"}
                                        rows={3}
                                        value={form.deliverables}
                                        onChange={(e) =>
                                            updateField("deliverables", e.target.value)
                                        }
                                    />
                                </div>

                                {/* Platform Selection */}
                                <div className="space-y-2">
                                    <Label>Target Platforms</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {PLATFORMS.map((p) => (
                                            <Button
                                                key={p.value}
                                                type="button"
                                                variant={
                                                    selectedPlatforms.includes(p.value)
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                className={`rounded-full ${selectedPlatforms.includes(p.value)
                                                        ? "bg-coral hover:bg-coral/90 text-white"
                                                        : ""
                                                    }`}
                                                onClick={() => togglePlatform(p.value)}
                                            >
                                                <Globe className="w-3.5 h-3.5 mr-1.5" />
                                                {p.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Step 2: Category Selection */}
                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-coral" />
                                    Campaign Categories
                                </CardTitle>
                                <CardDescription>
                                    Select categories so relevant influencers can discover your
                                    campaign. Influencers are matched based on shared categories.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CategorySelector
                                    selectedIds={selectedCategoryIds}
                                    onChange={setSelectedCategoryIds}
                                    maxSelection={5}
                                    label="Select Campaign Categories"
                                    description="Choose up to 5 categories that best describe your campaign"
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Step 3: Budget & Timeline */}
                {step === 3 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-coral" />
                                    Budget & Timeline
                                </CardTitle>
                                <CardDescription>
                                    Set your budget and campaign dates
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="budget">
                                            Total Budget (KES) <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="budget"
                                                type="number"
                                                min="0"
                                                className="pl-9"
                                                placeholder="50,000"
                                                value={form.budget}
                                                onChange={(e) =>
                                                    updateField("budget", e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="costPerInfluencer">
                                            Cost Per Influencer (KES)
                                        </Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="costPerInfluencer"
                                                type="number"
                                                min="0"
                                                className="pl-9"
                                                placeholder="10,000"
                                                value={form.costPerInfluencer}
                                                onChange={(e) =>
                                                    updateField("costPerInfluencer", e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="maxInfluencers">Max Influencers</Label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="maxInfluencers"
                                                type="number"
                                                min="1"
                                                className="pl-9"
                                                value={form.maxInfluencers}
                                                onChange={(e) =>
                                                    updateField("maxInfluencers", e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="minFollowers">Min Followers</Label>
                                        <Input
                                            id="minFollowers"
                                            type="number"
                                            min="0"
                                            value={form.targetFollowersMin}
                                            onChange={(e) =>
                                                updateField("targetFollowersMin", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxFollowers">Max Followers</Label>
                                        <Input
                                            id="maxFollowers"
                                            type="number"
                                            min="0"
                                            value={form.targetFollowersMax}
                                            onChange={(e) =>
                                                updateField("targetFollowersMax", e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Start Date
                                        </Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={form.startDate}
                                            onChange={(e) =>
                                                updateField("startDate", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endDate">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            End Date
                                        </Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={form.endDate}
                                            onChange={(e) =>
                                                updateField("endDate", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="appDeadline">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Application Deadline
                                        </Label>
                                        <Input
                                            id="appDeadline"
                                            type="date"
                                            value={form.applicationDeadline}
                                            onChange={(e) =>
                                                updateField("applicationDeadline", e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Step 4: Review */}
                {step === 4 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-coral" />
                                    Review Campaign
                                </CardTitle>
                                <CardDescription>
                                    Review your campaign details before creating
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Title & Description */}
                                <div className="space-y-1.5">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Campaign Title
                                    </p>
                                    <p className="text-lg font-semibold">{form.title || "—"}</p>
                                </div>
                                {form.description && (
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            Description
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {form.description}
                                        </p>
                                    </div>
                                )}

                                {/* Categories */}
                                <div className="space-y-1.5">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Categories ({selectedCategoryIds.length})
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCategoryIds.length > 0 ? (
                                            allCategories
                                                .filter((c) => selectedCategoryIds.includes(c.id))
                                                .map((cat) => (
                                                    <Badge
                                                        key={cat.id}
                                                        className="bg-coral/10 text-coral border-coral/20"
                                                    >
                                                        <Tag className="w-3 h-3 mr-1" />
                                                        {cat.name}
                                                    </Badge>
                                                ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No categories selected
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Platforms */}
                                {selectedPlatforms.length > 0 && (
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            Platforms
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedPlatforms.map((p) => (
                                                <Badge key={p} variant="outline" className="capitalize">
                                                    {p}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Budget row */}
                                <div className="grid sm:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/50">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Budget</p>
                                        <p className="font-semibold">
                                            KSh {parseInt(form.budget || "0").toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Per Influencer
                                        </p>
                                        <p className="font-semibold">
                                            KSh{" "}
                                            {parseInt(form.costPerInfluencer || "0").toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Max Influencers
                                        </p>
                                        <p className="font-semibold">{form.maxInfluencers}</p>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid sm:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/50">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Start Date</p>
                                        <p className="font-semibold">
                                            {form.startDate || "Not set"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">End Date</p>
                                        <p className="font-semibold">
                                            {form.endDate || "Not set"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Apply By
                                        </p>
                                        <p className="font-semibold">
                                            {form.applicationDeadline || "Not set"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setStep((s) => Math.max(1, s - 1))}
                        disabled={step === 1}
                    >
                        Back
                    </Button>
                    {step < 4 ? (
                        <Button
                            variant="coral"
                            onClick={() => setStep((s) => Math.min(4, s + 1))}
                            disabled={!canProceed()}
                        >
                            Continue
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handleSubmit(false)}
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : null}
                                Save as Draft
                            </Button>
                            <Button
                                variant="coral"
                                onClick={() => handleSubmit(true)}
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : null}
                                Publish & Find Influencers
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CreateCampaign;
