import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { DollarSign, Clock, Shield, Users, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const benefits = [
  {
    icon: DollarSign,
    title: "Higher Pay Rates",
    description: "We negotiate rates 30-50% higher than creators get on their own.",
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "No more chasing brands or sending cold emails. We bring deals to you.",
  },
  {
    icon: Shield,
    title: "Contract Protection",
    description: "We review every contract to protect your rights and ensure fair terms.",
  },
  {
    icon: Users,
    title: "More Brand Deals",
    description: "Access our network of 150+ brands actively seeking micro-influencers.",
  },
];

const faqs = [
  {
    question: "Do you take commission?",
    answer: "Yes — we take 20% of deals we secure for you. This is only charged when you get paid, so there's zero upfront cost. If you don't earn, we don't earn.",
  },
  {
    question: "How quickly will I get brand deals?",
    answer: "Most creators receive their first brand introduction within 2 weeks of approval. However, timing depends on your niche, engagement rate, and current brand campaign needs.",
  },
  {
    question: "What platforms do you work with?",
    answer: "We work with creators on Instagram, TikTok, YouTube, Twitter/X, and emerging platforms. Multi-platform creators often get more opportunities.",
  },
  {
    question: "What follower count do I need?",
    answer: "We specialize in micro-influencers with 1K-10K followers. What matters more is your engagement rate and content quality.",
  },
  {
    question: "Can I decline brand deals?",
    answer: "Absolutely! You have full control over which brands you work with. We'll never pressure you to accept a deal that doesn't align with your values.",
  },
];

const ForInfluencers = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    toast({
      title: "Application Submitted!",
      description: "We'll review your profile and get back to you within 48 hours.",
    });
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
              For Creators
            </span>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mt-3 mb-6">
              We Help You Monetize Your Audience Without the Stress
            </h1>
            <p className="text-xl text-muted-foreground">
              Focus on creating. We'll handle finding brands, negotiating rates, and managing contracts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-background border border-border"
              >
                <div className="w-14 h-14 rounded-2xl bg-coral/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-coral" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-heading font-bold mb-6">Apply to Join</h2>
              <p className="text-muted-foreground mb-8">
                Fill out the form below and we'll review your application within 48 hours.
              </p>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input id="fullName" required placeholder="Your full name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" required placeholder="you@email.com" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform">Primary Platform *</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="twitter">Twitter/X</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="niche">Niche *</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select niche" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lifestyle">Lifestyle</SelectItem>
                          <SelectItem value="fashion">Fashion & Beauty</SelectItem>
                          <SelectItem value="fitness">Fitness & Health</SelectItem>
                          <SelectItem value="food">Food & Cooking</SelectItem>
                          <SelectItem value="tech">Tech & Gaming</SelectItem>
                          <SelectItem value="travel">Travel</SelectItem>
                          <SelectItem value="parenting">Parenting</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="followers">Follower Count *</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1k-3k">1K - 3K</SelectItem>
                          <SelectItem value="3k-5k">3K - 5K</SelectItem>
                          <SelectItem value="5k-10k">5K - 10K</SelectItem>
                          <SelectItem value="10k+">10K+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="engagement">Engagement Rate</Label>
                      <Input id="engagement" placeholder="e.g., 5.2%" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile">Link to Your Profile *</Label>
                    <Input id="profile" required placeholder="https://instagram.com/yourhandle" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about">Tell us about yourself</Label>
                    <Textarea
                      id="about"
                      placeholder="What makes your content unique? What brands would you love to work with?"
                      rows={4}
                    />
                  </div>

                  <Button type="submit" variant="coral" size="lg" className="w-full">
                    Submit Application
                  </Button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 px-6 rounded-2xl bg-card border border-border"
                >
                  <CheckCircle className="w-16 h-16 text-coral mx-auto mb-4" />
                  <h3 className="text-2xl font-heading font-bold mb-2">Application Received!</h3>
                  <p className="text-muted-foreground">
                    We'll review your profile and get back to you within 48 hours. Keep creating amazing content!
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-heading font-bold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border bg-card overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-heading font-semibold">{faq.question}</span>
                      {openFaq === index ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="px-6 pb-4"
                      >
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ForInfluencers;
