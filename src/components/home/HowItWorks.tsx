import { motion } from "framer-motion";
import { ClipboardCheck, Users, Banknote } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Apply",
    description: "Submit your profile and let us know about your niche, audience, and content style.",
    color: "bg-coral/10 text-coral",
  },
  {
    icon: Users,
    title: "Get Matched",
    description: "Our team finds brands that align with your values and audience demographics.",
    color: "bg-navy/10 text-navy",
  },
  {
    icon: Banknote,
    title: "Get Paid",
    description: "Complete collaborations and receive fair compensation for your authentic influence.",
    color: "bg-coral/10 text-coral",
  },
];

const HowItWorks = () => {
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
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mt-3 mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg">
            From application to payment, we've streamlined the entire process so you can focus on what you do best—creating.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connecting Line (desktop only) */}
          <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-coral via-navy to-coral opacity-20" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative text-center"
            >
              {/* Step Number */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-background border-2 border-coral flex items-center justify-center font-heading font-bold text-coral z-10">
                {index + 1}
              </div>

              {/* Card */}
              <div className="pt-8 p-6 rounded-2xl bg-background border border-border hover:shadow-card transition-shadow">
                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-5`}>
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
