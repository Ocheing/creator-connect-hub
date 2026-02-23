import { useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Loader2, MessageSquareOff } from "lucide-react";
import { useTestimonials } from "@/hooks/useSupabase";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/useSupabase";

const logos = [
  "TechCrunch",
  "Forbes",
  "Business Insider",
  "The Verge",
  "Mashable",
  "Entrepreneur",
];

const Testimonials = () => {
  const queryClient = useQueryClient();
  const { data: testimonials, isLoading } = useTestimonials(true);

  // Real-time subscription for testimonials
  useEffect(() => {
    const channel = supabase
      .channel('public-testimonials')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'testimonials' },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.testimonials() });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-coral" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!testimonials || testimonials.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <MessageSquareOff className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">No testimonials yet. Check back soon!</p>
          </motion.div>
        )}

        {/* Testimonial Cards */}
        {!isLoading && testimonials && testimonials.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
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
                {testimonial.rating && testimonial.rating > 0 && (
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-coral text-coral" />
                    ))}
                  </div>
                )}

                {/* Quote */}
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  {testimonial.author_image_url ? (
                    <img
                      src={testimonial.author_image_url}
                      alt={testimonial.author_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center">
                      <span className="font-semibold text-coral text-sm">
                        {testimonial.author_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-heading font-semibold">{testimonial.author_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.author_role}
                      {testimonial.author_company && ` • ${testimonial.author_company}`}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

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
