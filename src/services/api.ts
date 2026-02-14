// ============================================================
// MicroMatch: API Service Layer
// Centralized Supabase data access for all features
// ============================================================

import { supabase } from '@/lib/supabase';
import type {
    Profile,
    ProfileUpdate,
    InfluencerProfile,
    InfluencerProfileUpdate,
    BrandProfile,
    BrandProfileUpdate,
    Campaign,
    CampaignInsert,
    CampaignUpdate,
    CampaignApplication,
    CampaignApplicationInsert,
    CampaignMatch,
    Payment,
    Payout,
    Message,
    Notification,
    BlogPost,
    BlogPostInsert,
    BlogPostUpdate,
    Testimonial,
    TestimonialInsert,
    TestimonialUpdate,
    PricingPackage,
    Lead,
    LeadInsert,
    InfluencerDashboardStats,
    BrandDashboardStats,
    AdminDashboardStats,
    UserRole,
} from '@/types/database.types';

// ────────────────────────────────────────────────────────
// PROFILES
// ────────────────────────────────────────────────────────

export const profileService = {
    async getProfile(userId: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    },

    async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async uploadAvatar(userId: string, file: File): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // Update profile with new avatar URL
        await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', userId);

        return publicUrl;
    },
};

// ────────────────────────────────────────────────────────
// INFLUENCER PROFILES
// ────────────────────────────────────────────────────────

export const influencerService = {
    async getInfluencerProfile(profileId: string): Promise<InfluencerProfile | null> {
        const { data, error } = await supabase
            .from('influencer_profiles')
            .select('*')
            .eq('profile_id', profileId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async updateInfluencerProfile(
        profileId: string,
        updates: InfluencerProfileUpdate
    ): Promise<InfluencerProfile> {
        const { data, error } = await supabase
            .from('influencer_profiles')
            .update(updates)
            .eq('profile_id', profileId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getFullProfile(userId: string) {
        const [profileResult, influencerResult] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', userId).single(),
            supabase.from('influencer_profiles').select('*').eq('profile_id', userId).single(),
        ]);

        if (profileResult.error) throw profileResult.error;

        return {
            profile: profileResult.data as Profile,
            influencer: influencerResult.data as InfluencerProfile | null,
        };
    },

    async uploadMediaKit(userId: string, file: File): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/media-kit.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('portfolios')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('portfolios')
            .getPublicUrl(filePath);

        await supabase
            .from('influencer_profiles')
            .update({ media_kit_url: publicUrl })
            .eq('profile_id', userId);

        return publicUrl;
    },

    async uploadPortfolioItem(userId: string, file: File): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${userId}/portfolio/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('portfolios')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('portfolios')
            .getPublicUrl(filePath);

        return publicUrl;
    },
};

// ────────────────────────────────────────────────────────
// BRAND PROFILES
// ────────────────────────────────────────────────────────

