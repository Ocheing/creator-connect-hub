import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Users, Search, UserCheck, UserX, Shield, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const users = [
  { id: "1", name: "Sarah Chen", email: "sarah@example.com", role: "influencer", status: "active", verified: true, joinedAt: "Jan 5, 2024", followers: "8.2K" },
  { id: "2", name: "Marcus Johnson", email: "marcus@example.com", role: "influencer", status: "active", verified: true, joinedAt: "Jan 12, 2024", followers: "5.7K" },
  { id: "3", name: "Organic Skincare Co.", email: "info@organicskincare.co.ke", role: "brand", status: "active", verified: true, joinedAt: "Dec 10, 2023", followers: null },
  { id: "4", name: "Alex Thompson", email: "alex@example.com", role: "influencer", status: "pending", verified: false, joinedAt: "Feb 10, 2024", followers: "7.2K" },
  { id: "5", name: "FitLife Supplements", email: "hello@fitlife.co.ke", role: "brand", status: "active", verified: false, joinedAt: "Jan 20, 2024", followers: null },
  { id: "6", name: "Jessica Wu", email: "jessica@example.com", role: "influencer", status: "suspended", verified: false, joinedAt: "Feb 8, 2024", followers: "9.1K" },
  { id: "7", name: "GreenHome Kenya", email: "contact@greenhome.co.ke", role: "brand", status: "active", verified: true, joinedAt: "Feb 1, 2024", followers: null },
  { id: "8", name: "David Park", email: "david@example.com", role: "influencer", status: "active", verified: true, joinedAt: "Jan 28, 2024", followers: "4.5K" },
];

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
            <Input placeholder="Search users..." className="pl-10" />
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
                        {users
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
                                      {user.name.split(" ").map(n => n[0]).join("")}
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
                                    <Button size="sm" variant="coral" className="text-xs h-7">Approve</Button>
                                  )}
                                  {user.status === "active" && (
                                    <Button size="sm" variant="ghost" className="text-xs h-7 text-red-600">Suspend</Button>
                                  )}
                                  {user.status === "suspended" && (
                                    <Button size="sm" variant="ghost" className="text-xs h-7 text-green-600">Reactivate</Button>
                                  )}
                                  <Button size="sm" variant="ghost" className="text-xs h-7"><MoreVertical className="w-3 h-3" /></Button>
                                </div>
                              </td>
                            </tr>
                          ))}
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
