// ============================================================
// MicroMatch: Database Type Definitions
// Auto-generated from Supabase schema
// ============================================================
/* eslint-disable @typescript-eslint/no-empty-object-type */

export type UserRole = 'influencer' | 'brand' | 'admin';
export type CampaignStatus = 'draft' | 'pending_approval' | 'active' | 'paused' | 'completed' | 'cancelled';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';
export type MatchStatus = 'proposed' | 'accepted' | 'rejected' | 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type NotificationType = 'campaign' | 'payment' | 'application' | 'match' | 'system' | 'message';
export type BlogStatus = 'draft' | 'published' | 'archived';
export type LeadType = 'influencer_application' | 'brand_inquiry' | 'email_capture';
export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'linkedin' | 'other';

// ────────────────────────────────────────────────────────
// Table Row Types
// ────────────────────────────────────────────────────────

export interface Profile {
    id: string;
    role: UserRole;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    is_active: boolean;
    is_verified: boolean;
    email_verified: boolean;
    onboarding_completed: boolean;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface InfluencerProfile {
    id: string;
    profile_id: string;
    niche: string[];
    primary_platform: SocialPlatform;
    instagram_handle: string | null;
    tiktok_handle: string | null;
    youtube_handle: string | null;
    twitter_handle: string | null;
    instagram_followers: number;
    tiktok_followers: number;
    youtube_subscribers: number;
    twitter_followers: number;
    total_followers: number;
    engagement_rate: number;
    avg_likes: number;
    avg_comments: number;
    content_categories: string[];
    languages: string[];
    rate_per_post: number;
    rate_per_story: number;
    rate_per_reel: number;
    rate_per_video: number;
    portfolio_urls: string[];
    media_kit_url: string | null;
    is_available: boolean;
    profile_completion_pct: number;
    created_at: string;
    updated_at: string;
}

export interface BrandProfile {
    id: string;
    profile_id: string;
    company_name: string;
    industry: string | null;
    company_size: string | null;
    company_website: string | null;
    logo_url: string | null;
    description: string | null;
    target_audience: string | null;
    preferred_platforms: SocialPlatform[];
    preferred_niches: string[];
    budget_range_min: number;
    budget_range_max: number;
    total_campaigns: number;
    total_spent: number;
    is_verified_brand: boolean;
    created_at: string;
    updated_at: string;
}

export interface Campaign {
    id: string;
    brand_id: string;
    title: string;
    description: string | null;
    requirements: string | null;
    deliverables: string[];
    target_platforms: SocialPlatform[];
    target_niches: string[];
    target_followers_min: number;
    target_followers_max: number;
    target_engagement_min: number;
    budget: number;
    budget_spent: number;
    cost_per_influencer: number;
    max_influencers: number;
    matched_influencers: number;
    status: CampaignStatus;
    start_date: string | null;
    end_date: string | null;
    application_deadline: string | null;
    created_at: string;
    updated_at: string;
}

export interface CampaignApplication {
    id: string;
    campaign_id: string;
    influencer_id: string;
    cover_letter: string | null;
    proposed_rate: number | null;
    proposed_deliverables: string | null;
    status: ApplicationStatus;
    reviewed_by: string | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
}

export interface CampaignMatch {
    id: string;
    campaign_id: string;
    influencer_id: string;
    application_id: string | null;
    matched_by: string | null;
    agreed_rate: number;
    status: MatchStatus;
    deliverables_completed: string[];
    performance_notes: string | null;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Payment {
    id: string;
    campaign_id: string;
    brand_id: string;
    amount: number;
    currency: string;
    commission_rate: number;
    commission_amount: number;
    net_amount: number;
    status: PaymentStatus;
    payment_method: string | null;
    external_payment_id: string | null;
    idempotency_key: string;
    payment_metadata: Record<string, unknown>;
    paid_at: string | null;
    failed_at: string | null;
    failure_reason: string | null;
    created_at: string;
    updated_at: string;
}

export interface Payout {
    id: string;
    payment_id: string;
    match_id: string;
    influencer_id: string;
    amount: number;
    currency: string;
    status: PayoutStatus;
    payout_method: string | null;
    external_payout_id: string | null;
    idempotency_key: string;
    payout_metadata: Record<string, unknown>;
    paid_at: string | null;
    failed_at: string | null;
    failure_reason: string | null;
    created_at: string;
    updated_at: string;
}

export interface TransactionLog {
    id: string;
    entity_type: 'payment' | 'payout';
    entity_id: string;
    action: string;
    old_status: string | null;
    new_status: string | null;
    amount: number | null;
    metadata: Record<string, unknown>;
    performed_by: string | null;
    ip_address: string | null;
    created_at: string;
}

export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    campaign_id: string | null;
    subject: string | null;
    body: string;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
}

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    action_url: string | null;
    is_read: boolean;
    read_at: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
}

