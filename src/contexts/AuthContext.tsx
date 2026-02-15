import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types/database.types';

// ────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────

interface AuthState {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

interface SignUpParams {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    companyName?: string;
}

interface SignInParams {
    email: string;
    password: string;
}

interface AuthContextType extends AuthState {
    signUp: (params: SignUpParams) => Promise<{ error: AuthError | null }>;
    signIn: (params: SignInParams) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
    updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
    refreshProfile: () => Promise<void>;
    isRole: (role: UserRole) => boolean;
    isAdmin: boolean;
}

// ────────────────────────────────────────────────────────
// Context
// ────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ────────────────────────────────────────────────────────
// Provider
// ────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        profile: null,
        session: null,
        isLoading: true,
        isAuthenticated: false,
    });

    // Fetch user profile from the profiles table
    const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // Ignore AbortError as it's expected during component unmount or rapid updates
                if (error.message?.includes('AbortError') || error.message?.includes('signal is aborted')) {
                    return null;
                }
                console.error('Error fetching profile:', error.message);
                return null;
            }

            return data as Profile;
        } catch (err: unknown) {
            // Ignore AbortError as it's expected during component unmount or rapid updates
            if (err instanceof Error && (err.name === 'AbortError' || err.message?.includes('AbortError') || err.message?.includes('signal is aborted'))) {
                return null;
            }
            console.error('Unexpected error fetching profile:', err);
            return null;
        }
    }, []);

    // Update last login timestamp
    const updateLastLogin = useCallback(async (userId: string) => {
        try {
            await supabase
                .from('profiles')
                .update({ last_login_at: new Date().toISOString() })
                .eq('id', userId);
        } catch (err) {
            console.error('Error updating last login:', err);
        }
    }, []);

    // Refresh profile data
    const refreshProfile = useCallback(async () => {
        if (state.user) {
            const profile = await fetchProfile(state.user.id);
            setState((prev) => ({ ...prev, profile }));
        }
    }, [state.user, fetchProfile]);

    // Initialize auth state
    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                // Get current session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Error getting session:', error.message);
                    if (mounted) {
                        setState({
                            user: null,
                            profile: null,
                            session: null,
                            isLoading: false,
                            isAuthenticated: false,
                        });
                    }
                    return;
                }

                if (session?.user && mounted) {
                    const profile = await fetchProfile(session.user.id);
                    setState({
                        user: session.user,
                        profile,
                        session,
                        isLoading: false,
                        isAuthenticated: true,
                    });
                } else if (mounted) {
                    setState({
                        user: null,
                        profile: null,
                        session: null,
                        isLoading: false,
                        isAuthenticated: false,
                    });
                }
            } catch (err: unknown) {
                // Ignore AbortError during initialization
                if (err instanceof Error && (err.name === 'AbortError' || err.message?.includes('AbortError'))) {
                    if (mounted) {
                        setState({
                            user: null,
                            profile: null,
                            session: null,
                            isLoading: false,
                            isAuthenticated: false,
                        });
                    }
                    return;
                }

                console.error('Auth initialization error:', err);
                if (mounted) {
                    setState({
                        user: null,
                        profile: null,
                        session: null,
                        isLoading: false,
                        isAuthenticated: false,
                    });
                }
            }
        };

        initializeAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;

                if (event === 'SIGNED_IN' && session?.user) {
                    const profile = await fetchProfile(session.user.id);
                    setState({
                        user: session.user,
                        profile,
                        session,
                        isLoading: false,
                        isAuthenticated: true,
                    });
                    updateLastLogin(session.user.id);
                } else if (event === 'SIGNED_OUT') {
                    setState({
                        user: null,
                        profile: null,
                        session: null,
                        isLoading: false,
                        isAuthenticated: false,
                    });
                } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                    setState((prev) => ({
                        ...prev,
                        session,
                        user: session.user,
                    }));
                } else if (event === 'USER_UPDATED' && session?.user) {
                    const profile = await fetchProfile(session.user.id);
                    setState((prev) => ({
                        ...prev,
                        user: session.user,
                        profile,
                        session,
                    }));
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile, updateLastLogin]);

    // ──────── Auth Actions ────────

    const signUp = async ({ email, password, fullName, role, companyName }: SignUpParams) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role,
                    company_name: companyName,
                },
                emailRedirectTo: `${window.location.origin}/sign-in`,
            },
        });

        return { error };
    };

    const signIn = async ({ email, password }: SignInParams) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setState({
            user: null,
            profile: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
        });
    };

    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        return { error };
    };

    const updatePassword = async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });
        return { error };
    };

    const isRole = (role: UserRole) => state.profile?.role === role;

    const value: AuthContextType = {
        ...state,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile,
        isRole,
        isAdmin: state.profile?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ────────────────────────────────────────────────────────
// Hook
// ────────────────────────────────────────────────────────

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};


