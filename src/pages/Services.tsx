import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, ArrowRight, Zap, Shield, Users, BarChart } from "lucide-react";
import { Link } from "react-router-dom";

const packages = [
  {
    name: "Launch Pad",
    price: "$299",
    period: "/month",
    description: "Perfect for creators just starting their brand partnership journey.",
    features: [
      "Brand matchmaking (3 intros/month)",
      "Rate negotiation support",
      "Basic performance tracking",
      "Email support",
      "Contract templates",
      "Creator community access",
    ],
    popular: false,
  },
  {
    name: "Growth Accelerator",
    price: "$599",
    period: "/month",
    description: "For established creators ready to scale their brand collaborations.",
    features: [
      "Everything in Launch Pad",
      "Unlimited brand introductions",
      "Full campaign management",
      "Contract handling & legal review",
      "Monthly performance reports",
      "Content strategy consultation",
      "Priority brand matching",
      "Dedicated account manager",
      "Revenue optimization",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For agencies and creators managing multiple profiles.",
    features: [
      "Everything in Growth Accelerator",
      "Multiple influencer management",
      "Full campaign strategy",
      "Dedicated account team",
      "Custom reporting & analytics",
      "White-label options",
      "API access",
      "Custom integrations",
      "Priority support",
    ],
    popular: false,
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
    title: "Contract Protection",
    description: "We review all contracts to protect your interests.",
  },
  {
    icon: Users,
    title: "Dedicated Support",
    description: "Personal account managers who know your brand.",
  },
  {
    icon: BarChart,
    title: "Performance Tracking",
    description: "Real-time analytics to optimize your campaigns.",
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
              Pricing That Grows With You
            </h1>
            <p className="text-xl text-muted-foreground">
              Transparent, flexible plans designed for creators at every stage. No hidden fees, no long-term contracts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 lg:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-2xl p-8 border ${
                  pkg.popular
                    ? "bg-gradient-primary text-primary-foreground border-transparent scale-105"
                    : "bg-background border-border"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-coral text-primary-foreground text-sm font-semibold rounded-full shadow-coral">
                    Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-heading font-bold mb-2">{pkg.name}</h3>
                <p className={`text-sm mb-6 ${pkg.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {pkg.description}
                </p>

                <div className="mb-8">
                  <span className="text-5xl font-heading font-bold">{pkg.price}</span>
                  <span className={pkg.popular ? "text-primary-foreground/70" : "text-muted-foreground"}>
                    {pkg.period}
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 shrink-0 mt-0.5 ${pkg.popular ? "text-coral-light" : "text-coral"}`} />
                      <span className={`text-sm ${pkg.popular ? "text-primary-foreground/90" : "text-foreground"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link to="/sign-up">
                  <Button
                    variant={pkg.popular ? "secondary" : "outline"}
                    size="lg"
                    className="w-full"
                  >
                    {pkg.price === "Custom" ? "Contact Sales" : "Get Started"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              What's Included in Every Plan
            </h2>
            <p className="text-muted-foreground text-lg">
              Core features that set us apart from other agencies.
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
              Book a free 15-minute consultation to discuss your goals and find the perfect plan for you.
            </p>
            <Link to="/sign-up">
              <Button variant="coral" size="xl">
                Book Free Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
