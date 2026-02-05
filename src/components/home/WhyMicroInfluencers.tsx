import { motion } from "framer-motion";
import { Heart, Target, Users, TrendingUp } from "lucide-react";
import creatorWorking from "@/assets/creator-working.jpg";

const benefits = [
  {
    icon: Heart,
    title: "Higher Engagement",
    description: "Micro-influencers see 7x higher engagement rates than mega influencers.",
  },
  {
    icon: Target,
    title: "Niche Audiences",
    description: "Reach highly targeted communities that trust their favorite creators.",
  },
  {
    icon: Users,
    title: "Authentic Trust",
    description: "82% of consumers are more likely to buy products recommended by micro-influencers.",
  },
  {
    icon: TrendingUp,
    title: "Better ROI",
    description: "Cost-effective partnerships that deliver measurable results for brands.",
  },
];

const WhyMicroInfluencers = () => {
  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-card-hover">
              <img
                src={creatorWorking}
                alt="Content creator filming video"
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute -bottom-6 -right-6 bg-card rounded-xl p-5 shadow-card-hover border border-border"
            >
              <p className="text-4xl font-heading font-bold text-coral">60%</p>
              <p className="text-sm text-muted-foreground">Higher conversion rate</p>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-coral font-medium text-sm uppercase tracking-wider">
              The Power of Micro
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mt-3 mb-6">
              Why Micro-Influencers Win
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Small doesn't mean less powerful. Micro-influencers build deep, trusted relationships with their audiences that translate into real results for brands.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center shrink-0">
                    <benefit.icon className="w-6 h-6 text-coral" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold mb-1">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyMicroInfluencers;
