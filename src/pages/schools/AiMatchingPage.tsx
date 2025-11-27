import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  Target,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export const AiMatchingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Smart Matching Algorithm",
      description: "AI analyzes skills, experience, and cultural fit",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "95% Match Accuracy",
      description: "Find teachers who meet your exact requirements",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Save 80% Time",
      description: "Reduce screening time from days to minutes",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Personality Matching",
      description: "Find teachers who fit your school culture",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Pre-Verified Candidates",
      description: "All matches are background checked",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Performance Predictions",
      description: "AI predicts teacher success metrics",
    },
  ];

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/schools/ai-matching" } });
    } else if (user?.userType === "SCHOOL") {
      navigate("/pricing");
    } else {
      navigate("/schools/signup");
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-neutral-50 dark:bg-neutral-900">
      <div className="section">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-6">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Powered by Advanced AI</span>
            </div>
            <h1 className="heading-1 mb-4">
              Find Your Perfect Teacher Match
              <br />
              <span className="text-primary-600 dark:text-primary-400">
                In Seconds, Not Weeks
              </span>
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Our AI-powered matching system analyzes hundreds of factors to
              connect you with teachers who are the perfect fit for your school
            </p>
          </motion.div>

          {/* How it Works */}
          <div className="max-w-5xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              How AI Matching Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Define Your Needs",
                  description:
                    "Tell us about your ideal teacher, school culture, and specific requirements",
                },
                {
                  step: "2",
                  title: "AI Analysis",
                  description:
                    "Our AI analyzes thousands of teacher profiles to find perfect matches",
                },
                {
                  step: "3",
                  title: "Get Matches",
                  description:
                    "Receive a curated list of pre-qualified teachers ready to interview",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 md:p-12 text-white text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">
                Experience the Future of Teacher Recruitment
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join schools that fill positions 10x faster with AI matching
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-neutral-100"
                  leftIcon={<Zap className="w-5 h-5" />}
                >
                  Get Started with AI
                </Button>
                <Button
                  onClick={() => navigate("/pricing")}
                  size="lg"
                  variant="ghost"
                  className="text-white border-white hover:bg-white/10"
                  leftIcon={<ArrowRight className="w-5 h-5" />}
                >
                  View Premium Plans
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <p className="text-sm text-neutral-500 mb-4">
              Trusted by leading schools worldwide
            </p>
            <div className="flex items-center justify-center gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-24 h-12 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
