import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Users, Search, UserCheck, UserX, Shield, MoreVertical, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/api";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

const roleColors: Record<string, string> = {
  influencer: "bg-blue-100 text-blue-700",
  brand: "bg-purple-100 text-purple-700",
  admin: "bg-amber-100 text-amber-700",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  suspended: "bg-red-100 text-red-700",
};

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: rawUsers, isLoading, refetch } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: adminService.getAllUsersExtended,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-users-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleVerify = async (userId: string) => {
    try {
      await adminService.verifyUser(userId);
      toast.success("User verified successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to verify user");
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await adminService.toggleUserActive(userId, isActive);
      toast.success(isActive ? "User reactivated" : "User suspended");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update user status");
    }
  };

  const users = rawUsers?.map((u: any) => {
    let status = 'active';
    if (!u.is_active) status = 'suspended';
    else if (!u.is_verified) status = 'pending';

    return {
      id: u.id,
      name: u.full_name || 'Unknown',
      email: u.email,
      role: u.role,
      status: status,
      verified: u.is_verified,
      joinedAt: u.created_at ? format(new Date(u.created_at), 'MMM d, yyyy') : 'N/A',
      followers: u.role === 'influencer' ? (u.influencer_profile?.total_followers?.toLocaleString() || '0') : null
    };
  }) || [];

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-coral" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">User Management</h1>
            <p className="text-muted-foreground">View, manage, and moderate all platform users.</p>
          </div>
          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{users.length}</p><p className="text-xs text-muted-foreground">Total Users</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === "influencer").length}</p><p className="text-xs text-muted-foreground">Influencers</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === "brand").length}</p><p className="text-xs text-muted-foreground">Brands</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{users.filter(u => u.status === "pending").length}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="influencer">Influencers</TabsTrigger>
            <TabsTrigger value="brand">Brands</TabsTrigger>
            <TabsTrigger value="suspended">Suspended</TabsTrigger>
          </TabsList>

          {["all", "influencer", "brand", "suspended"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers
                          .filter((u) => {
                            if (tab === "all") return true;
                            if (tab === "suspended") return u.status === "suspended";
                            return u.role === tab;
                          })
                          .map((user) => (
                            <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-coral/10 flex items-center justify-center">
                                    <span className="font-semibold text-coral text-xs">
                                      {user.name.split(" ").map((n: string) => n[0]).join("")}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium flex items-center gap-1">
                                      {user.name}
                                      {user.verified && <UserCheck className="w-3.5 h-3.5 text-blue-500" />}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Badge className={`border-0 text-xs ${roleColors[user.role]}`}>{user.role}</Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Badge className={`border-0 text-xs ${statusColors[user.status]}`}>{user.status}</Badge>
                              </td>
                              <td className="py-3 px-4 text-sm text-muted-foreground">{user.joinedAt}</td>
                              <td className="py-3 px-4">
                                <div className="flex gap-1">
                                  {user.status === "pending" && (
                                    <Button size="sm" variant="coral" className="text-xs h-7" onClick={() => handleVerify(user.id)}>Approve</Button>
                                  )}
                                  {user.status === "active" && (
                                    <Button size="sm" variant="ghost" className="text-xs h-7 text-red-600" onClick={() => handleToggleActive(user.id, false)}>Suspend</Button>
                                  )}
                                  {user.status === "suspended" && (
                                    <Button size="sm" variant="ghost" className="text-xs h-7 text-green-600" onClick={() => handleToggleActive(user.id, true)}>Reactivate</Button>
                                  )}
                                  <Button size="sm" variant="ghost" className="text-xs h-7"><MoreVertical className="w-3 h-3" /></Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        {filteredUsers.filter((u) => {
                          if (tab === "all") return true;
                          if (tab === "suspended") return u.status === "suspended";
                          return u.role === tab;
                        }).length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                No users found.
                              </td>
                            </tr>
                          )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