export interface BlogPost {
    id: string;
    author_id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    cover_image_url: string | null;
    category: string;
    tags: string[];
    status: BlogStatus;
    views: number;
    published_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Testimonial {
    id: string;
    author_name: string;
    author_role: string | null;
    author_company: string | null;
    author_image_url: string | null;
    content: string;
    rating: number | null;
    is_featured: boolean;
    is_published: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface PricingPackage {
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    features: string[];
    is_popular: boolean;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface PlatformSetting {
    id: string;
    key: string;
    value: string;
    description: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface Lead {
    id: string;
    type: LeadType;
    full_name: string | null;
    email: string;
    phone: string | null;
    company_name: string | null;
    message: string | null;
    social_platform: SocialPlatform | null;
    social_handle: string | null;
    follower_count: number | null;
    content_niche: string | null;
    budget_range: string | null;
    campaign_goals: string | null;
    ip_address: string | null;
    user_agent: string | null;
    is_spam: boolean;
    is_processed: boolean;
    processed_by: string | null;
    processed_at: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    parent_id: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface CampaignCategory {
    id: string;
    campaign_id: string;
    category_id: string;
    created_at: string;
}

export interface InfluencerCategory {
    id: string;
    influencer_id: string;
    category_id: string;
    created_at: string;
}

// Result type from get_matching_campaigns RPC
export interface MatchingCampaign {
    campaign_id: string;
    title: string;
    description: string | null;
    budget: number;
    cost_per_influencer: number;
    max_influencers: number;
    matched_influencers: number;
    status: CampaignStatus;
    start_date: string | null;
    end_date: string | null;
    application_deadline: string | null;
    brand_id: string;
    brand_name: string | null;
    brand_logo: string | null;
    target_platforms: SocialPlatform[];
    match_score: number;
    matching_categories: string[];
    total_categories: number;
    created_at: string;
}

export interface CategoryStats {
    category_id: string;
    category_name: string;
    category_slug: string;
    campaign_count: number;
    influencer_count: number;
}

export interface SuccessStory {
    id: string;
    brand_name: string;
    industry: string;
    result: string;
    description: string;
    stat_influencers: number;
    stat_reach: string;
    stat_engagement: string;
    cover_image_url: string | null;
    is_published: boolean;
    is_featured: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

// ────────────────────────────────────────────────────────
// Dashboard Stats Types
// ────────────────────────────────────────────────────────

export interface InfluencerDashboardStats {
    total_earnings: number;
    pending_earnings: number;
    active_deals: number;
    completed_deals: number;
    pending_applications: number;
    total_applications: number;
    unread_notifications: number;
}

export interface BrandDashboardStats {
    active_campaigns: number;
    total_campaigns: number;
    matched_influencers: number;
    total_spent: number;
    pending_payments: number;
    avg_engagement: number;
    unread_notifications: number;
}

export interface AdminDashboardStats {
    total_influencers: number;
    total_brands: number;
    active_campaigns: number;
    total_campaigns: number;
    pending_approvals: number;
    total_revenue: number;
    monthly_revenue: number;
    total_payments_volume: number;
    pending_payouts: number;
    unprocessed_leads: number;
    new_signups_this_month: number;
}

// ────────────────────────────────────────────────────────
// Insert/Update Types
// ────────────────────────────────────────────────────────

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'role'>>;

export type InfluencerProfileUpdate = Partial<Omit<InfluencerProfile, 'id' | 'profile_id' | 'total_followers' | 'created_at' | 'updated_at'>>;

export type BrandProfileUpdate = Partial<Omit<BrandProfile, 'id' | 'profile_id' | 'created_at' | 'updated_at'>>;

export type CampaignInsert = Omit<Campaign, 'id' | 'budget_spent' | 'matched_influencers' | 'created_at' | 'updated_at'>;
export type CampaignUpdate = Partial<Omit<Campaign, 'id' | 'brand_id' | 'created_at' | 'updated_at'>>;

export type CampaignApplicationInsert = Omit<CampaignApplication, 'id' | 'status' | 'reviewed_by' | 'reviewed_at' | 'rejection_reason' | 'created_at' | 'updated_at'>;

export type BlogPostInsert = Omit<BlogPost, 'id' | 'slug' | 'views' | 'created_at' | 'updated_at'>;
export type BlogPostUpdate = Partial<Omit<BlogPost, 'id' | 'author_id' | 'slug' | 'views' | 'created_at' | 'updated_at'>>;

export type TestimonialInsert = Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>;
export type TestimonialUpdate = Partial<Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>>;

export type LeadInsert = Pick<Lead, 'type' | 'email'> & Partial<Omit<Lead, 'id' | 'is_spam' | 'is_processed' | 'processed_by' | 'processed_at' | 'created_at' | 'updated_at'>>;

export type CategoryInsert = Omit<Category, 'id' | 'slug' | 'created_at' | 'updated_at'>;
export type CategoryUpdate = Partial<Omit<Category, 'id' | 'slug' | 'created_at' | 'updated_at'>>;

export type CampaignCategoryInsert = Omit<CampaignCategory, 'id' | 'created_at'>;
export type InfluencerCategoryInsert = Omit<InfluencerCategory, 'id' | 'created_at'>;

export type SuccessStoryInsert = Omit<SuccessStory, 'id' | 'created_at' | 'updated_at'>;
export type SuccessStoryUpdate = Partial<Omit<SuccessStory, 'id' | 'created_at' | 'updated_at'>>;

// ────────────────────────────────────────────────────────
// Supabase Database Type (used by createClient<Database>)
// ────────────────────────────────────────────────────────

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: {
                    id: string;
                    role?: UserRole;
                    full_name: string;
                    email: string;
                    phone?: string | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    location?: string | null;
                    website?: string | null;
                    is_active?: boolean;
                    is_verified?: boolean;
                    email_verified?: boolean;
                    onboarding_completed?: boolean;
                    last_login_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    role?: UserRole;
                    full_name?: string;
                    email?: string;
                    phone?: string | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    location?: string | null;
                    website?: string | null;
                    is_active?: boolean;
                    is_verified?: boolean;
                    email_verified?: boolean;
                    onboarding_completed?: boolean;
                    last_login_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            influencer_profiles: {
                Row: InfluencerProfile;
                Insert: {
                    id?: string;
                    profile_id: string;
                    niche?: string[];
                    primary_platform?: SocialPlatform;
                    instagram_handle?: string | null;
                    tiktok_handle?: string | null;
                    youtube_handle?: string | null;
                    twitter_handle?: string | null;
                    instagram_followers?: number;
                    tiktok_followers?: number;
                    youtube_subscribers?: number;
                    twitter_followers?: number;
                    engagement_rate?: number;
                    avg_likes?: number;
                    avg_comments?: number;
                    content_categories?: string[];
                    languages?: string[];
                    rate_per_post?: number;
                    rate_per_story?: number;
                    rate_per_reel?: number;
                    rate_per_video?: number;
                    portfolio_urls?: string[];
                    media_kit_url?: string | null;
                    is_available?: boolean;
                    profile_completion_pct?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    profile_id?: string;
                    niche?: string[];
                    primary_platform?: SocialPlatform;
                    instagram_handle?: string | null;
                    tiktok_handle?: string | null;
                    youtube_handle?: string | null;
                    twitter_handle?: string | null;
                    instagram_followers?: number;
                    tiktok_followers?: number;
                    youtube_subscribers?: number;
                    twitter_followers?: number;
                    engagement_rate?: number;
                    avg_likes?: number;
                    avg_comments?: number;
                    content_categories?: string[];
                    languages?: string[];
                    rate_per_post?: number;
                    rate_per_story?: number;
                    rate_per_reel?: number;
                    rate_per_video?: number;
                    portfolio_urls?: string[];
                    media_kit_url?: string | null;
                    is_available?: boolean;
                    profile_completion_pct?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            brand_profiles: {
                Row: BrandProfile;
                Insert: {
                    id?: string;
                    profile_id: string;
                    company_name: string;
                    industry?: string | null;
                    company_size?: string | null;
                    company_website?: string | null;
                    logo_url?: string | null;
                    description?: string | null;
                    target_audience?: string | null;
                    preferred_platforms?: SocialPlatform[];
                    preferred_niches?: string[];
                    budget_range_min?: number;
                    budget_range_max?: number;
                    total_campaigns?: number;
                    total_spent?: number;
                    is_verified_brand?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    profile_id?: string;
                    company_name?: string;
                    industry?: string | null;
                    company_size?: string | null;
                    company_website?: string | null;
                    logo_url?: string | null;
                    description?: string | null;
                    target_audience?: string | null;
                    preferred_platforms?: SocialPlatform[];
                    preferred_niches?: string[];
                    budget_range_min?: number;
                    budget_range_max?: number;
                    total_campaigns?: number;
                    total_spent?: number;
                    is_verified_brand?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            campaigns: {
                Row: Campaign;
                Insert: {
                    id?: string;
                    brand_id: string;
                    title: string;
                    description?: string | null;
                    requirements?: string | null;
                    deliverables?: string[];
                    target_platforms?: SocialPlatform[];
                    target_niches?: string[];
                    target_followers_min?: number;
                    target_followers_max?: number;
                    target_engagement_min?: number;
                    budget?: number;
                    budget_spent?: number;
                    cost_per_influencer?: number;
                    max_influencers?: number;
                    matched_influencers?: number;
                    status?: CampaignStatus;
                    start_date?: string | null;
                    end_date?: string | null;
                    application_deadline?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    brand_id?: string;
                    title?: string;
                    description?: string | null;
                    requirements?: string | null;
                    deliverables?: string[];
                    target_platforms?: SocialPlatform[];
                    target_niches?: string[];
                    target_followers_min?: number;
                    target_followers_max?: number;
                    target_engagement_min?: number;
                    budget?: number;
                    budget_spent?: number;
                    cost_per_influencer?: number;
                    max_influencers?: number;
                    matched_influencers?: number;
                    status?: CampaignStatus;
                    start_date?: string | null;
                    end_date?: string | null;
                    application_deadline?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            campaign_applications: {
                Row: CampaignApplication;
                Insert: {
                    id?: string;
                    campaign_id: string;
                    influencer_id: string;
                    cover_letter?: string | null;
                    proposed_rate?: number | null;
                    proposed_deliverables?: string | null;
                    status?: ApplicationStatus;
                    reviewed_by?: string | null;
                    reviewed_at?: string | null;
                    rejection_reason?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    campaign_id?: string;
                    influencer_id?: string;
                    cover_letter?: string | null;
                    proposed_rate?: number | null;
                    proposed_deliverables?: string | null;
                    status?: ApplicationStatus;
                    reviewed_by?: string | null;
                    reviewed_at?: string | null;
                    rejection_reason?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            campaign_matches: {
                Row: CampaignMatch;
                Insert: {
                    id?: string;
                    campaign_id: string;
                    influencer_id: string;
                    application_id?: string | null;
                    matched_by?: string | null;
                    agreed_rate: number;
                    status?: MatchStatus;
                    deliverables_completed?: string[];
                    performance_notes?: string | null;
                    started_at?: string | null;
                    completed_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    campaign_id?: string;
                    influencer_id?: string;
                    application_id?: string | null;
                    matched_by?: string | null;
                    agreed_rate?: number;
                    status?: MatchStatus;
                    deliverables_completed?: string[];
                    performance_notes?: string | null;
                    started_at?: string | null;
                    completed_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            payments: {
                Row: Payment;
                Insert: {
                    id?: string;
                    campaign_id: string;
                    brand_id: string;
                    amount: number;
                    currency?: string;
                    commission_rate?: number;
                    status?: PaymentStatus;
                    payment_method?: string | null;
                    external_payment_id?: string | null;
                    idempotency_key: string;
                    payment_metadata?: Record<string, unknown>;
                    paid_at?: string | null;
                    failed_at?: string | null;
                    failure_reason?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    campaign_id?: string;
                    brand_id?: string;
                    amount?: number;
                    currency?: string;
                    commission_rate?: number;
                    status?: PaymentStatus;
                    payment_method?: string | null;
                    external_payment_id?: string | null;
                    idempotency_key?: string;
                    payment_metadata?: Record<string, unknown>;
                    paid_at?: string | null;
                    failed_at?: string | null;
                    failure_reason?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            payouts: {
                Row: Payout;
                Insert: {
                    id?: string;
                    payment_id: string;
                    match_id: string;
                    influencer_id: string;
                    amount: number;
                    currency?: string;
                    status?: PayoutStatus;
                    payout_method?: string | null;
                    external_payout_id?: string | null;
                    idempotency_key: string;
                    payout_metadata?: Record<string, unknown>;
                    paid_at?: string | null;
                    failed_at?: string | null;
                    failure_reason?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    payment_id?: string;
                    match_id?: string;
                    influencer_id?: string;
                    amount?: number;
                    currency?: string;
                    status?: PayoutStatus;
                    payout_method?: string | null;
                    external_payout_id?: string | null;
                    idempotency_key?: string;
                    payout_metadata?: Record<string, unknown>;
                    paid_at?: string | null;
                    failed_at?: string | null;
                    failure_reason?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            transaction_log: {
                Row: TransactionLog;
                Insert: {
                    id?: string;
                    entity_type: 'payment' | 'payout';
                    entity_id: string;
                    action: string;
                    old_status?: string | null;
                    new_status?: string | null;
                    amount?: number | null;
                    metadata?: Record<string, unknown>;
                    performed_by?: string | null;
                    ip_address?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: never;
                };
                Relationships: [];
            };
            messages: {
                Row: Message;
                Insert: {
                    id?: string;
                    sender_id: string;
                    receiver_id: string;
                    campaign_id?: string | null;
                    subject?: string | null;
                    body: string;
                    is_read?: boolean;
                    read_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    sender_id?: string;
                    receiver_id?: string;
                    campaign_id?: string | null;
                    subject?: string | null;
                    body?: string;
                    is_read?: boolean;
                    read_at?: string | null;
                    created_at?: string;
                };
                Relationships: [];
            };
            notifications: {
                Row: Notification;
                Insert: {
                    id?: string;
                    user_id: string;
                    type?: NotificationType;
                    title: string;
                    message: string;
                    action_url?: string | null;
                    is_read?: boolean;
                    read_at?: string | null;
                    metadata?: Record<string, unknown>;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    type?: NotificationType;
                    title?: string;
                    message?: string;
                    action_url?: string | null;
                    is_read?: boolean;
                    read_at?: string | null;
                    metadata?: Record<string, unknown>;
                    created_at?: string;
                };
                Relationships: [];
            };
            blog_posts: {
                Row: BlogPost;
                Insert: {
                    id?: string;
                    author_id: string;
                    title: string;
                    slug?: string;
                    excerpt?: string | null;
                    content?: string | null;
                    cover_image_url?: string | null;
                    category?: string;
                    tags?: string[];
                    status?: BlogStatus;
                    views?: number;
                    published_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    author_id?: string;
                    title?: string;
                    slug?: string;
                    excerpt?: string | null;
                    content?: string | null;
                    cover_image_url?: string | null;
                    category?: string;
                    tags?: string[];
                    status?: BlogStatus;
                    views?: number;
                    published_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            testimonials: {
                Row: Testimonial;
                Insert: {
                    id?: string;
                    author_name: string;
                    author_role?: string | null;
                    author_company?: string | null;
                    author_image_url?: string | null;
                    content: string;
                    rating?: number | null;
                    is_featured?: boolean;
                    is_published?: boolean;
                    display_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    author_name?: string;
                    author_role?: string | null;
                    author_company?: string | null;
                    author_image_url?: string | null;
                    content?: string;
                    rating?: number | null;
                    is_featured?: boolean;
                    is_published?: boolean;
                    display_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            pricing_packages: {
                Row: PricingPackage;
                Insert: {
                    id?: string;
                    name: string;
                    description?: string | null;
                    price?: number;
                    currency?: string;
                    features?: string[];
                    is_popular?: boolean;
                    is_active?: boolean;
                    display_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string | null;
                    price?: number;
                    currency?: string;
                    features?: string[];
                    is_popular?: boolean;
                    is_active?: boolean;
                    display_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            platform_settings: {
                Row: PlatformSetting;
                Insert: {
                    id?: string;
                    key: string;
                    value: string;
                    description?: string | null;
                    updated_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    key?: string;
                    value?: string;
                    description?: string | null;
                    updated_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            leads: {
                Row: Lead;
                Insert: {
                    id?: string;
                    type: LeadType;
                    full_name?: string | null;
                    email: string;
                    phone?: string | null;
                    company_name?: string | null;
                    message?: string | null;
                    social_platform?: SocialPlatform | null;
                    social_handle?: string | null;
                    follower_count?: number | null;
                    content_niche?: string | null;
                    budget_range?: string | null;
                    campaign_goals?: string | null;
                    ip_address?: string | null;
                    user_agent?: string | null;
                    is_spam?: boolean;
                    is_processed?: boolean;
                    processed_by?: string | null;
                    processed_at?: string | null;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    type?: LeadType;
                    full_name?: string | null;
                    email?: string;
                    phone?: string | null;
                    company_name?: string | null;
                    message?: string | null;
                    social_platform?: SocialPlatform | null;
                    social_handle?: string | null;
                    follower_count?: number | null;
                    content_niche?: string | null;
                    budget_range?: string | null;
                    campaign_goals?: string | null;
                    ip_address?: string | null;
                    user_agent?: string | null;
                    is_spam?: boolean;
                    is_processed?: boolean;
                    processed_by?: string | null;
                    processed_at?: string | null;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            categories: {
                Row: Category;
                Insert: {
                    id?: string;
                    name: string;
                    slug?: string;
                    description?: string | null;
                    icon?: string | null;
                    parent_id?: string | null;
                    is_active?: boolean;
                    display_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    description?: string | null;
                    icon?: string | null;
                    parent_id?: string | null;
                    is_active?: boolean;
                    display_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [{ foreignKeyName: 'categories_parent_id_fkey'; columns: ['parent_id']; referencedRelation: 'categories'; referencedColumns: ['id'] }];
            };
            campaign_categories: {
                Row: CampaignCategory;
                Insert: {
                    id?: string;
                    campaign_id: string;
                    category_id: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    campaign_id?: string;
                    category_id?: string;
                    created_at?: string;
                };
                Relationships: [
                    { foreignKeyName: 'campaign_categories_campaign_id_fkey'; columns: ['campaign_id']; referencedRelation: 'campaigns'; referencedColumns: ['id'] },
                    { foreignKeyName: 'campaign_categories_category_id_fkey'; columns: ['category_id']; referencedRelation: 'categories'; referencedColumns: ['id'] }
                ];
            };
            influencer_categories: {
                Row: InfluencerCategory;
                Insert: {
                    id?: string;
                    influencer_id: string;
                    category_id: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    influencer_id?: string;
                    category_id?: string;
                    created_at?: string;
                };
                Relationships: [
                    { foreignKeyName: 'influencer_categories_influencer_id_fkey'; columns: ['influencer_id']; referencedRelation: 'profiles'; referencedColumns: ['id'] },
                    { foreignKeyName: 'influencer_categories_category_id_fkey'; columns: ['category_id']; referencedRelation: 'categories'; referencedColumns: ['id'] }
                ];
            };
        };
        Views: {};
        Functions: {
            is_admin: {
                Args: Record<string, never>;
                Returns: boolean;
            };
            has_role: {
                Args: { required_role: UserRole };
                Returns: boolean;
            };
            get_user_role: {
                Args: Record<string, never>;
                Returns: UserRole;
            };
            get_commission_rate: {
                Args: Record<string, never>;
                Returns: number;
            };
            get_influencer_dashboard_stats: {
                Args: { p_influencer_id: string };
                Returns: InfluencerDashboardStats;
            };
            get_brand_dashboard_stats: {
                Args: { p_brand_id: string };
                Returns: BrandDashboardStats;
            };
            get_admin_dashboard_stats: {
                Args: Record<string, never>;
                Returns: AdminDashboardStats;
            };
            check_rate_limit: {
                Args: {
                    p_identifier: string;
                    p_action: string;
                    p_max_requests?: number;
                    p_window_minutes?: number;
                };
                Returns: boolean;
            };
            process_payment: {
                Args: {
                    p_payment_id: string;
                    p_new_status: PaymentStatus;
                    p_external_id?: string;
                };
                Returns: void;
            };
            process_payout: {
                Args: {
                    p_payout_id: string;
                    p_new_status: PayoutStatus;
                    p_external_id?: string;
                };
                Returns: void;
            };
            promote_to_admin: {
                Args: { p_user_id: string };
                Returns: void;
            };
            demote_admin: {
                Args: { p_user_id: string; p_new_role?: UserRole };
                Returns: void;
            };
            get_matching_campaigns: {
                Args: { p_influencer_id: string; p_page?: number; p_page_size?: number };
                Returns: MatchingCampaign[];
            };
            get_category_stats: {
                Args: Record<string, never>;
                Returns: CategoryStats[];
            };
        };
        CompositeTypes: {};
        Enums: {
            user_role: UserRole;
            campaign_status: CampaignStatus;
            application_status: ApplicationStatus;
            match_status: MatchStatus;
            payment_status: PaymentStatus;
            payout_status: PayoutStatus;
            notification_type: NotificationType;
            blog_status: BlogStatus;
            lead_type: LeadType;
            social_platform: SocialPlatform;
        };
    };
}
