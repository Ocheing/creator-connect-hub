import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignService, applicationService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import {
    ArrowLeft, Calendar, DollarSign, Users, Globe, Briefcase,
    CheckCircle, Clock, AlertCircle, Share2, Loader2, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const CampaignDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const userType = (profile?.role as "brand" | "influencer" | "admin") || "influencer";

    const [isApplyOpen, setIsApplyOpen] = useState(false);
    const [appForm, setAppForm] = useState({
        coverLetter: "",
        proposedRate: "",
        proposedDeliverables: ""
    });

    // Fetch Campaign Details
    const { data: campaign, isLoading: isLoadingCampaign } = useQuery({
        queryKey: ["campaign", id],
        queryFn: () => campaignService.getCampaign(id!),
        enabled: !!id,
    });

    // Fetch Application Status (if influencer)
    const { data: myApplication } = useQuery({
        queryKey: ["my-application", id, user?.id],
        queryFn: async () => {
            const apps = await applicationService.getApplications({
                campaignId: id,
                influencerId: user?.id
            });
            return apps.length > 0 ? apps[0] : null;
        },
        enabled: !!id && !!user && userType === "influencer",
    });

    const applyMutation = useMutation({
        mutationFn: async () => {
            if (!user || !campaign) return;
            await applicationService.createApplication({
                campaign_id: campaign.id,
                influencer_id: user.id,
                cover_letter: appForm.coverLetter,
                proposed_rate: parseFloat(appForm.proposedRate) || 0,
                proposed_deliverables: appForm.proposedDeliverables
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-application", id, user?.id] });
            toast({ title: "Application Sent", description: "The brand will review your application soon." });
            setIsApplyOpen(false);
            setAppForm({ coverLetter: "", proposedRate: "", proposedDeliverables: "" });
        },
        onError: (err: Error) => {
            toast({ variant: "destructive", title: "Error", description: err.message });
        }
    });

    const handleApply = () => {
        if (!appForm.coverLetter.trim()) {
            toast({ variant: "destructive", title: "Error", description: "Please write a cover letter." });
            return;
        }
        applyMutation.mutate();
    };

    if (isLoadingCampaign) {
        return (
            <DashboardLayout userType={userType as any}>
                <div className="flex items-center justify-center h-[50vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-coral" />
                </div>
            </DashboardLayout>
        );
    }

    if (!campaign) {
        return (
            <DashboardLayout userType={userType as any}>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-2">Campaign Not Found</h2>
                    <p className="text-muted-foreground mb-6">The campaign you are looking for does not exist or has been removed.</p>
                    <Button asChild>
                        <Link to={userType === "brand" ? "/dashboard/campaigns" : "/dashboard/discover"}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const isBrandOwner = userType === "brand" && campaign.brand_id === user?.id;
    const daysLeft = campaign.application_deadline
        ? Math.ceil((new Date(campaign.application_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <DashboardLayout userType={userType as any}>
            <div className="max-w-5xl mx-auto space-y-8 pb-10">
                {/* Header Navigation */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to={userType === "brand" ? "/dashboard/campaigns" : "/dashboard/discover"}>
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-heading font-bold">{campaign.title}</h1>
                            <Badge variant="outline" className="capitalize">
                                {campaign.status.replace("_", " ")}
                            </Badge>
                        </div>
                        {userType === "influencer" && (
                            <p className="text-muted-foreground">by Brand #{campaign.brand_id.slice(0, 8)}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        {isBrandOwner ? (
                            <Button
                                variant="outline"
                                onClick={() => toast({ title: "Coming Soon", description: "Editing campaigns will be available soon." })}
                            >
                                Edit Campaign
                            </Button>
                        ) : userType === "influencer" ? (
                            myApplication ? (
                                <Button variant="secondary" disabled className="gap-2">
                                    {myApplication.status === "approved" ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                                        myApplication.status === "rejected" ? <AlertCircle className="w-4 h-4 text-red-600" /> :
                                            <Clock className="w-4 h-4 text-yellow-600" />}
                                    Application {myApplication.status}
                                </Button>
                            ) : (
                                <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="coral">Apply Now</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>Apply for {campaign.title}</DialogTitle>
                                            <DialogDescription>
                                                Submit your proposal to the brand.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Proposed Rate (KES)</Label>
                                                <Input
                                                    type="number"
                                                    placeholder={campaign.budget ? String(campaign.cost_per_influencer || campaign.budget) : "0"}
                                                    value={appForm.proposedRate}
                                                    onChange={(e) => setAppForm({ ...appForm, proposedRate: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>How will you deliver?</Label>
                                                <Textarea
                                                    placeholder="I will create 2 reels and..."
                                                    value={appForm.proposedDeliverables}
                                                    onChange={(e) => setAppForm({ ...appForm, proposedDeliverables: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Cover Letter</Label>
                                                <Textarea
                                                    placeholder="Tell the brand why you are a good fit..."
                                                    rows={4}
                                                    value={appForm.coverLetter}
                                                    onChange={(e) => setAppForm({ ...appForm, coverLetter: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsApplyOpen(false)}>Cancel</Button>
                                            <Button variant="coral" onClick={handleApply} disabled={applyMutation.isPending}>
                                                {applyMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                                Submit Application
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )
                        ) : null}
                        <Button variant="ghost" size="icon">
                            <Share2 className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content - Left Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Overview Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-2">Description</h3>
                                    <p className="text-muted-foreground whitespace-pre-line">{campaign.description}</p>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold mb-2">Requirements</h3>
                                        <p className="text-muted-foreground whitespace-pre-line text-sm">{campaign.requirements || "No specific requirements listed."}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Deliverables</h3>
                                        <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                                            {campaign.deliverables && campaign.deliverables.length > 0 ? (
                                                campaign.deliverables.map((d: string, i: number) => <li key={i}>{d}</li>)
                                            ) : (
                                                <li>No specific deliverables listed.</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">Target Platforms</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {campaign.target_platforms && campaign.target_platforms.map((p: string) => (
                                            <Badge key={p} className="flex items-center gap-1">
                                                <Globe className="w-3 h-3" />
                                                {p}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    {/* Sidebar - Right Column */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Campaign Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" /> Budget
                                    </span>
                                    <span className="font-semibold">{formatCurrency(campaign.budget)}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Users className="w-4 h-4" /> Max Influencers
                                    </span>
                                    <span className="font-semibold">{campaign.max_influencers}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Start Date
                                    </span>
                                    <span className="font-semibold">
                                        {campaign.start_date ? format(new Date(campaign.start_date), "MMM d, yyyy") : "TBD"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Deadline
                                    </span>
                                    <span className={`font-semibold ${daysLeft < 3 ? "text-red-600" : ""}`}>
                                        {campaign.application_deadline ? format(new Date(campaign.application_deadline), "MMM d") : "No deadline"}
                                        {campaign.application_deadline && daysLeft > 0 && ` (${daysLeft} days left)`}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Influencer Specific: Match Status or Tips */}
                        {userType === "influencer" && !myApplication && (
                            <Card className="bg-gradient-to-br from-coral/10 to-transparent border-coral/20">
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-coral mb-2">Interested?</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        This campaign matches your profile categories. Review the requirements and apply if you're a good fit!
                                    </p>
                                    <Button className="w-full bg-coral hover:bg-coral/90" onClick={() => setIsApplyOpen(true)}>
                                        Apply for Campaign
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CampaignDetails;
