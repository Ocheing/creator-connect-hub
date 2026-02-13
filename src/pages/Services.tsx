import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Users, BarChart, Megaphone, Briefcase, FileText, HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Users,
    title: "Brand Matchmaking",
    description: "We connect you with brands that align with your niche, audience, and values. No cold pitching — we bring the opportunities to you.",
  },
  {
    icon: Briefcase,
    title: "Campaign Management",
    description: "From contracts to deliverables, we manage the entire campaign lifecycle so you can focus on creating great content.",
  },
  {
    icon: HeartHandshake,
    title: "Rate Negotiation",
    description: "We negotiate fair rates on your behalf, ensuring you're compensated appropriately for your influence and creativity.",
  },
  {
    icon: FileText,
    title: "Contract Handling",
    description: "We review and handle all contracts to protect your interests, ensuring clear terms and fair agreements.",
  },
  {
    icon: Megaphone,
    title: "Content Strategy",
    description: "Get expert guidance on content strategy, audience growth, and maximizing engagement across your platforms.",
  },
  {
    icon: BarChart,
    title: "Performance Tracking",
    description: "Real-time analytics and monthly reports to track campaign performance and optimize your results.",
  },
];

const features = [
  {
    icon: Zap,
    title: "Fast Matching",
    description: "Get matched with brands within 48 hours of joining.",
  },
  {
    icon: Shield,
    title: "No Upfront Costs",
    description: "Our services are free for creators — we earn when you earn.",
  },
  {
    icon: Users,
    title: "Dedicated Support",
    description: "Personal account managers who know your brand.",
  },
  {
    icon: BarChart,
    title: "Transparent Process",
    description: "Full visibility into your campaigns, earnings, and performance.",
  },
];

const Services = () => {
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
              Our Services
            </span>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mt-3 mb-6">
              Everything You Need to Grow as a Creator
            </h1>
            <p className="text-xl text-muted-foreground">
              We handle the business side of influencer marketing — brand partnerships, contracts, negotiations, and more — completely free for creators.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 lg:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-2xl p-8 border bg-background border-border"
              >
                <div className="w-14 h-14 rounded-2xl bg-coral/10 flex items-center justify-center mb-5">
                  <service.icon className="w-7 h-7 text-coral" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-3">{service.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Why Creators Choose Us
            </h2>
            <p className="text-muted-foreground text-lg">
              We believe creators shouldn't pay to get brand deals. That's why our services are completely free for influencers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-coral/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-coral" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of creators who are landing brand deals without the stress. Apply today — it's completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/for-influencers">
                <Button variant="coral" size="xl">
                  Apply as Creator
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/for-brands">
                <Button variant="outline" size="xl">
                  Partner as a Brand
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
