import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "@/components/PageTemplate";
import { hubSections, resourceCategories } from "./resourcesData";

export const ResourcesExamPrepPage: React.FC = () => {
  const navigate = useNavigate();

  const categories = useMemo(() => {
    const allowed = new Set(hubSections.examPrep);
    return resourceCategories.filter((c) => allowed.has(c.title));
  }, []);

  const totalLinks = useMemo(
    () => categories.reduce((sum, c) => sum + (c.resources?.length || 0), 0),
    [categories]
  );

  return (
    <PageTemplate
      title="Exam Prep"
      subtitle={`${totalLinks} resources for IELTS / SAT / exams`}
      showComingSoon={false}
      topPaddingClassName="pt-[55px]"
      headerSectionClassName="pt-10 pb-6 md:pt-12 md:pb-8 bg-gradient-to-br from-primary-50 to-white dark:from-neutral-900 dark:to-neutral-950"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        <button
          onClick={() => navigate("/resources")}
          className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Resources Hub
        </button>

        <div className="mt-6 grid grid-cols-1 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.title}
                whileHover={{ y: -2 }}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      {category.title}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {category.resources.map((r) => (
                    <a
                      key={r.name}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/40 dark:hover:bg-primary-900/10 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-neutral-900 dark:text-white">
                            {r.name}
                            <span className="ml-2 text-xs text-neutral-500">{r.type}</span>
                          </div>
                          {r.description && (
                            <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                              {r.description}
                            </div>
                          )}
                        </div>
                        <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageTemplate>
  );
};


