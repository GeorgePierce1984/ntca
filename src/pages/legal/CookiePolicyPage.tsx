import React from "react";
import { PageTemplate } from "@/components/PageTemplate";

export const CookiePolicyPage: React.FC = () => {
  return (
    <PageTemplate
      title="Cookie Policy"
      subtitle="How we use cookies and how you can control them"
      showComingSoon={false}
    >
      <div className="section">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="card p-6 md:p-8">
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <h2>4. COOKIE POLICY &amp; CONSENT BANNER TEXT</h2>

                <h3>4.1 Cookies Used</h3>
                <ul>
                  <li>Strictly necessary cookies</li>
                  <li>Analytics cookies</li>
                  <li>Marketing cookies</li>
                </ul>

                <h3>4.2 Consent Banner Wording</h3>
                <blockquote>
                  “We use cookies to improve your experience. You can accept all
                  cookies, reject non-essential cookies, or customise your
                  preferences. For more information, see our Cookie Policy.”
                </blockquote>
                <p>
                  Buttons: <strong>[Accept All]</strong>{" "}
                  <strong>[Reject Non-Essential]</strong>{" "}
                  <strong>[Manage Preferences]</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};
