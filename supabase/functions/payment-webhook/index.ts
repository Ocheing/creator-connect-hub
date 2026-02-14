// @ts-nocheck — This file runs in Supabase's Deno runtime, not the frontend build
// ============================================================
// MicroMatch: Payment Webhook Edge Function
// Handles incoming payment webhooks (Paystack/Stripe/etc.)
// Deploy: supabase functions deploy payment-webhook
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface WebhookPayload {
    event: string;
    data: {
        reference: string;
        amount: number;
        currency: string;
        status: string;
        metadata?: {
            campaign_id?: string;
            brand_id?: string;
            payment_id?: string;
            idempotency_key?: string;
        };
    };
}

serve(async (req: Request) => {
    // Handle CORS preflight
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
        // Verify webhook secret
        const webhookSecret = Deno.env.get('PAYMENT_WEBHOOK_SECRET');
        const signature = req.headers.get('x-webhook-secret') || req.headers.get('x-paystack-signature');

        if (webhookSecret && signature !== webhookSecret) {
            console.error('Invalid webhook signature');
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const payload: WebhookPayload = await req.json();
        console.log('Webhook received:', payload.event);

        // Create admin Supabase client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
            { auth: { persistSession: false } }
        );

        switch (payload.event) {
            case 'charge.success':
            case 'payment_intent.succeeded': {
                const { reference, amount, status, metadata } = payload.data;

                if (!metadata?.payment_id) {
                    console.error('Missing payment_id in metadata');
                    return new Response(JSON.stringify({ error: 'Missing payment_id' }), {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    });
                }

                // Check idempotency — prevent duplicate processing
                const { data: existingPayment } = await supabaseAdmin
                    .from('payments')
                    .select('id, status')
                    .eq('id', metadata.payment_id)
                    .single();

                if (!existingPayment) {
                    console.error('Payment not found:', metadata.payment_id);
                    return new Response(JSON.stringify({ error: 'Payment not found' }), {
                        status: 404,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    });
                }

                if (existingPayment.status === 'completed') {
                    console.log('Payment already completed, skipping:', metadata.payment_id);
                    return new Response(JSON.stringify({ message: 'Already processed' }), {
                        status: 200,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    });
                }

                // Update payment status
                const { error: updateError } = await supabaseAdmin
                    .from('payments')
                    .update({
                        status: 'completed',
                        external_payment_id: reference,
                        paid_at: new Date().toISOString(),
                        payment_metadata: payload.data,
                    })
                    .eq('id', metadata.payment_id);

                if (updateError) {
                    console.error('Error updating payment:', updateError);
                    throw updateError;
                }

                // Log the transaction
                await supabaseAdmin.from('transaction_log').insert({
                    entity_type: 'payment',
                    entity_id: metadata.payment_id,
                    action: 'webhook_payment_completed',
                    old_status: existingPayment.status,
                    new_status: 'completed',
                    amount: amount / 100, // Paystack amounts are in kobo
                    metadata: { webhook_event: payload.event, reference },
                });

                // Update campaign budget_spent
                if (metadata.campaign_id) {
                    const { data: campaign } = await supabaseAdmin
                        .from('campaigns')
                        .select('budget_spent')
                        .eq('id', metadata.campaign_id)
                        .single();

                    if (campaign) {
                        await supabaseAdmin
                            .from('campaigns')
                            .update({ budget_spent: campaign.budget_spent + (amount / 100) })
                            .eq('id', metadata.campaign_id);
                    }
                }

                // Notify the brand
                if (metadata.brand_id) {
                    await supabaseAdmin.from('notifications').insert({
                        user_id: metadata.brand_id,
                        type: 'payment',
                        title: 'Payment Confirmed ✅',
                        message: `Your payment of KES ${(amount / 100).toLocaleString()} has been processed successfully.`,
                        action_url: '/dashboard/budget',
                        metadata: { payment_id: metadata.payment_id },
                    });
                }

                console.log('Payment processed successfully:', metadata.payment_id);
                break;
            }

            case 'charge.failed':
            case 'payment_intent.payment_failed': {
                const { metadata } = payload.data;

                if (metadata?.payment_id) {
                    await supabaseAdmin
                        .from('payments')
                        .update({
                            status: 'failed',
                            failed_at: new Date().toISOString(),
                            failure_reason: payload.data.status,
                        })
                        .eq('id', metadata.payment_id);

                    await supabaseAdmin.from('transaction_log').insert({
                        entity_type: 'payment',
                        entity_id: metadata.payment_id,
                        action: 'webhook_payment_failed',
                        new_status: 'failed',
                        metadata: { webhook_event: payload.event },
                    });
                }
                break;
            }

            case 'transfer.success': {
                // Payout completed
                const { metadata, reference } = payload.data;

                if (metadata?.payment_id) {
                    // Find the payout by payment reference
                    const { data: payout } = await supabaseAdmin
                        .from('payouts')
                        .select('id, influencer_id, amount')
                        .eq('external_payout_id', reference)
                        .single();

                    if (payout) {
                        await supabaseAdmin
                            .from('payouts')
                            .update({
                                status: 'completed',
                                paid_at: new Date().toISOString(),
                            })
                            .eq('id', payout.id);

                        // Notify influencer
                        await supabaseAdmin.from('notifications').insert({
                            user_id: payout.influencer_id,
                            type: 'payment',
                            title: 'Payout Received! 💰',
                            message: `You've received a payout of KES ${payout.amount.toLocaleString()}.`,
                            action_url: '/dashboard/earnings',
                            metadata: { payout_id: payout.id },
                        });

                        await supabaseAdmin.from('transaction_log').insert({
                            entity_type: 'payout',
                            entity_id: payout.id,
                            action: 'webhook_payout_completed',
                            new_status: 'completed',
                            amount: payout.amount,
                            metadata: { webhook_event: payload.event, reference },
                        });
                    }
                }
                break;
            }

            default:
                console.log('Unhandled webhook event:', payload.event);
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
