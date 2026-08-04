import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Download, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePlatformStats } from "@/hooks/usePlatformStats";

const EmailSignup = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { activeCreators } = usePlatformStats();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      toast({
        title: "Success!",
        description: "Check your email for the rate card template.",
      });
    }
  };

  return (
    <section className="py-20 lg:py-28 bg-gradient-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-coral/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary-foreground/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          {!isSubmitted ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-coral/20 flex items-center justify-center mx-auto mb-6">
                <Download className="w-8 h-8 text-primary-foreground" />
              </div>

              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
                Free Micro-Influencer Rate Card Template
              </h2>
              <p className="text-primary-foreground/70 text-lg mb-8">
                Stop undercharging! Get our proven rate card template used by top micro-influencers to negotiate better deals.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-coral"
                />
                <Button type="submit" variant="coral" size="lg" className="shrink-0">
                  Get Free Template
                </Button>
              </form>

              <p className="text-sm text-primary-foreground/50 mt-4">
                Join {activeCreators.toLocaleString()}+ creators. No spam, ever.
              </p>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 rounded-full bg-coral flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-primary-foreground mb-4">
                Check Your Inbox! 📬
              </h2>
              <p className="text-primary-foreground/70 text-lg">
                We've sent the rate card template to your email. Time to start charging what you're worth!
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default EmailSignup;
