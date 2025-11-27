import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Sparkles,
  TrendingUp,
  Shield,
  Globe,
  Zap,
} from "lucide-react";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";

// Components
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// Features data
const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Matching",
    description:
      "Our advanced algorithms match teachers with schools based on qualifications, preferences, and cultural fit.",
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    description:
      "All teachers and schools go through our rigorous verification process for safety and quality assurance.",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: Globe,
    title: "Central Asia Focus",
    description:
      "Connect with schools and teachers across Central Asia - Kazakhstan, Uzbekistan, Kyrgyzstan, Tajikistan, and more.",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  {
    icon: Zap,
    title: "Fast & Easy",
    description:
      "Post jobs or apply for positions in minutes with our streamlined platform.",
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
];

// Process steps
const processSteps = [
  {
    number: "01",
    title: "Create Your Profile",
    description:
      "Sign up and complete your profile with qualifications, experience, and preferences.",
    forTeachers: true,
    forSchools: true,
  },
  {
    number: "02",
    title: "Get AI Matched",
    description:
      "Our AI analyzes your profile and matches you with the best opportunities or candidates.",
    forTeachers: true,
    forSchools: true,
  },
  {
    number: "03",
    title: "Connect & Interview",
    description:
      "Review matches, connect directly, and schedule interviews through our platform.",
    forTeachers: true,
    forSchools: true,
  },
  {
    number: "04",
    title: "Start Teaching",
    description:
      "Finalize agreements and begin your teaching journey in Central Asia.",
    forTeachers: true,
    forSchools: true,
  },
];

// Testimonials
const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "CELTA Teacher",
    location: "From UK, Teaching in Almaty",
    content:
      "NTCA made my dream of teaching abroad a reality. The AI matching was spot-on, and I found the perfect school within weeks!",
    rating: 5,
    image: "https://i.pravatar.cc/150?img=1",
  },
  {
    name: "Nurlan Karimov",
    role: "School Director",
    location: "International School, Astana",
    content:
      "We've hired 5 amazing teachers through NTCA. The quality of candidates and the efficiency of the platform is outstanding.",
    rating: 5,
    image: "https://i.pravatar.cc/150?img=3",
  },
  {
    name: "Emily Chen",
    role: "English Teacher",
    location: "From Canada, Teaching in Shymkent",
    content:
      "The support and resources provided by NTCA are incredible. They helped me every step of the way.",
    rating: 5,
    image: "https://i.pravatar.cc/150?img=5",
  },
];

// CTA sections data
const ctaForTeachers = {
  title: "Ready to Start Your Teaching Journey?",
  description:
    "Join thousands of qualified teachers who have found their dream positions through NTCA.",
  benefits: [
    "Access to exclusive job opportunities",
    "AI-powered job matching",
    "Free CELTA resources and career guidance",
    "Visa and relocation support",
  ],
};

const ctaForSchools = {
  title: "Find Your Perfect Teachers Today",
  description:
    "Connect with pre-verified, CELTA-qualified teachers who are ready to make a difference.",
  benefits: [
    "Access to global talent pool",
    "AI-powered candidate screening",
    "Premium listing options",
    "Dedicated support team",
  ],
};

export const HomePage: React.FC = () => {
  const { ref: featuresRef, inView: featuresInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const { ref: processRef, inView: processInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const { ref: testimonialsRef, inView: testimonialsInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="section bg-white dark:bg-neutral-900">
        <div className="container-custom">
          <motion.div
            ref={featuresRef}
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="heading-2 text-neutral-900 dark:text-white mb-4">
              Why Choose <span className="gradient-text">NTCA</span>?
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              We're revolutionizing how certified English language teachers discover opportunities in Central Asia
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-hover p-6"
              >
                <div
                  className={cn(
                    "inline-flex p-3 rounded-xl mb-4",
                    feature.bgColor,
                  )}
                >
                  <feature.icon className={cn("w-6 h-6", feature.color)} />
                </div>
                <h3 className="heading-4 text-neutral-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section bg-neutral-50 dark:bg-neutral-800">
        <div className="container-custom">
          <motion.div
            ref={processRef}
            initial={{ opacity: 0, y: 20 }}
            animate={processInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="heading-2 text-neutral-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Get started in just a few simple steps
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={processInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="flex items-start gap-6 mb-8 last:mb-0"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center font-bold text-xl shadow-lg">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="heading-4 text-neutral-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={processInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12"
          >
            <Button
              variant="gradient"
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              glow
              onClick={() => {
                /* Handle get started */
              }}
            >
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section bg-white dark:bg-neutral-900">
        <div className="container-custom">
          <motion.div
            ref={testimonialsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="heading-2 text-neutral-900 dark:text-white mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Hear from teachers and schools who found their perfect match
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={testimonialsInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-500">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 italic">
                  "{testimonial.content}"
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-4">
                  {testimonial.location}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section for Teachers */}
      <section className="section bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="heading-2 mb-4">{ctaForTeachers.title}</h2>
              <p className="text-xl mb-8 text-white/90">
                {ctaForTeachers.description}
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-8 text-left max-w-2xl mx-auto">
                {ctaForTeachers.benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-white/80 flex-shrink-0" />
                    <span className="text-white/90">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    /* Handle create profile */
                  }}
                >
                  Create Free Profile
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/20"
                  onClick={() => {
                    /* Handle browse jobs */
                  }}
                >
                  Browse Jobs
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section for Schools */}
      <section className="section bg-neutral-50 dark:bg-neutral-800">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="heading-2 text-neutral-900 dark:text-white mb-4">
                  {ctaForSchools.title}
                </h2>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
                  {ctaForSchools.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {ctaForSchools.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      /* Handle post job */
                    }}
                  >
                    Post a Job Free
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      /* Handle browse teachers */
                    }}
                  >
                    Browse Teachers
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl blur-2xl opacity-20" />
                  <div className="relative glass rounded-2xl p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white">
                        <Users className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                          2,500+
                        </div>
                        <div className="text-neutral-600 dark:text-neutral-400">
                          Active Teachers
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary-500 to-accent-500 flex items-center justify-center text-white">
                        <TrendingUp className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                          95%
                        </div>
                        <div className="text-neutral-600 dark:text-neutral-400">
                          Placement Rate
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        Join 150+ schools already using NTCA
                      </p>
                      <div className="flex justify-center -space-x-2">
                        {[...Array(5)].map((_, i) => (
                          <img
                            key={i}
                            src={`https://i.pravatar.cc/40?img=${i + 10}`}
                            alt=""
                            className="w-10 h-10 rounded-full border-2 border-white dark:border-neutral-800"
                          />
                        ))}
                        <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 border-2 border-white dark:border-neutral-800 flex items-center justify-center text-xs font-medium text-neutral-600 dark:text-neutral-400">
                          +145
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
