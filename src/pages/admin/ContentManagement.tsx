import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  FileText, Plus, Edit, Trash2, Save, Loader2,
  Star, Eye, EyeOff, Quote, X, Check, Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { blogService, settingsService, testimonialService, successStoryService } from "@/services/api";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import type { Testimonial, TestimonialInsert, TestimonialUpdate, SuccessStory, SuccessStoryInsert, SuccessStoryUpdate } from "@/types/database.types";
import { useQueryClient } from "@tanstack/react-query";

// ────────────────────────────────────────────────────────
// Testimonial Form Component
// ────────────────────────────────────────────────────────

interface TestimonialFormData {
  author_name: string;
  author_role: string;
  author_company: string;
  author_image_url: string;
  content: string;
  rating: number;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
}

const emptyTestimonialForm: TestimonialFormData = {
  author_name: "",
  author_role: "",
  author_company: "",
  author_image_url: "",
  content: "",
  rating: 5,
  is_featured: false,
  is_published: true,
  display_order: 0,
};

interface TestimonialFormProps {
  initialData?: TestimonialFormData;
  onSubmit: (data: TestimonialFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
}

const TestimonialForm = ({
  initialData = emptyTestimonialForm,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
}: TestimonialFormProps) => {
  const [formData, setFormData] = useState<TestimonialFormData>(initialData);

  // Sync form data when initialData changes (e.g. switching between edit targets)
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.author_name || !formData.content) {
      toast.error("Author name and testimonial content are required.");
      return;
    }
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="author_name">Author Name *</Label>
          <Input
            id="author_name"
            placeholder="e.g. Sarah Chen"
            value={formData.author_name}
            onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="author_role">Role / Title</Label>
          <Input
            id="author_role"
            placeholder="e.g. Lifestyle Creator"
            value={formData.author_role}
            onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="author_company">Company</Label>
          <Input
            id="author_company"
            placeholder="e.g. TechStyle Inc."
            value={formData.author_company}
            onChange={(e) => setFormData({ ...formData, author_company: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="author_image_url">Author Image URL</Label>
          <Input
            id="author_image_url"
            placeholder="https://example.com/photo.jpg"
            value={formData.author_image_url}
            onChange={(e) => setFormData({ ...formData, author_image_url: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Testimonial Content *</Label>
        <Textarea
          id="content"
          rows={4}
          placeholder="What did this person say about MicroMatch..."
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Rating</Label>
          <div className="flex gap-1 items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                className="p-0.5 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-6 h-6 ${star <= formData.rating
                    ? "fill-coral text-coral"
                    : "text-muted-foreground/30"
                    }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            min={0}
            placeholder="0"
            value={formData.display_order}
            onChange={(e) =>
              setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Visibility</Label>
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) =>
                  setFormData({ ...formData, is_published: e.target.checked })
                }
                className="rounded border-border"
              />
              <span className="text-sm">Published</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) =>
                  setFormData({ ...formData, is_featured: e.target.checked })
                }
                className="rounded border-border"
              />
              <span className="text-sm">Featured</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" variant="coral" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {submitLabel}
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

// ────────────────────────────────────────────────────────
// Main Content Management
// ────────────────────────────────────────────────────────

const ContentManagement = () => {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState({ title: "", excerpt: "", category: "General" });
  const [activeTab, setActiveTab] = useState("blog");

  // Testimonial state
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isSubmittingTestimonial, setIsSubmittingTestimonial] = useState(false);

  // Success Stories state
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);
  const [storyForm, setStoryForm] = useState({
    brand_name: "",
    industry: "",
    result: "",
    description: "",
    stat_influencers: 0,
    stat_reach: "0",
    stat_engagement: "0%",
    cover_image_url: "",
    is_published: true,
    is_featured: false,
    display_order: 0,
  });

  // Blog Posts Query
  const { data: rawBlogPosts, isLoading: isLoadingBlog, refetch: refetchBlog } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => blogService.getPosts(),
  });

  const blogPosts = rawBlogPosts?.data || [];

