// ============================================================
// MicroMatch: React Query Hooks
// Type-safe data fetching and caching layer
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
    profileService,
    influencerService,
    brandService,
    campaignService,
    applicationService,
    matchService,
    paymentService,
    messageService,
    notificationService,
    blogService,
    testimonialService,
    pricingService,
    leadService,
    dashboardService,
    adminService,
    settingsService,
} from '@/services/api';
import type {
    ProfileUpdate,
    InfluencerProfileUpdate,
    BrandProfileUpdate,
    CampaignInsert,
    CampaignUpdate,
    CampaignApplicationInsert,
    BlogPostInsert,
    BlogPostUpdate,
    TestimonialInsert,
    TestimonialUpdate,
    LeadInsert,
} from '@/types/database.types';

// ────────────────────────────────────────────────────────
// Query Key Factory
// ────────────────────────────────────────────────────────

export const queryKeys = {
    profile: (id: string) => ['profile', id] as const,
    influencerProfile: (id: string) => ['influencerProfile', id] as const,
    brandProfile: (id: string) => ['brandProfile', id] as const,
    campaigns: (filters?: Record<string, unknown>) => ['campaigns', filters] as const,
    campaign: (id: string) => ['campaign', id] as const,
    applications: (filters?: Record<string, unknown>) => ['applications', filters] as const,
    matches: (filters?: Record<string, unknown>) => ['matches', filters] as const,
    payments: (filters?: Record<string, unknown>) => ['payments', filters] as const,
    payouts: (filters?: Record<string, unknown>) => ['payouts', filters] as const,
    messages: (userId: string) => ['messages', userId] as const,
    notifications: (userId: string) => ['notifications', userId] as const,
    unreadNotifications: (userId: string) => ['unreadNotifications', userId] as const,
    blogPosts: (filters?: Record<string, unknown>) => ['blogPosts', filters] as const,
    blogPost: (slug: string) => ['blogPost', slug] as const,
    testimonials: () => ['testimonials'] as const,
    pricingPackages: () => ['pricingPackages'] as const,
    leads: (filters?: Record<string, unknown>) => ['leads', filters] as const,
    influencerStats: (id: string) => ['influencerStats', id] as const,
    brandStats: (id: string) => ['brandStats', id] as const,
    adminStats: () => ['adminStats'] as const,
    allUsers: (filters?: Record<string, unknown>) => ['allUsers', filters] as const,
    transactionLog: (filters?: Record<string, unknown>) => ['transactionLog', filters] as const,
    commissionRate: () => ['commissionRate'] as const,
};

// ────────────────────────────────────────────────────────
// PROFILE HOOKS
// ────────────────────────────────────────────────────────

export function useProfile(userId?: string) {
    const { user } = useAuth();
    const id = userId || user?.id;

    return useQuery({
        queryKey: queryKeys.profile(id!),
        queryFn: () => profileService.getProfile(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: ({ updates }: { updates: ProfileUpdate }) =>
            profileService.updateProfile(user!.id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.profile(user!.id) });
        },
    });
}

export function useUploadAvatar() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (file: File) => profileService.uploadAvatar(user!.id, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.profile(user!.id) });
        },
    });
}

// ────────────────────────────────────────────────────────
// INFLUENCER PROFILE HOOKS
// ────────────────────────────────────────────────────────

export function useInfluencerProfile(profileId?: string) {
    const { user } = useAuth();
    const id = profileId || user?.id;

    return useQuery({
        queryKey: queryKeys.influencerProfile(id!),
        queryFn: () => influencerService.getInfluencerProfile(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

export function useUpdateInfluencerProfile() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (updates: InfluencerProfileUpdate) =>
            influencerService.updateInfluencerProfile(user!.id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.influencerProfile(user!.id) });
        },
    });
}

// ────────────────────────────────────────────────────────
// BRAND PROFILE HOOKS
// ────────────────────────────────────────────────────────

export function useBrandProfile(profileId?: string) {
    const { user } = useAuth();
    const id = profileId || user?.id;

    return useQuery({
        queryKey: queryKeys.brandProfile(id!),
        queryFn: () => brandService.getBrandProfile(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

export function useUpdateBrandProfile() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (updates: BrandProfileUpdate) =>
            brandService.updateBrandProfile(user!.id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.brandProfile(user!.id) });
        },
    });
}

// ────────────────────────────────────────────────────────
// CAMPAIGN HOOKS
// ────────────────────────────────────────────────────────

