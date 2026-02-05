import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { TrendingUp, Users, Target, ShieldCheck, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const benefits = [
  {
    icon: TrendingUp,
    title: "Higher Engagement",
    description: "Micro-influencers deliver 60% higher engagement rates than celebrities.",
  },
  {
    icon: Users,
    title: "Authentic Trust",
    description: "Their audiences trust them like friends, leading to genuine recommendations.",
  },
  {
    icon: Target,
    title: "Niche Targeting",
    description: "Reach hyper-specific audiences that align perfectly with your brand.",
  },
  {
    icon: ShieldCheck,
    title: "Cost Effective",
    description: "Get better ROI with budgets that work for growing brands.",
  },
];

const caseStudies = [
  {
    brand: "Organic Skincare Co.",
    industry: "Beauty",
    result: "312% increase in website traffic",
    description: "Partnered with 15 beauty micro-influencers for a product launch campaign.",
    stats: { influencers: 15, reach: "180K", engagement: "8.2%" },
  },
  {
    brand: "FitLife Supplements",
    industry: "Health & Fitness",
    result: "2.5x return on ad spend",
    description: "Ambassador program with fitness creators driving consistent sales.",
    stats: { influencers: 8, reach: "95K", engagement: "9.1%" },
  },
  {
    brand: "TechStart App",
    industry: "Technology",
    result: "5,000+ app downloads",
    description: "Tech reviewers showcasing app features to engaged audiences.",
    stats: { influencers: 10, reach: "120K", engagement: "7.5%" },
  },
];

const vettingProcess = [
  "Audience authenticity verification",
  "Engagement rate analysis",
  "Content quality review",
  "Brand safety screening",
  "Past collaboration history",
  "Niche relevance matching",
];

const ForBrands = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    toast({
      title: "Proposal Request Received!",
      description: "Our team will prepare a custom proposal and contact you within 24 hours.",
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
              For Brands
            </span>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mt-3 mb-6">
              Why Micro-Influencers Deliver Better ROI Than Big Celebrities
            </h1>
            <p className="text-xl text-muted-foreground">
              Connect with authentic creators who have built genuine trust with their audiences. Real influence, real results.
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

      {/* Case Studies */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Success Stories
            </h2>
            <p className="text-muted-foreground text-lg">
              See how brands are winning with micro-influencer marketing.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <motion.div
                key={study.brand}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border"
              >
                <div className="inline-block px-3 py-1 bg-coral/10 text-coral text-sm font-medium rounded-full mb-4">
                  {study.industry}
                </div>
                <h3 className="text-xl font-heading font-bold mb-2">{study.brand}</h3>
                <p className="text-coral font-semibold text-lg mb-3">{study.result}</p>
                <p className="text-muted-foreground text-sm mb-6">{study.description}</p>
                
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="font-heading font-bold text-lg">{study.stats.influencers}</p>
                    <p className="text-xs text-muted-foreground">Creators</p>
                  </div>
                  <div className="text-center">
                    <p className="font-heading font-bold text-lg">{study.stats.reach}</p>
                    <p className="text-xs text-muted-foreground">Reach</p>
                  </div>
                  <div className="text-center">
                    <p className="font-heading font-bold text-lg">{study.stats.engagement}</p>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vetting Process */}
      <section className="py-16 lg:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
                Our Influencer Vetting Process
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We don't just match you with any creator. Every influencer in our network goes through a rigorous screening process.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {vettingProcess.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-coral/10 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4 text-coral" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-background rounded-2xl p-8 border border-border"
            >
              <h3 className="text-2xl font-heading font-bold mb-6">
                Request a Campaign Proposal
              </h3>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input id="company" required placeholder="Your company name" />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact">Contact Person *</Label>
                      <Input id="contact" required placeholder="Full name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brandEmail">Email *</Label>
                      <Input id="brandEmail" type="email" required placeholder="you@company.com" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget Range *</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1k-5k">$1,000 - $5,000</SelectItem>
                          <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                          <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                          <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                          <SelectItem value="50k+">$50,000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry *</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beauty">Beauty & Skincare</SelectItem>
                          <SelectItem value="fashion">Fashion & Apparel</SelectItem>
                          <SelectItem value="food">Food & Beverage</SelectItem>
                          <SelectItem value="tech">Technology</SelectItem>
                          <SelectItem value="health">Health & Wellness</SelectItem>
                          <SelectItem value="travel">Travel & Hospitality</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goals">Campaign Goals *</Label>
                    <Textarea
                      id="goals"
                      required
                      placeholder="What are you hoping to achieve? (e.g., brand awareness, sales, app downloads)"
                      rows={4}
                    />
                  </div>

                  <Button type="submit" variant="coral" size="lg" className="w-full">
                    Request Proposal
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="w-16 h-16 text-coral mx-auto mb-4" />
                  <h3 className="text-2xl font-heading font-bold mb-2">Request Received!</h3>
                  <p className="text-muted-foreground">
                    Our team will prepare a custom campaign proposal and contact you within 24 hours.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ForBrands;
