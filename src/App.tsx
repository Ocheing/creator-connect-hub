import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import {
  ProtectedRoute,
  PublicOnlyRoute,
  AdminRoute,
  InfluencerRoute,
  BrandRoute,
} from "@/components/auth/ProtectedRoute";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Suspense, lazy } from "react";

// Public Pages
const Index = lazy(() => import("./pages/Index"));
const Services = lazy(() => import("./pages/Services"));
const ForInfluencers = lazy(() => import("./pages/ForInfluencers"));
const ForBrands = lazy(() => import("./pages/ForBrands"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));

// Dashboard Pages
const InfluencerDashboard = lazy(() => import("./pages/dashboard/InfluencerDashboard"));
const InfluencerApplications = lazy(() => import("./pages/dashboard/InfluencerApplications"));
const InfluencerDeals = lazy(() => import("./pages/dashboard/InfluencerDeals"));
const InfluencerEarnings = lazy(() => import("./pages/dashboard/InfluencerEarnings"));
const Messages = lazy(() => import("./pages/dashboard/Messages"));
const DashboardSettings = lazy(() => import("./pages/dashboard/DashboardSettings"));
const BrandDashboard = lazy(() => import("./pages/dashboard/BrandDashboard"));
const BrandCampaigns = lazy(() => import("./pages/dashboard/BrandCampaigns"));
const BrandInfluencers = lazy(() => import("./pages/dashboard/BrandInfluencers"));
const BrandBudget = lazy(() => import("./pages/dashboard/BrandBudget"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminCampaigns = lazy(() => import("./pages/admin/AdminCampaigns"));
const AdminApplications = lazy(() => import("./pages/admin/AdminApplications"));
const AdminFinances = lazy(() => import("./pages/admin/AdminFinances"));
const ContentManagement = lazy(() => import("./pages/admin/ContentManagement"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

// Error Pages
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* ── Public Routes ── */}
            <Route path="/" element={<Suspense fallback={<LoadingSpinner />}><Index /></Suspense>} />
            <Route path="/services" element={<Suspense fallback={<LoadingSpinner />}><Services /></Suspense>} />
            <Route path="/for-influencers" element={<Suspense fallback={<LoadingSpinner />}><ForInfluencers /></Suspense>} />
            <Route path="/for-brands" element={<Suspense fallback={<LoadingSpinner />}><ForBrands /></Suspense>} />
            <Route path="/about" element={<Suspense fallback={<LoadingSpinner />}><About /></Suspense>} />
            <Route path="/blog" element={<Suspense fallback={<LoadingSpinner />}><Blog /></Suspense>} />

            {/* ── Auth Routes (redirect if already logged in) ── */}
            <Route
              path="/sign-in"
              element={
                <PublicOnlyRoute>
                  <Suspense fallback={<LoadingSpinner />}><SignIn /></Suspense>
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/sign-up"
              element={
                <PublicOnlyRoute>
                  <Suspense fallback={<LoadingSpinner />}><SignUp /></Suspense>
                </PublicOnlyRoute>
              }
            />

            {/* ── Influencer Dashboard ── */}
            <Route
              path="/dashboard"
              element={
                <InfluencerRoute>
                  <Suspense fallback={<LoadingSpinner />}><InfluencerDashboard /></Suspense>
                </InfluencerRoute>
              }
            />
            <Route
              path="/dashboard/applications"
              element={
                <InfluencerRoute>
                  <Suspense fallback={<LoadingSpinner />}><InfluencerApplications /></Suspense>
                </InfluencerRoute>
              }
            />
            <Route
              path="/dashboard/deals"
              element={
                <InfluencerRoute>
                  <Suspense fallback={<LoadingSpinner />}><InfluencerDeals /></Suspense>
                </InfluencerRoute>
              }
            />
            <Route
              path="/dashboard/earnings"
              element={
                <InfluencerRoute>
                  <Suspense fallback={<LoadingSpinner />}><InfluencerEarnings /></Suspense>
                </InfluencerRoute>
              }
            />
            <Route
              path="/dashboard/messages"
              element={
                <ProtectedRoute allowedRoles={['influencer', 'brand', 'admin']}>
                  <Suspense fallback={<LoadingSpinner />}><Messages userType="influencer" /></Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute allowedRoles={['influencer', 'brand', 'admin']}>
                  <Suspense fallback={<LoadingSpinner />}><DashboardSettings userType="influencer" /></Suspense>
                </ProtectedRoute>
              }
            />

            {/* ── Brand Dashboard ── */}
            <Route
              path="/dashboard/brand"
              element={
                <BrandRoute>
                  <Suspense fallback={<LoadingSpinner />}><BrandDashboard /></Suspense>
                </BrandRoute>
              }
            />
            <Route
              path="/dashboard/campaigns"
              element={
                <BrandRoute>
                  <Suspense fallback={<LoadingSpinner />}><BrandCampaigns /></Suspense>
                </BrandRoute>
              }
            />
            <Route
              path="/dashboard/influencers"
              element={
                <BrandRoute>
                  <Suspense fallback={<LoadingSpinner />}><BrandInfluencers /></Suspense>
                </BrandRoute>
              }
            />
            <Route
              path="/dashboard/budget"
              element={
                <BrandRoute>
                  <Suspense fallback={<LoadingSpinner />}><BrandBudget /></Suspense>
                </BrandRoute>
              }
            />

            {/* ── Admin Routes ── */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}><AdminDashboard /></Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}><AdminUsers /></Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/campaigns"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}><AdminCampaigns /></Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/applications"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}><AdminApplications /></Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/finances"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}><AdminFinances /></Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/content"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}><ContentManagement /></Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}><AdminSettings /></Suspense>
                </AdminRoute>
              }
            />

            {/* ── 404 ── */}
            <Route path="*" element={<Suspense fallback={<LoadingSpinner />}><NotFound /></Suspense>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
