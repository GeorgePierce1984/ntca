import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Send,
  ExternalLink,
  Globe,
  Award,
  Shield,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const footerLinks = {
  forSchools: [
    { label: "Post a Job", href: "/schools/post-job" },
    { label: "Browse Teachers", href: "/schools/browse-teachers" },
    { label: "Premium Listings", href: "/schools/premium" },
    { label: "AI Matching", href: "/schools/ai-matching" },
    { label: "Pricing", href: "/pricing" },
  ],
  forTeachers: [
    { label: "Find Jobs", href: "/teachers/jobs" },
    { label: "Create Profile", href: "/teachers/profile" },
              { label: "Resources", href: "/teachers/resources" },
    { label: "Career Guidance", href: "/teachers/career-guidance" },
    { label: "Salary Guide", href: "/teachers/salary-guide" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Success Stories", href: "/success-stories" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "FAQs", href: "/faqs" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

const badges = [
  { icon: Award, label: "Top Rated Platform 2024" },
  { icon: Shield, label: "SSL Secured" },
  { icon: Globe, label: "Available in 25+ Countries" },
];

export const Footer: React.FC = () => {
  const [email, setEmail] = React.useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  return (
    <footer className="bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
      {/* Newsletter Section */}
      <div className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="container-custom py-12">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 mb-4">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Stay Updated</span>
              </div>
              <h3 className="heading-3 text-neutral-900 dark:text-white mb-4">
                Get the Latest Teaching Opportunities
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
                Subscribe to our newsletter and never miss out on new job
                postings, career tips, and exclusive resources for
                CELTA-qualified teachers.
              </p>
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input flex-1"
                  required
                />
                <Button
                  type="submit"
                  variant="gradient"
                  rightIcon={<Send className="w-4 h-4" />}
                  glow
                >
                  Subscribe
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Logo className="h-10 mb-6" />
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Connecting qualified teachers with premium schools across Central Asia
              through AI-powered matching technology.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <a
                href="mailto:hello@ntca.com"
                className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
                hello@ntca.com
              </a>
              <a
                href="tel:+77001234567"
                className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Phone className="w-4 h-4" />
                +7 700 123 4567
              </a>
              <div className="flex items-start gap-3 text-neutral-600 dark:text-neutral-400">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>
                  123 Education Street
                  <br />
                  Almaty, Central Asia
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
              For Schools
            </h4>
            <ul className="space-y-3">
              {footerLinks.forSchools.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
              For Teachers
            </h4>
            <ul className="space-y-3">
              {footerLinks.forTeachers.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
              Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-wrap gap-6 justify-center mb-8">
            {badges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400"
              >
                <badge.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span className="text-sm">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
              <span>© 2025 NTCA.</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link
                to="/privacy"
                className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Terms
              </Link>
              <Link
                to="/cookies"
                className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Cookies
              </Link>
              <Link
                to="/sitemap"
                className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
