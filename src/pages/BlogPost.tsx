import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, User, Eye, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlogPost } from "@/hooks/useSupabase";
import { defaultBlogPosts } from "./Blog";
import { supabase } from "@/lib/supabase";



const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [localViews, setLocalViews] = useState<number>(0);

  // Fetch from Supabase
  const { data: post, isLoading, refetch } = useBlogPost(slug || "");

  // Find fallback local data
  const fallbackPost = defaultBlogPosts.find((p) => p.slug === slug);

  const activePost = post || fallbackPost;

  // Increment and synchronize views count for local fallback posts
  useEffect(() => {
    if (!activePost) return;
    
    if (!post) {
      const storageKey = `fallback-blog-views-${activePost.slug}`;
      const savedViewsStr = localStorage.getItem(storageKey);
      const initialViews = savedViewsStr ? parseInt(savedViewsStr) : activePost.views;
      const newViews = initialViews + 1;
      localStorage.setItem(storageKey, newViews.toString());
      setLocalViews(newViews);
    }
  }, [post, activePost]);

  // Subscribe to realtime updates for this blog post in Supabase
  useEffect(() => {
    if (!slug || !post) return;

    const channel = supabase
      .channel(`blog-post-realtime-${slug}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "blog_posts",
          filter: `slug=eq.${slug}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [slug, post, refetch]);

  // Seeding check: if DB has no posts but a user exists, seed default posts in background
  useEffect(() => {
    async function checkAndSeed() {
      try {
        const { count, error } = await supabase
          .from("blog_posts")
          .select("id", { count: "exact", head: true });
        
        if (error) return;
        
        if (count === 0) {
          const { data: profiles, error: profileError } = await supabase
            .from("profiles")
            .select("id")
            .limit(1);
          
          if (profileError || !profiles || profiles.length === 0) {
            return;
          }
          
          const authorId = profiles[0].id;
          
          for (const p of defaultBlogPosts) {
            const { error: insertError } = await supabase
              .from("blog_posts")
              .insert({
                title: p.title,
                slug: p.slug,
                excerpt: p.excerpt,
                content: p.content,
                cover_image_url: p.cover_image_url,
                category: p.category,
                tags: p.tags,
                status: "published",
                views: p.views,
                author_id: authorId,
                published_at: p.published_at || new Date().toISOString()
              });
            if (insertError) {
              console.error("Failed to seed default post:", p.slug, insertError);
            }
          }
          console.log("Successfully seeded default blog posts to database.");
          refetch();
        }
      } catch (err) {
        console.error("Error checking and seeding:", err);
      }
    }
    checkAndSeed();
  }, [refetch]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-3xl animate-pulse">
          <div className="h-8 w-32 bg-muted/40 rounded mb-8" />
          <div className="h-12 w-full bg-muted/40 rounded mb-4" />
          <div className="h-6 w-3/4 bg-muted/40 rounded mb-6" />
          <div className="h-64 md:h-[400px] bg-muted/40 rounded-2xl mb-8" />
          <div className="space-y-4">
            <div className="h-6 w-full bg-muted/40 rounded" />
            <div className="h-6 w-5/6 bg-muted/40 rounded" />
            <div className="h-6 w-full bg-muted/40 rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!activePost) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center max-w-md">
          <h2 className="text-3xl font-heading font-bold mb-4">Article Not Found</h2>
          <p className="text-muted-foreground mb-8">
            The article you are looking for does not exist or has been removed.
          </p>
          <Link to="/blog">
            <Button variant="coral">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const getAuthorName = (post: any) => {
    if (post.author_name) return post.author_name;
    if (post.author && typeof post.author === "object" && post.author.full_name) {
      return post.author.full_name;
    }
    return "Staff Writer";
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    if (dateString.includes(",") && isNaN(Date.parse(dateString))) return dateString;
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getReadTime = (post: any) => {
    if (post.readTime) return post.readTime;
    if (!post.content) return "5 min read";
    const words = post.content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  return (
    <Layout>
      <article className="py-12 md:py-20 bg-card">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Back to Blog */}
          <Link
            to="/blog"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-coral transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-coral/10 text-coral text-xs font-semibold uppercase tracking-wider rounded-full">
                {activePost.category}
              </span>
              {(post ? post.views : localViews) > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-3.5 h-3.5" />
                  {post ? post.views : localViews} views
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold leading-tight mb-6">
              {activePost.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-y border-border py-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-coral/10 flex items-center justify-center font-heading font-semibold text-coral text-xs">
                  {getAuthorName(activePost).split(" ").map(n => n[0]).join("")}
                </div>
                <span className="font-medium text-foreground">{getAuthorName(activePost)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(activePost.published_at || activePost.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{getReadTime(activePost)}</span>
              </div>
            </div>
          </header>

          {/* Cover Image */}
          {activePost.cover_image_url && (
            <div className="rounded-2xl overflow-hidden shadow-card mb-12 aspect-[21/9]">
              <img
                src={activePost.cover_image_url}
                alt={activePost.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-slate dark:prose-invert lg:prose-lg max-w-none mb-12">
            {activePost.content?.split("\n\n").map((paragraph, index) => {
              if (paragraph.startsWith("### ")) {
                return (
                  <h3 key={index} className="text-xl md:text-2xl font-heading font-bold mt-8 mb-4">
                    {paragraph.replace("### ", "")}
                  </h3>
                );
              }
              if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                return (
                  <p key={index} className="font-semibold text-foreground">
                    {paragraph.replace(/\*\*/g, "")}
                  </p>
                );
              }
              if (paragraph.startsWith("* ")) {
                return (
                  <ul key={index} className="list-disc pl-6 space-y-2 my-4">
                    {paragraph.split("\n").map((li, idx) => (
                      <li key={idx}>{li.replace("* ", "")}</li>
                    ))}
                  </ul>
                );
              }
              if (paragraph.startsWith("1. ")) {
                return (
                  <ol key={index} className="list-decimal pl-6 space-y-2 my-4">
                    {paragraph.split("\n").map((li, idx) => (
                      <li key={idx}>{li.replace(/^\d+\.\s+/, "")}</li>
                    ))}
                  </ol>
                );
              }
              return (
                <p key={index} className="text-muted-foreground leading-relaxed mb-6">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Footer Tags */}
          {activePost.tags && activePost.tags.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 pt-6 border-t border-border">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground mr-2">
                <Tag className="w-4 h-4" />
                Tags:
              </span>
              {activePost.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Layout>
  );
};

export default BlogPostPage;
