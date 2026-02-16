import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Edit, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { blogService, settingsService } from "@/services/api";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const ContentManagement = () => {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState({ title: "", excerpt: "", category: "General" });
  const [activeTab, setActiveTab] = useState("blog");

  // Blog Posts Query
  const { data: rawBlogPosts, isLoading: isLoadingBlog, refetch: refetchBlog } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => blogService.getPosts(),
  });

  const blogPosts = rawBlogPosts?.data || [];

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

    return () => {
      supabase.removeChannel(blogChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, [refetchBlog, refetchStory, refetchMission, refetchVision]);


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
        status: 'published', // Default to published for simplicity
        tags: [],
        content: newPost.excerpt, // Using excerpt as content for now
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

  if (isLoadingBlog) {
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
          <p className="text-muted-foreground">Manage blog posts and about page content.</p>
        </div>

        <Tabs defaultValue="blog" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="blog">Blog Posts</TabsTrigger>
            <TabsTrigger value="about">About Page</TabsTrigger>
          </TabsList>

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
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ContentManagement;
