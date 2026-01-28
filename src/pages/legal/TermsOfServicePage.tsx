import React from "react";
import { PageTemplate } from "@/components/PageTemplate";
import { TermsContent } from "@/components/legal/TermsContent";

export const TermsOfServicePage: React.FC = () => {
  return (
    <PageTemplate
      title="Terms of Service"
      showComingSoon={false}
    >
      <div className="section">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="card p-6 md:p-8">
              <TermsContent />
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};
