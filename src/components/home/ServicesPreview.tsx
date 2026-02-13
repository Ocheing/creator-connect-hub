import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Megaphone, Users, Briefcase } from "lucide-react";

const services = [
  {
    name: "Brand Matchmaking",
    description: "We connect you with brands that align with your niche, audience, and values — no cold pitching required.",
    icon: Users,
  },
  {
    name: "Campaign Management",
    description: "From contracts to content strategy, we handle the details so you can focus on creating amazing content.",
    icon: Briefcase,
  },
  {
    name: "Growth & Strategy",
    description: "Get expert guidance on growing your audience, improving engagement, and maximizing your earning potential.",
    icon: Megaphone,
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
            What We Do
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mt-3 mb-4">
            Services Built for Creators
          </h2>
          <p className="text-muted-foreground text-lg">
            We handle the business side so you can focus on what you do best — creating content.
          </p>
        </motion.div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative rounded-2xl p-6 lg:p-8 border bg-background border-border text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-coral/10 flex items-center justify-center mx-auto mb-5">
                <service.icon className="w-7 h-7 text-coral" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">{service.name}</h3>
              <p className="text-muted-foreground text-sm mb-6">{service.description}</p>
              <Link to="/services">
                <Button variant="outline" className="w-full">
                  Learn More
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
