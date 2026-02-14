// @ts-nocheck — This file runs in Supabase's Deno runtime, not the frontend build
// ============================================================
// MicroMatch: Lead Submission Edge Function
// Handles lead capture with rate limiting and spam detection
// Deploy: supabase functions deploy submit-lead
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface LeadSubmission {
    type: 'influencer_application' | 'brand_inquiry' | 'email_capture';
    email: string;
    full_name?: string;
    phone?: string;
    company_name?: string;
    message?: string;
    social_platform?: string;
    social_handle?: string;
    follower_count?: number;
    content_niche?: string;
    budget_range?: string;
    campaign_goals?: string;
}

// Simple email validation
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Basic spam detection heuristics
function detectSpam(lead: LeadSubmission): boolean {
    // Check for common spam patterns
    const spamPatterns = [
        /\b(viagra|casino|lottery|prize|winner|click here|buy now|free money)\b/i,
        /https?:\/\/[^\s]*\.(ru|cn|tk|ml|ga|cf)\b/i,
    ];

    const textToCheck = [lead.message, lead.full_name, lead.company_name].filter(Boolean).join(' ');

    for (const pattern of spamPatterns) {
        if (pattern.test(textToCheck)) return true;
    }

    // Check for excessive URLs in message
    if (lead.message) {
        const urlCount = (lead.message.match(/https?:\/\//g) || []).length;
        if (urlCount > 3) return true;
    }

    return false;
}

serve(async (req: Request) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    try {
        const lead: LeadSubmission = await req.json();

        // ──── Validation ────
        if (!lead.email || !isValidEmail(lead.email)) {
            return new Response(JSON.stringify({ error: 'Valid email is required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (!lead.type || !['influencer_application', 'brand_inquiry', 'email_capture'].includes(lead.type)) {
            return new Response(JSON.stringify({ error: 'Invalid lead type' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Type-specific validation
        if (lead.type === 'influencer_application' && !lead.social_handle) {
            return new Response(JSON.stringify({ error: 'Social handle is required for influencer applications' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (lead.type === 'brand_inquiry' && !lead.company_name) {
            return new Response(JSON.stringify({ error: 'Company name is required for brand inquiries' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // ──── Spam Detection ────
        const isSpam = detectSpam(lead);

        // ──── Rate Limiting ────
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
            { auth: { persistSession: false } }
        );

        // Get client IP
        const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || 'unknown';

        // Check rate limit: max 5 submissions per hour per IP
        const { data: rateLimitAllowed } = await supabaseAdmin.rpc('check_rate_limit', {
            p_identifier: clientIP,
            p_action: 'lead_submit',
            p_max_requests: 5,
            p_window_minutes: 60,
        });

        if (!rateLimitAllowed) {
            return new Response(JSON.stringify({ error: 'Too many submissions. Please try again later.' }), {
                status: 429,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Check for duplicate email in recent submissions (prevent double submit)
        const { data: existingLead } = await supabaseAdmin
            .from('leads')
            .select('id')
            .eq('email', lead.email)
            .eq('type', lead.type)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .limit(1);

        if (existingLead && existingLead.length > 0) {
            return new Response(
                JSON.stringify({ message: 'You have already submitted. We will get back to you soon!' }),
                {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // ──── Insert Lead ────
        const { data, error } = await supabaseAdmin
            .from('leads')
            .insert({
                type: lead.type,
                email: lead.email.toLowerCase().trim(),
                full_name: lead.full_name?.trim() || null,
                phone: lead.phone?.trim() || null,
                company_name: lead.company_name?.trim() || null,
                message: lead.message?.trim() || null,
                social_platform: lead.social_platform || null,
                social_handle: lead.social_handle?.trim() || null,
                follower_count: lead.follower_count || null,
                content_niche: lead.content_niche?.trim() || null,
                budget_range: lead.budget_range?.trim() || null,
                campaign_goals: lead.campaign_goals?.trim() || null,
                ip_address: clientIP,
                user_agent: req.headers.get('user-agent') || null,
                is_spam: isSpam,
            })
            .select()
            .single();

        if (error) {
            console.error('Error inserting lead:', error);
            throw error;
        }

        // ──── Notify Admins (for non-spam leads) ────
        if (!isSpam) {
            const { data: admins } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('role', 'admin')
                .eq('is_active', true);

            if (admins) {
                const notifications = admins.map((admin) => ({
                    user_id: admin.id,
                    type: 'system' as const,
                    title: `New ${lead.type === 'influencer_application' ? 'Influencer Application' : lead.type === 'brand_inquiry' ? 'Brand Inquiry' : 'Email Signup'} 📬`,
                    message: `${lead.full_name || lead.email} has submitted a ${lead.type.replace(/_/g, ' ')}.`,
                    action_url: '/admin/leads',
                    metadata: { lead_id: data.id },
                }));

                await supabaseAdmin.from('notifications').insert(notifications);
            }
        }

        return new Response(
            JSON.stringify({
                message: 'Thank you! We will get back to you soon.',
                id: data.id,
            }),
            {
                status: 201,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Lead submission error:', error);
        return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
