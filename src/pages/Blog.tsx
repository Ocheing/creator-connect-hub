import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { blogService } from "@/services/api";
import { supabase } from "@/lib/supabase";

export const defaultBlogPosts = [
  {
    id: "fb485dfb-2ee4-4c57-86f2-bf2336338b51",
    slug: "micro-influencer-rate-guide-2026",
    title: "Micro-Influencer Rate Guide 2026",
    excerpt: "Comprehensive guide to pricing your sponsored content. Learn how to charge what you're worth based on engagement, niche, and deliverables.",
    category: "Monetization",
    published_at: "2026-01-15T12:00:00Z",
    created_at: "2026-01-15T12:00:00Z",
    views: 124,
    tags: ["Pricing", "Negotiation", "Sponsorship"],
    status: "published",
    author_name: "Chris Gitonga",
    cover_image_url: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=400&fit=crop",
    featured: true,
    content: "Calculating your rate as a micro-influencer can be daunting. In this comprehensive guide for 2026, Chris Gitonga breaks down how to price your sponsored content. Learn how to charge what you're worth based on engagement, niche, and deliverables..."
  },
  {
    id: "fb485dfb-2ee4-4c57-86f2-bf2336338b52",
    slug: "how-to-pitch-brands-small-creator",
    title: "How to Pitch Brands as a Small Creator",
    excerpt: "Stop waiting for brands to find you. Learn proven outreach strategies that actually get responses from marketing managers.",
    category: "Strategies",
    published_at: "2026-01-10T12:00:00Z",
    created_at: "2026-01-10T12:00:00Z",
    views: 89,
    tags: ["Outreach", "Pitching", "Brands"],
    status: "published",
    author_name: "Chris Gitonga",
    cover_image_url: "https://images.unsplash.com/photo-1552581234-26160f608093?w=800&h=400&fit=crop",
    featured: false,
    content: "Outreach is key to securing sponsorships. Stop waiting for brands to find you. Learn proven outreach strategies that actually get responses from marketing managers..."
  },
  {
    id: "fb485dfb-2ee4-4c57-86f2-bf2336338b53",
    slug: "engagement-rate-matters-more",
    title: "Why Engagement Rate Matters More Than Followers",
    excerpt: "The data is clear: brands are prioritizing engagement over follower count. Here's why micro-influencers are winning.",
    category: "Insights",
    published_at: "2026-01-05T12:00:00Z",
    created_at: "2026-01-05T12:00:00Z",
    views: 245,
    tags: ["Analytics", "Engagement", "Followers"],
    status: "published",
    author_name: "Chris Gitonga",
    cover_image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    featured: false,
    content: "Follower counts can be vanity metrics. The data is clear: brands are prioritizing engagement over follower count. Here's why micro-influencers are winning..."
  },
  {
    id: "fb485dfb-2ee4-4c57-86f2-bf2336338b54",
    slug: "negotiate-brand-deal-contract",
    title: "How to Negotiate Your First Brand Deal Contract",
    excerpt: "Don't sign that contract yet! Learn the key terms to look for and how to negotiate better terms as a creator.",
    category: "Monetization",
    published_at: "2025-12-28T12:00:00Z",
    created_at: "2025-12-28T12:00:00Z",
    views: 312,
    tags: ["Negotiation", "Contracts", "Legal"],
    status: "published",
    author_name: "Chris Gitonga",
    cover_image_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=400&fit=crop",
    featured: false,
    content: "Contracts are legal agreements that define your work. Don't sign that contract yet! Learn the key terms to look for and how to negotiate better terms as a creator..."
  },
  {
    id: "fb485dfb-2ee4-4c57-86f2-bf2336338b55",
    slug: "content-calendar-template",
    title: "Free Content Calendar Template for Creators",
    excerpt: "Stay consistent and organized with our free content calendar template. Download and start planning your content today.",
    category: "Resources",
    published_at: "2025-12-20T12:00:00Z",
    created_at: "2025-12-20T12:00:00Z",
    views: 189,
    tags: ["Organization", "Productivity", "Template"],
    status: "published",
    author_name: "Chris Gitonga",
    cover_image_url: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=400&fit=crop",
    featured: false,
    content: "Consistency is crucial for growing your platform. Stay consistent and organized with our free content calendar template. Download and start planning your content today..."
  },
  {
    id: "fb485dfb-2ee4-4c57-86f2-bf2336338b56",
    slug: "grow-instagram-organically-2026",
    title: "How to Grow Your Instagram Organically in 2026",
    excerpt: "Forget buying followers. These proven strategies will help you build a genuine, engaged audience on Instagram.",
    category: "Growth",
    published_at: "2025-12-15T12:00:00Z",
    created_at: "2025-12-15T12:00:00Z",
    views: 412,
    tags: ["Instagram", "Growth", "Organic"],
    status: "published",
    author_name: "Chris Gitonga",
    cover_image_url: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=400&fit=crop",
    featured: false,
    content: "Growing an audience requires strategic effort. Forget buying followers. These proven strategies will help you build a genuine, engaged audience on Instagram..."
  },
];

