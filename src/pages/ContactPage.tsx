import React from "react";
import { PageTemplate } from "@/components/PageTemplate";
import { Mail, Building2, Clock } from "lucide-react";

export const ContactPage: React.FC = () => {
  return (
    <PageTemplate title="Contact NTCA" subtitle="Simple support, fast response." showComingSoon={false}>
      <div className="section">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="card p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="heading-3 mb-1">Support email</h2>
                    <a
                      href="mailto:support@nt-ca.com"
                      className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
                    >
                      support@nt-ca.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="heading-3 mb-1">For schools</h2>
                    <a
                      href="mailto:contact@nt-ca.com"
                      className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
                    >
                      contact@nt-ca.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="heading-3 mb-1">Response time</h2>
                    <p className="text-neutral-700 dark:text-neutral-300">
                      We aim to respond within 24 hours.
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Operated from the United Kingdom.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};
