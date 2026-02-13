import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Edit, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

const initialBlogPosts = [
  {
    id: 1,
    title: "Micro-Influencer Rate Guide 2024",
    excerpt: "Learn how to price your content and negotiate fair rates with brands.",
    category: "Guides",
    date: "Jan 15, 2024",
  },
  {
    id: 2,
    title: "How to Pitch Brands as a Small Creator",
    excerpt: "Step-by-step guide to crafting the perfect brand pitch.",
    category: "Tips",
    date: "Jan 10, 2024",
  },
  {
    id: 3,
    title: "Why Engagement Rate Matters More Than Followers",
    excerpt: "Understanding the metrics that brands actually care about.",
    category: "Insights",
    date: "Jan 5, 2024",
  },
];

const ContentManagement = () => {
  const [blogPosts, setBlogPosts] = useState(initialBlogPosts);
  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [newPost, setNewPost] = useState({ title: "", excerpt: "", category: "" });

  const [aboutContent, setAboutContent] = useState({
    founderStory: "Our founder started MicroMatch with a simple mission: to help small creators get the brand deals they deserve. After years of seeing talented creators overlooked in favour of mega-influencers, we built a platform that puts authenticity and engagement first.",
    mission: "Fair pay and meaningful brand partnerships for every creator. We believe in the power of authentic engagement over follower count.",
    vision: "To become East Africa's leading micro-influencer marketing agency, empowering creators to build sustainable careers from their passion.",
  });

  const handleDeletePost = (id: number) => {
    setBlogPosts(blogPosts.filter((p) => p.id !== id));
    toast.success("Blog post deleted");
  };

  const handleAddPost = () => {
    if (!newPost.title || !newPost.excerpt) {
      toast.error("Please fill in title and excerpt");
      return;
    }
    setBlogPosts([
      ...blogPosts,
      {
        id: Date.now(),
        title: newPost.title,
        excerpt: newPost.excerpt,
        category: newPost.category || "General",
        date: new Date().toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" }),
      },
    ]);
    setNewPost({ title: "", excerpt: "", category: "" });
    toast.success("Blog post added");
  };

  const handleSaveAbout = () => {
    toast.success("About page content saved");
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Content Management</h1>
          <p className="text-muted-foreground">Manage blog posts and about page content.</p>
        </div>

        <Tabs defaultValue="blog">
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
                            {post.category} • {post.date}
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
