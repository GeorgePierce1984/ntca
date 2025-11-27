import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap,
  Star,
  TrendingUp,
  Eye,
  Target,
  Award,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export const PremiumListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Priority Placement",
      description: "Your jobs appear at the top of search results",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Highlighted Listings",
      description: "Eye-catching design with premium badge",
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "3x More Views",
      description: "Get seen by more qualified teachers",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Featured in Emails",
      description: "Promoted to our teacher network",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Analytics Dashboard",
      description: "Track views, applications, and conversion",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Verified Badge",
      description: "Build trust with premium verification",
    },
  ];

  const handleUpgrade = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/schools/premium" } });
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
            <h1 className="heading-1 mb-4">Premium Job Listings</h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Attract top teaching talent faster with premium features that make
              your job postings stand out
            </p>
          </motion.div>

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
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 md:p-12 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Find Your Perfect Teacher?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Premium listings get 3x more applications on average
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleUpgrade}
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-neutral-100"
                  leftIcon={<CheckCircle className="w-5 h-5" />}
                >
                  Upgrade to Premium
                </Button>
                <Button
                  onClick={() => navigate("/pricing")}
                  size="lg"
                  variant="ghost"
                  className="text-white border-white hover:bg-white/10"
                  leftIcon={<ArrowRight className="w-5 h-5" />}
                >
                  View Pricing
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                85%
              </div>
              <p className="text-neutral-600 dark:text-neutral-400">
                Fill positions faster
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                3x
              </div>
              <p className="text-neutral-600 dark:text-neutral-400">
                More qualified applicants
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                24hrs
              </div>
              <p className="text-neutral-600 dark:text-neutral-400">
                Average time to first application
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
