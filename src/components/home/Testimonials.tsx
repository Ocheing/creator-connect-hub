import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Lifestyle Creator",
    followers: "8.2K followers",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    quote: "MicroMatch helped me land my first paid brand deal within 2 weeks of signing up. They negotiated a rate 40% higher than what I would have asked for!",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Fitness Influencer",
    followers: "5.7K followers",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    quote: "I was skeptical about agencies, but these guys are different. They actually care about finding the right fit, not just any brand deal.",
    rating: 5,
  },
  {
    name: "Emma Rodriguez",
    role: "Food Blogger",
    followers: "9.1K followers",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    quote: "Since joining, I've worked with 12 brands and increased my monthly income by 300%. The team handles all the boring contract stuff so I can focus on creating.",
    rating: 5,
  },
];

const logos = [
  "TechCrunch",
  "Forbes",
  "Business Insider",
  "The Verge",
  "Mashable",
  "Entrepreneur",
];

const Testimonials = () => {
  return (
    <section className="py-20 lg:py-28 bg-muted/30">
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
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mt-3 mb-4">
            Loved by Creators
          </h2>
          <p className="text-muted-foreground text-lg">
            Don't just take our word for it. Here's what our community has to say.
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 border border-border hover:shadow-card transition-shadow"
            >
              {/* Quote Icon */}
              <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center mb-4">
                <Quote className="w-5 h-5 text-coral" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-coral text-coral" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-heading font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} • {testimonial.followers}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* As Featured In */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-8">
            As Featured In
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
            {logos.map((logo) => (
              <div
                key={logo}
                className="text-xl font-heading font-bold text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              >
                {logo}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