export function useCampaigns(filters?: {
    status?: string;
    brandId?: string;
    page?: number;
    pageSize?: number;
}) {
    return useQuery({
        queryKey: queryKeys.campaigns(filters),
        queryFn: () => campaignService.getCampaigns(filters),
        staleTime: 2 * 60 * 1000,
    });
}

export function useCampaign(id: string) {
    return useQuery({
        queryKey: queryKeys.campaign(id),
        queryFn: () => campaignService.getCampaign(id),
        enabled: !!id,
    });
}

export function useCreateCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (campaign: CampaignInsert) => campaignService.createCampaign(campaign),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        },
    });
}

export function useUpdateCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: CampaignUpdate }) =>
            campaignService.updateCampaign(id, updates),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.campaign(id) });
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        },
    });
}

export function useDeleteCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => campaignService.deleteCampaign(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        },
    });
}

// ────────────────────────────────────────────────────────
// APPLICATION HOOKS
// ────────────────────────────────────────────────────────

export function useApplications(filters?: {
    campaignId?: string;
    influencerId?: string;
    status?: string;
}) {
    return useQuery({
        queryKey: queryKeys.applications(filters),
        queryFn: () => applicationService.getApplications(filters),
        staleTime: 2 * 60 * 1000,
    });
}

export function useCreateApplication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (application: CampaignApplicationInsert) =>
            applicationService.createApplication(application),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
    });
}

export function useWithdrawApplication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (applicationId: string) => applicationService.withdrawApplication(applicationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
    });
}

export function useReviewApplication() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: ({
            applicationId,
            status,
            rejectionReason,
        }: {
            applicationId: string;
            status: 'approved' | 'rejected';
            rejectionReason?: string;
        }) => applicationService.reviewApplication(applicationId, status, user!.id, rejectionReason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['adminStats'] });
        },
    });
}

// ────────────────────────────────────────────────────────
// MATCH HOOKS
// ────────────────────────────────────────────────────────

export function useMatches(filters?: {
    campaignId?: string;
    influencerId?: string;
    status?: string;
}) {
    return useQuery({
        queryKey: queryKeys.matches(filters),
        queryFn: () => matchService.getMatches(filters),
        staleTime: 2 * 60 * 1000,
    });
}

export function useCreateMatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (match: {
            campaign_id: string;
            influencer_id: string;
            application_id?: string;
            matched_by: string;
            agreed_rate: number;
        }) => matchService.createMatch(match),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['matches'] });
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        },
    });
}

// ────────────────────────────────────────────────────────
// PAYMENT HOOKS
// ────────────────────────────────────────────────────────

export function usePayments(filters?: {
    brandId?: string;
    campaignId?: string;
    status?: string;
}) {
    return useQuery({
        queryKey: queryKeys.payments(filters),
        queryFn: () => paymentService.getPayments(filters),
        staleTime: 2 * 60 * 1000,
    });
}

export function usePayouts(filters?: {
    influencerId?: string;
    status?: string;
}) {
    return useQuery({
        queryKey: queryKeys.payouts(filters),
        queryFn: () => paymentService.getPayouts(filters),
        staleTime: 2 * 60 * 1000,
    });
}

// ────────────────────────────────────────────────────────
// MESSAGE HOOKS
// ────────────────────────────────────────────────────────

export function useMessages() {
    const { user } = useAuth();

    return useQuery({
        queryKey: queryKeys.messages(user!.id),
        queryFn: () => messageService.getConversations(user!.id),
        enabled: !!user,
        staleTime: 30 * 1000,
    });
}

export function useSendMessage() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (message: {
            receiver_id: string;
            body: string;
            subject?: string;
            campaign_id?: string;
        }) => messageService.sendMessage({ sender_id: user!.id, ...message }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });
}

// ────────────────────────────────────────────────────────
// NOTIFICATION HOOKS
// ────────────────────────────────────────────────────────

export function useNotifications(limit = 50) {
    const { user } = useAuth();

    return useQuery({
        queryKey: queryKeys.notifications(user!.id),
        queryFn: () => notificationService.getNotifications(user!.id, limit),
        enabled: !!user,
        staleTime: 30 * 1000,
    });
}

export function useUnreadNotificationCount() {
    const { user } = useAuth();

    return useQuery({
        queryKey: queryKeys.unreadNotifications(user!.id),
        queryFn: () => notificationService.getUnreadCount(user!.id),
        enabled: !!user,
        refetchInterval: 30 * 1000, // Refetch every 30 seconds
    });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
        },
    });
}

export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: () => notificationService.markAllAsRead(user!.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
        },
    });
}

// ────────────────────────────────────────────────────────
// BLOG POST HOOKS
// ────────────────────────────────────────────────────────

