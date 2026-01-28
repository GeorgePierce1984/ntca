import React from 'react';
import { motion } from 'framer-motion';

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  showComingSoon?: boolean;
  topPaddingClassName?: string;
}

export const PageTemplate: React.FC<PageTemplateProps> = ({
  title,
  subtitle,
  showComingSoon = true,
  topPaddingClassName = "pt-20",
}) => {
  return (
    <div className={`min-h-screen ${topPaddingClassName}`}>
      <div className="section bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="heading-1 text-neutral-900 dark:text-white mb-4">{title}</h1>
            {subtitle && (
              <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {showComingSoon && (
        <div className="section">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="card p-8">
                <p className="text-neutral-600 dark:text-neutral-400 text-center">
                  This page is coming soon. We're working hard to bring you amazing content!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
