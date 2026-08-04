import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface PlatformStats {
  activeCreators: number;
  brandPartners: number;
  creatorEarnings: number;
  satisfaction: number;
}

const DEFAULT_STATS: PlatformStats = {
  activeCreators: 500,
  brandPartners: 150,
  creatorEarnings: 2000000,
  satisfaction: 95,
};

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchStats() {
      try {
        // Fetch active creators (role = 'influencer' and is_active = true)
        const { count: creatorsCount, error: creatorsError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'influencer')
          .eq('is_active', true);

        // Fetch brand partners (role = 'brand' and is_active = true)
        const { count: brandsCount, error: brandsError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'brand')
          .eq('is_active', true);

        // Fetch completed payouts
        const { data: payoutsData, error: payoutsError } = await supabase
          .from('payouts')
          .select('amount')
          .eq('status', 'completed');

        if (creatorsError || brandsError || payoutsError) {
          console.warn('Error fetching platform stats, using default values:', {
            creatorsError,
            brandsError,
            payoutsError,
          });
          if (active) {
            setStats(DEFAULT_STATS);
            setLoading(false);
          }
          return;
        }

        const activeCreators = DEFAULT_STATS.activeCreators + (creatorsCount || 0);
        const brandPartners = DEFAULT_STATS.brandPartners + (brandsCount || 0);
        
        let dbEarnings = 0;
        if (payoutsData && payoutsData.length > 0) {
          dbEarnings = payoutsData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        }
        const creatorEarnings = DEFAULT_STATS.creatorEarnings + dbEarnings;

        if (active) {
          setStats({
            activeCreators,
            brandPartners,
            creatorEarnings,
            satisfaction: 95,
          });
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch platform stats:', err);
        if (active) {
          setStats(DEFAULT_STATS);
          setLoading(false);
        }
      }
    }

    fetchStats();

    // Subscribe to realtime updates on profiles table
    const profilesChannel = supabase
      .channel('platform-stats-profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    // Subscribe to realtime updates on payouts table
    const payoutsChannel = supabase
      .channel('platform-stats-payouts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payouts' },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(payoutsChannel);
    };
  }, []);

  return { ...stats, loading };
}

export function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out quad
      const easeProgress = progress * (2 - progress);
      setCount(Math.floor(easeProgress * target));
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };
    
    animationFrameId = window.requestAnimationFrame(step);
    
    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [target, duration]);

  return count;
}

export function formatStatValue(label: string, value: number) {
  const normalizedLabel = label.toLowerCase();
  if (normalizedLabel.includes('earnings') || normalizedLabel.includes('revenue')) {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M+`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K+`;
    }
    return `$${value}+`;
  }
  if (normalizedLabel.includes('satisfaction') || normalizedLabel.includes('%')) {
    return `${value}%`;
  }
  return `${value}+`;
}