export function useBlogPosts(filters?: {
    status?: string;
    category?: string;
    page?: number;
    pageSize?: number;
}) {
    return useQuery({
        queryKey: queryKeys.blogPosts(filters),
        queryFn: () => blogService.getPosts(filters),
        staleTime: 5 * 60 * 1000,
    });
}

export function useBlogPost(slug: string) {
    return useQuery({
        queryKey: queryKeys.blogPost(slug),
        queryFn: () => blogService.getPostBySlug(slug),
        enabled: !!slug,
    });
}

export function useCreateBlogPost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (post: BlogPostInsert) => blogService.createPost(post),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
        },
    });
}

export function useUpdateBlogPost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: BlogPostUpdate }) =>
            blogService.updatePost(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
        },
    });
}

export function useDeleteBlogPost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => blogService.deletePost(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
        },
    });
}

// ────────────────────────────────────────────────────────
// TESTIMONIAL HOOKS
// ────────────────────────────────────────────────────────

export function useTestimonials(publishedOnly = true) {
    return useQuery({
        queryKey: queryKeys.testimonials(),
        queryFn: () => testimonialService.getTestimonials(publishedOnly),
        staleTime: 10 * 60 * 1000,
    });
}

export function useCreateTestimonial() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (testimonial: TestimonialInsert) =>
            testimonialService.createTestimonial(testimonial),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.testimonials() });
        },
    });
}

export function useUpdateTestimonial() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: TestimonialUpdate }) =>
            testimonialService.updateTestimonial(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.testimonials() });
        },
    });
}

export function useDeleteTestimonial() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => testimonialService.deleteTestimonial(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.testimonials() });
        },
    });
}

// ────────────────────────────────────────────────────────
// PRICING PACKAGE HOOKS
// ────────────────────────────────────────────────────────

export function usePricingPackages(activeOnly = true) {
    return useQuery({
        queryKey: queryKeys.pricingPackages(),
        queryFn: () => pricingService.getPackages(activeOnly),
        staleTime: 10 * 60 * 1000,
    });
}

// ────────────────────────────────────────────────────────
// LEAD HOOKS
// ────────────────────────────────────────────────────────

export function useSubmitLead() {
    return useMutation({
        mutationFn: (lead: LeadInsert) => leadService.submitLead(lead),
    });
}

export function useLeads(filters?: {
    type?: string;
    isProcessed?: boolean;
    page?: number;
    pageSize?: number;
}) {
    return useQuery({
        queryKey: queryKeys.leads(filters),
        queryFn: () => leadService.getLeads(filters),
        staleTime: 2 * 60 * 1000,
    });
}

// ────────────────────────────────────────────────────────
// DASHBOARD STATS HOOKS
// ────────────────────────────────────────────────────────

export function useInfluencerDashboardStats() {
    const { user } = useAuth();

    return useQuery({
        queryKey: queryKeys.influencerStats(user!.id),
        queryFn: () => dashboardService.getInfluencerStats(user!.id),
        enabled: !!user,
        staleTime: 60 * 1000,
    });
}

export function useBrandDashboardStats() {
    const { user } = useAuth();

    return useQuery({
        queryKey: queryKeys.brandStats(user!.id),
        queryFn: () => dashboardService.getBrandStats(user!.id),
        enabled: !!user,
        staleTime: 60 * 1000,
    });
}

export function useAdminDashboardStats() {
    return useQuery({
        queryKey: queryKeys.adminStats(),
        queryFn: () => dashboardService.getAdminStats(),
        staleTime: 60 * 1000,
    });
}

// ────────────────────────────────────────────────────────
// ADMIN HOOKS
// ────────────────────────────────────────────────────────

export function useAllUsers(filters?: {
    role?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
}) {
    return useQuery({
        queryKey: queryKeys.allUsers(filters),
        queryFn: () => adminService.getAllUsers(filters),
        staleTime: 2 * 60 * 1000,
    });
}

export function useTransactionLog(filters?: {
    entityType?: string;
    page?: number;
    pageSize?: number;
}) {
    return useQuery({
        queryKey: queryKeys.transactionLog(filters),
        queryFn: () => adminService.getTransactionLog(filters),
        staleTime: 2 * 60 * 1000,
    });
}

export function useCommissionRate() {
    return useQuery({
        queryKey: queryKeys.commissionRate(),
        queryFn: () => settingsService.getCommissionRate(),
        staleTime: 10 * 60 * 1000,
    });
}

export function useUpdateCommissionRate() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (rate: number) => settingsService.updateCommissionRate(rate, user!.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.commissionRate() });
        },
    });
}