export const brandService = {
    async getBrandProfile(profileId: string): Promise<BrandProfile | null> {
        const { data, error } = await supabase
            .from('brand_profiles')
            .select('*')
            .eq('profile_id', profileId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async updateBrandProfile(
        profileId: string,
        updates: BrandProfileUpdate
    ): Promise<BrandProfile> {
        const { data, error } = await supabase
            .from('brand_profiles')
            .update(updates)
            .eq('profile_id', profileId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getFullProfile(userId: string) {
        const [profileResult, brandResult] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', userId).single(),
            supabase.from('brand_profiles').select('*').eq('profile_id', userId).single(),
        ]);

        if (profileResult.error) throw profileResult.error;

        return {
            profile: profileResult.data as Profile,
            brand: brandResult.data as BrandProfile | null,
        };
    },

    async uploadLogo(userId: string, file: File): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/logo.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('brand-logos')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('brand-logos')
            .getPublicUrl(filePath);

        await supabase
            .from('brand_profiles')
            .update({ logo_url: publicUrl })
            .eq('profile_id', userId);

        return publicUrl;
    },
};

// ────────────────────────────────────────────────────────
// CAMPAIGNS
// ────────────────────────────────────────────────────────

export const campaignService = {
    async getCampaigns(filters?: {
        status?: string;
        brandId?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{ data: Campaign[]; count: number }> {
        let query = supabase
            .from('campaigns')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }
        if (filters?.brandId) {
            query = query.eq('brand_id', filters.brandId);
        }

        const page = filters?.page || 1;
        const pageSize = filters?.pageSize || 20;
        const start = (page - 1) * pageSize;
        query = query.range(start, start + pageSize - 1);

        const { data, error, count } = await query;

        if (error) throw error;
        return { data: data || [], count: count || 0 };
    },

    async getCampaign(id: string): Promise<Campaign | null> {
        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createCampaign(campaign: CampaignInsert): Promise<Campaign> {
        const { data, error } = await supabase
            .from('campaigns')
            .insert(campaign)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateCampaign(id: string, updates: CampaignUpdate): Promise<Campaign> {
        const { data, error } = await supabase
            .from('campaigns')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteCampaign(id: string): Promise<void> {
        const { error } = await supabase
            .from('campaigns')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Get active campaigns for influencers to browse
    async getActiveCampaigns(page = 1, pageSize = 20): Promise<{ data: Campaign[]; count: number }> {
        const start = (page - 1) * pageSize;
        const { data, error, count } = await supabase
            .from('campaigns')
            .select('*', { count: 'exact' })
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .range(start, start + pageSize - 1);

        if (error) throw error;
        return { data: data || [], count: count || 0 };
    },
};

// ────────────────────────────────────────────────────────
// CAMPAIGN APPLICATIONS
// ────────────────────────────────────────────────────────

export const applicationService = {
    async getApplications(filters?: {
        campaignId?: string;
        influencerId?: string;
        status?: string;
    }): Promise<CampaignApplication[]> {
        let query = supabase
            .from('campaign_applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters?.campaignId) {
            query = query.eq('campaign_id', filters.campaignId);
        }
        if (filters?.influencerId) {
            query = query.eq('influencer_id', filters.influencerId);
        }
        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async createApplication(application: CampaignApplicationInsert): Promise<CampaignApplication> {
        const { data, error } = await supabase
            .from('campaign_applications')
            .insert(application)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async withdrawApplication(applicationId: string): Promise<void> {
        const { error } = await supabase
            .from('campaign_applications')
            .update({ status: 'withdrawn' })
            .eq('id', applicationId);

        if (error) throw error;
    },

    // Admin: approve/reject
    async reviewApplication(
        applicationId: string,
        status: 'approved' | 'rejected',
        reviewerId: string,
        rejectionReason?: string
    ): Promise<void> {
        const { error } = await supabase
            .from('campaign_applications')
            .update({
                status,
                reviewed_by: reviewerId,
                reviewed_at: new Date().toISOString(),
                rejection_reason: rejectionReason || null,
            })
            .eq('id', applicationId);

        if (error) throw error;
    },
};

// ────────────────────────────────────────────────────────
// CAMPAIGN MATCHES
// ────────────────────────────────────────────────────────

export const matchService = {
    async getMatches(filters?: {
        campaignId?: string;
        influencerId?: string;
        status?: string;
    }): Promise<CampaignMatch[]> {
        let query = supabase
            .from('campaign_matches')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters?.campaignId) {
            query = query.eq('campaign_id', filters.campaignId);
        }
        if (filters?.influencerId) {
            query = query.eq('influencer_id', filters.influencerId);
        }
        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async createMatch(match: {
        campaign_id: string;
        influencer_id: string;
        application_id?: string;
        matched_by: string;
        agreed_rate: number;
    }): Promise<CampaignMatch> {
        const { data, error } = await supabase
            .from('campaign_matches')
            .insert({
                ...match,
                status: 'proposed',
                deliverables_completed: [],
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateMatchStatus(
        matchId: string,
        status: string,
        extras?: Partial<CampaignMatch>
    ): Promise<void> {
        const { error } = await supabase
            .from('campaign_matches')
            .update({ status, ...extras })
            .eq('id', matchId);

        if (error) throw error;
    },
};

// ────────────────────────────────────────────────────────
// PAYMENTS & PAYOUTS
// ────────────────────────────────────────────────────────

export const paymentService = {
    async getPayments(filters?: {
        brandId?: string;
        campaignId?: string;
        status?: string;
    }): Promise<Payment[]> {
        let query = supabase
            .from('payments')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters?.brandId) query = query.eq('brand_id', filters.brandId);
        if (filters?.campaignId) query = query.eq('campaign_id', filters.campaignId);
        if (filters?.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async getPayouts(filters?: {
        influencerId?: string;
        status?: string;
    }): Promise<Payout[]> {
        let query = supabase
            .from('payouts')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters?.influencerId) query = query.eq('influencer_id', filters.influencerId);
        if (filters?.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async processPayment(paymentId: string, newStatus: string, externalId?: string): Promise<void> {
        const { error } = await supabase.rpc('process_payment', {
            p_payment_id: paymentId,
            p_new_status: newStatus,
            p_external_id: externalId || null,
        });

        if (error) throw error;
    },

    async processPayout(payoutId: string, newStatus: string, externalId?: string): Promise<void> {
        const { error } = await supabase.rpc('process_payout', {
            p_payout_id: payoutId,
            p_new_status: newStatus,
            p_external_id: externalId || null,
        });

        if (error) throw error;
    },
};

// ────────────────────────────────────────────────────────
// MESSAGES
// ────────────────────────────────────────────────────────

export const messageService = {
    async getConversations(userId: string): Promise<Message[]> {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async sendMessage(message: {
        sender_id: string;
        receiver_id: string;
        body: string;
        subject?: string;
        campaign_id?: string;
    }): Promise<Message> {
        const { data, error } = await supabase
            .from('messages')
            .insert(message)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async markAsRead(messageId: string): Promise<void> {
        const { error } = await supabase
            .from('messages')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', messageId);

        if (error) throw error;
    },

    async getUnreadCount(userId: string): Promise<number> {
        const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', userId)
            .eq('is_read', false);

        if (error) throw error;
        return count || 0;
    },
};

// ────────────────────────────────────────────────────────
// NOTIFICATIONS
// ────────────────────────────────────────────────────────

export const notificationService = {
    async getNotifications(userId: string, limit = 50): Promise<Notification[]> {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    async markAsRead(notificationId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', notificationId);

        if (error) throw error;
    },

    async markAllAsRead(userId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw error;
    },

    async getUnreadCount(userId: string): Promise<number> {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw error;
        return count || 0;
    },

    // Subscribe to real-time notifications
    subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
        return supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    callback(payload.new as Notification);
                }
            )
            .subscribe();
    },
};

// ────────────────────────────────────────────────────────
// BLOG POSTS
// ────────────────────────────────────────────────────────

export const blogService = {
    async getPosts(filters?: {
        status?: string;
        category?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{ data: BlogPost[]; count: number }> {
        let query = supabase
            .from('blog_posts')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (filters?.status) query = query.eq('status', filters.status);
        if (filters?.category) query = query.eq('category', filters.category);

        const page = filters?.page || 1;
        const pageSize = filters?.pageSize || 20;
        const start = (page - 1) * pageSize;
        query = query.range(start, start + pageSize - 1);

        const { data, error, count } = await query;
        if (error) throw error;
        return { data: data || [], count: count || 0 };
    },

    async getPostBySlug(slug: string): Promise<BlogPost | null> {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) throw error;

        // Increment view count
        if (data) {
            await supabase
                .from('blog_posts')
                .update({ views: data.views + 1 })
                .eq('id', data.id);
        }

        return data;
    },

    async createPost(post: BlogPostInsert): Promise<BlogPost> {
        const { data, error } = await supabase
            .from('blog_posts')
            .insert(post)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updatePost(id: string, updates: BlogPostUpdate): Promise<BlogPost> {
        const { data, error } = await supabase
            .from('blog_posts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deletePost(id: string): Promise<void> {
        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// ────────────────────────────────────────────────────────
// TESTIMONIALS
// ────────────────────────────────────────────────────────

export const testimonialService = {
    async getTestimonials(publishedOnly = true): Promise<Testimonial[]> {
        let query = supabase
            .from('testimonials')
            .select('*')
            .order('display_order', { ascending: true });

        if (publishedOnly) query = query.eq('is_published', true);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async createTestimonial(testimonial: TestimonialInsert): Promise<Testimonial> {
        const { data, error } = await supabase
            .from('testimonials')
            .insert(testimonial)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateTestimonial(id: string, updates: TestimonialUpdate): Promise<Testimonial> {
        const { data, error } = await supabase
            .from('testimonials')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteTestimonial(id: string): Promise<void> {
        const { error } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// ────────────────────────────────────────────────────────
// PRICING PACKAGES
// ────────────────────────────────────────────────────────

export const pricingService = {
    async getPackages(activeOnly = true): Promise<PricingPackage[]> {
        let query = supabase
            .from('pricing_packages')
            .select('*')
            .order('display_order', { ascending: true });

        if (activeOnly) query = query.eq('is_active', true);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async createPackage(pkg: Omit<PricingPackage, 'id' | 'created_at' | 'updated_at'>): Promise<PricingPackage> {
        const { data, error } = await supabase
            .from('pricing_packages')
            .insert(pkg)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updatePackage(id: string, updates: Partial<PricingPackage>): Promise<PricingPackage> {
        const { data, error } = await supabase
            .from('pricing_packages')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deletePackage(id: string): Promise<void> {
        const { error } = await supabase
            .from('pricing_packages')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// ────────────────────────────────────────────────────────
// LEADS
// ────────────────────────────────────────────────────────

export const leadService = {
    async submitLead(lead: LeadInsert): Promise<Lead> {
        const { data, error } = await supabase
            .from('leads')
            .insert({
                ...lead,
                user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getLeads(filters?: {
        type?: string;
        isProcessed?: boolean;
        page?: number;
        pageSize?: number;
    }): Promise<{ data: Lead[]; count: number }> {
        let query = supabase
            .from('leads')
            .select('*', { count: 'exact' })
            .eq('is_spam', false)
            .order('created_at', { ascending: false });

        if (filters?.type) query = query.eq('type', filters.type);
        if (filters?.isProcessed !== undefined) query = query.eq('is_processed', filters.isProcessed);

        const page = filters?.page || 1;
        const pageSize = filters?.pageSize || 20;
        const start = (page - 1) * pageSize;
        query = query.range(start, start + pageSize - 1);

        const { data, error, count } = await query;
        if (error) throw error;
        return { data: data || [], count: count || 0 };
    },

    async processLead(leadId: string, processedBy: string, notes?: string): Promise<void> {
        const { error } = await supabase
            .from('leads')
            .update({
                is_processed: true,
                processed_by: processedBy,
                processed_at: new Date().toISOString(),
                notes: notes || null,
            })
            .eq('id', leadId);

        if (error) throw error;
    },

    async markAsSpam(leadId: string): Promise<void> {
        const { error } = await supabase
            .from('leads')
            .update({ is_spam: true })
            .eq('id', leadId);

        if (error) throw error;
    },
};

// ────────────────────────────────────────────────────────
// PLATFORM SETTINGS
// ────────────────────────────────────────────────────────

export const settingsService = {
    async getSetting(key: string): Promise<string | null> {
        const { data, error } = await supabase
            .from('platform_settings')
            .select('value')
            .eq('key', key)
            .single();

        if (error) return null;
        return data?.value || null;
    },

    async updateSetting(key: string, value: string, updatedBy: string): Promise<void> {
        const { error } = await supabase
            .from('platform_settings')
            .update({ value, updated_by: updatedBy })
            .eq('key', key);

        if (error) throw error;
    },

    async getCommissionRate(): Promise<number> {
        const rate = await this.getSetting('commission_rate');
        return rate ? parseFloat(rate) : 20.0;
    },

    async updateCommissionRate(rate: number, updatedBy: string): Promise<void> {
        await this.updateSetting('commission_rate', rate.toString(), updatedBy);
    },
};

// ────────────────────────────────────────────────────────
// DASHBOARD STATS (using RPC functions)
// ────────────────────────────────────────────────────────

export const dashboardService = {
    async getInfluencerStats(influencerId: string): Promise<InfluencerDashboardStats> {
        const { data, error } = await supabase.rpc('get_influencer_dashboard_stats', {
            p_influencer_id: influencerId,
        });

        if (error) throw error;
        return data as InfluencerDashboardStats;
    },

    async getBrandStats(brandId: string): Promise<BrandDashboardStats> {
        const { data, error } = await supabase.rpc('get_brand_dashboard_stats', {
            p_brand_id: brandId,
        });

        if (error) throw error;
        return data as BrandDashboardStats;
    },

    async getAdminStats(): Promise<AdminDashboardStats> {
        const { data, error } = await supabase.rpc('get_admin_dashboard_stats');

        if (error) throw error;
        return data as AdminDashboardStats;
    },
};

// ────────────────────────────────────────────────────────
// ADMIN OPERATIONS
// ────────────────────────────────────────────────────────

export const adminService = {
    async getAllUsers(filters?: {
        role?: string;
        isActive?: boolean;
        search?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{ data: Profile[]; count: number }> {
        let query = supabase
            .from('profiles')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (filters?.role) query = query.eq('role', filters.role);
        if (filters?.isActive !== undefined) query = query.eq('is_active', filters.isActive);
        if (filters?.search) query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);

        const page = filters?.page || 1;
        const pageSize = filters?.pageSize || 20;
        const start = (page - 1) * pageSize;
        query = query.range(start, start + pageSize - 1);

        const { data, error, count } = await query;
        if (error) throw error;
        return { data: data || [], count: count || 0 };
    },

    async toggleUserActive(userId: string, isActive: boolean): Promise<void> {
        const { error } = await supabase
            .from('profiles')
            .update({ is_active: isActive })
            .eq('id', userId);

        if (error) throw error;
    },

    async verifyUser(userId: string): Promise<void> {
        const { error } = await supabase
            .from('profiles')
            .update({ is_verified: true })
            .eq('id', userId);

        if (error) throw error;
    },

    async getTransactionLog(filters?: {
        entityType?: string;
        page?: number;
        pageSize?: number;
    }) {
        let query = supabase
            .from('transaction_log')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (filters?.entityType) query = query.eq('entity_type', filters.entityType);

        const page = filters?.page || 1;
        const pageSize = filters?.pageSize || 50;
        const start = (page - 1) * pageSize;
        query = query.range(start, start + pageSize - 1);

        const { data, error, count } = await query;
        if (error) throw error;
        return { data: data || [], count: count || 0 };
    },

    // Assign influencer to campaign (full flow)
    async assignInfluencerToCampaign(params: {
        campaignId: string;
        influencerId: string;
        applicationId?: string;
        agreedRate: number;
        adminId: string;
    }): Promise<CampaignMatch> {
        // Create the match
        const match = await matchService.createMatch({
            campaign_id: params.campaignId,
            influencer_id: params.influencerId,
            application_id: params.applicationId,
            matched_by: params.adminId,
            agreed_rate: params.agreedRate,
        });

        // If there was an application, approve it
        if (params.applicationId) {
            await applicationService.reviewApplication(
                params.applicationId,
                'approved',
                params.adminId
            );
        }

        // Increment campaign matched count
        const { data: campaign } = await supabase
            .from('campaigns')
            .select('matched_influencers')
            .eq('id', params.campaignId)
            .single();

        if (campaign) {
            await supabase
                .from('campaigns')
                .update({ matched_influencers: (campaign.matched_influencers || 0) + 1 })
                .eq('id', params.campaignId);
        }

        return match;
    },

    // Promote a user to admin (only callable by existing admins)
    async promoteToAdmin(userId: string): Promise<void> {
        const { error } = await supabase.rpc('promote_to_admin', {
            p_user_id: userId,
        });
        if (error) throw error;
    },

    // Demote an admin back to a regular role
    async demoteAdmin(userId: string, newRole: UserRole = 'influencer'): Promise<void> {
        const { error } = await supabase.rpc('demote_admin', {
            p_user_id: userId,
            p_new_role: newRole,
        });
        if (error) throw error;
    },
};
