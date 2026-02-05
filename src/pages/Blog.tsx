import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const blogPosts = [
  {
    slug: "micro-influencer-rate-guide-2024",
    title: "Micro-Influencer Rate Guide 2024",
    excerpt: "Comprehensive guide to pricing your sponsored content. Learn how to charge what you're worth based on engagement, niche, and deliverables.",
    category: "Monetization",
    date: "Jan 15, 2024",
    readTime: "8 min read",
    author: "Maya Chen",
    image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=400&fit=crop",
    featured: true,
  },
  {
    slug: "how-to-pitch-brands-small-creator",
    title: "How to Pitch Brands as a Small Creator",
    excerpt: "Stop waiting for brands to find you. Learn proven outreach strategies that actually get responses from marketing managers.",
    category: "Strategy",
    date: "Jan 10, 2024",
    readTime: "6 min read",
    author: "Jordan Williams",
    image: "https://images.unsplash.com/photo-1552581234-26160f608093?w=800&h=400&fit=crop",
    featured: false,
  },
  {
    slug: "engagement-rate-matters-more",
    title: "Why Engagement Rate Matters More Than Followers",
    excerpt: "The data is clear: brands are prioritizing engagement over follower count. Here's why micro-influencers are winning.",
    category: "Insights",
    date: "Jan 5, 2024",
    readTime: "5 min read",
    author: "Sarah Mitchell",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=400&fit=crop",
    featured: false,
  },
  {
    slug: "negotiate-brand-deal-contract",
    title: "How to Negotiate Your First Brand Deal Contract",
    excerpt: "Don't sign that contract yet! Learn the key terms to look for and how to negotiate better terms as a creator.",
    category: "Monetization",
    date: "Dec 28, 2023",
    readTime: "7 min read",
    author: "Maya Chen",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=400&fit=crop",
    featured: false,
  },
  {
    slug: "content-calendar-template",
    title: "Free Content Calendar Template for Creators",
    excerpt: "Stay consistent and organized with our free content calendar template. Download and start planning your content today.",
    category: "Resources",
    date: "Dec 20, 2023",
    readTime: "4 min read",
    author: "Alex Rivera",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=400&fit=crop",
    featured: false,
  },
  {
    slug: "grow-instagram-organically-2024",
    title: "How to Grow Your Instagram Organically in 2024",
    excerpt: "Forget buying followers. These proven strategies will help you build a genuine, engaged audience on Instagram.",
    category: "Growth",
    date: "Dec 15, 2023",
    readTime: "9 min read",
    author: "Jordan Williams",
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=400&fit=crop",
    featured: false,
  },
];

const categories = ["All", "Monetization", "Strategy", "Insights", "Resources", "Growth"];

const Blog = () => {
  const featuredPost = blogPosts.find((post) => post.featured);
  const regularPosts = blogPosts.filter((post) => !post.featured);

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
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  category === "All"
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
      {featuredPost && (
        <section className="py-12 bg-card">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid lg:grid-cols-2 gap-8 items-center"
            >
              <div className="rounded-2xl overflow-hidden">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-64 lg:h-80 object-cover hover:scale-105 transition-transform duration-300"
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
                <h2 className="text-3xl font-heading font-bold mb-4">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {featuredPost.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {featuredPost.readTime}
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
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post, index) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-card transition-shadow"
              >
                <Link to={`/blog/${post.slug}`}>
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  </div>
                  <Link to={`/blog/${post.slug}`}>
                    <h3 className="text-xl font-heading font-semibold mb-3 hover:text-coral transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
