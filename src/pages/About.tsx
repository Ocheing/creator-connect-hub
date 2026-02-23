import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Heart, Target, Users, Award } from "lucide-react";
import founderImage from "@/assets/founder.jpg";

const values = [
  {
    icon: Heart,
    title: "Creator First",
    description: "We prioritize fair pay and meaningful partnerships for every creator in our network.",
  },
  {
    icon: Target,
    title: "Authenticity Over Numbers",
    description: "We believe engagement and trust matter more than follower count.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "We're building a supportive community where creators help each other grow.",
  },
  {
    icon: Award,
    title: "Quality Matches",
    description: "Every brand partnership is carefully vetted for creator-brand alignment.",
  },
];

const team = [
  {
    name: "CHRIS GITONGA",
    role: "Founder & CEO",
    image: founderImage,
    bio: "Former micro-influencer turned entrepreneur. Passionate about helping small creators thrive.",
  },
  {
    name: "Jordan Williams",
    role: "Head of Creator Relations",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    bio: "10+ years in talent management. Believes every creator deserves a fair shot.",
  },
  {
    name: "Sarah Mitchell",
    role: "Director of Brand Partnerships",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    bio: "Former brand marketing lead at Fortune 500 companies. Expert in influencer ROI.",
  },
  {
    name: "Alex Rivera",
    role: "Head of Operations",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    bio: "Operations wizard who keeps everything running smoothly behind the scenes.",
  },
];

const About = () => {
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
              About Us
            </span>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mt-3 mb-6">
              Empowering Creators to Build Sustainable Careers
            </h1>
            <p className="text-xl text-muted-foreground">
              We started MicroMatch because we believe small creators deserve the same opportunities as mega-influencers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-16 lg:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <img
                  src={founderImage}
                  alt="CHRIS GITONGA, Founder"
                  className="rounded-2xl shadow-card-hover w-full max-w-md mx-auto"
                />
                <div className="absolute -bottom-6 -right-6 bg-coral text-primary-foreground rounded-xl p-4 shadow-coral">
                  <p className="font-heading font-bold text-2xl">2026</p>
                  <p className="text-sm">Founded</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  When I was a micro-influencer with 7,000 followers, I knew the power of my community. My audience trusted me, engaged with every post, and actually bought products I recommended.
                </p>
                <p>
                  But brands kept overlooking me for bigger creators with less engaged audiences. I spent hours cold-emailing, negotiating rates I didn't understand, and navigating contracts alone.
                </p>
                <p>
                  I founded MicroMatch to change that. We're the agency I wish I had—one that fights for fair pay, handles the boring stuff, and lets creators focus on what they do best: creating.
                </p>
                <p className="font-semibold text-foreground">
                  Today, we've helped over 500 micro-influencers earn more than $2 million in brand partnerships.
                </p>
              </div>
              <p className="mt-6 font-heading font-semibold text-lg">
                — CHRIS GITONGA, Founder & CEO
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Our Mission
            </h2>
            <p className="text-xl text-coral font-medium">
              "To democratize influencer marketing and ensure every creator—regardless of follower count—has access to fair pay and meaningful brand partnerships."
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-card border border-border"
              >
                <div className="w-14 h-14 rounded-2xl bg-coral/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-coral" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 lg:py-24 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Meet the Team
            </h2>
            <p className="text-muted-foreground text-lg">
              A passionate team dedicated to creator success.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-card"
                />
                <h3 className="font-heading font-semibold text-lg">{member.name}</h3>
                <p className="text-coral text-sm font-medium mb-2">{member.role}</p>
                <p className="text-muted-foreground text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 lg:py-24 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Active Creators" },
              { value: "150+", label: "Brand Partners" },
              { value: "$2M+", label: "Creator Earnings" },
              { value: "95%", label: "Creator Satisfaction" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <p className="text-4xl lg:text-5xl font-heading font-bold mb-2">{stat.value}</p>
                <p className="text-primary-foreground/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
