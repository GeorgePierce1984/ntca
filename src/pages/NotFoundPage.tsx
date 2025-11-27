import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* 404 Text */}
            <h1 className="text-[150px] md:text-[200px] font-bold leading-none gradient-text mb-4">
              404
            </h1>

            {/* Error Message */}
            <h2 className="heading-2 text-neutral-900 dark:text-white mb-4">
              Oops! Page Not Found
            </h2>

            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-lg mx-auto">
              The page you're looking for seems to have taken an unexpected teaching assignment abroad.
              Let's get you back on track!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/">
                <Button
                  variant="gradient"
                  size="lg"
                  leftIcon={<Home className="w-5 h-5" />}
                  glow
                >
                  Back to Home
                </Button>
              </Link>

              <Link to="/teachers/jobs">
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<Search className="w-5 h-5" />}
                >
                  Browse Jobs
                </Button>
              </Link>
            </div>

            {/* Helpful Links */}
            <div className="glass rounded-2xl p-6 max-w-md mx-auto">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
                Helpful Links
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Link
                  to="/teachers/jobs"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Find Teaching Jobs
                </Link>
                <Link
                  to="/schools/post-job"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Post a Job
                </Link>
                <Link
                  to="/about"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  About NCTA
                </Link>
                <Link
                  to="/contact"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-pulse-soft" />
            <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-secondary-400/20 rounded-full blur-3xl animate-pulse-soft animation-delay-2000" />
          </div>
        </div>
      </div>
    </div>
  );
};
