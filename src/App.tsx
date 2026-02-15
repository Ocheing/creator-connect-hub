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

// Public Pages
import Index from "./pages/Index";
import Services from "./pages/Services";
import ForInfluencers from "./pages/ForInfluencers";
import ForBrands from "./pages/ForBrands";
import About from "./pages/About";
import Blog from "./pages/Blog";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

// Dashboard Pages
import InfluencerDashboard from "./pages/dashboard/InfluencerDashboard";
import InfluencerApplications from "./pages/dashboard/InfluencerApplications";
import InfluencerDeals from "./pages/dashboard/InfluencerDeals";
import InfluencerEarnings from "./pages/dashboard/InfluencerEarnings";
import Messages from "./pages/dashboard/Messages";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
import BrandDashboard from "./pages/dashboard/BrandDashboard";
import BrandCampaigns from "./pages/dashboard/BrandCampaigns";
import BrandInfluencers from "./pages/dashboard/BrandInfluencers";
import BrandBudget from "./pages/dashboard/BrandBudget";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCampaigns from "./pages/admin/AdminCampaigns";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminFinances from "./pages/admin/AdminFinances";
import ContentManagement from "./pages/admin/ContentManagement";
import AdminSettings from "./pages/admin/AdminSettings";

// Error Pages
import NotFound from "./pages/NotFound";

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
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/for-influencers" element={<ForInfluencers />} />
            <Route path="/for-brands" element={<ForBrands />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />

            {/* ── Auth Routes (redirect if already logged in) ── */}
            <Route
              path="/sign-in"
              element={
                <PublicOnlyRoute>
                  <SignIn />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/sign-up"
              element={
                <PublicOnlyRoute>
                  <SignUp />
                </PublicOnlyRoute>
              }
            />

            {/* ── Influencer Dashboard ── */}
            <Route
              path="/dashboard"
              element={
                <InfluencerRoute>
                  <InfluencerDashboard />
                </InfluencerRoute>
              }
            />
            <Route
              path="/dashboard/applications"
              element={
                <InfluencerRoute>
                  <InfluencerApplications />
                </InfluencerRoute>
              }
            />
            <Route
              path="/dashboard/deals"
              element={
                <InfluencerRoute>
                  <InfluencerDeals />
                </InfluencerRoute>
              }
            />
            <Route
              path="/dashboard/earnings"
              element={
                <InfluencerRoute>
                  <InfluencerEarnings />
                </InfluencerRoute>
              }
            />
            <Route
              path="/dashboard/messages"
              element={
                <ProtectedRoute allowedRoles={['influencer', 'brand', 'admin']}>
                  <Messages userType="influencer" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute allowedRoles={['influencer', 'brand', 'admin']}>
                  <DashboardSettings userType="influencer" />
                </ProtectedRoute>
              }
            />

            {/* ── Brand Dashboard ── */}
            <Route
              path="/dashboard/brand"
              element={
                <BrandRoute>
                  <BrandDashboard />
                </BrandRoute>
              }
            />
            <Route
              path="/dashboard/campaigns"
              element={
                <BrandRoute>
                  <BrandCampaigns />
                </BrandRoute>
              }
            />
            <Route
              path="/dashboard/influencers"
              element={
                <BrandRoute>
                  <BrandInfluencers />
                </BrandRoute>
              }
            />
            <Route
              path="/dashboard/budget"
              element={
                <BrandRoute>
                  <BrandBudget />
                </BrandRoute>
              }
            />

            {/* ── Admin Routes ── */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/campaigns"
              element={
                <AdminRoute>
                  <AdminCampaigns />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/applications"
              element={
                <AdminRoute>
                  <AdminApplications />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/finances"
              element={
                <AdminRoute>
                  <AdminFinances />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/content"
              element={
                <AdminRoute>
                  <ContentManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <AdminSettings />
                </AdminRoute>
              }
            />

            {/* ── 404 ── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
