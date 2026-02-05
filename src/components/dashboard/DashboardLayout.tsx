import { Link, useLocation } from "react-router-dom";
import { Sparkles, LayoutDashboard, Users, Briefcase, DollarSign, MessageSquare, Settings, LogOut, FileText, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType?: "influencer" | "brand" | "admin";
}

const DashboardLayout = ({ children, userType = "influencer" }: DashboardLayoutProps) => {
  const location = useLocation();

  const influencerNav = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/applications", icon: FileText, label: "My Applications" },
    { href: "/dashboard/deals", icon: Briefcase, label: "Brand Deals" },
    { href: "/dashboard/earnings", icon: DollarSign, label: "Earnings" },
    { href: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  const brandNav = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
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
        <nav className="flex-1 py-6 px-4 space-y-1">
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
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
              <span className="font-semibold text-coral">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">John Doe</p>
              <p className="text-xs text-muted-foreground capitalize">{userType}</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 mt-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Link>
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
        </header>

        {/* Content */}
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
