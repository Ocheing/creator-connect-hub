import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/database.types';

// ────────────────────────────────────────────────────────
// Loading Spinner
// ────────────────────────────────────────────────────────

const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-coral/30 border-t-coral rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
    </div>
);

// ────────────────────────────────────────────────────────
// ProtectedRoute: Requires authentication
// ────────────────────────────────────────────────────────

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
    redirectTo = '/sign-in',
}) => {
    const { isAuthenticated, isLoading, profile } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Check role-based access
    if (allowedRoles) {
        if (!profile) {
            // If we require specific roles but profile failed to load, deny access
            return <Navigate to="/" replace />;
        }
        
        if (!allowedRoles.includes(profile.role)) {
            // Redirect to role-appropriate dashboard
            const roleRedirectMap: Record<UserRole, string> = {
                influencer: '/dashboard',
                brand: '/dashboard/brand',
                admin: '/admin',
            };
            return <Navigate to={roleRedirectMap[profile.role] || '/'} replace />;
        }
    }

    return <>{children}</>;
};

// ────────────────────────────────────────────────────────
// PublicOnlyRoute: Redirects if already authenticated
// ────────────────────────────────────────────────────────

interface PublicOnlyRouteProps {
    children: React.ReactNode;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading, profile } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (isAuthenticated && profile) {
        const roleRedirectMap: Record<UserRole, string> = {
            influencer: '/dashboard',
            brand: '/dashboard/brand',
            admin: '/admin',
        };
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
        const target = from && from !== '/' && from !== '/sign-in' && from !== '/sign-up'
            ? from
            : (roleRedirectMap[profile.role] || '/dashboard');

        return <Navigate to={target} replace />;
    }

    return <>{children}</>;
};

// ────────────────────────────────────────────────────────
// AdminRoute: Shorthand for admin-only routes
// ────────────────────────────────────────────────────────

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ProtectedRoute allowedRoles={['admin']}>
        {children}
    </ProtectedRoute>
);

// ────────────────────────────────────────────────────────
// InfluencerRoute: Shorthand for influencer routes
// ────────────────────────────────────────────────────────

export const InfluencerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ProtectedRoute allowedRoles={['influencer', 'admin']}>
        {children}
    </ProtectedRoute>
);

// ────────────────────────────────────────────────────────
// BrandRoute: Shorthand for brand routes
// ────────────────────────────────────────────────────────

export const BrandRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ProtectedRoute allowedRoles={['brand', 'admin']}>
        {children}
    </ProtectedRoute>
);
