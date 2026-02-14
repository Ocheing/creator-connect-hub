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
import BrandDashboard from "./pages/dashboard/BrandDashboard";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ContentManagement from "./pages/admin/ContentManagement";

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

            {/* ── Influencer Dashboard (influencer + admin) ── */}
            <Route
              path="/dashboard"
              element={
                <InfluencerRoute>
                  <InfluencerDashboard />
                </InfluencerRoute>
              }
            />

            {/* ── Brand Dashboard (brand + admin) ── */}
            <Route
              path="/dashboard/brand"
              element={
                <BrandRoute>
                  <BrandDashboard />
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
              path="/admin/content"
              element={
                <AdminRoute>
                  <ContentManagement />
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
