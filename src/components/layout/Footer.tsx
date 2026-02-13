import { Link } from "react-router-dom";
import { Sparkles, Instagram, Twitter, Linkedin, Youtube, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: "About Us", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/for-brands" },
    ],
    forCreators: [
      { label: "Join as Influencer", href: "/for-influencers" },
      { label: "Rate Card Template", href: "/blog" },
      { label: "Creator Resources", href: "/blog" },
      { label: "Success Stories", href: "/about" },
    ],
    forBrands: [
      { label: "Partner with Us", href: "/for-brands" },
      { label: "Case Studies", href: "/about" },
      { label: "Our Services", href: "/services" },
      { label: "Request Proposal", href: "/for-brands" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/about" },
      { label: "Terms of Service", href: "/about" },
      { label: "Cookie Policy", href: "/about" },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-navy text-primary-foreground">
      {/* Newsletter Section */}
      <div className="border-b border-navy-light">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-heading font-bold mb-3">
              Stay Updated with Creator Economy Insights
            </h3>
            <p className="text-primary-foreground/70 mb-6">
              Get weekly tips on growing your influence and landing brand deals.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-navy-light border-navy-light text-primary-foreground placeholder:text-primary-foreground/50 focus:border-coral"
              />
              <Button variant="coral" className="shrink-0">
                <Mail className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-coral flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-xl">
                Micro<span className="text-coral">Match</span>
              </span>
            </Link>
            <p className="text-primary-foreground/70 text-sm mb-6 max-w-sm">
              Connecting micro-influencers with perfect brand partnerships. We believe in the power of authentic engagement over follower count.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-navy-light flex items-center justify-center hover:bg-coral transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-coral transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">For Creators</h4>
            <ul className="space-y-3">
              {footerLinks.forCreators.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-coral transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">For Brands</h4>
            <ul className="space-y-3">
              {footerLinks.forBrands.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-coral transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-coral transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-navy-light">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
            <p>© {currentYear} MicroMatch. All rights reserved.</p>
            <p>Made with ❤️ for creators everywhere</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