  // Testimonials Query (all, not just published, for admin)
  const { data: testimonials = [], isLoading: isLoadingTestimonials, refetch: refetchTestimonials } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => testimonialService.getTestimonials(false),
  });

  // Success Stories Query (all, including unpublished, for admin)
  const { data: successStories = [], isLoading: isLoadingStories, refetch: refetchStories } = useQuery({
    queryKey: ['admin-success-stories'],
    queryFn: () => successStoryService.getSuccessStories(false),
  });

  // About Content Query
  const { data: founderStory, refetch: refetchStory } = useQuery({
    queryKey: ['setting', 'founder_story'],
    queryFn: () => settingsService.getSetting('founder_story')
  });
  const { data: mission, refetch: refetchMission } = useQuery({
    queryKey: ['setting', 'mission'],
    queryFn: () => settingsService.getSetting('mission')
  });
  const { data: vision, refetch: refetchVision } = useQuery({
    queryKey: ['setting', 'vision'],
    queryFn: () => settingsService.getSetting('vision')
  });

  const [aboutContent, setAboutContent] = useState({
    founderStory: "",
    mission: "",
    vision: "",
  });

  // Sync state with fetched settings
  useEffect(() => {
    if (founderStory !== undefined) setAboutContent(prev => ({ ...prev, founderStory: founderStory || "" }));
    if (mission !== undefined) setAboutContent(prev => ({ ...prev, mission: mission || "" }));
    if (vision !== undefined) setAboutContent(prev => ({ ...prev, vision: vision || "" }));
  }, [founderStory, mission, vision]);

  // Real-time subscriptions
  useEffect(() => {
    const blogChannel = supabase
      .channel('admin-blog-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blog_posts' },
        () => refetchBlog()
      )
      .subscribe();

    const settingsChannel = supabase
      .channel('admin-settings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'platform_settings' },
        () => {
          refetchStory();
          refetchMission();
          refetchVision();
        }
      )
      .subscribe();

    const testimonialChannel = supabase
      .channel('admin-testimonial-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'testimonials' },
        () => refetchTestimonials()
      )
      .subscribe();

    const storiesChannel = supabase
      .channel('admin-stories-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'success_stories' },
        () => refetchStories()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(blogChannel);
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(testimonialChannel);
      supabase.removeChannel(storiesChannel);
    };
  }, [refetchBlog, refetchStory, refetchMission, refetchVision, refetchTestimonials, refetchStories]);

  // ──── Blog Handlers ────

  const handleDeletePost = async (id: string) => {
    try {
      await blogService.deletePost(id);
      toast.success("Blog post deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete post");
    }
  };

  const handleAddPost = async () => {
    if (!newPost.title || !newPost.excerpt || !user) {
      toast.error("Please fill in title and excerpt");
      return;
    }

    try {
      await blogService.createPost({
        title: newPost.title,
        excerpt: newPost.excerpt,
        category: newPost.category,
        author_id: user.id,
        status: 'published',
        tags: [],
        content: newPost.excerpt,
        cover_image_url: null,
        published_at: new Date().toISOString()
      });

      setNewPost({ title: "", excerpt: "", category: "General" });
      toast.success("Blog post added");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create post");
    }
  };

  // ──── About Handlers ────

  const handleSaveAbout = async () => {
    if (!user) return;
    try {
      await Promise.all([
        settingsService.updateSetting('founder_story', aboutContent.founderStory, user.id),
        settingsService.updateSetting('mission', aboutContent.mission, user.id),
        settingsService.updateSetting('vision', aboutContent.vision, user.id),
      ]);
      toast.success("About page content saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings");
    }
  };

  // ──── Testimonial Handlers ────

  const handleCreateTestimonial = async (data: TestimonialFormData) => {
    setIsSubmittingTestimonial(true);
    try {
      const insert: TestimonialInsert = {
        author_name: data.author_name,
        author_role: data.author_role || null,
        author_company: data.author_company || null,
        author_image_url: data.author_image_url || null,
        content: data.content,
        rating: data.rating || null,
        is_featured: data.is_featured,
        is_published: data.is_published,
        display_order: data.display_order,
      };
      await testimonialService.createTestimonial(insert);
      toast.success("Testimonial created");
      setShowTestimonialForm(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create testimonial");
    } finally {
      setIsSubmittingTestimonial(false);
    }
  };

  const handleUpdateTestimonial = async (data: TestimonialFormData) => {
    if (!editingTestimonial) return;
    setIsSubmittingTestimonial(true);
    try {
      const updates: TestimonialUpdate = {
        author_name: data.author_name,
        author_role: data.author_role || null,
        author_company: data.author_company || null,
        author_image_url: data.author_image_url || null,
        content: data.content,
        rating: data.rating || null,
        is_featured: data.is_featured,
        is_published: data.is_published,
        display_order: data.display_order,
      };
      await testimonialService.updateTestimonial(editingTestimonial.id, updates);
      toast.success("Testimonial updated");
      setEditingTestimonial(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update testimonial");
    } finally {
      setIsSubmittingTestimonial(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    try {
      await testimonialService.deleteTestimonial(id);
      toast.success("Testimonial deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete testimonial");
    }
  };

  const handleTogglePublish = async (testimonial: Testimonial) => {
    try {
      await testimonialService.updateTestimonial(testimonial.id, {
        is_published: !testimonial.is_published,
      });
      toast.success(
        testimonial.is_published ? "Testimonial unpublished" : "Testimonial published"
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to update testimonial");
    }
  };

  const openEditForm = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setShowTestimonialForm(false);
  };

  // ──── Success Story Handlers ────

  const resetStoryForm = () => {
    setStoryForm({
      brand_name: "",
      industry: "",
      result: "",
      description: "",
      stat_influencers: 0,
      stat_reach: "0",
      stat_engagement: "0%",
      cover_image_url: "",
      is_published: true,
      is_featured: false,
      display_order: 0,
    });
  };

  const handleCreateStory = async () => {
    if (!storyForm.brand_name || !storyForm.result || !storyForm.description) {
      toast.error("Brand name, result, and description are required.");
      return;
    }
    setIsSubmittingStory(true);
    try {
      const insert: SuccessStoryInsert = {
        brand_name: storyForm.brand_name,
        industry: storyForm.industry,
        result: storyForm.result,
        description: storyForm.description,
        stat_influencers: storyForm.stat_influencers,
        stat_reach: storyForm.stat_reach,
        stat_engagement: storyForm.stat_engagement,
        cover_image_url: storyForm.cover_image_url || null,
        is_published: storyForm.is_published,
        is_featured: storyForm.is_featured,
        display_order: storyForm.display_order,
      };
      await successStoryService.createSuccessStory(insert);
      toast.success("Success story created");
      setShowStoryForm(false);
      resetStoryForm();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create success story");
    } finally {
      setIsSubmittingStory(false);
    }
  };

  const handleUpdateStory = async () => {
    if (!editingStory) return;
    if (!storyForm.brand_name || !storyForm.result || !storyForm.description) {
      toast.error("Brand name, result, and description are required.");
      return;
    }
    setIsSubmittingStory(true);
    try {
      const updates: SuccessStoryUpdate = {
        brand_name: storyForm.brand_name,
        industry: storyForm.industry,
        result: storyForm.result,
        description: storyForm.description,
        stat_influencers: storyForm.stat_influencers,
        stat_reach: storyForm.stat_reach,
        stat_engagement: storyForm.stat_engagement,
        cover_image_url: storyForm.cover_image_url || null,
        is_published: storyForm.is_published,
        is_featured: storyForm.is_featured,
        display_order: storyForm.display_order,
      };
      await successStoryService.updateSuccessStory(editingStory.id, updates);
      toast.success("Success story updated");
      setEditingStory(null);
      resetStoryForm();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update success story");
    } finally {
      setIsSubmittingStory(false);
    }
  };

  const handleDeleteStory = async (id: string) => {
    try {
      await successStoryService.deleteSuccessStory(id);
      toast.success("Success story deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete success story");
    }
  };

  const handleToggleStoryPublish = async (story: SuccessStory) => {
    try {
      await successStoryService.updateSuccessStory(story.id, {
        is_published: !story.is_published,
      });
      toast.success(story.is_published ? "Story unpublished" : "Story published");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update story");
    }
  };

  const openStoryEditForm = (story: SuccessStory) => {
    setEditingStory(story);
    setStoryForm({
      brand_name: story.brand_name,
      industry: story.industry,
      result: story.result,
      description: story.description,
      stat_influencers: story.stat_influencers,
      stat_reach: story.stat_reach,
      stat_engagement: story.stat_engagement,
      cover_image_url: story.cover_image_url || "",
      is_published: story.is_published,
      is_featured: story.is_featured,
      display_order: story.display_order,
    });
    setShowStoryForm(false);
  };

  // ──── Loading ────

  if (isLoadingBlog && isLoadingTestimonials && isLoadingStories) {
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
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Content Management</h1>
          <p className="text-muted-foreground">Manage blog posts, testimonials, success stories, and about page content.</p>
        </div>

        <Tabs defaultValue="blog" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="blog">Blog Posts</TabsTrigger>
            <TabsTrigger value="testimonials">
              Testimonials
              {testimonials.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {testimonials.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="stories">
              Success Stories
              {successStories.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {successStories.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="about">About Page</TabsTrigger>
          </TabsList>

          {/* ══════════════════════════════════════════════
              Blog Posts Tab
          ══════════════════════════════════════════════ */}
          <TabsContent value="blog" className="space-y-6 mt-6">
            {/* Add New Post */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Post
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Post title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
                <Textarea
                  placeholder="Post excerpt / summary"
                  value={newPost.excerpt}
                  onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                />
                <Input
                  placeholder="Category (e.g. Guides, Tips, Insights)"
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                />
                <Button variant="coral" onClick={handleAddPost}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Post
                </Button>
              </CardContent>
            </Card>

            {/* Existing Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Existing Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-coral" />
                        </div>
                        <div>
                          <p className="font-medium">{post.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {post.category} • {post.created_at ? format(new Date(post.created_at), 'MMM d, yyyy') : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeletePost(post.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {blogPosts.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">No blog posts found.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════
              Testimonials Tab
          ══════════════════════════════════════════════ */}
          <TabsContent value="testimonials" className="space-y-6 mt-6">
            {/* Add / Edit Form */}
            <AnimatePresence mode="wait">
              {(showTestimonialForm || editingTestimonial) && (
                <motion.div
                  key={editingTestimonial ? `edit-${editingTestimonial.id}` : "create"}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {editingTestimonial ? (
                          <><Edit className="w-5 h-5" /> Edit Testimonial</>
                        ) : (
                          <><Plus className="w-5 h-5" /> Add New Testimonial</>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TestimonialForm
                        initialData={
                          editingTestimonial
                            ? {
                              author_name: editingTestimonial.author_name,
                              author_role: editingTestimonial.author_role || "",
                              author_company: editingTestimonial.author_company || "",
                              author_image_url: editingTestimonial.author_image_url || "",
                              content: editingTestimonial.content,
                              rating: editingTestimonial.rating || 5,
                              is_featured: editingTestimonial.is_featured,
                              is_published: editingTestimonial.is_published,
                              display_order: editingTestimonial.display_order,
                            }
                            : emptyTestimonialForm
                        }
                        onSubmit={editingTestimonial ? handleUpdateTestimonial : handleCreateTestimonial}
                        onCancel={() => {
                          setShowTestimonialForm(false);
                          setEditingTestimonial(null);
                        }}
                        isSubmitting={isSubmittingTestimonial}
                        submitLabel={editingTestimonial ? "Update Testimonial" : "Create Testimonial"}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header with Add Button */}
            {!showTestimonialForm && !editingTestimonial && (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    All Testimonials ({testimonials.length})
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Manage what your users see on the testimonials section.
                  </p>
                </div>
                <Button variant="coral" onClick={() => setShowTestimonialForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Testimonial
                </Button>
              </div>
            )}

            {/* Testimonials List */}
            {isLoadingTestimonials ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-coral" />
              </div>
            ) : testimonials.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Quote className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No testimonials yet. Add your first one to showcase on the homepage!
                  </p>
                  {!showTestimonialForm && (
                    <Button variant="coral" onClick={() => setShowTestimonialForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Testimonial
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {testimonials.map((testimonial) => (
                  <motion.div
                    key={testimonial.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <Card className={`transition-all ${!testimonial.is_published ? "opacity-60 border-dashed" : ""
                      }`}>
                      <CardContent className="p-5">
                        <div className="flex gap-4">
                          {/* Author Avatar */}
                          <div className="flex-shrink-0">
                            {testimonial.author_image_url ? (
                              <img
                                src={testimonial.author_image_url}
                                alt={testimonial.author_name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center">
                                <span className="font-semibold text-coral text-sm">
                                  {testimonial.author_name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold">{testimonial.author_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {testimonial.author_role}
                                  {testimonial.author_company && ` • ${testimonial.author_company}`}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {testimonial.is_featured && (
                                  <Badge variant="default" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                                    Featured
                                  </Badge>
                                )}
                                <Badge
                                  variant={testimonial.is_published ? "default" : "secondary"}
                                  className={`text-xs ${testimonial.is_published
                                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                                    : ""
                                    }`}
                                >
                                  {testimonial.is_published ? "Published" : "Draft"}
                                </Badge>
                              </div>
                            </div>

                            {/* Rating */}
                            {testimonial.rating && testimonial.rating > 0 && (
                              <div className="flex gap-0.5 my-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${i < testimonial.rating!
                                      ? "fill-coral text-coral"
                                      : "text-muted-foreground/20"
                                      }`}
                                  />
                                ))}
                              </div>
                            )}

                            {/* Quote */}
                            <p className="text-sm text-foreground/80 mt-1 line-clamp-3">
                              "{testimonial.content}"
                            </p>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTogglePublish(testimonial)}
                                className="text-xs h-8"
                              >
                                {testimonial.is_published ? (
                                  <><EyeOff className="w-3.5 h-3.5 mr-1.5" /> Unpublish</>
                                ) : (
                                  <><Eye className="w-3.5 h-3.5 mr-1.5" /> Publish</>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditForm(testimonial)}
                                className="text-xs h-8"
                              >
                                <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the testimonial from{" "}
                                      <strong>{testimonial.author_name}</strong>. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteTestimonial(testimonial.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <span className="ml-auto text-xs text-muted-foreground">
                                Order: {testimonial.display_order}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ══════════════════════════════════════════════
              About Page Tab
          ══════════════════════════════════════════════ */}
          <TabsContent value="about" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Founder Story</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={5}
                  value={aboutContent.founderStory}
                  onChange={(e) => setAboutContent({ ...aboutContent, founderStory: e.target.value })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mission Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={3}
                  value={aboutContent.mission}
                  onChange={(e) => setAboutContent({ ...aboutContent, mission: e.target.value })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={3}
                  value={aboutContent.vision}
                  onChange={(e) => setAboutContent({ ...aboutContent, vision: e.target.value })}
                />
              </CardContent>
            </Card>

            <Button variant="coral" onClick={handleSaveAbout}>
              <Save className="w-4 h-4 mr-2" />
              Save About Page Content
            </Button>
          </TabsContent>

          {/* ══════════════════════════════════════════════
              Success Stories Tab
          ══════════════════════════════════════════════ */}
          <TabsContent value="stories" className="space-y-6 mt-6">
            {/* Create / Edit Form */}
            <AnimatePresence>
              {(showStoryForm || editingStory) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {editingStory ? (
                          <><Edit className="w-5 h-5" /> Edit Success Story</>
                        ) : (
                          <><Plus className="w-5 h-5" /> New Success Story</>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Brand Name *</Label>
                          <Input
                            placeholder="e.g. Organic Skincare Co."
                            value={storyForm.brand_name}
                            onChange={(e) => setStoryForm({ ...storyForm, brand_name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Industry *</Label>
                          <Input
                            placeholder="e.g. Beauty, Tech, Health"
                            value={storyForm.industry}
                            onChange={(e) => setStoryForm({ ...storyForm, industry: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Key Result *</Label>
                        <Input
                          placeholder="e.g. 312% increase in website traffic"
                          value={storyForm.result}
                          onChange={(e) => setStoryForm({ ...storyForm, result: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description *</Label>
                        <Textarea
                          rows={3}
                          placeholder="Describe the campaign and its success..."
                          value={storyForm.description}
                          onChange={(e) => setStoryForm({ ...storyForm, description: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Number of Influencers</Label>
                          <Input
                            type="number"
                            min="0"
                            value={storyForm.stat_influencers}
                            onChange={(e) => setStoryForm({ ...storyForm, stat_influencers: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Reach (e.g. 180K)</Label>
                          <Input
                            placeholder="180K"
                            value={storyForm.stat_reach}
                            onChange={(e) => setStoryForm({ ...storyForm, stat_reach: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Engagement Rate (e.g. 8.2%)</Label>
                          <Input
                            placeholder="8.2%"
                            value={storyForm.stat_engagement}
                            onChange={(e) => setStoryForm({ ...storyForm, stat_engagement: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Cover Image URL (optional)</Label>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            value={storyForm.cover_image_url}
                            onChange={(e) => setStoryForm({ ...storyForm, cover_image_url: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Display Order</Label>
                          <Input
                            type="number"
                            min="0"
                            value={storyForm.display_order}
                            onChange={(e) => setStoryForm({ ...storyForm, display_order: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded border-border"
                            checked={storyForm.is_published}
                            onChange={(e) => setStoryForm({ ...storyForm, is_published: e.target.checked })}
                          />
                          <span className="text-sm">Published</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded border-border"
                            checked={storyForm.is_featured}
                            onChange={(e) => setStoryForm({ ...storyForm, is_featured: e.target.checked })}
                          />
                          <span className="text-sm">Featured</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <Button
                          variant="coral"
                          disabled={isSubmittingStory}
                          onClick={editingStory ? handleUpdateStory : handleCreateStory}
                        >
                          {isSubmittingStory ? (
                            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
                          ) : (
                            <><Save className="w-4 h-4 mr-2" /> {editingStory ? "Update Story" : "Create Story"}</>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowStoryForm(false);
                            setEditingStory(null);
                            resetStoryForm();
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Add Button */}
            {!showStoryForm && !editingStory && (
              <Button variant="coral" onClick={() => { resetStoryForm(); setShowStoryForm(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Success Story
              </Button>
            )}

            {/* Stories List */}
            {isLoadingStories ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-coral" />
              </div>
            ) : successStories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No success stories yet. Add your first one above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {successStories.map((story, index) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className={!story.is_published ? "opacity-60" : ""}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-lg">{story.brand_name}</h3>
                              <Badge variant="outline" className="text-xs">{story.industry}</Badge>
                              {story.is_featured && (
                                <Badge className="bg-coral/10 text-coral border-coral/20 text-xs">Featured</Badge>
                              )}
                              {!story.is_published && (
                                <Badge variant="secondary" className="text-xs">Draft</Badge>
                              )}
                            </div>
                            <p className="text-coral font-medium">{story.result}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{story.description}</p>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>{story.stat_influencers} creators</span>
                              <span>{story.stat_reach} reach</span>
                              <span>{story.stat_engagement} engagement</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title={story.is_published ? "Unpublish" : "Publish"}
                              onClick={() => handleToggleStoryPublish(story)}
                            >
                              {story.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openStoryEditForm(story)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Success Story?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the success story for "{story.brand_name}". This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => handleDeleteStory(story.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ContentManagement;
