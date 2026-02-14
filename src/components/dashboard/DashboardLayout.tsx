import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sparkles, LayoutDashboard, Users, Briefcase, DollarSign,
  MessageSquare, Settings, LogOut, FileText, BarChart,
  Eye, Shield, ChevronDown, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType?: "influencer" | "brand" | "admin";
}

const DashboardLayout = ({ children, userType = "influencer" }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);

  const influencerNav = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/applications", icon: FileText, label: "My Applications" },
    { href: "/dashboard/deals", icon: Briefcase, label: "Brand Deals" },
    { href: "/dashboard/earnings", icon: DollarSign, label: "Earnings" },
    { href: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  const brandNav = [
    { href: "/dashboard/brand", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/campaigns", icon: Briefcase, label: "Campaigns" },
    { href: "/dashboard/influencers", icon: Users, label: "Matched Influencers" },
    { href: "/dashboard/budget", icon: DollarSign, label: "Budget" },
    { href: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  const adminNav = [
    { href: "/admin", icon: LayoutDashboard, label: "Overview" },
    { href: "/admin/users", icon: Users, label: "User Management" },
    { href: "/admin/campaigns", icon: Briefcase, label: "Campaigns" },
    { href: "/admin/applications", icon: FileText, label: "Applications" },
    { href: "/admin/finances", icon: DollarSign, label: "Finances" },
    { href: "/admin/content", icon: BarChart, label: "Content" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  const navItems = userType === "admin" ? adminNav : userType === "brand" ? brandNav : influencerNav;

  // Get user initials for avatar
  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-card border-r border-border">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-coral flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg">
              Micro<span className="text-coral">Match</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-coral/10 text-coral"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}

          {/* ── Admin: Quick-Access to Other Dashboards ── */}
          {isAdmin && userType === "admin" && (
            <div className="pt-4 mt-4 border-t border-border">
              <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                View As
              </p>
              <Link
                to="/dashboard"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === "/dashboard"
                    ? "bg-blue-500/10 text-blue-600"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Eye className="w-5 h-5" />
                Influencer Dashboard
              </Link>
              <Link
                to="/dashboard/brand"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === "/dashboard/brand"
                    ? "bg-purple-500/10 text-purple-600"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Eye className="w-5 h-5" />
                Brand Dashboard
              </Link>
            </div>
          )}

          {/* ── Non-admin dashboard: Show link back to admin panel if admin ── */}
          {isAdmin && userType !== "admin" && (
            <div className="pt-4 mt-4 border-t border-border">
              <Link
                to="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
              >
                <Shield className="w-5 h-5" />
                Admin Panel
              </Link>
            </div>
          )}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
              <span className="font-semibold text-coral text-sm">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{profile?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                {isAdmin && <Shield className="w-3 h-3" />}
                {profile?.role || userType}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 mt-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center justify-between px-4 bg-card border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-coral flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg">
              Micro<span className="text-coral">Match</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Admin badge (mobile) */}
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium"
                >
                  <Shield className="w-3 h-3" />
                  Admin
                  <ChevronDown className="w-3 h-3" />
                </button>
                {viewDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-lg shadow-lg border border-border py-1 z-50">
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => setViewDropdownOpen(false)}
                    >
                      <Shield className="w-4 h-4" /> Admin Panel
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => setViewDropdownOpen(false)}
                    >
                      <Eye className="w-4 h-4" /> Influencer View
                    </Link>
                    <Link
                      to="/dashboard/brand"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => setViewDropdownOpen(false)}
                    >
                      <Eye className="w-4 h-4" /> Brand View
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-muted"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-card border-b border-border px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-coral/10 text-coral"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full border-t border-border mt-2 pt-4"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
