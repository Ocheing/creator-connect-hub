import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

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
    ],
    popular: false,
    variant: "outline" as const,
  },
  {
    name: "Growth Accelerator",
    price: "$599",
    period: "/month",
    description: "For established creators ready to scale their brand collaborations.",
    features: [
      "Full campaign management",
      "Contract handling",
      "Monthly performance reports",
      "Content strategy consultation",
      "Priority brand matching",
      "Dedicated account manager",
    ],
    popular: true,
    variant: "coral" as const,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For agencies and creators managing multiple profiles.",
    features: [
      "Multiple influencer management",
      "Full campaign strategy",
      "Dedicated account team",
      "Custom reporting",
      "White-label options",
      "API access",
    ],
    popular: false,
    variant: "outline" as const,
  },
];

const ServicesPreview = () => {
  return (
    <section className="py-20 lg:py-28 bg-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-coral font-medium text-sm uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mt-3 mb-4">
            Choose Your Growth Path
          </h2>
          <p className="text-muted-foreground text-lg">
            Transparent pricing with no hidden fees. Pick the plan that matches your ambition.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 lg:p-8 border ${
                pkg.popular
                  ? "bg-gradient-primary text-primary-foreground border-transparent"
                  : "bg-background border-border"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-coral text-primary-foreground text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-heading font-semibold mb-2">{pkg.name}</h3>
              <p className={`text-sm mb-4 ${pkg.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {pkg.description}
              </p>

              <div className="mb-6">
                <span className="text-4xl font-heading font-bold">{pkg.price}</span>
                <span className={pkg.popular ? "text-primary-foreground/70" : "text-muted-foreground"}>
                  {pkg.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 shrink-0 mt-0.5 ${pkg.popular ? "text-coral-light" : "text-coral"}`} />
                    <span className={`text-sm ${pkg.popular ? "text-primary-foreground/90" : "text-foreground"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link to="/services">
                <Button
                  variant={pkg.popular ? "secondary" : pkg.variant}
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
  );
};

export default ServicesPreview;