const categories = ["All", "Growth", "Monetization", "Strategies", "Insights", "Resources"];

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  // Fetch all posts first to check if DB is empty
  const { data: allPostsResponse, refetch: refetchAll } = useQuery({
    queryKey: ["all-blog-posts-check"],
    queryFn: () => blogService.getPosts({ status: "published" }),
    staleTime: 5 * 60 * 1000,
  });

  const isDbEmpty = !allPostsResponse || allPostsResponse.count === 0;

  // Fetch actual filtered posts if DB is not empty
  const { data: filteredResponse, isLoading, refetch: refetchFiltered } = useQuery({
    queryKey: ["blog-posts", activeCategory],
    queryFn: async () => {
      if (isDbEmpty) {
        return { data: [], count: 0 };
      }
      const filters: any = { status: "published" };
      if (activeCategory !== "All") {
        filters.category = activeCategory;
      }
      return await blogService.getPosts(filters);
    },
    enabled: allPostsResponse !== undefined,
    staleTime: 5 * 60 * 1000,
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("blog-posts-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blog_posts" },
        () => {
          refetchAll();
          refetchFiltered();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchAll, refetchFiltered]);

  // Seeding check: if DB is empty but profiles exist, seed default blog posts
  useEffect(() => {
    async function checkAndSeed() {
      try {
        if (!allPostsResponse || allPostsResponse.count > 0) return;

        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .limit(1);
        
        if (profileError || !profiles || profiles.length === 0) {
          return;
        }
        
        const authorId = profiles[0].id;
        
        for (const post of defaultBlogPosts) {
          const { error: insertError } = await supabase
            .from("blog_posts")
            .insert({
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
              content: post.content,
              cover_image_url: post.cover_image_url,
              category: post.category,
              tags: post.tags,
              status: "published",
              views: post.views,
              author_id: authorId,
              published_at: post.published_at || new Date().toISOString()
            });
          if (insertError) {
            console.error("Failed to seed default post:", post.slug, insertError);
          }
        }
        console.log("Successfully seeded default blog posts to database.");
        refetchAll();
        refetchFiltered();
      } catch (err) {
        console.error("Error checking and seeding:", err);
      }
    }
    checkAndSeed();
  }, [allPostsResponse, refetchAll, refetchFiltered]);

  // Determine which posts to render
  let postsToRender = [];
  if (isDbEmpty) {
    // If DB is empty, filter our mock posts in frontend
    postsToRender = activeCategory === "All"
      ? defaultBlogPosts
      : defaultBlogPosts.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
  } else {
    postsToRender = filteredResponse?.data || [];
  }

  // Ensure first post is featured, or whichever is marked featured
  const featuredPost = postsToRender.find(p => p.featured) || postsToRender[0];
  const regularPosts = postsToRender.filter(p => p.id !== featuredPost?.id);

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
        month: "short",
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
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-coral font-medium text-sm uppercase tracking-wider">
              Blog & Resources
            </span>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mt-3 mb-6">
              Creator Economy Insights
            </h1>
            <p className="text-xl text-muted-foreground">
              Tips, strategies, and resources to help you grow your influence and land more brand deals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid lg:grid-cols-2 gap-8 items-center animate-pulse">
              <div className="h-64 lg:h-80 bg-muted/40 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-6 w-24 bg-muted/40 rounded-full" />
                <div className="h-10 w-3/4 bg-muted/40 rounded" />
                <div className="h-6 w-full bg-muted/40 rounded" />
                <div className="h-6 w-5/6 bg-muted/40 rounded" />
                <div className="flex gap-4 pt-4">
                  <div className="h-6 w-20 bg-muted/40 rounded" />
                  <div className="h-6 w-20 bg-muted/40 rounded" />
                  <div className="h-6 w-20 bg-muted/40 rounded" />
                </div>
              </div>
            </div>
          ) : featuredPost ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid lg:grid-cols-2 gap-8 items-center"
            >
              <div className="rounded-2xl overflow-hidden aspect-video lg:aspect-auto lg:h-80">
                <img
                  src={featuredPost.cover_image_url}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-coral/10 text-coral text-sm font-medium rounded-full">
                    Featured
                  </span>
                  <span className="px-3 py-1 bg-muted text-muted-foreground text-sm font-medium rounded-full">
                    {featuredPost.category}
                  </span>
                </div>
                <h2 className="text-3xl font-heading font-bold mb-4 hover:text-coral transition-colors">
                  <Link to={`/blog/${featuredPost.slug}`}>
                    {featuredPost.title}
                  </Link>
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  {featuredPost.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {getAuthorName(featuredPost)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(featuredPost.published_at || featuredPost.created_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {getReadTime(featuredPost)}
                  </div>
                </div>
                <Link to={`/blog/${featuredPost.slug}`}>
                  <Button variant="coral">
                    Read Article
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No featured posts found.
            </div>
          )}
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse shadow-sm">
                  <div className="aspect-video bg-muted/40" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 w-24 bg-muted/40 rounded-full" />
                    <div className="h-8 w-3/4 bg-muted/40 rounded" />
                    <div className="h-4 w-full bg-muted/40 rounded" />
                    <div className="h-4 w-5/6 bg-muted/40 rounded" />
                    <div className="flex justify-between pt-4 border-t border-border">
                      <div className="h-5 w-24 bg-muted/40 rounded" />
                      <div className="h-5 w-24 bg-muted/40 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : regularPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post, index) => (
                <motion.article
                  key={post.id || post.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-card transition-shadow flex flex-col h-full"
                >
                  <Link to={`/blog/${post.slug}`}>
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{getReadTime(post)}</span>
                    </div>
                    <Link to={`/blog/${post.slug}`} className="flex-grow">
                      <h3 className="text-xl font-heading font-semibold mb-3 hover:text-coral transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border mt-auto">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {getAuthorName(post)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(post.published_at || post.created_at)}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">No posts found in this category.</p>
              <p className="text-sm">Check back later for new articles.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
