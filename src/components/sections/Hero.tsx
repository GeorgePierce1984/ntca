import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  GraduationCap,
  Building2,
  Globe,
  Award,
  Search,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Teachers Placed", value: "2,500+", icon: GraduationCap },
  { label: "Partner Schools", value: "150+", icon: Building2 },
  { label: "Countries", value: "25+", icon: Globe },
  { label: "Success Rate", value: "95%", icon: Award },
];

const floatingElements = [
  { id: 1, emoji: "🎓", delay: 0, duration: 20 },
  { id: 2, emoji: "📚", delay: 2, duration: 25 },
  { id: 3, emoji: "🌏", delay: 4, duration: 22 },
  { id: 4, emoji: "✨", delay: 6, duration: 28 },
  { id: 5, emoji: "🏫", delay: 8, duration: 24 },
  { id: 6, emoji: "🚀", delay: 10, duration: 26 },
];

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (location) params.append("location", location);
    navigate(`/teachers/jobs?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-secondary-400/20 rounded-full blur-3xl animate-pulse-soft animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-400/10 rounded-full blur-3xl animate-pulse-soft animation-delay-4000" />

        {/* Subtle animated gradient overlay instead of floating icons */}
        <div className="absolute inset-0 animate-gradient-slow opacity-20" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          {/* Hero content */}
          <div className="text-center mb-12">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                AI-Powered Teaching Opportunities in Central Asia
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="heading-1 text-neutral-900 dark:text-white mb-6"
            >
              Connect Qualified Teachers with{" "}
              <span className="gradient-text">Premium Schools</span> in Central
              Asia
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto mb-8"
            >
              Join the leading platform for international teaching
              opportunities. Our AI matching technology connects exceptional
              educators with top schools across Central Asia.
            </motion.p>

            {/* Primary Job Search Button */}
            <motion.div variants={itemVariants} className="mb-12">
              <Button
                variant="gradient"
                size="lg"
                onClick={() => navigate("/teachers/jobs")}
                rightIcon={<Search className="w-5 h-5" />}
                glow
                className="text-lg px-8 py-3"
              >
                Search Teaching Jobs
              </Button>
            </motion.div>

            {/* Search Box */}
            <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
              <div className="glass rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-center mb-6 text-neutral-800 dark:text-neutral-200">
                  Find Your Next Teaching Opportunity
                </h3>

                {/* Search Form */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search teaching positions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input pl-12 w-full"
                    />
                  </div>
                  <div className="flex-1 md:max-w-xs relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="input pl-12 w-full"
                    />
                  </div>
                  <Button
                    variant="gradient"
                    size="lg"
                    onClick={handleSearch}
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    glow
                    className="md:px-8"
                  >
                    Search
                  </Button>
                </div>

                {/* Popular searches */}
                <div className="mt-4 flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    Popular:
                  </span>
                  <button
                    onClick={() =>
                      navigate(
                        "/teachers/jobs?search=English Teacher&location=Almaty",
                      )
                    }
                    className="badge badge-secondary hover:scale-105 transition-transform"
                  >
                    English Teacher Almaty
                  </button>
                  <button
                    onClick={() => navigate("/teachers/jobs?search=CELTA")}
                    className="badge badge-secondary hover:scale-105 transition-transform"
                  >
                    CELTA Positions
                  </button>
                  <button
                    onClick={() =>
                      navigate("/teachers/jobs?search=International School")
                    }
                    className="badge badge-secondary hover:scale-105 transition-transform"
                  >
                    International Schools
                  </button>
                </div>
              </div>
            </motion.div>

            {/* CTA Button for Schools */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center mt-8"
            >
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/signup")}
                leftIcon={<Building2 className="w-5 h-5" />}
              >
                Schools: Post Jobs & Find Teachers
              </Button>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-3">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-neutral-300 dark:border-neutral-600 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-neutral-400 dark:bg-neutral-500 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};
