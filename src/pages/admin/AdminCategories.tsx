import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Edit2,
    Trash2,
    Tag,
    Loader2,
    Save,
    X,
    BarChart3,
    Search,
    ToggleLeft,
    ToggleRight,
    ArrowUpDown,
    Users,
    Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import type { Category, CategoryStats } from "@/types/database.types";

const AdminCategories = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    // Form state
    const [form, setForm] = useState({
        name: "",
        description: "",
        icon: "",
        display_order: 0,
        is_active: true,
    });

    // Fetch all categories (including inactive for admin)
    const { data: categories = [], isLoading } = useQuery({
        queryKey: ["admin-categories"],
        queryFn: () => categoryService.getCategories(false),
    });

    // Fetch category stats
    const { data: stats = [] } = useQuery({
        queryKey: ["category-stats"],
        queryFn: () => categoryService.getCategoryStats(),
    });

    const statsMap = new Map<string, CategoryStats>();
    stats.forEach((s) => statsMap.set(s.category_id, s));

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: typeof form) =>
            categoryService.createCategory({
                name: data.name,
                description: data.description || null,
                icon: data.icon || null,
                parent_id: null,
                is_active: data.is_active,
                display_order: data.display_order,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            queryClient.invalidateQueries({ queryKey: ["category-stats"] });
            setShowCreate(false);
            resetForm();
            toast({ title: "Category Created", description: "New category has been added successfully." });
        },
        onError: (err: Error) => {
            toast({ variant: "destructive", title: "Error", description: err.message });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: typeof form }) =>
            categoryService.updateCategory(id, {
                name: data.name,
                description: data.description || null,
                icon: data.icon || null,
                is_active: data.is_active,
                display_order: data.display_order,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            queryClient.invalidateQueries({ queryKey: ["category-stats"] });
            setEditingId(null);
            resetForm();
            toast({ title: "Category Updated", description: "Category has been updated." });
        },
        onError: (err: Error) => {
            toast({ variant: "destructive", title: "Error", description: err.message });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => categoryService.deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            queryClient.invalidateQueries({ queryKey: ["category-stats"] });
            toast({ title: "Category Deleted" });
        },
        onError: (err: Error) => {
            toast({ variant: "destructive", title: "Error", description: err.message });
        },
    });

    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
            categoryService.updateCategory(id, { is_active }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });

    const resetForm = () => {
        setForm({ name: "", description: "", icon: "", display_order: 0, is_active: true });
    };

    const startEdit = (cat: Category) => {
        setEditingId(cat.id);
        setShowCreate(false);
        setForm({
            name: cat.name,
            description: cat.description || "",
            icon: cat.icon || "",
            display_order: cat.display_order,
            is_active: cat.is_active,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        resetForm();
    };

    const handleSave = () => {
        if (!form.name.trim()) {
            toast({ variant: "destructive", title: "Name required" });
            return;
        }
        if (editingId) {
            updateMutation.mutate({ id: editingId, data: form });
        } else {
            createMutation.mutate(form);
        }
    };

    const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalCampaigns = stats.reduce((s, st) => s + st.campaign_count, 0);
    const totalInfluencers = stats.reduce((s, st) => s + st.influencer_count, 0);

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
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-coral flex items-center justify-center">
                                <Tag className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-3xl font-heading font-bold">Categories</h1>
                        </div>
                        <p className="text-muted-foreground">
                            Manage the categories used for campaign &amp; influencer matching
                        </p>
                    </div>
                    <Button
                        variant="coral"
                        onClick={() => {
                            setShowCreate(true);
                            setEditingId(null);
                            resetForm();
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Category
                    </Button>
                </div>

                {/* Stats Summary */}
                <div className="grid sm:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center">
                                <Tag className="w-6 h-6 text-coral" />
                            </div>
                            <div>
                                <p className="text-2xl font-heading font-bold">
                                    {categories.length}
                                </p>
                                <p className="text-sm text-muted-foreground">Total Categories</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-heading font-bold">{totalCampaigns}</p>
                                <p className="text-sm text-muted-foreground">
                                    Campaign Assignments
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-heading font-bold">
                                    {totalInfluencers}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Influencer Assignments
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="manage">
                    <TabsList>
                        <TabsTrigger value="manage">Manage</TabsTrigger>
                        <TabsTrigger value="stats">Usage Stats</TabsTrigger>
                    </TabsList>

                    {/* ── Manage Tab ── */}
                    <TabsContent value="manage" className="space-y-6 mt-6">
                        {/* Create / Edit Form */}
                        <AnimatePresence>
                            {(showCreate || editingId) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <Card className="border-coral/30">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">
                                                    {editingId ? "Edit Category" : "New Category"}
                                                </CardTitle>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setShowCreate(false);
                                                        cancelEdit();
                                                    }}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Name *</Label>
                                                    <Input
                                                        placeholder="e.g., Fashion & Style"
                                                        value={form.name}
                                                        onChange={(e) =>
                                                            setForm({ ...form, name: e.target.value })
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Icon (Lucide name)</Label>
                                                    <Input
                                                        placeholder="e.g., Shirt"
                                                        value={form.icon}
                                                        onChange={(e) =>
                                                            setForm({ ...form, icon: e.target.value })
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                    placeholder="Brief description of this category"
                                                    rows={2}
                                                    value={form.description}
                                                    onChange={(e) =>
                                                        setForm({ ...form, description: e.target.value })
                                                    }
                                                />
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Display Order</Label>
                                                    <Input
                                                        type="number"
                                                        value={form.display_order}
                                                        onChange={(e) =>
                                                            setForm({
                                                                ...form,
                                                                display_order: parseInt(e.target.value) || 0,
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Status</Label>
                                                    <div
                                                        className="flex items-center gap-3 cursor-pointer mt-1"
                                                        onClick={() =>
                                                            setForm({ ...form, is_active: !form.is_active })
                                                        }
                                                    >
                                                        {form.is_active ? (
                                                            <ToggleRight className="w-7 h-7 text-green-600" />
                                                        ) : (
                                                            <ToggleLeft className="w-7 h-7 text-muted-foreground" />
                                                        )}
                                                        <span className="text-sm">
                                                            {form.is_active ? "Active" : "Inactive"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="coral"
                                                onClick={handleSave}
                                                disabled={
                                                    createMutation.isPending || updateMutation.isPending
                                                }
                                            >
                                                {(createMutation.isPending ||
                                                    updateMutation.isPending) && (
                                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                    )}
                                                <Save className="w-4 h-4 mr-2" />
                                                {editingId ? "Update Category" : "Create Category"}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Search */}
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Category List */}
                        <div className="space-y-3">
                            {filtered.map((cat, index) => {
                                const catStats = statsMap.get(cat.id);
                                return (
                                    <motion.div
                                        key={cat.id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                    >
                                        <Card
                                            className={`${!cat.is_active ? "opacity-60" : ""
                                                } hover:shadow-sm transition-shadow`}
                                        >
                                            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div
                                                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cat.is_active
                                                                ? "bg-coral/10 text-coral"
                                                                : "bg-muted text-muted-foreground"
                                                            }`}
                                                    >
                                                        <Tag className="w-5 h-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold truncate">
                                                                {cat.name}
                                                            </h3>
                                                            {!cat.is_active && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    Inactive
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {cat.description || cat.slug}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Stats */}
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                                                    <span
                                                        className="flex items-center gap-1"
                                                        title="Campaigns using this category"
                                                    >
                                                        <Briefcase className="w-3.5 h-3.5" />
                                                        {catStats?.campaign_count ?? 0}
                                                    </span>
                                                    <span
                                                        className="flex items-center gap-1"
                                                        title="Influencers with this category"
                                                    >
                                                        <Users className="w-3.5 h-3.5" />
                                                        {catStats?.influencer_count ?? 0}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        #{cat.display_order}
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            toggleActiveMutation.mutate({
                                                                id: cat.id,
                                                                is_active: !cat.is_active,
                                                            })
                                                        }
                                                        title={
                                                            cat.is_active ? "Deactivate" : "Activate"
                                                        }
                                                    >
                                                        {cat.is_active ? (
                                                            <ToggleRight className="w-4 h-4 text-green-600" />
                                                        ) : (
                                                            <ToggleLeft className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => startEdit(cat)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    `Delete "${cat.name}"? This will remove it from all campaigns and influencers.`
                                                                )
                                                            ) {
                                                                deleteMutation.mutate(cat.id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}

                            {filtered.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Tag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No categories found.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* ── Stats Tab ── */}
                    <TabsContent value="stats" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-coral" />
                                    Category Usage
                                </CardTitle>
                                <CardDescription>
                                    How many campaigns and influencers use each category
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {stats.map((stat, i) => {
                                        const maxCount = Math.max(
                                            ...stats.map(
                                                (s) => s.campaign_count + s.influencer_count
                                            ),
                                            1
                                        );
                                        const total = stat.campaign_count + stat.influencer_count;
                                        const pct = Math.round((total / maxCount) * 100);

                                        return (
                                            <motion.div
                                                key={stat.category_id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                                className="space-y-2"
                                            >
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium">
                                                        {stat.category_name}
                                                    </span>
                                                    <div className="flex items-center gap-3 text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Briefcase className="w-3.5 h-3.5" />
                                                            {stat.campaign_count}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-3.5 h-3.5" />
                                                            {stat.influencer_count}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ delay: i * 0.04, duration: 0.6 }}
                                                        className="h-full bg-gradient-coral rounded-full"
                                                    />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    {stats.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No usage data yet.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default AdminCategories;
